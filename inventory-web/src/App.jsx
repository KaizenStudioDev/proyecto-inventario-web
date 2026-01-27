import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './lib/hooks';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ToastProvider';
import PageLoader from './components/PageLoader';
import { DemoProvider } from './lib/DemoContext';
import './index.css';

// Lazy load pages
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Allow access if user is logged in OR if demo mode is active
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider />
      <BrowserRouter>
        <DemoProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<AuthPageWithRedirect />} />

              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DemoProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Wrapper for AuthPage to handle redirection if already logged in
function AuthPageWithRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <AuthPage />;
}
