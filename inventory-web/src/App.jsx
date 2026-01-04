import { useState } from 'react';
import { useAuth } from './lib/hooks';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import AlertsPage from './pages/AlertsPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'sales':
        return <SalesPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
