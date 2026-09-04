import { getIngredientById } from '@/data/seed/ingredients';
import { getIngredientCategoryById } from '@/data/seed/ingredientCategories';
import { getRecipeById } from '@/data/seed/recipes';
import { gramsForQuantity } from '@/lib/nutrition';

/**
 * Merges every ingredient across the day's planned meals into one grams total
 * per ingredient — so an ingredient shared by two meals (e.g. eggs at both
 * breakfast and a snack) appears once, not twice. Quantities are normalized to
 * grams (the same conversion recipe nutrition already uses) since recipes mix
 * units like "tbsp" and "piece" that can't otherwise be summed together.
 */
export function buildShoppingList(planItems) {
  const gramsByIngredient = new Map();
  for (const item of planItems) {
    const recipe = getRecipeById(item.recipeId);
    if (!recipe) continue;
    const factor = item.servings / recipe.servings;
    for (const line of recipe.ingredients) {
      const ingredient = getIngredientById(line.ingredientId);
      if (!ingredient) continue;
      const grams = gramsForQuantity(ingredient, line.quantity, line.unit) * factor;
      gramsByIngredient.set(line.ingredientId, (gramsByIngredient.get(line.ingredientId) ?? 0) + grams);
    }
  }

  const items = [...gramsByIngredient.entries()].map(([ingredientId, grams]) => {
    const ingredient = getIngredientById(ingredientId);
    return {
      ingredientId,
      name: ingredient.name,
      grams: Math.round(grams),
      categoryId: ingredient.categoryId
    };
  });

  const groupsByCategory = new Map();
  for (const item of items) {
    if (!groupsByCategory.has(item.categoryId)) groupsByCategory.set(item.categoryId, []);
    groupsByCategory.get(item.categoryId).push(item);
  }

  return [...groupsByCategory.entries()].map(([categoryId, categoryItems]) => ({
    categoryId,
    categoryName: getIngredientCategoryById(categoryId)?.name ?? categoryId,
    items: categoryItems.sort((a, b) => a.name.localeCompare(b.name))
  })).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}
