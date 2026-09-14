// src/components/ProductSuggestionsBar.tsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Product } from '../types/index';
import { ProductCard, type ProductGroup } from './ProductCard';
import { apiClient } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';

interface ProductSuggestionsBarProps {
  title?: string;
  subtitle?: string;
  contextPage?: 'product' | 'cart' | 'wishlist' | 'home';
  currentProduct?: Product;
  cartProducts?: Product[];
  wishlistProducts?: Product[];
}

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

export const ProductSuggestionsBar: React.FC<ProductSuggestionsBarProps> = ({
  title,
  subtitle,
  contextPage = 'product',
  currentProduct,
  cartProducts = [],
  wishlistProducts = [],
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<Product[]>('/products/');
        if (isMounted) {
          setAllProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load recommendation catalog', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // SMART RECOMMENDATION SCORING ENGINE
  const suggestedGroups = useMemo(() => {
    if (!allProducts.length) return [];

    // Excluded product IDs (e.g., current viewing product or items already in cart)
    const excludeIds = new Set<number>();
    if (currentProduct) excludeIds.add(currentProduct.id);
    cartProducts.forEach((p) => excludeIds.add(p.id));

    // Target attributes for context calculation
    const targetBrands = new Set<string>();
    const targetShapes = new Set<string>();

    if (contextPage === 'product' && currentProduct) {
      if (currentProduct.brand) targetBrands.add(currentProduct.brand.toLowerCase());
      if (currentProduct.shape) targetShapes.add(currentProduct.shape.toLowerCase());
    } else if (contextPage === 'cart' && cartProducts.length > 0) {
      cartProducts.forEach((p) => {
        if (p.brand) targetBrands.add(p.brand.toLowerCase());
        if (p.shape) targetShapes.add(p.shape.toLowerCase());
      });
    } else if (contextPage === 'wishlist' && wishlistProducts.length > 0) {
      wishlistProducts.forEach((p) => {
        if (p.brand) targetBrands.add(p.brand.toLowerCase());
        if (p.shape) targetShapes.add(p.shape.toLowerCase());
      });
    }

    // Score candidates based on matching characteristics
    const scoredProducts = allProducts
      .filter((p) => !excludeIds.has(p.id) && p.is_active && p.stock_quantity > 0)
      .map((p) => {
        let score = 0;
        const pBrand = p.brand?.toLowerCase() || '';
        const pShape = p.shape?.toLowerCase() || '';

        if (targetShapes.has(pShape)) score += 4;
        if (targetBrands.has(pBrand)) score += 3;
        if (p.is_bestseller) score += 2;
        if (p.is_featured) score += 1;

        return { product: p, score };
      });

    // Sort descending by relevance score
    scoredProducts.sort((a, b) => b.score - a.score);

    const resultList = scoredProducts.map((sp) => sp.product);
    return groupProductsByModel(resultList).slice(0, 10);
  }, [allProducts, contextPage, currentProduct, cartProducts, wishlistProducts]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

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

  // Dynamic Heading Labels per Context
  const defaultHeader = useMemo(() => {
    switch (contextPage) {
      case 'cart':
        return {
          title: title || 'Continue Shopping & Complete Your Look',
          subtitle: subtitle || 'Curated frames matching the styles currently in your shopping bag.',
        };
      case 'wishlist':
        return {
          title: title || 'Recommended Based on Your Wishlist',
          subtitle: subtitle || 'Handpicked optical styles aligned with your saved preferences.',
        };
      case 'product':
      default:
        return {
          title: title || 'You May Also Like',
          subtitle: subtitle || 'Discover similar frames with matching shapes and premium craftsmanship.',
        };
    }
  }, [contextPage, title, subtitle]);

  if (!loading && suggestedGroups.length === 0) return null;

  return (
    <section className="w-full py-10 my-6 bg-transparent border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ROW TITLE & SCROLL CONTROLS */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-walters-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Personalized Selection</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-walters-navy">
              {defaultHeader.title}
            </h2>
            <p className="text-xs sm:text-sm text-walters-slate/80 mt-1">
              {defaultHeader.subtitle}
            </p>
          </div>

          {/* ARROW NAVIGATION CONTROLS */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-walters-navy hover:bg-walters-navy hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-walters-navy hover:bg-walters-navy hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HORIZONTAL SCROLLING CAROUSEL */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden py-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="min-w-65 sm:min-w-70 max-w-70 h-80 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {suggestedGroups.map((group) => (
              <div
                key={group.groupKey}
                className="min-w-65 sm:min-w-70 max-w-70 snap-start shrink-0"
              >
                <ProductCard
                  group={group}
                  onAddToCart={handleAddToCart}
                  formatPrice={formatPrice}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};