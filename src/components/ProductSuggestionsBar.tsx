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

interface PaginatedProductsResponse {
  items?: Product[];
}

const normalizeStr = (str?: string) => (str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '');

// Dynamic contact product detection based on schema metadata and category fields
const isContactProduct = (product: Product): boolean => {
  if (!product) return false;
  if (product.is_contact_lens === true) return true;

  const extProduct = product as Product & { category_type?: string };
  const pCategory = normalizeStr(product.category || '');
  const pCatType = normalizeStr(extProduct.category_type || '');
  const pName = normalizeStr(product.name || '');

  // Category name checks
  if (pCategory.includes('contact') || pCatType.includes('contact')) return true;
  if (pCategory.includes('lens') && !pCategory.includes('optical') && !pCategory.includes('frame') && !pCategory.includes('sun')) {
    return true;
  }
  if (pName.includes('contactlens') || pName.includes('contactlenses')) return true;

  // Dynamic schema attribute checks (Contact lens specific fields)
  if (
    Boolean(product.pack_size) ||
    Boolean(product.usage_type) ||
    Boolean(product.lens_design) ||
    Boolean(product.bc) ||
    Boolean(product.dia)
  ) {
    return true;
  }

  return false;
};

const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const brandStr = (product.brand || '').toLowerCase().trim();
    const nameStr = (product.name || '').toLowerCase().trim();

    const groupKey =
      product.model_code && product.model_code.trim() !== ''
        ? product.model_code.toLowerCase().trim()
        : `${brandStr}-${nameStr}`;

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

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<Product[] | PaginatedProductsResponse>('/products/', {
          params: { page_size: 100 },
        });

        if (isMounted) {
          const productList: Product[] = Array.isArray(res.data)
            ? res.data
            : (res.data?.items || []);

          setAllProducts(productList);
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

    let isTargetingContacts = false;
    if (contextPage === 'product' && currentProduct) {
      isTargetingContacts = isContactProduct(currentProduct);
    } else if (contextPage === 'cart' && cartProducts.length > 0) {
      isTargetingContacts = cartProducts.some((p) => isContactProduct(p));
    } else if (contextPage === 'wishlist' && wishlistProducts.length > 0) {
      isTargetingContacts = wishlistProducts.some((p) => isContactProduct(p));
    }

    let userSearches: string[] = [];
    try {
      userSearches = JSON.parse(localStorage.getItem('walters_search_history') || '[]').map((s: string) =>
        s.toLowerCase()
      );
    } catch {
      userSearches = [];
    }

    const targetBrands = new Set<string>();
    const targetShapes = new Set<string>();
    const targetColors = new Set<string>();

    const extractFeatures = (p: Product) => {
      if (p.brand) targetBrands.add(p.brand.toLowerCase());
      if (p.shape) targetShapes.add(p.shape.toLowerCase());
      if (p.color_description) targetColors.add(p.color_description.toLowerCase());
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach((c) => targetColors.add(c.toLowerCase()));
      }
    };

    if (currentProduct) extractFeatures(currentProduct);
    cartProducts.forEach(extractFeatures);
    wishlistProducts.forEach(extractFeatures);

    const scoredProducts = allProducts
      .filter((p) => {
        if (excludeIds.has(p.id) || p.is_active === false || p.stock_quantity <= 0) return false;

        const productIsContact = isContactProduct(p);
        if (isTargetingContacts && !productIsContact) return false;
        if (!isTargetingContacts && productIsContact) return false;

        return true;
      })
      .map((p) => {
        let score = 0;
        const pBrand = (p.brand || '').toLowerCase();
        const pShape = (p.shape || '').toLowerCase();
        const pColor = (p.color_description || (p.colors ? p.colors.join(' ') : '')).toLowerCase();
        const pName = (p.name || '').toLowerCase();

        if (targetShapes.has(pShape)) score += 5;
        if (targetBrands.has(pBrand)) score += 4;
        if (targetColors.has(pColor)) score += 3;

        userSearches.forEach((search) => {
          if (pName.includes(search) || pBrand.includes(search) || pShape.includes(search)) {
            score += 3;
          }
        });

        if (p.is_bestseller) score += 2;
        if (p.is_featured) score += 1;

        return { product: p, score };
      });

    scoredProducts.sort((a, b) => b.score - a.score);
    const resultList = scoredProducts.map((sp) => sp.product);

    return groupProductsByModel(resultList).slice(0, 10);
  }, [allProducts, contextPage, currentProduct, cartProducts, wishlistProducts]);

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
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-walters-navy tracking-tight">
          {defaultTitle}
        </h2>
      </div>

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