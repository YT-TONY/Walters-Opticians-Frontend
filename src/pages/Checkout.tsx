// src/pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { ordersApi, type BackendOrderCreate } from '../api/orders';
import { ShieldCheck, ArrowLeft, MapPin, Building2, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

interface ValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | ValidationErrorItem[];
    };
  };
  message?: string;
}

// Strict API interfaces
interface RestCountryRaw {
  name?: {
    common?: string;
  };
  cca2?: string;
  idd?: {
    root?: string;
    suffixes?: string[];
  };
}

interface CountryOption {
  name: string;
  code: string;
  dialCode: string;
}

interface StateOption {
  name: string;
  state_code?: string;
}

interface CountriesNowStatesResponse {
  error: boolean;
  msg: string;
  data?: {
    name: string;
    iso2: string;
    states: StateOption[];
  };
}

interface CountriesNowCitiesResponse {
  error: boolean;
  msg: string;
  data?: string[];
}

interface CountriesNowIsoResponse {
  error: boolean;
  msg: string;
  data?: Array<{
    name: string;
    Iso2: string;
  }>;
}

interface IpApiResponse {
  country_name?: string;
  country_code?: string;
  city?: string;
  region?: string;
}

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, onClearCart }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Contact Info
  const [email, setEmail] = useState(user?.email || '');
  const [phoneDialCode, setPhoneDialCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState(user?.full_name || '');

  // Address Details
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Location Selector States
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);

  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [useManualState, setUseManualState] = useState(false);

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [useManualCity, setUseManualCity] = useState(false);

  // Loading States
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Payment Details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch dynamic country list with resilient multi-tier fallback (Primary API -> Secondary API -> Offline Presets)
  useEffect(() => {
    let isMounted = true;

    const handleIpDetection = async (availableCountries: CountryOption[]) => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData: IpApiResponse = await ipRes.json();

        if (ipData && ipData.country_name) {
          const matched = availableCountries.find(
            (c) =>
              c.name.toLowerCase() === ipData.country_name?.toLowerCase() ||
              c.code.toLowerCase() === ipData.country_code?.toLowerCase()
          );
          if (matched && isMounted) {
            setSelectedCountry(matched);
            setPhoneDialCode(matched.dialCode);
            if (ipData.region) setSelectedState(ipData.region);
            if (ipData.city) setSelectedCity(ipData.city);
            return;
          }
        }
      } catch (ipErr: unknown) {
        console.warn('IP auto-detection skipped:', ipErr);
      }

      if (isMounted) {
        const defaultGb = availableCountries.find((c) => c.code === 'GB') || availableCountries[0];
        if (defaultGb) {
          setSelectedCountry(defaultGb);
          setPhoneDialCode(defaultGb.dialCode);
        }
      }
    };

    const fetchCountries = async () => {
      // Tier 1: Primary REST Countries API
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
        if (res.ok) {
          const data: RestCountryRaw[] = await res.json();
          const parsedCountries: CountryOption[] = data
            .map((c) => {
              const root = c.idd?.root || '';
              const suffix = c.idd?.suffixes && c.idd.suffixes.length === 1 ? c.idd.suffixes[0] : '';
              const dialCode = root ? `${root}${suffix}` : '+1';
              return {
                name: c.name?.common || '',
                code: c.cca2 || '',
                dialCode,
              };
            })
            .filter((c) => c.name && c.code)
            .sort((a, b) => a.name.localeCompare(b.name));

          if (isMounted && parsedCountries.length > 0) {
            setCountries(parsedCountries);
            await handleIpDetection(parsedCountries);
            return;
          }
        }
      } catch (primaryErr: unknown) {
        console.warn('Primary country API blocked/failed, trying backup source...', primaryErr);
      }

      // Tier 2: Secondary CountriesNow ISO API
      try {
        const backupRes = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        if (backupRes.ok) {
          const backupData: CountriesNowIsoResponse = await backupRes.json();
          if (!backupData.error && backupData.data) {
            const fallbackCountries: CountryOption[] = backupData.data
              .map((c) => ({
                name: c.name,
                code: c.Iso2,
                dialCode: '+1',
              }))
              .sort((a, b) => a.name.localeCompare(b.name));

            if (isMounted && fallbackCountries.length > 0) {
              setCountries(fallbackCountries);
              await handleIpDetection(fallbackCountries);
              return;
            }
          }
        }
      } catch (backupErr: unknown) {
        console.warn('Backup country API blocked/failed:', backupErr);
      }

      // Tier 3: Built-in Offline Fallback List (Zero Network Dependency)
      if (isMounted) {
        const defaultList: CountryOption[] = [
          { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
          { name: 'United States', code: 'US', dialCode: '+1' },
          { name: 'Nigeria', code: 'NG', dialCode: '+234' },
          { name: 'Canada', code: 'CA', dialCode: '+1' },
          { name: 'Australia', code: 'AU', dialCode: '+61' },
          { name: 'Germany', code: 'DE', dialCode: '+49' },
          { name: 'France', code: 'FR', dialCode: '+33' },
          { name: 'Ireland', code: 'IE', dialCode: '+353' },
          { name: 'Netherlands', code: 'NL', dialCode: '+31' },
          { name: 'Spain', code: 'ES', dialCode: '+34' },
          { name: 'Italy', code: 'IT', dialCode: '+39' },
          { name: 'South Africa', code: 'ZA', dialCode: '+27' },
          { name: 'India', code: 'IN', dialCode: '+91' },
          { name: 'Ghana', code: 'GH', dialCode: '+233' },
          { name: 'Kenya', code: 'KE', dialCode: '+254' },
        ];
        setCountries(defaultList);
        setSelectedCountry(defaultList[0]);
        setPhoneDialCode(defaultList[0].dialCode);
      }
    };

    fetchCountries().finally(() => {
      if (isMounted) setLoadingCountries(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch States/Regions when Selected Country changes
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchStates = async () => {
      setLoadingStates(true);
      setStates([]);
      setCities([]);
      setUseManualState(false);
      setUseManualCity(false);

      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: selectedCountry.name }),
        });
        const result: CountriesNowStatesResponse = await res.json();

        if (!result.error && result.data && result.data.states && result.data.states.length > 0) {
          setStates(result.data.states);
        } else {
          setUseManualState(true);
          setUseManualCity(true);
        }
      } catch (err: unknown) {
        console.warn('Failed to fetch states, switching to manual input:', err);
        setUseManualState(true);
        setUseManualCity(true);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, [selectedCountry]);

  // 3. Fetch Cities when Selected State changes
  useEffect(() => {
    if (!selectedCountry || !selectedState || useManualState) return;

    const fetchCities = async () => {
      setLoadingCities(true);
      setCities([]);
      setUseManualCity(false);

      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: selectedCountry.name,
            state: selectedState,
          }),
        });
        const result: CountriesNowCitiesResponse = await res.json();

        if (!result.error && result.data && result.data.length > 0) {
          setCities(result.data);
        } else {
          setUseManualCity(true);
        }
      } catch (err: unknown) {
        console.warn('Failed to fetch cities, switching to manual input:', err);
        setUseManualCity(true);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedCountry, selectedState, useManualState]);

  const getItemPriceGbp = (item: CartItem) =>
    item.purchaseType === 'prescription'
      ? item.product.price_full_gbp
      : item.product.price_frame_only_gbp;

  const subtotalGbp = cartItems.reduce((acc, item) => acc + getItemPriceGbp(item) * item.quantity, 0);
  const estimatedTaxGbp = Math.round(subtotalGbp * 0.2);
  const totalGbp = subtotalGbp + estimatedTaxGbp;

  const handleCountryChange = (countryCode: string) => {
    const found = countries.find((c) => c.code === countryCode);
    if (found) {
      setSelectedCountry(found);
      setPhoneDialCode(found.dialCode);
      setSelectedState('');
      setSelectedCity('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9\s-]*$/.test(value)) {
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

    if (!selectedCountry) {
      const msg = 'Please select a valid shipping country.';
      setError(msg);
      toast.error(msg);
      return;
    }

    const cleanPhoneDigits = phone.replace(/[\s-]/g, '');
    if (!/^\d{6,14}$/.test(cleanPhoneDigits)) {
      const msg = 'Please enter a valid telephone number (6-14 digits).';
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

    const fullPhoneNumber = `${phoneDialCode} ${cleanPhoneDigits}`;
    const addressComponents = [
      fullName,
      addressLine1,
      addressLine2 ? `Landmark/Desc: ${addressLine2}` : '',
      selectedCity,
      selectedState,
      postalCode,
      `Tel: ${fullPhoneNumber}`,
    ].filter(Boolean);

    const formattedAddress = addressComponents.join(', ');

    try {
      const orderItems = cartItems.map((item) => {
        let orderType: 'frame_only' | 'upload_prescription' | 'manual_prescription' | 'book_appointment' = 'frame_only';
        if (item.purchaseType === 'prescription') {
          orderType = item.prescription?.uploadedFileUrl ? 'upload_prescription' : 'manual_prescription';
        }

        return {
          product_id: item.product.id,
          quantity: item.quantity,
          order_type: orderType,
          prescription_file_url: item.prescription?.uploadedFileUrl || null,
          right_sph: item.prescription?.odSphere || null,
          right_cyl: item.prescription?.odCyl || null,
          right_axis: item.prescription?.odAxis || null,
          left_sph: item.prescription?.osSphere || null,
          left_cyl: item.prescription?.osCyl || null,
          left_axis: item.prescription?.osAxis || null,
          pd_mm: item.prescription?.pd || null,
        };
      });

      const payload: BackendOrderCreate = {
        shipping_address: formattedAddress,
        country: selectedCountry.code.toUpperCase(),
        items: orderItems,
      };

      const createdOrder = await ordersApi.create(payload);

      onClearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${createdOrder.reference_id}`);
    } catch (err: unknown) {
      console.error('Order Creation Error:', err);

      const apiErr = err as ApiErrorResponse;
      const apiDetail = apiErr.response?.data?.detail;
      let errMsg = 'Failed to process order. Please try again.';

      if (typeof apiDetail === 'string') {
        errMsg = apiDetail;
      } else if (Array.isArray(apiDetail)) {
        errMsg = apiDetail
          .map((item) => {
            const field = item.loc ? item.loc[item.loc.length - 1] : 'Field';
            return `${field}: ${item.msg || 'Invalid input'}`;
          })
          .join(' | ');
      } else if (err instanceof Error) {
        errMsg = err.message;
      }

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
            {/* Customer Information Section */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy flex items-center space-x-2">
                <Phone className="w-5 h-5 text-walters-gold" />
                <span>Customer information</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Email Address</label>
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
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={phoneDialCode}
                      onChange={(e) => setPhoneDialCode(e.target.value)}
                      className="px-3 py-3 bg-white border border-walters-border rounded-xl text-xs font-medium focus:outline-none focus:border-walters-navy cursor-pointer"
                    >
                      {countries.map((c) => (
                        <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                          {c.code} ({c.dialCode})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      placeholder="7700 900000"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      className="flex-1 px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address Section */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-walters-gold" />
                <span>Shipping address</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Ada Walters"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>

                {/* Country Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1 items-center justify-between">
                    <span>Country / Region</span>
                    <span className="text-[10px] text-walters-gold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Auto-detected via IP
                    </span>
                  </label>
                  {loadingCountries ? (
                    <div className="px-4 py-3 bg-white border border-walters-border rounded-xl text-xs text-walters-slate">
                      Loading countries...
                    </div>
                  ) : (
                    <select
                      value={selectedCountry?.code || ''}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy cursor-pointer"
                    >
                      <option value="" disabled>
                        Select a Country
                      </option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="14 Rathbone Place"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>

                {/* Address Description / Landmark */}
                <div>
                  <label className="text-[11px] font-semibold text-walters-slate mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-walters-slate" />
                    <span>Address Description / Landmark (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, or prominent nearby landmark"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                  />
                </div>

                {/* State & City Cascading Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State / Province */}
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">
                      State / Region / Province
                    </label>
                    {loadingStates ? (
                      <div className="px-4 py-3 bg-white border border-walters-border rounded-xl text-xs text-walters-slate">
                        Loading states...
                      </div>
                    ) : !useManualState && states.length > 0 ? (
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy cursor-pointer"
                      >
                        <option value="">Select State / Region</option>
                        {states.map((s, idx) => (
                          <option key={`${s.name}-${idx}`} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="State or Region"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                      />
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">City / Town</label>
                    {loadingCities ? (
                      <div className="px-4 py-3 bg-white border border-walters-border rounded-xl text-xs text-walters-slate">
                        Loading cities...
                      </div>
                    ) : !useManualCity && cities.length > 0 ? (
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy cursor-pointer"
                      >
                        <option value="">Select City</option>
                        {cities.map((cityItem, idx) => (
                          <option key={`${cityItem}-${idx}`} value={cityItem}>
                            {cityItem}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="City or Town"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-xs focus:outline-none focus:border-walters-navy"
                      />
                    )}
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">Postal / ZIP Code</label>
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
            </section>

            {/* Payment Section */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-walters-navy">Payment method</h2>
              <div className="space-y-4 bg-white p-5 border border-walters-border rounded-2xl">
                <div>
                  <label className="block text-[11px] font-semibold text-walters-slate mb-1">
                    Card number (16 Digits)
                  </label>
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
                    <label className="block text-[11px] font-semibold text-walters-slate mb-1">
                      CVC (3 or 4 Digits)
                    </label>
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

          {/* Sidebar Summary */}
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