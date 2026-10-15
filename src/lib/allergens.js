import { getIngredientById } from '@/data/catalog';

// Profile allergen tags (the same slugs ingredients and recipes use) mapped to
// their translation keys under onboarding.preferences.*
export const ALLERGEN_LABEL_KEYS = {
  gluten: 'gluten',
  dairy: 'dairy',
  egg: 'egg',
  fish: 'fish',
  shellfish: 'shellfish',
  'tree nuts': 'treeNuts',
  peanuts: 'peanuts',
  soy: 'soy',
  sesame: 'sesame'
};

// A recipe's allergens are its own tags plus the allergens of every ingredient
// it uses — user-made recipes have no tags of their own, so the ingredients
// are what actually tells us about them.
export function getRecipeAllergens(recipe, getIngredient = getIngredientById) {
  const allergens = new Set(recipe.allergens ?? []);
  for (const line of recipe.ingredients ?? []) {
    const ingredient = getIngredient(line.ingredientId);
    (ingredient?.allergens ?? []).forEach(allergen => allergens.add(allergen));
  }
  return [...allergens];
}

// Returns the user's allergens that this recipe contains (empty when safe).
export function findAllergenConflicts(recipe, userAllergies = [], getIngredient = getIngredientById) {
  if (userAllergies.length === 0) return [];
  const recipeAllergens = getRecipeAllergens(recipe, getIngredient);
  return userAllergies.filter(allergen => recipeAllergens.includes(allergen));
}
