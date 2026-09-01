import React, { useEffect, useRef, useState } from 'react';
import { CaptionConfig } from '../types';
import {
  renderCaptionCanvas,
  exportCanvasAsImage,
  copyCanvasToClipboard
} from '../utils/canvasRenderer';
import {
  Download,
  Copy,
  Check,
  Eye,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImagePreviewProps {
  config: CaptionConfig;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resolution, setResolution] = useState<{ width: number; height: number }>({
    width: 1284,
    height: 900,
  });

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (canvasRef.current) {
        await renderCaptionCanvas(canvasRef.current, config);
        if (isMounted && canvasRef.current) {
          setResolution({
            width: canvasRef.current.width,
            height: canvasRef.current.height,
          });
          setPreviewUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [config]);

  const handleDownload = (format: 'png' | 'jpeg' = 'png') => {
    if (!canvasRef.current) return;
    setDownloading(true);

    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = exportCanvasAsImage(canvasRef.current, mimeType, 0.95);

      const link = document.createElement('a');
      const filenameSlug = (config.caption.slice(0, 20) || 'khamko-caption')
        .replace(/[^a-zA-Z0-9\u0E80-\u0EFF\u00C0-\u1EF9]/g, '_');
      link.download = `khamko_${Date.now()}_${filenameSlug}.${format}`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Error downloading image', err);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setCopied(true);
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.85 },
      });
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert('ບຣາວເຊີຂອງທ່ານຍັງບໍ່ຮອງຮັບການກັອບປີ້ຮູບໂດຍກົງ. ກະລຸນາກົດປຸ່ມ ດາວໂຫຼດຮູບ PNG ແທນເດີ!');
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-lao">
            ຮູບຕົວຢ່າງ (Live Preview)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {resolution.width} × {resolution.height}px
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-lao">
            HD 100%
          </span>
        </div>
      </div>

      <div className="relative w-full flex items-center justify-center bg-black rounded-xl border border-slate-800/90 p-2 sm:p-4 overflow-hidden shadow-inner min-h-[280px]">
        <canvas ref={canvasRef} className="hidden" />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Khamko Caption Preview"
            className="w-full max-w-full max-h-[480px] object-contain rounded-lg shadow-2xl transition-all select-none pointer-events-auto"
          />
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-16 font-lao">
            <Sparkles className="w-5 h-5 animate-spin text-blue-500" />
            <span>ກຳລັງສ້າງຮູບພາບ...</span>
          </div>
        )}
      </div>

      <div className="pt-2 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer font-lao ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>ສຳເນົາຮູບແລ້ວ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" />
                <span>ສຳເນົາຮູບ (Copy ຮູບ)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer font-lao"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'ກຳລັງດາວໂຫຼດ...' : 'ດາວໂຫຼດຮູບ PNG (HD)'}</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 pt-1 font-lao">
          💡 ຄຳແນະນຳ: ກົດ <strong className="text-slate-400">ສຳເນົາຮູບ (Copy)</strong> ແລ້ວໄປທີ່ Facebook / WhatsApp ກົດ <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Ctrl + V</kbd> ເພື່ອໂພສໄດ້ທັນທີ!
        </p>
      </div>
    </div>
  );
};
