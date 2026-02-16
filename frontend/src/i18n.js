import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import translationEN from './locales/en/translation.json';
import translationGU from './locales/gu/translation.json';
import translationHI from './locales/hi/translation.json';

const resources = {
    en: { translation: translationEN },
    gu: { translation: translationGU },
    hi: { translation: translationHI }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        }
    });

// Save language preference
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
});

export default i18n;
