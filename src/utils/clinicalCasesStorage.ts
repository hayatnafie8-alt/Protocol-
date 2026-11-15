/**
 * Uses IndexedDB for high-capacity long-term photo and case preservation throughout the academic year,
 * with real-time sync across components, Cloud Firestore real-time synchronization, and automatic localStorage fallback.
 */

import { doc, setDoc, onSnapshot, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cleanFirestoreData } from '../services/realTimeSyncService';

export type ClinicalCategory =
  | 'extraction' // قلع
  | 'fillings'   // حشوات
  | 'dentures'   // أطقم
  | 'cleaning'   // تنظيف
  | 'endo'       // معالجة لبية
  | 'other';     // أخرى

export interface CategoryMetadata {
  id: ClinicalCategory;
  nameAr: string;
  nameEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const CLINICAL_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'extraction',
    nameAr: 'قلع',
    nameEn: 'Extraction',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    icon: '🦷',
  },
  {
    id: 'fillings',
    nameAr: 'حشوات',
    nameEn: 'Fillings',
    color: '#c5a059',
    bgColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: 'rgba(197, 160, 89, 0.4)',
    icon: '💎',
  },
  {
    id: 'dentures',
    nameAr: 'أطقم',
    nameEn: 'Dentures',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    icon: '🪥',
  },
  {
    id: 'cleaning',
    nameAr: 'تنظيف',
    nameEn: 'Cleaning',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    icon: '✨',
  },
  {
    id: 'endo',
    nameAr: 'معالجة لبية',
    nameEn: 'Endodontics',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    icon: '⚡',
  },
  {
    id: 'other',
    nameAr: 'أخرى',
    nameEn: 'Other',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    icon: '📋',
  },
];

export interface CasePhoto {
  id: string;
  url: string; // Base64 or Object URL
  caption?: string; // 'ورقة الحالة (Case Sheet)' | 'أشعة (X-Ray)' | 'قبل الشغل' | 'أثناء الشغل' | 'بعد الشغل'
  photoType?: 'case_sheet' | 'xray' | 'clinical' | 'other';
  timestamp: string;
}

export interface TrueCaseItem {
  id: number | string;
  name: string;
  date: string;
  category: ClinicalCategory;
  procedure?: string;
  toothNumber?: string;
  photos: CasePhoto[];
  image?: string; // Legacy fallback single image
  notes?: string;
  isArchived: boolean;
  timestamp: string;

  // Advanced Clinical Case Logger & Follow-up Fields
  phoneOrContact?: string;
  slotId?: string; // Link to college clinic schedule slot
  appointmentId?: string; // Link to appointment
  anesthesiaType?: string; // e.g. "Lidocaine 2% with 1:80,000 Epinephrine"
  anesthesiaCarpules?: string; // e.g. "1.5 carpule (Infiltration / IANB)"
  observations?: string; // Dedicated manual personal observations & treatment details
  nextSessionPlan?: string; // Plan for future sessions
  sessionNumber?: number; // e.g. Visit 1, Visit 2
  isFeatured?: boolean; // Featured/Returning patient flag
}

export interface PatientProfileSummary {
  normalizedName: string;
  displayName: string;
  visitCount: number;
  isFeatured: boolean;
  lastVisitDate: string;
  firstVisitDate: string;
  procedures: string[];
  cases: TrueCaseItem[];
  allPhotos: CasePhoto[];
  caseSheetPhotos: CasePhoto[];
  xrayPhotos: CasePhoto[];
  clinicalPhotos: CasePhoto[];
  notesHistory: Array<{
    date: string;
    procedure?: string;
    toothNumber?: string;
    notes?: string;
    observations?: string;
    nextSessionPlan?: string;
  }>;
}

/**
 * Normalizes patient names in Arabic and English for consistent recognition
 * across appointments, college schedule slots, and clinical cases.
 */
export function normalizePatientName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // strip tashkeel/diacritics
    .replace(/^(د\.|دكتور|مريض|مراجع|سيد|سيدة|السيد|السيدة|mr\.|mrs\.|ms\.|dr\.)\s*/i, '')
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether a patient name has multiple appointments or cases
 */
export function isReturningPatient(
  patientName: string,
  profilesMap: Map<string, PatientProfileSummary>
): boolean {
  if (!patientName) return false;
  const norm = normalizePatientName(patientName);
  const profile = profilesMap.get(norm);
  return Boolean(profile && (profile.visitCount >= 2 || profile.isFeatured));
}

/**
 * Builds a comprehensive Patient Profile Map linking cases and appointments
 */
export function getPatientProfilesMap(
  cases: TrueCaseItem[],
  appointments?: Array<{ id?: string; name: string; date: string; procedure?: string; toothNumber?: string }>
): Map<string, PatientProfileSummary> {
  const map = new Map<string, PatientProfileSummary>();

  // Process logged clinical cases
  cases.forEach((c) => {
    if (!c.name) return;
    const norm = normalizePatientName(c.name);
    if (!norm) return;

    if (!map.has(norm)) {
      map.set(norm, {
        normalizedName: norm,
        displayName: c.name,
        visitCount: 0,
        isFeatured: false,
        lastVisitDate: c.date,
        firstVisitDate: c.date,
        procedures: [],
        cases: [],
        allPhotos: [],
        caseSheetPhotos: [],
        xrayPhotos: [],
        clinicalPhotos: [],
        notesHistory: [],
      });
    }

    const profile = map.get(norm)!;
    profile.visitCount += 1;
    profile.cases.push(c);

    // Track procedures
    if (c.procedure && !profile.procedures.includes(c.procedure)) {
      profile.procedures.push(c.procedure);
    }

    // Sort and classify photos
    if (c.photos && c.photos.length > 0) {
      profile.allPhotos.push(...c.photos);
      c.photos.forEach((p) => {
        const cap = (p.caption || '').toLowerCase();
        if (p.photoType === 'case_sheet' || cap.includes('ورقة') || cap.includes('sheet')) {
          profile.caseSheetPhotos.push(p);
        } else if (p.photoType === 'xray' || cap.includes('اشعة') || cap.includes('أشعة') || cap.includes('x-ray') || cap.includes('xray')) {
          profile.xrayPhotos.push(p);
        } else {
          profile.clinicalPhotos.push(p);
        }
      });
    }

    // Treatment notes history
    if (c.notes || c.observations || c.nextSessionPlan) {
      profile.notesHistory.push({
        date: c.date,
        procedure: c.procedure,
        toothNumber: c.toothNumber,
        notes: c.notes,
        observations: c.observations,
        nextSessionPlan: c.nextSessionPlan,
      });
    }

    if (c.date && c.date > profile.lastVisitDate) {
      profile.lastVisitDate = c.date;
    }
    if (c.date && c.date < profile.firstVisitDate) {
      profile.firstVisitDate = c.date;
    }
    if (c.isFeatured) {
      profile.isFeatured = true;
    }
  });

  // Cross-reference with scheduled appointments
  if (appointments) {
    appointments.forEach((appt) => {
      if (!appt.name) return;
      const norm = normalizePatientName(appt.name);
      if (!norm) return;

      if (!map.has(norm)) {
        map.set(norm, {
          normalizedName: norm,
          displayName: appt.name,
          visitCount: 1,
          isFeatured: false,
          lastVisitDate: appt.date,
          firstVisitDate: appt.date,
          procedures: appt.procedure ? [appt.procedure] : [],
          cases: [],
          allPhotos: [],
          caseSheetPhotos: [],
          xrayPhotos: [],
          clinicalPhotos: [],
          notesHistory: [],
        });
      } else {
        const profile = map.get(norm)!;
        const alreadyInCases = profile.cases.some(
          (c) => String(c.id) === String(appt.id) || (c.date === appt.date && normalizePatientName(c.name) === norm)
        );
        if (!alreadyInCases) {
          profile.visitCount += 1;
          if (appt.procedure && !profile.procedures.includes(appt.procedure)) {
            profile.procedures.push(appt.procedure);
          }
          if (appt.date && appt.date > profile.lastVisitDate) {
            profile.lastVisitDate = appt.date;
          }
          if (appt.date && appt.date < profile.firstVisitDate) {
            profile.firstVisitDate = appt.date;
          }
        }
      }
    });
  }

  // Auto-flag any patient with 2 or more sessions/visits as "المراجع المميز"
  map.forEach((profile) => {
    if (profile.visitCount >= 2) {
      profile.isFeatured = true;
    }
  });

  return map;
}

export const CLINICAL_CASES_EVENT = 'protocol_clinical_cases_updated';
const DB_NAME = 'ProtocolClinicalCasesDB';
const DB_VERSION = 1;
const STORE_NAME = 'cases';
const LOCAL_STORAGE_KEY = 'protocol_true_cases_archive';

/**
 * Compress an image File or Base64 string to a lightweight high-quality JPEG
 * to ensure maximum reliability and speed.
 */
export async function compressClinicalImage(
  fileOrBase64: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      if (typeof fileOrBase64 === 'string') {
        resolve(fileOrBase64);
      } else {
        reject(new Error('Failed to load image for compression'));
      }
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    }
  });
}

/**
 * Initialize IndexedDB with promise wrapper
 */
function openClinicalDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[ClinicalDB] IndexedDB open error, falling back to localStorage');
        resolve(null);
      };
    } catch (e) {
      console.warn('[ClinicalDB] Exception opening IndexedDB', e);
      resolve(null);
    }
  });
}

/**
 * Load all cases from IndexedDB with automatic fallback to localStorage
 */
export async function getClinicalCases(): Promise<TrueCaseItem[]> {
  const db = await openClinicalDB();

  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      const items = await new Promise<TrueCaseItem[]>((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      if (items && items.length > 0) {
        return normalizeCases(items);
      }
    } catch (e) {
      console.warn('[ClinicalDB] Error reading from IndexedDB', e);
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = normalizeCases(parsed);
        // Async background sync into IndexedDB
        if (db && normalized.length > 0) {
          saveCasesToIndexedDB(normalized, db).catch(() => {});
        }
        return normalized;
      }
    }
  } catch (err) {
    console.error('[ClinicalDB] Error reading from localStorage', err);
  }

  return [];
}

/**
 * Helper to ensure cases match the TrueCaseItem interface
 */
function normalizeCases(items: any[]): TrueCaseItem[] {
  return items.map((item) => {
    const photos: CasePhoto[] = Array.isArray(item.photos)
      ? item.photos
      : item.image
      ? [
          {
            id: 'legacy-photo-' + (item.id || Date.now()),
            url: item.image,
            caption: 'صورة الحالة السريرية',
            timestamp: item.timestamp || new Date().toISOString(),
          },
        ]
      : [];

    return {
      id: item.id || Date.now() + Math.random(),
      name: item.name || '',
      date: item.date || '',
      category: item.category || 'other',
      procedure: item.procedure || '',
      toothNumber: item.toothNumber || '',
      photos,
      image: photos[0]?.url || item.image || '',
      notes: item.notes || '',
      isArchived: item.isArchived !== false,
      timestamp: item.timestamp || new Date().toISOString(),
      phoneOrContact: item.phoneOrContact || '',
      slotId: item.slotId || undefined,
      appointmentId: item.appointmentId || undefined,
      anesthesiaType: item.anesthesiaType || undefined,
      anesthesiaCarpules: item.anesthesiaCarpules || undefined,
      observations: item.observations || undefined,
      nextSessionPlan: item.nextSessionPlan || undefined,
      sessionNumber: item.sessionNumber || undefined,
      isFeatured: Boolean(item.isFeatured),
    };
  });
}

/**
 * Save cases list to IndexedDB
 */
async function saveCasesToIndexedDB(cases: TrueCaseItem[], openDbInstance?: IDBDatabase | null): Promise<void> {
  const db = openDbInstance || (await openClinicalDB());
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();

      cases.forEach((c) => {
        store.put(c);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

const CASES_COLLECTION = 'clinical_cases';

/**
 * Save cases to IndexedDB, localStorage, and Cloud Firestore in real time, then broadcast update event
 */
export async function saveClinicalCases(cases: TrueCaseItem[], syncToCloud = true): Promise<void> {
  const normalized = normalizeCases(cases);

  // 1. Save to IndexedDB (unlimited storage for photos)
  await saveCasesToIndexedDB(normalized);

  // 2. Save lightweight version (with thumbnails or limited photos) to localStorage for instant boot
  try {
    const lightweight = normalized.map((item) => {
      // Keep only first 2 photos in localStorage to prevent 5MB overflow
      return {
        ...item,
        photos: item.photos.slice(0, 2),
        image: item.photos[0]?.url || item.image || '',
      };
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight));
    localStorage.setItem('protocol_appointments', JSON.stringify(lightweight));
  } catch (e) {
    console.warn('[ClinicalDB] localStorage quota warning, IndexedDB will keep all photos intact', e);
  }

  // 3. Broadcast real-time update locally
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(CLINICAL_CASES_EVENT, { detail: normalized })
    );
    window.dispatchEvent(new Event('storage'));
  }

  // 4. Synchronize with Cloud Firestore so cases persist and sync across shared links and installed PWA
  if (syncToCloud && db) {
    try {
      // Save top-level bulk backup document for atomic multi-device sync
      const bulkRef = doc(db, 'app_config', 'clinical_cases_bulk');
      // Compress photos before sending bulk
      const cloudPayload = normalized.slice(0, 50).map((c) => ({
        ...c,
        id: String(c.id),
        photos: (c.photos || []).slice(0, 2), // Keep recent photos for cloud sync
      }));

      setDoc(bulkRef, {
        cases: cleanFirestoreData(cloudPayload),
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      }, { merge: true }).catch((err) => {
        console.warn('[ClinicalCases] Bulk Firestore sync notice:', err);
      });
    } catch (e) {
      console.warn('[ClinicalCases] Cloud sync error:', e);
    }
  }
}

/**
 * Real-time Firestore Cloud Listener for Clinical Cases
 * Keeps patient appointments and cases synchronized between mobile devices, PWA installs, and shared links
 */
export function subscribeToClinicalCasesCloud(
  callback: (cases: TrueCaseItem[]) => void
): () => void {
  if (!db) {
    getClinicalCases().then(callback);
    return () => {};
  }

  try {
    const bulkRef = doc(db, 'app_config', 'clinical_cases_bulk');
    const unsubscribe = onSnapshot(
      bulkRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.cases) && data.cases.length > 0) {
            const cloudCases: TrueCaseItem[] = data.cases;
            const localCases = await getClinicalCases();

            // Merge cloud cases with local (giving priority to local photos if higher fidelity)
            const merged = [...localCases];
            cloudCases.forEach((cloudItem) => {
              const idx = merged.findIndex((l) => String(l.id) === String(cloudItem.id));
              if (idx >= 0) {
                // Keep local high-res photos if present, update metadata
                merged[idx] = {
                  ...merged[idx],
                  name: cloudItem.name || merged[idx].name,
                  date: cloudItem.date || merged[idx].date,
                  category: cloudItem.category || merged[idx].category,
                  procedure: cloudItem.procedure || merged[idx].procedure,
                  toothNumber: cloudItem.toothNumber || merged[idx].toothNumber,
                  isArchived: cloudItem.isArchived ?? merged[idx].isArchived,
                  photos: merged[idx].photos && merged[idx].photos.length > 0 ? merged[idx].photos : cloudItem.photos || [],
                };
              } else {
                merged.push({
                  ...cloudItem,
                  id: String(cloudItem.id),
                });
              }
            });

            // Save to IndexedDB without re-triggering cloud write
            await saveClinicalCases(merged, false);
            callback(merged);
            return;
          }
        }
        // Fallback to local
        const currentLocal = await getClinicalCases();
        callback(currentLocal);
      },
      (error) => {
        console.warn('[ClinicalCases] Firestore onSnapshot fallback to IndexedDB:', error);
        getClinicalCases().then(callback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[ClinicalCases] Error attaching onSnapshot:', err);
    getClinicalCases().then(callback);
    return () => {};
  }
}

/**
 * Manually force pull from Cloud Firestore
 */
export async function forceSyncClinicalCasesFromCloud(): Promise<TrueCaseItem[]> {
  if (!db) return getClinicalCases();
  try {
    const bulkRef = doc(db, 'app_config', 'clinical_cases_bulk');
    const snapshot = await getDocs(collection(db, 'app_config'));
    const docSnap = snapshot.docs.find((d) => d.id === 'clinical_cases_bulk');
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.cases) && data.cases.length > 0) {
        await saveClinicalCases(data.cases, false);
        return data.cases;
      }
    }
  } catch (e) {
    console.warn('[ClinicalCases] Force sync error:', e);
  }
  return getClinicalCases();
}

/**
 * Add or update a clinical case
 */
export async function addOrUpdateClinicalCase(caseItem: TrueCaseItem): Promise<TrueCaseItem[]> {
  const current = await getClinicalCases();
  const existingIdx = current.findIndex((c) => c.id === caseItem.id);

  let updated: TrueCaseItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = caseItem;
  } else {
    updated = [caseItem, ...current];
  }

  await saveClinicalCases(updated, true);

  // Also write individual doc for fast access if possible
  if (db) {
    try {
      const cleanItem = cleanFirestoreData({
        ...caseItem,
        id: String(caseItem.id),
        photos: (caseItem.photos || []).slice(0, 3), // Keep top 3 photos in doc
        updatedAt: new Date().toISOString(),
      });
      setDoc(doc(db, CASES_COLLECTION, String(caseItem.id)), cleanItem, { merge: true }).catch(() => {});
    } catch {}
  }

  return updated;
}

/**
 * Delete a clinical case by ID (deletes locally and from Cloud Firestore)
 */
export async function deleteClinicalCase(caseId: number | string): Promise<TrueCaseItem[]> {
  const current = await getClinicalCases();
  const updated = current.filter((c) => c.id !== caseId);
  await saveClinicalCases(updated, true);

  // Also remove from Firestore individual collection
  if (db) {
    try {
      deleteDoc(doc(db, CASES_COLLECTION, String(caseId))).catch(() => {});
    } catch {}
  }

  return updated;
}

/**
 * Export all clinical cases as a downloadable JSON file for permanent backup
 */
export async function exportClinicalCasesBackup(): Promise<void> {
  const cases = await getClinicalCases();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cases, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `PROTOCOL_Clinical_Portfolio_Backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
