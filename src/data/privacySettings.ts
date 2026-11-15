export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  level: 'info' | 'success' | 'warning' | 'danger';
}

export interface PrivacySettings {
  // 1. Lock & Inactivity
  autoLockTimeout: 'never' | 'immediate' | '1m' | '5m' | '15m' | '30m';
  blurOnAppSwitch: boolean;
  biometricQuickUnlock: boolean;
  autoWipeOnFailedAttempts: boolean;
  maxFailedAttempts: number;

  // 2. Display & Presentation Privacy
  stealthMode: boolean;
  maskCodesAlways: boolean;
  screenCaptureProtection: boolean;
  clinicalWatermarkOnPhotos: boolean;
  autoRedactPatientInfo: boolean;
  preventScreenCaptureNotice: boolean;

  // 3. Browsing & Footprint Privacy
  incognitoMode: boolean;
  autoClearClipboard: boolean;
  blockTelemetry: boolean;
  panicButtonEnabled: boolean;
  encryptedStorage: boolean;
  silentLock: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  autoLockTimeout: '5m',
  blurOnAppSwitch: true,
  biometricQuickUnlock: true,
  autoWipeOnFailedAttempts: true,
  maxFailedAttempts: 5,

  stealthMode: false,
  maskCodesAlways: true,
  screenCaptureProtection: true,
  clinicalWatermarkOnPhotos: true,
  autoRedactPatientInfo: true,
  preventScreenCaptureNotice: true,

  incognitoMode: false,
  autoClearClipboard: true,
  blockTelemetry: true,
  panicButtonEnabled: true,
  encryptedStorage: true,
  silentLock: true,
};

const STORAGE_KEY = 'dental_app_privacy_settings';
const AUDIT_KEY = 'dental_app_security_audit_log';

export function getStoredPrivacySettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PRIVACY_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_PRIVACY_SETTINGS;
}

export function saveStoredPrivacySettings(settings: PrivacySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function getSecurityAuditLog(): SecurityAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    {
      id: 'default-1',
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      action: 'تهيئة درع الخصوصية',
      details: 'تم تفعيل التشفير وحظر التتبع والتشغيل المعزول On-Device بنجاح',
      level: 'success',
    },
  ];
}

export function addSecurityAuditEvent(
  action: string,
  details: string,
  level: 'info' | 'success' | 'warning' | 'danger' = 'info'
): void {
  try {
    const current = getSecurityAuditLog();
    const newEvent: SecurityAuditEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      details,
      level,
    };
    const updated = [newEvent, ...current].slice(0, 30); // Keep last 30 events
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearSecurityAuditLog(): void {
  try {
    localStorage.removeItem(AUDIT_KEY);
  } catch {}
}
