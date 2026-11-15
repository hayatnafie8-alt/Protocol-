/**
 * Multi-Channel Push & In-App Notification Manager
 * Handles Web Push API, Service Worker background notifications, Audio chimes, and In-App Toasts.
 */

export type NotificationType =
  | 'broadcast_post'
  | 'targeted_reply'
  | 'system_alert'
  | 'report_export_request'
  | 'report_export_approved'
  | 'report_export_rejected'
  | 'clinic_viva_question';

export interface AppNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetEmail?: string;
  targetNoteId?: string;
  postId?: string;
  requestId?: string;
  studentName?: string;
  timestamp: number;
  url?: string;
}

// AudioContext singleton for synthetic notification chime
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing, crystal-clear 2-tone chime ("Ding-Dong")
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: High harmonic E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Warm fundamental A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug('[Push Manager] Audio chime playback bypassed:', err);
  }
}

/**
 * Check if browser supports Web Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    // Unlock AudioContext on this user gesture
    getAudioContext();

    const permission = await Notification.requestPermission();
    localStorage.setItem('pwa_notification_permission_resolved', 'true');
    return permission;
  } catch (error) {
    console.warn('[Push Manager] Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Trigger native Push/Browser notification (works in PWA background & desktop)
 */
export async function triggerNativePushNotification(payload: AppNotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const title = payload.title;
  const options: NotificationOptions = {
    body: payload.message,
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    tag: payload.id || `notif_${payload.timestamp}`,
    data: {
      url: payload.url || '/',
      id: payload.id,
      type: payload.type,
      targetNoteId: payload.targetNoteId,
      postId: payload.postId,
    },
    // Pattern: vibration pulse on mobile
    ...(typeof navigator !== 'undefined' && 'vibrate' in navigator ? { vibrate: [200, 100, 200] } : {}),
  };

  try {
    // Strategy A: Via Service Worker registration (Required for Android & PWA background)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, options);
        return true;
      }
    }

    // Strategy B: Standard Notification API fallback
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (payload.targetNoteId) {
        window.dispatchEvent(
          new CustomEvent('app-open-note-modal', { detail: { noteId: payload.targetNoteId } })
        );
      } else if (payload.postId) {
        window.dispatchEvent(
          new CustomEvent('app-open-post', { detail: { postId: payload.postId } })
        );
      }
    };
    return true;
  } catch (err) {
    console.warn('[Push Manager] Native notification dispatch error:', err);
    return false;
  }
}

/**
 * Dispatch an in-app visual toast notification
 */
export function dispatchInAppToast(payload: AppNotificationPayload): void {
  if (typeof window === 'undefined') return;

  // Play subtle audible chime
  playNotificationChime();

  // Dispatch custom DOM event
  window.dispatchEvent(
    new CustomEvent<AppNotificationPayload>('app-realtime-notification', { detail: payload })
  );
}

/**
 * Deliver full multi-channel notification (Sound + In-App Toast + Background Web Push)
 */
export async function deliverMultiChannelNotification(payload: AppNotificationPayload): Promise<void> {
  // 1. In-App visual Toast & sound
  dispatchInAppToast(payload);

  // 2. Native OS / PWA Web Push notification
  await triggerNativePushNotification(payload);
}

export interface PushNotificationPreferences {
  clinicalUpdates: boolean;
  drugGuideUpdates: boolean;
  scheduleReminders: boolean;
}

const PREF_STORAGE_KEY = 'protocol_push_notification_preferences';

export function getPushNotificationPreferences(): PushNotificationPreferences {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    clinicalUpdates: true,
    drugGuideUpdates: true,
    scheduleReminders: true,
  };
}

export function savePushNotificationPreferences(prefs: PushNotificationPreferences): void {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

/**
 * Register or synchronize Web Push subscription via ServiceWorker registration
 */
export async function registerPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
      });
    }
    return sub;
  } catch (err) {
    console.debug('[Push Manager] PushManager subscription optional step:', err);
    return null;
  }
}

/**
 * Trigger immediate native system notification for test or direct in-app action
 */
export async function testBackgroundPushNotification(
  category: 'clinical_update' | 'drug_addition' | 'schedule_reminder'
): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return false;

  let title = 'بروتوكول PROTOCOL | إشعار سريري';
  let message = 'هذا إشعار تجريبي يعمل في الخلفية وشاشة القفل.';
  let targetUrl = '/';

  if (category === 'drug_addition') {
    title = 'بروتوكول | إضافة دوائية جديدة: Amoxicillin + Clavulanate 💊';
    message = 'تمت إضافة بروتوكول المضاد الحيوي وجرعات الالتهابات الحادة في دليل الأدوية السريري.';
    targetUrl = '/?tab=prescriptions';
  } else if (category === 'schedule_reminder') {
    title = 'بروتوكول | تذكير عيادة: مراجع محجوز غداً 📅';
    message = 'موعد عيادة غداً: حشوة كلاس 2 (Operative) - كرسي رقم 4 الساعة 08:30 ص.';
    targetUrl = '/?tab=clinical_companion';
  } else {
    title = 'بروتوكول | تحديث بروتوكول سريري: Class IV Composite 🩺';
    message = 'تم تحديث خطوات إعادة بناء الحد القاطع بالسيليكون إندكس ودليل التدرج اللوني.';
    targetUrl = '/?tab=slides';
  }

  const payload: AppNotificationPayload = {
    id: `test_${category}_${Date.now()}`,
    type: 'system_alert',
    title,
    message,
    timestamp: Date.now(),
    url: targetUrl,
  };

  playNotificationChime();

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body: message,
          icon: '/icon-192.png',
          badge: '/favicon.svg',
          tag: `protocol_test_${category}`,
          vibrate: [250, 100, 250, 100, 250],
          data: { url: targetUrl, category },
          actions: [
            { action: 'open', title: 'فتح التطبيق 📱' },
            { action: 'dismiss', title: 'إغلاق ✕' },
          ],
        } as NotificationOptions);
        return true;
      }
    } catch {}
  }

  return triggerNativePushNotification(payload);
}

/**
 * Dispatch Clinical Drug Addition Notification
 */
export async function sendDrugAdditionNotification(
  drugName: string,
  categoryName: string,
  dentalIndication?: string
): Promise<void> {
  const prefs = getPushNotificationPreferences();
  if (!prefs.drugGuideUpdates) return;

  const payload: AppNotificationPayload = {
    id: `drug_${Date.now()}`,
    type: 'broadcast_post',
    title: `بروتوكول | إضافة دواء جديد: ${drugName} 💊`,
    message: `قسم ${categoryName}: ${dentalIndication || 'تمت إضافة اعتبارات الجرعات والاحتياطات السريرية لطب الأسنان.'}`,
    timestamp: Date.now(),
    url: '/?tab=prescriptions',
  };

  await deliverMultiChannelNotification(payload);
}

/**
 * Dispatch Clinic Schedule Reminder Notification
 */
export async function sendScheduleReminderNotification(
  patientName: string,
  timeOrDate: string,
  procedure?: string
): Promise<void> {
  const prefs = getPushNotificationPreferences();
  if (!prefs.scheduleReminders) return;

  const payload: AppNotificationPayload = {
    id: `sched_${Date.now()}`,
    type: 'system_alert',
    title: `بروتوكول | تذكير موعد سريري للمراجع: ${patientName} 📅`,
    message: `الموعد: ${timeOrDate} ${procedure ? `• الإجراء: ${procedure}` : ''}`,
    timestamp: Date.now(),
    url: '/?tab=clinical_companion',
  };

  await deliverMultiChannelNotification(payload);
}

/**
 * Dispatch Clinical Protocol Update Notification
 */
export async function sendClinicalUpdateNotification(
  title: string,
  summary: string
): Promise<void> {
  const prefs = getPushNotificationPreferences();
  if (!prefs.clinicalUpdates) return;

  const payload: AppNotificationPayload = {
    id: `update_${Date.now()}`,
    type: 'broadcast_post',
    title: `بروتوكول | تحديث سريري: ${title} 🩺`,
    message: summary,
    timestamp: Date.now(),
    url: '/?tab=slides',
  };

  await deliverMultiChannelNotification(payload);
}
