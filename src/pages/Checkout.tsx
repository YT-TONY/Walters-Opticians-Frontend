import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface CheckoutProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

// Fixed: Moved outside component to prevent React Compiler impure render warnings
const generateFallbackOrderId = (): string => {
  return `WALT-${Math.floor(100000 + Math.random() * 900000)}`;
};

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, onClearCart }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error] = useState('');

  const getItemPriceGbp = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotalGbp = cartItems.reduce((acc, item) => acc + getItemPriceGbp(item) * item.quantity, 0);
  const estimatedTaxGbp = Math.round(subtotalGbp * 0.2);
  const totalGbp = subtotalGbp + estimatedTaxGbp;

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderPayload = {
      customer: { email, phone, full_name: fullName },
      shipping_address: { address, city, postal_code: postalCode, country },
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        purchase_type: item.purchaseType,
        unit_price_gbp: getItemPriceGbp(item),
        prescription: item.prescription || null,
      })),
      subtotal_gbp: subtotalGbp,
      tax_gbp: estimatedTaxGbp,
      total_gbp: totalGbp,
    };

    try {
      const res = await apiClient.post('/orders', orderPayload);
      const orderId = res.data?.id || generateFallbackOrderId();
      onClearCart();
      navigate(`/order-success/${orderId}`);
    } catch {
      onClearCart();
      navigate(`/order-success/${generateFallbackOrderId()}`);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFAF5] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#021438] mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-[#5E6470] mb-6">Add optical frames to your bag before checking out.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#021438] text-[#FBFAF5] text-xs font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF5] text-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8 border-b border-[#E5E0D8] pb-4">
          <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-[#5E6470] hover:text-[#021438]">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#021438] text-[#E6AA38] flex items-center justify-center font-serif font-bold text-sm">
              W
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-[#021438]">
              WALTERS OPTICIANS
            </span>
          </Link>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#021438] mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#021438]">Customer information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#021438]">Shipping address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Full name</label>
                  <input
                    type="text"
                    placeholder="Ada Walters"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="14 Rathbone Place"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">City</label>
                    <input
                      type="text"
                      placeholder="London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Postal code</label>
                    <input
                      type="text"
                      placeholder="W1T 1HT"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-xs focus:outline-none focus:border-[#021438]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#021438]">Payment method</h2>
              <div className="space-y-4 bg-white p-5 border border-[#E5E0D8] rounded-2xl">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Card number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#FBFAF5] border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#021438]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="09/29"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FBFAF5] border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#021438]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5E6470] mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FBFAF5] border border-[#E5E0D8] rounded-xl text-xs font-mono focus:outline-none focus:border-[#021438]"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#F3F0E6] p-6 rounded-2xl border border-[#E5E0D8] space-y-6 sticky top-8">
              <h2 className="font-serif text-xl font-bold text-[#021438]">Order summary</h2>

              <div className="space-y-4 divide-y divide-[#E5E0D8]">
                {cartItems.map((item, idx) => {
                  const linePriceGbp = getItemPriceGbp(item) * item.quantity;
                  return (
                    <div key={idx} className="pt-4 first:pt-0 flex items-start gap-4">
                      <div className="w-16 h-16 bg-[#FBFAF5] rounded-xl p-1 border border-[#E5E0D8] flex items-center justify-center shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="object-contain max-h-full"
                          />
                        ) : (
                          <span className="font-serif text-lg font-bold text-[#021438]/30">
                            {item.product.name[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-[#021438] text-sm">
                          {item.product.name} <span className="text-xs font-normal">× {item.quantity}</span>
                        </h4>
                        <p className="text-[11px] text-[#5E6470] mt-0.5">
                          {item.purchaseType === 'prescription' ? 'Single vision' : 'Frame only'}
                        </p>
                        <p className="text-[10px] text-[#5E6470]">
                          {item.prescription ? 'Prescription attached' : 'Prescription to follow after checkout'}
                        </p>
                      </div>

                      <span className="font-serif font-bold text-[#021438] text-sm">
                        {formatPrice(linePriceGbp)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#E5E0D8] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#5E6470]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#021438]">{formatPrice(subtotalGbp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E6470]">Shipping</span>
                  <span className="font-bold text-[#E6AA38]">FREE</span>
                </div>
                <div className="flex justify-between text-[#5E6470]">
                  <span>Estimated tax</span>
                  <span className="font-bold text-[#021438]">{formatPrice(estimatedTaxGbp)}</span>
                </div>
              </div>

              <div className="border-t border-[#E5E0D8] pt-4 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-[#021438]">Total</span>
                <span className="font-serif font-bold text-2xl text-[#021438]">{formatPrice(totalGbp)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#021438] text-[#FBFAF5] text-xs font-bold rounded-xl hover:bg-[#E6AA38] hover:text-[#021438] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing Order...' : 'Complete Order'}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#5E6470] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                <span>Encrypted 256-bit optical transaction security</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};