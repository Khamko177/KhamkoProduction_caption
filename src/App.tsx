import React, { useState } from 'react';
import { CaptionConfig, PresetItem } from './types';
import { Header } from './components/Header';
import { EditorForm } from './components/EditorForm';
import { ImagePreview } from './components/ImagePreview';
import { PresetSelector } from './components/PresetSelector';
import { Sparkles } from 'lucide-react';

const DEFAULT_CONFIG: CaptionConfig = {
  pageTitle: 'Khamko Production',
  timestamp: 'now',
  caption: 'ບໍ່ແມ່ນຂ້ອຍຖືກເຂົາຫລີ້ນຂອງໃສ່ບໍ? ຄືມາຄິດຮອດເຂົາເຊົ້າແລງແທະ🫠',
  fontSize: 38,
  autoFontSize: true,
  appType: 'messenger',
  cardTheme: 'dark',
  aspectRatio: 'original',
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<CaptionConfig>(DEFAULT_CONFIG);

  const handleConfigChange = (updated: Partial<CaptionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleSelectPreset = (preset: PresetItem) => {
    setConfig((prev) => ({
      ...prev,
      caption: preset.caption,
      timestamp: preset.timestamp || 'now',
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-6 space-y-6">
            <EditorForm
              config={config}
              onChange={handleConfigChange}
              onReset={handleReset}
            />

            <PresetSelector
              onSelectPreset={handleSelectPreset}
              currentCaption={config.caption}
            />
          </div>

          {/* Right Column: Sticky Live Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            <ImagePreview config={config} />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-lao">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Khamko Caption & Meme Image Generator</span>
          </div>
          <p className="flex items-center gap-1">
            ອອກແບບພິເສດສະເພາະສຳລັບ <strong className="text-slate-400">Khamko Production</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
