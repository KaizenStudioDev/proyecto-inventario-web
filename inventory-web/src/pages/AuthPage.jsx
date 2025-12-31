import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // login or signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: email.split('@')[0] } },
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 lg:p-10 w-full max-w-md border border-gray-200">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-md">
            📦
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Pro</h1>
          <p className="text-gray-600 text-sm">Professional Stock Management System</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-gray-800 hover:text-gray-900 font-semibold underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-gray-800 hover:text-gray-900 font-semibold underline">
                Sign in
              </button>
            </>
          )}
        </div>

        {mode === 'signup' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">ℹ️ New Account Information</p>
            <p className="text-xs">New accounts are created as <span className="font-semibold">Tester</span> role by default. Contact an administrator to change your role.</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <p className="font-semibold text-gray-900 mb-2">🧪 Demo Accounts</p>
          <div className="space-y-1 text-xs text-gray-700">
            <p><span className="font-medium">Admin:</span> admin@example.com</p>
            <p><span className="font-medium">Sales:</span> vendedor@example.com</p>
            <p><span className="font-medium">Accounting:</span> contabilidad@example.com</p>
            <p className="text-gray-500 mt-2 italic">Password: demo123 (for all demo accounts)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
