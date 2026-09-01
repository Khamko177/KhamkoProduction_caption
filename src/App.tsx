import React, { useState } from 'react';
import { CaptionConfig } from './types';
import { Header } from './components/Header';
import { EditorForm } from './components/EditorForm';
import { ImagePreview } from './components/ImagePreview';
import { Sparkles } from 'lucide-react';

const DEFAULT_CONFIG: CaptionConfig = {
  templateType: 'chat',
  customBgUrl: null,
  bgOverlayOpacity: 0.4,
  bgBlur: 0,
  mode: 'double',
  notifications: [
    {
      id: 'notif-1',
      pageTitle: 'Khamko Production',
      timestamp: 'now',
      caption: 'ກົດຂໍ້ 1',
      appType: 'messenger',
    },
    {
      id: 'notif-2',
      pageTitle: 'Khamko Production',
      timestamp: 'now',
      caption: 'ຫ້າມຕົກຫລຸມຮັກ ສິ່ງທີ່ຮູັ້ຢູ່ແລ້ວ ວ່າບໍ່ມີທາງ ສົມຫວັງ🥀❤️',
      appType: 'messenger',
    },
  ],
  chatMessages: [
    {
      id: 'chat-1',
      side: 'left',
      text: 'ບໍ່ເປັນຫຍັງສ່ຽວເຮົາເປັນໝູ່ກັນ',
    },
    {
      id: 'chat-2',
      side: 'left',
      text: 'ກູກະຮັກມຶງຄືເກົ່າ',
    },
    {
      id: 'chat-3',
      side: 'right',
      text: 'ຄືເກົ່າຫັ້ນແຫລະສ່ຽວ',
    },
    {
      id: 'chat-4',
      side: 'right',
      text: 'ວ່າແຕ່ມີຈັກສອງແສນໃຫ້ຢືມບໍສ່ຽວ??',
    },
  ],
  showBottomBar: true,
  fontSize: 38,
  autoFontSize: true,
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

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <EditorForm
              config={config}
              onChange={handleConfigChange}
              onReset={handleReset}
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
