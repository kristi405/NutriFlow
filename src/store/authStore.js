import { makeAutoObservable } from 'mobx';
import i18next from '@/i18n';
import { apiRequest } from '@/lib/api';

// TEMPORARY: skips the real login/register network request during testing, so the
// app moves straight to the next screen with a fake local user. Set back to false before shipping.
const SKIP_AUTH_REQUEST_FOR_TESTING = true;

// Backend error messages are plain English strings (see AuthService.js), and the
// same message can mean different things depending on which endpoint sent it —
// e.g. "email is invalid" means "bad format" on register but "no such account" on
// login (login intentionally doesn't reveal which part was wrong).
function mapRegisterError(message) {
  switch (message) {
    case 'email is invalid':
      return i18next.t('auth.errors.invalidEmail');
    case 'password must be at least 6 characters':
      return i18next.t('auth.errors.passwordTooShort');
    case 'email is already registered':
      return i18next.t('auth.errors.emailTaken');
    default:
      return message;
  }
}

function mapLoginError(message) {
  switch (message) {
    case 'email is invalid':
    case 'password is invalid':
    case 'password is null':
      return i18next.t('auth.errors.incorrectCredentials');
    case 'user is blocked':
      return i18next.t('auth.errors.accountBlocked');
    default:
      return message;
  }
}

class AuthStore {
  currentUser = null;
  token = null;
  // Set once the user explicitly signs out — lets _layout.js's SKIP_AUTH_FOR_TESTING
  // bypass be overridden so logout actually lands on the login screen during dev.
  hasLoggedOut = false;
  // Auth state is intentionally never persisted to disk — every app launch starts
  // at the login screen. hasHydrated stays true from the start so _layout.js can
  // gate rendering on it the same way it does for the other (persisted) stores.
  hasHydrated = true;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAuthenticated() {
    return this.currentUser !== null;
  }

  async register(email, password) {
    if (SKIP_AUTH_REQUEST_FOR_TESTING) {
      this.token = 'dev-token';
      this.currentUser = { id: 'dev-user', email: email.trim() };
      this.hasLoggedOut = false;
      return;
    }
    let data;
    try {
      data = await apiRequest('/auth/register', { method: 'POST', body: { email: email.trim(), password } });
    } catch (error) {
      throw new Error(mapRegisterError(error.message));
    }
    this.token = data.session.token;
    this.currentUser = data.user;
    this.hasLoggedOut = false;
  }

  async login(email, password) {
    if (SKIP_AUTH_REQUEST_FOR_TESTING) {
      this.token = 'dev-token';
      this.currentUser = { id: 'dev-user', email: email.trim() };
      this.hasLoggedOut = false;
      return;
    }
    let data;
    try {
      data = await apiRequest('/auth/login', { method: 'POST', body: { email: email.trim(), password } });
    } catch (error) {
      throw new Error(mapLoginError(error.message));
    }
    this.token = data.session.token;
    this.currentUser = data.user;
    this.hasLoggedOut = false;
  }

  async requestPasswordReset(email) {
    await apiRequest('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
  }

  // Pushes the local (camelCase) onboarding profile to the backend user record.
  // Silently does nothing without a real session — the SKIP_AUTH_FOR_TESTING guest
  // path has no backend account to sync to.
  async syncProfile(profile) {
    if (!this.token) return;
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
      preferences: profile.preferences
    };
    try {
      this.currentUser = await apiRequest('/users/me', { method: 'PUT', token: this.token, body });
    } catch {
      // Best-effort — the onboarding flow already moved on locally; the next
      // successful sync (or a future explicit retry) will catch this up.
    }
  }

  async loginWithGoogle(idToken) {
    let data;
    try {
      data = await apiRequest('/auth/google', { method: 'POST', body: { idToken } });
    } catch (error) {
      throw new Error(error.message);
    }
    this.token = data.session.token;
    this.currentUser = data.user;
    this.hasLoggedOut = false;
  }

  loginWithApple({ userId, email }) {
    // Backend-side Apple identity token verification isn't wired up yet — this
    // preserves the button's previous local-only behavior until that lands.
    this.currentUser = { id: userId, email: email ?? null };
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
