import { runInAction } from 'mobx';
import { ApiError, apiRequest } from '@/lib/api';
import { canMeasureIn } from '@/lib/nutrition';
import { createRecipe, replaceRecipeReferences, uploadImage } from '@/lib/userContent';
import { getCategoryTagId, getIngredientById } from '@/data/catalog';
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { myRecipesStore } from '@/store/myRecipesStore';

/**
 * One-time move of recipes an older app version stored only on the device
 * (myRecipesStore.legacyRecipes, formerly also preferences.myRecipes) to the
 * server as real own recipes (POST /app/recipes).
 *
 * Runs after every successful signed-in catalog sync (see _layout.js) and is
 * a no-op once nothing is left:
 * - each migrated recipe gets a server id; meal plan, food log, favorites and
 *   recently viewed are re-pointed from the old local id to it;
 * - a recipe the server rejects (400) stays local and is retried next time;
 *   being offline stops the pass until the next sync;
 * - once everything is moved, preferences.myRecipes is cleared on the server.
 *
 * Legacy recipe lines only reference catalog ingredient ids (users couldn't
 * create ingredients before), so a line whose ingredient no longer exists in
 * the catalog — or whose unit it can't be converted from — has nothing to be
 * recreated from and is dropped (logged).
 */

let isRunning = false;
// The preferences.myRecipes cleanup costs a GET /users/me — once per app session is enough.
let hasCheckedServerPreferences = false;

function toServerLines(recipe) {
  const lines = [];
  const seen = new Set();
  for (const line of recipe.ingredients ?? []) {
    const ingredient = getIngredientById(line.ingredientId);
    if (!ingredient) {
      console.warn(`[legacyRecipeMigration] "${recipe.title}": ingredient ${line.ingredientId} no longer in the catalog — line dropped`);
      continue;
    }
    if (!canMeasureIn(ingredient, line.unit)) {
      console.warn(`[legacyRecipeMigration] "${recipe.title}": ${ingredient.name} can't be measured in "${line.unit}" — line dropped`);
      continue;
    }
    // The server allows each ingredient once per recipe.
    if (seen.has(ingredient.id)) continue;
    seen.add(ingredient.id);
    const quantity = Number(line.quantity);
    lines.push({ ingredientId: ingredient.id, quantity: quantity > 0 ? quantity : 1, unit: line.unit });
  }
  return lines;
}

async function photoFilenameFor(recipe) {
  if (recipe.imageFilename) return recipe.imageFilename;
  if (!recipe.imageUrl) return undefined;
  try {
    return await uploadImage(recipe.imageUrl);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) throw error;
    // The local file may be gone (reinstall/cleanup) — migrate without a photo.
    return undefined;
  }
}

async function migrateOne(recipe) {
  const categoryTagId = getCategoryTagId(recipe.categoryId);
  const raw = await createRecipe({
    title: recipe.title?.trim() || 'Recipe',
    servings: Math.min(100, Math.max(1, Math.round(recipe.servings || 1))),
    steps: (recipe.steps ?? []).map(step => step.instruction).filter(Boolean),
    tagIds: categoryTagId ? [categoryTagId] : [],
    imageFilename: await photoFilenameFor(recipe),
    ingredients: toServerLines(recipe)
  });
  replaceRecipeReferences(recipe.id, raw.id);
  runInAction(() => myRecipesStore.removeLegacyRecipe(recipe.id));
}

async function clearServerPreferences() {
  const me = await apiRequest('/app/users/me', { token: authStore.token });
  const preferences = me?.preferences ?? {};
  if (!Array.isArray(preferences.myRecipes) || preferences.myRecipes.length === 0) return;
  // preferences are replaced as a whole by PUT /users/me — send everything
  // back with only myRecipes emptied (history is server-managed and ignored).
  const { history, ...rest } = preferences;
  await apiRequest('/app/users/me', { method: 'PUT', token: authStore.token, body: { preferences: { ...rest, myRecipes: [] } } });
}

export async function migrateLegacyRecipes() {
  const userId = authStore.currentUser?.id;
  // Needs a signed-in catalog for this account (ingredient ids/units to map
  // against) and the hydrated local list.
  if (isRunning || !authStore.token || !userId || !myRecipesStore.hasHydrated) return;
  if (!catalogStore.lastSyncedAt || catalogStore.lastSyncWasGuest || catalogStore.syncedUserId !== userId) return;
  isRunning = true;
  try {
    for (const recipe of [...myRecipesStore.legacyRecipes]) {
      try {
        await migrateOne(recipe);
      } catch (error) {
        if (error instanceof ApiError && error.status === 0) return; // offline — next sync retries
        console.warn(`[legacyRecipeMigration] "${recipe.title}" not migrated, will retry: ${error.message}`);
      }
    }
    if (myRecipesStore.legacyRecipes.length === 0 && !hasCheckedServerPreferences) {
      try {
        await clearServerPreferences();
        hasCheckedServerPreferences = true;
      } catch (error) {
        console.warn(`[legacyRecipeMigration] couldn't clear preferences.myRecipes: ${error.message}`);
      }
    }
  } finally {
    isRunning = false;
  }
}
