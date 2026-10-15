import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';

// Add new languages here as they're translated.
const resources = {
  en: { translation: en },
  ru: { translation: ru },
  pl: { translation: pl },
  de: { translation: de },
  es: { translation: es },
  pt: { translation: pt }
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
