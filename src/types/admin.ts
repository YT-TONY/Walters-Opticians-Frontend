// src/types/admin.ts
export type Gender = 'unisex' | 'male' | 'female';
export type FrameType = 'full-rim' | 'half-rim' | 'rimless' | 'insert';
export type FrameShape = 'round' | 'square' | 'aviator' | 'cat-eye' | 'rectangle' | 'oval';

export interface AdminProduct {
  id: string;
  model_code?: string;
  name: string;
  brand: string;
  color: string;
  color_code?: string;
  gender: Gender;
  shape: FrameShape;
  frameType: FrameType;
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
  price_frame_only_gbp: number;
  stock: number;
  image_url: string;
  gallery: string[];
}

export interface UKBookingRequest {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  serviceType: 'UK Home Visit' | 'NHS Sight Test' | 'In-Clinic Fitting';
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
}

export type PrescriptionStatus = 'Verified' | 'Pending Review' | 'Uploaded' | 'Not Required';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  prescriptionStatus: PrescriptionStatus;
  orderStatus: string;
  trackingNumber?: string;
  totalGbp: number;
  date: string;
}

export interface SalesTrendPoint {
  date: string;
  orders_count: number;
  revenue: number;
}

export interface TopMovingProduct {
  product_id: number;
  name: string;
  brand: string;
  image_url?: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface SlowMovingProduct {
  product_id: number;
  name: string;
  brand: string;
  image_url?: string;
  stock_quantity: number;
  price_full_gbp: number;
}

export interface MarketOverviewAnalytics {
  total_revenue: number;
  total_orders: number;
  pending_orders_count: number;
  low_stock_count: number;
  total_appointments: number;
  unread_notifications: number;
  sales_trend: SalesTrendPoint[];
  top_moving_products: TopMovingProduct[];
  slow_moving_products: SlowMovingProduct[];
}

export interface BrandProductItem {
  id: number;
  name: string;
  brand: string;
  stock_quantity: number;
  price_full_gbp: number;
  price_frame_only_gbp: number;
  image_url: string;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface BrandInventoryGroup {
  brand_name: string;
  total_items_count: number;
  low_stock_count: number;
  products: BrandProductItem[];
}

export interface StoreSettingsRates {
  standard_lens_fee: number;
  eye_exam_fee: number;
  uk_base_shipping: number;
  eu_base_shipping: number;
  intl_base_shipping: number;
  low_stock_threshold: number;
  promo_banner_text?: string;
  promo_banner_active?: boolean;
  featured_category?: string;
}