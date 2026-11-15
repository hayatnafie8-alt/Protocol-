import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  CheckCircle2,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import {
  AnesthesiaFormulaConfig,
  getAnesthesiaFormulaConfig,
  saveAnesthesiaFormulaConfig,
  DEFAULT_ANESTHESIA_FORMULA_CONFIG,
  ANESTHESIA_FORMULA_CONFIG_EVENT,
} from '../data/anesthesiaFormulaManager';

interface AnesthesiaFormulaAdminManagerProps {
  className?: string;
}

export const AnesthesiaFormulaAdminManager: React.FC<AnesthesiaFormulaAdminManagerProps> = ({
  className = '',
}) => {
  const [config, setConfig] = useState<AnesthesiaFormulaConfig>(() => getAnesthesiaFormulaConfig());
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [access, setAccess] = useState<'free' | 'subscription'>(config.access);
  const [title, setTitle] = useState<string>(config.title);
  const [titleEn, setTitleEn] = useState<string>(config.titleEn);
  const [mrdSummary, setMrdSummary] = useState<string>(config.mrdSummary);
  const [carpuleContentExplanation, setCarpuleContentExplanation] = useState<string>(
    config.carpuleContentExplanation
  );
  const [weightBasedFormulaStep1, setWeightBasedFormulaStep1] = useState<string>(
    config.weightBasedFormulaStep1
  );
  const [weightBasedFormulaStep2, setWeightBasedFormulaStep2] = useState<string>(
    config.weightBasedFormulaStep2
  );
  const [pediatricRules, setPediatricRules] = useState<string>(config.pediatricRules);
  const [cardiacLimitNote, setCardiacLimitNote] = useState<string>(config.cardiacLimitNote);
  const [clinicalSafetyAlert, setClinicalSafetyAlert] = useState<string>(
    config.clinicalSafetyAlert
  );
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const c = getAnesthesiaFormulaConfig();
      setConfig(c);
      setEnabled(c.enabled);
      setAccess(c.access);
      setTitle(c.title);
      setTitleEn(c.titleEn);
      setMrdSummary(c.mrdSummary);
      setCarpuleContentExplanation(c.carpuleContentExplanation);
      setWeightBasedFormulaStep1(c.weightBasedFormulaStep1);
      setWeightBasedFormulaStep2(c.weightBasedFormulaStep2);
      setPediatricRules(c.pediatricRules);
      setCardiacLimitNote(c.cardiacLimitNote);
      setClinicalSafetyAlert(c.clinicalSafetyAlert);
    };
    window.addEventListener(ANESTHESIA_FORMULA_CONFIG_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ANESTHESIA_FORMULA_CONFIG_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveAnesthesiaFormulaConfig({
      enabled,
      access,
      title: title.trim(),
      titleEn: titleEn.trim(),
      mrdSummary: mrdSummary.trim(),
      carpuleContentExplanation: carpuleContentExplanation.trim(),
      weightBasedFormulaStep1: weightBasedFormulaStep1.trim(),
      weightBasedFormulaStep2: weightBasedFormulaStep2.trim(),
      pediatricRules: pediatricRules.trim(),
      cardiacLimitNote: cardiacLimitNote.trim(),
      clinicalSafetyAlert: clinicalSafetyAlert.trim(),
    });
    setConfig(updated);
    setNoticeMsg('تم حفظ وتحديث إعدادات ومعادلات حاسبة التخدير السريرية بنجاح! 💾');
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تودين استعادة المعادلات والنصوص الافتراضية لحاسبة التخدير الموضعي؟')) {
      const def = saveAnesthesiaFormulaConfig(DEFAULT_ANESTHESIA_FORMULA_CONFIG);
      setConfig(def);
      setEnabled(def.enabled);
      setAccess(def.access);
      setTitle(def.title);
      setTitleEn(def.titleEn);
      setMrdSummary(def.mrdSummary);
      setCarpuleContentExplanation(def.carpuleContentExplanation);
      setWeightBasedFormulaStep1(def.weightBasedFormulaStep1);
      setWeightBasedFormulaStep2(def.weightBasedFormulaStep2);
      setPediatricRules(def.pediatricRules);
      setCardiacLimitNote(def.cardiacLimitNote);
      setClinicalSafetyAlert(def.clinicalSafetyAlert);
      setNoticeMsg('تمت استعادة الإعدادات والمعادلات الافتراضية بنجاح 🔄');
      setTimeout(() => setNoticeMsg(null), 3500);
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#384524] shadow-sm space-y-6 text-right ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#0D9488] text-white flex items-center justify-center shadow-md">
            <Calculator className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إدارة قسم المعادلة العلمية للتخدير (Scientific Anesthesia Formulas & Rules)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:bg-[#A4BF46]/20 dark:text-[#CBE276] border border-[#59662C]/30">
                Malamed & ADA Guidelines
              </span>
            </div>
            <p className="text-xs text-[#6D675A] dark:text-[#A7A08E] font-medium mt-0.5">
              تحكم كامل في إظهار أو إخفاء المعادلة، نوع الوصول (مجاني للعامة أو يتطلب اشتراكاً)، وتعديل نصوص وقواعد الحساب وقواعد الأطفال.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة المعادلات الافتراضية</span>
        </button>
      </div>

      {noticeMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Visibility & Access Control Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle Visibility */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] flex items-center justify-between gap-3">
            <div>
              <span className="font-black text-sm text-[#2F2B24] dark:text-white block">
                حالة الظهور (Visibility)
              </span>
              <p className="text-[11px] text-[#6D675A] dark:text-[#A7A08E]">
                إظهار أو إخفاء بطاقة المعادلة العلمية من واجهة الحاسبة السريرية
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                enabled
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {enabled ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>ظاهرة للطلاب 👁️</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>مخفية 🚫</span>
                </>
              )}
            </button>
          </div>

          {/* Access Mode */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] flex items-center justify-between gap-3">
            <div>
              <span className="font-black text-sm text-[#2F2B24] dark:text-white block">
                مستوى الوصول (Access Level)
              </span>
              <p className="text-[11px] text-[#6D675A] dark:text-[#A7A08E]">
                متاح مجاناً للجميع أو مقفل للمشتركين بكود تفعيل
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAccess(access === 'free' ? 'subscription' : 'free')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                access === 'free'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
              }`}
            >
              {access === 'free' ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🔓 مجاني للعامة</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>🔒 يتطلب اشتراك</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              عنوان القسم بالعربية:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] font-bold text-[#2F2B24] dark:text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              عنوان القسم بالإنجليزية:
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] font-mono text-xs text-[#2F2B24] dark:text-white"
              required
            />
          </div>
        </div>

        {/* MRD & Carpule Content Explanations */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            شرح الجرعة القصوى الموصى بها (MRD):
          </label>
          <textarea
            value={mrdSummary}
            onChange={(e) => setMrdSummary(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-medium leading-relaxed text-[#2F2B24] dark:text-white"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            شرح حساب محتوى الكاربولة (Carpule Content Calculation):
          </label>
          <textarea
            value={carpuleContentExplanation}
            onChange={(e) => setCarpuleContentExplanation(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-medium leading-relaxed text-[#2F2B24] dark:text-white"
            required
          />
        </div>

        {/* Step-by-Step Formula Strings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              صيغة الخطوة 1 (إجمالي المجم المسموح):
            </label>
            <input
              type="text"
              value={weightBasedFormulaStep1}
              onChange={(e) => setWeightBasedFormulaStep1(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold text-[#2F2B24] dark:text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-[#2F2B24] dark:text-white block">
              صيغة الخطوة 2 (الحد الأقصى للكاربولات):
            </label>
            <input
              type="text"
              value={weightBasedFormulaStep2}
              onChange={(e) => setWeightBasedFormulaStep2(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold text-[#2F2B24] dark:text-white"
              required
            />
          </div>
        </div>

        {/* Pediatric Rules (Clark & Young) */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            قواعد الأطفال (Clark's Rule & Young's Rule):
          </label>
          <textarea
            value={pediatricRules}
            onChange={(e) => setPediatricRules(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-medium leading-relaxed text-[#2F2B24] dark:text-white"
            required
          />
        </div>

        {/* Cardiac & Systemic Warning Note */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            سقف أمان مرضى القلب وقابض الأوعية (Cardiac Safety):
          </label>
          <textarea
            value={cardiacLimitNote}
            onChange={(e) => setCardiacLimitNote(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-medium leading-relaxed text-[#2F2B24] dark:text-white"
            required
          />
        </div>

        {/* Clinical Safety & Negative Aspiration Alert */}
        <div className="space-y-1.5">
          <label className="font-black text-[#2F2B24] dark:text-white block">
            تنبيه الشفط السلبي والوقاية من LAST:
          </label>
          <textarea
            value={clinicalSafetyAlert}
            onChange={(e) => setClinicalSafetyAlert(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] text-xs font-medium leading-relaxed text-[#2F2B24] dark:text-white"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#0D9488] hover:from-[#495424] hover:to-[#0B8277] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>حفظ إعدادات وتعديلات المعادلة العلمية 💾</span>
          </button>
        </div>
      </form>
    </div>
  );
};
