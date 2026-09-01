import React from 'react';
import { COMMON_EMOJIS } from '../data/presets';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPickerPopover: React.FC<EmojiPickerProps> = ({ onSelectEmoji }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/90 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium px-1 mr-1">
        <Smile className="w-3.5 h-3.5 text-amber-400" />
        <span>Emoji nhanh:</span>
      </div>
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelectEmoji(emoji)}
          className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-800 active:scale-90 transition-all cursor-pointer hover:shadow-sm"
          title={`Thêm ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
