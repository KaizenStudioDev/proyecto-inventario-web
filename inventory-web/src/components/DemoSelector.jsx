import { useNavigate } from 'react-router-dom';
import { useDemo, LICENSE_FEATURES } from '../lib/DemoContext';
import LandingNav from './LandingNav';
import { useAuth } from '../lib/hooks';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function DemoSelector() {
    const navigate = useNavigate();
    const { startDemo } = useDemo();
    const { user } = useAuth();

    const handleSelectDemo = async (type) => {
        const loadingToast = toast.loading('Setting up your demo environment...');

        try {
            // 1. Set Demo Context
            startDemo(type);

            // 2. Ensure we have an active session (using anonymous/tester login if needed)
            // For now, if not logged in, we'll try to sign in as a generic demo user if you have one, 
            // or just redirect to login if we enforce real auth.
            // 
            // *CRITICAL*: The app's RLS requires a user to be logged in to fetch data.
            // If we are in "Demo Mode", we usually want to skip the login screen.
            // We will attempt to sign in as a 'tester' account automatically.

            if (!user) {
                // Auto-login to the 'admin' account to ensure data access, 
                // while DemoContext restricts the UI features.
                const { error } = await supabase.auth.signInWithPassword({
                    email: 'admin@demo.com',
                    password: 'Demo123'
                });

                if (error) {
                    console.warn("Auto-login failed", error);
                    toast.error("Demo login failed. Please try again or login manually.", { id: loadingToast });
                    navigate('/login');
                    return;
                }
            }

            toast.success(`Welcome to the ${LICENSE_FEATURES[type].label} Demo!`, { id: loadingToast });
            navigate('/app/dashboard');

        } catch (err) {
            toast.error('Failed to start demo', { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <LandingNav />

            <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
                        Interactive Preview
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select an Experience</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Choose a license tier to explore. The interface and available features will adapt automatically to simulate that specific plan.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Basic */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Basic</h3>
                            <p className="text-sm text-gray-500 mt-1">Essential stock control</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {LICENSE_FEATURES.basic.features.map(f => (
                                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                                    <span className="text-green-500">●</span> {f}
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-sm text-gray-300 italic">
                                <span>○</span> Customers (Locked)
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-300 italic">
                                <span>○</span> Sales (Locked)
                            </li>
                        </ul>
                        <button
                            onClick={() => handleSelectDemo('basic')}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                        >
                            Launch Basic
                        </button>
                    </div>

                    {/* Sales */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-blue-200 dark:border-blue-900 p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventory + Sales</h3>
                            <p className="text-sm text-blue-600 mt-1 font-medium">Recommended</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {LICENSE_FEATURES.sales.features.map(f => (
                                <li key={f} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                                    <span className="text-blue-500">●</span> {f}
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-sm text-gray-300 italic">
                                <span>○</span> Suppliers (Locked)
                            </li>
                        </ul>
                        <button
                            onClick={() => handleSelectDemo('sales')}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                            Launch Sales
                        </button>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col hover:border-purple-300 dark:hover:border-purple-900 transition-colors">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enterprise Suite</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full ERP capabilities</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {LICENSE_FEATURES.enterprise.features.map(f => (
                                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                                    <span className="text-purple-500">●</span> {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectDemo('enterprise')}
                            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Launch Enterprise
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
