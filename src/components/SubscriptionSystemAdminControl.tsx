import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Unlock,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  getIsSubscriptionSystemEnabled,
  setSubscriptionSystemEnabled,
  subscribeToSubscriptionSystemToggle,
} from '../services/subscriptionSystemToggleService';

interface SubscriptionSystemAdminControlProps {
  onNavigateHome?: () => void;
}

export const SubscriptionSystemAdminControl: React.FC<SubscriptionSystemAdminControlProps> = ({
  onNavigateHome,
}) => {
  // isEnabled = true -> Subscriptions & Payment UI shown, paid content locked
  // isEnabled = false -> Hide Mode active: Fully Free Public Mode, payment UI hidden
  const [isEnabled, setIsEnabled] = useState<boolean>(() => getIsSubscriptionSystemEnabled());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSubscriptionSystemToggle((enabled) => {
      setIsEnabled(enabled);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async (targetState?: boolean) => {
    const nextState = targetState !== undefined ? targetState : !isEnabled;
    setIsUpdating(true);
    try {
      await setSubscriptionSystemEnabled(nextState);
      setIsEnabled(nextState);
      if (!nextState) {
        setFeedbackMsg({
          type: 'success',
          text: 'تم تفعيل وضع الإخفاء بنجاح! تم إخفاء أزرار الدفع وبطاقات طلب الأكواد، وتحول التطبيق فوراً إلى "وضع مجاني تام وعام" (Fully Free Public Mode) لجميع الزوار بدون الحاجة لأي كود 🔓.',
        });
      } else {
        setFeedbackMsg({
          type: 'info',
          text: 'تم استرجاع نظام الاشتراكات بنجاح! تم فوراً إعادة إظهار أزرار الاشتراكات والدفع، وقفل المحتويات المدفوعة كما كانت وبشكل لحظي 🔒.',
        });
      }
    } catch (err) {
      console.error('Failed to toggle subscription system:', err);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  const isHideModeActive = !isEnabled;

  return (
    <div
      className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-[#FAF7F2] to-amber-500/10 dark:from-[#1E2417] dark:via-[#192114] dark:to-[#171D12] border-2 border-[#59662C]/40 dark:border-[#384524] shadow-sm space-y-6 text-right"
      dir="rtl"
    >
      {/* Header & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9] dark:border-[#343E26]">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all shrink-0 ${
              isHideModeActive
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                : 'bg-gradient-to-tr from-amber-600 to-amber-500'
            }`}
          >
            {isHideModeActive ? <Unlock className="w-7 h-7" /> : <CreditCard className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إظهار/إخفاء أزرار الدفع والاشتراك (Hide/Show Subscription & Payment UI)
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs flex items-center gap-1.5 ${
                  isHideModeActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                }`}
              >
                {isHideModeActive ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>وضع الإخفاء مفعّل: الوضع المجاني التام والعام (Fully Free Public Mode)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>وضع الإظهار مفعّل: نظام الاشتراكات والأكواد نشط (Paid Mode)</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-[#7A7466] dark:text-[#A7A08E] mt-1 leading-relaxed">
              مفتاح التحكم الرئيسي المباشر: يمكنك إخفاء أزرار الدفع وطلب الأكواد لتحويل التطبيق لوضع مجاني تام للجميع، أو استرجاع نظام الاشتراكات في أي وقت بنقرة واحدة لحظياً.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3.5 self-end lg:self-auto bg-white dark:bg-[#161C11] p-3 rounded-2xl border-2 border-[#59662C]/30 dark:border-[#333E24] shadow-xs shrink-0">
          <div className="text-right">
            <span className="text-xs font-black block text-[#2F2B24] dark:text-white">
              {isHideModeActive ? 'وضع الإخفاء مفعّل 🔓' : 'وضع الإظهار مفعّل 🔒'}
            </span>
            <span className="text-[10px] text-[#7A7466] dark:text-[#A7A08E] block">
              {isHideModeActive ? 'أزرار الدفع مخفية • التطبيق مجاني بالكامل' : 'أزرار الدفع ظاهرة • المحتوى مقفل للأكواد'}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isHideModeActive}
            onClick={() => handleToggle()}
            disabled={isUpdating}
            className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
              isHideModeActive ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            title="تبديل خيار إظهار/إخفاء أزرار الدفع والاشتراك"
          >
            <span className="sr-only">إظهار/إخفاء أزرار الدفع والاشتراك</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs ${
                isHideModeActive ? '-translate-x-7 text-emerald-600' : 'translate-x-0 text-neutral-400'
              }`}
            >
              {isHideModeActive ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-xs animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
              : 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="leading-relaxed">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Quick Action Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Hide Payment & Activate Fully Free Public Mode */}
        <div
          onClick={() => handleToggle(false)}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
            isHideModeActive
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white/60 dark:bg-[#161B11]/60 border-[#E5DEC9] dark:border-[#2F3921] hover:border-emerald-400 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                  isHideModeActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <Unlock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                  1. وضع الإخفاء (الوضع المجاني التام والعام)
                </h3>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 block font-medium">
                  Fully Free Public Mode
                </span>
              </div>
            </div>
            {isHideModeActive ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>مفعّل حالياً</span>
              </span>
            ) : (
              <button
                type="button"
                className="px-3 py-1 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
              >
                تفعيل الإخفاء 🔓
              </button>
            )}
          </div>

          <ul className="text-xs text-[#524B3E] dark:text-[#C5BFB0] space-y-2 leading-relaxed pt-1 border-t border-emerald-200/50 dark:border-emerald-800/30">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-black">•</span>
              <span>
                <strong>إخفاء أزرار الدفع:</strong> يتم إخفاء أزرار الدفع، بطاقات طلب الأكواد، وواجهات طلب الاشتراكات بالكامل من جميع واجهات التطبيق للمستخدمين.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-black">•</span>
              <span>
                <strong>استخدام مجاني تام:</strong> يمكن لجميع الزوار استخدام كافة أقسام ومحتويات التطبيق بسلاسة تامة بدون الحاجة لأي كود أو اشتراك.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-black">•</span>
              <span>
                <strong>فتح المحتويات المقفلة:</strong> يتم فتح شروحات الكلاسات، البروتوكولات السريرية، المهارات، ودليل الأدوية فوراً للجميع.
              </span>
            </li>
          </ul>
        </div>

        {/* Card 2: Show Payment & Restore Subscription System */}
        <div
          onClick={() => handleToggle(true)}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
            !isHideModeActive
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white/60 dark:bg-[#161B11]/60 border-[#E5DEC9] dark:border-[#2F3921] hover:border-amber-400 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                  !isHideModeActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  2. وضع الإظهار (استرجاع نظام الاشتراكات)
                </h3>
                <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-medium">
                  Subscription & Paid Mode
                </span>
              </div>
            </div>
            {!isHideModeActive ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-600 text-white shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>مفعّل حالياً</span>
              </span>
            ) : (
              <button
                type="button"
                className="px-3 py-1 rounded-xl text-[11px] font-black bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs cursor-pointer"
              >
                استرجاع الاشتراكات 🔒
              </button>
            )}
          </div>

          <ul className="text-xs text-[#524B3E] dark:text-[#C5BFB0] space-y-2 leading-relaxed pt-1 border-t border-amber-200/50 dark:border-amber-800/30">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-black">•</span>
              <span>
                <strong>استرجاع نظام الاشتراكات في أي وقت:</strong> في حال رغبة المشرفة بإعادة تفعيل نظام الدفع والأكواد لاحقاً، يكفي إلغاء تفعيل المفتاح من لوحة التحكم.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-black">•</span>
              <span>
                <strong>إعادة إظهار أزرار الاشتراكات:</strong> يقوم النظام فوراً بإعادة إظهار أزرار الاشتراكات والدفع وطلب الأكواد للمستخدمين.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-black">•</span>
              <span>
                <strong>قفل المحتويات المدفوعة كما كانت:</strong> تعود شاشات القفل لحماية المحتوى المتقدم للمشتركين فقط وبشكل لحظي متزامن.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5DEC9]/80 dark:border-[#2F3921]">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            التزامن السحابي فوري: يتم حفظ الإعداد سحابياً وتطبيقه على كافة الأجهزة والمتصفحات النشطة في نفس اللحظة.
          </span>
        </div>

        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#59662C] hover:bg-[#475323] text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة الواجهة الرئيسية كما يراها المستخدمون ←</span>
          </button>
        )}
      </div>
    </div>
  );
};
