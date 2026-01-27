import { useState } from 'react';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        reason: t('contact.form_reason_options.support'),
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionPromise = async () => {
            const { error } = await supabase
                .from('contact_submissions')
                .insert([formData]);

            if (error) throw error;
        };

        toast.promise(
            submissionPromise(),
            {
                loading: t('contact.sending'),
                success: t('contact.success'),
                error: (e) => `${t('contact.error')} ${e.message || t('common.error')}`
            }
        );

        setFormData({ name: '', email: '', company: '', reason: t('contact.form_reason_options.support'), message: '' });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            <LandingNav />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Info Side */}
                    <div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-3 inline-block mb-6">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-wide uppercase">{t('contact.badge')}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.hero_title')}</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            {t('contact.hero_subtitle')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">📧</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.email_title')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">kaizenstudiodev@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">📱</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.instagram_title')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">@kaizenstudio.dev</p>
                                    <p className="text-xs text-gray-500 mt-2">{t('contact.response_time')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🛡️ {t('contact.trust_note_title')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('contact.trust_note_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field w-full"
                                        placeholder={t('contact.form_name_placeholder')}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form_company')}</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        className="input-field w-full"
                                        placeholder={t('contact.form_company_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form_email')}</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field w-full"
                                    placeholder={t('contact.form_email_placeholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form_reason')}</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value={t('contact.form_reason_options.support')}>{t('contact.form_reason_options.support')}</option>
                                    <option value={t('contact.form_reason_options.sales')}>{t('contact.form_reason_options.sales')}</option>
                                    <option value={t('contact.form_reason_options.demo')}>{t('contact.form_reason_options.demo')}</option>
                                    <option value={t('contact.form_reason_options.other')}>{t('contact.form_reason_options.other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form_message')}</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="input-field w-full text-base"
                                    placeholder={t('contact.form_message_placeholder')}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-3 text-base font-semibold"
                            >
                                {t('contact.form_submit')}
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
