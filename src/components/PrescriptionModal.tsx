import React, { useState } from 'react';
import type { PrescriptionData } from '../types';

export interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (prescription: PrescriptionData) => void;
  onSave?: (prescription: PrescriptionData) => void;
  frameName: string;
  framePrice: string;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  frameName,
  framePrice,
}) => {
  // Input fields start as strings for form editing
  const [odSph, setOdSph] = useState('0.00');
  const [odCyl, setOdCyl] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [osSph, setOsSph] = useState('0.00');
  const [osCyl, setOsCyl] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [pd, setPd] = useState('63');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert string inputs to explicit numbers to satisfy PrescriptionData type
    const prescription: PrescriptionData = {
        odSphere: Number(odSph) || 0,
        odCyl: Number(odCyl) || 0,
        odAxis: Number(odAxis) || 0,
        osSphere: Number(osSph) || 0,
        osCyl: Number(osCyl) || 0,
        osAxis: Number(osAxis) || 0,
        pd: Number(pd) || 63,
        odAdd: 0,
        osAdd: 0
    };

    if (onConfirm) {
      onConfirm(prescription);
    } else if (onSave) {
      onSave(prescription);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl border border-[#E5E0D8]">
        <div className="flex justify-between items-start border-b border-[#E5E0D8] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#021438]">Add Lenses & Prescription</h2>
            <p className="text-xs text-[#5E6470]">
              {frameName} — <span className="font-semibold">{framePrice}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5E6470] hover:text-[#021438] font-bold text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Right Eye (OD) */}
          <div>
            <span className="text-xs font-bold text-[#021438] block mb-2">Right Eye (OD)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">SPH</label>
                <input
                  type="text"
                  value={odSph}
                  onChange={(e) => setOdSph(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">CYL</label>
                <input
                  type="text"
                  value={odCyl}
                  onChange={(e) => setOdCyl(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">AXIS</label>
                <input
                  type="text"
                  value={odAxis}
                  onChange={(e) => setOdAxis(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Left Eye (OS) */}
          <div>
            <span className="text-xs font-bold text-[#021438] block mb-2">Left Eye (OS)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">SPH</label>
                <input
                  type="text"
                  value={osSph}
                  onChange={(e) => setOsSph(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">CYL</label>
                <input
                  type="text"
                  value={osCyl}
                  onChange={(e) => setOsCyl(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5E6470] block mb-1">AXIS</label>
                <input
                  type="text"
                  value={osAxis}
                  onChange={(e) => setOsAxis(e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Pupillary Distance */}
          <div>
            <label className="text-xs font-bold text-[#021438] block mb-1">Pupillary Distance (PD mm)</label>
            <input
              type="text"
              value={pd}
              onChange={(e) => setPd(e.target.value)}
              className="w-full border border-[#E5E0D8] rounded-lg px-3 py-1.5 text-xs max-w-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-[#E5E0D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs font-semibold text-[#5E6470]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#021438] text-[#FBFAF5] rounded-xl text-xs font-bold hover:bg-[#E6AA38] hover:text-[#021438] transition-all"
            >
              Confirm Lenses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};