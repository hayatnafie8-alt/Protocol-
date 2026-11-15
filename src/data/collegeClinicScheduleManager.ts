/**
 * College Clinics Schedule Manager
 * Stores and manages weekly / university clinic schedule entries for dental students.
 * Supports manual entry of days, clinic name, session timing, supervisor, chair/unit #, and notes.
 * Syncs with LocalStorage, IndexedDB, and Cloud Firestore in real time.
 */

import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cleanFirestoreData } from '../services/realTimeSyncService';

export interface ClinicScheduleSlot {
  id: string;
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayNameAr: string;
  department: string; // e.g. Operative Dentistry, Prosthodontics, Endodontics, Oral Surgery, Periodontics, Pedodontics
  clinicRoom?: string; // e.g. العيادة 4، القاعة الكبرى، الطابق الثاني
  chairNumber?: string; // رقم اليونت أو الكرسي
  timeStart: string; // e.g. "08:30"
  timeEnd: string; // e.g. "12:30"
  supervisorName?: string; // المشرف السريري
  targetRequirement?: string; // المطلوب إنجازه (مثلاً: 2 كلاس II + اندو سن أمامي)
  notes?: string;
  isActive: boolean;
  assignedPatientName?: string; // اسم المراجع (يدوياً حصراً بواسطة الطالب)
  patientProcedure?: string; // الإجراء السريري المخطط
  patientContact?: string; // رقم هاتف أو ملف المراجع
}

export const DAYS_OF_WEEK = [
  { key: 'Saturday', nameAr: 'السبت' },
  { key: 'Sunday', nameAr: 'الأحد' },
  { key: 'Monday', nameAr: 'الإثنين' },
  { key: 'Tuesday', nameAr: 'الثلاثاء' },
  { key: 'Wednesday', nameAr: 'الأربعاء' },
  { key: 'Thursday', nameAr: 'الخميس' },
  { key: 'Friday', nameAr: 'الجمعة' },
] as const;

export const DENTAL_DEPARTMENTS = [
  { id: 'operative', nameAr: 'مداواة وترميم الأسنان (Operative)', color: '#10b981' },
  { id: 'endo', nameAr: 'معالجة لب الأسنان (Endodontics)', color: '#3b82f6' },
  { id: 'surgery', nameAr: 'جراحة الفم والقلع (Oral Surgery)', color: '#ef4444' },
  { id: 'perio', nameAr: 'أمراض وجراحة اللثة (Periodontics)', color: '#ec4899' },
  { id: 'prosth', nameAr: 'صناعة وتعويضات الأسنان (Prosthodontics)', color: '#f59e0b' },
  { id: 'pedodontics', nameAr: 'طب أسنان الأطفال (Pedodontics)', color: '#8b5cf6' },
  { id: 'ortho', nameAr: 'تقويم الأسنان (Orthodontics)', color: '#06b6d4' },
  { id: 'diagnosis', nameAr: 'الفحص والتشخيص والأشعة (Oral Diagnosis)', color: '#14b8a6' },
  { id: 'other', nameAr: 'عيادة تخصصية أخرى (Other)', color: '#a0a59a' },
];

const STORAGE_KEY = 'college_clinic_schedule_slots';
export const CLINIC_SCHEDULE_EVENT = 'college_clinic_schedule_updated';

export const DEFAULT_SCHEDULE_SLOTS: ClinicScheduleSlot[] = [
  {
    id: 'slot-1',
    dayOfWeek: 'Sunday',
    dayNameAr: 'الأحد',
    department: 'مداواة وترميم الأسنان (Operative)',
    clinicRoom: 'عيادة المحافظة 2 - الطابق الأول',
    chairNumber: 'Unit #14',
    timeStart: '09:00',
    timeEnd: '12:30',
    supervisorName: 'د. حياة نافع',
    targetRequirement: 'إنجاز حالتين كلاس II كومبوزيت مع عزل ربر دام',
    notes: 'التأكد من إحضار الوج والمايلر ستريب والماتريكس باند',
    isActive: true,
  },
  {
    id: 'slot-2',
    dayOfWeek: 'Tuesday',
    dayNameAr: 'الثلاثاء',
    department: 'جراحة الفم والقلع (Oral Surgery)',
    clinicRoom: 'عيادة الجراحة العامة',
    chairNumber: 'Unit #06',
    timeStart: '08:30',
    timeEnd: '12:00',
    supervisorName: 'دكتور الإشراف الجراحي',
    targetRequirement: 'خلع ضاحك سفلي + فحص سلامة التخدير (MRD)',
    notes: 'مراجعة التاريخ المرضي لضغط الدم وأدوية السيولة',
    isActive: true,
  },
];

export function getCollegeClinicSchedule(): ClinicScheduleSlot[] {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE_SLOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load college clinic schedule:', err);
  }
  return DEFAULT_SCHEDULE_SLOTS;
}

const SCHEDULE_DOC_ID = 'college_clinic_schedule';

/**
 * Saves schedule locally and pushes real-time update to Firestore cloud
 */
export function saveCollegeClinicSchedule(slots: ClinicScheduleSlot[], syncToCloud = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    window.dispatchEvent(new CustomEvent(CLINIC_SCHEDULE_EVENT, { detail: slots }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save college clinic schedule to localStorage:', err);
  }

  // Push to Firestore Cloud Database so all shared devices & PWA installs stay in sync
  if (syncToCloud && db) {
    try {
      const scheduleRef = doc(db, 'app_config', SCHEDULE_DOC_ID);
      const cleanData = cleanFirestoreData({
        slots: slots || [],
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      });
      setDoc(scheduleRef, cleanData, { merge: true }).catch((err) => {
        console.warn('[CollegeSchedule] Firestore sync warning (local cache retained):', err);
      });
    } catch (e) {
      console.warn('[CollegeSchedule] Sync to cloud dispatch error:', e);
    }
  }
}

/**
 * Real-Time Firestore Cloud Listener for College Clinic Schedule
 * Automatically syncs schedule changes across devices, link shares, and installed PWA instances
 */
export function subscribeToCollegeClinicScheduleCloud(
  callback: (slots: ClinicScheduleSlot[]) => void
): () => void {
  if (!db) {
    callback(getCollegeClinicSchedule());
    return () => {};
  }

  try {
    const scheduleRef = doc(db, 'app_config', SCHEDULE_DOC_ID);
    const unsubscribe = onSnapshot(
      scheduleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.slots) && data.slots.length > 0) {
            const cloudSlots: ClinicScheduleSlot[] = data.slots;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSlots));
            } catch {}
            callback(cloudSlots);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent(CLINIC_SCHEDULE_EVENT, { detail: cloudSlots }));
            }
            return;
          }
        }
        // If Firestore document is empty or new, seed it with current local slots
        const local = getCollegeClinicSchedule();
        callback(local);
        if (snapshot && !snapshot.exists()) {
          saveCollegeClinicSchedule(local, true);
        }
      },
      (error) => {
        console.warn('[CollegeSchedule] Firestore onSnapshot fallback to local cache:', error);
        callback(getCollegeClinicSchedule());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[CollegeSchedule] Error setting up schedule onSnapshot listener:', err);
    callback(getCollegeClinicSchedule());
    return () => {};
  }
}

/**
 * Manually force pull from Cloud Firestore
 */
export async function forceSyncCollegeClinicScheduleFromCloud(): Promise<ClinicScheduleSlot[]> {
  if (!db) return getCollegeClinicSchedule();
  try {
    const scheduleRef = doc(db, 'app_config', SCHEDULE_DOC_ID);
    const snapshot = await getDoc(scheduleRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.slots) && data.slots.length > 0) {
        const slots: ClinicScheduleSlot[] = data.slots;
        saveCollegeClinicSchedule(slots, false);
        return slots;
      }
    }
  } catch (e) {
    console.warn('[CollegeSchedule] Force sync error:', e);
  }
  return getCollegeClinicSchedule();
}

export function addClinicScheduleSlot(slot: Omit<ClinicScheduleSlot, 'id'>): ClinicScheduleSlot {
  const current = getCollegeClinicSchedule();
  const newSlot: ClinicScheduleSlot = {
    ...slot,
    id: 'slot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
  };
  const updated = [...current, newSlot];
  saveCollegeClinicSchedule(updated, true);
  return newSlot;
}

export function updateClinicScheduleSlot(id: string, updates: Partial<ClinicScheduleSlot>): void {
  const current = getCollegeClinicSchedule();
  const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveCollegeClinicSchedule(updated, true);
}

export function deleteClinicScheduleSlot(id: string): void {
  const current = getCollegeClinicSchedule();
  const updated = current.filter((s) => s.id !== id);
  saveCollegeClinicSchedule(updated, true);
}

export function resetCollegeClinicScheduleToDefaultCloud(): ClinicScheduleSlot[] {
  saveCollegeClinicSchedule(DEFAULT_SCHEDULE_SLOTS, true);
  return DEFAULT_SCHEDULE_SLOTS;
}

export function assignPatientToClinicSlot(
  slotId: string,
  patientData: {
    assignedPatientName: string;
    patientProcedure?: string;
    patientContact?: string;
  }
): void {
  updateClinicScheduleSlot(slotId, patientData);
}

export function clearPatientFromClinicSlot(slotId: string): void {
  updateClinicScheduleSlot(slotId, {
    assignedPatientName: '',
    patientProcedure: '',
    patientContact: '',
  });
}
