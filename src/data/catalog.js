/**
 * Replaces src/data/seed/{recipes,ingredients,categories}.js as the app's
 * recipe/ingredient/category data source. Recipes and ingredients now come
 * from the backend via catalogStore (populated by its sync()); this module
 * just adapts that raw JSON to the same view-model shape the UI already
 * expects (see src/lib/catalogAdapter.js) and preserves the old
 * getXById-style API so call sites only needed an import swap.
 *
 * For a signed-in user catalogStore also holds their own ingredients/recipes
 * (user_id = me). Own *private* recipes are "My Recipes" and are listed
 * separately (myRecipesStore.recipes), so getRecipes() leaves them out to
 * avoid showing them twice; own ingredients are mixed into getIngredients()
 * (flagged isOwn) because the recipe editor picks from both.
 *
 * These are plain functions, not mobx `computed`s, but reading
 * catalogStore's observables inside them still gets tracked correctly as
 * long as they're called synchronously from an `observer`-wrapped
 * component's render — which is true at every call site today.
 */
import { authStore } from '@/store/authStore';
import { catalogStore } from '@/store/catalogStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { adaptCategories, adaptIngredient, adaptRecipe } from '@/lib/catalogAdapter';

function currentUserId() {
  return authStore.currentUser?.id ?? null;
}

// A private row can only be in the cache for the account it was synced for;
// after a logout (before the next sync replaces the cache) it must not leak
// into what a guest or another account sees.
function isVisiblePrivate(raw, userId) {
  return raw.is_public !== false || (Boolean(userId) && raw.user_id === userId);
}

export function getIngredients() {
  const userId = currentUserId();
  return catalogStore.ingredients.filter(raw => isVisiblePrivate(raw, userId)).map(raw => adaptIngredient(raw, catalogStore.tagSlugs, userId));
}

export function getIngredientById(id) {
  const raw = catalogStore.ingredients.find(ingredient => ingredient.id === id && isVisiblePrivate(ingredient, currentUserId()));
  return raw ? adaptIngredient(raw, catalogStore.tagSlugs, currentUserId()) : undefined;
}

/** The user's own ingredients — private ones and ones already published to the catalog. */
export function getMyIngredients() {
  const userId = currentUserId();
  if (!userId) return [];
  return catalogStore.ingredients.filter(raw => raw.user_id === userId).map(raw => adaptIngredient(raw, catalogStore.tagSlugs, userId));
}

export function getRecipes() {
  const userId = currentUserId();
  // Own private recipes are "My Recipes" (myRecipesStore.recipes), listed separately.
  return catalogStore.recipes.filter(raw => raw.is_public !== false).map(raw => adaptRecipe(raw, catalogStore.tagSlugs, userId));
}

export function getRecipeById(id) {
  const raw = catalogStore.recipes.find(recipe => recipe.id === id && isVisiblePrivate(recipe, currentUserId()));
  if (raw) return adaptRecipe(raw, catalogStore.tagSlugs, currentUserId());
  return myRecipesStore.getById(id);
}

export function getCategories() {
  return adaptCategories(catalogStore.tags, catalogStore.tagSlugs);
}

/** Tag id for a category slug — what POST/PUT /app/recipes expects in tagIds. */
export function getCategoryTagId(categorySlug) {
  if (!categorySlug) return undefined;
  return catalogStore.tags.find(tag => tag.type === 'category' && (catalogStore.tagSlugs[tag.id] ?? tag.name.toLowerCase()) === categorySlug)?.id;
}

/** Allergen tags (localized) — offered on the own-ingredient form. */
export function getAllergenTags() {
  return catalogStore.tags.filter(tag => tag.type === 'allergen').map(({ id, name }) => ({ id, name }));
}
