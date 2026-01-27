import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { useDemo } from '../lib/DemoContext';
import LogoDark from '../assets/logo-dark.svg';
import LogoLight from '../assets/logo-light.svg';

export default function LandingNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleDemoLaunch = async () => {
        setIsLoggingIn(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: 'sales@demo.com',
                password: 'Demo123!',
            });
            if (error) throw error;
            toast.success('Entering Sales demo...');
            navigate('/app/dashboard');
        } catch (err) {
            if (err.message.includes('Email not confirmed')) {
                toast.error('Demo email not confirmed in Supabase Dashboard.');
            } else {
                toast.error('Failed to launch demo.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleNav = (id) => {
        if (location.pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(`/#${id}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            {/* Loading Overlay */}
            {isLoggingIn && (
                <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-900 dark:text-white font-bold text-lg animate-pulse">Launching Interactive Demo...</p>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img src={theme === 'dark' ? LogoDark : LogoLight} alt="Opero" className="h-8 w-auto" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Opero</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <button
                        onClick={() => handleNav('products')}
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Products
                    </button>
                    <button
                        onClick={() => handleNav('features')}
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Pricing
                    </button>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Log in
                    </button>
                    <button
                        onClick={handleDemoLaunch}
                        className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        Live Demo
                    </button>
                </div>
            </div>
        </nav>
    );
}
