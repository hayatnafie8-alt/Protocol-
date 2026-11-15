import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  PrescriptionDrug,
  PrescriptionGuideConfig,
  DrugCategoryItem,
  DrugStatus,
  DEFAULT_PRESCRIPTION_DRUGS,
  DEFAULT_PRESCRIPTION_CATEGORIES,
  getLocalCachedPrescriptionDrugs,
  saveLocalCachedPrescriptionDrugs,
  getLocalCachedGuideConfig,
  saveLocalCachedGuideConfig,
} from '../data/prescriptionGuideData';

const COLLECTION_NAME = 'prescription_drugs';
const CONFIG_DOC_PATH = { collection: 'app_config', docId: 'prescription_guide' };

/**
 * Real-Time Cloud Listener for Prescription Drugs Catalog
 * Emits live updates whenever any drug is added, updated, or removed by Admin
 */
export function subscribeToPrescriptionDrugsCloud(
  onData: (drugs: PrescriptionDrug[]) => void,
  onError?: (error: Error) => void
): () => void {
  // Emit local cache immediately for instant UI render
  const cached = getLocalCachedPrescriptionDrugs();
  onData(cached);

  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is brand new / unseeded, populate with defaults
          seedDefaultPrescriptionDrugsToCloud().catch(console.warn);
          onData(DEFAULT_PRESCRIPTION_DRUGS);
          saveLocalCachedPrescriptionDrugs(DEFAULT_PRESCRIPTION_DRUGS);
          return;
        }

        const cloudDrugs: PrescriptionDrug[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as PrescriptionDrug;
          cloudDrugs.push({
            ...data,
            id: docSnap.id,
            clinicalConsiderations: data.clinicalConsiderations || (data as any).adminNotes || 'مراعاة التاريخ المرضي والجرعات السريرية.',
            drugInteractions: data.drugInteractions || (data as any).contraindications || 'التحقق من التداخلات مع المخدر الموضعي والمسكنات.',
            allergyAlerts: data.allergyAlerts || 'لا توجد موانع خاصة.',
            pregnancySafety: data.pregnancySafety || 'استشارة الطبيب عند الحاجة.',
            indication: data.indication || '',
            standardDosage: data.standardDosage || '',
          });
        });

        // Ensure default drugs that might be missing are preserved
        const existingIds = new Set(cloudDrugs.map((d) => d.id));
        const missingDefaults = DEFAULT_PRESCRIPTION_DRUGS.filter((d) => !existingIds.has(d.id));
        const combined = [...cloudDrugs, ...missingDefaults];

        saveLocalCachedPrescriptionDrugs(combined);
        onData(combined);
      },
      (error) => {
        console.error('[PrescriptionGuideService] Firestore error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('[PrescriptionGuideService] Failed to establish listener:', err);
    return () => {};
  }
}

/**
 * Real-Time Cloud Listener for Global Guide Visibility & Category Configuration
 */
export function subscribeToPrescriptionGuideConfigCloud(
  onConfig: (config: PrescriptionGuideConfig) => void
): () => void {
  // Emit local cache immediately
  const localConfig = getLocalCachedGuideConfig();
  onConfig(localConfig);

  if (!db) {
    return () => {};
  }

  try {
    const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PrescriptionGuideConfig;
          const mergedConfig: PrescriptionGuideConfig = {
            isGuidePublic: data.isGuidePublic ?? false,
            isGuideHidden: data.isGuideHidden ?? false,
            categoriesConfig: data.categoriesConfig || {},
            customCategories: data.customCategories || [],
            lastUpdatedBy: data.lastUpdatedBy,
            updatedAt: data.updatedAt,
          };
          saveLocalCachedGuideConfig(mergedConfig);
          onConfig(mergedConfig);
        } else {
          // Default: gated to subscribers
          const defaultConfig: PrescriptionGuideConfig = {
            isGuidePublic: false,
            isGuideHidden: false,
            categoriesConfig: {},
            customCategories: [],
            updatedAt: new Date().toISOString(),
          };
          setDoc(docRef, defaultConfig, { merge: true }).catch(console.warn);
          saveLocalCachedGuideConfig(defaultConfig);
          onConfig(defaultConfig);
        }
      },
      (err) => {
        console.warn('[PrescriptionGuideService] Config sync error:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[PrescriptionGuideService] Could not subscribe to guide config:', err);
    return () => {};
  }
}

/**
 * Toggle the Global Visibility and Free Access of the Prescription Guide in Cloud
 */
export async function setPrescriptionGuideGlobalVisibilityInCloud(
  isPublic: boolean,
  isHidden?: boolean,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  const currentConfig = getLocalCachedGuideConfig();
  const newConfig: PrescriptionGuideConfig = {
    ...currentConfig,
    isGuidePublic: isPublic,
    isGuideHidden: isHidden !== undefined ? isHidden : currentConfig.isGuideHidden,
    lastUpdatedBy: adminEmail,
    updatedAt: new Date().toISOString(),
  };

  saveLocalCachedGuideConfig(newConfig);

  if (!db) return;

  const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
  await setDoc(docRef, newConfig, { merge: true });
}

/**
 * Category Management: Add New Drug Category
 */
export async function addCategoryInCloud(
  category: DrugCategoryItem,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<DrugCategoryItem> {
  const currentConfig = getLocalCachedGuideConfig();
  const customCats = currentConfig.customCategories || [];

  const newCat: DrugCategoryItem = {
    ...category,
    isCustom: true,
  };

  const updatedCats = [...customCats, newCat];
  const newConfig: PrescriptionGuideConfig = {
    ...currentConfig,
    customCategories: updatedCats,
    lastUpdatedBy: adminEmail,
    updatedAt: new Date().toISOString(),
  };

  saveLocalCachedGuideConfig(newConfig);

  if (db) {
    const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
    await setDoc(docRef, newConfig, { merge: true });
  }

  return newCat;
}

/**
 * Category Management: Update Existing Category
 */
export async function updateCategoryInCloud(
  catId: string,
  updates: Partial<DrugCategoryItem>,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  const currentConfig = getLocalCachedGuideConfig();
  const customCats = currentConfig.customCategories || [];

  // Update in customCategories if custom
  const updatedCustomCats = customCats.map((c) =>
    c.id === catId ? { ...c, ...updates } : c
  );

  // Update category configuration override
  const catConfig = currentConfig.categoriesConfig || {};
  const currentCatConf = catConfig[catId] || {};
  const newCatConf = {
    ...currentCatConf,
    ...(updates.isHidden !== undefined ? { isHidden: updates.isHidden } : {}),
    ...(updates.isFree !== undefined ? { isFree: updates.isFree } : {}),
  };

  const newConfig: PrescriptionGuideConfig = {
    ...currentConfig,
    customCategories: updatedCustomCats,
    categoriesConfig: {
      ...catConfig,
      [catId]: newCatConf,
    },
    lastUpdatedBy: adminEmail,
    updatedAt: new Date().toISOString(),
  };

  saveLocalCachedGuideConfig(newConfig);

  if (db) {
    const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
    await setDoc(docRef, newConfig, { merge: true });
  }
}

/**
 * Category Management: Delete Category
 */
export async function deleteCategoryInCloud(
  catId: string,
  adminEmail: string = 'hayatnafie8@gmail.com'
): Promise<void> {
  const currentConfig = getLocalCachedGuideConfig();
  const customCats = currentConfig.customCategories || [];
  const updatedCustomCats = customCats.filter((c) => c.id !== catId);

  const catConfig = { ...(currentConfig.categoriesConfig || {}) };
  delete catConfig[catId];

  const newConfig: PrescriptionGuideConfig = {
    ...currentConfig,
    customCategories: updatedCustomCats,
    categoriesConfig: catConfig,
    lastUpdatedBy: adminEmail,
    updatedAt: new Date().toISOString(),
  };

  saveLocalCachedGuideConfig(newConfig);

  if (db) {
    const docRef = doc(db, CONFIG_DOC_PATH.collection, CONFIG_DOC_PATH.docId);
    await setDoc(docRef, newConfig, { merge: true });
  }
}

/**
 * Category Management: Toggle Category Visibility (Hide / Unhide)
 */
export async function toggleCategoryVisibilityInCloud(
  catId: string,
  isHidden: boolean
): Promise<void> {
  return updateCategoryInCloud(catId, { isHidden });
}

/**
 * Category Management: Toggle Category Access Control (Free vs Subscription)
 */
export async function toggleCategoryAccessControlInCloud(
  catId: string,
  isFree: boolean
): Promise<void> {
  return updateCategoryInCloud(catId, { isFree });
}

/**
 * Drug Management: Add a New Medication to Cloud Catalog
 */
export async function addPrescriptionDrugInCloud(
  drugInput: Omit<PrescriptionDrug, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PrescriptionDrug> {
  const newId = `drug_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const newDrug: PrescriptionDrug = {
    ...drugInput,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  // Optimistic local update
  const current = getLocalCachedPrescriptionDrugs();
  const updated = [newDrug, ...current];
  saveLocalCachedPrescriptionDrugs(updated);

  if (db) {
    const docRef = doc(db, COLLECTION_NAME, newId);
    await setDoc(docRef, newDrug);
  }

  return newDrug;
}

/**
 * Drug Management: Edit / Update an Existing Drug in Cloud
 */
export async function updatePrescriptionDrugInCloud(
  id: string,
  updates: Partial<Omit<PrescriptionDrug, 'id' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    updatedAt: now,
  };

  // Optimistic local update
  const current = getLocalCachedPrescriptionDrugs();
  const next = current.map((d) => (d.id === id ? { ...d, ...payload } : d));
  saveLocalCachedPrescriptionDrugs(next);

  if (db) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, payload, { merge: true });
  }
}

/**
 * Drug Management: Toggle Drug Visibility (Hide / Unhide)
 */
export async function toggleDrugVisibilityInCloud(
  id: string,
  isHidden: boolean
): Promise<void> {
  return updatePrescriptionDrugInCloud(id, { isHidden });
}

/**
 * Drug Management: Toggle Drug Access Control (Free vs Subscription)
 */
export async function toggleDrugAccessControlInCloud(
  id: string,
  isFree: boolean
): Promise<void> {
  return updatePrescriptionDrugInCloud(id, { isFree });
}

/**
 * Drug Management: Toggle Drug Status between Draft, Published, etc.
 */
export async function toggleDrugStatusInCloud(
  id: string,
  newStatus: DrugStatus
): Promise<void> {
  return updatePrescriptionDrugInCloud(id, { status: newStatus });
}

/**
 * Clinical Pharmacist Workflow: Send Drug for Clinical Pharmacist Review
 */
export async function sendDrugToClinicalPharmacistReviewInCloud(
  id: string,
  pharmacistName: string = 'د. أحمد الصيدلاني (PharmD)',
  reviewNotes: string = 'بانتظار تدقيق الجرعات والتداخلات الدوائية مع مخدر الليدوكائين والإيبينفرين.'
): Promise<void> {
  const current = getLocalCachedPrescriptionDrugs().find((d) => d.id === id);
  const existingReview = current?.clinicalReview;

  return updatePrescriptionDrugInCloud(id, {
    status: 'under_clinical_review',
    clinicalReview: {
      status: 'under_review',
      pharmacistName: pharmacistName.trim() || existingReview?.pharmacistName || 'صيدلاني إكلينيكي معتمد',
      pharmacistTitle: 'PharmD, Clinical Pharmacist Specialist',
      notes: reviewNotes.trim() || 'قيد المراجعة والتدقيق الدوائي السريري',
      reviewedAt: new Date().toLocaleDateString('ar-IQ'),
    },
  });
}

/**
 * Clinical Pharmacist Workflow: Approve & Verify Drug with Clinical Pharmacist Credentials
 */
export async function verifyDrugByPharmacistInCloud(
  id: string,
  pharmacistName: string,
  pharmacistTitle: string = 'PharmD, BCPS - أخصائي صيدلة إكلينيكية',
  reviewNotes: string = 'تمت مراجعة الجرعات السريرية والتداخلات مع علاجات الأسنان بدقة.'
): Promise<void> {
  return updatePrescriptionDrugInCloud(id, {
    status: 'verified',
    clinicalReview: {
      status: 'verified',
      pharmacistName: pharmacistName.trim() || 'د. صيدلاني إكلينيكي معتمد',
      pharmacistTitle: pharmacistTitle.trim() || 'PharmD, BCPS',
      notes: reviewNotes.trim(),
      reviewedAt: new Date().toLocaleDateString('ar-IQ'),
    },
  });
}

/**
 * Delete a Drug Permanently from Cloud
 */
export async function deletePrescriptionDrugInCloud(id: string): Promise<void> {
  // Optimistic local update
  const current = getLocalCachedPrescriptionDrugs();
  const next = current.filter((d) => d.id !== id);
  saveLocalCachedPrescriptionDrugs(next);

  if (db) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}

/**
 * Seed initial default high-yield medications to Firestore if empty
 */
export async function seedDefaultPrescriptionDrugsToCloud(): Promise<void> {
  if (!db) return;

  try {
    for (const drug of DEFAULT_PRESCRIPTION_DRUGS) {
      const docRef = doc(db, COLLECTION_NAME, drug.id);
      await setDoc(docRef, drug, { merge: true });
    }
  } catch (err) {
    console.warn('[PrescriptionGuideService] Seed error:', err);
  }
}

/**
 * Reset Cloud Drugs to Default Presets (Admin Rescue Utility)
 */
export async function resetPrescriptionDrugsToDefaultInCloud(): Promise<void> {
  saveLocalCachedPrescriptionDrugs(DEFAULT_PRESCRIPTION_DRUGS);

  if (!db) return;

  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
  }

  for (const drug of DEFAULT_PRESCRIPTION_DRUGS) {
    await setDoc(doc(db, COLLECTION_NAME, drug.id), drug);
  }
}
