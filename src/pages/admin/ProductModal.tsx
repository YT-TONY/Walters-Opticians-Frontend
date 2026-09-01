// src/pages/admin/ProductModal.tsx
import React, { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
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
  gender: (product?.gender ?? 'unisex') as Gender,
  shape: (product?.shape ?? 'round') as FrameShape,
  frameType: (product?.frameType ?? 'full-rim') as FrameType,
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
  const [prevEditingProduct, setPrevEditingProduct] = useState(editingProduct);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [formData, setFormData] = useState(() => getDefaultFormData(editingProduct));

  if (isOpen !== prevIsOpen || editingProduct !== prevEditingProduct) {
    setPrevIsOpen(isOpen);
    setPrevEditingProduct(editingProduct);
    setFormData(getDefaultFormData(editingProduct));
  }

  if (!isOpen) return null;

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((p) => ({ ...p, image_url: reader.result as string }));
      reader.readAsDataURL(file);
    }
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
        setFormData((p) => {
          const newGallery = [...p.gallery, ...imgs];
          return {
            ...p,
            gallery: newGallery,
            image_url: p.image_url || imgs[0] || '',
          };
        })
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
        <div className="relative w-full max-w-2xl bg-cream rounded-2xl shadow-2xl border border-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-lg font-bold text-navy">
              {editingProduct ? 'Edit Frame Details' : 'Add New Optical Frame'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-offwhite">
              <X className="w-5 h-5 text-slate" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-navy font-semibold mb-1">Model Code (Group Key)</label>
                <input
                  type="text"
                  placeholder="e.g. MARLOWE-01"
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-navy font-semibold mb-1">Color Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tortoise Shell"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg capitalize text-charcoal focus:outline-none focus:border-navy"
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Shape</label>
                <select
                  value={formData.shape}
                  onChange={(e) => setFormData({ ...formData, shape: e.target.value as FrameShape })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg capitalize text-charcoal focus:outline-none focus:border-navy"
                >
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="aviator">Aviator</option>
                  <option value="cat-eye">Cat-Eye</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="oval">Oval</option>
                </select>
              </div>
              <div>
                <label className="block text-navy font-semibold mb-1">Type</label>
                <select
                  value={formData.frameType}
                  onChange={(e) => setFormData({ ...formData, frameType: e.target.value as FrameType })}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-charcoal focus:outline-none focus:border-navy"
                >
                  <option value="full-rim">Full Rim</option>
                  <option value="half-rim">Half Rim</option>
                  <option value="rimless">Rimless</option>
                  <option value="insert">Insert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-offwhite p-3 rounded-xl border border-border">
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

            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="block text-navy font-semibold mb-1">Main Image</label>
                <div className="flex items-center space-x-3">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-12 h-12 rounded object-contain bg-offwhite border border-border" />
                  )}
                  <label className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-border rounded-lg cursor-pointer hover:bg-offwhite">
                    <Upload className="w-4 h-4 text-navy" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Gallery</label>
                <div className="flex flex-wrap items-center gap-3">
                  {formData.gallery.map((imgUrl, index) => (
                    <div key={index} className="relative w-14 h-14 rounded-lg bg-offwhite border border-border overflow-hidden shrink-0">
                      <img src={imgUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-border rounded-lg cursor-pointer hover:bg-offwhite">
                    <Upload className="w-4 h-4 text-navy" />
                    <span>Add Gallery Images</span>
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