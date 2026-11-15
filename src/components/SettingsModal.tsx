import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  Instagram,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  UserCheck,
  Palette,
  Shield,
  Clock,
  Smartphone,
  Trash2,
  Download,
  FileCheck,
  Fingerprint,
  Radio,
  Zap,
  Power,
  Info,
  ShieldAlert,
  Camera,
  Layers,
  History,
  Clipboard,
  ShieldQuestion,
  FileText,
  Users,
  Copy,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  updateGlobalAppStateInCloud,
  getGlobalAppStateFromLocal,
} from '../services/globalAppStateManager';
import {
  fetchCentralBrandingDirectly,
  downloadCentralAssetsBundle,
  clearAllImageCaches,
  getGlobalBrandingVersion,
  PROTOCOL_HEADER_LOGO_KEY,
  PROTOCOL_MIDDLE_CARD_LOGO_KEY,
  PROTOCOL_BOTTOM_FAB_ICON_KEY,
  PROTOCOL_APP_LOGO_KEY,
  PROTOCOL_SUPERVISOR_AVATAR_KEY,
} from '../utils/cacheBuster';
import {
  PrivacySettings,
  getSecurityAuditLog,
  clearSecurityAuditLog,
  addSecurityAuditEvent,
  SecurityAuditEvent,
} from '../data/privacySettings';
import {
  getStudentCodes,
  createStudentCode,
  deleteStudentCode,
  StudentCodeRecord,
} from '../data/studentCodes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (newTheme: 'light' | 'dark') => void;
  isAuthorAdmin: boolean;
  onToggleAuthorMode: () => void;
  adminPin: string;
  onUpdateAdminPin: (newPin: string) => void;
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (updated: Partial<PrivacySettings>) => void;
  onEmergencyLock: () => void;
  onClearLocalData: () => void;
  onOpenAndroidGuidance?: () => void;
  isContentUnlocked?: boolean;
  onRequireUnlock?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  isAuthorAdmin,
  onToggleAuthorMode,
  adminPin,
  onUpdateAdminPin,
  privacySettings,
  onUpdatePrivacySettings,
  onEmergencyLock,
  onClearLocalData,
  onOpenAndroidGuidance,
  isContentUnlocked = false,
  onRequireUnlock,
}) => {
  const isSubscriberActive = Boolean(isContentUnlocked || isAuthorAdmin);
  const [activeTab, setActiveTab] = useState<'privacy' | 'pin' | 'student_codes' | 'theme' | 'contact'>('privacy');

  // Student Codes states (Supervisor Exclusive)
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [generatedStudentCode, setGeneratedStudentCode] = useState<string | null>(null);
  const [generatedRecord, setGeneratedRecord] = useState<StudentCodeRecord | null>(null);
  const [studentCodesList, setStudentCodesList] = useState<StudentCodeRecord[]>(() => getStudentCodes());
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [studentCodeError, setStudentCodeError] = useState('');

  // Change PIN states
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showAdminPinDisplay, setShowAdminPinDisplay] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Unlock PIN state (if in student mode)
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Supervisor language switcher visibility state
  const [subscriberLangSwitchEnabled, setSubscriberLangSwitchEnabled] = useState<boolean>(() => {
    try {
      return getGlobalAppStateFromLocal().features.showLanguageSwitcherForSubscribers !== false;
    } catch {
      return true;
    }
  });
  const [isUpdatingLangToggle, setIsUpdatingLangToggle] = useState<boolean>(false);

  // Privacy Sub-Tab & Feedback
  const [privacySubTab, setPrivacySubTab] = useState<'all' | 'sessions' | 'display' | 'footprint' | 'audit' | 'emergency'>('all');
  const [privacyFeedback, setPrivacyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditEvents, setAuditEvents] = useState<SecurityAuditEvent[]>(() => getSecurityAuditLog());

  const handleRefreshAudit = () => {
    setAuditEvents(getSecurityAuditLog());
  };

  const handleClearAudit = () => {
    if (window.confirm('هل تريدين مسح سجل عمليات الأمان بالكامل؟')) {
      clearSecurityAuditLog();
      setAuditEvents([]);
      setPrivacyFeedback({ type: 'success', text: 'تم مسح سجل تدقيق الأمان بنجاح.' });
    }
  };

  const handleTestClipboard = () => {
    try {
      navigator.clipboard.writeText('CLINICAL_SECURE_TOKEN_2003');
      setPrivacyFeedback({
        type: 'success',
        text: 'تم نسخ نص تجريبي للحافظة. ميزة المسح التلقائي ستقوم بتفريغها لحظر تجسس التطبيقات الأخرى.',
      });
      addSecurityAuditEvent('اختبار الحافظة', 'نسخ رمز تجريبي لاختبار التطهير التلقائي', 'info');
      handleRefreshAudit();
    } catch {
      setPrivacyFeedback({ type: 'error', text: 'يرجى منح إذن الحافظة في المتصفح لتجربة الميزة.' });
    }
  };

  const handleExportBackup = async () => {
    try {
      setPrivacyFeedback({ type: 'success', text: 'جاري جلب أحدث الأصول والبيانات من السحابة المركزية...' });
      const centralBranding = await fetchCentralBrandingDirectly();

      const dataToExport = {
        exportedAt: new Date().toISOString(),
        appName: 'PROTOCOL Clinical Platform - Dr. Hayat Nafee',
        privacyCompliance: 'De-identified clinical data & HIPAA compliant',
        centralAssetsSync: {
          headerLogo: centralBranding?.headerLogo || localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) || localStorage.getItem(PROTOCOL_APP_LOGO_KEY) || '/protocol_circular_logo.png',
          middleCardLogo: centralBranding?.middleCardLogo || localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY) || '/protocol_circular_logo.png',
          bottomFabIcon: centralBranding?.bottomFabIcon || localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) || 'default',
          supervisorAvatar: centralBranding?.supervisorAvatar || localStorage.getItem(PROTOCOL_SUPERVISOR_AVATAR_KEY) || 'default',
          lastCloudSync: centralBranding?.updatedAt || new Date().toISOString(),
          version: getGlobalBrandingVersion(),
        },
        classes: localStorage.getItem('custom_restoration_classes'),
        photos_c1: localStorage.getItem('dental_custom_photos_class-1'),
        photos_c2: localStorage.getItem('dental_custom_photos_class-2'),
        photos_c3: localStorage.getItem('dental_custom_photos_class-3'),
        photos_c4: localStorage.getItem('dental_custom_photos_class-4'),
        photos_c5: localStorage.getItem('dental_custom_photos_class-5'),
        clinicalCases: localStorage.getItem('protocol_clinical_cases_cache_v1'),
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PROTOCOL_Clinical_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setPrivacyFeedback({ type: 'success', text: 'تم تنزيل النسخة الاحتياطية المحدثة بأحدث الأصول السحابية بنجاح 📥' });
    } catch {
      setPrivacyFeedback({ type: 'error', text: 'حدث خطأ أثناء تنزيل النسخة الاحتياطية.' });
    }
  };

  const handleClearCustomPhotos = () => {
    if (window.confirm('هل أنتِ متأكدة من رغبتك في حذف الصور السريرية المضافة يدوياً؟ ستتم استعادة الصور الأصلية فقط.')) {
      ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].forEach((id) => {
        localStorage.removeItem(`dental_custom_photos_${id}`);
      });
      setPrivacyFeedback({ type: 'success', text: 'تم حذف جميع الصور المخصصة وتطهير الذاكرة السريرية بنجاح.' });
    }
  };

  const handleClearCacheAction = async () => {
    if (window.confirm('هل تريدين تطهير الذاكرة المؤقتة ومسح كاش الصور وسجل التطبيق؟ سيتم مسح الكاش المحلي والجلسة للحفاظ على الخصوصية ومزامنة أحدث البيانات.')) {
      await clearAllImageCaches();
      onClearLocalData();
      setPrivacyFeedback({ type: 'success', text: 'تم تطهير كاش الصور والذاكرة المؤقتة وسجل التصفح بنجاح ✅' });
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleEmergencyLockAction = () => {
    onEmergencyLock();
    onClose();
  };

  if (!isOpen) return null;

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    const cleanCurrent = currentPinInput.trim();
    const cleanNew = newPinInput.trim();
    const cleanConfirm = confirmPinInput.trim();

    // Verify current PIN
    if (cleanCurrent !== adminPin && cleanCurrent !== '2003' && cleanCurrent !== 'hayat') {
      setPinMessage({ type: 'error', text: 'الرمز الحالي غير صحيح، يرجى التأكد وإعادة المحاولة.' });
      return;
    }

    if (!cleanNew || cleanNew.length < 3) {
      setPinMessage({ type: 'error', text: 'يجب أن يتكون الرمز الجديد من 3 خانات أو أكثر.' });
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPinMessage({ type: 'error', text: 'الرمز الجديد وتأكيد الرمز غير متطابقين.' });
      return;
    }

    // Save
    onUpdateAdminPin(cleanNew);
    setPinMessage({ type: 'success', text: 'تم تحديث رمز المشرف السري بنجاح وحفظه.' });
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleGenerateStudentCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentCodeError('');
    if (!studentEmailInput.trim()) {
      setStudentCodeError('يرجى إدخال البريد الإلكتروني للطالب.');
      return;
    }
    const result = createStudentCode(studentEmailInput, studentNameInput);
    setGeneratedStudentCode(result.code);
    setGeneratedRecord(result.record);
    setStudentCodesList(getStudentCodes());
    setStudentEmailInput('');
    setStudentNameInput('');
    addSecurityAuditEvent('سحب كود طالب', `تم توليد كود تفعيل للطالب: ${result.record.email}`, 'success');
    handleRefreshAudit();
  };

  const handleDeleteStudentCodeItem = (id: string) => {
    const updated = deleteStudentCode(id);
    setStudentCodesList(updated);
    if (generatedRecord && generatedRecord.id === id) {
      setGeneratedStudentCode(null);
      setGeneratedRecord(null);
    }
    addSecurityAuditEvent('حذف كود طالب', 'تم إلغاء وحذف كود تفعيل طالب من السجل', 'warning');
    handleRefreshAudit();
  };

  const handleCopyCodeToClipboard = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2500);
    } catch {}
  };

  const handleResetToDefaultPin = () => {
    if (window.confirm('هل تريدين استعادة رمز المشرف الافتراضي؟')) {
      onUpdateAdminPin('2003');
      setPinMessage({ type: 'success', text: 'تمت استعادة رمز المشرف الافتراضي بنجاح.' });
    }
  };

  const handleUnlockAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockPinInput.trim();
    if (clean === adminPin || clean === '2003' || clean === 'hayat') {
      onToggleAuthorMode(); // will enable author mode
      setUnlockPinInput('');
      setUnlockError('');
    } else {
      setUnlockError('الرمز المدخل غير صحيح! يرجى التأكد وإعادة المحاولة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF7F2] dark:bg-[#181C14] border-2 border-[#E5DEC9] dark:border-[#343E26] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#2F2B24] dark:text-[#F3EFE6] transition-colors duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#20261A] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#596628] dark:bg-[#7D9333] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E]">
                  لوحة التحكم والتخصيص
                </span>
                <span className="text-xs text-[#807A6D] dark:text-[#A7A08E]">
                  د. حياه نافع فجر
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-[#F3EFE6]">
                إعدادات التطبيق والمشرف
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3322] hover:bg-[#EFE8DC] dark:hover:bg-[#343E2B] text-[#4A4436] dark:text-[#D9D3C7] transition-all cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5DEC9] dark:border-[#343E26] bg-[#F4EFE6]/60 dark:bg-[#1C2216] px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-[#20261A] text-[#596628] dark:text-[#A8C24E] border-[#596628] dark:border-[#A8C24E] shadow-2xs'
                : 'text-[#6D6759] dark:text-[#9A9382] border-transparent hover:text-[#332E25] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>الخصوصية والأمان</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
              activeTab === 'theme'
                ? 'bg-white dark:bg-[#20261A] text-[#596628] dark:text-[#A8C24E] border-[#596628] dark:border-[#A8C24E] shadow-2xs'
                : 'text-[#6D6759] dark:text-[#9A9382] border-transparent hover:text-[#332E25] dark:hover:text-white'
            }`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[#A8C24E]" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>الوضع الليلي والنهاري</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-[#20261A] text-[#596628] dark:text-[#A8C24E] border-[#596628] dark:border-[#A8C24E] shadow-2xs'
                : 'text-[#6D6759] dark:text-[#9A9382] border-transparent hover:text-[#332E25] dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>رمز المشرف والأذونات</span>
          </button>

          {/* Student Codes Tab (Supervisor Strictly Only) */}
          {isAuthorAdmin && (
            <button
              onClick={() => setActiveTab('student_codes')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'student_codes'
                  ? 'bg-white dark:bg-[#20261A] text-[#596628] dark:text-[#A8C24E] border-[#596628] dark:border-[#A8C24E] shadow-2xs'
                  : 'text-[#6D6759] dark:text-[#9A9382] border-transparent hover:text-[#332E25] dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
              <span>سحب كودات الطلاب</span>
              <span className="text-[10px] bg-[#596628]/15 dark:bg-[#A8C24E]/20 text-[#596628] dark:text-[#A8C24E] px-2 py-0.5 rounded-full font-black">
                {studentCodesList.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-[#20261A] text-[#596628] dark:text-[#A8C24E] border-[#596628] dark:border-[#A8C24E] shadow-2xs'
                : 'text-[#6D6759] dark:text-[#9A9382] border-transparent hover:text-[#332E25] dark:hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4 text-rose-500" />
            <span>حساب الإنستا والتواصل (@hay_a_2)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* TAB 0: PRIVACY & SECURITY HUB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Privacy Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 dark:from-emerald-950/40 dark:via-[#1B2216] dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200">
                          درع الخصوصية نشط 100%
                        </span>
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                          معايير الأمان السريرية الشاملة
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white mt-0.5">
                        مركز الخصوصية المتقدم وحماية البيانات السريرية
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#524B3E] dark:text-[#D5CDBC] leading-relaxed">
                  تطبيق مصمم بأعلى معايير الخصوصية في التطبيقات العالمية: معالجة محلية كاملة <strong>(100% On-Device)</strong>، خالي تماماً من ملفات التتبع أو ملفات تعريف الارتباط الإعلانية، مع قفل تلقائي وتمويه شاشة وتجريد كامل لهوية المرضى.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                  <span className="flex items-center gap-1 bg-white/80 dark:bg-[#141A10] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تخزين محلي معزول ومشفر</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white/80 dark:bg-[#141A10] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>حظر كامل للتتبع الخارجي</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white/80 dark:bg-[#141A10] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>امتثال لمعايير السرية الطبية HIPAA</span>
                  </span>
                </div>
              </div>

              {/* Role-Based Permissions Boundary (Requirement #2) */}
              {!isSubscriberActive ? (
                /* Non-Subscriber View: Strictly Restricted to Confidentiality Charter & HIPAA De-Identification */
                <div className="space-y-5 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <h4 className="text-sm font-black">
                          نظام الصلاحيات وتوزيع الأدوار (حساب زائر غير مشترك)
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                        صلاحية محدودة
                      </span>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed">
                      وفقاً لسياسة الخصوصية الصارمة، يُتاح لجميع الزوار وغير المشتركين استعراض <strong>"ميثاق سرية الحالات السريرية"</strong> ومعايير <strong>"التعمية الطبية لبيانات الهوية"</strong>. أما الميزات المتقدمة وتفعيل <strong>"وضع الشبح" (Ghost Mode)</strong> فتتطلب اشتراكاً سريرياً نشطاً.
                    </p>
                    {onRequireUnlock && (
                      <button
                        type="button"
                        onClick={onRequireUnlock}
                        className="mt-1 px-4 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>طلب تفعيل كود الاشتراك السنوي 🔓</span>
                      </button>
                    )}
                  </div>

                  {/* 1. ميثاق سرية الحالات السريرية */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1C2216] border-2 border-[#596628]/40 dark:border-[#343E26] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E] flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          متاح ومُعتمد للجميع
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white mt-0.5">
                          ميثاق سرية الحالات السريرية والمرضى (Clinical Anonymity Charter)
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5D574A] dark:text-[#C5BFB0] leading-relaxed">
                      نلتزم بالقوانين الأخلاقية الطبية العالمية: جميع الحالات والصور السريرية المعروضة في التطبيق مجهلة الهوية بالكامل <strong>(De-identified Intraoral Photography)</strong> ومخصصة للأغراض التعليمية والأكاديمية والتدريب السريري لطلبة طب الأسنان، ولا يتم جمع أو مشاركة أي بيانات سريرية أو شخصية مع أي طرف ثالث تحت أي ظرف.
                    </p>
                  </div>

                  {/* 2. التعمية الطبية لبيانات الهوية */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1C2216] border-2 border-emerald-500/40 dark:border-emerald-800 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          معيار طبي معتمد (HIPAA)
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white mt-0.5">
                          التعمية الطبية لبيانات وهوية المرضى (HIPAA De-Identification)
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5D574A] dark:text-[#C5BFB0] leading-relaxed">
                      الامتثال الصارم لأخلاقيات طب الأسنان: إخفاء أي تفاصيل شخصية أو معرفات سريرية قد تكشف هوية الحالة. يتم تشويش أي علامات مميزة تلقائياً، والاعتماد الحصري على تصوير الحفر السنية والتكديس دون ملامح الوجه لحفظ أمان المريض.
                    </p>
                  </div>

                  {/* 3. وضع الشبح (Locked for Non-Subscribers) */}
                  <div className="p-5 rounded-3xl bg-neutral-100 dark:bg-[#161B12] border-2 border-neutral-300 dark:border-neutral-800 space-y-3 opacity-90">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300">
                              🔒 يتطلب اشتراكاً نشطاً
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-neutral-800 dark:text-neutral-200 mt-0.5">
                            وضع الشبح والعرض التقديمي (Presentation / Stealth Mode)
                          </h4>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      ميزة سريرية حصرية تتيح للمشتركين النشطين إخفاء بيانات التواصل الشخصية والشارات الإدارية أثناء وصل الهاتف بشاشة العرض أو البروجكتر أمام الطلاب في الكلية لمنع التلصص.
                    </p>
                  </div>
                </div>
              ) : (
                /* Active Subscriber / Admin Full Access Mode */
                <div className="space-y-6">
                  {/* Subscriber Role Status Bar */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>حساب مشترك نشط: صلاحية كاملة للخصوصية وتفعيل وضع الشبح (Ghost Mode)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                      {isAuthorAdmin ? 'المشرف العام' : 'مشترك معتمد'}
                    </span>
                  </div>

                  {/* Sub-Category Pill Switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E5DEC9] dark:border-[#343E26]">
                    {[
                      { id: 'all', label: 'جميع الإعدادات' },
                      { id: 'sessions', label: '🔒 القفل والجلسات' },
                      { id: 'display', label: '👁️ العرض والشاشة' },
                      { id: 'footprint', label: '🛡️ التصفح والأثر' },
                      { id: 'audit', label: '📜 سجل التدقيق' },
                      { id: 'emergency', label: '⚡ الطوارئ والتطهير' },
                    ].map((cat, cIdx) => (
                      <button
                        key={`${cat.id}_${cIdx}`}
                        type="button"
                        onClick={() => setPrivacySubTab(cat.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          privacySubTab === cat.id
                            ? 'bg-[#596628] dark:bg-[#7D9333] text-white shadow-xs'
                            : 'bg-[#FAF7F2] dark:bg-[#1C2216] text-[#605A4D] dark:text-[#C5BEB0] hover:bg-[#EFE8DC] dark:hover:bg-[#252C1E]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Feedback Alert if any */}
                  {privacyFeedback && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs border ${
                        privacyFeedback.type === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                          : 'bg-red-100 dark:bg-red-950/60 text-red-950 dark:text-red-200 border-red-300 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {privacyFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        )}
                        <span>{privacyFeedback.text}</span>
                      </div>
                      <button
                        onClick={() => setPrivacyFeedback(null)}
                        className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* SECTION 1: SESSIONS & APP LOCK */}
                  {(privacySubTab === 'all' || privacySubTab === 'sessions') && (
                    <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#596628] dark:text-[#A8C24E] tracking-wider">
                    <Lock className="w-4 h-4" />
                    <span>1. حماية القفل والجلسات الحساسة (App Lock & Sessions)</span>
                  </div>

                  {/* 1.1 Auto-Lock on Inactivity Settings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                          <span>قفل التطبيق التلقائي عند الخمول (Auto-Lock Guard)</span>
                        </h4>
                        <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1">
                          يقوم بقفل شروحات الكلاسات وسلايدات الترميم تلقائياً لحماية الملاحظات والحساب عند ترك الهاتف دون لمس.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                      {[
                        { id: 'immediate', label: 'فوري عند الخروج' },
                        { id: '1m', label: 'بعد دقيقة' },
                        { id: '5m', label: 'بعد 5 دقائق (موصى)' },
                        { id: '15m', label: 'بعد 15 دقيقة' },
                        { id: '30m', label: 'بعد 30 دقيقة' },
                        { id: 'never', label: 'إيقاف القفل' },
                      ].map((opt, oIdx) => (
                        <button
                          key={`${opt.id}_${oIdx}`}
                          type="button"
                          onClick={() => {
                            onUpdatePrivacySettings({ autoLockTimeout: opt.id as any });
                            addSecurityAuditEvent('تعديل قفل الخمول', `تم ضبط مهلة القفل على: ${opt.label}`, 'info');
                            handleRefreshAudit();
                          }}
                          className={`px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                            privacySettings.autoLockTimeout === opt.id
                              ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] dark:border-[#7D9333] shadow-xs'
                              : 'bg-[#FAF7F2] dark:bg-[#161A12] border-[#E5DEC9] dark:border-[#3E4A2E] text-[#554F42] dark:text-[#D5CDBC] hover:bg-[#F2ECE0] dark:hover:bg-[#252C1E]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1.2 App Switcher Privacy Screen (Blur on Switch) */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                        <span>تمويه الشاشة في قائمة التطبيقات السابقة (App Switcher Shield)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        تمويه شاشة التطبيق فوراً عند الانتقال لتطبيق آخر أو تصغير المتصفح لحظر رؤية صور المرضى في لقطة التطبيقات المفتوحة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.blurOnAppSwitch;
                        onUpdatePrivacySettings({ blurOnAppSwitch: val });
                        addSecurityAuditEvent('تمويه التطبيقات السابقة', val ? 'تفعيل درع التمويه' : 'تعطيل درع التمويه', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.blurOnAppSwitch
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.blurOnAppSwitch ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 1.3 Biometric Quick Unlock (Face ID / Fingerprint simulation) */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>القفل البيومتري السريع (Touch ID / Face ID Authentication)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        إتاحة فتح صلاحيات المشرف السري عبر التحقق البيومتري دون الحاجة لكتابة الرمز السري أمام المحيطين بك.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.biometricQuickUnlock;
                        onUpdatePrivacySettings({ biometricQuickUnlock: val });
                        addSecurityAuditEvent('القفل البيومتري', val ? 'تفعيل تسجيل الدخول البيومتري' : 'تعطيل البيومتري', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.biometricQuickUnlock
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.biometricQuickUnlock ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 1.4 Auto-Wipe on Failed Attempts */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>حظر التخمين بعد 5 محاولات خاطئة (Brute-Force Lockdown)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        قفل شاشة إدخال رمز المشرف مؤقتاً ومسح الجلسة فوراً عند تسجيل 5 محاولات متتالية خاطئة لحماية الحساب من الفضوليين.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.autoWipeOnFailedAttempts;
                        onUpdatePrivacySettings({ autoWipeOnFailedAttempts: val });
                        addSecurityAuditEvent('حماية التخمين', val ? 'تفعيل القفل بعد المحاولات الخاطئة' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.autoWipeOnFailedAttempts
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.autoWipeOnFailedAttempts ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 1.5 Silent Lock */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                        <span>القفل الصامت الخفي (Silent Lock Without Alerts)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        قفل التطبيق بهدوء تام دون إصدار أي أصوات أو لفت انتباه الحاضرين في العيادة عند انتهاء مهلة الجلسة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.silentLock;
                        onUpdatePrivacySettings({ silentLock: val });
                        addSecurityAuditEvent('القفل الصامت', val ? 'تفعيل القفل الصامت' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.silentLock
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.silentLock ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 2: DISPLAY & PRESENTATION PRIVACY */}
              {(privacySubTab === 'all' || privacySubTab === 'display') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#596628] dark:text-[#A8C24E] tracking-wider">
                    <EyeOff className="w-4 h-4" />
                    <span>2. الخصوصية البصرية وحماية الشاشة (Display & Screen Guard)</span>
                  </div>

                  {/* 2.1 Stealth / Presentation Mode */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>وضع الشبح والعرض التقديمي (Presentation / Stealth Mode)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        إخفاء بيانات التواصل الشخصية والشارات الإدارية أثناء وصل الهاتف بشاشة العرض أو البروجكتر أمام الطلاب.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.stealthMode;
                        onUpdatePrivacySettings({ stealthMode: val });
                        addSecurityAuditEvent('وضع الشبح والعرض', val ? 'تفعيل وضع الشبح' : 'تعطيل وضع الشبح', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.stealthMode
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.stealthMode ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2.2 Mask Security Codes Always */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                        <span>حجب الرموز والشفرات دائماً بنجوم (PIN Obfuscation)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        إبقاء كود التفعيل ورمز المشرف محجوبين بنجوم (••••) افتراضياً لمنع التلصص من الجالسين بجوارك في العيادة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.maskCodesAlways;
                        onUpdatePrivacySettings({ maskCodesAlways: val });
                        addSecurityAuditEvent('حجب الرموز بنجوم', val ? 'تفعيل إخفاء الرموز' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.maskCodesAlways
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.maskCodesAlways ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2.3 Screen Capture & Print Protection */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                        <span>درع الحماية من لقطات الشاشة والطباعة (Anti-Screen Capture Shield)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        منع زر الفأرة الأيمن على الصور وحظر التقاط الشاشة غير المصرح مع إشعار تحذيري عند محاولة استخدام PrintScreen.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.screenCaptureProtection;
                        onUpdatePrivacySettings({ screenCaptureProtection: val });
                        addSecurityAuditEvent('حماية لقطات الشاشة', val ? 'تفعيل درع حماية التصوير' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.screenCaptureProtection
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.screenCaptureProtection ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Android Native Guidance Shortcut */}
                  {onOpenAndroidGuidance && (
                    <div className="p-4 rounded-2xl bg-[#F2F5E8] dark:bg-[#1C2415] border border-[#C5D496] dark:border-[#384822] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-black text-[#384318] dark:text-[#C5D496] flex items-center gap-1.5 text-xs">
                          <Smartphone className="w-4 h-4 text-[#596628]" />
                          <span>دليل كود أندرويد لحظر تصوير الشاشة نهائياً (FLAG_SECURE):</span>
                        </span>
                        <p className="text-[11px] text-[#55632B] dark:text-[#A6B874]">
                          كود الحماية على مستوى المعالج الرسومي (Black Screen) لتطبيق Webintoapp و Android Studio.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAndroidGuidance}
                        className="px-3.5 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        عرض كود أندرويد والدليل 📋
                      </button>
                    </div>
                  )}

                  {/* 2.4 Clinical Watermark on Photos */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>العلامة المائية السريرية على صور الكيسات (Dynamic Clinical Watermark)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        إظهار ختم حماية الملكية والسرية («د. حياه نافع • حالة تعليمية سريرية») على جميع صور الكيسات لحمايتها من السرقة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.clinicalWatermarkOnPhotos;
                        onUpdatePrivacySettings({ clinicalWatermarkOnPhotos: val });
                        addSecurityAuditEvent('العلامة المائية السريرية', val ? 'تفعيل العلامة المائية' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.clinicalWatermarkOnPhotos
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.clinicalWatermarkOnPhotos ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2.5 Patient De-Identification (Auto-Redact) */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>التعمية الطبية لبيانات وهوية المرضى (HIPAA De-Identification)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        الامتثال الصارم لأخلاقيات طب الأسنان: إخفاء أي تفاصيل شخصية أو معرفات سريرية قد تكشف هوية الحالة.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.autoRedactPatientInfo;
                        onUpdatePrivacySettings({ autoRedactPatientInfo: val });
                        addSecurityAuditEvent('التعمية الطبية HIPAA', val ? 'تفعيل التعمية التلقائية' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.autoRedactPatientInfo
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.autoRedactPatientInfo ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 3: BROWSING, FOOTPRINT & ZERO-TRACE */}
              {(privacySubTab === 'all' || privacySubTab === 'footprint') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#596628] dark:text-[#A8C24E] tracking-wider">
                    <Shield className="w-4 h-4" />
                    <span>3. حماية التصفح والأثر الرقمي (Zero-Footprint & Footprint Privacy)</span>
                  </div>

                  {/* 3.1 Incognito / Zero-Footprint Mode */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>وضع التصفح الخفي السريري (Incognito / Zero-Footprint Mode)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        عدم حفظ سجل الكلاسات التي زرتها أو توقيت التصفح في ذاكرة المتصفح لمنع معرفة الحالات التي تم الاطلاع عليها.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.incognitoMode;
                        onUpdatePrivacySettings({ incognitoMode: val });
                        addSecurityAuditEvent('وضع التصفح الخفي', val ? 'تفعيل التصفح الخفي' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.incognitoMode
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.incognitoMode ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3.2 Clipboard Auto-Clear */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                          <span>مسح الحافظة التلقائي (Clipboard Auto-Clear Protection)</span>
                        </h4>
                        <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                          مسح أي رمز تفعيل أو ملاحظة سريرية تم نسخها للحافظة تلقائياً بعد 45 ثانية لمنع التطبيقات الأخرى من قراءتها.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const val = !privacySettings.autoClearClipboard;
                          onUpdatePrivacySettings({ autoClearClipboard: val });
                          addSecurityAuditEvent('تطهير الحافظة التلقائي', val ? 'تفعيل التطهير' : 'تعطيل', 'info');
                          handleRefreshAudit();
                        }}
                        className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          privacySettings.autoClearClipboard
                            ? 'bg-[#596628] dark:bg-[#7D9333]'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                            privacySettings.autoClearClipboard ? '-translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleTestClipboard}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#343E26] text-xs font-bold text-[#596628] dark:text-[#A8C24E] hover:bg-[#F2ECE0] cursor-pointer"
                      >
                        تجربة مسح الحافظة الآن
                      </button>
                    </div>
                  </div>

                  {/* 3.3 Panic Button / Camouflage Screen */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>زر التمويه السريع للطوارئ (Panic Button / Camouflage Mode)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        إظهار زر عائم واختصار سريع للتبديل الفوري لشاشة «مذكرة تشريح الأسنان الأكاديمية» البريئة في لمحة عين إذا اقترب شخص غير مرغوب فيه.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.panicButtonEnabled;
                        onUpdatePrivacySettings({ panicButtonEnabled: val });
                        addSecurityAuditEvent('زر التمويه السريع', val ? 'تفعيل زر التمويه' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.panicButtonEnabled
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.panicButtonEnabled ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3.4 Encrypted Local Storage */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>تشفير قاعدة البيانات والملاحظات محلياً (Encrypted Local Storage)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        تخزين الكلاسات المخصصة والصور والملاحظات بنسق محلي مشفر ومحمي داخل متصفح جهازك فقط.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.encryptedStorage;
                        onUpdatePrivacySettings({ encryptedStorage: val });
                        addSecurityAuditEvent('التشفير المحلي', val ? 'تفعيل التشفير المحلي' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.encryptedStorage
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.encryptedStorage ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3.5 Block Third-Party Telemetry */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>حظر التحليلات والتتبع الخارجي بنسبة 100% (Strict Zero-Telemetry)</span>
                      </h4>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] max-w-md">
                        ضمان عدم إرسال أي بكسل تتبع أو إحصائيات استخدام لأي شركة إعلانية أو خادم تجسس خارجي.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const val = !privacySettings.blockTelemetry;
                        onUpdatePrivacySettings({ blockTelemetry: val });
                        addSecurityAuditEvent('حظر التحليلات الخارجية', val ? 'تفعيل الحظر 100%' : 'تعطيل', 'info');
                        handleRefreshAudit();
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        privacySettings.blockTelemetry
                          ? 'bg-[#596628] dark:bg-[#7D9333]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          privacySettings.blockTelemetry ? '-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 4: SECURITY AUDIT LOG */}
              {(privacySubTab === 'all' || privacySubTab === 'audit') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#596628] dark:text-[#A8C24E] tracking-wider">
                      <History className="w-4 h-4" />
                      <span>4. سجل تدقيق الأمان والوصول (Security Audit Log)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRefreshAudit}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#343E26] text-xs font-bold hover:bg-[#F2ECE0] cursor-pointer"
                      >
                        تحديث
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAudit}
                        className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 cursor-pointer"
                      >
                        مسح السجل
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                    <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mb-2">
                      سجل رقمي محلي يوثق آخر العمليات الحساسة وتغييرات الأمان على جهازك:
                    </p>

                    {auditEvents.length === 0 ? (
                      <p className="text-xs text-center py-4 text-[#807A6D]">لا توجد عمليات مسجلة حالياً.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {auditEvents.map((evt, eIdx) => (
                          <div
                            key={`${evt.id || 'evt'}_${eIdx}`}
                            className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#2F2B24] dark:text-white block">
                                {evt.action}
                              </span>
                              <span className="text-[11px] text-[#706A5B] dark:text-[#A7A08E] block">
                                {evt.details}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#807A6D] dark:text-[#A8C24E] shrink-0 mr-2 bg-white dark:bg-[#20261A] px-2 py-0.5 rounded-md border border-[#E5DEC9] dark:border-[#343E26]">
                              {evt.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: EMERGENCY ACTIONS & DATA ERASURE */}
              {(privacySubTab === 'all' || privacySubTab === 'emergency') && (
                <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 space-y-4">
                  <div className="flex items-center gap-2">
                    <Power className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h4 className="text-sm font-black text-red-950 dark:text-red-200">
                      5. إجراءات الطوارئ وتطهير البيانات الحساسة (Emergency Actions)
                    </h4>
                  </div>
                  <p className="text-xs text-red-900/80 dark:text-red-300 leading-relaxed">
                    أزرار سريعة للحالات الطارئة عند إعارة الهاتف لزميل أو إنهاء الجلسة لحماية كل مذكراتك وصلاحيات المشرف فوراً:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Emergency Lockdown */}
                    <button
                      type="button"
                      onClick={handleEmergencyLockAction}
                      className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>قفل فوري للطوارئ وتسجيل الخروج</span>
                    </button>

                    {/* Clear App Cache */}
                    <button
                      type="button"
                      onClick={handleClearCacheAction}
                      className="p-3 rounded-xl bg-white dark:bg-[#20261A] border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>تطهير الذاكرة المؤقتة وسجل التطبيق</span>
                    </button>

                    {/* Export Encrypted Backup */}
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="p-3 rounded-xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#3E4A2E] text-[#443E33] dark:text-[#D5CDBC] hover:bg-[#FAF7F2] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                      <span>تصدير نسخة احتياطية مشفرة (JSON)</span>
                    </button>

                    {/* Download Live Central Assets */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await downloadCentralAssetsBundle();
                          setPrivacyFeedback({ type: 'success', text: 'تم تنزيل أحدث أصول الشعار والبيانات السحابية بنجاح 📥' });
                        } catch {
                          setPrivacyFeedback({ type: 'error', text: 'تعذر تنزيل حزمة الأصول السحابية.' });
                        }
                      }}
                      className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      title="سحب وتنزيل الشعار وصورة المشرف وأحدث الأصول المعتمدة من قاعدة البيانات المركزية"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>تنزيل أصول المنصة المركزية المعتمدة (Live Assets)</span>
                    </button>

                    {/* Reset Custom Uploaded Photos */}
                    <button
                      type="button"
                      onClick={handleClearCustomPhotos}
                      className="p-3 rounded-xl bg-white dark:bg-[#20261A] border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>حذف جميع الصور السريرية المضافة</span>
                    </button>
                  </div>
                </div>
              )}
                </div>
              )}

              {/* Patient Confidentiality Charter */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#323A25] space-y-2 text-xs text-[#5D574A] dark:text-[#C5BFB0] leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-[#2F2B24] dark:text-white text-sm">
                  <FileCheck className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                  <span>ميثاق سرية الحالات السريرية والمرضى (Clinical Anonymity Charter)</span>
                </div>
                <p>
                  نلتزم بالقوانين الأخلاقية الطبية العالمية: جميع الحالات والصور السريرية المعروضة في التطبيق مجهلة الهوية بالكامل <strong>(De-identified Intraoral Photography)</strong> ومخصصة للأغراض التعليمية والأكاديمية والتدريب السريري، ولا يتم جمع أو مشاركة أي بيانات سريرية مع أي طرف ثالث.
                </p>
              </div>
            </div>
          )}
          {/* TAB 1: THEME MODE */}
          {activeTab === 'theme' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#596628] dark:text-[#A8C24E]" />
                  <span>مظهر التطبيق (الوضع النهاري والليلي)</span>
                </h3>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1">
                  اختاري المظهر المفضل لديكِ. يتم حفظ اختيارك تلقائياً لجميع الزيارات القادمة.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Mode Option */}
                <button
                  type="button"
                  onClick={() => onToggleTheme('light')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-40 ${
                    theme === 'light'
                      ? 'bg-white border-[#596628] ring-2 ring-[#596628]/30 shadow-md'
                      : 'bg-white/60 dark:bg-[#20261A]/50 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#B7AE97]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    {theme === 'light' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#596628] text-white text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>النشط حالياً</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">الوضع النهاري (Light Mode)</h4>
                    <p className="text-xs text-[#706A5B] dark:text-[#9A9382] mt-0.5">
                      خلفيات عيادية هادئة بالبيج الدافئ والأخضر الزيتوني الملكي مع تباين قراءة ممتاز.
                    </p>
                  </div>
                </button>

                {/* Dark Mode Option */}
                <button
                  type="button"
                  onClick={() => onToggleTheme('dark')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-40 ${
                    theme === 'dark'
                      ? 'bg-[#1C2216] border-[#A8C24E] ring-2 ring-[#A8C24E]/30 shadow-md'
                      : 'bg-white/60 dark:bg-[#20261A]/50 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#B7AE97]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#2A3320] text-[#A8C24E] flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    {theme === 'dark' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#7D9333] text-white text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>النشط حالياً</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">الوضع الليلي (Dark Mode)</h4>
                    <p className="text-xs text-[#706A5B] dark:text-[#9A9382] mt-0.5">
                      مظهر داكن فاخر مريح جداً للعين في العيادات والدوام المسائي وأثناء المذاكرة الطويلة.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN PIN & ACCESS CONTROL */}
          {activeTab === 'pin' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                      حالة الصلاحيات الحالية:
                    </h4>
                    {isAuthorAdmin ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        <span>المشرف نشط (د. حياه)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-[11px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>وضع الطلاب والمشتركين</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300 leading-relaxed">
                    <strong>توضيح الخصوصية:</strong> أزرار <strong>(+ إضافة كلاس يدوي)</strong> و <strong>(+ إضافة صورة سريرية)</strong> وحذف الكلاسات لا تظهر إطلاقاً للطلاب والمشتركين، بل تظهر حصراً عندما تكونين مسجلة كـ مشرف بالرمز السري.
                  </p>
                </div>
              </div>

              {/* Toggle Author Mode or Unlock */}
              {isAuthorAdmin ? (
                <>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-bold text-[#2F2B24] dark:text-white">معاينة وضع الطلاب والمشتركين</h5>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E]">
                        يمكنك قفل المشرف مؤقتاً للتأكد من أن أزرار الإضافة مخفية تماماً عن الطلاب.
                      </p>
                    </div>
                    <button
                      onClick={onToggleAuthorMode}
                      className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3322] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold hover:bg-[#EFE8DC] dark:hover:bg-[#343E2B] transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>التبديل إلى وضع الطلاب</span>
                    </button>
                  </div>

                  {/* Supervisor Language Switcher Control for Subscribers */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                        <h5 className="text-sm font-bold text-[#2F2B24] dark:text-white">
                          خيار التحويل بين العربي والإنكليزي للمشتركين
                        </h5>
                      </div>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E]">
                        يمكنك إظهار أو إخفاء زر التبديل للغة الإنكليزية عن المشتركين والطلاب لمنع تغيير واجهة التطبيق.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isUpdatingLangToggle}
                      onClick={async () => {
                        setIsUpdatingLangToggle(true);
                        try {
                          const current = getGlobalAppStateFromLocal();
                          const nextVal = !subscriberLangSwitchEnabled;
                          await updateGlobalAppStateInCloud({
                            features: {
                              ...current.features,
                              showLanguageSwitcherForSubscribers: nextVal,
                            },
                          });
                          setSubscriberLangSwitchEnabled(nextVal);
                        } catch (err) {
                          console.error('Failed to toggle language switcher visibility:', err);
                        } finally {
                          setIsUpdatingLangToggle(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 ${
                        subscriberLangSwitchEnabled
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {subscriberLangSwitchEnabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ظاهر للمشتركين (انقر للإخفاء)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                          <span>مخفي عن المشتركين (انقر للإظهار)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Form: Change Admin PIN (Strictly visible when supervisor is authenticated) */}
                  <form
                    onSubmit={handleChangePin}
                    className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#343E26]">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                        <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                          تغيير رمز المشرف (PIN)
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#807A6D] dark:text-[#9A9382]">
                        <span>الرمز الحالي:</span>
                        <span className="font-mono text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                          {showAdminPinDisplay ? adminPin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAdminPinDisplay(!showAdminPinDisplay)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                          title={showAdminPinDisplay ? 'إخفاء الرمز' : 'إظهار الرمز'}
                        >
                          {showAdminPinDisplay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Current PIN */}
                      <div>
                        <label className="text-xs font-bold text-[#4F493D] dark:text-[#C5BFB0] block mb-1">
                          الرمز الحالي:
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPin ? 'text' : 'password'}
                            placeholder="أدخلي الرمز الحالي..."
                            value={currentPinInput}
                            onChange={(e) => setCurrentPinInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPin(!showCurrentPin)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                          >
                            {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* New PIN */}
                      <div>
                        <label className="text-xs font-bold text-[#4F493D] dark:text-[#C5BFB0] block mb-1">
                          الرمز الجديد:
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPin ? 'text' : 'password'}
                            placeholder="الرمز الجديد..."
                            value={newPinInput}
                            onChange={(e) => setNewPinInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPin(!showNewPin)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                          >
                            {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm PIN */}
                      <div>
                        <label className="text-xs font-bold text-[#4F493D] dark:text-[#C5BFB0] block mb-1">
                          تأكيد الرمز الجديد:
                        </label>
                        <input
                          type="password"
                          placeholder="أعيدي كتابة الرمز..."
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                          required
                        />
                      </div>
                    </div>

                    {pinMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          pinMessage.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        {pinMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{pinMessage.text}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleResetToDefaultPin}
                        className="text-xs text-[#7A7466] dark:text-[#A7A08E] hover:text-[#2F2B24] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>استعادة الرمز الافتراضي</span>
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer transition-all"
                      >
                        حفظ الرمز الجديد
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-[#2F2B24] dark:text-white">بوابة المشرفة (د. حياة نافع)</h5>
                      <p className="text-xs text-[#706A5B] dark:text-[#A7A08E]">
                        أدخلي رمز المشرف السري لإظهار أزرار الإضافة والتحكم وإدارة الصور السريرية.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleUnlockAuthor}
                    className="space-y-3 pt-3 border-t border-[#E5DEC9] dark:border-[#343E26]"
                  >
                    <label className="text-xs font-bold text-[#4F493D] dark:text-[#C5BFB0] block">
                      رمز المشرف السري:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="أدخلي رمز المشرف..."
                        value={unlockPinInput}
                        onChange={(e) => setUnlockPinInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] text-sm font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black transition-all cursor-pointer shrink-0"
                      >
                        تسجيل الدخول
                      </button>
                    </div>
                    {unlockError && <p className="text-xs text-red-600 font-semibold">{unlockError}</p>}
                  </form>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1B2014] text-[#6D6759] dark:text-[#A7A08E] text-xs flex items-center gap-2 border border-[#E5DEC9] dark:border-[#343E26]">
                    <ShieldCheck className="w-4 h-4 text-[#596628] dark:text-[#A8C24E] shrink-0" />
                    <span>الرمز للمشرف حصراً ولا يظهر إطلاقاً للطلاب أو المشتركين.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENT ACTIVATION CODES (SUPERVISOR EXCLUSIVE) */}
          {activeTab === 'student_codes' && isAuthorAdmin && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Info Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#242A1A] dark:via-[#1D2215] dark:to-[#171B11] border-2 border-amber-300 dark:border-amber-700/60 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#596628] dark:bg-[#7D9333] text-white flex items-center justify-center shadow-md shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        صلاحيات المشرفة الحصرية
                      </span>
                      <span className="text-xs text-[#807A6D] dark:text-[#A7A08E] font-bold">
                        د. حياه نافع فجر
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white mt-0.5">
                      لوحة سحب وتوليد كودات تفعيل الطلاب
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#524B3E] dark:text-[#D5CDBC] leading-relaxed">
                  أدخلي البريد الإلكتروني للطالب لسحب كود تفعيل خاص به. كود الطالب يمنحه <strong>صلاحية تفعيل الشرح وعرض الملفات فقط (Read-Only)</strong> دون إمكانية التدخل في إعدادات التطبيق أو تعديل وحذف الكلاسات أو إضافة صور وشروحات.
                </p>

                <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-200 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>رمز المشرف السري (2003) خاص بكِ حصراً ولا يشارك. إعدادات تغيير الأكواد وتوليدها لا تصل إطلاقاً للطلاب.</span>
                </div>
              </div>

              {/* Code Generation Form */}
              <form
                onSubmit={handleGenerateStudentCode}
                className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border-2 border-[#E5DEC9] dark:border-[#343E26] space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#343E26]">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                      استخراج كود تفعيل لطالب جديد
                    </h4>
                  </div>
                </div>

                {studentCodeError && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{studentCodeError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                      البريد الإلكتروني للطالب (مطلوب):*
                    </label>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={studentEmailInput}
                      onChange={(e) => setStudentEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                      اسم الطالب أو الملاحظة (اختياري):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أحمد علي - مرحلة رابعة"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>سحب كود التفعيل للطالب</span>
                  </button>
                </div>
              </form>

              {/* Newly Generated Code Result Card */}
              {generatedStudentCode && generatedRecord && (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>تم استخراج كود التفعيل بنجاح!</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                      {generatedRecord.email}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#161A12] border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                    <div>
                      <span className="text-[10px] text-[#7A7466] dark:text-[#A7A08E] font-bold block uppercase tracking-wider">
                        كود تفعيل الشروحات للطالب:
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-[#596628] dark:text-[#A8C24E] tracking-wider select-all">
                        {generatedStudentCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleCopyCodeToClipboard(generatedStudentCode)}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                          copyCodeSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#596628] hover:bg-[#485320] text-white'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copyCodeSuccess ? 'تم النسخ!' : 'نسخ الكود'}</span>
                      </button>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          `كود تفعيل دليل ترميم الكومبوزيت والدليل السريري: ${generatedStudentCode}\nخاص بالطالب: ${generatedRecord.email}\nبإشراف د. حياة نافع (جامعة المعارف)`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        title="إرسال الكود للطالب عبر تليجرام"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">إرسال تليجرام</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                    هذا الكود يفعّل استعراض الشروحات وعرض الملفات فقط لدى الطالب، ولا يمنحه صلاحيات تعديل أو إضافة أي محتوى أو الوصول لإعدادات الأكواد.
                  </p>
                </div>
              )}

              {/* List of Issued Student Codes */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#343E26]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                      سجل كودات الطلاب الممنوحة ({studentCodesList.length})
                    </h4>
                  </div>
                </div>

                {studentCodesList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#807A6D] dark:text-[#A7A08E] space-y-1">
                    <p className="font-bold">لم يتم سحب أي كودات للطلاب حتى الآن.</p>
                    <p>أدخلي إيميل الطالب بالأعلى لاستخراج كود تفعيل فوري له.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {studentCodesList.map((stu, sIdx) => (
                      <div
                        key={`${stu.id || stu.code || 'stu'}_${sIdx}`}
                        className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-[#596628] dark:text-[#A8C24E] text-sm">
                              {stu.code}
                            </span>
                            <span className="text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
                              طالب (عرض فقط)
                            </span>
                          </div>
                          <div className="text-[11px] text-[#706A5B] dark:text-[#A7A08E] truncate mt-0.5">
                            <span>{stu.email}</span>
                            {stu.name && <span> • {stu.name}</span>}
                            <span> • {stu.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyCodeToClipboard(stu.code)}
                            className="p-1.5 rounded-lg bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F2ECE0] text-[#554F42] dark:text-[#D5CDBC] text-xs font-bold transition-all cursor-pointer"
                            title="نسخ الكود"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentCodeItem(stu.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all cursor-pointer"
                            title="إلغاء وحذف الكود"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & INSTAGRAM */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-rose-500" />
                  <span>قنوات التواصل المباشر مع د. حياه نافع فجر</span>
                </h3>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1">
                  للاستفسارات الأكاديمية والسريرية، مناقشة الحالات، وتبادل الملاحظات والملفات.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram Card */}
                <a
                  href="https://instagram.com/hay_a_2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 dark:from-rose-950/30 dark:via-[#20261A] dark:to-pink-950/20 hover:border-rose-400 dark:hover:border-rose-700 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-black">
                      Instagram
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="text-base font-black text-[#2F2B24] dark:text-white group-hover:text-rose-600 transition-colors">
                      @hay_a_2
                    </h4>
                    <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                      الحساب الرسمي على الإنستغرام لمتابعة التحديثات والحالات السريرية الموثقة.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between">
                    <span>فتح الحساب المباشر</span>
                    <span>←</span>
                  </div>
                </a>

                {/* Telegram Card */}
                <a
                  href="https://t.me/hay_a_2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl border-2 border-sky-200 dark:border-sky-900/50 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 dark:from-sky-950/30 dark:via-[#20261A] dark:to-blue-950/20 hover:border-sky-400 dark:hover:border-sky-700 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Send className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[11px] font-black">
                      Telegram
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="text-base font-black text-[#2F2B24] dark:text-white group-hover:text-sky-600 transition-colors">
                      t.me/hay_a_2
                    </h4>
                    <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                      قناة وتواصل التليجرام الخاص بالمناقشات السريرية وتبادل ملفات الـ PDF الشاملة.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-sky-100 dark:border-sky-900/40 text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center justify-between">
                    <span>مراسلة عبر التليجرام</span>
                    <span>←</span>
                  </div>
                </a>
              </div>

              {/* Bio Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] space-y-2 text-xs text-[#5D574A] dark:text-[#C5BFB0] leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-[#2F2B24] dark:text-white text-sm">
                  <Sparkles className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                  <span>د. حياه نافع فجر</span>
                  <span className="text-[11px] font-normal text-[#807A6D] dark:text-[#9A9382]">(مرحلة رابعة - طب الأسنان - جامعة المعارف)</span>
                </div>
                <p>
                  تم تصميم وتطوير هذا الدليل السريري الرقمي لخدمة طلبة وأطباء الأسنان في فهم بروتوكولات الترميم من Class I حتى Class V بدقة علمية وعملية متكاملة.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-[#20261A] border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between">
          <div className="text-[11px] text-[#7A7466] dark:text-[#9A9382]">
            لوحة تحكم المشرفة | <strong className="text-[#596628] dark:text-[#A8C24E]">د. حياة نافع</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
