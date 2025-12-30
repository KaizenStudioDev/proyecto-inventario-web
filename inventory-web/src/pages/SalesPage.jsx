import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCustomers, useProducts, formatCurrency } from '../lib/hooks';
import ModernSelect from '../components/ModernSelect';

export default function SalesPage() {
  const { customers, loading: customersLoading } = useCustomers();
  const { products } = useProducts();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    setSales(data || []);
  }

  async function handleAddItem() {
    if (!selectedProduct || selectedQty <= 0) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setItems([...items, {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.unit_price,
      qty: selectedQty,
    }]);
    setSelectedProduct('');
    setSelectedQty(1);
  }

  function handleRemoveItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleCreateSale() {
    if (!selectedCustomer || items.length === 0) {
      setError('Select customer and add items');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({ customer_id: selectedCustomer, status: 'COMPLETED' })
        .select()
        .single();

      if (saleError) throw saleError;

      const itemsToInsert = items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        qty: item.qty,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      setSelectedCustomer('');
      setItems([]);
      loadSales();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const total = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: c.name,
    icon: '👤',
    description: c.email || '',
  }));

  const productOptions = products.map(p => ({
    value: p.id,
    label: p.name,
    icon: '📦',
    description: `Stock: ${p.stock} | Price: ${formatCurrency(p.unit_price)}`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">💰 Sales</h1>
        <p className="text-gray-600">Record and manage customer sales transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sale - Left Panel */}
        <div className="card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>➕</span> New Sale
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Customer Select */}
            <ModernSelect
              label="Select Customer"
              icon="👤"
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              options={customerOptions}
              placeholder="Choose a customer..."
              disabled={customersLoading}
            />

            {/* Product Select */}
            <ModernSelect
              label="Select Product"
              icon="📦"
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={productOptions}
              placeholder="Choose a product..."
            />

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={selectedQty}
                onChange={e => setSelectedQty(Number(e.target.value))}
                className="input-field"
              />
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleAddItem}
              disabled={!selectedProduct}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>➕</span>
              <span>Add Item to Cart</span>
            </button>

            <div className="my-4 border-t-2 border-gray-200"></div>

            {/* Items List */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🛒</span>
                Cart Items ({items.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm">No items added yet</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-600">
                          {item.qty} × {formatCurrency(item.unit_price)} = <span className="font-bold">{formatCurrency(item.qty * item.unit_price)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Box */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-xl p-4">
              <p className="text-sm text-primary-700 font-medium mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(total)}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              onClick={handleCreateSale}
              disabled={loading || !selectedCustomer || items.length === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Complete Sale</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sales List - Right Panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Recent Sales
            </h2>
            <button
              onClick={loadSales}
              className="text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
              title="Refresh sales list"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="p-6">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">No sales recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">👤 Customer</th>
                      <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">💰 Total</th>
                      <th className="text-center px-4 py-3 text-sm font-bold text-gray-700">✓ Status</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">📅 Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(sale => {
                      const customer = customers.find(c => c.id === sale.customer_id);
                      return (
                        <tr
                          key={sale.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">{customer?.name || '❓ Unknown'}</td>
                          <td className="px-4 py-3 text-right font-bold text-primary-600">{formatCurrency(sale.total)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              sale.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : sale.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {sale.status === 'COMPLETED' ? '✅' : sale.status === 'PENDING' ? '⏳' : '❌'}
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {new Date(sale.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
