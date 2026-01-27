import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms_title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-12">{t('common.last_update')}: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_accept_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.terms_accept_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_license_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.terms_license_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.terms_license_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_plans_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.terms_plans_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                                {t('legal.terms_plans_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                            <p className="text-sm text-gray-500">{t('legal.terms_plans_notice')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_payments_title')}</h2>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.terms_payments_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_misuse_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.terms_misuse_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.terms_misuse_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_support_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.terms_support_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_liability_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('legal.terms_liability_desc')}</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                                {t('legal.terms_liability_items', { returnObjects: true }).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_termination_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.terms_termination_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.terms_law_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('legal.terms_law_desc')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('nav.contact')}</h2>
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
