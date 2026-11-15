/**
 * In-App Announcements & Push Alerts Cloud Service
 * Manages admin broadcasts, real-time sync with Firestore & local cache,
 * and maintains announcement history for active subscribers.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import { cleanFirestoreData } from './realTimeSyncService';
import { createBroadcastNotificationInCloud } from './realTimeSyncService';

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  badge?: string; // e.g., 'بروتوكول جديد', 'تحديث سريري', 'تنبيه عاجل'
  category: 'protocol_update' | 'clinical_note' | 'urgent_alert' | 'general';
  priority: 'normal' | 'important' | 'urgent';
  targetAudience?: 'all' | 'free' | 'paid'; // Targeted audience
  actionButton?: {
    label: string;
    actionType: 'tab' | 'url';
    target: string;
  };
  createdAt: string;
  timestamp: number;
  authorName?: string;
  linkTab?: string;    // e.g. 'slides', 'clinical_skills', 'surgical'
  linkParam?: string;  // e.g. 'class-4', 'ianb'
  isPinned?: boolean;
  isArchived?: boolean;
}

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const LOCAL_STORAGE_KEY = 'dental_inapp_announcements_v1';

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: '📢 تحديث بروتوكول الصنف الرابع Class IV Composite',
    message: 'تمت إضافة خطوات تشكيل الدليل السليكوني (Palatal Index) وصور ماكرو عالية الدقة لتدرج الشفافية والماميلونات.',
    badge: 'بروتوكول جديد 🦷',
    category: 'protocol_update',
    priority: 'important',
    createdAt: 'اليوم، 10:30 ص',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    authorName: 'د. حياة نافع فجر',
    linkTab: 'slides',
    linkParam: 'class-4',
    isPinned: true,
  },
  {
    id: 'ann-2',
    title: '⚡ مهارة سريرية جديدة: زوايا إبرة الـ IANB والتسريب الوعائي',
    message: 'راجع شريحة الأمان السريري لتجنب النزف وتنميل اللسان المؤقت مع صور اختراق التجويف الجناحي الفكي.',
    badge: 'تحديث سريري 🎯',
    category: 'clinical_note',
    priority: 'normal',
    createdAt: 'أمس، 05:15 م',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    authorName: 'د. حياة نافع فجر',
    linkTab: 'clinical_skills',
    linkParam: 'ianb',
    isPinned: false,
  },
];

export function getCachedAnnouncements(): AnnouncementItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_ANNOUNCEMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

/**
 * Universal Real-Time Listener for Announcements Stream
 * All active subscribers receive updates instantaneously without page refresh.
 */
export function subscribeToAnnouncementsCloud(
  onUpdate: (items: AnnouncementItem[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, ANNOUNCEMENTS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(getCachedAnnouncements());
        return;
      }

      const list: AnnouncementItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as Partial<AnnouncementItem>;
        list.push({
          id: docSnap.id,
          title: d.title || 'إعلان إداري جديد',
          message: d.message || '',
          badge: d.badge,
          category: d.category || 'general',
          priority: d.priority || 'normal',
          targetAudience: d.targetAudience || 'all',
          actionButton: d.actionButton,
          createdAt: d.createdAt || '',
          timestamp: d.timestamp || Date.now(),
          authorName: d.authorName || 'د. حياة نافع فجر',
          linkTab: d.linkTab,
          linkParam: d.linkParam,
          isPinned: d.isPinned === true,
          isArchived: d.isArchived === true,
        });
      });

      // Sort: pinned first, then by timestamp desc
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
      });

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      } catch {}

      onUpdate(list);
    },
    (err) => {
      console.warn('[Announcements Cloud] Snapshot warning:', err);
      onUpdate(getCachedAnnouncements());
    }
  );
}

/**
 * Admin Action: Publish a new Broadcast Announcement
 * Automatically updates Firestore collection AND fires in-app push notification toast to all subscribers!
 */
export async function publishAnnouncementInCloud(
  data: Omit<AnnouncementItem, 'id' | 'createdAt' | 'timestamp'>
): Promise<AnnouncementItem> {
  const timestamp = Date.now();
  const id = `ann_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
  const createdAt = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newAnn: AnnouncementItem = {
    ...data,
    targetAudience: data.targetAudience || 'all',
    id,
    createdAt,
    timestamp,
    isPinned: data.isPinned ?? false,
    isArchived: false,
  };

  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await setDoc(docRef, cleanFirestoreData(newAnn));

  // Trigger real-time multi-channel toast popup across all subscribers
  await createBroadcastNotificationInCloud({
    type: 'broadcast_post',
    title: `📢 ${newAnn.badge ? `${newAnn.badge}: ` : ''}${newAnn.title}`,
    message: newAnn.message.length > 130 ? newAnn.message.substring(0, 127) + '...' : newAnn.message,
    postId: id,
  });

  // Local cache optimistic update
  const current = getCachedAnnouncements();
  const updated = [newAnn, ...current.filter((a) => a.id !== id)];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return newAnn;
}

/**
 * Admin Action: Toggle Pin Status
 */
export async function togglePinAnnouncementInCloud(id: string, isPinned: boolean): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await setDoc(docRef, { isPinned }, { merge: true });

  const current = getCachedAnnouncements();
  const updated = current.map((a) => (a.id === id ? { ...a, isPinned } : a));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Admin Action: Toggle Archive Status
 */
export async function toggleArchiveAnnouncementInCloud(id: string, isArchived: boolean): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await setDoc(docRef, { isArchived }, { merge: true });

  const current = getCachedAnnouncements();
  const updated = current.map((a) => (a.id === id ? { ...a, isArchived } : a));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Admin Action: Update Announcement
 */
export async function updateAnnouncementInCloud(id: string, data: Partial<AnnouncementItem>): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await setDoc(docRef, cleanFirestoreData(data), { merge: true });

  const current = getCachedAnnouncements();
  const updated = current.map((a) => (a.id === id ? { ...a, ...data } : a));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Admin Action: Clear All Announcements / Reset History
 */
export async function clearAllAnnouncementsInCloud(): Promise<void> {
  const current = getCachedAnnouncements();
  for (const item of current) {
    try {
      const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, item.id);
      await deleteDoc(docRef);
    } catch {}
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  } catch {}
}

/**
 * Filter announcements by user subscription state
 */
export function filterAnnouncementsForUser(
  items: AnnouncementItem[],
  isSubscribed: boolean,
  isAdmin: boolean
): AnnouncementItem[] {
  if (isAdmin) return items;
  return items.filter((item) => {
    if (item.isArchived) return false;
    if (!item.targetAudience || item.targetAudience === 'all') return true;
    if (item.targetAudience === 'paid' && isSubscribed) return true;
    if (item.targetAudience === 'free' && !isSubscribed) return true;
    return false;
  });
}

/**
 * Admin Action: Delete Announcement
 */
export async function deleteAnnouncementInCloud(id: string): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await deleteDoc(docRef);

  const current = getCachedAnnouncements();
  const updated = current.filter((a) => a.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
