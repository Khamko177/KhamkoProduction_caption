import React from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-lao">
                Khamko Production
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 rounded-full font-lao">
                  ສະຕູດິໂອ ມີມ
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium font-lao">
              ລະບົບສ້າງຮູບພາບແຄັບຊັ່ນ ແລະ ແຈ້ງເຕືອນແບບມືອາຊີບ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg font-lao">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ຈັດຂໍ້ຄວາມອັດຕະໂນມັດ & ຄົມຊັດລະດັບ HD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
