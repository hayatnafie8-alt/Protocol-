import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Printer,
  Plus,
  Stethoscope,
  Heart,
  AlertCircle,
  Eye,
  Maximize2,
  Syringe,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  PatientProfileSummary,
  TrueCaseItem,
  CasePhoto,
  CLINICAL_CATEGORIES,
} from '../utils/clinicalCasesStorage';
import { useLanguage } from '../contexts/LanguageContext';

interface PatientCaseTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfileSummary | null;
  onAddNewSession?: (patientName: string) => void;
  onScheduleAppointment?: (patientName: string) => void;
}

export const PatientCaseTimelineModal: React.FC<PatientCaseTimelineModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddNewSession,
  onScheduleAppointment,
}) => {
  const { isRTL } = useLanguage();
  const [activeMediaFilter, setActiveMediaFilter] = useState<'all' | 'case_sheet' | 'xray' | 'clinical'>('all');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<CasePhoto | null>(null);

  if (!isOpen || !profile) return null;

  // Filter media across all cases
  const filteredPhotos = profile.allPhotos.filter((p) => {
    if (activeMediaFilter === 'all') return true;
    const cap = (p.caption || '').toLowerCase();
    if (activeMediaFilter === 'case_sheet') {
      return p.photoType === 'case_sheet' || cap.includes('ورقة') || cap.includes('sheet');
    }
    if (activeMediaFilter === 'xray') {
      return p.photoType === 'xray' || cap.includes('اشعة') || cap.includes('أشعة') || cap.includes('x-ray') || cap.includes('xray');
    }
    if (activeMediaFilter === 'clinical') {
      return p.photoType === 'clinical' || (!cap.includes('ورقة') && !cap.includes('sheet') && !cap.includes('اشعة') && !cap.includes('أشعة') && !cap.includes('x-ray') && !cap.includes('xray'));
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#FAF7F2] dark:bg-[#151B12] rounded-3xl border-2 border-[#59662C] dark:border-[#7A8E3A] shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#EAE2D2] dark:from-[#181F14] dark:via-[#1D2519] dark:to-[#141A10] border-b border-[#E5DEC9] dark:border-[#2D3822] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#59662C] text-[#FAF7F2] flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white truncate">
                  {profile.displayName}
                </h3>

                {profile.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[11px] shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    <span>المراجع المميز 🌟</span>
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full bg-[#59662C]/15 dark:bg-[#59662C]/30 text-[#4D6A34] dark:text-[#A4BF46] border border-[#59662C]/30 text-[11px] font-bold">
                  {profile.visitCount} {profile.visitCount === 1 ? 'جلسة سريرية' : 'جلسات سريرية'}
                </span>
              </div>

              <p className="text-xs text-[#706A5B] dark:text-[#A7A08E] mt-0.5">
                الملف السريري والخط الزمني الموحد (Clinical Case Log & Historical Treatment Timeline)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Summary KPIs Bar */}
        <div className="px-5 py-3 bg-[#EFE9DD]/70 dark:bg-[#1A2216]/70 border-b border-[#E5DEC9] dark:border-[#2D3822] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#151B12]/80 border border-[#E5DEC9] dark:border-[#2D3822]">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">إجمالي الجلسات:</span>
            <span className="text-base font-black text-[#59662C] dark:text-[#A4BF46]">{profile.visitCount} زيارة</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#151B12]/80 border border-[#E5DEC9] dark:border-[#2D3822]">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">آخر موعد وجلسة:</span>
            <span className="text-xs font-black text-[#2F2B24] dark:text-white font-mono">{profile.lastVisitDate || 'غير مسجل'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#151B12]/80 border border-[#E5DEC9] dark:border-[#2D3822]">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">الصور والأشعة:</span>
            <span className="text-xs font-black text-teal-700 dark:text-teal-400 font-mono">
              {profile.allPhotos.length} مرفقات (ورقة/أشعة/صور)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#151B12]/80 border border-[#E5DEC9] dark:border-[#2D3822]">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">الإجراءات المنفذة:</span>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 truncate block">
              {profile.procedures.length > 0 ? profile.procedures.join(' • ') : 'حالات سريرية متعددة'}
            </span>
          </div>
        </div>

        {/* Modal Body (Scrollable Timeline & Details) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onAddNewSession && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewSession(profile.displayName);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل جلسة سريرية جديدة لهذا المراجع 📋</span>
              </button>
            )}

            {onScheduleAppointment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleAppointment(profile.displayName);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E2519] border border-[#59662C]/40 text-[#59662C] dark:text-[#A4BF46] font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252F1F] active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>حجز موعد جديد في جدول عيادتي 📅</span>
              </button>
            )}
          </div>

          {/* Section 1: Chronological Treatment Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#2D3822]">
              <h4 className="font-black text-sm text-[#2F2B24] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#59662C]" />
                <span>الخط الزمني لجلسات وعلاجات المراجع ({profile.cases.length} حالة مسجلة):</span>
              </h4>
            </div>

            {profile.cases.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1A2216] border border-dashed border-[#E5DEC9] dark:border-[#2D3822] text-center text-gray-500 space-y-2">
                <Stethoscope className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-bold">المراجع مسجل في جدول المواعيد ولم يتم توثيق ورقة حالة سريرية له بعد.</p>
                {onAddNewSession && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onAddNewSession(profile.displayName);
                    }}
                    className="text-[#59662C] font-black underline text-xs cursor-pointer"
                  >
                    انقر هنا لتوثيق الجلسة الأولى وإرفاق الصور
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#59662C]/30 pr-8">
                {profile.cases.map((c, idx) => {
                  const catMeta = CLINICAL_CATEGORIES.find((cat) => cat.id === c.category);
                  const visitNum = profile.cases.length - idx;

                  return (
                    <div
                      key={c.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A2216] border border-[#E5DEC9] dark:border-[#2D3822] shadow-xs space-y-3 relative group hover:border-[#59662C] transition-all"
                    >
                      {/* Timeline Dot Indicator */}
                      <div className="absolute -right-[39px] top-5 w-4 h-4 rounded-full bg-[#59662C] text-white border-2 border-white dark:border-[#151B12] flex items-center justify-center font-bold text-[9px]">
                        {visitNum}
                      </div>

                      {/* Header of Visit */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5"
                            style={{
                              background: catMeta?.bgColor || 'rgba(197,160,89,0.15)',
                              color: catMeta?.color || '#c5a059',
                              border: `1px solid ${catMeta?.borderColor || '#c5a059'}`,
                            }}
                          >
                            <span>{catMeta?.icon || '🦷'}</span>
                            <span>{catMeta?.nameAr || 'إجراء سريري'}</span>
                          </span>

                          <h5 className="font-black text-sm text-[#2F2B24] dark:text-white">
                            {c.procedure || 'معالجة سنية'}
                          </h5>

                          {c.toothNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs border border-amber-300 dark:border-amber-700">
                              سن: {c.toothNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#59662C]" />
                          <span>{c.date}</span>
                        </div>
                      </div>

                      {/* Anesthesia Details if Recorded */}
                      {(c.anesthesiaType || c.anesthesiaCarpules) && (
                        <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 flex items-center gap-2 text-xs">
                          <Syringe className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <strong>التخدير الموضعي المستخدم:</strong> {c.anesthesiaType || 'مخدر قياسي'}{' '}
                            {c.anesthesiaCarpules && <span>({c.anesthesiaCarpules})</span>}
                          </div>
                        </div>
                      )}

                      {/* Observations & Manual Personal Notes */}
                      {(c.notes || c.observations) && (
                        <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141A10] border border-[#E5DEC9] dark:border-[#2D3822] space-y-1">
                          <span className="text-[11px] font-bold text-[#59662C] dark:text-[#A4BF46] block flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>الملاحظات والمشاهدات السريرية (Clinical Observations):</span>
                          </span>
                          <p className="text-xs text-[#3E382D] dark:text-[#DDD7CB] leading-relaxed whitespace-pre-line">
                            {c.observations || c.notes}
                          </p>
                        </div>
                      )}

                      {/* Next Session Plan */}
                      {c.nextSessionPlan && (
                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 space-y-0.5 text-xs">
                          <strong className="block font-bold">🎯 خطة الجلسة القادمة:</strong>
                          <p className="leading-relaxed">{c.nextSessionPlan}</p>
                        </div>
                      )}

                      {/* Photos attached to this specific case */}
                      {c.photos && c.photos.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-gray-500 block">
                            📸 صور ورقة الحالة والأشعة الخاصة بهذه الجلسة ({c.photos.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {c.photos.map((p, pIdx) => (
                              <div
                                key={p.id || pIdx}
                                onClick={() => setActiveLightboxPhoto(p)}
                                className="w-20 h-20 rounded-xl overflow-hidden border border-[#E5DEC9] dark:border-[#2D3822] cursor-pointer hover:border-[#59662C] transition-all relative group/photo shrink-0 bg-black/5"
                              >
                                <img
                                  src={p.url}
                                  alt={p.caption || 'صورة سريرية'}
                                  className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 className="w-4 h-4" />
                                </div>
                                {p.caption && (
                                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold px-1 py-0.5 truncate text-center">
                                    {p.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Complete Media Archive Gallery (Case sheets, X-Rays, Clinical) */}
          {profile.allPhotos.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E5DEC9] dark:border-[#2D3822]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-black text-sm text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#59662C]" />
                  <span>معرض المستندات والصور والأشعة المجمعة ({profile.allPhotos.length}):</span>
                </h4>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1E2519] rounded-xl border border-[#E5DEC9] dark:border-[#2D3822] text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveMediaFilter('all')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      activeMediaFilter === 'all'
                        ? 'bg-[#59662C] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    الكل ({profile.allPhotos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaFilter('case_sheet')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      activeMediaFilter === 'case_sheet'
                        ? 'bg-[#59662C] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    أوراق الحالة ({profile.caseSheetPhotos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaFilter('xray')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      activeMediaFilter === 'xray'
                        ? 'bg-[#59662C] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    الأشعة ({profile.xrayPhotos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaFilter('clinical')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      activeMediaFilter === 'clinical'
                        ? 'bg-[#59662C] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    السريرية ({profile.clinicalPhotos.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filteredPhotos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    onClick={() => setActiveLightboxPhoto(p)}
                    className="aspect-square rounded-2xl overflow-hidden border-2 border-[#E5DEC9] dark:border-[#2D3822] bg-black/5 cursor-pointer hover:border-[#59662C] transition-all relative group"
                  >
                    <img
                      src={p.url}
                      alt={p.caption || 'صورة'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                      <span className="text-[10px] font-bold truncate">{p.caption || 'صورة مرفقة'}</span>
                      <span className="text-[8px] text-gray-300 font-mono">
                        {p.timestamp ? new Date(p.timestamp).toLocaleDateString('ar-IQ') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#EFE9DD]/70 dark:bg-[#1A2216]/70 border-t border-[#E5DEC9] dark:border-[#2D3822] flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500">
            تاريخ فتح الملف الأول: <strong className="font-mono text-gray-700 dark:text-gray-300">{profile.firstVisitDate || profile.lastVisitDate}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 cursor-pointer"
            >
              إغلاق الملف
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Photo Preview */}
      {activeLightboxPhoto && (
        <div
          onClick={() => setActiveLightboxPhoto(null)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full max-h-[85vh] flex flex-col items-center space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between w-full text-white px-2">
              <span className="font-bold text-sm">{activeLightboxPhoto.caption || 'معاينة الصورة السريرية'}</span>
              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={activeLightboxPhoto.url}
              alt="Full Preview"
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
