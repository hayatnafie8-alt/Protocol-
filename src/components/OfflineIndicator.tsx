import React from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  cachedSectionsCount?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ cachedSectionsCount }) => {
  const { isOnline, justReconnected } = useOnlineStatus();

  if (justReconnected) {
    return (
      <aside
        aria-label="حالة الاتصال"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-xl border border-emerald-400 backdrop-blur-md animate-fadeIn"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <div className="flex flex-col">
          <span>متصل بالإنترنت • تم تحديث ومزامنة البيانات</span>
          <span className="text-[10px] font-normal text-emerald-100">State Synced & Updated</span>
        </div>
      </aside>
    );
  }

  if (isOnline) {
    return null;
  }

  return (
    <aside
      aria-label="تنبيه وضع عدم الاتصال"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 text-xs font-bold shadow-2xl border border-amber-400/80 backdrop-blur-md animate-bounce-subtle"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-white" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-black">نموذج أوفلاين / Offline Mode</span>
          <span className="text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded-full font-mono">
            بدون نت
          </span>
        </div>
        <span className="text-[10px] text-amber-100 font-normal">
          تصفح سلس لجميع البروتوكولات والدراسات المحفوظة في الذاكرة المحلية
        </span>
      </div>
    </aside>
  );
};
