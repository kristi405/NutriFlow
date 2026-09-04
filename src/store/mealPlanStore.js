import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

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
    this.items.push({ id: makeId(), ...input });
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }

  removeItemsForDate(date) {
    this.items = this.items.filter(item => item.date !== date);
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

  itemsForDate(date) {
    return this.items.filter(item => item.date === date);
  }
}

export const mealPlanStore = new MealPlanStore();
