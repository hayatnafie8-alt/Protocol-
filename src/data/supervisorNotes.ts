/**
 * Supervisor Notes & Inquiries System
 * Allows subscribers to write notes, questions, and feedback directly to the supervisor (د. حياة نافع فجر)
 * Stores notes locally with status, reply capability, and timestamps.
 */

export interface SupervisorNote {
  id: string;
  studentEmail: string;
  studentName?: string;
  category: 'clinical_question' | 'slide_inquiry' | 'case_discussion' | 'general_feedback' | 'urgent';
  sectionTitle?: string;
  slideTitle?: string;
  content: string;
  createdAt: string;
  timestamp: number;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
}

const STORAGE_KEY = 'dental_supervisor_notes_v1';

export const NOTE_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  clinical_question: {
    label: 'سؤال سريري حول الخطوات',
    icon: 'Stethoscope',
    color: 'emerald',
  },
  slide_inquiry: {
    label: 'استفسار حول شريحة معينة',
    icon: 'Presentation',
    color: 'sky',
  },
  case_discussion: {
    label: 'مناقشة حالة سريرية',
    icon: 'Sparkles',
    color: 'amber',
  },
  general_feedback: {
    label: 'ملاحظة عامة أو اقتراح',
    icon: 'MessageSquare',
    color: 'purple',
  },
  urgent: {
    label: 'تنبيه أو استفسار عاجل',
    icon: 'AlertCircle',
    color: 'rose',
  },
};

export function getSupervisorNotes(): SupervisorNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load supervisor notes:', e);
    return [];
  }
}

export function saveSupervisorNote(
  note: Omit<SupervisorNote, 'id' | 'createdAt' | 'timestamp' | 'isRead'>
): SupervisorNote {
  const existing = getSupervisorNotes();
  const newNote: SupervisorNote = {
    ...note,
    id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    timestamp: Date.now(),
    isRead: false,
  };

  const updated = [newNote, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save supervisor note:', e);
  }
  return newNote;
}

export function replyToSupervisorNote(id: string, reply: string): SupervisorNote[] {
  const existing = getSupervisorNotes();
  const updated = existing.map((n) =>
    n.id === id
      ? {
          ...n,
          reply,
          repliedAt: new Date().toLocaleString('ar-EG', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          isRead: true,
        }
      : n
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to reply to note:', e);
  }
  return updated;
}

export function markSupervisorNoteAsRead(id: string): SupervisorNote[] {
  const existing = getSupervisorNotes();
  const updated = existing.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark note as read:', e);
  }
  return updated;
}

export function deleteSupervisorNote(id: string): SupervisorNote[] {
  const existing = getSupervisorNotes();
  const updated = existing.filter((n) => n.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete supervisor note:', e);
  }
  return updated;
}
