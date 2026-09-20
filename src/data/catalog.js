/**
 * Replaces src/data/seed/{recipes,ingredients,categories}.js as the app's
 * recipe/ingredient/category data source. Recipes and ingredients now come
 * from the backend via catalogStore (populated by its sync()); this module
 * just adapts that raw JSON to the same view-model shape the UI already
 * expects (see src/lib/catalogAdapter.js) and preserves the old
 * getXById-style API so call sites only needed an import swap.
 *
 * These are plain functions, not mobx `computed`s, but reading
 * catalogStore's observables inside them still gets tracked correctly as
 * long as they're called synchronously from an `observer`-wrapped
 * component's render — which is true at every call site today.
 */
import { catalogStore } from '@/store/catalogStore';
import { myRecipesStore } from '@/store/myRecipesStore';
import { adaptCategories, adaptIngredient, adaptRecipe } from '@/lib/catalogAdapter';

export function getIngredients() {
  return catalogStore.ingredients.map(adaptIngredient);
}

export function getIngredientById(id) {
  const raw = catalogStore.ingredients.find(ingredient => ingredient.id === id);
  return raw ? adaptIngredient(raw) : undefined;
}

export function getRecipes() {
  return catalogStore.recipes.map(adaptRecipe);
}

export function getRecipeById(id) {
  const raw = catalogStore.recipes.find(recipe => recipe.id === id);
  if (raw) return adaptRecipe(raw);
  return myRecipesStore.getById(id);
}

export function getCategories() {
  return adaptCategories(catalogStore.tags);
}
