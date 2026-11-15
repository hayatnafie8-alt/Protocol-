import React, { useState, useEffect } from 'react';
import {
  HomePracticeExercise,
  HOME_PRACTICE_CATEGORIES,
  getHomePractices,
  addHomePractice,
  updateHomePractice,
  deleteHomePractice,
} from '../data/homePracticeData';
import { AppImage } from './AppImage';
import { SubscriberSupervisorNotesModal } from './SubscriberSupervisorNotesModal';
import { SectionVideoModal } from './SectionVideoModal';
import { getAppSections, AppSection, getSectionVideos } from '../data/sectionsManager';
import {
  getCustomWindows,
  CustomWindow,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Target,
  AlertTriangle,
  Layers,
  Award,
  Upload,
  Camera,
  BookOpen,
  X,
  Edit3,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  RefreshCw,
  Share2,
  Film,
  MessageSquare,
} from 'lucide-react';

interface HomePracticeViewProps {
  isAuthorAdmin: boolean;
  onOpenAdminLogin?: () => void;
}

export const HomePracticeView: React.FC<HomePracticeViewProps> = ({
  isAuthorAdmin,
}) => {
  const { isRTL, language, t } = useLanguage();
  const [exercises, setExercises] = useState<HomePracticeExercise[]>(() =>
    getHomePractices()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<HomePracticeExercise | null>(null);

  // Dynamic Custom Windows for Protocols
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>(() => getCustomWindows());
  const [selectedCustomWindow, setSelectedCustomWindow] = useState<CustomWindow | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setCustomWindows(getCustomWindows());
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Video and Supervisor Notes modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [homePracticeSection, setHomePracticeSection] = useState<AppSection | null>(() => {
    return getAppSections().find((s) => s.key === 'home_practice') || null;
  });

  // Student Practice Session Progress (steps checked off in current session)
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [completedCriteria, setCompletedCriteria] = useState<Record<string, number[]>>({});

  // Admin Form Modal
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<HomePracticeExercise['category']>('suturing');
  const [formDifficulty, setFormDifficulty] = useState<HomePracticeExercise['difficulty']>('متوسط');
  const [formTime, setFormTime] = useState('30 دقيقة');
  const [formTools, setFormTools] = useState('');
  const [formObjective, setFormObjective] = useState('');
  const [formAuthorNotes, setFormAuthorNotes] = useState('');
  const [formCriteria, setFormCriteria] = useState('');
  const [formStepsRaw, setFormStepsRaw] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');

  // Filtering
  const filtered = exercises.filter((ex) => {
    const matchesCat =
      selectedCategory === 'all' || ex.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;

    const matchesQ =
      ex.title.toLowerCase().includes(q) ||
      ex.objective.toLowerCase().includes(q) ||
      ex.requiredTools.some((t) => t.toLowerCase().includes(q)) ||
      ex.steps.some((s) => s.title.toLowerCase().includes(q) || s.instruction.toLowerCase().includes(q));

    return matchesCat && matchesQ;
  });

  const toggleStepCompleted = (exerciseId: string, stepNum: number) => {
    setCompletedSteps((prev) => {
      const currentList = prev[exerciseId] || [];
      const isAlready = currentList.includes(stepNum);
      const updated = isAlready
        ? currentList.filter((n) => n !== stepNum)
        : [...currentList, stepNum];
      return { ...prev, [exerciseId]: updated };
    });
  };

  const toggleCriteriaChecked = (exerciseId: string, idx: number) => {
    setCompletedCriteria((prev) => {
      const current = prev[exerciseId] || [];
      const isAlready = current.includes(idx);
      const updated = isAlready
        ? current.filter((n) => n !== idx)
        : [...current, idx];
      return { ...prev, [exerciseId]: updated };
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('suturing');
    setFormDifficulty('متوسط');
    setFormTime('30 دقيقة');
    setFormTools('لوح سيليكون للتدريب، حامل إبرة، ملقط أنسجة مسنن، مقص، خيط حرير 3-0');
    setFormObjective('إتقان مسك الأدوات الجراحية وعمل عقدة الجراح المزدوجة بدقة.');
    setFormAuthorNotes('نصيحة د. حياة: التدريب المنزلي اليومي يبني الذاكرة العضلية للأصابع.');
    setFormCriteria('حواف متقابلة بدون انقلاب\nعقدة محكمة على جانب الجرح\nطول الذيل 3-4 ملم');
    setFormStepsRaw('1. مسك حامل الإبرة بزاوية 90 درجة | تجنب إدخال الأصابع بعمق\n2. اختراق الحافة الأولى | الدفع بدون انحناء يمزق النسيج\n3. عقدة الجراح المزدوجة 2-1-1 | الشد الزائد يسبب فقر دم حفافي');
    setFormImageUrl('');
    setFormImageCaption('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (ex: HomePracticeExercise) => {
    setEditingId(ex.id);
    setFormTitle(ex.title);
    setFormCategory(ex.category);
    setFormDifficulty(ex.difficulty);
    setFormTime(ex.estimatedTime);
    setFormTools(ex.requiredTools.join('، '));
    setFormObjective(ex.objective);
    setFormAuthorNotes(ex.authorNotes);
    setFormCriteria(ex.clinicalEvaluationCriteria.join('\n'));
    setFormStepsRaw(
      ex.steps
        .map((s) => `${s.stepNumber}. ${s.title}: ${s.instruction} | المحذور: ${s.keyMistakeToAvoid}`)
        .join('\n')
    );
    setFormImageUrl(ex.images[0]?.url || '');
    setFormImageCaption(ex.images[0]?.caption || '');
    setShowFormModal(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHomePractice(id);
    setExercises(updated);
    if (selectedExercise?.id === id) setSelectedExercise(null);
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
    if (!formTitle.trim() || !formObjective.trim()) {
      alert('يرجى كتابة عنوان التدريب والهدف التعليمي.');
      return;
    }

    const catObj = HOME_PRACTICE_CATEGORIES.find((c) => c.id === formCategory);
    const catLabel = catObj?.label || 'تدريب بالبيت';

    const parsedTools = formTools
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedCriteria = formCriteria
      .split('\n')
      .map((c) => c.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    // Parse steps
    const rawLines = formStepsRaw.split('\n').filter((l) => l.trim());
    const parsedSteps = rawLines.map((line, idx) => {
      const parts = line.split('|');
      const instructionPart = parts[0] || '';
      const mistakePart = parts[1] || 'تجنب التسرع والضغط الزائد';
      return {
        stepNumber: idx + 1,
        title: `الخطوة ${idx + 1}`,
        instruction: instructionPart.trim(),
        keyMistakeToAvoid: mistakePart.replace(/^المحذور:\s*/, '').trim(),
      };
    });

    const imagesList = formImageUrl
      ? [
          {
            url: formImageUrl,
            caption: formImageCaption || formTitle,
          },
        ]
      : [];

    if (editingId) {
      const updated = updateHomePractice(editingId, {
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: catLabel,
        difficulty: formDifficulty,
        estimatedTime: formTime.trim(),
        requiredTools: parsedTools,
        objective: formObjective.trim(),
        authorNotes: formAuthorNotes.trim(),
        clinicalEvaluationCriteria: parsedCriteria,
        steps: parsedSteps.length > 0 ? parsedSteps : undefined,
        images: imagesList.length > 0 ? imagesList : undefined,
      });
      setExercises(updated);
      const refreshed = updated.find((x) => x.id === editingId);
      if (refreshed) setSelectedExercise(refreshed);
    } else {
      const created = addHomePractice({
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: catLabel,
        difficulty: formDifficulty,
        estimatedTime: formTime.trim() || '30 دقيقة',
        requiredTools: parsedTools.length > 0 ? parsedTools : ['أدوات طب الأسنان الأساسية'],
        objective: formObjective.trim(),
        authorNotes: formAuthorNotes.trim() || 'إتقان التدريب المنزلي يرفع كفاءتك السريرية.',
        clinicalEvaluationCriteria: parsedCriteria.length > 0 ? parsedCriteria : ['إتقان التسلسل السليم'],
        steps:
          parsedSteps.length > 0
            ? parsedSteps
            : [
                {
                  stepNumber: 1,
                  title: 'التحضير وتجهيز الأدوات',
                  instruction: 'تجهيز بيئة العمل المعقمة وضبط الإضاءة والوضعية الجلوس السليمة.',
                  keyMistakeToAvoid: 'العمل في وضعية غير مريحة يسبب آلام الرقبة وتشتت التركيز.',
                },
                {
                  stepNumber: 2,
                  title: 'التنفيذ والمحاكاة',
                  instruction: formObjective.trim(),
                  keyMistakeToAvoid: 'التعجل في الخطوات قبل بلمرة أو تثبيت كل جزء.',
                },
              ],
        images: imagesList,
      });
      setExercises(getHomePractices());
      setSelectedExercise(created);
    }

    setShowFormModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-white to-[#596628]/10 dark:from-[#252216] dark:via-[#1E2016] dark:to-[#171A12] border-2 border-amber-300 dark:border-amber-800/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-600 text-white shadow-2xs flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>{isRTL ? 'أنواع التدريبات بالبيت (Home Practice Mastery)' : 'Home Practice Mastery & Clinical Simulations'}</span>
            </span>
            {isAuthorAdmin ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRTL ? 'تحكم المشرف العام (إضافة وتعديل وحذف)' : 'Supervisor Control (Add, Edit & Delete)'}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{isRTL ? 'وضع المشترك (مطالعة وتدريب تفاعلي)' : 'Subscriber Mode (Interactive Clinical Training)'}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24] dark:text-white">
            {isRTL ? 'دليل التمارين والتدريبات السريرية المنزلية' : 'Home Clinical Practice & Simulation Guide'}
          </h1>
          <p className="text-xs sm:text-sm text-[#635B4D] dark:text-[#C5BEAF] max-w-2xl font-medium">
            {isRTL
              ? 'تمارين موجهة لطلاب طب الأسنان للتطبيق المنزلي: تدريب الخياطة الجراحية على السيليكون وقشرة الموز، نحت الكومبوزيت، حفر الكافيتي على الموديل، وعزل الرابر دام مع خطوات تجنب الأخطاء الشائعة ومعايير التقييم الذاتي.'
              : 'Hands-on clinical exercises for dental students at home: surgical suturing on silicone pads & banana peel, composite anatomical carving, typodont cavity preparation, and rubber dam isolation with error prevention & self-evaluation scorecards.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
          {/* Note to Supervisor */}
          <button
            onClick={() => setShowNotesModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isRTL ? 'كتابة ملاحظة أو استفسار للمشرفة حول التدريبات المنزلية' : 'Write a note or inquiry to the supervisor regarding home exercises'}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? 'ملاحظة للمشرف ✍️' : 'Note to Supervisor ✍️'}</span>
          </button>

          {/* Section Video Button (Supports multiple videos) */}
          {(() => {
            const hpVideos = getSectionVideos(homePracticeSection);
            if (!hpVideos.length && !isAuthorAdmin) return null;
            return (
              <button
                onClick={() => setShowVideoModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={hpVideos.length > 0 ? (isRTL ? `مشاهدة فيديوهات التدريبات المنزلية (${hpVideos.length})` : `Watch Home Practice Videos (${hpVideos.length})`) : (isRTL ? 'إضافة فيديو للتدريبات المنزلية' : 'Add Video for Home Practice')}
              >
                <Film className="w-4 h-4" />
                <span>
                  {hpVideos.length > 1
                    ? (isRTL ? `فيديوهات التدريبات (${hpVideos.length}) 🎥` : `Practice Videos (${hpVideos.length}) 🎥`)
                    : (isRTL ? 'فيديو التدريبات 🎥' : 'Practice Video 🎥')}
                </span>
              </button>
            );
          })()}

          {isAuthorAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? 'إضافة تدريب جديد' : 'Add New Exercise'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className={`w-4 h-4 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-[#8C8474]`} />
            <input
              type="text"
              placeholder={isRTL ? 'ابحث عن تمرين، أداة، خطوة، أو مهارة تدريبية...' : 'Search exercises, instruments, steps, or clinical skills...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pl-4 pr-10' : 'pr-4 pl-10'} py-2.5 bg-white dark:bg-[#1E2417] rounded-2xl border border-[#E5DEC9] dark:border-[#384524] text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#596628] shadow-2xs`}
            />
          </div>
          <span className="text-xs font-bold text-[#7E7768] dark:text-[#A7A08E] self-end sm:self-center">
            {isRTL ? `${filtered.length} تمارين متاحة` : `${filtered.length} exercises available`}
          </span>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'bg-white dark:bg-[#20271A] text-[#554F42] dark:text-[#D5CDBC] border border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F3EDE2]'
            }`}
          >
            {isRTL ? `جميع التدريبات (${exercises.length})` : `All Exercises (${exercises.length})`}
          </button>
          {HOME_PRACTICE_CATEGORIES.map((cat, catIdx) => {
            const count = exercises.filter((x) => x.category === cat.id).length;
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
                {isRTL ? cat.label : (cat.labelEn || cat.label)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Supervisor Custom Windows for Protocols */}
      {customWindows.filter((w) => w.targetLocation === 'protocols' && (!w.isHidden || isAuthorAdmin)).length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-black text-[#596628] dark:text-[#A8C24E]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{isRTL ? 'نوافذ وبطاقات البروتوكولات السريرية المعتمدة (Supervisor Protocols)' : 'Approved Clinical Supervisor Protocol Cards'}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
              {customWindows.filter((w) => w.targetLocation === 'protocols' && (!w.isHidden || isAuthorAdmin)).length} {isRTL ? 'بطاقات' : 'cards'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customWindows
              .filter((w) => w.targetLocation === 'protocols' && (!w.isHidden || isAuthorAdmin))
              .map((cWin, idx) => (
                <div
                  key={`${cWin.id}_${idx}`}
                  onClick={() => setSelectedCustomWindow(cWin)}
                  className="p-5 rounded-3xl bg-white dark:bg-[#1E2519] border-2 border-[#596628]/40 hover:border-[#596628] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                        {cWin.badge || (isRTL ? 'بروتوكول معتمد' : 'Approved Protocol')}
                      </span>
                      {cWin.isHidden && (
                        <span className="text-[10px] font-black text-neutral-400">{isRTL ? 'مخفي' : 'Hidden'}</span>
                      )}
                    </div>
                    <div>
                      {cWin.subtitle && (
                        <span className="text-[10px] font-bold text-neutral-500 block mb-0.5">
                          {cWin.subtitle}
                        </span>
                      )}
                      <h4 className="text-base font-black text-neutral-900 dark:text-white group-hover:text-[#596628] transition-colors">
                        {cWin.title}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {cWin.content}
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-black text-[#596628] dark:text-[#A8C24E]">
                    <span>{isRTL ? 'فتح واستعراض البروتوكول' : 'View Protocol Details'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">{isRTL ? '←' : '→'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((ex, exIdx) => {
          const currentDone = completedSteps[ex.id]?.length || 0;
          const totalSteps = ex.steps.length;
          const percent = Math.round((currentDone / (totalSteps || 1)) * 100);

          return (
            <div
              key={`${ex.id}_${exIdx}`}
              onClick={() => setSelectedExercise(ex)}
              className="group bg-white dark:bg-[#20271A] rounded-3xl border-2 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden"
            >
              {/* Exercise Image or Color Banner */}
              {ex.images && ex.images.length > 0 ? (
                <div className="relative h-48 w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
                  <AppImage
                    src={ex.images[0].url}
                    alt={ex.title}
                    isAdmin={isAuthorAdmin}
                    storageKey={`practice_exercise_${ex.id}`}
                    className="w-full h-full max-h-[450px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                    containerClassName="w-full h-full bg-neutral-950"
                    show4KBadge={true}
                  />
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex items-center gap-1.5 z-10`}>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white shadow-xs">
                      {ex.categoryLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{ex.estimatedTime}</span>
                    </span>
                    <span className="font-bold">
                      {isRTL ? `المستوى: ${ex.difficulty}` : `Level: ${ex.difficulty === 'مبتدئ' ? 'Beginner' : ex.difficulty === 'متقدم' ? 'Advanced' : 'Intermediate'}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-[#596628]/10 border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                    {ex.categoryLabel}
                  </span>
                  <span className="text-xs font-bold text-[#6D6759] dark:text-[#A7A08E] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ex.estimatedTime}</span>
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-[#2F2B24] dark:text-white leading-snug group-hover:text-[#596628] dark:group-hover:text-[#A8C24E] transition-colors">
                    {ex.title}
                  </h3>

                  <p className="text-xs text-[#524B3E] dark:text-[#C5BEAF] line-clamp-2 leading-relaxed">
                    {ex.objective}
                  </p>
                </div>

                {/* Progress in student session */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#645E50] dark:text-[#A7A08E]">
                    <span>{isRTL ? 'تقدمك في التمرين المنزلي:' : 'Home Practice Progress:'}</span>
                    <span className="font-mono font-black text-[#596628] dark:text-[#A8C24E]">
                      {isRTL ? `${currentDone} من ${totalSteps} خطوات (${percent}%)` : `${currentDone} of ${totalSteps} steps (${percent}%)`}
                    </span>
                  </div>
                  <div className="w-full bg-[#E5DEC9] dark:bg-[#2C3421] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#596628] dark:bg-[#A8C24E] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Tools preview */}
                <div className="flex flex-wrap gap-1.5">
                  {ex.requiredTools.slice(0, 3).map((tool, idx) => (
                    <span
                      key={`preview_tool_${ex.id}_${tool}_${idx}`}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-[#6E6759] dark:text-[#A7A08E] font-medium truncate max-w-[150px]"
                    >
                      {tool}
                    </span>
                  ))}
                  {ex.requiredTools.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAF7F2] text-[#8C8474] font-bold">
                      {isRTL ? `+${ex.requiredTools.length - 3} أدوات` : `+${ex.requiredTools.length - 3} more tools`}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between text-xs">
                  <span className="text-[#8C8474] font-bold text-[11px]">
                    {isRTL ? `${ex.steps.length} خطوات تفصيلية` : `${ex.steps.length} detailed steps`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isAuthorAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(ex);
                          }}
                          className="p-1.5 rounded-lg text-[#596628] hover:bg-[#596628]/15"
                          title={isRTL ? 'تعديل التدريب' : 'Edit exercise'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(ex.id, e)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title={isRTL ? 'حذف التدريب' : 'Delete exercise'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-[#596628] dark:text-[#A8C24E] font-black flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>{isRTL ? 'بدء التدريب' : 'Start Practice'}</span>
                      <span>{isRTL ? '←' : '→'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Modal with Interactive Practice Checklist */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#1E2417] rounded-3xl shadow-2xl border-2 border-[#596628]/40 dark:border-[#384524] flex flex-col overflow-hidden my-auto animate-scaleUp">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] dark:bg-[#161B11] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-start justify-between gap-4 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white">
                    {selectedExercise.categoryLabel}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F2] dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-[#554F42] dark:text-[#D5CDBC] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isRTL ? `المدة المقترحة: ${selectedExercise.estimatedTime}` : `Suggested Duration: ${selectedExercise.estimatedTime}`}</span>
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                    {isRTL ? `المستوى: ${selectedExercise.difficulty}` : `Level: ${selectedExercise.difficulty === 'مبتدئ' ? 'Beginner' : selectedExercise.difficulty === 'متقدم' ? 'Advanced' : 'Intermediate'}`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white leading-tight">
                  {selectedExercise.title}
                </h2>
                <p className="text-xs text-[#6B6456] dark:text-[#A7A08E]">
                  {isRTL ? `الهدف التعليمي: ${selectedExercise.objective}` : `Educational Objective: ${selectedExercise.objective}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedExercise(null)}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className={`p-5 sm:p-8 overflow-y-auto space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Author Advice Box */}
              {selectedExercise.authorNotes && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#262116] border-2 border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black text-amber-900 dark:text-amber-300 block">
                      {isRTL ? 'توجيه سريري خاص من د. حياة نافع فجر:' : 'Special Clinical Guidance from Dr. Hayat Nafie Fajr:'}
                    </span>
                    <p className="font-semibold leading-relaxed">
                      {selectedExercise.authorNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Photos if present */}
              {selectedExercise.images && selectedExercise.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedExercise.images.map((img, i) => (
                    <div
                      key={`ex_img_${i}`}
                      className="rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#343E26] bg-neutral-950"
                    >
                      <AppImage
                        src={img.url}
                        alt={img.caption || (isRTL ? 'صورة التدريب' : 'Practice Photo')}
                        isAdmin={isAuthorAdmin}
                        storageKey={`practice_img_${selectedExercise.id}_${i}`}
                        className="w-full h-56 max-h-[450px] object-contain hover:scale-[1.02] transition-transform"
                        containerClassName="w-full h-56 overflow-hidden relative bg-neutral-950"
                        show4KBadge={true}
                      />
                      <p className="p-2 text-xs text-[#504A3E] dark:text-[#D5CDBC] font-medium">
                        {img.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Required Tools */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                <h4 className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
                  <span>{isRTL ? 'الأدوات والمواد المطلوبة للتطبيق بالبيت:' : 'Required Tools & Materials for Home Practice:'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {selectedExercise.requiredTools.map((tool, idx) => (
                    <div
                      key={`req_tool_${selectedExercise.id}_${tool}_${idx}`}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] flex items-center gap-2 font-medium text-[#463F32] dark:text-[#D5CDBC]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#596628]/15 text-[#596628] font-bold text-[11px] flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Step-by-Step Walkthrough */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#596628] dark:text-[#A8C24E] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>{isRTL ? 'خطوات التدريب العملي (اضغط على الخطوة لتأكيد إنجازها)' : 'Practical Training Steps (Click to mark completed)'}</span>
                  </h3>
                  <button
                    onClick={() =>
                      setCompletedSteps((prev) => ({ ...prev, [selectedExercise.id]: [] }))
                    }
                    className="text-[11px] text-[#7E7768] hover:text-[#2F2B24] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isRTL ? 'إعادة تعيين التقدم' : 'Reset Progress'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedExercise.steps.map((st, sIdx) => {
                    const isChecked = (
                      completedSteps[selectedExercise.id] || []
                    ).includes(st.stepNumber);

                    return (
                      <div
                        key={`${st.stepNumber}_${sIdx}`}
                        onClick={() => toggleStepCompleted(selectedExercise.id, st.stepNumber)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 select-none ${
                          isChecked
                            ? 'bg-emerald-50/70 dark:bg-[#152418] border-emerald-400 dark:border-emerald-700 shadow-xs'
                            : 'bg-white dark:bg-[#161B11] border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400 shrink-0" />
                            )}
                            <h4
                              className={`text-sm font-black ${
                                isChecked
                                  ? 'text-emerald-900 dark:text-emerald-300 line-through'
                                  : 'text-[#2F2B24] dark:text-white'
                              }`}
                            >
                              {isRTL ? `الخطوة ${st.stepNumber}: ${st.title}` : `Step ${st.stepNumber}: ${st.title}`}
                            </h4>
                          </div>
                          {isChecked && (
                            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              {isRTL ? 'تم الإنجاز ✓' : 'Completed ✓'}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs sm:text-sm text-[#4E473A] dark:text-[#C5BEAF] leading-relaxed ${isRTL ? 'mr-7' : 'ml-7'}`}>
                          {st.instruction}
                        </p>

                        {st.keyMistakeToAvoid && (
                          <div className={`${isRTL ? 'mr-7' : 'ml-7'} p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2`}>
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-black text-rose-800 dark:text-rose-300 block">
                                {isRTL ? 'خطأ شائع يجب الحذر منه:' : 'Critical Mistake to Avoid:'}
                              </span>
                              <span>{st.keyMistakeToAvoid}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Self-Evaluation Scorecard */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 dark:from-[#172418] dark:to-[#16202A] border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                    {isRTL ? 'بطاقة التقييم الذاتي لنتيجتك (Self-Evaluation Checklist)' : 'Self-Evaluation Scorecard & Clinical Checklist'}
                  </h4>
                </div>
                <p className="text-xs text-[#5D574A] dark:text-[#A7A08E]">
                  {isRTL
                    ? 'بعد انتهاء التدريب، افحص عملك سريرياً وضع علامة صح عند كل معيار يتحقق بنجاح:'
                    : 'After completing the practice, clinically inspect your work and check off every achieved standard:'}
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  {selectedExercise.clinicalEvaluationCriteria.map((crit, idx) => {
                    const isChecked = (
                      completedCriteria[selectedExercise.id] || []
                    ).includes(idx);

                    return (
                      <div
                        key={`crit_${selectedExercise.id}_${idx}`}
                        onClick={() => toggleCriteriaChecked(selectedExercise.id, idx)}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold'
                            : 'bg-white dark:bg-[#1E2417] border-[#E5DEC9] text-[#484236] dark:text-[#D5CDBC]'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span>{crit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FAF7F2] dark:bg-[#161B11] border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
              <span className="text-xs text-[#7B7465] dark:text-[#A7A08E] font-bold">
                {isRTL ? 'تمارين طب الأسنان المنزلية — جامعة المعارف (د. حياة نافع)' : 'Home Dental Simulation Practice — Al-Maaref University (Dr. Hayat Nafie)'}
              </span>

              <button
                onClick={() => setSelectedExercise(null)}
                className="px-5 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black cursor-pointer shadow-xs"
              >
                {isRTL ? 'إغلاق التدريب' : 'Close Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Home Practice Modal (Admin strictly) */}
      {showFormModal && isAuthorAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#1E2417] rounded-3xl shadow-2xl border-2 border-[#596628] flex flex-col overflow-hidden my-auto animate-scaleUp">
            <div className="p-5 bg-[#FAF7F2] dark:bg-[#161B11] border-b border-[#E5DEC9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#596628]" />
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  {editingId ? 'تعديل التدريب المنزلي' : 'إضافة تدريب منزلي جديد'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-400 hover:text-gray-700 flex items-center justify-center border border-[#E5DEC9]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">
                  عنوان التدريب المنزلي:*
                </label>
                <input
                  type="text"
                  placeholder="مثال: تدريب خياطة المراتب الأفقية والعمودية بالبيت"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">التصنيف:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  >
                    {HOME_PRACTICE_CATEGORIES.map((c, cIdx) => (
                      <option key={`${c.id}_${cIdx}`} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">مستوى الصعوبة:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  >
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#353026] dark:text-white block">الوقت المقترح:</label>
                  <input
                    type="text"
                    placeholder="مثال: 30 دقيقة"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">
                  الهدف التعليمي (Objective):*
                </label>
                <input
                  type="text"
                  placeholder="ما الذي سيكتسبه الطالب بعد إنهاء هذا التمرين؟"
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">
                  الأدوات والمواد المطلوبة (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={formTools}
                  onChange={(e) => setFormTools(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#353026] dark:text-white block">
                  خطوات التدريب (كل سطر: الشرح | الخطأ الذي يجب تجنبه):
                </label>
                <textarea
                  rows={4}
                  value={formStepsRaw}
                  onChange={(e) => setFormStepsRaw(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-800 dark:text-emerald-400 block">
                    معايير التقييم الذاتي (سطر لكل معيار):
                  </label>
                  <textarea
                    rows={3}
                    value={formCriteria}
                    onChange={(e) => setFormCriteria(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-emerald-300 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-800 dark:text-amber-400 block">
                    نصيحة الدكتورة الخاصة:
                  </label>
                  <textarea
                    rows={3}
                    value={formAuthorNotes}
                    onChange={(e) => setFormAuthorNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-amber-300 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Image attachment */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#D5CDBC] space-y-2">
                <label className="font-bold text-[#353026] dark:text-white block">
                  صورة توضيحية للتدريب (اختياري):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#20271A] border border-[#D5CDBC] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-[#596628]" />
                    <span>رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="أو رابط صورة https://..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-[#20271A] rounded-xl border border-[#D5CDBC] text-xs font-bold"
                  />
                </div>
              </div>

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
                  <span>{editingId ? 'حفظ التعديل' : 'إضافة التدريب'}</span>
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
        sectionContextTitle="التدريبات بالبيت"
        slideContextTitle={selectedExercise?.title}
      />

      {/* Section Video Modal */}
      {homePracticeSection && (
        <SectionVideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          section={homePracticeSection}
          isAdmin={isAuthorAdmin}
          onVideoUpdated={(updatedSec) => {
            setHomePracticeSection(updatedSec);
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
          isContentUnlocked={true}
        />
      )}
    </div>
  );
};
