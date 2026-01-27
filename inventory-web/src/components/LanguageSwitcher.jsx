import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            title={i18n.language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
        >
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                {i18n.language === 'en' ? 'ES' : 'EN'}
            </span>
        </button>
    );
}
