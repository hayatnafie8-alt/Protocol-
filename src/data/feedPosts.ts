/**
 * Feed & Posts System Data Manager
 * Stores social-style clinical announcements, tips, and updates posted by Admin/Supervisor
 * Manages post creation, deletion, pinning, and real-time subscriber reactions (Like / Dislike).
 */

export interface FeedPost {
  id: string;
  authorName: string;
  authorRole: 'admin';
  authorTitle: string;
  createdAt: string;
  timestamp: number;
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
  likesCount: number;
  dislikesCount: number;
  // Map of userId -> 'like' | 'dislike'
  reactions: Record<string, 'like' | 'dislike'>;
}

const STORAGE_KEY = 'dental_community_feed_posts';
const PROTOCOL_POSTS_KEY = 'protocol_posts';
const USER_DEVICE_ID_KEY = 'dental_client_device_id';

/**
 * Get or create a persistent unique user ID for reaction tracking
 */
export function getPersistentUserId(subscriberEmail?: string): string {
  if (subscriberEmail && subscriberEmail.trim().length > 0) {
    return `sub_${subscriberEmail.trim().toLowerCase()}`;
  }
  try {
    let deviceId = localStorage.getItem(USER_DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'dev_anonymous_user';
  }
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-pinned-welcome',
    authorName: 'د. حياة نافع فجر',
    authorRole: 'admin',
    authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
    createdAt: 'اليوم، 09:00 ص',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    content: `أهلاً وسهلاً بجميع أطباء وطلبة طب الأسنان الأعزاء في المنصة التعليمية السريرية 🦷✨

يسعدنا إطلاق أحدث نسخة من "أطلس المهارات السريرية 4K" ودليل بروتوكولات حشوات الكومبوزيت خطوة بخطوة. نهدف دائماً إلى ربط الجانب النظري بالواقع العملي والسريري المباشر.

شاركوا تفاعلكم وملاحظاتكم، ونتمنى لكم رحلة تدريبية وسريرية موفقة ومتميزة!`,
    isPinned: true,
    likesCount: 16,
    dislikesCount: 0,
    reactions: {},
  },
  {
    id: 'post-clinical-tip-c-factor',
    authorName: 'د. حياة نافع فجر',
    authorRole: 'admin',
    authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
    createdAt: 'أمس، 05:30 م',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    content: `💡 نصيحة سريرية ذهبية لتجنب الحساسية بعد حشوات الكومبوزيت (Post-op Sensitivity):

1. في حفر كلاس 2 (Class II)، قم دائماً ببناء الجدار الملاصق (Proximal Wall) أولاً بسماكة 1 ملم لتحويل الكافتي إلى Class I.
2. لا تقم بتكديس الكومبوزيت دفعة واحدة أفقياً؛ بل اعتمد التكديس المائل الهرمي (Oblique Layering) لتخفيض معامل C-Factor وتجنب انكماش البلمرة على الحواف.
3. التقطيع والإنهاء بمبرد خاص تحت التبريد المائي المستمر يمنع حدوث Micro-cracks في الميناء.`,
    isPinned: false,
    likesCount: 24,
    dislikesCount: 1,
    reactions: {},
  },
];

export function getFeedPosts(): FeedPost[] {
  try {
    const raw = localStorage.getItem(PROTOCOL_POSTS_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Return sorted: pinned first, then newest first
        return parsed.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });
      }
    }
  } catch (err) {
    console.error('Failed to parse feed posts:', err);
  }
  // Initialize with defaults if empty
  saveFeedPosts(INITIAL_POSTS);
  return INITIAL_POSTS;
}

export function saveFeedPosts(posts: FeedPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    localStorage.setItem(PROTOCOL_POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save feed posts:', err);
  }
}

/**
 * Create a new feed post (Admin Only)
 */
export function createFeedPost(data: {
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
}): FeedPost[] {
  const current = getFeedPosts();
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newPost: FeedPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    authorName: 'د. حياة نافع فجر',
    authorRole: 'admin',
    authorTitle: 'المشرف العام | أخصائية طب الأسنان الترميمي',
    createdAt: timeFormatted,
    timestamp: Date.now(),
    content: data.content.trim(),
    imageUrl: data.imageUrl?.trim() || undefined,
    isPinned: !!data.isPinned,
    likesCount: 0,
    dislikesCount: 0,
    reactions: {},
  };

  const updated = [newPost, ...current];
  saveFeedPosts(updated);
  return getFeedPosts();
}

/**
 * Delete a feed post (Admin Only)
 */
export function deleteFeedPost(postId: string): FeedPost[] {
  const current = getFeedPosts();
  const updated = current.filter((p) => p.id !== postId);
  saveFeedPosts(updated);
  return updated;
}

/**
 * Toggle pin status of a post (Admin Only)
 */
export function togglePinFeedPost(postId: string): FeedPost[] {
  const current = getFeedPosts();
  const updated = current.map((p) => {
    if (p.id === postId) {
      return { ...p, isPinned: !p.isPinned };
    }
    return p;
  });
  saveFeedPosts(updated);
  return getFeedPosts();
}

/**
 * Toggle or change reaction (Like or Dislike) for a specific user.
 * Real-time atomic increment/decrement and single-vote enforcement.
 */
export function toggleFeedPostReaction(
  postId: string,
  userId: string,
  reactionType: 'like' | 'dislike'
): { updatedPosts: FeedPost[]; userReaction: 'like' | 'dislike' | null } {
  const current = getFeedPosts();
  let resultingReaction: 'like' | 'dislike' | null = null;

  const updated = current.map((post) => {
    if (post.id !== postId) return post;

    const reactions = { ...(post.reactions || {}) };
    let likes = post.likesCount || 0;
    let dislikes = post.dislikesCount || 0;
    const existingReaction = reactions[userId];

    if (existingReaction === reactionType) {
      // User tapped the same button: remove reaction (toggle off)
      delete reactions[userId];
      if (reactionType === 'like') {
        likes = Math.max(0, likes - 1);
      } else {
        dislikes = Math.max(0, dislikes - 1);
      }
      resultingReaction = null;
    } else {
      // Switching or first-time vote
      if (existingReaction === 'like') {
        likes = Math.max(0, likes - 1);
      } else if (existingReaction === 'dislike') {
        dislikes = Math.max(0, dislikes - 1);
      }

      reactions[userId] = reactionType;
      if (reactionType === 'like') {
        likes += 1;
      } else {
        dislikes += 1;
      }
      resultingReaction = reactionType;
    }

    return {
      ...post,
      likesCount: likes,
      dislikesCount: dislikes,
      reactions,
    };
  });

  saveFeedPosts(updated);
  return {
    updatedPosts: updated,
    userReaction: resultingReaction,
  };
}
