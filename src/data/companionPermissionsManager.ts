import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const PROTOCOL_CARD_PERMISSIONS_STORAGE_KEY = 'protocol_card_permissions';
export const PROTOCOL_CARD_PERMISSIONS_EVENT = 'protocol_card_permissions_updated';
export const PROTOCOL_COMPANION_CARDS_STORAGE_KEY = 'protocol_companion_cards_list';
export const PROTOCOL_COMPANION_CARDS_EVENT = 'protocol_companion_cards_updated';

const CONFIG_COLLECTION = 'app_config';
const COMPANION_PERMISSIONS_DOC = 'protocol_card_permissions_config';

export type AccessType = 'free' | 'subscription' | 'under_review';
export type VisibilityType = 'visible' | 'hidden';

export interface CompanionCardPermission {
  access: AccessType; // 'free' = متاح للعامة, 'subscription' = متاح للمشتركين فقط, 'under_review' = قيد التدقيق الطبي والأكاديمي
  visibility: VisibilityType; // 'visible' = ظاهر, 'hidden' = مخفي
  reviewNote?: string; // ملاحظة التدقيق والمراجعة من د. حياة
}

export type CompanionPermissionsMap = Record<string, CompanionCardPermission>;

// DEFAULT TO SUBSCRIPTION (PAID/PROTECTED) to prevent race conditions on initial load
export const DEFAULT_COMPANION_PERMISSIONS: CompanionPermissionsMap = {
  appointments: {
    access: 'subscription',
    visibility: 'visible',
  },
  pulp_capping: {
    access: 'subscription',
    visibility: 'visible',
  },
  smart_tray: {
    access: 'subscription',
    visibility: 'visible',
  },
  anesthesia: {
    access: 'subscription',
    visibility: 'visible',
  },
  checklist: {
    access: 'subscription',
    visibility: 'visible',
  },
  prescriptions: {
    access: 'subscription',
    visibility: 'visible',
  },
  request: {
    access: 'free',
    visibility: 'visible',
  },
  viva_questions: {
    access: 'subscription',
    visibility: 'visible',
  },
};

export interface CompanionCardMetadata {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  iconName: 'Syringe' | 'ClipboardCheck' | 'Pill' | 'HelpCircle' | 'Sparkles' | 'ShieldCheck' | 'Layers' | 'Calendar';
}

export const DEFAULT_COMPANION_CARDS_LIST: CompanionCardMetadata[] = [
  {
    id: 'appointments',
    title: 'مواعيدي وجدول العيادات ومتابعة الحالات',
    titleEn: 'My Appointments & Clinic Schedule',
    desc: 'تسجيل مواعيد المراجعين، التنبيه الذكي للمواعيد، لوحة الإحصائيات والأرشيف السريري',
    iconName: 'Calendar',
  },
  {
    id: 'pulp_capping',
    title: 'بروتوكول التغطية اللبية المباشرة (DPC)',
    titleEn: 'Direct Pulp Capping Protocol (MTA & GIC)',
    desc: 'بروتوكول التغطية اللبية المباشرة الدقيق في 7 مراحل: الشروط، الإرقاء، تطبيق MTA، ساندوتش GIC، البناء والمتابعة',
    iconName: 'ShieldCheck',
  },
  {
    id: 'smart_tray',
    title: 'بروتوكول العيادة الذكية: هندسة الطاولة السريرية في 7 خطوات',
    titleEn: 'Smart Clinic Tray Architecture (7 Steps)',
    desc: 'هندسة وترتيب صينية وأدوات العمل السريري في 7 خطوات تفاعلية لمنع التلوث التبادلي',
    iconName: 'Sparkles',
  },
  {
    id: 'anesthesia',
    title: '1. حاسبة التخدير الموضعي',
    titleEn: 'LA Safety Calculator',
    desc: 'حساب عدد الكاربولات والحد الأقصى (MRD) وأمان مرضى القلب والأدرينالين',
    iconName: 'Syringe',
  },
  {
    id: 'checklist',
    title: '2. قائمة الفحص السريري',
    titleEn: 'In-Clinic Checklist',
    desc: 'فحص العلامات الحيوية، التحسس، والأشعة وتوقيع المشرف لمنع السهو السريري',
    iconName: 'ClipboardCheck',
  },
  {
    id: 'prescriptions',
    title: '3. دليل وصف الأدوية',
    titleEn: 'Prescription Guide',
    desc: 'جرعات المضادات الحيوية، المسكنات، وموانع الحمل والحمل والإرضاع',
    iconName: 'Pill',
  },
  {
    id: 'request',
    title: '4. طلب بروتوكول جديد والأسئلة الشائعة',
    titleEn: 'Request Protocol & FAQs',
    desc: 'طلب إضافة حالة سريرية جديدة وإرسالها للمشرفة مع استعراض الأسئلة الأكثر تكراراً',
    iconName: 'HelpCircle',
  },
  {
    id: 'viva_questions',
    title: '5. أسئلة العيادات (Operative Viva)',
    titleEn: 'Senior Viva Questions Bank',
    desc: 'بنك أسئلة السينيور والمناقشة السريرية اليومية مع إمكانية بث تنبيهات عاجلة للطلاب',
    iconName: 'HelpCircle',
  },
];

export const COMPANION_CARDS_LIST = DEFAULT_COMPANION_CARDS_LIST;

/**
 * Retrieve dynamic companion cards list from localStorage with fallback to defaults.
 */
export function getCompanionCardsList(): CompanionCardMetadata[] {
  if (typeof window === 'undefined') return DEFAULT_COMPANION_CARDS_LIST;
  try {
    const raw = localStorage.getItem(PROTOCOL_COMPANION_CARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasAppointments = parsed.some((c: CompanionCardMetadata) => c.id === 'appointments');
        if (!hasAppointments) {
          const apptCard = DEFAULT_COMPANION_CARDS_LIST.find((c) => c.id === 'appointments');
          if (apptCard) {
            return [apptCard, ...parsed];
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse protocol_companion_cards_list from localStorage', err);
  }
  return DEFAULT_COMPANION_CARDS_LIST;
}

/**
 * Persist companion cards list to localStorage and broadcast real-time event.
 */
export function saveCompanionCardsList(cards: CompanionCardMetadata[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROTOCOL_COMPANION_CARDS_STORAGE_KEY, JSON.stringify(cards));
    window.dispatchEvent(
      new CustomEvent(PROTOCOL_COMPANION_CARDS_EVENT, { detail: cards })
    );
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save protocol_companion_cards_list to localStorage', err);
  }
}

/**
 * Reorder companion card (move from sourceIndex to targetIndex).
 */
export function reorderCompanionCard(fromIndex: number, toIndex: number): CompanionCardMetadata[] {
  const current = [...getCompanionCardsList()];
  if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) {
    return current;
  }
  const [removed] = current.splice(fromIndex, 1);
  current.splice(toIndex, 0, removed);
  saveCompanionCardsList(current);
  return current;
}

/**
 * Update metadata for a companion card.
 */
export function updateCompanionCardMetadata(
  cardId: string,
  updates: Partial<CompanionCardMetadata>
): CompanionCardMetadata[] {
  const current = getCompanionCardsList().map((c) => {
    if (c.id === cardId) {
      return { ...c, ...updates };
    }
    return c;
  });
  saveCompanionCardsList(current);
  return current;
}

/**
 * Delete a companion card from the list.
 */
export function deleteCompanionCard(cardId: string): CompanionCardMetadata[] {
  const current = getCompanionCardsList().filter((c) => c.id !== cardId);
  saveCompanionCardsList(current);
  return current;
}

/**
 * Duplicate a companion card with a new unique ID and identical permissions.
 */
export function duplicateCompanionCard(cardId: string): {
  cards: CompanionCardMetadata[];
  newCard: CompanionCardMetadata | null;
} {
  const currentList = getCompanionCardsList();
  const sourceCard = currentList.find((c) => c.id === cardId);
  if (!sourceCard) {
    return { cards: currentList, newCard: null };
  }

  const newId = `companion-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const duplicatedCard: CompanionCardMetadata = {
    ...sourceCard,
    id: newId,
    title: `${sourceCard.title} (نسخة)`,
    titleEn: `${sourceCard.titleEn} (Copy)`,
  };

  const index = currentList.findIndex((c) => c.id === cardId);
  const updatedList = [...currentList];
  updatedList.splice(index + 1, 0, duplicatedCard);
  saveCompanionCardsList(updatedList);

  // Copy permission settings as well
  const currentPerms = getCompanionPermissions();
  const sourcePerm = currentPerms[cardId] || DEFAULT_COMPANION_PERMISSIONS[cardId] || {
    access: 'subscription',
    visibility: 'visible',
  };
  updateCompanionCardPermission(newId, {
    access: sourcePerm.access,
    visibility: sourcePerm.visibility,
  });

  return { cards: updatedList, newCard: duplicatedCard };
}

/**
 * Reset companion cards list to defaults.
 */
export function resetCompanionCardsList(): CompanionCardMetadata[] {
  saveCompanionCardsList(DEFAULT_COMPANION_CARDS_LIST);
  return DEFAULT_COMPANION_CARDS_LIST;
}

/**
 * Retrieve current permissions map from localStorage with fallback to defaults.
 */
export function getCompanionPermissions(): CompanionPermissionsMap {
  if (typeof window === 'undefined') return DEFAULT_COMPANION_PERMISSIONS;
  try {
    const raw = localStorage.getItem(PROTOCOL_CARD_PERMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_COMPANION_PERMISSIONS,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse protocol_card_permissions from localStorage', err);
  }
  return DEFAULT_COMPANION_PERMISSIONS;
}

/**
 * Persist permissions map to localStorage and broadcast real-time event.
 */
export function saveCompanionPermissions(map: CompanionPermissionsMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROTOCOL_CARD_PERMISSIONS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent(PROTOCOL_CARD_PERMISSIONS_EVENT, { detail: map })
    );
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save protocol_card_permissions to localStorage', err);
  }
  saveCompanionPermissionsToCloud(map).catch(() => {});
}

/**
 * Persist companion card permissions to Cloud Firestore.
 */
export async function saveCompanionPermissionsToCloud(map: CompanionPermissionsMap): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, COMPANION_PERMISSIONS_DOC);
    await setDoc(docRef, {
      permissions: map,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[CompanionPermissions] Cloud sync notice:', err);
  }
}

/**
 * Subscribes to real-time companion card permissions from Cloud Firestore.
 */
export function subscribeToCompanionPermissionsCloud(
  onUpdate: (perms: CompanionPermissionsMap) => void
): () => void {
  const docRef = doc(db, CONFIG_COLLECTION, COMPANION_PERMISSIONS_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.permissions && typeof data.permissions === 'object') {
          const merged: CompanionPermissionsMap = {
            ...DEFAULT_COMPANION_PERMISSIONS,
            ...data.permissions,
          };
          try {
            localStorage.setItem(PROTOCOL_CARD_PERMISSIONS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          onUpdate(merged);
          return;
        }
      }
      onUpdate(getCompanionPermissions());
    },
    (err) => {
      console.warn('[CompanionPermissions] onSnapshot error:', err);
      onUpdate(getCompanionPermissions());
    }
  );
}

/**
 * Update permission for a single card.
 */
export function updateCompanionCardPermission(
  cardId: string,
  updates: Partial<CompanionCardPermission>
): CompanionPermissionsMap {
  const current = getCompanionPermissions();
  const currentCard = current[cardId] || DEFAULT_COMPANION_PERMISSIONS[cardId] || {
    access: 'subscription',
    visibility: 'visible',
  };

  const updated: CompanionPermissionsMap = {
    ...current,
    [cardId]: {
      ...currentCard,
      ...updates,
    },
  };

  saveCompanionPermissions(updated);
  return updated;
}

/**
 * Check if a card is visible.
 */
export function isCompanionCardVisible(cardId: string, isAuthorAdmin = false): boolean {
  const permissions = getCompanionPermissions();
  const card = permissions[cardId];
  if (!card) return true;
  // If set to hidden, hide completely (or allow admin override if desired, but default to checking visibility)
  return card.visibility !== 'hidden';
}

/**
 * Check if a card is free for public (doesn't require subscription).
 * Defaults strictly to FALSE (paid/locked) to avoid displaying paid cards as free on initial load.
 */
export function isCompanionCardFree(cardId: string): boolean {
  const permissions = getCompanionPermissions();
  const card = permissions[cardId];
  if (!card) return false; // STRICTLY FALSE BY DEFAULT
  return card.access === 'free';
}

/**
 * Check if a card is currently under clinical review by Dr. Hayat.
 */
export function isCompanionCardUnderReview(cardId: string): boolean {
  const permissions = getCompanionPermissions();
  const card = permissions[cardId];
  if (!card) return false;
  return card.access === 'under_review';
}

/**
 * Get unified card permission with safe defaults.
 */
export function getSingleCompanionCardPermission(cardId: string): CompanionCardPermission {
  const permissions = getCompanionPermissions();
  return (
    permissions[cardId] ||
    DEFAULT_COMPANION_PERMISSIONS[cardId] || {
      access: 'subscription',
      visibility: 'visible',
    }
  );
}
