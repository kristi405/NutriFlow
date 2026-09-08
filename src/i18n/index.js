import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';

// Add new languages here as they're translated (e.g. `import es from './locales/es.json';`).
const resources = {
  en: { translation: en },
  ru: { translation: ru },
  pl: { translation: pl },
  de: { translation: de }
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
