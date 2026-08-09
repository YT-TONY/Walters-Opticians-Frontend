// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown } from 'lucide-react';

export interface Product {
  id: string | number;
  name: string;
  price_full_gbp: number;
  image_url: string;
  category?: string;
  colors?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, option: string) => void;
  cartCount: number;
  formatPrice: (price: number) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  cartCount,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleOptionSelect = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onAddToCart(product, option);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col bg-transparent transition-all duration-300"
    >
      {/* Image Container with Hover Zoom */}
      <div className="relative w-full aspect-4/3 bg-[#F9F8F6] rounded-xl overflow-hidden mb-4 border border-charcoal/5">
        <img
          src={product.image_url}
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

      {/* Add to Bag Dropdown & Cart Counter */}
      <div className="relative mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Dropdown Menu Trigger */}
        <div className="relative flex-1">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white/80 hover:bg-white text-walters-navy text-xs font-light tracking-wide px-4 py-2.5 rounded-full border border-walters-navy/15 hover:border-walters-navy/40 transition-all duration-200 shadow-sm"
          >
            <span>Add to Bag</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-charcoal/10 py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={(e) => handleOptionSelect(e, 'Standard')}
                className="w-full text-left px-4 py-2 text-xs font-light text-walters-charcoal hover:bg-walters-cream/50 transition-colors"
              >
                Add to Bag
              </button>
              <button
                onClick={(e) => handleOptionSelect(e, 'Just Frames')}
                className="w-full text-left px-4 py-2 text-xs font-light text-walters-charcoal hover:bg-walters-cream/50 transition-colors"
              >
                Just Frames
              </button>
              <button
                onClick={(e) => handleOptionSelect(e, 'Prescription')}
                className="w-full text-left px-4 py-2 text-xs font-light text-walters-navy hover:bg-walters-cream/50 transition-colors"
              >
                + Add Prescription
              </button>
            </div>
          )}
        </div>

        {/* Bag Button with Dynamic Counter Badge */}
        <button
          onClick={() => onAddToCart(product, 'Standard')}
          className="relative p-2.5 bg-walters-navy text-white rounded-full hover:bg-walters-navy/90 transition-colors duration-200 shrink-0"
          title="Quick Add"
        >
          <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-walters-gold text-walters-navy text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};