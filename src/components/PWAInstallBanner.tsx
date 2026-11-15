import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  getCacheBustedImageUrl,
  getGlobalBrandingVersion,
  PROTOCOL_APP_LOGO_KEY,
  PROTOCOL_FAB_ICON_KEY,
  PROTOCOL_BRANDING_EVENT,
} from '../utils/cacheBuster';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const [logoSrc, setLogoSrc] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_APP_LOGO_KEY) ||
        localStorage.getItem(PROTOCOL_FAB_ICON_KEY) ||
        '/protocol_logo.png'
      );
    } catch {
      return '/protocol_logo.png';
    }
  });
  const [logoVersion, setLogoVersion] = useState<number>(() => getGlobalBrandingVersion());

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored =
          localStorage.getItem(PROTOCOL_APP_LOGO_KEY) ||
          localStorage.getItem(PROTOCOL_FAB_ICON_KEY) ||
          '/protocol_logo.png';
        setLogoSrc(stored);
        setLogoVersion(getGlobalBrandingVersion());
      } catch {}
    };

    window.addEventListener('protocol_fab_icon_updated', handleUpdate);
    window.addEventListener(PROTOCOL_BRANDING_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('protocol_fab_icon_updated', handleUpdate);
      window.removeEventListener(PROTOCOL_BRANDING_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    // Check if user previously dismissed this session
    const isDismissed = sessionStorage.getItem('pwa_install_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  // If already running inside installed standalone PWA, never render banner
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_install_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    // 1. If native beforeinstallprompt is ready, trigger official browser prompt directly
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
        setTimeout(() => setDismissed(true), 3500);
      }
      return;
    }

    // 2. Only show step-by-step instructions as fallback for iOS Safari or unsupported browsers
    setShowGuideModal(true);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#59662C]/40 dark:border-[#A4BF46]/40 bg-gradient-to-r from-[#FAF7F2] via-white to-[#F3EFE3] dark:from-[#1E2417] dark:via-[#191D13] dark:to-[#14170E] p-4 sm:p-5 shadow-lg transition-all animate-fadeIn">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#59662C]/10 dark:bg-[#A4BF46]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main side with App Icon & Value proposition */}
          <div className="flex items-center gap-3.5">
            {/* Unified App Icon Branding matching top header logo */}
            <div className="w-14 h-14 rounded-[12px] bg-transparent border border-[#59662C]/30 dark:border-[#A4BF46]/40 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={getCacheBustedImageUrl(logoSrc, logoVersion)}
                alt="شعار بروتوكول"
                className="w-full h-full object-contain rounded-[10px]"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/protocol_logo.png';
                }}
              />
            </div>

            <div className="space-y-0.5 text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#59662C]/15 dark:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#CBE276]">
                  تطبيق الويب التقدمي PWA
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  يعمل بدون إنترنت (Offline Ready)
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white leading-tight">
                إضافة التطبيق للشاشة الرئيسية 📱
              </h3>

              <p className="text-xs text-[#6B6353] dark:text-[#B5AF9F] max-w-xl">
                ثبّت <strong>بروتوكول PROTOCOL</strong> على جهازك لتصفح سريع بدون شريط المتصفح، مع فتح الصور السريرية والشروحات فوراً.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {installSuccess ? (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                <Check className="w-4 h-4" />
                <span>تم تثبيت التطبيق بنجاح!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#738539] hover:from-[#485320] hover:to-[#59662C] text-white text-xs sm:text-sm font-black shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title="تثبيت التطبيق على الشاشة الرئيسية"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>تثبيت التطبيق الآن ⚡</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="إخفاء الإشعار"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guided Fallback Modal (For iOS Safari or browsers without automated prompt) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E2417] p-6 shadow-2xl border border-[#E5DEC9] dark:border-[#384524] text-right font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5DEC9] dark:border-[#384524]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#59662C]/10 dark:bg-[#A4BF46]/20 flex items-center justify-center text-[#59662C] dark:text-[#A4BF46]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                    {isIOS ? 'تثبيت التطبيق على iPhone / iPad' : 'إضافة التطبيق للشاشة الرئيسية'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    خطوات سريعة للتثبيت اليدوي على متصفحك
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="mt-4 space-y-3">
              {isIOS ? (
                <>
                  {/* Step 1 iOS */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                        اضغط على زر المشاركة (Share) في شريط Safari أسفل الشاشة
                      </p>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-[#E5DEC9] dark:border-[#384524]">
                        <div className="flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200">زر المشاركة</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans whitespace-nowrap bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700" dir="ltr">
                          Share ⎕↑
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 iOS (With Clean Non-wrapping Add to Home Screen label) */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                        مرّر القائمة لأسفل ثم اختر:
                      </p>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-[#E5DEC9] dark:border-[#384524]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <PlusSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                            إضافة إلى الشاشة الرئيسية
                          </span>
                        </div>
                        <span
                          className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans shrink-0 whitespace-nowrap bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700"
                          dir="ltr"
                        >
                          (Add to Home Screen)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 iOS */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 text-xs text-[#5F5849] dark:text-[#C5BFB0] leading-relaxed">
                      اضغط على <strong className="text-[#59662C] dark:text-[#A4BF46]">إضافة (Add)</strong> بأعلى الزاوية لتثبيت أيقونة التطبيق والعمل بكامل الشاشة وبدون إنترنت.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 1 Android / Chrome / Desktop */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                        اضغط على نقاط المتصفح الثلاث (⋮) بأعلى الشاشة
                      </p>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-[#E5DEC9] dark:border-[#384524]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-[#59662C] dark:text-[#A4BF46] leading-none">⋮</span>
                          <span className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200">قائمة المتصفح</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans whitespace-nowrap bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700" dir="ltr">
                          Menu Options
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Android / Chrome / Desktop (With Clean Non-wrapping Add to Home Screen label) */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                        اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق":
                      </p>
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-[#E5DEC9] dark:border-[#384524]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <PlusSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                            إضافة إلى الشاشة الرئيسية
                          </span>
                        </div>
                        <span
                          className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans shrink-0 whitespace-nowrap bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700"
                          dir="ltr"
                        >
                          (Add to Home Screen)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Android / Chrome / Desktop */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#252C1C] border border-[#E5DEC9]/60 dark:border-[#384524]/60">
                    <span className="w-6 h-6 rounded-full bg-[#59662C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 text-xs text-[#5F5849] dark:text-[#C5BFB0] leading-relaxed">
                      اضغط على <strong className="text-[#59662C] dark:text-[#A4BF46]">تثبيت (Install)</strong> لتثبيت التطبيق كبرنامج مستقل وسريع بدون شريط المتصفح وبدون إنترنت.
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-xl bg-[#59662C] hover:bg-[#485320] text-white py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
