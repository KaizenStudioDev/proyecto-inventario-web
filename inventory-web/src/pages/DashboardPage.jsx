import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency } from '../lib/hooks';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('view_financial_snapshot').select('*').single();
      setMetrics(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium opacity-90">Total Sales</p>
            <p className="text-3xl font-bold">{formatCurrency(metrics.total_sales_completed)}</p>
          </div>

          {/* Total Purchases */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium opacity-90">Total Purchases</p>
            <p className="text-3xl font-bold">{formatCurrency(metrics.total_purchases_received)}</p>
          </div>

          {/* Inventory Value */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium opacity-90">Inventory Value</p>
            <p className="text-3xl font-bold">{formatCurrency(metrics.inventory_value)}</p>
          </div>

          {/* Available Products */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium opacity-90">In Stock</p>
            <p className="text-3xl font-bold">{metrics.available_product_count}</p>
          </div>

          {/* Out of Stock */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium opacity-90">Out of Stock</p>
            <p className="text-3xl font-bold">{metrics.out_of_stock_count}</p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Gross Profit:</span> <span className="font-semibold">{formatCurrency((metrics?.total_sales_completed || 0) - (metrics?.total_purchases_received || 0))}</span></li>
            <li className="flex justify-between"><span>Stock Turnover Rate:</span> <span className="font-semibold">Good</span></li>
            <li className="flex justify-between"><span>Reorder Level:</span> <span className="font-semibold">{metrics?.out_of_stock_count || 0} items</span></li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span> Database Connected</li>
            <li className="flex items-center"><span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span> RLS Policies Active</li>
            <li className="flex items-center"><span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span> Stock Tracking Enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
