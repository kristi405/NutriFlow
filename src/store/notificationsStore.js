import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class NotificationsStore {
  isEnabled = true;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.notifications', ['isEnabled']);
  }

  setEnabled(value) {
    this.isEnabled = value;
  }
}

export const notificationsStore = new NotificationsStore();
