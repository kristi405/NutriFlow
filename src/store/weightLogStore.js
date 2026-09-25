import { makeAutoObservable } from 'mobx';
import { addDays, todayKey } from '@/lib/date';
import { belongsTo, peopleStore, personTag } from './peopleStore';
import { persistStore } from './persist';

class WeightLogStore {
  entries = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.weightLog.v2', ['entries']);
  }

  /** Keeps today's entry in sync with the live profile weight, so history is built from real weight changes only. */
  syncToday(currentWeightKg) {
    if (currentWeightKg === undefined) return;
    const today = todayKey();
    const rounded = Math.round(currentWeightKg * 10) / 10;
    const personId = peopleStore.currentPersonId;
    const todayEntry = this.entries.find(entry => entry.date === today && belongsTo(entry, personId));
    if (!todayEntry) {
      this.entries = [...this.entries, { date: today, weightKg: rounded, ...personTag() }];
    } else if (todayEntry.weightKg !== rounded) {
      this.entries = this.entries.map(entry => entry === todayEntry ? { ...entry, weightKg: rounded } : entry);
    }
  }

  get sortedEntries() {
    const personId = peopleStore.currentPersonId;
    return this.entries.filter(entry => belongsTo(entry, personId)).sort((a, b) => a.date.localeCompare(b.date));
  }

  removePersonData(personId) {
    this.entries = this.entries.filter(entry => !belongsTo(entry, personId));
  }

  entriesSince(startDateKey) {
    return this.sortedEntries.filter(entry => entry.date >= startDateKey);
  }
}

export const weightLogStore = new WeightLogStore();
