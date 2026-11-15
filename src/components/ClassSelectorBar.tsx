import React from 'react';
import { RestorationClass } from '../data/classesData';
import { Plus, Trash2, Layers, Check, Camera, Eye, EyeOff, ClipboardCheck } from 'lucide-react';

interface ClassSelectorBarProps {
  classes: RestorationClass[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onOpenManualBuilder: () => void;
  onDeleteCustomClass?: (id: string) => void;
  onOpenPhotos?: () => void;
  isAuthorAdmin?: boolean;
  onToggleClassVisibility?: (id: string) => void;
  onOpenChecklist?: (classId: string) => void;
}

export const ClassSelectorBar: React.FC<ClassSelectorBarProps> = ({
  classes,
  activeClassId,
  onSelectClass,
  onOpenManualBuilder,
  onDeleteCustomClass,
  onOpenPhotos,
  isAuthorAdmin = true,
  onToggleClassVisibility,
  onOpenChecklist,
}) => {
  // Requirement: Strict conditional rendering based on isVisible
  // 1. For subscribers (end-users): Dynamically filter out all items where isVisible == false
  //    Completely remove item container, card, and icon so no empty spaces or placeholders appear.
  // 2. For admins: Show all items with an option or toggle to change isVisible state.
  const displayedClasses = classes.filter(
    (cls) => isAuthorAdmin || cls.isVisible === true
  );

  const currentClass = displayedClasses.find((c) => c.id === activeClassId) || displayedClasses[0] || classes[0];

  return (
    <div className="no-print bg-[#FAF7F2] dark:bg-[#181C14] border-b border-[#E5DEC9] dark:border-[#323A26] py-3 px-4 sm:px-6 lg:px-8 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Classes Horizontal Scrollable Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-[#6B6557] dark:text-[#A7A08E] shrink-0 ml-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
            <span>الكلاسات الحالية:</span>
          </span>

          {displayedClasses.map((cls, clsIdx) => {
            const isSelected = cls.id === activeClassId;
            const isHidden = cls.isVisible === false;

            return (
              <div key={`${cls.id}_${clsIdx}`} className="relative group shrink-0 flex items-center">
                <button
                  onClick={() => onSelectClass(cls.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#596628] dark:bg-[#7D9333] text-white border-[#596628] dark:border-[#7D9333] shadow-xs ring-2 ring-[#596628]/20 dark:ring-[#A8C24E]/30'
                      : isHidden
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-dashed border-amber-400 dark:border-amber-700'
                      : 'bg-white dark:bg-[#20261A] hover:bg-[#F4EFE6] dark:hover:bg-[#2A3322] text-[#423C30] dark:text-[#E2DDD2] border-[#E5DEC9] dark:border-[#343E26]'
                  }`}
                >
                  <span>{cls.code}</span>
                  <span className={`text-[11px] font-normal ${isSelected ? 'text-white/80' : isHidden ? 'text-amber-700 dark:text-amber-300' : 'text-[#7D7667] dark:text-[#9A9382]'}`}>
                    {cls.arabicName.split('(')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  {isAuthorAdmin && isHidden && (
                    <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">
                      مخفي
                    </span>
                  )}
                </button>

                {/* Admin Visibility Toggle (Requirement #3) */}
                {isAuthorAdmin && onToggleClassVisibility && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleClassVisibility(cls.id);
                    }}
                    className={`mr-1 p-1 rounded-lg transition-colors cursor-pointer ${
                      isHidden
                        ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60'
                        : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={isHidden ? 'إظهار الكلاس للمشتركين' : 'إخفاء الكلاس عن المشتركين'}
                  >
                    {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* If it's a user-added custom class, show delete button (author only) */}
                {cls.isCustom && isAuthorAdmin && onDeleteCustomClass && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`هل أنت متأكد من حذف كلاس "${cls.arabicName}"؟`)) {
                        onDeleteCustomClass(cls.id);
                      }
                    }}
                    className="mr-1 p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 transition-colors cursor-pointer"
                    title="حذف هذا الكلاس المضاف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Clinical Checklist Button (Requirement #2) */}
          {onOpenChecklist && currentClass && (
            <button
              onClick={() => onOpenChecklist(currentClass.id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/50 dark:border-amber-600/50 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="فتح قائمة المهام السريرية التفاعلية لهذا الكلاس (Clinical Checklist)"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>مهام {currentClass.code} السريرية</span>
            </button>
          )}

          {/* Quick Real Photos Button */}
          {onOpenPhotos && (
            <button
              onClick={onOpenPhotos}
              className="px-3.5 py-1.5 rounded-xl bg-[#596628]/10 dark:bg-[#7D9333]/20 hover:bg-[#596628] dark:hover:bg-[#7D9333] hover:text-white border border-[#596628]/30 dark:border-[#7D9333]/40 text-[#596628] dark:text-[#A8C24E] text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="عرض صور الحالات السريرية الحقيقية"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>صور سريرية حقيقية</span>
            </button>
          )}

          {/* Add New Class Manually Button - ONLY VISIBLE TO AUTHOR */}
          {isAuthorAdmin && (
            <button
              onClick={onOpenManualBuilder}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#20261A] hover:bg-[#596628] dark:hover:bg-[#7D9333] hover:text-white border-2 border-dashed border-[#596628] dark:border-[#A8C24E] text-[#596628] dark:text-[#A8C24E] text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="إضافة كلاس يدوي وتنسيقه تلقائياً مثل كلاس فور (خاص بالمشرف)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة كلاس يدوي</span>
            </button>
          )}
        </div>

        {/* Current Active Class Overview Tag */}
        {currentClass && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#635D4F] dark:text-[#A7A08E] bg-white/70 dark:bg-[#20261A]/80 px-3 py-1 rounded-xl border border-[#E5DEC9] dark:border-[#343E26]">
            <span className="font-bold text-[#596628] dark:text-[#A8C24E]">{currentClass.code}:</span>
            <span className="truncate max-w-[280px]">{currentClass.indication}</span>
          </div>
        )}
      </div>
    </div>
  );
};
