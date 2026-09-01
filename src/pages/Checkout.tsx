import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { ordersApi, type BackendOrderCreate } from '../api/orders';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

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
  const [country, setCountry] = useState('UK');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_name) {
          setCountry(data.country_name);
        }
      })
      .catch(() => setCountry('United Kingdom'));
  }, []);

  const getItemPriceGbp = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotalGbp = cartItems.reduce((acc, item) => acc + getItemPriceGbp(item) * item.quantity, 0);
  const estimatedTaxGbp = Math.round(subtotalGbp * 0.2);
  const totalGbp = subtotalGbp + estimatedTaxGbp;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9+\s-]*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(value);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
      const msg = 'Please enter a valid numeric telephone number (7-15 digits).';
      setError(msg);
      toast.error(msg);
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length !== 16) {
      const msg = 'Please enter a valid 16-digit credit card number.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      const msg = 'Expiry date must be in MM/YY format.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (cvc.length < 3) {
      const msg = 'CVC must be 3 or 4 numeric digits.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const formattedAddress = `${fullName}, ${address}, ${city}, ${postalCode}`;

    try {
      let firstReferenceId = '';

      for (const item of cartItems) {
        let orderType: BackendOrderCreate['order_type'] = 'frame_only';
        if (item.purchaseType === 'prescription') {
          orderType = item.prescription?.uploadedFileUrl ? 'upload_prescription' : 'manual_prescription';
        }

        const payload: BackendOrderCreate = {
          product_id: item.product.id,
          quantity: item.quantity,
          order_type: orderType,
          shipping_address: formattedAddress,
          country: country.trim().toUpperCase() || 'UK',
          prescription_file_url: item.prescription?.uploadedFileUrl || null,
          right_sph: item.prescription?.odSphere || null,
          right_cyl: item.prescription?.odCyl || null,
          right_axis: item.prescription?.odAxis || null,
          left_sph: item.prescription?.osSphere || null,
          left_cyl: item.prescription?.osCyl || null,
          left_axis: item.prescription?.osAxis || null,
          pd_mm: item.prescription?.pd || null,
        };

        const createdOrder = await ordersApi.create(payload);
        if (!firstReferenceId) {
          firstReferenceId = createdOrder.reference_id;
        }
      }

      onClearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${firstReferenceId}`);
    } catch (err: unknown) {
      console.error('Order Creation Error:', err);
      
      const apiErr = err as ApiErrorResponse;
      const apiDetail = apiErr.response?.data?.detail;
      const errMsg = apiDetail || (err instanceof Error ? err.message : 'Failed to process order. Please try again.');
      
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-walters-cream flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-walters-navy mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-walters-slate mb-6">Add optical frames to your bag before checking out.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-walters-navy text-walters-cream text-xs font-bold rounded-xl hover:bg-walters-gold hover:text-walters-navy transition-all"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-walters-cream text-walters-charcoal">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8 border-b border-walters-border pb-4">
          <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-walters-slate hover:text-walters-navy">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-walters-navy text-walters-gold flex items-center justify-center font-serif font-bold text-sm">
              W
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-walters-navy">
              WALTERS OPTICIANS
            </span>
          </Link>
        </div>

        <h1 className="font-serif text-3xl font-bold text-walters-navy mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy">Customer information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Phone Number (Digits only)</label>
                  <input
                    type="tel"
                    placeholder="+447700900000"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy">Shipping address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Full name</label>
                  <input
                    type="text"
                    placeholder="Ada Walters"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="14 Rathbone Place"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">City</label>
                    <input
                      type="text"
                      placeholder="London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">Postal code</label>
                    <input
                      type="text"
                      placeholder="W1T 1HT"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Country (Detected via IP)</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy">Payment method</h2>
              <div className="space-y-4 bg-white p-5 border border-walters-border rounded-2xl">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Card number (16 Digits)</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    className="w-full px-4 py-3 bg-walters-cream border border-walters-border rounded-xl text-xs font-mono focus:outline-none focus:border-walters-navy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="09/29"
                      value={expiry}
                      onChange={handleExpiryChange}
                      required
                      className="w-full px-4 py-3 bg-walters-cream border border-walters-border rounded-xl text-xs font-mono focus:outline-none focus:border-walters-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">CVC (3 or 4 Digits)</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvc}
                      onChange={handleCvcChange}
                      required
                      className="w-full px-4 py-3 bg-walters-cream border border-walters-border rounded-xl text-xs font-mono focus:outline-none focus:border-walters-navy"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-walters-offwhite p-6 rounded-2xl border border-walters-border space-y-6 sticky top-8">
              <h2 className="font-serif text-xl font-bold text-walters-navy">Order summary</h2>

              <div className="space-y-4 divide-y divide-walters-border">
                {cartItems.map((item, idx) => {
                  const linePriceGbp = getItemPriceGbp(item) * item.quantity;
                  return (
                    <div key={idx} className="pt-4 first:pt-0 flex items-start gap-4">
                      <div className="w-16 h-16 bg-walters-cream rounded-xl p-1 border border-walters-border flex items-center justify-center shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="object-contain max-h-full"
                          />
                        ) : (
                          <span className="font-serif text-lg font-bold text-walters-navy/30">
                            {item.product.name[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-walters-navy text-sm">
                          {item.product.name} <span className="text-xs font-normal">× {item.quantity}</span>
                        </h4>
                        <p className="text-[11px] text-walters-slate mt-0.5">
                          {item.purchaseType === 'prescription' ? 'Single vision' : 'Frame only'}
                        </p>
                      </div>

                      <span className="font-serif font-bold text-walters-navy text-sm">
                        {formatPrice(linePriceGbp)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-walters-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-walters-slate">
                  <span>Subtotal</span>
                  <span className="font-bold text-walters-navy">{formatPrice(subtotalGbp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-walters-slate">Shipping</span>
                  <span className="font-bold text-walters-gold">FREE</span>
                </div>
                <div className="flex justify-between text-walters-slate">
                  <span>Estimated tax</span>
                  <span className="font-bold text-walters-navy">{formatPrice(estimatedTaxGbp)}</span>
                </div>
              </div>

              <div className="border-t border-walters-border pt-4 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-walters-navy">Total</span>
                <span className="font-serif font-bold text-2xl text-walters-navy">{formatPrice(totalGbp)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-walters-navy text-walters-cream text-xs font-bold rounded-xl hover:bg-walters-gold hover:text-walters-navy transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing Order...' : 'Complete Order'}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-walters-slate pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Encrypted 256-bit optical transaction security</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};