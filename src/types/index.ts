export interface Product {
  id: number;
  name: string;
  brand: string;
  shape: string;
  color_description: string;
  price_full_gbp: number;
  price_frame_only_gbp: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}