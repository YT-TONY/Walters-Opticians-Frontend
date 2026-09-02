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