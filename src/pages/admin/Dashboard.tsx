// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import type { Product } from '../../types/index';
import { Package, ShoppingCart, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'products' | 'orders';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Defining and executing the fetch entirely inside the useEffect.
    // 2. This prevents the linter from thinking we are executing synchronous state updates.
    (async () => {
      try {
        const res = await apiClient.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleProductStatus = async (id: string | number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/products/${id}`, { is_active: !currentStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      );
      toast.success('Product status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#021438]">Admin Portal</h1>
          <p className="text-sm text-[#5E6470] mt-1">Manage catalog inventory and customer orders.</p>
        </div>
        
        <div className="flex bg-[#F3F0E6] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'products' ? 'bg-white shadow-sm text-[#021438]' : 'text-[#5E6470] hover:text-[#021438]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'orders' ? 'bg-white shadow-sm text-[#021438]' : 'text-[#5E6470] hover:text-[#021438]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders</span>
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E5E0D8] flex justify-between items-center bg-[#FBFAF5]">
            <h2 className="font-serif font-bold text-[#021438]">Product Inventory</h2>
            <button className="bg-[#021438] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Frame</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5E6470]">
              <thead className="bg-[#FAF8F5] text-xs uppercase font-semibold text-[#021438] border-b border-[#E5E0D8]">
                <tr>
                  <th className="px-6 py-4">Frame Name</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Price (Full / Frame)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">Loading inventory...</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FBFAF5] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#021438]">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.stock_quantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">£{product.price_full_gbp} / £{product.price_frame_only_gbp}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${product.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                        >
                          {product.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="text-[#5E6470] hover:text-[#021438] transition-colors"><Edit3 className="w-4 h-4 inline" /></button>
                        <button className="text-[#5E6470] hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E5E0D8] bg-[#FBFAF5]">
            <h2 className="font-serif font-bold text-[#021438]">Customer Orders</h2>
          </div>
          <div className="p-16 text-center text-[#5E6470]">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-[#E5E0D8]" />
            <p className="text-sm">Order tracking system requires connection to the backend endpoints.</p>
          </div>
        </div>
      )}
    </div>
  );
};