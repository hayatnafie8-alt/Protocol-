import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Bell,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Syringe,
  Pill,
  ShieldCheck,
  FileText,
  RotateCcw,
  Trash2,
  ExternalLink,
  BookOpen,
  User,
  Clock,
  Archive,
  Image as ImageIcon,
  ClipboardCheck,
  HelpCircle,
  Plus,
  X,
  Download,
  ZoomIn,
  Lock,
  Unlock,
  Camera,
  Search,
  Printer,
} from 'lucide-react';
import { ClinicalReportGeneratorModal } from './ClinicalReportGeneratorModal';
import {
  getClinicalCases,
  saveClinicalCases,
  addOrUpdateClinicalCase,
  deleteClinicalCase,
  compressClinicalImage,
  exportClinicalCasesBackup,
  CLINICAL_CATEGORIES,
  ClinicalCategory,
  CasePhoto,
  TrueCaseItem,
  CLINICAL_CASES_EVENT,
} from '../utils/clinicalCasesStorage';
import {
  getCompanionPermissions,
  CompanionPermissionsMap,
  DEFAULT_COMPANION_PERMISSIONS,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
} from '../data/companionPermissionsManager';
import { useLanguage } from '../contexts/LanguageContext';

interface LightCompanionMenuProps {
  className?: string;
  onOpenFullCompanion?: () => void;
  onOpenAnesthesia?: () => void;
  onOpenPrescriptions?: () => void;
  onOpenDirectPulpCapping?: () => void;
  onOpenSmartTray?: () => void;
  onOpenViva?: () => void;
  onOpenChecklist?: () => void;
  isAuthorAdmin?: boolean;
  isContentUnlocked?: boolean;
  isSubscriptionChecking?: boolean;
}

export type { TrueCaseItem };

export const LightCompanionMenu: React.FC<LightCompanionMenuProps> = ({
  className = '',
  onOpenFullCompanion,
  onOpenAnesthesia,
  onOpenPrescriptions,
  onOpenDirectPulpCapping,
  onOpenSmartTray,
  onOpenViva,
  onOpenChecklist,
  isAuthorAdmin = false,
  isContentUnlocked = false,
  isSubscriptionChecking = false,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const appointmentsCardRef = useRef<HTMLDivElement>(null);
  const [showAppointmentsDetails, setShowAppointmentsDetails] = useState(true);

  // Companion Permissions & Real-time Sync (Admin control)
  const [permissions, setPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );

  useEffect(() => {
    const handlePermUpdate = () => {
      setPermissions(getCompanionPermissions());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
    window.addEventListener('storage', handlePermUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
      window.removeEventListener('storage', handlePermUpdate);
    };
  }, []);

  const apptPerm = permissions['appointments'] || DEFAULT_COMPANION_PERMISSIONS['appointments'] || {
    access: 'subscription',
    visibility: 'visible',
  };
  const isApptVisible = apptPerm.visibility !== 'hidden' || isAuthorAdmin;
  const isApptFree = apptPerm.access === 'free';
  const isLockedForUser = !isAuthorAdmin && !isContentUnlocked && !isApptFree;
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);

  // Form State for patient input with draft autosave
  const [patientFullName, setPatientFullName] = useState(() => {
    return (
      localStorage.getItem('proto_draft_name') ||
      localStorage.getItem('protocol_patient_name') ||
      localStorage.getItem('proto_name') ||
      ''
    );
  });

  const [patientApptDate, setPatientApptDate] = useState(() => {
    return (
      localStorage.getItem('proto_draft_date') ||
      localStorage.getItem('protocol_patient_date') ||
      localStorage.getItem('proto_date') ||
      ''
    );
  });

  // Clinical Categories & Photo state
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory>('fillings');
  const [caseProcedure, setCaseProcedure] = useState('');
  const [caseToothNumber, setCaseToothNumber] = useState('');
  const [newCasePhotos, setNewCasePhotos] = useState<CasePhoto[]>([]);
  const [caseImageBase64, setCaseImageBase64] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | ClinicalCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<{
    url: string;
    caption?: string;
    patientName?: string;
    caseDate?: string;
    categoryName?: string;
  } | null>(null);

  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Real cases archive (loaded from IndexedDB + localStorage)
  const [trueCases, setTrueCases] = useState<TrueCaseItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    getClinicalCases().then((loaded) => {
      setTrueCases(loaded);
    });

    const handleCasesUpdate = () => {
      getClinicalCases().then((loaded) => setTrueCases(loaded));
    };

    window.addEventListener(CLINICAL_CASES_EVENT, handleCasesUpdate);
    window.addEventListener('storage', handleCasesUpdate);
    return () => {
      window.removeEventListener(CLINICAL_CASES_EVENT, handleCasesUpdate);
      window.removeEventListener('storage', handleCasesUpdate);
    };
  }, []);

  // Active patient slot for smart alerts
  const [activeSlot, setActiveSlot] = useState<{ name: string; date: string } | null>(() => {
    try {
      const stored = localStorage.getItem('protocol_active_patient_slot');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  // Calculate statistics (Starts completely zeroed out: 0, 0, 0%, 0)
  const totalCount = trueCases.length;
  const monthCount = totalCount;
  const archivedCount = totalCount;
  const successRate = totalCount > 0 ? Math.min(100, totalCount * 10) : 0;

  // Smart alert calculation
  const smartAlert = useMemo(() => {
    const slot = activeSlot;
    if (!slot || !slot.date || !slot.name || slot.name.trim() === '') {
      return {
        text: '⏳ جدول المواعيد خالي. قم باستقبال مراجع جديد لتفعيل التنبيهات.',
        color: '#c5a059',
        isWarning: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(slot.date);
    target.setHours(0, 0, 0, 0);

    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      return {
        text: `🔔 <strong>تنبيه (ذكر مراجعيك بمواعيدهم):</strong> غداً موعد البيشنت (<strong>${slot.name}</strong>) في العيادة!`,
        color: '#f59e0b',
        isWarning: false,
      };
    } else if (diff === 0) {
      return {
        text: `⭐ <strong>موعد اليوم:</strong> لديك حالة البيشنت (<strong>${slot.name}</strong>) مسجلة للعمل اليوم بالتوفيق!`,
        color: '#5cb85c',
        isWarning: false,
      };
    } else if (diff < 0) {
      return {
        text: '⚠️ <strong>Empty slot (لديك موعد فارغ):</strong> انتهى موعد الحالة السابقة، قم باستقبال مراجع جديد.',
        color: '#f87171',
        isWarning: true,
      };
    } else {
      return {
        text: `📅 الموعد القادم في الجدول: للبيشنت (<strong>${slot.name}</strong>) بتاريخ ${slot.date}.`,
        color: '#38bdf8',
        isWarning: false,
      };
    }
  }, [activeSlot]);

  // Draft auto-saving
  const handleNameInput = (val: string) => {
    setPatientFullName(val);
    try {
      if (val.trim()) {
        localStorage.setItem('proto_draft_name', val);
      } else {
        localStorage.removeItem('proto_draft_name');
      }
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch {}
  };

  const handleDateInput = (val: string) => {
    setPatientApptDate(val);
    try {
      if (val) {
        localStorage.setItem('proto_draft_date', val);
      } else {
        localStorage.removeItem('proto_draft_date');
      }
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch {}
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setCaseImageBase64(result || '');
      };
      reader.readAsDataURL(file);
    } else {
      setCaseImageBase64('');
    }
  };

  // Photo upload handler with automatic compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, caption = 'صورة سريرية') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingPhoto(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressClinicalImage(file);
        const photo: CasePhoto = {
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          url: compressed,
          caption,
          timestamp: new Date().toISOString(),
        };
        setNewCasePhotos((prev) => [...prev, photo]);
      }
    } catch (err) {
      console.error('Error compressing image', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Add photos to an existing archived case
  const handleAddPhotoToExistingCase = async (caseItem: TrueCaseItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingPhoto(true);

    try {
      const addedPhotos: CasePhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressClinicalImage(file);
        addedPhotos.push({
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          url: compressed,
          caption: 'صورة متابعة سريرية',
          timestamp: new Date().toISOString(),
        });
      }

      const updatedCase: TrueCaseItem = {
        ...caseItem,
        photos: [...(caseItem.photos || []), ...addedPhotos],
        image: caseItem.image || addedPhotos[0]?.url,
      };

      const updated = await addOrUpdateClinicalCase(updatedCase);
      setTrueCases(updated);
      setSaveToast(`تمت إضافة ${addedPhotos.length} صورة إلى أرشيف حالة "${caseItem.name}" بنجاح! 📸`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error('Error adding photo to existing case', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Register new patient case function with photos, categories, and IndexedDB
  const registerNewPatientCase = async (customName?: string, customDate?: string, customImageUrl?: string) => {
    const nameInput = (
      customName ||
      (document.getElementById('patientFullName') as HTMLInputElement)?.value ||
      patientFullName
    ).trim();

    const dateInput =
      customDate ||
      (document.getElementById('patientApptDate') as HTMLInputElement)?.value ||
      patientApptDate;

    if (!nameInput || !dateInput) {
      setSaveToast('⚠️ يرجى إدخال اسم المراجع وتاريخ الموعد بدقة!');
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    if (isLockedForUser) {
      setShowSubscriptionAlert(true);
      return;
    }

    const newCaseItem: TrueCaseItem = {
      id: Date.now(),
      name: nameInput,
      date: dateInput,
      category: selectedCategory,
      procedure: caseProcedure.trim() || undefined,
      toothNumber: caseToothNumber.trim() || undefined,
      photos: newCasePhotos,
      image: newCasePhotos[0]?.url || customImageUrl || caseImageBase64 || undefined,
      isArchived: true,
      timestamp: new Date().toISOString(),
    };

    const updated = await addOrUpdateClinicalCase(newCaseItem);
    setTrueCases(updated);

    // Save active patient slot
    const newSlot = { name: nameInput, date: dateInput };
    localStorage.setItem('protocol_active_patient_slot', JSON.stringify(newSlot));
    setActiveSlot(newSlot);

    // Also mirror to legacy keys for comprehensive app syncing
    localStorage.setItem('protocol_patient_name', nameInput);
    localStorage.setItem('protocol_patient_date', dateInput);
    localStorage.setItem('proto_name', nameInput);
    localStorage.setItem('proto_date', dateInput);
    localStorage.removeItem('proto_draft_name');
    localStorage.removeItem('proto_draft_date');

    // Reset inputs
    setPatientFullName('');
    setPatientApptDate('');
    setCaseProcedure('');
    setCaseToothNumber('');
    setNewCasePhotos([]);
    setCaseImageBase64('');
    const nameDom = document.getElementById('patientFullName') as HTMLInputElement;
    if (nameDom) nameDom.value = '';
    const dateDom = document.getElementById('patientApptDate') as HTMLInputElement;
    if (dateDom) dateDom.value = '';
    const fileDom = document.getElementById('patientCaseImage') as HTMLInputElement;
    if (fileDom) fileDom.value = '';

    setSaveToast(`تم تسجيل وأرشفة حالة "${nameInput}" مع ${newCasePhotos.length} صورة بنجاح! 🚀`);
    setTimeout(() => setSaveToast(null), 4000);

    // Broadcast storage events
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  };

  // Delete true case item
  const deleteTrueCaseItem = async (id: number | string) => {
    try {
      const updated = await deleteClinicalCase(id);
      setTrueCases(updated);

      if (updated.length > 0) {
        const last = updated[updated.length - 1];
        const updatedSlot = { name: last.name, date: last.date };
        localStorage.setItem('protocol_active_patient_slot', JSON.stringify(updatedSlot));
        setActiveSlot(updatedSlot);
      } else {
        localStorage.removeItem('protocol_active_patient_slot');
        setActiveSlot(null);
      }

      setSaveToast('تم حذف الحالة وصورها من الأرشيف السريري بنجاح 🗑️');
      setTimeout(() => setSaveToast(null), 3000);

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('protocol-appointments-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  // Category counts and filtered cases
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: trueCases.length };
    CLINICAL_CATEGORIES.forEach((cat) => {
      counts[cat.id] = trueCases.filter((c) => c.category === cat.id).length;
    });
    return counts;
  }, [trueCases]);

  const filteredCases = useMemo(() => {
    return trueCases.filter((c) => {
      const matchCat = activeCategoryFilter === 'all' || c.category === activeCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.procedure && c.procedure.toLowerCase().includes(q)) ||
        (c.toothNumber && c.toothNumber.includes(q)) ||
        (c.date && c.date.includes(q));
      return matchCat && matchQuery;
    });
  }, [trueCases, activeCategoryFilter, searchQuery]);

  // Toggle dropdown handler with smooth animation
  const toggleSmoothMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Register window global functions for script execution compatibility
  useEffect(() => {
    (window as any).toggleDirectMenu = () => toggleSmoothMenu();
    (window as any).toggleCompanionMenu = () => toggleSmoothMenu();
    (window as any).registerNewPatientCase = () => registerNewPatientCase();
    (window as any).deleteTrueCaseItem = (id: number) => deleteTrueCaseItem(id);
    (window as any).saveToTrueStorage = (name: string, date: string, imageUrl: string) =>
      registerNewPatientCase(name, date, imageUrl);
    (window as any).updateTrueDashboardStats = () => {
      // Re-read storage
      try {
        const stored = localStorage.getItem('protocol_true_cases_archive');
        if (stored) setTrueCases(JSON.parse(stored));
      } catch {}
    };

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('protocol_true_cases_archive');
        if (stored) {
          setTrueCases(JSON.parse(stored));
        } else {
          setTrueCases([]);
        }
      } catch {}

      try {
        const storedSlot = localStorage.getItem('protocol_active_patient_slot');
        if (storedSlot) {
          setActiveSlot(JSON.parse(storedSlot));
        } else {
          setActiveSlot(null);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('protocol-appointments-updated', handleStorageChange);

    return () => {
      delete (window as any).toggleDirectMenu;
      delete (window as any).toggleCompanionMenu;
      delete (window as any).registerNewPatientCase;
      delete (window as any).deleteTrueCaseItem;
      delete (window as any).saveToTrueStorage;
      delete (window as any).updateTrueDashboardStats;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('protocol-appointments-updated', handleStorageChange);
    };
  }, []);

  return (
    <div
      className={`light-companion-wrapper ${className}`}
      style={{
        margin: '15px auto',
        maxWidth: '600px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <style>{`
        .smooth-dropdown-menu {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
          transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease, transform 0.35s ease;
        }
        .smooth-dropdown-menu.smooth-active, .smooth-dropdown-menu.active {
          max-height: 3500px !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
          overflow: visible !important;
        }
      `}</style>

      {/* زر القائمة المنسدلة للرفيق السريري الشامل */}
      <div style={{ textAlign: 'center', margin: '15px auto', maxWidth: '600px' }}>
        <button
          type="button"
          onClick={toggleSmoothMenu}
          style={{
            background: '#3b4a2e',
            color: 'white',
            border: '2px solid #c5a059',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🩺</span>
            <span>{t('companion.title', 'الرفيق السريري الشامل', 'Smart Clinical Companion')}</span>
          </span>
          <span id="directIcon" style={{ fontSize: '16px' }}>
            {isOpen ? '⬆️' : '⬇️'}
          </span>
          <span id="menuIcon" style={{ display: 'none' }}>
            {isOpen ? '⬇️' : '⬆️'}
          </span>
        </button>
      </div>

      {/* داخل قائمة الرفيق السريري السريع (الحاوية المنسدلة بتأثير حركي سلس وفاخر) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="clinicalCompanionMenu"
            ref={menuRef}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              overflow: 'hidden',
              maxWidth: '600px',
              margin: 'auto',
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
        {/* ================================================= */}
        {/* 1. خانات وأدوات الرفيق السريري الشامل (بما فيها خانة مواعيدي) */}
        {/* ================================================= */}
        <div
          style={{
            background: '#151b12',
            border: '2px solid #c5a059',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            color: '#fcfbfa',
          }}
        >
          <div
            style={{
              borderBottom: '2px solid #c5a059',
              paddingBottom: '10px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🩺</span>
              <h3 style={{ color: '#c5a059', margin: 0, fontSize: '15px', fontWeight: 'bold' }}>
                {t('companion.toolsHeader', 'خانات وأدوات الرفيق السريري الشامل', 'Clinical Companion Tools & Modules')}
              </h3>
            </div>
            <span
              style={{
                background: 'rgba(197,160,89,0.2)',
                color: '#c5a059',
                border: '1px solid #c5a059',
                padding: '2px 8px',
                fontSize: '10px',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}
            >
              {t('companion.badgeLive', 'المنظومة السريرية', 'Clinical System')}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '4px',
            }}
          >
            {/* خانة مواعيدي وجدول العيادات - البوابة الرئيسية التفاعلية */}
            {isSubscriptionChecking ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1.5px dashed rgba(197,160,89,0.3)',
                  borderRadius: '12px',
                  padding: '13px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(197,160,89,0.2)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '14px', width: '45%', background: 'rgba(197,160,89,0.25)', borderRadius: '4px', marginBottom: '6px' }} />
                  <div style={{ height: '10px', width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#c5a059', fontWeight: 'bold' }}>
                  ⏳ جاري التحقق من الاشتراك...
                </span>
              </div>
            ) : isApptVisible && (
              <div
                onClick={() => {
                  if (isLockedForUser) {
                    setShowSubscriptionAlert(true);
                    return;
                  }
                  setShowAppointmentsDetails(!showAppointmentsDetails);
                  if (!showAppointmentsDetails) {
                    setTimeout(() => {
                      appointmentsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                style={{
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, rgba(197,160,89,0.22) 0%, rgba(59,74,46,0.38) 100%)',
                  border: '2px solid #c5a059',
                  borderRadius: '12px',
                  padding: '13px 15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(197,160,89,0.15)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        background: '#c5a059',
                        color: '#151b12',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, color: '#c5a059', fontSize: '14px', fontWeight: 'bold' }}>
                          {t('companion.apptsCardTitle', '📅 خانة مواعيدي وجدول العيادات', '📅 My Appointments & Clinic Schedule')}
                        </h4>
                        {isApptFree ? (
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '1px 5px',
                              fontSize: '9px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            {isRTL ? '🔓 مجاني للعامة' : '🔓 Free'}
                          </span>
                        ) : (isContentUnlocked || isAuthorAdmin) ? (
                          <span
                            style={{
                              background: 'rgba(197, 160, 89, 0.2)',
                              color: '#e6a73c',
                              border: '1px solid rgba(197, 160, 89, 0.4)',
                              padding: '1px 5px',
                              fontSize: '9px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            {isRTL ? '✨ متاح للمشتركين' : '✨ Subscriber'}
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              padding: '1px 5px',
                              fontSize: '9px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            {isRTL ? '🔒 محتوى مدفوع' : '🔒 Paid / Locked'}
                          </span>
                        )}
                        {isAuthorAdmin && (
                          <span
                            style={{
                              background: 'rgba(56, 189, 248, 0.2)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              padding: '1px 5px',
                              fontSize: '9px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            {isRTL ? 'المشرف 🛡️' : 'Supervisor 🛡️'}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                        {t('companion.apptsCardDesc', 'تسجيل واستقبال المراجعين • تقسيم الأقسام السريرية • أرشيف الصور', 'Patient intake • Clinical categories • Photo archive')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span
                      style={{
                        background: 'rgba(197,160,89,0.3)',
                        color: '#f5d77f',
                        border: '1px solid #c5a059',
                        padding: '2px 8px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                      }}
                    >
                      {isRTL ? `شهرياً: ${monthCount} حالة` : `Monthly: ${monthCount} cases`}
                    </span>
                    <span style={{ fontSize: '10px', color: '#5cb85c', fontWeight: 'bold' }}>
                      {totalCount > 0 ? (isRTL ? `إجمالي: ${totalCount} حالة` : `Total: ${totalCount} cases`) : (isRTL ? 'البدء من الصفر' : 'Start fresh')}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.25)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#e2e8f0',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: smartAlert.color, fontWeight: 'bold' }}>{t('companion.statusLabel', '● الحالة:', '● Status:')}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: smartAlert.text.replace(/<[^>]+>/g, '').slice(0, 48) + '...',
                      }}
                    />
                  </span>
                  <span style={{ color: '#c5a059', textDecoration: 'underline', fontWeight: 'bold', flexShrink: 0 }}>
                    {showAppointmentsDetails ? t('companion.viewFieldsBelow', 'عرض الحقول أدناه ⬇️', 'View fields below ⬇️') : t('companion.expandBox', 'توسيع الخانة ⬇️', 'Expand module ⬇️')}
                  </span>
                </div>
              </div>
            )}

            {/* Tool 1: LA Calculator */}
            <div
              onClick={() => onOpenAnesthesia && onOpenAnesthesia()}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <Syringe size={16} color="#c5a059" />
                <span>{t('companion.anesthesiaTitle', 'حاسبة البنج', 'LA Calculator')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.anesthesiaDesc', 'حساب الجرعة القصوى الآمنة وعدد الكاربولات', 'Maximum safe dose & cartridge calculator')}
              </p>
            </div>

            {/* Tool 2: Rx Drugs */}
            <div
              onClick={() => onOpenPrescriptions && onOpenPrescriptions()}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <Pill size={16} color="#c5a059" />
                <span>{t('companion.drugsTitle', 'دليل الأدوية', 'Prescription Guide')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.drugsDesc', 'المضادات والمسكنات وجرعات الأطفال والبالغين', 'Antibiotics, analgesics, pediatric & adult dosing')}
              </p>
            </div>

            {/* Tool 3: Direct Pulp Capping */}
            <div
              onClick={() => onOpenDirectPulpCapping && onOpenDirectPulpCapping()}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <ShieldCheck size={16} color="#c5a059" />
                <span>{t('companion.pulpTitle', 'التغطية اللبية DPC', 'Direct Pulp Capping')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.pulpDesc', 'بروتوكول حماية اللب المكشوف بمادة MTA', 'Exposed pulp vital therapy & MTA protocol')}
              </p>
            </div>

            {/* Tool 4: Smart Clinic Tray */}
            <div
              onClick={() => onOpenSmartTray && onOpenSmartTray()}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <Stethoscope size={16} color="#c5a059" />
                <span>{t('companion.trayTitle', 'صينية العيادة الذكية', 'Smart Clinic Tray')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.trayDesc', 'تحضير أدوات الحفر والترميم والعزل', 'Preparation, restorative & isolation instruments')}
              </p>
            </div>

            {/* Tool 5: Checklist */}
            <div
              onClick={() => {
                if (onOpenChecklist) onOpenChecklist();
                else if (onOpenFullCompanion) onOpenFullCompanion();
              }}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <ClipboardCheck size={16} color="#c5a059" />
                <span>{t('companion.checklistTitle', 'قائمة الفحص السريري', 'Clinical Checklist')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.checklistDesc', 'فحص العلامات الحيوية والتحسس والأشعة', 'Vital signs, allergy checks & radiographs')}
              </p>
            </div>

            {/* Tool 6: Senior Viva Questions */}
            <div
              onClick={() => {
                if (onOpenViva) onOpenViva();
                else if (onOpenFullCompanion) onOpenFullCompanion();
              }}
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c5a059',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                <HelpCircle size={16} color="#c5a059" />
                <span>{t('companion.vivaTitle', 'أسئلة العيادات (Viva)', 'Clinic Viva Questions')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                {t('companion.vivaDesc', 'بنك أسئلة السينيور والمناقشة السريرية', 'Senior viva exam & clinical defense questions')}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. بطاقة مواعيدي ولوحة متابعة الحالات (المصفرة وتبدأ بالحالات الحقيقية) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showAppointmentsDetails && (
            <motion.div
              ref={appointmentsCardRef}
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#151b12',
                border: '2px solid #c5a059',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                color: '#fcfbfa',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                overflow: 'hidden',
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            {/* رأس القسم */}
            <div
              style={{
                borderBottom: '2px solid #c5a059',
                paddingBottom: '12px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#c5a059',
                    color: '#151b12',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  📅
                </span>
                <h3 style={{ color: '#c5a059', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {t('appts.title', 'مواعيدي ومتابعة الحالات السريرية', 'My Appointments & Case Follow-up')}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  id="liveMonthBadge"
                  style={{
                    background: 'rgba(197,160,89,0.15)',
                    color: '#c5a059',
                    border: '1px solid #c5a059',
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                  }}
                >
                  {isRTL ? `شهرياً: ${monthCount} حالة` : `Monthly: ${monthCount} cases`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAppointmentsDetails(false)}
                  style={{
                    background: 'rgba(197,160,89,0.15)',
                    border: '1px solid #c5a059',
                    color: '#c5a059',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                  title={t('companion.collapseBox', 'طي الخانة', 'Collapse module')}
                >
                  {t('companion.collapseBox', 'طي ⬆️', 'Collapse ⬆️')}
                </button>
              </div>
            </div>

          {/* لوحة الإحصائيات (مصفرة تماماً وتبدأ بالحقيقي فقط) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {isRTL ? 'إجمالي الحالات' : 'Total Cases'}
              </span>
              <strong style={{ fontSize: '20px', color: '#c5a059' }} id="statTotalCases">
                {totalCount}
              </strong>{' '}
              <span style={{ fontSize: '11px', color: '#ccc' }}>{isRTL ? 'حالة' : 'cases'}</span>
            </div>

            <div
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {isRTL ? 'حالات هذا الشهر' : 'This Month'}
              </span>
              <strong style={{ fontSize: '20px', color: '#5cb85c' }} id="statMonthCases">
                {monthCount}
              </strong>{' '}
              <span style={{ fontSize: '11px', color: '#ccc' }}>{isRTL ? 'مسجلة' : 'logged'}</span>
            </div>

            <div
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {isRTL ? 'معدل الإنجاز السريري' : 'Clinical Success Rate'}
              </span>
              <strong style={{ fontSize: '20px', color: '#c5a059' }} id="statSuccessRate">
                {successRate}%
              </strong>{' '}
              <span style={{ fontSize: '11px', color: '#ccc' }}>{isRTL ? 'نجاح' : 'success'}</span>
            </div>

            <div
              style={{
                background: '#1e251a',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {isRTL ? 'حالات مكتملة (أرشفة)' : 'Completed & Archived'}
              </span>
              <strong style={{ fontSize: '20px', color: '#5cb85c' }} id="statArchivedCases">
                {archivedCount}
              </strong>{' '}
              <span style={{ fontSize: '11px', color: '#ccc' }}>{isRTL ? 'أرشيف' : 'archived'}</span>
            </div>
          </div>

          {/* التنبيه الذكي للمواعيد */}
          <div
            id="realApptAlertBox"
            style={{
              background: '#1e251a',
              borderRight: `4px solid ${smartAlert.color}`,
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#fcfbfa',
              border: '1px solid rgba(197,160,89,0.2)',
            }}
            dangerouslySetInnerHTML={{ __html: smartAlert.text }}
          />

          {/* Toast Notification */}
          {saveToast && (
            <div
              style={{
                background: 'rgba(92, 184, 92, 0.15)',
                color: '#86efac',
                border: '1px solid #5cb85c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
              }}
            >
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#86efac', flexShrink: 0 }} />
              <span>{saveToast}</span>
            </div>
          )}

          {/* خانات إدخال واستقبال المراجع السريري مع الصور والتصنيف */}
          <div
            style={{
              background: '#1e251a',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid rgba(197,160,89,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#c5a059',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🦷</span>
                <span>{isRTL ? 'استقبال مراجع وتسجيل حالة سريرية جديدة:' : 'Patient Intake & New Clinical Case:'}</span>
              </p>
              <span
                style={{
                  fontSize: '10px',
                  background: 'rgba(197,160,89,0.15)',
                  color: '#c5a059',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(197,160,89,0.3)',
                }}
              >
                {isRTL ? 'أرشفة دائمة طوال العام' : 'Year-round archive'}
              </span>
            </div>

            {/* اسم المراجع */}
            <input
              type="text"
              id="patientFullName"
              value={patientFullName}
              onChange={(e) => handleNameInput(e.target.value)}
              placeholder={t('appts.patientName', 'اسم المراجع (البيشنت)...', 'Patient Name...')}
              style={{
                width: '100%',
                padding: '10px',
                background: '#151b12',
                border: '1px solid #c5a059',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'white',
                marginBottom: '10px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            {/* تاريخ الموعد */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                {isRTL ? '📅 تاريخ الموعد في العيادة:' : '📅 Clinic Appointment Date:'}
              </label>
              <input
                type="date"
                id="patientApptDate"
                value={patientApptDate}
                onChange={(e) => handleDateInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#151b12',
                  border: '1px solid #c5a059',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'white',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* تقسيم الحالات والتصنيف السريري */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                {isRTL ? '🏷️ تصنيف الحالة السريرية (اختر القسم):' : '🏷️ Clinical Category (Department):'}
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                }}
              >
                {CLINICAL_CATEGORIES.map((cat, catIdx) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={`${cat.id}_${catIdx}`}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        background: isSelected ? cat.color : cat.bgColor,
                        color: isSelected ? '#151b12' : '#fcfbfa',
                        border: `1.5px solid ${isSelected ? cat.color : cat.borderColor}`,
                        borderRadius: '8px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? `0 2px 8px ${cat.color}40` : 'none',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{isRTL ? cat.nameAr : cat.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* تفاصيل إضافية: الإجراء ورقم السن */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                  {isRTL ? '🦷 رقم السن (Tooth #):' : '🦷 Tooth #:'}
                </label>
                <input
                  type="text"
                  value={caseToothNumber}
                  onChange={(e) => setCaseToothNumber(e.target.value)}
                  placeholder={isRTL ? 'مثال: #16, #21, فك كامل' : 'e.g. #16, #21, Full Arch'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#151b12',
                    border: '1px solid rgba(197,160,89,0.4)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                  {isRTL ? '📝 تفاصيل الإجراء:' : '📝 Procedure Details:'}
                </label>
                <input
                  type="text"
                  value={caseProcedure}
                  onChange={(e) => setCaseProcedure(e.target.value)}
                  placeholder={isRTL ? 'مثال: Class II Composite' : 'e.g. Class II Composite'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#151b12',
                    border: '1px solid rgba(197,160,89,0.4)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* خانة إرفاق صور الحالة السريرية (حفظ دائم وأرشفة مع الحالة) */}
            <div
              style={{
                background: '#151b12',
                border: '1px dashed #c5a059',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#c5a059', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Camera size={14} />
                  <span>{isRTL ? 'صور الحالة السريرية (قبل / أثناء / بعد الشغل):' : 'Clinical Case Photos (Pre / Mid / Post-op):'}</span>
                </label>
                <span style={{ fontSize: '10px', color: '#4ade80' }}>
                  {isRTL ? `${newCasePhotos.length} صورة مضافة` : `${newCasePhotos.length} photos added`}
                </span>
              </div>

              {/* أزرار إضافة سريعة مع التسمية */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                <label
                  style={{
                    background: 'rgba(197,160,89,0.15)',
                    border: '1px solid #c5a059',
                    color: '#c5a059',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  <Plus size={12} />
                  <span>{isRTL ? '+ قبل الشغل (Pre-op)' : '+ Pre-op Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, 'قبل الشغل (Pre-op)')}
                  />
                </label>

                <label
                  style={{
                    background: 'rgba(56,189,248,0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  <Plus size={12} />
                  <span>{isRTL ? '+ أثناء العمل (Working)' : '+ Working Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, 'أثناء العمل (Working)')}
                  />
                </label>

                <label
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  <Plus size={12} />
                  <span>{isRTL ? '+ بعد الإنهاء (Post-op)' : '+ Post-op Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, 'بعد الإنهاء (Post-op)')}
                  />
                </label>

                <label
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid #a855f7',
                    color: '#a855f7',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  <Plus size={12} />
                  <span>{isRTL ? '+ أشعة X-Ray' : '+ X-Ray Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, 'صورة أشعة (X-Ray)')}
                  />
                </label>
              </div>

              {isProcessingPhoto && (
                <div style={{ fontSize: '11px', color: '#c5a059', textAlign: 'center', padding: '6px' }}>
                  {isRTL ? '⏳ جاري ضغط ومعالجة الصورة وتجهيزها للحفظ الدائم...' : '⏳ Compressing and processing photo for secure archiving...'}
                </div>
              )}

              {/* معرض مصغرات الصور المرفقة للحالة الجديدة */}
              {newCasePhotos.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  {newCasePhotos.map((photo, idx) => (
                    <div
                      key={`${photo.id || 'photo'}_${idx}`}
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #c5a059',
                        aspectRatio: '1',
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'صورة سريرية'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewCasePhotos((prev) => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(239,68,68,0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title="حذف الصورة"
                      >
                        <X size={11} />
                      </button>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '8px',
                          padding: '1px 2px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {photo.caption || 'صورة'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* مؤشر حفظ المسودة التلقائي */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: isDraftSaved ? '#4ade80' : '#a0a59a',
                marginBottom: '10px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isDraftSaved
                      ? '#4ade80'
                      : patientFullName || patientApptDate
                      ? '#c5a059'
                      : '#666',
                  }}
                />
                {isDraftSaved
                  ? (isRTL ? '💾 تم حفظ المسودة تلقائياً' : '💾 Draft Auto-Saved')
                  : patientFullName || patientApptDate
                  ? (isRTL ? 'حفظ تلقائي للمسودة نشط أثناء الكتابة' : 'Auto-saving draft while typing')
                  : (isRTL ? 'الحفظ التلقائي للمسودة مفعل' : 'Draft auto-save enabled')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(patientFullName || patientApptDate || newCasePhotos.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleNameInput('');
                      handleDateInput('');
                      setCaseProcedure('');
                      setCaseToothNumber('');
                      setNewCasePhotos([]);
                      setCaseImageBase64('');
                      localStorage.removeItem('proto_draft_name');
                      localStorage.removeItem('proto_draft_date');
                      localStorage.removeItem('protocol_patient_name');
                      localStorage.removeItem('protocol_patient_date');
                      localStorage.removeItem('proto_name');
                      localStorage.removeItem('proto_date');
                      setSaveToast(isRTL ? '🗑️ تم حذف وتفريغ خانة المراجع (لم يتم الشغل).' : '🗑️ Cleared patient slot (not done).');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={isRTL ? 'حذف خانة المراجع وتفريغ البيانات إذا لم يتم إنجاز الشغل' : 'Delete slot and clear inputs if not done'}
                  >
                    <Trash2 size={12} />
                    <span>{isRTL ? 'حذف خانة المراجع (ما تم الشغل) ❌' : 'Delete Slot (Not Done) ❌'}</span>
                  </button>
                )}
                {(patientFullName || patientApptDate || newCasePhotos.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleNameInput('');
                      handleDateInput('');
                      setCaseProcedure('');
                      setCaseToothNumber('');
                      setNewCasePhotos([]);
                      setCaseImageBase64('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a0a59a',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {isRTL ? 'مسح الحقول' : 'Clear Fields'}
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => registerNewPatientCase()}
              style={{
                background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
                color: '#151b12',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(197,160,89,0.28)',
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{isRTL ? 'تسجيل الحالة وأرشفتها مع الصور في السجل السريري 🚀' : 'Log Case & Archive with Photos in Clinical Record 🚀'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* أرشيف الحالات السريرية المقسم والمبوّب (قلع، حشوات، أطقم، تنظيف...) */}
          {/* ========================================================================= */}
          <div style={{ borderTop: '2px solid rgba(197,160,89,0.3)', paddingTop: '14px' }}>
            {/* رأس قسم الأرشيف وأزرار التصدير للعام الدراسي */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Archive size={16} color="#c5a059" />
                <h4 style={{ fontSize: '14px', color: '#c5a059', margin: 0, fontWeight: 'bold' }}>
                  {isRTL ? 'الأرشيف السريري للحالات والصور:' : 'Clinical Archive & Case Photos:'}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    background: 'rgba(197,160,89,0.15)',
                    color: '#c5a059',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {isRTL ? `${trueCases.length} حالة مؤرشفة` : `${trueCases.length} archived cases`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                    border: 'none',
                    color: '#151b12',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 900,
                    boxShadow: '0 2px 6px rgba(197,160,89,0.35)',
                  }}
                  title={isRTL ? 'توليد تقرير الإنجاز السريري السنوي وتصديره كـ PDF رسمي مع الصور ونسب النجاح' : 'Generate annual clinical achievement report (PDF) with photos'}
                >
                  <Printer size={12} />
                  <span>{t('appts.pdfReport', 'تصدير التقرير (PDF) 📄', 'Export Report (PDF) 📄')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportClinicalCasesBackup()}
                  style={{
                    background: 'rgba(56,189,248,0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                  }}
                  title={isRTL ? 'تصدير نسخة احتياطية من جميع الحالات والصور لتبقى محفوظة طوال العام' : 'Export backup copy of all cases and photos'}
                >
                  <Download size={11} />
                  <span>{isRTL ? 'تصدير نسخة 📥' : 'Export Backup 📥'}</span>
                </button>
              </div>
            </div>

            {/* تبويبات تقسيم الحالات المؤرشفة (قلع، حشوات، أطقم، تنظيف، إلخ) */}
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '5px',
                paddingBottom: '8px',
                marginBottom: '10px',
                scrollbarWidth: 'thin',
              }}
            >
              {/* تبويب الكل */}
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                style={{
                  background: activeCategoryFilter === 'all' ? '#c5a059' : '#1e251a',
                  color: activeCategoryFilter === 'all' ? '#151b12' : '#fcfbfa',
                  border: `1px solid ${activeCategoryFilter === 'all' ? '#c5a059' : 'rgba(197,160,89,0.3)'}`,
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                🌟 {isRTL ? 'الكل' : 'All'} ({categoryCounts.all || 0})
              </button>

              {/* تبويبات الأقسام السريرية */}
              {CLINICAL_CATEGORIES.map((cat, catIdx) => {
                const count = categoryCounts[cat.id] || 0;
                const isActive = activeCategoryFilter === cat.id;
                return (
                  <button
                    key={`${cat.id}_${catIdx}`}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    style={{
                      background: isActive ? cat.color : cat.bgColor,
                      color: isActive ? '#151b12' : '#fcfbfa',
                      border: `1px solid ${isActive ? cat.color : cat.borderColor}`,
                      borderRadius: '20px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{isRTL ? cat.nameAr : cat.nameEn}</span>
                    <span
                      style={{
                        background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)',
                        padding: '1px 5px',
                        borderRadius: '10px',
                        fontSize: '9px',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* شريط البحث في الأرشيف */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? '🔍 ابحث في الحالات (اسم المراجع، رقم السن، الإجراء)...' : '🔍 Search cases (patient name, tooth #, procedure)...'}
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 10px',
                  background: '#151b12',
                  border: '1px solid rgba(197,160,89,0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'white',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#a0a59a',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* قائمة الحالات المؤرشفة مع تفاصيلها وصورها */}
            <div
              id="trueArchiveList"
              style={{
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
              }}
            >
              {filteredCases.length === 0 ? (
                <div
                  style={{
                    background: '#1a2016',
                    border: '1px dashed rgba(197,160,89,0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#aaa',
                  }}
                >
                  {trueCases.length === 0
                    ? (isRTL ? 'لا توجد حالات مسجلة حتى الآن (البدء من الصفر). سجل أول حالة أعلاه لتأكيدها في الأرشيف.' : 'No cases recorded yet. Log your first case above to archive.')
                    : (isRTL ? 'لا توجد حالات تطابق هذا التصنيف أو البحث.' : 'No cases match this category or search.')}
                </div>
              ) : (
                filteredCases.map((item, idx) => {
                  const catMeta = CLINICAL_CATEGORIES.find((c) => c.id === item.category) || {
                    id: 'other',
                    nameAr: 'أخرى',
                    nameEn: 'Other',
                    icon: '📋',
                    color: '#94a3b8',
                    bgColor: 'rgba(148,163,184,0.15)',
                    borderColor: 'rgba(148,163,184,0.3)',
                  };

                  const casePhotosList: CasePhoto[] =
                    item.photos && item.photos.length > 0
                      ? item.photos
                      : item.image
                      ? [
                          {
                            id: 'photo_legacy_' + item.id,
                            url: item.image,
                            caption: isRTL ? 'صورة الحالة السريرية' : 'Case Photo',
                            timestamp: item.timestamp || '',
                          },
                        ]
                      : [];

                  return (
                    <div
                      key={`${item.id || 'case'}_${idx}`}
                      style={{
                        background: '#1e251a',
                        border: `1px solid ${catMeta.borderColor}`,
                        borderRadius: '10px',
                        padding: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      {/* رأس بطاقة الحالة */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '6px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span
                              style={{
                                background: catMeta.bgColor,
                                color: catMeta.color,
                                border: `1px solid ${catMeta.borderColor}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <span>{catMeta.icon}</span>
                              <span>{isRTL ? catMeta.nameAr : catMeta.nameEn}</span>
                            </span>
                            <strong style={{ fontSize: '13px', color: '#fcfbfa' }}>{item.name}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: '#c5a059', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span>📅 {isRTL ? 'الموعد:' : 'Date:'} {item.date}</span>
                            {item.toothNumber && (
                              <span style={{ color: '#38bdf8' }}>🦷 {isRTL ? 'السن:' : 'Tooth:'} {item.toothNumber}</span>
                            )}
                            {item.procedure && (
                              <span style={{ color: '#86efac' }}>⚡ {isRTL ? 'الإجراء:' : 'Procedure:'} {item.procedure}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTrueCaseItem(item.id)}
                          style={{
                            background: 'rgba(217, 83, 79, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(217, 83, 79, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title={isRTL ? 'حذف الحالة من الأرشيف' : 'Delete case from archive'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* معرض صور الحالة المؤرشفة */}
                      {casePhotosList.length > 0 ? (
                        <div style={{ marginTop: '8px', borderTop: '1px dashed rgba(197,160,89,0.2)', paddingTop: '8px' }}>
                          <div style={{ fontSize: '10px', color: '#a0a59a', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>🖼️ {isRTL ? 'صور الحالة السريرية' : 'Clinical Photos'} ({casePhotosList.length}):</span>
                            <span style={{ color: '#c5a059' }}>{isRTL ? 'انقر للتكبير 🔍' : 'Click to zoom 🔍'}</span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              overflowX: 'auto',
                              paddingBottom: '4px',
                            }}
                          >
                            {casePhotosList.map((photo, pIdx) => (
                              <div
                                key={`${photo.id || 'photo'}_${pIdx}`}
                                onClick={() =>
                                  setActiveLightboxPhoto({
                                    url: photo.url,
                                    caption: photo.caption || 'صورة الحالة السريرية',
                                    patientName: item.name,
                                    caseDate: item.date,
                                    categoryName: catMeta.nameAr,
                                  })
                                }
                                style={{
                                  position: 'relative',
                                  width: '60px',
                                  height: '60px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #c5a059',
                                  flexShrink: 0,
                                  cursor: 'pointer',
                                }}
                                title="عرض بالحجم الكامل"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || 'صورة سريرية'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {photo.caption && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'rgba(0,0,0,0.7)',
                                      color: '#fff',
                                      fontSize: '7px',
                                      padding: '1px',
                                      textAlign: 'center',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {photo.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          (لم يتم إرفاق صور لهذه الحالة بعد)
                        </div>
                      )}

                      {/* زر إضافة صور إضافية للحالة في أي وقت من العام */}
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <label
                          style={{
                            background: 'rgba(197,160,89,0.12)',
                            border: '1px solid rgba(197,160,89,0.4)',
                            color: '#c5a059',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'bold',
                          }}
                        >
                          <Camera size={11} />
                          <span>+ إضافة صورة للحالة</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => handleAddPhotoToExistingCase(item, e)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

        {/* عارض الصور عالي الدقة (Lightbox Modal) */}
        {activeLightboxPhoto && (
          <div
            onClick={() => setActiveLightboxPhoto(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.88)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '92vw',
                maxHeight: '85vh',
                background: '#151b12',
                border: '2px solid #c5a059',
                borderRadius: '14px',
                padding: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* شريط الإغلاق والتفاصيل */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  borderBottom: '1px solid rgba(197,160,89,0.3)',
                  paddingBottom: '8px',
                }}
              >
                <div>
                  <h5 style={{ margin: 0, color: '#c5a059', fontSize: '14px', fontWeight: 'bold' }}>
                    {activeLightboxPhoto.patientName} - {activeLightboxPhoto.categoryName}
                  </h5>
                  <span style={{ fontSize: '11px', color: '#a0a59a' }}>
                    {activeLightboxPhoto.caption} | {activeLightboxPhoto.caseDate}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={activeLightboxPhoto.url}
                    download={`Case_${activeLightboxPhoto.patientName}_${Date.now()}.jpg`}
                    style={{
                      background: '#c5a059',
                      color: '#151b12',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={12} />
                    <span>تحميل</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveLightboxPhoto(null)}
                    style={{
                      background: 'rgba(239,68,68,0.2)',
                      color: '#f87171',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    إغلاق ✕
                  </button>
                </div>
              </div>

              {/* الصورة الكبيرة */}
              <img
                src={activeLightboxPhoto.url}
                alt={activeLightboxPhoto.caption || 'صورة الحالة'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
          </div>
        )}

        {/* زر فتح شاشة الرفيق السريري الشاملة */}
        {onOpenFullCompanion && (
          <button
            type="button"
            onClick={onOpenFullCompanion}
            style={{
              background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
              color: '#151b12',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(197,160,89,0.25)',
              marginBottom: '10px',
            }}
          >
            <span>{t('companion.openFull', 'فتح شاشة الرفيق السريري الشاملة', 'Open Full Clinical Companion Screen')}</span>
            <ExternalLink size={15} />
          </button>
        )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال توليد تقرير الإنجاز السريري السنوي وتصدير PDF */}
      <ClinicalReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialCases={trueCases}
        isAuthorAdmin={isAuthorAdmin}
      />
    </div>
  );
};
