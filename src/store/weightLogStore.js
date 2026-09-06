import { makeAutoObservable } from 'mobx';
import { addDays, todayKey } from '@/lib/date';
import { persistStore } from './persist';

const HISTORY_WEEKS = 60; // ~14 months of weekly check-ins, enough to cover 6mo/1yr/all-time ranges

/** Synthesizes a plausible weekly weight history ending at the user's current weight,
 *  trending from an earlier weight consistent with their goal direction. There is no
 *  real weight-logging feature yet, so this gives the progress chart something to plot. */
function seedEntries(currentWeightKg, goalType) {
  const direction = goalType === 'gain-weight' ? -1 : 1;
  const totalChangeKg = currentWeightKg * 0.08;
  const startWeightKg = currentWeightKg + direction * totalChangeKg;
  const today = todayKey();
  const entries = [];
  for (let weeksAgo = HISTORY_WEEKS; weeksAgo >= 0; weeksAgo -= 1) {
    const progress = (HISTORY_WEEKS - weeksAgo) / HISTORY_WEEKS;
    const eased = Math.sin(progress * Math.PI / 2);
    const noise = Math.sin(weeksAgo * 1.9) * 0.3;
    const weightKg = startWeightKg + (currentWeightKg - startWeightKg) * eased + noise;
    entries.push({
      date: addDays(today, -weeksAgo * 7),
      weightKg: Math.round(weightKg * 10) / 10
    });
  }
  entries[entries.length - 1] = { date: today, weightKg: Math.round(currentWeightKg * 10) / 10 };
  return entries;
}

class WeightLogStore {
  entries = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.weightLog', ['entries']);
  }

  /** Seeds history on first use, then keeps today's entry in sync with the live profile weight. */
  ensureSeeded(currentWeightKg, goalType) {
    if (currentWeightKg === undefined) return;
    if (this.entries.length === 0) {
      this.entries = seedEntries(currentWeightKg, goalType);
      return;
    }
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
