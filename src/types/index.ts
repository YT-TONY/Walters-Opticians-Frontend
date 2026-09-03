//src/types/index.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Product {
  id: number;
  model_code?: string;
  name: string;
  brand: string;
  shape: string;
  color_description: string;
  color_code?: string;
  category?: string;
  description?: string;
  gender?: string;
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
  price_frame_only_gbp: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  image_url?: string;
  gallery?: string[];
  images?: string[];
}

export interface PrescriptionData {
  odSphere: number;
  odCyl: number;
  odAxis: number;
  odAdd: number;
  osSphere: number;
  osCyl: number;
  osAxis: number;
  osAdd: number;
  pd: number;
  uploadedFileUrl?: string;
}

export type PurchaseType = 'standard' | 'frames_only' | 'prescription';

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseType: PurchaseType;
  prescription?: PrescriptionData;
  isPendingConfig?: boolean;
}