import { makeAutoObservable } from 'mobx';
import { persistStore } from './persist';

class ThemeStore {
  isDarkMode = false;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.theme', ['isDarkMode']);
  }

  setDarkMode(value) {
    this.isDarkMode = value;
  }
}

export const themeStore = new ThemeStore();
