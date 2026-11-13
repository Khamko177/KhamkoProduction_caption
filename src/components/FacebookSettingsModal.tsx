import React, { useState, useEffect } from 'react';
import { BrandType } from '../types';
import {
  FacebookSettings,
  getFacebookSettings,
  saveFacebookSettings,
  testFacebookConnection,
  TestConnectionResult,
} from '../utils/facebookApi';
import {
  X,
  Facebook,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FacebookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBrand: BrandType;
  onSettingsSaved?: () => void;
}

export const FacebookSettingsModal: React.FC<FacebookSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBrand,
  onSettingsSaved,
}) => {
  if (!isOpen) return null;

  const [activeBrandTab, setActiveBrandTab] = useState<BrandType>(currentBrand);
  const [settings, setSettings] = useState<FacebookSettings>(getFacebookSettings());
  const [showToken, setShowToken] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    setActiveBrandTab(currentBrand);
  }, [currentBrand]);

  const currentConfig = settings[activeBrandTab];
  const displayPageName = activeBrandTab === 'khoihukjao'
    ? (currentConfig.pageName && currentConfig.pageName !== 'Khamko Production' ? currentConfig.pageName : 'Khoi Huk Jao')
    : (currentConfig.pageName || 'Khamko Production');

  const handleUpdateCurrentField = (field: 'pageId' | 'accessToken', value: string) => {
    setSettings((prev) => ({
      ...prev,
      [activeBrandTab]: {
        ...prev[activeBrandTab],
        [field]: value,
        isConnected: false, // Reset connected status on change
      },
    }));
    setTestResult(null);
    setSavedSuccess(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const res = await testFacebookConnection(currentConfig.pageId, currentConfig.accessToken, activeBrandTab);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      setSettings((prev) => ({
        ...prev,
        [activeBrandTab]: {
          ...prev[activeBrandTab],
          pageId: res.pageId || prev[activeBrandTab].pageId,
          accessToken: res.resolvedPageToken || prev[activeBrandTab].accessToken,
          isConnected: true,
          pageName: res.pageName,
          avatarUrl: res.avatarUrl,
        },
      }));
    }
  };

  const handleSave = () => {
    saveFacebookSettings(settings);
    setSavedSuccess(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
    if (onSettingsSaved) {
      onSettingsSaved();
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-lao flex items-center gap-2">
                <span>ຕັ້ງຄ່າເຊື່ອມຕໍ່ Facebook (Meta Graph API)</span>
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  GitHub Pages 100%
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-lao">
                ຕັ້ງຄ່າ Page ID & Access Token ເພື່ອໂພສລົງ Facebook ແລະ แพลนเนอร์ (Meta Planner)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Selector Tabs */}
        <div className="px-6 pt-4 bg-slate-950/40">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 font-lao">
            <button
              type="button"
              onClick={() => {
                setActiveBrandTab('khamko');
                setTestResult(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeBrandTab === 'khamko'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🎬 Khamko Production</span>
              {settings.khamko.isConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveBrandTab('khoihukjao');
                setTestResult(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeBrandTab === 'khoihukjao'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🧢 Khoi Huk Jao</span>
              {settings.khoihukjao.isConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Active Page Info Card if Connected */}
          {currentConfig.isConnected && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentConfig.avatarUrl ? (
                  <img
                    src={currentConfig.avatarUrl}
                    alt={displayPageName}
                    className="w-10 h-10 rounded-full border border-emerald-500/40 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    FB
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white font-lao">
                      {displayPageName}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    ID: {currentConfig.pageId} • ພ້ອມໂພສລົງແພລນເນີ
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-lao">
                ເຊື່ອມຕໍ່ສຳເລັດ
              </span>
            </div>
          )}

          {/* Form Inputs */}
          <div className="space-y-3.5">
            {/* Page ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between font-lao">
                <span>Facebook Page ID (ລະຫັດເພຈ):</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ຕົວຢ່າງ: 103867871513828
                </span>
              </label>
              <input
                type="text"
                value={currentConfig.pageId}
                onChange={(e) => handleUpdateCurrentField('pageId', e.target.value)}
                placeholder="ປ້ອນ Facebook Page ID (เช่น 103867871513828)..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Access Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between font-lao">
                <span className="flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page Access Token (ລະຫັດໂທເຄັນເພຈ):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-lao"
                >
                  {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showToken ? 'ເຊື່ອງ Token' : 'ສະແດງ Token'}</span>
                </button>
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={currentConfig.accessToken}
                  onChange={(e) => handleUpdateCurrentField('accessToken', e.target.value)}
                  placeholder="ວາງ Page Access Token (ຂຶ້ນຕົ້ນດ້ວຍ EAAB...)..."
                  className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed ${
                    !showToken ? 'filter blur-[3px] focus:filter-none' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !currentConfig.accessToken}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer font-lao disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>ກຳລັງທົດສອບການເຊື່ອມຕໍ່ Facebook Graph API...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ທົດສອບການເຊື່ອມຕໍ່ (Test Connection)</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-lao flex items-start gap-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {testResult.success
                      ? `ເຊື່ອມຕໍ່ສຳເລັດກັບ: ${
                          testResult.pageName && testResult.pageName !== 'Khamko Production'
                            ? testResult.pageName
                            : (activeBrandTab === 'khoihukjao' ? 'Khoi Huk Jao' : 'Khamko Production')
                        }!`
                      : 'ການເຊື່ອມຕໍ່ລົ້ມເຫຼວ'}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5 whitespace-pre-line leading-relaxed">
                    {testResult.success
                      ? (testResult.note || 'Token ແລະ Page ID ຖືກຕ້ອງ 100%, ສາມາດໂພສ ແລະ ຕັ້ງເວລາລົງ Meta Planner ໄດ້ທັນທີ.')
                      : testResult.error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Guide Accordion */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer font-lao"
            >
              <span className="flex items-center gap-1.5 text-blue-400">
                <HelpCircle className="w-4 h-4" />
                <span>ວິທີເອົາ Page Access Token & Page ID ງ່າຍໆ (คลิกดูวิธีทำ)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {showGuide ? '▲ ເຊື່ອງ' : '▼ ເບິ່ງ'}
              </span>
            </button>

            {showGuide && (
              <div className="p-4 pt-1 border-t border-slate-800/80 text-xs text-slate-400 space-y-2.5 font-lao leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white">ເອົາ Page ID:</strong> ເຂົ້າໜ້າ Fanpage ຂອງທ່ານ ➔ ກົດເມນູ <em>About (ກ່ຽວກັບ)</em> ➔ ຈະເຫັນ <strong>Page ID</strong> (ຕົວເລກປະມານ 15 ຫຼັກ ເຊັ່ນ <code>103867871513828</code>).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white">ເອົາ Page Access Token:</strong> ເຂົ້າໄປທີ່{' '}
                    <a
                      href="https://developers.facebook.com/tools/explorer/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Meta Graph API Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    , ເລືອກ Meta App ຂອງທ່ານ ➔ ບ່ອນ <em>User or Page</em> ເລືອກ <strong>Page Token</strong> ຂອງເພຈທີ່ຕ້ອງການ ➔ ກົດ Generate Token ➔ ສຳເນົາມາວາງໃສ່ຊ່ອງຂ້າງເທິງ.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white">ສິດທີ່ຕ້ອງການ (Permissions):</strong> ຕ້ອງການສິດ <code>pages_manage_posts</code> ແລະ <code>pages_read_engagement</code> ເພື່ອໃຫ້ສາມາດອັບໂຫຼດຮູບ ແລະ ຕັ້ງເວລາລົງ Planner ໄດ້.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-lao">
            🔒 ຂໍ້ມູນບັນທຶກສະເພາະໃນບຣາວເຊີຂອງທ່ານ (localStorage)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer font-lao"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all cursor-pointer font-lao"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ບັນທຶກສຳເລັດແລ້ວ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ບັນທຶກການຕັ້ງຄ່າ</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
