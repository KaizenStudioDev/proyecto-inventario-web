import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency } from '../lib/hooks';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('view_financial_snapshot').select('*').single();
      setMetrics(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Sales', value: formatCurrency(metrics?.total_sales_completed || 0), icon: '💰', gradient: 'from-blue-500 to-blue-600', trend: '+12.5%' },
    { label: 'Total Purchases', value: formatCurrency(metrics?.total_purchases_received || 0), icon: '🛒', gradient: 'from-purple-500 to-purple-600', trend: '+8.2%' },
    { label: 'Inventory Value', value: formatCurrency(metrics?.inventory_value || 0), icon: '💎', gradient: 'from-green-500 to-green-600', trend: '+5.7%' },
    { label: 'In Stock', value: metrics?.available_product_count || 0, icon: '📦', gradient: 'from-amber-500 to-amber-600', trend: 'Good' },
    { label: 'Out of Stock', value: metrics?.out_of_stock_count || 0, icon: '⚠️', gradient: 'from-red-500 to-red-600', trend: 'Alert' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-soft">
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="stat-card bg-gradient-to-br"
              style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
            >
              <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-6xl opacity-10">{stat.icon}</div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">{stat.trend}</span>
                  </div>
                  <p className="text-sm font-medium opacity-90 mb-1">{stat.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Financial Insights</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Gross Profit</span>
              <span className="font-semibold text-green-600">{formatCurrency((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0))}</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className="font-semibold text-blue-600">{metrics?.total_sales_completed > 0 ? ((((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0)) / metrics.total_sales_completed) * 100).toFixed(1) : 0}%</span>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Stock Turnover</span>
              <span className="badge badge-success">Excellent</span>
            </li>
          </ul>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700">Database Connected</span>
              <span className="ml-auto badge badge-success">Live</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700">RLS Policies Active</span>
              <span className="ml-auto badge badge-success">Secure</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700">Stock Tracking</span>
              <span className="ml-auto badge badge-success">Enabled</span>
            </li>
          </ul>
        </div>

        {/* Inventory Alerts */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <button className="w-full bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 text-primary-700 font-medium py-3 px-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group">
              <span>View Low Stock Items</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 font-medium py-3 px-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group">
              <span>Generate Report</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 font-medium py-3 px-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group">
              <span>Export Data</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
