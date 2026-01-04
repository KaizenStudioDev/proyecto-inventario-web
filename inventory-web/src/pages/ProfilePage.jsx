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

      setSuccess('Profile updated successfully');
      
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
      admin: 'Admin',
      vendedor: 'Vendedor',
      contabilidad: 'Contabilidad',
      tester: 'Tester'
    };
    return labels[role] || role;
  };

  const isTestAccount = profile?.is_test_user || false;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-gray-600">Manage your account data and access information</p>
      </div>

      {/* Profile Card */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-semibold overflow-hidden">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-700">
                  {(form.full_name || user?.email || '?')[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{form.full_name || 'No Name Set'}</h2>
              <p className="text-gray-600 text-sm mb-3">{user?.email}</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-200 border border-gray-300">
                  {getRoleLabel(profile?.role || 'tester')}
                </span>
                {isTestAccount && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                    Demo Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="p-6">
          {isTestAccount && (
            <div className="mb-6 bg-amber-50 border border-amber-200 px-4 py-3 text-sm rounded-lg">
              <p className="font-semibold text-amber-900">Read-Only Account</p>
              <p className="text-amber-700">Demo accounts cannot be modified. Contact your administrator.</p>
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
                placeholder="Your full name"
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
              <p className="text-xs text-gray-500 mt-1">Managed by system administrator</p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role / Permission Level
              </label>
              <input
                type="text"
                value={getRoleLabel(profile?.role || 'tester')}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Request changes to an administrator</p>
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
                placeholder="https://url-to-your-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Direct link to your profile image
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
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
                  <span className="animate-spin">⌛</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
          <span className="text-xs text-gray-500">System details</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-semibold text-gray-900">
              {isTestAccount ? 'Demo Account' : 'Production Account'}
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
