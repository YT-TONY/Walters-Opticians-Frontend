import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import type { SavedPrescription, PrescriptionFormData } from '../types/prescription';
import { VirtualPDModal } from '../components/VirtualPDModal';
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
  FlaskConical,
  Shield,
  HelpCircle,
  Package,
  Phone,
  Mail,
  ArrowRight,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Star,
  X,
  AlertCircle,
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
  items?: BackendOrderItem[];
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

const EMPTY_FORM: PrescriptionFormData = {
  title: '',
  right_sph: '0.00',
  right_cyl: '0.00',
  right_axis: '180',
  left_sph: '0.00',
  left_cyl: '0.00',
  left_axis: '180',
  pd_mm: '63.0',
  file_url: '',
  is_default: false,
};

export const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'prescriptions' | 'security' | 'support'>('orders');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [prescriptions, setPrescriptions] = useState<SavedPrescription[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(null);

  // Prescription Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PrescriptionFormData>(EMPTY_FORM);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Virtual PD Modal State
  const [isPDModalOpen, setIsPDModalOpen] = useState(false);

  const sphOptions = useMemo(() => {
    const opts: string[] = [];
    for (let v = -14.00; v <= 11.75; v += 0.25) {
      const val = Math.round(v * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const cylOptions = useMemo(() => {
    const opts: string[] = [];
    for (let v = -6.00; v <= 6.00; v += 0.25) {
      const val = Math.round(v * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const axisOptions = useMemo(() => {
    return Array.from({ length: 180 }, (_, i) => String(i + 1));
  }, []);

  const formatDiopter = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '0.00';
    const num = Number(val);
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    apiClient
      .get<BackendOrder[]>('/orders/me')
      .then((res) => {
        if (isMounted) setOrders(res.data || []);
      })
      .catch((err) => console.error('Failed to fetch orders', err))
      .finally(() => {
        if (isMounted) setLoadingOrders(false);
      });

    apiClient
      .get<SavedPrescription[]>('/prescriptions/me')
      .then((res) => {
        if (isMounted) setPrescriptions(res.data || []);
      })
      .catch((err) => console.error('Failed to fetch prescriptions', err))
      .finally(() => {
        if (isMounted) setLoadingPrescriptions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const toggleOrderExpand = (orderId: string | number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const openNewPrescriptionModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditPrescriptionModal = (rx: SavedPrescription) => {
    setEditingId(rx.id);
    setFormData({
      title: rx.title || '',
      right_sph: formatDiopter(rx.right_sph),
      right_cyl: formatDiopter(rx.right_cyl),
      right_axis: String(rx.right_axis ?? 180),
      left_sph: formatDiopter(rx.left_sph),
      left_cyl: formatDiopter(rx.left_cyl),
      left_axis: String(rx.left_axis ?? 180),
      pd_mm: String(rx.pd_mm ?? 63.0),
      file_url: rx.file_url || '',
      is_default: rx.is_default || false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handlePDMeasured = (measuredPd: number) => {
    setFormData((prev) => ({
      ...prev,
      pd_mm: String(measuredPd),
    }));
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrescription(true);
    setModalError(null);

    const payload = {
      title: formData.title || 'My Optical Prescription',
      right_sph: parseFloat(formData.right_sph) || 0,
      right_cyl: parseFloat(formData.right_cyl) || 0,
      right_axis: parseInt(formData.right_axis, 10) || 180,
      left_sph: parseFloat(formData.left_sph) || 0,
      left_cyl: parseFloat(formData.left_cyl) || 0,
      left_axis: parseInt(formData.left_axis, 10) || 180,
      pd_mm: parseFloat(formData.pd_mm) || 63.0,
      file_url: formData.file_url || null,
      is_default: formData.is_default,
    };

    try {
      if (editingId) {
        const res = await apiClient.put<SavedPrescription>(`/prescriptions/${editingId}`, payload);
        setPrescriptions((prev) =>
          prev.map((p) => {
            if (p.id === editingId) return res.data;
            return res.data.is_default ? { ...p, is_default: false } : p;
          })
        );
      } else {
        const res = await apiClient.post<SavedPrescription>('/prescriptions', payload);
        setPrescriptions((prev) => {
          const updatedList = res.data.is_default
            ? prev.map((p) => ({ ...p, is_default: false }))
            : prev;
          return [res.data, ...updatedList];
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error('Failed to save prescription', err);
      const apiError = err as { response?: { data?: { detail?: string } } };
      setModalError(apiError.response?.data?.detail || 'Failed to save prescription. Please try again.');
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleDeletePrescription = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this saved prescription?')) return;
    try {
      await apiClient.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete prescription', err);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await apiClient.put(`/prescriptions/${id}/default`);
      setPrescriptions((prev) =>
        prev.map((p) => ({ ...p, is_default: p.id === id }))
      );
    } catch (err) {
      console.error('Failed to update default prescription', err);
    }
  };

  const getStepIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('dispatched') || s.includes('transit')) return 3;
    if (s.includes('fulfillment') || s.includes('lab') || s.includes('glazing')) return 2;
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
    if (s.includes('dispatched') || s.includes('transit')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Truck className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (s.includes('fulfillment') || s.includes('lab') || s.includes('glazing')) {
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

  const getOrderItems = (order: BackendOrder): BackendOrderItem[] => {
    if (order.items && order.items.length > 0) return order.items;
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

  return (
    <div className="min-h-screen bg-walters-cream py-8 px-4 sm:px-6 lg:px-8 font-sans text-walters-charcoal antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="border-b border-walters-border/60 pb-4">
          <h1 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-walters-navy">My Account</h1>
          <p className="text-xs text-walters-slate mt-1 font-medium">
            Manage your personal details, saved prescriptions, optical orders, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
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
                onClick={() => setActiveTab('prescriptions')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'prescriptions'
                    ? 'bg-walters-navy text-white shadow-2xs'
                    : 'text-walters-slate hover:bg-walters-cream hover:text-walters-navy'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Saved Prescriptions</span>
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
                <span>Account Details</span>
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

          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                    Purchases and Order History
                  </h3>
                  <span className="text-xs font-semibold text-walters-slate">{orders.length} order(s)</span>
                </div>

                {loadingOrders ? (
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
                        Start shopping for your first find. Explore luxury frames, custom optical lenses, and designer sunglasses.
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
                      const orderItems = getOrderItems(order);

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl border border-walters-border overflow-hidden transition-all shadow-2xs"
                        >
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

                          {isExpanded && (
                            <div className="border-t border-walters-border bg-walters-cream p-6 space-y-6">
                              <div className="bg-white p-5 rounded-2xl border border-walters-border space-y-4">
                                <span className="text-[11px] font-bold text-walters-slate uppercase tracking-wider block">
                                  Live Fulfillment Stepper
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${activeStep >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-walters-cream text-walters-slate border-walters-border'}`}>
                                    <span>1. Verification</span>
                                    {activeStep >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${activeStep >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-walters-cream text-walters-slate border-walters-border'}`}>
                                    <span>2. Glazing & QC</span>
                                    {activeStep >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${activeStep >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-walters-cream text-walters-slate border-walters-border'}`}>
                                    <span>3. Dispatched</span>
                                    {activeStep >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${activeStep >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-walters-cream text-walters-slate border-walters-border'}`}>
                                    <span>4. Delivered</span>
                                    {activeStep >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                </div>
                              </div>

                              {(order.carrier || order.tracking_number) && (
                                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
                                  <div>
                                    <span className="font-semibold block">Carrier: {order.carrier || 'Royal Mail'}</span>
                                    <span className="font-mono text-[11px]">Tracking #: {order.tracking_number}</span>
                                  </div>
                                  {order.shipping_label_url && (
                                    <a href={order.shipping_label_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 underline">
                                      Track Shipment
                                    </a>
                                  )}
                                </div>
                              )}

                              <div className="space-y-3">
                                <span className="text-[11px] font-bold text-walters-slate uppercase tracking-wider block">
                                  Order Items
                                </span>
                                {orderItems.map((item, idx) => (
                                  <div key={item.id || idx} className="bg-white p-4 rounded-2xl border border-walters-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                      {item.product_image_url ? (
                                        <img src={item.product_image_url} alt={item.product_name || 'Product'} className="w-12 h-12 object-cover rounded-xl border border-walters-border" />
                                      ) : (
                                        <div className="w-12 h-12 bg-walters-cream rounded-xl border border-walters-border flex items-center justify-center text-walters-navy">
                                          <Package className="w-5 h-5 text-walters-slate" />
                                        </div>
                                      )}
                                      <div>
                                        <h5 className="font-bold text-xs text-walters-navy">{item.product_name || 'Optical Product'}</h5>
                                        <p className="text-[11px] text-walters-slate">
                                          {item.product_brand && <span>{item.product_brand} • </span>}
                                          <span className="capitalize">{item.order_type.replace('_', ' ')}</span> • Qty: {item.quantity}
                                        </p>
                                        {(item.right_sph !== null || item.left_sph !== null) && (
                                          <p className="text-[10px] font-mono text-walters-navy mt-1">
                                            OD: {formatDiopter(item.right_sph)} / {formatDiopter(item.right_cyl)} / {item.right_axis ?? 180}° | OS: {formatDiopter(item.left_sph)} / {formatDiopter(item.left_cyl)} / {item.left_axis ?? 180}°
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-bold text-walters-navy">
                                        £{((item.frame_price || 0) + (item.lens_fee || 0)).toFixed(2)}
                                      </span>
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
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                      Saved Prescriptions
                    </h3>
                    <p className="text-xs text-walters-slate mt-0.5">
                      Store your optical parameters to quickly apply them during checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewPrescriptionModal}
                    className="px-4 py-2.5 bg-walters-navy text-white rounded-xl text-xs font-semibold flex items-center space-x-2 hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Prescription</span>
                  </button>
                </div>

                {loadingPrescriptions ? (
                  <div className="bg-white p-12 rounded-3xl border border-walters-border text-center">
                    <div className="w-8 h-8 border-2 border-walters-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-walters-slate">Loading saved prescriptions...</p>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="bg-white p-8 md:p-12 rounded-3xl border border-walters-border text-center space-y-4 shadow-2xs">
                    <div className="w-14 h-14 bg-walters-cream border border-walters-border rounded-full flex items-center justify-center mx-auto text-walters-navy">
                      <Eye className="w-7 h-7 text-walters-gold" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="font-sans text-base font-bold text-walters-navy">No Saved Prescriptions</h4>
                      <p className="text-xs text-walters-slate">
                        Save your optical values or upload your prescription card for smooth one-click lens ordering.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewPrescriptionModal}
                      className="px-5 py-2.5 bg-walters-navy text-white rounded-xl text-xs font-semibold hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Prescription Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="bg-white rounded-3xl border border-walters-border p-6 shadow-2xs space-y-4 relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-sans font-bold text-base text-walters-navy">{rx.title}</h4>
                              {rx.is_default && (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Star className="w-3 h-3 fill-current text-amber-500" />
                                  <span>Default</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-walters-slate">
                              Added on {new Date(rx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!rx.is_default && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(rx.id)}
                                className="p-2 text-walters-slate hover:text-amber-600 transition-colors cursor-pointer"
                                title="Set as default prescription"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditPrescriptionModal(rx)}
                              className="p-2 text-walters-slate hover:text-walters-navy transition-colors cursor-pointer"
                              title="Edit prescription"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePrescription(rx.id)}
                              className="p-2 text-walters-slate hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete prescription"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-center text-xs border border-walters-border rounded-xl overflow-hidden">
                            <thead className="bg-walters-cream font-semibold text-walters-navy border-b border-walters-border text-[10px] uppercase">
                              <tr>
                                <th className="py-2 px-3 text-left">Eye</th>
                                <th className="py-2 px-3">Sphere (SPH)</th>
                                <th className="py-2 px-3">Cylinder (CYL)</th>
                                <th className="py-2 px-3">Axis</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-walters-border font-mono text-xs text-walters-navy">
                              <tr>
                                <td className="py-2 px-3 text-left font-sans font-bold bg-walters-cream/30">
                                  OD (Right Eye)
                                </td>
                                <td className="py-2 px-3">{formatDiopter(rx.right_sph)}</td>
                                <td className="py-2 px-3">{formatDiopter(rx.right_cyl)}</td>
                                <td className="py-2 px-3">{rx.right_axis ?? 180}°</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-left font-sans font-bold bg-walters-cream/30">
                                  OS (Left Eye)
                                </td>
                                <td className="py-2 px-3">{formatDiopter(rx.left_sph)}</td>
                                <td className="py-2 px-3">{formatDiopter(rx.left_cyl)}</td>
                                <td className="py-2 px-3">{rx.left_axis ?? 180}°</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-start justify-between text-xs pt-1">
                          <span className="text-walters-slate">
                            Pupillary Distance (PD): <strong className="text-walters-navy font-semibold">{rx.pd_mm ?? 63.0} mm</strong>
                          </span>
                          <div className="flex flex-col items-end gap-1">
                            {rx.file_url && (
                              <a
                                href={rx.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-walters-navy font-semibold flex items-center space-x-1 hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5 text-walters-gold" />
                                <span>View Attached Document</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                openEditPrescriptionModal(rx);
                                setIsPDModalOpen(true);
                              }}
                              className="text-amber-600 hover:text-amber-700 font-semibold text-xs hover:underline cursor-pointer"
                            >
                              check PD?
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-walters-navy">
                  Account Details
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
              </div>
            )}

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
                        Navigate to 'Saved Prescriptions' to enter your SPH, CYL, and Axis parameters or attach a scanned prescription card.
                      </p>
                    </div>

                    <div className="p-4 bg-walters-cream rounded-2xl border border-walters-border space-y-1">
                      <h5 className="font-semibold text-xs text-walters-navy">How long does lens glazing take?</h5>
                      <p className="text-xs text-walters-slate">
                        Custom prescription lens glazing and quality assurance checks typically take 2 to 4 working days before dispatch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRESCRIPTION EDIT/ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-walters-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-walters-border pb-3">
              <h3 className="font-sans text-base font-bold text-walters-navy">
                {editingId ? 'Edit Saved Prescription' : 'Add New Prescription'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-walters-slate hover:text-walters-navy cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-walters-navy mb-1">Prescription Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reading Glasses RX, Distance Lenses 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-walters-cream border border-walters-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-walters-navy"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-walters-slate uppercase tracking-wider block">
                  Optical Parameters
                </span>

                <div className="p-3 bg-walters-cream rounded-xl space-y-2">
                  <span className="text-xs font-bold text-walters-navy block">OD — Right Eye</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Sphere (SPH)</label>
                      <select
                        value={formData.right_sph}
                        onChange={(e) => setFormData({ ...formData, right_sph: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {sphOptions.map((v) => (
                          <option key={`r_sph_${v}`} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Cylinder (CYL)</label>
                      <select
                        value={formData.right_cyl}
                        onChange={(e) => setFormData({ ...formData, right_cyl: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {cylOptions.map((v) => (
                          <option key={`r_cyl_${v}`} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Axis (°)</label>
                      <select
                        value={formData.right_axis}
                        onChange={(e) => setFormData({ ...formData, right_axis: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {axisOptions.map((v) => (
                          <option key={`r_axis_${v}`} value={v}>{v}°</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-walters-cream rounded-xl space-y-2">
                  <span className="text-xs font-bold text-walters-navy block">OS — Left Eye</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Sphere (SPH)</label>
                      <select
                        value={formData.left_sph}
                        onChange={(e) => setFormData({ ...formData, left_sph: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {sphOptions.map((v) => (
                          <option key={`l_sph_${v}`} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Cylinder (CYL)</label>
                      <select
                        value={formData.left_cyl}
                        onChange={(e) => setFormData({ ...formData, left_cyl: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {cylOptions.map((v) => (
                          <option key={`l_cyl_${v}`} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-walters-slate">Axis (°)</label>
                      <select
                        value={formData.left_axis}
                        onChange={(e) => setFormData({ ...formData, left_axis: e.target.value })}
                        className="w-full bg-white border border-walters-border rounded-lg px-2 py-1 text-xs font-mono"
                      >
                        {axisOptions.map((v) => (
                          <option key={`l_axis_${v}`} value={v}>{v}°</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-walters-navy">Pupillary Distance (PD)</label>
                    <button
                      type="button"
                      onClick={() => setIsPDModalOpen(true)}
                      className="text-amber-600 hover:text-amber-700 font-semibold text-[11px] hover:underline cursor-pointer"
                    >
                      check PD?
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.pd_mm}
                    onChange={(e) => setFormData({ ...formData, pd_mm: e.target.value })}
                    className="w-full bg-walters-cream border border-walters-border rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walters-navy mb-1">Document URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full bg-walters-cream border border-walters-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded text-walters-navy focus:ring-walters-navy cursor-pointer"
                />
                <label htmlFor="is_default" className="text-xs text-walters-navy font-semibold cursor-pointer">
                  Set as my default prescription
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  disabled={savingPrescription}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-walters-border rounded-xl text-xs font-semibold text-walters-slate hover:bg-walters-cream cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrescription}
                  className="px-5 py-2 bg-walters-navy text-white rounded-xl text-xs font-semibold hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {savingPrescription ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Prescription</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIRTUAL PD SCANNER MODAL */}
      <VirtualPDModal
        isOpen={isPDModalOpen}
        onClose={() => setIsPDModalOpen(false)}
        onComplete={handlePDMeasured}
      />
    </div>
  );
};