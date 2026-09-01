//src/context/CategoryProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CategoryContext } from './CategoryContext';
import type { Category } from '../context/Category';

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/categories/tree');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error connecting to backend';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCategories() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/categories/tree');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data: Category[] = await response.json();

        if (isMounted) {
          setCategories(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error fetching categories:', err);
          const errorMessage = err instanceof Error ? err.message : 'Error connecting to backend';
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, error, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};