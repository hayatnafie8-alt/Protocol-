import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Scale,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  DisclaimerConfig,
  getDisclaimerConfig,
  hasAcceptedDisclaimer,
  setAcceptedDisclaimer,
  DISCLAIMER_CONFIG_EVENT,
} from '../data/disclaimerManager';

interface WelcomeDisclaimerOverlayProps {
  onAgreed?: () => void;
}

export const WelcomeDisclaimerOverlay: React.FC<WelcomeDisclaimerOverlayProps> = ({
  onAgreed,
}) => {
  const [config, setConfig] = useState<DisclaimerConfig>(() => getDisclaimerConfig());
  const [isAccepted, setIsAccepted] = useState<boolean>(() => hasAcceptedDisclaimer());
  const [isExited, setIsExited] = useState<boolean>(false);

  useEffect(() => {
    const handleConfigUpdate = () => {
      setConfig(getDisclaimerConfig());
      setIsAccepted(hasAcceptedDisclaimer());
    };
    window.addEventListener(DISCLAIMER_CONFIG_EVENT, handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);
    return () => {
      window.removeEventListener(DISCLAIMER_CONFIG_EVENT, handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  // If disclaimer is disabled by Admin or user has already accepted and not exited, don't show
  if (!config.enabled || (isAccepted && !isExited)) {
    return null;
  }

  // Handle Button 1: Agree & Continue
  const handleAgreeAndContinue = () => {
    setAcceptedDisclaimer(true);
    setIsAccepted(true);
    if (onAgreed) {
      onAgreed();
    }
  };

  // Handle Button 2: Decline & Instantly Trigger Exit Enforcement
  const handleDecline = () => {
    setAcceptedDisclaimer(false);
    setIsExited(true);

    // 1. Try closing window/webview
    try {
      window.close();
    } catch {}

    // 2. Fallback for mobile WebViews or back button handlers
    try {
      if (typeof window !== 'undefined' && (window as any).Android?.closeApp) {
        (window as any).Android.closeApp();
      }
    } catch {}

    // 3. Clear document body or replace history if inside iframe/PWA to ensure total access lockout
    try {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };
    } catch {}
  };

  // If user declined, show permanent blank/locked exit screen denying any access
  if (isExited) {
    return (
      <div
        className="fixed inset-0 z-[100000] bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center select-none"
        dir="rtl"
      >
        <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
              تم إنهاء الجلسة • Access Denied
            </span>
            <h2 className="text-2xl font-black text-white">
              تم رفض شروط الاستخدام
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
              تم إغلاق التطبيق وحجب المحتوى السريري التزاماً بالقوانين الطبية والأكاديمية، نظراً لعدم الموافقة على وثيقة إخلاء المسؤولية وشروط الاستخدام.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1">
            <p>للدخول للتطبيق والاستفادة من المحاضرات، يلزم فتح التطبيق والموافقة على التنبيه السريري.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsExited(false);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-neutral-700 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>إعادة فتح وثيقة إخلاء المسؤولية للمراجعة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-[#FAF7F2] dark:bg-[#151A10] border-2 border-[#D4AF37]/50 dark:border-[#59662C] text-[#2F2B24] dark:text-[#F3EFE6] rounded-[2.5rem] max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-6 sm:p-7 border-b border-[#E5DEC9] dark:border-[#2C3720] bg-gradient-to-r from-amber-500/10 via-[#FAF7F2] to-amber-500/15 dark:from-[#1E2517] dark:via-[#161C11] dark:to-[#1E2517] flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/40">
                وثيقة قانونية وسريرية ملزمة ⚖️
              </span>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                First-Launch Gatekeeper
              </span>
            </div>

            <h1
              id="disclaimer-title"
              className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white leading-tight"
            >
              {config.title}
            </h1>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed flex-1 scrollbar-thin">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E2517] border border-[#E5DEC9] dark:border-[#334024] shadow-xs space-y-4 text-justify">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>إشعار المسؤولية السريرية والمهنية:</span>
            </div>

            <p className="whitespace-pre-line text-[#3D372E] dark:text-[#E2DC CE] dark:text-neutral-200 font-medium leading-relaxed sm:leading-loose">
              {config.bodyText}
            </p>
          </div>

          {/* Key Academic Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/25 space-y-1">
              <div className="font-black text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>أغراض تعليمية بحتة</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                المحتوى موجه لطلبة وأطباء الأسنان كدليل إرشادي داعم للدراسة الأكاديمية والتدريب السريري.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <div className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>المسؤولية السريرية الفردية</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                القرار العلاجي النهائي يخضع لتقدير الطبيب المعالج وفحص كل مريض على حدة.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer with Strict Enforcement */}
        <div className="p-5 sm:p-7 border-t border-[#E5DEC9] dark:border-[#2C3720] bg-white dark:bg-[#12170E] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Button 2: Decline & Exit */}
          <button
            type="button"
            onClick={handleDecline}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-xs"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{config.declineButtonText}</span>
          </button>

          {/* Button 1: Agree & Continue */}
          <button
            type="button"
            onClick={handleAgreeAndContinue}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#0D9488] hover:from-[#495424] hover:to-[#0B8277] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span>{config.agreeButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
