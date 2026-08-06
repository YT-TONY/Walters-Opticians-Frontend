import React, { useState } from 'react';
import type { Product, PrescriptionData } from '../types';
import { ShoppingBag, Eye } from 'lucide-react';
import { PrescriptionModal } from './PrescriptionModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, type: 'frames_only' | 'prescription', rx?: PrescriptionData) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="group bg-[#F3F0E6] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#FBFAF5] mb-4 flex items-center justify-center p-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="font-serif text-4xl font-bold text-[#021438]/20 select-none">
            {product.brand}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-[#5E6470]">
          {product.shape}
        </span>
      </div>

      <div className="mb-4 space-y-1">
        <div className="flex justify-between items-baseline">
          <h3 className="font-serif text-lg font-bold text-[#021438]">{product.name}</h3>
          <span className="font-serif text-lg font-bold text-[#021438]">£{product.price_full_gbp}</span>
        </div>
        <p className="text-xs text-[#5E6470]">{product.brand} • {product.color_description}</p>
        <p className="text-[11px] text-[#E6AA38] font-semibold">
          Frame only: £{product.price_frame_only_gbp}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 px-2 bg-[#021438] text-[#FBFAF5] rounded-xl text-xs font-semibold hover:bg-[#021438]/90 flex items-center justify-center space-x-1"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Prescription</span>
        </button>

        <button
          onClick={() => onAddToCart(product, 'frames_only')}
          className="w-full py-2.5 px-2 border border-[#E6AA38] text-[#021438] rounded-xl text-xs font-semibold hover:bg-[#E6AA38]/10 flex items-center justify-center space-x-1"
        >
          <Eye className="w-3.5 h-3.5 text-[#E6AA38]" />
          <span>Frame Only</span>
        </button>
      </div>

      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onConfirmPurchase={(type, rx) => onAddToCart(product, type, rx)}
      />
    </div>
  );
};