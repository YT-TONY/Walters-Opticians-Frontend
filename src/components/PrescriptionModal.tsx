import React, { useState } from 'react';
import type { Product, PrescriptionData } from '../types';
import { X, Upload, Calendar, ShieldCheck, Globe } from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirmPurchase: (type: 'frames_only' | 'prescription', data?: PrescriptionData) => void;
}

type ModalStep = 'CHOICE' | 'UK_QUESTION' | 'FORM' | 'BOOKING';

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirmPurchase,
}) => {
  const [step, setStep] = useState<ModalStep>('CHOICE');
  const [isUkCustomer, setIsUkCustomer] = useState<boolean>(true);
  const [tab, setTab] = useState<'manual' | 'upload'>('manual');
  
  const [rxForm, setRxForm] = useState<PrescriptionData>({
    odSphere: '', odCyl: '', odAxis: '', odAdd: '',
    osSphere: '', osCyl: '', osAxis: '', osAdd: '',
    pd: '',
  });

  const [appointment, setAppointment] = useState({ date: '', time: '' });

  if (!isOpen) return null;

  const resetAndClose = () => {
    setStep('CHOICE');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021438]/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#FBFAF5] border border-[#E5E0D8] rounded-2xl shadow-2xl overflow-hidden text-[#1A1A1A]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E0D8] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#021438] text-[#E6AA38] flex items-center justify-center font-serif font-bold text-sm">
              W
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#021438]">{product.name}</h3>
              <p className="text-xs text-[#5E6470]">Configure frame & optical lens options</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-[#F3F0E6] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#5E6470]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Choice (Prescription vs Just Frames) */}
          {step === 'CHOICE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-[#F3F0E6] rounded-xl text-xs">
                <span className="text-[#5E6470]">Delivery Destination:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsUkCustomer(true)}
                    className={`px-3 py-1 rounded-md transition-all ${isUkCustomer ? 'bg-[#021438] text-white font-medium' : 'text-[#5E6470]'}`}
                  >
                    🇬🇧 United Kingdom
                  </button>
                  <button
                    onClick={() => setIsUkCustomer(false)}
                    className={`px-3 py-1 rounded-md transition-all ${!isUkCustomer ? 'bg-[#021438] text-white font-medium' : 'text-[#5E6470]'}`}
                  >
                    🌐 Non-UK / International
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (isUkCustomer) {
                      setStep('UK_QUESTION');
                    } else {
                      setStep('FORM');
                    }
                  }}
                  className="p-6 border-2 border-[#E6AA38] bg-white rounded-xl text-left hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6AA38]/10 text-[#E6AA38] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#021438]">Buy with Prescription</h4>
                  <p className="text-xs text-[#5E6470] mt-1">Single-vision or progressive lenses cut in our optical lab.</p>
                </button>

                <button
                  onClick={() => {
                    onConfirmPurchase('frames_only');
                    resetAndClose();
                  }}
                  className="p-6 border border-[#E5E0D8] bg-white rounded-xl text-left hover:border-[#021438] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F3F0E6] text-[#5E6470] flex items-center justify-center mb-3">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#021438]">Move On with Just Frames</h4>
                  <p className="text-xs text-[#5E6470] mt-1">Order standard demo frames without optical prescription lenses.</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: UK Customer Check */}
          {step === 'UK_QUESTION' && (
            <div className="space-y-6 text-center py-4">
              <h4 className="font-serif text-2xl font-bold text-[#021438]">Do you have an active prescription?</h4>
              <p className="text-sm text-[#5E6470] max-w-md mx-auto">
                UK optical standards require an up-to-date prescription issued by a qualified optometrist.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setStep('FORM')}
                  className="p-4 bg-[#021438] text-[#FBFAF5] font-semibold rounded-xl hover:bg-[#021438]/90 transition-all"
                >
                  Yes, I have my prescription
                </button>

                <button
                  onClick={() => setStep('BOOKING')}
                  className="p-4 border border-[#E6AA38] text-[#021438] font-semibold rounded-xl hover:bg-[#E6AA38]/10 transition-all"
                >
                  No, book test with Walters Opticians
                </button>
              </div>
            </div>
          )}

          {/* STEP 3A: Prescription Input Form */}
          {step === 'FORM' && (
            <div className="space-y-6">
              <div className="flex border-b border-[#E5E0D8]">
                <button
                  onClick={() => setTab('manual')}
                  className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === 'manual' ? 'border-[#E6AA38] text-[#021438]' : 'border-transparent text-[#5E6470]'}`}
                >
                  Enter Manually
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === 'upload' ? 'border-[#E6AA38] text-[#021438]' : 'border-transparent text-[#5E6470]'}`}
                >
                  Upload Document
                </button>
              </div>

              {tab === 'manual' ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#E5E0D8] text-[#5E6470] uppercase">
                          <th className="py-2">Eye</th>
                          <th className="py-2">SPH</th>
                          <th className="py-2">CYL</th>
                          <th className="py-2">AXIS</th>
                          <th className="py-2">ADD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D8]">
                        <tr>
                          <td className="py-3 font-bold text-[#021438]">OD (Right)</td>
                          <td><input type="text" placeholder="0.00" value={rxForm.odSphere} onChange={(e) => setRxForm({...rxForm, odSphere: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0.00" value={rxForm.odCyl} onChange={(e) => setRxForm({...rxForm, odCyl: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0" value={rxForm.odAxis} onChange={(e) => setRxForm({...rxForm, odAxis: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0.00" value={rxForm.odAdd} onChange={(e) => setRxForm({...rxForm, odAdd: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-[#021438]">OS (Left)</td>
                          <td><input type="text" placeholder="0.00" value={rxForm.osSphere} onChange={(e) => setRxForm({...rxForm, osSphere: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0.00" value={rxForm.osCyl} onChange={(e) => setRxForm({...rxForm, osCyl: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0" value={rxForm.osAxis} onChange={(e) => setRxForm({...rxForm, osAxis: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                          <td><input type="text" placeholder="0.00" value={rxForm.osAdd} onChange={(e) => setRxForm({...rxForm, osAdd: e.target.value})} className="w-16 p-2 border border-[#E5E0D8] rounded bg-white" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5E6470] mb-1">Pupillary Distance (PD in mm)</label>
                    <input type="text" placeholder="e.g. 63" value={rxForm.pd} onChange={(e) => setRxForm({...rxForm, pd: e.target.value})} className="w-full max-w-xs p-2.5 border border-[#E5E0D8] rounded-lg bg-white text-sm" />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#E5E0D8] bg-white p-8 rounded-xl text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-[#E6AA38]" />
                  <p className="text-sm font-medium">Upload your optical prescription file (PDF or Image)</p>
                  <button className="px-4 py-2 bg-[#F3F0E6] text-[#021438] text-xs font-semibold rounded-lg hover:bg-[#E5E0D8]">
                    Choose File
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#E5E0D8]">
                <button
                  onClick={() => {
                    onConfirmPurchase('frames_only');
                    resetAndClose();
                  }}
                  className="text-xs text-[#5E6470] hover:underline"
                >
                  Fallback to buy without frames/prescription
                </button>
                <button
                  onClick={() => {
                    onConfirmPurchase('prescription', rxForm);
                    resetAndClose();
                  }}
                  className="px-6 py-3 bg-[#021438] text-[#FBFAF5] text-xs font-bold rounded-xl hover:bg-[#021438]/90"
                >
                  Confirm & Add to Bag
                </button>
              </div>
            </div>
          )}

          {/* STEP 3B: Book Appointment Modal Fallback */}
          {step === 'BOOKING' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#E6AA38]/10 border border-[#E6AA38]/30 rounded-xl flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-[#E6AA38] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1A1A1A]">
                  <span className="font-bold">Book an In-Store Eye Test:</span> Schedule an appointment with Walters Opticians.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5E6470] mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={appointment.date}
                    onChange={(e) => setAppointment({...appointment, date: e.target.value})}
                    className="w-full p-3 border border-[#E5E0D8] rounded-lg bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5E6470] mb-1">Time Slot</label>
                  <select
                    value={appointment.time}
                    onChange={(e) => setAppointment({...appointment, time: e.target.value})}
                    className="w-full p-3 border border-[#E5E0D8] rounded-lg bg-white text-sm"
                  >
                    <option value="">Select time...</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#E5E0D8]">
                <button
                  onClick={() => {
                    onConfirmPurchase('frames_only');
                    resetAndClose();
                  }}
                  className="text-xs text-[#5E6470] hover:underline"
                >
                  Fallback to buy without frames
                </button>
                <button
                  onClick={() => {
                    alert(`Eye test appointment scheduled for ${appointment.date} at ${appointment.time}.`);
                    onConfirmPurchase('frames_only');
                    resetAndClose();
                  }}
                  disabled={!appointment.date || !appointment.time}
                  className="px-6 py-3 bg-[#E6AA38] text-[#021438] text-xs font-bold rounded-xl hover:bg-[#E6AA38]/90 disabled:opacity-50"
                >
                  Book Appointment & Reserve Frame
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};