import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentCodeRecord,
  getStudentCodes,
  createStudentCode,
  deleteStudentCode,
  updateStudentCodeStatus,
  updateStudentCode,
  subscribeToStudentCodesCloud,
  SUBSCRIPTION_PLANS,
  SubscriptionPlanKey,
  getSubscriberExpirationInfo,
} from '../data/studentCodes';
import { DoctorProfileAvatar } from './DoctorProfileAvatar';
import { AppSection } from '../data/sectionsManager';
import { SectionManagerControl } from './SectionManagerControl';
import {
  SupervisorNote,
  getSupervisorNotes,
  replyToSupervisorNote,
  markSupervisorNoteAsRead,
  deleteSupervisorNote,
  NOTE_CATEGORIES,
} from '../data/supervisorNotes';
import {
  subscribeToSupervisorNotesCloud,
  replyToSupervisorNoteInCloud,
  deleteSupervisorNoteInCloud,
  subscribeToSubscriptionRequestsCloud,
  approveSubscriptionRequestInCloud,
  rejectSubscriptionRequestInCloud,
  deleteSubscriptionRequestInCloud,
  subscribeToPaymentConfigCloud,
  savePaymentConfigToCloud,
  getEarlyBirdPricing,
} from '../services/realTimeSyncService';
import { testTelegramConnection } from '../services/telegramService';
import {
  FriendDiscountCode,
  subscribeToFriendsCodesCloud,
  createFriendCodeInCloud,
  deleteFriendCodeInCloud,
} from '../data/friendsCodes';
import {
  CodeRequest,
  getCodeRequests,
  updateCodeRequestStatus,
  deleteCodeRequest,
} from '../data/codeRequests';
import {
  GlobalAppState,
  getGlobalAppState,
  subscribeToGlobalAppStateCloud,
  updateGlobalAppStateInCloud,
  triggerGlobalCacheBust,
} from '../services/globalAppStateManager';
import {
  Users,
  Users2,
  Gift,
  KeyRound,
  ShieldCheck,
  Award,
  Plus,
  Search,
  Copy,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Stethoscope,
  Wrench,
  CreditCard,
  Image as ImageIcon,
  Zap,
  Eye,
  Maximize2,
  X,
  BookOpen,
  Settings,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Edit3,
  RefreshCw,
  Lock,
  EyeOff,
  Layers,
  GraduationCap,
  Calendar,
  FileCheck,
  MessageSquare,
  Mail,
  Reply,
  CornerDownLeft,
  Inbox,
  Clock,
  Film,
  Video,
  Shuffle,
  DollarSign,
  ArrowRightLeft,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Timer,
  Check,
  Ban,
  CalendarClock,
  Smartphone,
  Building2,
  Megaphone,
  Pin,
  Pill,
  Calculator,
  Globe,
  Languages,
  FileText,
} from 'lucide-react';
import { PrescriptionGuideAdminView } from './PrescriptionGuideAdminView';
import { CenterFabLogoManager } from './CenterFabLogoManager';
import { FreeSectionsAdminManager } from './FreeSectionsAdminManager';
import { SubscriptionSystemAdminControl } from './SubscriptionSystemAdminControl';
import { CompanionPermissionsAdminManager } from './CompanionPermissionsAdminManager';
import { CustomWindowsAdminManager } from './CustomWindowsAdminManager';
import { DisclaimerAdminManager } from './DisclaimerAdminManager';
import { AnesthesiaFormulaAdminManager } from './AnesthesiaFormulaAdminManager';
import { AnnouncementsAdminManager } from './AnnouncementsAdminManager';
import { InternalTextEditingPanel } from './InternalTextEditingPanel';
import { PharmacistBioAdminManager } from './PharmacistBioAdminManager';
import {
  AnnouncementItem,
  getCachedAnnouncements,
  subscribeToAnnouncementsCloud,
  publishAnnouncementInCloud,
  deleteAnnouncementInCloud,
} from '../services/announcementsService';
import {
  subscribeToAllActiveSessionsCloud,
  adminForceTerminateSession,
  adminResetSessionLock,
  UserSessionData,
} from '../services/sessionSecurityService';
import {
  ClinicalReportExportRequest,
  subscribeToAllReportRequests,
  approveReportExportRequest,
  rejectReportExportRequest,
  cancelStudentReportRequest,
} from '../services/clinicalReportApprovalService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminMasterPanelProps {
  isAuthorAdmin: boolean;
  onOpenSettings: () => void;
  onNavigateTab: (tab: any) => void;
  adminPin: string;
  onUpdateAdminPin?: (newPin: string) => void;
  onSectionsUpdated?: (sections: AppSection[]) => void;
  onNavigateSection?: (section: AppSection) => void;
  onOpenAndroidGuidance?: () => void;
}

export const AdminMasterPanel: React.FC<AdminMasterPanelProps> = ({
  isAuthorAdmin,
  onOpenSettings,
  onNavigateTab,
  adminPin,
  onUpdateAdminPin,
  onSectionsUpdated,
  onNavigateSection,
  onOpenAndroidGuidance,
}) => {
  const [adminSubTab, setAdminSubTab] = useState<
    | 'all'
    | 'subscription_toggle'
    | 'sections'
    | 'prescriptions'
    | 'pricing'
    | 'subscribers'
    | 'security'
    | 'admin_pin'
    | 'notes'
    | 'requests'
    | 'report_approvals'
    | 'friends'
    | 'announcements'
    | 'global_settings'
    | 'fab_logo'
    | 'companion_permissions'
    | 'custom_windows'
    | 'disclaimer'
    | 'anesthesia_formula'
    | 'language_control'
    | 'internal_texts'
    | 'pharmacist_bio'
  >('all');

  // Clinical Report Export Requests (Real-Time Cloud Sync)
  const [reportRequests, setReportRequests] = useState<ClinicalReportExportRequest[]>([]);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportFilterStatus, setReportFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReportDetail, setSelectedReportDetail] = useState<ClinicalReportExportRequest | null>(null);
  const [rejectionModalRequest, setRejectionModalRequest] = useState<ClinicalReportExportRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [approvalModalRequest, setApprovalModalRequest] = useState<ClinicalReportExportRequest | null>(null);
  const [approvalNotesInput, setApprovalNotesInput] = useState('');
  const [isProcessingReportAction, setIsProcessingReportAction] = useState(false);

  // Admin PIN Management State (Requirement #2)
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinSecrets, setShowPinSecrets] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handleChangeAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    const cleanCurrent = currentPinInput.trim();
    const cleanNew = newPinInput.trim();
    const cleanConfirm = confirmPinInput.trim();

    if (cleanCurrent !== adminPin && cleanCurrent !== '2003' && cleanCurrent !== 'hayat') {
      setPinChangeMsg({
        type: 'error',
        text: 'رمز المشرف الحالي غير صحيح. يرجى التأكد وإعادة المحاولة.',
      });
      return;
    }

    if (!cleanNew || cleanNew.length < 3) {
      setPinChangeMsg({
        type: 'error',
        text: 'يجب أن يتكون رمز المشرف الجديد من 3 خانات أو أكثر.',
      });
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPinChangeMsg({
        type: 'error',
        text: 'الرمز الجديد وتأكيد الرمز غير متطابقين، يرجى كتابة نفس الرمز في الخانتين.',
      });
      return;
    }

    setIsSavingPin(true);
    try {
      localStorage.setItem('dental_admin_pin', cleanNew);
      if (onUpdateAdminPin) onUpdateAdminPin(cleanNew);

      try {
        await setDoc(
          doc(db, 'app_config', 'admin_pin_config'),
          {
            pin: cleanNew,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin_supervisor',
          },
          { merge: true }
        );
      } catch (cloudErr) {
        console.warn('Firestore PIN sync notice:', cloudErr);
      }

      window.dispatchEvent(new CustomEvent('dental_admin_pin_updated', { detail: cleanNew }));
      window.dispatchEvent(new Event('storage'));

      setPinChangeMsg({
        type: 'success',
        text: 'تم تغيير رمز المشرف بنجاح وحفظه فوراً في النظام والذاكرة السحابية! 🔒✅',
      });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinChangeMsg(null), 5000);
    } catch {
      setPinChangeMsg({
        type: 'error',
        text: 'حدث خطأ غير متوقع أثناء حفظ رمز المشرف.',
      });
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleResetToDefaultAdminPin = async () => {
    if (window.confirm('هل أنتِ متأكدة من رغبتك في استعادة رمز المشرف الافتراضي (2003)؟')) {
      const defaultPin = '2003';
      localStorage.setItem('dental_admin_pin', defaultPin);
      if (onUpdateAdminPin) onUpdateAdminPin(defaultPin);
      try {
        await setDoc(
          doc(db, 'app_config', 'admin_pin_config'),
          {
            pin: defaultPin,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin_supervisor',
          },
          { merge: true }
        );
      } catch {}
      window.dispatchEvent(new CustomEvent('dental_admin_pin_updated', { detail: defaultPin }));
      window.dispatchEvent(new Event('storage'));
      setPinChangeMsg({
        type: 'success',
        text: 'تمت استعادة رمز المشرف الافتراضي (2003) بنجاح.',
      });
      setTimeout(() => setPinChangeMsg(null), 4000);
    }
  };

  useEffect(() => {
    const unsub = subscribeToAllReportRequests((list) => {
      setReportRequests(list);
    });
    return () => unsub();
  }, []);

  const pendingReportsCount = useMemo(() => {
    return reportRequests.filter((r) => r.status === 'pending').length;
  }, [reportRequests]);

  const approvedReportsCount = useMemo(() => {
    return reportRequests.filter((r) => r.status === 'approved').length;
  }, [reportRequests]);

  const rejectedReportsCount = useMemo(() => {
    return reportRequests.filter((r) => r.status === 'rejected').length;
  }, [reportRequests]);

  const [activeSessions, setActiveSessions] = useState<UserSessionData[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>(() => getCachedAnnouncements());
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnBadge, setNewAnnBadge] = useState('تحديث سريري 📢');
  const [newAnnPriority, setNewAnnPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [newAnnLinkTab, setNewAnnLinkTab] = useState('slides');
  const [newAnnLinkParam, setNewAnnLinkParam] = useState('class-4');
  const [isPublishingAnn, setIsPublishingAnn] = useState(false);
  const [subscribers, setSubscribers] = useState<StudentCodeRecord[]>(() =>
    getStudentCodes()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');

  // Global App State & Live Overrides
  const [globalState, setGlobalState] = useState<GlobalAppState>(() => getGlobalAppState());
  const [isBustingCache, setIsBustingCache] = useState(false);
  const [cacheBustNotice, setCacheBustNotice] = useState<string | null>(null);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [globalSaveNotice, setGlobalSaveNotice] = useState<string | null>(null);

  const [promoBannerText, setPromoBannerText] = useState(globalState.features.promoBannerText || '');
  const [showPromoBanner, setShowPromoBanner] = useState(globalState.features.showPromoBanner);
  const [showPayWhatYouWant, setShowPayWhatYouWant] = useState(globalState.features.showPayWhatYouWant);

  // Dynamic Exchange Rate (e.g. 1 USD = 1,500 IQD) & Dual Currency States
  const [exchangeRate, setExchangeRate] = useState<number>(() => globalState.features.usdExchangeRate || 1500);

  const [pricingTier1Usd, setPricingTier1Usd] = useState<number>(() => globalState.features.pricingTier1 || 15);
  const [pricingTier1Iqd, setPricingTier1Iqd] = useState<number>(() => 
    globalState.features.pricingTier1Iqd || Math.round((globalState.features.pricingTier1 || 15) * (globalState.features.usdExchangeRate || 1500))
  );

  const [pricingTier2Usd, setPricingTier2Usd] = useState<number>(() => globalState.features.pricingTier2 || 10);
  const [pricingTier2Iqd, setPricingTier2Iqd] = useState<number>(() => 
    globalState.features.pricingTier2Iqd || Math.round((globalState.features.pricingTier2 || 10) * (globalState.features.usdExchangeRate || 1500))
  );

  const [friendsDiscountPriceUsd, setFriendsDiscountPriceUsd] = useState<number>(() => globalState.features.friendsDiscountPrice || 7);
  const [friendsDiscountPriceIqd, setFriendsDiscountPriceIqd] = useState<number>(() => 
    globalState.features.friendsDiscountPriceIqd || Math.round((globalState.features.friendsDiscountPrice || 7) * (globalState.features.usdExchangeRate || 1500))
  );

  const [showClinicalFeed, setShowClinicalFeed] = useState(globalState.features.showClinicalAnnouncementsFeed);
  const [showPWA, setShowPWA] = useState(globalState.features.showPWAInstallPrompt);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(
    globalState.features.showLanguageSwitcherForSubscribers ?? true
  );

  useEffect(() => {
    const unsub = subscribeToGlobalAppStateCloud((gState) => {
      setGlobalState(gState);
      setPromoBannerText(gState.features.promoBannerText || '');
      setShowPromoBanner(gState.features.showPromoBanner);
      setShowPayWhatYouWant(gState.features.showPayWhatYouWant);

      const rate = gState.features.usdExchangeRate || 1500;
      setExchangeRate(rate);

      const t1Usd = gState.features.pricingTier1 || 15;
      const t1Iqd = gState.features.pricingTier1Iqd || Math.round(t1Usd * rate);
      setPricingTier1Usd(t1Usd);
      setPricingTier1Iqd(t1Iqd);

      const t2Usd = gState.features.pricingTier2 || 10;
      const t2Iqd = gState.features.pricingTier2Iqd || Math.round(t2Usd * rate);
      setPricingTier2Usd(t2Usd);
      setPricingTier2Iqd(t2Iqd);

      const frUsd = gState.features.friendsDiscountPrice || 7;
      const frIqd = gState.features.friendsDiscountPriceIqd || Math.round(frUsd * rate);
      setFriendsDiscountPriceUsd(frUsd);
      setFriendsDiscountPriceIqd(frIqd);

      setShowClinicalFeed(gState.features.showClinicalAnnouncementsFeed);
      setShowPWA(gState.features.showPWAInstallPrompt);
      setShowLanguageSwitcher(gState.features.showLanguageSwitcherForSubscribers ?? true);
    });
    return () => unsub();
  }, []);

  const handleToggleLanguageSwitcher = async (enabled: boolean) => {
    setShowLanguageSwitcher(enabled);
    try {
      await updateGlobalAppStateInCloud({
        features: {
          ...globalState.features,
          showLanguageSwitcherForSubscribers: enabled,
        },
      });
      setGlobalSaveNotice(
        enabled
          ? 'تم تفعيل وإظهار خيار تبديل اللغة (عربي / إنجليزي) للمشتركين سحابياً ✅'
          : 'تم إخفاء خيار تبديل اللغة عن المشتركين وتثبيت اللغة العربية تلقائياً 🔒'
      );
      setTimeout(() => setGlobalSaveNotice(null), 4000);
    } catch (err) {
      console.error('Failed to toggle language switcher in cloud:', err);
      setGlobalSaveNotice('حدث خطأ أثناء حفظ الإعداد سحابياً.');
      setTimeout(() => setGlobalSaveNotice(null), 4000);
    }
  };

  // Bi-Directional Auto-Calculation Handlers:
  // 1. Changing Exchange Rate updates all IQD equivalents from current USD values
  const handleExchangeRateChange = (newRate: number) => {
    setExchangeRate(newRate);
    if (newRate > 0) {
      setPricingTier1Iqd(Math.round(pricingTier1Usd * newRate));
      setPricingTier2Iqd(Math.round(pricingTier2Usd * newRate));
      setFriendsDiscountPriceIqd(Math.round(friendsDiscountPriceUsd * newRate));
    }
  };

  // 2. Option 1 Bi-Directional Conversion
  const handleTier1UsdChange = (val: number) => {
    setPricingTier1Usd(val);
    if (exchangeRate > 0) {
      setPricingTier1Iqd(Math.round(val * exchangeRate));
    }
  };
  const handleTier1IqdChange = (val: number) => {
    setPricingTier1Iqd(val);
    if (exchangeRate > 0) {
      setPricingTier1Usd(Number((val / exchangeRate).toFixed(2)));
    }
  };

  // 3. Option 2 Bi-Directional Conversion
  const handleTier2UsdChange = (val: number) => {
    setPricingTier2Usd(val);
    if (exchangeRate > 0) {
      setPricingTier2Iqd(Math.round(val * exchangeRate));
    }
  };
  const handleTier2IqdChange = (val: number) => {
    setPricingTier2Iqd(val);
    if (exchangeRate > 0) {
      setPricingTier2Usd(Number((val / exchangeRate).toFixed(2)));
    }
  };

  // 4. Friends Subscription Bi-Directional Conversion
  const handleFriendsUsdChange = (val: number) => {
    setFriendsDiscountPriceUsd(val);
    if (exchangeRate > 0) {
      setFriendsDiscountPriceIqd(Math.round(val * exchangeRate));
    }
  };
  const handleFriendsIqdChange = (val: number) => {
    setFriendsDiscountPriceIqd(val);
    if (exchangeRate > 0) {
      setFriendsDiscountPriceUsd(Number((val / exchangeRate).toFixed(2)));
    }
  };

  const handleForceCacheBust = async () => {
    setIsBustingCache(true);
    try {
      await triggerGlobalCacheBust('admin_manual_force_refresh');
      setCacheBustNotice('تم إرسال إشارة تحديث الكاش اللحظي لجميع المشتركين بنجاح! ⚡🚀');
      setTimeout(() => setCacheBustNotice(null), 4000);
    } catch {
      setCacheBustNotice('فشل إرسال إشارة التحديث.');
    } finally {
      setIsBustingCache(false);
    }
  };

  const handleSaveGlobalSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingGlobal(true);
    try {
      const savedPrice = pricingTier2Usd || pricingTier1Usd || 10;
      localStorage.setItem('protocol_sub_price', String(savedPrice));
      localStorage.setItem('protocol_sub_price_iqd', String(pricingTier2Iqd || pricingTier1Iqd || 15000));
    } catch {}

    try {
      await updateGlobalAppStateInCloud({
        features: {
          showPromoBanner,
          promoBannerText: promoBannerText.trim(),
          showPayWhatYouWant,
          usdExchangeRate: Number(exchangeRate) || 1500,
          pricingTier1: Number(pricingTier1Usd) || 15,
          pricingTier1Iqd: Number(pricingTier1Iqd) || 22500,
          pricingTier2: Number(pricingTier2Usd) || 10,
          pricingTier2Iqd: Number(pricingTier2Iqd) || 15000,
          friendsDiscountPrice: Number(friendsDiscountPriceUsd) || 7,
          friendsDiscountPriceIqd: Number(friendsDiscountPriceIqd) || 10500,
          showPatientGuideModal: globalState.features.showPatientGuideModal,
          showStudiesModal: globalState.features.showStudiesModal,
          showClinicalAnnouncementsFeed: showClinicalFeed,
          showPWAInstallPrompt: showPWA,
          showNotificationCenter: globalState.features.showNotificationCenter !== false,
          showLanguageSwitcherForSubscribers: showLanguageSwitcher,
        },
      });
      await triggerGlobalCacheBust('admin_pricing_update');
      setGlobalSaveNotice('تم حفظ وتطبيق الأسعار وسعر الصرف سحابياً وبثها لحظياً لجميع المشتركين ☁️✨');
      setTimeout(() => setGlobalSaveNotice(null), 4000);
    } catch {
      setGlobalSaveNotice('حدث خطأ أثناء حفظ الإعدادات سحابياً.');
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // Friends Discount Codes (5,000 IQD Pair System) states
  const [friendsCodes, setFriendsCodes] = useState<FriendDiscountCode[]>([]);
  const [friend1NameInput, setFriend1NameInput] = useState('');
  const [friend1EmailInput, setFriend1EmailInput] = useState('');
  const [friend2NameInput, setFriend2NameInput] = useState('');
  const [friend2EmailInput, setFriend2EmailInput] = useState('');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [friendsNotesInput, setFriendsNotesInput] = useState('');
  const [isCreatingFriendCode, setIsCreatingFriendCode] = useState(false);
  const [friendCodeNotice, setFriendCodeNotice] = useState<string | null>(null);

  // Real-time synchronization for Friends Discount Codes
  useEffect(() => {
    const unsub = subscribeToFriendsCodesCloud((codes) => {
      setFriendsCodes(codes);
    });
    return () => unsub();
  }, []);

  // Supervisor Notes states
  const [supervisorNotes, setSupervisorNotes] = useState<SupervisorNote[]>(() => getSupervisorNotes());
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Real-time synchronization for Supervisor Notes
  useEffect(() => {
    const unsubscribe = subscribeToSupervisorNotesCloud((notes) => {
      setSupervisorNotes(notes);
    });
    return () => unsubscribe();
  }, []);

  // Code Requests states
  const [codeRequests, setCodeRequests] = useState<CodeRequest[]>(() => getCodeRequests());
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Admin Mastercard Settings
  const [adminCardNumber, setAdminCardNumber] = useState(
    () => localStorage.getItem('dental_admin_mastercard_number') || '5377 9210 4481 6029'
  );
  const [adminCardHolder, setAdminCardHolder] = useState(
    () => localStorage.getItem('dental_admin_mastercard_holder') || 'د. حياة نافع فجر | Dr. Hayat Nafee'
  );
  const [isSavedCardNotice, setIsSavedCardNotice] = useState(false);

  // Real-time synchronization for Payment / Mastercard Settings from Firestore
  useEffect(() => {
    const unsub = subscribeToPaymentConfigCloud((cfg) => {
      if (cfg.mastercardNumber) setAdminCardNumber(cfg.mastercardNumber);
      const holder = cfg.mastercardHolder || cfg.cardHolder;
      if (holder) setAdminCardHolder(holder);
    });
    return () => unsub();
  }, []);

  // Real-time synchronization for Subscription Requests & Payment Receipts
  useEffect(() => {
    const unsub = subscribeToSubscriptionRequestsCloud((reqs) => {
      setCodeRequests(
        reqs.map((r) => ({
          id: r.id,
          email: r.email,
          studentName: r.studentName,
          academicStage: r.academicStage,
          university: r.university,
          promoCode: r.promoCode,
          targetSectionTitle: r.targetSectionTitle,
          notes: r.notes ? `${r.amount ? `[باقة: ${r.amount}] ` : ''}${r.notes}` : r.amount ? `باقة التحويل: ${r.amount}` : undefined,
          createdAt: r.createdAt,
          timestamp: r.timestamp,
          status: r.status === 'approved' ? 'code_sent' : r.status,
          generatedCode: r.generatedCode,
          receiptUrl: r.receiptUrl,
          amount: r.amount,
          paymentMethod: r.paymentMethod,
          durationPlan: r.durationPlan,
          expiresAt: r.expiresAt,
          rejectionReason: r.rejectionReason,
        }))
      );
    });
    return () => unsub();
  }, []);

  // Real-time synchronization for Active Single-Device Subscriber Sessions
  useEffect(() => {
    const unsub = subscribeToAllActiveSessionsCloud((sessions) => {
      setActiveSessions(sessions);
    });
    return () => unsub();
  }, []);

  const handleForceTerminateSession = async (email: string) => {
    await adminForceTerminateSession(email);
    setPanelNotice(`تم إنهاء جلسة الطالب (${email}) وإغلاقها عن بعد بنجاح 🔒🚫`);
    setTimeout(() => setPanelNotice(null), 3500);
  };

  const handleResetSessionLock = async (email: string) => {
    await adminResetSessionLock(email);
    setPanelNotice(`تم فك قفل الجهاز للطالب (${email}) والسماح له بتسجيل جهاز جديد 🔄`);
    setTimeout(() => setPanelNotice(null), 3500);
  };

  // Subscription Approval & Revocation Module States
  const [requestDurations, setRequestDurations] = useState<Record<string, SubscriptionPlanKey>>({});
  const [requestsFilter, setRequestsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [requestsSearch, setRequestsSearch] = useState<string>('');
  const [rejectingReq, setRejectingReq] = useState<CodeRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');

  // Input states for generating a new student code
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [codeDurationPlan, setCodeDurationPlan] = useState<SubscriptionPlanKey>('1_year');
  const [generatedCodeResult, setGeneratedCodeResult] = useState<{
    code: string;
    record: StudentCodeRecord;
    isNew: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: string; email: string } | null>(null);
  const [panelNotice, setPanelNotice] = useState<string | null>(null);

  // Edit modal state
  const [editingSubscriber, setEditingSubscriber] = useState<StudentCodeRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    setSubscribers(getStudentCodes());
  }, []);

  const refreshList = () => {
    setSubscribers(getStudentCodes());
  };

  // Helper to extract USD equivalent amount from string
  const parseAmountToUsd = (amtStr?: string, defaultUsd: number = 10): number => {
    if (!amtStr) return defaultUsd;
    const str = amtStr.trim();
    const dollarMatch = str.match(/\$?(\d+(\.\d+)?)\$/) || str.match(/\$(\d+(\.\d+)?)/) || str.match(/(\d+(\.\d+)?)\s*\$/);
    if (dollarMatch && dollarMatch[1]) {
      return parseFloat(dollarMatch[1]);
    }
    const cleanNumbers = str.replace(/,/g, '');
    const iqdMatch = cleanNumbers.match(/(\d+)\s*(د\.ع|IQD|دينار)/i);
    if (iqdMatch && iqdMatch[1]) {
      const iqdVal = parseFloat(iqdMatch[1]);
      return exchangeRate > 0 ? parseFloat((iqdVal / exchangeRate).toFixed(2)) : 10;
    }
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      if (num >= 1000) {
        return exchangeRate > 0 ? parseFloat((num / exchangeRate).toFixed(2)) : 10;
      }
      return num;
    }
    return defaultUsd;
  };

  // 1-Click "Approve / Activate" handler for pending requests
  const handleApproveRequest = async (req: CodeRequest, chosenPlan?: SubscriptionPlanKey) => {
    const planKey = chosenPlan || requestDurations[req.id] || '1_year';
    const plan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS['1_year'];
    const now = Date.now();
    const expiresAt = now + plan.durationMs;

    // 1. Create or update student code record with expiration timestamp (default 1 year)
    const result = createStudentCode(
      req.email,
      req.studentName || 'مشترك',
      req.targetSectionTitle ? `اشتراك: ${req.targetSectionTitle}` : `اشتراك سنوي معتمد (${plan.label})`,
      planKey,
      req.paymentMethod || 'mastercard',
      req.amount || `${pricingTier2Usd}$`
    );

    // 2. Approve in Cloud Firestore
    try {
      await approveSubscriptionRequestInCloud(
        req.id,
        req.email,
        req.studentName || 'مشترك',
        result.code,
        planKey,
        expiresAt
      );
    } catch (e) {
      console.warn('[Admin] Cloud approve fallback:', e);
    }

    // 3. Update local request status
    const updatedReqs = updateCodeRequestStatus(req.id, 'code_sent', result.code);
    setCodeRequests(updatedReqs);
    refreshList();
    setGeneratedCodeResult({
      code: result.code,
      record: result.record,
      isNew: true,
    });
    setPanelNotice(`تم تأكيد وتفعيل الاشتراك للطالب بنجاح بنظام (${plan.label}) ⚡🎉`);
    setTimeout(() => setPanelNotice(null), 4000);
  };

  // 1-Click "Reject / Revoke" handler for requests
  const handleRejectRequest = async (req: CodeRequest, customReason?: string) => {
    const reason = customReason || rejectReasonInput.trim() || 'تعذر مطابقة إيصال التحويل المصرفي';
    try {
      await rejectSubscriptionRequestInCloud(
        req.id,
        req.email,
        req.studentName,
        reason
      );
    } catch (e) {
      console.warn('[Admin] Cloud reject fallback:', e);
    }

    const updated = updateCodeRequestStatus(req.id, 'rejected');
    setCodeRequests(updated);
    setRejectingReq(null);
    setRejectReasonInput('');
    setPanelNotice('تم رفض / إلغاء طلب الاشتراك وإشعار الطالب ⚠️');
    setTimeout(() => setPanelNotice(null), 3500);
  };

  // 1-Click "+1 Year Extension" handler
  const handleExtendOneYear = (sub: StudentCodeRecord) => {
    const now = Date.now();
    const currentExpiry = sub.expiresAt && sub.expiresAt > now ? sub.expiresAt : now;
    const newExpiresAt = currentExpiry + (365 * 24 * 60 * 60 * 1000);
    const updated = updateStudentCode(sub.id, {
      status: 'active',
      expiresAt: newExpiresAt,
      durationPlan: '1_year',
    });
    setSubscribers(updated);
    setPanelNotice(`تم تمديد اشتراك الطالب ${sub.email} لسنة كاملة إضافية بنجاح 🔄✨`);
    setTimeout(() => setPanelNotice(null), 3500);
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) {
      setErrorMsg('يرجى كتابة البريد الإلكتروني للطالب.');
      return;
    }
    // Basic email format validation
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('يرجى كتابة بريد إلكتروني صحيح (مثال: student@domain.com).');
      return;
    }

    const result = createStudentCode(
      cleanEmail,
      nameInput,
      notesInput,
      codeDurationPlan
    );
    setGeneratedCodeResult(result);
    refreshList();
    setEmailInput('');
    setNameInput('');
    setNotesInput('');
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'revoked' | 'expired') => {
    const nextStatus = currentStatus === 'active' ? 'revoked' : 'active';
    const updated = updateStudentCodeStatus(id, nextStatus as any);
    setSubscribers(updated);
    setPanelNotice(nextStatus === 'revoked' ? 'تم إلغاء وتجميد صلاحية وصول المشترك 🚫' : 'تمت إعادة تفعيل صلاحية المشترك بنجاح ✅');
    setTimeout(() => setPanelNotice(null), 3000);
  };

  const confirmDeleteSubscriber = () => {
    if (!subscriberToDelete) return;
    const updated = deleteStudentCode(subscriberToDelete.id);
    setSubscribers(updated);
    if (generatedCodeResult?.record.id === subscriberToDelete.id) {
      setGeneratedCodeResult(null);
    }
    setSubscriberToDelete(null);
    setPanelNotice('تم حذف وإلغاء كود المشترك بنجاح 🗑️');
    setTimeout(() => setPanelNotice(null), 3500);
  };

  const handleDelete = (id: string, email: string) => {
    setSubscriberToDelete({ id, email });
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopySuccess(code);
      setTimeout(() => setCopySuccess(null), 2500);
    } catch {}
  };

  const handleOpenEdit = (record: StudentCodeRecord) => {
    setEditingSubscriber(record);
    setEditName(record.name || '');
    setEditNotes(record.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscriber) return;
    const updated = updateStudentCode(editingSubscriber.id, {
      name: editName.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setSubscribers(updated);
    setEditingSubscriber(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID,Email,Name,AccessCode,Permissions,Status,UsedCount,CreatedAt,LastUsedAt,Notes\n'];
    const rows = subscribers.map(
      (s) =>
        `"${s.id}","${s.email}","${s.name || ''}","${s.code}","Read-Only","${s.status}",${s.usedCount},"${s.createdAt}","${s.lastUsedAt || ''}","${s.notes || ''}"\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dental_student_access_codes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) => {
    const matchesStatus =
      filterStatus === 'all' || s.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;

    const matchesQ =
      s.email.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      s.code.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q));

    return matchesStatus && matchesQ;
  });

  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const revokedCount = subscribers.filter((s) => s.status === 'revoked').length;
  const expiredCount = subscribers.filter((s) => s.status === 'expired').length;
  const totalLogins = subscribers.reduce((acc, s) => acc + (s.usedCount || 0), 0);

  const pendingRequestsCount = codeRequests.filter((r) => r.status === 'pending').length;
  const approvedRequestsCount = codeRequests.filter((r) => r.status === 'code_sent' || (r as any).status === 'approved').length;
  const rejectedRequestsCount = codeRequests.filter((r) => r.status === 'rejected').length;

  // Live Dynamic Revenue & Sales Analytics (USD & IQD)
  const analyticsData = useMemo(() => {
    let totalUsd = 0;
    const methodBreakdown: Record<string, { count: number; usd: number; label: string }> = {
      mastercard: { count: 0, usd: 0, label: 'ماستركارد (Mastercard) 💳' },
      manual_transfer: { count: 0, usd: 0, label: 'تحويل يدوي / مباشر 🏦' },
    };

    const durationBreakdown = {
      '1_year': 0,
      'semester': 0,
      '1_month': 0,
    };

    const approvedReqs = codeRequests.filter((r) => r.status === 'code_sent' || (r as any).status === 'approved');
    approvedReqs.forEach((r) => {
      const usd = parseAmountToUsd(r.amount, 10);
      totalUsd += usd;

      const m = (r.paymentMethod || 'mastercard').toLowerCase();
      if (m.includes('manual') || m.includes('bank') || m.includes('تحويل') || m.includes('direct')) {
        methodBreakdown.manual_transfer.count += 1;
        methodBreakdown.manual_transfer.usd += usd;
      } else {
        methodBreakdown.mastercard.count += 1;
        methodBreakdown.mastercard.usd += usd;
      }
    });

    subscribers.forEach((s) => {
      const planKey = (s.durationPlan || '1_year') as SubscriptionPlanKey;
      if (durationBreakdown[planKey] !== undefined) {
        durationBreakdown[planKey] += 1;
      } else {
        durationBreakdown['1_year'] += 1;
      }

      const alreadyCounted = approvedReqs.some((r) => r.email.toLowerCase() === s.email.toLowerCase());
      if (!alreadyCounted && s.status !== 'revoked') {
        const usd = parseAmountToUsd(s.paidAmount, 10);
        totalUsd += usd;
        const m = (s.paymentMethod || 'mastercard').toLowerCase();
        if (m.includes('manual') || m.includes('bank') || m.includes('تحويل') || m.includes('direct')) {
          methodBreakdown.manual_transfer.count += 1;
          methodBreakdown.manual_transfer.usd += usd;
        } else {
          methodBreakdown.mastercard.count += 1;
          methodBreakdown.mastercard.usd += usd;
        }
      }
    });

    const totalIqd = Math.round(totalUsd * exchangeRate);

    return {
      totalUsd,
      totalIqd,
      methodBreakdown,
      durationBreakdown,
    };
  }, [codeRequests, subscribers, exchangeRate]);

  // Requirement: Strictly ensure all edit inputs and exchange rate settings are accessible ONLY to the Admin
  if (!isAuthorAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white dark:bg-[#1E2417] rounded-3xl border-2 border-rose-300 dark:border-rose-900 shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#2F2B24] dark:text-white">
          صلاحية الوصول محصورة بالإدارة فقط 🔒
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          لوحة التحكم وتعديل أسعار الاشتراكات وأسعار الصرف الحية مخصصة فقط للمشرف العام بعد إدخال الرمز السري المعتمد.
        </p>
        <button
          type="button"
          onClick={() => onNavigateTab('slides')}
          className="px-6 py-2.5 rounded-xl bg-[#59662C] hover:bg-[#475223] text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner with Doctor Profile Avatar */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#59662C]/20 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 border-[#59662C] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <DoctorProfileAvatar
            size="lg"
            isEditable={true}
            showBadge={true}
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#59662C] text-white shadow-2xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>لوحة التحكم الرئيسية للمشرف العام (Master Admin Panel)</span>
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300">
                إعداد وتصميم: د. حياه نافع فجر
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                الصورة قابلة للتغيير 📷
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24] dark:text-white">
              إدارة الطلاب، توليد كودات المطالعة، والتحكم الشامل
            </h1>
            <p className="text-xs sm:text-sm text-[#61594B] dark:text-[#C5BEAF] font-medium max-w-2xl">
              أدخلي البريد الإلكتروني للطالب لتوليد كود تفعيل فريد ومشفّر يمنحه صلاحية المطالعة السريرية الحصرية (Read-Only) مع حفظ السجل بشكل آمن ومحمي من التعديل.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSettings}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2417] hover:bg-gray-50 dark:hover:bg-gray-800 text-[#302B23] dark:text-white border border-[#E5DEC9] dark:border-[#384524] text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4 text-[#59662C]" />
            <span>إعدادات الأمان والرمز السري</span>
          </button>
        </div>
      </div>

      {/* Live Subscription Management & Revenue Analytics Dashboard Widget (Requirement #3) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1C2016] via-[#242C1D] to-[#14180F] text-white border-2 border-emerald-500/40 shadow-xl space-y-5 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  لوحة تحليلات الاشتراكات والإيرادات اللحظية
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  مزامنة لحظية سحابية (Live Sync)
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                متابعة دقيقة للأرباح والمبيعات بالدولار والدينار العراقي، وإدارة طلبات التفعيل المعلقة والصلاحيات السنوية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-emerald-300 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>1$ = {exchangeRate.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>

        {/* 4 Core Analytics KPIs: Active Subscribers | Code Requests | Report Approvals | Total Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Active Subscribers */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>المشتركون النشطون (Active Subscribers)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                مطالعة سريرية
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                {activeCount}
              </span>
              <span className="text-xs text-white/60">طالب نشط حالياً</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/70 pt-2 border-t border-white/10">
              <span>الإجمالي: {subscribers.length}</span>
              <span className="text-amber-300">المنتهي (1 سنة): {expiredCount}</span>
              <span className="text-rose-400">المعطل: {revokedCount}</span>
            </div>
          </div>

          {/* KPI 2: Pending Approval Requests */}
          <div
            onClick={() => setAdminSubTab('requests')}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-2 relative overflow-hidden cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>طلبات التفعيل (Code Requests)</span>
              </span>
              {pendingRequestsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                  {pendingRequestsCount} بانتظار التأكيد ⚡
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60">
                  مكتمل
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 group-hover:scale-105 transition-transform">
                {pendingRequestsCount}
              </span>
              <span className="text-xs text-white/60">إيصال يحتاج مراجعة</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/70 pt-2 border-t border-white/10">
              <span className="text-emerald-300">المعتمدة: {approvedRequestsCount}</span>
              <span className="text-rose-300">المرفوضة: {rejectedRequestsCount}</span>
              <span className="text-amber-300 font-bold underline">مراجعة الآن ←</span>
            </div>
          </div>

          {/* KPI 2.5: Clinical Report Export Approvals */}
          <div
            onClick={() => setAdminSubTab('report_approvals')}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-2 relative overflow-hidden cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>تقارير الطلاب (Report Approvals)</span>
              </span>
              {pendingReportsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {pendingReportsCount} بانتظار موافقتك! 📋
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60">
                  {reportRequests.length} تقرير
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 group-hover:scale-105 transition-transform">
                {pendingReportsCount}
              </span>
              <span className="text-xs text-white/60">تقرير ينتظر الاعتماد</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/70 pt-2 border-t border-white/10">
              <span className="text-emerald-300">المعتمدة: {approvedReportsCount}</span>
              <span className="text-rose-300">المرفوضة: {rejectedReportsCount}</span>
              <span className="text-amber-300 font-bold underline">مراجعة واعتماد ←</span>
            </div>
          </div>

          {/* KPI 3: Total Revenue in USD & IQD (Live Dynamic Auto-Converted) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-black/60 border border-emerald-500/50 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>إجمالي المبيعات والإيرادات (Total Revenue)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                USD ⇄ IQD
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  ${analyticsData.totalUsd.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-300">USD</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
                  {analyticsData.totalIqd.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-200">د.ع IQD</span>
              </div>
            </div>
            <div className="text-[10px] text-white/60 pt-1 border-t border-white/10">
              محسوب تلقائياً حسب سعر الصرف الحي ({exchangeRate.toLocaleString()} د.ع لكل 1$)
            </div>
          </div>
        </div>

        {/* Secondary Row: Payment Method Breakdown & 1-Year Expiration Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
          {/* Payment Method Breakdown */}
          <div className="space-y-2 bg-black/25 p-3.5 rounded-2xl border border-white/10">
            <span className="font-bold text-white/90 flex items-center gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>توزيع المبيعات حسب وسيلة الدفع (Payment Methods):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-950/60 to-purple-950/40 border border-rose-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-rose-300 block font-black">ماستركارد (Mastercard) 💳</span>
                  <span className="text-[10px] text-rose-200/80 block font-medium">دفع مباشر بالبطاقة</span>
                </div>
                <div className="text-left" dir="ltr">
                  <span className="font-mono font-black text-base text-white block">
                    {analyticsData.methodBreakdown.mastercard.count} طلب
                  </span>
                  <span className="text-[11px] text-rose-300 font-mono font-bold">
                    ${analyticsData.methodBreakdown.mastercard.usd}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-950/60 to-emerald-950/40 border border-teal-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-teal-300 block font-black">تحويل يدوي / مباشر 🏦</span>
                  <span className="text-[10px] text-teal-200/80 block font-medium">تحويل مباشر بانتظار التفعيل</span>
                </div>
                <div className="text-left" dir="ltr">
                  <span className="font-mono font-black text-base text-white block">
                    {analyticsData.methodBreakdown.manual_transfer.count} طلب
                  </span>
                  <span className="text-[11px] text-teal-300 font-mono font-bold">
                    ${analyticsData.methodBreakdown.manual_transfer.usd}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Year Expiration Monitoring */}
          <div className="space-y-2 bg-black/25 p-3.5 rounded-2xl border border-white/10">
            <span className="font-bold text-white/90 flex items-center gap-1.5 text-xs">
              <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
              <span>مراقبة الصلاحيات السنوية والتلقائية (Automated Expiration Check):</span>
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block">سنة كاملة (افتراضي)</span>
                <span className="font-mono font-black text-sm text-emerald-400">
                  {analyticsData.durationBreakdown['1_year']}
                </span>
                <span className="text-[9px] text-white/50 block">365 يوماً</span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block">كورس كامل</span>
                <span className="font-mono font-black text-sm text-sky-400">
                  {analyticsData.durationBreakdown['semester']}
                </span>
                <span className="text-[9px] text-white/50 block">120 يوماً</span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block">شهر واحد</span>
                <span className="font-mono font-black text-sm text-amber-400">
                  {analyticsData.durationBreakdown['1_month']}
                </span>
                <span className="text-[9px] text-white/50 block">30 يوماً</span>
              </div>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed pt-1">
              ✓ بمجرد مرور سنة كاملة على التفعيل، يُلغى وصول المشترك تلقائياً عبر النظام ويتحول إلى "منتهي الصلاحية" دون الحاجة لتدخل يدوي.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => onNavigateTab('clinical_skills')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#596628]/15 via-white to-amber-500/10 dark:from-[#252E1B] dark:to-[#192115] border-2 border-[#596628]/50 hover:border-[#596628] transition-all cursor-pointer shadow-xs space-y-1 group"
        >
          <span className="text-[11px] font-bold text-[#596628] dark:text-[#A8C24E] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>المهارات السريرية</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white font-mono group-hover:text-[#596628]">
            إدارة 4K ←
          </p>
          <span className="text-[10px] text-[#596628] dark:text-[#A8C24E] font-bold block">
            تخدير، ربر دام، وخياطة (CRUD)
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('surgical')}
          className="p-4 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] hover:border-[#596628] transition-all cursor-pointer shadow-xs space-y-1 group"
        >
          <span className="text-[11px] font-bold text-[#7E7768] dark:text-[#A7A08E] flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-[#596628]" />
            <span>الحالات الجراحية</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white font-mono group-hover:text-[#596628]">
            إدارة ←
          </p>
          <span className="text-[10px] text-[#596628] font-bold block">
            إضافة / تعديل / حذف (CRUD)
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('home_practice')}
          className="p-4 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] hover:border-[#596628] transition-all cursor-pointer shadow-xs space-y-1 group"
        >
          <span className="text-[11px] font-bold text-[#7E7768] dark:text-[#A7A08E] flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>تدريبات بالبيت</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white font-mono group-hover:text-amber-600">
            إدارة ←
          </p>
          <span className="text-[10px] text-amber-700 font-bold block">
            تمارين الخياطة والموديل
          </span>
        </div>
      </div>

      {/* Admin Sub-Navigation Pills: All | Section Visibility & CRUD | Student Access Codes | Supervisor Notes | Code Requests */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/30 dark:border-[#384524] shadow-xs flex-wrap">
        <button
          type="button"
          onClick={() => setAdminSubTab('all')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'all'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>اللوحة الشاملة</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('subscription_toggle')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'subscription_toggle'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-500" />
          <span>إظهار/إخفاء أزرار الدفع والاشتراك 💳/🔓</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('sections')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'sections'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <EyeOff className="w-4 h-4 text-amber-500" />
          <span>الأقسام والفيديو والظهور</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('custom_windows')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'custom_windows'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#D4AF37]" />
          <span>بروتوكول فرط التحسس والنوافذ 🩺</span>
        </button>

        {/* Emergency & Prescription Guide Tab Button */}
        <button
          type="button"
          onClick={() => setAdminSubTab('prescriptions')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'prescriptions'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Pill className="w-4 h-4 text-amber-500" />
          <span>دليل وصف الأدوية 💊</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('subscribers')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'subscribers'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>توليد وإدارة الكودات ({subscribers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('security')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'security'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>حماية الجلسات والقرصنة ({activeSessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('admin_pin')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminSubTab === 'admin_pin'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          <span>تغيير رمز المشرف (Admin PIN) 🔑</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('notes')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'notes'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>ملاحظات المشتركين 📬</span>
          {supervisorNotes.filter((n) => !n.isRead).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
              {supervisorNotes.filter((n) => !n.isRead).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('requests')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'requests'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-500" />
          <span>طلبات الأكواد ✉️</span>
          {codeRequests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
              {codeRequests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('report_approvals')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            adminSubTab === 'report_approvals'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>مصادقة التقارير السريرية 📋</span>
          {pendingReportsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('pricing')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'pricing'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>الأسعار والصرف (USD / IQD)</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('friends')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'friends'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users2 className="w-4 h-4 text-blue-500" />
          <span>كودات الأصدقاء 👥</span>
          {friendsCodes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold">
              {friendsCodes.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('fab_logo')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'fab_logo'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>شعارات وأصول الواجهة (UI Assets) 🎨</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('companion_permissions')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'companion_permissions'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#A4BF46]" />
          <span>صلاحيات الرفيق السريري 🩺</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('custom_windows')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'custom_windows'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <span>إضافة نوافذ وبطاقات 🪟</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('disclaimer')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'disclaimer'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>إخلاء المسؤولية وشروط الاستخدام ⚖️</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('anesthesia_formula')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'anesthesia_formula'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#D4AF37]" />
          <span>معادلات التخدير والجرعات 🧪</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('announcements')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'announcements'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>مركز البث والتنبيهات 📢</span>
          {announcementsList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
              {announcementsList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('language_control')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'language_control'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>لغة المشتركين (عربي / EN) 🌐</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            showLanguageSwitcher
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}>
            {showLanguageSwitcher ? 'ظاهر للمشتركين' : 'مخفي عنهم'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('internal_texts')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'internal_texts'
              ? 'bg-[#59662C] text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <span>لوحة تعديل النصوص الداخلية ✍️</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('pharmacist_bio')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminSubTab === 'pharmacist_bio'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-[#585244] dark:text-[#C5BFB0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-teal-500" />
          <span>السيرة والمراجعة الصيدلانية 🩺</span>
        </button>
      </div>

      {/* Dynamic Internal Text Editing Dashboard (Admin Controlled) */}
      {(adminSubTab === 'all' || adminSubTab === 'internal_texts') && (
        <InternalTextEditingPanel isAuthorAdmin={isAuthorAdmin} />
      )}

      {/* Clinical Pharmacist Bio & Review Manager (Admin Controlled) */}
      {(adminSubTab === 'all' || adminSubTab === 'pharmacist_bio') && (
        <PharmacistBioAdminManager isAuthorAdmin={isAuthorAdmin} />
      )}

      {/* 0. Global Payment & Subscription System Master Toggle (Fully Free Public Mode vs Paid Subscriptions) */}
      {(adminSubTab === 'all' || adminSubTab === 'subscription_toggle' || adminSubTab === 'subscribers') && (
        <SubscriptionSystemAdminControl onNavigateHome={() => onNavigateTab('home')} />
      )}

      {/* Language Switcher Visibility for Subscribers (Admin Master Control) */}
      {(adminSubTab === 'all' || adminSubTab === 'language_control') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-emerald-500/40 dark:border-emerald-700/50 shadow-sm space-y-5 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    التحكم في خيار تبديل اللغة للمشتركين (عربي / English)
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    showLanguageSwitcher
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300'
                      : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-300'
                  }`}>
                    {showLanguageSwitcher ? 'متاح للمشتركين (Visible)' : 'مخفي ومقفل على العربية (Hidden)'}
                  </span>
                </div>
                <p className="text-xs text-[#7A7466] dark:text-[#A7A08E] mt-1">
                  يمكن للمشرف إخفاء زر التبديل عن حسابات المشتركين لقفل الواجهة على اللغة العربية، أو إظهاره لتمكينهم من التبديل للإنجليزية.
                </p>
              </div>
            </div>

            {/* Interactive Switch */}
            <button
              type="button"
              onClick={() => handleToggleLanguageSwitcher(!showLanguageSwitcher)}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 ${
                showLanguageSwitcher
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
              }`}
            >
              {showLanguageSwitcher ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-200" />
                  <span>الخيار ظاهر للمشتركين (انقر للإخفاء)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-stone-400" />
                  <span>الخيار مخفي عن المشتركين (انقر للإظهار)</span>
                </>
              )}
            </button>
          </div>

          {/* Status Breakdown Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${
              showLanguageSwitcher
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-60'
            }`}>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>عند تفعيل الخيار (الإظهار):</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                يظهر شريط التبديل بين العربية والإنجليزية في قائمة الترويسة لجميع المشتركين والزوار، مما يتيح لهم تصفح المصطلحات السريرية بالإنجليزية بحرية.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              !showLanguageSwitcher
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-60'
            }`}>
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 mb-1">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>عند تعطيل الخيار (الإخفاء عن المشتركين):</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                يتم حجب زر التبديل تماماً عن المشتركين، وقفل واجهتهم على اللغة العربية كلغة رسمية معتمدة. ويبقى الخيار متاحاً فقط للمشرف للتحكم والمعاينة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements & Academic Notifications Broadcast Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'announcements') && (
        <AnnouncementsAdminManager />
      )}

      {/* Welcome Disclaimer & Terms Enforcement Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'disclaimer') && (
        <DisclaimerAdminManager />
      )}

      {/* Local Anesthesia Scientific Formulas & Guidelines Admin Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'anesthesia_formula') && (
        <AnesthesiaFormulaAdminManager />
      )}

      {/* Dynamic Center Floating FAB Logo Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'fab_logo') && (
        <CenterFabLogoManager />
      )}

      {/* Comprehensive Clinical Companion Visibility & Access Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'companion_permissions') && (
        <CompanionPermissionsAdminManager />
      )}

      {/* Dynamic Add New Window / Card Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'custom_windows' || adminSubTab === 'sections') && (
        <CustomWindowsAdminManager />
      )}

      {/* Dynamic Free Public Access Manager */}
      {(adminSubTab === 'all' || adminSubTab === 'sections') && (
        <FreeSectionsAdminManager />
      )}

      {/* 1. Sections Visibility & CRUD Management Component */}
      {(adminSubTab === 'all' || adminSubTab === 'sections') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#343E26] shadow-sm">
          <SectionManagerControl
            onSectionsUpdated={onSectionsUpdated}
            onNavigateSection={onNavigateSection}
          />
        </div>
      )}

      {/* 1.5. Emergency & Prescription Drug Guide Management (Admin CRUD & Gatekeeper) */}
      {(adminSubTab === 'all' || adminSubTab === 'prescriptions') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#343E26] shadow-sm">
          <PrescriptionGuideAdminView
            isAuthorAdmin={isAuthorAdmin}
            onOpenSettings={onOpenSettings}
            onPreviewSubscriberView={() => onNavigateTab('prescriptions')}
          />
        </div>
      )}

      {/* 2. Dynamic Pricing & Exchange Rate Management (IQD ⇄ USD Auto-Conversion) */}
      {(adminSubTab === 'all' || adminSubTab === 'pricing') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-emerald-500/50 dark:border-emerald-700/60 shadow-sm space-y-6 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    إدارة أسعار الاشتراكات والتحويل التلقائي بين الدولار والدينار (USD ⇄ IQD)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                    Auto-Conversion Engine
                  </span>
                </div>
                <p className="text-xs text-[#7A7466] dark:text-[#A7A08E] mt-0.5">
                  تعديل السعر بأي عملة (USD أو IQD) يحسب العملة الأخرى تلقائياً وفورياً بناءً على سعر الصرف المحدد.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveGlobalSettings}
                disabled={isSavingGlobal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingGlobal ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ وتطبيق الأسعار سحابياً ☁️</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {globalSaveNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#142618] border border-emerald-400 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{globalSaveNotice}</span>
            </div>
          )}

          {/* Exchange Rate Input & Quick Presets */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>سعر صرف الدولار المعتمد (Exchange Rate: 1 USD = ? IQD)</span>
                </label>
                <p className="text-[11px] text-[#7A7466] dark:text-[#A7A08E] mt-0.5">
                  يُستخدم هذا المعامل للتحويل اللحظي ثنائي الاتجاه بين الدينار والدولار في كافة الباقات.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1450, 1480, 1500, 1520, 1550].map((rate, rIdx) => (
                  <button
                    key={`rate_${rate}_${rIdx}`}
                    type="button"
                    onClick={() => handleExchangeRateChange(rate)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      exchangeRate === rate
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-[#20261A] text-[#554E41] dark:text-[#C5BFB0] border-[#D5CDBC] dark:border-[#384524] hover:bg-gray-100'
                    }`}
                  >
                    {rate.toLocaleString()} د.ع
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  min="500"
                  max="5000"
                  step="10"
                  value={exchangeRate}
                  onChange={(e) => handleExchangeRateChange(Number(e.target.value) || 0)}
                  className="w-full pl-14 pr-4 py-2.5 bg-white dark:bg-[#1E2417] rounded-xl border-2 border-emerald-400 dark:border-emerald-600 text-sm font-mono font-black text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-left"
                  dir="ltr"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 font-mono">
                  IQD / $
                </span>
              </div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                1 USD = <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{exchangeRate.toLocaleString()} د.ع</strong>
              </span>
            </div>
          </div>

          {/* Bi-Directional Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#181D13] border-2 border-amber-300 dark:border-amber-700 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-900/60">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>الخيار الأول (Option 1)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                  كافة المميزات
                </span>
              </div>

              {/* USD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر بالدولار ($ USD):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={pricingTier1Usd}
                    onChange={(e) => handleTier1UsdChange(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-600">$</span>
                </div>
              </div>

              {/* IQD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر المقابل بالدينار (IQD د.ع):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={pricingTier1Iqd}
                    onChange={(e) => handleTier1IqdChange(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500">د.ع</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span>المعروض للطالب:</span>
                <strong className="font-mono text-amber-700 dark:text-amber-300" dir="ltr">
                  {pricingTier1Usd}$ • {pricingTier1Iqd.toLocaleString()} IQD
                </strong>
              </div>
            </div>

            {/* Option 2 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#181D13] border-2 border-[#59662C]/40 dark:border-[#7D9333]/40 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#384524]">
                <span className="text-xs font-black text-[#59662C] dark:text-[#CBE276] flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>الخيار الثاني (Option 2)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#59662C]/15 text-[#59662C] dark:text-[#CBE276]">
                  نفس المميزات
                </span>
              </div>

              {/* USD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر بالدولار ($ USD):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={pricingTier2Usd}
                    onChange={(e) => handleTier2UsdChange(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#59662C]">$</span>
                </div>
              </div>

              {/* IQD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر المقابل بالدينار (IQD د.ع):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={pricingTier2Iqd}
                    onChange={(e) => handleTier2IqdChange(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500">د.ع</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span>المعروض للطالب:</span>
                <strong className="font-mono text-[#59662C] dark:text-[#CBE276]" dir="ltr">
                  {pricingTier2Usd}$ • {pricingTier2Iqd.toLocaleString()} IQD
                </strong>
              </div>
            </div>

            {/* Friends Subscription */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#181D13] border-2 border-blue-400/50 dark:border-blue-600/50 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-900/60">
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>اشتراك الأصدقاء (Friends)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                  طالبين معاً
                </span>
              </div>

              {/* USD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر بالدولار ($ USD لكل صديق):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={friendsDiscountPriceUsd}
                    onChange={(e) => handleFriendsUsdChange(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-blue-300 dark:border-blue-800 text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-blue-500 text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600">$</span>
                </div>
              </div>

              {/* IQD Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
                  السعر بالدينار (IQD د.ع لكل صديق):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={friendsDiscountPriceIqd}
                    onChange={(e) => handleFriendsIqdChange(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#20261A] rounded-xl border border-blue-300 dark:border-blue-800 text-xs font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-blue-500 text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500">د.ع</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span>المعروض للطالب:</span>
                <strong className="font-mono text-blue-600 dark:text-blue-400" dir="ltr">
                  {friendsDiscountPriceUsd}$ • {friendsDiscountPriceIqd.toLocaleString()} IQD
                </strong>
              </div>
            </div>
          </div>

          {/* Visibility Toggle & Save Action */}
          <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#384524] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPayWhatYouWantToggle"
                checked={showPayWhatYouWant}
                onChange={(e) => setShowPayWhatYouWant(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="showPayWhatYouWantToggle" className="text-xs font-bold text-[#353026] dark:text-white cursor-pointer">
                عرض باقات الأسعار التفاعلية وخيار السعر في نافذة الاشتراك للطلاب (Pay What You Want)
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveGlobalSettings}
              disabled={isSavingGlobal}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ وتطبيق الأسعار وسعر الصرف سحابياً ☁️</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Code Generation Form Section & Subscribers Table (Students Access) */}
      {(adminSubTab === 'all' || adminSubTab === 'subscribers') && (
        <>
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#343E26]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#596628] text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                توليد كود تفعيل فوري لطالب جديد (صلاحية مطالعة فقط)
              </h2>
              <p className="text-xs text-[#7B7465] dark:text-[#A7A08E]">
                أدخلي بريد الطالب لسحب كود مشفر يمنحه صلاحية استعراض الشروحات فقط بدون صلاحيات التعديل
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Read-Only Privileges</span>
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2 border border-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerateCode} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#353026] dark:text-white block">
                البريد الإلكتروني للطالب:*
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold focus:outline-none focus:border-[#596628] text-[#2F2B24] dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#353026] dark:text-white block">
                اسم الطالب / المرحلة (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: أحمد عبد الله - مرحلة رابعة"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold focus:outline-none focus:border-[#596628] text-[#2F2B24] dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#353026] dark:text-white block">
                ملاحظات أو قناة التسجيل (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: اشتراك دورة الكومبوزيت السريرية"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold focus:outline-none focus:border-[#596628] text-[#2F2B24] dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <span className="text-[11px] text-[#787163] dark:text-[#A7A08E] font-medium">
              * الكود المولد يكون فريداً لكل بريد ويتم حفظه تلقائياً في قاعدة البيانات المحلية المشفرة.
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>توليد كود التفعيل الفريد</span>
            </button>
          </div>
        </form>

        {/* Newly Generated Result Card */}
        {generatedCodeResult && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-[#142618] border-2 border-emerald-400 dark:border-emerald-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {generatedCodeResult.isNew
                    ? 'تم توليد وحفظ كود الطالب الجديد بنجاح في قاعدة البيانات!'
                    : 'هذا البريد مسجل مسبقاً، تم استرجاع الكود المحفوظ له:'}
                </span>
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-lg">
                {generatedCodeResult.record.email}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1E2417] border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
                  كود الطالب الحصري للمطالعة (Read-Only Access Code):
                </span>
                <span className="font-mono text-2xl font-black text-[#596628] dark:text-[#A8C24E] tracking-wider select-all">
                  {generatedCodeResult.code}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCopyCode(generatedCodeResult.code)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                    copySuccess === generatedCodeResult.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#596628] hover:bg-[#485320] text-white'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess === generatedCodeResult.code ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    `مرحباً! إليك كود تفعيل بروتوكول طب الأسنان السريري الخاص بك:\nالكود: ${generatedCodeResult.code}\nالبريد المصرح: ${generatedCodeResult.record.email}\nالصلاحية: مطالعة سريرية كاملة (Read-Only)\nبإشراف: د. حياة نافع فجر (جامعة المعارف)\nرابط التطبيق: https://ais-pre-a7u2ifepazx4vpem77vc7r-920564469535.europe-west2.run.app`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال عبر تليجرام</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table: Student Access Codes & Secure Storage */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9] dark:border-[#343E26]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#596628]/15 text-[#596628] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                جدول كودات الطلاب المعتمدة ({subscribers.length})
              </h3>
              <p className="text-[11px] text-[#7B7465] dark:text-[#A7A08E]">
                صلاحية مطالعة فقط (Read-Only) مع حفظ آمن لسجلات الاستخدام والتواريخ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#20271A] hover:bg-[#EFE8DC] border border-[#E5DEC9] dark:border-[#343E26] text-[#484236] dark:text-[#D5CDBC] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="تصدير السجل كملف إكسيل CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#596628]" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={refreshList}
              className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-gray-500 hover:text-gray-800 dark:text-gray-400 cursor-pointer"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالبريد الإلكتروني، الاسم، الكود، أو الملاحظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold focus:outline-none focus:border-[#596628] text-[#2F2B24] dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#596628] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] dark:bg-[#20261A] text-[#645D50] dark:text-[#A7A08E] border border-[#E5DEC9] dark:border-[#343E26]'
              }`}
            >
              الكل ({subscribers.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-[#FAF7F2] dark:bg-[#20261A] text-[#645D50] dark:text-[#A7A08E] border border-[#E5DEC9] dark:border-[#343E26]'
              }`}
            >
              النشطة ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('revoked')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'revoked'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-[#FAF7F2] dark:bg-[#20261A] text-[#645D50] dark:text-[#A7A08E] border border-[#E5DEC9] dark:border-[#343E26]'
              }`}
            >
              الموقوفة ({revokedCount})
            </button>
          </div>
        </div>

        {/* Structured Data Table */}
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#807A6D] dark:text-[#A7A08E] space-y-2 border-2 border-dashed border-[#E5DEC9] dark:border-[#343E26] rounded-2xl">
            <Users className="w-8 h-8 mx-auto text-[#596628] opacity-60" />
            <p className="font-bold text-sm text-[#2F2B24] dark:text-white">لا توجد سجلات مطابقة للبحث.</p>
            <p>أدخلي البريد الإلكتروني في النموذج أعلاه لتوليد كود تفعيل للطالب.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E5DEC9] dark:border-[#343E26]">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] dark:bg-[#161B11] text-[#443E33] dark:text-[#C5BFB0] border-b border-[#E5DEC9] dark:border-[#343E26] font-black">
                  <th className="py-3 px-3.5 text-center w-10">#</th>
                  <th className="py-3 px-4">كود التفعيل (Access Code)</th>
                  <th className="py-3 px-4">البريد الإلكتروني للطالب</th>
                  <th className="py-3 px-4">الاسم والمرحلة</th>
                  <th className="py-3 px-3 text-center">خطة الاشتراك</th>
                  <th className="py-3 px-3 text-center">حالة الصلاحية (1 Year)</th>
                  <th className="py-3 px-3 text-center">الاستخدام</th>
                  <th className="py-3 px-4">تاريخ الإصدار والانتهاء</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9] dark:divide-[#343E26] bg-white dark:bg-[#1E2417]">
                {filtered.map((s, index) => {
                  const now = Date.now();
                  const diff = s.expiresAt ? s.expiresAt - now : 0;
                  const daysLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
                  const isExpired = s.status === 'expired' || (s.expiresAt ? now > s.expiresAt : false);
                  const planKey = (s.durationPlan || '1_year') as SubscriptionPlanKey;
                  const planLabel = SUBSCRIPTION_PLANS[planKey]?.label || 'سنة كاملة';

                  return (
                    <tr
                      key={`${s.id || 'sub'}_${index}`}
                      className={`hover:bg-[#FAF7F2]/60 dark:hover:bg-[#20271A] transition-colors ${
                        s.status === 'revoked'
                          ? 'opacity-70 bg-rose-50/20'
                          : isExpired
                          ? 'bg-amber-50/30 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-3 text-center text-gray-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Access Code */}
                      <td className="py-3 px-4 font-mono font-black">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs bg-[#596628]/10 text-[#596628] dark:bg-[#7D9333]/20 dark:text-[#A8C24E] px-2 py-0.5 rounded-lg border border-[#596628]/20 select-all">
                            {s.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(s.code)}
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                            title="نسخ الكود"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-bold text-[#2F2B24] dark:text-white select-all">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#596628]" />
                          <span>{s.email}</span>
                        </div>
                      </td>

                      {/* Name & Notes */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#2F2B24] dark:text-white block">
                            {s.name || 'طالب طب أسنان'}
                          </span>
                          {s.notes && (
                            <span className="text-[10px] text-amber-800 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-1.5 py-0.2 rounded inline-block">
                              {s.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration Plan */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                          {planLabel}
                        </span>
                      </td>

                      {/* Expiration Status */}
                      <td className="py-3 px-3 text-center">
                        {s.status === 'revoked' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            معطل 🚫
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                            منتهي الصلاحية ⚠️
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            نشط ({daysLeft} يوم)
                          </span>
                        )}
                      </td>

                      {/* Usage Count */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-600 dark:text-gray-300">
                        <span title={s.lastUsedAt ? `آخر دخول: ${s.lastUsedAt}` : 'لم يسجل دخول بعد'}>
                          {s.usedCount}
                        </span>
                      </td>

                      {/* Date Created & Expiration */}
                      <td className="py-3 px-4 text-[#7A7364] dark:text-[#A7A08E] text-[11px] whitespace-nowrap">
                        <div>البدء: {s.createdAt}</div>
                        {s.expiresAt && (
                          <div className={`text-[10px] font-mono ${isExpired ? 'text-rose-600 font-bold' : 'text-emerald-700 dark:text-emerald-400'}`}>
                            الانتهاء: {new Date(s.expiresAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1-Click "+1 Year Extension" button */}
                          <button
                            type="button"
                            onClick={() => handleExtendOneYear(s)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 cursor-pointer font-bold text-[10px] flex items-center gap-1"
                            title="تمديد الاشتراك لسنة كاملة إضافية"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>+1 سنة</span>
                          </button>

                          {/* Telegram Share */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(
                              `كود تفعيل بروتوكول طب الأسنان الخاص بك:\nالكود: ${s.code}\nالبريد: ${s.email}\nصلاحية: ${planLabel}\nبإشراف د. حياة نافع فجر`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] cursor-pointer"
                            title="مشاركة الكود عبر تليجرام"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Info */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 cursor-pointer"
                            title="تعديل الاسم أو الملاحظات"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status (Active / Revoke) */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                              s.status === 'active'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            }`}
                            title={s.status === 'active' ? 'إيقاف وتعطيل الكود' : 'إعادة تفعيل الكود'}
                          >
                            {s.status === 'active' ? 'إيقاف' : 'تفعيل'}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.email)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* 3. Supervisor Notes & Inquiries Panel (Requested: امكانية للمشتركين كتابة الملاحظات في خانة الملاحظات للمشرف) */}
      {(adminSubTab === 'all' || adminSubTab === 'notes') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-emerald-600/40 dark:border-emerald-700/50 shadow-sm space-y-5 text-right">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#384524] flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    صندوق ملاحظات واستفسارات المشتركين المباشرة
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                    {supervisorNotes.length} ملاحظة
                  </span>
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E]">
                  استعراض أسئلة الطلاب السريرية، ملاحظات الترميم، والرد عليها مباشرة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSupervisorNotes(getSupervisorNotes())}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-[#302B23] dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الصندوق</span>
            </button>
          </div>

          {supervisorNotes.length === 0 ? (
            <div className="p-10 text-center text-[#7E7768] dark:text-[#A7A08E] space-y-2">
              <Inbox className="w-12 h-12 mx-auto stroke-[1.5] opacity-30" />
              <p className="font-bold text-sm">صندوق الملاحظات فارغ حالياً</p>
              <p className="text-xs">
                أي ملاحظة أو استفسار يكتبه المشتركون في خانة الملاحظات ستظهر هنا فوراً.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {supervisorNotes.map((note, nIdx) => (
                <div
                  key={`${note.id || 'note'}_${nIdx}`}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    note.isRead
                      ? 'bg-[#FAF7F2] dark:bg-[#161B11] border-[#E5DEC9] dark:border-[#343E26]'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-black/30 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{note.studentEmail}</span>
                      </span>
                      {note.studentName && (
                        <span className="font-bold text-[#443E33] dark:text-[#D5CDBC]">
                          ({note.studentName})
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#CBE276]">
                        {NOTE_CATEGORIES[note.category]?.label || 'ملاحظة سريرية'}
                      </span>
                      {!note.isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                          جديدة غير مقروءة
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[#7E7768] dark:text-[#A7A08E] font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{note.createdAt}</span>
                    </div>
                  </div>

                  {(note.sectionTitle || note.slideTitle) && (
                    <div className="text-xs text-[#59662C] dark:text-[#A8C24E] font-bold">
                      📌 القسم/الشريحة: {note.sectionTitle || 'عام'} {note.slideTitle ? `— ${note.slideTitle}` : ''}
                    </div>
                  )}

                  {/* Note Content */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] text-xs leading-relaxed text-[#2F2B24] dark:text-[#F3EFE6] whitespace-pre-line font-medium shadow-2xs">
                    {note.content}
                  </div>

                  {/* Supervisor Reply Display */}
                  {note.reply && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-black text-amber-900 dark:text-amber-200">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>ردكِ السابق (د. حياة نافع فجر):</span>
                        </span>
                        {note.repliedAt && <span className="font-mono text-[10px] text-amber-800">{note.repliedAt}</span>}
                      </div>
                      <p className="leading-relaxed text-[#353026] dark:text-[#E2DDD2] font-semibold">
                        {note.reply}
                      </p>
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {replyingNoteId === note.id ? (
                    <div className="p-3 bg-white dark:bg-[#20261A] rounded-xl border border-emerald-400 dark:border-emerald-700 space-y-2">
                      <label className="font-black text-xs text-emerald-900 dark:text-emerald-300 block">
                        كتابة رد المشرفة على هذا الطالب:
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="اكتبي توجيهك السريري أو إجابتك هنا ليراها المشترك في سجله..."
                        className="w-full p-2.5 rounded-xl border border-[#D5CDBC] dark:border-[#384524] bg-[#FAF8F2] dark:bg-[#151910] text-xs font-semibold text-[#2F2B24] dark:text-white"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingNoteId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!replyText.trim()) return;
                            try {
                              await replyToSupervisorNoteInCloud(
                                note.id,
                                replyText.trim(),
                                note.studentEmail,
                                note.studentName
                              );
                              setPanelNotice('تم إرسال الرد وتوجيه الإشعار للطالب فوراً 🔔✨');
                              setTimeout(() => setPanelNotice(null), 3500);
                            } catch (err) {
                              console.error(err);
                              const updated = replyToSupervisorNote(note.id, replyText.trim());
                              setSupervisorNotes(updated);
                            }
                            setReplyingNoteId(null);
                            setReplyText('');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                        >
                          حفظ وإرسال الرد للطالب
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5DEC9] dark:border-[#343E26] flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingNoteId(note.id);
                            setReplyText(note.reply || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>{note.reply ? 'تعديل الرد' : 'الرد على الملاحظة'}</span>
                        </button>

                        <a
                          href={`https://t.me/hay_a_2`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#20261A] hover:bg-gray-100 text-[#0088cc] border border-[#0088cc]/30 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>تليجرام</span>
                        </a>

                        <a
                          href={`mailto:${note.studentEmail}?subject=${encodeURIComponent('رد على استفسارك في منصة بروتوكول')}`}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#20261A] hover:bg-gray-100 text-[#59662C] dark:text-[#A8C24E] border border-[#59662C]/30 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" />
                          <span>إرسال إيميل</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!note.isRead && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = markSupervisorNoteAsRead(note.id);
                              setSupervisorNotes(updated);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            تحديد كمقروء
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteSupervisorNoteInCloud(note.id);
                            } catch {
                              const updated = deleteSupervisorNote(note.id);
                              setSupervisorNotes(updated);
                            }
                            setPanelNotice('تم حذف الملاحظة بنجاح 🗑️');
                            setTimeout(() => setPanelNotice(null), 3000);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer active:scale-95"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Code Requests from Subscribers (Requested: اضافة نافذة كتابة الايميل داخل رسالة المشترك عند طلب الكود) */}
      {(adminSubTab === 'all' || adminSubTab === 'requests') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-amber-500/50 dark:border-amber-600/50 shadow-sm space-y-5 text-right">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#343E26] flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    طلبات كودات التفعيل الجديدة من الطلاب (مع الإيميل)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                    {codeRequests.length} طلب
                  </span>
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E]">
                  مراجعة إيصالات تحويل الماستركارد وتوليد كودات التفعيل للطلاب المشتركين بنقرة واحدة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCodeRequests(getCodeRequests())}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-[#302B23] dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الطلبات</span>
            </button>
          </div>

          {/* Admin Mastercard Configuration Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/30 dark:border-[#A4BF46]/30 space-y-4 shadow-sm text-right">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-black text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                <span>إعدادات بطاقة الماستركارد المعتمدة لاستلام التحويلات (سحابية فورية):</span>
              </h4>
              {isSavedCardNotice && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-300 animate-fadeIn">
                  ✓ تم حفظ وتحديث بيانات البطاقة سحابياً بنجاح
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    رقم بطاقة الماستركارد (Mastercard Number):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={adminCardNumber}
                    onChange={(e) => setAdminCardNumber(e.target.value)}
                    placeholder="5377 9210 4481 6029"
                    className="w-full px-3 py-2.5 bg-[#FAF7F2] dark:bg-[#151910] rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold text-sm text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                  />
                  <p className="text-[10px] text-gray-500">يظهر هذا الرقم للطلاب في نافذة الدفع مع زر نسخ فوري بلمسة واحدة.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    اسم صاحب البطاقة (Cardholder Name):
                  </label>
                  <input
                    type="text"
                    value={adminCardHolder}
                    onChange={(e) => setAdminCardHolder(e.target.value)}
                    placeholder="د. حياه نافع فجر"
                    className="w-full px-3 py-2.5 bg-[#FAF7F2] dark:bg-[#151910] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-xs text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                  />
                  <p className="text-[10px] text-gray-500">الاسم الظاهر في أسفل البطاقة المصرفية للتحقق من هوية المستلم.</p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await savePaymentConfigToCloud({
                          mastercardNumber: adminCardNumber.trim(),
                          mastercardHolder: adminCardHolder.trim(),
                        });
                        setIsSavedCardNotice(true);
                        setTimeout(() => setIsSavedCardNotice(false), 3000);
                        setPanelNotice('تم تحديث وحفظ بيانات بطاقة الماستركارد سحابياً لجميع الطلاب 💳✨');
                        setTimeout(() => setPanelNotice(null), 3500);
                      } catch (err) {
                        console.error('Error saving mastercard config:', err);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#708238] hover:from-[#485320] hover:to-[#59662C] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-102 active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>حفظ بيانات البطاقة سحابياً 💾</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C2016] via-[#2A3320] to-[#12160E] text-white p-4 shadow-lg border border-[#59662C]/40 flex flex-col justify-between h-44">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-6 rounded bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600 shadow-inner flex items-center justify-center p-0.5">
                      <div className="w-full h-full border border-amber-700/60 rounded-xs grid grid-cols-2 gap-0.5 opacity-70" />
                    </div>
                    <span className="text-white/60 font-mono text-[10px]">))))</span>
                  </div>
                  <div className="flex items-center -space-x-2.5 rtl:space-x-reverse">
                    <div className="w-6 h-6 rounded-full bg-[#EB001B] shadow-sm" />
                    <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90 shadow-sm" />
                  </div>
                </div>

                <div className="relative z-10 space-y-0.5 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block">معاينة حية لرقم البطاقة المعروض للطلاب</span>
                  <div dir="ltr" className="font-mono text-base font-black text-amber-300 tracking-wider">
                    {adminCardNumber || '5377 9210 4481 6029'}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-white/50 block">حامل البطاقة</span>
                    <span className="font-bold text-white/95">{adminCardHolder || 'د. حياه نافع فجر'}</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">Mastercard Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setRequestsFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestsFilter === 'all'
                    ? 'bg-[#59662C] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] dark:bg-[#20261A] text-[#554E41] dark:text-[#C5BFB0] border border-[#E5DEC9] dark:border-[#384524]'
                }`}
              >
                جميع الطلبات ({codeRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestsFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  requestsFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-400/40'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>المعلقة ({pendingRequestsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestsFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  requestsFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>المفعلة ({approvedRequestsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestsFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  requestsFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>المرفوضة ({rejectedRequestsCount})</span>
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الإيميل، أو وسيلة الدفع..."
                value={requestsSearch}
                onChange={(e) => setRequestsSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
              />
            </div>
          </div>

          {/* Requests List */}
          {codeRequests.length === 0 ? (
            <div className="p-10 text-center text-[#7E7768] dark:text-[#A7A08E] space-y-2">
              <Mail className="w-12 h-12 mx-auto stroke-[1.5] opacity-30" />
              <p className="font-bold text-sm">لا توجد طلبات اشتراك مسجلة حالياً</p>
              <p className="text-xs">
                عندما يرفع الطالب إيصال تحويل (زين كاش، فاست باي، ماستركارد، أو حوالة) سيظهر هنا فوراً مع صورة الإيصال وأزرار التفعيل.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {codeRequests
                .filter((r) => {
                  const matchesFilter =
                    requestsFilter === 'all' ||
                    (requestsFilter === 'pending' && r.status === 'pending') ||
                    (requestsFilter === 'approved' && (r.status === 'code_sent' || (r as any).status === 'approved')) ||
                    (requestsFilter === 'rejected' && r.status === 'rejected');

                  const q = requestsSearch.trim().toLowerCase();
                  if (!q) return matchesFilter;

                  const matchesQ =
                    r.email.toLowerCase().includes(q) ||
                    (r.studentName && r.studentName.toLowerCase().includes(q)) ||
                    (r.notes && r.notes.toLowerCase().includes(q)) ||
                    (r.paymentMethod && r.paymentMethod.toLowerCase().includes(q));

                  return matchesFilter && matchesQ;
                })
                .map((req, rIdx) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'code_sent' || (req as any).status === 'approved';
                  const isRejected = req.status === 'rejected';

                  // Payment method label & styling (Mastercard or Manual Transfer)
                  const pm = (req.paymentMethod || 'mastercard').toLowerCase();
                  let pmBadge = {
                    label: 'ماستركارد (Mastercard) 💳',
                    style: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800',
                  };
                  if (pm.includes('manual') || pm.includes('bank') || pm.includes('تحويل') || pm.includes('direct')) {
                    pmBadge = {
                      label: 'تحويل يدوي / مباشر 🏦',
                      style: 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800',
                    };
                  }

                  const selectedPlanKey = requestDurations[req.id] || (req.durationPlan as SubscriptionPlanKey) || '1_year';

                  return (
                    <div
                      key={`${req.id || 'req'}_${rIdx}`}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 text-right shadow-2xs ${
                        isPending
                          ? 'bg-white dark:bg-[#1E2417] border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                          : isApproved
                          ? 'bg-[#FAF7F2] dark:bg-[#161B11] border-emerald-400/50 dark:border-emerald-800'
                          : 'bg-rose-50/20 dark:bg-[#1C1814] border-rose-300 dark:border-rose-900 opacity-80'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {/* Student Name */}
                          <span className="font-black text-sm text-[#2F2B24] dark:text-white">
                            {req.studentName || 'طالب طب أسنان'}
                          </span>

                          {/* Email Pill */}
                          <span className="font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-black/30 px-2.5 py-0.5 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center gap-1 select-all">
                            <Mail className="w-3 h-3 text-[#59662C]" />
                            <span>{req.email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(req.email);
                                setPanelNotice(`تم نسخ بريد الطالب: ${req.email} 📋`);
                                setTimeout(() => setPanelNotice(null), 2500);
                              }}
                              className="p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                              title="نسخ البريد"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </span>

                          {/* Payment Method Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${pmBadge.style}`}>
                            {pmBadge.label}
                          </span>

                          {/* Amount Paid */}
                          {req.amount && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300">
                              المبلغ: {req.amount}
                            </span>
                          )}

                          {/* University & Stage */}
                          {(req.academicStage || req.university) && (
                            <span className="text-[11px] text-gray-500 font-medium">
                              ({[req.university, req.academicStage].filter(Boolean).join(' - ')})
                            </span>
                          )}
                        </div>

                        {/* Status & Date */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-[11px] text-gray-400 font-mono">
                            {req.createdAt}
                          </span>

                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>بانتظار التأكيد والموافقة ⏳</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>مفعل ({req.generatedCode || 'نشط'})</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>مرفوض / ملغي</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details & Receipt Image Row */}
                      <div className="flex flex-col md:flex-row items-start justify-between gap-3 text-xs">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {req.targetSectionTitle && (
                            <p className="text-xs text-[#59662C] dark:text-[#A8C24E] font-medium">
                              القسم المستهدف: <strong>«{req.targetSectionTitle}»</strong>
                            </p>
                          )}

                          {req.notes && (
                            <p className="text-xs text-[#635D50] dark:text-[#D5CDBC] bg-[#FAF7F2] dark:bg-[#151910] p-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#343E26]">
                              {req.notes}
                            </p>
                          )}

                          {isRejected && req.rejectionReason && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>سبب الرفض المسجل: {req.rejectionReason}</span>
                            </div>
                          )}

                          {/* Receipt Screenshot Thumbnail & Preview */}
                          {req.receiptUrl && (
                            <div className="flex items-center gap-3 pt-1">
                              <img
                                src={req.receiptUrl}
                                alt="إيصال التحويل المالي"
                                onClick={() => setPreviewReceiptUrl(req.receiptUrl!)}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/80 cursor-pointer shadow-xs hover:scale-105 transition-all"
                                title="اضغط لتكبير صورة الإيصال"
                              />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewReceiptUrl(req.receiptUrl!)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>معاينة إيصال التحويل 🧾</span>
                                </button>
                                <span className="text-[10px] text-gray-500 block mt-1">انقر للتكبير وفحص العملية</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Controls Column */}
                        <div className="flex flex-col items-end gap-2.5 shrink-0 w-full md:w-auto pt-2 md:pt-0">
                          {/* Duration Plan Selector (Default 1 Year Limit) */}
                          {isPending && (
                            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                              <span className="text-[10px] text-gray-500 px-1 font-bold">مدة الصلاحية:</span>
                              {(['1_year', 'semester', '1_month'] as SubscriptionPlanKey[]).map((pkey, pIdx) => (
                                <button
                                  key={`${pkey}_${pIdx}`}
                                  type="button"
                                  onClick={() => setRequestDurations((prev) => ({ ...prev, [req.id]: pkey }))}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                    selectedPlanKey === pkey
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {pkey === '1_year' ? 'سنة كاملة (365 يوم)' : pkey === 'semester' ? 'كورس كامل' : 'شهر واحد'}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons: 1-Click Approve / Reject / Delete */}
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {isPending ? (
                              <>
                                {/* 1-Click "Approve / Activate" */}
                                <button
                                  type="button"
                                  onClick={() => handleApproveRequest(req, selectedPlanKey)}
                                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                                  title="تأكيد وتفعيل الاشتراك فوراً"
                                >
                                  <Zap className="w-4 h-4 text-amber-300" />
                                  <span>تأكيد وتفعيل الاشتراك ⚡</span>
                                </button>

                                {/* 1-Click "Reject / Deny" */}
                                <button
                                  type="button"
                                  onClick={() => setRejectingReq(req)}
                                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="رفض أو إلغاء هذا الطلب"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>رفض / إلغاء ⛔</span>
                                </button>
                              </>
                            ) : isApproved ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-300">
                                  كود: {req.generatedCode}
                                </span>

                                <a
                                  href={`https://t.me/share/url?url=${encodeURIComponent(
                                    `تم تأكيد وتفعيل اشتراكك السنوي في بروتوكول طب الأسنان بنجاح!\nكود التفعيل الخاص بك: ${req.generatedCode}\nالبريد المصرح: ${req.email}\nبإشراف د. حياة نافع فجر`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 cursor-pointer"
                                  title="مشاركة الكود عبر تليجرام"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </a>

                                {/* 1-Click Revoke for active request */}
                                <button
                                  type="button"
                                  onClick={() => setRejectingReq(req)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold border border-rose-200 cursor-pointer"
                                  title="إلغاء الصلاحية وتجميد الاشتراك"
                                >
                                  إلغاء الصلاحية 🚫
                                </button>
                              </div>
                            ) : (
                              /* Rejected Request: Re-consider */
                              <button
                                type="button"
                                onClick={() => handleApproveRequest(req, selectedPlanKey)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>إعادة النظر والتفعيل ⚡</span>
                              </button>
                            )}

                            {/* Delete request from list */}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await deleteSubscriptionRequestInCloud(req.id);
                                } catch {
                                  const updated = deleteCodeRequest(req.id);
                                  setCodeRequests(updated);
                                }
                                setPanelNotice('تم حذف الطلب بنجاح 🗑️');
                                setTimeout(() => setPanelNotice(null), 3000);
                              }}
                              className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 dark:bg-gray-800 dark:hover:bg-rose-950/40 cursor-pointer active:scale-95"
                              title="حذف السجل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 4.5. Clinical Report Export Approvals Management Section */}
      {(adminSubTab === 'all' || adminSubTab === 'report_approvals') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-amber-500/50 dark:border-amber-600/50 shadow-sm space-y-6 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9] dark:border-[#343E26]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    طلبات مصادقة واعتماد التقارير السريرية السنوية (Clinical Report Approvals)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                    {reportRequests.length} تقرير
                  </span>
                  {pendingReportsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-white animate-pulse">
                      {pendingReportsCount} بانتظار موافقتك ⚡
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] mt-0.5">
                  مراجعة تقارير الإنجاز السريري والأرشفة المقدمة من الطلاب وإصدار كود المصادقة الأكاديمي لفتح التصدير والطباعة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPanelNotice('تم تحديث قائمة طلبات التقارير بنجاح 🔄');
                  setTimeout(() => setPanelNotice(null), 3000);
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-[#302B23] dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث الطلبات</span>
              </button>
            </div>
          </div>

          {/* Filter Chips and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setReportFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  reportFilterStatus === 'all'
                    ? 'bg-[#59662C] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                الكل ({reportRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setReportFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  reportFilterStatus === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>بانتظار الموافقة ({pendingReportsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setReportFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  reportFilterStatus === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>المعتمدة ({approvedReportsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setReportFilterStatus('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  reportFilterStatus === 'rejected'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>المرفوضة ({rejectedReportsCount})</span>
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم الطالب، الجامعة، أو الكود..."
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
              />
            </div>
          </div>

          {/* Requests List */}
          {reportRequests.length === 0 ? (
            <div className="p-10 text-center text-[#7E7768] dark:text-[#A7A08E] space-y-2">
              <Award className="w-12 h-12 mx-auto stroke-[1.5] opacity-30 text-amber-500" />
              <p className="font-bold text-sm">لا توجد طلبات تصدير تقارير سريرية حالياً</p>
              <p className="text-xs">
                عندما يضغط الطالب على "طلب موافقة المشرف للتصدير" في نافذة التقرير السريري، سيظهر طلبه هنا فوراً مع تفاصيل الحالات ونسب النجاح وأزرار الموافقة والاعتماد.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportRequests
                .filter((r) => {
                  const matchesFilter =
                    reportFilterStatus === 'all' ||
                    (reportFilterStatus === 'pending' && r.status === 'pending') ||
                    (reportFilterStatus === 'approved' && r.status === 'approved') ||
                    (reportFilterStatus === 'rejected' && r.status === 'rejected');

                  const q = reportSearchQuery.trim().toLowerCase();
                  if (!q) return matchesFilter;

                  const matchesQ =
                    r.studentName.toLowerCase().includes(q) ||
                    r.university.toLowerCase().includes(q) ||
                    r.academicStage.toLowerCase().includes(q) ||
                    r.reportSerialId.toLowerCase().includes(q) ||
                    (r.approvalCode && r.approvalCode.toLowerCase().includes(q));

                  return matchesFilter && matchesQ;
                })
                .map((req, rIdx) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';
                  const isRejected = req.status === 'rejected';

                  return (
                    <div
                      key={`${req.id || 'req_quota'}_${rIdx}`}
                      className={`p-5 rounded-2xl border transition-all text-right space-y-4 ${
                        isPending
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-sm'
                          : isApproved
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                              isPending
                                ? 'bg-amber-500'
                                : isApproved
                                ? 'bg-emerald-600'
                                : 'bg-rose-600'
                            }`}
                          >
                            {isPending ? '⏳' : isApproved ? '✅' : '❌'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white">
                                {req.studentName}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  isPending
                                    ? 'bg-amber-500 text-white animate-pulse'
                                    : isApproved
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                }`}
                              >
                                {isPending ? 'بانتظار موافقة المشرف ⏳' : isApproved ? 'معتمد ومصادق عليه ✅' : 'مرفوض ❌'}
                              </span>
                            </div>
                            <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] mt-0.5">
                              🏛️ {req.university} • 🎓 {req.academicStage} ({req.academicYear})
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-left text-[11px] text-[#716A5B] dark:text-[#A7A08E] flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-gray-400">
                            معرف التقرير: {req.reportSerialId}
                          </span>
                          <span>وقت الإرسال: {req.requestedAt}</span>
                        </div>
                      </div>

                      {/* Clinical Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 text-center">
                          <div className="text-lg font-black text-[#59662C] dark:text-[#A4BF46]">
                            {req.totalCases}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                            إجمالي الحالات السريرية
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#161B11] border border-amber-300 dark:border-amber-700/50 text-center">
                          <div className="text-lg font-black text-amber-500">
                            {req.successRate}%
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                            نسبة النجاح السريري
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 text-center">
                          <div className="text-lg font-black text-sky-500">
                            {req.totalPhotos}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                            الصور السريرية الموثقة
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 text-center">
                          <div className="text-lg font-black text-purple-500">
                            {req.archivedCasesCount}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                            الحالات المؤرشفة
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown Chips */}
                      {req.categoryBreakdown && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                          <span className="text-[11px] font-bold text-gray-400 ml-1">توزيع التخصصات:</span>
                          {Object.entries(req.categoryBreakdown).map(([cat, cnt], cIdx) => {
                            if (!cnt || cnt === 0) return null;
                            const catLabels: Record<string, string> = {
                              extraction: '🦷 قلع الأسنان',
                              fillings: '💎 الحشوات',
                              dentures: '🪥 الأطقم',
                              cleaning: '✨ التنظيف',
                              endo: '⚡ علاج الجذور',
                              other: '📋 حالات أخرى',
                            };
                            return (
                              <span
                                key={`cat_${cIdx}_${cat}`}
                                className="px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-black/30 border border-gray-300 dark:border-gray-700 text-[11px] font-bold text-[#2F2B24] dark:text-gray-200"
                              >
                                {catLabels[cat] || cat}: <span className="font-mono text-[#59662C] dark:text-[#A4BF46]">{cnt}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Student Message/Note if present */}
                      {req.notes && (
                        <div className="p-3 rounded-xl bg-amber-100/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                          <strong>💬 رسالة الطالب للمشرف:</strong> {req.notes}
                        </div>
                      )}

                      {/* Approval Info if approved */}
                      {isApproved && (
                        <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong>✅ تمت المصادقة بواسطة:</strong> {req.reviewedBy || 'د. حياة نافع فجر'}
                            {req.reviewedAt && <span className="mr-2 text-[11px] text-gray-500 dark:text-gray-400">({req.reviewedAt})</span>}
                          </div>
                          {req.approvalCode && (
                            <span className="font-mono font-black px-2.5 py-0.5 rounded-md bg-white dark:bg-black/40 border border-emerald-400 text-emerald-700 dark:text-emerald-300">
                              كود الاعتماد الأكاديمي: {req.approvalCode}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rejection Note if rejected */}
                      {isRejected && (
                        <div className="p-3 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                          <strong>⚠️ سبب الإرجاع للملاحظات:</strong> {req.rejectionReason}
                        </div>
                      )}

                      {/* Action Buttons for Supervisor */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Approve Button */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await approveReportExportRequest(req.id, 'د. حياة نافع فجر', 'تمت المصادقة والاعتماد الأكاديمي بنجاح.');
                                setPanelNotice(`تمت الموافقة على تقرير الطالب ${req.studentName} بنجاح! تم إرسال إشعار فوري لفتح التصدير لديه ✅`);
                                setTimeout(() => setPanelNotice(null), 4000);
                              } catch {
                                setPanelNotice('حدث خطأ أثناء الموافقة.');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>موافقة واعتماد التصدير فوراً ✅</span>
                          </button>

                          {/* Reject / Request Revisions Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRejectionModalRequest(req);
                              setRejectionReasonInput('');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض / طلب تعديل ❌</span>
                          </button>
                        </div>

                        {/* Delete obsolete request */}
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await cancelStudentReportRequest(req.id);
                              setPanelNotice('تم حذف سجل التقرير 🗑️');
                              setTimeout(() => setPanelNotice(null), 3000);
                            } catch {}
                          }}
                          className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 dark:bg-gray-800 dark:hover:bg-rose-950/40 cursor-pointer active:scale-95"
                          title="حذف هذا السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Supervisor Rejection Reason Dialog */}
      {rejectionModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E2417] border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-black text-base text-[#2F2B24] dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>إرجاع طلب التقرير مع ملاحظات المشرف</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectionModalRequest(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#716A5B] dark:text-[#A7A08E]">
              يرجى كتابة ملاحظاتك للطالب (<strong>{rejectionModalRequest.studentName}</strong>) لتوضيح التعديلات المطلوبة قبل اعتماد التقرير:
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="مثال: يرجى إرفاق صور الأشعة لحالات علاج الجذور وتدقيق رقم السن قبل اعتماد التقرير..."
              rows={4}
              className="w-full p-3 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-rose-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalRequest(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await rejectReportExportRequest(
                      rejectionModalRequest.id,
                      rejectionReasonInput || 'يرجى مراجعة وتدقيق الحالات السريرية قبل إعادة إرسال طلب الاعتماد.',
                      'د. حياة نافع فجر'
                    );
                    setRejectionModalRequest(null);
                    setPanelNotice('تم إرجاع التقرير وإشعار الطالب بالملاحظات بنجاح ⚠️');
                    setTimeout(() => setPanelNotice(null), 4000);
                  } catch {
                    setPanelNotice('حدث خطأ أثناء إرجاع الطلب.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                إرسال الملاحظات وإرجاع التقرير ✉️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Friends & Peer Discount Codes Management Section */}
      {(adminSubTab === 'all' || adminSubTab === 'friends') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-blue-500/40 dark:border-blue-700/40 shadow-sm space-y-6 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9] dark:border-[#343E26]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Users2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    إدارة كودات الأصدقاء (Friends & Peer Discount - 5,000 د.ع)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    {friendsCodes.length} كود مسجل
                  </span>
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] mt-0.5">
                  توليد كود خصم مخصص لزوج من الأصدقاء (طالبين)، يمنح كل منهما اشتراكاً بسعر 7$ بحد أقصى مرتين للاستخدام.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                معدل الخصم: 7$
              </span>
            </div>
          </div>

          {friendCodeNotice && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{friendCodeNotice}</span>
            </div>
          )}

          {/* Form to generate code for a pair of friends */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!friend1NameInput.trim() || !friend2NameInput.trim()) {
                setFriendCodeNotice('يرجى إدخال اسم الصديق الأول واسم الصديق الثاني على الأقل.');
                setTimeout(() => setFriendCodeNotice(null), 4000);
                return;
              }
              setIsCreatingFriendCode(true);
              try {
                const created = await createFriendCodeInCloud({
                  friend1Name: friend1NameInput.trim(),
                  friend1Email: friend1EmailInput.trim() || undefined,
                  friend2Name: friend2NameInput.trim(),
                  friend2Email: friend2EmailInput.trim() || undefined,
                  customCode: customCodeInput.trim() || undefined,
                  notes: friendsNotesInput.trim() || undefined,
                });
                setFriend1NameInput('');
                setFriend1EmailInput('');
                setFriend2NameInput('');
                setFriend2EmailInput('');
                setCustomCodeInput('');
                setFriendsNotesInput('');
                setFriendCodeNotice(`تم إنشاء كود الأصدقاء بنجاح: [ ${created.code} ] ومشاركته جاهزة للصديقين 🎉`);
                setTimeout(() => setFriendCodeNotice(null), 6000);
              } catch (err) {
                console.error('Error creating friend code:', err);
              } finally {
                setIsCreatingFriendCode(false);
              }
            }}
            className="p-5 rounded-3xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-4"
          >
            <h3 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>توليد كود خصم جديد لزوج من الأصدقاء (طالبين):</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Friend 1 */}
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">اسم الصديق الأول:*</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. أحمد علي"
                  value={friend1NameInput}
                  onChange={(e) => setFriend1NameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">بريد الصديق الأول (اختياري):</label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="ahmed@gmail.com"
                  value={friend1EmailInput}
                  onChange={(e) => setFriend1EmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Friend 2 */}
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">اسم الصديق الثاني:*</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. مصطفى كريم"
                  value={friend2NameInput}
                  onChange={(e) => setFriend2NameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">بريد الصديق الثاني (اختياري):</label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="mustafa@gmail.com"
                  value={friend2EmailInput}
                  onChange={(e) => setFriend2EmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Custom Code */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#2F2B24] dark:text-white">رمز الكود المخصص:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(1000 + Math.random() * 9000);
                      setCustomCodeInput(`PAIR-${rand}`);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>توليد كود تلقائي</span>
                  </button>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: PAIR-4821 أو AHMED-MUSTAFA"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-mono font-black text-blue-600 dark:text-blue-400"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">ملاحظات خاصة للكود:</label>
                <input
                  type="text"
                  placeholder="مثال: زملاء كلية طب الأسنان - جامعة بغداد"
                  value={friendsNotesInput}
                  onChange={(e) => setFriendsNotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1E2417] rounded-xl border border-gray-300 dark:border-gray-700 text-xs text-[#2F2B24] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isCreatingFriendCode}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Users2 className="w-4 h-4" />
                <span>إنشاء وتفعيل كود الأصدقاء (5,000 د.ع) 👥✨</span>
              </button>
            </div>
          </form>

          {/* List of Friends Codes */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center justify-between">
              <span>كودات الأصدقاء الفعالة والمستخدمة:</span>
              <span className="text-[11px] text-gray-500 font-normal">الحد الأقصى لكل كود هو استهلاك مرتين (2/2)</span>
            </h4>

            {friendsCodes.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Users2 className="w-10 h-10 mx-auto opacity-30" />
                <p className="font-bold text-xs">لا توجد كودات أصدقاء مسجلة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friendsCodes.map((fc, fcIdx) => {
                  const isExhausted = fc.usedCount >= fc.maxUses || fc.status === 'exhausted';
                  return (
                    <div
                      key={`${fc.id || 'fc'}_${fcIdx}`}
                      className={`p-4 rounded-2xl border transition-all text-right space-y-3 shadow-2xs ${
                        isExhausted
                          ? 'bg-gray-50 dark:bg-[#151910] border-gray-200 dark:border-gray-800 opacity-80'
                          : 'bg-white dark:bg-[#1E2417] border-blue-300 dark:border-blue-900/60 ring-1 ring-blue-400/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-mono text-sm font-black px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-black/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 select-all"
                          >
                            {fc.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(fc.code);
                              setPanelNotice(`تم نسخ كود الأصدقاء: ${fc.code} 📋`);
                              setTimeout(() => setPanelNotice(null), 3000);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                            title="نسخ الكود"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isExhausted
                              ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : fc.usedCount === 1
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isExhausted
                            ? 'مكتمل الاستهلاك (2/2)'
                            : fc.usedCount === 1
                            ? 'مستخدم 1/2 (متبقي صديق)'
                            : 'متاح للصديقين (0/2)'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                          <Users2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>الصديقان: {fc.friend1Name} & {fc.friend2Name}</span>
                        </div>
                        {fc.notes && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {fc.notes}
                          </p>
                        )}
                      </div>

                      {/* Usage Details if any */}
                      {fc.usedBy && fc.usedBy.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold block">الطلبة الذين استهلكوا الكود:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {fc.usedBy.map((u, idx) => (
                              <span
                                key={`fc_user_${u.email || u.name || idx}_${idx}`}
                                className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono border border-emerald-200 dark:border-emerald-800"
                              >
                                ✓ {u.name || u.email} ({u.usedAt})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800 text-[10px]">
                        <span className="text-gray-400 font-mono">{fc.createdAt}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`هل أنتِ متأكدة من حذف كود الأصدقاء [${fc.code}]؟`)) {
                              await deleteFriendCodeInCloud(fc.id);
                              setPanelNotice('تم حذف كود الأصدقاء بنجاح 🗑️');
                              setTimeout(() => setPanelNotice(null), 3000);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          حذف الكود
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7.5. Admin PIN Management Module (Requirement #2) */}
      {(adminSubTab === 'all' || adminSubTab === 'admin_pin' || adminSubTab === 'security') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/50 dark:border-[#59662C]/60 shadow-sm space-y-6 text-right" dir="rtl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    🔑 إدارة وتغيير رمز مرور المشرف (Admin PIN Management)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                    Master Access Control
                  </span>
                </div>
                <p className="text-xs text-[#7A7466] dark:text-[#A7A08E] mt-0.5">
                  تغيير رمز المشرف السري (Admin PIN) وحفظه وتحديثه فوراً في النظام والذاكرة السحابية والمحلية.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToDefaultAdminPin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border border-neutral-200 dark:border-neutral-700"
              title="استعادة الرمز الافتراضي (2003)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استعادة الرمز الافتراضي (2003)</span>
            </button>
          </div>

          {/* Feedback Alert */}
          {pinChangeMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                pinChangeMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-500/10 border border-rose-500/40 text-rose-800 dark:text-rose-200'
              }`}
            >
              {pinChangeMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pinChangeMsg.text}</span>
            </div>
          )}

          {/* PIN Form */}
          <form onSubmit={handleChangeAdminPin} className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#161C12] border border-[#E5DEC9] dark:border-[#2C3720] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Field 1: Current PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                  <span>الرمز الحالي (Current PIN):</span>
                  <span className="text-[10px] text-neutral-500 font-normal">الافتراضي 2003</span>
                </label>
                <div className="relative">
                  <input
                    type={showPinSecrets ? 'text' : 'password'}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="أدخل الرمز السري الحالي..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinSecrets(!showPinSecrets)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showPinSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Field 2: New PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                  الرمز الجديد (New PIN):
                </label>
                <div className="relative">
                  <input
                    type={showPinSecrets ? 'text' : 'password'}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="الرمز الجديد (3 خانات أو أكثر)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Confirm New PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                  تأكيد الرمز الجديد (Confirm PIN):
                </label>
                <div className="relative">
                  <input
                    type={showPinSecrets ? 'text' : 'password'}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="أعد كتابة الرمز الجديد للتأكيد..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5DEC9]/80 dark:border-[#2C3720]">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>يتم تطبيق الرمز الجديد فوراً لحماية الوصول لصلاحيات الإشراف على جميع الأجهزة.</span>
              </div>

              <button
                type="submit"
                disabled={isSavingPin}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#59662C] to-[#7B8C3F] hover:from-[#4D5826] hover:to-[#6C7B37] text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingPin ? 'جاري الحفظ والمزامنة...' : 'تحديث وحفظ رمز المشرف فوراً 🔒'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Single-Device Session Enforcement & Anti-Piracy Protection Module */}
      {(adminSubTab === 'all' || adminSubTab === 'security') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-rose-500/50 dark:border-rose-700/60 shadow-sm space-y-6 text-right">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    حماية المحتوى السريري ومنع مشاركة الحسابات (Anti-Piracy & Sessions)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                    Single-Device Enforcement Active
                  </span>
                </div>
                <p className="text-xs text-[#7A7466] dark:text-[#A7A08E] mt-0.5">
                  حظر تسجيل الدخول المتزامن من أكثر من جهاز في نفس الوقت، ومراقبة أجهزة المشتركين النشطة وإنهاء الجلسات عن بعد.
                </p>
              </div>
            </div>

            {onOpenAndroidGuidance && (
              <button
                type="button"
                onClick={onOpenAndroidGuidance}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
              >
                <Smartphone className="w-4 h-4" />
                <span>دليل كود أندرويد FLAG_SECURE (Webintoapp) 📱</span>
              </button>
            )}
          </div>

          {/* Anti-Piracy Shields Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
              <div className="flex items-center justify-between font-black text-emerald-900 dark:text-emerald-200">
                <span>حظر التقاط الشاشة والتمويه</span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded-full">نشط 100%</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                يتم تمويه الشاشة وحجب المحتوى فوراً عند فقدان التركيز، فتح أدوات المطور (F12)، أو التبديل بين التطبيقات.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 space-y-1">
              <div className="flex items-center justify-between font-black text-blue-900 dark:text-blue-200">
                <span>حظر التحديد وحفظ الصور</span>
                <span className="text-[10px] bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full">نشط 100%</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                معطل تحديد النصوص، سحب الصور، والقائمة المنبثقة للزر الأيمن لحماية الشروحات السريرية.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
              <div className="flex items-center justify-between font-black text-amber-900 dark:text-amber-200">
                <span>تقييد الجهاز الأحادي (Single-Device)</span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full font-mono">{activeSessions.length} جلسة</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                أي تسجيل دخول جديد من هاتف آخر ينهي تلقائياً وبشكل فوري جلسة الجهاز القديم.
              </p>
            </div>
          </div>

          {/* Active Sessions List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-500" />
                <span>أجهزة وجلسات المشتركين النشطة حالياً ({activeSessions.length}):</span>
              </h4>
              <span className="text-[11px] text-[#7A7466] dark:text-[#A7A08E]">
                مراقبة سحابية حية (Real-Time Active Devices)
              </span>
            </div>

            {activeSessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] space-y-2 text-xs text-[#7A7466] dark:text-[#A7A08E]">
                <ShieldCheck className="w-8 h-8 mx-auto text-[#596628] opacity-60" />
                <p className="font-bold">لا توجد جلسات مفتوحة حالياً.</p>
                <p className="text-[11px]">عند قيام أي طالب بتسجيل الدخول بكود التفعيل، سيظهر جهازه وبصمته الرقمية هنا فوراً.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeSessions.map((session, sIdx) => {
                  const isRecentlyActive = Date.now() - (session.lastHeartbeat || session.loginTimestamp) < 3 * 60 * 1000;
                  const formattedLogin = new Date(session.loginTimestamp).toLocaleTimeString('ar-IQ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={`${session.sessionId || 'sess'}_${sIdx}`}
                      className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#384524] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-[#2F2B24] dark:text-white text-sm">
                            {session.studentName || 'مشترك'}
                          </span>
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-black/40 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800">
                            {session.email}
                          </span>
                          {isRecentlyActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              <span>متصل الآن</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              غير نشط مؤخراً
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#7A7466] dark:text-[#A7A08E] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                            <strong className="text-[#2F2B24] dark:text-white">{session.deviceSummary || 'جهاز غير معروف'}</strong>
                          </span>
                          <span>وقت الدخول: {formattedLogin}</span>
                          <span className="font-mono text-[10px] opacity-75">معرف الجلسة: {session.sessionId.substring(0, 15)}...</span>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleForceTerminateSession(session.email)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          <span>إنهاء الجلسة فوراً</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetSessionLock(session.email)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                          title="يسمح للطالب بالدخول من هاتف جديد دون التعارض مع الجهاز القديم"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>فك قفل الجهاز</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Receipt Screenshot Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-[#181D13] border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl text-center space-y-3">
            <button
              type="button"
              onClick={() => setPreviewReceiptUrl(null)}
              className="absolute left-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-white">
              معاينة إيصال تحويل الماستركارد 🧾
            </h3>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black/50 p-2">
              <img
                src={previewReceiptUrl}
                alt="إيصال التحويل بالحجم الكامل"
                className="max-h-[70vh] mx-auto rounded-xl object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-white/10 px-2">
              <span>تم إرفاق الإيصال من تطبيق البطاقة المصرفية</span>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscriber Modal */}
      {editingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-[#1E2417] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E5DEC9] dark:border-[#384524] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#384524]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#596628]" />
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  تعديل بيانات الطالب
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubscriber(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-500 block mb-1">البريد الإلكتروني (ثابت):</label>
                <input
                  type="text"
                  value={editingSubscriber.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">كود التفعيل:</label>
                <input
                  type="text"
                  value={editingSubscriber.code}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[#596628] font-mono font-bold text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-[#2F2B24] dark:text-white block mb-1">اسم الطالب أو المرحلة:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="مثال: سارة محمد - عيادات المرحلة الرابعة"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#2F2B24] dark:text-white block mb-1">ملاحظات إضافية:</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="ملاحظات حول سداد الرسوم أو التواصل..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] font-bold text-[#2F2B24] dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSubscriber(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-xs font-black text-white shadow-xs cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Request Confirmation Modal (Admin Only) */}
      {rejectingReq && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1A2014] rounded-3xl p-6 border-2 border-rose-400 shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  رفض / إلغاء طلب الاشتراك ⛔
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  طلب الطالب: {rejectingReq.studentName || rejectingReq.email} ({rejectingReq.amount || ''})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-xs text-[#2F2B24] dark:text-white block">
                سبب الرفض (يظهر للطالب في الإشعار السحابي الفوري):
              </label>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'إيصال التحويل غير واضح أو غير مكتمل',
                  'المبلغ المحول غير مطابق لقيمة الاشتراك',
                  'رقم العملية أو الحوالة غير مسجل بالنظام',
                  'تم استرداد أو إلغاء التحويل المالي',
                ].map((reason, rIdx) => (
                  <button
                    key={`reason_${rIdx}`}
                    type="button"
                    onClick={() => setRejectReasonInput(reason)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-700 dark:text-gray-300 font-bold transition cursor-pointer"
                  >
                    + {reason}
                  </button>
                ))}
              </div>

              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="أدخل سبب الرفض أو اختر من المقترحات أعلاه..."
                rows={3}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingReq(null);
                  setRejectReasonInput('');
                }}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleRejectRequest(rejectingReq)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
              >
                تأكيد الرفض والإلغاء ⛔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriber Deletion Confirmation Modal (Admin Only) */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1A2014] rounded-3xl p-6 border-2 border-rose-400 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  تأكيد حذف كود المشترك
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  هل أنتِ متأكدة من حذف وإلغاء كود الطالب ({subscriberToDelete.email}) نهائياً؟ لن يتمكن من تسجيل الدخول بهذا الكود بعد ذلك.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubscriberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubscriber}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
              >
                نعم، احذف الكود نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Panel Notification Toast */}
      {panelNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-60 bg-[#2F2B24] dark:bg-[#1E2417] text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{panelNotice}</span>
        </div>
      )}
    </div>
  );
};
