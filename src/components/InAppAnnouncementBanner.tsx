import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Clock,
  Pin,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  AnnouncementItem,
  getCachedAnnouncements,
  subscribeToAnnouncementsCloud,
  filterAnnouncementsForUser,
} from '../services/announcementsService';

interface InAppAnnouncementBannerProps {
  onNavigateTab?: (tab: string, param?: string) => void;
  onOpenHistory?: () => void;
  isSubscribed?: boolean;
  isAdmin?: boolean;
}

export const InAppAnnouncementBanner: React.FC<InAppAnnouncementBannerProps> = ({
  onNavigateTab,
  onOpenHistory,
  isSubscribed = false,
  isAdmin = false,
}) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    getCachedAnnouncements()
  );
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem('dismissed_announcements_session');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAnnouncementsCloud((list) => {
      setAnnouncements(list);
    });
    return () => unsub();
  }, []);

  const visibleAnnouncements = filterAnnouncementsForUser(announcements, isSubscribed, isAdmin);
  const activeAnnouncements = visibleAnnouncements.filter((a) => !dismissedIds.includes(a.id));
  const current = activeAnnouncements[0];

  if (!current) return null;

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem('dismissed_announcements_session', JSON.stringify(next));
    } catch {}
  };

  const isUrgent = current.priority === 'urgent';
  const isImportant = current.priority === 'important';

  if (isCollapsed) {
    return (
      <div className="w-full flex justify-end animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="px-3.5 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
        >
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>تنبيه إداري جديد ({activeAnnouncements.length})</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="تنبيهات وإعلانات المنصة السريرية"
      className={`rounded-2xl border shadow-md text-right overflow-hidden transition-all animate-fadeIn ${
        isUrgent
          ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white border-rose-400'
          : isImportant
          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-[#59662C] text-white border-amber-300'
          : 'bg-gradient-to-r from-[#59662C] via-[#708238] to-[#3B441D] text-white border-[#8CA53F]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              {isUrgent ? (
                <AlertTriangle className="w-5 h-5 text-amber-200 animate-bounce" />
              ) : (
                <Megaphone className="w-5 h-5 text-amber-200 animate-pulse" />
              )}
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {current.badge && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md border border-white/30 flex items-center gap-1">
                    {current.isPinned && <Pin className="w-2.5 h-2.5 fill-white" />}
                    <span>{current.badge}</span>
                  </span>
                )}
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                  {current.title}
                </h4>
                <span className="text-[10px] text-white/80 font-mono hidden sm:inline">
                  • {current.createdAt}
                </span>
              </div>
              <p className="text-xs font-semibold text-white/95 leading-relaxed">
                {current.message}
              </p>
            </div>
          </div>

          {/* Action & Controls */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end">
            {current.actionButton?.actionType === 'url' ? (
              <a
                href={current.actionButton.target}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#3B441D] hover:bg-amber-50 font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <span>{current.actionButton.label || 'فتح الرابط'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (current.actionButton || current.linkTab) && onNavigateTab ? (
              <button
                type="button"
                onClick={() => {
                  const target = current.actionButton?.target || current.linkTab!;
                  const param = current.linkParam;
                  onNavigateTab(target, param);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#3B441D] hover:bg-amber-50 font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <span>{current.actionButton?.label || 'الانتقال للشرح'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="عرض سجل كافة الإعلانات السابقة"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">السجل ({announcements.length})</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white cursor-pointer"
                title="تصغير التنبيه"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(current.id)}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white cursor-pointer"
                title="إغلاق التنبيه لهذه الجلسة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
