import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Download,
  Smartphone,
  Globe,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Generate dynamic URL with cache-busting timestamp and sync trigger for recipients
  const getCleanShareUrl = () => {
    if (typeof window !== 'undefined') {
      const base = `${window.location.origin}${window.location.pathname}`;
      return `${base}?v=${Date.now()}&sync=true`;
    }
    return 'https://ais-pre-53iiilcso2wowisop4dq5b-760525276131.europe-west2.run.app?sync=true';
  };

  const currentUrl = getCleanShareUrl();
  const shareTitle = 'بروتوكول PROTOCOL | د. حياه نافع فجر';
  const shareText = 'تطبيق بروتوكول PROTOCOL السريري الشامل لطب وجراحة الأسنان - د. حياه نافع فجر 🦷✨ (محدث بأحدث الصور والشعار)';

  const handleCopy = async () => {
    try {
      const freshUrl = getCleanShareUrl();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(freshUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = freshUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const freshUrl = getCleanShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: freshUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n🔗 رابط التطبيق المباشر (تحديث فوري):\n${currentUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(shareText)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Backdrop */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            key="share-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1E2319] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#59662C]/10 dark:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center shadow-xs">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>مشاركة التطبيق والرابط</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                  مزامنة سحابية ⚡
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                شارك التطبيق مع زملائك أو افتحه من هاتفك مع حفظ ومزامنة كاملة للبيانات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Link Box with Copy Action */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
              <span>رابط التطبيق الرسمي والمباشر</span>
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-stone-100 dark:bg-[#151912] border border-stone-200 dark:border-stone-800">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs text-stone-700 dark:text-stone-300 font-mono outline-hidden select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl font-black text-xs shrink-0 cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#59662C] dark:bg-[#A4BF46] text-white dark:text-stone-900 hover:opacity-90'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>تم نسخ الرابط بنجاح! يمكنك لصقه ومشاركته في أي محادثة.</span>
              </p>
            )}
          </div>

          {/* Quick Direct Sharing Channels */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-700 dark:text-stone-300">
              مشاركة سريعة عبر القنوات:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Native System Share */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/60 font-black text-xs text-stone-800 dark:text-stone-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <span>مشاركة النظام 📲</span>
                </button>
              )}

              {/* WhatsApp Share */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 font-black text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="text-base">💬</span>
                <span>واتساب WhatsApp</span>
              </a>

              {/* Telegram Share */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/60 font-black text-xs text-sky-800 dark:text-sky-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>تليجرام Telegram</span>
              </a>
            </div>
          </div>

          {/* Sync Guarantee Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ميزة المزامنة السحابية المزدوجة (Dual Sync) مفعلة 🟢</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
              عند فتح التطبيق عبر الرابط في أي هاتف أو كمبيوتر، يتم تحميل الحالات والمواعيد والجدول الدراسي والمحتوى التعليمي مباشرة من السحابة المشتركة، مع العمل تلقائياً بدون إنترنت وحفظ التغييرات فور عودة الاتصال.
            </p>
          </div>

          {/* Install Application (PWA) Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#161A13] border border-stone-200 dark:border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-stone-800 dark:text-stone-200">
                <Smartphone className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                <span>تثبيت التطبيق على الهاتف (PWA)</span>
              </div>
              {isInstalled && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black">
                  مثبت بالفعل ✓
                </span>
              )}
            </div>

            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              يمكنك تثبيت تطبيق "بروتوكول" كأيقونة مستقلة على شاشتك الرئيسية للوصول السريع بدون متصفح وبكامل ميزات التنبيهات.
            </p>

            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={install}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#455021] text-white font-black text-xs hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق على جهازك الآن 📲</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
                <span className="font-black block">🍎 لمستخدمي iPhone & iPad (Safari):</span>
                <span>اضغط على زر المشاركة (Share) في أسفل شاشة سفاري ثم اختر <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#151912] border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
