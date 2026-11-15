import React, { useState, useEffect } from 'react';
import {
  SurgicalCase,
  SURGICAL_CATEGORIES,
  getSurgicalCases,
  addSurgicalCase,
  updateSurgicalCase,
  deleteSurgicalCase,
  subscribeToSurgicalCasesCloud,
  toggleSurgicalCaseVisibilityInCloud,
} from '../data/surgicalCasesData';
import { AppImage } from './AppImage';
import { SubscriberSupervisorNotesModal } from './SubscriberSupervisorNotesModal';
import { SectionVideoModal } from './SectionVideoModal';
import { getAppSections, AppSection, getSectionVideos, subscribeToAppSectionsCloud } from '../data/sectionsManager';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  X,
  ShieldAlert,
  Camera,
  BookOpen,
  Award,
  Upload,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Film,
  MessageSquare,
} from 'lucide-react';

interface SurgicalCasesViewProps {
  isAuthorAdmin: boolean;
  onOpenAdminLogin?: () => void;
}

export const SurgicalCasesView: React.FC<SurgicalCasesViewProps> = ({
  isAuthorAdmin,
  onOpenAdminLogin,
}) => {
  const [cases, setCases] = useState<SurgicalCase[]>(() => getSurgicalCases());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<SurgicalCase | null>(null);

  // Subscribe to real-time surgical cases and sections from Firestore
  useEffect(() => {
    const unsubCases = subscribeToSurgicalCasesCloud((cloudCases) => {
      setCases(cloudCases);
    });
    const unsubSections = subscribeToAppSectionsCloud((cloudSections) => {
      const surg = cloudSections.find((s) => s.key === 'surgical') || null;
      setSurgicalSection(surg);
    });
    return () => {
      unsubCases();
      unsubSections();
    };
  }, []);

  // Video and Supervisor Notes modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [surgicalSection, setSurgicalSection] = useState<AppSection | null>(() => {
    return getAppSections().find((s) => s.key === 'surgical') || null;
  });

  // Form modal state for adding/editing case (Admin only)
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<SurgicalCase['category']>('extraction');
  const [formRegion, setFormRegion] = useState('');
  const [formPatient, setFormPatient] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<SurgicalCase['difficulty']>('متوسط');
  const [formSummary, setFormSummary] = useState('');
  const [formPreOp, setFormPreOp] = useState('');
  const [formTakeaways, setFormTakeaways] = useState('');
  const [formComplications, setFormComplications] = useState('');
  const [formTools, setFormTools] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');

  // Filtering: Non-admin subscribers CANNOT view hidden cases
  const filteredCases = cases.filter((item) => {
    if (!isAuthorAdmin && (item.isHidden === true || item.isVisible === false)) {
      return false;
    }
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.toothOrRegion.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.preOpDiagnosis.toLowerCase().includes(query) ||
      item.clinicalTakeaways.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingCaseId(null);
    setFormTitle('');
    setFormCategory('extraction');
    setFormRegion('');
    setFormPatient('');
    setFormDifficulty('متوسط');
    setFormSummary('');
    setFormPreOp('');
    setFormTakeaways('• التجزيء الدقيق يقلل العظم المزال\n• التبريد المستمر يمنع التنخر العظمي');
    setFormComplications('• تجنب الضغط الزائد على العصب السنخي\n• حماية الصفيحة اللسانية');
    setFormTools('مشرط #15، رافع سمحاق Molt #9، قبضة جراحية مع سالين، خيط حرير 3-0');
    setFormImageUrl('');
    setFormImageCaption('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (c: SurgicalCase) => {
    setEditingCaseId(c.id);
    setFormTitle(c.title);
    setFormCategory(c.category);
    setFormRegion(c.toothOrRegion);
    setFormPatient(c.patientAgeGender || '');
    setFormDifficulty(c.difficulty);
    setFormSummary(c.summary);
    setFormPreOp(c.preOpDiagnosis);
    setFormTakeaways(c.clinicalTakeaways.join('\n'));
    setFormComplications(c.complicationsToAvoid.join('\n'));
    setFormTools(c.instrumentation.join('، '));
    setFormImageUrl(c.images[0]?.url || '');
    setFormImageCaption(c.images[0]?.caption || '');
    setShowFormModal(true);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSurgicalCase(id);
    setCases(updated);
    if (selectedCase?.id === id) {
      setSelectedCase(null);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يفضل اختيار صورة أقل من 3 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      alert('يرجى ملء عنوان الحالة وملخصها.');
      return;
    }

    const catObj = SURGICAL_CATEGORIES.find((c) => c.id === formCategory);
    const catLabel = catObj ? catLabelMap(formCategory) : 'إجراءات جراحية';

    const parsedTakeaways = formTakeaways
      .split('\n')
      .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const parsedComplications = formComplications
      .split('\n')
      .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const parsedTools = formTools
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const imagesList = formImageUrl
      ? [
          {
            id: 'img-' + Date.now(),
            url: formImageUrl,
            caption: formImageCaption || formTitle,
            stage: 'pre-op' as const,
          },
        ]
      : [];

    if (editingCaseId) {
      const updated = updateSurgicalCase(editingCaseId, {
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: catLabel,
        toothOrRegion: formRegion.trim() || 'المنطقة الجراحية',
        patientAgeGender: formPatient.trim() || undefined,
        difficulty: formDifficulty,
        summary: formSummary.trim(),
        preOpDiagnosis: formPreOp.trim(),
        clinicalTakeaways: parsedTakeaways.length > 0 ? parsedTakeaways : ['المتابعة السريرية الدقيقة'],
        complicationsToAvoid: parsedComplications,
        instrumentation: parsedTools,
        images: imagesList.length > 0 ? imagesList : undefined,
      });
      setCases(updated);
      const newlySelected = updated.find((c) => c.id === editingCaseId);
      if (newlySelected) setSelectedCase(newlySelected);
    } else {
      const newCase = addSurgicalCase({
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: catLabel,
        toothOrRegion: formRegion.trim() || 'المنطقة الجراحية',
        patientAgeGender: formPatient.trim() || undefined,
        difficulty: formDifficulty,
        summary: formSummary.trim(),
        preOpDiagnosis: formPreOp.trim(),
        surgicalSteps: [
          {
            stepNumber: 1,
            title: 'التخدير والتصميم الجراحي',
            description: 'تخدير موضعي كافي، شق حفافي محافظ مع شق إرخائي مدروس.',
            clinicalTips: 'حماية التروية الدموية للشريحة.',
          },
          {
            stepNumber: 2,
            title: 'التداخل الجراحي والمعالجة',
            description: formSummary.trim(),
            clinicalTips: 'التبريد المستمر بمحلول ملحي معقم.',
          },
          {
            stepNumber: 3,
            title: 'الإغلاق والخياطة',
            description: 'إعادة تقريب الحواف وخياطة محكمة بخيوط جراحية ملائمة.',
            clinicalTips: 'تجنب الشد المفرط على حواف الجرح.',
          },
        ],
        clinicalTakeaways: parsedTakeaways.length > 0 ? parsedTakeaways : ['التشخيص الدقيق مفتاح النجاح الجراحي'],
        complicationsToAvoid: parsedComplications,
        instrumentation: parsedTools.length > 0 ? parsedTools : ['مشرط جراحي', 'خيط خياطة', 'قبضة جراحية'],
        images: imagesList,
        author: 'د. حياه نافع فجر',
      });
      setCases(getSurgicalCases());
      setSelectedCase(newCase);
    }

    setShowFormModal(false);
  };

  function catLabelMap(cat: SurgicalCase['category']): string {
    switch (cat) {
      case 'extraction':
        return 'خلع جراحي وأضراس عقل';
      case 'apicoectomy':
        return 'قطع ذروة وجراحة لبية';
      case 'implant':
        return 'زراعة الأسنان الجراحية';
      case 'sinus_lift':
        return 'رفع الجيب الفكي';
      case 'flap_perio':
        return 'شرائح لثوية وتطويل تاج';
      case 'biopsy':
        return 'خزعات وآفات فموية';
      default:
        return 'إجراءات جراحية عامة';
    }
  }

  function getDifficultyColor(diff: SurgicalCase['difficulty']) {
    switch (diff) {
      case 'بسيط':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'متوسط':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300';
      case 'متقدم':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'معقد جراحياً':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
    }
  }

  if (!isAuthorAdmin && (!surgicalSection || surgicalSection.isVisible !== true)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-amber-50 dark:bg-[#1E2417] border-2 border-amber-300 dark:border-amber-700 text-center space-y-4 shadow-xl animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-black text-[#2F2B24] dark:text-white">
          قسم الحالات الجراحية مخفي حالياً
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          هذا القسم محجوب حالياً بأمر المشرفة د. حياة نافع ومخصص للمشرف العام فقط. لا يظهر هذا القسم لأي من المشتركين (القدماء والجدد) حتى يتم نشره رسمياً من قبل المشرفة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#596628]/15 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#1A2216] dark:to-[#171A12] border-2 border-[#596628]/30 dark:border-[#384524] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#596628] text-white shadow-2xs flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>أطلس الحالات الجراحية السريرية</span>
            </span>
            {isAuthorAdmin ? (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>صلاحيات المشرف العام (إضافة وتعديل وحذف)</span>
                </span>
                {surgicalSection?.isVisible === false && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>🔒 القسم مخفي عن المشتركين</span>
                  </span>
                )}
              </>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>وضع المشترك (مطالعة سريرية فقط Read-Only)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24] dark:text-white">
            الحالات الجراحية الفموية الموثقة (Surgical Cases)
          </h1>
          <p className="text-xs sm:text-sm text-[#625B4E] dark:text-[#C5BEAF] max-w-2xl font-medium">
            سجل سريري متقدم يوثق خطوات الخلع الجراحي، قطع الذروة وحشو الـ MTA، الزراعة الفورية، وإجراءات الشرائح اللثوية مع النقاط السريرية الذهبية والمحاذير لتفادي الاختلاطات.
          </p>
        </div>

        {/* Action Button: Admin can add new cases & video & supervisor notes */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
          {/* Note to Supervisor */}
          <button
            onClick={() => setShowNotesModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="كتابة ملاحظة أو استفسار سريري حول الحالات الجراحية للمشرفة"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>ملاحظة للمشرف ✍️</span>
          </button>

          {/* Section Video Button (Supports multiple videos) */}
          {(() => {
            const surgVideos = getSectionVideos(surgicalSection);
            if (!surgVideos.length && !isAuthorAdmin) return null;
            return (
              <button
                onClick={() => setShowVideoModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={surgVideos.length > 0 ? `مشاهدة فيديوهات الحالات الجراحية (${surgVideos.length})` : 'إضافة فيديو للحالات الجراحية'}
              >
                <Film className="w-4 h-4" />
                <span>{surgVideos.length > 1 ? `فيديوهات الحالات (${surgVideos.length}) 🎥` : 'فيديو الحالات 🎥'}</span>
              </button>
            );
          })()}

          {isAuthorAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حالة جراحية</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C8474] dark:text-[#A7A08E]" />
            <input
              type="text"
              placeholder="ابحث عن حالة جراحية، سن، تشخيص، أداة، أو توصية سريرية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[#1E2417] rounded-2xl border border-[#E5DEC9] dark:border-[#384524] text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-[#7E7768] dark:text-[#A7A08E] shrink-0 self-end sm:self-center">
            {filteredCases.length} من أصل {cases.length} حالات جراحية
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'bg-white dark:bg-[#20271A] text-[#554F42] dark:text-[#D5CDBC] border border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F3EDE2]'
            }`}
          >
            جميع الإجراءات ({cases.length})
          </button>
          {SURGICAL_CATEGORIES.map((cat, catIdx) => {
            const count = cases.filter((c) => c.category === cat.id).length;
            if (count === 0 && !isAuthorAdmin) return null;
            return (
              <button
                key={`${cat.id}_${catIdx}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#596628] text-white shadow-xs'
                    : 'bg-white dark:bg-[#20271A] text-[#554F42] dark:text-[#D5CDBC] border border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F3EDE2]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Surgical Cases */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#20271A] rounded-3xl border border-[#E5DEC9] dark:border-[#343E26] space-y-3">
          <Stethoscope className="w-12 h-12 mx-auto text-[#8C8474] opacity-50" />
          <h3 className="text-base font-bold text-[#2F2B24] dark:text-white">
            لم يتم العثور على حالات جراحية مطابقة
          </h3>
          <p className="text-xs text-[#706A5B] dark:text-[#A7A08E]">
            جرب تغيير كلمات البحث أو استعراض كل الفئات.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c, cIdx) => (
            <div
              key={c.id || `surg_${cIdx}`}
              onClick={() => setSelectedCase(c)}
              className="group bg-white dark:bg-[#20271A] rounded-3xl border-2 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden"
            >
              {/* Image Preview if available */}
              {c.images && c.images.length > 0 ? (
                <div className="relative h-48 w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
                  <AppImage
                    src={c.images[0].url}
                    alt={c.title}
                    isAdmin={isAuthorAdmin}
                    storageKey={`surgical_case_${c.id}`}
                    className="w-full h-full max-h-[450px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                    containerClassName="w-full h-full bg-neutral-950"
                    show4KBadge={true}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getDifficultyColor(
                        c.difficulty
                      )} shadow-xs`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                    <span className="truncate">{c.toothOrRegion}</span>
                    <span className="font-mono">{c.images.length} صور</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-[#596628]/10 to-amber-500/10 flex items-center justify-between border-b border-[#E5DEC9] dark:border-[#343E26]">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getDifficultyColor(
                      c.difficulty
                    )}`}
                  >
                    {c.difficulty}
                  </span>
                  <span className="text-[11px] font-bold text-[#596628] dark:text-[#A8C24E]">
                    {c.categoryLabel}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#787263] dark:text-[#A7A08E]">
                    <span className="bg-[#FAF7F2] dark:bg-[#181D13] px-2 py-0.5 rounded-md border border-[#E5DEC9] dark:border-[#343E26] font-bold">
                      {c.toothOrRegion}
                    </span>
                    {c.patientAgeGender && <span>• {c.patientAgeGender}</span>}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white leading-snug group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-[#595243] dark:text-[#C5BEAF] line-clamp-3 leading-relaxed">
                    {c.summary}
                  </p>
                </div>

                {/* Key takeaway preview */}
                {c.clinicalTakeaways.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-[#262116] border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-black flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-3 h-3" />
                      <span>نقطة سريرية ذهبية:</span>
                    </span>
                    <p className="line-clamp-2 font-medium">{c.clinicalTakeaways[0]}</p>
                  </div>
                )}

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between text-xs">
                  <span className="text-[#878070] dark:text-[#A7A08E] font-medium text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{c.surgicalSteps.length} خطوات جراحية</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {c.isHidden && isAuthorAdmin && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>مخفي</span>
                      </span>
                    )}

                    {isAuthorAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const currentHidden = c.isHidden === true || c.isVisible === false;
                            await toggleSurgicalCaseVisibilityInCloud(c.id, currentHidden);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            c.isHidden || c.isVisible === false
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300'
                              : 'text-[#596628] hover:bg-[#596628]/15 dark:hover:bg-[#A8C24E]/20'
                          }`}
                          title={c.isHidden || c.isVisible === false ? 'إظهار للمشتركين' : 'إخفاء عن المشتركين'}
                        >
                          {c.isHidden || c.isVisible === false ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-[#596628]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(c);
                          }}
                          className="p-1.5 rounded-lg text-[#596628] hover:bg-[#596628]/15 dark:hover:bg-[#A8C24E]/20 transition-colors"
                          title="تعديل الحالة الجراحية"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCase(c.id, e)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف الحالة الجراحية"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-[#596628] dark:text-[#A8C24E] font-black flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>عرض</span>
                      <span>←</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#1E2417] rounded-3xl shadow-2xl border-2 border-[#596628]/40 dark:border-[#384524] flex flex-col overflow-hidden my-auto animate-scaleUp">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] dark:bg-[#161B11] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black border ${getDifficultyColor(
                      selectedCase.difficulty
                    )}`}
                  >
                    صعوبة: {selectedCase.difficulty}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                    {selectedCase.categoryLabel}
                  </span>
                  <span className="text-xs text-[#807A6D] dark:text-[#A7A08E] font-bold">
                    {selectedCase.toothOrRegion}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white leading-tight">
                  {selectedCase.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#7B7465] dark:text-[#A7A08E]">
                  <span>إعداد: {selectedCase.author}</span>
                  {selectedCase.patientAgeGender && <span>• المريض: {selectedCase.patientAgeGender}</span>}
                  <span>• التاريخ: {selectedCase.dateAdded}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-right">
              {/* Photo gallery if present */}
              {selectedCase.images && selectedCase.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-[#596628] dark:text-[#A8C24E] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    <span>التوثيق الصوري السريري</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCase.images.map((img, imgIdx) => (
                      <div
                        key={img.id ? `${img.id}_${imgIdx}` : `img_${imgIdx}`}
                        className="rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#343E26] bg-neutral-950 space-y-1.5 shadow-xs"
                      >
                        <AppImage
                          src={img.url}
                          alt={img.caption || 'صورة جراحية'}
                          isAdmin={isAuthorAdmin}
                          storageKey={`surgical_case_img_${selectedCase.id}_${img.id}`}
                          className="w-full h-56 max-h-[450px] object-contain hover:scale-[1.02] transition-transform duration-300"
                          containerClassName="w-full h-56 overflow-hidden relative bg-neutral-950"
                          show4KBadge={true}
                        />
                        <div className="p-2.5 text-xs text-[#4A4337] dark:text-[#D5CDBC] font-medium leading-snug">
                          {img.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary and Pre-Op Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                  <h4 className="text-xs font-black text-[#596628] dark:text-[#A8C24E] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>ملخص الحالة السريرية</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-[#463F32] dark:text-[#C5BEAF] leading-relaxed">
                    {selectedCase.summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-[#162128] border border-sky-200 dark:border-sky-800 space-y-2">
                  <h4 className="text-xs font-black text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span>التشخيص الأولي قبل العمل (Pre-op Diagnosis)</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-sky-950 dark:text-sky-200 leading-relaxed font-medium">
                    {selectedCase.preOpDiagnosis}
                  </p>
                </div>
              </div>

              {/* Surgical Instrumentation */}
              {selectedCase.instrumentation && selectedCase.instrumentation.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                  <h4 className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                    <span>الأدوات الجراحية المستخدمة (Instrumentation)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedCase.instrumentation.map((tool, idx) => (
                      <span
                        key={`tool_${tool}_${idx}`}
                        className="px-3 py-1 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-[#4F473A] dark:text-[#D5CDBC] font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Surgical Steps Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#596628] dark:text-[#A8C24E] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>خطوات التداخل الجراحي المتسلسلة ({selectedCase.surgicalSteps.length})</span>
                </h3>

                <div className="space-y-3">
                  {selectedCase.surgicalSteps.map((step, stIdx) => (
                    <div
                      key={`${step.stepNumber}_${stIdx}`}
                      className="p-4 rounded-2xl bg-white dark:bg-[#161B11] border-2 border-[#E5DEC9] dark:border-[#343E26] space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#596628] dark:bg-[#7D9333] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                          {step.title}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-[#4E473A] dark:text-[#C5BEAF] leading-relaxed mr-9">
                        {step.description}
                      </p>

                      {step.clinicalTips && (
                        <div className="mr-9 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="font-semibold">{step.clinicalTips}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Takeaways & Complications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Takeaways */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-[#142318] border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>النقاط السريرية الذهبية المستفادة</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                    {selectedCase.clinicalTakeaways.map((point, idx) => (
                      <li key={`takeaway_${idx}`} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-black">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Complications */}
                <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-[#251517] border-2 border-rose-300 dark:border-rose-800 space-y-3">
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>المحاذير السريرية لتفادي الاختلاطات</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-200 font-medium">
                    {selectedCase.complicationsToAvoid.map((point, idx) => (
                      <li key={`complication_${idx}`} className="flex items-start gap-2">
                        <span className="text-rose-600 font-black">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF7F2] dark:bg-[#161B11] border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#7B7465] dark:text-[#A7A08E] font-bold">
                أطلس الحالات الجراحية — د. حياه نافع فجر (جامعة المعارف)
              </span>

              <div className="flex items-center gap-2">
                {isAuthorAdmin && (
                  <button
                    onClick={() => {
                      const c = selectedCase;
                      setSelectedCase(null);
                      handleOpenEditModal(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الحالة</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-5 py-2 rounded-xl bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-[#302C24] dark:text-white border border-[#E5DEC9] dark:border-[#343E26] text-xs font-black cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Case Modal (Admin Strictly) */}
      {showFormModal && isAuthorAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#1E2417] rounded-3xl shadow-2xl border-2 border-[#596628] flex flex-col overflow-hidden my-auto animate-scaleUp">
            {/* Header */}
            <div className="p-5 bg-[#FAF7F2] dark:bg-[#161B11] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#596628] text-white flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  {editingCaseId ? 'تعديل الحالة الجراحية' : 'إضافة حالة جراحية جديدة'}
                </h3>
              </div>

              <button
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-400 hover:text-gray-700 flex items-center justify-center border border-[#E5DEC9] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">
                  عنوان الحالة الجراحية:*
                </label>
                <input
                  type="text"
                  placeholder="مثال: خلع جراحي لضرس عقل مدفون أفقياً مع تجزيء التاج"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">التصنيف الجراحي:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  >
                    {SURGICAL_CATEGORIES.map((cat, catIdx) => (
                      <option key={`${cat.id}_${catIdx}`} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">درجة الصعوبة:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  >
                    <option value="بسيط">بسيط</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                    <option value="معقد جراحياً">معقد جراحياً</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">السن أو المنطقة:</label>
                  <input
                    type="text"
                    placeholder="مثال: #38 أو الثنية العلوية"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">بيانات المريض (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مثال: 24 سنة / أنثى"
                    value={formPatient}
                    onChange={(e) => setFormPatient(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">الأدوات الجراحية المستخدمة:</label>
                  <input
                    type="text"
                    placeholder="مشرط #15، رافع Molt #9، قبضة جراحية، سالين..."
                    value={formTools}
                    onChange={(e) => setFormTools(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">التشخيص الأولي (Pre-op Diagnosis):</label>
                <input
                  type="text"
                  placeholder="مثال: التهاب حاد حول التاج مع انحشار أفقي كامل"
                  value={formPreOp}
                  onChange={(e) => setFormPreOp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">ملخص التداخل الجراحي والملاحظات:*</label>
                <textarea
                  rows={3}
                  placeholder="وصف تفصيلي للخطوات الجراحية، تصميم الشريحة، تفادي الأعصاب، وإغلاق الجرح..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-800 dark:text-emerald-400 block">
                    النقاط السريرية الذهبية (سطر لكل نقطة):
                  </label>
                  <textarea
                    rows={3}
                    value={formTakeaways}
                    onChange={(e) => setFormTakeaways(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-800 dark:text-rose-400 block">
                    المحاذير لتفادي الاختلاطات (سطر لكل نقطة):
                  </label>
                  <textarea
                    rows={3}
                    value={formComplications}
                    onChange={(e) => setFormComplications(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Image attachment: File upload or URL */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] dark:border-[#384524] space-y-3">
                <label className="font-bold text-[#353026] dark:text-white block">
                  إرفاق صورة سريرية للحالة (رفع ملف أو رابط صورة):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#20271A] border border-[#D5CDBC] dark:border-[#384524] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-[#596628]" />
                    <span>اختيار صورة من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[#888] font-bold">أو</span>
                  <input
                    type="url"
                    placeholder="رابط صورة مباشر https://..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-[#20271A] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  />
                </div>

                {formImageUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={formImageUrl}
                      alt="معاينة"
                      className="w-16 h-16 rounded-xl object-contain bg-neutral-900 border border-[#D5CDBC]"
                    />
                    <input
                      type="text"
                      placeholder="تعليق أو وصف الصورة..."
                      value={formImageCaption}
                      onChange={(e) => setFormImageCaption(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-[#20271A] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCaseId ? 'حفظ التعديلات' : 'إضافة الحالة الجراحية'}</span>
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
        sectionContextTitle="الحالات الجراحية"
        slideContextTitle={selectedCase?.title}
      />

      {/* Section Video Modal */}
      {surgicalSection && (
        <SectionVideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          section={surgicalSection}
          isAdmin={isAuthorAdmin}
          onVideoUpdated={(updatedSec) => {
            setSurgicalSection(updatedSec);
          }}
        />
      )}
    </div>
  );
};
