import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Layers,
  ZoomIn,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Tag,
  Stethoscope,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ClinicalCasePhoto,
  getClinicalPhotosForClass,
  saveClinicalPhotoForClass,
  deleteClinicalPhoto,
  subscribeToClinicalPhotosCloud,
} from '../data/clinicalCasesData';
import { RestorationClass, PRESET_CLASSES } from '../data/classesData';
import { PrivacySettings } from '../data/privacySettings';
import { AppImage } from './AppImage';

interface ClinicalPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass: RestorationClass;
  isAuthorAdmin: boolean;
  allClasses?: RestorationClass[];
  onSelectClass?: (classId: string) => void;
  privacySettings?: PrivacySettings;
}

export const ClinicalPhotosModal: React.FC<ClinicalPhotosModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  isAuthorAdmin,
  allClasses = PRESET_CLASSES,
  onSelectClass,
  privacySettings,
}) => {
  const [currentClassId, setCurrentClassId] = useState<string>(activeClass?.id || 'class-1');
  const [photos, setPhotos] = useState<ClinicalCasePhoto[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<ClinicalCasePhoto | null>(null);

  // New photo form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTooth, setNewTooth] = useState<string>('');
  const [newStage, setNewStage] = useState<'pre-op' | 'isolation' | 'prep' | 'layering' | 'finished'>('pre-op');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTips, setNewTips] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeClass?.id) {
      setCurrentClassId(activeClass.id);
    }
  }, [activeClass?.id, isOpen]);

  useEffect(() => {
    if (currentClassId) {
      const list = getClinicalPhotosForClass(currentClassId);
      setPhotos(list);
      if (list.length > 0) {
        setActivePhoto(list[0]);
      } else {
        setActivePhoto(null);
      }
    }

    if (!isOpen) return;

    const unsub = subscribeToClinicalPhotosCloud((photosMap) => {
      if (currentClassId) {
        const custom = photosMap[currentClassId] || [];
        const initial = getClinicalPhotosForClass(currentClassId);
        // Deduplicate
        const mergedMap = new Map<string, ClinicalCasePhoto>();
        initial.forEach((p) => mergedMap.set(p.id, p));
        custom.forEach((p) => mergedMap.set(p.id, p));
        const combined = Array.from(mergedMap.values());
        setPhotos(combined);
      }
    });

    return () => unsub();
  }, [currentClassId, isOpen]);

  if (!isOpen) return null;

  const currentClassObject = allClasses.find((c) => c.id === currentClassId) || activeClass;

  const handleClassChange = (newId: string) => {
    setCurrentClassId(newId);
    setSelectedStage('all');
    setShowAddForm(false);
    if (onSelectClass) {
      onSelectClass(newId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setNewImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!newImageUrl.trim() && !imagePreview)) {
      alert('يرجى كتابة عنوان للحالة واختيار صورة');
      return;
    }

    const stageLabels: Record<string, string> = {
      'pre-op': '1. الفحص قبل العمل (Pre-op)',
      'isolation': '2. العزل ونظام الماتريكس',
      'prep': '3. التحضير وشطف الحواف',
      'layering': '4. التكديس وبناء الطبقات',
      'finished': '5. النتيجة النهائية والتلميع',
    };

    const newPhoto: ClinicalCasePhoto = {
      id: 'custom-' + Date.now(),
      classId: currentClassId,
      title: newTitle.trim(),
      tooth: newTooth.trim() || 'سن عيادي',
      stage: newStage,
      stageLabel: stageLabels[newStage] || 'مرحلة سريرية',
      description: newDescription.trim() || 'توثيق حالة سريرية لـ ' + currentClassObject.arabicName,
      clinicalTips: newTips.trim() || 'ملاحظة سريرية موثقة.',
      imageUrl: imagePreview || newImageUrl.trim(),
      isCustom: true,
      dateAdded: new Date().toLocaleDateString('ar-EG'),
    };

    const updated = saveClinicalPhotoForClass(newPhoto);
    setPhotos(updated);
    setActivePhoto(newPhoto);

    // Reset form
    setNewTitle('');
    setNewTooth('');
    setNewDescription('');
    setNewTips('');
    setNewImageUrl('');
    setImagePreview('');
    setShowAddForm(false);
  };

  const confirmAndDeletePhoto = (photoId: string) => {
    const updated = deleteClinicalPhoto(currentClassId, photoId);
    setPhotos(updated);
    if (activePhoto?.id === photoId) {
      setActivePhoto(updated[0] || null);
    }
    setPhotoToDelete(null);
    setDeleteNotice('تم حذف الصورة بنجاح.');
    setTimeout(() => setDeleteNotice(null), 3000);
  };

  const handleDelete = (photoId: string) => {
    setPhotoToDelete(photoId);
  };

  const filteredPhotos = selectedStage === 'all'
    ? photos
    : photos.filter((p) => p.stage === selectedStage);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF7F2] dark:bg-[#181C14] border-2 border-[#E5DEC9] dark:border-[#343E26] w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#2F2B24] dark:text-[#F3EFE6] transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#20261A] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#596628] dark:bg-[#7D9333] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E]">
                  {currentClassObject.code} Clinical Atlas
                </span>
                <span className="text-xs text-[#807A6D] dark:text-[#A7A08E]">
                  {photos.length} حالات وصور موثقة
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
                معرض الحالات والصور السريرية الحقيقية — {currentClassObject.arabicName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Photo Button - STRICTLY AUTHOR ONLY (Requirement: "مع امكانية اضافة صور للمشرف فقط") */}
            {isAuthorAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                  showAddForm
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white'
                }`}
                title="إضافة صورة سريرية جديدة (متاح لحساب المشرف فقط)"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">إضافة صورة سريرية</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3322] hover:bg-[#EFE8DC] dark:hover:bg-[#343E2B] text-[#4A4436] dark:text-[#D9D3C7] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Class Switcher Tabs (Class I to Class V) */}
        <div className="px-6 py-2.5 bg-[#FAF7F2] dark:bg-[#1C2216] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-xs font-bold text-[#6D675A] dark:text-[#A7A08E] shrink-0 ml-1">
            اختر الكلاس للمعاينة:
          </span>
          {allClasses.map((cls, clsIdx) => {
            const isSelected = cls.id === currentClassId;
            return (
              <button
                key={`${cls.id}_${clsIdx}`}
                onClick={() => handleClassChange(cls.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] dark:border-[#7D9333] shadow-xs'
                    : 'bg-white dark:bg-[#20261A] text-[#484235] dark:text-[#D5CDBC] border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F2ECE0]'
                }`}
              >
                <span>{cls.code}</span>
                <span className="text-[10px] font-normal opacity-80">
                  ({cls.arabicName.split('(')[0]})
                </span>
              </button>
            );
          })}
        </div>

        {/* Author-only Add Photo Drawer/Form */}
        {showAddForm && isAuthorAdmin && (
          <form
            onSubmit={handleSavePhoto}
            className="p-6 bg-amber-50/70 dark:bg-amber-950/30 border-b-2 border-amber-200/80 dark:border-amber-800/60 space-y-4 shrink-0 transition-all"
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>إضافة توثيق سريري جديد لـ {currentClassObject.arabicName} (لوحة المشرف)</span>
              </div>
              <span className="text-xs text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full font-semibold">
                حساب د. حياة نافع
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">عنوان الصورة / المرحلة:</label>
                <input
                  type="text"
                  placeholder="مثال: بناء الجدار الملاصق بالكومبوزيت"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">السن المعالج / المنطقة:</label>
                <input
                  type="text"
                  placeholder="مثال: طاحن سفلي أول #46"
                  value={newTooth}
                  onChange={(e) => setNewTooth(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">المرحلة السريرية:</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E] font-bold text-[#2F2B24] dark:text-white"
                >
                  <option value="pre-op">1. قبل العمل (Pre-op)</option>
                  <option value="isolation">2. العزل والماتريكس</option>
                  <option value="prep">3. التحضير والبيفل</option>
                  <option value="layering">4. التكديس والطبقات</option>
                  <option value="finished">5. النتيجة النهائية</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">رفع صورة أو إدخال رابط:</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-dashed border-[#596628] dark:border-[#A8C24E] text-center font-bold text-[#596628] dark:text-[#A8C24E] cursor-pointer hover:bg-[#F3F7E8] dark:hover:bg-[#20261A] transition-all">
                    <Upload className="w-3.5 h-3.5 inline ml-1" />
                    <span>رفع ملف</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-1 rounded-md shrink-0">
                      ✓ جاهز
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">الوصف السريري والتفاصيل:</label>
                <input
                  type="text"
                  placeholder="شرح موجز للخطوة والتقنية المتبعة..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">نصيحة سريرية أو تحذير (Tips):</label>
                <input
                  type="text"
                  placeholder="نصيحة عملية لتفادي الأخطاء..."
                  value={newTips}
                  onChange={(e) => setNewTips(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] dark:focus:border-[#A8C24E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-semibold text-[#5A5447] dark:text-[#A7A08E] cursor-pointer hover:bg-[#F4EFE6] dark:hover:bg-[#20261A]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black cursor-pointer shadow-xs"
              >
                حفظ الصورة ونشرها في الأطلس
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#FAF7F2] dark:bg-[#1C2216] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#706A5B] dark:text-[#A7A08E] ml-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" /> تصفية المراحل:
            </span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'pre-op', label: 'قبل العمل' },
              { id: 'isolation', label: 'العزل والماتريكس' },
              { id: 'prep', label: 'التحضير' },
              { id: 'layering', label: 'التكديس' },
              { id: 'finished', label: 'النتيجة النهائية' },
            ].map((f, fIdx) => (
              <button
                key={`${f.id}_${fIdx}`}
                onClick={() => setSelectedStage(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStage === f.id
                    ? 'bg-[#596628] dark:bg-[#7D9333] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] text-[#554F42] dark:text-[#D5CDBC] hover:bg-[#F3EFE7] dark:hover:bg-[#2A3322]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#7B7567] dark:text-[#A7A08E] font-semibold flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
            <span>توثيق سريري موثوق | جامعة المعارف</span>
          </div>
        </div>

        {/* Modal Main Content: Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left/Middle: Focused Large Image & Clinical Pearls */}
          <div className="lg:col-span-8 p-6 overflow-y-auto bg-white dark:bg-[#20261A] flex flex-col justify-between space-y-4">
            {activePhoto ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/20 dark:border-[#7D9333]/30 inline-flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      <span>{activePhoto.stageLabel}</span>
                    </span>

                    <span className="text-xs font-bold text-[#6D675A] dark:text-[#C5BFB0] bg-[#FAF7F2] dark:bg-[#161A12] px-3 py-1 rounded-lg border border-[#E5DEC9] dark:border-[#3E4A2E]">
                      السن: {activePhoto.tooth}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-[#2F2B24] dark:text-white">
                    {activePhoto.title}
                  </h3>
                </div>

                {/* Main Large Image Container */}
                <div className="relative w-full aspect-[16/10] bg-neutral-950 rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#343E26] group shadow-inner flex items-center justify-center">
                  <AppImage
                    src={activePhoto.imageUrl}
                    alt={activePhoto.title}
                    isAdmin={isAuthorAdmin}
                    storageKey={`clinical_photo_${activeClass.id}_${activePhoto.id}`}
                    className="w-full h-full max-h-[450px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
                    containerClassName="w-full h-full bg-neutral-950"
                    show4KBadge={true}
                  />

                  {/* Watermark & HIPAA Badges */}
                  {privacySettings?.clinicalWatermarkOnPhotos && (
                    <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-xs text-white/95 text-[10px] font-mono px-3 py-1 rounded-lg pointer-events-none border border-white/10 shadow-sm">
                      د. حياه نافع • حالة سريرية تعليمية
                    </div>
                  )}
                  {privacySettings?.autoRedactPatientInfo && (
                    <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none border border-emerald-500/30 shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>HIPAA De-Identified Record</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                    <ZoomIn className="w-3.5 h-3.5 text-[#A8C24E]" />
                    <span>توثيق سريري مجهري عالي الدقة (Clinical Case)</span>
                  </div>
                </div>

                {/* Clinical Description & Practical Pearls */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161A12] border border-[#E5DEC9] dark:border-[#343E26] space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#807A6D] dark:text-[#A7A08E] uppercase mb-1">
                      الوصف والخطوة السريرية:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#383329] dark:text-[#D5CDBC] leading-relaxed font-medium">
                      {activePhoto.description}
                    </p>
                  </div>

                  {activePhoto.clinicalTips && (
                    <div className="pt-2 border-t border-[#EAE3D2] dark:border-[#2C3420] flex items-start gap-2 text-xs text-[#2E3B10] dark:text-[#CBE276]">
                      <Sparkles className="w-4 h-4 text-[#596628] dark:text-[#A8C24E] shrink-0 mt-0.5" />
                      <span>
                        <strong>توجيه سريري هام: </strong>
                        {activePhoto.clinicalTips}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Photo Delete Option (Author only) */}
                {activePhoto.isCustom && isAuthorAdmin && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDelete(activePhoto.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف هذه الصورة من الأطلس</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-[#888173] dark:text-[#A7A08E]">
                <Camera className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
                <p className="font-bold">لا توجد صور لهذه المرحلة بعد</p>
                <p className="text-xs mt-1">اختر مرحلة أخرى أو أضف صورة جديدة</p>
              </div>
            )}
          </div>

          {/* Right Column: Photo Thumbnails List */}
          <div className="lg:col-span-4 p-4 overflow-y-auto bg-[#FAF7F2] dark:bg-[#181C14] border-t lg:border-t-0 lg:border-r border-[#E5DEC9] dark:border-[#343E26] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#343E26]">
              <span className="text-xs font-extrabold text-[#544E41] dark:text-[#E2DDD2]">
                قائمة الحالات المتوفرة ({filteredPhotos.length})
              </span>
              <span className="text-[11px] text-[#847E71] dark:text-[#A7A08E]">
                اضغط للمعاينة
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredPhotos.map((photo, pIdx) => {
                const isSelected = activePhoto?.id === photo.id;
                return (
                  <div
                    key={`${photo.id || 'photo'}_${pIdx}`}
                    onClick={() => setActivePhoto(photo)}
                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white dark:bg-[#20261A] border-[#596628] dark:border-[#7D9333] shadow-sm'
                        : 'bg-white/70 dark:bg-[#1E2418] border-[#E7E0D0] dark:border-[#343E26] hover:bg-white dark:hover:bg-[#252C1E] hover:border-[#D0C6B2]'
                    }`}
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-center">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#596628] dark:text-[#A8C24E] block truncate">
                        {photo.stageLabel}
                      </span>
                      <h4 className="text-xs font-black text-[#2F2B24] dark:text-white truncate">
                        {photo.title}
                      </h4>
                      <span className="text-[10px] text-[#7A7467] dark:text-[#A7A08E] block mt-0.5 truncate">
                        {photo.tooth}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#596628] dark:text-[#A8C24E] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-[#20261A] border-t border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7B7567] dark:text-[#A7A08E] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
            <span>توثيق حالات حية وأسس سريرية مبنية على الدليل الأكاديمي</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#596628] dark:text-[#A8C24E]">د. حياة نافع</span>
            <span>|</span>
            <span>جامعة المعارف</span>
          </div>
        </div>

        {/* Delete Confirmation Modal (Admin Only) */}
        {photoToDelete && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-[#1A2014] rounded-3xl p-6 border-2 border-rose-400 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2F2B24] dark:text-white">
                    تأكيد حذف الصورة السريرية
                  </h3>
                  <p className="text-xs text-neutral-500">
                    هل أنتِ متأكدة من حذف هذه الصورة من الأطلس السريري؟
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => confirmAndDeletePhoto(photoToDelete)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  نعم، احذف الصورة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notice */}
        {deleteNotice && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-60 bg-rose-600 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold animate-in fade-in">
            {deleteNotice}
          </div>
        )}
      </div>
    </div>
  );
};
