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

  // Group products and cap at strictly 6 groups for the 3x2 grid
  const featuredGroups = useMemo(() => {
    return groupProductsByModel(products).slice(0, 6);
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
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      {/* SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-walters-gold">
          Curated Eyewear
        </span>
        <h2 className="text-3xl font-extrabold text-walters-navy tracking-tight font-serif">
          Newly Dropped Collections
        </h2>
        <p className="text-neutral-500 text-sm">
          Discover our latest optical precision frames and signature luxury sunglasses crafted for everyday elegance.
        </p>
      </div>

      {/* 3x2 PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-walters-navy text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <span>See More Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};