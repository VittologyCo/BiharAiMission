import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Locales - Phase 1
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import enNavbar from './locales/en/navbar.json';
import hiNavbar from './locales/hi/navbar.json';

const resources = {
  en: {
    common: enCommon,
    navbar: enNavbar,
    landing: {},
    auth: {},
    learning: {},
    exam: {},
    profile: {},
    misc: {},
    payment: {},
    admin: {}
  },
  hi: {
    common: hiCommon,
    navbar: hiNavbar,
    landing: {},
    auth: {},
    learning: {},
    exam: {},
    profile: {},
    misc: {},
    payment: {},
    admin: {}
  }
};

const customDetector = {
  name: 'biharLangDetector',
  lookup() {
    try {
      const saved = localStorage.getItem('bihar_ai_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  },
  cacheUserLanguage(lng) {
    try {
      localStorage.setItem('bihar_ai_lang', lng);
    } catch (e) {}
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    fallbackNS: 'common',
    ns: ['common', 'navbar', 'landing', 'auth', 'learning', 'exam', 'profile', 'misc', 'payment', 'admin'],
    detection: {
      order: ['biharLangDetector', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

// Synchronize document.documentElement.lang attribute
const updateHtmlLang = (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng || 'en';
  }
};

updateHtmlLang(i18n.language);

i18n.on('languageChanged', (lng) => {
  updateHtmlLang(lng);
  try {
    localStorage.setItem('bihar_ai_lang', lng);
  } catch (e) {}
});

export default i18n;
