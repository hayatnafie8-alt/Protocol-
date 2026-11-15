import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Sparkles,
  X,
  Check,
  ShieldCheck,
  Send,
  Pill,
  Calendar,
  Stethoscope,
  Settings2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerPushSubscription,
  testBackgroundPushNotification,
  getPushNotificationPreferences,
  savePushNotificationPreferences,
  PushNotificationPreferences,
} from '../services/pushNotificationManager';

export const NotificationPermissionBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(true);
  const [grantedFeedback, setGrantedFeedback] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState<PushNotificationPreferences>(() =>
    getPushNotificationPreferences()
  );

  useEffect(() => {
    if (!isNotificationSupported()) {
      return;
    }

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    // If permission is already granted, we can keep the banner collapsed
    // but check if user wants to see the control or if dismissed
    const wasDismissed = sessionStorage.getItem('pwa_notif_banner_dismissed') === 'true';
    if (!wasDismissed) {
      const timer = setTimeout(() => {
        setDismissed(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequest = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setGrantedFeedback(true);
      await registerPushSubscription();
      // Send a welcome test notification
      setTimeout(() => {
        testBackgroundPushNotification('clinical_update');
      }, 600);
      setTimeout(() => {
        setGrantedFeedback(false);
        setDismissed(true);
      }, 4000);
    } else {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_notif_banner_dismissed', 'true');
  };

  const handleTogglePref = (key: keyof PushNotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    savePushNotificationPreferences(updated);
  };

  const handleRunTest = async (category: 'clinical_update' | 'drug_addition' | 'schedule_reminder') => {
    setIsTesting(true);
    setTestSuccessMessage(null);
    try {
      const ok = await testBackgroundPushNotification(category);
      if (ok) {
        setTestSuccessMessage(
          category === 'drug_addition'
            ? 'تم إرسال إشعار دوائي تجريبي إلى شريط جهازك بنجاح 💊'
            : category === 'schedule_reminder'
            ? 'تم إرسال تذكير موعد سريري تجريبي إلى جهازك 📅'
            : 'تم إرسال تحديث بروتوكول سريري تجريبي بنجاح 🩺'
        );
        setTimeout(() => setTestSuccessMessage(null), 5000);
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (!isNotificationSupported()) {
    return null;
  }

  // When already granted, render a subtle, non-intrusive status & test bar on the home screen
  if (permission === 'granted') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#4D6A34]/30 dark:border-[#7D9333]/30 bg-gradient-to-r from-[#FAF7F2] via-white to-[#F5EFE4] dark:from-[#181D13] dark:via-[#151910] dark:to-[#12160E] p-3 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-right">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#2F2B24] dark:text-white">
                  الإشعارات الخارجية الحية مفعلة بنجاح 🔔
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  متصل بمركز التنبيهات
                </span>
              </div>
              <p className="text-[10px] text-[#6B6353] dark:text-[#A7A08E]">
                ستصلك التحديثات السريرية، إضافات الأدوية، وتذكيرات مواعيد العيادات مباشرة على جهازك.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
            <button
              type="button"
              onClick={() => setShowPreferences((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="تخصيص فئات الإشعارات"
            >
              <Settings2 className="w-3 h-3 text-[#4D6A34] dark:text-[#A4BF46]" />
              <span>تخصيص الفئات</span>
            </button>

            <button
              type="button"
              disabled={isTesting}
              onClick={() => handleRunTest('drug_addition')}
              className="px-2.5 py-1.5 rounded-lg bg-[#4D6A34] hover:bg-[#3E562A] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="إرسال إشعار تجريبي فوري لشاشة جهازك للتأكد من وصول الإشعارات"
            >
              <Bell className="w-3 h-3 animate-pulse" />
              <span>{isTesting ? 'جاري الإرسال...' : 'تجربة إشعار فوري 🔔'}</span>
            </button>
          </div>
        </div>

        {/* Success toast upon manual test trigger */}
        {testSuccessMessage && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{testSuccessMessage}</span>
          </div>
        )}

        {/* Expandable Preferences & Customization */}
        {showPreferences && (
          <div className="mt-3 pt-3 border-t border-[#E5DEC9] dark:border-[#2C3520] space-y-2 animate-fadeIn">
            <span className="text-[11px] font-black text-[#4D6A34] dark:text-[#A4BF46] block">
              اختر أنواع الإشعارات التي ترغب بتلقيها على جهازك:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                onClick={() => handleTogglePref('drugGuideUpdates')}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                  prefs.drugGuideUpdates
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">إضافات الأدوية 💊</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.drugGuideUpdates}
                  onChange={() => {}}
                  className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label
                onClick={() => handleTogglePref('scheduleReminders')}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                  prefs.scheduleReminders
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-900 dark:text-blue-200'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-bold">مواعيد العيادات 📅</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.scheduleReminders}
                  onChange={() => {}}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label
                onClick={() => handleTogglePref('clinicalUpdates')}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                  prefs.clinicalUpdates
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold">تحديثات البروتوكولات 🩺</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.clinicalUpdates}
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Test buttons row */}
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
              <span>تجربة فورية:</span>
              <button
                type="button"
                onClick={() => handleRunTest('drug_addition')}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                [دواء جديد 💊]
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleRunTest('schedule_reminder')}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                [موعد عيادة 📅]
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleRunTest('clinical_update')}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                [تحديث سريري 🩺]
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // When denied, provide gentle guidance on how to enable in browser
  if (permission === 'denied') {
    if (dismissed) return null;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100/90 dark:bg-neutral-900/90 p-3 shadow-xs transition-all text-right">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              الإشعارات محظورة في إعدادات متصفحك. لتفعيلها: انقر على رمز القفل 🔒 في شريط العنوان ثم فعّل <strong>الإشعارات (Allow Notifications)</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // When default (not yet requested), render the full opt-in banner
  if (dismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 dark:border-amber-400/40 bg-gradient-to-r from-amber-50/95 via-white to-amber-50/80 dark:from-[#211F15] dark:via-[#191D13] dark:to-[#181A12] p-4 sm:p-5 shadow-lg transition-all animate-fadeIn">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
        {/* Left Side: Icon & Copy */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300">
                إشعارات الدفع الخارجية (Background Push) 🔔
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                تعمل حتى أثناء إغلاق التطبيق
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white leading-tight">
              تفعيل التنبيهات السريرية ومواعيد العيادات على جهازك
            </h4>

            <p className="text-xs text-[#6B6353] dark:text-[#B5AF9F] max-w-xl leading-relaxed">
              احصل فوراً على إشعارات رسمية في مركز تنبيهات جهازك (Android / iOS / PC) عند:
              <strong className="text-amber-700 dark:text-amber-300 mx-1">إضافة أدوية جديدة 💊</strong>،
              <strong className="text-blue-700 dark:text-blue-300 mx-1">تذكير مواعيد العيادات 📅</strong>،
              و<strong className="text-emerald-700 dark:text-emerald-300 mx-1">ردود المشرفة السريرية 🩺</strong>.
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {grantedFeedback ? (
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
              <Check className="w-4 h-4" />
              <span>تم تفعيل الإشعارات بنجاح! 🔔</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRequest}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs sm:text-sm font-black shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>تفعيل الإشعارات الآن 🔔</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-white text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                لاحقاً
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
