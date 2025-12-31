import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Custom hook: Auth state
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
          .then(({ data }) => {
            setProfile(data || { role: 'tester', is_test_user: false });
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
          .then(({ data }) => {
            setProfile(data || { role: 'tester', is_test_user: false });
          });
      } else {
        setProfile(null);
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
    const { data } = await supabase.from('customers').select('*').order('name');
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
    const { data } = await supabase.from('suppliers').select('*').order('name');
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
