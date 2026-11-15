import React from 'react';
import { Smartphone, ShieldAlert, AlertTriangle, ArrowRight, LogIn, Lock } from 'lucide-react';

interface ConcurrentSessionAlertModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  onReLogin: () => void;
  newDeviceSummary?: string;
  newLoginTimestamp?: number;
  reason?: string;
}

export const ConcurrentSessionAlertModal: React.FC<ConcurrentSessionAlertModalProps> = ({
  isOpen,
  onAcknowledge,
  onReLogin,
  newDeviceSummary,
  newLoginTimestamp,
  reason,
}) => {
  if (!isOpen) return null;

  const formattedTime = newLoginTimestamp
    ? new Date(newLoginTimestamp).toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1F14] rounded-3xl shadow-2xl border-2 border-rose-500/80 dark:border-rose-600 overflow-hidden animate-scaleUp text-right">
        {/* Urgent Header Banner */}
        <div className="p-6 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-rose-100 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/30 text-rose-100 border border-rose-300/30 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                <span>نظام حماية الحسابات الأحادية | Single-Device Enforcement</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                تم تسجيل الدخول من جهاز آخر ⚠️
              </h3>
              <p className="text-xs text-rose-100/90 font-medium">
                This account was logged in from another device
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
            <p className="text-sm font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
              {reason || 'تم فتح حسابك وتنشيط الجلسة من هاتف أو متصفح آخر. للحفاظ على أمان المحتوى السريري ومنع مشاركة الحساب، تم إنهاء هذه الجلسة فوراً.'}
            </p>

            <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 space-y-1.5 text-[11px] text-rose-800 dark:text-rose-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-rose-600" />
                  الجهاز المسجل حالياً:
                </span>
                <span className="font-mono font-bold bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md border border-rose-300/40">
                  {newDeviceSummary || 'هاتف ذكي / مستعرض آخر'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-950 dark:text-rose-100">وقت تسجيل الدخول الجديد:</span>
                <span className="font-mono font-bold bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md border border-rose-300/40">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141810] border border-[#E5DEC9] dark:border-[#323E24] space-y-2 text-[#4A4335] dark:text-[#C5BEAF]">
            <h4 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5 text-xs">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              قواعد أمان البروتوكول السريري (Anti-Piracy Policy):
            </h4>
            <ul className="space-y-1 pr-4 list-disc text-[11px] leading-relaxed">
              <li>يُسمح بتسجيل الدخول من <strong>جهاز نشط واحد فقط</strong> في نفس الوقت لكل مشترك.</li>
              <li>عند فتح التطبيق من هاتفك الجديد أو متصفح آخر، تُغلق الجلسة على الجهاز القديم تلقائياً.</li>
              <li>إذا لم تكن أنت من قام بالدخول، يرجى إبلاغ الدكتورة المشرفة فوراً لحماية حسابك وتغيير الكود.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onReLogin}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>إعادة تسجيل الدخول من هذا الجهاز</span>
            </button>

            <button
              type="button"
              onClick={onAcknowledge}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#20271A] hover:bg-[#EFE9DC] dark:hover:bg-[#2D3724] text-[#4A4335] dark:text-[#D5CDBC] font-bold text-xs border border-[#D5CDBC] dark:border-[#384626] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>فهمت، العودة للرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
