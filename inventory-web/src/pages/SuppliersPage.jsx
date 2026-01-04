import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks';

export default function SuppliersPage() {
  const { profile } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  // Check if user is tester (view-only mode)
  const isTester = profile?.role === 'tester';

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error loading suppliers:', error);
    }
    
    setSuppliers(data || []);
    setLoading(false);
  }

  async function handleAddSupplier(e) {
    e.preventDefault();
    const { error } = await supabase.from('suppliers').insert([formData]);
    if (!error) {
      setFormData({ name: '', email: '', phone: '', address: '' });
      setShowAddModal(false);
      loadSuppliers();
    }
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setShowEditModal(true);
  }

  async function handleEditSupplier(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('suppliers')
      .update(formData)
      .eq('id', editingSupplier.id);
    
    if (!error) {
      setFormData({ name: '', email: '', phone: '', address: '' });
      setEditingSupplier(null);
      setShowEditModal(false);
      loadSuppliers();
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Suppliers</h1>
          <p className="text-gray-600">Manage supplier relationships and procurement contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          Add supplier
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No suppliers found. Add your first supplier to get started.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name || supplier.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{supplier.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{supplier.phone || supplier.telefono || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{supplier.address || supplier.direccion || '—'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button 
                      onClick={() => openEditModal(supplier)}
                      className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add new supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isTester ? 'View supplier' : 'Edit supplier'}
            </h2>
            {isTester && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">View only:</span> Tester accounts cannot edit supplier data.
                </p>
              </div>
            )}
            <form onSubmit={isTester ? (e) => e.preventDefault() : handleEditSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => !isTester && setFormData({ ...formData, name: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => !isTester && setFormData({ ...formData, email: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => !isTester && setFormData({ ...formData, phone: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => !isTester && setFormData({ ...formData, address: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows="2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingSupplier(null); }} className="btn-secondary flex-1">
                  Cancel
                </button>
                {!isTester && (
                  <button type="submit" className="btn-primary flex-1">
                    Save changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
