import { makeAutoObservable } from 'mobx';
import { addDays, toDateKey, todayKey } from '@/lib/date';
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

  /**
   * Restores weight history the server kept (it logs every change of the
   * profile weight: `[{ value, ctime }]`, see peopleSync.js) — the local log
   * lives in AsyncStorage only and is gone after a reinstall or cleared data.
   * One point per day (the day's last change); days already in the local log
   * are left as they are.
   */
  mergeServerHistory(personId, points) {
    if (!Array.isArray(points) || points.length === 0) return;
    const latestByDate = new Map();
    for (const point of points) {
      const weightKg = Number(point?.value);
      const time = new Date(point?.ctime);
      if (!(weightKg > 0) || Number.isNaN(time.getTime())) continue;
      const date = toDateKey(time);
      const previous = latestByDate.get(date);
      if (!previous || time >= previous.time) latestByDate.set(date, { time, weightKg });
    }
    const localDates = new Set(this.entries.filter(entry => belongsTo(entry, personId)).map(entry => entry.date));
    const restored = [...latestByDate].filter(([date]) => !localDates.has(date)).map(([date, { weightKg }]) => ({ date, weightKg: Math.round(weightKg * 10) / 10, ...(personId ? { personId } : {}) }));
    if (restored.length > 0) this.entries = [...this.entries, ...restored];
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

  // Called on account deletion, so this account's weight log doesn't linger
  // in memory for whoever signs in next in the same app session.
  reset() {
    this.entries = [];
  }
}

export const weightLogStore = new WeightLogStore();
