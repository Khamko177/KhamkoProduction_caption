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
  Sparkles,
  Facebook,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImagePreviewProps {
  config: CaptionConfig;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  onOpenFacebookPost?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  config,
  canvasRef,
  onOpenFacebookPost,
}) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = canvasRef || localCanvasRef;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resolution, setResolution] = useState<{ width: number; height: number }>({
    width: config.brand === 'khoihukjao' ? 1080 : 1284,
    height: config.brand === 'khoihukjao' ? 862 : 900,
  });

  const isKhoiHukJao = config.brand === 'khoihukjao';

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (activeCanvasRef.current) {
        await renderCaptionCanvas(activeCanvasRef.current, config);
        if (isMounted && activeCanvasRef.current) {
          setResolution({
            width: activeCanvasRef.current.width,
            height: activeCanvasRef.current.height,
          });
          setPreviewUrl(activeCanvasRef.current.toDataURL('image/png'));
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [config, activeCanvasRef]);

  const handleDownload = (format: 'png' | 'jpeg' = 'png') => {
    if (!activeCanvasRef.current) return;
    setDownloading(true);

    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = exportCanvasAsImage(activeCanvasRef.current, mimeType, 0.95);

      const prefix = isKhoiHukJao ? 'khoihukjao' : 'khamko';
      const rawCaption = config.quoteText || config.notifications[0]?.caption || 'caption';
      const filenameSlug = (rawCaption.slice(0, 20) || prefix)
        .replace(/[^a-zA-Z0-9\u0E80-\u0EFF\u00C0-\u1EF9]/g, '_');

      const link = document.createElement('a');
      link.download = `${prefix}_${Date.now()}_${filenameSlug}.${format}`;
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
    if (!activeCanvasRef.current) return;
    const success = await copyCanvasToClipboard(activeCanvasRef.current);
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
          <Eye className={`w-4 h-4 ${isKhoiHukJao ? 'text-amber-400' : 'text-emerald-400'}`} />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-lao">
            ຮູບຕົວຢ່າງ ({isKhoiHukJao ? 'Khoi Huk Jao' : 'Khamko'})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {resolution.width} × {resolution.height}px
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border font-lao ${
              isKhoiHukJao
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isKhoiHukJao ? 'Banner 1080x862' : 'HD 100%'}
          </span>
        </div>
      </div>

      <div className="relative w-full flex items-center justify-center bg-black rounded-xl border border-slate-800/90 p-2 sm:p-4 overflow-hidden shadow-inner min-h-[280px]">
        <canvas ref={activeCanvasRef} className="hidden" />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Caption Preview"
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
                <span>ສຳເນົາຮູບແລ້ວ! (Paste ໄດ້ເລີຍ)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>ກັອບປີ້ຮູບ (Ctrl + V)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={downloading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white shadow-lg active:scale-95 transition-all cursor-pointer font-lao ${
              isKhoiHukJao
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'ກຳລັງດາວໂຫຼດ...' : 'ດາວໂຫຼດຮູບ PNG'}</span>
          </button>
        </div>

        {onOpenFacebookPost && (
          <button
            type="button"
            onClick={onOpenFacebookPost}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] hover:text-white border border-[#1877F2]/30 hover:border-[#1877F2]/60 transition-all shadow-md active:scale-95 cursor-pointer font-lao"
          >
            <Facebook className="w-4 h-4" />
            <span>ໂພສ / ຕັ້ງເວລາລົງ Meta Planner</span>
          </button>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 font-lao">
          <span>ກົດ ກັອບປີ້ຮູບ ແລ້ວກົດ Paste (Ctrl+V) ລົງ Facebook / Zalo ໄດ້ທັນທີ</span>
          <button
            type="button"
            onClick={() => handleDownload('jpeg')}
            className="text-slate-400 hover:text-slate-300 underline cursor-pointer"
          >
            ດາວໂຫຼດ JPG
          </button>
        </div>
      </div>
    </div>
  );
};
