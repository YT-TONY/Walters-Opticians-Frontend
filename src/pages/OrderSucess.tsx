import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, ArrowRight, FileText } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  // Estimated fulfillment windows
  const today = new Date();
  const dispatchDate = new Date(today);
  dispatchDate.setDate(today.getDate() + 3);
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 6);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-6 text-charcoal">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-border text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">
              Thank You for Your Order
            </h1>
            <p className="text-xs text-slate max-w-md mx-auto">
              We have received your order details and our opticians are reviewing your optical specification.
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-block bg-cream px-4 py-2 rounded-xl border border-border text-xs font-mono text-navy">
              Order Reference: <span className="font-bold">{orderId || 'WALT-839201'}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        <div className="bg-offwhite p-6 md:p-8 rounded-3xl border border-border space-y-6">
          <h2 className="font-serif text-xl font-bold text-navy flex items-center gap-2">
            <Truck className="w-5 h-5 text-navy" />
            <span>Fulfillment Timeline</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-border space-y-2">
              <div className="flex items-center space-x-2 text-navy">
                <FileText className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold uppercase">1. Verification</span>
              </div>
              <p className="text-[11px] text-slate">
                Optician inspecting prescription parameters and frame fitting specifications.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-border space-y-2">
              <div className="flex items-center space-x-2 text-navy">
                <Package className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold uppercase">2. Glazing & QC</span>
              </div>
              <p className="text-[11px] text-slate">
                Custom lens cutting, anti-reflective coating, and dual-point quality inspection.
              </p>
              <p className="text-[10px] text-navy font-semibold pt-1">
                Est. Dispatch: {formatDate(dispatchDate)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-border space-y-2">
              <div className="flex items-center space-x-2 text-navy">
                <Calendar className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold uppercase">3. Delivery</span>
              </div>
              <p className="text-[11px] text-slate">
                Tracked courier delivery directly to your designated shipping address.
              </p>
              <p className="text-[10px] text-navy font-semibold pt-1">
                Est. Delivery: {formatDate(deliveryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Support */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-navy text-cream text-xs font-bold rounded-xl hover:bg-gold hover:text-navy transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-slate text-center sm:text-right">
            Questions? Contact <a href="mailto:support@waltersopticians.co.uk" className="text-navy font-bold underline">support@waltersopticians.co.uk</a>
          </p>
        </div>

      </div>
    </div>
  );
};