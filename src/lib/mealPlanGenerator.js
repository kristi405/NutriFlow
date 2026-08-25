import { getIngredientById } from '@/data/seed/ingredients';
import { RECIPES } from '@/data/seed/recipes';
import { calculateRecipeNutrition } from '@/lib/nutrition';

const TOLERANCE_KCAL = 50;
const MIN_DINNER_SERVINGS = 0.5;
const MAX_DINNER_SERVINGS = 3;
const SERVINGS_STEP = 0.25;
// These categories are snack-only — never eligible for lunch/dinner.
const SNACK_ONLY_CATEGORIES = ['desserts', 'bread-baking', 'smoothies', 'drinks'];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toItems({ breakfast, lunch, dinner, dinnerServings = 1, snack }) {
  const items = [{ mealType: 'breakfast', recipeId: breakfast.id, servings: 1 }, { mealType: 'lunch', recipeId: lunch.id, servings: 1 }, { mealType: 'dinner', recipeId: dinner.id, servings: dinnerServings }];
  if (snack) items.push({ mealType: 'snack', recipeId: snack.id, servings: 1 });
  return items;
}

/**
 * Randomly picks breakfast/lunch/dinner(/snack) recipes whose combined
 * calories land within TOLERANCE_KCAL of the target. Breakfast always comes
 * from the "breakfast" category; lunch/dinner can be any category except
 * breakfast and the snack-only ones (desserts, bread & baking, smoothies,
 * drinks). When includeSnack is true (default), one recipe from those
 * snack-only categories is picked once and counted toward the calorie-fit
 * target along with the other three meals.
 *
 * The low-target "+50 kcal, rounded to the nearest ten" bump already lives in
 * calculateDailyTargets, so targetCalories here is expected to be the final
 * figure — this function doesn't re-adjust it.
 *
 * Pass 1 tries a clean 1-serving-each combo (most realistic). If the fixed
 * recipe pool can't reach the target that way (common for higher-calorie
 * targets, since the seed data caps out around ~2000 kcal for 3x1-serving
 * meals), pass 2 flexes the dinner serving size to close the gap.
 */
export function generateDailyMealPlan(targetCalories, { includeSnack = true } = {}) {
  const breakfastPool = RECIPES.filter(recipe => recipe.categoryId === 'breakfast');
  const otherPool = RECIPES.filter(recipe => recipe.categoryId !== 'breakfast' && !SNACK_ONLY_CATEGORIES.includes(recipe.categoryId));
  if (breakfastPool.length === 0 || otherPool.length < 2) return [];

  const snackPool = RECIPES.filter(recipe => SNACK_ONLY_CATEGORIES.includes(recipe.categoryId));
  const snack = includeSnack && snackPool.length > 0 ? shuffle(snackPool)[0] : undefined;

  const caloriesById = new Map();
  function caloriesFor(recipe) {
    if (!caloriesById.has(recipe.id)) {
      caloriesById.set(recipe.id, calculateRecipeNutrition(recipe, getIngredientById).nutrition.calories);
    }
    return caloriesById.get(recipe.id);
  }
  const snackCal = snack ? caloriesFor(snack) : 0;

  const breakfasts = shuffle(breakfastPool);
  const lunches = shuffle(otherPool);
  const dinners = shuffle(otherPool);

  let bestFixed = null;
  let bestFlexed = null;

  for (const breakfast of breakfasts) {
    const breakfastCal = caloriesFor(breakfast);
    for (const lunch of lunches) {
      const lunchCal = caloriesFor(lunch);
      const remainingForDinner = targetCalories - breakfastCal - lunchCal - snackCal;
      for (const dinner of dinners) {
        if (dinner.id === lunch.id) continue;
        const dinnerCal = caloriesFor(dinner);

        const fixedDiff = Math.abs(breakfastCal + lunchCal + dinnerCal + snackCal - targetCalories);
        const combo = { breakfast, lunch, dinner, snack };
        if (!bestFixed || fixedDiff < bestFixed.diff) bestFixed = { combo, diff: fixedDiff };
        if (fixedDiff <= TOLERANCE_KCAL) return toItems(combo);

        if (dinnerCal > 0) {
          const rawServings = remainingForDinner / dinnerCal;
          const clamped = Math.min(MAX_DINNER_SERVINGS, Math.max(MIN_DINNER_SERVINGS, rawServings));
          const rounded = Math.round(clamped / SERVINGS_STEP) * SERVINGS_STEP;
          const flexedDiff = Math.abs(breakfastCal + lunchCal + dinnerCal * rounded + snackCal - targetCalories);
          if (!bestFlexed || flexedDiff < bestFlexed.diff) {
            bestFlexed = { combo: { ...combo, dinnerServings: rounded }, diff: flexedDiff };
          }
          if (flexedDiff <= TOLERANCE_KCAL) return toItems({ ...combo, dinnerServings: rounded });
        }
      }
    }
  }

  const best = bestFlexed && (!bestFixed || bestFlexed.diff < bestFixed.diff) ? bestFlexed : bestFixed;
  return best ? toItems(best.combo) : [];
}
