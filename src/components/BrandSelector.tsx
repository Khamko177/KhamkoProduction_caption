import React from 'react';
import { BrandType } from '../types';
import { MessageSquareText, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import khoiHukJaoBannerUrl from '../KhoiHukJao/banner.jpg';

interface BrandSelectorProps {
  onSelectBrand: (brand: BrandType) => void;
  currentBrand?: BrandType;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  onSelectBrand,
  currentBrand,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 font-lao animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        <span>ລະບົບສ້າງແຄັບຊັ່ນ & ມີມອັດຕະໂນມັດ</span>
      </div>

      {/* Main Heading */}
      <div className="text-center max-w-2xl mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-lao leading-tight">
          ເລືອກເພຈທີ່ຕ້ອງການສ້າງແຄັບຊັ່ນ
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-lao">
          ກະລຸນາເລືອກ 1 ໃນ 2 ຕົວເລືອກດ້ານລຸ່ມ ເພື່ອເຂົ້າສູ່ໜ້າຕາ ແລະ ຮູບແບບການສ້າງແຄັບຊັ່ນສະເພາະຂອງແຕ່ລະເພຈ
        </p>
      </div>

      {/* 2 Big Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* OPTION 1: Khamko Production */}
        <div
          onClick={() => onSelectBrand('khamko')}
          className={`group relative rounded-3xl p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xl hover:scale-[1.02] ${
            currentBrand === 'khamko'
              ? 'bg-slate-900/90 border-blue-500 ring-2 ring-blue-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900/80'
          }`}
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/25 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 font-lao">
                ຕົວເລືອກທີ 1
              </span>
              {currentBrand === 'khamko' && (
                <span className="flex items-center gap-1 text-xs text-blue-400 font-semibold font-lao">
                  <CheckCircle2 className="w-4 h-4" /> ກຳລັງເລືອກ
                </span>
              )}
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 mb-5 group-hover:rotate-2 transition-transform">
              <MessageSquareText className="w-8 h-8 text-white" />
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-white font-lao mb-2 group-hover:text-blue-300 transition-colors">
              Khamko Production
            </h2>
            <p className="text-sm text-slate-400 font-lao leading-relaxed mb-6">
              ສ້າງຮູບພາບແຄັບຊັ່ນ ແລະ ມີມແບບ <strong>ແຈ້ງເຕືອນ iOS</strong> & <strong>ແຊທ Messenger</strong>. ປັບແຕ່ງພື້ນຫຼັງສີດຳ ຫຼື ອັບໂຫຼດຮູບພາບສ່ວນຕົວ, ຟອນມາດຕະຖານ Noto Sans Lao.
            </p>

            {/* Feature Highlights */}
            <ul className="space-y-2 mb-6 text-xs text-slate-300 font-lao">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>ຮູບແບບແຈ້ງເຕືອນ iOS (1 ຫຼື 2 ແຈ້ງເຕືອນ)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>ຮູບແບບຫ້ອງແຊທ Messenger 2 ຝ່າຍ</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>ຟອນ Noto Sans Lao & ຂະໜາດ HD 1284x900</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all font-lao group-hover:translate-x-1"
          >
            <span>ເຂົ້າສູ່ Khamko Production</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OPTION 2: Khoi Huk Jao */}
        <div
          onClick={() => onSelectBrand('khoihukjao')}
          className={`group relative rounded-3xl p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xl hover:scale-[1.02] ${
            currentBrand === 'khoihukjao'
              ? 'bg-slate-900/90 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/80'
          }`}
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-600/25 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 font-lao">
                ຕົວເລືອກທີ 2 (ໃໝ່)
              </span>
              {currentBrand === 'khoihukjao' && (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold font-lao">
                  <CheckCircle2 className="w-4 h-4" /> ກຳລັງເລືອກ
                </span>
              )}
            </div>

            {/* Mascot Image / Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#e5e5e5] shadow-lg shadow-amber-500/20 mb-5 group-hover:rotate-2 transition-transform flex items-center justify-center border border-slate-700 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${khoiHukJaoBannerUrl})`,
                  backgroundPosition: '-12px -5px',
                  backgroundSize: '660px auto',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-white font-lao mb-2 group-hover:text-amber-300 transition-colors">
              Khoi Huk Jao (ຂ້ອຍຮັກເຈົ້າ)
            </h2>
            <p className="text-sm text-slate-400 font-lao leading-relaxed mb-6">
              ສ້າງແຄັບຊັ່ນຕະຫຼົກເທິງ <strong>Phôi Banner ທາງການ</strong> ຂອງເພຈ Khoi Huk Jao. ຮູບພື້ນຫຼັງຄົງທີ່ຕາມມາດຕະຖານ, ນຳໃຊ້ <strong>ຟອນພິເສດ TikTok Regular</strong> ຄົມຊັດ.
            </p>

            {/* Feature Highlights */}
            <ul className="space-y-2 mb-6 text-xs text-slate-300 font-lao">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Phôi Banner ທາງການຄົງທີ່ (1080x862px)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>ຟອນ TikTok-Regular ສຳລັບພາສາລາວ</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>ຂຽນແຄັບຊັ່ນລົງເທິງຮູບ Banner ທັນທີ & ສົ່ງອອກ HD</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all font-lao group-hover:translate-x-1"
          >
            <span>ເຂົ້າສູ່ Khoi Huk Jao</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Safety Notice */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-lao">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>ທ່ານສາມາດປ່ຽນລະຫວ່າງ 2 ເພຈໄດ້ຕະຫຼອດເວລາຢູ່ແຖບເມນູດ້ານເທິງ</span>
      </div>
    </div>
  );
};
