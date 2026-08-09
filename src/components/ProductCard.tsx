// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown, Check, Loader2 } from 'lucide-react';
import type { Product } from '../types/index';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, option: string) => Promise<void> | void;
  formatPrice: (price: number) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const triggerAddToCart = async (option: string) => {
    setLoading(true);
    try {
      await onAddToCart(product, option);
      setLoading(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1200);
    } catch {
      setLoading(false);
    }
  };

  const handleOptionSelect = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    triggerAddToCart(option);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col bg-transparent transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-4/3 bg-[#F9F8F6] rounded-xl overflow-hidden mb-4 border border-charcoal/5">
        <img
          src={product.image_url || ''}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col space-y-1 px-1">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-lg font-normal tracking-wide text-walters-navy group-hover:text-walters-gold transition-colors duration-200">
            {product.name}
          </h3>
          <span className="text-sm font-light text-walters-charcoal/80">
            {formatPrice(product.price_full_gbp)}
          </span>
        </div>
        
        <p className="text-xs font-light text-walters-charcoal/50 tracking-wider uppercase">
          {product.category || 'Eyewear'}
        </p>
      </div>

      {/* Add to Bag Controls */}
      <div className="relative mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Dropdown Menu */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white/80 hover:bg-white text-walters-navy text-xs font-light tracking-wide px-4 py-2.5 rounded-full border border-walters-navy/15 hover:border-walters-navy/40 transition-all duration-200 shadow-sm"
          >
            <span>Add to Bag</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-2xl border border-charcoal/10 py-1.5 z-20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                type="button"
                onClick={(e) => handleOptionSelect(e, 'Standard')}
                className="w-full text-left px-4 py-2.5 text-xs font-light text-walters-charcoal hover:bg-walters-navy hover:text-white transition-all duration-150 flex items-center justify-between group/item"
              >
                <span>Add to Bag (Non-Prescription)</span>
                <span className="text-[10px] opacity-70 group-hover/item:opacity-100">{formatPrice(product.price_full_gbp)}</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleOptionSelect(e, 'Just Frames')}
                className="w-full text-left px-4 py-2.5 text-xs font-light text-walters-charcoal hover:bg-walters-navy hover:text-white transition-all duration-150 flex items-center justify-between group/item"
              >
                <span>Just Frames</span>
                <span className="text-[10px] opacity-70 group-hover/item:opacity-100">Demo Lenses</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleOptionSelect(e, 'Prescription')}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-walters-navy hover:bg-walters-navy hover:text-white transition-all duration-150 flex items-center justify-between group/item border-t border-charcoal/5"
              >
                <span>+ Add Prescription</span>
                <span className="text-[10px] opacity-70 group-hover/item:opacity-100">Custom</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Button with Loading Spinner */}
        <button
          type="button"
          disabled={loading}
          onClick={() => triggerAddToCart('Standard')}
          className={`relative p-2.5 rounded-full text-white transition-all duration-300 shrink-0 ${
            isAdded
              ? 'bg-emerald-600 scale-110 shadow-md'
              : 'bg-walters-navy hover:bg-walters-navy/90 active:scale-95'
          }`}
          title="Quick Add"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : isAdded ? (
            <Check className="w-4 h-4 stroke-2 animate-in zoom-in-50 duration-200" />
          ) : (
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
          )}
        </button>
      </div>
    </div>
  );
};