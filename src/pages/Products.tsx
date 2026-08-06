import React, { useEffect, useState } from 'react';
import type { Product, PrescriptionData } from '../types';
import { apiClient } from '../api/client';
import { ProductCard } from '../components/ProductCard';

interface ProductsProps {
  onAddToCart: (product: Product, type: 'frames_only' | 'prescription', rx?: PrescriptionData) => void;
}

export const Products: React.FC<ProductsProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [shapeFilter, setShapeFilter] = useState<string>('ALL');

  useEffect(() => {
    apiClient.get<Product[]>('/products')
      .then((res) => setProducts(res.data))
      .catch(() => {
        // Fallback data matching updated schema
        setProducts([
          {
            id: 1,
            name: 'Marlowe',
            brand: 'Walters Atelier',
            shape: 'Rectangle',
            color_description: 'Tortoise Shell',
            price_full_gbp: 185,
            price_frame_only_gbp: 125,
            stock_quantity: 12,
            is_active: true,
          },
          {
            id: 2,
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

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesShape = shapeFilter === 'ALL' || p.shape === shapeFilter;
    return matchesSearch && matchesShape;
  });

  return (
    <div className="min-h-screen bg-[#FBFAF5] py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E0D8] pb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#021438]">Optical Frames</h1>
            <p className="text-xs text-[#5E6470] mt-1">Handcrafted frame collections tailored with prescription precision.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search frames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs bg-white text-[#1A1A1A] focus:outline-none focus:border-[#021438]"
            />
            <select
              value={shapeFilter}
              onChange={(e) => setShapeFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs bg-white text-[#1A1A1A] focus:outline-none"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>

      </div>
    </div>
  );
};