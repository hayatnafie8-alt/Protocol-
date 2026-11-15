import React, { useState } from 'react';
import { AppSection, updateSection } from '../data/sectionsManager';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Calendar,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CustomSectionViewProps {
  section: AppSection;
  isAuthorAdmin: boolean;
  onBack: () => void;
  onSectionUpdated?: (updated: AppSection) => void;
}

interface CustomPostItem {
  id: string;
  title: string;
  date: string;
  content: string;
  author: string;
  badge?: string;
}

export const CustomSectionView: React.FC<CustomSectionViewProps> = ({
  section,
  isAuthorAdmin,
  onBack,
  onSectionUpdated,
}) => {
  const [items, setItems] = useState<CustomPostItem[]>(() => {
    try {
      const raw = localStorage.getItem(`dental_custom_sec_items_${section.id}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: '1',
        title: `محتوى تمهيدي لقسم: ${section.title}`,
        date: new Date().toLocaleDateString('ar-EG'),
        content: section.description || 'محتوى سريري تدريبي قيد التحديث من قبل المشرفة د. حياة نافع فجر.',
        author: 'د. حياه نافع فجر',
        badge: section.badgeText || 'إعلان سريري',
      },
    ];
  });

  const [showAddPost, setShowAddPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postBadge, setPostBadge] = useState('');

  const saveItems = (newItems: CustomPostItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(`dental_custom_sec_items_${section.id}`, JSON.stringify(newItems));
    } catch {}
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newItem: CustomPostItem = {
      id: Date.now().toString(),
      title: postTitle.trim(),
      date: new Date().toLocaleDateString('ar-EG'),
      content: postContent.trim(),
      author: 'د. حياه نافع فجر',
      badge: postBadge.trim() || 'منشور جديد',
    };

    saveItems([newItem, ...items]);
    setShowAddPost(false);
    setPostTitle('');
    setPostContent('');
    setPostBadge('');
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا المنشور؟')) {
      saveItems(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#59662C]/15 via-white to-amber-500/10 dark:from-[#1E2517] dark:via-[#192014] dark:to-[#161A11] border-2 border-[#59662C]/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onBack}
              className="px-3 py-1 rounded-xl bg-white dark:bg-[#20271A] text-xs font-bold text-[#59662C] dark:text-[#A4BF46] border border-[#59662C]/30 flex items-center gap-1 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للرئيسية</span>
            </button>
            <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase bg-[#59662C] text-white">
              {section.badgeText || 'قسم مخصص'}
            </span>
            {!section.isVisible && (
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                <span>مخفي عن الطلاب</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24] dark:text-white">
            {section.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#61594B] dark:text-[#C5BEAF] font-medium max-w-2xl">
            {section.description}
          </p>
        </div>

        {isAuthorAdmin && (
          <button
            onClick={() => setShowAddPost(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة منشور في هذا القسم</span>
          </button>
        )}
      </div>

      {/* Add Post Form Modal */}
      {showAddPost && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A2015] border-2 border-[#59662C] shadow-lg space-y-4 animate-scaleUp">
          <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
            إضافة منشور أو حالة جديدة لقسم: {section.title}
          </h3>
          <form onSubmit={handleAddPost} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-[#383329] dark:text-[#C5BEAF] mb-1">
                عنوان المنشور *
              </label>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="مثال: بروتوكول تحضير السطح الإطباقي الجديد..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#384524] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#383329] dark:text-[#C5BEAF] mb-1">
                شارة تصنيف المنشور
              </label>
              <input
                type="text"
                value={postBadge}
                onChange={(e) => setPostBadge(e.target.value)}
                placeholder="مثال: تنبيه سريري أو خطوة أساسية"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#384524] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#383329] dark:text-[#C5BEAF] mb-1">
                نص الشرح والتفاصيل السريرية *
              </label>
              <textarea
                required
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="اكتبي تفاصيل الشرح، الخطوات، أو التوصيات السريرية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] dark:border-[#384524] bg-[#FAF8F2] dark:bg-[#141810] text-sm font-medium text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPost(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer"
              >
                نشر المنشور
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1A2015] rounded-3xl border border-[#E5DEC9] dark:border-[#343E26]">
            <Layers className="w-10 h-10 text-[#59662C]/40 mx-auto mb-2" />
            <p className="text-sm font-black text-[#383329] dark:text-white">
              لا توجد منشورات في هذا القسم حالياً.
            </p>
            {isAuthorAdmin && (
              <p className="text-xs text-[#6F695C] dark:text-[#A7A08E] mt-1">
                يمكنك الضغط على زر "+ إضافة منشور" في الأعلى لإضافة محتوى جديد.
              </p>
            )}
          </div>
        ) : (
          items.map((item, itIdx) => (
            <div
              key={`${item.id}_${itIdx}`}
              className="p-6 rounded-3xl bg-white dark:bg-[#1A2015] border border-[#E5DEC9] dark:border-[#343E26] shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:text-[#A4BF46]">
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-[#7A7467] dark:text-[#A7A08E] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                </div>
                {isAuthorAdmin && (
                  <button
                    onClick={() => handleDeletePost(item.id)}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                    title="حذف هذا المنشور"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-black text-[#2F2B24] dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#4E473A] dark:text-[#C5BEAF] leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
              <div className="pt-3 border-t border-[#E5DEC9]/50 dark:border-[#343E26] flex items-center justify-between text-[11px] text-[#7A7467] dark:text-[#A7A08E]">
                <span>بواسطة: {item.author}</span>
                <span>جامعة المعارف</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
