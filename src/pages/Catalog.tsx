// src/pages/Catalog.tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Product } from '../types/index';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleAddFrameOnly, handleSelectPrescription } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast.error('Failed to load catalog. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#021438]">Optical Frames</h1>
        <p className="text-sm text-[#5E6470] mt-2">
          Select a frame and add your custom prescription, or buy them frame-only.
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-100 rounded-3xl h-80 animate-pulse border border-[#E5E0D8]"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-[#5E6470]">
          <p>No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddFrameOnly={handleAddFrameOnly}
              onSelectPrescription={handleSelectPrescription}
            />
          ))}
        </div>
      )}
    </div>
  );
};