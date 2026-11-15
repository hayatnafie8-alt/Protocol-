import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Printer,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Stethoscope,
  Info,
  Layers,
  Wrench,
  Syringe,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  DIRECT_PULP_CAPPING_INFO,
  DIRECT_PULP_CAPPING_SLIDES,
  PulpCappingSlide,
} from '../data/directPulpCappingProtocolData';
import { triggerControlledPrint } from '../data/printSecurity';
import { useLanguage } from '../contexts/LanguageContext';

interface DirectPulpCappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlideIndex?: number;
  onOpenPrintGuide?: () => void;
}

export const DirectPulpCappingModal: React.FC<DirectPulpCappingModalProps> = ({
  isOpen,
  onClose,
  initialSlideIndex = 0,
  onOpenPrintGuide,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(initialSlideIndex);
  const [copiedSlide, setCopiedSlide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(initialSlideIndex);
    }
  }, [isOpen, initialSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        goToPrevSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        goToNextSlide();
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
  }, [isOpen, currentSlideIndex, isFullscreen]);

  if (!isOpen) return null;

  const slides = DIRECT_PULP_CAPPING_SLIDES;
  const currentSlide: PulpCappingSlide = slides[currentSlideIndex] || slides[0];

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleCopyCurrentSlide = () => {
    try {
      const text = `${currentSlide.phaseTitle} (${currentSlide.phaseTitleEn})\n\nالخطوة السريرية:\n${currentSlide.clinicalStep.points.join(
        '\n'
      )}\n\nالتفسير العلمي:\n${currentSlide.scientificRationale.points
        .map((p) => `- ${p.heading}: ${p.description}`)
        .join('\n')}${
        currentSlide.warningBox ? `\n\nتحذير:\n${currentSlide.warningBox.text}` : ''
      }\n\nإشراف: ${DIRECT_PULP_CAPPING_INFO.supervisor}`;
      navigator.clipboard.writeText(text);
      setCopiedSlide(true);
      setTimeout(() => setCopiedSlide(false), 2500);
    } catch {}
  };

  const handlePrint = () => {
    if (onOpenPrintGuide) {
      onOpenPrintGuide();
    } else {
      triggerControlledPrint();
    }
  };

  const getSlideIcon = (cat: PulpCappingSlide['category']) => {
    switch (cat) {
      case 'prerequisites':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'hemostasis':
        return <Syringe className="w-5 h-5 text-rose-500" />;
      case 'mta':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'gic':
        return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'composite':
        return <Wrench className="w-5 h-5 text-sky-500" />;
      case 'followup':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'failure':
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpc-modal-title"
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#FAF7F2] dark:bg-[#12170E] text-neutral-900 dark:text-neutral-100 shadow-2xl border border-[#E5DEC9] dark:border-[#334024] flex flex-col overflow-hidden transition-all duration-300 ${
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
        <div className="px-5 sm:px-7 pt-4 pb-3.5 border-b border-[#E5DEC9] dark:border-[#2C3720] flex items-center justify-between gap-3 shrink-0 bg-gradient-to-b from-[#FAF7F2] to-white/60 dark:from-[#12170E] dark:to-[#172013]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#0D9488] text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/25">
                  {isRTL ? 'معالجة لبية حيوية • VPT 🩺' : 'Vital Pulp Therapy • VPT Protocol 🩺'}
                </span>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {isRTL ? 'Direct Pulp Capping Protocol' : 'Bioceramic Reparative Protocol'}
                </span>
              </div>
              <h2
                id="dpc-modal-title"
                className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white leading-tight truncate"
              >
                {isRTL ? DIRECT_PULP_CAPPING_INFO.title : DIRECT_PULP_CAPPING_INFO.titleEn}
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
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isRTL ? 'طباعة بروتوكول التغطية المباشرة' : 'Print Protocol Document'}
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{isRTL ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCurrentSlide}
              className="p-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title={isRTL ? 'نسخ محتوى هذه المرحلة' : 'Copy Phase Content'}
            >
              {copiedSlide ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
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
        <div className="px-4 sm:px-7 py-2.5 border-b border-[#E5DEC9]/80 dark:border-[#2C3720] bg-white/40 dark:bg-[#10150C] flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {slides.map((st, idx) => {
              const isActive = idx === currentSlideIndex;
              const badgeLabel = isRTL ? st.badge.split('•')[0].trim() : st.badgeEn.split('•')[0].trim();
              return (
                <button
                  key={`pulp_slide_${st.slideNumber}_${idx}`}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#59662C] to-[#0D9488] text-white shadow-sm ring-2 ring-[#59662C]/30'
                      : 'bg-white/80 dark:bg-[#1C2317] text-neutral-600 dark:text-neutral-400 hover:bg-[#F3EEDF] dark:hover:bg-[#252E1F] border border-[#E5DEC9]/70 dark:border-[#2C3720]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                      isActive ? 'bg-white text-[#59662C]' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {st.slideNumber}
                  </span>
                  <span>{badgeLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 shrink-0 hidden md:block">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Active Slide Body Content (Scrollable Container) */}
        {/* ------------------------------------------------------------- */}
        <div className={`p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Header of Active Slide */}
          <div className="space-y-1.5 border-b border-[#E5DEC9]/70 dark:border-[#2C3720] pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0D9488]/15 text-[#0D9488] dark:text-[#2DD4BF] border border-[#0D9488]/30 flex items-center gap-1">
                {getSlideIcon(currentSlide.category)}
                <span>{isRTL ? currentSlide.badge : currentSlide.badgeEn}</span>
              </span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {isRTL ? currentSlide.phaseTitleEn : 'Evidence-Based VPT Guidelines'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white leading-tight">
              {isRTL ? currentSlide.phaseTitle : currentSlide.phaseTitleEn}
            </h3>
          </div>

          {/* 1. Clinical Execution Step Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A2114] border border-[#E5DEC9] dark:border-[#323D24] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#59662C] dark:text-[#A4BF46] font-black text-sm">
              <Stethoscope className="w-4 h-4 text-[#0D9488]" />
              <span>
                {isRTL
                  ? currentSlide.clinicalStep.title
                  : (currentSlide.clinicalStepEn?.title || 'Chairside Operative Execution:')}
              </span>
            </div>

            <div className={`space-y-2.5 ${isRTL ? 'pr-1' : 'pl-1'}`}>
              {(isRTL ? currentSlide.clinicalStep.points : (currentSlide.clinicalStepEn?.points || currentSlide.clinicalStep.points)).map((pt, pIdx) => (
                <div
                  key={`pulp_pt_${currentSlide.slideNumber}_${pIdx}`}
                  className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141A0E] border border-[#EFE8DC] dark:border-[#26311C] flex items-start gap-3 text-xs sm:text-sm text-[#2F2B24] dark:text-neutral-200 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-2xs">
                    {pIdx + 1}
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Scientific Rationale & Academic Mechanism */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/30 border border-emerald-500/20 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isRTL
                  ? currentSlide.scientificRationale.title
                  : (currentSlide.scientificRationaleEn?.title || 'Histological & Pathophysiological Mechanism:')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isRTL
                ? currentSlide.scientificRationale.points
                : (currentSlide.scientificRationaleEn?.points || currentSlide.scientificRationale.points)
              ).map((rat, rIdx) => (
                <div
                  key={`pulp_rat_${currentSlide.slideNumber}_${rIdx}`}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    rat.isWarning
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                      : 'bg-white/80 dark:bg-[#172013] border-emerald-200/60 dark:border-emerald-900/40 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="font-black flex items-center gap-1.5 text-xs">
                    {rat.isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{rat.heading}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 font-normal">
                    {rat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Clinical Warning Box (If any) */}
          {currentSlide.warningBox && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                currentSlide.warningBox.severity === 'danger'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                  : currentSlide.warningBox.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  currentSlide.warningBox.severity === 'danger'
                    ? 'text-rose-600 dark:text-rose-400'
                    : currentSlide.warningBox.severity === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-sky-600 dark:text-sky-400'
                }`}
              />
              <div className="space-y-0.5">
                <span className="font-black block">
                  {isRTL
                    ? currentSlide.warningBox.title
                    : (currentSlide.warningBoxEn?.title || currentSlide.warningBox.title)}
                </span>
                <p className="text-xs font-medium">
                  {isRTL
                    ? currentSlide.warningBox.text
                    : (currentSlide.warningBoxEn?.text || currentSlide.warningBox.text)}
                </p>
              </div>
            </div>
          )}

          {/* 4. Key Instruments & Materials */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
              {isRTL
                ? 'الأدوات والمواد السريرية الخاصة بهذه المرحلة:'
                : 'Stage-Specific Clinical Instruments & Biomaterials:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentSlide.keyInstruments.map((inst, iIdx) => (
                <div
                  key={`pulp_inst_${currentSlide.slideNumber}_${inst.name}_${iIdx}`}
                  className="p-3 rounded-xl bg-white dark:bg-[#1A2114] border border-[#E5DEC9] dark:border-[#323D24] text-xs space-y-1 shadow-2xs"
                >
                  <div className="font-bold text-[#2F2B24] dark:text-neutral-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                    <span className="truncate">{isRTL ? inst.name : inst.nameEn}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 block truncate">
                    {isRTL ? inst.nameEn : 'Certified Chairside Instrument'}
                  </span>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {isRTL ? inst.purpose : (inst.purposeEn || inst.purpose)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Navigation Footer Controls */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[#E5DEC9] dark:border-[#2C3720] bg-white/70 dark:bg-[#12170E] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                : 'bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 shadow-2xs'
            }`}
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{isRTL ? 'المرحلة السابقة' : 'Previous Phase'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, dotIdx) => (
              <button
                key={`pulp_dot_${dotIdx}`}
                type="button"
                onClick={() => setCurrentSlideIndex(dotIdx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  dotIdx === currentSlideIndex
                    ? 'w-6 bg-[#0D9488]'
                    : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSlideIndex === slides.length - 1
                ? 'opacity-40 cursor-not-allowed bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                : 'bg-gradient-to-r from-[#59662C] to-[#0D9488] text-white shadow-xs hover:shadow-md'
            }`}
          >
            <span>{isRTL ? 'المرحلة التالية' : 'Next Phase'}</span>
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
