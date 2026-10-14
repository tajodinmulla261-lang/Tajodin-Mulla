import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Radio,
  Zap,
  Sliders,
  Play,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PhoneAppApkTabProps {
  onLaunchMobileMode: () => void;
}

export const PhoneAppApkTab: React.FC<PhoneAppApkTabProps> = ({ onLaunchMobileMode }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRemoteUrl, setCopiedRemoteUrl] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const mobileRemoteUrl = `${origin}/?mode=mobile`;

  const handleCopy = (text: string, isRemote = false) => {
    navigator.clipboard.writeText(text);
    if (isRemote) {
      setCopiedRemoteUrl(true);
      setTimeout(() => setCopiedRemoteUrl(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              Android APK & Mobile Remote Controller
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              Score Matches Directly From Your Phone
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              ITC Sports ko apne Android phone ya iPhone par install karein. Ground ya sideline par khade hokar phone se live score, timer, aur cards update karein — broadcast overlay par foran real-time reflect hoga!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onLaunchMobileMode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20"
              >
                <Sliders className="w-4 h-4" />
                Launch Phone Scorer Remote Now
              </button>

              {isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  Install App (WebAPK)
                </button>
              )}
            </div>
          </div>

          {/* Mini Phone Mockup Preview */}
          <div className="shrink-0 w-full md:w-72 bg-slate-950 border-2 border-slate-700/80 rounded-3xl p-3 shadow-2xl">
            <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mb-2" />
            <div className="bg-slate-900 rounded-2xl p-3 space-y-2.5 border border-slate-800">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-white flex items-center gap-1">
                  <span>⚽</span> ITC Sports Remote
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  LIVE
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase">1st Half · 45:00</span>
                <div className="flex items-center justify-around mt-1">
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-300">HOME</span>
                    <div className="text-2xl font-mono font-black text-white">2</div>
                    <div className="text-[9px] text-emerald-400 font-bold">+ GOAL</div>
                  </div>
                  <span className="text-slate-600 font-bold">:</span>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-300">AWAY</span>
                    <div className="text-2xl font-mono font-black text-white">1</div>
                    <div className="text-[9px] text-emerald-400 font-bold">+ GOAL</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunchMobileMode}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Try Mobile View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Instructions: Android WebAPK & Standalone APK Package */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Method 1: Instant Android Install (WebAPK) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Method 1: Android Direct Install (Recommended)
              </h3>
              <p className="text-xs text-slate-400">
                Google Chrome creates a real native WebAPK automatically
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-semibold text-white mb-1.5">Phone ke Chrome browser mein yeh URL kholein:</p>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg font-mono text-[11px] text-amber-400">
                <span className="truncate flex-1">{mobileRemoteUrl}</span>
                <button
                  onClick={() => handleCopy(mobileRemoteUrl, true)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedRemoteUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedRemoteUrl ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
              <li>
                Chrome browser ke top right mein <strong>3 Dots (⋮)</strong> par click karein.
              </li>
              <li>
                Menu mein <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par tap karein.
              </li>
              <li>
                <strong>Install</strong> dabaate hi Android phone ke Home screen aur App Drawer mein <strong>ITC Sports</strong> app icon ke saath aa jayega.
              </li>
              <li>
                Ise tap karke open karein: yeh 100% full-screen bina URL bar ke native Android app ki tarah open hota hai!
              </li>
            </ol>
          </div>
        </div>

        {/* Method 2: Raw Standalone .APK File Packaging */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Method 2: Standalone .APK File (PWABuilder / Bubblewrap)
              </h3>
              <p className="text-xs text-slate-400">
                Agar aapko WhatsApp par share karne ke liye raw .apk file package karni ho
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed">
              ITC Sports mein complete Web App Manifest, 512x512 maskable icons, Service Worker, aur offline headers pehle se fully configured hain. Microsoft ke free open-source tool <strong>PWABuilder</strong> se aap 1-click mein standalone signed Android <strong>.apk</strong> ya <strong>.aab</strong> download kar sakte hain:
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">PWABuilder Android Packager:</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Official Microsoft Tool</span>
              </div>
              <p className="text-[11px] text-slate-400">
                PWABuilder is URL ko analyze karke signed APK file generate kar deta hai jise kisi bhi Android phone mein install kiya ja sakta hai.
              </p>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  PWABuilder par APK Generate Karein
                </a>
                <button
                  onClick={() => handleCopy(origin, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy App URL
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
              💡 <strong>Tip:</strong> Method 1 (Chrome se Install) sabse aasan aur tezz hai kyunki uske liye kisi external download ki zaroorat nahi padti, Android OS khud WebAPK bana deta hai!
            </div>
          </div>
        </div>

      </div>

      {/* Feature Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Touch-Optimized</h4>
            <p className="text-[11px] text-slate-400">Big buttons with haptic vibration</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-400/20 text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Live OBS Sync</h4>
            <p className="text-[11px] text-slate-400">Instant scoreboard broadcast update</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Full Match Controls</h4>
            <p className="text-[11px] text-slate-400">Goal, cards, clock, VAR triggers</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">PWA & WebAPK</h4>
            <p className="text-[11px] text-slate-400">Standalone offline-capable app</p>
          </div>
        </div>
      </div>
    </div>
  );
};
