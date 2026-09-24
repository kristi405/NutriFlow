import { makeAutoObservable } from 'mobx';
import { getIngredientById, getRecipeById } from '@/data/catalog';
import { addDays, todayKey } from '@/lib/date';
import { calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { foodLogStore } from './foodLogStore';
import { persistStore } from './persist';
import { waterStore } from './waterStore';

// How many filled cells each achievement needs. The UI draws one cell per unit.
export const ACHIEVEMENT_GOALS = {
  streak: 7,
  water: 5,
  protein: 7,
  firstRecipe: 1
};

function proteinForDate(date) {
  let total = 0;
  for (const entry of foodLogStore.entriesForDate(date)) {
    const recipe = getRecipeById(entry.recipeId);
    if (!recipe) continue;
    total += scaleForServings(calculateRecipeNutrition(recipe, getIngredientById), entry.servings).nutrition.protein;
  }
  return total;
}

function sameList(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

class AchievementsStore {
  // Dates (YYYY-MM-DD) on which each goal was hit — persisted, so progress
  // survives restarts and a later change of targets doesn't erase earned days.
  daysByKey = { streak: [], water: [], protein: [], firstRecipe: [] };
  // Achievement key -> ISO date it was completed. Once set, never unset.
  unlocked = {};
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.achievements', ['daysByKey', 'unlocked']);
  }

  // Filled cells for an achievement. The streak shows the *current* run (it
  // resets when broken); the others are cumulative.
  progressFor(key) {
    const goal = ACHIEVEMENT_GOALS[key];
    if (this.unlocked[key]) return goal;
    if (key === 'streak') return Math.min(this.currentStreak(), goal);
    return Math.min(this.daysByKey[key].length, goal);
  }

  currentStreak() {
    const days = new Set(this.daysByKey.streak);
    const today = todayKey();
    // Today may not be logged yet — that shouldn't zero out yesterday's streak.
    let cursor = days.has(today) ? today : addDays(today, -1);
    let streak = 0;
    while (days.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  // Re-derives which days hit each goal from the logs. Idempotent: only writes
  // when something changed, so calling it from an effect can't loop.
  sync({ waterTargetMl, proteinTarget }) {
    const loggedDates = new Set([...foodLogStore.entries.map(entry => entry.date), ...waterStore.entries.map(entry => entry.date)]);
    const streakDays = [];
    const waterDays = [];
    const proteinDays = [];
    for (const date of [...loggedDates].sort()) {
      if (foodLogStore.entriesForDate(date).length > 0) streakDays.push(date);
      if (waterTargetMl > 0 && waterStore.totalForDate(date) >= waterTargetMl) waterDays.push(date);
      if (proteinTarget > 0 && proteinForDate(date) >= proteinTarget) proteinDays.push(date);
    }
    const hasCookedRecipe = foodLogStore.entries.some(entry => getRecipeById(entry.recipeId));
    const firstRecipeDays = hasCookedRecipe ? ['done'] : [];

    // Keep previously earned days even if the current data no longer proves them.
    const merge = (previous, next) => [...new Set([...previous, ...next])].sort();
    const nextDays = {
      streak: merge(this.daysByKey.streak, streakDays),
      water: merge(this.daysByKey.water, waterDays),
      protein: merge(this.daysByKey.protein, proteinDays),
      firstRecipe: merge(this.daysByKey.firstRecipe, firstRecipeDays)
    };
    for (const key of Object.keys(nextDays)) {
      if (!sameList(nextDays[key], this.daysByKey[key])) this.daysByKey[key] = nextDays[key];
    }

    for (const key of Object.keys(ACHIEVEMENT_GOALS)) {
      if (this.unlocked[key]) continue;
      const count = key === 'streak' ? this.currentStreak() : this.daysByKey[key].length;
      if (count >= ACHIEVEMENT_GOALS[key]) this.unlocked[key] = new Date().toISOString();
    }
  }
}

export const achievementsStore = new AchievementsStore();
