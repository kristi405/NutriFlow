import { makeAutoObservable } from 'mobx';
import { getIngredientById, getRecipeById } from '@/data/catalog';
import { addDays, todayKey } from '@/lib/date';
import { calculateRecipeNutrition, scaleForServings } from '@/lib/nutrition';
import { foodLogStore } from './foodLogStore';
import { peopleStore } from './peopleStore';
import { persistStore } from './persist';
import { waterStore } from './waterStore';

// How many filled cells each achievement needs. The UI draws one cell per unit.
export const ACHIEVEMENT_GOALS = {
  streak: 7,
  water: 5,
  protein: 7,
  firstRecipe: 1
};

// Object keys must be strings — the account owner (personId === null) lives under "me".
function keyFor(personId) {
  return personId ?? 'me';
}

function emptyPersonData() {
  return {
    daysByKey: { streak: [], water: [], protein: [], firstRecipe: [] },
    unlocked: {}
  };
}

function streakFromDays(days) {
  const set = new Set(days);
  const today = todayKey();
  // Today may not be logged yet — that shouldn't zero out yesterday's streak.
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function proteinForDate(personId, date) {
  let total = 0;
  for (const entry of foodLogStore.entriesForDateOf(personId, date)) {
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
  // Progress is per person (each family member earns achievements on their own
  // logs, not the owner's) — keyed by keyFor(personId). Persisted, so progress
  // survives restarts and a later change of targets doesn't erase earned days.
  byPerson = {};
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.achievements', ['byPerson']);
  }

  dataFor(personId) {
    return this.byPerson[keyFor(personId)] ?? emptyPersonData();
  }

  get current() {
    return this.dataFor(peopleStore.currentPersonId);
  }

  get unlocked() {
    return this.current.unlocked;
  }

  // Filled cells for an achievement, for the currently active person. The
  // streak shows the *current* run (it resets when broken); the others are
  // cumulative.
  progressFor(key) {
    const data = this.current;
    const goal = ACHIEVEMENT_GOALS[key];
    if (data.unlocked[key]) return goal;
    if (key === 'streak') return Math.min(this.currentStreak(), goal);
    return Math.min(data.daysByKey[key].length, goal);
  }

  currentStreak() {
    return streakFromDays(this.current.daysByKey.streak);
  }

  // Re-derives which days hit each goal from the logs, for whichever person is
  // currently active. Idempotent: only writes when something changed, so
  // calling it from an effect can't loop.
  sync({ waterTargetMl, proteinTarget }) {
    const personId = peopleStore.currentPersonId;
    const key = keyFor(personId);
    const data = this.dataFor(personId);

    const loggedDates = new Set([...foodLogStore.entriesOfPerson(personId).map(entry => entry.date), ...waterStore.entriesOfPerson(personId).map(entry => entry.date)]);
    const streakDays = [];
    const waterDays = [];
    const proteinDays = [];
    for (const date of [...loggedDates].sort()) {
      if (foodLogStore.entriesForDateOf(personId, date).length > 0) streakDays.push(date);
      if (waterTargetMl > 0 && waterStore.totalForDateOf(personId, date) >= waterTargetMl) waterDays.push(date);
      if (proteinTarget > 0 && proteinForDate(personId, date) >= proteinTarget) proteinDays.push(date);
    }
    const hasCookedRecipe = foodLogStore.entriesOfPerson(personId).some(entry => getRecipeById(entry.recipeId));
    const firstRecipeDays = hasCookedRecipe ? ['done'] : [];

    // Keep previously earned days even if the current data no longer proves them.
    const merge = (previous, next) => [...new Set([...previous, ...next])].sort();
    const nextDays = {
      streak: merge(data.daysByKey.streak, streakDays),
      water: merge(data.daysByKey.water, waterDays),
      protein: merge(data.daysByKey.protein, proteinDays),
      firstRecipe: merge(data.daysByKey.firstRecipe, firstRecipeDays)
    };

    const nextUnlocked = { ...data.unlocked };
    for (const goalKey of Object.keys(ACHIEVEMENT_GOALS)) {
      if (nextUnlocked[goalKey]) continue;
      const count = goalKey === 'streak' ? streakFromDays(nextDays.streak) : nextDays[goalKey].length;
      if (count >= ACHIEVEMENT_GOALS[goalKey]) nextUnlocked[goalKey] = new Date().toISOString();
    }

    const daysChanged = Object.keys(nextDays).some(goalKey => !sameList(nextDays[goalKey], data.daysByKey[goalKey]));
    const unlockedChanged = Object.keys(nextUnlocked).length !== Object.keys(data.unlocked).length;
    if (daysChanged || unlockedChanged) {
      this.byPerson = { ...this.byPerson, [key]: { daysByKey: nextDays, unlocked: nextUnlocked } };
    }
  }

  removePersonData(personId) {
    const key = keyFor(personId);
    if (!(key in this.byPerson)) return;
    const next = { ...this.byPerson };
    delete next[key];
    this.byPerson = next;
  }
}

export const achievementsStore = new AchievementsStore();
