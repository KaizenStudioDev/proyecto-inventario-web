import { useLowStockAlerts } from '../lib/hooks';
import PageLoader from '../components/PageLoader';
import { useTranslation } from 'react-i18next';

export default function AlertsPage() {
  const { t } = useTranslation();
  const { alerts, loading, reload } = useLowStockAlerts();

  const outOfStock = alerts.filter(a => a.stock_status === 'OUT_OF_STOCK');
  const lowStock = alerts.filter(a => a.stock_status === 'LOW_STOCK');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('alerts.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('alerts.subtitle')}</p>
        </div>
        <button onClick={reload} className="btn-secondary">
          {t('buttons.refresh')}
        </button>
      </div>

      {loading ? (
        <PageLoader message={t('alerts.checking')} />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('alerts.critical')}</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{outOfStock.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('alerts.out_of_stock')}</p>
                </div>
                <div className="w-16 h-16 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">!</span>
                </div>
              </div>
            </div>
            <div className="card border-l-4 border-amber-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('alerts.warning')}</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{lowStock.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('alerts.low_stock')}</p>
                </div>
                <div className="w-16 h-16 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="card border border-red-200 dark:border-red-900 bg-white dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center justify-center border border-red-200 dark:border-red-800">
                <span className="text-red-700 dark:text-red-400 text-sm font-semibold">{t('alerts.alert_label')}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('alerts.out_of_stock')}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('alerts.immediate_attention', { count: outOfStock.length })}</p>
              </div>
            </div>
            {outOfStock.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium">{t('alerts.all_in_stock')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfStock.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-900/50 rounded-md p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</h3>
                      <span className="badge badge-danger">{t('products.out_of_stock').substring(0, 3).toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">SKU: {product.sku}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('alerts.price_label')}: {formatCurrency(product.unit_price)}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-red-700 dark:text-red-400">{t('alerts.stock_label')}: {product.stock}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{t('alerts.min_label')}: {product.min_stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="card border border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-md flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <span className="text-amber-700 dark:text-amber-400 text-sm font-semibold">{t('alerts.alert_label')}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('alerts.low_stock')}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('alerts.running_low', { count: lowStock.length })}</p>
              </div>
            </div>
            {lowStock.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium">{t('alerts.no_warnings')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStock.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-900/50 rounded-md p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</h3>
                      <span className="badge badge-warning">LOW</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">SKU: {product.sku}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Price: {formatCurrency(product.unit_price)}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t('alerts.stock_label')}: {product.stock}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{t('alerts.min_label')}: {product.min_stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
