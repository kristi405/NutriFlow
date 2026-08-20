import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class ProfileStore {
  hasOnboarded = false;
  hasHydrated = false;
  profile = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.profile', ['hasOnboarded', 'profile']);
  }

  completeOnboarding(profile) {
    this.profile = profile;
    this.hasOnboarded = true;
  }

  updateProfile(patch) {
    if (!this.profile) return;
    this.profile = { ...this.profile, ...patch };
  }

  updateGoal(goal) {
    if (!this.profile) return;
    this.profile = { ...this.profile, goal: { ...this.profile.goal, ...goal } };
  }

  resetOnboarding() {
    this.profile = null;
    this.hasOnboarded = false;
  }
}

export const profileStore = new ProfileStore();
