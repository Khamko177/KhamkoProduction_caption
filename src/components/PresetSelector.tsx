import React from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { PresetItem } from '../types';
import { Flame } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: PresetItem) => void;
  currentCaption: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  currentCaption,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800/70">
        <Flame className="w-4 h-4 text-orange-400" />
        <h3 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
          Mẫu Caption gợi ý & Kinh điển (Click để dùng ngay)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
        {SAMPLE_PRESETS.map((item) => {
          const isSelected = (currentCaption || '').trim() === item.caption.trim();
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item)}
              className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 group cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/80 ring-1 ring-blue-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-blue-400 font-mono">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                {item.caption}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
