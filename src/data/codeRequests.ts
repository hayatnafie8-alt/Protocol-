/**
 * Subscriber Code Requests Data Manager
 * Stores requests from subscribers who need an activation code
 * Includes email, name, target section, notes, and status.
 */

export interface CodeRequest {
  id: string;
  email: string;
  studentName?: string;
  academicStage?: string;
  university?: string;
  promoCode?: string;
  targetSectionTitle?: string;
  notes?: string;
  receiptUrl?: string;
  amount?: string;
  paymentMethod?: string;
  durationPlan?: string;
  expiresAt?: number;
  rejectionReason?: string;
  createdAt: string;
  timestamp: number;
  status: 'pending' | 'code_sent' | 'rejected';
  generatedCode?: string;
}

const STORAGE_KEY = 'dental_subscriber_code_requests_v1';

export function getCodeRequests(): CodeRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load code requests:', e);
    return [];
  }
}

export function saveCodeRequest(
  req: Omit<CodeRequest, 'id' | 'createdAt' | 'timestamp' | 'status'>
): CodeRequest {
  const existing = getCodeRequests();
  const newReq: CodeRequest = {
    ...req,
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    timestamp: Date.now(),
    status: 'pending',
  };

  const updated = [newReq, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save code request:', e);
  }

  return newReq;
}

export function updateCodeRequestStatus(
  id: string,
  status: 'pending' | 'code_sent' | 'rejected',
  generatedCode?: string
): CodeRequest[] {
  const existing = getCodeRequests();
  const updated = existing.map((r) =>
    r.id === id ? { ...r, status, generatedCode: generatedCode || r.generatedCode } : r
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update code request:', e);
  }
  return updated;
}

export function deleteCodeRequest(id: string): CodeRequest[] {
  const existing = getCodeRequests();
  const updated = existing.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete code request:', e);
  }
  return updated;
}
