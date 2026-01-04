import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage({ onAuthSuccess }) {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gray-900 text-white text-lg font-semibold">IN</span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Inventory management</p>
                <h1 className="text-2xl font-semibold text-gray-900 leading-tight">Inventory OS</h1>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Access the dashboard to manage products, purchases, and sales with clear controls, aligned data, and consistent corporate standards.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="font-medium text-gray-900">Daily operations</p>
                <p className="text-xs text-gray-600 mt-1">Stock, alerts and sales flows in one unified dashboard.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="font-medium text-gray-900">Access security</p>
                <p className="text-xs text-gray-600 mt-1">Controlled sessions with role-based access throughout.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Demo accounts</p>
            <div className="grid gap-2 text-sm text-gray-800">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                <span className="font-medium">Admin</span>
                <span className="text-gray-600">admin@demo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                <span className="font-medium">Sales</span>
                <span className="text-gray-600">sales@demo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                <span className="font-medium">Accounting</span>
                <span className="text-gray-600">accounting@demo</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password: Demo123 for all demo accounts.</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 lg:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Access portal</p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-2">{isLogin ? 'Sign in' : 'Create account'}</h2>
              <p className="text-sm text-gray-600 mt-1">Sign in with your company credentials.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 bg-gray-50">
              {isLogin ? 'Login' : 'Register'}
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-5" aria-live="polite">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="user@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
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
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-700 flex items-center justify-between">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              onClick={() => setMode(isLogin ? 'signup' : 'login')}
              className="text-gray-900 font-semibold underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p className="font-semibold">Initial role assignment</p>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                New accounts default to Tester role. Contact your administrator to request your permanent role assignment upon access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
