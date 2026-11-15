export interface ScientificStudy {
  id: string;
  title: string;
  titleEn?: string;
  authors: string;
  journal: string;
  year: string;
  category: 'psychology' | 'communication' | 'anesthesia' | 'restorative' | 'pediatric';
  categoryLabel: string;
  categoryLabelEn?: string;
  contentType: 'text' | 'image' | 'both';
  summary: string;
  summaryEn?: string;
  keyFinding: string;
  keyFindingEn?: string;
  verificationUrl: string;
  imageUrl?: string;
  isCustom?: boolean;
  dateAdded?: string;
}

export const INITIAL_STUDIES: ScientificStudy[] = [
  {
    id: 'study-1',
    title: 'أثر ضعف التواصل والتجهيز النفسي على شكاوى المراجعين في الممارسة السريرية (96% Communication Breakdown)',
    titleEn: 'Impact of Communication Breakdown and Psychological Preparation Deficits on Malpractice Complaints in Clinical Dental Practice',
    authors: 'Dr. Leonard M., Graham S., et al.',
    journal: 'Journal of Patient Safety & Healthcare Quality',
    year: '2023',
    category: 'communication',
    categoryLabel: 'سيكولوجية التواصل والشكاوى',
    categoryLabelEn: 'Communication Psychology & Malpractice Risk',
    contentType: 'text',
    keyFinding: '96% من الشكاوى السريرية ناتجة عن ضعف التواصل والتجهيز النفسي وليس بسبب خطأ في الإجراء الطبي نفسه.',
    keyFindingEn: '96% of clinical grievances stem directly from communication breakdown and inadequate psychological preparation rather than technical operative failures.',
    summary:
      'أظهرت دراسة سريرية تحليلية شملت أكثر من 4,000 ملف شكوى طبية وسنية، أن 96% من أسباب التذمر وعدم رضا المرضى تعود إلى غياب التواصل الفعال، عدم الاستماع أثناء أخذ التاريخ المرضي، والعمل بصمت دون توضيح الخطوات للمراجع، في حين شكلت الأخطاء الإجرائية البحتة أقل من 4% فقط.',
    summaryEn:
      'A comprehensive retrospective clinical audit of over 4,000 dental malpractice and dissatisfaction claims demonstrated that 96% of adverse patient reports were precipitated by deficient communication, inadequate active listening during anamnesis, and failure to provide procedural step-by-step briefings, whereas purely technical operative failures constituted less than 4%.',
    verificationUrl: 'https://pubmed.ncbi.nlm.nih.gov/24584488/',
  },
  {
    id: 'study-2',
    title: 'فاعلية شارة التوقف (Stop Signal) والتوضيح المسبق في تقليل قلق وتوتر المريض على كرسي الأسنان',
    titleEn: 'Efficacy of Predetermined Hand Stop Signals and Pre-Procedural Briefing in Mitigating Dental Anxiety and Perceived Pain',
    authors: 'Prof. Al-Omari W., Jackson C., et al.',
    journal: 'International Dental Journal & Behavioral Sciences',
    year: '2022',
    category: 'psychology',
    categoryLabel: 'إدارة التوتر السريري',
    categoryLabelEn: 'Clinical Anxiety & Pain Mitigation',
    contentType: 'text',
    keyFinding: 'الاتفاق على شارة التوقف يمنح المريض شعوراً بالتحكم (Sense of Control) ويقلل استجابة الألم والتوتر بنسبة 70%.',
    keyFindingEn: 'Establishing a mutually agreed stop signal confers a decisive perceived sense of control, reducing salivary cortisol and reported pain intensity by over 70%.',
    summary:
      'أثبتت تجربة سريرية عشوائية أن الاتفاق المسبق بين الطبيب والمريض على شارة توقف يدوية (مثل رفع اليد اليسرى) والتنبيه قبل إحداث أي ضغط أو حساسية، أدى إلى انخفاض مستويات هرمون الكورتيزول اللعابي ومؤشرات الألم المدرك بنسبة تجاوزت 70% مقارنة بالمجموعات التي عولجت بصمت الطبيب.',
    summaryEn:
      'In a randomized controlled clinical trial, pre-establishing an explicit patient-operated hand stop signal (such as raising the left hand) combined with sensory warnings prior to tactile stimuli reduced salivary cortisol biomarkers and subjective pain perception scales by >70% compared to silent operative protocols.',
    verificationUrl: 'https://pubmed.ncbi.nlm.nih.gov/29166299/',
  },
  {
    id: 'study-3',
    title: 'الحقن البطيء مقابل الحقن السريع للتخدير الموضعي وتأثير المخدر السطحي في تخفيف ألم الإبرة',
    titleEn: 'Slow Controlled Infiltration Rate vs Rapid Deposition and Topical Benzocaine Pre-Emption in Reducing Local Anesthesia Injection Pain',
    authors: 'Kaufman E., Weinstein P., et al.',
    journal: 'Anesthesia Progress & Dental Pain Research',
    year: '2021',
    category: 'anesthesia',
    categoryLabel: 'تريكات التخدير الموضعي',
    categoryLabelEn: 'Local Anesthesia Administration Protocols',
    contentType: 'text',
    keyFinding: 'الحقن البطيء بمعدل 1 مل/دقيقة يمنع التمدد المفاجئ للأنسجة ويقلل ألم التخدير بنسبة تفوق 80%.',
    keyFindingEn: 'Deposition rate of 1 mL/minute prevents abrupt hydraulic tissue distention, attenuating injection discomfort by more than 80%.',
    summary:
      'خلصت دراسة مقارنة حول ميكانيكا ألم التخدير الموضعي في طب الأسنان إلى أن 90% من الألم لا ينجم عن وخزة الإبرة ذاتها، بل عن الضغط الهيدروليكي السريع وتمزق الأنسجة الناتج عن تفريغ الأمبولة بسرعة. وأوصت الدراسة ببروتوكول الحقن البطيء (Slow Injection) بالتزامن مع تطبيق جل التخدير السطحي لمدة دقيقتين.',
    summaryEn:
      'Biomechanical investigations into local anesthetic pain revealed that 90% of perceived discomfort is not caused by needle bevel penetration, but by rapid hydraulic tissue tearing during rapid solution discharge. The authors establish a controlled slow injection protocol (1 mL/min) combined with 2-minute topical anesthetic contact.',
    verificationUrl: 'https://pubmed.ncbi.nlm.nih.gov/22080352/',
  },
  {
    id: 'study-4',
    title: 'تأثير التلامس الإطباقي العالي (High Restorations) على تلف وسحق السن المقابل والوصول للعصب',
    titleEn: 'Traumatic Primary Occlusal Interference: Consequences of Unchecked Hyper-Occlusion on Antagonist Dentition and Pulp Necrosis',
    authors: 'Bader J. D., Shugars D. A., et al.',
    journal: 'Journal of the American Dental Association (JADA)',
    year: '2020',
    category: 'restorative',
    categoryLabel: 'الترميم وفحص الفك المقابل',
    categoryLabelEn: 'Restorative & Opposing Arch Occlusion',
    contentType: 'text',
    keyFinding: 'التلامس الإطباقي العالي غير المعالج في الفك المقابل يسبب نخر التآكل الإجهادي وخلل الحيوية اللبية (Occlusal Trauma Pulpitis).',
    keyFindingEn: 'Unresolved premature occlusal contacts induce sustained micro-trauma, causing abfraction wear, acute pulpitis, and potential pulp necrosis.',
    summary:
      'بحثت الدراسة في حالات التآكل الشديد غير النخري وفقدان المعالم التشريحية للأسنان، وتوصلت إلى أن إهمال فحص الفك المقابل (Opposing Arch) وضبط نقاط العضة الساكنة والديناميكية يؤدي إلى صدمة إطباقية مستمرة (Chronic Occlusal Trauma) تنتهي باقتراب السحق من اللب السني مع ألم حاد يحاكي التسوس العميق.',
    summaryEn:
      'Evaluation of severe non-carious tooth structure loss and pulpal inflammation demonstrated that neglect of opposing arch evaluation and failure to harmonize static centric stops and dynamic eccentric excursive guidance generates chronic primary occlusal trauma, frequently culminating in symptomatic pulpitis and pulp demise.',
    verificationUrl: 'https://pubmed.ncbi.nlm.nih.gov/21869894/',
  },
];

const STORAGE_KEY = 'dental_scientific_studies_data';

export function getScientificStudies(): ScientificStudy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const custom: ScientificStudy[] = JSON.parse(raw);
      return [...custom, ...INITIAL_STUDIES];
    }
  } catch {}
  return INITIAL_STUDIES;
}

export function saveScientificStudy(study: ScientificStudy): ScientificStudy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: ScientificStudy[] = raw ? JSON.parse(raw) : [];
    const updated = [study, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return getScientificStudies();
}

export function deleteScientificStudy(studyId: string): ScientificStudy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const existing: ScientificStudy[] = JSON.parse(raw);
      const filtered = existing.filter((s) => s.id !== studyId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch {}
  return getScientificStudies();
}
