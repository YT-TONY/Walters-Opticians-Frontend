import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Move,
  UploadCloud,
  Calendar,
  FileText,
  CheckCircle2,
  BookmarkPlus,
  Eye
} from 'lucide-react';
import { VirtualPDModal } from './VirtualPDModal';
import { adminApi } from '../api/admin';
import { apiClient } from '../api/client';
import type { GlassesPrescriptionData } from '../types';
import type { SavedPrescription } from '../types/prescription';
import type { StoreSettingsRates } from '../types/admin';

export interface LensConfiguration {
  visionType: 'single_vision' | 'bifocal' | 'varifocal' | 'non_prescription';
  prescription: GlassesPrescriptionData;
  lensStyle: 'clear' | 'polarized' | 'transitions' | 'tint';
  lensIndex: '1.50' | '1.60' | '1.67' | '1.74';
  coatingTier: 'standard' | 'silver' | 'gold' | 'diamond';
  totalLensUpgradePrice: number;
  uploadedFileUrl?: string;
}

export interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (prescription: GlassesPrescriptionData, config?: LensConfiguration) => void;
  onSave?: (prescription: GlassesPrescriptionData, config?: LensConfiguration) => void;
  frameName: string;
  framePrice: string;
}

interface VisionTypeOption {
  id: LensConfiguration['visionType'];
  title: string;
  desc: string;
  badge: string;
  priceDelta: number;
}

interface LensStyleOption {
  id: LensConfiguration['lensStyle'];
  title: string;
  desc: string;
  priceDelta: number;
}

interface LensIndexOption {
  id: LensConfiguration['lensIndex'];
  title: string;
  desc: string;
  priceDelta: number;
}

interface CoatingTierOption {
  id: LensConfiguration['coatingTier'];
  title: string;
  desc: string;
  priceDelta: number;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  frameName,
  framePrice,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [isSavePromptOpen, setIsSavePromptOpen] = useState<boolean>(false);
  const [saveLabel, setSaveLabel] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Saved Prescriptions Sync
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);
  const [, setLoadingSavedRx] = useState<boolean>(false);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);

  const [storeRates, setStoreRates] = useState<StoreSettingsRates>({
    standard_lens_fee: 0,
    eye_exam_fee: 30,
    uk_base_shipping: 4.99,
    eu_base_shipping: 14.99,
    intl_base_shipping: 24.99,
    low_stock_threshold: 8,
  });

  const [visionType, setVisionType] = useState<LensConfiguration['visionType']>('single_vision');

  const [rxInputMode, setRxInputMode] = useState<'manual' | 'upload' | 'book' | 'saved'>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [odSph, setOdSph] = useState<string>('0.00');
  const [odCyl, setOdCyl] = useState<string>('0.00');
  const [odAxis, setOdAxis] = useState<string>('180');
  const [odAdd, setOdAdd] = useState<string>('0.00');

  const [osSph, setOsSph] = useState<string>('0.00');
  const [osCyl, setOsCyl] = useState<string>('0.00');
  const [osAxis, setOsAxis] = useState<string>('180');
  const [osAdd, setOsAdd] = useState<string>('0.00');

  const [pd, setPd] = useState<string>('63.0');
  const [isPDModalOpen, setIsPDModalOpen] = useState<boolean>(false);

  const [lensStyle, setLensStyle] = useState<LensConfiguration['lensStyle']>('clear');
  const [lensIndex, setLensIndex] = useState<LensConfiguration['lensIndex']>('1.50');
  const [coatingTier, setCoatingTier] = useState<LensConfiguration['coatingTier']>('standard');

  const formatDiopterValue = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '0.00';
    const num = Number(val);
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
  };

  const applySavedPrescription = useCallback((rx: SavedPrescription) => {
    setOdSph(formatDiopterValue(rx.right_sph));
    setOdCyl(formatDiopterValue(rx.right_cyl));
    setOdAxis(String(rx.right_axis ?? 180));
    setOsSph(formatDiopterValue(rx.left_sph));
    setOsCyl(formatDiopterValue(rx.left_cyl));
    setOsAxis(String(rx.left_axis ?? 180));
    setPd(String(rx.pd_mm ?? 63.0));
    setSelectedSavedId(rx.id);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadRates = async () => {
      try {
        const res = await adminApi.getStoreSettings();
        if (isMounted && res.rates) {
          setStoreRates((prev) => ({ ...prev, ...res.rates }));
        }
      } catch (err) {
        console.warn('Using default store pricing rates:', err);
      }
    };

    const loadSavedPrescriptions = async () => {
      setLoadingSavedRx(true);
      try {
        const res = await apiClient.get<SavedPrescription[]>('/prescriptions/me');
        if (isMounted && res.data) {
          setSavedPrescriptions(res.data);
          const defaultRx = res.data.find((rx) => rx.is_default);
          if (defaultRx) {
            applySavedPrescription(defaultRx);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch user saved prescriptions:', err);
      } finally {
        if (isMounted) setLoadingSavedRx(false);
      }
    };

    loadRates();
    loadSavedPrescriptions();

    return () => { isMounted = false; };
  }, [isOpen, applySavedPrescription]);

  const showAddColumn = useMemo(() => {
    return visionType === 'bifocal' || visionType === 'varifocal';
  }, [visionType]);

  const sphOptions = useMemo(() => {
    const opts: string[] = [];
    for (let v = -14.00; v <= 11.75; v += 0.25) {
      const val = Math.round(v * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const cylOptions = useMemo(() => {
    const opts: string[] = [];
    for (let v = -6.00; v <= 6.00; v += 0.25) {
      const val = Math.round(v * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const axisOptions = useMemo(() => {
    return Array.from({ length: 180 }, (_, i) => String(i + 1));
  }, []);

  const addOptions = useMemo(() => {
    const opts: string[] = [];
    for (let v = 0.00; v <= 4.00; v += 0.25) {
      const val = Math.round(v * 100) / 100;
      opts.push(val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    }
    return opts;
  }, []);

  const visionTypeOptions: VisionTypeOption[] = useMemo(() => [
    {
      id: 'single_vision',
      title: 'Single Vision',
      desc: 'Optimized for distance (driving), reading, or intermediate work.',
      badge: 'Most Popular',
      priceDelta: storeRates.standard_lens_fee,
    },
    {
      id: 'varifocal',
      title: 'Varifocal / Progressive',
      desc: 'Seamless vision gradient from distance to reading with no visible line.',
      badge: 'Premium',
      priceDelta: storeRates.standard_lens_fee + 60,
    },
    {
      id: 'bifocal',
      title: 'Bifocal',
      desc: 'Dual-segment lenses featuring a distinct reading segment at the base.',
      badge: 'Classic',
      priceDelta: storeRates.standard_lens_fee + 30,
    },
    {
      id: 'non_prescription',
      title: 'Non-Prescription',
      desc: 'Plano optical lenses for everyday aesthetic wear or blue light filtering.',
      badge: 'Plano',
      priceDelta: 0,
    },
  ], [storeRates.standard_lens_fee]);

  const lensStyleOptions: LensStyleOption[] = useMemo(() => [
    { id: 'clear', title: 'Clear Lenses', desc: 'Standard indoor optical clarity for daily wear.', priceDelta: 0 },
    { id: 'polarized', title: 'Polarized Glare Elimination', desc: 'Maximum contrast filtering against glare from wet surfaces & water.', priceDelta: 45 },
    { id: 'transitions', title: 'Transitions® Photochromic', desc: 'Adapts automatically: crystal clear indoors, darkens in outdoor sunlight.', priceDelta: 55 },
    { id: 'tint', title: 'Solid / Gradient Fashion Tint', desc: 'Custom optical sun tinting (Gray, Brown, G-15 Green).', priceDelta: 20 },
  ], []);

  const lensIndexOptions: LensIndexOption[] = useMemo(() => [
    { id: '1.50', title: 'Standard (1.50 Index)', desc: 'Included. Best for lower prescriptions (0.00 to ±2.00 SPH).', priceDelta: 0 },
    { id: '1.60', title: 'Thin (1.60 Index)', desc: '~20% thinner and lighter. Ideal for SPH between ±2.25 and ±4.00.', priceDelta: 25 },
    { id: '1.67', title: 'Super Thin (1.67 Index)', desc: '~33% thinner profile for strong prescriptions (±4.25 to ±6.00).', priceDelta: 45 },
    { id: '1.74', title: 'Ultra Thin (1.74 Index)', desc: '~45% thinner. Ultra-lightweight engineering for high SPH (±6.25+).', priceDelta: 75 },
  ], []);

  const coatingTierOptions: CoatingTierOption[] = useMemo(() => [
    { id: 'standard', title: 'Standard Package', desc: 'Hardened anti-scratch protection.', priceDelta: 0 },
    { id: 'silver', title: 'Silver Package', desc: 'Anti-scratch + Anti-Reflective glare reduction.', priceDelta: 15 },
    { id: 'gold', title: 'Gold Package', desc: 'Anti-scratch + Anti-Reflective + Digital Blue Light filter.', priceDelta: 30 },
    { id: 'diamond', title: 'Diamond Package', desc: 'Ultra-AR + Oleophobic + Hydrophobic + UV400 maximum protection.', priceDelta: 50 },
  ], []);

  const pricingAddons = useMemo(() => {
    const v = visionTypeOptions.find((o) => o.id === visionType)?.priceDelta || 0;
    const s = lensStyleOptions.find((o) => o.id === lensStyle)?.priceDelta || 0;
    const i = lensIndexOptions.find((o) => o.id === lensIndex)?.priceDelta || 0;
    const c = coatingTierOptions.find((o) => o.id === coatingTier)?.priceDelta || 0;
    return { visionTypePrice: v, stylePrice: s, indexPrice: i, coatingPrice: c, totalUpgrade: v + s + i + c };
  }, [visionType, lensStyle, lensIndex, coatingTier, visionTypeOptions, lensStyleOptions, lensIndexOptions, coatingTierOptions]);

  const recommendedIndex = useMemo(() => {
    const maxSph = Math.max(Math.abs(Number(odSph) || 0), Math.abs(Number(osSph) || 0));
    if (maxSph >= 6.25) return '1.74';
    if (maxSph >= 4.25) return '1.67';
    if (maxSph >= 2.25) return '1.60';
    return '1.50';
  }, [odSph, osSph]);

  if (!isOpen) return null;

  const formatBadgePrice = (val: number) => (val === 0 ? 'Included' : `+£${val.toFixed(2)}`);

  const handleNextStep = () => {
    if (currentStep === 1 && visionType === 'non_prescription') {
      setCurrentStep(3);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3 && visionType === 'non_prescription') {
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const constructPayload = () => {
    const prescription: GlassesPrescriptionData = {
      odSphere: Number(odSph) || 0,
      odCyl: Number(odCyl) || 0,
      odAxis: Number(odAxis) || 180,
      osSphere: Number(osSph) || 0,
      osCyl: Number(osCyl) || 0,
      osAxis: Number(osAxis) || 180,
      pd: Number(pd) || 63.0,
      odAdd: showAddColumn ? Number(odAdd) || 0 : 0,
      osAdd: showAddColumn ? Number(osAdd) || 0 : 0,
      uploadedFileUrl: uploadedFile ? uploadedFile.name : undefined,
    };

    const config: LensConfiguration = {
      visionType,
      prescription,
      lensStyle,
      lensIndex,
      coatingTier,
      totalLensUpgradePrice: pricingAddons.totalUpgrade,
      uploadedFileUrl: uploadedFile ? uploadedFile.name : undefined,
    };

    return { prescription, config };
  };

  const executeFinalSubmit = () => {
    const { prescription, config } = constructPayload();
    if (onConfirm) onConfirm(prescription, config);
    else if (onSave) onSave(prescription, config);
    setIsSavePromptOpen(false);
  };

  const handleFinalSubmitClick = () => {
    if (visionType === 'non_prescription' || rxInputMode === 'book') {
      executeFinalSubmit();
    } else {
      setSaveLabel(`${frameName} Prescription`);
      setIsSavePromptOpen(true);
    }
  };

  const handleSaveToAccountAndSubmit = async () => {
    setIsSaving(true);
    const { prescription } = constructPayload();
    try {
      await apiClient.post('/prescriptions', {
        title: saveLabel || 'My Saved Glasses Prescription',
        right_sph: prescription.odSphere,
        right_cyl: prescription.odCyl,
        right_axis: prescription.odAxis,
        left_sph: prescription.osSphere,
        left_cyl: prescription.osCyl,
        left_axis: prescription.osAxis,
        pd_mm: prescription.pd,
        file_url: prescription.uploadedFileUrl || null,
        is_default: false,
      });
    } catch (err) {
      console.error('Failed to save prescription to user account:', err);
    } finally {
      setIsSaving(false);
      executeFinalSubmit();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-walters-navy/60 backdrop-blur-xs p-4 sm:p-6 font-sans text-walters-navy">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">

          <div className="flex justify-between items-start pb-5 border-b border-slate-100 shrink-0">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold block">
                Optical Lens Configurator — Step {currentStep} of 6
              </span>
              <h2 className="font-serif text-2xl font-normal text-walters-navy tracking-tight">Tailor Your Lenses</h2>
              <p className="text-xs text-slate-500 font-light">
                {frameName} — <span className="font-medium text-walters-navy">{framePrice}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-walters-navy hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 pb-4 shrink-0">
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                const isActive = stepNum === currentStep;
                const isSkipped = stepNum === 2 && visionType === 'non_prescription';
                const isCompleted = stepNum < currentStep && !isSkipped;

                return (
                  <div key={stepNum} className="space-y-2">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-walters-navy'
                          : isSkipped
                          ? 'bg-slate-100'
                          : isCompleted
                          ? 'bg-walters-navy/40'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span className={`text-[10px] font-medium tracking-wider uppercase block text-center transition-colors ${
                      isActive ? 'text-walters-navy font-bold' : 'text-slate-400'
                    }`}>
                      {stepNum === 1 && 'Vision'}
                      {stepNum === 2 && 'Prescription'}
                      {stepNum === 3 && 'Style'}
                      {stepNum === 4 && 'Thickness'}
                      {stepNum === 5 && 'Coating'}
                      {stepNum === 6 && 'Review'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="py-4 overflow-y-auto grow space-y-6 px-1">

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-base font-medium text-walters-navy">Select Vision Type</h3>
                  <p className="text-xs text-slate-500 font-light">Choose how you will be using your frames.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visionTypeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVisionType(option.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer space-y-3 ${
                        visionType === option.id
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-semibold text-walters-navy">{option.title}</span>
                        <span className="text-xs font-medium text-walters-navy/80 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                          {formatBadgePrice(option.priceDelta)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1">
                    {savedPrescriptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRxInputMode('saved')}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          rxInputMode === 'saved' ? 'bg-white text-walters-navy shadow-2xs' : 'text-slate-500 hover:text-walters-navy'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Saved Prescriptions ({savedPrescriptions.length})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setRxInputMode('manual')}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        rxInputMode === 'manual' ? 'bg-white text-walters-navy shadow-2xs' : 'text-slate-500 hover:text-walters-navy'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Manual Values</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRxInputMode('upload')}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        rxInputMode === 'upload' ? 'bg-white text-walters-navy shadow-2xs' : 'text-slate-500 hover:text-walters-navy'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRxInputMode('book')}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        rxInputMode === 'book' ? 'bg-white text-walters-navy shadow-2xs' : 'text-slate-500 hover:text-walters-navy'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Eye Exam</span>
                    </button>
                  </div>

                  {rxInputMode === 'manual' && (
                    <button
                      type="button"
                      onClick={() => setIsPDModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/70 hover:bg-orange-500/85 text-white border border-orange-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Scan Pupillary Distance (PD)</span>
                    </button>
                  )}
                </div>

                {rxInputMode === 'saved' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-walters-navy uppercase tracking-wider">
                      Select a Saved Optical Prescription
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedPrescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className={`p-4 rounded-2xl border transition-all space-y-2 cursor-pointer ${
                            selectedSavedId === rx.id
                              ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          onClick={() => {
                            applySavedPrescription(rx);
                            setRxInputMode('manual');
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-walters-navy">{rx.title}</span>
                            {rx.is_default && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-600">
                            OD: {formatDiopterValue(rx.right_sph)} / {formatDiopterValue(rx.right_cyl)} / {rx.right_axis ?? 180}°
                            <br />
                            OS: {formatDiopterValue(rx.left_sph)} / {formatDiopterValue(rx.left_cyl)} / {rx.left_axis ?? 180}°
                          </p>
                          <button
                            type="button"
                            className="w-full py-1.5 bg-walters-navy text-white text-xs font-semibold rounded-xl hover:bg-walters-gold hover:text-walters-navy transition-all"
                          >
                            Use {rx.title}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rxInputMode === 'manual' && (
                  <div className="space-y-5">
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-walters-navy font-semibold border-b border-slate-200">
                            <th className="p-3.5 w-24">Eye</th>
                            <th className="p-3.5">SPH (Sphere)</th>
                            <th className="p-3.5">CYL (Cylinder)</th>
                            <th className="p-3.5">AXIS (1°-180°)</th>
                            {showAddColumn && <th className="p-3.5">ADD (Near)</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-normal">
                          <tr>
                            <td className="p-3.5 font-semibold text-walters-navy">OD (Right)</td>
                            <td className="p-2.5">
                              <select
                                value={odSph}
                                onChange={(e) => setOdSph(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {sphOptions.map((v) => (
                                  <option key={`odSph-${v}`} value={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={odCyl}
                                onChange={(e) => setOdCyl(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {cylOptions.map((v) => (
                                  <option key={`odCyl-${v}`} value={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={odAxis}
                                onChange={(e) => setOdAxis(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {axisOptions.map((v) => (
                                  <option key={`odAxis-${v}`} value={v}>{v}°</option>
                                ))}
                              </select>
                            </td>
                            {showAddColumn && (
                              <td className="p-2.5">
                                <select
                                  value={odAdd}
                                  onChange={(e) => setOdAdd(e.target.value)}
                                  className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                                >
                                  {addOptions.map((v) => (
                                    <option key={`odAdd-${v}`} value={v}>{v}</option>
                                  ))}
                                </select>
                              </td>
                            )}
                          </tr>

                          <tr>
                            <td className="p-3.5 font-semibold text-walters-navy">OS (Left)</td>
                            <td className="p-2.5">
                              <select
                                value={osSph}
                                onChange={(e) => setOsSph(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {sphOptions.map((v) => (
                                  <option key={`osSph-${v}`} value={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={osCyl}
                                onChange={(e) => setOsCyl(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {cylOptions.map((v) => (
                                  <option key={`osCyl-${v}`} value={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={osAxis}
                                onChange={(e) => setOsAxis(e.target.value)}
                                className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                              >
                                {axisOptions.map((v) => (
                                  <option key={`osAxis-${v}`} value={v}>{v}°</option>
                                ))}
                              </select>
                            </td>
                            {showAddColumn && (
                              <td className="p-2.5">
                                <select
                                  value={osAdd}
                                  onChange={(e) => setOsAdd(e.target.value)}
                                  className="w-full p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono focus:border-walters-navy focus:outline-none"
                                >
                                  {addOptions.map((v) => (
                                    <option key={`osAdd-${v}`} value={v}>{v}</option>
                                  ))}
                                </select>
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4">
                      <div>
                        <label className="text-xs font-semibold text-walters-navy flex items-center gap-1.5">
                          <Move className="w-3.5 h-3.5 text-slate-500" />
                          Pupillary Distance (PD)
                        </label>
                        <p className="text-[11px] text-slate-500 font-light mt-0.5">Combined distance between pupil centers in millimeters.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="50"
                          max="75"
                          value={pd}
                          onChange={(e) => setPd(e.target.value)}
                          className="w-20 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-semibold text-walters-navy text-center focus:border-walters-navy focus:outline-none"
                        />
                        <span className="text-xs font-medium text-slate-500">mm</span>
                      </div>
                    </div>
                  </div>
                )}

                {rxInputMode === 'upload' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-4 bg-slate-50/40">
                    <div className="w-12 h-12 rounded-full bg-walters-navy/5 text-walters-navy flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-walters-navy">Upload Optical Prescription</h4>
                      <p className="text-xs text-slate-500 font-light mt-1">Upload a photo or PDF file from your optician.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-walters-navy text-white text-xs font-medium rounded-xl hover:bg-slate-808 transition-colors cursor-pointer shadow-2xs">
                      <span>Browse File</span>
                      <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {uploadedFile && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {rxInputMode === 'book' && (
                  <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-walters-navy text-white rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-walters-navy">Schedule an In-Clinic Sight Test</h4>
                        <p className="text-xs text-slate-500 font-light leading-relaxed">
                          Don't have an up-to-date prescription? Book an appointment at our Gainsborough or North Hykeham practices. We will keep your order on hold until your consultation is completed.
                        </p>
                      </div>
                    </div>
                    <a
                      href="/appointments"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-walters-navy text-walters-navy text-xs font-medium rounded-xl hover:bg-walters-navy hover:text-white transition-all cursor-pointer"
                    >
                      <span>Book Eye Exam Appointment</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-base font-medium text-walters-navy">Choose Lens Style</h3>
                  <p className="text-xs text-slate-500 font-light">Select clear daily lenses or outdoor light tinting options.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lensStyleOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLensStyle(option.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer space-y-3 ${
                        lensStyle === option.id
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-semibold text-walters-navy">{option.title}</span>
                        <span className="text-xs font-medium text-walters-navy/80 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                          {formatBadgePrice(option.priceDelta)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-base font-medium text-walters-navy">Select Lens Index & Thickness</h3>
                    <p className="text-xs text-slate-500 font-light">Thinner lenses reduce weight and edge thickness for higher prescriptions.</p>
                  </div>
                  <span className="text-xs font-medium text-walters-navy bg-slate-100 px-3 py-1 rounded-lg">
                    Recommended: {recommendedIndex} Index
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lensIndexOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLensIndex(option.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer space-y-3 ${
                        lensIndex === option.id
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-semibold text-walters-navy">{option.title}</span>
                        <span className="text-xs font-medium text-walters-navy/80 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                          {formatBadgePrice(option.priceDelta)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-base font-medium text-walters-navy">Select Coating Protection Tier</h3>
                  <p className="text-xs text-slate-500 font-light">Enhance longevity, glare protection, and digital screen comfort.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coatingTierOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCoatingTier(option.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer space-y-3 ${
                        coatingTier === option.id
                          ? 'border-walters-navy bg-walters-navy/5 ring-1 ring-walters-navy shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-semibold text-walters-navy">{option.title}</span>
                        <span className="text-xs font-medium text-walters-navy/80 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                          {formatBadgePrice(option.priceDelta)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-base font-medium text-walters-navy">Review Custom Glasses Summary</h3>
                  <p className="text-xs text-slate-500 font-light">Confirm your configured parameters before adding to bag.</p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="font-semibold text-walters-navy">Base Frame ({frameName}):</span>
                    <span className="font-mono font-semibold text-walters-navy">{framePrice}</span>
                  </div>

                  <div className="space-y-2 text-slate-600 font-light">
                    <div className="flex justify-between">
                      <span>Vision Type ({visionType.replace('_', ' ').toUpperCase()}):</span>
                      <span className="font-mono">{formatBadgePrice(pricingAddons.visionTypePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lens Style ({lensStyle.toUpperCase()}):</span>
                      <span className="font-mono">{formatBadgePrice(pricingAddons.stylePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lens Thickness ({lensIndex} Index):</span>
                      <span className="font-mono">{formatBadgePrice(pricingAddons.indexPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coating Package ({coatingTier.toUpperCase()}):</span>
                      <span className="font-mono">{formatBadgePrice(pricingAddons.coatingPrice)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-sm text-walters-navy">Total Lens Upgrades:</span>
                    <span className="font-mono font-bold text-base text-walters-navy">
                      +£{pricingAddons.totalUpgrade.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-walters-navy text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmitClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-walters-navy text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Glasses Configuration</span>
              </button>
            )}
          </div>

        </div>
      </div>

      <VirtualPDModal
        isOpen={isPDModalOpen}
        onClose={() => setIsPDModalOpen(false)}
        onComplete={(calculatedPD) => {
          setPd(calculatedPD.toString());
          setIsPDModalOpen(false);
        }}
      />

      {isSavePromptOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-walters-navy">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center space-x-3 text-walters-navy">
              <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                <BookmarkPlus className="w-6 h-6 text-walters-navy" />
              </div>
              <div>
                <h3 className="font-bold text-base text-walters-navy">Save Prescription to Account?</h3>
                <p className="text-xs text-slate-500">Store these parameters for quick one-click orders next time.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-walters-navy mb-1">Prescription Label / Title</label>
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="e.g. Daily Glasses RX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-walters-navy"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={executeFinalSubmit}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                No, Thanks
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToAccountAndSubmit}
                className="px-5 py-2 bg-walters-navy text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};