//src/pages/admin/OrdersTab.tsx
import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MinusCircle, 
  Truck, 
  Loader2, 
  RefreshCw,
  XCircle,
  FlaskConical,
  PackageCheck,
  Tag,
  ExternalLink,
  Eye,
  X,
  MapPin,
  Download
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrder';
import { type AdminOrder } from '../../context/OrderContext';
import { formatPrice } from '../../utils/formatter';

interface OrdersTabProps {
  orders: AdminOrder[];
}

const PrescriptionBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalized = (status || '').toLowerCase().replace(/_/g, ' ');

  switch (normalized) {
    case 'verified':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          <span>Verified</span>
        </span>
      );
    case 'pending review':
    case 'pending_review':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
          <Clock className="w-3 h-3" />
          <span>Pending Review</span>
        </span>
      );
    case 'sent to lab':
    case 'sent_to_lab':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold">
          <FlaskConical className="w-3 h-3" />
          <span>Sent to Lab</span>
        </span>
      );
    case 'lab completed':
    case 'lab_completed':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
          <PackageCheck className="w-3 h-3" />
          <span>Lab Completed</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </span>
      );
    case 'uploaded':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold">
          <FileText className="w-3 h-3" />
          <span>Uploaded</span>
        </span>
      );
    case 'not required':
    case 'n_a':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
          <MinusCircle className="w-3 h-3" />
          <span>Not Required</span>
        </span>
      );
  }
};

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { 
    isLoading, 
    refreshOrders, 
    updateOrderStatus, 
    updatePrescriptionStatus, 
    generateShippingLabel, 
    simulateCarrierScan 
  } = useOrders();

  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<AdminOrder | null>(null);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const handleRxChange = async (orderId: number | string, rxStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await updatePrescriptionStatus(orderId, rxStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGenerateLabel = async (orderId: number | string) => {
    setActionLoadingId(orderId);
    try {
      await generateShippingLabel(orderId, 'Royal Mail');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSimulateStatus = async (orderId: number | string, newStatus: string) => {
    setActionLoadingId(orderId);
    try {
      if (simulateCarrierScan) {
        await simulateCarrierScan(orderId, newStatus);
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatOrderType = (type: string) => {
    switch (type) {
      case 'upload_prescription':
        return 'Uploaded Prescription Lenses';
      case 'manual_prescription':
        return 'Manual Prescription Lenses';
      case 'book_appointment':
        return 'In-Clinic Eye Exam + Lenses';
      case 'frame_only':
      default:
        return 'Frames Only (Demo Lenses)';
    }
  };

  return (
    <div className="mt-8 space-y-4 font-sans text-walters-charcoal antialiased">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-walters-navy">Customer Orders & Prescription Verification</h2>
        <button
          type="button"
          onClick={() => refreshOrders()}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-walters-offwhite border border-walters-border rounded-lg text-xs font-semibold text-walters-navy hover:bg-walters-gold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      <div className="bg-white border border-walters-border rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-walters-charcoal">
            <thead className="bg-walters-offwhite border-b border-walters-border text-[11px] font-semibold uppercase text-walters-slate">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Bought</th>
                <th className="py-3 px-4">Prescription</th>
                <th className="py-3 px-4">Status & Tracking</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-walters-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-walters-slate">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 text-walters-navy animate-spin" />
                    Loading latest customer orders...
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-walters-slate">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-walters-slate/40" />
                    No customer orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const isRowLoading = actionLoadingId === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-walters-cream transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3 px-4 font-semibold text-walters-navy">
                        {ord.referenceId || ord.id}
                        <p className="text-[10px] text-walters-slate font-normal">{ord.date}</p>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-walters-navy">{ord.customerName}</p>
                        <p className="text-[11px] text-walters-slate">{ord.email}</p>
                      </td>

                      {/* Items Bought Overview */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-walters-navy block truncate max-w-40">
                            {ord.productName || 'Optical Frame Item'}
                          </span>
                          <p className="text-[10px] text-walters-slate">
                            {ord.productBrand || 'Walters Opticians'} • Qty: {ord.itemsCount || 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForReview(ord)}
                            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-walters-navy hover:text-walters-gold hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review Full Order Specs</span>
                          </button>
                        </div>
                      </td>

                      {/* Prescription Status & Quick Actions */}
                      <td className="py-3 px-4 space-y-1.5">
                        <PrescriptionBadge status={ord.prescriptionStatus} />
                        
                        <div className="pt-0.5">
                          <select
                            disabled={isRowLoading}
                            value={ord.prescriptionStatus || 'pending_review'}
                            onChange={(e) => handleRxChange(ord.id, e.target.value)}
                            className="text-[10px] bg-walters-offwhite border border-walters-border text-walters-navy rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                          >
                            <option value="pending_review">Set: Pending Review</option>
                            <option value="verified">Set: Verified</option>
                            <option value="sent_to_lab">Set: Sent to Lab</option>
                            <option value="lab_completed">Set: Lab Completed</option>
                            <option value="rejected">Set: Rejected</option>
                            <option value="n_a">Set: Not Required</option>
                          </select>
                        </div>
                      </td>

                      {/* Status & Tracking Details */}
                      <td className="py-3 px-4 space-y-1">
                        <div className="flex items-center space-x-1.5 text-walters-navy font-medium">
                          <Truck className="w-3.5 h-3.5 text-walters-slate shrink-0" />
                          <span className="capitalize">{ord.orderStatus}</span>
                        </div>

                        {ord.trackingNumber && (
                          <div className="text-[10px] text-walters-slate space-y-0.5">
                            <p>
                              <strong className="text-walters-navy">{ord.carrier || 'Royal Mail'}:</strong> {ord.trackingNumber}
                            </p>
                            {ord.shippingLabelUrl && (
                              <a
                                href={ord.shippingLabelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-walters-navy font-semibold hover:underline"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                <span>View Label</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Financial Total */}
                      <td className="py-3 px-4 font-semibold text-walters-navy tabular-nums">
                        {formatPrice(ord.totalGbp)}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right space-y-1.5">
                        <div className="flex items-center justify-end space-x-2">
                          {!ord.trackingNumber && (
                            <button
                              type="button"
                              disabled={isRowLoading}
                              onClick={() => handleGenerateLabel(ord.id)}
                              className="px-2.5 py-1 bg-walters-navy text-white rounded text-[10px] font-semibold hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isRowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate Label'}
                            </button>
                          )}

                          <div className="relative inline-block">
                            <select
                              disabled={isRowLoading}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleSimulateStatus(ord.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-[10px] bg-walters-cream border border-walters-border text-walters-navy rounded px-1.5 py-1 font-semibold focus:outline-none cursor-pointer"
                            >
                              <option value="">Simulate Carrier Scan...</option>
                              <option value="Processing">Processing</option>
                              <option value="Preparing for Dispatch">Preparing for Dispatch</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Delivery Attempted">Delivery Attempted</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aesthetic Clinical Review Order Modal */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-walters-navy/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-walters-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-walters-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-walters-gold bg-walters-cream px-2.5 py-0.5 rounded-full border border-walters-border">
                  Order Breakdown & Optometry Specs
                </span>
                <h3 className="font-serif font-bold text-xl text-walters-navy mt-1">
                  Order #{selectedOrderForReview.referenceId || selectedOrderForReview.id}
                </h3>
                <p className="text-xs text-walters-slate mt-0.5">
                  Placed on {selectedOrderForReview.date} by <strong className="text-walters-navy">{selectedOrderForReview.customerName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReview(null)}
                className="p-1.5 rounded-full text-walters-slate hover:text-walters-navy hover:bg-walters-offwhite transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Card Showcase */}
            <div className="bg-walters-cream p-4 rounded-2xl border border-walters-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 bg-white border border-walters-border rounded-xl p-2 shrink-0 flex items-center justify-center overflow-hidden">
                {selectedOrderForReview.productImageUrl ? (
                  <img
                    src={selectedOrderForReview.productImageUrl}
                    alt={selectedOrderForReview.productName}
                    className="object-contain max-h-full"
                  />
                ) : (
                  <span className="font-serif font-bold text-xl text-walters-navy/30">W</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-semibold text-walters-slate uppercase tracking-wider">
                  {selectedOrderForReview.productBrand || 'Walters Opticians'}
                </span>
                <h4 className="font-serif font-bold text-base text-walters-navy">
                  {selectedOrderForReview.productName || 'Optical Frame Item'} <span className="text-xs font-normal text-walters-slate">× {selectedOrderForReview.itemsCount || 1}</span>
                </h4>
                <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-walters-offwhite text-walters-navy border border-walters-border">
                  {formatOrderType(selectedOrderForReview.orderType)}
                </div>
              </div>
            </div>

            {/* Prescription Optical Specs (Clinical Table Matrix) */}
            <div className="bg-white p-4 rounded-2xl border border-walters-border space-y-3">
              <div className="flex items-center justify-between border-b border-walters-border pb-2">
                <div className="flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-walters-navy" />
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-walters-navy">
                    Clinical Optical Prescription
                  </h4>
                </div>
                <PrescriptionBadge status={selectedOrderForReview.prescriptionStatus} />
              </div>

              {/* Uploaded File Action Button */}
              {selectedOrderForReview.prescriptionFileUrl && (
                <div className="p-3 bg-walters-offwhite rounded-xl border border-walters-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-walters-navy" />
                    <span className="font-medium text-walters-navy">Customer Uploaded Rx Document</span>
                  </div>
                  <a
                    href={selectedOrderForReview.prescriptionFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-walters-navy text-white text-[10px] font-semibold rounded-md hover:bg-walters-gold hover:text-walters-navy transition-all flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>View / Download File</span>
                  </a>
                </div>
              )}

              {/* Manual Rx Table (OD / OS Matrix) */}
              {(selectedOrderForReview.rightSph !== undefined || selectedOrderForReview.leftSph !== undefined) ? (
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-center text-xs border border-walters-border rounded-lg">
                    <thead className="bg-walters-offwhite font-semibold text-walters-navy border-b border-walters-border text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3 text-left">Eye</th>
                        <th className="py-2 px-3">Sphere (SPH)</th>
                        <th className="py-2 px-3">Cylinder (CYL)</th>
                        <th className="py-2 px-3">Axis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-walters-border text-walters-navy font-mono text-[11px]">
                      <tr>
                        <td className="py-2 px-3 text-left font-sans font-bold text-walters-navy bg-walters-cream/40">
                          OD (Right)
                        </td>
                        <td className="py-2 px-3">{selectedOrderForReview.rightSph ?? '0.00'}</td>
                        <td className="py-2 px-3">{selectedOrderForReview.rightCyl ?? '0.00'}</td>
                        <td className="py-2 px-3">{selectedOrderForReview.rightAxis ?? '0'}°</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-sans font-bold text-walters-navy bg-walters-cream/40">
                          OS (Left)
                        </td>
                        <td className="py-2 px-3">{selectedOrderForReview.leftSph ?? '0.00'}</td>
                        <td className="py-2 px-3">{selectedOrderForReview.leftCyl ?? '0.00'}</td>
                        <td className="py-2 px-3">{selectedOrderForReview.leftAxis ?? '0'}°</td>
                      </tr>
                    </tbody>
                  </table>

                  {selectedOrderForReview.pdMm !== undefined && (
                    <div className="mt-2 text-[11px] text-walters-slate flex items-center justify-end space-x-2">
                      <span>Pupillary Distance (PD):</span>
                      <strong className="font-mono text-walters-navy font-bold bg-walters-cream px-2 py-0.5 rounded border border-walters-border">
                        {selectedOrderForReview.pdMm} mm
                      </strong>
                    </div>
                  )}
                </div>
              ) : !selectedOrderForReview.prescriptionFileUrl && (
                <p className="text-xs text-walters-slate italic py-1">
                  No custom prescription parameters attached to this order (Non-Prescription / Demo Lenses).
                </p>
              )}
            </div>

            {/* Financial Breakdown Grid */}
            <div className="bg-walters-cream p-4 rounded-2xl border border-walters-border space-y-2 text-xs">
              <span className="text-[10px] font-semibold text-walters-slate uppercase tracking-wider block mb-1">
                Itemized Financial Breakdown
              </span>

              <div className="flex justify-between text-walters-slate">
                <span>Frame Price</span>
                <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(selectedOrderForReview.framePrice || selectedOrderForReview.totalGbp)}</span>
              </div>
              {selectedOrderForReview.lensFee > 0 && (
                <div className="flex justify-between text-walters-slate">
                  <span>Prescription Lens Fee</span>
                  <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(selectedOrderForReview.lensFee)}</span>
                </div>
              )}
              {selectedOrderForReview.examFee > 0 && (
                <div className="flex justify-between text-walters-slate">
                  <span>In-Clinic Exam Fee</span>
                  <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(selectedOrderForReview.examFee)}</span>
                </div>
              )}
              {selectedOrderForReview.shippingFee > 0 && (
                <div className="flex justify-between text-walters-slate">
                  <span>Shipping & Handling</span>
                  <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(selectedOrderForReview.shippingFee)}</span>
                </div>
              )}

              <div className="border-t border-walters-border pt-2 flex justify-between items-baseline text-sm font-bold text-walters-navy">
                <span>Total Amount Paid</span>
                <span className="font-serif text-lg text-walters-navy tabular-nums">{formatPrice(selectedOrderForReview.totalGbp)}</span>
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="bg-white p-4 rounded-2xl border border-walters-border flex items-start space-x-3 text-xs">
              <MapPin className="w-4 h-4 text-walters-navy shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-walters-navy block">Shipping Destination</span>
                <p className="text-walters-slate mt-0.5">{selectedOrderForReview.shippingAddress || 'No shipping address provided'}</p>
                <p className="text-walters-slate font-medium uppercase mt-0.5">{selectedOrderForReview.country}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-walters-border">
              <button
                type="button"
                onClick={() => setSelectedOrderForReview(null)}
                className="px-6 py-2.5 bg-walters-navy text-white text-xs font-semibold rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer"
              >
                Close Order Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};