// src/context/CartProvider.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, PrescriptionData, PurchaseType } from '../types/index';
import { CartContext } from './CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { CartItemConfigDrawer } from '../components/EditStateDrawer';
import { PrescriptionModal } from '../components/PrescriptionModal';
import { useAuth } from '../hooks/useAuth';
import { productsApi } from '../api/products';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

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

  // Configuration Drawer State
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [configItemIndex, setConfigItemIndex] = useState<number | null>(null);

  // Sync Live Stock
  useEffect(() => {
    let isMounted = true;

    const syncLiveStock = async () => {
      try {
        const liveProducts = await productsApi.getAll();
        if (!isMounted) return;

        setCartItems((prev) =>
          prev.map((item) => {
            const match = liveProducts.find((p) => String(p.id) === String(item.product.id));
            if (match) {
              return {
                ...item,
                product: {
                  ...item.product,
                  stock_quantity: match.stock_quantity,
                  price_full_gbp: match.price_full_gbp,
                  price_frame_only_gbp: match.price_frame_only_gbp,
                  is_bestseller: match.is_bestseller,
                },
              };
            }
            return item;
          })
        );
      } catch (error: unknown) {
        console.error('Failed to sync live cart stock:', error);
      }
    };

    syncLiveStock();

    return () => {
      isMounted = false;
    };
  }, [isDrawerOpen, isConfigDrawerOpen]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  useEffect(() => {
    localStorage.setItem(savedStorageKey, JSON.stringify(savedItems));
  }, [savedItems, savedStorageKey]);

  const handleOpenConfigDrawer = (index: number) => {
    if (index >= 0 && index < cartItems.length) {
      setConfigItemIndex(index);
      setIsConfigDrawerOpen(true);
    }
  };

  const handleCloseConfigDrawer = () => {
    setIsConfigDrawerOpen(false);
    setConfigItemIndex(null);
  };

  const handleUpdateConfiguredItem = (
    index: number,
    purchaseType: PurchaseType,
    quantity: number
  ) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              purchaseType,
              quantity,
              isPendingConfig: false,
            }
          : item
      )
    );
    toast.success('Updated item specifications in basket!');
  };

  // Defaults isFromCard to true so Quick Add flags item as pending details
  const handleAddStandard = (product: Product, isFromCard = true, targetIndex?: number) => {
    let exceedsStock = false;

    setCartItems((prev) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < prev.length) {
        return prev.map((item, idx) =>
          idx === targetIndex
            ? { ...item, product, purchaseType: 'standard', isPendingConfig: isFromCard }
            : item
        );
      }

      const pendingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.isPendingConfig
      );
      if (pendingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === pendingIdx
            ? { ...item, product, purchaseType: 'standard', isPendingConfig: isFromCard }
            : item
        );
      }

      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.purchaseType === 'standard' && !item.isPendingConfig
      );
      if (existingIdx !== -1) {
        if (prev[existingIdx].quantity >= product.stock_quantity) {
          exceedsStock = true;
          return prev;
        }
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { product, quantity: 1, purchaseType: 'standard', isPendingConfig: isFromCard }];
    });

    if (exceedsStock) {
      toast.warning(`Cannot add more. Maximum available stock (${product.stock_quantity}) reached.`);
    } else {
      toast.success(`${product.name} added to bag!`);
      setIsDrawerOpen(true);
    }
  };

  const handleAddFrameOnly = (product: Product, isFromCard = true, targetIndex?: number) => {
    let exceedsStock = false;

    setCartItems((prev) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < prev.length) {
        return prev.map((item, idx) =>
          idx === targetIndex
            ? { ...item, product, purchaseType: 'frames_only', isPendingConfig: isFromCard }
            : item
        );
      }

      const pendingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.isPendingConfig
      );
      if (pendingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === pendingIdx
            ? { ...item, product, purchaseType: 'frames_only', isPendingConfig: isFromCard }
            : item
        );
      }

      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.purchaseType === 'frames_only' && !item.isPendingConfig
      );
      if (existingIdx !== -1) {
        if (prev[existingIdx].quantity >= product.stock_quantity) {
          exceedsStock = true;
          return prev;
        }
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { product, quantity: 1, purchaseType: 'frames_only', isPendingConfig: isFromCard }];
    });

    if (exceedsStock) {
      toast.warning(`Cannot add more. Maximum available stock (${product.stock_quantity}) reached.`);
    } else {
      toast.success(`${product.name} (Frame Only) added to bag!`);
      setIsDrawerOpen(true);
    }
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

    setCartItems((prev) => {
      if (editingItemIndex !== null && editingItemIndex >= 0 && editingItemIndex < prev.length) {
        return prev.map((item, idx) =>
          idx === editingItemIndex
            ? { ...item, product: selectedProduct, purchaseType: 'prescription', prescription, isPendingConfig: false }
            : item
        );
      }

      const pendingIdx = prev.findIndex(
        (item) => item.product.id === selectedProduct.id && item.isPendingConfig
      );
      if (pendingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === pendingIdx
            ? { ...item, product: selectedProduct, purchaseType: 'prescription', prescription, isPendingConfig: false }
            : item
        );
      }

      const existingIdx = prev.findIndex(
        (item) => item.product.id === selectedProduct.id && item.purchaseType === 'prescription'
      );
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, prescription, isPendingConfig: false }
            : item
        );
      }

      return [
        ...prev,
        { product: selectedProduct, quantity: 1, purchaseType: 'prescription', prescription, isPendingConfig: false },
      ];
    });

    toast.success(`Prescription details updated for ${selectedProduct.name}!`);
    setIsDrawerOpen(true);
    setIsModalOpen(false);
    setSelectedProduct(null);
    setEditingItemIndex(null);
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
    const target = cartItems[index];
    if (target && quantity > target.product.stock_quantity) {
      toast.warning(`Maximum available stock for ${target.product.name} is ${target.product.stock_quantity}.`);
      quantity = target.product.stock_quantity;
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

  const activeConfigItem = configItemIndex !== null ? cartItems[configItemIndex] || null : null;

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
        isConfigDrawerOpen,
        configItemIndex,
        handleOpenConfigDrawer,
        handleCloseConfigDrawer,
        handleUpdateConfiguredItem,
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

      <CartItemConfigDrawer
        isOpen={isConfigDrawerOpen}
        onClose={handleCloseConfigDrawer}
        itemIndex={configItemIndex}
        cartItem={activeConfigItem}
        onSaveConfig={handleUpdateConfiguredItem}
        onOpenPrescriptionModal={(item, idx) => {
          handleSelectPrescription(item.product, idx);
        }}
      />

      {selectedProduct && (
        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPrescription}
          frameName={selectedProduct.name}
          framePrice={formatPrice(selectedProduct.price_full_gbp)}
        />
      )}
    </CartContext.Provider>
  );
};