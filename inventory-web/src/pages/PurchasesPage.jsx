import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSuppliers, useProducts, formatCurrency, useAuth } from '../lib/hooks';
import ModernSelect from '../components/ModernSelect';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';

export default function PurchasesPage() {
  const { hasFeature } = useDemo();

  if (!hasFeature('purchases')) {
    return <LockedFeature featureName="Purchase Orders" requiredLicense="Enterprise Suite" />;
  }

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

  // Load purchases on component mount
  useEffect(() => {
    loadPurchases();
  }, []);

  // Auto-select supplier when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product && product.supplier_id) {
        setSelectedSupplier(product.supplier_id);
      }
    }
  }, [selectedProduct, products]);

  // Clear product selection when supplier changes (to avoid mismatches)
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product && selectedSupplier && product.supplier_id !== selectedSupplier) {
        setSelectedProduct('');
      }
    }
  }, [selectedSupplier, selectedProduct, products]);

  async function loadPurchases() {
    const { data } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
    setPurchases(data || []);
  }

  // Calculate purchase metrics - use all received purchases regardless of month
  const receivedPurchases = purchases.filter(p => p.status === 'RECEIVED').length;

  const totalPurchasesAmount = purchases
    .filter(p => p.status === 'RECEIVED')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const averagePurchaseAmount = receivedPurchases > 0 ? totalPurchasesAmount / receivedPurchases : 0;

  // If profile not loaded yet, show loading
  if (!profile || (suppliersLoading && purchases.length === 0)) {
    return <PageLoader message="Initializing procurement module..." />;
  }

  if (!canViewPurchases) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold text-red-900">Access denied</p>
          <p className="text-red-700 mt-2">Your role ({profile.role}) does not have permission to access purchases.</p>
        </div>
      </div>
    );
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
    description: s.contact_person || '',
  }));

  // Filter products by selected supplier if one is selected
  const filteredProducts = selectedSupplier
    ? products.filter(p => p.supplier_id === selectedSupplier)
    : products;

  const productOptions = filteredProducts.map(p => ({
    value: p.id,
    label: p.name,
    description: `Current stock: ${p.stock} units`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">Purchases</h1>
        <p className="text-gray-600 dark:text-gray-400">Record and manage supplier purchase orders</p>
        {!canCreatePurchases && (
          <div className="mt-3 bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">View only mode</p>
            <p>Your role ({profile?.role}) can view purchases but cannot create new ones.</p>
          </div>
        )}
      </div>

      {/* Purchases Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Purchases Amount</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{formatCurrency(totalPurchasesAmount)}</div>
          <div className="text-[11px] text-gray-500 mt-1">{receivedPurchases} orders received</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Average Purchase</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">
            {formatCurrency(averagePurchaseAmount)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Per order</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Purchases</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{purchases.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">All records</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Purchase - Left Panel (Only show if user can create) */}
        {canCreatePurchases && (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New purchase</h2>
              <span className="text-xs text-gray-500">Supplier & items</span>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unit Cost</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-gray-600 dark:text-gray-400">💵</span>
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
                <span>Add item</span>
              </button>

              <div className="my-4 border-t-2 border-gray-200"></div>

              {/* Items List */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  Order items ({items.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <p className="text-sm">No items added yet</p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.qty} × {formatCurrency(item.unit_price)} = <span className="font-bold">{formatCurrency(item.qty * item.unit_price)}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="ml-2 text-red-600 hover:text-red-800 px-2 py-1 rounded-md"
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white text-right">{formatCurrency(total)}</p>
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
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Receive purchase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Purchases List - Right Panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent purchases</h2>
            <button
              onClick={loadPurchases}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Refresh purchases list"
            >
              Refresh
            </button>
          </div>

          <div className="p-6">
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-700 font-medium">No purchases recorded yet</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Purchase Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden pb-6">
                  {purchases.map(purchase => {
                    const supplier = suppliers.find(s => s.id === purchase.supplier_id);
                    return (
                      <div key={purchase.id} className="card p-4 border-l-4 border-l-purple-500 active:scale-[0.98] transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Supplier</p>
                            <p className="font-bold text-gray-900 dark:text-white truncate">{supplier?.name || 'Unknown'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            {purchase.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Cost</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(purchase.total)}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Purchases Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Supplier</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Total</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(purchase => {
                        const supplier = suppliers.find(s => s.id === purchase.supplier_id);
                        return (
                          <tr
                            key={purchase.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{supplier?.name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(purchase.total)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${purchase.status === 'RECEIVED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : purchase.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {purchase.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
