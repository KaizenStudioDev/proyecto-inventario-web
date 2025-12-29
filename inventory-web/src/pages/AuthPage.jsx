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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96">
        <h1 className="text-3xl font-bold text-center mb-2">Inventory</h1>
        <p className="text-center text-gray-600 mb-6">Stock Management System</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-blue-600 hover:underline font-semibold">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-blue-600 hover:underline font-semibold">
                Login
              </button>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">Demo Account</p>
          <p>Email: admin@example.com</p>
          <p>Password: (Create one via signup)</p>
        </div>
      </div>
    </div>
  );
}
