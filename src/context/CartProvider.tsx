import React, { useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';
import { CartContext } from './CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id ? `walters_cart_${user.id}` : 'walters_cart_guest';
  const savedStorageKey = user?.id ? `walters_saved_${user.id}` : 'walters_saved_guest';

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(savedStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
    const savedCart = localStorage.getItem(storageKey);
    const savedList = localStorage.getItem(savedStorageKey);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    setSavedItems(savedList ? JSON.parse(savedList) : []);
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  useEffect(() => {
    localStorage.setItem(savedStorageKey, JSON.stringify(savedItems));
  }, [savedItems, savedStorageKey]);

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

  const handleSelectPrescription = (product: Product, editIndex?: number) => {
    setSelectedProduct(product);
    if (typeof editIndex === 'number') {
      setEditingItemIndex(editIndex);
    } else {
      setEditingItemIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleConfirmPrescription = (prescription: PrescriptionData) => {
    if (!selectedProduct) return;

    if (editingItemIndex !== null) {
      setCartItems((prev) =>
        prev.map((item, i) =>
          i === editingItemIndex ? { ...item, prescription } : item
        )
      );
      toast.success(`Updated prescription details for ${selectedProduct.name}`);
      setEditingItemIndex(null);
    } else {
      setCartItems((prev) => [
        ...prev,
        { product: selectedProduct, quantity: 1, purchaseType: 'prescription', prescription },
      ]);
      toast.success(`Prescription lenses added for ${selectedProduct.name}!`);
      setIsDrawerOpen(true);
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setEditingItemIndex(null);
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    toast.info('Item removed from basket');
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const handleSaveForLater = (index: number) => {
    const itemToSave = cartItems[index];
    if (!itemToSave) return;
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    setSavedItems((prev) => [...prev, itemToSave]);
    toast.success(`Moved ${itemToSave.product.name} to Save for Later`);
  };

  const handleMoveToCart = (index: number) => {
    const itemToMove = savedItems[index];
    if (!itemToMove) return;
    setSavedItems((prev) => prev.filter((_, i) => i !== index));
    setCartItems((prev) => [...prev, itemToMove]);
    toast.success(`Moved ${itemToMove.product.name} back to your basket!`);
  };

  const handleRemoveSavedItem = (index: number) => {
    setSavedItems((prev) => prev.filter((_, i) => i !== index));
    toast.info('Saved item removed');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        isDrawerOpen,
        setIsDrawerOpen,
        isModalOpen,
        selectedProduct,
        editingItemIndex,
        handleAddStandard,
        handleAddFrameOnly,
        handleSelectPrescription,
        handleConfirmPrescription,
        handleCloseModal,
        handleClearCart,
        handleRemoveItem,
        handleUpdateQuantity,
        handleSaveForLater,
        handleMoveToCart,
        handleRemoveSavedItem,
      }}
    >
      {children}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQty={(idx, delta) => {
          const target = cartItems[idx];
          if (target) handleUpdateQuantity(idx, target.quantity + delta);
        }}
        onRemove={handleRemoveItem}
      />
    </CartContext.Provider>
  );
};