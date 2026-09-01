import React from 'react';
import type { CartItem } from '../types';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Edit3, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../hooks/useCart';

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
  const { handleSelectPrescription } = useCart();

  if (!isOpen) return null;

  const getItemPrice = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotal = cartItems.reduce(
    (acc, item) => (item.product.stock_quantity > 0 ? acc + getItemPrice(item) * item.quantity : acc),
    0
  );

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const hasUnavailableItems = cartItems.some((item) => item.product.stock_quantity <= 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans text-walters-charcoal antialiased">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-walters-navy/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-walters-cream shadow-2xl flex flex-col justify-between border-l border-walters-border">
          
          {/* Drawer Header */}
          <div className="p-5 bg-white border-b border-walters-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-4 h-4 text-walters-navy" />
              <h2 className="text-base font-semibold text-walters-navy tracking-tight">
                Your Bag <span className="text-xs font-normal text-walters-slate tabular-nums">({totalItemsCount})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-walters-slate hover:text-walters-navy hover:bg-walters-offwhite transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-walters-offwhite rounded-full flex items-center justify-center text-walters-navy/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-walters-navy">Your shopping bag is empty</p>
                  <p className="text-xs text-walters-slate mt-1">Explore our luxury frames to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-walters-navy text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer"
                >
                  Browse Frames
                </button>
              </div>
            ) : (
              <div className="divide-y divide-walters-border">
                {cartItems.map((item, idx) => {
                  const itemPrice = getItemPrice(item);
                  const isOutOfStock = item.product.stock_quantity <= 0;

                  return (
                    <div
                      key={idx}
                      className={`py-4 first:pt-0 last:pb-0 flex gap-4 items-center transition-all ${
                        isOutOfStock ? 'bg-red-50/30 p-2 rounded-lg' : ''
                      }`}
                    >
                      {/* Image Thumbnail with Isolated Grayscale */}
                      <div
                        className={`w-16 h-16 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center border border-walters-border ${
                          isOutOfStock ? 'grayscale opacity-60' : ''
                        }`}
                      >
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="object-contain max-h-full"
                          />
                        ) : (
                          <span className="text-base font-bold text-walters-navy/30">
                            {item.product.name[0]}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm text-walters-navy truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-walters-slate truncate">
                          {item.product.brand} • {item.product.color_description}
                        </p>
                        
                        {isOutOfStock ? (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Currently unavailable</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-walters-offwhite text-walters-navy">
                              {item.purchaseType === 'prescription' ? 'Full Prescription' : 'Frame Only'}
                            </span>
                            {item.purchaseType === 'prescription' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  handleSelectPrescription(item.product, idx);
                                }}
                                className="text-[10px] font-semibold text-walters-navy hover:underline flex items-center space-x-0.5 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-semibold text-sm text-walters-navy tabular-nums">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                        
                        <div className="flex items-center border border-walters-border rounded-md bg-walters-offwhite">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, -1)}
                            disabled={isOutOfStock}
                            className="p-1 hover:text-walters-gold transition-colors cursor-pointer disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-walters-navy" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-walters-navy tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, 1)}
                            disabled={isOutOfStock || item.quantity >= item.product.stock_quantity}
                            className="p-1 hover:text-walters-gold transition-colors cursor-pointer disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-walters-navy" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        className="p-1 text-walters-slate hover:text-red-600 transition-colors cursor-pointer"
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
            <div className="p-5 bg-white border-t border-walters-border space-y-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-walters-slate uppercase tracking-wider">Subtotal</span>
                <span className="text-lg font-bold text-walters-navy tabular-nums">
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
                className="w-full py-2.5 bg-transparent border border-walters-navy text-walters-navy text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-walters-offwhite transition-all cursor-pointer"
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
                disabled={hasUnavailableItems}
                className="w-full py-3.5 bg-walters-navy text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{hasUnavailableItems ? 'Remove Unavailable Items' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-walters-slate pt-1">
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