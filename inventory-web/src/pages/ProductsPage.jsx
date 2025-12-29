import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProducts, getStockColor, formatCurrency } from '../lib/hooks';

export default function ProductsPage() {
  const { products, loading, error, reload } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', unit_price: '', stock: 0, min_stock: 0 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          + Add Product
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">New Product</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Unit Price" type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Min Stock" type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} />
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-right px-4 py-3">Unit Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3">Min</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.unit_price)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${getStockColor(p.stock, p.min_stock)}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.min_stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
