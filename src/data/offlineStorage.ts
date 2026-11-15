/**
 * Full Offline Caching & Synchronization System
 * Uses IndexedDB with LocalStorage fallbacks to cache:
 * - Published Clinical Protocols (Class I - V)
 * - Surgical Cases Atlas
 * - Home Practice Guides
 * - Patient Psychology Guide (18 Slides)
 * - Scientific Studies & Evidence
 * - Section Visibility & Layout States
 */

import { PRESET_CLASSES, RestorationClass } from './classesData';
import { getSurgicalCases, SurgicalCase, INITIAL_SURGICAL_CASES } from './surgicalCasesData';
import { getHomePractices, HomePracticeExercise, INITIAL_HOME_PRACTICE } from './homePracticeData';
import { GuideSlide, PATIENT_COMMUNICATION_GUIDE } from './patientCommunicationGuideData';
import { getScientificStudies, ScientificStudy, INITIAL_STUDIES } from './studiesData';
import { getAppSections, AppSection } from './sectionsManager';
import { getClinicalSkills, SkillItem, INITIAL_CLINICAL_SKILLS } from './clinicalSkillsData';

const DB_NAME = 'DentalProtocolOfflineDB_v2';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function getIndexedDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const stores = [
        'clinical_protocols',
        'surgical_cases',
        'home_practice',
        'clinical_skills',
        'patient_guide',
        'scientific_studies',
        'app_sections',
        'sync_meta',
      ];

      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('Failed to open IndexedDB, falling back to LocalStorage', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Saves an array of records into a specific IndexedDB object store
 */
async function putAllRecords<T extends { id: string | number }>(
  storeName: string,
  records: T[]
): Promise<void> {
  try {
    const db = await getIndexedDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    for (const record of records) {
      store.put(record);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Fallback to LocalStorage
    try {
      localStorage.setItem(`offline_cache_${storeName}`, JSON.stringify(records));
    } catch {}
  }
}

/**
 * Reads all records from an IndexedDB object store
 */
async function getAllRecords<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (Array.isArray(request.result) && request.result.length > 0) {
          resolve(request.result as T[]);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    // Fallback to LocalStorage
    try {
      const raw = localStorage.getItem(`offline_cache_${storeName}`);
      if (raw) return JSON.parse(raw) as T[];
    } catch {}
    return [];
  }
}

/**
 * Synchronizes and caches all core published application data into IndexedDB
 */
export async function syncAllContentToOfflineStorage(customClasses?: RestorationClass[]): Promise<{
  protocolsCount: number;
  surgicalCount: number;
  practiceCount: number;
  patientGuideCount: number;
  studiesCount: number;
  sectionsCount: number;
  skillsCount: number;
  timestamp: string;
}> {
  const activeClasses = customClasses && customClasses.length > 0 ? customClasses : PRESET_CLASSES;
  const sections = getAppSections();
  const surgicalCases = getSurgicalCases();
  const homePractice = getHomePractices();
  const patientGuide = PATIENT_COMMUNICATION_GUIDE;
  const studies = getScientificStudies();
  const skills = getClinicalSkills();

  await Promise.allSettled([
    putAllRecords('clinical_protocols', activeClasses),
    putAllRecords('surgical_cases', surgicalCases),
    putAllRecords('home_practice', homePractice),
    putAllRecords('clinical_skills', skills),
    putAllRecords('patient_guide', patientGuide),
    putAllRecords('scientific_studies', studies),
    putAllRecords('app_sections', sections),
  ]);

  const timestamp = new Date().toISOString();
  try {
    const db = await getIndexedDB();
    const tx = db.transaction('sync_meta', 'readwrite');
    tx.objectStore('sync_meta').put({
      id: 'last_sync',
      timestamp,
      dateFormatted: new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch {}

  return {
    protocolsCount: activeClasses.length,
    surgicalCount: surgicalCases.length,
    practiceCount: homePractice.length,
    patientGuideCount: patientGuide.length,
    studiesCount: studies.length,
    sectionsCount: sections.length,
    skillsCount: skills.length,
    timestamp,
  };
}

/**
 * Retrieves cached clinical protocols with instantaneous fallback to presets
 */
export async function getOfflineClinicalProtocols(): Promise<RestorationClass[]> {
  const cached = await getAllRecords<RestorationClass>('clinical_protocols');
  if (cached.length > 0) return cached;
  return PRESET_CLASSES;
}

/**
 * Retrieves cached surgical cases
 */
export async function getOfflineSurgicalCases(): Promise<SurgicalCase[]> {
  const cached = await getAllRecords<SurgicalCase>('surgical_cases');
  if (cached.length > 0) return cached;
  return getSurgicalCases();
}

/**
 * Retrieves cached home practice guides
 */
export async function getOfflineHomePractice(): Promise<HomePracticeExercise[]> {
  const cached = await getAllRecords<HomePracticeExercise>('home_practice');
  if (cached.length > 0) return cached;
  return getHomePractices();
}

/**
 * Retrieves cached patient psychology slides
 */
export async function getOfflinePatientGuide(): Promise<GuideSlide[]> {
  const cached = await getAllRecords<GuideSlide>('patient_guide');
  if (cached.length > 0) return cached;
  return PATIENT_COMMUNICATION_GUIDE;
}

/**
 * Retrieves cached studies
 */
export async function getOfflineStudies(): Promise<ScientificStudy[]> {
  const cached = await getAllRecords<ScientificStudy>('scientific_studies');
  if (cached.length > 0) return cached;
  return getScientificStudies();
}

/**
 * Retrieves cached sections
 */
export async function getOfflineAppSections(): Promise<AppSection[]> {
  const cached = await getAllRecords<AppSection>('app_sections');
  if (cached.length > 0) return cached;
  return getAppSections();
}

/**
 * Retrieves cached clinical skills
 */
export async function getOfflineClinicalSkills(): Promise<SkillItem[]> {
  const cached = await getAllRecords<SkillItem>('clinical_skills');
  if (cached.length > 0) return cached;
  return getClinicalSkills();
}
