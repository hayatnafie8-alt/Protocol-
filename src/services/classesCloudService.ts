/**
 * Classes, Protocols & Item Visibility Real-Time Cloud Service
 * Ensures all protocols, custom restoration classes, and 'isVisible' flags
 * are synchronized in real-time across ALL subscriber sessions via Firestore onSnapshot.
 */

import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import { RestorationClass, PRESET_CLASSES } from '../data/classesData';
import { triggerGlobalCacheBust } from './globalAppStateManager';

const CONFIG_COLLECTION = 'app_config';
const CLASSES_CONFIG_DOC = 'classes_config';
const VISIBILITY_STORAGE_KEY = 'dental_classes_visibility';
const CUSTOM_CLASSES_STORAGE_KEY = 'custom_restoration_classes';

export interface ClassesConfigPayload {
  visibilityMap: Record<string, boolean>;
  customClasses: RestorationClass[];
  updatedAt: string;
  updatedBy: string;
  cacheBuster: number;
}

/**
 * Returns initial local cached classes with visibility overrides applied
 */
export function getLocalCachedClasses(): RestorationClass[] {
  try {
    let visibilityMap: Record<string, boolean> = {};
    if (typeof localStorage !== 'undefined') {
      const vSaved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (vSaved) {
        try {
          visibilityMap = JSON.parse(vSaved);
        } catch {}
      }

      const saved = localStorage.getItem(CUSTOM_CLASSES_STORAGE_KEY);
      let baseList = PRESET_CLASSES;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const customOnly = parsed.filter((c: any) => c.isCustom);
            baseList = [...PRESET_CLASSES, ...customOnly];
          }
        } catch {}
      }

      const seenIds = new Set<string>();
      const uniqueBase: RestorationClass[] = [];
      for (const c of baseList) {
        if (c && c.id && !seenIds.has(c.id)) {
          seenIds.add(c.id);
          uniqueBase.push(c);
        }
      }

      return uniqueBase.map((c) => ({
        ...c,
        isVisible: visibilityMap[c.id] !== undefined ? visibilityMap[c.id] : (c.isVisible ?? true),
      }));
    }
  } catch {}
  return PRESET_CLASSES.map((c) => ({ ...c, isVisible: c.isVisible ?? true }));
}

/**
 * Subscribes to real-time changes in protocols, classes, and item visibility flags (isVisible).
 * Universal listener for ALL user sessions (existing subscribers, newly joined, and guests).
 */
export function subscribeToClassesCloud(
  onUpdate: (classes: RestorationClass[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, CLASSES_CONFIG_DOC);

  let isFirst = true;

  const unsubscribe = onSnapshot(
    docRef,
    async (docSnap) => {
      if (!docSnap.exists() && isFirst) {
        isFirst = false;
        // Seed initial default visibility and classes to Firestore
        const defaultVisibility: Record<string, boolean> = {};
        PRESET_CLASSES.forEach((c) => {
          defaultVisibility[c.id] = c.isVisible !== false;
        });

        await saveClassesConfigToCloud({
          visibilityMap: defaultVisibility,
          customClasses: [],
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          cacheBuster: Date.now(),
        });

        onUpdate(PRESET_CLASSES);
        return;
      }
      isFirst = false;

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ClassesConfigPayload>;
        const visibilityMap = data.visibilityMap || {};
        const customClasses = Array.isArray(data.customClasses) ? data.customClasses : [];

        // Merge preset classes with cloud custom classes with ID deduplication
        const base = [...PRESET_CLASSES, ...customClasses];
        const seenIds = new Set<string>();
        const uniqueBase: RestorationClass[] = [];
        for (const c of base) {
          if (c && c.id && !seenIds.has(c.id)) {
            seenIds.add(c.id);
            uniqueBase.push(c);
          }
        }

        const mergedClasses: RestorationClass[] = uniqueBase.map((c) => ({
          ...c,
          isVisible: visibilityMap[c.id] !== undefined ? visibilityMap[c.id] : (c.isVisible ?? true),
        }));

        // Cache locally for instantaneous next startup
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibilityMap));
            localStorage.setItem(CUSTOM_CLASSES_STORAGE_KEY, JSON.stringify(customClasses));
          }
        } catch {}

        // Dispatch window event for immediate reactivity
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('app-classes-sync', {
              detail: { classes: mergedClasses, cacheBuster: data.cacheBuster || Date.now() },
            })
          );
        }

        onUpdate(mergedClasses);
        return;
      }

      onUpdate(getLocalCachedClasses());
    },
    (err) => {
      console.warn('[ClassesCloudService] Firestore onSnapshot error:', err);
      onUpdate(getLocalCachedClasses());
    }
  );

  return unsubscribe;
}

/**
 * Saves classes configuration and visibility mappings to Firestore cloud.
 * Broadcasts live to ALL connected subscribers immediately.
 */
export async function saveClassesConfigToCloud(
  payload: Partial<ClassesConfigPayload>
): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, CLASSES_CONFIG_DOC);

    const nowBuster = Date.now();
    const fullPayload: ClassesConfigPayload = {
      visibilityMap: payload.visibilityMap || {},
      customClasses: payload.customClasses || [],
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
      cacheBuster: nowBuster,
    };

    await setDoc(docRef, fullPayload, { merge: true });

    // Also update local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(fullPayload.visibilityMap));
      localStorage.setItem(CUSTOM_CLASSES_STORAGE_KEY, JSON.stringify(fullPayload.customClasses));
    }

    // Trigger global cache buster so all subscribers re-evaluate visible items
    await triggerGlobalCacheBust('classes_visibility_sync');
  } catch (error) {
    console.error('[ClassesCloudService] Failed to save classes config to Firestore:', error);
  }
}

/**
 * Toggles a class's isVisible status and broadcasts to Firestore in real time.
 */
export async function toggleClassVisibilityInCloud(
  classId: string,
  currentClasses: RestorationClass[]
): Promise<RestorationClass[]> {
  const updatedClasses = currentClasses.map((c) => {
    if (c.id === classId) {
      return { ...c, isVisible: c.isVisible === false ? true : false };
    }
    return c;
  });

  const visibilityMap: Record<string, boolean> = {};
  updatedClasses.forEach((c) => {
    visibilityMap[c.id] = c.isVisible !== false;
  });
  const customClasses = updatedClasses.filter((c) => c.isCustom);

  // Save to Firestore cloud asynchronously
  await saveClassesConfigToCloud({
    visibilityMap,
    customClasses,
  });

  return updatedClasses;
}

/**
 * Saves a new custom class or edits an existing class and syncs to Firestore cloud.
 */
export async function saveCustomClassToCloud(
  newClass: RestorationClass,
  currentClasses: RestorationClass[]
): Promise<RestorationClass[]> {
  const existingIdx = currentClasses.findIndex((c) => c.id === newClass.id);
  let updatedClasses: RestorationClass[];

  if (existingIdx >= 0) {
    updatedClasses = currentClasses.map((c) => (c.id === newClass.id ? newClass : c));
  } else {
    updatedClasses = [...currentClasses, newClass];
  }

  const visibilityMap: Record<string, boolean> = {};
  updatedClasses.forEach((c) => {
    visibilityMap[c.id] = c.isVisible !== false;
  });
  const customClasses = updatedClasses.filter((c) => c.isCustom);

  await saveClassesConfigToCloud({
    visibilityMap,
    customClasses,
  });

  return updatedClasses;
}

/**
 * Deletes a custom class from cloud Firestore and syncs to all subscribers.
 */
export async function deleteCustomClassFromCloud(
  classId: string,
  currentClasses: RestorationClass[]
): Promise<RestorationClass[]> {
  const updatedClasses = currentClasses.filter((c) => c.id !== classId);

  const visibilityMap: Record<string, boolean> = {};
  updatedClasses.forEach((c) => {
    visibilityMap[c.id] = c.isVisible !== false;
  });
  const customClasses = updatedClasses.filter((c) => c.isCustom);

  await saveClassesConfigToCloud({
    visibilityMap,
    customClasses,
  });

  return updatedClasses;
}
