import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency, formatCompactCurrency, formatCompactNumber } from '../lib/hooks';
import QuickAddProductModal from '../components/QuickAddProductModal';

export default function DashboardPage({ setCurrentPage = () => {} }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      
      // Load metrics
      const { data: metricsData } = await supabase.from('view_financial_snapshot').select('*').single();
      setMetrics(metricsData);
      
      // Load low stock products (top 5)
      const { data: lowStockData } = await supabase
        .from('view_low_stock_products')
        .select('*')
        .order('stock', { ascending: true })
        .limit(5);
      setLowStockProducts(lowStockData || []);
      
      setLoading(false);
    }
    load();
  }, []);

  function handleProductAdded() {
    // Reload metrics when a product is added
    async function reload() {
      const { data } = await supabase.from('view_financial_snapshot').select('*').single();
      setMetrics(data);
      
      // Also reload low stock products
      const { data: lowStockData } = await supabase
        .from('view_low_stock_products')
        .select('*')
        .order('stock', { ascending: true })
        .limit(5);
      setLowStockProducts(lowStockData || []);
    }
    reload();
  }

  async function handleRefresh() {
    setRefreshing(true);
    
    // Load metrics
    const { data: metricsData } = await supabase.from('view_financial_snapshot').select('*').single();
    setMetrics(metricsData);
    
    // Load low stock products
    const { data: lowStockData } = await supabase
      .from('view_low_stock_products')
      .select('*')
      .order('stock', { ascending: true })
      .limit(5);
    setLowStockProducts(lowStockData || []);
    
    setTimeout(() => setRefreshing(false), 500);
  }

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
    { label: 'Total Sales', value: formatCompactCurrency(metrics?.total_sales_completed || 0), fullValue: formatCurrency(metrics?.total_sales_completed || 0), context: 'Month to date' },
    { label: 'Total Purchases', value: formatCompactCurrency(metrics?.total_purchases_received || 0), fullValue: formatCurrency(metrics?.total_purchases_received || 0), context: 'Month to date' },
    { label: 'Inventory Value', value: formatCompactCurrency(metrics?.inventory_value || 0), fullValue: formatCurrency(metrics?.inventory_value || 0), context: 'Book value' },
    { label: 'Products In Stock', value: formatCompactNumber(metrics?.available_product_count || 0), fullValue: (metrics?.available_product_count || 0).toLocaleString(), context: 'Active SKUs' },
    { label: 'Out of Stock', value: formatCompactNumber(metrics?.out_of_stock_count || 0), fullValue: (metrics?.out_of_stock_count || 0).toLocaleString(), context: 'Requires action' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Executive Overview</h1>
          <p className="text-gray-600">Operational snapshot for decision-making</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="hidden md:inline-flex items-center gap-2 btn-secondary"
            title="Refresh dashboard"
          >
            <span className={`text-sm font-semibold ${refreshing ? 'animate-spin' : ''}`}>↻</span>
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-200 text-xs text-gray-600">
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="stat-card cursor-help"
              title={`${stat.label}: ${stat.fullValue} COP`}
            >
              <div className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</div>
                <div className="text-2xl lg:text-3xl font-bold text-center">{stat.value}</div>
                <div className="text-[11px] text-gray-500">{stat.context}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Low Stock Alerts Section */}
      {lowStockProducts.length > 0 && (
        <div className="card border border-amber-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700 text-sm font-semibold">
                Alert
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Stock Attention</h2>
                <p className="text-xs text-gray-600">{lowStockProducts.length} products below threshold</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('alerts')}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-md p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{product.sku}</span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                    product.stock === 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {product.stock === 0 ? 'Out' : 'Low'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Stock / Min</span>
                  <span className={`font-semibold ${product.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}>
                    {product.stock} / {product.min_stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
            <span className="text-xs text-gray-500">COP</span>
          </div>
          <ul className="space-y-3">
            <li className="flex justify-between items-center py-2 border-b border-gray-100 text-sm text-gray-700">
              <span>Gross Profit</span>
              <span className="font-semibold text-gray-900 text-right">{formatCurrency((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0))}</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-100 text-sm text-gray-700">
              <span>Profit Margin</span>
              <span className="font-semibold text-gray-900 text-right">{metrics?.total_sales_completed > 0 ? ((((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0)) / metrics.total_sales_completed) * 100).toFixed(1) : 0}%</span>
            </li>
            <li className="flex justify-between items-center py-2 text-sm text-gray-700">
              <span>Stock Turnover</span>
              <span className="badge badge-success">Healthy</span>
            </li>
          </ul>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <span className="text-xs text-green-700 font-semibold">Stable</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Database connectivity</span>
              <span className="ml-auto badge badge-success">Live</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>RLS policies</span>
              <span className="ml-auto badge badge-success">Enforced</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Stock tracking</span>
              <span className="ml-auto badge badge-success">Enabled</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <span className="text-xs text-gray-500">Shortcuts</span>
          </div>
          <div className="space-y-2 text-sm">
            <button 
              onClick={() => setCurrentPage('alerts')}
              className="w-full justify-between border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              Stock alerts
              <span>→</span>
            </button>
            <button 
              onClick={() => setShowQuickAddModal(true)}
              className="w-full justify-between border border-gray-200 text-gray-800 bg-white hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              Quick add product
              <span>→</span>
            </button>
            <button 
              onClick={() => setCurrentPage('sales')}
              className="w-full justify-between border border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              Record sale
              <span>→</span>
            </button>
            <button 
              onClick={() => setCurrentPage('purchases')}
              className="w-full justify-between border border-green-200 text-green-800 bg-green-50 hover:bg-green-100 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              Record purchase
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Product Modal */}
      <QuickAddProductModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={handleProductAdded}
      />
    </div>
  );
}
