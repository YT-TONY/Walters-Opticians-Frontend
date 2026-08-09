// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/index';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useCurrency();
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<'standard' | 'frames_only' | 'prescription'>('standard');
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
        const response = await axios.get<Product>(`${API_URL}/products/${id}`);
        
        const data = response.data;
        setProduct(data);

        // Safely determine initial active image string
        const fallbackImg = data.image_url || '';
        const firstGalleryImg = Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : undefined;
        
        setActiveImage(firstGalleryImg ?? fallbackImg);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Unable to load frame details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBagSubmit = () => {
    if (!product) return;

    if (selectedOption === 'prescription') {
      handleSelectPrescription(product);
    } else if (selectedOption === 'frames_only') {
      handleAddFrameOnly(product);
    } else {
      handleAddStandard(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walters-cream/30 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-walters-navy" />
        <p className="text-xs font-light tracking-widest text-walters-navy uppercase">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-walters-cream/30 py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="font-serif text-2xl text-walters-navy">Frame Not Found</h2>
          <p className="text-sm font-light text-walters-charcoal/70">
            {error || "The frame you're looking for doesn't seem to exist or is currently unavailable."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-light text-walters-navy underline underline-offset-4 hover:opacity-70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Collection</span>
          </Link>
        </div>
      </div>
    );
  }

  // Explicitly build a guaranteed string[] with no undefined values
  const productImages: string[] = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter((img): img is string => typeof img === 'string' && img.length > 0)
      : [product.image_url]
  ).filter((img): img is string => typeof img === 'string' && img.length > 0);

  return (
    <div className="min-h-screen bg-walters-cream/30 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-xs font-light text-walters-charcoal/60 hover:text-walters-navy mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Product Images Gallery */}
          <div className="lg:col-span-7 space-y-4 sticky top-24">
            <div className="w-full aspect-4/3 bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal/5">
              <img
                src={activeImage || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border transition-all ${
                      activeImage === img ? 'border-walters-navy ring-1 ring-walters-navy' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border-b border-charcoal/10 pb-6 space-y-2">
              <span className="text-xs font-light tracking-widest text-walters-navy/60 uppercase">
                {product.category || 'Handcrafted Frames'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-walters-navy tracking-tight">
                {product.name}
              </h1>
              <p className="text-xl font-light text-walters-charcoal pt-2">
                {formatPrice(product.price_full_gbp)}
              </p>
            </div>

            {product.description && (
              <p className="text-sm font-light leading-relaxed text-walters-charcoal/80">
                {product.description}
              </p>
            )}

            {/* Option Selectors */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-light uppercase tracking-wider text-walters-charcoal/70 block">
                Purchase Option
              </label>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOption('standard')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'standard'
                      ? 'border-walters-navy bg-white shadow-sm'
                      : 'border-charcoal/10 bg-transparent hover:border-charcoal/30'
                  }`}
                >
                  <div>
                    <div className="text-sm font-light text-walters-navy">Frame + Non-Prescription Lenses</div>
                    <div className="text-xs font-light text-walters-charcoal/50">Ready to wear immediately</div>
                  </div>
                  <span className="text-xs font-light">{formatPrice(product.price_full_gbp)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('prescription')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'prescription'
                      ? 'border-walters-navy bg-white shadow-sm'
                      : 'border-charcoal/10 bg-transparent hover:border-charcoal/30'
                  }`}
                >
                  <div>
                    <div className="text-sm font-normal text-walters-navy">+ Add Prescription Lenses</div>
                    <div className="text-xs font-light text-walters-charcoal/50">Tailored single vision or progressive</div>
                  </div>
                  <span className="text-xs font-light">Included</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('frames_only')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'frames_only'
                      ? 'border-walters-navy bg-white shadow-sm'
                      : 'border-charcoal/10 bg-transparent hover:border-charcoal/30'
                  }`}
                >
                  <div>
                    <div className="text-sm font-light text-walters-navy">Frames Only</div>
                    <div className="text-xs font-light text-walters-charcoal/50">Demo lenses fitted</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Add to Bag Action */}
            <button
              type="button"
              onClick={handleBagSubmit}
              className="w-full flex items-center justify-center space-x-3 bg-walters-navy text-white text-sm font-light tracking-wide py-4 rounded-full hover:bg-walters-navy/90 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>Add to Bag — {formatPrice(product.price_full_gbp)}</span>
            </button>

            {/* Product Specifications & Perks */}
            <div className="border-t border-charcoal/10 pt-6 space-y-4 text-xs font-light text-walters-charcoal/80">
              <div className="flex items-center space-x-3">
                <Truck className="w-4 h-4 text-walters-navy/70 stroke-[1.5]" />
                <span>Complimentary tracked express shipping on all orders</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-walters-navy/70 stroke-[1.5]" />
                <span>2-year optician warranty & hardshell leather case included</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 text-walters-navy/70 stroke-[1.5]" />
                <span>30-day hassle-free returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};