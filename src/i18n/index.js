import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

// Add new languages here as they're translated (e.g. `import es from './locales/es.json';`).
const resources = {
  en: { translation: en }
};

i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18next;
