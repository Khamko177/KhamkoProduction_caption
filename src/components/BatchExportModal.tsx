import React, { useState, useEffect, useRef } from 'react';
import { CaptionConfig, BrandType } from '../types';
import {
  renderCaptionCanvas,
  generateBatchImages,
  downloadBlob,
  GeneratedBatchItem
} from '../utils/canvasRenderer';
import { SAMPLE_PRESETS } from '../data/presets';
import {
  X,
  Zap,
  Upload,
  FileText,
  Sparkles,
  Trash2,
  CheckCircle2,
  Download,
  Eye,
  Layers,
  ArrowRight,
  FolderArchive,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseConfig: CaptionConfig;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  baseConfig,
}) => {
  if (!isOpen) return null;

  const isKhoiHukJao = baseConfig.brand === 'khoihukjao';

  // Tabs: 'paste' | 'file'
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState<string>('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; caption: string }>({
    current: 0,
    total: 0,
    caption: '',
  });
  const [generatedResults, setGeneratedResults] = useState<GeneratedBatchItem[] | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Parse rawText into captions whenever rawText changes
  useEffect(() => {
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setCaptions(lines);
    if (selectedPreviewIndex >= lines.length) {
      setSelectedPreviewIndex(0);
    }
  }, [rawText]);

  // Render preview canvas whenever selected preview index or baseConfig changes
  useEffect(() => {
    let isMounted = true;
    const currentCaption = captions[selectedPreviewIndex] || (isKhoiHukJao ? 'ຂໍ້ຄວາມແຄັບຊັ່ນ Khoi Huk Jao...' : 'ແຄັບຊັ່ນ Khamko Production...');

    const renderPreview = async () => {
      if (previewCanvasRef.current) {
        const previewConfig: CaptionConfig = {
          ...baseConfig,
          quoteText: currentCaption,
          notifications: baseConfig.notifications.map((n, i) =>
            i === 0 ? { ...n, caption: currentCaption } : n
          ),
        };
        await renderCaptionCanvas(previewCanvasRef.current, previewConfig);
        if (isMounted && previewCanvasRef.current) {
          setPreviewDataUrl(previewCanvasRef.current.toDataURL('image/png'));
        }
      }
    };

    renderPreview();

    return () => {
      isMounted = false;
    };
  }, [captions, selectedPreviewIndex, baseConfig, isKhoiHukJao]);

  // File Upload Handlers (.txt, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileContent(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.csv')) {
        // Parse CSV: split lines, extract first column or non-empty column
        const rows = content.split(/\r?\n/);
        const parsed: string[] = [];
        for (const row of rows) {
          const trimmed = row.trim();
          if (!trimmed) continue;
          // Simple CSV unquote
          const firstCol = trimmed.split(',')[0]?.replace(/^["']|["']$/g, '').trim();
          if (firstCol && !firstCol.toLowerCase().includes('caption') && !firstCol.toLowerCase().includes('content')) {
            parsed.push(firstCol);
          } else if (firstCol) {
            parsed.push(firstCol);
          }
        }
        setRawText(parsed.join('\n'));
      } else {
        // Plain text file: each line is a caption
        setRawText(content);
      }
      setActiveTab('paste');
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Preset Load Handler
  const handleLoadPresets = () => {
    const brandPresets = SAMPLE_PRESETS.filter((p) => p.brand === baseConfig.brand);
    const presetCaptions = brandPresets.map((p) => p.caption);
    setRawText(presetCaptions.join('\n'));
  };

  // Remove single caption from list
  const handleRemoveCaption = (index: number) => {
    const updated = captions.filter((_, i) => i !== index);
    setRawText(updated.join('\n'));
  };

  // Start Batch Generation & ZIP Download
  const handleStartBatch = async () => {
    if (captions.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: captions.length, caption: '' });
    setGeneratedResults(null);
    setZipBlob(null);

    try {
      const { zipBlob: generatedZip, items } = await generateBatchImages(
        captions,
        baseConfig,
        (current, total, currentCaption) => {
          setProgress({ current, total, caption: currentCaption });
        }
      );

      setGeneratedResults(items);
      setZipBlob(generatedZip);

      // Auto download ZIP
      const prefix = isKhoiHukJao ? 'khoihukjao' : 'khamko';
      const zipFilename = `${prefix}_batch_${captions.length}_captions_${Date.now()}.zip`;
      downloadBlob(generatedZip, zipFilename);

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error during batch generation', err);
      alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງຮູບພາບ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              isKhoiHukJao
                ? 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-lao">
                  ສ້າງຫຼາຍຮູບພາບພ້ອມກັນ (Batch Export .ZIP)
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-lao border ${
                  isKhoiHukJao
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {isKhoiHukJao ? 'Khoi Huk Jao' : 'Khamko Production'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-lao">
                ນຳເຂົ້າໄຟລ໌ ຫຼື ວາງລາຍການແຄັບຊັ່ນ ເພື່ອສ້າງ & ດາວໂຫຼດໄຟລ໌ .ZIP ທັງໝົດໃນຄລິກດຽວ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left Column: Input and Caption List (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-y-auto">
            
            {/* Input Tabs */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-lao">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ວາງຂໍ້ຄວາມ (Paste)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'file'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ອັບໂຫຼດໄຟລ໌ (.txt / .csv)</span>
                </button>
              </div>

              {/* Quick load presets */}
              <button
                type="button"
                onClick={handleLoadPresets}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-1.5 rounded-lg transition-colors font-lao cursor-pointer"
                title="ນຳເຂົ້າຕົວຢ່າງແຄັບຊັ່ນທີ່ມີຢູ່"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ຕື່ມຕົວຢ່າງ</span>
              </button>
            </div>

            {/* Tab 1: Paste Textarea */}
            {activeTab === 'paste' ? (
              <div className="space-y-1.5">
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`ວາງຂໍ້ຄວາມແຄັບຊັ່ນຢູ່ນີ້, ແຕ່ລະແຖວຈະເປັນ 1 ຮູບພາບ:\n\nແຖວ 1: ຖ້າເຈົ້າເຫງົາ ໃຫ້ຄິດຮອດເຮົາ... 🍻\nແຖວ 2: ໜ້າຕາອາດຊິບໍ່ຄືດາລາ ແຕ່ເລື່ອງເຮັດໃຫ້ຫົວຮັບປະກັນອັນດັບ 1 🤪\nແຖວ 3: ຄວາມຮັກກະຄື Wifi... ຢູ່ໄກບໍ່ຕິດ ຢູ່ໃກ້ຖາມຫາລະຫັດ 📶`}
                  className={`w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed ${
                    isKhoiHukJao ? 'font-tiktok' : 'font-lao'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-lao px-1">
                  <span>💡 ຄຳແນະນຳ: ກົດ Enter ເພື່ອຂຶ້ນແຖວໃໝ່ສຳລັບແຕ່ລະຮູບພາບ</span>
                  {rawText && (
                    <button
                      type="button"
                      onClick={() => setRawText('')}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      ລຶບທັງໝົດ
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Tab 2: File Dropzone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 font-lao">
                    ຄລິກ ຫຼື ລາກໄຟລ໌ .TXT / .CSV ມາວາງຢູ່ນີ້
                  </p>
                  <p className="text-[11px] text-slate-400 font-lao mt-1">
                    ຮອງຮັບໄຟລ໌ Text (ແຕ່ລະແຖວ 1 ແຄັບຊັ່ນ) ຫຼື ໄຟລ໌ CSV (ຖັນທຳອິດ)
                  </p>
                </div>
              </div>
            )}

            {/* Parsed Captions List */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-lao flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>ລາຍການແຄັບຊັ່ນທີ່ຈະສ້າງ:</span>
                </span>
                <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  {captions.length} ຮູບພາບ
                </span>
              </div>

              {captions.length === 0 ? (
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-6 text-center text-xs text-slate-500 font-lao">
                  ຍັງບໍ່ມີແຄັບຊັ່ນເທື່ອ. ກະລຸນາວາງຂໍ້ຄວາມ ຫຼື ອັບໂຫຼດໄຟລ໌ດ້ານເທິງ
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {captions.map((caption, idx) => {
                    const isSelected = idx === selectedPreviewIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedPreviewIndex(idx)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className={`truncate ${isKhoiHukJao ? 'font-tiktok' : 'font-lao'}`}>
                            {caption}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-lao">
                              ກຳລັງເບິ່ງ
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCaption(idx);
                            }}
                            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                            title="ລຶບແຄັບຊັ່ນນີ້"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live Preview & Batch Actions (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/70 p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
            
            {/* Live Mini Preview Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-lao uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>ຮູບຕົວຢ່າງ #{selectedPreviewIndex + 1}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {isKhoiHukJao ? '1080 × 862' : '1284 × 900'}
                </span>
              </div>

              {/* Preview Box */}
              <div className="relative w-full aspect-[4/3] bg-black rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                <canvas ref={previewCanvasRef} className="hidden" />
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Batch Preview"
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <div className="text-xs text-slate-500 font-lao">ກຳລັງໂຫຼດຮູບຕົວຢ່າງ...</div>
                )}
              </div>

              {/* Preview Caption Text */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                <span className="font-semibold text-slate-400 font-mono text-[10px] block mb-0.5">
                  ແຄັບຊັ່ນທີ #{selectedPreviewIndex + 1}:
                </span>
                <span className={isKhoiHukJao ? 'font-tiktok' : 'font-lao'}>
                  {captions[selectedPreviewIndex] || 'ບໍ່ມີຂໍ້ມູນ'}
                </span>
              </div>
            </div>

            {/* Bottom Actions & Progress */}
            <div className="pt-2 space-y-3">
              
              {/* Progress Bar when Generating */}
              {isGenerating && (
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 font-lao">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>ກຳລັງສ້າງຮູບທີ {progress.current} / {progress.total}...</span>
                    </span>
                    <span className="font-mono text-blue-400">
                      {Math.round((progress.current / Math.max(1, progress.total)) * 100)}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isKhoiHukJao
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{
                        width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 truncate font-lao">
                    {progress.caption}
                  </p>
                </div>
              )}

              {/* Finished Results Message */}
              {generatedResults && !isGenerating && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-lao">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ສຳເລັດແລ້ວ! ໄດ້ສ້າງ {generatedResults.length} ຮູບພາບ</span>
                  </div>
                  {zipBlob && (
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = isKhoiHukJao ? 'khoihukjao' : 'khamko';
                        downloadBlob(zipBlob, `${prefix}_captions_${Date.now()}.zip`);
                      }}
                      className="text-[11px] font-bold text-emerald-300 hover:text-white underline cursor-pointer font-lao"
                    >
                      ດາວໂຫຼດ .ZIP ອີກຄັ້ງ
                    </button>
                  )}
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="button"
                onClick={handleStartBatch}
                disabled={captions.length === 0 || isGenerating}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer font-lao active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isKhoiHukJao
                    ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>ກຳລັງປະມວນຜົນ...</span>
                  </>
                ) : (
                  <>
                    <FolderArchive className="w-4 h-4 text-white" />
                    <span>
                      {captions.length === 0
                        ? 'ກະລຸນາປ້ອນແຄັບຊັ່ນກ່ອນ'
                        : `⚡ ສ້າງ & ດາວໂຫຼດ ${captions.length} ຮູບພາບເປັນ .ZIP`}
                    </span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
