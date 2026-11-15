/**
 * Clinical Viva Questions Data Layer
 * Manages Senior Viva Questions (أسئلة العيادات - Operative Viva)
 * with access control (free / subscriber), visibility, and real-time synchronization.
 */

export interface ClinicVivaQuestion {
  id: string;
  question: string;
  questionEn?: string;
  answer?: string;
  answerEn?: string;
  accessType: 'free' | 'subscriber';
  createdAt: string;
  authorName?: string;
  tags?: string[];
}

export interface ClinicVivaSectionConfig {
  isVisible: boolean;
  accessType: 'free' | 'subscriber';
  title: string;
  titleEn: string;
  isDeleted?: boolean;
}

export const CLINIC_VIVA_STORAGE_KEY = 'clinic_viva_questions_cache';
export const CLINIC_VIVA_CONFIG_STORAGE_KEY = 'clinic_viva_section_config';
export const CLINIC_VIVA_UPDATED_EVENT = 'clinic_viva_questions_updated';

export const DEFAULT_CLINIC_VIVA_CONFIG: ClinicVivaSectionConfig = {
  isVisible: true,
  accessType: 'free',
  title: '🩺 أسئلة العيادات (Operative Viva)',
  titleEn: 'Operative Viva & Clinical Defense Bank',
  isDeleted: false,
};

export const DEFAULT_CLINIC_VIVA_QUESTIONS: ClinicVivaQuestion[] = [
  {
    id: 'q-microleakage-class-ii',
    question: '💡 ما سبب الـ Microleakage في Class II؟',
    questionEn: '💡 What are the primary etiologies of cervical microleakage in Class II restorations?',
    answer: 'ضعف العزل اللثوي، عدم ملاءمة الـ Matrix Band، معامل الإجهاد العالي (C-Factor)، عدم وضع طبقة Flowable Composite كبطانة مرنة، أو تبلمر غير كافٍ عند الحافة اللثوية العاجية.',
    answerEn: 'Inadequate cervical rubber dam isolation, poor sectional matrix/wedge adaptation resulting in gingival overhangs, high configuration factor (C-Factor = 2 before wall conversion), omitting a flowable resin stress-absorbing liner, and inadequate irradiance curing depth at the deep gingival dentin margin.',
    accessType: 'free',
    createdAt: new Date().toISOString(),
    authorName: 'د. حياة نافع فجر',
  },
  {
    id: 'q-c-factor-stress',
    question: '💡 ما هو الـ C-Factor وما تأثيره على إجهاد التقلص التصلبي للكومبوزيت؟',
    questionEn: '💡 Define Configuration Factor (C-Factor) and explain its biomechanical impact on polymerization shrinkage stress.',
    answer: 'هو نسبة السطوح الملتصقة (Bonded Surfaces) إلى السطوح الحرة غير الملتصقة (Unbonded Surfaces). كلما زادت النسبة زاد الإجهاد الميكانيكي، ويبلغ ذروته في Class I (5:1)، لذلك يُشترط التكديس المائل المنحرف (Oblique Incremental Technique).',
    answerEn: 'C-Factor is the ratio of bonded to unbonded restorative surfaces. A higher ratio impedes composite flow during setting, concentrating tensile stress at the hybrid layer. It peaks in Class I (5:1). Mitigated clinically via oblique incremental layering (≤2 mm) to maximize unbonded stress-relief surfaces.',
    accessType: 'free',
    createdAt: new Date().toISOString(),
    authorName: 'د. حياة نافع فجر',
  },
  {
    id: 'q-pulpitis-differential',
    question: '💡 كيف نميز سريرياً بين Reversible Pulpitis و Irreversible Pulpitis في العيادة؟',
    questionEn: '💡 How do you chairside differentiate between Reversible and Irreversible Pulpitis?',
    answer: 'في Reversible الألم يزول فور إزالة المحفز البارد (Cold Test) دون ألم تلقائي. في Irreversible الألم يستمر بنبض شديد (Lingering pain) لأكثر من 30 ثانية أو يحدث تلقائياً ليلاً دون محفز.',
    answerEn: 'In Reversible Pulpitis, cold-induced pain ceases within 2-5 seconds upon stimulus removal with zero nocturnal or spontaneous discomfort. In Irreversible Pulpitis, cold sensation provokes prolonged lingering, throbbing pain (>30 seconds) or awakens the patient spontaneously at night, indicating microvascular congestion.',
    accessType: 'subscriber',
    createdAt: new Date().toISOString(),
    authorName: 'د. حياة نافع فجر',
  },
  {
    id: 'q-bevel-contraindication',
    question: '💡 متى يُمنع استخدام الـ Bevel (الشطف) تماماً في حفر وترميمات الكومبوزيت؟',
    questionEn: '💡 When is cavosurface enamel beveling strictly contraindicated in composite preparations?',
    answer: 'يُمنع الشطف نهائياً على السطوح الإطباقية الحاملة لضغط المضغ (Occlusal Surfaces) لحماية حواف الكومبوزيت الرقيقة من الكسر، وعند الحواف اللثوية العاجية الواقعة تحت خط الميناء-الملاط (Dentin / Cementum Margins).',
    answerEn: 'Strictly contraindicated on functional occlusal surfaces bearing masticatory load (to prevent thin feather-edged resin chipping) and on root dentin/cementum gingival margins below the CEJ (where acid etching degrades collagen without creating micro-retentive prisms).',
    accessType: 'subscriber',
    createdAt: new Date().toISOString(),
    authorName: 'د. حياة نافع فجر',
  },
];

export function getLocalCachedClinicQuestions(): ClinicVivaQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_VIVA_QUESTIONS;
  try {
    const raw = localStorage.getItem(CLINIC_VIVA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults to guarantee questionEn/answerEn if present in defaults
        return parsed.map((item: ClinicVivaQuestion) => {
          const def = DEFAULT_CLINIC_VIVA_QUESTIONS.find((d) => d.id === item.id);
          return {
            ...item,
            questionEn: item.questionEn || def?.questionEn,
            answerEn: item.answerEn || def?.answerEn,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Failed to parse clinic viva questions from localStorage', err);
  }
  return DEFAULT_CLINIC_VIVA_QUESTIONS;
}

export function saveLocalCachedClinicQuestions(questions: ClinicVivaQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLINIC_VIVA_STORAGE_KEY, JSON.stringify(questions));
    window.dispatchEvent(new CustomEvent(CLINIC_VIVA_UPDATED_EVENT, { detail: questions }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Failed to save clinic viva questions to localStorage', err);
  }
}

export function getLocalCachedClinicConfig(): ClinicVivaSectionConfig {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_VIVA_CONFIG;
  try {
    const raw = localStorage.getItem(CLINIC_VIVA_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isVisible === 'boolean') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse clinic viva config from localStorage', err);
  }
  return DEFAULT_CLINIC_VIVA_CONFIG;
}

export function saveLocalCachedClinicConfig(config: ClinicVivaSectionConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLINIC_VIVA_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(CLINIC_VIVA_UPDATED_EVENT, { detail: config }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Failed to save clinic viva config to localStorage', err);
  }
}
