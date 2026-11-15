import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  Syringe,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  RotateCcw,
  Maximize2,
  Stethoscope,
  Smile,
  ChevronRight,
} from 'lucide-react';
import {
  TrueCaseItem,
  CasePhoto,
  ClinicalCategory,
  CLINICAL_CATEGORIES,
  compressClinicalImage,
  addOrUpdateClinicalCase,
  normalizePatientName,
  PatientProfileSummary,
} from '../utils/clinicalCasesStorage';
import { useLanguage } from '../contexts/LanguageContext';

interface ClinicalCaseLoggerFormProps {
  initialPatientName?: string;
  initialDate?: string;
  initialToothNumber?: string;
  initialProcedure?: string;
  initialCategory?: ClinicalCategory;
  initialSlotId?: string;
  initialAppointmentId?: string;
  existingProfilesMap: Map<string, PatientProfileSummary>;
  onCaseSaved: (savedCase: TrueCaseItem) => void;
  onOpenPatientTimeline?: (patientName: string) => void;
  onCancel?: () => void;
}

const COMMON_PROCEDURES: Record<ClinicalCategory, string[]> = {
  fillings: [
    'Class I Composite',
    'Class II MO Composite',
    'Class II DO Composite',
    'Class II MOD Composite',
    'Class III Composite',
    'Class IV Composite',
    'Class V GIC / Composite',
    'Glass Ionomer Base/Restoration',
  ],
  extraction: [
    'Simple Extraction (Upper Molar)',
    'Simple Extraction (Lower Molar)',
    'Anterior Tooth Extraction',
    'Premolar Extraction',
    'Residual Root Extraction',
    'Surgical Extraction',
  ],
  endo: [
    'Emergency Pulpotomy & Dressing',
    'Working Length Determination',
    'Biomechanical Preparation (BMP)',
    'Obturation & Seal',
    'Pulpectomy (Single Visit)',
    'Post & Core Buildup',
  ],
  cleaning: [
    'Full Mouth Scaling & Polishing',
    'Subgingival Curettage',
    'Gingival Assessment & Probing',
    'Fluoride Varnish Application',
  ],
  dentures: [
    'Primary Impression (Alginate)',
    'Secondary Impression (Zinc Oxide)',
    'Bite Registration & Occlusal Rim',
    'Teeth Try-In (Wax-up)',
    'Final Insertion & Delivery',
    'Denture Reline / Adjustment',
  ],
  other: [
    'Comprehensive Oral Examination',
    'Pre-op Radiographic Assessment',
    'Temporary Restoration',
    'Suture Removal',
  ],
};

const COMMON_ANESTHETICS = [
  'Lidocaine 2% + Epinephrine 1:80,000',
  'Lidocaine 2% + Epinephrine 1:100,000',
  'Mepivacaine 3% Plain (Without Vasoconstrictor)',
  'Articaine 4% + Epinephrine 1:100,000',
  'Bupivacaine 0.5% + Epinephrine 1:200,000',
  'Topical Benzocaine 20% Gel only',
];

export const ClinicalCaseLoggerForm: React.FC<ClinicalCaseLoggerFormProps> = ({
  initialPatientName = '',
  initialDate = '',
  initialToothNumber = '',
  initialProcedure = '',
  initialCategory = 'fillings',
  initialSlotId,
  initialAppointmentId,
  existingProfilesMap,
  onCaseSaved,
  onOpenPatientTimeline,
  onCancel,
}) => {
  const { isRTL } = useLanguage();

  const [patientName, setPatientName] = useState(initialPatientName);
  const [phoneOrContact, setPhoneOrContact] = useState('');
  const [caseDate, setCaseDate] = useState(() => initialDate || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ClinicalCategory>(initialCategory);
  const [procedure, setProcedure] = useState(initialProcedure);
  const [toothNumber, setToothNumber] = useState(initialToothNumber);
  const [anesthesiaType, setAnesthesiaType] = useState('Lidocaine 2% + Epinephrine 1:80,000');
  const [anesthesiaCarpules, setAnesthesiaCarpules] = useState('1 Carpule (1.8 mL)');
  const [observations, setObservations] = useState('');
  const [nextSessionPlan, setNextSessionPlan] = useState('');
  const [photos, setPhotos] = useState<CasePhoto[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check in real-time if the entered patient matches an existing patient record
  const matchingProfile = React.useMemo(() => {
    if (!patientName.trim()) return null;
    const norm = normalizePatientName(patientName);
    return existingProfilesMap.get(norm) || null;
  }, [patientName, existingProfilesMap]);

  // Handle media file upload with auto-classification
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    photoType: 'case_sheet' | 'xray' | 'clinical' | 'other',
    defaultCaption: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhoto(true);
    try {
      const newItems: CasePhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressClinicalImage(file, 1200, 1200, 0.82);
        newItems.push({
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          url: compressed,
          caption: defaultCaption,
          photoType,
          timestamp: new Date().toISOString(),
        });
      }
      setPhotos((prev) => [...prev, ...newItems]);
      setStatusMessage({
        text: `تم إرفاق ${newItems.length} صورة (${defaultCaption}) بنجاح!`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Error compressing clinical photo:', err);
      setStatusMessage({ text: 'حدث خطأ أثناء معالجة الصورة.', type: 'error' });
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !caseDate) {
      setStatusMessage({ text: '⚠️ يرجى إدخال اسم المراجع وتاريخ الجلسة السريرية!', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newCase: TrueCaseItem = {
        id: 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: patientName.trim(),
        date: caseDate,
        category,
        procedure: procedure.trim() || undefined,
        toothNumber: toothNumber.trim() || undefined,
        photos,
        notes: observations.trim() || undefined,
        observations: observations.trim() || undefined,
        nextSessionPlan: nextSessionPlan.trim() || undefined,
        phoneOrContact: phoneOrContact.trim() || undefined,
        slotId: initialSlotId,
        appointmentId: initialAppointmentId,
        anesthesiaType,
        anesthesiaCarpules,
        isArchived: true, // Saved directly to academic archive
        isFeatured: matchingProfile ? matchingProfile.visitCount >= 1 : false,
        sessionNumber: matchingProfile ? matchingProfile.visitCount + 1 : 1,
        timestamp: new Date().toISOString(),
      };

      await addOrUpdateClinicalCase(newCase);
      onCaseSaved(newCase);

      setStatusMessage({
        text: '✅ تم توثيق وتأكيد الحالة السريرية والملاحظات بنجاح في السجل الدائم!',
        type: 'success',
      });
    } catch (err) {
      console.error('Error saving clinical case:', err);
      setStatusMessage({ text: 'حدث خطأ أثناء حفظ الحالة.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#181F14] border-2 border-[#59662C] dark:border-[#7A8E3A] shadow-xl space-y-6 text-right"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#2D3822] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center font-black">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
              <span>تسجيل وتوثيق الحالة السريرية (Clinical Case Logger)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                أرشفة سنوية سحابية ☁️
              </span>
            </h3>
            <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-0.5">
              توثيق الإجراءات، الملاحظات الشخصية للمتابعة، وإرفاق أوراق الحالة والأشعة والصور
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Featured / Returning Patient Banner Notice */}
      {matchingProfile && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-amber-900 dark:text-amber-200">
                  مراجع مميز مسجل مسبقاً (Featured Patient) ⭐
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                  لديه {matchingProfile.visitCount} جلسات سابقة
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                آخر علاج: {matchingProfile.procedures.slice(0, 2).join(' • ') || 'جلسة سريرية'} ({matchingProfile.lastVisitDate})
              </p>
            </div>
          </div>

          {onOpenPatientTimeline && (
            <button
              type="button"
              onClick={() => onOpenPatientTimeline(matchingProfile.displayName)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto transition-colors"
            >
              <span>عرض السجل والخط الزمني الكامل 🗓️</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Patient Name & Phone / File Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white flex items-center gap-1">
              <span>👤 اسم المراجع الثلاثي:*</span>
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="مثال: أحمد عبد الله رشيد"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white">
              📞 رقم الهاتف أو رقم الملف (اختياري):
            </label>
            <input
              type="text"
              value={phoneOrContact}
              onChange={(e) => setPhoneOrContact(e.target.value)}
              placeholder="مثال: 0770XXXXXXX أو ملف #A-104"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
          </div>
        </div>

        {/* Row 2: Date & Department Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#59662C]" />
              <span>تاريخ الجلسة السريرية:*</span>
            </label>
            <input
              type="date"
              required
              value={caseDate}
              onChange={(e) => setCaseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white">
              🦷 القسم والتصنيف السريري:*
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClinicalCategory)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            >
              {CLINICAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.nameAr} ({cat.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Procedure Tags */}
        <div className="space-y-1 text-xs">
          <label className="font-bold text-[#2F2B24] dark:text-white block">
            ⚡ إجراءات شائعة في هذا القسم (انقر للاختيار السريع):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PROCEDURES[category]?.map((procName, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProcedure(procName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  procedure === procName
                    ? 'bg-[#59662C] text-white border-[#59662C]'
                    : 'bg-[#FAF7F2] dark:bg-[#151B12] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-[#59662C]'
                }`}
              >
                {procName}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Procedure Name & Tooth Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white">
              📝 الإجراء السريري الدقيق:*
            </label>
            <input
              type="text"
              required
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="مثال: Class II Composite MO + Indirect Pulp Cap"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2F2B24] dark:text-white">
              🦷 رقم السن (Tooth Number / FDI):
            </label>
            <input
              type="text"
              value={toothNumber}
              onChange={(e) => setToothNumber(e.target.value)}
              placeholder="مثال: #16 أو #21 أو #36, #37"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 font-mono font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
            />
          </div>
        </div>

        {/* Local Anesthesia Record */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141A10] border border-[#E5DEC9] dark:border-[#2D3822] space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#59662C] dark:text-[#A4BF46]">
            <Syringe className="w-4 h-4" />
            <span>توثيق التخدير الموضعي المستخدم (Local Anesthesia Log):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">نوع المخدر:</label>
              <select
                value={anesthesiaType}
                onChange={(e) => setAnesthesiaType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1A2216] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold"
              >
                {COMMON_ANESTHETICS.map((an, aIdx) => (
                  <option key={aIdx} value={an}>
                    {an}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-500 block mb-1">الجرعة والكاربولات:</label>
              <input
                type="text"
                value={anesthesiaCarpules}
                onChange={(e) => setAnesthesiaCarpules(e.target.value)}
                placeholder="مثال: 1.5 Carpule (IANB + Long Buccal)"
                className="w-full px-3 py-2 bg-white dark:bg-[#1A2216] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Dedicated Manual Personal Observations Field */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#2F2B24] dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#59662C]" />
              <span>الملاحظات والمشاهدات السريرية الشخصية (Personal Clinical Observations):</span>
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              للمراجعة والرجوع إليها عند عودة المراجع في الجلسات القادمة
            </span>
          </label>
          <textarea
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="اكتب هنا تفاصيل الجلسة: هل كان هناك نزف، صعوبة في العزل بالربر دام، استجابة اللب، تعليمات ما بعد العلاج التي أُعطيت للمراجع..."
            className="w-full p-3.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-2xl border border-gray-300 dark:border-gray-700 text-xs leading-relaxed font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
          />
        </div>

        {/* Next Session Treatment Plan */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#2F2B24] dark:text-white flex items-center gap-1.5">
            <span>🎯 خطة الجلسة القادمة (Next Treatment Session Plan):</span>
          </label>
          <input
            type="text"
            value={nextSessionPlan}
            onChange={(e) => setNextSessionPlan(e.target.value)}
            placeholder="مثال: إنهاء حشوة #16، أخذ طبعة للفك السفلي، أو فحص الالتئام بعد أسبوع"
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 text-xs text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
          />
        </div>

        {/* Categorized Manual Media Uploader */}
        <div className="p-4 rounded-3xl bg-[#FAF7F2] dark:bg-[#141A10] border-2 border-dashed border-[#59662C]/40 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#59662C] dark:text-[#A4BF46] flex items-center gap-1.5 text-xs">
              <Camera className="w-4 h-4" />
              <span>إرفاق المستندات والصور والأشعة (Manual Media Upload):</span>
            </span>
            <span className="text-[11px] font-bold text-gray-500">
              {photos.length} مستندات مرفقة
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Upload Case Sheet */}
            <label className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-teal-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>+ ورقة الحالة (Case Sheet)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isProcessingPhoto}
                onChange={(e) => handleFileUpload(e, 'case_sheet', 'ورقة الحالة (Case Sheet)')}
                className="hidden"
              />
            </label>

            {/* Upload Radiograph */}
            <label className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-purple-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>+ صورة أشعة (X-Ray)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isProcessingPhoto}
                onChange={(e) => handleFileUpload(e, 'xray', 'صورة أشعة (X-Ray)')}
                className="hidden"
              />
            </label>

            {/* Upload Pre-op */}
            <label className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>+ قبل الشغل (Pre-op)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isProcessingPhoto}
                onChange={(e) => handleFileUpload(e, 'clinical', 'قبل الشغل (Pre-op)')}
                className="hidden"
              />
            </label>

            {/* Upload Post-op */}
            <label className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>+ بعد الشغل (Post-op)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isProcessingPhoto}
                onChange={(e) => handleFileUpload(e, 'clinical', 'بعد الشغل (Post-op)')}
                className="hidden"
              />
            </label>
          </div>

          {isProcessingPhoto && (
            <div className="text-xs text-[#59662C] font-bold animate-pulse">
              جاري ضغط وحفظ الصور بأعلى كفاءة وسرعة...
            </div>
          )}

          {/* Attached photos previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="aspect-square rounded-xl overflow-hidden border border-[#E5DEC9] dark:border-[#2D3822] relative group bg-black/5"
                >
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white">
                    <span className="text-[9px] font-bold truncate">{p.caption}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="p-1 rounded-md bg-rose-600 text-white self-end hover:bg-rose-700 cursor-pointer"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DEC9] dark:border-[#2D3822]">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer hover:bg-gray-300"
            >
              إلغاء
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isProcessingPhoto}
            className="px-6 py-2.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'جاري حفظ الحالة والأشعة...' : 'حفظ الحالة والملاحظات السريرية 💾'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
