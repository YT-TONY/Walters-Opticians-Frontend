import React from 'react';
import type{ CartItem } from '../types';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  if (!isOpen) return null;

  const getItemPrice = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Slider Header */}
          <div className="p-6 border-b border-border bg-cream flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-navy" />
              <h2 className="font-serif text-xl font-bold text-navy">
                Your Bag ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-offwhite rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate" />
            </button>
          </div>

          {/* Slider Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-slate py-16 space-y-3">
                <p className="text-sm">Your shopping bag is empty.</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-navy text-cream text-xs font-semibold rounded-xl hover:bg-gold hover:text-navy transition-all"
                >
                  Browse Frames
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const itemPrice = getItemPrice(item);
                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-3 bg-cream rounded-xl border border-border items-center"
                  >
                    <div className="w-16 h-16 bg-offwhite rounded-lg p-1 flex items-center justify-center shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="object-contain max-h-full"
                        />
                      ) : (
                        <span className="font-serif font-bold text-navy/30">
                          {item.product.name[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-navy text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate truncate">
                        {item.product.brand} • {item.product.color_description}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-gold">
                        {item.purchaseType === 'prescription' ? 'Full Prescription' : 'Frame Only'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="font-serif text-sm font-bold text-navy">
                        £{itemPrice * item.quantity}
                      </span>
                      <div className="flex items-center border border-border rounded bg-white">
                        <button
                          onClick={() => onUpdateQty(idx, -1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-offwhite"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-[11px] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(idx, 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-offwhite"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemove(idx)}
                      className="p-1 text-slate hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Slider Footer Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-border space-y-3 bg-cream">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-slate uppercase">Subtotal</span>
                <span className="font-serif text-xl font-bold text-navy">£{subtotal}</span>
              </div>

              {/* Link to Full Cart Page */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="w-full py-3 bg-offwhite border border-border text-navy text-xs font-bold rounded-xl hover:bg-border transition-all"
              >
                View Full Cart Page
              </button>

              {/* Direct Checkout Action */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="w-full py-3.5 bg-navy text-cream text-xs font-bold rounded-xl hover:bg-gold hover:text-navy transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};