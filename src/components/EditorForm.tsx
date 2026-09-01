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
  Sun
} from 'lucide-react';

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
  const notifRefs = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ];

  const chatInputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Image Handlers
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

  // 1. Notification Handlers
  const handleUpdateNotification = (
    index: number,
    updatedField: Partial<NotificationItem>
  ) => {
    const updatedNotifs = config.notifications.map((item, i) =>
      i === index ? { ...item, ...updatedField } : item
    );
    onChange({ notifications: updatedNotifs });
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

  // 2. Chat Handlers
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
      {/* Top Bar with Reset button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-lao">
            ເນື້ອຫາ & ປັບແຕ່ງ
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

      {/* Main Template Mode Switcher (Notification vs Chat) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>ເລືອກປະເພດຮູບແບບ (Template):</span>
        </label>
        <div className="grid grid-cols-2 gap-3 font-lao">
          <button
            type="button"
            onClick={() => onChange({ templateType: 'notification' })}
            className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              config.templateType === 'notification'
                ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-blue-400" />
            <span>ແຈ້ງເຕືອນ (Notification)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ templateType: 'chat' })}
            className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              config.templateType === 'chat'
                ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span>ແຊັດ 2 ຂ້າງ (Messenger Chat)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖼️ BACKGROUND CUSTOMIZATION SECTION (AVAILABLE FOR BOTH TEMPLATES)         */}
      {/* ========================================================================= */}
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

        {/* Custom Background Settings when image is uploaded */}
        {config.customBgUrl && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            {/* Thumbnail Preview */}
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

            {/* Darkness Overlay Slider */}
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
                min={0}
                max={0.9}
                step={0.05}
                value={config.bgOverlayOpacity}
                onChange={(e) => onChange({ bgOverlayOpacity: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Blur Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-lao">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>ຄວາມມົວພື້ນຫຼັງ (Blur):</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {config.bgBlur || 0}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={config.bgBlur || 0}
                onChange={(e) => onChange({ bgBlur: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. NOTIFICATION TEMPLATE FORM                                              */}
      {/* ========================================================================= */}
      {config.templateType === 'notification' && (
        <div className="space-y-4">
          {/* Notification Count Toggle: Single or Double */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 font-lao">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>ຈຳນວນແຈ້ງເຕືອນ:</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 font-lao">
              <button
                type="button"
                onClick={() => onChange({ mode: 'single' })}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  config.mode === 'single'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1 ແຈ້ງເຕືອນ</span>
              </button>

              <button
                type="button"
                onClick={() => onChange({ mode: 'double' })}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  config.mode === 'double'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2 ແຈ້ງເຕືອນ (ຊ້ອນກັນ)</span>
              </button>
            </div>
          </div>

          {/* Form fields for notifications */}
          {config.notifications.slice(0, config.mode === 'double' ? 2 : 1).map((notif, index) => (
            <div
              key={notif.id}
              className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4"
            >
              {config.mode === 'double' && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-blue-400 font-lao flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[11px] font-mono">
                      {index + 1}
                    </span>
                    <span>ແຈ້ງເຕືອນທີ {index + 1} {index === 0 ? '(ເທິງ)' : '(ລຸ່ມ)'}</span>
                  </span>
                </div>
              )}

              {/* Caption */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
                    <span>ເນື້ອຫາແຄັບຊັ່ນ {config.mode === 'double' ? `#${index + 1}` : ''}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono font-lao">
                    {notif.caption.length} ຕົວອັກສອນ
                  </span>
                </div>

                <textarea
                  ref={notifRefs[index]}
                  rows={config.mode === 'double' ? 3 : 4}
                  value={notif.caption}
                  onChange={(e) =>
                    handleUpdateNotification(index, { caption: e.target.value })
                  }
                  placeholder={`ພິມເນື້ອຫາແຄັບຊັ່ນທີ ${index + 1}...`}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm sm:text-base text-slate-100 placeholder-slate-500 resize-y transition-all font-lao leading-relaxed outline-none"
                />

                <EmojiPickerPopover
                  onSelectEmoji={(emoji) => handleNotifEmojiSelect(index, emoji)}
                />
              </div>

              {/* Sender & Timestamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
                    <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ຊື່ຜູ້ສົ່ງ</span>
                  </label>
                  <input
                    type="text"
                    value={notif.pageTitle}
                    onChange={(e) =>
                      handleUpdateNotification(index, { pageTitle: e.target.value })
                    }
                    placeholder="Khamko Production"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-lao"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ເວລາ</span>
                  </label>
                  <input
                    type="text"
                    value={notif.timestamp}
                    onChange={(e) =>
                      handleUpdateNotification(index, { timestamp: e.target.value })
                    }
                    placeholder="now, 1m, ດຽວນີ້..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-lao"
                  />
                </div>
              </div>

              {/* App Icon */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ໄອຄອນແອັບ</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'messenger', label: 'Messenger' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'tiktok', label: 'TikTok' },
                    { id: 'messages', label: 'Messages' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() =>
                        handleUpdateNotification(index, { appType: app.id as AppType })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        notif.appType === app.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHAT TEMPLATE FORM                                                     */}
      {/* ========================================================================= */}
      {config.templateType === 'chat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 font-lao">
              ລາຍການຂໍ້ຄວາມແຊັດ ({config.chatMessages.length}):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddChatMessage('left')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-lao"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>+ ຝັ່ງຊ້າຍ (ສີເທົາ)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddChatMessage('right')}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 transition-all shadow-md shadow-blue-500/20 cursor-pointer font-lao"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ຝັ່ງຂວາ (ສີຟ້າ)</span>
              </button>
            </div>
          </div>

          {/* List of chat messages */}
          <div className="space-y-3">
            {config.chatMessages.map((msg, index) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  msg.side === 'right'
                    ? 'bg-blue-950/30 border-blue-600/40 ring-1 ring-blue-500/20'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-lao ${
                        msg.side === 'right'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {msg.side === 'right' ? 'ຝັ່ງຂວາ (ສີຟ້າ / ຕອບກັບ)' : 'ຝັ່ງຊ້າຍ (ສີເທົາ)'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleChatSide(msg.id)}
                      className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition-colors cursor-pointer font-lao"
                      title="ສະຫຼັບຝັ່ງຊ້າຍ / ຂວາ"
                    >
                      <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
                      <span>ສະຫຼັບຝັ່ງ</span>
                    </button>

                    {config.chatMessages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteChatMessage(msg.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="ລຶບຂໍ້ຄວາມນີ້"
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
                  className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 resize-y transition-all font-lao outline-none"
                />

                <EmojiPickerPopover
                  onSelectEmoji={(emoji) => handleChatEmojiSelect(msg.id, emoji)}
                />
              </div>
            ))}
          </div>

          {/* Bottom Bar Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.showBottomBar}
                onChange={(e) => onChange({ showBottomBar: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs text-slate-300 font-lao">
                ສະແດງແຖບພິມຂໍ້ຄວາມ Messenger ດ້ານລຸ່ມ (Bottom Chat Bar)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Global Controls: Font Size & Aspect Ratio */}
      <div className="pt-3 border-t border-slate-800/70 space-y-4">
        {/* Font size control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>ຂະໜາດໂຕໜັງສື:</span>
              <span className="text-xs font-mono text-blue-400 font-bold font-lao">
                {config.fontSize}px
              </span>
            </label>
          </div>

          <input
            type="range"
            min={22}
            max={54}
            step={1}
            value={config.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value), autoFontSize: false })}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
            <Ratio className="w-3.5 h-3.5 text-purple-400" />
            <span>ອັດຕາສ່ວນຮູບພາບ (Aspect Ratio)</span>
          </label>
          <div className="grid grid-cols-3 gap-2 font-lao">
            {[
              { id: 'original', label: 'ຕົ້ນສະບັບ (Original)' },
              { id: '1:1', label: 'ສີ່ຫຼ່ຽມ 1:1' },
              { id: '16:9', label: 'ລວງນອນ 16:9' },
            ].map((ratio) => (
              <button
                key={ratio.id}
                type="button"
                onClick={() => onChange({ aspectRatio: ratio.id as AspectRatioType })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  config.aspectRatio === ratio.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
