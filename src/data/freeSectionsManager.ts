import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const PROTOCOL_FREE_SECTIONS_STORAGE_KEY = 'protocol_free_sections';
export const PROTOCOL_FREE_SECTIONS_EVENT = 'protocol_free_sections_updated';

const CONFIG_COLLECTION = 'app_config';
const FREE_SECTIONS_DOC = 'protocol_free_sections_config';

export type FreeSectionsMap = Record<string, boolean>;

/**
 * Retrieves the current dictionary of free sections from localStorage.
 */
export function getFreeSectionsMap(): FreeSectionsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROTOCOL_FREE_SECTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as FreeSectionsMap;
      }
    }
  } catch (err) {
    console.error('Failed to parse protocol_free_sections from localStorage', err);
  }
  return {};
}

/**
 * Saves the updated free sections dictionary to localStorage, Cloud Firestore, and broadcasts the update.
 */
export function saveFreeSectionsMap(map: FreeSectionsMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROTOCOL_FREE_SECTIONS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent(PROTOCOL_FREE_SECTIONS_EVENT, { detail: map })
    );
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save protocol_free_sections to localStorage', err);
  }
  saveFreeSectionsToCloud(map).catch(() => {});
}

/**
 * Persists free sections map to Cloud Firestore.
 */
export async function saveFreeSectionsToCloud(map: FreeSectionsMap): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, FREE_SECTIONS_DOC);
    await setDoc(docRef, {
      freeSections: map,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[FreeSections] Cloud sync notice:', err);
  }
}

/**
 * Subscribes to real-time free sections updates from Cloud Firestore.
 */
export function subscribeToFreeSectionsCloud(
  onUpdate: (map: FreeSectionsMap) => void
): () => void {
  const docRef = doc(db, CONFIG_COLLECTION, FREE_SECTIONS_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.freeSections && typeof data.freeSections === 'object') {
          try {
            localStorage.setItem(PROTOCOL_FREE_SECTIONS_STORAGE_KEY, JSON.stringify(data.freeSections));
          } catch {}
          onUpdate(data.freeSections as FreeSectionsMap);
          return;
        }
      }
      onUpdate(getFreeSectionsMap());
    },
    (err) => {
      console.warn('[FreeSections] onSnapshot error:', err);
      onUpdate(getFreeSectionsMap());
    }
  );
}

/**
 * Checks if a specific section, tab, or class is marked as free for the public.
 */
export function isSectionFree(idOrKey?: string | null): boolean {
  if (!idOrKey) return false;
  const map = getFreeSectionsMap();
  if (map[idOrKey] === true) return true;

  // Handle prefix variations (e.g. 'sec-surgical' vs 'surgical')
  const normalized = idOrKey.replace(/^sec-/, '');
  if (map[normalized] === true) return true;
  if (map[`sec-${normalized}`] === true) return true;

  return false;
}

/**
 * Toggles the free public access state for a given section/class/module.
 * Returns the new state (true if now free, false if locked).
 */
export function toggleSectionFree(idOrKey: string): boolean {
  const currentMap = getFreeSectionsMap();
  const willBeFree = !isSectionFree(idOrKey);
  const normalized = idOrKey.replace(/^sec-/, '');

  const updatedMap: FreeSectionsMap = {
    ...currentMap,
    [idOrKey]: willBeFree,
    [normalized]: willBeFree,
    [`sec-${normalized}`]: willBeFree,
  };

  saveFreeSectionsMap(updatedMap);
  return willBeFree;
}

/**
 * Sets explicit free access state for a section/class/module.
 */
export function setSectionFreeState(idOrKey: string, isFree: boolean): void {
  const currentMap = getFreeSectionsMap();
  const normalized = idOrKey.replace(/^sec-/, '');

  const updatedMap: FreeSectionsMap = {
    ...currentMap,
    [idOrKey]: isFree,
    [normalized]: isFree,
    [`sec-${normalized}`]: isFree,
  };

  saveFreeSectionsMap(updatedMap);
}
