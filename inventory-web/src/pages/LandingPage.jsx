import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import LandingNav from '../components/LandingNav';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Handle hash scrolling on mount (from other pages)
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    const handleDemoLaunch = async (tier) => {
        setIsLoggingIn(true);
        const email = `${tier}@demo.com`;
        const password = 'Demo123!';

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password,
            });

            if (error) throw error;

            toast.success(t('common.success'));
            navigate('/app/dashboard');
        } catch (err) {
            console.error('Demo login error:', err);
            if (err.message.includes('Email not confirmed')) {
                toast.error('Demo email not confirmed in Supabase Dashboard. Please confirm it manually.');
            } else {
                toast.error('Failed to launch demo. Please check credentials.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200 relative">
            {/* Loading Overlay */}
            {isLoggingIn && (
                <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-900 dark:text-white font-bold text-lg animate-pulse">{t('landing.launching_demo')}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('landing.connecting_sandbox')}</p>
                </div>
            )}

            <LandingNav />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        {t('landing.hero_badge')}
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: t('landing.hero_title') }}>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('landing.hero_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => handleDemoLaunch('sales')}
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg shadow-gray-200 dark:shadow-none"
                        >
                            {t('landing.try_demo')}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('landing.customer_login')}
                        </button>
                    </div>
                </div>

                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-200 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-24 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 lg:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('landing.choose_level')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('landing.choose_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Basic Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300 group">
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('landing.basic_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('landing.basic_desc')}</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500">✓</span> {t('landing.basic_feature_1')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500">✓</span> {t('landing.basic_feature_2')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500">✓</span> {t('landing.basic_feature_3')}
                                </li>
                            </ul>
                            <button
                                onClick={() => handleDemoLaunch('basic')}
                                className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('landing.try_basic')}
                            </button>
                        </div>

                        {/* Sales Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                {t('landing.popular_badge')}
                            </div>
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('landing.sales_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('landing.sales_desc')}</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500">✓</span> {t('landing.sales_feature_1')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500">✓</span> {t('landing.sales_feature_2')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500">✓</span> {t('landing.sales_feature_3')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500">✓</span> {t('landing.sales_feature_4')}
                                </li>
                            </ul>
                            <button
                                onClick={() => handleDemoLaunch('sales')}
                                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                            >
                                {t('landing.try_sales')}
                            </button>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 group">
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('landing.enterprise_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('landing.enterprise_desc')}</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500">✓</span> {t('landing.enterprise_feature_1')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500">✓</span> {t('landing.enterprise_feature_2')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500">✓</span> {t('landing.enterprise_feature_3')}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-purple-500">✓</span> {t('landing.enterprise_feature_4')}
                                </li>
                            </ul>
                            <button
                                onClick={() => handleDemoLaunch('enterprise')}
                                className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('landing.try_enterprise')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('landing.speed_title')}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                                {t('landing.speed_desc')}
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold shrink-0">1</div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landing.feature_1_title')}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('landing.feature_1_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">2</div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landing.feature_2_title')}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('landing.feature_2_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">3</div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landing.feature_3_title')}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('landing.feature_3_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 aspect-square flex items-center justify-center">
                            {/* Abstract UI Representation */}
                            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="h-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1 px-3">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
                                    <div className="flex gap-4">
                                        <div className="h-24 bg-blue-50 dark:bg-blue-900/20 rounded flex-1"></div>
                                        <div className="h-24 bg-green-50 dark:bg-green-900/20 rounded flex-1"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-full"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-full"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
