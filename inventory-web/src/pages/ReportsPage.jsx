import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth, useProducts } from '../lib/hooks';
import LockedFeature from '../components/LockedFeature';
import { useDemo } from '../lib/DemoContext';
import PageLoader from '../components/PageLoader';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const { hasFeature } = useDemo();

  if (!hasFeature('reports')) {
    return <LockedFeature featureName={t('reports.title')} requiredLicense="Inventory + Sales" />;
  }

  const { profile } = useAuth();
  const { products } = useProducts();
  const [reportType, setReportType] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Permission check: admin and accounting can view all reports
  const canViewReports = ['admin', 'contabilidad', 'tester'].includes(profile?.role);

  const getDateRangeFilters = () => {
    let from = null;
    let to = null;

    // Parse dateFrom: treat as start of day in UTC
    if (dateFrom) {
      // dateFrom comes as YYYY-MM-DD from input[type="date"]
      const [year, month, day] = dateFrom.split('-').map(Number);
      from = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    // Parse dateTo: treat as end of day in UTC
    if (dateTo) {
      // dateTo comes as YYYY-MM-DD from input[type="date"]
      const [year, month, day] = dateTo.split('-').map(Number);
      to = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    }

    return {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
    };
  };

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
      const cat = p.category || t('common.not_specified');
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
        [t('reports.table.name')]: p.name,
        [t('reports.table.sku')]: p.sku,
        [t('reports.table.category')]: p.category || t('common.n_a'),
        [t('reports.table.stock')]: p.stock,
        [t('reports.table.unit_price')]: p.unit_price,
        [t('reports.table.total_value')]: p.stock * p.unit_price,
        [t('reports.table.status')]: p.stock === 0 ? t('products.out_of_stock') : p.stock <= p.min_stock ? t('products.low_stock') : t('products.in_stock')
      }))
    });
  }

  async function generateSalesReport() {
    // Get sales with customer info
    const { from, to } = getDateRangeFilters();

    let query = supabase
      .from('sales')
      .select(`
        *,
        customers(name),
        sale_items(qty, unit_price, products(name, sku))
      `);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: sales } = await query.order('created_at', { ascending: false });

    if (!sales || sales.length === 0) {
      setReportData({ type: 'sales', summary: {}, chartData: [], tableData: [] });
      return;
    }

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const completedSales = sales.filter(s => s.status === 'COMPLETED').length;

    // Group by month
    const byMonth = sales.reduce((acc, s) => {
      const month = new Date(s.created_at).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, count: 0, revenue: 0 };
      }
      acc[month].count++;
      acc[month].revenue += s.total || 0;
      return acc;
    }, {});

    // Flatten sale items for table
    const tableData = [];
    sales.forEach(sale => {
      if (sale.sale_items && sale.sale_items.length > 0) {
        sale.sale_items.forEach(item => {
          tableData.push({
            [t('reports.table.date')]: new Date(sale.created_at).toLocaleDateString(i18n.language),
            [t('reports.table.customer')]: sale.customers?.name || t('common.n_a'),
            [t('reports.table.product')]: item.products?.name || t('common.n_a'),
            [t('reports.table.quantity')]: item.qty,
            [t('reports.table.total_price')]: item.qty * item.unit_price,
            [t('reports.table.status')]: t(`sales.status_${sale.status.toLowerCase()}`)
          });
        });
      }
    });

    setReportData({
      type: 'sales',
      summary: { totalSales, totalRevenue, completedSales },
      chartData: Object.values(byMonth).slice(-6),
      tableData
    });
  }

  async function generatePurchasesReport() {
    // Get purchases with supplier info
    const { from, to } = getDateRangeFilters();

    let query = supabase
      .from('purchases')
      .select(`
        *,
        suppliers(name),
        purchase_items(qty, unit_price, products(name, sku))
      `);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: purchases } = await query.order('created_at', { ascending: false });

    if (!purchases || purchases.length === 0) {
      setReportData({ type: 'purchases', summary: {}, chartData: [], tableData: [] });
      return;
    }

    const totalPurchases = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const receivedPurchases = purchases.filter(p => p.status === 'RECEIVED').length;

    // Group by month
    const byMonth = purchases.reduce((acc, p) => {
      const month = new Date(p.created_at).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, count: 0, cost: 0 };
      }
      acc[month].count++;
      acc[month].cost += p.total || 0;
      return acc;
    }, {});

    // Flatten purchase items for table
    const tableData = [];
    purchases.forEach(purchase => {
      if (purchase.purchase_items && purchase.purchase_items.length > 0) {
        purchase.purchase_items.forEach(item => {
          tableData.push({
            [t('reports.table.date')]: new Date(purchase.created_at).toLocaleDateString(i18n.language),
            [t('reports.table.supplier')]: purchase.suppliers?.name || t('common.n_a'),
            [t('reports.table.product')]: item.products?.name || t('common.n_a'),
            [t('reports.table.quantity')]: item.qty,
            [t('reports.table.total_price')]: item.qty * item.unit_price,
            [t('reports.table.status')]: t(`purchases.status_${purchase.status.toLowerCase()}`)
          });
        });
      }
    });

    setReportData({
      type: 'purchases',
      summary: { totalPurchases, totalCost, receivedPurchases },
      chartData: Object.values(byMonth).slice(-6),
      tableData
    });
  }

  async function generateMovementsReport() {
    const { from, to } = getDateRangeFilters();

    // Query stock_movements table (populated by triggers on sale_items/purchase_items)
    let query = supabase
      .from('stock_movements')
      .select('id, created_at, product_id, type, delta, previous_stock, new_stock, notes, products(name, sku)');

    // Only apply date filters if specified
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: movements, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching movements:', error);
      setReportData({ type: 'movements', summary: {}, chartData: [], tableData: [] });
      return;
    }

    if (!movements || movements.length === 0) {
      setReportData({ type: 'movements', summary: {}, chartData: [], tableData: [] });
      return;
    }

    // Map directly from database records
    const tableData = movements.map(m => ({
      [t('reports.table.date')]: new Date(m.created_at).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      [t('reports.table.product')]: m.products?.name || `${t('common.product')} ${m.product_id}`,
      [t('reports.table.type')]: (m.type || t('common.n_a')).toUpperCase(),
      [t('reports.table.quantity')]: Number(m.delta || 0),
      [t('reports.table.stock_before')]: Number(m.previous_stock || 0),
      [t('reports.table.stock_after')]: Number(m.new_stock || 0),
      [t('reports.table.notes')]: m.notes || '—'
    }));

    const totalMovements = movements.length;
    const stockIn = movements.filter(m => (m.delta || 0) > 0).reduce((sum, m) => sum + (m.delta || 0), 0);
    const stockOut = movements.filter(m => (m.delta || 0) < 0).reduce((sum, m) => sum + Math.abs(m.delta || 0), 0);

    // Group by type for chart
    const byType = movements.reduce((acc, m) => {
      const type = (m.type || 'Unknown').toUpperCase();
      if (!acc[type]) {
        acc[type] = { type, count: 0, quantity: 0 };
      }
      acc[type].count += 1;
      acc[type].quantity += Number(m.delta || 0);
      return acc;
    }, {});

    setReportData({
      type: 'movements',
      summary: { totalMovements, stockIn, stockOut },
      chartData: Object.values(byType),
      tableData
    });
  }

  function handleExportPDF() {
    if (!reportData || !reportData.tableData) return;

    const headers = Object.keys(reportData.tableData[0]);

    // Transform object data to array of arrays for jspdf-autotable
    const data = reportData.tableData.map(row =>
      Object.values(row).map((val, i) => {
        // Format currency values
        if (typeof val === 'number' && (
          Object.keys(row)[i].includes(t('reports.table.unit_price')) ||
          Object.keys(row)[i].includes(t('reports.table.total_value')) ||
          Object.keys(row)[i].includes(t('reports.table.total_price'))
        )) {
          return formatCurrency(val);
        }
        return val;
      })
    );

    exportToPDF({
      title: `${t(`reports.types.${reportType}`)} ${t('nav.reports')}`,
      columns: headers,
      data: data,
      filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`
    });
  }

  function exportToCSV() {
    if (!reportData || !reportData.tableData) return;

    // Use Papaparse to unparse the data to CSV format
    const csvContent = Papa.unparse(reportData.tableData, {
      quotes: true, // Quote all fields to handle commas/newlines correctly
      delimiter: ',',
      header: true
    });

    // Add BOM for Excel UTF-8 recognition
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('common.access_denied')}</h1>
        <p className="text-gray-600">{t('common.no_permission', { role: profile?.role, feature: t('nav.reports').toLowerCase() })}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">{t('reports.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('reports.subtitle')}</p>
      </div>

      {/* Filters Card */}
      <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('reports.type_label')}</label>
            <select
              className="input-field"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="inventory">{t('reports.types.inventory')}</option>
              <option value="sales">{t('reports.types.sales')}</option>
              <option value="purchases">{t('reports.types.purchases')}</option>
              <option value="movements">{t('reports.types.movements')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('reports.from_label')}</label>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('reports.to_label')}</label>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? t('buttons.generating') : t('buttons.generate')}
            </button>
          </div>
        </div>
      </div>

      {loading && <PageLoader message={`Calculating ${reportType} data...`} />}

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {t(`reports.summaries.${key}`)}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof value === 'number' && (key.toLowerCase().includes('value') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('cost'))
                    ? formatCurrency(value)
                    : value.toLocaleString(i18n.language)}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {reportData.chartData && reportData.chartData.length > 0 && (
            <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('reports.visual_analysis')}</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey={reportData.type === 'inventory' ? 'category' : reportData.type === 'movements' ? 'type' : 'month'}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#f3f4f6',
                      borderRadius: '0.5rem'
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend />
                  {reportData.type === 'inventory' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name={t('reports.charts.products')} />
                      <Bar dataKey="stock" fill="#10b981" name={t('reports.charts.total_stock')} />
                    </>
                  )}
                  {reportData.type === 'sales' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name={t('reports.charts.sales_count')} />
                      <Bar dataKey="revenue" fill="#10b981" name={t('reports.charts.revenue')} />
                    </>
                  )}
                  {reportData.type === 'purchases' && (
                    <>
                      <Bar dataKey="count" fill="#3b82f6" name={t('reports.charts.purchase_count')} />
                      <Bar dataKey="cost" fill="#f59e0b" name={t('reports.charts.total_cost')} />
                    </>
                  )}
                  {reportData.type === 'movements' && (
                    <Bar dataKey="count" fill="#3b82f6" name={t('reports.charts.movement_count')} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Export and Table */}
          <div className="card p-0 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('reports.detailed_data')}</h2>
              <div className="flex gap-2">
                <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2 text-sm">
                  <span>📄</span> {t('buttons.download_pdf')}
                </button>
                <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 text-sm">
                  <span>📊</span> {t('buttons.export_csv')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {reportData.tableData[0] && Object.keys(reportData.tableData[0]).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {reportData.tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {typeof val === 'number' && (
                            Object.keys(row)[i].includes(t('reports.table.unit_price')) ||
                            Object.keys(row)[i].includes(t('reports.table.total_value')) ||
                            Object.keys(row)[i].includes(t('reports.table.total_price'))
                          )
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
          <p className="text-gray-600 font-medium">{t('reports.select_prompt')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('reports.date_prompt')}</p>
        </div>
      )}
    </div>
  );
}
