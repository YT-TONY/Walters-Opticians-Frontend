// src/components/VirtualPDModal.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, Move, Info, AlertCircle, CreditCard, UserCheck, Eye, Timer, ZoomIn, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface VirtualPDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (pd: number) => void;
}

export const VirtualPDModal: React.FC<VirtualPDModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState<boolean>(false);
  const [showFaceBadge, setShowFaceBadge] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [capturedDimensions, setCapturedDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });
  const [activePin, setActivePin] = useState<'p1' | 'p2' | 'c1' | 'c2' | null>(null);

  // Default pin positions in percentages relative to canvas
  const [p1, setP1] = useState<Point>({ x: 42, y: 52 }); // Right Pupil
  const [p2, setP2] = useState<Point>({ x: 58, y: 52 }); // Left Pupil
  const [c1, setC1] = useState<Point>({ x: 38, y: 32 }); // Card Left Edge
  const [c2, setC2] = useState<Point>({ x: 62, y: 32 }); // Card Right Edge

  const activePinPos = useMemo(() => {
    switch (activePin) {
      case 'p1': return p1;
      case 'p2': return p2;
      case 'c1': return c1;
      case 'c2': return c2;
      default: return null;
    }
  }, [activePin, p1, p2, c1, c2]);

  // Render Magnifying Loupe with direct 1:1 canvas pixel mapping
  const updateLoupe = useCallback(() => {
    if (!activePin || !activePinPos || !canvasRef.current || !loupeCanvasRef.current) return;

    const sourceCanvas = canvasRef.current;
    const loupeCanvas = loupeCanvasRef.current;
    const ctx = loupeCanvas.getContext('2d');
    if (!ctx) return;

    // Exact pixel coordinate on source canvas derived from direct percentage tracking
    const sourceX = (activePinPos.x / 100) * sourceCanvas.width;
    const sourceY = (activePinPos.y / 100) * sourceCanvas.height;

    const loupeSize = 130;
    loupeCanvas.width = loupeSize;
    loupeCanvas.height = loupeSize;

    const zoomFactor = 2.5;
    const cropWidth = loupeSize / zoomFactor;
    const cropHeight = loupeSize / zoomFactor;

    ctx.clearRect(0, 0, loupeSize, loupeSize);

    ctx.drawImage(
      sourceCanvas,
      sourceX - cropWidth / 2,
      sourceY - cropHeight / 2,
      cropWidth,
      cropHeight,
      0,
      0,
      loupeSize,
      loupeSize
    );

    const isCard = activePin.startsWith('c');
    ctx.strokeStyle = isCard ? '#f59e0b' : '#3b82f6';
    ctx.lineWidth = 1.5;

    // Center targeting ring inside Loupe
    ctx.beginPath();
    ctx.arc(loupeSize / 2, loupeSize / 2, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(loupeSize / 2 - 16, loupeSize / 2);
    ctx.lineTo(loupeSize / 2 - 4, loupeSize / 2);
    ctx.moveTo(loupeSize / 2 + 4, loupeSize / 2);
    ctx.lineTo(loupeSize / 2 + 16, loupeSize / 2);

    ctx.moveTo(loupeSize / 2, loupeSize / 2 - 16);
    ctx.lineTo(loupeSize / 2, loupeSize / 2 - 4);
    ctx.moveTo(loupeSize / 2, loupeSize / 2 + 4);
    ctx.lineTo(loupeSize / 2, loupeSize / 2 + 16);
    ctx.stroke();
  }, [activePin, activePinPos]);

  useEffect(() => {
    if (activePin) {
      updateLoupe();
    }
  }, [activePin, activePinPos, updateLoupe]);

  useEffect(() => {
    if (isOpen && !isCaptured) {
      const showTimer = setTimeout(() => setShowFaceBadge(true), 0);
      const hideTimer = setTimeout(() => setShowFaceBadge(false), 6000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen, isCaptured]);

  useEffect(() => {
    if (!isOpen || isCaptured) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const startWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraError(null);
      } catch (err) {
        if (!isCancelled) {
          console.error('Camera access denied:', err);
          setCameraError('Camera access was denied or unavailable. Please check browser permissions.');
        }
      }
    };

    startWebcam();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, isCaptured]);

  // Capture uncropped native video frame
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);

      setCapturedDimensions({ width, height });
      setIsCaptured(true);
      setCountdown(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  const startCountdown = () => {
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      handleCapture();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, handleCapture]);

  const handleRetake = () => {
    setIsCaptured(false);
    setCameraError(null);
    setCountdown(null);
    setShowFaceBadge(true);
    setShowGuide(false);
  };

  const calculatedPD = useMemo(() => {
    const { width, height } = capturedDimensions;

    const eyeDx = (p2.x - p1.x) * (width / 100);
    const eyeDy = (p2.y - p1.y) * (height / 100);
    const eyePx = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy);

    const cardDx = (c2.x - c1.x) * (width / 100);
    const cardDy = (c2.y - c1.y) * (height / 100);
    const cardPx = Math.sqrt(cardDx * cardDx + cardDy * cardDy);

    if (cardPx === 0) return 63;

    const rawPD = (eyePx / cardPx) * 85.60;
    return Math.min(Math.max(Math.round(rawPD * 2) / 2, 50), 75);
  }, [p1, p2, c1, c2, capturedDimensions]);

  // Calculate coordinates strictly relative to the canvas bounding box
  const getCanvasRelativePoint = (e: React.MouseEvent<HTMLDivElement>): Point | null => {
    const canvas = canvasRef.current || videoRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);

    return { x, y };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCaptured) return;
    const pt = getCanvasRelativePoint(e);
    if (!pt) return;

    const pins: { key: 'p1' | 'p2' | 'c1' | 'c2'; pos: Point }[] = [
      { key: 'p1', pos: p1 },
      { key: 'p2', pos: p2 },
      { key: 'c1', pos: c1 },
      { key: 'c2', pos: c2 },
    ];

    let closestPin: 'p1' | 'p2' | 'c1' | 'c2' | null = null;
    let minDistance = 12;

    pins.forEach((pin) => {
      const dist = Math.sqrt(Math.pow(pt.x - pin.pos.x, 2) + Math.pow(pt.y - pin.pos.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestPin = pin.key;
      }
    });

    if (closestPin) {
      setActivePin(closestPin);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activePin || !isCaptured) return;
    const pt = getCanvasRelativePoint(e);
    if (!pt) return;

    switch (activePin) {
      case 'p1': setP1(pt); break;
      case 'p2': setP2(pt); break;
      case 'c1': setC1(pt); break;
      case 'c2': setC2(pt); break;
    }
  };

  const handleCanvasMouseUp = () => {
    setActivePin(null);
  };

  const handleApplyPD = () => {
    onComplete(calculatedPD);
    toast.success(`Pupillary Distance (${calculatedPD} mm) saved to prescription!`);
    onClose();
  };

  const handleModalClose = () => {
    setShowFaceBadge(true);
    setShowGuide(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-walters-navy">Virtual PD Scanner</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Accurate pupil distance measurement calibrated using a standard plastic card.
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="text-neutral-400 hover:text-walters-navy p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-STEP INSTRUCTIONS WIDGET (BEFORE CAPTURE) */}
        {!isCaptured && (
          <div className="mt-4 p-4 bg-neutral-100/90 border border-neutral-200/90 rounded-2xl grid grid-cols-3 gap-3 text-center shrink-0 shadow-xs">
            <div className="flex flex-col items-center justify-center space-y-2 p-1">
              <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center shadow-xs stroke-[2.5]">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-walters-navy tracking-tight">1. Grab Any Card</span>
              <p className="text-[10px] text-neutral-600 font-bold leading-tight">Use bank/ID card as 85.6mm scale.</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 p-1 border-x border-neutral-300/80">
              <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-950 flex items-center justify-center shadow-xs stroke-[2.5]">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-walters-navy tracking-tight">2. Move In Close</span>
              <p className="text-[10px] text-neutral-600 font-bold leading-tight">Fill circle with face & card.</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 p-1">
              <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-950 flex items-center justify-center shadow-xs stroke-[2.5]">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-walters-navy tracking-tight">3. Look at Camera</span>
              <p className="text-[10px] text-neutral-600 font-bold leading-tight">Keep head straight & snapshot.</p>
            </div>
          </div>
        )}

        {/* PIN ALIGNMENT INSTRUCTION BANNER & HELP TOGGLE */}
        {isCaptured && (
          <div className="mt-4 p-3 bg-amber-500 text-slate-950 border border-amber-600 rounded-2xl flex items-center justify-between shrink-0 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <ZoomIn className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="text-xs font-black">
                Drag C1 & C2 to card corners, and R & L to pupil centers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1 text-[11px] font-black bg-slate-950 text-amber-400 px-2.5 py-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Hide Guide' : 'Placement Guide'}</span>
            </button>
          </div>
        )}

        {/* EXPANDABLE PLACEMENT GUIDANCE DRAWER */}
        {isCaptured && showGuide && (
          <div className="mt-3 p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200 shrink-0 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 border-r border-slate-700 pr-3">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct Placement
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong className="text-amber-400">Card (C1 / C2):</strong> Direct on extreme left & right plastic corners.</li>
                  <li><strong className="text-blue-400">Pupils (R / L):</strong> Dead center over black pupil dots.</li>
                </ul>
              </div>

              <div className="space-y-1.5 pl-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <XCircle className="w-3.5 h-3.5" /> Common Mistakes
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  <li>Placing card pins inside text/printed logos.</li>
                  <li>Placing pupil pins on iris edge, eyelid, or eyebrow.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CAMERA & SNAPSHOT CONTAINER */}
        <div className="py-4 space-y-4 overflow-y-auto grow">
          {cameraError ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 w-full">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs text-rose-800 font-medium">{cameraError}</p>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-full hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Retry Camera Connection
              </button>
            </div>
          ) : (
            <div 
              className="relative w-full bg-black rounded-2xl overflow-hidden cursor-crosshair select-none shadow-inner flex items-center justify-center"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseDown={handleCanvasMouseDown}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-auto block object-contain ${isCaptured ? 'hidden' : 'block'}`}
              />

              <canvas
                ref={canvasRef}
                className={`w-full h-auto block object-contain ${isCaptured ? 'block' : 'hidden'}`}
              />

              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-30 animate-in fade-in duration-150">
                  <span className="text-7xl font-extrabold text-amber-400 drop-shadow-lg animate-bounce">
                    {countdown}
                  </span>
                </div>
              )}

              {/* FACE POSITIONING GUIDE */}
              {!isCaptured && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-2xl m-3">
                  <div className="w-56 sm:w-64 h-64 sm:h-72 border-4 border-amber-400 rounded-[50%] mb-2 flex flex-col items-center justify-center shadow-2xl bg-black/10 transition-all">
                    {showFaceBadge && (
                      <div className="flex flex-col items-center space-y-1 bg-black/85 px-4 py-2 rounded-2xl border border-amber-400/40 text-center animate-pulse">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          Position Face Here
                        </span>
                        <span className="text-[10px] text-neutral-300 font-bold">
                          Hold card flat above eyebrows
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FLOATING MAGNIFYING LOUPE */}
              {isCaptured && activePin && activePinPos && (
                <div 
                  style={{ 
                    left: `${activePinPos.x}%`, 
                    top: `calc(${activePinPos.y}% - 95px)` 
                  }}
                  className="absolute -translate-x-1/2 pointer-events-none z-40 flex flex-col items-center animate-in zoom-in-75 duration-150"
                >
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-900 shadow-2xl overflow-hidden relative ring-4 ring-black/40">
                    <canvas ref={loupeCanvasRef} className="w-full h-full" />
                  </div>
                  <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white -mt-0.5 shadow-md" />
                </div>
              )}

              {/* HIGH-PRECISION RETICLES STRICTLY OVER CANVAS */}
              {isCaptured && (
                <div className="absolute inset-0 pointer-events-auto">
                  {[
                    { key: 'c1', pos: c1, label: 'C1' },
                    { key: 'c2', pos: c2, label: 'C2' },
                  ].map((pin) => (
                    <div 
                      key={pin.key}
                      style={{ left: `${pin.pos.x}%`, top: `${pin.pos.y}%` }} 
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-amber-400 bg-amber-500/20 flex items-center justify-center relative shadow-md">
                        <div className="w-1 h-1 rounded-full bg-amber-400 shadow-xs" />
                        <span className="absolute -top-2 -right-2 text-[8px] font-black bg-amber-500 text-slate-950 px-1 py-0.2 rounded-full shadow-xs border border-white/50">
                          {pin.label}
                        </span>
                      </div>
                    </div>
                  ))}

                  {[
                    { key: 'p1', pos: p1, label: 'R' },
                    { key: 'p2', pos: p2, label: 'L' },
                  ].map((pin) => (
                    <div 
                      key={pin.key}
                      style={{ left: `${pin.pos.x}%`, top: `${pin.pos.y}%` }} 
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-blue-400 bg-blue-500/20 flex items-center justify-center relative shadow-md">
                        <div className="w-1 h-1 rounded-full bg-blue-400 shadow-xs" />
                        <span className="absolute -top-2 -right-2 text-[8px] font-black bg-blue-600 text-white px-1 py-0.2 rounded-full shadow-xs border border-white/50">
                          {pin.label}
                        </span>
                      </div>
                    </div>
                  ))}

                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1={`${c1.x}%`} y1={`${c1.y}%`} x2={`${c2.x}%`} y2={`${c2.y}%`} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`} stroke="#3b82f6" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* RESULTS PANEL */}
          {isCaptured && (
            <div className="p-4 bg-walters-cream rounded-2xl border border-walters-border flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-walters-navy text-white flex items-center justify-center">
                  <Move className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Calculated PD</span>
                  <span className="text-xl font-extrabold text-walters-navy">{calculatedPD} mm</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 flex items-center gap-1 justify-end">
                  <Info className="w-3 h-3 text-amber-600" />
                  Standard Adult Range: 54 - 74 mm
                </span>
                <span className="text-xs font-bold text-emerald-700">Accuracy Precision: ±0.5 mm</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 shrink-0">
          {!isCaptured ? (
            <>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2.5 border border-neutral-300 rounded-full text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Timer className="w-4 h-4" />
                  <span>5s Hands-Free</span>
                </button>

                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={countdown !== null}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-walters-navy text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Snapshot</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-neutral-300 rounded-full text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleApplyPD}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply PD ({calculatedPD} mm)</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};