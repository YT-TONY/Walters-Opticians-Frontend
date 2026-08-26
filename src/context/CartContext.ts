import { createContext } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';

export interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isModalOpen: boolean;
  selectedProduct: Product | null;
  editingItemIndex: number | null;
  handleAddStandard: (product: Product) => void;
  handleAddFrameOnly: (product: Product) => void;
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