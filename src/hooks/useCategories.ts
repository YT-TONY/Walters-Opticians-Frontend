import { useContext } from 'react';
import { CategoryContext, type CategoryContextType } from '../context/CategoryContext';

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};