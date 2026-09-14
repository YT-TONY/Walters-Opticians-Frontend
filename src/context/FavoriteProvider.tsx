// src/context/FavoriteProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { FavoriteContext } from './FavoriteContext';

const LOCAL_STORAGE_KEY = 'walters_wishlist_items';

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Helper for manual refetching on sync error rollbacks
  const refetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get<Array<{ product: Product }>>('/favorites/');
      const serverProducts = res.data.map((item) => item.product);
      setFavorites(serverProducts);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverProducts));
    } catch (err) {
      console.error('Failed to sync wishlist from server', err);
    }
  }, [isAuthenticated]);

  // Sync API state on auth changes without synchronous effect state triggers
  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      apiClient
        .get<Array<{ product: Product }>>('/favorites/')
        .then((res) => {
          if (!isMounted) return;
          const serverProducts = res.data.map((item) => item.product);
          setFavorites(serverProducts);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverProducts));
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Failed to sync wishlist from server', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Sync state to local storage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
      } catch (err) {
        console.error('Failed to store favorites locally', err);
      }
    }
  }, [favorites, isAuthenticated]);

  const isFavorite = useCallback(
    (productId: number) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const toggleFavorite = async (product: Product) => {
    const exists = isFavorite(product.id);

    const updated = exists
      ? favorites.filter((p) => p.id !== product.id)
      : [product, ...favorites];

    setFavorites(updated);
    toast.success(exists ? `Removed ${product.name} from Wishlist` : `Saved ${product.name} to Wishlist`);

    if (isAuthenticated) {
      try {
        await apiClient.post(`/favorites/toggle/${product.id}`);
      } catch (err) {
        console.error('Server sync failed for toggle favorite', err);
        refetchFavorites();
      }
    }
  };

  const removeFavorite = async (productId: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));

    if (isAuthenticated) {
      try {
        await apiClient.delete(`/favorites/${productId}`);
      } catch (err) {
        console.error('Server sync failed for remove favorite', err);
        refetchFavorites();
      }
    }
  };

  const clearFavorites = async () => {
    setFavorites([]);
    toast.info('Wishlist cleared');

    if (isAuthenticated) {
      try {
        await apiClient.delete('/favorites/');
      } catch (err) {
        console.error('Server sync failed for clear favorites', err);
        refetchFavorites();
      }
    }
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        totalFavoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};