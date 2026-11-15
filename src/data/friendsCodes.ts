import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import { cleanFirestoreData } from '../services/realTimeSyncService';

export interface FriendDiscountCode {
  id: string;
  code: string; // Uppercase alphanumeric code
  friend1Name: string;
  friend1Email?: string;
  friend2Name: string;
  friend2Email?: string;
  maxUses: number; // Always 2 for friends pair
  usedCount: number; // 0, 1, or 2
  usedBy: Array<{ email: string; name?: string; usedAt: string }>;
  discountPrice: number; // 7$
  createdAt: string;
  timestamp: number;
  status: 'active' | 'exhausted' | 'revoked';
  notes?: string;
}

const STORAGE_KEY = 'dental_friends_discount_codes_v1';
const FRIENDS_CODES_COLLECTION = 'friends_discount_codes';

// Default initial starter demo codes for instant testing
export const INITIAL_FRIENDS_CODES: FriendDiscountCode[] = [
  {
    id: 'fc-demo-friends7',
    code: 'FRIENDS7',
    friend1Name: 'د. أحمد علي (طالب 1)',
    friend1Email: 'ahmed@demo.com',
    friend2Name: 'د. سارة حسن (طالب 2)',
    friend2Email: 'sara@demo.com',
    maxUses: 2,
    usedCount: 0,
    usedBy: [],
    discountPrice: 7,
    createdAt: 'كود خصم ثنائي نشط',
    timestamp: Date.now(),
    status: 'active',
    notes: 'كود خصم ثنائي لزميلين (7$ لكل طالب)',
  },
  {
    id: 'fc-demo-pair7',
    code: 'PAIR7',
    friend1Name: 'زميل دراسة 1',
    friend2Name: 'زميل دراسة 2',
    maxUses: 2,
    usedCount: 0,
    usedBy: [],
    discountPrice: 7,
    createdAt: 'كود خصم أصدقاء',
    timestamp: Date.now() - 1000 * 60 * 60,
    status: 'active',
    notes: 'كود مخصص لاشتراك الأصدقاء المشترك (7$)',
  },
];

export function getFriendsCodesLocal(): FriendDiscountCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_FRIENDS_CODES;
}

export function saveFriendsCodesLocal(codes: FriendDiscountCode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {}
}

/**
 * Real-time listener for friends discount codes in Firestore
 */
export function subscribeToFriendsCodesCloud(
  onUpdate: (codes: FriendDiscountCode[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, FRIENDS_CODES_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FriendDiscountCode[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as any;
        items.push({
          id: docSnap.id,
          code: (d.code || '').toUpperCase().trim(),
          friend1Name: d.friend1Name || '',
          friend1Email: d.friend1Email || '',
          friend2Name: d.friend2Name || '',
          friend2Email: d.friend2Email || '',
          maxUses: d.maxUses || 2,
          usedCount: typeof d.usedCount === 'number' ? d.usedCount : 0,
          usedBy: Array.isArray(d.usedBy) ? d.usedBy : [],
          discountPrice: typeof d.discountPrice === 'number' ? d.discountPrice : 7,
          createdAt: d.createdAt || '',
          timestamp: d.timestamp || Date.now(),
          status: d.status || 'active',
          notes: d.notes,
        });
      });

      if (items.length === 0) {
        // If collection is empty, seed demo codes
        const local = getFriendsCodesLocal();
        onUpdate(local);
      } else {
        saveFriendsCodesLocal(items);
        onUpdate(items);
      }
    },
    (err) => {
      console.warn('[FriendsCodes] Firestore snapshot fallback to local:', err);
      onUpdate(getFriendsCodesLocal());
    }
  );
}

/**
 * Generate a new custom friends discount code in Cloud Firestore & LocalStorage
 */
export async function createFriendCodeInCloud(params: {
  friend1Name: string;
  friend1Email?: string;
  friend2Name: string;
  friend2Email?: string;
  customCode?: string;
  notes?: string;
}): Promise<FriendDiscountCode> {
  const timestamp = Date.now();
  const rawCode = params.customCode?.trim().toUpperCase() || `PAIR-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanCode = rawCode.replace(/\s+/g, '-');
  const id = `fc_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
  const createdAt = new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });

  const newCodeRecord: FriendDiscountCode = {
    id,
    code: cleanCode,
    friend1Name: params.friend1Name.trim(),
    friend1Email: params.friend1Email?.trim() || '',
    friend2Name: params.friend2Name.trim(),
    friend2Email: params.friend2Email?.trim() || '',
    maxUses: 2,
    usedCount: 0,
    usedBy: [],
    discountPrice: 7,
    createdAt,
    timestamp,
    status: 'active',
    notes: params.notes?.trim() || undefined,
  };

  // 1. Update local cache
  const existing = getFriendsCodesLocal().filter((c) => c.code !== cleanCode);
  const updatedLocal = [newCodeRecord, ...existing];
  saveFriendsCodesLocal(updatedLocal);

  // 2. Save to Firestore
  try {
    const docRef = doc(db, FRIENDS_CODES_COLLECTION, id);
    await setDoc(docRef, cleanFirestoreData({ ...newCodeRecord, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.warn('[FriendsCodes] Cloud write fallback to local:', err);
  }

  return newCodeRecord;
}

/**
 * Instant client-side validation for Friends Code
 */
export function validateFriendDiscountCode(
  inputCode: string,
  studentEmail?: string,
  allCodes?: FriendDiscountCode[]
): {
  isValid: boolean;
  message: string;
  codeRecord?: FriendDiscountCode;
  payableAmount: number;
} {
  const clean = inputCode.trim().toUpperCase();
  if (!clean) {
    return {
      isValid: false,
      message: 'يرجى كتابة كود الأصدقاء أولاً.',
      payableAmount: 10,
    };
  }

  const list = allCodes && allCodes.length > 0 ? allCodes : getFriendsCodesLocal();
  const found = list.find((c) => c.code.toUpperCase() === clean);

  if (!found) {
    return {
      isValid: false,
      message: 'كود الأصدقاء غير صحيح أو غير مسجل ⚠️',
      payableAmount: 10,
    };
  }

  if (found.status === 'revoked') {
    return {
      isValid: false,
      message: 'تم إيقاف تفعيل هذا الكود من قبل المشرفة ⚠️',
      payableAmount: 10,
    };
  }

  if (found.usedCount >= found.maxUses || found.status === 'exhausted') {
    return {
      isValid: false,
      message: `عذراً، تم استهلاك هذا الكود بالكامل من قبل الصديقين المحددين (${found.usedCount}/${found.maxUses}) ⚠️`,
      payableAmount: 10,
    };
  }

  // Check if student already redeemed this code
  if (studentEmail && found.usedBy && found.usedBy.length > 0) {
    const alreadyUsed = found.usedBy.some(
      (u) => u.email.trim().toLowerCase() === studentEmail.trim().toLowerCase()
    );
    if (alreadyUsed) {
      return {
        isValid: false,
        message: 'لقد قمت باستخدام كود الأصدقاء هذا مسبقاً لحسابك! ⚠️',
        payableAmount: 10,
      };
    }
  }

  return {
    isValid: true,
    message: `تم تفعيل خصم الأصدقاء! المبلغ المطلوب: 7$ فقط ⚡ (المتبقي: ${found.maxUses - found.usedCount} من أصل ${found.maxUses})`,
    codeRecord: found,
    payableAmount: 7,
  };
}

/**
 * Redeem Friends Code upon successful subscription submission
 */
export async function redeemFriendDiscountCodeInCloud(
  inputCode: string,
  studentEmail: string,
  studentName?: string
): Promise<boolean> {
  const clean = inputCode.trim().toUpperCase();
  const list = getFriendsCodesLocal();
  const found = list.find((c) => c.code.toUpperCase() === clean);

  if (!found) return false;

  const newUsedCount = found.usedCount + 1;
  const newStatus = newUsedCount >= found.maxUses ? 'exhausted' : 'active';
  const newEntry = {
    email: studentEmail.trim().toLowerCase(),
    name: studentName?.trim() || 'مشترك',
    usedAt: new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
  };
  const updatedUsedBy = [...(found.usedBy || []), newEntry];

  found.usedCount = newUsedCount;
  found.status = newStatus;
  found.usedBy = updatedUsedBy;

  saveFriendsCodesLocal(list);

  try {
    const docRef = doc(db, FRIENDS_CODES_COLLECTION, found.id);
    await updateDoc(docRef, cleanFirestoreData({
      usedCount: newUsedCount,
      status: newStatus,
      usedBy: updatedUsedBy,
      lastRedeemedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[FriendsCodes] Cloud redeem update error:', err);
  }

  return true;
}

/**
 * Delete a friend code
 */
export async function deleteFriendCodeInCloud(codeId: string): Promise<void> {
  const list = getFriendsCodesLocal().filter((c) => c.id !== codeId);
  saveFriendsCodesLocal(list);

  try {
    const docRef = doc(db, FRIENDS_CODES_COLLECTION, codeId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[FriendsCodes] Cloud delete error:', err);
  }
}
