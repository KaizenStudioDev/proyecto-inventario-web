import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency, formatCompactCurrency, formatCompactNumber } from '../lib/hooks';
import QuickAddProductModal from '../components/QuickAddProductModal';
import PageLoader from '../components/PageLoader';
import { useTranslation } from 'react-i18next';

export default function DashboardPage({ setCurrentPage = () => { } }) {
  const { t, i18n } = useTranslation();
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
    return <PageLoader message={t('buttons.loading')} />;
  }

  const stats = [
    { label: t('dashboard.total_sales', { defaultValue: 'Total Sales' }), value: formatCompactCurrency(metrics?.total_sales_completed || 0), fullValue: formatCurrency(metrics?.total_sales_completed || 0), context: t('dashboard.mtd', { defaultValue: 'Month to date' }) },
    { label: t('dashboard.total_purchases', { defaultValue: 'Total Purchases' }), value: formatCompactCurrency(metrics?.total_purchases_received || 0), fullValue: formatCurrency(metrics?.total_purchases_received || 0), context: t('dashboard.mtd', { defaultValue: 'Month to date' }) },
    { label: t('dashboard.inventory_value'), value: formatCompactCurrency(metrics?.inventory_value || 0), fullValue: formatCurrency(metrics?.inventory_value || 0), context: t('dashboard.book_value', { defaultValue: 'Book value' }) },
    { label: t('dashboard.products_in_stock', { defaultValue: 'Products In Stock' }), value: formatCompactNumber(metrics?.available_product_count || 0), fullValue: (metrics?.available_product_count || 0).toLocaleString(), context: t('dashboard.active_skus', { defaultValue: 'Active SKUs' }) },
    { label: t('dashboard.out_of_stock', { defaultValue: 'Out of Stock' }), value: formatCompactNumber(metrics?.out_of_stock_count || 0), fullValue: (metrics?.out_of_stock_count || 0).toLocaleString(), context: t('dashboard.requires_action', { defaultValue: 'Requires action' }) },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="hidden md:inline-flex items-center gap-2 btn-secondary"
            title="Refresh dashboard"
          >
            <span className={`text-sm font-semibold ${refreshing ? 'animate-spin' : ''}`}>↻</span>
            <span className="text-sm font-medium">{t('buttons.refresh', { defaultValue: 'Refresh' })}</span>
          </button>
          <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
            <span>{new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
        <div className="card border border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 text-sm font-semibold">
                {t('common.alert', { defaultValue: 'Alert' })}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.stock_attention', { defaultValue: 'Stock Attention' })}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.low_stock_count', { count: lowStockProducts.length, defaultValue: '{{count}} products below threshold' })}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('alerts')}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800"
            >
              {t('dashboard.view_all')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockProducts.slice(0, 4).map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-900/50 rounded-md p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-2">{product.name}</h3>
                  <span className={`badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'} shrink-0`}>
                    {product.stock === 0 ? 'Out' : 'Low'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">{product.name}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    Stock: {product.stock}/{product.min_stock}
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
        <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.financial_summary')}</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">COP</span>
          </div>
          <ul className="space-y-3">
            <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
              <span>{t('dashboard.gross_profit')}</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right">{formatCurrency((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0))}</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
              <span>{t('dashboard.profit_margin')}</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right">{metrics?.total_sales_completed > 0 ? ((((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0)) / metrics.total_sales_completed) * 100).toFixed(1) : 0}%</span>
            </li>
            <li className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-300">
              <span>Stock Turnover</span>
              <span className="badge badge-success">Healthy</span>
            </li>
          </ul>
        </div>

        {/* System Status */}
        <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.system_status')}</h2>
            <span className="text-xs text-green-700 dark:text-green-400 font-semibold">{t('dashboard.stable')}</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{t('dashboard.db_connectivity')}</span>
              <span className="ml-auto badge badge-success">{t('dashboard.live')}</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{t('dashboard.rls_policies')}</span>
              <span className="ml-auto badge badge-success">{t('dashboard.enforced')}</span>
            </li>
            <li className="flex items-center gap-3 py-2">
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{t('dashboard.stock_tracking')}</span>
              <span className="ml-auto badge badge-success">{t('dashboard.enabled')}</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.quick_actions')}</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.shortcuts')}</span>
          </div>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => setCurrentPage('alerts')}
              className="w-full justify-between border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              {t('dashboard.stock_alerts')}
              <span>→</span>
            </button>
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="w-full justify-between border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              {t('dashboard.quick_add_product')}
              <span>→</span>
            </button>
            <button
              onClick={() => setCurrentPage('sales')}
              className="w-full justify-between border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              {t('dashboard.record_sale')}
              <span>→</span>
            </button>
            <button
              onClick={() => setCurrentPage('purchases')}
              className="w-full justify-between border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
            >
              {t('dashboard.record_purchase')}
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
