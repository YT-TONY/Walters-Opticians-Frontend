// src/api/products.ts
import { apiClient } from './client';

export interface ProductFilterParams {
  q?: string;
  brand?: string;
  frame_shape?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  skip?: number;
  limit?: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price_full_gbp: number;
  frame_shape: string;
  color: string;
  image_url: string;
  stock_quantity: number;
}

export const productsApi = {
  // GET /api/v1/products/
  getAll: async (params?: ProductFilterParams): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/', { params });
    return response.data;
  },

  // GET /api/v1/products/{identifier} (numeric id or product name)
  getByIdentifier: async (identifier: string | number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${identifier}`);
    return response.data;
  },

  // POST /api/v1/products/ (Admin only)
  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    const response = await apiClient.post<Product>('/products/', data);
    return response.data;
  },

  // PUT /api/v1/products/{identifier} (Admin only)
  update: async (identifier: string | number, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${identifier}`, data);
    return response.data;
  },

  // DELETE /api/v1/products/{identifier} (Admin only)
  delete: async (identifier: string | number): Promise<void> => {
    await apiClient.delete(`/products/${identifier}`);
  },
};