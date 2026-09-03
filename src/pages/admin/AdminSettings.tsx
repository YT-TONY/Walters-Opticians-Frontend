// src/pages/admin/AdminSettings.tsx
import React, { useEffect, useState } from 'react';
import { Save, Tag, Eye, Truck, Sparkles, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import type { StoreSettingsRates } from '../../types/admin';

export const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<StoreSettingsRates>({
    standard_lens_fee: 45,
    eye_exam_fee: 30,
    uk_base_shipping: 4.99,
    eu_base_shipping: 14.99,
    intl_base_shipping: 24.99,
    low_stock_threshold: 8,
    promo_banner_text: 'Spring Sale: Up to 30% off selected luxury optical frames!',
    promo_banner_active: true,
    featured_category: 'Luxury Eyewear',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const res = await adminApi.getStoreSettings();
        if (isMounted && res.rates) {
          setSettings((prev) => ({
            ...prev,
            ...res.rates,
          }));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load store settings:', err);
          toast.error('Failed to fetch store settings from server.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof StoreSettingsRates>(
    field: K,
    value: StoreSettingsRates[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminApi.updateStoreSettings(settings);
      toast.success('Global store settings & operational rates updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to update store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate">
        <Loader2 className="w-8 h-8 text-navy animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading global store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-charcoal antialiased max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Global Admin Settings</h1>
          <p className="text-xs text-slate mt-1">
            Configure global fees, consultation baselines, fulfillment rates, low-stock thresholds, and storefront banners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllSettings}
          disabled={isSaving}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-[#1B75BC] transition-all cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        
        {/* SECTION 1: Optical & Service Fees */}
        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Eye className="w-4 h-4 text-[#1B75BC]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
              Optical Fees & Consultation Rates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-navy font-semibold mb-1">Standard Lens Fee (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.standard_lens_fee}
                onChange={(e) => handleChange('standard_lens_fee', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
              />
              <p className="text-[10px] text-slate mt-1">Base addition for single-vision prescription lenses.</p>
            </div>

            <div>
              <label className="block text-navy font-semibold mb-1">Eye Exam / Consultation Fee (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.eye_exam_fee}
                onChange={(e) => handleChange('eye_exam_fee', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
              />
              <p className="text-[10px] text-slate mt-1">Default consultation charge for in-clinic bookings.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Regional Shipping Baselines */}
        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Truck className="w-4 h-4 text-[#1B75BC]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
              Fulfillment & Regional Shipping Baselines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-navy font-semibold mb-1">UK Base Shipping (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.uk_base_shipping}
                onChange={(e) => handleChange('uk_base_shipping', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block text-navy font-semibold mb-1">EU Base Shipping (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.eu_base_shipping}
                onChange={(e) => handleChange('eu_base_shipping', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="block text-navy font-semibold mb-1">International Base Shipping (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.intl_base_shipping}
                onChange={(e) => handleChange('intl_base_shipping', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Promotional Inventory Threshold */}
        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Tag className="w-4 h-4 text-[#1B75BC]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
              Inventory & Urgency Baselines
            </h2>
          </div>

          <div className="text-xs space-y-2 max-w-md">
            <label className="block text-navy font-semibold">Promotional Low-Stock Baseline Limit</label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', Number(e.target.value))}
              className="w-32 px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-bold focus:outline-none focus:border-navy"
            />
            <p className="text-[10px] text-slate">
              Frames at or below this stock quantity automatically trigger urgency tags on storefront listings.
            </p>
          </div>
        </div>

        {/* SECTION 4: Dynamic Storefront Banners & Highlighted Category */}
        <div className="p-5 bg-white border border-border rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Sparkles className="w-4 h-4 text-[#1B75BC]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
              Dynamic Storefront Banners & Category Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-navy font-semibold">Top Announcement Banner Text</label>
              <input
                type="text"
                placeholder="e.g. Free UK Home Visit Consultations Available This Week!"
                value={settings.promo_banner_text || ''}
                onChange={(e) => handleChange('promo_banner_text', e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy focus:outline-none focus:border-navy"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="bannerActive"
                checked={!!settings.promo_banner_active}
                onChange={(e) => handleChange('promo_banner_active', e.target.checked)}
                className="w-4 h-4 text-navy rounded border-border focus:ring-navy cursor-pointer"
              />
              <label htmlFor="bannerActive" className="text-navy font-semibold cursor-pointer">
                Enable Announcement Banner on Storefront
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-navy font-semibold items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-navy" />
                <span>Featured Collection Category</span>
              </label>
              <select
                value={settings.featured_category || 'Luxury Eyewear'}
                onChange={(e) => handleChange('featured_category', e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-border rounded-xl text-navy font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Luxury Eyewear">Luxury Eyewear</option>
                <option value="Designer Sunglasses">Designer Sunglasses</option>
                <option value="Bestsellers">Bestsellers</option>
                <option value="Budget Eyewear">Budget Eyewear</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-[#1B75BC] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminSettings;