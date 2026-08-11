// src/context/Category.ts

export interface Brand {
  id: number;
  name: string;
  slug: string;
  is_popular?: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
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