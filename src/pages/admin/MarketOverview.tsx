// src/pages/admin/MarketOverview.tsx
import React, { useEffect, useState } from 'react';
import { Award, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { adminApi } from '../../api/admin';
import { type MarketOverviewAnalytics} from '../../types/admin';
import { formatPrice } from '../../utils/formatter';

export const AdminMarketOverview: React.FC = () => {
  const [analytics, setAnalytics] = useState<MarketOverviewAnalytics | null>(null);

  useEffect(() => {
    adminApi.getOverviewAnalytics(30).then(setAnalytics).catch(console.error);
  }, []);

  if (!analytics) {
    return <div className="p-8 text-center text-xs text-slate">Loading market analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Market Overview & Sales Intelligence</h1>
        <p className="text-xs text-slate mt-1">
          Revenue movement, fast-selling frames, and slow stock performance.
        </p>
      </div>

      {/* Revenue Graph */}
      <div className="p-5 bg-white border border-border rounded-2xl space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Sales Trend (30 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.sales_trend}>
              <XAxis dataKey="date" stroke="#5E6470" fontSize={10} />
              <YAxis stroke="#5E6470" fontSize={10} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1B75BC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Sellers vs Slow Moving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Moving */}
        <div className="p-5 bg-white border border-border rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Award className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Top Moving Frames</h3>
          </div>
          <div className="divide-y divide-border">
            {analytics.top_moving_products.map((item) => (
              <div key={item.product_id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-navy">{item.name}</p>
                  <p className="text-[10px] text-slate">{item.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700">{item.total_quantity_sold} sold</p>
                  <p className="text-[10px] text-slate">{formatPrice(item.total_revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving */}
        <div className="p-5 bg-white border border-border rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-rose-500">
            <AlertCircle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Slow Moving Inventory</h3>
          </div>
          <div className="divide-y divide-border">
            {analytics.slow_moving_products.map((item) => (
              <div key={item.product_id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-navy">{item.name}</p>
                  <p className="text-[10px] text-slate">{item.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600">{item.stock_quantity} remaining</p>
                  <p className="text-[10px] text-slate">{formatPrice(item.price_full_gbp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};