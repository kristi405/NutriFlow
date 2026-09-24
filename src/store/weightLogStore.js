import { makeAutoObservable } from 'mobx';
import { addDays, todayKey } from '@/lib/date';
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
    const todayEntry = this.entries.find(entry => entry.date === today);
    if (!todayEntry) {
      this.entries = [...this.entries, { date: today, weightKg: rounded }];
    } else if (todayEntry.weightKg !== rounded) {
      this.entries = this.entries.map(entry => entry.date === today ? { ...entry, weightKg: rounded } : entry);
    }
  }

  get sortedEntries() {
    return [...this.entries].sort((a, b) => a.date.localeCompare(b.date));
  }

  entriesSince(startDateKey) {
    return this.sortedEntries.filter(entry => entry.date >= startDateKey);
  }
}

export const weightLogStore = new WeightLogStore();
