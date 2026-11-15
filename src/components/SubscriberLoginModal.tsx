import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Sparkles,
  GraduationCap,
  Eye,
  ShieldCheck,
  Lock,
  CreditCard,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { verifyActivationCode } from '../data/studentCodes';
import { RequestCodeModal } from './RequestCodeModal';

interface SubscriberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'admin' | 'student', email?: string) => void;
  adminPin: string;
  targetSectionTitle?: string;
}

export const SubscriberLoginModal: React.FC<SubscriberLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminPin,
  targetSectionTitle,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = codeInput.trim();
    if (!clean) {
      setErrorMsg('يرجى كتابة كود التفعيل للفتح.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = verifyActivationCode(clean, adminPin);
      if (res.valid && res.role) {
        onSuccess(res.role, res.studentEmail);
        onClose();
      } else {
        setErrorMsg(
          res.error ||
            'كود التفعيل غير صحيح أو منتهي الصلاحية. يرجى التأكد من كتابة الكود بشكل دقيق أو مراجعة المشرفة.'
        );
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className={`bg-white dark:bg-[#1E2417] shadow-2xl border-2 border-amber-400 dark:border-amber-600/60 flex flex-col overflow-y-auto transition-all duration-300 animate-scaleUp ${
          isFullscreen
            ? 'fixed inset-0 z-[10000] w-full h-full max-w-none rounded-none'
            : 'relative w-full max-w-md rounded-3xl max-h-[92vh]'
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500/15 via-[#FAF7F2] to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-b border-[#E5DEC9] dark:border-[#343E26] text-center space-y-2 relative">
          <div className="absolute left-4 top-4 flex items-center gap-1.5">
            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-amber-600 dark:text-amber-400 hover:text-amber-800 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shadow-2xs"
              title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-400 hover:text-gray-700 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>محتوى محمي بكود تفعيل</span>
          </div>

          <h3 className="text-xl font-black text-[#2F2B24] dark:text-white">
            أدخل كود التفعيل للفتح 🔒
          </h3>
          <p className="text-xs text-[#6B6354] dark:text-[#C5BEAF]">
            {targetSectionTitle ? (
              <span>
                لفتح قسم <strong>«{targetSectionTitle}»</strong> وتصفح المحتوى والملفات، أدخل كود التفعيل الممنوح لك:
              </span>
            ) : (
              <span>
                هذا المحتوى محمي. أدخل كود التفعيل الممنوح لك (مثال: <span className="font-mono font-bold">STU-xxxx-xxx</span>) للفتح الفوري.
              </span>
            )}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-bold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-black text-[#353026] dark:text-white block text-right">
              كود المشترك المخصص (Access Code):*
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="STU-XXXX-XXX"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                className="w-full pl-4 pr-4 py-3 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border-2 border-[#D5CDBC] dark:border-[#384524] text-center font-mono text-base font-black tracking-wider text-[#2F2B24] dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-1 text-[11px] text-[#615A4C] dark:text-[#C5BEAF]">
            <span className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>مزايا حساب المشترك (Read-Only Mode):</span>
            </span>
            <ul className="space-y-0.5 pr-4 list-disc font-medium">
              <li>قراءة وتصفح بروتوكولات ترميم الكومبوزيت لكافة الكلاسات.</li>
              <li>استعراض الحالات الجراحية وخطوات الخلع والزرع بالتفصيل.</li>
              <li>الوصول لدليل التمارين والتدريبات المنزلية وبطاقات التقييم الذاتي.</li>
              <li>أطلس دليل التعامل مع المراجعين وسيكولوجية العيادة (18 شريحة).</li>
            </ul>
            <div className="pt-1.5 mt-1 border-t border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
              <span>حماية الجهاز الأحادي: الحساب مقيد بجهاز نشط واحد لمنع المشاركة غير المصرح بها.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? (
              <span>جاري التحقق من الكود...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>التحقق وفتح المحتوى الآن 🔓</span>
              </>
            )}
          </button>

          {/* Help link to contact Dr. Hayat with email input */}
          <div className="pt-2 text-center border-t border-[#E5DEC9] dark:border-[#343E26] space-y-2">
            <span className="text-[11px] text-[#7B7465] dark:text-[#A7A08E] block">
              لم يصلك كود التفعيل الخاص بك بعد أو تحتاج اشتراكاً؟
            </span>
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-600 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs hover:scale-[1.01]"
            >
              <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>الاشتراك السنوي وتفعيل الحساب عبر ماستركارد 💳</span>
            </button>
          </div>
        </form>
      </div>

      {/* Email Input & Code Request Window */}
      <RequestCodeModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        targetSectionTitle={targetSectionTitle}
      />
    </div>
  );
};
