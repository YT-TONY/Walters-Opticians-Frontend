//src/pages/Products.tsx
// src/pages/Products.tsx
import React, { useEffect, useState, useMemo } from 'react';
import type { Product, PrescriptionData } from '../types';
import { apiClient } from '../api/client';
import { ProductCard, type ProductGroup } from '../components/ProductCard';

interface ProductsProps {
  onAddToCart: (product: Product, type: 'frames_only' | 'prescription', rx?: PrescriptionData) => void;
}

// Groups individual colorway products into single card model groups
const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const groupKey = product.model_code && product.model_code.trim() !== ''
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

export const Products: React.FC<ProductsProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [shapeFilter, setShapeFilter] = useState<string>('ALL');

  useEffect(() => {
    apiClient
      .get<Product[]>('/products')
      .then((res) => setProducts(res.data))
      .catch(() => {
        // Fallback demo data with model_code groupings
        setProducts([
          {
            id: 1,
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
      });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.color_description.toLowerCase().includes(search.toLowerCase()) ||
        (p.model_code && p.model_code.toLowerCase().includes(search.toLowerCase()));

      const matchesShape = shapeFilter === 'ALL' || p.shape.toLowerCase() === shapeFilter.toLowerCase();
      return matchesSearch && matchesShape;
    });
  }, [products, search, shapeFilter]);

  const productGroups = useMemo(() => {
    return groupProductsByModel(filteredProducts);
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-cream10 px-6 py-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productGroups.map((group) => (
            <ProductCard
              key={group.groupKey}
              group={group}
              formatPrice={(price) => `£${price.toFixed(2)}`}
              onAddToCart={(product, option) => {
                if (option === 'Just Frames' || option === 'Standard') {
                  onAddToCart(product, 'frames_only');
                } else if (option === 'Prescription') {
                  onAddToCart(product, 'prescription');
                }
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};