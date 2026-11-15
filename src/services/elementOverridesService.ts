/**
 * Granular Element Overrides & Content Management Service
 * Allows Admin to modify, replace images, toggle visibility, and delete any protocol element in real-time.
 * Persists locally and synchronizes to Firebase Firestore without requiring code redeployment.
 */

import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ElementOverride {
  id: string; // Element identifier (e.g. 'step-c1-1', 'drug-amox', 'faq-1', 'card-la')
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl?: string;
  isVisible: boolean; // true = visible to everyone, false = draft/hidden from students
  isDeleted: boolean; // true = soft-deleted
  lastUpdatedBy?: string;
  updatedAt?: string;
}

const LOCAL_STORAGE_KEY = 'dental_element_overrides_v1';
const FIRESTORE_COLLECTION = 'app_config';
const FIRESTORE_DOC_ID = 'element_overrides';

/**
 * Get all cached overrides from localStorage
 */
export function getLocalElementOverrides(): Record<string, ElementOverride> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save overrides to local storage
 */
export function saveLocalElementOverrides(overrides: Record<string, ElementOverride>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('element-overrides-updated', { detail: overrides })
      );
    }
  } catch (err) {
    console.warn('Failed to save element overrides locally:', err);
  }
}

/**
 * Save or update a single element override in local cache and Firestore
 */
export async function setElementOverrideInCloud(
  override: Partial<ElementOverride> & { id: string },
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<ElementOverride> {
  const current = getLocalElementOverrides();
  const existing = current[override.id] || {
    id: override.id,
    isVisible: true,
    isDeleted: false,
  };

  const updated: ElementOverride = {
    ...existing,
    ...override,
    lastUpdatedBy: adminEmail,
    updatedAt: new Date().toISOString(),
  };

  current[override.id] = updated;
  saveLocalElementOverrides(current);

  // Sync to Firestore if database is available
  if (db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      await setDoc(docRef, { [override.id]: updated }, { merge: true });
    } catch (err) {
      console.warn('[ElementOverridesService] Firestore sync warning:', err);
    }
  }

  return updated;
}

/**
 * Toggle element visibility (Show / Hide)
 */
export async function toggleElementVisibilityInCloud(
  elementId: string,
  newVisibility: boolean,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  await setElementOverrideInCloud(
    {
      id: elementId,
      isVisible: newVisibility,
    },
    adminEmail
  );
}

/**
 * Mark element as deleted
 */
export async function deleteElementInCloud(
  elementId: string,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  await setElementOverrideInCloud(
    {
      id: elementId,
      isDeleted: true,
      isVisible: false,
    },
    adminEmail
  );
}

/**
 * Replace element image URL
 */
export async function replaceElementImageInCloud(
  elementId: string,
  newImageUrl: string,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  await setElementOverrideInCloud(
    {
      id: elementId,
      imageUrl: newImageUrl,
    },
    adminEmail
  );
}

/**
 * Subscribe in real-time to element overrides from Firestore
 */
export function subscribeToElementOverridesCloud(
  onUpdate: (overrides: Record<string, ElementOverride>) => void
): () => void {
  // Emit local cache immediately
  onUpdate(getLocalElementOverrides());

  if (!db) {
    return () => {};
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as Record<string, ElementOverride>;
          saveLocalElementOverrides(cloudData);
          onUpdate(cloudData);
        }
      },
      (err) => {
        console.warn('[ElementOverridesService] Realtime sync listener warning:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[ElementOverridesService] Listener error:', err);
    return () => {};
  }
}
