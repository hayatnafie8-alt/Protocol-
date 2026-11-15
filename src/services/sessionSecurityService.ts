import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';

export interface UserSessionData {
  sessionId: string;
  email: string;
  studentName?: string;
  deviceToken: string;
  deviceSummary: string;
  loginTimestamp: number;
  lastHeartbeat: number;
  status: 'active' | 'terminated';
  terminatedReason?: string;
  terminatedAt?: number;
  ipPlaceholder?: string;
}

export interface SessionConflictEvent {
  newDeviceSummary?: string;
  newLoginTimestamp?: number;
  adminTerminated?: boolean;
  reason?: string;
}

const DEVICE_TOKEN_KEY = 'dental_device_token';
const ACTIVE_SESSION_ID_KEY = 'dental_active_session_id';
const COLLECTION_NAME = 'active_sessions';

/**
 * Sanitizes email for use as Firestore document ID
 */
export function getCleanEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Generates or retrieves a persistent unique hardware/browser fingerprint token
 */
export function getOrCreateDeviceToken(): string {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        token = 'dev_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      } else {
        token = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
      }
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return 'dev_temp_' + Date.now();
  }
}

/**
 * Generates human-friendly device and browser summary
 */
export function getDeviceSummary(): string {
  if (typeof navigator === 'undefined') return 'مستعرض ويب غير معروف';

  const ua = navigator.userAgent || '';
  let os = 'جهاز غير معروف';
  let browser = 'المتصفح';

  // Detect OS
  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iPhone / iOS';
  } else if (/Android/i.test(ua)) {
    os = 'Android Phone';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'Mac Computer';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux Device';
  }

  // Detect Browser
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  }

  const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
  return `${os} (${browser}) ${screenRes ? `[${screenRes}]` : ''}`.trim();
}

/**
 * Generates a new unique session ID for current login
 */
export function generateNewSessionId(): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `sess_${Date.now()}_${rand}`;
}

/**
 * Retrieves the currently saved local session ID
 */
export function getLocalSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores local session ID in persistent storage
 */
export function setLocalSessionId(sessionId: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
  } catch {}
}

/**
 * Clears local session token
 */
export function clearLocalSessionId(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  } catch {}
}

/**
 * Registers an active session in Firestore cloud.
 * This guarantees strict single-device session enforcement:
 * When this document is updated with a new sessionId, any previous session listener on other devices will detect
 * the change and immediately terminate the previous session.
 */
export async function registerActiveSessionInCloud(
  email: string,
  studentName?: string
): Promise<{ sessionId: string; deviceToken: string; deviceSummary: string }> {
  testFirestoreConnection().catch(() => {});

  const cleanKey = getCleanEmailKey(email);
  const sessionId = generateNewSessionId();
  const deviceToken = getOrCreateDeviceToken();
  const deviceSummary = getDeviceSummary();
  const now = Date.now();

  setLocalSessionId(sessionId);

  const sessionPayload: UserSessionData = {
    sessionId,
    email: email.trim().toLowerCase(),
    studentName: studentName?.trim() || undefined,
    deviceToken,
    deviceSummary,
    loginTimestamp: now,
    lastHeartbeat: now,
    status: 'active',
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await setDoc(docRef, sessionPayload, { merge: true });
    console.log('[SessionSecurity] Registered new active session for:', email, sessionId);
  } catch (err) {
    console.warn('[SessionSecurity] Error saving session to Firestore:', err);
  }

  return { sessionId, deviceToken, deviceSummary };
}

/**
 * Sends heartbeat ping to keep session active
 */
export async function sendSessionHeartbeat(email: string, sessionId: string): Promise<void> {
  if (!email || !sessionId) return;
  try {
    const cleanKey = getCleanEmailKey(email);
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await setDoc(
      docRef,
      {
        lastHeartbeat: Date.now(),
      },
      { merge: true }
    );
  } catch {}
}

/**
 * Real-Time Session Monitoring Listener:
 * Watches the subscriber's session document in Firestore.
 * If another device logs in, `data.sessionId` will change to the new device's session.
 * The listener immediately detects this discrepancy and triggers `onConflictTerminated`.
 */
export function listenToActiveSessionChanges(
  email: string,
  localSessionId: string,
  onConflictTerminated: (event: SessionConflictEvent) => void
): () => void {
  if (!email || !localSessionId) {
    return () => {};
  }

  testFirestoreConnection().catch(() => {});
  const cleanKey = getCleanEmailKey(email);
  const docRef = doc(db, COLLECTION_NAME, cleanKey);

  let initialFetchDone = false;

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data() as UserSessionData;

      // First run: if remote session doesn't match and exists, check if another device logged in
      if (!initialFetchDone) {
        initialFetchDone = true;
        if (data.sessionId && data.sessionId !== localSessionId) {
          console.warn('[SessionSecurity] Session mismatch on initial fetch!');
          onConflictTerminated({
            newDeviceSummary: data.deviceSummary,
            newLoginTimestamp: data.loginTimestamp,
            reason: 'تم تسجيل الدخول من جهاز آخر سابقاً',
          });
          return;
        }
      }

      // Check for termination from Admin
      if (data.status === 'terminated') {
        onConflictTerminated({
          adminTerminated: true,
          reason: data.terminatedReason || 'تم إنهاء الجلسة من قِبل المشرف',
        });
        return;
      }

      // Check for concurrent login: remote session changed to another device
      if (data.sessionId && data.sessionId !== localSessionId) {
        console.warn('[SessionSecurity] Concurrent login detected on another device:', data.deviceSummary);
        onConflictTerminated({
          newDeviceSummary: data.deviceSummary || 'هاتف أو متصفح آخر',
          newLoginTimestamp: data.loginTimestamp || Date.now(),
          reason: 'تم تسجيل الدخول إلى هذا الحساب من هاتف/جهاز آخر',
        });
      }
    },
    (err) => {
      console.warn('[SessionSecurity] Listener snapshot error:', err);
    }
  );

  return unsubscribe;
}

/**
 * Terminates the subscriber's session in the cloud (e.g. upon user logout)
 */
export async function terminateActiveSessionInCloud(email: string, reason = 'manual_logout'): Promise<void> {
  if (!email) return;
  clearLocalSessionId();
  try {
    const cleanKey = getCleanEmailKey(email);
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await setDoc(
      docRef,
      {
        status: 'terminated',
        terminatedReason: reason,
        terminatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[SessionSecurity] Error terminating session:', err);
  }
}

/**
 * Force terminates a subscriber's session from Admin Panel
 */
export async function adminForceTerminateSession(email: string): Promise<void> {
  if (!email) return;
  try {
    const cleanKey = getCleanEmailKey(email);
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await setDoc(
      docRef,
      {
        sessionId: 'terminated_by_admin_' + Date.now(),
        status: 'terminated',
        terminatedReason: 'تم إنهاء الجلسة وإعادة تعيين الجهاز من قِبل المشرفة د. حياة',
        terminatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[SessionSecurity] Admin terminate error:', err);
  }
}

/**
 * Delete a session document entirely (Admin reset)
 */
export async function adminResetSessionLock(email: string): Promise<void> {
  if (!email) return;
  try {
    const cleanKey = getCleanEmailKey(email);
    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[SessionSecurity] Admin reset doc error:', err);
  }
}

/**
 * Real-time subscription to all active subscriber sessions for Admin monitoring
 */
export function subscribeToAllActiveSessionsCloud(
  onUpdate: (sessions: UserSessionData[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: UserSessionData[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as UserSessionData;
        list.push(item);
      });
      // Sort by latest login timestamp
      list.sort((a, b) => (b.loginTimestamp || 0) - (a.loginTimestamp || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn('[SessionSecurity] Failed to fetch active sessions:', err);
      onUpdate([]);
    }
  );
}
