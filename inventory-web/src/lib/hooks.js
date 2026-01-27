import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';
import i18n from './i18n';

// Custom hook: Auth state
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Fetch profile for authenticated user
        supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Profile fetch error:', error);
              // Set default profile if fetch fails
              setProfile({ role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
            } else {
              setProfile(data || { role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
            }
          })
          .catch(err => {
            console.error('Profile error:', err);
            setProfile({ role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
          })
          .finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(true); // Start loading when auth changes

      if (session?.user) {
        supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Profile fetch error on auth change:', error);
              setProfile({ role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
            } else {
              setProfile(data || { role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
            }
          })
          .catch(err => {
            console.error('Profile error on auth change:', err);
            setProfile({ role: 'tester', is_test_user: false, full_name: '', avatar_url: null });
          })
          .finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, profile, loading };
}

// Custom hook: Fetch products
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data, error: err } = await supabase.from('products').select('*').order('name');
      if (err) throw err;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return { products, loading, error, refetch: load };
}

// Custom hook: Fetch customers
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return { customers, loading, refetch: load };
}

// Custom hook: Fetch suppliers
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return { suppliers, loading, refetch: load };
}

// Custom hook: Fetch low stock alerts
export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('view_low_stock_products').select('*').order('stock');
      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
      // Don't toast for alerts to reduce noise on dashboard
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return { alerts, loading, reload: load };
}

// Utility: Get stock status color
export function getStockColor(stock, minStock) {
  if (stock <= 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  if (stock <= minStock) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
}

// Utility: Format currency
export function formatCurrency(amount) {
  const locale = i18n.language || 'en';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

// Utility: Format currency with optional line break after millions for readability
export function formatCurrencyMultiline(amount) {
  const normalized = formatCurrency(amount);
  // This is tricky across locales, we'll stick to a simpler version for now or just return normalized
  // For large numbers, formatCurrency already handles grouping
  return normalized;
}

// Utility: Format large numbers compactly (K, M, B)
export function formatCompactNumber(num) {
  const locale = i18n.language || 'en';
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num || 0);
}

// Utility: Format currency with compact notation for large amounts
export function formatCompactCurrency(amount) {
  const locale = i18n.language || 'en';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount || 0);
}

// Custom hook: Fetch product movements
export function useProductMovements(productId) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!productId) {
      setMovements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('product_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(50);

    setMovements(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [productId]);
  return { movements, loading, refetch: load };
}
