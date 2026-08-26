// src/context/CartContext.ts
import { createContext } from 'react';
import type { Product, CartItem, PrescriptionData } from '../types/index';

export interface CartContextType {
  cartItems: CartItem[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isModalOpen: boolean;
  selectedProduct: Product | null;
  handleAddStandard: (product: Product) => void;
  handleAddFrameOnly: (product: Product) => void;
  handleSelectPrescription: (product: Product) => void;
  handleConfirmPrescription: (prescription: PrescriptionData) => void;
  handleCloseModal: () => void;
  handleClearCart: () => void;
  handleRemoveItem: (index: number) => void;
  handleUpdateQuantity: (index: number, delta: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);