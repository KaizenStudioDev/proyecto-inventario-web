import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSuppliers, useProducts, formatCurrency, useAuth } from '../lib/hooks';
import ModernSelect from '../components/ModernSelect';

export default function PurchasesPage() {
  const { profile } = useAuth();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { products, refetch: refetchProducts } = useProducts();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check permission (matches RLS policies: admin, contabilidad, tester can view)
  const canViewPurchases = profile && ['admin', 'contabilidad', 'tester'].includes(profile.role);
  const canCreatePurchases = profile && ['admin', 'contabilidad', 'tester'].includes(profile.role);

  // If profile not loaded yet, show loading
  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl mb-3">⏳</p>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!canViewPurchases) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <p className="text-xl font-bold text-red-900">🚫 Access Denied</p>
          <p className="text-red-700 mt-2">Your role ({profile.role}) does not have permission to access Purchases.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    const { data } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
    setPurchases(data || []);
  }

  async function handleAddItem() {
    if (!selectedProduct || selectedQty <= 0 || !selectedPrice) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setItems([...items, {
      product_id: product.id,
      product_name: product.name,
      unit_price: Number(selectedPrice),
      qty: selectedQty,
    }]);
    setSelectedProduct('');
    setSelectedQty(1);
    setSelectedPrice('');
  }

  function handleRemoveItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleCreatePurchase() {
    if (!selectedSupplier || items.length === 0) {
      setError('Select supplier and add items');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({ supplier_id: selectedSupplier, status: 'RECEIVED' })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const itemsToInsert = items.map(item => ({
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        qty: item.qty,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase.from('purchase_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      setSelectedSupplier('');
      setItems([]);
      
      // Reload purchases and products to show updated stock
      await loadPurchases();
      await refetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const total = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: s.name,
    icon: '🏭',
    description: s.contact_person || '',
  }));

  const productOptions = products.map(p => ({
    value: p.id,
    label: p.name,
    icon: '📦',
    description: `Current stock: ${p.stock} units`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">🛒 Purchases</h1>
        <p className="text-gray-600">Record and manage supplier purchase orders</p>
        {!canCreatePurchases && (
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">📖 View Only Mode</p>
            <p>Your role ({profile?.role}) can view purchases but cannot create new ones.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Purchase - Left Panel (Only show if user can create) */}
        {canCreatePurchases && (
        <div className="card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>➕</span> New Purchase
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Supplier Select */}
            <ModernSelect
              label="Select Supplier"
              icon="🏭"
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              options={supplierOptions}
              placeholder="Choose a supplier..."
              disabled={suppliersLoading}
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

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Cost</label>
              <div className="flex items-center gap-2">
                <span className="text-xl text-gray-600">💵</span>
                <input
                  type="number"
                  step="0.01"
                  value={selectedPrice}
                  onChange={e => setSelectedPrice(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleAddItem}
              disabled={!selectedProduct || !selectedPrice}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>➕</span>
              <span>Add Item to Order</span>
            </button>

            <div className="my-4 border-t-2 border-gray-200"></div>

            {/* Items List */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Order Items ({items.length})
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
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4">
              <p className="text-sm text-purple-700 font-medium mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(total)}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Receive Purchase Button */}
            <button
              onClick={handleCreatePurchase}
              disabled={loading || !selectedSupplier || items.length === 0}
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
                  <span>Receive Purchase</span>
                </>
              )}
            </button>
          </div>
        </div>
        )}

        {/* Purchases List - Right Panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Recent Purchases
            </h2>
            <button
              onClick={loadPurchases}
              className="text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
              title="Refresh purchases list"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="p-6">
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">No purchases recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">🏭 Supplier</th>
                      <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">💰 Total</th>
                      <th className="text-center px-4 py-3 text-sm font-bold text-gray-700">✓ Status</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">📅 Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(purchase => {
                      const supplier = suppliers.find(s => s.id === purchase.supplier_id);
                      return (
                        <tr
                          key={purchase.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">{supplier?.name || '❓ Unknown'}</td>
                          <td className="px-4 py-3 text-right font-bold text-purple-600">{formatCurrency(purchase.total)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              purchase.status === 'RECEIVED'
                                ? 'bg-green-100 text-green-800'
                                : purchase.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {purchase.status === 'RECEIVED' ? '✅' : purchase.status === 'PENDING' ? '⏳' : '❌'}
                              {purchase.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {new Date(purchase.created_at).toLocaleDateString('es-ES', {
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
