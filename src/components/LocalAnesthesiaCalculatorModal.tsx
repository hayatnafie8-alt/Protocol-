import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Syringe,
  Heart,
  Activity,
  AlertOctagon,
  FileText,
  Copy,
  RotateCcw,
  Info,
  Scale,
  Sparkles,
  ChevronRight,
  Stethoscope,
  ExternalLink,
  BookOpen,
  UserCheck,
  Zap,
  Calculator,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  AnestheticId,
  CartridgeSize,
  AgeCategory,
  ANESTHETIC_DRUGS,
  ComorbidityFactors,
  CalculationInput,
  calculateLocalAnestheticDose,
  generateClinicalChartNote,
  LAST_EMERGENCY_PROTOCOL,
} from '../data/anesthesiaCalculatorData';
import { AnesthesiaScientificFormulaCard } from './AnesthesiaScientificFormulaCard';
import { useLanguage } from '../contexts/LanguageContext';

interface LocalAnesthesiaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthorAdmin?: boolean;
  isContentUnlocked?: boolean;
  onOpenSubscribeModal?: () => void;
}

export const LocalAnesthesiaCalculatorModal: React.FC<LocalAnesthesiaCalculatorModalProps> = ({
  isOpen,
  onClose,
  isAuthorAdmin = false,
  isContentUnlocked = false,
  onOpenSubscribeModal,
}) => {
  const { language, t, isRTL } = useLanguage();
  // 1. Mandatory Legal Disclaimer Gatekeeper State
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState<boolean>(() => {
    try {
      return localStorage.getItem('la_calculator_legal_accepted') === 'true';
    } catch {
      return false;
    }
  });
  const [legalAgreementChecked, setLegalAgreementChecked] = useState(false);
  const [showLegalModalManual, setShowLegalModalManual] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active view tab inside calculator
  const [activeTab, setActiveTab] = useState<'calculator' | 'formula' | 'emergency' | 'drugs_info'>('calculator');
  const [isFormulaSectionExpanded, setIsFormulaSectionExpanded] = useState<boolean>(true);

  // 2. Calculation Inputs
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightInputStr, setWeightInputStr] = useState<string>('70');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('adult');
  const [childAgeYears, setChildAgeYears] = useState<number>(6);
  const [anestheticId, setAnestheticId] = useState<AnestheticId>('lidocaine');
  const [cartridgeSize, setCartridgeSize] = useState<CartridgeSize>('1.8');

  // 3. Comorbidities
  const [cardiovascularDisease, setCardiovascularDisease] = useState<boolean>(false);
  const [hepaticOrRenalImpairment, setHepaticOrRenalImpairment] = useState<boolean>(false);
  const [sulfiteAllergy, setSulfiteAllergy] = useState<boolean>(false);
  const [pregnancy, setPregnancy] = useState<boolean>(false);

  // 4. Administered Cartridges Tracking
  const [cartridgesAdministered, setCartridgesAdministered] = useState<number>(0);

  // Feedback toast for clipboard copying
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Keep weight input string synchronized with numerical value
  const handleWeightChange = (valStr: string) => {
    setWeightInputStr(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setWeightKg(parsed);
    }
  };

  const handleQuickWeightSelect = (kg: number) => {
    setWeightKg(kg);
    setWeightInputStr(kg.toString());
  };

  const handleAcceptLegalTerms = () => {
    if (!legalAgreementChecked) return;
    try {
      localStorage.setItem('la_calculator_legal_accepted', 'true');
    } catch {}
    setHasAcceptedLegal(true);
    setShowLegalModalManual(false);
  };

  const handleResetLegalAcceptance = () => {
    try {
      localStorage.removeItem('la_calculator_legal_accepted');
    } catch {}
    setHasAcceptedLegal(false);
    setLegalAgreementChecked(false);
    setShowLegalModalManual(true);
  };

  // Perform Real-Time Calculation
  const calculationResult = useMemo(() => {
    const input: CalculationInput = {
      weightKg,
      ageCategory,
      childAgeYears: ageCategory === 'pediatric' ? childAgeYears : undefined,
      anestheticId,
      cartridgeSize,
      comorbidities: {
        cardiovascularDisease,
        hepaticOrRenalImpairment,
        sulfiteAllergy,
        pregnancy,
      },
      cartridgesAdministered,
    };
    return calculateLocalAnestheticDose(input);
  }, [
    weightKg,
    ageCategory,
    childAgeYears,
    anestheticId,
    cartridgeSize,
    cardiovascularDisease,
    hepaticOrRenalImpairment,
    sulfiteAllergy,
    pregnancy,
    cartridgesAdministered,
  ]);

  // Handle Chart Note Copy
  const handleCopyChartNote = () => {
    const input: CalculationInput = {
      weightKg,
      ageCategory,
      childAgeYears,
      anestheticId,
      cartridgeSize,
      comorbidities: {
        cardiovascularDisease,
        hepaticOrRenalImpairment,
        sulfiteAllergy,
        pregnancy,
      },
      cartridgesAdministered,
    };
    const noteText = generateClinicalChartNote(input, calculationResult, isRTL ? 'ar' : 'en');
    try {
      navigator.clipboard.writeText(noteText);
      setCopyToast(isRTL ? 'تم نسخ التقرير السريري للملف بنجاح! 📋' : 'Clinical LA note copied to clipboard! 📋');
      setTimeout(() => setCopyToast(null), 3500);
    } catch {
      setCopyToast(isRTL ? 'يرجى تحديد النص يدويًا للنسخ.' : 'Please copy text manually.');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  // Reset to Healthy Adult Default
  const handleResetForm = () => {
    setWeightKg(70);
    setWeightInputStr('70');
    setAgeCategory('adult');
    setChildAgeYears(6);
    setAnestheticId('lidocaine');
    setCartridgeSize('1.8');
    setCardiovascularDisease(false);
    setHepaticOrRenalImpairment(false);
    setSulfiteAllergy(false);
    setPregnancy(false);
    setCartridgesAdministered(0);
  };

  if (!isOpen) return null;

  const currentDrug = ANESTHETIC_DRUGS[anestheticId];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. Mandatory Legal Disclaimer Modal (Gatekeeper or Manual Review) */}
      {(!hasAcceptedLegal || showLegalModalManual) && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E2419] border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {showLegalModalManual && (
              <button
                onClick={() => setShowLegalModalManual(false)}
                className="absolute top-5 left-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={isRTL ? 'إغلاق الشروط القانونية' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
                  {isRTL ? 'بوابة الأمان السريري والإشعار القانوني الملزم' : 'Clinical Safety & Medicolegal Gatekeeper'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {isRTL ? 'شروط الاستخدام وإخلاء المسؤولية الطبية' : 'Medicolegal Terms of Use & Clinical Disclaimer'}
                </h3>
              </div>
            </div>

            {/* Exact Legal Disclaimer Box (Arabic & English) */}
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#161B12]">
              <div className="p-3.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-semibold space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-sm sm:text-base text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{isRTL ? 'تنبيه للاستخدام التعليمي فقط:' : 'Educational & Clinical Training Use Only:'}</span>
                </p>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {isRTL
                    ? 'هذه الحاسبة هي أداة دراسية مساعدة لطلبة طب الأسنان، وليست بديلاً عن التشخيص والتقدير السريري الخاص بكل حالة. المسؤولية القانونية والطبية الكاملة تقع عاتق الطبيب المعالج وحده. يرجى دائماً مراجعة بروتوكولات الأدوية الرسمية والجرعات الخاصة بالمصنع قبل الحقن.'
                    : 'This calculator is a clinical decision aid engineered for dental candidates and must not replace individualized chairside diagnosis. Ultimate diagnostic and prescriptive responsibility rests entirely with the treating clinician. Always consult verified pharmaceutical monographs prior to administration.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300 space-y-1.5 font-mono text-xs">
                <p className="font-bold text-neutral-900 dark:text-white">MALAMED DOSAGE METHODOLOGY:</p>
                <p className="leading-relaxed">
                  Formulations calculated based on Handbook of Local Anesthesia (7th Edition) and ADA Council on Scientific Affairs clinical recommendations.
                </p>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <p className="font-bold text-neutral-800 dark:text-neutral-200">{isRTL ? 'المرجعيات العلمية المعتمدة بالحاسبة:' : 'Accredited Scientific Literature:'}</p>
                <ul className="list-disc list-inside space-y-1 pr-1">
                  <li>Malamed SF. Handbook of Local Anesthesia (7th Edition).</li>
                  <li>American Dental Association (ADA) Guidelines on Local Anesthetics in Dentistry.</li>
                  <li>FDA Drug Product Monographs & Maximum Recommended Doses (MRD).</li>
                </ul>
              </div>
            </div>

            {/* Checkbox Gatekeeper */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 hover:border-amber-500/60 transition-colors">
                <input
                  type="checkbox"
                  checked={legalAgreementChecked}
                  onChange={(e) => setLegalAgreementChecked(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded text-[#596628] focus:ring-amber-500 border-neutral-300 cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  {isRTL
                    ? 'أقر بأنني قرأت ووافقت على الشروط السريرية والقانونية، وأتحمل كطبيب/طالب كامل المسؤولية المهنية.'
                    : 'I certify that I have reviewed the clinical parameters, understand the MRD boundaries, and assume full professional responsibility.'}
                  <span className="block text-[11px] text-neutral-500 font-normal mt-0.5">
                    {isRTL ? 'I have read and agree to the Clinical & Legal terms.' : 'Faculty-approved clinical decision support protocol.'}
                  </span>
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {isRTL ? 'إلغاء وخروج' : 'Dismiss'}
              </button>

              <button
                type="button"
                disabled={!legalAgreementChecked}
                onClick={handleAcceptLegalTerms}
                className={`px-7 py-3 rounded-xl text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  legalAgreementChecked
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30 active:scale-95'
                    : 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed opacity-60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isRTL ? 'متابعة ودخول الحاسبة السريرية (Proceed)' : 'Proceed to Metric Calculator'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Calculator Window */}
      <div className="bg-[#FAF8F5] dark:bg-[#181C14] border-2 border-[#596628]/40 dark:border-[#384524] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-5 sm:px-7 py-4 bg-white dark:bg-[#20271A] border-b border-[#E5DEC9] dark:border-[#2D3720] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#596628] to-[#3E471C] text-white flex items-center justify-center shadow-md shrink-0">
              <Syringe className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                  Evidence-Based Clinical Grade
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                  Malamed Standards
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                {isRTL
                  ? 'حاسبة جرعات وأمان التخدير الموضعي (LA Dose & Safety Calculator)'
                  : 'Local Anesthesia Maximum Recommended Dose (MRD) Metric'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLegalModalManual(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
              title={isRTL ? 'عرض الشروط القانونية والسريرية' : 'View Safety Terms'}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{isRTL ? 'الشروط القانونية' : 'Safety Terms'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isRTL ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-5 sm:px-7 py-2.5 bg-neutral-100/70 dark:bg-[#141810] border-b border-[#E5DEC9] dark:border-[#2D3720] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-[#596628] text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#20271A]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isRTL ? 'الحاسبة السريرية التفاعلية' : 'Interactive Metric'}</span>
            </button>

            <button
              onClick={() => setActiveTab('formula')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'formula'
                  ? 'bg-[#D4AF37] text-neutral-900 font-extrabold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#20271A]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRTL ? 'المعادلة العلمية للحساب 🧪' : 'Scientific Formula 🧪'}</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'emergency'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#20271A]'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
              <span>{isRTL ? 'طوارئ التسمم LAST' : 'LAST Emergency'}</span>
            </button>

            <button
              onClick={() => setActiveTab('drugs_info')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'drugs_info'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#20271A]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-500" />
              <span>{isRTL ? 'دليل المقارنة الدوائية' : 'Drug Formulary'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetForm}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 flex items-center gap-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isRTL ? 'إعادة تعيين إلى الحالة الافتراضية' : 'Reset Inputs'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRTL ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: INTERACTIVE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* High Contraindication Alerts (Top Priority) */}
              {calculationResult.isContraindicated && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 font-black text-sm sm:text-base text-red-700 dark:text-red-400">
                    <AlertOctagon className="w-5 h-5 shrink-0 text-red-600" />
                    <span>
                      {isRTL
                        ? 'تحذير أمان عالي: موانع استعمال سريرية مطلقة (Contraindication)'
                        : 'Critical Safety Alert: Absolute Clinical Contraindication'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {calculationResult.contraindicationReason}
                  </p>
                </div>
              )}

              {/* General Active Alerts */}
              {calculationResult.alerts.map((alt, idx) => (
                <div
                  key={`calc_alert_${idx}`}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    alt.type === 'red'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-900 dark:text-red-200'
                      : alt.type === 'orange'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200'
                      : 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 text-sky-900 dark:text-sky-200'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alt.type === 'red' ? 'text-red-600' : alt.type === 'orange' ? 'text-amber-600' : 'text-sky-600'
                    }`}
                  />
                  <div className="space-y-0.5 text-xs sm:text-sm leading-relaxed">
                    <p className="font-black">{isRTL ? alt.titleAr : alt.titleEn}</p>
                    <p className="font-medium text-xs opacity-90">{isRTL ? alt.messageAr : alt.messageEn}</p>
                  </div>
                </div>
              ))}

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column 1: Patient Parameters */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-[#E5DEC9] dark:border-[#2D3720] shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <h3 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                      <span>{isRTL ? 'بيانات المريض الأساسية (Patient Profile)' : 'Patient Clinical Profile & Parameters'}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-neutral-400">Step 1</span>
                  </div>

                  {/* Age Group Toggle */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {isRTL ? 'الفئة العمرية (Age Category):' : 'Age Classification:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAgeCategory('adult')}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          ageCategory === 'adult'
                            ? 'bg-[#596628] text-white shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {isRTL ? 'بالغ (Adult)' : 'Adult (≥ 14 yrs)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgeCategory('pediatric')}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          ageCategory === 'pediatric'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        {isRTL ? 'طفل (Pediatric)' : 'Pediatric (< 14 yrs)'}
                      </button>
                    </div>
                  </div>

                  {/* If Pediatric: Child Age in Years */}
                  {ageCategory === 'pediatric' && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-900 dark:text-amber-200">
                          {isRTL ? 'عمر الطفل بالسنوات (Child Age):' : 'Child Age (Years):'}
                        </label>
                        <span className="text-xs font-extrabold text-amber-700">
                          {isRTL ? `${childAgeYears} سنوات` : `${childAgeYears} years`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="14"
                        step="1"
                        value={childAgeYears}
                        onChange={(e) => setChildAgeYears(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                        <span>{isRTL ? '2 سنة (أرتيكائين ممنوع)' : '2 yrs (Articaine Prohibited)'}</span>
                        <span>{isRTL ? '4 سنوات (الحد الأدنى للأرتيكائين)' : '4 yrs (Articaine Minimum)'}</span>
                        <span>{isRTL ? '14 سنة' : '14 yrs'}</span>
                      </div>
                    </div>
                  )}

                  {/* Weight Input Box with Live Validation */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {isRTL ? 'وزن المريض بالكيلوجرام (Weight in kg):' : 'Patient Weight in Kilograms (kg):'}
                      </label>
                      <span className="text-[11px] font-bold text-neutral-400">
                        {isRTL ? 'النطاق المسموح: 2 - 150 كجم' : 'Permitted Range: 2 - 150 kg'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="150"
                        step="0.5"
                        value={weightInputStr}
                        onChange={(e) => handleWeightChange(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-base font-black border transition-all text-neutral-900 dark:text-white bg-neutral-50 dark:bg-[#12160E] focus:outline-none focus:ring-2 ${
                          !calculationResult.isValid
                            ? 'border-red-500 focus:ring-red-400 bg-red-50/30'
                            : 'border-neutral-300 dark:border-neutral-700 focus:ring-[#596628]'
                        }`}
                        placeholder={isRTL ? 'أدخل الوزن بالكيلوغرام...' : 'Enter weight in kg...'}
                      />
                      <span className="absolute left-3 top-2.5 text-xs font-black text-neutral-400 pointer-events-none">
                        {isRTL ? 'كجم (kg)' : 'kg'}
                      </span>
                    </div>

                    {/* Live Validation Error */}
                    {!calculationResult.isValid && calculationResult.validationError && (
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 pt-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>{calculationResult.validationError}</span>
                      </p>
                    )}

                    {/* Quick Weight Presets */}
                    <div className="space-y-1 pt-1.5">
                      <span className="text-[10px] font-bold text-neutral-500 block">
                        {isRTL ? 'أوزان سريعة شائعة:' : 'Common Weight Presets:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ageCategory === 'pediatric' ? (
                          <>
                            {[15, 20, 25, 30, 35].map((w, wIdx) => (
                              <button
                                key={`w_pediatric_${w}_${wIdx}`}
                                type="button"
                                onClick={() => handleQuickWeightSelect(w)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                  weightKg === w
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                                }`}
                              >
                                {w} {isRTL ? 'كجم' : 'kg'}
                              </button>
                            ))}
                          </>
                        ) : (
                          <>
                            {[50, 60, 70, 80, 90, 100].map((w, wIdx) => (
                              <button
                                key={`w_adult_${w}_${wIdx}`}
                                type="button"
                                onClick={() => handleQuickWeightSelect(w)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                  weightKg === w
                                    ? 'bg-[#596628] text-white border-[#596628]'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                                }`}
                              >
                                {w} {isRTL ? 'كجم' : 'kg'}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Comorbidity Checkboxes */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <label className="block text-xs font-black text-neutral-800 dark:text-neutral-200">
                      {isRTL ? 'الحالات المرضية المرافقة (Comorbidities & Risk Factors):' : 'Systemic Comorbidities & Risk Modifiers:'}
                    </label>

                    {/* Cardiovascular Risk Checkbox */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={cardiovascularDisease}
                        onChange={(e) => setCardiovascularDisease(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-neutral-300 cursor-pointer"
                      />
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-amber-950 dark:text-amber-200 block">
                          {isRTL
                            ? 'أمراض القلب / ارتفاع الضغط / نشاط الغدة الدرقية غير المسيطر عليه'
                            : 'Cardiovascular Disease / Refractory HTN / Uncontrolled Hyperthyroidism'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {isRTL
                            ? 'تحديد الأدرينالين بحد أقصى 0.04 ملغ (~أمبولتين فقط من تركيز 1:100,000)'
                            : 'Strict Epinephrine cardiac ceiling of 0.04 mg (~max 2 cartridges of 1:100,000)'}
                        </span>
                      </div>
                    </label>

                    {/* Hepatic or Renal Impairment */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={hepaticOrRenalImpairment}
                        onChange={(e) => setHepaticOrRenalImpairment(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-neutral-300 cursor-pointer"
                      />
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-amber-950 dark:text-amber-200 block">
                          {isRTL
                            ? 'اعتلال وظائف الكبد أو الكلى (Hepatic / Renal Impairment)'
                            : 'Hepatic or Renal Impairment (Decreased Clearance)'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {isRTL
                            ? 'تخفيض الجرعة القصوى المحسوبة تلقائياً بنسبة 30% لتباطؤ التخلص الدوائي'
                            : 'Automatic 30% MRD reduction due to delayed pharmacokinetic elimination'}
                        </span>
                      </div>
                    </label>

                    {/* Sulfite Allergy */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={sulfiteAllergy}
                        onChange={(e) => setSulfiteAllergy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300 cursor-pointer"
                      />
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-red-900 dark:text-red-300 block">
                          {isRTL
                            ? 'حساسية مؤكدة من السلفيت (True Bisulfite Allergy)'
                            : 'Documented Bisulfite Preservative Allergy'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {isRTL
                            ? 'مانع استعمال للأدرينالين (مادة Metabisulfite الحافظة). يفضل ميبايفاكين سادة'
                            : 'Absolute contraindication to vasoconstrictor solutions. Use Plain Mepivacaine 3%'}
                        </span>
                      </div>
                    </label>

                    {/* Pregnancy */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={pregnancy}
                        onChange={(e) => setPregnancy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-neutral-300 cursor-pointer"
                      />
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-sky-950 dark:text-sky-200 block">
                          {isRTL
                            ? 'مريضة حامل (Pregnancy)'
                            : 'Pregnant Patient (FDA Risk Stratification)'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {isRTL
                            ? 'ليدوكائين 2% هو الخيار الأكثر أماناً (FDA Category B). تجنب أرتيكائين وميبايفاكين (Category C)'
                            : 'Lidocaine 2% with Epi is first-choice (FDA Category B). Avoid Articaine & Mepivacaine (Category C)'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Column 2: Anesthetic Drug & Cartridge Selection */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-[#E5DEC9] dark:border-[#2D3720] shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <h3 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                      <span>{isRTL ? 'المادة المخدرة وحجم الأمبولة (Anesthetic Selection)' : 'Anesthetic Formulation & Cartridge Volume'}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-neutral-400">Step 2</span>
                  </div>

                  {/* Drug Selector (3 Options) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {isRTL ? 'اختر المخدر الموضعي (Local Anesthetic Drug):' : 'Select Local Anesthetic Formulation:'}
                    </label>

                    {/* Option 1: Lidocaine */}
                    <button
                      type="button"
                      onClick={() => setAnestheticId('lidocaine')}
                      className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                        anestheticId === 'lidocaine'
                          ? 'border-[#596628] bg-[#596628]/10 dark:bg-[#596628]/20 shadow-xs ring-2 ring-[#596628]'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {isRTL ? 'ليدوكائين 2% مع أدرينالين 1:100,000' : 'Lidocaine 2% with Epinephrine 1:100,000'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                          Category B • Gold Standard
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {isRTL
                          ? 'MRD: 4.4 mg/kg (سقف أقصى: 300 mg) • 36 mg مخدر + 0.018 mg إبينيفرين بالأمبولة القياسية'
                          : 'MRD: 4.4 mg/kg (Ceiling: 300 mg) • 36 mg anesthetic + 0.018 mg epinephrine per standard cartridge'}
                      </p>
                    </button>

                    {/* Option 2: Articaine */}
                    <button
                      type="button"
                      onClick={() => setAnestheticId('articaine')}
                      className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                        anestheticId === 'articaine'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 shadow-xs ring-2 ring-indigo-600'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {isRTL ? 'أرتيكائين 4% مع أدرينالين 1:100,000' : 'Articaine 4% with Epinephrine 1:100,000'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200">
                          Superior Bone Diffusion
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {isRTL
                          ? 'MRD: 7.0 mg/kg (سقف أقصى: 500 mg) • 72 mg مخدر • ممنوع للأطفال تحت سن 4 سنوات'
                          : 'MRD: 7.0 mg/kg (Ceiling: 500 mg) • 72 mg anesthetic • Prohibited in children < 4 years'}
                      </p>
                    </button>

                    {/* Option 3: Mepivacaine */}
                    <button
                      type="button"
                      onClick={() => setAnestheticId('mepivacaine')}
                      className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                        anestheticId === 'mepivacaine'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-600'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {isRTL ? 'ميبايفاكين 3% سادة (بدون قابض أوعية)' : 'Mepivacaine 3% Plain (Vasoconstrictor-Free)'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200">
                          Sulfite-Free • Plain
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {isRTL
                          ? 'MRD: 4.4 mg/kg (سقف أقصى: 300 mg) • 54 mg مخدر • الخيار الأمثل لحساسية السلفيت ومرضى القلب'
                          : 'MRD: 4.4 mg/kg (Ceiling: 300 mg) • 54 mg anesthetic • First-line for sulfite allergy & cardiac risk'}
                      </p>
                    </button>
                  </div>

                  {/* Cartridge Size Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {isRTL ? 'حجم الأمبولة المستخدمة في العيادة (Cartridge Volume):' : 'Clinical Cartridge Volume:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCartridgeSize('1.8')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          cartridgeSize === '1.8'
                            ? 'bg-[#596628] text-white border-[#596628] shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        <span className="block font-black text-xs sm:text-sm">{isRTL ? '1.8 مل (القياسي الشائع)' : '1.8 mL (Standard Dental)'}</span>
                        <span className="text-[10px] opacity-80">1.8 mL Standard Dental</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCartridgeSize('2.2')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          cartridgeSize === '2.2'
                            ? 'bg-[#596628] text-white border-[#596628] shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        <span className="block font-black text-xs sm:text-sm">{isRTL ? '2.2 مل (الأمبولة الكبيرة)' : '2.2 mL (Large Format)'}</span>
                        <span className="text-[10px] opacity-80">2.2 mL Large Format</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-600 dark:text-neutral-400">
                        {isRTL ? `محتوى الأمبولة المختارة (${cartridgeSize} مل):` : `Payload per ${cartridgeSize} mL Cartridge:`}
                      </span>
                      <span className="font-black text-[#596628] dark:text-[#A8C24E]">
                        {calculationResult.anestheticMgPerCartridge} {isRTL ? 'ملغ مخدر' : 'mg Anesthetic'}
                        {currentDrug.hasVasoconstrictor && ` + ${calculationResult.epiMgPerCartridge} ${isRTL ? 'ملغ أدرينالين' : 'mg Epi'}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE RESULTS DISPLAY CARDS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>{isRTL ? 'النتائج السريرية وسقف الأمان المعتمد (Calculated Safe Limits)' : 'Evidence-Based Safe Limits & Dosage Calculation'}</span>
                  </h3>
                  <button
                    onClick={handleCopyChartNote}
                    className="px-3.5 py-1.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'نسخ التقرير للملف الطبي' : 'Copy EHR Chart Note'}</span>
                  </button>
                </div>

                {copyToast && (
                  <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{copyToast}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Safe Max Cartridges (The Crown Metric) */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#596628] to-[#3B441B] text-white shadow-lg space-y-2 relative overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-amber-300 block">
                      {isRTL ? 'الحد الأقصى الآمن للحقن' : 'Maximum Safe Limit'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight">
                        {calculationResult.finalSafeCartridges}
                      </span>
                      <span className="text-sm font-bold opacity-90">{isRTL ? 'أمبولة (Carpules)' : 'Carpules'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-200 leading-tight">
                      {isRTL
                        ? 'تم التقريب للأسفل لأقرب منزلة عشرية لضمان الأمان السريري المطلق.'
                        : 'Rounded down to nearest decimal to maintain absolute therapeutic margin of safety.'}
                    </p>
                  </div>

                  {/* Card 2: Maximum Recommended Dose (MRD) in mg */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-[#E5DEC9] dark:border-[#2D3720] shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                      {isRTL ? 'الجرعة القصوى المسموحة (MRD)' : 'Maximum Recommended Dose (MRD)'}
                    </span>
                    <div className="flex items-baseline gap-1.5 text-neutral-900 dark:text-white">
                      <span className="text-3xl sm:text-4xl font-black">
                        {calculationResult.effectiveMrdMg}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">{isRTL ? 'ملغ (mg)' : 'mg'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      {isRTL
                        ? `معدل الجرعة: ${calculationResult.baseMrdMgPerKg} ملغ/كجم${hepaticOrRenalImpairment ? ' (بعد خصم 30% للاعتلال)' : ''}`
                        : `Dose Rate: ${calculationResult.baseMrdMgPerKg} mg/kg${hepaticOrRenalImpairment ? ' (30% organ reduction applied)' : ''}`}
                    </p>
                  </div>

                  {/* Card 3: Limiting Factor */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-[#E5DEC9] dark:border-[#2D3720] shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                      {isRTL ? 'العامل المقيد للجرعة (Limiting Factor)' : 'Dose-Limiting Determinant'}
                    </span>
                    <div className="font-black text-sm text-neutral-900 dark:text-white pt-1">
                      {calculationResult.maxSafeCartridgesByCardiacEpi !== null &&
                      calculationResult.maxSafeCartridgesByCardiacEpi < calculationResult.maxSafeCartridgesByAnesthetic ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Heart className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'سقف أدرينالين القلب (0.04 ملغ)' : 'Cardiac Epinephrine Limit (0.04 mg)'}</span>
                        </span>
                      ) : (
                        <span className="text-[#596628] dark:text-[#A8C24E] flex items-center gap-1">
                          <Activity className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'سقف المادة المخدرة بالملغ' : 'Anesthetic Drug Absolute Mass (mg)'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      {calculationResult.maxSafeCartridgesByCardiacEpi !== null
                        ? (isRTL
                            ? `حد المخدر: ${calculationResult.maxSafeCartridgesByAnesthetic} • حد الأدرينالين: ${calculationResult.maxSafeCartridgesByCardiacEpi}`
                            : `Drug ceiling: ${calculationResult.maxSafeCartridgesByAnesthetic} • Epi ceiling: ${calculationResult.maxSafeCartridgesByCardiacEpi}`)
                        : (isRTL
                            ? `سقف المخدر الأقصى: ${calculationResult.maxSafeCartridgesByAnesthetic} أمبولة`
                            : `Drug absolute cap: ${calculationResult.maxSafeCartridgesByAnesthetic} carpules`)}
                    </p>
                  </div>

                  {/* Card 4: Remaining Safe Allowance */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-[#E5DEC9] dark:border-[#2D3720] shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                      {isRTL ? 'المتبقي الآمن المسموح به' : 'Remaining Safe Allowance'}
                    </span>
                    <div className="flex items-baseline gap-1.5 text-neutral-900 dark:text-white">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                        {calculationResult.remainingSafeCartridges}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">{isRTL ? 'أمبولة متبقية' : 'Carpules Remaining'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      {isRTL
                        ? `أي ما يعادل ${calculationResult.remainingSafeMg} ملغ متبقية قبل بلوغ السقف`
                        : `Equivalent to ${calculationResult.remainingSafeMg} mg remaining reserve`}
                    </p>
                  </div>
                </div>
              </div>

              {/* REAL-TIME ADMINISTRATION TRACKER & SAFETY GAUGE */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2419] border-2 border-[#596628]/30 dark:border-[#384524] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[#596628] dark:text-[#A8C24E] block">
                      {isRTL ? 'مقياس الأمان السريري المباشر (Clinical Safety Gauge)' : 'Real-Time Clinical Safety Gauge'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                      {isRTL ? 'تتبع كمية الأمبولات المحقونة فعلياً خلال الجلسة' : 'Chairside Cumulative Dosage & Carpule Tracker'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                        calculationResult.safetyLevel === 'safe'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : calculationResult.safetyLevel === 'caution'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}
                    >
                      {calculationResult.safetyLevel === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {calculationResult.safetyLevel === 'caution' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {calculationResult.safetyLevel === 'toxic' && <AlertOctagon className="w-3.5 h-3.5" />}
                      <span>
                        {calculationResult.safetyLevel === 'safe'
                          ? (isRTL ? 'نطاق آمن (Safe Zone)' : 'Therapeutic Safe Zone')
                          : calculationResult.safetyLevel === 'caution'
                          ? (isRTL ? 'منطقة حذر (Caution Zone)' : 'Cautionary Threshold Approaching')
                          : (isRTL ? 'خطر تسمم وتجاوز الحد (Toxicity Alert)' : 'CRITICAL TOXICITY THRESHOLD EXCEEDED')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Stepper & Slider */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={cartridgesAdministered <= 0}
                      onClick={() => setCartridgesAdministered((prev) => Math.max(0, Number((prev - 0.5).toFixed(1))))}
                      className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-black text-lg flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
                      title="خصم نصف أمبولة"
                    >
                      -0.5
                    </button>

                    <div className="px-5 py-2 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 text-center min-w-[120px]">
                      <span className="text-2xl font-black text-neutral-900 dark:text-white block">
                        {cartridgesAdministered}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold">أمبولة محقونة</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCartridgesAdministered((prev) => Number((prev + 0.5).toFixed(1)))}
                      className="w-10 h-10 rounded-xl bg-[#596628] hover:bg-[#485320] text-white font-black text-lg flex items-center justify-center transition-colors cursor-pointer"
                      title="إضافة نصف أمبولة"
                    >
                      +0.5
                    </button>

                    <button
                      type="button"
                      onClick={() => setCartridgesAdministered((prev) => Number((prev + 1).toFixed(1)))}
                      className="px-3 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                      title={isRTL ? 'إضافة أمبولة كاملة' : 'Administer +1.0 Carpule'}
                    >
                      +1.0
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      <span>
                        {isRTL ? 'نسبة استهلاك الجرعة القصوى:' : 'MRD Capacity Consumed:'} {calculationResult.percentageOfMrdUsed}%
                      </span>
                      <span>
                        {isRTL
                          ? `المحقون: ${calculationResult.administeredAnestheticMg} ملغ مخدر${currentDrug.hasVasoconstrictor ? ` • ${calculationResult.administeredEpiMg} ملغ أدرينالين` : ''}`
                          : `Administered: ${calculationResult.administeredAnestheticMg} mg Anesthetic${currentDrug.hasVasoconstrictor ? ` • ${calculationResult.administeredEpiMg} mg Epi` : ''}`}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative shadow-inner">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          calculationResult.percentageOfMrdUsed >= 90
                            ? 'bg-red-600'
                            : calculationResult.percentageOfMrdUsed > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, calculationResult.percentageOfMrdUsed)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Overdose Alert Notice */}
                {calculationResult.percentageOfMrdUsed >= 90 && (
                  <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-400 text-red-950 dark:text-red-200 flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p className="font-black text-red-700 dark:text-red-400">
                        {isRTL
                          ? '🚨 تحذير: اقتراب أو تجاوز سقف الجرعة القصوى الموصى بها!'
                          : '🚨 CRITICAL ALERT: Impending or Exceeded Maximum Recommended Dose (MRD)!'}
                      </p>
                      <p>
                        {isRTL
                          ? `لقد تم استهلاك ${calculationResult.percentageOfMrdUsed}% من الحد الأقصى للمريض. أوقف حقن المخدر فوراً، وراقب المريض بحثاً عن أي علامات أولية للتسمم الجهازي (LAST) مثل التنميل الفموي أو الطعم المعدني أو الطنين.`
                          : `Patient has consumed ${calculationResult.percentageOfMrdUsed}% of the calculated MRD. Cease local anesthetic infiltration immediately and observe for initial signs of Local Anesthetic Systemic Toxicity (LAST) such as circumoral paresthesia, metallic taste, or tinnitus.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* DEDICATED SCIENTIFIC EQUATIONS SECTION (المعادلة العلمية للحساب) */}
              <div className="rounded-3xl border-2 border-[#D4AF37]/50 dark:border-[#59662C] bg-[#FAF7F2] dark:bg-[#161C12] shadow-sm overflow-hidden transition-all duration-200">
                {/* Section Header / Collapsible Toggle */}
                <div
                  onClick={() => setIsFormulaSectionExpanded(!isFormulaSectionExpanded)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white/80 dark:bg-[#1A2216] cursor-pointer select-none border-b border-[#E5DEC9] dark:border-[#2C3820] hover:bg-amber-50/50 dark:hover:bg-[#1F291B] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#59662C] via-[#6B7B34] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
                      <Calculator className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                          {isRTL ? 'الأسس الأكاديمية • Academic Reference' : 'Academic Standards & Evidence'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                          Malamed & ADA Approved
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight">
                        {isRTL ? 'المعادلة العلمية (Scientific Equations)' : 'Scientific Dosage Derivations & Formulas'}
                      </h3>
                      <p className="text-xs text-[#6B6354] dark:text-[#A7A08E] font-medium mt-0.5">
                        {isRTL
                          ? 'المعادلات الرياضية السريرية الثلاث الدقيقة المعتمدة لحساب الجرعة القصوى وعدد الكاربولات'
                          : 'Tri-phasic clinical formulas for patient-specific MRD, cartridge payload, and safe carpule thresholds'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-[#59662C] dark:text-[#A4BF46] hidden sm:inline">
                      {isFormulaSectionExpanded ? (isRTL ? 'طي المعادلة' : 'Collapse') : (isRTL ? 'عرض المعادلات' : 'Expand Formulas')}
                    </span>
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-neutral-600 dark:text-neutral-300"
                    >
                      {isFormulaSectionExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#59662C]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#59662C]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Equations Content */}
                {isFormulaSectionExpanded && (
                  <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Equations Grid - 3 Core Mandatory Mathematical Formulas */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Formula 1: Maximum Patient Dose */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E2419] border-2 border-sky-200 dark:border-sky-900/60 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-black text-sm">
                            <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-mono">
                              1
                            </span>
                            <span>
                              {isRTL
                                ? 'الجرعة القصوى للمريض بالميليغرام (Maximum Patient Dose):'
                                : 'Patient Maximum Recommended Dose (MRD in mg):'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300">
                            Total Allowed mg
                          </span>
                        </div>

                        {/* Equation Text */}
                        <div className={`p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs sm:text-sm font-black text-sky-950 dark:text-sky-200 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL
                            ? 'الجرعة القصوى بالميليغرام (مجم) = وزن المريض (كغ) × الجرعة المسموحة للمادة الفعالة (حسب الحالة الصحية Normal أو Abnormal) (مجم/كغ)'
                            : 'Patient MRD (mg) = Body Weight (kg) × Active Ingredient Dose Limit (mg/kg, adjusted for organ clearance)'}
                        </div>

                        {/* Dynamic Live Formula Application */}
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex-wrap" dir="ltr">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            Current Calculation:
                          </span>
                          <span>
                            {weightKg} kg × {calculationResult.baseMrdMgPerKg} mg/kg = <strong className="text-sky-600 dark:text-sky-400 font-black text-xs">{calculationResult.effectiveMrdMg} mg</strong>
                            {hepaticOrRenalImpairment && ' (30% reduction applied for systemic condition)'}
                          </span>
                        </div>
                      </div>

                      {/* Formula 2: Active Ingredient Amount per Carpule */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E2419] border-2 border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono">
                              2
                            </span>
                            <span>
                              {isRTL
                                ? 'كمية المادة الفعالة في الكاربولة الواحدة بالميليغرام (Active Ingredient Amount per Carpule):'
                                : 'Anesthetic Drug Content per Carpule (mg/cartridge):'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                            mg per Carpule
                          </span>
                        </div>

                        {/* Equation Text */}
                        <div className={`p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL
                            ? 'كمية المادة الفعالة في الكاربولة الواحدة (مجم) = حجم الكاربولة (بالمليلتر) × تركيز المادة (مجم/مل)'
                            : 'Anesthetic Payload per Carpule (mg) = Cartridge Volume (mL) × Solution Concentration (mg/mL)'}
                        </div>

                        {/* Concentration explanation & Dynamic Application */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono" dir="ltr">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">Concentration Rule: </span>
                            1% solution = 10 mg/mL (e.g. 2% = 20 mg/mL, 4% = 40 mg/mL)
                          </div>
                          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono" dir="ltr">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">Current Drug: </span>
                            {cartridgeSize} mL × {currentDrug.concentrationPercent * 10} mg/mL = <strong className="text-emerald-600 dark:text-emerald-400 font-black">{calculationResult.anestheticMgPerCartridge} mg</strong>
                          </div>
                        </div>
                      </div>

                      {/* Formula 3: Maximum Number of Carpules */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E2419] border-2 border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-sm">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-mono">
                              3
                            </span>
                            <span>
                              {isRTL
                                ? 'الحد الأقصى لعدد الكاربولات المسموح بها (Maximum Number of Carpules):'
                                : 'Maximum Allowable Carpule Count (Ceiling):'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                            Max Carpules
                          </span>
                        </div>

                        {/* Equation Text */}
                        <div className={`p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL
                            ? 'الحد الأقصى لعدد الكاربولات = إجمالي الجرعة القصوى للمريض (مجم) ÷ كمية المادة الفعالة في الكاربولة الواحدة (مجم)'
                            : 'Maximum Safe Carpules = Total Patient MRD (mg) ÷ Anesthetic Payload per Carpule (mg)'}
                        </div>

                        {/* Dynamic Application */}
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex-wrap" dir="ltr">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            Current Application:
                          </span>
                          <span>
                            {calculationResult.effectiveMrdMg} mg ÷ {calculationResult.anestheticMgPerCartridge} mg = <strong className="text-amber-600 dark:text-amber-400 font-black text-xs">{calculationResult.maxSafeCartridgesByAnesthetic} Carpules</strong>
                            {calculationResult.maxSafeCartridgesByCardiacEpi !== null && ` (Cardiac Limit: ${calculationResult.maxSafeCartridgesByCardiacEpi} Carpules)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Safety & Systemic Considerations Note */}
                    <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-800 text-xs leading-relaxed space-y-1.5 text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-2 font-black text-neutral-900 dark:text-white">
                        <Scale className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                        <span>
                          {isRTL
                            ? 'ملاحظة سريرية وأكاديمية هامة (Clinical Safety Factor):'
                            : 'Clinical Safety Factor & Vasoconstrictor Thresholds:'}
                        </span>
                      </div>
                      <p>
                        {isRTL
                          ? 'يجب مراعاة الحالة الصحية العامة للمريض (Normal مقابل Abnormal مثل اعتلال الكبد، القصور الكلوي، أو أمراض القلب). في حالات أمراض القلب (Cardiac Patients)، لا يتحدد الحد الأقصى فقط بجرعة المخدر بل أيضاً بسقف الأدرينالين (0.04 مجم بحد أقصى كربولتين 1:100,000).'
                          : 'Systemic health status must be carefully evaluated (healthy vs medically compromised such as hepatic cirrhosis, renal failure, or ischemic cardiovascular disease). In cardiac patients, dosage ceiling is strictly dictated by the 0.04 mg epinephrine safety cap (~2 carpules of 1:100,000 solution).'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SCIENTIFIC EQUATIONS FULL DEDICATED VIEW */}
          {activeTab === 'formula' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#59662C] via-[#687733] to-[#D4AF37] text-white shadow-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-7 h-7 text-amber-200" />
                  <h3 className="text-lg sm:text-xl font-black">
                    {isRTL
                      ? 'المعادلة العلمية لحساب جرعات التخدير الموضعي'
                      : 'Scientific Principles of Local Anesthesia Dosing'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-100 font-medium leading-relaxed">
                  {isRTL
                    ? 'المرجع الرياضي والأكاديمي الدقيق لحساب الجرعة القصوى للمريض (MRD)، محتوى الكاربولة القياسية، والحد الأقصى لعدد الكاربولات المسموح بها وفق توصيات الجمعية الأمريكية لطب الأسنان (ADA) ودليل مالاميد.'
                    : 'Evidence-based mathematical and clinical reference for Maximum Recommended Dose (MRD) calculation, standard carpule active payload, and patient-tailored carpule ceilings based on ADA and Malamed guidelines.'}
                </p>
              </div>

              {/* Comprehensive Scientific Formulas & Guidelines Card */}
              <AnesthesiaScientificFormulaCard
                isAuthorAdmin={isAuthorAdmin}
                isContentUnlocked={isContentUnlocked}
                onRequireLogin={onOpenSubscribeModal}
                defaultExpanded={true}
              />
            </div>
          )}

          {/* TAB 2: LAST EMERGENCY PROTOCOL */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-red-600 text-white space-y-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-amber-300" />
                  <h3 className="text-lg sm:text-xl font-black">
                    {isRTL ? LAST_EMERGENCY_PROTOCOL.titleAr : LAST_EMERGENCY_PROTOCOL.titleEn}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-red-100 font-bold">
                  {isRTL ? LAST_EMERGENCY_PROTOCOL.warningAr : LAST_EMERGENCY_PROTOCOL.warningEn}
                </p>
              </div>

              {/* Symptoms Stages */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span>
                    {isRTL
                      ? 'تدرج أعراض التسمم الجهازي بالمخدر (Signs & Symptoms of LAST):'
                      : 'Clinical Stages & Progression of Local Anesthetic Systemic Toxicity (LAST):'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {LAST_EMERGENCY_PROTOCOL.symptoms.map((sym, idx) => (
                    <div
                      key={`last_sym_stage_${idx}`}
                      className="p-4 rounded-2xl bg-white dark:bg-[#1E2419] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2"
                    >
                      <span className="text-xs font-black text-red-600 block">
                        {isRTL ? sym.stage : sym.stageEn}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isRTL ? sym.stageEn : sym.stage}
                      </span>
                      <ul className="space-y-1.5 pt-1 text-xs text-neutral-700 dark:text-neutral-300">
                        {(isRTL ? sym.itemsAr : (sym.itemsEn || sym.itemsAr)).map((item, i) => (
                          <li key={`sym_item_${idx}_${i}`} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Emergency Interventions */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>
                    {isRTL
                      ? 'خطوات التدخل الفوري بالترتيب (Sequential Emergency Steps):'
                      : 'Sequential Emergency Resuscitation Steps (ASRA Protocol):'}
                  </span>
                </h4>

                <div className="space-y-3">
                  {LAST_EMERGENCY_PROTOCOL.emergencyActions.map((act, actIdx) => (
                    <div
                      key={`${act.step}_${actIdx}`}
                      className="p-4 rounded-2xl bg-white dark:bg-[#1E2419] border border-neutral-200 dark:border-neutral-800 flex items-start gap-3.5 shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {act.step}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {isRTL ? act.title : (act.titleEn || act.title)}
                        </h5>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                          {isRTL ? act.desc : (act.descEn || act.desc)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DRUG MONOGRAPHS & COMPARISON */}
          {activeTab === 'drugs_info' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-black text-base text-neutral-900 dark:text-white">
                  {isRTL
                    ? 'جدول المقارنة السريرية الدوائية ومواصفات التخدير الموضعي'
                    : 'Comparative Clinical Pharmacology & Anesthetic Monographs'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isRTL
                    ? 'مقارنة شاملة لخصائص الأدوية المعتمدة بالحاسبة بحسب معايير FDA وADA ودليل مالاميد.'
                    : 'Evidence-based drug monographs indexed by FDA pregnancy category, metabolic clearance, and anesthetic duration.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.values(ANESTHETIC_DRUGS)).map((d, dIdx) => (
                  <div
                    key={`${d.id}_${dIdx}`}
                    className="p-5 rounded-3xl bg-white dark:bg-[#1E2419] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          FDA Category {d.fdaPregnancyCategory}
                        </span>
                        <span className="text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                          MRD: {d.mrdMgPerKgAdult} mg/kg
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white">
                        {isRTL ? d.nameAr : d.nameEn}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {isRTL ? d.nameEn : d.nameAr}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs border-t border-b border-neutral-100 dark:border-neutral-800 py-3 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isRTL ? 'سقف الجرعة المطلق:' : 'Absolute Ceiling Dose:'}</span>
                        <span className="font-bold">{d.absoluteCeilingMgAdult} {isRTL ? 'ملغ' : 'mg'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isRTL ? 'الاستقلاب (Metabolism):' : 'Metabolic Pathway:'}</span>
                        <span className="font-bold">
                          {!isRTL
                            ? (d.metabolism.includes('كبدي') && d.metabolism.includes('بلازما')
                              ? 'Hepatic & Plasma Cholinesterase'
                              : 'Hepatic Microsomal Enzymes')
                            : d.metabolism}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isRTL ? 'عمر النصف (Half-life):' : 'Elimination Half-Life:'}</span>
                        <span className="font-bold">
                          {!isRTL
                            ? (d.halfLife.includes('27')
                              ? '27 minutes (Rapid Clearance)'
                              : d.halfLife.includes('90')
                              ? '90 minutes (1.5 hours)'
                              : '110 minutes (1.9 hours)')
                            : d.halfLife}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isRTL ? 'تخدير اللب (Pulpal):' : 'Pulpal Anesthesia:'}</span>
                        <span className="font-bold">
                          {!isRTL
                            ? (d.pulpalAnesthesiaDuration.includes('60')
                              ? '60 - 75 min (Infiltration / Block)'
                              : '20 - 40 min (Plain Formulation)')
                            : d.pulpalAnesthesiaDuration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isRTL ? 'تخدير الأنسجة الرخوة:' : 'Soft Tissue Anesthesia:'}</span>
                        <span className="font-bold">
                          {!isRTL
                            ? (d.softTissueDuration.includes('3 - 5')
                              ? '3 - 5 hours'
                              : '2 - 3 hours')
                            : d.softTissueDuration}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#12160E] text-[11px] text-neutral-700 dark:text-neutral-300">
                      <span className="font-bold block mb-0.5 text-neutral-900 dark:text-white">
                        {isRTL ? 'ملاحظات سريرية:' : 'Clinical Notes & Indications:'}
                      </span>
                      {!isRTL && d.clinicalNotesEn ? d.clinicalNotesEn : d.clinicalNotesAr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 sm:px-7 py-3.5 bg-white dark:bg-[#20271A] border-t border-[#E5DEC9] dark:border-[#2D3720] flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-neutral-700 dark:text-neutral-300">
              {isRTL
                ? 'حاسبة التخدير الموضعي السريرية • إصدار د. حياة نافع'
                : 'Clinical Local Anesthesia Calculator • Dr. Hayat Nafea Fajer'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLegalModalManual(true)}
              className="text-amber-600 hover:underline font-bold cursor-pointer"
            >
              {isRTL ? 'مراجعة الشروط القانونية' : 'Terms & Clinical Disclaimer'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-800 dark:text-white font-black transition-colors cursor-pointer"
            >
              {isRTL ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
