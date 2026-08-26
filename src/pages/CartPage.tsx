import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Gift, 
  Store,
  Bookmark,
  Trash2,
  Edit3
} from 'lucide-react';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const {
    cartItems,
    savedItems,
    handleUpdateQuantity,
    handleRemoveItem,
    handleSaveForLater,
    handleMoveToCart,
    handleRemoveSavedItem,
    handleSelectPrescription,
  } = useCart();

  const [isGift, setIsGift] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [promoCheckbox, setPromoCheckbox] = useState(false);

  const getItemPrice = (item: typeof cartItems[0]) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + getItemPrice(item) * item.quantity,
    0
  );

  const discountAmount = promoCheckbox ? rawSubtotal * 0.1 : appliedDiscount;
  const finalSubtotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WALTERS10' || couponCode.trim().toUpperCase() === 'PROMO') {
      setAppliedDiscount(rawSubtotal * 0.1);
    } else {
      alert('Invalid Promo Code. Try WALTERS10');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 font-sans text-[#1A1A1A] antialiased">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#021438] mb-6">
          Your Basket <span className="text-base font-normal text-[#5E6470] tabular-nums">({cartItems.length} items)</span>
        </h1>

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-xl font-semibold text-[#021438]">Your shopping basket is empty</h2>
            <p className="text-sm text-[#5E6470]">Discover hand-crafted optical frames tailored specifically for your vision.</p>
            <Link
              to="/catalog"
              className="inline-block px-6 py-3 bg-[#021438] text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Shop Cards & Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              
              {cartItems.length > 0 && (
                <div className="bg-white border border-[#E5E0D8] rounded-xl shadow-xs overflow-hidden">
                  
                  {/* Store Header */}
                  <div className="p-4 sm:p-5 border-b border-[#E5E0D8] bg-[#FBFAF5] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-[#021438]" />
                      <span className="font-semibold text-xs tracking-wide uppercase text-[#021438]">
                        Walters Opticians Flagship
                      </span>
                    </div>
                  </div>

                  {/* Promo Banner */}
                  <div className="px-5 py-3 bg-[#FFFBF0] border-b border-[#F0E6D2] flex items-center space-x-3 text-xs text-[#021438]">
                    <input
                      type="checkbox"
                      id="shop-promo"
                      checked={promoCheckbox}
                      onChange={(e) => setPromoCheckbox(e.target.checked)}
                      className="rounded border-[#E5E0D8] text-[#021438] focus:ring-[#021438] cursor-pointer"
                    />
                    <label htmlFor="shop-promo" className="cursor-pointer font-medium">
                      Apply 10% store discount with promo code <span className="font-bold">PROMO</span>
                    </label>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-[#E5E0D8]">
                    {cartItems.map((item, idx) => {
                      const itemPrice = getItemPrice(item);

                      return (
                        <div key={idx} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                          
                          {/* Image Thumbnail */}
                          <div className="w-24 h-24 bg-[#F8F6F0] rounded-lg p-2 shrink-0 flex items-center justify-center border border-[#E5E0D8]">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="object-contain max-h-full"
                              />
                            ) : (
                              <span className="text-xl font-bold text-[#021438]/30">
                                {item.product.name[0]}
                              </span>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-semibold text-base text-[#021438] leading-tight">
                                  {item.product.name}
                                </h3>
                                <p className="text-xs text-[#5E6470] mt-0.5">
                                  {item.product.brand} • {item.product.color_description}
                                </p>
                              </div>
                              <span className="font-semibold text-base text-[#021438] tabular-nums shrink-0">
                                {formatPrice(itemPrice * item.quantity)}
                              </span>
                            </div>

                            {/* Lens Type Badge */}
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#F3F0E6] text-[#021438]">
                                {item.purchaseType === 'prescription'
                                  ? 'Full Prescription Lenses'
                                  : 'Frames Only (Demo Lenses)'}
                              </span>
                            </div>

                            {/* Urgency Badge */}
                            <div className="text-[11px] font-medium text-amber-800 bg-amber-50/80 inline-block px-2 py-0.5 rounded border border-amber-200">
                              Popular item — reserved for current checkout session
                            </div>

                            {/* Controls Row */}
                            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#021438]">
                              
                              {/* Uniform Quantity Dropdown */}
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                                  className="appearance-none bg-[#F3F0E6] border border-[#E5E0D8] rounded-md px-3 py-1.5 pr-8 font-medium text-xs tabular-nums cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#021438]"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-[#021438] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>

                              {/* Edit Option */}
                              {item.purchaseType === 'prescription' && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectPrescription(item.product, idx)}
                                  className="hover:underline flex items-center space-x-1 text-[#021438]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Save for later */}
                              <button
                                type="button"
                                onClick={() => handleSaveForLater(idx)}
                                className="hover:underline text-[#5E6470] hover:text-[#021438]"
                              >
                                Save for later
                              </button>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="hover:underline text-[#5E6470] hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Info */}
                  <div className="p-4 bg-[#FBFAF5] border-t border-[#E5E0D8] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#5E6470] gap-2">
                    <span>
                      Delivery: <strong className="text-[#021438] font-semibold">FREE</strong> (Estimated 2-3 working days)
                    </span>
                    <button 
                      onClick={() => navigate('/checkout')}
                      className="font-semibold text-[#021438] hover:underline flex items-center space-x-1"
                    >
                      <span>Check out from this store</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* SAVE FOR LATER */}
              {savedItems.length > 0 && (
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#E5E0D8] pb-3">
                    <Bookmark className="w-4 h-4 text-[#021438]" />
                    <h2 className="text-base font-semibold text-[#021438]">
                      Saved for Later <span className="text-xs font-normal text-[#5E6470] tabular-nums">({savedItems.length})</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-[#E5E0D8]">
                    {savedItems.map((sItem, sIdx) => (
                      <div key={sIdx} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-[#F8F6F0] rounded-lg p-1 shrink-0 flex items-center justify-center border border-[#E5E0D8]">
                            {sItem.product.image_url ? (
                              <img src={sItem.product.image_url} alt={sItem.product.name} className="object-contain max-h-full" />
                            ) : (
                              <span className="text-lg font-bold text-[#021438]/30">
                                {sItem.product.name[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-[#021438]">{sItem.product.name}</h4>
                            <p className="text-xs text-[#5E6470] tabular-nums">{formatPrice(getItemPrice(sItem))}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-medium">
                          <button
                            onClick={() => handleMoveToCart(sIdx)}
                            className="px-3 py-1.5 bg-[#021438] text-white rounded-md hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
                          >
                            Move to Basket
                          </button>
                          <button
                            onClick={() => handleRemoveSavedItem(sIdx)}
                            className="p-1.5 text-[#5E6470] hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 shadow-xs space-y-5">
                
                <h2 className="text-base font-semibold text-[#021438] border-b border-[#E5E0D8] pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs text-[#5E6470]">
                  <div className="flex justify-between">
                    <span>Item(s) total</span>
                    <span className="font-semibold text-[#021438] tabular-nums">{formatPrice(rawSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Store discount</span>
                      <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#021438] tabular-nums">{formatPrice(finalSubtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-700">FREE</span>
                  </div>

                  <div className="border-t border-[#E5E0D8] pt-3 flex justify-between items-baseline text-base font-semibold text-[#021438]">
                    <span>Total ({cartItems.length} items)</span>
                    <span className="text-xl font-bold tabular-nums">{formatPrice(finalSubtotal)}</span>
                  </div>
                </div>

                {/* Gift Option */}
                <div className="pt-2 border-t border-[#E5E0D8]">
                  <label className="flex items-center space-x-2 text-xs text-[#021438] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="rounded border-[#E5E0D8] text-[#021438] focus:ring-[#021438] cursor-pointer"
                    />
                    <Gift className="w-4 h-4 text-[#021438]" />
                    <span>Mark order as a gift</span>
                  </label>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                  className="w-full py-3.5 bg-[#021438] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* PayPal Express Button */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                  className="w-full py-2.5 bg-[#FFC439] hover:bg-[#F2BA31] text-[#003087] text-xs font-bold rounded-full transition-all flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
                >
                  <span className="italic font-extrabold text-sm">Pay</span>
                  <span className="italic font-extrabold text-sm text-[#0079C1]">Pal</span>
                </button>

                {/* Security Guarantee */}
                <div className="pt-3 border-t border-[#E5E0D8] text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-[11px] font-medium text-[#5E6470]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Encrypted & Secure Checkout</span>
                  </div>
                </div>

                {/* Coupon Code Accordion */}
                <div className="border-t border-[#E5E0D8] pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-[#021438] hover:underline"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#E6AA38]" />
                      <span>Apply coupon code</span>
                    </div>
                    {showCouponInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showCouponInput && (
                    <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WALTERS10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-[#F8F6F0] border border-[#E5E0D8] rounded-md px-3 py-1.5 text-xs text-[#021438] uppercase focus:outline-none focus:ring-1 focus:ring-[#021438]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#021438] text-white text-xs font-semibold rounded-md hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};