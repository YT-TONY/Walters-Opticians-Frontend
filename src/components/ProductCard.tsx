// src/components/ProductCard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from '../types/index';
import { useFavorite } from '../hooks/useFavorite';

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

const getColorSwatchStyle = (colorDesc: string, colorCode?: string): React.CSSProperties => {
  if (colorCode && colorCode.trim() !== '') {
    const trimmedCode = colorCode.trim();
    if (
      trimmedCode.startsWith('#') ||
      trimmedCode.startsWith('rgb') ||
      trimmedCode.startsWith('hsl') ||
      trimmedCode.startsWith('linear-gradient')
    ) {
      return trimmedCode.startsWith('linear-gradient')
        ? { background: trimmedCode }
        : { backgroundColor: trimmedCode };
    }
    if (/^[0-9a-fA-F]{3}$\vert{}^[0-9a-fA-F]{6}$/.test(trimmedCode)) {
      return { backgroundColor: `#${trimmedCode}` };
    }
  }

  const lower = colorDesc.toLowerCase();
  const hexMatch = lower.match(/#([0-9a-f]{3,6})/i);
  if (hexMatch) {
    return { backgroundColor: hexMatch[0] };
  }

  if (lower.includes('tortoise') || lower.includes('havana') || lower.includes('amber')) {
    return { background: 'linear-gradient(135deg, #4a2810 0%, #b45309 50%, #d97706 100%)' };
  }
  if (lower.includes('rose gold')) {
    return { background: 'linear-gradient(135deg, #fb7185 0%, #fecdd3 50%, #e11d48 100%)' };
  }
  if (lower.includes('gold')) {
    return { background: 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #ca8a04 100%)' };
  }
  if (lower.includes('gunmetal') || lower.includes('bronze') || lower.includes('titanium')) {
    return { background: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)' };
  }
  if (lower.includes('cobalt') || lower.includes('blue') || lower.includes('navy')) {
    return { backgroundColor: '#1e3a8a' };
  }
  if (lower.includes('green') || lower.includes('emerald') || lower.includes('olive')) {
    return { backgroundColor: '#14532d' };
  }
  if (lower.includes('yellow')) {
    return { backgroundColor: '#eab308' };
  }
  if (lower.includes('black') || lower.includes('dark')) {
    return { backgroundColor: '#18181b' };
  }
  if (lower.includes('pink') || lower.includes('marble') || lower.includes('rose')) {
    return { background: 'linear-gradient(135deg, #f472b6 0%, #fbcfe8 100%)' };
  }
  if (lower.includes('silver') || lower.includes('grey') || lower.includes('gray')) {
    return { backgroundColor: '#94a3b8' };
  }
  if (lower.includes('clear') || lower.includes('crystal') || lower.includes('transparent')) {
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
  const { isFavorite, toggleFavorite } = useFavorite();

  const [prevGroupKey, setPrevGroupKey] = useState<string>(group.groupKey);
  const [activeVariant, setActiveVariant] = useState<Product>(group.defaultProduct);
  const [adding, setAdding] = useState<boolean>(false);

  if (group.groupKey !== prevGroupKey) {
    setPrevGroupKey(group.groupKey);
    setActiveVariant(group.defaultProduct);
  }

  const isWishlisted = isFavorite(activeVariant.id);
  const isOutOfStock = activeVariant.stock_quantity <= 0;

  const getBadgeInfo = () => {
    if (isOutOfStock) {
      return {
        label: 'OUT OF STOCK',
        style: 'bg-rose-600 text-white border-transparent',
        queryKey: null,
      };
    }
    if (activeVariant.is_bestseller) {
      return {
        label: 'BESTSELLER',
        style: 'bg-[#1B75BC]/40 text-blue-950 border border-[#1B75BC]/30',
        queryKey: 'is_bestseller=true',
      };
    }
    if (activeVariant.price_full_gbp >= 200) {
      return {
        label: 'LUXURY',
        style: 'bg-amber-500/40 text-amber-950 border border-amber-500/30',
        queryKey: 'tier=luxury',
      };
    }
    if (activeVariant.price_full_gbp <= 100) {
      return {
        label: 'BUDGET',
        style: 'bg-red-500/40 text-red-950 border border-red-500/30',
        queryKey: 'tier=budget',
      };
    }
    return {
      label: 'BRIDGE',
      style: 'bg-orange-500/40 text-orange-950 border border-orange-500/30',
      queryKey: 'tier=bridge',
    };
  };

  const badge = getBadgeInfo();

  const handleCardClick = () => {
    navigate(`/product/${activeVariant.id}`);
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (badge.queryKey) {
      navigate(`/catalog?${badge.queryKey}`);
    }
  };

  // UNIFIED BRAND CLICK ROUTING
  const handleBrandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeVariant.brand) {
      const slug = activeVariant.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/brands/${slug}`);
    }
  };

  const handleSwatchClick = (e: React.MouseEvent, variant: Product) => {
    e.stopPropagation();
    setActiveVariant(variant);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      await onAddToCart(activeVariant, 'Standard');
    } catch {
      // Handled upstream
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer select-none transition-all duration-300"
    >
      <div className="relative w-full aspect-square bg-[#fffefcf3] rounded-3xl overflow-hidden flex items-center justify-center p-6 transition-all group-hover:shadow-md">
        
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleBadgeClick}
            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-2xs backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer ${badge.style}`}
          >
            {badge.label}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(activeVariant);
            }}
            className={`w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer ${
              isWishlisted ? 'text-rose-500' : 'text-walters-navy/80 hover:text-walters-navy'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-walters-navy/80 hover:text-walters-navy flex items-center justify-center shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || adding}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-walters-navy/80 hover:text-walters-navy flex items-center justify-center shadow-md backdrop-blur-xs transition-all hover:scale-110 disabled:opacity-40 cursor-pointer"
            title="Add to Bag"
          >
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin text-walters-navy" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </button>
        </div>

        <img
          src={activeVariant.image_url || ''}
          alt={activeVariant.name}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-50' : ''
          }`}
        />
      </div>

      <div className="pt-3.5 px-1 space-y-1">
        <div className="flex items-center justify-between text-xs text-walters-charcoal/60 font-medium">
          <button
            type="button"
            onClick={handleBrandClick}
            className="uppercase tracking-wider truncate max-w-[85%] font-semibold text-slate-700 hover:underline hover:text-walters-navy text-left cursor-pointer"
          >
            {activeVariant.brand || activeVariant.category || 'Walters'}
          </button>
        </div>

        <h3 className="font-semibold text-sm sm:text-base text-walters-navy tracking-tight line-clamp-1">
          {activeVariant.name}
        </h3>

        <div className="flex items-baseline space-x-2 pt-0.5">
          <span className="font-bold text-sm sm:text-base text-walters-navy tabular-nums">
            {formatPrice(activeVariant.price_full_gbp)}
          </span>
          {activeVariant.price_frame_only_gbp && activeVariant.price_frame_only_gbp < activeVariant.price_full_gbp && (
            <span className="text-xs text-walters-charcoal/40 line-through tabular-nums">
              {formatPrice(Math.round(activeVariant.price_full_gbp * 1.15))}
            </span>
          )}
        </div>

        {group.variants.length > 1 && (
          <div className="flex items-center space-x-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
            {group.variants.map((variant) => {
              const isActive = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => handleSwatchClick(e, variant)}
                  title={variant.color_description}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-walters-navy ring-offset-1 border-white scale-110'
                      : 'border-black/20 opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={getColorSwatchStyle(variant.color_description, variant.color_code)}
                />
              );
            })}
            <span className="text-[10px] text-walters-charcoal/50 ml-1">
              ({group.variants.length} colors)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};