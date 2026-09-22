// src/pages/Products.tsx

import React, { useEffect, useState, useMemo } from 'react';
import type { Product, GlassesPrescriptionData } from '../types';
import { apiClient } from '../api/client';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { useCurrency } from '../hooks/useCurrency';

interface ProductsProps {
  onAddToCart: (
    product: Product, 
    type: 'frames_only' | 'prescription' | 'standard', 
    rx?: GlassesPrescriptionData
  ) => void;
}

interface PaginatedProductsResponse {
  items?: Product[];
}

// Groups individual colorway products into single card model groups
const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const brandStr = (product.brand || '').toLowerCase().trim();
    const nameStr = (product.name || '').toLowerCase().trim();

    const groupKey = product.model_code && product.model_code.trim() !== ''
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

export const Products: React.FC<ProductsProps> = ({ onAddToCart }) => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [shapeFilter, setShapeFilter] = useState<string>('ALL');

  useEffect(() => {
    apiClient
      .get<Product[] | PaginatedProductsResponse>('/products/', {
        params: {
          eyewear_only: true,
          page_size: 100,
        },
      })
      .then((res) => {
        // Safely extract product array whether response is paginated or flat
        const productList = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.items || []);

        setProducts(productList);
      })
      .catch((err) => {
        console.error('Failed to fetch products catalog:', err);
        // Fallback demo data with model_code groupings
        setProducts([
          {
            id: 1,
            category: 'optical_frames',
            model_code: 'VAL-MARLOWE',
            name: 'Marlowe',
            brand: 'Walters Atelier',
            shape: 'Rectangle',
            color_description: 'Cobalt Depth',
            price_full_gbp: 185,
            price_frame_only_gbp: 125,
            stock_quantity: 12,
            is_active: true,
          },
          {
            id: 2,
            category: 'optical_frames',
            model_code: 'VAL-MARLOWE',
            name: 'Marlowe',
            brand: 'Walters Atelier',
            shape: 'Rectangle',
            color_description: 'Tortoise Shell',
            price_full_gbp: 185,
            price_frame_only_gbp: 125,
            stock_quantity: 8,
            is_active: true,
          },
          {
            id: 3,
            category: 'optical_frames',
            model_code: 'WAL-KENSINGTON',
            name: 'Kensington',
            brand: 'Walters Classic',
            shape: 'Round',
            color_description: 'Brushed Gold',
            price_full_gbp: 210,
            price_frame_only_gbp: 150,
            stock_quantity: 8,
            is_active: true,
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((p) => {
      const nameMatch = (p.name || '').toLowerCase().includes(query);
      const brandMatch = (p.brand || '').toLowerCase().includes(query);
      const colorMatch = (p.color_description || '').toLowerCase().includes(query);
      const modelMatch = (p.model_code || '').toLowerCase().includes(query);

      const matchesSearch = !query || nameMatch || brandMatch || colorMatch || modelMatch;
      const matchesShape = shapeFilter === 'ALL' || (p.shape || '').toLowerCase() === shapeFilter.toLowerCase();

      return matchesSearch && matchesShape;
    });
  }, [products, search, shapeFilter]);

  const productGroups = useMemo(() => {
    return groupProductsByModel(filteredProducts);
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-walters-cream px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header and Search Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">Optical Frames</h1>
            <p className="text-xs text-slate mt-1">
              Handcrafted frame collections tailored with prescription precision ({productGroups.length} models available).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by frame, brand, or color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-border rounded-xl text-xs bg-white text-charcoal focus:outline-none focus:border-navy"
            />
            <select
              value={shapeFilter}
              onChange={(e) => setShapeFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-xl text-xs bg-white text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Shapes</option>
              <option value="Round">Round</option>
              <option value="Rectangle">Rectangle</option>
              <option value="Aviator">Aviator</option>
              <option value="Square">Square</option>
              <option value="Cat-Eye">Cat-Eye</option>
            </select>
          </div>
        </div>

        {/* Catalog Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white/60 rounded-2xl h-80 animate-pulse border border-border" />
            ))}
          </div>
        ) : productGroups.length === 0 ? (
          <div className="text-center py-16 bg-white/40 rounded-2xl border border-border max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-lg text-navy font-semibold">No Optical Frames Found</h3>
            <p className="text-xs text-slate">Try adjusting your search query or shape filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productGroups.map((group) => (
              <ProductCard
                key={group.groupKey}
                group={group}
                formatPrice={formatPrice}
                onAddToCart={(product, option) => {
                  const optLower = option.toLowerCase();
                  if (optLower === 'just frames' || optLower === 'frames_only') {
                    onAddToCart(product, 'frames_only');
                  } else if (optLower === 'prescription') {
                    onAddToCart(product, 'prescription');
                  } else {
                    onAddToCart(product, 'standard');
                  }
                }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};