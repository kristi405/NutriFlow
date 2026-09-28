import { makeAutoObservable, runInAction } from 'mobx';
import { ENTITLEMENT_ID, getApiKey, getPurchases, isPurchasesConfigured } from '@/lib/purchases';

class SubscriptionStore {
  isPremium = false;
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

  applyCustomerInfo(info) {
    this.isPremium = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
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
