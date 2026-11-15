import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  User,
  Calendar,
  Clock,
  Camera,
  FileText,
  ChevronRight,
  Plus,
  Stethoscope,
  Smile,
  ShieldCheck,
  Award,
  Filter,
} from 'lucide-react';
import { PatientProfileSummary } from '../utils/clinicalCasesStorage';
import { useLanguage } from '../contexts/LanguageContext';

interface FeaturedPatientsHubProps {
  profilesMap: Map<string, PatientProfileSummary>;
  onOpenTimeline: (patientName: string) => void;
  onAddNewSession: (patientName: string) => void;
  onScheduleAppointment: (patientName: string) => void;
}

export const FeaturedPatientsHub: React.FC<FeaturedPatientsHubProps> = ({
  profilesMap,
  onOpenTimeline,
  onAddNewSession,
  onScheduleAppointment,
}) => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'featured_only' | 'multi_visit'>('all');

  // Convert map to list and sort by visitCount descending, then lastVisitDate
  const allProfiles = useMemo(() => {
    const list = Array.from(profilesMap.values());
    return list.sort((a, b) => {
      if (b.visitCount !== a.visitCount) return b.visitCount - a.visitCount;
      return (b.lastVisitDate || '').localeCompare(a.lastVisitDate || '');
    });
  }, [profilesMap]);

  const featuredProfiles = useMemo(() => {
    return allProfiles.filter((p) => p.isFeatured || p.visitCount >= 2);
  }, [allProfiles]);

  const displayedProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      if (filterType === 'featured_only' && !p.isFeatured) return false;
      if (filterType === 'multi_visit' && p.visitCount < 2) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const matchName = p.displayName.toLowerCase().includes(q);
      const matchProc = p.procedures.some((pr) => pr.toLowerCase().includes(q));
      const matchNotes = p.notesHistory.some(
        (n) => (n.notes && n.notes.toLowerCase().includes(q)) || (n.observations && n.observations.toLowerCase().includes(q))
      );
      return matchName || matchProc || matchNotes;
    });
  }, [allProfiles, filterType, searchQuery]);

  return (
    <div className="space-y-5 text-right" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Banner with Brand Identity (Olive #4D6A34 & Warm Beige) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1E2519] via-[#2A3423] to-[#141A10] text-[#FAF7F2] border-2 border-[#59662C]/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  سجل المراجعين المميزين ومتابعة الزيارات المتكررة
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                  Smart Featured Patient Tracker ⭐
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                نظام ذكي يكتشف تلقائياً عودة المراجعين، ويجمع ملفاتهم وأشعتهم وملاحظاتهم في خط زمني موحد
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-white/60 block">المراجعون المميزون (Returning):</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-amber-300">{featuredProfiles.length}</span>
              <span className="text-[11px] text-amber-200/80">مراجع دائم (2+ جلسة)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-white/60 block">إجمالي المرضى المسجلين:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">{allProfiles.length}</span>
              <span className="text-[11px] text-emerald-300/80">ملف سريري</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-white/60 block">المستندات وأوراق الحالة المرفقة:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-sky-400">
                {allProfiles.reduce((acc, p) => acc + p.allPhotos.length, 0)}
              </span>
              <span className="text-[11px] text-sky-300/80">أشعة وصورة سريرية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#181F14] border border-[#E5DEC9] dark:border-[#2D3822] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مراجع بالاسم، الإجراء، أو الملاحظة السريرية..."
            className="w-full pl-4 pr-10 py-2 bg-[#FAF7F2] dark:bg-[#141A10] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
          />
        </div>

        {/* Filter segment */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
              filterType === 'all'
                ? 'bg-[#59662C] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            الكل ({allProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('featured_only')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1 ${
              filterType === 'featured_only'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>المميزون فقط ({featuredProfiles.length})</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      {displayedProfiles.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#181F14] border border-dashed border-[#E5DEC9] dark:border-[#2D3822] text-center space-y-3">
          <Smile className="w-10 h-10 text-gray-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-black text-sm text-[#2F2B24] dark:text-white">
              {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا يوجد مراجعون مسجلون بعد'}
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              بمجرد تسجيلك موعداً أو جلسة علاجية لمراجع في «جدول عيادتي» أو «سجل الحالات»، ستظهر بياناته هنا، ويتعرف النظام تلقائياً على زياراته المتكررة ويمنحه وسام «المراجع المميز ⭐».
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedProfiles.map((p) => {
            const latestNote = p.notesHistory[p.notesHistory.length - 1];

            return (
              <div
                key={p.normalizedName}
                className={`p-5 rounded-3xl bg-white dark:bg-[#181F14] border-2 shadow-xs transition-all space-y-3 relative overflow-hidden group hover:shadow-md ${
                  p.isFeatured
                    ? 'border-amber-400/80 dark:border-amber-600/70'
                    : 'border-[#E5DEC9] dark:border-[#2D3822] hover:border-[#59662C]'
                }`}
              >
                {/* Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                        p.isFeatured
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-black'
                          : 'bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46]'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm sm:text-base text-[#2F2B24] dark:text-white">
                          {p.displayName}
                        </h4>
                        {p.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[10px] font-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>المراجع المميز</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
                        آخر جلسة: {p.lastVisitDate || 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-[#2F2B24] dark:text-gray-200 font-mono font-black text-xs shrink-0">
                    {p.visitCount} {p.visitCount === 1 ? 'جلسة' : 'جلسات'}
                  </span>
                </div>

                {/* Procedures summary pills */}
                {p.procedures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.procedures.map((proc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#141A10] border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300"
                      >
                        🦷 {proc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Latest Clinical Observation snippet */}
                {latestNote && (latestNote.observations || latestNote.notes) && (
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#141A10] border border-[#E5DEC9] dark:border-[#2D3822] text-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#59662C] dark:text-[#A4BF46] block">
                      📝 آخر ملاحظة سريرية مسجلة:
                    </span>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {latestNote.observations || latestNote.notes}
                    </p>
                  </div>
                )}

                {/* Media counters */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#59662C]" />
                    <span>{p.allPhotos.length} مستندات وصور مرفقة</span>
                  </span>

                  {p.caseSheetPhotos.length > 0 && (
                    <span className="text-teal-700 dark:text-teal-400 font-bold">
                      ✓ ورقة الحالة متوفرة
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenTimeline(p.displayName)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all"
                  >
                    <span>فتح الخط الزمني الكامل 🗓️</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddNewSession(p.displayName)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold cursor-pointer transition-colors"
                    title="تسجيل جلسة سريرية جديدة لهذا المراجع"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onScheduleAppointment(p.displayName)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold cursor-pointer transition-colors"
                    title="حجز موعد في جدول العيادة"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
