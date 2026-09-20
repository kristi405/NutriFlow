import { useMemo } from 'react';
import { getIngredientById } from '@/data/catalog';
import { calculateRecipeNutrition, recalculateForSubstitution, scaleForServings } from '@/lib/nutrition';
/**
 * Derives per-serving and scaled nutrition for a recipe, re-deriving from ingredients
 * on every change rather than reading a cached total (§27) — so serving-size steppers
 * and ingredient substitutions (§7, §8) always reflect the current selection.
 */
export function useRecipeNutrition(recipe, servings, substitutions = {}) {
  return useMemo(() => {
    if (!recipe) return undefined;
    const effectiveRecipe = Object.keys(substitutions).length ? {
      ...recipe,
      ingredients: recipe.ingredients.map(line => substitutions[line.ingredientId] ? {
        ...line,
        ingredientId: substitutions[line.ingredientId]
      } : line)
    } : recipe;
    const perServing = calculateRecipeNutrition(effectiveRecipe, getIngredientById);
    const forServings = scaleForServings(perServing, servings);
    return {
      perServing,
      forServings
    };
  }, [recipe, servings, substitutions]);
}

/** Nutrition impact of a single ingredient swap, independent of serving size — used to preview a substitution. */
export function usePreviewSubstitution(recipe, ingredientId, substituteId) {
  return useMemo(() => {
    if (!recipe) return undefined;
    return recalculateForSubstitution(recipe, ingredientId, substituteId, getIngredientById);
  }, [recipe, ingredientId, substituteId]);
}
