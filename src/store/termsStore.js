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

  // After a reinstall, AsyncStorage (acceptedAt included) is wiped — but the
  // backend may already have this account's acceptance (pushed by the accept
  // button in terms-acceptance-modal.js), so a returning user isn't asked to
  // accept again. A genuinely new account has none yet, so this is a no-op.
  hydrateFromServer(user) {
    if (this.acceptedAt || !user) return;
    const serverAcceptedAt = user.preferences?.termsAcceptedAt;
    if (!serverAcceptedAt) return;
    this.acceptedAt = serverAcceptedAt;
    this.isPending = false;
  }
}

export const termsStore = new TermsStore();
