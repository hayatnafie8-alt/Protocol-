/**
 * Searchable Clinical Catalog Index
 * Pre-indexes all clinical procedures, restoration classes, anesthesia techniques,
 * suturing methods, surgical procedures, and calculators for instant in-clinic lookup.
 */

import { PRESET_CLASSES } from './classesData';
import { CLINICAL_SKILLS_LIST } from './clinicalSkillsData';
import { INITIAL_SURGICAL_CASES } from './surgicalCasesData';
import { DEFAULT_PRESCRIPTION_DRUGS } from './prescriptionGuideData';
import { DIRECT_PULP_CAPPING_INFO, PulpCappingSlide } from './directPulpCappingProtocolData';
import { SMART_CLINIC_TRAY_PROTOCOL_INFO, SMART_CLINIC_TRAY_STEPS } from './smartClinicTrayProtocolData';
import { ANESTHETIC_DRUGS } from './anesthesiaCalculatorData';
import { BookmarkItem } from './bookmarksManager';

export interface CatalogSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'protocol' | 'skill' | 'surgical' | 'guide' | 'calc_or_formula' | 'prescription' | 'viva';
  categoryLabel: string;
  specialty: 'Operative' | 'Surgery' | 'Pharmacology' | 'Prosthodontics' | 'Periodontics' | 'Diagnosis';
  specialtyArabic: string;
  tags: string[];
  targetTab: string;
  targetParam?: string;
  clinicalKeyPoint: string;
  badge?: string;
  isUnlockedOnly?: boolean;
}

export function buildSearchCatalog(): CatalogSearchItem[] {
  const items: CatalogSearchItem[] = [];

  // 1. Composite Restoration Protocols (Class I - V)
  PRESET_CLASSES.forEach((c) => {
    let specialty: CatalogSearchItem['specialty'] = 'Operative';
    let specialtyArabic = 'ترميمي وحشوات (Operative)';
    let keyPoint = c.keyChallenge || c.indication;

    if (c.id === 'class-1') {
      keyPoint = 'حظر الشطف الإطباقي 90° وحماية الميناء، معامل إجهاد C-Factor = 5';
    } else if (c.id === 'class-2') {
      keyPoint = 'بناء الجدار الملاصق أولاً لتحويل الحالة من Class II إلى Class I';
    } else if (c.id === 'class-3') {
      keyPoint = 'الدخول الحنكي المحافظ (Palatal Access) مع بيفل 45° لإخفاء الخط الجمالي';
    } else if (c.id === 'class-4') {
      keyPoint = 'مفتاح السليكون (Palatal Index)، بيفل تموجي طويل 1.5-2 ملم ومحاكاة الماميلونات';
    } else if (c.id === 'class-5') {
      keyPoint = 'البيفل على الميناء الإطباقي فقط وممنوع على الملاط/الجذر، عزل عنقي دقيق';
    }

    items.push({
      id: `protocol-${c.id}`,
      title: `${c.name} — ${c.arabicName}`,
      subtitle: c.subtitle,
      category: 'protocol',
      categoryLabel: 'بروتوكول حشوات',
      specialty,
      specialtyArabic,
      tags: [c.code, c.name, c.arabicName, 'كومبوزيت', 'Composite', 'ترميم', 'حشوة', 'حفرة', 'Bevel', 'C-Factor'],
      targetTab: 'slides',
      targetParam: c.id,
      clinicalKeyPoint: keyPoint,
      badge: c.badge,
      isUnlockedOnly: true,
    });
  });

  // 2. Clinical Skills Atlas (Anesthesia, Rubber Dam, Sutures)
  CLINICAL_SKILLS_LIST.forEach((s: any) => {
    let specialty: CatalogSearchItem['specialty'] = 'Surgery';
    let specialtyArabic = 'جراحة وتخدير (Surgery)';
    let categoryLabel = 'مهارة سريرية 4K';

    if (s.category === 'anesthesia') {
      specialty = 'Pharmacology';
      specialtyArabic = 'تخدير وأدوية (Pharmacology)';
      categoryLabel = 'حقن وتخدير فموي';
    } else if (s.category === 'rubber_dam') {
      specialty = 'Operative';
      specialtyArabic = 'عزل سريري (Isolation)';
      categoryLabel = 'عزل بالربر دام';
    } else if (s.category === 'suturing') {
      specialty = 'Surgery';
      specialtyArabic = 'جراحة وخياطة (Suturing)';
      categoryLabel = 'تقنية خياطة جراحية';
    }

    items.push({
      id: `skill-${s.id}`,
      title: `${s.titleArabic} (${s.titleEnglish})`,
      subtitle: s.shortSummary,
      category: 'skill',
      categoryLabel,
      specialty,
      specialtyArabic,
      tags: [
        s.titleArabic,
        s.titleEnglish,
        s.category,
        s.difficulty,
        ...(s.anatomicalLandmarks || []),
        'تخدير',
        'خياطة',
        'ربر دام',
        'عزل',
        'إبرة',
        'محقنة',
      ],
      targetTab: 'clinical_skills',
      targetParam: s.id,
      clinicalKeyPoint: s.dangerZoneWarning || s.clinicalTip || 'مراعاة زوايا الإبرة وسحب المكبس للتأكد من عدم اختراق وعاء دموي',
      badge: s.difficulty,
      isUnlockedOnly: true,
    });
  });

  // 3. Surgical Cases Atlas
  INITIAL_SURGICAL_CASES.forEach((sc) => {
    items.push({
      id: `surgical-${sc.id}`,
      title: sc.title,
      subtitle: `${sc.categoryLabel} • سن/منطقة: ${sc.toothOrRegion}`,
      category: 'surgical',
      categoryLabel: 'حالة جراحية',
      specialty: 'Surgery',
      specialtyArabic: 'جراحة الفم والأسنان (Oral Surgery)',
      tags: [
        sc.title,
        sc.categoryLabel,
        sc.toothOrRegion,
        sc.difficulty,
        'خلع',
        'ضرس عقل',
        'شريحة',
        'عظم',
        'جراحة',
        'مشرط',
      ],
      targetTab: 'surgical',
      targetParam: sc.id,
      clinicalKeyPoint: sc.clinicalTakeaways?.[0] || sc.preOpDiagnosis || sc.summary,
      badge: sc.difficulty,
      isUnlockedOnly: true,
    });
  });

  // 4. In-Clinic Calculators & Clinical Diagnostic Tools
  items.push({
    id: 'tool-anatomy-3d',
    title: 'محاكي طبقات الأسنان ثلاثي الأبعاد (3D Anatomy & Layering)',
    subtitle: 'تشريح الميناء، العاج، والحجرة اللبية مع محاكاة سماكة الطبقات 0.5-1.5 ملم',
    category: 'calc_or_formula',
    categoryLabel: 'أداة سريرية',
    specialty: 'Operative',
    specialtyArabic: 'تشريح وترميم (Anatomy)',
    tags: ['3D', 'طبقات', 'Layering', 'Anatomy', 'تشريح', 'العاج', 'الميناء', 'عصب'],
    targetTab: 'anatomy',
    clinicalKeyPoint: 'الحفاظ على سماكة الميناء الوجهي 0.5 ملم لضمان شفافية وواقعية الكومبوزيت دون رمادية',
  });

  items.push({
    id: 'tool-shade-simulator',
    title: 'محاكي اختبار وتطابق ألوان الكومبوزيت (Shade Matcher)',
    subtitle: 'اختبار درجات المينا والعاج (A1, A2, A3, Bleach) تحت إضاءة العيادة الطبيعية',
    category: 'calc_or_formula',
    categoryLabel: 'أداة سريرية',
    specialty: 'Operative',
    specialtyArabic: 'ألوان وجمالية (Esthetics)',
    tags: ['لون', 'Shade', 'Vita', 'A2', 'A3', 'Button Try-in', 'Dehydration'],
    targetTab: 'shade',
    clinicalKeyPoint: 'تحديد اللون والسن رطب قبل وضع الربر دام تفادياً للجفاف الكاذب (Dehydration)',
  });

  items.push({
    id: 'tool-clinical-timer',
    title: 'مؤقت التخريش والتصلب السريري (Clinical Etch & Cure Timer)',
    subtitle: 'عد تنازلي دقيق لثواني التخريش بالحمض (15 ثانية ميناء / 10 ثواني عاج) وتصليب البوند',
    category: 'calc_or_formula',
    categoryLabel: 'مؤقت سريري',
    specialty: 'Operative',
    specialtyArabic: 'بروتوكول البوند (Adhesive)',
    tags: ['مؤقت', 'Timer', 'تخريش', 'حمض', 'Etching', 'Light Cure', 'بوند'],
    targetTab: 'timer',
    clinicalKeyPoint: 'حمض الفوسفوريك 37%: 15-20 ثانية على الميناء، 10 ثواني كحد أقصى على العاج',
  });

  items.push({
    id: 'guide-patient-psychology',
    title: 'دليل التعامل السريري والنفسي مع المراجعين (18 شريحة)',
    subtitle: 'مهارات امتصاص قلق المراجع، شرح خطة العلاج، إدارة الخوف من الإبرة والمضاعفات',
    category: 'guide',
    categoryLabel: 'دليل سلوكي',
    specialty: 'Diagnosis',
    specialtyArabic: 'إدارة العيادة والمرضى (Patient Care)',
    tags: ['مراجعين', 'نفسي', 'قلق', 'إبرة', 'خوف', 'تواصل', 'Patient Guide', 'سلوك'],
    targetTab: 'patient_guide',
    clinicalKeyPoint: 'شرح كل خطوة مسبقاً يقلل من ضربات القلب وإفراز الأدرينالين لدى المراجع بنسبة 50%',
  });

  // 5. Direct Pulp Capping Protocol (DPC)
  items.push({
    id: 'protocol-pulp-capping',
    title: 'بروتوكول التغطية اللبية المباشرة (Direct Pulp Capping - DPC)',
    subtitle: 'معالجة اللب الحيوي، إيقاف النزف بهيبوكلوريت الصوديوم، وتطبيق MTA + GIC',
    category: 'protocol',
    categoryLabel: 'بروتوكول سريري حيوي',
    specialty: 'Operative',
    specialtyArabic: 'علاج لب وحشوات (Endo/Operative)',
    tags: ['Direct Pulp Capping', 'DPC', 'MTA', 'تغطية لبية', 'نكشف العصب', 'لب', 'Pulp', 'NaOCl', 'GIC', 'Biodentine', 'نزف'],
    targetTab: 'pulp_capping',
    clinicalKeyPoint: 'السيطرة على النزف بقطنة مبللة بـ NaOCl 2.5-5% لمدة 2-5 دقائق قبل وضع MTA وساندوتش GIC',
    badge: 'MTA Protocol',
    isUnlockedOnly: true,
  });

  // 6. Smart Clinic Tray Protocol (7 Steps)
  items.push({
    id: 'protocol-smart-tray',
    title: 'بروتوكول هندسة الطاولة وصينية العيادة الذكية (7 خطوات)',
    subtitle: 'منع التلوث التبادلي، تنظيم أدوات الكومبوزيت والجراحة، وتنسيق طاولة العمل',
    category: 'protocol',
    categoryLabel: 'هندسة صينية العيادة',
    specialty: 'Operative',
    specialtyArabic: 'تنظيم العيادة (Ergonomics)',
    tags: ['Tray', 'طاولة', 'صينية', 'أدوات', 'تعقيم', 'Disposable', 'Ergonomics', 'Cross contamination', 'ترتيب'],
    targetTab: 'smart_tray',
    clinicalKeyPoint: 'الترتيب التسلسلي من اليمين لليسار، وحماية الأدوات الحادة ومنع لمس المواد غير المعقمة',
    badge: '7 خطوات',
    isUnlockedOnly: true,
  });

  // 7. Evidence-Based Dental Prescription Guide & Pharmacotherapy
  DEFAULT_PRESCRIPTION_DRUGS.forEach((drug) => {
    let catLabel = 'وصفة دوائية';
    if (drug.category === 'analgesics') catLabel = 'مسكن ومضاد التهاب';
    else if (drug.category === 'antibiotics') catLabel = 'مضاد حيوي فموي';
    else if (drug.category === 'emergency') catLabel = 'طوارئ وتحسس';
    else if (drug.category === 'mouthwashes') catLabel = 'غسول فم علاجي';

    items.push({
      id: `drug-${drug.id}`,
      title: `${drug.nameAr} (${drug.nameEn})`,
      subtitle: `${drug.indication} • الجرعة: ${drug.standardDosage}`,
      category: 'prescription',
      categoryLabel: catLabel,
      specialty: 'Pharmacology',
      specialtyArabic: 'أدوية وصيدلة سنية (Pharmacology)',
      tags: [
        drug.nameAr,
        drug.nameEn,
        drug.activeIngredient || '',
        drug.category,
        'دواء',
        'وصفة',
        'مسكن',
        'مضاد',
        'ألم',
        'التهاب',
        'Drug',
        'Prescription',
      ],
      targetTab: 'prescriptions',
      targetParam: drug.id,
      clinicalKeyPoint: `${drug.standardDosage} — ${drug.allergyAlerts || drug.pregnancySafety}`,
      badge: drug.pregnancySafety ? `حمل: ${drug.pregnancySafety.slice(0, 10)}` : undefined,
      isUnlockedOnly: true,
    });
  });

  // 8. Local Anesthesia Calculator
  Object.values(ANESTHETIC_DRUGS).forEach((anest) => {
    items.push({
      id: `anesthesia-${anest.id}`,
      title: `حاسبة تخدير: ${anest.nameAr}`,
      subtitle: `${anest.nameEn} • الجرعة القصوى: ${anest.mrdMgPerKgAdult} mg/kg (سقف ${anest.absoluteCeilingMgAdult} mg)`,
      category: 'calc_or_formula',
      categoryLabel: 'حاسبة تخدير موضعي',
      specialty: 'Pharmacology',
      specialtyArabic: 'تخدير جراحي (Anesthesia)',
      tags: [
        anest.nameAr,
        anest.nameEn,
        'بنج',
        'تخدير',
        'أدرينالين',
        'ليدوكائين',
        'أرتيكائين',
        'ميبفاكائين',
        'أمبولات',
        'كاربولا',
        'Carpule',
        'Anesthesia',
        'MRD',
      ],
      targetTab: 'anesthesia_calc',
      targetParam: anest.id,
      clinicalKeyPoint: anest.clinicalNotesAr,
      badge: anest.fdaPregnancyCategory ? `حمل: Cat ${anest.fdaPregnancyCategory}` : undefined,
    });
  });

  return items;
}

export function toBookmarkPayload(item: CatalogSearchItem): Omit<BookmarkItem, 'savedAt'> {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    category: item.category,
    categoryLabel: item.categoryLabel,
    specialty: item.specialty,
    tags: item.tags,
    targetTab: item.targetTab,
    targetParam: item.targetParam,
    clinicalKeyPoint: item.clinicalKeyPoint,
  };
}
