import { makeAutoObservable } from 'mobx';
import i18next from '@/i18n';
import { persistStore } from './persist';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

class AuthStore {
  accounts = [];
  currentUserId = null;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // Only accounts persist — currentUserId is intentionally not saved, so every
    // app launch starts at the login screen instead of resuming a session.
    persistStore(this, 'nutriflow.auth', ['accounts']);
  }

  get isAuthenticated() {
    return this.currentUserId !== null;
  }

  register(email, password) {
    const normalized = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) throw new Error(i18next.t('auth.errors.invalidEmail'));
    if (password.length < 6) throw new Error(i18next.t('auth.errors.passwordTooShort'));
    if (this.accounts.some(account => account.id === normalized)) {
      throw new Error(i18next.t('auth.errors.emailTaken'));
    }
    this.accounts.push({ id: normalized, email: normalized, password, createdAt: new Date().toISOString() });
    this.currentUserId = normalized;
  }

  login(email, password) {
    const normalized = normalizeEmail(email);
    const account = this.accounts.find(account => account.id === normalized);
    if (!account || account.password !== password) throw new Error(i18next.t('auth.errors.incorrectCredentials'));
    this.currentUserId = normalized;
  }

  resetPassword(email, newPassword) {
    const normalized = normalizeEmail(email);
    const account = this.accounts.find(account => account.id === normalized);
    if (!account) throw new Error(i18next.t('auth.errors.noAccountFound'));
    if (newPassword.length < 6) throw new Error(i18next.t('auth.errors.passwordTooShort'));
    account.password = newPassword;
  }

  loginWithApple({ userId, email }) {
    let account = this.accounts.find(account => account.id === userId);
    if (!account) {
      account = { id: userId, email: email ?? null, password: null, createdAt: new Date().toISOString() };
      this.accounts.push(account);
    } else if (email && !account.email) {
      account.email = email;
    }
    this.currentUserId = userId;
  }

  logout() {
    this.currentUserId = null;
  }
}

export const authStore = new AuthStore();
