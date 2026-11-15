import React, { useState } from 'react';
import { X, ClipboardCheck, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { PreProcedureChecklistCard } from './PreProcedureChecklistCard';
import { useLanguage } from '../contexts/LanguageContext';

interface PreProcedureFloatingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId?: string;
  protocolTitle?: string;
  isAuthorAdmin?: boolean;
}

export const PreProcedureFloatingSheet: React.FC<PreProcedureFloatingSheetProps> = ({
  isOpen,
  onClose,
  protocolId = 'all',
  protocolTitle = 'الإجراء السريري',
  isAuthorAdmin = false,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-5 animate-in fade-in duration-200 select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`bg-white dark:bg-[#1A2014] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 scrollbar-thin overflow-y-auto transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-[10000] w-full h-full max-w-none max-h-none rounded-none'
            : 'rounded-3xl max-w-2xl w-full max-h-[92vh]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {isRTL ? 'قائمة التحقق السريري السريع قبل الإجراء' : 'Rapid Chairside Pre-Procedure Safety Verification'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isRTL ? 'In-Clinic Pre-Procedure Safety Verification Sheet' : 'Faculty-Approved Restorative Protocol Checklist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isFullscreen ? (isRTL ? 'تصغير الشاشة' : 'Exit Fullscreen') : (isRTL ? 'تكبير الشاشة ملء الشاشة' : 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-600" /> : <Maximize2 className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Core Checklist Card */}
        <PreProcedureChecklistCard
          protocolId={protocolId}
          protocolTitle={protocolTitle}
          isAuthorAdmin={isAuthorAdmin}
          defaultExpanded={true}
          isFloatingSheet={true}
          onCloseFloatingSheet={onClose}
        />
      </div>
    </div>
  );
};
