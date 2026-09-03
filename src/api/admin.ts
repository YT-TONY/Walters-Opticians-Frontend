// src/api/admin.ts
import { apiClient } from './client';
import type { MarketOverviewAnalytics, BrandInventoryGroup, StoreSettingsRates } from '../types/admin';

export const adminApi = {
  getOverviewAnalytics: async (days = 30): Promise<MarketOverviewAnalytics> => {
    const response = await apiClient.get(`/admin/analytics/overview?days=${days}`);
    return response.data;
  },

  getInventoryByBrand: async (): Promise<BrandInventoryGroup[]> => {
    const response = await apiClient.get('/admin/inventory/by-brand');
    return response.data;
  },

  getStoreSettings: async (): Promise<{ rates: StoreSettingsRates }> => {
    const response = await apiClient.get('/orders/admin/settings');
    return response.data;
  },

  updateStoreSettings: async (settings: Partial<StoreSettingsRates>): Promise<{ rates: StoreSettingsRates }> => {
    const response = await apiClient.put('/orders/admin/settings', settings);
    return response.data;
  },
};