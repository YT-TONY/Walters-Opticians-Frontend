// src/components/home/FeaturedFrames.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Glasses } from 'lucide-react';
import { ProductCard, type ProductGroup } from '../ProductCard';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types/index';

interface FeaturedFramesProps {
  products?: Product[] | { items?: Product[] } | null;
  loading?: boolean;
}

// Safely normalizes input whether it is a flat array or a paginated response object
const extractProductsArray = (input: unknown): Product[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'object' && input !== null && 'items' in input) {
    const items = (input as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Product[];
  }
  return [];
};

// Helper to safely extract category string
const getCategoryString = (category: unknown): string => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  if (typeof category === 'object' && category !== null) {
    const catObj = category as { slug?: string; name?: string; value?: string };
    return catObj.slug || catObj.name || catObj.value || '';
  }
  return String(category);
};

const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

// Validates that a product is either an Optical Frame or Sunglasses
const isEyewearProduct = (product: Product): boolean => {
  if (!product) return false;
  const catClean = normalizeStr(getCategoryString(product.category));

  // Reject contact lenses, solutions, drops, and care accessories
  if (
    catClean.includes('contact') ||
    catClean.includes('care') ||
    catClean.includes('solution') ||
    catClean.includes('drop')
  ) {
    return false;
  }

  // Allow default fallback if category field is empty or unassigned
  if (!catClean) return true;

  // Match optical frames, sunglasses, or general eyewear
  return (
    catClean.includes('optical') ||
    catClean.includes('frame') ||
    catClean.includes('glass') ||
    catClean.includes('sun') ||
    catClean.includes('shade') ||
    catClean.includes('eyewear')
  );
};

// Model grouping logic matching Catalog.tsx
const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const groupKey =
      product.model_code && product.model_code.trim() !== ''
        ? product.model_code.toLowerCase().trim()
        : `${(product.brand || '').toLowerCase().trim()}-${(product.name || '').toLowerCase().trim()}`;

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

export const FeaturedFrames: React.FC<FeaturedFramesProps> = ({ products, loading = false }) => {
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  // Safely extract and filter product groups, capped at 8 for the 4x2 grid
  const featuredGroups = useMemo(() => {
    const rawList = extractProductsArray(products);
    const eyewearOnly = rawList.filter(isEyewearProduct);
    return groupProductsByModel(eyewearOnly).slice(0, 8);
  }, [products]);

  // Handle quick actions matching Catalog.tsx
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

  return (
    <section className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-14 pb-4">
      {/* CENTERED SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-walters-gold block">
          Curated Eyewear
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-walters-navy font-bold tracking-tight">
          Newly Dropped Collections
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed">
          Discover our latest optical precision frames and signature luxury sunglasses crafted for everyday elegance.
        </p>
      </div>

      {/* 4-COLUMN x 2-ROW PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-slate-50 rounded-2xl h-80 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : featuredGroups.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-100 max-w-md mx-auto my-6 space-y-3">
          <Glasses className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">New seasonal frames arrive soon. Browse full catalog below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {featuredGroups.map((group) => (
            <ProductCard
              key={group.groupKey}
              group={group}
              onAddToCart={handleAddToCart}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      {/* CENTERED CTA BUTTON */}
      <div className="flex justify-center">
        <Link
          to="/catalog"
          className="inline-flex items-center space-x-2.5 px-8 py-3 bg-walters-navy text-white hover:bg-walters-gold hover:text-walters-navy font-medium text-xs tracking-wider rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>See More Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};