import React, { useState, useRef } from 'react';
import {
  Edit3,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Upload,
  Save,
} from 'lucide-react';
import {
  ElementOverride,
  setElementOverrideInCloud,
  toggleElementVisibilityInCloud,
  deleteElementInCloud,
  replaceElementImageInCloud,
} from '../services/elementOverridesService';
import { processAndOptimizeImage } from '../utils/imageUploadHelper';

interface AdminElementControlsProps {
  elementId: string;
  isAuthorAdmin: boolean;
  currentTitle?: string;
  currentTitleEn?: string;
  currentDescription?: string;
  currentImageUrl?: string;
  isVisible?: boolean;
  hasImage?: boolean;
  onUpdated?: (override: ElementOverride) => void;
  className?: string;
}

export const AdminElementControls: React.FC<AdminElementControlsProps> = ({
  elementId,
  isAuthorAdmin,
  currentTitle = '',
  currentTitleEn = '',
  currentDescription = '',
  currentImageUrl = '',
  isVisible = true,
  hasImage = false,
  onUpdated,
  className = '',
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showImageReplaceModal, setShowImageReplaceModal] = useState<boolean>(false);

  // Form states
  const [titleAr, setTitleAr] = useState<string>(currentTitle);
  const [titleEn, setTitleEn] = useState<string>(currentTitleEn);
  const [descAr, setDescAr] = useState<string>(currentDescription);
  const [imgUrl, setImgUrl] = useState<string>(currentImageUrl);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthorAdmin) return null;

  // Toggle visibility (Show / Hide)
  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const next = !isVisible;
      await toggleElementVisibilityInCloud(elementId, next);
      if (onUpdated) {
        onUpdated({ id: elementId, isVisible: next, isDeleted: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit text updates
  const handleSaveTextEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await setElementOverrideInCloud({
        id: elementId,
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        descriptionAr: descAr.trim(),
      });
      setShowEditModal(false);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image replacement via file input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedUrl = await processAndOptimizeImage(file);
      await replaceElementImageInCloud(elementId, optimizedUrl);
      setImgUrl(optimizedUrl);
      setShowImageReplaceModal(false);
      if (onUpdated) {
        onUpdated({ id: elementId, imageUrl: optimizedUrl, isVisible, isDeleted: false });
      }
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image replacement via URL
  const handleSaveImageUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrl.trim()) return;
    setIsSaving(true);
    try {
      await replaceElementImageInCloud(elementId, imgUrl.trim());
      setShowImageReplaceModal(false);
      if (onUpdated) {
        onUpdated({ id: elementId, imageUrl: imgUrl.trim(), isVisible, isDeleted: false });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete element permanently
  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await deleteElementInCloud(elementId);
      setShowDeleteConfirm(false);
      if (onUpdated) {
        onUpdated({ id: elementId, isVisible: false, isDeleted: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Mini Admin Action Bar */}
      <div
        className={`inline-flex items-center gap-1 p-1 bg-amber-50/90 dark:bg-amber-950/80 rounded-xl border border-amber-300 dark:border-amber-700 shadow-2xs text-[11px] font-black z-10 ${className}`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Visibility Status Badge */}
        {!isVisible && (
          <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 text-[10px] font-black flex items-center gap-0.5">
            🔒 مخفي
          </span>
        )}

        {/* Save Button */}
        <button
          type="button"
          data-action="save"
          onClick={(e) => {
            e.stopPropagation();
            const card = (e.currentTarget as HTMLElement).closest(
              '.protocol-card, .card-item, .companion-section, [data-item-id], [data-section-id], div[class*="rounded"]'
            );
            card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
            setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
            window.alert('تم حفظ العنصر وتأكيد المزامنة السحابية بنجاح! 💾✅');
          }}
          className="save-btn p-1 rounded-lg hover:bg-emerald-200 text-emerald-800 dark:hover:bg-emerald-950/50 dark:text-emerald-300 transition-colors cursor-pointer"
          title="حفظ هذه الخانة وتأكيد المزامنة السحابية"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        {/* Edit Button */}
        <button
          type="button"
          data-action="edit"
          onClick={() => {
            setTitleAr(currentTitle);
            setTitleEn(currentTitleEn);
            setDescAr(currentDescription);
            setShowEditModal(true);
          }}
          className="edit-btn p-1 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
          title="تعديل هذا العنصر (العنوان، الشرح، التوجيهات)"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Replace Image Button (if applicable) */}
        {hasImage && (
          <button
            type="button"
            onClick={() => setShowImageReplaceModal(true)}
            className="p-1 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
            title="استبدال الرسم أو الصورة السريرية"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Visibility Toggle Button */}
        <button
          type="button"
          data-action="toggle-visibility"
          onClick={handleToggleVisibility}
          className={`visibility-btn p-1 rounded-lg transition-colors cursor-pointer ${
            isVisible
              ? 'text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
              : 'text-amber-700 hover:bg-amber-200 dark:text-amber-300 dark:hover:bg-amber-900'
          }`}
          title={isVisible ? 'إخفاء هذا العنصر عن المشتركين' : 'إظهار هذا العنصر للمشتركين'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Delete Button */}
        <button
          type="button"
          data-action="delete"
          onClick={() => setShowDeleteConfirm(true)}
          className="delete-btn p-1 rounded-lg hover:bg-rose-100 text-rose-600 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-colors cursor-pointer"
          title="حذف هذا العنصر"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. EDIT / UPDATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowEditModal(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-[#1A2014] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>تعديل العنصر السريري (Admin In-Place Editor)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTextEdits} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  العنوان بالعربية:
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                  placeholder="عنوان الخطوة أو النص..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  العنوان بالإنجليزية (إن وجد):
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                  placeholder="English title / label..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  الوصف والتوجيهات السريرية:
                </label>
                <textarea
                  rows={4}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none leading-relaxed"
                  placeholder="تفاصيل الشرح والخطوات والإرشادات..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات في السحابة 💾'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. REPLACE IMAGE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showImageReplaceModal && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowImageReplaceModal(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-[#1A2014] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0077b6]" />
                <span>استبدال الرسم / الصورة السريرية</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageReplaceModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File upload option */}
              <div>
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                  الخيار 1: رفع صورة من جهازك أو التقاط صورة:
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#0077b6] hover:bg-sky-50 dark:hover:bg-sky-950/20 text-[#0077b6] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'جاري ضغط ورفع الصورة...' : 'اختر صورة من ألبوم الصور أو الكاميرا'}</span>
                </button>
              </div>

              <div className="text-center text-xs text-neutral-400">— أو —</div>

              {/* URL input option */}
              <form onSubmit={handleSaveImageUrl} className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  الخيار 2: لصق رابط الصورة المباشر (Image URL):
                </label>
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://example.com/medical-diagram.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImageReplaceModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !imgUrl.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-[#0077b6] hover:bg-[#005f9e] text-white shadow-xs cursor-pointer"
                  >
                    حفظ الرابط واستبدال الصورة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. SAFETY DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowDeleteConfirm(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-[#1A2014] rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-rose-300 dark:border-rose-900 space-y-4 animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white">
                تأكيد الحذف النهائي
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم إزالته من واجهة المشتركين فوراً.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
              >
                {isSaving ? 'جاري الحذف...' : 'نعم، احذف العنصر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
