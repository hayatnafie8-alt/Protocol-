import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ClipboardCheck,
  FileText,
  Stethoscope,
  Link as LinkIcon,
  Pill,
  Syringe,
  Bookmark,
  Layers,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Edit3,
  Copy,
  Check,
  Upload,
  FileUp,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import {
  CustomWindow,
  CustomWindowTargetLocation,
  CustomWindowContentType,
  getCustomWindows,
  addCustomWindow,
  updateCustomWindow,
  deleteCustomWindow,
  duplicateCustomWindow,
  toggleCustomWindowSubscription,
  toggleCustomWindowHidden,
  PROTOCOL_CUSTOM_WINDOWS_EVENT,
  DEFAULT_CUSTOM_WINDOWS,
  saveCustomWindows,
  DENTIN_HYPERSENSITIVITY_SEED_ID,
} from '../data/customWindowsManager';
import { CustomWindowBottomSheetModal } from './CustomWindowBottomSheetModal';

export const CustomWindowsAdminManager: React.FC = () => {
  // Local list state synchronized with localStorage and events
  const [windowsList, setWindowsList] = useState<CustomWindow[]>(() => getCustomWindows());

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetLocation, setTargetLocation] = useState<CustomWindowTargetLocation>('clinical_companion');
  const [contentType, setContentType] = useState<CustomWindowContentType>('text');
  const [content, setContent] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [badge, setBadge] = useState('بروتوكول جديد');
  const [icon, setIcon] = useState('Stethoscope');
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  // Status message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit states for existing windows
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editExternalUrl, setEditExternalUrl] = useState('');
  const [editTargetLocation, setEditTargetLocation] = useState<CustomWindowTargetLocation>('clinical_companion');

  // Preview modal state
  const [previewWindow, setPreviewWindow] = useState<CustomWindow | null>(null);

  // Filter for list
  const [filterLocation, setFilterLocation] = useState<'all' | CustomWindowTargetLocation>('all');

  // Dentin Hypersensitivity Protocol dedicated management state
  const hypersensitivityProtocol = windowsList.find(
    (w) =>
      w.id === DENTIN_HYPERSENSITIVITY_SEED_ID ||
      w.title.includes('فرط التحسس') ||
      w.title.toLowerCase().includes('hypersensitivity')
  );
  const [hyperNewContent, setHyperNewContent] = useState('');
  const [isEditingHyperContent, setIsEditingHyperContent] = useState(false);
  const [isUploadingHyperFile, setIsUploadingHyperFile] = useState(false);
  const hyperFileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync with real-time events across windows/tabs
  useEffect(() => {
    const handleSync = () => {
      setWindowsList(getCustomWindows());
    };
    window.addEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(PROTOCOL_CUSTOM_WINDOWS_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleSaveWindow = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان النافذة أو البطاقة');
      return;
    }

    if (!content.trim() && contentType !== 'link') {
      setErrorMsg('يرجى إدخال المحتوى التفصيلي للنافذة');
      return;
    }

    if (contentType === 'link' && !externalUrl.trim()) {
      setErrorMsg('يرجى إدخال الرابط الخارجي (URL)');
      return;
    }

    try {
      const created = addCustomWindow({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        targetLocation,
        contentType,
        content: content.trim(),
        externalUrl: contentType === 'link' ? externalUrl.trim() : undefined,
        badge: badge.trim() || undefined,
        icon,
        requiresSubscription,
        isHidden: false,
      });

      // Update local state immediately
      setWindowsList(getCustomWindows());

      // Reset form
      setTitle('');
      setSubtitle('');
      setContent('');
      setExternalUrl('');
      setBadge('بروتوكول جديد');
      setSuccessMsg(`تمت إضافة النافذة "${created.title}" وحفظها بنجاح وستظهر مباشرة في ${
        targetLocation === 'clinical_companion'
          ? 'الرفيق السريري'
          : targetLocation === 'protocols'
          ? 'البروتوكولات'
          : 'الرئيسية'
      }! ✨`);

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء حفظ النافذة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = (id: string, winTitle: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف النافذة: "${winTitle}" نهائياً؟`)) {
      const updated = deleteCustomWindow(id);
      setWindowsList(updated);
      setSuccessMsg(`تم حذف النافذة بنجاح!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDuplicate = (id: string, winTitle: string) => {
    const result = duplicateCustomWindow(id);
    if (result.newWindow) {
      setWindowsList(result.windows);
      setSuccessMsg(`تم نسخ وتكرار النافذة "${winTitle}" بنجاح! 📋`);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleToggleSubscription = (id: string) => {
    const updated = toggleCustomWindowSubscription(id);
    setWindowsList(updated);
    const win = updated.find((w) => w.id === id);
    setSuccessMsg(
      win?.requiresSubscription
        ? `تم قفل النافذة "${win.title}" للمشتركين فقط 🔒`
        : `تم فتح النافذة "${win?.title}" مجاناً للعامة 🔓`
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const startEditWindow = (win: CustomWindow) => {
    setEditingWindowId(win.id);
    setEditTitle(win.title);
    setEditSubtitle(win.subtitle || '');
    setEditContent(win.content);
    setEditExternalUrl(win.externalUrl || '');
    setEditTargetLocation(win.targetLocation);
  };

  const saveEditWindow = (id: string) => {
    if (!editTitle.trim()) {
      setErrorMsg('يرجى إدخال عنوان النافذة.');
      return;
    }
    const updated = updateCustomWindow(id, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || undefined,
      content: editContent.trim(),
      externalUrl: editExternalUrl.trim() || undefined,
      targetLocation: editTargetLocation,
    });
    setWindowsList(updated);
    setEditingWindowId(null);
    setSuccessMsg('تم حفظ وتعديل محتوى وموقع النافذة بنجاح! 💾');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // -------------------------------------------------------------
  // Dedicated Handlers for "بروتوكول علاج فرط التحسس العاجي"
  // -------------------------------------------------------------
  const handleDeleteHypersensitivity = () => {
    if (!hypersensitivityProtocol) return;
    if (window.confirm('هل أنتِ متأكدة من رغبتك في حذف "بروتوكول علاج فرط التحسس العاجي" نهائياً؟')) {
      const updated = deleteCustomWindow(hypersensitivityProtocol.id);
      setWindowsList(updated);
      setSuccessMsg('تم حذف بروتوكول علاج فرط التحسس العاجي نهائياً من النظام!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleRestoreHypersensitivity = () => {
    const defaultProto =
      DEFAULT_CUSTOM_WINDOWS.find((w) => w.id === DENTIN_HYPERSENSITIVITY_SEED_ID) ||
      DEFAULT_CUSTOM_WINDOWS[0];
    addCustomWindow({
      ...defaultProto,
      id: DENTIN_HYPERSENSITIVITY_SEED_ID,
      isHidden: false,
    });
    setWindowsList(getCustomWindows());
    setSuccessMsg('تمت استعادة وتفعيل بروتوكول علاج فرط التحسس العاجي بنجاح! ✨');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveHyperContent = () => {
    if (!hypersensitivityProtocol) return;
    if (!hyperNewContent.trim()) {
      setErrorMsg('يرجى كتابة محتوى أو رفع ملف أولاً.');
      return;
    }
    const updated = updateCustomWindow(hypersensitivityProtocol.id, {
      content: hyperNewContent.trim(),
    });
    setWindowsList(updated);
    setIsEditingHyperContent(false);
    setSuccessMsg('تم استبدال وحفظ محتوى بروتوكول فرط التحسس العاجي بنجاح! 💾');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleHyperFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hypersensitivityProtocol) return;

    setIsUploadingHyperFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setHyperNewContent(text);
        setIsEditingHyperContent(true);
        const updated = updateCustomWindow(hypersensitivityProtocol.id, {
          content: text.trim(),
        });
        setWindowsList(updated);
        setSuccessMsg(`تم استبدال محتوى البروتوكول بنجاح بمحتويات الملف: "${file.name}"! 📄✅`);
        setTimeout(() => setSuccessMsg(null), 5000);
      }
      setIsUploadingHyperFile(false);
    };

    reader.onerror = () => {
      setErrorMsg('تعذر قراءة الملف، يرجى التأكد من صيغة الملف والمحاولة ثانية.');
      setIsUploadingHyperFile(false);
    };

    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleToggleHideHypersensitivity = () => {
    if (!hypersensitivityProtocol) return;
    const newHiddenState = !hypersensitivityProtocol.isHidden;
    const updated = updateCustomWindow(hypersensitivityProtocol.id, {
      isHidden: newHiddenState,
    });
    setWindowsList(updated);
    setSuccessMsg(
      newHiddenState
        ? 'تم إخفاء بروتوكول فرط التحسس العاجي بالكامل عن جميع المستخدمين 🔒'
        : 'تم إظهار ونشر بروتوكول فرط التحسس العاجي للمستخدمين والمشتركين 👁️'
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleChangeHyperLocation = (loc: CustomWindowTargetLocation) => {
    if (!hypersensitivityProtocol) return;
    const updated = updateCustomWindow(hypersensitivityProtocol.id, {
      targetLocation: loc,
    });
    setWindowsList(updated);
    const locNames: Record<CustomWindowTargetLocation, string> = {
      clinical_companion: 'الرفيق السريري 🩺',
      skills: 'قسم مهاراتي 📘',
      more: 'قسم المزيد ☰',
      protocols: 'البروتوكولات والمكتبة 📋',
      home: 'الواجهة الرئيسية 🏠',
    };
    setSuccessMsg(`تم نقل بروتوكول فرط التحسس العاجي ليظهر في: ${locNames[loc]} بنجاح! 📍`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggleHide = (id: string) => {
    const updated = toggleCustomWindowHidden(id);
    setWindowsList(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد استعادة النوافذ والبطاقات النموذجية الافتراضية؟')) {
      saveCustomWindows(DEFAULT_CUSTOM_WINDOWS);
      setWindowsList(DEFAULT_CUSTOM_WINDOWS);
      setSuccessMsg('تمت استعادة النوافذ الافتراضية بنجاح.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const filteredList = windowsList.filter((win) => {
    if (filterLocation === 'all') return true;
    return win.targetLocation === filterLocation;
  });

  return (
    <div
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#343E26] shadow-sm space-y-8 text-right"
      dir="rtl"
    >
      {/* ------------------------------------------------------------- */}
      {/* Section Header */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                ➕ إضافة نافذة أو بطاقة جديدة (Add New Window/Card)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                Dynamic Window Manager
              </span>
            </div>
            <p className="text-xs text-[#736C5F] dark:text-[#A7A08E] mt-0.5">
              إنشاء نوافذ وبطاقات تفاعلية جديدة تظهر تلقائياً في (الرفيق السريري، البروتوكولات، أو الرئيسية) مع حفظ دائم في localStorage
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          title="استعادة النماذج السريرية الافتراضية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة النماذج</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SPECIAL SECTION: صلاحيات التحكم ببروتوكول علاج فرط التحسس العاجي */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-[#59662C]/10 dark:from-[#252014] dark:via-[#1B2216] dark:to-[#171D12] border-2 border-amber-500/40 dark:border-amber-600/50 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20 dark:border-amber-600/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  صلاحيات التحكم ببروتوكول علاج فرط التحسس العاجي (Dentin Hypersensitivity)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                  تحكم مشرف خاص
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                خيارات تحكم وإدارة فورية: حذف البروتوكول، استبدال محتواه بنص أو ملف جديد، إخفاؤه بالكامل عن المستخدمين، أو إظهاره
              </p>
            </div>
          </div>

          {/* Current Live State Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {hypersensitivityProtocol ? (
              <>
                {hypersensitivityProtocol.isHidden ? (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 flex items-center gap-1 shadow-2xs">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>مخفي عن المستخدمين 🔒</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>ظاهر للمستخدمين 👁️</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                  {hypersensitivityProtocol.targetLocation === 'clinical_companion'
                    ? 'الرفيق السريري 🩺'
                    : hypersensitivityProtocol.targetLocation === 'skills'
                    ? 'قسم مهاراتي 📘'
                    : hypersensitivityProtocol.targetLocation === 'more'
                    ? 'قسم المزيد ☰'
                    : hypersensitivityProtocol.targetLocation === 'protocols'
                    ? 'البروتوكولات 📋'
                    : 'الرئيسية 🏠'}
                </span>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>البروتوكول محذوف حالياً ❌</span>
              </span>
            )}
          </div>
        </div>

        {hypersensitivityProtocol ? (
          <div className="space-y-4">
            {/* Quick Action Buttons Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Action 1: Toggle Visibility (Hide/Show) */}
              <button
                type="button"
                onClick={handleToggleHideHypersensitivity}
                className={`p-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  hypersensitivityProtocol.isHidden
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                    : 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 border-amber-400'
                }`}
              >
                {hypersensitivityProtocol.isHidden ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>إظهار البروتوكول ونشره للمستخدمين 👁️</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>إخفاء البروتوكول بالكامل عن المستخدمين 🔒</span>
                  </>
                )}
              </button>

              {/* Action 2: Trigger Content Replacement via Text / File */}
              <button
                type="button"
                onClick={() => {
                  setIsEditingHyperContent(!isEditingHyperContent);
                  if (!hyperNewContent) setHyperNewContent(hypersensitivityProtocol.content);
                }}
                className="p-3 rounded-2xl text-xs font-black bg-white dark:bg-[#1E2519] border border-[#59662C]/40 text-[#59662C] dark:text-[#A4BF46] hover:bg-[#59662C]/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>استبدال المحتوى بنص جديد ✍️</span>
              </button>

              {/* Action 3: Trigger File Upload Replacement */}
              <button
                type="button"
                disabled={isUploadingHyperFile}
                onClick={() => hyperFileInputRef.current?.click()}
                className="p-3 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FileUp className="w-4 h-4" />
                <span>{isUploadingHyperFile ? 'جاري القراءة...' : 'استبدال المحتوى بملف (TXT/MD/DOC) 📁'}</span>
              </button>
              <input
                ref={hyperFileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf,text/*"
                onChange={handleHyperFileUpload}
                className="hidden"
              />

              {/* Action 4: Delete Protocol */}
              <button
                type="button"
                onClick={handleDeleteHypersensitivity}
                className="p-3 rounded-2xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف البروتوكول نهائياً 🗑️</span>
              </button>
            </div>

            {/* Change Location Dropdown for Hypersensitivity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E2519] border border-amber-300 dark:border-amber-900/40 gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-neutral-800 dark:text-neutral-200">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>موقع ظهور بروتوكول فرط التحسس في التطبيق:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={hypersensitivityProtocol.targetLocation}
                  onChange={(e) => handleChangeHyperLocation(e.target.value as CustomWindowTargetLocation)}
                  className="px-3 py-2 rounded-xl text-xs font-black bg-[#FAF7F2] dark:bg-[#161C12] border border-[#E5DEC9] dark:border-[#384524] text-neutral-800 dark:text-white cursor-pointer"
                >
                  <option value="clinical_companion">🩺 قسم الرفيق السريري (Clinical Companion)</option>
                  <option value="skills">📘 قسم مهاراتي / المهارات السريرية (Clinical Skills)</option>
                  <option value="more">☰ قسم المزيد / القائمة الجانبية (More / Drawer)</option>
                  <option value="protocols">📋 قسم البروتوكولات والمكتبة (Protocols)</option>
                  <option value="home">🏠 قسم الواجهة الرئيسية (Home Portal)</option>
                </select>
              </div>
            </div>

            {/* Content Replacement Form Drawer / Expandable Area */}
            {isEditingHyperContent && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2519] border border-amber-400 dark:border-amber-700/60 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <span>محتوى بروتوكول فرط التحسس العاجي الجديد:</span>
                    <span className="text-xs text-neutral-500 font-normal">(يمكن كتابته أو لصقه هنا أو استبداله بملف)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => hyperFileInputRef.current?.click()}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختيار ملف نصي</span>
                  </button>
                </div>
                <textarea
                  value={hyperNewContent}
                  onChange={(e) => setHyperNewContent(e.target.value)}
                  rows={6}
                  placeholder="اكتب المحتوى السريري الجديد لبروتوكول علاج فرط التحسس العاجي..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-[#FAF7F2] dark:bg-[#161C12] text-neutral-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#59662C]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingHyperContent(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHyperContent}
                    className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>اعتماد واستبدال المحتوى فوراً 💾</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                بروتوكول علاج فرط التحسس العاجي محذوف حالياً من النظام ولن يظهر للمشتركين.
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                يمكنك إعادة إنشائه واستعادته بكامل محتواه السريري المعتمد بنقرة واحدة.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRestoreHypersensitivity}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة إنشاء وتفعيل البروتوكول 🔄</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Interactive Creation Form */}
      {/* ------------------------------------------------------------- */}
      <form onSubmit={handleSaveWindow} className="p-5 sm:p-7 rounded-3xl bg-[#FAF7F2] dark:bg-[#161C12] border border-[#E5DEC9] dark:border-[#2C3720] space-y-6">
        <div className="flex items-center gap-2 text-xs font-black text-[#59662C] dark:text-[#A4BF46] pb-2 border-b border-[#E5DEC9]/80 dark:border-[#2C3720]">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>بيانات النافذة والبطاقة الجديدة:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Field 1: Window Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>عنوان النافذة (Window Title)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بروتوكول علاج فرط التحسس العاجي أو فحص الأشعة السنية"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
              required
            />
          </div>

          {/* Field 1.5: Subtitle / Summary */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              نبذة سريعة أو وصف مختصر (يظهر على وجه البطاقة)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="وصف مختصر لمساعدة الطبيب في التعرف السريع على محتوى النافذة..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
            />
          </div>

          {/* Field 2: Target Section / Location (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>مكان الظهور (Target Section / Location)</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value as CustomWindowTargetLocation)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-black focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white cursor-pointer"
            >
              <option value="clinical_companion">🩺 قسم الرفيق السريري (Clinical Companion Suite)</option>
              <option value="skills">📘 قسم مهاراتي / المهارات السريرية (Clinical Skills 4K)</option>
              <option value="more">☰ قسم المزيد / القائمة الجانبية (More / Side Drawer)</option>
              <option value="protocols">📋 قسم البروتوكولات والمكتبة السريرية (Protocols)</option>
              <option value="home">🏠 قسم الواجهة الرئيسية للتطبيق (Home Portal)</option>
            </select>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              حدد بدقة القسم الذي ترغب بظهور البطاقة أو النافذة بداخله.
            </p>
          </div>

          {/* Field 3: Category / Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>نوع المحتوى (Category / Type)</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as CustomWindowContentType)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-black focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white cursor-pointer"
            >
              <option value="text">📄 محتوى نصي وسريري (Text / Clinical Article)</option>
              <option value="checklist">✅ قائمة فحص تفاعلية (Interactive Checklist)</option>
              <option value="link">🔗 رابط خارجي أو مرجع طبي (External Link / Reference)</option>
            </select>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {contentType === 'text' && 'نص تفصيلي، خطوات، وملاحظات إكلينيكية.'}
              {contentType === 'checklist' && 'قائمة مربعات اختيار يمكن للطبيب فحصها وتأكيدها.'}
              {contentType === 'link' && 'رابط لمرجع معتمد أو موقع خارجي مع بطاقة معاينة.'}
            </p>
          </div>

          {/* Field 3.5: External URL (when contentType === 'link') */}
          {contentType === 'link' && (
            <div className="space-y-1.5 md:col-span-2 animate-fadeIn">
              <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span>الرابط الخارجي (External URL)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/clinical-guideline"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
                  required={contentType === 'link'}
                />
                <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Field 4: Main Content / Description */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span>المحتوى التفصيلي الكامل (Main Content / Description)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                {contentType === 'checklist' ? 'أدخل كل بند في سطر مستقل' : 'يدعم الأسطر المتعددة'}
              </span>
            </div>
            <textarea
              rows={contentType === 'checklist' ? 5 : 6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === 'checklist'
                  ? 'اكتب خطوات الفحص هنا، بحيث تضع كل خطوة في سطر منفصل:\n- فحص ضغط الدم والعلامات الحيوية\n- التحقق من حساسية البنسلين\n- فحص الأشعة الذروية السابقة'
                  : contentType === 'link'
                  ? 'اكتب شرحاً توضيحياً وملاحظات سريرية حول هذا الرابط والمرجع...'
                  : 'اكتب المحتوى السريري الكامل، الخطوات الإكلينيكية، والملاحظات هنا...'
              }
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs sm:text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white resize-y leading-relaxed"
              required={contentType !== 'link'}
            />
          </div>

          {/* Extra options: Badge text & Icon selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              نص الشارة / التاج (Badge Text)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="مثال: بروتوكول جديد، هام، تحديث"
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              أيقونة البطاقة (Card Icon)
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#59662C] dark:text-white cursor-pointer"
            >
              <option value="Stethoscope">🩺 سماعة طبية (Stethoscope)</option>
              <option value="ClipboardCheck">📋 قائمة فحص (ClipboardCheck)</option>
              <option value="FileText">📄 مستند ونصي (FileText)</option>
              <option value="Link">🔗 رابط خارجي (Link)</option>
              <option value="Pill">💊 دواء ومسكن (Pill)</option>
              <option value="Syringe">💉 حقنة وتخدير (Syringe)</option>
              <option value="Bookmark">🔖 إشارة مرجعية (Bookmark)</option>
            </select>
          </div>

          {/* Subscription Access Toggle */}
          <div className="md:col-span-2 pt-2 border-t border-[#E5DEC9]/80 dark:border-[#2C3720] flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 block">
                مستوى الصلاحية والوصول (Access Permission)
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {requiresSubscription ? '🔒 يتطلب اشتراك فعال وكود تفعيل' : '🔓 متاح للعامة مجاناً لجميع زوار التطبيق'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setRequiresSubscription(!requiresSubscription)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                requiresSubscription
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40 shadow-xs'
                  : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 shadow-xs'
              }`}
            >
              {requiresSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>يتطلب اشتراك</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>مجاني للعامة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#59662C] via-[#6B7B34] to-[#455022] hover:from-[#495424] hover:to-[#38411b] text-white text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>إضافة النافذة (Save Window)</span>
          </button>
        </div>
      </form>

      {/* ------------------------------------------------------------- */}
      {/* 2. List of Added Windows & Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <span>النوافذ والبطاقات المحفوظة حالياً:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46]">
                {windowsList.length}
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              يمكنك معاينة أي نافذة كما تظهر للمستخدم، أو إخفائها مؤقتاً، أو حذفها نهائياً.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterLocation('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'all'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              الكل ({windowsList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterLocation('clinical_companion')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'clinical_companion'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              الرفيق السريري
            </button>
            <button
              type="button"
              onClick={() => setFilterLocation('skills')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'skills'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              مهاراتي
            </button>
            <button
              type="button"
              onClick={() => setFilterLocation('more')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'more'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              المزيد
            </button>
            <button
              type="button"
              onClick={() => setFilterLocation('protocols')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'protocols'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              البروتوكولات
            </button>
            <button
              type="button"
              onClick={() => setFilterLocation('home')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterLocation === 'home'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              الرئيسية
            </button>
          </div>
        </div>

        {/* Windows Grid */}
        {filteredList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#161C12] border border-dashed border-[#E5DEC9] dark:border-[#2C3720] text-center space-y-2">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-xs font-bold text-neutral-500">
              لا توجد نوافذ مضافة في هذا القسم حالياً. يمكنك استخدام النموذج أعلاه لإضافة نافذة جديدة فوراً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((win, idx) => {
              const locationLabel =
                win.targetLocation === 'clinical_companion'
                  ? 'الرفيق السريري'
                  : win.targetLocation === 'skills'
                  ? 'مهاراتي'
                  : win.targetLocation === 'more'
                  ? 'المزيد'
                  : win.targetLocation === 'protocols'
                  ? 'البروتوكولات'
                  : 'الرئيسية';

              const typeLabel =
                win.contentType === 'text'
                  ? 'نصي'
                  : win.contentType === 'checklist'
                  ? 'قائمة فحص'
                  : 'رابط';

              return (
                <div
                  key={`${win.id || 'win'}_${idx}`}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                    win.isHidden
                      ? 'bg-neutral-100/70 dark:bg-[#181D13] border-dashed border-neutral-300 dark:border-neutral-800 opacity-75'
                      : 'bg-[#FAF7F2] dark:bg-[#161C12] border-[#E5DEC9] dark:border-[#2C3720] shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                          📍 {locationLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-200">
                          {typeLabel}
                        </span>
                        {win.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {win.badge}
                          </span>
                        )}
                        {/* Access Control Badge / Quick Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleSubscription(win.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 ${
                            win.requiresSubscription
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          }`}
                          title="اضغط للتبديل بين مجاني أو اشتراك"
                        >
                          {win.requiresSubscription ? (
                            <>
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>🔒 يتطلب اشتراك</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                              <span>🔓 مجاني للعامة</span>
                            </>
                          )}
                        </button>
                      </div>

                      {win.isHidden ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>مخفي</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" />
                          <span>ظاهر</span>
                        </span>
                      )}
                    </div>

                    {editingWindowId === win.id ? (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-2">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                            العنوان:
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                            الوصف المختصر:
                          </label>
                          <input
                            type="text"
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                            المحتوى التفصيلي:
                          </label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        {win.contentType === 'link' && (
                          <div>
                            <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                              الرابط (URL):
                            </label>
                            <input
                              type="text"
                              value={editExternalUrl}
                              onChange={(e) => setEditExternalUrl(e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                            مكان الظهور (Target Section / Location):
                          </label>
                          <select
                            value={editTargetLocation}
                            onChange={(e) => setEditTargetLocation(e.target.value as CustomWindowTargetLocation)}
                            className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white cursor-pointer font-bold"
                          >
                            <option value="clinical_companion">🩺 قسم الرفيق السريري (Clinical Companion)</option>
                            <option value="skills">📘 قسم مهاراتي / المهارات السريرية (Clinical Skills 4K)</option>
                            <option value="more">☰ قسم المزيد / القائمة الجانبية (More / Drawer)</option>
                            <option value="protocols">📋 قسم البروتوكولات والمكتبة السريرية (Protocols)</option>
                            <option value="home">🏠 قسم الواجهة الرئيسية (Home Portal)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingWindowId(null)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditWindow(win.id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>حفظ التعديل</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-black text-neutral-900 dark:text-white leading-snug">
                            {win.title}
                          </h4>
                          {win.subtitle && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1">
                              {win.subtitle}
                            </p>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {win.content}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#E5DEC9]/80 dark:border-[#2C3720] flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreviewWindow(win)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>معاينة النافذة</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => (editingWindowId === win.id ? setEditingWindowId(null) : startEditWindow(win))}
                        className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2519] text-neutral-700 dark:text-neutral-300 border border-[#E5DEC9] dark:border-[#323D24] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                        title="تعديل نصوص ومحتوى النافذة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(win.id, win.title)}
                        className="p-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40 hover:bg-sky-100 transition-all cursor-pointer"
                        title="نسخ وتكرار النافذة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Visibility Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(win.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          win.isHidden
                            ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                            : 'bg-white dark:bg-[#1E2519] text-neutral-600 dark:text-neutral-300 border-[#E5DEC9] dark:border-[#323D24] hover:bg-neutral-100'
                        }`}
                        title={win.isHidden ? 'إظهار النافذة للعامة' : 'إخفاء النافذة'}
                      >
                        {win.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(win.id, win.title)}
                        className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2519] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        title="حذف النافذة نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewWindow && (
        <CustomWindowBottomSheetModal
          windowItem={previewWindow}
          isOpen={!!previewWindow}
          onClose={() => setPreviewWindow(null)}
          isAuthorAdmin={true}
          isContentUnlocked={true}
        />
      )}
    </div>
  );
};
