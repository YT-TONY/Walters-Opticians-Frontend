import React from 'react';
import type{ CartItem } from '../types';
import { Trash2, ArrowRight } from 'lucide-react';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

export const Cart: React.FC<CartProps> = ({ cartItems, onUpdateQty, onRemove }) => {
  const getItemPrice = (item: CartItem) =>
    item.purchaseType === 'prescription' ? item.product.price_full_gbp : item.product.price_frame_only_gbp;

  const subtotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FBFAF5] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-[#021438] mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] p-12 rounded-2xl text-center">
            <p className="text-[#5E6470]">Your bag is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item, idx) => {
                const itemPrice = getItemPrice(item);
                return (
                  <div key={idx} className="bg-white border border-[#E5E0D8] p-5 rounded-2xl flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#F3F0E6] rounded-xl p-2 shrink-0 flex items-center justify-center">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="object-contain max-h-full" />
                      ) : (
                        <span className="font-serif text-xl font-bold text-[#021438]/30">{item.product.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-[#021438]">{item.product.name}</h3>
                      <p className="text-xs text-[#5E6470]">{item.product.brand} • {item.product.color_description}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F3F0E6] text-[#021438]">
                        {item.purchaseType === 'prescription' ? 'Full Prescription Lenses' : 'Frames Only'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => onUpdateQty(idx, -1)} className="px-2 py-1 bg-[#F3F0E6] rounded font-bold text-xs">-</button>
                      <span className="text-xs font-semibold">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(idx, 1)} className="px-2 py-1 bg-[#F3F0E6] rounded font-bold text-xs">+</button>
                    </div>
                    <span className="font-serif font-bold text-[#021438]">£{itemPrice * item.quantity}</span>
                    <button onClick={() => onRemove(idx)} className="text-[#5E6470] hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white border border-[#E5E0D8] p-6 rounded-2xl space-y-4 sticky top-24">
                <h3 className="font-serif font-bold text-lg text-[#021438]">Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold">£{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-[#E6AA38] font-bold">
                  <span>UK Express Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="border-t border-[#E5E0D8] pt-4 flex justify-between text-lg font-serif font-bold">
                  <span>Total</span>
                  <span>£{subtotal}</span>
                </div>
                <button className="w-full py-4 bg-[#021438] text-[#FBFAF5] font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};