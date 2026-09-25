import { makeAutoObservable } from 'mobx';
import { peopleStore } from './peopleStore';
import { persistStore } from './persist';

class ProfileStore {
  hasOnboarded = false;
  hasHydrated = false;
  profile = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.profile', ['hasOnboarded', 'profile']);
  }

  // `profile` is the account owner's ("me"). Screens that show or edit
  // whoever is currently being tracked read `activeProfile` instead.
  get activeProfile() {
    return peopleStore.activeMember?.profile ?? this.profile;
  }

  completeOnboarding(profile) {
    this.profile = profile;
    this.hasOnboarded = true;
    peopleStore.setActive(null);
  }

  updateProfile(patch) {
    const member = peopleStore.activeMember;
    if (member) {
      peopleStore.updateMemberProfile(member.id, patch);
      return;
    }
    if (!this.profile) return;
    this.profile = { ...this.profile, ...patch };
  }

  updateGoal(goal) {
    const member = peopleStore.activeMember;
    if (member) {
      peopleStore.updateMemberProfile(member.id, { goal: { ...member.profile.goal, ...goal } });
      return;
    }
    if (!this.profile) return;
    this.profile = { ...this.profile, goal: { ...this.profile.goal, ...goal } };
  }

  resetOnboarding() {
    this.profile = null;
    this.hasOnboarded = false;
    peopleStore.setActive(null);
  }
}

export const profileStore = new ProfileStore();
