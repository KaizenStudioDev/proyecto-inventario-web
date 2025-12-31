import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ full_name: '', avatar_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (profile?.is_test_user) {
      setError('Test accounts cannot be modified');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim(),
          avatar_url: form.avatar_url.trim() || null,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('✅ Profile updated successfully!');
      
      // Refresh page after 1.5s to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: '👑 Admin',
      vendedor: '💼 Vendedor',
      contabilidad: '📊 Contabilidad',
      tester: '🧪 Tester'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-red-500 to-red-600',
      vendedor: 'from-blue-500 to-blue-600',
      contabilidad: 'from-green-500 to-green-600',
      tester: 'from-purple-500 to-purple-600'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const isTestAccount = profile?.is_test_user || false;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold overflow-hidden">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white">
                  {(form.full_name || user?.email || '?')[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{form.full_name || 'No Name Set'}</h2>
              <p className="text-white/80 text-sm mb-3">{user?.email}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleColor(profile?.role || 'tester')}`}>
                  {getRoleLabel(profile?.role || 'tester')}
                </span>
                {isTestAccount && (
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    🧪 TEST ACCOUNT
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="p-6">
          {isTestAccount && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 text-sm">
              <p className="font-semibold text-yellow-900">🔒 Read-Only Account</p>
              <p className="text-yellow-800">This is a demo account. Profile editing is disabled.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                disabled={isTestAccount}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={getRoleLabel(profile?.role || 'tester')}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Role is assigned by administrators</p>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={form.avatar_url}
                onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                disabled={isTestAccount}
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a URL to your profile picture (leave blank for default)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isTestAccount}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-semibold text-gray-900">
              {isTestAccount ? 'Demo Account' : 'Personal Account'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Last Sign In:</span>
            <span className="font-semibold text-gray-900">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
