import React, { useState } from 'react';
import { RestorationClass } from '../data/classesData';
import { SlideData } from '../data/slidesData';
import {
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wrench,
  FileText,
  ShieldCheck,
  Send,
  GraduationCap,
} from 'lucide-react';

interface ManualClassBuilderProps {
  onSaveClass: (newClass: RestorationClass) => void;
  onCancel?: () => void;
}

export const ManualClassBuilder: React.FC<ManualClassBuilderProps> = ({ onSaveClass, onCancel }) => {
  // General Info (Slide 1)
  const [classCode, setClassCode] = useState('Class II');
  const [arabicName, setArabicName] = useState('حشوات الصنف الثاني (Class II)');
  const [title, setTitle] = useState('Class II Composite Restoration: From A to Z');
  const [subtitle, setSubtitle] = useState('البروتوكول السريري لترميم الأسنان الخلفية الملاصقة وبناء نقطة التماس المحكمة');
  const [badge, setBadge] = useState('الأسنان الخلفية الملاصقة | Posterior Proximal');
  const [clinicalFocus, setClinicalFocus] = useState('خطوات متسلسلة لضمان نقطة تماس تشريحية (Tight Contact Point) ومنع انحشار الطعام والتسرب الحفافي.');
  const [authorName, setAuthorName] = useState('حياه نافع فجر');
  const [authorRole, setAuthorRole] = useState('مرحلة رابعة - جامعة المعارف');

  // Step 1: Cleaning & Scaling
  const [step1Title, setStep1Title] = useState('Scaling & Surface Cleaning');
  const [step1Subtitle, setStep1Subtitle] = useState('تنظيف السطح وإزالة التكلسات والصبغات');
  const [step1Desc, setStep1Desc] = useState('تنظيف سطح السن المتضرر والأسنان المجاورة جيداً قبل البدء بأي إجراء سريري.');
  const [step1Points, setStep1Points] = useState(
    'استخدام معجون Pumice خالي من الفلورايد مع Prophy Brush لفرك السطح.\nالهدف: إزالة التكلسات والصبغات واللويحة لضمان أقصى قوة ارتباط التصاقي.'
  );
  const [step1Instruments, setStep1Instruments] = useState('Pumice Paste (Fluoride-free), Prophy Brush');

  // Step 2: Accurate Shade Selection
  const [step2Title, setStep2Title] = useState('Accurate Shade Selection');
  const [step2Subtitle, setStep2Subtitle] = useState('اختيار اللون واختبار الكومبوزيت بالبلمرة');
  const [step2Desc, setStep2Desc] = useState('تحديد اللون الحقيقي للسن قبل حدوث الجفاف (Dehydration).');
  const [step2Points, setStep2Points] = useState(
    'تجفيف السن بلطف دون إفراط.\nإجراء تقنية Button Try-in: وضع قطرة صغيرة من الكومبوزيت على السن وبلمرتها بالضوء.\nاختيار أقرب لون مطابق للـ Dentin والـ Enamel قبل تركيب الـ Rubber Dam.'
  );
  const [step2Warning, setStep2Warning] = useState('تجنب اختيار اللون بعد العزل لأن جفاف السن (Dehydration) يجعله أبيض عاتماً ومضللاً.');
  const [step2Instruments, setStep2Instruments] = useState('VITA Shade Guide, Light Cure Unit, Composite Shades');

  // Step 3: Preparation & Margin / Bevel
  const [step3Title, setStep3Title] = useState('Preparation & Cavity Protocol');
  const [step3Subtitle, setStep3Subtitle] = useState('بروتوكول التحضير وشطف الحواف وتنعيم الأطراف');
  const [step3Desc, setStep3Desc] = useState('تحضير محافظ للسن يراعي قوى الإطباق ويزيد مساحة الالتصاق.');
  const [step3Points, setStep3Points] = useState(
    'قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط للحفاظ الأقصى على بنية السن السليمة.\nاستخدام تورباين بـ Blue Coded Diamond Bur للتحضير الأولي وإزالة النخر.\nاستخدام تورباين بـ Yellow Coded Diamond Bur لتنعيم الحواف وإزالة الأطراف الحادة.\nإعادة التنظيف: غسل وتنظيف السن بالماء والهواء لضمان التخلص من بقايا التحضير والغبار (Debris).'
  );
  const [step3Instruments, setStep3Instruments] = useState('Blue Coded Diamond Bur, Yellow Coded Diamond Bur, High-speed Handpiece');
  const [step3Tips, setStep3Tips] = useState('تدوير الزوايا الداخلية وتنعيم الحواف بالبير الأصفر يمنع تركيز الإجهاد وتكسر الكومبوزيت.');

  // Step 4: Isolation (Rubber Dam)
  const [step4Title, setStep4Title] = useState('Complete Isolation (Rubber Dam)');
  const [step4Subtitle, setStep4Subtitle] = useState('العزل المحكم بالربر دام لمنع الرطوبة');
  const [step4Desc, setStep4Desc] = useState('منع وصول اللعاب وبخار التنفس إلى موقع الترميم بنسبة 100%.');
  const [step4Points, setStep4Points] = useState(
    'العزل الرباعي (Quadrant Isolation): عزل السن المعالج مع سنين للأمام وسن للخلف لضمان ثبات حلقة الماتريكس.\nالكلمبات المستخدمة: كلمبات روتر (Rotter) أو كلمبات الأرحاء والضواحك المعتمدة.\nقلب الربر دام للداخل (Inversion) بخيط الأسنان لمنع أي تسرب لعابي.'
  );
  const [step4Warning, setStep4Warning] = useState('⚠️ ملاحظة سريرية: تجنب العزل المفرد وتأكد من الختم اللثوي التام لمنع التلوث بالدم أو السائل الميزابي.');
  const [step4Instruments, setStep4Instruments] = useState('Heavy Rubber Dam Sheet, Dental Clamps, Dental Floss, Forceps');

  // Step 5 (Part 1): Adhesive & Wall Creation
  const [step5Part1Title, setStep5Part1Title] = useState('Adhesive Protocol & Wall Creation');
  const [step5Part1Subtitle, setStep5Part1Subtitle] = useState('التخريش، البوند، وتأسيس الجدار الداعم');
  const [step5Etch, setStep5Etch] = useState('Acid Etching: تطبيق الحمض على الميناء لمدة 15-20 ثانية، وعلى العاج لمدة 10 ثوانٍ فقط، ثم الشطف والتجفيف اللطيف.');
  const [step5Bond, setStep5Bond] = useState('Bonding Agent: تطبيق الـ Bond وتدليكه جيداً لمدة 20 ثانية، ثم التجفيف بالهواء لتبخير المذيب، ثم عمل Light Cure.');
  const [step5Wall, setStep5Wall] = useState('Wall / Matrix Creation: تركيب مصفوفة الحشوة (Matrix Band & Wedge) وبناء الجدار الملاصق أو الداعم وتصليبه بالضوء.');
  const [step5Part1Instruments, setStep5Part1Instruments] = useState('37% Phosphoric Acid, Universal Bond, Matrix Band, Wedge');

  // Step 5 (Part 2): Anatomical Layering
  const [step5Part2Title, setStep5Part2Title] = useState('Anatomical Layering & Sculpting');
  const [step5Part2Subtitle, setStep5Part2Subtitle] = useState('بناء طبقة العاج ونحت التفاصيل وطبقة الميناء');
  const [step5Proximal, setStep5Proximal] = useState('بناء الحواف الملاصقة بالكومبوزيت وتأكيد تشكيل الـ Contact Point الصحيحة.');
  const [step5Dentin, setStep5Dentin] = useState('Dentin Layering: تطبيق طبقة العاج بالكومبوزيت لبناء العمق الطبيعي والحدبات، مع ترك مساحة للميناء.');
  const [step5Enamel, setStep5Enamel] = useState('Enamel Layering: إضافة طبقة الميناء النهائية ونحت الميازيب وتغطية الحواف بانسيابية تامة.');
  const [step5Part2Instruments, setStep5Part2Instruments] = useState('Composite Body (A2/A3), Enamel Composite, Modeling Instruments');
  const [step5Tips, setStep5Tips] = useState('استخدم طبقات مائلة (Oblique Layers) لتفادي سحب الجدران وتقليل إجهاد الانكماش C-Factor.');

  // Step 6: Finishing & Polishing & Oxygen Barrier Gel
  const [step6Oxygen, setStep6Oxygen] = useState(
    'Oxygen Barrier Gel (خطوة إضافية / اختيارية): وضع طبقة بسيطة من الـ Glycerin Gel على السطح الخارجي قبل ضربة الـ Light Cure الأخيرة لعزل الأكسجين وتأمين بلمرة كاملة 100% لمنع التصبغات (Stain Resistance).'
  );
  const [step6Finishing, setStep6Finishing] = useState(
    'Finishing Protocol: استخدام بيرات الفنشنغ للتورباين (Yellow & Red Fine Diamond Burs)، واستخدام الـ Finishing Strips للسطوح الملاصقة، وأقراص الـ Finishing Discs لتنعيم الزوايا.'
  );
  const [step6Polishing, setStep6Polishing] = useState(
    'Polishing Protocol: استخدام بيرات أو أقراص البولشنغ الخاصة بالـ Handpiece، وتطبيق معجون التلميع بالألماس (Diamond Polishing Paste) للحصول على لمعان طبيعي زجاجي عالي الجودة (High-Gloss Finish).'
  );
  const [step6Instruments, setStep6Instruments] = useState('Glycerin Gel, Yellow/Red Fine Burs, Finishing Strips, Diamond Polishing Paste');

  // Step 8: Outro & Contact
  const [outroTitle, setOutroTitle] = useState('Mastering Restorations 💎✨');
  const [outroFocus, setOutroFocus] = useState('بهذا البروتوكول المتكامل خطوة بخطوة، تصبح الحالة مضمونة النتائج من حيث القوة، الجمالية، والاندماج الطبيعي مع باقي الأسنان!');
  const [telegramChannel, setTelegramChannel] = useState('t.me/hay_a_2');
  const [offerText, setOfferText] = useState('الكورس الوزاري الشامل وكورس العيادات (منصة ليرنو) خصم 50% لفترة محدودة!');
  const [promoKeyword, setPromoKeyword] = useState('كورس');

  // Convert string points to array
  const parsePoints = (text: string): string[] => {
    return text
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  const parseInstruments = (text: string): string[] => {
    return text
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const id = `manual-${Date.now()}`;

    // Construct the 8 slides strictly according to Class IV architecture:
    const slides: SlideData[] = [
      // Slide 1: Cover
      {
        id: 1,
        slideNumber: 1,
        type: 'cover',
        title: title,
        subtitle: subtitle,
        badge: badge,
        author: {
          name: authorName,
          role: authorRole.split('-')[0]?.trim() || 'مرحلة رابعة',
          university: authorRole.split('-')[1]?.trim() || 'جامعة المعارف',
        },
        clinicalFocus: clinicalFocus,
        speakerNotes: `مرحبًا بكم في البروتوكول السريري لترميم ${arabicName}. سنستعرض خطوات متسلسلة لضمان نتيجة جمالية ووظيفية ممتازة.`,
      },
      // Slide 2: Step 1 & 2
      {
        id: 2,
        slideNumber: 2,
        type: 'steps',
        title: `Step 1 & Step 2: Surface Preparation & Shade Selection`,
        subtitle: 'التهيئة الأولية وتحديد اللون بدقة متناهية',
        badge: 'المرحلة التحضيرية السريرية',
        clinicalFocus: 'تحديد اللون قبل الجفاف (Dehydration) والتنظيف الشامل هما سر نجاح الاندماج البصري.',
        steps: [
          {
            stepNumber: 'Step 1',
            title: step1Title,
            subtitle: step1Subtitle,
            description: step1Desc,
            points: parsePoints(step1Points),
            instruments: parseInstruments(step1Instruments),
          },
          {
            stepNumber: 'Step 2',
            title: step2Title,
            subtitle: step2Subtitle,
            description: step2Desc,
            points: parsePoints(step2Points),
            warning: step2Warning,
            instruments: parseInstruments(step2Instruments),
          },
        ],
        speakerNotes: 'ركز على أهمية الـ Button Try-in واختيار اللون قبل تركيب الربر دام لتجنب ظاهرة الجفاف.',
      },
      // Slide 3: Step 3
      {
        id: 3,
        slideNumber: 3,
        type: 'detail',
        title: `Step 3: ${step3Title}`,
        subtitle: step3Subtitle,
        badge: 'التحضير الميكانيكي الحيوي',
        clinicalFocus: 'تحضير الحواف وتنعيمها يكسر ارتداد الضوء ويضمن توزيعاً مثالياً لقوى الإطباق.',
        steps: [
          {
            stepNumber: 'Step 3',
            title: step3Title,
            subtitle: step3Subtitle,
            description: step3Desc,
            points: parsePoints(step3Points),
            instruments: parseInstruments(step3Instruments),
            tips: step3Tips,
          },
        ],
        speakerNotes: 'التنعيم بالبير الأصفر يزيل الأطراف الحادة ويمنع ظهور الخط الفاصل بين السن والكومبوزيت.',
      },
      // Slide 4: Step 4
      {
        id: 4,
        slideNumber: 4,
        type: 'detail',
        title: `Step 4: ${step4Title}`,
        subtitle: step4Subtitle,
        badge: 'العزل والتحكم بالرطوبة',
        clinicalFocus: 'العزل الكامل بحاجز المطاط هو الضمان الأساسي لمنع التلوث باللعاب وضمان أقصى التصاق.',
        steps: [
          {
            stepNumber: 'Step 4',
            title: step4Title,
            subtitle: step4Subtitle,
            description: step4Desc,
            points: parsePoints(step4Points),
            warning: step4Warning,
            instruments: parseInstruments(step4Instruments),
          },
        ],
        speakerNotes: 'العزل السليم يحمي ألياف الكولاجين والرابط الالتصاقي من التلوث بالرطوبة.',
      },
      // Slide 5: Step 5 Part 1
      {
        id: 5,
        slideNumber: 5,
        type: 'steps',
        title: `Step 5 (Part 1): ${step5Part1Title}`,
        subtitle: step5Part1Subtitle,
        badge: 'المرحلة الالتصاقية والمعمارية',
        clinicalFocus: 'التخريش المنضبط بالوقت وتأسيس الجدار الداعم يحول التجويف إلى شكل مسنود يسهل بناءه.',
        steps: [
          {
            stepNumber: 'Step 5 - A',
            title: 'Acid Etching & Bonding Agent',
            subtitle: 'التخريش الحمضي وتدليك الرابط الالتصاقي',
            description: 'خلق المسامات المجهرية وتغلغل المونومر اللاصق.',
            points: [step5Etch, step5Bond],
            instruments: parseInstruments(step5Part1Instruments),
          },
          {
            stepNumber: 'Step 5 - B & C',
            title: 'Matrix & Supporting Wall Creation',
            subtitle: 'بناء الجدار الخلفي أو الملاصق',
            description: 'استخدام الماتريكس أو شريط السيلولويد لإنشاء دعامة صلبة.',
            points: [step5Wall],
            instruments: parseInstruments(step5Part1Instruments),
          },
        ],
        speakerNotes: 'إنشاء الجدار الداعم يمنح الطبيب تحكماً فائقاً بالطبقات اللاحقة دون تسرب المادة.',
      },
      // Slide 6: Step 5 Part 2
      {
        id: 6,
        slideNumber: 6,
        type: 'steps',
        title: `Step 5 (Part 2): ${step5Part2Title}`,
        subtitle: step5Part2Subtitle,
        badge: 'النحت التشريحي المجهري',
        clinicalFocus: 'محاكاة التشريح الطبيعي: بناء العاج والماميلونات/الحدبات ثم التغطية بطبقة ميناء طبيعية.',
        steps: [
          {
            stepNumber: 'Step 5 - D & E',
            title: 'Proximal Margins & Dentin Layering',
            subtitle: 'الحواف الملاصقة وطبقة العاج الطبيعية',
            description: 'بناء العمق اللوني والتشريح الداخلي للسن.',
            points: [step5Proximal, step5Dentin],
            instruments: parseInstruments(step5Part2Instruments),
            tips: step5Tips,
          },
          {
            stepNumber: 'Step 5 - F',
            title: 'Enamel Layering & Optical Blending',
            subtitle: 'طبقة الميناء الخارجية وتغطية الحواف',
            description: 'إغلاق السطح الخارجي بكومبوزيت مينائي نصف شفاف.',
            points: [step5Enamel],
            instruments: parseInstruments(step5Part2Instruments),
          },
        ],
        speakerNotes: 'النحت المسبق الدقيق يوفر وقتاً كبيراً في الفنشنغ ويحفظ الطبقة الأقوى من الكومبوزيت.',
      },
      // Slide 7: Step 6
      {
        id: 7,
        slideNumber: 7,
        type: 'steps',
        title: 'Step 6: Finishing & Polishing Protocol',
        subtitle: 'بروتوكول الإنهاء والتلميع وعزل الأكسجين بالجل',
        badge: 'اللمسات النهائية واللمعان السريري',
        clinicalFocus: 'عزل الأكسجين بالـ Glycerin Gel يمنع طبقة التثبيط ويحمي الترميم من التصبغات المستقبلية.',
        steps: [
          {
            stepNumber: 'Step 6 - A',
            title: 'Oxygen Barrier Gel Protocol',
            subtitle: 'عزل الأكسجين لضمان بلمرة سطحية كاملة',
            description: 'التغلب على طبقة تثبيط الأكسجين (Oxygen Inhibition Layer).',
            points: [step6Oxygen],
            instruments: ['Glycerin Gel', 'Curing Light', 'Water Spray'],
          },
          {
            stepNumber: 'Step 6 - B & C',
            title: 'Finishing & High-Gloss Polishing',
            subtitle: 'تشذيب الحواف والتلميع الماسي العالي',
            description: 'إعادة رسم المعالم التشريحية وإكساب السن لمعاناً طبيعياً.',
            points: [step6Finishing, step6Polishing],
            instruments: parseInstruments(step6Instruments),
          },
        ],
        speakerNotes: 'التلميع فائق النعومة يحمي اللثة ويمنع تراكم اللويحة الجرثومية والتصبغات.',
      },
      // Slide 8: Outro
      {
        id: 8,
        slideNumber: 8,
        type: 'outro',
        title: outroTitle,
        subtitle: `إتقان حشوات ${arabicName} وتطوير المهارات السريرية`,
        badge: 'الخاتمة والتواصل الأكاديمي',
        clinicalFocus: outroFocus,
        author: {
          name: authorName,
          role: authorRole.split('-')[0]?.trim() || 'مرحلة رابعة',
          university: authorRole.split('-')[1]?.trim() || 'جامعة المعارف',
        },
        actionCallout: {
          channel: telegramChannel,
          offer: offerText,
          details: 'ارسل كلمة "كورس" بالتليجرام لتتوصل بكل التفاصيل والمحاور العلمية.',
          keyword: promoKeyword,
        },
        speakerNotes: 'شكراً لكم. للتواصل والاستفسارات السريرية أو الانضمام للكورس الوزاري، تواصلوا معنا عبر التليجرام.',
      },
    ];

    const newClassObj: RestorationClass = {
      id,
      code: classCode,
      name: title,
      arabicName,
      subtitle,
      badge,
      indication: `البروتوكول السريري لحالة ${arabicName}`,
      targetTeeth: 'حسب خطة العلاج السريري المحددة',
      keyChallenge: 'مطابقة اللون والدقة التشريحية ومتانة الالتصاق واللمعان',
      slides,
      isCustom: true,
    };

    onSaveClass(newClassObj);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] p-6 rounded-3xl border-2 border-[#596628] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#596628] text-white text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>منشئ الكلاسات اليدوي (Manual Class Builder)</span>
            </div>
            <h2 className="text-2xl font-black text-[#2F2B24]">
              إضافة كلاس وتنسيقه تلقائياً بنفس ترتيب وألوان كلاس فور (Class IV)
            </h2>
            <p className="text-xs text-[#635D4F] mt-1">
              أدخل معلومات الكلاس بيدك في الحقول أدناه، وسيقوم النظام بتنسيقها وترتيبها فوراً في 8 شرائح تفصيلية متناسقة بنفس درجات الزيتوني (#596628) والبيجي الهادئ وطبقات العاج والميناء!
            </p>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#554F42] hover:bg-[#F2ECE0] text-xs font-bold transition-all cursor-pointer self-start"
            >
              الرجوع لعرض الشرائح
            </button>
          )}
        </div>
      </div>

      {/* Main Builder Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Cover Information (سلايد 1) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 1: الغلاف الرئيسي والبيانات التعريفية
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                رمز الكلاس (Class Code):
              </label>
              <input
                type="text"
                required
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="مثال: Class II أو Class I أو Class V"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                الاسم بالعربية (Arabic Name):
              </label>
              <input
                type="text"
                required
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                placeholder="مثال: حشوات الصنف الثاني (Class II)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#3B362C] block mb-1">
              العنوان الرئيسي للسلايد (Main Slide Title):
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: Class II Composite Restoration: From A to Z"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3B362C] block mb-1">
              العنوان الفرعي والهدف السريري (Subtitle & Goal):
            </label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="مثال: البروتوكول السريري لترميم السطوح الملاصقة وبناء نقطة التماس"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                اسم المُعد (Author):
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                الصفة والجامعة (Role & University):
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24] focus:outline-none focus:ring-2 focus:ring-[#596628]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Step 1 & Step 2 (سلايد 2) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 2: Step 1 & Step 2 (التنظيف السطحي واختيار اللون الدقيق)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 1 */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] space-y-3">
              <span className="font-black text-xs text-[#596628] block">Step 1: التنظيف السطحي وإزالة التكلسات</span>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">عنوان الخطوة:</label>
                <input
                  type="text"
                  value={step1Title}
                  onChange={(e) => setStep1Title(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">النقاط السريرية (كل سطر نقطة):</label>
                <textarea
                  rows={3}
                  value={step1Points}
                  onChange={(e) => setStep1Points(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E5DEC9] bg-white text-xs leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">الأدوات والمواد (مفصولة بفاصلة):</label>
                <input
                  type="text"
                  value={step1Instruments}
                  onChange={(e) => setStep1Instruments(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] space-y-3">
              <span className="font-black text-xs text-[#596628] block">Step 2: اختيار اللون (Button Try-in)</span>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">عنوان الخطوة:</label>
                <input
                  type="text"
                  value={step2Title}
                  onChange={(e) => setStep2Title(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">النقاط السريرية (كل سطر نقطة):</label>
                <textarea
                  rows={3}
                  value={step2Points}
                  onChange={(e) => setStep2Points(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E5DEC9] bg-white text-xs leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">تحذير الجفاف (Dehydration Warning):</label>
                <input
                  type="text"
                  value={step2Warning}
                  onChange={(e) => setStep2Warning(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Step 3 (سلايد 3 - التحضير والـ Bevel) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 3: Step 3 (بروتوكول التحضير وشطف الحواف Preparation & Beveling)
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">عنوان التحضير:</label>
              <input
                type="text"
                value={step3Title}
                onChange={(e) => setStep3Title(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#2F2B24]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                النقاط التفصيلية للتحضير (Bevel، البير الأزرق والأصفر، غسل الـ Debris):
              </label>
              <textarea
                rows={3}
                value={step3Points}
                onChange={(e) => setStep3Points(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#3B362C] block mb-1">البيرات والأدوات المستخدمة:</label>
                <input
                  type="text"
                  value={step3Instruments}
                  onChange={(e) => setStep3Instruments(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#3B362C] block mb-1">نصيحة سريرية (Clinical Tip):</label>
                <input
                  type="text"
                  value={step3Tips}
                  onChange={(e) => setStep3Tips(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs text-[#596628] font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Step 4 (سلايد 4 - العزل بالربر دام) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 4: Step 4 (العزل التام بحاجز المطاط Rubber Dam Protocol)
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                طرق العزل الصحيحة والكلمبات المستخدمة (Rotter Clamps / Clamps 212 / Quadrant):
              </label>
              <textarea
                rows={3}
                value={step4Points}
                onChange={(e) => setStep4Points(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">تحذير سريري حرج:</label>
              <input
                type="text"
                value={step4Warning}
                onChange={(e) => setStep4Warning(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Step 5 Part 1 & Part 2 (سلايد 5 و 6 - الالتصاق والطبقات) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              5 & 6
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 5 و 6: Step 5 (البروتوكول الالتصاقي، الجدار الداعم، وطبقات العاج والميناء)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Part 1 */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] space-y-3">
              <span className="font-black text-xs text-[#596628] block">سلايد 5: التخريش، البوند، وبناء الجدار الداعم</span>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">A. Acid Etching (التخريش):</label>
                <textarea
                  rows={2}
                  value={step5Etch}
                  onChange={(e) => setStep5Etch(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">B. Bonding Agent (البوند وتبخير المذيب):</label>
                <textarea
                  rows={2}
                  value={step5Bond}
                  onChange={(e) => setStep5Bond(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">C. Wall / Matrix Creation (بناء الجدار الداعم):</label>
                <textarea
                  rows={2}
                  value={step5Wall}
                  onChange={(e) => setStep5Wall(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
            </div>

            {/* Part 2 */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] space-y-3">
              <span className="font-black text-xs text-[#596628] block">سلايد 6: الطبقات التشريحية (Dentin & Enamel Layering)</span>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">D. الحواف الملاصقة (Proximal Margins):</label>
                <textarea
                  rows={2}
                  value={step5Proximal}
                  onChange={(e) => setStep5Proximal(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">E. طبقة العاج والماميلونات (Dentin Layering):</label>
                <textarea
                  rows={2}
                  value={step5Dentin}
                  onChange={(e) => setStep5Dentin(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4B4437] block mb-1">F. طبقة الميناء وتغطية الـ Bevel (Enamel Layering):</label>
                <textarea
                  rows={2}
                  value={step5Enamel}
                  onChange={(e) => setStep5Enamel(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Step 6 (سلايد 7 - الإنهاء والتلميع وعزل الأكسجين) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              7
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 7: Step 6 (الإنهاء والتلميع وعزل الأكسجين بالـ Glycerin Gel)
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">
                A. Oxygen Barrier Gel (عزل الأكسجين وتأمين بلمرة كاملة لمنع التصبغات):
              </label>
              <textarea
                rows={2}
                value={step6Oxygen}
                onChange={(e) => setStep6Oxygen(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#3B362C] block mb-1">
                  B. Finishing Protocol (بيرات الفنشنغ للتورباين والأشرطة والأقراص):
                </label>
                <textarea
                  rows={3}
                  value={step6Finishing}
                  onChange={(e) => setStep6Finishing(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#3B362C] block mb-1">
                  C. Polishing Protocol (معجون التلميع بالألماس High-Gloss Finish):
                </label>
                <textarea
                  rows={3}
                  value={step6Polishing}
                  onChange={(e) => setStep6Polishing(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: Outro (سلايد 8 - الخاتمة وعرض التليجرام) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D2]">
            <span className="w-7 h-7 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center">
              8
            </span>
            <h3 className="font-bold text-base text-[#2F2B24]">
              سلايد 8: الخاتمة وقناة التليجرام وعرض الكورس
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">عنوان الخاتمة:</label>
              <input
                type="text"
                value={outroTitle}
                onChange={(e) => setOutroTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B362C] block mb-1">قناة التليجرام:</label>
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs font-bold text-[#596628]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#3B362C] block mb-1">الخلاصة السريرية:</label>
            <input
              type="text"
              value={outroFocus}
              onChange={(e) => setOutroFocus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] text-xs"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 bg-[#FAF7F2]/95 backdrop-blur-md p-4 rounded-2xl border-2 border-[#596628] shadow-lg flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-[#596628] hidden sm:inline flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            سيتم تحويل هذه المدخلات إلى 8 شرائح بتصميم زيتوني وبيجي هادئ فوراً
          </span>

          <div className="flex items-center gap-2 mr-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-[#554F42] hover:bg-[#F2ECE0] text-xs font-bold cursor-pointer transition-all"
              >
                إلغاء
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتنسيق الكلاس بتصميم كلاس فور</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
