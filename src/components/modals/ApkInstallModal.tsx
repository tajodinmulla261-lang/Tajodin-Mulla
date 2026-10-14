import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  X,
  Smartphone,
  Download,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMobileMode?: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenMobileMode,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'apk' | 'ios'>('android');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const mobileRemoteUrl = `${currentUrl}/?mode=mobile`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ITC Sports · Mobile Scoring App
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Android APK & PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Score matches directly from your smartphone with live OBS / vMix broadcast sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-6 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            1-Click Android WebAPK
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Standalone .APK File Package
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'ios'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AppleIcon className="w-4 h-4" />
            iPhone / iOS Setup
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Action Highlight Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Phone Scoring Remote Ready
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Designed specifically for fingers & touchscreens: huge Goal + / - buttons, live timer, and cards control.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {isInstallable && (
                <button
                  onClick={handleDirectInstall}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/40"
                >
                  <Download className="w-4 h-4" />
                  Install App Now
                </button>
              )}
              {onOpenMobileMode && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMobileMode();
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Open Mobile Remote
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: 1-Click Android WebAPK */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Android par 1-Tap mein App (WebAPK) Install karne ka tareeqa:
                </h4>
                <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>
                    Apne Android phone ke <strong>Google Chrome</strong> ya <strong>Samsung Internet</strong> browser mein yeh link open karein:
                    <div className="mt-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-amber-400 select-all">
                      <span className="truncate flex-1">{mobileRemoteUrl}</span>
                      <button
                        onClick={() => handleCopyLink(mobileRemoteUrl)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white shrink-0 font-sans font-bold flex items-center gap-1"
                      >
                        {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedUrl ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </li>
                  <li>
                    Browser ke upar ya niche <strong>"Install ITC Sports App"</strong> ya <strong>"Add to Home screen"</strong> ka banner aayega, us par click karein.
                  </li>
                  <li>
                    Agar prompt na dikhe toh Chrome ke top-right <strong>3 dots (⋮)</strong> par click karke <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein.
                  </li>
                  <li>
                    Android OS background mein iska <strong>real WebAPK</strong> generate karke phone ke app drawer aur home screen par install kar dega!
                  </li>
                </ol>
              </div>

              {/* Benefits badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Full Screen App</p>
                    <p className="text-[11px] text-slate-400">Bina browser bar ke native app jaisa</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Radio className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Instant OBS Sync</p>
                    <p className="text-[11px] text-slate-400">Phone se score live broadcast par update</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Zero Lag</p>
                    <p className="text-[11px] text-slate-400">Instant touch buttons aur timer</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standalone .APK File Generation */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Raw .APK File Download & Package (PWABuilder by Microsoft)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agar aapko ek direct <strong>.apk installer file</strong> chahiye jise aap WhatsApp par bhej sakein ya kisi bhi Android phone mein sideload kar sakein:
                </p>

                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Is app ka PWA manifest pehle se 100% Google Play & Android compliant configure hai.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Microsoft ke official tool <strong>PWABuilder</strong> par jaayein aur apna live URL paste karein:</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    PWABuilder se APK Generate Karein
                  </a>
                  <button
                    onClick={() => handleCopyLink(currentUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy App URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: iOS Setup */}
          {activeTab === 'ios' && (
            <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                <AppleIcon className="w-4 h-4 text-slate-200" />
                iPhone / iPad par ITC Sports Score Scorer Install karne ka tareeqa:
              </h4>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Safari browser mein yeh link open karein.</li>
                <li>Safari toolbar mein <strong>Share</strong> button (box with arrow) par tap karein.</li>
                <li>Menu ko neeche scroll karein aur <strong>"Add to Home Screen"</strong> par tap karein.</li>
                <li>Top right mein <strong>Add</strong> dabayein. ITC Sports app aapke iPhone home screen par aa jayega!</li>
              </ol>
            </div>
          )}

          {/* Direct Link to Mobile Scorer View */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Desktop ya phone kisi bhi screen par scoring test karein:
            </span>
            <a
              href="/?mode=mobile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
            >
              <span>Test Phone Remote Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.78 1.08-1.86.96-2.95-1 .04-2.1.67-2.73 1.45-.58.67-.99 1.77-.85 2.83 1.12.08 2.06-.55 2.62-1.33z" />
    </svg>
  );
}
