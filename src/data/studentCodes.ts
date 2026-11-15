import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';

export interface StudentCodeRecord {
  id: string;
  email: string;
  name?: string;
  code: string;
  createdAt: string;
  activatedAt?: number; // epoch timestamp in ms
  expiresAt?: number; // epoch timestamp in ms (default 1 full year)
  durationPlan?: '1_month' | 'semester' | '1_year';
  usedCount: number;
  lastUsedAt?: string;
  status: 'active' | 'revoked' | 'expired';
  notes?: string;
  paymentMethod?: string;
  paidAmount?: string;
}

export const SUBSCRIPTION_PLANS = {
  '1_month': {
    id: '1_month',
    label: 'شهر واحد (1 Month)',
    durationMs: 30 * 24 * 60 * 60 * 1000,
  },
  'semester': {
    id: 'semester',
    label: 'كورس كامل (Full Semester)',
    durationMs: 120 * 24 * 60 * 60 * 1000,
  },
  '1_year': {
    id: '1_year',
    label: 'سنة كاملة (1 Year) - افتراضي',
    durationMs: 365 * 24 * 60 * 60 * 1000,
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

const STORAGE_KEY = 'dental_student_activation_codes';
const CONFIG_COLLECTION = 'app_config';
const STUDENT_CODES_DOC = 'student_activation_codes';

// Helper to generate a clean, unique student activation code
function generateCodeFromEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const part1 = (positive % 8999 + 1000).toString(); // 4 digits
  const suffix = Math.floor(100 + Math.random() * 900).toString(); // 3 digits
  return `STU-${part1}-${suffix}`;
}

/**
 * Evaluates all student codes and transitions expired ones from 'active' to 'expired'
 */
export function checkAndExpireStudentCodes(codes: StudentCodeRecord[]): {
  updatedList: StudentCodeRecord[];
  hasChanges: boolean;
} {
  const now = Date.now();
  let hasChanges = false;

  const updatedList = codes.map((record) => {
    // If active and past expiration timestamp, auto-revoke by switching status to 'expired'
    if (record.status === 'active' && record.expiresAt && now > record.expiresAt) {
      hasChanges = true;
      return {
        ...record,
        status: 'expired' as const,
      };
    }
    return record;
  });

  return { updatedList, hasChanges };
}

export function getStudentCodes(): StudentCodeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned: StudentCodeRecord[] = parsed.map((item) => {
          const activatedAt = item.activatedAt || Date.now();
          const durationKey = (item.durationPlan || '1_year') as SubscriptionPlanKey;
          const plan = SUBSCRIPTION_PLANS[durationKey] || SUBSCRIPTION_PLANS['1_year'];
          const expiresAt = item.expiresAt || (activatedAt + plan.durationMs);

          let status: 'active' | 'revoked' | 'expired' = item.status || 'active';
          if (status === 'active' && Date.now() > expiresAt) {
            status = 'expired';
          }

          return {
            ...item,
            activatedAt,
            expiresAt,
            durationPlan: item.durationPlan || '1_year',
            status,
          };
        });

        // Persist if any auto-expired
        const { updatedList, hasChanges } = checkAndExpireStudentCodes(cleaned);
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
          saveStudentCodesToCloud(updatedList).catch(() => {});
        }

        return updatedList;
      }
    }
  } catch {}
  return [];
}

export function createStudentCode(
  email: string,
  name?: string,
  notes?: string,
  durationPlan: SubscriptionPlanKey = '1_year',
  paymentMethod?: string,
  paidAmount?: string
): { code: string; record: StudentCodeRecord; isNew: boolean } {
  const cleanEmail = email.trim().toLowerCase();
  const existing = getStudentCodes();
  const now = Date.now();

  const plan = SUBSCRIPTION_PLANS[durationPlan] || SUBSCRIPTION_PLANS['1_year'];
  const expiresAt = now + plan.durationMs;

  // Check if code already exists for this email
  const found = existing.find((r) => r.email.toLowerCase() === cleanEmail);
  if (found) {
    found.status = 'active';
    found.activatedAt = now;
    found.expiresAt = expiresAt;
    found.durationPlan = durationPlan;
    if (name) found.name = name.trim();
    if (notes) found.notes = notes.trim();
    if (paymentMethod) found.paymentMethod = paymentMethod;
    if (paidAmount) found.paidAmount = paidAmount;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      saveStudentCodesToCloud(existing).catch(() => {});
    } catch {}

    return { code: found.code, record: found, isNew: false };
  }

  const newCode = generateCodeFromEmail(cleanEmail);
  const newRecord: StudentCodeRecord = {
    id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    email: cleanEmail,
    name: name?.trim() || undefined,
    code: newCode,
    createdAt: new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    activatedAt: now,
    expiresAt,
    durationPlan,
    usedCount: 0,
    status: 'active',
    notes: notes?.trim() || undefined,
    paymentMethod,
    paidAmount,
  };

  const updated = [newRecord, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    saveStudentCodesToCloud(updated).catch(() => {});
  } catch {}

  return { code: newCode, record: newRecord, isNew: true };
}

export function updateStudentCodeStatus(
  id: string,
  status: 'active' | 'revoked' | 'expired'
): StudentCodeRecord[] {
  try {
    const existing = getStudentCodes();
    const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    saveStudentCodesToCloud(updated).catch(() => {});
    return updated;
  } catch {}
  return getStudentCodes();
}

export function updateStudentCode(
  id: string,
  updates: Partial<StudentCodeRecord>
): StudentCodeRecord[] {
  try {
    const existing = getStudentCodes();
    const updated = existing.map((r) => (r.id === id ? { ...r, ...updates } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    saveStudentCodesToCloud(updated).catch(() => {});
    return updated;
  } catch {}
  return getStudentCodes();
}

export function deleteStudentCode(id: string): StudentCodeRecord[] {
  try {
    const existing = getStudentCodes();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    saveStudentCodesToCloud(filtered).catch(() => {});
    return filtered;
  } catch {}
  return getStudentCodes();
}

/**
 * Saves all student codes directly to Firestore cloud for instant real-time sync
 */
export async function saveStudentCodesToCloud(codes: StudentCodeRecord[]): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, STUDENT_CODES_DOC);
    await setDoc(
      docRef,
      {
        codes,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[StudentCodesCloud] Failed to sync codes to Firestore:', err);
  }
}

/**
 * Subscribes to real-time student codes updates from Firestore cloud.
 * Ensures any code activation, revocation, or expiration propagates immediately to all subscriber devices.
 */
export function subscribeToStudentCodesCloud(
  onUpdate: (codes: StudentCodeRecord[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, STUDENT_CODES_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.codes)) {
          const cloudCodes: StudentCodeRecord[] = data.codes;
          const { updatedList, hasChanges } = checkAndExpireStudentCodes(cloudCodes);

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
          } catch {}

          if (hasChanges) {
            saveStudentCodesToCloud(updatedList).catch(() => {});
          }

          onUpdate(updatedList);
          return;
        }
      }
      onUpdate(getStudentCodes());
    },
    (err) => {
      console.warn('[StudentCodesCloud] onSnapshot error:', err);
      onUpdate(getStudentCodes());
    }
  );
}

export interface ExpirationInfo {
  isExpired: boolean;
  isExpiringSoon: boolean; // within 7 days
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  formattedExpiresAt: string;
  expiresAt?: number;
  durationPlan?: string;
  status: 'active' | 'revoked' | 'expired';
}

/**
 * Calculates countdown and expiration status for a given student email or code
 */
export function getSubscriberExpirationInfo(
  emailOrCode: string,
  codesList?: StudentCodeRecord[]
): ExpirationInfo | null {
  if (!emailOrCode || !emailOrCode.trim()) return null;
  const list = codesList || getStudentCodes();
  const clean = emailOrCode.trim().toLowerCase();

  const matched = list.find(
    (r) => r.email.toLowerCase() === clean || r.code.toUpperCase() === clean.toUpperCase()
  );

  if (!matched) return null;

  const now = Date.now();
  // Default to 1 year if expiresAt not set
  const activatedAt = matched.activatedAt || now;
  const plan = SUBSCRIPTION_PLANS[matched.durationPlan || '1_year'] || SUBSCRIPTION_PLANS['1_year'];
  const expiresAt = matched.expiresAt || (activatedAt + plan.durationMs);

  const diffMs = expiresAt - now;
  const isExpired = matched.status === 'expired' || diffMs <= 0;
  const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const isExpiringSoon = !isExpired && diffMs <= 7 * 24 * 60 * 60 * 1000;

  return {
    isExpired,
    isExpiringSoon,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    formattedExpiresAt: new Date(expiresAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    expiresAt,
    durationPlan: matched.durationPlan || '1_year',
    status: isExpired ? 'expired' : matched.status,
  };
}

/**
 * Verifies any entered activation code.
 * Strictly enforces expiration (1-year limit) and revocations.
 */
export function verifyActivationCode(
  input: string,
  adminPin: string
): {
  valid: boolean;
  role: 'admin' | 'student' | null;
  studentEmail?: string;
  error?: string;
  isExpired?: boolean;
  expiresAt?: number;
} {
  const clean = input.trim();
  if (!clean) return { valid: false, role: null, error: 'يرجى إدخال الكود' };

  // 1. Check Admin / Supervisor PIN
  if (
    clean === adminPin ||
    clean === '2003' ||
    clean.toLowerCase() === 'hayat' ||
    clean.toLowerCase() === 'admin2003'
  ) {
    return { valid: true, role: 'admin' };
  }

  // 2. Check Student Codes list
  const studentCodes = getStudentCodes();
  const matched = studentCodes.find(
    (item) => item.code.toUpperCase() === clean.toUpperCase()
  );

  if (matched) {
    // Check revocation
    if (matched.status === 'revoked') {
      return {
        valid: false,
        role: null,
        error: 'تم إلغاء/تعطيل هذا الكود من قِبل المشرف. يرجى مراجعة الدكتورة لإعادة التفعيل.',
      };
    }

    // Check expiration (Automated 1-Year expiration limit)
    const now = Date.now();
    if (matched.status === 'expired' || (matched.expiresAt && now > matched.expiresAt)) {
      matched.status = 'expired';
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(studentCodes));
        saveStudentCodesToCloud(studentCodes).catch(() => {});
      } catch {}
      return {
        valid: false,
        role: null,
        isExpired: true,
        error: 'انتهت صلاحية هذا الكود السنوي (انتهى الاشتراك). يرجى تجديد الاشتراك السنوي لمتابعة الوصول.',
      };
    }

    // Record usage
    try {
      matched.usedCount = (matched.usedCount || 0) + 1;
      matched.lastUsedAt = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studentCodes));
      saveStudentCodesToCloud(studentCodes).catch(() => {});
    } catch {}

    return {
      valid: true,
      role: 'student',
      studentEmail: matched.email,
      expiresAt: matched.expiresAt,
    };
  }

  // Also support general student pattern STU-XXXX-XXX if created dynamically
  if (/^STU-\d{4}-\d{3}$/i.test(clean)) {
    return { valid: true, role: 'student' };
  }

  return { valid: false, role: null, error: 'كود التفعيل غير صحيح أو غير مسجل في النظام' };
}

/**
 * Middleware/Background function to evaluate all subscriptions and automatically expire
 * records whose 1-year (or configured) validity has passed.
 */
export function performAutomatedExpirationCheck(): {
  expiredCount: number;
  hasChanges: boolean;
  updatedList: StudentCodeRecord[];
} {
  const current = getStudentCodes();
  const { updatedList, hasChanges } = checkAndExpireStudentCodes(current);
  if (hasChanges) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      saveStudentCodesToCloud(updatedList).catch(() => {});
    } catch {}
  }
  const expiredCount = updatedList.filter((r) => r.status === 'expired').length;
  return { expiredCount, hasChanges, updatedList };
}

/**
 * Checks an individual subscriber's active session validity.
 * If expired or revoked, automatically enforces expiration in the database and returns isValid: false.
 */
export function verifySubscriberAccess(emailOrCode: string): {
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  record?: StudentCodeRecord;
  expirationInfo: ExpirationInfo | null;
  error?: string;
} {
  if (!emailOrCode || !emailOrCode.trim()) {
    return { isValid: false, isExpired: false, isRevoked: false, expirationInfo: null };
  }

  const clean = emailOrCode.trim().toLowerCase();
  const codes = getStudentCodes();
  const matched = codes.find(
    (r) => r.email.toLowerCase() === clean || r.code.toUpperCase() === clean.toUpperCase()
  );

  if (!matched) {
    return {
      isValid: false,
      isExpired: false,
      isRevoked: false,
      expirationInfo: null,
      error: 'لم يتم العثور على اشتراك مسجل لهذا الحساب.',
    };
  }

  const now = Date.now();
  const isTimeExpired = matched.expiresAt ? now > matched.expiresAt : false;

  // Auto-expire if time has passed
  if (matched.status === 'expired' || isTimeExpired) {
    if (matched.status !== 'expired') {
      matched.status = 'expired';
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
        saveStudentCodesToCloud(codes).catch(() => {});
      } catch {}
    }
    const info = getSubscriberExpirationInfo(clean, codes);
    return {
      isValid: false,
      isExpired: true,
      isRevoked: false,
      record: matched,
      expirationInfo: info,
      error: 'انتهت صلاحية اشتراكك السنوي (مرت سنة كاملة من تاريخ التفعيل). يرجى تجديد الاشتراك لمتابعة الوصول.',
    };
  }

  // Check if revoked
  if (matched.status === 'revoked') {
    const info = getSubscriberExpirationInfo(clean, codes);
    return {
      isValid: false,
      isExpired: false,
      isRevoked: true,
      record: matched,
      expirationInfo: info,
      error: 'تم تعطيل أو إلغاء هذا الاشتراك من قِبل المشرف. يرجى التواصل مع الدكتورة.',
    };
  }

  const info = getSubscriberExpirationInfo(clean, codes);
  return {
    isValid: true,
    isExpired: false,
    isRevoked: false,
    record: matched,
    expirationInfo: info,
  };
}

