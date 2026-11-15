import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  Eye,
  Check,
  Scale,
  FileText,
} from 'lucide-react';
import {
  DisclaimerConfig,
  getDisclaimerConfig,
  saveDisclaimerConfig,
  resetDisclaimerApproval,
  DEFAULT_DISCLAIMER_CONFIG,
  DISCLAIMER_CONFIG_EVENT,
} from '../data/disclaimerManager';

interface DisclaimerAdminManagerProps {
  className?: string;
}

export const DisclaimerAdminManager: React.FC<DisclaimerAdminManagerProps> = ({
  className = '',
}) => {
  const [config, setConfig] = useState<DisclaimerConfig>(() => getDisclaimerConfig());
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [title, setTitle] = useState<string>(config.title);
  const [bodyText, setBodyText] = useState<string>(config.bodyText);
  const [agreeButtonText, setAgreeButtonText] = useState<string>(config.agreeButtonText);
  const [declineButtonText, setDeclineButtonText] = useState<string>(config.declineButtonText);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const c = getDisclaimerConfig();
      setConfig(c);
      setEnabled(c.enabled);
      setTitle(c.title);
      setBodyText(c.bodyText);
      setAgreeButtonText(c.agreeButtonText);
      setDeclineButtonText(c.declineButtonText);
    };
    window.addEventListener(DISCLAIMER_CONFIG_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(DISCLAIMER_CONFIG_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveDisclaimerConfig({
      enabled,
      title: title.trim(),
      bodyText: bodyText.trim(),
      agreeButtonText: agreeButtonText.trim(),
      declineButtonText: declineButtonText.trim(),
    });
    setConfig(updated);
    setNoticeMsg('تم حفظ وتحديث شاشة إخلاء المسؤولية وشروط الاستخدام بنجاح! 💾');
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تودين استعادة النص والخيارات الافتراضية لوثيقة إخلاء المسؤولية؟')) {
      const def = saveDisclaimerConfig(DEFAULT_DISCLAIMER_CONFIG);
      setConfig(def);
      setEnabled(def.enabled);
      setTitle(def.title);
      setBodyText(def.bodyText);
      setAgreeButtonText(def.agreeButtonText);
      setDeclineButtonText(def.declineButtonText);
      setNoticeMsg('تمت استعادة النص الافتراضي لإخلاء المسؤولية بنجاح 🔄');
      setTimeout(() => setNoticeMsg(null), 3500);
    }
  };

  const handleForceShowForEveryone = () => {
    if (window.confirm('إعادة تفعيل عرض شاشة إخلاء المسؤولية لكافة الطلاب عند فتح التطبيق مجدداً؟')) {
      resetDisclaimerApproval();
      setNoticeMsg('تمت إعادة ضبط موافقة شاشة الإخلاء؛ ستظهر لكافة الزوار والطلاب عند أول فتح! ⚠️');
      setTimeout(() => setNoticeMsg(null), 4000);
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-amber-500/40 dark:border-amber-700/60 shadow-sm space-y-6 text-right ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#D4AF37] text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إدارة شاشة إخلاء المسؤولية وشروط الاستخدام (Welcome Disclaimer & Legal Gatekeeper)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/30">
                First Launch Gatekeeper
              </span>
            </div>
            <p className="text-xs text-[#6D675A] dark:text-[#A7A08E] font-medium mt-0.5">
              التحكم بإلزامية الشاشة عند أول فتح للتطبيق، تعديل النص والتحذير الطبي، وفرض الخروج التلقائي عند الرفض.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleForceShowForEveryone}
            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="إعادة إظهار الشاشة لكافة المستخدمين لتأكيد الموافقة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة طلب الموافقة من الجميع</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة النص الأصلي</span>
          </button>
        </div>
      </div>

      {/* Notice Message */}
      {noticeMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Toggle Enable/Disable */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] flex items-center justify-between gap-4">
          <div>
            <span className="font-black text-sm text-[#2F2B24] dark:text-white block">
              تفعيل شاشة إخلاء المسؤولية الإلزامية عند أول تشغيل (Mandatory First-Launch Overlay)
            </span>
            <p className="text-[11px] text-[#6D675A] dark:text-[#A7A08E] mt-0.5">
              عند التفعيل، لا يمكن لأي طالب الدخول للتطبيق إلا بعد الموافقة الصريحة، ويتم طرد أي مستخدم يرفض الشروط فوراً.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              enabled
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {enabled ? (
              <>
                <Check className="w-4 h-4" />
                <span>مفعلة وإلزامية 🛡️</span>
              </>
            ) : (
              <span>معطلة مؤقتاً</span>
            )}
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            عنوان وثيقة إخلاء المسؤولية:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
        </div>

        {/* Body Text Textarea */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            نص التحذير والشروط السريرية والأكاديمية (Body Text):
          </label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs sm:text-sm font-medium leading-relaxed text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
            required
          />
          <span className="text-[11px] text-[#7A7466] dark:text-[#A7A08E] block">
            يُعرض هذا النص بتنسيق أكاديمي بارز للمستخدم عند أول فتح للتطبيق لضمان الحماية القانونية والمهنية.
          </span>
        </div>

        {/* Buttons Text Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              نص زر الموافقة والمتابعة (Button 1):
            </label>
            <input
              type="text"
              value={agreeButtonText}
              onChange={(e) => setAgreeButtonText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              نص زر الرفض والخروج الفوري (Button 2):
            </label>
            <input
              type="text"
              value={declineButtonText}
              onChange={(e) => setDeclineButtonText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#0D9488] hover:from-[#495424] hover:to-[#0B8277] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>حفظ إعدادات وثيقة إخلاء المسؤولية 💾</span>
          </button>
        </div>
      </form>
    </div>
  );
};
