import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CreditCard,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Building2,
  Ticket,
  Users2,
  Gift,
  Info,
  Send,
  Zap,
} from 'lucide-react';
import {
  saveSubscriptionRequestToCloud,
  subscribeToPaymentConfigCloud,
  DEFAULT_MASTERCARD_NUMBER,
  DEFAULT_MASTERCARD_HOLDER,
} from '../services/realTimeSyncService';
import { uploadReceiptPhotoToCloud } from '../firebase';
import { sendSubscriptionToTelegram } from '../services/telegramService';
import {
  FriendDiscountCode,
  subscribeToFriendsCodesCloud,
  validateFriendDiscountCode,
  redeemFriendDiscountCodeInCloud,
} from '../data/friendsCodes';
import {
  GlobalAppState,
  getGlobalAppState,
  subscribeToGlobalAppStateCloud,
} from '../services/globalAppStateManager';

interface RequestCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSectionTitle?: string;
  defaultEmail?: string;
}

const ACADEMIC_STAGES = [
  'المرحلة الأولى',
  'المرحلة الثانية',
  'المرحلة الثالثة',
  'المرحلة الرابعة',
  'المرحلة الخامسة',
  'طبيب أسنان متخرج / مقيم دوري',
];

// Valid General Promo Codes Catalog (Instant Client-Side Verification)
const FREE_PROMO_CODES = ['HAYATFREE', 'VIP2025', 'DENTALFREE', 'GIFT100', 'SPECIAL2025'];
const DISCOUNT_50_CODES = ['DRHAYAT50', 'STUDENT50'];
const DISCOUNT_30_CODES = ['DENTAL30'];

export const RequestCodeModal: React.FC<RequestCodeModalProps> = ({
  isOpen,
  onClose,
  targetSectionTitle,
  defaultEmail = '',
}) => {
  // 1. Dynamic Mastercard State (Synched with Cloud)
  const [globalState, setGlobalState] = useState<GlobalAppState>(() => getGlobalAppState());
  const exchangeRate = globalState.features.usdExchangeRate || 1500;
  const tier1Price = globalState.features.pricingTier1 || 15;
  const tier1PriceIqd = globalState.features.pricingTier1Iqd || Math.round(tier1Price * exchangeRate);
  const savedSubPrice = (() => {
    try {
      const s = localStorage.getItem('protocol_sub_price');
      return s ? Number(s) : null;
    } catch {
      return null;
    }
  })();
  const tier2Price = savedSubPrice || globalState.features.pricingTier2 || 10;
  const tier2PriceIqd = globalState.features.pricingTier2Iqd || Math.round(tier2Price * exchangeRate);
  const friendsPrice = globalState.features.friendsDiscountPrice || 7;
  const friendsPriceIqd = globalState.features.friendsDiscountPriceIqd || Math.round(friendsPrice * exchangeRate);
  const showPayWhatYouWant = globalState.features.showPayWhatYouWant !== false;

  const [cardNumber, setCardNumber] = useState<string>(
    () => globalState.paymentConfig?.mastercardNumber || localStorage.getItem('dental_admin_mastercard_number') || DEFAULT_MASTERCARD_NUMBER
  );
  const [cardHolder, setCardHolder] = useState<string>(
    () => globalState.paymentConfig?.mastercardHolder || localStorage.getItem('dental_admin_mastercard_holder') || DEFAULT_MASTERCARD_HOLDER
  );

  // 2. Pricing Selector State (Option 1: 15$ | Option 2: 10$) - Both include exact same features
  const [selectedPayOption, setSelectedPayOption] = useState<number>(() => tier2Price);

  // 3. Friends & Peer Discount System (5,000 IQD Code)
  const [friendsCodesList, setFriendsCodesList] = useState<FriendDiscountCode[]>([]);
  const [friendsCodeInput, setFriendsCodeInput] = useState('');
  const [appliedFriendsCode, setAppliedFriendsCode] = useState<string | null>(null);
  const [friendsCodeRecord, setFriendsCodeRecord] = useState<FriendDiscountCode | null>(null);
  const [friendsCodeSuccessMsg, setFriendsCodeSuccessMsg] = useState<string | null>(null);
  const [friendsCodeError, setFriendsCodeError] = useState<string | null>(null);

  // 4. Form Input States
  const [fullName, setFullName] = useState(
    () => localStorage.getItem('dental_subscriber_name') || ''
  );
  const [email, setEmail] = useState(
    () => defaultEmail || localStorage.getItem('dental_subscriber_email') || ''
  );
  const [academicStage, setAcademicStage] = useState(
    () => localStorage.getItem('dental_subscriber_academic_stage') || ACADEMIC_STAGES[3]
  );
  const [university, setUniversity] = useState(
    () => localStorage.getItem('dental_subscriber_university') || ''
  );
  const [notes, setNotes] = useState('');

  // General Promo Code States (for 100% free / 50% discount)
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscountType, setPromoDiscountType] = useState<'free' | '50%' | '30%' | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Receipt Image States
  const [paymentMethod, setPaymentMethod] = useState<'mastercard' | 'manual_transfer'>('mastercard');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // UI Status States
  const [copiedCard, setCopiedCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time Cloud Sync for Mastercard, Global State & Friends Codes
  useEffect(() => {
    if (!isOpen) return;

    // Listen to global app state updates in Firestore
    const unsubGlobal = subscribeToGlobalAppStateCloud((gState) => {
      setGlobalState(gState);
      if (gState.paymentConfig?.mastercardNumber) {
        setCardNumber(gState.paymentConfig.mastercardNumber);
      }
      if (gState.paymentConfig?.mastercardHolder) {
        setCardHolder(gState.paymentConfig.mastercardHolder);
      }
      // If current selected option doesn't match available tiers, adjust
      const t1 = gState.features.pricingTier1 || 15;
      const t2 = gState.features.pricingTier2 || 10;
      setSelectedPayOption((curr) => (curr === t1 ? t1 : t2));
    });

    // Listen to admin card configuration updates in Firestore
    const unsubPayment = subscribeToPaymentConfigCloud((cfg) => {
      if (cfg.mastercardNumber) setCardNumber(cfg.mastercardNumber);
      const holder = cfg.mastercardHolder || cfg.cardHolder;
      if (holder) setCardHolder(holder);
    });

    // Listen to friends discount codes in Firestore
    const unsubFriendsCodes = subscribeToFriendsCodesCloud((codes) => {
      setFriendsCodesList(codes);
    });

    return () => {
      unsubGlobal();
      unsubPayment();
      unsubFriendsCodes();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Pricing Calculation Hierarchy:
  // 1. If 100% Free Promo Code applied -> 0$
  // 2. If Friends Code applied -> friendsPrice (7$ default)
  // 3. If Percentage Promo Code applied -> applied on selectedPayOption
  // 4. Otherwise -> selectedPayOption (tier2Price 10$ or tier1Price 15$)
  const is100PercentFree = promoDiscountType === 'free';
  const isFriendsDiscountActive = !!appliedFriendsCode;

  let currentCalculatedAmount: number = selectedPayOption;
  let currentCalculatedIqd: number = selectedPayOption === tier1Price ? tier1PriceIqd : tier2PriceIqd;
  let finalAmountLabel = `${selectedPayOption}$ • ${currentCalculatedIqd.toLocaleString()} د.ع`;

  if (is100PercentFree) {
    currentCalculatedAmount = 0;
    currentCalculatedIqd = 0;
    finalAmountLabel = 'كود مجاني (0$)';
  } else if (isFriendsDiscountActive) {
    currentCalculatedAmount = friendsPrice;
    currentCalculatedIqd = friendsPriceIqd;
    finalAmountLabel = `${friendsPrice}$ • ${friendsPriceIqd.toLocaleString()} د.ع (اشتراك الأصدقاء)`;
  } else if (promoDiscountType === '50%') {
    currentCalculatedAmount = Math.round(selectedPayOption * 0.5);
    currentCalculatedIqd = Math.round(currentCalculatedAmount * exchangeRate);
    finalAmountLabel = `${currentCalculatedAmount}$ • ${currentCalculatedIqd.toLocaleString()} د.ع (خصم 50%)`;
  } else if (promoDiscountType === '30%') {
    currentCalculatedAmount = Math.round(selectedPayOption * 0.7);
    currentCalculatedIqd = Math.round(currentCalculatedAmount * exchangeRate);
    finalAmountLabel = `${currentCalculatedAmount}$ • ${currentCalculatedIqd.toLocaleString()} د.ع (خصم 30%)`;
  }

  // Handle Copy Card
  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 3000);
    } catch {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 3000);
    }
  };

  // Handle Friends Code Validation
  const handleApplyFriendsCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFriendsCodeError(null);
    setFriendsCodeSuccessMsg(null);

    const result = validateFriendDiscountCode(friendsCodeInput, email, friendsCodesList);
    if (result.isValid && result.codeRecord) {
      setAppliedFriendsCode(result.codeRecord.code);
      setFriendsCodeRecord(result.codeRecord);
      setFriendsCodeSuccessMsg(result.message);
      // Reset general promo code if friends code is applied
      setAppliedPromoCode(null);
      setPromoDiscountType(null);
      setPromoSuccessMsg(null);
    } else {
      setFriendsCodeError(result.message);
    }
  };

  const handleRemoveFriendsCode = () => {
    setAppliedFriendsCode(null);
    setFriendsCodeRecord(null);
    setFriendsCodeInput('');
    setFriendsCodeSuccessMsg(null);
    setFriendsCodeError(null);
  };

  // Handle General Promo Code Validation
  const handleApplyPromoCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError(null);
    setPromoSuccessMsg(null);

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('يرجى كتابة كود الخصم أولاً.');
      return;
    }

    // Check if it's actually a friends code
    const isFriendCheck = validateFriendDiscountCode(code, email, friendsCodesList);
    if (isFriendCheck.isValid && isFriendCheck.codeRecord) {
      setAppliedFriendsCode(isFriendCheck.codeRecord.code);
      setFriendsCodeRecord(isFriendCheck.codeRecord);
      setFriendsCodeSuccessMsg(isFriendCheck.message);
      setPromoCodeInput('');
      return;
    }

    if (FREE_PROMO_CODES.includes(code)) {
      setAppliedPromoCode(code);
      setPromoDiscountType('free');
      setPromoSuccessMsg('🎉 كود مجاني 100%! تم إعفاء الاشتراك بالكامل.');
      handleRemoveFriendsCode();
    } else if (DISCOUNT_50_CODES.includes(code)) {
      setAppliedPromoCode(code);
      setPromoDiscountType('50%');
      setPromoSuccessMsg('🎉 كود خصم صالح! تم تخفيض الاشتراك بنسبة 50%.');
      handleRemoveFriendsCode();
    } else if (DISCOUNT_30_CODES.includes(code)) {
      setAppliedPromoCode(code);
      setPromoDiscountType('30%');
      setPromoSuccessMsg('🎉 كود خصم صالح! تم تخفيض الاشتراك بنسبة 30%.');
      handleRemoveFriendsCode();
    } else {
      setPromoError('⚠️ كود الخصم غير صحيح أو غير مفعل حالياً.');
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoDiscountType(null);
    setPromoCodeInput('');
    setPromoSuccessMsg(null);
    setPromoError(null);
  };

  // Handle Receipt Upload
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('حجم صورة الإيصال كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setTelegramStatus(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUniversity = university.trim();

    if (!cleanFullName) {
      setErrorMessage('يرجى إدخال الاسم الثلاثي للطالب / الطبيب.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني لإرسال كود التفعيل.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح (مثال: student@gmail.com).');
      return;
    }

    if (!cleanUniversity) {
      setErrorMessage('يرجى كتابة اسم الجامعة أو الكلية.');
      return;
    }

    // Receipt is required only if payment is not manual transfer and amount is not 100% free
    if (paymentMethod !== 'manual_transfer' && !is100PercentFree && !receiptPreview && !receiptFile) {
      setErrorMessage('يرجى رفع صورة إيصال التحويل المصرفي للتحقق وتفعيل الاشتراك.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload receipt to Cloud Storage if available
      let uploadedReceiptUrl = '';
      if (receiptFile) {
        uploadedReceiptUrl = await uploadReceiptPhotoToCloud(receiptFile, cleanEmail);
      } else if (receiptPreview) {
        uploadedReceiptUrl = await uploadReceiptPhotoToCloud(receiptPreview, cleanEmail);
      }

      // 2. If friends code used, redeem usage
      if (appliedFriendsCode) {
        await redeemFriendDiscountCodeInCloud(appliedFriendsCode, cleanEmail, cleanFullName);
      }

      const activeCodeNote = appliedFriendsCode
        ? `[كود أصدقاء: ${appliedFriendsCode}]`
        : appliedPromoCode || undefined;

      const discountLabel = appliedFriendsCode
        ? `خصم الأصدقاء (${friendsPrice}$)`
        : promoDiscountType
        ? promoDiscountType
        : undefined;

      // 3. Save subscription request to Cloud Firestore
      await saveSubscriptionRequestToCloud({
        email: cleanEmail,
        fullName: cleanFullName,
        studentName: cleanFullName,
        academicStage,
        university: cleanUniversity,
        promoCode: activeCodeNote,
        discountAmount: discountLabel,
        amount: finalAmountLabel,
        paymentMethod: paymentMethod,
        receiptUrl: uploadedReceiptUrl,
        targetSectionTitle: targetSectionTitle || undefined,
        notes: notes.trim() || undefined,
      });

      // 4. Instant Telegram Bot Integration
      try {
        const tgRes = await sendSubscriptionToTelegram({
          fullName: cleanFullName,
          email: cleanEmail,
          academicStage,
          university: cleanUniversity,
          amount: finalAmountLabel,
          promoCode: activeCodeNote,
          receiptFile,
          receiptDataUrl: receiptPreview,
          receiptUrl: uploadedReceiptUrl,
          notes: notes.trim() || undefined,
        });
        if (tgRes.success) {
          setTelegramStatus('تم إرسال إشعار فوري إلى تليجرام الإدارة 📲');
        }
      } catch (tgErr) {
        console.warn('Telegram send notice error:', tgErr);
      }

      // Cache subscriber details locally
      try {
        localStorage.setItem('dental_subscriber_email', cleanEmail);
        localStorage.setItem('dental_subscriber_name', cleanFullName);
        localStorage.setItem('dental_subscriber_university', cleanUniversity);
        localStorage.setItem('dental_subscriber_academic_stage', academicStage);
      } catch {}

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 4500);
    } catch (err) {
      console.error('[Checkout Error]', err);
      setErrorMessage('حدث خطأ أثناء إرسال الطلب، يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] dark:bg-[#181D13] rounded-3xl shadow-2xl border-2 border-[#59662C]/50 dark:border-[#A4BF46]/50 overflow-hidden my-auto animate-scaleUp">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F2] via-white to-[#F3EFE3] dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-b border-[#E5DEC9] dark:border-[#343E26] text-right relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-500 hover:text-gray-800 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-2xl bg-[#59662C] text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#CBE276] border border-[#59662C]/30">
              الدفع الإلكتروني المباشر | Mastercard
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
            تفعيل الاشتراك السنوي عبر ماستركارد 💳
          </h3>

          {/* Value Reminder */}
          <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="font-bold leading-relaxed">
              اشتراك سنوي شامل + استشارات سريرية مفتوحة طوال السنة مع د. حياه نافع فجر
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-fadeIn text-right">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-bold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {submitSuccess ? (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-center space-y-3 text-emerald-900 dark:text-emerald-200 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                تم إرسال طلبك بنجاح! 🎉
              </h4>
              <p className="text-xs sm:text-sm font-bold leading-relaxed max-w-md mx-auto text-emerald-800 dark:text-emerald-300">
                تم إرسال طلبك بنجاح، سيتم تفعيل حسابك فور التحقق.
              </p>
              <p className="text-[11px] leading-relaxed max-w-md mx-auto text-emerald-700/90 dark:text-emerald-300/80">
                تم تسجيل بياناتك في لوحة المشرفة د. حياة نافع فجر وإشعار الإدارة لمراجعة التحويل وتفعيل الحساب بكود شخصي.
              </p>
              {telegramStatus && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold">
                  <Send className="w-3.5 h-3.5" />
                  <span>{telegramStatus}</span>
                </div>
              )}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  سيتم إغلاق النافذة تلقائياً خلال لحظات...
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-right font-sans">
              {/* 2. "Pay What You Want" Limited-Time Pricing Selector */}
              {showPayWhatYouWant && (
                <div className="space-y-2 p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#59662C]/10 to-amber-500/5 dark:from-[#20271A] dark:to-[#171C12] border-2 border-[#59662C]/40 dark:border-[#A4BF46]/40 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>اختار السعر ليناسبك بنفس المميزات</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                      نفس المميزات
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Option 1: 15$ */}
                    <div
                      onClick={() => setSelectedPayOption(tier1Price)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-right relative overflow-hidden ${
                        selectedPayOption === tier1Price && !isFriendsDiscountActive && !is100PercentFree
                          ? 'border-amber-500 bg-white dark:bg-[#1E2516] shadow-md ring-2 ring-amber-500/30'
                          : 'border-[#E5DEC9] dark:border-[#384524] bg-white/70 dark:bg-[#191F13]/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>الخيار الأول (Option 1) 🌟</span>
                        </span>
                        <div className="flex flex-col items-end text-left" dir="ltr">
                          <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                            {tier1Price}$
                          </div>
                          <div className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80 font-mono">
                            {tier1PriceIqd.toLocaleString()} د.ع
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        سنة كاملة + كافة المحاضرات والمهارات السريرية ونفس المميزات والصلاحيات الشاملة.
                      </p>
                      {selectedPayOption === tier1Price && !isFriendsDiscountActive && !is100PercentFree && (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          الخيار المحدد للتحويل
                        </span>
                      )}
                    </div>

                    {/* Option 2: 10$ */}
                    <div
                      onClick={() => setSelectedPayOption(tier2Price)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-right relative overflow-hidden ${
                        selectedPayOption === tier2Price && !isFriendsDiscountActive && !is100PercentFree
                          ? 'border-[#59662C] bg-white dark:bg-[#1E2516] shadow-md ring-2 ring-[#59662C]/30'
                          : 'border-[#E5DEC9] dark:border-[#384524] bg-white/70 dark:bg-[#191F13]/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#59662C]/15 text-[#59662C] dark:text-[#CBE276]">
                          الخيار الثاني (Option 2) 🎓
                        </span>
                        <div className="flex flex-col items-end text-left" dir="ltr">
                          <div className="text-base sm:text-lg font-black text-[#59662C] dark:text-[#A4BF46]">
                            {tier2Price}$
                          </div>
                          <div className="text-[11px] font-bold text-[#59662C]/80 dark:text-[#CBE276]/80 font-mono">
                            {tier2PriceIqd.toLocaleString()} د.ع
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        سنة كاملة + كافة المحاضرات والمهارات السريرية ونفس المميزات والصلاحيات الشاملة.
                      </p>
                      {selectedPayOption === tier2Price && !isFriendsDiscountActive && !is100PercentFree && (
                        <span className="text-[10px] font-black text-[#59662C] dark:text-[#CBE276] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          الخيار المحدد للتحويل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Friends & Peer Discount System (7$ Code) */}
              <div className="space-y-2.5 p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-400/50 dark:border-blue-600/50 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                    <Users2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>اشتراك الأصدقاء 👥 (كود خصم {friendsPrice}$ لكل صديق):</span>
                  </h4>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white font-mono">
                      {friendsPrice}$
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-mono">
                      {friendsPriceIqd.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  إذا حصلت مع زميلك على كود اشتراك الأصدقاء المشترك من المشرفة، أدخله هنا لتخفيض الاشتراك إلى {friendsPrice}$ ({friendsPriceIqd.toLocaleString()} د.ع) فوراً:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    disabled={!!appliedFriendsCode}
                    placeholder="أدخل كود الأصدقاء (مثال: FRIENDS7, PAIR7)"
                    value={friendsCodeInput}
                    onChange={(e) => setFriendsCodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#161B11] rounded-xl border border-blue-300 dark:border-blue-800 text-xs font-mono font-bold uppercase text-[#2F2B24] dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />

                  {appliedFriendsCode ? (
                    <button
                      type="button"
                      onClick={handleRemoveFriendsCode}
                      className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 transition cursor-pointer"
                    >
                      إلغاء الخصم
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyFriendsCode()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>تطبيق كود الأصدقاء ✨</span>
                    </button>
                  )}
                </div>

                {friendsCodeError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {friendsCodeError}
                  </p>
                )}

                {friendsCodeSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم تفعيل خصم الأصدقاء! المبلغ المطلوب: {friendsPrice}$ ({friendsPriceIqd.toLocaleString()} د.ع) فقط ⚡</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector (Mastercard vs Manual Transfer) */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524]">
                <label className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center justify-between">
                  <span>طريقة التحويل المستخدمة (Payment Method):</span>
                  <span className="text-[10px] text-gray-500 font-normal">اختر وسيلة الدفع التي تناسبك</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'mastercard', label: 'ماستركارد (Mastercard) 💳', subtitle: 'تحويل مع إرفاق صورة الإيصال' },
                    { id: 'manual_transfer', label: 'تحويل يدوي / مباشر 🏦', subtitle: 'تحويل مباشر وسريع دون الحاجة لإرفاق إيصال' },
                  ].map((m, mIdx) => (
                    <button
                      key={`${m.id}_${mIdx}`}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-right cursor-pointer flex flex-col justify-center ${
                        paymentMethod === m.id
                          ? 'bg-[#59662C] text-white border-[#59662C] shadow-md ring-2 ring-[#59662C]/20'
                          : 'bg-[#FAF7F2] dark:bg-[#161B11] text-[#554E41] dark:text-[#C5BFB0] border-[#E5DEC9] dark:border-[#384524] hover:bg-white'
                      }`}
                    >
                      <span className="font-black text-xs">{m.label}</span>
                      <span className={`text-[10px] mt-0.5 ${paymentMethod === m.id ? 'text-amber-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {m.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Payment Details Display Based on Selected Method */}
              {paymentMethod === 'manual_transfer' ? (
                /* Elegant Direct Manual Transfer Instructions Box */
                <div className="space-y-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-teal-500/10 dark:from-teal-950/30 dark:to-emerald-950/20 border-2 border-teal-500/40 dark:border-teal-600/40 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs sm:text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>بيانات التحويل المباشر لبطاقة الماستركارد الخاصة بالمشرف:</span>
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-600 text-white font-mono shadow-xs">
                      تحويل مباشر
                    </span>
                  </div>

                  {/* Card Number Field with Prominent Copy Button */}
                  <div className="space-y-1.5 bg-white dark:bg-[#161B11] border border-teal-200 dark:border-teal-800 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block">
                      رقم بطاقة الماستركارد للتحويل (Mastercard Number):
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span
                        dir="ltr"
                        className="font-mono text-base sm:text-lg tracking-widest font-black text-teal-800 dark:text-teal-300 select-all"
                      >
                        {cardNumber}
                      </span>

                      <button
                        type="button"
                        onClick={handleCopyCard}
                        className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                          copiedCard
                            ? 'bg-emerald-600 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {copiedCard ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تم النسخ! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>نسخ رقم البطاقة 📋</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Holder & Amount Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#161B11] border border-teal-200 dark:border-teal-800">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">اسم حامل البطاقة:</span>
                      <span className="font-black text-[#2F2B24] dark:text-white text-xs">{cardHolder}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#161B11] border border-teal-200 dark:border-teal-800 text-left" dir="ltr">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">المبلغ المطلوب تحويله:</span>
                      <span className="font-mono font-black text-teal-700 dark:text-teal-300 text-sm">{finalAmountLabel}</span>
                    </div>
                  </div>

                  {/* Direct Notice Alert (Mandatory Instruction) */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 dark:bg-emerald-900/30 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5 text-xs font-bold leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      بعد إتمام التحويل، اضغط على زر تأكيد وسيقوم المشرف بتفعيل حسابك مباشرة.
                    </span>
                  </div>
                </div>
              ) : (
                /* 1. Dynamic Mastercard Luxury Visual Container */
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[#2F2B24] dark:text-white">
                    <h4 className="font-black text-xs flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>بيانات بطاقة الماستركارد للتحويل المالي المباشر:</span>
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      محدثة من الإدارة
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2016] via-[#2A3320] to-[#12160E] text-white p-5 sm:p-6 shadow-xl border border-[#59662C]/40 space-y-4">
                    <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#A4BF46]/10 blur-3xl pointer-events-none" />

                    {/* Card Top Row: Chip & Mastercard Brand Spheres */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600 shadow-inner flex items-center justify-center p-1">
                          <div className="w-full h-full border border-amber-700/60 rounded-sm grid grid-cols-2 gap-0.5 opacity-70" />
                        </div>
                        <span className="text-white/60 font-mono text-xs">))))</span>
                      </div>

                      <div className="flex items-center -space-x-3.5 rtl:space-x-reverse">
                        <div className="w-8 h-8 rounded-full bg-[#EB001B] shadow-md" />
                        <div className="w-8 h-8 rounded-full bg-[#F79E1B] opacity-90 shadow-md" />
                      </div>
                    </div>

                    {/* Card Number Display Field with Prominent Copy Button */}
                    <div className="relative z-10 space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold block">
                        رقم بطاقة الماستركارد (Mastercard Number):
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 border border-white/20 rounded-2xl p-3 backdrop-blur-xs">
                        <span
                          dir="ltr"
                          className="font-mono text-base sm:text-lg tracking-widest font-black text-amber-300 select-all"
                        >
                          {cardNumber}
                        </span>

                        <button
                          type="button"
                          onClick={handleCopyCard}
                          className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                            copiedCard
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black'
                          }`}
                        >
                          {copiedCard ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>تم النسخ! ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>نسخ رقم البطاقة 📋</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Bottom Row: Holder Name & Expiry */}
                    <div className="relative z-10 flex items-center justify-between text-xs pt-1 border-t border-white/10">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/50 block">اسم حامل البطاقة</span>
                        <span className="font-bold text-white/95">{cardHolder}</span>
                      </div>
                      <div className="text-left" dir="ltr">
                        <span className="text-[9px] uppercase tracking-wider text-white/50 block">المبلغ المطلوب تحويله</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">{finalAmountLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524]">
                    <h4 className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>خطوات إتمام التحويل:</span>
                    </h4>
                    <ol className="space-y-1.5 text-xs text-[#5F5849] dark:text-[#C5BFB0] list-none pr-1">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          1
                        </span>
                        <span>افتح تطبيق بطاقتك المصرفية (Neo, Qi, FIB, or Bank App).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          2
                        </span>
                        <span>قم بتحويل مبلغ الاشتراك ({finalAmountLabel}) إلى رقم البطاقة أعلاه.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#59662C] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          3
                        </span>
                        <span>التقط صورة لإيصال التحويل وارفعها أسفله لتفعيل الاشتراك فوراً.</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Student Registration Fields */}
              <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524]">
                <h4 className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1.5 border-b border-[#E5DEC9] dark:border-[#384524] pb-2">
                  <User className="w-4 h-4 text-[#59662C] dark:text-[#A4BF46]" />
                  <span>بيانات الطالب الأكاديمية والسريرية:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>الاسم الثلاثي:*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: د. حيدر أحمد علي"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-semibold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>البريد الإلكتروني:*</span>
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      required
                      placeholder="student@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-semibold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                    />
                  </div>

                  {/* Academic Stage Dropdown */}
                  <div className="space-y-1">
                    <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>المرحلة الدراسية:*</span>
                    </label>
                    <select
                      value={academicStage}
                      onChange={(e) => setAcademicStage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-semibold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                    >
                      {ACADEMIC_STAGES.map((stg, sIdx) => (
                        <option key={`${stg}_${sIdx}`} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* University Name */}
                  <div className="space-y-1">
                    <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A4BF46]" />
                      <span>الجامعة / الكلية:*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: جامعة بغداد - كلية طب الأسنان"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-semibold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                    />
                  </div>
                </div>

                {/* Additional General Promo Code (Free / 50% discount) */}
                <div className="pt-2 border-t border-[#E5DEC9] dark:border-[#384524] space-y-2">
                  <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-amber-500" />
                      <span>كود خصم إضافي / كود إعفاء عام (General Promo Code):</span>
                    </span>
                    <span className="text-[10px] text-gray-500">اختياري</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      disabled={!!appliedPromoCode || isFriendsDiscountActive}
                      placeholder="أدخل كود الخصم (مثال: HAYATFREE, DRHAYAT50)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-mono font-bold uppercase text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] disabled:opacity-60"
                    />

                    {appliedPromoCode ? (
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 transition cursor-pointer"
                      >
                        إلغاء الكود
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isFriendsDiscountActive}
                        onClick={() => handleApplyPromoCode()}
                        className="px-4 py-2 rounded-xl bg-[#59662C] hover:bg-[#475323] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        تطبيق 🎟️
                      </button>
                    )}
                  </div>

                  {promoError && (
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      {promoError}
                    </p>
                  )}
                  {promoSuccessMsg && (
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{promoSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt File Upload (Hidden when paymentMethod === 'manual_transfer') */}
              {paymentMethod !== 'manual_transfer' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="font-black text-xs text-[#2F2B24] dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>رفع صورة إيصال التحويل (Screenshot):</span>
                    </span>
                    <span className={`text-[10px] font-bold ${is100PercentFree ? 'text-gray-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {is100PercentFree ? 'إعفاء من الإيصال (كود مجاني)' : 'مطلوب للتحقق'}
                    </span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />

                  {receiptPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/80 bg-black/5 dark:bg-black/40 p-2 text-center">
                      <img
                        src={receiptPreview}
                        alt="إيصال التحويل المالي"
                        className="max-h-56 mx-auto rounded-xl object-contain shadow-md"
                      />
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم إرفاق صورة الإيصال بنجاح
                        </span>
                        <button
                          type="button"
                          onClick={handleClearReceipt}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold transition cursor-pointer"
                        >
                          إلغاء واستبدال
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer space-y-2 ${
                        is100PercentFree
                          ? 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20'
                          : 'border-[#59662C]/50 dark:border-[#A4BF46]/50 bg-white/80 dark:bg-[#1E2417]/80 hover:bg-[#59662C]/5'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#59662C]/15 dark:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center mx-auto shadow-xs">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#2F2B24] dark:text-white">
                          {is100PercentFree ? 'يمكنك إرفاق صورة اختيارية أو المتابعة مباشرة' : 'اضغط هنا لرفع صورة إيصال التحويل 🧾'}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          التقط لقطة شاشة من تطبيق البنك (Neo / Qi / FIB) وأرفقها هنا
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2 border-t border-[#E5DEC9] dark:border-[#343E26]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#59662C] via-[#6B7B34] to-[#7D9333] hover:from-[#485320] hover:to-[#59662C] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جارٍ إرسال الطلب وإشعار المشرفة وتليجرام...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>تأكيد وإرسال الطلب ({finalAmountLabel}) 🚀</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-2">
                  🔒 يتم إرسال إشعار فوري للوحة المشرفة وقناة التليجرام بالبيانات وصورة الإيصال لاعتماد التفعيل فوراً.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
