import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CustomWindow,
  getCustomWindows,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import {
  X,
  User,
  GraduationCap,
  KeyRound,
  Download,
  Moon,
  Sun,
  Send,
  Instagram,
  MessageSquare,
  ShieldCheck,
  FileText,
  Palette,
  Layers,
  Timer,
  Camera,
  Plus,
  Users,
  EyeOff,
  Settings,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronLeft,
  Info,
  Search,
  Share2,
  HandHeart,
} from 'lucide-react';
import { getIsSubscriptionSystemEnabled } from '../services/subscriptionSystemToggleService';
import { DoctorProfileAvatar } from './DoctorProfileAvatar';

interface MenuSlideOutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAuthorAdmin: boolean;
  isContentUnlocked: boolean;
  isSubscriptionSystemEnabled?: boolean;
  subscriberEmail?: string;
  onOpenShareModal?: () => void;
  onOpenSubscribeModal: () => void;
  onOpenRequestCodeModal: () => void;
  onOpenAdminPanel: () => void;
  onOpenFeedbackInbox: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenShadeSimulator: () => void;
  onOpenAnatomyVisualizer: () => void;
  onOpenClinicalTimer: () => void;
  onOpenPrintAtlas: () => void;
  onOpenClinicalPhotos: () => void;
  onOpenAddNewCard: () => void;
  onOpenSettingsModal: () => void;
  onToggleAuthorMode: () => void;
  onRelockContent: () => void;
  unreadRepliesCount?: number;
  onOpenGlobalSearch?: () => void;
}

export const MenuSlideOutDrawer: React.FC<MenuSlideOutDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  isAuthorAdmin,
  isContentUnlocked,
  isSubscriptionSystemEnabled,
  subscriberEmail,
  onOpenShareModal,
  onOpenSubscribeModal,
  onOpenRequestCodeModal,
  onOpenAdminPanel,
  onOpenFeedbackInbox,
  onOpenPrivacyPolicy,
  onOpenShadeSimulator,
  onOpenAnatomyVisualizer,
  onOpenClinicalTimer,
  onOpenPrintAtlas,
  onOpenClinicalPhotos,
  onOpenAddNewCard,
  onOpenSettingsModal,
  onToggleAuthorMode,
  onRelockContent,
  unreadRepliesCount = 0,
  onOpenGlobalSearch,
}) => {
  const [quickFeedbackText, setQuickFeedbackText] = useState('');
  const [feedbackSentNotice, setFeedbackSentNotice] = useState(false);

  const [moreCustomWindows, setMoreCustomWindows] = useState<CustomWindow[]>(() => {
    return getCustomWindows().filter((w) => w.targetLocation === 'more');
  });
  const [selectedMoreWindow, setSelectedMoreWindow] = useState<CustomWindow | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setMoreCustomWindows(getCustomWindows().filter((w) => w.targetLocation === 'more'));
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleSendQuickFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFeedbackText.trim()) return;

    // Send note / feedback to supervisor notes modal
    setFeedbackSentNotice(true);
    setTimeout(() => {
      setFeedbackSentNotice(false);
      setQuickFeedbackText('');
      onClose();
      onOpenFeedbackInbox();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-drawer-title"
          className="fixed inset-0 z-50 flex justify-start"
        >
          {/* Frosted Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Container (Smooth Slide with Spring Physics) */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-md h-full bg-[#FAF7F2] dark:bg-[#151911] border-l border-[#E5DEC9] dark:border-[#333E24] shadow-2xl flex flex-col text-right overflow-hidden"
            dir="rtl"
          >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E5DEC9] dark:border-[#2C361D] bg-white/70 dark:bg-[#1A2015]/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DoctorProfileAvatar size="md" isEditable={isAuthorAdmin} showBadge={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 id="menu-drawer-title" className="font-black text-sm text-[#2F2B24] dark:text-white">
                  {isAuthorAdmin ? 'د. حياة نافع فجر (المشرف)' : subscriberEmail || 'طبيب / طالب زائر'}
                </h3>
                {isAuthorAdmin ? (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-amber-950">
                    Admin
                  </span>
                ) : isContentUnlocked ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    مشترك معتمد
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-neutral-400">
                    زائر
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#706A5B] dark:text-[#A7A08E] font-medium mt-0.5">
                جامعة المعارف • كلية طب الأسنان
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#202816] border border-[#E5DEC9] dark:border-[#384524] text-[#706A5B] dark:text-[#A7A08E] hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Global Search Shortcut Button */}
          {onOpenGlobalSearch && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGlobalSearch();
              }}
              className="w-full p-3 rounded-2xl bg-[#59662C]/10 dark:bg-[#A4BF46]/15 hover:bg-[#59662C]/20 border border-[#59662C]/30 dark:border-[#A4BF46]/30 text-[#2F2B24] dark:text-white flex items-center justify-between transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#59662C] dark:bg-[#A4BF46] text-white dark:text-[#181D13] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-[#59662C] dark:text-[#A4BF46]">
                    البحث السريري الشامل (Global Search)
                  </span>
                  <span className="text-[10px] text-[#7D7667] dark:text-[#A7A08E]">
                    ابحث عن أي بروتوكول، كلاس، مخدر، أو دواء
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46] transition-transform group-hover:-translate-x-1" />
            </button>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: ADMIN CONTROLS (VISIBLE ONLY WHEN ADMIN ACTIVE) */}
          {/* ======================================================== */}
          {isAuthorAdmin && (
            <div className="space-y-3 p-4 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border-2 border-amber-400/40 dark:border-amber-600/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>لوحة المشرف وإدارة المحتوى</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  Author Hub
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* 1. Admin Master Panel */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-amber-300 dark:border-amber-800 hover:border-amber-500 text-right text-xs font-bold text-[#2F2B24] dark:text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>لوحة تحكم المشرف (الرموز والاشتراكات)</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-amber-600" />
                </button>

                {/* 2. Hidden & Pending Windows (+ Add New Card) */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddNewCard();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-amber-300 dark:border-amber-800 hover:border-amber-500 text-right text-xs font-bold text-[#2F2B24] dark:text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>النوافذ المسودة + إضافة كارت وبروتوكول جديد</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black">
                    + Add
                  </span>
                </button>

                {/* 3. Subscriber Feedback Inbox */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFeedbackInbox();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-amber-300 dark:border-amber-800 hover:border-amber-500 text-right text-xs font-bold text-[#2F2B24] dark:text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>صندوق استفسارات وملاحظات المشتركين</span>
                  </div>
                  {unreadRepliesCount > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                      {unreadRepliesCount}
                    </span>
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                {/* 4. Settings Modal */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettingsModal();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-amber-300 dark:border-amber-800 hover:border-amber-500 text-right text-xs font-bold text-[#2F2B24] dark:text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    <span>إعدادات النظام والأمان المتقدمة</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Consolidated Toolkit for Admin */}
              <div className="pt-2 border-t border-amber-300/40 dark:border-amber-800/40">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-2">
                  صندوق الأدوات السريرية الشامل (Toolkit):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenShadeSimulator();
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#1E2417] border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 text-purple-600" />
                    <span>لون الكومبوزيت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnatomyVisualizer();
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#1E2417] border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>الطبقات ثلاثية الأبعاد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenClinicalTimer();
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#1E2417] border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5 text-rose-600" />
                    <span>مؤقت العيادة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPrintAtlas();
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#1E2417] border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>الدليل المطبوع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenClinicalPhotos();
                    }}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#1E2417] border border-amber-200 dark:border-amber-900 text-[11px] font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5 hover:bg-amber-100 transition-colors col-span-2"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                    <span>صور وحالات سريرية حقيقية (Cases & Assets)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CLINICAL SUPPLICATION PRAYER BUTTON */}
          {/* ======================================================== */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1b2518] to-[#141b12] border border-[#c5a059]/40 text-right shadow-sm">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open_clinical_prayer'));
              }}
              className="w-full flex items-center justify-between text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#d4af37] shrink-0 group-hover:scale-105 transition-transform">
                  <HandHeart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#faf7ee]">الدعاء الطبي السريري</div>
                  <div className="text-[10px] text-[#c5a059]">نية الشفاء والبركة والتوفيق بالعمل</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#c5a059] group-hover:-translate-x-1 transition-transform rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* DYNAMIC SUPERVISOR CUSTOM WINDOWS (Target: MORE / المزيد) */}
          {/* ======================================================== */}
          {moreCustomWindows.filter((w) => !w.isHidden || isAuthorAdmin).length > 0 && (
            <div className="space-y-2.5 p-3 rounded-2xl bg-gradient-to-br from-[#59662C]/10 via-[#FAF7F2] to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border border-[#59662C]/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#59662C] dark:text-[#A4BF46] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>أقسام ونوافذ مخصصة (المزيد):</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46]">
                  {moreCustomWindows.filter((w) => !w.isHidden || isAuthorAdmin).length} نوافذ
                </span>
              </div>
              <div className="space-y-2">
                {moreCustomWindows
                  .filter((w) => !w.isHidden || isAuthorAdmin)
                  .map((cWin, idx) => {
                    const isSubActive = isSubscriptionSystemEnabled ?? getIsSubscriptionSystemEnabled();
                    const isLocked = isSubActive && cWin.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;
                    return (
                      <button
                        key={`${cWin.id}_${idx}`}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            onClose();
                            onOpenSubscribeModal();
                          } else {
                            setSelectedMoreWindow(cWin);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer group ${
                          cWin.isHidden
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60'
                            : 'bg-white/95 dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#384524] hover:border-[#59662C] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center shrink-0">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-rose-500" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-[#2F2B24] dark:text-white truncate group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46]">
                              {cWin.title}
                            </div>
                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                              <span>{cWin.badge || (cWin.contentType === 'checklist' ? 'قائمة تفاعلية' : 'محتوى سريري')}</span>
                              {cWin.isHidden && (
                                <span className="text-rose-600 font-bold">(مخفي عن الطلاب)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition-transform rtl:rotate-0 ltr:rotate-180 shrink-0" />
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: SUBSCRIBERS & GENERAL ACTIONS */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#59662C] dark:text-[#A4BF46] block px-1">
              إدارة الاشتراك والوصول:
            </span>

            {/* Subscribe & Promo Code Trigger (Only shown when subscription system is active) */}
            {!isAuthorAdmin && (isSubscriptionSystemEnabled ?? getIsSubscriptionSystemEnabled()) && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubscribeModal();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <KeyRound className="w-5 h-5" />
                  <span>دخول المشتركين</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRequestCodeModal();
                  }}
                  className="p-3 rounded-2xl bg-[#59662C] hover:bg-[#475323] text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>طلب كود اشتراك</span>
                </button>
              </div>
            )}

            {/* Fully Free Public Mode Notice (When subscription & payment UI is hidden by supervisor) */}
            {!isAuthorAdmin && !(isSubscriptionSystemEnabled ?? getIsSubscriptionSystemEnabled()) && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>الوضع المجاني العام مفعّل (كافة الأقسام متاحة للجميع) 🔓</span>
                </div>
              </div>
            )}

            {isContentUnlocked && !isAuthorAdmin && (
              <button
                type="button"
                onClick={onRelockContent}
                className="w-full p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>تسجيل الخروج وقفل المحتوى</span>
                </div>
                <span className="text-[10px] text-sky-700 dark:text-sky-300">قفل</span>
              </button>
            )}
          </div>

          {/* Theme Switcher */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-amber-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <span className="text-xs font-black text-[#2F2B24] dark:text-white block">
                  مظهر التطبيق (Theme)
                </span>
                <span className="text-[10px] text-[#706A5B] dark:text-[#A7A08E]">
                  {theme === 'dark' ? 'الوضع الليلي المفعل' : 'الوضع النهاري الهادئ'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3320] border border-[#D5CDBC] dark:border-[#425028] text-xs font-bold text-[#2F2B24] dark:text-white hover:bg-neutral-200 dark:hover:bg-[#344026] cursor-pointer transition-colors"
            >
              {theme === 'dark' ? 'تبديل للنهاري ☀️' : 'تبديل لليلي 🌙'}
            </button>
          </div>

          {/* Official Supervisor Contact Channels */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#59662C] dark:text-[#A4BF46] block px-1">
              قنوات التواصل الرسمية مع المشرفة:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://t.me/hay_a_2"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-sky-100 transition-colors"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>تليجرام @hay_a_2</span>
              </a>

              <a
                href="https://instagram.com/hay_a_2"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
              >
                <Instagram className="w-4 h-4 text-rose-600" />
                <span>إنستغرام @hay_a_2</span>
              </a>
            </div>
          </div>

          {/* Feedback & Suggestions Box */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>صندوق الملاحظات والاقتراحات للمشرفة:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedbackInbox();
                }}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                سجل الملاحظات 📝
              </button>
            </div>

            <form onSubmit={handleSendQuickFeedback} className="space-y-2">
              <textarea
                rows={2}
                value={quickFeedbackText}
                onChange={(e) => setQuickFeedbackText(e.target.value)}
                placeholder="اكتب استفسارك السريري أو اقتراحك ليظهر في صندوق ملاحظات المشرفة مباشرة..."
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#151911] border border-[#D5CDBC] dark:border-[#333E24] text-xs font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#706A5B] dark:text-[#A7A08E]">
                  يصل الرد مباشرة لحسابك
                </span>
                <button
                  type="submit"
                  disabled={!quickFeedbackText.trim() || feedbackSentNotice}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {feedbackSentNotice ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم الإرسال!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال للمشرفة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Share App and Link / Install PWA Button */}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShareModal();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-300 dark:border-sky-800 hover:border-sky-500 text-right text-xs font-black text-sky-950 dark:text-sky-200 flex items-center justify-between cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>مشاركة التطبيق والرابط وتثبيت PWA 🔗</span>
              </div>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">مشاركة</span>
            </button>
          )}

          {/* Privacy Policy & Mandatory Medical Disclaimer */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPrivacyPolicy();
            }}
            className="w-full p-3 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] hover:border-[#59662C] text-right text-xs font-bold text-[#2F2B24] dark:text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
              <span>سياسة الخصوصية والتنبيه الطبي القانوني</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-[#999080]" />
          </button>

          {/* Admin PIN Login Toggle at bottom of drawer */}
          <div className="pt-2 border-t border-[#E5DEC9] dark:border-[#2C361D] flex items-center justify-between text-xs">
            <span className="text-[#706A5B] dark:text-[#A7A08E] font-medium text-[11px]">
              {isAuthorAdmin ? 'حساب المشرفة نشط' : 'هل أنت المشرف؟'}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onToggleAuthorMode();
              }}
              className="text-[#59662C] dark:text-[#A4BF46] font-black hover:underline cursor-pointer"
            >
              {isAuthorAdmin ? 'التبديل إلى وضع معاينة الطلاب' : 'تسجيل دخول المشرف (PIN)'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
      )}

      {/* Dynamic Custom Window Bottom Sheet for More Section */}
      <CustomWindowBottomSheetModal
        isOpen={!!selectedMoreWindow}
        windowItem={selectedMoreWindow}
        onClose={() => setSelectedMoreWindow(null)}
        isAuthorAdmin={isAuthorAdmin}
        isContentUnlocked={isContentUnlocked}
        onOpenSubscribeModal={onOpenSubscribeModal}
      />
    </AnimatePresence>
  );
};
