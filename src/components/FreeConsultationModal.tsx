import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Instagram,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Send,
  Edit3,
  Save,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import {
  getInstagramProfileUrl,
  setInstagramProfileUrl,
} from '../data/consultationSettings';

interface FreeConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const FreeConsultationModal: React.FC<FreeConsultationModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [instagramUrl, setInstagramUrl] = useState<string>(() => getInstagramProfileUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [inputUrl, setInputUrl] = useState(instagramUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setInstagramProfileUrl(inputUrl);
    setInstagramUrl(updated);
    setIsEditingUrl(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenInstagram = () => {
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  // Extract handle for display (e.g., @hay_a_2)
  const getDisplayHandle = (url: string) => {
    try {
      const match = url.match(/instagram\.com\/([^/?#]+)/i);
      if (match && match[1]) return `@${match[1]}`;
    } catch {}
    return '@hay_a_2';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#181D13] rounded-3xl shadow-2xl border-2 border-[#59662C]/40 dark:border-[#3E4A2E] overflow-hidden my-auto animate-scaleUp text-[#2F2B24] dark:text-[#F3EFE6]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-[#59662C]/15 dark:from-rose-950/30 dark:via-[#20271A] dark:to-[#171A12] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                  طلب استشارة مجانية 💬
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  مباشر DM
                </span>
              </div>
              <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] font-medium mt-0.5">
                احصل على توجيه سريري مباشر - اشترك بالصفحة وأرسل استفسارك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-500 hover:text-gray-800 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-right">
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم حفظ وتحديث رابط الإنستغرام بنجاح!</span>
            </div>
          )}

          {/* Intro Guidance */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
            <div className="flex items-center gap-2 text-[#59662C] dark:text-[#A8C24E] text-xs font-black">
              <HeartHandshake className="w-4 h-4" />
              <span>خدمة الاستشارات السريرية المباشرة لطلاب وأطباء الأسنان</span>
            </div>
            <p className="text-xs text-[#635D50] dark:text-[#A7A08E] leading-relaxed">
              يسعد د. حياه نافع فجر بتقديم الاستشارات والتوجيهات السريرية في حالات ترميم الأسنان، علاج العصب، الجراحة الصغرى، وتكنيك العزل بالربر دام.
            </p>
          </div>

          {/* 2-Step Process Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#433D32] dark:text-[#D5CDBC] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>خطوات الاستشارة السريعة (2 خطوات فقط):</span>
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2216] border-2 border-rose-100 dark:border-rose-950/60 shadow-xs flex items-start gap-3.5 group hover:border-rose-300 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                1
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                    خطوة 1: قم بمتابعة حسابنا على إنستغرام (Instagram)
                  </h5>
                  <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                    {getDisplayHandle(instagramUrl)}
                  </span>
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] leading-relaxed">
                  تابع الحساب الرسمي للاطلاع على الحالات السريرية الموثقة والتحديثات الأكاديمية المستمرة.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2216] border-2 border-[#59662C]/20 dark:border-[#384524] shadow-xs flex items-start gap-3.5 group hover:border-[#59662C]/50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[#59662C] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                2
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                    خطوة 2: أرسل استشارتك السريرية عبر الرسائل الخاصة (DM)
                  </h5>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0">
                    استجابة سريعة
                  </span>
                </div>
                <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] leading-relaxed">
                  أرسل صور الحالة أو الأشعة أو استفسارك السريري مباشرة في رسالة خاصة، وسيتم الرد عليك وتوجيهك خطوة بخطوة.
                </p>
              </div>
            </div>
          </div>

          {/* Admin Configuration Section */}
          {isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>تعديل رابط حساب الإنستغرام (للمشرف فقط):</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingUrl(!isEditingUrl);
                    setInputUrl(instagramUrl);
                  }}
                  className="text-amber-800 dark:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingUrl ? 'إلغاء التعديل' : 'تعديل الرابط ✏️'}</span>
                </button>
              </div>

              {isEditingUrl && (
                <form onSubmit={handleSaveUrl} className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    dir="ltr"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-[#151910] rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-mono text-[#2F2B24] dark:text-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Action Button: Direct Instagram Routing */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenInstagram}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Instagram className="w-5 h-5 text-white" />
              <span>الانتقال للإنستغرام وإرسال الاستشارة 📸</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </button>
            <p className="text-[11px] text-[#716A5B] dark:text-[#A7A08E] text-center mt-2">
              سيتم فتح تطبيق إنستغرام أو متصفحك مباشرةً للانتقال للحساب الرسمي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
