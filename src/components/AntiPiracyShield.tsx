import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, EyeOff, Lock, Sparkles } from 'lucide-react';

interface AntiPiracyShieldProps {
  enabled?: boolean;
  isAdmin?: boolean;
  isContentUnlocked: boolean;
  onSecurityAlert?: (message: string, type: 'screenshot' | 'devtools' | 'print' | 'blur') => void;
}

export const AntiPiracyShield: React.FC<AntiPiracyShieldProps> = ({
  enabled = true,
  isAdmin = false,
  isContentUnlocked,
  onSecurityAlert,
}) => {
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [shieldReason, setShieldReason] = useState<string>('حماية سرية البروتوكول');

  // Trigger shield protection with custom reason
  const triggerShield = useCallback((reason: string, alertType?: 'screenshot' | 'devtools' | 'print' | 'blur') => {
    // Strictly exempt supervisor/admin account (Dr. Hayat)
    if (isAdmin || !enabled) return;
    setIsShieldActive(true);
    setShieldReason(reason);
    if (alertType && onSecurityAlert) {
      onSecurityAlert(reason, alertType);
    }
  }, [enabled, isAdmin, onSecurityAlert]);

  const removeShield = useCallback(() => {
    setIsShieldActive(false);
  }, []);

  useEffect(() => {
    // Completely bypass all capture blocks for admin (Dr. Hayat)
    if (isAdmin || !enabled) {
      setIsShieldActive(false);
      return;
    }

    // 1. Visibility change handler (App Switcher / Tab change / Backgrounding / Screen recorder launcher)
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerShield('تم حجب المحتوى لحماية السرية عند التبديل بين التطبيقات', 'blur');
      } else {
        // Automatically restore when user focuses back on the app
        setTimeout(() => {
          setIsShieldActive(false);
        }, 150);
      }
    };

    // 2. Window Blur handler (When window/webview loses focus or another app/recorder opens over it)
    const handleWindowBlur = () => {
      // Only blur if content is unlocked or in sensitive clinical view
      if (isContentUnlocked) {
        triggerShield('النافذة خارج التركيز: تم تفعيل درع الحماية ضد التقاط الشاشة', 'blur');
      }
    };

    // 3. Window Focus handler (Restore view smoothly)
    const handleWindowFocus = () => {
      setIsShieldActive(false);
    };

    // 4. Keyboard Shortcuts Blocker: DevTools, PrintScreen, Ctrl+P, Ctrl+U, Ctrl+S
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerShield('⚠️ تم رصد محاولة التقاط شاشة (PrintScreen) - المحتوى محمي بحقوق الطبع', 'screenshot');
        // Temporarily blank screen to prevent buffer capture
        setTimeout(() => {
          setIsShieldActive(false);
        }, 1500);
        return;
      }

      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('تم حظر فتح أدوات المطور (F12) لحماية الشفرة والمحتوى', 'devtools');
        return false;
      }

      // Block Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      // Block Ctrl+Shift+J / Cmd+Option+J (Console)
      // Block Ctrl+Shift+C / Cmd+Option+C (Inspect Element selector)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('تم حظر فحص العناصر والمطور (Inspect) لحماية الملكية الأكاديمية', 'devtools');
        return false;
      }

      // Block Ctrl+U / Cmd+Option+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('تم حظر عرض المصدر لحماية البيانات السريرية', 'devtools');
        return false;
      }

      // Block Ctrl+P / Cmd+P (Direct Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('الطباعة المباشرة معطلة - استخدم زر «طباعة المحتوى» المعتمد لتوثيق نسختك المائية', 'print');
        return false;
      }

      // Block Windows Snipping Tool (Meta+Shift+S / Win+Shift+S)
      if ((e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('⚠️ تم حظر استخدام أداة لقطة الشاشة (Snipping Tool) - المحتوى السريري محمي بحقوق الطبع', 'screenshot');
        return false;
      }

      // Block Mac Screenshot shortcuts (Cmd+Shift+3 / Cmd+Shift+4 / Cmd+Shift+5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('⚠️ تم حظر اختصارات التقاط الشاشة على Mac - المحتوى الأكاديمي محمي', 'screenshot');
        return false;
      }

      // Block Ctrl+S / Cmd+S (Save Webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 5. Global Context Menu Blocker (Right click / Long press)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow context menu only inside editable text inputs
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (!isInput) {
        e.preventDefault();
        return false;
      }
    };

    // 6. Block drag-and-drop of clinical images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
    };
  }, [enabled, isContentUnlocked, triggerShield]);

  if (!isShieldActive) return null;

  return (
    <div
      onClick={removeShield}
      className="fixed inset-0 z-[999999] bg-[#FAF7F2]/95 dark:bg-[#12150E]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all animate-fadeIn"
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <div className="relative max-w-md w-full p-8 rounded-3xl bg-white/90 dark:bg-[#1D2217]/90 border-2 border-[#596628]/40 dark:border-[#7D9333]/50 shadow-2xl flex flex-col items-center space-y-4">
        {/* Shield Icon Graphic */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#596628] to-[#3E4A1B] text-white flex items-center justify-center shadow-lg shadow-[#596628]/25 relative">
          <ShieldAlert className="w-10 h-10 animate-pulse text-[#E4EDBF]" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Protection Badges */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#596628]/10 text-[#596628] dark:text-[#A8C24E] border border-[#596628]/20">
          <EyeOff className="w-3.5 h-3.5" />
          <span>درع حماية المحتوى السريري | Anti-Capture Shield</span>
        </div>

        <h3 className="text-xl font-black text-[#2F2B24] dark:text-white">
          محتوى محمي ضد الالتقاط والتصوير 🔒
        </h3>

        <p className="text-xs sm:text-sm text-[#5A5243] dark:text-[#C5BEAF] leading-relaxed">
          {shieldReason}
        </p>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#151A10] border border-[#E5DEC9] dark:border-[#323D23] w-full text-[11px] text-[#6A6253] dark:text-[#9F9785] space-y-1">
          <p className="font-bold text-[#2F2B24] dark:text-[#E8E2D5]">
            بروتوكول PROTOCOL | إعداد وتصميم د. حياه نافع فجر
          </p>
          <p>
            تطبق كافة قواعد منع النسخ، التمويه التلقائي عند التبديل، وحجب التسجيل لحماية الملكية الأكاديمية.
          </p>
        </div>

        <button
          type="button"
          onClick={removeShield}
          className="w-full py-3 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>انقر للمتابعة والعودة للمحتوى السريري</span>
        </button>
      </div>
    </div>
  );
};
