import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db, uploadSkillPhotoToCloud, testFirestoreConnection } from '../firebase';
import { SkillItem, INITIAL_CLINICAL_SKILLS, getDefaultPhotosForSkill } from '../data/clinicalSkillsData';

const SKILLS_COLLECTION = 'skills';

// Seed initial skill data into Firestore if collection is empty
export async function seedInitialSkillsIfEmpty(): Promise<boolean> {
  try {
    const colRef = collection(db, SKILLS_COLLECTION);
    const existing = await getDocs(colRef);

    if (existing.empty) {
      console.log('[Cloud DB] Seeding initial skills data into Firestore...');
      const batch = writeBatch(db);

      for (const skill of INITIAL_CLINICAL_SKILLS) {
        const docRef = doc(db, SKILLS_COLLECTION, skill.id);
        const photos =
          skill.clinicalPhotos && skill.clinicalPhotos.length > 0
            ? skill.clinicalPhotos
            : getDefaultPhotosForSkill(skill.diagramType, skill.id);

        const payload: Record<string, any> = {
          ...skill,
          isHidden: skill.isVisible === false,
          isVisible: skill.isVisible !== false,
          primaryPhotoUrl: skill.primaryPhotoUrl || photos[0]?.url || '',
          clinicalPhotos: photos,
          updatedAt: new Date().toISOString(),
        };

        batch.set(docRef, payload);
      }

      await batch.commit();
      console.log('[Cloud DB] Initial skills seeded successfully.');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[Cloud DB] Seeding error (may already exist or offline):', error);
    return false;
  }
}

/**
 * Real-Time Pub/Sub Listener for Clinical Skills Collection
 * Subscribes the front-end to live changes from Firestore.
 * When the Admin toggles visibility (isHidden), changes an image URL,
 * or edits content, changes propagate instantly across all connected clients.
 */
export function subscribeToClinicalSkills(
  onUpdate: (skills: SkillItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Test connection on boot
  testFirestoreConnection().catch(() => {});

  const colRef = collection(db, SKILLS_COLLECTION);
  const q = query(colRef);

  let isFirstLoad = true;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      // If collection is completely empty on initial load, trigger cloud seed
      if (snapshot.empty && isFirstLoad) {
        isFirstLoad = false;
        await seedInitialSkillsIfEmpty();
        return;
      }
      isFirstLoad = false;

      const loadedSkills: SkillItem[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const isHidden = data.isHidden === true;
        const isVisible = data.isVisible !== undefined ? data.isVisible : !isHidden;

        // Ensure photos array exists
        const photos =
          data.clinicalPhotos && data.clinicalPhotos.length > 0
            ? data.clinicalPhotos
            : getDefaultPhotosForSkill(data.diagramType || 'ianb', docSnap.id);

        loadedSkills.push({
          id: docSnap.id,
          category: data.category || 'anesthesia',
          categoryLabel: data.categoryLabel || '',
          title: data.title || '',
          titleEn: data.titleEn || '',
          shortDesc: data.shortDesc || '',
          indication: data.indication || '',
          difficulty: data.difficulty || 'متوسط',
          estimatedTime: data.estimatedTime || '3 - 5 دقائق',
          isHidden,
          isVisible,
          isSystem: data.isSystem !== false,
          dateAdded: data.dateAdded || new Date().toISOString().split('T')[0],
          needleGaugeLength: data.needleGaugeLength,
          targetNerve: data.targetNerve,
          anatomicalLandmarks: data.anatomicalLandmarks,
          insertionAngle: data.insertionAngle,
          penetrationDepth: data.penetrationDepth,
          aspirationProtocol: data.aspirationProtocol,
          dosageVolume: data.dosageVolume,
          onsetDuration: data.onsetDuration,
          anesthetizedAreas: data.anesthetizedAreas,
          damTechniqueType: data.damTechniqueType,
          recommendedClamps: data.recommendedClamps,
          isolationPhases: data.isolationPhases,
          sutureType: data.sutureType,
          recommendedMaterial: data.recommendedMaterial,
          biteDistance: data.biteDistance,
          knotTechnique: data.knotTechnique,
          diagramType: data.diagramType || 'ianb',
          diagramCaption: data.diagramCaption || '',
          primaryPhotoUrl: data.primaryPhotoUrl || photos[0]?.url || '',
          clinicalPhotos: photos,
          clinicalKeyPoints: data.clinicalKeyPoints || ['الالتزام بالبروتوكول السريري والتعقيم الكامل.'],
          steps: data.steps || [],
        });
      });

      // Preserve consistent ordering: Anesthesia first, then Dam, then Suture
      loadedSkills.sort((a, b) => {
        const order = { anesthesia: 1, rubber_dam: 2, suturing: 3 };
        const orderA = order[a.category] || 99;
        const orderB = order[b.category] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.id.localeCompare(b.id);
      });

      console.log(`[Cloud DB] Synced ${loadedSkills.length} skills in real-time.`);
      onUpdate(loadedSkills);
    },
    (error) => {
      console.error('[Cloud DB] Error listening to skills collection:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Admin Action: Toggle Visibility (إخفاء / إظهار) directly in Cloud Database
 * Updates isHidden & isVisible on the specific skill document.
 */
export async function toggleSkillVisibilityInCloud(
  skillId: string,
  currentIsHidden: boolean
): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, skillId);
  const newHidden = !currentIsHidden;

  await updateDoc(docRef, {
    isHidden: newHidden,
    isVisible: !newHidden,
    updatedAt: new Date().toISOString(),
  });

  console.log(`[Cloud DB] Toggled skill ${skillId} visibility. isHidden: ${newHidden}`);
}

/**
 * Dynamic Image Replacement with Cloud Storage Upload:
 * 1. Uploads the file or high-res base64 image to Firebase Cloud Storage.
 * 2. Gets the secure public download URL.
 * 3. Updates the skill document in Firestore with the new image URL.
 */
export async function replaceSkillPhotoInCloud(
  skillId: string,
  photoIndex: number,
  fileOrBase64: File | string,
  currentPhotos?: any[]
): Promise<string> {
  // Step 1: Upload to Cloud Storage Bucket
  const cloudImageUrl = await uploadSkillPhotoToCloud(skillId, fileOrBase64);

  // Step 2: Prepare updated photos array
  let updatedPhotos = currentPhotos ? [...currentPhotos] : [];

  if (updatedPhotos[photoIndex]) {
    updatedPhotos[photoIndex] = {
      ...updatedPhotos[photoIndex],
      url: cloudImageUrl,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedPhotos.push({
      id: `photo-cloud-${Date.now()}`,
      url: cloudImageUrl,
      title: 'صورة سريرية حقيقية 4K مرفوعة بواسطة المشرف',
      caption: 'تم استبدال وحفظ الصورة في التخزين السحابي وقاعدة البيانات بنجاح.',
      cameraAngle: 'رؤية سريرية مباشرة 1:1 داخل الفم',
      magnification: 'ماكرو سريري فائق الوضوح 4K',
    });
  }

  // Step 3: Update Cloud Database Record
  const docRef = doc(db, SKILLS_COLLECTION, skillId);
  const updates: Record<string, any> = {
    clinicalPhotos: updatedPhotos,
    updatedAt: new Date().toISOString(),
  };

  if (photoIndex === 0) {
    updates.primaryPhotoUrl = cloudImageUrl;
  }

  await updateDoc(docRef, updates);
  console.log(`[Cloud DB] Updated skill ${skillId} photo at index ${photoIndex} with Cloud URL: ${cloudImageUrl}`);

  return cloudImageUrl;
}

/**
 * Add New Clinical Skill to Cloud Database
 */
export async function addSkillToCloud(
  skill: Omit<SkillItem, 'id' | 'dateAdded'>
): Promise<string> {
  const newId = `skill-${Date.now()}`;
  const docRef = doc(db, SKILLS_COLLECTION, newId);

  const payload: Record<string, any> = {
    ...skill,
    id: newId,
    isHidden: skill.isHidden ?? false,
    isVisible: skill.isVisible ?? true,
    isSystem: false,
    dateAdded: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  console.log(`[Cloud DB] Added new skill ${newId} to Firestore.`);
  return newId;
}

/**
 * Update Existing Clinical Skill in Cloud Database
 */
export async function updateSkillInCloud(
  skillId: string,
  updates: Partial<SkillItem>
): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, skillId);
  const payload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(docRef, payload);
  console.log(`[Cloud DB] Updated skill ${skillId} in Firestore.`);
}

/**
 * Delete Skill from Cloud Database
 */
export async function deleteSkillFromCloud(skillId: string): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, skillId);
  await deleteDoc(docRef);
  console.log(`[Cloud DB] Deleted skill ${skillId} from Firestore.`);
}

/**
 * Reset all skills in Cloud Database to preset catalog
 */
export async function resetSkillsInCloudToDefault(): Promise<void> {
  const colRef = collection(db, SKILLS_COLLECTION);
  const existing = await getDocs(colRef);

  const batch = writeBatch(db);

  // Delete all existing docs
  existing.forEach((d) => {
    batch.delete(d.ref);
  });

  // Re-seed from preset
  for (const skill of INITIAL_CLINICAL_SKILLS) {
    const docRef = doc(db, SKILLS_COLLECTION, skill.id);
    const photos =
      skill.clinicalPhotos && skill.clinicalPhotos.length > 0
        ? skill.clinicalPhotos
        : getDefaultPhotosForSkill(skill.diagramType, skill.id);

    batch.set(docRef, {
      ...skill,
      isHidden: false,
      isVisible: true,
      primaryPhotoUrl: skill.primaryPhotoUrl || photos[0]?.url || '',
      clinicalPhotos: photos,
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  console.log('[Cloud DB] Reset skills collection to defaults.');
}
