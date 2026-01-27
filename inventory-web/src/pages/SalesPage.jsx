import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth, useCustomers, useProducts } from '../lib/hooks';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';
import { useTranslation } from 'react-i18next';

export default function SalesPage() {
  const { t, i18n } = useTranslation();
  const { hasFeature } = useDemo();

  if (!hasFeature('sales')) {
    return <LockedFeature featureName={t('sales.title')} requiredLicense="Inventory + Sales" />;
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
    return <PageLoader message={t('sales.loading')} />;
  }

  // Check permissions: all can view sales, only admin/vendedor/tester can create
  const canViewSales = ['admin', 'vendedor', 'contabilidad', 'tester'].includes(profile.role);
  const canCreateSales = ['admin', 'vendedor', 'tester'].includes(profile.role);

  // If user doesn't have permission to view sales, deny access
  if (!canViewSales) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold text-red-900">{t('common.access_denied')}</p>
          <p className="text-red-700 mt-2">{t('common.no_permission', { role: profile.role, feature: t('nav.sales').toLowerCase() })}</p>
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
      setError(`⚠️ ${t('sales.error_no_customer')}`);
      return;
    }

    if (items.length === 0) {
      setError(`⚠️ ${t('sales.error_no_items')}`);
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
    description: `Stock: ${p.stock} | ${t('common.unit_price')}: ${formatCurrency(p.unit_price)}`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">{t('nav.sales')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('sales.subtitle')}</p>
        {!canCreateSales && (
          <div className="mt-3 bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">{t('common.view_only')}</p>
            <p>{t('common.view_only_notice', { role: profile?.role, feature: t('nav.sales').toLowerCase() })}</p>
          </div>
        )}
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">{t('sales.total_sale_amount')}</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{formatCurrency(totalSalesAmount)}</div>
          <div className="text-[11px] text-gray-500 mt-1">{completedSales} {t('sales.transactions')}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">{t('sales.average_sale')}</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">
            {formatCurrency(averageSaleAmount)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('sales.per_transaction')}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wide text-gray-500">{t('sales.total_records')}</div>
          <div className="text-2xl lg:text-3xl font-bold text-center mt-2">{sales.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">{t('sales.all_records')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sale - Left Panel (Only show if user can create) */}
        {canCreateSales && (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sales.new_sale')}</h2>
              <span className="text-xs text-gray-500">{t('sales.customer_items')}</span>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Select */}
              <ModernSelect
                label={`${t('sales.customer')} *`}
                icon="👤"
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={customerOptions}
                placeholder={t('sales.select_customer')}
                disabled={customersLoading}
              />

              {/* Product Select */}
              <ModernSelect
                label={t('products.catalog')}
                icon="📦"
                value={selectedProduct}
                onChange={setSelectedProduct}
                options={productOptions}
                placeholder={t('sales.select_product')}
              />

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('common.quantity')}</label>
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
                <span>{t('buttons.add_item')}</span>
              </button>

              <div className="my-4 border-t-2 border-gray-200"></div>

              {/* Items List */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  {t('sales.cart_items', { count: items.length })}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <p className="text-sm">{t('sales.no_items')}</p>
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
                          title={t('buttons.remove')}
                        >
                          {t('buttons.remove')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">{t('common.total')}</p>
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
                  ⚠️ {t('sales.error_no_customer')}
                </div>
              )}

              {/* Complete Sale Button */}
              <button
                onClick={handleCreateSale}
                disabled={loading || !selectedCustomer || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!selectedCustomer ? t('sales.error_no_customer') : items.length === 0 ? t('sales.error_no_items') : t('buttons.complete_sale')}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    <span>{t('buttons.processing')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('buttons.complete_sale')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sales List - Right Panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sales.recent_sales')}</h2>
            <button
              onClick={loadSales}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title={t('buttons.refresh')}
            >
              {t('buttons.refresh')}
            </button>
          </div>

          <div className="p-6">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-700 font-medium">{t('common.no_data')}</p>
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
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{t('sales.customer')}</p>
                            <p className="font-bold text-gray-900 dark:text-white truncate">{customer?.name || t('common.no_data')}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sale.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}>
                            {t(`sales.status_${sale.status.toLowerCase()}`)}
                          </span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{t('common.total')}</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString(i18n.language)}
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
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('sales.customer')}</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('common.total')}</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('common.status')}</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('common.date')}</th>
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
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{customer?.name || t('common.no_data')}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sale.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : sale.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {t(`sales.status_${sale.status.toLowerCase()}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                              {new Date(sale.created_at).toLocaleDateString(i18n.language, {
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
