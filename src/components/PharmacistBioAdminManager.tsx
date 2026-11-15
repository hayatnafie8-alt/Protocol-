import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Award,
  FileText,
  Mail,
  RotateCcw,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import {
  PharmacistBioConfig,
  DEFAULT_PHARMACIST_BIO,
  subscribeToPharmacistBioCloud,
  savePharmacistBioToCloud,
  togglePharmacistBioVisibilityInCloud,
} from '../services/pharmacistBioService';

interface PharmacistBioAdminManagerProps {
  isAuthorAdmin: boolean;
  onClose?: () => void;
}

export const PharmacistBioAdminManager: React.FC<PharmacistBioAdminManagerProps> = ({
  isAuthorAdmin,
  onClose,
}) => {
  const [config, setConfig] = useState<PharmacistBioConfig>(DEFAULT_PHARMACIST_BIO);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [bioAr, setBioAr] = useState<string>('');
  const [credentialsInput, setCredentialsInput] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [badgeText, setBadgeText] = useState<string>('');
  const [inquiryEmail, setInquiryEmail] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToPharmacistBioCloud((cloudConfig) => {
      setConfig(cloudConfig);
      setNameAr(cloudConfig.nameAr);
      setTitleAr(cloudConfig.titleAr);
      setBioAr(cloudConfig.bioAr);
      setCredentialsInput(cloudConfig.credentials ? cloudConfig.credentials.join('\n') : '');
      setLicenseNumber(cloudConfig.licenseNumber || '');
      setBadgeText(cloudConfig.verificationBadgeText || 'معتمد ومراجع سريرياً من الصيدلاني الإكلينيكي ✅');
      setInquiryEmail(cloudConfig.contactOrInquiryEmail || '');
      setIsEnabled(cloudConfig.isEnabled);
    });

    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const credList = credentialsInput
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      await savePharmacistBioToCloud({
        nameAr: nameAr.trim(),
        titleAr: titleAr.trim(),
        bioAr: bioAr.trim(),
        credentials: credList,
        licenseNumber: licenseNumber.trim(),
        verificationBadgeText: badgeText.trim(),
        contactOrInquiryEmail: inquiryEmail.trim(),
        isEnabled,
      });

      showToast('تم حفظ وتحديث بيانات واعتماد الصيدلاني الإكلينيكي بنجاح في السحابة ✅');
    } catch {
      showToast('فشل حفظ التعديلات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    await togglePharmacistBioVisibilityInCloud(nextState);
    showToast(
      nextState
        ? 'تم تفعيل وإظهار المراجعة الصيدلانية والسيرة الذاتية للمشتركين 👁️✅'
        : 'تم إخفاء المراجعة الصيدلانية بالكامل عن المشتركين 👁️🚫'
    );
  };

  const handleResetToDefault = () => {
    if (window.confirm('هل تود استعادة البيانات الافتراضية لقسم المراجعة الصيدلانية؟')) {
      setNameAr(DEFAULT_PHARMACIST_BIO.nameAr);
      setTitleAr(DEFAULT_PHARMACIST_BIO.titleAr);
      setBioAr(DEFAULT_PHARMACIST_BIO.bioAr);
      setCredentialsInput(DEFAULT_PHARMACIST_BIO.credentials.join('\n'));
      setLicenseNumber(DEFAULT_PHARMACIST_BIO.licenseNumber || '');
      setBadgeText(DEFAULT_PHARMACIST_BIO.verificationBadgeText || '');
      setInquiryEmail(DEFAULT_PHARMACIST_BIO.contactOrInquiryEmail || '');
      setIsEnabled(true);
      showToast('تمت استعادة البيانات الافتراضية (انقر حفظ للتثبيت).');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn" dir="rtl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] px-5 py-3 rounded-2xl bg-[#596628] text-white text-xs font-black shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] dark:from-[#181D13] dark:via-[#1E2519] dark:to-[#141810] border-2 border-[#59662C]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                صلاحيات المشرف فقط | Admin Only
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isEnabled
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {isEnabled ? 'المراجعة الصيدلانية مفعّلة للمشتركين 👁️' : 'المراجعة الصيدلانية مخفية 🚫'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white flex items-center gap-2.5">
              <Stethoscope className="w-6 h-6 text-[#59662C] dark:text-[#A4BF46]" />
              <span>المراجعة الصيدلانية والسيرة الذاتية للصيدلاني الإكلينيكي</span>
            </h2>

            <p className="text-xs text-[#524C3F] dark:text-[#C5BFB0] leading-relaxed max-w-3xl">
              يمكنك هنا كمسؤول ومشرف عام إدارة كافة تفاصيل الاعتماد الصيدلاني، كتابة اسم الصيدلاني الإكلينيكي ولقبه، سيرته الذاتية، شهاداته المهنية، ورقم ترخيصه، بالإضافة إلى التحكم بإظهار أو إخفاء قسم الاعتماد الصيدلاني في دليل الأدوية بضغطة زر واحدة.
            </p>
          </div>

          {/* Visibility Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVisibility}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-2 ${
                isEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{isEnabled ? 'إخفاء عن المشتركين' : 'إظهار للمشتركين'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#384524] shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#2F2B24] dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <UserCheck className="w-4 h-4 text-[#59662C]" />
              <span>بيانات الصيدلاني الإكلينيكي المعتمد</span>
            </h3>

            {/* Row 1: Name and Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#2F2B24] dark:text-white">اسم الصيدلاني الإكلينيكي (Arabic Name):*</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: د. صيدلاني إكلينيكي معتمد"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#2F2B24] dark:text-white">الدرجة المهنية والتخصص (Title):*</label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: PharmD, BCPS - استشاري الصيدلة السريرية"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
                />
              </div>
            </div>

            {/* Full Biography */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#2F2B24] dark:text-white">السيرة الذاتية المهنية والخبرة السريرية (Bio):*</label>
              <textarea
                rows={4}
                required
                value={bioAr}
                onChange={(e) => setBioAr(e.target.value)}
                placeholder="اكتب نبذة عن مؤهلات وخبرات الصيدلاني الإكلينيكي المعتمد ومجال المراجعة الصيدلانية لطب الأسنان..."
                className="w-full p-3.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C] leading-relaxed"
              />
            </div>

            {/* Credentials / Certifications (One per line) */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#2F2B24] dark:text-white">الشهادات والاعتمادات السريرية (كل شهادة في سطر منفصل):</label>
              <textarea
                rows={3}
                value={credentialsInput}
                onChange={(e) => setCredentialsInput(e.target.value)}
                placeholder="دكتور صيدلة (PharmD)&#10;البورد الأمريكي للصيدلة الإكلينيكية (BCPS)&#10;دبلوم العلاجيات وتداخلات الأدوية السنية"
                className="w-full p-3.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#59662C]"
              />
            </div>

            {/* Row 2: License and Badge Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#2F2B24] dark:text-white">رقم الترخيص / التسجيل المهني:</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="مثال: IQ-PH-49201"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-mono font-bold text-[#2F2B24] dark:text-white"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#2F2B24] dark:text-white">نص شارة الاعتماد السريري (Verification Badge):</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="مثال: معتمد ومراجع سريرياً من الصيدلاني الإكلينيكي ✅"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#2F2B24] dark:text-white">البريد الإلكتروني للاستفسارات الدوائية (اختياري):</label>
              <input
                type="email"
                dir="ltr"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                placeholder="e.g. clinical.pharmacist@protocol.dent"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-2xl border border-gray-300 dark:border-gray-700 font-bold text-[#2F2B24] dark:text-white text-right"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الافتراضي</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جارٍ الحفظ السحابي...' : 'حفظ السيرة الذاتية والاعتماد 💾'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview Card (1 Col) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-[#1A2014] dark:via-[#1E2519] dark:to-[#171D12] border-2 border-[#59662C]/40 shadow-md space-y-4 text-right">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                معاينة حية | Live Preview
              </span>
              <BadgeCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>

            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#59662C] text-white flex items-center justify-center font-black text-xl shadow-md">
                🩺
              </div>

              <div>
                <h4 className="text-base font-black text-[#2F2B24] dark:text-white">
                  {nameAr || 'اسم الصيدلاني الإكلينيكي'}
                </h4>
                <p className="text-xs font-bold text-[#59662C] dark:text-[#A4BF46]">
                  {titleAr || 'اللقب المهني والتخصص'}
                </p>
                {licenseNumber && (
                  <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                    ترخيص مهني: {licenseNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141810] border border-gray-200 dark:border-gray-800 text-xs text-[#524C3F] dark:text-[#C5BFB0] leading-relaxed">
              {bioAr || 'نبذة عن السيرة الذاتية تظهر هنا للمشتركين...'}
            </div>

            {/* Credentials Badges Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 block">الشهادات والاعتمادات:</span>
              <div className="flex flex-wrap gap-1.5">
                {(credentialsInput ? credentialsInput.split('\n') : []).map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Badge Preview */}
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{badgeText || 'معتمد ومراجع سريرياً ✅'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
