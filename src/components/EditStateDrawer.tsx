// src/components/EditStateDrawer.tsx
import React, { useState } from 'react';
import type { CartItem, PurchaseType } from '../types/index';
import { X, ChevronLeft, ChevronRight, Edit3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

interface CartItemConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemIndex: number | null;
  cartItem: CartItem | null;
  onSaveConfig: (index: number, purchaseType: PurchaseType, quantity: number) => void;
  onOpenPrescriptionModal: (item: CartItem, index: number) => void;
}

export const CartItemConfigDrawer: React.FC<CartItemConfigDrawerProps> = ({
  isOpen,
  onClose,
  itemIndex,
  cartItem,
  onSaveConfig,
  onOpenPrescriptionModal,
}) => {
  const { formatPrice } = useCurrency();

  const [prevCartItem, setPrevCartItem] = useState<CartItem | null>(cartItem);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<PurchaseType>(cartItem?.purchaseType ?? 'standard');
  const [selectedQty, setSelectedQty] = useState<number>(cartItem?.quantity ?? 1);

  if (cartItem !== prevCartItem) {
    setPrevCartItem(cartItem);
    setActiveImageIdx(0);
    if (cartItem) {
      setSelectedType(cartItem.purchaseType);
      setSelectedQty(cartItem.quantity);
    }
  }

  if (!isOpen || !cartItem || itemIndex === null) return null;

  const product = cartItem.product;
  const galleryImages = [
    product.image_url,
    ...(product.gallery || []),
  ].filter((img): img is string => Boolean(img));

  const activePrice =
    selectedType === 'prescription' || selectedType === 'standard'
      ? product.price_full_gbp
      : (product.price_frame_only_gbp ?? product.price_full_gbp);

  const handleApplyChanges = () => {
    if (selectedType === 'prescription') {
      onClose();
      onOpenPrescriptionModal(cartItem, itemIndex);
    } else {
      onSaveConfig(itemIndex, selectedType, selectedQty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans text-walters-charcoal antialiased">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-walters-navy/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-walters-cream shadow-2xl flex flex-col justify-between border-l border-walters-border animate-in slide-in-from-right duration-300">
          
          {/* Panel Header */}
          <div className="p-5 bg-white border-b border-walters-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-walters-navy" />
              <h2 className="text-base font-semibold text-walters-navy tracking-tight">
                Configure Item Specs
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-walters-slate hover:text-walters-navy hover:bg-walters-offwhite transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Image Carousel Panel */}
            <div className="relative bg-white rounded-2xl border border-walters-border p-4 flex flex-col items-center justify-center group">
              <div className="w-full aspect-square flex items-center justify-center p-2">
                <img
                  src={galleryImages[activeImageIdx] || product.image_url}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-walters-border text-walters-navy shadow-xs hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-walters-border text-walters-navy shadow-xs hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center space-x-2 pt-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-10 h-10 rounded-lg border p-1 bg-walters-cream cursor-pointer transition-all ${
                        activeImageIdx === idx
                          ? 'border-walters-navy ring-2 ring-walters-navy/20'
                          : 'border-walters-border opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Title & Price */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-walters-slate uppercase tracking-wider block">
                {product.brand}
              </span>
              <h3 className="text-lg font-bold text-walters-navy leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-walters-slate">
                Color: <strong className="text-walters-navy">{product.color_description}</strong> • Shape: {product.shape}
              </p>
              <div className="text-lg font-bold text-walters-navy pt-1 tabular-nums">
                {formatPrice(activePrice)}
              </div>
            </div>

            {/* Purchase Options Dropdown / Radios */}
            <div className="space-y-3 pt-2 border-t border-walters-border">
              <label className="block text-xs font-semibold text-walters-navy uppercase tracking-wider">
                Select Lens / Frame Option
              </label>

              <div className="space-y-2.5">
                {/* Standard Lenses Option */}
                <div
                  onClick={() => setSelectedType('standard')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedType === 'standard'
                      ? 'bg-white border-walters-navy ring-1 ring-walters-navy'
                      : 'bg-walters-offwhite/60 border-walters-border hover:bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-walters-navy block">
                      Frame + Standard Lenses
                    </span>
                    <span className="text-[11px] text-walters-slate block">
                      Includes standard demo optical lenses
                    </span>
                  </div>
                  <span className="text-xs font-bold text-walters-navy tabular-nums">
                    {formatPrice(product.price_full_gbp)}
                  </span>
                </div>

                {/* Frames Only Option */}
                {Boolean(product.price_frame_only_gbp) && (
                  <div
                    onClick={() => setSelectedType('frames_only')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      selectedType === 'frames_only'
                        ? 'bg-white border-walters-navy ring-1 ring-walters-navy'
                        : 'bg-walters-offwhite/60 border-walters-border hover:bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-walters-navy block">
                        Frames Only (No Prescription)
                      </span>
                      <span className="text-[11px] text-walters-slate block">
                        Buy frame for existing or custom fitting
                      </span>
                    </div>
                    <span className="text-xs font-bold text-walters-navy tabular-nums">
                      {formatPrice(product.price_frame_only_gbp ?? product.price_full_gbp)}
                    </span>
                  </div>
                )}

                {/* Custom Prescription Option */}
                <div
                  onClick={() => setSelectedType('prescription')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedType === 'prescription'
                      ? 'bg-white border-walters-navy ring-1 ring-walters-navy'
                      : 'bg-walters-offwhite/60 border-walters-border hover:bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-walters-navy flex items-center gap-1.5">
                      <span>Add Prescription Lenses</span>
                      {cartItem.prescription && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </span>
                    <span className="text-[11px] text-walters-slate block">
                      Custom SPH, CYL, AXIS & Pupillary Distance
                    </span>
                  </div>
                  <span className="text-xs font-bold text-walters-navy tabular-nums">
                    {formatPrice(product.price_full_gbp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5 pt-2 border-t border-walters-border">
              <label className="block text-xs font-semibold text-walters-navy uppercase tracking-wider">
                Quantity
              </label>
              <select
                value={selectedQty}
                onChange={(e) => setSelectedQty(Number(e.target.value))}
                className="w-full bg-white border border-walters-border rounded-xl px-3 py-2 text-xs font-semibold text-walters-navy focus:outline-none focus:ring-1 focus:ring-walters-navy cursor-pointer"
              >
                {Array.from({ length: Math.min(10, product.stock_quantity) }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'unit' : 'units'}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Panel Footer Action */}
          <div className="p-5 bg-white border-t border-walters-border space-y-3">
            <button
              type="button"
              onClick={handleApplyChanges}
              className="w-full py-3.5 bg-walters-navy text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer shadow-xs"
            >
              {selectedType === 'prescription'
                ? 'Configure Prescription Details →'
                : 'Update Item Specs'}
            </button>
            <div className="flex items-center justify-center space-x-1 text-[10px] text-walters-slate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>In-place basket synchronization active</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};