import class1Img from '../assets/images/class1_clinical_case_1790412663108.jpg';
import class2Img from '../assets/images/class2_clinical_case_1790412672142.jpg';
import class3Img from '../assets/images/class3_clinical_case_1790412682423.jpg';
import class4Img from '../assets/images/class4_clinical_case_1790412627124.jpg';
import class5Img from '../assets/images/class5_clinical_case_1790412692162.jpg';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';

const CONFIG_COLLECTION = 'app_config';
const CLINICAL_PHOTOS_DOC = 'clinical_photos_config';

export interface ClinicalCasePhoto {
  id: string;
  classId: string;
  title: string;
  tooth: string;
  stage: 'pre-op' | 'isolation' | 'prep' | 'layering' | 'finished';
  stageLabel: string;
  description: string;
  clinicalTips: string;
  imageUrl: string;
  isCustom?: boolean;
  dateAdded?: string;
}

export const INITIAL_CLINICAL_CASES: Record<string, ClinicalCasePhoto[]> = {
  'class-1': [
    {
      id: 'c1-hero',
      classId: 'class-1',
      title: 'حالة سريرية حقيقية: قبل وبعد الترميم الإطباقي الكامل (Before & After Case)',
      tooth: 'طاحن سفلي أول (#46 / #36 Lower First Molar)',
      stage: 'finished',
      stageLabel: '★ حالة سريرية موثقة (Before & After)',
      description: 'مقارنة مجهرية قبل وبعد: تسوس نخر شقوق عميقة في الطاحن الأول السفلي مع حواف ميناء متماسكة، تليها النتيجة النهائية بعد حفر الكافتي بدون بيفل، عزل تام بالربر دام، وتكديس مائل Cusp by Cusp مع صبغة الشقوق الطبيعية وتلميع فائق.',
      clinicalTips: 'حظر الـ Occlusal Bevel تماماً يحمي أطراف الكومبوزيت من التفتت الحفافي تحت ضغط المضغ العالي، وتطبيق صبغة الشقوق (Tints) يمنح الحشوة بعداً حيوياً مطابقاً للأسنان المجاورة.',
      imageUrl: class1Img,
    },
    {
      id: 'c1-1',
      classId: 'class-1',
      title: 'التشخيص الأولي وفحص عمق الشقوق (Pre-op Caries)',
      tooth: 'Lower First Molar (#46 / #36)',
      stage: 'pre-op',
      stageLabel: '1. الفحص والتشخيص الأولي',
      description: 'تسوس نخر شقوق عميقة في الطاحن الأول السفلي مع حواف ميناء متماسكة. تم التنظيف ببوميس خالي من الفلورايد وتحديد درجة اللون رطباً.',
      clinicalTips: 'تجنب استخدام المسبار الحاد بضغط عالي على الشقوق غير المتكلسة لتجنب تحويلها إلى نخور مفتوحة.',
      imageUrl: class1Img,
    },
    {
      id: 'c1-2',
      classId: 'class-1',
      title: 'العزل بالربر دام والتحضير المحافظ (Prep & No Bevel)',
      tooth: 'Lower First Molar (#46 / #36)',
      stage: 'prep',
      stageLabel: '2. العزل والتحضير المحافظ',
      description: 'عزل تام بربر دام، فتح وإزالة التسوس بـ Round Bur دون تمديد وقائي (امتداد الكافتي يعتمد كلياً على امتداد التسوس) وحظر تام للـ Occlusal Bevel.',
      clinicalTips: 'حظر شطف الحواف الإطباقية يحمي الكومبوزيت من التفتت والتشقق الحفافي تحت ضغط المضغ العالي.',
      imageUrl: class1Img,
    },
    {
      id: 'c1-3',
      classId: 'class-1',
      title: 'بطانة Flowable والتكديس المائل للحدبات (Cusp by Cusp)',
      tooth: 'Lower First Molar (#46 / #36)',
      stage: 'layering',
      stageLabel: '3. البطانة والتكديس المائل',
      description: 'وضع طبقة رقيقة من الفلوابل لامتصاص الإجهاد وتكديس الكومبوزيت بطبقات مثلثة مائلة (Oblique Layering) لتجاوز أعلى معامل انكماش C-Factor=5.',
      clinicalTips: 'بناء كل حدبة بصورة منفصلة وبلمرتها يقلل قوى الشد على الجدران المتقابلة ويمنع الحساسية بعد العلاج.',
      imageUrl: class1Img,
    },
    {
      id: 'c1-4',
      classId: 'class-1',
      title: 'النتيجة النهائية والتشريح الإطباقي الطبيعي (Final Anatomy)',
      tooth: 'Lower First Molar (#46 / #36)',
      stage: 'finished',
      stageLabel: '4. الإنهاء والتلميع الفائق',
      description: 'نحت الميازيب والحدبات، تلوين الشقوق بصبغة بنية طبيعية، وتطبيق جل الجلسرين لمنع طبقة تثبيط الأكسجين ثم التلميع الماسي الفائق.',
      clinicalTips: 'فحص العضة بـ Articulating paper في الحركات الساكنة والديناميكية لضمان عدم وجود أي إجهاد زائد على الحدبات.',
      imageUrl: class1Img,
    },
  ],

  'class-2': [
    {
      id: 'c2-hero',
      classId: 'class-2',
      title: 'حالة سريرية حقيقية: قبل وبعد الترميم الملاصق (Before & After Case)',
      tooth: 'ضاحك علوي أول (#14 / #24 Upper Premolar)',
      stage: 'finished',
      stageLabel: '★ حالة سريرية موثقة (Before & After)',
      description: 'مقارنة سريرية شاملة لحالة كلاس 2: نخر ملاصق إطباقي (MO) مع كسر الحافة الحدية، وتطبيق نظام المصفوفة الجزئية وحلقة المباعدة، ثم بناء الجدار الملاصق وتحويله إلى كلاس 1 لإنتاج نقطة تماس محكمة (Tight Contact Point).',
      clinicalTips: 'حلقة الفصل (Separator Ring) تباعد الأسنان بمقدار ميكروني يعوض سماكة الماتريكس ويضمن صوت Snap المميز عند تمرير الخيط الطبي.',
      imageUrl: class2Img,
    },
    {
      id: 'c2-1',
      classId: 'class-2',
      title: 'التشخيص والنخر الملاصق الإطباقي (Mesial-Occlusal Caries)',
      tooth: 'Upper First Premolar (#14 / #24)',
      stage: 'pre-op',
      stageLabel: '1. الفحص قبل العمل',
      description: 'نخر ملاصق إطباقي (MO) مع كسر في الحافة الحدية (Marginal Ridge). تم فحص السن المجاور والتنظيف المسبق بالبوميس واختيار اللون.',
      clinicalTips: 'وضع إسفين خشبي أو FenderWedge قبل التحضير يحمي ميناء السن المجاور من أي احتكاك عرضي برأس البير.',
      imageUrl: class2Img,
    },
    {
      id: 'c2-2',
      classId: 'class-2',
      title: 'المصفوفة الجزئية وحلقة الفصل (Sectional Matrix & Ring)',
      tooth: 'Upper First Premolar (#14 / #24)',
      stage: 'isolation',
      stageLabel: '2. نظام الماتريكس والإسفين',
      description: 'تطبيق شريط مصفوفة محدب تشريحياً (Pre-contoured Band) مع إسفين لختم الحافة اللثوية وحلقة فصل (Separator Ring) لمباعدة الأسنان.',
      clinicalTips: 'حلقة الفصل ضرورية جداً لمباعدة الأسنان بمقدار ميكروني يعوض سماكة الماتريكس ويضمن Tight Contact Point.',
      imageUrl: class2Img,
    },
    {
      id: 'c2-3',
      classId: 'class-2',
      title: 'تحويل Class II إلى Class I وبناء الجدار الملاصق',
      tooth: 'Upper First Premolar (#14 / #24)',
      stage: 'layering',
      stageLabel: '3. تحويل التجويف والتكديس',
      description: 'بناء الجدار الملاصق بسماكة 1 ملم لتحويل الحالة إلى تجويف كلاس 1، ثم تطبيق الفلوابل على أرضية الصندوق والتكديس المائل.',
      clinicalTips: 'بعد بلمرة الجدار الملاصق يمكن إزالة حلقة الفصل لإكمال الحشوة بسهولة ورؤية ممتازة.',
      imageUrl: class2Img,
    },
    {
      id: 'c2-4',
      classId: 'class-2',
      title: 'نقطة التماس المحكمة والحواف الملساء (Tight Contact & Polish)',
      tooth: 'Upper First Premolar (#14 / #24)',
      stage: 'finished',
      stageLabel: '4. نقطة التماس والإنهاء',
      description: 'إزالة الزوائد وتنعيم الحواف الملاصقة بأشرطة الفنشنغ وفحص خيط الأسنان (Floss Snap test) مع لمعان طبيعي خالي من الفجوات.',
      clinicalTips: 'سماع صوت "Snap" الواضح عند تمرير الخيط دون أن يتمزق هو الدليل القاطع على نجاح نقطة التماس وسلامة الحواف.',
      imageUrl: class2Img,
    },
  ],

  'class-3': [
    {
      id: 'c3-hero',
      classId: 'class-3',
      title: 'حالة سريرية حقيقية: قبل وبعد ترميم النخر الأمامي الملاصق (Before & After)',
      tooth: 'ثنية علوية قاطعة (#11 / #21 Maxillary Central Incisor)',
      stage: 'finished',
      stageLabel: '★ حالة سريرية موثقة (Before & After)',
      description: 'توثيق مقارن لحالة صنف ثالث في الثنية العلوية: نخر ملاصق إنسالي تحت نقطة التماس مع الحفاظ على الزاوية القاطعة، والمدخل الحنكي المحافظ مع شطف مينائي 45° والاندماج البصري التام دون أي خط فاصل مرئي.',
      clinicalTips: 'شطف حواف الميناء الخارجية (Facial Bevel) بزاوية 45° وتغطيته بطبقة ميناء رقيقة يكسر انعكاس الضوء ويخفي الحد الفاصل كلياً.',
      imageUrl: class3Img,
    },
    {
      id: 'c3-1',
      classId: 'class-3',
      title: 'نخر ملاصق أمامي بالثنية العلوية (Proximal Defect)',
      tooth: 'Maxillary Central Incisor (#11 / #21)',
      stage: 'pre-op',
      stageLabel: '1. الفحص السريري قبل البدء',
      description: 'نخر ملاصق في الثنية العلوية دون شمول الزاوية القاطعة. تم اختيار اللون وهو رطب بطريقة Button Try-in قبل العزل تفادياً للجفاف.',
      clinicalTips: 'تحديد اللون والسن رطب قبل تركيب المطاط يمنع ظهور الحشوة داكنة بعد أن تستعيد الأسنان رطوبتها الطبيعية.',
      imageUrl: class3Img,
    },
    {
      id: 'c3-2',
      classId: 'class-3',
      title: 'المدخل الحنكي المحافظ وبيفل الميناء (Palatal Access & Bevel)',
      tooth: 'Maxillary Central Incisor (#11 / #21)',
      stage: 'prep',
      stageLabel: '2. المدخل الحنكي وشطف 45°',
      description: 'فتح الحفرة من الجهة الحنكية (Palatal Access) للحفاظ على ميناء الوجه الأمامي مع عمل بيفل 45° على حواف الميناء الخارجية.',
      clinicalTips: 'المدخل الحنكي يحفظ جمالية الوجه الأمامي للسن ويجعل الحشوة غير مرئية للمريض عند الابتسام.',
      imageUrl: class3Img,
    },
    {
      id: 'c3-3',
      classId: 'class-3',
      title: 'شريط المايلار وتكديس العاج والميناء (Mylar Strip & Layering)',
      tooth: 'Maxillary Central Incisor (#11 / #21)',
      stage: 'layering',
      stageLabel: '3. عزل المايلار وتكديس الطبقات',
      description: 'تثبيت شريط مايلار شفاف مع إسفين خشبي وبناء العاج الداخلي ثم تغطية البيفل بطبقة ميناء شفافة لإخفاء الخط الفاصل.',
      clinicalTips: 'شد شريط المايلار نحو الحنك قبل التصلب يمنح الجدار الملاصق تقوساً تشريحياً طبيعياً.',
      imageUrl: class3Img,
    },
    {
      id: 'c3-4',
      classId: 'class-3',
      title: 'الاندماج التام والتلميع بالأقراص والألماس (High-Gloss Blending)',
      tooth: 'Maxillary Central Incisor (#11 / #21)',
      stage: 'finished',
      stageLabel: '4. الاندماج والبريق الزجاجي',
      description: 'تنعيم السطح الحنكي ببير لهبي والملاصق بأشرطة الفنشنغ، والتلميع بأقراص Sof-Lex ومعجون الألماس لاندماج بصري تام.',
      clinicalTips: 'استخدام أشرطة التنعيم بحذر على شكل حرف S لتفادي إزالة نقطة التماس الملاصقة.',
      imageUrl: class3Img,
    },
  ],

  'class-4': [
    {
      id: 'c4-hero',
      classId: 'class-4',
      title: 'حالة سريرية حقيقية: قبل وبعد ترميم كسر الزاوية القاطعة (Before & After Fracture)',
      tooth: 'قاطع مركزي علوي (#11 / #21 Upper Central Incisor)',
      stage: 'finished',
      stageLabel: '★ حالة سريرية موثقة (Before & After)',
      description: 'توثيق سريري مجهري عالي الدقة يماثل تماماً الحالة السريرية المطلوبة: كسر رضي حاد في الزاوية القاطعة للثنية العلوية مع فقدان الميناء والعاج، والترميم التجميلي المتقن عبر بيفل متموج (Infinite Starburst Bevel) ومفتاح سيليكوني حنكي، وبناء الماميلونات الثلاثة وتأثير الهالة (Halo Effect) مع استعادة التناظر والبريق الطبيعي.',
      clinicalTips: 'صنع مفتاح السيليكون الحنكي المسبق يوفر ثباتاً تشريحياً مثالياً للجدار الخلفي، ويسمح بوضع طبقات الكومبوزيت الملونة والماميلونات بسماكات دقيقة للغاية.',
      imageUrl: class4Img,
    },
    {
      id: 'c4-1',
      classId: 'class-4',
      title: 'كسر زاوية إنسالية رضحية (Traumatic Incisal Fracture)',
      tooth: 'Upper Central Incisor (#11 / #21)',
      stage: 'pre-op',
      stageLabel: '1. الفحص وتقييم الكسر',
      description: 'فقدان الزاوية الإنسالية للسنترال العلوي مع كشف الميناء والعاج بدون إصابة لبية. تم اختيار درجات العاج والميناء والشفافية مسبقاً.',
      clinicalTips: 'أخذ طبعة مسبقة وصنع مفتاح سيليكون حنكي (Palatal Silicone Index) يختصر نصف وقت الترميم ويضمن سماكة دقيقة.',
      imageUrl: class4Img,
    },
    {
      id: 'c4-2',
      classId: 'class-4',
      title: 'البيفل المتموج 2 مم ومفتاح السيليكون (Starburst Bevel & Key)',
      tooth: 'Upper Central Incisor (#11 / #21)',
      stage: 'prep',
      stageLabel: '2. البيفل ومفتاح السيليكون',
      description: 'صنع شطف متموج عريض (2 مم) بزاوية 45° على الوجه الدهليزي لكسر خط الانعكاس وتثبيت مفتاح السيليكون لبناء الجدار الخلفي.',
      clinicalTips: 'الـ Infinite Bevel المتموج يوزع الضوء بانسيابية ويمنع ظهور الخط الأبيض الشائع (White Line).',
      imageUrl: class4Img,
    },
    {
      id: 'c4-3',
      classId: 'class-4',
      title: 'بناء الماميلونات وقشرة الميناء (Mamelons & Halo Effect)',
      tooth: 'Upper Central Incisor (#11 / #21)',
      stage: 'layering',
      stageLabel: '3. بناء الطبقات والماميلونات',
      description: 'بناء قشرة الحنك بسماكة 0.5 مم، تشكيل 3 ماميلونات عاجية، إضافة لمسة شفافة أوباليسنت، وتحديد خط الحد القاطع (Halo Effect).',
      clinicalTips: 'ترك مسافة 0.5 مم بين رؤوس الماميلونات والحد القاطع لوضع الكومبوزيت الشفاف لإنتاج تأثير أوبال طبيعي.',
      imageUrl: class4Img,
    },
    {
      id: 'c4-4',
      classId: 'class-4',
      title: 'التناظر والابتسامة النهائية المتألقة (Symmetry & Natural Luster)',
      tooth: 'Upper Central Incisor (#11 / #21)',
      stage: 'finished',
      stageLabel: '4. التناظر والابتسامة النهائية',
      description: 'رسم خطوط النماء والملامح الدقيقة، إنهاء الزوايا الإنسالية بالتناظر التام مع السن المقابل، وتلميع زجاجي عالي يدوم لسنوات.',
      clinicalTips: 'التحقق من تناظر الطول والعرض مع السنترال المجاور قبل إزالة الربر دام لتعديل أي خلل فوراً.',
      imageUrl: class4Img,
    },
  ],

  'class-5': [
    {
      id: 'c5-hero',
      classId: 'class-5',
      title: 'حالة سريرية حقيقية: قبل وبعد ترميم التآكل العنقي الوتدي (Before & After Cervical NCCL)',
      tooth: 'ناب علوي / ضاحك (#13 / #14 Upper Canine/Premolar)',
      stage: 'finished',
      stageLabel: '★ حالة سريرية موثقة (Before & After)',
      description: 'مقارنة سريرية سرية واضحة: تآكل عنقي وتدي عميق (Abfraction) عند خط اللثة ناتج عن قوى الإجهاد والانثناء، يليه الترميم المتكامل بعد إبعاد اللثة، شطف الميناء فقط وحظر شطف الجذر، واستخدام كومبوزيت مرن ملمع ببريق فائق دون إيذاء اللثة.',
      clinicalTips: 'عزل اللثة بخيط التبعيد وكلامب 212 يمنع تسرب السائل اللثوي (GCF)، والسطح فائق التلميع هو الضمان الأكيد لمنع تراكم البلاك والتهاب اللثة.',
      imageUrl: class5Img,
    },
    {
      id: 'c5-1',
      classId: 'class-5',
      title: 'آفة عنقية وتآكل وتدي (Cervical Wedge / Abfraction NCCL)',
      tooth: 'Upper Canine / Premolar (#13 / #14)',
      stage: 'pre-op',
      stageLabel: '1. الفحص وتشخيص الآفة العنقية',
      description: 'تآكل وتدي في الثلث اللثوي نتيجة إجهادات الانثناء والمضغ. تم اختيار لون عاج بـ Chroma أعلى (A3.5) لتعويض رقة الميناء.',
      clinicalTips: 'الثلث العنقي ذو تشبع لوني عالي؛ اختيار درجة Dentin أغمق من باقي السن يمنع ظهور الحشوة شاحبة.',
      imageUrl: class5Img,
    },
    {
      id: 'c5-2',
      classId: 'class-5',
      title: 'خيط إبعاد اللثة وكلامب 212 (Cord & #212 Retraction Clamp)',
      tooth: 'Upper Canine / Premolar (#13 / #14)',
      stage: 'isolation',
      stageLabel: '2. إبعاد اللثة والعزل الجراحي',
      description: 'وضع خيط Retraction مقاس #000 لكشف الحافة السفلية وإيقاف السائل اللثوي مع تثبيت كلامب 212 بعناية فائقة.',
      clinicalTips: 'استخدام خيط الإبعاد يمنع تسرب السائل اللثوي GCF الذي يعد السبب الأول لفشل حشوات كلاس فايف وسقوطها.',
      imageUrl: class5Img,
    },
    {
      id: 'c5-3',
      classId: 'class-5',
      title: 'بيفل الميناء التاجي وحظر بيفل الجذر (Enamel Bevel & Root Butt)',
      tooth: 'Upper Canine / Premolar (#13 / #14)',
      stage: 'prep',
      stageLabel: '3. البيفل الموجه وبطانة الفلوابل',
      description: 'عمل بيفل 45° على حافة الميناء التاجية فقط وحظر البيفل على حافة عاج الجذر السفلية لتفادي التسرب، ووضع Flowable Liner لامتصاص الإجهاد.',
      clinicalTips: 'حظر عمل Bevel على حافة الجذر أو العاج اللثوي لأن البيفل هناك يضعف الارتباط ويزيد من التسرب الحفافي.',
      imageUrl: class5Img,
    },
    {
      id: 'c5-4',
      classId: 'class-5',
      title: 'صحة اللثة والحواف الملساء الفائقة (Healthy Gingiva & High Gloss)',
      tooth: 'Upper Canine / Premolar (#13 / #14)',
      stage: 'finished',
      stageLabel: '4. صحة اللثة والتلميع النهائي',
      description: 'إزالة وميض الفلاش وتنعيم الحواف بالبيرات اللهبية فائقة النعومة دون جرح اللثة، وتلميع بمعجون الألماس للحصول على سطح أملس مانع لتجمع البلاك.',
      clinicalTips: 'السطح الأملس كالميناء في الثلث العنقي هو الضمان الأكيد لعدم التهاب اللثة أو تراجعها مستقبلاً.',
      imageUrl: class5Img,
    },
  ],
};

// Helper to get all photos for a class (including custom added photos)
export function getClinicalPhotosForClass(classId: string): ClinicalCasePhoto[] {
  const initial = INITIAL_CLINICAL_CASES[classId] || [];
  try {
    const raw = localStorage.getItem(`dental_custom_photos_${classId}`);
    if (raw) {
      const custom: ClinicalCasePhoto[] = JSON.parse(raw);
      return [...initial, ...custom];
    }
  } catch {
    // fallback
  }
  return initial;
}

// Helper to save a new photo for a class (locally and to Cloud Firestore)
export function saveClinicalPhotoForClass(photo: ClinicalCasePhoto): ClinicalCasePhoto[] {
  try {
    const raw = localStorage.getItem(`dental_custom_photos_${photo.classId}`);
    const existing: ClinicalCasePhoto[] = raw ? JSON.parse(raw) : [];
    const updated = [photo, ...existing];
    localStorage.setItem(`dental_custom_photos_${photo.classId}`, JSON.stringify(updated));
    // Asynchronously save to cloud
    saveClinicalPhotoToCloud(photo).catch(() => {});
    return getClinicalPhotosForClass(photo.classId);
  } catch {
    return getClinicalPhotosForClass(photo.classId);
  }
}

// Helper to delete a custom photo
export function deleteClinicalPhoto(classId: string, photoId: string): ClinicalCasePhoto[] {
  try {
    const raw = localStorage.getItem(`dental_custom_photos_${classId}`);
    if (raw) {
      const existing: ClinicalCasePhoto[] = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter((p) => p.id !== photoId);
      localStorage.setItem(`dental_custom_photos_${classId}`, JSON.stringify(filtered));
      deleteClinicalPhotoFromCloud(classId, photoId).catch(() => {});
    }
  } catch {
    // fallback
  }
  return getClinicalPhotosForClass(classId);
}

/**
 * Saves a custom photo to Firestore cloud so all connected subscribers receive it immediately.
 */
export async function saveClinicalPhotoToCloud(photo: ClinicalCasePhoto): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, CLINICAL_PHOTOS_DOC);
    
    // Read current custom photos for all classes from local storage
    const customMap: Record<string, ClinicalCasePhoto[]> = {};
    ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].forEach((cid) => {
      try {
        const raw = localStorage.getItem(`dental_custom_photos_${cid}`);
        if (raw) customMap[cid] = JSON.parse(raw);
      } catch {}
    });

    const existingForClass = customMap[photo.classId] || [];
    if (!existingForClass.some((p) => p.id === photo.id)) {
      customMap[photo.classId] = [photo, ...existingForClass];
    }

    await setDoc(
      docRef,
      {
        photosMap: customMap,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[ClinicalPhotosCloud] Failed to sync photo to Firestore:', error);
  }
}

/**
 * Deletes a custom photo from Firestore cloud and syncs across subscribers.
 */
export async function deleteClinicalPhotoFromCloud(classId: string, photoId: string): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, CLINICAL_PHOTOS_DOC);

    const customMap: Record<string, ClinicalCasePhoto[]> = {};
    ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].forEach((cid) => {
      try {
        const raw = localStorage.getItem(`dental_custom_photos_${cid}`);
        if (raw) customMap[cid] = JSON.parse(raw);
      } catch {}
    });

    if (customMap[classId]) {
      customMap[classId] = customMap[classId].filter((p) => p.id !== photoId);
    }

    await setDoc(
      docRef,
      {
        photosMap: customMap,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[ClinicalPhotosCloud] Failed to delete photo from Firestore:', error);
  }
}

/**
 * Subscribes to real-time custom clinical photos across all classes.
 * Broadcasts updates to all connected subscriber devices.
 */
export function subscribeToClinicalPhotosCloud(
  onUpdate: (photosMap: Record<string, ClinicalCasePhoto[]>) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, CLINICAL_PHOTOS_DOC);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const photosMap = (data.photosMap || {}) as Record<string, ClinicalCasePhoto[]>;

        // Cache each class locally
        Object.entries(photosMap).forEach(([cid, photos]) => {
          try {
            localStorage.setItem(`dental_custom_photos_${cid}`, JSON.stringify(photos));
          } catch {}
        });

        onUpdate(photosMap);
      }
    },
    (err) => {
      console.warn('[ClinicalPhotosCloud] onSnapshot listener error:', err);
    }
  );

  return unsubscribe;
}

