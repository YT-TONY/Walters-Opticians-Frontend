import React, { useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';
import { CartContext } from './CartContext';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Dynamic storage key scoped to user ID or guest
  const storageKey = user?.id ? `walters_cart_${user.id}` : 'walters_cart_guest';

  // State initialization
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Adjust state synchronously during render when storageKey changes (React-recommended pattern)
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
    const saved = localStorage.getItem(storageKey);
    setCartItems(saved ? JSON.parse(saved) : []);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Synchronize internal React state out to localStorage (side-effect only)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  // Default Option: Standard Non-Prescription Glasses
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
  };

  // Frame Only (Demo Lenses)
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
  };

  // Prescription Option (Triggers Modal)
  const handleSelectPrescription = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmPrescription = (prescription: PrescriptionData) => {
    if (!selectedProduct) return;
    setCartItems((prev) => [
      ...prev,
      { product: selectedProduct, quantity: 1, purchaseType: 'prescription', prescription },
    ]);
    setIsModalOpen(false);
    setSelectedProduct(null);
    toast.success(`Prescription lenses added for ${selectedProduct.name}!`);
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

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
    </CartContext.Provider>
  );
};