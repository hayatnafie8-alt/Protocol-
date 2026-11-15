import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Droplets,
  AlertOctagon,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  Stethoscope,
  Heart,
  Baby,
  Activity,
  Zap,
  Layers,
  Save,
  Check,
  Calendar,
  Send,
  UserCheck,
} from 'lucide-react';
import {
  PrescriptionDrug,
  DrugCategoryItem,
  DrugStatus,
  DrugWarningLevel,
  PrescriptionGuideConfig,
  DEFAULT_PRESCRIPTION_CATEGORIES,
} from '../data/prescriptionGuideData';
import {
  subscribeToPrescriptionDrugsCloud,
  subscribeToPrescriptionGuideConfigCloud,
  setPrescriptionGuideGlobalVisibilityInCloud,
  addPrescriptionDrugInCloud,
  updatePrescriptionDrugInCloud,
  deletePrescriptionDrugInCloud,
  toggleDrugVisibilityInCloud,
  toggleDrugAccessControlInCloud,
  toggleDrugStatusInCloud,
  sendDrugToClinicalPharmacistReviewInCloud,
  verifyDrugByPharmacistInCloud,
  addCategoryInCloud,
  updateCategoryInCloud,
  deleteCategoryInCloud,
  toggleCategoryVisibilityInCloud,
  toggleCategoryAccessControlInCloud,
  resetPrescriptionDrugsToDefaultInCloud,
} from '../services/prescriptionGuideService';
import {
  PharmacistBioConfig,
  DEFAULT_PHARMACIST_BIO,
  subscribeToPharmacistBioCloud,
} from '../services/pharmacistBioService';
import { PharmacistBioAdminManager } from './PharmacistBioAdminManager';
import { InternalTextEditingPanel } from './InternalTextEditingPanel';
import { useLanguage } from '../contexts/LanguageContext';

interface PrescriptionGuideAdminViewProps {
  isAuthorAdmin: boolean;
  onOpenSettings?: () => void;
  onPreviewSubscriberView?: () => void;
}

export const PrescriptionGuideAdminView: React.FC<PrescriptionGuideAdminViewProps> = ({
  isAuthorAdmin,
  onOpenSettings,
  onPreviewSubscriberView,
}) => {
  const { isRTL } = useLanguage();
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([]);
  const [guideConfig, setGuideConfig] = useState<PrescriptionGuideConfig>({
    isGuidePublic: false,
    isGuideHidden: false,
    categoriesConfig: {},
    customCategories: [],
  });

  const [activeAdminTab, setActiveAdminTab] = useState<'drugs' | 'categories' | 'pharmacist_bio' | 'internal_texts'>('drugs');

  // Dynamic Pharmacist Bio (Admin controlled)
  const [pharmacistBio, setPharmacistBio] = useState<PharmacistBioConfig>(DEFAULT_PHARMACIST_BIO);

  // Filters for drugs
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drug Modal State (Add / Edit)
  const [isDrugModalOpen, setIsDrugModalOpen] = useState<boolean>(false);
  const [editingDrugId, setEditingDrugId] = useState<string | null>(null);

  // Drug Form Fields
  const [formCategory, setFormCategory] = useState<string>('analgesics');
  const [formNameEn, setFormNameEn] = useState<string>('');
  const [formNameAr, setFormNameAr] = useState<string>('');
  const [formScientificName, setFormScientificName] = useState<string>('');
  const [formBrandNames, setFormBrandNames] = useState<string>('');
  const [formActiveIngredient, setFormActiveIngredient] = useState<string>('');
  const [formIndication, setFormIndication] = useState<string>('');
  const [formClinicalConsiderations, setFormClinicalConsiderations] = useState<string>('');
  const [formDrugInteractions, setFormDrugInteractions] = useState<string>('');
  const [formStandardDosage, setFormStandardDosage] = useState<string>('');
  const [formPediatricDosage, setFormPediatricDosage] = useState<string>('');
  const [formAllergyAlerts, setFormAllergyAlerts] = useState<string>('');
  const [formPregnancySafety, setFormPregnancySafety] = useState<string>('');
  const [formWarningLevel, setFormWarningLevel] = useState<DrugWarningLevel>('caution');
  const [formStatus, setFormStatus] = useState<DrugStatus>('published');
  const [formIsFree, setFormIsFree] = useState<boolean>(false);
  const [formIsHidden, setFormIsHidden] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Category Modal State (Add / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catFormId, setCatFormId] = useState<string>('');
  const [catFormTitleAr, setCatFormTitleAr] = useState<string>('');
  const [catFormTitleEn, setCatFormTitleEn] = useState<string>('');
  const [catFormIcon, setCatFormIcon] = useState<string>('Pill');
  const [catFormDescriptionAr, setCatFormDescriptionAr] = useState<string>('');
  const [catFormIsFree, setCatFormIsFree] = useState<boolean>(false);
  const [catFormIsHidden, setCatFormIsHidden] = useState<boolean>(false);
  const [catFormError, setCatFormError] = useState<string>('');

  // Clinical Pharmacist Review Modal State
  const [pharmacistModalDrug, setPharmacistModalDrug] = useState<PrescriptionDrug | null>(null);
  const [pharmacistModalAction, setPharmacistModalAction] = useState<'send_review' | 'verify'>('send_review');
  const [pharmacistNameInput, setPharmacistNameInput] = useState<string>(DEFAULT_PHARMACIST_BIO.nameAr);
  const [pharmacistTitleInput, setPharmacistTitleInput] = useState<string>(DEFAULT_PHARMACIST_BIO.titleAr);
  const [pharmacistNotesInput, setPharmacistNotesInput] = useState<string>('تمت مراجعة الجرعات السريرية والتداخلات مع أدوية الأسنان بدقة.');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to Cloud Data & Pharmacist Bio
  useEffect(() => {
    const unsubDrugs = subscribeToPrescriptionDrugsCloud((cloudDrugs) => {
      setDrugs(cloudDrugs);
    });

    const unsubConfig = subscribeToPrescriptionGuideConfigCloud((config) => {
      setGuideConfig(config);
    });

    const unsubBio = subscribeToPharmacistBioCloud((bio) => {
      setPharmacistBio(bio);
      if (bio.nameAr) setPharmacistNameInput(bio.nameAr);
      if (bio.titleAr) setPharmacistTitleInput(bio.titleAr);
    });

    return () => {
      unsubDrugs();
      unsubConfig();
      unsubBio();
    };
  }, []);

  // Merge categories
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

  // Open Drug Add Modal
  const handleOpenAddDrugModal = () => {
    setEditingDrugId(null);
    setFormCategory(allCategories[0]?.id || 'diabetes');
    setFormNameEn('');
    setFormNameAr('');
    setFormScientificName('');
    setFormBrandNames('');
    setFormActiveIngredient('');
    setFormIndication('');
    setFormClinicalConsiderations('');
    setFormDrugInteractions('');
    setFormStandardDosage('');
    setFormPediatricDosage('');
    setFormAllergyAlerts('لا توجد موانع خاصة ما لم يذكر غير ذلك.');
    setFormPregnancySafety('الفئة B (استشارة الطبيب عند الحاجة).');
    setFormWarningLevel('caution');
    setFormStatus('published');
    setFormIsFree(false);
    setFormIsHidden(false);
    setFormError('');
    setIsDrugModalOpen(true);
  };

  // Open Drug Edit Modal
  const handleOpenEditDrugModal = (drug: PrescriptionDrug) => {
    setEditingDrugId(drug.id);
    setFormCategory(drug.category);
    setFormNameEn(drug.nameEn);
    setFormNameAr(drug.nameAr);
    setFormScientificName(drug.scientificName || '');
    setFormBrandNames(drug.brandNames || '');
    setFormActiveIngredient(drug.activeIngredient || '');
    setFormIndication(drug.indication);
    setFormClinicalConsiderations(drug.clinicalConsiderations);
    setFormDrugInteractions(drug.drugInteractions);
    setFormStandardDosage(drug.standardDosage);
    setFormPediatricDosage(drug.pediatricDosage || '');
    setFormAllergyAlerts(drug.allergyAlerts);
    setFormPregnancySafety(drug.pregnancySafety);
    setFormWarningLevel(drug.warningLevel);
    setFormStatus(drug.status);
    setFormIsFree(drug.isFree ?? false);
    setFormIsHidden(drug.isHidden ?? false);
    setFormError('');
    setIsDrugModalOpen(true);
  };

  // Save Drug Form
  const handleSaveDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn.trim() || !formNameAr.trim()) {
      setFormError('يرجى إدخال اسم الدواء باللغة الإنجليزية والعربية.');
      return;
    }
    if (!formIndication.trim()) {
      setFormError('يرجى تحديد دواعي الاستعمال السريرية.');
      return;
    }
    if (!formStandardDosage.trim()) {
      setFormError('يرجى تحديد الجرعة القياسية المعتمدة.');
      return;
    }

    try {
      if (editingDrugId) {
        await updatePrescriptionDrugInCloud(editingDrugId, {
          category: formCategory,
          nameEn: formNameEn.trim(),
          nameAr: formNameAr.trim(),
          scientificName: formScientificName.trim() || undefined,
          brandNames: formBrandNames.trim() || undefined,
          activeIngredient: formActiveIngredient.trim() || undefined,
          indication: formIndication.trim(),
          clinicalConsiderations: formClinicalConsiderations.trim(),
          drugInteractions: formDrugInteractions.trim(),
          standardDosage: formStandardDosage.trim(),
          pediatricDosage: formPediatricDosage.trim() || undefined,
          allergyAlerts: formAllergyAlerts.trim(),
          pregnancySafety: formPregnancySafety.trim(),
          warningLevel: formWarningLevel,
          status: formStatus,
          isFree: formIsFree,
          isHidden: formIsHidden,
        });
        showToast('تم تحديث بيانات الدواء بنجاح في السحابة ✅');
      } else {
        await addPrescriptionDrugInCloud({
          category: formCategory,
          nameEn: formNameEn.trim(),
          nameAr: formNameAr.trim(),
          scientificName: formScientificName.trim() || undefined,
          brandNames: formBrandNames.trim() || undefined,
          activeIngredient: formActiveIngredient.trim() || undefined,
          indication: formIndication.trim(),
          clinicalConsiderations: formClinicalConsiderations.trim(),
          drugInteractions: formDrugInteractions.trim(),
          standardDosage: formStandardDosage.trim(),
          pediatricDosage: formPediatricDosage.trim() || undefined,
          allergyAlerts: formAllergyAlerts.trim(),
          pregnancySafety: formPregnancySafety.trim(),
          warningLevel: formWarningLevel,
          status: formStatus,
          isFree: formIsFree,
          isHidden: formIsHidden,
        });
        showToast('تمت إضافة الدواء الجديد إلى الدليل بنجاح 🎉');
      }

      setIsDrugModalOpen(false);
    } catch (err: any) {
      setFormError('حدث خطأ أثناء حفظ الدواء: ' + (err?.message || 'يرجى التحقق من الاتصال'));
    }
  };

  // Delete Drug
  const handleDeleteDrug = async (drug: PrescriptionDrug) => {
    if (window.confirm(`هل أنت متأكد من حذف دواء "${drug.nameEn}" نهائياً من السحابة؟`)) {
      await deletePrescriptionDrugInCloud(drug.id);
      showToast(`تم حذف دواء "${drug.nameEn}" 🗑️`);
    }
  };

  // Open Category Add Modal
  const handleOpenAddCategoryModal = () => {
    setEditingCatId(null);
    setCatFormId(`cat_${Date.now().toString(36)}`);
    setCatFormTitleAr('');
    setCatFormTitleEn('');
    setCatFormIcon('Pill');
    setCatFormDescriptionAr('');
    setCatFormIsFree(false);
    setCatFormIsHidden(false);
    setCatFormError('');
    setIsCategoryModalOpen(true);
  };

  // Open Category Edit Modal
  const handleOpenEditCategoryModal = (cat: DrugCategoryItem) => {
    setEditingCatId(cat.id);
    setCatFormId(cat.id);
    setCatFormTitleAr(cat.titleAr);
    setCatFormTitleEn(cat.titleEn);
    setCatFormIcon(cat.iconName || 'Pill');
    setCatFormDescriptionAr(cat.descriptionAr);
    setCatFormIsFree(cat.isFree ?? false);
    setCatFormIsHidden(cat.isHidden ?? false);
    setCatFormError('');
    setIsCategoryModalOpen(true);
  };

  // Save Category Form
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormTitleAr.trim()) {
      setCatFormError('يرجى إدخال عنوان التصنيف بالعربية.');
      return;
    }

    try {
      if (editingCatId) {
        await updateCategoryInCloud(editingCatId, {
          titleAr: catFormTitleAr.trim(),
          titleEn: catFormTitleEn.trim() || catFormTitleAr.trim(),
          iconName: catFormIcon,
          descriptionAr: catFormDescriptionAr.trim(),
          isFree: catFormIsFree,
          isHidden: catFormIsHidden,
        });
        showToast('تم تحديث إعدادات القسم بنجاح ✅');
      } else {
        await addCategoryInCloud({
          id: catFormId.trim().toLowerCase().replace(/\s+/g, '_'),
          titleAr: catFormTitleAr.trim(),
          titleEn: catFormTitleEn.trim() || catFormTitleAr.trim(),
          iconName: catFormIcon,
          descriptionAr: catFormDescriptionAr.trim(),
          colorClass: 'emerald',
          isFree: catFormIsFree,
          isHidden: catFormIsHidden,
        });
        showToast('تمت إضافة التصنيف العلمي الجديد بنجاح 🎉');
      }

      setIsCategoryModalOpen(false);
    } catch (err: any) {
      setCatFormError('حدث خطأ أثناء حفظ التصنيف: ' + (err?.message || 'خطأ غير معروف'));
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: DrugCategoryItem) => {
    if (!cat.isCustom) {
      showToast('التصنيفات الأساسية لا يمكن حذفها، يمكنك إخفاؤها عبر زر الإخفاء 👁️');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف قسم "${cat.titleAr}" نهائياً؟`)) {
      await deleteCategoryInCloud(cat.id);
      showToast(`تم حذف قسم "${cat.titleAr}"`);
    }
  };

  // Handle Pharmacist Review Modal Submit
  const handlePharmacistActionSubmit = async () => {
    if (!pharmacistModalDrug) return;

    try {
      if (pharmacistModalAction === 'send_review') {
        await sendDrugToClinicalPharmacistReviewInCloud(
          pharmacistModalDrug.id,
          pharmacistNameInput,
          pharmacistNotesInput
        );
        showToast(`تم إرسال دواء "${pharmacistModalDrug.nameEn}" للمراجعة الصيدلانية السريرية 🩺⏳`);
      } else {
        await verifyDrugByPharmacistInCloud(
          pharmacistModalDrug.id,
          pharmacistNameInput,
          pharmacistTitleInput,
          pharmacistNotesInput
        );
        showToast(`تم اعتماد دواء "${pharmacistModalDrug.nameEn}" رسمياً من الصيدلاني الإكلينيكي 🩺✅`);
      }
      setPharmacistModalDrug(null);
    } catch {
      showToast('فشل تحديث حالة المراجعة الصيدلانية.');
    }
  };

  // Filtered Drugs for Admin List
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      if (selectedCategoryFilter !== 'all' && drug.category !== selectedCategoryFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && drug.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          (drug.nameEn || '').toLowerCase().includes(q) ||
          (drug.nameAr || '').toLowerCase().includes(q) ||
          (drug.scientificName && drug.scientificName.toLowerCase().includes(q)) ||
          (drug.indication && drug.indication.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [drugs, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner & Global Access Controls */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] dark:from-[#181D13] dark:via-[#1E2519] dark:to-[#141810] border-2 border-[#59662C]/40 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                Admin Master Control
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {drugs.length} دواء مسجل • {allCategories.length} تصنيف
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
              <Pill className="w-6 h-6 text-[#59662C]" />
              <span>لوحة المشرف لإدارة دليل وصف الأدوية السريري 🩺</span>
            </h1>
            <p className="text-xs text-[#6F6759] dark:text-[#C5BFB0] max-w-2xl leading-relaxed">
              تحكم كامل في الأقسام العلمية، إضافة وتعديل الأدوية، التحكم بالظهور (إخفاء / إظهار)، نوع الوصول (مجاني / اشتراك)، وإرسال ومصادقة الأدوية مع الصيدلاني الإكلينيكي.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onPreviewSubscriberView && (
              <button
                type="button"
                onClick={onPreviewSubscriberView}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2417] text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/40 text-xs font-black flex items-center gap-1.5 hover:bg-[#FAF7F2] cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة واجهة المشتركين</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('هل أنت متأكد من استعادة الأدوية الافتراضية كاملة وحذف التعديلات؟')) {
                  await resetPrescriptionDrugsToDefaultInCloud();
                  showToast('تمت استعادة الأدوية الافتراضية بنجاح 🔄');
                }
              }}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold cursor-pointer"
              title="استعادة الأدوية الافتراضية الأصلية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Access Gatekeeper Switch */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#151910] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              guideConfig.isGuidePublic ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
            }`}>
              {guideConfig.isGuidePublic ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-black text-sm text-[#2F2B24] dark:text-white block">
                مفتاح الوصول العام للدليل (Global Public Gate):
              </span>
              <p className="text-gray-500">
                {guideConfig.isGuidePublic
                  ? 'الدليل متاح ومفتوح مجاناً لكافة الزوار والطلاب دون اشتراك.'
                  : 'الدليل مقيد يتطلب تفعيل كود الاشتراك للوصول (ما عدا الأدوية المحددة كمجانية فردياً).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const next = !guideConfig.isGuidePublic;
              await setPrescriptionGuideGlobalVisibilityInCloud(next);
              showToast(next ? 'تم فتح الدليل مجاناً للعامة 🔓' : 'تم قفل الدليل للمشتركين فقط 🔒');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all flex items-center gap-2 ${
              guideConfig.isGuidePublic
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {guideConfig.isGuidePublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{guideConfig.isGuidePublic ? 'متاح مجاناً (تبديل لقفل المشتركين)' : 'مقيد للمشتركين (تبديل للفتح مجاناً)'}</span>
          </button>
        </div>

        {/* Nav Tabs for Admin (Drugs vs Categories) */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pt-2">
          <button
            type="button"
            onClick={() => setActiveAdminTab('drugs')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'drugs'
                ? 'bg-[#59662C] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>إدارة الأدوية السريرية ({drugs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('categories')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'categories'
                ? 'bg-[#59662C] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة وتخصيص الأقسام العلمية ({allCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('pharmacist_bio')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'pharmacist_bio'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>السيرة والمراجعة الصيدلانية 🩺</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('internal_texts')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'internal_texts'
                ? 'bg-[#59662C] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>لوحة تعديل النصوص الداخلية ✍️</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: CATEGORIES MANAGEMENT */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                الأقسام والتصنيفات العلمية للأدوية
              </h3>
              <p className="text-xs text-gray-500">
                يمكنك إضافة تصنيف جديد، تعديل المسميات، إخفاء/إظهار التصنيف بالكامل، وتحديد هل القسم مجاني أم باشتراك.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCategoryModal}
              className="px-4 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم علمي جديد 📁</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((cat) => {
              const drugCount = drugs.filter((d) => d.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className={`p-5 rounded-3xl border-2 transition-all space-y-3.5 bg-white dark:bg-[#1E2417] text-right shadow-xs ${
                    cat.isHidden
                      ? 'border-dashed border-gray-300 dark:border-gray-700 opacity-60'
                      : 'border-[#E5DEC9] dark:border-[#384524]'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      ID: {cat.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Access Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        cat.isFree
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {cat.isFree ? 'مجاني 🆓' : 'اشتراك 🔒'}
                      </span>

                      {/* Visibility Badge */}
                      {cat.isHidden && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          مخفي 👁️🚫
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                      {cat.titleAr}
                    </h4>
                    <span className="text-xs text-gray-500 font-mono block mt-0.5">
                      {cat.titleEn}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {cat.descriptionAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>عدد الأدوية بهذا القسم: <strong>{drugCount}</strong></span>
                    {cat.isCustom && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 text-[10px] font-bold">
                        تصنيف مخصص
                      </span>
                    )}
                  </div>

                  {/* Actions for this category */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      {/* Toggle Hide/Unhide */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextHidden = !cat.isHidden;
                          await toggleCategoryVisibilityInCloud(cat.id, nextHidden);
                          showToast(nextHidden ? `تم إخفاء قسم "${cat.titleAr}" عن المشتركين` : `تم إظهار قسم "${cat.titleAr}"`);
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                          cat.isHidden
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
                        }`}
                        title={cat.isHidden ? 'إظهار القسم' : 'إخفاء القسم'}
                      >
                        {cat.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Toggle Free / Subscription */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextFree = !cat.isFree;
                          await toggleCategoryAccessControlInCloud(cat.id, nextFree);
                          showToast(nextFree ? `أصبح قسم "${cat.titleAr}" متاحاً مجاناً` : `أصبح قسم "${cat.titleAr}" يتطلب اشتراكاً`);
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                          cat.isFree
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                        title={cat.isFree ? 'جعله باشتراك' : 'جعله مجانياً'}
                      >
                        {cat.isFree ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Category */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategoryModal(cat)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#59662C] hover:text-white text-gray-700 dark:text-gray-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      {/* Delete (if custom) */}
                      {cat.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                          title="حذف التصنيف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2.5 TAB: PHARMACIST BIO MANAGEMENT */}
      {activeAdminTab === 'pharmacist_bio' && (
        <PharmacistBioAdminManager isAuthorAdmin={isAuthorAdmin} />
      )}

      {/* 2.6 TAB: MANUAL TEXT EDITING PANEL */}
      {activeAdminTab === 'internal_texts' && (
        <InternalTextEditingPanel isAuthorAdmin={isAuthorAdmin} initialModule="drug_guide" />
      )}

      {/* 3. TAB: MEDICATIONS MANAGEMENT */}
      {activeAdminTab === 'drugs' && (
        <div className="space-y-4">
          {/* Top Bar with Add Button and Filters */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الأدوية السريرية بالاسم، المادة الفعالة، أو الاستعمال..."
                  className="w-full pl-4 pr-10 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
                />
              </div>

              {/* Add Drug Button */}
              <button
                type="button"
                onClick={handleOpenAddDrugModal}
                className="px-5 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دواء جديد 💊</span>
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-xs">
              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-[#2F2B24] dark:text-white"
              >
                <option value="all">كافة الأقسام ({drugs.length})</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleAr} ({drugs.filter((d) => d.category === c.id).length})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-[#2F2B24] dark:text-white"
              >
                <option value="all">كافة الحالات</option>
                <option value="published">منشور للعيادات (Published)</option>
                <option value="under_clinical_review">قيد المراجعة الصيدلانية ⏳</option>
                <option value="verified">معتمد من صيدلاني إكلينيكي ✅</option>
                <option value="draft">مسودة (Draft)</option>
              </select>
            </div>
          </div>

          {/* Drugs List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrugs.map((drug) => {
              const cat = allCategories.find((c) => c.id === drug.category);
              const isVerified = drug.clinicalReview?.status === 'verified';
              const isUnderReview = drug.status === 'under_clinical_review';

              return (
                <div
                  key={drug.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 text-right shadow-xs ${
                    drug.isHidden
                      ? 'bg-gray-50/50 dark:bg-[#161912]/50 border-dashed border-gray-300 dark:border-gray-700 opacity-60'
                      : 'bg-white dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#384524]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row with category and access badge */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {cat?.titleAr || drug.category}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Free vs Subscription Toggle Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          drug.isFree
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {drug.isFree ? 'مجاني 🆓' : 'اشتراك 🔒'}
                        </span>

                        {drug.isHidden && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            مخفي 👁️🚫
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Drug Names */}
                    <div>
                      <h4 className="text-base font-black text-[#2F2B24] dark:text-white">
                        {drug.nameEn}
                      </h4>
                      <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {drug.nameAr}
                      </div>
                      {drug.scientificName && (
                        <div className="text-[11px] font-mono text-[#59662C] dark:text-[#A4BF46] truncate">
                          {drug.scientificName}
                        </div>
                      )}
                    </div>

                    {/* Pharmacist Status Banner */}
                    <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#151910] border border-gray-200 dark:border-gray-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">حالة الاعتماد الصيدلاني:</span>
                        {isVerified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>معتمد سريرياً ✅</span>
                          </span>
                        ) : isUnderReview ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>قيد التدقيق ⏳</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            لم يرسل بعد
                          </span>
                        )}
                      </div>

                      {drug.clinicalReview?.pharmacistName && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                          👨‍⚕️ {drug.clinicalReview.pharmacistName}
                        </p>
                      )}
                    </div>

                    {/* Dosage summary */}
                    <div className="text-xs text-[#524C3F] dark:text-[#C5BFB0] line-clamp-2">
                      <strong>⚖️ الجرعة:</strong> {drug.standardDosage}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    {/* Quick Toggles Row */}
                    <div className="flex items-center justify-between gap-1 text-xs">
                      {/* Hide/Unhide */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextHidden = !drug.isHidden;
                          await toggleDrugVisibilityInCloud(drug.id, nextHidden);
                          showToast(nextHidden ? `تم إخفاء دواء "${drug.nameEn}"` : `تم إظهار دواء "${drug.nameEn}"`);
                        }}
                        className={`p-2 rounded-xl border font-bold cursor-pointer transition-colors ${
                          drug.isHidden
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
                        }`}
                        title={drug.isHidden ? 'إظهار الدواء' : 'إخفاء الدواء عن المشتركين'}
                      >
                        {drug.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Free vs Subscription Toggle */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextFree = !drug.isFree;
                          await toggleDrugAccessControlInCloud(drug.id, nextFree);
                          showToast(nextFree ? `أصبح دواء "${drug.nameEn}" متاحاً مجاناً` : `أصبح دواء "${drug.nameEn}" باشتراك`);
                        }}
                        className={`p-2 rounded-xl border font-bold cursor-pointer transition-colors ${
                          drug.isFree
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                        title={drug.isFree ? 'جعله باشتراك' : 'جعله مجانياً'}
                      >
                        {drug.isFree ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Clinical Pharmacist Action Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPharmacistModalDrug(drug);
                          setPharmacistModalAction(isVerified ? 'verify' : 'send_review');
                          setPharmacistNotesInput(drug.clinicalReview?.notes || 'تمت مراجعة الجرعات والاعتبارات السنية.');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-800 font-bold flex items-center gap-1 cursor-pointer"
                        title="إرسال أو اعتماد من صيدلاني إكلينيكي"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>مراجعة صيدلانية</span>
                      </button>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrugModal(drug)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل التفاصيل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDrug(drug)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                        title="حذف هذا الدواء"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DRUG ADD / EDIT MODAL */}
      {isDrugModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveDrug}
            className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#1C2216] rounded-3xl border-2 border-[#59662C] shadow-2xl flex flex-col overflow-hidden text-right"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#181D13] dark:to-[#1E2417] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center font-black">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                    {editingDrugId ? 'تعديل بيانات الدواء السريري' : 'إضافة دواء جديد للدليل السريري'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    أدخل كافة التفاصيل العلمية والسريرية والتداخلات لضمان الفائدة التعليمية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrugModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-300 font-bold">
                  {formError}
                </div>
              )}

              {/* Row 1: Category & Warning Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">القسم العلمي للدواء:*</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.titleAr} ({c.titleEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">مستوى الحذر السريري:*</label>
                  <select
                    value={formWarningLevel}
                    onChange={(e) => setFormWarningLevel(e.target.value as DrugWarningLevel)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  >
                    <option value="safe">آمن وموصى به أولاً (Safe)</option>
                    <option value="caution">حذر ومحاذير خاصة (Caution)</option>
                    <option value="high">تحذير سريري حرج (High Alert)</option>
                    <option value="info">إرشادات عامة (Info)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Name EN & Name AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">اسم الدواء بالإنجليزية (Trade / Generic):*</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Metformin 500mg (Glucophage)"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">اسم الدواء بالعربية:*</label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: ميتفورمين (جلوكوفاج)"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Scientific Name & Brand Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">الاسم العلمي (Scientific Name):</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formScientificName}
                    onChange={(e) => setFormScientificName(e.target.value)}
                    placeholder="e.g. Metformin Hydrochloride"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">الأسماء التجارية الشائعة:</label>
                  <input
                    type="text"
                    value={formBrandNames}
                    onChange={(e) => setFormBrandNames(e.target.value)}
                    placeholder="مثال: Glucophage, Formet"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>
              </div>

              {/* Indications */}
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">دواعي الاستعمال السريرية (Indications):*</label>
                <textarea
                  rows={2}
                  required
                  value={formIndication}
                  onChange={(e) => setFormIndication(e.target.value)}
                  placeholder="دواعي الاستعمال الأساسية للمريض وطبيب الأسنان..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Dosages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">الجرعة القياسية للبالغين:*</label>
                  <input
                    type="text"
                    required
                    value={formStandardDosage}
                    onChange={(e) => setFormStandardDosage(e.target.value)}
                    placeholder="مثال: 500 ملغ مرتين يومياً مع الأكل"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">جرعة الأطفال (اختياري):</label>
                  <input
                    type="text"
                    value={formPediatricDosage}
                    onChange={(e) => setFormPediatricDosage(e.target.value)}
                    placeholder="مثال: 20-40 ملغ/كجم/يوم"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                  />
                </div>
              </div>

              {/* Dental Considerations */}
              <div className="space-y-1">
                <label className="font-bold text-amber-800 dark:text-amber-300">
                  🦷 اعتبارات طب الأسنان والمحاذير السريرية (تأثير اللثة، النزف، الإبينفرين):*
                </label>
                <textarea
                  rows={3}
                  required
                  value={formClinicalConsiderations}
                  onChange={(e) => setFormClinicalConsiderations(e.target.value)}
                  placeholder="اكتب نقاط واضحة حول التعامل مع المريض في كرسي الأسنان..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-amber-300 dark:border-amber-700 font-medium text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Drug Interactions */}
              <div className="space-y-1">
                <label className="font-bold text-rose-800 dark:text-rose-300">
                  ⚠️ التداخلات الدوائية وموانع الاستعمال (Drug Interactions):*
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDrugInteractions}
                  onChange={(e) => setFormDrugInteractions(e.target.value)}
                  placeholder="التداخلات مع المسكنات والمخدرات الموضعية والمضادات..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-rose-300 dark:border-rose-700 font-medium text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Allergy & Pregnancy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">تنبيهات الحساسية:*</label>
                  <input
                    type="text"
                    required
                    value={formAllergyAlerts}
                    onChange={(e) => setFormAllergyAlerts(e.target.value)}
                    placeholder="مثال: يمنع لمرضى حساسية البنسلين"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-[#2F2B24] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2F2B24] dark:text-white">سلامة الحمل والرضاعة (FDA Category):*</label>
                  <input
                    type="text"
                    required
                    value={formPregnancySafety}
                    onChange={(e) => setFormPregnancySafety(e.target.value)}
                    placeholder="مثال: الفئة B (آمن أثناء الحمل)"
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-[#2F2B24] dark:text-white"
                  />
                </div>
              </div>

              {/* Access Control & Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151910] border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Free vs Subscription */}
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formIsFree}
                    onChange={(e) => setFormIsFree(e.target.checked)}
                    className="w-4 h-4 text-[#59662C] rounded"
                  />
                  <span>متاح مجاناً للجميع 🆓</span>
                </label>

                {/* Hidden */}
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formIsHidden}
                    onChange={(e) => setFormIsHidden(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>إخفاء عن المشتركين 👁️🚫</span>
                </label>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">الحالة:</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DrugStatus)}
                    className="p-1 rounded-lg bg-white dark:bg-black/30 border border-gray-300 dark:border-gray-700 text-xs font-bold"
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="under_clinical_review">قيد التدقيق</option>
                    <option value="verified">معتمد</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#151910] border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDrugModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات الدواء في السحابة</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. CATEGORY ADD / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveCategory}
            className="w-full max-w-lg bg-white dark:bg-[#1C2216] rounded-3xl border-2 border-[#59662C] shadow-2xl p-6 text-right space-y-4"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#59662C]" />
                <span>{editingCatId ? 'تعديل بيانات القسم العلمي' : 'إضافة تصنيف علمي جديد للأدوية'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {catFormError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-300">
                {catFormError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">عنوان التصنيف بالعربية:*</label>
                <input
                  type="text"
                  required
                  value={catFormTitleAr}
                  onChange={(e) => setCatFormTitleAr(e.target.value)}
                  placeholder="مثال: أدوية الغدة الدرقية وطب الأسنان"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">العنوان بالإنجليزية (English Title):</label>
                <input
                  type="text"
                  dir="ltr"
                  value={catFormTitleEn}
                  onChange={(e) => setCatFormTitleEn(e.target.value)}
                  placeholder="e.g. Thyroid Disorders & Dental Management"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">أيقونة التصنيف:</label>
                <select
                  value={catFormIcon}
                  onChange={(e) => setCatFormIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                >
                  <option value="Pill">💊 Pill (أدوية عامة)</option>
                  <option value="Droplets">🩸 Droplets (فقر دم واضطرابات نزف)</option>
                  <option value="Activity">📈 Activity (نشاط وسكري)</option>
                  <option value="Heart">❤️ Heart (قلب وضغط)</option>
                  <option value="Baby">👶 Baby (حمل ورضاعة)</option>
                  <option value="ShieldAlert">🛡️ ShieldAlert (موانع وسيولة)</option>
                  <option value="AlertTriangle">⚠️ AlertTriangle (كبد وخطورة)</option>
                  <option value="Sparkles">✨ Sparkles (مهدئات ومضادات التهاب)</option>
                  <option value="Zap">⚡ Zap (غدة درقية وصرع)</option>
                  <option value="ShieldCheck">✅ ShieldCheck (مضادات ووقاية)</option>
                  <option value="AlertOctagon">🛑 AlertOctagon (طوارئ)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">وصف مختصر للقسم السريري:</label>
                <textarea
                  rows={2}
                  value={catFormDescriptionAr}
                  onChange={(e) => setCatFormDescriptionAr(e.target.value)}
                  placeholder="وصف مختصر للأطباء عن الحالات التي يغطيها هذا القسم..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium"
                />
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#151910] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={catFormIsFree}
                    onChange={(e) => setCatFormIsFree(e.target.checked)}
                    className="w-4 h-4 text-[#59662C] rounded"
                  />
                  <span>قسم متاح مجاناً 🆓</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={catFormIsHidden}
                    onChange={(e) => setCatFormIsHidden(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>إخفاء القسم 👁️🚫</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white font-black cursor-pointer shadow-md"
              >
                حفظ القسم 📁
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. CLINICAL PHARMACIST REVIEW MODAL */}
      {pharmacistModalDrug && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-[#1C2216] rounded-3xl border-2 border-teal-500 shadow-2xl p-6 text-right space-y-4"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-black">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black">مراجعة واعتماد الصيدلاني الإكلينيكي 🩺</h3>
              </div>
              <button
                type="button"
                onClick={() => setPharmacistModalDrug(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">الدواء المحدد:</span>
              <p className="text-sm font-black text-[#2F2B24] dark:text-white">
                {pharmacistModalDrug.nameEn} ({pharmacistModalDrug.nameAr})
              </p>
            </div>

            {/* Action Segmented Control */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPharmacistModalAction('send_review')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  pharmacistModalAction === 'send_review'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                إرسال للمراجعة السريرية ⏳
              </button>
              <button
                type="button"
                onClick={() => setPharmacistModalAction('verify')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  pharmacistModalAction === 'verify'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                اعتماد ومصادقة نهائية ✅
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">اسم الصيدلاني الإكلينيكي المراجع:*</label>
                <input
                  type="text"
                  value={pharmacistNameInput}
                  onChange={(e) => setPharmacistNameInput(e.target.value)}
                  placeholder="مثال: د. أحمد الكيلاني"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">المسمى الأكاديمي والمهني (Title & Board):*</label>
                <input
                  type="text"
                  value={pharmacistTitleInput}
                  onChange={(e) => setPharmacistTitleInput(e.target.value)}
                  placeholder="PharmD, BCPS - صيدلاني إكلينيكي معتمد"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">ملاحظات التدقيق السريري والتوصيات:*</label>
                <textarea
                  rows={3}
                  value={pharmacistNotesInput}
                  onChange={(e) => setPharmacistNotesInput(e.target.value)}
                  placeholder="ملاحظات الصيدلاني حول الجرعات السريرية وموانع الاستعمال..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPharmacistModalDrug(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handlePharmacistActionSubmit}
                className={`px-5 py-2.5 rounded-xl text-white font-black cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                  pharmacistModalAction === 'verify' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {pharmacistModalAction === 'verify' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد اعتماد الدواء رسمياً 🩺✅</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال لملف المراجعة 🩺⏳</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F2617] text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#59662C] flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#A8C24E] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
