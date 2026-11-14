import { runInAction } from 'mobx';
import { ApiError, apiRequest, apiUpload } from '@/lib/api';
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { favoritesStore } from '@/store/favoritesStore';
import { foodLogStore } from '@/store/foodLogStore';
import { localeStore } from '@/store/localeStore';
import { mealPlanStore } from '@/store/mealPlanStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { recentlyViewedStore } from '@/store/recentlyViewedStore';

/**
 * The user's own ingredients and recipes — server-backed CRUD over
 * /api/v1/app/ingredients and /api/v1/app/recipes (see NUTRIFLOW_BACKEND
 * API.md, «Пользовательские ингредиенты и рецепты»).
 *
 * Every successful write puts the server's response straight into the local
 * catalog cache (upsert by id; delete removes it), so screens update at once
 * without waiting for the next /sync — which will return the same rows again.
 * Nutrition (КБЖУ) of a recipe is computed by the server.
 *
 * All functions throw ApiError on failure: status 0 = offline, 400 =
 * validation (English `message`), 404 = gone / not ours, 409 with
 * code INGREDIENT_IN_USE on deleting an ingredient used in a recipe
 * (`error.data.recipeIds`).
 */

// Units an ingredient can be measured in. g/kg/ml/l always convert to grams;
// the rest need the weight of one unit in `grams_per_unit`.
export const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp', 'cup', 'slice', 'clove'];
export const WEIGHT_UNITS = ['g', 'kg', 'ml', 'l'];

export function isWeightUnit(unit) {
  return WEIGHT_UNITS.includes(unit);
}

/** Units a recipe line may use for this ingredient: g/kg/ml/l plus its grams_per_unit keys. */
export function unitsForIngredient(ingredient) {
  const extra = Object.keys(ingredient?.gramsPerUnit ?? {}).filter(unit => !WEIGHT_UNITS.includes(unit));
  return [...WEIGHT_UNITS, ...extra];
}

// Nutrient fields (per 100 g / 100 ml) the ingredient form edits — the
// server accepts the full catalog set, everything not sent is stored as 0.
export const BASIC_NUTRIENTS = ['calories', 'protein', 'fat', 'carbs'];
export const EXTRA_NUTRIENTS = ['fiber', 'sugar', 'saturated_fat', 'cholesterol', 'sodium'];

function requireToken() {
  if (!authStore.token) throw new ApiError('Not signed in', 401);
  return authStore.token;
}

function lang() {
  return localeStore.language;
}

/** Uploads a local photo (file:// uri) and returns the bare filename for `image_url`. */
export async function uploadImage(fileUri) {
  const { filename } = await apiUpload('/app/files', { fileUri, fileName: 'photo.jpg', mimeType: 'image/jpeg', token: requireToken() });
  return filename;
}

// ---- Ingredients ----

/**
 * `form`: { name, description?, defaultUnit, gramsPerUnit?: {unit: grams},
 *           nutrients: { calories, protein, ... }, tagIds?, imageFilename? }
 */
function ingredientBody(form) {
  const body = {
    languageCode: lang(),
    name: form.name.trim(),
    default_unit: form.defaultUnit || 'g'
  };
  if (form.description !== undefined) body.description = form.description;
  if (form.gramsPerUnit && Object.keys(form.gramsPerUnit).length) body.grams_per_unit = form.gramsPerUnit;
  for (const [key, value] of Object.entries(form.nutrients ?? {})) {
    if (value !== undefined && value !== null && value !== '') body[key] = Number(value);
  }
  if (form.tagIds) body.tagIds = form.tagIds;
  if (form.imageFilename !== undefined) body.image_url = form.imageFilename;
  return body;
}

export async function createIngredient(form) {
  const raw = await apiRequest(`/app/ingredients?lang=${lang()}`, { method: 'POST', token: requireToken(), body: ingredientBody(form) });
  runInAction(() => catalogStore.upsertIngredient(raw));
  return raw;
}

export async function updateIngredient(id, form) {
  const raw = await apiRequest(`/app/ingredients/${id}?lang=${lang()}`, { method: 'PUT', token: requireToken(), body: ingredientBody(form) });
  runInAction(() => catalogStore.upsertIngredient(raw));
  // Recipes using it get new КБЖУ server-side — pull them in now rather than
  // waiting for the next app launch.
  catalogStore.sync(authStore.token, lang());
  return raw;
}

/** Throws ApiError 409 (code INGREDIENT_IN_USE, data.recipeIds) if a recipe still uses it. */
export async function deleteIngredient(id) {
  await apiRequest(`/app/ingredients/${id}`, { method: 'DELETE', token: requireToken() });
  runInAction(() => catalogStore.removeIngredient(id));
}

export function isIngredientInUseError(error) {
  return error instanceof ApiError && error.status === 409 && error.code === 'INGREDIENT_IN_USE';
}

// ---- Recipes ----

/**
 * `input`: { title, description?, cookTime?, steps?: string[], servings?,
 *            categoryTagId?, tagIds?, imageFilename?,
 *            ingredients?: [{ ingredientId, quantity, unit }] }
 * Only keys present are sent, so PUT can change a subset; `ingredients` and
 * `tagIds` replace the whole list when sent.
 */
function recipeBody(input) {
  const body = { languageCode: lang() };
  if (input.title !== undefined) body.name = input.title.trim();
  if (input.description !== undefined) body.description = input.description;
  if (input.cookTime !== undefined) body.cook_time = input.cookTime;
  if (input.steps !== undefined) body.steps = input.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  if (input.servings !== undefined) body.servings = input.servings;
  if (input.imageFilename !== undefined) body.image_url = input.imageFilename;
  if (input.tagIds !== undefined) body.tagIds = input.tagIds;
  if (input.ingredients !== undefined) {
    body.ingredients = input.ingredients.map(line => ({ ingredient_id: line.ingredientId, quantity: Number(line.quantity), unit: line.unit }));
  }
  return body;
}

export async function createRecipe(input) {
  const raw = await apiRequest(`/app/recipes?lang=${lang()}`, { method: 'POST', token: requireToken(), body: recipeBody(input) });
  runInAction(() => catalogStore.upsertRecipe(raw));
  return raw;
}

export async function updateRecipe(id, input) {
  const raw = await apiRequest(`/app/recipes/${id}?lang=${lang()}`, { method: 'PUT', token: requireToken(), body: recipeBody(input) });
  runInAction(() => catalogStore.upsertRecipe(raw));
  return raw;
}

// Clears every place that referenced a deleted recipe by id, so it doesn't
// linger as a broken reference in meal plans, the food log, favorites or
// recently viewed.
function forgetRecipeReferences(id) {
  mealPlanStore.removeItemsForRecipe(id);
  foodLogStore.removeEntriesForRecipe(id);
  recentlyViewedStore.removeRecipe(id);
  if (favoritesStore.isFavorite(id)) favoritesStore.toggleFavorite(id);
}

/** Deletes an own recipe — a server one via the API, a not-yet-migrated legacy one locally. */
export async function deleteRecipe(id) {
  const isLegacy = myRecipesStore.legacyRecipes.some(recipe => recipe.id === id);
  if (!isLegacy) await apiRequest(`/app/recipes/${id}`, { method: 'DELETE', token: requireToken() });
  runInAction(() => {
    forgetRecipeReferences(id);
    if (isLegacy) myRecipesStore.removeLegacyRecipe(id);
    else catalogStore.removeRecipe(id);
  });
}

/** Points every stored reference to a recipe at its new id (legacy → server migration). */
export function replaceRecipeReferences(oldId, newId) {
  runInAction(() => {
    for (const item of mealPlanStore.items) {
      if (item.recipeId === oldId) item.recipeId = newId;
    }
    for (const entry of foodLogStore.entries) {
      if (entry.recipeId === oldId) entry.recipeId = newId;
    }
    recentlyViewedStore.recipeIds = recentlyViewedStore.recipeIds.map(recipeId => recipeId === oldId ? newId : recipeId);
    for (const favorite of favoritesStore.favorites) {
      if (favorite.recipeId === oldId) favorite.recipeId = newId;
    }
  });
}
