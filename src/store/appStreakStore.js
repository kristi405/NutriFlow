import { makeAutoObservable } from 'mobx';
import { addDays, todayKey } from '@/lib/date';
import { persistStore } from './persist';

// Consecutive days the app has been opened. Any missed day resets it to 1 on the next open.
class AppStreakStore {
  streak = 0;
  lastOpenedDate = null;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.app-streak', ['streak', 'lastOpenedDate']);
  }

  recordOpen() {
    const today = todayKey();
    if (this.lastOpenedDate === today) return;
    this.streak = this.lastOpenedDate === addDays(today, -1) ? this.streak + 1 : 1;
    this.lastOpenedDate = today;
  }
}

export const appStreakStore = new AppStreakStore();
