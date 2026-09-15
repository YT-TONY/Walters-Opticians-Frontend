// src/context/CartProvider.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import type { 
  Product, 
  CartItem, 
  PurchaseType, 
  GlassesPrescriptionData, 
  ContactLensPrescriptionData 
} from '../types/index';
import { CartContext } from './CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { CartItemConfigDrawer } from '../components/EditStateDrawer';
import { PrescriptionModal } from '../components/PrescriptionModal';
import { useAuth } from '../hooks/useAuth';
import { productsApi } from '../api/products';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';

// Helper to check if two prescription objects match
const arePrescriptionsEqual = (p1?: GlassesPrescriptionData, p2?: GlassesPrescriptionData): boolean => {
  if (!p1 && !p2) return true;
  if (!p1 || !p2) return false;
  return (
    p1.odSphere === p2.odSphere &&
    p1.odCyl === p2.odCyl &&
    p1.odAxis === p2.odAxis &&
    p1.osSphere === p2.osSphere &&
    p1.osCyl === p2.osCyl &&
    p1.osAxis === p2.osAxis &&
    p1.pd === p2.pd &&
    p1.odAdd === p2.odAdd &&
    p1.osAdd === p2.osAdd &&
    p1.uploadedFileUrl === p2.uploadedFileUrl
  );
};

// Helper to merge duplicate fully-configured cart items
const consolidateCart = (items: CartItem[]): CartItem[] => {
  const result: CartItem[] = [];

  for (const item of items) {
    // Unfinished/pending items remain separate until configured
    if (item.isPendingConfig) {
      result.push({ ...item });
      continue;
    }

    // Look for an existing completed item with identical specs
    const matchIdx = result.findIndex(
      (r) =>
        !r.isPendingConfig &&
        String(r.product.id) === String(item.product.id) &&
        r.purchaseType === item.purchaseType &&
        arePrescriptionsEqual(r.prescription, item.prescription)
    );

    if (matchIdx !== -1) {
      // Merge quantity into the existing line item
      const maxStock = item.product.stock_quantity;
      const combinedQty = Math.min(result[matchIdx].quantity + item.quantity, maxStock);
      result[matchIdx] = {
        ...result[matchIdx],
        quantity: combinedQty,
      };
    } else {
      result.push({ ...item });
    }
  }

  return result;
};

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
    setCartItems((prev) => {
      const updated = prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              purchaseType,
              quantity,
              isPendingConfig: false,
            }
          : item
      );
      return consolidateCart(updated);
    });
    toast.success('Updated item specifications in basket!');
  };

  const handleAddStandard = (product: Product, isFromCard = true, targetIndex?: number) => {
    let exceedsStock = false;

    setCartItems((prev) => {
      // 1. Direct Target Index Update
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < prev.length) {
        const updated = prev.map((item, idx) =>
          idx === targetIndex
            ? { ...item, product, purchaseType: 'standard' as const, isPendingConfig: isFromCard }
            : item
        );
        return consolidateCart(updated);
      }

      // 2. Added from Product Card (Unfinished / Pending State)
      if (isFromCard) {
        const pendingIdx = prev.findIndex(
          (item) => item.product.id === product.id && item.isPendingConfig
        );

        if (pendingIdx !== -1) {
          if (prev[pendingIdx].quantity >= product.stock_quantity) {
            exceedsStock = true;
            return prev;
          }
          return prev.map((item, idx) =>
            idx === pendingIdx ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        const newItem: CartItem = { product, quantity: 1, purchaseType: 'standard', isPendingConfig: true };
        return [...prev, newItem];
      }

      // 3. Added directly from Product Detail Page (Fully Configured)
      const completedIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.purchaseType === 'standard' && !item.isPendingConfig
      );

      if (completedIdx !== -1) {
        if (prev[completedIdx].quantity >= product.stock_quantity) {
          exceedsStock = true;
          return prev;
        }
        return prev.map((item, idx) =>
          idx === completedIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const pendingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.isPendingConfig
      );
      if (pendingIdx !== -1) {
        const updated = prev.map((item, idx) =>
          idx === pendingIdx
            ? { ...item, product, purchaseType: 'standard' as const, isPendingConfig: false }
            : item
        );
        return consolidateCart(updated);
      }

      const newItem: CartItem = { product, quantity: 1, purchaseType: 'standard', isPendingConfig: false };
      return consolidateCart([...prev, newItem]);
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
      // 1. Direct Target Index Update
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < prev.length) {
        const updated = prev.map((item, idx) =>
          idx === targetIndex
            ? { ...item, product, purchaseType: 'frames_only' as const, isPendingConfig: isFromCard }
            : item
        );
        return consolidateCart(updated);
      }

      // 2. Added from Product Card (Unfinished / Pending State)
      if (isFromCard) {
        const pendingIdx = prev.findIndex(
          (item) => item.product.id === product.id && item.isPendingConfig
        );

        if (pendingIdx !== -1) {
          if (prev[pendingIdx].quantity >= product.stock_quantity) {
            exceedsStock = true;
            return prev;
          }
          return prev.map((item, idx) =>
            idx === pendingIdx ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        const newItem: CartItem = { product, quantity: 1, purchaseType: 'frames_only', isPendingConfig: true };
        return [...prev, newItem];
      }

      // 3. Added directly from Product Detail Page (Fully Configured)
      const completedIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.purchaseType === 'frames_only' && !item.isPendingConfig
      );

      if (completedIdx !== -1) {
        if (prev[completedIdx].quantity >= product.stock_quantity) {
          exceedsStock = true;
          return prev;
        }
        return prev.map((item, idx) =>
          idx === completedIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const pendingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.isPendingConfig
      );
      if (pendingIdx !== -1) {
        const updated = prev.map((item, idx) =>
          idx === pendingIdx
            ? { ...item, product, purchaseType: 'frames_only' as const, isPendingConfig: false }
            : item
        );
        return consolidateCart(updated);
      }

      const newItem: CartItem = { product, quantity: 1, purchaseType: 'frames_only', isPendingConfig: false };
      return consolidateCart([...prev, newItem]);
    });

    if (exceedsStock) {
      toast.warning(`Cannot add more. Maximum available stock (${product.stock_quantity}) reached.`);
    } else {
      toast.success(`${product.name} (Frame Only) added to bag!`);
      setIsDrawerOpen(true);
    }
  };

  const handleAddContactLenses = (
    product: Product,
    contactLensPrescription: ContactLensPrescriptionData,
    targetIndex?: number
  ) => {
    const leftQty = contactLensPrescription.leftEye?.boxes_quantity || 0;
    const rightQty = contactLensPrescription.rightEye?.boxes_quantity || 0;
    const totalBoxes = leftQty + rightQty > 0 ? leftQty + rightQty : 1;

    let exceedsStock = false;

    setCartItems((prev) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < prev.length) {
        const updated = prev.map((item, idx) =>
          idx === targetIndex
            ? {
                ...item,
                product,
                quantity: totalBoxes,
                purchaseType: 'contact_lenses' as const,
                contactLensPrescription,
                isPendingConfig: false,
              }
            : item
        );
        return consolidateCart(updated);
      }

      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.purchaseType === 'contact_lenses'
      );

      if (existingIdx !== -1) {
        const newQty = prev[existingIdx].quantity + totalBoxes;
        if (newQty > product.stock_quantity) {
          exceedsStock = true;
          return prev;
        }
        return prev.map((item, idx) =>
          idx === existingIdx
            ? {
                ...item,
                quantity: newQty,
                contactLensPrescription,
                isPendingConfig: false,
              }
            : item
        );
      }

      const newItem: CartItem = {
        product,
        quantity: totalBoxes,
        purchaseType: 'contact_lenses',
        contactLensPrescription,
        isPendingConfig: false,
      };
      return [...prev, newItem];
    });

    if (exceedsStock) {
      toast.warning(`Cannot add more. Maximum available stock (${product.stock_quantity}) reached.`);
    } else {
      toast.success(`${product.name} (Contact Lenses) added to bag!`);
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

  const handleConfirmPrescription = (prescription: GlassesPrescriptionData) => {
    if (!selectedProduct) return;

    setCartItems((prev) => {
      let updated: CartItem[];

      if (editingItemIndex !== null && editingItemIndex >= 0 && editingItemIndex < prev.length) {
        updated = prev.map((item, idx) =>
          idx === editingItemIndex
            ? { ...item, product: selectedProduct, purchaseType: 'prescription' as const, prescription, isPendingConfig: false }
            : item
        );
      } else {
        const pendingIdx = prev.findIndex(
          (item) => item.product.id === selectedProduct.id && item.isPendingConfig
        );
        if (pendingIdx !== -1) {
          updated = prev.map((item, idx) =>
            idx === pendingIdx
              ? { ...item, product: selectedProduct, purchaseType: 'prescription' as const, prescription, isPendingConfig: false }
              : item
          );
        } else {
          const newItem: CartItem = {
            product: selectedProduct,
            quantity: 1,
            purchaseType: 'prescription',
            prescription,
            isPendingConfig: false,
          };
          updated = [...prev, newItem];
        }
      }

      return consolidateCart(updated);
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
    setCartItems((prev) => consolidateCart([...prev, itemToMove]));
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
        handleAddContactLenses,
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