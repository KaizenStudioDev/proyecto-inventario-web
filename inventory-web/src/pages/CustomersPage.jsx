import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';

export default function CustomersPage() {
  const { hasFeature } = useDemo();

  if (!hasFeature('customers')) {
    return <LockedFeature featureName="Customer Database" requiredLicense="Inventory + Sales" />;
  }

  const { profile } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  // Check if user is tester or demo (view-only mode)
  const isTester = profile?.role === 'tester' || profile?.is_test_user;

  useEffect(() => {
    loadCustomers();
  }, []);

  // Handle auto-opening customer from Global Search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('id');
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        openEditModal(customer);
        // Clean URL without refresh
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [customers]);

  async function loadCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error loading customers:', error);
    }

    setCustomers(data || []);
    setLoading(false);
  }

  async function handleAddCustomer(e) {
    e.preventDefault();
    const { error } = await supabase.from('customers').insert([formData]);
    if (!error) {
      setFormData({ name: '', email: '', phone: '', address: '' });
      setShowAddModal(false);
      loadCustomers();
    }
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowEditModal(true);
  }

  async function handleEditCustomer(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('customers')
      .update(formData)
      .eq('id', editingCustomer.id);

    if (!error) {
      setFormData({ name: '', email: '', phone: '', address: '' });
      setEditingCustomer(null);
      setShowEditModal(false);
      loadCustomers();
    }
  }

  if (loading) {
    return <PageLoader message="Loading customer database..." />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer relationships and contact information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          Add customer
        </button>
      </div>

      {/* Customers Display (Responsive) */}
      <div className="space-y-4">
        {customers.length === 0 ? (
          <div className="card px-6 py-8 text-center text-gray-500">
            No customers found. Add your first customer to get started.
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="card p-5 border-l-4 border-l-green-500 active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => openEditModal(customer)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{customer.name || customer.nombre}</h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Customer</span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📧</span> {customer.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📱</span> {customer.phone || customer.telefono || 'No phone'}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>📍</span> <span className="line-clamp-1">{customer.address || customer.direccion || 'No address'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">Edit Profile &gt;</button>
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
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{customer.name || customer.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{customer.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{customer.phone || customer.telefono || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{customer.address || customer.direccion || '—'}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => openEditModal(customer)}
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add new customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
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
                  Add customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isTester ? 'View customer' : 'Edit customer'}
            </h2>
            {isTester && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">View only:</span> Tester accounts cannot edit customer data.
                </p>
              </div>
            )}
            <form onSubmit={isTester ? (e) => e.preventDefault() : handleEditCustomer} className="space-y-4">
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
                <button type="button" onClick={() => { setShowEditModal(false); setEditingCustomer(null); }} className="btn-secondary flex-1">
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
