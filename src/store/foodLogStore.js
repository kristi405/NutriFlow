import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class FoodLogStore {
  entries = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.food-log', ['entries']);
  }

  logMeal(input) {
    this.entries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      loggedAt: new Date().toISOString(),
      ...input,
    });
  }

  removeEntry(id) {
    this.entries = this.entries.filter(entry => entry.id !== id);
  }

  entriesForDate(date) {
    return this.entries.filter(entry => entry.date === date);
  }
}

export const foodLogStore = new FoodLogStore();
