import { makeAutoObservable } from 'mobx';
import { toDateKey } from '@/lib/date';
import { persistStore } from './persist';

/**
 * Intermittent fasting: the user's protocol/schedule (settings) and the log
 * of fasts. A fast is started and ended by the user (or edited afterwards);
 * the schedule — eating window start + protocol — drives the reminders
 * (lib/fastingNotifications.js) and the "what now" hints on screen.
 *
 * Both are synced to the server through userDataSync.js: every fast is a
 * `fast` record, the settings one `setting` record with id "fasting".
 * Settings only start syncing once the user changed something (updatedAt),
 * so untouched defaults on a new phone never overwrite the real ones.
 * Fasting is tracked for the account owner only (not family members).
 */

// ids double as i18n keys (fasting.protocols.<id>) — no ":", i18next's namespace separator.
export const FASTING_PROTOCOLS = [
  { id: '12-12', fastingHours: 12 },
  { id: '14-10', fastingHours: 14 },
  { id: '16-8', fastingHours: 16 },
  { id: '18-6', fastingHours: 18 },
  { id: '20-4', fastingHours: 20 },
  { id: 'omad', fastingHours: 23 }
];

// Rough, non-medical description of what a fast of this length is like —
// shown as the current "stage" on the timer. Hours are the stage start.
export const FASTING_STAGES = [
  { id: 'digesting', fromHours: 0 },
  { id: 'sugarDrop', fromHours: 4 },
  { id: 'fatBurning', fromHours: 12 },
  { id: 'deep', fromHours: 16 },
  { id: 'long', fromHours: 24 }
];

export const DEFAULT_FASTING_SETTINGS = {
  isEnabled: false,
  protocolId: '16-8',
  fastingHours: 16,
  // Eating window start, local time "HH:MM"; it lasts 24 − fastingHours.
  eatingStart: '12:00',
  notifyFastStart: true,
  notifyFastEnd: true,
  notifyGoal: true,
  acceptedDisclaimerAt: null,
  updatedAt: null
};

const HOUR_MS = 60 * 60 * 1000;

export function parseTime(text) {
  const [hours, minutes] = String(text).split(':').map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

export function formatTime({ hours, minutes }) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** "HH:MM" shifted by `deltaMinutes`, wrapping around midnight. */
export function shiftTime(text, deltaMinutes) {
  const { hours, minutes } = parseTime(text);
  const total = (((hours * 60 + minutes + deltaMinutes) % 1440) + 1440) % 1440;
  return formatTime({ hours: Math.floor(total / 60), minutes: total % 60 });
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class FastingStore {
  settings = { ...DEFAULT_FASTING_SETTINGS };
  // [{ id, startedAt, endedAt | null, targetHours, updatedAt }] — endedAt null = in progress
  fasts = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.fasting', ['settings', 'fasts']);
  }

  get isEnabled() {
    return this.settings.isEnabled;
  }

  get eatingHours() {
    return 24 - this.settings.fastingHours;
  }

  /** Eating window end, "HH:MM" — also when the next scheduled fast begins. */
  get eatingEnd() {
    return shiftTime(this.settings.eatingStart, this.eatingHours * 60);
  }

  get activeFast() {
    return this.fasts.find(fast => !fast.endedAt) ?? null;
  }

  get completedFasts() {
    return this.fasts.filter(fast => fast.endedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  /** Whether the clock is inside the scheduled eating window right now. */
  isInEatingWindow(now = new Date()) {
    const start = parseTime(this.settings.eatingStart);
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const startMinutes = start.hours * 60 + start.minutes;
    const elapsed = (minutesNow - startMinutes + 1440) % 1440;
    return elapsed < this.eatingHours * 60;
  }

  get stats() {
    const done = this.completedFasts;
    const durations = done.map(fast => (new Date(fast.endedAt) - new Date(fast.startedAt)) / HOUR_MS);
    const reachedDays = new Set(done.filter((fast, index) => durations[index] >= fast.targetHours).map(fast => toDateKey(new Date(fast.endedAt))));
    // Streak: consecutive days, ending today or yesterday, with a fast that reached its goal.
    let streak = 0;
    const day = new Date();
    if (!reachedDays.has(toDateKey(day))) day.setDate(day.getDate() - 1);
    while (reachedDays.has(toDateKey(day))) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
    return {
      count: done.length,
      streak,
      longestHours: durations.length ? Math.max(...durations) : 0,
      averageHours: durations.length ? durations.reduce((sum, hours) => sum + hours, 0) / durations.length : 0
    };
  }

  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch, updatedAt: new Date().toISOString() };
  }

  selectProtocol(protocolId) {
    const protocol = FASTING_PROTOCOLS.find(item => item.id === protocolId);
    if (protocol) this.updateSettings({ protocolId, fastingHours: protocol.fastingHours });
  }

  startFast(startedAt = new Date()) {
    if (this.activeFast) return;
    const now = new Date().toISOString();
    this.fasts = [...this.fasts, { id: newId(), startedAt: new Date(startedAt).toISOString(), endedAt: null, targetHours: this.settings.fastingHours, updatedAt: now }];
  }

  endFast(endedAt = new Date()) {
    const active = this.activeFast;
    if (!active) return;
    this.updateFast(active.id, { endedAt: new Date(endedAt).toISOString() });
  }

  /** Move the start of the running fast (forgot to press start) — never into the future. */
  shiftActiveStart(deltaMinutes) {
    const active = this.activeFast;
    if (!active) return;
    const shifted = Math.min(Date.now(), new Date(active.startedAt).getTime() + deltaMinutes * 60000);
    this.updateFast(active.id, { startedAt: new Date(shifted).toISOString() });
  }

  updateFast(id, patch) {
    this.fasts = this.fasts.map(fast => fast.id === id ? { ...fast, ...patch, updatedAt: new Date().toISOString() } : fast);
  }

  removeFast(id) {
    this.fasts = this.fasts.filter(fast => fast.id !== id);
  }

  // Account deletion.
  reset() {
    this.settings = { ...DEFAULT_FASTING_SETTINGS };
    this.fasts = [];
  }
}

export const fastingStore = new FastingStore();
