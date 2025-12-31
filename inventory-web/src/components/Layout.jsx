import { useAuth } from '../lib/hooks';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children, currentPage, setCurrentPage }) {
  const { user, profile } = useAuth();

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      vendedor: 'Sales',
      contabilidad: 'Accounting',
      tester: 'Tester'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-gray-800 text-white',
      vendedor: 'bg-blue-600 text-white',
      contabilidad: 'bg-green-600 text-white',
      tester: 'bg-purple-600 text-white'
    };
    return colors[role] || 'bg-gray-600 text-white';
  };

  const isTestUser = profile?.is_test_user || false;

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const pages = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'products', label: '📦 Products', icon: '📦', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'alerts', label: '⚠️ Alerts', icon: '⚠️', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'sales', label: '💰 Sales', icon: '💰', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'purchases', label: '🛒 Purchases', icon: '🛒', roles: ['admin', 'contabilidad', 'tester'] },
  ];

  // Filter pages based on user role
  const visiblePages = pages.filter(page => 
    page.roles.includes(profile?.role || 'tester')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg shadow-sm">
                📦
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Inventory Pro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Stock Management System</p>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="hidden lg:flex items-center gap-1">
              {visiblePages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    currentPage === page.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden xl:inline">{page.label}</span>
                  <span className="xl:hidden text-base">{page.icon}</span>
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getRoleColor(profile?.role || 'tester')}`}>
                    {getRoleLabel(profile?.role || 'tester')}
                  </span>
                  {isTestUser && (
                    <span className="inline-block px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('profile')}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                title="My Profile"
              >
                👤 Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200 px-2 py-2 flex gap-1 overflow-x-auto">
          {visiblePages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentPage === page.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}
