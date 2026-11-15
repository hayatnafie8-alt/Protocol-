import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (key: string, defaultAr?: string, defaultEn?: string) => string;
}

const STORAGE_KEY = 'protocol_app_language';
const EVENT_NAME = 'protocol_language_changed';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ar: {
    // Brand & Header
    'brand.protocol': 'PROTOCOL',
    'brand.authorPrefix': 'إعداد وتصميم:',
    'brand.authorName': 'د. حياه نافع فجر',
    'brand.university': 'جامعة المعارف • كلية طب الأسنان',
    'header.searchPill': 'بحث سريري...',
    'header.searchShortcut': 'Ctrl+K',
    'header.searchTitle': 'البحث السريري الشامل (Ctrl+K)',
    'header.settingsTitle': 'إعدادات المنظومة والخصوصية',
    'header.supervisorMenuTitle': 'قائمة المشرف الأكاديمي والخيارات السريعة',
    'header.supervisorBadge': 'المشرف',
    'header.studentBadge': 'طالب مشترك',
    'header.guestBadge': 'زائر',

    // Supervisor Dropdown Menu
    'menu.languageTitle': 'لغة التطبيق',
    'menu.languageSubtitle': 'التبديل الفوري بين العربية والإنجليزية',
    'menu.langAr': 'العربية',
    'menu.langEn': 'English',
    'menu.searchTitle': 'البحث السريري الشامل',
    'menu.searchDesc': 'الحالات، الأدوية، الأدوات والبروتوكولات',
    'menu.shareTitle': 'مشاركة التطبيق والرابط',
    'menu.shareDesc': 'نسخ الرابط، تثبيت PWA والمزامنة السحابية',
    'menu.notificationsTitle': 'مركز التنبيهات والإعلانات',
    'menu.notificationsDesc': 'التعاميم الأكاديمية والرسائل الإدارية',
    'menu.themeTitle': 'الوضع الليلي والنهاري',
    'menu.themeDark': 'مفعل الآن: الوضع الليلي',
    'menu.themeLight': 'مفعل الآن: الوضع النهاري',
    'menu.openFullMenu': 'فتح القائمة الشاملة والإعدادات',

    // Bottom Navigation
    'nav.home': 'الرئيسية',
    'nav.patients': 'المراجعين',
    'nav.companion': 'الرفيق السريري',
    'nav.skills': 'المهارات',
    'nav.more': 'المزيد',

    // Appointments & Archive Section
    'appts.title': 'مواعيدي وجدول العيادات السريرية',
    'appts.cloudSynced': 'سحابي متزامن ⚡',
    'appts.syncing': 'جاري المزامنة...',
    'appts.shareLink': 'مشاركة الرابط 🔗',
    'appts.pdfReport': 'تقرير (PDF) 📄',
    'appts.totalCases': 'الحالات:',
    'appts.statTotal': 'إجمالي المواعيد',
    'appts.statPending': 'المواعيد القادمة النشطة',
    'appts.statArchived': 'الحالات المكتملة والأرشيف',
    'appts.lockScreenAlerts': 'التنبيهات الذكية لشاشة القفل (Lock Screen)',
    'appts.testAlert': 'تجربة إشعار حقيقي للشاشة 🔔',
    'appts.tabAppointments': 'مواعيدي والحالات السريرية',
    'appts.tabCollegeSchedule': 'جدول عيادات الكلية ومتطلبات الأقسام',
    'appts.searchPlaceholder': 'بحث في المواعيد والمراجعين والإجراءات...',
    'appts.addTitle': 'تسجيل موعد مراجع سريري جديد',
    'appts.patientName': 'اسم المراجع (البيشنت)...',
    'appts.date': 'تاريخ ووقت الموعد',
    'appts.procedure': 'الإجراء السريري والتشخيص',
    'appts.category': 'القسم السريري',
    'appts.notes': 'ملاحظات سريرية ورقم الهاتف',
    'appts.saveButton': 'حفظ الموعد وجدولة التنبيه ⏰',
    'appts.archiveButton': 'أرشفة الحالة كمنجزة ✅',
    'appts.unarchiveButton': 'إعادة إلى قيد الانتظار 🔄',
    'appts.editButton': 'تعديل',
    'appts.deleteButton': 'حذف',
    'appts.emptyUpcoming': 'لا توجد مواعيد نشطة حالياً.',
    'appts.emptyArchived': 'لا توجد حالات سريرية مؤرشفة بعد.',
    'appts.archiveHeader': 'الأرشيف السريري للحالات والصور:',
    'appts.upcomingHeader': '📋 المواعيد القادمة في العيادة',
    'appts.clearArchive': 'إفراغ الأرشيف',
    'appts.exportBackup': 'تصدير نسخة 📥',
    'appts.catAll': 'الكل',
    'appts.catExtraction': 'قلع وجراحة الفم',
    'appts.catFillings': 'حشوات وترميم',
    'appts.catDentures': 'صناعة وتعويضات',
    'appts.catCleaning': 'تنظيف ولثة',
    'appts.catEndo': 'علاج الجذور واللب',
    'appts.catOther': 'حالات واستشارات عامة',

    // Clinical Companion
    'companion.title': 'الرفيق السريري الشامل',
    'companion.subtitle': 'المرجع السريري الفوري والمعتمد في عيادات طب الأسنان',
    'companion.toolsHeader': 'خانات وأدوات الرفيق السريري الشامل',
    'companion.badgeLive': 'المنظومة السريرية',
    'companion.anesthesiaTitle': 'حاسبة البنج السريرية',
    'companion.anesthesiaDesc': 'حساب الجرعة القصوى الآمنة (MRD) وعدد الكاربولات بالمعايير العالمية',
    'companion.checklistTitle': 'قائمة الفحص السريري قبل البدء',
    'companion.checklistDesc': 'فحص العلامات الحيوية، موانع التخدير، التحسس والأشعة التشخيصية',
    'companion.drugsTitle': 'دليل الأدوية والوصفات الطبية',
    'companion.drugsDesc': 'المضادات الحيوية، المسكنات NSAIDs وجرعات الأطفال والبالغين المعتمدة',
    'companion.ianbTitle': 'بروتوكول تخدير العصب السنخي السفلي (IANB)',
    'companion.ianbDesc': 'المعالم التشريحية والخطوات السريرية لتفادي فشل التخدير',
    'companion.trayTitle': 'صينية وهندسة العيادة الذكية',
    'companion.trayDesc': 'تنظيم الأدوات، العزل بالرابر دام، ومنع التلوث التبادلي الميكروبي',
    'companion.pulpTitle': 'التغطية اللبية المباشرة (DPC)',
    'companion.pulpDesc': 'بروتوكول المعالجة اللبية الحيوية باستخدام MTA وساندوتش GIC',
    'companion.vivaTitle': 'بنك أسئلة المناقشة السريرية (Viva)',
    'companion.vivaDesc': 'أسئلة الدفاع السريري وامتحانات السينيور المعتمدة في المداواة',
    'companion.apptsCardTitle': '📅 خانة مواعيدي وجدول العيادات',
    'companion.apptsCardDesc': 'استقبال المراجعين • التوثيق الفوتوغرافي السريري • أرشيف الحالات الدائم',
    'companion.openFull': 'فتح شاشة الرفيق السريري الشاملة',
    'companion.backToHome': 'العودة للرئيسية',
    'companion.searchDrugsPlaceholder': 'ابحث عن اسم الدواء، المادة الفعالة، أو الاستطباب السريري...',
    'companion.statusLabel': '● الحالة:',
    'companion.expandBox': 'توسيع الخانة ⬇️',
    'companion.collapseBox': 'طي ⬆️',
    'companion.viewFieldsBelow': 'عرض الحقول أدناه ⬇️',
    'companion.headerSub': 'رفيق طبيب الأسنان السريري',

    // Search & Filter
    'search.title': 'البحث السريري الشامل',
    'search.placeholder': 'ابحث عن بروتوكول، دواء، أداة، أو مصطلح سريري...',
    'search.all': 'الكل',
    'search.protocols': 'البروتوكولات السريرية',
    'search.skills': 'المهارات العملية 4K',
    'search.surgical': 'الحالات الجراحية',
    'search.prescriptions': 'الأدوية والوصفات',
    'search.calculators': 'الحاسبات والأدوات',
    'search.guides': 'الأدلة السريرية',
    'search.noResults': 'لا توجد نتائج مطابقة لمصطلح البحث السريري.',
    'search.bookmarks': 'المفضلة السريرية المحفوظة',

    // Settings
    'settings.title': 'إعدادات المنظومة والخصوصية',
    'settings.supervisorSection': 'إعدادات المشرف الأكاديمي',
    'settings.offlineMode': 'التشغيل دون اتصال بالإنترنت (Offline Mode)',
    'settings.cloudSync': 'المزامنة السحابية الفورية للأرشيف والمواعيد',

    // Clinical Dashboard
    'dashboard.title': 'لوحة الإنجاز السريري ومتابعة الحالات',
    'dashboard.subtitle': 'تتبع الحالات الشهرية ونسب الإنجاز السريري للعام الدراسي',
    'dashboard.monthlyQuota': 'النصاب الشهري المطلوب',
    'dashboard.successRate': 'معدل النجاح السريري المعتمد',
    'dashboard.activeFollowup': 'المتابعة السريرية النشطة',

    // Common
    'common.close': 'إغلاق',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.back': 'رجوع',
    'common.print': 'طباعة',
    'common.export': 'تصدير',
    'common.copy': 'نسخ',
    'common.success': 'تم بنجاح',
    'common.restore': 'استعادة',
    'common.home': 'الرئيسية',
  },
  en: {
    // Brand & Header
    'brand.protocol': 'PROTOCOL',
    'brand.authorPrefix': 'Directed & Formulated by:',
    'brand.authorName': 'Dr. Hayat Nafee Fajer',
    'brand.university': 'Al-Maarif University • Faculty of Dentistry',
    'header.searchPill': 'Clinical Search...',
    'header.searchShortcut': 'Ctrl+K',
    'header.searchTitle': 'Global Dental & Clinical Search (Ctrl+K)',
    'header.settingsTitle': 'Clinical System Settings & Data Governance',
    'header.supervisorMenuTitle': 'Faculty Supervisor & Academic Governance Hub',
    'header.supervisorBadge': 'Faculty Supervisor',
    'header.studentBadge': 'Clinical Candidate',
    'header.guestBadge': 'Visiting Clinician',

    // Supervisor Dropdown Menu
    'menu.languageTitle': 'Interface & Clinical Localization',
    'menu.languageSubtitle': 'Toggle between Medical English and Classical Arabic',
    'menu.langAr': 'العربية',
    'menu.langEn': 'English (Clinical)',
    'menu.searchTitle': 'Comprehensive Clinical Search',
    'menu.searchDesc': 'Evidence-based protocols, pharmacotherapy & instrumentation',
    'menu.shareTitle': 'Share Clinical Portal',
    'menu.shareDesc': 'Encrypted portal link, offline PWA & cloud backup',
    'menu.notificationsTitle': 'Academic Circulars & Faculty Notices',
    'menu.notificationsDesc': 'Official departmental requirements & clinical mandates',
    'menu.themeTitle': 'Visual Display Mode',
    'menu.themeDark': 'Active: High-Contrast Dark Clinical Mode',
    'menu.themeLight': 'Active: High-Clarity Daylight Mode',
    'menu.openFullMenu': 'Full Faculty Settings & Controls',

    // Bottom Navigation
    'nav.home': 'Clinical Portal',
    'nav.patients': 'Logbook & Intake',
    'nav.companion': 'Chairside Companion',
    'nav.skills': 'Procedural Skills',
    'nav.more': 'Academic Hub',

    // Appointments & Archive Section
    'appts.title': 'Chairside Logbook & Patient Scheduling',
    'appts.cloudSynced': 'Cloud Encrypted & Synced ⚡',
    'appts.syncing': 'Synchronizing Clinical Records...',
    'appts.shareLink': 'Share Schedule Link 🔗',
    'appts.pdfReport': 'Official Clinical Report (PDF) 📄',
    'appts.totalCases': 'Verified Cases:',
    'appts.statTotal': 'Cumulative Case Log',
    'appts.statPending': 'Scheduled Appointments',
    'appts.statArchived': 'Completed & Archived Cases',
    'appts.lockScreenAlerts': 'Lock Screen Emergency & Clinic Reminders',
    'appts.testAlert': 'Trigger Diagnostic System Notification 🔔',
    'appts.tabAppointments': 'Patient Intake & Operative Logbook',
    'appts.tabCollegeSchedule': 'Faculty Clinic Rotations & Quota Requirements',
    'appts.searchPlaceholder': 'Search by patient name, tooth number, or diagnosis...',
    'appts.addTitle': 'Register New Patient Clinical Intake',
    'appts.patientName': 'Patient Name / Identification...',
    'appts.date': 'Appointment Date & Session Time',
    'appts.procedure': 'Operative Diagnosis & Intended Procedure',
    'appts.category': 'Clinical Specialty / Department',
    'appts.notes': 'Medical Alerts, Contact & Chairside Remarks',
    'appts.saveButton': 'Confirm Intake & Schedule Session Alert ⏰',
    'appts.archiveButton': 'Verify Completion & Archive Case ✅',
    'appts.unarchiveButton': 'Reopen Case to Active Clinic Log 🔄',
    'appts.editButton': 'Edit Entry',
    'appts.deleteButton': 'Discard Record',
    'appts.emptyUpcoming': 'No pending clinical appointments currently scheduled.',
    'appts.emptyArchived': 'No completed clinical cases archived yet in this category.',
    'appts.archiveHeader': 'Clinical Archive & Multi-Angle Photographic Documentation:',
    'appts.upcomingHeader': '📋 Scheduled Operative Dental Sessions',
    'appts.clearArchive': 'Purge Archive Cache',
    'appts.exportBackup': 'Export Encrypted Backup 📥',
    'appts.catAll': 'All Specialties',
    'appts.catExtraction': 'Oral & Maxillofacial Surgery',
    'appts.catFillings': 'Operative & Restorative Dentistry',
    'appts.catDentures': 'Prosthodontics (Fixed & Removable)',
    'appts.catCleaning': 'Periodontics & Ultrasonic Scaling',
    'appts.catEndo': 'Endodontics & Pulp Therapy',
    'appts.catOther': 'Comprehensive Diagnostics & Consultation',

    // Clinical Companion
    'companion.title': 'Comprehensive Chairside Clinical Companion',
    'companion.subtitle': 'Instant, evidence-based reference engineered for chairside precision',
    'companion.toolsHeader': 'Chairside Protocols & Diagnostic Calculators',
    'companion.badgeLive': 'Evidence-Based Suite',
    'companion.anesthesiaTitle': 'Local Anesthesia Dose Metric',
    'companion.anesthesiaDesc': 'Weight-adjusted Maximum Safe Dose (MRD) & cartridge metrics (Malamed standards)',
    'companion.checklistTitle': 'Pre-Procedural Safety Checklist',
    'companion.checklistDesc': 'Vital signs screening, systemic contraindications, allergy verification & radiographs',
    'companion.drugsTitle': 'Dental Pharmacotherapy & Prescription Formulary',
    'companion.drugsDesc': 'Evidence-based antimicrobials, analgesics, pediatric weight-based & adult regimens',
    'companion.ianbTitle': 'Inferior Alveolar Nerve Block (IANB) Precision Protocol',
    'companion.ianbDesc': 'Anatomical landmarks, aspiration safety, and overcoming accessory innervation failures',
    'companion.trayTitle': 'Four-Handed Chairside Tray Architecture',
    'companion.trayDesc': 'Sequential instrument layout, rubber dam isolation armamentarium & bio-barrier protocol',
    'companion.pulpTitle': 'Direct Pulp Capping (Vital Pulp Therapy)',
    'companion.pulpDesc': 'Complete VPT protocol: NaOCl hemostasis diagnostic, bioceramic / MTA barrier & GIC sandwich',
    'companion.vivaTitle': 'Viva Voce & Senior Defense Examination Bank',
    'companion.vivaDesc': 'Authoritative faculty defense questions, clinical rationales & operative viva exam prep',
    'companion.apptsCardTitle': '📅 Chairside Logbook & Rotation Schedule',
    'companion.apptsCardDesc': 'Clinical candidate intake • Departmental quota management • Photo archives',
    'companion.openFull': 'Launch Fullscreen Clinical Companion Suite',
    'companion.backToHome': 'Return to Portal Home',
    'companion.searchDrugsPlaceholder': 'Search generic formulation, brand name, or therapeutic indication...',
    'companion.statusLabel': '● Clinical Status:',
    'companion.expandBox': 'Expand Module ⬇️',
    'companion.collapseBox': 'Collapse ⬆️',
    'companion.viewFieldsBelow': 'Review Operative Fields Below ⬇️',
    'companion.headerSub': 'Evidence-Based Dental Clinical Companion',

    // Search & Filter
    'search.title': 'Universal Dental & Clinical Search',
    'search.placeholder': 'Search clinical protocols, pharmacotherapy, instruments, or terminology...',
    'search.all': 'All Records',
    'search.protocols': 'Clinical Protocols',
    'search.skills': 'Procedural Skills (4K)',
    'search.surgical': 'Surgical Case Studies',
    'search.prescriptions': 'Prescription Formulary',
    'search.calculators': 'Diagnostic Calculators',
    'search.guides': 'Clinical Handbooks',
    'search.noResults': 'No matching clinical records found for the queried term.',
    'search.bookmarks': 'Saved Clinical Favorites',

    // Settings
    'settings.title': 'System Preferences & Clinical Governance',
    'settings.supervisorSection': 'Faculty Supervisor & Editorial Controls',
    'settings.offlineMode': 'Offline Standalone Operative Mode',
    'settings.cloudSync': 'Real-Time Encrypted Cloud Synchronization',

    // Clinical Dashboard
    'dashboard.title': 'Clinical Competency & Achievement Dashboard',
    'dashboard.subtitle': 'Academic rotation quota progression, case metrics & clinical success tracking',
    'dashboard.monthlyQuota': 'Target Monthly Clinical Quota',
    'dashboard.successRate': 'Verified Clinical Success Rate',
    'dashboard.activeFollowup': 'Active Post-Operative Follow-up',

    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save Changes',
    'common.back': 'Back',
    'common.print': 'Print Document',
    'common.export': 'Export Data',
    'common.copy': 'Copy to Clipboard',
    'common.success': 'Operation Completed Successfully',
    'common.restore': 'Restore Record',
    'common.home': 'Portal Home',
  },
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRTL: true,
  t: (key: string, defaultAr?: string) => defaultAr || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {}
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { language: lang } }));
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'ar' || e.newValue === 'en')) {
        setLanguageState(e.newValue);
        document.documentElement.lang = e.newValue;
        document.documentElement.dir = e.newValue === 'ar' ? 'rtl' : 'ltr';
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [language]);

  const t = (key: string, defaultAr?: string, defaultEn?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    if (language === 'en') {
      return defaultEn || defaultAr || key;
    }
    return defaultAr || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    isRTL: language === 'ar',
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
