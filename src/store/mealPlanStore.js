import { makeAutoObservable } from 'mobx';
import { calculateDailyTargets } from '@/lib/nutrition';
import { belongsTo, peopleStore } from './peopleStore';
import { persistStore } from './persist';
import { profileStore } from './profileStore';

const SERVINGS_STEP = 0.25;

function roundServings(value) {
  return Math.max(SERVINGS_STEP, Math.round(value / SERVINGS_STEP) * SERVINGS_STEP);
}

// Whose stored items make up the plan on screen: with a shared menu that's
// always the account owner's (null), otherwise the person being tracked.
function planOwnerId() {
  return peopleStore.shareMenu ? null : peopleStore.currentPersonId;
}

// How many servings of each dish a person eats relative to the owner, from
// their calorie targets. The shared plan's servings are sized for the owner.
function servingsScaleFor(personProfile) {
  const owner = profileStore.profile;
  if (!owner || !personProfile) return 1;
  const ratio = calculateDailyTargets(personProfile).calories / calculateDailyTargets(owner).calories;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class MealPlanStore {
  items = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.meal-plan', ['items']);
  }

  addItem(input) {
    const personId = planOwnerId();
    this.items.push({ id: makeId(), ...(personId ? { personId } : {}), ...input });
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }

  removeItemsForDate(date) {
    const personId = planOwnerId();
    this.items = this.items.filter(item => !(item.date === date && belongsTo(item, personId)));
  }

  updateServings(id, servings) {
    const item = this.items.find(item => item.id === id);
    if (item) item.servings = servings;
  }

  updateRecipe(id, recipeId) {
    const item = this.items.find(item => item.id === id);
    if (item) item.recipeId = recipeId;
  }

  moveItem(id, date, mealType) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.date = date;
      item.mealType = mealType;
    }
  }

  duplicateItem(id, date, mealType) {
    const source = this.items.find(item => item.id === id);
    if (!source) return;
    this.items.push({ ...source, id: makeId(), date, mealType });
  }

  // Servings are scaled for whoever is being tracked when the menu is shared.
  itemsForDate(date) {
    const items = this.items.filter(item => item.date === date && belongsTo(item, planOwnerId()));
    const member = peopleStore.activeMember;
    if (!peopleStore.shareMenu || !member) return items;
    const scale = servingsScaleFor(member.profile);
    return items.map(item => ({ ...item, servings: roundServings(item.servings * scale) }));
  }

  // Shopping covers everyone eating the shared menu, not just the person on screen.
  itemsForShopping(date) {
    if (!peopleStore.shareMenu) return this.itemsForDate(date);
    const factor = peopleStore.members.reduce((sum, member) => sum + servingsScaleFor(member.profile), 1);
    return this.items.filter(item => item.date === date && belongsTo(item, null)).map(item => ({ ...item, servings: item.servings * factor }));
  }

  itemsOfPerson(personId) {
    return this.items.filter(item => belongsTo(item, personId));
  }

  removePersonData(personId) {
    this.items = this.items.filter(item => !belongsTo(item, personId));
  }
}

export const mealPlanStore = new MealPlanStore();
