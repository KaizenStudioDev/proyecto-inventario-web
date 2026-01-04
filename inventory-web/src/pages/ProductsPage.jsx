import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProducts, getStockColor, formatCurrency, useAuth } from '../lib/hooks';

export default function ProductsPage() {
  const { profile } = useAuth();
  const { products, loading, error, reload } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', unit_price: '', stock: 0, min_stock: 0 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      unit_price: Number(form.unit_price || 0),
      stock: Number(form.stock || 0),
      min_stock: Number(form.min_stock || 0),
    });

    if (error) {
      setFormError(error.message);
    } else {
      setForm({ name: '', sku: '', unit_price: '', stock: 0, min_stock: 0 });
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Product Catalog</h1>
          <p className="text-gray-600">Master data for all sellable items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!canCreate}
          className={`flex items-center gap-2 ${
            canCreate
              ? 'btn-primary'
              : 'px-4 py-2 rounded-lg font-medium text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
          title={!canCreate ? 'Only Admin and Tester can create products' : ''}
        >
          <span className="text-sm font-semibold">Add product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or SKU"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">Search</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg animate-scale-in border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Create</p>
                <h2 className="text-2xl font-bold text-gray-900">New product</h2>
              </div>
              <span className="text-xs text-gray-500">Catalog</span>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g., Laptop Dell XPS 15"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                <input
                  className="input-field"
                  placeholder="e.g., LAP-DELL-001"
                  value={form.sku}
                  onChange={e => setForm({...form, sku: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Price</label>
                  <input
                    className="input-field"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={form.unit_price}
                    onChange={e => setForm({...form, unit_price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Stock</label>
                  <input
                    className="input-field"
                    placeholder="0"
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Stock Level</label>
                <input
                  className="input-field"
                  placeholder="0"
                  type="number"
                  value={form.min_stock}
                  onChange={e => setForm({...form, min_stock: e.target.value})}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-700 font-semibold">No products found</p>
            <p className="text-gray-500 text-sm mt-1">Adjust your search or add a new item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">SKU</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Price</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Stock</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Min Stock</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{p.sku}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(p.unit_price)}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${getStockColor(p.stock, p.min_stock)}`}>
                      {p.stock}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
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
                      {canDelete ? (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
                          title="Delete product"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm px-3 py-1.5">
                          (No permission)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
