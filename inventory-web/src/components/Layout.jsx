import { useAuth } from '../lib/hooks';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children, currentPage, setCurrentPage }) {
  const { user, profile } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Modern Navbar with Glassmorphism */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                📦
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Inventory Pro
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100/60 backdrop-blur-sm rounded-xl p-1.5">
              {visiblePages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentPage === page.id
                      ? 'bg-white text-primary-700 shadow-md scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span className="hidden xl:inline">{page.label}</span>
                  <span className="xl:hidden text-xl">{page.icon}</span>
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.email?.split('@')[0]}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleColor(profile?.role || 'tester')}`}>
                    {getRoleLabel(profile?.role || 'tester')}
                  </span>
                  {isTestUser && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      TEST
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('profile')}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                title="My Profile"
              >
                👤 Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200/50 px-4 py-2 flex gap-1 overflow-x-auto">
          {visiblePages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                currentPage === page.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
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
