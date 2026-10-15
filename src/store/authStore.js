import { makeAutoObservable, runInAction } from 'mobx';
import { apiRequest, setUnauthorizedHandler } from '@/lib/api';
import { persistStore } from './persist';

class AuthStore {
  currentUser = null;
  token = null;
  // Set once the user explicitly signs out — lets _layout.js's SKIP_AUTH_FOR_TESTING
  // bypass be overridden so logout actually lands on the login screen during dev.
  hasLoggedOut = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.auth', ['token', 'currentUser']);
    // Sessions never expire server-side, but a token can still be killed
    // early (revoked from another device, account blocked) — any 401 from an
    // authed request means the persisted session is dead, so drop it locally
    // too instead of leaving the app stuck silently failing every request.
    setUnauthorizedHandler(() => this.logout());
  }

  get isAuthenticated() {
    return this.currentUser !== null;
  }

  // Pushes the local (camelCase) onboarding profile to the backend user record.
  // Silently does nothing without a real session — the SKIP_AUTH_FOR_TESTING guest
  // path has no backend account to sync to. `familyMembers` is only sent when
  // given: the server keeps its stored members when the key is absent.
  // Resolves to whether the server accepted it.
  async syncProfile(profile, familyMembers) {
    if (!this.token) return false;
    const body = {
      name: profile.name,
      sex: profile.sex,
      age: profile.age,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      target_weight_kg: profile.targetWeightKg,
      activity_level: profile.activityLevel,
      goal_type: profile.goal?.type,
      manual_calorie_target: profile.goal?.manualCalorieTarget,
      manual_macro_split: profile.goal?.manualMacroSplit,
      preferences: familyMembers ? { ...profile.preferences, familyMembers } : profile.preferences
    };
    try {
      const updated = await apiRequest('/app/users/me', { method: 'PUT', token: this.token, body });
      runInAction(() => {
        this.currentUser = updated;
      });
      return true;
    } catch {
      // Best-effort — the onboarding flow already moved on locally; the next
      // successful sync (or a future explicit retry) will catch this up.
      return false;
    }
  }

  async loginWithGoogle(idToken) {
    let data;
    try {
      data = await apiRequest('/auth/google', { method: 'POST', body: { idToken } });
    } catch (error) {
      throw new Error(error.message);
    }
    runInAction(() => {
      this.token = data.session.token;
      this.currentUser = data.user;
      this.hasLoggedOut = false;
    });
  }

  async loginWithApple({ identityToken, email, fullName }) {
    let data;
    try {
      data = await apiRequest('/auth/apple', { method: 'POST', body: {
        identityToken,
        email: email ?? undefined,
        fullName: fullName ? { givenName: fullName.givenName ?? undefined, familyName: fullName.familyName ?? undefined } : undefined
      } });
    } catch (error) {
      throw new Error(error.message);
    }
    runInAction(() => {
      this.token = data.session.token;
      this.currentUser = data.user;
      this.hasLoggedOut = false;
    });
  }

  async logout() {
    const token = this.token;
    this.currentUser = null;
    this.token = null;
    this.hasLoggedOut = true;

    if (!token) return;
    // Best-effort: revoke the session server-side so the token can't be reused.
    // The user is logged out locally either way, even if this fails (e.g. offline).
    try {
      await apiRequest('/auth/sessions/revoke', { method: 'POST', token, body: { token } });
    } catch {
      // ignore — local state is already cleared above
    }
  }
}

export const authStore = new AuthStore();
