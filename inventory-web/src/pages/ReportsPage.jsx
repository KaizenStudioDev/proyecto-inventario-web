import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProducts, formatCurrency, useAuth } from '../lib/hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const { profile } = useAuth();
  const { products } = useProducts();
  const [reportType, setReportType] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Permission check: admin and accounting can view all reports
  const canViewReports = ['admin', 'contabilidad', 'tester'].includes(profile?.role);

  async function generateReport() {
    if (!canViewReports) return;
    
    setLoading(true);
    
    try {
      if (reportType === 'inventory') {
        await generateInventoryReport();
      } else if (reportType === 'sales') {
        await generateSalesReport();
      } else if (reportType === 'purchases') {
        await generatePurchasesReport();
      } else if (reportType === 'movements') {
        await generateMovementsReport();
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }
    
    setLoading(false);
  }

  async function generateInventoryReport() {
    // Calculate inventory metrics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
    const lowStockItems = products.filter(p => p.stock <= p.min_stock);
    const outOfStockItems = products.filter(p => p.stock === 0);
    
    // Group by category
    const byCategory = products.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { category: cat, count: 0, value: 0, stock: 0 };
      }
      acc[cat].count++;
      acc[cat].value += p.stock * p.unit_price;
      acc[cat].stock += p.stock;
      return acc;
    }, {});
    
    setReportData({
      type: 'inventory',
      summary: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      chartData: Object.values(byCategory),
      tableData: products.map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category || 'N/A',
        stock: p.stock,
        unitPrice: p.unit_price,
        totalValue: p.stock * p.unit_price,
        status: p.stock === 0 ? 'Out of Stock' : p.stock <= p.min_stock ? 'Low Stock' : 'In Stock'
      }))
    });
  }

  async function generateSalesReport() {
    const query = supabase
      .from('sales')
      .select('*, productos(name, sku), customers(name)');
    
    if (dateFrom) query.gte('created_at', dateFrom);
    if (dateTo) query.lte('created_at', dateTo);
    
    const { data: sales } = await query;
    
    if (!sales) {
      setReportData({ type: 'sales', summary: {}, chartData: [], tableData: [] });
      return;
    }
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const completedSales = sales.filter(s => s.status === 'completed').length;
    
    // Group by month
    const byMonth = sales.reduce((acc, s) => {
      const month = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, count: 0, revenue: 0 };
      }
      acc[month].count++;
      acc[month].revenue += s.total_price || 0;
      return acc;
    }, {});
    
    setReportData({
      type: 'sales',
      summary: { totalSales, totalRevenue, completedSales },
      chartData: Object.values(byMonth).slice(-6),
      tableData: sales.map(s => ({
        date: new Date(s.created_at).toLocaleDateString(),
        customer: s.customers?.name || 'N/A',
        product: s.productos?.name || 'N/A',
        quantity: s.quantity,
        totalPrice: s.total_price,
        status: s.status
      }))
    });
  }

  async function generatePurchasesReport() {
    const query = supabase
      .from('purchases')
      .select('*, productos(name, sku), suppliers(name)');
    
    if (dateFrom) query.gte('created_at', dateFrom);
    if (dateTo) query.lte('created_at', dateTo);
    
    const { data: purchases } = await query;
    
    if (!purchases) {
      setReportData({ type: 'purchases', summary: {}, chartData: [], tableData: [] });
      return;
    }
    
    const totalPurchases = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + (p.total_price || 0), 0);
    const receivedPurchases = purchases.filter(p => p.status === 'received').length;
    
    // Group by month
    const byMonth = purchases.reduce((acc, p) => {
      const month = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, count: 0, cost: 0 };
      }
      acc[month].count++;
      acc[month].cost += p.total_price || 0;
      return acc;
    }, {});
    
    setReportData({
      type: 'purchases',
      summary: { totalPurchases, totalCost, receivedPurchases },
      chartData: Object.values(byMonth).slice(-6),
      tableData: purchases.map(p => ({
        date: new Date(p.created_at).toLocaleDateString(),
        supplier: p.suppliers?.name || 'N/A',
        product: p.productos?.name || 'N/A',
        quantity: p.quantity,
        totalPrice: p.total_price,
        status: p.status
      }))
    });
  }

  async function generateMovementsReport() {
    const query = supabase
      .from('product_movements')
      .select('*, productos(name, sku)');
    
    if (dateFrom) query.gte('created_at', dateFrom);
    if (dateTo) query.lte('created_at', dateTo);
    
    const { data: movements } = await query.limit(500);
    
    if (!movements) {
      setReportData({ type: 'movements', summary: {}, chartData: [], tableData: [] });
      return;
    }
    
    const totalMovements = movements.length;
    const stockIn = movements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
    const stockOut = movements.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    // Group by type
    const byType = movements.reduce((acc, m) => {
      const type = m.movement_type;
      if (!acc[type]) {
        acc[type] = { type, count: 0, quantity: 0 };
      }
      acc[type].count++;
      acc[type].quantity += m.quantity;
      return acc;
    }, {});
    
    setReportData({
      type: 'movements',
      summary: { totalMovements, stockIn, stockOut },
      chartData: Object.values(byType),
      tableData: movements.map(m => ({
        date: new Date(m.created_at).toLocaleDateString(),
        product: m.productos?.name || 'N/A',
        type: m.movement_type,
        quantity: m.quantity,
        stockBefore: m.stock_before,
        stockAfter: m.stock_after,
        notes: m.notes || 'N/A'
      }))
    });
  }

  function exportToCSV() {
    if (!reportData || !reportData.tableData) return;
    
    const headers = Object.keys(reportData.tableData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.tableData.map(row => 
        headers.map(h => {
          const val = row[h];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (!canViewReports) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to view reports.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
        <p className="text-gray-600">Generate comprehensive business intelligence reports</p>
      </div>

      {/* Filters Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
            <select
              className="input-field"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="inventory">Inventory Valuation</option>
              <option value="sales">Sales Report</option>
              <option value="purchases">Purchases Report</option>
              <option value="movements">Stock Movements</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              disabled={reportType === 'inventory'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              disabled={reportType === 'inventory'}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="card">
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof value === 'number' && key.toLowerCase().includes('value') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('cost')
                    ? formatCurrency(value)
                    : value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {reportData.chartData && reportData.chartData.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Visual Analysis</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey={reportData.type === 'inventory' ? 'category' : reportData.type === 'movements' ? 'type' : 'month'} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Legend />
                  {reportData.type === 'inventory' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name="Products" />
                      <Bar dataKey="stock" fill="#10b981" name="Total Stock" />
                    </>
                  )}
                  {reportData.type === 'sales' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name="Sales Count" />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    </>
                  )}
                  {reportData.type === 'purchases' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name="Purchase Count" />
                      <Bar dataKey="cost" fill="#f59e0b" name="Total Cost" />
                    </>
                  )}
                  {reportData.type === 'movements' && (
                    <Bar dataKey="count" fill="#3b82f6" name="Movement Count" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Export and Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detailed Data</h2>
              <button onClick={exportToCSV} className="btn-secondary">
                Export to CSV
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {reportData.tableData[0] && Object.keys(reportData.tableData[0]).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reportData.tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-6 py-4 text-sm text-gray-900">
                          {typeof val === 'number' && Object.keys(row)[i].toLowerCase().includes('price') || Object.keys(row)[i].toLowerCase().includes('value') || Object.keys(row)[i].toLowerCase().includes('cost')
                            ? formatCurrency(val)
                            : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="text-center py-16 card">
          <p className="text-gray-600 font-medium">Select report type and click "Generate Report"</p>
          <p className="text-gray-500 text-sm mt-1">Choose date range for time-based reports</p>
        </div>
      )}
    </div>
  );
}
