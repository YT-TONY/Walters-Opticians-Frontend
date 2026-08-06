// src/context/CartProvider.tsx
import React, { useState, type ReactNode } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';
import { CartContext } from './CartContext';
import { toast } from 'sonner';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleClearCart = () => setCartItems([]);

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