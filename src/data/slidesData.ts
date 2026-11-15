export interface SlideData {
  id: number;
  slideNumber: number;
  type: 'cover' | 'steps' | 'detail' | 'outro';
  title: string;
  subtitle?: string;
  badge: string;
  theme?: 'dark-olive' | 'light';
  designNote?: string;
  author?: {
    name: string;
    role: string;
    university: string;
  };
  steps?: {
    stepNumber: string;
    title: string;
    subtitle?: string;
    description: string;
    points: string[];
    instruments?: string[];
    tips?: string;
    warning?: string;
    category?: string;
  }[];
  clinicalFocus: string;
  speakerNotes: string;
  actionCallout?: {
    channel: string;
    offer: string;
    details: string;
    keyword: string;
  };
}

export const SLIDES_DATA: SlideData[] = [
  {
    id: 1,
    slideNumber: 1,
    type: 'cover',
    title: 'Class IV Composite Restoration: From A to Z',
    subtitle: 'البروتوكول السريري الشامل لترميم الأسنان الأمامية بدقة واحترافية',
    badge: 'Clinical Protocol Guide | الدليل السريري الأكاديمي',
    author: {
      name: 'حياه نافع فجر',
      role: 'مرحلة رابعة',
      university: 'جامعة المعارف',
    },
    clinicalFocus: 'خطوات متسلسلة ودقيقة للحصول على نتيجة جمالية ووظيفية ممتازة (Shade, Shape & Longevity)',
    speakerNotes: 'مرحبًا بكم في هذا البروتوكول السريري المتكامل لترميم الصنف الرابع Class IV. سنستعرض خطوات متسلسلة مبنية على أحدث أسس طب الأسنان التجميلي والالتصاقي، لضمان ديمومة الترميم وتطابقه التام مع السن الطبيعي.',
  },
  {
    id: 2,
    slideNumber: 2,
    type: 'steps',
    title: 'Step 1 & Step 2: Surface Preparation & Shade Selection',
    subtitle: 'التهيئة الأولية وتحديد اللون بدقة متناهية',
    badge: 'المرحلة التحضيرية السريرية',
    clinicalFocus: 'تحديد اللون قبل الجفاف (Dehydration) والتنظيف الشامل هما سر نجاح الاندماج البصري للترميم.',
    steps: [
      {
        stepNumber: 'Step 1',
        title: 'Scaling & Surface Cleaning',
        subtitle: 'تنظيف السطح وإزالة التكلسات',
        description: 'تنظيف سطح السن المتضرر والأسنان المجاورة بعناية فائقة قبل البدء بأي إجراء سريري.',
        points: [
          'استخدام معجون Pumice خالي من الفلورايد مع Prophy Brush لفرك أسطح الأسنان.',
          'الهدف: إزالة التكلسات، اللويحة الجرثومية (Biofilm) والصبغات السطحية المترسبة.',
          'ضمان اختيار اللون الدقيق (Accurate Shade) والوصول لأعلى قوة ارتباط التصاقي (Bonding Strength).',
        ],
        instruments: ['Pumice Paste (Fluoride-free)', 'Prophy Brush', 'Slow-speed Handpiece', 'Water Jet'],
        tips: 'تجنب استخدام معاجين التلميع الحاوية على الزيوت أو الفلورايد العالي لأنها تقلل من نفاذية الـ Acid Etch.',
      },
      {
        stepNumber: 'Step 2',
        title: 'Accurate Shade Selection',
        subtitle: 'اختيار اللون الصحيح واختبار الكومبوزيت',
        description: 'اختيار اللون الحقيقي للسن قبل حدوث جفاف الميناء نتيجة العزل.',
        points: [
          'بعد التنظيف والشطف، يتم تجفيف السن بلطف (Dry Tooth Surface) دون إفراط.',
          'تقنية Button Try-in: وضع قطرات صغيرة جداً من مختلف الـ Shades على السن المتضرر أو السن المجاور.',
          'إجراء تصلب ضوئي سريع (Quick Light Cure) للقطرات التجريبية لأن لون الكومبوزيت يتغير بعد البلمرة.',
          'اختيار أقرب لون مطابق لكل من العاج (Dentin) والميناء (Enamel) قبل تركيب الـ Rubber Dam لتفادي ظاهرة الجفاف (Dehydration).',
        ],
        instruments: ['Shade Guide (VITA Classical / 3D Master)', 'Composite Shades (Enamel/Dentin)', 'Light Cure Unit', 'Daylight Lamp'],
        warning: 'احذر! تجفيف السن أو عزله لفترة وجيزة يسبب Dehydration، مما يجعل السن يبدو أكثر بياضاً وعتمة ويعطي اختياراً خاطئاً للون.',
      },
    ],
    speakerNotes: 'في هذه الخطوة، ركّز على أهمية الـ Button Try-in. معظم أطباء الأسنان يقعون في فخ الاعتماد فقط على الـ Shade Guide البلاستيكي، بينما وضع نقطة صغيرة وبلمرتها يعطي اللون الحقيقي النهائي.',
  },
  {
    id: 3,
    slideNumber: 3,
    type: 'detail',
    title: 'Step 3: Preparation & Beveling Protocol',
    subtitle: 'بروتوكول التحضير وشطف الحواف (Beveling)',
    badge: 'التحضير الحيوي الميكانيكي',
    clinicalFocus: 'عمل الـ Bevel بزاوية 45° يزيد مساحة الالتصاق ويخفي خط التقاء الحشوة بالسن (Optical Blending).',
    steps: [
      {
        stepNumber: 'Step 3',
        title: 'Preparation & Beveling Protocol',
        subtitle: 'صنع الـ Bevel والتنعيم وإزالة الرواسب',
        description: 'إجراء تحضير دقيق لحواف الميناء الخارجية لتحقيق تدرج لوني انسيابي ومقاومة ميكانيكية فائقة.',
        points: [
          'قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس والكسر فقط (Cavity extension depends strictly on the extent of caries) مع الحفاظ الأقصى على النسج السليمة.',
          'عمل Beveling عند حواف الميناء (Enamel Margins) بزاوية 45 درجة وبعرض يتراوح بين 1.5 إلى 2 ملم.',
          'التحضير الأولي والـ Bevel: تورباين مزود بـ Blue Coded Diamond Bur للحصول على القطع المطلوب.',
          'تنعيم الحواف وإزالة الأطراف الحادة: استخدام تورباين بـ Yellow Coded Diamond Bur لنعومة قصوى للحواف.',
          'إعادة التنظيف الشامل: غسل وتنظيف السن تماماً بالماء والهواء لضمان التخلص من بقايا التحضير والغبار المتبقي (Debris).',
        ],
        instruments: [
          'Turbine / High-speed Handpiece',
          'Blue Coded Diamond Bur (Primary Bevel & Prep)',
          'Yellow Coded Diamond Bur (Smoothing & Finishing)',
          'Air/Water Syringe',
        ],
        tips: 'الـ Infinite Bevel أو الـ Starburst Bevel على الوجه الأمامي (Facial Surface) يكسر ارتداد الضوء ويجعل الفاصل بين السن والكومبوزيت غير مرئي إطلاقاً.',
      },
    ],
    speakerNotes: 'الـ Beveling ليس فقط لزيادة قوة الالتصاق بمضاعفة عدد قنيات الميناء المكشوفة، بل هو السر الأكبر في إخفاء الخط الفاصل بين الحشوة والسن ومنع ظهور الـ White Line.',
  },
  {
    id: 4,
    slideNumber: 4,
    type: 'detail',
    title: 'Step 4: Complete Isolation (Rubber Dam)',
    subtitle: 'العزل الكامل بحاجز المطاط لضمان النجاح السريري',
    badge: 'العزل والتحكم بالرطوبة',
    clinicalFocus: 'العزل الأمامي المتعدد هو المعيار الذهبي لتقييم التناظر (Symmetry) والبروفايل مع السن المقابل.',
    steps: [
      {
        stepNumber: 'Step 4',
        title: 'Rubber Dam Complete Isolation',
        subtitle: 'بروتوكول العزل السليم للحالات الأمامية',
        description: 'منع وصول اللعاب وبخار التنفس إلى موقع الترميم لضمان أقصى كفاءة للمواد اللاصقة.',
        points: [
          'الخيار الأول (Quadrant Isolation): العزل من الضاحك الأول الأيمن إلى الضاحك الأول الأيسر (1st Premolar Right to 1st Premolar Left).',
          'الكلمبات المستخدمة في الخيار الأول: كلمبات شركة روتر (Rotter) بالأرقام المعتمدة: 00, 0, 1, 2.',
          'الخيار الثاني (Anterior Isolation): عزل السنترالات باستخدام كلمبات مخصصة مثل Clamps رقم 212 أو 213 (Gingival Retractor Clamps).',
        ],
        warning: '⚠️ ملاحظة سريرية حرجة: تجنب عزل سن واحد فقط (Single Tooth Isolation) في الحالات الأمامية (Class IV) لضمان رؤية ومقارنة الـ Shade والـ Contour والـ Symmetry مع باقي الأسنان المجاورة والسن المقابل!',
        instruments: [
          'Heavy or Medium Latex/Non-latex Rubber Dam Sheet',
          'Rubber Dam Punch & Forceps',
          'Rotter Clamps (#00, #0, #1, #2)',
          'Butterfly Clamps (#212, #213)',
          'Dental Floss / Wedges for Inversion',
        ],
      },
    ],
    speakerNotes: 'في ترميم الأسنان الأمامية، لا يجوز حصر الرؤية بسن واحد. عزل القوس من الضاحك إلى الضاحك يعطي الطبيب رؤية بانورامية لخط الابتسامة ومحور السن والتناظر مع السن المقابل.',
  },
  {
    id: 5,
    slideNumber: 5,
    type: 'steps',
    title: 'Step 5 (Part 1): Adhesive Protocol & Palatal Shell',
    subtitle: 'البروتوكول الالتصاقي وبناء الجدار الحنكي',
    badge: 'المرحلة الالتصاقية والمعمارية',
    clinicalFocus: 'بناء الـ Palatal Shell بالـ Flowable Composite يحوّل الحالة من Class IV معقدة إلى تجويف مسنود يشبه Class III.',
    steps: [
      {
        stepNumber: 'Step 5 - A',
        title: 'Acid Etching Protocol',
        subtitle: 'التخريش الحمضي الانتقائي والمنضبط بالوقت',
        description: 'استخدام حمض الفوسفوريك 37% لخلق مسامات مجهرية ترتبط ميكانيكياً بالمادة اللاصقة.',
        points: [
          'تطبيق الـ Acid Etch على الميناء (Enamel) لمدة 15 إلى 20 ثانية.',
          'تطبيق الـ Acid Etch على العاج (Dentin) لمدة 10 ثوانٍ فقط لمنع فرط التخريش أو حساسية ما بعد العلاج.',
          'الشطف الغزير بالماء لنفس مدة التخريش، ثم التجفيف اللطيف دون تجفيف مفرط للعاج (Leave Dentin slightly moist).',
        ],
        instruments: ['37% Phosphoric Acid Gel', 'Suction & Air/Water Syringe', 'Micro-applicator'],
        tips: 'العاج الرطب قليلاً (Wet Bonding) يمنع انكماش ألياف الكولاجين، مما يضمن تغلغل المونومر اللاصق بشكل كامل.',
      },
      {
        stepNumber: 'Step 5 - B & C',
        title: 'Bonding Agent & Palatal Shell Creation',
        subtitle: 'وضع المادة اللاصقة وبناء الجدار الخلفي',
        description: 'تطبيق الرابط الالتصاقي وإنشاء دعامة حنكية صلبة للطبقات اللاحقة.',
        points: [
          'Bonding Agent: تطبيق الـ Bond وتدليكه بنشاط (Active Rubbing) لمدة 20 ثانية ليتغلغل في قنيات العاج.',
          'التجفيف بالهواء اللطيف لمدة 5 ثوانٍ لتبخير المذيب (Solvent Evaporation) حتى يصبح السطح لامعاً وغير متحرك.',
          'عمل تصلب ضوئي (Light Cure) وفق تعليمات الشركة المصنعة.',
          'Palatal Shell Creation: استخدام الـ Celluloid Strip / Mylar Strip أو Matrix مع قطرة صغيرة من الـ Flowable Composite لبناء الجدار الخلفي (Palatal Wall) ودعمه بالـ Light Cure.',
        ],
        instruments: ['Universal Bonding Agent', 'Mylar Strip / Celluloid Strip', 'Flowable Composite', 'High-power Curing Light'],
      },
    ],
    speakerNotes: 'إنشاء الجدار الحنكي (Palatal Shell) هو نقطة التحول في الحالة. بمجرد وجود هذا الجدار الرقيق، تصبح إضافة الـ Dentin والـ Enamel عملية دقيقة ومحكمة بدون هدر أو انسكاب المادة نحو الحنك.',
  },
  {
    id: 6,
    slideNumber: 6,
    type: 'steps',
    title: 'Step 5 (Part 2): Layering Techniques & Anatomy',
    subtitle: 'بناء الحواف الملاصقة والطبقات التشريحية (Dentin & Enamel)',
    badge: 'النحت التشريحي المجهري',
    clinicalFocus: 'محاكاة التشريح الطبيعي: بناء الماميلونات (Mamelons) بالعاج، ثم تغطية شفافة بميناء طبيعي يعبر الضوء.',
    steps: [
      {
        stepNumber: 'Step 5 - D',
        title: 'Proximal Margins Restoration',
        subtitle: 'بناء الجدار الملاصق ونقطة التماس',
        description: 'استعادة الجدار الملاصق والكونتاكت بوينت الصحيحة هندسياً وتجميلياً.',
        points: [
          'بناء الـ Mesial أو Distal Margin باستخدام Sectional Matrix Band مسبقة الانحناء.',
          'استخدام قطرة صغيرة من الـ Flowable Composite أو Packable Composite لبناء الحافة الملاصقة بدقة.',
          'تأكيد تشكيل الـ Contact Point والـ Contact Area في الثلث الإطباقي/الوسطي.',
        ],
        instruments: ['Sectional Matrix Band', 'Wedge (Wooden or Plastic)', 'Gingival Contouring Instrument'],
      },
      {
        stepNumber: 'Step 5 - E & F',
        title: 'Dentin & Enamel Layering',
        subtitle: 'طبقة العاج والماميلونات وطبقة الميناء النهائية',
        description: 'تطبيق تقنية الطبقات المتعددة (Stratification Technique) لمنح السن حيوية وعمقاً ثلاثي الأبعاد.',
        points: [
          'Dentin Layering: تطبيق طبقة الـ Dentin باستخدام الكومبوزيت العاتم (مثل Tokuyama - A2 Shade أو ما يماثله).',
          'نحت الـ Mamelons الثلاثية بدقة وإعطاء العمق اللوني الطبيعي للسن مع ترك مساحة 0.5 ملم للميناء.',
          'Enamel Layering: إضافة طبقة الـ Enamel النهائية ذات الشفافية العالية بالكومبوزيت لترميم السطح الخارجي وتغطية الـ Bevel بسلاسة فائقة.',
        ],
        instruments: ['Tokuyama Composite (A2 Dentin / Enamel)', 'Composite Modeling Instruments / Brush', 'IPC Carver', 'Light Cure Unit'],
        tips: 'لا تملأ التجويف بالكامل بطبقة العاج؛ اترك مساحة محسوبة لطبقة الميناء لتجنب ظهور السن بمظهر معتم (Chalky / Opaque).',
      },
    ],
    speakerNotes: 'سر جمال الأسنان الأمامية يكمن في الشفافية الإنسالية (Incisal Translucency) والماميلونات. نحت الـ Mamelons في طبقة الـ Dentin يمنح السن حيوية ثلاثية الأبعاد لا يمكن الحصول عليها بطبقة لونية واحدة.',
  },
  {
    id: 7,
    slideNumber: 7,
    type: 'steps',
    title: 'Step 6: Finishing & Polishing Protocol',
    subtitle: 'بروتوكول الإنهاء والتلميع وعزل الأكسجين',
    badge: 'اللمسات النهائية واللمعان السريري',
    clinicalFocus: 'عزل الأكسجين بالـ Glycerin Gel يمنع طبقة التثبيط ويحمي الترميم من التصبغ المستقبلي على المدى الطويل.',
    steps: [
      {
        stepNumber: 'Step 6 - A',
        title: 'Oxygen Barrier Gel (خطوة إضافية / اختيارية)',
        subtitle: 'عزل الأكسجين لضمان التصلب السطحي الأقصى',
        description: 'التغلب على طبقة تثبيط الأكسجين (Oxygen Inhibition Layer) على السطح الخارجي.',
        points: [
          'وضع طبقة بسيطة من الـ Glycerin Gel (Air Barrier) على السطح الخارجي للكومبوزيت قبل ضربة الـ Light Cure الأخيرة.',
          'السبب العلمي: لعزل الأكسجين الجوي وتأمين بلمرة كاملة 100% للسطح الخارجي للكومبوزيت.',
          'النتيجة السريرية: تقليل ومنع تصبغات الحشوة (Stain Resistance) وزيادة قساوة السطح على المدى البعيد. (يمكن الاستغناء عنها والاكتفاء بالإنهاء).',
        ],
        instruments: ['Glycerin Gel / DeOx Gel', 'Light Cure Unit', 'Water Spray for rinsing'],
      },
      {
        stepNumber: 'Step 6 - B & C',
        title: 'Finishing & Polishing Protocols',
        subtitle: 'نحت التفاصيل السطحية والتلميع العالي',
        description: 'إعادة رسم الخطوط التشريحية (Developmental Grooves) وإكساب السن لمعاناً طبيعياً يحاكي الميناء.',
        points: [
          'Facial Surface Finishing: استخدام بيرات الفنشنغ للتورباين (Yellow & Red Fine Diamond Burs) لتشكيل الملامح الأساسية.',
          'Proximal Margins Finishing: استخدام أشرطة الـ Finishing Strips لتنعيم المناطق الملاصقة وحماية اللثة.',
          'Embrasures & Edges: استخدام أقراص الـ Finishing Discs (مثل Sof-Lex) لتنعيم ورسم الحواف الإنسالية والزوايا بدقة.',
          'Polishing Protocol (اختياري/احترافي): استخدام بيرات البولشنغ الخاصة بالـ Handpiece، وتطبيق معجون التلميع بالألماس (Diamond Polishing Paste) للحصول على لمعان طبيعي زجاجي عالي الجودة (High-Gloss Finish).',
        ],
        instruments: [
          'Yellow & Red Fine Diamond Burs',
          'Abrasive Finishing Strips',
          'Flexible Finishing Discs (Coarse to Super Fine)',
          'Silicone Polishing Points & Cups',
          'Diamond Polishing Paste (1µm & 0.5µm)',
          'Goat Hair Brush / Felt Wheel',
        ],
      },
    ],
    speakerNotes: 'التلميع ليس فقط لإعطاء مظهر براق؛ السطح فائق النعومة (Ultra-smooth surface) يمنع التصاق البلاك والصبغات ويحمي اللثة الحفافية من الالتهاب المزمن.',
  },
  {
    id: 8,
    slideNumber: 8,
    type: 'outro',
    title: 'Mastering Anterior Restorations 💎✨',
    subtitle: 'إتقان حشوات الصنف الرابع الأمامية وتطوير المهارات السريرية',
    badge: 'الخاتمة والتواصل الأكاديمي',
    clinicalFocus: 'بهذا البروتوكول المتكامل خطوة بخطوة، تصبح حالة الـ Class IV مضمونة النتائج من حيث القوة، الجمالية، والاندماج الطبيعي مع باقي الأسنان!',
    author: {
      name: 'حياه نافع فجر',
      role: 'مرحلة رابعة',
      university: 'جامعة المعارف',
    },
    actionCallout: {
      channel: 't.me/hay_a_2',
      offer: 'حساب التواصل الأكاديمي والاستفسارات السريرية',
      details: 'للتواصل ومناقشة الحالات السريرية وتبادل الملاحظات الأكاديمية، يسعدني تواصلكم عبر حساب التليجرام الخاص.',
      keyword: '@hay_a_2',
    },
    speakerNotes: 'شكراً لكم. للتواصل والاستفسارات السريرية ومناقشة الحالات الأكاديمية، يسعدني تواصلكم عبر حساب التليجرام t.me/hay_a_2.',
  },
];
