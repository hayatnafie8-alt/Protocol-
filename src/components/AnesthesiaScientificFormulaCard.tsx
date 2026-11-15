import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Scale,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import {
  AnesthesiaFormulaConfig,
  getAnesthesiaFormulaConfig,
  ANESTHESIA_FORMULA_CONFIG_EVENT,
} from '../data/anesthesiaFormulaManager';
import { useLanguage } from '../contexts/LanguageContext';

interface AnesthesiaScientificFormulaCardProps {
  isAuthorAdmin?: boolean;
  isContentUnlocked?: boolean;
  onRequireLogin?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const AnesthesiaScientificFormulaCard: React.FC<AnesthesiaScientificFormulaCardProps> = ({
  isAuthorAdmin = false,
  isContentUnlocked = false,
  onRequireLogin,
  className = '',
  defaultExpanded = true,
}) => {
  const { isRTL } = useLanguage();
  const [config, setConfig] = useState<AnesthesiaFormulaConfig>(() => getAnesthesiaFormulaConfig());
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isFullscreenModal, setIsFullscreenModal] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getAnesthesiaFormulaConfig());
    };
    window.addEventListener(ANESTHESIA_FORMULA_CONFIG_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ANESTHESIA_FORMULA_CONFIG_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Check if admin hid this section completely
  if (!config.enabled && !isAuthorAdmin) {
    return null;
  }

  const isLocked = config.access === 'subscription' && !isAuthorAdmin && !isContentUnlocked;

  const renderContent = () => {
    if (isLocked) {
      return (
        <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-400 dark:border-amber-600/60 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-[#2F2B24] dark:text-white">
              {isRTL ? 'قسم المعادلات العلمية مقفل للمشتركين 🔒' : 'Scientific Equations Section Locked for Subscribers 🔒'}
            </h4>
            <p className="text-xs text-[#6B6354] dark:text-[#C5BEAF] max-w-md mx-auto mt-1 leading-relaxed">
              {isRTL
                ? 'هذا الدليل الرياضي والسريري مخصص للمشتركين وطلبة طب الأسنان المعتمدين. أدخل كود التفعيل للوصول إلى كافة المعادلات وقواعد كلارك ويونغ.'
                : 'This clinical mathematical guide is reserved for verified subscribers and dental students. Enter your activation code for full access to all pediatric and adult dosing formulas.'}
            </p>
          </div>
          {onRequireLogin && (
            <button
              type="button"
              onClick={onRequireLogin}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all cursor-pointer shadow-sm hover:scale-102"
            >
              {isRTL ? 'إدخال كود التفعيل للفتح الفوري 🔓' : 'Enter Activation Code to Unlock 🔓'}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={`space-y-5 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Top Concept Grid: MRD & Carpule Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: MRD Definition */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-black text-xs sm:text-sm">
              <Scale className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>{isRTL ? '1. الجرعة القصوى الموصى بها (MRD):' : '1. Maximum Recommended Dose (MRD):'}</span>
            </div>
            <p className="text-xs text-[#35404F] dark:text-[#CBD5E1] leading-relaxed">
              {isRTL
                ? config.mrdSummary
                : 'Calculation of Maximum Recommended Dose (MRD) based on patient body weight (mg/kg) strictly adhering to absolute systemic ceiling doses for pediatric and adult cohorts.'}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-sky-700 dark:text-sky-400">
              <span className="font-bold">ADA Guideline:</span>
              <span>MRD = Weight (kg) × Drug Constant (mg/kg)</span>
            </div>
          </div>

          {/* Card 2: Carpule Content Anatomy */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isRTL ? '2. محتوى الكاربولة القياسية (Carpule Content):' : '2. Standard Carpule Anesthetic Content Anatomy:'}</span>
            </div>
            <p className="text-xs text-[#2A4036] dark:text-[#CBD5E1] leading-relaxed">
              {isRTL
                ? config.carpuleContentExplanation
                : 'Standard dental cartridge (1.8 mL or 1.7 mL) contains defined active drug concentration: each 1% equals 10 mg/mL. Thus: 2% Lidocaine = 20 mg/mL × 1.8 mL = 36 mg/carpule (or 34 mg in 1.7 mL). 4% Articaine = 40 mg/mL × 1.8 mL = 72 mg/carpule.'}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              <span className="font-bold">1% solution = 10 mg/mL</span>
              <span>• 2% = 20 mg/mL × 1.8 mL = 36 mg</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Mathematical Workflow */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E2519] border-2 border-[#E5DEC9] dark:border-[#384524] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#59662C] dark:text-[#A4BF46] font-black text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {isRTL
                ? 'خطوات المعادلة الحسابية المتسلسلة (Step-by-Step Calculation):'
                : 'Step-by-Step Sequential Calculation Workflow:'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#161C12] border border-[#E5DEC9] dark:border-[#2C3820] space-y-1.5">
              <div className="flex items-center gap-2 font-black text-[#2F2B24] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>{isRTL ? 'الخطوة الأولى: إجمالي الجرعة المسموحة (mg)' : 'Step 1: Total Allowable Patient Dose (mg)'}</span>
              </div>
              <p className="text-[11px] text-[#595244] dark:text-[#B5AD9C] leading-relaxed">
                {isRTL
                  ? config.weightBasedFormulaStep1
                  : 'Total Allowable Dose (mg) = Patient Body Weight (kg) × Active Substance MRD Limit (mg/kg).'}
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-black/30 font-mono text-[11px] font-bold text-[#59662C] dark:text-[#CBE276] text-center border border-[#E5DEC9]/80 dark:border-neutral-800" dir="ltr">
                Total Allowed Dose (mg) = Weight (kg) × MRD (mg/kg)
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#161C12] border border-[#E5DEC9] dark:border-[#2C3820] space-y-1.5">
              <div className="flex items-center gap-2 font-black text-[#2F2B24] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>{isRTL ? 'الخطوة الثانية: الحد الأقصى لعدد الكاربولات' : 'Step 2: Maximum Safe Carpule Allowance'}</span>
              </div>
              <p className="text-[11px] text-[#595244] dark:text-[#B5AD9C] leading-relaxed">
                {isRTL
                  ? config.weightBasedFormulaStep2
                  : 'Maximum Carpule Count = Total Allowed Dose (mg) ÷ Active Drug Mass per Cartridge (e.g. 36 mg for Lidocaine 2%).'}
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-black/30 font-mono text-[11px] font-bold text-[#59662C] dark:text-[#CBE276] text-center border border-[#E5DEC9]/80 dark:border-neutral-800" dir="ltr">
                Max Cartridges = Total Dose (mg) ÷ Drug/Cartridge (mg)
              </div>
            </div>
          </div>
        </div>

        {/* Pediatric Rules (Clark's & Young's) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-black text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              {isRTL
                ? "قواعد حساب جرعات الأطفال (Clark's Rule & Young's Rule):"
                : "Pediatric Dosage Determination Rules (Clark's & Young's Formulas):"}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs text-[#3E3447] dark:text-[#D8B4FE] leading-relaxed font-medium">
            {isRTL
              ? config.pediatricRules
              : `Pediatric Pharmacological Rules:\n1. Clark's Rule (Weight-based): Pediatric Dose = [Child Weight in kg ÷ 70 kg] × Adult Maximum Dose.\n2. Young's Rule (Age-based): Pediatric Dose = [Child Age in Years ÷ (Child Age + 12)] × Adult Maximum Dose.\n3. American Academy of Pediatric Dentistry (AAPD) Recommendation: Exact weight-based titration (mg/kg) is the primary gold standard to prevent inadvertent systemic overdose.`}
          </p>
        </div>

        {/* Cardiac & Systemic Conditions Note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs sm:text-sm">
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              {isRTL
                ? 'سقف أمان مرضى القلب وقابض الأوعية (Cardiac Safety Cap):'
                : 'Cardiovascular Safety Margin & Vasoconstrictor Ceiling:'}
            </span>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-300 leading-relaxed font-medium">
            {isRTL
              ? config.cardiacLimitNote
              : 'Cardiovascular Patient Threshold (AHA / ACC Guidelines): Absolute maximum epinephrine dose for cardiac patients (ASA III/IV) is 0.04 mg per appointment (~2 carpules of 1:100,000 or 4 carpules of 1:200,000).'}
          </p>
        </div>

        {/* Clinical Safety & Negative Aspiration Alert */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/25 border-2 border-rose-300 dark:border-rose-800 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-black text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isRTL
                ? 'تنبيه سريري مانع للتسمم الجهازي (LAST Prevention):'
                : 'Critical Clinical Safety Mandate (LAST Prevention):'}
            </span>
          </div>
          <p className="text-xs text-rose-950 dark:text-rose-300 leading-relaxed font-semibold">
            {isRTL
              ? config.clinicalSafetyAlert
              : 'Mandatory Clinical Protocol: Perform dual-plane negative aspiration at 90-degree rotational angles prior to deposition to rule out intravascular cannulation. Inject with deliberate slow speed (one full carpule over a minimum of 60 seconds) to forestall acute systemic toxicity.'}
          </p>
        </div>

        {/* Academic References */}
        {config.references && config.references.length > 0 && (
          <div className="pt-2 border-t border-[#E5DEC9] dark:border-[#2C3820] space-y-1.5 text-[11px] text-[#6D675A] dark:text-[#A7A08E]">
            <span className="font-bold text-[#2F2B24] dark:text-white block">
              {isRTL ? 'المراجع الأكاديمية المعتمدة (Approved Academic References):' : 'Approved Academic References & Literature:'}
            </span>
            <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
              {config.references.map((ref, idx) => (
                <li key={`anes_ref_${idx}`}>{ref}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-xs ${
          isLocked
            ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
            : 'bg-[#FAF7F2] dark:bg-[#161C12] border-[#D4AF37]/50 dark:border-[#59662C]'
        } ${className}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Accordion / Card Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-[#E5DEC9] dark:border-[#2C3820] bg-white/70 dark:bg-[#1A2216]">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#0D9488] text-white flex items-center justify-center shadow-md shrink-0">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                  {isRTL ? 'المعادلة المعتمدة • Scientific Formula' : 'Evidence-Based Formulation'}
                </span>
                {config.access === 'free' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    <span>{isRTL ? 'متاح مجاناً' : 'Free Access'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>{isRTL ? 'للمشتركين' : 'Subscribers Only'}</span>
                  </span>
                )}
                {!config.enabled && isAuthorAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {isRTL ? 'مخفي عن الطلاب' : 'Hidden from Students'}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white truncate">
                {isRTL ? config.title : config.titleEn}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen Expand Button */}
            <button
              type="button"
              onClick={() => setIsFullscreenModal(true)}
              className="p-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-[#59662C] dark:text-[#A4BF46] hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all cursor-pointer shadow-2xs"
              title={isRTL ? 'عرض المعادلة في نافذة كاملة ملء الشاشة' : 'Expand full screen'}
            >
              <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Toggle Accordion */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && <div className="p-5 sm:p-6 animate-in fade-in duration-200">{renderContent()}</div>}
      </div>

      {/* Standalone Fullscreen Modal Mode for the Formula */}
      {isFullscreenModal && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-[#FAF7F2] dark:bg-[#151A10] border-2 border-[#D4AF37] rounded-none sm:rounded-[2.5rem] w-full max-w-4xl max-h-screen sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Fullscreen Header */}
            <div className="p-5 sm:p-6 border-b border-[#E5DEC9] dark:border-[#2C3820] bg-white dark:bg-[#1A2216] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#0D9488] text-white flex items-center justify-center shadow-md">
                  <Calculator className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    {isRTL ? config.title : config.titleEn}
                  </h3>
                  <p className="text-xs text-[#59662C] dark:text-[#A4BF46] font-mono mt-0.5">
                    {isRTL ? config.titleEn : config.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModal(false)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Minimize2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{isRTL ? 'إنهاء ملء الشاشة' : 'Exit Fullscreen'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreenModal(false)}
                  className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Fullscreen Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-thin">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
