import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Syringe,
  ClipboardCheck,
  Pill,
  HelpCircle,
  X,
  Stethoscope,
  ChevronLeft,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  Maximize2,
  Minimize2,
  Search,
  Calendar,
} from 'lucide-react';
import {
  getCompanionPermissions,
  CompanionPermissionsMap,
  DEFAULT_COMPANION_PERMISSIONS,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
  getCompanionCardsList,
  CompanionCardMetadata,
  PROTOCOL_COMPANION_CARDS_EVENT,
} from '../data/companionPermissionsManager';
import {
  getCustomWindows,
  CustomWindow,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import { getIsSubscriptionSystemEnabled } from '../services/subscriptionSystemToggleService';

interface ClinicalCompanionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthorAdmin: boolean;
  isContentUnlocked?: boolean;
  isSubscriptionChecking?: boolean;
  isGuidePublic?: boolean;
  onOpenDirectPulpCapping?: () => void;
  onOpenSmartTrayProtocol?: () => void;
  onOpenAnesthesiaCalc: () => void;
  onOpenChecklist: () => void;
  onOpenPrescriptions: () => void;
  onOpenClinicalCompanionView: () => void;
  onOpenRequestProtocol: () => void;
  onOpenFAQ: () => void;
  onOpenSubscribeModal?: () => void;
  onOpenGlobalSearch?: () => void;
}

export const ClinicalCompanionBottomSheet: React.FC<ClinicalCompanionBottomSheetProps> = ({
  isOpen,
  onClose,
  isAuthorAdmin,
  isContentUnlocked = false,
  isSubscriptionChecking = false,
  isGuidePublic = false,
  onOpenDirectPulpCapping,
  onOpenSmartTrayProtocol,
  onOpenAnesthesiaCalc,
  onOpenChecklist,
  onOpenPrescriptions,
  onOpenClinicalCompanionView,
  onOpenRequestProtocol,
  onOpenFAQ,
  onOpenSubscribeModal,
  onOpenGlobalSearch,
}) => {
  const [permissions, setPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );
  const [cardsList, setCardsList] = useState<CompanionCardMetadata[]>(() =>
    getCompanionCardsList()
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setPermissions(getCompanionPermissions());
    };
    const handleCardsUpdate = () => {
      setCardsList(getCompanionCardsList());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
    window.addEventListener(PROTOCOL_COMPANION_CARDS_EVENT, handleCardsUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('storage', handleCardsUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
      window.removeEventListener(PROTOCOL_COMPANION_CARDS_EVENT, handleCardsUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('storage', handleCardsUpdate);
    };
  }, []);

  // Dynamic Custom Windows
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>(() => getCustomWindows());
  const [selectedCustomWindow, setSelectedCustomWindow] = useState<CustomWindow | null>(null);

  useEffect(() => {
    const handleCustomSync = () => {
      setCustomWindows(getCustomWindows());
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleCustomSync);
    window.addEventListener('storage', handleCustomSync);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleCustomSync);
      window.removeEventListener('storage', handleCustomSync);
    };
  }, []);

  // Determine actions mapping
  const getActionForCard = (cardId: string) => {
    switch (cardId) {
      case 'pulp_capping':
        return onOpenDirectPulpCapping || (() => {});
      case 'smart_tray':
        return onOpenSmartTrayProtocol || (() => {});
      case 'anesthesia':
        return onOpenAnesthesiaCalc;
      case 'checklist':
        return onOpenChecklist;
      case 'prescriptions':
        return onOpenPrescriptions;
      case 'viva_questions':
        return onOpenClinicalCompanionView;
      case 'appointments':
        return onOpenClinicalCompanionView;
      case 'request':
      default:
        return onOpenRequestProtocol || onOpenFAQ;
    }
  };

  const getCardTheme = (cardId: string) => {
    switch (cardId) {
      case 'appointments':
        return {
          bg: 'bg-gradient-to-br from-[#c5a059]/20 to-[#3b4a2e]/30 dark:from-[#c5a059]/30 dark:to-[#3b4a2e]/40',
          border: 'border-[#c5a059] dark:border-[#c5a059]',
          text: 'text-[#3b4a2e] dark:text-[#E2C767]',
          hoverBorder: 'hover:border-[#c5a059] dark:hover:border-[#f5d77f]',
          hoverText: 'group-hover:text-[#3b4a2e] dark:group-hover:text-[#f5d77f]',
          icon: <Calendar className="w-6 h-6 text-[#c5a059]" />,
        };
      case 'viva_questions':
        return {
          bg: 'bg-gradient-to-br from-[#c5a059]/15 to-[#3b4a2e]/20 dark:from-[#c5a059]/25 dark:to-[#3b4a2e]/30',
          border: 'border-[#c5a059] dark:border-[#8C741E]',
          text: 'text-[#3b4a2e] dark:text-[#E2C767]',
          hoverBorder: 'hover:border-[#3b4a2e] dark:hover:border-[#c5a059]',
          hoverText: 'group-hover:text-[#3b4a2e] dark:group-hover:text-[#E2C767]',
          icon: <HelpCircle className="w-6 h-6 text-[#c5a059]" />,
        };
      case 'pulp_capping':
        return {
          bg: 'bg-gradient-to-br from-teal-500/10 to-emerald-500/15 dark:from-teal-500/20 dark:to-emerald-500/30',
          border: 'border-teal-300 dark:border-teal-600/60',
          text: 'text-teal-700 dark:text-teal-300',
          hoverBorder: 'hover:border-teal-500 dark:hover:border-teal-400',
          hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
          icon: <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
        };
      case 'smart_tray':
        return {
          bg: 'bg-gradient-to-br from-amber-500/10 to-[#59662C]/15 dark:from-amber-500/20 dark:to-[#59662C]/30',
          border: 'border-amber-300 dark:border-amber-600/60',
          text: 'text-amber-600 dark:text-amber-400',
          hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400',
          hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
          icon: <Sparkles className="w-6 h-6 text-[#D4AF37]" />,
        };
      case 'anesthesia':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/50',
          border: 'border-sky-200 dark:border-sky-800',
          text: 'text-sky-600 dark:text-sky-400',
          hoverBorder: 'hover:border-sky-500 dark:hover:border-sky-400',
          hoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
          icon: <Syringe className="w-6 h-6" />,
        };
      case 'checklist':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-600 dark:text-emerald-400',
          hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-400',
          hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
          icon: <ClipboardCheck className="w-6 h-6" />,
        };
      case 'prescriptions':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-600 dark:text-amber-400',
          hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400',
          hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
          icon: <Pill className="w-6 h-6" />,
        };
      case 'request':
      default:
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/50',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600 dark:text-purple-400',
          hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400',
          hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
          icon: <HelpCircle className="w-6 h-6" />,
        };
    }
  };

  // Filter visible cards only
  const visibleCards = cardsList.filter((card) => {
    const perm = permissions[card.id] || DEFAULT_COMPANION_PERMISSIONS[card.id];
    return perm?.visibility !== 'hidden';
  });

  const handleCardClick = (cardId: string, isUnlocked: boolean, action: () => void) => {
    if (isUnlocked) {
      onClose();
      action();
    } else {
      // Card requires subscription and user is not unlocked
      onClose();
      if (onOpenSubscribeModal) {
        onOpenSubscribeModal();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="companion-sheet-title"
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          {/* Frosted Backdrop */}
          <motion.div
            key="companion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Sheet Container with curved top or Fullscreen */}
          <motion.div
            key="companion-sheet-panel"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full overflow-y-auto bg-[#FAF7F2] dark:bg-[#161B11] border-[#E5DEC9] dark:border-[#384524] shadow-2xl p-5 sm:p-6 text-right pb-10 transition-all duration-300 ${
              isFullscreen
                ? 'fixed inset-0 max-w-none max-h-none h-full rounded-none'
                : 'max-w-xl max-h-[85vh] border-t-2 border-x-2 rounded-t-[2.5rem]'
            }`}
            dir="rtl"
          >
        {/* Drag Pill */}
        {!isFullscreen && (
          <div className="flex justify-center mb-3">
            <div className="w-12 h-1.5 rounded-full bg-[#D5CDBC] dark:bg-[#384524]" />
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] dark:border-[#2C361D] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#8FA839] text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="companion-sheet-title"
                className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white flex items-center gap-2"
              >
                <span>الرفيق السريري السريع</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#59662C]/10 text-[#59662C] dark:bg-[#A4BF46]/20 dark:text-[#CBE276]">
                  PROTOCOL Companion
                </span>
              </h3>
              <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] font-medium">
                الأدوات السريرية السريعة لطبيب الأسنان أثناء الجلسة العلاجية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة ملء الشاشة'}
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#202816] border border-[#E5DEC9] dark:border-[#384524] text-[#706A5B] dark:text-[#A7A08E] hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title={isFullscreen ? 'تصغير النافذة' : 'ملء الشاشة'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#202816] border border-[#E5DEC9] dark:border-[#384524] text-[#706A5B] dark:text-[#A7A08E] hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Quick Search Banner Button */}
        {onOpenGlobalSearch && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGlobalSearch();
            }}
            className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#59662C]/15 to-[#A4BF46]/20 dark:from-[#59662C]/25 dark:to-[#A4BF46]/30 hover:from-[#59662C]/25 hover:to-[#A4BF46]/35 border border-[#59662C]/30 dark:border-[#A4BF46]/40 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#59662C] dark:bg-[#A4BF46] text-white dark:text-[#181D13] flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-[#59662C] dark:text-[#A4BF46]">
                  البحث السريري الشامل (Global Search)
                </span>
                <span className="text-[11px] text-[#706A5B] dark:text-[#A7A08E]">
                  بحث فوري عن الكلاسات، الأدوية، وحاسبات التخدير
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1E2417] text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/20 shadow-xs flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>ابحث الآن</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </span>
          </button>
        )}

        {/* Dynamic Quick Launch Cards - Filtered by Visibility */}
        {visibleCards.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-black text-[#2F2B24] dark:text-white">
              لا توجد بطاقات معروضة حالياً
            </p>
            <p className="text-xs text-[#706A5B] dark:text-[#A7A08E]">
              تم إخفاء جميع بطاقات الرفيق السريري بواسطة المشرف. يمكن تفعيلها مجدداً من لوحة الإدارة.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {isSubscriptionChecking ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={`skel_pulse_${i}`} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/40 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-300 dark:bg-neutral-700" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-neutral-300 dark:bg-neutral-700 rounded" />
                        <div className="w-48 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              visibleCards.map((card, cIdx) => {
                const perm = permissions[card.id] || DEFAULT_COMPANION_PERMISSIONS[card.id] || {
                  access: 'subscription',
                  visibility: 'visible',
                };
                const theme = getCardTheme(card.id);
                const action = getActionForCard(card.id);

                // Access Logic:
                // 1. Admin always has full access
                // 2. If card is 'free', anyone can access it directly without paywall
                const isSubActive = getIsSubscriptionSystemEnabled();
                const isFree = perm.access === 'free' || !isSubActive;
                const isUnlocked = isAuthorAdmin || isContentUnlocked || isFree;

                return (
                  <div
                    key={`${card.id}_${cIdx}`}
                    onClick={() => handleCardClick(card.id, isUnlocked, action)}
                    className={`group p-4 rounded-2xl border transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between ${
                      isUnlocked
                        ? `bg-white dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#323E20] ${theme.hoverBorder}`
                        : 'bg-neutral-50 dark:bg-[#181E13] border-neutral-300 dark:border-[#2D361F] hover:border-amber-500/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl ${theme.bg} border ${theme.border} ${theme.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        {theme.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-sm font-black transition-colors ${
                              isUnlocked
                                ? `text-[#2F2B24] dark:text-white ${theme.hoverText}`
                                : 'text-[#484236] dark:text-[#E0DACB]'
                            }`}
                          >
                            {card.title}
                          </h4>

                          {/* Dynamic Access Badges */}
                          {isFree ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>محتوى مجاني للعامة</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                              <span>متاح للمشتركين</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                              <span>محتوى مدفوع (يتطلب اشتراك)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] font-medium mt-0.5">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft
                    className={`w-5 h-5 group-hover:-translate-x-1 transition-all shrink-0 ${
                      isUnlocked ? theme.text : 'text-neutral-400'
                    }`}
                  />
                </div>
              );
            }))}

            {/* Custom Windows for Clinical Companion */}
            {customWindows
              .filter((w) => w.targetLocation === 'clinical_companion' && (!w.isHidden || isAuthorAdmin))
              .map((cWin, idx) => {
                const isSubActive = getIsSubscriptionSystemEnabled();
                const isLocked = isSubActive && cWin.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;
                return (
                  <div
                    key={`${cWin.id}_${idx}`}
                    onClick={() => {
                      if (isLocked && onOpenSubscribeModal) {
                        onClose();
                        onOpenSubscribeModal();
                      } else {
                        setSelectedCustomWindow(cWin);
                      }
                    }}
                    className={`group p-4 rounded-2xl border transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between ${
                      !isLocked
                        ? 'bg-white dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#323E20] hover:border-amber-500/80'
                        : 'bg-neutral-50 dark:bg-[#181E13] border-neutral-300 dark:border-[#2D361F] hover:border-amber-500/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors">
                            {cWin.title}
                          </h4>
                          {cWin.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                              {cWin.badge}
                            </span>
                          )}
                          {!isLocked ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>متاح للعامة</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                              <span>يتطلب اشتراك</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] font-medium mt-0.5 line-clamp-1">
                          {cWin.subtitle || cWin.content}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-amber-500 group-hover:-translate-x-1 transition-all shrink-0" />
                  </div>
                );
              })}
          </div>
        )}

        {/* View Full Digital Companion Link */}
        <div className="mt-5 pt-4 border-t border-[#E5DEC9] dark:border-[#2C361D] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenClinicalCompanionView();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#59662C] to-[#7D9333] hover:from-[#475323] hover:to-[#657728] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>فتح شاشة الرفيق السريري الشاملة 🚀</span>
          </button>
        </div>
      </motion.div>

      {/* Dynamic Custom Window Bottom Sheet Modal */}
      {selectedCustomWindow && (
        <CustomWindowBottomSheetModal
          windowItem={selectedCustomWindow}
          isOpen={!!selectedCustomWindow}
          onClose={() => setSelectedCustomWindow(null)}
          isAuthorAdmin={isAuthorAdmin}
          isContentUnlocked={isContentUnlocked}
          onOpenSubscribeModal={onOpenSubscribeModal}
        />
      )}
        </div>
      )}
    </AnimatePresence>
  );
};

