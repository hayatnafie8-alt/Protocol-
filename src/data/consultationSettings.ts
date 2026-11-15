/**
 * Consultation & Social Channels Configuration
 * Manages the Instagram profile link and consultation routing
 */

const INSTAGRAM_KEY = 'dental_consultation_instagram_url';
export const DEFAULT_INSTAGRAM_URL = 'https://instagram.com/hay_a_2';

export function getInstagramProfileUrl(): string {
  try {
    const saved = localStorage.getItem(INSTAGRAM_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return DEFAULT_INSTAGRAM_URL;
}

export function setInstagramProfileUrl(url: string): string {
  const clean = url.trim() || DEFAULT_INSTAGRAM_URL;
  try {
    localStorage.setItem(INSTAGRAM_KEY, clean);
  } catch {}
  return clean;
}
