import { useLowStockAlerts, formatCurrency } from '../lib/hooks';

export default function AlertsPage() {
  const { alerts, loading, reload } = useLowStockAlerts();

  const outOfStock = alerts.filter(a => a.stock_status === 'OUT_OF_STOCK');
  const lowStock = alerts.filter(a => a.stock_status === 'LOW_STOCK');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">⚠️ Stock Alerts</h1>
          <p className="text-gray-600">Monitor low stock and out-of-stock items</p>
        </div>
        <button onClick={reload} className="btn-primary flex items-center gap-2">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading alerts...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Critical</p>
                  <p className="text-4xl font-bold">{outOfStock.length}</p>
                  <p className="text-red-100 text-sm mt-1">Out of Stock</p>
                </div>
                <div className="text-6xl opacity-20">🚨</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">Warning</p>
                  <p className="text-4xl font-bold">{lowStock.length}</p>
                  <p className="text-amber-100 text-sm mt-1">Low Stock</p>
                </div>
                <div className="text-6xl opacity-20">⚡</div>
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="card border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                🚨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600">Out of Stock</h2>
                <p className="text-sm text-gray-600">{outOfStock.length} products need immediate attention</p>
              </div>
            </div>
            {outOfStock.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">✅</p>
                <p className="text-gray-600 font-medium">All products are in stock!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfStock.map(product => (
                  <div key={product.id} className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-red-900 text-lg">{product.name}</h3>
                      <span className="badge badge-danger">URGENT</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-mono">📦 SKU: {product.sku}</p>
                    <p className="text-sm text-gray-700 mb-3">💰 Price: {formatCurrency(product.unit_price)}</p>
                    <div className="flex items-center justify-between pt-3 border-t-2 border-red-200">
                      <span className="text-sm font-semibold text-red-700">Stock: {product.stock}</span>
                      <span className="text-sm text-gray-600">Min: {product.min_stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="card border-l-4 border-amber-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-600">Low Stock</h2>
                <p className="text-sm text-gray-600">{lowStock.length} products running low</p>
              </div>
            </div>
            {lowStock.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">✅</p>
                <p className="text-gray-600 font-medium">No low stock warnings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStock.map(product => (
                  <div key={product.id} className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-amber-900 text-lg">{product.name}</h3>
                      <span className="badge badge-warning">LOW</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-mono">📦 SKU: {product.sku}</p>
                    <p className="text-sm text-gray-700 mb-3">💰 Price: {formatCurrency(product.unit_price)}</p>
                    <div className="flex items-center justify-between pt-3 border-t-2 border-amber-200">
                      <span className="text-sm font-semibold text-amber-700">Stock: {product.stock}</span>
                      <span className="text-sm text-gray-600">Min: {product.min_stock}</span>
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
