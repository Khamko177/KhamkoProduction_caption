import React from 'react';
import { BrandType } from '../types';
import { MessageSquareText, Sparkles, RefreshCw, Zap, Facebook } from 'lucide-react';
import khoiHukJaoBannerUrl from '../KhoiHukJao/banner.jpg';

interface HeaderProps {
  currentBrand: BrandType;
  onChangeBrand: (brand: BrandType) => void;
  onOpenBrandSelector: () => void;
  onOpenBatchModal: () => void;
  onOpenFacebookSettings?: () => void;
  isFacebookConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentBrand,
  onChangeBrand,
  onOpenBrandSelector,
  onOpenBatchModal,
  onOpenFacebookSettings,
  isFacebookConnected = false,
}) => {
  const isKhamko = currentBrand === 'khamko';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          {isKhamko ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
              <MessageSquareText className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#e5e5e5] shadow-lg shadow-amber-500/20 shrink-0 border border-slate-700 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${khoiHukJaoBannerUrl})`,
                  backgroundPosition: '-8px -3px',
                  backgroundSize: '410px auto',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 font-lao">
                {isKhamko ? 'Khamko Production' : 'Khoi Huk Jao'}
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full font-lao border ${
                    isKhamko
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isKhamko ? 'ສະຕູດິໂອ ມີມ' : 'ຂ້ອຍຮັກເຈົ້າ ຕະຫຼົກ'}
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium font-lao hidden sm:block">
              {isKhamko
                ? 'ລະບົບສ້າງຮູບພາບແຄັບຊັ່ນ ແລະ ແຈ້ງເຕືອນແບບມືອາຊີບ'
                : 'ສ້າງແຄັບຊັ່ນເທິງ Phôi Banner ທາງການ • ຟອນ TikTok Regular'}
            </p>
          </div>
        </div>

        {/* Right: Brand Switcher & Page Selector */}
        <div className="flex items-center gap-2">
          {/* Quick Toggle Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeBrand('khamko')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-lao cursor-pointer flex items-center gap-1.5 ${
                isKhamko
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🎬 Khamko</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeBrand('khoihukjao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-lao cursor-pointer flex items-center gap-1.5 ${
                !isKhamko
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🧢 Khoi Huk Jao</span>
            </button>
          </div>

          {/* Batch Generator (.ZIP) Button */}
          <button
            type="button"
            onClick={onOpenBatchModal}
            className={`flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl font-lao transition-all shadow-md active:scale-95 cursor-pointer ${
              isKhamko
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25 ring-1 ring-white/20'
                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-500/25 ring-1 ring-white/20'
            }`}
            title="ສ້າງຫຼາຍຮູບພາບພ້ອມກັນ & ດາວໂຫຼດ ZIP"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>ສ້າງຫຼາຍຮູບ (ZIP)</span>
          </button>

          {/* Facebook Settings / Meta Planner Button */}
          {onOpenFacebookSettings && (
            <button
              type="button"
              onClick={onOpenFacebookSettings}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-lao transition-all border shadow-sm cursor-pointer ${
                isFacebookConnected
                  ? 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-500/40 hover:border-blue-400'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/80 hover:border-slate-600'
              }`}
              title="ຕັ້ງຄ່າເຊື່ອມຕໍ່ Facebook Graph API & Meta Planner"
            >
              <Facebook className={`w-3.5 h-3.5 ${isFacebookConnected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Meta Planner</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isFacebookConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
            </button>
          )}

          {/* Change Page Button */}
          <button
            type="button"
            onClick={onOpenBrandSelector}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-3 py-2 rounded-xl font-lao transition-all shadow-sm cursor-pointer"
            title="ປ່ຽນໜ້າເລືອກເພຈ"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">ປ່ຽນເພຈ</span>
          </button>

          {/* HD Quality indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-xl font-lao">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>HD ຄົມຊັດ 100%</span>
          </div>
        </div>

      </div>
    </header>
  );
};
