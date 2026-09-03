// src/pages/admin/Overview.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  BarChart2, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { adminApi } from '../../api/admin';
import type { MarketOverviewAnalytics } from '../../types/admin';
import { formatPrice } from '../../utils/formatter';

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<MarketOverviewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getOverviewAnalytics(14)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Order Alert Banner */}
      {analytics && analytics.pending_orders_count > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">New Customer Orders Waiting</h4>
              <p className="text-[11px] text-amber-700">
                You have {analytics.pending_orders_count} new orders requiring prescription verification or dispatch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Review Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate mt-1">
          Store overview, recent transaction volume, and quick action shortcuts.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate">
            <span className="text-xs font-medium">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-navy">
            {analytics ? formatPrice(analytics.total_revenue) : '£0.00'}
          </p>
        </div>

        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#1B75BC]" />
          </div>
          <p className="text-2xl font-bold text-navy">
            {analytics ? analytics.total_orders : 0}
          </p>
        </div>

        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <Package className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-navy">
            {analytics ? analytics.low_stock_count : 0}
          </p>
        </div>

        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate">
            <span className="text-xs font-medium">Consultations</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-navy">
            {analytics ? analytics.total_appointments : 0}
          </p>
        </div>
      </div>

      {/* Shortcut Widgets Bar */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Quick Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/inventory')}
            className="p-3 bg-[#F8F6F0] hover:bg-navy text-navy hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <PlusCircle className="w-4 h-4 text-[#1B75BC] group-hover:text-white" />
            <span>Manage Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="relative p-3 bg-[#F8F6F0] hover:bg-navy text-navy hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <ShoppingBag className="w-4 h-4 text-[#1B75BC] group-hover:text-white" />
            <span>Customer Orders</span>
            {analytics && analytics.pending_orders_count > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {analytics.pending_orders_count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/analytics')}
            className="p-3 bg-[#F8F6F0] hover:bg-navy text-navy hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <BarChart2 className="w-4 h-4 text-[#1B75BC] group-hover:text-white" />
            <span>Market Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/bookings')}
            className="p-3 bg-[#F8F6F0] hover:bg-navy text-navy hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <Calendar className="w-4 h-4 text-[#1B75BC] group-hover:text-white" />
            <span>View Bookings</span>
          </button>
        </div>
      </div>

      {/* Mini Revenue Graph */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Sales Revenue Trend (14 Days)</h3>
          <button
            type="button"
            onClick={() => navigate('/admin/analytics')}
            className="text-xs text-[#1B75BC] font-semibold hover:underline"
          >
            Full Analytics &rarr;
          </button>
        </div>

        <div className="h-48 w-full">
          {analytics && analytics.sales_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.sales_trend}>
                <XAxis dataKey="date" stroke="#5E6470" fontSize={10} />
                <YAxis stroke="#5E6470" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#1B75BC" fill="#1B75BC22" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate">
              {isLoading ? 'Loading trend data...' : 'No trend data available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};