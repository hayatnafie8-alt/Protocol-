/**
 * Evidence-Based Local Anesthesia (LA) Constants and Mathematical Models
 * Standards sourced from Malamed's Handbook of Local Anesthesia, FDA monographs, and ADA Guidelines.
 */

export type AnestheticId = 'lidocaine' | 'articaine' | 'mepivacaine';
export type CartridgeSize = '1.8' | '2.2';
export type AgeCategory = 'adult' | 'pediatric';

export interface AnestheticDrugInfo {
  id: AnestheticId;
  nameAr: string;
  nameEn: string;
  concentrationPercent: number; // e.g. 2 for 2%
  hasVasoconstrictor: boolean;
  vasoconstrictorRatio?: string; // "1:100,000"
  mrdMgPerKgAdult: number; // mg/kg
  mrdMgPerKgPediatric: number; // mg/kg
  absoluteCeilingMgAdult: number; // mg absolute maximum
  absoluteCeilingMgPediatric: number; // mg absolute maximum
  minPediatricAgeYears: number; // Articaine is contraindicated < 4 years
  fdaPregnancyCategory: 'B' | 'C';
  metabolism: string;
  halfLife: string;
  pulpalAnesthesiaDuration: string;
  softTissueDuration: string;
  clinicalNotesAr: string;
  clinicalNotesEn: string;
}

export const ANESTHETIC_DRUGS: Record<AnestheticId, AnestheticDrugInfo> = {
  lidocaine: {
    id: 'lidocaine',
    nameAr: 'ليدوكائين 2% مع أدرينالين 1:100,000',
    nameEn: 'Lidocaine 2% with Epinephrine 1:100,000',
    concentrationPercent: 2,
    hasVasoconstrictor: true,
    vasoconstrictorRatio: '1:100,000',
    mrdMgPerKgAdult: 4.4, // Malamed standard conservative limit: 4.4 mg/kg (FDA states up to 7 mg/kg with epi, Malamed recommends 4.4 mg/kg as safest reference)
    mrdMgPerKgPediatric: 4.4,
    absoluteCeilingMgAdult: 300,
    absoluteCeilingMgPediatric: 300,
    minPediatricAgeYears: 0,
    fdaPregnancyCategory: 'B',
    metabolism: 'كبدي (Hepatic via CYP450 enzymes)',
    halfLife: '90 دقيقة (1.5 hours)',
    pulpalAnesthesiaDuration: '60 دقيقة (Infiltration & Block)',
    softTissueDuration: '3 - 5 ساعات',
    clinicalNotesAr: 'المعيار الذهبي للتخدير السريري في طب الأسنان. الخيار الأكثر أماناً أثناء الحمل (Category B).',
    clinicalNotesEn: 'The gold standard dental local anesthetic. Preferred and safest option in pregnancy (FDA Category B).',
  },
  articaine: {
    id: 'articaine',
    nameAr: 'أرتيكائين 4% مع أدرينالين 1:100,000',
    nameEn: 'Articaine 4% with Epinephrine 1:100,000',
    concentrationPercent: 4,
    hasVasoconstrictor: true,
    vasoconstrictorRatio: '1:100,000',
    mrdMgPerKgAdult: 7.0,
    mrdMgPerKgPediatric: 7.0,
    absoluteCeilingMgAdult: 500,
    absoluteCeilingMgPediatric: 500,
    minPediatricAgeYears: 4, // Contraindicated in children under 4
    fdaPregnancyCategory: 'C',
    metabolism: 'بلازما وكبد (90-95% Plasma cholinesterase, 5-10% Hepatic)',
    halfLife: '20-30 دقيقة (Fastest elimination)',
    pulpalAnesthesiaDuration: '60 - 75 دقيقة',
    softTissueDuration: '3 - 5 ساعات',
    clinicalNotesAr: 'اختراق عظمي ممتاز (Excellent bone penetration). استقلاب سريع جداً بالبلازما. ممنوع للأطفال دون 4 سنوات.',
    clinicalNotesEn: 'Superior bone diffusion; fast plasma cholinesterase clearance. Contraindicated in children < 4 years.',
  },
  mepivacaine: {
    id: 'mepivacaine',
    nameAr: 'ميبايفاكين 3% سادة (بدون قابض أوعية)',
    nameEn: 'Mepivacaine 3% Plain (No Vasoconstrictor)',
    concentrationPercent: 3,
    hasVasoconstrictor: false,
    mrdMgPerKgAdult: 4.4,
    mrdMgPerKgPediatric: 4.4,
    absoluteCeilingMgAdult: 300,
    absoluteCeilingMgPediatric: 300,
    minPediatricAgeYears: 0,
    fdaPregnancyCategory: 'C',
    metabolism: 'كبدي (Hepatic)',
    halfLife: '110 دقيقة (1.9 hours)',
    pulpalAnesthesiaDuration: '20 - 40 دقيقة (Infiltration / Block)',
    softTissueDuration: '2 - 3 ساعات',
    clinicalNotesAr: 'الخيار الأول لمرضى حساسية السلفيت، أمراض القلب الحادة، أو الإجراءات العلاجية القصيرة.',
    clinicalNotesEn: 'First choice for sulfite-allergic patients, severe cardiovascular disease, and short procedures.',
  },
};

export interface ComorbidityFactors {
  cardiovascularDisease: boolean; // Epinephrine cap: 0.04 mg (~2 cartridges of 1:100,000)
  hepaticOrRenalImpairment: boolean; // 30% MRD reduction
  sulfiteAllergy: boolean; // Contraindication for vasoconstrictors
  pregnancy: boolean; // Lidocaine Category B notice
}

export interface CalculationInput {
  weightKg: number;
  ageCategory: AgeCategory;
  childAgeYears?: number;
  anestheticId: AnestheticId;
  cartridgeSize: CartridgeSize; // 1.8 or 2.2 mL
  comorbidities: ComorbidityFactors;
  cartridgesAdministered: number;
}

export interface CalculationResult {
  isValid: boolean;
  validationError?: string;
  isContraindicated: boolean;
  contraindicationReason?: string;
  
  // Anesthetic constants for selected cartridge
  anestheticMgPerCartridge: number;
  epiMgPerCartridge: number;
  
  // Base & Scaled MRD
  baseMrdMgPerKg: number;
  unadjustedMrdMg: number;
  effectiveMrdMg: number; // after 30% hepatic/renal scaling & absolute ceiling
  
  // Safe Cartridges
  maxSafeCartridgesByAnesthetic: number;
  maxSafeCartridgesByCardiacEpi: number | null;
  finalSafeCartridges: number; // rounded down to 1 decimal place
  
  // Administered tracking
  cartridgesAdministered: number;
  administeredAnestheticMg: number;
  administeredEpiMg: number;
  percentageOfMrdUsed: number;
  remainingSafeCartridges: number;
  remainingSafeMg: number;
  
  // Toxicity & safety alert tier
  safetyLevel: 'safe' | 'caution' | 'toxic';
  alerts: Array<{
    type: 'red' | 'orange' | 'blue' | 'green';
    titleAr: string;
    titleEn: string;
    messageAr: string;
    messageEn: string;
  }>;
}

/**
 * Computes exact dosage math, comorbidity adjustments, and safety threshold
 */
export function calculateLocalAnestheticDose(input: CalculationInput): CalculationResult {
  const {
    weightKg,
    ageCategory,
    childAgeYears = 6,
    anestheticId,
    cartridgeSize,
    comorbidities,
    cartridgesAdministered,
  } = input;

  const drug = ANESTHETIC_DRUGS[anestheticId];
  const sizeNum = parseFloat(cartridgeSize); // 1.8 or 2.2

  // 1. Calculate milligrams per cartridge based on volume
  // Formula: concentrationPercent * 10 = mg/mL
  // e.g. 2% = 20 mg/mL -> 1.8 mL = 36 mg; 2.2 mL = 44 mg
  // 4% = 40 mg/mL -> 1.8 mL = 72 mg; 2.2 mL = 88 mg
  // 3% = 30 mg/mL -> 1.8 mL = 54 mg; 2.2 mL = 66 mg
  const mgPerMl = drug.concentrationPercent * 10;
  const anestheticMgPerCartridge = Math.round(mgPerMl * sizeNum);

  // Epinephrine 1:100,000 = 0.01 mg/mL
  // 1.8 mL contains 0.018 mg epi; 2.2 mL contains 0.022 mg epi
  const epiMgPerCartridge = drug.hasVasoconstrictor ? Number((0.01 * sizeNum).toFixed(3)) : 0;

  const alerts: CalculationResult['alerts'] = [];

  // 2. Validate Weight
  if (isNaN(weightKg) || weightKg < 2 || weightKg > 150) {
    return {
      isValid: false,
      validationError:
        weightKg < 2
          ? 'الوزن أقل من الحد الأدنى (2 كجم) / Weight is below minimum limit (2 kg)'
          : weightKg > 150
          ? 'الوزن أعلى من الحد المسموح (150 كجم) / Weight exceeds maximum limit (150 kg)'
          : 'يرجى إدخال وزن صحيح بالكيلوجرام / Please enter a valid weight in kg',
      isContraindicated: false,
      anestheticMgPerCartridge,
      epiMgPerCartridge,
      baseMrdMgPerKg: drug.mrdMgPerKgAdult,
      unadjustedMrdMg: 0,
      effectiveMrdMg: 0,
      maxSafeCartridgesByAnesthetic: 0,
      maxSafeCartridgesByCardiacEpi: null,
      finalSafeCartridges: 0,
      cartridgesAdministered,
      administeredAnestheticMg: 0,
      administeredEpiMg: 0,
      percentageOfMrdUsed: 0,
      remainingSafeCartridges: 0,
      remainingSafeMg: 0,
      safetyLevel: 'safe',
      alerts: [],
    };
  }

  // 3. Age Restrictions (Articaine in children < 4 years)
  let isContraindicated = false;
  let contraindicationReason = '';

  if (anestheticId === 'articaine' && ageCategory === 'pediatric' && childAgeYears < 4) {
    isContraindicated = true;
    contraindicationReason =
      '🚫 موانع استعمال مطلقة: لا يجوز استخدام أرتيكائين 4% للأطفال دون سن 4 سنوات لعدم توفر بيانات أمان كافية. يرجى اختيار ليدوكائين 2% أو ميبايفاكين 3%. / Absolute Contraindication: Articaine 4% is not recommended in pediatric patients under 4 years of age.';
    alerts.push({
      type: 'red',
      titleAr: 'موانع استعمال للأطفال < 4 سنوات',
      titleEn: 'Pediatric Contraindication (< 4 Years)',
      messageAr: 'أرتيكائين 4% غير مرخص للأطفال تحت 4 سنوات. استخدم ليدوكائين 2% مع أدرينالين بجرعة محسوبة بدقة.',
      messageEn: 'Articaine 4% is contraindicated under 4 years old. Lidocaine 2% is recommended.',
    });
  }

  // 4. Sulfite Allergy with Epinephrine solutions
  if (comorbidities.sulfiteAllergy && drug.hasVasoconstrictor) {
    isContraindicated = true;
    contraindicationReason =
      '🚫 موانع استعمال: تجنب استخدام المخدر المحتوي على أدرينالين لوجود مواد حافظة (metabisulfite) تسبب الحساسية. يفضل اختيار ميبايفاكين 3% بدون قابض أوعية. / Contraindication: Avoid Epinephrine solutions (contain sulfites as preservative). Mepivacaine 3% Plain is preferred.';
    alerts.push({
      type: 'red',
      titleAr: 'موانع استعمال: حساسية السلفيت (Sulfite Allergy)',
      titleEn: 'Contraindication: True Sulfite Allergy',
      messageAr: 'أمبولات الأدرينالين تحتوي على الصوديوم ميتابيسلفيت كمادة مانعة للتأكسد، وتؤدي لصدمة حساسية حادة. الحل الآمن: ميبايفاكين 3% سادة.',
      messageEn: 'Epinephrine solutions contain metabisulfites as antioxidants. Use Mepivacaine 3% Plain.',
    });
  }

  // 5. Hepatic or Renal Impairment (30% reduction)
  if (comorbidities.hepaticOrRenalImpairment) {
    alerts.push({
      type: 'orange',
      titleAr: 'اعتلال كبدي / كلوي (Hepatic/Renal Impairment)',
      titleEn: 'Liver or Kidney Impairment Dose Reduction',
      messageAr: '⚠️ اعتلال كبدي/كلوي: تم تقليل الجرعة القصوى تلقائياً بنسبة 30% لتباطؤ التخلص من المخدر في الجسم.',
      messageEn: '⚠️ Liver/Kidney Impairment: Maximum recommended dose is reduced by 30% due to slower metabolic clearance.',
    });
  }

  // 6. Cardiovascular Disease (Epi cap: 0.04 mg)
  if (comorbidities.cardiovascularDisease) {
    alerts.push({
      type: 'orange',
      titleAr: 'تحديد الأدرينالين لمرضى القلب والضغط (Cardiac Limit)',
      titleEn: 'Cardiovascular Risk: Epinephrine Limit (0.04 mg)',
      messageAr: '🚨 تحديد الأدرينالين: للمرضى المصابين بأمراض القلب، يجب تقليل الجرعة بحيث لا يتجاوز الأدرينالين 0.04 ملغ (ما يعادل أمبولتين تقريباً من تركيز 1:100,000).',
      messageEn: '🚨 Cardiovascular Risk: Limit Epinephrine strictly to 0.04 mg (~2 cartridges of 1:100,000 solution).',
    });
  }

  // 7. Pregnancy Alert
  if (comorbidities.pregnancy) {
    alerts.push({
      type: 'blue',
      titleAr: 'إرشادات الحمل (Pregnancy Guidance)',
      titleEn: 'Pregnancy Protocol (FDA Category B vs C)',
      messageAr: 'ℹ️ الحمل: يعتبر الليدوكائين 2% مع الأدرينالين الخيار الأفضل والآمن (Category B) عند الحاجة الملحة للتخدير، مع إعطاء أقل جرعة فعالة، وتجنب ميبايفاكين وأرتيكائين (Category C).',
      messageEn: 'ℹ️ Pregnancy: Lidocaine 2% with Epinephrine is preferred (FDA Category B). Mepivacaine & Articaine are Category C.',
    });
  }

  // 8. Math Calculations
  const baseMrdMgPerKg = ageCategory === 'pediatric' ? drug.mrdMgPerKgPediatric : drug.mrdMgPerKgAdult;
  const absoluteCeiling = ageCategory === 'pediatric' ? drug.absoluteCeilingMgPediatric : drug.absoluteCeilingMgAdult;

  // Unadjusted dose: weight * mg/kg
  const calculatedWeightDose = weightKg * baseMrdMgPerKg;
  let unadjustedMrdMg = Math.min(calculatedWeightDose, absoluteCeiling);

  // Apply Hepatic/Renal 30% deduction
  let effectiveMrdMg = unadjustedMrdMg;
  if (comorbidities.hepaticOrRenalImpairment) {
    effectiveMrdMg = effectiveMrdMg * 0.70;
  }
  effectiveMrdMg = Math.round(effectiveMrdMg * 10) / 10;

  // Max cartridges by anesthetic drug
  const maxSafeCartridgesByAnesthetic = effectiveMrdMg / anestheticMgPerCartridge;

  // Max cartridges by Cardiac Epinephrine cap (0.04 mg)
  let maxSafeCartridgesByCardiacEpi: number | null = null;
  if (comorbidities.cardiovascularDisease && drug.hasVasoconstrictor && epiMgPerCartridge > 0) {
    // 0.04 mg / epiMgPerCartridge
    maxSafeCartridgesByCardiacEpi = 0.04 / epiMgPerCartridge;
  }

  // Final Safe Cartridges: the strictest ceiling, rounded down to 1 decimal place
  let computedCartridges = maxSafeCartridgesByAnesthetic;
  if (maxSafeCartridgesByCardiacEpi !== null) {
    computedCartridges = Math.min(computedCartridges, maxSafeCartridgesByCardiacEpi);
  }

  // Round DOWN to 1 decimal place for clinical safety
  const finalSafeCartridges = Math.floor(computedCartridges * 10) / 10;

  // 9. Administered dosage tracking & Visual Gauge
  const administeredAnestheticMg = Math.round(cartridgesAdministered * anestheticMgPerCartridge * 10) / 10;
  const administeredEpiMg = Number((cartridgesAdministered * epiMgPerCartridge).toFixed(3));

  let percentageOfMrdUsed = effectiveMrdMg > 0 ? Math.round((administeredAnestheticMg / effectiveMrdMg) * 100) : 0;

  // If cardiac cap is breached, adjust percentage accordingly
  if (maxSafeCartridgesByCardiacEpi !== null && cartridgesAdministered > 0) {
    const cardiacPercent = Math.round((cartridgesAdministered / maxSafeCartridgesByCardiacEpi) * 100);
    percentageOfMrdUsed = Math.max(percentageOfMrdUsed, cardiacPercent);
  }

  // Determine safety tier
  let safetyLevel: CalculationResult['safetyLevel'] = 'safe';
  if (percentageOfMrdUsed >= 90) {
    safetyLevel = 'toxic';
  } else if (percentageOfMrdUsed > 50) {
    safetyLevel = 'caution';
  } else {
    safetyLevel = 'safe';
  }

  const remainingSafeCartridges = Math.max(0, Math.floor((finalSafeCartridges - cartridgesAdministered) * 10) / 10);
  const remainingSafeMg = Math.max(0, Math.round((effectiveMrdMg - administeredAnestheticMg) * 10) / 10);

  return {
    isValid: true,
    isContraindicated,
    contraindicationReason,
    anestheticMgPerCartridge,
    epiMgPerCartridge,
    baseMrdMgPerKg,
    unadjustedMrdMg,
    effectiveMrdMg,
    maxSafeCartridgesByAnesthetic: Math.round(maxSafeCartridgesByAnesthetic * 10) / 10,
    maxSafeCartridgesByCardiacEpi: maxSafeCartridgesByCardiacEpi !== null ? Math.round(maxSafeCartridgesByCardiacEpi * 10) / 10 : null,
    finalSafeCartridges,
    cartridgesAdministered,
    administeredAnestheticMg,
    administeredEpiMg,
    percentageOfMrdUsed,
    remainingSafeCartridges,
    remainingSafeMg,
    safetyLevel,
    alerts,
  };
}

/**
 * Format a comprehensive clinical chart entry for dental patient record
 */
export function generateClinicalChartNote(input: CalculationInput, result: CalculationResult, lang: 'ar' | 'en' = 'ar'): string {
  const drug = ANESTHETIC_DRUGS[input.anestheticId];
  if (lang === 'en') {
    const dateStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const conditionsEn: string[] = [];
    if (input.comorbidities.cardiovascularDisease) conditionsEn.push('Cardiovascular / HTN (Epinephrine capped at 0.04 mg)');
    if (input.comorbidities.hepaticOrRenalImpairment) conditionsEn.push('Hepatic / Renal Impairment (30% proactive dose reduction)');
    if (input.comorbidities.sulfiteAllergy) conditionsEn.push('Bisulfite Allergy');
    if (input.comorbidities.pregnancy) conditionsEn.push('Pregnancy (FDA Category B)');

    return `==========================================
📋 DENTAL LOCAL ANESTHESIA CLINICAL RECORD
📅 Date & Time: ${dateStr}
👤 Patient Classification: ${input.ageCategory === 'adult' ? 'Adult' : `Pediatric (${input.childAgeYears || 6} yrs)`}
⚖️ Patient Weight: ${input.weightKg} kg
💉 Anesthetic Formulation: ${drug.nameEn}
🧪 Cartridge Volume: ${input.cartridgeSize} mL (${result.anestheticMgPerCartridge} mg anesthetic${drug.hasVasoconstrictor ? ` + ${result.epiMgPerCartridge} mg Epinephrine` : ''})
⚠️ Comorbidities / Risk Modifiers: ${conditionsEn.length > 0 ? conditionsEn.join(', ') : 'Systemically Healthy (ASA I)'}
------------------------------------------
📊 ACCREDITED CLINICAL METRICS (MALAMED METHODOLOGY):
- Maximum Recommended Dose (MRD): ${result.effectiveMrdMg} mg (${result.baseMrdMgPerKg} mg/kg${input.comorbidities.hepaticOrRenalImpairment ? ' [30% organ clearance reduction applied]' : ''})
- Maximum Safe Carpules: ${result.finalSafeCartridges} Cartridges (Carpules)
- Limiting Factor: ${result.maxSafeCartridgesByCardiacEpi !== null && result.maxSafeCartridgesByCardiacEpi < result.maxSafeCartridgesByAnesthetic ? 'Cardiac Epinephrine Threshold (0.04 mg)' : 'Anesthetic Drug Absolute Mass'}
------------------------------------------
⏱️ CHAIRSIDE ADMINISTRATION TRACKING:
- Cartridges Administered: ${input.cartridgesAdministered} Cartridges
- Anesthetic Administered: ${result.administeredAnestheticMg} mg (${result.percentageOfMrdUsed}% of MRD ceiling)
- Epinephrine Administered: ${result.administeredEpiMg} mg
- Remaining Safe Reserve: ${result.remainingSafeCartridges} Cartridges (${result.remainingSafeMg} mg)
- Clinical Safety Status: ${result.safetyLevel === 'safe' ? 'Therapeutic Safe Zone' : result.safetyLevel === 'caution' ? 'Cautionary Threshold Approaching' : 'CRITICAL TOXICITY THRESHOLD EXCEEDED'}
==========================================`;
  }

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const conditions: string[] = [];
  if (input.comorbidities.cardiovascularDisease) conditions.push('أمراض القلب/الضغط (تحديد الأدرينالين 0.04 ملغ)');
  if (input.comorbidities.hepaticOrRenalImpairment) conditions.push('اعتلال كبدي/كلوي (تخفيض الجرعة 30%)');
  if (input.comorbidities.sulfiteAllergy) conditions.push('حساسية سلفيت');
  if (input.comorbidities.pregnancy) conditions.push('حمل (FDA Category B)');

  return `==========================================
📋 توثيق جرعة التخدير السريري (Dental LA Note)
📅 التاريخ والوقت: ${dateStr}
👤 فئة المريض: ${input.ageCategory === 'adult' ? 'بالغ (Adult)' : `طفل (Pediatric - ${input.childAgeYears || 6} سنوات)`}
⚖️ وزن المريض: ${input.weightKg} كجم
💉 المادة المخدرة: ${drug.nameAr} (${drug.nameEn})
🧪 حجم الأمبولة: ${input.cartridgeSize} مل (${result.anestheticMgPerCartridge} ملغ مخدر${drug.hasVasoconstrictor ? ` + ${result.epiMgPerCartridge} ملغ أدرينالين` : ''})
⚠️ الحالات المرضية المرافقة: ${conditions.length > 0 ? conditions.join('، ') : 'سليم جهازياً (ASA I)'}
------------------------------------------
📊 الحسابات السريرية المعتمدة:
- الجرعة القصوى الموصى بها (MRD): ${result.effectiveMrdMg} ملغ (${result.baseMrdMgPerKg} ملغ/كجم${input.comorbidities.hepaticOrRenalImpairment ? ' بعد خصم 30%' : ''})
- الحد الأقصى الآمن للأمبولات: ${result.finalSafeCartridges} أمبولة (Carpules)
- العامل المحدد للجرعة: ${result.maxSafeCartridgesByCardiacEpi !== null && result.maxSafeCartridgesByCardiacEpi < result.maxSafeCartridgesByAnesthetic ? 'حد الأدرينالين القلبي (0.04 ملغ)' : 'الحد الأقصى للمادة المخدرة'}
------------------------------------------
⏱️ الجرعة المحقونة فعلياً:
- عدد الأمبولات المحقونة: ${input.cartridgesAdministered} أمبولة
- كمية المخدر المحقونة: ${result.administeredAnestheticMg} ملغ (${result.percentageOfMrdUsed}% من الحد الأقصى)
- كمية الأدرينالين المحقونة: ${result.administeredEpiMg} ملغ
- المتبقي الآمن المسموح به: ${result.remainingSafeCartridges} أمبولة (${result.remainingSafeMg} ملغ)
- حالة الأمان: ${result.safetyLevel === 'safe' ? 'آمن وطبيعي (Within Safe Range)' : result.safetyLevel === 'caution' ? 'تحذير واقتراب من السقف (Caution)' : 'خطر تجاوز الجرعة (Toxicity Alert)'}
==========================================`;
}

/**
 * Rapid Emergency Protocol for Local Anesthetic Systemic Toxicity (LAST)
 */
export const LAST_EMERGENCY_PROTOCOL = {
  titleAr: 'بروتوكول طوارئ التسمم الجهازي بالمخدر الموضعي (LAST Protocol)',
  titleEn: 'Local Anesthetic Systemic Toxicity (LAST) Emergency Protocol',
  warningAr: 'حالة طوارئ مهددة للحياة - استجب فوراً باتباع الخطوات بالترتيب!',
  warningEn: 'Life-Threatening Emergency - Initiate resuscitation protocol immediately in sequential order!',
  warning: 'حالة طوارئ مهددة للحياة - استجب فوراً باتباع الخطوات بالترتيب!',
  symptoms: [
    {
      stage: 'المرحلة المبكرة (Excitation / CNS)',
      stageEn: 'Initial CNS Excitation Phase',
      itemsAr: ['تنميل حول الفم واللسان (Perioral numbness)', 'طعم معدني بالفم (Metallic taste)', 'طنين في الأذنين (Tinnitus)', 'دوخة وتشوش في الرؤية', 'تلعثم في الكلام (Slurred speech)'],
      itemsEn: ['Perioral numbness & circumoral paresthesia', 'Metallic taste dysgeusia', 'Auditory disturbance & tinnitus', 'Dizziness, visual disturbance & lightheadedness', 'Dysarthria & slurred speech'],
    },
    {
      stage: 'المرحلة المتقدمة (Convulsions / Depression)',
      stageEn: 'Advanced CNS & Respiratory Depression',
      itemsAr: ['رجفان عضلي (Muscle twitching)', 'نوبات صرع واختلاج (Tonic-clonic seizures)', 'فقدان الوعي والغيبوبة (Unconsciousness)', 'هبوط أو توقف التنفس (Respiratory arrest)'],
      itemsEn: ['Localized muscle fasciculations & facial twitching', 'Generalized tonic-clonic convulsions', 'Progressive depression, stupor & unconsciousness', 'Severe respiratory depression & apnea'],
    },
    {
      stage: 'المرحلة القلبية الحادة (Cardiovascular Collapse)',
      stageEn: 'Severe Cardiovascular Collapse Phase',
      itemsAr: ['انخفاض حاد في ضغط الدم (Severe hypotension)', 'اضطراب نبضات القلب (Bradycardia / Ventricular Arrhythmias)', 'توقف عضلة القلب التام (Cardiac arrest)'],
      itemsEn: ['Severe refractory arterial hypotension', 'Bradycardia, heart block & ventricular tachyarrhythmias', 'Complete cardiovascular collapse & cardiac arrest'],
    },
  ],
  emergencyActions: [
    {
      step: 1,
      title: 'إيقاف الحقن فوراً (Stop Injection)',
      titleEn: 'Immediate Cessation of Local Anesthetic Administration',
      desc: 'أوقف إعطاء المخدر فوراً واطلب النجدة وفريق الطوارئ (Call EMS / 911 / الهلال الأحمر).',
      descEn: 'Cease injection immediately. Maintain airway and needle safety, summon clinic faculty, and activate Emergency Medical Services (EMS).',
    },
    {
      step: 2,
      title: 'إدارة مجرى الهواء والتنفس (Airway & 100% O2)',
      titleEn: 'Airway Patency & High-Flow 100% Oxygenation',
      desc: 'حافظ على مجرى التنفس مفتوحاً وأعطِ أكسجين بنسبة 100% بالماسك لمنع نقص الأكسجين وحموضة الدم.',
      descEn: 'Ensure clear airway patency and administer 100% high-flow oxygen via non-rebreather mask or positive pressure bag to counter hypoxia and acidosis.',
    },
    {
      step: 3,
      title: 'السيطرة على الاختلاجات (Seizure Suppression)',
      titleEn: 'Pharmacological Seizure Suppression',
      desc: 'إعطاء بنزوديازيبين وريدياً (Midazolam 1-2 mg IV) لتثبيط التشنجات العضلية.',
      descEn: 'Administer intravenous benzodiazepine (Midazolam 1-2 mg IV titrated or Diazepam) to suppress neurological seizures. Avoid large-dose propofol.',
    },
    {
      step: 4,
      title: 'الترياق النوعي: مستحلب الدهون 20% (Intralipid 20%)',
      titleEn: 'Intravenous Lipid Emulsion 20% Rescue (Intralipid®)',
      desc: 'العلاج المنقذ للحياة: إعطاء جرعة أولية (Bolus) 1.5 مل/كجم وريدياً خلال دقيقة، ثم تسريب مستمر 0.25 مل/كجم/دقيقة (Lipid Sink Effect).',
      descEn: 'Life-saving targeted antidote: Administer initial 20% Lipid Emulsion bolus of 1.5 mL/kg IV over 1 minute, followed by continuous infusion at 0.25 mL/kg/min (Lipid Sink mechanism).',
    },
    {
      step: 5,
      title: 'الإنعاش القلبي الرئوي المستمر (CPR)',
      titleEn: 'Cardiopulmonary Resuscitation (ACLS Protocol)',
      desc: 'في حال توقف القلب، استمر بالإنعاش القلبي الرئوي. تجنب استخدام الفازوبريسين وحاصرات بيتا وحاصرات قنوات الكالسيوم.',
      descEn: 'In cardiac arrest, initiate high-quality chest compressions and ACLS. Avoid vasopressin, beta-blockers, and calcium channel blockers. Continue lipid resuscitation.',
    },
  ],
};
