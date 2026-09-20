import { getCategories, getIngredientById, getRecipeById, getRecipes } from '@/data/catalog';
import { calculateRecipeNutrition } from '@/lib/nutrition';
/** Simulates real network latency so loading/skeleton states are genuine, not decorative. */
function delay(ms = 260) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function matchesFilters(recipe, filters) {
  if (!filters) return true;
  if (filters.categoryId && recipe.categoryId !== filters.categoryId) return false;
  if (filters.mealType && !recipe.mealTypes.includes(filters.mealType)) return false;
  if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const haystack = `${recipe.title} ${recipe.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.dietaryTags?.length) {
    const hasAll = filters.dietaryTags.every(tag => recipe.dietaryTags.includes(tag));
    if (!hasAll) return false;
  }
  if (filters.excludeAllergens?.length) {
    const hasExcluded = filters.excludeAllergens.some(allergen => recipe.allergens.includes(allergen));
    if (hasExcluded) return false;
  }
  if (filters.maxTotalTimeMinutes !== undefined) {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    if (totalTime > filters.maxTotalTimeMinutes) return false;
  }
  if (filters.maxCalories !== undefined || filters.minProtein !== undefined || filters.maxCarbs !== undefined || filters.maxFat !== undefined) {
    const perServing = calculateRecipeNutrition(recipe, getIngredientById).nutrition;
    if (filters.maxCalories !== undefined && perServing.calories > filters.maxCalories) return false;
    if (filters.minProtein !== undefined && perServing.protein < filters.minProtein) return false;
    if (filters.maxCarbs !== undefined && perServing.carbs > filters.maxCarbs) return false;
    if (filters.maxFat !== undefined && perServing.fat > filters.maxFat) return false;
  }
  return true;
}
export class LocalRecipeRepository {
  async listCategories() {
    await delay(150);
    return getCategories();
  }
  async listRecipes({
    page,
    pageSize,
    filters
  }) {
    await delay();
    const filtered = getRecipes().filter(recipe => matchesFilters(recipe, filters));
    const start = page * pageSize;
    const items = filtered.slice(start, start + pageSize);
    const hasMore = start + pageSize < filtered.length;
    return {
      items,
      nextPage: hasMore ? page + 1 : null,
      total: filtered.length
    };
  }
  async getRecipe(id) {
    await delay(200);
    return getRecipeById(id);
  }
  async searchRecipes(query) {
    await delay(300);
    return getRecipes().filter(recipe => matchesFilters(recipe, {
      query
    }));
  }
}
