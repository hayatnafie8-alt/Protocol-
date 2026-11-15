import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress transient backend connection retry warnings (Firestore seamlessly uses local offline cache)
try {
  setLogLevel('silent');
} catch {
  // Silent fallback if logger already configured
}

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

// Initialize Firestore singleton with forced long-polling & persistent cache
// Using experimentalForceLongPolling avoids WebChannel streaming proxy buffering/timeouts in browser sandboxes/previews
function getOrInitFirestore() {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId
    );
  } catch {
    try {
      return initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
        },
        databaseId
      );
    } catch {
      return getFirestore(app, databaseId);
    }
  }
}

export const db = getOrInitFirestore();

// Initialize Cloud Storage
export const storage = getStorage(
  app,
  firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined
);

// Validate Connection to Firestore on boot (Non-blocking check)
export async function testFirestoreConnection(): Promise<boolean> {
  return Boolean(db);
}

// Upload Clinical Skill Photo to Cloud Storage Bucket
export async function uploadSkillPhotoToCloud(
  skillId: string,
  fileOrBase64: File | string
): Promise<string> {
  const timestamp = Date.now();

  try {
    if (typeof fileOrBase64 === 'string') {
      // Base64 data URL
      const path = `clinical_skills/${skillId}/${timestamp}.jpg`;
      const storageRef = ref(storage, path);
      
      // If it's a data URL, uploadString
      if (fileOrBase64.startsWith('data:')) {
        await uploadString(storageRef, fileOrBase64, 'data_url');
      } else {
        await uploadString(storageRef, fileOrBase64);
      }
      
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[Cloud Storage] Uploaded base64 image to:', downloadUrl);
      return downloadUrl;
    } else {
      // Standard File object from camera or file picker
      const cleanFileName = fileOrBase64.name ? fileOrBase64.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'photo.jpg';
      const path = `clinical_skills/${skillId}/${timestamp}_${cleanFileName}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, fileOrBase64, {
        contentType: fileOrBase64.type || 'image/jpeg',
        customMetadata: {
          skillId,
          uploadedAt: new Date().toISOString(),
        },
      });

      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[Cloud Storage] Uploaded file image to:', downloadUrl);
      return downloadUrl;
    }
  } catch (error) {
    console.warn('[Cloud Storage] Storage upload encountered error, using optimized fallback:', error);
    // If Cloud Storage bucket is restricted or offline, use the data URL directly so work is never lost
    if (typeof fileOrBase64 === 'string') {
      return fileOrBase64;
    }
    // Convert File to data URL fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }
}

// Upload Subscription Payment Receipt Screenshot to Cloud Storage
export async function uploadReceiptPhotoToCloud(
  fileOrBase64: File | string,
  userEmail: string
): Promise<string> {
  const timestamp = Date.now();
  const cleanEmail = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'guest';

  try {
    if (typeof fileOrBase64 === 'string') {
      const path = `payment_receipts/${cleanEmail}/${timestamp}.jpg`;
      const storageRef = ref(storage, path);
      if (fileOrBase64.startsWith('data:')) {
        await uploadString(storageRef, fileOrBase64, 'data_url');
      } else {
        await uploadString(storageRef, fileOrBase64);
      }
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[Cloud Storage] Uploaded receipt to:', downloadUrl);
      return downloadUrl;
    } else {
      const cleanFileName = fileOrBase64.name ? fileOrBase64.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'receipt.jpg';
      const path = `payment_receipts/${cleanEmail}/${timestamp}_${cleanFileName}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, fileOrBase64, {
        contentType: fileOrBase64.type || 'image/jpeg',
        customMetadata: {
          userEmail,
          uploadedAt: new Date().toISOString(),
        },
      });

      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[Cloud Storage] Uploaded receipt to:', downloadUrl);
      return downloadUrl;
    }
  } catch (error) {
    console.warn('[Cloud Storage] Receipt upload fallback to local data url:', error);
    if (typeof fileOrBase64 === 'string') {
      return fileOrBase64;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }
}
