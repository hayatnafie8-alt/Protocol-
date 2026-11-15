/**
 * Smart Clinic Protocol: Clinical Tray Architecture in 7 Steps
 * بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات
 *
 * Supervisor: Dr. Hayat Nafee Fajer (د. حياة نافع فجر)
 * Medical-grade protocol for clinical ergonomics, cross-contamination prevention,
 * and high-efficiency tray engineering.
 */

export interface TrayProtocolStep {
  stepNumber: number;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn?: string;
  badge: string;
  badgeEn?: string;
  keyTools: Array<{
    name: string;
    nameEn: string;
    purpose: string;
    purposeEn?: string;
    isSharp?: boolean;
    isDisposable?: boolean;
  }>;
  clinicalActions: string[];
  clinicalActionsEn?: string[];
  clinicalPearls: string[];
  clinicalPearlsEn?: string[];
  hazardWarnings: string[];
  hazardWarningsEn?: string[];
  disposableItems: string[];
  disposableItemsEn?: string[];
}

export const SMART_CLINIC_TRAY_PROTOCOL_INFO = {
  title: 'بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات',
  titleEn: 'Smart Clinic Protocol: 7-Step Operative Tray Architecture',
  supervisor: 'د. حياة نافع فجر',
  supervisorEn: 'Dr. Hayat Nafee Fajer',
  department: 'طب الأسنان السريري والترميمي — عيادات التدريب المتقدم',
  departmentEn: 'Advanced Operative & Restorative Clinical Dentistry',
  objective: 'تنظيم وتنسيق صينية وطاولة العمل السريري تسلسلياً لمنع التلوث التبادلي، اختصار وقت الجلسة، ورفع جودة الترميمات السنية.',
  objectiveEn: 'Sequential chairside delivery tray ergonomics engineered to eliminate cross-contamination, streamline operative duration, and maximize restorative longevity.',
  goldenNote: {
    title: 'الملاحظة الذهبية (The Golden Note)',
    titleEn: 'The Golden Note: Essential Chairside Armamentarium',
    text: 'أدوات Disposable الأساسية طوال الجلسة: كوب الماء، Saliva Ejector، Patient Towel، المرايا، Probe، Tweezers، قطن Cotton Rolls، وزجاجة الكحول Bottled Alcohol.',
    textEn: 'Mandatory single-use disposable items throughout the clinical appointment: paper rinse cup, high-volume saliva ejector, patient bib/towel, diagnostic mirror, explorer probe, cotton pliers, cotton rolls, and 70% isopropyl alcohol surface disinfectant.',
  },
};

export const SMART_CLINIC_TRAY_STEPS: TrayProtocolStep[] = [
  {
    stepNumber: 1,
    title: 'التجهيز الأولي والتعقيم أمام المراجع',
    titleEn: 'Chairside Preparation & Patient-Witnessed Asepsis',
    subtitle: 'Dental Chair & Tray Setup, Towel, Alcohol, Examination Tools, Lab Coat, Case Sheet',
    subtitleEn: 'Operative operatory disinfection, diagnostic instrument pouch opening, and baseline charting',
    badge: 'الخطوة 1 • التعقيم وبناء الثقة',
    badgeEn: 'Step 1 • Aseptic Protocol & Patient Trust',
    keyTools: [
      {
        name: 'كرسي وصينية الأسنان',
        nameEn: 'Dental Delivery Unit & Instrument Tray',
        purpose: 'ضبط الوضعية المريحة وتجهيز سطح العمل المعقم',
        purposeEn: 'Ergonomic positioning of patient and delivery tray in sterile zone'
      },
      {
        name: 'كحول طبي معقم 70%',
        nameEn: '70% Isopropyl Surface Disinfectant Wipes',
        purpose: 'مسح وتعقيم الأسطح ومقابض الإضاءة أمام المريض',
        purposeEn: 'Active surface decontamination of light handles, armrests, and delivery console'
      },
      {
        name: 'مريلة المريض ومشبك التعليق',
        nameEn: 'Impervious Patient Bib & Autoclavable Clip',
        purpose: 'حماية ملابس المراجع من الرذاذ والسوائل',
        purposeEn: 'Waterproof barrier protecting patient apparel from bio-aerosol splatter',
        isDisposable: true
      },
      {
        name: 'أدوات الفحص التشخيصي الأساسية',
        nameEn: 'Diagnostic Trio (Front-Surface Mirror, Explorer, Cotton Pliers)',
        purpose: 'فحص الحفرة والنسج المحيطة واستكشاف النخور',
        purposeEn: 'Tactile and visual diagnostic assessment of lesion topography and pulp status'
      },
      {
        name: 'الزي السريري والواقيات الشخصية',
        nameEn: 'PPE (Clinical Gown, Level 3 Mask, Nitrile Gloves, Eye Protection)',
        purpose: 'مكافحة العدوى البيولوجية المتبادلة',
        purposeEn: 'Comprehensive biological barrier against airborne pathogens and splatter',
        isDisposable: true
      },
      {
        name: 'استمارة الحالة والتاريخ الطبي',
        nameEn: 'Clinical Chart, Health History & Informed Consent',
        purpose: 'توثيق الخطة العلاجية والتحقق من الأمراض المزمنة',
        purposeEn: 'Documentation of systemic conditions, allergies, vital signs, and treatment plan'
      },
    ],
    clinicalActions: [
      'مسح جميع أسطح الصينية وأذرع كرسي الأسنان بمحلول الكحول الطبي 70% أمام نظر المراجع لغرس الطمأنينة النفسية (Psychological Trust & Infection Control).',
      'تثبيت مريلة المريض (Patient Towel) بإحكام وتزويد الكوب المعقم بنظام تصريف اللعاب (Saliva Ejector).',
      'فتح أكياس التعقيم المزدوجة المختومة للأدوات التشخيصية (Mouth Mirror, Explorer, Cotton Pliers) أمام المريض.',
      'ارتداء اللابكوت النظيف والكمامة والقفازات بعد إجراء الغسيل الجراحي لليدين لمدة 40 ثانية.',
      'مراجعة استمارة المريض والتأكد من ضغط الدم، أدوية السيولة، وتاريخ التحسس الدوائي قبل فتح أي سنبلة.',
    ],
    clinicalActionsEn: [
      'Decontaminate all delivery surfaces, unit handpiece tubing, and overhead operatory handles with EPA-registered hospital-grade disinfectant directly in the patient sightline to reduce anxiety.',
      'Secure the waterproof patient bib with an autoclavable or disposable clip and install fresh suction tips on the evacuation system.',
      'Aseptically break the autoclave sterilization pouches for diagnostic instruments (front-surface mirror, explorer #23, cotton pliers) in front of the patient.',
      'Don personal protective equipment (PPE) strictly following the 40-second surgical hand disinfection protocol.',
      'Verify medical history, baseline vital signs, systemic anticoagulant medications, and drug allergies prior to rotating any burs.',
    ],
    clinicalPearls: [
      'التعقيم المشاهد بالعين أمام المراجع يقلل قلق العيادة السنية (Dental Anxiety) بنسبة تفوق 60%.',
      'رتّب صينية الفحص بحيث تكون المرآة على أقصى اليمين، تليها البروب، ثم الملقط القطني لتقليل حركة اليد العشوائية.',
    ],
    clinicalPearlsEn: [
      'Witnessed clinical disinfection measurably decreases patient dental anxiety by >60% while establishing doctor-patient rapport.',
      'Arrange diagnostic instruments systematically from right-to-left: Mirror → Explorer → Pliers to eliminate unnecessary hand crossings.',
    ],
    hazardWarnings: [
      'تجنب لمس ملف الحالة الورقي أو الهاتف النقال بالقفازات الطبية المستخدمة نهائياً.',
      'لا تفتح أكياس الأدوات المعقمة إلا بعد جلوس المريض واكتمال مرحلة المسح الكحولي.',
    ],
    hazardWarningsEn: [
      'Never touch paper charts, keyboards, or cell phones with gloved hands to prevent cross-contamination vectors.',
      'Do not breach sterile instrument packaging until the patient is seated and all preliminary surface contact is terminated.',
    ],
    disposableItems: ['كوب الماء الورقي', 'Saliva Ejector', 'Patient Towel', 'قفازات الفحص', 'كمامة طبية'],
    disposableItemsEn: ['Single-use Rinse Cup', 'High-Volume Saliva Ejector', 'Impervious Patient Bib', 'Nitrile Examination Gloves', 'Level 3 Surgical Mask'],
  },
  {
    stepNumber: 2,
    title: 'مرحلة التخدير الموضعي',
    titleEn: 'Local Anesthesia Administration Phase',
    subtitle: 'Carpule, Syringe, Needle, Topical Anesthesia, Cotton',
    subtitleEn: 'Topical mucosa preparation, negative aspiration verification, and slow injection kinetics',
    badge: 'الخطوة 2 • التخدير غير المؤلم',
    badgeEn: 'Step 2 • Painless Anesthetic Delivery',
    keyTools: [
      {
        name: 'كاربولات التخدير الموضعي',
        nameEn: 'Local Anesthetic Dental Cartridges',
        purpose: 'تأمين خدر عميق (Lidocaine 2% + Adrenaline أو Mepivacaine 3%)',
        purposeEn: 'Deep pulpal anesthesia (2% Lidocaine 1:100k epi or 3% plain Mepivacaine for cardiac indications)'
      },
      {
        name: 'محقنة التخدير المعدنية الشافطة',
        nameEn: 'Aspirating Dental Syringe',
        purpose: 'حقن المخدر وإجراء فحص السحب العكسي الإلزامي',
        purposeEn: 'Mandatory negative aspiration capability to rule out intravascular needle penetration'
      },
      {
        name: 'إبر التخدير المعقمة',
        nameEn: 'Sterile Pre-Threaded Needles (27G Long / 30G Short)',
        purpose: 'حقن المخدر موضعياً أو إحصار العصب',
        purposeEn: 'Precision nerve block (27G long for IANB) or supraperiosteal infiltration (30G short)',
        isSharp: true,
        isDisposable: true
      },
      {
        name: 'جل التخدير السطحي',
        nameEn: 'Topical Anesthetic Gel (20% Benzocaine)',
        purpose: 'تخدير نهايات الألياف العصبية المخاطية السطحية',
        purposeEn: 'Desensitization of mucosal free nerve endings to eliminate puncture sensation'
      },
      {
        name: 'لفافات وكريات القطن الطبي',
        nameEn: 'Sterile Cotton Rolls & 2x2 Gauze',
        purpose: 'تجفيف الغشاء المخاطي وعزل المنطقة قبل الحقن',
        purposeEn: 'Mucosal drying and isolation to enhance topical absorption and improve needle vision',
        isDisposable: true
      },
    ],
    clinicalActions: [
      'فحص كاربول التخدير بدقة: التأكد من صلاحيتها، نقاوة السائل من الفقاعات الكبيرة، وسلامة السدادة المطاطية الغائرة.',
      'تجفيف موقع الحقن بقطنة جافة تماماً، ثم تطبيق جل التخدير الموضعي السطحي بواسطة قطنة لمدة دقيقتين كاملتين.',
      'تجهيز المحقنة المعدنية الشافطة (Aspirating Syringe) وتثبيت الإبرة دون نزع الغطاء البلاستيكي الواقي.',
      'تمرير المحقنة من خلف رأس المريض وخارج مجال رؤيته لتجنب الهلع وارتفاع ضغط الدم الوعائي.',
      'شد المخاطية جيداً (Taut Tissue)، إدخال رأس الإبرة بنعومة، إجراء اختبار السحب العكسي (Aspiration Test) مرتين في مستويين للتأكد من عدم الحقن الوريدي، ثم الحقن ببطء شديد (كاربول واحد في 60 ثانية).',
    ],
    clinicalActionsEn: [
      'Inspect anesthetic cartridge: verify expiration, solution clarity, absence of large bubbles (>2mm), and intact rubber plunger.',
      'Completely dry target mucosa with sterile gauze; apply 20% benzocaine topical gel for a full 2 minutes.',
      'Arm the aspirating syringe and engage the harpoon securely before needle sheath removal.',
      'Transfer the syringe beneath or behind patient visual field to avoid triggering vasovagal or hypertensive responses.',
      'Retract tissue tautly; gently insert needle; perform bi-planar aspiration to rule out intravascular placement; inject slowly at 1 mL/minute (60 seconds per 1.8 mL cartridge).',
    ],
    clinicalPearls: [
      'سر الحقن غير المؤلم هو: التجفيف الممتاز + التخدير السطحي لدقيقتين + الحقن البطيء جداً مع شد المخاطية.',
      'مرضى القلب والأوعية: استخدم مخدر ميبفاكايين 3% الخالي من المقبض الوعائي أو حدد الأدرينالين بحد أقصى كاربولين (Cardiac Dose 0.04 mg).',
    ],
    clinicalPearlsEn: [
      'Painless injection triad: Thorough mucosal drying + 2-minute topical contact + Ultra-slow rate (< 1 mL/min) with taut tissue.',
      'Cardiovascular patients: Limit epinephrine to the cardiac dose (0.04 mg, maximum 2 cartridges 1:100,000) or utilize 3% plain mepivacaine.',
    ],
    hazardWarnings: [
      'خطر الحقن داخل وعاء دموي (Intravascular Injection): السحب العكسي السلبي شرط إلزامي قبل دفع أي قطرة مخدر.',
      'عدم إعادة تغطية الإبرة باليدين؛ استخدم تقنية التجريف بيد واحدة (One-Handed Scoop Technique).',
    ],
    hazardWarningsEn: [
      'Intravascular injection risk: Mandatory negative aspiration in two rotational planes before injecting any volume.',
      'Never recap needles using two hands; employ the single-handed scoop technique or a mechanical recapping device to eliminate needlestick injuries.',
    ],
    disposableItems: ['إبرة التخدير', 'كاربول المخدر', 'لفافات قطن التخدير السطحي', 'شاش طبي معقم'],
    disposableItemsEn: ['Sterile Dental Needle', 'Exhausted Glass Cartridge', 'Topical Cotton Swabs', 'Sterile 2x2 Gauze'],
  },
  {
    stepNumber: 3,
    title: 'التحضير السريري وتجريف النخر',
    titleEn: 'Cavity Preparation & Selective Caries Excavation',
    subtitle: 'Turbine vs Slow-speed Handpiece, Round & Fissure Burs, Inside-out Motion, Deep Caries Pulp Protection',
    subtitleEn: 'High-speed enamel access, slow-speed tactile excavation, and vital pulp preservation',
    badge: 'الخطوة 3 • هندسة الحفر وحماية اللب',
    badgeEn: 'Step 3 • Biomimetic Preparation & Pulp Shielding',
    keyTools: [
      {
        name: 'القبضة التوربينية عالية السرعة',
        nameEn: 'High-Speed Air Turbine Handpiece',
        purpose: 'فتح الميناء القاسي وتحديد الخطوط العريضة للحفرة السنية',
        purposeEn: 'Rapid enamel penetration and outline form development under copious water irrigation (>50 mL/min)'
      },
      {
        name: 'القبضة البطيئة (الميكروموتور)',
        nameEn: 'Low-Speed Contra-Angle Micromotor',
        purpose: 'التجريف الدقيق للعاج النخر والتحكم بالعمق دون تسخين',
        purposeEn: 'Tactile, controlled excavation of soft infected dentin without friction overheating'
      },
      {
        name: 'سنابل الشق والسنفرة',
        nameEn: 'Pear & Fissure Carbide Burs (#330, #245)',
        purpose: 'رسم حدود الحفرة وتدوير الزوايا الداخلية',
        purposeEn: 'Cavosurface line definition and internal line angle rounding to relieve stress concentration'
      },
      {
        name: 'سنابل كروية كربيدية ومجرفة العاج',
        nameEn: 'Round Carbide Burs (#4 / #6) & Spoon Excavators',
        purpose: 'إزالة العاج العفن والمتنخر بحركة لطيفة',
        purposeEn: 'Selective removal of infected soft dentin while preserving remineralizable affected dentin'
      },
      {
        name: 'مواد حماية اللب للنخور العميقة',
        nameEn: 'Biomimetic Pulp Liners (Biodentine / TheraCal LC / RMGI)',
        purpose: 'تغطية اللب وحمايته حرارياً وكيميائياً وتشجيع تشكل العاج الترميمي',
        purposeEn: 'Thermal, mechanical, and biological pulpal insulation in deep preparations (<0.5 mm to pulp)'
      },
    ],
    clinicalActions: [
      'البدء بالقبضة التوربينية عالية السرعة لفتح الميناء المنخور وتحديد محيط الحفرة السنية مع تبريد مائي غزير مستمر (> 50 ml/min).',
      'الانتقال الفوري إلى القبضة البطيئة (Slow-Speed) مع سنبلة كروية كربيدية كبيرة الحجم (#4 أو #6) لإزالة العاج الرخو بحركة دائرية لطيفة من المحيط نحو المركز (From Inside Out Motion).',
      'استخدام مجرفة العاج اليدوية (Spoon Excavator) عند الاقتراب من سقف الحجرة اللبية لتجنب الانكشاف اللبي الميكانيكي الرضي (Accidental Pulp Exposure).',
      'في النخور العميقة جداً القريبة من اللب (< 0.5 mm): تطبيق مادة محفزة مثل Biodentine أو TheraCal LC، ثم تغطيتها ببطانة زجاجية الشاردة (RMGI Liner) بسماكة 1 مم.',
      'شطف الحفرة بالرذاذ وتجفيفها بلطف دون تجفيف زائد للعاج العاري (Avoid Dentin Desiccation).',
    ],
    clinicalActionsEn: [
      'Initiate cavity access using high-speed diamond/carbide burs under continuous water coolant (> 50 mL/min) to prevent pulpal hyperthermia.',
      'Switch immediately to slow-speed micromotor with large round carbide bur (#4 or #6) for peripheral caries clearance before deep excavation.',
      'Utilize sharp spoon hand excavators adjacent to pulpal axial walls to prevent traumatic mechanical pulp exposure.',
      'In deep caries (<0.5 mm remaining dentin thickness): apply hydraulic calcium silicate (Biodentine / MTA / TheraCal) sealed with a 1 mm RMGI protective liner.',
      'Gently rinse and blot dry; avoid aggressive air desiccation to prevent odontoblast aspiration into dentinal tubules.',
    ],
    clinicalPearls: [
      'حركة السنبلة الكروية من الخارج للداخل تدفع البكتيريا للعمق؛ بينما الحركة من الداخل للخارج (Inside-Out) تحمي اللب وتجرف النخر بأمان.',
      'التبريد المائي ليس لتنظيف الرؤية فقط، بل لمنع ارتفاع حرارة اللب بأكثر من 5.5°C المؤدية للنخر اللبي اللاعكوس.',
    ],
    clinicalPearlsEn: [
      'Peripheral seal concept: Establish clean, caries-free enamel/dentin margins first before addressing the pulpal floor.',
      'Intrapulpal temperature rise of >5.5°C produces irreversible necrosis in 15% of teeth; copious water coolant is clinically non-negotiable.',
    ],
    hazardWarnings: [
      'التجريف العنيف بالسرعة العالية في عمق الحفرة ينتهي حتماً بانكشاف لبي غير ضروري وإحالة إلى علاج جذور.',
      'التجفيف الزائد بالهواء القوي يسبب موت الخلايا المصورة للعاج (Odontoblast Aspiration).',
    ],
    hazardWarningsEn: [
      'Aggressive high-speed excavation near pulp walls frequently results in avoidable exposures requiring endodontic intervention.',
      'Severe air blast desiccation causes hydrodynamic fluid movement and lethal odontoblast aspiration into tubules.',
    ],
    disposableItems: ['رؤوس ماء وهواء التورباين', 'أطراف الشفاط الجراحي', 'قطن عزل مؤقت'],
    disposableItemsEn: ['Air/Water Syringe Tips', 'High-Volume Evacuator Tips', 'Temporary Cotton Rolls'],
  },
  {
    stepNumber: 4,
    title: 'العزل المطلق والتحصين الميداني',
    titleEn: 'Absolute Rubber Dam & Liquid Barrier Isolation',
    subtitle: 'Rubber Dam Sheet, Clamp, Punch, Frame, Forceps, Teflon Tape, Dental Floss, Liquid Dam',
    subtitleEn: 'Moisture exclusion, four-point clamp stability, and crevicular inversion protocol',
    badge: 'الخطوة 4 • العزل الذهبي',
    badgeEn: 'Step 4 • Gold Standard Hermetic Isolation',
    keyTools: [
      {
        name: 'صفيحة الرابر دام الطبية',
        nameEn: 'Heavy-Gauge Latex/Non-Latex Dam Sheet',
        purpose: 'منع وصول اللعاب ورذاذ الفم وتأمين بيئة كيميائية جافة 100%',
        purposeEn: '100% moisture and biological aerosol exclusion providing optimal adhesive substrate'
      },
      {
        name: 'مشابك العزل السني المتخصصة',
        nameEn: 'Anatomical Rubber Dam Clamps (#W8A, #2, #14A)',
        purpose: 'تثبيت الصفيحة على عنق السن (#W8A, #2, #14A, #209)',
        purposeEn: 'Subgingival four-point cervical anchorage below the tooth height of contour'
      },
      {
        name: 'مثقاب الرابر دام وإطار التثبيت',
        nameEn: 'Ainsworth Dam Punch & Young Frame',
        purpose: 'تثقيب الصفيحة بدقة وتمديدها بانسيابية مريحة',
        purposeEn: 'Calibrated hole perforation and facial tensioning of the isolation barrier'
      },
      {
        name: 'ملقط المشابك السنية',
        nameEn: 'Brewer / Stokes Clamp Forceps',
        purpose: 'توسيع المشبك ووضعه وتجاوز أقصى تحدب تاجي بدقة',
        purposeEn: 'Controlled placement and release of clamp jaw spring tension'
      },
      {
        name: 'شريط التفلون الطبي وخيط الأمان',
        nameEn: 'Medical PTFE Teflon Tape & Safety Floss Ligature',
        purpose: 'قلب حواف الرابر دام بالميزاب اللثوي وتأمين المشبك من الابتلاع',
        purposeEn: 'Crevicular inversion seal and aspirated clamp tether safety line',
        isDisposable: true
      },
      {
        name: 'الرابر دام السائل المصلب ضوئياً',
        nameEn: 'Light-Cured Resin Gingival Barrier (Liquid Dam)',
        purpose: 'سد التنسيم اللعابي المجهري بين المشبك واللثة',
        purposeEn: 'Micro-leakage sealing at irregular marginal or interdental gingival embrasures'
      },
    ],
    clinicalActions: [
      'ربط مشبك الرابر دام دائماً بخيط سني أمان (Floss Ligature) بطول 30 سم متدلي خارج الفم لحماية المريض من خطر البلع أو الاستنشاق.',
      'تثبيت المشبك تحت أقصى محيط للسن (Sub-gingival / Below Height of Contour) والتأكد من ثباته الرباعي النقاط (Four-point Contact).',
      'تمرير صفيحة الرابر دام فوق المشبك ثم تركيب الإطار المعدني أو البلاستيكي (Young Frame).',
      'قلب حواف المطاط حول أعناق الأسنان (Inversion) باستخدام شريط تفلون طبي (PTFE) ومسبار دقيق لضمان الختم الهيدروليكي المحكم.',
      'عند وجود فجوات لثوية متبقية: تطبيق طبقة رقيقة من الرابر دام السائل (Liquid Dam) وتصليبه بالضوء لمدة 10 ثوانٍ لمنع أي تسريب لعابي قطعي.',
    ],
    clinicalActionsEn: [
      'Tether every clamp securely with a 30 cm dental floss ligature draped outside the mouth to protect against accidental aspiration or ingestion.',
      'Engage clamp jaws below the maximum cervical height of contour, verifying rock-solid 4-point stability before release.',
      'Seat the dam sheet through interproximal spaces and tension over the Young frame.',
      'Perform inverted sulcular sealing using PTFE tape or dental floss ligatures to ensure complete hydrostatic seal against sulcular seepage.',
      'Deploy flowable light-curing liquid barrier at interproximal gaps and polymerize for 10 seconds to guarantee zero salivary contamination.',
    ],
    clinicalPearls: [
      'لا يوجد ترميم كومبوزيت موثوق دون عزل رابر دام؛ رطوبة الفم تخفض قوة الالتصاق الهجين (Bond Strength) بنسبة 50%.',
      'شريط التفلون (Teflon Tape) هو السلاح السري للعيادة الذكية لقلب الحواف وحماية السن المجاور من الحمض.',
    ],
    clinicalPearlsEn: [
      'Dental composite durability is mathematically impossible without rubber dam; intraoral humidity drops micro-tensile bond strength by 50%.',
      'Medical PTFE tape is the ultimate chairside tool for sulcular inversion and protecting adjacent enamel from unintended acid etch.',
    ],
    hazardWarnings: [
      'تركيب مشبك غير مربوط بخيط أسنان خطأ طبي جسيم يعرض المريض للاختناق حال كسر المشبك.',
      'الضغط المفرط على اللثة بمشبك ذي فكين حادين قد يسبب رضوضاً لثوية وتراجعاً عنقياً غير ردود.',
    ],
    hazardWarningsEn: [
      'Placing an unligated clamp is a severe safety violation that exposes the patient to airway obstruction in the event of clamp fracture.',
      'Excessive subgingival clamping with sharp jaws causes irreversible periodontal attachment loss and gingival recession.',
    ],
    disposableItems: ['صفيحة الرابر دام', 'شريط التفلون الطبي', 'خيط الأسنان', 'رأس حقن الرابر دام السائل'],
    disposableItemsEn: ['Rubber Dam Sheet', 'Medical PTFE Teflon Tape', 'Waxed Dental Floss', 'Liquid Dam Dispensing Tips'],
  },
  {
    stepNumber: 5,
    title: 'التنظيف والفرز المؤقت للنفايات الحادة',
    titleEn: 'Cavity Decontamination & Sharps Waste Segregation',
    subtitle: 'Caries Detector, Immediate Removal & Sorting of Used Burs/Needles/Dam into Separate Sharps Bag',
    subtitleEn: 'Selective dye staining, 2% CHX MMP inhibition, and chairside sharps containment',
    badge: 'الخطوة 5 • نقاء السطح والفرز الفوري',
    badgeEn: 'Step 5 • Substrate Disinfection & Sharps Safety',
    keyTools: [
      {
        name: 'كاشف النخر السريري',
        nameEn: 'Caries Detector Dye (1% Acid Red in Propylene Glycol)',
        purpose: 'تمييز العاج المنخر غير القابل للترميم عن العاج السليم القابل للتكلس',
        purposeEn: 'Selective differentiation between denatured infected dentin and remineralizable affected dentin'
      },
      {
        name: 'مطهر الحفر السنية 2%',
        nameEn: '2% Chlorhexidine Gluconate (CHX) Cavity Cleanser',
        purpose: 'تعقيم الحفرة وتثبيط إنزيمات MMPs المفككة لطبقة الالتصاق',
        purposeEn: 'Inhibition of host Matrix Metalloproteinases (MMPs) to preserve hybrid layer collagen integrity'
      },
      {
        name: 'حاوية النفايات الحادة الفورية',
        nameEn: 'Point-of-Use Sharps Disposal Container',
        purpose: 'إيداع الإبر والمشارط والسنابل المستعملة فوراً لمنع وخز الأصابع',
        purposeEn: 'Immediate disposal of anesthetic needles, scalpel blades, and worn burs at point-of-use'
      },
      {
        name: 'كيس النفايات الحيوية المزدوج',
        nameEn: 'Regulated Biohazard Waste Bag',
        purpose: 'عزل القطن الملوث والرذاذ عن أدوات الصينية النظيفة',
        purposeEn: 'Segregation of blood/saliva contaminated disposables from the restorative tray zone'
      },
    ],
    clinicalActions: [
      'وضع قطرة من كاشف النخر السريري داخل الحفرة لمدة 10 ثوانٍ، ثم الغسل بالماء؛ إزالة العاج المصطبغ بشدة (Infected Dentin) فقط.',
      'تطبيق محلول الكلورهيكسيدين 2% (2% CHX) بقطنة لمدة 30-60 ثانية لتطهير الحفرة وتثبيط إنزيمات Matrix Metalloproteinases (MMPs) لإطالة عمر الرابطة السنية.',
      'الفرز السريري الفوري: إزالة إبرة التخدير المستعملة والمشارط فوراً ووضعها في صندوق الأدوات الحادة (Sharps Container) دون تركها على الصينية.',
      'فرز وعزل السنابل المستعملة ونقل القطن الملوث إلى كيس النفايات البيولوجية.',
      'مسح الطاولة لتكون نظيفة 100% وخالية من أي مخلفات قبل الانتقال لمرحلة الحشو التجميلي الحساسة.',
    ],
    clinicalActionsEn: [
      'Apply 1% caries detector dye for 10 seconds, then rinse with water; excavate solely the irreversibly denatured dark-stained infected dentin.',
      'Apply 2% chlorhexidine gluconate solution for 60 seconds to suppress host MMP enzymes and stabilize collagen fibrils in the hybrid layer.',
      'Execute immediate sharps segregation: dispose of anesthetic needles and surgical blades into the rigid sharps box rather than resting on the tray.',
      'Clear used rotary burs and bio-contaminated gauze into regulated biohazard receptacles.',
      'Wipe down delivery tray working surfaces to establish an immaculate field before unsealing adhesive restorative components.',
    ],
    clinicalPearls: [
      'الكلورهيكسيدين 2% يزيد ديمومة طبقة الهجين (Hybrid Layer Longevity) بمقدار الضعف عبر تثبيط الإنزيمات المحللة للكولاجين.',
      'تنظيف الطاولة وفرز الأدوات الحادة قبل مرحلة الترميم يمنع حوادث الوخز العرضي ويصفي ذهن الطبيب للتركيز على التشريح السني.',
    ],
    clinicalPearlsEn: [
      'Pre-treating etched dentin with 2% CHX inhibits MMPs-2, -8, -9, doubling long-term resin-dentin bond durability.',
      'Point-of-use sharps clearance eliminates 85% of institutional percutaneous injuries and clears mental clutter for precise restorative sculpting.',
    ],
    hazardWarnings: [
      'ترك إبر التخدير المكشوفة على صينية الأدوات أثناء مرحلة الحشو هو السبب الأول لحوادث الوخز بالإبر في كليات طب الأسنان.',
      'الإفراط في حفر العاج المتلون الوردي الفاتح (Affected Dentin) يؤدي لانكشاف لبي يمكن تجنبه بسهولة.',
    ],
    hazardWarningsEn: [
      'Leaving exposed anesthetic needles on working trays is the #1 etiology of occupational bloodborne exposure in dental faculties.',
      'Over-excavating light pink/tan affected dentin unnecessarily compromises pulpal vitality without improving adhesive prognosis.',
    ],
    disposableItems: ['فرشاة كاشف النخر', 'قطن الكلورهيكسيدين', 'كيس النفايات الحيوية', 'إبرة التخدير (في علبة الحاد)'],
    disposableItemsEn: ['Dye Micro-applicators', 'CHX Cotton Pellets', 'Biohazard Disposal Liners', 'Protected Needles in Sharps Bin'],
  },
  {
    stepNumber: 6,
    title: 'البناء والترميم التجميلي',
    titleEn: 'Adhesive Protocol & Incremental Stratification',
    subtitle: 'Acid Etch, Bonding, Flowable Composite, Brush, Composite Instruments, Light Cure, Active Isolation',
    subtitleEn: 'Selective/total etching, active monomer scrubbing, C-factor relief, and anatomical curing',
    badge: 'الخطوة 6 • فن الترميم النانوي',
    badgeEn: 'Step 6 • Nanohybrid Biomimetic Stratification',
    keyTools: [
      {
        name: 'حمض الفوسفوريك للتخريش 37%',
        nameEn: '37% Phosphoric Acid Etchant Gel',
        purpose: 'تخريش الميناء والعاج لفتح الأنابيب العاجية وصنع ميكرو-مسامات مجهرية',
        purposeEn: 'Enamel microporosity creation (30 sec) and dentinal smear layer demineralization (15 sec max)'
      },
      {
        name: 'عامل الربط والالتصاق السني',
        nameEn: 'Universal / Total-Etch Dental Adhesive',
        purpose: 'تخلل شبكة الكولاجين وتكوين طبقة الهجين الهيكلية المتينة',
        purposeEn: 'Collagen infiltration and strong hybrid layer formation via hydrophilic/hydrophobic monomers'
      },
      {
        name: 'الكومبوزيت السائل الوسائدي',
        nameEn: 'Flowable Resin Composite (Base Liner)',
        purpose: 'تبطين قاع الحفرة وامتصاص إجهادات الانكماش الحجمي (C-Factor Relief)',
        purposeEn: 'Cavity floor stress-absorbing elastic liner (0.5-1.0 mm) and void-free marginal adaptation'
      },
      {
        name: 'فرشاة البوندينغ الدقيقة',
        nameEn: 'Disposable Micro-Applicator Tip',
        purpose: 'فرك البوندينغ بحركة نشطة وإيصاله لكل ثنية دقيقة',
        purposeEn: 'Active 20-second mechanical scrubbing to maximize resin penetration into collagen matrix',
        isDisposable: true
      },
      {
        name: 'أدوات تشكيل الكومبوزيت غير اللاصقة',
        nameEn: 'Titanium Nitride / Non-Stick Restorative Instruments',
        purpose: 'نحت الحدبات والميازيب السنية دون التصاق المعجون',
        purposeEn: 'Smooth cusp sculpting, fissural carving, and contouring without resin pull-back'
      },
      {
        name: 'معجون الكومبوزيت النانوي',
        nameEn: 'Nanohybrid / Microhybrid Resin Composite Paste',
        purpose: 'إعادة بناء التشريح السني بمطابقة لونية دقيقة ومقاومة تآكل عالية',
        purposeEn: 'High-filler structural dentin and enamel replacement with low polymerization shrinkage'
      },
      {
        name: 'جهاز البلمرة الضوئية عالي الشدة',
        nameEn: 'Broad-Spectrum Multi-LED Curing Light (>1200 mW/cm²)',
        purpose: 'تصليد طبقات الكومبوزيت بنسبة تحول بلمري كاملة',
        purposeEn: 'Complete monomer conversion across polywave wavelengths (camphorquinone & photo-initiators)'
      },
    ],
    clinicalActions: [
      'التخريش الحمضي (Acid Etching): تطبيق الجل على الميناء لمدة 15-30 ثانية وعلى العاج لمدة 10-15 ثانية كحد أقصى، ثم الغسل بالماء الغزير لمدة مساوية.',
      'التجفيف بالهواء اللطيف مع إبقاء سطح العاج رطباً قليلاً كالجلد اللامع (Moist Dentin Technique - تجنب جفاف الكولاجين التام).',
      'تطبيق مادة البوندينغ مع الفرك السريري النشط (Active Scrubbing) لمدة 20 ثانية، يليه نفخ هواء لطيف لتبخير المذيب (Solvent Evaporation)، ثم التصليب الضوئي لـ 10-20 ثانية.',
      'وضع طبقة رقيقة من الكومبوزيت السائل (0.5 - 1 مم) في قاع الحفرة والزوايا لتقليل معامل الانكماش (C-Factor Stress) وتصليبها بالضوء.',
      'البناء الطبقي المتدرج (Incremental Layering): بناء طبقات مائلة (Oblique Layers) بسماكة لا تتجاوز 2 مم ونحت الحدبات والميازيب تشريحياً قبل التصليب الضوئي الكامل لكل طبقة.',
    ],
    clinicalActionsEn: [
      'Phosphoric acid conditioning: Etch enamel for 15-30 seconds and dentin for max 15 seconds (selective or total-etch); thoroughly rinse with copious water.',
      'Preserve moist dentin substrate (resembling glistening skin); avoid desiccating and collapsing collagen fibrils.',
      'Vigorously scrub universal adhesive for 20 continuous seconds, gently air-thin for 5 seconds to evaporate volatile solvents, then light cure for 10-20 seconds.',
      'Place a 0.5 mm flowable composite stress-relief liner along internal line angles and light cure.',
      'Incrementally layer composite obliquely in increments ≤ 2.0 mm, curing each layer to mitigate high configuration factor (C-factor) stresses and marginal gap formation.',
    ],
    clinicalPearls: [
      'الفرك النشط للبوندينغ لـ 20 ثانية يرفع قوة الالتصاق بنسبة 35% بالمقارنة مع التطبيق الساكن.',
      'البناء الطبقي المائل يمنع شد الجدران المتقابلة ويقضي على حساسية ما بعد الترميم الناتجة عن الـ C-Factor.',
    ],
    clinicalPearlsEn: [
      'Active mechanical scrubbing of bonding agent increases resin penetration and micro-tensile bond strength by 35% over passive spreading.',
      'Oblique incremental placement disconnects opposing cavity walls, neutralizing polymerization shrinkage stress and eliminating post-operative sensitivity.',
    ],
    hazardWarnings: [
      'تخريش العاج لأكثر من 15 ثانية يهدم شبكة الكولاجين ويمنع تغلغل البوند، مسبباً فشل الالتصاق والتحسس المؤلم.',
      'تصليد طبقة كومبوزيت تزيد سماكتها عن 2 مم يترك قاع الطبقة غير متصلب وساماً للب السني.',
    ],
    hazardWarningsEn: [
      'Etching dentin beyond 15 seconds demineralizes deeper than monomer penetration depth, creating an unprotected, hydrolytically unstable collagen zone.',
      'Photopolymerizing composite increments thicker than 2.0 mm leaves uncured, cytotoxic free monomer at the cavity floor.',
    ],
    disposableItems: ['رأس إبرة حمض التخريش', 'فرشاة Micro-applicator', 'غلاف حماية جهاز الضوء'],
    disposableItemsEn: ['Etchant Dispensing Needle', 'Micro-Applicator Brushes', 'Curing Light Protective Sheath'],
  },
  {
    stepNumber: 7,
    title: 'الإنهاء، الصقل، وفحص الإطباق وراحة المريض',
    titleEn: 'Finishing, Dynamic Occlusion Analysis & Follow-Up',
    subtitle: 'Rubber Dam Removal, Centric vs Non-centric Occlusion, Dual-color Articulating Paper, Finishing Burs & Disks',
    subtitleEn: 'Dam removal, centric target contact clearance, micro-fine diamond polishing, and post-op care',
    badge: 'الخطوة 7 • الختام المتقن والإطباق الحيوي',
    badgeEn: 'Step 7 • Harmonic Occlusion & High-Luster Gloss',
    keyTools: [
      {
        name: 'أدوات فك الرابر دام بأمان',
        nameEn: 'Rubber Dam Removal Scissors & Forceps',
        purpose: 'قص الحواجز المطاطية وإزالة المشبك دون رض اللثة',
        purposeEn: 'Severing interdental septa to withdraw sheet and clamp without traumatizing gingival papillae'
      },
      {
        name: 'ورق فحص العض ثنائي اللون',
        nameEn: 'Dual-Color Articulating Paper (Blue/Red 40-100µm)',
        purpose: 'تمييز نقاط التماس الإطباقي المركزي عن حركات المضغ الديناميكية',
        purposeEn: 'Color discrimination between centric static holding contacts (blue) and dynamic excursion interferences (red)'
      },
      {
        name: 'ملقط ورق العض السريري',
        nameEn: 'Miller Articulating Paper Forceps',
        purpose: 'توجيه ورق العض داخل فم المراجع بأمان وسهولة',
        purposeEn: 'Intraoral positioning and stabilization of articulating ribbon during mandibular movement'
      },
      {
        name: 'سنابل الإنهاء الكربيدية والماسية الدقيقة',
        nameEn: 'Ultra-Fine Finishing Diamonds & Multi-Fluted Burs',
        purpose: 'إزالة الزوائد وتحديد الحواف وتنعيم السطوح',
        purposeEn: 'Recontouring cavosurface margins and refining secondary anatomical developmental grooves'
      },
      {
        name: 'أقراص الصقل المتدرجة',
        nameEn: 'Sequential Polishing Discs (Coarse to Super-Fine)',
        purpose: 'صقل السطوح الملاصقة والحدبات بدرجات خشونة متدرجة',
        purposeEn: 'Embrasure sculpting and proximal margin smoothing with progressive aluminum oxide grits'
      },
      {
        name: 'كؤوس التلميع ومعجون أكسيد الألومنيوم',
        nameEn: 'Diamond Impregnated Silicon Points & Polishing Paste',
        purpose: 'الوصول إلى لمعان مجهري زجاجي يطابق الميناء الطبيعي',
        purposeEn: 'Sub-micron surface gloss achievement to inhibit bacterial biofilm retention'
      },
      {
        name: 'خيط الأسنان الطبي لفحص نقاط التماس',
        nameEn: 'Waxed Dental Floss for Contact Verification',
        purpose: 'التأكد من سلامة نقطة التماس ومقاومة الخيط الطبيعية دون تمزق',
        purposeEn: 'Verifying firm interproximal contact snapping without fraying or overhang snagging',
        isDisposable: true
      },
    ],
    clinicalActions: [
      'قص الحواجز بين السنية للرابر دام بالمقص وإزالة المشبك بلطف، ثم تفقد الصفيحة للتأكد من عدم بقاء أي جزء مطاطي محشور بين الأسنان.',
      'فحص الإطباق المركزي (Centric Occlusion) بورق العض الأزرق بحركات إغلاق عمودية بسيطة: البحث عن نقاط التحميل الزائد (High Spots / Target Marks - حلقة داكنة بمركز شفاف).',
      'فحص الحركات الديناميكية الجانبية والتقدمية (Non-Centric / Lateral & Protrusive Excursions) بورق العض الأحمر؛ وتعديل أي إعاقة إطباقية بالسنابل الدقيقة صفراء الشريط.',
      'صقل الحواف وتلميع الكومبوزيت بأقراص Sof-Lex المتدرجة من الخشن إلى فائق النعومة، ثم تطبيق كؤوس السيليكون ومعجون التلميع اللامع.',
      'تمرير خيط الأسنان بين الأسنان للتأكد من إحكام نقطة التماس الملاصقة (Tight Contact Point) وخلو الميزاب من أي بقايا صلبة.',
      'تقديم كوب الماء للمراجع، شطف الفم بالكامل، التأكد بمرآة يدوية من رضاه التام، وتقديم تعليمات ما بعد زوال التخدير (تجنب العض على الخد أو الشفة لـ 2-3 ساعات).',
    ],
    clinicalActionsEn: [
      'Clip each interdental rubber dam septum with scissors before clamp release; inspect the retrieved sheet against backlighting to ensure no rubber fragments remain trapped.',
      'Evaluate static centric occlusion with blue articulating paper: locate and relieve high spots (characterized by doughnut-shaped target rings with clear centers).',
      'Assess excursive lateral and protrusive mandibular kinematics with red articulating ribbon; selectively recontour interfering excursive contacts.',
      'Polish composite systematically using multi-fluted carbide burs, sequential discs, and diamond-impregnated silicone polishers to reach enamel-like surface smoothness (Ra < 0.2 µm).',
      'Floss through proximal contacts to confirm natural snap and absence of cervical composite flash or overhangs.',
      'Offer rinse cup, present hand mirror to patient for aesthetic confirmation, and deliver post-operative anesthesia instructions (avoid hot liquids and chewing until sensation returns).',
    ],
    clinicalPearls: [
      'نقطة التماس الإطباقية السليمة تظهر كـ "نقطة صغيرة متجانسة"؛ أما العلو الإطباقي (High Spot) فيظهر كـ "دائرة أو حلقة فارغة المركز Target Mark" ويجب تسويتها فوراً.',
      'الصقل فائق النعومة ليس تجميلياً فحسب، بل يمنع التصاق البيوفيلم والبكتيريا وتغير لون الحشوة مع الزمن.',
    ],
    clinicalPearlsEn: [
      'Target sign recognition: A genuine holding contact registers as a discrete dot; a heavy premature contact registers as a halo ring with a cleared center.',
      'Enamel-grade polishing (Ra < 0.2 µm) is a biological necessity that prevents Streptococcus mutans biofilm colonization and marginal staining.',
    ],
    hazardWarnings: [
      'إهمال فحص الحركات الجانبية يسبب آلاماً مفصلية (TMJ Pain) والتهاب دواعم السن الإطباقي الحاد (Acute Apical Periodontitis) بعد زوال الخدر.',
      'عدم تحذير المريض من خدر الشفة واللسان يؤدي لعض ذاتي مؤلم وتشكل قرحات رضحية (Traumatic Ulcers) خاصة عند الأطفال واليافعين.',
    ],
    hazardWarningsEn: [
      'Failing to relieve dynamic excursive interferences generates acute apical periodontitis, fracture of restoration or cusps, and temporomandibular joint pain.',
      'Omitting verbal and written soft-tissue anesthesia warnings leads to severe self-inflicted lip/cheek lacerations and traumatic ulcerations.',
    ],
    disposableItems: ['ورق العض ثنائي اللون', 'أقراص Sof-Lex المستعملة', 'خيط الأسنان', 'كوب الماء النهائي'],
    disposableItemsEn: ['Articulating Ribbon', 'Spent Finishing Discs', 'Waxed Dental Floss', 'Final Patient Rinse Cup'],
  },
];
