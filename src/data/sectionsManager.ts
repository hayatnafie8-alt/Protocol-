/**
 * Section-Level Visibility and Management System
 * Controls visibility (Show/Hide), deletion, and custom addition of sections
 * across Desktop Nav, Mobile Nav, Home Portal cards, and Admin Master Panel.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../firebase';

export interface SectionVideoItem {
  id: string;
  url: string; // Video URL: YouTube, Vimeo, direct MP4, or blob URL
  title?: string;
  description?: string;
  createdAt?: string;
}

export interface AppSection {
  id: string;
  key: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string; // Icon identifier
  isVisible: boolean; // true = visible to everyone, false = hidden from subscribers (Admin only with "Hidden" badge)
  requiresPasscode?: boolean; // true (default) = locked, demands access code; false = "متاح للعامة بدون كود"
  isSystem: boolean; // default built-in section
  order: number;
  tabKey?: string; // matches activeTab: 'slides' | 'surgical' | 'home_practice' | 'contact_privacy' | custom
  modalType?: 'studies' | 'patient_guide';
  badgeText?: string;
  videoUrl?: string; // Video URL: YouTube, Vimeo, direct MP4, or blob URL (legacy/primary)
  videoTitle?: string; // Custom title for the section video
  videoDescription?: string; // Description or clinical context for the video
  videos?: SectionVideoItem[]; // Multiple videos supported per section
  customContent?: {
    summary?: string;
    details?: string;
    links?: Array<{ label: string; url: string }>;
  };
}

const STORAGE_KEY = 'dental_app_sections_v5';
const CONFIG_COLLECTION = 'app_config';
const SECTIONS_CONFIG_DOC = 'sections_visibility_config';

/**
 * Default Hidden Keys ordered by the Supervisor (Dr. Hayat Nafee):
 * "الحالات الجراحية" and "أطلس المهارات السريرية" are strictly hidden by default
 * from all old and new subscribers until explicitly published by the supervisor.
 */
export const SUPERVISOR_DEFAULT_HIDDEN_KEYS = [
  'surgical',
  'clinical_skills',
  'sec-surgical',
  'sec-clinical-skills',
];

/**
 * Purges old and stale subscriber cache from localStorage to guarantee that
 * hidden sections never leak to previous visitors or existing subscriber sessions.
 */
export function purgeStaleSubscriberCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const isAuthorAdmin = localStorage.getItem('dental_author_admin') === 'true';
    if (!isAuthorAdmin) {
      // Clear legacy storage keys
      ['dental_app_sections_v1', 'dental_app_sections_v2', 'dental_app_sections_v3', 'dental_app_sections_v4'].forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // Also clean v5 if it was poisoned with visible surgical or clinical_skills
      const rawV5 = localStorage.getItem(STORAGE_KEY);
      if (rawV5) {
        try {
          const parsed = JSON.parse(rawV5);
          if (Array.isArray(parsed)) {
            let modified = false;
            const sanitized = parsed.map((s: AppSection) => {
              if (SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(s.key) || SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(s.id)) {
                if (s.isVisible !== false) {
                  modified = true;
                  return { ...s, isVisible: false };
                }
              }
              return s;
            });
            if (modified) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[SectionsManager] Cache purge notice:', err);
  }
}

// Automatically invoke purge on module evaluation
if (typeof window !== 'undefined') {
  purgeStaleSubscriberCache();
}

export const DEFAULT_APP_SECTIONS: AppSection[] = [
  {
    id: 'sec-protocols',
    key: 'protocols',
    title: 'بروتوكولات الكلاسات',
    titleEn: 'Class Protocols',
    description: 'البروتوكولات السريرية لترميم الأسنان من Class I إلى Class V مع الشرائح التفاعلية والدليل السريري.',
    icon: 'Presentation',
    isVisible: true,
    requiresPasscode: true,
    isSystem: true,
    order: 1,
    tabKey: 'slides',
    badgeText: 'Class I - V',
  },
  {
    id: 'sec-smart-tray',
    key: 'smart_tray',
    title: 'بروتوكول العيادة الذكية: هندسة الطاولة السريرية',
    titleEn: 'Smart Clinic Protocol: Clinical Tray Architecture',
    description: 'هندسة الطاولة السريرية في 7 خطوات تفاعلية: من التجهيز والتعقيم، التخدير، التحضير، العزل، تنظيف الرواسب، الترميم، وحتى الإنهاء وفحص الإطباق.',
    icon: 'Sparkles',
    isVisible: true,
    requiresPasscode: true,
    isSystem: true,
    order: 1.5,
    tabKey: 'smart_tray',
    badgeText: '7 خطوات تفاعلية',
  },
  {
    id: 'sec-surgical',
    key: 'surgical',
    title: 'حالات جراحية',
    titleEn: 'Surgical Cases',
    description: 'أطلس الحالات الجراحية الموثقة خطوة بخطوة: خلع أضراس العقل، قطع الذروة مع MTA، والزرع الفوري.',
    icon: 'Stethoscope',
    isVisible: false, // STRICTLY HIDDEN BY SUPERVISOR
    requiresPasscode: true,
    isSystem: true,
    order: 2,
    tabKey: 'surgical',
    badgeText: 'أطلس جراحي',
  },
  {
    id: 'sec-clinical-skills',
    key: 'clinical_skills',
    title: 'أطلس المهارات السريرية',
    titleEn: 'Clinical Skills Atlas',
    description: 'أطلس مرئي متكامل لمهارات التخدير الموضعي، طرق تركيب الربر دام، وتقنيات الخياطة الجراحية مع المخططات التشريحية عالية الدقة 4K والتنفيذ خطوة بخطوة.',
    icon: 'Sparkles',
    isVisible: false, // STRICTLY HIDDEN BY SUPERVISOR
    requiresPasscode: true,
    isSystem: true,
    order: 3,
    tabKey: 'clinical_skills',
    badgeText: 'أطلس المهارات 4K',
  },
  {
    id: 'sec-home-practice',
    key: 'home_practice',
    title: 'التدريبات بالبيت',
    titleEn: 'Home Practice',
    description: 'المهارات والتدريبات العملية بالمنزل: الخياطة الجراحية، تحضير الكافيتي، وتطبيق الرابر دام.',
    icon: 'Wrench',
    isVisible: true,
    requiresPasscode: true,
    isSystem: true,
    order: 4,
    tabKey: 'home_practice',
    badgeText: 'تدريب منزلي',
  },
  {
    id: 'sec-studies',
    key: 'studies',
    title: 'الدراسات والأبحاث',
    titleEn: 'Studies & Research',
    description: 'الأبحاث العلمية المحكمة الداعمة للبروتوكولات السريرية مع روابط التحقق الرسمية عبر PubMed.',
    icon: 'BookOpen',
    isVisible: true,
    requiresPasscode: true,
    isSystem: true,
    order: 5,
    modalType: 'studies',
    badgeText: 'PubMed & Evidence',
  },
  {
    id: 'sec-patient-guide',
    key: 'patient_guide',
    title: 'دليل المراجعين',
    titleEn: 'Patient Psychology',
    description: 'دليل سيكولوجية المراجعين في العيادة (18 شريحة تفاعلية) للتعامل المهني وتجنب الشكاوى.',
    icon: 'Brain',
    isVisible: true,
    requiresPasscode: true,
    isSystem: true,
    order: 6,
    modalType: 'patient_guide',
    badgeText: '18 شريحة تفاعلية',
  },
  {
    id: 'sec-contact-privacy',
    key: 'contact_privacy',
    title: 'تواصل والخصوصية',
    titleEn: 'Contact & Privacy',
    description: 'قنوات التواصل المباشرة مع المشرفة، سياسة الخصوصية التامة، وشروط الاستخدام الأكاديمي.',
    icon: 'HeartHandshake',
    isVisible: true,
    requiresPasscode: false,
    isSystem: true,
    order: 7,
    tabKey: 'contact_privacy',
    badgeText: 'قنوات رسمية',
  },
];

/**
 * Sanitizes sections list to ensure that supervisor hidden sections
 * are NOT exposed to old, cached, or new subscribers.
 */
export function sanitizeSectionsList(rawList: AppSection[]): AppSection[] {
  const isAuthorAdmin = typeof window !== 'undefined' && localStorage.getItem('dental_author_admin') === 'true';

  return rawList.map((sec) => {
    // If the current user is not verified admin:
    if (!isAuthorAdmin) {
      // 1. If marked false anywhere, enforce false
      if (sec.isVisible === false) {
        return { ...sec, isVisible: false };
      }
      // 2. Default hidden sections (surgical, clinical_skills) must remain false for subscribers
      const isDefaultHidden =
        SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(sec.key) ||
        SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(sec.id);
      if (isDefaultHidden) {
        return { ...sec, isVisible: false };
      }
    }
    return sec;
  });
}

export function getAppSections(): AppSection[] {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any new default sections that don't exist yet
          const existingIds = new Set(parsed.map((s: AppSection) => s.id));
          const missingDefaults = DEFAULT_APP_SECTIONS.filter((s) => !existingIds.has(s.id));
          const merged = [...parsed, ...missingDefaults].sort((a, b) => a.order - b.order);
          const seenIds = new Set<string>();
          const uniqueList: AppSection[] = [];
          for (const s of merged) {
            const uniqKey = s.id || s.key;
            if (!seenIds.has(uniqKey)) {
              seenIds.add(uniqKey);
              uniqueList.push(s);
            }
          }
          const sanitized = sanitizeSectionsList(uniqueList);
          return sanitized;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read app sections from localStorage', err);
  }
  return sanitizeSectionsList(DEFAULT_APP_SECTIONS);
}

export function saveAppSections(sections: AppSection[]): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    }
    // Also sync to cloud in background
    saveAppSectionsToCloud(sections).catch((err) => {
      console.warn('[SectionsManager] Background cloud sync error:', err);
    });
  } catch (err) {
    console.error('Failed to save app sections to localStorage', err);
  }
}

/**
 * Saves sections configuration directly to Firestore cloud.
 * This guarantees that when the Admin hides or shows any section,
 * all active and future subscribers across all devices immediately receive the update.
 * Writes to both sections_visibility_config and global_app_state.
 */
export async function saveAppSectionsToCloud(sections: AppSection[]): Promise<void> {
  try {
    testFirestoreConnection().catch(() => {});
    const docRef = doc(db, CONFIG_COLLECTION, SECTIONS_CONFIG_DOC);
    
    // Collect all variations of hidden keys (key, id, tabKey)
    const hiddenKeys: string[] = [];
    sections.forEach((s) => {
      if (!s.isVisible) {
        if (s.key && !hiddenKeys.includes(s.key)) hiddenKeys.push(s.key);
        if (s.id && !hiddenKeys.includes(s.id)) hiddenKeys.push(s.id);
        if (s.tabKey && !hiddenKeys.includes(s.tabKey)) hiddenKeys.push(s.tabKey);
      }
    });

    const nowIso = new Date().toISOString();
    const nowBuster = Date.now();

    // 1. Sync sections doc
    await setDoc(
      docRef,
      {
        sections,
        hiddenKeys,
        updatedAt: nowIso,
        updatedBy: 'admin',
      },
      { merge: true }
    );

    // 2. Also sync to global_app_state to trigger global subscribers
    const globalDocRef = doc(db, CONFIG_COLLECTION, 'global_app_state');
    await setDoc(
      globalDocRef,
      {
        hiddenSectionKeys: hiddenKeys,
        sections,
        cacheBuster: nowBuster,
        lastUpdated: nowIso,
        updatedBy: 'admin_sections_toggle',
      },
      { merge: true }
    );

    // 3. Dispatch window events for zero-delay local components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-global-state-sync', { detail: { hiddenSectionKeys: hiddenKeys, sections } }));
      window.dispatchEvent(new CustomEvent('app-cache-bust', { detail: { cacheBuster: nowBuster } }));
    }

    console.log('[SectionsManager] Sections successfully synced to Firestore cloud & global state.');
  } catch (error) {
    console.warn('[SectionsManager] Failed to save sections to Firestore cloud:', error);
  }
}

/**
 * Subscribes to real-time App Sections configuration in Firestore.
 * Broadcasts changes instantly across all subscribers (old, new, and guests).
 */
export function subscribeToAppSectionsCloud(
  onUpdate: (sections: AppSection[]) => void
): () => void {
  testFirestoreConnection().catch(() => {});
  const docRef = doc(db, CONFIG_COLLECTION, SECTIONS_CONFIG_DOC);

  let isFirst = true;

  const unsubscribe = onSnapshot(
    docRef,
    async (docSnap) => {
      if (!docSnap.exists() && isFirst) {
        isFirst = false;
        // Seed default config into Firestore with surgical and clinical_skills hidden
        console.log('[SectionsManager] Initializing sections config in Firestore...');
        await saveAppSectionsToCloud(DEFAULT_APP_SECTIONS);
        onUpdate(sanitizeSectionsList(DEFAULT_APP_SECTIONS));
        return;
      }
      isFirst = false;

      if (docSnap.exists()) {
        const data = docSnap.data();
        const cloudSections = data.sections as AppSection[] | undefined;
        const hiddenKeys = (data.hiddenKeys as string[]) || [];

        if (Array.isArray(cloudSections) && cloudSections.length > 0) {
          const existingIds = new Set(cloudSections.map((s) => s.id));
          const missingDefaults = DEFAULT_APP_SECTIONS.filter((s) => !existingIds.has(s.id));
          
          let merged = [...cloudSections, ...missingDefaults].sort((a, b) => a.order - b.order);

          // Strictly enforce hidden keys from cloud
          if (hiddenKeys.length > 0) {
            merged = merged.map((s) => {
              if (hiddenKeys.includes(s.key) || hiddenKeys.includes(s.id) || (s.tabKey && hiddenKeys.includes(s.tabKey))) {
                return { ...s, isVisible: false };
              }
              return s;
            });
          }

          const sanitized = sanitizeSectionsList(merged);

          // Cache locally
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch {}

          onUpdate(sanitized);
          return;
        }
      }

      onUpdate(getAppSections());
    },
    (err) => {
      console.warn('[SectionsManager] Firestore onSnapshot error:', err);
      onUpdate(getAppSections());
    }
  );

  return unsubscribe;
}

export function toggleSectionVisibility(idOrKey: string): AppSection[] {
  const current = getAppSections();
  const clean = idOrKey.trim();
  const updated = current.map((sec) => {
    if (
      sec.id === clean ||
      sec.key === clean ||
      sec.tabKey === clean ||
      sec.id === `sec-${clean}` ||
      sec.key === clean.replace(/^sec-/, '')
    ) {
      return { ...sec, isVisible: !sec.isVisible };
    }
    return sec;
  });
  saveAppSections(updated);
  return updated;
}

export function toggleSectionLock(idOrKey: string): AppSection[] {
  const current = getAppSections();
  const clean = idOrKey.trim();
  const updated = current.map((sec) => {
    if (
      sec.id === clean ||
      sec.key === clean ||
      sec.tabKey === clean ||
      sec.id === `sec-${clean}` ||
      sec.key === clean.replace(/^sec-/, '')
    ) {
      // If requiresPasscode is false, set to true; otherwise set to false
      const currentLocked = sec.requiresPasscode !== false;
      return { ...sec, requiresPasscode: !currentLocked };
    }
    return sec;
  });
  saveAppSections(updated);
  return updated;
}

/**
 * Strict Unified Access Control Helper:
 * Evaluates whether a section is permitted for the active user.
 * Guarantees that hidden sections never appear to subscribers.
 */
export function isSectionAllowedForUser(
  keyOrId: string,
  sections: AppSection[],
  isAuthorAdmin: boolean,
  hiddenKeysFromGlobalState?: string[]
): boolean {
  if (isAuthorAdmin) return true;

  const keyClean = keyOrId.trim();

  // 1. Check against globalState.hiddenSectionKeys
  if (hiddenKeysFromGlobalState && hiddenKeysFromGlobalState.length > 0) {
    if (
      hiddenKeysFromGlobalState.includes(keyClean) ||
      hiddenKeysFromGlobalState.includes(`sec-${keyClean}`) ||
      hiddenKeysFromGlobalState.includes(keyClean.replace(/^sec-/, ''))
    ) {
      return false;
    }
  }

  // 2. Check supervisor default hidden keys (surgical & clinical_skills)
  const isDefaultHidden =
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(keyClean) ||
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(`sec-${keyClean}`) ||
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(keyClean.replace(/^sec-/, ''));

  if (!sections || sections.length === 0) {
    return !isDefaultHidden;
  }

  // 3. Find matching section
  const sec = sections.find(
    (s) =>
      s.key === keyClean ||
      s.id === keyClean ||
      s.tabKey === keyClean ||
      s.key === keyClean.replace(/^sec-/, '') ||
      s.id === `sec-${keyClean}`
  );

  if (!sec) {
    return !isDefaultHidden;
  }

  if (sec.isVisible === false) {
    return false;
  }

  if (isDefaultHidden) {
    return sec.isVisible === true;
  }

  return sec.isVisible === true;
}

/**
 * Strict Unified Hidden Check:
 * Returns true if a section is marked as hidden in settings or global state.
 */
export function isSectionHiddenForUser(
  keyOrId: string,
  sections: AppSection[],
  hiddenKeysFromGlobalState?: string[]
): boolean {
  const keyClean = keyOrId.trim();

  if (hiddenKeysFromGlobalState && hiddenKeysFromGlobalState.length > 0) {
    if (
      hiddenKeysFromGlobalState.includes(keyClean) ||
      hiddenKeysFromGlobalState.includes(`sec-${keyClean}`) ||
      hiddenKeysFromGlobalState.includes(keyClean.replace(/^sec-/, ''))
    ) {
      return true;
    }
  }

  const isDefaultHidden =
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(keyClean) ||
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(`sec-${keyClean}`) ||
    SUPERVISOR_DEFAULT_HIDDEN_KEYS.includes(keyClean.replace(/^sec-/, ''));

  if (!sections || sections.length === 0) {
    return isDefaultHidden;
  }

  const sec = sections.find(
    (s) =>
      s.key === keyClean ||
      s.id === keyClean ||
      s.tabKey === keyClean ||
      s.key === keyClean.replace(/^sec-/, '') ||
      s.id === `sec-${keyClean}`
  );

  if (!sec) {
    return isDefaultHidden;
  }

  return sec.isVisible !== true;
}

export function isSectionLockedForSubscribers(key: string, customSections?: AppSection[]): boolean {
  const list = customSections && customSections.length > 0 ? customSections : getAppSections();
  const sec = list.find((s) => s.key === key || s.id === key || s.tabKey === key);
  // Default to true (locked) unless explicitly false ("متاح للعامة بدون كود")
  if (!sec) return true;
  return sec.requiresPasscode !== false;
}

export function deleteSection(idOrKey: string): AppSection[] {
  const current = getAppSections();
  const updated = current.filter((sec) => sec.id !== idOrKey && sec.key !== idOrKey);
  saveAppSections(updated);
  return updated;
}

export function addCustomSection(data: {
  title: string;
  titleEn: string;
  description: string;
  icon?: string;
  badgeText?: string;
  summary?: string;
}): AppSection[] {
  const current = getAppSections();
  const newId = `sec-custom-${Date.now()}`;
  const newKey = `custom_${Date.now()}`;
  const maxOrder = current.reduce((max, s) => Math.max(max, s.order || 0), 0);

  const newSection: AppSection = {
    id: newId,
    key: newKey,
    title: data.title.trim(),
    titleEn: data.titleEn?.trim() || 'Custom Section',
    description: data.description.trim(),
    icon: data.icon || 'Sparkles',
    isVisible: true,
    isSystem: false,
    order: maxOrder + 1,
    tabKey: newKey,
    badgeText: data.badgeText?.trim() || 'قسم مخصص',
    customContent: {
      summary: data.summary || '',
    },
  };

  const updated = [...current, newSection];
  saveAppSections(updated);
  return updated;
}

export function updateSection(id: string, updates: Partial<AppSection>): AppSection[] {
  const current = getAppSections();
  const updated = current.map((sec) => {
    if (sec.id === id) {
      return { ...sec, ...updates };
    }
    return sec;
  });
  saveAppSections(updated);
  return updated;
}

/**
 * Duplicate a section with a new unique key and ID.
 */
export function duplicateSection(idOrKey: string): {
  sections: AppSection[];
  newSection: AppSection | null;
} {
  const current = getAppSections();
  const source = current.find((s) => s.id === idOrKey || s.key === idOrKey);
  if (!source) {
    return { sections: current, newSection: null };
  }

  const timestamp = Date.now();
  const newId = `sec-copy-${timestamp}`;
  const newKey = `copy_${timestamp}`;
  const maxOrder = current.reduce((max, s) => Math.max(max, s.order || 0), 0);

  const duplicated: AppSection = {
    ...source,
    id: newId,
    key: newKey,
    title: `${source.title} (نسخة)`,
    titleEn: `${source.titleEn} (Copy)`,
    isSystem: false,
    order: maxOrder + 1,
    tabKey: newKey,
  };

  const updated = [...current, duplicated];
  saveAppSections(updated);
  return { sections: updated, newSection: duplicated };
}

/**
 * Normalizes and extracts all videos of a section, supporting multiple videos
 * as well as legacy single videoUrl fields.
 */
export function getSectionVideos(section?: AppSection | null): SectionVideoItem[] {
  if (!section) return [];
  if (section.videos && section.videos.length > 0) {
    return section.videos;
  }
  if (section.videoUrl && section.videoUrl.trim()) {
    return [
      {
        id: `video-legacy-${section.id}`,
        url: section.videoUrl.trim(),
        title: section.videoTitle?.trim() || `فيديو توضيحي: ${section.title}`,
        description: section.videoDescription?.trim(),
      },
    ];
  }
  return [];
}

/**
 * Adds a new video to a section's video playlist.
 */
export function addVideoToSection(
  sectionId: string,
  videoData: { url: string; title?: string; description?: string }
): AppSection[] {
  const current = getAppSections();
  const newVideo: SectionVideoItem = {
    id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: videoData.url.trim(),
    title: videoData.title?.trim() || undefined,
    description: videoData.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const updated = current.map((sec) => {
    if (sec.id === sectionId || sec.key === sectionId) {
      const existingVideos = getSectionVideos(sec);
      const newVideosList = [...existingVideos, newVideo];
      return {
        ...sec,
        videos: newVideosList,
        // Sync legacy fields with the primary video
        videoUrl: newVideosList[0]?.url,
        videoTitle: newVideosList[0]?.title,
        videoDescription: newVideosList[0]?.description,
      };
    }
    return sec;
  });

  saveAppSections(updated);
  return updated;
}

/**
 * Updates a specific video in a section's video list.
 */
export function updateVideoInSection(
  sectionId: string,
  videoId: string,
  updates: Partial<Omit<SectionVideoItem, 'id'>>
): AppSection[] {
  const current = getAppSections();
  const updated = current.map((sec) => {
    if (sec.id === sectionId || sec.key === sectionId) {
      const existingVideos = getSectionVideos(sec);
      const updatedList = existingVideos.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            url: updates.url !== undefined ? updates.url.trim() : v.url,
            title: updates.title !== undefined ? updates.title.trim() : v.title,
            description: updates.description !== undefined ? updates.description.trim() : v.description,
          };
        }
        return v;
      });

      return {
        ...sec,
        videos: updatedList,
        videoUrl: updatedList[0]?.url,
        videoTitle: updatedList[0]?.title,
        videoDescription: updatedList[0]?.description,
      };
    }
    return sec;
  });

  saveAppSections(updated);
  return updated;
}

/**
 * Deletes a specific video from a section's video list.
 */
export function deleteVideoFromSection(sectionId: string, videoId: string): AppSection[] {
  const current = getAppSections();
  const updated = current.map((sec) => {
    if (sec.id === sectionId || sec.key === sectionId) {
      const existingVideos = getSectionVideos(sec);
      const filtered = existingVideos.filter((v) => v.id !== videoId);
      return {
        ...sec,
        videos: filtered,
        videoUrl: filtered[0]?.url || undefined,
        videoTitle: filtered[0]?.title || undefined,
        videoDescription: filtered[0]?.description || undefined,
      };
    }
    return sec;
  });

  saveAppSections(updated);
  return updated;
}

export function updateSectionVideo(
  sectionId: string,
  videoData: { videoUrl?: string; videoTitle?: string; videoDescription?: string; videos?: SectionVideoItem[] }
): AppSection[] {
  const current = getAppSections();
  const updated = current.map((sec) => {
    if (sec.id === sectionId || sec.key === sectionId) {
      if (videoData.videos !== undefined) {
        return {
          ...sec,
          videos: videoData.videos,
          videoUrl: videoData.videos[0]?.url || undefined,
          videoTitle: videoData.videos[0]?.title || undefined,
          videoDescription: videoData.videos[0]?.description || undefined,
        };
      }

      if (!videoData.videoUrl) {
        // Clear all videos
        return {
          ...sec,
          videos: [],
          videoUrl: undefined,
          videoTitle: undefined,
          videoDescription: undefined,
        };
      }

      const existingVideos = getSectionVideos(sec);
      let newVideos = [...existingVideos];
      if (newVideos.length === 0) {
        newVideos = [
          {
            id: `vid-${Date.now()}`,
            url: videoData.videoUrl,
            title: videoData.videoTitle,
            description: videoData.videoDescription,
          },
        ];
      } else {
        newVideos[0] = {
          ...newVideos[0],
          url: videoData.videoUrl,
          title: videoData.videoTitle || newVideos[0].title,
          description: videoData.videoDescription || newVideos[0].description,
        };
      }

      return {
        ...sec,
        videos: newVideos,
        videoUrl: videoData.videoUrl,
        videoTitle: videoData.videoTitle,
        videoDescription: videoData.videoDescription,
      };
    }
    return sec;
  });
  saveAppSections(updated);
  return updated;
}

export function resetDefaultSections(): AppSection[] {
  saveAppSections(DEFAULT_APP_SECTIONS);
  return DEFAULT_APP_SECTIONS;
}
