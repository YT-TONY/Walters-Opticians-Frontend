import React, { useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';
import { CartContext } from './CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id ? `walters_cart_${user.id}` : 'walters_cart_guest';

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
    const saved = localStorage.getItem(storageKey);
    setCartItems(saved ? JSON.parse(saved) : []);
  }

  // Drawer & Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  // Add standard item and auto-open drawer
  const handleAddStandard = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.purchaseType === 'standard'
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, purchaseType: 'standard' }];
    });
    toast.success(`${product.name} added to bag!`);
    setIsDrawerOpen(true);
  };

  // Add frame only and auto-open drawer
  const handleAddFrameOnly = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.purchaseType === 'frames_only'
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, purchaseType: 'frames_only' }];
    });
    toast.success(`${product.name} (Frame Only) added to bag!`);
    setIsDrawerOpen(true);
  };

  const handleSelectPrescription = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Confirm prescription and auto-open drawer
  const handleConfirmPrescription = (prescription: PrescriptionData) => {
    if (!selectedProduct) return;
    setCartItems((prev) => [
      ...prev,
      { product: selectedProduct, quantity: 1, purchaseType: 'prescription', prescription },
    ]);
    setIsModalOpen(false);
    setSelectedProduct(null);
    toast.success(`Prescription lenses added for ${selectedProduct.name}!`);
    setIsDrawerOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Quantity Delta updater (+1 or -1)
  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item, i) => {
          if (i === index) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isDrawerOpen,
        setIsDrawerOpen,
        isModalOpen,
        selectedProduct,
        handleAddStandard,
        handleAddFrameOnly,
        handleSelectPrescription,
        handleConfirmPrescription,
        handleCloseModal,
        handleClearCart,
        handleRemoveItem,
        handleUpdateQuantity,
      }}
    >
      {children}
      {/* Global Drawer mount */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQuantity}
        onRemove={handleRemoveItem}
      />
    </CartContext.Provider>
  );
};