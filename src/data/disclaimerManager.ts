/**
 * App Welcome Disclaimer & Terms of Use Enforcement Manager
 * شاشة إخلاء المسؤولية وشروط الاستخدام مع فرض الخروج الصارم عند الرفض
 */

export interface DisclaimerConfig {
  enabled: boolean;
  title: string;
  bodyText: string;
  agreeButtonText: string;
  declineButtonText: string;
  version: number;
}

export const DISCLAIMER_APPROVAL_STORAGE_KEY = 'dental_disclaimer_accepted_v1';
export const DISCLAIMER_CONFIG_STORAGE_KEY = 'dental_disclaimer_config_v1';
export const DISCLAIMER_CONFIG_EVENT = 'dental_disclaimer_config_updated';

export const DEFAULT_DISCLAIMER_CONFIG: DisclaimerConfig = {
  enabled: true,
  title: 'إخلاء مسؤولية هامة (Important Disclaimer)',
  bodyText: `تنبيه هام: تم تصميم هذا التطبيق للأغراض التعليمية والتثقيفية البحتة لطلبة وأطباء الأسنان، ولا يُعتبر بأي حال من الأحوال بديلاً عن الفحص السريري المباشر، التشخيص الطبي المهني، أو استشارة أخصائي الأسنان.

إن البروتوكولات والمعلومات الواردة في التطبيق هي إرشادات أكاديمية مساعدة، ويتحمل الطبيب أو الممارس السريري المسؤولية الكاملة وحدَه عن أي قرار علاجي أو تطبيق عملي على المرضى، ولا يتحمل التطبيق أو مطوره أي مسؤولية قانونية أو مهنية عن نتائج التطبيق الإكلينيكي.`,
  agreeButtonText: 'أوافق وأتابع (Agree & Continue)',
  declineButtonText: 'رفض ولا أوافق (Decline & Exit)',
  version: 1,
};

/**
 * Returns true if the user has already accepted the disclaimer
 */
export function hasAcceptedDisclaimer(): boolean {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(DISCLAIMER_APPROVAL_STORAGE_KEY) === 'true';
    }
  } catch {}
  return false;
}

/**
 * Persists user agreement
 */
export function setAcceptedDisclaimer(accepted: boolean): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (accepted) {
        localStorage.setItem(DISCLAIMER_APPROVAL_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(DISCLAIMER_APPROVAL_STORAGE_KEY);
      }
    }
  } catch {}
}

/**
 * Retrieves the current disclaimer configuration
 */
export function getDisclaimerConfig(): DisclaimerConfig {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(DISCLAIMER_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_DISCLAIMER_CONFIG,
          ...parsed,
        };
      }
    }
  } catch {}
  return { ...DEFAULT_DISCLAIMER_CONFIG };
}

/**
 * Saves and broadcasts updated disclaimer configuration
 */
export function saveDisclaimerConfig(config: Partial<DisclaimerConfig>): DisclaimerConfig {
  const current = getDisclaimerConfig();
  const updated: DisclaimerConfig = {
    ...current,
    ...config,
    version: (current.version || 1) + 1,
  };
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(DISCLAIMER_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(DISCLAIMER_CONFIG_EVENT, { detail: updated }));
    }
  } catch {}
  return updated;
}

/**
 * Resets approval flag (for testing or when admin bumps version)
 */
export function resetDisclaimerApproval(): void {
  setAcceptedDisclaimer(false);
}
