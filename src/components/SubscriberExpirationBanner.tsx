import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CreditCard,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import {
  getSubscriberExpirationInfo,
  ExpirationInfo,
  subscribeToStudentCodesCloud,
  StudentCodeRecord,
} from '../data/studentCodes';

interface SubscriberExpirationBannerProps {
  subscriberEmail: string;
  onRenewClick: () => void;
}

export const SubscriberExpirationBanner: React.FC<SubscriberExpirationBannerProps> = ({
  subscriberEmail,
  onRenewClick,
}) => {
  const [expirationInfo, setExpirationInfo] = useState<ExpirationInfo | null>(() =>
    getSubscriberExpirationInfo(subscriberEmail)
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Real-time synchronization with cloud codes & active countdown ticker
  useEffect(() => {
    if (!subscriberEmail) return;

    // Initial check
    const updateInfo = (codes?: StudentCodeRecord[]) => {
      const info = getSubscriberExpirationInfo(subscriberEmail, codes);
      setExpirationInfo(info);
      if (info && info.expiresAt) {
        const diffSec = Math.max(0, Math.floor((info.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(diffSec);
      }
    };

    updateInfo();

    // Live subscription to student codes in Firestore
    const unsub = subscribeToStudentCodesCloud((cloudCodes) => {
      updateInfo(cloudCodes);
    });

    // Active 1-second countdown ticker
    const timer = setInterval(() => {
      if (expirationInfo?.expiresAt) {
        const diffSec = Math.max(0, Math.floor((expirationInfo.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(diffSec);
        if (diffSec <= 0) {
          updateInfo();
        }
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [subscriberEmail, expirationInfo?.expiresAt]);

  // Only render if subscription is nearing expiration (within 7 days) and not already expired
  if (!expirationInfo || isDismissed) return null;
  if (!expirationInfo.isExpiringSoon && !expirationInfo.isExpired) return null;

  const days = Math.floor(secondsRemaining / (24 * 3600));
  const hours = Math.floor((secondsRemaining % (24 * 3600)) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  // If minimized, display a compact floating pill
  if (isMinimized) {
    return (
      <div className="fixed top-18 left-4 z-40 animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-lg flex items-center gap-2 border-2 border-white dark:border-[#1E2417] cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="عرض تنبيه انتهاء الاشتراك"
        >
          <Clock className="w-4 h-4 animate-spin" />
          <span>متبقي على انتهاء الاشتراك: {days} يوم و {hours} ساعة</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="تنبيه انتهاء الاشتراك السنوي"
      className="relative z-30 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-md border-b-2 border-amber-300/40 text-right transition-all animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Alert Message */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-100 animate-bounce" />
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md border border-white/30">
                  تنبيه اقتراب انتهاء الاشتراك السنوي ⚠️
                </span>
                <span className="text-[11px] text-amber-100 font-mono">
                  ينتهي في: {expirationInfo.formattedExpiresAt}
                </span>
              </div>
              <p className="text-xs font-bold text-white/95 leading-relaxed">
                عزيزي الطالب، اشتراكك السنوي يوشك على الانتهاء. يرجى تجديد الاشتراك السنوي لضمان استمرار الوصول دون انقطاع إلى أطلس المهارات السريرية وحالات الكومبوزيت.
              </p>
            </div>
          </div>

          {/* Countdown & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-between md:justify-end">
            {/* Live Countdown Display */}
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 font-mono">
              <div className="text-center">
                <span className="text-sm font-black text-amber-200">{days}</span>
                <span className="text-[9px] block text-white/70">يوم</span>
              </div>
              <span className="text-amber-200 text-xs font-bold">:</span>
              <div className="text-center">
                <span className="text-sm font-black text-amber-200">
                  {hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-white/70">ساعة</span>
              </div>
              <span className="text-amber-200 text-xs font-bold">:</span>
              <div className="text-center">
                <span className="text-sm font-black text-amber-200">
                  {minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-white/70">دقيقة</span>
              </div>
              <span className="text-amber-200 text-xs font-bold">:</span>
              <div className="text-center">
                <span className="text-sm font-black text-amber-200">
                  {seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-white/70">ثانية</span>
              </div>
            </div>

            {/* Renew Button */}
            <button
              type="button"
              onClick={onRenewClick}
              className="px-4 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              <span>تجديد الاشتراك الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white/90 cursor-pointer"
                title="تصغير التنبيه"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white/90 cursor-pointer"
                title="إخفاء التنبيه لهذه الجلسة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
