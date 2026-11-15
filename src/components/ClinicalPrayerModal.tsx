import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandHeart, Sparkles, Copy, Check, X, ArrowLeft } from 'lucide-react';

interface ClinicalPrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CLINICAL_PRAYER_TEXT =
  'اللهم اجعل يدك محيطة، لاحقةً، سابقةً أيدينا.. اللهم لا تؤاخذني بذنبه ولا تؤاخذه بذنبي، واجعل عملنا خالصاً لوجهك الكريم، واكتب لنا التوفيق والشفاء على أيدينا.';

export const ClinicalPrayerModal: React.FC<ClinicalPrayerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CLINICAL_PRAYER_TEXT);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = CLINICAL_PRAYER_TEXT;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clinical-prayer-title"
        >
          {/* Backdrop with ambient blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-lg my-auto rounded-3xl overflow-hidden shadow-2xl border border-[#c5a059]/40 bg-gradient-to-b from-[#182115] via-[#12180f] to-[#0d120a] text-white z-10"
            style={{
              boxShadow:
                '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(197, 160, 89, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative glowing ambient beam */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-80" />

            {/* Close Button at top-left (RTL) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-all cursor-pointer z-20 group"
              title="إغلاق والانتقال إلى الواجهة"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Inner Content Padding */}
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              {/* Header Icon Emblem */}
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-[#c5a059]/20 blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#263420] to-[#141b10] border-2 border-[#c5a059]/50 flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#c5a059]/10">
                  <HandHeart className="w-8 h-8" strokeWidth={2.2} />
                </div>
              </div>

              {/* Badges / Titles */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#d4af37] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>دعاء الطبيب السريري • نية الشفاء والتوفيق</span>
              </div>

              {/* Bismillah calligraphy header */}
              <div className="text-sm font-serif text-[#c5a059]/90 tracking-wide mb-5 select-none font-bold">
                بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
              </div>

              {/* The Supplication Card with golden inner frame */}
              <div className="w-full relative rounded-2xl p-6 sm:p-7 bg-[#151d12]/90 border border-[#c5a059]/30 shadow-inner mb-6">
                {/* Traditional quotation mark visual accent */}
                <span className="absolute top-2 right-4 text-3xl font-serif text-[#c5a059]/20 select-none">
                  ❝
                </span>
                <span className="absolute bottom-2 left-4 text-3xl font-serif text-[#c5a059]/20 select-none">
                  ❞
                </span>

                <p
                  id="clinical-prayer-title"
                  className="text-base sm:text-lg font-bold text-[#faf7ee] leading-[2.1] tracking-normal select-text font-['Cairo',sans-serif]"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  «اللهم اجعل يدك محيطة، لاحقةً، سابقةً أيدينا.. اللهم لا تؤاخذني
                  بذنبه ولا تؤاخذه بذنبي، واجعل عملنا خالصاً لوجهك الكريم،
                  واكتب لنا التوفيق والشفاء على أيدينا.»
                </p>

                {/* Subtle Divider */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[#c5a059]/20 text-[#a39c89] text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/60" />
                  <span>استحضر نية الشفاء والإخلاص في كل إجراء ومريض</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/60" />
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                {/* Primary Action Button: "استعانة بالله" (Closes smoothly to main UI) */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#997933] hover:from-[#e0bd49] hover:via-[#d4af37] hover:to-[#a9873b] text-[#12170f] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/25 hover:shadow-xl hover:shadow-[#c5a059]/35 cursor-pointer active:scale-[0.98] transition-all duration-150"
                >
                  <span>استعانة بالله • دخول الواجهة</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </button>

                {/* Secondary Button: Copy Prayer */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[#d8d2c0] hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
                  title="نسخ نص الدعاء إلى الحافظة"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#c5a059]" />
                      <span>نسخ الدعاء</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-4 text-[11px] text-[#868f7d] flex items-center gap-1.5">
                <span>بروتوكول لطب الأسنان السريري</span>
                <span>•</span>
                <span>توفيقاً ورعاية لكل خطوة علاجية</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
