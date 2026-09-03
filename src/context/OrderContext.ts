// src/context/OrderContext.ts
import { createContext } from 'react';
import type { PrescriptionStatus } from '../types/admin';

export interface AdminOrderItem {
  id?: string | number;
  productId?: number;
  productName?: string;
  productBrand?: string;
  productImageUrl?: string;
  quantity: number;
  orderType: string;
  framePrice?: number;
  lensFee?: number;
  prescriptionStatus?: PrescriptionStatus | string;
  prescriptionFileUrl?: string;
  rightSph?: number;
  rightCyl?: number;
  rightAxis?: number;
  leftSph?: number;
  leftCyl?: number;
  leftAxis?: number;
  pdMm?: number;
}

export interface AdminOrder {
  id: string;
  rawId?: number;
  referenceId?: string;
  customerName: string;
  email: string;
  date: string;
  itemsCount: number;
  totalGbp: number;
  framePrice: number;
  lensFee: number;
  examFee: number;
  shippingFee: number;
  prescriptionStatus: PrescriptionStatus | string;
  orderStatus: string;
  orderType: string;
  shippingAddress: string;
  country: string;
  trackingNumber?: string;
  carrier?: string;
  shippingLabelUrl?: string;

  // Batch Order Items Array
  items?: AdminOrderItem[];

  // Fallback single-product metadata
  productId?: number;
  productName?: string;
  productBrand?: string;
  productImageUrl?: string;

  // Fallback single-product Prescription Parameters
  prescriptionFileUrl?: string;
  rightSph?: number;
  rightCyl?: number;
  rightAxis?: number;
  leftSph?: number;
  leftCyl?: number;
  leftAxis?: number;
  pdMm?: number;
}

export interface OrderContextType {
  orders: AdminOrder[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string | number, newStatus: string) => Promise<void>;
  updatePrescriptionStatus: (orderId: string | number, rxStatus: string) => Promise<void>;
  generateShippingLabel: (orderId: string | number, carrierName?: string) => Promise<void>;
  simulateCarrierScan: (orderId: string | number, newStatus: string) => Promise<void>;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);