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

  // After a reinstall, AsyncStorage (hasOnboarded/profile included) is wiped,
  // but the backend may still hold this account's completed anketa (synced by
  // authStore.syncProfile during onboarding) — called once login resolves, so
  // a returning user isn't sent through onboarding again. A genuinely new
  // account has no anketa server-side yet, so this is a no-op for it and
  // onboarding runs as normal. See UserModel's schema for the field names.
  hydrateFromServer(user) {
    if (this.hasOnboarded || !user) return;
    const hasCompletedAnketa = Boolean(user.sex) && user.age != null && user.height_cm != null && user.weight_kg != null && Boolean(user.activity_level) && Boolean(user.goal_type);
    if (!hasCompletedAnketa) return;

    // familyMembers/mealPlan/myRecipes/history are this JSONB blob's other
    // tenants (see UserService.updateProfile) — each synced into its own
    // store already, not part of the onboarding profile's own preferences.
    const { familyMembers, mealPlan, myRecipes, history, ...preferences } = user.preferences || {}; // eslint-disable-line no-unused-vars

    this.profile = {
      name: user.name ?? '',
      sex: user.sex,
      age: Number(user.age),
      heightCm: Number(user.height_cm),
      weightKg: Number(user.weight_kg),
      targetWeightKg: user.target_weight_kg != null ? Number(user.target_weight_kg) : undefined,
      activityLevel: user.activity_level,
      photoUrl: user.photo_url ?? undefined,
      goal: {
        type: user.goal_type,
        manualCalorieTarget: user.manual_calorie_target != null ? Number(user.manual_calorie_target) : undefined,
        manualMacroSplit: user.manual_macro_split ?? undefined
      },
      preferences: {
        dietaryTags: [],
        allergies: [],
        dislikedIngredientIds: [],
        favoriteCuisines: [],
        units: 'metric',
        ...preferences
      }
    };
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
