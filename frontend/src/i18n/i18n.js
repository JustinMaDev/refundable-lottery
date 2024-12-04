import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
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
      en: { translation: en },
      zh: { translation: zh },
    },
  });

export default i18n;
