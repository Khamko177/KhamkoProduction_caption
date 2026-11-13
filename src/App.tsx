import React, { useState } from 'react';
import { CaptionConfig, BrandType, PresetItem } from './types';
import { Header } from './components/Header';
import { EditorForm } from './components/EditorForm';
import { ImagePreview } from './components/ImagePreview';
import { PresetSelector } from './components/PresetSelector';
import { BrandSelector } from './components/BrandSelector';
import { BatchExportModal } from './components/BatchExportModal';
import { Sparkles, Zap } from 'lucide-react';

const KHAMKO_DEFAULT_CONFIG: CaptionConfig = {
  brand: 'khamko',
  templateType: 'notification',
  customBgUrl: null,
  bgOverlayOpacity: 0.4,
  bgBlur: 0,
  mode: 'single',
  notifications: [
    {
      id: 'notif-1',
      pageTitle: 'Khamko Production',
      timestamp: 'now',
      caption: 'ບໍ່ແມ່ນຂ້ອຍຖືກເຂົາຫລີ້ນຂອງໃສ່ບໍ? ຄືມາຄິດຮອດເຂົາເຊົ້າແລງແທະ🫠',
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

const KHOIHUKJAO_DEFAULT_CONFIG: CaptionConfig = {
  brand: 'khoihukjao',
  templateType: 'directQuote',
  quoteText: 'ຖ້າເຈົ້າເຫງົາ ໃຫ້ຄິດຮອດເຮົາ... ແຕ່ຖ້າເຈົ້າຢາກເມົາ ໃຫ້ໂທຫາໝູ່ເຈົ້າເດີ 🍻🤣',
  quoteTextAlign: 'center',
  quoteTextColor: '#111827',
  customBgUrl: null,
  bgOverlayOpacity: 0,
  bgBlur: 0,
  mode: 'single',
  notifications: [
    {
      id: 'notif-1',
      pageTitle: 'Khoi Huk Jao',
      timestamp: 'now',
      caption: 'ຖ້າເຈົ້າເຫງົາ ໃຫ້ຄິດຮອດເຮົາ... ແຕ່ຖ້າເຈົ້າຢາກເມົາ ໃຫ້ໂທຫາໝູ່ເຈົ້າເດີ 🍻🤣',
      appType: 'messenger',
    },
    {
      id: 'notif-2',
      pageTitle: 'Khoi Huk Jao',
      timestamp: 'now',
      caption: 'ໜ້າຕາອາດຊິບໍ່ຄືດາລາ ແຕ່ເລື່ອງເຮັດໃຫ້ເຈົ້າຫົວຂວັນ ຮັບປະກັນອັນດັບ 1 🤪✨',
      appType: 'messenger',
    },
  ],
  chatMessages: [
    {
      id: 'chat-1',
      side: 'left',
      text: 'ຮັກກູບໍ່ສ່ຽວ?',
    },
    {
      id: 'chat-2',
      side: 'right',
      text: 'ຮັກຕວົະ ຖາມແປກໆ',
    },
    {
      id: 'chat-3',
      side: 'left',
      text: 'ຢືມເງິນແດ່ 500,000',
    },
    {
      id: 'chat-4',
      side: 'right',
      text: 'ອັນນັ້ນບໍ່ຮັກລະ ບາຍຍຍ 🤣🏃‍♂️💨',
    },
  ],
  showBottomBar: false,
  fontSize: 48,
  autoFontSize: true,
  cardTheme: 'dark',
  aspectRatio: 'original',
};

export const App: React.FC = () => {
  // Option selection view on initial entrance
  const [showBrandSelector, setShowBrandSelector] = useState<boolean>(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<BrandType>('khamko');
  const [config, setConfig] = useState<CaptionConfig>(KHAMKO_DEFAULT_CONFIG);

  const handleSelectBrand = (brand: BrandType) => {
    setCurrentBrand(brand);
    setShowBrandSelector(false);
    if (brand === 'khoihukjao') {
      setConfig(KHOIHUKJAO_DEFAULT_CONFIG);
    } else {
      setConfig(KHAMKO_DEFAULT_CONFIG);
    }
  };

  const handleSwitchBrand = (brand: BrandType) => {
    setCurrentBrand(brand);
    setShowBrandSelector(false);
    if (brand === 'khoihukjao') {
      setConfig((prev) => ({
        ...KHOIHUKJAO_DEFAULT_CONFIG,
        quoteText: prev.notifications[0]?.caption || KHOIHUKJAO_DEFAULT_CONFIG.quoteText,
        notifications: prev.notifications.map((n, i) =>
          i === 0 ? { ...n, pageTitle: 'Khoi Huk Jao' } : n
        ),
      }));
    } else {
      setConfig((prev) => ({
        ...KHAMKO_DEFAULT_CONFIG,
        notifications: prev.notifications.map((n, i) =>
          i === 0 ? { ...n, pageTitle: 'Khamko Production' } : n
        ),
      }));
    }
  };

  const handleConfigChange = (updated: Partial<CaptionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    if (currentBrand === 'khoihukjao') {
      setConfig(KHOIHUKJAO_DEFAULT_CONFIG);
    } else {
      setConfig(KHAMKO_DEFAULT_CONFIG);
    }
  };

  const handleSelectPreset = (preset: PresetItem) => {
    if (currentBrand === 'khoihukjao') {
      setConfig((prev) => ({
        ...prev,
        quoteText: preset.caption,
        notifications: prev.notifications.map((item, i) =>
          i === 0 ? { ...item, caption: preset.caption } : item
        ),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        notifications: prev.notifications.map((item, i) =>
          i === 0 ? { ...item, caption: preset.caption } : item
        ),
      }));
    }
  };

  const currentCaption = config.quoteText || config.notifications[0]?.caption || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Header */}
      <Header
        currentBrand={currentBrand}
        onChangeBrand={handleSwitchBrand}
        onOpenBrandSelector={() => setShowBrandSelector(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Main Workspace or Brand Selector Screen */}
      {showBrandSelector ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <BrandSelector
            onSelectBrand={handleSelectBrand}
            currentBrand={currentBrand}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Form Controls, Batch Banner & Presets */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Batch Export CTA Banner */}
              <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-yellow-300 shrink-0 shadow-md">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-lao">
                      ສ້າງຫຼາຍຮູບພາບພ້ອມກັນ & ດາວໂຫຼດ .ZIP
                    </h4>
                    <p className="text-[11px] text-slate-400 font-lao">
                      Import ໄຟລ໌ .txt/.csv ຫຼື ວາງຫຼາຍແຄັບຊັ່ນເພື່ອສ້າງຮູບພາບພ້ອມກັນ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-lao shadow-md transition-all shrink-0 cursor-pointer"
                >
                  ເປີດເຄື່ອງມື ⚡
                </button>
              </div>

              <EditorForm
                config={config}
                onChange={handleConfigChange}
                onReset={handleReset}
              />

              <PresetSelector
                brand={currentBrand}
                onSelectPreset={handleSelectPreset}
                currentCaption={currentCaption}
              />
            </div>

            {/* Right Column: Sticky Live Preview */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
              <ImagePreview config={config} />
            </div>

          </div>
        </main>
      )}

      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        baseConfig={config}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-lao">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Khamko Studio & Khoi Huk Jao Meme Generator</span>
          </div>
          <p className="flex items-center gap-1">
            {currentBrand === 'khoihukjao' ? (
              <>
                ອອກແບບສະເພາະສຳລັບ <strong className="text-amber-400">Khoi Huk Jao (ຂ້ອຍຮັກເຈົ້າ)</strong> • ຟອນ TikTok Regular
              </>
            ) : (
              <>
                ອອກແບບສະເພາະສຳລັບ <strong className="text-slate-400">Khamko Production</strong> • ຟອນ Noto Sans Lao
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
