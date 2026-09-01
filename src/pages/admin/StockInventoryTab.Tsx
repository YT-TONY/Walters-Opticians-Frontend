// src/pages/admin/StockInventoryTab.tsx
import React from 'react';
import { Package, Plus, AlertTriangle, Edit3, Trash2, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { type AdminProduct } from '../../types/admin';
import { formatPrice } from '../../utils/formatter';

interface StockInventoryTabProps {
  products: AdminProduct[];
  availableBrands: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  isLoading?: boolean;
  onAddClick: () => void;
  onEditClick: (product: AdminProduct) => void;
  onDeleteClick: (id: string) => void;
  
  // Pagination Props
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

export const StockInventoryTab: React.FC<StockInventoryTabProps> = ({
  products,
  availableBrands,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  isLoading = false,
  onAddClick,
  onEditClick,
  onDeleteClick,
  currentPage = 1,
  totalPages = 1,
  totalCount,
  onPageChange,
}) => {
  const displayTotal = totalCount !== undefined ? totalCount : products.length;

  return (
    <div className="space-y-4 font-sans text-charcoal antialiased">
      
      {/* Search, Filter, and Action Toolbar */}
      <div className="p-4 bg-cream rounded-2xl border border-border space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        
        {/* Real-time Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 12,000+ frames by model name, brand, or color..."
            className="w-full bg-white border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-navy placeholder-slate/60 focus:outline-none focus:border-navy transition-all"
          />
          <Search className="w-4 h-4 text-slate/60 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Dynamic Brand Dropdown Filter */}
          <div className="flex items-center space-x-1.5 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-navy shrink-0" />
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full sm:w-56 bg-white border border-border text-navy rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Brands ({availableBrands.length} in DB)</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Add Frame Trigger */}
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-gold hover:text-navy transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Frame</span>
          </button>
        </div>

      </div>

      {/* Inventory Table Container */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-offwhite border-b border-border text-[11px] font-semibold uppercase tracking-wider text-slate">
              <tr>
                <th className="py-3 px-4">Frame</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Type & Shape</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Price (Full / Frame)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 text-navy animate-spin" />
                    Querying optical inventory database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate/40" />
                    No optical frames match your search or brand criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.stock <= 5;
                  return (
                    <tr key={p.id} className={`hover:bg-[#FDFBF7] transition-colors ${isLowStock ? 'bg-rose-50/40' : ''}`}>
                      
                      {/* Frame Thumbnail + Name + Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-offwhite border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="object-contain max-h-full max-w-full" />
                            ) : (
                              <Package className="w-5 h-5 text-navy/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-navy">{p.name}</p>
                            <p className="text-[11px] font-semibold text-gold">{p.brand}</p>
                          </div>
                        </div>
                      </td>

                      {/* Color & Gender */}
                      <td className="py-3 px-4">
                        <p className="text-navy font-medium">{p.color || 'N/A'}</p>
                        <p className="text-[10px] text-slate capitalize">{p.gender}</p>
                      </td>

                      {/* Type & Shape */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] rounded font-semibold bg-offwhite text-navy uppercase">
                          {p.frameType}
                        </span>
                        <p className="text-[10px] text-slate capitalize mt-0.5">{p.shape}</p>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4 tabular-nums">
                        {isLowStock ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{p.stock} (Low Stock)</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            {p.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* Price (Full / Frame Only) */}
                      <td className="py-3 px-4 font-bold text-navy tabular-nums">
                        {formatPrice(p.price_full_gbp)} / <span className="font-normal text-slate">{formatPrice(p.price_frame_only_gbp)}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => onEditClick(p)}
                            className="p-1.5 text-slate hover:text-navy hover:bg-offwhite rounded-lg transition-colors cursor-pointer"
                            title="Edit Frame Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(p.id)}
                            className="p-1.5 text-slate hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Frame"
                          >
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

        {/* Footer Pagination Bar */}
        {onPageChange && totalPages > 1 && (
          <div className="p-4 bg-offwhite border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate">
            <div>
              Showing <strong className="text-navy">{products.length}</strong> of <strong className="text-navy">{displayTotal.toLocaleString()}</strong> frames (Page {currentPage} of {totalPages})
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                className="px-3 py-1.5 bg-white border border-border rounded-lg text-navy font-semibold hover:bg-gold transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 font-bold text-navy bg-white border border-border rounded-lg">
                {currentPage}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                className="px-3 py-1.5 bg-white border border-border rounded-lg text-navy font-semibold hover:bg-gold transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};