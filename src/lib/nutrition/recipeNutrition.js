import { scaleIngredient, scaleProfile, sumProfiles } from './scaling';
/**
 * Recipe nutrition, PER SERVING — ingredient quantities on a Recipe are for its
 * base `servings` count, so the sum of all ingredients is divided by that count.
 * This is the single source of truth other calculations build on (§27); it never
 * reads a cached total.
 */
export function calculateRecipeNutrition(recipe, getIngredient) {
  const lineItems = recipe.ingredients.map(line => {
    const ingredient = getIngredient(line.ingredientId);
    if (!ingredient) {
      throw new Error(`Unknown ingredient id "${line.ingredientId}" in recipe "${recipe.id}"`);
    }
    return scaleIngredient(ingredient, line.quantity, line.unit);
  });
  const total = sumProfiles(lineItems);
  return scaleProfile(total, 1 / recipe.servings);
}

/** Nutrition for eating `servings` portions of the recipe (§7's serving-size stepper). */
export function scaleForServings(perServing, servings) {
  return scaleProfile(perServing, servings);
}

/**
 * Recomputes per-serving nutrition with one ingredient swapped for a substitute
 * at the same quantity/unit (§8). Recalculates from ingredients rather than
 * patching the cached total, keeping the result deterministic.
 */
export function recalculateForSubstitution(recipe, ingredientId, substituteId, getIngredient) {
  const substituted = {
    ...recipe,
    ingredients: recipe.ingredients.map(line => line.ingredientId === ingredientId ? {
      ...line,
      ingredientId: substituteId
    } : line)
  };
  return calculateRecipeNutrition(substituted, getIngredient);
}
