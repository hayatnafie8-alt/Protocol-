import React from 'react';
import { ShieldAlert, Printer, Lock, X } from 'lucide-react';

interface SecurityNoticeToastProps {
  message: string;
  type?: 'print_blocked' | 'copy_blocked';
  onClose: () => void;
  onOpenPrint?: () => void;
}

export const SecurityNoticeToast: React.FC<SecurityNoticeToastProps> = ({
  message,
  type = 'print_blocked',
  onClose,
  onOpenPrint,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92%] animate-slideUp">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#2F2B24] dark:bg-[#181D13] text-white border-2 border-amber-500 shadow-2xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
          {type === 'print_blocked' ? (
            <Printer className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-amber-400">
              {type === 'print_blocked' ? 'نظام الطباعة الآمن المعتمد' : 'حماية المحتوى السريري'}
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#E5DEC9] leading-relaxed">
            {message}
          </p>

          {type === 'print_blocked' && onOpenPrint && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrint();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>الطباعة المعتمدة مع الختم المائي الآن</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
