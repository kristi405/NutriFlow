/**
 * Converts a recipe-ingredient quantity into grams so it can be scaled against
 * an ingredient's per-100g nutrient density (§27). `g` and `ml` are treated as
 * 1:1 (reasonable for the mostly water-based liquids in this dataset); every
 * other unit needs a `gramsPerUnit` conversion on the ingredient.
 */
// Weight/volume units convert directly (ml/l assume water-like density, as
// the server's recipe totals do); count-style units (piece, tbsp, ...) need
// the ingredient's own grams-per-unit.
const DIRECT_UNIT_GRAMS = { g: 1, ml: 1, kg: 1000, l: 1000 };

export function canMeasureIn(ingredient, unit) {
  return DIRECT_UNIT_GRAMS[unit] !== undefined || ingredient.gramsPerUnit[unit] !== undefined;
}

export function gramsForQuantity(ingredient, quantity, unit) {
  if (DIRECT_UNIT_GRAMS[unit] !== undefined) return quantity * DIRECT_UNIT_GRAMS[unit];
  const perUnit = ingredient.gramsPerUnit[unit];
  if (perUnit === undefined) {
    throw new Error(`Ingredient "${ingredient.name}" has no gram conversion for unit "${unit}"`);
  }
  return quantity * perUnit;
}
function scaleNutrition(n, factor) {
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
    fiber: n.fiber * factor,
    sugar: n.sugar * factor,
    saturatedFat: n.saturatedFat * factor,
    cholesterol: n.cholesterol * factor,
    sodium: n.sodium * factor,
    omega3: n.omega3 * factor,
    omega6: n.omega6 * factor
  };
}
function scaleVitamins(v, factor) {
  return Object.fromEntries(Object.entries(v).map(([key, value]) => [key, value * factor]));
}
function scaleMinerals(m, factor) {
  return Object.fromEntries(Object.entries(m).map(([key, value]) => [key, value * factor]));
}
export function scaleProfile(profile, factor) {
  return {
    nutrition: scaleNutrition(profile.nutrition, factor),
    vitamins: scaleVitamins(profile.vitamins, factor),
    minerals: scaleMinerals(profile.minerals, factor)
  };
}

/** Nutrient contribution of a recipe-ingredient line, scaled from its per-100g density. */
export function scaleIngredient(ingredient, quantity, unit) {
  const grams = gramsForQuantity(ingredient, quantity, unit);
  return scaleProfile(ingredient.per100g, grams / 100);
}
export function sumProfiles(profiles) {
  return profiles.reduce((total, profile) => ({
    nutrition: addNutrition(total.nutrition, profile.nutrition),
    vitamins: addRecord(total.vitamins, profile.vitamins),
    minerals: addRecord(total.minerals, profile.minerals)
  }), {
    nutrition: scaleNutrition(ZERO, 0),
    vitamins: {},
    minerals: {}
  });
}
const ZERO = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  saturatedFat: 0,
  cholesterol: 0,
  sodium: 0,
  omega3: 0,
  omega6: 0
};
function addNutrition(a, b) {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
    sugar: a.sugar + b.sugar,
    saturatedFat: a.saturatedFat + b.saturatedFat,
    cholesterol: a.cholesterol + b.cholesterol,
    sodium: a.sodium + b.sodium,
    omega3: a.omega3 + b.omega3,
    omega6: a.omega6 + b.omega6
  };
}
function addRecord(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result = {};
  for (const key of keys) result[key] = (a[key] ?? 0) + (b[key] ?? 0);
  return result;
}
