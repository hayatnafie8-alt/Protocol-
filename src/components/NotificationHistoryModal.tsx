import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  X,
  Megaphone,
  ArrowLeft,
  Pin,
  Trash2,
  Send,
  Plus,
  Sparkles,
  CheckCircle,
  Users,
  Lock,
  Unlock,
  ExternalLink,
} from 'lucide-react';
import {
  AnnouncementItem,
  getCachedAnnouncements,
  subscribeToAnnouncementsCloud,
  publishAnnouncementInCloud,
  deleteAnnouncementInCloud,
  filterAnnouncementsForUser,
} from '../services/announcementsService';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isSubscribed?: boolean;
  onNavigateTab?: (tab: string, param?: string) => void;
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  isSubscribed = false,
  onNavigateTab,
}) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    getCachedAnnouncements()
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newBadge, setNewBadge] = useState('تحديث سريري 📢');
  const [newPriority, setNewPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [newAudience, setNewAudience] = useState<'all' | 'free' | 'paid'>('all');
  const [newLinkTab, setNewLinkTab] = useState('slides');
  const [newLinkParam, setNewLinkParam] = useState('class-4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      localStorage.setItem('dental_last_read_announcements_ts', String(Date.now()));
    } catch {}

    const unsub = subscribeToAnnouncementsCloud((list) => {
      setAnnouncements(list);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleAnnouncements = filterAnnouncementsForUser(announcements, isSubscribed, isAdmin);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await publishAnnouncementInCloud({
        title: newTitle.trim(),
        message: newMessage.trim(),
        badge: newBadge.trim() || undefined,
        category: newPriority === 'urgent' ? 'urgent_alert' : 'protocol_update',
        priority: newPriority,
        targetAudience: newAudience,
        authorName: 'د. حياة نافع فجر',
        linkTab: newLinkTab || undefined,
        linkParam: newLinkParam || undefined,
        isPinned: newPriority === 'urgent',
      });

      setNewTitle('');
      setNewMessage('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to publish announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريدين حذف هذا الإعلان من سجل كافة المشتركين؟')) {
      await deleteAnnouncementInCloud(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white dark:bg-[#181C14] rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-[#E5DEC9] dark:border-[#343E26] shadow-2xl space-y-5 text-right max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#343E26] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                مركز الإعلانات والتنبيهات الأكاديمية 📢
              </h3>
              <p className="text-xs text-[#716A5B] dark:text-[#A7A08E]">
                سجل التحديثات السريرية، ملاحظات المشرفة، والإشعارات الأكاديمية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Broadcast Creator Toggle */}
        {isAdmin && (
          <div className="shrink-0">
            {!showCreateForm ? (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform hover:scale-101"
              >
                <Plus className="w-4 h-4" />
                <span>إرسال بث إداري فوري لجميع المشتركين (Admin Broadcast) 📢</span>
              </button>
            ) : (
              <form
                onSubmit={handleCreateAnnouncement}
                className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>بث إعلان جديد للطلاب (يظهر كإشعار فوراً في هواتفهم):</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                      عنوان الإعلان:*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تحديث بروتوكول الصنف الرابع وصور الماميلونات..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-bold text-[#2F2B24] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                      نص الرسالة والتفاصيل السريرية:*
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="اكتبي التوجيه السريري أو التنبيه هنا..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-semibold text-[#2F2B24] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                        الشارة:
                      </label>
                      <input
                        type="text"
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        className="w-full p-1.5 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                        الجمهور:
                      </label>
                      <select
                        value={newAudience}
                        onChange={(e) => setNewAudience(e.target.value as any)}
                        className="w-full p-1.5 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 text-xs font-bold"
                      >
                        <option value="all">الجميع 👥</option>
                        <option value="free">الزوار 🔓</option>
                        <option value="paid">المشتركون 🔒</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                        الأهمية:
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="w-full p-1.5 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 text-xs font-bold"
                      >
                        <option value="normal">عادي</option>
                        <option value="important">مهم ⭐</option>
                        <option value="urgent">عاجل 🚨</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                        رابط سريع:
                      </label>
                      <select
                        value={newLinkTab}
                        onChange={(e) => setNewLinkTab(e.target.value)}
                        className="w-full p-1.5 bg-white dark:bg-[#1E2417] rounded-xl border border-amber-200 text-xs font-bold"
                      >
                        <option value="slides">بروتوكولات الكلاسات</option>
                        <option value="clinical_skills">المهارات السريرية 4K</option>
                        <option value="surgical">الحالات الجراحية</option>
                        <option value="prescriptions">الوصفات</option>
                        <option value="home">الرئيسية</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'جاري البث...' : 'إرسال وتنبيه الطلاب الآن 🚀'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Announcements List Container */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {visibleAnnouncements.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-2">
              <Megaphone className="w-8 h-8 mx-auto opacity-30" />
              <p className="font-bold">لا توجد إعلانات منشورة حالياً</p>
            </div>
          ) : (
            visibleAnnouncements.map((item, idx) => (
              <div
                key={`${item.id}_${idx}`}
                className={`p-4 rounded-2xl border space-y-2 relative transition-all ${
                  item.isPinned
                    ? 'bg-amber-500/10 dark:bg-amber-950/25 border-amber-400 dark:border-amber-700/60 shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#1E2417] border-[#E5DEC9] dark:border-[#384524]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-white flex items-center gap-1 shadow-2xs">
                        <Pin className="w-2.5 h-2.5" />
                        <span>مثبت</span>
                      </span>
                    )}

                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                        {item.badge}
                      </span>
                    )}

                    {isAdmin && item.targetAudience && item.targetAudience !== 'all' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                        {item.targetAudience === 'paid' ? (
                          <>
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>للمشتركين</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>للزوار</span>
                          </>
                        )}
                      </span>
                    )}

                    <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 font-mono">{item.createdAt}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                        title="حذف الإعلان"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#5C5547] dark:text-[#C5BFB0] leading-relaxed">
                  {item.message}
                </p>

                {/* Action button if defined */}
                {(item.actionButton || item.linkTab) && (
                  <div className="pt-2 border-t border-[#E5DEC9]/60 dark:border-[#2E3720] flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">بواسطة: {item.authorName || 'د. حياة'}</span>
                    {item.actionButton?.actionType === 'url' ? (
                      <a
                        href={item.actionButton.target}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#59662C] hover:bg-[#485320] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.actionButton.label || 'فتح الرابط'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          const tab = item.actionButton?.target || item.linkTab!;
                          const param = item.linkParam;
                          onNavigateTab(tab, param);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#59662C] hover:bg-[#485320] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.actionButton?.label || 'الانتقال للمحتوى'}</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

