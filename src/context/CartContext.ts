// src/context/CartContext.ts
import { createContext } from 'react';
import type { Product, CartItem, PrescriptionData, PurchaseType } from '../types/index';

export interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isModalOpen: boolean;
  selectedProduct: Product | null;
  editingItemIndex: number | null;
  
  // Slide-Over Config Drawer State
  isConfigDrawerOpen: boolean;
  configItemIndex: number | null;
  handleOpenConfigDrawer: (index: number) => void;
  handleCloseConfigDrawer: () => void;
  handleUpdateConfiguredItem: (index: number, purchaseType: PurchaseType, quantity: number) => void;

  handleAddStandard: (product: Product, isFromCard?: boolean, targetIndex?: number) => void;
  handleAddFrameOnly: (product: Product, isFromCard?: boolean, targetIndex?: number) => void;
  handleSelectPrescription: (product: Product, editIndex?: number) => void;
  handleConfirmPrescription: (prescription: PrescriptionData) => void;
  handleCloseModal: () => void;
  handleClearCart: () => void;
  handleRemoveItem: (index: number) => void;
  handleUpdateQuantity: (index: number, quantity: number) => void;
  handleSaveForLater: (index: number) => void;
  handleMoveToCart: (index: number) => void;
  handleRemoveSavedItem: (index: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);