import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  Info,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Stethoscope,
  Heart,
  Droplets,
  Zap,
  Activity,
  Baby,
  Star,
  Check,
  X,
  Share2,
  Bookmark,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PrescriptionDrug,
  DrugCategoryItem,
  PrescriptionGuideConfig,
  DEFAULT_PRESCRIPTION_CATEGORIES,
} from '../data/prescriptionGuideData';
import {
  subscribeToPrescriptionDrugsCloud,
  subscribeToPrescriptionGuideConfigCloud,
  setPrescriptionGuideGlobalVisibilityInCloud,
} from '../services/prescriptionGuideService';
import {
  PharmacistBioConfig,
  DEFAULT_PHARMACIST_BIO,
  subscribeToPharmacistBioCloud,
} from '../services/pharmacistBioService';
import { useAppText, getAppText } from '../services/appTextManager';
import {
  toggleBookmarkItem,
  isItemBookmarked,
  getStoredBookmarks,
  BookmarkItem,
} from '../data/bookmarksManager';
import { OfficialToothSvg } from './ToothFavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';

interface PrescriptionGuideSubscriberViewProps {
  isAuthorAdmin: boolean;
  isContentUnlocked?: boolean;
  onRequireUnlock?: (title?: string) => void;
  onBackToHome?: () => void;
  onOpenAdminManage?: () => void;
}

export const PrescriptionGuideSubscriberView: React.FC<PrescriptionGuideSubscriberViewProps> = ({
  isAuthorAdmin,
  isContentUnlocked = false,
  onRequireUnlock,
  onBackToHome,
  onOpenAdminManage,
}) => {
  const { language, isRTL } = useLanguage();
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([]);
  const [guideConfig, setGuideConfig] = useState<PrescriptionGuideConfig>({
    isGuidePublic: false,
    isGuideHidden: false,
    categoriesConfig: {},
    customCategories: [],
  });

  // Dynamic Pharmacist Profile State (Admin controlled)
  const [pharmacistBio, setPharmacistBio] = useState<PharmacistBioConfig>(DEFAULT_PHARMACIST_BIO);

  // Dynamic App Texts
  const dynamicGuideTitle = useAppText('drug_guide_main_title', 'دليل وصف الأدوية السريري لطب الأسنان');
  const dynamicGuideSubtitle = useAppText(
    'drug_guide_subtitle',
    'مرجع الجرعات السريرية المعتمدة، التداخلات مع المخدر الموضعي، ومحاذير الحالات المرضية الخاصة'
  );
  const dynamicDisclaimer = useAppText(
    'drug_guide_disclaimer',
    'هذا الدليل مخصص للأغراض التعليمية والاسترشادية السريرية لطلاب وأطباء الأسنان، ولا يعتبر بديلاً عن التشخيص الطبي السريري الشامل أو استشارة الطبيب البشري المختص.'
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWarningLevel, setFilterWarningLevel] = useState<string>('all');
  const [filterAccessType, setFilterAccessType] = useState<'all' | 'free' | 'subscribed'>('all');

  // Modal / Drawer state for detailed drug view
  const [activeDrugModal, setActiveDrugModal] = useState<PrescriptionDrug | null>(null);

  // Pharmacist review popup
  const [viewingPharmacistDrug, setViewingPharmacistDrug] = useState<PrescriptionDrug | null>(null);

  // Toast notification
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Bookmarks local state cache for instant reactivity
  const [localBookmarks, setLocalBookmarks] = useState<BookmarkItem[]>(() => getStoredBookmarks());

  useEffect(() => {
    const handleBookmarksUpdate = (e: Event) => {
      const custom = e as CustomEvent<BookmarkItem[]>;
      if (custom.detail) {
        setLocalBookmarks(custom.detail);
      } else {
        setLocalBookmarks(getStoredBookmarks());
      }
    };
    window.addEventListener('app-bookmarks-updated', handleBookmarksUpdate);
    return () => window.removeEventListener('app-bookmarks-updated', handleBookmarksUpdate);
  }, []);

  // Subscribe to Cloud Data, Global Config & Pharmacist Profile
  useEffect(() => {
    const unsubDrugs = subscribeToPrescriptionDrugsCloud((cloudDrugs) => {
      setDrugs(cloudDrugs);
    });

    const unsubConfig = subscribeToPrescriptionGuideConfigCloud((config) => {
      setGuideConfig(config);
    });

    const unsubBio = subscribeToPharmacistBioCloud((bio) => {
      setPharmacistBio(bio);
    });

    return () => {
      unsubDrugs();
      unsubConfig();
      unsubBio();
    };
  }, []);

  // Merge default categories with custom categories & config overrides
  const allCategories: DrugCategoryItem[] = useMemo(() => {
    const combined = [...DEFAULT_PRESCRIPTION_CATEGORIES];
    if (guideConfig.customCategories && guideConfig.customCategories.length > 0) {
      guideConfig.customCategories.forEach((c) => {
        if (!combined.some((ex) => ex.id === c.id)) {
          combined.push(c);
        }
      });
    }

    return combined.map((cat) => {
      const override = guideConfig.categoriesConfig?.[cat.id];
      return {
        ...cat,
        isHidden: override?.isHidden ?? cat.isHidden ?? false,
        isFree: override?.isFree ?? cat.isFree ?? false,
      };
    });
  }, [guideConfig]);

  // Visible categories for subscriber (Admins see all)
  const visibleCategories = useMemo(() => {
    if (isAuthorAdmin) return allCategories;
    return allCategories.filter((c) => !c.isHidden);
  }, [allCategories, isAuthorAdmin]);

  // Current active category object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    return allCategories.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, allCategories]);

  // Helper: check if a specific drug is accessible by user
  const canAccessDrug = (drug: PrescriptionDrug): boolean => {
    if (isAuthorAdmin) return true;
    if (guideConfig.isGuidePublic) return true;
    if (drug.isFree) return true;
    const cat = allCategories.find((c) => c.id === drug.category);
    if (cat?.isFree) return true;
    return isContentUnlocked;
  };

  // Helper: check if entire category is accessible
  const canAccessCategory = (catId: string): boolean => {
    if (isAuthorAdmin) return true;
    if (guideConfig.isGuidePublic) return true;
    const cat = allCategories.find((c) => c.id === catId);
    if (cat?.isFree) return true;
    return isContentUnlocked;
  };

  // Filtered Drugs
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      // 1. Visibility check (drafts or hidden items only visible to admin)
      if (!isAuthorAdmin) {
        if (drug.isHidden) return false;
        if (drug.status === 'draft') return false;
        // Check if category itself is hidden
        const cat = allCategories.find((c) => c.id === drug.category);
        if (cat?.isHidden) return false;
      }

      // 2. Category filter
      if (selectedCategoryId !== 'all' && drug.category !== selectedCategoryId) {
        return false;
      }

      // 3. Warning level filter
      if (filterWarningLevel !== 'all' && drug.warningLevel !== filterWarningLevel) {
        return false;
      }

      // 4. Access filter
      if (filterAccessType === 'free' && !drug.isFree) return false;
      if (filterAccessType === 'subscribed' && drug.isFree) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName =
          (drug.nameEn || '').toLowerCase().includes(q) ||
          (drug.nameAr || '').toLowerCase().includes(q) ||
          (drug.scientificName && drug.scientificName.toLowerCase().includes(q)) ||
          (drug.brandNames && drug.brandNames.toLowerCase().includes(q)) ||
          (drug.activeIngredient && drug.activeIngredient.toLowerCase().includes(q));
        const matchesIndication =
          (drug.indication || '').toLowerCase().includes(q) ||
          (drug.indicationEn && drug.indicationEn.toLowerCase().includes(q));
        const matchesClinical =
          (drug.clinicalConsiderations && drug.clinicalConsiderations.toLowerCase().includes(q)) ||
          (drug.clinicalConsiderationsEn && drug.clinicalConsiderationsEn.toLowerCase().includes(q)) ||
          (drug.drugInteractions && drug.drugInteractions.toLowerCase().includes(q)) ||
          (drug.drugInteractionsEn && drug.drugInteractionsEn.toLowerCase().includes(q));

        if (!matchesName && !matchesIndication && !matchesClinical) {
          return false;
        }
      }

      return true;
    });
  }, [drugs, isAuthorAdmin, selectedCategoryId, filterWarningLevel, filterAccessType, searchQuery, allCategories]);

  // Favorites Handlers
  const handleToggleFavoriteGuide = () => {
    const isSaved = toggleBookmarkItem({
      id: 'prescription_guide_full',
      title: 'دليل وصف الأدوية السريري الشامل',
      subtitle: 'المرجع الدوائي الكامل لطب الأسنان (الجرعات والتداخلات)',
      category: 'prescription',
      categoryLabel: 'دليل الأدوية كامل',
      specialty: 'Pharmacology',
      tags: ['أدوية', 'روشتات', 'سكري', 'ضغط', 'حمل', 'مسكنات', 'تداخلات'],
      targetTab: 'prescriptions',
      clinicalKeyPoint: 'مرجع كامل للجرعات السريرية وموانع الاستعمال والتداخلات الدوائية لكرسي الأسنان.',
    });

    setLocalBookmarks(getStoredBookmarks());
    showToast(isSaved ? 'تمت إضافة دليل الأدوية بالكامل إلى المفضلة 🦷⭐' : 'تمت إزالة دليل الأدوية من المفضلة');
  };

  const handleToggleFavoriteCategory = (cat: DrugCategoryItem) => {
    const isSaved = toggleBookmarkItem({
      id: `prescription_cat_${cat.id}`,
      title: cat.titleAr,
      subtitle: cat.descriptionAr,
      category: 'prescription',
      categoryLabel: cat.titleAr,
      specialty: 'Pharmacology',
      tags: [cat.titleAr, cat.titleEn, 'دليل الأدوية'],
      targetTab: 'prescriptions',
      targetParam: cat.id,
      clinicalKeyPoint: cat.descriptionAr,
    });

    setLocalBookmarks(getStoredBookmarks());
    showToast(isSaved ? `تم حفظ قسم "${cat.titleAr}" في المفضلة 🦷` : `تمت إزالة "${cat.titleAr}" من المفضلة`);
  };

  const handleToggleFavoriteDrug = (drug: PrescriptionDrug) => {
    const isSaved = toggleBookmarkItem({
      id: `prescription_drug_${drug.id}`,
      title: `${drug.nameEn} (${drug.nameAr})`,
      subtitle: drug.indication,
      category: 'prescription',
      categoryLabel: 'دواء سريري',
      specialty: 'Pharmacology',
      tags: [drug.nameEn, drug.nameAr, drug.scientificName || '', drug.category],
      targetTab: 'prescriptions',
      targetParam: drug.category,
      clinicalKeyPoint: `الجرعة: ${drug.standardDosage} | تنبيه: ${drug.allergyAlerts}`,
    });

    setLocalBookmarks(getStoredBookmarks());
    showToast(isSaved ? `تم حفظ "${drug.nameEn}" في المفضلة 🦷` : `تمت إزالة "${drug.nameEn}" من المفضلة`);
  };

  // Copy Drug Prescription text
  const handleCopyDrugRx = (drug: PrescriptionDrug) => {
    const ind = drug.indication || '';
    const dos = drug.standardDosage || '';
    const cons = drug.clinicalConsiderations || (drug as any).adminNotes || 'مراعاة التاريخ المرضي والجرعات السريرية.';
    const inter = drug.drugInteractions || 'التحقق من التداخلات مع المخدر الموضعي والمسكنات.';
    const alg = drug.allergyAlerts || 'لا توجد موانع خاصة.';
    const prg = drug.pregnancySafety || 'استشارة الطبيب المختص.';

    const text = `📋 بروتوكول الوصفة السريرية: ${drug.nameEn} (${drug.nameAr})
🔬 الاسم العلمي / التجاري: ${drug.scientificName || drug.activeIngredient || drug.nameEn} ${drug.brandNames ? `[${drug.brandNames}]` : ''}
📌 دواعي الاستعمال: ${ind}
⚖️ الجرعة القياسية المعتمدة: ${dos}
${drug.pediatricDosage ? `👶 جرعة الأطفال: ${drug.pediatricDosage}\n` : ''}🦷 اعتبارات طب الأسنان: ${cons}
⚠️ التداخلات الدوائية: ${inter}
🚫 تنبيهات الحساسية وموانع الاستعمال: ${alg}
🤰 سلامة الحمل والرضاعة: ${prg}
🩺 المراجعة الصيدلانية: ${drug.clinicalReview?.status === 'verified' ? `معتمد من ${drug.clinicalReview.pharmacistName || 'صيدلاني إكلينيكي'}` : 'قيد المراجعة'}
⚖️ تنبيه: هذا المرجع تعليمي واسترشادي سريري لطبيب الأسنان.`;

    try {
      navigator.clipboard.writeText(text);
      showToast(`تم نسخ الوصفة السريرية لدواء "${drug.nameEn}" بنجاح! 📋`);
    } catch {}
  };

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3500);
  };

  // Category Icon Resolver
  const renderCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Activity':
        return <Activity className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Baby':
        return <Baby className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'AlertTriangle':
        return <AlertTriangle className={className} />;
      case 'Pill':
        return <Pill className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'AlertOctagon':
        return <AlertOctagon className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      default:
        return <Pill className={className} />;
    }
  };

  // Warning Level Badge Resolver
  const getWarningLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500 animate-ping',
          label: 'تنبيه سريري حرج ⚠️',
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'حذر ومحاذير خاصة ⚡',
        };
      case 'safe':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'آمن وموصى به أولاً ✅',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500',
          label: 'إرشادات دوائية ℹ️',
        };
    }
  };

  const isGuideBookmarked = isItemBookmarked('prescription_guide_full', localBookmarks);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner & Disclaimer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] dark:from-[#181D13] dark:via-[#1E2519] dark:to-[#141810] border-2 border-[#59662C]/30 dark:border-[#59662C]/40 shadow-xl p-5 sm:p-7">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Title and Branding */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" />
                <span>دليل وصف الأدوية السريري • Dental Pharmacotherapy</span>
              </span>

              {guideConfig.isGuidePublic ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>متاح مجاناً لكافة المستخدمين</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>محتوى للمشتركين والعيادات</span>
                </span>
              )}

              {isAuthorAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                  صلاحيات المشرف نشطة 👑
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2F2B24] dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{dynamicGuideTitle}</span>
              <span className="text-[#59662C] dark:text-[#A4BF46]">💊</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#676153] dark:text-[#B5AFA2] max-w-2xl leading-relaxed">
              {dynamicGuideSubtitle}
            </p>
          </div>

          {/* Quick Actions (Tooth Favorite for Entire Guide + Admin Button) */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
            {/* Tooth Favorite Button for Entire Guide */}
            <button
              type="button"
              onClick={handleToggleFavoriteGuide}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border ${
                isGuideBookmarked
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                  : 'bg-white dark:bg-[#1E2417] text-[#59662C] dark:text-[#A4BF46] border-[#59662C]/30 hover:bg-[#FAF7F2]'
              }`}
              title="حفظ الدليل بالكامل في مفضلتي السريرية"
            >
              <OfficialToothSvg isBookmarked={isGuideBookmarked} className="w-4 h-4 shrink-0" />
              <span>{isGuideBookmarked ? 'محفوظ في المفضلة' : 'حفظ الدليل كاملاً 🦷'}</span>
            </button>

            {/* Admin Management Button (Admin Only) */}
            {isAuthorAdmin && onOpenAdminManage && (
              <button
                type="button"
                onClick={onOpenAdminManage}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#59662C] to-[#738439] hover:from-[#485320] hover:to-[#59662C] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>لوحة تحكم الأدوية ⚙️</span>
              </button>
            )}

            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="p-2.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                title="العودة للرئيسية"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Educational & Clinical Reference Notice (Mandatory Disclaimer) */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-400/40 dark:border-amber-600/40 text-[#4E3F1A] dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black block text-xs sm:text-sm text-amber-900 dark:text-amber-100 mb-0.5">
              ⚠️ تنبيه وإخلاء مسؤولية سريري وتعليمي:
            </span>
            <p>
              {dynamicDisclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم العلمي، التجاري، دواعي الاستعمال، أو التداخلات (مثال: Metformin, Warfarin, Amoxicillin)..."
              className="w-full pl-4 pr-10 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Warning Level Select */}
            <select
              value={filterWarningLevel}
              onChange={(e) => setFilterWarningLevel(e.target.value)}
              className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-[#2F2B24] dark:text-white"
            >
              <option value="all">كافة مستويات الحذر</option>
              <option value="high">تحذير حرج ⚠️</option>
              <option value="caution">حذر سريري ⚡</option>
              <option value="safe">آمن ومفضل ✅</option>
            </select>

            {/* Access Type Select */}
            <select
              value={filterAccessType}
              onChange={(e) => setFilterAccessType(e.target.value as any)}
              className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-[#2F2B24] dark:text-white"
            >
              <option value="all">كل الأدوية</option>
              <option value="free">متاح مجاناً 🆓</option>
              <option value="subscribed">يتطلب اشتراك 🔒</option>
            </select>
          </div>
        </div>

        {/* Counter Strip */}
        <div className="flex items-center justify-between text-xs text-[#7A7364] dark:text-[#A7A08E] pt-2 border-t border-gray-100 dark:border-gray-800">
          <span>
            يتم عرض <strong>{filteredDrugs.length}</strong> دواء وبروتوكول سريري
            {selectedCategoryId !== 'all' && currentCategory && (
              <span> في تصنيف <strong>"{currentCategory.titleAr}"</strong></span>
            )}
          </span>

          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className="text-[#59662C] dark:text-[#A4BF46] font-bold hover:underline cursor-pointer"
            >
              إلغاء تصفية الأقسام (عرض الكل)
            </button>
          )}
        </div>
      </div>

      {/* 4. Category Badges Horizontal Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#59662C]" />
            <span>الأقسام والتصنيفات العلمية للأدوية:</span>
          </span>
          <span className="text-[11px] text-gray-500">اختر تصنيفاً للتركيز على أدويته</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {/* 'All' button */}
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
              selectedCategoryId === 'all'
                ? 'bg-[#59662C] text-white border-[#59662C] shadow-md'
                : 'bg-white dark:bg-[#1E2417] text-[#2F2B24] dark:text-white border-[#E5DEC9] dark:border-[#384524] hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>كافة الأقسام</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {drugs.length}
            </span>
          </button>

          {/* Scientific Categories */}
          {visibleCategories.map((cat) => {
            const count = drugs.filter((d) => d.category === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            const isCategoryBookmarked = isItemBookmarked(`prescription_cat_${cat.id}`, localBookmarks);
            const isUnlocked = canAccessCategory(cat.id);

            return (
              <div
                key={cat.id}
                className={`flex items-center rounded-2xl border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#59662C] text-white border-[#59662C] shadow-md'
                    : 'bg-white dark:bg-[#1E2417] text-[#2F2B24] dark:text-white border-[#E5DEC9] dark:border-[#384524] hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="px-3.5 py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer"
                >
                  {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                  <span>{cat.titleAr}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>

                  {cat.isFree ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                      مجاني
                    </span>
                  ) : !isUnlocked ? (
                    <Lock className="w-3 h-3 text-amber-500" />
                  ) : null}
                </button>

                {/* Favorite Tooth for this category */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavoriteCategory(cat);
                  }}
                  className={`p-2 pl-3 cursor-pointer transition-transform hover:scale-110 ${
                    isSelected ? 'text-amber-200' : 'text-gray-400 hover:text-amber-600'
                  }`}
                  title={`حفظ تصنيف "${cat.titleAr}" في المفضلة`}
                >
                  <OfficialToothSvg isBookmarked={isCategoryBookmarked} className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Selected Category Info Card (if selected) */}
      {currentCategory && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#181D13] dark:to-[#1E2417] border-2 border-[#59662C]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center shrink-0">
              {renderCategoryIcon(currentCategory.iconName, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#2F2B24] dark:text-white">
                  {currentCategory.titleAr}
                </h3>
                <span className="text-xs text-[#7A7364] font-mono">({currentCategory.titleEn})</span>
              </div>
              <p className="text-xs text-[#6F6759] dark:text-[#C5BFB0] mt-0.5">
                {currentCategory.descriptionAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentCategory.isFree ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>قسم مجاني متاح</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-xs font-black border border-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>يتطلب اشتراكاً</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 6. Drug Cards Grid */}
      {filteredDrugs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1E2417] rounded-3xl border-2 border-dashed border-[#E5DEC9] dark:border-[#343E26] space-y-3">
          <Pill className="w-12 h-12 mx-auto text-[#59662C] opacity-50" />
          <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
            لا توجد أدوية مطابقة لمعايير البحث
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            جرب كتابة اسم الدواء العلمي أو التجاري باللغة العربية أو الإنجليزية أو إلغاء تصفية الأقسام.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
              setFilterWarningLevel('all');
              setFilterAccessType('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#59662C] text-white text-xs font-bold hover:bg-[#485320] cursor-pointer"
          >
            إعادة تعيين كافة الفلاتر 🔄
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrugs.map((drug) => {
            const isAccessible = canAccessDrug(drug);
            const isDrugBookmarked = isItemBookmarked(`prescription_drug_${drug.id}`, localBookmarks);
            const warnBadge = getWarningLevelBadge(drug.warningLevel);
            const isVerifiedByPharmacist = drug.clinicalReview?.status === 'verified';
            const cat = allCategories.find((c) => c.id === drug.category);

            return (
              <div
                key={drug.id}
                className={`rounded-3xl border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden text-right group ${
                  !isAccessible
                    ? 'bg-[#FAF7F2]/60 dark:bg-[#181D13]/60 border-amber-300/70 dark:border-amber-800/70'
                    : 'bg-white dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#384524] hover:border-[#59662C]'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  {/* Category Pill + Badges Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                      {cat ? renderCategoryIcon(cat.iconName, 'w-3 h-3') : <Pill className="w-3 h-3" />}
                      <span>{cat?.titleAr || drug.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Warning Level Badge */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border flex items-center gap-1 ${warnBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${warnBadge.dot}`} />
                        <span>{warnBadge.label}</span>
                      </span>

                      {/* Tooth Favorite Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFavoriteDrug(drug)}
                        className="p-1 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="حفظ هذا الدواء في المفضلة"
                      >
                        <OfficialToothSvg isBookmarked={isDrugBookmarked} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Drug Names */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors leading-snug">
                      {drug.nameEn}
                    </h3>
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {drug.nameAr}
                    </div>
                    {drug.scientificName && (
                      <div className="text-[11px] font-mono text-[#59662C] dark:text-[#A4BF46] truncate">
                        {drug.scientificName}
                      </div>
                    )}
                  </div>

                  {/* Clinical Pharmacist Verification Badge - strictly Admin controlled */}
                  {pharmacistBio.isEnabled && isVerifiedByPharmacist ? (
                    <button
                      type="button"
                      onClick={() => setViewingPharmacistDrug(drug)}
                      className="w-full p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-[11px] font-bold flex items-center justify-between gap-1.5 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{pharmacistBio.verificationBadgeText || 'معتمد ومراجع من صيدلاني إكلينيكي 🩺'}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-teal-600 shrink-0" />
                    </button>
                  ) : pharmacistBio.isEnabled && drug.status === 'under_clinical_review' ? (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>قيد التدقيق من الصيدلاني الإكلينيكي ⏳</span>
                    </div>
                  ) : null}

                  {/* Therapeutic Indication Snippet */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                      📌 دواعي الاستعمال السريرية:
                    </span>
                    <p className="text-xs text-[#524C3F] dark:text-[#C5BFB0] leading-relaxed line-clamp-2">
                      {drug.indication}
                    </p>
                  </div>

                  {/* Standard Dosage Snippet */}
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-black text-[#59662C] dark:text-[#A4BF46] block">
                      ⚖️ الجرعة القياسية المعتمدة:
                    </span>
                    <p className="text-xs font-bold text-[#2F2B24] dark:text-white leading-relaxed">
                      {drug.standardDosage}
                    </p>
                  </div>

                  {/* Dental Considerations Snippet */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-[#4A3B18] dark:text-amber-200 leading-relaxed">
                    <strong>🦷 تنبيه العيادة:</strong> {(drug.clinicalConsiderations || (drug as any).adminNotes || drug.indication || '').split('\n')[0]}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-gray-50/70 dark:bg-[#151910]/70 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  {/* Copy Prescription Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyDrugRx(drug)}
                    className="p-2 rounded-xl bg-white dark:bg-[#1E2417] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#59662C] hover:border-[#59662C] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                    title="نسخ الوصفة السريرية"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">نسخ الروشتة</span>
                  </button>

                  {/* View Details / Unlock Button */}
                  {isAccessible ? (
                    <button
                      type="button"
                      onClick={() => setActiveDrugModal(drug)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <span>التفاصيل السريرية الكاملة</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequireUnlock) {
                          onRequireUnlock(`دواء: ${drug.nameEn}`);
                        } else {
                          showToast('هذا الدواء يتطلب تفعيل الاشتراك للوصول إلى كامل تفاصيله السريرية 🔒');
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>فتح الاشتراك للوصول 🔒</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Comprehensive Detailed Drug Modal */}
      {activeDrugModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1C2216] rounded-3xl border-2 border-[#59662C] shadow-2xl flex flex-col overflow-hidden text-right"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#181D13] dark:to-[#1E2417] border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                    {allCategories.find((c) => c.id === activeDrugModal.category)?.titleAr || activeDrugModal.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${getWarningLevelBadge(activeDrugModal.warningLevel).bg}`}>
                    {getWarningLevelBadge(activeDrugModal.warningLevel).label}
                  </span>
                  {activeDrugModal.isFree && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      متاح مجاناً 🆓
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white">
                  {activeDrugModal.nameEn}
                </h2>
                <div className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">
                  {activeDrugModal.nameAr}
                </div>
                {activeDrugModal.scientificName && (
                  <div className="text-xs font-mono text-[#59662C] dark:text-[#A4BF46]">
                    الاسم العلمي: {activeDrugModal.scientificName}
                  </div>
                )}
                {activeDrugModal.brandNames && (
                  <div className="text-xs text-gray-500">
                    الأسماء التجارية الشائعة: <strong>{activeDrugModal.brandNames}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveDrugModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
              {/* Clinical Pharmacist Verification Stamp - Admin controlled */}
              {pharmacistBio.isEnabled && (activeDrugModal.clinicalReview?.status === 'verified' || (activeDrugModal as any).verifiedByPharmacist) && (
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 font-black">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        معتمد ومراجع سريرياً بواسطة: {pharmacistBio.nameAr}
                        {pharmacistBio.titleAr && <span className="text-xs font-normal opacity-90 mr-1">({pharmacistBio.titleAr})</span>}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingPharmacistDrug(activeDrugModal)}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold self-start sm:self-auto cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>السيرة الذاتية للصيدلاني 🩺</span>
                    </button>
                  </div>
                  {activeDrugModal.clinicalReview?.notes && (
                    <p className="text-xs text-teal-800 dark:text-teal-300 pr-6">
                      📝 {activeDrugModal.clinicalReview.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Indications */}
              <div className="space-y-1">
                <h4 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5 text-xs">
                  <span className="text-[#59662C]">📌</span> دواعي الاستعمال السريرية (Indications):
                </h4>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 text-[#3B3528] dark:text-[#DDD7CB]">
                  {activeDrugModal.indication}
                </div>
              </div>

              {/* Dosage (Adult & Pediatric) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 space-y-1">
                  <h4 className="font-black text-[#59662C] dark:text-[#A4BF46] text-xs flex items-center gap-1">
                    <span>⚖️</span> جرعة البالغين القياسية:
                  </h4>
                  <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                    {activeDrugModal.standardDosage}
                  </p>
                </div>

                {activeDrugModal.pediatricDosage && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-200 dark:border-gray-800 space-y-1">
                    <h4 className="font-black text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1">
                      <span>👶</span> جرعة الأطفال (Pediatric):
                    </h4>
                    <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                      {activeDrugModal.pediatricDosage}
                    </p>
                  </div>
                )}
              </div>

              {/* Dental & Clinical Considerations */}
              {(activeDrugModal.clinicalConsiderations || (activeDrugModal as any).adminNotes) && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 space-y-1.5">
                  <h4 className="font-black text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>🦷 اعتبارات طب الأسنان والمحاذير السريرية:</span>
                  </h4>
                  <p className="whitespace-pre-line text-xs font-medium leading-relaxed">
                    {activeDrugModal.clinicalConsiderations || (activeDrugModal as any).adminNotes}
                  </p>
                </div>
              )}

              {/* Drug Interactions */}
              {(activeDrugModal.drugInteractions || (activeDrugModal as any).contraindications) && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 space-y-1.5">
                  <h4 className="font-black text-xs sm:text-sm text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>⚠️ التداخلات الدوائية وموانع الاستعمال (Drug Interactions):</span>
                  </h4>
                  <p className="whitespace-pre-line text-xs font-medium leading-relaxed">
                    {activeDrugModal.drugInteractions || (activeDrugModal as any).contraindications}
                  </p>
                </div>
              )}

              {/* Allergy & Contraindications */}
              <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-[#161B11] border border-stone-300 dark:border-stone-700 space-y-1 text-xs">
                <span className="font-black text-[#2F2B24] dark:text-white block">
                  🚫 تنبيهات الحساسية (Allergy Alerts):
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  {activeDrugModal.allergyAlerts}
                </p>
              </div>

              {/* Pregnancy & Lactation Safety */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1 text-xs">
                <span className="font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-purple-600" />
                  <span>🤰 أمان الحمل والرضاعة (Pregnancy & Lactation):</span>
                </span>
                <p className="text-purple-950 dark:text-purple-200 font-medium">
                  {activeDrugModal.pregnancySafety}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#151910] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleFavoriteDrug(activeDrugModal)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2417] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black flex items-center gap-2 cursor-pointer shadow-2xs hover:border-amber-400"
              >
                <OfficialToothSvg
                  isBookmarked={isItemBookmarked(`prescription_drug_${activeDrugModal.id}`, localBookmarks)}
                  className="w-4 h-4"
                />
                <span>
                  {isItemBookmarked(`prescription_drug_${activeDrugModal.id}`, localBookmarks)
                    ? 'في المفضلة'
                    : 'إضافة للمفضلة 🦷'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyDrugRx(activeDrugModal)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  <Copy className="w-4 h-4" />
                  <span>نسخ الوصفة السريرية 📋</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDrugModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Pharmacist Review Certificate & Bio Dialog - Completely Admin Controlled */}
      {viewingPharmacistDrug && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-white dark:bg-[#1E2417] rounded-3xl p-6 border-2 border-teal-500 shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-black">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black">اعتماد الصيدلاني الإكلينيكي والسيرة المهنية 🩺</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPharmacistDrug(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed">
              {/* Drug Name Verified */}
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1">
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">الدواء المعتمد سريرياً:</span>
                <p className="text-sm font-black text-[#2F2B24] dark:text-white">
                  {viewingPharmacistDrug.nameEn} ({viewingPharmacistDrug.nameAr})
                </p>
              </div>

              {/* Dynamic Pharmacist Profile */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#151910] border border-gray-200 dark:border-gray-800 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-gray-500 text-[11px] block">الصيدلاني السريري المشرف:</span>
                    <h4 className="font-black text-[#2F2B24] dark:text-white text-base">
                      {pharmacistBio.nameAr}
                    </h4>
                    {pharmacistBio.titleAr && (
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-0.5">
                        {pharmacistBio.titleAr}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-black border border-teal-300 dark:border-teal-700 shrink-0">
                    {pharmacistBio.verificationBadgeText || 'معتمد سريرياً'}
                  </span>
                </div>

                {pharmacistBio.licenseNumber && (
                  <div className="text-[11px] text-gray-500 font-mono">
                    ترخيص المزاولة / القيد: <span className="font-bold text-gray-700 dark:text-gray-300">{pharmacistBio.licenseNumber}</span>
                  </div>
                )}

                {/* Bio */}
                {pharmacistBio.bioAr && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800/80">
                    <span className="text-[10px] font-bold text-gray-500 block mb-1">نبذة عن الاستشاري السريري:</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {pharmacistBio.bioAr}
                    </p>
                  </div>
                )}

                {/* Credentials */}
                {pharmacistBio.credentials && pharmacistBio.credentials.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800/80">
                    <span className="text-[10px] font-bold text-gray-500 block mb-1">المؤهلات والشهادات:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pharmacistBio.credentials.map((cred, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-800 dark:text-gray-200"
                        >
                          🎓 {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Notes on This Drug */}
              {viewingPharmacistDrug.clinicalReview?.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[#4D3F1B] dark:text-amber-200 space-y-1">
                  <strong className="text-xs font-bold block">ملاحظات الاعتماد الخاصة بهذا الدواء:</strong>
                  <p className="text-xs leading-relaxed">{viewingPharmacistDrug.clinicalReview.notes}</p>
                </div>
              )}

              {viewingPharmacistDrug.clinicalReview?.reviewedAt && (
                <div className="text-[10px] text-gray-400">
                  تاريخ المراجعة والاعتماد السريري: {new Date(viewingPharmacistDrug.clinicalReview.reviewedAt).toLocaleDateString('ar-IQ')}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setViewingPharmacistDrug(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black cursor-pointer shadow-xs active:scale-98 transition-all"
            >
              إغلاق نافذة الاعتماد
            </button>
          </div>
        </div>
      )}

      {/* Floating Copy Toast */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2617] text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#59662C] flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#A8C24E] shrink-0" />
          <span>{copyToast}</span>
        </div>
      )}
    </div>
  );
};
