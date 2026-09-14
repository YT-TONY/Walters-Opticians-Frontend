// src/components/ProductSuggestionsBar.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import type { Product } from '../types/index';
import { ProductCard, type ProductGroup } from './ProductCard';
import { apiClient } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';

interface ProductSuggestionsBarProps {
  title?: string;
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
  contextPage = 'product',
  currentProduct,
  cartProducts = [],
  wishlistProducts = [],
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  // Dynamic Scroll Fade-In / Fade-Out Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  const suggestedGroups = useMemo(() => {
    if (!allProducts.length) return [];

    const excludeIds = new Set<number>();
    if (currentProduct) excludeIds.add(currentProduct.id);
    cartProducts.forEach((p) => excludeIds.add(p.id));

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

    scoredProducts.sort((a, b) => b.score - a.score);

    const resultList = scoredProducts.map((sp) => sp.product);
    return groupProductsByModel(resultList).slice(0, 10);
  }, [allProducts, contextPage, currentProduct, cartProducts, wishlistProducts]);

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

  const defaultTitle = useMemo(() => {
    if (title) return title;
    switch (contextPage) {
      case 'cart':
        return 'Continue Shopping';
      case 'wishlist':
        return 'Recommended For You';
      case 'product':
      default:
        return 'You May Also Like';
    }
  }, [contextPage, title]);

  if (!loading && suggestedGroups.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`w-full py-12 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
        
        {/* Simple Header */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-walters-navy tracking-tight">
            {defaultTitle}
          </h2>
        </div>

        {/* Full-Width Scrollable Row with Soft Edge Mask Fade */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="min-w-67.5 max-w-67.5 h-80 bg-neutral-100/80 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <div
              className="flex gap-6 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
              }}
            >
              {suggestedGroups.map((group) => (
                <div
                  key={group.groupKey}
                  className="min-w-65 sm:min-w-70 max-w-70 snap-start shrink-0 transition-transform duration-300 hover:-translate-y-1"
                >
                  <ProductCard
                    group={group}
                    onAddToCart={handleAddToCart}
                    formatPrice={formatPrice}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};