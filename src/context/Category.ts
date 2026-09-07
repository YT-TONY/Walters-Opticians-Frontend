// src/context/Category.ts

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  is_popular?: boolean;
  is_top_brand?: boolean;
  promo_tag?: string;
  category_type?: 'glasses' | 'sunglasses' | 'both';
  sales_count?: number;
  created_at?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  display_order?: number;
  brands: Brand[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  is_main_nav: boolean;
  display_order: number;
  subcategories: SubCategory[];
}