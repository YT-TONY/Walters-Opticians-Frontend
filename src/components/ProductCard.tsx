// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
  const { isAdmin } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const isOutOfStock = product.stock_quantity <= 0;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleOptionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    if (!value || isOutOfStock) return;

    setSelectedOption(value);
    setLoading(true);
    
    try {
      // Promise.all ensures the loading spinner shows for at least 800ms 
      // even if onAddToCart resolves instantly, fixing the "invisible" animation.
      await Promise.all([
        onAddToCart(product, value),
        new Promise((resolve) => setTimeout(resolve, 800))
      ]);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
      // Reset the dropdown back to default state
      setSelectedOption('');
    }
  };

  const frameShape = product.category || 'ROUND';
  const frameColor = product.description ? product.description.slice(0, 18) : 'TORTOISE AMBER';

  return (
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col bg-[#F6F4EE] border border-[#E2DBD0] rounded-sm transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-transparent overflow-hidden">
        {/* Out of Stock Red Banner Overlay */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-xs shadow-xs">
            Out of Stock
          </div>
        )}

        <img
          src={product.image_url || ''}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-4">
        {/* Product Metadata Header */}
        <div className="flex flex-col space-y-1 mb-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-normal tracking-wide text-walters-navy">
              {product.name}
            </h3>
            <span className="text-sm font-medium text-walters-navy">
              {formatPrice(product.price_full_gbp)}
            </span>
          </div>
          
          <p className="text-[11px] font-light text-walters-charcoal/60 tracking-wider uppercase">
            {frameShape} &nbsp;·&nbsp; {frameColor}
          </p>
        </div>

        {/* Add to Bag / Select Dropdown / Out of Stock Pill */}
        <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
          {isOutOfStock ? (
            /* Out of Stock Disabled Button */
            <div className="w-full h-10 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-full flex items-center justify-center cursor-not-allowed">
              Out of Stock
            </div>
          ) : isAdmin ? (
            /* Admin View State (Shopping Disabled) */
            <div className="w-full h-10 bg-offwhite border border-border rounded-full flex items-center justify-center space-x-1.5 text-navy text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Admin Preview Mode</span>
            </div>
          ) : loading ? (
            /* Loading State (Matches grey pill with spinner) */
            <div className="w-full h-10 bg-[#636267] rounded-full flex items-center justify-center text-white transition-colors duration-200">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            /* Default Select Dropdown */
            <div className="relative">
              <select
                value={selectedOption}
                onChange={handleOptionChange}
                className="w-full bg-white text-walters-navy text-xs font-normal h-10 pl-4 pr-8 rounded-full border border-walters-navy/30 hover:border-walters-navy focus:border-walters-navy outline-none cursor-pointer appearance-none transition-all duration-200 text-center"
              >
                <option value="" disabled hidden>
                  Select an option
                </option>
                <option value="Standard" className="text-black bg-white">
                  Non-Prescription ({formatPrice(product.price_full_gbp)})
                </option>
                <option value="Just Frames" className="text-black bg-white">
                  Just Frames
                </option>
                <option value="Prescription" className="text-black bg-white">
                  + Add Prescription
                </option>
              </select>
              {/* Dropdown Arrow Indicator */}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-walters-navy pointer-events-none opacity-70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};