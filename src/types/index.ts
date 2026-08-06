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
  name: string;
  brand: string;
  shape: string;
  color_description: string;
  category?: string;
  description?: string;
  price_full_gbp: number;
  price_frame_only_gbp: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
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

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseType: 'frames_only' | 'prescription';
  prescription?: PrescriptionData;
}