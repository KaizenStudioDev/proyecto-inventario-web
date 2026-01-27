import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <span className="font-bold text-white text-xl tracking-tight">Opero</span>
                        <p className="text-sm text-gray-500 mt-1">© {new Date().getFullYear()} Kaizen Studio. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8 text-sm">
                        <Link to="/privacy" className="hover:text-white transition-colors">{t('nav.privacy')}</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">{t('nav.terms')}</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
