//src/pages/admin/StockInventoryTab.Tsx
import React, { useMemo } from 'react';
import { Package, Plus, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { type AdminProduct } from '../../types/admin';
import { formatPrice } from '../../utils/formatter';

interface StockInventoryTabProps {
  products: AdminProduct[];
  onAddClick: () => void;
  onEditClick: (product: AdminProduct) => void;
  onDeleteClick: (id: string) => void;
}

export const StockInventoryTab: React.FC<StockInventoryTabProps> = ({
  products,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.stock - b.stock);
  }, [products]);

  return (
          <div className="p-4 bg-cream rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-semibold text-[#021438]">Product Inventory</h2>
          <span className="text-xs text-[#5E6470]">({products.length} active frames)</span>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#021438] text-white text-xs font-semibold rounded-full hover:bg-[#E6AA38] hover:text-[#021438]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Frame</span>
        </button>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#F8F6F0] border-b border-[#E5E0D8] text-[11px] font-semibold uppercase text-[#5E6470]">
              <tr>
                <th className="py-3 px-4">Frame</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Type & Shape</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Price (Full / Frame)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5E6470]">
                    <Package className="w-8 h-8 mx-auto mb-2 text-[#5E6470]/40" />
                    No frames in inventory. Click "Add Frame" to create one.
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p) => {
                  const isLowStock = p.stock <= 5;
                  return (
                    <tr key={p.id} className={`hover:bg-[#FDFBF7] ${isLowStock ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-[#F3F0E6] border border-[#E5E0D8] flex items-center justify-center overflow-hidden shrink-0">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="object-contain max-h-full" />
                            ) : (
                              <Package className="w-5 h-5 text-[#021438]/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#021438]">{p.name}</p>
                            <p className="text-[11px] text-[#5E6470]">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[#021438] font-medium">{p.color}</p>
                        <p className="text-[10px] text-[#5E6470] capitalize">{p.gender}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] rounded font-medium bg-[#F3F0E6] text-[#021438] uppercase">
                          {p.frameType}
                        </span>
                        <p className="text-[10px] text-[#5E6470] capitalize mt-0.5">{p.shape}</p>
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        {isLowStock ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{p.stock} (Low)</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            {p.stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#021438] tabular-nums">
                        {formatPrice(p.price_full_gbp)} / {formatPrice(p.price_frame_only_gbp)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button type="button" onClick={() => onEditClick(p)} className="p-1.5 text-[#5E6470] hover:text-[#021438]">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => onDeleteClick(p.id)} className="p-1.5 text-[#5E6470] hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};