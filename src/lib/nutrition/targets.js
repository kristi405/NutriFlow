export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9
};
const CALORIE_ADJUSTMENT_BY_GOAL = {
  'lose-weight': -500,
  'maintain-weight': 0,
  'gain-weight': 300,
  'build-muscle': 300,
  'eat-healthier': 0
};

/** Macro split as % of total calories. Build-muscle skews higher-protein. */
const MACRO_SPLIT_BY_GOAL = {
  'lose-weight': {
    protein: 0.35,
    carbs: 0.35,
    fat: 0.3
  },
  'maintain-weight': {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3
  },
  'gain-weight': {
    protein: 0.3,
    carbs: 0.45,
    fat: 0.25
  },
  'build-muscle': {
    protein: 0.35,
    carbs: 0.4,
    fat: 0.25
  },
  'eat-healthier': {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3
  }
};
const MIN_SAFE_CALORIES = 1200;
const LOW_CALORIE_THRESHOLD = 1500;
const LOW_CALORIE_BUMP = 50;

/** Low targets get a small +50 kcal bump (then rounded to the nearest ten) so the plan doesn't skew too lean. */
function applyLowCalorieBump(calories) {
  if (calories >= LOW_CALORIE_THRESHOLD) return calories;
  return Math.round((calories + LOW_CALORIE_BUMP) / 10) * 10;
}

/** Mifflin-St Jeor equation. */
export function calculateBMR(profile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}
export function calculateTDEE(profile) {
  return calculateBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * General adult daily-value reference used only to show "% of target" progress
 * bars (§9, §15). These are population averages, not personalized medical
 * guidance — see NUTRITION_DISCLAIMER.
 */
export const VITAMIN_DAILY_VALUES = {
  vitaminA: 900,
  vitaminB1: 1.2,
  vitaminB2: 1.3,
  vitaminB3: 16,
  vitaminB5: 5,
  vitaminB6: 1.7,
  vitaminB7: 30,
  vitaminB9: 400,
  vitaminB12: 2.4,
  vitaminC: 90,
  vitaminD: 20,
  vitaminE: 15,
  vitaminK: 120
};
export const MINERAL_DAILY_VALUES = {
  calcium: 1300,
  iron: 18,
  magnesium: 420,
  phosphorus: 1250,
  potassium: 4700,
  zinc: 11,
  copper: 0.9,
  manganese: 2.3,
  selenium: 55,
  sodium: 2300,
  iodine: 150
};

/** ~14g fiber per 1000 kcal, the common population-level guideline. */
function fiberTargetFor(calories) {
  return calories / 1000 * 14;
}

/** ~33ml per kg bodyweight, clamped to a sane 1.5-4L range. */
function waterTargetFor(weightKg) {
  return Math.min(4000, Math.max(1500, weightKg * 33));
}
export function calculateDailyTargets(profile) {
  const tdee = calculateTDEE(profile);
  const goalAdjusted = tdee + CALORIE_ADJUSTMENT_BY_GOAL[profile.goal.type];
  const calories = applyLowCalorieBump(Math.max(MIN_SAFE_CALORIES, profile.goal.manualCalorieTarget ?? Math.round(goalAdjusted)));
  const split = profile.goal.manualMacroSplit ?? MACRO_SPLIT_BY_GOAL[profile.goal.type];
  return {
    calories,
    protein: Math.round(calories * split.protein / 4),
    carbs: Math.round(calories * split.carbs / 4),
    fat: Math.round(calories * split.fat / 9),
    fiber: Math.round(fiberTargetFor(calories)),
    water: Math.round(waterTargetFor(profile.weightKg)),
    vitamins: VITAMIN_DAILY_VALUES,
    minerals: MINERAL_DAILY_VALUES
  };
}
