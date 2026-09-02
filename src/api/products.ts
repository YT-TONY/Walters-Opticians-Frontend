//src/api/products.ts
import { apiClient } from './client';

export interface ProductFilterParams {
  q?: string;
  brand?: string;
  shape?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  sort_by?: string;
  skip?: number;
  limit?: number;
}

export interface BackendProduct {
  id: number;
  name: string;
  brand: string;
  gender?: string;
  shape: string;
  color_description: string;
  color_code?: string;
  frame_type?: string;
  description?: string;
  frame_material?: string;
  lens_material?: string;
  lens_color?: string;
  glass_base?: string;
  polarized?: boolean;
  photochromic?: boolean;
  gradables?: boolean;
  lens_width?: number;
  bridge_width?: number;
  temple_length?: number;
  lens_height?: number;
  sizes?: string[];
  size_chart_url?: string;
  price_full_gbp: number;
  allow_frame_only: boolean;
  price_frame_only_gbp: number;
  image_url: string;
  model_code?: string;
  gallery?: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
}

export type BackendProductCreate = Omit<BackendProduct, 'id'>;
export type BackendProductUpdate = Partial<BackendProductCreate>;

export interface PaginatedCatalogResponse {
  items: BackendProduct[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  available_brands: string[];
}

export const productsApi = {
  // GET /api/v1/products/
  getAll: async (params?: ProductFilterParams): Promise<BackendProduct[]> => {
    const response = await apiClient.get<BackendProduct[]>('/products/', { params });
    return response.data;
  },

  // GET /api/v1/products/brands (Dynamic brand category list from DB)
  getBrands: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/products/brands');
    return response.data;
  },

  // GET /api/v1/products/admin/catalog (Optimized high-scale admin catalog pagination)
  getAdminCatalog: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    brand?: string;
    shape?: string;
  }): Promise<PaginatedCatalogResponse> => {
    const response = await apiClient.get<PaginatedCatalogResponse>('/products/admin/catalog', { params });
    return response.data;
  },

  // GET /api/v1/products/{identifier}
  getByIdentifier: async (identifier: string | number): Promise<BackendProduct> => {
    const response = await apiClient.get<BackendProduct>(`/products/${identifier}`);
    return response.data;
  },

  // POST /api/v1/products/ (Admin only)
  create: async (data: BackendProductCreate): Promise<BackendProduct> => {
    const response = await apiClient.post<BackendProduct>('/products/', data);
    return response.data;
  },

  // PUT /api/v1/products/{identifier} (Admin only)
  update: async (identifier: string | number, data: BackendProductUpdate): Promise<BackendProduct> => {
    const response = await apiClient.put<BackendProduct>(`/products/${identifier}`, data);
    return response.data;
  },

  // DELETE /api/v1/products/{identifier} (Admin only)
  delete: async (identifier: string | number): Promise<void> => {
    await apiClient.delete(`/products/${identifier}`);
  },
};