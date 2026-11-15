import React, { useState } from 'react';
import { Send, Copy, Check, Sparkles, Award, ArrowUpRight, GraduationCap } from 'lucide-react';

interface TelegramPromoModalProps {
  onClose?: () => void;
}

export const TelegramPromoModal: React.FC<TelegramPromoModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('كورس');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#FAF7F2] border-2 border-[#596628] rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      {/* Decorative olive glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#596628]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#596628]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#596628] text-white text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>عرض حصري للزملاء وطلبة طب الأسنان</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
            خصم 50% لفترة محدودة ⏳
          </div>
        </div>

        {/* Headline */}
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-[#2F2B24] tracking-tight">
            الكورس الوزاري الشامل وكورس العيادات (منصة ليرنو)
          </h3>
          <p className="text-sm md:text-base text-[#615B4D] mt-2 leading-relaxed">
            طوّر مهاراتك السريرية من الأساسيات حتى الإتقان التام في حشوات الأسنان الأمامية والخلفية مع محتوى أكاديمي وسريري مدعم بالحالات الواقعية.
          </p>
        </div>

        {/* Promo Code Box */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <span className="text-xs text-[#7F796C] font-semibold block">كود الخصم الحصري (ارسل الكلمة في التليجرام):</span>
            <span className="text-2xl font-black text-[#596628] tracking-widest font-mono">
              كورس
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] hover:bg-[#F2ECE0] text-[#3B362C] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#596628]" />}
              <span>{copied ? 'تم نسخ الكلمة!' : 'نسخ كلمة "كورس"'}</span>
            </button>

            <a
              href="https://t.me/hay_a_2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>مراسلة التليجرام</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Author info pill */}
        <div className="pt-2 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B6557]">
          <div className="flex items-center gap-2 font-bold text-[#2F2B24]">
            <GraduationCap className="w-4 h-4 text-[#596628]" />
            <span>إعداد: حياه نافع فجر | مرحلة رابعة - جامعة المعارف</span>
          </div>
          <div className="flex items-center gap-2">
            <span>القناة الرسمية:</span>
            <a
              href="https://t.me/hay_a_2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#596628] hover:underline"
            >
              t.me/hay_a_2
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
