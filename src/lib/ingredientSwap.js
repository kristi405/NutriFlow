import { canMeasureIn } from '@/lib/nutrition';
import { guessIngredientCategory } from '@/lib/ingredientImage';

/**
 * Which ingredients can replace each other in a recipe.
 *
 * An ingredient's swap group comes from its `food_group` tag (set in the admin
 * panel for catalog ingredients, or picked by the user as "Category" on their
 * own ingredient). Ingredients without one fall back to a guess from the name
 * (guessIngredientCategory), as before categories existed.
 * Meat and fish share one "protein" group — either is a reasonable swap for
 * the other; every other group only swaps within itself.
 */

// food_group tag slug (English name, see catalogStore.tagSlugs) → swap group
const FOOD_GROUP_SWAP = {
  meat: 'protein',
  fish: 'protein',
  vegetables: 'vegetables',
  'side dish': 'sides',
  fruits: 'fruits',
  berries: 'fruits'
};

// name-guess bucket (lib/ingredientImage.js) → swap group; other buckets aren't swappable
const GUESS_SWAP = {
  poultry: 'protein',
  redMeat: 'protein',
  seafood: 'protein',
  vegetables: 'vegetables',
  grains: 'sides'
};

export function swapGroupOf(ingredient) {
  if (!ingredient) return null;
  for (const slug of ingredient.foodGroups ?? []) {
    if (FOOD_GROUP_SWAP[slug]) return FOOD_GROUP_SWAP[slug];
  }
  return GUESS_SWAP[guessIngredientCategory(ingredient)] ?? null;
}

export function isSwappableIngredient(ingredient) {
  return swapGroupOf(ingredient) !== null;
}

/** Ingredients that can replace `ingredient` on a recipe line measured in `unit`. */
export function swapPoolForIngredient(ingredient, unit, allIngredients) {
  const group = swapGroupOf(ingredient);
  if (!group) return [];
  return allIngredients.filter(item => item.id !== ingredient.id && swapGroupOf(item) === group && canMeasureIn(item, unit));
}
