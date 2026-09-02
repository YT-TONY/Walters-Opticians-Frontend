import React, { useState } from 'react';
import { X, Upload, Trash2, Plus } from 'lucide-react';
import { type AdminProduct, type Gender, type FrameShape, type FrameType } from '../../types/admin';

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: AdminProduct | null;
  onClose: () => void;
  onSave: (productData: Omit<AdminProduct, 'id'>) => void;
}

const getDefaultFormData = (product: AdminProduct | null) => ({
  model_code: product?.model_code ?? '',
  name: product?.name ?? '',
  brand: product?.brand ?? 'Walters Opticians',
  color: product?.color ?? '',
  color_code: product?.color_code ?? '',
  gender: (product?.gender ?? 'unisex') as Gender,
  shape: (product?.shape ?? 'round') as FrameShape,
  frameType: (product?.frameType ?? 'full-rim') as FrameType,
  description: product?.description ?? '',
  frame_material: product?.frame_material ?? 'Plastic',
  lens_material: product?.lens_material ?? 'Demo Lens',
  lens_color: product?.lens_color ?? 'Transparent',
  glass_base: product?.glass_base ?? 'Base 4',
  polarized: product?.polarized ?? false,
  photochromic: product?.photochromic ?? false,
  gradables: product?.gradables ?? false,
  is_bestseller: (product as { is_bestseller?: boolean })?.is_bestseller ?? false,
  lens_width: product?.lens_width ?? 54.0,
  bridge_width: product?.bridge_width ?? 17.0,
  temple_length: product?.temple_length ?? 140.0,
  lens_height: product?.lens_height ?? 38.0,
  sizes: product?.sizes ?? ['Standard'],
  size_chart_url: product?.size_chart_url ?? '',
  price_full_gbp: product?.price_full_gbp ?? 180,
  price_frame_only_gbp: product?.price_frame_only_gbp ?? 140,
  stock: product?.stock ?? 10,
  image_url: product?.image_url ?? '',
  gallery: product?.gallery ?? [],
});

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}) => {
  const [prevEditingProduct, setPrevEditingProduct] = useState<AdminProduct | null>(editingProduct);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);
  const [formData, setFormData] = useState(() => getDefaultFormData(editingProduct));
  const [newSizeInput, setNewSizeInput] = useState('');

  if (isOpen !== prevIsOpen || editingProduct !== prevEditingProduct) {
    setPrevIsOpen(isOpen);
    setPrevEditingProduct(editingProduct);
    setFormData(getDefaultFormData(editingProduct));
  }

  if (!isOpen) return null;

  const handleApplyBrandTemplate = () => {
    const template = `Buy Now ${formData.gender === 'female' ? "Women's" : formData.gender === 'male' ? "Men's" : "Unisex"} Glasses Online ${formData.brand} ${formData.name} - ${formData.color_code || '8228'} ${formData.color} ${formData.shape}, at a reduced price at the best price Made in Italy New ${formData.brand} Collection. Visit our store.`;
    setFormData((p) => ({ ...p, description: template }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((p) => ({ ...p, image_url: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChartImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((p) => ({ ...p, size_chart_url: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddSize = () => {
    if (!newSizeInput.trim()) return;
    setFormData((p) => ({
      ...p,
      sizes: [...(p.sizes || []), newSizeInput.trim()],
    }));
    setNewSizeInput('');
  };

  const handleRemoveSize = (indexToRemove: number) => {
    setFormData((p) => ({
      ...p,
      sizes: (p.sizes || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const promises = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(promises).then((imgs) =>
        setFormData((p) => ({
          ...p,
          gallery: [...p.gallery, ...imgs],
          image_url: p.image_url || imgs[0] || '',
        }))
      );
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((p) => ({
      ...p,
      gallery: p.gallery.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans antialiased">
      <div className="fixed inset-0 bg-navy/50 backdrop-blur-xs" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-cream rounded-2xl shadow-2xl border border-border p-6 space-y-4 my-8">
          
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-bold text-navy">
              {editingProduct ? 'Edit Frame Details & Specifications' : 'Add New Optical Frame'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-offwhite cursor-pointer">
              <X className="w-5 h-5 text-slate" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Core Details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-navy font-semibold mb-1">Model Code (Group Key)</label>
                <input
                  type="text"
                  placeholder="e.g. TF 2150-B"
                  value={formData.model_code}
                  onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Frame Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg capitalize text-charcoal focus:outline-none focus:border-navy cursor-pointer"
                >
                  <option value="unisex">Unisex</option>
                  <option value="female">Women</option>
                  <option value="male">Men</option>
                </select>
              </div>
            </div>

            {/* Colors & Shapes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-navy font-semibold mb-1">Frame Color *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pink Marble"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Color Code</label>
                <input
                  type="text"
                  placeholder="e.g. 8228"
                  value={formData.color_code}
                  onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Eyeglass Shape</label>
                <select
                  value={formData.shape}
                  onChange={(e) => setFormData({ ...formData, shape: e.target.value as FrameShape })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg capitalize text-charcoal focus:outline-none focus:border-navy cursor-pointer"
                >
                  <option value="cat-eye">Cat-Eye</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="aviator">Aviator</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="oval">Oval</option>
                </select>
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Frame Type</label>
                <select
                  value={formData.frameType}
                  onChange={(e) => setFormData({ ...formData, frameType: e.target.value as FrameType })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy cursor-pointer"
                >
                  <option value="full-rim">Full Rim</option>
                  <option value="half-rim">Half Rim</option>
                  <option value="rimless">Rimless</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-navy font-semibold">Product Description</label>
                <button
                  type="button"
                  onClick={handleApplyBrandTemplate}
                  className="text-[11px] text-walters-navy underline hover:opacity-70 cursor-pointer font-medium"
                >
                  Apply Brand Description Template
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Buy Now Women's Glasses Online..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy resize-none"
              />
            </div>

            {/* Optical Dimensions */}
            <div className="bg-white p-3 rounded-xl border border-border space-y-2">
              <span className="block text-navy font-semibold text-[11px] uppercase tracking-wider">
                Optical Dimensions (mm)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate text-[11px] mb-0.5">Lens Length</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lens_width}
                    onChange={(e) => setFormData({ ...formData, lens_width: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-offwhite border border-border rounded-md text-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate text-[11px] mb-0.5">Bridge</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bridge_width}
                    onChange={(e) => setFormData({ ...formData, bridge_width: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-offwhite border border-border rounded-md text-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate text-[11px] mb-0.5">Branch Length</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temple_length}
                    onChange={(e) => setFormData({ ...formData, temple_length: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-offwhite border border-border rounded-md text-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate text-[11px] mb-0.5">Glass Height</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lens_height}
                    onChange={(e) => setFormData({ ...formData, lens_height: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-offwhite border border-border rounded-md text-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags & Bestseller Toggle */}
            <div className="flex flex-wrap items-center gap-6 py-2 bg-offwhite px-3 rounded-lg border border-border">
              <label className="flex items-center space-x-2 cursor-pointer text-navy font-medium">
                <input
                  type="checkbox"
                  checked={formData.polarized}
                  onChange={(e) => setFormData({ ...formData, polarized: e.target.checked })}
                  className="rounded text-navy focus:ring-navy cursor-pointer"
                />
                <span>Polarized</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-navy font-medium">
                <input
                  type="checkbox"
                  checked={formData.photochromic}
                  onChange={(e) => setFormData({ ...formData, photochromic: e.target.checked })}
                  className="rounded text-navy focus:ring-navy cursor-pointer"
                />
                <span>Photochromic</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-navy font-medium">
                <input
                  type="checkbox"
                  checked={formData.gradables}
                  onChange={(e) => setFormData({ ...formData, gradables: e.target.checked })}
                  className="rounded text-navy focus:ring-navy cursor-pointer"
                />
                <span>Gradables</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-blue-900 font-semibold border-l border-border pl-4">
                <input
                  type="checkbox"
                  checked={formData.is_bestseller}
                  onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                  className="rounded text-[#1B75BC] focus:ring-[#1B75BC] cursor-pointer"
                />
                <span>Mark Bestseller Badge</span>
              </label>
            </div>

            {/* Sizes Manager */}
            <div className="bg-white p-3 rounded-xl border border-border space-y-2">
              <label className="block text-navy font-semibold">Available Sizes</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.sizes || []).map((size, idx) => (
                  <span key={idx} className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-offwhite border border-border rounded-md text-xs text-navy">
                    <span>{size}</span>
                    <button type="button" onClick={() => handleRemoveSize(idx)} className="text-rose-600 hover:text-rose-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add size (e.g. 54-17-140)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-offwhite border border-border rounded-lg text-charcoal focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-navy text-white rounded-lg hover:bg-gold hover:text-navy cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Size</span>
                </button>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-offwhite p-3 rounded-xl border border-border">
              <div>
                <label className="block text-navy font-semibold mb-1">Price (Full Lens)</label>
                <input
                  type="number"
                  required
                  value={formData.price_full_gbp}
                  onChange={(e) => setFormData({ ...formData, price_full_gbp: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Price (Frame Only)</label>
                <input
                  type="number"
                  required
                  value={formData.price_frame_only_gbp}
                  onChange={(e) => setFormData({ ...formData, price_frame_only_gbp: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Stock</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy font-semibold mb-1">Main Image</label>
                  <div className="flex items-center space-x-3">
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="w-10 h-10 rounded object-contain bg-offwhite border border-border" />
                    )}
                    <label className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-border rounded-lg cursor-pointer hover:bg-offwhite">
                      <Upload className="w-4 h-4 text-navy" />
                      <span>Upload Main</span>
                      <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-navy font-semibold mb-1">Size Chart Reference Image</label>
                  <div className="flex items-center space-x-3">
                    {formData.size_chart_url && (
                      <img src={formData.size_chart_url} alt="Size Chart" className="w-10 h-10 rounded object-contain bg-offwhite border border-border" />
                    )}
                    <label className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-border rounded-lg cursor-pointer hover:bg-offwhite">
                      <Upload className="w-4 h-4 text-navy" />
                      <span>Upload Size Chart</span>
                      <input type="file" accept="image/*" onChange={handleSizeChartImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Gallery</label>
                <div className="flex flex-wrap items-center gap-3">
                  {formData.gallery.map((imgUrl, index) => (
                    <div key={index} className="relative w-12 h-12 rounded-lg bg-offwhite border border-border overflow-hidden shrink-0">
                      <img src={imgUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-border rounded-lg cursor-pointer hover:bg-offwhite">
                    <Upload className="w-4 h-4 text-navy" />
                    <span>Add Gallery</span>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 font-semibold text-white bg-navy rounded-full hover:bg-gold hover:text-navy cursor-pointer">
                {editingProduct ? 'Save Changes' : 'Add Frame'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};