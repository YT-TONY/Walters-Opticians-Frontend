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
import type { Product, ContactLensPrescriptionData } from '../types/index';
import { ProductSuggestionsBar } from '../components/ProductSuggestionsBar';
import { Breadcrumb, type BreadcrumbItem } from '../components/Breadcrumb';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription, handleAddContactLenses } = useCart();

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

  // Contact Lens Inline Form State
  const [samePrescription, setSamePrescription] = useState<boolean>(true);
  const [enableOD, setEnableOD] = useState<boolean>(true);
  const [rawEnableOS, setEnableOS] = useState<boolean>(true);

  const [odPower, setOdPower] = useState<string>('-1.00');
  const [rawOsPower, setOsPower] = useState<string>('-1.00');
  const [odColor, setOdColor] = useState<string>('');
  const [rawOsColor, setOsColor] = useState<string>('');
  const [odBC] = useState<string>('8.7');
  const [odBoxes, setOdBoxes] = useState<number>(1);
  const [rawOsBoxes, setOsBoxes] = useState<number>(1);

  // Derive OS values directly on render to avoid cascading effect renders
  const osPower = samePrescription ? odPower : rawOsPower;
  const osColor = samePrescription ? odColor : rawOsColor;
  const osBC = odBC;
  const osBoxes = samePrescription ? odBoxes : rawOsBoxes;
  const enableOS = samePrescription ? enableOD : rawEnableOS;

  // Scroll to top immediately on route/id change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

        // Set default color if colors exist
        if (currentProduct.colors && currentProduct.colors.length > 0) {
          setOdColor(currentProduct.colors[0]);
          setOsColor(currentProduct.colors[0]);
        }

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
        setError('Unable to load product details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndVariants();
    }
  }, [id]);

  const isContactLens = useMemo(() => {
    if (!product) return false;
    const cat = (product.category || '').toLowerCase();
    return cat.includes('contact') || cat.includes('lens') || product.is_contact_lens === true;
  }, [product]);

  // Construct Breadcrumb items for your dedicated component
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!product) return [];

    let categoryLabel = 'Optical Frames';
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('sunglasses')) categoryLabel = 'Sunglasses';
    else if (cat.includes('contact')) categoryLabel = 'Contact Lenses';
    else if (cat.includes('care')) categoryLabel = 'Lens Care';

    return [
      {
        label: categoryLabel,
        path: `/catalog?category=${encodeURIComponent(product.category || '')}`,
      },
      {
        label: product.brand,
        path: `/catalog?brand=${encodeURIComponent(product.brand)}`,
      },
      {
        label: product.name,
      },
    ];
  }, [product]);

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

  const diopterOptions = useMemo(() => {
    const opts: string[] = [];
    for (let i = -10.00; i <= 6.00; i += 0.25) {
      const val = Math.round(i * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const totalContactBoxes = useMemo(() => {
    let count = 0;
    if (enableOD) count += odBoxes;
    if (enableOS) count += osBoxes;
    return count;
  }, [enableOD, enableOS, odBoxes, osBoxes]);

  // Calculate tier bulk price per box dynamically
  const pricePerBox = useMemo(() => {
    if (!product) return 0;
    const basePrice = product.price_full_gbp;
    if (totalContactBoxes >= 6) return basePrice * 0.90; // 10% off
    if (totalContactBoxes >= 4) return basePrice * 0.95; // 5% off
    return basePrice;
  }, [product, totalContactBoxes]);

  const handleBagSubmit = () => {
    if (!product) return;

    if (isContactLens) {
      const contactLensPrescription: ContactLensPrescriptionData = {
        rightEye: enableOD ? {
          power: odPower,
          bc: odBC,
          dia: product.dia || '14.2',
          color: odColor || undefined,
          boxes_quantity: odBoxes,
        } : undefined,
        leftEye: enableOS ? {
          power: osPower,
          bc: osBC,
          dia: product.dia || '14.2',
          color: osColor || undefined,
          boxes_quantity: osBoxes,
        } : undefined,
      };

      handleAddContactLenses(product, contactLensPrescription);
    } else {
      if (selectedOption === 'prescription') {
        handleSelectPrescription(product);
      } else if (selectedOption === 'frames_only') {
        handleAddFrameOnly(product, false);
      } else {
        handleAddStandard(product, false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walters-cream/30 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-walters-navy" />
        <p className="text-xs font-light tracking-widest text-walters-navy uppercase">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-walters-cream/30 py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="font-serif text-2xl text-walters-navy">Product Not Found</h2>
          <p className="text-sm font-light text-walters-charcoal/70">
            {error || "The requested item is currently unavailable."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-light text-walters-navy underline underline-offset-4 hover:opacity-70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Glasses optical measurements fallback
  const lensWidth = product.lens_width ?? 54.0;
  const bridgeWidth = product.bridge_width ?? 17.0;
  const templeLength = product.temple_length ?? 140.0;

  const hasColorOptions = product.colors && product.colors.length > 0;

  return (
    <div className="min-h-screen bg-walters-cream/30 pb-10 font-sans text-walters-charcoal antialiased">
      
      {/* CONSTRAINED MAIN PDP CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-6 mb-16">
        
        {/* BREADCRUMB COMPONENT ALIGNED TO MAIN PDP CONTAINER */}
        <div className="mb-6 [&_nav]:bg-transparent [&_nav]:border-none [&_nav]:py-0 [&_nav]:px-0 [&_nav_div]:max-w-none">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Gallery, Description & Specifications */}
          <div className="lg:col-span-7 space-y-8 sticky top-24">
            
            {/* Main Image Viewer */}
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full aspect-4/3 bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 group cursor-pointer"
            >
              <img
                src={productImages[activeImageIndex] || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-all duration-500 ease-in-out"
              />

              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-walters-navy/90 text-white rounded-lg text-[11px] font-light flex items-center space-x-1.5 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Click to expand image</span>
              </div>

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
            
            {/* Thumbnails */}
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

            {/* DESCRIPTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <h3 className="font-serif text-lg text-walters-navy border-b border-slate-100 pb-2">
                Product Description
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-light">
                {product.description || 
                  (isContactLens 
                    ? `Premium optical contact lenses from ${product.brand}. Designed for all-day moisture retention, high oxygen transmissibility, and crisp vision.` 
                    : `Buy ${product.brand} ${product.name} frames online at Walters Opticians. Expertly hand-finished for superior optical fit and comfort.`)}
              </p>
            </div>

            {/* SPECIFICATIONS GRID */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif text-lg text-walters-navy">
                  Product Specifications
                </h3>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                  Ref: {product.model_code || product.name.toUpperCase()}
                </span>
              </div>

              {isContactLens ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Usage / Replacement</span>
                    <span className="font-medium text-walters-navy">{product.usage_type || 'Daily Disposable'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Pack Size</span>
                    <span className="font-medium text-walters-navy">{product.pack_size || '30 Lenses per box'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Lens Design</span>
                    <span className="font-medium text-walters-navy">{product.lens_design || 'Spherical (Near/Farsighted)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Base Curve (BC)</span>
                    <span className="font-medium text-walters-navy">{product.bc || '8.5 / 8.7 mm'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Diameter (DIA)</span>
                    <span className="font-medium text-walters-navy">{product.dia || '14.2 mm'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Water Content</span>
                    <span className="font-medium text-walters-navy">{product.water_content || '58% H2O'}</span>
                  </div>
                </div>
              ) : (
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
                    <span className="font-medium text-walters-navy">{product.frame_material || 'Acetate'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Bridge Width</span>
                    <span className="font-medium text-walters-navy">{bridgeWidth} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Temple Length</span>
                    <span className="font-medium text-walters-navy">{templeLength} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-light">Lens Width</span>
                    <span className="font-medium text-walters-navy">{lensWidth} mm</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Contact Lenses Configuration OR Glasses Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="border-b border-slate-200 pb-6 space-y-2">
              <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase block">
                {product.brand}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-walters-navy tracking-tight">
                {product.name}
              </h1>
              
              {isContactLens && (
                <p className="text-xs text-slate-500 font-light pt-1">
                  {product.pack_size || '30 Lenses per box'} | {product.usage_type || 'Daily Disposable'} | {product.lens_design || 'Spherical'}
                </p>
              )}

              <div className="flex items-baseline space-x-3 pt-2">
                <p className="text-2xl font-light text-walters-navy">
                  {formatPrice(isContactLens ? pricePerBox : (selectedOption === 'frames_only' ? product.price_frame_only_gbp : product.price_full_gbp))}
                  {isContactLens && <span className="text-xs text-slate-500 font-normal"> / box</span>}
                </p>
                {isContactLens && totalContactBoxes >= 4 && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                    Volume Discount Applied
                  </span>
                )}
              </div>
            </div>

            {/* IF CONTACT LENSES: INLINE PDP CONFIGURATION CARD */}
            {isContactLens ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
                
                {/* Same Prescription Checkbox */}
                <label className="flex items-center space-x-2.5 text-xs text-walters-navy font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={samePrescription}
                    onChange={(e) => setSamePrescription(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-walters-navy focus:ring-walters-navy cursor-pointer"
                  />
                  <span>Same prescription for both eyes</span>
                </label>

                {/* OD / OS CONFIGURATION TABLE */}
                <div className="space-y-4">
                  
                  {/* RIGHT EYE (OD) */}
                  <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                    enableOD ? 'border-slate-200 bg-slate-50/50' : 'border-slate-100 bg-slate-50/20 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-walters-navy cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableOD}
                          onChange={(e) => setEnableOD(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-walters-navy focus:ring-walters-navy cursor-pointer"
                        />
                        <span>RIGHT (OD)</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">BC: {odBC} | DIA: {product.dia || '14.2'}</span>
                    </div>

                    {enableOD && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        
                        {/* Conditional Color Dropdown */}
                        {hasColorOptions && (
                          <div className="sm:col-span-5 space-y-1">
                            <label className="text-[11px] text-slate-400">Color</label>
                            <select
                              value={odColor}
                              onChange={(e) => setOdColor(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-walters-navy focus:outline-none focus:border-walters-navy"
                            >
                              {product.colors?.map((c: string) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Power Select */}
                        <div className={`${hasColorOptions ? 'sm:col-span-4' : 'sm:col-span-8'} space-y-1`}>
                          <label className="text-[11px] text-slate-400">Power (SPH)</label>
                          <select
                            value={odPower}
                            onChange={(e) => setOdPower(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-walters-navy focus:outline-none focus:border-walters-navy"
                          >
                            {diopterOptions.map((p) => (
                              <option key={`od-${p}`} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        {/* Boxes Select */}
                        <div className={`${hasColorOptions ? 'sm:col-span-3' : 'sm:col-span-4'} space-y-1`}>
                          <label className="text-[11px] text-slate-400">Boxes</label>
                          <select
                            value={odBoxes}
                            onChange={(e) => setOdBoxes(Number(e.target.value))}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-walters-navy focus:outline-none focus:border-walters-navy"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((b) => (
                              <option key={b} value={b}>{b} {b === 1 ? 'box' : 'boxes'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LEFT EYE (OS) */}
                  <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                    enableOS ? 'border-slate-200 bg-slate-50/50' : 'border-slate-100 bg-slate-50/20 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-walters-navy cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableOS}
                          disabled={samePrescription}
                          onChange={(e) => setEnableOS(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-walters-navy focus:ring-walters-navy cursor-pointer disabled:opacity-50"
                        />
                        <span>LEFT (OS)</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">BC: {osBC} | DIA: {product.dia || '14.2'}</span>
                    </div>

                    {enableOS && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        
                        {/* Conditional Color Dropdown */}
                        {hasColorOptions && (
                          <div className="sm:col-span-5 space-y-1">
                            <label className="text-[11px] text-slate-400">Color</label>
                            <select
                              value={osColor}
                              disabled={samePrescription}
                              onChange={(e) => setOsColor(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-walters-navy focus:outline-none focus:border-walters-navy disabled:bg-slate-100"
                            >
                              {product.colors?.map((c: string) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Power Select */}
                        <div className={`${hasColorOptions ? 'sm:col-span-4' : 'sm:col-span-8'} space-y-1`}>
                          <label className="text-[11px] text-slate-400">Power (SPH)</label>
                          <select
                            value={osPower}
                            disabled={samePrescription}
                            onChange={(e) => setOsPower(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-walters-navy focus:outline-none focus:border-walters-navy disabled:bg-slate-100"
                          >
                            {diopterOptions.map((p) => (
                              <option key={`os-${p}`} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        {/* Boxes Select */}
                        <div className={`${hasColorOptions ? 'sm:col-span-3' : 'sm:col-span-4'} space-y-1`}>
                          <label className="text-[11px] text-slate-400">Boxes</label>
                          <select
                            value={osBoxes}
                            disabled={samePrescription}
                            onChange={(e) => setOsBoxes(Number(e.target.value))}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-walters-navy focus:outline-none focus:border-walters-navy disabled:bg-slate-100"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((b) => (
                              <option key={b} value={b}>{b} {b === 1 ? 'box' : 'boxes'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* BUY MORE, SAVE MORE DYNAMIC CARDS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Buy More, Save More
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setOdBoxes(2); setOsBoxes(2); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        totalContactBoxes >= 4 && totalContactBoxes < 6 
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-walters-navy">
                        {formatPrice(product.price_full_gbp * 0.95)} <span className="text-[10px] text-slate-500 font-normal">/box</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Buy 4 Boxes (Save 5%)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOdBoxes(3); setOsBoxes(3); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        totalContactBoxes >= 6 
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-walters-navy">
                        {formatPrice(product.price_full_gbp * 0.90)} <span className="text-[10px] text-slate-500 font-normal">/box</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Buy 6 Boxes (Save 10%)</div>
                    </button>
                  </div>
                </div>

                {/* ADD TO BAG ACTION */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!enableOD && !enableOS}
                    onClick={handleBagSubmit}
                    className="w-full flex items-center justify-center space-x-3 bg-walters-navy text-white text-xs font-medium uppercase tracking-wider py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag — {formatPrice(pricePerBox * totalContactBoxes)} ({totalContactBoxes} {totalContactBoxes === 1 ? 'Box' : 'Boxes'})</span>
                  </button>
                </div>

              </div>
            ) : (
              /* IF GLASSES: STANDARD PURCHASE SELECTION */
              <div className="space-y-6">
                
                {/* Frame Measurements Button */}
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

                {/* Color Variants Selector */}
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

                {/* Purchase Option Selection */}
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

                <button
                  type="button"
                  onClick={handleBagSubmit}
                  className="w-full flex items-center justify-center space-x-3 bg-walters-navy text-white text-xs font-medium uppercase tracking-wider py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag — {formatPrice(selectedOption === 'frames_only' ? product.price_frame_only_gbp : product.price_full_gbp)}</span>
                </button>
              </div>
            )}

            {/* Guaranteed Perks */}
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

      {/* PRODUCT SUGGESTIONS BAR (Filtered to Category context) */}
      <ProductSuggestionsBar
        contextPage="product"
        currentProduct={product}
      />

      {/* FULL-SCREEN LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-walters-navy/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
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
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productImages[activeImageIndex] || product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain select-none shadow-2xl transition-all duration-300"
            />

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

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

      {/* SIZE CHART & FIT GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-walters-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
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

            {sizeModalTab === 'chart' && (
              <div className="space-y-6 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-walters-navy text-sm">Frame Size Reference</h4>
                  <p className="text-slate-500 text-[11px] font-light">
                    Stamped measurements: <strong className="text-walters-navy font-medium">{lensWidth} □ {bridgeWidth} - {templeLength}</strong>
                  </p>
                </div>

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
                      <tr>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Small</td>
                        <td className="py-2.5 px-2">42-49 mm</td>
                        <td className="py-2.5 px-2">16-18 mm</td>
                        <td className="py-2.5 px-2">130-135 mm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Medium</td>
                        <td className="py-2.5 px-2">50-54 mm</td>
                        <td className="py-2.5 px-2">19-20 mm</td>
                        <td className="py-2.5 px-2">136-145 mm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 text-left pl-4 font-semibold text-walters-navy">Large</td>
                        <td className="py-2.5 px-2">55-58 mm</td>
                        <td className="py-2.5 px-2">21-23 mm</td>
                        <td className="py-2.5 px-2">146-150 mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {sizeModalTab === 'guide' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2.5">
                  <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 border border-slate-100">
                    <span className="font-semibold text-walters-navy block">Frame Width</span>
                    <p className="text-slate-500 text-[11px] font-light">
                      Measure across your face from temple to temple just above your eyebrow line.
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