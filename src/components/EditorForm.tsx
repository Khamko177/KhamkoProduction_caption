import React, { useRef } from 'react';
import {
  CaptionConfig,
  AppType,
  AspectRatioType,
  NotificationItem,
  ChatMessage,
  MessageSide,
  TemplateType
} from '../types';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import {
  Type,
  Clock,
  LayoutTemplate,
  Sliders,
  RotateCcw,
  Sparkles,
  Ratio,
  Layers,
  FileText,
  MessageCircle,
  Bell,
  Plus,
  Trash2,
  ArrowLeftRight,
  SlidersHorizontal,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Sun,
  AlignCenter,
  AlignLeft,
  Palette,
  Lock
} from 'lucide-react';
import khoiHukJaoBannerUrl from '../KhoiHukJao/banner.jpg';

interface EditorFormProps {
  config: CaptionConfig;
  onChange: (updated: Partial<CaptionConfig>) => void;
  onReset: () => void;
}

export const EditorForm: React.FC<EditorFormProps> = ({
  config,
  onChange,
  onReset,
}) => {
  const isKhoiHukJao = config.brand === 'khoihukjao';

  const quoteInputRef = useRef<HTMLTextAreaElement>(null);
  const notifRefs = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ];

  const chatInputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Image Handlers (Khamko Production)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange({ customBgUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onChange({ customBgUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Direct Quote Handlers (Khoi Huk Jao)
  const handleQuoteChange = (text: string) => {
    const updatedNotifs = config.notifications.map((item, i) =>
      i === 0 ? { ...item, caption: text } : item
    );
    onChange({
      quoteText: text,
      notifications: updatedNotifs,
    });
  };

  const handleQuoteEmojiSelect = (emoji: string) => {
    const ref = quoteInputRef.current;
    const currentText = config.quoteText ?? config.notifications[0]?.caption ?? '';
    if (!ref) {
      handleQuoteChange(currentText + emoji);
      return;
    }

    const start = ref.selectionStart || 0;
    const end = ref.selectionEnd || 0;
    const updated = currentText.substring(0, start) + emoji + currentText.substring(end);
    handleQuoteChange(updated);

    setTimeout(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
  };

  // Notification Handlers
  const handleUpdateNotification = (
    index: number,
    updatedField: Partial<NotificationItem>
  ) => {
    const updatedNotifs = config.notifications.map((item, i) =>
      i === index ? { ...item, ...updatedField } : item
    );
    // Sync with quoteText if first notification
    if (index === 0 && updatedField.caption !== undefined) {
      onChange({
        notifications: updatedNotifs,
        quoteText: updatedField.caption,
      });
    } else {
      onChange({ notifications: updatedNotifs });
    }
  };

  const handleNotifEmojiSelect = (index: number, emoji: string) => {
    const notif = config.notifications[index];
    if (!notif) return;

    const ref = notifRefs[index]?.current;
    if (!ref) {
      handleUpdateNotification(index, { caption: notif.caption + emoji });
      return;
    }

    const start = ref.selectionStart || 0;
    const end = ref.selectionEnd || 0;
    const text = notif.caption;
    const updated = text.substring(0, start) + emoji + text.substring(end);
    handleUpdateNotification(index, { caption: updated });

    setTimeout(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
  };

  // Chat Handlers
  const handleAddChatMessage = (side: MessageSide = 'left') => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      side,
      text: side === 'left' ? 'ຂໍ້ຄວາມໃໝ່...' : 'ຕອບກັບ...',
    };
    onChange({ chatMessages: [...config.chatMessages, newMsg] });
  };

  const handleUpdateChatMessage = (id: string, text: string) => {
    const updated = config.chatMessages.map((m) =>
      m.id === id ? { ...m, text } : m
    );
    onChange({ chatMessages: updated });
  };

  const handleToggleChatSide = (id: string) => {
    const updated = config.chatMessages.map((m) =>
      m.id === id ? { ...m, side: (m.side === 'left' ? 'right' : 'left') as MessageSide } : m
    );
    onChange({ chatMessages: updated });
  };

  const handleDeleteChatMessage = (id: string) => {
    if (config.chatMessages.length <= 1) return;
    const updated = config.chatMessages.filter((m) => m.id !== id);
    onChange({ chatMessages: updated });
  };

  const handleChatEmojiSelect = (id: string, emoji: string) => {
    const msg = config.chatMessages.find((m) => m.id === id);
    if (!msg) return;

    const ref = chatInputRefs.current[id];
    if (!ref) {
      handleUpdateChatMessage(id, msg.text + emoji);
      return;
    }

    const start = ref.selectionStart || 0;
    const end = ref.selectionEnd || 0;
    const text = msg.text;
    const updated = text.substring(0, start) + emoji + text.substring(end);
    handleUpdateChatMessage(id, updated);

    setTimeout(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 10);
  };

  return (
    <div className="space-y-5 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Top Bar with Brand Badge & Reset button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <Type className={`w-4 h-4 ${isKhoiHukJao ? 'text-amber-400' : 'text-blue-400'}`} />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-lao">
            ເນື້ອຫາ & ປັບແຕ່ງ ({isKhoiHukJao ? 'Khoi Huk Jao' : 'Khamko Production'})
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-lao"
          title="ຣີເຊັດເປັນຄ່າເລີ່ມຕົ້ນ"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ຣີເຊັດ</span>
        </button>
      </div>

      {/* Font & Brand Notification Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 text-xs font-lao">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">ຟອນພາສາລາວ (Lao Font):</span>
          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {isKhoiHukJao ? 'Tiktok-Regular.ttf' : 'Noto Sans Lao'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {isKhoiHukJao ? '📌 Phôi Banner 1080x862' : '📌 Khung ảnh HD 1284x900'}
        </div>
      </div>

      {/* Main Template Mode Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
          <SlidersHorizontal className={`w-3.5 h-3.5 ${isKhoiHukJao ? 'text-amber-400' : 'text-blue-400'}`} />
          <span>ເລືອກຮູບແບບ (Template):</span>
        </label>
        <div className={`grid gap-2.5 font-lao ${isKhoiHukJao ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {/* Direct Quote Mode for Khoi Huk Jao */}
          {isKhoiHukJao && (
            <button
              type="button"
              onClick={() => onChange({ templateType: 'directQuote' })}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
                config.templateType === 'directQuote'
                  ? 'bg-amber-600/25 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ເທິງ Banner (Meme)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onChange({ templateType: 'notification' })}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
              config.templateType === 'notification'
                ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-blue-400" />
            <span>ແຈ້ງເຕືອນ (Notif)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ templateType: 'chat' })}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
              config.templateType === 'chat'
                ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span>ແຊັດ 2 ຂ້າງ (Chat)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖼️ BACKGROUND SECTION                                                      */}
      {/* - For Khoi Huk Jao: LOCKED to banner.jpg (cannot change)                  */}
      {/* - For Khamko: Solid Black or Custom Upload                                */}
      {/* ========================================================================= */}
      {isKhoiHukJao ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 font-lao">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>ຮູບພື້ນຫຼັງ Banner Khoi Huk Jao (ຄົງທີ່ / Cố định):</span>
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-lao">
              ມາດຕະຖານເພຈ
            </span>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <img
              src={khoiHukJaoBannerUrl}
              alt="Banner Khoi Huk Jao"
              className="w-16 h-12 object-cover rounded-md border border-slate-700 shadow-md shrink-0"
            />
            <div className="text-xs text-slate-300 font-lao space-y-0.5">
              <p className="font-semibold text-white">Phôi Banner ທາງການ (1080 × 862px)</p>
              <p className="text-slate-400 text-[11px] leading-snug">
                ທຸກໆໂພສຈະນຳໃຊ້ຮູບນີ້ໂດຍອັດຕະໂນມັດ ຕາມທີ່ທ່ານກຳນົດໄວ້.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-lao">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>ຮູບພື້ນຫຼັງ (Background Image):</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400 font-lao">
              {config.customBgUrl ? 'ຮູບພື້ນຫຼັງກຳນົດເອງ' : 'ສີດຳເລີ່ມຕົ້ນ (Default Black)'}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2.5 font-lao">
            <button
              type="button"
              onClick={handleRemoveBackground}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !config.customBgUrl
                  ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-600" />
              <span>ສີດຳເລີ່ມຕົ້ນ (Black)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                config.customBgUrl
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{config.customBgUrl ? 'ປ່ຽນຮູບໃໝ່' : 'ເລືອກຮູບຈາກເຄື່ອງ'}</span>
            </button>
          </div>

          {config.customBgUrl && (
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src={config.customBgUrl}
                    alt="Custom Background"
                    className="w-10 h-10 object-cover rounded-md border border-slate-700"
                  />
                  <span className="text-xs text-slate-300 font-lao">ໄດ້ເລືອກຮູບພື້ນຫຼັງແລ້ວ</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors flex items-center gap-1 cursor-pointer font-lao"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ລຶບຮູບ</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-lao">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>ຄວາມມືດພື້ນຫຼັງ (Darkness):</span>
                  </span>
                  <span className="font-mono text-blue-400 font-bold">
                    {Math.round(config.bgOverlayOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.05"
                  value={config.bgOverlayOpacity}
                  onChange={(e) => onChange({ bgOverlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-lao">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>ຄວາມມົວພື້ນຫຼັງ (Blur):</span>
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {config.bgBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={config.bgBlur}
                  onChange={(e) => onChange({ bgBlur: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 TEMPLATE CONTENT CONTROLS                                               */}
      {/* ========================================================================= */}

      {/* --- A. DIRECT QUOTE MODE (KHOI HUK JAO BANNER QUOTE) --- */}
      {isKhoiHukJao && config.templateType === 'directQuote' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-lao">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>ເນື້ອຫາແຄັບຊັ່ນ (ຂຽນລົງ Banner ໂດຍກົງ):</span>
              </label>
              <EmojiPickerPopover onSelectEmoji={handleQuoteEmojiSelect} />
            </div>

            <textarea
              ref={quoteInputRef}
              rows={4}
              value={config.quoteText ?? config.notifications[0]?.caption ?? ''}
              onChange={(e) => handleQuoteChange(e.target.value)}
              placeholder="ພິມຂໍ້ຄວາມແຄັບຊັ່ນ Khoi Huk Jao ຢູ່ນີ້..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-tiktok placeholder:text-slate-500 leading-relaxed"
            />

            {/* Formatting: Text Alignment & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              {/* Alignment */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 font-lao flex items-center gap-1">
                  <AlignCenter className="w-3 h-3" /> ຈັດຕຳແໜ່ງຂໍ້ຄວາມ:
                </span>
                <div className="grid grid-cols-2 gap-2 font-lao">
                  <button
                    type="button"
                    onClick={() => onChange({ quoteTextAlign: 'center' })}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      (config.quoteTextAlign || 'center') === 'center'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>ເຄິ່ງກາງ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ quoteTextAlign: 'left' })}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      config.quoteTextAlign === 'left'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>ຂອບຊ້າຍ</span>
                  </button>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 font-lao flex items-center gap-1">
                  <Palette className="w-3 h-3" /> ສີຕົວໜັງສື:
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#111827', label: 'ດຳເຂັ້ມ' },
                    { color: '#000000', label: 'ດຳສະໜິດ' },
                    { color: '#1e3a8a', label: 'ນ້ຳເງິນ' },
                    { color: '#881337', label: 'ແດງເລືອດໝູ' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => onChange({ quoteTextColor: item.color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        (config.quoteTextColor || '#111827') === item.color
                          ? 'scale-110 border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- B. NOTIFICATION MODE --- */}
      {config.templateType === 'notification' && (
        <div className="space-y-4">
          {/* Mode Switcher: Single vs Double Cards */}
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>ຈຳນວນແຈ້ງເຕືອນ:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onChange({ mode: 'single' })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all font-lao cursor-pointer ${
                  config.mode === 'single'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1 ແຈ້ງເຕືອນ
              </button>
              <button
                type="button"
                onClick={() => onChange({ mode: 'double' })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all font-lao cursor-pointer ${
                  config.mode === 'double'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2 ແຈ້ງເຕືອນ
              </button>
            </div>
          </div>

          {/* Notification Cards */}
          {config.notifications
            .slice(0, config.mode === 'double' ? 2 : 1)
            .map((notif, index) => (
              <div
                key={notif.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-lao">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span>ແຈ້ງເຕືອນທີ {index + 1}</span>
                  </span>
                  <EmojiPickerPopover
                    onSelectEmoji={(emoji) => handleNotifEmojiSelect(index, emoji)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400 font-lao">
                      ຊື່ເພຈ (Page Title):
                    </label>
                    <input
                      type="text"
                      value={notif.pageTitle}
                      onChange={(e) =>
                        handleUpdateNotification(index, { pageTitle: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-lao"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400 font-lao">
                      ເວລາ (Timestamp):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={notif.timestamp}
                        onChange={(e) =>
                          handleUpdateNotification(index, { timestamp: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      {['now', '2m', '5m'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleUpdateNotification(index, { timestamp: time })}
                          className="px-2 py-1.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 font-lao">
                    ໄອຄອນແອັບ (App Icon):
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 font-lao">
                    {[
                      { type: 'messenger', label: 'Messenger' },
                      { type: 'facebook', label: 'Facebook' },
                      { type: 'instagram', label: 'Instagram' },
                      { type: 'tiktok', label: 'TikTok' },
                      { type: 'messages', label: 'iMessage' },
                    ].map((app) => (
                      <button
                        key={app.type}
                        type="button"
                        onClick={() =>
                          handleUpdateNotification(index, { appType: app.type as AppType })
                        }
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          notif.appType === app.type
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 font-lao">
                    ຂໍ້ຄວາມແຄັບຊັ່ນ (Caption):
                  </label>
                  <textarea
                    ref={notifRefs[index]}
                    rows={3}
                    value={notif.caption}
                    onChange={(e) =>
                      handleUpdateNotification(index, { caption: e.target.value })
                    }
                    placeholder="ພິມແຄັບຊັ່ນຢູ່ບ່ອນນີ້..."
                    className={`w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 leading-relaxed ${
                      isKhoiHukJao ? 'font-tiktok' : 'font-lao'
                    }`}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* --- C. CHAT MODE (MESSENGER CHAT) --- */}
      {config.templateType === 'chat' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
              <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>ລາຍການຂໍ້ຄວາມແຊັດ ({config.chatMessages.length} ຂໍ້ຄວາມ):</span>
            </label>
            <div className="flex items-center gap-2 font-lao">
              <button
                type="button"
                onClick={() => handleAddChatMessage('left')}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                <span>ຕື່ມຂໍ້ຄວາມ (ຊ້າຍ)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddChatMessage('right')}
                className="text-[11px] bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-blue-400" />
                <span>ຕື່ມຂໍ້ຄວາມ (ຂວາ)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {config.chatMessages.map((msg, index) => {
              const isRight = msg.side === 'right';
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isRight
                      ? 'bg-blue-950/20 border-blue-900/60 ml-4'
                      : 'bg-slate-950/60 border-slate-800 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/60 font-lao">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleChatSide(msg.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer border ${
                          isRight
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                        <span>{isRight ? 'ຝັ່ງຂວາ (ສີຟ້າ)' : 'ຝັ່ງຊ້າຍ (ສີເທົາ)'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <EmojiPickerPopover
                        onSelectEmoji={(emoji) => handleChatEmojiSelect(msg.id, emoji)}
                      />
                      {config.chatMessages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChatMessage(msg.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="ລຶບຂໍ້ຄວາມ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    ref={(el) => (chatInputRefs.current[msg.id] = el)}
                    rows={2}
                    value={msg.text}
                    onChange={(e) => handleUpdateChatMessage(msg.id, e.target.value)}
                    placeholder="ພິມຂໍ້ຄວາມແຊັດ..."
                    className={`w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 leading-relaxed ${
                      isKhoiHukJao ? 'font-tiktok' : 'font-lao'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ COMMON TYPOGRAPHY & SIZE CONTROLS                                       */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-lao">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>ຂະໜາດຕົວໜັງສື (Font Size):</span>
          </label>
          <button
            type="button"
            onClick={() => onChange({ autoFontSize: !config.autoFontSize })}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer font-lao ${
              config.autoFontSize
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {config.autoFontSize ? '✓ ປັບອັດຕະໂນມັດ (Auto)' : 'ປັບເອງ (Manual)'}
          </button>
        </div>

        {!config.autoFontSize && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="72"
              step="2"
              value={config.fontSize}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
