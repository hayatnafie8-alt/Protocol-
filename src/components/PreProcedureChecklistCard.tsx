import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Activity,
  ShieldAlert,
  UserCheck,
  Wrench,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Unlock,
  CheckCheck,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  PreProcedureChecklistItem,
  getChecklistItemsForProtocol,
  getSessionCheckedItems,
  toggleSessionCheckItem,
  resetSessionChecklist,
  markAllSessionChecklist,
  addAdminCustomChecklistItem,
  deleteAdminCustomChecklistItem,
} from '../data/preProcedureChecklistData';
import { useLanguage } from '../contexts/LanguageContext';

interface PreProcedureChecklistCardProps {
  protocolId?: string;
  protocolTitle?: string;
  isAuthorAdmin?: boolean;
  defaultExpanded?: boolean;
  isFloatingSheet?: boolean;
  onCloseFloatingSheet?: () => void;
  className?: string;
}

export const PreProcedureChecklistCard: React.FC<PreProcedureChecklistCardProps> = ({
  protocolId = 'all',
  protocolTitle = 'الإجراء السريري الروتيني',
  isAuthorAdmin = false,
  defaultExpanded = true,
  isFloatingSheet = false,
  onCloseFloatingSheet,
  className = '',
}) => {
  const { language, t, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [items, setItems] = useState<PreProcedureChecklistItem[]>(() =>
    getChecklistItemsForProtocol(protocolId)
  );
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    getSessionCheckedItems(protocolId)
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [justAchievedReady, setJustAchievedReady] = useState<boolean>(false);

  // Admin Add Item Modal State
  const [showAdminAddModal, setShowAdminAddModal] = useState<boolean>(false);
  const [newTitleAr, setNewTitleAr] = useState<string>('');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newDescAr, setNewDescAr] = useState<string>('');
  const [newDescEn, setNewDescEn] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'clinical' | 'setup' | 'safety' | 'legal'>('clinical');

  // Reload items when protocol changes or template updates
  const reloadItems = () => {
    setItems(getChecklistItemsForProtocol(protocolId));
    setCheckedIds(getSessionCheckedItems(protocolId));
  };

  useEffect(() => {
    reloadItems();
  }, [protocolId]);

  // Synchronize state on window events across tabs/components
  useEffect(() => {
    const handleChecklistUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ protocolId: string; checkedIds: string[] }>;
      if (custom.detail?.protocolId === protocolId) {
        setCheckedIds(custom.detail.checkedIds);
      }
    };

    const handleTemplateUpdated = () => {
      reloadItems();
    };

    window.addEventListener('pre-procedure-checklist-updated', handleChecklistUpdated);
    window.addEventListener('pre-procedure-template-updated', handleTemplateUpdated);

    return () => {
      window.removeEventListener('pre-procedure-checklist-updated', handleChecklistUpdated);
      window.removeEventListener('pre-procedure-template-updated', handleTemplateUpdated);
    };
  }, [protocolId]);

  // Math & Progress
  const totalSteps = items.length;
  const completedCount = items.filter((i) => checkedIds.includes(i.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllComplete = completedCount === totalSteps && totalSteps > 0;

  // Trigger brief celebration banner on reaching 100%
  const handleToggleStep = (itemId: string) => {
    const next = toggleSessionCheckItem(protocolId, itemId);
    setCheckedIds(next);

    if (next.length === totalSteps && totalSteps > 0) {
      setJustAchievedReady(true);
      setTimeout(() => setJustAchievedReady(false), 5000);
    }
  };

  // Reset all for the next patient
  const handleResetForNextPatient = () => {
    if (window.confirm('إعادة ضبط قائمة التحقق للحالة السريرية التالية؟\nReset checklist for the next patient?')) {
      resetSessionChecklist(protocolId);
      setCheckedIds([]);
      setJustAchievedReady(false);
    }
  };

  // Mark all completed
  const handleMarkAllDone = () => {
    const all = markAllSessionChecklist(protocolId);
    setCheckedIds(all);
    setJustAchievedReady(true);
    setTimeout(() => setJustAchievedReady(false), 5000);
  };

  // Admin submit custom item
  const handleAdminSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim()) return;

    addAdminCustomChecklistItem({
      titleAr: newTitleAr.trim(),
      titleEn: newTitleEn.trim() || newTitleAr.trim(),
      descriptionAr: newDescAr.trim() || 'خطوة سريرية مخصصة للحالة',
      descriptionEn: newDescEn.trim() || 'Custom clinical protocol step',
      category: newCategory,
      protocolId,
    });

    setNewTitleAr('');
    setNewTitleEn('');
    setNewDescAr('');
    setNewDescEn('');
    setShowAdminAddModal(false);
    reloadItems();
  };

  // Admin delete custom item
  const handleDeleteCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('حذف هذه الخطوة المخصصة من قائمة التحقق؟')) {
      deleteAdminCustomChecklistItem(id);
      reloadItems();
    }
  };

  // Filtered steps
  const filteredItems = useMemo(() => {
    if (activeFilter === 'pending') {
      return items.filter((i) => !checkedIds.includes(i.id));
    }
    if (activeFilter === 'completed') {
      return items.filter((i) => checkedIds.includes(i.id));
    }
    return items;
  }, [items, checkedIds, activeFilter]);

  // Icon mapping helper
  const renderStepIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-emerald-500" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'ClipboardCheck':
      default:
        return <ClipboardCheck className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 select-none ${
        isAllComplete
          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700/80 shadow-md'
          : 'bg-white dark:bg-[#1A2014] border-amber-300/80 dark:border-amber-800/80 shadow-sm'
      } ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ------------------------------------------------------------- */}
      {/* HEADER BAR (Always visible, Clickable to toggle) */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 cursor-pointer group flex-1"
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
              isAllComplete
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
            }`}
          >
            <ClipboardCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {isRTL ? 'Safety First • فحص ما قبل البدء' : 'Safety First • Pre-Op Clearance'}
              </span>
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                {protocolTitle}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>
                {isRTL
                  ? 'قائمة التحقق السريري قبل الإجراء (Pre-Procedure Checklist)'
                  : 'Chairside Pre-Procedure Safety Verification'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </h3>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Live Progress Pill */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-colors ${
              isAllComplete
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
            }`}
          >
            {isAllComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            <span>
              {isRTL
                ? `${completedCount}/${totalSteps} منجز (${progressPercent}%)`
                : `${completedCount}/${totalSteps} Verified (${progressPercent}%)`}
            </span>
          </div>

          {/* Reset Checklist for Next Patient */}
          <button
            type="button"
            onClick={handleResetForNextPatient}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            title={isRTL ? 'إعادة ضبط القائمة للحالة السريرية التالية' : 'Reset checklist for next patient'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isFloatingSheet && onCloseFloatingSheet && (
            <button
              type="button"
              onClick={onCloseFloatingSheet}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title={isRTL ? 'إغلاق النافذة العائمة' : 'Close Floating Sheet'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PROGRESS BAR STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isAllComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : progressPercent > 0
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-neutral-300'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* COLLAPSIBLE BODY */}
      {/* ------------------------------------------------------------- */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          {/* 100% READY ALERT BADGE */}
          {isAllComplete ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <CheckCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black">
                    {isRTL
                      ? 'Ready to Treat! 🦷 جاهز لبدء الحالة السريرية بأمان'
                      : 'Ready to Treat! 🦷 Clinical Safety Clearance Complete'}
                  </h4>
                  <p className="text-[11px] text-emerald-100">
                    {isRTL
                      ? 'تمت مراجعة كافة المعايير الحيوية، التاريخ المرضي، موافقة المشرف، وجاهزية الأدوات بنجاح.'
                      : 'Vital parameters, patient medical history, faculty approval, and sterile tray setups have been verified.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetForNextPatient}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-black shadow-xs hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
              >
                {isRTL ? 'المريض التالي ↻' : 'Next Patient ↻'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{isRTL ? 'تنبيه سريري:' : 'Clinical Notice:'}</strong>{' '}
                  {isRTL
                    ? 'إتمام هذه الخطوات يمنع أخطاء النسيان الناتجة عن ضغط العيادة وازدحام المرضى.'
                    : 'Verification of these pre-operative parameters prevents procedural omissions under chairside stress and peak clinic volume.'}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleMarkAllDone}
                  className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  {isRTL ? 'تعليم الكل كمنجز ✓' : 'Verify All Items ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {isRTL ? `الكل (${items.length})` : `All (${items.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {isRTL ? `المتبقي (${totalSteps - completedCount})` : `Pending (${totalSteps - completedCount})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {isRTL ? `المنجز (${completedCount})` : `Verified (${completedCount})`}
              </button>
            </div>

            {/* Admin Add Custom Step Trigger */}
            {isAuthorAdmin && (
              <button
                type="button"
                onClick={() => setShowAdminAddModal(true)}
                className="text-[11px] font-black text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إضافة خطوة مخصصة لهذا البروتوكول (Admin)' : 'Add Custom Step (Faculty)'}</span>
              </button>
            )}
          </div>

          {/* CHECKLIST ITEMS LIST */}
          <div className="space-y-2.5">
            {filteredItems.map((item, idx) => {
              const isChecked = checkedIds.includes(item.id);

              return (
                <div
                  key={`${item.id}_${idx}`}
                  onClick={() => handleToggleStep(item.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group select-none min-h-[58px] ${
                    isChecked
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-2xs'
                      : 'bg-neutral-50/70 dark:bg-[#151B10] border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-700 hover:bg-white dark:hover:bg-[#1E2617]'
                  }`}
                >
                  {/* Clinic-friendly large touch target check button */}
                  <div className="pt-0.5 shrink-0">
                    {isChecked ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCheck className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-amber-500 bg-white dark:bg-[#12160E] flex items-center justify-center transition-colors">
                        <Circle className="w-3.5 h-3.5 text-transparent group-hover:text-amber-400" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                          {item.stepNumber}
                        </span>

                        <h4
                          className={`text-xs sm:text-sm font-black transition-colors ${
                            isChecked
                              ? 'line-through text-neutral-500 dark:text-neutral-400'
                              : 'text-neutral-900 dark:text-white'
                          }`}
                        >
                          {isRTL ? item.titleAr : item.titleEn}
                        </h4>

                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                          • {isRTL ? item.titleEn : item.titleAr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderStepIcon(item.iconName)}

                        {/* Admin delete for custom steps */}
                        {!item.isCore && isAuthorAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomItem(item.id, e)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title={isRTL ? 'حذف هذه الخطوة المخصصة' : 'Delete Custom Step'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isChecked
                          ? 'text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {isRTL ? item.descriptionAr : item.descriptionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Footer Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>
              💡 <em>{isRTL ? 'تنبيه: تُحفظ حالة الخطوات طوال جلستك السريرية الحالية، ولا تُمحى عند التنقل بين الشاشات.' : 'Notice: Checkpoints are securely preserved throughout your active session across all screens.'}</em>
            </span>
            <span className="font-bold">
              {isRTL
                ? `حالة الجلسة: ${isAllComplete ? 'مكتملة وجاهزة 100%' : `${completedCount} من ${totalSteps} خطوات`}`
                : `Status: ${isAllComplete ? '100% Verified & Cleared' : `${completedCount} of ${totalSteps} Completed`}`}
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADMIN ADD CUSTOM STEP MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAdminAddModal && isAuthorAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2014] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h4 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0077b6]" />
                <span>إضافة خطوة مخصصة لقائمة التحقق السريري</span>
              </h4>
              <button
                onClick={() => setShowAdminAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmitItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  عنوان الخطوة بالعربية *:
                </label>
                <input
                  type="text"
                  required
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: فحص نقاط التماس المسبقة بشريط الإطباق"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  العنوان بالإنجليزية (اختياري):
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="Pre-op Articulating Paper Occlusal Check"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  الوصف والتوجيه السريري:
                </label>
                <textarea
                  rows={2}
                  value={newDescAr}
                  onChange={(e) => setNewDescAr(e.target.value)}
                  placeholder="تعليمات أو نصيحة لتفادي كسر الحشوة أو الخطأ السريري..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  التصنيف:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#12160E] outline-none"
                >
                  <option value="clinical">سريري (Clinical)</option>
                  <option value="setup">تجهيز الأدوات (Setup)</option>
                  <option value="safety">سلامة المريض (Safety)</option>
                  <option value="legal">قانوني وموافقة (Legal)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#0077b6] hover:bg-[#005f9e] text-white shadow-sm cursor-pointer"
                >
                  حفظ الخطوة وإضافتها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
