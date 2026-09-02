// src/pages/ProductDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Loader2, 
  Check, 
  Ruler, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/index';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [colorVariants, setColorVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<'standard' | 'frames_only' | 'prescription'>('standard');
  
  // Image Carousel States
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Modal & Tab States
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [sizeModalTab, setSizeModalTab] = useState<'chart' | 'guide'>('chart');

  useEffect(() => {
    const fetchProductAndVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
        const response = await axios.get<Product>(`${API_URL}/products/${id}`);
        const currentProduct = response.data;
        setProduct(currentProduct);

        // Reset carousel index to primary card image
        setActiveImageIndex(0);

        // Fetch sibling color variants matching the same model
        const allProductsRes = await axios.get<Product[]>(`${API_URL}/products`);
        const siblings = allProductsRes.data.filter((p) => {
          if (currentProduct.model_code && p.model_code) {
            return p.model_code === currentProduct.model_code;
          }
          return p.name.toLowerCase() === currentProduct.name.toLowerCase() && 
                 p.brand.toLowerCase() === currentProduct.brand.toLowerCase();
        });

        setColorVariants(siblings);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Unable to load frame details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndVariants();
    }
  }, [id]);

  // Construct deduplicated image list starting with primary card image
  const productImages: string[] = useMemo(() => {
    if (!product) return [];
    
    const primaryImg = product.image_url || '';
    const rawGallery = Array.isArray(product.gallery) ? product.gallery : [];
    
    const galleryFiltered = rawGallery.filter(
      (img): img is string => typeof img === 'string' && img.trim().length > 0 && img !== primaryImg
    );

    return primaryImg ? [primaryImg, ...galleryFiltered] : galleryFiltered;
  }, [product]);

  // Auto-scroll images every 10 seconds
  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [productImages.length]);

  const handlePrevImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

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

  // Optical measurements formatting with dynamic defaults
  const lensWidth = product.lens_width ?? 54.0;
  const bridgeWidth = product.bridge_width ?? 17.0;
  const templeLength = product.temple_length ?? 140.0;
  const lensHeight = product.lens_height ?? 38.0;

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
          
          {/* LEFT: Product Images Gallery, Description & Details */}
          <div className="lg:col-span-7 space-y-8 sticky top-24">
            
            {/* Main Image Viewer with Overlaid Navigation Controls */}
            <div className="relative w-full aspect-4/3 bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal/10 group">
              <img
                src={productImages[activeImageIndex] || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-all duration-500 ease-in-out"
              />

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-walters-navy shadow-md border border-charcoal/10 backdrop-blur-xs transition-all cursor-pointer opacity-90 hover:scale-105"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-walters-navy shadow-md border border-charcoal/10 backdrop-blur-xs transition-all cursor-pointer opacity-90 hover:scale-105"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Image Thumbnails with Active Bounding Box */}
            {productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 px-1">
                {productImages.map((img: string, idx: number) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white transition-all cursor-pointer border ${
                        isActive 
                          ? 'border-walters-navy ring-2 ring-walters-navy shadow-md scale-105 opacity-100' 
                          : 'border-charcoal/15 opacity-60 hover:opacity-100 hover:border-charcoal/40'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* PRODUCT DESCRIPTION SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 space-y-3">
              <h3 className="font-serif text-lg text-walters-navy border-b border-charcoal/10 pb-2">
                Product Description
              </h3>
              <p className="text-xs leading-relaxed text-walters-charcoal/80 font-light">
                {product.description || 
                  `Buy Now ${product.gender || "Women's"} Glasses Online ${product.brand} ${product.name} - ${product.color_code || '8228'} ${product.color_description} ${product.shape}, at a reduced price at the best price. Made in Italy New ${product.brand} Collection. Visit our store.`}
              </p>
            </div>

            {/* PRODUCT DETAILS SPECIFICATIONS GRID */}
            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-lg text-walters-navy">
                  Product Details
                </h3>
                <span className="text-[11px] font-light text-walters-navy/60 uppercase tracking-widest">
                  Ref: {product.model_code || product.name.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Kind</span>
                  <span className="font-medium text-walters-navy">Glasses</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Color Code</span>
                  <span className="font-medium text-walters-navy">{product.color_code || '8228'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Frame Material</span>
                  <span className="font-medium text-walters-navy">{product.frame_material || 'Plastic'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Glass Material</span>
                  <span className="font-medium text-walters-navy">{product.lens_material || 'Demo Lens'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Frame Color</span>
                  <span className="font-medium text-walters-navy">{product.color_description}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Lens Color</span>
                  <span className="font-medium text-walters-navy">{product.lens_color || 'Transparent'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Bridge</span>
                  <span className="font-medium text-walters-navy">{bridgeWidth}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Branch Length</span>
                  <span className="font-medium text-walters-navy">{templeLength}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Lens Length</span>
                  <span className="font-medium text-walters-navy">{lensWidth}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Glass Height</span>
                  <span className="font-medium text-walters-navy">{lensHeight}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Eyeglass Shape</span>
                  <span className="font-medium text-walters-navy capitalize">{product.shape}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Glass Base</span>
                  <span className="font-medium text-walters-navy">{product.glass_base || 'Base 4'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Polarized</span>
                  <span className="font-medium text-walters-navy">{product.polarized ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Photochromic</span>
                  <span className="font-medium text-walters-navy">{product.photochromic ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Gradables</span>
                  <span className="font-medium text-walters-navy">{product.gradables ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-walters-charcoal/50 block text-[11px] font-light">Gender</span>
                  <span className="font-medium text-walters-navy capitalize">{product.gender || 'Women'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-charcoal/10 pb-6 space-y-2">
              <span className="text-xs font-light tracking-widest text-walters-navy/60 uppercase">
                {product.brand}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-walters-navy tracking-tight">
                {product.name}
              </h1>
              <p className="text-xl font-light text-walters-charcoal pt-2">
                {formatPrice(product.price_full_gbp)}
              </p>
            </div>

            {/* SIZES & SIZE CHART BUTTON */}
            <div className="bg-white p-4 rounded-xl border border-charcoal/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-light text-walters-charcoal/60 uppercase tracking-wider block">
                  Frame Measurements
                </span>
                <span className="text-sm font-medium text-walters-navy">
                  {lensWidth} □ {bridgeWidth} - {templeLength}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center space-x-1.5 text-xs text-walters-navy underline underline-offset-4 hover:opacity-70 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-walters-navy" />
                <span>Size Chart & Guide</span>
              </button>
            </div>

            {/* COLOR VARIANTS SELECTOR */}
            {colorVariants.length > 1 && (
              <div className="space-y-3 pt-1 border-b border-charcoal/10 pb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-light uppercase tracking-wider text-walters-charcoal/70">
                    Frame Color: <span className="font-semibold text-walters-navy">{product.color_description}</span>
                  </label>
                  <span className="text-[11px] text-walters-charcoal/50">{colorVariants.length} Colorways</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {colorVariants.map((variant) => {
                    const isSelected = String(variant.id) === String(product.id);
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => navigate(`/product/${variant.id}`)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-walters-navy bg-white shadow-sm text-walters-navy font-semibold'
                            : 'border-charcoal/10 bg-transparent text-walters-charcoal/70 hover:border-charcoal/30'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border border-charcoal/20 overflow-hidden shrink-0 bg-walters-cream">
                          {variant.image_url && (
                            <img src={variant.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span>{variant.color_description}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-walters-navy shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                  <span className="text-xs font-light">{formatPrice(product.price_frame_only_gbp)}</span>
                </button>
              </div>
            </div>

            {/* Add to Bag Action */}
            <button
              type="button"
              onClick={handleBagSubmit}
              className="w-full flex items-center justify-center space-x-3 bg-walters-navy text-white text-sm font-light tracking-wide py-4 rounded-full hover:bg-walters-navy/90 transition-colors shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>Add to Bag — {formatPrice(selectedOption === 'frames_only' ? product.price_frame_only_gbp : product.price_full_gbp)}</span>
            </button>

            {/* Specifications & Perks */}
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

      {/* TWO-TAB SIZE CHART & GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative border border-charcoal/10 max-h-[90vh] overflow-y-auto">
            
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex space-x-6 text-xs font-semibold tracking-wider">
                <button
                  type="button"
                  onClick={() => setSizeModalTab('chart')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer uppercase ${
                    sizeModalTab === 'chart'
                      ? 'border-amber-500 text-walters-navy font-bold'
                      : 'border-transparent text-walters-charcoal/50 hover:text-walters-navy'
                  }`}
                >
                  SIZE CHART
                </button>
                <button
                  type="button"
                  onClick={() => setSizeModalTab('guide')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer uppercase ${
                    sizeModalTab === 'guide'
                      ? 'border-amber-500 text-walters-navy font-bold'
                      : 'border-transparent text-walters-charcoal/50 hover:text-walters-navy'
                  }`}
                >
                  FIT & SIZE GUIDE
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => setShowSizeGuide(false)}
                className="p-1 rounded-full hover:bg-charcoal/5 cursor-pointer -mt-2"
              >
                <X className="w-5 h-5 text-walters-charcoal" />
              </button>
            </div>

            {/* TAB 1: SIZE CHART */}
            {sizeModalTab === 'chart' && (
              <div className="space-y-6 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-walters-navy text-sm">If you already wear glasses</h4>
                  <p className="text-walters-charcoal/70 text-[11px]">
                    Check the measurements inside your current frame for the best match. Stamped on this frame: <strong className="text-walters-navy">{lensWidth} □ {bridgeWidth} - {templeLength}</strong>
                  </p>
                </div>

                {/* Reference Table */}
                <div className="overflow-hidden rounded-lg border border-amber-500">
                  <table className="w-full text-center text-[11px]">
                    <thead className="bg-amber-500 text-white font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-2 text-left pl-4">Size</th>
                        <th className="py-2.5 px-2">Lens Width</th>
                        <th className="py-2.5 px-2">Bridge Width</th>
                        <th className="py-2.5 px-2">Temple Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200 text-walters-navy">
                      <tr className={lensWidth < 42 ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-2 px-2 text-left pl-4 font-semibold text-amber-600">Extra-Small</td>
                        <td className="py-2 px-2">Below 42 mm</td>
                        <td className="py-2 px-2">Below 16 mm</td>
                        <td className="py-2 px-2">Below 130 mm</td>
                      </tr>
                      <tr className={lensWidth >= 42 && lensWidth <= 49 ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-2 px-2 text-left pl-4 font-semibold text-amber-600">Small</td>
                        <td className="py-2 px-2">42-49 mm</td>
                        <td className="py-2 px-2">16-18 mm</td>
                        <td className="py-2 px-2">130-135 mm</td>
                      </tr>
                      <tr className={lensWidth >= 50 && lensWidth <= 54 ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-2 px-2 text-left pl-4 font-semibold text-amber-600">Medium</td>
                        <td className="py-2 px-2">50-54 mm</td>
                        <td className="py-2 px-2">19-20 mm</td>
                        <td className="py-2 px-2">136-145 mm</td>
                      </tr>
                      <tr className={lensWidth >= 55 && lensWidth <= 58 ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-2 px-2 text-left pl-4 font-semibold text-amber-600">Large</td>
                        <td className="py-2 px-2">55-58 mm</td>
                        <td className="py-2 px-2">21-23 mm</td>
                        <td className="py-2 px-2">146-150 mm</td>
                      </tr>
                      <tr className={lensWidth > 58 ? 'bg-amber-50 font-bold' : ''}>
                        <td className="py-2 px-2 text-left pl-4 font-semibold text-amber-600">Extra-Large</td>
                        <td className="py-2 px-2">Above 58 mm</td>
                        <td className="py-2 px-2">Above 23 mm</td>
                        <td className="py-2 px-2">Above 150 mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Custom Uploaded Size Chart Image if provided by Admin */}
                {product.size_chart_url && (
                  <div className="pt-2 border-t border-charcoal/10">
                    <span className="block text-[11px] font-semibold text-walters-navy mb-2">Frame Specific Diagram:</span>
                    <img src={product.size_chart_url} alt="Custom Size Chart" className="w-full rounded-xl object-contain border border-charcoal/10 max-h-48 bg-offwhite" />
                  </div>
                )}

                <p className="text-[10px] text-walters-charcoal/60 italic text-center">
                  * This is a general size guide reference. Depending on frame style or brand, minor variances may occur.
                </p>
              </div>
            )}

            {/* TAB 2: FIT & SIZE GUIDE */}
            {sizeModalTab === 'guide' && (
              <div className="space-y-5 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-walters-navy text-sm">If you don't wear glasses</h4>
                  <p className="text-walters-charcoal/70 text-[11px]">
                    You only need a ruler and a mirror. All measurements are in millimeters (mm).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-walters-cream/40 p-3 rounded-xl space-y-1">
                    <span className="font-semibold text-walters-navy block">Frame width</span>
                    <p className="text-walters-charcoal/70 text-[11px]">
                      Measure across your face from one side of your forehead to the other, just above your eyebrows.
                    </p>
                  </div>

                  <div className="bg-walters-cream/40 p-3 rounded-xl space-y-1">
                    <span className="font-semibold text-walters-navy block">Bridge Width</span>
                    <p className="text-walters-charcoal/70 text-[11px]">
                      Measure the width of your nose at the narrowest point between your eyes.
                    </p>
                  </div>

                  <div className="bg-walters-cream/40 p-3 rounded-xl space-y-1">
                    <span className="font-semibold text-walters-navy block">Temple Length</span>
                    <p className="text-walters-charcoal/70 text-[11px]">
                      Measure from the side of your face to just behind your ear, following the natural curve of your head.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl space-y-1 text-[11px]">
                  <span className="font-semibold block">Need extra advice?</span>
                  <p>Our opticians are available for virtual consultations and size fittings.</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-3 bg-walters-navy text-white text-xs font-light rounded-full hover:bg-walters-navy/90 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};