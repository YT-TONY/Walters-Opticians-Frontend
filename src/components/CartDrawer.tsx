import React from 'react';
import type { CartItem } from '../types';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemove,
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  const getItemPrice = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + getItemPrice(item) * item.quantity,
    0
  );

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans text-[#1A1A1A] antialiased">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#021438]/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col justify-between border-l border-[#E5E0D8]">
          
          {/* Drawer Header */}
          <div className="p-5 bg-white border-b border-[#E5E0D8] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-4 h-4 text-[#021438]" />
              <h2 className="text-base font-semibold text-[#021438] tracking-tight">
                Your Bag <span className="text-xs font-normal text-[#5E6470] tabular-nums">({totalItemsCount})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#5E6470] hover:text-[#021438] hover:bg-[#F3F0E6] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-[#F3F0E6] rounded-full flex items-center justify-center text-[#021438]/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#021438]">Your shopping bag is empty</p>
                  <p className="text-xs text-[#5E6470] mt-1">Explore our luxury frames to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#021438] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all cursor-pointer"
                >
                  Browse Frames
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E0D8]">
                {cartItems.map((item, idx) => {
                  const itemPrice = getItemPrice(item);

                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 bg-[#F8F6F0] rounded-lg p-1.5 shrink-0 flex items-center justify-center border border-[#E5E0D8]">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="object-contain max-h-full"
                          />
                        ) : (
                          <span className="text-base font-bold text-[#021438]/30">
                            {item.product.name[0]}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm text-[#021438] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#5E6470] truncate">
                          {item.product.brand} • {item.product.color_description}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#F3F0E6] text-[#021438]">
                          {item.purchaseType === 'prescription' ? 'Full Prescription' : 'Frame Only'}
                        </span>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-semibold text-sm text-[#021438] tabular-nums">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                        
                        <div className="flex items-center border border-[#E5E0D8] rounded-md bg-[#F3F0E6]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, -1)}
                            className="p-1 hover:text-[#E6AA38] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-[#021438]" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#021438] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, 1)}
                            className="p-1 hover:text-[#E6AA38] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-[#021438]" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        className="p-1 text-[#5E6470] hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E5E0D8] space-y-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-[#5E6470] uppercase tracking-wider">Subtotal</span>
                <span className="text-lg font-bold text-[#021438] tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* View Full Cart Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="w-full py-2.5 bg-transparent border border-[#021438] text-[#021438] text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#F3F0E6] transition-all cursor-pointer"
              >
                View Full Cart Page
              </button>

              {/* Direct Checkout Action */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 bg-[#021438] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#5E6470] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted & 100% Secure Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};