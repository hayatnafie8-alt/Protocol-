import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Edit3,
  Layers,
  BookOpen,
  Home,
  ShieldCheck,
  Plus,
  X,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  INITIAL_APP_TEXTS,
  AppTextItem,
  TextModuleId,
  subscribeToAppTextsCloud,
  saveAppTextOverrideInCloud,
  resetAppTextToDefaultInCloud,
  resetAllAppTextsToDefaultInCloud,
} from '../services/appTextManager';

interface InternalTextEditingPanelProps {
  isAuthorAdmin: boolean;
  initialModule?: string;
  onClose?: () => void;
}

export const InternalTextEditingPanel: React.FC<InternalTextEditingPanelProps> = ({
  isAuthorAdmin,
  initialModule = 'all',
  onClose,
}) => {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Text Modal
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newModule, setNewModule] = useState<TextModuleId>('general_labels');
  const [newDefaultText, setNewDefaultText] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeToAppTextsCloud((cloudOverrides) => {
      setOverrides(cloudOverrides);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const modulesList: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'كافة الأقسام والشاشات', icon: Layers },
    { id: 'drug_guide', label: 'دليل وصف الأدوية 💊', icon: BookOpen },
    { id: 'home_portal', label: 'البوابة الرئيسية والترحيب 🏛️', icon: Home },
    { id: 'clinical_protocols', label: 'البروتوكولات والحشوات 🦷', icon: Edit3 },
    { id: 'security_notices', label: 'الأمان والتنبيهات 🔒', icon: ShieldCheck },
    { id: 'general_labels', label: 'مصطلحات عامة 🏷️', icon: FileText },
  ];

  // Combined list of texts (both initial presets and any custom added keys)
  const allTextsList: AppTextItem[] = useMemo(() => {
    const map = new Map<string, AppTextItem>();

    INITIAL_APP_TEXTS.forEach((item) => {
      map.set(item.key, {
        ...item,
        currentText: overrides[item.key] !== undefined ? overrides[item.key] : item.defaultText,
      });
    });

    // Check for any extra custom keys in overrides not in initial list
    Object.keys(overrides).forEach((key) => {
      if (!map.has(key)) {
        map.set(key, {
          key,
          module: 'general_labels',
          moduleLabelAr: 'نصوص إضافية مخصصة',
          labelAr: key,
          defaultText: '',
          currentText: overrides[key],
          isMultiline: overrides[key].length > 60,
        });
      }
    });

    return Array.from(map.values());
  }, [overrides]);

  // Filtered texts
  const filteredTexts = useMemo(() => {
    return allTextsList.filter((item) => {
      if (selectedModule !== 'all' && item.module !== selectedModule) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesKey = item.key.toLowerCase().includes(q);
        const matchesLabel = item.labelAr.toLowerCase().includes(q);
        const matchesCurrent = item.currentText.toLowerCase().includes(q);
        const matchesDefault = item.defaultText.toLowerCase().includes(q);
        return matchesKey || matchesLabel || matchesCurrent || matchesDefault;
      }
      return true;
    });
  }, [allTextsList, selectedModule, searchQuery]);

  const handleStartEditing = (item: AppTextItem) => {
    setActiveEditorKey(item.key);
    setDraftText(item.currentText);
  };

  const handleSaveText = async (key: string) => {
    setIsSaving(true);
    try {
      await saveAppTextOverrideInCloud(key, draftText);
      setActiveEditorKey(null);
      showToast('تم حفظ التعديل سحابياً بنجاح! سينعكس فوراً لدى جميع المستخدمين ✅');
    } catch {
      showToast('فشل حفظ النص السحابي. يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async (key: string, label: string) => {
    if (!window.confirm(`هل أنت متأكد من استعادة النص الأصلي الافتراضي لـ "${label}"؟`)) {
      return;
    }
    setIsSaving(true);
    try {
      await resetAppTextToDefaultInCloud(key);
      if (activeEditorKey === key) {
        setActiveEditorKey(null);
      }
      showToast(`تمت استعادة النص الأصلي لـ "${label}" بنجاح 🔄`);
    } catch {
      showToast('تعذر استعادة النص الأصلي.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newDefaultText.trim()) return;

    const formattedKey = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    await saveAppTextOverrideInCloud(formattedKey, newDefaultText.trim());
    showToast(`تمت إضافة النص الجديد "${newLabel || formattedKey}" بنجاح!`);
    setShowAddCustomModal(false);
    setNewKey('');
    setNewLabel('');
    setNewDefaultText('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn" dir="rtl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] px-5 py-3 rounded-2xl bg-[#596628] text-white text-xs font-black shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] dark:from-[#181D13] dark:via-[#1E2519] dark:to-[#141810] border-2 border-[#59662C]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                لوحة تحكم المشرف فقط | Admin Privileges
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300">
                تعديل نصوص فوري بدون إعادة نشر ⚡
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-[#59662C] dark:text-[#A4BF46]" />
              <span>لوحة تعديل النصوص الداخلية (Internal Text Editing Panel)</span>
            </h2>
            <p className="text-xs text-[#524C3F] dark:text-[#C5BFB0] leading-relaxed max-w-3xl">
              تتيح لك هذه اللوحة استعراض كافة النصوص الثابتة، العناوين، الأوصاف، والتنبيهات المعتمدة عبر أقسام التطبيق وتعديلها أو تصحيحها يدوياً بلحظة واحدة مع حفظها سحابياً لتعكس فوراً للمشتركين دون الحاجة لكتابة أو نشر أي شيفرة برمجية.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نص مخصص جديد</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Modules Bar */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في أي عنوان، وصف، مفتاح، أو نص عبر التطبيق..."
                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
              />
            </div>

            <span className="text-xs font-bold text-gray-500 whitespace-nowrap self-center">
              عدد النصوص المطابقة: <strong>{filteredTexts.length}</strong>
            </span>
          </div>

          {/* Module Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {modulesList.map((m) => {
              const IconComp = m.icon;
              const isSelected = selectedModule === m.id;
              const count =
                m.id === 'all'
                  ? allTextsList.length
                  : allTextsList.filter((t) => t.module === m.id).length;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModule(m.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#59662C] text-white shadow-xs'
                      : 'bg-white dark:bg-[#161B11] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Texts List Grid */}
      <div className="space-y-4">
        {filteredTexts.map((item) => {
          const isOverridden = overrides[item.key] !== undefined && overrides[item.key] !== item.defaultText;
          const isCurrentlyEditing = activeEditorKey === item.key;

          return (
            <div
              key={item.key}
              className={`p-5 rounded-3xl border-2 transition-all space-y-3.5 bg-white dark:bg-[#1E2417] text-right shadow-xs ${
                isOverridden
                  ? 'border-[#59662C]/60 dark:border-[#8CA33C]/60 bg-emerald-50/15 dark:bg-[#182012]/40'
                  : 'border-[#E5DEC9] dark:border-[#384524]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                    {item.moduleLabelAr}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    KEY: {item.key}
                  </span>
                  {isOverridden && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                      معدل سحابياً (Customized) ⚡
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isCurrentlyEditing ? (
                    <button
                      type="button"
                      onClick={() => handleStartEditing(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل النص</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveEditorKey(null)}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer"
                    >
                      إلغاء التعديل
                    </button>
                  )}

                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(item.key, item.labelAr)}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 text-xs font-bold hover:bg-rose-100 cursor-pointer flex items-center gap-1 transition-all"
                      title="استعادة النص الافتراضي الأصلي"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة الافتراضي</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                  {item.labelAr}
                </h4>
              </div>

              {/* Current Active Text vs Live Editor */}
              {!isCurrentlyEditing ? (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#151910] border border-gray-200 dark:border-gray-800 text-xs text-[#2F2B24] dark:text-[#E8E2D5] font-medium leading-relaxed whitespace-pre-wrap select-text">
                  {item.currentText}
                </div>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                    <span>محرر النص المباشر:</span>
                    <span>عدد الأحرف: {draftText.length}</span>
                  </div>

                  <textarea
                    rows={item.isMultiline || draftText.length > 80 ? 4 : 2}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="اكتب التعديل الجديد لهذا النص..."
                    className="w-full p-3.5 bg-[#FAF7F2] dark:bg-[#141810] rounded-2xl border-2 border-[#59662C] font-medium text-xs text-[#2F2B24] dark:text-white focus:outline-none shadow-inner"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400">
                      سيتم حفظ التعديل فورياً في قاعدة البيانات ومزامنتها لحظياً لجميع الأطباء والطلاب.
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSaveText(item.key)}
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديل سحابياً 💾'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Default Reference Text (if overridden) */}
              {isOverridden && item.defaultText && (
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#12150E] border border-dashed border-gray-300 dark:border-gray-700 text-[11px] text-gray-500 space-y-0.5">
                  <span className="font-bold block">النص الافتراضي في النظام:</span>
                  <p className="line-clamp-2">{item.defaultText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Text Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCustomText}
            className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#1D2218] border-2 border-[#59662C] shadow-2xl space-y-4 text-right animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#59662C]" />
                <span>إضافة نص مخصص جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">المفتاح البرمجي (Key Name بالإنجليزية):*</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. custom_disclaimer_footer"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">العنوان التوضيحي بالعربية:*</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="مثال: تنبيه إضافي أسفل شاشة الأدوية"
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2F2B24] dark:text-white">محتوى النص الجديد:*</label>
                <textarea
                  rows={4}
                  required
                  value={newDefaultText}
                  onChange={(e) => setNewDefaultText(e.target.value)}
                  placeholder="اكتب المحتوى الذي ترغب في إظهاره..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-gray-300 dark:border-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white font-black cursor-pointer shadow-md"
              >
                حفظ النص الجديد 💾
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
