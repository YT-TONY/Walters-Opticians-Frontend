// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types/index';

export interface ProductGroup {
  groupKey: string;
  defaultProduct: Product;
  variants: Product[];
}

interface ProductCardProps {
  group: ProductGroup;
  onAddToCart: (product: Product, option: string) => Promise<void> | void;
  formatPrice: (price: number) => string;
}

// Maps color descriptions to CSS background colors or gradients for swatches
const getColorSwatchStyle = (colorDesc: string): React.CSSProperties => {
  const lower = colorDesc.toLowerCase();
  if (lower.includes('tortoise') || lower.includes('amber')) {
    return { background: 'linear-gradient(135deg, #4a2810 0%, #b45309 50%, #d97706 100%)' };
  }
  if (lower.includes('gold')) {
    return { background: 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #ca8a04 100%)' };
  }
  if (lower.includes('cobalt') || lower.includes('blue')) {
    return { backgroundColor: '#1e3a8a' };
  }
  if (lower.includes('yellow')) {
    return { backgroundColor: '#eab308' };
  }
  if (lower.includes('black')) {
    return { backgroundColor: '#18181b' };
  }
  if (lower.includes('pink') || lower.includes('marble')) {
    return { background: 'linear-gradient(135deg, #f472b6 0%, #fbcfe8 100%)' };
  }
  if (lower.includes('silver') || lower.includes('grey') || lower.includes('gray')) {
    return { backgroundColor: '#94a3b8' };
  }
  if (lower.includes('clear') || lower.includes('crystal')) {
    return { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' };
  }
  return { backgroundColor: '#64748b' };
};

export const ProductCard: React.FC<ProductCardProps> = ({
  group,
  onAddToCart,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [prevGroupKey, setPrevGroupKey] = useState<string>(group.groupKey);
  const [activeVariant, setActiveVariant] = useState<Product>(group.defaultProduct);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync active variant directly during render when group prop updates
  if (group.groupKey !== prevGroupKey) {
    setPrevGroupKey(group.groupKey);
    setActiveVariant(group.defaultProduct);
  }

  const isOutOfStock = activeVariant.stock_quantity <= 0;

  const handleCardClick = () => {
    navigate(`/product/${activeVariant.id}`);
  };

  const handleSwatchClick = (e: React.MouseEvent, variant: Product) => {
    e.stopPropagation();
    setActiveVariant(variant);
  };

  const handleOptionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    if (!value || isOutOfStock) return;

    setSelectedOption(value);
    setLoading(true);

    try {
      await Promise.all([
        onAddToCart(activeVariant, value),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch {
      // Error handled upstream
    } finally {
      setLoading(false);
      setSelectedOption('');
    }
  };

  const frameShape = activeVariant.shape || activeVariant.category || 'ROUND';
  const frameColor = activeVariant.color_description || 'CLASSIC';

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col bg-[#F6F4EE] border border-[#E2DBD0] rounded-sm transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-transparent overflow-hidden">
        {/* Out of Stock Banner */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-xs shadow-xs">
            Out of Stock
          </div>
        )}

        <img
          src={activeVariant.image_url || ''}
          alt={activeVariant.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-4 flex-1 justify-between">
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-normal tracking-wide text-walters-navy">
              {activeVariant.name}
            </h3>
            <span className="text-sm font-medium text-walters-navy">
              {formatPrice(activeVariant.price_full_gbp)}
            </span>
          </div>

          <p className="text-[11px] font-light text-walters-charcoal/60 tracking-wider uppercase">
            {frameShape} &nbsp;·&nbsp; {frameColor}
          </p>

          {/* Color Palette Swatches */}
          {group.variants.length > 1 && (
            <div className="flex items-center space-x-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              {group.variants.map((variant) => {
                const isActive = variant.id === activeVariant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={(e) => handleSwatchClick(e, variant)}
                    title={variant.color_description}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-walters-navy ring-offset-1 border-white scale-110'
                        : 'border-black/20 opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={getColorSwatchStyle(variant.color_description)}
                  />
                );
              })}
              <span className="text-[10px] text-walters-charcoal/50 ml-1">
                ({group.variants.length} colors)
              </span>
            </div>
          )}
        </div>

        {/* Add to Bag / Select Dropdown */}
        <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
          {isOutOfStock ? (
            <div className="w-full h-10 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-full flex items-center justify-center cursor-not-allowed">
              Out of Stock
            </div>
          ) : isAdmin ? (
            <div className="w-full h-10 bg-offwhite border border-border rounded-full flex items-center justify-center space-x-1.5 text-navy text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Admin Preview Mode</span>
            </div>
          ) : loading ? (
            <div className="w-full h-10 bg-[#636267] rounded-full flex items-center justify-center text-white transition-colors duration-200">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
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
                  Non-Prescription ({formatPrice(activeVariant.price_full_gbp)})
                </option>
                <option value="Just Frames" className="text-black bg-white">
                  Just Frames
                </option>
                <option value="Prescription" className="text-black bg-white">
                  + Add Prescription
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-walters-navy pointer-events-none opacity-70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};