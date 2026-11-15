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
 * Performance: adapting the whole catalog is not free and getIngredientById
 * is called per recipe line from every nutrition calculation, so the adapted
 * lists and an id → item Map are built once and reused until their inputs
 * change. catalogStore always *replaces* its arrays (never mutates them in
 * place), so comparing references is enough to know when to rebuild. The
 * returned arrays/objects are shared — callers must not mutate them (copy
 * before sorting). Reusing the same objects also lets memoized list rows skip
 * re-rendering.
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
import { calculateRecipeNutrition } from '@/lib/nutrition';

function currentUserId() {
  return authStore.currentUser?.id ?? null;
}

// A private row can only be in the cache for the account it was synced for;
// after a logout (before the next sync replaces the cache) it must not leak
// into what a guest or another account sees.
function isVisiblePrivate(raw, userId) {
  return raw.is_public !== false || (Boolean(userId) && raw.user_id === userId);
}

/** Caches the last result of `build` until any argument changes (by reference). */
function memoizeLast(build) {
  let lastArgs = null;
  let lastValue;
  return (...args) => {
    if (!lastArgs || args.some((arg, index) => arg !== lastArgs[index])) {
      lastValue = build(...args);
      lastArgs = args;
    }
    return lastValue;
  };
}

function buildIndex(items) {
  return { list: items, byId: new Map(items.map(item => [item.id, item])) };
}

const ingredientIndex = memoizeLast((rows, slugs, userId) => {
  const index = buildIndex(rows.filter(raw => isVisiblePrivate(raw, userId)).map(raw => adaptIngredient(raw, slugs, userId)));
  index.mine = userId ? index.list.filter(ingredient => ingredient.isOwn) : [];
  return index;
});

const recipeIndex = memoizeLast((rows, slugs, userId) => {
  const index = buildIndex(rows.filter(raw => isVisiblePrivate(raw, userId)).map(raw => adaptRecipe(raw, slugs, userId)));
  // Own private recipes are "My Recipes" (myRecipesStore.recipes), listed separately.
  index.publicList = index.list.filter(recipe => !(recipe.isOwn && !recipe.isPublished));
  return index;
});

const categoryList = memoizeLast((tags, slugs) => adaptCategories(tags, slugs));

function ingredients() {
  return ingredientIndex(catalogStore.ingredients, catalogStore.tagSlugs, currentUserId());
}

function recipes() {
  return recipeIndex(catalogStore.recipes, catalogStore.tagSlugs, currentUserId());
}

export function getIngredients() {
  return ingredients().list;
}

export function getIngredientById(id) {
  return ingredients().byId.get(id);
}

/** The user's own ingredients — private ones and ones already published to the catalog. */
export function getMyIngredients() {
  return ingredients().mine;
}

export function getRecipes() {
  return recipes().publicList;
}

export function getRecipeById(id) {
  return recipes().byId.get(id) ?? myRecipesStore.getById(id);
}

// Per-serving calories of a recipe, cached per recipe object for as long as
// the ingredient data it was computed from stays the same — list screens ask
// for it on every render of every card.
let caloriesCache = new WeakMap();
let caloriesCacheSource = null;

export function getRecipeCalories(recipe) {
  const source = ingredients();
  if (source !== caloriesCacheSource) {
    caloriesCache = new WeakMap();
    caloriesCacheSource = source;
  }
  let calories = caloriesCache.get(recipe);
  if (calories === undefined) {
    calories = calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories;
    caloriesCache.set(recipe, calories);
  }
  return calories;
}

export function getCategories() {
  return categoryList(catalogStore.tags, catalogStore.tagSlugs);
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
