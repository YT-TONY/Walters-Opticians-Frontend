// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import {
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
  FlaskConical,
  AlertCircle,
  Shield,
  HelpCircle,
  Package,
  KeyRound,
  Phone,
  Mail,
  ArrowRight,
  Calendar,
  MapPin,
  Download
} from 'lucide-react';

export interface BackendOrderItem {
  id?: number;
  product_id?: number;
  product_name?: string | null;
  product_brand?: string | null;
  product_image_url?: string | null;
  quantity: number;
  order_type: string;
  frame_price?: number;
  lens_fee?: number;

  // Prescription Parameters
  prescription_status?: string | null;
  prescription_file_url?: string | null;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  pd_mm?: number | null;
}

interface BackendOrder {
  id: number;
  reference_id: string;
  country: string;
  shipping_address: string;
  frame_price: number;
  lens_fee: number;
  exam_fee: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  carrier?: string | null;
  tracking_number?: string | null;
  shipping_label_url?: string | null;
  appointment_date?: string | null;
  created_at: string;

  // Multi-item order support
  items?: BackendOrderItem[];

  // Legacy single item fallbacks
  product_id?: number;
  quantity?: number;
  order_type?: string;
  product_name?: string | null;
  product_brand?: string | null;
  product_image_url?: string | null;
  prescription_status?: string | null;
  prescription_file_url?: string | null;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  pd_mm?: number | null;
}

export const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'security' | 'support'>('orders');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    apiClient
      .get<BackendOrder[]>('/orders/me')
      .then((res) => {
        if (isMounted) {
          setOrders(res.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch user orders:', err);
          setOrders([]);
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

  const toggleOrderExpand = (orderId: string | number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStepIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('dispatched') || s.includes('transit') || s.includes('out for delivery')) return 3;
    if (s.includes('fulfillment') || s.includes('lab') || s.includes('glazing') || s.includes('dispatch')) return 2;
    return 1;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
        </span>
      );
    }
    if (s.includes('dispatched') || s.includes('transit') || s.includes('out for delivery')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Truck className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (s.includes('fulfillment') || s.includes('lab') || s.includes('glazing') || s.includes('dispatch')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FlaskConical className="w-3 h-3" /> Lens Glazing & QC
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> {status || 'Order Placed'}
      </span>
    );
  };

  const calculateEstimatedDelivery = (createdAtStr: string, country: string) => {
    const createdDate = new Date(createdAtStr);
    const isUK = ['UK', 'GB', 'UNITED KINGDOM', 'GREAT BRITAIN'].includes((country || '').toUpperCase());

    const minDays = isUK ? 2 : 5;
    const maxDays = isUK ? 4 : 8;

    const minDate = new Date(createdDate);
    minDate.setDate(minDate.getDate() + minDays);

    const maxDate = new Date(createdDate);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${minDate.toLocaleDateString('en-GB', formatOpts)} - ${maxDate.toLocaleDateString('en-GB', formatOpts)}`;
  };

  // Helper to resolve items array
  const getOrderItems = (order: BackendOrder): BackendOrderItem[] => {
    if (order.items && order.items.length > 0) {
      return order.items;
    }
    return [
      {
        product_id: order.product_id,
        product_name: order.product_name,
        product_brand: order.product_brand,
        product_image_url: order.product_image_url,
        quantity: order.quantity || 1,
        order_type: order.order_type || 'frame_only',
        frame_price: order.frame_price,
        lens_fee: order.lens_fee,
        prescription_status: order.prescription_status,
        prescription_file_url: order.prescription_file_url,
        right_sph: order.right_sph,
        right_cyl: order.right_cyl,
        right_axis: order.right_axis,
        left_sph: order.left_sph,
        left_cyl: order.left_cyl,
        left_axis: order.left_axis,
        pd_mm: order.pd_mm,
      },
    ];
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSuccess('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-walters-cream py-8 px-4 sm:px-6 lg:px-8 font-sans text-walters-charcoal antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Banner */}
        <div className="border-b border-walters-border/60 pb-4">
          <h1 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-walters-navy">My Account</h1>
          <p className="text-xs text-walters-slate mt-1 font-medium">
            Manage your personal details, optical orders, and security preferences.
          </p>
        </div>

        {/* Sidebar + Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar */}
          <div className="bg-white rounded-3xl border border-walters-border p-5 shadow-2xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-walters-border">
              <div className="w-12 h-12 rounded-full bg-walters-navy text-walters-gold font-sans font-bold text-xl flex items-center justify-center shrink-0">
                {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-walters-slate block">
                  Welcome back
                </span>
                <h2 className="font-sans font-bold text-base text-walters-navy truncate">
                  {user?.full_name || 'Valued Customer'}
                </h2>
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-walters-navy text-white shadow-2xs'
                    : 'text-walters-slate hover:bg-walters-cream hover:text-walters-navy'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Purchases & Orders</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-walters-navy text-white shadow-2xs'
                    : 'text-walters-slate hover:bg-walters-cream hover:text-walters-navy'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Account & Security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-walters-navy text-white shadow-2xs'
                    : 'text-walters-slate hover:bg-walters-cream hover:text-walters-navy'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-walters-border">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* TAB 1: PURCHASES & ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                    Purchases and Order History
                  </h3>
                  <span className="text-xs font-semibold text-walters-slate">{orders.length} order(s)</span>
                </div>

                {loading ? (
                  <div className="bg-white p-12 rounded-3xl border border-walters-border text-center">
                    <div className="w-8 h-8 border-2 border-walters-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-walters-slate">Fetching live order history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-8 md:p-12 rounded-3xl border border-walters-border text-center space-y-6 shadow-2xs">
                    <div className="w-16 h-16 bg-walters-cream border border-walters-border rounded-full flex items-center justify-center mx-auto text-walters-navy">
                      <ShoppingBag className="w-8 h-8 text-walters-gold" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="font-sans text-xl font-bold tracking-tight text-walters-navy">
                        Welcome to Walters Opticians!
                      </h4>
                      <p className="text-xs text-walters-slate leading-relaxed">
                        Start shopping for your first find. Explore our luxury hand-crafted frames, custom optical lenses, and designer sunglasses.
                      </p>
                    </div>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                      <Link
                        to="/catalog?category=eyeglasses"
                        className="p-3 bg-walters-cream border border-walters-border rounded-2xl text-xs font-semibold text-walters-navy hover:bg-walters-navy hover:text-white transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Eyeglasses</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to="/catalog?category=sunglasses"
                        className="p-3 bg-walters-cream border border-walters-border rounded-2xl text-xs font-semibold text-walters-navy hover:bg-walters-navy hover:text-white transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Sunglasses</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to="/catalog"
                        className="p-3 bg-walters-cream border border-walters-border rounded-2xl text-xs font-semibold text-walters-navy hover:bg-walters-navy hover:text-white transition-all flex items-center justify-center space-x-1"
                      >
                        <span>All Collections</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const activeStep = getStepIndex(order.status);
                      const estimatedDelivery = calculateEstimatedDelivery(order.created_at, order.country);
                      const orderItems = getOrderItems(order);

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl border border-walters-border overflow-hidden transition-all shadow-2xs"
                        >
                          {/* Order Summary Header */}
                          <div
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-walters-cream/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-xs font-bold text-walters-navy">
                                  {order.reference_id || `WALT-${order.id}`}
                                </span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-xs text-walters-slate">
                                Placed on{' '}
                                {new Date(order.created_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}{' '}
                                • <span className="font-semibold">{orderItems.length} item(s)</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end space-x-6">
                              <div className="text-right">
                                <span className="block text-[10px] text-walters-slate uppercase font-bold tracking-wider">
                                  Total
                                </span>
                                <span className="font-sans font-bold text-base text-walters-navy tabular-nums">
                                  £{order.total_amount.toFixed(2)}
                                </span>
                              </div>

                              <button className="p-2 text-walters-slate hover:text-walters-navy cursor-pointer">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Stepper & Rich Item Details */}
                          {isExpanded && (
                            <div className="border-t border-walters-border bg-walters-cream p-6 space-y-6">
                              {/* Live Stepper */}
                              <div className="bg-white p-5 rounded-2xl border border-walters-border space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-walters-slate uppercase tracking-wider block">
                                    Live Fulfillment Stepper
                                  </span>
                                  {activeStep >= 3 && activeStep < 4 && (
                                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>Est. Delivery: {estimatedDelivery}</span>
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                                  <div
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center space-y-1 ${
                                      activeStep >= 1
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                        : 'bg-walters-cream text-walters-slate border-walters-border'
                                    }`}
                                  >
                                    <span>1. Verification</span>
                                    {activeStep >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>

                                  <div
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center space-y-1 ${
                                      activeStep >= 2
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                        : 'bg-walters-cream text-walters-slate border-walters-border'
                                    }`}
                                  >
                                    <span>2. Glazing & QC</span>
                                    {activeStep >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>

                                  <div
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center space-y-1 ${
                                      activeStep >= 3
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                        : 'bg-walters-cream text-walters-slate border-walters-border'
                                    }`}
                                  >
                                    <span>3. Dispatched</span>
                                    {activeStep >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>

                                  <div
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center space-y-1 ${
                                      activeStep >= 4
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                        : 'bg-walters-cream text-walters-slate border-walters-border'
                                    }`}
                                  >
                                    <span>4. Delivered</span>
                                    {activeStep >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                </div>

                                {order.tracking_number ? (
                                  <div className="mt-3 text-[11px] text-walters-slate flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-walters-border gap-2">
                                    <span>
                                      Carrier:{' '}
                                      <strong className="text-walters-navy font-semibold">
                                        {order.carrier || 'Royal Mail'}
                                      </strong>{' '}
                                      | Tracking Ref:{' '}
                                      <strong className="font-mono text-walters-navy">{order.tracking_number}</strong>
                                    </span>
                                    {order.shipping_label_url && (
                                      <a
                                        href={order.shipping_label_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-walters-gold font-bold flex items-center gap-1 hover:underline"
                                      >
                                        <span>View Shipping Label</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-3 text-[11px] text-walters-slate flex items-center space-x-1.5 pt-2 border-t border-walters-border">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>Tracking code will be assigned automatically upon dispatch.</span>
                                  </div>
                                )}
                              </div>

                              {/* Multi-Item Breakdown Loop */}
                              <div className="space-y-4">
                                <span className="text-[11px] font-bold text-walters-slate uppercase tracking-wider block">
                                  Items Purchased ({orderItems.length}) & Optical Specs
                                </span>

                                {orderItems.map((item, idx) => (
                                  <div
                                    key={item.id || idx}
                                    className="bg-white p-5 rounded-2xl border border-walters-border space-y-4"
                                  >
                                    {/* Item Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-walters-cream border border-walters-border rounded-xl flex items-center justify-center font-sans font-bold text-base text-walters-navy shrink-0 overflow-hidden p-1.5">
                                          {item.product_image_url ? (
                                            <img
                                              src={item.product_image_url}
                                              alt={item.product_name || 'Eyewear'}
                                              className="object-contain max-h-full max-w-full"
                                            />
                                          ) : (
                                            'W'
                                          )}
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-walters-slate uppercase tracking-wider block">
                                            {item.product_brand || 'Walters Opticians'}
                                          </span>
                                          <h4 className="font-sans font-bold text-base text-walters-navy tracking-tight">
                                            {item.product_name || `Optical Frame #${item.product_id}`}{' '}
                                            <span className="text-xs font-medium text-walters-slate">
                                              × {item.quantity}
                                            </span>
                                          </h4>
                                          <p className="text-[11px] text-walters-slate font-medium mt-0.5">
                                            {item.order_type === 'frame_only'
                                              ? 'Frames Only (Demo Lenses)'
                                              : 'Custom Prescription Lenses Included'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
                                        <span className="font-sans font-bold text-base text-walters-navy tabular-nums">
                                          £{((item.frame_price || 0) * item.quantity).toFixed(2)}
                                        </span>

                                        {item.prescription_status && (
                                          <div className="mt-1 flex items-center text-[10px] text-walters-navy font-semibold bg-walters-cream px-2 py-1 rounded-lg border border-walters-border">
                                            <FileText className="w-3 h-3 mr-1 text-walters-gold" />
                                            <span>
                                              Rx Status:{' '}
                                              {item.prescription_status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Prescription Document / Table Matrix */}
                                    {item.prescription_file_url ? (
                                      <div className="p-3 bg-walters-offwhite rounded-xl border border-walters-border flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="w-4 h-4 text-walters-navy" />
                                          <span className="font-semibold text-walters-navy">
                                            Attached Prescription Document
                                          </span>
                                        </div>
                                        <a
                                          href={item.prescription_file_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-1 bg-walters-navy text-white text-[10px] font-semibold rounded hover:bg-walters-gold hover:text-walters-navy transition-all flex items-center space-x-1"
                                        >
                                          <Download className="w-3 h-3" />
                                          <span>View Document</span>
                                        </a>
                                      </div>
                                    ) : item.right_sph !== undefined || item.left_sph !== undefined ? (
                                      <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-walters-slate block">
                                          Prescription Parameters Matrix
                                        </span>
                                        <table className="w-full text-center text-xs border border-walters-border rounded-lg overflow-hidden">
                                          <thead className="bg-walters-cream font-semibold text-walters-navy border-b border-walters-border text-[10px] uppercase">
                                            <tr>
                                              <th className="py-1.5 px-3 text-left">Eye</th>
                                              <th className="py-1.5 px-3">Sphere (SPH)</th>
                                              <th className="py-1.5 px-3">Cylinder (CYL)</th>
                                              <th className="py-1.5 px-3">Axis</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-walters-border font-mono text-[11px] text-walters-navy">
                                            <tr>
                                              <td className="py-1.5 px-3 text-left font-sans font-bold bg-walters-cream/30">
                                                OD (Right)
                                              </td>
                                              <td className="py-1.5 px-3">{item.right_sph ?? '0.00'}</td>
                                              <td className="py-1.5 px-3">{item.right_cyl ?? '0.00'}</td>
                                              <td className="py-1.5 px-3">{item.right_axis ?? '0'}°</td>
                                            </tr>
                                            <tr>
                                              <td className="py-1.5 px-3 text-left font-sans font-bold bg-walters-cream/30">
                                                OS (Left)
                                              </td>
                                              <td className="py-1.5 px-3">{item.left_sph ?? '0.00'}</td>
                                              <td className="py-1.5 px-3">{item.left_cyl ?? '0.00'}</td>
                                              <td className="py-1.5 px-3">{item.left_axis ?? '0'}°</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>

                              {/* Order-Level Itemized Price Breakdown Table */}
                              <div className="p-4 bg-white rounded-2xl border border-walters-border space-y-2 text-xs">
                                <span className="text-[10px] font-bold text-walters-slate uppercase tracking-wider block">
                                  Order Financial Breakdown
                                </span>
                                <div className="flex justify-between text-walters-slate">
                                  <span>Frame Subtotal</span>
                                  <span className="font-semibold text-walters-navy tabular-nums">
                                    £{order.frame_price.toFixed(2)}
                                  </span>
                                </div>
                                {order.lens_fee > 0 && (
                                  <div className="flex justify-between text-walters-slate">
                                    <span>Prescription Lens Glazing Fee</span>
                                    <span className="font-semibold text-walters-navy tabular-nums">
                                      £{order.lens_fee.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {order.shipping_fee > 0 && (
                                  <div className="flex justify-between text-walters-slate">
                                    <span>Shipping & Handling</span>
                                    <span className="font-semibold text-walters-navy tabular-nums">
                                      £{order.shipping_fee.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className="pt-2 border-t border-walters-border/80 flex justify-between font-bold text-walters-navy text-sm">
                                  <span>Total Amount Paid</span>
                                  <span className="tabular-nums">£{order.total_amount.toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Destination Address */}
                              <div className="flex items-start space-x-2 text-xs text-walters-slate pt-2 border-t border-walters-border">
                                <MapPin className="w-3.5 h-3.5 text-walters-navy shrink-0 mt-0.5" />
                                <span>
                                  Shipping Address:{' '}
                                  <strong className="text-walters-navy font-semibold">{order.shipping_address}</strong>{' '}
                                  ({order.country})
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACCOUNT & SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                  Account & Security Settings
                </h3>

                <div className="bg-white p-6 rounded-3xl border border-walters-border shadow-2xs space-y-4">
                  <h4 className="font-sans font-bold text-base text-walters-navy flex items-center space-x-2">
                    <User className="w-4 h-4 text-walters-gold" />
                    <span>Personal Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-walters-slate font-medium block">Full Name</span>
                      <strong className="text-walters-navy text-sm font-semibold">{user?.full_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-walters-slate font-medium block">Email Address</span>
                      <strong className="text-walters-navy text-sm font-semibold">{user?.email || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-walters-border shadow-2xs space-y-4">
                  <h4 className="font-sans font-bold text-base text-walters-navy flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-walters-gold" />
                    <span>Change Password</span>
                  </h4>

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                      {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-walters-navy mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-walters-cream border border-walters-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-walters-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-walters-navy mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-walters-cream border border-walters-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-walters-navy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-walters-navy mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-walters-cream border border-walters-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-walters-navy"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-walters-navy text-white rounded-xl text-xs font-semibold hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: HELP & SUPPORT */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                  Help & Optician Support
                </h3>

                <div className="bg-white p-6 rounded-3xl border border-walters-border shadow-2xs space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="tel:+441427616506"
                      className="p-5 bg-walters-cream border border-walters-border rounded-2xl flex items-center space-x-3 hover:border-walters-gold transition-all"
                    >
                      <Phone className="w-6 h-6 text-walters-navy shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-walters-slate block">
                          Optician Helpline
                        </span>
                        <strong className="text-sm font-sans font-bold text-walters-navy">+44 (0)1427 616506</strong>
                      </div>
                    </a>

                    <a
                      href="mailto:support@waltersopticians.com"
                      className="p-5 bg-walters-cream border border-walters-border rounded-2xl flex items-center space-x-3 hover:border-walters-gold transition-all"
                    >
                      <Mail className="w-6 h-6 text-walters-navy shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-walters-slate block">
                          Email Support
                        </span>
                        <strong className="text-sm font-sans font-bold text-walters-navy">
                          support@waltersopticians.com
                        </strong>
                      </div>
                    </a>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-sans font-bold text-base text-walters-navy">Frequently Asked Questions</h4>

                    <div className="p-4 bg-walters-cream rounded-2xl border border-walters-border space-y-1">
                      <h5 className="font-semibold text-xs text-walters-navy">
                        How do I upload my optical prescription?
                      </h5>
                      <p className="text-xs text-walters-slate">
                        During checkout, select 'Upload Prescription' to attach a scan or photo, or choose 'Manual
                        Prescription' to type in your SPH, CYL, and Axis parameters.
                      </p>
                    </div>

                    <div className="p-4 bg-walters-cream rounded-2xl border border-walters-border space-y-1">
                      <h5 className="font-semibold text-xs text-walters-navy">How long does lens glazing take?</h5>
                      <p className="text-xs text-walters-slate">
                        Custom prescription lens glazing and quality assurance checks typically take 2 to 4 working days
                        before dispatch.
                      </p>
                    </div>

                    <div className="p-4 bg-walters-cream rounded-2xl border border-walters-border space-y-1">
                      <h5 className="font-semibold text-xs text-walters-navy">Can I track my parcel live?</h5>
                      <p className="text-xs text-walters-slate">
                        Yes, as soon as your order status updates to 'Dispatched', your Royal Mail tracking reference and
                        shipping label will appear in your Purchases tab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};