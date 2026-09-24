import i18next from 'i18next';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { apiRequest } from '@/lib/api';
import { persistStore } from './persist';

// Shown until the server's list has been fetched at least once (first launch
// offline) — the app ships UI translations for exactly these.
const FALLBACK_LANGUAGES = [{ code: 'en', name: 'English' }, { code: 'ru', name: 'Русский' }, { code: 'pl', name: 'Polski' }, { code: 'de', name: 'Deutsch' }];

class LocaleStore {
  language = 'en';
  availableLanguages = FALLBACK_LANGUAGES;
  hasHydrated = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    persistStore(this, 'nutriflow.locale', ['language', 'availableLanguages']);
    // Applies the persisted language to i18next once hydration restores it from storage.
    reaction(() => this.hasHydrated, hydrated => {
      if (hydrated) i18next.changeLanguage(this.language);
    });
  }

  // Public endpoint (the picker can be needed before login). A failed request
  // keeps the last known list.
  async fetchLanguages() {
    try {
      const languages = await apiRequest('/app/languages');
      if (!Array.isArray(languages) || languages.length === 0) return;
      runInAction(() => {
        this.availableLanguages = languages.map(({ code, name }) => ({ code, name }));
      });
    } catch {
      // offline — keep whatever is stored
    }
  }

  setLanguage(language) {
    this.language = language;
    i18next.changeLanguage(language);
  }
}

export const localeStore = new LocaleStore();
