// src/types/prescription.ts
export interface SavedPrescription {
  id: number;
  user_id: number;
  title: string;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  pd_mm?: number | null;
  file_url?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface PrescriptionFormData {
  title: string;
  right_sph: string;
  right_cyl: string;
  right_axis: string;
  left_sph: string;
  left_cyl: string;
  left_axis: string;
  pd_mm: string;
  file_url: string;
  is_default: boolean;
}