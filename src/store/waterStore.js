import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class WaterStore {
  entries = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.water', ['entries']);
  }

  addWater(date, amountMl) {
    this.entries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      amountMl,
      loggedAt: new Date().toISOString(),
    });
  }

  totalForDate(date) {
    return this.entries.filter(entry => entry.date === date).reduce((sum, entry) => sum + entry.amountMl, 0);
  }
}

export const waterStore = new WaterStore();
