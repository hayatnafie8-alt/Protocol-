import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Pin,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  Maximize2,
  Calendar,
  Share2,
} from 'lucide-react';
import {
  FeedPost,
  getFeedPosts,
  getPersistentUserId,
} from '../data/feedPosts';
import {
  subscribeToFeedPostsCloud,
  createFeedPostInCloud,
  deleteFeedPostInCloud,
  togglePinFeedPostInCloud,
  toggleFeedPostReactionInCloud,
} from '../services/realTimeSyncService';
import { DoctorProfileAvatar } from './DoctorProfileAvatar';
import { ToothFavoriteButton } from './ToothFavoriteButton';
import {
  getStoredBookmarks,
  toggleBookmarkItem,
} from '../data/bookmarksManager';

interface HomeFeedPostsProps {
  isAdmin: boolean;
  subscriberEmail?: string;
  isSubscriberLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const HomeFeedPosts: React.FC<HomeFeedPostsProps> = ({
  isAdmin,
  subscriberEmail,
  isSubscriberLoggedIn = false,
  onRequireLogin,
}) => {
  const [posts, setPosts] = useState<FeedPost[]>(() => getFeedPosts());
  const [currentUserId] = useState<string>(() => getPersistentUserId(subscriberEmail));

  // Admin post creation form state
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Deletion confirm modal state
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Image lightbox view
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Student Favorites Bookmarks State (Official Tooth Icon)
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(() => {
    const list = getStoredBookmarks();
    return new Set(list.filter((b) => b.category === 'post').map((b) => b.id));
  });

  useEffect(() => {
    const handleBookmarkChange = () => {
      const list = getStoredBookmarks();
      setBookmarkedPostIds(new Set(list.filter((b) => b.category === 'post').map((b) => b.id)));
    };
    window.addEventListener('app-bookmarks-updated', handleBookmarkChange);
    return () => window.removeEventListener('app-bookmarks-updated', handleBookmarkChange);
  }, []);

  const handleToggleBookmark = (post: FeedPost) => {
    const isNowBookmarked = toggleBookmarkItem({
      id: post.id,
      title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
      subtitle: `${post.authorName} • منشور إكلينيكي`,
      category: 'post',
      categoryLabel: 'منشور سريري',
      specialty: 'Operative',
      tags: ['منشور', 'تحديث', 'د. حياه'],
      targetTab: 'home',
      clinicalKeyPoint: post.content,
    });
    setBookmarkedPostIds((prev) => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(post.id);
      else next.delete(post.id);
      return next;
    });
  };

  // Real-time Cloud Firestore Pub/Sub Listener (Zero Delay)
  useEffect(() => {
    const unsubscribe = subscribeToFeedPostsCloud((cloudPosts) => {
      setPosts(cloudPosts);
    });

    const handleSync = () => {
      const cached = getFeedPosts();
      if (cached && cached.length > 0) {
        setPosts(cached);
      }
    };

    window.addEventListener('app-global-state-sync', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('app-global-state-sync', handleSync);
    };
  }, []);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorNotice('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت.');
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const trimmed = postContent.trim();
    if (!trimmed) {
      setErrorNotice('يرجى كتابة محتوى المنشور قبل النشر.');
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const postPayload: any = {
        authorName: 'د. حياة نافع فجر',
        authorRole: 'admin',
        authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
        content: trimmed,
        isPinned,
      };

      const finalImage = imagePreview || imageUrl.trim();
      if (finalImage) {
        postPayload.imageUrl = finalImage;
      }

      const created = await createFeedPostInCloud(
        postPayload,
        true // Triggers real-time broadcast notification!
      );

      // Instant optimistic UI re-render on home feed without manual refresh
      setPosts((prev) => {
        const filtered = prev.filter((p) => p.id !== created.id);
        const nextList = [created, ...filtered];
        return nextList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });
      });

      setPostContent('');
      setImageUrl('');
      setImagePreview(null);
      setIsPinned(false);
      setShowImageInput(false);
      showNotice('تم نشر المنشور وبث الإشعار لجميع المشتركين بنجاح 📢✨');
    } catch (err) {
      console.error(err);
      setErrorNotice('تعذر نشر المنشور، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) return;
    try {
      // Optimistic instant removal
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      await deleteFeedPostInCloud(postId);
      setPostToDelete(null);
      showNotice('تم حذف المنشور بنجاح.');
    } catch (err) {
      console.error(err);
      setErrorNotice('تعذر حذف المنشور.');
    }
  };

  const handleTogglePin = async (postId: string) => {
    if (!isAdmin) return;
    const target = posts.find((p) => p.id === postId);
    if (!target) return;
    const newPinned = !target.isPinned;
    try {
      await togglePinFeedPostInCloud(postId, newPinned);
      showNotice(newPinned ? 'تم تثبيت المنشور في أعلى الخلاصة 📌' : 'تم إلغاء تثبيت المنشور.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReaction = async (postId: string, reactionType: 'like' | 'dislike') => {
    const effectiveUserId = subscriberEmail ? `sub_${subscriberEmail}` : currentUserId;
    const target = posts.find((p) => p.id === postId);
    if (!target) return;

    try {
      await toggleFeedPostReactionInCloud(postId, effectiveUserId, reactionType, target);
      showNotice(reactionType === 'like' ? 'تم تسجيل إعجابك بالمنشور 👍' : 'تم تسجيل تقييمك 👎');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="space-y-6">
      {/* Toast Notification */}
      {feedbackNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#2F2B24] dark:bg-[#1E2417] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{feedbackNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{errorNotice}</span>
        </div>
      )}

      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-6 rounded-full bg-[#596628] dark:bg-[#A8C24E]" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
              <span>خلاصة التحديثات والإعلانات السريرية</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#596628]/15 text-[#596628] dark:text-[#A8C24E]">
                الرئيسية
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#736C5F] dark:text-[#A7A08E] mt-0.5">
              إرشادات سريرية مباشرة وتنبيهات فورية من المشرفة د. حياة نافع فجر لجميع المشتركين
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-black self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>لوحة نشر المشرف مفعلة (Admin)</span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 1. ADMIN FEED MANAGEMENT: CREATE POST (VISIBLE ONLY TO ADMIN) */}
      {/* ============================================================ */}
      {isAdmin && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A2014] border-2 border-[#596628]/40 dark:border-[#384524] shadow-md transition-all hover:border-[#596628]">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5DEC9] dark:border-[#343E26]">
            <div className="flex items-center gap-3">
              <DoctorProfileAvatar
                size="md"
                showBadge={true}
                className="ring-2 ring-[#596628]/30 shadow-xs"
              />
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                  <span>إضافة منشور جديد للمشتركين</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#596628] text-white">
                    المشرف
                  </span>
                </h3>
                <p className="text-[11px] text-[#7A7466] dark:text-[#9A9382]">
                  سيظهر المنشور فوراً في أعلى الشاشة الرئيسية لجميع الأطباء والطلبة المشتركين
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer select-none transition-all ${
                  isPinned
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                }`}
                title="تثبيت المنشور في أول القائمة دائماً"
              >
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="hidden"
                />
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>تثبيت في الأعلى</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            {/* Post Content Textarea */}
            <div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="اكتب إعلاناً، نصيحة سريرية، أو تحديثاً لبروتوكولات الترميم والحالات..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-sm text-[#2F2B24] dark:text-[#F3EFE6] placeholder-[#8A8476] dark:placeholder-[#6C765E] focus:outline-none focus:ring-2 focus:ring-[#596628] transition-all resize-y min-h-[90px]"
              />
            </div>

            {/* Attached Image Preview (if present) */}
            {(imagePreview || imageUrl) && (
              <div className="relative rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#343E26] bg-black/5 p-2">
                <div className="relative max-h-64 overflow-hidden rounded-xl bg-neutral-900 flex items-center justify-center">
                  <img
                    src={imagePreview || imageUrl}
                    alt="معاينة المرفق"
                    className="max-h-64 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="حذف الصورة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar (Upload Image / URL Image & Submit) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* File Upload from Device Gallery */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#20271A] hover:bg-[#F0EAE0] dark:hover:bg-[#28321E] text-[#596628] dark:text-[#A8C24E] border border-[#E5DEC9] dark:border-[#343E26] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>إرفاق صورة من المعرض</span>
                </button>

                {/* Image URL Toggle */}
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#20271A] hover:bg-[#F0EAE0] dark:hover:bg-[#28321E] text-neutral-700 dark:text-neutral-300 border border-[#E5DEC9] dark:border-[#343E26] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>رابط صورة مباشر</span>
                </button>
              </div>

              {/* Submit Post Button */}
              <button
                type="submit"
                disabled={isSubmitting || !postContent.trim()}
                className="px-5 py-2.5 rounded-2xl bg-[#596628] hover:bg-[#485320] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>نشر المنشور الآن</span>
              </button>
            </div>

            {/* URL Input field if toggled */}
            {showImageInput && (
              <div className="pt-2 animate-in fade-in duration-150">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setImagePreview(null);
                    }
                  }}
                  placeholder="https://example.com/clinical-case-photo.jpg"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#20271A] border border-[#E5DEC9] dark:border-[#343E26] text-xs text-[#2F2B24] dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#596628]"
                />
              </div>
            )}
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUBSCRIBER FEED INTERACTION & SOCIAL POST CARDS           */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1A2014] border border-[#E5DEC9] dark:border-[#343E26] space-y-2">
            <Sparkles className="w-8 h-8 text-[#596628] dark:text-[#A8C24E] mx-auto opacity-60" />
            <h3 className="text-sm font-bold text-[#2F2B24] dark:text-white">
              لا توجد منشورات حالياً في لوحة الإعلانات
            </h3>
            <p className="text-xs text-neutral-500">
              {isAdmin
                ? 'يمكنكِ كتابة المنشور الأول للمشتركين عبر النموذج أعلاه.'
                : 'سيتم نشر التحديثات والإعلانات السريرية قريباً من قبل المشرف.'}
            </p>
          </div>
        ) : (
          posts.map((post, pIdx) => {
            const effectiveUserId = subscriberEmail ? `sub_${subscriberEmail}` : currentUserId;
            const userReaction = post.reactions?.[effectiveUserId] || null;
            const hasLiked = userReaction === 'like';
            const hasDisliked = userReaction === 'dislike';

            return (
              <article
                key={`${post.id}_${pIdx}`}
                className={`relative rounded-3xl bg-white dark:bg-[#1A2014] border transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden ${
                  post.isPinned
                    ? 'border-amber-400/80 dark:border-amber-600/70 ring-1 ring-amber-400/40 bg-gradient-to-b from-amber-50/20 to-white dark:from-[#212616] dark:to-[#1A2014]'
                    : 'border-[#E5DEC9] dark:border-[#343E26]'
                }`}
              >
                {/* Pinned Post Header Banner */}
                {post.isPinned && (
                  <div className="px-5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                    <span>منشور مثبت في أعلى الصفحة (Pinned Announcement)</span>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Post Author & Timestamp Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <DoctorProfileAvatar
                        size="md"
                        showBadge={true}
                        className="ring-2 ring-[#596628]/30 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white">
                            {post.authorName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#596628] text-white shadow-2xs">
                            المشرف
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#7A7466] dark:text-[#9A9382] mt-0.5">
                          <span className="hidden sm:inline">{post.authorTitle}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#596628]" />
                            <span>{post.createdAt}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* One-tap Tooth Favorite Icon */}
                      <ToothFavoriteButton
                        isBookmarked={bookmarkedPostIds.has(post.id)}
                        onToggle={() => handleToggleBookmark(post)}
                        size="sm"
                        variant="icon"
                        title="حفظ المنشور في المفضلة 🦷"
                      />

                      {/* Admin Action Menu: Pin & Delete (STRICT ROLE SECURITY: HIDDEN FROM SUBSCRIBERS) */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-neutral-100 dark:bg-[#20271A] p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                          {/* Toggle Pin Button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePin(post.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              post.isPinned
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                            title={post.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${post.isPinned ? 'fill-current' : ''}`} />
                          </button>

                          {/* Delete Post Button */}
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post.id)}
                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="حذف المنشور (المشرف فقط)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-sm sm:text-base text-[#2F2B24] dark:text-[#F3EFE6] leading-relaxed whitespace-pre-line font-medium pr-1">
                    {post.content}
                  </div>

                  {/* Optional Post Image */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#343E26] bg-neutral-900/5 dark:bg-black/20">
                      <div
                        onClick={() => setPreviewModalImage(post.imageUrl!)}
                        className="relative cursor-pointer group flex items-center justify-center max-h-[460px] overflow-hidden bg-neutral-950"
                      >
                        <img
                          src={post.imageUrl}
                          alt="صورة المنشور السريري"
                          className="w-full max-h-[460px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير الصورة عالية الدقة</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* REACTIONS SECTION: LIKE 👍 & DISLIKE 👎 & FAVORITES 🦷       */}
                  {/* ============================================================ */}
                  <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* One-tap Tooth Favorite Button */}
                      <ToothFavoriteButton
                        isBookmarked={bookmarkedPostIds.has(post.id)}
                        onToggle={() => handleToggleBookmark(post)}
                        size="sm"
                        variant="badge"
                        label="حفظ في المفضلة"
                      />

                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleReaction(post.id, 'like')}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                          hasLiked
                            ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                            : 'bg-neutral-100 dark:bg-[#20271A] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-300 hover:text-emerald-700 border border-neutral-200 dark:border-neutral-700/60'
                        }`}
                        title="إبداء الإعجاب بالمنشور"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>أعجبني</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            hasLiked ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {post.likesCount || 0}
                        </span>
                      </button>

                      {/* Dislike Button */}
                      <button
                        type="button"
                        onClick={() => handleReaction(post.id, 'dislike')}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                          hasDisliked
                            ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                            : 'bg-neutral-100 dark:bg-[#20271A] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-700 dark:text-neutral-300 hover:text-rose-700 border border-neutral-200 dark:border-neutral-700/60'
                        }`}
                        title="لم يعجبني"
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-current' : ''}`} />
                        <span>لم يعجبني</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            hasDisliked ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {post.dislikesCount || 0}
                        </span>
                      </button>
                    </div>

                    {/* Reaction status note */}
                    <div className="text-[11px] text-[#7A7466] dark:text-[#9A9382] flex items-center gap-1">
                      {hasLiked && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>لقد سجّلت إعجابك بهذا المنشور</span>
                        </span>
                      )}
                      {hasDisliked && (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>لقد قيّمت المنشور بـ (لم يعجبني)</span>
                        </span>
                      )}
                      {!hasLiked && !hasDisliked && (
                        <span>تفاعل برأيك السريري حول المنشور</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MODALS: CONFIRM DELETE & IMAGE LIGHTBOX                   */}
      {/* ============================================================ */}

      {/* Delete Confirmation Modal (Admin Only) */}
      {postToDelete && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1A2014] rounded-3xl p-6 border-2 border-rose-300 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  تأكيد حذف المنشور
                </h3>
                <p className="text-xs text-neutral-500">
                  هل أنتِ متأكدة من حذف هذا المنشور نهائياً من الخلاصة الرئيسية؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleDeletePost(postToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                نعم، احذف المنشور
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Viewer Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-12 left-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImage}
              alt="معاينة الصورة بالحجم الكامل"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
};
