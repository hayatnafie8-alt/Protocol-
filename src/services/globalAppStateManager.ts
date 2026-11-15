/**
 * Global Real-Time State Management & Automated Cache-Busting Service
 * Ensures all Admin visibility toggles, pricing tiers, modals, and promo banners
 * persist across Firestore and sync instantly to ALL subscriber sessions with zero stale cache.
 */

import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';
import {
  AppSection,
  DEFAULT_APP_SECTIONS,
  SUPERVISOR_DEFAULT_HIDDEN_KEYS,
  saveAppSectionsToCloud,
} from '../data/sectionsManager';

export const DEFAULT_MASTERCARD_NUMBER = '5377 9210 4481 6029';
export const DEFAULT_MASTERCARD_HOLDER = 'د. حياه نافع فجر';

export interface GlobalAppFeatures {
  showPromoBanner: boolean;
  promoBannerText: string;
  showPayWhatYouWant: boolean;
  usdExchangeRate: number; // 1 USD = X IQD (e.g. 1500)
  pricingTier1: number; // Option 1: 15$
  pricingTier1Iqd?: number; // Option 1 IQD: 22,500 د.ع
  pricingTier2: number; // Option 2: 10$
  pricingTier2Iqd?: number; // Option 2 IQD: 15,000 د.ع
  friendsDiscountPrice: number; // Friends Subscription: 7$
  friendsDiscountPriceIqd?: number; // Friends IQD: 10,500 د.ع
  showPatientGuideModal: boolean;
  showStudiesModal: boolean;
  showClinicalAnnouncementsFeed: boolean;
  showPWAInstallPrompt: boolean;
  showNotificationCenter: boolean;
  showLanguageSwitcherForSubscribers: boolean; // Supervisor toggle for showing/hiding Arabic/English switcher from subscribers
}

export interface GlobalAppState {
  version: number;
  cacheBuster: number;
  lastUpdated: string;
  updatedBy: string;
  hiddenSectionKeys: string[];
  features: GlobalAppFeatures;
  paymentConfig: {
    mastercardNumber: string;
    mastercardHolder: string;
  };
}

const STORAGE_KEY = 'dental_global_state_v2';
const CONFIG_COLLECTION = 'app_config';
const GLOBAL_STATE_DOC = 'global_app_state';

export const DEFAULT_GLOBAL_FEATURES: GlobalAppFeatures = {
  showPromoBanner: true,
  promoBannerText: 'عرض خاص 🎁: اختار السعر ليناسبك بنفس المميزات مع تفعيل فوري وشامل لكافة المحاضرات والمهارات السريرية.',
  showPayWhatYouWant: true,
  usdExchangeRate: 1500,
  pricingTier1: 15,
  pricingTier1Iqd: 22500,
  pricingTier2: 10,
  pricingTier2Iqd: 15000,
  friendsDiscountPrice: 7,
  friendsDiscountPriceIqd: 10500,
  showPatientGuideModal: true,
  showStudiesModal: true,
  showClinicalAnnouncementsFeed: true,
  showPWAInstallPrompt: true,
  showNotificationCenter: true,
  showLanguageSwitcherForSubscribers: true,
};

export const DEFAULT_GLOBAL_STATE: GlobalAppState = {
  version: 1,
  cacheBuster: Date.now(),
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system',
  hiddenSectionKeys: SUPERVISOR_DEFAULT_HIDDEN_KEYS,
  features: DEFAULT_GLOBAL_FEATURES,
  paymentConfig: {
    mastercardNumber: DEFAULT_MASTERCARD_NUMBER,
    mastercardHolder: DEFAULT_MASTERCARD_HOLDER,
  },
};

/**
 * Returns current state from local cache or default
 */
export function getGlobalAppState(): GlobalAppState {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const isAuthorAdmin = localStorage.getItem('dental_author_admin') === 'true';
          let hiddenKeys: string[] = Array.isArray(parsed.hiddenSectionKeys)
            ? parsed.hiddenSectionKeys
            : SUPERVISOR_DEFAULT_HIDDEN_KEYS;

          // If not verified admin, ensure supervisor default hidden keys are not leaked from stale cache
          if (!isAuthorAdmin && (!parsed.publishedSectionKeys || parsed.publishedSectionKeys.length === 0)) {
            const keySet = new Set(hiddenKeys);
            SUPERVISOR_DEFAULT_HIDDEN_KEYS.forEach((k) => keySet.add(k));
            hiddenKeys = Array.from(keySet);
          }

          return {
            ...DEFAULT_GLOBAL_STATE,
            ...parsed,
            features: {
              ...DEFAULT_GLOBAL_FEATURES,
              ...(parsed.features || {}),
            },
            paymentConfig: {
              ...DEFAULT_GLOBAL_STATE.paymentConfig,
              ...(parsed.paymentConfig || {}),
            },
            hiddenSectionKeys: hiddenKeys,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[GlobalState] Error reading from localStorage', err);
  }
  return DEFAULT_GLOBAL_STATE;
}

export const getGlobalAppStateFromLocal = getGlobalAppState;

/**
 * Persist state to local cache
 */
export function saveGlobalAppStateLocally(state: GlobalAppState): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Also sync Mastercard cache for components referencing legacy keys
      if (state.paymentConfig?.mastercardNumber) {
        localStorage.setItem('dental_admin_mastercard_number', state.paymentConfig.mastercardNumber);
      }
      if (state.paymentConfig?.mastercardHolder) {
        localStorage.setItem('dental_admin_mastercard_holder', state.paymentConfig.mastercardHolder);
      }
    }
  } catch (err) {
    console.warn('[GlobalState] Error saving to localStorage', err);
  }
}

/**
 * Subscribes all client sessions (subscribers & visitors) to live Admin state updates.
 * When the Admin modifies any visibility, price, banner, or post,
 * all clients automatically update their local state and trigger UI re-renders without stale screens.
 */
export function subscribeToGlobalAppStateCloud(
  onUpdate: (state: GlobalAppState) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, GLOBAL_STATE_DOC);

  let isFirst = true;

  const unsubscribe = onSnapshot(
    docRef,
    async (docSnap) => {
      if (!docSnap.exists() && isFirst) {
        isFirst = false;
        // Seed default global state to Firestore
        console.log('[GlobalState] Seeding initial global state to Firestore...');
        await saveGlobalAppStateToCloud(DEFAULT_GLOBAL_STATE);
        onUpdate(DEFAULT_GLOBAL_STATE);
        return;
      }
      isFirst = false;

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<GlobalAppState>;
        const merged: GlobalAppState = {
          version: typeof data.version === 'number' ? data.version : 1,
          cacheBuster: typeof data.cacheBuster === 'number' ? data.cacheBuster : Date.now(),
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          updatedBy: data.updatedBy || 'admin',
          hiddenSectionKeys: Array.isArray(data.hiddenSectionKeys)
            ? data.hiddenSectionKeys
            : SUPERVISOR_DEFAULT_HIDDEN_KEYS,
          features: {
            ...DEFAULT_GLOBAL_FEATURES,
            ...(data.features || {}),
          },
          paymentConfig: {
            mastercardNumber: data.paymentConfig?.mastercardNumber || DEFAULT_MASTERCARD_NUMBER,
            mastercardHolder: data.paymentConfig?.mastercardHolder || DEFAULT_MASTERCARD_HOLDER,
          },
        };

        // Cache locally for immediate boot on next load
        saveGlobalAppStateLocally(merged);

        // Notify subscribers and dispatch window event for non-react listeners
        onUpdate(merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-global-state-sync', { detail: merged }));
          window.dispatchEvent(new CustomEvent('app-cache-bust', { detail: { cacheBuster: merged.cacheBuster } }));
        }
        return;
      }

      onUpdate(getGlobalAppState());
    },
    (err) => {
      console.warn('[GlobalState] Firestore onSnapshot error:', err);
      onUpdate(getGlobalAppState());
    }
  );

  return unsubscribe;
}

/**
 * Saves global app state directly to Firestore cloud and bumps version & cacheBuster.
 */
export async function saveGlobalAppStateToCloud(state: GlobalAppState): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, GLOBAL_STATE_DOC);

    const nowBuster = Date.now();
    const payload: GlobalAppState = {
      ...state,
      version: (state.version || 1) + 1,
      cacheBuster: nowBuster,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
    };

    await setDoc(docRef, payload, { merge: true });
    saveGlobalAppStateLocally(payload);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-global-state-sync', { detail: payload }));
      window.dispatchEvent(new CustomEvent('app-cache-bust', { detail: { cacheBuster: nowBuster } }));
    }

    console.log('[GlobalState] Successfully synced global state to cloud with cacheBuster:', payload.cacheBuster);
  } catch (error) {
    console.error('[GlobalState] Failed to save global state to cloud:', error);
  }
}

/**
 * Backward compatibility alias
 */
export const saveGlobalAppStateCloud = saveGlobalAppStateToCloud;

/**
 * Updates partial global state and instantly broadcasts to all clients.
 */
export async function updateGlobalAppStateInCloud(updates: Partial<GlobalAppState>): Promise<void> {
  const current = getGlobalAppState();
  const next: GlobalAppState = {
    ...current,
    ...updates,
    features: {
      ...current.features,
      ...(updates.features || {}),
    },
    paymentConfig: {
      ...current.paymentConfig,
      ...(updates.paymentConfig || {}),
    },
    hiddenSectionKeys: updates.hiddenSectionKeys || current.hiddenSectionKeys,
    version: current.version + 1,
    cacheBuster: Date.now(),
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin',
  };

  await saveGlobalAppStateToCloud(next);
}

/**
 * Triggers an immediate cache-bust across all connected client sessions.
 * Can be called when new posts, cards, or prices are published to guarantee zero delay.
 */
export async function triggerGlobalCacheBust(reason: string = 'admin_action'): Promise<void> {
  try {
    const current = getGlobalAppState();
    await updateGlobalAppStateInCloud({
      cacheBuster: Date.now(),
      lastUpdated: new Date().toISOString(),
      updatedBy: `admin:${reason}`,
    });
    console.log(`[GlobalState] Cache bust triggered (${reason})`);
  } catch (err) {
    console.warn('[GlobalState] Error triggering cache bust:', err);
  }
}
