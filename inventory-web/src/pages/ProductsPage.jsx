import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProducts, getStockColor, formatCurrency, useAuth, useSuppliers, useProductMovements } from '../lib/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLoader from '../components/PageLoader';

export default function ProductsPage() {
  const { profile } = useAuth();
  const { products, loading, error, reload } = useProducts();
  const { suppliers } = useSuppliers();
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { movements, loading: loadingMovements, refetch: refetchMovements } = useProductMovements(selectedProduct?.id);
  const [form, setForm] = useState({ name: '', sku: '', category: '', supplier_id: '', unit_price: '', stock: 0, min_stock: 0 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle auto-opening product from Global Search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setShowDetailModal(true);
        // Clean URL without refresh
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [products]);

  // Auto-generate SKU suggestion
  useEffect(() => {
    if (form.name && !form.sku) {
      const prefix = form.category ? form.category.substring(0, 3).toUpperCase() : 'PRD';
      const namePart = form.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setForm(prev => ({ ...prev, sku: `${prefix}-${namePart}-${random}` }));
    }
  }, [form.name, form.category]);

  // Role-based permissions
  const canCreate = ['admin', 'tester'].includes(profile?.role);
  const canDelete = profile?.role === 'admin';

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.sku.trim()) {
      setFormError('Name and SKU are required');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('products').insert({
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim() || null,
      supplier_id: form.supplier_id || null,
      unit_price: Number(form.unit_price || 0),
      stock: Number(form.stock || 0),
      min_stock: Number(form.min_stock || 0),
    });

    if (error) {
      setFormError(error.message);
    } else {
      setForm({ name: '', sku: '', category: '', supplier_id: '', unit_price: '', stock: 0, min_stock: 0 });
      setShowModal(false);
      reload();
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    reload();
  }

  async function openProductDetail(product) {
    setSelectedProduct(product);
    setShowDetailModal(true);
  }

  // Prepare chart data from movements (last 30 days)
  const chartData = movements
    .filter(m => {
      const movementDate = new Date(m.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return movementDate >= thirtyDaysAgo;
    })
    .reverse()
    .map(m => ({
      date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      stock: m.stock_after
    }));

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">Product Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">Master data for all sellable items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!canCreate}
          className={`flex items-center gap-2 ${canCreate
            ? 'btn-primary'
            : 'px-4 py-2 rounded-lg font-medium text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          title={!canCreate ? 'Only Admin and Tester can create products' : ''}
        >
          <span className="text-sm font-semibold">Add product</span>
        </button>
      </div>

      {/* Search Bar - Full width on mobile, max-width on desktop */}
      <div className="card !p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or SKU"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-12 h-11"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Search</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg animate-scale-in border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Create</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New product</h2>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Catalog</span>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g., Laptop Dell XPS 15"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <input
                    className="input-field"
                    placeholder="e.g., Electronics"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Supplier</label>
                  <select
                    className="input-field"
                    value={form.supplier_id}
                    onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SKU * <span className="text-xs text-gray-500 dark:text-gray-400">(auto-generated)</span></label>
                <input
                  className="input-field"
                  placeholder="e.g., LAP-DELL-001"
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit Price</label>
                  <input
                    className="input-field"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={form.unit_price}
                    onChange={e => setForm({ ...form, unit_price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Initial Stock</label>
                  <input
                    className="input-field"
                    placeholder="0"
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Minimum Stock Level</label>
                <input
                  className="input-field"
                  placeholder="0"
                  type="number"
                  value={form.min_stock}
                  onChange={e => setForm({ ...form, min_stock: e.target.value })}
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Creating...' : 'Create product'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-4xl shadow-lg animate-scale-in border border-gray-200 dark:border-gray-700 my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Product Details</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">{selectedProduct.sku}</span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Product Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card bg-gray-50 dark:bg-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Category</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedProduct.category || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Unit Price</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedProduct.unit_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Stock</span>
                    <span className={`text-sm font-bold ${getStockColor(selectedProduct.stock, selectedProduct.min_stock)}`}>
                      {selectedProduct.stock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Minimum Stock</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedProduct.min_stock} units</span>
                  </div>
                </div>
              </div>

              <div className="card bg-gray-50 dark:bg-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</span>
                    <div>
                      {selectedProduct.stock === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : selectedProduct.stock <= selectedProduct.min_stock ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Supplier</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedProduct.supplier_id
                        ? suppliers.find(s => s.id === selectedProduct.supplier_id)?.name || 'Unknown'
                        : 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Inventory Value</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedProduct.stock * selectedProduct.unit_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Movement History Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Over Time (Last 30 Days)</h3>

              {loadingMovements ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading data...</p>
                </div>
              ) : chartData.length > 1 ? (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stock"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                  <p className="text-gray-600 font-medium">Not enough data for chart</p>
                  <p className="text-gray-500 text-sm mt-1">Chart requires at least 2 data points</p>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-4">Movement History</h3>

              {loadingMovements ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading movements...</p>
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-medium">No movement history available</p>
                  <p className="text-gray-500 text-sm mt-1">Movements will be tracked automatically</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {movements.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${m.movement_type === 'sale' || m.quantity < 0 ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{m.movement_type}</p>
                          <p className="text-sm text-gray-600">{m.notes || 'No notes'}</p>
                          <p className="text-xs text-gray-500">
                            Stock: {m.stock_before} → {m.stock_after}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity} units
                        </p>
                        <p className="text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Products Display (Responsive) */}
      <div className="space-y-4">
        {loading || !profile ? (
          <PageLoader message="Gathering catalog data..." />
        ) : filteredProducts.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-700 font-semibold">No products found</p>
            <p className="text-gray-500 text-sm mt-1">Adjust your search or add a new item.</p>
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {filteredProducts.map(p => (
                <div key={p.id} className="card p-5 border-l-4 border-l-blue-500 active:scale-[0.98] transition-all" onClick={() => openProductDetail(p)}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{p.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{p.sku}</p>
                    </div>
                    {p.stock === 0 ? (
                      <span className="badge badge-danger text-[10px]">Out of Stock</span>
                    ) : p.stock <= p.min_stock ? (
                      <span className="badge badge-warning text-[10px]">Low Stock</span>
                    ) : (
                      <span className="badge badge-success text-[10px]">In Stock</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-y border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Stock</p>
                      <p className={`text-xl font-bold ${getStockColor(p.stock, p.min_stock)}`}>{p.stock}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Price</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(p.unit_price)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-1">
                    <p className="text-xs text-gray-500">Min. Stock: {p.min_stock}</p>
                    <div className="flex gap-2">
                      <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">Details &gt;</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Product</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">SKU</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Price</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Stock</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Min Stock</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Status</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{p.sku}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(p.unit_price)}</span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold text-lg ${getStockColor(p.stock, p.min_stock)}`}>
                          {p.stock}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          {p.min_stock}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {p.stock === 0 ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : p.stock <= p.min_stock ? (
                            <span className="badge badge-warning">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openProductDetail(p)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
                              title="View details"
                            >
                              View
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
                                title="Delete product"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing {filteredProducts.length} of {products.length} products</p>
        <p className="text-gray-500">Data synced with database</p>
      </div>
    </div>
  );
}
