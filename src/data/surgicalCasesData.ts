import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';

export interface SurgicalCaseImage {
  id: string;
  url: string;
  caption: string;
  stage: 'pre-op' | 'incision_flap' | 'bone_removal' | 'tooth_sectioning' | 'suturing' | 'post-op' | 'prep';
}

export interface SurgicalCaseStep {
  stepNumber: number;
  title: string;
  description: string;
  clinicalTips?: string;
}

export interface SurgicalCase {
  id: string;
  title: string;
  category: 'extraction' | 'apicoectomy' | 'sinus_lift' | 'implant' | 'flap_perio' | 'biopsy' | 'other';
  categoryLabel: string;
  toothOrRegion: string;
  patientAgeGender?: string;
  difficulty: 'بسيط' | 'متوسط' | 'متقدم' | 'معقد جراحياً';
  dateAdded: string;
  summary: string;
  preOpDiagnosis: string;
  surgicalSteps: SurgicalCaseStep[];
  clinicalTakeaways: string[];
  complicationsToAvoid: string[];
  instrumentation: string[];
  images: SurgicalCaseImage[];
  isCustom?: boolean;
  author: string;
  isHidden?: boolean;
  isVisible?: boolean;
}

export const SURGICAL_CATEGORIES: { id: SurgicalCase['category']; label: string }[] = [
  { id: 'extraction', label: 'خلع جراحي وأضراس عقل' },
  { id: 'apicoectomy', label: 'قطع ذروة وجراحة لبية' },
  { id: 'implant', label: 'زراعة الأسنان الجراحية' },
  { id: 'sinus_lift', label: 'رفع الجيب الفكي' },
  { id: 'flap_perio', label: 'شرائح لثوية وتطويل تاج' },
  { id: 'biopsy', label: 'خزعات وآفات فموية' },
  { id: 'other', label: 'إجراءات جراحية عامة' },
];

export const INITIAL_SURGICAL_CASES: SurgicalCase[] = [
  {
    id: 'surg-case-1',
    title: 'خلع جراحي لضرس عقل سفلي مطمور أفقياً بالقرب من القناة السنخية السفلية',
    category: 'extraction',
    categoryLabel: 'خلع جراحي وأضراس عقل',
    toothOrRegion: 'طاحن ثالث سفلي أيسر (#38 Lower 3rd Molar - Pell & Gregory Class II Position B Horizontal)',
    patientAgeGender: '23 سنة / أنثى',
    difficulty: 'معقد جراحياً',
    dateAdded: '2026-09-20',
    author: 'د. حياه نافع فجر',
    summary: 'حالة خلع جراحي دقيقة لضرس عقل مطمور أفقياً بالكامل مع انحشار تحت تاج السن المجاور #37 وقربه المباشر من العصب السنخي السفلي (IAN). تم استخدام شريحة مثلثة مع حفر ميزاب عظمي محافظ وتجزيء التاج والجذور لتفادي أي ضغط على العصب.',
    preOpDiagnosis: 'نوبات متكررة من التهاب حول التاج (Pericoronitis) مع امتصاص ارتشافي في السطح البعيد لتاج السن المجاور #37 بسبب الانحشار الأفقي.',
    instrumentation: [
      'مشرط جراحي شفرة رقم 15 (Scalpel Blade #15)',
      'رافع سمحاق Periosteal Elevator (Molt #9)',
      'قبضة جراحية زاوية مستقيمة مع تبريد مستمر بمحلول ملحي معقم (Saline Cooling)',
      'سنابل شق جراحية Fissure Bur #702 & Round Bur #8',
      'روافع مستقيمة ومجنحة (Coupland & Warwick James Elevators)',
      'مكشطة تجويف سني (Lucas Bone Curette)',
      'حامل إبرة جراحي وخيط حرير 3-0 مع إبرة مقطعية مثلثة عكسية',
    ],
    surgicalSteps: [
      {
        stepNumber: 1,
        title: 'التخدير الموضعي وتصميم الشريحة (Incision & Flap Design)',
        description: 'تخدير العصب السنخي السفلي والعصب اللساني متبوعاً بتخدير موضعي بالارتشاح مع مضيق أوعية للأوعية الدموية. عمل شق حفافي Sulcular حول السن #37 يمتد على الحافة الصاعدة مع شق إرخائي دهليزي مائل (Anterolateral Releasing Incision) دون تجاوز الخط المخاطي اللثوي.',
        clinicalTips: 'تجنب توجيه الشق نحو الجانب اللساني مطلقاً لحماية العصب اللساني (Lingual Nerve) الذي قد يتوضع أحياناً على حافة العظم.',
      },
      {
        stepNumber: 2,
        title: 'رفع الشريحة وكشف العظم (Mucoperiosteal Flap Elevation)',
        description: 'رفع الشريحة المخاطية السمحاقية بسماكة كاملة (Full Thickness Flap) وتثبيت المبعد السمحاقي بإحكام على العظم السليم مع الحفاظ على الرؤية المباشرة للتاج المحشور.',
        clinicalTips: 'تثبيت المبعد بلطف وبدون ضغط متكرر يمنع حدوث تورم شديد ورضوض للأنسجة الرخوة بعد الجراحة.',
      },
      {
        stepNumber: 3,
        title: 'الميزاب العظمي الدهليزي (Bone Troughing & Guttering)',
        description: 'إزالة العظم الدهليزي والبعيد المحيط بالتاج فقط لإنشاء نقطة استناد للرافعة مع الحفاظ على صفيحة العظم اللسانية وتجنب ملامسة جذور السن #37.',
        clinicalTips: 'التبريد الغزير بالمصل الملحي المعقم يمنع التنخر الحراري للعظم السنخي ومضاعفات التهاب السنخ الجاف (Dry Socket).',
      },
      {
        stepNumber: 4,
        title: 'فصل التاج وتجزيء الجذور (Tooth Sectioning / Odontotomy)',
        description: 'فصل تاج ضرس العقل بزاوية 45 درجة عن عنق السن حتى 3/4 القطر، ثم إكمال الكسر بلفافة خفيفة بالرافعة المستقيمة، واستخراج التاج ثم فصل الجذور المتفرقة كلاً على حدة.',
        clinicalTips: 'لا تغرس السنبلة بعمق كامل نحو الجانب اللساني أو قاع السنخ لتجنب إصابة الجدار العصبي أو ثقب الصفيحة اللسانية.',
      },
      {
        stepNumber: 5,
        title: 'تنظيف السنخ والخياطة الجراحية (Debridement & Suturing)',
        description: 'تنظيف الجيب السنخي وإزالة الكيس الجريبي المتبقي، تنعيم الحواف العظمية الحادة بـ Bone File، غسيل وفير بمحلول ملحي معقم، وخياطة الشريحة بغرز مفردة متقطعة (Interrupted Sutures) بخيط حرير 3-0.',
        clinicalTips: 'الغرزة الأولى توضع دائماً خلف السن المجاور لإعادة تثبيت الحليمة اللثوية في موقعها التشريحي الصحيح لمنع تشكل جيوب لثوية.',
      },
    ],
    clinicalTakeaways: [
      'التجزيء الدقيق للسن المطمور (Sectioning) يوفر الوقت ويقلل كمية العظم المزال بنسبة تزيد عن 60%.',
      'دائماً تحقق من خلو السنخ من أي بقايا جريبية أو شظايا ميناء قبل إغلاق الشريحة.',
      'التبريد بالمصل الملحي المعقم ضرورة مطلقة لمنع التهاب السنخ العظمي الرضي.',
      'إعطاء تعليمات واضحة للمريض: كمادات باردة أول 24 ساعة، الامتناع عن البصق والمضمضة العنيفة واستخدام قشة العصير.',
    ],
    complicationsToAvoid: [
      'تجنب الدفع القوي بالرافعة للأعلى أو للخلف لتفادي انزلاق جذر السن نحو الفراغ تحت الفك السفلي (Submandibular Space).',
      'تجنب إدخال السنبلة عميقاً في الجانب اللساني لتفادي إصابة العصب اللساني الدائمة.',
      'حماية العصب السنخي السفلي بعدم استخدام أدوات حادة في قاع السنخ في حال قربه الشعاعي.',
    ],
    images: [
      {
        id: 'surg-1-img-1',
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
        caption: 'صورة الفحص السريري والتجهيز الجراحي المعقم للخلع المعقد',
        stage: 'pre-op',
      },
      {
        id: 'surg-1-img-2',
        url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
        caption: 'الأدوات الجراحية المعقمة، شفرات القطع، وروافع الخلع الجراحية المخصصة',
        stage: 'incision_flap',
      },
      {
        id: 'surg-1-img-3',
        url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
        caption: 'الخياطة الجراحية وإعادة توضيع الحليمة اللثوية بخيوط حريرية متقطعة',
        stage: 'suturing',
      },
    ],
  },
  {
    id: 'surg-case-2',
    title: 'قطع ذروة الجذر مع الحشو التراجعي بمادة الـ MTA للثنية العلوية (Apicoectomy & Retrograde MTA)',
    category: 'apicoectomy',
    categoryLabel: 'قطع ذروة وجراحة لبية',
    toothOrRegion: 'قاطع مركزي علوي أيمن (#11 Upper Central Incisor)',
    patientAgeGender: '28 سنة / ذكر',
    difficulty: 'متقدم',
    dateAdded: '2026-09-22',
    author: 'د. حياه نافع فجر',
    summary: 'حالة جراحة ذروية مجهرية لسن معالج لبياً سابقاً مع وجود وتد تاجي مصبوب وآفة ذروية مزمنة مستمرة مع ناسور قيحي بعد فشل إعادة المعالجة غير الجراحية.',
    preOpDiagnosis: 'التهاب دواعم السن الذروي القيحي المزمن (Chronic Periapical Abscess with Sinus Tract) مع وتد مصبوب يمنع إعادة المعالجة التقليدية.',
    instrumentation: [
      'شفرة جراحية رقيقة رقم 15C',
      'مسبار مجهري دقيق ومرايا ذروية صغيرة (Micromirrors)',
      'رؤوس التراسونيك جراحية بالموجات فوق الصوتية (Ultrasonic Retro-tips)',
      'مكشطة كيوريت ذروية دقيقة',
      'حامل ومكبس حشو الـ MTA الدقيق (MTA Gun/Carrier & Pluggers)',
      'مادة MTA بيضاء عالية النقاء (White ProRoot MTA)',
      'خيط نايلون أو بولي بروبيلين أحادي الخيط 5-0 (5-0 Monofilament)',
    ],
    surgicalSteps: [
      {
        stepNumber: 1,
        title: 'شريحة شبه منحرفة تحت الحفافية (Luebke-Ochsenbein Flap)',
        description: 'عمل شق شبه منحرف يحافظ على الحافة اللثوية الحرة والحليمات لتفادي انحسار اللثة في المنطقة التجميلية مع شقين مائلين متباعدين.',
        clinicalTips: 'الحفاظ على ما لا يقل عن 2-3 ملم من اللثة الملتصقة بين الشق وحافة اللثة لتأمين التروية الدموية الممتازة.',
      },
      {
        stepNumber: 2,
        title: 'النافذة العظمية واستئصال الآفة (Osteotomy & Curettage)',
        description: 'فتح نافذة عظمية صغيرة بواسطة سنبلة كروية مع تبريد مستمر مباشرة فوق الذروة واستئصال الكيس أو النسيج الحبيبي كاملاً وإرساله للتشريح المرضي.',
        clinicalTips: 'التنظيف الكامل لجدران العظم المحيطة يمنع نكس الآفة الميكروبية.',
      },
      {
        stepNumber: 3,
        title: 'قطع 3 ملم من ذروة الجذر (3mm Apical Resection)',
        description: 'قطع 3 ملم عمودياً بزاوية 90 درجة (Bevel=0) لاستئصال 98% من التفرعات القنوية الجانبية والدلتا الذروية.',
        clinicalTips: 'قطع الذروة بزاوية قائمة بدون شطف يحافظ على طول الجذر ويقلل عدد الأنابيب العاجية المكشوفة.',
      },
      {
        stepNumber: 4,
        title: 'التحضير التراجعي بالموجات فوق الصوتية (Ultrasonic Retro-prep)',
        description: 'حفر وتوسيع 3 ملم داخل القناة الذروية باستخدام رأس الألتراسونيك بتبريد مستمر، وتجفيف القناة بأقماع ورقية معقمة.',
        clinicalTips: 'الألتراسونيك ينظف القناة في محورها المركزي تماماً دون خطر عمل انثقاب جانبي.',
      },
      {
        stepNumber: 5,
        title: 'تكديس الـ MTA والإغلاق (MTA Retro-filling & Suture)',
        description: 'وضع مادة MTA وتكثيفها بضغط محكم، مسح الفائض بقطنة رطبة، فحص العزل بالإضاءة المركزة، وإغلاق الشريحة بخياطة دقيقة 5-0.',
        clinicalTips: 'الـ MTA يتميز بتوافقه الحيوي الفائق وتحريضه لإعادة تشكل الملاط والعظم السنخي المحيط بالذروة.',
      },
    ],
    clinicalTakeaways: [
      'قطع 3 ملم بزاوية 0 درجة يضمن التخلص من معظم التفرعات الذروية المعقدة.',
      'الـ MTA هي المادة المعيارية الذهبية لختم القناة التراجعي نظراً لقدرتها على التصلب في البيئة الرطبة.',
      'الخياطة الدقيقة أحادية الخيط 5-0 تضمن شفاءً تجميلياً فائقاً دون أي ندبات في اللثة الأمامية.',
    ],
    complicationsToAvoid: [
      'تجنب الشطف المائل للذروة لأنه يكشف قنوات جانبية إضافية ويضعف ثبات السن.',
      'تجنب الضغط الزائد بالألتراسونيك لتفادي حدوث شروخ ميكروية في جذر السن.',
    ],
    images: [
      {
        id: 'surg-2-img-1',
        url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80',
        caption: 'التحضير الذروي المجهري وتنظيف الآفة الذروية في الفك العلوي',
        stage: 'prep',
      },
      {
        id: 'surg-2-img-2',
        url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
        caption: 'تطبيق الحشو التراجعي بمادة MTA البيضاء والختم الحيوي المحكم',
        stage: 'post-op',
      },
    ],
  },
  {
    id: 'surg-case-3',
    title: 'الزرع الفوري مع الطعم العظمي والغشاء الكولاجيني في المنطقة التجميلية الأمامية',
    category: 'implant',
    categoryLabel: 'زراعة الأسنان الجراحية',
    toothOrRegion: 'ضاحك علوي أول (#14 / #24 Upper Premolar)',
    patientAgeGender: '31 سنة / أنثى',
    difficulty: 'متقدم',
    dateAdded: '2026-09-24',
    author: 'د. حياه نافع فجر',
    summary: 'خلع رضي محافظ جداً (Atraumatic Extraction) بدون رفع شريحة (Flapless) لضاحك علوي مكسور تحت اللثة مع غرس فوري لزرعة تيتانيوم بقطر 3.75 ملم وثبات أولي 40 N.cm، وتعبئة الفراغ العظمي (Jumping Distance) بطعم عظمي خيفي وغشاء كولاجيني.',
    preOpDiagnosis: 'كسر تاجي جذري عميق غير قابل للترميم المحافظ نتيجة رضح إطباقي.',
    instrumentation: [
      'أداة فصل أربطة دواعم السن (Periotome / Benex Extractor)',
      'طقم سنابل حفر الزرعات القياسية مع تبريد سالين',
      'جهاز عزم إدخال الزرعات (Torque Ratchet / Motor)',
      'زرعة تيتانيوم مخروطية مع سطح معدل حيوياً',
      'طعم عظمي حبيبي (Bio-Oss / Xenograft 0.25-1mm)',
      'غشاء كولاجيني قابل للامتصاص (Bio-Gide Collagen Membrane)',
      'دعامة شفاء مخصصة (Custom Healing Abutment)',
    ],
    surgicalSteps: [
      {
        stepNumber: 1,
        title: 'الخلع الرضي المحافظ (Flapless Atraumatic Extraction)',
        description: 'قطع أربطة السن بحذر بواسطة البريوتوم دون تحريك الصفائح العظمية، والتأكد من سلامة الصفيحة الدهليزية العظمية بالكامل.',
        clinicalTips: 'سلامة الصفيحة الدهليزية (Labial Bone Plate) هي المفتاح الحاسم لنجاح وجمالية الزرع الفوري.',
      },
      {
        stepNumber: 2,
        title: 'الحفر والتوجيه الحنكي (Palatal Trajectory Drilling)',
        description: 'بدء الحفر على الجدار الحنكي للسنخ لتجنب الصفيحة الدهليزية الرقيقة وضمان مسار إطباقي مثالي لبرغي التعويض.',
        clinicalTips: 'التوجه نحو العظم الحنكي يضمن مسافة قفز (Jumping Gap) كافية لا تقل عن 2 ملم بين الزرعة والعظم الدهليزي.',
      },
      {
        stepNumber: 3,
        title: 'إدخال الزرعة وتحقيق الثبات الأولي (Implant Placement & ISQ)',
        description: 'إدخال الزرعة بعمق 3-4 ملم تحت الحافة الحرة للثة مع عزم إدخال 40 N.cm لضمان الاندماج العظمي الآمن.',
        clinicalTips: 'الثبات الأولي الذي يتجاوز 35 نيوتن يتيح وضع دعامة تشكيل اللثة فورا.',
      },
      {
        stepNumber: 4,
        title: 'تطعيم المسافة الفاصلة (Jumping Distance Grafting)',
        description: 'تكديس حبيبات العظم الخيفي برفق في الفراغ الدهليزي للحفاظ على انتفاخ الحافة السنخية ودعم الأنسجة الرخوة مستقبلاً.',
        clinicalTips: 'تجنب ضغط الطعم بقوة مفرطة للحفاظ على الأوعية الدموية وتخلل الخلايا العظمية.',
      },
      {
        stepNumber: 5,
        title: 'دعامة الشفاء والإغلاق (Custom Abutment)',
        description: 'تثبيت دعامة شفاء تدعم الحليمة اللثوية وتحافظ على الشكل الطبيعي لبروز السن (Emergence Profile) بدون أي شد جراحي.',
        clinicalTips: 'استخدام دعامة مخصصة يقلل الحاجة لجلسات تشكيل اللثة اللاحقة بنسبة كبيرة.',
      },
    ],
    clinicalTakeaways: [
      'الزرع الفوري يتطلب التزاماً صارماً بمبدأ الحفر باتجاه العظم الحنكي لتأمين مسافة كافية للطعم الدهليزي.',
      'الحفاظ على الصفيحة العظمية الدهليزية يمنع انحسار اللثة التجميلي على المدى البعيد.',
      'تعبئة الفراغ العظمي بجزيئات العظم بطيئة الامتصاص تحافظ على البعد الدهليزي اللساني.',
    ],
    complicationsToAvoid: [
      'تجنب زرع السن باتجاه الدهليزي لأن ذلك يؤدي إلى انحسار لثوي وتراجع عظمي مبكر وظهور معدن الزرعة.',
      'تجنب إجراء الزرع الفوري في حال وجود صديد حاد نشط في السنخ.',
    ],
    images: [
      {
        id: 'surg-3-img-1',
        url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
        caption: 'فحص موقع الزرعة الفورية وتجهيز الفراغ العظمي',
        stage: 'incision_flap',
      },
      {
        id: 'surg-3-img-2',
        url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80',
        caption: 'إدخال الزرعة التيتانيوم وتطعيم الفراغ العظمي بجزيئات العظم الحيوي',
        stage: 'post-op',
      },
    ],
  },
];

const SURGICAL_STORAGE_KEY = 'dental_surgical_cases_store_v1';
const CONFIG_COLLECTION = 'app_config';
const SURGICAL_CASES_DOC = 'surgical_cases_cloud_store';

export function getSurgicalCases(): SurgicalCase[] {
  try {
    const raw = localStorage.getItem(SURGICAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_SURGICAL_CASES;
}

export function saveSurgicalCases(cases: SurgicalCase[]): void {
  try {
    localStorage.setItem(SURGICAL_STORAGE_KEY, JSON.stringify(cases));
    saveSurgicalCasesToCloud(cases).catch((err) => {
      console.warn('[SurgicalCases] Cloud sync error:', err);
    });
  } catch {}
}

/**
 * Saves all surgical cases to Firestore cloud to maintain persistence
 * across all subscriber browsers.
 */
export async function saveSurgicalCasesToCloud(cases: SurgicalCase[]): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, SURGICAL_CASES_DOC);
    await setDoc(
      docRef,
      {
        cases,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[SurgicalCases] Failed to save to Firestore cloud:', error);
  }
}

/**
 * Subscribes to real-time surgical cases changes in Firestore.
 */
export function subscribeToSurgicalCasesCloud(
  onUpdate: (cases: SurgicalCase[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, SURGICAL_CASES_DOC);

  let isFirst = true;
  const unsubscribe = onSnapshot(
    docRef,
    async (docSnap) => {
      if (!docSnap.exists() && isFirst) {
        isFirst = false;
        await saveSurgicalCasesToCloud(INITIAL_SURGICAL_CASES);
        onUpdate(INITIAL_SURGICAL_CASES);
        return;
      }
      isFirst = false;

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.cases) && data.cases.length > 0) {
          try {
            localStorage.setItem(SURGICAL_STORAGE_KEY, JSON.stringify(data.cases));
          } catch {}
          onUpdate(data.cases);
          return;
        }
      }
      onUpdate(getSurgicalCases());
    },
    (err) => {
      console.warn('[SurgicalCases] Firestore onSnapshot error:', err);
      onUpdate(getSurgicalCases());
    }
  );

  return unsubscribe;
}

export async function toggleSurgicalCaseVisibilityInCloud(id: string, currentHidden: boolean): Promise<void> {
  const current = getSurgicalCases();
  const updated = current.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        isHidden: !currentHidden,
        isVisible: currentHidden,
      };
    }
    return c;
  });
  saveSurgicalCases(updated);
}

export function addSurgicalCase(newCase: Omit<SurgicalCase, 'id' | 'dateAdded'>): SurgicalCase {
  const current = getSurgicalCases();
  const created: SurgicalCase = {
    ...newCase,
    id: 'surg-case-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    dateAdded: new Date().toISOString().split('T')[0],
    isCustom: true,
  };
  const updated = [created, ...current];
  saveSurgicalCases(updated);
  return created;
}

export function updateSurgicalCase(id: string, updates: Partial<SurgicalCase>): SurgicalCase[] {
  const current = getSurgicalCases();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveSurgicalCases(updated);
  return updated;
}

export function deleteSurgicalCase(id: string): SurgicalCase[] {
  const current = getSurgicalCases();
  const filtered = current.filter((c) => c.id !== id);
  saveSurgicalCases(filtered);
  return filtered;
}

export function resetSurgicalCases(): SurgicalCase[] {
  saveSurgicalCases(INITIAL_SURGICAL_CASES);
  return INITIAL_SURGICAL_CASES;
}
