import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';

export default function SuppliersPage() {
  const { hasFeature } = useDemo();

  if (!hasFeature('suppliers')) {
    return <LockedFeature featureName="Supplier Management" requiredLicense="Enterprise Suite" />;
  }

  const { profile } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  // Check if user is tester or demo (view-only mode)
  const isTester = profile?.role === 'tester' || profile?.is_test_user;

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Handle auto-opening supplier from Global Search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const supplierId = params.get('id');
    if (supplierId && suppliers.length > 0) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
        openEditModal(supplier);
        // Clean URL without refresh
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [suppliers]);

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
    return <PageLoader message="Loading supplier directory..." />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Suppliers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage supplier relationships and procurement contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          Add supplier
        </button>
      </div>

      {/* Suppliers Display (Responsive) */}
      <div className="space-y-4">
        {suppliers.length === 0 ? (
          <div className="card px-6 py-8 text-center text-gray-500">
            No suppliers found. Add your first supplier to get started.
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="card p-5 border-l-4 border-l-purple-500 active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => openEditModal(supplier)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{supplier.name || supplier.nombre}</h3>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">Supplier</span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📧</span> {supplier.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📱</span> {supplier.phone || supplier.telefono || 'No phone'}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📍</span> <span className="line-clamp-1">{supplier.address || supplier.direccion || 'No address'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">Edit Supplier &gt;</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{supplier.name || supplier.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{supplier.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{supplier.phone || supplier.telefono || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{supplier.address || supplier.direccion || '—'}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="text-blue-600 hover:text-blue-800 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add new supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => !isTester && setFormData({ ...formData, email: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => !isTester && setFormData({ ...formData, phone: e.target.value })}
                  disabled={isTester}
                  className={`input-field ${isTester ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
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
