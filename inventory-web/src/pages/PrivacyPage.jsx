import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy_title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">{t('common.last_update')}: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.intro_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.intro_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.collect_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.collect_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.collect_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                                📌 <strong>{t('common.alert')}:</strong> {t('legal.collect_note')}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.usage_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.usage_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.usage_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.storage_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.storage_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                                {t('legal.storage_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.storage_notice')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.share_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.share_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.security_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.security_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.rights_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.rights_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.rights_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.changes_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.changes_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('nav.contact')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('contact.hero_subtitle')}</p>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                <li>📧 kaizenstudiodev@gmail.com</li>
                                <li>📱 Instagram: @kaizenstudio.dev</li>
                            </ul>
                        </section>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
