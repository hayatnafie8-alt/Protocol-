import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import { FeedPost } from '../data/feedPosts';
import { SupervisorNote } from '../data/supervisorNotes';
import {
  AppNotificationPayload,
  deliverMultiChannelNotification,
} from './pushNotificationManager';
import {
  triggerGlobalCacheBust,
  DEFAULT_MASTERCARD_NUMBER,
  DEFAULT_MASTERCARD_HOLDER,
} from './globalAppStateManager';
import {
  clearAllImageCaches,
  setGlobalBrandingVersion,
  PROTOCOL_BRANDING_EVENT,
  PROTOCOL_HEADER_LOGO_KEY,
  PROTOCOL_HEADER_LOGO_EVENT,
  PROTOCOL_MIDDLE_CARD_LOGO_KEY,
  PROTOCOL_MIDDLE_CARD_LOGO_EVENT,
  PROTOCOL_BOTTOM_FAB_ICON_KEY,
  PROTOCOL_BOTTOM_FAB_ICON_EVENT,
  PROTOCOL_OFFICIAL_STAMP_KEY,
  PROTOCOL_OFFICIAL_STAMP_EVENT,
  PROTOCOL_SUPERVISOR_AVATAR_KEY,
  PROTOCOL_USER_AVATAR_KEY,
  DOCTOR_AVATAR_EVENT,
  PROTOCOL_APP_LOGO_KEY,
  PROTOCOL_FAB_ICON_KEY,
  PROTOCOL_CENTRAL_LOGO_KEY,
} from '../utils/cacheBuster';

const POSTS_COLLECTION = 'posts';
const NOTES_COLLECTION = 'supervisor_notes';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Recursively removes any keys with `undefined` values from an object.
 * Firestore strictly rejects documents containing `undefined` values.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Initial default seed posts if Firestore collection is fresh
const INITIAL_SEED_POSTS: FeedPost[] = [
  {
    id: 'post-pinned-welcome',
    authorName: 'د. حياة نافع فجر',
    authorRole: 'admin',
    authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
    createdAt: 'اليوم، 09:00 ص',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    content: `أهلاً وسهلاً بجميع أطباء وطلبة طب الأسنان الأعزاء في المنصة التعليمية السريرية 🦷✨

يسعدنا إطلاق أحدث نسخة من "أطلس المهارات السريرية 4K" ودليل بروتوكولات حشوات الكومبوزيت خطوة بخطوة. نهدف دائماً إلى ربط الجانب النظري بالواقع العملي والسريري المباشر.

شاركوا تفاعلكم وملاحظاتكم، ونتمنى لكم رحلة تدريبية وسريرية موفقة ومتميزة!`,
    isPinned: true,
    likesCount: 16,
    dislikesCount: 0,
    reactions: {},
  },
  {
    id: 'post-clinical-tip-c-factor',
    authorName: 'د. حياة نافع فجر',
    authorRole: 'admin',
    authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
    createdAt: 'أمس، 05:30 م',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    content: `💡 نصيحة سريرية ذهبية لتجنب الحساسية بعد حشوات الكومبوزيت (Post-op Sensitivity):

1. في حفر كلاس 2 (Class II)، قم دائماً ببناء الجدار الملاصق (Proximal Wall) أولاً بسماكة 1 ملم لتحويل الكافتي إلى Class I.
2. لا تقم بتكديس الكومبوزيت دفعة واحدة أفقياً؛ بل اعتمد التكديس المائل الهرمي (Oblique Layering) لتخفيض معامل C-Factor وتجنب انكماش البلمرة على الحواف.
3. التقطيع والإنهاء بمبرد خاص تحت التبريد المائي المستمر يمنع حدوث Micro-cracks في الميناء.`,
    isPinned: false,
    likesCount: 24,
    dislikesCount: 1,
    reactions: {},
  },
];

/* =========================================================================
   1. Real-Time Posts & Announcements Management
   ========================================================================= */

export async function seedPostsIfEmpty(): Promise<boolean> {
  try {
    const colRef = collection(db, POSTS_COLLECTION);
    const existing = await getDocs(colRef);
    if (existing.empty) {
      console.log('[RealTime Sync] Seeding initial posts to Firestore...');
      const batch = writeBatch(db);
      for (const p of INITIAL_SEED_POSTS) {
        const docRef = doc(db, POSTS_COLLECTION, p.id);
        batch.set(docRef, cleanFirestoreData({ ...p, updatedAt: new Date().toISOString() }));
      }
      await batch.commit();
      return true;
    }
  } catch (err) {
    console.warn('[RealTime Sync] Posts seed error:', err);
  }
  return false;
}

export function subscribeToFeedPostsCloud(
  onUpdate: (posts: FeedPost[]) => void,
  onError?: (err: Error) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, POSTS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'));

  let firstLoad = true;

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty && firstLoad) {
        firstLoad = false;
        await seedPostsIfEmpty();
        return;
      }
      firstLoad = false;

      const loaded: FeedPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FeedPost;
        loaded.push({
          id: docSnap.id,
          authorName: data.authorName || 'د. حياة نافع فجر',
          authorRole: data.authorRole || 'admin',
          authorTitle: data.authorTitle || 'المشرف العام',
          createdAt: data.createdAt || '',
          timestamp: data.timestamp || Date.now(),
          content: data.content || '',
          imageUrl: data.imageUrl || undefined,
          isPinned: data.isPinned === true,
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          dislikesCount: typeof data.dislikesCount === 'number' ? data.dislikesCount : 0,
          reactions: data.reactions || {},
        });
      });

      // Sort: pinned first, then by timestamp descending
      loaded.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
      });

      // Also cache in localStorage for instant offline access
      try {
        localStorage.setItem('dental_community_feed_posts', JSON.stringify(loaded));
      } catch {}

      onUpdate(loaded);
    },
    (err) => {
      console.warn('[RealTime Sync] Posts snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

export async function createFeedPostInCloud(
  postData: Omit<FeedPost, 'id' | 'createdAt' | 'timestamp' | 'likesCount' | 'dislikesCount' | 'reactions'>,
  shouldNotify: boolean = true
): Promise<FeedPost> {
  const timestamp = Date.now();
  const id = `post_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newPost: FeedPost = {
    ...postData,
    id,
    createdAt,
    timestamp,
    likesCount: 0,
    dislikesCount: 0,
    reactions: {},
  };

  const docRef = doc(db, POSTS_COLLECTION, id);
  await setDoc(docRef, cleanFirestoreData({ ...newPost, updatedAt: new Date().toISOString() }));

  // Immediate global cache-bust across all subscribers
  triggerGlobalCacheBust('new_post').catch(() => {});

  // Broadcast Notification trigger
  if (shouldNotify) {
    await createBroadcastNotificationInCloud({
      type: 'broadcast_post',
      title: '📢 منشور جديد / تحديث جديد من د. حياه نافع فجر',
      message: postData.content.length > 120 ? postData.content.substring(0, 117) + '...' : postData.content,
      postId: id,
    });
  }

  return newPost;
}

export async function updateFeedPostInCloud(
  id: string,
  updates: Partial<FeedPost>,
  notifySubscribers: boolean = false
): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await updateDoc(docRef, cleanFirestoreData({ ...updates, updatedAt: new Date().toISOString() }));

  if (notifySubscribers && updates.content) {
    await createBroadcastNotificationInCloud({
      type: 'broadcast_post',
      title: '📢 تحديث جديد على المنشور من د. حياه نافع فجر',
      message: updates.content.length > 120 ? updates.content.substring(0, 117) + '...' : updates.content,
      postId: id,
    });
  }
}

export async function deleteFeedPostInCloud(id: string): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(docRef);
  triggerGlobalCacheBust('delete_post').catch(() => {});
}

export async function togglePinFeedPostInCloud(id: string, isPinned: boolean): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await updateDoc(docRef, { isPinned, updatedAt: new Date().toISOString() });
  triggerGlobalCacheBust('pin_post').catch(() => {});
}

export async function toggleFeedPostReactionInCloud(
  postId: string,
  userId: string,
  reactionType: 'like' | 'dislike',
  currentPost: FeedPost
): Promise<void> {
  const reactions = { ...(currentPost.reactions || {}) };
  const currentReaction = reactions[userId];

  let likesCount = currentPost.likesCount || 0;
  let dislikesCount = currentPost.dislikesCount || 0;

  if (currentReaction === reactionType) {
    delete reactions[userId];
    if (reactionType === 'like') likesCount = Math.max(0, likesCount - 1);
    if (reactionType === 'dislike') dislikesCount = Math.max(0, dislikesCount - 1);
  } else {
    if (currentReaction === 'like') likesCount = Math.max(0, likesCount - 1);
    if (currentReaction === 'dislike') dislikesCount = Math.max(0, dislikesCount - 1);

    reactions[userId] = reactionType;
    if (reactionType === 'like') likesCount += 1;
    if (reactionType === 'dislike') dislikesCount += 1;
  }

  const docRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(docRef, {
    reactions,
    likesCount,
    dislikesCount,
    updatedAt: new Date().toISOString(),
  });
}

/* =========================================================================
   2. Real-Time Supervisor Notes & Targeted Replies
   ========================================================================= */

export function subscribeToSupervisorNotesCloud(
  onUpdate: (notes: SupervisorNote[]) => void,
  onError?: (err: Error) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, NOTES_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: SupervisorNote[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as any;
        notes.push({
          id: docSnap.id,
          studentEmail: d.studentEmail || '',
          studentName: d.studentName || 'مشترك',
          category: d.category || 'clinical_question',
          sectionTitle: d.sectionTitle,
          slideTitle: d.slideTitle,
          content: d.content || '',
          createdAt: d.createdAt || '',
          timestamp: d.timestamp || Date.now(),
          isRead: d.isRead === true,
          reply: d.reply,
          repliedAt: d.repliedAt,
          replyReadByStudent: d.replyReadByStudent === true,
        } as SupervisorNote & { replyReadByStudent?: boolean });
      });

      // Cache locally
      try {
        localStorage.setItem('dental_supervisor_notes_v1', JSON.stringify(notes));
      } catch {}

      onUpdate(notes);
    },
    (err) => {
      console.warn('[RealTime Sync] Notes snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveSupervisorNoteToCloud(
  noteData: Omit<SupervisorNote, 'id' | 'createdAt' | 'timestamp' | 'isRead'>
): Promise<SupervisorNote> {
  const timestamp = Date.now();
  const id = `note_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newNote: SupervisorNote & { replyReadByStudent: boolean } = {
    ...noteData,
    id,
    createdAt,
    timestamp,
    isRead: false,
    replyReadByStudent: false,
  };

  const docRef = doc(db, NOTES_COLLECTION, id);
  await setDoc(docRef, cleanFirestoreData({ ...newNote, updatedAt: new Date().toISOString() }));

  return newNote;
}

export async function replyToSupervisorNoteInCloud(
  noteId: string,
  replyText: string,
  studentEmail?: string,
  studentName?: string
): Promise<void> {
  const repliedAt = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, cleanFirestoreData({
    reply: replyText,
    repliedAt,
    isRead: true,
    replyReadByStudent: false,
    updatedAt: new Date().toISOString(),
  }));

  // Trigger Targeted Push & In-App Notification directly to subscriber session!
  if (studentEmail && studentEmail.trim().length > 0) {
    await createTargetedNotificationInCloud({
      type: 'targeted_reply',
      title: '🔔 ردت د. حياه نافع فجر على ملاحظتك',
      message: replyText.length > 120 ? replyText.substring(0, 117) + '...' : replyText,
      targetEmail: studentEmail.trim().toLowerCase(),
      targetNoteId: noteId,
    });
  }
}

export async function markNoteReplyReadInCloud(noteId: string): Promise<void> {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await updateDoc(docRef, cleanFirestoreData({
      replyReadByStudent: true,
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[RealTime Sync] Mark note read error:', err);
  }
}

export async function deleteSupervisorNoteInCloud(noteId: string): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(docRef);
}

/* =========================================================================
   3. Real-Time Notification Stream (Broadcasts & Targeted Alerts)
   ========================================================================= */

export async function createBroadcastNotificationInCloud(
  payload: Omit<AppNotificationPayload, 'id' | 'timestamp'>
): Promise<void> {
  const timestamp = Date.now();
  const id = `notif_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);

  await setDoc(docRef, cleanFirestoreData({
    ...payload,
    id,
    timestamp,
    createdAt: new Date().toISOString(),
  }));
}

export const sendRealTimeNotification = createBroadcastNotificationInCloud;

export async function createTargetedNotificationInCloud(
  payload: Omit<AppNotificationPayload, 'id' | 'timestamp'>
): Promise<void> {
  const timestamp = Date.now();
  const id = `notif_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);

  await setDoc(docRef, cleanFirestoreData({
    ...payload,
    id,
    timestamp,
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Real-Time Listener for Notification Stream
 * Filters for either global broadcasts or targeted notifications matching currentUserEmail.
 */
export function subscribeToRealTimeNotifications(
  currentUserEmail: string | undefined,
  isAdmin: boolean,
  onNotification: (notif: AppNotificationPayload) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  // Listen to recent notifications (last 20)
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(20));

  // Keep track of already seen notifications to avoid re-triggering upon initial mount
  const seenIds = new Set<string>();
  let isInitialLoad = true;

  return onSnapshot(q, (snapshot) => {
    if (isInitialLoad) {
      snapshot.forEach((d) => seenIds.add(d.id));
      isInitialLoad = false;
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const notif = change.doc.data() as AppNotificationPayload;
        if (!seenIds.has(notif.id)) {
          seenIds.add(notif.id);

          const normalizedUserEmail = currentUserEmail?.trim().toLowerCase();
          const targetEmail = notif.targetEmail?.trim().toLowerCase();

          // Condition 1: Targeted reply for this subscriber
          if (notif.type === 'targeted_reply') {
            if (normalizedUserEmail && targetEmail && normalizedUserEmail === targetEmail) {
              deliverMultiChannelNotification(notif);
              onNotification(notif);
            }
          }
          // Condition 2: Broadcast post for all subscribers (skip if admin who just published)
          else if (notif.type === 'broadcast_post') {
            if (!isAdmin) {
              deliverMultiChannelNotification(notif);
              onNotification(notif);
            }
          }
          // Condition 3: System alert for Admin (e.g. new receipt submitted)
          else if (notif.type === 'system_alert') {
            if (isAdmin) {
              deliverMultiChannelNotification(notif);
              onNotification(notif);
            }
          }
          // Condition 4: Clinical Report Export Request (Alert Supervisor/Admin)
          else if (notif.type === 'report_export_request') {
            if (isAdmin) {
              deliverMultiChannelNotification(notif);
              onNotification(notif);
            }
          }
          // Condition 5: Clinical Report Export Approved / Rejected (Alert Student)
          else if (notif.type === 'report_export_approved' || notif.type === 'report_export_rejected') {
            if (!isAdmin) {
              deliverMultiChannelNotification(notif);
              onNotification(notif);
            }
          }
          // Condition 6: Clinic Viva Questions (Alert all students & subscribers with sound and toast)
          else if (notif.type === 'clinic_viva_question') {
            deliverMultiChannelNotification(notif);
            onNotification(notif);
          }
        }
      }
    });
  });
}

/* =========================================================================
   4. Real-Time Subscription & Mastercard Receipt Requests
   ========================================================================= */

const REQUESTS_COLLECTION = 'subscription_requests';
const CONFIG_COLLECTION = 'app_config';
const PAYMENT_CONFIG_DOC = 'mastercard_payment_settings';

export { DEFAULT_MASTERCARD_NUMBER, DEFAULT_MASTERCARD_HOLDER } from './globalAppStateManager';

export interface AppPaymentConfig {
  mastercardNumber: string;
  mastercardHolder: string;
  cardHolder?: string; // convenient alias
  telegramBotToken?: string;
  telegramChatId?: string;
  earlyBirdLimit?: number; // default 10
  updatedAt?: string;
}

/**
 * Subscribe to Admin Dynamic Mastercard & Telegram Settings in Firestore
 */
export function subscribeToPaymentConfigCloud(
  onUpdate: (config: AppPaymentConfig) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, PAYMENT_CONFIG_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      const defaultData: AppPaymentConfig = {
        mastercardNumber: localStorage.getItem('dental_admin_mastercard_number') || DEFAULT_MASTERCARD_NUMBER,
        mastercardHolder: localStorage.getItem('dental_admin_mastercard_holder') || DEFAULT_MASTERCARD_HOLDER,
        cardHolder: localStorage.getItem('dental_admin_mastercard_holder') || DEFAULT_MASTERCARD_HOLDER,
        telegramBotToken: localStorage.getItem('dental_telegram_bot_token') || '',
        telegramChatId: localStorage.getItem('dental_telegram_chat_id') || '',
        earlyBirdLimit: 10,
      };

      if (docSnap.exists()) {
        const d = docSnap.data() as Partial<AppPaymentConfig>;
        const holder = d.mastercardHolder || d.cardHolder || defaultData.mastercardHolder;
        const merged: AppPaymentConfig = {
          mastercardNumber: d.mastercardNumber || defaultData.mastercardNumber,
          mastercardHolder: holder,
          cardHolder: holder,
          telegramBotToken: d.telegramBotToken !== undefined ? d.telegramBotToken : defaultData.telegramBotToken,
          telegramChatId: d.telegramChatId !== undefined ? d.telegramChatId : defaultData.telegramChatId,
          earlyBirdLimit: typeof d.earlyBirdLimit === 'number' ? d.earlyBirdLimit : 10,
          updatedAt: d.updatedAt,
        };

        // Cache locally for instant offline availability
        try {
          localStorage.setItem('dental_admin_mastercard_number', merged.mastercardNumber);
          localStorage.setItem('dental_admin_mastercard_holder', merged.mastercardHolder);
          if (merged.telegramBotToken) localStorage.setItem('dental_telegram_bot_token', merged.telegramBotToken);
          if (merged.telegramChatId) localStorage.setItem('dental_telegram_chat_id', merged.telegramChatId);
        } catch {}

        onUpdate(merged);
      } else {
        onUpdate(defaultData);
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Payment config snapshot error:', err);
    }
  );
}

/**
 * Save updated Mastercard & Telegram settings to Cloud Firestore
 */
export async function savePaymentConfigToCloud(
  config: Partial<AppPaymentConfig>
): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, PAYMENT_CONFIG_DOC);
  const updatedAt = new Date().toISOString();

  // Local cache immediately
  if (config.mastercardNumber) {
    localStorage.setItem('dental_admin_mastercard_number', config.mastercardNumber.trim());
  }
  if (config.mastercardHolder) {
    localStorage.setItem('dental_admin_mastercard_holder', config.mastercardHolder.trim());
  }
  if (config.telegramBotToken !== undefined) {
    localStorage.setItem('dental_telegram_bot_token', config.telegramBotToken.trim());
  }
  if (config.telegramChatId !== undefined) {
    localStorage.setItem('dental_telegram_chat_id', config.telegramChatId.trim());
  }

  await setDoc(docRef, cleanFirestoreData({ ...config, updatedAt }), { merge: true });
  triggerGlobalCacheBust('payment_config').catch(() => {});
}

export interface SubscriptionRequestItem {
  id: string;
  email: string;
  fullName?: string;
  studentName?: string;
  academicStage?: string;
  university?: string;
  promoCode?: string;
  discountAmount?: string;
  amount: string; // '15$', '10$', '7$', '22,500 د.ع', etc.
  paymentMethod: 'mastercard' | 'zain_cash' | 'fastpay' | 'manual_transfer' | string;
  receiptUrl: string;
  targetSectionTitle?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  generatedCode?: string;
  durationPlan?: '1_month' | 'semester' | '1_year';
  expiresAt?: number;
  rejectionReason?: string;
  createdAt: string;
  timestamp: number;
}

/**
 * Calculate the count of approved subscribers and Early-Bird pricing tier
 */
export function getEarlyBirdPricing(approvedCount: number) {
  const EARLY_BIRD_LIMIT = 10;
  const isEarlyBird = approvedCount < EARLY_BIRD_LIMIT;
  const remainingSeats = Math.max(0, EARLY_BIRD_LIMIT - approvedCount);
  const standardPrice = 15;
  const earlyBirdPrice = 10;
  const currentPrice = isEarlyBird ? earlyBirdPrice : standardPrice;
  const currentPriceLabel = isEarlyBird ? '10$' : '15$';

  return {
    isEarlyBird,
    approvedCount,
    earlyBirdLimit: EARLY_BIRD_LIMIT,
    remainingSeats,
    currentPrice,
    currentPriceLabel,
  };
}

export function subscribeToSubscriptionRequestsCloud(
  onUpdate: (requests: SubscriptionRequestItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, REQUESTS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SubscriptionRequestItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as any;
        items.push({
          id: docSnap.id,
          email: d.email || '',
          fullName: d.fullName || d.studentName || 'مشترك',
          studentName: d.studentName || d.fullName || 'مشترك',
          academicStage: d.academicStage,
          university: d.university,
          promoCode: d.promoCode,
          discountAmount: d.discountAmount,
          amount: d.amount || '7,000 د.ع',
          paymentMethod: d.paymentMethod || 'mastercard',
          receiptUrl: d.receiptUrl || '',
          targetSectionTitle: d.targetSectionTitle,
          notes: d.notes,
          status: d.status || 'pending',
          generatedCode: d.generatedCode,
          durationPlan: d.durationPlan || '1_year',
          expiresAt: d.expiresAt,
          rejectionReason: d.rejectionReason,
          createdAt: d.createdAt || '',
          timestamp: d.timestamp || Date.now(),
        });
      });

      // Cache locally
      try {
        localStorage.setItem('dental_subscriber_code_requests_v1', JSON.stringify(items));
      } catch {}

      onUpdate(items);
    },
    (err) => {
      console.warn('[RealTime Sync] Subscription requests snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveSubscriptionRequestToCloud(
  reqData: Omit<SubscriptionRequestItem, 'id' | 'createdAt' | 'timestamp' | 'status'>
): Promise<SubscriptionRequestItem> {
  const timestamp = Date.now();
  const id = `req_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newReq: SubscriptionRequestItem = {
    ...reqData,
    fullName: reqData.fullName || reqData.studentName,
    studentName: reqData.studentName || reqData.fullName,
    id,
    createdAt,
    timestamp,
    status: 'pending',
  };

  const docRef = doc(db, REQUESTS_COLLECTION, id);
  await setDoc(docRef, cleanFirestoreData({ ...newReq, updatedAt: new Date().toISOString() }));

  // Real-time alert to Admin Panel
  await createBroadcastNotificationInCloud({
    type: 'system_alert',
    title: '💳 إيصال تحويل ماستركارد جديد للتحقق',
    message: `أرسل ${newReq.fullName || newReq.studentName || newReq.email} إيصال تحويل (${newReq.amount}) لتفعيل اشتراك بروتوكول السنوي.`,
  });

  return newReq;
}

export async function approveSubscriptionRequestInCloud(
  requestId: string,
  studentEmail: string,
  studentName: string,
  generatedCode: string,
  durationPlan: '1_month' | 'semester' | '1_year' = '1_year',
  expiresAt?: number
): Promise<void> {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  const now = Date.now();
  const calculatedExpiresAt = expiresAt || (now + 365 * 24 * 60 * 60 * 1000);

  await updateDoc(docRef, cleanFirestoreData({
    status: 'approved',
    generatedCode,
    durationPlan,
    expiresAt: calculatedExpiresAt,
    activatedAt: now,
    updatedAt: new Date().toISOString(),
  }));

  // Targeted notification directly to the student session!
  if (studentEmail && studentEmail.trim().length > 0) {
    const expiresFormatted = new Date(calculatedExpiresAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    await createTargetedNotificationInCloud({
      type: 'targeted_reply',
      title: '🎉 تم تأكيد وتفعيل اشتراكك بنجاح!',
      message: `مرحباً ${studentName || 'دكتور'}، تم اعتماد إيصال التحويل واشتراكك نشط الآن حتى (${expiresFormatted}). كود التفعيل الخاص بك هو: [ ${generatedCode} ].`,
      targetEmail: studentEmail.trim().toLowerCase(),
    });
  }
}

export async function rejectSubscriptionRequestInCloud(
  requestId: string,
  studentEmail?: string,
  studentName?: string,
  reason?: string
): Promise<void> {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, cleanFirestoreData({
    status: 'rejected',
    rejectionReason: reason || 'تعذر التحقق من إيصال التحويل المصرفي',
    updatedAt: new Date().toISOString(),
  }));

  if (studentEmail && studentEmail.trim().length > 0) {
    await createTargetedNotificationInCloud({
      type: 'targeted_reply',
      title: '⚠️ تنبيه بخصوص إيصال التحويل',
      message: `مرحباً ${studentName || 'دكتور'}، لم تتم مطابقة إيصال التحويل: ${reason || 'يرجى التأكد من وضوح الإيصال والمبلغ وإعادة المحاولة أو التواصل مع الدكتورة'}.`,
      targetEmail: studentEmail.trim().toLowerCase(),
    });
  }
}

export async function deleteSubscriptionRequestInCloud(requestId: string): Promise<void> {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await deleteDoc(docRef);
}

/* =========================================================================
   5. Central Real-Time App Branding & Supervisor Avatar Cloud Sync
   ========================================================================= */

const BRANDING_CONFIG_DOC = 'branding_settings';

export interface AppBrandingSettings {
  // Independent UI Assets
  headerLogo?: string;       // 1. شعار الترويسة الرئيسية في الأعلى
  middleCardLogo?: string;   // 2. شعار الكارد في المنتصف
  bottomFabIcon?: string;    // 3. أيقونة الختم أو النافبار السفلية
  officialStamp?: string;    // 4. الختم الرسمي المستقل لتقرير الإنجاز السنوي
  supervisorAvatar?: string; // 5. صورة المشرف السريري

  // Legacy fallback
  appLogo?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * Subscribes to real-time central database updates for all independent UI assets
 * (Header Logo, Middle Card Emblem, Bottom FAB Seal, Official Stamp, Supervisor Avatar).
 * Ensures each element reacts ONLY to its own dedicated cloud changes with sub-second synchronization.
 */
export function subscribeToAppBrandingCloud(
  onUpdate?: (settings: AppBrandingSettings) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, BRANDING_CONFIG_DOC);
  const avatarDocRef = doc(db, CONFIG_COLLECTION, 'asset_supervisor_avatar');
  const middleDocRef = doc(db, CONFIG_COLLECTION, 'asset_middle_card_logo');
  const bottomDocRef = doc(db, CONFIG_COLLECTION, 'asset_bottom_fab_icon');
  const headerDocRef = doc(db, CONFIG_COLLECTION, 'asset_header_logo');
  const stampDocRef = doc(db, CONFIG_COLLECTION, 'asset_official_stamp');

  // 1. Listen to branding_settings manifest
  const unsubManifest = onSnapshot(
    docRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppBrandingSettings;
        const newTimestamp = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
        const currentVersion = parseInt(localStorage.getItem('protocol_branding_version') || '0', 10);

        // Check independent UI assets
        const currentHeader = localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY);
        const currentMiddle = localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
        const currentBottom = localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
        const currentStamp = localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY);
        const currentAvatar = localStorage.getItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);

        let finalAvatar = data.supervisorAvatar;
        let finalMiddle = data.middleCardLogo;
        let finalBottom = data.bottomFabIcon;
        let finalHeader = data.headerLogo;
        let finalStamp = data.officialStamp;

        if (finalAvatar === '__stored_in_dedicated_asset__') {
          try {
            const aSnap = await getDoc(avatarDocRef);
            if (aSnap.exists() && aSnap.data()?.data) finalAvatar = aSnap.data().data;
          } catch {}
        }
        if (finalMiddle === '__stored_in_dedicated_asset__') {
          try {
            const mSnap = await getDoc(middleDocRef);
            if (mSnap.exists() && mSnap.data()?.data) finalMiddle = mSnap.data().data;
          } catch {}
        }
        if (finalBottom === '__stored_in_dedicated_asset__') {
          try {
            const bSnap = await getDoc(bottomDocRef);
            if (bSnap.exists() && bSnap.data()?.data) finalBottom = bSnap.data().data;
          } catch {}
        }
        if (finalHeader === '__stored_in_dedicated_asset__') {
          try {
            const hSnap = await getDoc(headerDocRef);
            if (hSnap.exists() && hSnap.data()?.data) finalHeader = hSnap.data().data;
          } catch {}
        }
        if (finalStamp === '__stored_in_dedicated_asset__') {
          try {
            const sSnap = await getDoc(stampDocRef);
            if (sSnap.exists() && sSnap.data()?.data) finalStamp = sSnap.data().data;
          } catch {}
        }

        const hasHeaderChanged = finalHeader !== undefined && finalHeader !== currentHeader;
        const hasMiddleChanged = finalMiddle !== undefined && finalMiddle !== currentMiddle;
        const hasBottomChanged = finalBottom !== undefined && finalBottom !== currentBottom;
        const hasStampChanged = finalStamp !== undefined && finalStamp !== currentStamp;
        const hasAvatarChanged = finalAvatar !== undefined && finalAvatar !== currentAvatar;
        const isNewerVersion = newTimestamp > currentVersion;

        if (hasHeaderChanged || hasMiddleChanged || hasBottomChanged || hasStampChanged || hasAvatarChanged || isNewerVersion) {
          console.log('[RealTime Sync] New central branding detected. Synchronizing independent UI assets...');

          // Purge CacheStorage
          await clearAllImageCaches([
            finalHeader || '',
            finalMiddle || '',
            finalBottom || '',
            finalStamp || '',
            finalAvatar || '',
            data.appLogo || ''
          ]);

          setGlobalBrandingVersion(newTimestamp);

          // 1. Top Header Main Logo (Independent)
          if (finalHeader !== undefined) {
            if (finalHeader) {
              localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, finalHeader);
            } else {
              localStorage.removeItem(PROTOCOL_HEADER_LOGO_KEY);
            }
            window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: finalHeader }));
          } else if (data.appLogo && !currentHeader) {
            localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, data.appLogo);
            window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: data.appLogo }));
          }

          // 2. Middle Card Emblem (Independent)
          if (finalMiddle !== undefined) {
            if (finalMiddle) {
              localStorage.setItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY, finalMiddle);
              localStorage.setItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`, finalMiddle);
            } else {
              localStorage.removeItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
              localStorage.removeItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`);
            }
            window.dispatchEvent(new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: finalMiddle }));
            window.dispatchEvent(new CustomEvent('protocol_middle_card_logo_updated', { detail: finalMiddle }));
          }

          // 3. Bottom Navbar FAB Icon (Independent)
          if (finalBottom !== undefined) {
            if (finalBottom) {
              localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, finalBottom);
            } else {
              localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
            }
            window.dispatchEvent(new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: finalBottom }));
            window.dispatchEvent(new CustomEvent('protocol_fab_icon_updated', { detail: finalBottom }));
          }

          // 4. Official Report Circular Stamp (Independent)
          if (finalStamp !== undefined) {
            if (finalStamp) {
              localStorage.setItem(PROTOCOL_OFFICIAL_STAMP_KEY, finalStamp);
            } else {
              localStorage.removeItem(PROTOCOL_OFFICIAL_STAMP_KEY);
            }
            window.dispatchEvent(new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: finalStamp }));
          }

          // 5. Supervisor Avatar (Independent)
          if (finalAvatar !== undefined) {
            if (finalAvatar) {
              localStorage.setItem(PROTOCOL_SUPERVISOR_AVATAR_KEY, finalAvatar);
              localStorage.setItem(PROTOCOL_USER_AVATAR_KEY, finalAvatar);
            } else {
              localStorage.removeItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);
              localStorage.removeItem(PROTOCOL_USER_AVATAR_KEY);
            }
            window.dispatchEvent(new Event(DOCTOR_AVATAR_EVENT));
          }

          window.dispatchEvent(new CustomEvent(PROTOCOL_BRANDING_EVENT, { detail: { ...data, supervisorAvatar: finalAvatar, middleCardLogo: finalMiddle, bottomFabIcon: finalBottom, headerLogo: finalHeader, officialStamp: finalStamp } }));
          window.dispatchEvent(new Event('storage'));
        }

        if (onUpdate) {
          onUpdate({ ...data, supervisorAvatar: finalAvatar, middleCardLogo: finalMiddle, bottomFabIcon: finalBottom, headerLogo: finalHeader, officialStamp: finalStamp });
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Branding settings snapshot listener notice:', err);
    }
  );

  // 2. Direct real-time listener on dedicated supervisor avatar document for instant sub-second synchronization
  const unsubAvatar = onSnapshot(
    avatarDocRef,
    async (avatarSnap) => {
      if (avatarSnap.exists()) {
        const aData = avatarSnap.data();
        const remoteAvatar = aData?.data || '';
        const currentAvatar = localStorage.getItem(PROTOCOL_SUPERVISOR_AVATAR_KEY) || '';

        if (remoteAvatar !== currentAvatar) {
          console.log('[RealTime Sync] Live supervisor avatar update received from cloud!');
          if (remoteAvatar) {
            localStorage.setItem(PROTOCOL_SUPERVISOR_AVATAR_KEY, remoteAvatar);
            localStorage.setItem(PROTOCOL_USER_AVATAR_KEY, remoteAvatar);
          } else {
            localStorage.removeItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);
            localStorage.removeItem(PROTOCOL_USER_AVATAR_KEY);
          }
          const newV = aData?.version || Date.now();
          setGlobalBrandingVersion(newV);
          await clearAllImageCaches([remoteAvatar]);
          window.dispatchEvent(new Event(DOCTOR_AVATAR_EVENT));
          window.dispatchEvent(new Event('storage'));
          if (onUpdate) {
            onUpdate({ supervisorAvatar: remoteAvatar, version: newV });
          }
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Dedicated avatar snapshot listener notice:', err);
    }
  );

  // 3. Direct real-time listener on dedicated middle card logo document for instant sub-second synchronization
  const unsubMiddle = onSnapshot(
    middleDocRef,
    async (middleSnap) => {
      if (middleSnap.exists()) {
        const mData = middleSnap.data();
        const remoteMiddle = mData?.data || '';
        const currentMiddle = localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY) || '';

        if (remoteMiddle !== currentMiddle) {
          console.log('[RealTime Sync] Live middle card logo update received from cloud!');
          if (remoteMiddle) {
            localStorage.setItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY, remoteMiddle);
          } else {
            localStorage.removeItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
          }
          // Explicitly clear legacy component cache
          localStorage.removeItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`);
          
          const newV = mData?.version || Date.now();
          setGlobalBrandingVersion(newV);
          await clearAllImageCaches([remoteMiddle]);
          window.dispatchEvent(
            new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: remoteMiddle })
          );
          window.dispatchEvent(
            new CustomEvent('protocol_middle_card_logo_updated', { detail: remoteMiddle })
          );
          window.dispatchEvent(new Event('storage'));
          if (onUpdate) {
            onUpdate({ middleCardLogo: remoteMiddle, version: newV });
          }
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Dedicated middle card logo snapshot listener notice:', err);
    }
  );

  // 4. Direct real-time listener on dedicated bottom FAB icon document for instant sub-second synchronization
  const unsubBottom = onSnapshot(
    bottomDocRef,
    async (bottomSnap) => {
      if (bottomSnap.exists()) {
        const bData = bottomSnap.data();
        const remoteBottom = bData?.data || '';
        const currentBottom = localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) || '';

        if (remoteBottom !== currentBottom) {
          console.log('[RealTime Sync] Live bottom FAB icon update received from cloud!');
          if (remoteBottom) {
            localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, remoteBottom);
          } else {
            localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
          }
          const newV = bData?.version || Date.now();
          setGlobalBrandingVersion(newV);
          await clearAllImageCaches([remoteBottom]);
          window.dispatchEvent(
            new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: remoteBottom })
          );
          window.dispatchEvent(
            new CustomEvent('protocol_fab_icon_updated', { detail: remoteBottom })
          );
          window.dispatchEvent(new Event('storage'));
          if (onUpdate) {
            onUpdate({ bottomFabIcon: remoteBottom, version: newV });
          }
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Dedicated bottom FAB icon snapshot listener notice:', err);
    }
  );

  // 5. Direct real-time listener on dedicated top header logo document
  const unsubHeader = onSnapshot(
    headerDocRef,
    async (headerSnap) => {
      if (headerSnap.exists()) {
        const hData = headerSnap.data();
        const remoteHeader = hData?.data || '';
        const currentHeader = localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) || '';

        if (remoteHeader !== currentHeader) {
          console.log('[RealTime Sync] Live header logo update received from cloud!');
          if (remoteHeader) {
            localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, remoteHeader);
          } else {
            localStorage.removeItem(PROTOCOL_HEADER_LOGO_KEY);
          }
          const newV = hData?.version || Date.now();
          setGlobalBrandingVersion(newV);
          await clearAllImageCaches([remoteHeader]);
          window.dispatchEvent(
            new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: remoteHeader })
          );
          window.dispatchEvent(new Event('storage'));
          if (onUpdate) {
            onUpdate({ headerLogo: remoteHeader, version: newV });
          }
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Dedicated header logo snapshot listener notice:', err);
    }
  );

  // 6. Direct real-time listener on dedicated official stamp document
  const unsubStamp = onSnapshot(
    stampDocRef,
    async (stampSnap) => {
      if (stampSnap.exists()) {
        const sData = stampSnap.data();
        const remoteStamp = sData?.data || '';
        const currentStamp = localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY) || '';

        if (remoteStamp !== currentStamp) {
          console.log('[RealTime Sync] Live official stamp update received from cloud!');
          if (remoteStamp) {
            localStorage.setItem(PROTOCOL_OFFICIAL_STAMP_KEY, remoteStamp);
          } else {
            localStorage.removeItem(PROTOCOL_OFFICIAL_STAMP_KEY);
          }
          const newV = sData?.version || Date.now();
          setGlobalBrandingVersion(newV);
          await clearAllImageCaches([remoteStamp]);
          window.dispatchEvent(
            new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: remoteStamp })
          );
          window.dispatchEvent(new Event('storage'));
          if (onUpdate) {
            onUpdate({ officialStamp: remoteStamp, version: newV });
          }
        }
      }
    },
    (err) => {
      console.warn('[RealTime Sync] Dedicated official stamp snapshot listener notice:', err);
    }
  );

  return () => {
    unsubManifest();
    unsubAvatar();
    unsubMiddle();
    unsubBottom();
    unsubHeader();
    unsubStamp();
  };
}

/**
 * Saves updated UI assets to Central Cloud Firestore,
 * strictly maintaining isolated keys, independent state, and preventing
 * the 1MB Firestore document limit from ever triggering by storing assets
 * in dedicated individual subdocuments.
 */
export async function saveAppBrandingToCloud(
  branding: Partial<AppBrandingSettings>
): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, BRANDING_CONFIG_DOC);
  const updatedAt = new Date().toISOString();
  const newTimestamp = Date.now();

  setGlobalBrandingVersion(newTimestamp);
  await clearAllImageCaches([
    branding.headerLogo || '',
    branding.middleCardLogo || '',
    branding.bottomFabIcon || '',
    branding.officialStamp || '',
    branding.supervisorAvatar || '',
    branding.appLogo || ''
  ]);

  const hasLocal = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  // 1. Independent Top Header Logo
  if (branding.headerLogo !== undefined) {
    if (hasLocal) {
      if (branding.headerLogo) {
        localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, branding.headerLogo);
      } else {
        localStorage.removeItem(PROTOCOL_HEADER_LOGO_KEY);
      }
      window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: branding.headerLogo }));
    }
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'asset_header_logo'), {
        data: branding.headerLogo || '',
        updatedAt,
        version: newTimestamp,
      });
    } catch (e) {
      console.warn('[RealTime Sync] Failed to save asset_header_logo:', e);
    }
  }

  // 2. Independent Middle Card Logo
  if (branding.middleCardLogo !== undefined) {
    if (hasLocal) {
      if (branding.middleCardLogo) {
        localStorage.setItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY, branding.middleCardLogo);
        localStorage.setItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`, branding.middleCardLogo);
      } else {
        localStorage.removeItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
        localStorage.removeItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`);
      }
      window.dispatchEvent(new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: branding.middleCardLogo }));
    }
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'asset_middle_card_logo'), {
        data: branding.middleCardLogo || '',
        updatedAt,
        version: newTimestamp,
      });
    } catch (e) {
      console.warn('[RealTime Sync] Failed to save asset_middle_card_logo:', e);
    }
  }

  // 3. Independent Bottom Navbar FAB Icon
  if (branding.bottomFabIcon !== undefined) {
    if (hasLocal) {
      if (branding.bottomFabIcon) {
        localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, branding.bottomFabIcon);
      } else {
        localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
      }
      window.dispatchEvent(new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: branding.bottomFabIcon }));
    }
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'asset_bottom_fab_icon'), {
        data: branding.bottomFabIcon || '',
        updatedAt,
        version: newTimestamp,
      });
    } catch (e) {
      console.warn('[RealTime Sync] Failed to save asset_bottom_fab_icon:', e);
    }
  }

  // 4. Independent Official Stamp
  if (branding.officialStamp !== undefined) {
    if (hasLocal) {
      if (branding.officialStamp) {
        localStorage.setItem(PROTOCOL_OFFICIAL_STAMP_KEY, branding.officialStamp);
      } else {
        localStorage.removeItem(PROTOCOL_OFFICIAL_STAMP_KEY);
      }
      window.dispatchEvent(new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: branding.officialStamp }));
    }
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'asset_official_stamp'), {
        data: branding.officialStamp || '',
        updatedAt,
        version: newTimestamp,
      });
    } catch (e) {
      console.warn('[RealTime Sync] Failed to save asset_official_stamp:', e);
    }
  }

  // 5. Independent Supervisor Avatar
  if (branding.supervisorAvatar !== undefined) {
    if (hasLocal) {
      if (branding.supervisorAvatar) {
        localStorage.setItem(PROTOCOL_SUPERVISOR_AVATAR_KEY, branding.supervisorAvatar);
        localStorage.setItem(PROTOCOL_USER_AVATAR_KEY, branding.supervisorAvatar);
      } else {
        localStorage.removeItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);
        localStorage.removeItem(PROTOCOL_USER_AVATAR_KEY);
      }
      window.dispatchEvent(new Event(DOCTOR_AVATAR_EVENT));
    }
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'asset_supervisor_avatar'), {
        data: branding.supervisorAvatar || '',
        updatedAt,
        version: newTimestamp,
      });
    } catch (e) {
      console.warn('[RealTime Sync] Failed to save asset_supervisor_avatar:', e);
    }
  }

  // Legacy fallback if appLogo specifically provided
  if (branding.appLogo && hasLocal) {
    try {
      localStorage.setItem(PROTOCOL_APP_LOGO_KEY, branding.appLogo);
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROTOCOL_BRANDING_EVENT, { detail: { ...branding, updatedAt } })
    );
    window.dispatchEvent(new Event('storage'));
  }

  // Commit clean, bounded metadata to Central Cloud Firestore
  // To strictly prevent the 1MB Firestore document limit from ever triggering,
  // we do not store multi-megabyte payloads in branding_settings.
  // Each asset <= 50KB can be mirrored, but larger ones remain safely in their dedicated docs.
  const safeManifestPayload: Record<string, any> = {
    updatedAt,
    updatedBy: 'admin_supervisor',
    version: newTimestamp,
  };

  if (branding.supervisorAvatar !== undefined) {
    safeManifestPayload.supervisorAvatar =
      branding.supervisorAvatar && branding.supervisorAvatar.length <= 50 * 1024
        ? branding.supervisorAvatar
        : branding.supervisorAvatar
        ? '__stored_in_dedicated_asset__'
        : '';
  }
  if (branding.headerLogo !== undefined) {
    safeManifestPayload.headerLogo =
      branding.headerLogo && branding.headerLogo.length <= 50 * 1024
        ? branding.headerLogo
        : branding.headerLogo
        ? '__stored_in_dedicated_asset__'
        : '';
  }
  if (branding.middleCardLogo !== undefined) {
    safeManifestPayload.middleCardLogo =
      branding.middleCardLogo && branding.middleCardLogo.length <= 50 * 1024
        ? branding.middleCardLogo
        : branding.middleCardLogo
        ? '__stored_in_dedicated_asset__'
        : '';
  }
  if (branding.bottomFabIcon !== undefined) {
    safeManifestPayload.bottomFabIcon =
      branding.bottomFabIcon && branding.bottomFabIcon.length <= 50 * 1024
        ? branding.bottomFabIcon
        : branding.bottomFabIcon
        ? '__stored_in_dedicated_asset__'
        : '';
  }
  if (branding.officialStamp !== undefined) {
    safeManifestPayload.officialStamp =
      branding.officialStamp && branding.officialStamp.length <= 50 * 1024
        ? branding.officialStamp
        : branding.officialStamp
        ? '__stored_in_dedicated_asset__'
        : '';
  }
  if (branding.appLogo !== undefined) {
    safeManifestPayload.appLogo =
      branding.appLogo && branding.appLogo.length <= 50 * 1024 ? branding.appLogo : '';
  }

  try {
    await setDoc(docRef, cleanFirestoreData(safeManifestPayload), { merge: true });
  } catch (err) {
    console.warn('[RealTime Sync] Merge notice for branding_settings, attempting clean replacement:', err);
    // If merging failed because the existing document has old bulky fields, overwrite with clean manifest
    await setDoc(docRef, cleanFirestoreData(safeManifestPayload));
  }

  triggerGlobalCacheBust('app_branding').catch(() => {});
}
