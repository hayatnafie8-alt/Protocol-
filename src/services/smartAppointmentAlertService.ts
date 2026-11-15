/**
 * Real Lock-Screen and Push Notification Dispatcher for Appointments & College Clinics
 * Dispatches native browser & PWA notifications (with vibration, lock screen banners, and sound),
 * supporting:
 * - 1 or 2 days advance warning: "🔔 ذكر مراجعيك بمواعيدهم"
 * - Same day reminder: "⭐ موعد العيادة اليوم"
 * - Empty slot alert: "⚠️ لديك موعد فارغ - Empty slot"
 * - College clinic schedule reminder: "🏥 تذكير عيادة الكلية غداً/اليوم"
 */

import {
  triggerNativePushNotification,
  deliverMultiChannelNotification,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  AppNotificationPayload,
} from './pushNotificationManager';
import { ClinicScheduleSlot, getCollegeClinicSchedule } from '../data/collegeClinicScheduleManager';

const LAST_NOTIFICATION_LOG_KEY = 'dental_clinic_last_dispatched_alerts';

interface DispatchedAlertLog {
  [alertKey: string]: number; // timestamp
}

function getDispatchedLogs(): DispatchedAlertLog {
  try {
    const raw = localStorage.getItem(LAST_NOTIFICATION_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function recordDispatchedAlert(alertKey: string): void {
  try {
    const logs = getDispatchedLogs();
    logs[alertKey] = Date.now();
    // Prune entries older than 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    Object.keys(logs).forEach((k) => {
      if (logs[k] < sevenDaysAgo) delete logs[k];
    });
    localStorage.setItem(LAST_NOTIFICATION_LOG_KEY, JSON.stringify(logs));
  } catch {}
}

function shouldDispatchAlert(alertKey: string, cooldownHours = 12): boolean {
  const logs = getDispatchedLogs();
  const lastTime = logs[alertKey];
  if (!lastTime) return true;
  const elapsed = (Date.now() - lastTime) / (1000 * 60 * 60);
  return elapsed >= cooldownHours;
}

export interface AppointmentAlertCandidate {
  id: string;
  patientName: string;
  dateStr: string; // YYYY-MM-DD
  procedure?: string;
  toothNumber?: string;
  department?: string;
}

/**
 * Checks all active patient appointments and triggers real lock-screen & push alerts
 * based on proximity (1-2 days before, today, empty slot).
 */
export async function runSmartAppointmentAlertScan(
  appointments: AppointmentAlertCandidate[],
  options?: { forceTest?: boolean }
): Promise<{ dispatched: number; messages: string[] }> {
  if (!isNotificationSupported()) {
    return { dispatched: 0, messages: ['المتصفح لا يدعم الإشعارات'] };
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted' && !options?.forceTest) {
    return { dispatched: 0, messages: ['صلاحية الإشعارات غير مفعلة'] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dispatchedCount = 0;
  const messages: string[] = [];

  // 1. Check for Empty Slot Warning (if 0 appointments or explicit empty slot)
  const activePatients = appointments.filter((a) => {
    const n = (a.patientName || '').toLowerCase().trim();
    return n && !n.includes('empty') && !n.includes('فارغ') && !n.includes('شاغر');
  });

  if (activePatients.length === 0) {
    const emptySlotKey = `empty_slot_${today.toISOString().split('T')[0]}`;
    if (shouldDispatchAlert(emptySlotKey, 24) || options?.forceTest) {
      const payload: AppNotificationPayload = {
        id: emptySlotKey,
        type: 'system_alert',
        title: '⚠️ لديك موعد فارغ - Empty Slot في العيادة!',
        message: '🔔 جدول عيادتك خالي حالياً! قم باستقبال مراجع أو حجز موعد لملء وقت التدريب السريري.',
        timestamp: Date.now(),
        url: '/',
      };
      await triggerNativePushNotification(payload);
      recordDispatchedAlert(emptySlotKey);
      dispatchedCount++;
      messages.push('تم إرسال تنبيه: لديك موعد فارغ - Empty slot');
    }
  }

  // 2. Scan appointments for advance reminders (1 or 2 days before) or today's clinic
  for (const appt of appointments) {
    if (!appt.dateStr) continue;
    const isSlotEmpty =
      appt.patientName.toLowerCase().includes('empty') ||
      appt.patientName.toLowerCase().includes('فارغ') ||
      appt.patientName.toLowerCase().includes('شاغر') ||
      !appt.patientName.trim();

    if (isSlotEmpty) continue;

    const targetDate = new Date(appt.dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Case A: 2 days before
    if (diffDays === 2) {
      const key = `advance_2d_${appt.id}_${appt.dateStr}`;
      if (shouldDispatchAlert(key, 20) || options?.forceTest) {
        const payload: AppNotificationPayload = {
          id: key,
          type: 'system_alert',
          title: '🔔 ذكر مراجعيك بمواعيدهم (متبقي يومان)',
          message: `موعد المراجع (${appt.patientName}) بعد يومين بتاريخ ${appt.dateStr}. تواصل معه لتأكيد الحضور وتجهيز أدوات العيادة.`,
          timestamp: Date.now(),
          url: '/',
        };
        await triggerNativePushNotification(payload);
        recordDispatchedAlert(key);
        dispatchedCount++;
        messages.push(`تنبيه مسبق (يومان): ${appt.patientName}`);
      }
    }

    // Case B: 1 day before (غداً)
    else if (diffDays === 1) {
      const key = `advance_1d_${appt.id}_${appt.dateStr}`;
      if (shouldDispatchAlert(key, 16) || options?.forceTest) {
        const payload: AppNotificationPayload = {
          id: key,
          type: 'system_alert',
          title: '🔔 ذكر مراجعيك بمواعيدهم - غداً موعد العيادة!',
          message: `غداً موعد البيشنت (${appt.patientName}) في العيادة الجامعية! تأكد من تجهيز التري والمواد المطلوبة.`,
          timestamp: Date.now(),
          url: '/',
        };
        await triggerNativePushNotification(payload);
        recordDispatchedAlert(key);
        dispatchedCount++;
        messages.push(`تنبيه مسبق (يوم واحد): ${appt.patientName}`);
      }
    }

    // Case C: Today
    else if (diffDays === 0) {
      const key = `today_${appt.id}_${appt.dateStr}`;
      if (shouldDispatchAlert(key, 12) || options?.forceTest) {
        const payload: AppNotificationPayload = {
          id: key,
          type: 'system_alert',
          title: `⭐ موعد العيادة اليوم: ${appt.patientName}`,
          message: `لديك جلسة علاجية مجدولة اليوم للمراجع (${appt.patientName})${
            appt.procedure ? ` - ${appt.procedure}` : ''
          }. بالتوفيق في العيادة!`,
          timestamp: Date.now(),
          url: '/',
        };
        await triggerNativePushNotification(payload);
        recordDispatchedAlert(key);
        dispatchedCount++;
        messages.push(`تنبيه موعد اليوم: ${appt.patientName}`);
      }
    }
  }

  return { dispatched: dispatchedCount, messages };
}

/**
 * Detects all empty/unassigned clinic slots in the student's weekly schedule.
 * A slot is considered empty if it does not have a manually entered patient name
 * AND does not have an active matching appointment for that day of the week.
 * STRICT: Does NOT generate or add names automatically.
 */
export function detectWeeklyEmptySlots(
  scheduleSlots?: ClinicScheduleSlot[],
  appointments: AppointmentAlertCandidate[] = []
): ClinicScheduleSlot[] {
  const slots = scheduleSlots || getCollegeClinicSchedule();
  const emptySlots: ClinicScheduleSlot[] = [];

  const activeSlots = slots.filter((s) => s.isActive !== false);

  for (const slot of activeSlots) {
    const rawName = (slot.assignedPatientName || '').trim();
    const isExplicitlyEmpty =
      !rawName ||
      rawName.toLowerCase().includes('empty') ||
      rawName.toLowerCase().includes('فارغ') ||
      rawName.toLowerCase().includes('شاغر');

    // Also check if any active appointment for this day of week exists with a real patient name
    let hasMatchingAppointment = false;
    if (isExplicitlyEmpty && appointments && appointments.length > 0) {
      hasMatchingAppointment = appointments.some((appt) => {
        if (!appt.dateStr) return false;
        const apptPatient = (appt.patientName || '').trim();
        if (
          !apptPatient ||
          apptPatient.toLowerCase().includes('empty') ||
          apptPatient.toLowerCase().includes('فارغ') ||
          apptPatient.toLowerCase().includes('شاغر')
        ) {
          return false;
        }
        try {
          const d = new Date(appt.dateStr);
          const dayNameEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
          return dayNameEn === slot.dayOfWeek;
        } catch {
          return false;
        }
      });
    }

    if (isExplicitlyEmpty && !hasMatchingAppointment) {
      emptySlots.push(slot);
    }
  }

  return emptySlots;
}

/**
 * Scans the student's weekly clinic schedule for empty slots and dispatches
 * a local notification (sound + toast + OS lock screen push) when detected.
 * Adheres strictly to the rule: NO auto-filling of patient names or mock appointments.
 */
export async function runWeeklyEmptySlotsAlertScan(
  scheduleSlots?: ClinicScheduleSlot[],
  appointments: AppointmentAlertCandidate[] = [],
  options?: { forceTest?: boolean; silent?: boolean }
): Promise<{ emptySlotsCount: number; emptySlots: ClinicScheduleSlot[]; messages: string[] }> {
  const slots = scheduleSlots || getCollegeClinicSchedule();
  const emptySlots = detectWeeklyEmptySlots(slots, appointments);
  const messages: string[] = [];

  if (emptySlots.length === 0) {
    return { emptySlotsCount: 0, emptySlots: [], messages: ['جميع خانات جدول العيادات الأسبوعي ممتلئة بمراجعين'] };
  }

  if (!options?.silent) {
    const todayStr = new Date().toISOString().split('T')[0];
    const alertKey = `weekly_empty_slots_alert_${todayStr}_count_${emptySlots.length}`;

    if (shouldDispatchAlert(alertKey, 6) || options?.forceTest) {
      const firstSlot = emptySlots[0];
      const multipleText =
        emptySlots.length > 1
          ? `يوجد ${emptySlots.length} خانات شاغرة في جدولك الأسبوعي (أقربها: ${firstSlot.dayNameAr} - ${firstSlot.department}).`
          : `خانة عيادة ${firstSlot.dayNameAr} (${firstSlot.department}) في ${firstSlot.timeStart} فارغة بدون مراجع.`;

      const payload: AppNotificationPayload = {
        id: `empty_weekly_${Date.now()}`,
        type: 'system_alert',
        title: `⚠️ تنبيه خانة فارغة في جدول عياداتك (${emptySlots.length})`,
        message: `${multipleText} يرجى إدخال اسم المراجع يدوياً لضمان استثمار الجلسة السريرية.`,
        timestamp: Date.now(),
        url: '/',
      };

      await deliverMultiChannelNotification(payload);
      recordDispatchedAlert(alertKey);
      messages.push(`تم إرسال إشعار محلي: ${emptySlots.length} خانة فارغة في الجدول الأسبوعي`);
    }
  }

  return {
    emptySlotsCount: emptySlots.length,
    emptySlots,
    messages,
  };
}

/**
 * Send an immediate live test notification to verify lock-screen alert capability
 */
export async function sendInstantLiveLockScreenTest(): Promise<boolean> {
  let perm = getNotificationPermission();
  if (perm !== 'granted') {
    perm = await requestNotificationPermission();
  }
  if (perm !== 'granted') {
    return false;
  }

  const payload: AppNotificationPayload = {
    id: 'test_alert_' + Date.now(),
    type: 'system_alert',
    title: '🔔 تنبيه ذكي حقيقي (شاشة القفل Lock Screen)',
    message: '⚠️ تم اختبار الإشعارات بنجاح: "ذكر مراجعيك بمواعيدهم" و "تنبيه الخانة الفارغة في جدول العيادات" تعمل بشكل فوري على جهازك!',
    timestamp: Date.now(),
    url: '/',
  };

  return await triggerNativePushNotification(payload);
}

/**
 * Triggers an immediate test of the empty slots alert for the weekly clinic schedule
 */
export async function sendInstantWeeklyEmptySlotTest(
  scheduleSlots?: ClinicScheduleSlot[],
  appointments: AppointmentAlertCandidate[] = []
): Promise<{ dispatched: boolean; count: number; message: string }> {
  let perm = getNotificationPermission();
  if (perm !== 'granted') {
    perm = await requestNotificationPermission();
  }

  const slots = scheduleSlots || getCollegeClinicSchedule();
  const emptySlots = detectWeeklyEmptySlots(slots, appointments);

  if (emptySlots.length === 0) {
    const payload: AppNotificationPayload = {
      id: 'full_schedule_' + Date.now(),
      type: 'system_alert',
      title: '✅ جدول العيادات الأسبوعي مكتمل',
      message: 'رائع! لا توجد أي خانات فارغة في جدولك، جميع العيادات مسجل لها مراجعون يدوياً.',
      timestamp: Date.now(),
      url: '/',
    };
    await deliverMultiChannelNotification(payload);
    return { dispatched: true, count: 0, message: 'جدولك مكتمل ولا توجد خانات شاغرة' };
  }

  const firstSlot = emptySlots[0];
  const payload: AppNotificationPayload = {
    id: 'empty_weekly_test_' + Date.now(),
    type: 'system_alert',
    title: `⚠️ تنبيه محلي: ${emptySlots.length} خانة فارغة في جدول العيادات`,
    message: `لديك ${emptySlots.length} خانة عيادة بدون مراجع (مثال: ${firstSlot.dayNameAr} - ${firstSlot.department}). يرجى تسجيل أسماء المراجعين يدوياً!`,
    timestamp: Date.now(),
    url: '/',
  };

  await deliverMultiChannelNotification(payload);
  return { dispatched: true, count: emptySlots.length, message: `تم إرسال إشعار محلي لـ ${emptySlots.length} خانة فارغة` };
}

