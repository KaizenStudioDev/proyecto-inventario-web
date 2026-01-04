import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
    const { data, error: err } = await supabase.from('products').select('*').order('name');
    if (err) setError(err.message);
    else setProducts(data || []);
    setLoading(false);
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
    const { data } = await supabase.from('clientes').select('*').order('nombre');
    setCustomers(data || []);
    setLoading(false);
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
    const { data } = await supabase.from('proveedores').select('*').order('nombre');
    setSuppliers(data || []);
    setLoading(false);
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
    const { data } = await supabase.from('view_low_stock_products').select('*').order('stock');
    setAlerts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  return { alerts, loading, reload: load };
}

// Utility: Get stock status color
export function getStockColor(stock, minStock) {
  if (stock <= 0) return 'text-red-600 bg-red-50';
  if (stock <= minStock) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

// Utility: Format currency
export function formatCurrency(amount) {
  return '$' + Number(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Utility: Format currency with optional line break after millions for readability
export function formatCurrencyMultiline(amount) {
  const normalized = formatCurrency(amount);
  const [symbol, rest] = [normalized.charAt(0), normalized.slice(1)];
  const [whole, decimals] = rest.split('.');
  const digits = whole.replace(/,/g, '');

  // If 6 digits or fewer, keep single line
  if (digits.length <= 6) return normalized;

  // Insert line break before the last 6 digits
  const splitIndex = digits.length - 6;
  const head = digits.slice(0, splitIndex);
  const tail = digits.slice(splitIndex);

  const headWithCommas = head.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tailWithCommas = tail.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${symbol}${headWithCommas},\n${tailWithCommas}${decimals !== undefined ? `.${decimals}` : ''}`;
}

// Utility: Format large numbers compactly (K, M, B)
export function formatCompactNumber(num) {
  const number = Number(num || 0);
  
  // Less than 100,000: show full number
  if (number < 100000) {
    return number.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // 100K - 999K
  if (number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  // 1M - 999M
  if (number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  // 1B+
  return (number / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

// Utility: Format currency with compact notation for large amounts
export function formatCompactCurrency(amount) {
  const number = Number(amount || 0);
  
  // Less than 100,000: show full currency
  if (number < 100000) {
    return '$' + number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // 100K - 999K
  if (number < 1000000) {
    return '$' + (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  // 1M - 999M
  if (number < 1000000000) {
    return '$' + (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  // 1B+
  return '$' + (number / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
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
