import { makeAutoObservable, runInAction } from 'mobx';
import { ENTITLEMENT_ID, getApiKey, getPurchases, isPurchasesConfigured } from '@/lib/purchases';

class SubscriptionStore {
  isPremium = false;
  // The active entitlement's product id (e.g. "monthly") — used to tell which
  // plan tier is active, since RevenueCat's entitlement info doesn't carry the
  // package type directly.
  activeProductId = null;
  packages = [];
  isLoading = false;
  isPurchasing = false;
  isConfigured = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAvailable() {
    return isPurchasesConfigured() && getPurchases() !== null;
  }

  // Paid features are only locked once RevenueCat is actually set up; until then
  // (placeholder key / no native module) everything stays open so the app remains usable.
  get hasAccess() {
    return !this.isAvailable || this.isPremium;
  }

  // 'weekly' | 'monthly' | 'yearly' | null (no active plan). Matched against the
  // loaded offering's packages first (authoritative — handles the "lifetime"
  // product that's actually the weekly plan); falls back to guessing from the
  // product id itself if offerings haven't loaded yet.
  get planType() {
    if (!this.activeProductId) return null;
    const pkg = this.packages.find(candidate => candidate.product.identifier === this.activeProductId);
    if (pkg?.packageType === 'ANNUAL') return 'yearly';
    if (pkg?.packageType === 'MONTHLY') return 'monthly';
    if (pkg?.packageType === 'WEEKLY' || pkg?.packageType === 'LIFETIME') return 'weekly';
    const id = this.activeProductId.toLowerCase();
    if (id.includes('year')) return 'yearly';
    if (id.includes('month')) return 'monthly';
    return 'weekly';
  }

  applyCustomerInfo(info) {
    const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID];
    this.isPremium = Boolean(entitlement);
    this.activeProductId = entitlement?.productIdentifier ?? null;
  }

  // Called once the user is signed in; ties purchases to the backend user id so
  // the subscription follows the account across devices.
  async init(userId) {
    if (!this.isAvailable) return;
    const purchases = getPurchases();
    try {
      if (!this.isConfigured) {
        purchases.configure({ apiKey: getApiKey(), appUserID: String(userId) });
        purchases.addCustomerInfoUpdateListener(info => runInAction(() => this.applyCustomerInfo(info)));
        runInAction(() => {
          this.isConfigured = true;
        });
      } else {
        const { customerInfo } = await purchases.logIn(String(userId));
        runInAction(() => this.applyCustomerInfo(customerInfo));
      }
      const info = await purchases.getCustomerInfo();
      runInAction(() => this.applyCustomerInfo(info));
      await this.loadOfferings();
    } catch {
      // Non-fatal: the paywall shows its own error/retry state.
    }
  }

  async logOut() {
    this.isPremium = false;
    this.activeProductId = null;
    this.packages = [];
    if (!this.isAvailable || !this.isConfigured) return;
    try {
      await getPurchases().logOut();
    } catch {
      // Already anonymous — nothing to do.
    }
  }

  async loadOfferings() {
    if (!this.isAvailable || !this.isConfigured) return;
    this.isLoading = true;
    try {
      const offerings = await getPurchases().getOfferings();
      runInAction(() => {
        this.packages = offerings.current?.availablePackages ?? [];
      });
    } catch {
      runInAction(() => {
        this.packages = [];
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Resolves to 'purchased' | 'cancelled'; any other failure is thrown.
  async purchase(pkg) {
    this.isPurchasing = true;
    try {
      const { customerInfo } = await getPurchases().purchasePackage(pkg);
      runInAction(() => this.applyCustomerInfo(customerInfo));
      return this.isPremium ? 'purchased' : 'cancelled';
    } catch (error) {
      if (error?.userCancelled) return 'cancelled';
      throw error;
    } finally {
      runInAction(() => {
        this.isPurchasing = false;
      });
    }
  }

  // Resolves to true when the restore unlocked Premium.
  async restore() {
    this.isPurchasing = true;
    try {
      const customerInfo = await getPurchases().restorePurchases();
      runInAction(() => this.applyCustomerInfo(customerInfo));
      return this.isPremium;
    } finally {
      runInAction(() => {
        this.isPurchasing = false;
      });
    }
  }
}

export const subscriptionStore = new SubscriptionStore();
