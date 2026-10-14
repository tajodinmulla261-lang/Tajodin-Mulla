import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scissors, RotateCcw, Check, Sliders, Sparkles, Eye, Pipette } from 'lucide-react';

interface PhotoBackgroundRemoverProps {
  initialPhotoUrl?: string;
  onApplyPhoto: (cutoutDataUrl: string) => void;
  onCancel: () => void;
}

export const PhotoBackgroundRemover: React.FC<PhotoBackgroundRemoverProps> = ({
  initialPhotoUrl,
  onApplyPhoto,
  onCancel,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialPhotoUrl || null);
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickColorMode, setPickColorMode] = useState(false);
  const [hasCutout, setHasCutout] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImageSrc(result);
          setHasCutout(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load image onto canvas whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      renderImageToCanvas(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const renderImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Constrain canvas to high resolution but manageable size (max 600px width/height)
    const maxDim = 600;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  };

  // Perform background cutout based on target RGB color
  const processCutout = (targetR: number, targetG: number, targetB: number) => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    setIsProcessing(true);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Reset to pristine original first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const totalPixels = data.length / 4;

    const tolSq = tolerance * tolerance * 3;
    const featherSq = (tolerance + feather) * (tolerance + feather) * 3;

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) continue;

      // Color distance Euclidean
      const distSq = (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2;

      if (distSq <= tolSq) {
        data[idx + 3] = 0; // Cut out completely (transparent)
      } else if (distSq < featherSq) {
        // Smooth anti-aliased edge feather
        const factor = (Math.sqrt(distSq) - tolerance * Math.sqrt(3)) / (feather * Math.sqrt(3));
        const alphaRatio = Math.max(0, Math.min(1, factor));
        data[idx + 3] = Math.round(data[idx + 3] * alphaRatio);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setHasCutout(true);
    setIsProcessing(false);
  };

  // Automatic Background Cutout (Samples the 4 corners of the photo)
  const handleAutoCut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Sample 4 corners
    const c1 = ctx.getImageData(2, 2, 1, 1).data;
    const c2 = ctx.getImageData(w - 3, 2, 1, 1).data;
    const c3 = ctx.getImageData(2, h - 3, 1, 1).data;
    const c4 = ctx.getImageData(w - 3, h - 3, 1, 1).data;

    // Average corner background color
    const avgR = Math.round((c1[0] + c2[0] + c3[0] + c4[0]) / 4);
    const avgG = Math.round((c1[1] + c2[1] + c3[1] + c4[1]) / 4);
    const avgB = Math.round((c1[2] + c2[2] + c3[2] + c4[2]) / 4);

    processCutout(avgR, avgG, avgB);
  };

  // Click on Canvas to Cutout whatever color was clicked
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    processCutout(pixel[0], pixel[1], pixel[2]);
    setPickColorMode(false);
  };

  // Reset image
  const handleReset = () => {
    if (originalImageRef.current) {
      renderImageToCanvas(originalImageRef.current);
      setHasCutout(false);
    }
  };

  // Apply cutout
  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const transparentPng = canvas.toDataURL('image/png');
    onApplyPhoto(transparentPng);
  };

  return (
    <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
      {/* Upload button bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          <Upload className="w-4 h-4 text-amber-400" /> Upload Photo from Computer/Phone
        </button>

        {imageSrc && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoCut}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow"
            >
              <Scissors className="w-3.5 h-3.5" /> Auto-Cut Background
            </button>

            <button
              type="button"
              onClick={() => setPickColorMode(!pickColorMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                pickColorMode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Pipette className="w-3.5 h-3.5" />
              {pickColorMode ? 'Click on image background' : 'Pick Color to Cut'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
              title="Reset Original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas Viewport (With transparent checkerboard pattern) */}
      {imageSrc ? (
        <div className="space-y-3">
          <div
            className="w-full flex items-center justify-center p-4 rounded-xl border border-slate-800 overflow-hidden min-h-[220px]"
            style={{
              backgroundColor: '#111827',
              backgroundImage:
                'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`max-h-[260px] max-w-full object-contain rounded-lg shadow-lg ${
                pickColorMode ? 'cursor-crosshair ring-2 ring-cyan-400' : 'cursor-default'
              }`}
            />
          </div>

          {/* Cutout Controls (Tolerance & Feather) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Cut Sensitivity (Tolerance):</span>
                <span className="font-mono text-white font-bold">{tolerance}</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={tolerance}
                onChange={(e) => {
                  setTolerance(parseInt(e.target.value, 10));
                  if (hasCutout) handleAutoCut();
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Edge Smoothing (Feather):</span>
                <span className="font-mono text-white font-bold">{feather}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={feather}
                onChange={(e) => {
                  setFeather(parseInt(e.target.value, 10));
                  if (hasCutout) handleAutoCut();
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              {hasCutout ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Background successfully removed!
                </span>
              ) : (
                'Click "Auto-Cut Background" or use eye-dropper to cut background color.'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow"
              >
                <Check className="w-4 h-4" /> Use Cutout Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-amber-400/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40"
        >
          <Upload className="w-8 h-8 text-amber-400 mb-2" />
          <span className="font-bold text-sm text-white block">
            Click to upload player photo from your device
          </span>
          <span className="text-xs text-slate-500 mt-1">
            PNG, JPG, WebP supported · Built-in automatic background cutout tool
          </span>
        </div>
      )}
    </div>
  );
};
