import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside installed standalone PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    // 1. If native prompt is available, trigger browser prompt directly
    if (isInstallable) {
      const res = await install();
      if (res) {
        setJustInstalled(true);
      }
      return;
    }

    // 2. Fallback modal for iOS Safari or browsers without beforeinstallprompt
    setShowGuideModal(true);
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">تم التثبيت بنجاح</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#7D9333] hover:from-[#485320] hover:to-[#59662C] text-white font-bold transition-all shadow-xs cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
        }`}
        title="تثبيت تطبيق بروتوكول PROTOCOL على جهازك للعمل بدون إنترنت (PWA)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق 📱</span>
        {!compact && (
          <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">PWA</span>
        )}
      </button>

      {/* Guided Fallback Modal */}
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
                    طريقة إضافة التطبيق بسهولة على جهازك
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
                      اضغط على <strong className="text-[#59662C] dark:text-[#A4BF46]">إضافة (Add)</strong> بأعلى الشاشة لتثبيت أيقونة التطبيق والعمل بدون إنترنت.
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
