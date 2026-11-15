/**
 * Real-Time Clinical Report Export Approval Service
 * Handles supervisor approval workflow for student clinical achievement reports.
 * Includes Firestore real-time sync, multi-channel alerts, local cache fallback, and Telegram notifications.
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import { cleanFirestoreData, createBroadcastNotificationInCloud } from './realTimeSyncService';
import { getLocalTelegramConfig } from './telegramService';

export interface ClinicalReportExportRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  university: string;
  academicStage: string;
  academicYear: string;
  supervisorName: string;
  reportSerialId: string;

  // Clinical Summary Data
  totalCases: number;
  successRate: number;
  totalPhotos: number;
  archivedCasesCount: number;
  categoryBreakdown: Record<string, number>;
  notes?: string;

  // Status & Approval Meta
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  timestamp: number;

  reviewedAt?: string;
  reviewedBy?: string;
  approvalCode?: string;
  rejectionReason?: string;
  supervisorNotes?: string;
}

const REPORT_REQUESTS_COLLECTION = 'report_export_requests';
const LOCAL_REQUESTS_KEY = 'protocol_report_export_requests_cache_v1';
const LOCAL_STUDENT_ID_KEY = 'protocol_student_device_id_v1';
const BROADCAST_CHANNEL_NAME = 'protocol_report_approvals_broadcast';

// Unique student ID per device/browser session
export function getOrCreateStudentProfileId(): string {
  if (typeof window === 'undefined') return 'student-guest';
  try {
    let id = localStorage.getItem(LOCAL_STUDENT_ID_KEY);
    if (!id) {
      id = 'std_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(LOCAL_STUDENT_ID_KEY, id);
    }
    return id;
  } catch {
    return 'std_fallback_' + Date.now();
  }
}

// Generate official authenticated approval code
export function generateApprovalCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `AUTH-APP-${year}-${rand}`;
}

// Local cache helpers
function getCachedRequests(): ClinicalReportExportRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCachedRequests(list: ClinicalReportExportRequest[]): void {
  try {
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list));
    // Broadcast locally
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('PROTOCOL_REPORT_APPROVAL_CHANGED', { detail: list }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'UPDATE', list });
        bc.close();
      }
    }
  } catch {}
}

/**
 * Submit a new Clinical Report Export Request to Supervisor
 */
export async function submitReportExportRequest(
  payload: Omit<
    ClinicalReportExportRequest,
    'id' | 'status' | 'requestedAt' | 'timestamp' | 'approvalCode' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'
  >
): Promise<ClinicalReportExportRequest> {
  testFirestoreConnection().catch(() => {});

  const timestamp = Date.now();
  const id = `req_${payload.studentId}_${timestamp}`;
  const nowFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newRequest: ClinicalReportExportRequest = {
    ...payload,
    id,
    status: 'pending',
    requestedAt: nowFormatted,
    timestamp,
  };

  // 1. Save to Local Cache immediately for zero latency
  const current = getCachedRequests().filter((r) => r.studentId !== payload.studentId || r.status !== 'pending');
  current.unshift(newRequest);
  saveCachedRequests(current);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, REPORT_REQUESTS_COLLECTION, id);
    await setDoc(docRef, cleanFirestoreData(newRequest));
  } catch (err) {
    console.warn('[ClinicalReportApprovalService] Firestore save error, cached locally:', err);
  }

  // 3. Create Real-Time Cloud Notification for Supervisor (Admin Mode)
  try {
    await createBroadcastNotificationInCloud({
      type: 'report_export_request',
      title: '📋 طلب تصدير تقرير سريري جديد',
      message: `طلب الطالب "${newRequest.studentName}" موافقة المشرف لاعتماد وتصدير تقرير الإنجاز السريري السنوي (${newRequest.totalCases} حالة - نسبة نجاح ${newRequest.successRate}%).`,
      requestId: id,
      studentName: newRequest.studentName,
    });
  } catch (err) {
    console.warn('[ClinicalReportApprovalService] Notification error:', err);
  }

  // 4. Send Instant Alert to Supervisor's Telegram (Dr. Hayat Nafee) if configured
  try {
    const tgConfig = getLocalTelegramConfig();
    if (tgConfig.botToken && tgConfig.chatId) {
      const tgText = `🦷 *طلب مصادقة وتصدير تقرير سريري جديد* 📋\n\n` +
        `👤 *الطالب:* ${newRequest.studentName}\n` +
        `🏛️ *الجامعة والكلية:* ${newRequest.university}\n` +
        `🎓 *المرحلة الأكاديمية:* ${newRequest.academicStage} (${newRequest.academicYear})\n` +
        `📊 *الحالات المنجزة:* ${newRequest.totalCases} حالة\n` +
        `✨ *نسبة النجاح:* ${newRequest.successRate}%\n` +
        `📸 *الصور السريرية:* ${newRequest.totalPhotos} صورة\n` +
        `🆔 *معرف التقرير:* \`${newRequest.reportSerialId}\`\n` +
        `⏰ *وقت الطلب:* ${newRequest.requestedAt}\n\n` +
        `🔗 *يرجى فتح لوحة إشراف المشرفة لمراجعة الحالات والموافقة.*`;

      fetch(`https://api.telegram.org/bot${encodeURIComponent(tgConfig.botToken)}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgConfig.chatId,
          text: tgText,
          parse_mode: 'Markdown',
        }),
      }).catch(() => {});
    }
  } catch {}

  return newRequest;
}

/**
 * Approve a Student's Clinical Report Export Request (Supervisor Action)
 */
export async function approveReportExportRequest(
  requestId: string,
  supervisorName: string = 'د. حياة نافع فجر',
  notes?: string
): Promise<ClinicalReportExportRequest | null> {
  testFirestoreConnection().catch(() => {});

  const nowFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const approvalCode = generateApprovalCode();

  let updatedRequest: ClinicalReportExportRequest | null = null;

  // 1. Update Local Cache
  const list = getCachedRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: 'approved',
      reviewedAt: nowFormatted,
      reviewedBy: supervisorName,
      approvalCode,
      supervisorNotes: notes || 'تمت المراجعة والمصادقة الأكاديمية بنجاح.',
    };
    updatedRequest = list[idx];
    saveCachedRequests(list);
  }

  // 2. Update Firestore
  try {
    const docRef = doc(db, REPORT_REQUESTS_COLLECTION, requestId);
    const updates = {
      status: 'approved',
      reviewedAt: nowFormatted,
      reviewedBy: supervisorName,
      approvalCode,
      supervisorNotes: notes || 'تمت المراجعة والمصادقة الأكاديمية بنجاح.',
    };
    await updateDoc(docRef, cleanFirestoreData(updates));
  } catch (err) {
    console.warn('[ClinicalReportApprovalService] Firestore update error:', err);
  }

  // 3. Send Notification to Student
  try {
    await createBroadcastNotificationInCloud({
      type: 'report_export_approved',
      title: '✅ تمت الموافقة على تصدير تقريرك السريري!',
      message: `صادق المشرف "${supervisorName}" رسمياً على تقرير إنجازك السريري بكود الاعتماد: ${approvalCode}. يمكنك الآن تنزيل وطباعة التقرير بحرية.`,
      requestId,
      studentName: updatedRequest?.studentName,
    });
  } catch {}

  return updatedRequest;
}

/**
 * Reject / Request Revisions on a Student's Report Export Request (Supervisor Action)
 */
export async function rejectReportExportRequest(
  requestId: string,
  rejectionReason: string,
  supervisorName: string = 'د. حياة نافع فجر'
): Promise<ClinicalReportExportRequest | null> {
  testFirestoreConnection().catch(() => {});

  const nowFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let updatedRequest: ClinicalReportExportRequest | null = null;

  // 1. Update Local Cache
  const list = getCachedRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: 'rejected',
      reviewedAt: nowFormatted,
      reviewedBy: supervisorName,
      rejectionReason: rejectionReason || 'يرجى مراجعة الحالات وتحديث البيانات قبل إعادة الطلب.',
    };
    updatedRequest = list[idx];
    saveCachedRequests(list);
  }

  // 2. Update Firestore
  try {
    const docRef = doc(db, REPORT_REQUESTS_COLLECTION, requestId);
    const updates = {
      status: 'rejected',
      reviewedAt: nowFormatted,
      reviewedBy: supervisorName,
      rejectionReason: rejectionReason || 'يرجى مراجعة الحالات وتحديث البيانات قبل إعادة الطلب.',
    };
    await updateDoc(docRef, cleanFirestoreData(updates));
  } catch (err) {
    console.warn('[ClinicalReportApprovalService] Firestore update error:', err);
  }

  // 3. Send Notification to Student
  try {
    await createBroadcastNotificationInCloud({
      type: 'report_export_rejected',
      title: '⚠️ تنبيه: إرجاع طلب تصدير التقرير السريري',
      message: `قام المشرف "${supervisorName}" بإرجاع تقريرك السريري للملاحظات: ${rejectionReason}`,
      requestId,
      studentName: updatedRequest?.studentName,
    });
  } catch {}

  return updatedRequest;
}

/**
 * Cancel or Delete a Request (Student or Admin Action)
 */
export async function cancelStudentReportRequest(requestId: string): Promise<void> {
  const list = getCachedRequests().filter((r) => r.id !== requestId);
  saveCachedRequests(list);

  try {
    const docRef = doc(db, REPORT_REQUESTS_COLLECTION, requestId);
    await deleteDoc(docRef);
  } catch {}
}

/**
 * Subscribe to All Clinical Report Export Requests (Supervisor Master Panel)
 */
export function subscribeToAllReportRequests(
  onUpdate: (requests: ClinicalReportExportRequest[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});

  // Deliver current local cache initially
  onUpdate(getCachedRequests());

  // Firestore Real-Time Listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, REPORT_REQUESTS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const firestoreList: ClinicalReportExportRequest[] = [];
        snapshot.forEach((d) => {
          firestoreList.push(d.data() as ClinicalReportExportRequest);
        });

        if (firestoreList.length > 0) {
          saveCachedRequests(firestoreList);
          onUpdate(firestoreList);
        }
      },
      (err) => {
        console.warn('[ClinicalReportApprovalService] Snapshot error, using local cache:', err);
        onUpdate(getCachedRequests());
      }
    );
  } catch (e) {
    console.warn('[ClinicalReportApprovalService] Firestore setup error:', e);
  }

  // Cross-tab and Window Event Listeners
  const handleLocalChange = () => {
    onUpdate(getCachedRequests());
  };

  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined') {
    window.addEventListener('PROTOCOL_REPORT_APPROVAL_CHANGED', handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = () => {
        onUpdate(getCachedRequests());
      };
    }
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('PROTOCOL_REPORT_APPROVAL_CHANGED', handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
      if (bc) bc.close();
    }
  };
}

/**
 * Subscribe to a specific student's report export request (Modal / Student View)
 * Finds the latest request created by this studentId or with matching studentName/reportSerialId.
 */
export function subscribeToStudentReportRequest(
  studentId: string,
  onUpdate: (request: ClinicalReportExportRequest | null) => void,
  reportSerialId?: string
): () => void {
  testFirestoreConnection().catch(() => {});

  const findLatestLocal = (): ClinicalReportExportRequest | null => {
    const list = getCachedRequests();
    // Match by studentId, or if reportSerialId is provided
    const match = list.find(
      (r) => r.studentId === studentId || (reportSerialId && r.reportSerialId === reportSerialId)
    );
    return match || null;
  };

  // Initial local delivery
  onUpdate(findLatestLocal());

  // Firestore Real-Time Listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, REPORT_REQUESTS_COLLECTION);
    const q = query(colRef, where('studentId', '==', studentId), orderBy('timestamp', 'desc'));

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as ClinicalReportExportRequest;
          // Merge to local
          const list = getCachedRequests().filter((r) => r.id !== docData.id);
          list.unshift(docData);
          saveCachedRequests(list);
          onUpdate(docData);
        } else {
          // Check if there's any local match
          onUpdate(findLatestLocal());
        }
      },
      (err) => {
        console.warn('[ClinicalReportApprovalService] Student listener error:', err);
        onUpdate(findLatestLocal());
      }
    );
  } catch {
    onUpdate(findLatestLocal());
  }

  // Cross-tab and Window Event Listeners
  const handleLocalChange = () => {
    onUpdate(findLatestLocal());
  };

  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined') {
    window.addEventListener('PROTOCOL_REPORT_APPROVAL_CHANGED', handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = () => {
        onUpdate(findLatestLocal());
      };
    }
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('PROTOCOL_REPORT_APPROVAL_CHANGED', handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
      if (bc) bc.close();
    }
  };
}
