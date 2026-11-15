import React, { useState, useEffect } from 'react';
import { SLIDES_DATA, SlideData } from '../data/slidesData';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Play,
  Pause,
  GraduationCap,
  Layers,
  Wrench,
  ShieldAlert,
  Camera,
  Instagram,
  Printer,
  MessageSquare,
  Film,
  Video,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';

import { PreProcedureChecklistCard } from './PreProcedureChecklistCard';
import { CardFocusOverlay, CardMaximizeButton } from './CardFocusOverlay';
import { AdminElementControls } from './AdminElementControls';
import {
  getLocalElementOverrides,
  ElementOverride,
  subscribeToElementOverridesCloud,
} from '../services/elementOverridesService';
import { RestorationClass } from '../data/classesData';
import { CLASS_REAL_CASE_INFO } from './HomePortal';
import { triggerControlledPrint, getWatermarkData } from '../data/printSecurity';
import { SecurePrintWatermark } from './SecurePrintWatermark';
import { AppImage } from './AppImage';
import { SubscriberSupervisorNotesModal } from './SubscriberSupervisorNotesModal';
import { SectionVideoModal } from './SectionVideoModal';
import { getAppSections, AppSection, getSectionVideos } from '../data/sectionsManager';
import { ToothFavoriteButton } from './ToothFavoriteButton';
import {
  getStoredBookmarks,
  toggleBookmarkItem,
} from '../data/bookmarksManager';

interface SlideViewerProps {
  slides?: SlideData[];
  activeClass?: RestorationClass;
  onOpenTimer?: () => void;
  onOpenSim?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenPhotos?: () => void;
  isAdmin?: boolean;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  slides = SLIDES_DATA,
  activeClass,
  onOpenTimer,
  onOpenSim,
  onOpenCheatSheet,
  onOpenPhotos,
  isAdmin = false,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [copiedSlide, setCopiedSlide] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [protocolsSection, setProtocolsSection] = useState<AppSection | null>(() => {
    const all = getAppSections();
    return all.find((s) => s.key === 'protocols' || s.tabKey === 'slides') || null;
  });
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(() => new Set([0]));
  const [focusedStep, setFocusedStep] = useState<any | null>(null);
  const [elementOverrides, setElementOverrides] = useState<Record<string, ElementOverride>>(() =>
    getLocalElementOverrides()
  );

  useEffect(() => {
    const unsub = subscribeToElementOverridesCloud((newOverrides) => {
      setElementOverrides(newOverrides);
    });
    return () => unsub();
  }, []);

  // Reset slide index and visited set when active class/slides changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    setVisitedSlides(new Set([0]));
  }, [activeClass?.id, slides]);

  // Track visited slide indices as user navigates
  useEffect(() => {
    setVisitedSlides((prev) => {
      if (prev.has(currentSlideIndex)) return prev;
      const next = new Set(prev);
      next.add(currentSlideIndex);
      return next;
    });
  }, [currentSlideIndex]);

  const activeSlidesList = slides.length > 0 ? slides : SLIDES_DATA;
  const totalSlides = activeSlidesList.length;
  const currentSlideNumber = currentSlideIndex + 1;
  const currentSlide: SlideData = activeSlidesList[currentSlideIndex] || activeSlidesList[0];
  const currentProgressPercentage = Math.round((currentSlideNumber / totalSlides) * 100);
  const completionPercentage = Math.round((visitedSlides.size / totalSlides) * 100);

  // Student Favorites Bookmarking (Official Tooth Icon)
  const currentSlideBookmarkId = currentSlide.id
    ? `slide-${currentSlide.id}`
    : `slide-${activeClass?.id || 'c1'}-${currentSlide.slideNumber}`;

  const [bookmarkedSlideIds, setBookmarkedSlideIds] = useState<Set<string>>(() => {
    const list = getStoredBookmarks();
    return new Set(list.filter((b) => b.category === 'slide').map((b) => b.id));
  });

  useEffect(() => {
    const handleBookmarkChange = () => {
      const list = getStoredBookmarks();
      setBookmarkedSlideIds(new Set(list.filter((b) => b.category === 'slide').map((b) => b.id)));
    };
    window.addEventListener('app-bookmarks-updated', handleBookmarkChange);
    return () => window.removeEventListener('app-bookmarks-updated', handleBookmarkChange);
  }, []);

  const isCurrentSlideBookmarked = bookmarkedSlideIds.has(currentSlideBookmarkId);

  const handleToggleSlideBookmark = () => {
    const isNowBookmarked = toggleBookmarkItem({
      id: currentSlideBookmarkId,
      title: `${activeClass?.arabicName || activeClass?.name || 'بروتوكول الترميم'} - سلايد ${currentSlide.slideNumber}: ${currentSlide.title}`,
      subtitle: currentSlide.subtitle || currentSlide.badge,
      category: 'slide',
      categoryLabel: `${activeClass?.code || 'سلايد'} • ${currentSlide.badge}`,
      specialty: 'Operative',
      tags: ['سلايد', activeClass?.code || 'سلايد', currentSlide.title],
      targetTab: 'slides',
      targetParam: activeClass?.id,
      clinicalKeyPoint: currentSlide.clinicalFocus || currentSlide.title,
    });
    setBookmarkedSlideIds((prev) => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(currentSlideBookmarkId);
      else next.delete(currentSlideBookmarkId);
      return next;
    });
  };

  // Navigation handlers
  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < activeSlidesList.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : activeSlidesList.length - 1));
  };

  // Autoplay effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 7000); // 7 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSlidesList.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handlePrev(); // RTL: right is previous
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === ' ') {
        handleNext(); // RTL: left is next
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, activeSlidesList.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCopySlideContent = () => {
    let text = `${currentSlide.title}\n${currentSlide.subtitle || ''}\n\n`;
    if (currentSlide.steps) {
      currentSlide.steps.forEach((st) => {
        text += `[${st.stepNumber}] ${st.title} - ${st.subtitle || ''}\n`;
        text += `${st.description || ''}\n`;
        if (st.points) text += st.points.map((p) => `• ${p}`).join('\n') + '\n';
        if (st.instruments) text += `الأدوات: ${st.instruments.join(', ')}\n`;
        if (st.warning) text += `تحذير: ${st.warning}\n`;
        if (st.tips) text += `نصيحة: ${st.tips}\n`;
        text += '\n';
      });
    } else if (currentSlide.clinicalFocus) {
      text += currentSlide.clinicalFocus;
    }

    navigator.clipboard.writeText(text);
    setCopiedSlide(true);
    setTimeout(() => setCopiedSlide(false), 2000);
  };

  const isDarkOlive = currentSlide.theme === 'dark-olive';
  const realCaseInfo = activeClass ? CLASS_REAL_CASE_INFO[activeClass.id] : null;

  return (
    <div
      className={`flex flex-col bg-[#FAF7F2] dark:bg-[#141712] transition-colors duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 md:p-8 overflow-y-auto bg-[#FAF7F2] dark:bg-[#141712]' : 'w-full'
      }`}
    >
      {/* Interactive Screen Presentation View */}
      <div className="print:hidden">
        {/* Presentation Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#596628] dark:bg-[#7D9333] text-white font-bold text-xs tracking-wider">
            السلايد {currentSlide.slideNumber} / {activeSlidesList.length}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#596628]/15 dark:bg-[#7D9333]/25 text-[#596628] dark:text-[#A8C24E] text-xs font-black">
            {completionPercentage}% مكتمل
          </span>
          <span className="text-xs text-[#736D5F] dark:text-[#A7A08E] hidden sm:inline font-semibold">
            {currentSlide.badge}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Primary & Individual Tooth Icon for Single-Tap Saving */}
          <ToothFavoriteButton
            isBookmarked={isCurrentSlideBookmarked}
            onToggle={handleToggleSlideBookmark}
            size="sm"
            variant="badge"
            label="حفظ السلايد"
          />

          {/* Autoplay button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-white dark:bg-[#20261A] text-[#575143] dark:text-[#D5CDBC] border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F4EFE6] dark:hover:bg-[#2A3322]'
            }`}
            title={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل العرض التلقائي'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden md:inline">{isPlaying ? 'إيقاف العرض' : 'تشغيل تلقائي'}</span>
          </button>

          {/* Copy slide text */}
          <button
            onClick={handleCopySlideContent}
            className="p-2 rounded-xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] text-[#575143] dark:text-[#D5CDBC] hover:bg-[#F4EFE6] dark:hover:bg-[#2A3322] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="نسخ محتوى السلايد"
          >
            {copiedSlide ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedSlide ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>

          {/* Speaker notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showNotes
                ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] dark:border-[#7D9333]'
                : 'bg-white dark:bg-[#20261A] text-[#575143] dark:text-[#D5CDBC] border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F4EFE6] dark:hover:bg-[#2A3322]'
            }`}
            title="ملاحظات المحاضر السريرية"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ملاحظات الشرح</span>
          </button>

          {/* Direct Note to Supervisor Button (Requested: امكانية للمشتركين كتابة الملاحظات في خانة الملاحظات للمشرف) */}
          <button
            onClick={() => setShowNotesModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="كتابة ملاحظة أو استفسار سريري للمشرفة د. حياة نافع حول هذا السلايد"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">ملاحظة للمشرف ✍️</span>
          </button>

          {/* Section Video Button (Supports multiple videos) */}
          {(() => {
            const protoVideos = getSectionVideos(protocolsSection);
            if (!protoVideos.length && !isAdmin) return null;
            return (
              <button
                onClick={() => setShowVideoModal(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title={protoVideos.length > 0 ? `مشاهدة فيديوهات الشرح (${protoVideos.length})` : 'إضافة فيديو لشرح البروتوكول'}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {protoVideos.length > 1 ? `فيديوهات الشرح (${protoVideos.length}) 🎥` : 'فيديو الشرح 🎥'}
                </span>
              </button>
            );
          })()}

          {/* Pre-Procedure In-Clinic Checklist Button (Requirement) */}
          <button
            onClick={() => {
              const el = document.getElementById('pre-procedure-checklist-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/50 dark:border-amber-600/50 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="قائمة التحقق السريري قبل البدء بالحالة (Pre-Procedure Checklist)"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">التحقق السريري 📋</span>
          </button>

          {/* Secure Controlled Print Button (Requirement) */}
          <button
            onClick={() => triggerControlledPrint()}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="طباعة المحتوى السريري المعتمد مع الختم المائي الأمني باسمك"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">طباعة المحتوى</span>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] text-[#575143] dark:text-[#D5CDBC] hover:bg-[#F4EFE6] dark:hover:bg-[#2A3322] transition-all cursor-pointer"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Visual Progress Bar & Completion Indicator */}
      <div className="mb-4 bg-white dark:bg-[#1A2014] rounded-2xl p-3 sm:p-3.5 border border-[#E5DEC9] dark:border-[#343E26] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#596628]/10 dark:bg-[#A8C24E]/15 text-[#596628] dark:text-[#A8C24E]">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2F2B24] dark:text-white">
                  مستوى إنجاز قراءة البروتوكول السريري
                </span>
                <span className="text-[11px] text-[#736D5F] dark:text-[#A7A08E] font-medium hidden sm:inline">
                  ({activeClass?.arabicName || 'بروتوكول الترميم'})
                </span>
              </div>
              <div className="text-[11px] text-[#736D5F] dark:text-[#A7A08E]">
                السلايد الحالي: <strong className="text-[#596628] dark:text-[#A8C24E]">{currentSlideNumber}</strong> من {totalSlides} • تمت قراءة <strong className="text-[#2F2B24] dark:text-white">{visitedSlides.size}</strong> سلايدات
              </div>
            </div>
          </div>

          {/* Completion Percentage Badge */}
          <div className="flex items-center gap-2">
            {completionPercentage === 100 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>اكتملت قراءة البروتوكول 100% 🎉</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#596628]/10 dark:bg-[#596628]/25 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/20 dark:border-[#596628]/40">
                <span>نسبة الإنجاز: {completionPercentage}%</span>
                <span className="text-[10px] opacity-75 font-normal">({currentProgressPercentage}% مسار القراءة)</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Progress Bar Track with Segment Markers */}
        <div className="relative w-full">
          <div
            className="w-full h-2.5 sm:h-3 bg-[#EAE5D9] dark:bg-[#28321E] rounded-full overflow-hidden p-0.5 relative cursor-pointer"
            title={`تقدم قراءة البروتوكول: ${completionPercentage}% مكتمل`}
          >
            {/* Animated Progress Fill */}
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                completionPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-sm'
                  : 'bg-gradient-to-r from-[#596628] via-[#758635] to-[#9CB53F]'
              }`}
              style={{ width: `${Math.max(currentProgressPercentage, completionPercentage)}%` }}
            />
          </div>

          {/* Segment Ticks & Jump Buttons */}
          <div className="flex justify-between items-center mt-2 px-1">
            {activeSlidesList.map((s, idx) => {
              const isCurrent = idx === currentSlideIndex;
              const isVisited = visitedSlides.has(idx);
              return (
                <button
                  key={`slide_tick_${s.id || idx}_${idx}`}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                  title={`سلايد ${idx + 1}: ${s.title}${isVisited ? ' (تمت قراءته ✓)' : ''}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-amber-500 ring-4 ring-amber-300 dark:ring-amber-700 scale-125'
                        : isVisited
                        ? 'bg-[#596628] dark:bg-[#A8C24E]'
                        : 'bg-[#D3CCBC] dark:bg-[#3E4A2E]'
                    }`}
                  />
                  <span
                    className={`text-[9px] mt-1 font-bold transition-colors hidden md:inline ${
                      isCurrent
                        ? 'text-amber-600 dark:text-amber-400 font-black'
                        : isVisited
                        ? 'text-[#596628] dark:text-[#A8C24E]'
                        : 'text-[#9A9382] dark:text-[#6E7860]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Pre-Procedure Checklist Card (Requirement #1: directly integrated inside each protocol view) */}
      <div id="pre-procedure-checklist-section" className="mb-4">
        <PreProcedureChecklistCard
          protocolId={activeClass?.id || 'class-1'}
          protocolTitle={activeClass?.arabicName || 'بروتوكول الترميم السريري'}
          isAuthorAdmin={isAdmin}
          defaultExpanded={false}
        />
      </div>

      {/* Main 16:9 Slide Canvas */}
      <div
        className={`relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[520px] rounded-3xl border-2 shadow-md flex flex-col justify-between p-6 sm:p-10 md:p-12 overflow-hidden transition-all duration-300 ${
          isDarkOlive
            ? 'bg-[#59662C] text-[#F5F2EB] border-[#455021]'
            : 'bg-white dark:bg-[#1A1F15] text-[#2F2B24] dark:text-[#F3EFE6] border-[#E5DEC9] dark:border-[#323A25]'
        }`}
      >
        {/* Subtle Canvas Top Progress Indicator Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden z-20">
          <div
            className={`h-full transition-all duration-300 ${
              completionPercentage === 100
                ? 'bg-emerald-400'
                : isDarkOlive
                ? 'bg-[#F5F2EB]'
                : 'bg-[#596628] dark:bg-[#A8C24E]'
            }`}
            style={{ width: `${currentProgressPercentage}%` }}
          />
        </div>
        {/* Subtle Olive & Calm Beige Abstract Backdrop */}
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            isDarkOlive ? 'bg-black/20' : 'bg-[#596628]/5 dark:bg-[#A8C24E]/5'
          }`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-2xl pointer-events-none ${
            isDarkOlive ? 'bg-[#3e481b]/40' : 'bg-[#E5DEC9]/40 dark:bg-black/20'
          }`}
        />

        {/* Slide Header */}
        <div className="relative z-10">
          <div
            className={`flex items-center justify-between gap-4 mb-3 pb-4 border-b ${
              isDarkOlive ? 'border-[#6c7b39]' : 'border-[#EFE8DC] dark:border-[#2C3420]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isDarkOlive ? 'bg-[#F5F2EB]' : 'bg-[#596628] dark:bg-[#A8C24E]'
                }`}
              />
              <span
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#596628] dark:text-[#A8C24E]'
                }`}
              >
                {currentSlide.badge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#8A8373] dark:text-[#A7A08E]'
                }`}
              >
                <span>{activeClass?.code || 'Restoration'} Protocol</span>
                <span>•</span>
                <span>جامعة المعارف</span>
              </div>
              {/* One-tap Tooth Favorite Icon on Slide */}
              <ToothFavoriteButton
                isBookmarked={isCurrentSlideBookmarked}
                onToggle={handleToggleSlideBookmark}
                size="sm"
                variant="icon"
                title="حفظ السلايد في المفضلة 🦷"
              />
            </div>
          </div>

          <h2
            style={{ width: '100%', display: 'block', textAlign: 'right', wordBreak: 'keep-all', whiteSpace: 'normal' }}
            className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight ${
              isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#2F2B24] dark:text-white'
            }`}
          >
            {currentSlide.title}
          </h2>
          {currentSlide.subtitle && (
            <p
              style={{ width: '100%', display: 'block', textAlign: 'right', wordBreak: 'keep-all', whiteSpace: 'normal' }}
              className={`text-sm sm:text-base font-semibold mt-1 ${
                isDarkOlive ? 'text-[#FFFFFF]' : 'text-[#696355] dark:text-[#C5BFB0]'
              }`}
            >
              {currentSlide.subtitle}
            </p>
          )}

          {currentSlide.designNote && (
            <div className="mt-2 text-[11px] font-medium text-[#E0DBCE] bg-black/20 inline-block px-3 py-1 rounded-lg">
              🎨 {currentSlide.designNote}
            </div>
          )}
        </div>

        {/* Slide Body Content according to type */}
        <div className="relative z-10 my-auto py-4 overflow-y-auto max-h-[60vh]">
          {/* 1. COVER SLIDE */}
          {currentSlide.type === 'cover' && (
            <div className="py-2 text-center space-y-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ${
                  isDarkOlive
                    ? 'bg-[#475222] text-[#F5F2EB]'
                    : 'bg-[#596628]/10 text-[#596628] dark:bg-[#7D9333]/20 dark:text-[#A8C24E]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>دليل عملي شامل للأطباء وطلبة طب الأسنان</span>
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                <p
                  className={`text-lg sm:text-xl font-bold leading-relaxed ${
                    isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#443E33] dark:text-[#E2DDD2]'
                  }`}
                >
                  {currentSlide.clinicalFocus}
                </p>
              </div>

              {/* Author & Academic Credential Card */}
              {currentSlide.author && (
                <div
                  className={`inline-block px-8 py-5 rounded-2xl shadow-xs border-2 ${
                    isDarkOlive
                      ? 'bg-[#475222] border-[#F5F2EB]/40 text-[#F5F2EB]'
                      : 'bg-[#FAF7F2] dark:bg-[#20261A] border-[#596628]/30 dark:border-[#3E4A2E] text-[#2F2B24] dark:text-[#F3EFE6]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <GraduationCap
                      className={`w-5 h-5 ${isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#596628] dark:text-[#A8C24E]'}`}
                    />
                    <span className={`text-sm font-semibold ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#666052] dark:text-[#A7A08E]'}`}>
                      إعداد وتقديم:
                    </span>
                  </div>
                  <h3 className={`text-2xl font-black ${isDarkOlive ? 'text-[#FFFFFF]' : 'text-[#2F2B24] dark:text-white'}`}>
                    {currentSlide.author.name}
                  </h3>
                  <div
                    className={`flex items-center justify-center gap-2 text-xs font-bold mt-1 ${
                      isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#596628] dark:text-[#A8C24E]'
                    }`}
                  >
                    <span>{currentSlide.author.role}</span>
                    <span>—</span>
                    <span>{currentSlide.author.university}</span>
                  </div>
                </div>
              )}

              {/* Real Tooth Cavity Shape Card */}
              {realCaseInfo && (
                <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#151911] border border-[#E5DEC9] dark:border-[#2C3420] text-right flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
                  <AppImage
                    src={realCaseInfo.realToothPhoto}
                    alt={activeClass?.arabicName || 'شكل الكافتي'}
                    isAdmin={isAdmin}
                    storageKey={`slide_cavity_tooth_${activeClass?.id}`}
                    className="w-full h-full object-contain"
                    containerClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-[#D5CDBC] dark:border-[#3E4A2E]"
                    show4KBadge={false}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#596628] dark:text-[#A8C24E] flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>شكل الكافتي الحقيقي للسن الطبيعي</span>
                      </span>
                      <span className="text-[10px] text-[#7A7466] dark:text-[#9A9382]">
                        {realCaseInfo.toothName}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                      {realCaseInfo.cavityShapeTitle}
                    </h4>
                    <p className="text-xs text-[#635D50] dark:text-[#A7A08E] line-clamp-2">
                      {realCaseInfo.cavityShapeDesc}
                    </p>
                    {onOpenPhotos && (
                      <button
                        onClick={onOpenPhotos}
                        className="text-xs font-bold text-[#596628] dark:text-[#A8C24E] hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>مشاهدة كيسات وصور {activeClass?.code} الحقيقية</span>
                        <span>←</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. STEPS & DETAIL SLIDES */}
          {(currentSlide.type === 'steps' || currentSlide.type === 'detail') && currentSlide.steps && (
            <div
              className={`grid gap-5 ${
                currentSlide.steps.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {currentSlide.steps.map((st, idx) => (
                <div
                  key={`step_${st.stepNumber || idx}_${idx}`}
                  className={`p-5 sm:p-6 rounded-2xl border shadow-xs flex flex-col justify-between transition-colors ${
                    isDarkOlive
                      ? 'bg-[#475222] border-[#6b7b35] text-[#F5F2EB]'
                      : 'bg-[#FAF7F2] dark:bg-[#20261A] border-[#E5DEC9] dark:border-[#343E26] text-[#2F2B24] dark:text-[#F3EFE6] hover:border-[#596628]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-lg font-extrabold text-xs ${
                          isDarkOlive
                            ? 'bg-[#59662C] text-[#F5F2EB] border border-[#F5F2EB]/30'
                            : 'bg-[#596628] text-white dark:bg-[#7D9333]'
                        }`}
                      >
                        {st.stepNumber}
                      </span>
                      {st.subtitle && (
                        <span className={`text-xs font-bold ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#7A7466] dark:text-[#A7A08E]'}`}>
                          {st.subtitle}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg sm:text-xl font-bold ${isDarkOlive ? 'text-[#FFFFFF]' : 'text-[#2F2B24] dark:text-white'}`}>
                      {st.title}
                    </h3>

                    {st.description && (
                      <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#5C5648] dark:text-[#C5BFB0]'}`}>
                        {st.description}
                      </p>
                    )}

                    {st.points && (
                      <ul className="space-y-2 text-xs leading-relaxed pt-1">
                        {st.points.map((pt, pIdx) => (
                          <li key={`step_pt_${st.stepNumber || idx}_${pIdx}`} className="flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDarkOlive ? 'bg-[#F5F2EB]' : 'bg-[#596628] dark:bg-[#A8C24E]'}`} />
                            <span className={isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#474135] dark:text-[#C5BFB0]'}>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Instruments & Tips */}
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                    {st.instruments && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[11px] font-bold ${isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#7A7466] dark:text-[#9A9382]'}`}>
                          الأدوات:
                        </span>
                        {st.instruments.map((inst, iIdx) => (
                          <span
                            key={`inst_${inst}_${iIdx}`}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isDarkOlive
                                ? 'bg-black/20 text-[#F5F2EB]'
                                : 'bg-white dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#3E4A2E] text-[#3F3A30] dark:text-[#D5CDBC]'
                            }`}
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    )}

                    {st.warning && (
                      <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-semibold">{st.warning}</span>
                      </div>
                    )}

                    {st.tips && (
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
                        <span className="font-semibold">{st.tips}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. OUTRO SLIDE */}
          {currentSlide.type === 'outro' && currentSlide.actionCallout && (
            <div className="max-w-3xl mx-auto py-2 space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#596628] dark:bg-[#7D9333] text-white text-xs font-black shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>الخلاصة السريرية والتواصل الأكاديمي</span>
              </div>

              <p className={`text-base sm:text-lg font-bold leading-relaxed ${isDarkOlive ? 'text-[#F5F2EB]' : 'text-[#3B352A] dark:text-[#E2DDD2]'}`}>
                {currentSlide.clinicalFocus}
              </p>

              {/* Contact Card */}
              <div
                className={`p-6 sm:p-8 rounded-3xl shadow-sm text-right rtl:text-right space-y-4 border-2 ${
                  isDarkOlive
                    ? 'bg-[#475222] border-[#F5F2EB]/50 text-[#F5F2EB]'
                    : 'bg-[#FAF7F2] dark:bg-[#20261A] border-[#596628] dark:border-[#7D9333] text-[#2F2B24] dark:text-[#F3EFE6]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-[#596628] dark:text-[#A8C24E] bg-[#596628]/10 dark:bg-[#A8C24E]/20 px-3.5 py-1 rounded-full border border-[#596628]/20 dark:border-[#A8C24E]/30 inline-flex items-center gap-1.5 mb-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>قناة وحسابات التواصل السريري المباشر</span>
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-black ${isDarkOlive ? 'text-[#FFFFFF]' : 'text-[#2F2B24] dark:text-white'}`}>
                      {currentSlide.actionCallout.offer || 'التواصل الأكاديمي والاستفسارات السريرية'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://instagram.com/hay_a_2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>@hay_a_2</span>
                    </a>

                    <a
                      href={`https://${currentSlide.actionCallout.channel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>تليجرام</span>
                    </a>
                  </div>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#5D5749] dark:text-[#C5BFB0]'}`}>
                  {currentSlide.actionCallout.details}
                </p>

                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDarkOlive
                      ? 'bg-[#37401a] border-[#59662C]'
                      : 'bg-white dark:bg-[#161A12] border-[#E5DEC9] dark:border-[#3E4A2E]'
                  }`}
                >
                  <div className="text-xs space-y-0.5">
                    <span className={`font-bold block ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#80796B] dark:text-[#9A9382]'}`}>
                      معرف التواصل (تليجرام & إنستا):
                    </span>
                    <span className={`font-extrabold text-sm ${isDarkOlive ? 'text-[#FFFFFF]' : 'text-[#596628] dark:text-[#A8C24E]'}`}>
                      @hay_a_2 (t.me/hay_a_2)
                    </span>
                  </div>

                  <div className="text-xs text-right sm:text-left">
                    <span className={`font-bold block ${isDarkOlive ? 'text-[#E0DBCE]' : 'text-[#80796B] dark:text-[#9A9382]'}`}>
                      إعداد ومتابعة:
                    </span>
                    <span className="font-extrabold text-sm text-[#2F2B24] dark:text-white">
                      حياه نافع فجر | جامعة المعارف
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="relative z-10 pt-4 border-t border-[#EFE8DC] dark:border-[#2C3420] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7466] dark:text-[#A7A08E]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#596628] dark:text-[#A8C24E]">حياه نافع فجر</span>
            <span>|</span>
            <span>جامعة المعارف - طب الأسنان</span>
          </div>

          {/* Quick interactive links */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenPhotos && (
              <button
                onClick={onOpenPhotos}
                className="px-2.5 py-1 rounded-lg bg-[#596628]/10 dark:bg-[#7D9333]/20 border border-[#596628]/30 dark:border-[#7D9333]/40 hover:bg-[#596628]/20 text-[#596628] dark:text-[#A8C24E] font-black transition-colors cursor-pointer flex items-center gap-1"
                title="عرض الحالات والصور السريرية الحقيقية"
              >
                <Camera className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
                <span>صور سريرية حقيقية</span>
              </button>
            )}
            {onOpenTimer && (
              <button
                onClick={onOpenTimer}
                className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#3E4A2E] hover:bg-[#F2ECE0] dark:hover:bg-[#2A3322] text-[#484236] dark:text-[#D5CDBC] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
                <span>مؤقت العيادة</span>
              </button>
            )}
            {onOpenSim && (
              <button
                onClick={onOpenSim}
                className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#3E4A2E] hover:bg-[#F2ECE0] dark:hover:bg-[#2A3322] text-[#484236] dark:text-[#D5CDBC] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
                <span>محاكي الطبقات</span>
              </button>
            )}
            {onOpenCheatSheet && (
              <button
                onClick={onOpenCheatSheet}
                className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#3E4A2E] hover:bg-[#F2ECE0] dark:hover:bg-[#2A3322] text-[#484236] dark:text-[#D5CDBC] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
                <span>الدليل السريري السريع</span>
              </button>
            )}
          </div>
        </div>

        {/* Next / Prev Floating Navigation Overlay on Slide Edges */}
        <button
          onClick={handlePrev}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#20261A]/90 hover:bg-[#596628] dark:hover:bg-[#7D9333] text-[#332E25] dark:text-white hover:text-white border border-[#E5DEC9] dark:border-[#3E4A2E] shadow-md flex items-center justify-center transition-all cursor-pointer z-20"
          title="السلايد السابق (السهم الأيمن)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#20261A]/90 hover:bg-[#596628] dark:hover:bg-[#7D9333] text-[#332E25] dark:text-white hover:text-white border border-[#E5DEC9] dark:border-[#3E4A2E] shadow-md flex items-center justify-center transition-all cursor-pointer z-20"
          title="السلايد التالي (السهم الأيسر أو مسافة)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Speaker Notes Drawer (Expandable) */}
      {showNotes && (
        <div className="mt-4 p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>ملاحظات الشرح السريري للمحاضر (د. حياه نافع فجر):</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-100 leading-relaxed">
            {currentSlide.speakerNotes || 'لا توجد ملاحظات إضافية لهذا السلايد.'}
          </p>

          {/* Direct Note Trigger */}
          <div className="pt-3 mt-3 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-amber-900/80 dark:text-amber-200 font-semibold">
              هل لديك سؤال أو استفسار سريري حول هذه الخطوة أو السلايد؟
            </span>
            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>كتابة ملاحظة للمشرفة د. حياة ✍️</span>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Printable Protocol Lecture View with Dynamic Diagonal Security Watermark */}
      <div className="print-only print:block hidden space-y-6 text-[#1A1814] bg-white">
        <SecurePrintWatermark
          documentTitle={activeClass?.arabicName || activeClass?.name || 'بروتوكول المحاضرة السريرية'}
        />

        {/* Protocol Cover Summary */}
        <div className="border-2 border-[#59662C] p-6 rounded-2xl bg-[#59662C]/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#59662C] text-white">
              {activeClass?.badge || 'Clinical Lecture Guide'}
            </span>
            <span className="text-xs font-bold text-gray-500 font-mono">
              Class ID: {activeClass?.id || 'standard-protocol'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2F2B24]">
            {activeClass?.arabicName || activeClass?.name || 'البروتوكول السريري لترميم الأسنان'}
          </h1>
          <p className="text-xs font-semibold text-gray-700">
            {activeClass?.subtitle || activeClass?.indication}
          </p>
          {realCaseInfo && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
              <div>
                <strong>السن المستهدف: </strong> {realCaseInfo.toothName}
              </div>
              <div>
                <strong>قاعدة الشطف المينائي: </strong> {realCaseInfo.bevelRule}
              </div>
            </div>
          )}
        </div>

        {/* All Protocol Slides / Steps */}
        <div className="space-y-6">
          {activeSlidesList.map((slide, idx) => (
            <div
              key={`print_slide_${slide.id || idx}_${idx}`}
              className="p-5 rounded-xl border border-gray-300 print-break-inside-avoid space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#59662C] text-white text-xs font-black flex items-center justify-center">
                    {slide.slideNumber}
                  </span>
                  <h3 className="text-base font-black text-gray-900">
                    {slide.title}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-gray-500 font-mono">
                  {slide.subtitle}
                </span>
              </div>

              {slide.clinicalFocus && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                  {slide.clinicalFocus}
                </div>
              )}

              {slide.steps && slide.steps.length > 0 && (
                <div className="space-y-2">
                  {slide.steps.map((st, sIdx) => (
                    <div key={`print_step_${st.stepNumber || sIdx}_${sIdx}`} className="text-xs space-y-0.5">
                      <div className="font-black text-gray-800">
                        {st.stepNumber}. {st.title} {st.subtitle ? `(${st.subtitle})` : ''}
                      </div>
                      <p className="text-gray-600 pr-4 leading-relaxed">
                        {st.description}
                      </p>
                      {st.points && st.points.length > 0 && (
                        <ul className="pr-4 space-y-0.5 list-disc list-inside text-gray-600">
                          {st.points.map((pt, pIdx) => (
                            <li key={`print_pt_${pIdx}`}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {slide.speakerNotes && (
                <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950">
                  <strong>ملاحظة سريرية: </strong>
                  {slide.speakerNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscriber Notes to Supervisor Modal */}
      <SubscriberSupervisorNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        sectionContextTitle={activeClass?.arabicName || 'بروتوكولات الكلاسات'}
        slideContextTitle={currentSlide?.title}
      />

      {/* Section Video Modal */}
      {protocolsSection && (
        <SectionVideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          section={protocolsSection}
          isAdmin={isAdmin}
          onVideoUpdated={(updatedSec) => {
            setProtocolsSection(updatedSec);
          }}
        />
      )}
    </div>
  );
};
