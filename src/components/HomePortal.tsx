import React, { useState, useEffect } from 'react';
import { RestorationClass } from '../data/classesData';
import { BrainToothBanner } from './BrainToothBanner';
import { PrivacySettings } from '../data/privacySettings';
import class1CasePhoto from '../assets/images/class1_clinical_case_1790412663108.jpg';
import class2CasePhoto from '../assets/images/class2_clinical_case_1790412672142.jpg';
import class3CasePhoto from '../assets/images/class3_clinical_case_1790412682423.jpg';
import class4CasePhoto from '../assets/images/class4_clinical_case_1790412627124.jpg';
import class5CasePhoto from '../assets/images/class5_clinical_case_1790412692162.jpg';
import {
  Presentation,
  Camera,
  Layers,
  Palette,
  Timer,
  FileText,
  Send,
  Instagram,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  UserCheck,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Settings,
  HelpCircle,
  ExternalLink,
  Flame,
  Award,
  KeyRound,
  AlertCircle,
  ZoomIn,
  Brain,
  HeartHandshake,
  Plus,
  Stethoscope,
  Wrench,
  Eye,
  EyeOff,
  Scissors,
  Video,
  Film,
  MessageSquare,
  Mail,
  CreditCard,
  Syringe,
  Pill,
  Printer,
  Trash2,
  Save,
  Clock,
} from 'lucide-react';
import {
  CompanionPermissionsMap,
  getCompanionPermissions,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
  DEFAULT_COMPANION_PERMISSIONS,
} from '../data/companionPermissionsManager';
import {
  AppSection,
  isSectionLockedForSubscribers,
  toggleSectionLock,
  isSectionAllowedForUser,
  isSectionHiddenForUser,
  subscribeToAppSectionsCloud,
  getAppSections,
} from '../data/sectionsManager';
import {
  isSectionFree,
  toggleSectionFree,
  PROTOCOL_FREE_SECTIONS_EVENT,
} from '../data/freeSectionsManager';
import {
  getCustomWindows,
  CustomWindow,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import { AppImage } from './AppImage';
import { RequestCodeModal } from './RequestCodeModal';
import { SubscriberSupervisorNotesModal } from './SubscriberSupervisorNotesModal';
import { SectionVideoModal } from './SectionVideoModal';
import { HomeFeedPosts } from './HomeFeedPosts';
import { PWAInstallBanner } from './PWAInstallBanner';
import { NotificationPermissionBanner } from './NotificationPermissionBanner';
import { OperativeVivaSection } from './OperativeVivaSection';
import { AppointmentsSection } from './AppointmentsSection';
import { LightCompanionMenu } from './LightCompanionMenu';
import { useLanguage } from '../contexts/LanguageContext';
import {
  GlobalAppState,
  getGlobalAppState,
  subscribeToGlobalAppStateCloud,
} from '../services/globalAppStateManager';

interface HomePortalProps {
  classes: RestorationClass[];
  onSelectClassAndOpenSlides: (classId: string) => void;
  onOpenPhotosForClass: (classId: string) => void;
  onOpenTab: (tab: any) => void;
  onOpenSettings: () => void;
  isAuthorAdmin: boolean;
  onToggleAuthorMode: () => void;
  adminPin: string;
  isContentUnlocked: boolean;
  onUnlockContent: (enteredPin: string) => boolean;
  onRelockContent: () => void;
  onOpenPatientGuide: () => void;
  onOpenStudies: (openAdd?: boolean) => void;
  privacySettings?: PrivacySettings;
  onOpenSurgicalCases?: () => void;
  onOpenHomePractice?: () => void;
  onOpenClinicalSkills?: () => void;
  onOpenContactPrivacy?: () => void;
  onOpenAdminMasterPanel?: () => void;
  onOpenSubscriberLogin?: () => void;
  onOpenAnesthesiaCalculator?: () => void;
  onOpenPrescriptionGuide?: () => void;
  onOpenSmartTrayProtocol?: () => void;
  onOpenDirectPulpCapping?: () => void;
  isGuidePublic?: boolean;
  appSections?: AppSection[];
  onToggleSectionVisibility?: (keyOrId: string) => void;
  onToggleClassVisibility?: (classId: string) => void;
  onDeleteClass?: (classId: string) => void;
  subscriberEmail?: string;
  isSubscriptionChecking?: boolean;
  isSubscriptionSystemEnabled?: boolean;
}

// Dedicated real clinical case photography and cavity shape definitions for each Class
export const CLASS_REAL_CASE_INFO: Record<
  string,
  {
    toothName: string;
    cavityShapeTitle: string;
    cavityShapeDesc: string;
    realToothPhoto: string;
    clinicalRule: string;
    bevelRule: string;
    cFactor: string;
  }
> = {
  'class-1': {
    toothName: 'سن طاحن سفلي أول (#46 / #36)',
    cavityShapeTitle: 'شكل نخر وتجويف الشقوق والميازيب الإطباقية (Occlusal Pits & Fissures)',
    cavityShapeDesc:
      'نخر موضعي يتبع خريطة الشقوق المركزية في السطح الإطباقي. الحفرة محصورة بدون شطف نهائياً للحواف، مع حواف عمودية ملساء 90° لحماية الكومبوزيت من التشقق الإطباقي.',
    realToothPhoto: class1CasePhoto,
    clinicalRule: 'امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط، مع حظر الـ Occlusal Bevel تماماً.',
    bevelRule: 'حظر الشطف الإطباقي (No Bevel on Occlusal)',
    cFactor: 'أعلى معامل إجهاد C-Factor = 5',
  },
  'class-2': {
    toothName: 'ضاحك علوي أول / طاحن (#14 / #16)',
    cavityShapeTitle: 'شكل صندوق النخر الملاصق (Proximal Box & Slot Shape)',
    cavityShapeDesc:
      'تجويف الصندوق الملاصق يكسر نقطة الاتصال مع السن المجاور لثوياً ولزقياً ودهليزياً، مع أرضية لثوية مستوية وجدران جانبية متقاربة قليلاً نحو الإطباق.',
    realToothPhoto: class2CasePhoto,
    clinicalRule: 'بناء الجدار الملاصق أولاً لتحويل الحالة من Class II إلى Class I لتسهيل التكديس.',
    bevelRule: 'لا بيفل إطباقياً، شطف خفيف جداً على الحافة اللثوية لميناء الملاصق إن وجد',
    cFactor: 'معامل C-Factor = 2 بعد تحويله لكلاس 1',
  },
  'class-3': {
    toothName: 'ثنية علوية / رباعية (#11 / #21)',
    cavityShapeTitle: 'شكل التجويف الملاصق الأمامي المحافظ (Anterior Proximal Lesion)',
    cavityShapeDesc:
      'نخر ملاصق تحت نقطة التماس الأمامية مع الحفاظ التام على الزاوية القاطعة (Incisal Angle intact). يتم الدخول من جهة الحنك (Palatal Access) للحفاظ على ميناء الوجه الجمالي.',
    realToothPhoto: class3CasePhoto,
    clinicalRule: 'الدخول الحنكي المحافظ يحفظ جمال الميناء الأمامي، مع بيفل 45° على حافة الوجه لإخفاء الخط.',
    bevelRule: 'بيفل 45 درجة على الحافة الدهليزية للاندماج الجمالي',
    cFactor: 'معامل C-Factor منخفض = 1 إلى 2',
  },
  'class-4': {
    toothName: 'قاطع مركزي علوي - ثنية (#11 / #21)',
    cavityShapeTitle: 'شكل كسر ونخر الزاوية القاطعة الأمامية (Incisal Angle Defect)',
    cavityShapeDesc:
      'فقدان كامل للزاوية الإنسالية أو الوحشية مع كشف الميناء والعاج. يتطلب شطفاً مينائياً واسعاً 45° بطول 1.5 - 2 ملم أو تموجي (Infinite Bevel) لإخفاء خط الانتقال بالكامل.',
    realToothPhoto: class4CasePhoto,
    clinicalRule: 'استخدام الدليل السليكوني (Palatal Index) لبناء الجدار الحنكي ثم محاكاة طبقات العاج والماميلونات.',
    bevelRule: 'بيفل ممتد 45° طويل (1.5 - 2 ملم) أو تموجي (Star/Scalloped)',
    cFactor: 'أقل معامل إجهاد C-Factor = 0.5 (أسطح حرة واسعة)',
  },
  'class-5': {
    toothName: 'ناب علوي / ضاحك سفلي (#13 / #34)',
    cavityShapeTitle: 'شكل الآفة العنقودية الهلالية / الوتدية (Cervical NCCL & Caries)',
    cavityShapeDesc:
      'آفة نخرية أو تآكل غير نخري (NCCL / Abfraction) في الثلث العنقي قرب اللثة بشكل هلالي أو وتدي. يتطلب عزل اللثة بربر دام أو خيط تبعيد #000 لتجنب الرطوبة.',
    realToothPhoto: class5CasePhoto,
    clinicalRule: 'البيفل يوضع على حافة الميناء التاجية فقط، وممنوع نهائياً على حافة الجذر أو الملاط.',
    bevelRule: 'بيفل على الميناء الإطباقي/التاجي فقط، ممنوع على الملاط (No Bevel on Cementum)',
    cFactor: 'معامل انكماش مرتفع C-Factor = 4 في التجويف المغلق',
  },
};

export const CLASS_REAL_CASE_INFO_EN: Record<
  string,
  {
    toothName: string;
    cavityShapeTitle: string;
    cavityShapeDesc: string;
    realToothPhoto: string;
    clinicalRule: string;
    bevelRule: string;
    cFactor: string;
  }
> = {
  'class-1': {
    toothName: 'Mandibular 1st Molar (#46 / #36)',
    cavityShapeTitle: 'Occlusal Pits & Fissures Cavity Architecture',
    cavityShapeDesc:
      'Localized carious lesion strictly following developmental grooves. Strict 90° cavosurface butt-joint margins without occlusal bevel to safeguard composite from fracture under masticatory stress.',
    realToothPhoto: class1CasePhoto,
    clinicalRule: 'Cavity extension strictly follows caries progression; occlusal beveling is contraindicated.',
    bevelRule: 'Contraindicated: Zero Occlusal Bevel (90° Butt-Joint)',
    cFactor: 'Highest Configuration Factor: C-Factor = 5',
  },
  'class-2': {
    toothName: 'Maxillary 1st Premolar / Molar (#14 / #16)',
    cavityShapeTitle: 'Proximal Box & Slot Preparation Architecture',
    cavityShapeDesc:
      'Proximal box cavity clearing cervical, buccal, and lingual contact areas with flat gingival floor and slightly convergent proximal walls.',
    realToothPhoto: class2CasePhoto,
    clinicalRule: 'Convert Class II into Class I by building the proximal contact wall first (Centric Matrix Technique).',
    bevelRule: 'No occlusal bevel; gentle gingival enamel margin smoothing only if enamel is preserved',
    cFactor: 'C-Factor = 2 after conversion to Class I configuration',
  },
  'class-3': {
    toothName: 'Maxillary Central / Lateral Incisor (#11 / #21)',
    cavityShapeTitle: 'Conservative Anterior Proximal Cavity Architecture',
    cavityShapeDesc:
      'Interproximal lesion apical to contact area with intact incisal edge. Palatal approach is mandatory to preserve pristine facial esthetic enamel.',
    realToothPhoto: class3CasePhoto,
    clinicalRule: 'Conservative palatal access preserves labial esthetic enamel; 45° facial margin bevel blends restoration seamlessly.',
    bevelRule: '45° Facial Enamel Bevel for seamless optical transition',
    cFactor: 'Low Configuration Factor: C-Factor = 1 to 2',
  },
  'class-4': {
    toothName: 'Maxillary Central Incisor (#11 / #21)',
    cavityShapeTitle: 'Incisal Angle Fracture & Defect Architecture',
    cavityShapeDesc:
      'Complete loss of the mesial or distal incisal angle exposing enamel and dentin. Requires wide 45° (1.5-2 mm) or infinite/scalloped star bevel to completely conceal the transition line.',
    realToothPhoto: class4CasePhoto,
    clinicalRule: 'Employ palatal silicone matrix (Palatal Index) for lingual shell layering, followed by anatomical dentin mamelon stratification.',
    bevelRule: 'Extended 45° Bevel (1.5 - 2.0 mm) or Infinite Star Scalloped Bevel',
    cFactor: 'Lowest Configuration Factor: C-Factor = 0.5 (ample unbonded stress relief surfaces)',
  },
  'class-5': {
    toothName: 'Maxillary Canine / Mandibular Premolar (#13 / #34)',
    cavityShapeTitle: 'Cervical Non-Carious Lesion (NCCL) & Root Caries Architecture',
    cavityShapeDesc:
      'Cervical third lesion (Abfraction / Erosion / Wedge-shaped defect) adjacent to gingival margin. Requires gingival retraction (#000 cord) or rubber dam inversion.',
    realToothPhoto: class5CasePhoto,
    clinicalRule: 'Enamel cavosurface margins receive 45° bevel; beveling on root dentin or cementum is strictly prohibited.',
    bevelRule: 'Coronal Enamel Bevel Only; Strictly Prohibited on Cementum / Root Margins',
    cFactor: 'High Stress Concentration: C-Factor = 4 in enclosed cervical box',
  },
};

export const HomePortal: React.FC<HomePortalProps> = ({
  classes,
  onSelectClassAndOpenSlides,
  onOpenPhotosForClass,
  onOpenTab,
  onOpenSettings,
  isAuthorAdmin,
  onToggleAuthorMode,
  adminPin,
  isContentUnlocked,
  onUnlockContent,
  onRelockContent,
  onOpenPatientGuide,
  onOpenStudies,
  privacySettings,
  onOpenSurgicalCases = () => onOpenTab('surgical'),
  onOpenHomePractice = () => onOpenTab('home_practice'),
  onOpenClinicalSkills = () => onOpenTab('clinical_skills'),
  onOpenContactPrivacy = () => onOpenTab('contact_privacy'),
  onOpenAdminMasterPanel = () => onOpenTab('subscribers_admin'),
  onOpenSubscriberLogin,
  onOpenAnesthesiaCalculator,
  onOpenPrescriptionGuide = () => onOpenTab('prescriptions'),
  onOpenSmartTrayProtocol,
  onOpenDirectPulpCapping,
  isGuidePublic = false,
  appSections = [],
  onToggleSectionVisibility,
  onToggleClassVisibility,
  onDeleteClass,
  subscriberEmail,
  isSubscriptionChecking = false,
  isSubscriptionSystemEnabled = true,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [globalState, setGlobalState] = useState<GlobalAppState>(() => getGlobalAppState());
  const [internalSections, setInternalSections] = useState<AppSection[]>(() => {
    return appSections && appSections.length > 0 ? appSections : getAppSections();
  });

  useEffect(() => {
    if (appSections && appSections.length > 0) {
      setInternalSections(appSections);
    }
  }, [appSections]);

  const [companionPermissions, setCompanionPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );
  const [underReviewNotice, setUnderReviewNotice] = useState<{
    title: string;
    desc?: string;
  } | null>(null);

  useEffect(() => {
    const handlePermUpdate = () => {
      setCompanionPermissions(getCompanionPermissions());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
    window.addEventListener('storage', handlePermUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
      window.removeEventListener('storage', handlePermUpdate);
    };
  }, []);

  useEffect(() => {
    const unsubGlobal = subscribeToGlobalAppStateCloud((gState) => {
      setGlobalState(gState);
    });
    const unsubSections = subscribeToAppSectionsCloud((cloudSections) => {
      setInternalSections(cloudSections);
    });
    return () => {
      unsubGlobal();
      unsubSections();
    };
  }, []);

  const effectiveSections = internalSections && internalSections.length > 0 ? internalSections : appSections;

  const isSectionAllowed = (key: string) => {
    return isSectionAllowedForUser(key, effectiveSections, isAuthorAdmin, globalState.hiddenSectionKeys);
  };

  const isSectionHidden = (key: string) => {
    return isSectionHiddenForUser(key, effectiveSections, globalState.hiddenSectionKeys);
  };

  const customSections = (effectiveSections || []).filter(
    (s) => !s.isSystem && isSectionAllowed(s.key)
  );

  // Dynamic Custom Windows from Admin Manager
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

  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Modals for Code Request with Email, Supervisor Notes, and Section Video
  const [showRequestCodeModal, setShowRequestCodeModal] = useState(false);
  const [requestCodeSectionTitle, setRequestCodeSectionTitle] = useState<string | undefined>();
  const [showSupervisorNotesModal, setShowSupervisorNotesModal] = useState(false);
  const [videoModalSection, setVideoModalSection] = useState<AppSection | null>(null);

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');
    if (!activationInput.trim()) {
      setActivationError('يرجى إدخال كود التفعيل.');
      return;
    }
    const success = onUnlockContent(activationInput.trim());
    if (success) {
      setActivationSuccess(true);
      setActivationInput('');
      setTimeout(() => setActivationSuccess(false), 3000);
    } else {
      setActivationError('كود التفعيل غير صحيح! يرجى التأكد من الكود الممنوح لك أو التواصل مع المشرفة للحصول عليه.');
    }
  };

  const [, setFreeSectionsTrigger] = useState(0);
  useEffect(() => {
    const handleFreeSectionsUpdate = () => setFreeSectionsTrigger((prev) => prev + 1);
    window.addEventListener(PROTOCOL_FREE_SECTIONS_EVENT, handleFreeSectionsUpdate);
    window.addEventListener('storage', handleFreeSectionsUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_FREE_SECTIONS_EVENT, handleFreeSectionsUpdate);
      window.removeEventListener('storage', handleFreeSectionsUpdate);
    };
  }, []);

  const isSectionLocked = (key: string) => {
    if (isSubscriptionSystemEnabled === false) return false;
    if (isAuthorAdmin || isContentUnlocked) return false;
    if (isSectionFree(key)) return false;
    return isSectionLockedForSubscribers(key, appSections);
  };

  const handleOpenSectionWithLockCheck = (secKey: string, openFn: () => void) => {
    if (isSectionLocked(secKey)) {
      if (onOpenSubscriberLogin) {
        onOpenSubscriberLogin();
      } else {
        const el = document.getElementById('activation-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          el.classList.add('ring-4', 'ring-amber-400');
          setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 1500);
        }
      }
      return;
    }
    openFn();
  };

  const handleClassCardClick = (classId: string) => {
    if (isAuthorAdmin || isContentUnlocked || isSectionFree(classId) || isSectionFree('protocols') || isSectionFree('slides')) {
      onSelectClassAndOpenSlides(classId);
      return;
    }
    handleOpenSectionWithLockCheck('protocols', () => {
      onSelectClassAndOpenSlides(classId);
    });
  };

  const handleToolClick = (tab: 'anatomy' | 'shade' | 'timer' | 'cheatsheet') => {
    if (isAuthorAdmin || isContentUnlocked || isSectionFree(tab) || isSectionFree('protocols')) {
      onOpenTab(tab);
      return;
    }
    handleOpenSectionWithLockCheck('protocols', () => {
      onOpenTab(tab);
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Grand Aesthetic Header Banner (Matching the User's Uploaded Image) */}
      <section className="space-y-4">
        <BrainToothBanner stealthMode={privacySettings?.stealthMode} isAdmin={isAuthorAdmin} />
      </section>

      {/* 1.1 Dynamic Admin Promo & Pricing Banner */}
      {globalState.features.showPromoBanner && (
        <section className="animate-fadeIn">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-[#59662C] to-[#3B441D] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-200 block tracking-wider">
                  عرض خاص وتحديثات مستمرة 🎁
                </span>
                <p className="text-xs sm:text-sm font-bold leading-relaxed text-white">
                  {globalState.features.promoBannerText || 'اختر السعر المناسب لك مع فتح فوري لكافة الميزات والبروتوكولات السريرية.'}
                </p>
              </div>
            </div>
            {!isContentUnlocked && isSubscriptionSystemEnabled && (
              <button
                type="button"
                onClick={() => {
                  setRequestCodeSectionTitle('عرض الخصم والتفعيل');
                  setShowRequestCodeModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-white text-[#59662C] font-black text-xs hover:bg-amber-50 transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>طلب الكود والتفعيل ⚡</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 1.2. PWA Mobile & Desktop Automatic Installation Prompt Banner */}
      {globalState.features.showPWAInstallPrompt !== false && (
        <section>
          <PWAInstallBanner />
        </section>
      )}

      {/* 1.3. Real-Time Push Notification Permission Prompt */}
      <section>
        <NotificationPermissionBanner />
      </section>

      {/* 1.5. Supervisor Clinical Announcements & Social Feed (Requirement: Feed & Posts System on the Main Home Screen) */}
      {globalState.features.showClinicalAnnouncementsFeed !== false && (
        <HomeFeedPosts
          isAdmin={isAuthorAdmin}
          subscriberEmail={subscriberEmail}
          isSubscriberLoggedIn={isContentUnlocked}
          onRequireLogin={onOpenSubscriberLogin}
        />
      )}

      {/* 2. Activation & Gatekeeper Card (Requirement: "الرمز للمشرف حصرا ما يظهر للمشتركين") */}
      <section id="activation-card" className="transition-all duration-300">
        {!isSubscriptionSystemEnabled ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#FAF7F2] to-[#596628]/10 dark:from-emerald-950/40 dark:via-[#192215] dark:to-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-700/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                    النسخة العامة المجانية متاحة بالكامل للجميع 🔓
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                    مفتوح للجميع
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                  تم تفعيل وضع الإتاحة المجانية الشاملة من قبل المشرفة د. حياة نافع فجر. كافة الأقسام والمحاضرات والمهارات السريرية والبروتوكولات متاحة للاستخدام المباشر دون الحاجة لأي كود أو اشتراك.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSupervisorNotesModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="كتابة ملاحظة أو استفسار سريري للمشرفة د. حياة نافع"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ملاحظات للمشرف ✍️</span>
              </button>

              <button
                type="button"
                onClick={onToggleAuthorMode}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-[#443E33] dark:text-[#D5CDBC] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#E5DEC9] dark:border-[#343E26] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#596628]" />
                <span>دخول المشرف (PIN)</span>
              </button>
            </div>
          </div>
        ) : !isContentUnlocked ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 dark:from-[#222818] dark:via-[#1B2014] dark:to-[#171C10] border-2 border-amber-300 dark:border-amber-700/60 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200 dark:border-amber-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200">
                      محتوى الشروحات محمي
                    </span>
                    <span className="text-xs text-amber-800/80 dark:text-amber-300/80 font-bold">
                      بإشراف: حياة نافع
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white mt-0.5">
                    تفعيل الدليل السريري وشروحات الكلاسات (Class I - V)
                  </h3>
                </div>
              </div>

              {/* Direct Contact Links to Request Code with Email & Notes to Supervisor */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setRequestCodeSectionTitle(undefined);
                    setShowRequestCodeModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="الاشتراك السنوي وتفعيل الحساب عبر ماستركارد"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>الاشتراك عبر ماستركارد 💳</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSupervisorNotesModal(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="كتابة ملاحظة أو استفسار سريري للمشرفة د. حياة نافع"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ملاحظات للمشرف ✍️</span>
                </button>

                <a
                  href="https://t.me/hay_a_2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="تواصل مباشر عبر تليجرام"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تليجرام</span>
                </a>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-[#4E483B] dark:text-[#D5CDBC] leading-relaxed">
              <p>
                مرحباً بك! للاطلاع على شروحات الكلاسات وخطوات ترميم الكومبوزيت، ومحاكيات الطبقات والألوان، وملفات الـ PDF؛ يرجى إدخال <strong>كود التفعيل الخاص بالمشتركين</strong>.
              </p>
              <p className="text-[#6D675A] dark:text-[#A7A08E] text-xs">
                للحصول على كود التفعيل أو تجديد الاشتراك، يرجى التواصل مباشرة مع المشرفة <strong>(د. حياة نافع)</strong> عبر التليجرام أو الإنستغرام.
              </p>
            </div>

            {/* Code Input Form */}
            <form onSubmit={handleActivationSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="password"
                    placeholder="أدخل كود التفعيل الممنوح لك (مثال: STU-XXXX-XXX أو رمز المشرف)..."
                    value={activationInput}
                    onChange={(e) => setActivationInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#151911] rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 font-black text-center text-base tracking-widest focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E] shadow-xs text-[#2F2B24] dark:text-white"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <Unlock className="w-4 h-4" />
                  <span>تفعيل المحتوى والشروحات</span>
                </button>
              </div>

              {/* Quick direct login trigger buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                {onOpenSubscriberLogin && (
                  <button
                    type="button"
                    onClick={onOpenSubscriberLogin}
                    className="px-4 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-300 dark:border-amber-800 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>نافذة دخول المشتركين (كود الطالب)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onToggleAuthorMode}
                  className="px-4 py-1.5 rounded-xl bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-[#443E33] dark:text-[#D5CDBC] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#E5DEC9] dark:border-[#343E26] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#596628]" />
                  <span>دخول المشرف العام (رمز المشرف)</span>
                </button>
              </div>

              {activationError && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2 border border-red-300 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{activationError}</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                    المحتوى والشروحات السريرية مفعلة بالكامل
                  </h4>
                  {isAuthorAdmin ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#596628] text-white">
                      👑 المشرف العام (CRUD كامل)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
                      🎓 مشترك (مطالعة سريرية فقط)
                    </span>
                  )}
                </div>
                <p className="text-emerald-800/90 dark:text-emerald-300 mt-0.5">
                  {isAuthorAdmin
                    ? 'لديكِ صلاحيات المشرف الكاملة: إضافة وتعديل الحالات، سحب كودات الطلاب، وإدارة البروتوكولات.'
                    : 'جميع المحاضرات والشرائح التفاعلية والتدريبات المصرح بها متاحة للمطالعة السريرية والدراسة.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRelockContent}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#161A12] border border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer flex items-center gap-1.5"
                title="قفل المحتوى مجدداً أو تسجيل الخروج"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>قفل / تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2.5. Clinical Psychology & Evidence-Based Research Suite */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-[#596628] dark:bg-[#A8C24E]" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
              سيكولوجية طب الأسنان والأبحاث المعتمدة
            </h2>
            <p className="text-xs sm:text-sm text-[#736C5F] dark:text-[#A7A08E] mt-0.5">
              دليل التعامل الصحيح مع المراجعين، وأرشيف الدراسات السريرية مع روابط التأكد من PubMed والمجلات العلمية.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 0: Clinical Skills Atlas (NEW) */}
          {isSectionAllowed('clinical_skills') && (
            <div
              onClick={() => handleOpenSectionWithLockCheck('clinical_skills', onOpenClinicalSkills)}
              className={`p-6 rounded-3xl bg-gradient-to-br from-[#596628]/20 via-white to-amber-500/15 dark:from-[#2A3319] dark:via-[#1D2415] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between group md:col-span-2 ${
                isSectionHidden('clinical_skills')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-[#596628]/60 dark:border-[#384524] hover:border-[#596628]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#596628] to-[#3E471C] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Sparkles className="w-7 h-7 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#596628] dark:text-[#A8C24E] block">
                        أطلس المهارات 4K HD التفاعلي
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                        أطلس المهارات السريرية (Clinical Skills & Guides)
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked('clinical_skills') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}

                    {isSectionHidden('clinical_skills') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('clinical_skills');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('clinical_skills')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('clinical_skills') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('clinical_skills') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#596628] text-white shadow-xs">
                      دليل سريري متكامل
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#736C5F] dark:text-[#A7A08E] font-medium leading-relaxed">
                  تغطية سريرية مصورة بالكامل بصور فموية حقيقية داخل الفم (Clinical Intraoral Photography) لثلاث ركائز أساسية: طرق التخدير الفموي (IANB, Buccal, Mental, Palatine, Infiltration)، تقنيات عزل الربر دام (Wingless, Winged, Split Dam)، وتقنيات الخياطة الجراحية (Interrupted, Continuous, Mattress, Figure-8) مع وضع الفحص المكبر Lightbox.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5">
                    <Stethoscope className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-200 block">التخدير السريري</span>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300">5 تقنيات موثقة بالزوايا والأمان</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 flex items-center gap-2.5">
                    <Wrench className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-sky-950 dark:text-sky-200 block">عزل الربر دام</span>
                      <span className="text-[11px] text-sky-800 dark:text-sky-300">3 طرق مع المراحل الخمس</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5">
                    <Scissors className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 block">الخياطة الجراحية</span>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300">4 عقد وعضّات نسيجية دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#596628]/20 dark:border-[#384524] flex items-center justify-between text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {isSectionLocked('clinical_skills')
                      ? '🔒 مقفل - أدخل كود التفعيل للفتح'
                      : 'دخول أطلس المهارات السريرية والتصفح التفاعلي'}
                  </span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}

          {/* Card 1: Surgical Cases */}
          {isSectionAllowed('surgical') && (
            <div
              onClick={() => handleOpenSectionWithLockCheck('surgical', onOpenSurgicalCases)}
              className={`p-6 rounded-3xl bg-gradient-to-br from-[#596628]/15 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                isSectionHidden('surgical')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-[#596628]/50 dark:border-[#384524] hover:border-[#596628]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#596628] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked('surgical') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}

                    {isSectionHidden('surgical') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('surgical');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('surgical')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('surgical') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('surgical') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                      حالات جراحية
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    أطلس الجراحة الفموية والزرع
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                    أطلس الحالات الجراحية (Surgical Cases)
                  </h3>
                  <p className="text-xs text-[#596628] dark:text-[#A8C24E] font-bold mt-0.5">
                    خلع أضراس العقل، قطع الذروة مع MTA، والزرع الفوري
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  حالات جراحية موثقة خطوة بخطوة مع توضيح تصميم الشريحة، تفادي الأعصاب، الميزاب العظمي، صور سريرية، والنقاط الذهبية لتجنب الاختلاطات.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#596628]/20 dark:border-[#384524] flex items-center justify-between text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>فتح أطلس الحالات الجراحية</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}

          {/* Card 2: Home Practice */}
          {isSectionAllowed('home_practice') && (
            <div
              onClick={() => handleOpenSectionWithLockCheck('home_practice', onOpenHomePractice)}
              className={`p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-white to-amber-500/5 dark:from-[#252216] dark:via-[#1D2015] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                isSectionHidden('home_practice')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-amber-300 dark:border-amber-800/60 hover:border-amber-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked('home_practice') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}

                    {isSectionHidden('home_practice') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('home_practice');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('home_practice')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('home_practice') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('home_practice') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      تدريب منزلي
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    المهارات السريرية العملية بالبيت
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    أنواع التدريبات بالبيت (Home Practice)
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                    تمارين الخياطة الجراحية، الكافيتي على الموديل، وعزل الرابر دام
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  تمارين موجهة لطلاب طب الأسنان مع قائمة الأدوات، إرشادات تجنب الأخطاء الشائعة، وبطاقة التقييم الذاتي لنتيجتك مع عداد تفاعلي للخطوات.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>بدء التدريب المنزلي</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}

          {/* Card 3: Patient Psychology Guide (18 Slides) */}
          {isSectionAllowed('patient_guide') && (
            <div
              onClick={() => handleOpenSectionWithLockCheck('patient_guide', onOpenPatientGuide)}
              className={`p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#242A1A] dark:via-[#1D2215] dark:to-[#171B11] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                isSectionHidden('patient_guide')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-amber-300/80 dark:border-amber-700/60 hover:border-amber-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked('patient_guide') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}

                    {isSectionHidden('patient_guide') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('patient_guide');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('patient_guide')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('patient_guide') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('patient_guide') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      18 شريحة تفاعلية
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    إعداد: د. حياه نافع فجر | جامعة المعارف
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    دليل التعامل الصحيح مع المراجعين
                  </h3>
                  <p className="text-xs text-[#596628] dark:text-[#A8C24E] font-bold mt-0.5">
                    من أول سؤال بـ الـ History إلى تسليم الحالة بتميز بدون توتر
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  يشمل المحاور الثلاثة: ما قبل العلاج (التجهيز النفسي 96% من الشكاوى)، أثناء العلاج (فك شفرة السؤال الذهبي، قصة السن المتآكل، التخدير)، وما بعد العلاج (بروتوكول الـ 5 دقائق ومرآة الفحص).
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>
                    {isSectionLocked('patient_guide')
                      ? '🔒 مقفل - أدخل كود التفعيل للفتح'
                      : 'فتح الدليل التفاعلي كاملاً'}
                  </span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}

          {/* Card 4: Scientific Studies & Research Hub */}
          {isSectionAllowed('studies') && (
            <div
              className={`p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-white to-sky-500/5 dark:from-[#17202A] dark:via-[#1A2218] dark:to-[#141A10] border-2 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                isSectionHidden('studies')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-sky-300/80 dark:border-sky-800/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked('studies') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}
                    {isSectionHidden('studies') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('studies');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('studies')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('studies') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('studies') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    {isAuthorAdmin && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/30">
                        صلاحيات المشرف
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-sky-200/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200">
                      PubMed & Evidence-Based
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    أرشيف الأبحاث المحكمة وروابط الفحص
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                    نافذة الدراسات والأبحاث السريرية
                  </h3>
                  <p className="text-xs text-sky-700 dark:text-sky-300 font-bold mt-0.5">
                    أبحاث علمية تدعم بروتوكولات الحشوات، التخدير، وسيكولوجية المراجعين
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  كل دراسة مزودة برابط مباشر للمجلة أو PubMed للتأكد من الموثوقية. تتيح للمشرف فقط إضافة دراسات جديدة كتابة أو عبر رفع صور مع خانة الرابط الرسمي.
                </p>
              </div>

              {/* Action Buttons: Both buttons for Admin, Only "عرض الدراسات" for Students */}
              <div className="pt-4 mt-3 border-t border-sky-200 dark:border-sky-800/40 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenSectionWithLockCheck('studies', () => onOpenStudies(false))}
                  className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  title="استعراض وقراءة جميع الدراسات وروابط التحقق"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {isSectionLocked('studies')
                      ? '🔒 مقفل - كود التفعيل'
                      : 'عرض الدراسات'}
                  </span>
                </button>

                {isAuthorAdmin && (
                  <button
                    type="button"
                    onClick={() => onOpenStudies(true)}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    title="إضافة دراسة جديدة إلى الأرشيف (صلاحية المشرفة حصراً)"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة دراسات</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Card 5: Contact & Privacy */}
          {isSectionAllowed('contact_privacy') && (
            <div
              onClick={onOpenContactPrivacy}
              className={`p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-[#172418] dark:via-[#192215] dark:to-[#141A10] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                isSectionHidden('contact_privacy')
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50'
                  : 'border-emerald-300/80 dark:border-emerald-800/60 hover:border-emerald-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isSectionHidden('contact_privacy') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility('contact_privacy');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSectionHidden('contact_privacy')
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={isSectionHidden('contact_privacy') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {isSectionHidden('contact_privacy') ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                      قنوات رسمية
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    تليجرام @hay_a_2 • إنستغرام
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    تواصل معنا وسياسة الخصوصية
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
                    طلب كودات الطلاب، الدعم الفني، وشروط الاستخدام وإخلاء المسؤولية
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  قنوات التواصل المباشرة مع د. حياة نافع فجر، إرسال الاستفسارات السريرية، وثيقة الخصوصية التامة، وشروط الاستخدام الأكاديمي.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs font-black text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>فتح صفحة التواصل والخصوصية</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}

          {/* Card: Emergency & Prescription Guide (Controlled by Supervisor Permissions) */}
          {(() => {
            const prescPerm = companionPermissions['prescriptions'] || DEFAULT_COMPANION_PERMISSIONS['prescriptions'] || {
              access: 'subscription',
              visibility: 'visible',
            };
            const isPrescVisible = isAuthorAdmin || prescPerm.visibility === 'visible';
            if (!isPrescVisible) return null;

            const isPrescUnderReview = prescPerm.access === 'under_review';
            const isPrescFree = prescPerm.access === 'free';
            const isHiddenFromStudents = prescPerm.visibility === 'hidden';

            const handlePrescriptionClick = () => {
              if (isPrescUnderReview) {
                if (isAuthorAdmin) {
                  onOpenPrescriptionGuide();
                  return;
                }
                setUnderReviewNotice({
                  title: 'دليل وصف الأدوية السريع وطوارئ العيادة',
                  desc: 'هذا القسم قيد المراجعة والتدقيق الطبي والأكاديمي الدقيق من قبل المشرفة د. حياة نافع فجر لضمان الجرعات الدقيقة ومحاذير الحمل والحساسية، وسيتم اعتماده ونشره فور اكتمال التدقيق.',
                });
                return;
              }
              if (isPrescFree || isAuthorAdmin || isContentUnlocked || !isSubscriptionSystemEnabled) {
                onOpenPrescriptionGuide();
                return;
              }
              setRequestCodeSectionTitle('دليل وصف الأدوية السريع');
              setShowRequestCodeModal(true);
            };

            return (
              <div
                onClick={handlePrescriptionClick}
                className={`p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-rose-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                  isHiddenFromStudents
                    ? 'border-dashed border-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
                    : isPrescUnderReview
                    ? 'border-amber-400 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
                    : isPrescFree
                    ? 'border-emerald-400/60 dark:border-emerald-700/60 hover:border-emerald-500'
                    : 'border-[#59662C]/40 hover:border-[#59662C]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badges */}
                      {isHiddenFromStudents && isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 flex items-center gap-1 shadow-2xs">
                          <EyeOff className="w-2.5 h-2.5 text-rose-600" />
                          <span>🚫 مخفي عن الطلاب</span>
                        </span>
                      )}
                      {isPrescUnderReview ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                          <span>⏳ قيد التدقيق (د. حياة)</span>
                        </span>
                      ) : isPrescFree ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة / مجاني</span>
                        </span>
                      ) : (isContentUnlocked || isAuthorAdmin) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 flex items-center gap-1 shadow-2xs">
                          <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                          <span>✨ متاح لاشتراكك</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1 shadow-2xs">
                          <Lock className="w-2.5 h-2.5 text-rose-600" />
                          <span>🔒 متاح للمشتركين فقط</span>
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        دليل الوصفات السريرية
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                      Emergency & Prescription Dental Guide
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      دليل وصف الأدوية السريع وطوارئ العيادة
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-bold mt-0.5">
                      بروتوكولات المسكنات، المضادات الحيوية، غسول الفم، وأدوية الطوارئ الإنعاشية
                    </p>
                  </div>

                  <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                    جرعات معتمدة سريرياً، بدائل حساسية البنسلين، أدوية الإسعاف لكرسي الأسنان، ومحاذير الحمل والرضاعة وفق أحدث المراجع الصيدلانية.
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <span>
                      {isPrescUnderReview
                        ? '⏳ قيد المراجعة والتدقيق'
                        : isPrescFree || isAuthorAdmin || isContentUnlocked
                        ? 'دخول دليل الأدوية السريع'
                        : 'مقفل (يتطلب تفعيل الاشتراك)'}
                    </span>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">←</span>
                </div>
              </div>
            );
          })()}

          {/* Custom Sections Created by Admin */}
          {customSections.map((sec, secIdx) => (
            <div
              key={`${sec.id || sec.key}_${secIdx}`}
              onClick={() => handleOpenSectionWithLockCheck(sec.key, () => onOpenTab(sec.key))}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#59662C]/10 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 border-[#59662C]/40 hover:border-[#59662C] transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#59662C] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Lock State Badge */}
                    {isSectionLocked(sec.key) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>🔒 يتطلب كود فتح</span>
                      </span>
                    ) : (
                      !isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>🔓 متاح للعامة</span>
                        </span>
                      )
                    )}

                    {!sec.isVisible && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <span>🔒 مخفي عن المشتركين</span>
                      </span>
                    )}
                    {isAuthorAdmin && onToggleSectionVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSectionVisibility(sec.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          !sec.isVisible
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                        }`}
                        title={!sec.isVisible ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                      >
                        {!sec.isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>إظهار للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>إخفاء</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                      {sec.badgeText || 'قسم مخصص'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    {sec.titleEn}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors">
                    {sec.title}
                  </h3>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  {sec.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#59662C]/20 dark:border-[#384524] flex items-center justify-between text-xs font-black text-[#59662C] dark:text-[#A4BF46]">
                <span>فتح محتويات القسم</span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          ))}

          {/* Dynamic Supervisor Custom Windows for Home & Protocols */}
          {customWindows
            .filter((w) => (w.targetLocation === 'home' || w.targetLocation === 'protocols') && (!w.isHidden || isAuthorAdmin))
            .map((cWin, idx) => {
              const isLocked = isSubscriptionSystemEnabled && cWin.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;
              return (
                <div
                  key={`${cWin.id}_${idx}`}
                  onClick={() => {
                    if (isLocked && onOpenSubscriberLogin) {
                      onOpenSubscriberLogin();
                    } else {
                      setSelectedCustomWindow(cWin);
                    }
                  }}
                  className={`p-6 rounded-3xl bg-gradient-to-br from-[#59662C]/10 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                    cWin.isHidden
                      ? 'border-dashed border-neutral-400 opacity-75'
                      : 'border-[#59662C]/40 hover:border-[#59662C]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        {cWin.contentType === 'checklist' ? (
                          <FileText className="w-6 h-6 text-white" />
                        ) : cWin.contentType === 'link' ? (
                          <ExternalLink className="w-6 h-6 text-white" />
                        ) : (
                          <Stethoscope className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isLocked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>🔒 يتطلب كود فتح</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>🔓 متاح للعامة</span>
                          </span>
                        )}

                        {cWin.isHidden && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300">
                            مخفي
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                          {cWin.badge || (cWin.targetLocation === 'protocols' ? 'بروتوكول سريري' : 'نافذة مخصصة')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {cWin.subtitle && (
                        <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                          {cWin.subtitle}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors">
                        {cWin.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed line-clamp-2">
                      {cWin.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#59662C]/20 dark:border-[#384524] flex items-center justify-between text-xs font-black text-[#59662C] dark:text-[#A4BF46]">
                    <span>فتح واستعراض النافذة</span>
                    <span className="group-hover:translate-x-1 transition-transform">←</span>
                  </div>
                </div>
              );
            })}

          {/* Card 6: Admin Master Panel (Admin Only) */}
          {isAuthorAdmin && (
            <div
              onClick={onOpenAdminMasterPanel}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#596628]/20 via-white to-amber-500/15 dark:from-[#20271A] dark:via-[#1A2216] dark:to-[#171A12] border-2 border-[#596628] hover:border-[#485320] transition-all cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#596628] to-[#7D9333] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#596628] text-white shadow-2xs">
                    خاص بالمشرف العام
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#807A6D] dark:text-[#A7A08E] block mb-1">
                    لوحة التحكم العليا (Master Panel)
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                    إدارة المشتركين والتحكم الشامل
                  </h3>
                  <p className="text-xs text-[#596628] dark:text-[#A8C24E] font-bold mt-0.5">
                    توليد كودات الطلاب، إدارة الحالات الجراحية، التدريبات، والدراسات
                  </p>
                </div>

                <p className="text-xs text-[#5C5648] dark:text-[#C5BFB0] leading-relaxed">
                  نافذة شاملة لإدخال إيميلات الطلاب وسحب كوداتهم، مراقبة الاستخدام، تصدير السجلات CSV، والتحكم بكافة محتويات التطبيق بصلاحيات المشرف الكاملة.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#596628]/30 flex items-center justify-between text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>دخول لوحة تحكم المشرف</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">←</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Real Cavity Shapes & Clinical Classes Section (Protocols) */}
      {isSectionAllowed('protocols') && (
        <section id="classes-section" className={`space-y-6 ${isSectionHidden('protocols') ? 'p-6 rounded-3xl border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-6 rounded-full bg-[#596628] dark:bg-[#A8C24E]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
                  الأصناف السريرية وأشكال النخر والتجويف الحقيقية
                </h2>
                {isSectionHidden('protocols') && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>مخفي عن المشتركين / Hidden</span>
                  </span>
                )}
                {isAuthorAdmin && onToggleSectionVisibility && (
                  <button
                    type="button"
                    onClick={() => onToggleSectionVisibility('protocols')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      isSectionHidden('protocols')
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-2xs'
                        : 'bg-white dark:bg-[#1E2417] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                    }`}
                    title={isSectionHidden('protocols') ? 'إظهار ونشر القسم للمشتركين' : 'إخفاء القسم عن المشتركين'}
                  >
                    {isSectionHidden('protocols') ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-white" />
                        <span>إظهار للمشتركين</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>إخفاء</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            <p className="text-xs sm:text-sm text-[#736C5F] dark:text-[#A7A08E] mt-1">
              صور سريرية حقيقية لكل كلاس تبيّن شكل الكافتي الطبيعي، مع القواعد الصارمة لإعداد الحفرة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPhotosForClass('class-1')}
              className="px-4 py-2 rounded-xl bg-[#596628]/10 dark:bg-[#A8C24E]/20 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/30 font-bold text-xs flex items-center gap-1.5 hover:bg-[#596628] hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>نافذة صور الحالات السريرية</span>
            </button>
          </div>
        </div>

        {/* Dedicated Protocol: بروتوكول التغطية اللبية المباشرة (Direct Pulp Capping Protocol - DPC) */}
        {isSubscriptionChecking ? (
          <div className="p-6 sm:p-7 rounded-3xl border-2 border-teal-500/20 bg-white/60 dark:bg-[#111917]/60 animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-28 h-6 rounded-full bg-teal-500/20" />
                <div className="w-36 h-6 rounded-full bg-teal-500/10" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>جاري التحقق من صلاحيات الاشتراك...</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-2/3 h-7 bg-teal-500/20 rounded-xl" />
              <div className="w-1/2 h-4 bg-teal-500/10 rounded-lg" />
              <div className="w-full h-12 bg-teal-500/5 rounded-xl" />
            </div>
          </div>
        ) : (isAuthorAdmin || (!isSectionHidden('pulp_capping') && !isSectionHidden('sec-pulp-capping'))) && (
          <div
            id="protocol-pulp-capping-card"
            data-protocol-id="pulp_capping"
            data-section-id="sec-pulp-capping"
            data-item-id="sec-pulp-capping"
            data-action="card-item"
            style={{ opacity: isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping') ? 0.4 : 1 }}
            className={`protocol-card card-item p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg ${
              isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping')
                ? 'hidden-item bg-amber-50/40 dark:bg-amber-950/20 border-dashed border-amber-400 dark:border-amber-700'
                : 'bg-gradient-to-br from-white via-[#FAF7F2] to-[#E6F4F1] dark:from-[#111917] dark:via-[#142320] dark:to-[#0D1815] border-teal-500/50 dark:border-teal-700/60'
            }`}
          >
            {/* Top Row: Badges & Admin Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#E5DEC9] dark:border-[#203632] pb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#0D9488] text-white flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                  <span>معالجة لبية حيوية معتمدة • VPT 🩺</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                  7 مراحل سريرية تفاعلية • 7 Clinical Slides
                </span>
                {companionPermissions['pulp_capping']?.access === 'under_review' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400 flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>⏳ قيد التدقيق (د. حياة)</span>
                  </span>
                ) : (isSectionFree('pulp_capping') || isSectionFree('sec-pulp-capping') || companionPermissions['pulp_capping']?.access === 'free') ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    <span>🔓 متاح مجاناً للعامة / Free for Public</span>
                  </span>
                ) : (isContentUnlocked || isAuthorAdmin) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>✨ متاح لاشتراكك الفعّال</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    <span>🔒 محتوى مدفوع (يتطلب تفعيل الاشتراك)</span>
                  </span>
                )}
                {(isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping')) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>مخفي عن المشتركين / Hidden</span>
                  </span>
                )}
              </div>

              {/* Admin Actions Bar */}
              {isAuthorAdmin && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Save Card Button */}
                  <button
                    type="button"
                    data-action="save"
                    onClick={(e) => {
                      e.stopPropagation();
                      const card = document.getElementById('protocol-pulp-capping-card');
                      card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                      setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                      window.alert('تم حفظ خانة بروتوكول التغطية اللبية وتأكيد المزامنة السحابية بنجاح! 💾✅');
                    }}
                    className="save-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#59662C] hover:bg-[#485323] text-white border border-[#485323] transition-all cursor-pointer shadow-2xs"
                    title="حفظ بيانات وتخصيصات هذه الخانة سحابياً"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ الخانة 💾</span>
                  </button>

                  {/* Free Public Access Toggle */}
                  <button
                    type="button"
                    data-action="toggle-free"
                    onClick={(e) => {
                      e.stopPropagation();
                      const willBeFree = toggleSectionFree('pulp_capping');
                      toggleSectionFree('sec-pulp-capping');
                      window.alert(
                        willBeFree
                          ? 'تم إتاحة بروتوكول التغطية اللبية مجاناً لجميع المستخدمين والزوار 🔓'
                          : 'تم قفل بروتوكول التغطية اللبية للمشتركين فقط 🔒'
                      );
                    }}
                    className={`free-toggle-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                      isSectionFree('pulp_capping') || isSectionFree('sec-pulp-capping')
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-[#1E2417] text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                    }`}
                    title="تبديل الإتاحة المجانية لهذا البروتوكول للعامة"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{isSectionFree('pulp_capping') ? 'مجاني 🔓' : 'إتاحة مجاناً'}</span>
                  </button>

                  {/* Visibility Toggle Button */}
                  {onToggleSectionVisibility && (
                    <button
                      type="button"
                      data-action="toggle-visibility"
                      onClick={() => {
                        onToggleSectionVisibility('pulp_capping');
                        const card = document.getElementById('protocol-pulp-capping-card');
                        const nowHidden = !(isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping'));
                        if (card) {
                          card.classList.toggle('hidden-item', nowHidden);
                          card.style.opacity = nowHidden ? '0.4' : '1';
                        }
                        window.alert(nowHidden ? 'تم إخفاء القسم بنجاح' : 'تم إظهار القسم بنجاح');
                      }}
                      className={`visibility-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                        isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping')
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                          : 'bg-white dark:bg-[#1E2417] text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-amber-50'
                      }`}
                      title={
                        isSectionHidden('pulp_capping')
                          ? 'إظهار البروتوكول للمشتركين'
                          : 'إخفاء البروتوكول عن المشتركين'
                      }
                    >
                      {isSectionHidden('pulp_capping') || isSectionHidden('sec-pulp-capping') ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-white" />
                          <span>إظهار للمشتركين</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>إخفاء عن المشتركين</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    data-action="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا القسم نهائياً؟')) {
                        const card = document.getElementById('protocol-pulp-capping-card');
                        card?.remove();
                        if (onToggleSectionVisibility) {
                          onToggleSectionVisibility('pulp_capping');
                        }
                        window.alert('تم حذف العنصر بنجاح من التطبيق.');
                      }
                    }}
                    className="delete-btn p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 cursor-pointer shadow-2xs"
                    title="حذف هذا البروتوكول نهائياً"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Content & Title */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white leading-tight">
                    بروتوكول التغطية اللبية المباشرة (Direct Pulp Capping Protocol)
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300 font-mono mt-0.5">
                    Direct Pulp Capping Protocol: MTA Micro-placement & GIC Sandwich Technique
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#595244] dark:text-[#B5AD9C] leading-relaxed">
                  البروتوكول الأكاديمي الدقيق للحفاظ على حيوية اللب السني (VPT) بعد الانكشاف الميكانيكي أو الرضي، يشمل شروط القبول، الإرقاء بـ NaOCl كمقياس تشخيصي، تطبيق الـ MTA بحجم ميكروي محصور، درع الـ GIC العازل، النقش الانتقائي والبناء المتدرج، وجدول المتابعة مع رصد علامات الفشل.
                </p>

                {/* 7 Phases Overview Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    '1. المقدمة والشروط المسبقة',
                    '2. السيطرة على النزيف والتعقيم',
                    '3. تطبيق MTA بحجم دقيق',
                    '4. ساندوتش GIC الواقي',
                    '5. النقش الانتقائي والكومبوزيت',
                    '6. بروتوكول المتابعة والتقييم',
                    '7. علامات الفشل واستطباب RCT',
                  ].map((phase, i) => (
                    <span
                      key={`pulp_phase_${i}`}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/80 dark:bg-[#182823] border border-teal-200/80 dark:border-teal-800/60 text-teal-900 dark:text-teal-200"
                    >
                      {phase}
                    </span>
                  ))}
                </div>

                {/* Important Clinical Note */}
                <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-xs text-teal-950 dark:text-teal-200 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black ml-1">القاعدة السريرية الذهبية:</span>
                    <span>عزل السن بالرابر دام إلزامي 100%، والنزيف الذي لا يتوقف خلال 5 دقائق بضغط NaOCl/CHX يعني التهاباً غير عكوس يستوجب التحول الفوري لاستئصال اللب الكامل (RCT).</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSectionWithLockCheck('pulp_capping', () => {
                      if (onOpenDirectPulpCapping) {
                        onOpenDirectPulpCapping();
                      }
                    });
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0B8277] hover:to-[#0D655E] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-200" />
                  <span>عرض الخطوات والمراحل (7 Slides)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTab('cheatsheet')}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] hover:bg-[#FAF7F2] dark:hover:bg-[#252E1F] border border-[#D5CDBC] dark:border-[#3E4A2E] text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>طباعة الدليل السريري المعتمد (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Protocol: بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات */}
        {isSubscriptionChecking ? (
          <div className="p-6 sm:p-7 rounded-3xl border-2 border-amber-500/20 bg-white/60 dark:bg-[#181E13]/60 animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-28 h-6 rounded-full bg-amber-500/20" />
                <div className="w-36 h-6 rounded-full bg-amber-500/10" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>جاري التحقق من صلاحيات الاشتراك...</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-2/3 h-7 bg-amber-500/20 rounded-xl" />
              <div className="w-1/2 h-4 bg-amber-500/10 rounded-lg" />
              <div className="w-full h-12 bg-amber-500/5 rounded-xl" />
            </div>
          </div>
        ) : (isAuthorAdmin || (!isSectionHidden('smart_tray') && !isSectionHidden('sec-smart-tray'))) && (
          <div
            id="protocol-smart-tray-card"
            data-protocol-id="smart_tray"
            data-section-id="sec-smart-tray"
            data-item-id="sec-smart-tray"
            data-action="card-item"
            style={{ opacity: isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray') ? 0.4 : 1 }}
            className={`protocol-card card-item p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg ${
              isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray')
                ? 'hidden-item bg-amber-50/40 dark:bg-amber-950/20 border-dashed border-amber-400 dark:border-amber-700'
                : 'bg-gradient-to-br from-white via-[#FAF7F2] to-[#F4EEDF] dark:from-[#181E13] dark:via-[#1D2517] dark:to-[#141A0F] border-[#D4AF37]/50 dark:border-[#96853C]/40'
            }`}
          >
            {/* Top Row: Badges & Admin Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#E5DEC9] dark:border-[#2C361D] pb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#59662C] text-white flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>بروتوكول سريري معتمد 🩺</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 text-[#8C741E] dark:text-[#E2C767] border border-[#D4AF37]/30">
                  7 خطوات تفاعلية • 7 Interactive Steps
                </span>
                {companionPermissions['smart_tray']?.access === 'under_review' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400 flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>⏳ قيد التدقيق (د. حياة)</span>
                  </span>
                ) : (isSectionFree('smart_tray') || isSectionFree('sec-smart-tray') || companionPermissions['smart_tray']?.access === 'free') ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    <span>🔓 متاح مجاناً للعامة / Free for Public</span>
                  </span>
                ) : (isContentUnlocked || isAuthorAdmin) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#59662C]/20 text-[#59662C] dark:text-[#A8C24E] border border-[#59662C]/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#59662C] dark:text-[#A8C24E]" />
                    <span>✨ متاح لاشتراكك الفعّال</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    <span>🔒 محتوى مدفوع (يتطلب تفعيل الاشتراك)</span>
                  </span>
                )}
                {(isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray')) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>مخفي عن المشتركين / Hidden</span>
                  </span>
                )}
              </div>

              {/* Admin Actions Bar */}
              {isAuthorAdmin && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Save Card Button */}
                  <button
                    type="button"
                    data-action="save"
                    onClick={(e) => {
                      e.stopPropagation();
                      const card = document.getElementById('protocol-smart-tray-card');
                      card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                      setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                      window.alert('تم حفظ خانة هندسة الطاولة وتأكيد المزامنة السحابية بنجاح! 💾✅');
                    }}
                    className="save-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#59662C] hover:bg-[#485323] text-white border border-[#485323] transition-all cursor-pointer shadow-2xs"
                    title="حفظ بيانات وتخصيصات هذه الخانة سحابياً"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ الخانة 💾</span>
                  </button>

                  {/* Free Public Access Toggle */}
                  <button
                    type="button"
                    data-action="toggle-free"
                    onClick={(e) => {
                      e.stopPropagation();
                      const willBeFree = toggleSectionFree('smart_tray');
                      toggleSectionFree('sec-smart-tray');
                      window.alert(
                        willBeFree
                          ? 'تم إتاحة بروتوكول هندسة الطاولة مجاناً لجميع المستخدمين والزوار 🔓'
                          : 'تم قفل بروتوكول هندسة الطاولة للمشتركين فقط 🔒'
                      );
                    }}
                    className={`free-toggle-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                      isSectionFree('smart_tray') || isSectionFree('sec-smart-tray')
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-[#1E2417] text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                    }`}
                    title="تبديل الإتاحة المجانية لهذا البروتوكول للعامة"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{isSectionFree('smart_tray') ? 'مجاني 🔓' : 'إتاحة مجاناً'}</span>
                  </button>

                  {/* Visibility Toggle Button */}
                  {onToggleSectionVisibility && (
                    <button
                      type="button"
                      data-action="toggle-visibility"
                      onClick={() => {
                        onToggleSectionVisibility('smart_tray');
                        const card = document.getElementById('protocol-smart-tray-card');
                        const nowHidden = !(isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray'));
                        if (card) {
                          card.classList.toggle('hidden-item', nowHidden);
                          card.style.opacity = nowHidden ? '0.4' : '1';
                        }
                        window.alert(nowHidden ? 'تم إخفاء القسم بنجاح' : 'تم إظهار القسم بنجاح');
                      }}
                      className={`visibility-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                        isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray')
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                          : 'bg-white dark:bg-[#1E2417] text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-amber-50'
                      }`}
                      title={
                        isSectionHidden('smart_tray')
                          ? 'إظهار البروتوكول للمشتركين'
                          : 'إخفاء البروتوكول عن المشتركين'
                      }
                    >
                      {isSectionHidden('smart_tray') || isSectionHidden('sec-smart-tray') ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-white" />
                          <span>إظهار للمشتركين</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>إخفاء عن المشتركين</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    data-action="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا القسم نهائياً؟')) {
                        const card = document.getElementById('protocol-smart-tray-card');
                        card?.remove();
                        if (onToggleSectionVisibility) {
                          onToggleSectionVisibility('smart_tray');
                        }
                        window.alert('تم حذف العنصر بنجاح من التطبيق.');
                      }
                    }}
                    className="delete-btn p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 cursor-pointer shadow-2xs"
                    title="حذف هذا البروتوكول نهائياً"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Content & Title */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white leading-tight">
                    بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#59662C] dark:text-[#A4BF46] font-mono mt-0.5">
                    Smart Clinic Protocol: Clinical Tray Architecture in 7 Steps
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#595244] dark:text-[#B5AD9C] leading-relaxed">
                  تنظيم وهندسة صينية وطاولة العمل السريري تسلسلياً لمنع التلوث التبادلي، اختصار وقت الجلسة، وضمان راحة المريض من البداية وحتى فحص الإطباق والصقل النهائي.
                </p>

                {/* 7 Steps Pills Overview */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    '1. التجهيز والتعقيم',
                    '2. التخدير الموضعي',
                    '3. التحضير وتجريف النخر',
                    '4. العزل بالرابر دام',
                    '5. التنظيف وفرز الحاد',
                    '6. البناء والترميم',
                    '7. الإنهاء وفحص الإطباق',
                  ].map((st, i) => (
                    <span
                      key={`smart_tray_step_${i}`}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/80 dark:bg-[#1F2618] border border-[#E5DEC9] dark:border-[#384524] text-[#4F493D] dark:text-[#D1C9BA]"
                    >
                      {st}
                    </span>
                  ))}
                </div>

                {/* The Golden Note Quick Preview Box */}
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-[#D4AF37]/40 text-xs text-[#4F4420] dark:text-[#E2C767] leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black ml-1">الملاحظة الذهبية:</span>
                    <span>أدوات Disposable الأساسية طوال الجلسة: كوب الماء، Saliva Ejector، Patient Towel، المرايا، Probe، Tweezers، قطن Cotton Rolls، وزجاجة الكحول Bottled Alcohol.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSectionWithLockCheck('smart_tray', () => {
                      if (onOpenSmartTrayProtocol) {
                        onOpenSmartTrayProtocol();
                      }
                    });
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#7D9333] hover:from-[#495424] hover:to-[#6D812A] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>عرض الخطوات التفاعلية (7 Slides)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTab('cheatsheet')}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] hover:bg-[#FAF7F2] dark:hover:bg-[#252E1F] border border-[#D5CDBC] dark:border-[#3E4A2E] text-[#59662C] dark:text-[#A4BF46] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>طباعة الدليل السريري المعتمد (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Classes Cards Grid */}
        {(() => {
          // Requirement: Strict conditional rendering based on isVisible
          // 1. For subscribers (end-users): Dynamically filter out all items where isVisible == false.
          //    The item container, card, and icon must be completely removed from the UI/DOM so that
          //    no empty spaces or hidden placeholding icons appear. Only render items where isVisible == true.
          // 2. For admins: Show all items with an option or toggle to change isVisible state.
          const displayedClasses = classes.filter(
            (cls) => isAuthorAdmin || cls.isVisible === true
          );

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedClasses.map((cls, clsIdx) => {
                const sourceMap = isRTL ? CLASS_REAL_CASE_INFO : CLASS_REAL_CASE_INFO_EN;
                const caseInfo = sourceMap[cls.id] || {
                  toothName: isRTL ? cls.targetTeeth : (cls.targetTeeth || 'Target Tooth'),
                  cavityShapeTitle: isRTL ? `شكل تجويف ${cls.arabicName}` : `${cls.code} Cavity Architecture`,
                  cavityShapeDesc: cls.indication,
                  realToothPhoto:
                    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
                  clinicalRule: isRTL ? 'امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط.' : 'Cavity margins strictly defined by caries perimeter.',
                  bevelRule: isRTL ? 'حسب البروتوكول السريري المعتمد' : 'According to verified clinical protocol',
                  cFactor: isRTL ? 'مدروس حيوياً' : 'Biochemically engineered',
                };
                const isHidden = cls.isVisible === false;

                return (
                  <div
                    key={`${cls.id}_${clsIdx}`}
                    data-protocol-id={cls.id}
                    data-class-id={cls.id}
                    data-item-id={cls.id}
                    data-action="card-item"
                    style={{ opacity: isHidden ? 0.4 : 1 }}
                    className={`protocol-card card-item bg-white dark:bg-[#1A1F15] border-2 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden relative ${
                      isHidden
                        ? 'hidden-item border-dashed border-amber-400 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-[#E5DEC9] dark:border-[#323A25]'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Real Tooth Case Photo Container */}
                      <div
                        onClick={() => onOpenPhotosForClass(cls.id)}
                        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-950 border-2 border-[#E5DEC9] dark:border-[#323A25] group-hover:border-[#596628] dark:group-hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs flex items-center justify-center"
                        title={isRTL ? `عرض الحالة السريرية الحقيقية لـ ${cls.arabicName} بالتفصيل المجهري` : `View ${cls.code} Microscopic Clinical Case Photography`}
                      >
                        <AppImage
                          src={caseInfo.realToothPhoto}
                          alt={cls.arabicName}
                          isAdmin={isAuthorAdmin}
                          storageKey={`class_case_tooth_${cls.id}`}
                          className="w-full h-full max-h-[450px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                          containerClassName="w-full h-full bg-neutral-950"
                          show4KBadge={true}
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm z-10">
                          <Camera className="w-3 h-3 text-[#A8C24E]" />
                          <span>{cls.code}</span>
                        </div>

                        <div className="absolute top-2.5 left-2.5 bg-[#596628]/90 dark:bg-[#7D9333]/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Before & After</span>
                        </div>

                        {/* Watermark & De-Identification Overlays */}
                        {privacySettings?.clinicalWatermarkOnPhotos && (
                          <div className="absolute top-10 right-2.5 bg-black/60 backdrop-blur-xs text-[9px] text-white/90 font-medium px-2 py-0.5 rounded-md pointer-events-none">
                            {isRTL ? 'د. حياه نافع • حالة تعليمية' : 'Dr. Hayat Nafee • Case Study'}
                          </div>
                        )}
                        {privacySettings?.autoRedactPatientInfo && (
                          <div className="absolute top-10 left-2.5 bg-emerald-950/80 backdrop-blur-xs text-[9px] text-emerald-300 font-bold px-2 py-0.5 rounded-md pointer-events-none border border-emerald-500/30">
                            HIPAA De-Identified
                          </div>
                        )}

                        <div className="absolute bottom-2.5 inset-x-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-between shadow-md">
                          <span className="truncate">{caseInfo.toothName}</span>
                          <span className="text-amber-300 shrink-0 mr-1 flex items-center gap-1 font-black">
                            <ZoomIn className="w-3 h-3" />
                            <span>{isRTL ? 'تكبير الحالة' : 'Zoom 4K'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Header Title, Admin Toggle & Subtitle */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-[#2F2B24] dark:text-white group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                              {isRTL ? cls.arabicName : (cls.name || cls.arabicName)}
                            </h3>
                            {isAuthorAdmin && isHidden && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                <EyeOff className="w-3 h-3 text-amber-600" />
                                <span>{isRTL ? 'مخفي' : 'Hidden'}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Save Class Card Button */}
                            {isAuthorAdmin && (
                              <button
                                type="button"
                                data-action="save"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const card = (e.currentTarget as HTMLElement).closest('.protocol-card, .card-item');
                                  card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                                  setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                                  window.alert(
                                    isRTL
                                      ? `تم حفظ خانة ${cls.arabicName || cls.name} وتأكيد المزامنة السحابية بنجاح! 💾✅`
                                      : 'Class card saved successfully! 💾✅'
                                  );
                                }}
                                className="save-btn px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 bg-[#59662C] hover:bg-[#485323] text-white border border-[#485323] transition-all cursor-pointer shadow-2xs"
                                title={isRTL ? 'حفظ هذه الخانة سحابياً' : 'Save this card'}
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isRTL ? 'حفظ 💾' : 'Save 💾'}</span>
                              </button>
                            )}

                            {/* Free public access toggle button */}
                            {isAuthorAdmin && (
                              <button
                                type="button"
                                data-action="toggle-free"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const willBeFree = toggleSectionFree(cls.id);
                                  window.alert(
                                    willBeFree
                                      ? (isRTL ? 'تم إتاحة هذا البروتوكول مجاناً لجميع المستخدمين والزوار 🔓' : 'Protocol unlocked for open public access 🔓')
                                      : (isRTL ? 'تم قفل البروتوكول للمشتركين فقط 🔒' : 'Protocol restricted to candidates 🔒')
                                  );
                                }}
                                className={`free-toggle-btn px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs ${
                                  isSectionFree(cls.id)
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                                }`}
                                title={isSectionFree(cls.id) ? (isRTL ? 'إلغاء المعاينة المجانية' : 'Revoke Free Preview') : (isRTL ? 'إتاحة هذا القسم مجاناً للعامة' : 'Make Publicly Free')}
                              >
                                {isSectionFree(cls.id) ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-white" />
                                    <span>{isRTL ? 'مجاني 🔓' : 'Free 🔓'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>{isRTL ? 'مقفل' : 'Locked'}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Visibility toggle button */}
                            {isAuthorAdmin && onToggleClassVisibility && (
                              <button
                                type="button"
                                data-action="toggle-visibility"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleClassVisibility(cls.id);
                                  const card = (e.currentTarget as HTMLElement).closest('.protocol-card, .card-item');
                                  if (card) {
                                    const nextHidden = !isHidden;
                                    card.classList.toggle('hidden-item', nextHidden);
                                    (card as HTMLElement).style.opacity = nextHidden ? '0.4' : '1';
                                  }
                                  window.alert(isHidden ? (isRTL ? 'تم إظهار القسم بنجاح' : 'Section visible') : (isRTL ? 'تم إخفاء القسم بنجاح' : 'Section hidden'));
                                }}
                                className={`visibility-btn px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs ${
                                  isHidden
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                                }`}
                                title={isHidden ? (isRTL ? 'إظهار الكلاس للمشتركين' : 'Show Class') : (isRTL ? 'إخفاء الكلاس عن المشتركين' : 'Hide Class')}
                              >
                                {isHidden ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                    <span>{isRTL ? 'إظهار' : 'Show'}</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>{isRTL ? 'إخفاء' : 'Hide'}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Delete button */}
                            {isAuthorAdmin && (
                              <button
                                type="button"
                                data-action="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(isRTL ? 'هل أنت متأكد من رغبتك في حذف هذا القسم نهائياً؟' : 'Permanently delete this restorative class?')) {
                                    if (onDeleteClass) {
                                      onDeleteClass(cls.id);
                                    }
                                    const card = (e.currentTarget as HTMLElement).closest('.protocol-card, .card-item');
                                    card?.remove();
                                    window.alert(isRTL ? 'تم حذف العنصر بنجاح من التطبيق.' : 'Class deleted successfully.');
                                  }
                                }}
                                className="delete-btn p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
                                title={isRTL ? 'حذف هذا الكلاس نهائياً' : 'Delete Class'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span className="text-[11px] font-bold text-[#7E786B] dark:text-[#A7A08E]">
                              {isRTL ? `${cls.slides.length} شرائح` : `${cls.slides.length} Slides`}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#706A5C] dark:text-[#A7A08E] font-medium leading-relaxed">
                          {cls.subtitle}
                        </p>
                      </div>

                  {/* Cavity Shape Specification Box */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#151911] border border-[#E5DEC9] dark:border-[#2C3420] space-y-2 text-xs">
                    <div className="font-black text-[#3E382C] dark:text-[#E2DDD2] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E] shrink-0" />
                      <span>{caseInfo.cavityShapeTitle}</span>
                    </div>
                    <p className="text-[11px] text-[#635D50] dark:text-[#A7A08E] leading-relaxed">
                      {caseInfo.cavityShapeDesc}
                    </p>

                    <div className="pt-2 border-t border-[#EAE3D2] dark:border-[#262D1D] flex flex-col gap-1 text-[11px]">
                      <span className="text-[#3A4914] dark:text-[#C5DC74] font-bold">
                        • {caseInfo.clinicalRule}
                      </span>
                      <span className="text-[#736C5F] dark:text-[#9A9382]">
                        • {isRTL ? 'قاعدة الشطف:' : 'Bevel Rule:'} {caseInfo.bevelRule}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                {(() => {
                  const isClassFree = isSectionFree(cls.id) || isSectionFree('protocols');
                  const isUnlockedOrFree = isContentUnlocked || isClassFree;
                  return (
                    <div className="pt-4 mt-2 border-t border-[#E5DEC9] dark:border-[#323A25] flex flex-col gap-2">
                      {isClassFree && !isContentUnlocked && (
                        <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-black animate-fadeIn">
                          <span className="flex items-center gap-1.5">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>{isRTL ? 'محتوى مجاني / Free Preview' : 'Open Access / Free Preview'}</span>
                          </span>
                          <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">
                            {isRTL ? 'متاح للعامة بدون كود' : 'Publicly accessible'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleClassCardClick(cls.id)}
                          data-action="edit"
                          className={`edit-btn flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                            isUnlockedOrFree
                              ? 'bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                          }`}
                        >
                          {isUnlockedOrFree ? (
                            <Presentation className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isUnlockedOrFree
                              ? (isClassFree && !isContentUnlocked
                                  ? (isRTL ? 'عرض الشرح (معاينة مجانية 🔓)' : 'Open (Free Preview 🔓)')
                                  : (isRTL ? 'عرض الشرح والخطوات' : 'Open Restorative Protocol'))
                              : (isRTL ? 'فتح الشرح (يتطلب تفعيل)' : 'Restricted (Activation Required)')}
                          </span>
                        </button>

                        <button
                          onClick={() => onOpenPhotosForClass(cls.id)}
                          className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#20261A] hover:bg-[#EFE8DC] dark:hover:bg-[#2A3322] border border-[#D5CDBC] dark:border-[#3E4A2E] text-[#596628] dark:text-[#A8C24E] text-xs font-bold transition-all cursor-pointer"
                          title={isRTL ? `عرض صور ${cls.code} الحقيقية` : `View ${cls.code} 4K Clinical Case Photos`}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
        );
      })()}
      </section>
      )}

      {/* 4. Interactive Clinical Tools Suite */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-[#596628] dark:bg-[#A8C24E]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
              الأدوات السريرية والتدريب التفاعلي
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#736C5F] dark:text-[#A7A08E] mt-1">
            أدوات عيادية صُممت لتسهيل الممارسة اليومية واختبار الألوان والتكديس والمؤقت.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: 3D Layers Simulator */}
          <div
            onClick={() => handleToolClick('anatomy')}
            className="p-5 rounded-3xl bg-white dark:bg-[#1A1F15] border-2 border-[#E5DEC9] dark:border-[#323A25] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                {isSectionFree('anatomy') && !isContentUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    محتوى مجاني
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#2F2B24] dark:text-white">محاكي الطبقات ثلاثي الأبعاد</h4>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                  استكشاف تشريحي للسن ومراحل بناء طبقات العاج والمينا والماميلونات.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EAE3D2] dark:border-[#2C3420] text-xs font-bold text-[#596628] dark:text-[#A8C24E] flex items-center justify-between">
              <span>{isContentUnlocked || isSectionFree('anatomy') ? 'فتح المحاكي' : 'مقفل (يتطلب تفعيل)'}</span>
              {isContentUnlocked || isSectionFree('anatomy') ? <span>←</span> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            </div>
          </div>

          {/* Tool 2: Shade Simulator */}
          <div
            onClick={() => handleToolClick('shade')}
            className="p-5 rounded-3xl bg-white dark:bg-[#1A1F15] border-2 border-[#E5DEC9] dark:border-[#323A25] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Palette className="w-6 h-6" />
                </div>
                {isSectionFree('shade') && !isContentUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    محتوى مجاني
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#2F2B24] dark:text-white">زر تجربة اللون (Button Try-in)</h4>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                  محاكاة اختيار درجات VITA للأسنان الرطبة وبلمرتها ومطابقتها قبل العزل.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EAE3D2] dark:border-[#2C3420] text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>{isContentUnlocked || isSectionFree('shade') ? 'اختبار الألوان' : 'مقفل (يتطلب تفعيل)'}</span>
              {isContentUnlocked || isSectionFree('shade') ? <span>←</span> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            </div>
          </div>

          {/* Tool 3: Clinical Timer */}
          <div
            onClick={() => handleToolClick('timer')}
            className="p-5 rounded-3xl bg-white dark:bg-[#1A1F15] border-2 border-[#E5DEC9] dark:border-[#323A25] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Timer className="w-6 h-6" />
                </div>
                {isSectionFree('timer') && !isContentUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    محتوى مجاني
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#2F2B24] dark:text-white">مؤقت العيادة الذكي</h4>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                  توقيت دقيق بالثواني لمراحل التخريش، الغسيل، التجفيف، وبلمرة الطبقات.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EAE3D2] dark:border-[#2C3420] text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-between">
              <span>{isContentUnlocked || isSectionFree('timer') ? 'بدء المؤقت' : 'مقفل (يتطلب تفعيل)'}</span>
              {isContentUnlocked || isSectionFree('timer') ? <span>←</span> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            </div>
          </div>

          {/* Tool 4: Printable Guide (PDF) */}
          <div
            onClick={() => handleToolClick('cheatsheet')}
            className="p-5 rounded-3xl bg-white dark:bg-[#1A1F15] border-2 border-[#E5DEC9] dark:border-[#323A25] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                {isSectionFree('cheatsheet') && !isContentUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    محتوى مجاني
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-[#2F2B24] dark:text-white">الدليل المطبوع (PDF)</h4>
                <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1 leading-relaxed">
                  طباعة كراس منفصل لكل صنف، أو تصدير الأطلس الشامل لكافة الكلاسات.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EAE3D2] dark:border-[#2C3420] text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>{isContentUnlocked || isSectionFree('cheatsheet') ? 'تصدير وطباعة' : 'مقفل (يتطلب تفعيل)'}</span>
              {isContentUnlocked || isSectionFree('cheatsheet') ? <span>←</span> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            </div>
          </div>

          {/* Tool 5: Local Anesthesia Dose & Safety Calculator */}
          <div
            onClick={() => {
              if (onOpenAnesthesiaCalculator) {
                onOpenAnesthesiaCalculator();
              }
            }}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-[#596628]/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 border-amber-400 dark:border-amber-700/80 hover:border-amber-500 dark:hover:border-amber-400 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative sm:col-span-2 lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Syringe className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      معايير Malamed • FDA
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                      High Security
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#2F2B24] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    حاسبة أمان وجرعات التخدير (LA Calculator)
                  </h4>
                  <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-0.5 leading-relaxed">
                    حساب الحد الأقصى الآمن للكاربولات، تقييد الأدرينالين لمرضى القلب، وبروتوكول LAST.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors">
                  <span>فتح الحاسبة</span>
                  <span>←</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tool 6: The Clinical Companion (رفيق طبيب الأسنان السريري الرقمي) */}
          <div
            onClick={() => onOpenTab('clinical_companion')}
            className="p-5 rounded-3xl bg-gradient-to-br from-[#005f9e]/15 via-white to-[#00b4d8]/10 dark:from-[#132338] dark:via-[#111c2e] dark:to-[#171A12] border-2 border-sky-400 dark:border-sky-700/80 hover:border-[#0077b6] dark:hover:border-sky-400 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group relative sm:col-span-2 lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#005f9e] to-[#0077b6] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <Stethoscope className="w-7 h-7 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-[#0077b6] dark:text-[#00b4d8]">
                      العيادة الرقمية المتكاملة
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 border border-sky-300">
                      All-in-One
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#2F2B24] dark:text-white group-hover:text-[#0077b6] dark:group-hover:text-sky-400 transition-colors">
                    المساعد والرفيق السريري الرقمي
                  </h4>
                  <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-0.5 leading-relaxed">
                    منظومة سريرية موحدة: حاسبة البنج، دليل وصف الأدوية السريع، بنك الأسئلة، وطلب بروتوكولات جديدة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#0077b6] group-hover:bg-[#005f9e] text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors">
                  <span>دخول الرفيق السريري</span>
                  <span>←</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Companion Dropdown & Appointments Management Section */}
      <section>
        <LightCompanionMenu
          isAuthorAdmin={isAuthorAdmin}
          isContentUnlocked={isContentUnlocked}
          isSubscriptionChecking={isSubscriptionChecking}
          onOpenFullCompanion={() => onOpenTab('clinical_companion')}
          onOpenAnesthesia={onOpenAnesthesiaCalculator}
          onOpenPrescriptions={onOpenPrescriptionGuide}
          onOpenDirectPulpCapping={onOpenDirectPulpCapping}
          onOpenSmartTray={onOpenSmartTrayProtocol}
          onOpenViva={() => onOpenTab('clinical_companion')}
          onOpenChecklist={() => onOpenTab('clinical_companion')}
        />
      </section>

      {/* Operative Viva Clinic Questions Section */}
      <section>
        <OperativeVivaSection
          isAuthorAdmin={isAuthorAdmin}
          isContentUnlocked={isContentUnlocked}
          onOpenSubscribeModal={() => onOpenTab('home')}
        />
      </section>

      {/* 5. Academic Contact & Admin Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#181C14] border-2 border-[#E5DEC9] dark:border-[#343E26] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#596628] dark:text-[#A8C24E]" />
              <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white">
                قنوات التواصل والاستفسارات مع د. حياة نافع
              </h3>
            </div>
            <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1">
              {isSubscriptionSystemEnabled
                ? 'مرحب بكم للتواصل ومناقشة الحالات السريرية وتبادل الملاحظات الأكاديمية وطلب كود التفعيل.'
                : 'مرحب بكم للتواصل ومناقشة الحالات السريرية وتبادل الملاحظات الأكاديمية والسريرية.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/hay_a_2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>إنستغرام: @hay_a_2</span>
            </a>

            <a
              href="https://t.me/hay_a_2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>تليجرام: t.me/hay_a_2</span>
            </a>
          </div>
        </div>

        {/* Admin note reminder */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#595244] dark:text-[#C5BFB0]">
            <ShieldCheck className="w-4 h-4 text-[#596628] dark:text-[#A8C24E] shrink-0" />
            <span>
              <strong>لوحة المشرفة: </strong>
              أزرار إضافة الكلاسات وإضافة الصور مخصصة للمشرفة د. حياة فقط، ولا تظهر للمشتركين والطلاب العاديين.
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3322] border border-[#D5CDBC] dark:border-[#3E4A2E] text-[#596628] dark:text-[#A8C24E] font-bold shrink-0 hover:bg-[#EFE8DC] dark:hover:bg-[#343E2B] transition-colors cursor-pointer"
          >
            إعدادات المشرفة
          </button>
        </div>
      </section>

      {/* 1. Request Code Modal with Email Window (Requested: اضافة نافذة كتابة الايميل داخل رسالة المشترك عند طلب الكود) */}
      <RequestCodeModal
        isOpen={showRequestCodeModal}
        onClose={() => setShowRequestCodeModal(false)}
        targetSectionTitle={requestCodeSectionTitle}
      />

      {/* 2. Subscriber Supervisor Notes Modal (Requested: امكانية للمشتركين كتابة الملاحظات في خانة الملاحظات للمشرف) */}
      <SubscriberSupervisorNotesModal
        isOpen={showSupervisorNotesModal}
        onClose={() => setShowSupervisorNotesModal(false)}
      />

      {/* 3. Section Video Modal (Requested: امكانية اضافة فيديو واستبداله لاي قسم) */}
      {videoModalSection && (
        <SectionVideoModal
          isOpen={true}
          onClose={() => setVideoModalSection(null)}
          section={videoModalSection}
          isAdmin={isAuthorAdmin}
          onVideoUpdated={(updatedSec) => {
            if (onToggleSectionVisibility) {
              // trigger refresh
            }
            setVideoModalSection(updatedSec);
          }}
        />
      )}

      {/* Dynamic Custom Window Bottom Sheet Modal */}
      {selectedCustomWindow && (
        <CustomWindowBottomSheetModal
          windowItem={selectedCustomWindow}
          isOpen={!!selectedCustomWindow}
          onClose={() => setSelectedCustomWindow(null)}
          isAuthorAdmin={isAuthorAdmin}
          isContentUnlocked={isContentUnlocked}
          onOpenSubscribeModal={onOpenSubscriberLogin}
        />
      )}

      {/* Clinical Under Review Governance Modal */}
      {underReviewNotice && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E2417] max-w-md w-full rounded-3xl p-6 border-2 border-amber-400 dark:border-amber-700/80 shadow-2xl text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <Clock className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                مراجعة سريرية وأكاديمية معتمدة 🩺
              </span>
              <h3 className="text-lg font-black text-[#2F2B24] dark:text-white pt-1">
                {underReviewNotice.title}
              </h3>
              <p className="text-xs text-[#6F6759] dark:text-[#C5BFB0] leading-relaxed pt-2">
                {underReviewNotice.desc ||
                  'هذا القسم قيد التدقيق والمراجعة الأكاديمية والسريرية الدقيقة من قبل المشرفة د. حياة نافع فجر للتأكد من مطابقة أحدث المراجع الطبية المعتمدة، وسيتم نشره واعتماده فور اكتمال المراجعة.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 font-bold">
              إشراف وإعداد: د. حياه نافع فجر • كلية طب الأسنان
            </div>
            <button
              type="button"
              onClick={() => setUnderReviewNotice(null)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              فهمت ذلك، العودة للرئيسية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
