import { makeAutoObservable } from 'mobx';
import { belongsTo, peopleStore, personTag } from './peopleStore';
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
      ...personTag(),
      ...input,
    });
  }

  updateEntry(id, patch) {
    const entry = this.entries.find(entry => entry.id === id);
    if (entry) Object.assign(entry, patch);
  }

  removeEntry(id) {
    this.entries = this.entries.filter(entry => entry.id !== id);
  }

  entriesForDate(date) {
    return this.entriesForDateOf(peopleStore.currentPersonId, date);
  }

  entriesForDateOf(personId, date) {
    return this.entries.filter(entry => entry.date === date && belongsTo(entry, personId));
  }

  entriesOfPerson(personId) {
    return this.entries.filter(entry => belongsTo(entry, personId));
  }

  removePersonData(personId) {
    this.entries = this.entries.filter(entry => !belongsTo(entry, personId));
  }
}

export const foodLogStore = new FoodLogStore();
