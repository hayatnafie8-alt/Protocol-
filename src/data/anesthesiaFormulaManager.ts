/**
 * Scientific Calculation Formula & Guidelines Manager for Local Anesthesia
 * إدارة وتخزين بيانات المعادلة العلمية لحساب جرعات التخدير الموضعي
 */

export interface AnesthesiaFormulaConfig {
  enabled: boolean;
  access: 'free' | 'subscription'; // 'free' = Publicly accessible, 'subscription' = Locked for subscribers
  title: string;
  titleEn: string;
  subtitle: string;
  mrdSummary: string;
  carpuleContentExplanation: string;
  weightBasedFormulaStep1: string;
  weightBasedFormulaStep2: string;
  pediatricRules: string;
  cardiacLimitNote: string;
  clinicalSafetyAlert: string;
  references: string[];
  version: number;
}

export const ANESTHESIA_FORMULA_CONFIG_STORAGE_KEY = 'dental_la_formula_config_v1';
export const ANESTHESIA_FORMULA_CONFIG_EVENT = 'dental_la_formula_config_updated';

export const DEFAULT_ANESTHESIA_FORMULA_CONFIG: AnesthesiaFormulaConfig = {
  enabled: true,
  access: 'free',
  title: 'الأسس والمعادلات العلمية لحساب الجرعات (Scientific Formulas & Guidelines)',
  titleEn: "Scientific Calculation Formulas & Clark's / Young's / Weight-Based Rules",
  subtitle: 'المرجعيات الأكاديمية المعتمدة وفقاً للجمعية الأمريكية لطب الأسنان (ADA) ودليل مالاميد (Malamed)',
  mrdSummary: 'حساب الجرعة القصوى الموصى بها (Maximum Recommended Dose - MRD) بناءً على وزن المريض بالكيلوغرام (مجم/كغ) بما لا يتجاوز السقف المطلق للجرعة للبالغين أو الأطفال.',
  carpuleContentExplanation: 'تحتوي الكاربولة القياسية (1.8 مل أو 1.7 مل) على مادة مخدرة بنسبة مئوية محددة: كل 1% تعني 10 مجم/مل. بالتالي: 2% ليدوكائين = 20 مجم/مل × 1.8 مل = 36 مجم في الكاربولة الواحدة (أو 34 مجم في حجم 1.7 مل). بينما 4% أرتيكائين = 40 مجم/مل × 1.8 مل = 72 مجم في الكاربولة الواحدة.',
  weightBasedFormulaStep1: 'إجمالي الجرعة المسموحة (مجم) = وزن المريض (كغ) × الجرعة القصوى للمادة المحددة (مجم/كغ).',
  weightBasedFormulaStep2: 'الحد الأقصى لعدد الكاربولات = إجمالي المجم المسموح به ÷ كمية المادة الفعالة في الكاربولة الواحدة (مثلاً 36 مجم لليدوكائين 2%).',
  pediatricRules: `قواعد حساب الجرعات للأطفال (Pediatric Rules):
1. قاعدة كلارك بالوزن (Clark's Rule): جرعة الطفل = [وزن الطفل بالكيلوغرام ÷ 70 كغ] × جرعة البالغين القصوى.
2. قاعدة يونغ بالعمر (Young's Rule): جرعة الطفل = [عمر الطفل بالسنوات ÷ (عمر الطفل + 12)] × جرعة البالغين القصوى.
3. توصية الأكاديمية الأمريكية (AAPD): الحساب بالوزن الدقيق (مجم/كغ) هو المعيار الأدق والأكثر أماناً لتجنب السمية وتجاوز السقف الحرج.`,
  cardiacLimitNote: 'حد الأمان لمرضى القلب والأوعية (Cardiac Dose Limit): الحد الأقصى للأدرينالين لمرضى القلب (ASA III / IV) هو 0.04 مجم فقط لكل جلسة، أي ما يعادل كربولتين فقط من تركيز 1:100,000 أو 4 كربولات من تركيز 1:200,000.',
  clinicalSafetyAlert: 'تنبيه سريري حرج: يُشترط إجراء الشفط السلبي (Negative Aspiration) في اتجاهين متعامدين بزاوية 90 درجة قبل الحقن للتحقق من عدم دخول الوعاء الدموي، مع الحقن البطيء جداً (كاربولة واحدة خلال دقيقة كاملة) لضمان عدم حدوث تسمم جهازي مفاجئ (LAST).',
  references: [
    'Malamed SF. Handbook of Local Anesthesia. 7th ed. St. Louis: Elsevier; 2020.',
    'American Dental Association (ADA) Council on Scientific Affairs. Local Anesthesia Safety Guidelines.',
    'American Academy of Pediatric Dentistry (AAPD). Guideline on Use of Local Anesthesia for Pediatric Dental Patients.',
    'FDA Drug Safety Monographs: Lidocaine Hydrochloride and Epinephrine Injection.',
  ],
  version: 1,
};

/**
 * Get current formula config from localStorage or defaults
 */
export function getAnesthesiaFormulaConfig(): AnesthesiaFormulaConfig {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(ANESTHESIA_FORMULA_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_ANESTHESIA_FORMULA_CONFIG,
          ...parsed,
        };
      }
    }
  } catch {}
  return { ...DEFAULT_ANESTHESIA_FORMULA_CONFIG };
}

/**
 * Save formula config to localStorage and broadcast real-time event
 */
export function saveAnesthesiaFormulaConfig(
  config: Partial<AnesthesiaFormulaConfig>
): AnesthesiaFormulaConfig {
  const current = getAnesthesiaFormulaConfig();
  const updated: AnesthesiaFormulaConfig = {
    ...current,
    ...config,
    version: (current.version || 1) + 1,
  };
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ANESTHESIA_FORMULA_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent(ANESTHESIA_FORMULA_CONFIG_EVENT, { detail: updated })
      );
      window.dispatchEvent(new Event('storage'));
    }
  } catch {}
  return updated;
}
