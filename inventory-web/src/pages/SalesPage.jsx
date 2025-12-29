import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCustomers, useProducts, formatCurrency } from '../lib/hooks';

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
      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({ customer_id: selectedCustomer, status: 'COMPLETED' })
        .select()
        .single();

      if (saleError) throw saleError;

      // Add items
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sale */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">New Sale</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={customersLoading}
              >
                <option value="">Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={selectedQty}
                onChange={e => setSelectedQty(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={handleAddItem}
              disabled={!selectedProduct}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
            >
              Add Item
            </button>

            <hr className="my-4" />

            <h3 className="font-semibold mb-3">Items ({items.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>
                    {item.product_name} x{item.qty}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</p>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleCreateSale}
              disabled={loading || !selectedCustomer || items.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creating...' : 'Complete Sale'}
            </button>
          </div>
        </div>

        {/* Sales List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
          <button onClick={loadSales} className="mb-4 text-blue-600 hover:underline text-sm">
            Refresh
          </button>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left px-3 py-2">Customer</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => {
                  const customer = customers.find(c => c.id === sale.customer_id);
                  return (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{customer?.name || 'Unknown'}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(sale.total)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{new Date(sale.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
