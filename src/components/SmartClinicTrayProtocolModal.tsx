import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Syringe,
  Layers,
  Wrench,
  Trash2,
  RotateCcw,
  BookOpen,
  Info,
  Flame,
  Award,
  Check,
  Copy,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  SMART_CLINIC_TRAY_STEPS,
  SMART_CLINIC_TRAY_PROTOCOL_INFO,
  TrayProtocolStep,
} from '../data/smartClinicTrayProtocolData';
import { triggerControlledPrint } from '../data/printSecurity';
import { useLanguage } from '../contexts/LanguageContext';

interface SmartClinicTrayProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStepIndex?: number;
  onOpenPrintGuide?: () => void;
}

export const SmartClinicTrayProtocolModal: React.FC<SmartClinicTrayProtocolModalProps> = ({
  isOpen,
  onClose,
  initialStepIndex = 0,
  onOpenPrintGuide,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStepIndex);
  const [copiedStep, setCopiedStep] = useState(false);
  const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(initialStepIndex);
    }
  }, [isOpen, initialStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        goToPrevStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        goToNextStep();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, isFullscreen]);

  if (!isOpen) return null;

  const steps = SMART_CLINIC_TRAY_STEPS;
  const currentStep: TrayProtocolStep = steps[currentStepIndex] || steps[0];

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleToolChecked = (toolKey: string) => {
    setCheckedTools((prev) => ({
      ...prev,
      [toolKey]: !prev[toolKey],
    }));
  };

  const handleCopyCurrentStep = () => {
    try {
      const actionsList = isRTL
        ? currentStep.clinicalActions.join('\n')
        : (currentStep.clinicalActionsEn || currentStep.clinicalActions).join('\n');
      const toolsList = currentStep.keyTools
        .map((t) => `- ${isRTL ? t.name : t.nameEn}: ${isRTL ? t.purpose : (t.purposeEn || t.purpose)}`)
        .join('\n');
      const text = `${isRTL ? currentStep.title : currentStep.titleEn}\n\n${isRTL ? 'الأدوات:' : 'Armamentarium:'}\n${toolsList}\n\n${isRTL ? 'الإجراءات السريرية:' : 'Clinical Actions:'}\n${actionsList}\n\n${isRTL ? 'الملاحظة الذهبية:' : 'Golden Note:'}\n${
        isRTL ? SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.text : SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.textEn
      }`;
      navigator.clipboard.writeText(text);
      setCopiedStep(true);
      setTimeout(() => setCopiedStep(false), 2500);
    } catch {}
  };

  const handleDirectPrint = () => {
    if (onOpenPrintGuide) {
      onOpenPrintGuide();
    } else {
      triggerControlledPrint();
    }
  };

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 1:
        return <Syringe className="w-5 h-5 text-sky-500" />;
      case 2:
        return <Wrench className="w-5 h-5 text-amber-500" />;
      case 3:
        return <Layers className="w-5 h-5 text-indigo-500" />;
      case 4:
        return <Trash2 className="w-5 h-5 text-rose-500" />;
      case 5:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 6:
      default:
        return <Award className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#FAF7F2] dark:bg-[#141A0F] text-neutral-900 dark:text-neutral-100 shadow-2xl border border-[#E5DEC9] dark:border-[#334024] flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-[10000] w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem]'
        }`}
      >
        {/* Mobile Swipe Bar Indicator */}
        {!isFullscreen && (
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
        )}

        {/* ------------------------------------------------------------- */}
        {/* Top Header Bar */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 sm:px-7 pt-4 pb-3.5 border-b border-[#E5DEC9] dark:border-[#2C3720] flex items-center justify-between gap-3 shrink-0 bg-gradient-to-b from-[#FAF7F2] to-white/60 dark:from-[#141A0F] dark:to-[#192213]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/25">
                  {isRTL ? 'بروتوكول سريري معتمد 🩺' : 'Accredited Clinical Protocol 🩺'}
                </span>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {isRTL ? '7 خطوات تفاعلية' : '7 Sequential Operative Steps'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white leading-tight truncate">
                {isRTL ? SMART_CLINIC_TRAY_PROTOCOL_INFO.title : SMART_CLINIC_TRAY_PROTOCOL_INFO.titleEn}
              </h2>
            </div>
          </div>

          {/* Quick Actions (Fullscreen, Print, Copy, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isFullscreen ? (isRTL ? 'تصغير الشاشة' : 'Exit Fullscreen') : (isRTL ? 'تكبير الشاشة ملء الشاشة' : 'Fullscreen')}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{isRTL ? 'تصغير' : 'Exit'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{isRTL ? 'ملء الشاشة' : 'Fullscreen'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDirectPrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isRTL ? 'طباعة الدليل السريري المعتمد' : 'Print Accredited Clinical Protocol'}
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">{isRTL ? 'طباعة الدليل' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCurrentStep}
              className="p-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title={isRTL ? 'نسخ محتوى هذه الخطوة' : 'Copy Step Overview'}
            >
              {copiedStep ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={isRTL ? 'إغلاق النافذة' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Step Navigation Pill Carousel (Horizontal Step Selector) */}
        {/* ------------------------------------------------------------- */}
        <div className="px-4 sm:px-7 py-2.5 border-b border-[#E5DEC9]/80 dark:border-[#2C3720] bg-white/40 dark:bg-[#11160C] flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {steps.map((st, idx) => {
              const isActive = idx === currentStepIndex;
              const label = isRTL ? st.title.split(' ')[0] : `Step ${st.stepNumber}`;
              return (
                <button
                  key={`tray_step_${st.stepNumber}_${idx}`}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#59662C] to-[#455022] text-white shadow-sm scale-102 ring-2 ring-[#D4AF37]/50'
                      : 'bg-white dark:bg-[#1A2215] text-neutral-600 dark:text-neutral-300 border border-[#E5DEC9] dark:border-[#2C3820] hover:bg-neutral-100 dark:hover:bg-[#222C1B]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-mono">
                    {st.stepNumber}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-[#59662C] dark:text-[#A4BF46] font-black shrink-0 px-2 py-0.5 rounded-lg bg-[#59662C]/10">
            {currentStepIndex + 1} / {steps.length}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Main Step Content Area (Interactive Slider Card) */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5 scrollbar-thin">
          {/* Active Step Hero Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-[#FAF7F2] to-amber-500/10 dark:from-[#1A2216] dark:via-[#161D12] dark:to-[#222E1A] border-2 border-[#59662C]/30 dark:border-[#384826] shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9] dark:border-[#2C3720]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
                  {getStepIcon(currentStepIndex)}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#59662C] dark:text-[#D4AF37] block">
                    {isRTL ? currentStep.badge : (currentStep.badgeEn || currentStep.badge)}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white">
                    {isRTL ? currentStep.title : currentStep.titleEn}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 self-start sm:self-auto bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">
                {isRTL ? currentStep.titleEn : 'Aseptic Sequence'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed font-semibold">
              {isRTL ? currentStep.subtitle : (currentStep.subtitleEn || currentStep.subtitle)}
            </p>
          </div>

          {/* Section 1: Key Tray Tools & Setup (الأدوات السريرية المطلوبة على الطاولة) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#59662C] dark:bg-[#D4AF37]" />
                <span>
                  {isRTL
                    ? 'أدوات ومواد الطاولة السريرية في هذه المرحلة:'
                    : 'Chairside Delivery Instruments & Biomaterials:'}
                </span>
              </h4>
              <span className="text-[11px] text-neutral-400">
                {isRTL ? 'انقر على الأداة للتأشير بالجاهزية ✅' : 'Click instrument to verify tray readiness ✅'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.keyTools.map((tool, tIdx) => {
                const toolKey = `${currentStep.stepNumber}-${tIdx}`;
                const isChecked = !!checkedTools[toolKey];
                return (
                  <div
                    key={`tool_${tool.name}_${tIdx}`}
                    onClick={() => toggleToolChecked(toolKey)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-2xs'
                        : 'bg-white dark:bg-[#1A2216] border-[#E5DEC9] dark:border-[#2C3820] text-neutral-800 dark:text-neutral-200 hover:border-[#59662C]/50'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-lg border-2 border-neutral-300 dark:border-neutral-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-black truncate">{isRTL ? tool.name : tool.nameEn}</span>
                        {tool.isSharp && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            {isRTL ? 'أداة حادة ⚠️' : 'Sharps Hazard ⚠️'}
                          </span>
                        )}
                        {tool.isDisposable && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                            {isRTL ? 'Disposable' : 'Single-Use'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 block truncate">
                        {isRTL ? tool.nameEn : 'Standard Dental Protocol'}
                      </span>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-snug">
                        {isRTL ? tool.purpose : (tool.purposeEn || tool.purpose)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Clinical Actions (خطوات التنفيذ الإكلينيكي المعتمدة) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A2216] border border-[#E5DEC9] dark:border-[#2C3820] shadow-xs space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2 pb-2 border-b border-[#E5DEC9]/80 dark:border-[#2C3820]">
              <Stethoscope className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
              <span>
                {isRTL
                  ? 'خطوات التنفيذ السريري الدقيقة (Clinical Workflow Steps):'
                  : 'Evidence-Based Clinical Workflow Sequence:'}
              </span>
            </h4>

            <ul className="space-y-2.5">
              {(isRTL
                ? currentStep.clinicalActions
                : (currentStep.clinicalActionsEn || currentStep.clinicalActions)
              ).map((action, actIdx) => (
                <li
                  key={`tray_act_${currentStep.stepNumber}_${actIdx}`}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {actIdx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Pearls & Hazard Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pearls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {isRTL ? 'اللمسات السريرية المتقدمة (Clinical Pearls):' : 'Advanced Chairside Clinical Pearls:'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                {(isRTL
                  ? currentStep.clinicalPearls
                  : (currentStep.clinicalPearlsEn || currentStep.clinicalPearls)
                ).map((p, pIdx) => (
                  <li key={`tray_pearl_${currentStep.stepNumber}_${pIdx}`} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/25 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>
                  {isRTL ? 'محاذير وأخطاء شائعة يجب تجنبها:' : 'Critical Procedural Hazards & Precautions:'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-100 leading-relaxed">
                {(isRTL
                  ? currentStep.hazardWarnings
                  : (currentStep.hazardWarningsEn || currentStep.hazardWarnings)
                ).map((w, wIdx) => (
                  <li key={`tray_hazard_${currentStep.stepNumber}_${wIdx}`} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* THE GOLDEN NOTE BOX (Permanent Bottom Anchor) */}
          {/* ------------------------------------------------------------- */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#D4AF37]/20 to-amber-500/15 border-2 border-[#D4AF37]/60 dark:border-[#D4AF37]/40 shadow-sm relative overflow-hidden animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-xs sm:text-sm font-black text-[#59662C] dark:text-[#D4AF37]">
                    🌟 {isRTL ? SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.title : SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.titleEn}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 dark:text-amber-200">
                    {isRTL ? 'Disposable Essentials' : 'Single-Use Standard'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-relaxed">
                  {isRTL ? SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.text : SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.textEn}
                </p>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-1 block">
                  {isRTL ? SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.textEn : 'Dr. Hayat Nafee Fajer • Operative Protocol'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Modal Bottom Footer Navigation (Prev / Next Buttons) */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-[#E5DEC9] dark:border-[#2C3720] bg-white/70 dark:bg-[#141A0F] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 disabled:opacity-40 text-neutral-800 dark:text-neutral-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRTL ? 'الخطوة السابقة' : 'Previous Step'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCurrentStep}
              className="p-2.5 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all cursor-pointer shadow-2xs"
              title={isRTL ? 'نسخ ملخص الخطوة الحالية' : 'Copy Step Summary'}
            >
              {copiedStep ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#455022] hover:from-[#495424] hover:to-[#38411b] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isRTL ? 'الخطوة التالية' : 'Next Step'}</span>
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDirectPrint}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#C5A030] hover:to-[#A37F1D] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isRTL ? 'طباعة الدليل الكامل (PDF)' : 'Print Protocol (PDF)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
