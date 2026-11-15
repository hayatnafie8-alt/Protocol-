import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const SUBSCRIPTION_SYSTEM_STORAGE_KEY = 'dental_subscription_system_enabled';
export const SUBSCRIPTION_SYSTEM_EVENT = 'dental_subscription_system_toggled';
export const SUBSCRIPTION_CONFIG_DOC_ID = 'subscription_system_config';
export const APP_CONFIG_COLLECTION = 'app_config';

export interface SubscriptionSystemConfig {
  isEnabled: boolean; // true = subscriptions & payment UI active; false = fully free public mode, payment UI hidden
  updatedAt: string;
  updatedBy: string;
}

/**
 * Returns whether the subscription and payment system is currently enabled.
 * If false, all payment buttons and subscription gates are hidden and the app operates in Fully Free Public Mode.
 */
export function getIsSubscriptionSystemEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_SYSTEM_STORAGE_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch (e) {
    console.error('Error reading subscription system toggle:', e);
  }
  return true; // Default: subscriptions enabled
}

/**
 * Persists the subscription system state to local cache, Firestore, and broadcasts across all tabs.
 */
export async function setSubscriptionSystemEnabled(
  enabled: boolean,
  updatedBy = 'supervisor'
): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUBSCRIPTION_SYSTEM_STORAGE_KEY, enabled ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent(SUBSCRIPTION_SYSTEM_EVENT, { detail: enabled }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error saving local subscription system toggle:', e);
    }
  }

  // Sync to Cloud Firestore in real time
  try {
    const configRef = doc(db, APP_CONFIG_COLLECTION, SUBSCRIPTION_CONFIG_DOC_ID);
    await setDoc(
      configRef,
      {
        isEnabled: enabled,
        updatedAt: new Date().toISOString(),
        updatedBy,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync subscription system toggle to Firestore:', err);
  }
}

/**
 * Subscribes to real-time subscription system toggle updates across local tabs and Firestore.
 */
export function subscribeToSubscriptionSystemToggle(
  callback: (enabled: boolean) => void
): () => void {
  // 1. Local event listeners
  const handleLocal = (e: any) => {
    const val = typeof e?.detail === 'boolean' ? e.detail : getIsSubscriptionSystemEnabled();
    callback(val);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(SUBSCRIPTION_SYSTEM_EVENT, handleLocal);
    window.addEventListener('storage', handleLocal);
  }

  // 2. Real-time Firestore snapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const configRef = doc(db, APP_CONFIG_COLLECTION, SUBSCRIPTION_CONFIG_DOC_ID);
    unsubscribeFirestore = onSnapshot(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data?.isEnabled === 'boolean') {
            try {
              localStorage.setItem(
                SUBSCRIPTION_SYSTEM_STORAGE_KEY,
                data.isEnabled ? 'true' : 'false'
              );
            } catch {}
            callback(data.isEnabled);
          }
        }
      },
      (err) => {
        console.warn('Subscription system snapshot error (fallback to local):', err);
      }
    );
  } catch (err) {
    console.warn('Failed to bind Firestore snapshot for subscription toggle:', err);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(SUBSCRIPTION_SYSTEM_EVENT, handleLocal);
      window.removeEventListener('storage', handleLocal);
    }
    unsubscribeFirestore();
  };
}
