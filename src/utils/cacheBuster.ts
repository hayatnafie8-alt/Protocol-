/**
 * Protocol Clinical Platform - Automated Cache-Busting & Image Synchronization Engine
 * Handles query parameter cache-busting (?v=timestamp), Service Worker CacheStorage purging,
 * centralized branding persistence, and independent UI asset synchronization.
 *
 * UNLINKED UI ASSETS ARCHITECTURE:
 * 1. Top Header Main Logo: (protocol_header_logo / headerLogo)
 * 2. Middle Card Emblem: (protocol_middle_card_logo / middleCardLogo)
 * 3. Bottom Navbar FAB Icon / Seal: (protocol_bottom_nav_fab_icon / bottomFabIcon)
 * 4. Supervisor Avatar: (dental_doctor_avatar / supervisorAvatar)
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const PROTOCOL_BRANDING_VERSION_KEY = 'protocol_branding_version';

// 1. Independent UI Asset Keys & Reactive Events
export const PROTOCOL_HEADER_LOGO_KEY = 'protocol_header_logo';
export const PROTOCOL_HEADER_LOGO_EVENT = 'protocol_header_logo_updated';

export const PROTOCOL_MIDDLE_CARD_LOGO_KEY = 'protocol_middle_card_logo';
export const PROTOCOL_MIDDLE_CARD_LOGO_EVENT = 'protocol_middle_card_logo_updated';

export const PROTOCOL_BOTTOM_FAB_ICON_KEY = 'protocol_bottom_nav_fab_icon';
export const PROTOCOL_BOTTOM_FAB_ICON_EVENT = 'protocol_bottom_nav_fab_icon_updated';

// 4. Official Report Circular Stamp (Dedicated & strictly unlinked from header or card logos)
export const PROTOCOL_OFFICIAL_STAMP_KEY = 'protocol_official_stamp';
export const PROTOCOL_OFFICIAL_STAMP_EVENT = 'protocol_official_stamp_updated';
export const DEFAULT_OFFICIAL_STAMP_PATH = '/protocol_official_stamp.png';

export const PROTOCOL_SUPERVISOR_AVATAR_KEY = 'dental_doctor_avatar';
export const PROTOCOL_USER_AVATAR_KEY = 'protocol_user_avatar';
export const PROTOCOL_SUPERVISOR_AVATAR_EVENT = 'protocol_supervisor_avatar_updated';
export const DOCTOR_AVATAR_EVENT = 'dental_doctor_avatar_updated';

// Legacy keys retained only for backward-compatibility fallback
export const PROTOCOL_APP_LOGO_KEY = 'protocol_app_logo';
export const PROTOCOL_FAB_ICON_KEY = 'protocol_fab_icon';
export const PROTOCOL_CENTRAL_LOGO_KEY = 'app_img_protocol_central_logo';

export const PROTOCOL_BRANDING_EVENT = 'protocol_branding_updated';

export interface CentralBrandingPayload {
  // Independent UI Assets
  headerLogo?: string;       // 1. شعار الترويسة الرئيسية في الأعلى
  middleCardLogo?: string;   // 2. شعار الكارد في المنتصف
  bottomFabIcon?: string;    // 3. أيقونة الختم أو النافبار السفلية
  officialStamp?: string;    // 4. الختم الرسمي المستقل لتقرير الإنجاز السنوي
  supervisorAvatar?: string; // 5. صورة المشرف السريري

  // Legacy fallback
  appLogo?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * Retrieves the current global branding version timestamp.
 * Defaults to current timestamp if not yet initialized.
 */
export function getGlobalBrandingVersion(): number {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(PROTOCOL_BRANDING_VERSION_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
  } catch {}
  return Date.now();
}

/**
 * Updates the global branding version in localStorage and memory.
 */
export function setGlobalBrandingVersion(ts: number = Date.now()): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(PROTOCOL_BRANDING_VERSION_KEY, String(ts));
    }
  } catch {}
}

/**
 * Appends or replaces a cache-busting query parameter (?v=timestamp) on an image URL.
 * Base64 Data URIs (data:image/...) and Blob URLs (blob:...) are untouched because they
 * are self-contained and adding query parameters can corrupt them.
 */
export function getCacheBustedImageUrl(
  url: string | null | undefined,
  customVersion?: number | string
): string {
  if (!url) return '';
  // Data URLs and Blobs are self-contained, query params not applicable
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const version = customVersion || getGlobalBrandingVersion() || Date.now();

  try {
    // Check if URL has existing parameters
    if (url.includes('?')) {
      const [base, query] = url.split('?');
      const searchParams = new URLSearchParams(query);
      searchParams.set('v', String(version));
      return `${base}?${searchParams.toString()}`;
    } else {
      return `${url}?v=${version}`;
    }
  } catch {
    return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
  }
}

/**
 * Completely purges all browser caches for images:
 * 1. Service Worker CacheStorage (Workbox / Vite-PWA caches)
 * 2. Preloads the fresh image to prime memory
 */
export async function clearAllImageCaches(newUrlsToPreload: string[] = []): Promise<void> {
  console.log('[CacheBusting] Purging browser CacheStorage and image cache...');

  // 1. Clear CacheStorage (Service Worker / Workbox caches)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (name) => {
          console.log(`[CacheBusting] Deleting CacheStorage cache: ${name}`);
          return caches.delete(name);
        })
      );
    } catch (err) {
      console.warn('[CacheBusting] Error clearing CacheStorage:', err);
    }
  }

  // 2. Preload new images with cache-busting headers
  if (typeof window !== 'undefined' && newUrlsToPreload.length > 0) {
    newUrlsToPreload.forEach((src) => {
      if (src && !src.startsWith('data:')) {
        const bustedUrl = getCacheBustedImageUrl(src, Date.now());
        const img = new Image();
        img.src = bustedUrl;
      }
    });
  }
}

/**
 * Directly queries the Central Firestore Database for branding settings,
 * completely bypassing local cache to guarantee the freshest assets.
 * Fetches dedicated unbundled asset documents in parallel.
 */
export async function fetchCentralBrandingDirectly(): Promise<CentralBrandingPayload | null> {
  try {
    const docRef = doc(db, 'app_config', 'branding_settings');
    const snap = await getDoc(docRef);
    let data: CentralBrandingPayload = {};
    if (snap.exists()) {
      data = snap.data() as CentralBrandingPayload;
    }

    // Always fetch dedicated documents for all 5 UI branding assets in parallel for guaranteed freshest assets
    try {
      const [avatarSnap, middleSnap, bottomSnap, headerSnap, stampSnap] = await Promise.all([
        getDoc(doc(db, 'app_config', 'asset_supervisor_avatar')),
        getDoc(doc(db, 'app_config', 'asset_middle_card_logo')),
        getDoc(doc(db, 'app_config', 'asset_bottom_fab_icon')),
        getDoc(doc(db, 'app_config', 'asset_header_logo')),
        getDoc(doc(db, 'app_config', 'asset_official_stamp')),
      ]);

      if (avatarSnap.exists() && avatarSnap.data()?.data) {
        data.supervisorAvatar = avatarSnap.data().data;
      }
      if (middleSnap.exists() && middleSnap.data()?.data) {
        data.middleCardLogo = middleSnap.data().data;
      }
      if (bottomSnap.exists() && bottomSnap.data()?.data) {
        data.bottomFabIcon = bottomSnap.data().data;
      }
      if (headerSnap.exists() && headerSnap.data()?.data) {
        data.headerLogo = headerSnap.data().data;
      }
      if (stampSnap.exists() && stampSnap.data()?.data) {
        data.officialStamp = stampSnap.data().data;
      }
    } catch {}

    return data;
  } catch (err) {
    console.warn('[CacheBusting] Failed to fetch central branding directly:', err);
  }
  return null;
}

/**
 * Applies central branding data into all relevant local storage slots
 * with STRICT ISOLATION between UI elements.
 */
export function applyCentralBrandingLocally(data: CentralBrandingPayload): void {
  const newVersion = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
  setGlobalBrandingVersion(newVersion);

  // 1. Top Header Main Logo (Independent)
  if (data.headerLogo !== undefined) {
    if (data.headerLogo) {
      localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, data.headerLogo);
    } else {
      localStorage.removeItem(PROTOCOL_HEADER_LOGO_KEY);
    }
    window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: data.headerLogo }));
  } else if (data.appLogo && !localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY)) {
    // Only fallback if independent key is unpopulated
    localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, data.appLogo);
    window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: data.appLogo }));
  }

  // 2. Middle Card Emblem (Independent)
  if (data.middleCardLogo !== undefined) {
    if (data.middleCardLogo) {
      localStorage.setItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY, data.middleCardLogo);
      localStorage.setItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`, data.middleCardLogo);
    } else {
      localStorage.removeItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
      localStorage.removeItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`);
    }
    window.dispatchEvent(new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: data.middleCardLogo }));
    window.dispatchEvent(new CustomEvent('protocol_middle_card_logo_updated', { detail: data.middleCardLogo }));
  }

  // 3. Bottom Navbar FAB Icon / Seal (Independent)
  if (data.bottomFabIcon !== undefined) {
    if (data.bottomFabIcon) {
      localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, data.bottomFabIcon);
    } else {
      localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
    }
    window.dispatchEvent(new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: data.bottomFabIcon }));
    window.dispatchEvent(new CustomEvent('protocol_fab_icon_updated', { detail: data.bottomFabIcon }));
  }

  // 4. Official Report Circular Stamp (Independent)
  if (data.officialStamp !== undefined) {
    if (data.officialStamp) {
      localStorage.setItem(PROTOCOL_OFFICIAL_STAMP_KEY, data.officialStamp);
    } else {
      localStorage.removeItem(PROTOCOL_OFFICIAL_STAMP_KEY);
    }
    window.dispatchEvent(new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: data.officialStamp }));
  }

  // 5. Supervisor Avatar (Independent)
  if (data.supervisorAvatar !== undefined) {
    if (data.supervisorAvatar) {
      localStorage.setItem(PROTOCOL_SUPERVISOR_AVATAR_KEY, data.supervisorAvatar);
      localStorage.setItem(PROTOCOL_USER_AVATAR_KEY, data.supervisorAvatar);
    } else {
      localStorage.removeItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);
      localStorage.removeItem(PROTOCOL_USER_AVATAR_KEY);
    }
    window.dispatchEvent(new Event('dental_doctor_avatar_updated'));
  }

  window.dispatchEvent(new CustomEvent(PROTOCOL_BRANDING_EVENT, { detail: data }));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Downloads the current active central branding assets bundle (JSON + Asset URLs)
 * directly from the Central Database for permanent offline archiving and backup.
 */
export async function downloadCentralAssetsBundle(): Promise<void> {
  try {
    const centralData = await fetchCentralBrandingDirectly();
    const currentHeaderLogo = localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) || localStorage.getItem(PROTOCOL_APP_LOGO_KEY);
    const currentMiddleCardLogo = localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
    const currentBottomFab = localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
    const currentOfficialStamp = localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY);
    const currentSupervisorAvatar = localStorage.getItem(PROTOCOL_SUPERVISOR_AVATAR_KEY);

    const assetManifest = {
      appName: 'PROTOCOL Dental Clinical Portfolio',
      downloadedAt: new Date().toISOString(),
      brandingVersion: getGlobalBrandingVersion(),
      source: 'Central Cloud Database (Firestore)',
      officialSupervisor: 'د. حياة نافع فجر',
      independentAssets: {
        headerLogo: centralData?.headerLogo || currentHeaderLogo || '/protocol_circular_logo.png',
        middleCardLogo: centralData?.middleCardLogo || currentMiddleCardLogo || '/protocol_circular_logo.png',
        bottomFabIcon: centralData?.bottomFabIcon || currentBottomFab || 'default_vector_line_art',
        officialStamp: centralData?.officialStamp || currentOfficialStamp || DEFAULT_OFFICIAL_STAMP_PATH,
        supervisorAvatar: centralData?.supervisorAvatar || currentSupervisorAvatar || 'default',
        updatedAt: centralData?.updatedAt || new Date().toISOString(),
      },
      assetStatus: {
        headerLogoAttached: !!(centralData?.headerLogo || currentHeaderLogo),
        middleCardLogoAttached: !!(centralData?.middleCardLogo || currentMiddleCardLogo),
        bottomFabIconAttached: !!(centralData?.bottomFabIcon || currentBottomFab),
        officialStampAttached: !!(centralData?.officialStamp || currentOfficialStamp),
        supervisorAvatarAttached: !!(centralData?.supervisorAvatar || currentSupervisorAvatar),
      },
    };

    const blob = new Blob([JSON.stringify(assetManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PROTOCOL_Central_Assets_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download central assets bundle:', err);
    throw err;
  }
}
