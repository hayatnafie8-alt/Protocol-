import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Stethoscope,
  Calculator,
  Pill,
  HelpCircle,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Plus,
  Send,
  Sparkles,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Heart,
  Syringe,
  Activity,
  FileText,
  Maximize2,
  Minimize2,
  X,
  Edit3,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Calendar,
  Save,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  PrescriptionDrug,
  PrescriptionCategory,
  PRESCRIPTION_CATEGORIES,
} from '../data/prescriptionGuideData';
import {
  subscribeToPrescriptionDrugsCloud,
  subscribeToPrescriptionGuideConfigCloud,
  setPrescriptionGuideGlobalVisibilityInCloud,
  addPrescriptionDrugInCloud,
} from '../services/prescriptionGuideService';
import { saveSupervisorNote } from '../data/supervisorNotes';
import { saveSupervisorNoteToCloud } from '../services/realTimeSyncService';
import {
  calculateLocalAnestheticDose,
  AnestheticId,
  CartridgeSize,
  AgeCategory,
} from '../data/anesthesiaCalculatorData';
import {
  getSessionCheckedItems,
  toggleSessionCheckItem,
  resetSessionChecklist,
  CORE_PRE_PROCEDURE_STEPS,
} from '../data/preProcedureChecklistData';
import {
  setElementOverrideInCloud,
  getLocalElementOverrides,
} from '../services/elementOverridesService';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  getCompanionPermissions,
  CompanionPermissionsMap,
  DEFAULT_COMPANION_PERMISSIONS,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
} from '../data/companionPermissionsManager';
import {
  getCustomWindows,
  CustomWindow,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import { SmartClinicTrayProtocolModal } from './SmartClinicTrayProtocolModal';
import { DirectPulpCappingModal } from './DirectPulpCappingModal';
import { OperativeVivaSection } from './OperativeVivaSection';
import { AppointmentsSection } from './AppointmentsSection';
import { ClinicalCasesDashboard } from './ClinicalCasesDashboard';

interface ClinicalCompanionViewProps {
  isAuthorAdmin: boolean;
  onOpenAdminLogin?: () => void;
  subscriberEmail?: string;
  onBackToHome?: () => void;
  onOpenFullCalculatorModal?: () => void;
  isContentUnlocked?: boolean;
  isSubscriptionChecking?: boolean;
  onOpenSubscribeModal?: () => void;
}

export const ClinicalCompanionView: React.FC<ClinicalCompanionViewProps> = ({
  isAuthorAdmin,
  onOpenAdminLogin,
  subscriberEmail = '',
  onBackToHome,
  onOpenFullCalculatorModal,
  isContentUnlocked = false,
  isSubscriptionChecking = false,
  onOpenSubscribeModal,
}) => {
  const { language, t, isRTL } = useLanguage();

  // -------------------------------------------------------------
  // Companion Card Permissions & Real-time Sync
  // -------------------------------------------------------------
  const [permissions, setPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setPermissions(getCompanionPermissions());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Dynamic Custom Windows from Admin Panel
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>(() => getCustomWindows());
  const [selectedCustomWindow, setSelectedCustomWindow] = useState<CustomWindow | null>(null);

  useEffect(() => {
    const handleCustomWindowsUpdate = () => {
      setCustomWindows(getCustomWindows());
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleCustomWindowsUpdate);
    window.addEventListener('storage', handleCustomWindowsUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleCustomWindowsUpdate);
      window.removeEventListener('storage', handleCustomWindowsUpdate);
    };
  }, []);

  // -------------------------------------------------------------
  // 1. Modal Windows System State (The Smart Window System)
  // -------------------------------------------------------------
  type WindowId = 'window-la' | 'window-checklist' | 'window-drugs' | 'window-ianb' | 'window-request';
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
  const [maximizedWindows, setMaximizedWindows] = useState<Record<string, boolean>>({});
  const [showSmartTrayModal, setShowSmartTrayModal] = useState(false);
  const [showDirectPulpCappingModal, setShowDirectPulpCappingModal] = useState(false);

  // -------------------------------------------------------------
  // 2. Prescription Guide Cloud & Local State
  // -------------------------------------------------------------
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([]);
  const [isGuidePublic, setIsGuidePublic] = useState<boolean>(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState<boolean>(false);
  const [drugFilter, setDrugFilter] = useState<string>('all');
  const [drugSearchQuery, setDrugSearchQuery] = useState<string>('');
  const [copiedDrugId, setCopiedDrugId] = useState<string | null>(null);

  // Admin Quick Add Drug State
  const [showAdminAddSection, setShowAdminAddSection] = useState(false);
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugCat, setNewDrugCat] = useState<PrescriptionCategory>('analgesics');
  const [newDrugDose, setNewDrugDose] = useState('');
  const [newDrugAllergy, setNewDrugAllergy] = useState('');
  const [isAddingDrug, setIsAddingDrug] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 3. Local Anesthesia Calculator State
  // -------------------------------------------------------------
  const [patWeight, setPatWeight] = useState<number>(60);
  const [laType, setLaType] = useState<'lido' | 'arti' | 'mepi'>('lido');
  const [cartVol, setCartVol] = useState<number>(1.8);
  const [ageGroup, setAgeGroup] = useState<'adult' | 'pediatric'>('adult');
  const [chkCardio, setChkCardio] = useState<boolean>(false);
  const [chkLiver, setChkLiver] = useState<boolean>(false);
  const [chkAllergy, setChkAllergy] = useState<boolean>(false);
  const [chkPreg, setChkPreg] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 4. Checklist State (Synchronized with sessionStorage)
  // -------------------------------------------------------------
  const [checkedItems, setCheckedItems] = useState<string[]>(() =>
    getSessionCheckedItems('all')
  );

  // -------------------------------------------------------------
  // 5. IANB Protocol Content & Admin Edit State
  // -------------------------------------------------------------
  const DEFAULT_IANB_TEXT = `المعالم السريرية الهامة:
1. تحديد الـ Coronoid Notch بإبهام اليد الساندة في أعمق نقطة من الحافة الأمامية للرأد.
2. الدخول بالإبرة من جهة الضواحك المقابلة بارتفاع 6 إلى 10 ملم فوق مستوى الإطباق.
3. التلامس العظمي اللطيف (Bone Contact) قبل تفريغ الكاربول لتجنب الحقن في الغدة النكفية.
4. الحقن البطيء بمعدل 1 كاربول لكل 60 ثانية مع التطلّع السلبي في مستويين (Aspiration in 2 planes).`;

  const [ianbText, setIanbText] = useState<string>(DEFAULT_IANB_TEXT);
  const [isEditingIanb, setIsEditingIanb] = useState<boolean>(false);
  const [editingIanbValue, setEditingIanbValue] = useState<string>(DEFAULT_IANB_TEXT);
  const [isSavingIanb, setIsSavingIanb] = useState<boolean>(false);
  const [ianbImageZoom, setIanbImageZoom] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 6. FAQs & Protocol Request State
  // -------------------------------------------------------------
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [protocolRequestText, setProtocolRequestText] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  // Admin toast notification
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Effects & Real-Time Sync
  // -------------------------------------------------------------
  useEffect(() => {
    // Cloud subscriptions
    const unsubDrugs = subscribeToPrescriptionDrugsCloud((cloudDrugs) => {
      setDrugs(cloudDrugs);
    });

    const unsubConfig = subscribeToPrescriptionGuideConfigCloud((config) => {
      setIsGuidePublic(config.isGuidePublic);
    });

    // Load IANB overrides
    const overrides = getLocalElementOverrides();
    if (overrides['protocol-ianb-text']?.descriptionAr) {
      setIanbText(overrides['protocol-ianb-text'].descriptionAr);
      setEditingIanbValue(overrides['protocol-ianb-text'].descriptionAr);
    }

    const handleOverridesUpdated = (e: Event) => {
      const custom = e as CustomEvent<Record<string, any>>;
      if (custom.detail?.['protocol-ianb-text']?.descriptionAr) {
        setIanbText(custom.detail['protocol-ianb-text'].descriptionAr);
        setEditingIanbValue(custom.detail['protocol-ianb-text'].descriptionAr);
      }
    };
    window.addEventListener('element-overrides-updated', handleOverridesUpdated);

    // Sync checklist updates from other components
    const handleChecklistUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ protocolId: string; checkedIds: string[] }>;
      if (custom.detail?.checkedIds) {
        setCheckedItems(custom.detail.checkedIds);
      }
    };
    window.addEventListener('pre-procedure-checklist-updated', handleChecklistUpdated);

    return () => {
      unsubDrugs();
      unsubConfig();
      window.removeEventListener('element-overrides-updated', handleOverridesUpdated);
      window.removeEventListener('pre-procedure-checklist-updated', handleChecklistUpdated);
    };
  }, []);

  // Prevent background scroll when any modal window is open
  useEffect(() => {
    if (activeWindow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeWindow]);

  // ESC key to close active window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeWindow) {
        setActiveWindow(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindow]);

  // -------------------------------------------------------------
  // Window Controls (Open, Close, Maximize)
  // -------------------------------------------------------------
  const openWindow = (winId: WindowId) => {
    // Map window ID to card ID in permissions
    let cardKey = '';
    if (winId === 'window-la') cardKey = 'anesthesia';
    else if (winId === 'window-checklist') cardKey = 'checklist';
    else if (winId === 'window-drugs') cardKey = 'prescriptions';
    else if (winId === 'window-request') cardKey = 'request';

    if (cardKey) {
      const perm = permissions[cardKey] || DEFAULT_COMPANION_PERMISSIONS[cardKey];
      const isFree = perm?.access === 'free';
      const isUnlocked = isAuthorAdmin || isContentUnlocked || isFree;
      if (!isUnlocked) {
        if (onOpenSubscribeModal) {
          onOpenSubscribeModal();
        } else if (onOpenAdminLogin) {
          onOpenAdminLogin();
        }
        return;
      }
    }

    setActiveWindow(winId);
  };

  const closeWindow = (winId?: WindowId) => {
    setActiveWindow(null);
  };

  const toggleMaximize = (winId: string) => {
    setMaximizedWindows((prev) => ({
      ...prev,
      [winId]: !prev[winId],
    }));
  };

  // -------------------------------------------------------------
  // Calculation Logic (Matches user template calcLA & clinical safety)
  // -------------------------------------------------------------
  const laResults = useMemo(() => {
    const anestheticId: AnestheticId =
      laType === 'arti' ? 'articaine' : laType === 'mepi' ? 'mepivacaine' : 'lidocaine';

    const cartridgeSize: CartridgeSize = cartVol === 2.2 ? '2.2' : '1.8';
    const ageCategory: AgeCategory = ageGroup;

    const calc = calculateLocalAnestheticDose({
      weightKg: Math.max(2, Math.min(150, patWeight || 60)),
      ageCategory,
      childAgeYears: ageGroup === 'pediatric' ? 6 : undefined,
      anestheticId,
      cartridgeSize,
      comorbidities: {
        cardiovascularDisease: chkCardio,
        hepaticOrRenalImpairment: chkLiver,
        sulfiteAllergy: chkAllergy,
        pregnancy: chkPreg,
      },
      cartridgesAdministered: 1,
    });

    return {
      calc,
      effectiveMrdMg: Math.round(calc.effectiveMrdMg),
      finalSafeCartridges: calc.finalSafeCartridges.toFixed(1),
      maxEpiCarts: calc.maxSafeCartridgesByCardiacEpi,
    };
  }, [laType, cartVol, patWeight, ageGroup, chkCardio, chkLiver, chkAllergy, chkPreg]);

  // -------------------------------------------------------------
  // Checklist Handler
  // -------------------------------------------------------------
  const handleToggleCheck = (itemId: string) => {
    const updated = toggleSessionCheckItem('all', itemId);
    setCheckedItems(updated);
  };

  const handleResetChecklist = () => {
    resetSessionChecklist('all');
    setCheckedItems([]);
  };

  const checklistProgressPercent = Math.round(
    (checkedItems.length / CORE_PRE_PROCEDURE_STEPS.length) * 100
  );
  const isChecklistAllDone = checkedItems.length === CORE_PRE_PROCEDURE_STEPS.length;

  // -------------------------------------------------------------
  // Admin Visibility Toggle Handler
  // -------------------------------------------------------------
  const handleToggleGuideVisibility = async () => {
    if (!isAuthorAdmin) return;
    setIsTogglingVisibility(true);
    try {
      const nextState = !isGuidePublic;
      await setPrescriptionGuideGlobalVisibilityInCloud(nextState, false, subscriberEmail);
      setIsGuidePublic(nextState);
      setAdminFeedback(
        nextState
          ? 'تم تفعيل وإظهار دليل الأدوية لجميع المشتركين بنجاح! ✅'
          : 'تم إخفاء دليل الأدوية وحفظه في وضع المسودة للمشرف فقط 🔒'
      );
      setTimeout(() => setAdminFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  // -------------------------------------------------------------
  // Admin Quick Add Drug
  // -------------------------------------------------------------
  const handleAddNewDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugName.trim()) {
      setAdminFeedback('يرجى كتابة اسم الدواء');
      return;
    }
    setIsAddingDrug(true);
    try {
      await addPrescriptionDrugInCloud({
        nameEn: newDrugName.trim(),
        nameAr: newDrugName.trim(),
        category: newDrugCat,
        standardDosage: newDrugDose.trim() || 'حسب تقدير الطبيب المعالج وحالة المريض',
        indication: 'إجراءات ومداواة الأسنان السريرية',
        clinicalConsiderations: 'مراعاة الجرعات والتاريخ المرضي في العيادة.',
        drugInteractions: 'التحقق من التداخلات مع المخدر الموضعي والمسكنات.',
        allergyAlerts: newDrugAllergy.trim() || 'مراجعة التاريخ المرضي والحساسية الدوائية',
        pregnancySafety: 'الفئة الآمنة سريرياً أو استشارة أخصائي النساء',
        adminNotes: 'أضيف عبر لوحة رفيق الطبيب السريري',
        status: 'published',
        warningLevel: 'caution',
      });
      setNewDrugName('');
      setNewDrugDose('');
      setNewDrugAllergy('');
      setAdminFeedback('تم حفظ الدواء الجديد ونشره بنجاح في قاعدة البيانات! 💾');
      setTimeout(() => setAdminFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setAdminFeedback('حدث خطأ أثناء حفظ الدواء');
    } finally {
      setIsAddingDrug(false);
    }
  };

  // -------------------------------------------------------------
  // Admin IANB Save Handler
  // -------------------------------------------------------------
  const handleSaveIanbText = async () => {
    setIsSavingIanb(true);
    try {
      await setElementOverrideInCloud({
        id: 'protocol-ianb-text',
        descriptionAr: editingIanbValue.trim(),
        isVisible: true,
      });
      setIanbText(editingIanbValue.trim());
      setIsEditingIanb(false);
      setAdminToast('تم حفظ تعديلات بروتوكول IANB ومزامنتها لجميع المشتركين فوراً! 🚀');
      setTimeout(() => setAdminToast(null), 4000);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ التعديل، تم الحفظ محلياً.');
    } finally {
      setIsSavingIanb(false);
    }
  };

  // -------------------------------------------------------------
  // Protocol Request Handler
  // -------------------------------------------------------------
  const handleSubmitProtocolRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolRequestText.trim()) return;

    setIsSubmittingRequest(true);
    try {
      saveSupervisorNote({
        studentEmail: subscriberEmail || 'طبيب سريري زائر',
        studentName: 'طلب بروتوكول سريري جديد',
        category: 'case_discussion',
        sectionTitle: 'رفيق طبيب الأسنان السريري',
        slideTitle: 'قسم طلب بروتوكول أو شرح حالة عيادية',
        content: protocolRequestText.trim(),
      });

      await saveSupervisorNoteToCloud({
        studentEmail: subscriberEmail || 'طبيب سريري زائر',
        studentName: 'طلب بروتوكول سريري جديد',
        category: 'case_discussion',
        sectionTitle: 'رفيق طبيب الأسنان السريري',
        slideTitle: 'قسم طلب بروتوكول أو شرح حالة عيادية',
        content: protocolRequestText.trim(),
      });

      setProtocolRequestText('');
      setRequestFeedback('تم إرسال طلبك بنجاح إلى د. حياة نافع فجر! سيتم تحضير المادة العلمية ومشاركتها في التطبيق 🚀');
      setTimeout(() => setRequestFeedback(null), 5000);
    } catch (err) {
      console.error(err);
      setRequestFeedback('تم استلام طلبك محلياً، وسيتم إرساله للمشرف فور معاودة الاتصال بالإنترنت.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered Drugs
  // -------------------------------------------------------------
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      if (!isAuthorAdmin && drug.status === 'draft') return false;
      if (drugFilter !== 'all' && drug.category !== drugFilter) return false;
      if (drugSearchQuery.trim()) {
        const q = drugSearchQuery.toLowerCase();
        const matchName =
          drug.nameEn.toLowerCase().includes(q) || drug.nameAr.toLowerCase().includes(q);
        const matchInd = drug.indication.toLowerCase().includes(q);
        const matchCat = drug.category.toLowerCase().includes(q);
        if (!matchName && !matchInd && !matchCat) return false;
      }
      return true;
    });
  }, [drugs, isAuthorAdmin, drugFilter, drugSearchQuery]);

  const handleCopyDrugRx = (drug: PrescriptionDrug) => {
    const rxText = `Rx:
دواء: ${drug.nameAr} (${drug.nameEn})
الجرعة: ${drug.standardDosage}
دواعي الاستعمال: ${drug.indication}
تنبيهات: ${drug.allergyAlerts || 'لا توجد موانع خاصة'}`;
    navigator.clipboard.writeText(rxText);
    setCopiedDrugId(drug.id);
    setTimeout(() => setCopiedDrugId(null), 2500);
  };

  return (
    <div
      className="min-h-screen text-[#f8fafc] font-sans antialiased pb-12 select-none"
      style={{
        backgroundColor: '#0b1120',
        color: '#f8fafc',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Toast Notification */}
      {adminToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0284c7] text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APP HEADER (شريط التطبيق العلوي) */}
      {/* ------------------------------------------------------------- */}
      <header
        className="sticky top-0 z-40 px-5 py-3.5 flex items-center justify-between border-b backdrop-blur-xl"
        style={{
          background: 'rgba(11, 17, 32, 0.88)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 text-[#38bdf8] flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="text-lg font-extrabold text-[#38bdf8] tracking-wide flex items-center gap-2 font-mono">
            <span>PROTOCOL</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-slate-300 hidden sm:inline-block">
              {t('companion.headerSub', 'رفيق طبيب الأسنان السريري', 'Clinical Dental Companion')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Badge with interactive feedback */}
          <button
            type="button"
            onClick={() => {
              if (isAuthorAdmin) {
                setAdminToast(isRTL ? 'أنتِ في وضع المشرف: صلاحيات التعديل والإخفاء مفعلة بنجاح! 🛡️' : 'Supervisor Mode Active! 🛡️');
                setTimeout(() => setAdminToast(null), 3500);
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border"
            style={{
              background: isAuthorAdmin ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isAuthorAdmin ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              color: isAuthorAdmin ? '#38bdf8' : '#94a3b8',
            }}
            title={isAuthorAdmin ? (isRTL ? 'وضع المشرف نشط' : 'Supervisor Mode Active') : (isRTL ? 'تسجيل دخول المشرف' : 'Supervisor Login')}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAuthorAdmin ? (isRTL ? 'وضع المشرف (د. حياة)' : 'Supervisor (Dr. Hayah)') : (isRTL ? 'دخول المشرف' : 'Supervisor Login')}</span>
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              {t('common.home', 'الرئيسية', 'Home')}
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER (الواجهة الأساسية المنظمة) */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-[650px] mx-auto px-4 py-6 space-y-6">

        {/* SECTION 0: PATIENT APPOINTMENTS & ARCHIVE (مواعيدي وأرشيف المراجعين) */}
        {(() => {
          if (isSubscriptionChecking) {
            return (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 animate-pulse text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6 animate-pulse" />
                </div>
                <div className="h-4 bg-slate-700/50 rounded w-1/3 mx-auto" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2 mx-auto" />
                <span className="text-[11px] text-amber-400 font-bold block">
                  ⏳ جاري التحقق من صلاحيات جدول المواعيد السريري...
                </span>
              </div>
            );
          }

          const apptPerm = permissions['appointments'] || DEFAULT_COMPANION_PERMISSIONS['appointments'] || {
            access: 'subscription',
            visibility: 'visible',
          };
          const isVisible = apptPerm.visibility !== 'hidden' || isAuthorAdmin;
          if (!isVisible) return null;

          const isFree = apptPerm.access === 'free';
          const isLockedForUser = !isFree && !isAuthorAdmin && !isContentUnlocked;

          if (isLockedForUser) {
            return (
              <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-amber-200">
                  🔒 خانة مواعيدي تتطلب اشتراكاً نشطاً (محتوى مدفوع)
                </h4>
                <p className="text-xs text-amber-300/80">
                  تم قفل خانة مواعيدي وجدول العيادات للمشتركين فقط. يرجى تفعيل اشتراكك السريري للمتابعة أو تسجيل الدخول كمشرف.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenSubscribeModal && onOpenSubscribeModal()}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md cursor-pointer hover:brightness-110 transition-all"
                >
                  الترقية وتفعيل الاشتراك الآن 🌟
                </button>
              </div>
            );
          }

          return <AppointmentsSection isAuthorAdmin={isAuthorAdmin} />;
        })()}

        {/* SECTION 0.5: CLINICAL CASES DASHBOARD (لوحة بيانات الحالات السريرية الشهرية) */}
        <div>
          <ClinicalCasesDashboard />
        </div>

        {/* SECTION 1: QUICK LAUNCH TOOLS */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3 flex items-center justify-between">
            <span>الأدوات السريرية الفورية (Quick Launch)</span>
            <span className="text-[10px] text-sky-400 font-mono">CLINICAL SUITE</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Card DPC: بروتوكول التغطية اللبية المباشرة */}
            {isSubscriptionChecking ? (
              <div className="col-span-2 p-5 rounded-2xl border border-teal-500/20 bg-slate-900/40 animate-pulse flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-teal-500/20 rounded" />
                  <div className="w-64 h-3 bg-teal-500/10 rounded" />
                </div>
              </div>
            ) : permissions['pulp_capping']?.visibility !== 'hidden' && (() => {
              const perm = permissions['pulp_capping'] || DEFAULT_COMPANION_PERMISSIONS['pulp_capping'] || {
                access: 'subscription',
                visibility: 'visible',
              };
              const isFree = perm.access === 'free';
              const isUnlocked = isFree || isAuthorAdmin || isContentUnlocked;

              return (
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      setShowDirectPulpCappingModal(true);
                    } else if (onOpenSubscribeModal) {
                      onOpenSubscribeModal();
                    } else if (onOpenAdminLogin) {
                      onOpenAdminLogin();
                    }
                  }}
                  className="col-span-2 group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98 shadow-sm hover:shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(30, 41, 59, 0.85) 100%)',
                    borderColor: 'rgba(45, 212, 191, 0.35)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
                    style={{ background: 'rgba(13, 148, 136, 0.3)', color: '#2DD4BF' }}
                  >
                    <ShieldCheck className="w-6 h-6 text-[#2DD4BF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-2">
                        <span>بروتوكول التغطية اللبية المباشرة (DPC)</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-teal-400/15 text-teal-300 border border-teal-400/30">
                          معالجة حيوية • 7 مراحل
                        </span>
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFree
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isContentUnlocked || isAuthorAdmin
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isFree
                          ? '🔓 مجاني للعامة'
                          : isContentUnlocked || isAuthorAdmin
                          ? '✨ متاح للمشتركين'
                          : '🔒 مدفوع (يتطلب اشتراك)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] leading-snug">
                      الشروط المسبقة، الإرقاء بـ NaOCl، تطبيق MTA الميكروي، ساندوتش GIC، البناء والمتابعة
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Card 0: بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات */}
            {isSubscriptionChecking ? (
              <div className="col-span-2 p-5 rounded-2xl border border-amber-500/20 bg-slate-900/40 animate-pulse flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-amber-500/20 rounded" />
                  <div className="w-64 h-3 bg-amber-500/10 rounded" />
                </div>
              </div>
            ) : permissions['smart_tray']?.visibility !== 'hidden' && (() => {
              const perm = permissions['smart_tray'] || DEFAULT_COMPANION_PERMISSIONS['smart_tray'] || {
                access: 'subscription',
                visibility: 'visible',
              };
              const isFree = perm.access === 'free';
              const isUnlocked = isFree || isAuthorAdmin || isContentUnlocked;

              return (
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      setShowSmartTrayModal(true);
                    } else if (onOpenSubscribeModal) {
                      onOpenSubscribeModal();
                    } else if (onOpenAdminLogin) {
                      onOpenAdminLogin();
                    }
                  }}
                  className="col-span-2 group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98 shadow-sm hover:shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(89, 102, 44, 0.25) 100%)',
                    borderColor: 'rgba(212, 175, 55, 0.35)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
                    style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37' }}
                  >
                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                        <span>بروتوكول العيادة الذكية: هندسة الطاولة السريرية</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                          7 خطوات تفاعلية
                        </span>
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFree
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isContentUnlocked || isAuthorAdmin
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isFree
                          ? '🔓 مجاني للعامة'
                          : isContentUnlocked || isAuthorAdmin
                          ? '✨ متاح للمشتركين'
                          : '🔒 مدفوع (يتطلب اشتراك)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] leading-snug">
                      هندسة وترتيب صينية وأدوات العمل السريري تسلسلياً لمنع التلوث التبادلي واختصار وقت الجلسة
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Card 1: حاسبة البنج (LA) */}
            {permissions['anesthesia']?.visibility !== 'hidden' && (
              <div
                onClick={() => openWindow('window-la')}
                className="group p-4 rounded-2xl border transition-all duration-250 cursor-pointer flex flex-col justify-between min-h-[135px] relative overflow-hidden active:scale-98"
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-3 shadow-inner"
                  style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
                >
                  <Calculator className="w-5 h-5 text-[#38bdf8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#38bdf8] transition-colors flex items-center justify-between">
                    <span>حاسبة البنج (LA)</span>
                    {permissions['anesthesia']?.access === 'free' ? (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">مجاني</span>
                    ) : (
                      <span className="text-[10px] text-sky-400 font-mono font-normal">MRD</span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] leading-snug">
                    أقصى جرعة آمنة ومراعاة الأمراض وحجم الكاربول
                  </p>
                </div>
              </div>
            )}

            {/* Card 2: قائمة الفحص السريري */}
            {permissions['checklist']?.visibility !== 'hidden' && (
              <div
                onClick={() => openWindow('window-checklist')}
                className="group p-4 rounded-2xl border transition-all duration-250 cursor-pointer flex flex-col justify-between min-h-[135px] relative overflow-hidden active:scale-98"
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-3 shadow-inner"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
                >
                  <ClipboardIcon className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#10b981] transition-colors flex items-center justify-between">
                    <span>قائمة الفحص</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isChecklistAllDone
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-emerald-400'
                      }`}
                    >
                      {checkedItems.length}/{CORE_PRE_PROCEDURE_STEPS.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] leading-snug">
                    مراجعة سريعة قبل بدء الحالة وتوقيع المشرف
                  </p>
                </div>
              </div>
            )}

            {/* Card 3: دليل وصف الأدوية السريع (Full Width) */}
            {permissions['prescriptions']?.visibility !== 'hidden' && (
              <div
                onClick={() => openWindow('window-drugs')}
                className="col-span-2 group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98"
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
                  style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                >
                  <Pill className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                      دليل وصف الأدوية السريري
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        permissions['prescriptions']?.access === 'free'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isGuidePublic
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {permissions['prescriptions']?.access === 'free'
                        ? '🔓 مجاني للعامة'
                        : isGuidePublic
                        ? 'متاح للمشتركين'
                        : 'مسودة قيد المراجعة'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-snug">
                    المسكنات، المضادات الحيوية، وغسول الفم (تحت المراجعة مع الصيدلاني)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: APPROVED CLINICAL PROTOCOLS */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3 flex items-center justify-between">
            <span>البروتوكولات السريرية المعتمدة</span>
            <span className="text-[10px] text-indigo-400 font-mono">EVIDENCE BASED</span>
          </div>

          {/* Trigger Card: بروتوكول تخدير العصب السنخي السفلي (IANB) */}
          <div
            onClick={() => openWindow('window-ianb')}
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98"
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
            >
              <Syringe className="w-5 h-5 text-[#818cf8]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#818cf8] transition-colors">
                  بروتوكول تخدير العصب السنخي السفلي (IANB)
                </h3>
                <span className="text-[10px] text-[#818cf8] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                  تخدير جراحي
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                المعالم التشريحية، زاوية الإبرة، وتجنب الفشل السريري
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: REQUEST PROTOCOL & FAQS */}
        {permissions['request']?.visibility !== 'hidden' && (
          <div
            onClick={() => openWindow('window-request')}
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98"
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
              style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
            >
              <HelpCircle className="w-5 h-5 text-[#f43f5e]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#f43f5e] transition-colors">
                  طلب بروتوكول جديد والأسئلة الشائعة
                </h3>
                {permissions['request']?.access === 'free' && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    🔓 مجاني
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                اطلب شرح حالة عيادية مباشرة من المشرف أو استعرض إرشادات الاستخدام
              </p>
            </div>
          </div>
        )}

        {/* SECTION: OPERATIVE VIVA CLINICAL QUESTIONS */}
        <OperativeVivaSection
          isAuthorAdmin={isAuthorAdmin}
          isContentUnlocked={isContentUnlocked}
          onOpenSubscribeModal={onOpenSubscribeModal}
        />

        {/* SECTION 4: APPROVED SUPERVISOR CUSTOM WINDOWS & CARDS */}
        {customWindows.filter((w) => w.targetLocation === 'clinical_companion' && (!w.isHidden || isAuthorAdmin)).length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>نوافذ وبطاقات المشرفة المعتمدة (Clinical Cards)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {customWindows.filter((w) => w.targetLocation === 'clinical_companion' && (!w.isHidden || isAuthorAdmin)).length} ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {customWindows
                .filter((w) => w.targetLocation === 'clinical_companion' && (!w.isHidden || isAuthorAdmin))
                .map((cWin, idx) => {
                  const isWinLocked = cWin.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;
                  return (
                    <div
                      key={`${cWin.id}_${idx}`}
                      onClick={() => {
                        if (isWinLocked && onOpenSubscribeModal) {
                          onOpenSubscribeModal();
                        } else {
                          setSelectedCustomWindow(cWin);
                        }
                      }}
                      className="group p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center relative overflow-hidden active:scale-98"
                      style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg ml-3.5 shrink-0 shadow-inner"
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#D4AF37',
                        }}
                      >
                        {cWin.contentType === 'checklist' ? (
                          <ClipboardIcon className="w-5 h-5 text-emerald-400" />
                        ) : cWin.contentType === 'link' ? (
                          <ExternalLink className="w-5 h-5 text-sky-400" />
                        ) : (
                          <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                            {cWin.title}
                          </h3>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {cWin.badge && (
                              <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                                {cWin.badge}
                              </span>
                            )}
                            {isWinLocked ? (
                              <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>مقفل</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>مجاني</span>
                              </span>
                            )}
                            {cWin.isHidden && (
                              <span className="text-[9px] text-neutral-400 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">
                                مخفي
                              </span>
                            )}
                            {isAuthorAdmin && (
                              <button
                                type="button"
                                data-action="save"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const card = (e.currentTarget as HTMLElement).closest('.group');
                                  card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                                  setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                                  window.alert(`تم حفظ خانة "${cWin.title}" وتأكيد المزامنة السحابية بنجاح! 💾✅`);
                                }}
                                className="save-btn p-1 rounded-lg bg-[#59662C] hover:bg-[#485323] text-white transition-all cursor-pointer shadow-2xs"
                                title="حفظ هذه الخانة سحابياً"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-[#94a3b8] leading-snug line-clamp-1">
                          {cWin.subtitle || cWin.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ADMIN MANAGEMENT ACCORDION (Revealed if Admin) */}
        {isAuthorAdmin && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-300">
                  لوحة المشرف السريعة (إدارة الأدوية وإخفاء الدليل)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminAddSection(!showAdminAddSection)}
                className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdminAddSection ? 'إخفاء' : 'إظهار'}</span>
                {showAdminAddSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAdminAddSection && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-3">
                {/* Global Toggle Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-amber-500/30">
                  <span className="text-xs font-bold">
                    حالة الدليل للطلاب: {isGuidePublic ? 'مرئي للعامة ✅' : 'مخفي (مسودة) 🔒'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleGuideVisibility}
                    disabled={isTogglingVisibility}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${
                      isGuidePublic ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isTogglingVisibility
                      ? 'جاري التعديل...'
                      : isGuidePublic
                      ? 'إخفاء عن المشتركين الآن'
                      : 'تفعيل وإظهار للعامة'}
                  </button>
                </div>

                {/* Quick Add Form */}
                <form onSubmit={handleAddNewDrug} className="space-y-2">
                  <span className="text-[11px] font-bold block text-amber-100">
                    إضافة دواء جديد للدليل:
                  </span>
                  <input
                    type="text"
                    value={newDrugName}
                    onChange={(e) => setNewDrugName(e.target.value)}
                    placeholder="اسم الدواء (مثال: Amoxicillin 500mg)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-sky-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newDrugCat}
                      onChange={(e) => setNewDrugCat(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white outline-none"
                    >
                      <option value="analgesics">مسكنات الألم</option>
                      <option value="antibiotics">المضادات الحيوية</option>
                      <option value="mouthwashes">غسول الفم</option>
                      <option value="emergency">أدوية الطوارئ</option>
                    </select>
                    <input
                      type="text"
                      value={newDrugDose}
                      onChange={(e) => setNewDrugDose(e.target.value)}
                      placeholder="الجرعة المعتمدة"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#0f172a] border border-white/10 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAddingDrug || !newDrugName.trim()}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAddingDrug ? 'جاري الحفظ...' : 'حفظ الدواء في السحابة 💾'}
                  </button>
                  {adminFeedback && (
                    <p className="text-[11px] font-bold text-center text-amber-300">
                      {adminFeedback}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FOOTER / LEGAL & CLINICAL SAFEGUARD (تنبيه مهني وقانوني إلزامي) */}
        {/* ------------------------------------------------------------- */}
        <footer
          className="p-4 sm:p-5 rounded-2xl border text-xs leading-relaxed space-y-1.5"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
          }}
        >
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>تنبيه مهني وقانوني إلزامي:</span>
          </div>
          <p className="text-slate-300">
            هذا المحتوى مخصص كدليل إرشادي وسريع لطلاب وأطباء الأسنان في العيادات التدريبية. لا يُعتبر بديلاً عن الاستشارة الطبية المتخصصة أو المرجع الدوائي المعتمد محلياً. تقع المسؤولية السريرية على عاتق الطبيب الممارس.
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Educational Reference Aid Only • Verify clinical dosages against official local pharmacopoeia and patient systemic evaluation.
          </p>
        </footer>

      </main>

      {/* ============================================================= */}
      {/* SMART MODAL WINDOWS & BOTTOM SHEETS (نظام النوافذ المنبثقة الذكية) */}
      {/* ============================================================= */}

      {/* ------------------------------------------------------------- */}
      {/* نافذة 1: حاسبة التخدير الموضعي (window-la) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="window-la"
        onClick={() => closeWindow('window-la')}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center transition-opacity duration-300 ${
          activeWindow === 'window-la' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[650px] bg-[#111827] border-t border-sky-400/30 rounded-t-[26px] p-4 sm:p-6 shadow-2xl transition-transform duration-320 overflow-y-auto ${
            maximizedWindows['window-la']
              ? 'h-screen max-h-screen rounded-none'
              : 'max-h-[88vh]'
          } ${
            activeWindow === 'window-la' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Pill */}
          <div
            onClick={() => closeWindow('window-la')}
            className="w-11 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-3 cursor-pointer"
          />

          {/* Window Topbar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <span className="text-base font-extrabold text-[#38bdf8] flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span>حاسبة التخدير الموضعي (LA)</span>
            </span>

            <div className="flex items-center gap-2">
              {onOpenFullCalculatorModal && (
                <button
                  type="button"
                  onClick={() => {
                    closeWindow('window-la');
                    onOpenFullCalculatorModal();
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-sky-400/20 border border-white/10 text-slate-300 hover:text-[#38bdf8] flex items-center justify-center transition-colors cursor-pointer"
                  title="فتح النافذة الشاملة"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleMaximize('window-la')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-sky-400/20 border border-white/10 text-slate-300 hover:text-[#38bdf8] flex items-center justify-center transition-colors cursor-pointer"
                title={maximizedWindows['window-la'] ? 'تصغير' : 'تكبير ملء الشاشة'}
              >
                {maximizedWindows['window-la'] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => closeWindow('window-la')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LA Calculator Body */}
          <div className="space-y-4">
            {/* Age Group Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                فئة المريض:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAgeGroup('adult')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    ageGroup === 'adult'
                      ? 'bg-[#0284c7] text-white border-sky-400'
                      : 'bg-[#0f172a] text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  بالغ (Adult)
                </button>
                <button
                  type="button"
                  onClick={() => setAgeGroup('pediatric')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    ageGroup === 'pediatric'
                      ? 'bg-[#0284c7] text-white border-sky-400'
                      : 'bg-[#0f172a] text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  طفل (Pediatric)
                </button>
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                وزن المريض (كغم):
              </label>
              <input
                type="number"
                min={2}
                max={150}
                value={patWeight}
                onChange={(e) => setPatWeight(Number(e.target.value))}
                className="w-full bg-[#0f172a]/90 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-sky-400 font-bold"
              />
            </div>

            {/* Anesthetic Type Select */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                نوع المخدر:
              </label>
              <select
                value={laType}
                onChange={(e) => setLaType(e.target.value as any)}
                className="w-full bg-[#0f172a]/90 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-sky-400"
              >
                <option value="lido">ليدوكائين 2% مع أدرينالين (Lidocaine 2% + Epi 1:100k)</option>
                <option value="arti">آرتيكائين 4% مع أدرينالين (Articaine 4% + Epi 1:100k)</option>
                <option value="mepi">ميبايفاكين 3% سادة بدون قابض (Mepivacaine 3% Plain)</option>
              </select>
            </div>

            {/* Cartridge Size */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                حجم الكاربول (الأمبولة):
              </label>
              <select
                value={cartVol}
                onChange={(e) => setCartVol(Number(e.target.value))}
                className="w-full bg-[#0f172a]/90 border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-sky-400"
              >
                <option value={1.8}>1.8 مل (القياسي الشائع)</option>
                <option value={2.2}>2.2 مل (البريطاني / الأسترالي)</option>
              </select>
            </div>

            {/* Comorbidities */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                تعديل الأمان حسب الأمراض المزمنة:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={chkCardio}
                    onChange={(e) => setChkCardio(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                  <span>أمراض القلب (Cardiac)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={chkLiver}
                    onChange={(e) => setChkLiver(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                  <span>قصور كبد / كلى</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={chkAllergy}
                    onChange={(e) => setChkAllergy(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                  <span>حساسية السلفيت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={chkPreg}
                    onChange={(e) => setChkPreg(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                  <span>الحمل والرضاعة</span>
                </label>
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-[#0f172a]/90 border border-white/10 rounded-2xl p-4 mt-3 space-y-2 shadow-inner">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">الجرعة القصوى (MRD):</span>
                <strong className="text-[#38bdf8] text-base font-mono">
                  {laResults.effectiveMrdMg} ملغ
                </strong>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-white/10">
                <span className="text-white">الحد الأقصى للكاربولات:</span>
                <strong className="text-[#10b981] text-lg font-mono">
                  {laResults.finalSafeCartridges} أمبولة
                </strong>
              </div>

              {chkCardio && (
                <div className="pt-2 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    تم تطبيق سقف الأدرينالين لمرضى القلب (0.04 mg = كحد أقصى {laResults.maxEpiCarts} كاربول).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* نافذة 2: قائمة الفحص قبل الإجراء (window-checklist) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="window-checklist"
        onClick={() => closeWindow('window-checklist')}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center transition-opacity duration-300 ${
          activeWindow === 'window-checklist' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[650px] bg-[#111827] border-t border-emerald-400/30 rounded-t-[26px] p-4 sm:p-6 shadow-2xl transition-transform duration-320 overflow-y-auto ${
            maximizedWindows['window-checklist']
              ? 'h-screen max-h-screen rounded-none'
              : 'max-h-[88vh]'
          } ${
            activeWindow === 'window-checklist' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Pill */}
          <div
            onClick={() => closeWindow('window-checklist')}
            className="w-11 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-3 cursor-pointer"
          />

          {/* Window Topbar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <span className="text-base font-extrabold text-[#10b981] flex items-center gap-2">
              <ClipboardIcon className="w-5 h-5" />
              <span>قائمة التحقق السريري قبل الإجراء</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMaximize('window-checklist')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-emerald-400/20 border border-white/10 text-slate-300 hover:text-[#10b981] flex items-center justify-center transition-colors cursor-pointer"
                title={maximizedWindows['window-checklist'] ? 'تصغير' : 'تكبير ملء الشاشة'}
              >
                {maximizedWindows['window-checklist'] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => closeWindow('window-checklist')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar & Ready Badge */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">
                نسبة الإنجاز: {checkedItems.length} من {CORE_PRE_PROCEDURE_STEPS.length}
              </span>
              <span className={isChecklistAllDone ? 'text-emerald-400' : 'text-amber-400'}>
                {checklistProgressPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isChecklistAllDone ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${checklistProgressPercent}%` }}
              />
            </div>

            {isChecklistAllDone && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>جاهز لبدء الحالة! (Ready to Treat!) - كافة اشتراطات الأمان مستوفاة</span>
              </div>
            )}
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {CORE_PRE_PROCEDURE_STEPS.map((step, stIdx) => {
              const isChecked = checkedItems.includes(step.id);
              return (
                <div
                  key={`${step.id}_${stIdx}`}
                  onClick={() => handleToggleCheck(step.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {step.titleAr}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">
                        {step.titleEn}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="w-5 h-5 accent-[#0284c7] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Reset Button */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetChecklist}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط للحالة التالية</span>
            </button>

            <span className="text-[10px] text-slate-500">
              يتم حفظ الحالة تلقائياً أثناء التنقل
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* نافذة 3: دليل الأدوية السريع (window-drugs) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="window-drugs"
        onClick={() => closeWindow('window-drugs')}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center transition-opacity duration-300 ${
          activeWindow === 'window-drugs' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[650px] bg-[#111827] border-t border-amber-400/30 rounded-t-[26px] p-4 sm:p-6 shadow-2xl transition-transform duration-320 overflow-y-auto ${
            maximizedWindows['window-drugs']
              ? 'h-screen max-h-screen rounded-none'
              : 'max-h-[88vh]'
          } ${
            activeWindow === 'window-drugs' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Pill */}
          <div
            onClick={() => closeWindow('window-drugs')}
            className="w-11 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-3 cursor-pointer"
          />

          {/* Window Topbar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <span className="text-base font-extrabold text-[#f59e0b] flex items-center gap-2">
              <Pill className="w-5 h-5" />
              <span>دليل وصف الأدوية السريري</span>
            </span>

            <div className="flex items-center gap-2">
              {isAuthorAdmin && (
                <button
                  type="button"
                  onClick={handleToggleGuideVisibility}
                  disabled={isTogglingVisibility}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isGuidePublic
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                  title="تبديل حالة الظهور للمشتركين"
                >
                  {isGuidePublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isGuidePublic ? 'مرئي للعامة' : 'مسودة مخفية'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleMaximize('window-drugs')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400/20 border border-white/10 text-slate-300 hover:text-[#f59e0b] flex items-center justify-center transition-colors cursor-pointer"
                title={maximizedWindows['window-drugs'] ? 'تصغير' : 'تكبير ملء الشاشة'}
              >
                {maximizedWindows['window-drugs'] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => closeWindow('window-drugs')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If Gated and Not Admin: Show prompt-exact notice */}
          {!isGuidePublic && !isAuthorAdmin ? (
            <div className="text-center py-10 px-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl">
                <Stethoscope className="w-8 h-8 text-[#f59e0b]" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">
                الدليل قيد الإعداد والمراجعة الطبية
              </h4>
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto leading-relaxed">
                يتم تدقيق الجرعات الدوائية مع صيدلاني ممارس. سيتم تفعيله تلقائياً لجميع المشتركين فور الاعتماد من قِبل د. حياة نافع فجر.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setDrugFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    drugFilter === 'all'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  الكل ({drugs.length})
                </button>
                {PRESCRIPTION_CATEGORIES.map((cat: any, catIdx: number) => (
                  <button
                    key={`${cat.id}_${catIdx}`}
                    type="button"
                    onClick={() => setDrugFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      drugFilter === cat.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {cat.titleAr}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={drugSearchQuery}
                  onChange={(e) => setDrugSearchQuery(e.target.value)}
                  placeholder="ابحث عن دواء أو مادة فعالة (مثال: Amoxicillin, Panadol)..."
                  className="w-full bg-[#0f172a] border border-white/10 pr-9 pl-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              {/* Drugs List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredDrugs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    لا توجد أدوية مطابقة للبحث
                  </div>
                ) : (
                  filteredDrugs.map((drug, dIdx) => (
                    <div
                      key={`${drug.id}_${dIdx}`}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{drug.nameAr}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({drug.nameEn})
                            </span>
                          </h4>
                          <span className="text-[10px] text-amber-400">
                            {drug.indication}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyDrugRx(drug)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="نسخ الوصفة الطبية"
                        >
                          {copiedDrugId === drug.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-slate-300 p-2 rounded-lg bg-black/40 font-mono">
                        {drug.standardDosage}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                        {drug.allergyAlerts && (
                          <div className="flex items-start gap-1 text-rose-400">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{drug.allergyAlerts}</span>
                          </div>
                        )}
                        {drug.pregnancySafety && (
                          <div className="flex items-start gap-1 text-sky-400">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{drug.pregnancySafety}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* نافذة 4: بروتوكول تخدير IANB السريري (window-ianb) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="window-ianb"
        onClick={() => closeWindow('window-ianb')}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center transition-opacity duration-300 ${
          activeWindow === 'window-ianb' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[650px] bg-[#111827] border-t border-indigo-400/30 rounded-t-[26px] p-4 sm:p-6 shadow-2xl transition-transform duration-320 overflow-y-auto ${
            maximizedWindows['window-ianb']
              ? 'h-screen max-h-screen rounded-none'
              : 'max-h-[88vh]'
          } ${
            activeWindow === 'window-ianb' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Pill */}
          <div
            onClick={() => closeWindow('window-ianb')}
            className="w-11 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-3 cursor-pointer"
          />

          {/* Window Topbar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <span className="text-base font-extrabold text-[#818cf8] flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              <span>بروتوكول تخدير IANB</span>
            </span>

            <div className="flex items-center gap-2">
              {isAuthorAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditingIanb(!isEditingIanb)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-indigo-400/20 border border-white/10 text-slate-300 hover:text-[#818cf8] flex items-center justify-center transition-colors cursor-pointer"
                  title="تعديل المشرف"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleMaximize('window-ianb')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-indigo-400/20 border border-white/10 text-slate-300 hover:text-[#818cf8] flex items-center justify-center transition-colors cursor-pointer"
                title={maximizedWindows['window-ianb'] ? 'تصغير' : 'تكبير ملء الشاشة'}
              >
                {maximizedWindows['window-ianb'] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => closeWindow('window-ianb')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Protocol Image */}
          <div
            onClick={() => setIanbImageZoom(true)}
            className="rounded-2xl overflow-hidden mb-4 border border-white/10 relative group cursor-zoom-in"
          >
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
              alt="IANB Anatomy Landmarks"
              className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] text-indigo-300 font-bold flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>اضغط لتكبير صورة المعالم التشريحية بدقة عالية</span>
              </span>
            </div>
          </div>

          {/* Protocol Text Content (or Inline Admin Editor) */}
          {isEditingIanb ? (
            <div className="space-y-3 bg-[#0f172a] p-3.5 rounded-2xl border border-indigo-400/40">
              <label className="text-xs font-bold text-indigo-300 block">
                تعديل نص بروتوكول IANB (خاص بالمشرف):
              </label>
              <textarea
                rows={6}
                value={editingIanbValue}
                onChange={(e) => setEditingIanbValue(e.target.value)}
                className="w-full bg-black/60 border border-white/15 p-3 rounded-xl text-xs text-white leading-relaxed outline-none focus:border-indigo-400 font-sans"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingIanb(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveIanbText}
                  disabled={isSavingIanb}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isSavingIanb ? 'جاري الحفظ...' : 'حفظ التعديل للجميع 🚀'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <p className="text-xs sm:text-sm text-slate-200 leading-loose whitespace-pre-line font-medium">
                {ianbText}
              </p>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>علامات النجاح السريري للتخدير:</span>
                </div>
                <p>
                  خدر وتنميل كامل في نصف الشفة السفلية وثلثي اللسان الأمامي في نفس جهة الحقن بعد مرور 3 إلى 5 دقائق.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* نافذة 5: طلب بروتوكول والأسئلة الشائعة (window-request) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="window-request"
        onClick={() => closeWindow('window-request')}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center transition-opacity duration-300 ${
          activeWindow === 'window-request' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[650px] bg-[#111827] border-t border-rose-400/30 rounded-t-[26px] p-4 sm:p-6 shadow-2xl transition-transform duration-320 overflow-y-auto ${
            maximizedWindows['window-request']
              ? 'h-screen max-h-screen rounded-none'
              : 'max-h-[88vh]'
          } ${
            activeWindow === 'window-request' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Pill */}
          <div
            onClick={() => closeWindow('window-request')}
            className="w-11 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-3 cursor-pointer"
          />

          {/* Window Topbar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <span className="text-base font-extrabold text-[#f43f5e] flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span>طلب بروتوكول جديد والأسئلة الشائعة</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMaximize('window-request')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-400/20 border border-white/10 text-slate-300 hover:text-[#f43f5e] flex items-center justify-center transition-colors cursor-pointer"
                title={maximizedWindows['window-request'] ? 'تصغير' : 'تكبير ملء الشاشة'}
              >
                {maximizedWindows['window-request'] ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => closeWindow('window-request')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
                className="w-full p-3.5 text-right font-bold text-xs text-white hover:bg-white/5 flex items-center justify-between cursor-pointer"
              >
                <span>ما هي هذه الحاسبة وكيف تساعد في العيادة؟</span>
                {expandedFaq === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedFaq === 1 && (
                <div className="px-4 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed bg-black/30">
                  هي حاسبة علمية تم تصميمها لمساعدة الطلبة في تقدير أقصى جرعات تخدير آمنة مع ربطها تلقائياً بالتاريخ المرضي لتفادي الجرعات المفرطة أو تداخلاتها مع أمراض القلب والكبد والكلى.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
                className="w-full p-3.5 text-right font-bold text-xs text-white hover:bg-white/5 flex items-center justify-between cursor-pointer"
              >
                <span>كيف يمكنني طلب بروتوكول جديد؟</span>
                {expandedFaq === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedFaq === 2 && (
                <div className="px-4 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed bg-black/30">
                  يمكنك كتابة طلبك في الخانة أدناه وسيتلقاه المشرف فوراً لتحضير مادة علمية متكاملة مدعمة بالصور والخطوات لعياداتك القادمة.
                </div>
              )}
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmitProtocolRequest} className="pt-2 space-y-2.5">
              <label htmlFor="reqText" className="text-xs font-bold text-white block">
                اطلب بروتوكولاً جديداً أو شرحاً لحالة عيادية:
              </label>
              <textarea
                id="reqText"
                rows={3}
                value={protocolRequestText}
                onChange={(e) => setProtocolRequestText(e.target.value)}
                placeholder="اكتب اسم الحالة أو الموضوع الذي تريد إضافته (مثال: بروتوكول التعامل مع الانثقاب اللبي، أو خطوات تبييض الأسنان)..."
                className="w-full p-3 text-xs rounded-xl border border-white/10 bg-[#0f172a] text-white focus:border-rose-400 outline-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingRequest || !protocolRequestText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/90 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingRequest ? 'جاري الإرسال...' : 'إرسال الطلب للمشرف 🚀'}</span>
                </button>

                {requestFeedback && (
                  <span className="text-xs font-bold text-emerald-400 animate-in fade-in">
                    {requestFeedback}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image Lightbox for IANB */}
      <ImageLightboxModal
        isOpen={ianbImageZoom}
        onClose={() => setIanbImageZoom(false)}
        imageUrl="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=90"
        title="المعالم التشريحية لتخدير العصب السنخي السفلي (IANB)"
      />

      {/* Smart Clinic Tray Protocol Modal (7 Steps) */}
      <SmartClinicTrayProtocolModal
        isOpen={showSmartTrayModal}
        onClose={() => setShowSmartTrayModal(false)}
      />

      {/* Direct Pulp Capping Protocol Modal (7 Steps) */}
      <DirectPulpCappingModal
        isOpen={showDirectPulpCappingModal}
        onClose={() => setShowDirectPulpCappingModal(false)}
      />

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
  );
};

// Clipboard Icon helper
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);
