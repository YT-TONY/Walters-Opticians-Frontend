// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Package, ShoppingBag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { type AdminProduct, type UKBookingRequest, type FrameShape, type FrameType } from '../../types/admin';
import { useOrders } from '../../hooks/useOrder';
import { StockInventoryTab } from './StockInventoryTab';
import { OrdersTab } from './OrdersTab';
import { BookingsTab } from './BookingsTab';
import { ProductModal } from './ProductModal';
import { productsApi, type BackendProduct } from '../../api/products';

const mapBackendToAdminProduct = (p: BackendProduct): AdminProduct => ({
  id: String(p.id),
  name: p.name,
  brand: p.brand,
  color: p.color_description,
  gender: 'unisex',
  shape: (p.shape?.toLowerCase() as FrameShape) || 'round',
  frameType: ((p as { frame_type?: string }).frame_type as FrameType) || 'full-rim',
  price_full_gbp: p.price_full_gbp,
  price_frame_only_gbp: p.price_frame_only_gbp,
  stock: p.stock_quantity,
  image_url: p.image_url,
  gallery: p.gallery && p.gallery.length > 0 ? p.gallery : (p.image_url ? [p.image_url] : []),
});

const mapAdminToBackendCreate = (formData: Omit<AdminProduct, 'id'>) => ({
  name: formData.name,
  brand: formData.brand,
  shape: formData.shape,
  color_description: formData.color,
  frame_type: formData.frameType || 'full-rim',
  price_full_gbp: formData.price_full_gbp,
  allow_frame_only: true,
  price_frame_only_gbp: formData.price_frame_only_gbp,
  image_url: formData.image_url || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80',
  gallery: formData.gallery,
  stock_quantity: formData.stock,
  is_active: true,
  is_featured: false,
});

export const AdminDashboard: React.FC = () => {
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'bookings'>('products');

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [bookings, setBookings] = useState<UKBookingRequest[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Search & Brand Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [dbProducts, brands] = await Promise.all([
          productsApi.getAll(),
          productsApi.getBrands(),
        ]);

        if (isMounted) {
          setProducts(dbProducts.map(mapBackendToAdminProduct));
          setAvailableBrands(brands);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to fetch inventory & brands from database.');
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this frame from inventory?')) {
      try {
        await productsApi.delete(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success('Frame successfully removed from inventory.');
      } catch (error) {
        toast.error('Failed to delete frame from database.');
        console.error(error);
      }
    }
  };

  const handleSaveProduct = async (formData: Omit<AdminProduct, 'id'>) => {
    const payload = mapAdminToBackendCreate(formData);

    try {
      if (editingProduct) {
        const updated = await productsApi.update(editingProduct.id, payload);
        const adminProduct = mapBackendToAdminProduct(updated);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? adminProduct : p)));
        toast.success('Frame updated successfully.');
      } else {
        const created = await productsApi.create(payload);
        const adminProduct = mapBackendToAdminProduct(created);
        setProducts((prev) => [adminProduct, ...prev]);
        toast.success('New frame and brand added to inventory.');
      }
      
      // Refresh dynamic brand list
      const updatedBrands = await productsApi.getBrands();
      setAvailableBrands(updatedBrands);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save frame to database.');
      console.error(error);
    }
  };

  const handleToggleBookingStatus = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'Pending' ? 'Confirmed' : 'Pending' }
          : b
      )
    );
  };

  // Filter products by Brand and Search Query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesBrand && matchesSearch;
    });
  }, [products, selectedBrand, searchQuery]);

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate mt-1">
              Manage optical frame inventory ({products.length.toLocaleString()} items), customer orders, and UK consultation bookings.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="inline-flex p-1 bg-offwhite rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-navy text-white' : 'text-slate hover:text-navy'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Stock Inventory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-navy text-white' : 'text-slate hover:text-navy'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Prescriptions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'bookings' ? 'bg-navy text-white' : 'text-slate hover:text-navy'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>UK Home Bookings</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'products' && (
          <div className="pt-6">
            <StockInventoryTab
              products={filteredProducts}
              availableBrands={availableBrands}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              isLoading={isLoadingProducts}
              onAddClick={handleOpenAddModal}
              onEditClick={handleOpenEditModal}
              onDeleteClick={handleDeleteProduct}
            />
          </div>
        )}

        {activeTab === 'orders' && <OrdersTab orders={orders} />}

        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} onToggleStatus={handleToggleBookingStatus} />
        )}
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};