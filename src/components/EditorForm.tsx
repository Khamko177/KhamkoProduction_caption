import React, { useRef } from 'react';
import { CaptionConfig, AppType, AspectRatioType, NotificationItem } from '../types';
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
  FileText
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
  const textareaRefs = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ];

  const handleUpdateNotification = (
    index: number,
    updatedField: Partial<NotificationItem>
  ) => {
    const updatedNotifs = config.notifications.map((item, i) =>
      i === index ? { ...item, ...updatedField } : item
    );
    onChange({ notifications: updatedNotifs });
  };

  const handleEmojiSelect = (index: number, emoji: string) => {
    const notif = config.notifications[index];
    if (!notif) return;

    const ref = textareaRefs[index]?.current;
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

  const activeNotifCount = config.mode === 'double' ? 2 : 1;

  return (
    <div className="space-y-5 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header section of form */}
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

      {/* Mode Selector: Single or Double Notifications */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-lao">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>ຮູບແບບການສະແດງ (ຈຳນວນແຈ້ງເຕືອນ):</span>
        </label>
        <div className="grid grid-cols-2 gap-3 font-lao">
          <button
            type="button"
            onClick={() => onChange({ mode: 'single' })}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              config.mode === 'single'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1 ແຈ້ງເຕືອນ (Single)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ mode: 'double' })}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              config.mode === 'double'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2 ແຈ້ງເຕືອນ (Double)</span>
          </button>
        </div>
      </div>

      {/* Notifications Editor Sections */}
      {config.notifications.slice(0, activeNotifCount).map((notif, index) => (
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

          {/* Main Caption Input */}
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
              ref={textareaRefs[index]}
              rows={config.mode === 'double' ? 3 : 4}
              value={notif.caption}
              onChange={(e) =>
                handleUpdateNotification(index, { caption: e.target.value })
              }
              placeholder={`ພິມເນື້ອຫາແຄັບຊັ່ນທີ ${index + 1}...`}
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm sm:text-base text-slate-100 placeholder-slate-500 resize-y transition-all font-lao leading-relaxed outline-none"
            />

            {/* Quick Emoji Bar */}
            <EmojiPickerPopover
              onSelectEmoji={(emoji) => handleEmojiSelect(index, emoji)}
            />
          </div>

          {/* Sender Name & Timestamp Row */}
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

          {/* App Type Selector */}
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

      {/* Global Controls: Font Size & Aspect Ratio */}
      <div className="pt-3 border-t border-slate-800/70 space-y-4">
        {/* Font size control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 font-lao">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>ຂະໜາດໂຕໜັງສື:</span>
              <span className="text-xs font-mono text-blue-400 font-bold font-lao">
                {config.autoFontSize ? 'ອັດຕະໂນມັດ (Auto)' : `${config.fontSize}px`}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoFontSize}
                onChange={(e) => onChange({ autoFontSize: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-xs text-slate-400 font-lao">ປັບອັດຕະໂນມັດຕາມຄວາມຍາວ</span>
            </label>
          </div>

          {!config.autoFontSize && (
            <input
              type="range"
              min={22}
              max={54}
              step={1}
              value={config.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          )}
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
