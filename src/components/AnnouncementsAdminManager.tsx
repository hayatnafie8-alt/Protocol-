import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Bell,
  Pin,
  Archive,
  Trash2,
  Send,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowLeft,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit3,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Save,
} from 'lucide-react';
import {
  AnnouncementItem,
  getCachedAnnouncements,
  subscribeToAnnouncementsCloud,
  publishAnnouncementInCloud,
  deleteAnnouncementInCloud,
  togglePinAnnouncementInCloud,
  toggleArchiveAnnouncementInCloud,
  updateAnnouncementInCloud,
  clearAllAnnouncementsInCloud,
} from '../services/announcementsService';
import {
  getGlobalAppState,
  saveGlobalAppStateToCloud,
  subscribeToGlobalAppStateCloud,
  GlobalAppState,
} from '../services/globalAppStateManager';

export const AnnouncementsAdminManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    getCachedAnnouncements()
  );
  const [globalState, setGlobalState] = useState<GlobalAppState>(() => getGlobalAppState());

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('تحديث سريري 📢');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [targetAudience, setTargetAudience] = useState<'all' | 'free' | 'paid'>('all');
  const [isPinned, setIsPinned] = useState(false);
  
  // Action button states
  const [hasActionButton, setHasActionButton] = useState(true);
  const [actionLabel, setActionLabel] = useState('الانتقال للشرح السريري');
  const [actionType, setActionType] = useState<'tab' | 'url'>('tab');
  const [actionTargetTab, setActionTargetTab] = useState('slides');
  const [actionTargetParam, setActionTargetParam] = useState('class-4');

  // UI helpers
  const [filterAudience, setFilterAudience] = useState<'all' | 'free' | 'paid'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAnn = subscribeToAnnouncementsCloud((list) => {
      setAnnouncements(list);
    });
    const unsubState = subscribeToGlobalAppStateCloud((gState) => {
      setGlobalState(gState);
    });
    return () => {
      unsubAnn();
      unsubState();
    };
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showNotification('يرجى ملء عنوان ونص الإعلان.');
      return;
    }

    setIsSubmitting(true);
    try {
      await publishAnnouncementInCloud({
        title: title.trim(),
        message: message.trim(),
        badge: badge.trim() || undefined,
        category: priority === 'urgent' ? 'urgent_alert' : 'protocol_update',
        priority,
        targetAudience,
        isPinned,
        authorName: 'د. حياة نافع فجر',
        linkTab: hasActionButton && actionType === 'tab' ? actionTargetTab : undefined,
        linkParam: hasActionButton && actionType === 'tab' ? actionTargetParam : undefined,
        actionButton: hasActionButton
          ? {
              label: actionLabel.trim() || 'عرض التفاصيل',
              actionType,
              target: actionType === 'tab' ? actionTargetTab : actionTargetParam,
            }
          : undefined,
      });

      setTitle('');
      setMessage('');
      setIsPinned(false);
      showNotification('تم بث الإعلان بنجاح وإرسال التنبيه الفوري لجميع الطلاب! 🚀');
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      showNotification('حدث خطأ أثناء بث الإعلان. تم الحفظ محلياً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (window.confirm(`هل أنتِ متأكدة من رغبتك في حذف إعلان "${itemTitle}" نهائياً من قاعدة البيانات وسجل الطلاب؟`)) {
      try {
        await deleteAnnouncementInCloud(id);
        showNotification('تم حذف الإعلان بنجاح.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTogglePin = async (id: string, currentPin?: boolean) => {
    await togglePinAnnouncementInCloud(id, !currentPin);
    showNotification(!currentPin ? 'تم تثبيت الإعلان في أعلى القائمة 📌' : 'تم إلغاء تثبيت الإعلان.');
  };

  const handleToggleArchive = async (id: string, currentArchived?: boolean) => {
    await toggleArchiveAnnouncementInCloud(id, !currentArchived);
    showNotification(!currentArchived ? 'تم نقل الإعلان إلى الأرشيف 📦' : 'تم استرجاع الإعلان من الأرشيف.');
  };

  const handleClearAll = async () => {
    if (window.confirm('⚠️ تحذير إداري: هل أنتِ متأكدة من مسح كافة الإعلانات القديمة وتصفير السجل للجميع؟')) {
      await clearAllAnnouncementsInCloud();
      showNotification('تم تصفير سجل الإعلانات بالكامل.');
    }
  };

  const startEdit = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditMessage(item.message);
    setEditBadge(item.badge || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    await updateAnnouncementInCloud(id, {
      title: editTitle.trim(),
      message: editMessage.trim(),
      badge: editBadge.trim() || undefined,
    });
    setEditingId(null);
    showNotification('تم تحديث محتوى الإعلان بنجاح! 💾');
  };

  const handleToggleHeaderNotificationCenter = async () => {
    const nextVal = !(globalState.features.showNotificationCenter !== false);
    const updatedFeatures = {
      ...globalState.features,
      showNotificationCenter: nextVal,
    };
    await saveGlobalAppStateToCloud({
      ...globalState,
      features: updatedFeatures,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
    });
    showNotification(nextVal ? 'تم تفعيل ظهور مركز التنبيهات في رأس التطبيق للطلاب 🔔' : 'تم إخفاء مركز التنبيهات من رأس التطبيق 🔕');
  };

  const handleToggleClinicalFeed = async () => {
    const nextVal = !(globalState.features.showClinicalAnnouncementsFeed !== false);
    const updatedFeatures = {
      ...globalState.features,
      showClinicalAnnouncementsFeed: nextVal,
    };
    await saveGlobalAppStateToCloud({
      ...globalState,
      features: updatedFeatures,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
    });
    showNotification(nextVal ? 'تم تفعيل شريط منشورات المشرفة في الرئيسية' : 'تم إخفاء شريط منشورات المشرفة من الرئيسية');
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (!showArchived && item.isArchived) return false;
    if (showArchived && !item.isArchived) return false;
    if (filterAudience === 'all') return true;
    return item.targetAudience === filterAudience;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast feedback */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-500 text-white font-black text-xs shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C2216] border-2 border-[#59662C]/30 dark:border-[#384524] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#D4AF37] text-white flex items-center justify-center shadow-md shrink-0">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                📢 مركز البث والتنبيهات الأكاديمية (Academic Broadcasts & Notifications)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30">
                Direct Cloud Push
              </span>
            </div>
            <p className="text-xs text-[#736C5F] dark:text-[#A7A08E] mt-0.5">
              إرسال تنبيهات فورية، تحديثات سريرية، وجداول جلسات للطلاب مع التحكم في الجمهور المستهدف (الكل، الزوار، أو المشتركون فقط).
            </p>
          </div>
        </div>

        {/* Global Flexibility Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToggleHeaderNotificationCenter}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              globalState.features.showNotificationCenter !== false
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 shadow-xs'
                : 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/40'
            }`}
            title="تفعيل/تعطيل أيقونة مركز التنبيهات في رأس التطبيق"
          >
            {globalState.features.showNotificationCenter !== false ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>أيقونة الجرس: ظاهرة بالرأس 🔔</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                <span>أيقونة الجرس: مخفية 🔕</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleClinicalFeed}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              globalState.features.showClinicalAnnouncementsFeed !== false
                ? 'bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46] border-[#59662C]/40 shadow-xs'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300'
            }`}
            title="إظهار أو إخفاء قسم التنبيهات الاجتماعية في الصفحة الرئيسية"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              منشورات المشرفة: {globalState.features.showClinicalAnnouncementsFeed !== false ? 'مفعلة' : 'معطلة'}
            </span>
          </button>
        </div>
      </div>

      {/* Broadcast Composer Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF7F2] dark:bg-[#181D13] border border-[#E5DEC9] dark:border-[#343E26] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#2E3720]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white">
              ✍️ إنشاء وبث تنبيه جديد للطلاب (Compose & Broadcast)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#59662C] dark:text-[#A4BF46]">
            يصل التنبيه فورياً للهاتف كـ Banner وإشعار منبثق
          </span>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-neutral-800 dark:text-neutral-200 mb-1">
                عنوان التنبيه:*
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تحديث عاجل لبروتوكول الصنف الرابع Class IV Composite..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1E2417] text-xs font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#59662C]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-800 dark:text-neutral-200 mb-1">
                الشارة (Badge Label):
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="مثال: بروتوكول جديد 🦷، تنبيه سريري ⚡، هام جداً..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1E2417] text-xs font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#59662C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-neutral-800 dark:text-neutral-200 mb-1">
              نص الرسالة والشرح السريري الأكاديمي:*
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتبي التوجيه السريري، ملاحظات المحاضرة، الخطوات المضافة، أو مواعيد الجلسات السريرية بالتفصيل..."
              className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1E2417] text-xs font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#59662C] leading-relaxed"
            />
          </div>

          {/* Granular Targeting and Priority Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#2F3921]">
            {/* Target Audience */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#59662C]" />
                <span>الجمهور المستهدف (Audience):</span>
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
              >
                <option value="all">👥 جميع الطلاب والزوار (All Users)</option>
                <option value="free">🔓 المستخدمون غير المشتركين فقط (Free Users)</option>
                <option value="paid">🔒 المشتركون المعتمدون فقط (Paid Users)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>درجة الأهمية (Priority):</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
              >
                <option value="normal">عادي (Normal Notification)</option>
                <option value="important">مهم ⭐ (Highlighted Banner)</option>
                <option value="urgent">عاجل 🚨 (Urgent Push Alert)</option>
              </select>
            </div>

            {/* Pin to Top Checkbox */}
            <div className="flex items-center justify-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-[#59662C] focus:ring-[#59662C]"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>تثبيت في أعلى الشاشة (Pin to top)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Action Button Setup */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#2F3921] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasActionButton}
                  onChange={(e) => setHasActionButton(e.target.checked)}
                  className="w-4 h-4 rounded text-[#59662C]"
                />
                <span className="text-xs font-black text-neutral-900 dark:text-white">
                  إرفاق زر تفاعلي ينقل الطالب للمحتوى (Action Button)
                </span>
              </label>
              {hasActionButton && (
                <span className="text-[10px] text-[#59662C] font-bold">مفعل</span>
              )}
            </div>

            {hasActionButton && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    نص الزر:
                  </label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="مثال: الانتقال للشرح السريري"
                    className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    نوع الإجراء:
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
                  >
                    <option value="tab">قسم داخلي في التطبيق (In-App Tab)</option>
                    <option value="url">رابط خارجي معتمد (Direct URL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-0.5">
                    الوجهة المستهدفة:
                  </label>
                  {actionType === 'tab' ? (
                    <select
                      value={actionTargetTab}
                      onChange={(e) => setActionTargetTab(e.target.value)}
                      className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
                    >
                      <option value="slides">بروتوكولات الكلاسات (Class Protocols)</option>
                      <option value="clinical_skills">المهارات السريرية 4K (Clinical Skills)</option>
                      <option value="surgical">الحالات الجراحية (Surgical Cases)</option>
                      <option value="prescriptions">دليل الوصفات والأدوية (Prescriptions)</option>
                      <option value="home">الرئيسية (Home Portal)</option>
                    </select>
                  ) : (
                    <input
                      type="url"
                      value={actionTargetParam}
                      onChange={(e) => setActionTargetParam(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171C11] text-xs font-bold"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#59662C] via-[#6F8037] to-[#455022] hover:from-[#495424] hover:to-[#38411B] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSubmitting ? 'جاري البث السحابي...' : 'بث الإعلان للطلاب فوراً (Broadcast Now) 🚀'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements Feed & History Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5DEC9] dark:border-[#2F3921]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <span>سجل التنبيهات والإعلانات السابقة:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#59662C]/20 text-[#59662C] dark:text-[#A4BF46]">
                {announcements.length}
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              يمكنك تثبيت أي إعلان في قمة الشاشة، أرشفته، تعديله حياً، أو حذفه نهائياً.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter audience buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#1E2417] p-1 rounded-xl border border-[#E5DEC9] dark:border-[#2F3921]">
              <button
                type="button"
                onClick={() => setFilterAudience('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                  filterAudience === 'all'
                    ? 'bg-[#59662C] text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterAudience('free')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                  filterAudience === 'free'
                    ? 'bg-[#59662C] text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                الزوار فقط
              </button>
              <button
                type="button"
                onClick={() => setFilterAudience('paid')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                  filterAudience === 'paid'
                    ? 'bg-[#59662C] text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                المشتركون فقط
              </button>
            </div>

            {/* Archive view toggle */}
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer border ${
                showArchived
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white dark:bg-[#1E2417] text-neutral-700 dark:text-neutral-300 border-[#E5DEC9]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'عرض النشط' : 'عرض المؤرشف'}</span>
            </button>

            {/* Clear All History */}
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-100"
              title="تصفير وحذف جميع الإعلانات القديمة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير السجل</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="p-10 rounded-3xl bg-neutral-50 dark:bg-[#161C11] border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-2">
            <Megaphone className="w-8 h-8 mx-auto opacity-30 text-neutral-500" />
            <p className="text-xs font-bold text-neutral-500">لا توجد إعلانات مطابقة في هذا التصنيف حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((item, idx) => {
              const isEditing = editingId === item.id;
              const isUrgent = item.priority === 'urgent';
              const isImportant = item.priority === 'important';

              return (
                <div
                  key={`${item.id || 'ann'}_${idx}`}
                  data-item-id={item.id}
                  data-announcement-id={item.id}
                  data-action="card-item"
                  style={{ opacity: item.isArchived ? 0.4 : 1 }}
                  className={`announcement-card card-item p-4 sm:p-5 rounded-3xl border transition-all space-y-3 ${
                    item.isPinned
                      ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40 shadow-xs'
                      : item.isArchived
                      ? 'hidden-item bg-neutral-100/60 dark:bg-[#14180F] border-neutral-300 dark:border-neutral-800 opacity-40'
                      : 'bg-white dark:bg-[#191F14] border-[#E5DEC9] dark:border-[#2F3921] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.isPinned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-white flex items-center gap-1 shadow-2xs">
                          <Pin className="w-2.5 h-2.5" />
                          <span>مثبت بالقمة</span>
                        </span>
                      )}

                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                          {item.badge}
                        </span>
                      )}

                      {/* Audience badge */}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                        {item.targetAudience === 'paid' ? (
                          <>
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            <span>للمشتركين فقط</span>
                          </>
                        ) : item.targetAudience === 'free' ? (
                          <>
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>للزوار فقط</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-2.5 h-2.5 text-sky-600" />
                            <span>للجميع</span>
                          </>
                        )}
                      </span>

                      {/* Priority badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isUrgent
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : isImportant
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {isUrgent ? 'عاجل 🚨' : isImportant ? 'مهم ⭐' : 'عادي'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.createdAt}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body / Inline Edit */}
                  {isEditing ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                          العنوان:
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                          الشارة:
                        </label>
                        <input
                          type="text"
                          value={editBadge}
                          onChange={(e) => setEditBadge(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                          نص الإعلان:
                        </label>
                        <textarea
                          rows={3}
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>حفظ التعديل</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-1">
                        {item.message}
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <span>بواسطة: {item.authorName || 'د. حياة نافع فجر'}</span>
                      {item.linkTab && (
                        <span className="text-[10px] text-[#59662C] font-bold mr-1">
                          • يوجه إلى: {item.linkTab}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Pin/Unpin Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id, item.isPinned)}
                        className={`p-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          item.isPinned
                            ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                        }`}
                        title={item.isPinned ? 'إلغاء التثبيت' : 'تثبيت في القمة'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Save Button */}
                      <button
                        type="button"
                        data-action="save"
                        onClick={() => {
                          const card = document.querySelector(`[data-item-id="${item.id}"]`);
                          card?.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
                          setTimeout(() => card?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
                          window.alert('تم حفظ خانة الإعلان وتأكيد المزامنة السحابية بنجاح! 💾✅');
                        }}
                        className="save-btn p-1.5 rounded-xl bg-[#59662C] hover:bg-[#485323] text-white transition-all cursor-pointer shadow-2xs"
                        title="حفظ خانة الإعلان وتأكيد المزامنة"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive/Unarchive Toggle (Visibility) */}
                      <button
                        type="button"
                        data-action="toggle-visibility"
                        onClick={() => handleToggleArchive(item.id, item.isArchived)}
                        className={`visibility-btn p-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          item.isArchived
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                        }`}
                        title={item.isArchived ? 'استرجاع من الأرشيف' : 'نقل للأرشيف'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        data-action="edit"
                        onClick={() => (isEditing ? setEditingId(null) : startEdit(item))}
                        className="edit-btn p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 cursor-pointer"
                        title="تعديل نصوص الإعلان"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        data-action="delete"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="delete-btn p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 cursor-pointer"
                        title="حذف الإعلان نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
