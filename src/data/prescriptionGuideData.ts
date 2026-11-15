/**
 * Dental Clinical Drug Guide (دليل وصف الأدوية السريري)
 * Comprehensive Evidence-Based Dental Pharmacotherapy Catalog
 * Organized for dental students, interns, and clinical practitioners.
 * 
 * Educational & Clinical Reference Notice:
 * هذا الدليل مخصص للأغراض التعليمية والاسترشادية السريرية لطلاب وأطباء الأسنان،
 * ولا يعتبر بديلاً عن التشخيص الطبي السريري الشامل أو استشارة الطبيب البشري المختص.
 */

export type DrugStatus = 'draft' | 'under_clinical_review' | 'verified' | 'published';
export type DrugWarningLevel = 'high' | 'caution' | 'safe' | 'info';
export type PrescriptionCategory = string;

export interface ClinicalPharmacistReview {
  status: 'pending' | 'under_review' | 'verified';
  pharmacistName?: string;
  pharmacistTitle?: string;
  notes?: string;
  reviewedAt?: string;
}

export interface PrescriptionDrug {
  id: string;
  category: string; // matches DrugCategoryItem.id
  nameEn: string;
  nameAr: string;
  scientificName?: string;
  brandNames?: string;
  activeIngredient?: string;
  indication: string;
  indicationEn?: string;
  clinicalConsiderations: string; // Dental implications, gingival effects, bleeding, etc.
  clinicalConsiderationsEn?: string;
  drugInteractions: string; // Interactions with epinephrine, NSAIDs, macrolides, etc.
  drugInteractionsEn?: string;
  standardDosage: string; // Adult dosage
  standardDosageEn?: string;
  pediatricDosage?: string; // Pediatric dosage if applicable
  pediatricDosageEn?: string;
  allergyAlerts: string;
  allergyAlertsEn?: string;
  pregnancySafety: string; // FDA Category (A, B, C, D, X) & lactation
  pregnancySafetyEn?: string;
  adminNotes?: string;
  status: DrugStatus;
  warningLevel: DrugWarningLevel;
  isFree?: boolean; // Access control: free vs subscription-required
  isHidden?: boolean; // Visibility control: true = hidden from subscribers
  clinicalReview?: ClinicalPharmacistReview;
  createdAt: string;
  updatedAt: string;
}

export interface DrugCategoryItem {
  id: string;
  titleAr: string;
  titleEn: string;
  iconName: string;
  descriptionAr: string;
  colorClass: string;
  isCustom?: boolean;
  isHidden?: boolean;
  isFree?: boolean;
  order?: number;
}

export interface PrescriptionGuideConfig {
  isGuidePublic: boolean; // Access control: true = free for public, false = subscription required
  isGuideHidden?: boolean; // Visibility control: true = hidden for subscribers
  categoriesConfig?: Record<string, {
    isHidden?: boolean;
    isFree?: boolean;
  }>;
  customCategories?: DrugCategoryItem[];
  lastUpdatedBy?: string;
  updatedAt?: string;
}

/**
 * Standard Curated Scientific Categories for Dentistry
 */
export const DEFAULT_PRESCRIPTION_CATEGORIES: DrugCategoryItem[] = [
  {
    id: 'anemia_bleeding_disorders',
    titleAr: 'أدوية فقر الدم واضطرابات الدم والنزف',
    titleEn: 'Anemia, Blood Disorders & Hemophilia',
    iconName: 'Droplets',
    descriptionAr: 'أدوية الحديد، B12، بروتوكولات الهيموفيليا (Factor VIII/IX)، حمض الترانيكساميك، واحتياطات النزف قبل القلع والجراحة',
    colorClass: 'red',
    order: 1,
    isFree: true,
  },
  {
    id: 'anticoagulants_antiplatelets',
    titleAr: 'أدوية سيولة ومميعات الدم ومضادات الصفيحات',
    titleEn: 'Anticoagulants & Antiplatelets',
    iconName: 'ShieldAlert',
    descriptionAr: 'الأسبرين، بلافيكس (Clopidogrel)، الوارفارين، ومميعات NOACs مع إرشادات تجنب النزف وتدابير القلع الجراحي',
    colorClass: 'rose',
    order: 2,
    isFree: false,
  },
  {
    id: 'antibiotics',
    titleAr: 'المضادات الحيوية السنية ووقاية القلب (AHA)',
    titleEn: 'Antibiotics & Endocarditis Prophylaxis',
    iconName: 'ShieldCheck',
    descriptionAr: 'خط البداية الأول، بدائل حساسية البنسلين، وجرعات الوقاية المعتمدة من التهاب الشغاف الجرثومي (Infective Endocarditis)',
    colorClass: 'teal',
    order: 3,
    isFree: true,
  },
  {
    id: 'sedatives_anxiolytics',
    titleAr: 'أدوية المهدئات وعلاج قلق ورهاب الأسنان',
    titleEn: 'Anxiolytics & Dental Phobia Sedatives',
    iconName: 'Sparkles',
    descriptionAr: 'البنزوديازيبينات (Diazepam, Alprazolam)، مهدئات ما قبل الجلسة، وتداخلاتها مع المخدر الموضعي وتثبيط التنفس',
    colorClass: 'indigo',
    order: 4,
    isFree: true,
  },
  {
    id: 'thyroid_disorders',
    titleAr: 'أدوية الغدة الدرقية ومحاذير التخدير',
    titleEn: 'Thyroid Disorders & Epinephrine Cautions',
    iconName: 'Zap',
    descriptionAr: 'أدوية قصور الغدة (Levothyroxine) وفرط النشاط (Carbimazole) مع التحذير الحاسم من الإبينفرين والعاصفة الدرقية',
    colorClass: 'amber',
    order: 5,
    isFree: false,
  },
  {
    id: 'diabetes',
    titleAr: 'أدوية السكر الشائعة المرتبطة بطب الأسنان',
    titleEn: 'Antidiabetics in Dentistry',
    iconName: 'Activity',
    descriptionAr: 'بروتوكولات التعامل مع مريض السكري، الوقاية من هبوط السكر، ومواعيد الجلسات السريرية',
    colorClass: 'emerald',
    order: 6,
    isFree: true,
  },
  {
    id: 'hypertension_cardiac',
    titleAr: 'أدوية الضغط والقلب',
    titleEn: 'Cardiovascular & Antihypertensives',
    iconName: 'Heart',
    descriptionAr: 'تأثيرات حاصرات قنوات الكالسيوم على اللثة، مضادات التخثر، واستخدام الإبينفرين بأمان',
    colorClass: 'rose',
    order: 7,
    isFree: false,
  },
  {
    id: 'pregnancy_lactation',
    titleAr: 'أدوية الحمل والرضاعة',
    titleEn: 'Pregnancy & Lactation Safety',
    iconName: 'Baby',
    descriptionAr: 'تصنيفات أمان FDA للأدوية، التخدير الموضعي الآمن، ومسكنات الألم المعتمدة للأمهات',
    colorClass: 'amber',
    order: 8,
    isFree: true,
  },
  {
    id: 'contraceptives',
    titleAr: 'أدوية موانع الحمل وتأثيراتها السنية',
    titleEn: 'Oral Contraceptives & Dental Risks',
    iconName: 'ShieldAlert',
    descriptionAr: 'مخاطر السنخ الجاف (Dry Socket) بعد القلع، التهابات اللثة الهرمونية، وتداخلات المضادات',
    colorClass: 'purple',
    order: 9,
    isFree: false,
  },
  {
    id: 'hepatitis',
    titleAr: 'أدوية التهاب الكبد الفيروسي وإرشادات السلامة',
    titleEn: 'Viral Hepatitis Dental Protocols',
    iconName: 'AlertTriangle',
    descriptionAr: 'القصور الكبدي، استقلاب المخدرات الموضعية الأميدية، ومخاطر النزف واختبارات التخثر',
    colorClass: 'orange',
    order: 10,
    isFree: false,
  },
  {
    id: 'analgesics',
    titleAr: 'المسكنات السنية',
    titleEn: 'Dental Analgesics',
    iconName: 'Pill',
    descriptionAr: 'بروتوكولات تسكين الألم الخفيف، المتوسط، والشديد ما بعد الإجراءات اللبية والجراحية',
    colorClass: 'blue',
    order: 11,
    isFree: true,
  },
  {
    id: 'anti_inflammatory',
    titleAr: 'مضادات الالتهاب (NSAIDs & Steroids)',
    titleEn: 'Anti-inflammatory Drugs',
    iconName: 'Sparkles',
    descriptionAr: 'مضادات الالتهاب غير الستيرويدية والكورتيكوستيرويدات للسيطرة على وذمة جراحة الأرحاء',
    colorClass: 'sky',
    order: 12,
    isFree: false,
  },
  {
    id: 'epilepsy',
    titleAr: 'أدوية الصرع والتأثيرات اللثوية',
    titleEn: 'Antiepileptics & Oral Overgrowth',
    iconName: 'Zap',
    descriptionAr: 'تضخم اللثة الناجم عن الفينيتوين، علاج ألم عصب ثلاثي التوائم بالتيجريتول، ومحاذير التخدير',
    colorClass: 'indigo',
    order: 13,
    isFree: false,
  },
  {
    id: 'emergency',
    titleAr: 'أدوية الطوارئ الإنعاشية بالعيادة',
    titleEn: 'Chairside Emergency Drugs',
    iconName: 'AlertOctagon',
    descriptionAr: 'صدمة الحساسية، الربو التحسسي، هبوط السكر، ونوبات الذبحة الصدرية في كرسي الأسنان',
    colorClass: 'red',
    order: 14,
    isFree: true,
  },
];

export const PRESCRIPTION_CATEGORIES = DEFAULT_PRESCRIPTION_CATEGORIES;

/**
 * Initial Curated Scientific Drugs Seed Data
 */
export const DEFAULT_PRESCRIPTION_DRUGS: PrescriptionDrug[] = [
  // =========================================================================
  // 1. ANEMIA, BLOOD DISORDERS & BLEEDING PROTOCOLS (فقر الدم واضطرابات النزف)
  // =========================================================================
  {
    id: 'drug-iron-sulfate',
    category: 'anemia_bleeding_disorders',
    nameEn: 'Ferrous Sulfate 200mg (Iron Supplement)',
    nameAr: 'كبريتات الحديدوز 200 ملغ (علاج فقر الدم بنقص الحديد)',
    scientificName: 'Ferrous Sulfate (Dried, equivalent to ~65mg elemental iron)',
    brandNames: 'Fumafer, Fefol, Ferro-Gradumet, Feroglobin',
    activeIngredient: 'Ferrous Sulfate / Elemental Iron',
    indication: 'علاج والوقاية من فقر الدم بنقص الحديد (Iron Deficiency Anemia)، والتهاب الشفة الزاوي (Angular Cheilitis)، والتهاب اللسان الضموري، وتقرحات الفم المتكررة.',
    indicationEn: 'Treatment and prophylaxis of microcytic hypochromic iron deficiency anemia, atrophic glossitis, and angular stomatitis.',
    clinicalConsiderations: '🦷 اعتبارات طب الأسنان السريرية:\n1. تصبغ الأسنان الخارجي: محاليل وشرابات الحديد السائلة للأطفال والبالغين تصبغ الأسنان باللون الأسود أو البني (Extrinsic staining). انصح المريض بشربها عبر قصبة (Straw) وتفريش الأسنان ومضمضة الفم فوراً.\n2. تأخر التئام الجروح السريرية: نقص الهيموجلوبين يقلل من أكسجة الأنسجة الفموية (Tissue Hypoxia) ويبطئ شفاء النسج الرخوة بعد القلع والعمليات الجراحية.\n3. شحوب الغشاء المخاطي الفموي واللثة واللسان علامة سريرية للأنيميا.\n4. فحص مستوى الهيموجلوبين (Hb): يفضل ألا يقل عن 10 g/dL قبل الجراحات والقلع الجراحي الموسع لتفادي التعب والإغماء في العيادة.',
    clinicalConsiderationsEn: 'Liquid iron formulations cause extrinsic dark staining of enamel; advise straw ingestion and prompt brushing. Anemic tissue hypoxia delays socket epithelization. Check baseline Hb (>10 g/dL recommended before major periodontal/oral surgery).',
    drugInteractions: '• الكالسيوم ومضادات الحموضة ومنتجات الألبان تقلل امتصاص الحديد بنسبة كبيرة (يجب الفصل ساعتين على الأقل).\n• فيتامين C (حمض الأسكوربيك) يعزز امتصاص الحديد.\n• يمنع تناوله بالتزامن مع التتراسيكلين والفلوروكينولونات لتكوين معقدات مخلبية غير قابلة للامتصاص.',
    drugInteractionsEn: 'Antacids, calcium, and dairy products markedly impede iron bioavailability. Stagger administration 2 hours away from tetracyclines and quinolones due to chelation.',
    standardDosage: 'البالغين: قرص واحد (200 ملغ) 2 إلى 3 مرات يومياً قبل الوجبات بساعة أو مع عصير برتقال (أو مع الوجبة الخفيفة عند حدوث غثيان). الأطفال: 3-6 ملغ/كجم/يوم من الحديد الصافي مقسمة على 3 جرعات.',
    standardDosageEn: 'Adults: 200 mg orally tid before meals (or with food if GI upset ensues). Pediatric: 3–6 mg/kg/day elemental iron divided tid.',
    allergyAlerts: '⚠️ اضطرابات هضمية شائعة تشمل الإمساك، الغثيان، والبراز الأسود الداكن (تنبيه المريض أنه عرض طبيعي غير ضار).',
    pregnancySafety: 'الفئة A/B (FDA Category A/B) - آمن تماماً وضروري وموصى به للأمهات الحوامل والمرضعات.',
    pregnancySafetyEn: 'FDA Category A/B: Essential prenatal micronutrient; fully safe during gestation and lactation.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق محاذير تصبغ الأسنان الخارجي وتوصية شرب الدواء عبر قصبة.',
      reviewedAt: '2026-03-15T09:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-vit-b12',
    category: 'anemia_bleeding_disorders',
    nameEn: 'Cyanocobalamin / Vitamin B12 (1000mcg)',
    nameAr: 'فيتامين B12 (سيانوكوبالامين لعلاج فقر الدم الخبيث)',
    scientificName: 'Cyanocobalamin / Hydroxocobalamin',
    brandNames: 'Neurobion, Betolvex, Depo-Hycobal',
    activeIngredient: 'Vitamin B12',
    indication: 'علاج فقر الدم الخبيث والوبيل (Pernicious / Megaloblastic Anemia)، التهاب اللسان الحارق (Hunter’s Glossitis)، والخدر والتنميل الفموي والوجهي.',
    indicationEn: 'Management of pernicious/macrocytic anemia, Hunter’s atrophic glossitis, neuropathic oral dysesthesia, and recurrent aphthous stomatitis.',
    clinicalConsiderations: '🦷 علامة سريرية كلاسيكية في عيادة الأسنان:\n1. لسان هنتر (Hunter’s Glossitis): لسان أملس ناعم أحمر قاني كحبة الفراولة (Beefy red smooth tongue) نتيجة ضمور حليمات اللسان الفيلية والخيطية مع حرقان شديد في الفم.\n2. التنميل والخدر (Paresthesia) في الشفاه واللسان قد يكون العرض الأول لنقص B12 قبل ظهور التغيرات الدموية.\n3. آمن تماماً لجميع الإجراءات الجراحية والقلع السني دون أي مخاطر نزفية.',
    clinicalConsiderationsEn: 'Classic oral manifestation of fiery, painful depapillated erythematous tongue (Hunter glossitis). Perioral paresthesia. Completely safe for all invasive surgical and extraction procedures.',
    drugInteractions: '• الاستخدام طويل الأمد لميتفورمين السكري ومثبطات مضخة البروتون (Omeprazole) يقلل امتصاص B12 المعوي.',
    drugInteractionsEn: 'Prolonged metformin or proton-pump inhibitor (PPI) therapy impairs gastrointestinal B12 absorption.',
    standardDosage: 'الحقن العضلي: 1000 ميكروغرام أسبوعياً لمدة 4 أسابيع ثم جرعة صيانة شهرية (أو أقراص فموية 1000 ميكروغرام يومياً).',
    standardDosageEn: '1000 mcg IM weekly for 4 weeks, followed by monthly maintenance injections (or 1000 mcg sublingual/oral daily).',
    allergyAlerts: '✅ جيد التحمل ونادر الحساسية للغاية.',
    pregnancySafety: 'الفئة A/C (FDA Category A) - آمن وضروري لصحة الجنين والأم.',
    pregnancySafetyEn: 'FDA Category A: Essential physiologic vitamin; fully compatible with pregnancy and breastfeeding.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم تدقيق تشخيص لسان هنتر الاحمر الأملس كعلامة فارقة في فحص الفم السريري.',
      reviewedAt: '2026-03-15T11:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-hemo-tranexamic',
    category: 'anemia_bleeding_disorders',
    nameEn: 'Hemophilia & Coagulation Protocols (Factor Replacement & Tranexamic Acid 500mg)',
    nameAr: 'بروتوكولات الهيموفيليا واضطرابات التخثر وحمض الترانيكساميك',
    scientificName: 'Factor VIII / Factor IX Concentrate & Tranexamic Acid (Antifibrinolytic)',
    brandNames: 'Cyklokapron, Transamin, Advate, BeneFIX',
    activeIngredient: 'Tranexamic Acid / Coagulation Factor Concentrates',
    indication: 'التدبير الوقائي والجراحي لمرضى نزف الدم الوراثي (الهيموفيليا A و B) وداء فون فيليبراند (vWD) قبل قلع الأسنان والجراحة الفموية.',
    indicationEn: 'Hemostatic stabilization and antifibrinolytic preservation in congenital coagulopathies (Hemophilia A/B, von Willebrand Disease) undergoing invasive oral surgery.',
    clinicalConsiderations: '🩸 بروتوكول جراحة الفم الإلزامي لمرضى اضطرابات النزف والهيموفيليا:\n1. ⚠️ استشارة وتنسيق إلزامي مع أخصائي أمراض الدم (Hematologist): يجب رفع مستوى العامل التخثري (Factor VIII or IX level) إلى 50% - 75% عبر الحقن الوريدي قبل ساعة واحدة من إجراء القلع أو الجراحة.\n2. 🚫 تحذير حرج قاطع بخصوص التخدير الموضعي:\nيمنع منعاً باتاً إعطاء حقنة تخدير العصب السنخي السفلي التقليدية (Inferior Alveolar Nerve Block - IANB) لمريض الهيموفيليا قبل تعويض العامل التخثري! الحقنة قد تسبب ورم دموي عميق خانق في الحيز الجناحي الفكي (Pterygomandibular Hematoma) يؤدي لانسداد مجرى الهواء والاختناق والوفاة.\n• البدائل الآمنة: التخدير الارتشاحي الموضعي (Infiltration using Articaine) أو الحقن داخل الرباط السني (Intraligamentary / PDL injection).\n3. وسائل التخثر الموضعية الإلزامية:\n• خياطة الجرح بدقة متناهية (Silk or Vicryl figure-of-eight).\n• وضع مادة سليلوزية قابضة ومخثرة داخل السنخ (Surgicel / Gelfoam).\n• غسول فموي بحمض الترانيكساميك 5% (مضمضة 10 مل لمدة دقيقتين ثم بصقها 4 مرات يومياً لمدة 7 أيام). لا تبلع المحلول.\n4. 🚫 يمنع قطعياً وصف الأسبرين أو الـ NSAIDs (إيبوبروفين) كمسكنات لتفادي تفاقم النزف الحاد. المسكن الآمن الوحيد هو الباراسيتامول.',
    clinicalConsiderationsEn: 'Mandatory hematologist clearance to elevate factor levels to 50–75% pre-op. Strictly avoid traditional IANB block injections prior to factor infusion due to fatal airway-compromising pterygomandibular hematoma risk (use infiltration or intraligamentary injections). Apply local tranexamic acid 5% mouthwash qid for 7 days. Strictly avoid NSAIDs/Aspirin; use paracetamol.',
    drugInteractions: '• يمنع تماماً مع الأسبرين ومضادات الالتهاب غير الستيرويدية (NSAIDs) ومضادات التخثر ومضادات الصفيحات.\n• لا يؤخذ حمض الترانيكساميك مع موانع الحمل الفموية الجهازية لتفادي التخثر الخثاري إلا تحت إشراف متخصص.',
    drugInteractionsEn: 'Absolute contraindication to systemic NSAIDs/Aspirin. Caution with concomitant estrogen therapy due to elevated thromboembolic potential.',
    standardDosage: 'حمض الترانيكساميك فموياً: 500 ملغ إلى 1000 ملغ كل 8 ساعات لمدة 5-7 أيام بعد الجراحة، مع غسول فموي موضعي 5% (أو سحق قرص 500 ملغ في 10 مل ماء واستخدامه كمضمضة موضعية).',
    standardDosageEn: 'Tranexamic Acid: 500–1000 mg orally q8h for 5–7 days post-operatively, coupled with 5% topical rinse qid (rinse and spit).',
    allergyAlerts: '🚫 موانع الاستعمال لحمض الترانيكساميك الجهازي: الخثار النشط الحاد والقصور الكلوي الشديد.',
    pregnancySafety: 'الفئة B (FDA Category B) - يستخدم بحذر شديد وللضرورة التخثرية.',
    pregnancySafetyEn: 'FDA Category B: Utilize only for critical hemostatic indication under obstetric hematology care.',
    status: 'published',
    warningLevel: 'high',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق حظر حقنة IANB القاتلة في الهيموفيليا قبل تعويض العامل واستخدام غسول الترانيكساميك.',
      reviewedAt: '2026-03-15T14:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // =========================================================================
  // 2. ANTICOAGULANTS & ANTIPLATELETS (أدوية سيولة ومميعات الدم ومضادات الصفيحات)
  // =========================================================================
  {
    id: 'drug-aspirin-cardio',
    category: 'anticoagulants_antiplatelets',
    nameEn: 'Aspirin 81mg - 100mg (Baby Aspirin / Cardioprotective)',
    nameAr: 'أسبرين الأطفال الوقائي 81 - 100 ملغ (مضاد تجمع الصفيحات)',
    scientificName: 'Acetylsalicylic Acid (Low-Dose Antiplatelet)',
    brandNames: 'Aspocid, Cardio-Aspirin, Protect, Bayer Low Dose',
    activeIngredient: 'Aspirin',
    indication: 'الوقاية الثانوية من احتشاء عضلة القلب (MI)، السكتات الدماغية الإقفارية، خثار الشرايين التاجية، وبعد جراحات القلب المفتوح والشبكات.',
    indicationEn: 'Secondary cardiovascular prophylaxis against myocardial infarction, ischemic stroke, and post-angioplasty stent thrombosis.',
    clinicalConsiderations: '🩸 المعيار السريري الحديث والقاطع لطب الأسنان (American Dental Association & AHA Guidelines):\n1. ⚠️ لا توقف الأسبرين الوقائي (81-100 ملغ) أبداً قبل قلع الأسنان الروتيني أو الجراحات الفموية الصغرى!\n• مخاطر حدوث جلطة قلبية أو سكتة دماغية مميتة عند إيقاف الأسبرين تفوق بأضعاف مضاعفة أي نزف فموي موضعي يمكن السيطرة عليه بسهولة داخل العيادة.\n2. التدابير الموضعية للسيطرة على النزف:\n• الخياطة المتقاطعة (Cross / Figure-of-eight suture).\n• ضغط مستمر بشاش جاف أو مشبع بحمض الترانيكساميك لمدة 30 إلى 45 دقيقة دون انقطاع.\n• وضع إسفنج جيلاتيني أو Surgicel داخل السنخ.\n3. يمنع المريض من المضمضة العنيفة أو البصق أو شرب السوائل الساخنة لمدة 24 ساعة.',
    clinicalConsiderationsEn: 'Current ADA & AHA Consensus: NEVER discontinue low-dose aspirin (81–100 mg) for routine dental extractions or minor oral surgery. The catastrophic risk of acute coronary thrombosis or ischemic stroke vastly outweighs controllable localized alveolar oozing. Manage chairside with local hemostatics (sutures, Surgicel, tranexamic pressure pack).',
    drugInteractions: '🚫 تداخلات حاسمة:\n• يمنع دمج الأسبرين مع مسكنات الـ NSAIDs الأخرى كالإيبوبروفين والنابروكسين: لأنها تتنافس معه على مستقبلات COX-1 في الصفيحات وتبطل مفعوله الواقي للقلب، وتضاعف خطر النزف الهضمي بمعدل 4 أضعاف.\n• المسكن الآمن الأول هو الباراسيتامول (بجرعة لا تزيد عن 2 غرام يومياً).',
    drugInteractionsEn: 'Concomitant NSAIDs (ibuprofen) block aspirin’s irreversible platelet inhibition, negating cardioprotection and quadrupling GI ulceration/hemorrhage liability. Prefer paracetamol.',
    standardDosage: '75 ملغ إلى 100 ملغ فموياً مرة واحدة يومياً بعد وجبة الطعام الرئيسية مع كوب ماء كامل.',
    standardDosageEn: '75–100 mg orally once daily postprandially.',
    allergyAlerts: '🚫 موانع الاستعمال: القرحة المعدية النشطة، الربو المحرّض بالأسبرين (AERD / Samter’s Triad)، واضطرابات النزف الحادة.',
    pregnancySafety: 'الفئة D في الجرعات العالية والثلث الثالث من الحمل (يستخدم بجرعات منخفضة جداً فقط تحت إشراف استشاري النساء والتوليد للوقاية من تسمم الحمل).',
    pregnancySafetyEn: 'Category D at high doses. Low-dose (81 mg) utilized in selected high-risk pregnancies under specialist obstetric direction.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم تأكيد القاعدة السريرية الذهبية: عدم إيقاف الأسبرين الوقائي قبل القلع الروتيني.',
      reviewedAt: '2026-03-15T15:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-clopidogrel-plavix',
    category: 'anticoagulants_antiplatelets',
    nameEn: 'Clopidogrel 75mg (Plavix / P2Y12 Antiplatelet)',
    nameAr: 'كلوبيدوجريل 75 ملغ (بلافيكس لمنع خثار الشبكات والجلطات)',
    scientificName: 'Clopidogrel Bisulfate (Thienopyridine P2Y12 Inhibitor)',
    brandNames: 'Plavix, Iscover, Clopilet, Troken',
    activeIngredient: 'Clopidogrel',
    indication: 'العلاج الثنائي المضاد للصفيحات (Dual Antiplatelet Therapy - DAPT) بعد تركيب شبكات الشرايين التاجية (Coronary Stents)، المتلازمة الإكليلية الحادة، والسكتات الإقفارية.',
    indicationEn: 'Dual antiplatelet therapy (DAPT) post-percutaneous coronary intervention (PCI) stenting, acute coronary syndrome, and ischemic cerebrovascular disease.',
    clinicalConsiderations: '⚠️ خط أحمر سريري ومحاذير قصوى:\n1. 🚫 يمنع منعاً باتاً ونهائياً لطبيب الأسنان إيقاف دواء البلافيكس من تلقاء نفسه، خاصة إذا كان المريض قد ركّب شبكة شرايين قلبية (Stent) خلال الـ 12 شهراً الماضية! إيقاف الدواء قد يسبب تخثراً فورياً داخل الشبكة (Acute Stent Thrombosis) واحتشاء قلبي مميت.\n2. قلع 1 إلى 3 أسنان روتيني يمكن إجراؤه بأمان سريري مع استمرار البلافيكس وتطبيق تدابير التخثر الموضعية الفائقة (Surgicel، خياطة متقاطعة محكمة، وضغط شاش بالترانيكساميك).\n3. وقت النزف (Bleeding Time) يكون متطاولاً؛ انصح المريض بالضغط على الشاش لمدة 60 دقيقة وتجنب الرياضة والإجهاد ليوم كامل.\n4. في العمليات الجراحية العظمية الكبرى الموسعة فقط، يتم إرسال استشارة طبية خطية لطبيب القلب المعالج، وهو المخول الوحيد بإيقاف أو تعديل الجرعة.',
    clinicalConsiderationsEn: 'CRITICAL WARNING: Absolute contraindication for dentists to discontinue clopidogrel empirically within 12 months of coronary stent deployment (severe stent thrombosis and sudden cardiac death risk). Routine single/multiple extractions are clinically safe continuing clopidogrel with meticulous local hemostasis (figure-8 sutures, oxidized regenerated cellulose Surgicel, tranexamic pressure pack). Consult cardiologist for major maxillofacial trauma only.',
    drugInteractions: '• مثبطات مضخة البروتون: الأوميبرازول (Omeprazole) يثبط إنزيم CYP2C19 ويقلل تحول البلافيكس لشكله الفعال؛ ينصح باستخدام البانتوبرازول (Pantoprazole) كبديل آمن لحماية المعدة.\n• يمنع وصف الـ NSAIDs والأسبرين دون إشراف قلبي.',
    drugInteractionsEn: 'Omeprazole diminishes clopidogrel activation via CYP2C19 inhibition (substitute with pantoprazole). Synergistic bleeding liability with systemic NSAIDs.',
    standardDosage: '75 ملغ فموياً مرة واحدة يومياً مع أو بدون الطعام.',
    standardDosageEn: '75 mg orally once daily with or without food.',
    allergyAlerts: '⚠️ مخاطر كدمات عفوية ونزف هضمي ورعاف أنفي.',
    pregnancySafety: 'الفئة B (FDA Category B) - يستخدم فقط عند الضرورة القلبية الحتمية.',
    pregnancySafetyEn: 'FDA Category B: Utilize only for imperative maternal cardiovascular indications.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم التشديد على حظر إيقاف البلافيكس خلال أول سنة من تركيب شبكة الشرايين القلبية.',
      reviewedAt: '2026-03-15T16:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-rivaroxaban-xarelto',
    category: 'anticoagulants_antiplatelets',
    nameEn: 'Rivaroxaban 10mg - 20mg (Xarelto / DOAC - Factor Xa Inhibitor)',
    nameAr: 'ريفاروكسابان (زاريلتو - مميعات الدم الفموية المباشرة الحديثة NOACs)',
    scientificName: 'Rivaroxaban (Direct Oral Anticoagulant - Direct Factor Xa Inhibitor)',
    brandNames: 'Xarelto, Rivarox, Xalvobin',
    activeIngredient: 'Rivaroxaban',
    indication: 'الوقاية من السكتة الدماغية في الرجفان الأذيني غير الصمامي (AFib)، وعلاج التخثر الوريدي العميق (DVT) والانصمام الرئوي.',
    indicationEn: 'Direct Factor Xa inhibition for stroke prevention in non-valvular atrial fibrillation and management of venous thromboembolism.',
    clinicalConsiderations: '🩸 بروتوكول قلع الأسنان السريري لمميعات الـ DOACs الحديثة (Xarelto, Eliquis, Pradaxa):\n1. لا يتطلب فحص INR روتيني (لأن تأثيره نوعي ومباشر على العامل Xa).\n2. التوقيت الذهبي للقلع البسيط (1-2 سن):\nيجرى القلع السني في أدنى مستوى للدواء في الدم (Trough Level)، أي بعد مرور 12 إلى 24 ساعة من آخر جرعة دواء (مثال: إذا كان المريض يأخذ حبة العشاء، حدد موعد القلع في الصباح الباكر قبل تناول الجرعة التالية) دون الحاجة لإيقاف الدواء.\n3. في الجراحات المعقدة والقلع المتعدد:\nبالتنسيق مع طبيب القلب، قد يطلب من المريض تفويت جرعة الصباح فقط ثم إجراء الجراحة، وإعادة أخذ الجرعة مساءً بعد توقف النزف وتكون الخثرة.\n4. تدابير السيطرة الموضعية الإلزامية: خياطة محكمة، شاش مشبع بالترانيكساميك، وإسفنج Surgicel.',
    clinicalConsiderationsEn: 'Routine INR monitoring not applicable. Schedule minor extractions at trough plasma concentrations (12–24h post-dose, e.g., morning appointment before daily dose). Do not disrupt regimen for simple extractions. For complex surgical procedures, cardiologist may advise skipping morning dose only. Mandatory local hemostatics (sutures, Surgicel, tranexamic pressure pack).',
    drugInteractions: '• الأدوية المثبطة للـ CYP3A4 و P-gp (مثل الكيتوكونازول والإريثرومايسين) ترفع تركيز الزاريلتو وتضاعف خطر النزف.\n• يمنع منعاً باتاً وصف الـ NSAIDs معه كمسكنات؛ استخدم الباراسيتامول.',
    drugInteractionsEn: 'Strong dual CYP3A4 and P-gp inhibitors (azoles, macrolides) markedly elevate rivaroxaban plasma levels. Concurrent NSAIDs strictly contraindicated.',
    standardDosage: '15 ملغ إلى 20 ملغ فموياً مرة واحدة يومياً مع وجبة العشاء لتحسين الامتصاص.',
    standardDosageEn: '15–20 mg orally once daily with the evening meal.',
    allergyAlerts: '🚫 خطر نزفي حرج: راقب علامات النزف الخفي والبول المدمى.',
    pregnancySafety: 'الفئة C (FDA Category C) - يمنع في الحمل واستبداله بالهيبارين منخفض الوزن الجزيئي LMWH.',
    pregnancySafetyEn: 'FDA Category C: Avoid in pregnancy; transition to therapeutic low-molecular-weight heparin.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد بروتوكول Trough Level الصباحي للقلع السني الآمن.',
      reviewedAt: '2026-03-15T17:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-warfarin-anticoag',
    category: 'anticoagulants_antiplatelets',
    nameEn: 'Warfarin 1mg - 5mg (Coumadin / Vitamin K Antagonist)',
    nameAr: 'وارفارين (كومادين / ماريفان - مميع الدم ومضاد فيتامين K)',
    scientificName: 'Warfarin Sodium (Coumarin Anticoagulant)',
    brandNames: 'Coumadin, Marevan, Jantoven',
    activeIngredient: 'Warfarin',
    indication: 'الوقاية من وعلاج التخثرات الوريدية العميقة (DVT)، الانصمام الرئوي، الرجفان الأذيني (AFib)، والوقاية من الجلطات بعد تركيب صمامات القلب الاصطناعية الميكانيكية.',
    indicationEn: 'Anticoagulation for atrial fibrillation, mechanical prosthetic heart valves, deep vein thrombosis (DVT), and pulmonary embolism (PE).',
    clinicalConsiderations: '🩸 البروتوكول السريري الحاسم لقلع الأسنان وجراحة الفم لمرضى الوارفارين:\n1. 📊 فحص زمن البروثرومبين (INR) الإلزامي: يجب قياس الـ INR خلال 24 إلى 72 ساعة كحد أقصى قبل الإجراء الجراحي (يفضل صباح يوم القلع إذا كان المريض غير مستقر).\n2. ⚖️ النطاق السريري الآمن للقلع:\n• إذا كان الـ INR بين 2.0 إلى 3.5: يمكن إجراء القلع البسيط (1 إلى 3 أسنان) وجراحات اللثة الصغرى بأمان تام دون إيقاف الوارفارين ودون تعديل الجرعة.\n• 🚫 تحذير قاطع: لا توقف الوارفارين أبداً من تلقاء نفسك دون استشارة خطية مسبقة من طبيب القلب المعالج! إيقاف الوارفارين يعرض المريض لخطر جلطة صمام اصطناعي مميتة أو سكتة دماغية إقفارية حادة، وهو خطر كارثي يفوق بمئات المرات النزف الموضعي الذي يسهل التحكم به على كرسي الأسنان.\n3. 🧵 التدابير الموضعية الإلزامية للسيطرة على النزف:\n• الخياطة الجراحية المحكمة المتقاطعة (Cross / Figure-of-8 sutures).\n• وضع مادة سليلوزية قابضة ومخثرة داخل السنخ (Surgicel / Gelfoam).\n• ضغط مستمر بشاش مشبع بحمض الترانيكساميك 5% (Tranexamic Acid) لمدة 45 دقيقة.\n• غسول فموي بحمض الترانيكساميك 5% (مضمضة 10 مل لمدة دقيقتين 4 مرات يومياً لمدة يومين دون بلع المحلول).\n4. 🚫 يمنع منعاً باتاً وصف الأسبرين أو مضادات الالتهاب غير الستيرويدية (NSAIDs كالإيبوبروفين والديكلوفيناك) كمسكنات؛ المسكن الآمن الوحيد هو الباراسيتامول بجرعة لا تتعدى 2 غرام يومياً.',
    clinicalConsiderationsEn: 'Mandatory pre-op INR verification within 24–72 hours prior to dental extraction. Routine exodontia (1–3 teeth) is safe within therapeutic INR range 2.0–3.5 without altering warfarin dosage. NEVER discontinue warfarin unilaterally due to catastrophic thromboembolism or mechanical valve thrombosis. Employ meticulous local hemostatics: oxidized regenerated cellulose (Surgicel), cross-suturing, and topical 5% tranexamic acid pressure pack. Strictly avoid NSAIDs; prescribe paracetamol (max 2 g/day).',
    drugInteractions: '⚠️ تداخلات دوائية شديدة الخطورة مع أدوية الأسنان:\n• الميترونيدازول (Metronidazole) والإريثرومايسين (Erythromycin) يثبطان إنزيم CYP2C9 الكبدي ويرفعان تركيز الوارفارين والـ INR لدرجات نزفية قاتلة!\n• مضادات الالتهاب غير الستيرويدية (NSAIDs) تضاعف خطر النزف الهضمي بمعدل هائل.\n• الميكونازول الموضعي الفموي (Daktarin Oral Gel) يمتص جهازياً ويثبط استقلاب الوارفارين بقوة ويسبب نزفاً حاداً.',
    drugInteractionsEn: 'Critical CYP2C9 interactions: Metronidazole, erythromycin, and miconazole oral gel severely impair warfarin clearance, precipitating catastrophic INR spikes and acute hemorrhage. Concurrent NSAIDs strictly prohibited.',
    standardDosage: 'جرعة يومية فردية يحددها طبيب القلب والأوعية بدقة بناءً على قياسات الـ INR المستهدفة (غالباً 2 ملغ إلى 5 ملغ يومياً مساءً).',
    standardDosageEn: 'Individually calibrated daily oral dose guided by target INR range (2.0–3.0 for AFib/DVT, 2.5–3.5 for mechanical mitral valves).',
    allergyAlerts: '🚫 تحذير نزفي حرج: راقب الكدمات التلقائية، الرعاف، البول المدمى، والنزف اللثوي المستمر.',
    pregnancySafety: 'الفئة X (FDA Category X) - يمنع قطعياً في الحمل لتسببه في متلازمة الوارفارين الجنينية وتكلس المشاش وتشوهات الهيكل العظمي ونزف الجنين.',
    pregnancySafetyEn: 'FDA Category X: Teratogenic (fetal warfarin syndrome); strictly contraindicated during pregnancy.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد بروتوكول INR (2.0 - 3.5) والتحذير الحرج من الميترونيدازول وجل الميكونازول الفموي.',
      reviewedAt: '2026-03-15T16:30:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  {
    id: 'drug-diazepam-valium',
    category: 'sedatives_anxiolytics',
    nameEn: 'Diazepam 5mg - 10mg (Valium / Dental Phobia Oral Premedication)',
    nameAr: 'ديازيبام (فاليوم - مهدئ ما قبل جلسة الأسنان لعلاج الرهاب الشديد)',
    scientificName: 'Diazepam (Long-Acting Benzodiazepine)',
    brandNames: 'Valium, Stesolid, Neuril, Faustan',
    activeIngredient: 'Diazepam',
    indication: 'علاج رهاب عيادة الأسنان الشديد (Severe Dental Phobia / Anxiety)، التشنج العضلي للمفصل الصدغي الفكي (TMJ Spasm / Trismus)، والتهدئة الفموية قبل الجراحة.',
    indicationEn: 'Oral conscious sedation for acute dental anxiety/phobia, skeletal muscle relaxation in temporomandibular joint (TMJ) spasms, and pre-operative tranquilization.',
    clinicalConsiderations: '🧠 بروتوكول التهدئة الفموية والتعامل مع رهاب الأسنان:\n1. 💊 بروتوكول الجرعة المعتمد:\n• 5 ملغ فموياً قبل النوم ليلة الجلسة السريرية (لضمان نوم عميق وتخفيف التوتر الاستباقي).\n• 5 ملغ إلى 10 ملغ فموياً قبل موعد جلسة الأسنان بـ 45 إلى 60 دقيقة في العيادة.\n2. ⚠️ شروط السلامة الإلزامية:\n• يجب حضور مرافق بالغ مسؤول (Adult Escort) مع المريض لاصطحابه إلى المنزل، ولا يسمح للمريض بالخروج بمفرده إطلاقاً.\n• حظر قيادة السيارة، ركوب الدراجات، أو اتخاذ قرارات قانونية لمدة 24 ساعة بعد تناول الدواء.\n3. التداخل مع مخدر الأسنان الموضعي:\n• آمن تماماً مع الليدوكائين والإبينفرين بالجرعات المعتادة.\n• ⚠️ تحذير: تجنب دمج الديازيبام مع مسكنات أفيونية إضافية لتفادي التثبيط التنفسي الشديد وهبوط الأكسجين.\n4. الترياق ومضاد التسمم (Antidote):\n• فلومازينيل (Flumazenil IV 0.2mg) يجب أن يكون متوفراً في صيدلية طوارئ العيادة لعكس تأثير البنزوديازيبين فوراً عند حدوث تثبيط تنفسي مفرط.',
    clinicalConsiderationsEn: 'Oral premedication protocol: 5 mg orally hs night before; 5–10 mg orally 45–60 min pre-procedure. Mandatory safety covenant: Responsible adult escort required to accompany patient home; no vehicular driving/machinery for 24h. Compatible with standard dental local anesthetics. Avoid concurrent opioids. Chairside reversal agent Flumazenil IV must be accessible in operatory.',
    drugInteractions: '🚫 تداخلات مهدئة خطيرة:\n• تآزر وتثبيط تنفسي مميت عند تناوله مع الكحول، الأفيونات، أو المنومات ومضادات الهيستامين المهدئة.\n• السيميتيدين والإريثرومايسين يثبطان استقلابه الكبدي ويطيلان فترة الخمول.',
    drugInteractionsEn: 'Synergistic life-threatening respiratory and CNS depression with alcohol, barbiturates, opioids, and sedative antihistamines. Erythromycin delays hepatic clearance.',
    standardDosage: 'البالغين: 5 ملغ إلى 10 ملغ فموياً قبل الجلسة بـ 45-60 دقيقة (كبار السن وضعاف البنية: 2 إلى 2.5 ملغ فقط لتفادي السقوط والترنح).',
    standardDosageEn: 'Adults: 5–10 mg orally 45–60 min prior to dental appointment. Elderly/debilitated: 2–2.5 mg to curb prolonged ataxia.',
    allergyAlerts: '🚫 موانع الاستعمال: الوهن العضلي الوبيل (Myasthenia Gravis)، القصور التنفسي الحاد، الجلوكوما ضيقة الزاوية الحادة.',
    pregnancySafety: 'الفئة D (FDA Category D) - يعبر المشيمة ويفرز بالحليب ويسبب متلازمة الطفل الرخو (Floppy Infant Syndrome)؛ يمنع في الحمل والرضاعة.',
    pregnancySafetyEn: 'FDA Category D: Teratogenic oral cleft risk in early pregnancy; causes neonatal CNS depression (floppy infant syndrome).',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد شرط المرافق البالغ وحظر القيادة 24 ساعة وتوفير الفلومازينيل.',
      reviewedAt: '2026-03-15T18:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-alprazolam-xanax',
    category: 'sedatives_anxiolytics',
    nameEn: 'Alprazolam 0.25mg - 0.5mg (Xanax / Rapid Acute Dental Anxiety)',
    nameAr: 'ألبرازولام (زاناكس - مهدئ سريع المفعول لنوبات الهلع وقلق الأسنان الحاد)',
    scientificName: 'Alprazolam (Intermediate-Acting Triazolobenzodiazepine)',
    brandNames: 'Xanax, Restyl, Alprox, Niravam',
    activeIngredient: 'Alprazolam',
    indication: 'السيطرة السريعة على نوبات الهلع (Panic Attacks) وقلق الأسنان الحاد المثار برؤية إبرة التخدير أو صوت توربين الحفر، وتثبيط منعكس الإقياء الشديد (Gag Reflex).',
    indicationEn: 'Rapid control of situational panic episodes, acute needle phobia, and severe psychogenic gag reflex during dental impressions.',
    clinicalConsiderations: '• يمتاز ببداية مفعول سريعة (خلال 30 إلى 45 دقيقة) وتأثير مهدئ مضاد للقلق دون نوم عميق مفرط مقارنة بالديازيبام.\n• مفيد جداً للمرضى الذين يعانون من فرط منعكس الإقياء (Hyperactive Gag Reflex) أثناء أخذ الطبعات السنية أو علاج الأسنان الخلفية.\n• يلزم وجود مرافق بالغ مسؤول لاصطحاب المريض، وحظر قيادة المركبات لمدة 24 ساعة.',
    clinicalConsiderationsEn: 'Rapid onset (30–45 min) with marked anxiolytic selectivity. Highly beneficial for suppressing hyperactive gag reflex during prosthodontic impressions. Requires adult chaperone and 24h driving abstention.',
    drugInteractions: '• يمنع قطعياً دمجه مع مضادات الفطريات الآزولية (Ketoconazole / Itraconazole) لأنها ترفع مستوياته الدموية لدرجة خطيرة.\n• تجنب المهدئات والأفيونات.',
    drugInteractionsEn: 'Contraindicated with strong CYP3A inhibitors (ketoconazole, itraconazole). Potentiated by systemic CNS depressants.',
    standardDosage: '0.25 ملغ إلى 0.5 ملغ فموياً تؤخذ قبل الجلسة بـ 45 دقيقة.',
    standardDosageEn: '0.25–0.5 mg orally 45 minutes prior to dental procedure.',
    allergyAlerts: '🚫 موانع الاستعمال: القصور الكبدي الشديد، الجلوكوما، وانقطاع النفس أثناء النوم.',
    pregnancySafety: 'الفئة D (FDA Category D) - يمنع في الحمل والرضاعة الطبيعية.',
    pregnancySafetyEn: 'FDA Category D: Contraindicated during pregnancy and lactation.',
    status: 'published',
    warningLevel: 'caution',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت إجازته لتدبير منعكس التقيؤ النفسي الشديد ونوبات هلع إبرة التخدير.',
      reviewedAt: '2026-03-15T19:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // =========================================================================
  // 4. THYROID DISORDERS (أدوية الغدة الدرقية ومحاذير التخدير والإبينفرين)
  // =========================================================================
  {
    id: 'drug-levothyroxine-euthyrox',
    category: 'thyroid_disorders',
    nameEn: 'Levothyroxine 50mcg - 100mcg (Euthyrox / Hypothyroidism)',
    nameAr: 'ليفوثيروكسين (إيوثيروكس / سينثرويد - علاج قصور الغدة الدرقية)',
    scientificName: 'Levothyroxine Sodium (Synthetic T4 Thyroxine)',
    brandNames: 'Euthyrox, Synthroid, Thyrax, Levoxyl',
    activeIngredient: 'Levothyroxine Sodium',
    indication: 'العلاج الهرموني التعويضي لقصور الغدة الدرقية (Hypothyroidism)، التهاب هاشيموتو، وما بعد الاستئصال الجراحي للغدة.',
    indicationEn: 'Hormone replacement therapy for primary and secondary hypothyroidism, myxedema, and post-thyroidectomy management.',
    clinicalConsiderations: '🦷 اعتبارات طب الأسنان في قصور الغدة الدرقية:\n1. المريض المنضبط دوائياً (Euthyroid): يمكن إجراء كافة المعالجات السنية وجراحة الفم والقلع بأمان تام مع استخدام المخدر الموضعي الحاوي على إبينفرين بالجرعات المعتادة.\n2. المريض غير المنضبط (قصور حاد شديد): إياك وإعطاء جرعات عادية من المهدئات والمنومات ومسكنات الألم الأفيونية! المريض يعاني من بطء شديد في الاستقلاب الكبدي وحساسية مفرطة للمهدئات، مما قد يدخله في تثبيط تنفسي حاد وغيبوبة وذمية مخاطية (Myxedema Coma).\n3. تضخم اللسان (Macroglossia) وتأخر بزوغ الأسنان في الأطفال المصابين بالقصور الولادي.\n4. تأخر التئام الجروح وسهولة حدوث العدوى في القصور غير المسيطر عليه.',
    clinicalConsiderationsEn: 'Euthyroid patients (medically controlled) can safely receive full dental procedures and standard local anesthesia with epinephrine. In severe untreated hypothyroidism: extreme hypersensitivity to CNS depressants, sedatives, and opioids due to reduced hepatic metabolism; reduce doses or avoid sedatives to prevent fatal Myxedema Coma. Macroglossia and delayed wound healing are frequent.',
    drugInteractions: '• مكملات الكالسيوم، الحديد، ومضادات الحموضة ترتبط بالليفوثيروكسين في الأمعاء وتمنع امتصاصه (يجب الفصل 4 ساعات كاملة).\n• قد يزيد من حساسية المريض للوارفارين.',
    drugInteractionsEn: 'Oral iron, calcium carbonate, and aluminum/magnesium antacids chelate levothyroxine; mandate 4-hour administration window. Potentiates warfarin response.',
    standardDosage: '50 إلى 100 ميكروغرام (mcg) فموياً مرة واحدة يومياً على معدة فارغة تماماً مع ماء فقط قبل الإفطار بـ 30-60 دقيقة.',
    standardDosageEn: '50–100 mcg orally once daily on an empty stomach with a full glass of water 30–60 min before breakfast.',
    allergyAlerts: '⚠️ الجرعات الزائدة تسبب أعراض فرط النشاط (خفقان، تسرع قلب، رعاش، أرق، وارتفاع ضغط).',
    pregnancySafety: 'الفئة A (FDA Category A) - آمن تماماً وضروري جداً لنمو دماغ الجنين ويجب عدم إيقافه أبداً أثناء الحمل.',
    pregnancySafetyEn: 'FDA Category A: Physiologic replacement; vital for fetal neurodevelopment; must never be interrupted during gestation.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق محاذير بطء استقلاب المهدئات والأفيونات لدى مرضى القصور الشديد غير المنضبط.',
      reviewedAt: '2026-03-15T20:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-carbimazole-thyroid',
    category: 'thyroid_disorders',
    nameEn: 'Carbimazole 5mg - 20mg (Neo-Mercazole / Hyperthyroidism & Epinephrine Warning)',
    nameAr: 'كاربيمازول (نيو-ميركازول - فرط نشاط الغدة والتحذير الحاسم من الإبينفرين)',
    scientificName: 'Carbimazole / Methimazole (Thionamide Antithyroid)',
    brandNames: 'Neo-Mercazole, Tapazole, Thyrozol',
    activeIngredient: 'Carbimazole',
    indication: 'علاج فرط نشاط الغدة الدرقية (Hyperthyroidism / Thyrotoxicosis)، داء غريفز (Graves’ disease)، وتسمم الغدة الدرقية.',
    indicationEn: 'Antithyroid suppression for thyrotoxicosis, Graves’ disease, and preparation for radioiodine or surgical thyroidectomy.',
    clinicalConsiderations: '⚠️🚨 التحذير السريري الأخطر في طب الأسنان (Thyroid Storm & Vasoconstrictor Hazard):\n1. 🚫 حظر الإبينفرين القطعي في الحالات غير المنضبطة:\nفي مريض فرط نشاط الغدة الدرقية غير المسيطر عليه دوائياً، يمنع منعاً باتاً ونهائياً استخدام المخدر الموضعي الحاوي على إبينفرين (Epinephrine) أو خيوط تبعيد اللثة الحاوية على أدرينالين!\n• السبب: فرط هرمونات الغدة يزيد حساسية مستقبلات بيتا الأدرينالية في القلب للأدرينالين بمعدل هائل، وحقن الإبينفرين قد يحفز عاصفة الغدة الدرقية القاتلة (Thyrotoxic Storm / Thyroid Crisis)، مصحوبة بارتفاع حرارة مفرط، تسرع قلبي خبيث، رجفان بطيني، وسكتة قلبية في كرسي الأسنان.\n2. المخدر البديل الآمن: استخدم ميبفاكائين 3% بدون قابض وعائي (Mepivacaine 3% Plain) أو بريلوكائين مع فيلبريسين (Felypressin).\n3. المريض المنضبط دوائياً (Euthyroid): يمكن استخدام حد أقصى 2 كبسولة تخدير 1:100,000 (0.04 ملغ إبينفرين) بحذر شديد مع تجنب الحقن الوعائي (Aspiration).\n4. عرض جانبي خطير للكاربيمازول: ندرة المحببات ونقص الكريات البيض (Agranulocytosis). إذا اشتكى المريض من تقرحات فموية نخرية مفاجئة مع حمى والتهاب حلق، أوقف الإجراء فوراً واطلب فحص دم شامل CBC.',
    clinicalConsiderationsEn: 'CRITICAL THYROTOXIC CRISIS HAZARD: Epinephrine and vasoconstrictor-containing retraction cords are STRICTLY CONTRAINDICATED in uncontrolled/untreated hyperthyroidism. Hyperthyroid myocardium exhibits extreme beta-receptor up-regulation; exogenous epinephrine can precipitate fatal Thyroid Storm, malignant ventricular arrhythmias, and hypertensive crisis. Use plain local anesthetic (Mepivacaine 3% plain). In well-controlled euthyroid patients, limit epinephrine to 0.04 mg (max 2 cartridges 1:100,000) with negative aspiration. Monitor for drug-induced agranulocytosis presenting as sudden necrotic oral ulcers and pharyngitis.',
    drugInteractions: '• تآزر قلبي خطير مع مقبضات الأوعية والأدرينالين ومضادات الاحتقان.\n• يزيد تأثير الوارفارين المميع للدم.\n• يقلل تصفية الديجوكسين والبيتا بلوكرز.',
    drugInteractionsEn: 'Fatal cardiovascular synergy with exogenous epinephrine and sympathomimetics. Enhances oral anticoagulant sensitivity. Altered clearance of beta-blockers.',
    standardDosage: 'جرعة البدء: 15 ملغ إلى 40 ملغ يومياً مقسمة على جرعات كل 8 ساعات، ثم جرعة صيانة 5-15 ملغ يومياً بعد عودة المريض للحالة الطبيعية.',
    standardDosageEn: 'Initial: 15–40 mg/day divided q8h until euthyroid, then maintenance dose 5–15 mg daily.',
    allergyAlerts: '🚨 تنبيه فوري: تقرحات الفم النخرية الشديدة والتهاب الحلق والحرارة علامة على ندرة المحببات (Agranulocytosis).',
    pregnancySafety: 'الفئة D (FDA Category D) - يعبر المشيمة ويسبب تشوهات خلقية كتعري فروة الرأس؛ يستبدل بـ Propylthiouracil (PTU) في الثلث الأول.',
    pregnancySafetyEn: 'FDA Category D: Teratogenic (aplasia cutis); propylthiouracil (PTU) preferred in first trimester.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق حظر الإبينفرين الصارم وخطر العاصفة الدرقية واستخدام الميبفاكائين الخالي من القابض.',
      reviewedAt: '2026-03-15T21:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // =========================================================================
  // 5. ANTIBIOTICS & ENDOCARDITIS PROPHYLAXIS (المضادات الحيوية ووقاية القلب)
  // =========================================================================
  {
    id: 'drug-antibiotic-ie-protocol',
    category: 'antibiotics',
    nameEn: 'Infective Endocarditis (IE) Antibiotic Prophylaxis Protocol (AHA / ADA Guidelines)',
    nameAr: 'بروتوكول الوقاية من التهاب الشغاف الجرثومي المعتمد من جمعية القلب الأمريكية (AHA)',
    scientificName: 'AHA/ADA Standard Dental Premedication Regimen',
    brandNames: 'Amoxil, Augmentin, Dalacin C, Zithromax',
    activeIngredient: 'Amoxicillin / Clindamycin / Azithromycin / Ampicillin',
    indication: 'الوقاية الإلزامية من تجرثم الدم والتهاب صمامات وشغاف القلب الجرثومي القاتل (Infective Endocarditis) قبل إجراءات الأسنان المسببة للنزف.',
    indicationEn: 'Standard evidence-based bacteremia prophylaxis in high-risk cardiac patients undergoing gingival, periapical, or mucosal invasive dental manipulations.',
    clinicalConsiderations: '🫀 معايير جمعية القلب الأمريكية (AHA & ADA) الدقيقة:\n1. من هم المرضى الذين يحتاجون للوقاية قطيعاً؟\n• الصمامات القلبية الاصطناعية (Prosthetic Cardiac Valves or prosthetic material used in valve repair).\n• سوابق الإصابة بالتهاب الشغاف الجرثومي (Previous history of Infective Endocarditis).\n• أمراض القلب الخلقية المزرقة غير المصلحة (Unrepaired cyanotic congenital heart disease).\n• تشوهات القلب المصلحة بمواد صناعية خلال أول 6 أشهر من الجراحة.\n• زراعة القلب مع اعتلال وتخرب الصمامات (Cardiac transplantation with valvulopathy).\n• ⚠️ ملاحظة: المرضى الذين لديهم دعامات شرايين عادية (Stents) أو مجازة تاجية (CABG) أو هبوط صمام تاجي بسيط دون ارتجاع شديد لا يحتاجون للمضاد الوقائي روتينياً.\n2. الإجراءات السنية المشمولة: أي إجراء يتضمن التلاعب باللثة أو اختراق الغشاء المخاطي الفموي (القلع، التقليح وتجريف اللثة، المعالجة اللبية، وضع زرعات الأسنان). لا يلزم في الفحص العادي أو الحشوات البسيطة أو الصور الإشعاعية.\n3. التوقيت الذهبي: جرعة مفردة واحدة تعطى فموياً قبل الإجراء بـ 30 إلى 60 دقيقة. إذا نسي المريض، يمكن إعطاؤها حتى ساعتين بعد الإجراء.',
    clinicalConsiderationsEn: 'Strictly restricted to highest-risk cardiac cohorts: prosthetic heart valves, prior history of IE, unrepaired cyanotic congenital heart defects, or cardiac transplants with valvular dysfunction. Indicated for dental procedures involving gingival/periapical manipulation or mucosal perforation. Administer single oral dose 30–60 min pre-procedure (can be administered up to 2 hours post-procedure if inadvertently missed).',
    drugInteractions: '• يمنع البنسلين لمرضى الحساسية ويستبدل بالكليندامايسين أو الأزيثرومايسين.',
    drugInteractionsEn: 'Select alternative non-beta-lactam agent in verified penicillin allergy.',
    standardDosage: 'البروتوكول القياسي (عن طريق الفم):\n1. المرضى العاديون (خط أول): أموكسيسيلين 2 غرام (4 كبسولات عيار 500 ملغ) فموياً قبل الإجراء بـ 30-60 دقيقة. الأطفال: 50 ملغ/كجم.\n2. لمرضى حساسية البنسلين:\n• خيار أ: كليندامايسين (Clindamycin) 600 ملغ فموياً (الأطفال 20 ملغ/كجم).\n• خيار ب: أزيثرومايسين (Azithromycin) 500 ملغ فموياً (الأطفال 15 ملغ/كجم).\n• خيار ج: سيفالكسين (Cephalexin) 2 غرام فموياً (إذا لم تكن الحساسية من النوع الفوري التآقي Anaphylaxis).',
    standardDosageEn: 'Standard Oral Regimen: Amoxicillin 2 g (four 500 mg capsules) orally 30–60 min pre-op (Pediatric: 50 mg/kg). Penicillin-allergic patients: Clindamycin 600 mg orally (Pediatric: 20 mg/kg), OR Azithromycin 500 mg orally (Pediatric: 15 mg/kg), OR Cephalexin 2 g orally (if non-anaphylactic allergy).',
    allergyAlerts: '🚫 تحقق دائماً من حساسية البنسلين قبل إعطاء جرعة الـ 2 غرام أموكسيسيلين.',
    pregnancySafety: 'الفئة B (FDA Category B) - آمن ومتبع عالمياً لحماية قلب الأم الحامل.',
    pregnancySafetyEn: 'FDA Category B: Standard maternal cardioprotective protocol.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت مطابقة معايير جمعية القلب الأمريكية AHA وجمعية طب الأسنان الأمريكية ADA كاملة.',
      reviewedAt: '2026-03-15T22:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-azithromycin-500',
    category: 'antibiotics',
    nameEn: 'Azithromycin 500mg (Zithromax / Macrolide - Penicillin Allergy Alternative)',
    nameAr: 'أزيثرومايسين 500 ملغ (زيثروماكس - بديل حساسية البنسلين ووقاية القلب)',
    scientificName: 'Azithromycin Dihydrate (Azalide / Macrolide)',
    brandNames: 'Zithromax, Azitro, Z-Pak, Azacin',
    activeIngredient: 'Azithromycin',
    indication: 'علاج خراجات وعدوى الأسنان الحادة للمرضى الذين يعانون من حساسية البنسلين، وبديل معتمد للوقاية من التهاب الشغاف الجرثومي.',
    indicationEn: 'Empirical odontogenic antimicrobial therapy in penicillin-allergic individuals and approved second-line cardiac endocarditis prophylaxis.',
    clinicalConsiderations: '• يمتاز بنصف عمر حيوي مديد وتركيز عالي جداً داخل الأنسجة والبلعميات (Tissue phagocytes)، مما يتيح كورس علاج قصير ومريح (جرعة واحدة يومياً لمدة 3 أيام فقط كافية كلياً لعلاج العدوى السنية).\n• خيار مثالي للمرضى الذين لا يتحملون الكليندامايسين أو يخافون من الإسهال والتهاب القولون.\n• ⚠️ تحذير قلبي خاص: الماكروليدات قد تسبب استطالة فترة QT (QT Prolongation) واضطراب النظم البطيني (Arrhythmias)؛ الحذر لدى مرضى الرجفان أو الذين يتناولون أدوية من شأنها إطالة فترة QT.',
    clinicalConsiderationsEn: 'Exceptional cellular penetration and extended elimination half-life (~68h); full dental course achieved with single daily dose for only 3 days. Preferred in patients intolerant of clindamycin. Cardiac warning: potential QT interval prolongation and ventricular arrhythmia in predisposed patients.',
    drugInteractions: '• مضادات الحموضة الحاوية على الألمنيوم والمغنيسيوم تقلل امتصاصه (يجب الفصل ساعتين).\n• قد يزيد من مستويات الوارفارين والديجوكسين في الدم.',
    drugInteractionsEn: 'Antacids decrease peak serum concentrations. Caution with warfarin and digoxin.',
    standardDosage: 'علاج العدوى السنية: 500 ملغ فموياً مرة واحدة يومياً لمدة 3 أيام متتالية (أو 500 ملغ باليوم الأول ثم 250 ملغ يومياً لمدة 4 أيام). الوقاية القلبية: 500 ملغ جرعة واحدة قبل الإجراء بـ 30-60 دقيقة. الأطفال: 10-15 ملغ/كجم.',
    standardDosageEn: 'Dental Infection: 500 mg orally once daily for 3 consecutive days (or 500 mg day 1, then 250 mg days 2–5). IE Prophylaxis: 500 mg single oral dose 30–60 min pre-op (Pediatric: 15 mg/kg).',
    allergyAlerts: '🚫 موانع الاستعمال: سوابق يرقان ركودي أو حساسية للماكروليدات (إريثرومايسين، كلاريثرومايسين).',
    pregnancySafety: 'الفئة B (FDA Category B) - آمن في الحمل والرضاعة وبديل ممتاز للبنسلين.',
    pregnancySafetyEn: 'FDA Category B: Safe and widely utilized in pregnancy when beta-lactams are contraindicated.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد كورس الـ 3 أيام الفعال وتنبيه استطالة فترة QT لمرضى اضطراب النبض.',
      reviewedAt: '2026-03-15T22:30:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-clind-300',
    category: 'antibiotics',
    nameEn: 'Clindamycin 300mg - 600mg (Dalacin C / Penicillin Allergy & Bone Penetration)',
    nameAr: 'كليندامايسين 300 - 600 ملغ (دالاسين سي - البديل الذهبي لاختراق العظم والوقاية)',
    scientificName: 'Clindamycin Hydrochloride (Lincosamide)',
    brandNames: 'Dalacin C, Clinacin, Cleocin',
    activeIngredient: 'Clindamycin',
    indication: 'الخيار الذهبي الأول للمرضى الذين يعانون من حساسية شديدة ومثبتة للبنسلين، وعدوى العظام السنية العميقة (Osteomyelitis & Dry Socket)، والوقاية القلبية.',
    indicationEn: 'Primary non-beta-lactam option for severe penicillin-allergic patients; exceptional osseous penetration in alveolar osteitis and refractory bone infections.',
    clinicalConsiderations: '• اختراق عظمي فائق (Superior Bone Penetration): تركيزه في عظم الفك السفلي والعلوي يماثل تركيزه في مصل الدم، مما يجعله العلاج الأقوى للخراجات العظمية والتهاب العظم السنخي.\n• الوقاية من التهاب الشغاف القلبي: 600 ملغ فموياً كجرعة واحدة قبل الإجراء بـ 30-60 دقيقة.\n• ⚠️ تحذير الصندوق الأسود (Black-Box Warning):\nيجب إيقاف الدواء فوراً واستشارة الطبيب إذا أصيب المريض بإسهال مائي حاد أو مغص بطني، لاحتمال حدوث التهاب القولون الغشائي الكاذب الناجم عن بكتيريا المطثية العسيرة (Clostridioides difficile Colitis).\n• يجب شرب كبسولة الدواء مع كوب ماء كامل والبقاء في وضعية الجلوس أو الوقوف لمدة 30 دقيقة لتجنب التصاق الكبسولة بجدار المريء وإحداث تقرح مريئي شديد.',
    clinicalConsiderationsEn: 'Outstanding alveolar bone bioavailability. Black-box warning: discontinue immediately if severe watery diarrhea manifests due to C. difficile pseudomembranous colitis risk. Must be taken with a full glass of water while remaining upright for 30 minutes to prevent pill-induced esophagitis.',
    drugInteractions: '• يثبط النقل العصبي العضلي؛ الحذر مع أدوية شلل العضلات في التخدير العام.\n• يرتبط بنفس مستقبلات الماكروليد؛ تجنب دمجه مع الإريثرومايسين.',
    drugInteractionsEn: 'Neuromuscular blockade potentiation. Antagonistic binding competition with macrolides.',
    standardDosage: 'علاج العدوى: 300 ملغ فموياً كل 6 إلى 8 ساعات لمدة 5 أيام بعد الطعام. الوقاية القلبية لمرضى حساسية البنسلين: 600 ملغ فموياً جرعة واحدة قبل الإجراء بـ 30-60 دقيقة (الأطفال: 20 ملغ/كجم).',
    standardDosageEn: 'Treatment: 300 mg orally q6–8h for 5 days. IE Prophylaxis: 600 mg single oral dose 30–60 min pre-op (Pediatric: 20 mg/kg).',
    allergyAlerts: '⚠️ تحذير: التوقف فوراً عند حدوث إسهال مائي متكرر أو طفح جلدي.',
    pregnancySafety: 'الفئة B (FDA Category B) - يعبر المشيمة ويفرز بحليب الأم، يستخدم عند وجود حساسية مؤكدة للبنسلين.',
    pregnancySafetyEn: 'FDA Category B: Crosses placental barrier; reserve for verified penicillin-allergic gravidas.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق جرعة الوقاية القلبية (600 ملغ) ومحاذير التهاب المريء والقولون.',
      reviewedAt: '2026-03-15T23:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-aug-625',
    category: 'antibiotics',
    nameEn: 'Augmentin 625mg - 1g (Amoxicillin / Clavulanate)',
    nameAr: 'أوجمنتين 625 ملغ - 1 غرام (أموكسيسيلين + حمض الكلافولانيك)',
    scientificName: 'Amoxicillin + Clavulanate Potassium (500mg/125mg or 875mg/125mg)',
    brandNames: 'Augmentin, Curam, Megamox, Klavox',
    activeIngredient: 'Amoxicillin + Clavulanic Acid',
    indication: 'العدوى السنية المعقدة المقاومة للبنسلين العادي، الخراجات اللثوية والسنية المتكررة، والتهاب الجيوب الفكية سني المنشأ (Odontogenic Maxillary Sinusitis).',
    indicationEn: 'Refractory or recurrent deep fascial space odontogenic infections and odontogenic maxillary sinusitis mediated by beta-lactamase-producing polymicrobial flora.',
    clinicalConsiderations: '• حمض الكلافولانيك يثبط إنزيم بيتا لاكتاماز البكتيري ويوسع طيف الأموكسيسيلين ليشمل البكتيريا المقاومة واللاهوائيات.\n• يؤخذ دائماً في بداية وجبة الطعام مباشرة لتقليل الاضطرابات الهضمية والإسهال وتحسين الامتصاص.\n• 🚫 ممنوع منعاً باتاً لمن لديهم سوابق حساسية بنسلين أو يرقان ركودي مرتبط بالأوجمنتين.',
    clinicalConsiderationsEn: 'Clavulanate irreversibly inactivates bacterial beta-lactamases. Administer immediately at the start of a meal to optimize clavulanate absorption and minimize gastrointestinal distress. Strictly contraindicated in penicillin hypersensitivity.',
    drugInteractions: '• يقلل فعالية حبوب منع الحمل الفموية نسبياً (ينصح بوسيلة إضافية عازلة).\n• يزيد خطر النزف مع الوارفارين.',
    drugInteractionsEn: 'Advise back-up non-hormonal contraception. May augment warfarin INR elevation.',
    standardDosage: 'قرص واحد 625 ملغ كل 8 ساعات، أو قرص 1 غرام (1000 ملغ) كل 12 ساعة لمدة 5 إلى 7 أيام في بداية الوجبة.',
    standardDosageEn: 'Adults: 625 mg orally q8h (or 1 g q12h) for 5–7 days at the start of a meal.',
    allergyAlerts: '🚫 موانع الاستعمال: حساسية البنسلين والبيتا لاكتام أو سوابق يرقان كبدي.',
    pregnancySafety: 'الفئة B (FDA Category B) - آمن بوجه عام وتجنب الاستخدام غير المبرر.',
    pregnancySafetyEn: 'FDA Category B: Generally considered safe during pregnancy.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم تدقيق تناوله في بداية الوجبة لمنع الغثيان والإسهال.',
      reviewedAt: '2026-03-15T23:30:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // =========================================================================
  // EXISTING METABOLIC, CARDIAC & RESUSCITATION PROTOCOLS
  // =========================================================================
  // 6. DIABETES
  {
    id: 'drug-diab-metformin',
    category: 'diabetes',
    nameEn: 'Metformin 500mg - 1000mg (Glucophage)',
    nameAr: 'ميتفورمين (جلوكوفاج)',
    scientificName: 'Metformin Hydrochloride (Biguanides)',
    brandNames: 'Glucophage, Formet, Metfor',
    activeIngredient: 'Metformin HCl',
    indication: 'العلاج الأساسي للنوع الثاني من داء السكري (Type 2 Diabetes Mellitus) لتحسين الحساسية للأنسولين.',
    indicationEn: 'First-line pharmacotherapy for Type 2 Diabetes Mellitus; diminishes hepatic gluconeogenesis and augments peripheral insulin sensitivity.',
    clinicalConsiderations: '• خطر هبوط السكر (Hypoglycemia) نادر كعلاج أحادي، لكنه يرتفع إذا كان المريض يتناول معه سلفونيل يوريا أو أنسولين.\n• تحديد مواعيد جلسات الأسنان في الصباح بعد تناول وجبة الإفطار وجرعة الدواء المعتادة.\n• التحقق من معدل السكر التراكمي (HbA1c): إذا كان > 8.5%، يجب استشارة الطبيب البشري وتأجيل الجراحات غير الطارئة لارتفاع خطر العدوى وتأخر الشفاء.',
    clinicalConsiderationsEn: 'Minimal monotherapy hypoglycemia risk; schedule morning appointments post-breakfast and medication. If HbA1c > 8.5%, defer elective surgical procedures due to impaired wound healing and neutrophil dysfunction.',
    drugInteractions: '• الحذر عند وصف مضادات الالتهاب غير الستيرويدية (NSAIDs) بجرعات عالية أو فترات طويلة لاحتمال التأثير على وظائف الكلى ورفع مستويات الميتفورمين.\n• لا تداخل مباشر مع المخدر الموضعي الحاوي على إبينفرين بالجرعات السنية المعتادة.',
    drugInteractionsEn: 'Prolonged NSAIDs use may diminish renal clearance; monitor hydration status. Safe with standard dental local anesthetics with vasoconstrictors.',
    standardDosage: '500 ملغ إلى 1000 ملغ مرتين إلى ثلاث مرات يومياً مع وجبات الطعام الرئيسية لتقليل الاضطرابات الهضمية.',
    standardDosageEn: '500–1000 mg orally bid or tid with meals to minimize gastrointestinal adverse effects.',
    allergyAlerts: '🚫 تحذير: موانع الاستعمال تشمل القصور الكلوي الحاد (eGFR < 30 mL/min) وخطر الحماض اللبني (Lactic Acidosis).',
    pregnancySafety: 'الفئة B (FDA Category B) - يستخدم في سكري الحمل تحت إشراف طبي متخصص.',
    pregnancySafetyEn: 'FDA Category B: Evidence suggests minimal fetal risk; coordinated obstetric oversight required.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت مراجعة الجرعات والاعتبارات السنية وفق إرشادات ADA السريرية الحديثة.',
      reviewedAt: '2026-03-05T12:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-diab-insulin',
    category: 'diabetes',
    nameEn: 'Human Insulin Regular & Glargine (Lantus / Humalog)',
    nameAr: 'أنسولين بشري ومماثلاته (لانتوس / هيومالوج)',
    scientificName: 'Recombinant Human Insulin & Analogues',
    brandNames: 'Lantus, Humalog, NovoRapid, Mixtard',
    activeIngredient: 'Insulin Glargine / Lispro / Aspart',
    indication: 'التحكم بنسبة السكر في الدم لمرضى النوع الأول من السكري والنوع الثاني المتقدم.',
    indicationEn: 'Glycemic management in Type 1 Diabetes Mellitus and insulin-requiring Type 2 Diabetes.',
    clinicalConsiderations: '⚠️ أعلى خطورة لحدوث هبوط السكر المفاجئ (Hypoglycemia) في كرسي الأسنان.\n• القاعدة الذهبية: التأكد دائماً قبل بدء الجلسة أن المريض أخذ جرعته وتناول وجبة كافية.\n• قياس سكر الدم بوخز الإصبع (Glucometer) بالعيادة قبل الإجراء الجراحي: إذا كان أقل من 70 ملغ/ديسيلتر، لا تبدأ الإجراء وأعطِ 15-20 غرام كربوهيدرات سريعة.',
    clinicalConsiderationsEn: 'Highest intraoperative risk of acute hypoglycemia. Verify meal and dose compliance; perform chairside fingerstick glucose check prior to major surgical interventions.',
    drugInteractions: '• الجرعات العالية من الإبينفرين قد ترفع سكر الدم بشكل عابر، لكن كمية 1-2 كاربول 1:100,000 آمنة ومقبولة.\n• تجنب الأسبرين بجرعات عالية لأنه قد يزيد الحساسية للأنسولين.',
    drugInteractionsEn: 'High systemic epinephrine elevates blood glucose; 1-2 cartridges (1:100,000) remain safe. High-dose salicylates potentiate hypoglycemia.',
    standardDosage: 'تحدد بدقة حسب خطة طبيب الغدد الصماء والمريض (وحدات دولية IU تحت الجلد قبل الوجبات أو قبل النوم).',
    standardDosageEn: 'Individually titrated sub-Q regimens guided by attending endocrinologist.',
    allergyAlerts: '🚫 التحذير الأكبر: أعراض هبوط السكر الحاد (تعرق بارد، رجفان، دوخة، شحوب، تشوش ذهني).',
    pregnancySafety: 'الفئة B (FDA Category B) - الأنسولين هو الخيار الذهبي الأول والأكثر أماناً لضبط السكر أثناء الحمل.',
    pregnancySafetyEn: 'FDA Category B: Gold standard for gestational and pre-gestational diabetic management.',
    status: 'published',
    warningLevel: 'high',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد بروتوكول قاعدة 15 (Rule of 15) لعلاج هبوط السكر السريري.',
      reviewedAt: '2026-03-06T14:30:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 2. HYPERTENSION & CARDIAC
  {
    id: 'drug-cardio-amlodipine',
    category: 'hypertension_cardiac',
    nameEn: 'Amlodipine 5mg - 10mg (Norvasc)',
    nameAr: 'أملوديبين (نورفاسك)',
    scientificName: 'Amlodipine Besylate (Dihydropyridine CCB)',
    brandNames: 'Norvasc, Amlor, Amlovas',
    activeIngredient: 'Amlodipine',
    indication: 'علاج ارتفاع ضغط الدم والذبحة الصدرية المزمنة المستقرة (Chronic Stable Angina).',
    indicationEn: 'Management of systemic hypertension and chronic stable coronary artery disease.',
    clinicalConsiderations: '🦷 علامة سريرية سنية فارقة: يسبب تضخم اللثة الدوائي (Drug-Induced Gingival Overgrowth / Hyperplasia) في نسبة من المرضى بعد شهور من الاستخدام.\n• تشجيع المريض على العناية الفموية الفائقة وجلسات التقليح والتنظيف الدوري كل 3 أشهر لتقليل التضخم.\n• تجنب التغيير المفاجئ لوضعية كرسي الأسنان لتفادي هبوط الضغط الانتصابي (Orthostatic Hypotension).',
    clinicalConsiderationsEn: 'Characteristic drug-induced gingival overgrowth (CCB hyperplasia). Emphasize meticulous oral hygiene and 3-month periodontal recalls. Elevate chair slowly to prevent orthostatic hypotension.',
    drugInteractions: '• آمن عموماً مع المخدر الموضعي الحاوي على إبينفرين بالجرعات المعتادة (حد أقصى 2 كبسولة 1:100,000 لمرضى القلب المنضبطين).\n• الاستخدام المطول للـ NSAIDs (> 5 أيام) قد يقلل من فعالية خافضات الضغط.',
    drugInteractionsEn: 'Compatible with standard cardiac dose epinephrine (max 0.04 mg). Chronic NSAID therapy may attenuate antihypertensive efficacy.',
    standardDosage: '5 ملغ إلى 10 ملغ فموياً مرة واحدة يومياً.',
    standardDosageEn: '5–10 mg orally once daily.',
    allergyAlerts: '⚠️ تحذير: مراقبة تورم القدمين (Peripheral Edema) والدوخة.',
    pregnancySafety: 'الفئة C (FDA Category C) - لا يفضل استخدامه أثناء الحمل وتفضل بدائل أكثر أماناً كـ Labetalol.',
    pregnancySafetyEn: 'FDA Category C: Use alternative agents (e.g., labetalol, methyldopa) during pregnancy.',
    status: 'published',
    warningLevel: 'caution',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق الاعتبار اللثوي وتنبيه وضعية الكرسي السريري.',
      reviewedAt: '2026-03-07T10:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-cardio-warfarin',
    category: 'hypertension_cardiac',
    nameEn: 'Warfarin 1mg - 5mg (Coumadin / Marevan)',
    nameAr: 'وارفارين (كومادين / ماريفان)',
    scientificName: 'Warfarin Sodium (Vitamin K Antagonist)',
    brandNames: 'Coumadin, Marevan',
    activeIngredient: 'Warfarin',
    indication: 'الوقاية من وعلاج التخثرات الوريدية العميقة، الرجفان الأذيني (AFib)، والصمامات القلبية الصناعية.',
    indicationEn: 'Anticoagulation in atrial fibrillation, mechanical prosthetic heart valves, and venous thromboembolism.',
    clinicalConsiderations: '🩸 بروتوكول القلع والجراحة السنية:\n1. فحص الـ INR خلال 24-72 ساعة قبل الإجراء الجراحي.\n2. إذا كان الـ INR بين 2.0 إلى 3.5: يمكن إجراء القلع البسيط دون إيقاف الوارفارين مع تطبيق تدابير التخثر الموضعية (خياطة محكمة + شاش مشبع بحمض الترانيكساميك Tranexamic Acid + إسفنج جيلاتيني Surgicel).\n3. لا توقف الوارفارين أبداً من تلقاء نفسك دون استشارة وتنسيق مكتوب مع طبيب القلب (خطر السكتة الدماغية والجلطة أعظم بكثير من النزف الموضعي).',
    clinicalConsiderationsEn: 'Mandatory pre-op INR check (ideal window within 24–72 hrs). Simple extractions safe at INR 2.0–3.5 with local hemostatics (Surgicel, sutures, tranexamic acid mouthwash). Never discontinue warfarin unilaterally.',
    drugInteractions: '🚫 تحذيرات حرجة:\n• يمنع تماماً وصف الـ NSAIDs (إيبوبروفين، ديكلوفيناك) مع الوارفارين لمضاعفة خطر النزف الهضمي الحاد. المسكن الآمن هو الباراسيتامول بجرعة لا تتعدى 2 غرام/يوم.\n• الميترونيدازول والإريثرومايسين يرفعان الـ INR بشكل خطير جداً عبر تثبيط استقلاب الوارفارين.',
    drugInteractionsEn: 'Absolute contraindication to systemic NSAIDs; use paracetamol (max 2 g/day). Metronidazole and macrolides markedly elevate INR via CYP2C9 inhibition.',
    standardDosage: 'جرعة يومية فردية تحدد بدقة بناءً على قراءات الـ INR المستهدفة.',
    standardDosageEn: 'Individually titrated once daily targeting INR range 2.0–3.0 (or 2.5–3.5 for mechanical mitral valves).',
    allergyAlerts: '🚫 خطر نزفي حرج: راقب النزف المستمر، الكدمات العفوية، والبول المدمى.',
    pregnancySafety: 'الفئة X (FDA Category X) - مشوه شديد للأجنة (Fetal Warfarin Syndrome) وممنوع قطعياً في الحمل.',
    pregnancySafetyEn: 'FDA Category X: Teratogenic; absolutely contraindicated during gestation.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت مطابقة معايير جمعية القلب الأمريكية والأكاديمية الأمريكية لطب الأسنان.',
      reviewedAt: '2026-03-08T11:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 3. PREGNANCY & LACTATION
  {
    id: 'drug-preg-paracetamol',
    category: 'pregnancy_lactation',
    nameEn: 'Paracetamol 500mg - 1000mg (Panadol / Acetaminophen)',
    nameAr: 'باراسيتامول (بنادول للحوامل والرضع)',
    scientificName: 'Acetaminophen / Paracetamol',
    brandNames: 'Panadol Blue, Tylenol, Adol, Calpol',
    activeIngredient: 'Paracetamol',
    indication: 'المسكن وخافض الحرارة الأول والأكثر أماناً في جميع مراحل الحمل والرضاعة الطبيعية لآلام الأسنان.',
    indicationEn: 'First-line analgesic and antipyretic of choice across all trimesters of pregnancy and during breastfeeding.',
    clinicalConsiderations: '✅ الخيار الذهبي الأول: آمن تماماً في الثلث الأول، الثاني، والثالث عند الالتزام بالجرعات العلاجية.\n• تجنب المستحضرات المركبة الحاوية على الكودايين أو الكافيين أو مضادات الاحتقان أثناء الحمل.\n• الحد الأقصى اليومي: 4000 ملغ (4 غرام) في اليوم للبالغين السليمين، ولا تتعدى 2000 ملغ في أمراض الكبد.',
    clinicalConsiderationsEn: 'Safest analgesic profile in all three trimesters. Avoid combination products containing caffeine, codeine, or decongestants. Maximum adult ceiling 4000 mg/24h.',
    drugInteractions: '• آمن مع جميع المضادات والمخدرات الموضعية المسموحة للحوامل.\n• الحذر من تراكم الجرعات مع أدوية البرد المركبة.',
    drugInteractionsEn: 'Minimal drug interactions at therapeutic doses; caution against unintentional acetaminophen compounding from OTC remedies.',
    standardDosage: '500 ملغ إلى 1000 ملغ كل 6 إلى 8 ساعات عند اللزوم (بحد أقصى 4 غرام يومياً).',
    standardDosageEn: '500–1000 mg orally q6–8h prn (maximum 4000 mg/24h).',
    allergyAlerts: '⚠️ تحذير: التسمم الكبدي الحاد عند تجاوز الجرعة القصوى المقررة.',
    pregnancySafety: 'الفئة B (FDA Category B) - متوافق بالكامل مع الرضاعة الطبيعية والأكثر توثيقاً عالمياً.',
    pregnancySafetyEn: 'FDA Category B: Extensive clinical safety documentation; fully compatible with lactation.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      pharmacistName: 'د. سارة الراوي',
      pharmacistTitle: 'PharmD, Clinical Specialist',
      notes: 'تمت إجازته كمسكن أول لحالات الحوامل والمرضعات في طب الأسنان.',
      reviewedAt: '2026-03-09T09:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-preg-amox',
    category: 'pregnancy_lactation',
    nameEn: 'Amoxicillin in Pregnancy (500mg)',
    nameAr: 'أموكسيسيلين للحوامل (أموكسيل)',
    scientificName: 'Amoxicillin Trihydrate',
    brandNames: 'Amoxil, Biomox',
    activeIngredient: 'Amoxicillin',
    indication: 'المضاد الحيوي الأول لعلاج العدوى السنية الحادة والخراجات السنية لدى المرأة الحامل والمرضع.',
    indicationEn: 'First-line antimicrobial intervention for acute odontogenic abscesses in pregnant and lactating patients.',
    clinicalConsiderations: '• يعتبر البنسلين ومشتقاته (الأموكسيسيلين) الخيار الأكثر أماناً للجنين والأم.\n• إذا كانت المريضة تعاني من حساسية البنسلين: البديل الآمن هو الكليندامايسين (Clindamycin) أو الإريثرومايسين (Erythromycin base) - تجنب Erythromycin estolate لخطر التسمم الكبدي في الحمل.\n• 🚫 تحذير قاطع: يمنع منعاً باتاً وصف التتراسيكلين (Tetracyclines / Doxycycline) في الحمل لتسببه في تصبغ الأسنان الدائم للجنين ونقص تنسج الميناء (Enamel Hypoplasia).',
    clinicalConsiderationsEn: 'Penicillin derivatives represent the safest antimicrobial class in pregnancy. If penicillin-allergic, use clindamycin. Strictly avoid tetracyclines due to irreversible fetal dentin/enamel discoloration.',
    drugInteractions: '• آمن مع الباراسيتامول والمخدر الموضعي ليدوكائين مع إبينفرين.',
    drugInteractionsEn: 'Compatible with paracetamol and lidocaine local anesthesia.',
    standardDosage: '500 ملغ كل 8 ساعات لمدة 5 أيام بعد الطعام.',
    standardDosageEn: '500 mg orally q8h for 5 days postprandially.',
    allergyAlerts: '🚫 موانع الاستعمال: حساسية البنسلين والبيتا لاكتام.',
    pregnancySafety: 'الفئة B (FDA Category B) - آمن جداً وموصى به من الكلية الأمريكية لأطباء النساء والتوليد (ACOG).',
    pregnancySafetyEn: 'FDA Category B: Recommended by ACOG; minimal risk across all gestational stages.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق محاذير التتراسيكلين وتصبغ أسنان الجنين بدقة.',
      reviewedAt: '2026-03-09T10:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 4. CONTRACEPTIVES
  {
    id: 'drug-contra-coc',
    category: 'contraceptives',
    nameEn: 'Combined Oral Contraceptives (COCs - Ethinyl Estradiol / Levonorgestrel)',
    nameAr: 'حبوب منع الحمل الفموية المركبة',
    scientificName: 'Ethinyl Estradiol + Progestin combinations',
    brandNames: 'Yasmin, Marvelon, Microgynon, Diane 35',
    activeIngredient: 'Ethinyl Estradiol / Levonorgestrel / Drospirenone',
    indication: 'منع الحمل الهرموني، تنظيم الدورة الشهرية، وعلاج حب الشباب الهرموني وتكيس المبايض.',
    indicationEn: 'Hormonal contraception, cycle regulation, and management of hyperandrogenic dermatologic disorders.',
    clinicalConsiderations: '🦷 اعتبارات طب الأسنان الحاسمة:\n1. ⚠️ خطر السنخ الجاف (Dry Socket / Fibrinolytic Alveolitis): يرتفع احتمال حدوث السنخ الجاف بعد قلع الأسنان (خاصة أرحاء العقل السفلية) بمعدل 3 إلى 5 أضعاف بسبب تحفيز الاستروجين لنشاط تحلل الخثرة الدموية.\n2. التوقيت الأمثل للقلع الجراحي: يفضل إجراء قلع الأسنان الجراحي خلال أيام عدم تناول الحبوب الفعالة (الأيام 23-28 من الدورة الهرمونية) عندما تكون مستويات الاستروجين في أدنى مستوياتها.\n3. التهاب اللثة الهرموني: مظهر متضخم واحتقاني للثة شبيه بالتهاب لثة الحمل (Pregnancy-like gingivitis).',
    clinicalConsiderationsEn: '3- to 5-fold surge in localized alveolar osteitis (Dry Socket) incidence following third molar extraction mediated by estrogen-induced fibrinolysis. Schedule surgical extractions on cycle days 23–28 (placebo phase).',
    drugInteractions: '⚠️ تداخل المضادات الحيوية والجدل الطبي:\n• المضاد الحقيقي المؤكد الذي يفشل موانع الحمل هو ريفامبيسين (Rifampin) المحفز لإنزيمات الكبد.\n• المضادات الحيوية السنية الشائعة (أموكسيسيلين، سيفالكسين) نادراً ما تؤثر، ولكن طبياً وقانونياً (Medicolegally) يجب دائماً نصح المريضة باستخدام وسيلة منع إضافية عازلة (Barrier Method) خلال فترة كورس المضاد ولمدة 7 أيام بعده.',
    drugInteractionsEn: 'Rifampin significantly reduces COC efficacy via CYP3A4 induction. For broad-spectrum dental penicillins, advise non-hormonal back-up barrier contraception during therapy and for 7 days post-treatment for medicolegal prudence.',
    standardDosage: 'حبة واحدة يومياً في نفس التوقيت بدقة وفق الدورة الشهرية.',
    standardDosageEn: '1 tablet orally daily at the same hour following menstrual cycle packaging.',
    allergyAlerts: '⚠️ مخاطر التخثر الوريدي (Thromboembolism) وارتفاع ضغط الدم لدى المدخنات فوق سن 35.',
    pregnancySafety: 'الفئة X (FDA Category X) - موانع حمل هرمونية تمنع فور الشك بالحمل.',
    pregnancySafetyEn: 'FDA Category X: Contraindicated upon conception.',
    status: 'published',
    warningLevel: 'caution',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم تدقيق نصيحة توقيت القلع الجراحي خلال الأيام 23-28 لتقليل السنخ الجاف.',
      reviewedAt: '2026-03-10T11:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 5. VIRAL HEPATITIS
  {
    id: 'drug-hep-management',
    category: 'hepatitis',
    nameEn: 'Hepatitis B & C Clinical Protocols (Tenofovir / Sofosbuvir considerations)',
    nameAr: 'بروتوكولات التهاب الكبد الفيروسي في العيادة (HBV / HCV)',
    scientificName: 'Nucleoside Reverse Transcriptase Inhibitors & Direct-Acting Antivirals',
    brandNames: 'Viread (Tenofovir), Sovaldi (Sofosbuvir), Epclusa',
    activeIngredient: 'Tenofovir Disoproxil / Sofosbuvir',
    indication: 'علاج التهاب الكبد الفيروسي المزمن من النوع B و C لتثبيط التكاثر الفيروسي وحماية الكبد.',
    indicationEn: 'Antiviral suppression of Hepatitis B and curative regimens for Hepatitis C viral infections.',
    clinicalConsiderations: '🏥 بروتوكول السلامة السريرية الشاملة في طب الأسنان:\n1. 🩸 مخاطر النزف والتخثر: الكبد هو مصنع عوامل التخثر (Factors I, II, V, VII, IX, X). قبل أي إجراء جراحي أو قلع، اطلب تحليل زمن البروثرومبين (PT/INR) وتعداد الصفيحات (Platelet Count).\n2. استقلاب الأدوية المخدرة: أدوية التخدير الموضعي الأميدية (Lidocaine, Mepivacaine, Bupivacaine) يتم استقلابها كبدياً. في مرضى القصور الكبدي المتقدم، خفّض الجرعة القصوى للنصف أو استخدم أرتيكائين (Articaine) لأنه يستقلب بنسبة 90-95% في بلازما الدم.\n3. تجنب التسمم الدوائي: خفض جرعة الباراسيتامول إلى حد أقصى 2 غرام/يوم أو تجنبه في التليف المتقدم، وتجنب الأسبرين والـ NSAIDs لخطر القرحات النزفية.\n4. مكافحة العدوى: الالتزام الصارم باحتياطات العزل القياسية، وتطهير الأسطح، والتحصين باللقاح لجميع أفراد الفريق الطبي.',
    clinicalConsiderationsEn: 'Impaired synthesis of coagulation factors; mandate PT/INR and platelet testing prior to surgery. Amide local anesthetics metabolized hepatically; consider Articaine (plasma esterase clearance). Restrict paracetamol to max 2 g/day; avoid NSAIDs.',
    drugInteractions: '• الحذر الشديد من الأدوية السامة للكبد كالإريثرومايسين والكيتوكونازول والمهدئات الجهازية.\n• تداخلات مضادات الفيروسات المباشرة (DAAs) مع بعض الأدوية الاستقلابية عبر CYP3A4.',
    drugInteractionsEn: 'Hepatotoxic drug avoidance (macrolides, azoles, sedative hypnotics). Exercise caution with agents competing for hepatic microsomal enzymes.',
    standardDosage: 'تدار وفق بروتوكولات استشاري الجهاز الهضمي والكبد.',
    standardDosageEn: 'Strictly coordinated under hepatologist supervision.',
    allergyAlerts: '🚫 خطر نزفي وانتقال العدوى عبر الوخز بالإبر (Needle-stick injury protocols).',
    pregnancySafety: 'الفئة B/C حسب نوع الدواء المضاد للفيروسات وتوجيهات أخصائي الكبد.',
    pregnancySafetyEn: 'Category B/C variable by agent; specialist clearance essential.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد تفضيل الأرتيكائين للاستقلاب البلازمي وتقليل العبء الكبدي.',
      reviewedAt: '2026-03-10T14:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 6. ANALGESICS
  {
    id: 'drug-analg-tramadol',
    category: 'analgesics',
    nameEn: 'Tramadol 50mg (Ultram / Tramal)',
    nameAr: 'ترامادول 50 ملغ (أوبيويد متوسط المفعول)',
    scientificName: 'Tramadol Hydrochloride (Centrally Acting Opioid)',
    brandNames: 'Tramal, Ultram, Zydol',
    activeIngredient: 'Tramadol HCl',
    indication: 'السيطرة على الألم السني الشديد الحاد بعد الجراحات العظمية المعقدة عند فشل أو وجود موانع للـ NSAIDs.',
    indicationEn: 'Management of moderate-to-severe acute post-surgical dental pain refractory to non-opioid analgesics.',
    clinicalConsiderations: '⚠️ أفيوني المفعول بوصفة مراقبة مشددة (Controlled Substance).\n• خطر النعاس، الدوار، تثبيط التنفس، والغثيان والقيء.\n• يمنع قيادة السيارة أو تشغيل الآلات أثناء تناوله.\n• خطر الإدمان والاعتياد عند الاستخدام لأكثر من 3 أيام.\n• يقلل عتبة التشنجات والصرع (Seizure threshold)؛ تجنبه لمرضى الصرع.',
    clinicalConsiderationsEn: 'Centrally acting synthetic opioid; low abuse potential short-term, but lowers seizure threshold. Caution in epilepsy; causes dizziness, nausea, and CNS sedation. Advise against driving.',
    drugInteractions: '🚫 تداخل خطير جداً: متلازمة السيروتونين (Serotonin Syndrome) عند مشاركته مع مضادات الاكتئاب (SSRIs / SNRIs / MAOIs).\n• تجنب المهدئات ومضادات الهيستامين المثبطة لزيادة خطر تثبيط التنفس.',
    drugInteractionsEn: 'Severe risk of Serotonin Syndrome with SSRIs/SNRIs. Compounding CNS depression with concurrent sedatives, alcohol, or antihistamines.',
    standardDosage: '50 ملغ فموياً كل 6 إلى 8 ساعات عند اللزوم للألم الشديد (الحد الأقصى 400 ملغ يومياً) لأقصر فترة ممكنة (2-3 أيام).',
    standardDosageEn: '50 mg orally q6–8h prn severe pain (max 400 mg/24h) for a short course (< 3 days).',
    allergyAlerts: '🚫 موانع الاستعمال: مرضى الصرع غير المسيطر عليه، التثبيط التنفسي، وحساسية الأفيونات.',
    pregnancySafety: 'الفئة C (FDA Category C) - لا ينصح به في الحمل والرضاعة لاحتمال متلازمة السحب الوليدي.',
    pregnancySafetyEn: 'FDA Category C: Potential neonatal withdrawal symptoms; avoid during lactation.',
    status: 'published',
    warningLevel: 'high',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت إضافة تحذير خفض عتبة الصرع ومتلازمة السيروتونين بدقة.',
      reviewedAt: '2026-03-11T11:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 7. ANTI-INFLAMMATORY
  {
    id: 'drug-nsaid-ibuprofen',
    category: 'anti_inflammatory',
    nameEn: 'Ibuprofen 400mg - 600mg (Brufen / Advil)',
    nameAr: 'إيبوبروفين 400 - 600 ملغ (بروفين)',
    scientificName: 'Ibuprofen (Non-Selective NSAID)',
    brandNames: 'Brufen, Advil, Motrin, Profen',
    activeIngredient: 'Ibuprofen',
    indication: 'الخيار السريري الأول والذهبي لعلاج آلام اللب السني (Pulpitis)، الألم الالتهابي، وما بعد قلع الأسنان.',
    indicationEn: 'First-line benchmark NSAID for acute odontogenic inflammatory pain, symptomatic irreversible pulpitis, and post-extraction discomfort.',
    clinicalConsiderations: '⭐ المعيار الذهبي لألم الأسنان: يثبط إنزيمات الأكسدة الحلقية (COX-1 & COX-2) ويقلل تكوّن البروستاغلاندين في اللب والعظم.\n• يجب تناوله دائماً بعد الطعام أو مع كوب حليب لحماية الغشاء المخاطي للمعدة.\n• الحذر في مرضى قرحة المعدة، القصور الكلوي، والربو القصبي الحساس للأسبرين (Aspirin-Exacerbated Respiratory Disease).\n• المشاركة الذهبية مع الباراسيتامول: إيبوبروفين 400 ملغ + باراسيتامول 1000 ملغ بالتناوب يعطي تسكيناً مكافئاً أو متفوقاً على الأفيونات.',
    clinicalConsiderationsEn: 'Gold-standard analgesic in dentistry. Suppresses pulpal prostaglandins. Always prescribe postprandially. Staggered co-administration with paracetamol (400 mg ibuprofen + 1000 mg paracetamol) rivals opioid efficacy with superior safety.',
    drugInteractions: '• يقلل فعالية أدوية الضغط (ACE inhibitors & Diuretics).\n• يزيد تركيز الليثيوم والميثوتريكسات في الدم.\n• يمنع مع الوارفارين ومضادات التخثر لمضاعفة خطر النزف الهضمي.',
    drugInteractionsEn: 'Attenuates antihypertensive efficacy of ACE-inhibitors and beta-blockers. Increases serum lithium. Potentiates bleeding with antiplatelets/anticoagulants.',
    standardDosage: 'البالغين: 400 ملغ إلى 600 ملغ كل 6 إلى 8 ساعات بعد الوجبات (الحد الأقصى 2400 ملغ/يوم). الأطفال: 5-10 ملغ/كجم كل 6-8 ساعات.',
    standardDosageEn: 'Adults: 400–600 mg orally q6–8h pc (max 2400 mg/day). Pediatric: 5–10 mg/kg q6–8h.',
    allergyAlerts: '🚫 موانع الاستعمال: القرحة الهضمية النشطة، حساسية الأسبرين والـ NSAIDs، والقصور الكلوي الشديد.',
    pregnancySafety: 'الفئة D في الثلث الثالث من الحمل (يمنع قطعياً لخطر الإغلاق المبكر للقناة الشريانية للجنين Premature Closure of Ductus Arteriosus).',
    pregnancySafetyEn: 'FDA Category D in third trimester: Contraindicated due to premature ductus arteriosus closure and oligohydramnios.',
    status: 'published',
    warningLevel: 'caution',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت إجازة بروتوكول المشاركة التناوبية مع الباراسيتامول كمعيار معتمد عالمياً.',
      reviewedAt: '2026-03-11T15:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-nsaid-dexa',
    category: 'anti_inflammatory',
    nameEn: 'Dexamethasone 4mg - 8mg (Decadron)',
    nameAr: 'ديكساميثازون (كورتيكوستيرويد قوي مضاد للوذمة)',
    scientificName: 'Dexamethasone Sodium Phosphate',
    brandNames: 'Decadron, Fortecortin',
    activeIngredient: 'Dexamethasone',
    indication: 'الوقاية من الوذمة الشديدة (Edema)، الكدمات، وصعوبة فتح الفم (Trismus) بعد جراحات قلع الأرحاء المنطمرة المعقدة.',
    indicationEn: 'Pre-emptive suppression of facial edema, inflammatory trismus, and post-surgical pain following impacted mandibular third molar surgery.',
    clinicalConsiderations: '• يعطى كجرعة وقائية قبل الجراحة بنصف ساعة (4 إلى 8 ملغ فموياً أو حقناً موضعي في العضلة أو تحت المخاطية).\n• قصير الأمد (جرعة واحدة أو جرعتين كحد أقصى) لتجنب التثبيط الكظري (Adrenal suppression).\n• الحذر لدى مرضى السكري: يسبب ارتفاعاً حاداً ومؤقتاً في سكر الدم لعدة ساعات.',
    clinicalConsiderationsEn: 'Administer 4–8 mg pre-operatively (orally or submucosal infiltration) to mitigate peak post-op inflammatory swelling. Elevates capillary glucose transiently in diabetics.',
    drugInteractions: '• تجنب دمجه بالتزامن مع الـ NSAIDs بجرعات عالية لتجنب تقرح المعدة.',
    drugInteractionsEn: 'Concurrent NSAID use elevates gastrointestinal mucosal ulceration risks.',
    standardDosage: '4 ملغ إلى 8 ملغ جرعة واحدة قبل الجراحة بـ 30-45 دقيقة (أو 4 ملغ صبيحة اليوم التالي عند الضرورة القصوى).',
    standardDosageEn: '4–8 mg single dose 30–45 min pre-operatively (optional 4 mg single repeat next morning).',
    allergyAlerts: '🚫 موانع الاستعمال: العدوى الفطرية الجهازية، الهربس العيني النشط، والسكري غير المنضبط.',
    pregnancySafety: 'الفئة C (FDA Category C) - يستخدم بحذر شديد وللضرورة القصوى تحت إشراف طبي.',
    pregnancySafetyEn: 'FDA Category C: Use only if anticipated benefit outweighs potential fetal risk.',
    status: 'published',
    warningLevel: 'caution',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق بروتوكول الحقن تحت المخاطي المعتمد لجراحة الفم والفكين.',
      reviewedAt: '2026-03-12T09:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 8. EPILEPSY
  {
    id: 'drug-epi-phenytoin',
    category: 'epilepsy',
    nameEn: 'Phenytoin 100mg (Epanutin / Dilantin)',
    nameAr: 'فينيتوين (إيبانوتين / ديلانتين)',
    scientificName: 'Phenytoin Sodium (Hydantoin Anticonvulsant)',
    brandNames: 'Epanutin, Dilantin',
    activeIngredient: 'Phenytoin',
    indication: 'التحكم في النوبات التشنجية الصرعية المعممة والنوبات الجزئية.',
    indicationEn: 'Control of generalized tonic-clonic and psychomotor partial epileptic seizures.',
    clinicalConsiderations: '🦷 علامة سريرية كلاسيكية فارقة في طب الأسنان:\n1. تضخم اللثة الدوائي (Phenytoin-Induced Gingival Enlargement): يحدث لدى 50% من المرضى خلال الشهور الأولى، ويكون ليفياً صلباً وغير مؤلم في المناطق الأمامية بين السنية أولاً.\n2. النظافة الفموية الصارمة والتقليح المنتظم يقلل من شدة التضخم بنسبة ملحوظة.\n3. قد يستدعي الأمر جراحة استئصال اللثة (Gingivectomy) المتكررة عند إعاقة المضغ أو الناحية الجمالية.\n4. الحذر من التوتر أثناء الجلسة لتجنب تحفيز نوبة صرع في العيادة.',
    clinicalConsiderationsEn: 'Gingival fibrotic hyperplasia manifests in ~50% of patients. Frequent scaling and meticulous plaque control substantially decrease fibrotic severity. Surgical gingivectomy may be indicated for pseudo-pockets. Avoid flashing dental operatory lights.',
    drugInteractions: '⚠️ تداخلات متعددة:\n• الفلونكونازول والميكونازول والميترونيدازول يرفعون مستويات الفينيتوين في الدم لمستويات سامة.\n• الفينيتوين يقلل من فعالية الكورتيكوستيرويدات وموانع الحمل الفموية.',
    drugInteractionsEn: 'Azole antifungals and metronidazole inhibit phenytoin metabolism, triggering acute ataxia and nystagmus. Phenytoin induces hepatic enzymes, reducing corticosteroid efficacy.',
    standardDosage: 'تحدد بدقة حسب المعايرة الدموية من قبل طبيب الأعصاب (100 ملغ إلى 300 ملغ يومياً).',
    standardDosageEn: 'Individually calibrated by attending neurologist (100–300 mg/day targeting serum level 10–20 mcg/mL).',
    allergyAlerts: '⚠️ علامات التسمم الدوائي: ترنح المشية (Ataxia)، رأرأة العين (Nystagmus)، وثقل الكلام.',
    pregnancySafety: 'الفئة D (FDA Category D) - يسبب متلازمة الهيدانتوين الجنينية (Fetal Hydantoin Syndrome) وشق الشفة وشراع الحنك.',
    pregnancySafetyEn: 'FDA Category D: High teratogenic liability (fetal hydantoin syndrome and cleft palate).',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تمت مراجعة التدابير اللثوية ومحاذير تداخلات الميترونيدازول بدقة.',
      reviewedAt: '2026-03-12T13:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-epi-tegretol',
    category: 'epilepsy',
    nameEn: 'Carbamazepine 200mg (Tegretol)',
    nameAr: 'كاربامازيبين (تيجريتول لعصب الوجه الثلاثي)',
    scientificName: 'Carbamazepine (Iminostilbene Anticonvulsant)',
    brandNames: 'Tegretol, Carbatrol',
    activeIngredient: 'Carbamazepine',
    indication: '1. الخط الدوائي الأول لعلاج ألم عصب ثلاثي التوائم (Trigeminal Neuralgia / Tic Douloureux).\n2. التحكم بنوبات الصرع الجزئية.',
    indicationEn: 'First-line medical therapy for Trigeminal Neuralgia (Tic Douloureux) and control of partial seizures.',
    clinicalConsiderations: '⭐ أهمية كبرى لأطباء الأسنان: ألم عصب ثلاثي التوائم غالباً ما يشخص خطأ كألم سنّي حاد ويؤدي لقلع أسنان سليمة دون داعٍ! الاستجابة للتيجريتول تؤكد التشخيص السريري.\n• مراقبة تعداد الدم الكامل (CBC) لاحتمال حدوث تثبيط نقي العظم ونقص الكريات البيض (Aplastic Anemia / Agranulocytosis).\n• قد يسبب جفاف الفم (Xerostomia) والتهاب اللسان وتقرحات فموية.',
    clinicalConsiderationsEn: 'Diagnostic differentiator for Trigeminal Neuralgia (prevents erroneous endodontic/surgical extraction of intact teeth). Monitor CBC for rare bone marrow suppression/agranulocytosis. Causes xerostomia and stomatitis.',
    drugInteractions: '🚫 تداخل خطير: يمنع وصف الإريثرومايسين والكلاريثرومايسين معه لأنهما يرفعان تركيز التيجريتول لدرجات سامة جداً.',
    drugInteractionsEn: 'Erythromycin and clarithromycin dramatically elevate carbamazepine serum levels via CYP3A4 inhibition; avoid combination.',
    standardDosage: 'ألم عصب ثلاثي التوائم: البدء بـ 100 ملغ إلى 200 ملغ مرتين يومياً، ثم زيادة الجرعة تدريجياً حتى السيطرة على الألم (الجرعة المعتادة 400-800 ملغ/يوم).',
    standardDosageEn: 'Trigeminal Neuralgia: initiate 100–200 mg bid; titrate upward by 200 mg/day until pain relief achieved (usual maintenance 400–800 mg/day).',
    allergyAlerts: '⚠️ متلازمة ستيفنز جونسون (Stevens-Johnson Syndrome) والطفح الجلدي الشديد خاصة لحاملي جين HLA-B*1502.',
    pregnancySafety: 'الفئة D (FDA Category D) - تشوهات الأنبوب العصبي وشق الحنك الجنيني.',
    pregnancySafetyEn: 'FDA Category D: Neural tube defects and craniofacial anomalies.',
    status: 'published',
    warningLevel: 'high',
    isFree: false,
    clinicalReview: {
      status: 'verified',
      notes: 'تم توثيق التفريق السريري لألم عصب الوجه لمنع خلع الأسنان السليمة خطأً.',
      reviewedAt: '2026-03-13T10:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 9. ANTIBIOTICS
  {
    id: 'drug-amox-500',
    category: 'antibiotics',
    nameEn: 'Amoxicillin 500mg',
    nameAr: 'أموكسيسيلين 500 ملغ (Amoxil)',
    scientificName: 'Amoxicillin Trihydrate',
    brandNames: 'Amoxil, Biomox, Ospamox',
    activeIngredient: 'Amoxicillin',
    indication: 'الخيار الأول للخراج السني الحاد مع انتشار جهازي (ورم حاد، حمى، تضخم العقد اللمفاوية)',
    indicationEn: 'First-line empirical therapy for acute odontogenic infections with systemic dissemination (facial cellulitis, pyrexia, regional lymphadenopathy).',
    clinicalConsiderations: '• لا يوصف لالتهاب اللب الموضعي البسيط دون أعراض جهازية أو انتشار خراجي.\n• يجب حث المريض على إنهاء الكورس كاملاً حتى لو اختفت الأعراض لمنع المقاومة البكتيرية.\n• متوافق ومثالي للوقاية من التهاب الشغاف الجرثومي (Infective Endocarditis Prophylaxis): جرعة مفردة 2 غرام فموياً قبل الإجراء بـ 30-60 دقيقة.',
    clinicalConsiderationsEn: 'Not indicated for localized pulpitis without systemic involvement. Mandate full course completion. Standard agent for infective endocarditis prophylaxis (2 g single dose 30–60 min pre-procedure).',
    drugInteractions: '• يقلل فعالية موانع الحمل الفموية نسبياً؛ يوصى باستخدام وسيلة إضافية عازلة.\n• يمنع لمرضى حساسية البنسلين.',
    drugInteractionsEn: 'Advise non-hormonal barrier contraception. Strict contraindication in beta-lactam hypersensitivity.',
    standardDosage: 'البالغين: كبسولة واحدة (500 ملغ) كل 8 ساعات لمدة 5 أيام بعد الطعام. الأطفال: 20-40 ملغ/كجم/يوم مقسمة على 3 جرعات.',
    standardDosageEn: 'Adults: 500 mg orally q8h for 5 days postprandially. Pediatric: 20–40 mg/kg/day divided tid.',
    allergyAlerts: '🚫 تحذير شديد: يمنع نهائياً لمرضى حساسية البنسلين (Penicillin Allergy). البديل: Clindamycin.',
    pregnancySafety: 'الفئة B (FDA Category B) - يعتبر الخيار الأكثر أماناً أثناء الحمل والرضاعة.',
    pregnancySafetyEn: 'FDA Category B: Well-documented safety profile during pregnancy and active lactation.',
    status: 'published',
    warningLevel: 'caution',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم التحقق من جرعة الوقاية من التهاب الشغاف (2 غرام قبل 60 دقيقة).',
      reviewedAt: '2026-03-13T14:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },

  // 10. EMERGENCY
  {
    id: 'drug-emerg-adrenaline',
    category: 'emergency',
    nameEn: 'Epinephrine Auto-Injector 0.3mg (EpiPen / Adrenaline IM)',
    nameAr: 'إبينفرين / أدرينالين للحقن العضلي (إيبي بن للطوارئ)',
    scientificName: 'Epinephrine (Adrenaline) 1:1,000 (1mg/mL)',
    brandNames: 'EpiPen, Jext, Adrenaclick',
    activeIngredient: 'Epinephrine',
    indication: 'العلاج الإنعاشي الأول والمنقذ للحياة لصدمة الحساسية المفرطة الحادة (Anaphylaxis) في عيادة الأسنان بعد حقن المخدر أو الأدوية.',
    indicationEn: 'First-line lifesaving resuscitation for acute systemic anaphylaxis and severe laryngeal edema.',
    clinicalConsiderations: '🚨 طوارئ قصوى: الأعراض تشمل ضيق التنفس الشديد، صفير الصدر، هبوط الضغط الحاد، وذمة الوجه واللسان والحنجرة، وطفح شروي.\n• مكان الحقن الإلزامي: في الجزء الأمامي الوحشي من الفخذ (Anterolateral Thigh - Vastus Lateralis muscle) لاختراقه السريع للدم.\n• لا تتردد أبداً في الحقن الفوري ثم استدعاء الإسعاف فوراً (Call 911 / EMS).\n• يمكن تكرار الجرعة بعد 5-15 دقيقة إذا لم تستجب الأعراض.',
    clinicalConsiderationsEn: 'Immediate intramuscular injection into mid-anterolateral thigh (vastus lateralis). Never inject IV in conscious anaphylaxis. Call EMS immediately. Repeat in 5–15 min if refractory.',
    drugInteractions: '• في صدمة الحساسية المهددة للحياة، لا توجد أي موانع مطلقة (Absolute Contraindications) لاستخدام الإبينفرين.',
    drugInteractionsEn: 'No absolute contraindications in life-threatening anaphylactic emergency.',
    standardDosage: 'البالغين: 0.3 ملغ حقناً عضلياً (1:1000). الأطفال (15-30 كجم): 0.15 ملغ (EpiPen Jr).',
    standardDosageEn: 'Adults: 0.3 mg IM (1:1,000). Pediatrics (15–30 kg): 0.15 mg IM (EpiPen Jr).',
    allergyAlerts: '🚨 دواء إنقاذ حياة فوري ولا يؤجل ثانية واحدة عند الشك بالصدمة التأقية.',
    pregnancySafety: 'الفئة C (FDA Category C) - يستخدم فوراً لإنقاذ حياة الأم لأن نقص الأكسجين أخطر على الجنين.',
    pregnancySafetyEn: 'FDA Category C: Mandatory emergency use to preserve maternal and fetal oxygenation.',
    status: 'published',
    warningLevel: 'high',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم تدقيق تقنية الحقن العضلي في الفخذ الوحشي كمعيار إلزامي لسرعة الامتصاص.',
      reviewedAt: '2026-03-14T10:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'drug-emerg-glucose',
    category: 'emergency',
    nameEn: 'Oral Fast-Acting Glucose 15g - 20g (HypoStop Gel / Juice)',
    nameAr: 'جلوكوز فموي سريع 15 - 20 غرام (جل سكري / عصير مركز)',
    scientificName: 'Dextrose / Fast-Acting Monosaccharide',
    brandNames: 'HypoStop, GlucoGel, Dextrogel',
    activeIngredient: 'Dextrose / Glucose',
    indication: 'هبوط السكر الحاد في الدم (Hypoglycemia < 70 mg/dL) لدى مريض السكري الواعي في العيادة.',
    indicationEn: 'Acute symptomatic hypoglycemia in conscious dental patients presenting with tremors, cold sweating, or tachycardia.',
    clinicalConsiderations: '• قاعدة الـ 15 الذهبية (Rule of 15):\n1. إعطاء 15-20 غرام جلوكوز سريع (نصف كوب عصير محلى أو جل سكري فموي).\n2. الانتظار 15 دقيقة ثم إعادة فحص السكر بالوخز.\n3. إذا استمر < 70 ملغ/ديسيلتر، كرر الجرعة.\n• ⚠️ تحذير شديد: يمنع إعطاء أي شيء فموياً إذا فقد المريض الوعي لخطر الشردقة والاختناق (Aspiration).',
    clinicalConsiderationsEn: 'Rule of 15: Administer 15–20 g fast-acting carbohydrates orally; retest glucose in 15 min. Never give oral fluids to unconscious patient.',
    drugInteractions: '• آمن ومتوافق.',
    drugInteractionsEn: 'Physiologic carbohydrate rescue; universally compatible.',
    standardDosage: '15 إلى 20 غرام كربوهيدرات سريعة الامتصاص فموياً.',
    standardDosageEn: '15–20 g oral fast-acting glucose.',
    allergyAlerts: '🚫 ممنوع فموياً للمريض فاقد الوعي (استخدم الجلوكاجون أو المحاليل الوريدية).',
    pregnancySafety: '✅ آمن تماماً وطبيعي.',
    pregnancySafetyEn: 'Physiologic rescue; safe across pregnancy and lactation.',
    status: 'published',
    warningLevel: 'safe',
    isFree: true,
    clinicalReview: {
      status: 'verified',
      notes: 'تم اعتماد قاعدة 15 السريرية وتنبيه المريض فاقد الوعي.',
      reviewedAt: '2026-03-14T11:00:00.000Z',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
];

const LOCAL_STORAGE_DRUGS_KEY = 'dental_prescription_drugs_catalog_v2';
const LOCAL_STORAGE_CONFIG_KEY = 'dental_prescription_guide_config_v2';
const LOCAL_STORAGE_CATEGORIES_KEY = 'dental_prescription_categories_v2';

/**
 * Retrieve cached categories
 */
export function getLocalCachedCategories(): DrugCategoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing default categories if any
        const existingIds = new Set(parsed.map((c: DrugCategoryItem) => c.id));
        const missing = DEFAULT_PRESCRIPTION_CATEGORIES.filter((c) => !existingIds.has(c.id));
        return [...parsed, ...missing].sort((a, b) => (a.order || 99) - (b.order || 99));
      }
    }
  } catch (err) {
    console.warn('Error reading cached categories:', err);
  }
  return DEFAULT_PRESCRIPTION_CATEGORIES;
}

export function saveLocalCachedCategories(categories: DrugCategoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.warn('Error saving categories locally:', err);
  }
}

/**
 * Retrieve cached drugs from LocalStorage
 */
export function getLocalCachedPrescriptionDrugs(): PrescriptionDrug[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRUGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.map((d: any) => ({
          ...d,
          clinicalConsiderations: d.clinicalConsiderations || d.adminNotes || 'مراعاة التاريخ المرضي والجرعات السريرية.',
          drugInteractions: d.drugInteractions || d.contraindications || 'التحقق من التداخلات مع المخدر الموضعي والمسكنات.',
          allergyAlerts: d.allergyAlerts || 'لا توجد موانع خاصة.',
          pregnancySafety: d.pregnancySafety || 'استشارة الطبيب عند الحاجة.',
          indication: d.indication || '',
          standardDosage: d.standardDosage || '',
        }));
        // Merge missing default drugs by id to ensure rich seed content is always available
        const existingIds = new Set(sanitized.map((d: PrescriptionDrug) => d.id));
        const missing = DEFAULT_PRESCRIPTION_DRUGS.filter((d) => !existingIds.has(d.id));
        return [...sanitized, ...missing];
      }
    }
  } catch (err) {
    console.warn('Error reading cached prescription drugs:', err);
  }
  return DEFAULT_PRESCRIPTION_DRUGS;
}

/**
 * Persist cached drugs to LocalStorage
 */
export function saveLocalCachedPrescriptionDrugs(drugs: PrescriptionDrug[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_DRUGS_KEY, JSON.stringify(drugs));
  } catch (err) {
    console.warn('Error caching prescription drugs locally:', err);
  }
}

/**
 * Retrieve local cached config for guide visibility & categories
 */
export function getLocalCachedGuideConfig(): PrescriptionGuideConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    isGuidePublic: false,
    isGuideHidden: false,
    categoriesConfig: {},
    customCategories: [],
  };
}

/**
 * Persist local cached config
 */
export function saveLocalCachedGuideConfig(config: PrescriptionGuideConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}
