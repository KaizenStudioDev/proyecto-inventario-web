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
    { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'products', label: 'Products', icon: 'Products', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'customers', label: 'Customers', icon: 'Customers', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'suppliers', label: 'Suppliers', icon: 'Suppliers', roles: ['admin', 'contabilidad', 'tester'] },
    { id: 'sales', label: 'Sales', icon: 'Sales', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'purchases', label: 'Purchases', icon: 'Purchases', roles: ['admin', 'contabilidad', 'tester'] },
    { id: 'alerts', label: 'Alerts', icon: 'Alerts', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'reports', label: 'Reports', icon: 'Reports', roles: ['admin', 'contabilidad', 'tester'] },
  ];

  // Filter pages based on user role
  const visiblePages = pages.filter(page => 
    page.roles.includes(profile?.role || 'tester')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 lg:px-6 py-2">
          <div className="flex justify-between items-center gap-3">
            {/* Logo - More Compact */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white text-xs font-bold tracking-wide">
                INV
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-gray-900 leading-none">Inventory OS</h1>
                <p className="text-[10px] text-gray-500 leading-none hidden lg:block">Kaizen Studio</p>
              </div>
            </div>

            {/* Navigation - Horizontal with scroll on smaller screens */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto">
              {visiblePages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    currentPage === page.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>

            {/* User Menu - Right aligned */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right flex-shrink-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.email?.split('@')[0]}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${getRoleColor(profile?.role || 'tester')}`}>
                    {getRoleLabel(profile?.role || 'tester')}
                  </span>
                  {isTestUser && (
                    <span className="inline-block px-1.5 py-0.5 bg-yellow-200 text-yellow-900 text-[10px] font-semibold rounded">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('profile')}
                className="hidden md:inline-block px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
                title="My Profile"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex-shrink-0"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 px-2 py-2 flex gap-1 overflow-x-auto bg-white">
          {visiblePages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-2 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                currentPage === page.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="animate-fade-in min-h-[calc(100vh-120px)]">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 text-xs text-gray-500 flex items-center justify-between">
          <span>Inventory OS · Confidential</span>
          <span>Built by Kaizen Studio</span>
        </div>
      </footer>
    </div>
  );
}
