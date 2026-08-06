import React from 'react';
import type { Product, PrescriptionData } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { Eye, ShoppingBag } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (
    product: Product,
    type: 'frames_only' | 'prescription',
    rx?: PrescriptionData
  ) => void;
  onAddFrameOnly?: (product: Product) => void;
  onSelectPrescription?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddFrameOnly,
  onSelectPrescription,
}) => {
  const { formatPrice } = useCurrency();

  const handleFrameOnlyClick = () => {
    if (onAddFrameOnly) {
      onAddFrameOnly(product);
    } else if (onAddToCart) {
      onAddToCart(product, 'frames_only');
    }
  };

  const handlePrescriptionClick = () => {
    if (onSelectPrescription) {
      onSelectPrescription(product);
    } else if (onAddToCart) {
      onAddToCart(product, 'prescription');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E0D8] p-5 flex flex-col justify-between hover:shadow-lg transition-all group">
      <div>
        {/* Frame Image Container */}
        <div className="relative w-full h-48 bg-[#FBFAF5] rounded-2xl border border-[#E5E0D8] p-4 flex items-center justify-center overflow-hidden mb-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="font-serif font-bold text-4xl text-[#021438]/20">
              {product.name[0]}
            </div>
          )}

          {product.stock_quantity <= 3 && product.stock_quantity > 0 && (
            <span className="absolute top-3 left-3 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Low Stock ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6AA38]">
            {product.category || 'Handcrafted Eyewear'}
          </span>
          <h3 className="font-serif text-lg font-bold text-[#021438] line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#5E6470] line-clamp-2">
            {product.description || 'Premium acetate optical frame crafted for daily clarity.'}
          </p>
        </div>
      </div>

      {/* Pricing and Action Buttons */}
      <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-[#5E6470] uppercase block">With Lenses</span>
            <span className="font-serif font-bold text-base text-[#021438]">
              {formatPrice(product.price_full_gbp)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#5E6470] uppercase block">Frame Only</span>
            <span className="text-xs font-semibold text-[#5E6470]">
              {formatPrice(product.price_frame_only_gbp)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFrameOnlyClick}
            className="py-2.5 px-3 bg-[#FBFAF5] text-[#021438] border border-[#E5E0D8] rounded-xl text-xs font-semibold hover:bg-[#E5E0D8] transition-all flex items-center justify-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#5E6470]" />
            <span>Frame Only</span>
          </button>

          <button
            onClick={handlePrescriptionClick}
            className="py-2.5 px-3 bg-[#021438] text-[#FBFAF5] rounded-xl text-xs font-bold hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Add Prescription</span>
          </button>
        </div>
      </div>
    </div>
  );
};