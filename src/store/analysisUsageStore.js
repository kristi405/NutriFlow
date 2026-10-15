import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';
import { subscriptionStore } from './subscriptionStore';

// How many AI lab-report analyses Premium includes, and over what rolling
// window, per plan tier. Shared across the whole account (not per family
// member) — it rides on the one account-level subscription. Buying extra
// analyses beyond this isn't wired up yet (no RevenueCat product for it).
const PLAN_LIMITS = {
  weekly: { windowDays: 7, limit: 1 },
  monthly: { windowDays: 30, limit: 1 },
  yearly: { windowDays: 365, limit: 12 }
};
// Used only if a plan type can't be determined (e.g. offerings haven't loaded
// yet) — conservative, so it never over-grants.
const FALLBACK_LIMIT = { windowDays: 30, limit: 1 };
const DAY_MS = 24 * 60 * 60 * 1000;

class AnalysisUsageStore {
  // ISO timestamps of each analysis used; pruned to the current window on
  // every write, so this never grows unbounded.
  usedAt = [];
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.analysis-usage', ['usedAt']);
  }

  get limits() {
    return PLAN_LIMITS[subscriptionStore.planType] ?? FALLBACK_LIMIT;
  }

  get usesInWindow() {
    const cutoff = Date.now() - this.limits.windowDays * DAY_MS;
    return this.usedAt.filter(timestamp => new Date(timestamp).getTime() >= cutoff);
  }

  get canUseFreeAnalysis() {
    return this.usesInWindow.length < this.limits.limit;
  }

  // When the oldest use in the current window ages out and frees a slot — null
  // if there's nothing blocking right now.
  get nextAvailableAt() {
    const uses = this.usesInWindow;
    if (uses.length < this.limits.limit) return null;
    const oldest = Math.min(...uses.map(timestamp => new Date(timestamp).getTime()));
    return new Date(oldest + this.limits.windowDays * DAY_MS);
  }

  recordUse() {
    this.usedAt = [...this.usesInWindow, new Date().toISOString()];
  }
}

export const analysisUsageStore = new AnalysisUsageStore();
