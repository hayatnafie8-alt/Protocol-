import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X, Sparkles } from 'lucide-react';

interface CardFocusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  badge?: string;
  children: React.ReactNode;
}

/**
 * Universal Card Focus Overlay (Distraction-Free Clinical Reading Mode)
 * Expands any card/box into a large-font, high-contrast, scrollable fullscreen view.
 */
export const CardFocusOverlay: React.FC<CardFocusOverlayProps> = ({
  isOpen,
  onClose,
  title,
  badge = 'وضع التركيز السريري المكبر • Fullscreen Focus Mode',
  children,
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full mx-auto my-auto bg-white dark:bg-[#1A2014] rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 shadow-2xl p-5 sm:p-8 space-y-4 overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              {badge}
            </span>
            {title && (
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white mt-1">
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="تصغير / إغلاق وضع التركيز (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>تصغير النافذة</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-600 hover:text-white text-neutral-500 transition-colors cursor-pointer"
              title="إغلاق (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Body Content */}
        <div className="pt-2 text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

interface CardMaximizeButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
}

/**
 * Lightweight Maximize / Focus trigger button for top-right corner of any card
 */
export const CardMaximizeButton: React.FC<CardMaximizeButtonProps> = ({
  onClick,
  title = 'تكبير البطاقة وقراءتها بوضع ملء الشاشة (Fullscreen Focus Mode)',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`p-1.5 rounded-xl bg-neutral-100 hover:bg-[#0077b6] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#0077b6] text-neutral-600 dark:text-neutral-400 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${className}`}
      title={title}
    >
      <Maximize2 className="w-3.5 h-3.5" />
    </button>
  );
};
