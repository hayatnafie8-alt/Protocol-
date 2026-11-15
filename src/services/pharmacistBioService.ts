import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface PharmacistBioConfig {
  isEnabled: boolean; // toggle visibility (show/hide) for subscribers/users
  nameAr: string; // e.g. "د. سارة الراوي"
  titleAr: string; // e.g. "PharmD, BCPS - صيدلاني إكلينيكي معتمد"
  bioAr: string; // Full biography, clinical credentials, hospital/faculty affiliations
  credentials: string[]; // List of degrees/certifications
  licenseNumber?: string;
  verificationBadgeText?: string; // e.g. "معتمد ومراجع سريرياً من الصيدلاني الإكلينيكي"
  contactOrInquiryEmail?: string;
  avatarUrl?: string;
  lastUpdated: string;
  updatedBy?: string;
}

export const DEFAULT_PHARMACIST_BIO: PharmacistBioConfig = {
  isEnabled: true,
  nameAr: 'د. صيدلاني إكلينيكي معتمد',
  titleAr: 'PharmD, BCPS - استشاري الصيدلة السريرية والعلاجيات',
  bioAr: 'صيدلاني إكلينيكي معتمد متخصص في مراجعة بروتوكولات الأدوية السنية، تقييم التداخلات الدوائية مع المخدر الموضعي ومسكنات الألم، وضبط جرعات مرضى الحالات الخاصة (السكري، القلب، سيولة الدم، الفشل الكلوي، والحمل).',
  credentials: [
    'دكتور صيدلة (Doctor of Pharmacy - PharmD)',
    'البورد الأمريكي للصيدلة الإكلينيكية (BCPS)',
    'دبلوم العلاجيات الدوائية السريرية وتداخلات الأدوية السنية',
  ],
  licenseNumber: 'CL-PHARM-2026',
  verificationBadgeText: 'معتمد ومراجع سريرياً من الصيدلاني الإكلينيكي ✅',
  contactOrInquiryEmail: 'hayatnafee9@gmail.com',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Admin',
};

const LOCAL_STORAGE_KEY = 'dental_pharmacist_bio_config_v1';
const FIRESTORE_DOC_PATH = ['app_config', 'clinical_pharmacist_bio'] as const;

export function getCachedPharmacistBio(): PharmacistBioConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PHARMACIST_BIO,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Error reading local pharmacist bio cache:', err);
  }
  return DEFAULT_PHARMACIST_BIO;
}

export function saveCachedPharmacistBio(config: PharmacistBioConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('dental_pharmacist_bio_updated', { detail: config }));
  } catch (err) {
    console.warn('Error saving local pharmacist bio cache:', err);
  }
}

/**
 * Subscribe to real-time changes in Firestore with local cache fallback
 */
export function subscribeToPharmacistBioCloud(
  callback: (config: PharmacistBioConfig) => void
): () => void {
  // Fire initial cache immediately for fast render
  const initial = getCachedPharmacistBio();
  callback(initial);

  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<PharmacistBioConfig>;
          const merged: PharmacistBioConfig = {
            ...DEFAULT_PHARMACIST_BIO,
            ...data,
          };
          saveCachedPharmacistBio(merged);
          callback(merged);
        } else {
          // Document does not exist yet in cloud, create with default
          setDoc(docRef, DEFAULT_PHARMACIST_BIO, { merge: true }).catch(() => {});
          callback(DEFAULT_PHARMACIST_BIO);
        }
      },
      (error) => {
        console.warn('[PharmacistBioService] Realtime sync error, using cached bio:', error);
        callback(getCachedPharmacistBio());
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('[PharmacistBioService] Failed to establish listener, falling back to cache:', error);
    return () => {};
  }
}

/**
 * Save updated Pharmacist Bio to Cloud & Cache
 */
export async function savePharmacistBioToCloud(
  config: Partial<PharmacistBioConfig>,
  adminName = 'المشرف العام'
): Promise<PharmacistBioConfig> {
  const current = getCachedPharmacistBio();
  const updated: PharmacistBioConfig = {
    ...current,
    ...config,
    lastUpdated: new Date().toISOString(),
    updatedBy: adminName,
  };

  saveCachedPharmacistBio(updated);

  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    await setDoc(docRef, updated, { merge: true });
  } catch (error) {
    console.warn('[PharmacistBioService] Failed to write to cloud, cached locally:', error);
  }

  return updated;
}

/**
 * Toggle Pharmacist Review Visibility (Show/Hide) for subscribers
 */
export async function togglePharmacistBioVisibilityInCloud(
  isEnabled: boolean,
  adminName = 'المشرف العام'
): Promise<void> {
  await savePharmacistBioToCloud({ isEnabled }, adminName);
}
