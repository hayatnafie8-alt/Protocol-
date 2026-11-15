import React, { useState, useEffect, useRef } from 'react';
import {
  SkillItem,
  SkillStep,
} from '../data/clinicalSkillsData';
import {
  subscribeToClinicalSkills,
  toggleSkillVisibilityInCloud,
  replaceSkillPhotoInCloud,
  addSkillToCloud,
  updateSkillInCloud,
  deleteSkillFromCloud,
  resetSkillsInCloudToDefault,
} from '../services/clinicalSkillsCloudService';
import { SkillDiagramVisualizer } from './SkillDiagramVisualizer';
import { triggerControlledPrint, getWatermarkData } from '../data/printSecurity';
import { SubscriberSupervisorNotesModal } from './SubscriberSupervisorNotesModal';
import { SectionVideoModal } from './SectionVideoModal';
import { getAppSections, AppSection, getSectionVideos, subscribeToAppSectionsCloud } from '../data/sectionsManager';
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Stethoscope,
  Wrench,
  Activity,
  Layers,
  Info,
  Clock,
  RotateCcw,
  Film,
  MessageSquare,
  BookOpen,
  Lock,
  ArrowRight,
  HelpCircle,
  Scissors,
  Bookmark,
  Award,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Syringe,
  FileText,
  ExternalLink,
  Unlock,
} from 'lucide-react';
import {
  CustomWindow,
  getCustomWindows,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import { getIsSubscriptionSystemEnabled } from '../services/subscriptionSystemToggleService';

interface ClinicalSkillsViewProps {
  isAuthorAdmin: boolean;
  onOpenAdminLogin?: () => void;
  subscriberEmail?: string;
  onBackToHome?: () => void;
  onOpenAnesthesiaCalculator?: () => void;
  onOpenSubscribeModal?: () => void;
  isContentUnlocked?: boolean;
}

export const ClinicalSkillsView: React.FC<ClinicalSkillsViewProps> = ({
  isAuthorAdmin,
  onOpenAdminLogin,
  subscriberEmail,
  onBackToHome,
  onOpenAnesthesiaCalculator,
  onOpenSubscribeModal,
  isContentUnlocked = false,
}) => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'anesthesia' | 'rubber_dam' | 'suturing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  // Custom Windows for Skills Section (Requirement #3)
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>(() => getCustomWindows());
  const [selectedCustomWindow, setSelectedCustomWindow] = useState<CustomWindow | null>(null);

  useEffect(() => {
    const handleSyncWindows = () => {
      setCustomWindows(getCustomWindows());
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSyncWindows);
    window.addEventListener('storage', handleSyncWindows);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSyncWindows);
      window.removeEventListener('storage', handleSyncWindows);
    };
  }, []);

  // Active Skill Modal / Detail Viewer
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(null);

  // Video and Supervisor Notes modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [clinicalSkillsSection, setClinicalSkillsSection] = useState<AppSection | null>(() => {
    return getAppSections().find((s) => s.key === 'clinical_skills') || null;
  });

  // Real-Time Cloud Database Pub/Sub Subscription
  useEffect(() => {
    setIsLoadingCloud(true);
    setCloudSyncStatus('syncing');
    const unsubscribeSkills = subscribeToClinicalSkills(
      (cloudSkills) => {
        setSkills(cloudSkills);
        setIsLoadingCloud(false);
        setCloudSyncStatus('connected');
      },
      (err) => {
        console.error('[ClinicalSkillsView] Cloud DB error:', err);
        setIsLoadingCloud(false);
        setCloudSyncStatus('offline');
      }
    );

    const unsubscribeSections = subscribeToAppSectionsCloud((cloudSections) => {
      const sec = cloudSections.find((s) => s.key === 'clinical_skills') || null;
      setClinicalSkillsSection(sec);
    });

    return () => {
      unsubscribeSkills();
      unsubscribeSections();
    };
  }, []);

  // Synchronize active modal skill when cloud updates arrive
  useEffect(() => {
    if (activeSkill) {
      const refreshed = skills.find((s) => s.id === activeSkill.id);
      if (refreshed) {
        setActiveSkill(refreshed);
      }
    }
  }, [skills]);

  // Admin Add / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<'anesthesia' | 'rubber_dam' | 'suturing'>('anesthesia');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formIndication, setFormIndication] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'مبتدئ' | 'متوسط' | 'متقدم' | 'دقيق وحرج'>('متوسط');
  const [formEstimatedTime, setFormEstimatedTime] = useState('3 - 5 دقائق');
  const [formTargetNerve, setFormTargetNerve] = useState('');
  const [formLandmarks, setFormLandmarks] = useState('');
  const [formInsertionAngle, setFormInsertionAngle] = useState('');
  const [formPenetrationDepth, setFormPenetrationDepth] = useState('');
  const [formAspirationProtocol, setFormAspirationProtocol] = useState('');
  const [formDosageVolume, setFormDosageVolume] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formDiagramType, setFormDiagramType] = useState<SkillItem['diagramType']>('ianb');
  const [formDiagramCaption, setFormDiagramCaption] = useState('');
  const [formSteps, setFormSteps] = useState<Array<{ title: string; instruction: string; clinicalTip: string; dangerZoneWarning: string }>>([
    { title: 'الخطوة الأولى: تحديد المعالم والتحضير', instruction: '', clinicalTip: '', dangerZoneWarning: '' },
    { title: 'الخطوة الثانية: الإدخال والتنفيذ السريري', instruction: '', clinicalTip: '', dangerZoneWarning: '' },
  ]);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Dynamic Image Upload / Replacement State (Admin-Only)
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadSkillId, setTargetUploadSkillId] = useState<string | null>(null);
  const [isUploadingCardPhoto, setIsUploadingCardPhoto] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Direct trigger for Card thumbnail replacement
  const handleTriggerCardUpload = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetUploadSkillId(skillId);
    cardFileInputRef.current?.click();
  };

  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadSkillId) return;

    try {
      setIsUploadingCardPhoto(true);
      showNotification('جاري رفع ومعالجة الصورة إلى التخزين السحابي Cloud Storage... ☁️');
      const targetSkill = skills.find((s) => s.id === targetUploadSkillId);
      await replaceSkillPhotoInCloud(
        targetUploadSkillId,
        0,
        file,
        targetSkill?.clinicalPhotos
      );
      showNotification('تم رفع الصورة إلى Cloud Storage وتحديث قاعدة البيانات بنجاح ☁️📷');
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء رفع الصورة إلى السحابة.');
    } finally {
      setIsUploadingCardPhoto(false);
      setTargetUploadSkillId(null);
      if (cardFileInputRef.current) {
        cardFileInputRef.current.value = '';
      }
    }
  };

  // Direct handler for Detail View / Lightbox replacement
  const handleDetailPhotoReplace = async (photoIndex: number, newUrl: string) => {
    if (!activeSkill) return;
    try {
      showNotification('جاري تحديث الصورة في التخزين السحابي... ☁️');
      await replaceSkillPhotoInCloud(
        activeSkill.id,
        photoIndex,
        newUrl,
        activeSkill.clinicalPhotos
      );
      showNotification('تم تحديث وحفظ الصورة في قاعدة البيانات السحابية بنجاح ☁️📷');
    } catch (err: any) {
      alert(err?.message || 'فشل تحديث الصورة السحابية');
    }
  };

  // Filter skills based on subscriber visibility and filters
  const displayedSkills = skills.filter((skill) => {
    // Subscriber rule: only view skills where isHidden === false (or isVisible !== false)
    if (!isAuthorAdmin && (skill.isHidden === true || skill.isVisible === false)) {
      return false;
    }
    if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
      return false;
    }
    if (difficultyFilter !== 'all' && skill.difficulty !== difficultyFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = skill.title.toLowerCase().includes(q) || skill.titleEn.toLowerCase().includes(q);
      const matchDesc = skill.shortDesc.toLowerCase().includes(q) || skill.indication.toLowerCase().includes(q);
      const matchTarget = (skill.targetNerve || '').toLowerCase().includes(q);
      const matchSteps = skill.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.instruction.toLowerCase().includes(q)
      );
      return matchTitle || matchDesc || matchTarget || matchSteps;
    }
    return true;
  });

  // Admin toggling visibility directly in Cloud Database
  const handleToggleVisibility = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = skills.find((s) => s.id === id);
    if (!target) return;
    const currentIsHidden = target.isHidden === true || !target.isVisible;
    try {
      await toggleSkillVisibilityInCloud(id, currentIsHidden);
      showNotification(
        currentIsHidden
          ? `تم نشر وإظهار مهارة "${target.title}" للمشتركين سحابياً 👁️.`
          : `تم إخفاء مهارة "${target.title}" عن المشتركين وحفظها سحابياً 🔒.`
      );
    } catch (err: any) {
      alert(err?.message || 'فشل تحديث حالة الرؤية في السحابة');
    }
  };

  // Admin delete skill from Cloud Database
  const handleDeleteSkill = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteSkillFromCloud(id);
      if (activeSkill && activeSkill.id === id) {
        setActiveSkill(null);
      }
      showNotification(`تم حذف مهارة "${title}" من قاعدة البيانات السحابية بنجاح 🗑️.`);
    } catch (err: any) {
      alert(err?.message || 'فشل حذف المهارة من السحابة');
    }
  };

  // Reset to default in Cloud Database
  const handleResetDefaults = async () => {
    try {
      showNotification('جاري استعادة ومزامنة المهارات الافتراضية في السحابة... 🔄');
      await resetSkillsInCloudToDefault();
      showNotification('تمت استعادة المهارات السريرية الافتراضية في قاعدة البيانات السحابية بنجاح 🔄☁️.');
    } catch (err: any) {
      alert(err?.message || 'فشل استعادة المهارات الافتراضية سحابياً');
    }
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingSkillId(null);
    setFormCategory('anesthesia');
    setFormTitle('');
    setFormTitleEn('');
    setFormShortDesc('');
    setFormIndication('');
    setFormDifficulty('متوسط');
    setFormEstimatedTime('3 - 5 دقائق');
    setFormTargetNerve('');
    setFormLandmarks('');
    setFormInsertionAngle('');
    setFormPenetrationDepth('');
    setFormAspirationProtocol('');
    setFormDosageVolume('');
    setFormKeyPoints('');
    setFormDiagramType('ianb');
    setFormDiagramCaption('');
    setFormSteps([
      { title: 'الخطوة 1: التحضير وتحديد المعالم', instruction: '', clinicalTip: '', dangerZoneWarning: '' },
      { title: 'الخطوة 2: الإجراء السريري الدقيق', instruction: '', clinicalTip: '', dangerZoneWarning: '' },
    ]);
    setFormError('');
    setShowFormModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (skill: SkillItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSkillId(skill.id);
    setFormCategory(skill.category);
    setFormTitle(skill.title);
    setFormTitleEn(skill.titleEn);
    setFormShortDesc(skill.shortDesc);
    setFormIndication(skill.indication);
    setFormDifficulty(skill.difficulty);
    setFormEstimatedTime(skill.estimatedTime);
    setFormTargetNerve(skill.targetNerve || '');
    setFormLandmarks((skill.anatomicalLandmarks || []).join('\n'));
    setFormInsertionAngle(skill.insertionAngle || '');
    setFormPenetrationDepth(skill.penetrationDepth || '');
    setFormAspirationProtocol(skill.aspirationProtocol || '');
    setFormDosageVolume(skill.dosageVolume || '');
    setFormKeyPoints(skill.clinicalKeyPoints.join('\n'));
    setFormDiagramType(skill.diagramType);
    setFormDiagramCaption(skill.diagramCaption);
    setFormSteps(
      skill.steps.map((st) => ({
        title: st.title,
        instruction: st.instruction,
        clinicalTip: st.clinicalTip || '',
        dangerZoneWarning: st.dangerZoneWarning || '',
      }))
    );
    setFormError('');
    setShowFormModal(true);
  };

  // Save form (Add or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('يرجى إدخال اسم المهارة بالعربية.');
      return;
    }
    if (!formShortDesc.trim()) {
      setFormError('يرجى إدخال وصف ملخص للمهارة.');
      return;
    }

    const landmarksArray = formLandmarks
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const keyPointsArray = formKeyPoints
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const stepsArray: SkillStep[] = formSteps
      .filter((st) => st.title.trim() && st.instruction.trim())
      .map((st, idx) => ({
        stepNumber: idx + 1,
        title: st.title.trim(),
        instruction: st.instruction.trim(),
        clinicalTip: st.clinicalTip.trim() || undefined,
        dangerZoneWarning: st.dangerZoneWarning.trim() || undefined,
      }));

    if (stepsArray.length === 0) {
      setFormError('يرجى إضافة خطوة سريرية واحدة على الأقل مع الشرح.');
      return;
    }

    const categoryLabelMap = {
      anesthesia: 'طرق التخدير السريري (Local Anesthesia)',
      rubber_dam: 'طرق تركيب الربر دام (Rubber Dam Isolation)',
      suturing: 'طرق الخياطة الجراحية المهمة (Essential Suturing)',
    };

    if (editingSkillId) {
      // Update in Cloud
      updateSkillInCloud(editingSkillId, {
        category: formCategory,
        categoryLabel: categoryLabelMap[formCategory],
        title: formTitle.trim(),
        titleEn: formTitleEn.trim() || formTitle.trim(),
        shortDesc: formShortDesc.trim(),
        indication: formIndication.trim(),
        difficulty: formDifficulty,
        estimatedTime: formEstimatedTime.trim() || '3 - 5 دقائق',
        targetNerve: formTargetNerve.trim() || undefined,
        anatomicalLandmarks: landmarksArray.length > 0 ? landmarksArray : undefined,
        insertionAngle: formInsertionAngle.trim() || undefined,
        penetrationDepth: formPenetrationDepth.trim() || undefined,
        aspirationProtocol: formAspirationProtocol.trim() || undefined,
        dosageVolume: formDosageVolume.trim() || undefined,
        clinicalKeyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['الالتزام بتعليمات السلامة والتعقيم التام.'],
        diagramType: formDiagramType,
        diagramCaption: formDiagramCaption.trim() || formTitle.trim(),
        steps: stepsArray,
      })
        .then(() => {
          showNotification(`تم تعديل مهارة "${formTitle}" وتحديثها سحابياً بنجاح ☁️.`);
        })
        .catch((err) => {
          console.error(err);
          showNotification('حدث خطأ أثناء حفظ التعديل في السحابة.');
        });
    } else {
      // Add in Cloud
      addSkillToCloud({
        category: formCategory,
        categoryLabel: categoryLabelMap[formCategory],
        title: formTitle.trim(),
        titleEn: formTitleEn.trim() || formTitle.trim(),
        shortDesc: formShortDesc.trim(),
        indication: formIndication.trim(),
        difficulty: formDifficulty,
        estimatedTime: formEstimatedTime.trim() || '3 - 5 دقائق',
        isVisible: true,
        isHidden: false,
        isSystem: false,
        targetNerve: formTargetNerve.trim() || undefined,
        anatomicalLandmarks: landmarksArray.length > 0 ? landmarksArray : undefined,
        insertionAngle: formInsertionAngle.trim() || undefined,
        penetrationDepth: formPenetrationDepth.trim() || undefined,
        aspirationProtocol: formAspirationProtocol.trim() || undefined,
        dosageVolume: formDosageVolume.trim() || undefined,
        clinicalKeyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['الالتزام بتعليمات السلامة والتعقيم التام.'],
        diagramType: formDiagramType,
        diagramCaption: formDiagramCaption.trim() || formTitle.trim(),
        steps: stepsArray,
      })
        .then(() => {
          showNotification(`تمت إضافة مهارة جديدة "${formTitle}" وتوثيقها سحابياً بنجاح ☁️.`);
        })
        .catch((err) => {
          console.error(err);
          showNotification('حدث خطأ أثناء إضافة المهارة للسحابة.');
        });
    }

    setShowFormModal(false);
  };

  // Secure print trigger
  const handlePrintSkill = (skill: SkillItem) => {
    triggerControlledPrint({
      onBefore: () => {
        showNotification('جاري إعداد نسخة الطباعة المؤمنة مع العلامة المائية...');
      },
    });
  };

  const watermark = getWatermarkData();

  // Navigation inside detail view (next/prev)
  const currentSkillIndex = activeSkill ? displayedSkills.findIndex((s) => s.id === activeSkill.id) : -1;
  const hasNext = currentSkillIndex >= 0 && currentSkillIndex < displayedSkills.length - 1;
  const hasPrev = currentSkillIndex > 0;

  const handleNextSkill = () => {
    if (hasNext) {
      setActiveSkill(displayedSkills[currentSkillIndex + 1]);
    }
  };

  const handlePrevSkill = () => {
    if (hasPrev) {
      setActiveSkill(displayedSkills[currentSkillIndex - 1]);
    }
  };

  if (!isAuthorAdmin && (!clinicalSkillsSection || clinicalSkillsSection.isVisible !== true)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-amber-50 dark:bg-[#1E2417] border-2 border-amber-300 dark:border-amber-700 text-center space-y-4 shadow-xl animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-black text-[#2F2B24] dark:text-white">
          أطلس المهارات السريرية مخفي حالياً
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          هذا القسم محجوب حالياً بأمر المشرفة د. حياة نافع ومخصص للمشرف العام فقط. لا يظهر هذا القسم لأي من المشتركين (القدماء والجدد) حتى يتم نشره رسمياً من قبل المشرفة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Dynamic Watermark for Secure Content Protection */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.03] select-none flex flex-wrap gap-24 p-12 justify-center items-center rotate-[-25deg]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`wm_${i}`} className="text-center font-mono text-xs text-neutral-900 dark:text-neutral-100">
            <p className="font-bold tracking-wider">{watermark.subscriberName}</p>
            <p>{watermark.subscriberCode} | {watermark.affiliation}</p>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#2F2B24] dark:bg-[#1E2417] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Hidden File Input for Card Image Replacement (Admin Only) */}
      {isAuthorAdmin && (
        <input
          type="file"
          ref={cardFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleCardFileChange}
        />
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#596628] via-[#485320] to-[#2E3615] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>أطلس المهارات السريرية 4K HD</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black backdrop-blur-md flex items-center gap-1.5 border ${
                  cloudSyncStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                    : 'bg-neutral-500/20 text-neutral-300 border-neutral-400/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    cloudSyncStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {cloudSyncStatus === 'connected'
                    ? 'قاعدة بيانات سحابية متزامنة (Live Pub/Sub)'
                    : 'جاري الاتصال بالسحابة...'}
                </span>
              </span>
              {isAuthorAdmin && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>لوحة تحكم المشرف (Admin Controls)</span>
                  </span>
                  {clinicalSkillsSection?.isVisible === false && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>🔒 القسم مخفي عن المشتركين</span>
                    </span>
                  )}
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              أطلس المهارات السريرية التفاعلية
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-2xl font-medium leading-relaxed">
              الدليل العملي خطوة بخطوة لطرق التخدير السريري الفموي، تقنيات عزل الربر دام المتقدمة، وفنون الخياطة الجراحية مع المخططات التشريحية عالية الدقة 4K.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isAuthorAdmin ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2.5 rounded-2xl bg-white text-[#596628] hover:bg-amber-50 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة مهارة جديدة</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  title="استعادة المهارات الافتراضية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>حساب مشترك معتمد ومحمي</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              title="كتابة ملاحظة أو استفسار سريري للمشرفة حول المهارات السريرية"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>ملاحظة للمشرف ✍️</span>
            </button>

            {(() => {
              const csVideos = getSectionVideos(clinicalSkillsSection);
              if (!csVideos.length && !isAuthorAdmin) return null;
              return (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  title={csVideos.length > 0 ? `مشاهدة فيديوهات أطلس المهارات (${csVideos.length})` : 'إضافة فيديو لأطلس المهارات'}
                >
                  <Film className="w-4 h-4" />
                  <span>{csVideos.length > 1 ? `فيديوهات المهارات (${csVideos.length}) 🎥` : 'فيديو المهارات 🎥'}</span>
                </button>
              );
            })()}

            <button
              type="button"
              onClick={() => triggerControlledPrint()}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              title="طباعة الدليل مع العلامة المائية الرسمية"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة معتمدة</span>
            </button>
          </div>
        </div>

        {/* Quick Category Counters */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-white/80">إجمالي المهارات:</span>
            <span className="font-black text-sm text-white">{skills.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-white/80">التخدير السريري:</span>
            <span className="font-black text-sm text-amber-200">
              {skills.filter((s) => s.category === 'anesthesia').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-white/80">عزل الربر دام:</span>
            <span className="font-black text-sm text-sky-200">
              {skills.filter((s) => s.category === 'rubber_dam').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-white/80">الخياطة الجراحية:</span>
            <span className="font-black text-sm text-emerald-200">
              {skills.filter((s) => s.category === 'suturing').length}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs & Filter Bar */}
      <div className="bg-white dark:bg-[#1A2014] rounded-3xl p-4 sm:p-5 border border-[#596628]/20 dark:border-[#384524] shadow-sm space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm font-black">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-[#596628] text-white shadow-md'
                : 'bg-neutral-100 dark:bg-[#20271A] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>جميع المهارات ({displayedSkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('anesthesia')}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedCategory === 'anesthesia'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-amber-500" />
            <span>A. طرق التخدير السريري (5 تقنيات)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('rubber_dam')}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedCategory === 'rubber_dam'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 hover:bg-sky-100'
            }`}
          >
            <Wrench className="w-4 h-4 text-sky-500" />
            <span>B. طرق تركيب الربر دام (3 تقنيات)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('suturing')}
            className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedCategory === 'suturing'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Scissors className="w-4 h-4 text-emerald-500" />
            <span>C. طرق الخياطة الجراحية (4 تقنيات)</span>
          </button>
        </div>

        {/* Search & Difficulty Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المعالم التشريحية، زوايا الإبرة، أو نوع الخياطة..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#596628]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl text-xs sm:text-sm bg-neutral-50 dark:bg-[#12160E] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#596628]"
            >
              <option value="all">جميع المستويات</option>
              <option value="مبتدئ">مبتدئ</option>
              <option value="متوسط">متوسط</option>
              <option value="متقدم">متقدم</option>
              <option value="دقيق وحرج">دقيق وحرج</option>
            </select>

            {isAuthorAdmin && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 whitespace-nowrap">
                {skills.filter((s) => s.isHidden === true || !s.isVisible).length} مهارة مخفية
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Local Anesthesia Maximum Dose & Safety Calculator Banner */}
      {(selectedCategory === 'all' || selectedCategory === 'anesthesia') && onOpenAnesthesiaCalculator && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-amber-100 flex items-center justify-center shrink-0">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  Clinical Safety Tool
                </span>
                <span className="text-[10px] font-bold bg-amber-950/40 px-2 py-0.5 rounded-md">
                  حاسبة الجرعة القصوى للأمبولات
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                حاسبة جرعات وأمان التخدير الموضعي (LA Safety Calculator)
              </h3>
              <p className="text-xs text-amber-100 leading-relaxed max-w-xl">
                احسب بدقة الحد الأقصى الآمن للأمبولات بحسب وزن المريض وأمراض القلب والكلى والكبد وحساسية السلفيت.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAnesthesiaCalculator}
            className="px-5 py-2.5 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>تشغيل الحاسبة السريرية</span>
          </button>
        </div>
      )}

      {/* Dynamic Supervisor Custom Windows for Skills Section (Requirement #3) */}
      {customWindows.filter((w) => w.targetLocation === 'skills' && (!w.isHidden || isAuthorAdmin)).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#596628]/20 dark:border-[#384524]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                بطاقات ونوافذ قسم مهاراتي المعتمدة (Skills Cards & Windows)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A4BF46] border border-[#596628]/30">
              {customWindows.filter((w) => w.targetLocation === 'skills' && (!w.isHidden || isAuthorAdmin)).length} بطاقة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customWindows
              .filter((w) => w.targetLocation === 'skills' && (!w.isHidden || isAuthorAdmin))
              .map((cWin, idx) => {
                const isLocked = getIsSubscriptionSystemEnabled() && cWin.requiresSubscription && !isAuthorAdmin && !isContentUnlocked;
                return (
                  <div
                    key={`${cWin.id}_${idx}`}
                    onClick={() => {
                      if (isLocked && onOpenSubscribeModal) {
                        onOpenSubscribeModal();
                      } else {
                        setSelectedCustomWindow(cWin);
                      }
                    }}
                    className={`p-5 rounded-3xl bg-gradient-to-br from-[#596628]/10 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between group ${
                      cWin.isHidden
                        ? 'border-dashed border-neutral-400 opacity-75'
                        : 'border-[#596628]/40 hover:border-[#596628]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#596628] to-[#D4AF37] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          {cWin.contentType === 'checklist' ? (
                            <FileText className="w-5 h-5 text-white" />
                          ) : cWin.contentType === 'link' ? (
                            <ExternalLink className="w-5 h-5 text-white" />
                          ) : (
                            <Stethoscope className="w-5 h-5 text-white" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isLocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>🔒 يتطلب كود</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                              <span>🔓 متاح</span>
                            </span>
                          )}
                          {cWin.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A4BF46]">
                              {cWin.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-neutral-900 dark:text-white group-hover:text-[#596628] dark:group-hover:text-[#A4BF46] transition-colors">
                          {cWin.title}
                        </h4>
                        {cWin.subtitle && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {cWin.subtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {cWin.content}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-[#596628] dark:text-[#A4BF46]">
                      <span>عرض المحتوى الكامل</span>
                      <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Grid of Skill Cards */}
      {isLoadingCloud && skills.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#1A2014] rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <div className="w-12 h-12 border-4 border-[#596628] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            جاري المزامنة مع قاعدة البيانات السحابية (Cloud Database Live Sync)...
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            يتم جلب أحدث بيانات المهارات السريرية والصور الفائقة الدقة مباشرة من قاعدة البيانات ومزامنتها لحظياً.
          </p>
        </div>
      ) : displayedSkills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1A2014] rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <Info className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-700 dark:text-neutral-300">
            لا توجد مهارات مطابقة لمعايير البحث الحالية
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            جرّب تغيير كلمات البحث أو إعادة تعيين تصنيف المهارات لعرض كل المحتوى.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSkills.map((skill, skIdx) => {
            const isHidden = skill.isHidden === true || !skill.isVisible;

            return (
              <div
                key={`${skill.id}_${skIdx}`}
                onClick={() => setActiveSkill(skill)}
                className={`relative rounded-3xl overflow-hidden bg-white dark:bg-[#1A2014] border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between group ${
                  isHidden
                    ? 'border-amber-400 dark:border-amber-700 bg-amber-50/30'
                    : 'border-[#596628]/25 dark:border-[#384524] hover:border-[#596628]'
                }`}
              >
                {/* Card Top: Badges and Admin Controls */}
                <div className="p-5 pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          skill.category === 'anesthesia'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : skill.category === 'rubber_dam'
                            ? 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {skill.category === 'anesthesia'
                          ? 'تخدير موضعي'
                          : skill.category === 'rubber_dam'
                          ? 'ربر دام'
                          : 'خياطة جراحية'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {skill.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-neutral-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {skill.estimatedTime}
                      </span>
                    </div>

                    {/* Admin Hidden Badge & Toggles */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isHidden && isAuthorAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1 shadow-2xs">
                          <span>🔒 مخفي عن المشتركين</span>
                        </span>
                      )}

                      {isAuthorAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleVisibility(skill.id, e)}
                            className={`p-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isHidden
                                ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                                : 'bg-white dark:bg-[#1E2417] text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                            }`}
                            title={isHidden ? 'إظهار للمشتركين' : 'إخفاء عن المشتركين'}
                          >
                            {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(skill, e)}
                            className="p-1.5 rounded-xl bg-white dark:bg-[#1E2417] text-neutral-600 border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
                            title="تعديل المهارة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSkill(skill.id, skill.title, e)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"
                            title="حذف المهارة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white group-hover:text-[#596628] transition-colors line-clamp-1">
                      {skill.title}
                    </h3>
                    <p className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                      {skill.titleEn}
                    </p>
                  </div>

                  <p className="text-xs text-[#736C5F] dark:text-[#A7A08E] line-clamp-2 leading-relaxed">
                    {skill.shortDesc}
                  </p>
                </div>

                {/* Real Clinical Intraoral Photo Card Thumbnail (Full Aspect Ratio & Clean Overlays) */}
                <div className="px-5 py-2">
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700/80 bg-neutral-950 dark:bg-black relative group-hover:border-[#596628]/60 transition-all aspect-video flex items-center justify-center">
                    <img
                      src={skill.primaryPhotoUrl || (skill.clinicalPhotos && skill.clinicalPhotos[0]?.url)}
                      alt={skill.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full max-h-[450px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* 4K Real Clinical Photo Badge (Subtle Clean Overlay) */}
                    <div
                      className="absolute z-10 text-white flex items-center gap-1.5 shadow-md border border-white/15 pointer-events-none"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 10,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '11px',
                      }}
                    >
                      <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="font-bold leading-none">📷 صورة سريرية حقيقية 4K</span>
                    </div>

                    {/* Admin-Only Dynamic Image Replacement Trigger (Subtle Clean Overlay) */}
                    {isAuthorAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleTriggerCardUpload(skill.id, e)}
                        disabled={isUploadingCardPhoto && targetUploadSkillId === skill.id}
                        className="absolute z-10 text-white flex items-center gap-1 shadow-md border border-white/15 cursor-pointer transition-all hover:bg-black/85 hover:border-amber-400 hover:scale-105 active:scale-95 pointer-events-auto"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          zIndex: 10,
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(4px)',
                          WebkitBackdropFilter: 'blur(4px)',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '11px',
                        }}
                        title="استبدال صورة هذه المهارة السريرية بصورة من جهازك أو الكاميرا"
                      >
                        <Camera className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="font-bold leading-none">
                          {isUploadingCardPhoto && targetUploadSkillId === skill.id
                            ? 'معالجة...'
                            : '📷 استبدال الصورة'}
                        </span>
                      </button>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5 text-white text-[11px] font-bold pointer-events-none">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-4 h-4 text-amber-300" />
                        <span>انقر لفحص المعالم السريرية والزووم 4K</span>
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Summary points & Open button */}
                <div className="p-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
                  {skill.category === 'anesthesia' && skill.targetNerve && (
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-[#151A10] p-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <span className="font-bold text-[#596628] dark:text-[#A8C24E]">العصب المستهدف: </span>
                      <span className="line-clamp-1">{skill.targetNerve}</span>
                    </div>
                  )}

                  {skill.category === 'rubber_dam' && skill.recommendedClamps && (
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-[#151A10] p-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <span className="font-bold text-sky-600 dark:text-sky-400">الكلامبات الموصى بها: </span>
                      <span>{skill.recommendedClamps.join('، ')}</span>
                    </div>
                  )}

                  {skill.category === 'suturing' && skill.recommendedMaterial && (
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-[#151A10] p-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">الخيط والإبرة: </span>
                      <span>{skill.recommendedMaterial}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-neutral-500">
                      {skill.steps.length} خطوات سريرية موثقة
                    </span>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-[#596628] text-white font-black hover:bg-[#485320] transition-colors flex items-center gap-1.5 text-xs shadow-xs"
                    >
                      <span>عرض الدليل السريري</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* FULL-SCREEN RESPONSIVE SKILL CLINICAL VIEWER                */}
      {/* ============================================================ */}
      {activeSkill && (
        <div
          className="fixed inset-0 z-50 w-full h-full bg-white dark:bg-[#141712] overflow-y-auto flex flex-col text-[#2F2B24] dark:text-[#F3EFE6] animate-in fade-in duration-200"
        >
          {/* Ultra-Compact Modern Header Bar (height: 48px, sticky top-0) */}
          <header
            style={{
              height: '48px',
              padding: '0 12px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e5e7eb',
              background: '#ffffff',
              position: 'sticky',
              top: 0,
              zIndex: 40,
            }}
            className="w-full dark:!bg-[#1A2014] dark:!border-[#384524] shadow-xs shrink-0 select-none"
          >
            {/* Start Side: Home Button (🏠) + Single-Line Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden" style={{ flexDirection: 'row' }}>
              {/* Home Button (🏠) - standardized 32x32 */}
              <button
                type="button"
                onClick={() => {
                  setActiveSkill(null);
                  onBackToHome?.();
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: '4px',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="rounded-lg bg-[#596628] hover:bg-[#485320] text-white shadow-2xs transition-colors cursor-pointer active:scale-95 shrink-0"
                title="العودة للصفحة الرئيسية للبرنامج (🏠 Home)"
                aria-label="الرئيسية"
              >
                <span className="leading-none text-[15px]">🏠</span>
              </button>

              {/* Category chip (compact) */}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E] shrink-0">
                {activeSkill.categoryLabel}
              </span>

              {/* Single-Line Title (nowrap, ellipsis, 0.95rem, 600 weight) */}
              <h2
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                }}
                className="text-[#2F2B24] dark:text-white leading-normal flex-1"
                title={activeSkill.title}
              >
                {activeSkill.title}
              </h2>

              {!activeSkill.isVisible && isAuthorAdmin && (
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  🔒 مخفي
                </span>
              )}
            </div>

            {/* End Side: Action Buttons (Print, Hide/Show, Edit, Close ✕) */}
            <div className="flex items-center gap-1.5 shrink-0" style={{ flexDirection: 'row' }}>
              {/* Print Button (32x32) */}
              <button
                type="button"
                onClick={() => handlePrintSkill(activeSkill)}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: '4px',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
                title="طباعة الدليل مع العلامة المائية"
                aria-label="طباعة الدليل"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Admin Actions (32x32) */}
              {isAuthorAdmin && (
                <>
                  {/* Hide / Show Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(activeSkill.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '4px',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className={`rounded-lg transition-colors cursor-pointer shrink-0 ${
                      !activeSkill.isVisible
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200 border border-amber-300 dark:border-amber-800'
                    }`}
                    title={!activeSkill.isVisible ? 'إظهار للمشتركين' : 'إخفاء عن المشتركين'}
                    aria-label={!activeSkill.isVisible ? 'إظهار للمشتركين' : 'إخفاء عن المشتركين'}
                  >
                    {!activeSkill.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(activeSkill)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '4px',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
                    title="تعديل المهارة"
                    aria-label="تعديل المهارة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Close Button (✕) (32x32) */}
              <button
                type="button"
                onClick={() => setActiveSkill(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: '4px',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
                title="إغلاق العرض (✕)"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Full-width Responsive Body Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
            {/* REQUIREMENT: High-Resolution Real Clinical Intraoral Photography Gallery Card with Pinch-to-Zoom / Lightbox BEFORE the written step-by-step text */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-5 rounded-full bg-[#596628]" />
                  <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-500" />
                    <span>الأطلس الفوتوغرافي السريري الحقيقي (Clinical Intraoral Photography)</span>
                  </h3>
                </div>
                <span className="text-xs text-neutral-500 font-bold hidden sm:inline">
                  انقر على الصورة لتشغيل وضع الفحص المكبر عالي الدقة (Pinch-to-zoom Lightbox)
                </span>
              </div>

              <div className="rounded-3xl overflow-hidden border-2 border-[#596628]/30 bg-neutral-900/90 p-2 sm:p-4 shadow-xl">
                <SkillDiagramVisualizer
                  skill={activeSkill}
                  className="w-full"
                  showGalleryControls={true}
                  isAdmin={isAuthorAdmin}
                  onReplacePhoto={handleDetailPhotoReplace}
                />
              </div>
            </section>

            {/* Clinical Quick Parameters Card */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSkill.category === 'anesthesia' && (
                <>
                  {activeSkill.targetNerve && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">العصب المستهدف</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.targetNerve}
                      </p>
                    </div>
                  )}
                  {activeSkill.needleGaugeLength && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">الإبرة الموصى بها</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.needleGaugeLength}
                      </p>
                    </div>
                  )}
                  {activeSkill.insertionAngle && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">زاوية الإدخال</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.insertionAngle}
                      </p>
                    </div>
                  )}
                  {activeSkill.penetrationDepth && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">عمق الاختراق</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.penetrationDepth}
                      </p>
                    </div>
                  )}
                  {activeSkill.aspirationProtocol && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>بروتوكول السحب السلبي وتفادي الارتشاف الدموي (Aspiration Protocol)</span>
                      </span>
                      <p className="text-xs sm:text-sm font-black text-rose-900 dark:text-rose-200">
                        {activeSkill.aspirationProtocol}
                      </p>
                    </div>
                  )}
                  {activeSkill.dosageVolume && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">الجرعة ومعدل الحقن</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.dosageVolume}
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeSkill.category === 'rubber_dam' && (
                <>
                  {activeSkill.recommendedClamps && (
                    <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">الكلامبات الأساسية الموصى بها</span>
                      <p className="text-xs sm:text-sm font-black text-sky-900 dark:text-sky-200">
                        {activeSkill.recommendedClamps.join(' • ')}
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-500">مدة التركيب المتوقعة</span>
                    <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                      {activeSkill.estimatedTime}
                    </p>
                  </div>
                </>
              )}

              {activeSkill.category === 'suturing' && (
                <>
                  {activeSkill.recommendedMaterial && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">الخيط والإبرة</span>
                      <p className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                        {activeSkill.recommendedMaterial}
                      </p>
                    </div>
                  )}
                  {activeSkill.biteDistance && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">مسافة أخذ العضّة من الحافة</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.biteDistance}
                      </p>
                    </div>
                  )}
                  {activeSkill.knotTechnique && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500">عقدة التثبيت</span>
                      <p className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                        {activeSkill.knotTechnique}
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Anatomical Landmarks Checklist */}
            {activeSkill.anatomicalLandmarks && activeSkill.anatomicalLandmarks.length > 0 && (
              <section className="p-5 rounded-3xl bg-neutral-50 dark:bg-[#151A10] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#596628]" />
                  <span>المعالم التشريحية الإلزامية قبل الحقن (Anatomical Landmarks):</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#524B40] dark:text-[#C5BFB2]">
                  {activeSkill.anatomicalLandmarks.map((lm, idx) => (
                    <li key={`landmark_${activeSkill.id}_${idx}`} className="flex items-start gap-2 bg-white dark:bg-[#1E2417] p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="w-5 h-5 rounded-full bg-[#596628]/15 text-[#596628] font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{lm}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Rubber Dam 5 Isolation Phases (If applicable) */}
            {activeSkill.isolationPhases && activeSkill.isolationPhases.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>المراحل الخمس المتسلسلة لتركيب الربر دام (Punching, Clamping, Flossing, Inverting, Frame):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {activeSkill.isolationPhases.map((phase, pIdx) => (
                    <div key={`iso_phase_${activeSkill.id}_${phase.phaseName}_${pIdx}`} className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-black text-[10px] flex items-center justify-center mb-1">
                          {pIdx + 1}
                        </span>
                        <h5 className="text-xs font-black text-sky-950 dark:text-sky-200">{phase.phaseName}</h5>
                        <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-1 leading-snug">{phase.action}</p>
                      </div>
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50">
                        نقطة حرجة: {phase.criticalPoint}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Step-by-Step Written Clinical Guide */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-[#596628]" />
                <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                  خطوات التنفيذ السريري خطوة بخطوة (Step-by-Step Procedure)
                </h3>
              </div>

              <div className="space-y-4">
                {activeSkill.steps.map((st, sIdx) => (
                  <div
                    key={`skill_step_${st.stepNumber}_${sIdx}`}
                    className="p-5 rounded-3xl bg-neutral-50 dark:bg-[#151A10] border border-neutral-200 dark:border-neutral-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-2xl bg-[#596628] text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {st.stepNumber}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white">
                          {st.title}
                        </h4>
                      </div>
                      {st.visualDetail && (
                        <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white dark:bg-[#1E2417] px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 hidden sm:inline-block">
                          {st.visualDetail}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#524B40] dark:text-[#C5BFB2] leading-relaxed pr-9">
                      {st.instruction}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-9 pt-1">
                      {st.clinicalTip && (
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300">نصيحة سريرية ذهبية:</span>
                            <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-snug">{st.clinicalTip}</p>
                          </div>
                        </div>
                      )}

                      {st.dangerZoneWarning && (
                        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-rose-800 dark:text-rose-300">تحذير منطقة الخطر:</span>
                            <p className="text-[11px] text-rose-900 dark:text-rose-200 leading-snug">{st.dangerZoneWarning}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Clinical Key Points / Pearls */}
            {activeSkill.clinicalKeyPoints && activeSkill.clinicalKeyPoints.length > 0 && (
              <section className="p-6 rounded-3xl bg-gradient-to-br from-[#596628]/10 via-amber-50/40 to-transparent dark:from-[#20271A] dark:to-[#171A12] border border-[#596628]/30 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-[#596628] dark:text-[#A8C24E] flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>ملاحظات الأمان السريري وتفادي الفشل (Clinical Pearls):</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#524B40] dark:text-[#C5BFB2]">
                  {activeSkill.clinicalKeyPoints.map((kp, idx) => (
                    <li key={`keypoint_${activeSkill.id}_${idx}`} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#596628] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{kp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>

          {/* Sticky Bottom Navigation Bar & Home Button */}
          <footer className="sticky bottom-0 z-30 w-full px-3 py-2 sm:px-6 sm:py-2.5 bg-white/95 dark:bg-[#1A2014]/95 backdrop-blur-md border-t border-neutral-200 dark:border-[#384524] flex items-center justify-between gap-3 shadow-lg shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={handlePrevSkill}
                className="px-3.5 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>المهارة السابقة</span>
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={handleNextSkill}
                className="px-3.5 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>المهارة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveSkill(null);
                  onBackToHome?.();
                }}
                className="px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">الرئيسية</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrintSkill(activeSkill)}
                className="px-4 py-2 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الدليل</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSkill(null)}
                className="px-4 py-2 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-300 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMIN ADD / EDIT SKILL MODAL                                 */}
      {/* ============================================================ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A2014] rounded-3xl shadow-2xl border-2 border-[#596628]/40 dark:border-[#384524] overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#596628]/15 via-white to-amber-500/10 dark:from-[#20271A] dark:to-[#171A12] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628] text-white">
                  المشرف العام (Admin Mode)
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white">
                  {editingSkillId ? 'تعديل المهارة السريرية' : 'إضافة مهارة سريرية جديدة للأطلس'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">التصنيف الأساسي *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="anesthesia">A. طرق التخدير السريري (Local Anesthesia)</option>
                    <option value="rubber_dam">B. طرق تركيب الربر دام (Rubber Dam)</option>
                    <option value="suturing">C. طرق الخياطة الجراحية (Suturing)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">مستوى الصعوبة</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                    <option value="دقيق وحرج">دقيق وحرج</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">اسم المهارة بالعربية *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: تخدير العصب السنخي السفلي (IANB)"
                    className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Inferior Alveolar Nerve Block"
                    className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">الوصف المختصر *</label>
                <textarea
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="وصف سريري سريع يظهر على كرت المهارة..."
                  className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">دواعي الاستعمال السريرية (Indications)</label>
                <input
                  type="text"
                  value={formIndication}
                  onChange={(e) => setFormIndication(e.target.value)}
                  placeholder="حشوات الكومبوزيت، علاج العصب، الخلع الجراحي..."
                  className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              {/* Specifics based on Category */}
              {formCategory === 'anesthesia' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <h4 className="font-black text-amber-800 dark:text-amber-300 text-xs">معايير التخدير الموضعي</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-neutral-600 dark:text-neutral-300">العصب المستهدف</label>
                      <input
                        type="text"
                        value={formTargetNerve}
                        onChange={(e) => setFormTargetNerve(e.target.value)}
                        placeholder="العصب السنخي السفلي والعصب اللساني"
                        className="w-full p-2 rounded-xl bg-white dark:bg-[#1A2014] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-600 dark:text-neutral-300">زاوية الإدخال وعمق الاختراق</label>
                      <input
                        type="text"
                        value={formInsertionAngle}
                        onChange={(e) => setFormInsertionAngle(e.target.value)}
                        placeholder="من الضواحك المقابلة، عمق 20-25 ملم"
                        className="w-full p-2 rounded-xl bg-white dark:bg-[#1A2014] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-neutral-600 dark:text-neutral-300">بروتوكول السحب السلبي والأمان</label>
                      <input
                        type="text"
                        value={formAspirationProtocol}
                        onChange={(e) => setFormAspirationProtocol(e.target.value)}
                        placeholder="سحب سلبي في مستويين متعامدين لتفادي الحقن الوعائي"
                        className="w-full p-2 rounded-xl bg-white dark:bg-[#1A2014] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">المعالم التشريحية (سطر لكل معلم)</label>
                <textarea
                  rows={2}
                  value={formLandmarks}
                  onChange={(e) => setFormLandmarks(e.target.value)}
                  placeholder="الثلمة التاجية (Coronoid notch)&#10;الرباط الجناحي الفكي (Pterygomandibular raphe)"
                  className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              {/* Real Clinical Photography Asset Selector */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span>الصورة السريرية الحقيقية المعتمدة (Clinical Intraoral Photo)</span>
                </label>
                <select
                  value={formDiagramType}
                  onChange={(e) => setFormDiagramType(e.target.value as any)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#12160E] border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="ianb">صورة سريرية 4K: معالم IANB والتجويف الجناحي الفكي (Mandibular Ramus)</option>
                  <option value="buccal">صورة سريرية 4K: الميزاب الشدقي خلف الطاحن الأخير (Buccal Fold)</option>
                  <option value="mental">صورة سريرية 4K: جس وحقن الثقبة الذقنية (Mental Foramen)</option>
                  <option value="palatine">صورة سريرية 4K: تخدير الحنك الصلب وحليمة القواطع بالضغط (Palatine Block)</option>
                  <option value="infiltration">صورة سريرية 4K: التخدير الارتشاحي الموضعي فوق السمحاق (Infiltration)</option>
                  <option value="rubber_dam_wingless">صورة سريرية 4K: عزل الربر دام بكلامب غير مجنح W8A وخيط أمان</option>
                  <option value="rubber_dam_winged">صورة سريرية 4K: عزل الربر دام المتزامن بكلامب مجنح وإطار معدني</option>
                  <option value="rubber_dam_split">صورة سريرية 4K: العزل المخصص ورفع الحواف اللثوية العميقة (Split Dam)</option>
                  <option value="suture_interrupted">صورة سريرية 4K: الخياطة الجراحية المتقطعة البسيطة بخيط حرير (3-0 Silk)</option>
                  <option value="suture_continuous">صورة سريرية 4K: الخياطة الجراحية المتصلة القافلة (Continuous Locking)</option>
                  <option value="suture_mattress">صورة سريرية 4K: الخياطة المراتبية الأفقية وقلب الحواف (Mattress Suture)</option>
                  <option value="suture_figure8">صورة سريرية 4K: خياطة الرقم 8 لتثبيت سنخ الخلع (Figure-of-Eight)</option>
                </select>
              </div>

              {/* Dynamic Steps Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-neutral-800 dark:text-white">خطوات التنفيذ السريري ({formSteps.length})</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSteps([
                        ...formSteps,
                        { title: `الخطوة ${formSteps.length + 1}`, instruction: '', clinicalTip: '', dangerZoneWarning: '' },
                      ])
                    }
                    className="text-xs font-bold text-[#596628] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة خطوة أخرى</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formSteps.map((st, idx) => (
                    <div key={`form_step_${idx}`} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#151A10] border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#596628]">الخطوة #{idx + 1}</span>
                        {formSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormSteps(formSteps.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                          >
                            حذف الخطوة
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const cp = [...formSteps];
                          cp[idx].title = e.target.value;
                          setFormSteps(cp);
                        }}
                        placeholder="عنوان الخطوة"
                        className="w-full p-2 rounded-xl bg-white dark:bg-[#1E2417] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={st.instruction}
                        onChange={(e) => {
                          const cp = [...formSteps];
                          cp[idx].instruction = e.target.value;
                          setFormSteps(cp);
                        }}
                        placeholder="شرح الخطوة السريرية بالتفصيل..."
                        className="w-full p-2 rounded-xl bg-white dark:bg-[#1E2417] border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={st.clinicalTip}
                          onChange={(e) => {
                            const cp = [...formSteps];
                            cp[idx].clinicalTip = e.target.value;
                            setFormSteps(cp);
                          }}
                          placeholder="نصيحة ذهبية (اختياري)"
                          className="w-full p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px]"
                        />
                        <input
                          type="text"
                          value={st.dangerZoneWarning}
                          onChange={(e) => {
                            const cp = [...formSteps];
                            cp[idx].dangerZoneWarning = e.target.value;
                            setFormSteps(cp);
                          }}
                          placeholder="تحذير خطر (اختياري)"
                          className="w-full p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  {editingSkillId ? 'حفظ التعديلات' : 'إضافة ونشر المهارة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Supervisor Notes Modal */}
      <SubscriberSupervisorNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        sectionContextTitle="أطلس المهارات السريرية"
        slideContextTitle={activeSkill?.title}
      />

      {/* Section Video Modal */}
      {clinicalSkillsSection && (
        <SectionVideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          section={clinicalSkillsSection}
          isAdmin={isAuthorAdmin}
          onVideoUpdated={(updatedSec) => {
            setClinicalSkillsSection(updatedSec);
          }}
        />
      )}
    </div>
  );
};
