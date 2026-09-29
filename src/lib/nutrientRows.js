// Shared row definitions for rendering a nutrition/vitamin/mineral table —
// used by both the recipe detail screen's "Nutrients" tab and the ingredient
// detail screen (which shows the same values per 100g/ml instead of per serving).

export const NUTRIENT_ROWS = [
  { key: 'fiber', labelKey: 'recipes.fiber', unit: 'g' },
  { key: 'sugar', labelKey: 'recipes.sugar', unit: 'g' },
  { key: 'saturatedFat', labelKey: 'recipes.saturatedFat', unit: 'g' },
  { key: 'cholesterol', labelKey: 'recipes.cholesterol', unit: 'mg' },
  { key: 'sodium', labelKey: 'recipes.sodium', unit: 'mg' },
  { key: 'omega3', labelKey: 'recipes.omega3', unit: 'g' },
  { key: 'omega6', labelKey: 'recipes.omega6', unit: 'g' }
];

export const VITAMIN_ROWS = [
  { key: 'vitaminA', labelKey: 'recipes.vitaminA', unit: 'mcg' },
  { key: 'vitaminB1', labelKey: 'recipes.vitaminB1', unit: 'mg' },
  { key: 'vitaminB2', labelKey: 'recipes.vitaminB2', unit: 'mg' },
  { key: 'vitaminB3', labelKey: 'recipes.vitaminB3', unit: 'mg' },
  { key: 'vitaminB5', labelKey: 'recipes.vitaminB5', unit: 'mg' },
  { key: 'vitaminB6', labelKey: 'recipes.vitaminB6', unit: 'mg' },
  { key: 'vitaminB7', labelKey: 'recipes.vitaminB7', unit: 'mcg' },
  { key: 'vitaminB9', labelKey: 'recipes.vitaminB9', unit: 'mcg' },
  { key: 'vitaminB12', labelKey: 'recipes.vitaminB12', unit: 'mcg' },
  { key: 'vitaminC', labelKey: 'recipes.vitaminC', unit: 'mg' },
  { key: 'vitaminD', labelKey: 'recipes.vitaminD', unit: 'mcg' },
  { key: 'vitaminE', labelKey: 'recipes.vitaminE', unit: 'mg' },
  { key: 'vitaminK', labelKey: 'recipes.vitaminK', unit: 'mcg' }
];

export const MINERAL_ROWS = [
  { key: 'calcium', labelKey: 'recipes.calcium', unit: 'mg' },
  { key: 'iron', labelKey: 'recipes.iron', unit: 'mg' },
  { key: 'magnesium', labelKey: 'recipes.magnesium', unit: 'mg' },
  { key: 'phosphorus', labelKey: 'recipes.phosphorus', unit: 'mg' },
  { key: 'potassium', labelKey: 'recipes.potassium', unit: 'mg' },
  { key: 'zinc', labelKey: 'recipes.zinc', unit: 'mg' },
  { key: 'copper', labelKey: 'recipes.copper', unit: 'mg' },
  { key: 'manganese', labelKey: 'recipes.manganese', unit: 'mg' },
  { key: 'selenium', labelKey: 'recipes.selenium', unit: 'mcg' },
  { key: 'iodine', labelKey: 'recipes.iodine', unit: 'mcg' }
];

export function formatNutrientAmount(value) {
  const amount = value ?? 0;
  if (amount === 0) return '0';
  return amount < 10 ? String(Math.round(amount * 10) / 10) : String(Math.round(amount));
}
