import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  HeartHandshake,
  Brain,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Instagram,
  Smile,
  ShieldAlert,
  HelpCircle,
  Eye,
  ExternalLink,
  MessageSquare,
  Stethoscope,
  Maximize2,
  Minimize2,
  List
} from 'lucide-react';
import {
  PATIENT_COMMUNICATION_GUIDE,
  GuideSlide
} from '../data/patientCommunicationGuideData';
import { useLanguage } from '../contexts/LanguageContext';

interface PatientCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientCommunicationModal: React.FC<PatientCommunicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isRTL } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const totalSlides = PATIENT_COMMUNICATION_GUIDE.length;
  const slide: GuideSlide = PATIENT_COMMUNICATION_GUIDE[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        // In Arabic RTL, ArrowLeft usually moves forward
        if (isRTL) {
          handleNext();
        } else {
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        // ArrowRight
        if (isRTL) {
          handlePrev();
        } else {
          handleNext();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlideIndex, isRTL]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
    setShowToc(false);
  };

  const axisSections = [
    { label: isRTL ? 'الغلاف' : 'Cover', startIdx: 0 },
    { label: isRTL ? 'المحور 1: ما قبل العلاج' : 'Axis 1: Pre-Op', startIdx: 1 },
    { label: isRTL ? 'المحور 2: أخذ الـ History والفحص' : 'Axis 2: Exam & History', startIdx: 3 },
    { label: isRTL ? 'المحور 2: الشغل الفعلي والتخدير' : 'Axis 2: Operative Care', startIdx: 11 },
    { label: isRTL ? 'المحور 3: ما بعد العلاج (5 دقائق)' : 'Axis 3: Post-Op Debrief', startIdx: 14 },
    { label: isRTL ? 'الخاتمة' : 'Conclusion', startIdx: 17 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-fadeIn select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`bg-[#FAF7F2] dark:bg-[#181C14] border-2 border-[#E5DEC9] dark:border-[#343E26] w-full ${
          isFullScreen ? 'h-full max-h-screen rounded-none' : 'max-w-5xl max-h-[94vh] rounded-3xl'
        } shadow-2xl flex flex-col overflow-hidden text-[#2F2B24] dark:text-[#F3EFE6] transition-all duration-300 relative`}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#20261A] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#596628] to-[#7D9333] text-white flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div
              style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E]">
                  Dental Psychology Protocol
                </span>
                <span className="text-xs text-[#807A6D] dark:text-[#A7A08E] font-medium hidden sm:inline">
                  {isRTL ? 'د. حياه نافع فجر' : 'Dr. Hayat Nafea Fajer'}
                </span>
              </div>
              <h2
                style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                className="text-base sm:text-xl font-black text-[#2F2B24] dark:text-white"
              >
                {isRTL ? 'دليل التعامل الصحيح مع المراجعين وبناء الثقة' : 'Clinical Patient Communication & Relationship Management'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Table of contents toggle */}
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showToc
                  ? 'bg-[#596628] text-white border-[#596628]'
                  : 'bg-[#FAF7F2] dark:bg-[#252C1E] border-[#E5DEC9] dark:border-[#343E26] text-[#4A4436] dark:text-[#D5CDBC]'
              }`}
              title={isRTL ? 'فهرس الشرائح' : 'Slide Index'}
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">{isRTL ? 'الفهرس' : 'Index'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#252C1E] border border-[#E5DEC9] dark:border-[#343E26] text-[#4A4436] dark:text-[#D5CDBC] transition-all cursor-pointer"
              title={isFullScreen ? (isRTL ? 'تصغير' : 'Exit') : (isRTL ? 'ملء الشاشة' : 'Fullscreen')}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#252C1E] hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[#4A4436] dark:text-[#D5CDBC] hover:text-rose-600 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Quick Tabs */}
        <div className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#1C2216] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs">
          {axisSections.map((sec, idx) => {
            const isActive =
              (idx === 0 && currentSlideIndex === 0) ||
              (idx === 1 && currentSlideIndex >= 1 && currentSlideIndex <= 2) ||
              (idx === 2 && currentSlideIndex >= 3 && currentSlideIndex <= 10) ||
              (idx === 3 && currentSlideIndex >= 11 && currentSlideIndex <= 13) ||
              (idx === 4 && currentSlideIndex >= 14 && currentSlideIndex <= 16) ||
              (idx === 5 && currentSlideIndex === 17);

            return (
              <button
                key={`${sec.label}_${idx}`}
                onClick={() => goToSlide(sec.startIdx)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] shadow-xs'
                    : 'bg-white dark:bg-[#20261A] text-[#554F42] dark:text-[#C5BFB0] border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F2ECE0]'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area (Slide Viewer + Drawer) */}
        <div className="flex-1 overflow-hidden relative flex">
          {/* Slide Body */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6">
            {/* Top Slide Badge & Number */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E5DEC9] dark:border-[#343E26] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{!isRTL && slide.badgeEn ? slide.badgeEn : slide.badge}</span>
                </span>
                <span className="text-xs text-[#7A7467] dark:text-[#A7A08E] font-bold">
                  {!isRTL && slide.axisTitleEn ? slide.axisTitleEn : slide.axisTitle}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#596628] dark:text-[#A8C24E] bg-white dark:bg-[#20261A] px-3 py-1 rounded-xl border border-[#E5DEC9] dark:border-[#343E26] shadow-2xs">
                <span>{slide.slideNumber}</span>
                <span className="opacity-50">/</span>
                <span>{totalSlides}</span>
              </div>
            </div>

            {/* Slide Title & Subtitle */}
            <div
              style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
              className="space-y-1.5"
            >
              <h1
                style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                className="text-xl sm:text-3xl font-black text-[#2F2B24] dark:text-white leading-tight"
              >
                {!isRTL && slide.titleEn ? slide.titleEn : slide.title}
              </h1>
              <p
                style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                className="text-xs sm:text-base font-semibold text-[#596628] dark:text-[#A8C24E]"
              >
                {!isRTL && slide.subtitleEn ? slide.subtitleEn : slide.subtitle}
              </p>
            </div>

            {/* Lead Paragraph if any */}
            {(slide.leadParagraph || slide.leadParagraphEn) && (
              <div
                style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20261A] ${
                  isRTL ? 'border-r-4 border-r-[#596628] dark:border-r-[#A8C24E]' : 'border-l-4 border-l-[#596628] dark:border-l-[#A8C24E]'
                } border border-[#E5DEC9] dark:border-[#343E26] text-xs sm:text-sm text-[#443E33] dark:text-[#D5CDBC] leading-relaxed shadow-xs font-medium`}
              >
                {!isRTL && slide.leadParagraphEn ? slide.leadParagraphEn : slide.leadParagraph}
              </div>
            )}

            {/* Dynamic Content Blocks */}
            <div className="space-y-4">
              {slide.contentBlocks.map((block, bIdx) => {
                if (block.type === 'quote') {
                  return (
                    <div
                      key={`block_quote_${bIdx}`}
                      style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                      className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent ${
                        isRTL ? 'border-r-4 border-amber-500' : 'border-l-4 border-amber-500'
                      } border border-amber-300/40 dark:border-amber-700/40 space-y-2`}
                    >
                      {(block.title || block.titleEn) && (
                        <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>{!isRTL && block.titleEn ? block.titleEn : block.title}</span>
                        </div>
                      )}
                      <p
                        style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                        className="text-base sm:text-xl font-black text-[#2F2B24] dark:text-amber-100 leading-snug"
                      >
                        {!isRTL && block.textEn ? block.textEn : block.text}
                      </p>
                      {(block.highlight || block.highlightEn) && (
                        <p
                          style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                          className="text-xs sm:text-sm text-[#615A4C] dark:text-[#D5CDBC] font-medium pt-1"
                        >
                          {!isRTL && block.highlightEn ? block.highlightEn : block.highlight}
                        </p>
                      )}
                    </div>
                  );
                }

                if (block.type === 'study') {
                  return (
                    <div
                      key={`block_study_${bIdx}`}
                      className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800/60 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-black text-xs sm:text-sm">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>
                          {!isRTL && block.titleEn
                            ? block.titleEn
                            : (block.title || (isRTL ? 'دراسة سريرية موثقة' : 'Verified Clinical Study'))}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#303848] dark:text-[#CCD7EA] font-semibold leading-relaxed">
                        {!isRTL && block.textEn ? block.textEn : block.text}
                      </p>
                    </div>
                  );
                }

                if (block.type === 'steps' && block.items) {
                  return (
                    <div key={`block_steps_${bIdx}`} className="space-y-3">
                      {(block.title || block.titleEn) && (
                        <h3 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                          <span>{!isRTL && block.titleEn ? block.titleEn : block.title}</span>
                        </h3>
                      )}
                      <div className="grid grid-cols-1 gap-3">
                        {block.items.map((item, itemIdx) => (
                          <div
                            key={`step_item_${itemIdx}`}
                            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all space-y-2 shadow-2xs"
                          >
                            {(item.title || item.titleEn) && (
                              <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#596628]/15 dark:bg-[#7D9333]/25 text-[#596628] dark:text-[#A8C24E] text-xs font-black flex items-center justify-center shrink-0">
                                  {itemIdx + 1}
                                </span>
                                <span>{!isRTL && item.titleEn ? item.titleEn : item.title}</span>
                              </h4>
                            )}
                            {(item.quote || item.quoteEn) && (
                              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                                {!isRTL && item.quoteEn ? item.quoteEn : item.quote}
                              </div>
                            )}
                            {(item.desc || item.descEn) && (
                              <p className="text-xs sm:text-sm text-[#4E483B] dark:text-[#D5CDBC] leading-relaxed font-medium">
                                {!isRTL && item.descEn ? item.descEn : item.desc}
                              </p>
                            )}
                            {(item.behavioralAnalysis || item.behavioralAnalysisEn) && (
                              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#3E4A2E] text-xs text-[#596628] dark:text-[#CBE276] font-bold leading-relaxed">
                                {!isRTL && item.behavioralAnalysisEn ? item.behavioralAnalysisEn : item.behavioralAnalysis}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'case_story') {
                  return (
                    <div
                      key={`block_scenario_${bIdx}`}
                      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-amber-50/50 dark:from-[#20261A] dark:to-amber-950/20 border-2 border-amber-300 dark:border-amber-800/70 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-sm">
                        <Stethoscope className="w-5 h-5 text-amber-600" />
                        <span>
                          {!isRTL && block.titleEn
                            ? block.titleEn
                            : (block.title || (isRTL ? 'تحري الحالة السريرية' : 'Clinical Scenario Analysis'))}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#3E382C] dark:text-[#E2DDD2] leading-relaxed whitespace-pre-line font-medium">
                        {!isRTL && block.textEn ? block.textEn : block.text}
                      </p>
                    </div>
                  );
                }

                if (block.type === 'card_grid' && block.items) {
                  return (
                    <div key={`block_cards_${bIdx}`} className="space-y-3">
                      {(block.title || block.titleEn) && (
                        <h3 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                          {!isRTL && block.titleEn ? block.titleEn : block.title}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {block.items.map((item, cIdx) => (
                          <div
                            key={`card_item_${cIdx}`}
                            className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border-2 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628] transition-all flex flex-col justify-between space-y-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="w-9 h-9 rounded-xl bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] text-base font-black flex items-center justify-center">
                                {item.icon}
                              </span>
                              <span className="text-[10px] uppercase font-black text-[#807A6D] dark:text-[#A7A08E]">
                                {isRTL ? `المحور ${cIdx + 1}` : `Axis ${cIdx + 1}`}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                                {!isRTL && item.titleEn ? item.titleEn : item.title}
                              </h4>
                              <p className="text-xs text-[#5D574A] dark:text-[#A7A08E] mt-1 leading-relaxed">
                                {!isRTL && item.descEn ? item.descEn : item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'tips' || block.type === 'protocol') {
                  return (
                    <div
                      key={`block_tips_${bIdx}`}
                      className="p-4 sm:p-5 rounded-2xl bg-[#596628]/10 dark:bg-[#7D9333]/15 border border-[#596628]/30 dark:border-[#7D9333]/30 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-[#596628] dark:text-[#A8C24E] font-black text-xs sm:text-sm">
                        <Award className="w-4 h-4" />
                        <span>
                          {!isRTL && block.titleEn
                            ? block.titleEn
                            : (block.title || (isRTL ? 'إرشاد سريري ذهبي' : 'Clinical Golden Rule'))}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#373329] dark:text-[#E2DDD2] leading-relaxed whitespace-pre-line font-medium">
                        {!isRTL && block.textEn ? block.textEn : block.text}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Author Signature & Note */}
            {(slide.authorNote || slide.authorNoteEn) && (
              <div className="pt-4 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 text-xs text-[#7B7567] dark:text-[#A7A08E] flex-wrap">
                <span className="font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
                  <span>{!isRTL && slide.authorNoteEn ? slide.authorNoteEn : slide.authorNote}</span>
                </span>
                <span className="text-[11px] opacity-75">
                  {isRTL ? 'سيكولوجية طب الأسنان | جامعة المعارف' : 'Dental Psychology | Al-Maarif University'}
                </span>
              </div>
            )}
          </div>

          {/* Table of Contents Drawer */}
          {showToc && (
            <div className={`w-72 sm:w-80 ${isRTL ? 'border-r' : 'border-l'} border-[#E5DEC9] dark:border-[#343E26] bg-white dark:bg-[#1C2216] p-4 overflow-y-auto space-y-2 shrink-0 animate-fadeIn z-20`}>
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#343E26]">
                <span className="text-xs font-black text-[#2F2B24] dark:text-white">
                  {isRTL ? `فهرس شرائح الدليل (${totalSlides})` : `Guide Index (${totalSlides} Slides)`}
                </span>
                <button
                  onClick={() => setShowToc(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                {PATIENT_COMMUNICATION_GUIDE.map((s, idx) => (
                  <button
                    key={`${s.id}_${idx}`}
                    onClick={() => goToSlide(idx)}
                    className={`w-full p-2.5 rounded-xl ${isRTL ? 'text-right' : 'text-left'} text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                      idx === currentSlideIndex
                        ? 'bg-[#596628] text-white font-black shadow-xs'
                        : 'hover:bg-[#FAF7F2] dark:hover:bg-[#252C1E] text-[#4F493D] dark:text-[#C5BFB0] font-bold'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-mono flex items-center justify-center shrink-0 ${
                        idx === currentSlideIndex
                          ? 'bg-white/20 text-white'
                          : 'bg-black/5 dark:bg-white/5 text-[#736C5F]'
                      }`}
                    >
                      {s.slideNumber}
                    </span>
                    <span className="truncate flex-1">{!isRTL && s.titleEn ? s.titleEn : s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 sm:p-5 bg-white dark:bg-[#20261A] border-t border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Progress Bar & Counter (Mobile & Desktop) */}
          <div className="w-full sm:order-2 sm:flex-1 max-w-lg mx-auto space-y-1.5">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-[#596628] dark:text-[#A8C24E]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isRTL
                    ? `الشريحة ${currentSlideIndex + 1} من ${totalSlides}`
                    : `Slide ${currentSlideIndex + 1} of ${totalSlides}`}
                </span>
              </span>
              <span className="font-mono bg-[#596628]/10 dark:bg-[#7D9333]/20 px-2 py-0.5 rounded-md">
                {Math.round(((currentSlideIndex + 1) / totalSlides) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE4] dark:bg-[#2A3322] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#E5DEC9] dark:border-[#343E26]">
              <div
                className={`${
                  isRTL
                    ? 'bg-gradient-to-l from-[#596628] to-[#7D9333] dark:from-[#A8C24E] dark:to-[#7D9333]'
                    : 'bg-gradient-to-r from-[#596628] to-[#7D9333] dark:from-[#A8C24E] dark:to-[#7D9333]'
                } h-full transition-all duration-300 rounded-full shadow-xs`}
                style={{
                  width: `${((currentSlideIndex + 1) / totalSlides) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:order-1 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                currentSlideIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                  : 'bg-[#FAF7F2] dark:bg-[#252C1E] hover:bg-[#EFE8DC] dark:hover:bg-[#303827] text-[#2F2B24] dark:text-white border border-[#E5DEC9] dark:border-[#343E26] shadow-2xs'
              }`}
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRTL ? 'السابق' : 'Previous'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:order-3 shrink-0">
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              className={`flex-1 sm:flex-initial px-5 sm:px-8 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                currentSlideIndex === totalSlides - 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                  : 'bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white shadow-md hover:shadow-lg'
              }`}
            >
              <span>
                {currentSlideIndex === totalSlides - 1
                  ? (isRTL ? 'نهاية الدليل' : 'End of Guide')
                  : (isRTL ? 'الشريحة التالية' : 'Next Slide')}
              </span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
