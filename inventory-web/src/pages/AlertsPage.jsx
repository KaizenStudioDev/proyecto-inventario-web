import { useLowStockAlerts, formatCurrency } from '../lib/hooks';

export default function AlertsPage() {
  const { alerts, loading, reload } = useLowStockAlerts();

  const outOfStock = alerts.filter(a => a.stock_status === 'OUT_OF_STOCK');
  const lowStock = alerts.filter(a => a.stock_status === 'LOW_STOCK');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Alerts</h1>
        <button onClick={reload} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading alerts...</p>
      ) : (
        <div className="space-y-6">
          {/* Out of Stock */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Out of Stock ({outOfStock.length})
            </h2>
            {outOfStock.length === 0 ? (
              <p className="text-gray-500">No out-of-stock items</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfStock.map(product => (
                  <div key={product.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">Unit Price: {formatCurrency(product.unit_price)}</p>
                    <p className="text-sm text-red-600 font-semibold mt-2">Stock: {product.stock} / Min: {product.min_stock}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <h2 className="text-2xl font-semibold text-yellow-600 mb-4">
              Low Stock ({lowStock.length})
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-gray-500">No low-stock items</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStock.map(product => (
                  <div key={product.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">Unit Price: {formatCurrency(product.unit_price)}</p>
                    <p className="text-sm text-yellow-600 font-semibold mt-2">Stock: {product.stock} / Min: {product.min_stock}</p>
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
