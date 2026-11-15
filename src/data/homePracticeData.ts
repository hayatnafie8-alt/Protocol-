export interface HomePracticeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  keyMistakeToAvoid: string;
  imageUrl?: string;
}

export interface HomePracticeExercise {
  id: string;
  title: string;
  category: 'suturing' | 'typodont' | 'anatomy_carving' | 'rubber_dam' | 'wire_bending' | 'ergonomics';
  categoryLabel: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  estimatedTime: string;
  requiredTools: string[];
  objective: string;
  steps: HomePracticeStep[];
  clinicalEvaluationCriteria: string[];
  authorNotes: string;
  images: {
    url: string;
    caption: string;
  }[];
  isCustom?: boolean;
  dateAdded?: string;
}

export const HOME_PRACTICE_CATEGORIES: { id: HomePracticeExercise['category']; label: string; labelEn: string }[] = [
  { id: 'suturing', label: 'الخياطة الجراحية وعقد الخيوط', labelEn: 'Surgical Suturing & Knot Tying' },
  { id: 'typodont', label: 'حفر الكافيتي على موديل الأسنان (Typodont)', labelEn: 'Typodont Cavity Preparation' },
  { id: 'anatomy_carving', label: 'النحت والتشريح الإطباقي للكومبوزيت', labelEn: 'Composite Carving & Occlusal Anatomy' },
  { id: 'rubber_dam', label: 'عزل الرابر دام والتحكم بالرطوبة', labelEn: 'Rubber Dam Isolation & Moisture Control' },
  { id: 'wire_bending', label: 'ثني الأسلاك والأجهزة التقويمية', labelEn: 'Orthodontic Wire Bending' },
  { id: 'ergonomics', label: 'الوضعية السريرية السليمة (Ergonomics)', labelEn: 'Clinical Ergonomics & Posture' },
];

export const INITIAL_HOME_PRACTICE: HomePracticeExercise[] = [
  {
    id: 'hp-1',
    title: 'تدريب الخياطة الجراحية المتقطعة والمراتب (Suturing & Knot Tying on Silicone Pad)',
    category: 'suturing',
    categoryLabel: 'الخياطة الجراحية وعقد الخيوط',
    difficulty: 'مبتدئ',
    estimatedTime: '30 دقيقة',
    requiredTools: [
      'لوح سيليكون مخصص للتدريب الجراحي (أو قشرة موز ناضجة)',
      'حامل إبرة جراحي (Needle Holder - Mayo-Hegar or Crile-Wood)',
      'ملقط أنسجة مسنن دقيق (Tissue Forceps / Adson Forceps)',
      'مقص جراحي دقيق (Iris / Dean Scissors)',
      'خيط حرير 3-0 أو 4-0 مع إبرة مقطعية عكسية (Reverse Cutting Needle)',
    ],
    objective: 'إتقان مسك حامل الإبرة والتحكم بزاوية الدخول 90 درجة وعمل عقدة الجراح المزدوجة المحكمة (Surgeon\'s Knot) بدون تمزيق الحواف.',
    authorNotes: 'نصيحة د. حياة: التدريب المنزلي اليومي لمدة 15 دقيقة على قشرة الموز أو لوح السيليكون ينقل يدك من التردد إلى الثقة التامة في العيادة الجراحية.',
    steps: [
      {
        stepNumber: 1,
        title: 'القبضة السليمة لحامل الإبرة وتثبيت الإبرة',
        instruction: 'امسك حامل الإبرة بحيث يستقر الإصبع الرابع في الحلقة السفلية والإبهام في العلوية، والسبابة ممتدة على طول جسم الأداة لتوجيه دقيق. ثبّت الإبرة عند ثلثيها من رأس الإبرة وبزاوية 90 درجة.',
        keyMistakeToAvoid: 'تجنب إدخال الأصابع بعمق في الحلقات لأن ذلك يحد من حركة المعصم الانسيابية ويزيد الارتجاف.',
      },
      {
        stepNumber: 2,
        title: 'اختراق الحافة الأولى بزاوية عمودية 90°',
        instruction: 'ارفع حافة النسيج بلطف بالملقط المسنن، وأدخل الإبرة بزاوية قائمة تماماً 90 درجة على بعد 2-3 ملم من حافة الجرح، واتبع انحناء الإبرة الدوراني.',
        keyMistakeToAvoid: 'الدفع المستقيم بدلاً من الدوران مع قوس الإبرة يؤدي لتمزق الحافة وتخرب النسيج.',
      },
      {
        stepNumber: 3,
        title: 'اختراق الحافة المقابلة بالعمق المتناظر',
        instruction: 'أعد التقاط الإبرة من قاع الجرح وأدخلها في الحافة المقابلة من الداخل إلى الخارج بنفس المسافة (2-3 ملم) لضمان حواف متطابقة الارتفاع.',
        keyMistakeToAvoid: 'عدم تناظر المسافة بين الطرفين يسبب التفاف الحواف وتأخر الشفاء.',
      },
      {
        stepNumber: 4,
        title: 'عقدة الجراح المحكمة (Surgeon\'s Knot: 2-1-1)',
        instruction: 'ضع حامل الإبرة بين طرفي الخيط، لف الخيط مرتين حول فك حامل الإبرة والتقط الطرف القصير واسحبه برفق حتى تلتقي الحواف دون شد مفرط، ثم لف لفة واحدة بالاتجاه المعاكس لتثبيت العقدة.',
        keyMistakeToAvoid: 'الشد الزائد المفرط يسبب فقر دم حفافي (Ischemia) وتنخر النسيج حول الغرزة.',
      },
      {
        stepNumber: 5,
        title: 'إزاحة العقدة جانباً والقص',
        instruction: 'اسحب العقدة إلى أحد جانبي الشق الجراحي (وليس فوق خط الجرح مباشرة)، وقص أطراف الخيط مع إبقاء ذيل بطول 3-4 ملم لتسهيل إزالته لاحقاً.',
        keyMistakeToAvoid: 'ترك العقدة فوق خط الجرح مباشرة يسبب تخريشاً وتجمعاً للبكتيريا على حواف الشفاء.',
      },
    ],
    clinicalEvaluationCriteria: [
      'حواف الجرح متقابلة بدقة (Everted edges) وليست منطوية للداخل (Inverted).',
      'العقدة موضوعة على جانب خط الجرح وليس فوقه.',
      'طول ذيل الخيط المتبقي متناسق بين 3-4 ملم.',
      'عدم وجود أي تمزق أو شد مفرط في قشرة الموز أو لوح السيليكون.',
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
        caption: 'طقم أدوات الخياطة الجراحية والإبرة المقطعية للتدريب المنزلي',
      },
      {
        url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
        caption: 'خطوات إحكام عقدة الجراح وتثبيت الحواف على لوح التدريب',
      },
    ],
  },
  {
    id: 'hp-2',
    title: 'تدريب كلاس 2 الملاصق وتحويله إلى كلاس 1 (Class II Proximal Box to Class I Conversion)',
    category: 'typodont',
    categoryLabel: 'حفر الكافيتي على موديل الأسنان (Typodont)',
    difficulty: 'متوسط',
    estimatedTime: '45 دقيقة',
    requiredTools: [
      'موديل أسنان تعليمي للتدريب (Frasaco or Nissin Typodont)',
      'سنبلة كمثرية #245 وسنبلة كروية صغيرة #1/2 أو #1',
      'إسفين خشبي مثلث وحلقة مباعدة (Wedge & Separator Ring)',
      'ماتريكس جزئية منحنية تشريحياً (Sectional Matrix Band)',
      'حشوة كومبوزيت تكديسي وكومبوزيت انسيابي (Packable & Flowable)',
      'جهاز تصليب ضوئي مع نظارة حماية (Light Curing Unit)',
    ],
    objective: 'إتقان حفر الصندوق الملاصق دون لمس السن المجاور، وتطبيق المصفوفة الجزئية لإنتاج نقطة تماس طبيعية محكمة (Tight Contact Point).',
    authorNotes: 'حلقة الفصل (Separator Ring) تباعد الأسنان بمقدار ميكروني يعوض سماكة الماتريكس ويضمن صوت Snap المميز عند تمرير الخيط الطبي.',
    steps: [
      {
        stepNumber: 1,
        title: 'الوصول الإطباقي والتحضير المحافظ',
        instruction: 'ابدأ بالسنبلة #245 في الشق المركزي باتجاه السطح الملاصق مع الحفاظ على حافة رقيقة من الميناء كدرع حماية (Enamel Shell) للسن المجاور.',
        keyMistakeToAvoid: 'الاحتكاك بالسن المجاور أثناء الحفر هو الخطأ الأكثر شيوعاً ويكلف خسارة نقطة التقييم.',
      },
      {
        stepNumber: 2,
        title: 'إسقاط الصندوق الملاصق (Drop the Proximal Box)',
        instruction: 'وجه السنبلة عمودياً نحو اللثة لإسقاط الصندوق الملاصق حتى إزالة نقطة التماس مع السن المجاور بمسافة 0.5 ملم لتمرير طرف المسبار بحرية.',
        keyMistakeToAvoid: 'عدم فتح المسافة اللثوية (Gingival clearance) يمنع استقرار الماتريكس والإسفين بإحكام.',
      },
      {
        stepNumber: 3,
        title: 'تركيب الماتريكس والإسفين وحلقة المباعدة',
        instruction: 'ضع الماتريكس الجزئية المنحنية، ثبّتها بالإسفين الخشبي من الجانب الأوسع (غالباً اللساني)، وضع أرجل حلقة المباعدة فوق الإسفين مباشرة.',
        keyMistakeToAvoid: 'وضع أرجل الحلقة قبل الإسفين يسبب انزياح الماتريكس وتشوه شكل الجدار الملاصق.',
      },
      {
        stepNumber: 4,
        title: 'بناء الجدار الملاصق وتحويل الكافيتي لكلاس 1',
        instruction: 'ضع طبقة رقيقة من الفلوابل على قاع الصندوق الملاصق وبلمرها، ثم ابنِ الجدار الملاصق (Marginal Ridge) بكومبوزيت عالي الكثافة بسماكة 1 ملم حتى مستوى الحافة الحدية المجاورة ثم بلمر.',
        keyMistakeToAvoid: 'رفع الجدار الملاصق أعلى من السن المجاور يؤدي لكسره فور إطباق المريض.',
      },
      {
        stepNumber: 5,
        title: 'إزالة الحلقة والماتريكس وإكمال الحشو',
        instruction: 'أزل حلقة المباعدة والماتريكس، فتحولت الحالة الآن إلى كلاس 1 بسيط يسهل حشوه وتشكيل حدباته المائلة طبقة تلو الأخرى.',
        keyMistakeToAvoid: 'إزالة الإسفين قبل بلمرة الجدار الملاصق قد يسبب تشوهه بحركة مفاجئة.',
      },
    ],
    clinicalEvaluationCriteria: [
      'نقطة التماس محكمة مع السن المجاور (صوت Snap عند إدخال خيط الأسنان).',
      'الحافة الحدية بنفس ارتفاع السن المجاور ومتصلة بانسيابية.',
      'عدم وجود أي زوائد كومبوزيت (Overhang) عند الحافة اللثوية.',
      'سلامة السن المجاور التامة من أي خدوش أو تلف بالسنبلة.',
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
        caption: 'تثبيت نظام الماتريكس الجزئي وحلقة المباعدة على موديل الأسنان',
      },
      {
        url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
        caption: 'النتيجة بعد بناء الجدار الملاصق والتشريح الإطباقي',
      },
    ],
  },
  {
    id: 'hp-3',
    title: 'تدريب النحت التشريحي للحدبات وتلوين الشقوق بالبيت (Anatomical Carving & Fissure Staining)',
    category: 'anatomy_carving',
    categoryLabel: 'النحت والتشريح الإطباقي للكومبوزيت',
    difficulty: 'متقدم',
    estimatedTime: '40 دقيقة',
    requiredTools: [
      'أداة نحت الكومبوزيت الدقيقة (LM-Arte Fissura & Applica / Composite Carver)',
      'فرشاة صغيرة ذات شعر ناعم مدبب (Micro-brush or Endodontic file #08)',
      'صبغة الشقوق بلون بني طبيعي (Brown/Ochre Composite Tint)',
      'كومبوزيت بلون الميناء والعاج (Body & Enamel Shading)',
      'جل جلسرين عازل للهواء (Glycerin Barrier Gel)',
    ],
    objective: 'بناء الحدبات الإطباقية تشريحياً حدبة تلو الأخرى (Cusp-by-Cusp Technique) ومحاكاة ميازيب السن الطبيعية وتلوينها باحترافية.',
    authorNotes: 'نحت الكومبوزيت قبل البلمرة يختصر 80% من وقت التعديل والتنعيم بالسنابل ويحافظ على بنية الميناء المحيطة.',
    steps: [
      {
        stepNumber: 1,
        title: 'تحديد قمم الحدبات واتجاه الميازيب',
        instruction: 'قبل وضع الكومبوزيت، تذكر موقع قمة كل حدبة (Cusp Tip) والميزاب المركزي والميازيب الميزانية والفرعية.',
        keyMistakeToAvoid: 'وضع كتلة كومبوزيت واحدة مسطحة ومحاولة حفرها بالسنابل بعد التصلب ينتج حشوة باهتة بدون حيوية.',
      },
      {
        stepNumber: 2,
        title: 'البناء المثلثي المائل (Oblique Triangular Layering)',
        instruction: 'ضع مثلثاً صغيراً من الكومبوزيت لبناء الحدبة الإنسية الحنكية/الدهليزية، واضغطها باتجاه جدار السن، وبلمرها منفصلة لمدة 20 ثانية.',
        keyMistakeToAvoid: 'ربط حدبتين متقابلتين في كتلة واحدة يزيد معامل الانكماش التصلبي (C-Factor) ويسبب حساسية ما بعد العلاج.',
      },
      {
        stepNumber: 3,
        title: 'رسم الميازيب بأداة LM Fissura',
        instruction: 'استخدم الرأس الحاد لأداة النحت المبللة بقطرة ضئيلة جداً من الراتنج لتحديد الميازيب الرئيسية بين الحدبات المتجاورة بحركة انسيابية.',
        keyMistakeToAvoid: 'استخدام كمية كبيرة من البوند أثناء النحت يضعف قوة الكومبوزيت ويسبب اصفرار الحواف.',
      },
      {
        stepNumber: 4,
        title: 'تلوين الشقوق العميقة (Fissure Staining)',
        instruction: 'ضع نقطة مجهرية من الصبغة البنية في عمق الميازيب المركزية باستخدام رأس فايل #08 رفيع، ثم امسح الزائد بفرشاة جافة لإبقاء اللون فقط في قاع الميزاب.',
        keyMistakeToAvoid: 'المبالغة في كمية الصبغة يجعل السن يبدو كأنه مصاب بتسوس جديد بدلاً من مظهر طبيعي واقعي.',
      },
      {
        stepNumber: 5,
        title: 'البلمرة النهائية تحت جل الجلسرين',
        instruction: 'غطِّ كامل السطح الإطباقي بطبقة من جل الجلسرين الشفاف لمنع الأكسجين الجوي، ثم بلمر لمدة 40 ثانية لإزالة طبقة التثبيط غير المتصلبة.',
        keyMistakeToAvoid: 'إهمال الجلسرين يترك طبقة رخوة غير مبلمرة على السطح تفقد لمعانها وتتصبغ بسرعة.',
      },
    ],
    clinicalEvaluationCriteria: [
      'الحدبات متدرجة الارتفاع وتماثل تشريح السن السليم المجاور.',
      'الميازيب عميقة بانسيابية دون وجود حواف حادة تعيق حركة الفك.',
      'الصبغة محصورة في قاع الميازيب وتمنح عمقاً ثلاثي الأبعاد.',
      'السطح أملس وعالي اللمعان بعد إزالة الجلسرين والتلميع النهائي.',
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80',
        caption: 'خطوات النحت الدقيق للميازيب الإطباقية بواسطة أدوات التشكيل',
      },
      {
        url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80',
        caption: 'المظهر النهائي بعد تلوين الشقوق والتلميع تحت جل الجلسرين',
      },
    ],
  },
  {
    id: 'hp-4',
    title: 'تحدي عزل الرابر دام السريع في 120 ثانية (Rubber Dam Rapid Isolation Challenge)',
    category: 'rubber_dam',
    categoryLabel: 'عزل الرابر دام والتحكم بالرطوبة',
    difficulty: 'مبتدئ',
    estimatedTime: '25 دقيقة',
    requiredTools: [
      'لوح مطاطي رابر دام متوسط أو ثقيل (Medium / Heavy Rubber Dam Sheet)',
      'مشبك أسنان مناسب (Clamp #W8A, #W3, #W2, #212)',
      'ملقط تثبيت المشبك (Rubber Dam Forceps)',
      'خرامة الرابر دام (Rubber Dam Punch)',
      'إطار الحفظ المعدني أو البلاستيكي (Young Frame)',
      'خيط تنظيف شمعي لربط المشبك للأمان (Waxed Dental Floss)',
    ],
    objective: 'تحقيق عزل جاف تماماً للسن المستهدف خلال دقيقتين مع ربط خيط الأمان وتطبيق القلب اللثوي (Inversion) لمنع تسرب اللعاب.',
    authorNotes: 'ربط خيط الأمان بالمشبك قاعدة ذهبية لا استثناء فيها لحماية المريض من أي ابتلاع أو استنشاق عرضي للمشبك.',
    steps: [
      {
        stepNumber: 1,
        title: 'ربط خيط الأمان حول قوس المشبك',
        instruction: 'اربط خيط أسنان شمعي بطول 30 سم حول قوس المشبك (Bow) بإحكام ودع طرفيه للخارج دائماً قبل إدخاله في فم المريض.',
        keyMistakeToAvoid: 'إدخال مشبك بدون خيط أمان يعتبر خطأ سريرياً خطيراً يهدد سلامة المجرى التنفسي.',
      },
      {
        stepNumber: 2,
        title: 'تثقيب الورقة بالقطر المناسب',
        instruction: 'اختر الثقب رقم 4 للطواحن أو رقم 3 للضواحك أو رقم 2 للأماميات، وتأكد من قطع دائرة كاملة نظيفة بدون أي تشظي أو تمزق حفافي.',
        keyMistakeToAvoid: 'وجود شق ميكروي في حافة الثقب يسبب تمزق الورقة فور تمددها على السن.',
      },
      {
        stepNumber: 3,
        title: 'طريقة المشبك والورقة معاً (Clamp & Dam Simultaneous)',
        instruction: 'مرر أجنحة المشبك في ثقب المطاط ثم ثبّت المشبك بالملقط، وانزله برفق تحت أعظم انتفاخ للسن (Below the height of contour).',
        keyMistakeToAvoid: 'ارتكاز أقدام المشبك على اللثة الرخوة بدلاً من سطح السن الصلب يسبب ألماً ونزيفاً للمريض.',
      },
      {
        stepNumber: 4,
        title: 'تحرير المطاط من أجنحة المشبك',
        instruction: 'باستخدام أداة كاشطة أو مسبار، حرر المطاط من فوق أجنحة المشبك لينزلق محيطاً بعنق السن بالكامل.',
        keyMistakeToAvoid: 'استخدام أداة حادة جداً قد يثقب ورقة الرابر دام ويلغي العزل.',
      },
      {
        stepNumber: 5,
        title: 'قلب حواف المطاط لثوياً (Gingival Inversion)',
        instruction: 'انفخ هواءً خفيفاً حول عنق السن وادفع حواف المطاط بلطف للداخل بواسطة خيط الأسنان أو أداة رقيقة لتشكيل ختم محكم ضد السوائل.',
        keyMistakeToAvoid: 'إهمال خطوة القلب (Inversion) يسمح بتسرب الرطوبة واللعاب تحت الضغط الإيجابي.',
      },
    ],
    clinicalEvaluationCriteria: [
      'العزل تام وجاف تماماً بدون أي تسريب رطوبة.',
      'المشبك ثابت في أربع نقاط اتصال صلبة على عنق السن.',
      'خيط الأمان مربوط بوضوح وممتد خارج الفم.',
      'المطاط مقلوب نحو الداخل (Inverted) حول عنق السن السريري.',
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
        caption: 'خطوات عزل السن بالرابر دام والتثبيت الدقيق للمشبك',
      },
    ],
  },
];

const HP_STORAGE_KEY = 'dental_home_practice_store_v1';

export function getHomePractices(): HomePracticeExercise[] {
  try {
    const raw = localStorage.getItem(HP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_HOME_PRACTICE;
}

export function saveHomePractices(items: HomePracticeExercise[]): void {
  try {
    localStorage.setItem(HP_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function addHomePractice(item: Omit<HomePracticeExercise, 'id' | 'dateAdded'>): HomePracticeExercise {
  const current = getHomePractices();
  const created: HomePracticeExercise = {
    ...item,
    id: 'hp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    dateAdded: new Date().toISOString().split('T')[0],
    isCustom: true,
  };
  const updated = [created, ...current];
  saveHomePractices(updated);
  return created;
}

export function updateHomePractice(id: string, updates: Partial<HomePracticeExercise>): HomePracticeExercise[] {
  const current = getHomePractices();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveHomePractices(updated);
  return updated;
}

export function deleteHomePractice(id: string): HomePracticeExercise[] {
  const current = getHomePractices();
  const filtered = current.filter((p) => p.id !== id);
  saveHomePractices(filtered);
  return filtered;
}

export function resetHomePractices(): HomePracticeExercise[] {
  saveHomePractices(INITIAL_HOME_PRACTICE);
  return INITIAL_HOME_PRACTICE;
}
