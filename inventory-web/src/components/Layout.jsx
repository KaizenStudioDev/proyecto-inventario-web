import { useAuth } from '../lib/hooks';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children, currentPage, setCurrentPage }) {
  const { user, profile } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'sales', label: 'Sales' },
    { id: 'purchases', label: 'Purchases' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">📦 Inventory</h1>

            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                {pages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={`px-4 py-2 rounded transition ${
                      currentPage === page.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 border-l pl-6">
                <div className="text-right text-sm">
                  <p className="font-semibold">{user?.email}</p>
                  <p className="text-gray-600 capitalize">{profile?.role || 'Loading...'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
