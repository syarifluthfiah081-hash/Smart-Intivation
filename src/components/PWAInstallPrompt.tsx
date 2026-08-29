import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, WifiOff, CheckCircle2 } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-auto no-print">
      {/* Offline Alert */}
      {isOffline && (
        <div className="bg-amber-500/90 text-slate-950 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <span>Anda sedang dalam mode Offline. Aplikasi tetap dapat digunakan.</span>
        </div>
      )}

      {/* SW Update Notice */}
      {needRefresh && (
        <div className="bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-blue-500/40 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Pembaruan Tersedia</span>
            </div>
            <button
              onClick={() => setNeedRefresh(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Versi terbaru aplikasi telah siap. Muat ulang untuk mendapatkan fitur terbaru.
          </p>
          <button
            onClick={() => updateServiceWorker(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Perbarui Sekarang
          </button>
        </div>
      )}

      {/* Offline Ready Notice */}
      {offlineReady && (
        <div className="bg-slate-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplikasi siap digunakan offline!</span>
          </div>
          <button
            onClick={() => setOfflineReady(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* App Installed Toast */}
      {installedSuccess && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Aplikasi Smart Letter berhasil diinstall!</span>
        </div>
      )}

      {/* Install PWA Prompt Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="bg-slate-900/95 text-white backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-blue-500/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="/logo-app.svg" alt="Smart Letter" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Install Smart Letter</h4>
                <p className="text-[11px] text-slate-400">Jalankan seperti aplikasi desktop / mobile</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install Aplikasi (PWA)</span>
          </button>
        </div>
      )}
    </div>
  );
};
