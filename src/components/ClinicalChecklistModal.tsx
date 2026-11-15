import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  X,
  Sparkles,
  ClipboardCheck,
  Wrench,
  ShieldAlert,
  Flame,
  Award,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react';
import {
  ClinicalChecklistItem,
  CLINICAL_CHECKLISTS_BY_CLASS,
  getCompletedChecklistSteps,
  toggleChecklistStep,
  resetChecklistForClass,
  markAllChecklistStepsCompleted,
  getChecklistProgress,
} from '../data/clinicalChecklists';
import { useLanguage } from '../contexts/LanguageContext';

interface ClinicalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  classNameArabic?: string;
}

export const ClinicalChecklistModal: React.FC<ClinicalChecklistModalProps> = ({
  isOpen,
  onClose,
  classId,
  classNameArabic,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    getCompletedChecklistSteps(classId)
  );
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('all');
  const [justCelebrated, setJustCelebrated] = useState(false);

  // Sync state when classId changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCompletedIds(getCompletedChecklistSteps(classId));
    }
  }, [isOpen, classId]);

  // Listen to cross-window or inter-component updates
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ classId: string; stepIds: string[] }>;
      if (customEvent.detail?.classId === classId) {
        setCompletedIds(customEvent.detail.stepIds);
      }
    };
    window.addEventListener('clinical_checklist_updated', handleUpdate);
    return () => window.removeEventListener('clinical_checklist_updated', handleUpdate);
  }, [classId]);

  if (!isOpen) return null;

  const checklistData = CLINICAL_CHECKLISTS_BY_CLASS[classId] || CLINICAL_CHECKLISTS_BY_CLASS['class-1'];
  const allItems = checklistData.items;

  // Filter items by phase
  const filteredItems =
    activePhaseFilter === 'all'
      ? allItems
      : allItems.filter((it) => it.phase === activePhaseFilter);

  const {
    completed: completedCount,
    total: totalSteps,
    percentage: progressPercent,
    isComplete: isAllComplete,
  } = getChecklistProgress(classId);

  const handleToggle = (stepId: string) => {
    const newSteps = toggleChecklistStep(classId, stepId);
    setCompletedIds(newSteps);

    if (newSteps.length === allItems.length) {
      setJustCelebrated(true);
      setTimeout(() => setJustCelebrated(false), 4500);
    }
  };

  const handleReset = () => {
    if (window.confirm(isRTL ? 'هل تود تصفير القائمة والبدء من جديد لهذه الحالة؟' : 'Reset all steps to initial unverified state?')) {
      resetChecklistForClass(classId);
      setCompletedIds([]);
      setJustCelebrated(false);
    }
  };

  const handleMarkAll = () => {
    const allIds = markAllChecklistStepsCompleted(classId);
    setCompletedIds(allIds);
    setJustCelebrated(true);
    setTimeout(() => setJustCelebrated(false), 4000);
  };

  const phases = [
    { id: 'all', label: isRTL ? 'كافة الخطوات' : 'All Steps' },
    { id: 'preparation', label: isRTL ? 'التحضير واللون' : 'Prep & Shade' },
    { id: 'isolation', label: isRTL ? 'العزل والماتريكس' : 'Dam & Matrix' },
    { id: 'bonding', label: isRTL ? 'التخريش والربط' : 'Etch & Bond' },
    { id: 'layering', label: isRTL ? 'التكديس والنحت' : 'Layering' },
    { id: 'finishing', label: isRTL ? 'الإنهاء والإطباق' : 'Finishing' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#1A1F15] rounded-3xl shadow-2xl border-2 border-[#596628]/40 dark:border-[#384524] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F2] via-white to-amber-50/40 dark:from-[#20271A] dark:via-[#1A1F15] dark:to-[#171B12] border-b border-[#E5DEC9] dark:border-[#323A25] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#596628] to-[#3B441B] text-white flex items-center justify-center shadow-md shrink-0">
                <ClipboardCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#596628] text-white">
                    {checklistData.classCode}
                  </span>
                  <span className="text-[11px] font-black uppercase text-[#596628] dark:text-[#A8C24E]">
                    {isRTL ? 'قائمة التحقق السريري التفاعلية (Clinical Checklist)' : 'Chairside Operative Safety & Step Checklist'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white mt-0.5">
                  {isRTL ? (classNameArabic || checklistData.arabicName) : `${checklistData.classCode} Operative Restorative Protocol`}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7E7768] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title={isRTL ? 'إغلاق النافذة' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Overview Bar */}
          <div className="mt-4 pt-3 border-t border-[#E5DEC9]/80 dark:border-[#323A25] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#655F51] dark:text-[#A7A08E] flex items-center gap-1.5">
                <span>{isRTL ? 'الإنجاز السريري للبروتوكول:' : 'Protocol Adherence Progress:'}</span>
                <span className="text-[#2F2B24] dark:text-white font-mono font-black">
                  {isRTL
                    ? `${completedCount} من ${totalSteps} خطوات (${progressPercent}%)`
                    : `${completedCount} of ${totalSteps} verified (${progressPercent}%)`}
                </span>
              </span>
              {isAllComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{isRTL ? 'مكتمل بنسبة 100% ✨' : '100% Protocol Verified ✨'}</span>
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                  {isRTL ? `متبقي ${totalSteps - completedCount} خطوات` : `${totalSteps - completedCount} steps pending`}
                </span>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isAllComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-[#596628] to-[#889E39]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {phases.map((ph, phIdx) => {
              const isSelected = activePhaseFilter === ph.id;
              const countInPhase =
                ph.id === 'all'
                  ? allItems.length
                  : allItems.filter((i) => i.phase === ph.id).length;

              return (
                <button
                  key={`${ph.id}_${phIdx}`}
                  onClick={() => setActivePhaseFilter(ph.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] shadow-sm'
                      : 'bg-white dark:bg-[#20271A] text-[#6B6455] dark:text-[#C5BFB0] border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F3EFE6]'
                  }`}
                >
                  <span>{ph.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {countInPhase}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Celebration Banner */}
        {justCelebrated && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md animate-bounce shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>
              {isRTL
                ? 'رائع جداً! تم استيفاء جميع خطوات البروتوكول السريري بنجاح وتوثيق الالتزام الكامل بالمعايير. 🦷✨'
                : 'Outstanding! All restorative protocol criteria verified with complete adherence to faculty clinical guidelines. 🦷✨'}
            </span>
          </div>
        )}

        {/* Checklist Scrollable Items */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-[#E5DEC9]/40 dark:divide-[#323A25]/40 ${isRTL ? 'text-right' : 'text-left'}`}>
          {filteredItems.map((item, idx) => {
            const isCompleted = completedIds.includes(item.id);

            return (
              <div
                key={`${item.id}_${idx}`}
                onClick={() => handleToggle(item.id)}
                className={`pt-3.5 first:pt-0 transition-all rounded-2xl p-3.5 cursor-pointer border-2 select-none ${
                  isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 opacity-90'
                    : 'bg-white dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#323A25] hover:border-[#596628] dark:hover:border-[#A8C24E]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Interactive Checkbox */}
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white scale-105'
                        : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-[#596628] bg-white dark:bg-neutral-900'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-transparent" />
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                            isCompleted
                              ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                              : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {item.stepNumber}
                        </span>
                        <h4
                          className={`text-sm sm:text-base font-black transition-colors ${
                            isCompleted
                              ? 'text-emerald-950 dark:text-emerald-200 line-through'
                              : 'text-[#2F2B24] dark:text-white'
                          }`}
                        >
                          {isRTL ? item.title : item.titleEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.isKeyCheck && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 flex items-center gap-0.5 shadow-2xs">
                            <Flame className="w-2.5 h-2.5 text-rose-600" />
                            <span>{isRTL ? 'خطوة حرجة (Crucial)' : 'Crucial Step ⚠️'}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#8C8474] dark:text-[#9A9382] hidden sm:inline">
                          {isRTL ? item.titleEn : 'Clinical Guideline'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#635C4E] dark:text-[#C5BFB0] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Critical Warning Alert Box */}
                    {item.criticalWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-bold">{item.criticalWarning}</span>
                      </div>
                    )}

                    {/* Recommended Instruments Chips */}
                    {item.recommendedInstruments && item.recommendedInstruments.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-[#8C8474] dark:text-[#A7A08E] flex items-center gap-1">
                          <Wrench className="w-2.5 h-2.5" />
                          <span>{isRTL ? 'الأدوات الموصى بها:' : 'Armamentarium:'}</span>
                        </span>
                        {item.recommendedInstruments.map((inst, instIdx) => (
                          <span
                            key={`${inst}_${instIdx}`}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#596628]/10 dark:bg-[#7D9333]/20 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/20"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] dark:bg-[#181C14] border-t border-[#E5DEC9] dark:border-[#323A25] flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#20271A] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isRTL ? 'إلغاء التحديد وإعادة البدء من جديد' : 'Reset all steps'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>{isRTL ? 'إعادة البدء (Reset)' : 'Reset'}</span>
            </button>

            <button
              onClick={handleMarkAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isRTL ? 'تحديد كافة الخطوات كمنجزة' : 'Verify all steps'}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              <span>{isRTL ? 'تحديد الكل كمنجز' : 'Mark All Verified'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#20271A] hover:bg-neutral-100 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer no-print"
              title={isRTL ? 'طباعة قائمة المهام السريرية' : 'Print Checklist'}
            >
              <Printer className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>{isRTL ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#596628] hover:bg-[#485320] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isRTL ? 'إتمام ومتابعة العمل السريري' : 'Confirm & Proceed Chairside'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
