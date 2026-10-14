import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Smartphone, Download, Check, HelpCircle } from 'lucide-react';
import { ApkInstallModal } from '../modals/ApkInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      setShowModal(true);
    }
  };

  // If already running inside standalone app, show small active indicator or open modal for APK info
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/60 transition ${className}`}
          title="App installed on this device (WebAPK)"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Installed</span>
        </button>
        <ApkInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm ${className}`}
          title="Install Phone APK / App"
        >
          <Download className="w-4 h-4" />
        </button>
        <ApkInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
          isInstallable
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40 ring-1 ring-emerald-400/50'
            : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-800/60'
        } ${className}`}
        title="Install ITC Sports App / APK on Android & Phone"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
        <span className="whitespace-nowrap">
          {installing
            ? 'Installing...'
            : isInstallable
            ? 'Install Phone App (APK)'
            : 'Phone App / APK'}
        </span>
      </button>

      <ApkInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
