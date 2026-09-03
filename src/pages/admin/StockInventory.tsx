// src/pages/admin/StockInventory.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import { StockInventoryTab } from './StockInventoryTab';
import { ProductModal } from './ProductModal';
import type { BrandInventoryGroup, AdminProduct } from '../../types/admin';
import { formatPrice } from '../../utils/formatter';

const PAGE_SIZE = 10;

export const AdminStockInventory: React.FC = () => {
  // Brand Groups State
  const [groups, setGroups] = useState<BrandInventoryGroup[]>([]);
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});

  // Inventory Table State
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Initial Load
  useEffect(() => {
    let isMounted = true;

    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const brandGroups = await adminApi.getInventoryByBrand();

        if (!isMounted) return;

        setGroups(brandGroups);

        // Dynamic brand options derived from API response
        const brandNames = brandGroups.map((g) => g.brand_name);
        setAvailableBrands(brandNames);

        // Map BrandProductItem objects to AdminProduct
        const flattenedProducts: AdminProduct[] = brandGroups.flatMap((group) =>
          group.products.map((item) => ({
            id: String(item.id),
            name: item.name,
            brand: group.brand_name,
            color: 'Standard',
            gender: 'unisex',
            shape: 'round',
            frameType: 'full-rim',
            price_full_gbp: item.price_full_gbp,
            price_frame_only_gbp: item.price_frame_only_gbp,
            stock: item.stock_quantity,
            image_url: item.image_url || '',
            gallery: item.image_url ? [item.image_url] : [],
          }))
        );

        setProducts(flattenedProducts);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load inventory data:', error);
          toast.error('Failed to load store inventory.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by search and selected brand
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesBrand =
        selectedBrand === 'all' ||
        product.brand.toLowerCase() === selectedBrand.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.color.toLowerCase().includes(query) ||
        (product.model_code && product.model_code.toLowerCase().includes(query));

      return matchesBrand && matchesQuery;
    });
  }, [products, selectedBrand, searchQuery]);

  // Paginated Slicing
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const toggleBrand = (brandName: string) => {
    setExpandedBrands((prev) => ({ ...prev, [brandName]: !prev[brandName] }));
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: Omit<AdminProduct, 'id'>) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...productData, id: p.id } : p))
      );
      toast.success(`Updated frame "${productData.name}".`);
    } else {
      const newProduct: AdminProduct = {
        ...productData,
        id: String(Date.now()),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`Added new frame "${productData.name}" to stock.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this frame?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Frame deleted from stock.');
  };

  return (
    <div className="space-y-8 font-sans text-charcoal antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Stock Inventory & Brand Grouping</h1>
          <p className="text-xs text-slate mt-1">
            Manage live frame stock, register products, and view brand catalog breakdowns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-[#1B75BC] transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Frame</span>
        </button>
      </div>

      {/* SECTION 1: Live Stock Inventory Table & Controls */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
            Live Optical Inventory Table
          </h2>
        </div>

        <StockInventoryTab
          products={paginatedProducts}
          availableBrands={availableBrands}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedBrand={selectedBrand}
          onBrandChange={handleBrandChange}
          isLoading={isLoading}
          onAddClick={handleOpenAddModal}
          onEditClick={handleOpenEditModal}
          onDeleteClick={handleDeleteProduct}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredProducts.length}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* SECTION 2: Brand Accordions Breakdown */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider px-1">
          Brand Catalog Breakdown
        </h3>

        {groups.map((group) => {
          const isOpen = !!expandedBrands[group.brand_name];
          return (
            <div key={group.brand_name} className="bg-white border border-border rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleBrand(group.brand_name)}
                className="w-full p-4 bg-[#F8F6F0] flex items-center justify-between hover:bg-border/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-[#1B75BC]" />
                  <span className="font-bold text-sm text-navy">{group.brand_name}</span>
                  <span className="text-xs text-slate">({group.total_items_count} items)</span>
                </div>

                <div className="flex items-center space-x-3">
                  {group.low_stock_count > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>{group.low_stock_count} Low Stock</span>
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate" /> : <ChevronDown className="w-4 h-4 text-slate" />}
                </div>
              </button>

              {isOpen && (
                <div className="overflow-x-auto p-4 border-t border-border">
                  <table className="w-full text-left text-xs text-charcoal">
                    <thead className="bg-[#F8F6F0] text-[10px] font-semibold uppercase text-slate">
                      <tr>
                        <th className="py-2 px-3">Frame Name</th>
                        <th className="py-2 px-3">Stock Level</th>
                        <th className="py-2 px-3">Full Price</th>
                        <th className="py-2 px-3">Frame Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {group.products.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FDFBF7]">
                          <td className="py-2 px-3 font-semibold text-navy">{item.name}</td>
                          <td className="py-2 px-3">
                            {item.is_low_stock ? (
                              <span className="text-rose-600 font-bold">{item.stock_quantity} (Low Stock)</span>
                            ) : (
                              <span>{item.stock_quantity} in stock</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-bold">{formatPrice(item.price_full_gbp)}</td>
                          <td className="py-2 px-3">{formatPrice(item.price_frame_only_gbp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Frame Add/Edit Modal Dialog */}
      <ProductModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default AdminStockInventory;