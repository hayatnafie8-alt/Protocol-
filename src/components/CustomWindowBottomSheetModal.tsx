import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ClipboardCheck,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  RotateCcw,
  Stethoscope,
  Lock,
  Unlock,
  ShieldCheck,
  Pill,
  Syringe,
  Bookmark,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  CustomWindow,
  CustomWindowChecklistItem,
} from '../data/customWindowsManager';
import { getIsSubscriptionSystemEnabled } from '../services/subscriptionSystemToggleService';

interface CustomWindowBottomSheetModalProps {
  windowItem: CustomWindow | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthorAdmin?: boolean;
  isContentUnlocked?: boolean;
  onOpenSubscribeModal?: () => void;
}

export const CustomWindowBottomSheetModal: React.FC<CustomWindowBottomSheetModalProps> = ({
  windowItem,
  isOpen,
  onClose,
  isAuthorAdmin = false,
  isContentUnlocked = false,
  onOpenSubscribeModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [checklistState, setChecklistState] = useState<CustomWindowChecklistItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize or reset checklist items when modal opens with a checklist window
  useEffect(() => {
    if (windowItem && windowItem.contentType === 'checklist') {
      const items = windowItem.checklistItems && windowItem.checklistItems.length > 0
        ? windowItem.checklistItems.map((item) => ({ ...item, completed: !!item.completed }))
        : [];
      setChecklistState(items);
    }
  }, [windowItem]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !windowItem) return null;

  const isSubscriptionActive = getIsSubscriptionSystemEnabled();
  const isLocked = isSubscriptionActive && windowItem.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;

  // Toggle checklist item
  const handleToggleChecklistItem = (id: string) => {
    setChecklistState((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  // Reset checklist
  const handleResetChecklist = () => {
    setChecklistState((prev) => prev.map((it) => ({ ...it, completed: false })));
  };

  // Copy content to clipboard
  const handleCopyContent = () => {
    try {
      const textToCopy = `${windowItem.title}\n\n${windowItem.subtitle ? windowItem.subtitle + '\n\n' : ''}${windowItem.content}${
        windowItem.externalUrl ? '\nالرابط: ' + windowItem.externalUrl : ''
      }`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  // Checklist completion stats
  const totalChecklist = checklistState.length;
  const completedChecklist = checklistState.filter((it) => it.completed).length;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Icon mapping
  const renderWindowIcon = () => {
    const iconClass = "w-6 h-6 text-[#59662C] dark:text-[#D4AF37]";
    switch (windowItem.icon) {
      case 'ClipboardCheck':
        return <ClipboardCheck className={iconClass} />;
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'Link':
        return <ExternalLink className={iconClass} />;
      case 'Pill':
        return <Pill className={iconClass} />;
      case 'Syringe':
        return <Syringe className={iconClass} />;
      case 'Bookmark':
        return <Bookmark className={iconClass} />;
      case 'Stethoscope':
      default:
        return <Stethoscope className={iconClass} />;
    }
  };

  // Target Location Label
  const getLocationLabel = () => {
    switch (windowItem.targetLocation) {
      case 'clinical_companion':
        return 'الرفيق السريري 🩺';
      case 'skills':
        return 'قسم مهاراتي 📘';
      case 'more':
        return 'قسم المزيد ☰';
      case 'protocols':
        return 'البروتوكولات والمكتبة 📋';
      case 'home':
        return 'الواجهة الرئيسية 🏠';
      default:
        return 'قسم سريري';
    }
  };

  // Content Type Label
  const getTypeLabel = () => {
    switch (windowItem.contentType) {
      case 'text':
        return 'محتوى نصي وسريري 📄';
      case 'checklist':
        return 'قائمة فحص تفاعلية ✅';
      case 'link':
        return 'مرجع ورابط خارجي 🔗';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#FAF7F2] dark:bg-[#161C12] text-neutral-900 dark:text-neutral-100 shadow-2xl border-t sm:border border-[#E5DEC9] dark:border-[#343F25] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250 transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-[10000] w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[92vh] sm:max-h-[88vh]'
        }`}
      >
        {/* Mobile Swipe Bar Indicator */}
        <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Top Header */}
        <div className="px-5 sm:px-7 pt-4 pb-4 border-b border-[#E5DEC9]/80 dark:border-[#2C3720] flex items-start justify-between gap-4 shrink-0 bg-gradient-to-b from-[#FAF7F2] to-white/70 dark:from-[#161C12] dark:to-[#1A2216]">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Circular Luxury Icon Badge */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#59662C]/20 via-[#D4AF37]/25 to-amber-500/20 dark:from-[#3D4C1F] dark:to-[#222A1A] border border-[#59662C]/30 dark:border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-md">
              {renderWindowIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/25">
                  {getLocationLabel()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {getTypeLabel()}
                </span>
                {windowItem.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 text-[#59662C] dark:text-[#D4AF37] border border-[#D4AF37]/40">
                    {windowItem.badge}
                  </span>
                )}
                {isLocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>يتطلب اشتراك</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Unlock className="w-2.5 h-2.5" />
                    <span>متاح للعامة</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white leading-tight">
                {windowItem.title}
              </h2>
              {windowItem.subtitle && (
                <p className="text-xs text-[#736C5F] dark:text-[#A7A08E] mt-0.5 line-clamp-2">
                  {windowItem.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Header Buttons: Fullscreen & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة ملء الشاشة'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5 scrollbar-thin">
          {/* Gated Content Paywall Notice */}
          {isLocked ? (
            <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/30 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
                  هذه النافذة مخصصة للمشتركين المعتمدين 🔒
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 max-w-md mx-auto leading-relaxed">
                  تم تحديد صلاحيات هذا المحتوى ليكون متاحاً فقط للأطباء المشتركين بكود تفعيل البروتوكول السريري المعتمد.
                </p>
              </div>

              {onOpenSubscribeModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubscribeModal();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#455022] hover:from-[#495424] hover:to-[#38411b] text-white text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4 text-[#D4AF37]" />
                  <span>تفعيل الاشتراك أو إدخال كود التفعيل</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* CONTENT TYPE: 1. TEXT */}
              {windowItem.contentType === 'text' && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] shadow-xs">
                    <div className="text-xs sm:text-sm text-[#3E3A31] dark:text-[#D9D3C7] leading-relaxed whitespace-pre-wrap font-sans space-y-3">
                      {windowItem.content}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCopyContent}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E2519] hover:bg-neutral-100 dark:hover:bg-[#252E1F] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>تم النسخ بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ المحتوى السريري</span>
                        </>
                      )}
                    </button>

                    <div className="text-[11px] text-neutral-400 font-mono">
                      {new Date(windowItem.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT TYPE: 2. CHECKLIST */}
              {windowItem.contentType === 'checklist' && (
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] shadow-xs flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-black mb-1.5 text-neutral-700 dark:text-neutral-300">
                        <span>نسبة الإنجاز والتحقق السريري:</span>
                        <span className="font-mono text-[#59662C] dark:text-[#A4BF46]">
                          {completedChecklist} من {totalChecklist} ({checklistPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-emerald-500 to-[#59662C] transition-all duration-300 rounded-full"
                          style={{ width: `${checklistPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetChecklist}
                      className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-all cursor-pointer"
                      title="إعادة تعيين القائمة"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2.5">
                    {checklistState.map((item, idx) => (
                      <div
                        key={`${item.id}_${idx}`}
                        onClick={() => handleToggleChecklistItem(item.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          item.completed
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                            : 'bg-white dark:bg-[#1E2519] border-[#E5DEC9] dark:border-[#323D24] text-neutral-800 dark:text-neutral-200 hover:border-[#59662C]/40'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                          )}
                        </div>

                        <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
                          <span className={item.completed ? 'line-through opacity-75' : ''}>
                            {item.text}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Completion Banner */}
                  {checklistPercent === 100 && totalChecklist > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center justify-center gap-2 animate-fadeIn">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>اكتملت جميع خطوات الفحص بنجاح وجاهز للمتابعة السريرية! 🩺</span>
                    </div>
                  )}
                </div>
              )}

              {/* CONTENT TYPE: 3. LINK */}
              {windowItem.contentType === 'link' && (
                <div className="space-y-4">
                  {/* Link Action Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#59662C]/10 via-white to-sky-500/10 dark:from-[#21291B] dark:via-[#1B2216] dark:to-[#172124] border-2 border-[#59662C]/30 dark:border-[#364228] shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#59662C] text-white flex items-center justify-center shadow-md">
                          <ExternalLink className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#59662C] dark:text-[#A4BF46] block">
                            مرجع طبي ومصدر إلكتروني
                          </span>
                          <h3 className="text-base font-black text-neutral-900 dark:text-white">
                            {windowItem.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {windowItem.content && (
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {windowItem.content}
                      </p>
                    )}

                    {windowItem.externalUrl && (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <a
                          href={windowItem.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#455022] hover:from-[#4a5524] hover:to-[#38411b] text-white text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>فتح الرابط الخارجي المعتمد</span>
                          <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(windowItem.externalUrl || '');
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="py-3 px-4 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Supervisor Signature Footnote */}
          <div className="pt-4 border-t border-[#E5DEC9]/80 dark:border-[#2C3720] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                إشراف وتدقيق: {windowItem.author || 'د. حياة نافع فجر'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-neutral-400">
              Protocol Companion Suite
            </span>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[#E5DEC9]/80 dark:border-[#2C3720] bg-white/50 dark:bg-[#141A10] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-black transition-all cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
