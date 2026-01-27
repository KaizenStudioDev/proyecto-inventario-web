import { useState, useEffect } from 'react';
import { useAuth } from '../lib/hooks';
import { supabase } from '../lib/supabaseClient';
import { useDemo } from '../lib/DemoContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import LogoLight from '../assets/logo-light.svg';
import LogoDark from '../assets/logo-dark.svg';
import GlobalSearch from './GlobalSearch';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { isDemoMode, licenseType, licenseDetails, hasFeature, exitDemo } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: t('roles.admin'),
      vendedor: t('roles.vendedor'),
      contabilidad: t('roles.contabilidad'),
      tester: t('roles.tester')
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
    const wasDemo = isDemoMode;
    await supabase.auth.signOut();
    if (wasDemo) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }

  const pages = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: 'Dashboard', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'products', label: t('nav.products'), icon: 'Products', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'customers', label: t('nav.customers'), icon: 'Customers', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'suppliers', label: t('nav.suppliers'), icon: 'Suppliers', roles: ['admin', 'contabilidad', 'tester'] },
    { id: 'sales', label: t('nav.sales'), icon: 'Sales', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'purchases', label: t('nav.purchases'), icon: 'Purchases', roles: ['admin', 'contabilidad', 'tester'] },
    { id: 'alerts', label: t('nav.alerts'), icon: 'Alerts', roles: ['admin', 'vendedor', 'contabilidad', 'tester'] },
    { id: 'reports', label: t('nav.reports'), icon: 'Reports', roles: ['admin', 'contabilidad', 'tester'] },
  ];

  // Filter pages based on user role AND demo license features
  const visiblePages = pages.filter(page => {
    const hasRoleAccess = page.roles.includes(profile?.role || 'tester');
    const hasDemoAccess = hasFeature ? hasFeature(page.id === 'dashboard' ? 'dashboard' : page.id) : true;
    return hasRoleAccess && hasDemoAccess;
  });

  const handleDemoExit = async () => {
    exitDemo();
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-4">
          <span>👀 {t('layout.viewing_demo', { license: licenseDetails?.label })}</span>
          <button
            onClick={handleDemoExit}
            className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] transition-colors"
          >
            {t('layout.exit_demo')}
          </button>
        </div>
      )}
      {/* Professional Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16">
          <div className="flex justify-between items-center h-full gap-4">

            {/* Column 1: Logo */}
            <div
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <img
                src={theme === 'dark' ? LogoDark : LogoLight}
                alt="Opero"
                className="h-8 w-auto group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden lg:block">Opero</span>
            </div>

            {/* Column 2: Navigation - Centered (Hidden on small screens) */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl px-4">
              {visiblePages.map(page => (
                <button
                  key={page.id}
                  onClick={() => navigate(`/app/${page.id}`)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${location.pathname.includes(page.id)
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {page.label}
                </button>
              ))}
            </div>

            {/* Column 3: Actions (Search, Theme, Profile) */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Expandable Search */}
              <GlobalSearch />

              <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title={t('layout.toggle_theme')}
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                )}
              </button>

              {/* User / Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800">
                <div className="hidden xl:block text-right pr-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-none capitalize">
                    {user?.email?.split('@')[0] || (isDemoMode ? t('layout.demo_user') : '')}
                  </p>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter">
                    {getRoleLabel(profile?.role || 'tester')}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/app/profile')}
                  className="w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-bold text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all border border-gray-200 dark:border-gray-700"
                  title={t('layout.my_profile')}
                >
                  {user?.email?.charAt(0).toUpperCase() || (isDemoMode ? 'D' : '?')}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-bold"
                  title={t('layout.logout')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span className="hidden md:inline">{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex gap-1 overflow-x-auto bg-white dark:bg-gray-900">
          {visiblePages.map(page => (
            <button
              key={page.id}
              onClick={() => navigate(`/app/${page.id}`)}
              className={`px-2 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${location.pathname.includes(page.id)
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="animate-fade-in min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Opero · {t('layout.confidential')}</span>
          <span>{t('layout.built_by')}</span>
        </div>
      </footer>
    </div>
  );
}
