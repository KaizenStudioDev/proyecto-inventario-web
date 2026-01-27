import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import LogoDark from '../assets/logo-dark.svg';
import LogoLight from '../assets/logo-light.svg';

export default function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailTrimmed = email.trim().toLowerCase();
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: emailTrimmed,
          password,
          options: { data: { full_name: emailTrimmed.split('@')[0] } },
        });
        if (err) throw err;
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-200">
      {/* Back Button */}
      <div className="w-full max-w-5xl mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-semibold group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to home
        </button>
      </div>

      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center">
                <img src={localStorage.getItem('theme') === 'dark' ? LogoDark : LogoLight} alt="Opero" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Inventory management</p>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">Opero</h1>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Access the dashboard to manage products, purchases, and sales with clear controls, aligned data, and consistent corporate standards.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="font-medium text-gray-900 dark:text-white">Daily operations</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Stock, alerts and sales flows in one unified dashboard.</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="font-medium text-gray-900 dark:text-white">Access security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Controlled sessions with role-based access throughout.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">Demo accounts</p>
            <div className="grid gap-2 text-sm text-gray-800 dark:text-gray-200">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <span className="font-medium">Basic</span>
                <span className="text-gray-600 dark:text-gray-400">basic@demo.com</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <span className="font-medium">Ventas</span>
                <span className="text-gray-600 dark:text-gray-400">sales@demo.com</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <span className="font-medium">Empresarial</span>
                <span className="text-gray-600 dark:text-gray-400">enterprise@demo.com</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password: Demo123! for all demo accounts.</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8 lg:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Access portal</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{isLogin ? 'Sign in' : 'Create account'}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sign in with your company credentials.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
              {isLogin ? 'Login' : 'Register'}
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-5" aria-live="polite">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="user@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                <p className="font-medium">Sign in failed</p>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              onClick={() => setMode(isLogin ? 'signup' : 'login')}
              className="text-gray-900 dark:text-white font-semibold underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-300">
              <p className="font-semibold">Initial role assignment</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
                New accounts default to Tester role. Contact your administrator to request your permanent role assignment upon access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
