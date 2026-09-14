// src/pages/Favorites.tsx
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { useFavorite } from '../hooks/useFavorite';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import type { Product } from '../types';

const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const groupKey =
      product.model_code && product.model_code.trim() !== ''
        ? product.model_code.toLowerCase().trim()
        : `${product.brand.toLowerCase().trim()}-${product.name.toLowerCase().trim()}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(product);
  });

  return Array.from(groupMap.entries()).map(([key, variants]) => ({
    groupKey: key,
    defaultProduct: variants[0],
    variants,
  }));
};

export const Favorites: React.FC = () => {
  const { favorites, clearFavorites, totalFavoritesCount, isLoading } = useFavorite();
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const productGroups = useMemo(() => {
    return groupProductsByModel(favorites);
  }, [favorites]);

  const handleAddToCart = (product: Product, option: string) => {
    switch (option.toLowerCase()) {
      case 'prescription':
        handleSelectPrescription(product);
        break;
      case 'just frames':
      case 'frames_only':
        handleAddFrameOnly(product);
        break;
      case 'standard':
      default:
        handleAddStandard(product);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-[70vh]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200/80">
        <div>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-walters-navy/70 hover:text-walters-navy mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-walters-navy">My Saved Wishlist</h1>
            <span className="px-3 py-0.5 bg-walters-navy/10 text-walters-navy rounded-full text-xs font-bold">
              {totalFavoritesCount} {totalFavoritesCount === 1 ? 'Frame' : 'Frames'}
            </span>
          </div>
        </div>

        {totalFavoritesCount > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-full transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Wishlist
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {totalFavoritesCount === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <Heart className="w-8 h-8 fill-rose-100 text-rose-500" />
          </div>
          
          <h2 className="font-serif text-2xl font-bold text-walters-navy mb-2">Your wishlist is empty</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
            Keep track of your favorite optical frames and luxury sunglasses by tapping the heart icon on any product.
          </p>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-walters-navy text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-walters-navy/90 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-walters-gold" />
            Explore Collections
          </Link>
        </div>
      ) : (
        /* FAVORITES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productGroups.map((group) => (
            <ProductCard
              key={group.groupKey}
              group={group}
              onAddToCart={handleAddToCart}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </div>
  );
};