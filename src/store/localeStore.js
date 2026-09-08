import i18next from 'i18next';
import { makeAutoObservable, reaction } from 'mobx';
import { persistStore } from './persist';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'pl', 'de'];

class LocaleStore {
  language = 'en';
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.locale', ['language']);
    // Applies the persisted language to i18next once hydration restores it from storage.
    reaction(() => this.hasHydrated, hydrated => {
      if (hydrated) i18next.changeLanguage(this.language);
    });
  }

  setLanguage(language) {
    this.language = language;
    i18next.changeLanguage(language);
  }
}

export const localeStore = new LocaleStore();
