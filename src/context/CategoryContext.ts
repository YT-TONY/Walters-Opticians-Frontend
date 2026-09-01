//src/context/CategoryContext.ts
import { createContext } from 'react';
import type { Category } from './Category';

export interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}


export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);