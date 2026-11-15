/**
 * Clinical Checklist System for Composite Restorations (Class I to Class V)
 * Designed for chairside clinical guidance, student competency tracking, and protocol adherence.
 */

export interface ClinicalChecklistItem {
  id: string;
  stepNumber: number;
  phase: 'preparation' | 'isolation' | 'bonding' | 'layering' | 'finishing';
  phaseTitle: string;
  title: string;
  titleEn: string;
  description: string;
  criticalWarning?: string;
  recommendedInstruments?: string[];
  isKeyCheck: boolean;
}

export interface ClassClinicalChecklist {
  classId: string;
  classCode: string;
  arabicName: string;
  summary: string;
  items: ClinicalChecklistItem[];
}

export const CLASS_1_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: 'c1-step-1',
    stepNumber: 1,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: الفحص المسبق وتحديد اللون',
    title: 'تحديد نقاط الإطباق المسبقة (Pre-op Occlusal Check)',
    titleEn: 'Pre-operative Occlusal Contacts Marking',
    description: 'فحص الإطباق باستخدام Articulating Paper (40µm) قبل التحضير والتخدير لتحديد نقاط التماس الإطباقية المركزية وتفادي وضع حواف الترميم فوقها مباشرة.',
    criticalWarning: 'احرص على ألا تنتهي حافة الكافتي الإطباقية على نقطة تماس إطباقية مباشرة لتجنب كسر الترميم أو فشل الالتصاق.',
    recommendedInstruments: ['Articulating Paper (40µm)', 'Miller Forceps', 'Mouth Mirror'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-2',
    stepNumber: 2,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: الفحص المسبق وتحديد اللون',
    title: 'اختيار اللون وهو رطب وتنظيف السطح',
    titleEn: 'Wet Shade Selection & Prophylaxis',
    description: 'تنظيف السطح بمعجون Pumice خالي من الفلورايد، واختيار لون العاج والميناء والسن رطب قبل تركيب الربر دام (لتفادي خطأ الجفاف Dehydration).',
    criticalWarning: 'جفاف الميناء بعد العزل يجعله أفتح بياضاً بمقدار درجتين (Chalky White)، مما يؤدي لاختيار لون خاطئ تماماً.',
    recommendedInstruments: ['Pumice Paste (Fluoride-free)', 'Prophy Brush', 'VITA Classical Shade Guide'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-3',
    stepNumber: 3,
    phase: 'isolation',
    phaseTitle: 'المرحلة 2: العزل التام بالربر دام',
    title: 'تركيب الربر دام والتأكد من الانقلاب اللثوي (Inversion)',
    titleEn: 'Rubber Dam Isolation & Floss Ligature',
    description: 'تطبيق حاجز الربر دام واختيار Clamp مناسب للضرس المعني (مثل W8A أو #14)، وقلب حواف الربر دام حول الأعناق لضمان عزل تام بنسبة 100% عن اللعاب والرطوبة التنفسية.',
    criticalWarning: 'أي تسرب قطرة لعاب واحدة يقلل قوة الالتصاق بنسبة تتجاوز 70% ويسبب فشل الحشوة الحتمي.',
    recommendedInstruments: ['Rubber Dam Sheet (Heavy)', 'Rubber Dam Punch & Forceps', 'Clamp W8A / #14', 'Dental Floss'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-4',
    stepNumber: 4,
    phase: 'preparation',
    phaseTitle: 'المرحلة 3: إزالة التسوس والتحضير',
    title: 'إزالة التسوس المحافظة وتدوير الزوايا الداخلية',
    titleEn: 'Selective Caries Excavation & Internal Rounding',
    description: 'إزالة النخر بالمثقب الكروي البطيء (Slow Speed) أو الكاحت اليدوي، مع الحفاظ على بنية السن السليمة وتدوير جميع الزوايا الداخلية (Line Angles) لتوزيع الإجهاد.',
    criticalWarning: 'ممنوع عمل Bevel على السطوح الإطباقية في Class I لتجنب كسر حواف الكومبوزيت الرقيقة تحت ضغط المضغ.',
    recommendedInstruments: ['Round Carbide Bur (RA #4, #6)', 'Hand Excavator', 'Pear Bur #330'],
    isKeyCheck: false,
  },
  {
    id: 'c1-step-5',
    stepNumber: 5,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: بروتوكول التخريش والربط',
    title: 'التخريش الانتقائي للميناء (Selective Enamel Etch)',
    titleEn: 'Selective Enamel Etching (37% H3PO4)',
    description: 'تطبيق حمض الفوسفوريك 37% على حواف الميناء فقط لمدة 15-20 ثانية، ثم الغسل بالماء المستمر بنفس المدة، وتجفيف الهواء بلطف دون تجفيف العاج حتى البياض الطباشيري.',
    criticalWarning: 'تجنب الإفراط في تجفيف العاج (Desiccation) حتى لا تنهار ألياف الكولاجين؛ يجب إبقاء سطح العاج رطباً بلمعان خفيف (Moist).',
    recommendedInstruments: ['37% Phosphoric Acid Gel', 'Air-Water Syringe', 'Microbrush'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-6',
    stepNumber: 6,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: بروتوكول التخريش والربط',
    title: 'فرك البوند الشامل وتبخير المذيب (Bond Application)',
    titleEn: 'Universal Adhesive Application & Evaporation',
    description: 'فرك سائل البوند لمدة 20 ثانية بنشاط على العاج والميناء لتغلغله في الأنابيب العاجية، ثم التجفيف بالهواء اللطيف لمدة 5 ثوانٍ لتبخير المذيب، والتصليد الضوئي 20 ثانية.',
    criticalWarning: 'عدم تبخير المذيب (Solvent) بالهواء يترك ماءً وكحولاً داخل طبقة الربط مما يؤدي لضعف التبلمر وحساسية بعد العلاج.',
    recommendedInstruments: ['Universal Adhesive', 'Microbrush', 'High-Power Light Cure (>= 1000 mW/cm²)'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-7',
    stepNumber: 7,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي والنحت',
    title: 'طبقة تدفق ممتصة للإجهاد (Flowable Liner)',
    titleEn: 'Cavity Floor Flowable Liner (< 0.5 mm)',
    description: 'وضع طبقة رقيقة جداً (أقل من 0.5 ملم) من الكومبوزيت السائل (Flowable) في قاع الكافتي لامتصاص إجهاد الانكماش C-Factor وسد الفجوات المجهرية ثم التصليد.',
    criticalWarning: 'لا تزيد سماكة الكومبوزيت السائل عن 0.5 ملم لأن معامل انكماشه الحجمي أعلى من الباكر المقوى.',
    recommendedInstruments: ['Low-Shrinkage Flowable Composite', 'Fine Applicator Needle', 'Explorer'],
    isKeyCheck: false,
  },
  {
    id: 'c1-step-8',
    stepNumber: 8,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي والنحت',
    title: 'التكديس المائل الهرمي لكل حدبة (Oblique Incremental Layering)',
    titleEn: 'Oblique Layering (Cusp by Cusp <= 2 mm)',
    description: 'بناء الحشوة بطبقات مثلثة مائلة لا تلامس جدارين متقابلين في نفس الوقت، مع بناء كل حدبة تشريحية على حدة بسماكة لا تتجاوز 2 ملم للتغلب على C-Factor=5.',
    criticalWarning: 'التكديس الأفقي المباشر يربط الجدران المتقابلة ويسبب كسر حواف الميناء وحساسية ما بعد الحشوة Post-op sensitivity.',
    recommendedInstruments: ['Microhybrid/Nanohybrid Composite', 'Titanium Carver / OptraSculpt', 'Composite Gun'],
    isKeyCheck: true,
  },
  {
    id: 'c1-step-9',
    stepNumber: 9,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي والنحت',
    title: 'التلوين الدقيق للميازيب (Fissure Staining - اختياري)',
    titleEn: 'Fissure Characterization & Final Curing with Glycerin',
    description: 'تطبيق كمية مجهرية من اللون البني/المغرة (Brown Tint) في الميازيب العميقة بمسبر دقيق، ووضع جل الجلسرين (Air-Barrier) قبل التصليد النهائي 20 ثانية لمنع طبقة الأكسجين العازلة.',
    criticalWarning: 'جل الجلسرين يمنع الأكسجين من تثبيط تصليد السطح الخارجي مما يعطي صلابة مينائية قصوى ومقاومة للاهتراء.',
    recommendedInstruments: ['Brown/Ochre Composite Tint', 'Endo File #08 / Fine Probe', 'Glycerin / Deox Gel'],
    isKeyCheck: false,
  },
  {
    id: 'c1-step-10',
    stepNumber: 10,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: الإنهاء والتلميع والإطباق',
    title: 'التشذيب والتلميع وفحص الإطباق الحركي (Finishing & Occlusion)',
    titleEn: 'Finishing, High-Shine Polishing & MIP/Excursive Check',
    description: 'تشذيب الزوائد بسنابل الماسة الدقيقة الصفراء، التلميع بأقراص السيليكون الحلزونية، وإزالة الربر دام لفحص الإطباق بـ Articulating Paper في وضع الإطباق المركزي والحركات الجانبية.',
    criticalWarning: 'أي نقطة احتكاك زائدة غير معالجة تسبب ألماً شديداً عند المضغ وربما التهاب رباط سني حاد (Acute Apical Periodontitis).',
    recommendedInstruments: ['Yellow-Band Fine Diamond Bur (Football/Flame)', 'Spiral Polishing Wheels', 'Diamond Polishing Paste', 'Articulating Paper'],
    isKeyCheck: true,
  },
];

export const CLASS_2_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: 'c2-step-1',
    stepNumber: 1,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: التحضير المسبق وحماية السن المجاور',
    title: 'الإسفين الاستباقي (Pre-Wedging) واختيار اللون رطباً',
    titleEn: 'Pre-Wedging & Wet Shade Selection',
    description: 'إدخال إسفين خشبي في المسافة الملاصقة قبل الحفر لإبعاد اللثة وفصل الأسنان حيوياً بمقدار 50 ميكرون وتأمين حماية السن المجاور، وتحديد اللون قبل العزل.',
    criticalWarning: 'الـ Pre-wedging يسهل الحصول على نقطة تماس Tight Contact لاحقاً بدون فجوات ويقلل نزف اللثة الحاد.',
    recommendedInstruments: ['Wooden Interdental Wedge', 'VITA Shade Guide', 'Explorer'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-2',
    stepNumber: 2,
    phase: 'isolation',
    phaseTitle: 'المرحلة 2: العزل بالربر دام',
    title: 'عزل الربر دام التام وإبعاد اللثة المجاورة',
    titleEn: 'Rubber Dam Isolation & Cervical Clearance',
    description: 'عزل الضرس المعني وضرسين مجاورين على الأقل، والتأكد من نزول الربر دام أسفل الحافة اللثوية للكافتي بالكامل لمنع أي تسرب للدم أو السائل الميزابي.',
    criticalWarning: 'تسرب السائل الميزابي اللثوي في قاع الصندوق الملاصق هو السبب الأول لفشل حشوات Class II والتسوس الثانوي.',
    recommendedInstruments: ['Rubber Dam Kit', 'Interdental Floss', 'Clamp #2 / #14A'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-3',
    stepNumber: 3,
    phase: 'preparation',
    phaseTitle: 'المرحلة 3: حفر الصندوق الملاصق',
    title: 'تحضير الصندوق الملاصق وكسر نقاط التماس (Clearance)',
    titleEn: 'Proximal Box Preparation with Clearance (>= 0.5 mm)',
    description: 'فتح الصندوق الملاصق مع تحرير حواف الكافتي عن السن المجاور بمقدار 0.5 ملم لغوياً وخدياً ولثوياً مع الحفاظ على الحافة الملاصقة للسن المجاور سليمة.',
    criticalWarning: 'ممنوع لمس السن المجاور بالمثقب؛ احمِه دائماً بقطعة Matrix أو Wedge أو شريط حماية معدني FenderWedge.',
    recommendedInstruments: ['FenderWedge / Matrix Guard', 'Pear Bur #330', 'Hatchet / Gingival Margin Trimmer'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-4',
    stepNumber: 4,
    phase: 'preparation',
    phaseTitle: 'المرحلة 3: تجهيز حواف الصندوق',
    title: 'تشذيب حافة الميناء اللثوية (Gingival Margin Trimming)',
    titleEn: 'Gingival Margin Trimming (GMT)',
    description: 'استخدام أداة Gingival Margin Trimmer اليدوية لإزالة موشورات الميناء المتهشمة غير المدعومة في قاع الصندوق، وتجنب عمل Bevel على حافة العنق أو السطح الإطباقي.',
    criticalWarning: 'ترك موشورات ميناء غير مدعومة على الحافة اللثوية يسبب تكسرها لاحقاً وحدوث تسرب حفافي فوري.',
    recommendedInstruments: ['Gingival Margin Trimmer (Mesial & Distal)', 'Enamel Hatchet'],
    isKeyCheck: false,
  },
  {
    id: 'c2-step-5',
    stepNumber: 5,
    phase: 'isolation',
    phaseTitle: 'المرحلة 4: نظام الماتريكس القطاعي',
    title: 'تركيب شريحة الماتريكس القطاعية المحدبة (Sectional Matrix)',
    titleEn: 'Sectional Contoured Matrix Placement',
    description: 'اختيار شريحة معدنية قطاعية محدبة مطابقة لارتفاع السن، ووضعها بحيث تنزل أسفل الحافة اللثوية للكافتي مع بروز 1 ملم فوق الارتفاع الإطباقي للحدبة.',
    criticalWarning: 'استخدام الماتريكس التقليدي المسطح (Tofflemire) ينتج نقطة تماس مسطحة مفتوحة وضعيفة تجمع الطعام.',
    recommendedInstruments: ['Sectional Matrix Band (3D Contoured)', 'Matrix Pin Tweezers'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-6',
    stepNumber: 6,
    phase: 'isolation',
    phaseTitle: 'المرحلة 4: نظام الماتريكس القطاعي',
    title: 'تثبيت الإسفين وحلقة الفصل الفولاذية (Wedge & Separator Ring)',
    titleEn: 'Wedge Adaptation & Separator Ring Tension',
    description: 'إدخال الإسفين من الناحية الأكثر اتساعاً لسد الحافة اللثوية تماماً، ثم وضع حلقة الفصل (مثل Garrison أو Palodent) بأرجلها خلف الإسفين لتوليد قوة فصل كافية.',
    criticalWarning: 'تأكد من النظر بالمجهر أو المرآة أن حافة الشريحة اللثوية مغلقة بإحكام تام؛ أي فراغ سيسبب Overhang لثوي مزعج.',
    recommendedInstruments: ['Wedge (Anatomical)', 'Separator Ring Forceps', 'Separator Ring with NiTi Springs'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-7',
    stepNumber: 7,
    phase: 'bonding',
    phaseTitle: 'المرحلة 5: التخريش والربط في الصندوق',
    title: 'التخريش والربط وتجفيف المذيب داخل الصندوق',
    titleEn: 'Selective Etch & Universal Adhesive Protocol',
    description: 'تخريش الميناء لمدة 15 ثانية، الغسل والتجفيف، وتطبيق البوند مع الفرك المستمر 20 ثانية في قاع الصندوق الملاصق، ثم التبخير بالهواء والتصليد 20 ثانية.',
    criticalWarning: 'تأكد من عدم تجمع بركة من البوند الزائد (Adhesive Pooling) في زاوية الصندوق اللثوي حتى لا تضعف الالتصاق.',
    recommendedInstruments: ['37% Etchant Gel', 'Universal Adhesive', 'Fine Microbrush', 'Light Cure'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-8',
    stepNumber: 8,
    phase: 'layering',
    phaseTitle: 'المرحلة 6: تحويل الصندوق إلى كلاس 1',
    title: 'بناء الجدار الملاصق وتحويل الكافتي لـ Class I (Wall Conversion)',
    titleEn: 'Centric Marginal Ridge Conversion to Class I',
    description: 'بناء جدار ملاصق بسماكة 1-1.5 ملم باستخدام كومبوزيت مقوى نانوي، وضغطه بلطف باتجاه السن المجاور لضمان نقطة تماس قوية، ثم التصليد الكامل.',
    criticalWarning: 'بمجرد بناء هذا الجدار وتصليده، تحول الكافتي بنجاح من Class II إلى Class I سهل النحت والتكديس.',
    recommendedInstruments: ['Nanohybrid Composite (Enamel Shade)', 'Contact Former / Condenser', 'Light Cure Unit'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-9',
    stepNumber: 9,
    phase: 'layering',
    phaseTitle: 'المرحلة 6: تحويل الصندوق إلى كلاس 1',
    title: 'إزالة الحلقة والشريحة وإكمال التكديس الإطباقي',
    titleEn: 'Ring & Matrix Removal & Occlusal Oblique Layering',
    description: 'إزالة حلقة الفصل وشريحة الماتريكس للحصول على رؤية ممتازة، ثم إكمال بناء الحشوة بطريقة التكديس المائل الهرمي لكل حدبة تشريحية على حدة.',
    criticalWarning: 'تصليد الجدار الملاصق إضافياً من الناحية الخدية واللسانية بعد إزالة الماتريكس لضمان بلمرة عميقة 100%.',
    recommendedInstruments: ['Composite Instruments', 'Cusp Carver', 'Glycerin Air Barrier Gel'],
    isKeyCheck: false,
  },
  {
    id: 'c2-step-10',
    stepNumber: 10,
    phase: 'finishing',
    phaseTitle: 'المرحلة 7: الإنهاء والتلميع وفحص الخيط',
    title: 'فحص نقطة التماس بالخيط الحريري (Floss Snap Check)',
    titleEn: 'Interproximal Floss Snap & Overhang Check',
    description: 'تمرير خيط الأسنان بين السنين للتأكد من وجود صوت طقطقة مميز (Snap)، والتأكد من انزلاق الخيط بسلاسة دون تمزق أو التقاط أي زوائد لثوية (Overhang).',
    criticalWarning: 'إذا تمزق الخيط أو دخل بصعوبة مع فراغ، فهناك زائدة لثوية يجب إزالتها فوراً بشفرة #12 أو شريط معدني ناعم.',
    recommendedInstruments: ['Waxed Dental Floss', '#12 Surgical Scalpel Blade', 'Proximal Finishing Strips'],
    isKeyCheck: true,
  },
  {
    id: 'c2-step-11',
    stepNumber: 11,
    phase: 'finishing',
    phaseTitle: 'المرحلة 7: الإنهاء والتلميع وفحص الخيط',
    title: 'ضبط الحافة الملاصقة والإطباق المركزي والحركي',
    titleEn: 'Marginal Ridge Height & Dynamic Occlusion Harmony',
    description: 'تأكد من أن ارتفاع الحافة الملاصقة متساوٍ تماماً مع ارتفاع حافة السن المجاور، وفحص الإطباق بـ Articulating Paper لمنع كسر الحافة أثناء المضغ.',
    criticalWarning: 'الحافة المرتفعة عن السن المجاور تتعرض لعزم دوران انكساري هائل يؤدي لكسرها خلال 48 ساعة من الاستخدام.',
    recommendedInstruments: ['Fine Diamond Flame Bur', 'Articulating Paper (40µm)', 'High-Gloss Wheels'],
    isKeyCheck: true,
  },
];

export const CLASS_3_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: 'c3-step-1',
    stepNumber: 1,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: التقييم الجمالي واختيار اللون',
    title: 'تحديد اللون المتعدد (Multi-Shade) وهو رطب بالضوء الطبيعي',
    titleEn: 'Wet Polychromatic Shade Selection under Daylight',
    description: 'اختيار لون العاج (Dentin - أكثر إعتاماً) ولون الميناء (Enamel - نصف شفاف) باستخدام طريقة Button Try-In على السن وهو رطب قبل العزل.',
    criticalWarning: 'الأسنان الأمامية تفقد شفافيتها بسرعة هائلة بعد دقيقتين فقط من العزل بالربر دام.',
    recommendedInstruments: ['VITA Classical & 3D Master', 'Composite Buttons', 'Polar_Eyes / Daylight 5500K Lamp'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-2',
    stepNumber: 2,
    phase: 'preparation',
    phaseTitle: 'المرحلة 2: التحضير السريري الحافظ',
    title: 'المدخل الحنكي والحفاظ على الميناء الدهليزي (Palatal Approach)',
    titleEn: 'Conservative Palatal Approach & Facial Enamel Preservation',
    description: 'الدخول بالتجويف من الناحية الحنكية (Palatal) للحفاظ على صفيحة الميناء الأمامية الخارجية سليمة قدر الإمكان للحفاظ على المظهر الجمالي الطبيعي.',
    criticalWarning: 'تجنب فتح الكافتي من الناحية الشفوية الدهليزية إلا إذا كان التسوس مخترقاً للسطح الأمامي بالكامل.',
    recommendedInstruments: ['Round Bur #2 / #1', 'Mirror for Indirect Vision', 'Hand Instruments'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-3',
    stepNumber: 3,
    phase: 'preparation',
    phaseTitle: 'المرحلة 2: التحضير السريري الحافظ',
    title: 'شطب حواف الميناء بشكل متموج (Scalloped / Starburst Bevel)',
    titleEn: 'Wavy / Starburst Enamel Bevel (0.5 - 1.0 mm)',
    description: 'عمل Bevel متموج غير منتظم بسماكة 0.5 إلى 1 ملم على حواف الميناء الأمامية لدمج الكومبوزيت بصرياً وإخفاء خط الفاصل تماماً.',
    criticalWarning: 'الحافة المستقيمة الحادة (Butt Joint) تظهر كخط فاصل رمادي مرئي بوضوح عند الابتسام.',
    recommendedInstruments: ['Flame-shaped Fine Diamond Bur (Red / Yellow band)'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-4',
    stepNumber: 4,
    phase: 'isolation',
    phaseTitle: 'المرحلة 3: العزل والشريط الشفاف',
    title: 'شريط المايلر الشفاف والإسفين المضيء (Mylar Strip & Wedge)',
    titleEn: 'Mylar Strip & Transparent/Wooden Wedge Placement',
    description: 'وضع شريط مايلر شفاف بين السنين وإدخال إسفين ملائم من الحنك لتثبيت الشريط ومنع التسرب اللثوي، وتثبيته بمسواك أو أصبع اليد.',
    criticalWarning: 'حماية السن المجاور بشريط تفلون (PTFE Tape) أثناء التخريش لمنع تخريش ميناء السن السليم المجاور.',
    recommendedInstruments: ['Mylar Celluloid Strip', 'PTFE Teflon Tape', 'Interdental Wedge'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-5',
    stepNumber: 5,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: التخريش والربط',
    title: 'بروتوكول التخريش الكلي أو الانتقائي والربط المتقن',
    titleEn: 'Etching & Bonding with Adjacent Protection',
    description: 'تخريش الميناء والعاج، وتطبيق البوند الشامل، والتبخير اللطيف لمدة 5 ثوانٍ، والتصليد الضوئي 20 ثانية من الناحيتين الحنكية والشفوية.',
    criticalWarning: 'تأكد من عدم وصول البوند إلى سطح السن المجاور حتى لا تلتصق الأسنان ببعضها.',
    recommendedInstruments: ['37% Etchant', 'Universal Adhesive', 'Curing Light'],
    isKeyCheck: false,
  },
  {
    id: 'c3-step-6',
    stepNumber: 6,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي ثلاثي الأبعاد',
    title: 'بناء الجدار الحنكي الشفاف (Palatal Enamel Shell)',
    titleEn: 'Palatal Enamel Shell Layer',
    description: 'بناء قشرة حنكية رقيقة جداً (0.5 ملم) من كومبوزيت الميناء الشفاف بمساندة شريط المايلر أو أصبع معقم، وتصليدها لتكون دعامة لباقي الطبقات.',
    criticalWarning: 'هذه القشرة هي الأساس الهندسي الذي يمنع سقوط الكومبوزيت داخل الفم أثناء التكديس.',
    recommendedInstruments: ['Translucent / Enamel Composite', 'Flat Plastic Instrument / IPC Carve'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-7',
    stepNumber: 7,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي ثلاثي الأبعاد',
    title: 'وضع طبقة العاج المعتمة لحجب ظلام الفم (Dentin Opaque Core)',
    titleEn: 'Opaque Dentin Core Placement',
    description: 'تطبيق كومبوزيت عاجي معتم (Opaque Dentin) في المنتصف لحجب ظل تجويف الفم المظلم ومنع ظهور الحشوة بمظهر رمادي شفاف باهت.',
    criticalWarning: 'بدون طبقة العاج المعتمة ستظهر الحشوة رمادية داكنة عند فتح الفم أو النظر إليها بزاوية جانبية.',
    recommendedInstruments: ['Opaque Dentin Composite (A2O / A3O)', 'Composite Condenser'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-8',
    stepNumber: 8,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي ثلاثي الأبعاد',
    title: 'طبقة الميناء الشفوي وتقنية السحب (Pull-Through Technique)',
    titleEn: 'Facial Enamel Layer & Pull-Through Wrap',
    description: 'تطبيق طبقة الميناء الشفوية الخارجية ولف شريط المايلر بإحكام حول السن وسحبه باتجاه الحنك لإنشاء شكل محدب طبيعي بدون فقاعات.',
    criticalWarning: 'شد شريط المايلر بقوة مفرطة قد يفرغ الحشوة من الكومبوزيت وينتج سطحاً مقعراً مشوهاً.',
    recommendedInstruments: ['Enamel Shade Composite', 'Mylar Strip'],
    isKeyCheck: false,
  },
  {
    id: 'c3-step-9',
    stepNumber: 9,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: الإنهاء والتلميع الحريري',
    title: 'التشذيب بأشرطة الصنفرة المتدرجة (Sof-Lex Finishing Strips)',
    titleEn: 'Interproximal Finishing Strips (Coarse to Fine)',
    description: 'إدخال شريط الصنفرة من المنطقة الخالية من الكشط في المنتصف، وتشذيب الحواف الملاصقة من الخشن إلى الناعم جداً للحصول على سطح أملس كالحرير.',
    criticalWarning: 'لا تفرط في الصنفرة في منطقة نقطة التماس حتى لا تفتح Contact Point وتتحول إلى مسافة فارغة (Food Impaction).',
    recommendedInstruments: ['Sof-Lex Finishing Strips (Coarse/Medium/Fine/Superfine)'],
    isKeyCheck: true,
  },
  {
    id: 'c3-step-10',
    stepNumber: 10,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: الإنهاء والتلميع الحريري',
    title: 'التلميع فائق اللمعان وفحص الخيط (High-Shine & Floss Check)',
    titleEn: 'High-Gloss Polishing & Contact Continuity',
    description: 'التلميع برؤوس السيليكون اللولبية ومعجون الألماس، والتأكد من انزلاق خيط الأسنان بنعومة تامة دون خدوش أو بقايا لاصقة.',
    criticalWarning: 'السطح الأملس اللامع يمنع التصاق البلاك وتصبغ حواف الحشوة بالقهوة والتدخين مع مرور الوقت.',
    recommendedInstruments: ['Spiral Rubber Wheels', 'Diamond Polishing Paste', 'Dental Floss'],
    isKeyCheck: true,
  },
];

export const CLASS_4_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: 'c4-step-1',
    stepNumber: 1,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: التخطيط الجمالي ومفتاح السيليكون',
    title: 'صنع قالب السيليكون الحنكي (Palatal Silicone Index)',
    titleEn: 'Palatal Silicone Key / Index Fabrication',
    description: 'صنع قالب سيليكوني مسبق (Putty Index) بناءً على الشمع التشخيصي (Wax-up) أو Mock-up مباشر داخل الفم لضمان استعادة الطول والشكل الحنكي بدقة 100%.',
    criticalWarning: 'بدون مفتاح السيليكون، بناء الحافة القاطعة حراً باليد يستغرق وقتاً طويلاً وغالباً ما ينتج سماكة غير متجانسة.',
    recommendedInstruments: ['C-Silicone / A-Silicone Putty', 'Scalpel #11 / #15 for trimming'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-2',
    stepNumber: 2,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: التخطيط الجمالي ومفتاح السيليكون',
    title: 'تخطيط خريطة الألوان ثلاثية الأبعاد (Multi-Layer Shade Mapping)',
    titleEn: 'Multi-Layer Shade Mapping (Dentin, Body, Enamel, Halo)',
    description: 'رسم خريطة سريرية لتوزيع طبقة العاج، الماميلونات (Mamelons)، الشفافية القاطعة (Translucent incisal effect)، والهالة البيضاء القاطعة (Incisal Halo).',
    criticalWarning: 'يجب توثيق درجات الألوان بالصور الفوتوغرافية مع بطاقة رمادية والسن رطب قبل أي تخدير أو عزل.',
    recommendedInstruments: ['DSLR/Mirrorless Camera with Polarizing Filter', 'VITA Shade Guide'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-3',
    stepNumber: 3,
    phase: 'preparation',
    phaseTitle: 'المرحلة 2: شطب حافة الميناء اللامتناهي',
    title: 'عمل الشطب المتموج الطويل اللامتناهي (Infinite Starburst Bevel 2-2.5 mm)',
    titleEn: 'Long Undulating Starburst Enamel Bevel (2.0 - 2.5 mm)',
    description: 'عمل Bevel متدرج طويل ومتموج على الميناء الشفوي بسماكة تتلاشى تدريجياً نحو عنق السن لإخفاء خط الكسر والانتقال البصري تماماً.',
    criticalWarning: 'الشطب القصير (أقل من 1 ملم) يترك خط كسر رمادي يظهر بوضوح تحت الإضاءة القوية.',
    recommendedInstruments: ['Flame-shaped Fine Diamond Bur', 'Football Diamond Bur'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-4',
    stepNumber: 4,
    phase: 'isolation',
    phaseTitle: 'المرحلة 3: العزل وحماية السن المجاور',
    title: 'العزل بالربر دام وحماية السن المجاور بشريط التفلون',
    titleEn: 'Rubber Dam Isolation & PTFE Teflon Shielding',
    description: 'عزل منطقة الابتسامة من الضاحك إلى الضاحك لتقييم التناظر الجمالي مع السن المقابل، وتغليف السن المجاور بشريط PTFE أثناء المعالجة الحمضية.',
    criticalWarning: 'عزل سن واحد فقط في الأسنان الأمامية يمنعك من مقارنة الطول والتناظر مع الثنية المجاورة.',
    recommendedInstruments: ['Rubber Dam Kit (Premolar to Premolar)', 'PTFE Teflon Tape'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-5',
    stepNumber: 5,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: التخريش والربط',
    title: 'التخريش الشامل وتطبيق البوند وتصليده',
    titleEn: 'Total-Etch & Adhesive Application',
    description: 'تخريش الميناء لمدة 20 ثانية والعاج لمدة 10 ثوانٍ، الغسل والتجفيف برفق، وتطبيق البوند مع الفرك 20 ثانية والتصليد الكامل 20 ثانية.',
    criticalWarning: 'احذر من ترك أي رطوبة زائدة أو جفاف مفرط؛ حافظ على السطح رطباً بلمعان خفيف.',
    recommendedInstruments: ['37% Phosphoric Acid', 'Universal Adhesive', 'Curing Light'],
    isKeyCheck: false,
  },
  {
    id: 'c4-step-6',
    stepNumber: 6,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي المتقدم',
    title: 'بناء الجدار الحنكي بواسطة مفتاح السيليكون (Palatal Shelf)',
    titleEn: 'Palatal Enamel Shelf Construction via Silicone Index',
    description: 'وضع طبقة ميناء شفافة بسماكة 0.5 ملم مباشرة على مفتاح السيليكون، وإدخاله في فم المريض، وتثبيته بدقة على الأسنان، ثم التصليد الضوئي.',
    criticalWarning: 'هذه الطبقة تحدد الطول الحنكي الدقيق وموقع الحافة القاطعة بدقة متناهية.',
    recommendedInstruments: ['Palatal Silicone Index', 'Translucent Enamel Composite', 'IPC Carving Instrument'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-7',
    stepNumber: 7,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي المتقدم',
    title: 'بناء الجدار الملاصق بشريط المايلر (Proximal Wall)',
    titleEn: 'Proximal Wall Formation with Mylar Strip',
    description: 'بناء الجدار الملاصق لإنهاء الإطار الخارجي للحشوة وتحويل Class IV إلى كافتي مغلق جاهز لاستقبال طبقات العاج الداخلية.',
    criticalWarning: 'تأكد من تحدب الجدار الملاصق وتطابق الارتفاع مع السن المجاور تماماً.',
    recommendedInstruments: ['Mylar Strip', 'Composite Instrument'],
    isKeyCheck: false,
  },
  {
    id: 'c4-step-8',
    stepNumber: 8,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي المتقدم',
    title: 'نحت فصوص العاج والماميلونات (Dentin Mamelons & Opacity)',
    titleEn: 'Dentin Mamelons Sculpting & Characterization',
    description: 'تطبيق كومبوزيت العاج المعتم لتغطية خط الشطب، وتشكيل ثلاثة فصوص عاجية (Mamelons) تنتهي قبل الحافة القاطعة بـ 1-1.5 ملم.',
    criticalWarning: 'تجاوز العاج للحافة القاطعة يلغي الشفافية الطبيعية، بينما قصر العاج يسبب خطاً رمادياً مظلماً.',
    recommendedInstruments: ['Opaque Dentin (A2D/A3D)', 'Fine Brush', 'Carving Instrument'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-9',
    stepNumber: 9,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي المتقدم',
    title: 'تأثيرات الشفافية والهالة القاطعة (Incisal Translucency & Halo)',
    titleEn: 'Incisal Translucent Effect & White Halo Rim',
    description: 'وضع كومبوزيت أزرق شفاف خفيف بين فصوص الماميلونات، مع خط رفيع جداً من الكومبوزيت المعتم الأبيض على طول الحافة القاطعة لإعطاء تأثير Halo الطبيعي.',
    criticalWarning: 'كمية الشفافية يجب أن تكون دقيقة ومدروسة حتى لا تبدو الحافة مزرقة أو رمادية اصطناعية.',
    recommendedInstruments: ['Translucent Blue/Opal Tint', 'White Opaque Tint / Enamel', 'Endo Probe / #00 Brush'],
    isKeyCheck: false,
  },
  {
    id: 'c4-step-10',
    stepNumber: 10,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس الطبقي المتقدم',
    title: 'طبقة الميناء الشفوية الخارجية والتصليد بجل الجلسرين',
    titleEn: 'Facial Enamel Layer & Deox Air Barrier Cure',
    description: 'تطبيق طبقة الميناء الشفوي بسماكة 0.3-0.5 ملم مع تشكيل الفصوص الثلاثية الأولية، ووضع جل الجلسرين والتصليد النهائي 40 ثانية.',
    criticalWarning: 'أي زيادة في سماكة الميناء الشفوي الخارجي تؤدي إلى خفض قيمة السطوع (Value) وتبدو الحشوة مظلمة رمادية.',
    recommendedInstruments: ['Enamel Shade Composite', 'Soft Composite Modeling Brush', 'Glycerin Gel'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-11',
    stepNumber: 11,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: النحت التشريحي والتلميع المرآتي',
    title: 'رسم التناظر وخطوط الانتقال (Line Angles & Symmetry)',
    titleEn: 'Transition Line Angles & Macro-Texture Finishing',
    description: 'رسم خطوط الانتقال بقلم رصاص على كلا السنين ومطابقتها تماماً، وتشذيب الحواف بسنابل ماسية دقيقة لتطابق انعكاس الضوء.',
    criticalWarning: 'انعكاس الضوء على خطوط الانتقال (Line Angles) هو ما يحدد الإدراك البصري لعرض السن وطوله بنسبة 90%.',
    recommendedInstruments: ['Pencil for line angles', 'Fine Red/Yellow Diamond Bur', 'Sof-Lex Discs'],
    isKeyCheck: true,
  },
  {
    id: 'c4-step-12',
    stepNumber: 12,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: النحت التشريحي والتلميع المرآتي',
    title: 'الملمس الدقيق (Micro-texture) والتلميع ثلاثي المراحل',
    titleEn: 'Micro-Texture (Perikymata) & 3-Step High-Gloss Polishing',
    description: 'إضافة خطوط أفقية ناعمة (Perikymata) بسنبلة كروية بطيئة، والتلميع بأقراص السيليكون ومعجون الألماس وفرشاة شعر الماعز للوصول إلى لمعان طبيعي دائم.',
    criticalWarning: 'فحص الإطباق في حركات البروز (Protrusive guidance) والتأكد من عدم وجود إجهاد إطباقي يؤدي لسقوط الحشوة.',
    recommendedInstruments: ['Fine Diamond / Silicon Wheels', 'Diamond Paste 1µm', 'Goat Hair Wheel', 'Articulating Paper'],
    isKeyCheck: true,
  },
];

export const CLASS_5_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: 'c5-step-1',
    stepNumber: 1,
    phase: 'preparation',
    phaseTitle: 'المرحلة 1: التشخيص واختيار اللون العنقودي',
    title: 'تشخيص سبب الآفة (تسوس Caries أم نخور غير تسوسية NCCL)',
    titleEn: 'Etiology Diagnosis (Caries vs NCCL Abfraction/Erosion)',
    description: 'تحديد ما إذا كانت الآفة تسوسية أو ناتجة عن إجهاد إطباقي (Abfraction) أو تآكل كيميائي (Erosion)، واختيار لون العنق وهو رطب (غالباً أغمق بدرجة من التاج مثل A3.5 أو A4).',
    criticalWarning: 'إذا كانت الآفة ناتجة عن Abfraction (إجهاد إطباقي)، يجب تعديل الإطباق وإزالة الاحتكاكات الجانبية وإلا ستفشل الحشوة وتسقط حتماً.',
    recommendedInstruments: ['Articulating Paper', 'VITA Shade Guide', 'Explorer'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-2',
    stepNumber: 2,
    phase: 'isolation',
    phaseTitle: 'المرحلة 2: إبعاد اللثة والعزل العنقي',
    title: 'إبعاد اللثة بخيط #000 أو كلاب #212 العنقي (Gingival Retraction)',
    titleEn: 'Gingival Retraction Cord #000 or #212 Clamp Placement',
    description: 'إدخال خيط انكماش لثوي رفيع جداً (#000 أو #00) في الميزاب اللثوي لإبعاد اللثة بمقدار 1 ملم وكشف حافة الآفة بالكامل بدون نزف، أو تثبيت كلاب #212 المعدل.',
    criticalWarning: 'رطوبة اللثة ونزفها هو العدو الأول لحشوات Class V؛ العزل الجاف ضروري لضمان التصاق متين.',
    recommendedInstruments: ['Gingival Retraction Cord #000', 'Cord Packer', 'Modified #212 Retraction Clamp'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-3',
    stepNumber: 3,
    phase: 'preparation',
    phaseTitle: 'المرحلة 3: التحضير الهندسي والشطب',
    title: 'شطب حافة الميناء التاجية فقط وممنوع شطب الجذر (Bevel on Enamel Only)',
    titleEn: 'Enamel Margin Beveling vs Root Dentin Butt-Joint',
    description: 'عمل Bevel لطيف بسماكة 0.5-1 ملم على حافة الميناء التاجية العلوية فقط، وترك حافة الجذر العاجية السفلية كحافة مستقيمة 90 درجة (Butt Joint) دون أي شطب.',
    criticalWarning: 'شطب حافة الجذر السفلية (Cementum/Dentin) يزيل طبقة رقيقة من الجذر ويترك حافة كومبوزيت رقيقة جداً تتكسر وتجمع البلاك.',
    recommendedInstruments: ['Flame-shaped Fine Diamond Bur', 'Slow-speed Round Bur'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-4',
    stepNumber: 4,
    phase: 'preparation',
    phaseTitle: 'المرحلة 3: التحضير الهندسي والشطب',
    title: 'التنظيف اللطيف وإزالة طبقة اللطاخة (Air-Abrasion / Pumice)',
    titleEn: 'Cavity Cleansing & Sclerotic Dentin Conditioning',
    description: 'تنظيف السطح بمعجون خالي من الفلورايد، وإذا كان العاج متصلباً مصقولاً (Sclerotic Dentin)، يُفضل تخريشه بحبيبات أكسيد الألومنيوم أو خربشته بسنبلة ماسية دقيقة.',
    criticalWarning: 'العاج المتصلب (Sclerotic Dentin) مقاوم جداً للبوند ولا تلتصق به الحشوة إلا بعد إزالة لمعانه الزجاجي ميكانيكياً.',
    recommendedInstruments: ['Pumice Paste', 'Fine Diamond Bur / Micro-Etcher Air Abrasion'],
    isKeyCheck: false,
  },
  {
    id: 'c5-step-5',
    stepNumber: 5,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: التخريش والربط النشط',
    title: 'التخريش الانتقائي للميناء وحماية العاج العنقودي',
    titleEn: 'Selective Enamel Etch & Universal Adhesive Scrubbing',
    description: 'تخريش حافة الميناء لمدة 15 ثانية، وفرك سائل البوند Universal بنشاط لمدة 20 ثانية على العاج المكشوف لتحقيق أقصى تغلغل داخل القنوات العاجية.',
    criticalWarning: 'فرك البوند بنشاط (Active Scrubbing) يكسر طبقة اللطاخة ويدمج المونومير في العاج بنجاح.',
    recommendedInstruments: ['37% Phosphoric Acid', 'Universal Adhesive', 'Microbrush'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-6',
    stepNumber: 6,
    phase: 'bonding',
    phaseTitle: 'المرحلة 4: التخريش والربط النشط',
    title: 'تبخير المذيب التام بالهواء اللطيف والتصليد الكامل',
    titleEn: 'Solvent Air-Drying & Thorough Photopolymerization',
    description: 'تجفيف البوند بالهواء بلطف حتى يتوقف السائل عن الحركة ويظهر كطبقة لامعة موحدة، ثم التصليد لمدة 20 ثانية بشدة إضاءة عالية.',
    criticalWarning: 'ترك أي رطوبة في البوند في منطقة العنق يسبب حساسية للمشروبات الباردة بعد العلاج.',
    recommendedInstruments: ['Air Syringe', 'LED Light Curing Unit'],
    isKeyCheck: false,
  },
  {
    id: 'c5-step-7',
    stepNumber: 7,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس وممتص الإجهاد',
    title: 'طبقة كومبوزيت سائل مرن لامتصاص قوى الانثناء (Flowable Liner)',
    titleEn: 'Flexible Flowable Composite Base (Low Elastic Modulus)',
    description: 'تطبيق طبقة رقيقة من الكومبوزيت السائل ذو معامل المرونة المنخفض ليعمل كـ "وسادة مرنة" تمتص قوى انثناء السن أثناء المضغ وتمنع انفصال الحشوة.',
    criticalWarning: 'الكومبوزيت القاسي جداً يسقط بسهولة من عنق السن عند تعرض السن لقوى انثناء إطباقية.',
    recommendedInstruments: ['Low-Modulus Flowable Composite', 'Fine Probe'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-8',
    stepNumber: 8,
    phase: 'layering',
    phaseTitle: 'المرحلة 5: التكديس وممتص الإجهاد',
    title: 'بناء الكومبوزيت الخارجي والتحدب الطبيعي (Emergence Profile)',
    titleEn: 'Microhybrid Layering & Natural Emergence Profile',
    description: 'بناء الكومبوزيت بطبقتين مائلتين مع الحفاظ على التحدب الطبيعي للسن ومراعاة ألا تبرز الحشوة فوق حافة الجذر لتفادي التهاب اللثة المزمن.',
    criticalWarning: 'بروز الحشوة (Overcontouring) عند خط اللثة يسبب احتباس البلاك والتهاب اللثة الدائم وتراجعها.',
    recommendedInstruments: ['Microhybrid / Submicron Composite', 'Gold Carver / Flat Plastic'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-9',
    stepNumber: 9,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: التشذيب والتلميع وصحة اللثة',
    title: 'إزالة الزوائد العنقودية بشفرة جراحية #12 (Scalpel Blade Trimming)',
    titleEn: 'Cervical Flash Removal with #12 Scalpel Blade',
    description: 'استخدام شفرة جراحية #12 منحنية لإزالة أي زوائد دقيقة عند خط اللثة بلطف شديد، مما يحمي الجذر من الخدش بالسنابل الدوارة.',
    criticalWarning: 'السنابل الدوارة عند خط اللثة قد تخدش الملاط وتسبب ندبات دائمة في اللثة.',
    recommendedInstruments: ['#12 Surgical Scalpel Blade with Handle', 'Fine Curette'],
    isKeyCheck: true,
  },
  {
    id: 'c5-step-10',
    stepNumber: 10,
    phase: 'finishing',
    phaseTitle: 'المرحلة 6: التشذيب والتلميع وصحة اللثة',
    title: 'التلميع فائق النعومة وإزالة خيط الانكماش اللثوي',
    titleEn: 'High-Gloss Polishing & Retraction Cord Removal',
    description: 'التلميع برؤوس السيليكون اللولبية ومعجون التلميع، وإزالة خيط الانكماش اللثوي برفق والتأكد من عودة اللثة لحافتها الطبيعية بنظافة تامة وفحص الإطباق.',
    criticalWarning: 'تأكد من عدم ترك أي بقايا من خيط الانكماش داخل الميزاب اللثوي لأنها تسبب خراجاً لثوياً حاداً.',
    recommendedInstruments: ['Silicon Wheels (Flame-shaped)', 'Diamond Polishing Paste', 'Tissue Forceps'],
    isKeyCheck: true,
  },
];

export const CLINICAL_CHECKLISTS_BY_CLASS: Record<string, ClassClinicalChecklist> = {
  'class-1': {
    classId: 'class-1',
    classCode: 'Class I',
    arabicName: 'الصنف الأول (Class I)',
    summary: 'قائمة التحقق الإطباقية: فحص الإطباق المسبق، عزل الربر دام، معالجة C-Factor، التكديس المائل، والنحت والإنهاء تحت جل الجلسرين.',
    items: CLASS_1_CHECKLIST,
  },
  'class-2': {
    classId: 'class-2',
    classCode: 'Class II',
    arabicName: 'الصنف الثاني (Class II)',
    summary: 'قائمة التحقق الملاصقة الخلفية: Pre-wedging، تحرير الصندوق، نظام الماتريكس القطاعي، تحويل الكافتي لـ Class I، وفحص الخيط الحريري.',
    items: CLASS_2_CHECKLIST,
  },
  'class-3': {
    classId: 'class-3',
    classCode: 'Class III',
    arabicName: 'الصنف الثالث (Class III)',
    summary: 'قائمة التحقق الملاصقة الأمامية: اختيار اللون رطباً، المدخل الحنكي المحافظ، الشطب المتموج، شريط المايلر، وبناء قشرة الميناء الحنكية.',
    items: CLASS_3_CHECKLIST,
  },
  'class-4': {
    classId: 'class-4',
    classCode: 'Class IV',
    arabicName: 'الصنف الرابع (Class IV)',
    summary: 'قائمة التحقق الجمالية للزوايا القاطعة: مفتاح السيليكون الحنكي، الشطب اللامتناهي 2.5 ملم، فصوص الماميلونات، والهالة القاطعة مع خطوط الانتقال.',
    items: CLASS_4_CHECKLIST,
  },
  'class-5': {
    classId: 'class-5',
    classCode: 'Class V',
    arabicName: 'الصنف الخامس (Class V)',
    summary: 'قائمة التحقق العنقودية: تشخيص Abfraction، إبعاد اللثة، الشطب على الميناء فقط، البطانة المرنة الممتصة للإجهاد، والتشذيب بشفرة #12.',
    items: CLASS_5_CHECKLIST,
  },
};

/**
 * Storage Helpers for Checklist state persistence
 */
const CHECKLIST_STORAGE_PREFIX = 'dental_clinical_checklist_';

export function getCompletedChecklistSteps(classId: string): string[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CHECKLIST_STORAGE_PREFIX}${classId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveCompletedChecklistSteps(classId: string, stepIds: string[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${CHECKLIST_STORAGE_PREFIX}${classId}`, JSON.stringify(stepIds));
    window.dispatchEvent(
      new CustomEvent('clinical-checklist-updated', {
        detail: { classId, stepIds, timestamp: Date.now() },
      })
    );
  } catch {}
}

export function toggleChecklistStep(classId: string, stepId: string): string[] {
  const current = getCompletedChecklistSteps(classId);
  const exists = current.includes(stepId);
  const updated = exists ? current.filter((id) => id !== stepId) : [...current, stepId];
  saveCompletedChecklistSteps(classId, updated);
  return updated;
}

export function resetChecklistForClass(classId: string): void {
  saveCompletedChecklistSteps(classId, []);
}

export function markAllChecklistStepsCompleted(classId: string): string[] {
  const checklist = CLINICAL_CHECKLISTS_BY_CLASS[classId];
  if (!checklist) return [];
  const allIds = checklist.items.map((item) => item.id);
  saveCompletedChecklistSteps(classId, allIds);
  return allIds;
}

export function getChecklistProgress(classId: string): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  const checklist = CLINICAL_CHECKLISTS_BY_CLASS[classId];
  const total = checklist ? checklist.items.length : 0;
  if (total === 0) return { completed: 0, total: 0, percentage: 0, isComplete: false };
  const completed = getCompletedChecklistSteps(classId).length;
  const percentage = Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percentage,
    isComplete: completed === total && total > 0,
  };
}
