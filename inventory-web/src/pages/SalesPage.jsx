import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCustomers, useProducts, formatCurrency, useAuth } from '../lib/hooks';
import ModernSelect from '../components/ModernSelect';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';

export default function SalesPage() {
  const { hasFeature } = useDemo();

  if (!hasFeature('sales')) {
    return <LockedFeature featureName="Sales Management" requiredLicense="Inventory + Sales" />;
  }

  const { profile } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();
  const { products, refetch: refetchProducts } = useProducts();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load sales on component mount
  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    setSales(data || []);
  }

  // Calculate sales metrics - use all completed sales regardless of month
  const completedSales = sales.filter(s => s.status === 'COMPLETED').length;

  const totalSalesAmount = sales
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const averageSaleAmount = completedSales > 0 ? totalSalesAmount / completedSales : 0;

  // If profile not loaded yet, show loading
  if (!profile || (customersLoading && sales.length === 0)) {
    return <PageLoader message="Initializing sales module..." />;
  }

  // Check permissions: all can view sales, only admin/vendedor/tester can create
  const canViewSales = ['admin', 'vendedor', 'contabilidad', 'tester'].includes(profile.role);
  const canCreateSales = ['admin', 'vendedor', 'tester'].includes(profile.role);

  // If user doesn't have permission to view sales, deny access
  if (!canViewSales) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold text-red-900">Access denied</p>
          <p className="text-red-700 mt-2">Your role ({profile.role}) does not have permission to access sales.</p>
        </div>
      </div>
    );
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
    // Validations with specific error messages
    if (!selectedCustomer) {
      setError('⚠️ Please select a customer before completing the sale');
      return;
    }

    if (items.length === 0) {
      setError('⚠️ Please add at least one product to the cart');
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

      // Reload sales and products to show updated stock
      await loadSales();
      await refetchProducts();
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
    description: c.email || '',
  }));

  const productOptions = products.map(p => ({
    value: p.id,
    label: p.name,
    description: `Stock: ${p.stock} | Price: ${formatCurrency(p.unit_price)}`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">Sales</h1>
        <p className="text-gray-600 dark:text-gray-400">Record and manage customer transactions</p>
        {!canCreateSales && (
          <div className="mt-3 bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">View only mode</p>
            <p>Your role ({profile?.role}) can view sales but cannot create new ones.</p>
          </div>
        )}
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Sales Amount</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{formatCurrency(totalSalesAmount)}</div>
          <div className="text-[11px] text-gray-500 mt-1">{completedSales} transactions</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Average Sale</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">
            {formatCurrency(averageSaleAmount)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Per transaction</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Sales</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{sales.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">All records</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sale - Left Panel (Only show if user can create) */}
        {canCreateSales && (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New sale</h2>
              <span className="text-xs text-gray-500">Customer & items</span>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Select */}
              <ModernSelect
                label="Select Customer *"
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
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
                <span>Add item</span>
              </button>

              <div className="my-4 border-t-2 border-gray-200"></div>

              {/* Items List */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  Cart items ({items.length})
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white text-right">{formatCurrency(total)}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 text-red-800 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Validation warning when customer not selected */}
              {!selectedCustomer && items.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-400 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
                  ⚠️ Please select a customer to complete this sale
                </div>
              )}

              {/* Complete Sale Button */}
              <button
                onClick={handleCreateSale}
                disabled={loading || !selectedCustomer || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!selectedCustomer ? 'Select a customer first' : items.length === 0 ? 'Add items to cart' : 'Complete sale'}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete sale</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sales List - Right Panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent sales</h2>
            <button
              onClick={loadSales}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Refresh sales list"
            >
              Refresh
            </button>
          </div>

          <div className="p-6">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-700 font-medium">No sales recorded yet</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Sales Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden pb-6">
                  {sales.map(sale => {
                    const customer = customers.find(c => c.id === sale.customer_id);
                    return (
                      <div key={sale.id} className="card p-4 border-l-4 border-l-indigo-500 active:scale-[0.98] transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Customer</p>
                            <p className="font-bold text-gray-900 dark:text-white truncate">{customer?.name || 'Unknown'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sale.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}>
                            {sale.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Sales Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Customer</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Total</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(sale => {
                        const customer = customers.find(c => c.id === sale.customer_id);
                        return (
                          <tr
                            key={sale.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{customer?.name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sale.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : sale.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {sale.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
