import { makeAutoObservable } from 'mobx';
import { belongsTo, peopleStore, personTag } from './peopleStore';
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
      ...personTag(),
    });
  }

  totalForDate(date) {
    return this.totalForDateOf(peopleStore.currentPersonId, date);
  }

  totalForDateOf(personId, date) {
    return this.entries.filter(entry => entry.date === date && belongsTo(entry, personId)).reduce((sum, entry) => sum + entry.amountMl, 0);
  }

  entriesOfPerson(personId) {
    return this.entries.filter(entry => belongsTo(entry, personId));
  }

  removePersonData(personId) {
    this.entries = this.entries.filter(entry => !belongsTo(entry, personId));
  }
}

export const waterStore = new WaterStore();
