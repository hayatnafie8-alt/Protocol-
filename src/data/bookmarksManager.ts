/**
 * Personal Bookmarks & Favorites Manager for Subscribers
 * Stores user favorites locally in localStorage / IndexedDB with offline access
 * Supports Clinical Protocols, Skills, Guides, Calculations, and Surgical cases.
 */

export type BookmarkCategory = 
  | 'protocol'         // Class I - V composite protocols
  | 'skill'            // Local anesthesia, rubber dam, suturing
  | 'surgical'         // Surgical extraction, sinus lift, implants
  | 'guide'            // Patient guide, psychology
  | 'calc_or_formula'  // C-Factor, shade button, anesthesia dosage
  | 'prescription'     // Drugs, analgesics, antibiotics
  | 'viva'             // Clinical oral exam questions
  | 'post'             // Clinical Feed Posts
  | 'slide';           // Clinical Protocol Slides

export interface BookmarkItem {
  id: string;               // Unique bookmark identifier e.g. 'protocol-class-1' or 'skill-ianb'
  title: string;            // Arabic / English title
  subtitle?: string;        // Short descriptive subtitle
  category: BookmarkCategory;
  categoryLabel: string;    // Arabic category badge label
  specialty: string;        // 'Operative' | 'Surgery' | 'Endodontics' | 'Pharmacology' | 'Prosthodontics' | 'Periodontics'
  tags: string[];           // Searchable tags e.g. ['IANB', 'تخدير', 'عصب']
  targetTab: string;        // 'slides' | 'clinical_skills' | 'surgical' | 'anatomy' | 'shade' | 'timer' | 'cheatsheet' | 'patient_guide'
  targetParam?: string;     // Class ID, Skill ID, or Case ID
  clinicalKeyPoint?: string;// Quick clinical takeaway for emergency review in clinic
  savedAt: number;          // Timestamp when bookmarked
  notes?: string;           // Optional student clinical personal note
}

const STORAGE_KEY = 'dental_subscriber_clinical_bookmarks_v1';

export function getStoredBookmarks(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load clinical bookmarks:', e);
    return [];
  }
}

export function saveStoredBookmarks(items: BookmarkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('app-bookmarks-updated', { detail: items }));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
  }
}

export function isItemBookmarked(id: string, cachedBookmarks?: BookmarkItem[]): boolean {
  const list = cachedBookmarks || getStoredBookmarks();
  return list.some((b) => b.id === id);
}

export function toggleBookmarkItem(item: Omit<BookmarkItem, 'savedAt'>): boolean {
  const current = getStoredBookmarks();
  const existingIndex = current.findIndex((b) => b.id === item.id);

  if (existingIndex >= 0) {
    // Remove from favorites
    const updated = current.filter((b) => b.id !== item.id);
    saveStoredBookmarks(updated);
    return false; // Not bookmarked anymore
  } else {
    // Add to favorites
    const newItem: BookmarkItem = {
      ...item,
      savedAt: Date.now(),
    };
    const updated = [newItem, ...current];
    saveStoredBookmarks(updated);
    return true; // Now bookmarked
  }
}

export function updateBookmarkNote(id: string, note: string): void {
  const current = getStoredBookmarks();
  const updated = current.map((b) => (b.id === id ? { ...b, notes: note.trim() || undefined } : b));
  saveStoredBookmarks(updated);
}
