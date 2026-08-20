const WEIGHTS = {
  calories: 15,
  protein: 15,
  fiber: 10,
  micronutrients: 20,
  saturatedFat: 10,
  sugar: 10,
  sodium: 10,
  hydration: 10
};
const FACTOR_LABELS = {
  calories: 'calorie intake',
  protein: 'protein intake',
  fiber: 'fiber intake',
  micronutrients: 'vitamin and mineral intake',
  saturatedFat: 'saturated fat intake',
  sugar: 'sugar intake',
  sodium: 'sodium intake',
  hydration: 'hydration'
};
function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

/** 100 near the target, tapering off as intake over/undershoots by more than ~10%. */
function proximityScore(actual, target) {
  if (target <= 0) return 100;
  const deviationPct = Math.abs(actual - target) / target;
  return clamp(100 - (deviationPct - 0.1) * 200);
}
function capScore(actual, target) {
  if (target <= 0) return 100;
  return clamp(actual / target * 100);
}

/** 100 while under the ceiling, decreasing to 0 at 2x the ceiling. */
function ceilingScore(actual, ceiling) {
  if (actual <= ceiling) return 100;
  return clamp(100 - (actual - ceiling) / ceiling * 100);
}
export function calculateNutritionScore({
  intake,
  targets,
  waterMl
}) {
  const {
    nutrition,
    vitamins,
    minerals
  } = intake;
  const microValues = [...Object.entries(vitamins), ...Object.entries(minerals)];
  const microTargets = {
    ...targets.vitamins,
    ...targets.minerals
  };
  const microScore = microValues.length === 0 ? 100 : microValues.reduce((sum, [key, value]) => sum + capScore(value, microTargets[key] ?? 0), 0) / microValues.length;
  const saturatedFatCeiling = targets.calories * 0.1 / 9; // <=10% of calories from saturated fat
  const sugarCeiling = targets.calories * 0.1 / 4; // sugar used as a proxy for "added sugar"

  const breakdown = {
    calories: proximityScore(nutrition.calories, targets.calories),
    protein: capScore(nutrition.protein, targets.protein),
    fiber: capScore(nutrition.fiber, targets.fiber),
    micronutrients: microScore,
    saturatedFat: ceilingScore(nutrition.saturatedFat, saturatedFatCeiling),
    sugar: ceilingScore(nutrition.sugar, sugarCeiling),
    sodium: ceilingScore(nutrition.sodium, MINERAL_SODIUM_CEILING),
    hydration: capScore(waterMl, targets.water)
  };
  const score = Math.round(Object.keys(WEIGHTS).reduce((sum, factor) => sum + breakdown[factor] * WEIGHTS[factor], 0) / 100);
  return {
    score: clamp(score),
    explanation: buildExplanation(breakdown),
    breakdown
  };
}
const MINERAL_SODIUM_CEILING = 2300;
function buildExplanation(breakdown) {
  const entries = Object.entries(breakdown);
  const best = entries.reduce((a, b) => b[1] > a[1] ? b : a);
  const worst = entries.reduce((a, b) => b[1] < a[1] ? b : a);
  const praise = best[1] >= 85 ? `Great ${FACTOR_LABELS[best[0]]} today.` : '';
  const improvement = worst[1] < 70 ? `Your ${FACTOR_LABELS[worst[0]]} is below where you'd want it.` : "You're well balanced today.";
  return [praise, improvement].filter(Boolean).join(' ');
}
export const NUTRITION_DISCLAIMER = 'This score is informational and does not constitute medical advice. Consult a healthcare professional for personalized guidance.';
