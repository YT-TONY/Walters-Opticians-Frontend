import React, { useEffect, useState } from 'react';
import type{ Product } from '../../types';
import { apiClient } from '../../api/client';
import { Plus, Trash2, Edit } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiClient.get<Product[]>('/admin/products')
      .then((res) => setProducts(res.data))
      .catch(() => {
        // Fallback placeholder if local backend is empty
        setProducts([
          {
            id: 1,
            name: 'Marlowe',
            brand: 'Walters Atelier',
            shape: 'Rectangle',
            color_description: 'Tortoise Shell',
            price_full_gbp: 185,
            price_frame_only_gbp: 125,
            stock_quantity: 24,
            is_active: true,
          },
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFAF5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#021438]">Inventory Management</h1>
            <p className="text-xs text-[#5E6470]">Manage frames catalog and optical stock</p>
          </div>
          <button className="px-4 py-2 bg-[#021438] text-[#FBFAF5] rounded-xl text-xs font-bold hover:bg-[#E6AA38] hover:text-[#021438] flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Frame</span>
          </button>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F0E6] text-[#5E6470] uppercase font-semibold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Frame & Brand</th>
                <th className="p-4">Color</th>
                <th className="p-4">Shape</th>
                <th className="p-4">Rx Price</th>
                <th className="p-4">Frame Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-[#FBFAF5]">
                  <td className="p-4 font-mono text-[#5E6470]">#{item.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#021438]">{item.name}</div>
                    <div className="text-[10px] text-[#5E6470]">{item.brand}</div>
                  </td>
                  <td className="p-4">{item.color_description}</td>
                  <td className="p-4">{item.shape}</td>
                  <td className="p-4 font-bold text-[#021438]">£{item.price_full_gbp}</td>
                  <td className="p-4 font-bold text-[#5E6470]">£{item.price_frame_only_gbp}</td>
                  <td className="p-4">{item.stock_quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button className="p-1 hover:text-[#E6AA38]"><Edit className="w-4 h-4" /></button>
                    <button className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};