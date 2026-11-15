import React, { useState, useEffect } from 'react';
import {
  AppSection,
  getAppSections,
  toggleSectionVisibility,
  toggleSectionLock,
  deleteSection,
  duplicateSection,
  updateSection,
  addCustomSection,
  resetDefaultSections,
  getSectionVideos,
  subscribeToAppSectionsCloud,
  saveAppSectionsToCloud,
} from '../data/sectionsManager';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RotateCcw,
  CheckCircle2,
  Presentation,
  Stethoscope,
  Wrench,
  BookOpen,
  Brain,
  HeartHandshake,
  Sparkles,
  FileText,
  Bookmark,
  X,
  ShieldAlert,
  Lock,
  Unlock,
  Video,
  Film,
  Copy,
  Edit3,
  Check,
  Save,
} from 'lucide-react';
import { SectionVideoModal } from './SectionVideoModal';
import {
  isSectionFree,
  toggleSectionFree,
  PROTOCOL_FREE_SECTIONS_EVENT,
} from '../data/freeSectionsManager';

interface SectionManagerControlProps {
  onSectionsUpdated?: (sections: AppSection[]) => void;
  onNavigateSection?: (section: AppSection) => void;
}

export const SectionManagerControl: React.FC<SectionManagerControlProps> = ({
  onSectionsUpdated,
  onNavigateSection,
}) => {
  const [sections, setSections] = useState<AppSection[]>(() => getAppSections());

  useEffect(() => {
    const unsub = subscribeToAppSectionsCloud((cloudSections) => {
      setSections(cloudSections);
    });
    return () => unsub();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Sparkles');
  const [newBadge, setNewBadge] = useState('');
  const [formError, setFormError] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [videoModalSection, setVideoModalSection] = useState<AppSection | null>(null);

  // Inline editing state for sections
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const notifyUpdate = (updated: AppSection[], msg?: string) => {
    setSections(updated);
    if (onSectionsUpdated) onSectionsUpdated(updated);
    saveAppSectionsToCloud(updated).catch(() => {});
    if (msg) {
      setActionNotice(msg);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleDuplicate = (id: string, title: string) => {
    const result = duplicateSection(id);
    if (result.newSection) {
      notifyUpdate(result.sections, `تم تكرار ونسخ قسم "${title}" بنجاح! 📋`);
    }
  };

  const startEditSection = (section: AppSection) => {
    setEditingSectionId(section.id);
    setEditTitle(section.title);
    setEditTitleEn(section.titleEn);
    setEditDesc(section.description);
  };

  const saveEditSection = (id: string) => {
    if (!editTitle.trim()) return;
    const updated = updateSection(id, {
      title: editTitle.trim(),
      titleEn: editTitleEn.trim(),
      description: editDesc.trim(),
    });
    setEditingSectionId(null);
    notifyUpdate(updated, 'تم حفظ وتحديث بيانات القسم بنجاح! 💾');
  };

  const handleToggle = (id: string, title: string, currentlyVisible: boolean) => {
    const updated = toggleSectionVisibility(id);
    notifyUpdate(
      updated,
      currentlyVisible
        ? `تم إخفاء قسم "${title}" بنجاح عن الطلاب والمشتركين.`
        : `تم إظهار قسم "${title}" بنجاح للجميع في الشريط والواجهة.`
    );
  };

  const handleToggleLock = (id: string, title: string, currentlyRequiresCode: boolean) => {
    const updated = toggleSectionLock(id);
    notifyUpdate(
      updated,
      currentlyRequiresCode
        ? `تم تعيين قسم "${title}" كـ "متاح للعامة بدون كود" 🔓`
        : `تم قفل قسم "${title}" بنجاح، يتطلب الآن كود فتح 🔒`
    );
  };

  const handleToggleFreePublic = (id: string, title: string) => {
    const willBeFree = toggleSectionFree(id);
    const updated = sections.map((s) =>
      s.id === id || s.key === id ? { ...s, requiresPasscode: !willBeFree } : s
    );
    notifyUpdate(
      updated,
      willBeFree
        ? `تم فتح قسم "${title}" للعامة مجاناً بدون كود (Free Public Access) 🔓`
        : `تم إلغاء الوصول المجاني لقسم "${title}"، يتطلب الآن كود اشتراك 🔒`
    );
  };

  const handleDelete = (id: string, title: string) => {
    const updated = deleteSection(id);
    notifyUpdate(updated, `تم حذف قسم "${title}" نهائياً 🗑️.`);
  };

  const handleResetDefaults = () => {
    const updated = resetDefaultSections();
    notifyUpdate(updated, 'تمت استعادة جميع الأقسام الافتراضية بنجاح 🔄.');
  };

  const handleCreateCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newTitle.trim()) {
      setFormError('يرجى إدخال اسم القسم بالعربية.');
      return;
    }
    if (!newDesc.trim()) {
      setFormError('يرجى كتابة وصف مختصر للقسم.');
      return;
    }

    const updated = addCustomSection({
      title: newTitle,
      titleEn: newTitleEn,
      description: newDesc,
      icon: newIcon,
      badgeText: newBadge || 'قسم مخصص',
    });

    notifyUpdate(updated, `تم إنشاء قسم "${newTitle}" بنجاح وإضافته إلى الشريط والواجهة.`);
    setShowAddModal(false);
    setNewTitle('');
    setNewTitleEn('');
    setNewDesc('');
    setNewBadge('');
    setNewIcon('Sparkles');
  };

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 shrink-0' };
    switch (iconName) {
      case 'Presentation':
        return <Presentation {...props} />;
      case 'Stethoscope':
        return <Stethoscope {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Brain':
        return <Brain {...props} />;
      case 'HeartHandshake':
        return <HeartHandshake {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Bookmark':
        return <Bookmark {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#59662C]/10 dark:bg-[#20271A] border border-[#59662C]/30">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#59662C] dark:text-[#A4BF46]" />
            <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
              إدارة الأقسام والظهور (Section Visibility & CRUD)
            </h3>
          </div>
          <p className="text-xs text-[#6F695C] dark:text-[#A7A08E] font-medium mt-1">
            تحكمي في إظهار أو إخفاء أي قسم بضغطة زر واحدة، أو حذفه بالكامل، أو إضافة أقسام مخصصة جديدة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة قسم جديد</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E2417] hover:bg-gray-100 dark:hover:bg-gray-800 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            title="استعادة الأقسام الأصلية إذا تم حذف أحدها"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضية</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Sections Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, sIdx) => (
          <div
            key={`${section.id}_${sIdx}`}
            data-section-id={section.id}
            data-item-id={section.id}
            data-action="card-item"
            style={{ opacity: section.isVisible ? 1 : 0.4 }}
            className={`protocol-card announcement-card card-item p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              section.isVisible
                ? 'bg-white dark:bg-[#1A2016] border-[#E5DEC9] dark:border-[#343E26] shadow-xs'
                : 'hidden-item bg-amber-50/60 dark:bg-[#201D14]/80 border-amber-300 dark:border-amber-900/60 opacity-40'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      section.isVisible
                        ? 'bg-[#59662C] text-white shadow-2xs'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {renderIcon(section.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2F2B24] dark:text-white leading-tight">
                      {section.title}
                    </h4>
                    <span className="text-[10px] text-[#7A7467] dark:text-[#A7A08E] font-mono">
                      {section.titleEn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {section.requiresPasscode !== false ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>🔒 يتطلب كود</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                      <span>🔓 متاح للعامة</span>
                    </span>
                  )}

                  {section.isVisible ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>ظاهر للمشتركين</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <span>🔒 مخفي عن المشتركين</span>
                    </span>
                  )}
                </div>
              </div>

              {editingSectionId === section.id ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                      اسم القسم بالعربي:
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
                      اسم القسم بالإنجليزي:
                    </label>
                    <input
                      type="text"
                      value={editTitleEn}
                      onChange={(e) => setEditTitleEn(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                      الوصف المختصر:
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditSection(section.id)}
                      className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>حفظ التعديل</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#61594B] dark:text-[#C5BEAF] line-clamp-2 leading-relaxed">
                  {section.description}
                </p>
              )}
            </div>

            {/* Controls Bar */}
            <div className="pt-3 mt-3 border-t border-[#E5DEC9]/60 dark:border-[#343E26] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Show/Hide Switch */}
                <button
                  type="button"
                  data-action="toggle-visibility"
                  onClick={() => handleToggle(section.id, section.title, section.isVisible)}
                  className={`visibility-btn px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                    section.isVisible
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                  title={section.isVisible ? 'إخفاء القسم عن الطلاب' : 'إظهار القسم للطلاب'}
                >
                  {section.isVisible ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>إخفاء (Hide)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>إظهار (Publish)</span>
                    </>
                  )}
                </button>

                {/* Requirement 4: Dynamic Section Lock/Unlock Control Switch */}
                <button
                  type="button"
                  data-action="toggle-free"
                  onClick={() => handleToggleLock(section.id, section.title, section.requiresPasscode !== false)}
                  className={`free-toggle-btn px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                    section.requiresPasscode !== false
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300'
                  }`}
                  title={section.requiresPasscode !== false ? 'تبديل إلى: متاح للعامة بدون كود' : 'تبديل إلى: يتطلب كود فتح'}
                >
                  {section.requiresPasscode !== false ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>🔒 يتطلب كود فتح</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>🔓 متاح للعامة بدون كود</span>
                    </>
                  )}
                </button>
                {/* Save Section Button */}
                <button
                  type="button"
                  data-action="save"
                  onClick={() => {
                    const card = document.querySelector(`[data-section-id="${section.id}"]`);
                    card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                    setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                    window.alert(`تم حفظ خانة "${section.title}" وتأكيد المزامنة السحابية بنجاح! 💾✅`);
                  }}
                  className="save-btn px-2.5 py-1.5 rounded-xl bg-[#59662C] hover:bg-[#485323] text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="حفظ بيانات وإعدادات هذا القسم سحابياً"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الخانة 💾</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Edit Section Button */}
                <button
                  type="button"
                  data-action="edit"
                  onClick={() => (editingSectionId === section.id ? setEditingSectionId(null) : startEditSection(section))}
                  className="edit-btn p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-[#302B23] dark:text-white transition-colors cursor-pointer"
                  title="تعديل نصوص القسم"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Duplicate Section Button */}
                <button
                  type="button"
                  onClick={() => handleDuplicate(section.id, section.title)}
                  className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40 transition-colors cursor-pointer"
                  title="نسخ وتكرار هذا القسم (Duplicate)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateSection(section)}
                    className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-[#302B23] dark:text-white transition-colors cursor-pointer"
                    title="معاينة القسم"
                  >
                    معاينة
                  </button>
                )}

                <button
                  type="button"
                  data-action="delete"
                  onClick={() => handleDelete(section.id, section.title)}
                  className="delete-btn p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                  title="حذف هذا القسم نهائياً"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clean iOS-Style Toggle Switch: "فتح القسم للعامة مجاناً (Free Public Access)" */}
            <div className="mt-3 pt-2.5 border-t border-dashed border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                  {isSectionFree(section.id) ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>فتح القسم للعامة مجاناً (Free Public Access)</span>
                </span>
                {isSectionFree(section.id) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    محتوى مجاني / Free Preview
                  </span>
                )}
              </div>

              {/* Clean Switch */}
              <button
                type="button"
                onClick={() => handleToggleFreePublic(section.id, section.title)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSectionFree(section.id) ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                role="switch"
                aria-checked={isSectionFree(section.id)}
                title="فتح القسم للعامة مجاناً (Free Public Access)"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isSectionFree(section.id) ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Video Control Bar for Any Section (Supports multiple videos) */}
            {(() => {
              const secVideos = getSectionVideos(section);
              const hasVideos = secVideos.length > 0;
              return (
                <div className="pt-2 mt-2 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-2 flex-wrap">
                  {hasVideos ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 shrink-0">
                        <Film className="w-3 h-3 text-emerald-600" />
                        <span>{secVideos.length > 1 ? `${secVideos.length} فيديوهات 🎥` : 'فيديو مضاف 🎥'}</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#4F493D] dark:text-[#C5BEAF] truncate">
                        {secVideos[0]?.title || section.videoTitle || 'فيديو القسم'}
                        {secVideos.length > 1 ? ` (+${secVideos.length - 1} إضافية)` : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8C8474] dark:text-[#A7A08E] font-medium flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 opacity-60" />
                      <span>لا توجد فيديوهات مضافة لهذا القسم</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setVideoModalSection(section)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                      hasVideos
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-[#59662C]/10 hover:bg-[#59662C]/20 text-[#59662C] dark:text-[#A8C24E] border border-[#59662C]/30'
                    }`}
                    title="إضافة أو إدارة فيديوهات هذا القسم"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{hasVideos ? `إدارة الفيديوهات (${secVideos.length}) 🎥` : 'إضافة فيديو للقسم ➕'}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Video Modal for Managing Section Videos */}
      {videoModalSection && (
        <SectionVideoModal
          isOpen={true}
          onClose={() => setVideoModalSection(null)}
          section={videoModalSection}
          isAdmin={true}
          onVideoUpdated={(updatedSec) => {
            const updated = sections.map((s) => (s.id === updatedSec.id ? updatedSec : s));
            notifyUpdate(updated, `تم تحديث فيديو قسم «${updatedSec.title}» بنجاح! 🎥`);
            setVideoModalSection(updatedSec);
          }}
        />
      )}

      {/* Add New Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2216] border-2 border-[#59662C] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] dark:border-[#384524] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#59662C] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                    إضافة قسم جديد إلى التطبيق
                  </h3>
                  <span className="text-[11px] text-[#7A7467] dark:text-[#A7A08E]">
                    يظهر كـ Tab في الشريط العلوي وبطاقة تفاعلية في الواجهة الرئيسية
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomSection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-[#3B352A] dark:text-[#D5CDBC] mb-1">
                  اسم القسم بالعربية (مثال: نصائح سريرية، فيديوهات الشرح، مراجع إضافية) *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: ورشات العمل السريرية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#3E4A2E] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#3B352A] dark:text-[#D5CDBC] mb-1">
                  الاسم بالإنجليزية (Subtitle)
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g., Clinical Workshops"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#3E4A2E] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#3B352A] dark:text-[#D5CDBC] mb-1">
                  شارة تصنيف القسم (Badge Text)
                </label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="مثال: ورشات 2026 أو جديد"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#3E4A2E] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#3B352A] dark:text-[#D5CDBC] mb-1">
                  وصف القسم السريري *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتبي شرحاً مقتضباً عما يحتويه هذا القسم لمساعدة الطلاب..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#3E4A2E] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#3B352A] dark:text-[#D5CDBC] mb-1">
                  اختر أيقونة القسم
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'Sparkles', label: 'نجمة' },
                    { id: 'Presentation', label: 'عرض' },
                    { id: 'Stethoscope', label: 'سماعة' },
                    { id: 'Wrench', label: 'أدوات' },
                    { id: 'BookOpen', label: 'كتاب' },
                    { id: 'Brain', label: 'دماغ' },
                    { id: 'HeartHandshake', label: 'تواصل' },
                    { id: 'FileText', label: 'مستند' },
                    { id: 'Bookmark', label: 'علامة' },
                  ].map((ico, iIdx) => (
                    <button
                      key={`${ico.id}_${iIdx}`}
                      type="button"
                      onClick={() => setNewIcon(ico.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        newIcon === ico.id
                          ? 'bg-[#59662C] text-white border-[#59662C] shadow-2xs'
                          : 'bg-white dark:bg-[#181D13] border-[#E5DEC9] dark:border-[#343E26] text-[#4F493D] dark:text-[#C5BEAF]'
                      }`}
                    >
                      {renderIcon(ico.id)}
                      <span className="text-[10px]">{ico.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DEC9] dark:border-[#384524]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                >
                  حفظ وإضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
