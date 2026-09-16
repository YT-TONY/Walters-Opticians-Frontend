//src/types/index.ts
export type ProductCategory = 'optical_frames' | 'sunglasses' | 'contact_lenses' | 'lens_care';
export type ReplacementFrequency = 'daily' | 'bi_weekly' | 'monthly' | 'ortho_k';
export type LensDesign = 'spherical' | 'toric' | 'multifocal' | 'colored';

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

export interface ContactLensProductDetail {
  id: number;
  replacement_frequency: ReplacementFrequency;
  lens_design: LensDesign;
  pack_size: number;
  water_content?: number;
  material_type?: string;
  base_curve_options: string; // e.g. "8.4, 8.8"
  diameter_options: string;   // e.g. "14.0, 14.2"
  min_power: number;
  max_power: number;
}

export interface Product {
  id: number;
  category?: ProductCategory;
  model_code?: string;
  name: string;
  brand: string;
  shape: string;
  color_description: string;
  color_code?: string;
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
  contact_lens_detail?: ContactLensProductDetail;

  // Extended Contact Lens & Optical Specs
  colors?: string[];
  is_contact_lens?: boolean;
  usage_type?: string;
  pack_size?: string | number;
  lens_design?: string;
  bc?: string;
  dia?: string;
  water_content?: string;
}

export interface EyeConfig {
  power?: string;
  sph?: number;
  cyl?: number;
  axis?: number;
  add_power?: string;
  bc: string | number;
  dia: string | number;
  color?: string;
  boxes_quantity: number;
}

export interface ContactLensPrescriptionData {
  leftEye?: EyeConfig;
  rightEye?: EyeConfig;
  prescriptionFileUrl?: string;
  expiryDate?: string;
  opticianName?: string;
}

export interface GlassesPrescriptionData {
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

export type PurchaseType = 'standard' | 'frames_only' | 'prescription' | 'contact_lenses';

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseType: PurchaseType;
  prescription?: GlassesPrescriptionData;
  contactLensPrescription?: ContactLensPrescriptionData;
  isPendingConfig?: boolean;
}

export interface FavoriteItem {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
  product: Product;
}