/**
 * In-Clinic Pre-Procedure Checklist (قائمة التحقق السريري قبل الإجراء)
 * Designed for dental students and clinicians to prevent procedural omissions
 * during clinical stress, exams, and high patient volume.
 */

export interface PreProcedureChecklistItem {
  id: string;
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'safety' | 'legal' | 'clinical' | 'setup';
  isCore: boolean; // Cannot be deleted by admin; standard universal patient safety
  protocolId?: string; // 'all' or specific protocol like 'class-1', 'surgical', etc.
  iconName?: string;
}

export const CORE_PRE_PROCEDURE_STEPS: PreProcedureChecklistItem[] = [
  {
    id: 'core-vital-signs',
    stepNumber: 1,
    titleAr: 'قياس العلامات الحيوية وضغط الدم',
    titleEn: 'Patient Vital Signs & Blood Pressure Screening',
    descriptionAr:
      'قياس ضغط الدم والنبض للتأكد من استقرار المريض قبل حقن التخدير (أقصى ضغط مسموح به للعلاج الروتيني دون إحالة: 160/100 mmHg).',
    descriptionEn:
      'Screen BP and heart rate before local anesthesia. Defer elective treatment if BP > 160/100 mmHg without physician consultation.',
    category: 'safety',
    isCore: true,
    protocolId: 'all',
    iconName: 'Activity',
  },
  {
    id: 'core-medical-history',
    stepNumber: 2,
    titleAr: 'مراجعة التاريخ المرضي وفحص التحسس',
    titleEn: 'Comprehensive Medical History & Allergy Verification',
    descriptionAr:
      'التأكد من عدم وجود حساسية تجاه الأدوية (بنسلين، سلفيت، مخدر)، وفحص أمراض القلب، السكري، النزاف، أو الحمل عند الإناث.',
    descriptionEn:
      'Verify systemic conditions, drug allergies (antibiotics, sulfites, latex), anticoagulant medications, and pregnancy status.',
    category: 'safety',
    isCore: true,
    protocolId: 'all',
    iconName: 'ShieldAlert',
  },
  {
    id: 'core-supervisor-approval',
    stepNumber: 3,
    titleAr: 'أخذ موافقة وتوقيع المشرف السريري قبل البدء',
    titleEn: 'Faculty / Supervisor Case Approval Sign-off',
    descriptionAr:
      'عرض خطة العلاج والتشخيص على أستاذ / مشرف العيادة وتوقيع ملف المريض قبل البدء بأي خطوة لا رجعة فيها (Irreversible step).',
    descriptionEn:
      'Present treatment plan, tooth evaluation, and diagnostic findings to the clinical faculty for formal sign-off.',
    category: 'legal',
    isCore: true,
    protocolId: 'all',
    iconName: 'UserCheck',
  },
  {
    id: 'core-tray-setup',
    stepNumber: 4,
    titleAr: 'تجهيز وتعقيم الأدوات والمواد الخاصة بالحالة',
    titleEn: 'Instrument & Tray Setup Verification',
    descriptionAr:
      'التأكد من اكتمال صينية الأدوات المعقمة، القبضات (Handpieces)، السنابل المناسبة، كاسيت العزل، ومواد الترميم لتجنب التوقف أثناء العمل.',
    descriptionEn:
      'Confirm sterile tray setup, sharp burs, restorative materials, microbrushes, and curing light functionality prior to patient seating.',
    category: 'setup',
    isCore: true,
    protocolId: 'all',
    iconName: 'Wrench',
  },
  {
    id: 'core-radiograph-check',
    stepNumber: 5,
    titleAr: 'فحص وتأكيد الأشعة السابقة للعمل',
    titleEn: 'Pre-operative Radiograph Check',
    descriptionAr:
      'معاينة صورة الأشعة الحديثة (Bitewing / Periapical) لتقييم عمق النخر، مجاورة اللب، وجود آفات ذروية، وشكل الجذور.',
    descriptionEn:
      'Review pre-op diagnostic radiographs (PA/BW) to determine caries depth, proximity to dental pulp, and bone levels.',
    category: 'clinical',
    isCore: true,
    protocolId: 'all',
    iconName: 'FileText',
  },
  {
    id: 'core-informed-consent',
    stepNumber: 6,
    titleAr: 'التأكد من موافقة المريض المستنيرة',
    titleEn: 'Patient Informed Consent',
    descriptionAr:
      'شرح الإجراء، المضاعفات المحتملة (مثل حساسية ما بعد العلاج)، التكلفة، وأخذ توقيع المريض أو ولي أمره رسمياً.',
    descriptionEn:
      'Explain procedure, prognosis, potential post-op sensitivity, and verify the patient signed the informed consent document.',
    category: 'legal',
    isCore: true,
    protocolId: 'all',
    iconName: 'ClipboardCheck',
  },
];

// Protocol-specific bonus presets
export const PROTOCOL_SPECIFIC_PRESETS: Record<string, PreProcedureChecklistItem[]> = {
  'class-1': [
    {
      id: 'spec-c1-rubberdam',
      stepNumber: 7,
      titleAr: 'تجربة مقاس الربر دام والكلاب (W8A / #14)',
      titleEn: 'Rubber Dam Clamp Selection & Floss Ligature',
      descriptionAr: 'اختيار كلاب مناسب وتأمينه بخيط تنظيف الأسنان (Floss safety tether) قبل وضعه على الضرس.',
      descriptionEn: 'Select appropriate clamp (W8A / #14) with dental floss tether for airway protection.',
      category: 'clinical',
      isCore: false,
      protocolId: 'class-1',
    },
  ],
  'class-2': [
    {
      id: 'spec-c2-matrix',
      stepNumber: 7,
      titleAr: 'تجهيز نظام الماتريكس الحلقي والأوتاد (Sectional Matrix)',
      titleEn: 'Sectional Matrix Band, Wedge & Ring Preparation',
      descriptionAr: 'اختيار شريحة الماتريكس المحدبة المناسبة والوتد المطابق لمنع حدوث overhang ولضمان نقطة تماس محكمة.',
      descriptionEn: 'Verify sectional matrix band height, anatomical wedge, and separator ring for tight contact point.',
      category: 'clinical',
      isCore: false,
      protocolId: 'class-2',
    },
  ],
  'surgical': [
    {
      id: 'spec-surg-gauze',
      stepNumber: 7,
      titleAr: 'تجهيز شاش الضغط المعقم ورافعة الجذور وخياطة الجرح',
      titleEn: 'Sterile Gauze Pressure Pack & Suture Kit',
      descriptionAr: 'التأكد من وجود شاش معقم كافٍ، رافعة مستقيمة، وقبضة جراحية بدون رذاذ هوائي مباشر لتفادي Emphysema.',
      descriptionEn: 'Ensure sterile pressure gauze packs, straight elevators, and surgical handpiece ready.',
      category: 'clinical',
      isCore: false,
      protocolId: 'surgical',
    },
  ],
};

const STORAGE_CUSTOM_ITEMS_KEY = 'dental_pre_proc_custom_items_v1';
const SESSION_CHECKED_KEY_PREFIX = 'dental_pre_proc_checked_';

/**
 * Get all available checklist items for a given protocol ID.
 * Merges Universal Core Steps + Protocol-specific steps + Admin custom items.
 */
export function getChecklistItemsForProtocol(protocolId: string = 'all'): PreProcedureChecklistItem[] {
  const core = [...CORE_PRE_PROCEDURE_STEPS];
  const specific = PROTOCOL_SPECIFIC_PRESETS[protocolId] || [];

  let customItems: PreProcedureChecklistItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customItems = parsed.filter(
          (item) => item.protocolId === 'all' || item.protocolId === protocolId
        );
      }
    }
  } catch (err) {
    console.warn('Failed to load custom checklist items:', err);
  }

  // Combine and sort by stepNumber
  const combined = [...core, ...specific, ...customItems];
  return combined.map((item, idx) => ({
    ...item,
    stepNumber: idx + 1,
  }));
}

/**
 * Retrieve session checked item IDs for a given protocol
 */
export function getSessionCheckedItems(protocolId: string = 'all'): string[] {
  const key = `${SESSION_CHECKED_KEY_PREFIX}${protocolId}`;
  try {
    // Check sessionStorage first (persistent within browser tab session)
    const sessionRaw = sessionStorage.getItem(key);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback to localStorage
    const localRaw = localStorage.getItem(key);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Toggle checkmark state for an item in current clinical session
 */
export function toggleSessionCheckItem(protocolId: string = 'all', itemId: string): string[] {
  const current = getSessionCheckedItems(protocolId);
  const exists = current.includes(itemId);
  const next = exists ? current.filter((id) => id !== itemId) : [...current, itemId];
  const key = `${SESSION_CHECKED_KEY_PREFIX}${protocolId}`;

  try {
    sessionStorage.setItem(key, JSON.stringify(next));
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}

  // Dispatch global window event for cross-component sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pre-procedure-checklist-updated', {
        detail: { protocolId, checkedIds: next },
      })
    );
  }

  return next;
}

/**
 * Reset all checks for a protocol (Ready for next patient)
 */
export function resetSessionChecklist(protocolId: string = 'all'): void {
  const key = `${SESSION_CHECKED_KEY_PREFIX}${protocolId}`;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pre-procedure-checklist-updated', {
        detail: { protocolId, checkedIds: [] },
      })
    );
  }
}

/**
 * Mark all steps completed in one click
 */
export function markAllSessionChecklist(protocolId: string = 'all'): string[] {
  const items = getChecklistItemsForProtocol(protocolId);
  const allIds = items.map((i) => i.id);
  const key = `${SESSION_CHECKED_KEY_PREFIX}${protocolId}`;

  try {
    sessionStorage.setItem(key, JSON.stringify(allIds));
    localStorage.setItem(key, JSON.stringify(allIds));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pre-procedure-checklist-updated', {
        detail: { protocolId, checkedIds: allIds },
      })
    );
  }

  return allIds;
}

/**
 * Admin: Add a new custom checklist step template
 */
export function addAdminCustomChecklistItem(
  item: Omit<PreProcedureChecklistItem, 'id' | 'stepNumber' | 'isCore'>
): PreProcedureChecklistItem {
  const id = `custom-step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newItem: PreProcedureChecklistItem = {
    ...item,
    id,
    stepNumber: 99,
    isCore: false,
  };

  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_ITEMS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [...existing, newItem];
    localStorage.setItem(STORAGE_CUSTOM_ITEMS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom item:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pre-procedure-template-updated'));
  }

  return newItem;
}

/**
 * Admin: Delete a custom checklist step template
 */
export function deleteAdminCustomChecklistItem(itemId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_ITEMS_KEY);
    if (!raw) return;
    const existing: PreProcedureChecklistItem[] = JSON.parse(raw);
    const updated = existing.filter((item) => item.id !== itemId);
    localStorage.setItem(STORAGE_CUSTOM_ITEMS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom item:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pre-procedure-template-updated'));
  }
}
