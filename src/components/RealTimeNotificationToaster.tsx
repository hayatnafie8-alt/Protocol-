import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, ArrowLeft, MessageSquare, Megaphone, CheckCircle, HelpCircle } from 'lucide-react';
import { AppNotificationPayload } from '../services/pushNotificationManager';

interface ActiveToast extends AppNotificationPayload {
  toastKey: string;
}

export const RealTimeNotificationToaster: React.FC<{
  onOpenNotes?: (noteId?: string) => void;
  onOpenFeed?: (postId?: string) => void;
}> = ({ onOpenNotes, onOpenFeed }) => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotificationPayload>;
      if (!customEvent.detail) return;

      const newToast: ActiveToast = {
        ...customEvent.detail,
        toastKey: `${customEvent.detail.id}_${Date.now()}`,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastKey !== newToast.toastKey));
      }, 8500);
    };

    window.addEventListener('app-realtime-notification', handleNewNotification);
    return () => window.removeEventListener('app-realtime-notification', handleNewNotification);
  }, []);

  const dismissToast = (key: string) => {
    setToasts((prev) => prev.filter((t) => t.toastKey !== key));
  };

  const handleActionClick = (toast: ActiveToast) => {
    dismissToast(toast.toastKey);
    if (toast.type === 'targeted_reply') {
      if (onOpenNotes) {
        onOpenNotes(toast.targetNoteId);
      } else {
        window.dispatchEvent(
          new CustomEvent('app-open-note-modal', { detail: { noteId: toast.targetNoteId } })
        );
      }
    } else if (toast.type === 'broadcast_post') {
      if (onOpenFeed) {
        onOpenFeed(toast.postId);
      } else {
        window.dispatchEvent(
          new CustomEvent('app-open-post', { detail: { postId: toast.postId } })
        );
      }
    } else if (toast.type === 'report_export_request') {
      window.dispatchEvent(new CustomEvent('app-open-report-approvals'));
    } else if (toast.type === 'report_export_approved' || toast.type === 'report_export_rejected') {
      window.dispatchEvent(new CustomEvent('app-open-clinical-report'));
    } else if (toast.type === 'clinic_viva_question') {
      window.dispatchEvent(new CustomEvent('app-open-clinic-viva'));
      const el = document.getElementById('operative-viva-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-[#c5a059]', 'transition-all');
        setTimeout(() => el.classList.remove('ring-4', 'ring-[#c5a059]'), 3500);
      }
    } else if (toast.type === 'system_alert') {
      window.dispatchEvent(new CustomEvent('app-open-appointments-schedule'));
      const el = document.getElementById('college-schedule-container') || document.getElementById('appointments-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-[#f97316]', 'transition-all');
        setTimeout(() => el.classList.remove('ring-4', 'ring-[#f97316]'), 3500);
      }
    }
  };

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="الإشعارات الفورية" className="fixed top-4 left-4 right-4 sm:right-6 sm:left-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast, tIdx) => {
        const isTargetedReply = toast.type === 'targeted_reply';

        return (
          <div
            key={`${toast.toastKey || 'toast'}_${tIdx}`}
            className="pointer-events-auto transform transition-all duration-300 animate-slideDown shadow-2xl rounded-2xl border-2 overflow-hidden bg-white/95 dark:bg-[#1E2417]/95 backdrop-blur-md text-right font-sans border-[#59662C] dark:border-[#A4BF46]"
            dir="rtl"
          >
            {/* Top Accent Strip */}
            <div
              className={`h-1.5 w-full ${
                isTargetedReply
                  ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-[#59662C]'
                  : 'bg-gradient-to-r from-[#59662C] to-[#A4BF46]'
              }`}
            />

            <div className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isTargetedReply
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]'
                    }`}
                  >
                    {isTargetedReply ? (
                      <Bell className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Megaphone className="w-4 h-4 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isTargetedReply
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : toast.type === 'report_export_request'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                          : toast.type === 'report_export_approved'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                          : toast.type === 'report_export_rejected'
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200'
                          : toast.type === 'clinic_viva_question'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-[#59662C]/10 dark:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#CBE276]'
                      }`}
                    >
                      {isTargetedReply
                        ? 'رد مباشر على ملاحظتك ✨'
                        : toast.type === 'report_export_request'
                        ? 'طلب تصدير تقرير سريري 📋'
                        : toast.type === 'report_export_approved'
                        ? 'تم اعتماد تقريرك السريري ✅'
                        : toast.type === 'report_export_rejected'
                        ? 'تنبيه: مراجعة التقرير ⚠️'
                        : toast.type === 'clinic_viva_question'
                        ? '🩺 سؤال سينيور عيادي جديد'
                        : 'تحديث سريري جديد 📢'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white leading-tight mt-0.5">
                      {toast.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastKey)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message */}
              <p className="text-xs text-[#5F5849] dark:text-[#C5BFB0] leading-relaxed line-clamp-2 pr-1">
                {toast.message}
              </p>

              {/* Action Button */}
              <div className="pt-1 flex items-center justify-between border-t border-[#E5DEC9]/60 dark:border-[#384524]/60">
                <span className="text-[10px] text-gray-400 font-mono">الآن (مباشر)</span>

                <button
                  type="button"
                  onClick={() => handleActionClick(toast)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs transition-transform transform active:scale-95 cursor-pointer ${
                    isTargetedReply
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600'
                      : toast.type === 'report_export_request'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600'
                      : toast.type === 'report_export_approved'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600'
                      : toast.type === 'report_export_rejected'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600'
                      : 'bg-gradient-to-r from-[#59662C] to-[#738539] hover:from-[#485320] hover:to-[#59662C]'
                  }`}
                >
                  {isTargetedReply ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>قراءة الرد الآن</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  ) : toast.type === 'report_export_request' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>مراجعة واعتماد التقرير</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  ) : toast.type === 'report_export_approved' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>فتح التقرير والتصدير</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  ) : toast.type === 'report_export_rejected' ? (
                    <>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>مراجعة الملاحظات</span>
                    </>
                  ) : toast.type === 'clinic_viva_question' ? (
                    <>
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>عرض السؤال السريري</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>عرض المنشور</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
