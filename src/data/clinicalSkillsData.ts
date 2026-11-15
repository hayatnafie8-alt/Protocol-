/**
 * Comprehensive Clinical Skills Data
 * Covering:
 * - Local Anesthesia Techniques (IANB, Buccal, Mental, Palatine/Nasopalatine, Infiltration)
 * - Rubber Dam Isolation Methods (Wingless, Winged, Split Dam/Deep Margin)
 * - Dental Suture Techniques (Simple Interrupted, Continuous, Mattress, Figure-of-Eight)
 * 
 * Features full CRUD support, visibility toggling (Admin vs Subscriber),
 * anatomical landmarks, insertion angles, penetration depths, and aspiration safety steps.
 */

export interface SkillStep {
  stepNumber: number;
  title: string;
  instruction: string;
  clinicalTip?: string;
  dangerZoneWarning?: string;
  visualDetail?: string;
}

export interface ClinicalPhotoAsset {
  id: string;
  url: string;
  title: string;
  caption: string;
  cameraAngle: string;
  clinicalPhase?: string;
  landmarksIdentified?: string[];
  magnification?: string;
}

export const CLINICAL_SKILL_PHOTOS = {
  ianb: '/src/assets/images/anes_ianb_real_1790761803563.jpg',
  buccal: '/src/assets/images/anes_buccal_real_1790761815191.jpg',
  incisive: '/src/assets/images/anes_incisive_real_1790761825018.jpg',
  mental: '/src/assets/images/anes_mental_real_1790761834627.jpg',
  infiltration: '/src/assets/images/anes_infiltration_photo_1790684877731.jpg',
  palatine: '/src/assets/images/anes_palatine_photo_1790684940128.jpg',
  rubberDamWingless: '/src/assets/images/dam_clamp_real_1790761847700.jpg',
  rubberDamWinged: '/src/assets/images/rubberdam_winged_photo_1790684925217.jpg',
  rubberDamSplit: '/src/assets/images/rubberdam_split_photo_1790684889575.jpg',
  sutureInterrupted: '/src/assets/images/suture_field_real_1790761859404.jpg',
  sutureContinuous: '/src/assets/images/suture_continuous_photo_1790684960885.jpg',
  sutureMattress: '/src/assets/images/suture_mattress_photo_1790684974491.jpg',
  sutureFigure8: '/src/assets/images/suture_field_real_1790761859404.jpg',
};

export function getDefaultPhotosForSkill(diagramType: string, skillId?: string): ClinicalPhotoAsset[] {
  switch (diagramType) {
    case 'ianb':
      return [
        {
          id: 'photo-ianb-1',
          url: CLINICAL_SKILL_PHOTOS.ianb,
          title: 'صورة سريرية حقيقية: اختراق محقنة التخدير للتجويف الجناحي الفكي (IANB)',
          caption: 'لقطة فموية ماكرو تظهر محقنة تخدير معدنية بإبرة طويلة تخترق التجويف الجناحي الفكي، مع إبهام اليد الحرة في الثلمة التاجية (Coronoid notch) ووضوح الرباط الجناحي الفكي بارتفاع 6-10 ملم فوق المستوى الإطباقي للفك السفلي.',
          cameraAngle: 'زاوية مائلة داخل الفم 45° باتجاه الرأد الصاعد من الضواحك المقابلة',
          clinicalPhase: 'تحديد المعالم التشريحية واختراق الفراغ الجناحي الفكي حتى ملامسة العظم',
          landmarksIdentified: ['Coronoid Notch (Index/Thumb)', 'Pterygomandibular Raphe', 'Injection Point 6-10mm Above Occlusal Plane', 'Contralateral Premolar Barrel Angle'],
          magnification: 'عدسة سريرية ماكرو 1:1 فائقة الوضوح',
        },
        {
          id: 'photo-ianb-2',
          url: CLINICAL_SKILL_PHOTOS.infiltration,
          title: 'لقطة توجيه المحقنة وتفادي العصب الوجهي',
          caption: 'توجيه برميل المحقنة فوق الضواحك المقابلة لضمان ملامسة العظم على عمق 20-25 ملم فوق اللسين.',
          cameraAngle: 'رؤية إطباقية مائلة من جهة الضواحك المقابلة',
          clinicalPhase: 'مسار الإبرة والتلامس العظمي اللطيف',
          landmarksIdentified: ['Contralateral Premolars Axis', 'Mandibular Occlusal Plane + 8mm'],
          magnification: 'تصوير سريري داخل فموي عالي الدقة',
        },
      ];
    case 'buccal':
      return [
        {
          id: 'photo-buccal-1',
          url: CLINICAL_SKILL_PHOTOS.buccal,
          title: 'صورة سريرية حقيقية: اختراق الميزاب الدهليزي خلف الطاحن الأخير (Long Buccal)',
          caption: 'تصوير ماكرو عيادي يوضح اختراق الإبرة بدقة في الميزاب الدهليزي والارتباط المخاطي اللثوي (Mucogingival Junction) خلف الطاحن الأخير للفك السفلي موازياً لسطح الإطباق مع شد الخد بمرآة الفحص.',
          cameraAngle: 'زاوية جانبية دهليزية سفلية موازية لسطح الإطباق',
          clinicalPhase: 'حقن العصب الشدقي (Long Buccal Nerve Block)',
          landmarksIdentified: ['Mucogingival Junction of Last Mandibular Molar', 'Distobuccal Fold', 'External Oblique Ridge'],
          magnification: 'ماكرو سريري سريري دقيق',
        },
      ];
    case 'incisive':
      return [
        {
          id: 'photo-incisive-1',
          url: CLINICAL_SKILL_PHOTOS.incisive,
          title: 'صورة سريرية حقيقية: حصار العصب القاطع السفلي مع الضغط الرقمي الإلزامي (Incisive Block)',
          caption: 'لقطة فموية ماكرو للفك السفلي حصراً (Mandibular Premolar View Only) تظهر إدخال الإبرة في قاع الميزاب السفلي، متبوعاً بتطبيق ضغط إصبعي رقمي مباشر ومستمر (External Digital Finger Pressure) بالسبابة فوق الثقبة الذقنية لإجبار المحلول المخدر على النفاذ لداخل النفق وتخدير لب الأسنان.',
          cameraAngle: 'رؤية دهليزية سفلية للفك السفلي فقط (Mandibular Lower Arch View)',
          clinicalPhase: 'الحقن الدهليزي متبوعاً بتطبيق ضغط رقمي خارجي لمدة دقيقتين (External Digital Compression)',
          landmarksIdentified: ['Mandibular Arch Premolars View Only', 'Mental Foramen', 'External Digital Finger Pressure', 'Lower Mucobuccal Fold (No Upper Teeth)'],
          magnification: 'تصوير عيادي ماكرو فائق الوضوح 1:1',
        },
      ];
    case 'mental':
      return [
        {
          id: 'photo-mental-1',
          url: CLINICAL_SKILL_PHOTOS.mental,
          title: 'صورة سريرية حقيقية: حصار العصب الذقني السفلي للأنسجة الرخوة (Mental Nerve Block)',
          caption: 'لقطة سريرية داخل فموية للفك السفلي حصراً (Mandibular View Only) تظهر توجيه الإبرة في قاع الميزاب الدهليزي السفلي لتخدير الأنسجة الرخوة للشفة السفلية والذقن بدون أي ضغط يدوي خارجي، وبدون تخدير للفك العلوي نهائياً.',
          cameraAngle: 'رؤية دهليزية سفلية مباشرة مع شد الشفة السفلية (Mandibular View Only)',
          clinicalPhase: 'حقن الأنسجة الرخوة للشفة السفلية والذقن بدون ضغط يدوي (No Manual Compression)',
          landmarksIdentified: ['Lower Mucobuccal Fold', 'Mental Foramen Soft-Tissue Exit', 'Lower Lip & Chin (No Manual Compression)', 'Mandibular View Only'],
          magnification: 'ماكرو سريري عالي الدقة 4K',
        },
      ];
    case 'palatine':
      return [
        {
          id: 'photo-palatine-1',
          url: CLINICAL_SKILL_PHOTOS.palatine,
          title: 'صورة سريرية حقيقية: تخدير الحنك الكبير وحليمة القواطع',
          caption: 'تصوير فموي للحنك الصلب يوضح موضع الثقبة الحنكية الكبيرة مع تطبيق ضغط العود القطني وشحوب الأنسجة.',
          cameraAngle: 'رؤية عمودية مباشرة على قبة الحنك العظمي 90°',
          clinicalPhase: 'تخدير بالضغط (Pressure Anesthesia) وحقن غير مؤلم',
          landmarksIdentified: ['Greater Palatine Foramen', 'Junction of hard & soft palate', 'Blanching halo'],
          magnification: 'عدسة ماكرو سريرية داخل فموية 1:1',
        },
      ];
    case 'infiltration':
      return [
        {
          id: 'photo-infil-1',
          url: CLINICAL_SKILL_PHOTOS.infiltration,
          title: 'صورة سريرية حقيقية: التخدير الارتشاحي الموضعي (Infiltration)',
          caption: 'اختراق الميزاب الدهليزي عند ذروة جذر السن، وتوجيه شطبة الإبرة نحو السمحاق العظمي بزاوية 45°.',
          cameraAngle: 'زاوية دهليزية مباشرة مع شد الشفة بالمرآة',
          clinicalPhase: 'الحقن تحت المخاطية مع السحب السلبي وتفريغ نصف كاربول',
          landmarksIdentified: ['Mucobuccal Fold', 'Apical Root Contour', 'Attached Gingiva boundary'],
          magnification: 'ماكرو سريري فائق التباين',
        },
      ];
    case 'rubber_dam_wingless':
      return [
        {
          id: 'photo-rd-wingless-1',
          url: CLINICAL_SKILL_PHOTOS.rubberDamWingless,
          title: 'صورة سريرية حقيقية: استقرار فكي الكلامب تحت خط التحدب (Photorealistic Clamp Seating)',
          caption: 'لقطة سريرية حقيقية تظهر فكي الكلامب المعدني المطفي مستقرين بثبات تحت أقصى تقعر عنقي (Cervical Height of Contour) على ضرس سفلي بنقاط التماس الأربع، مع قلب شيت الربر دام في الميزاب وخيط الأمان.',
          cameraAngle: 'رؤية إطباقية داخل فموية علوية 1:1',
          clinicalPhase: 'تثبيت الكلامب تحت محيط العنق وقلب المطاط (Floss Inversion)',
          landmarksIdentified: ['Four-point tooth contact', 'Cervical tooth contour below bulbar', 'Inverted sulcular rubber sheet', 'Safety floss loop'],
          magnification: 'تصوير عيادي ماكرو 1:1',
        },
        {
          id: 'photo-rd-wingless-2',
          url: CLINICAL_SKILL_PHOTOS.rubberDamWinged,
          title: 'تمديد المطاط وقلب الحواف الميزابية',
          caption: 'تمرير شيت الربر دام فوق قوس الكلامب وقلب الحواف اللثوية (Inversion) بخيط الأسنان وهواء المحقنة.',
          cameraAngle: 'لقطة مقربة لعنق السن المعزول',
          clinicalPhase: 'قلب الحواف (Gingival Inversion) لتحقيق العزل المطلق',
          landmarksIdentified: ['Inverted sulcular collar', 'Interdental septum flossing'],
          magnification: 'ماكرو سريري فائق الدقة',
        },
      ];
    case 'rubber_dam_winged':
      return [
        {
          id: 'photo-rd-winged-1',
          url: CLINICAL_SKILL_PHOTOS.rubberDamWinged,
          title: 'صورة سريرية حقيقية: العزل بخطوة واحدة مع الكلامب المجنح',
          caption: 'تثبيت الكلامب والمطاط والإطار المعدني مجتمعين في خطوة واحدة، مع عزل كامل وجفاف مطلق.',
          cameraAngle: 'رؤية إطباقية ودهليزية مجمعة مع الإطار المعدني',
          clinicalPhase: 'الإنزال المتزامن والتحرير من الأجنحة',
          landmarksIdentified: ['Wing engagement', 'Dam sheet tension', 'Dry operational quadrant'],
          magnification: 'تصوير سريري داخل فموي احترافي',
        },
      ];
    case 'rubber_dam_split':
      return [
        {
          id: 'photo-rd-split-1',
          url: CLINICAL_SKILL_PHOTOS.rubberDamSplit,
          title: 'صورة سريرية حقيقية: العزل المخصص ورفع الحواف اللثوية العميقة (Split Dam)',
          caption: 'عزل الأسنان المتهدمة جراء النخر العميق تحت اللثة مع تطبيق شريط التفلون، المسند المعدني، والإسفين.',
          cameraAngle: 'رؤية دهليزية مقربة جداً للحافة المرممة',
          clinicalPhase: 'عزل الحافة العميقة (Deep Margin Elevation) ومنع التسرب',
          landmarksIdentified: ['Matrix band seal', 'Wedge adaptation', 'Subgingival isolation contour'],
          magnification: 'تصوير ترميمي ماكرو فائق الدقة 1:1',
        },
      ];
    case 'suture_interrupted':
      return [
        {
          id: 'photo-sut-inter-1',
          url: CLINICAL_SKILL_PHOTOS.sutureInterrupted,
          title: 'صورة سريرية جراحية: الغرزة المتقطعة وعقدة الجراح (Simple Interrupted Suture)',
          caption: 'لقطة جراحية حقيقية لممسك الإبرة كاستروفييخو بإبرة 3/8 دائرية عاكسة القطع تخترق حافة الفلاب الجراحي، مع خيط حرير أسود 3-0 مربوط بعقدة الجراح المربعة (2-1-1) على جانب الشق الجراحي فوق اللثة الملتصقة.',
          cameraAngle: 'رؤية جراحية مباشرة على الحافة السنخية 1:1',
          clinicalPhase: 'أخذ العضة 3-4 ملم بزاوية 90° وعقدة الجراح المربعة (2-1-1)',
          landmarksIdentified: ['3/8 Reverse cutting needle entry 90°', 'Wound margin approximation 4mm', 'Black silk braided suture', 'Surgeon square knot 2-1-1 on margin'],
          magnification: 'تصوير جراحي فموي ماكرو 1:1',
        },
      ];
    case 'suture_continuous':
      return [
        {
          id: 'photo-sut-cont-1',
          url: CLINICAL_SKILL_PHOTOS.sutureContinuous,
          title: 'صورة سريرية جراحية: الخياطة المتصلة القافلة (Continuous Locking)',
          caption: 'خياطة شق جراحي طويل على الحافة السنخية مع تمرير الإبرة داخل الحلقة لقفل كل غرزة وتوزيع الشد بالتساوي.',
          cameraAngle: 'رؤية طولية موازية للشق الجراحي السنخي',
          clinicalPhase: 'إحكام الشق وتثبيت السريعة لالتئام الأنسجة',
          landmarksIdentified: ['Locked suture loops', 'Tension distribution along crest', 'Hemostatic flap closure'],
          magnification: 'ماكرو جراحي داخل فموي',
        },
      ];
    case 'suture_mattress':
      return [
        {
          id: 'photo-sut-matt-1',
          url: CLINICAL_SKILL_PHOTOS.sutureMattress,
          title: 'صورة سريرية جراحية: الخياطة المراتبية وقلب الحواف (Mattress Suture)',
          caption: 'غرزة مرتبية أفقية تقلب حواف الجرح للخارج (Eversion) وتخفف الشد الحركي في مناطق التجديد العظمي وطعوم اللثة مع عقدة جراحية محكمة.',
          cameraAngle: 'لقطة مقربة لحافتي الجرح المقلوبتين',
          clinicalPhase: 'قلب الحواف ومنع انغماس البشرة (Wound Eversion)',
          landmarksIdentified: ['Far-far near-near passage', 'Everted mucosal edge', 'Relief of flap tension'],
          magnification: 'تصوير جراحة فموية مجهري دقيق',
        },
      ];
    case 'suture_figure8':
      return [
        {
          id: 'photo-sut-fig8-1',
          url: CLINICAL_SKILL_PHOTOS.sutureFigure8,
          title: 'صورة سريرية جراحية: خياطة الرقم 8 لتثبيت سنخ الخلع (Figure-8 Suture)',
          caption: 'تقاطع خيط الحرير الجراحي الطبي كشكل الرقم 8 فوق فوهة سنخ الضرس المخلوع لتثبيت الشاش المرقئ ومواد التخثر ومقاربة الحليمات دون ضغط زائد.',
          cameraAngle: 'رؤية إطباقية عمودية فوق السنخ المخلوع',
          clinicalPhase: 'تثبيت الخثرة الدموية ومواد التخثر داخل السنخ',
          landmarksIdentified: ['Crossed suture over socket', 'Buccal & lingual papilla tension', 'Clot protection'],
          magnification: 'ماكرو سريري داخل فموي',
        },
      ];
    default:
      return [
        {
          id: 'photo-default-1',
          url: CLINICAL_SKILL_PHOTOS.ianb,
          title: 'صورة سريرية داخل فموية عالية الدقة',
          caption: 'توثيق سريري حقيقي لخطوات التنفيذ والأدوات المستخدمة داخل العيادة.',
          cameraAngle: 'رؤية سريرية مباشرة 1:1',
          magnification: 'ماكرو سريري عالي الدقة',
        },
      ];
  }
}

export function getDefaultPrimaryPhotoForSkill(diagramType: string): string {
  switch (diagramType) {
    case 'ianb':
      return CLINICAL_SKILL_PHOTOS.ianb;
    case 'buccal':
      return CLINICAL_SKILL_PHOTOS.buccal;
    case 'mental':
      return CLINICAL_SKILL_PHOTOS.mental;
    case 'incisive':
      return CLINICAL_SKILL_PHOTOS.incisive;
    case 'infiltration':
      return CLINICAL_SKILL_PHOTOS.infiltration;
    case 'palatine':
      return CLINICAL_SKILL_PHOTOS.palatine;
    case 'rubber_dam_wingless':
      return CLINICAL_SKILL_PHOTOS.rubberDamWingless;
    case 'rubber_dam_winged':
      return CLINICAL_SKILL_PHOTOS.rubberDamWinged;
    case 'rubber_dam_split':
      return CLINICAL_SKILL_PHOTOS.rubberDamSplit;
    case 'suture_interrupted':
      return CLINICAL_SKILL_PHOTOS.sutureInterrupted;
    case 'suture_continuous':
      return CLINICAL_SKILL_PHOTOS.sutureContinuous;
    case 'suture_mattress':
      return CLINICAL_SKILL_PHOTOS.sutureMattress;
    case 'suture_figure8':
      return CLINICAL_SKILL_PHOTOS.sutureFigure8;
    default:
      return CLINICAL_SKILL_PHOTOS.ianb;
  }
}

export interface SkillItem {
  id: string;
  category: 'anesthesia' | 'rubber_dam' | 'suturing';
  categoryLabel: string;
  title: string;
  titleEn: string;
  shortDesc: string;
  indication: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم' | 'دقيق وحرج';
  estimatedTime: string;
  isVisible: boolean; // Admin controls: true = published for subscribers, false = hidden with badge
  isHidden?: boolean; // Cloud DB visibility flag (true = hidden from subscribers)
  isSystem: boolean; // built-in preset
  dateAdded: string;
  
  // Specific Clinical Parameters
  needleGaugeLength?: string; // e.g. "25/27G Long (32-35mm)"
  targetNerve?: string;
  anatomicalLandmarks?: string[];
  insertionAngle?: string;
  penetrationDepth?: string;
  aspirationProtocol?: string;
  dosageVolume?: string;
  onsetDuration?: string;
  anesthetizedAreas?: string[];

  // Rubber Dam Specifics
  damTechniqueType?: 'wingless' | 'winged' | 'split_custom';
  recommendedClamps?: string[];
  isolationPhases?: {
    phaseName: string;
    action: string;
    criticalPoint: string;
  }[];

  // Suture Specifics
  sutureType?: 'simple_interrupted' | 'continuous' | 'mattress' | 'figure_of_eight';
  recommendedMaterial?: string; // e.g. "3-0 or 4-0 Silk / Vicryl"
  biteDistance?: string; // e.g. "3 - 4 mm from wound edge"
  knotTechnique?: string;

  // Visual & Media
  diagramType: 'ianb' | 'buccal' | 'mental' | 'incisive' | 'palatine' | 'infiltration' | 'rubber_dam_wingless' | 'rubber_dam_winged' | 'rubber_dam_split' | 'suture_interrupted' | 'suture_continuous' | 'suture_mattress' | 'suture_figure8';
  diagramCaption: string;
  primaryPhotoUrl?: string;
  clinicalPhotos?: ClinicalPhotoAsset[];
  clinicalKeyPoints: string[];
  steps: SkillStep[];
}

const STORAGE_KEY = 'dental_clinical_skills_v2';

export const INITIAL_CLINICAL_SKILLS: SkillItem[] = [
  // ==========================================
  // SECTION A: LOCAL ANESTHESIA TECHNIQUES
  // ==========================================
  {
    id: 'skill-anes-ianb',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'تخدير العصب السنخي السفلي (IANB / بلوك نيرف)',
    titleEn: 'Inferior Alveolar Nerve Block (Halstead Technique)',
    shortDesc: 'التخدير الأكثر استخداماً في الفك السفلي؛ يخدر الأسنان السفلية حتى الخط المتوسط مع الشفة السفلية والعصب اللساني.',
    indication: 'حشوات الكومبوزيت العميقة، علاج العصب، والجراحة والخلع لجميع الأسنان السفلية في الجهة المعالجة.',
    difficulty: 'دقيق وحرج',
    estimatedTime: '3 - 5 دقائق للمفعول',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    needleGaugeLength: '25 أو 27-gauge Long (طول 32 - 35 ملم)',
    targetNerve: 'عصب السنخ السفلي (IAN) قبل دخوله ثقبة الفك السفلي (Mandibular Foramen) + العصب اللساني (Lingual N.)',
    anatomicalLandmarks: [
      'الثلمة التاجية (Coronoid notch) - أعمق نقطة على الحافة الأمامية للرأد.',
      'الرباط الجناحي الفكي (Pterygomandibular raphe) - الحاجز الداخلي الحركي.',
      'المستوى الإطباقي للأسنان الخلفية السفلية (Occlusal plane) - الحقن يعلوه بـ 6 إلى 10 ملم.',
      'الانخفاض الجناحي الفكي (Pterygomandibular depression) - نقطة الاختراق المباشرة.',
    ],
    insertionAngle: 'برميل المحقنة يرتكز فوق الضواحك في الجهة المقابلة (Contralateral Premolars) بزاوية 45 درجة مع القوس السني.',
    penetrationDepth: '20 إلى 25 ملم (حوالي ثلثي طول الإبرة الطويلة) حتى ملامسة العظم اللطيفة فوق اللسين (Lingula).',
    aspirationProtocol: 'إجراء السحب السلبي (Negative Aspiration) في مستويين متعامدين (بسبب مرور الأوعية السنخية بنسبة ارتشاف دموي 10-15%).',
    dosageVolume: '1.5 إلى 1.8 مل (خرطوشة كاملة تقريباً) تُفرغ ببطء شديد على مدى 60 إلى 90 ثانية.',
    onsetDuration: '3 - 5 دقائق للبدء، يستمر التخدير اللبي 60 دقيقة والأنسجة الرخوة 3-5 ساعات.',
    anesthetizedAreas: [
      'جميع أسنان الفك السفلي في نصف القوس حتى الخط الناصف.',
      'جسم الفك السفلي والجزء السفلي من الرأد.',
      'الغشاء المخاطي والسمحاق الدهليزي أمام الثقبة الذقنية (الضاحك الأول للأمام).',
      'الثلثين الأماميين للسان وقاع الفم والأنسجة اللسانية (بفضل العصب اللساني).',
    ],
    diagramType: 'ianb',
    diagramCaption: 'المخطط التشريحي لمسار الحقن بزاوية الضواحك المقابلة ونقطة التماس العظمي فوق ثقبة الفك السفلي',
    clinicalKeyPoints: [
      'إذا لامست العظم مبكراً جداً (أقل من 15 ملم): الإبرة متقدمة للأمام، اسحبها قليلاً ووجّه المحقنة نحو الأنياب المقابلة.',
      'إذا لم تلامس العظم نهائياً عند عمق 25 ملم: الإبرة متأخرة بالخلف نحو الغدة النكفية، اسحب جزئياً ووجه البرميل فوق الأضراس المقابلة لتفادي شلل العصب الوجهي المؤقت.',
      'عند سحب الإبرة لمسافة النصف (حوالي 10-12 ملم)، احقن 0.2 مل لتخدير العصب اللساني وضمان تخدير قاع الفم.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تحديد المعالم التشريحية والتحضير المطهر',
        instruction: 'ضع إبهام اليد الحرة في الثلمة التاجية (Coronoid notch) وشد الخد دهليزياً لتوضيح الـ Pterygomandibular raphe. جفف الغشاء المخاطي وطبق التخدير السطحي الموضعي لمدة دقيقة.',
        clinicalTip: 'حدد الخط الوهمي الأفقي بين أعمق نقطة في الثلمة التاجية والرباط الجناحي الفكي، وبارتفاع 8-10 ملم فوق السطح الإطباقي.',
        dangerZoneWarning: 'لا تبدأ بالحقن قبل تحسس المعالم العظمية بالإبهام للتأكد من زاوية الرأد.',
        visualDetail: 'Coronoid Notch + Pterygomandibular Raphe Intersection',
      },
      {
        stepNumber: 2,
        title: 'توجيه المحقنة والاختراق الأولي',
        instruction: 'ضع برميل المحقنة فوق ضواحك الفك السفلي في الجهة المقابلة. ادخل الإبرة في انخفاض الفراغ الجناحي الفكي lateral للرباط بنصف المسافة.',
        clinicalTip: 'ادخل برفق واحذر من خدش السمحاق حتى وصول العمق المستهدف.',
        dangerZoneWarning: 'إذا اخترقت الرباط الجناحي الفكي مباشرة ستسبب ألماً عضلياً (Trismus) بعد زوال البنج.',
        visualDetail: 'Contralateral Premolar Angle orientation',
      },
      {
        stepNumber: 3,
        title: 'التقدم حتى ملامسة العظم (Bone Contact)',
        instruction: 'تقدم بالإبرة ببطء وسلاسة بمعدل 1 ملم بالثانية لمسافة 20-25 ملم حتى تستشعر توقف العظم الصلب (الحافة العلوية لثقبة الفك السفلي). اسحب 1 ملم للخلف لتحرير رأس الإبرة.',
        clinicalTip: 'ملامسة العظم هي صمام الأمان الوحيد الذي يضمن أنك لست داخل الغدة النكفية.',
        dangerZoneWarning: 'ممنوع إفراغ المخدر نهائياً بدون ملامسة العظم؛ خطر الحقن في الغدة النكفية وشلل العصب السابع المؤقت (Transient Facial Nerve Palsy).',
        visualDetail: 'Mandibular Sulcus Bone Contact above Lingula',
      },
      {
        stepNumber: 4,
        title: 'السحب الأمني المزدوج والإفراغ البطيء',
        instruction: 'قم بسحب المكبس (Aspiration). إذا كان سلبياً، أدر المحقنة ربع دورة وافحص السحب ثانية. افرغ 1.5 مل ببطء شديد على مدار 60 ثانية على الأقل.',
        clinicalTip: 'البطء في الحقن يمنع تمزق الأنسجة ويقلل الإحساس بالحرقة بنسبة 90%.',
        dangerZoneWarning: 'إذا ظهر خيط دموي في الكاربول (Positive Aspiration): اسحب الإبرة 2 ملم، أعد السحب، ولا تحقن إذا استمر الدم.',
        visualDetail: 'Two-plane negative aspiration protocol',
      },
      {
        stepNumber: 5,
        title: 'تخدير العصب اللساني والانسحاب',
        instruction: 'أثناء سحب الإبرة ببطء، توقف عند عمق 10-12 ملم (نصف المسافة) واحقن ما تبقى من الكاربول (0.2 - 0.3 مل) لتخدير العصب اللساني ثم اسحب الإبرة وغطّها فوراً.',
        clinicalTip: 'تأكد من تنميل وخدر ذروة اللسان والشفة السفلية بعد 3-5 دقائق لاختبار نجاح البلوك.',
        dangerZoneWarning: 'حذر المريض من عض الشفة أو اللسان المخدر أثناء فترة سريان مفعول البنج.',
        visualDetail: 'Lingual nerve deposition at 10mm depth',
      },
    ],
  },
  {
    id: 'skill-anes-buccal',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'تخدير العصب الشدقي الطويل (Long Buccal Nerve Block)',
    titleEn: 'Long Buccal (Buccinator) Nerve Block',
    shortDesc: 'ضروري لإتمام تخدير الأنسجة الرخوة واللثة الدهليزية المجاورة لأضراس الفك السفلي وتركيب الربر دام أو الخلع.',
    indication: 'تثبيت كلامب الربر دام على الأضراس السفلية، حفر تجاويف Class II و Class V اللثوية، وعمليات الخلع الجراحي.',
    difficulty: 'مبتدئ',
    estimatedTime: '1 - 2 دقيقة للمفعول',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    needleGaugeLength: '25 أو 27-gauge Long أو Short',
    targetNerve: 'العصب الشدقي (Buccal Branch of Anterior Division of V3)',
    anatomicalLandmarks: [
      'السطح الدهليزي للأضراس السفلية (الميزاب الدهليزي المقابل للطاحن الأخير).',
      'الحفرة خلف الرحوية (Retromolar fossa).',
      'الحافة الأمامية للرأد الصاعد (External oblique ridge).',
    ],
    insertionAngle: 'المحقنة موازية للمستوى الإطباقي من جهة العمل السريري (Ipsilateral side).',
    penetrationDepth: '2 إلى 4 ملم فقط في الأنسجة الرخوة حتى ملامسة السمحاق العظمي برفق.',
    aspirationProtocol: 'سحب سلبي بسيط (نسبة الارتشاف الدموي نادرة جداً أقل من 0.7%).',
    dosageVolume: '0.2 إلى 0.3 مل (حوالي ثمن الكاربول) ببطء شديد لمنع انفصال السمحاق المؤلم.',
    onsetDuration: 'دقيقة إلى دقيقتين؛ تخدير سريع للأنسجة اللثوية.',
    anesthetizedAreas: [
      'الغشاء المخاطي والسمحاق واللثة الدهليزية للأضراس السفلية.',
      'أنسجة الخد الداخلية المقابلة للمنطقة الخلفية.',
    ],
    diagramType: 'buccal',
    diagramCaption: 'نقطة دخول الإبرة في الميزاب الشدقي خلف الطاحن الأخير موازياً للمستوى الإطباقي',
    clinicalKeyPoints: [
      'تذكر أن IANB العادي لا يخدر اللثة الدهليزية للأضراس، لذا يعتبر الـ Buccal Block مكملاً إلزامياً لأي خلع أو كلامب ربر دام مؤلم.',
      'لا تحقن كمية كبيرة لعدم إحداث انتفاخ مزعج في الخد.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تحديد نقطة الدخول في الثنية الدهليزية',
        instruction: 'حدد موضع الميزاب الدهليزي خلف وأسفل الحدبة الدهليزية الوحشية للطاحن الأخير في القوس السني.',
        clinicalTip: 'استخدم المرآة لتبعيد أنسجة الخد وجعل الغشاء المخاطي مشدوداً.',
        dangerZoneWarning: 'تجنب الحقن العضلي العميق في العضلة المبوقة (Buccinator).',
        visualDetail: 'Distobuccal sulcus to last mandibular molar',
      },
      {
        stepNumber: 2,
        title: 'الإدخال وتفريغ الجرعة',
        instruction: 'ادخل بالإبرة بمقدار 2-3 ملم بزاوية موازية للسطح الإطباقي حتى ملامسة العظم السطحي، اسحب للتأكد من عدم وجود دم، واحقن 0.25 مل ببطء.',
        clinicalTip: 'ظهور ابيضاض طفيف (Blanching) يدل على تمركز المخدر في الأنسجة الدهليزية الموضعية.',
        dangerZoneWarning: 'الحقن السريع تحت السمحاق يسبب ألماً حاداً ورضّاً بالأنسجة.',
        visualDetail: 'Submucosal deposition with gentle bone touch',
      },
    ],
  },
  {
    id: 'skill-anes-incisive',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'حصار العصب القاطع السفلي (Incisive Nerve Block)',
    titleEn: 'Incisive Nerve Block (Mandibular Arch Pulpal Anesthesia)',
    shortDesc: 'تخدير لبي حقيقي لقواطع وأنياب وضواحك الفك السفلي دون خدر اللسان المزعج؛ يعتمد حصراً على الضغط الرقمي الخارجي (Digital Finger Pressure) فوق الثقبة الذقنية لإدخال المخدر في النفق.',
    indication: 'ترميمات الكومبوزيت، علاج العصب، وتجاويف Class V للأسنان الأمامية والضواحك السفلية (من #45 إلى #35) في الفك السفلي حصراً دون الحاجة لـ IANB.',
    difficulty: 'متوسط',
    estimatedTime: '2 - 3 دقائق مع دقيقتي ضغط إصبعي',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-30',
    needleGaugeLength: '27-gauge Short (طول 20 - 25 ملم)',
    targetNerve: 'العصب القاطع (Incisive Nerve) المتفرع داخل النفق السنخي السفلي عبر الثقبة الذقنية.',
    anatomicalLandmarks: [
      'ذروة جذري الضاحك الأول والثاني السفليين (#44/#45 أو #34/#35) - الفك السفلي فقط.',
      'الميزاب الدهليزي السفلي (Mandibular mucobuccal fold).',
      'الثقبة الذقنية الملموسة كفجوة عظمية مقعرة أسفل الضواحك السفلية.',
      'الضغط الإصبعي الرقمي الخارجي (External Digital Pressure) المستمر لمدة 120 ثانية.',
    ],
    insertionAngle: 'المحقنة بزاوية 45 درجة من الأمام للخلف موجهة نحو فوهة الثقبة الذقنية السفلية.',
    penetrationDepth: '5 إلى 6 ملم في قاع الميزاب السفلي حتى الوصول لمستوى الفوهة دون دخولها.',
    aspirationProtocol: 'سحب سلبي مزدوج (احتمالية ارتشاف دموي 5% لوجود الأوعية الذقنية).',
    dosageVolume: '0.6 إلى 0.9 مل (ثلث إلى نصف كاربول).',
    onsetDuration: '3 - 5 دقائق للبدء، يتطلب ضغطاً إصبعياً مستمراً لضمان التخدير اللبي.',
    anesthetizedAreas: [
      'لب الأسنان (Pulpal Anesthesia) لقواطع وأنياب وضواحك الفك السفلي في جهة الحقن.',
      'العظم السنخي والرباط حول السني للأسنان السفلية حتى الخط المتوسط.',
      'الشفة السفلية واللثة الدهليزية المجاورة.',
    ],
    diagramType: 'incisive',
    diagramCaption: 'إدخال الإبرة في الميزاب السفلي متبوعاً بالضغط الإصبعي الرقمي المستمر لدقيقتين لدفع المخدر داخل النفق القاطع',
    clinicalKeyPoints: [
      'السر السريري الحاسم للـ Incisive Block: الضغط الرقمي الخارجي بالسبابة (Digital Finger Pressure) بقوة معتدلة فوق الثقبة الذقنية لمدة دقيقتين كاملتين بعد الحقن لدفع المحلول داخل القناة السنخية وتحقيق التخدير اللبي.',
      'بدون الضغط الرقمي الخارجي، ستحصل فقط على تخدير سطحي للشفة (Mental Block) وستفشل في تخدير لب السن!',
      'تجنب إدخال رأس الإبرة لداخل الثقبة العظمية تجنباً للوخز العصبي المباشر (Electric shock sensation).',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'جس الثقبة وتحديد موقع جذور الضواحك السفلية',
        instruction: 'جس الثقبة الذقنية بإصبع السبابة في الميزاب الدهليزي السفلي بين جذري الضاحكين السفلين (#44 و #45). شد الشفة السفلية للأمام والخارج لرؤية قاع الميزاب بوضوح.',
        clinicalTip: 'اشعر بالفجوة العظمية الصغيرة بإصبعك؛ سيعمل هذا الإصبع لاحقاً كضاغط رقمي فور سحب الإبرة.',
        dangerZoneWarning: 'رؤية الفك السفلي فقط؛ لا علاقة للفك العلوي أو الأضراس العلوية بهذا الإجراء.',
        visualDetail: 'Mandibular premolar view with index palpating mental foramen',
      },
      {
        stepNumber: 2,
        title: 'الاختراق المائل وتفريغ نصف الكاربول',
        instruction: 'ادخل بالإبرة 27G القصيرة بزاوية 45° باتجاه مدخل الثقبة لمسافة 5-6 ملم. قم بالسحب السلبي للتأكد من خلو الدم، ثم افرغ 0.6 إلى 0.8 مل ببطء على مدى 30 ثانية.',
        clinicalTip: 'لا تحاول حشر الإبرة في النفق؛ إفراغ المحلول عند فوهة الثقبة كافٍ تماماً.',
        dangerZoneWarning: 'إذا ظهر دم في المحقنة اسحب 2 ملم وأعد الفحص.',
        visualDetail: '45-degree needle approach to mandibular mental foramen',
      },
      {
        stepNumber: 3,
        title: 'تطبيق الضغط الرقمي الإلزامي لمدة دقيقتين (Digital Pressure)',
        instruction: 'اسحب الإبرة وضع إبهامك أو سبابتك فوراً بقطعة شاش فوق موقع الثقبة الذقنية خارجياً، وطبق ضغطاً مستمراً ولطيفاً لمدة 120 ثانية كاملة لإجبار المحلول على التدفق داخل القناة القاطعة.',
        clinicalTip: 'هذه الخطوة ترفع نجاح التخدير اللبي لأسنان الفك السفلي الأمامية إلى أكثر من 90% دون خدر اللسان.',
        dangerZoneWarning: 'إهمال الضغط الرقمي يحول البلوك إلى مجرد Mental Block فاشل لبياً.',
        visualDetail: 'Continuous 2-minute firm digital finger pressure over mental foramen',
      },
    ],
  },
  {
    id: 'skill-anes-mental',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'حصار العصب الذقني السفلي (Mental Nerve Block)',
    titleEn: 'Mental Nerve Block (Mandibular Soft Tissue Only)',
    shortDesc: 'تخدير الأنسجة الرخوة والشفة السفلية والجلد فوق الذقن واللثة الدهليزية أمام الثقبة في الفك السفلي؛ حقن موضعي في الميزاب السفلي بدون ضغط رقمي.',
    indication: 'خياطة جروح الشفة السفلية، استئصال آفات الشفة والذقن، تنضير اللثة والسمحاق الدهليزي أمام الثقبة الذقنية في الفك السفلي حصراً (لا يشمل الفك العلوي).',
    difficulty: 'مبتدئ',
    estimatedTime: '1 - 2 دقيقة',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-30',
    needleGaugeLength: '27-gauge Short (طول 20 ملم)',
    targetNerve: 'العصب الذقني (Mental Nerve) الخارج من الثقبة الذقنية لتغذية الشفة السفلية والذقن.',
    anatomicalLandmarks: [
      'الميزاب الدهليزي السفلي بين جذري الضاحك الأول والثاني السفليين.',
      'الثقبة الذقنية في الفك السفلي فقط (Mandibular view only - No maxillary anatomy).',
      'الشفة السفلية والجلد فوق الذقن.',
    ],
    insertionAngle: 'زاوية 45 درجة مع المحور الطولي للأضراس السفلية في قاع الميزاب السفلي.',
    penetrationDepth: '4 إلى 5 ملم في الأنسجة الرخوة للثنية الدهليزية السفلية.',
    aspirationProtocol: 'سحب سلبي سريع للتأكد من عدم دخول الشريان الذقني.',
    dosageVolume: '0.4 إلى 0.6 مل (حوالي ثلث كاربول).',
    onsetDuration: 'سريع (1 - 2 دقيقة للشفة السفلية).',
    anesthetizedAreas: [
      'الشفة السفلية بالكامل في جهة الحقن.',
      'جلد الذقن والمخاطية الدهليزية السفلية أمام الثقبة الذقنية.',
      'ملاحظة: لا يخدر لب الأسنان (No Pulpal Anesthesia) نظراً لعدم تطبيق الضغط الرقمي.',
    ],
    diagramType: 'mental',
    diagramCaption: 'توجيه الإبرة في الميزاب الدهليزي السفلي لتخدير الشفة السفلية والأنسجة الرخوة بدون ضغط يدوي',
    clinicalKeyPoints: [
      'الـ Mental Block مخصص للأنسجة الرخوة السفلية فقط ولا يعطي تخديراً للب الأسنان.',
      'لا تطبق أي ضغط رقمي بعد الحقن؛ يكفي توزع المحلول في الأنسجة الرخوة السفلية.',
      'التشريح يخص الفك السفلي حصراً ويمنع الخلط مع أي بنج علوي.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تبعيد الشفة السفلية وتحديد الميزاب السفلي',
        instruction: 'أبعد الشفة السفلية للأمام والخارج لشد الغشاء المخاطي المقابل للضواحك السفلية (#44/#45). جفف المنطقة وضع مخدراً موضعياً سطحياً.',
        clinicalTip: 'الأنسجة المشدودة تقلل الألم وتسمح بدخول الإبرة بدقة متناهية.',
        dangerZoneWarning: 'تأكد من عدم وخز العصب بشكل مباشر.',
        visualDetail: 'Lower lip retraction at mandibular premolar mucobuccal fold',
      },
      {
        stepNumber: 2,
        title: 'الحقن السطحي للأنسجة الرخوة والانسحاب',
        instruction: 'ادخل بالإبرة 4-5 ملم في قاع الميزاب السفلي أمام الثقبة، اسحب سلباً، واحقن 0.5 مل ببطء، ثم اسحب الإبرة وغطّها مباشرة دون تطبيق أي ضغط يدوي.',
        clinicalTip: 'خدر الشفة السفلية يبدأ خلال 60 إلى 90 ثانية.',
        dangerZoneWarning: 'لا تضغط على المنطقة لأن المطلوب هو تخدير الأنسجة الرخوة السطحية فقط.',
        visualDetail: 'Submucosal deposit in lower fold without manual compression',
      },
    ],
  },
  {
    id: 'skill-anes-palatine',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'تخدير الحنك الكبير والقاطع (Greater Palatine & Nasopalatine Block)',
    titleEn: 'Greater Palatine & Nasopalatine Nerve Blocks',
    shortDesc: 'تخدير الأنسجة الحنكية الصلبة والرخوة؛ يتطلب تقنية التخدير بالضغط لتفادي ألم وخز الحنك.',
    indication: 'عزل الربر دام للأسنان العلوية، الترميمات الحنكية العميقة، الخلع، وجراحة اللثة الحنكية.',
    difficulty: 'متوسط',
    estimatedTime: '1 - 2 دقيقة',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    needleGaugeLength: '27-gauge Short (قصيرة)',
    targetNerve: 'عصب الحنك الكبير (Greater Palatine) وعصب القواطع الحنكي الأنفي (Nasopalatine Nerve).',
    anatomicalLandmarks: [
      'الثقبة الحنكية الكبيرة: مقابل الطاحن الثاني أو الثالث العلوي، على بعد 3-4 ملم أمام التقاء الحنك الصلب بالرخو.',
      'حليمة القواطع (Incisive papilla): في الخط الناصف خلف الثنايا العلوية مباشرة.',
      'التقاء السنخ الحنكي مع قبة الحنك.',
    ],
    insertionAngle: 'زاوية عمودية 90 درجة مع انحناء قبة الحنك لعصب الحنك الكبير، وزاوية 45 درجة لحليمة القواطع.',
    penetrationDepth: '3 إلى 5 ملم فقط حتى ملامسة العظم الحنكي الصلب.',
    aspirationProtocol: 'سحب سلبي للتأكد (نسبة السحب الإيجابي منخفضة أقل من 1%).',
    dosageVolume: '0.25 إلى 0.4 مل ببطء شديد حتى ظهور شحوب وابيضاض الأنسجة (Blanching).',
    onsetDuration: 'سريع جداً (أقل من دقيقة واحدة).',
    anesthetizedAreas: [
      'الحنك الكبير: الأنسجة الرخوة الحنكية والعظمية من الضاحك الأول حتى الأضراس الأخيرة.',
      'الأنفي الحنكي: الأنسجة الحنكية الأمامية من الناب إلى الناب المقابل (قاطع القواطع).',
    ],
    diagramType: 'palatine',
    diagramCaption: 'مواقع الثقبة الحنكية الكبيرة وحليمة القواطع مع تقنية التخدير بالضغط (Pressure Anesthesia)',
    clinicalKeyPoints: [
      'القاعدة الذهبية لتخدير الحنك بدون ألم: استخدم عود قطني (Cotton Pellet) واضغط بقوة على نقطة الحقن لمدة 30 ثانية حتى يتشكل انخفاض مبيضّ، ثم ادخل بالإبرة بجانب العود فوراً.',
      'نسيج الحنك كثيف وملتصق بالعظم بشدة، لذا فإن الحقن السريع يسبب تمزقاً حاداً للألياف وألماً بعد العملية.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تقنية التخدير بالضغط (Gate Control Pressure)',
        instruction: 'اضغط بمرآة الفحص أو بعود قطني بشدة لمدة 30 ثانية في الموضع المحدد للثقبة الحنكية حتى تصبح الأنسجة بيضاء ومخدرة ميكانيكياً.',
        clinicalTip: 'نظرية بوابة الألم (Gate Control Theory) تجعل إشارات الضغط تسبق إشارات وخز الإبرة في الوصول للدماغ.',
        dangerZoneWarning: 'تجنب الحقن المباشر في الحنك دون تخدير بالضغط المسبق.',
        visualDetail: 'Firm swab pressure causing blanching prior to needle puncture',
      },
      {
        stepNumber: 2,
        title: 'الاختراق البطيء والإفراغ بالقطرات',
        instruction: 'ادخل بالإبرة ملاصقاً لموضع الضغط بزاوية عمودية. ادفع بضع قطرات فور الدخول، ثم تقدم 3 ملم للعظم واحقن 0.3 مل ببطء على مدى 30 ثانية.',
        clinicalTip: 'مراقبة الابيضاض المتسع (Ischemic Blanching) حول نقطة الحقن علامة على دقة التموضع.',
        dangerZoneWarning: 'لا تدخل داخل الثقبة العظمية الكبيرة؛ الحقن السطحي فوقها كافٍ تماماً.',
        visualDetail: 'Slow 0.3ml delivery with expanding ischemic ring',
      },
    ],
  },
  {
    id: 'skill-anes-infiltration',
    category: 'anesthesia',
    categoryLabel: 'طرق التخدير السريري (Local Anesthesia)',
    title: 'التخدير بالرشح الموضعي فوق السمحاق (Local Infiltration / Supraperiosteal)',
    titleEn: 'Supraperiosteal Local Infiltration for Any Tooth',
    shortDesc: 'التقنية المعتمدة لجميع أسنان الفك العلوي والأسنان الأمامية السفلية؛ بنج سريع وموضعي وآمن.',
    indication: 'ترميمات الفك العلوي، حشوات الكومبوزيت، علاج الجذور، وقواطع الفك السفلي.',
    difficulty: 'مبتدئ',
    estimatedTime: '1 - 2 دقيقة',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    needleGaugeLength: '27-gauge Short (قصيرة)',
    targetNerve: 'الفروع العصبية اللبية والسنخية الدقيقة عند ذروة جذر السن المستهدف (Apical Foramen).',
    anatomicalLandmarks: [
      'الميزاب الدهليزي المقابل لذروة السن (Mucobuccal fold).',
      'تاج السن المعني وبروز الجذر السنخي.',
      'خط الانتقال بين المخاطية الحرة واللثة الملتصقة (Mucogingival junction).',
    ],
    insertionAngle: 'زاوية 45 درجة مع المحور الطولي للسن، مع توجيه مشطوف الإبرة (Bevel) نحو العظم.',
    penetrationDepth: '2 إلى 4 ملم فقط حتى الوصول إلى مستوى ذروة الجذر دون تمزيق السمحاق.',
    aspirationProtocol: 'سحب سلبي للتأكد من عدم اختراق وعاء دموي سطحي.',
    dosageVolume: '0.6 إلى 1.0 مل (ثلث إلى نصف كاربول) ببطء خلال 30 ثانية.',
    onsetDuration: 'سريع جداً (1 إلى 2 دقيقة في الفك العلوي بسبب مسامية العظم).',
    anesthetizedAreas: [
      'لب السن المستهدف كاملاً (Pulpal Anesthesia).',
      'الرباط حول السني (PDL) والعظم السنخي المحيط.',
      'اللثة والغشاء المخاطي الدهليزي المحيط بالسن.',
    ],
    diagramType: 'infiltration',
    diagramCaption: 'مسار الإبرة بزاوية 45 درجة نحو ذروة الجذر مع توجيه المشطوف (Bevel) نحو صفيحة العظم',
    clinicalKeyPoints: [
      'توجيه مشطوف الإبرة (Bevel towards bone) يمنع خدش السمحاق المؤلم ويسهل انسياب المحلول المخدر عبر المسامات العظمية إلى ذروة الجذر.',
      'شد الشفة أو الخد جيداً لتفادي انثناء الغشاء المخاطي أثناء دخول الإبرة.',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'شد الأنسجة وتحديد مستوى الذروة',
        instruction: 'باستخدام مرآة الفحص أو الشاش، شد الشفة للأعلى والخارج (في الفك العلوي) لشد الغشاء المخاطي وتحديد خط الـ Mucogingival junction.',
        clinicalTip: 'الأنسجة المشدودة تخترقها الإبرة دون أي مقاومة أو ألم.',
        dangerZoneWarning: 'تجنب الحقن في منطقة ملتهبة أو خراج قيحي؛ الحامضية تعطل مفعول البنج وتنشر الإنتان.',
        visualDetail: 'Taut mucosal retraction at mucobuccal fold',
      },
      {
        stepNumber: 2,
        title: 'الاختراق بمستوى الذروة وتفريغ المحلول',
        instruction: 'ادخل بالإبرة في أعلى الميزاب بزاوية 45° باتجاه ذروة الجذر لمسافة 2-3 ملم، اسحب للتأكد من سلبية السحب، ثم افرغ 0.8 مل ببطء وسلاسة.',
        clinicalTip: 'في الأسنان ذات الجذور الطويلة (مثل الأنياب العلوية #13 و #23)، ادخل أعلى قليلاً لضمان وصول المخدر إلى ذروة الجذر.',
        dangerZoneWarning: 'لا تضرب العظم بعنف لعدم ثني رأس الإبرة وتكوين نتوء خطافي (Fishhook).',
        visualDetail: 'Bevel-to-bone placement at apical level',
      },
    ],
  },

  // ==========================================
  // SECTION B: RUBBER DAM ISOLATION METHODS
  // ==========================================
  {
    id: 'skill-rd-wingless',
    category: 'rubber_dam',
    categoryLabel: 'طرق تركيب الربر دام (Rubber Dam Isolation)',
    title: 'طريقة الكلامب بدون أجنحة (Wingless Technique - Clamp First or Dam First)',
    titleEn: 'Wingless Clamp Isolation Protocol (Clamp-First Method)',
    shortDesc: 'الطريقة الأكثر تحكماً ورؤية واضحة؛ يوضع الكلامب أولاً على السن للتأكد من ثباته التام، ثم تُمد شيت الربر دام فوقه.',
    indication: 'الأضراس السفلية والعلويات، الأسنان ذات التيجان القصيرة، وعلاج العصب والترميم الدقيق.',
    difficulty: 'متوسط',
    estimatedTime: '2 - 4 دقائق للتركيب الكامل',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    damTechniqueType: 'wingless',
    recommendedClamps: ['W8A (للأضراس المتآكلة)', 'W2 (للضواحك)', 'W3 (للأضراس الصغيرة)', 'W7 (للأضراس السفلية العادية)'],
    clinicalKeyPoints: [
      'خيط الأمان (Floss Safety Leash): قاعدة إلزامية! اربط خيط أسنان بطول 30 سم بقوس الكلامب لتجنب ابتلاعه إذا انكسر.',
      'تأكد من ارتكاز النقاط الأربع لفكوك الكلامب (4-point contact) تحت منطقة أقصى تحدب في السن (Sub-bulbar contact).',
    ],
    isolationPhases: [
      {
        phaseName: '1. التثقيب (Punching)',
        action: 'تحديد موضع السن وثقب الشيت بالمقاس المناسب (ثقب رقم 4 أو 5 للأضراس).',
        criticalPoint: 'التثقيب النظيف بدون شظايا لمنع تمزق الشيت أثناء الشد.',
      },
      {
        phaseName: '2. ربط خيط الأمان وتثبيت الكلامب (Clamp Placement)',
        action: 'تثبيت الكلامب على السن بواسطة ملقط الكلامب (Forceps) أسفل أقصى تحدب لثوياً.',
        criticalPoint: 'اختبار ثبات الكلامب بالنقر الخفيف بالإصبع للتأكد من عدم تحركه.',
      },
      {
        phaseName: '3. تمرير الشيت فوق القوس (Dam Over Clamp)',
        action: 'شد الثقب فوق قوس الكلامب (Bow) ثم فكيه بلطف باستخدام السبابتين.',
        criticalPoint: 'انزلاق مطاط الربر دام بسلاسة تحت فكي الكلامب ليحيط بعنق السن بالكامل.',
      },
      {
        phaseName: '4. تركيب الإطار (Frame Securing)',
        action: 'تثبيت شيت الربر دام على الإطار (Young frame) مع الحفاظ على التحدب المريح.',
        criticalPoint: 'تعديل الشد لمنع انسداد أنف المريض وضمان راحة التنفس.',
      },
      {
        phaseName: '5. التمرير الخيطي والقلب اللثوي (Flossing & Inversion)',
        action: 'تمرير خيط الأسنان بين نقاط التماس وقلب حواف الثقب داخل الميزاب اللثوي بهواء خفيف.',
        criticalPoint: 'الانقلاب اللثوي (Inversion) هو ما يمنع تسرب اللعاب بنسبة 100%.',
      },
    ],
    diagramType: 'rubber_dam_wingless',
    diagramCaption: 'خطوات تقنية الكلامب عديم الأجنحة: تثبيت الكلامب أولاً ثم سحب المطاط فوق القوس والفكين والقلب اللثوي',
    steps: [
      {
        stepNumber: 1,
        title: 'ثقب الشيت وربط خيط الأمان الإلزامي',
        instruction: 'حدد السن على بطاقة الثقب (Template) واثقب ثقباً نظيفاً. اربط خيط أسنان حريري مزدوج بقوس الكلامب بطول كافٍ واتركه خارج الفم كصمام أمان.',
        clinicalTip: 'اختر ثقباً قطره 2 مم للأضراس الكبيرة و 1.5 مم للضواحك لمنع التسرب.',
        dangerZoneWarning: 'ممنوع إدخال أي كلامب لفم المريض بدون ربط خيط الأمان تجنباً لابتلاعه.',
        visualDetail: 'Safety floss tied to clamp bow + clean round punch',
      },
      {
        stepNumber: 2,
        title: 'وضع الكلامب واختبار الاستقرار (Stability Check)',
        instruction: 'باستخدام ملقط الكلامبات، افتح فكي الكلامب وثبتهما برفق تحت أوسع نقطة في السن عند خط اللثة. انزع الملقط وافحص الثبات بالنقر الخفيف على القوس.',
        clinicalTip: 'يجب أن تلامس الفكوك العاج السليم عند 4 نقاط ارتكاز متناظرة.',
        dangerZoneWarning: 'انزلاق الكلامب المفاجئ يسبب رضّاً في اللثة وألماً للمريض.',
        visualDetail: 'Sub-bulbar 4-point contact verification',
      },
      {
        stepNumber: 3,
        title: 'شد الشيت وتمريرها فوق القوس والفكوك',
        instruction: 'امسك الشيت بكلتا يديك، ووسع الثقب بلطف ومرره أولاً فوق قوس الكلامب من الخلف، ثم اسحبه للأمام ليعبر فكي الكلامب ويحيط بعنق السن تماماً.',
        clinicalTip: 'استخدم قمع الفحص أو أداة Flat Plastic لتحرير أي حافة مطاطية علقت فوق فك الكلامب.',
        dangerZoneWarning: 'لا تشد بقوة مفرطة حتى لا يتمزق الثقب وتضطر للبدء من جديد.',
        visualDetail: 'Stretching dam hole over bow and releasing beneath jaws',
      },
      {
        stepNumber: 4,
        title: 'تثبيت الإطار وتمرير نقاط التماس (Flossing Contacts)',
        instruction: 'ثبت شيت الربر دام على إطار يونغ (Young Frame). خذ خيط أسنان مدهون بفازلين خفيف ومرر حواف الشيت بين نقاط التماس المجاورة من الأعلى للأسفل بحركة منشارية لطيفة.',
        clinicalTip: 'تمرير الخيط بحركة زاوية (45 درجة) يمنع تمزق الربر دام بين الأسنان المتلاصقة بشدة.',
        dangerZoneWarning: 'لا تضغط الخيط بعنف عمودياً على حليمة اللثة لمنع جرحها ونزفها.',
        visualDetail: 'Interdental flossing and frame mounting',
      },
      {
        stepNumber: 5,
        title: 'قلب حواف الثقب لثوياً (Inversion Protocol)',
        instruction: 'وجّه تيار هواء جاف من سرنجة الهواء (Triple Syringe) حول عنق السن، واستخدم مسباراً غير حاد أو أداة بلاستيكية لقلب حافة المطاط داخل الميزاب اللثوي ليغلق بإحكام كالصمام.',
        clinicalTip: 'الانقلاب اللثوي يخلق ضغطاً سالباً يمنع صعود أي قطرة لعاب أثناء العمل.',
        dangerZoneWarning: 'عدم إجراء الانقلاب يسبب فشل العزل ودخول الرطوبة إلى الكومبوزيت.',
        visualDetail: 'Subgingival inversion creating leak-proof suction seal',
      },
    ],
  },
  {
    id: 'skill-rd-winged',
    category: 'rubber_dam',
    categoryLabel: 'طرق تركيب الربر دام (Rubber Dam Isolation)',
    title: 'طريقة الكلامب المجنح بخطوة واحدة (Winged Technique - One Step)',
    titleEn: 'Winged Clamp Single-Step Isolation Technique',
    shortDesc: 'أسرع طريقة لعزل الأسنان في خطوة واحدة؛ يُثبت الربر دام على أجنحة الكلامب خارج الفم ثم يوضعان معاً في ثوانٍ.',
    indication: 'الأضراس العلوية والسفلية ذات التيجان السليمة، والعمل السريري السريع في العيادة.',
    difficulty: 'مبتدئ',
    estimatedTime: '60 إلى 90 ثانية',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    damTechniqueType: 'winged',
    recommendedClamps: ['#14 أو #14A (للأضراس العلوية والسفلية)', '#8 أو #8A (للأضراس العلوية)', '#2 أو #2A (للضواحك)'],
    clinicalKeyPoints: [
      'تثبيت أجنحة الكلامب الجانبية (Lateral Wings) داخل ثقب الربر دام خارج الفم قبل الإدخال.',
      'بعد إجلاس الكلامب على السن، يجب إنزال المطاط عن الأجنحة باستخدام Beaver tail أو أداة حفر ناعمة.',
    ],
    isolationPhases: [
      {
        phaseName: '1. تعليق الشيت على الأجنحة خارج الفم',
        action: 'إدخال أجنحة الكلامب الخارجية داخل ثقب الربر دام وترك قوس الكلامب بارزاً للخارج.',
        criticalPoint: 'تجهيز المنظومة كاملة على ملقط الكلامبات قبل الاقتراب من فم المريض.',
      },
      {
        phaseName: '2. الإجلاس المباشر في الفم (Single Movement Seating)',
        action: 'نقل الكلامب والشيت معاً ووضعهما على السن بحركة واحدة هادئة ومحكمة.',
        criticalPoint: 'التأكد من نزول فكي الكلامب تحت محيط السن بالكامل.',
      },
      {
        phaseName: '3. تفريغ المطاط عن الأجنحة (Wing Release)',
        action: 'تمرير أداة مسطحة أسفل الشيت لرفعها عن الجناحين وإسقاطها حول عنق السن.',
        criticalPoint: 'سماع صوت ارتخاء المطاط واستقراره حول محيط السن بدقة.',
      },
      {
        phaseName: '4. شد الإطار والقلب اللثوي',
        action: 'تثبيت الإطار وتمرير الخيط وقلب الحواف كما في البروتوكول المعياري.',
        criticalPoint: 'فحص عزل 360 درجة حول السن.',
      },
    ],
    diagramType: 'rubber_dam_winged',
    diagramCaption: 'تثبيت الشيت على أجنحة الكلامب خارج الفم ثم إجلاسه دفعة واحدة وتنزيل المطاط عن الأجنحة',
    steps: [
      {
        stepNumber: 1,
        title: 'تجميع الكلامب والشيت خارج الفم',
        instruction: 'اثقب الربر دام، ثم ادخل الجناحين الجانبيين للكلامب (Wings) داخل الثقب من الجهة العلوية بحيث يظل القوس خلف الشيت وفكا الكلامب بالأسفل.',
        clinicalTip: 'اجمع أطراف الشيت في راحة يدك لعدم إعاقة الرؤية أثناء التوجيه داخل الفم.',
        dangerZoneWarning: 'تأكد من عدم إفلات الكلامب من الشيت قبل التقاطه بالملقط.',
        visualDetail: 'Wings hooked into dam hole extraorally',
      },
      {
        stepNumber: 2,
        title: 'التثبيت الفموي بخطوة واحدة',
        instruction: 'التقط الكلامب بالملقط، وجهه إلى فم المريض مع إبعاد الخد، وثبت فكي الكلامب مباشرة حول عنق السن وافلت الملقط.',
        clinicalTip: 'تمنحك هذه الخطوة سرعة قياسية لا تتجاوز دقيقة واحدة لتأمين العزل.',
        dangerZoneWarning: 'تأكد من عدم حصر مخاطية اللثة تحت فكي الكلامب أثناء الإطباق.',
        visualDetail: 'Direct one-step seating onto tooth cervical',
      },
      {
        stepNumber: 3,
        title: 'إنزال المطاط عن الأجنحة (Snap-Off Wings)',
        instruction: 'باستخدام طرف أداة مسطحة (Flat Plastic)، ادفع حافة المطاط برفق من فوق الجناح الأيمن ثم الأيسر لتنزلق الشيت وتطوق رقبة السن بالكامل تحت الكلامب.',
        clinicalTip: 'إذا شعرت بمقاومة، حرك الأداة بحركة دورانية خفيفة لتنزلق الشيت بنعومة.',
        dangerZoneWarning: 'احذر وخز اللثة بالآلة أثناء محاولة إنزال المطاط.',
        visualDetail: 'Popping dam sheet off the lateral wings into subgingival position',
      },
      {
        stepNumber: 4,
        title: 'الإطار والتأمين النهائي',
        instruction: 'ضع إطار يونغ، مرر الخيط بين الأسنان المتلاصقة، وقم بعمل الانقلاب اللثوي لإنهاء العزل بشكل مثالي.',
        clinicalTip: 'يمكن استخدام Wedjets ملونة لتثبيت الشيت في الجهة الأمامية دون الحاجة لكلامب ثانٍ.',
        dangerZoneWarning: 'تأكد من خلو منطقة الفتحة من الشد الزائد الذي قد يخلع الكلامب من مكانه.',
        visualDetail: 'Securing with frame and interproximal wedjet',
      },
    ],
  },
  {
    id: 'skill-rd-split',
    category: 'rubber_dam',
    categoryLabel: 'طرق تركيب الربر دام (Rubber Dam Isolation)',
    title: 'طريقة العزل المخصص للحالات الصعبة والحواف العميقة (Split Dam & Deep Margin Isolation)',
    titleEn: 'Split Dam & Deep Margin Elevation Custom Isolation Technique',
    shortDesc: 'الحل السريري المتقدم للأسنان المكسورة تحت اللثة، والجسور الثابتة، والحالات التي لا يثبت فيها الكلامب التقليدي.',
    indication: 'تجاويف Class II العميقة جداً تحت مستوى اللثة (Subgingival margins)، الأسنان المتهدمة، وعزل الجسور.',
    difficulty: 'متقدم',
    estimatedTime: '4 - 6 دقائق',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    damTechniqueType: 'split_custom',
    recommendedClamps: ['#212 (Cervical Retractor للأسنان الأمامية)', 'Brinker B4 (للحواف العميقة)', 'W8A أو Wedjets'],
    clinicalKeyPoints: [
      'استخدام تقنية الثقوب المتصلة (Overlapping holes with slit) أو ثقبين متقاربين يقطعان بمقص لإنشاء شق متصل.',
      'استخدام الربر دام السائل (Liquid Dam / Light-cured Gingival Barrier) لسد أي تسرب ميكروي حول الحافة العميقة.',
      'استخدام شريط التفلون الطبي (PTFE Teflon Tape) للضغط على اللثة وكشف الحافة السفلية قبل وضع الماتريكس.',
    ],
    isolationPhases: [
      {
        phaseName: '1. الثقب المشقوق المخصص (Custom Slit Punching)',
        action: 'ثقب ثقبين للأسنان المجاورة وقصهما بمقص جراحي لتشكيل شق طولي متصل (Split Slot).',
        criticalPoint: 'طول الشق يجب أن يطابق بدقة المسافة بين الأسنان دون زيادة تسبب فجوات واسعة.',
      },
      {
        phaseName: '2. إسناد الشيت على الأسنان السليمة المجاورة',
        action: 'تثبيت الكلامب على سن خلفي سليم تماماً وتثبيت الشيت بالـ Wedjets على سن أمامي.',
        criticalPoint: 'تحرير السن المكسور في المنتصف دون ضغط مباشر من فكي الكلامب على المنطقة المتهدمة.',
      },
      {
        phaseName: '3. كشف الحافة العميقة بـ PTFE والتفلون',
        action: 'ضغط شريط تفلون معقم تحت اللثة لإبعاد الأنسجة وإظهار الحافة السفلية بوضوح تام.',
        criticalPoint: 'إيقاف أي نزف مجهري بالضغط الميكانيكي قبل بدء البوندنج.',
      },
      {
        phaseName: '4. الختم بالربر دام السائل (Liquid Dam Barrier)',
        action: 'تطبيق طبقة من الجل الضوئي السائل وعلاجه بالضوء لمدة 20 ثانية لسد الحواف تماماً.',
        criticalPoint: 'عزل تام 100% يمنع دخول الدم أو اللعاب إلى الصندوق الملاصق.',
      },
    ],
    diagramType: 'rubber_dam_split',
    diagramCaption: 'تطبيق تقنية الشق المتصل (Split Dam) مع حشوة التفلون والربر دام الضوئي لإغلاق الحواف العميقة',
    steps: [
      {
        stepNumber: 1,
        title: 'تصميم الشق المتصل (Slit Design)',
        instruction: 'اثقب ثقبين كبيرين يغطيان السن المتهدم والسن المجاور له، ثم صل بينهما بمقص جراحي دقيق لصنع فتحة هلالية متصلة.',
        clinicalTip: 'يمكن استخدام ثقبين متباعدين بمقدار 2 مم فقط إذا كان هناك جدار عظمي ملاصق جزئي.',
        dangerZoneWarning: 'القص غير المتناسق يسبب زوايا مشرشرة تؤدي لتمزق الشيت عند الشد.',
        visualDetail: 'Slit cut between two adjacent punch holes',
      },
      {
        stepNumber: 2,
        title: 'التثبيت المحيطي غير المباشر',
        instruction: 'ضع كلامب قوي (مثل W8A أو W3) على الضرس المجاور السليم خلف السن المتهدم، واستخدم إسفين مطاطي (Wedjet) أو خيط لربط السن الأمامي.',
        clinicalTip: 'هذا التكنيك يجنب السن المكسور ضغط فكي الكلامب التي قد تؤدي لكسر ما تبقى من جداره.',
        dangerZoneWarning: 'تأكد من أن الكلامب مثبت على سن قوي يتحمل الشد الميكانيكي.',
        visualDetail: 'Anchoring on sound distal anchor tooth with mesial wedjet',
      },
      {
        stepNumber: 3,
        title: 'تبعيد الحافة العميقة بشريط التفلون (PTFE Margin Retraction)',
        instruction: 'لف شريط تفلون معقم حول حافة السن العميقة واضغطه بمسبار بلطف داخل الميزاب لدفع اللثة لأسفل وإبراز الحافة العاجية فوق مستوى الربر دام.',
        clinicalTip: 'التفلون خامل حيوياً، لا يلتصق بالبوند أو الكومبوزيت، ويوقف النزف فورياً.',
        dangerZoneWarning: 'تجنب دفع التفلون بقوة مفرطة تتلف الارتباط البشروي السني (Junctional Epithelium).',
        visualDetail: 'PTFE tape cord packed subgingivally for margin exposure',
      },
      {
        stepNumber: 4,
        title: 'الختم المحكم بالربر دام السائل (Liquid Dam Application)',
        instruction: 'طبق طبقة بسماكة 1-2 مم من الـ Liquid Dam الضوئي على طول الحافة الرخوة وحول التفلون، ثم بلمر بالضوء لمدة 20 ثانية للحصول على جدار عازل صلب ومحكم.',
        clinicalTip: 'افحص العزل بتوجيه رذاذ ماء خفيف وتأكد من جفاف الكافتي الداخلي بنسبة 100%.',
        dangerZoneWarning: 'تأكد من عدم وصول الربر دام السائل إلى سطح التحضير العاجي أو داخل الكافتي.',
        visualDetail: 'Cured light-activated resin barrier creating dry restorative chamber',
      },
    ],
  },

  // ==========================================
  // SECTION C: DENTAL SUTURE TECHNIQUES
  // ==========================================
  {
    id: 'skill-sut-simple',
    category: 'suturing',
    categoryLabel: 'طرق الخياطة الجراحية المهمة (Essential Suture Techniques)',
    title: 'الخياطة المنفصلة البسيطة (Simple Interrupted Suture)',
    titleEn: 'Simple Interrupted Suture (The Universal Dental Suture)',
    shortDesc: 'الخياطة الأكثر شيوعاً واعتماداً في الجراحة الفموية؛ تمتاز بالدقة وسهولة الإجراء وإمكانية فك غرزة دون التأثير على البقية.',
    indication: 'إغلاق شقوق الخلع الجراحي، استئصال الآفات والخزعات، وخياطة اللثة حول الأسنان وزراعة الأسنان.',
    difficulty: 'مبتدئ',
    estimatedTime: '1 - 2 دقيقة للغرزة الواحدة',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    sutureType: 'simple_interrupted',
    recommendedMaterial: 'حرير جراحي 3-0 أو 4-0 Silk (غير ممتص) أو Vicryl / PGA (ممتص)',
    biteDistance: '3 إلى 4 ملم من حافة الشق الجراحي (Bite distance = 3-4mm)',
    knotTechnique: 'عقدة الجراح الكلاسيكية: لفتان للأمام (2 Forward) + لفة للخلف (1 Reverse) + لفة قفل مربعة (Square knot).',
    clinicalKeyPoints: [
      'دخول الإبرة بزاوية عمودية 90 درجة مع سطح النسيج الرخو لضمان قلب حواف الجرح للأعلى (Wound edge eversion).',
      'عقد الخيط يجب أن توضع دائماً على جانب الشق الجراحي (جانب النسيج الثابت)، وممنوع وضع العقدة مباشرة فوق خط الجرح.',
      'ترك أطراف الخيط بطول 3 إلى 4 ملم بعد القص لتسهيل إزالتها ومنع وخز لسان المريض.',
    ],
    diagramType: 'suture_interrupted',
    diagramCaption: 'مسار الإبرة بزاوية 90 درجة على بعد 3-4 مم من الحواف وموضع عقدة الجراح الجانبية',
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت الفلاب ودخول الإبرة بزاوية 90°',
        instruction: 'امسك حافة الفلاب المتحرك بملقط الأنسجة الجراحي (Tissue Forceps - Adson) دون ضغط مفرط. ادخل رأس الإبرة عمودياً 90° على مسافة 3-4 ملم من حافة الجرح.',
        clinicalTip: 'اتبع انحناء الإبرة الدائري بحركة رسغ اليد الطبيعية (Wrist rotation) دون دفع مستقيم يمزق الأنسجة.',
        dangerZoneWarning: 'دخول الإبرة على مسافة أقل من 2 ملم من الحافة يؤدي لتمزق النسيج عند شد العقدة (Tissue tear).',
        visualDetail: '90-degree needle entry 3-4mm from mobile flap edge',
      },
      {
        stepNumber: 2,
        title: 'العبور بالفلاب المقابل الثابت',
        instruction: 'اخرج بالإبرة من الفلاب الأول، ثم اعد إدخالها بنفس العمق والمسافة (3-4 ملم) من أسفل الفلاب المقابل إلى سطحه الخارجي بحركة دورانية واحدة.',
        clinicalTip: 'تأكد من أن حجم قضمة النسيج (Tissue bite) متساوٍ بالعمق والعرض على جانبي الجرح.',
        dangerZoneWarning: 'عدم تماثل المسافة على الجانبين يسبب تراكب الحواف (Overlap) وتأخر الشفاء.',
        visualDetail: 'Symmetrical exit through fixed attached gingiva',
      },
      {
        stepNumber: 3,
        title: 'ربط عقدة الجراح المزدوجة (Surgeon’s Knot)',
        instruction: 'لف الخيط لفتين للأمام حول طرف ملقط الإبر (Needle Holder)، التقط الطرف القصير، واشد برفق حتى تتقارب الحواف تماماً دون شد نخر مفرط (Tissue blanching).',
        clinicalTip: 'احرص على تقريب الحواف فقط (Approximate, do not strangulate) لمنع نقص التروية الدموية.',
        dangerZoneWarning: 'الشد المفرط يؤدي لنخر حواف النسيج وفك الغرزة ذاتياً.',
        visualDetail: 'Double forward throw loop adaptation',
      },
      {
        stepNumber: 4,
        title: 'القفل والإزاحة الجانبية (Offsetting Knot)',
        instruction: 'لف لفة واحدة عكسية للأمام لغلق العقدة، ثم لفة مربعة ثالثة للتأمين. اسحب العقدة بكاملها إلى جانب خط الشق فوق الأنسجة الملتصقة وقص الخيط بطول 3-4 ملم.',
        clinicalTip: 'وضع العقدة على الجانب يمنع تجمع البكتيريا وبقايا الطعام مباشرة فوق خط التئام الجرح.',
        dangerZoneWarning: 'قص الخيط قصيراً جداً (أقل من 2 مم) قد يؤدي لانفلات العقدة مع حركة الفم.',
        visualDetail: 'Lateral knot placement with 4mm trimmed tails',
      },
    ],
  },
  {
    id: 'skill-sut-continuous',
    category: 'suturing',
    categoryLabel: 'طرق الخياطة الجراحية المهمة (Essential Suture Techniques)',
    title: 'الخياطة المستمرة العادية والمقفلة (Continuous & Locking Suture)',
    titleEn: 'Continuous Non-Locking & Ford Interlocking Suture',
    shortDesc: 'أسرع طريقة لإغلاق الشقوق الطويلة؛ توفر شداً متساوياً على طول الحافة وتستخدم في استئصال الأكياس والخلع المتعدد.',
    indication: 'عمليات الخلع المتعددة للأسنان المتجاورة، تسوية الحافة السنخية (Alveoloplasty)، والشقوق الطويلة.',
    difficulty: 'متوسط',
    estimatedTime: '2 - 3 دقائق لكامل الفلاب',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    sutureType: 'continuous',
    recommendedMaterial: '3-0 أو 4-0 Silk أو Vicryl سريع الامتصاص',
    biteDistance: '3 - 4 ملم من الحواف، والمسافة بين الغرزة والتي تليها 5 إلى 6 ملم.',
    knotTechnique: 'غرزة أولى منفصلة وعقدة جراح، ثم تمرير متواصل، وعقد النهاية مع الحلقة الأخيرة (Loop as a short tail).',
    clinicalKeyPoints: [
      'في تقنية القفل (Ford Interlocking): تمرر الإبرة من داخل كل حلقة قبل شدها لتثبيت كل مقطع ومنع ارتخاء الخياطة بالكامل.',
      'توزيع الشد بالتساوي: تجنب الشد المفرط في البداية حتى لا يتجعد الفلاب في النهاية.',
    ],
    diagramType: 'suture_continuous',
    diagramCaption: 'المسار المتواصل للغرز المتتالية مع تقنية القفل الهيدروليكي (Interlocking Loops)',
    steps: [
      {
        stepNumber: 1,
        title: 'الغرزة الافتتاحية وربط العقدة الأولى',
        instruction: 'ابدأ بغرزة منفصلة عادية عند الطرف البعيد للشق الجراحي، اربط عقدة الجراح كاملة، وقص الطرف القصير فقط مع الإبقاء على الخيط الطويل متصلاً بالإبرة.',
        clinicalTip: 'العقدة الأولى هي نقطة الارتكاز الثابتة لكامل الشد المتتالي.',
        dangerZoneWarning: 'تأكد من إحكام العقدة الأولى جيداً قبل متابعة المسار.',
        visualDetail: 'Anchor knot tied at one end of long incision',
      },
      {
        stepNumber: 2,
        title: 'التمرير المتتالي مع تقنية القفل (Ford Interlocking)',
        instruction: 'ادخل بالإبرة على بعد 5-6 ملم من الغرزة السابقة بنفس الزاوية والعمق. قبل إحكام الحلقة، مرر الإبرة من داخل حلقة الخيط لتأمين قفل ميكانيكي مستقل لكل غرزة.',
        clinicalTip: 'القفل المستمر يمنع انفلات كامل الخياطة إذا انقطع جزء منها لاحقاً.',
        dangerZoneWarning: 'لا تدع الخيط يتعقد تلقائياً قبل دخوله في الحلقة.',
        visualDetail: 'Needle passing through loop creating locking bar',
      },
      {
        stepNumber: 3,
        title: 'العقدة الختامية مع الحلقة الأخيرة',
        instruction: 'عند الوصول لنهاية الشق، اترك الحلقة الأخيرة مرتخية قليلاً واستخدمها كطرف خيط ثانٍ لربط عقدة الجراح الختامية وتأمينها بثلاث عقد متراكبة.',
        clinicalTip: 'قص الأطراف متساوية بطول 4 ملم.',
        dangerZoneWarning: 'تأكد من عدم شد الحلقة الأخيرة بقوة تجعل ربط العقدة مستحيلاً.',
        visualDetail: 'Final tie using slack loop as the second tail',
      },
    ],
  },
  {
    id: 'skill-sut-mattress',
    category: 'suturing',
    categoryLabel: 'طرق الخياطة الجراحية المهمة (Essential Suture Techniques)',
    title: 'خياطة الماترس الأفقية والعمودية (Horizontal & Vertical Mattress)',
    titleEn: 'Horizontal & Vertical Mattress Suture (Flap Eversion & Space Closure)',
    shortDesc: 'الخياطة الأكثر قوة لقلب الحواف وتفريغ التوتر العضلي وإغلاق المسافات فوق الطعوم العظمية والجيوب اللثوية.',
    indication: 'زراعة العظام وتغطية السنخ بعد الخلع، جراحة السديلة اللثوية ذات التوتر العالي، وحالات رفع الجيب الفكي.',
    difficulty: 'متقدم',
    estimatedTime: '2 - 3 دقائق للغرزة',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    sutureType: 'mattress',
    recommendedMaterial: '4-0 PTFE أو Monofilament / Vicryl (لتقليل تراكم البكتيريا)',
    biteDistance: 'الأفقية: 4-5 ملم من الحافة، والمسافة بين النقطتين أفقياً 4-5 ملم. العمودية: بعيد-بعيد (6-8 مم) ثم قريب-قريب (1-2 مم).',
    knotTechnique: 'عقدة الجراح الكلاسيكية على جانب الشق المعاكس للمسار الموازي.',
    clinicalKeyPoints: [
      'الماترس الأفقية (Horizontal): ممتازة لضغط الأنسجة فوق الطعوم العظمية وموازنة النزف والتوتر.',
      'الماترس العمودية (Vertical - Far/Far, Near/Near): ملكة قلب الحواف (Flap Eversion) وتفادي انطواء اللثة لداخل الجرح (Inversion).',
    ],
    diagramType: 'suture_mattress',
    diagramCaption: 'المخطط التشريحي لمسار الماترس الأفقية والعمودية (بعيد-بعيد وقريب-قريب) مع إبراز الحواف المقلوبة',
    steps: [
      {
        stepNumber: 1,
        title: 'الماترس الأفقية: العبور الأول والعودة الموازية',
        instruction: 'ادخل بالإبرة على مسافة 4-5 ملم من حافة الفلاب الأول واخرج بنفس المسافة من الفلاب المقابل. تحرك أفقياً بمقدار 4-5 ملم واعد إدخال الإبرة من الفلاب الثاني عائداً للأول.',
        clinicalTip: 'تتشكل حلقة أفقية متوازية فوق خط الشق تضغط الفلاب لأسفل وتقلب الحواف بإحكام.',
        dangerZoneWarning: 'تجنب وضع النقاط قريبة جداً أفقياً حتى لا ينقطع النسيج تحت ضغط العقدة.',
        visualDetail: 'Horizontal loop crossing perpendicular then returning parallel',
      },
      {
        stepNumber: 2,
        title: 'الماترس العمودية (Far-Far, Near-Near)',
        instruction: 'في الماترس العمودية: ادخل أولاً على بعد عميق (6-8 ملم) واعبر الفلاب المقابل عميقاً (Far-Far). ثم اقلب الإبرة وارجع سطحياً على بعد 1-2 ملم من الحواف (Near-Near).',
        clinicalTip: 'توفر هذه التقنية دعماً مزدوجاً: الشد العميق يفرغ التوتر، والقريب السطحي يضمن التئاماً تجميلياً فائق الدقة.',
        dangerZoneWarning: 'احذر تمزيق الحافة القريبة أثناء العودة السطحية.',
        visualDetail: 'Vertical Far-Far deep bite returning Near-Near superficial',
      },
      {
        stepNumber: 3,
        title: 'الربط ومراقبة قلب الحواف (Eversion)',
        instruction: 'اربط العقدة بهدوء وراقب ارتفاع حافتي الجرح وانقلابهما الخفيف للأعلى (Eversion)، مما يضمن التماس بطانة العاج والغشاء المخاطي دون أي فجوة.',
        clinicalTip: 'الحواف المقلوبة تلتئم أسرع بنسبة 40% وتمنع تشكل الندبات التجميلية.',
        dangerZoneWarning: 'لا تشد حتى يبيض النسيج تماماً لعدم انقطاع التروية الدموية.',
        visualDetail: 'Slight outward ridge eversion upon knot tightening',
      },
    ],
  },
  {
    id: 'skill-sut-figure8',
    category: 'suturing',
    categoryLabel: 'طرق الخياطة الجراحية المهمة (Essential Suture Techniques)',
    title: 'خياطة الرقم 8 فوق السنخ (Figure-of-Eight Suture)',
    titleEn: 'Figure-of-Eight Suture (Socket Stabilization & Hemostasis)',
    shortDesc: 'الخياطة المثالية بعد خلع الأسنان لتثبيت إسفنج الجيلاتين أو الشاش المرقئ ومقاربة الحليمات دون تمزيق اللثة.',
    indication: 'تثبيت سنخ الخلع بعد قلع الأسنان، تثبيت مواد التخثر (Gelfoam, Surgicel)، وتكييف الحليمات اللثوية بين السنية.',
    difficulty: 'متوسط',
    estimatedTime: '60 إلى 90 ثانية',
    isVisible: true,
    isSystem: true,
    dateAdded: '2026-09-29',
    sutureType: 'figure_of_eight',
    recommendedMaterial: '3-0 أو 4-0 Silk أو Vicryl',
    biteDistance: '3 ملم من قمة الحليمة اللثوية في الجانبين الدهليزي واللساني.',
    knotTechnique: 'عقدة الجراح مع تقاطع مائل يشبه الرقم 8 بالإنجليزية فوق فوهة السنخ.',
    clinicalKeyPoints: [
      'لا تهدف هذه الخياطة لإغلاق فوهة السنخ العظمي تماماً، بل لتثبيت الخثرة الدموية ومواد التجلط في مكانها ومنع انزلاقها.',
      'مسار الإبرة يعبر قطرياً فوق السنخ، مما يوزع الشد بالتساوي على الحليمتين دون إحداث تمزق لثوي.',
    ],
    diagramType: 'suture_figure8',
    diagramCaption: 'مسار الرقم 8 المتقاطع فوق فوهة سنخ السن بعد الخلع لتأمين الخثرة ومواد التخثر',
    steps: [
      {
        stepNumber: 1,
        title: 'الاختراق الدهليزي والعبور القطري',
        instruction: 'ادخل بالإبرة من السطح الخارجي للثة الدهليزية على مسافة 3 ملم، ثم اعبر فوهة السنخ المفتوحة وادخل من السطح الداخلي للثة اللسانية واخرج للخارج.',
        clinicalTip: 'امسك حافة اللثة بلطف بأدسون فورسبس لتجنب انزلاق الإبرة.',
        dangerZoneWarning: 'تجنب سحب الخيط بقوة قد تؤدي لتمزيق الحليمة اللثوية الهشة.',
        visualDetail: 'Buccal entry crossing diagonally to lingual flap',
      },
      {
        stepNumber: 2,
        title: 'العودة بالتقاطع القطري الثاني (Diagonal Cross)',
        instruction: 'اعد توجيه الإبرة وادخل مجدداً من السطح الخارجي للثة الدهليزية في النقطة المجاورة واعبر بشكل متقاطع قطري نحو اللسانية لتشكل مساراً متقاطعاً على شكل "X" أو "8" فوق السنخ.',
        clinicalTip: 'يشكل التقاطع شبكة أمان عريضة تحبس إسفنجة التخثر (Gelatamp / Collagen) داخل العظم بإحكام.',
        dangerZoneWarning: 'تأكد من وضع الإسفنج المرقئ داخل السنخ قبل إحكام التقاطع الثاني.',
        visualDetail: 'Diagonal crossing forming an "X" or "8" pattern over socket',
      },
      {
        stepNumber: 3,
        title: 'إحكام العقدة وتأمين الخثرة',
        instruction: 'اربط عقدة الجراح المزدوجة على السطح الدهليزي فوق اللثة الملتصقة، واضبط الشد بحيث تثبت شبكة الخيوط الخثرة دون غرس العقدة في الجرح.',
        clinicalTip: 'يعطي هذا التكنيك راحة فورية للمريض ويمنع حدوث السنخ الجاف (Dry Socket) بنسبة كبيرة.',
        dangerZoneWarning: 'احذر من الشد الزائد الذي قد يؤدي لقص اللثة بين السنية.',
        visualDetail: 'Stable crossed figure-8 retention over socket orifice',
      },
    ],
  },
];

export function getClinicalSkills(): SkillItem[] {
  let list = INITIAL_CLINICAL_SKILLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    } else {
      // Check for v1 data migration if available
      const oldRaw = localStorage.getItem('dental_clinical_skills_v1');
      if (oldRaw) {
        try {
          const oldParsed = JSON.parse(oldRaw);
          if (Array.isArray(oldParsed)) {
            const customItems = oldParsed.filter((item: SkillItem) => !item.isSystem);
            if (customItems.length > 0) {
              list = [...customItems, ...INITIAL_CLINICAL_SKILLS];
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error('Failed to load clinical skills from localStorage', err);
  }

  // Ensure all skills are populated with high-res real clinical intraoral photos
  return list.map((item) => {
    const primaryPhotoUrl = item.primaryPhotoUrl || getDefaultPrimaryPhotoForSkill(item.diagramType);
    const clinicalPhotos =
      item.clinicalPhotos && item.clinicalPhotos.length > 0
        ? item.clinicalPhotos
        : getDefaultPhotosForSkill(item.diagramType, item.id);
    return {
      ...item,
      primaryPhotoUrl,
      clinicalPhotos,
    };
  });
}

export function replaceSkillPhoto(skillId: string, photoIndex: number, newPhotoUrl: string): SkillItem[] {
  const current = getClinicalSkills();
  const updated = current.map((item) => {
    if (item.id === skillId) {
      const photos =
        item.clinicalPhotos && item.clinicalPhotos.length > 0
          ? [...item.clinicalPhotos]
          : getDefaultPhotosForSkill(item.diagramType, item.id);

      if (photos[photoIndex]) {
        photos[photoIndex] = {
          ...photos[photoIndex],
          url: newPhotoUrl,
        };
      } else {
        photos.push({
          id: `photo-custom-${Date.now()}`,
          url: newPhotoUrl,
          title: 'صورة سريرية حقيقية مرفوعة من الطبيب المشرف',
          caption: 'تم استبدال الصورة بنجاح بواسطة المشرف وتوثيقها في النظام السريري.',
          cameraAngle: 'رؤية سريرية مباشرة 1:1',
          magnification: 'ماكرو سريري عالي الدقة',
        });
      }

      return {
        ...item,
        primaryPhotoUrl: photoIndex === 0 ? newPhotoUrl : (item.primaryPhotoUrl || newPhotoUrl),
        clinicalPhotos: photos,
      };
    }
    return item;
  });
  saveClinicalSkills(updated);
  return updated;
}

export function saveClinicalSkills(skills: SkillItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
  } catch (err) {
    console.error('Failed to save clinical skills to localStorage', err);
  }
}

export function addClinicalSkill(skill: Omit<SkillItem, 'id' | 'isSystem' | 'dateAdded'>): SkillItem[] {
  const current = getClinicalSkills();
  const newSkill: SkillItem = {
    ...skill,
    id: `skill-custom-${Date.now()}`,
    isSystem: false,
    dateAdded: new Date().toISOString().split('T')[0],
  };
  const updated = [newSkill, ...current];
  saveClinicalSkills(updated);
  return updated;
}

export function updateClinicalSkill(id: string, updates: Partial<SkillItem>): SkillItem[] {
  const current = getClinicalSkills();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveClinicalSkills(updated);
  return updated;
}

export function toggleSkillVisibility(id: string): SkillItem[] {
  const current = getClinicalSkills();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, isVisible: !item.isVisible };
    }
    return item;
  });
  saveClinicalSkills(updated);
  return updated;
}

export function deleteClinicalSkill(id: string): SkillItem[] {
  const current = getClinicalSkills();
  const updated = current.filter((item) => item.id !== id);
  saveClinicalSkills(updated);
  return updated;
}

export function resetClinicalSkillsToDefault(): SkillItem[] {
  saveClinicalSkills(INITIAL_CLINICAL_SKILLS);
  return INITIAL_CLINICAL_SKILLS;
}

export const CLINICAL_SKILLS_LIST = INITIAL_CLINICAL_SKILLS;
