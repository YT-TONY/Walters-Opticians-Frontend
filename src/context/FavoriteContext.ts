// src/context/FavoriteContext.ts
import { createContext } from 'react';
import type { Product } from '../types';

export interface FavoritesContextType {
  favorites: Product[];
  isLoading: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
  totalFavoritesCount: number;
}

export const FavoriteContext = createContext<FavoritesContextType | undefined>(undefined);