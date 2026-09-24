import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class TermsStore {
  acceptedAt = null;
  // Set only when a new account is registered, so existing users are never prompted.
  isPending = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.terms', ['acceptedAt', 'isPending']);
  }

  requireAcceptance() {
    this.acceptedAt = null;
    this.isPending = true;
  }

  accept() {
    this.acceptedAt = new Date().toISOString();
    this.isPending = false;
  }
}

export const termsStore = new TermsStore();
