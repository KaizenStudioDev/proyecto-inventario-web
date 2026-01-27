import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from '../locales/en/common.json';
import commonES from '../locales/es/common.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: commonEN
            },
            es: {
                common: commonES
            }
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
