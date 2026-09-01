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
  Edit3,
  AlertTriangle
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
    (acc, item) => (item.product.stock_quantity > 0 ? acc + getItemPrice(item) * item.quantity : acc),
    0
  );

  const discountAmount = promoCheckbox ? rawSubtotal * 0.1 : appliedDiscount;
  const finalSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const hasUnavailableItems = cartItems.some((item) => item.product.stock_quantity <= 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WALTERS10' || couponCode.trim().toUpperCase() === 'PROMO') {
      setAppliedDiscount(rawSubtotal * 0.1);
    } else {
      alert('Invalid Promo Code. Try WALTERS10');
    }
  };

  return (
    <div className="min-h-screen bg-walters-cream py-10 px-4 sm:px-6 lg:px-8 font-sans text-walters-charcoal antialiased">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-walters-navy mb-6">
          Your Basket <span className="text-base font-normal text-walters-slate tabular-nums">({cartItems.length} items)</span>
        </h1>

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <div className="bg-white border border-walters-border rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-xl font-semibold text-walters-navy">Your shopping basket is empty</h2>
            <p className="text-sm text-walters-slate">Discover hand-crafted optical frames tailored specifically for your vision.</p>
            <Link
              to="/catalog"
              className="inline-block px-6 py-3 bg-walters-navy text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Shop Cards & Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              
              {cartItems.length > 0 && (
                <div className="bg-white border border-walters-border rounded-xl shadow-xs overflow-hidden">
                  
                  {/* Store Header */}
                  <div className="p-4 sm:p-5 border-b border-walters-border bg-walters-offwhite flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-walters-navy" />
                      <span className="font-semibold text-xs tracking-wide uppercase text-walters-navy">
                        Walters Opticians Flagship
                      </span>
                    </div>
                  </div>

                  {/* Promo Banner */}
                  <div className="px-5 py-3 bg-amber-50/50 border-b border-amber-200/60 flex items-center space-x-3 text-xs text-walters-navy">
                    <input
                      type="checkbox"
                      id="shop-promo"
                      checked={promoCheckbox}
                      onChange={(e) => setPromoCheckbox(e.target.checked)}
                      className="rounded border-walters-border text-walters-navy focus:ring-walters-navy cursor-pointer"
                    />
                    <label htmlFor="shop-promo" className="cursor-pointer font-medium">
                      Apply 10% store discount with promo code <span className="font-bold">PROMO</span>
                    </label>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-walters-border">
                    {cartItems.map((item, idx) => {
                      const itemPrice = getItemPrice(item);
                      const isOutOfStock = item.product.stock_quantity <= 0;
                      const maxSelectable = Math.min(10, item.product.stock_quantity || 0);
                      const optionsList = Array.from({ length: maxSelectable }, (_, i) => i + 1);

                      return (
                        <div
                          key={idx}
                          className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all ${
                            isOutOfStock ? 'bg-red-50/20' : ''
                          }`}
                        >
                          {/* Image Thumbnail with Isolated Grayscale */}
                          <div
                            className={`w-24 h-24 bg-walters-cream rounded-lg p-2 shrink-0 flex items-center justify-center border border-walters-border ${
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
                              <span className="text-xl font-bold text-walters-navy/30">
                                {item.product.name[0]}
                              </span>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-semibold text-base text-walters-navy leading-tight">
                                  {item.product.name}
                                </h3>
                                <p className="text-xs text-walters-slate mt-0.5">
                                  {item.product.brand} • {item.product.color_description}
                                </p>
                              </div>
                              <span className="font-semibold text-base text-walters-navy tabular-nums shrink-0">
                                {formatPrice(itemPrice * item.quantity)}
                              </span>
                            </div>

                            {/* Status Badges */}
                            {isOutOfStock ? (
                              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Currently unavailable</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-walters-offwhite text-walters-navy">
                                  {item.purchaseType === 'prescription'
                                    ? 'Full Prescription Lenses'
                                    : 'Frames Only (Demo Lenses)'}
                                </span>
                                <div className="text-[11px] font-medium text-amber-800 bg-amber-50/80 inline-block px-2 py-0.5 rounded border border-amber-200">
                                  Popular item — {item.product.stock_quantity} units available in stock
                                </div>
                              </div>
                            )}

                            {/* Controls Row */}
                            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-walters-navy">
                              {/* Quantity Dropdown */}
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  disabled={isOutOfStock}
                                  onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                                  className="appearance-none bg-walters-offwhite border border-walters-border rounded-md px-3 py-1.5 pr-8 font-medium text-xs tabular-nums cursor-pointer focus:outline-none focus:ring-1 focus:ring-walters-navy disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {isOutOfStock ? (
                                    <option value={item.quantity}>0</option>
                                  ) : (
                                    optionsList.map((num) => (
                                      <option key={num} value={num}>
                                        {num}
                                      </option>
                                    ))
                                  )}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-walters-navy absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>

                              {/* Edit Option */}
                              {!isOutOfStock && item.purchaseType === 'prescription' && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectPrescription(item.product, idx)}
                                  className="hover:underline flex items-center space-x-1 text-walters-navy cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Save for later */}
                              <button
                                type="button"
                                onClick={() => handleSaveForLater(idx)}
                                className="hover:underline text-walters-slate hover:text-walters-navy cursor-pointer"
                              >
                                Save for later
                              </button>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="hover:underline text-walters-slate hover:text-red-600 cursor-pointer"
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
                  <div className="p-4 bg-walters-offwhite border-t border-walters-border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-walters-slate gap-2">
                    <span>
                      Delivery: <strong className="text-walters-navy font-semibold">FREE</strong> (Estimated 2-3 working days)
                    </span>
                    <button 
                      onClick={() => navigate('/checkout')}
                      disabled={hasUnavailableItems}
                      className="font-semibold text-walters-navy hover:underline flex items-center space-x-1 disabled:opacity-40 disabled:no-underline cursor-pointer"
                    >
                      <span>Check out from this store</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* SAVE FOR LATER */}
              {savedItems.length > 0 && (
                <div className="bg-white border border-walters-border rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-walters-border pb-3">
                    <Bookmark className="w-4 h-4 text-walters-navy" />
                    <h2 className="text-base font-semibold text-walters-navy">
                      Saved for Later <span className="text-xs font-normal text-walters-slate tabular-nums">({savedItems.length})</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-walters-border">
                    {savedItems.map((sItem, sIdx) => (
                      <div key={sIdx} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-walters-cream rounded-lg p-1 shrink-0 flex items-center justify-center border border-walters-border">
                            {sItem.product.image_url ? (
                              <img src={sItem.product.image_url} alt={sItem.product.name} className="object-contain max-h-full" />
                            ) : (
                              <span className="text-lg font-bold text-walters-navy/30">
                                {sItem.product.name[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-walters-navy">{sItem.product.name}</h4>
                            <p className="text-xs text-walters-slate tabular-nums">{formatPrice(getItemPrice(sItem))}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-medium">
                          <button
                            onClick={() => handleMoveToCart(sIdx)}
                            className="px-3 py-1.5 bg-walters-navy text-white rounded-md hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer"
                          >
                            Move to Basket
                          </button>
                          <button
                            onClick={() => handleRemoveSavedItem(sIdx)}
                            className="p-1.5 text-walters-slate hover:text-red-600 cursor-pointer"
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
              <div className="bg-white border border-walters-border rounded-xl p-6 shadow-xs space-y-5">
                
                <h2 className="text-base font-semibold text-walters-navy border-b border-walters-border pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs text-walters-slate">
                  <div className="flex justify-between">
                    <span>Item(s) total</span>
                    <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(rawSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Store discount</span>
                      <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-walters-navy tabular-nums">{formatPrice(finalSubtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-700">FREE</span>
                  </div>

                  <div className="border-t border-walters-border pt-3 flex justify-between items-baseline text-base font-semibold text-walters-navy">
                    <span>Total ({cartItems.length} items)</span>
                    <span className="text-xl font-bold tabular-nums">{formatPrice(finalSubtotal)}</span>
                  </div>
                </div>

                {/* Gift Option */}
                <div className="pt-2 border-t border-walters-border">
                  <label className="flex items-center space-x-2 text-xs text-walters-navy font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="rounded border-walters-border text-walters-navy focus:ring-walters-navy cursor-pointer"
                    />
                    <Gift className="w-4 h-4 text-walters-navy" />
                    <span>Mark order as a gift</span>
                  </label>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0 || hasUnavailableItems}
                  className="w-full py-3.5 bg-walters-navy text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{hasUnavailableItems ? 'Remove Unavailable Items' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Security Guarantee */}
                <div className="pt-3 border-t border-walters-border text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-[11px] font-medium text-walters-slate">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Encrypted & Secure Checkout</span>
                  </div>
                </div>

                {/* Coupon Code Accordion */}
                <div className="border-t border-walters-border pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-walters-navy hover:underline cursor-pointer"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-walters-gold" />
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
                        className="flex-1 bg-walters-cream border border-walters-border rounded-md px-3 py-1.5 text-xs text-walters-navy uppercase focus:outline-none focus:ring-1 focus:ring-walters-navy"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-walters-navy text-white text-xs font-semibold rounded-md hover:bg-walters-gold hover:text-walters-navy transition-all cursor-pointer"
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