import React, { useState } from 'react';
import {
  Send,
  Instagram,
  GraduationCap,
  ShieldCheck,
  Lock,
  FileText,
  Mail,
  HeartHandshake,
  Sparkles,
  Award,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Copy,
  BookOpen,
  UserCheck,
} from 'lucide-react';

export const ContactAndPrivacyView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'privacy' | 'terms'>('contact');

  // Interactive feedback form
  const [senderName, setSenderName] = useState('');
  const [senderRole, setSenderRole] = useState('طالب طب أسنان');
  const [senderMessage, setSenderMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderMessage.trim()) return;

    // Open telegram with pre-filled message
    const text = encodeURIComponent(
      `رسالة من تطبيق بروتوكول الكومبوزيت:\nالاسم: ${senderName || 'طالب'}\nالصفة: ${senderRole}\nالرسالة: ${senderMessage}`
    );
    window.open(`https://t.me/hay_a_2?text=${text}`, '_blank');
    setFormSent(true);
  };

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedLink(label);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#596628]/15 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#1B2216] dark:to-[#171A12] border-2 border-[#596628]/30 dark:border-[#384524] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#596628] text-white shadow-2xs flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>قنوات التواصل الرسمية والخصوصية</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24] dark:text-white">
            تواصل معنا وسياسة الخصوصية
          </h1>
          <p className="text-xs sm:text-sm text-[#635B4D] dark:text-[#C5BEAF] font-medium max-w-2xl">
            كل ما يتعلق بالتواصل الأكاديمي، الاستفسارات السريرية، الدعم الفني للمشتركين، وشروط الاستخدام وسياسة الأمان وإخلاء المسؤولية الطبية.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-white dark:bg-[#1E2417] p-1.5 rounded-2xl border border-[#E5DEC9] dark:border-[#384524] text-xs font-bold shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('contact')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'contact'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'text-[#635C4E] dark:text-[#C5BEAF] hover:bg-[#FAF7F2]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>قنوات التواصل</span>
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'privacy'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'text-[#635C4E] dark:text-[#C5BEAF] hover:bg-[#FAF7F2]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>سياسة الخصوصية</span>
          </button>
          <button
            onClick={() => setActiveSubTab('terms')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'terms'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'text-[#635C4E] dark:text-[#C5BEAF] hover:bg-[#FAF7F2]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الشروط وإخلاء المسؤولية</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CONTACT US */}
      {activeSubTab === 'contact' && (
        <div className="space-y-6">
          {/* Author Academic Identity Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#596628] to-[#7D9333] text-white flex items-center justify-center shadow-lg shrink-0">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/30">
                    معدّة ومطورة البروتوكول السريري
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                    جامعة المعارف — كلية طب الأسنان
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
                  د. حياه نافع فجر
                </h2>
                <p className="text-xs sm:text-sm text-[#6A6354] dark:text-[#C5BEAF] font-medium leading-relaxed">
                  طالبة مرحلة رابعة — كلية طب الأسنان، جامعة المعارف. إعداد وتنسيق هذا المرجع السريري المعتمد لترميم الكومبوزيت، الحالات الجراحية، التدريبات المنزلية، وسيكولوجية التعامل مع المراجعين.
                </p>
              </div>
            </div>

            {/* Quick Action Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Telegram Card */}
              <a
                href="https://t.me/hay_a_2"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-2xl bg-gradient-to-br from-[#0088cc]/10 to-[#0088cc]/5 hover:from-[#0088cc]/20 border-2 border-[#0088cc]/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#0088cc] block">قناة وحساب التليجرام</span>
                    <span className="text-sm font-black text-[#2F2B24] dark:text-white dir-ltr block">
                      @hay_a_2
                    </span>
                    <span className="text-[10px] text-gray-500">t.me/hay_a_2</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#0088cc] group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Instagram Card */}
              <a
                href="https://instagram.com/hay_a_2"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-2xl bg-gradient-to-br from-[#E4405F]/10 to-[#FD1D1D]/5 hover:from-[#E4405F]/20 border-2 border-[#E4405F]/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#E4405F] block">حساب الإنستغرام الأكاديمي</span>
                    <span className="text-sm font-black text-[#2F2B24] dark:text-white dir-ltr block">
                      @hay_a_2
                    </span>
                    <span className="text-[10px] text-gray-500">instagram.com/hay_a_2</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#E4405F] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Interactive Direct Message Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-[#596628] dark:text-[#A8C24E]" />
              <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إرسال استفسار أو طلب كود تفعيل للمشتركين
              </h3>
            </div>
            <p className="text-xs text-[#6B6456] dark:text-[#C5BEAF]">
              إذا كنت طالباً أو طبيب أسنان وترغب بالحصول على كود تفعيل للمطالعة السريرية، يمكنك مراسلة الدكتورة مباشرة وسيقوم النموذج بنقلك لمحادثة تليجرام فوراً.
            </p>

            <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#3E382D] dark:text-[#D5CDBC] block">
                    الاسم الكريم:*
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: د. أحمد علي"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#3E382D] dark:text-[#D5CDBC] block">
                    الصفة أو الجامعة:
                  </label>
                  <select
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  >
                    <option value="طالب طب أسنان (مرحلة رابعة)">طالب طب أسنان (مرحلة رابعة)</option>
                    <option value="طالب طب أسنان (مرحلة خامسة)">طالب طب أسنان (مرحلة خامسة)</option>
                    <option value="طبيب أسنان ممارس عام">طبيب أسنان ممارس عام</option>
                    <option value="أستاذ / مشرف أكاديمي">أستاذ / مشرف أكاديمي</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#3E382D] dark:text-[#D5CDBC] block">
                  نص الرسالة أو الاستفسار:*
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب استفسارك السريري أو طلب كود التفعيل..."
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#161B11] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#7B7465] dark:text-[#A7A08E] font-medium">
                  يتم فتح المحادثة الآمنة مع د. حياة مباشرة على تليجرام
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال عبر تليجرام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PRIVACY POLICY */}
      {activeSubTab === 'privacy' && (
        <div className="space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E5DEC9] dark:border-[#343E26]">
              <div className="w-12 h-12 rounded-2xl bg-[#596628] text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2F2B24] dark:text-white">
                  وثيقة سياسة الخصوصية وسرية البيانات
                </h2>
                <p className="text-xs text-[#7B7465] dark:text-[#A7A08E]">
                  آخر تحديث: سبتمبر 2026 — بروتوكول طب الأسنان السريري
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#4E473A] dark:text-[#D5CDBC] leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                <h3 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#596628]" />
                  <span>1. التخزين المحلي الآمن (Local Encrypted Storage)</span>
                </h3>
                <p className="text-xs text-[#5D5648] dark:text-[#C5BEAF]">
                  كافة إعدادات المشتركين، كودات الطلاب، وسجلات التدريب تُحفظ محلياً في متصفحك بواسطة تقنيات التخزين المشفرة. التطبيق لا يجمع أي معلومات شخصية حساسة ولا يشارك بياناتك مع أي طرف ثالث تجاري أو إعلاني مطلقاً.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                <h3 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#596628]" />
                  <span>2. نظام الأذونات وأمان كودات المشتركين (Role-Based Access)</span>
                </h3>
                <p className="text-xs text-[#5D5648] dark:text-[#C5BEAF]">
                  يتم توليد كود فريد لكل مشترك بناءً على بريده الإلكتروني. يمنح الكود صلاحية المطالعة السريرية وقراءة البروتوكولات فقط (Read-Only)، في حين تبقى صلاحيات التعديل والحذف وتوليد الأكواد محمية ومحصورة بالرمز السري للمشرفة العامة (د. حياة نافع فجر).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                <h3 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#596628]" />
                  <span>3. خصوصية الحالات السريرية والمرضى</span>
                </h3>
                <p className="text-xs text-[#5D5648] dark:text-[#C5BEAF]">
                  جميع الصور والحالات السريرية المعروضة خضعت للتعمية التامة للبيانات التعريفية للمرضى (Anonymized Clinical Data) وفقاً للمبادئ التوجيهية لأخلاقيات طب الأسنان وموافقة المراجعين لأغراض التدريس والبحث الأكاديمي.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CLINICAL DISCLAIMER & TERMS */}
      {activeSubTab === 'terms' && (
        <div className="space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E5DEC9] dark:border-[#343E26]">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2F2B24] dark:text-white">
                  إخلاء المسؤولية الطبية وحقوق الملكية الفكرية
                </h2>
                <p className="text-xs text-[#7B7465] dark:text-[#A7A08E]">
                  شروط الاستخدام الأكاديمي والسريري المعتمد
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#4E473A] dark:text-[#D5CDBC] leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-[#252016] border border-amber-300 dark:border-amber-800 space-y-2">
                <h3 className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>إخلاء مسؤولية سريري (Medical & Clinical Disclaimer)</span>
                </h3>
                <p className="text-xs text-amber-950 dark:text-amber-300 leading-relaxed font-medium">
                  هذا التطبيق هو دليل تعليمي وتدريبي أكاديمي مخصص لطلاب وأطباء الأسنان في جامعة المعارف والجامعات العراقية والعربية. لا يُعد بديلاً عن الفحص السريري المباشر أو التقييم الفردي لكل مريض. يجب على الطبيب الممارس دوماً مراعاة التشخيص الشعاعي والصحي الشامل لكل حالة.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
                <h3 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#596628]" />
                  <span>حقوق الملكية الفكرية وإعداد المحتوى</span>
                </h3>
                <p className="text-xs text-[#595243] dark:text-[#C5BEAF] leading-relaxed">
                  جميع الشروحات السريرية، دليل التعامل مع المراجعين، خطوات التدريب المنزلي، وتنسيق البروتوكول هي ثمرة جهد أكاديمي وسريري من إعداد وتنسيق <strong>د. حياه نافع فجر</strong>. يُسمح باستخدامها للدراسة الشخصية والعيادية ويُحظر إعادة بيعها أو نسخها تجارياً دون إذن مسبق.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
