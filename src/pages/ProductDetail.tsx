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
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/index';
import { ProductSuggestionsBar } from '../components/ProductSuggestionsBar';

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
  
  // Image Carousel & Lightbox States
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  
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

  // Auto-scroll images every 10 seconds (disabled when lightbox is active)
  useEffect(() => {
    if (productImages.length <= 1 || isLightboxOpen) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [productImages.length, isLightboxOpen]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handleBagSubmit = () => {
    if (!product) return;

    if (selectedOption === 'prescription') {
      handleSelectPrescription(product);
    } else if (selectedOption === 'frames_only') {
      // Pass false to mark isPendingConfig = false when added directly from PDP
      handleAddFrameOnly(product, false);
    } else {
      // Pass false to mark isPendingConfig = false when added directly from PDP
      handleAddStandard(product, false);
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
    <div className="min-h-screen bg-walters-cream/30 py-10 font-sans text-walters-charcoal antialiased">
      
      {/* CONSTRAINED PRODUCT DETAILS CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
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
            
            {/* Main Image Viewer with Overlaid Navigation Controls & Zoom Trigger */}
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full aspect-4/3 bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 group cursor-pointer"
            >
              <img
                src={productImages[activeImageIndex] || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-all duration-500 ease-in-out"
              />

              {/* Hover Click-to-Zoom Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-walters-navy/90 text-white rounded-lg text-[11px] font-light flex items-center space-x-1.5 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Click to expand image</span>
              </div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/90 hover:bg-white text-walters-navy shadow-xs border border-slate-200 transition-all cursor-pointer opacity-90 hover:scale-105"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/90 hover:bg-white text-walters-navy shadow-xs border border-slate-200 transition-all cursor-pointer opacity-90 hover:scale-105"
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
                          ? 'border-walters-navy ring-1 ring-walters-navy shadow-xs opacity-100' 
                          : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* PRODUCT DESCRIPTION SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <h3 className="font-serif text-lg text-walters-navy border-b border-slate-100 pb-2">
                Product Description
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-light">
                {product.description || 
                  `Buy Now ${product.gender || "Women's"} Glasses Online ${product.brand} ${product.name} - ${product.color_code || '8228'} ${product.color_description} ${product.shape}, at a reduced price at the best price. Made in Italy New ${product.brand} Collection. Visit our store.`}
              </p>
            </div>

            {/* PRODUCT DETAILS SPECIFICATIONS GRID */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif text-lg text-walters-navy">
                  Product Details
                </h3>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                  Ref: {product.model_code || product.name.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Kind</span>
                  <span className="font-medium text-walters-navy">Glasses</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Color Code</span>
                  <span className="font-medium text-walters-navy">{product.color_code || '8228'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Frame Material</span>
                  <span className="font-medium text-walters-navy">{product.frame_material || 'Plastic'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Glass Material</span>
                  <span className="font-medium text-walters-navy">{product.lens_material || 'Demo Lens'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Frame Color</span>
                  <span className="font-medium text-walters-navy">{product.color_description}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Lens Color</span>
                  <span className="font-medium text-walters-navy">{product.lens_color || 'Transparent'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Bridge</span>
                  <span className="font-medium text-walters-navy">{bridgeWidth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Branch Length</span>
                  <span className="font-medium text-walters-navy">{templeLength}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Lens Length</span>
                  <span className="font-medium text-walters-navy">{lensWidth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Glass Height</span>
                  <span className="font-medium text-walters-navy">{lensHeight}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Eyeglass Shape</span>
                  <span className="font-medium text-walters-navy capitalize">{product.shape}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Glass Base</span>
                  <span className="font-medium text-walters-navy">{product.glass_base || 'Base 4'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Polarized</span>
                  <span className="font-medium text-walters-navy">{product.polarized ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Photochromic</span>
                  <span className="font-medium text-walters-navy">{product.photochromic ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Gradables</span>
                  <span className="font-medium text-walters-navy">{product.gradables ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-light">Gender</span>
                  <span className="font-medium text-walters-navy capitalize">{product.gender || 'Women'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-slate-200 pb-6 space-y-2">
              <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                {product.brand}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-walters-navy tracking-tight">
                {product.name}
              </h1>
              <p className="text-xl font-light text-walters-navy pt-2">
                {formatPrice(product.price_full_gbp)}
              </p>
            </div>

            {/* SIZES & SIZE CHART BUTTON */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Frame Measurements
                </span>
                <span className="text-sm font-medium text-walters-navy">
                  {lensWidth} □ {bridgeWidth} - {templeLength}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center space-x-1.5 text-xs font-medium text-walters-navy underline underline-offset-4 hover:opacity-70 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-walters-navy" />
                <span>Size Chart & Guide</span>
              </button>
            </div>

            {/* COLOR VARIANTS SELECTOR */}
            {colorVariants.length > 1 && (
              <div className="space-y-3 pt-1 border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Frame Color: <span className="font-semibold text-walters-navy">{product.color_description}</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{colorVariants.length} Colorways</span>
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
                            ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy'
                            : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
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
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500 block">
                Purchase Option
              </label>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOption('standard')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'standard'
                      ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-walters-navy">Frame + Non-Prescription Lenses</div>
                    <div className="text-xs font-light text-slate-500">Ready to wear immediately</div>
                  </div>
                  <span className="text-xs font-medium text-walters-navy">{formatPrice(product.price_full_gbp)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('prescription')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'prescription'
                      ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-walters-navy">+ Add Prescription Lenses</div>
                    <div className="text-xs font-light text-slate-500">Tailored single vision or progressive</div>
                  </div>
                  <span className="text-xs font-medium text-walters-navy">Included</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('frames_only')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedOption === 'frames_only'
                      ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-walters-navy">Frames Only</div>
                    <div className="text-xs font-light text-slate-500">Demo lenses fitted</div>
                  </div>
                  <span className="text-xs font-medium text-walters-navy">{formatPrice(product.price_frame_only_gbp)}</span>
                </button>
              </div>
            </div>

            {/* Add to Bag Action */}
            <button
              type="button"
              onClick={handleBagSubmit}
              className="w-full flex items-center justify-center space-x-3 bg-walters-navy text-white text-xs font-medium uppercase tracking-wider py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag — {formatPrice(selectedOption === 'frames_only' ? product.price_frame_only_gbp : product.price_full_gbp)}</span>
            </button>

            {/* Specifications & Perks */}
            <div className="border-t border-slate-200 pt-6 space-y-4 text-xs font-light text-slate-600">
              <div className="flex items-center space-x-3">
                <Truck className="w-4 h-4 text-walters-navy/80" />
                <span>Complimentary tracked express shipping on all orders</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-walters-navy/80" />
                <span>2-year optician warranty & hardshell leather case included</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 text-walters-navy/80" />
                <span>30-day hassle-free returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ProductSuggestionsBar
        contextPage="product"
        currentProduct={product}
      />

      {/* FULL-SCREEN IMAGE INSPECTION LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-walters-navy/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between w-full text-white/80 z-10 shrink-0">
            <div className="text-xs font-light">
              <span className="font-medium text-white">{product.brand}</span> — {product.name}
              <span className="ml-3 text-white/50">({activeImageIndex + 1} / {productImages.length})</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image View */}
          <div 
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productImages[activeImageIndex] || product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain select-none shadow-2xl transition-all duration-300"
            />

            {/* Navigation Arrows inside Lightbox */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          {productImages.length > 1 && (
            <div 
              className="flex justify-center space-x-3 overflow-x-auto py-2 z-10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {productImages.map((img: string, idx: number) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 border transition-all cursor-pointer ${
                      isActive
                        ? 'border-white ring-2 ring-white scale-105 opacity-100 bg-white'
                        : 'border-white/20 opacity-40 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TWO-TAB SIZE CHART & GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-walters-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex space-x-6 text-xs font-medium tracking-wider">
                <button
                  type="button"
                  onClick={() => setSizeModalTab('chart')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer uppercase ${
                    sizeModalTab === 'chart'
                      ? 'border-walters-navy text-walters-navy font-semibold'
                      : 'border-transparent text-slate-400 hover:text-walters-navy'
                  }`}
                >
                  Size Chart
                </button>
                <button
                  type="button"
                  onClick={() => setSizeModalTab('guide')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer uppercase ${
                    sizeModalTab === 'guide'
                      ? 'border-walters-navy text-walters-navy font-semibold'
                      : 'border-transparent text-slate-400 hover:text-walters-navy'
                  }`}
                >
                  Fit & Size Guide
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => setShowSizeGuide(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-walters-navy cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB 1: SIZE CHART */}
            {sizeModalTab === 'chart' && (
              <div className="space-y-6 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-walters-navy text-sm">If you already wear glasses</h4>
                  <p className="text-slate-500 text-[11px] font-light">
                    Check the measurements inside your current frame for the best match. Stamped on this frame: <strong className="text-walters-navy font-medium">{lensWidth} □ {bridgeWidth} - {templeLength}</strong>
                  </p>
                </div>

                {/* Reference Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-center text-[11px]">
                    <thead className="bg-slate-50 text-walters-navy font-semibold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-2 text-left pl-4">Size</th>
                        <th className="py-2.5 px-2">Lens Width</th>
                        <th className="py-2.5 px-2">Bridge Width</th>
                        <th className="py-2.5 px-2">Temple Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-walters-navy font-normal">
                      <tr className={lensWidth < 42 ? 'bg-slate-50 font-semibold' : ''}>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Extra-Small</td>
                        <td className="py-2.5 px-2">Below 42 mm</td>
                        <td className="py-2.5 px-2">Below 16 mm</td>
                        <td className="py-2.5 px-2">Below 130 mm</td>
                      </tr>
                      <tr className={lensWidth >= 42 && lensWidth <= 49 ? 'bg-slate-50 font-semibold' : ''}>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Small</td>
                        <td className="py-2.5 px-2">42-49 mm</td>
                        <td className="py-2.5 px-2">16-18 mm</td>
                        <td className="py-2.5 px-2">130-135 mm</td>
                      </tr>
                      <tr className={lensWidth >= 50 && lensWidth <= 54 ? 'bg-slate-50 font-semibold' : ''}>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Medium</td>
                        <td className="py-2.5 px-2">50-54 mm</td>
                        <td className="py-2.5 px-2">19-20 mm</td>
                        <td className="py-2.5 px-2">136-145 mm</td>
                      </tr>
                      <tr className={lensWidth >= 55 && lensWidth <= 58 ? 'bg-slate-50 font-semibold' : ''}>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Large</td>
                        <td className="py-2.5 px-2">55-58 mm</td>
                        <td className="py-2.5 px-2">21-23 mm</td>
                        <td className="py-2.5 px-2">146-150 mm</td>
                      </tr>
                      <tr className={lensWidth > 58 ? 'bg-slate-50 font-semibold' : ''}>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Extra-Large</td>
                        <td className="py-2.5 px-2">Above 58 mm</td>
                        <td className="py-2.5 px-2">Above 23 mm</td>
                        <td className="py-2.5 px-2">Above 150 mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Custom Uploaded Size Chart Image if provided by Admin */}
                {product.size_chart_url && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-semibold text-walters-navy mb-2">Frame Specific Diagram:</span>
                    <img src={product.size_chart_url} alt="Custom Size Chart" className="w-full rounded-xl object-contain border border-slate-200 max-h-48 bg-slate-50" />
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic text-center">
                  * General size reference guide. Slight manufacturing variances may occur depending on frame construction.
                </p>
              </div>
            )}

            {/* TAB 2: FIT & SIZE GUIDE */}
            {sizeModalTab === 'guide' && (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-walters-navy text-sm">If you don't wear glasses</h4>
                  <p className="text-slate-500 text-[11px] font-light">
                    All measurements are standard optical values in millimeters (mm).
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 border border-slate-100">
                    <span className="font-semibold text-walters-navy block">Frame Width</span>
                    <p className="text-slate-500 text-[11px] font-light">
                      Measure across your face from temple to temple just above your eyebrow line.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 border border-slate-100">
                    <span className="font-semibold text-walters-navy block">Bridge Width</span>
                    <p className="text-slate-500 text-[11px] font-light">
                      Measure the width of your nose bridge at its narrowest point between your eyes.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 border border-slate-100">
                    <span className="font-semibold text-walters-navy block">Temple Length</span>
                    <p className="text-slate-500 text-[11px] font-light">
                      Measure from the side of your face to just behind your ear along the curve of your head.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-3 bg-walters-navy text-white text-xs font-medium uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
};