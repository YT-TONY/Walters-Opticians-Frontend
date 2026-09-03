// src/api/orders.ts
import { apiClient } from './client';

export interface BackendOrderItem {
  product_id: number;
  quantity: number;
  order_type: 'frame_only' | 'upload_prescription' | 'manual_prescription' | 'book_appointment';
  prescription_file_url?: string | null;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  pd_mm?: number | null;

  // Detailed Product Metadata (populated by response)
  product_name?: string | null;
  product_brand?: string | null;
  product_image_url?: string | null;
  frame_price?: number;
  lens_fee?: number;
}

export interface BackendOrderCreate {
  shipping_address: string;
  country: string;
  appointment_date?: string | null;
  items: BackendOrderItem[];
}

export interface BackendOrderResponse {
  id: number;
  reference_id: string;
  country: string;
  shipping_address: string;
  exam_fee: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  prescription_status?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  shipping_label_url?: string | null;
  appointment_date?: string | null;
  created_at: string;
  
  // Grouped items array for batch orders
  items?: BackendOrderItem[];

  // Fallback flat fields for legacy/single item responses
  product_id?: number;
  quantity?: number;
  order_type?: string;
  product_name?: string | null;
  product_brand?: string | null;
  product_image_url?: string | null;
  frame_price?: number;
  lens_fee?: number;
  prescription_file_url?: string | null;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  pd_mm?: number | null;
}

export const ordersApi = {
  create: async (data: BackendOrderCreate): Promise<BackendOrderResponse> => {
    const response = await apiClient.post<BackendOrderResponse>('/orders/', data);
    return response.data;
  },

  getAll: async (): Promise<BackendOrderResponse[]> => {
    const response = await apiClient.get<BackendOrderResponse[]>('/orders/');
    return response.data;
  },

  updateStatus: async (orderId: number, status: string): Promise<BackendOrderResponse> => {
    const response = await apiClient.put<BackendOrderResponse>(`/orders/${orderId}/status`, null, {
      params: { status_update: status },
    });
    return response.data;
  },

  updatePrescriptionStatus: async (orderId: number, rxStatus: string): Promise<BackendOrderResponse> => {
    const response = await apiClient.put<BackendOrderResponse>(`/orders/${orderId}/prescription-status`, null, {
      params: { rx_status: rxStatus },
    });
    return response.data;
  },

  generateShippingLabel: async (orderId: number, carrierName: string = 'Royal Mail'): Promise<BackendOrderResponse> => {
    const response = await apiClient.post<BackendOrderResponse>(`/orders/${orderId}/generate-label`, null, {
      params: { carrier_name: carrierName },
    });
    return response.data;
  },

  simulateCarrierScan: async (orderId: number, newStatus: string): Promise<BackendOrderResponse> => {
    const response = await apiClient.post<BackendOrderResponse>(`/orders/${orderId}/simulate-status`, null, {
      params: { new_status: newStatus },
    });
    return response.data;
  },
};