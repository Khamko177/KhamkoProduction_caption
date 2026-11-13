import React, { useState, useEffect } from 'react';
import { CaptionConfig } from '../types';
import {
  getFacebookSettings,
  publishPhotoToFacebook,
  FIXED_DAILY_SLOTS,
} from '../utils/facebookApi';
import {
  X,
  Facebook,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FacebookPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseConfig: CaptionConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onOpenSettings: () => void;
}

export const FacebookPostModal: React.FC<FacebookPostModalProps> = ({
  isOpen,
  onClose,
  baseConfig,
  canvasRef,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const isKhoiHukJao = baseConfig.brand === 'khoihukjao';
  const settings = getFacebookSettings();
  const currentConfig = settings[baseConfig.brand];

  // Mode: 'now' | 'schedule'
  const [postMode, setPostMode] = useState<'now' | 'schedule'>('schedule');

  // Caption message
  const defaultCaption = baseConfig.quoteText || baseConfig.notifications[0]?.caption || '';
  const [message, setMessage] = useState<string>(defaultCaption);

  // Date and Time for scheduling (Default: tomorrow at 07:45 fixed slot 1)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const defaultTimeStr = '07:45';

  const [scheduleDate, setScheduleDate] = useState<string>(defaultDateStr);
  const [scheduleTime, setScheduleTime] = useState<string>(defaultTimeStr);

  // Status
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postResult, setPostResult] = useState<{
    success?: boolean;
    postId?: string;
    error?: string;
  } | null>(null);

  // Image preview data URL from canvas
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  useEffect(() => {
    if (canvasRef.current) {
      setPreviewDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  }, [canvasRef, isOpen]);

  // Quick schedule presets for 5 fixed daily slots
  const handleSelectSlotTime = (time: string, day: 'today' | 'tomorrow' = 'tomorrow') => {
    const target = new Date();
    if (day === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    }
    const dStr = target.toISOString().split('T')[0];
    setScheduleDate(dStr);
    setScheduleTime(time);
    setPostMode('schedule');
  };

  const handleExecutePost = async () => {
    if (!canvasRef.current || isPosting) return;

    if (!currentConfig.pageId || !currentConfig.accessToken) {
      alert('ກະລຸນາຕັ້ງຄ່າ Page ID ແລະ Token ກ່ອນໂພສເດີ!');
      onOpenSettings();
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    // 1. Get Blob from Canvas
    const imageBlob = await new Promise<Blob | null>((resolve) =>
      canvasRef.current?.toBlob(resolve, 'image/png', 0.95)
    );

    if (!imageBlob) {
      setIsPosting(false);
      setPostResult({ success: false, error: 'ບໍ່ສາມາດດຶງຮູບພາບຈາກ Canvas ໄດ້' });
      return;
    }

    // 2. Compute scheduledPublishTime if schedule mode
    let scheduledPublishTime: number | undefined = undefined;
    if (postMode === 'schedule') {
      const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      scheduledPublishTime = Math.floor(selectedDateTime.getTime() / 1000);
    }

    // 3. Call Facebook Graph API
    const result = await publishPhotoToFacebook({
      pageId: currentConfig.pageId,
      accessToken: currentConfig.accessToken,
      imageBlob,
      caption: message,
      scheduledPublishTime,
    });

    setIsPosting(false);
    setPostResult(result);

    if (result.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              isKhoiHukJao ? 'bg-amber-600 shadow-amber-500/25' : 'bg-blue-600 shadow-blue-500/25'
            }`}>
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-lao">
                  ໂພສລົງ Facebook / Meta Planner
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
                ເຜີຍແຜ່ທັນທີ ຫຼື ຕັ້ງເວລາໃຫ້ປາກົດໃນໜ້າ Meta Business Suite Planner
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
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Connection Status Banner */}
          {!currentConfig.isConnected || !currentConfig.pageId ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-amber-300 font-lao">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>ຍັງບໍ່ໄດ້ເຊື່ອມຕໍ່ Facebook Page ID & Token ເທື່ອ</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-xl transition-colors font-lao cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>ຕັ້ງຄ່າດຽວນີ້</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs font-lao">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400">ເພຈປາຍທາງ:</span>
                <span className="font-bold text-white">
                  {currentConfig.pageName || `ID: ${currentConfig.pageId}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                ປ່ຽນການຕັ້ງຄ່າ
              </button>
            </div>
          )}

          {/* Image & Caption Preview Box */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex gap-3 items-center">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Post Preview"
                className="w-24 h-18 object-contain bg-black rounded-lg border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-24 h-18 bg-slate-900 rounded-lg animate-pulse shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 font-lao block mb-1">
                ຂໍ້ຄວາມແຄັບຊັ່ນທີ່ຈະໂພສ:
              </span>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ພິມຂໍ້ຄວາມໂພສ..."
                className={`w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-snug ${
                  isKhoiHukJao ? 'font-tiktok' : 'font-lao'
                }`}
              />
            </div>
          </div>

          {/* Mode Switcher: Now vs Schedule */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-lao">
              ເລືອກວິທີການໂພສ:
            </label>
            <div className="grid grid-cols-2 gap-3 font-lao">
              <button
                type="button"
                onClick={() => setPostMode('schedule')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  postMode === 'schedule'
                    ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>ຕັ້ງເວລາລົງ Meta Planner</span>
              </button>

              <button
                type="button"
                onClick={() => setPostMode('now')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  postMode === 'now'
                    ? 'bg-emerald-600/25 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>ໂພສທັນທີ (Publish Now)</span>
              </button>
            </div>
          </div>

          {/* Schedule Settings Panel when 'schedule' is selected */}
          {postMode === 'schedule' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-lao">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>ເລືອກວັນທີ & ເວລາ (ປາກົດໃນ Meta Calendar):</span>
                </span>
              </div>

              {/* Date & Time Input */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-lao">ວັນທີ (Date):</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-lao">ເວລາ (Time):</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* 5 Fixed Daily Slots Presets */}
              <div className="space-y-1.5 pt-1 font-lao">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ເລືອກຮອບໂພສຄົງທີ່ (5 ຮອບ/ມື້):</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setScheduleDate(today);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                        scheduleDate === new Date().toISOString().split('T')[0]
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      ມື້ນີ້
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = new Date();
                        target.setDate(target.getDate() + 1);
                        setScheduleDate(target.toISOString().split('T')[0]);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                        scheduleDate !== new Date().toISOString().split('T')[0]
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      ມື້ອື່ນ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {FIXED_DAILY_SLOTS.map((slot) => {
                    const isSelected = scheduleTime === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setScheduleTime(slot.time)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20'
                            : 'bg-slate-900/90 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-sm block">{slot.icon}</span>
                        <span className="font-mono font-bold text-xs block leading-tight">{slot.time}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{slot.periodName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-lao leading-relaxed border-t border-slate-800/80 pt-2">
                💡 <strong>ຫມາຍເຫດ:</strong> ເມື່ອບັນທຶກແລ້ວ ໂພສຈະໄປປາກົດໃນໜ້າ <em>Meta Business Suite Planner</em> (ປຸ່ມสีฟ้า/ส้ม ในปฏิทิน) ໂດຍອັດຕະໂນມັດ ຕາມເວລາທີ່ທ່ານຕັ້ງ.
              </p>
            </div>
          )}

          {/* Post Result Status */}
          {postResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-lao flex items-start gap-2.5 animate-in fade-in ${
                postResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {postResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {postResult.success
                    ? postMode === 'schedule'
                      ? '✓ ຕັ້ງເວລາລົງ Meta Planner ສຳເລັດແລ້ວ!'
                      : '✓ ໂພສລົງ Facebook ສຳເລັດແລ້ວ!'
                    : 'ເກີດຂໍ້ຜິດພາດໃນການໂພສ'}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {postResult.success
                    ? postMode === 'schedule'
                      ? `ໂພສຂອງທ່ານໄດ້ຖືກບັນທຶກເຂົ້າສູ່ Meta Business Suite Planner ແລ້ວ (ກຳນົດເວລາ: ${scheduleDate} ${scheduleTime}). ທ່ານສາມາດເປີດເບິ່ງໄດ້ໃນແພລນເນີທັນທີ!`
                      : 'ບົດຄວາມ ແລະ ຮູບພາບໄດ້ຖືກເຜີຍແຜ່ລົງເທິງໜ້າເພຈ Facebook ຮຽບຮ້ອຍແລ້ວ.'
                    : postResult.error}
                </p>
                {postResult.success && (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href="https://business.facebook.com/latest/content_calendar"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>ເປີດເບິ່ງໃນ Meta Business Suite Planner</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer font-lao"
          >
            ປິດ
          </button>

          <button
            type="button"
            onClick={handleExecutePost}
            disabled={isPosting || !currentConfig.isConnected}
            className={`py-3 px-6 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-xl transition-all cursor-pointer font-lao active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isKhoiHukJao
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
            }`}
          >
            {isPosting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>ກຳລັງສົ່ງຂໍ້ມູນໄປຍັງ Facebook...</span>
              </>
            ) : postMode === 'schedule' ? (
              <>
                <Calendar className="w-4 h-4 text-white" />
                <span>📅 ບັນທຶກລົງ Meta Planner</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>🚀 ເຜີຍແຜ່ໂພສທັນທີ</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
