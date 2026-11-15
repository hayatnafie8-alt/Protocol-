import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useState, useEffect } from 'react';

export type TextModuleId =
  | 'drug_guide'
  | 'home_portal'
  | 'clinical_protocols'
  | 'security_notices'
  | 'general_labels';

export interface AppTextItem {
  key: string;
  module: TextModuleId;
  moduleLabelAr: string;
  labelAr: string;
  defaultText: string;
  currentText: string;
  isMultiline?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const INITIAL_APP_TEXTS: AppTextItem[] = [
  // 1. DRUG GUIDE (دليل وصف الأدوية)
  {
    key: 'drug_guide_main_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'العنوان الرئيسي لدليل الأدوية',
    defaultText: 'دليل وصف الأدوية السريري لطب الأسنان',
    currentText: 'دليل وصف الأدوية السريري لطب الأسنان',
  },
  {
    key: 'drug_guide_subtitle',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'الوصف الفرعي للدليل',
    defaultText: 'مرجع الجرعات السريرية المعتمدة، التداخلات مع المخدر الموضعي، ومحاذير الحالات المرضية الخاصة',
    currentText: 'مرجع الجرعات السريرية المعتمدة، التداخلات مع المخدر الموضعي، ومحاذير الحالات المرضية الخاصة',
    isMultiline: true,
  },
  {
    key: 'drug_guide_disclaimer',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'التنبيه والمسؤولية الطبية الأكاديمية',
    defaultText: 'هذا الدليل مخصص للأغراض التعليمية والاسترشادية السريرية لطلاب وأطباء الأسنان، ولا يعتبر بديلاً عن التشخيص الطبي السريري الشامل أو استشارة الطبيب البشري المختص.',
    currentText: 'هذا الدليل مخصص للأغراض التعليمية والاسترشادية السريرية لطلاب وأطباء الأسنان، ولا يعتبر بديلاً عن التشخيص الطبي السريري الشامل أو استشارة الطبيب البشري المختص.',
    isMultiline: true,
  },
  {
    key: 'cat_anemia_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'عنوان تصنيف فقر الدم واضطرابات النزف',
    defaultText: 'أدوية فقر الدم واضطرابات الدم والنزف',
    currentText: 'أدوية فقر الدم واضطرابات الدم والنزف',
  },
  {
    key: 'cat_anemia_desc',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'وصف تصنيف فقر الدم واضطرابات النزف',
    defaultText: 'أدوية الحديد، B12، بروتوكولات الهيموفيليا (Factor VIII/IX)، حمض الترانيكساميك، واحتياطات النزف قبل القلع والجراحة',
    currentText: 'أدوية الحديد، B12، بروتوكولات الهيموفيليا (Factor VIII/IX)، حمض الترانيكساميك، واحتياطات النزف قبل القلع والجراحة',
    isMultiline: true,
  },
  {
    key: 'cat_anticoag_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'عنوان تصنيف سيولة الدم والمميعات',
    defaultText: 'أدوية سيولة ومميعات الدم ومضادات الصفيحات',
    currentText: 'أدوية سيولة ومميعات الدم ومضادات الصفيحات',
  },
  {
    key: 'cat_anticoag_desc',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'وصف تصنيف سيولة الدم والمميعات',
    defaultText: 'الأسبرين، بلافيكس (Clopidogrel)، الوارفارين، ومميعات NOACs مع إرشادات تجنب النزف وتدابير القلع الجراحي',
    currentText: 'الأسبرين، بلافيكس (Clopidogrel)، الوارفارين، ومميعات NOACs مع إرشادات تجنب النزف وتدابير القلع الجراحي',
    isMultiline: true,
  },
  {
    key: 'cat_antibiotics_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'عنوان تصنيف المضادات الحيوية',
    defaultText: 'المضادات الحيوية السنية ووقاية القلب (AHA)',
    currentText: 'المضادات الحيوية السنية ووقاية القلب (AHA)',
  },
  {
    key: 'cat_antibiotics_desc',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'وصف تصنيف المضادات الحيوية',
    defaultText: 'خط البداية الأول، بدائل حساسية البنسلين، وجرعات الوقاية المعتمدة من التهاب الشغاف الجرثومي (Infective Endocarditis)',
    currentText: 'خط البداية الأول، بدائل حساسية البنسلين، وجرعات الوقاية المعتمدة من التهاب الشغاف الجرثومي (Infective Endocarditis)',
    isMultiline: true,
  },
  {
    key: 'cat_sedatives_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'عنوان تصنيف المهدئات وقلق الأسنان',
    defaultText: 'أدوية المهدئات وعلاج قلق ورهاب الأسنان',
    currentText: 'أدوية المهدئات وعلاج قلق ورهاب الأسنان',
  },
  {
    key: 'cat_sedatives_desc',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'وصف تصنيف المهدئات وقلق الأسنان',
    defaultText: 'البنزوديازيبينات (Diazepam, Alprazolam)، مهدئات ما قبل الجلسة، وتداخلاتها مع المخدر الموضعي وتثبيط التنفس',
    currentText: 'البنزوديازيبينات (Diazepam, Alprazolam)، مهدئات ما قبل الجلسة، وتداخلاتها مع المخدر الموضعي وتثبيط التنفس',
    isMultiline: true,
  },
  {
    key: 'cat_thyroid_title',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'عنوان تصنيف أدوية الغدة الدرقية',
    defaultText: 'أدوية الغدة الدرقية ومحاذير التخدير',
    currentText: 'أدوية الغدة الدرقية ومحاذير التخدير',
  },
  {
    key: 'cat_thyroid_desc',
    module: 'drug_guide',
    moduleLabelAr: 'دليل وصف الأدوية',
    labelAr: 'وصف تصنيف أدوية الغدة الدرقية',
    defaultText: 'أدوية قصور الغدة (Levothyroxine) وفرط النشاط (Carbimazole) مع التحذير الحاسم من الإبينفرين والعاصفة الدرقية',
    currentText: 'أدوية قصور الغدة (Levothyroxine) وفرط النشاط (Carbimazole) مع التحذير الحاسم من الإبينفرين والعاصفة الدرقية',
    isMultiline: true,
  },

  // 2. HOME PORTAL (البوابة الرئيسية)
  {
    key: 'home_welcome_title',
    module: 'home_portal',
    moduleLabelAr: 'البوابة الرئيسية',
    labelAr: 'عنوان الترحيب الرئيسي بالبوابة',
    defaultText: 'بروتوكول طب الأسنان السريري',
    currentText: 'بروتوكول طب الأسنان السريري',
  },
  {
    key: 'home_welcome_subtitle',
    module: 'home_portal',
    moduleLabelAr: 'البوابة الرئيسية',
    labelAr: 'الشعار الأكاديمي التعريفي',
    defaultText: 'المنصة الأكاديمية والسريرية المعتمدة لتدريب وتأهيل أطباء وطلاب طب الأسنان',
    currentText: 'المنصة الأكاديمية والسريرية المعتمدة لتدريب وتأهيل أطباء وطلاب طب الأسنان',
    isMultiline: true,
  },
  {
    key: 'home_author_title',
    module: 'home_portal',
    moduleLabelAr: 'البوابة الرئيسية',
    labelAr: 'اسم وصفة المشرفة الأكاديمية',
    defaultText: 'إعداد وتصميم المشرفة: د. حياه نافع فجر',
    currentText: 'إعداد وتصميم المشرفة: د. حياه نافع فجر',
  },
  {
    key: 'home_viva_title',
    module: 'home_portal',
    moduleLabelAr: 'البوابة الرئيسية',
    labelAr: 'عنوان قسم اختبار فيفا العيادات',
    defaultText: 'بنك أسئلة وفيفا العيادات السريرية (Clinical Viva)',
    currentText: 'بنك أسئلة وفيفا العيادات السريرية (Clinical Viva)',
  },
  {
    key: 'home_viva_desc',
    module: 'home_portal',
    moduleLabelAr: 'البوابة الرئيسية',
    labelAr: 'وصف قسم اختبار فيفا العيادات',
    defaultText: 'أسئلة تفاعلية فورية تحاكي أسئلة المشرفين والأطباء داخل العيادة أثناء المعالجة',
    currentText: 'أسئلة تفاعلية فورية تحاكي أسئلة المشرفين والأطباء داخل العيادة أثناء المعالجة',
    isMultiline: true,
  },

  // 3. CLINICAL PROTOCOLS & RESTORATIONS (البروتوكولات السريرية)
  {
    key: 'protocol_class1_title',
    module: 'clinical_protocols',
    moduleLabelAr: 'البروتوكولات السريرية',
    labelAr: 'عنوان بروتوكول Class I',
    defaultText: 'بروتوكول حشوات الصنف الأول (Class I Restoration)',
    currentText: 'بروتوكول حشوات الصنف الأول (Class I Restoration)',
  },
  {
    key: 'protocol_class1_desc',
    module: 'clinical_protocols',
    moduleLabelAr: 'البروتوكولات السريرية',
    labelAr: 'وصف بروتوكول Class I',
    defaultText: 'خطوات التحضير المحافظ، العزل بالحاجز المطاطي، التخريش، والربط العاجي وتطبيق الكومبوزيت الطبقي',
    currentText: 'خطوات التحضير المحافظ، العزل بالحاجز المطاطي، التخريش، والربط العاجي وتطبيق الكومبوزيت الطبقي',
    isMultiline: true,
  },
  {
    key: 'protocol_class2_title',
    module: 'clinical_protocols',
    moduleLabelAr: 'البروتوكولات السريرية',
    labelAr: 'عنوان بروتوكول Class II',
    defaultText: 'بروتوكول حشوات الصنف الثاني (Class II Restoration & Matrix)',
    currentText: 'بروتوكول حشوات الصنف الثاني (Class II Restoration & Matrix)',
  },
  {
    key: 'protocol_class2_desc',
    module: 'clinical_protocols',
    moduleLabelAr: 'البروتوكولات السريرية',
    labelAr: 'وصف بروتوكول Class II',
    defaultText: 'بناء الجدار الملاصق بنظام المسندة الجزئية (Sectional Matrix System) ونقاط التماس المحكمة',
    currentText: 'بناء الجدار الملاصق بنظام المسندة الجزئية (Sectional Matrix System) ونقاط التماس المحكمة',
    isMultiline: true,
  },

  // 4. SECURITY & COPYRIGHT NOTICES (حماية المحتوى والتنبيهات)
  {
    key: 'security_shield_title',
    module: 'security_notices',
    moduleLabelAr: 'الأمان وحماية المحتوى',
    labelAr: 'عنوان درع منع التقاط الشاشة',
    defaultText: 'محتوى محمي ضد الالتقاط والتصوير 🔒',
    currentText: 'محتوى محمي ضد الالتقاط والتصوير 🔒',
  },
  {
    key: 'security_shield_body',
    module: 'security_notices',
    moduleLabelAr: 'الأمان وحماية المحتوى',
    labelAr: 'نص إشعار درع الحماية عند محاولة التصوير',
    defaultText: 'تطبق كافة قواعد منع النسخ، التمويه التلقائي عند التبديل، وحجب التسجيل لحماية الملكية الأكاديمية.',
    currentText: 'تطبق كافة قواعد منع النسخ، التمويه التلقائي عند التبديل، وحجب التسجيل لحماية الملكية الأكاديمية.',
    isMultiline: true,
  },
  {
    key: 'security_watermark_text',
    module: 'security_notices',
    moduleLabelAr: 'الأمان وحماية المحتوى',
    labelAr: 'نص العلامة المائية في الطباعة المعتمدة',
    defaultText: 'محتوى خاص ومعتمد - بروتوكول طب الأسنان | د. حياه نافع فجر | يحظر النشر أو التوزيع بدون إذن',
    currentText: 'محتوى خاص ومعتمد - بروتوكول طب الأسنان | د. حياه نافع فجر | يحظر النشر أو التوزيع بدون إذن',
    isMultiline: true,
  },
];

const LOCAL_STORAGE_TEXTS_KEY = 'dental_custom_app_texts_v1';
const FIRESTORE_DOC_PATH = ['app_config', 'custom_app_texts'] as const;

/**
 * Get cached overrides map: { [key: string]: string }
 */
export function getCachedTextOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TEXTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

/**
 * Save cached overrides map
 */
export function saveCachedTextOverrides(overrides: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TEXTS_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('dental_custom_app_texts_updated', { detail: overrides }));
  } catch {}
}

/**
 * Get active text for a key (override if present, else fallback)
 */
export function getAppText(key: string, fallbackDefault?: string): string {
  const overrides = getCachedTextOverrides();
  if (overrides[key] !== undefined && overrides[key].trim() !== '') {
    return overrides[key];
  }
  const found = INITIAL_APP_TEXTS.find((t) => t.key === key);
  return found ? found.defaultText : fallbackDefault || '';
}

/**
 * React Hook for live dynamic text in components
 */
export function useAppText(key: string, fallbackDefault?: string): string {
  const [text, setText] = useState<string>(() => getAppText(key, fallbackDefault));

  useEffect(() => {
    const handleUpdate = () => {
      setText(getAppText(key, fallbackDefault));
    };
    window.addEventListener('dental_custom_app_texts_updated', handleUpdate);
    return () => window.removeEventListener('dental_custom_app_texts_updated', handleUpdate);
  }, [key, fallbackDefault]);

  return text;
}

/**
 * Subscribe to cloud text overrides with local cache fallback
 */
export function subscribeToAppTextsCloud(
  callback: (overrides: Record<string, string>) => void
): () => void {
  // Emit initial cache
  callback(getCachedTextOverrides());

  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = (snapshot.data()?.texts || {}) as Record<string, string>;
          saveCachedTextOverrides(data);
          callback(data);
        } else {
          // Initialize empty
          setDoc(docRef, { texts: {}, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
          callback({});
        }
      },
      (error) => {
        console.warn('[AppTextManager] Cloud text listener error, using cache:', error);
        callback(getCachedTextOverrides());
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('[AppTextManager] Failed to subscribe to cloud texts:', error);
    return () => {};
  }
}

/**
 * Save / Update a single text override in Cloud & Local Cache
 */
export async function saveAppTextOverrideInCloud(
  key: string,
  newText: string,
  adminName = 'المشرف العام'
): Promise<void> {
  const overrides = getCachedTextOverrides();
  const updatedOverrides = {
    ...overrides,
    [key]: newText.trim(),
  };

  saveCachedTextOverrides(updatedOverrides);

  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    await setDoc(
      docRef,
      {
        texts: updatedOverrides,
        updatedAt: new Date().toISOString(),
        updatedBy: adminName,
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[AppTextManager] Failed to save text override to cloud, stored locally:', error);
  }
}

/**
 * Reset a single text override back to system default
 */
export async function resetAppTextToDefaultInCloud(
  key: string,
  adminName = 'المشرف العام'
): Promise<void> {
  const overrides = getCachedTextOverrides();
  const updatedOverrides = { ...overrides };
  delete updatedOverrides[key];

  saveCachedTextOverrides(updatedOverrides);

  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    await setDoc(
      docRef,
      {
        texts: updatedOverrides,
        updatedAt: new Date().toISOString(),
        updatedBy: adminName,
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[AppTextManager] Failed to reset text override in cloud:', error);
  }
}

/**
 * Reset all text overrides
 */
export async function resetAllAppTextsToDefaultInCloud(): Promise<void> {
  saveCachedTextOverrides({});
  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    await setDoc(docRef, { texts: {}, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Error clearing text overrides in cloud:', err);
  }
}
