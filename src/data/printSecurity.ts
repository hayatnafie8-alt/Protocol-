/**
 * Print Security and Content Protection Service
 * Restricts browser print triggers, text copying, context menus, and screen captures for regular users.
 * ADMIN EXEMPTION: When isAdmin is true, all restrictions are completely bypassed.
 */

import { getStudentCodes } from './studentCodes';

export interface WatermarkData {
  subscriberName: string;
  subscriberEmail: string;
  subscriberCode: string;
  timestamp: string;
  verificationId: string;
  officialNotice: string;
  affiliation: string;
}

declare global {
  interface Window {
    __SECURE_PRINT_AUTHORIZED__?: boolean;
    __IS_ADMIN_CONTENT_EXEMPT__?: boolean;
  }
}

export function getWatermarkData(): WatermarkData {
  let subscriberName = 'مشترك معتمد';
  let subscriberEmail = '';
  let subscriberCode = '';

  const isAdmin = localStorage.getItem('dental_author_admin') === 'true';

  if (isAdmin) {
    subscriberName = 'المشرف العام: د. حياه نافع فجر';
    subscriberEmail = 'hayatnafee9@gmail.com';
    subscriberCode = 'AUTH-ADMIN-2003';
  } else {
    try {
      const savedEmail = localStorage.getItem('dental_subscriber_email');
      if (savedEmail) {
        subscriberEmail = savedEmail;
        const allCodes = getStudentCodes();
        const found = allCodes.find(
          (c) => c.email.toLowerCase() === savedEmail.toLowerCase()
        );
        if (found) {
          subscriberName = found.name ? `الطالب: ${found.name}` : `الطالب: ${found.email}`;
          subscriberCode = found.code;
        } else {
          subscriberName = `الطالب: ${savedEmail}`;
          subscriberCode = 'STD-' + Math.abs(savedEmail.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
        }
      } else {
        subscriberName = 'طالب معتمد (جلسة دراسية)';
        subscriberCode = 'STD-' + Math.floor(1000 + Math.random() * 9000);
      }
    } catch {}
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const verificationId = `PRT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randHex}`;

  return {
    subscriberName,
    subscriberEmail,
    subscriberCode,
    timestamp: `${dateStr} - ${timeStr}`,
    verificationId,
    officialNotice: 'محتوى خاص ومعتمد - بروتوكول طب الأسنان | د. حياه نافع فجر | يحظر النشر أو التوزيع بدون إذن',
    affiliation: 'كلية طب الأسنان - جامعة المعارف',
  };
}

/**
 * Triggers the official In-App Controlled Print
 */
export function triggerControlledPrint(options?: { onBefore?: () => void; onAfter?: () => void }) {
  if (options?.onBefore) options.onBefore();

  window.__SECURE_PRINT_AUTHORIZED__ = true;
  document.body.classList.remove('unauthorized-print-attempt');
  document.body.classList.add('authorized-secure-print');

  // Trigger browser print
  setTimeout(() => {
    window.print();
  }, 100);
}

export interface ContentProtectionCallbacks {
  getIsAdmin?: () => boolean;
  onBlockedPrintAttempt?: () => void;
  onBlockedCopyAttempt?: () => void;
  onBlockedScreenshotAttempt?: () => void;
  onBlockedDevToolsAttempt?: () => void;
}

/**
 * Installs system-level Content & Screen Protection on the window
 * Completely exempts the Admin account from all restrictions.
 */
export function setupContentProtection(callbacks: ContentProtectionCallbacks) {
  const checkIsAdmin = (): boolean => {
    if (typeof callbacks.getIsAdmin === 'function') {
      return callbacks.getIsAdmin();
    }
    return (
      window.__IS_ADMIN_CONTENT_EXEMPT__ === true ||
      localStorage.getItem('dental_author_admin') === 'true'
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // ADMIN EXEMPTION: Supervisor can use all keys freely (Ctrl+C, Ctrl+P, PrintScreen, DevTools, etc.)
    if (checkIsAdmin()) {
      return;
    }

    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    // 1. Block PrintScreen key
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedScreenshotAttempt) {
        callbacks.onBlockedScreenshotAttempt();
      }
      return false;
    }

    // 2. Block Windows Snipping Tool (Meta+Shift+S / Win+Shift+S)
    if ((e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedScreenshotAttempt) {
        callbacks.onBlockedScreenshotAttempt();
      }
      return false;
    }

    // 3. Block Mac Screenshot shortcuts (Cmd+Shift+3 / Cmd+Shift+4 / Cmd+Shift+5)
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedScreenshotAttempt) {
        callbacks.onBlockedScreenshotAttempt();
      }
      return false;
    }

    // 4. Block F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedDevToolsAttempt) {
        callbacks.onBlockedDevToolsAttempt();
      }
      return false;
    }

    // 5. Block Ctrl+Shift+I / Cmd+Option+I / J / C (Inspect Element & Console)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedDevToolsAttempt) {
        callbacks.onBlockedDevToolsAttempt();
      }
      return false;
    }

    // 6. Block Ctrl+P and Cmd+P (Print)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedPrintAttempt) {
        callbacks.onBlockedPrintAttempt();
      }
      return false;
    }

    // 7. Block Ctrl+S and Cmd+S (Save webpage)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 8. Block Ctrl+U (View source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 9. Block Ctrl+C / Cmd+C / Ctrl+A outside editable inputs
    if (!isInput && (e.ctrlKey || e.metaKey) && ['c', 'C', 'a', 'A', 'x', 'X'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedCopyAttempt) {
        callbacks.onBlockedCopyAttempt();
      }
      return false;
    }
  };

  // Block right-click context menu outside of input/textarea
  const handleContextMenu = (e: MouseEvent) => {
    // ADMIN EXEMPTION: Supervisor can right-click anywhere freely
    if (checkIsAdmin()) {
      return;
    }

    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      if (callbacks.onBlockedCopyAttempt) {
        callbacks.onBlockedCopyAttempt();
      }
      return false;
    }
  };

  // Block copy on protected document body unless in input
  const handleCopy = (e: ClipboardEvent) => {
    // ADMIN EXEMPTION: Supervisor can copy text freely
    if (checkIsAdmin()) {
      return;
    }

    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      if (e.clipboardData) {
        e.clipboardData.clearData();
      }
      if (callbacks.onBlockedCopyAttempt) {
        callbacks.onBlockedCopyAttempt();
      }
      return false;
    }
  };

  const handleCut = (e: ClipboardEvent) => {
    if (checkIsAdmin()) {
      return;
    }
    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Block image and text dragging
  const handleDragStart = (e: DragEvent) => {
    if (checkIsAdmin()) {
      return;
    }
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'IMG' || target.tagName === 'A' || !target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  };

  // Handle Before & After Print
  const handleBeforePrint = () => {
    if (checkIsAdmin()) {
      return;
    }
    if (!window.__SECURE_PRINT_AUTHORIZED__) {
      document.body.classList.add('unauthorized-print-attempt');
    }
  };

  const handleAfterPrint = () => {
    window.__SECURE_PRINT_AUTHORIZED__ = false;
    document.body.classList.remove('authorized-secure-print');
    document.body.classList.remove('unauthorized-print-attempt');
  };

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('contextmenu', handleContextMenu, true);
  window.addEventListener('dragstart', handleDragStart, true);
  window.addEventListener('copy', handleCopy, true);
  window.addEventListener('cut', handleCut, true);
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('contextmenu', handleContextMenu, true);
    window.removeEventListener('dragstart', handleDragStart, true);
    window.removeEventListener('copy', handleCopy, true);
    window.removeEventListener('cut', handleCut, true);
    window.removeEventListener('beforeprint', handleBeforePrint);
    window.removeEventListener('afterprint', handleAfterPrint);
  };
}
