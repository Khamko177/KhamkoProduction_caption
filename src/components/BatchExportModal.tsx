import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CaptionConfig, BrandType } from '../types';
import {
  renderCaptionCanvas,
  generateBatchImages,
  downloadBlob,
  GeneratedBatchItem
} from '../utils/canvasRenderer';
import { SAMPLE_PRESETS } from '../data/presets';
import {
  getFacebookSettings,
  publishPhotoToFacebook,
  FIXED_DAILY_SLOTS,
  computeDailyScheduleTimeline,
  PlannedScheduleItem,
} from '../utils/facebookApi';
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
  RefreshCw,
  Facebook,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseConfig: CaptionConfig;
  onOpenFacebookSettings?: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  baseConfig,
  onOpenFacebookSettings,
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

  // Batch Facebook Scheduling State
  const [showScheduleSection, setShowScheduleSection] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleProgress, setScheduleProgress] = useState<{
    current: number;
    total: number;
    statusText: string;
  }>({ current: 0, total: 0, statusText: '' });
  const [scheduleSummary, setScheduleSummary] = useState<{
    successCount: number;
    failCount: number;
    errors: string[];
  } | null>(null);

  // Strategy: 'fixed5' (5 posts/day: 07:45, 12:00, 17:15, 20:15, 22:45) vs 'custom'
  const [scheduleStrategy, setScheduleStrategy] = useState<'fixed5' | 'custom'>('fixed5');

  // Default start date: tomorrow (ensures all 5 slots start cleanly in the future)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [batchStartDate, setBatchStartDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [startSlotIndex, setStartSlotIndex] = useState<number>(0); // 0 = 07:45
  const [showTimelinePreview, setShowTimelinePreview] = useState<boolean>(false);

  // Custom mode options fallback
  const [batchStartTime, setBatchStartTime] = useState<string>('07:45');
  const [batchIntervalHours, setBatchIntervalHours] = useState<number>(4);

  // Compute planned schedule timeline reactively
  const plannedSchedule = useMemo<PlannedScheduleItem[]>(() => {
    return computeDailyScheduleTimeline(
      captions,
      batchStartDate,
      startSlotIndex,
      FIXED_DAILY_SLOTS
    );
  }, [captions, batchStartDate, startSlotIndex]);

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

  // Start Batch Scheduling to Facebook Graph API
  const handleBatchScheduleToFacebook = async () => {
    if (captions.length === 0 || isScheduling) return;

    const fbSettings = getFacebookSettings();
    const fbConfig = fbSettings[baseConfig.brand];

    if (!fbConfig.pageId || !fbConfig.accessToken) {
      alert('ກະລຸນາຕັ້ງຄ່າ Facebook Page ID ແລະ Access Token ກ່ອນເດີ!');
      if (onOpenFacebookSettings) {
        onClose();
        onOpenFacebookSettings();
      }
      return;
    }

    // Validation for past/too soon slots in fixed5 mode
    if (scheduleStrategy === 'fixed5') {
      const invalidItem = plannedSchedule.find((item) => item.isPastOrTooSoon);
      if (invalidItem) {
        alert(
          `ຮອບເວລາ ${invalidItem.dateStr} ${invalidItem.timeStr} ແມ່ນຜ່ານມາແລ້ວ ຫຼື ໄວກວ່າ 10 ນາທີ.\n(Facebook กำหนดให้ตั้งเวลาล่วงหน้าอย่างน้อย 10 นาทีขึ้นไป)\n\n👉 ກະລຸນາເລືອກເລີ່ມຈາກ "ມື້ອື່ນ" ຫຼື ເລືອກຮອບເວລາຖັດໄປເດີ!`
        );
        return;
      }
    }

    setIsScheduling(true);
    setScheduleSummary(null);
    setScheduleProgress({ current: 0, total: captions.length, statusText: 'ກຳລັງເລີ່ມຕົ້ນ...' });

    const errors: string[] = [];
    let successCount = 0;
    let failCount = 0;

    // Base start timestamp in seconds for custom mode
    const startDateTime = new Date(`${batchStartDate}T${batchStartTime}:00`);
    const baseStartSec = Math.floor(startDateTime.getTime() / 1000);

    // Create an offscreen canvas for rendering
    const offscreen = document.createElement('canvas');

    for (let i = 0; i < captions.length; i++) {
      const captionText = captions[i];

      // Determine scheduled timestamp based on chosen strategy
      let scheduledSec: number;
      let timeLabel: string;

      if (scheduleStrategy === 'fixed5') {
        const plannedItem = plannedSchedule[i];
        scheduledSec = plannedItem?.scheduledTimestampSec || baseStartSec + i * 3600 * 4;
        timeLabel = plannedItem ? `${plannedItem.dateStr} ${plannedItem.timeStr} ${plannedItem.slotIcon}` : '';
      } else {
        scheduledSec = baseStartSec + i * (batchIntervalHours * 3600);
        const scheduleDateObj = new Date(scheduledSec * 1000);
        timeLabel = `${scheduleDateObj.toLocaleDateString('th-TH')} ${scheduleDateObj.getHours()}:${String(
          scheduleDateObj.getMinutes()
        ).padStart(2, '0')}`;
      }

      setScheduleProgress({
        current: i + 1,
        total: captions.length,
        statusText: `ກຳລັງຕັ້ງເວລາຮູບທີ ${i + 1}/${captions.length} (${timeLabel})...`,
      });

      try {
        const itemConfig: CaptionConfig = {
          ...baseConfig,
          quoteText: captionText,
          notifications: baseConfig.notifications.map((n, idx) =>
            idx === 0 ? { ...n, caption: captionText } : n
          ),
        };

        // Render to canvas
        await renderCaptionCanvas(offscreen, itemConfig);

        // Convert to Blob
        const blob = await new Promise<Blob | null>((resolve) =>
          offscreen.toBlob(resolve, 'image/png', 0.95)
        );

        if (!blob) {
          throw new Error(`ບໍ່ສາມາດສ້າງຮູບພາບ #${i + 1} ໄດ້`);
        }

        // Post to Facebook Graph API
        const res = await publishPhotoToFacebook({
          pageId: fbConfig.pageId,
          accessToken: fbConfig.accessToken,
          imageBlob: blob,
          caption: captionText,
          scheduledPublishTime: scheduledSec,
        });

        if (res.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`ຮູບ #${i + 1}: ${res.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        failCount++;
        errors.push(`ຮູບ #${i + 1}: ${err.message || 'Error rendering/posting'}`);
      }

      // Small pause between requests
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsScheduling(false);
    setScheduleSummary({
      successCount,
      failCount,
      errors,
    });

    if (successCount > 0) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
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

              {/* Main Submit Button (ZIP) */}
              <button
                type="button"
                onClick={handleStartBatch}
                disabled={captions.length === 0 || isGenerating || isScheduling}
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer font-lao active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
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

              {/* Meta Planner Batch Scheduling Section Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowScheduleSection(!showScheduleSection)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer font-lao ${
                    showScheduleSection
                      ? 'bg-[#1877F2]/25 border-[#1877F2] text-white shadow-lg shadow-[#1877F2]/10 ring-1 ring-[#1877F2]/40'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-blue-300 hover:text-white'
                  }`}
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span>📅 ຕັ້ງເວລາທັງໝົດລົງ Meta Planner</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                    Auto-Schedule
                  </span>
                </button>
              </div>

              {/* Meta Planner Batch Scheduling Panel */}
              {showScheduleSection && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center">
                        <Facebook className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white font-lao">
                        ຕັ້ງເວລາໂພສລົງ Meta Business Suite
                      </span>
                    </div>
                    {onOpenFacebookSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenFacebookSettings();
                        }}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-lao cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>ຕັ້ງຄ່າເພຈ</span>
                      </button>
                    )}
                  </div>

                  {/* Mode Switcher: 5 Fixed Slots per Day vs Custom Interval */}
                  <div className="space-y-1 font-lao">
                    <label className="text-[11px] text-slate-400 font-semibold block">
                      ຮູບແບບການຕັ້ງເວລາ (Schedule Mode):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setScheduleStrategy('fixed5')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          scheduleStrategy === 'fixed5'
                            ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>✨ ມື້ລະ 5 ໂພສຄົງທີ່</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleStrategy('custom')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          scheduleStrategy === 'custom'
                            ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>ກຳນົດໄລຍະຫ່າງເອງ</span>
                      </button>
                    </div>
                  </div>

                  {/* Fixed 5 Posts/Day View */}
                  {scheduleStrategy === 'fixed5' ? (
                    <div className="space-y-3 pt-1">
                      {/* Fixed 5 Slots Banner */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 font-lao">
                          <span>5 ຮອບເວລາຄົງທີ່ໃນແຕ່ລະມື້:</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            5 ໂພສ / ມື້
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-center font-mono">
                          {FIXED_DAILY_SLOTS.map((slot, sIdx) => {
                            const isStartingSlot = startSlotIndex === sIdx;
                            return (
                              <div
                                key={slot.id}
                                onClick={() => setStartSlotIndex(sIdx)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  isStartingSlot
                                    ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400/30'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                                title={`ຄລິກເພື່ອເລີ່ມຈາກຮອບ ${slot.label}`}
                              >
                                <span className="text-xs block">{slot.icon}</span>
                                <span className="text-[11px] font-bold block">{slot.time}</span>
                                <span className="text-[9px] text-slate-400 block font-lao">{slot.periodName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Start Date & Start Slot Controls */}
                      <div className="grid grid-cols-2 gap-2 font-lao">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-slate-400">ເລີ່ມວັນທີ:</label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const target = new Date();
                                  target.setDate(target.getDate() + 1);
                                  setBatchStartDate(target.toISOString().split('T')[0]);
                                }}
                                className="text-[9px] text-blue-400 hover:underline cursor-pointer"
                              >
                                ມື້ອື່ນ
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const today = new Date().toISOString().split('T')[0];
                                  setBatchStartDate(today);
                                }}
                                className="text-[9px] text-slate-400 hover:underline cursor-pointer"
                              >
                                ມື້ນີ້
                              </button>
                            </div>
                          </div>
                          <input
                            type="date"
                            value={batchStartDate}
                            onChange={(e) => setBatchStartDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ເລີ່ມຕົ້ນຈາກຮອບ:</label>
                          <select
                            value={startSlotIndex}
                            onChange={(e) => setStartSlotIndex(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-lao"
                          >
                            {FIXED_DAILY_SLOTS.map((slot, idx) => (
                              <option key={slot.id} value={idx}>
                                {idx + 1}. {slot.icon} {slot.time} ({slot.periodName})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Distribution Summary & Timeline Toggle */}
                      {captions.length > 0 && (
                        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-lao">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span>
                                ແບ່ງ <strong>{captions.length}</strong> ໂພສ ລົງ <strong>{Math.ceil(captions.length / 5)}</strong> ມື້
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTimelinePreview(!showTimelinePreview)}
                              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{showTimelinePreview ? 'ເຊື່ອງຕາຕະລາງ' : 'ເບິ່ງຕາຕະລາງ'}</span>
                              {showTimelinePreview ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Expandable Timeline List */}
                          {showTimelinePreview && (
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 border-t border-slate-800/80 pt-1.5 font-lao animate-in fade-in">
                              {plannedSchedule.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`text-[11px] p-1.5 rounded-lg border flex items-center justify-between gap-2 ${
                                    item.isPastOrTooSoon
                                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                      : 'bg-slate-900 border-slate-800/80 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                      #{String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-mono text-blue-300 text-[10px] shrink-0">
                                      {item.dateStr.slice(5)} {item.timeStr} {item.slotIcon}
                                    </span>
                                    <span className="truncate text-slate-200">
                                      {item.captionText}
                                    </span>
                                  </div>
                                  {item.isPastOrTooSoon && (
                                    <span className="text-[9px] text-red-400 font-bold shrink-0">
                                      ຜ່ານມາແລ້ວ!
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Custom Interval Fallback */
                    <div className="space-y-2.5 pt-1 font-lao">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ເລີ່ມວັນທີ:</label>
                          <input
                            type="date"
                            value={batchStartDate}
                            onChange={(e) => setBatchStartDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ເລີ່ມເວລາ:</label>
                          <input
                            type="time"
                            value={batchStartTime}
                            onChange={(e) => setBatchStartTime(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">ໄລຍະຫ່າງລະຫວ່າງແຕ່ລະໂພສ:</label>
                        <select
                          value={batchIntervalHours}
                          onChange={(e) => setBatchIntervalHours(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-lao"
                        >
                          <option value={1}>ທຸກໆ 1 ຊົ່ວໂມງ (Every 1 hour)</option>
                          <option value={2}>ທຸກໆ 2 ຊົ່ວໂມງ (Every 2 hours)</option>
                          <option value={4}>ທຸກໆ 4 ຊົ່ວໂມງ (Every 4 hours)</option>
                          <option value={6}>ທຸກໆ 6 ຊົ່ວໂມງ (Every 6 hours)</option>
                          <option value={12}>ທຸກໆ 12 ຊົ່ວໂມງ (2 ໂພສຕໍ່ມື້)</option>
                          <option value={24}>ທຸກໆ 24 ຊົ່ວໂມງ (1 ໂພສຕໍ່ມື້)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Progress status when scheduling */}
                  {isScheduling && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-300 font-lao">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          <span>{scheduleProgress.statusText}</span>
                        </span>
                        <span className="font-mono text-blue-400">
                          {scheduleProgress.current}/{scheduleProgress.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{
                            width: `${Math.round(
                              (scheduleProgress.current / Math.max(1, scheduleProgress.total)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary Result */}
                  {scheduleSummary && !isScheduling && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-lao space-y-1.5 animate-in fade-in ${
                        scheduleSummary.failCount === 0
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          ຕັ້ງເວລາສຳເລັດ {scheduleSummary.successCount} / {captions.length} ໂພສ!
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {scheduleStrategy === 'fixed5'
                          ? `ໂພສທັງໝົດໄດ້ຖືກແບ່ງລົງຕາມ 5 ຮອບຄົງທີ່ (07:45, 12:00, 17:15, 20:15, 22:45) ໃນ Meta Business Suite Planner ແລ້ວ.`
                          : `ໂພສທັງໝົດໄດ້ຖືກສົ່ງເຂົ້າສູ່ Meta Planner ແລ້ວ ຕາມຊ່ວງເວລາທີ່ກຳນົດ.`}
                      </p>
                      <a
                        href="https://business.facebook.com/latest/content_calendar"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                      >
                        <span>ເບິ່ງປະຕິທິນໃນ Meta Planner</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleBatchScheduleToFacebook}
                    disabled={captions.length === 0 || isScheduling || isGenerating}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-lao disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScheduling ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ກຳລັງຕັ້ງເວລາລົງ Meta Planner...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {scheduleStrategy === 'fixed5'
                            ? `🚀 ຢືນຢັນຕັ້ງເວລາ ${captions.length} ໂພສ (ມື້ລະ 5 ໂພສ) ລົງ Meta Planner`
                            : `🚀 ຢືນຢັນຕັ້ງເວລາ ${captions.length} ໂພສລົງ Meta Planner`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
