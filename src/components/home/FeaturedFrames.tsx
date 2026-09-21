// src/components/home/FeaturedFrames.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard, type ProductGroup } from '../ProductCard';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types/index';

interface FeaturedFramesProps {
  products: Product[];
}

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

// Strictly validates that a product is either an Optical Frame or Sunglasses
const isEyewearProduct = (product: Product): boolean => {
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

  // Match optical frames or sunglasses
  return (
    catClean.includes('optical') ||
    catClean.includes('frame') ||
    catClean.includes('glass') ||
    catClean.includes('sun') ||
    catClean.includes('shade')
  );
};

// Model grouping logic matching Catalog.tsx
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

export const FeaturedFrames: React.FC<FeaturedFramesProps> = ({ products }) => {
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  // Filter for eyewear only, group products, and cap at strictly 8 groups for the 4x2 grid
  const featuredGroups = useMemo(() => {
    const eyewearOnly = products.filter(isEyewearProduct);
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