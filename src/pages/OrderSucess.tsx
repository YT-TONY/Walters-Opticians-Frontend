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
    <div className="min-h-screen bg-[#FBFAF5] py-12 px-6 text-[#1A1A1A]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E5E0D8] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E6AA38]">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#021438]">
              Thank You for Your Order
            </h1>
            <p className="text-xs text-[#5E6470] max-w-md mx-auto">
              We have received your order details and our opticians are reviewing your optical specification.
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-block bg-[#FBFAF5] px-4 py-2 rounded-xl border border-[#E5E0D8] text-xs font-mono text-[#021438]">
              Order Reference: <span className="font-bold">{orderId || 'WALT-839201'}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        <div className="bg-[#F3F0E6] p-6 md:p-8 rounded-3xl border border-[#E5E0D8] space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#021438] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#021438]" />
            <span>Fulfillment Timeline</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center space-x-2 text-[#021438]">
                <FileText className="w-4 h-4 text-[#E6AA38]" />
                <span className="text-xs font-bold uppercase">1. Verification</span>
              </div>
              <p className="text-[11px] text-[#5E6470]">
                Optician inspecting prescription parameters and frame fitting specifications.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center space-x-2 text-[#021438]">
                <Package className="w-4 h-4 text-[#E6AA38]" />
                <span className="text-xs font-bold uppercase">2. Glazing & QC</span>
              </div>
              <p className="text-[11px] text-[#5E6470]">
                Custom lens cutting, anti-reflective coating, and dual-point quality inspection.
              </p>
              <p className="text-[10px] text-[#021438] font-semibold pt-1">
                Est. Dispatch: {formatDate(dispatchDate)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center space-x-2 text-[#021438]">
                <Calendar className="w-4 h-4 text-[#E6AA38]" />
                <span className="text-xs font-bold uppercase">3. Delivery</span>
              </div>
              <p className="text-[11px] text-[#5E6470]">
                Tracked courier delivery directly to your designated shipping address.
              </p>
              <p className="text-[10px] text-[#021438] font-semibold pt-1">
                Est. Delivery: {formatDate(deliveryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Support */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#021438] text-[#FBFAF5] text-xs font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-[#5E6470] text-center sm:text-right">
            Questions? Contact <a href="mailto:support@waltersopticians.co.uk" className="text-[#021438] font-bold underline">support@waltersopticians.co.uk</a>
          </p>
        </div>

      </div>
    </div>
  );
};