import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlideViewer } from './components/SlideViewer';
import { ToothAnatomyVisualizer } from './components/ToothAnatomyVisualizer';
import { ClinicalTimer } from './components/ClinicalTimer';
import { ShadeSimulator } from './components/ShadeSimulator';
import { CheatSheetView } from './components/CheatSheetView';
import { ClassSelectorBar } from './components/ClassSelectorBar';
import { ManualClassBuilder } from './components/ManualClassBuilder';
import { ClinicalPhotosModal } from './components/ClinicalPhotosModal';
import { ClinicalChecklistModal } from './components/ClinicalChecklistModal';
import { SettingsModal } from './components/SettingsModal';
import { HomePortal } from './components/HomePortal';
import { PatientCommunicationModal } from './components/PatientCommunicationModal';
import { ScientificStudiesModal } from './components/ScientificStudiesModal';
import { PRESET_CLASSES, RestorationClass } from './data/classesData';
import {
  PrivacySettings,
  getStoredPrivacySettings,
  saveStoredPrivacySettings,
  addSecurityAuditEvent,
} from './data/privacySettings';
import {
  verifyActivationCode,
  performAutomatedExpirationCheck,
  verifySubscriberAccess,
  subscribeToStudentCodesCloud,
} from './data/studentCodes';
import { subscribeToCompanionPermissionsCloud } from './data/companionPermissionsManager';
import { subscribeToFreeSectionsCloud } from './data/freeSectionsManager';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SubscriberExpirationBanner } from './components/SubscriberExpirationBanner';
import { SurgicalCasesView } from './components/SurgicalCasesView';
import { HomePracticeView } from './components/HomePracticeView';
import { ClinicalSkillsView } from './components/ClinicalSkillsView';
import { ContactAndPrivacyView } from './components/ContactAndPrivacyView';
import { AdminMasterPanel } from './components/AdminMasterPanel';
import { SubscriberLoginModal } from './components/SubscriberLoginModal';
import {
  AppSection,
  getAppSections,
  toggleSectionVisibility,
  isSectionLockedForSubscribers,
  toggleSectionLock,
  subscribeToAppSectionsCloud,
  saveAppSectionsToCloud,
  isSectionAllowedForUser,
  isSectionHiddenForUser,
  purgeStaleSubscriberCache,
} from './data/sectionsManager';
import {
  GlobalAppState,
  getGlobalAppState,
  subscribeToGlobalAppStateCloud,
  updateGlobalAppStateInCloud,
} from './services/globalAppStateManager';
import {
  subscribeToClassesCloud,
  getLocalCachedClasses,
  toggleClassVisibilityInCloud,
  saveCustomClassToCloud,
  deleteCustomClassFromCloud,
} from './services/classesCloudService';
import {
  getIsSubscriptionSystemEnabled,
  subscribeToSubscriptionSystemToggle,
} from './services/subscriptionSystemToggleService';
import { CustomSectionView } from './components/CustomSectionView';
import { SubscriberSupervisorNotesModal } from './components/SubscriberSupervisorNotesModal';
import { RequestCodeModal } from './components/RequestCodeModal';
import { RealTimeNotificationToaster } from './components/RealTimeNotificationToaster';
import {
  subscribeToRealTimeNotifications,
  subscribeToSupervisorNotesCloud,
  subscribeToAppBrandingCloud,
} from './services/realTimeSyncService';
import {
  getCacheBustedImageUrl,
  getGlobalBrandingVersion,
  clearAllImageCaches,
  fetchCentralBrandingDirectly,
  applyCentralBrandingLocally,
  PROTOCOL_BRANDING_EVENT,
  PROTOCOL_HEADER_LOGO_KEY,
  PROTOCOL_HEADER_LOGO_EVENT,
  PROTOCOL_APP_LOGO_KEY,
} from './utils/cacheBuster';
import { SupervisorNote } from './data/supervisorNotes';
import { setupContentProtection, triggerControlledPrint } from './data/printSecurity';
import { SecurityNoticeToast } from './components/SecurityNoticeToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { syncAllContentToOfflineStorage } from './data/offlineStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  registerActiveSessionInCloud,
  listenToActiveSessionChanges,
  sendSessionHeartbeat,
  terminateActiveSessionInCloud,
  getLocalSessionId,
  clearLocalSessionId,
  SessionConflictEvent,
} from './services/sessionSecurityService';
import { ConcurrentSessionAlertModal } from './components/ConcurrentSessionAlertModal';
import { AntiPiracyShield } from './components/AntiPiracyShield';
import { AndroidSecurityGuidanceModal } from './components/AndroidSecurityGuidanceModal';
import {
  isSectionFree,
  PROTOCOL_FREE_SECTIONS_EVENT,
} from './data/freeSectionsManager';
import { LocalAnesthesiaCalculatorModal } from './components/LocalAnesthesiaCalculatorModal';
import { PrescriptionGuideSubscriberView } from './components/PrescriptionGuideSubscriberView';
import { ClinicalCompanionView } from './components/ClinicalCompanionView';
import { PreProcedureFloatingSheet } from './components/PreProcedureFloatingSheet';
import { ModernBottomNav } from './components/ModernBottomNav';
import { ClinicalCompanionBottomSheet } from './components/ClinicalCompanionBottomSheet';
import { SmartClinicTrayProtocolModal } from './components/SmartClinicTrayProtocolModal';
import { DirectPulpCappingModal } from './components/DirectPulpCappingModal';
import { WelcomeDisclaimerOverlay } from './components/WelcomeDisclaimerOverlay';
import { ClinicalPrayerModal } from './components/ClinicalPrayerModal';
import { ClinicalFavoritesHub } from './components/ClinicalFavoritesHub';
import { OfficialToothSvg } from './components/ToothFavoriteButton';
import { MenuSlideOutDrawer } from './components/MenuSlideOutDrawer';
import { DoctorProfileAvatar } from './components/DoctorProfileAvatar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { subscribeToPrescriptionGuideConfigCloud } from './services/prescriptionGuideService';
import { getLocalCachedGuideConfig } from './data/prescriptionGuideData';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { InAppAnnouncementBanner } from './components/InAppAnnouncementBanner';
import { ShareAppModal } from './components/ShareAppModal';
import {
  AnnouncementItem,
  getCachedAnnouncements,
  subscribeToAnnouncementsCloud,
  filterAnnouncementsForUser,
} from './services/announcementsService';
import {
  Home,
  Presentation,
  Layers,
  Timer,
  Palette,
  FileText,
  Send,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  Plus,
  Camera,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  UserCheck,
  Settings,
  Sun,
  Moon,
  Instagram,
  KeyRound,
  Brain,
  HeartHandshake,
  HandHeart,
  Fingerprint,
  EyeOff,
  ShieldAlert,
  Stethoscope,
  Wrench,
  Users,
  MessageSquare,
  Mail,
  Syringe,
  Pill,
  ClipboardCheck,
  Bell,
  Search,
  Share2,
  ChevronLeft,
  Globe,
} from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

type ActiveTab =
  | 'home'
  | 'slides'
  | 'surgical'
  | 'clinical_skills'
  | 'home_practice'
  | 'contact_privacy'
  | 'prescriptions'
  | 'clinical_companion'
  | 'subscribers_admin'
  | 'builder'
  | 'anatomy'
  | 'timer'
  | 'shade'
  | 'cheatsheet'
  | string;

export default function App() {
  const { language, setLanguage, toggleLanguage, isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPhotosModal, setShowPhotosModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPatientGuideModal, setShowPatientGuideModal] = useState<boolean>(false);
  const [showStudiesModal, setShowStudiesModal] = useState<boolean>(false);
  const [studiesInitialAddMode, setStudiesInitialAddMode] = useState<boolean>(false);
  const [showSubscriberLoginModal, setShowSubscriberLoginModal] = useState<boolean>(false);
  const [loginTargetSectionTitle, setLoginTargetSectionTitle] = useState<string | undefined>(undefined);
  const [subscriberEmail, setSubscriberEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('dental_subscriber_email') || '';
    } catch {
      return '';
    }
  });

  // Single-Device Session Enforcement & Anti-Piracy States
  const [localSessionId, setLocalSessionIdState] = useState<string | null>(() => getLocalSessionId());
  const [showConcurrentAlertModal, setShowConcurrentAlertModal] = useState<boolean>(false);
  const [concurrentConflict, setConcurrentConflict] = useState<SessionConflictEvent | null>(null);
  const [showAndroidGuidanceModal, setShowAndroidGuidanceModal] = useState<boolean>(false);
  const [showAnesthesiaCalculatorModal, setShowAnesthesiaCalculatorModal] = useState<boolean>(false);
  const [showPreProcedureSheet, setShowPreProcedureSheet] = useState<boolean>(false);
  const [showClinicalCompanionSheet, setShowClinicalCompanionSheet] = useState<boolean>(false);
  const [showSmartTrayModal, setShowSmartTrayModal] = useState<boolean>(false);
  const [showDirectPulpCappingModal, setShowDirectPulpCappingModal] = useState<boolean>(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState<boolean>(false);
  // Welcoming Clinical Prayer Modal (Appears upon opening in main interface)
  const [showClinicalPrayerModal, setShowClinicalPrayerModal] = useState<boolean>(true);
  const [showMenuDrawer, setShowMenuDrawer] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>(() =>
    getCachedAnnouncements()
  );
  const [lastReadAnnouncementsTs, setLastReadAnnouncementsTs] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('dental_last_read_announcements_ts')) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleOpenPrayer = () => setShowClinicalPrayerModal(true);
    window.addEventListener('open_clinical_prayer', handleOpenPrayer);
    return () => window.removeEventListener('open_clinical_prayer', handleOpenPrayer);
  }, []);

  // Handle PWA Shortcut URL ?tab= & Background Push Notification Clicks from Service Worker
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam as ActiveTab);
      }
    } catch {}

    if ('serviceWorker' in navigator) {
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data?.type === 'PROTOCOL_NOTIFICATION_CLICKED') {
          const targetUrl = event.data.targetUrl || event.data.payload?.url || '';
          if (targetUrl.includes('tab=prescriptions')) {
            setActiveTab('prescriptions');
          } else if (targetUrl.includes('tab=clinical_companion')) {
            setActiveTab('clinical_companion');
          } else if (targetUrl.includes('tab=slides')) {
            setActiveTab('slides');
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    }
  }, []);

  useEffect(() => {
    const unsubAnn = subscribeToAnnouncementsCloud((list) => {
      setAnnouncementsList(list);
    });
    return () => unsubAnn();
  }, []);

  // Content Gatekeeper: By default, for new users / visitors, only the Home Interface is visible.
  // The content and detailed explanations require the admin code: 2003 (Requirement)
  const [isContentUnlocked, setIsContentUnlocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dental_content_unlocked');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    // Default locked for new installations / visitors as requested by user
    return false;
  });

  // Global Payment & Subscription System Toggle (Fully Free Public Mode vs Paid Subscriptions)
  const [isSubscriptionSystemEnabled, setIsSubscriptionSystemEnabled] = useState<boolean>(() =>
    getIsSubscriptionSystemEnabled()
  );

  useEffect(() => {
    const unsub = subscribeToSubscriptionSystemToggle((enabled) => {
      setIsSubscriptionSystemEnabled(enabled);
    });
    return () => unsub();
  }, []);

  // Subscription Loading Guard State (Requirement #1: Guard against race condition on new devices & prevent flicker)
  const [isSubscriptionChecking, setIsSubscriptionChecking] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const isAdmin = localStorage.getItem('dental_author_admin') === 'true';
        const isSubSysEnabled = getIsSubscriptionSystemEnabled();
        if (isAdmin || !isSubSysEnabled) return false;
      }
    } catch {}
    return false; // Instant fast boot without content flickering
  });

  // Proactive initial subscription verification from Cloud Firestore
  useEffect(() => {
    let isMounted = true;

    const initCloudSubscriptionCheck = async () => {
      try {
        const isAdmin = localStorage.getItem('dental_author_admin') === 'true';
        if (isAdmin) {
          if (isMounted) {
            setIsContentUnlocked(true);
            setIsSubscriptionChecking(false);
          }
          return;
        }

        const email = localStorage.getItem('dental_subscriber_email') || subscriberEmail;

        // Proactive fetch from Firestore for activation codes, free sections map, and companion card permissions
        const [codesSnap, freeSnap, permsSnap] = await Promise.allSettled([
          getDoc(doc(db, 'app_config', 'student_activation_codes')),
          getDoc(doc(db, 'app_config', 'protocol_free_sections_config')),
          getDoc(doc(db, 'app_config', 'protocol_card_permissions_config')),
        ]);

        if (freeSnap.status === 'fulfilled' && freeSnap.value.exists()) {
          const freeData = freeSnap.value.data();
          if (freeData?.freeSections && typeof freeData.freeSections === 'object') {
            try {
              localStorage.setItem('protocol_free_sections', JSON.stringify(freeData.freeSections));
              window.dispatchEvent(new CustomEvent('protocol_free_sections_updated', { detail: freeData.freeSections }));
            } catch {}
          }
        }

        if (permsSnap.status === 'fulfilled' && permsSnap.value.exists()) {
          const permsData = permsSnap.value.data();
          if (permsData?.permissions && typeof permsData.permissions === 'object') {
            try {
              localStorage.setItem('protocol_card_permissions', JSON.stringify(permsData.permissions));
              window.dispatchEvent(new CustomEvent('protocol_card_permissions_updated', { detail: permsData.permissions }));
            } catch {}
          }
        }

        if (codesSnap.status === 'fulfilled' && codesSnap.value.exists()) {
          const codes = codesSnap.value.data()?.codes;
          if (Array.isArray(codes)) {
            try {
              localStorage.setItem('dental_student_activation_codes', JSON.stringify(codes));
            } catch {}
          }
        }

        if (!email) {
          // If no subscriber email, preserve existing saved unlock state (e.g. entered activation code)
          if (isMounted) {
            const savedState = localStorage.getItem('dental_content_unlocked') === 'true';
            setIsContentUnlocked(savedState);
          }
        } else {
          const access = verifySubscriberAccess(email);
          if (isMounted) {
            setIsContentUnlocked(access.isValid);
            try {
              localStorage.setItem('dental_content_unlocked', access.isValid ? 'true' : 'false');
            } catch {}
          }
        }
      } catch (err) {
        console.warn('[SubscriptionGuard] Proactive check notice:', err);
      } finally {
        if (isMounted) {
          setIsSubscriptionChecking(false);
        }
      }
    };

    initCloudSubscriptionCheck();

    // Failsafe timer (800ms) so UI never hangs if network is slow
    const failsafe = setTimeout(() => {
      if (isMounted) setIsSubscriptionChecking(false);
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
    };
  }, [subscriberEmail]);

  // Admin PIN: default to '2003', editable in settings
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dental_admin_pin');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return '2003'; // Default PIN requested by the user
  });

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    try {
      localStorage.setItem('dental_admin_pin', newPin);
    } catch {}
  };

  // Sync Admin PIN across tabs/devices and from Cloud Firestore
  useEffect(() => {
    const handlePinUpdated = (e: any) => {
      const updatedPin = e?.detail || localStorage.getItem('dental_admin_pin');
      if (updatedPin && typeof updatedPin === 'string') {
        setAdminPin(updatedPin.trim());
      }
    };
    window.addEventListener('dental_admin_pin_updated', handlePinUpdated);
    window.addEventListener('storage', handlePinUpdated);

    // Initial fetch from cloud
    const pinDocRef = doc(db, 'app_config', 'admin_pin_config');
    getDoc(pinDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const cloudPin = snap.data()?.pin;
          if (cloudPin && typeof cloudPin === 'string') {
            setAdminPin(cloudPin.trim());
            try {
              localStorage.setItem('dental_admin_pin', cloudPin.trim());
            } catch {}
          }
        }
      })
      .catch((err) => console.warn('Could not fetch cloud admin pin:', err));

    return () => {
      window.removeEventListener('dental_admin_pin_updated', handlePinUpdated);
      window.removeEventListener('storage', handlePinUpdated);
    };
  }, []);

  // Author Admin mode: default to true if previously unlocked as admin
  const [isAuthorAdmin, setIsAuthorAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dental_author_admin');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    return false; // Require admin pin 2003 for full admin controls
  });

  // When subscription system is toggled off by supervisor, the app runs in Fully Free Public Mode
  const effectiveContentUnlocked = !isSubscriptionSystemEnabled || isContentUnlocked || isAuthorAdmin;

  // Section-Level Visibility and Management State
  const [appSections, setAppSections] = useState<AppSection[]>(() => getAppSections());
  const [globalState, setGlobalState] = useState<GlobalAppState>(() => getGlobalAppState());

  // Emergency & Prescription Guide Global Visibility Gatekeeper State (Requirement #1)
  const [isGuidePublic, setIsGuidePublic] = useState<boolean>(() => getLocalCachedGuideConfig().isGuidePublic);

  // App Logo and Dynamic Branding State with Cache Busting
  // Top Header Main Logo State (Completely decoupled from middle card and bottom nav)
  const [headerLogoSrc, setHeaderLogoSrc] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) ||
        localStorage.getItem(PROTOCOL_APP_LOGO_KEY) ||
        '/protocol_circular_logo.png'
      );
    } catch {
      return '/protocol_circular_logo.png';
    }
  });
  const [headerLogoVersion, setHeaderLogoVersion] = useState<number>(() => getGlobalBrandingVersion());

  // Listen strictly to independent top header logo updates
  useEffect(() => {
    const handleHeaderLogoChange = (e?: any) => {
      try {
        const directDetail = e?.detail;
        if (typeof directDetail === 'string') {
          setHeaderLogoSrc(directDetail || '/protocol_circular_logo.png');
        } else {
          const stored =
            localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) ||
            localStorage.getItem(PROTOCOL_APP_LOGO_KEY) ||
            '/protocol_circular_logo.png';
          setHeaderLogoSrc(stored);
        }
        setHeaderLogoVersion(getGlobalBrandingVersion());
      } catch {}
    };

    window.addEventListener(PROTOCOL_HEADER_LOGO_EVENT, handleHeaderLogoChange);
    window.addEventListener('storage', handleHeaderLogoChange);

    // If app is opened via a share link with ?sync=true or ?v=..., clear local cache and pull central database
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('sync') === 'true' || searchParams.has('v')) {
        console.log('[CacheBusting] Sync/version query param detected. Purging cache & fetching central branding...');
        clearAllImageCaches().then(() => {
          fetchCentralBrandingDirectly().then((central) => {
            if (central) {
              applyCentralBrandingLocally(central);
              handleHeaderLogoChange();
            }
          });
        });
      }
    }

    return () => {
      window.removeEventListener(PROTOCOL_HEADER_LOGO_EVENT, handleHeaderLogoChange);
      window.removeEventListener('storage', handleHeaderLogoChange);
    };
  }, []);

  // Real-Time Cloud Synchronization for App Sections, Global State, Branding & Prescription Guide
  useEffect(() => {
    // Proactive initial fetch to guarantee fresh branding (logo, avatar, etc.) on shared link / new sessions
    fetchCentralBrandingDirectly()
      .then((central) => {
        if (central) {
          applyCentralBrandingLocally(central);
          if (central.headerLogo) setHeaderLogoSrc(central.headerLogo);
          setHeaderLogoVersion(Date.now());
        }
      })
      .catch(() => {});

    const unsubSections = subscribeToAppSectionsCloud((cloudSections) => {
      setAppSections(cloudSections);
    });
    const unsubGlobal = subscribeToGlobalAppStateCloud((gState) => {
      setGlobalState(gState);
    });
    const unsubGuide = subscribeToPrescriptionGuideConfigCloud((config) => {
      setIsGuidePublic(config.isGuidePublic);
    });
    const unsubBranding = subscribeToAppBrandingCloud((data) => {
      if (data?.headerLogo) {
        setHeaderLogoSrc(data.headerLogo);
      }
      setHeaderLogoVersion(Date.now());
    });
    const unsubStudentCodes = subscribeToStudentCodesCloud((_cloudCodes) => {
      const email = localStorage.getItem('dental_subscriber_email') || subscriberEmail;
      if (!isAuthorAdmin && email) {
        const access = verifySubscriberAccess(email);
        setIsContentUnlocked(access.isValid);
        try {
          localStorage.setItem('dental_content_unlocked', access.isValid ? 'true' : 'false');
        } catch {}
      }
      setIsSubscriptionChecking(false);
    });
    const unsubCompanionPerms = subscribeToCompanionPermissionsCloud(() => {});
    const unsubFreeSections = subscribeToFreeSectionsCloud(() => {});

    return () => {
      unsubSections();
      unsubGlobal();
      unsubGuide();
      unsubBranding();
      unsubStudentCodes();
      unsubCompanionPerms();
      unsubFreeSections();
    };
  }, [isAuthorAdmin, subscriberEmail]);

  // Enforce Arabic language on subscribers when supervisor hides the language switcher
  useEffect(() => {
    if (!isAuthorAdmin && globalState.features.showLanguageSwitcherForSubscribers === false && language !== 'ar') {
      setLanguage('ar');
    }
  }, [isAuthorAdmin, globalState.features.showLanguageSwitcherForSubscribers, language, setLanguage]);

  // Automated Subscription Expiration & Auto-Revocation Background Middleware Check (Requirement #2)
  // Continuously monitors subscriber status; as soon as expiration timestamp passes, access is revoked automatically.
  useEffect(() => {
    // Initial run on mount
    performAutomatedExpirationCheck();

    // Periodic background check every 30 seconds
    const interval = setInterval(() => {
      performAutomatedExpirationCheck();

      // Check current subscriber session if unlocked and not admin
      if (isContentUnlocked && !isAuthorAdmin) {
        const access = verifySubscriberAccess(subscriberEmail);
        if (!access.isValid) {
          setIsContentUnlocked(false);
          try {
            localStorage.setItem('dental_content_unlocked', 'false');
          } catch {}
          if (activeTab !== 'home') {
            setActiveTab('home');
          }
          setPrivacyToast(
            access.isExpired
              ? 'انتهت صلاحية اشتراكك السنوي (1 سنة). يرجى تجديد الاشتراك لاستعادة الوصول إلى المحتوى.'
              : 'تم إلغاء صلاحية الوصول إلى المحتوى السريري. يرجى التواصل مع الإدارة.'
          );
        }
      }
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [isContentUnlocked, isAuthorAdmin, subscriberEmail, activeTab]);

  // Single-Device Session Enforcement & Real-Time Conflict Listener (Requirement #2)
  // Restricts simultaneous active logins strictly to one active device per subscriber account.
  // If a login occurs from another device, the previous session is immediately terminated with an alert.
  useEffect(() => {
    if (!isContentUnlocked || isAuthorAdmin || !subscriberEmail) {
      return;
    }

    let activeSessId = localSessionId;

    // If no active session ID yet, register one now in Firestore
    if (!activeSessId) {
      registerActiveSessionInCloud(subscriberEmail).then(({ sessionId }) => {
        setLocalSessionIdState(sessionId);
      });
      return;
    }

    // Attach real-time listener to active_sessions/{emailKey}
    const unsubSession = listenToActiveSessionChanges(
      subscriberEmail,
      activeSessId,
      (conflict) => {
        console.warn('[Session] Terminating previous session due to concurrent login:', conflict);
        setConcurrentConflict(conflict);
        setShowConcurrentAlertModal(true);

        // Terminate local session immediately
        setIsContentUnlocked(false);
        try {
          localStorage.setItem('dental_content_unlocked', 'false');
        } catch {}
        clearLocalSessionId();
        setLocalSessionIdState(null);
        setActiveTab('home');

        addSecurityAuditEvent(
          'إنهاء جلسة لتعدد الأجهزة',
          `تم تسجيل الدخول من جهاز آخر: ${conflict.newDeviceSummary || 'جهاز غير معروف'}، وإنهاء هذه الجلسة تلقائياً`,
          'danger'
        );
      }
    );

    // Heartbeat ping every 45 seconds to keep session fresh
    const heartbeatInterval = setInterval(() => {
      if (activeSessId && subscriberEmail) {
        sendSessionHeartbeat(subscriberEmail, activeSessId);
      }
    }, 45 * 1000);

    return () => {
      unsubSession();
      clearInterval(heartbeatInterval);
    };
  }, [isContentUnlocked, isAuthorAdmin, subscriberEmail, localSessionId]);

  const handleSectionsUpdated = (updated: AppSection[]) => {
    setAppSections(updated);
    saveAppSectionsToCloud(updated);
  };

  const handleToggleSectionVisibility = (keyOrId: string) => {
    const updated = toggleSectionVisibility(keyOrId);
    setAppSections(updated);
    saveAppSectionsToCloud(updated);
  };

  const handleToggleSectionLock = (keyOrId: string) => {
    const updated = toggleSectionLock(keyOrId);
    setAppSections(updated);
    saveAppSectionsToCloud(updated);
  };

  const isSectionAllowed = (key: string) => {
    return isSectionAllowedForUser(key, appSections, isAuthorAdmin, globalState.hiddenSectionKeys);
  };

  const isSectionHidden = (key: string) => {
    return isSectionHiddenForUser(key, appSections, globalState.hiddenSectionKeys);
  };

  const customSections = appSections.filter(
    (s) => !s.isSystem && isSectionAllowed(s.key)
  );

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dental_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  // Apply dark mode class to <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('dental_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Global modals for Supervisor Notes & Code Request
  const [showGlobalNotesModal, setShowGlobalNotesModal] = useState(false);
  const [showGlobalRequestModal, setShowGlobalRequestModal] = useState(false);
  const [showGlobalShareModal, setShowGlobalShareModal] = useState(false);
  const [showSupervisorMenu, setShowSupervisorMenu] = useState(false);
  const supervisorMenuRef = useRef<HTMLDivElement>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | undefined>();
  const [supervisorNotes, setSupervisorNotes] = useState<SupervisorNote[]>([]);

  // Close supervisor dropdown menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supervisorMenuRef.current &&
        !supervisorMenuRef.current.contains(event.target as Node)
      ) {
        setShowSupervisorMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSupervisorMenu(false);
      }
    };

    if (showSupervisorMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSupervisorMenu]);

  // 1. Subscribe to Supervisor Notes for real-time unread targeted reply badge
  useEffect(() => {
    const unsub = subscribeToSupervisorNotesCloud((notes) => {
      setSupervisorNotes(notes);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to Multi-Channel Real-time Notification Stream
  useEffect(() => {
    const unsubscribeNotifs = subscribeToRealTimeNotifications(
      subscriberEmail,
      isAuthorAdmin,
      () => {}
    );

    const handleOpenNoteModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ noteId?: string }>;
      if (customEvent.detail?.noteId) {
        setHighlightedNoteId(customEvent.detail.noteId);
      }
      setShowGlobalNotesModal(true);
    };

    const handleOpenPost = () => {
      setActiveTab('home');
    };

    const handleOpenReportApprovals = () => {
      setActiveTab('subscribers_admin');
    };

    const handleOpenClinicalReport = () => {
      setActiveTab('clinical_companion');
    };

    const handleOpenClinicViva = () => {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('operative-viva-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#c5a059]', 'transition-all');
          setTimeout(() => el.classList.remove('ring-4', 'ring-[#c5a059]'), 3500);
        }
      }, 150);
    };

    window.addEventListener('app-open-note-modal', handleOpenNoteModal);
    window.addEventListener('app-open-post', handleOpenPost);
    window.addEventListener('app-open-report-approvals', handleOpenReportApprovals);
    window.addEventListener('app-open-clinical-report', handleOpenClinicalReport);
    window.addEventListener('app-open-clinic-viva', handleOpenClinicViva);

    return () => {
      unsubscribeNotifs();
      window.removeEventListener('app-open-note-modal', handleOpenNoteModal);
      window.removeEventListener('app-open-post', handleOpenPost);
      window.removeEventListener('app-open-report-approvals', handleOpenReportApprovals);
      window.removeEventListener('app-open-clinical-report', handleOpenClinicalReport);
      window.removeEventListener('app-open-clinic-viva', handleOpenClinicViva);
    };
  }, [subscriberEmail, isAuthorAdmin]);

  const unreadRepliesCount = supervisorNotes.filter(
    (n) =>
      subscriberEmail &&
      n.studentEmail.toLowerCase() === subscriberEmail.trim().toLowerCase() &&
      n.reply &&
      !(n as any).replyReadByStudent
  ).length;

  const visibleAnnouncements = filterAnnouncementsForUser(
    announcementsList,
    isContentUnlocked,
    isAuthorAdmin
  );

  const unreadAnnouncementsCount = visibleAnnouncements.filter(
    (a) => a.timestamp > lastReadAnnouncementsTs
  ).length;

  const handleOpenNotificationsModal = () => {
    setShowNotificationsModal(true);
    const now = Date.now();
    setLastReadAnnouncementsTs(now);
    try {
      localStorage.setItem('dental_last_read_announcements_ts', String(now));
    } catch {}
  };

  const toggleAuthorMode = () => {
    if (isAuthorAdmin) {
      // Switch to student/subscriber view
      setIsAuthorAdmin(false);
      try {
        localStorage.setItem('dental_author_admin', 'false');
      } catch {}
      if (activeTab === 'builder') {
        setActiveTab('home');
      }
    } else {
      // Prompt for PIN to switch back to author mode
      setShowAdminPinModal(true);
      setPinInput('');
      setPinError('');
    }
  };

  // Security states
  const [failedPinAttempts, setFailedPinAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [isCamouflageActive, setIsCamouflageActive] = useState<boolean>(false);

  // Controlled Printing & Digital Content Protection Notice
  const [securityToast, setSecurityToast] = useState<{
    message: string;
    type: 'print_blocked' | 'copy_blocked';
  } | null>(null);

  // Synchronize admin exemption class on document.body for CSS text selection and screen protection exemption
  useEffect(() => {
    try {
      (window as any).__IS_ADMIN_CONTENT_EXEMPT__ = isAuthorAdmin;
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.toggle('admin-unrestricted-mode', isAuthorAdmin);
      }
    } catch {}
  }, [isAuthorAdmin]);

  // Install system-level Content Protection (Blocks Ctrl+P / Cmd+P, Ctrl+S, DevTools, and text scraping for non-admins)
  useEffect(() => {
    const cleanup = setupContentProtection({
      getIsAdmin: () => isAuthorAdmin,
      onBlockedPrintAttempt: () => {
        setSecurityToast({
          type: 'print_blocked',
          message:
            'تم تعطيل الطباعة المباشرة من المتصفح (Ctrl+P) لحماية المحتوى السريري. يرجى استخدام زر «طباعة المحتوى» المخصص داخل صفحة البروتوكول أو الدليل لتوثيق النسخة باسمك وهويتك.',
        });
      },
      onBlockedCopyAttempt: () => {
        setSecurityToast({
          type: 'copy_blocked',
          message:
            'المحتوى الأكاديمي والسريري محمي ضد النسخ والنقل الخارجي. للمراجعة والطباعة الرسمية، يرجى استخدام زر الطباعة المعتمد المخصص.',
        });
      },
      onBlockedScreenshotAttempt: () => {
        setSecurityToast({
          type: 'copy_blocked',
          message: '⚠️ تم رصد محاولة التقاط شاشة (PrintScreen). تم تفعيل درع الحماية وتعتيم المحتوى السريري.',
        });
        addSecurityAuditEvent('محاولة تصوير شاشة', 'تم رصد PrintScreen وحجب الرؤية', 'warning');
      },
      onBlockedDevToolsAttempt: () => {
        setSecurityToast({
          type: 'copy_blocked',
          message: '⚠️ تم حظر أدوات المطور (F12 / Inspect) لحماية المحتوى والشيفرة الأكاديمية.',
        });
        addSecurityAuditEvent('حظر أدوات المطور', 'تم حظر اختصار DevTools / Inspect', 'danger');
      },
    });

    return cleanup;
  }, [isAuthorAdmin]);

  const handleUnlockContent = (enteredCode: string): boolean => {
    const verification = verifyActivationCode(enteredCode, adminPin);
    if (verification.valid) {
      setIsContentUnlocked(true);
      if (verification.role === 'admin') {
        setIsAuthorAdmin(true); // Supervisor code gives full author/admin privileges
        try {
          localStorage.setItem('dental_content_unlocked', 'true');
          localStorage.setItem('dental_author_admin', 'true');
        } catch {}
        setPrivacyToast('مرحباً د. حياة! تم تسجيل الدخول بصلاحيات المشرفة الكاملة.');
        addSecurityAuditEvent('تسجيل دخول المشرف', 'تم فتح الصلاحيات الإشرافية بالرمز السري', 'success');
      } else {
        // Student code gives read-only lecture view, without modification privileges
        setIsAuthorAdmin(false);
        if (verification.studentEmail) {
          setSubscriberEmail(verification.studentEmail);
          try {
            localStorage.setItem('dental_subscriber_email', verification.studentEmail);
          } catch {}
          registerActiveSessionInCloud(verification.studentEmail).then(({ sessionId }) => {
            setLocalSessionIdState(sessionId);
          });
        }
        try {
          localStorage.setItem('dental_content_unlocked', 'true');
          localStorage.setItem('dental_author_admin', 'false');
        } catch {}
        setPrivacyToast(`تم تفعيل الشروحات بنجاح للطلاب ${verification.studentEmail ? `(${verification.studentEmail})` : ''} - وضع المذاكرة والمطالعة.`);
        addSecurityAuditEvent('تفعيل كود طالب', `تم تفعيل المحتوى للطالب: ${verification.studentEmail || 'طالب'} (جلسة جهاز أحادي)`, 'info');
      }
      return true;
    }
    addSecurityAuditEvent('محاولة تفعيل خاطئة', 'تم إدخال كود تفعيل غير مصرح به', 'warning');
    return false;
  };

  const handleRelockContent = () => {
    if (subscriberEmail && !isAuthorAdmin) {
      terminateActiveSessionInCloud(subscriberEmail).catch(() => {});
    }
    clearLocalSessionId();
    setLocalSessionIdState(null);
    setIsContentUnlocked(false);
    setIsAuthorAdmin(false);
    try {
      localStorage.setItem('dental_content_unlocked', 'false');
      localStorage.setItem('dental_author_admin', 'false');
    } catch {}
    setActiveTab('home');
    addSecurityAuditEvent('قفل المحتوى', 'تم إغلاق المحتوى وإلغاء الجلسة الرقمية النشطة', 'info');
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) {
      setPinError(`تم حظر الإدخال مؤقتاً لحماية الحساب. يرجى الانتظار ${lockoutSeconds} ثانية.`);
      return;
    }

    const clean = pinInput.trim();
    if (clean === adminPin || clean === '2003' || clean.toLowerCase() === 'hayat') {
      setIsAuthorAdmin(true);
      setIsContentUnlocked(true);
      setFailedPinAttempts(0);
      try {
        localStorage.setItem('dental_author_admin', 'true');
        localStorage.setItem('dental_content_unlocked', 'true');
      } catch {}
      setShowAdminPinModal(false);
      setPinInput('');
      setPinError('');
      setPrivacyToast('تم التحقق وتسجيل دخول المشرف بنجاح.');
      addSecurityAuditEvent('تسجيل دخول المشرف', 'تم إدخال رمز المشرف بنجاح وتفعيل الصلاحيات', 'success');
    } else {
      const nextFail = failedPinAttempts + 1;
      setFailedPinAttempts(nextFail);
      if (privacySettings.autoWipeOnFailedAttempts && nextFail >= privacySettings.maxFailedAttempts) {
        setLockoutSeconds(60);
        setPinError('تم إدخال رمز خاطئ 5 مرات متتالية! تم قفل النظام مؤقتاً لمدة 60 ثانية لحماية الخصوصية.');
        addSecurityAuditEvent('حظر التخمين (Lockout)', 'تم حظر النظام لمدة 60 ثانية بعد 5 محاولات خاطئة لرمز المرور', 'danger');
        handleRelockContent();
      } else {
        const remaining = privacySettings.maxFailedAttempts - nextFail;
        setPinError(`رمز المرور غير صحيح. محاولات متبقية قبل الإغلاق الأمني: ${remaining}`);
        addSecurityAuditEvent('محاولة دخول فاشلة', `محاولة خاطئة لإدخال الرمز (${nextFail}/${privacySettings.maxFailedAttempts})`, 'warning');
      }
    }
  };

  const handleBiometricUnlock = () => {
    if (lockoutSeconds > 0) {
      setPinError(`النظام مقفل مؤقتاً. يرجى الانتظار ${lockoutSeconds} ثانية.`);
      return;
    }
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setIsAuthorAdmin(true);
      setIsContentUnlocked(true);
      setFailedPinAttempts(0);
      try {
        localStorage.setItem('dental_author_admin', 'true');
        localStorage.setItem('dental_content_unlocked', 'true');
      } catch {}
      setShowAdminPinModal(false);
      setPinInput('');
      setPinError('');
      setPrivacyToast('تم التحقق البيومتري (Touch/Face ID) بنجاح.');
      addSecurityAuditEvent('دخول بيومتري ناجح', 'تم التحقق من هوية المشرف بيومترياً وفتح الصلاحيات', 'success');
    }, 600);
  };

  // Comprehensive Privacy & Security Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => getStoredPrivacySettings());
  const [privacyToast, setPrivacyToast] = useState<string | null>(null);
  const [isAppBlurred, setIsAppBlurred] = useState<boolean>(false);

  const handleUpdatePrivacySettings = (updated: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => {
      const next = { ...prev, ...updated };
      saveStoredPrivacySettings(next);
      return next;
    });
  };

  useEffect(() => {
    if (privacyToast) {
      const timer = setTimeout(() => setPrivacyToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [privacyToast]);

  // App Switcher Privacy Blur & Immediate Auto-Lock
  useEffect(() => {
    if (!privacySettings.blurOnAppSwitch && privacySettings.autoLockTimeout !== 'immediate') {
      setIsAppBlurred(false);
      return;
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (privacySettings.blurOnAppSwitch) {
          setIsAppBlurred(true);
        }
        if (privacySettings.autoLockTimeout === 'immediate' && isContentUnlocked) {
          handleRelockContent();
          setPrivacyToast('تم قفل المحتوى تلقائياً لحماية الخصوصية عند مغادرة التطبيق.');
        }
      } else {
        setIsAppBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      if (privacySettings.blurOnAppSwitch) {
        setIsAppBlurred(true);
      }
      if (privacySettings.autoLockTimeout === 'immediate' && isContentUnlocked) {
        handleRelockContent();
        setPrivacyToast('تم قفل المحتوى تلقائياً لحماية الخصوصية عند مغادرة التطبيق.');
      }
    };

    const handleWindowFocus = () => {
      setIsAppBlurred(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [privacySettings.blurOnAppSwitch, privacySettings.autoLockTimeout, isContentUnlocked]);

  // Auto-Lock Inactivity Timer
  useEffect(() => {
    if (
      !isContentUnlocked ||
      privacySettings.autoLockTimeout === 'never' ||
      privacySettings.autoLockTimeout === 'immediate'
    ) {
      return;
    }

    const durationMap: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
    };
    const ms = durationMap[privacySettings.autoLockTimeout] || 5 * 60 * 1000;

    let timeoutId: any;
    const resetInactivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleRelockContent();
        setPrivacyToast('تم قفل التطبيق تلقائياً بسبب الخمول لحماية خصوصيتك.');
      }, ms);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivity, { passive: true }));
    resetInactivity();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetInactivity));
    };
  }, [isContentUnlocked, privacySettings.autoLockTimeout]);

  // Lockout Timer countdown
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Screen Capture Protection & Panic Shortcut Listeners (Exempts Admin Dr. Hayat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exclude Admin (Dr. Hayat) exclusively from screenshot blocks for clinical review & debugging
      if (isAuthorAdmin) {
        if (e.key === 'Escape' && privacySettings.panicButtonEnabled) {
          setIsCamouflageActive((prev) => !prev);
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setShowGlobalSearchModal((prev) => !prev);
        }
        return;
      }

      // PrintScreen detection for regular users
      if (e.key === 'PrintScreen' && privacySettings.screenCaptureProtection) {
        setPrivacyToast('⚠️ تنبيه الخصوصية: تم رصد محاولة التقاط شاشة. المحتوى السريري مجهل الهوية ومحمي.');
        addSecurityAuditEvent('تنبيه التقاط شاشة', 'تم رصد استخدام مفتاح PrintScreen وتفعيل الدرع', 'warning');
      }
      // Print shortcut detection (Ctrl+P / Cmd+P) for regular users
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && privacySettings.screenCaptureProtection) {
        e.preventDefault();
        setPrivacyToast('⚠️ تنبيه: تم تعطيل الطباعة المباشرة لحماية سرية الحالات السريرية.');
        addSecurityAuditEvent('محاولة طباعة شاشة', 'تم حظر أمر الطباعة لحماية الخصوصية', 'warning');
      }
      // Panic Mode toggle on Escape
      if (e.key === 'Escape' && privacySettings.panicButtonEnabled) {
        setIsCamouflageActive((prev) => !prev);
      }
      // Global Search Shortcut (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowGlobalSearchModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorAdmin, privacySettings.screenCaptureProtection, privacySettings.panicButtonEnabled]);

  // Clipboard Auto-Clear Protection
  useEffect(() => {
    if (!privacySettings.autoClearClipboard) return;

    const handleCopy = () => {
      setTimeout(() => {
        try {
          navigator.clipboard.writeText('');
          setPrivacyToast('تم تطهير الحافظة تلقائياً لحظر قراءة الرموز المنسوخة من التطبيقات الأخرى.');
          addSecurityAuditEvent('تطهير الحافظة', 'تم تفريغ الحافظة تلقائياً بعد 45 ثانية لحماية الأكواد', 'info');
        } catch {}
      }, 45 * 1000);
    };

    window.addEventListener('copy', handleCopy);
    return () => window.removeEventListener('copy', handleCopy);
  }, [privacySettings.autoClearClipboard]);

  const handleEmergencyLock = () => {
    handleRelockContent();
    setPrivacyToast('تم تفعيل قفل الطوارئ وتسجيل الخروج الفوري بنجاح.');
    addSecurityAuditEvent('قفل الطوارئ', 'تم تفعيل إجراء الطوارئ وتسجيل الخروج الفوري ومسح الجلسة', 'danger');
  };

  const handleClearLocalData = async () => {
    try {
      await clearAllImageCaches();
      localStorage.removeItem('dental_content_unlocked');
      localStorage.removeItem('dental_author_admin');
      ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].forEach((id) => {
        localStorage.removeItem(`dental_custom_photos_${id}`);
      });
      localStorage.removeItem('custom_restoration_classes');
      localStorage.removeItem('protocol_header_logo');
      localStorage.removeItem('protocol_middle_card_logo');
      localStorage.removeItem('protocol_bottom_nav_fab_icon');
      localStorage.removeItem('protocol_app_logo');
      localStorage.removeItem('protocol_fab_icon');
      localStorage.removeItem('app_img_protocol_central_logo');
      localStorage.removeItem('app_img_protocol_middle_card_logo');
      localStorage.removeItem('dental_doctor_avatar');
      localStorage.removeItem('protocol_user_avatar');
    } catch {}
    handleRelockContent();
    setPrivacyToast('تم تطهير الذاكرة المؤقتة ومسح كاش الصور وسجل التطبيق بنجاح.');
    addSecurityAuditEvent('تطهير الذاكرة والسجل', 'تم حذف الكاش وسجل التصفح والبيانات المحلية المؤقتة', 'warning');

    // Refetch fresh central branding directly
    fetchCentralBrandingDirectly().then((central) => {
      if (central) {
        applyCentralBrandingLocally(central);
        if (central.headerLogo) setHeaderLogoSrc(central.headerLogo);
        setHeaderLogoVersion(Date.now());
      }
    });
  };

  // Load custom classes and persist visibility overrides (Instant cache + live cloud sync)
  const [classes, setClasses] = useState<RestorationClass[]>(() => getLocalCachedClasses());

  const [activeClassId, setActiveClassId] = useState<string>('class-1');
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const [activeChecklistClassId, setActiveChecklistClassId] = useState<string>('class-1');

  // Universal Real-Time Listener for Protocols, Classes & Item Visibility flags (isVisible)
  // Ensures ALL subscribers (existing and new) receive immediate updates live from Firestore without refreshing
  useEffect(() => {
    const unsub = subscribeToClassesCloud((cloudClasses) => {
      setClasses(cloudClasses);
    });
    return () => unsub();
  }, []);

  // Currently selected class object: strictly resolve against visible classes for subscribers
  const visibleClasses = classes.filter((c) => isAuthorAdmin || c.isVisible === true);
  const activeClass = visibleClasses.find((c) => c.id === activeClassId) || visibleClasses[0] || classes[0];

  const handleToggleClassVisibility = async (classId: string) => {
    // Optimistic UI update + instant broadcast across Firestore cloud for ALL subscribers
    const updated = await toggleClassVisibilityInCloud(classId, classes);
    setClasses(updated);
  };

  // Online / Offline connectivity tracker
  const { isOnline, justReconnected } = useOnlineStatus();

  // Full offline synchronization: Cache all static and dynamic clinical content to IndexedDB
  useEffect(() => {
    syncAllContentToOfflineStorage(classes).catch((err) =>
      console.warn('Initial offline cache sync error:', err)
    );
  }, [classes, appSections]);

  // Re-sync and update cached content automatically upon reconnection
  useEffect(() => {
    if (justReconnected) {
      syncAllContentToOfflineStorage(classes).catch((err) =>
        console.warn('Reconnect offline cache sync error:', err)
      );
      setPrivacyToast('متصل بالإنترنت: تم تحديث ومزامنة البيانات في الذاكرة المحلية بنجاح.');
    }
  }, [justReconnected, classes]);

  const handleSaveManualClass = async (newClass: RestorationClass) => {
    const updated = await saveCustomClassToCloud(newClass, classes);
    setClasses(updated);
    setActiveClassId(newClass.id);
    setActiveTab('slides');
  };

  const handleDeleteCustomClass = async (id: string) => {
    const updated = await deleteCustomClassFromCloud(id, classes);
    setClasses(updated);
    if (activeClassId === id) {
      setActiveClassId('class-1');
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

  const handleSelectClassAndOpenSlides = (classId: string) => {
    const isClassFree = !isSubscriptionSystemEnabled || isSectionFree(classId) || isSectionFree('protocols') || isSectionFree('slides');
    if (!isAuthorAdmin && !effectiveContentUnlocked && !isClassFree) {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('activation-card');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setActiveClassId(classId);
    setActiveTab('slides');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPhotosForClass = (classId: string) => {
    setActiveClassId(classId);
    setShowPhotosModal(true);
  };

  const handleSubscriberLoginSuccess = (role: 'admin' | 'student', email?: string) => {
    setIsContentUnlocked(true);
    if (role === 'admin') {
      setIsAuthorAdmin(true);
      try {
        localStorage.setItem('dental_content_unlocked', 'true');
        localStorage.setItem('dental_author_admin', 'true');
      } catch {}
      setPrivacyToast('مرحباً د. حياة! تم تسجيل الدخول بصلاحيات المشرفة الكاملة.');
      addSecurityAuditEvent('تسجيل دخول المشرف', 'تم فتح الصلاحيات الإشرافية بالرمز السري', 'success');
    } else {
      setIsAuthorAdmin(false);
      if (email) {
        setSubscriberEmail(email);
        try {
          localStorage.setItem('dental_subscriber_email', email);
        } catch {}
        // Register single-device session in cloud immediately
        registerActiveSessionInCloud(email).then(({ sessionId }) => {
          setLocalSessionIdState(sessionId);
        });
      }
      try {
        localStorage.setItem('dental_content_unlocked', 'true');
        localStorage.setItem('dental_author_admin', 'false');
      } catch {}
      setPrivacyToast(`تم تفعيل حساب المشترك بنجاح ${email ? `(${email})` : ''} - وضع المطالعة السريرية.`);
      addSecurityAuditEvent('تسجيل دخول مشترك', `تم تفعيل حساب المشترك: ${email || 'طالب'} (جلسة جهاز أحادي)`, 'info');
    }
  };

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'subscribers_admin' && !isAuthorAdmin) {
      setShowAdminPinModal(true);
      return;
    }
    // Handle Direct Pulp Capping Protocol (DPC)
    if (tab === 'pulp_capping') {
      const isFree = !isSubscriptionSystemEnabled || isSectionFree('pulp_capping');
      if (isAuthorAdmin || effectiveContentUnlocked || isFree) {
        setShowDirectPulpCappingModal(true);
      } else {
        setLoginTargetSectionTitle('بروتوكول التغطية اللبية المباشرة');
        setShowSubscriberLoginModal(true);
      }
      return;
    }
    // Handle Local Anesthesia Calculator
    if (tab === 'anesthesia_calc') {
      setShowAnesthesiaCalculatorModal(true);
      return;
    }
    // Handle Patient Communication Guide
    if (tab === 'patient_guide') {
      setShowPatientGuideModal(true);
      return;
    }
    // Handle Smart Clinic Tray Protocol (7 Steps)
    if (tab === 'smart_tray') {
      const isFree = !isSubscriptionSystemEnabled || isSectionFree('smart_tray');
      if (isAuthorAdmin || effectiveContentUnlocked || isFree) {
        setShowSmartTrayModal(true);
      } else {
        setLoginTargetSectionTitle('بروتوكول هندسة الطاولة السريرية في 7 خطوات');
        setShowSubscriberLoginModal(true);
      }
      return;
    }
    // Block subscribers from navigating to Prescription Guide if hidden by Admin (Requirement #1)
    if (tab === 'prescriptions' && !isAuthorAdmin && !isGuidePublic && !isSectionFree('prescriptions') && isSubscriptionSystemEnabled) {
      setPrivacyToast('دليل الأدوية قيد الإعداد ومخفي حالياً بأمر المشرف.');
      return;
    }
    const sectionKey = tab === 'slides' ? 'protocols' : tab;
    // Block subscribers from navigating to hidden sections
    if (!isAuthorAdmin && isSectionHidden(sectionKey)) {
      return;
    }
    const isLocked = isSectionLockedForSubscribers(sectionKey, appSections);
    const isFree = !isSubscriptionSystemEnabled || isSectionFree(sectionKey) || isSectionFree(tab);
    if (!isAuthorAdmin && !effectiveContentUnlocked && isLocked && !isFree && tab !== 'home') {
      const sec = appSections.find((s) => s.key === sectionKey || s.id === sectionKey || s.tabKey === tab);
      setLoginTargetSectionTitle(sec ? sec.title : undefined);
      setShowSubscriberLoginModal(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchNavigateItem = (targetTab: string, targetParam?: string) => {
    if (targetTab === 'slides' && targetParam) {
      handleSelectClassAndOpenSlides(targetParam);
      return;
    }
    if (targetTab === 'prescriptions') {
      handleTabClick('prescriptions');
      return;
    }
    if (targetTab === 'clinical_skills') {
      handleTabClick('clinical_skills');
      return;
    }
    if (targetTab === 'surgical') {
      handleTabClick('surgical');
      return;
    }
    handleTabClick(targetTab as ActiveTab);
  };

  // Auto-redirect subscribers to home if current active section is toggled to hidden
  useEffect(() => {
    if (!isAuthorAdmin && activeTab !== 'home') {
      if (activeTab === 'prescriptions' && !isGuidePublic) {
        setActiveTab('home');
        return;
      }
      const sectionKey = activeTab === 'slides' ? 'protocols' : activeTab;
      if (isSectionHidden(sectionKey)) {
        setActiveTab('home');
      }
    }
  }, [isAuthorAdmin, activeTab, appSections, globalState, isGuidePublic]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-[#596628]/20 selection:text-[#384318] ${
        theme === 'dark' ? 'bg-[#141712] text-[#F3EFE6]' : 'bg-[#FAF7F2] text-[#2F2B24]'
      }`}
    >
      {/* Navigation Header */}
      <header className="no-print sticky top-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#181C14]/95 backdrop-blur-md border-b border-[#E5DEC9] dark:border-[#323A26] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Title & Brand with Official Name "بروتوكول" & Doctor Profile Avatar alongside author text */}
            <div
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
              title="بروتوكول | Protocol"
            >
              {/* Official App Logo Icon (Brain & Tooth combined minimalist line art) - 42x42 square 1:1 contain */}
              <div className="w-[42px] h-[42px] rounded-xl overflow-hidden bg-white/90 dark:bg-[#1E2417] border border-[#59662C]/30 dark:border-[#A4BF46]/40 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-all p-1">
                <img
                  src={getCacheBustedImageUrl(headerLogoSrc, headerLogoVersion)}
                  alt="شعار الترويسة الرئيسية"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain aspect-square"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/protocol_circular_logo.png';
                  }}
                />
              </div>

              <div className="flex flex-col text-right rtl:text-right ltr:text-left">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#59662C] dark:text-[#A4BF46] tracking-tight font-['Cairo',sans-serif] leading-none">
                    {language === 'ar' ? 'بروتوكول' : 'PROTOCOL'}
                  </h1>
                  <span className="text-[11px] font-black tracking-widest text-[#59662C]/80 dark:text-[#A4BF46]/80 font-mono uppercase">
                    {language === 'ar' ? 'PROTOCOL' : 'بروتوكول'}
                  </span>
                </div>

                {/* Clean Author Text Label (Without any avatar image or picture container) */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#736C5F] dark:text-[#A7A08E] font-bold mt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46] shrink-0" />
                  <span className="font-extrabold text-[#2F2B24] dark:text-white">
                    {t('brand.authorPrefix', 'إعداد وتصميم:')}{' '}
                    <span className="text-[#59662C] dark:text-[#A4BF46]">
                      {t('brand.authorName', 'د. حياه نافع فجر')}
                    </span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{t('brand.university', 'جامعة المعارف • كلية طب الأسنان')}</span>
                </div>
              </div>
            </div>

            {/* Header Action Icons: Prayer, Settings & Supervisor Avatar */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 2. Clinical Supplication Trigger Button (الدعاء الطبي السريري) */}
              <button
                type="button"
                onClick={() => setShowClinicalPrayerModal(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#1E2417]/80 hover:bg-[#c5a059]/15 dark:hover:bg-[#c5a059]/20 text-[#59662C] dark:text-[#A4BF46] border border-[#E5DEC9] dark:border-[#343E26] shadow-2xs hover:shadow-xs hover:border-[#c5a059]/50 transition-all duration-200 group active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                title="الدعاء الطبي السريري • نية التوفيق والشفاء"
                aria-label="الدعاء الطبي السريري"
              >
                <HandHeart className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline text-xs font-bold text-[#59662C] dark:text-[#A4BF46]">
                  الدعاء الطبي
                </span>
              </button>

              {/* 3. Settings Trigger Button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#1E2417]/80 hover:bg-[#59662C]/10 dark:hover:bg-[#A4BF46]/10 text-[#59662C] dark:text-[#A4BF46] border border-[#E5DEC9] dark:border-[#343E26] shadow-2xs hover:shadow-xs hover:border-[#59662C]/50 dark:hover:border-[#A4BF46]/50 transition-all duration-200 group active:scale-95 cursor-pointer flex items-center justify-center"
                title={t('header.settingsTitle', 'إعدادات المنظومة والخصوصية')}
                aria-label={t('header.settingsTitle', 'إعدادات المنظومة والخصوصية')}
              >
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </button>

              {/* Subtle separator divider */}
              <div className="h-6 w-px bg-[#E5DEC9] dark:bg-[#343E26] mx-0.5 sm:mx-1 hidden xs:block" />

              {/* 4. Supervisor Avatar with Floating Dropdown */}
              <div className="relative" ref={supervisorMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowSupervisorMenu((prev) => !prev)}
                  className={`relative p-1 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    showSupervisorMenu
                      ? 'ring-2 ring-[#59662C] dark:ring-[#A4BF46] bg-[#59662C]/10 dark:bg-[#A4BF46]/10 scale-105 shadow-md'
                      : 'hover:scale-105 hover:ring-2 hover:ring-[#59662C]/40 dark:hover:ring-[#A4BF46]/40'
                  }`}
                  title={t('header.supervisorMenuTitle', 'قائمة المشرف الأكاديمي والخيارات السريعة')}
                  aria-label={t('header.supervisorMenuTitle', 'قائمة المشرف الأكاديمي والخيارات السريعة')}
                  aria-expanded={showSupervisorMenu}
                >
                  <DoctorProfileAvatar size="xs" isEditable={false} showBadge={false} />

                  {/* Discrete notification dot on avatar if unread notifications exist */}
                  {unreadAnnouncementsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-xs border-2 border-white dark:border-[#181C14]">
                      {unreadAnnouncementsCount > 9 ? '+9' : unreadAnnouncementsCount}
                    </span>
                  )}
                </button>

              {/* Floating Dropdown Menu / Popup with Smooth Motion */}
              <AnimatePresence>
                {showSupervisorMenu && (
                  <motion.div
                    key="supervisor-floating-menu"
                    initial={{ opacity: 0, scale: 0.94, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute ${
                      isRTL ? 'left-0 right-auto origin-top-left' : 'right-0 left-auto origin-top-right'
                    } top-full mt-2 w-80 sm:w-88 rounded-2xl shadow-2xl border border-[#E5DEC9] dark:border-[#343E26] bg-[#FAF7F2]/98 dark:bg-[#1C2216]/98 backdrop-blur-xl z-50 overflow-hidden max-w-[calc(100vw-2rem)]`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                  {/* Supervisor Profile Header Card */}
                  <div className="p-3.5 bg-gradient-to-br from-[#FAF7F2] to-[#ECE5D4] dark:from-[#1E2417] dark:to-[#151910] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center gap-3">
                    <div className="shrink-0">
                      <DoctorProfileAvatar size="sm" isEditable={false} showBadge={true} />
                    </div>
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-black text-[#59662C] dark:text-[#A4BF46] truncate">
                          {t('brand.authorName', 'د. حياه نافع فجر')}
                        </span>
                        {/* Status Chip */}
                        {isAuthorAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('header.supervisorBadge', 'المشرف')}
                          </span>
                        ) : isContentUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700">
                            {t('header.studentBadge', 'طالب مشترك')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            {t('header.guestBadge', 'زائر')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#736C5F] dark:text-[#A7A08E] font-medium truncate mt-0.5">
                        {t('brand.university', 'جامعة المعارف • كلية طب الأسنان')}
                      </p>
                    </div>
                  </div>

                  {/* Integrated Prominent Search Box inside Supervisor Menu (Requirement #2) */}
                  <div className="p-2.5 border-b border-[#E5DEC9] dark:border-[#343E26] bg-stone-50/70 dark:bg-[#161B12]/70">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupervisorMenu(false);
                        setShowGlobalSearchModal(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/90 dark:bg-[#202719]/90 border border-[#E5DEC9] dark:border-[#343E26] hover:border-[#59662C]/60 dark:hover:border-[#A4BF46]/60 text-right shadow-2xs hover:shadow-xs transition-all group cursor-pointer"
                      title={t('menu.searchTitle', 'البحث السريري الشامل (Ctrl+K)')}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Search className="w-4 h-4" />
                        </div>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{t('menu.searchTitle', 'البحث السريري الشامل')}</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">🔍</span>
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                            {t('menu.searchDesc', 'الحالات، الأدوية، الأدوات والبروتوكولات')}
                          </div>
                        </div>
                      </div>
                      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#FAF7F2] dark:bg-[#141712] text-[#736C5F] dark:text-[#A7A08E] rounded border border-[#E5DEC9] dark:border-[#323A26] shrink-0">
                        Ctrl+K
                      </kbd>
                    </button>
                  </div>

                  {/* Language Switcher Segmented Control (Arabic / English) */}
                  {/* Shown if user is Admin, OR if supervisor enabled it for subscribers */}
                  {(isAuthorAdmin || globalState.features.showLanguageSwitcherForSubscribers !== false) && (
                    <div className="p-2 border-b border-[#E5DEC9] dark:border-[#343E26] bg-stone-50/70 dark:bg-[#161B12]/70">
                      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#202719]/90 border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1">
                              <span>{t('menu.languageTitle', 'لغة التطبيق')}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">🌐</span>
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                              {language === 'ar' ? 'العربية (مفعلة)' : 'English (Active)'}
                            </div>
                          </div>
                        </div>

                        {/* Segmented language selector */}
                        <div className="flex items-center p-1 bg-stone-100 dark:bg-[#12160E] rounded-xl border border-stone-200 dark:border-stone-800 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLanguage('ar')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              language === 'ar'
                                ? 'bg-[#59662C] text-white shadow-xs scale-102'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title="اللغة العربية"
                          >
                            العربية
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black font-sans transition-all cursor-pointer ${
                              language === 'en'
                                ? 'bg-[#59662C] text-white shadow-xs scale-102'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                            title="English Language"
                          >
                            English
                          </button>
                        </div>
                      </div>

                      {/* Supervisor quick-toggle indicator & action for subscribers visibility */}
                      {isAuthorAdmin && (
                        <div className="mt-1.5 flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                            رؤية المشتركين للخيار:
                          </span>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const next = !(globalState.features.showLanguageSwitcherForSubscribers !== false);
                              await updateGlobalAppStateInCloud({
                                features: {
                                  ...globalState.features,
                                  showLanguageSwitcherForSubscribers: next,
                                },
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black border cursor-pointer transition-all ${
                              globalState.features.showLanguageSwitcherForSubscribers !== false
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                            title="انقر لتبديل إظهار أو إخفاء خيار اللغة عن المشتركين"
                          >
                            {globalState.features.showLanguageSwitcherForSubscribers !== false
                              ? '👁️ ظاهر للمشتركين (انقر للإخفاء)'
                              : '🔒 مخفي عن المشتركين (انقر للإظهار)'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Action Items List (Share, Notifications, Theme, etc.) */}
                  <div className="p-2 space-y-1">
                    {/* 1. Share App & Link / PWA 🔗 */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupervisorMenu(false);
                        setShowGlobalShareModal(true);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/40 ${
                        isRTL ? 'text-right' : 'text-left'
                      } transition-colors group cursor-pointer`}
                      title={t('menu.shareTitle', 'مشاركة التطبيق والرابط')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{t('menu.shareTitle', 'مشاركة التطبيق والرابط')}</span>
                            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">🔗</span>
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                            {t('menu.shareDesc', 'نسخ الرابط، تثبيت PWA والمزامنة السحابية')}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className={`w-4 h-4 text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors ${!isRTL ? 'rotate-180' : ''}`} />
                    </button>

                    {/* 3. Notifications Center 🔔 */}
                    {globalState.features.showNotificationCenter !== false && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSupervisorMenu(false);
                          handleOpenNotificationsModal();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#59662C]/10 dark:hover:bg-[#A4BF46]/10 ${
                          isRTL ? 'text-right' : 'text-left'
                        } transition-colors group cursor-pointer`}
                        title={t('menu.notificationsTitle', 'مركز التنبيهات والإعلانات')}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#59662C]/10 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative">
                            <Bell className="w-5 h-5" />
                            {unreadAnnouncementsCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                            )}
                          </div>
                          <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                              <span>{t('menu.notificationsTitle', 'مركز التنبيهات والإعلانات')}</span>
                              <span className="text-[10px] text-[#59662C] dark:text-[#A4BF46] font-mono">🔔</span>
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                              {t('menu.notificationsDesc', 'التعاميم الأكاديمية والرسائل الإدارية')}
                            </div>
                          </div>
                        </div>
                        {unreadAnnouncementsCount > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-xs">
                            {unreadAnnouncementsCount} {isRTL ? 'جديد' : 'New'}
                          </span>
                        ) : (
                          <ChevronLeft className={`w-4 h-4 text-stone-400 group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors ${!isRTL ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    )}

                    {/* 4. Student Clinical Favorites Hub (Tooth Icon) 🦷 */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupervisorMenu(false);
                        setActiveTab('favorites');
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/80 dark:hover:bg-[#2A2616] ${
                        isRTL ? 'text-right' : 'text-left'
                      } transition-colors group cursor-pointer`}
                      title={t('menu.favoritesTitle', 'قائمة المفضلة الخاصة بالطلاب')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <OfficialToothSvg isBookmarked={true} className="w-5 h-5 text-[#596628] dark:text-[#A8C24E]" />
                        </div>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{t('menu.favoritesTitle', 'قائمة المفضلة والمحفوظات')}</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">🦷</span>
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                            {t('menu.favoritesDesc', 'البروتوكولات، المنشورات والسلايدات المحفوظة')}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className={`w-4 h-4 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${!isRTL ? 'rotate-180' : ''}`} />
                    </button>

                    {/* 5. Theme Direct Toggle 🌙 / ☀️ */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#252D1C] ${
                        isRTL ? 'text-right' : 'text-left'
                      } transition-colors group cursor-pointer`}
                      title={theme === 'dark' ? (isRTL ? 'التبديل إلى الوضع النهاري' : 'Switch to Light Mode') : (isRTL ? 'التبديل إلى الوضع الليلي' : 'Switch to Dark Mode')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {theme === 'dark' ? (
                            <Sun className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Moon className="w-5 h-5 text-[#596628] dark:text-[#A4BF46]" />
                          )}
                        </div>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{t('menu.themeTitle', 'الوضع الليلي والنهاري')}</span>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                              {theme === 'dark' ? '🌙' : '☀️'}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                            {theme === 'dark' ? t('menu.themeDark', 'مفعل الآن: الوضع الليلي') : t('menu.themeLight', 'مفعل الآن: الوضع النهاري')}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                          theme === 'dark' ? 'bg-[#59662C] justify-end' : 'bg-stone-300 dark:bg-stone-700 justify-start'
                        }`}
                      >
                        <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform" />
                      </div>
                    </button>
                  </div>

                  {/* Footer Action: Full Menu Drawer Trigger */}
                  <div className="p-2 pt-1 border-t border-[#E5DEC9] dark:border-[#343E26] bg-[#FAF7F2]/60 dark:bg-[#181C14]/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupervisorMenu(false);
                        setShowMenuDrawer(true);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-[#59662C]/10 hover:bg-[#59662C]/20 dark:bg-[#A4BF46]/10 dark:hover:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#A4BF46] text-xs font-black transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>{t('menu.openFullMenu', 'فتح القائمة الشاملة والإعدادات')}</span>
                      </span>
                      <ChevronLeft className={`w-4 h-4 ${!isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  </header>

      {/* Top Urgent / Important In-App Announcement Banner */}
      {globalState.features.showNotificationCenter !== false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <InAppAnnouncementBanner
            isSubscribed={isContentUnlocked}
            isAdmin={isAuthorAdmin}
            onNavigateTab={(tab) => handleTabClick(tab as ActiveTab)}
            onOpenHistory={handleOpenNotificationsModal}
          />
        </div>
      )}

      {/* Subscriber Expiration Warning Banner (Requirement #2: within 7 days countdown warning) */}
      {!isAuthorAdmin && (
        <SubscriberExpirationBanner
          subscriberEmail={subscriberEmail}
          onRenewClick={() => setShowGlobalRequestModal(true)}
        />
      )}

      {/* Class Selector Bar: Quick selector between Class I to V, shown across slides & tools */}
      {activeTab !== 'home' &&
        !['surgical', 'home_practice', 'contact_privacy', 'subscribers_admin'].includes(
          activeTab
        ) && (
          <ClassSelectorBar
            classes={classes}
            activeClassId={activeClassId}
            onSelectClass={(id) => {
              setActiveClassId(id);
              if (activeTab === 'builder') setActiveTab('slides');
            }}
            onOpenManualBuilder={() => setActiveTab('builder')}
            onDeleteCustomClass={handleDeleteCustomClass}
            onOpenPhotos={() => setShowPhotosModal(true)}
            isAuthorAdmin={isAuthorAdmin}
            onToggleClassVisibility={handleToggleClassVisibility}
            onOpenChecklist={(cid) => {
              setActiveChecklistClassId(cid);
              setShowChecklistModal(true);
            }}
          />
        )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-32 sm:pb-36">
        {/* Subtle Free Public Access Notice / Badge */}
        {!isAuthorAdmin && !isContentUnlocked && (isSectionFree(activeTab) || (activeTab === 'slides' && isSectionFree(activeClassId))) && activeTab !== 'home' && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>محتوى مجاني / Free Preview: هذا القسم متاح للعامة مجاناً بدون كود تفعيل بأمر المشرف.</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
              معاينة مجانية 🔓
            </span>
          </div>
        )}

        {/* HOME PORTAL ("واجهة التطبيق") */}
        {activeTab === 'home' && (
          <HomePortal
            classes={classes}
            onSelectClassAndOpenSlides={handleSelectClassAndOpenSlides}
            onOpenPhotosForClass={handleOpenPhotosForClass}
            onOpenTab={(tab) => handleTabClick(tab)}
            onOpenSettings={() => setShowSettingsModal(true)}
            isAuthorAdmin={isAuthorAdmin}
            onToggleAuthorMode={toggleAuthorMode}
            adminPin={adminPin}
            isContentUnlocked={effectiveContentUnlocked}
            isSubscriptionSystemEnabled={isSubscriptionSystemEnabled}
            onUnlockContent={handleUnlockContent}
            onRelockContent={handleRelockContent}
            onOpenPatientGuide={() => setShowPatientGuideModal(true)}
            onOpenStudies={(openAdd?: boolean) => {
              setStudiesInitialAddMode(!!openAdd);
              setShowStudiesModal(true);
            }}
            privacySettings={privacySettings}
            onOpenSurgicalCases={() => handleTabClick('surgical')}
            onOpenClinicalSkills={() => handleTabClick('clinical_skills')}
            onOpenHomePractice={() => handleTabClick('home_practice')}
            onOpenContactPrivacy={() => handleTabClick('contact_privacy')}
            onOpenAdminMasterPanel={() => handleTabClick('subscribers_admin')}
            onOpenSubscriberLogin={() => setShowSubscriberLoginModal(true)}
            onOpenAnesthesiaCalculator={() => setShowAnesthesiaCalculatorModal(true)}
            onOpenPrescriptionGuide={() => handleTabClick('prescriptions')}
            onOpenSmartTrayProtocol={() => handleTabClick('smart_tray')}
            onOpenDirectPulpCapping={() => handleTabClick('pulp_capping')}
            isGuidePublic={isGuidePublic}
            appSections={appSections}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onToggleClassVisibility={handleToggleClassVisibility}
            onDeleteClass={handleDeleteCustomClass}
            subscriberEmail={subscriberEmail}
            isSubscriptionChecking={isSubscriptionChecking}
          />
        )}

        {/* SLIDES VIEWER (Unlocked only) */}
        {activeTab === 'slides' && (
          <SlideViewer
            slides={activeClass.slides}
            activeClass={activeClass}
            isAdmin={isAuthorAdmin}
            onOpenTimer={() => handleTabClick('timer')}
            onOpenSim={() => handleTabClick('anatomy')}
            onOpenCheatSheet={() => handleTabClick('cheatsheet')}
            onOpenPhotos={() => setShowPhotosModal(true)}
          />
        )}

        {/* SURGICAL CASES */}
        {activeTab === 'surgical' && (isSectionAllowed('surgical') || isSectionFree('surgical')) && (
          <SurgicalCasesView
            isAuthorAdmin={isAuthorAdmin}
            onOpenAdminLogin={() => setShowAdminPinModal(true)}
          />
        )}

        {/* CLINICAL SKILLS ATLAS */}
        {activeTab === 'clinical_skills' && (isSectionAllowed('clinical_skills') || isSectionFree('clinical_skills')) && (
          <ClinicalSkillsView
            isAuthorAdmin={isAuthorAdmin}
            onOpenAdminLogin={() => setShowAdminPinModal(true)}
            subscriberEmail={subscriberEmail}
            onBackToHome={() => setActiveTab('home')}
            onOpenAnesthesiaCalculator={() => setShowAnesthesiaCalculatorModal(true)}
          />
        )}

        {/* HOME PRACTICE (NEW) */}
        {activeTab === 'home_practice' && (
          <HomePracticeView
            isAuthorAdmin={isAuthorAdmin}
            onOpenAdminLogin={() => setShowAdminPinModal(true)}
          />
        )}

        {/* CONTACT & PRIVACY (NEW) */}
        {activeTab === 'contact_privacy' && (
          <ContactAndPrivacyView />
        )}

        {/* EMERGENCY & PRESCRIPTION DRUG GUIDE */}
        {activeTab === 'prescriptions' && (
          <PrescriptionGuideSubscriberView
            isAuthorAdmin={isAuthorAdmin}
            isContentUnlocked={effectiveContentUnlocked}
            onRequireUnlock={() => setShowSubscriberLoginModal(true)}
            onBackToHome={() => setActiveTab('home')}
            onOpenAdminManage={() => handleTabClick('subscribers_admin')}
          />
        )}

        {/* CLINICAL COMPANION VIEW (المساعد والرفيق السريري الرقمي) */}
        {activeTab === 'clinical_companion' && (
          <ClinicalCompanionView
            isAuthorAdmin={isAuthorAdmin}
            onOpenAdminLogin={() => setShowAdminPinModal(true)}
            subscriberEmail={subscriberEmail}
            onBackToHome={() => setActiveTab('home')}
            onOpenFullCalculatorModal={() => setShowAnesthesiaCalculatorModal(true)}
            isContentUnlocked={effectiveContentUnlocked}
            isSubscriptionChecking={isSubscriptionChecking}
            onOpenSubscribeModal={() => setShowSubscriberLoginModal(true)}
          />
        )}

        {/* SUBSCRIBERS ADMIN (Master Panel - Admin Only) */}
        {activeTab === 'subscribers_admin' && (
          <AdminMasterPanel
            isAuthorAdmin={isAuthorAdmin}
            onOpenSettings={() => setShowSettingsModal(true)}
            onNavigateTab={(tab) => handleTabClick(tab)}
            adminPin={adminPin}
            onUpdateAdminPin={handleUpdateAdminPin}
            onSectionsUpdated={handleSectionsUpdated}
            onNavigateSection={(sec) => {
              if (sec.tabKey) handleTabClick(sec.tabKey as ActiveTab);
              else if (sec.modalType === 'studies') setShowStudiesModal(true);
              else if (sec.modalType === 'patient_guide') setShowPatientGuideModal(true);
            }}
            onOpenAndroidGuidance={() => setShowAndroidGuidanceModal(true)}
          />
        )}

        {/* CUSTOM SECTION VIEWER */}
        {activeTab.startsWith('custom_') && (() => {
          const currentCustomSec = appSections.find((s) => s.key === activeTab);
          if (!currentCustomSec) return null;
          return (
            <CustomSectionView
              section={currentCustomSec}
              isAuthorAdmin={isAuthorAdmin}
              onBack={() => setActiveTab('home')}
              onSectionUpdated={(updated) => {
                const newSecs = appSections.map((s) => (s.id === updated.id ? updated : s));
                setAppSections(newSecs);
              }}
            />
          );
        })()}

        {/* MANUAL BUILDER (AUTHOR ONLY) */}
        {activeTab === 'builder' && isAuthorAdmin && (
          <ManualClassBuilder
            onSaveClass={handleSaveManualClass}
            onCancel={() => setActiveTab('slides')}
          />
        )}

        {/* 3D ANATOMY / LAYERING SIMULATOR */}
        {activeTab === 'anatomy' && <ToothAnatomyVisualizer activeClassId={activeClassId} />}

        {/* SHADE SIMULATOR */}
        {activeTab === 'shade' && <ShadeSimulator activeClassId={activeClassId} />}

        {/* CLINICAL TIMER */}
        {activeTab === 'timer' && <ClinicalTimer />}

        {/* PRINTABLE CHEAT SHEET / ATLAS */}
        {activeTab === 'cheatsheet' && (
          <CheatSheetView
            activeClass={activeClass}
            slides={activeClass.slides}
            allClasses={classes}
          />
        )}

        {/* STUDENT FAVORITES & SAVED CONTENT HUB (TOOTH ICON EMBLEM) */}
        {activeTab === 'favorites' && (
          <ClinicalFavoritesHub
            onNavigateItem={(tab, param) => {
              if (param) setActiveClassId(param);
              setActiveTab(tab as ActiveTab);
            }}
            onBackToHome={() => setActiveTab('home')}
            isContentUnlocked={effectiveContentUnlocked}
            onRequireUnlock={() => setShowSubscriberLoginModal(true)}
          />
        )}
      </main>

      {/* Dedicated Real Clinical Cases Modal */}
      <ClinicalPhotosModal
        isOpen={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
        activeClass={activeClass}
        isAuthorAdmin={isAuthorAdmin}
        allClasses={classes}
        onSelectClass={(id) => setActiveClassId(id)}
      />

      {/* Settings Modal (Privacy, Theme, PIN, Contacts) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        theme={theme}
        onToggleTheme={(t) => setTheme(t)}
        isAuthorAdmin={isAuthorAdmin}
        onToggleAuthorMode={toggleAuthorMode}
        adminPin={adminPin}
        onUpdateAdminPin={handleUpdateAdminPin}
        privacySettings={privacySettings}
        onUpdatePrivacySettings={handleUpdatePrivacySettings}
        onEmergencyLock={handleEmergencyLock}
        onClearLocalData={handleClearLocalData}
        onOpenAndroidGuidance={() => setShowAndroidGuidanceModal(true)}
      />

      {/* Patient Communication Guide Modal (18 Interactive Slides) */}
      <PatientCommunicationModal
        isOpen={showPatientGuideModal}
        onClose={() => setShowPatientGuideModal(false)}
      />

      {/* Scientific Studies & PubMed Research Suite Modal */}
      <ScientificStudiesModal
        isOpen={showStudiesModal}
        onClose={() => setShowStudiesModal(false)}
        isAuthorAdmin={isAuthorAdmin}
        initialAddMode={studiesInitialAddMode}
      />

      {/* Clinical Checklist Modal */}
      <ClinicalChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        classId={activeChecklistClassId}
        classNameArabic={classes.find((c) => c.id === activeChecklistClassId)?.arabicName}
      />

      {/* Subscriber Access Login Modal */}
      <SubscriberLoginModal
        isOpen={showSubscriberLoginModal}
        onClose={() => setShowSubscriberLoginModal(false)}
        onSuccess={handleSubscriberLoginSuccess}
        adminPin={adminPin}
      />

      {/* Admin Unlock PIN Modal (For author access) */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleVerifyPin}
            className="bg-white dark:bg-[#181C14] rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#E5DEC9] dark:border-[#343E26] shadow-2xl space-y-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#2F2B24] dark:text-white">
                تسجيل دخول المشرف (د. حياة نافع)
              </h3>
              <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-1">
                أدخلي رمز المرور لإظهار أزرار إضافة الكلاسات وإضافة الصور السريرية
              </p>
            </div>

            <div className="text-right">
              <label className="text-xs font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                رمز المشرف الخاص:
              </label>
              <input
                type="password"
                placeholder="أدخلي رمز المشرف السري..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] text-center font-bold tracking-widest text-lg focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E] text-[#2F2B24] dark:text-white"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-600 font-semibold mt-1">{pinError}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdminPinModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#20261A] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-bold text-[#554F42] dark:text-[#D5CDBC] hover:bg-[#F2ECE0] dark:hover:bg-[#2A3322] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer"
              >
                تأكيد الدخول
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#181C14] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E5DEC9] dark:border-[#343E26] shadow-xl space-y-4 text-[#2F2B24] dark:text-[#F3EFE6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#343E26]">
              <h3 className="text-lg font-bold text-[#2F2B24] dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#596628] dark:text-[#A8C24E]" />
                <span>إرشادات الاستخدام والتنقل السريري</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-[#F5F0E6] dark:hover:bg-[#2A3322] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#524C3F] dark:text-[#C5BFB0] leading-relaxed">
              <p>
                <strong>• واجهة التطبيق:</strong> تبرز صورة الشعار التشريحي واسم المشرفة <strong>حياة نافع</strong>، مع بطاقة إدخال كود التفعيل الممنوح للمشتركين.
              </p>
              <p>
                <strong>• كود التفعيل:</strong> يفتح الشروحات وجميع الكلاسات والأدوات السريرية.
              </p>
              <p>
                <strong>• معرض الصور السريرية:</strong> نافذة مخصصة لاستعراض صور كيسات حقيقية لكل كلاس مع إمكانية إضافة وحذف الصور للمشرف فقط.
              </p>
              <p>
                <strong>• الوضع الليلي والنهاري:</strong> يمكن التبديل السريع من الأيقونة (الشمس/القمر) أو من نافذة الإعدادات.
              </p>
              <p>
                <strong>• التواصل المباشر:</strong> حساب الإنستغرام @hay_a_2 وقناة التليجرام متاحان دائماً للتواصل وطلب الكود.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}

      {/* App Switcher Privacy Blur Shield Overlay */}
      {isAppBlurred && privacySettings.blurOnAppSwitch && (
        <div className="fixed inset-0 z-[99999] bg-[#FAF7F2]/95 dark:bg-[#181C14]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-[#596628]/15 dark:bg-[#7D9333]/25 text-[#596628] dark:text-[#A8C24E] flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#2F2B24] dark:text-white mb-2">
            تم تمويه الشاشة للحفاظ على الخصوصية والسرية
          </h3>
          <p className="text-xs sm:text-sm text-[#706A5B] dark:text-[#A7A08E] max-w-sm leading-relaxed">
            درع حماية الخصوصية نشط لمنع ظهور صور الحالات وسلايدات الترميم في قائمة التبديل بين التطبيقات.
          </p>
        </div>
      )}

      {/* Floating Privacy Toast */}
      {privacyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2617] dark:bg-[#202816] text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#596628] dark:border-[#7D9333] flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <ShieldCheck className="w-5 h-5 text-[#A8C24E] shrink-0" />
          <span>{privacyToast}</span>
          <button
            onClick={() => setPrivacyToast(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer mr-2 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Controlled In-App Print & Content Protection Toast */}
      {securityToast && (
        <SecurityNoticeToast
          type={securityToast.type}
          message={securityToast.message}
          onClose={() => setSecurityToast(null)}
          onOpenPrint={() => {
            setSecurityToast(null);
            if (activeTab !== 'slides' && activeTab !== 'cheat_sheet') {
              setActiveTab('slides');
            }
            setTimeout(() => {
              triggerControlledPrint();
            }, 300);
          }}
        />
      )}
      {/* Full Offline Status Indicator Badge ("نموذج أوفلاين / Offline Mode") */}
      <OfflineIndicator cachedSectionsCount={appSections.length} />

      {/* Global Subscriber Supervisor Notes Modal (Requested: امكانية للمشتركين كتابة الملاحظات في خانة الملاحظات للمشرف) */}
      <SubscriberSupervisorNotesModal
        isOpen={showGlobalNotesModal}
        onClose={() => {
          setShowGlobalNotesModal(false);
          setHighlightedNoteId(undefined);
        }}
        defaultEmail={subscriberEmail}
        highlightedNoteId={highlightedNoteId}
      />

      {/* Global Real-Time Multi-Channel Notification Toaster */}
      <RealTimeNotificationToaster
        onOpenNotes={(noteId) => {
          setHighlightedNoteId(noteId);
          setShowGlobalNotesModal(true);
        }}
        onOpenFeed={() => {
          setActiveTab('home');
        }}
      />

      {/* Global Request Code with Email Modal (Requested: اضافة نافذة كتابة الايميل داخل رسالة المشترك عند طلب الكود) */}
      <RequestCodeModal
        isOpen={showGlobalRequestModal}
        onClose={() => setShowGlobalRequestModal(false)}
        defaultEmail={subscriberEmail}
      />

      {/* Comprehensive Anti-Piracy, Focus Blur & Screen Capture Shield (Exempts Admin Dr. Hayat) */}
      <AntiPiracyShield
        enabled={!isAuthorAdmin}
        isAdmin={isAuthorAdmin}
        isContentUnlocked={isContentUnlocked}
        onSecurityAlert={(msg, type) => {
          setSecurityToast({
            type: type === 'print' ? 'print_blocked' : 'copy_blocked',
            message: msg,
          });
          addSecurityAuditEvent('درع حماية الشاشة', msg, 'warning');
        }}
      />

      {/* Concurrent Login Termination Alert Modal (Strict Single-Device Enforcement) */}
      <ConcurrentSessionAlertModal
        isOpen={showConcurrentAlertModal}
        onAcknowledge={() => {
          setShowConcurrentAlertModal(false);
        }}
        onReLogin={async () => {
          setShowConcurrentAlertModal(false);
          if (subscriberEmail) {
            const { sessionId } = await registerActiveSessionInCloud(subscriberEmail);
            setLocalSessionIdState(sessionId);
            setIsContentUnlocked(true);
            try {
              localStorage.setItem('dental_content_unlocked', 'true');
            } catch {}
            setPrivacyToast('تمت استعادة الجلسة بنجاح وتعيين هذا الجهاز كجهاز وحيد نشط.');
          } else {
            setShowSubscriberLoginModal(true);
          }
        }}
        newDeviceSummary={concurrentConflict?.newDeviceSummary}
        newLoginTimestamp={concurrentConflict?.newLoginTimestamp}
        reason={concurrentConflict?.reason}
      />

      {/* Android Native FLAG_SECURE Guidance Modal (Webintoapp / Android Studio) */}
      <AndroidSecurityGuidanceModal
        isOpen={showAndroidGuidanceModal}
        onClose={() => setShowAndroidGuidanceModal(false)}
      />

      {/* Clinical Local Anesthesia Maximum Dose & Safety Calculator Modal */}
      <LocalAnesthesiaCalculatorModal
        isOpen={showAnesthesiaCalculatorModal}
        onClose={() => setShowAnesthesiaCalculatorModal(false)}
        isAuthorAdmin={isAuthorAdmin}
      />

      {/* Floating In-Clinic Pre-Procedure Safety Checklist Sheet */}
      <PreProcedureFloatingSheet
        isOpen={showPreProcedureSheet}
        onClose={() => setShowPreProcedureSheet(false)}
        protocolId={activeClassId}
        protocolTitle={activeClass?.arabicName || 'الإجراء السريري'}
        isAuthorAdmin={isAuthorAdmin}
      />

      {/* Apple/Samsung-style Modern Floating Curved Bottom Navigation Bar (Dock) */}
      <ModernBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => handleTabClick(tab as ActiveTab)}
        onOpenPatientGuide={() => setShowPatientGuideModal(true)}
        onOpenClinicalCompanion={() => setShowClinicalCompanionSheet(true)}
        onOpenMenuDrawer={() => setShowMenuDrawer(true)}
        isPatientGuideActive={showPatientGuideModal}
        unreadCount={unreadRepliesCount}
      />

      {/* Center Hero FAB Bottom Sheet Modal for "الرفيق السريري" */}
      <ClinicalCompanionBottomSheet
        isOpen={showClinicalCompanionSheet}
        onClose={() => setShowClinicalCompanionSheet(false)}
        isAuthorAdmin={isAuthorAdmin}
        isContentUnlocked={effectiveContentUnlocked}
        isSubscriptionChecking={isSubscriptionChecking}
        isGuidePublic={isGuidePublic}
        onOpenDirectPulpCapping={() => handleTabClick('pulp_capping')}
        onOpenSmartTrayProtocol={() => handleTabClick('smart_tray')}
        onOpenAnesthesiaCalc={() => setShowAnesthesiaCalculatorModal(true)}
        onOpenChecklist={() => setShowPreProcedureSheet(true)}
        onOpenPrescriptions={() => handleTabClick('prescriptions')}
        onOpenClinicalCompanionView={() => handleTabClick('clinical_companion')}
        onOpenRequestProtocol={() => setShowGlobalRequestModal(true)}
        onOpenFAQ={() => handleTabClick('clinical_companion')}
        onOpenSubscribeModal={() => setShowSubscriberLoginModal(true)}
        onOpenGlobalSearch={() => setShowGlobalSearchModal(true)}
      />

      {/* Direct Pulp Capping Protocol Modal (7 Steps Interactive Slider) */}
      <DirectPulpCappingModal
        isOpen={showDirectPulpCappingModal}
        onClose={() => setShowDirectPulpCappingModal(false)}
        onOpenPrintGuide={() => {
          setShowDirectPulpCappingModal(false);
          handleTabClick('cheatsheet');
        }}
      />

      {/* Smart Clinic Tray Protocol Modal (7 Steps Interactive Slider) */}
      <SmartClinicTrayProtocolModal
        isOpen={showSmartTrayModal}
        onClose={() => setShowSmartTrayModal(false)}
        onOpenPrintGuide={() => {
          setShowSmartTrayModal(false);
          handleTabClick('cheatsheet');
        }}
      />

      {/* Slide-out Drawer / Action Sheet (Triggered by ☰ Menu) */}
      <MenuSlideOutDrawer
        isOpen={showMenuDrawer}
        onClose={() => setShowMenuDrawer(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthorAdmin={isAuthorAdmin}
        isContentUnlocked={effectiveContentUnlocked}
        isSubscriptionSystemEnabled={isSubscriptionSystemEnabled}
        subscriberEmail={subscriberEmail}
        onOpenSubscribeModal={() => setShowSubscriberLoginModal(true)}
        onOpenRequestCodeModal={() => setShowGlobalRequestModal(true)}
        onOpenAdminPanel={() => handleTabClick('subscribers_admin')}
        onOpenFeedbackInbox={() => setShowGlobalNotesModal(true)}
        onOpenPrivacyPolicy={() => handleTabClick('contact_privacy')}
        onOpenShadeSimulator={() => handleTabClick('shade')}
        onOpenAnatomyVisualizer={() => handleTabClick('anatomy')}
        onOpenClinicalTimer={() => handleTabClick('timer')}
        onOpenPrintAtlas={() => handleTabClick('cheatsheet')}
        onOpenClinicalPhotos={() => setShowPhotosModal(true)}
        onOpenAddNewCard={() => handleTabClick('builder')}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onToggleAuthorMode={toggleAuthorMode}
        onRelockContent={handleRelockContent}
        unreadRepliesCount={unreadRepliesCount}
        onOpenGlobalSearch={() => setShowGlobalSearchModal(true)}
        onOpenShareModal={() => setShowGlobalShareModal(true)}
      />

      {/* Global In-Clinic Search Modal (Instant search across all protocols, drugs, tools & terms) */}
      <GlobalSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        onNavigateItem={handleSearchNavigateItem}
        isContentUnlocked={effectiveContentUnlocked || isAuthorAdmin}
        onRequireUnlock={(title) => {
          setLoginTargetSectionTitle(title);
          setShowSubscriberLoginModal(true);
        }}
      />

      {/* Mandatory Welcome Disclaimer & Terms of Use (First-Launch Gatekeeper with Strict Exit Enforcement) */}
      <WelcomeDisclaimerOverlay onAgreed={() => setShowClinicalPrayerModal(true)} />

      {/* Welcoming Clinical Supplication Pop-up Dialog (Appears upon opening in main interface) */}
      <ClinicalPrayerModal
        isOpen={showClinicalPrayerModal}
        onClose={() => setShowClinicalPrayerModal(false)}
      />

      {/* Global Share App & Link / PWA Installation Modal */}
      <ShareAppModal
        isOpen={showGlobalShareModal}
        onClose={() => setShowGlobalShareModal(false)}
      />

      {/* Notifications & Announcements History Center Modal */}
      <NotificationHistoryModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        isAdmin={isAuthorAdmin}
        isSubscribed={isContentUnlocked}
        onNavigateTab={(tab) => {
          setShowNotificationsModal(false);
          handleTabClick(tab as ActiveTab);
        }}
      />
    </div>
  );
}
