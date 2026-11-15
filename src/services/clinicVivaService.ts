import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  ClinicVivaQuestion,
  ClinicVivaSectionConfig,
  DEFAULT_CLINIC_VIVA_QUESTIONS,
  DEFAULT_CLINIC_VIVA_CONFIG,
  getLocalCachedClinicQuestions,
  saveLocalCachedClinicQuestions,
  getLocalCachedClinicConfig,
  saveLocalCachedClinicConfig,
} from '../data/clinicVivaQuestionsData';
import {
  deliverMultiChannelNotification,
  playNotificationChime,
} from './pushNotificationManager';
import { sendRealTimeNotification } from './realTimeSyncService';

const QUESTIONS_COLLECTION = 'clinic_viva_questions';
const CONFIG_DOC_PATH = { collection: 'app_config', docId: 'clinic_viva_config' };

/**
 * Subscribes to live cloud changes for Clinic Viva Questions.
 * Automatically sounds the chime and displays notification when a new question is posted!
 */
export function subscribeToClinicVivaQuestionsCloud(
  onQuestions: (questions: ClinicVivaQuestion[]) => void,
  onConfig?: (config: ClinicVivaSectionConfig) => void
): () => void {
  // Emit local cache immediately for instant zero-latency render
  const cachedQuestions = getLocalCachedClinicQuestions();
  onQuestions(cachedQuestions);

  if (onConfig) {
    const cachedConfig = getLocalCachedClinicConfig();
    onConfig(cachedConfig);
  }

  if (!db) {
    return () => {};
  }

  let unsubQuestions = () => {};
  let unsubConfig = () => {};

  // Track seen IDs so we only alert for genuinely new questions added during active sessions
  const seenIds = new Set<string>(cachedQuestions.map((q) => q.id));
  let isInitialLoad = true;

  try {
    const questionsCol = collection(db, QUESTIONS_COLLECTION);
    unsubQuestions = onSnapshot(
      questionsCol,
      (snapshot) => {
        if (snapshot.empty) {
          // If empty, initialize cloud with default questions
          seedDefaultQuestions().catch(console.warn);
          onQuestions(DEFAULT_CLINIC_VIVA_QUESTIONS);
          saveLocalCachedClinicQuestions(DEFAULT_CLINIC_VIVA_QUESTIONS);
          isInitialLoad = false;
          return;
        }

        const cloudQuestions: ClinicVivaQuestion[] = [];
        snapshot.forEach((snap) => {
          cloudQuestions.push({
            ...(snap.data() as ClinicVivaQuestion),
            id: snap.id,
          });
        });

        // Detect new questions added live by supervisor
        if (!isInitialLoad) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newQ = change.doc.data() as ClinicVivaQuestion;
              if (!seenIds.has(change.doc.id)) {
                seenIds.add(change.doc.id);
                // Trigger audible chime and toast notification
                playNotificationChime();
                deliverMultiChannelNotification({
                  id: `viva_${change.doc.id}`,
                  type: 'clinic_viva_question',
                  title: '🩺 سؤال سينيور عيادي جديد (أسئلة العيادة)',
                  message: newQ.question || 'تمت إضافة سؤال سريري جديد من قبل الدكتورة المشرفة',
                  timestamp: Date.now(),
                  url: '/#operative-viva-section',
                }).catch(() => {});
              }
            }
          });
        } else {
          snapshot.forEach((snap) => seenIds.add(snap.id));
          isInitialLoad = false;
        }

        // Sort descending by date
        cloudQuestions.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        saveLocalCachedClinicQuestions(cloudQuestions);
        onQuestions(cloudQuestions);
      },
      (err) => {
        console.warn('Clinic viva questions Firestore snapshot error:', err);
      }
    );

    if (onConfig) {
      const configRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
      unsubConfig = onSnapshot(
        configRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ClinicVivaSectionConfig;
            saveLocalCachedClinicConfig(data);
            onConfig(data);
          }
        },
        (err) => {
          console.warn('Clinic viva config Firestore snapshot error:', err);
        }
      );
    }
  } catch (err) {
    console.warn('Failed to subscribe to clinic viva questions:', err);
  }

  return () => {
    unsubQuestions();
    unsubConfig();
  };
}

/**
 * Adds a new viva question to cloud, broadcasts to all subscribers via Firestore notifications stream,
 * and sounds the immediate audible chime!
 */
export async function addClinicVivaQuestionInCloud(
  questionData: Omit<ClinicVivaQuestion, 'id' | 'createdAt'>
): Promise<ClinicVivaQuestion> {
  const newId = `viva-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const item: ClinicVivaQuestion = {
    ...questionData,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const current = getLocalCachedClinicQuestions();
  const updated = [item, ...current];
  saveLocalCachedClinicQuestions(updated);

  // 2. Persist to Firestore
  if (db) {
    try {
      const docRef = doc(db, QUESTIONS_COLLECTION, newId);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn('Failed to save viva question to Firestore:', err);
    }
  }

  // 3. Send real-time multi-channel notification to Firestore (reaches ALL subscribers worldwide)
  try {
    await sendRealTimeNotification({
      type: 'clinic_viva_question',
      title: '🩺 سؤال سينيور عيادي جديد (أسئلة العيادة)',
      message: item.question,
      url: '/#operative-viva-section',
    });
  } catch (err) {
    console.warn('Failed to broadcast real-time notification to cloud:', err);
  }

  // 4. Trigger immediate local multi-channel notification (sound + toast)
  try {
    await deliverMultiChannelNotification({
      id: `alert-${newId}`,
      type: 'clinic_viva_question',
      title: '🩺 تم نشر السؤال وتفعيل التنبيه بنجاح',
      message: item.question,
      timestamp: Date.now(),
      url: '/#operative-viva-section',
    });
  } catch (err) {
    console.warn('Local notification delivery notice:', err);
  }

  return item;
}

/**
 * Plays a test notification chime and displays real-time toast for Clinic Viva
 */
export async function testClinicVivaNotification(): Promise<void> {
  await deliverMultiChannelNotification({
    id: `test_viva_${Date.now()}`,
    type: 'clinic_viva_question',
    title: '🔔 إشعار تجريبي: تنبيهات أسئلة العيادة (Operative Viva)',
    message: 'تم تفعيل التنبيهات بنجاح! ستصلك نغمة الرنين والإشعار الفوري عند نشر الدكتورة لأي سؤال سينيور جديد ✨',
    timestamp: Date.now(),
    url: '/#operative-viva-section',
  });
}

/**
 * Deletes a viva question from cloud and local cache.
 */
export async function deleteClinicVivaQuestionInCloud(id: string): Promise<void> {
  const current = getLocalCachedClinicQuestions();
  const updated = current.filter((q) => q.id !== id);
  saveLocalCachedClinicQuestions(updated);

  if (db) {
    try {
      const docRef = doc(db, QUESTIONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete viva question from Firestore:', err);
    }
  }
}

/**
 * Updates an individual viva question (text, answer, access type) in Firestore & local cache.
 */
export async function updateClinicVivaQuestionInCloud(
  id: string,
  updates: Partial<ClinicVivaQuestion>
): Promise<void> {
  const current = getLocalCachedClinicQuestions();
  const updated = current.map((q) => (q.id === id ? { ...q, ...updates } : q));
  saveLocalCachedClinicQuestions(updated);

  if (db) {
    try {
      const docRef = doc(db, QUESTIONS_COLLECTION, id);
      await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Failed to update viva question in Firestore:', err);
    }
  }
}

/**
 * Updates section configuration (access type & visibility) in Firestore.
 */
export async function updateClinicVivaSectionConfigInCloud(
  config: Partial<ClinicVivaSectionConfig>
): Promise<ClinicVivaSectionConfig> {
  const current = getLocalCachedClinicConfig();
  const updated: ClinicVivaSectionConfig = {
    ...current,
    ...config,
  };

  saveLocalCachedClinicConfig(updated);

  if (db) {
    try {
      const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Failed to update viva config in Firestore:', err);
    }
  }

  return updated;
}

/**
 * Seeds default questions to Firestore if collection is empty.
 */
async function seedDefaultQuestions(): Promise<void> {
  if (!db) return;
  for (const q of DEFAULT_CLINIC_VIVA_QUESTIONS) {
    try {
      const docRef = doc(db, QUESTIONS_COLLECTION, q.id);
      await setDoc(docRef, q);
    } catch (err) {
      console.warn('Seeding viva question failed for:', q.id, err);
    }
  }
}
