import React, { useState, useEffect } from 'react';
import {
  Unlock,
  Lock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Stethoscope,
  Wrench,
  Pill,
  Layers,
  Palette,
  Timer,
  FileText,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import {
  getFreeSectionsMap,
  saveFreeSectionsMap,
  isSectionFree,
  PROTOCOL_FREE_SECTIONS_EVENT,
  FreeSectionsMap,
} from '../data/freeSectionsManager';

interface FreeSectionItem {
  id: string;
  title: string;
  category: 'protocol' | 'section' | 'tool';
  desc: string;
  icon: React.ReactNode;
}

const ALL_CONTROLLABLE_MODULES: FreeSectionItem[] = [
  // 1. Clinical Restoration Classes (البروتوكولات)
  {
    id: 'class-1',
    title: 'ترميم الصنف الأول (Class I)',
    category: 'protocol',
    desc: 'الحفر الإطباقي والترميم الخلفي والـ Occlusal Anatomy',
    icon: <BookOpen className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'class-2',
    title: 'ترميم الصنف الثاني (Class II)',
    category: 'protocol',
    desc: 'بناء الجدار القريب والماتريكس رينج وتكنيك الصندوق',
    icon: <BookOpen className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'class-3',
    title: 'ترميم الصنف الثالث (Class III)',
    category: 'protocol',
    desc: 'الأسنان الأمامية من السطح الحنكي واللساني بدون شطب الحافة',
    icon: <BookOpen className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'class-4',
    title: 'ترميم الصنف الرابع (Class IV)',
    category: 'protocol',
    desc: 'إعادة بناء الزاوية القاطعة ومطابقة الطبقات والماميلونات',
    icon: <BookOpen className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'class-5',
    title: 'ترميم الصنف الخامس (Class V)',
    category: 'protocol',
    desc: 'عنق السن والآفات غير النخرية وخط الابتسامة',
    icon: <BookOpen className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'smart_tray',
    title: 'بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات',
    category: 'protocol',
    desc: 'ترتيب الأدوات، التعقيم، التخدير، العزل، الترميم، وفحص الإطباق',
    icon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
  },

  // 2. Main Clinical Sections (الأقسام الرئيسية)
  {
    id: 'clinical_skills',
    title: 'أطلس المهارات السريرية 4K',
    category: 'section',
    desc: 'فيديوهات وشروحات التخدير، الربر دام، والخياطة السريرية',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'surgical',
    title: 'الحالات الجراحية وقلع الأسنان',
    category: 'section',
    desc: 'بروتوكولات القلع البسيط والجراحي وفصل التيجان والجذور',
    icon: <Stethoscope className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'home_practice',
    title: 'تدريبات وتطبيقات بالبيت',
    category: 'section',
    desc: 'تمارين الخياطة على الموديل، الفوارغ، والتدريب المستقل',
    icon: <Wrench className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'prescriptions',
    title: 'دليل وصف الأدوية والمسكنات',
    category: 'section',
    desc: 'المضادات الحيوية، المسكنات، وجرعات طب الأسنان الدقيقة',
    icon: <Pill className="w-4 h-4 text-sky-600" />,
  },

  // 3. Interactive Clinical Tools (الأدوات السريرية)
  {
    id: 'anatomy',
    title: 'محاكي الطبقات ثلاثي الأبعاد',
    category: 'tool',
    desc: 'استكشاف تشريح السن وبناء طبقات العاج والمينا',
    icon: <Layers className="w-4 h-4 text-[#596628]" />,
  },
  {
    id: 'shade',
    title: 'محاكي ومطابقة الألوان (Shade)',
    category: 'tool',
    desc: 'اختيار تدريجات الـ Hue / Value / Chroma للكومبوزيت',
    icon: <Palette className="w-4 h-4 text-purple-600" />,
  },
  {
    id: 'timer',
    title: 'المؤقت السريري لزمن التصلب',
    category: 'tool',
    desc: 'توقيت حمض التخريش، البوند، والـ Light Cure بالثواني',
    icon: <Timer className="w-4 h-4 text-rose-500" />,
  },
  {
    id: 'cheatsheet',
    title: 'أطلس الجيب والملخص السريري',
    category: 'tool',
    desc: 'ملخص الخطوات السريرية السريع الجاهز للطباعة والمراجعة',
    icon: <FileText className="w-4 h-4 text-teal-600" />,
  },
];

export const FreeSectionsAdminManager: React.FC = () => {
  const [freeMap, setFreeMap] = useState<FreeSectionsMap>(() => getFreeSectionsMap());
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setFreeMap(getFreeSectionsMap());
    };
    window.addEventListener(PROTOCOL_FREE_SECTIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_FREE_SECTIONS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggle = (id: string, title: string) => {
    const willBeFree = !isSectionFree(id);
    const normalized = id.replace(/^sec-/, '');
    const updated: FreeSectionsMap = {
      ...freeMap,
      [id]: willBeFree,
      [normalized]: willBeFree,
      [`sec-${normalized}`]: willBeFree,
    };
    saveFreeSectionsMap(updated);
    setFreeMap(updated);

    setFeedbackNotice(
      willBeFree
        ? `تم فتح "${title}" للعامة مجاناً بدون كود (Free Public Access) 🔓`
        : `تم إلغاء الوصول المجاني لـ "${title}"، يتطلب الآن كود اشتراك 🔒`
    );
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleMakeAllFree = () => {
    const updated: FreeSectionsMap = { ...freeMap };
    ALL_CONTROLLABLE_MODULES.forEach((m) => {
      updated[m.id] = true;
      const normalized = m.id.replace(/^sec-/, '');
      updated[normalized] = true;
      updated[`sec-${normalized}`] = true;
    });
    saveFreeSectionsMap(updated);
    setFreeMap(updated);
    setFeedbackNotice('تم فتح جميع الأقسام والبروتوكولات للعامة مجاناً! 🔓');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleLockAll = () => {
    const updated: FreeSectionsMap = {};
    saveFreeSectionsMap(updated);
    setFreeMap(updated);
    setFeedbackNotice('تم قفل جميع الأقسام؛ أصبحت تتطلب كود اشتراك معتمد 🔒.');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const freeCount = ALL_CONTROLLABLE_MODULES.filter((m) => isSectionFree(m.id)).length;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-emerald-500/40 dark:border-emerald-800/50 shadow-sm space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إدارة فتح الأقسام والبروتوكولات للعامة مجاناً (Free Public Access)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                {freeCount} متاح مجاناً
              </span>
            </div>
            <p className="text-xs text-[#6D675A] dark:text-[#A7A08E] font-medium mt-0.5">
              تحكم ديناميكي بفتح أي قسم أو بروتوكول للزوار بدون كود تفعيل مع شارة (محتوى مجاني / Free Preview).
            </p>
          </div>
        </div>

        {/* Global Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleMakeAllFree}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>فتح الكل مجاناً</span>
          </button>
          <button
            type="button"
            onClick={handleLockAll}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>قفل الكل (اشتراك فقط)</span>
          </button>
        </div>
      </div>

      {/* Notice Message */}
      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Sections & Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ALL_CONTROLLABLE_MODULES.map((item, idx) => {
          const isFree = isSectionFree(item.id);
          return (
            <div
              key={item.id || `mod_${idx}`}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isFree
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/60 dark:border-emerald-700/60 shadow-xs'
                  : 'bg-[#FAF7F2]/60 dark:bg-[#191E13]/60 border-[#E5DEC9] dark:border-[#2C3520]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#202718] border border-black/5 dark:border-white/10 flex items-center justify-center shadow-xs">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#7A7467] dark:text-[#9A9383] font-mono">
                        {item.id}
                      </span>
                    </div>
                  </div>

                  {isFree ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                      محتوى مجاني
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-400/30">
                      يتطلب اشتراك
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#635D50] dark:text-[#A7A08E] leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Clean Toggle Switch Container (as requested by User) */}
              <div className="pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                  {isFree ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>فتح القسم للعامة مجاناً (Free Public Access)</span>
                </span>

                {/* Sleek Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.title)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isFree ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={isFree}
                  title={isFree ? 'إلغاء الوصول المجاني وقفل المحتوى' : 'تفعيل الوصول المجاني للعامة'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isFree ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
