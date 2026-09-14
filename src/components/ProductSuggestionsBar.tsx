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
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  // Scroll entry animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch catalog products
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

  // Recommendation engine scoring
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

  // 10-Second Auto-Scroll Interval (Pauses when user hovers over cards)
  useEffect(() => {
    if (isHovered || loading || suggestedGroups.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const step = 310;

        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isHovered, loading, suggestedGroups]);

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
        return 'Similar Styles';
    }
  }, [contextPage, title]);

  if (!loading && suggestedGroups.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`w-[80vw] mx-auto py-12 overflow-hidden transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* Centered Title Header */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-walters-navy tracking-tight">
          {defaultTitle}
        </h2>
      </div>

      {/* 80% Viewport Bounded Carousel Container */}
      {loading ? (
        <div className="w-full flex gap-6 overflow-hidden py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="min-w-70 max-w-70 h-84 bg-neutral-100/70 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto py-4 px-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
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
                className="min-w-65 sm:min-w-71.25 max-w-71.25 snap-start shrink-0 transition-transform duration-300 hover:-translate-y-1"
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
    </section>
  );
};