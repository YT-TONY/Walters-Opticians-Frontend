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
  shape: 'Round' | 'Rectangle' | 'Aviator' | 'Square' | 'Cat-Eye';
  color_description: string;
  price_full_gbp: number;
  price_frame_only_gbp: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
}

export interface PrescriptionData {
  odSphere: string;
  odCyl: string;
  odAxis: string;
  odAdd: string;
  osSphere: string;
  osCyl: string;
  osAxis: string;
  osAdd: string;
  pd: string;
  uploadedFileUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseType: 'frames_only' | 'prescription';
  prescription?: PrescriptionData;
}