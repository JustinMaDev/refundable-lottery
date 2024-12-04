import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';

const detectBrowserLanguage = () => {
    const lang = navigator.language || navigator.userLanguage;
    return lang.split("-")[0];
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: detectBrowserLanguage(),
    fallbackLng: 'en', 
    defaultNS: 'translation',
    debug: true,      
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ar: { translation: ar },
      de: { translation: de },
      en: { translation: en },
      fr: { translation: fr },
      ja: { translation: ja },
      ko: { translation: ko },
      ru: { translation: ru },
      zh: { translation: zh },
    },
  });

export default i18n;
