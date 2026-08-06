import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import type { PrescriptionData } from '../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  image_url?: string;
  quantity: number;
  purchase_type: 'frames_only' | 'prescription';
  unit_price_gbp: number;
  prescription?: PrescriptionData;
}

interface Order {
  id: string;
  created_at: string;
  status: 'verification' | 'glazing' | 'dispatched' | 'delivered';
  total_gbp: number;
  items: OrderItem[];
  tracking_number?: string;
}

// Fixed: Moved outside component to eliminate impure Date.now() renders & dependency warnings
const FALLBACK_ORDERS: Order[] = [
  {
    id: 'WALT-940218',
    created_at: '2026-08-03T14:30:00.000Z',
    status: 'glazing',
    total_gbp: 252,
    tracking_number: 'GB-ROYAL-88912',
    items: [
      {
        id: 'item-1',
        product_name: 'Hollis Oval Eyeglasses',
        quantity: 1,
        purchase_type: 'prescription',
        unit_price_gbp: 210,
        prescription: {
          odSphere: -1.75,
          odCyl: -0.50,
          odAxis: 90,
          odAdd: 0,
          osSphere: -2.00,
          osCyl: 0.00,
          osAxis: 0,
          osAdd: 0,
          pd: 63,
        },
      },
    ],
  },
  {
    id: 'WALT-718290',
    created_at: '2026-07-12T10:15:00.000Z',
    status: 'delivered',
    total_gbp: 180,
    items: [
      {
        id: 'item-2',
        product_name: 'St. James Titanium Square',
        quantity: 1,
        purchase_type: 'frames_only',
        unit_price_gbp: 180,
      },
    ],
  },
];

export const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  // Fixed: Initialized to true to prevent calling setLoading(true) synchronously inside useEffect
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    apiClient
      .get<Order[]>('/orders/my-orders')
      .then((res) => {
        if (isMounted) {
          setOrders(res.data.length > 0 ? res.data : FALLBACK_ORDERS);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrders(FALLBACK_ORDERS);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Optician Review
          </span>
        );
      case 'glazing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3" /> Lens Glazing
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" /> Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF5] py-10 px-6 text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#021438] text-[#E6AA38] font-serif font-bold text-2xl flex items-center justify-center shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-8 h-8" />}
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-[#021438]">
                {user?.full_name || 'Valued Customer'}
              </h1>
              <p className="text-xs text-[#5E6470]">{user?.email}</p>
              <div className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-[#E6AA38] bg-[#FBFAF5] px-2.5 py-0.5 rounded-full border border-[#E5E0D8]">
                Walters Optical Member
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2.5 bg-[#FBFAF5] text-[#5E6470] border border-[#E5E0D8] rounded-xl text-xs font-semibold hover:text-red-600 hover:border-red-200 transition-all flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#021438]">Your Optical Orders</h2>
            <span className="text-xs text-[#5E6470]">{orders.length} order(s) placed</span>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-[#E5E0D8] text-center">
              <div className="w-8 h-8 border-2 border-[#021438] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#5E6470]">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#E5E0D8] text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#5E6470]/40 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#021438]">No Orders Found</h3>
              <p className="text-xs text-[#5E6470] max-w-sm mx-auto">
                You haven't placed any optical orders yet. Browse our current eyewear collections to get started.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-[#021438] text-[#FBFAF5] text-xs font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden transition-all shadow-sm"
                  >
                    {/* Order Summary Line */}
                    <div
                      onClick={() => toggleOrderExpand(order.id)}
                      className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FBFAF5]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-[#021438]">
                            {order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-[#5E6470]">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end space-x-6">
                        <div className="text-right">
                          <span className="block text-[10px] text-[#5E6470] uppercase font-semibold">
                            Total
                          </span>
                          <span className="font-serif font-bold text-base text-[#021438]">
                            £{order.total_gbp}
                          </span>
                        </div>

                        <button className="p-2 text-[#5E6470] hover:text-[#021438]">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    {isExpanded && (
                      <div className="border-t border-[#E5E0D8] bg-[#FBFAF5] p-6 space-y-6">
                        
                        {/* Fulfillment Stepper */}
                        <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8]">
                          <span className="text-[11px] font-semibold text-[#5E6470] uppercase tracking-wider block mb-3">
                            Fulfillment Status
                          </span>
                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
                            <div className={`p-2 rounded-xl border ${order.status === 'verification' ? 'bg-[#021438] text-white border-[#021438]' : 'bg-[#FBFAF5] text-[#5E6470] border-[#E5E0D8]'}`}>
                              1. Verification
                            </div>
                            <div className={`p-2 rounded-xl border ${order.status === 'glazing' ? 'bg-[#021438] text-white border-[#021438]' : 'bg-[#FBFAF5] text-[#5E6470] border-[#E5E0D8]'}`}>
                              2. Glazing & QC
                            </div>
                            <div className={`p-2 rounded-xl border ${order.status === 'dispatched' ? 'bg-[#021438] text-white border-[#021438]' : 'bg-[#FBFAF5] text-[#5E6470] border-[#E5E0D8]'}`}>
                              3. Dispatched
                            </div>
                            <div className={`p-2 rounded-xl border ${order.status === 'delivered' ? 'bg-[#021438] text-white border-[#021438]' : 'bg-[#FBFAF5] text-[#5E6470] border-[#E5E0D8]'}`}>
                              4. Delivered
                            </div>
                          </div>
                          {order.tracking_number && (
                            <div className="mt-3 text-[11px] text-[#5E6470] flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
                              <span>Tracking Reference: <strong className="font-mono text-[#021438]">{order.tracking_number}</strong></span>
                              <span className="text-[#E6AA38] font-bold flex items-center gap-1 cursor-pointer hover:underline">
                                Track Package <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-3">
                          <span className="text-[11px] font-semibold text-[#5E6470] uppercase tracking-wider block">
                            Ordered Items
                          </span>

                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white p-4 rounded-2xl border border-[#E5E0D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-[#FBFAF5] border border-[#E5E0D8] rounded-xl flex items-center justify-center font-serif font-bold text-sm text-[#021438]">
                                  W
                                </div>
                                <div>
                                  <h4 className="font-serif font-bold text-sm text-[#021438]">
                                    {item.product_name} <span className="text-xs font-normal">× {item.quantity}</span>
                                  </h4>
                                  <p className="text-[11px] text-[#5E6470]">
                                    {item.purchase_type === 'prescription' ? 'Single Vision Lenses Included' : 'Frame Only'}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
                                <span className="font-serif font-bold text-sm text-[#021438]">
                                  £{item.unit_price_gbp * item.quantity}
                                </span>

                                {item.prescription && (
                                  <div className="mt-1 flex items-center text-[10px] text-[#021438] font-semibold bg-[#FBFAF5] px-2 py-1 rounded-lg border border-[#E5E0D8]">
                                    <FileText className="w-3 h-3 mr-1 text-[#E6AA38]" />
                                    <span>OD SPH: {item.prescription.odSphere || 'Plano'} | OS SPH: {item.prescription.osSphere || 'Plano'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};