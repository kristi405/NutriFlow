import { useMemo } from 'react';
import { getIngredientById } from '@/data/seed/ingredients';
import { getRecipeById } from '@/data/seed/recipes';
import { calculateRecipeNutrition, scaleForServings, sumProfiles } from '@/lib/nutrition';
import { ZERO_MINERALS, ZERO_NUTRITION, ZERO_VITAMINS } from '@/models/nutrition';
import { foodLogStore } from '@/store/foodLogStore';
const EMPTY_PROFILE = {
  nutrition: ZERO_NUTRITION,
  vitamins: ZERO_VITAMINS,
  minerals: ZERO_MINERALS
};

/**
 * Aggregates a day's logged meals into total nutrition, re-deriving from each
 * recipe's ingredients (never a cached total) so the totals stay correct even if
 * a recipe's ingredient list changes later.
 */
export function useDailyNutrition(date) {
  const entries = foodLogStore.entriesForDate(date);
  return useMemo(() => {
    const meals = [];
    // Quick-logged snacks (§ add-snack) carry a manual calorie amount instead of a
    // recipeId, so they count toward the daily total without showing up as a "meal".
    const manualProfiles = [];
    for (const entry of entries) {
      const recipe = getRecipeById(entry.recipeId);
      if (recipe) {
        const perServing = calculateRecipeNutrition(recipe, getIngredientById);
        meals.push({
          id: entry.id,
          recipeId: entry.recipeId,
          mealType: entry.mealType,
          recipeTitle: recipe.title,
          recipeImageUrl: recipe.imageUrl,
          servings: entry.servings,
          profile: scaleForServings(perServing, entry.servings)
        });
      } else if (entry.manualCalories !== undefined) {
        manualProfiles.push({
          nutrition: { ...ZERO_NUTRITION, calories: entry.manualCalories },
          vitamins: {},
          minerals: {}
        });
      }
    }
    const allProfiles = [...meals.map(meal => meal.profile), ...manualProfiles];
    const total = allProfiles.length ? sumProfiles(allProfiles) : EMPTY_PROFILE;
    return {
      meals,
      total
    };
  }, [entries]);
}
