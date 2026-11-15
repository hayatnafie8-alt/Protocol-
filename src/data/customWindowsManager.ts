/**
 * Custom Windows & Cards Manager
 * Stores dynamic admin-created windows/cards persistently in localStorage
 * Key: 'protocol_custom_windows'
 * Event: 'protocol_custom_windows_updated'
 */

export const PROTOCOL_CUSTOM_WINDOWS_STORAGE_KEY = 'protocol_custom_windows';
export const PROTOCOL_CUSTOM_WINDOWS_EVENT = 'protocol_custom_windows_updated';

export const DENTIN_HYPERSENSITIVITY_SEED_ID = 'cw-seed-1';

export type CustomWindowTargetLocation = 'clinical_companion' | 'skills' | 'more' | 'protocols' | 'home';
export type CustomWindowContentType = 'text' | 'checklist' | 'link';

export interface CustomWindowChecklistItem {
  id: string;
  text: string;
  completed?: boolean;
}

export interface CustomWindow {
  id: string;
  title: string;
  subtitle?: string;
  targetLocation: CustomWindowTargetLocation;
  contentType: CustomWindowContentType;
  content: string; // The complete detailed text, checklist source, or link notes
  externalUrl?: string; // Direct link if contentType === 'link'
  checklistItems?: CustomWindowChecklistItem[]; // Array of structured items if contentType === 'checklist'
  badge?: string; // e.g. "بروتوكول سريري", "قائمة فحص", "مرجع موثوق"
  icon?: string; // e.g. "Stethoscope", "ClipboardCheck", "Pill", "Sparkles", "Link", "FileText", "Syringe", "Bookmark"
  colorScheme?: 'olive' | 'gold' | 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose';
  requiresSubscription?: boolean; // false = free public, true = requires active subscription
  isHidden: boolean; // true = hidden, false = visible
  createdAt: string;
  author?: string;
}

/**
 * High-yield default clinical seed windows for demonstration and instant clinical utility.
 */
export const DEFAULT_CUSTOM_WINDOWS: CustomWindow[] = [
  {
    id: 'cw-seed-1',
    title: 'بروتوكول علاج فرط التحسس العاجي (Dentin Hypersensitivity)',
    subtitle: 'خطوات التشخيص السريري، مواد إغلاق الأنابيب العاجية، وتعليمات المريض',
    targetLocation: 'clinical_companion',
    contentType: 'text',
    content: `• التشخيص السريري:
1. التحقق من سلامة اللب عبر الفحص الحراري واختبار الكهرباء اللبية لنفي التهاب اللب غير الردود (Irreversible Pulpitis).
2. فحص مناطق التراجع اللثوي والانكشاف العنقي (NCCLs / Abfraction / Erosion).

• خيارات المعالجة في العيادة:
1. تطبيق ورنيش الفلورايد المركز (Fluoride Varnish 5% NaF) لتشكيل بلورات CaF2 وسد الأنابيب.
2. تطبيق عوامل الربط العاجي أو مستحضرات الجلوتارالدهيد مع HEMA (مثل Gluma Desensitizer) لتخثير بروتينات السائل العاجي فوراً.
3. في الحالات الشديدة: ترميم عنقي بكومبوزيت دقيق أو زجاجي الشاردة (Flowable Composite / RMGI).

• إرشادات المريض المنزلية:
- استخدام معجون أسنان يحتوي على نترات البوتاسيوم (Potassium Nitrate) لتهدئة الألياف العصبية الحسية.
- استخدام فرشاة فائقة النعومة وتجنب التفريش الأفقي العنيف.
- تجنب المشروبات شديدة الحموضة فوراً بعد تفريش الأسنان.`,
    badge: 'بروتوكول معتمد',
    icon: 'Stethoscope',
    colorScheme: 'olive',
    requiresSubscription: false,
    isHidden: false,
    createdAt: new Date().toISOString(),
    author: 'د. حياة نافع فجر',
  },
  {
    id: 'cw-seed-2',
    title: 'قائمة التحقق من تعقيم وضبط التورباين والأدوات الدوارة',
    subtitle: 'معايير مكافحة العدوى والسلامة البيولوجية اليومية قبل بدء المعالجة',
    targetLocation: 'home',
    contentType: 'checklist',
    content: `فحص ضغط الهواء للتورباين بين 2.2 إلى 2.5 بار لضمان عزم الدوران
تشغيل التورباين بدون ماء لمدة 30 ثانية لتفريغ الخطوط المائية وتجنب الركود
التأكد من التزييت الدوري بالزيت الطبي المخصص قبل إدخاله الأوتوكلاف
التحقق من المؤشر الكيميائي لشريط الأوتوكلاف على كيس التعقيم المزدوج
فحص قفل السنابل (Chuck System) لمنع انزلاق السنبلة أثناء الحفر السريري`,
    checklistItems: [
      { id: 'item-1', text: 'فحص ضغط الهواء للتورباين بين 2.2 إلى 2.5 بار لضمان عزم الدوران', completed: false },
      { id: 'item-2', text: 'تشغيل التورباين بدون ماء لمدة 30 ثانية لتفريغ الخطوط المائية وتجنب الركود', completed: false },
      { id: 'item-3', text: 'التأكد من التزييت الدوري بالزيت الطبي المخصص قبل إدخاله الأوتوكلاف', completed: false },
      { id: 'item-4', text: 'التحقق من المؤشر الكيميائي لشريط الأوتوكلاف على كيس التعقيم المزدوج', completed: false },
      { id: 'item-5', text: 'فحص قفل السنابل (Chuck System) لمنع انزلاق السنبلة أثناء الحفر السريري', completed: false },
    ],
    badge: 'قائمة فحص سريرية',
    icon: 'ClipboardCheck',
    colorScheme: 'emerald',
    requiresSubscription: false,
    isHidden: false,
    createdAt: new Date().toISOString(),
    author: 'د. حياة نافع فجر',
  },
  {
    id: 'cw-seed-3',
    title: 'بروتوكول المضادات الحيوية والوقاية من التهاب الشغاف (ADA & AHA Guidelines)',
    subtitle: 'الجرعات الوقائية المعتمدة قبل الإجراءات السريرية الجراحية لطب الأسنان',
    targetLocation: 'protocols',
    contentType: 'text',
    content: `البروتوكول الأكاديمي المعتمد من الجمعية الأمريكية لطب الأسنان (ADA) وجمعية القلب الأمريكية (AHA):
1. للمرضى البالغين بدون حساسية بنسلين:
   - Amoxicillin: جرعة فموية 2g (أو 50mg/kg للأطفال) قبل الإجراء بـ 30 إلى 60 دقيقة.
2. للمرضى الذين يعانون من حساسية البنسلين:
   - Cephalexin: جرعة 2g (إذا لم تكن الحساسية من نوع anaphylaxis).
   - Azithromycin أو Clarithromycin: جرعة 500mg قبل الإجراء بـ 30-60 دقيقة.
   - Doxycycline: جرعة 100mg للبالغين.
3. معايير الخطورة العالية التي تستوجب التغطية الوقائية:
   - الصمامات القلبية الاصطناعية (Prosthetic cardiac valves).
   - سوابق الإصابة بالتهاب الشغاف الجرثومي (Previous infective endocarditis).
   - أمراض القلب الخلقية غير المعالجة (Unrepaired cyanotic congenital heart disease).`,
    badge: 'بروتوكول أكاديمي معتمد',
    icon: 'BookOpen',
    colorScheme: 'sky',
    requiresSubscription: false,
    isHidden: false,
    createdAt: new Date().toISOString(),
    author: 'د. حياة نافع فجر',
  },
];

/**
 * Ensure all custom window IDs in an array are unique.
 */
export function deduplicateCustomWindows(list: CustomWindow[]): CustomWindow[] {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const uniqueList: CustomWindow[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item) continue;
    let itemId = item.id;
    if (!itemId || seenIds.has(itemId)) {
      itemId = itemId ? `${itemId}_dup_${i}_${Math.random().toString(36).substring(2, 6)}` : `cw_${Date.now()}_${i}`;
    }
    seenIds.add(itemId);
    uniqueList.push({ ...item, id: itemId });
  }

  return uniqueList;
}

/**
 * Retrieve custom windows array from localStorage with fallback to default seed windows.
 */
export function getCustomWindows(): CustomWindow[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_WINDOWS;
  try {
    const raw = localStorage.getItem(PROTOCOL_CUSTOM_WINDOWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deduped = deduplicateCustomWindows(parsed);
        if (deduped.length !== parsed.length) {
          try {
            localStorage.setItem(PROTOCOL_CUSTOM_WINDOWS_STORAGE_KEY, JSON.stringify(deduped));
          } catch {}
        }
        return deduped;
      }
    }
  } catch (err) {
    console.error('Failed to parse protocol_custom_windows from localStorage', err);
  }
  // Initialize with seed data on first load
  try {
    localStorage.setItem(PROTOCOL_CUSTOM_WINDOWS_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_WINDOWS));
  } catch {}
  return DEFAULT_CUSTOM_WINDOWS;
}

/**
 * Persist custom windows to localStorage and broadcast event across components.
 */
export function saveCustomWindows(windowsList: CustomWindow[]): void {
  if (typeof window === 'undefined') return;
  try {
    const deduped = deduplicateCustomWindows(windowsList);
    localStorage.setItem(PROTOCOL_CUSTOM_WINDOWS_STORAGE_KEY, JSON.stringify(deduped));
    window.dispatchEvent(
      new CustomEvent(PROTOCOL_CUSTOM_WINDOWS_EVENT, { detail: deduped })
    );
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save protocol_custom_windows to localStorage', err);
  }
}

/**
 * Helper to parse newline or bullet items into checklist structure
 */
export function parseChecklistItems(content: string): CustomWindowChecklistItem[] {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, idx) => {
    // Strip leading dashes, bullets, numbers, etc.
    const cleanText = line.replace(/^[\s•\-\*\d+\.\)]+/, '').trim();
    return {
      id: `chk-${Date.now()}-${idx}`,
      text: cleanText || line,
      completed: false,
    };
  });
}

/**
 * Add a new custom window and return the created object.
 */
export function addCustomWindow(
  windowData: Omit<CustomWindow, 'id' | 'createdAt' | 'isHidden'> & {
    isHidden?: boolean;
    id?: string;
  }
): CustomWindow {
  const currentList = getCustomWindows();
  const id = windowData.id || `cw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  let checklistItems = windowData.checklistItems;
  if (windowData.contentType === 'checklist' && (!checklistItems || checklistItems.length === 0)) {
    checklistItems = parseChecklistItems(windowData.content);
  }

  const newWindow: CustomWindow = {
    ...windowData,
    id,
    createdAt,
    isHidden: windowData.isHidden ?? false,
    checklistItems,
    author: windowData.author || 'د. حياة نافع فجر',
  };

  const filteredList = windowData.id ? currentList.filter((w) => w.id !== windowData.id) : currentList;
  const updatedList = [newWindow, ...filteredList];
  saveCustomWindows(updatedList);
  return newWindow;
}

/**
 * Update an existing custom window by ID.
 */
export function updateCustomWindow(id: string, updates: Partial<CustomWindow>): CustomWindow[] {
  const currentList = getCustomWindows();
  const updatedList = currentList.map((win) => {
    if (win.id !== id) return win;

    const merged = { ...win, ...updates };
    if (merged.contentType === 'checklist' && updates.content && (!updates.checklistItems || updates.checklistItems.length === 0)) {
      merged.checklistItems = parseChecklistItems(updates.content);
    }
    return merged;
  });

  saveCustomWindows(updatedList);
  return updatedList;
}

/**
 * Delete a custom window by ID.
 */
export function deleteCustomWindow(id: string): CustomWindow[] {
  const currentList = getCustomWindows();
  const updatedList = currentList.filter((win) => win.id !== id);
  saveCustomWindows(updatedList);
  return updatedList;
}

/**
 * Duplicate a custom window with a new unique ID.
 */
export function duplicateCustomWindow(id: string): {
  windows: CustomWindow[];
  newWindow: CustomWindow | null;
} {
  const currentList = getCustomWindows();
  const source = currentList.find((win) => win.id === id);
  if (!source) {
    return { windows: currentList, newWindow: null };
  }

  const newId = `cw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const duplicated: CustomWindow = {
    ...source,
    id: newId,
    title: `${source.title} (نسخة)`,
    createdAt: new Date().toISOString(),
  };

  const index = currentList.findIndex((win) => win.id === id);
  const updatedList = [...currentList];
  updatedList.splice(index + 1, 0, duplicated);
  saveCustomWindows(updatedList);
  return { windows: updatedList, newWindow: duplicated };
}

/**
 * Toggle subscription / code-gated access for a custom window.
 */
export function toggleCustomWindowSubscription(id: string): CustomWindow[] {
  const currentList = getCustomWindows();
  const updatedList = currentList.map((win) => {
    if (win.id === id) {
      return { ...win, requiresSubscription: !win.requiresSubscription };
    }
    return win;
  });
  saveCustomWindows(updatedList);
  return updatedList;
}

/**
 * Toggle hidden state for a custom window.
 */
export function toggleCustomWindowHidden(id: string): CustomWindow[] {
  const currentList = getCustomWindows();
  const updatedList = currentList.map((win) => {
    if (win.id === id) {
      return { ...win, isHidden: !win.isHidden };
    }
    return win;
  });
  saveCustomWindows(updatedList);
  return updatedList;
}

/**
 * Get active custom windows for a specific target location.
 */
export function getCustomWindowsForLocation(
  location: CustomWindowTargetLocation,
  includeHidden = false
): CustomWindow[] {
  const all = getCustomWindows();
  return all.filter((win) => {
    if (win.targetLocation !== location) return false;
    if (!includeHidden && win.isHidden) return false;
    return true;
  });
}
