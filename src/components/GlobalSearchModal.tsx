import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Stethoscope,
  Scissors,
  Pill,
  BookOpen,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock,
  ChevronLeft,
  ExternalLink,
  Layers,
  Timer,
  Eye,
  SlidersHorizontal,
  Bookmark,
  Check,
} from 'lucide-react';
import {
  CatalogSearchItem,
  buildSearchCatalog,
  toBookmarkPayload,
} from '../data/clinicalCatalogSearch';
import {
  getStoredBookmarks,
  toggleBookmarkItem,
  isItemBookmarked,
  BookmarkItem,
} from '../data/bookmarksManager';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateItem: (tab: string, param?: string) => void;
  isContentUnlocked: boolean;
  onRequireUnlock?: (title?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateItem,
  isContentUnlocked,
  onRequireUnlock,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => getStoredBookmarks());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const catalog = useMemo(() => buildSearchCatalog(), []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    } else {
      setQuery('');
      setSelectedSpecialty('all');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync bookmarks
  useEffect(() => {
    const handleSync = () => setBookmarks(getStoredBookmarks());
    window.addEventListener('app-bookmarks-updated', handleSync);
    return () => window.removeEventListener('app-bookmarks-updated', handleSync);
  }, []);

  // Quick filter categories
  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'protocol', label: 'البروتوكولات' },
    { id: 'skill', label: 'المهارات 4K' },
    { id: 'surgical', label: 'الحالات الجراحية' },
    { id: 'prescription', label: 'الأدوية والوصفات' },
    { id: 'calc_or_formula', label: 'الأدوات والحاسبات' },
    { id: 'guide', label: 'الأدلة السريرية' },
  ];

  const specialties = [
    { id: 'all', label: 'جميع الاختصاصات' },
    { id: 'Operative', label: 'ترميمي وحشوات (Operative)' },
    { id: 'Surgery', label: 'جراحة الفم (Oral Surgery)' },
    { id: 'Pharmacology', label: 'أدوية وتخدير (Pharmacology)' },
    { id: 'Diagnosis', label: 'إدارة المرضى والتشخيص' },
  ];

  // Popular quick search suggestions
  const quickTags = [
    'Class II',
    'Class IV',
    'C-Factor',
    'Bevel',
    'MTA',
    'خلع جراحي',
    'ليدوكائين',
    'أموكسيسيلين',
    'ضرس العقل',
    'Palatal Index',
    'ربر دام',
  ];

  // Real-time filtering algorithm
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return catalog.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Specialty filter
      if (selectedSpecialty !== 'all' && item.specialty !== selectedSpecialty) {
        return false;
      }

      if (!q) {
        return true;
      }

      // Match query in title, subtitle, tags, specialty, or clinical key point
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q);
      const matchKeyPoint = (item.clinicalKeyPoint || '').toLowerCase().includes(q);
      const matchSpecialty = (item.specialtyArabic || '').toLowerCase().includes(q) || (item.specialty || '').toLowerCase().includes(q);
      const matchCategory = (item.categoryLabel || '').toLowerCase().includes(q);
      const matchTags = Array.isArray(item.tags) && item.tags.some((t) => (t || '').toLowerCase().includes(q));

      return matchTitle || matchSubtitle || matchKeyPoint || matchSpecialty || matchCategory || matchTags;
    });
  }, [catalog, query, selectedCategory, selectedSpecialty]);

  const handleSelectItem = (item: CatalogSearchItem) => {
    if (item.isUnlockedOnly && !isContentUnlocked) {
      if (onRequireUnlock) {
        onRequireUnlock(item.title);
      }
      onClose();
      return;
    }

    onNavigateItem(item.targetTab, item.targetParam);
    onClose();
  };

  const handleToggleBookmark = (e: React.MouseEvent, item: CatalogSearchItem) => {
    e.stopPropagation();
    toggleBookmarkItem(toBookmarkPayload(item));
    setBookmarks(getStoredBookmarks());
  };

  const handleCopyKeyPoint = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          dir="rtl"
        >
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            key="search-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#181D13] border border-[#E5DEC9] dark:border-[#343E26] rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5DEC9] dark:border-[#2C3520] bg-white dark:bg-[#1C2216]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#59662C]/10 dark:bg-[#A4BF46]/15 flex items-center justify-center text-[#59662C] dark:text-[#A4BF46]">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white font-['Cairo',sans-serif]">
                البحث السريري الشامل (Global Search)
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[#7D7667] dark:text-[#A7A08E] transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن بروتوكول، كلاس، مخدر، مهارة، خلع، دواء، أو مصطلح..."
              className="w-full pl-10 pr-4 py-3.5 bg-[#FAF7F2] dark:bg-[#13180E] border-2 border-[#59662C]/40 dark:border-[#A4BF46]/40 focus:border-[#59662C] dark:focus:border-[#A4BF46] rounded-2xl text-sm sm:text-base text-[#2F2B24] dark:text-white placeholder-[#9E9685] dark:placeholder-[#6C765C] outline-none transition-all shadow-inner font-bold"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-3 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 cursor-pointer"
                title="مسح النص"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute left-3 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-[10px] text-stone-500 font-mono hidden sm:block">
                ESC
              </div>
            )}
          </div>

          {/* Quick Filter Tags / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-[#7D7667] dark:text-[#A7A08E] shrink-0 ml-1">
              أقسام:
            </span>
            {categories.map((cat, catIdx) => (
              <button
                key={`${cat.id}_${catIdx}`}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#59662C] text-white shadow-xs'
                    : 'bg-[#EDE7DA] dark:bg-[#252E1D] text-[#585244] dark:text-[#C5BEAE] hover:bg-[#E0D7C4]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Term Shortcuts */}
          {!query && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
              <span className="text-[10px] font-bold text-[#8F8775] dark:text-[#8E9979] shrink-0 ml-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                مقترحات سريعة:
              </span>
              {quickTags.map((tag, tIdx) => (
                <button
                  key={`${tag}_${tIdx}`}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[11px] font-medium hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-5 divide-y divide-[#E5DEC9]/60 dark:divide-[#28321D]">
          <div className="flex items-center justify-between pb-2 px-1 text-xs text-[#7D7667] dark:text-[#A7A08E] font-bold">
            <span>النتائج ({results.length})</span>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-[#59662C] dark:text-[#A4BF46] hover:underline cursor-pointer"
              >
                إلغاء الفلتر
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-[#7D7667] dark:text-[#A7A08E]">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#59662C] dark:text-[#A4BF46]" />
              <p className="font-bold text-sm">لم يتم العثور على نتائج تطابق &quot;{query}&quot;</p>
              <p className="text-xs text-stone-500 mt-1">
                جرب البحث بكلمات أبسط مثل: &quot;حشوة&quot;، &quot;تخدير&quot;، &quot;ألم&quot;، &quot;خلع&quot;، أو &quot;MTA&quot;
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const bookmarked = isItemBookmarked(item.id);
              const isLocked = item.isUnlockedOnly && !isContentUnlocked;

              return (
                <div
                  key={`${item.id}_${item.category || ''}_${idx}`}
                  onClick={() => handleSelectItem(item)}
                  className="group py-3 px-2.5 sm:px-3.5 rounded-2xl hover:bg-white dark:hover:bg-[#1E2517] transition-all cursor-pointer flex flex-col gap-1.5 border border-transparent hover:border-[#E5DEC9] dark:hover:border-[#384528]"
                >
                  {/* Top line: Category badge, title, action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-[#59662C]/10 dark:bg-[#A4BF46]/15 text-[#59662C] dark:text-[#A4BF46] text-[10px] font-black">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#7D7667] dark:text-[#9A9383] font-bold">
                        {item.specialtyArabic}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLocked && (
                        <span className="px-1.5 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          للمشتركين
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, item)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          bookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                        title={bookmarked ? 'إزالة من المفضلة السريرية' : 'إضافة إلى المفضلة السريرية'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-transform group-hover:-translate-x-1 shrink-0" />
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-[#585244] dark:text-[#C5BEAE] line-clamp-1 leading-relaxed">
                    {item.subtitle}
                  </p>

                  {/* Clinical Key Pearl / Takeaway Box */}
                  {item.clinicalKeyPoint && (
                    <div className="mt-1 flex items-start justify-between gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200/90 font-medium">
                      <div className="flex items-start gap-1.5 flex-1">
                        <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>القاعدة السريرية:</strong> {item.clinicalKeyPoint}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleCopyKeyPoint(e, item.id, item.clinicalKeyPoint)}
                        className="p-1 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded transition-colors shrink-0 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="نسخ القاعدة"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <span>نسخ</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-[#EDE7DA]/50 dark:bg-[#151A0F] border-t border-[#E5DEC9] dark:border-[#2C3520] flex items-center justify-between text-xs text-[#7D7667] dark:text-[#A7A08E]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold">
              البحث الفوري مباشر وسريع في جميع البروتوكولات والأدوية
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#59662C] text-white hover:bg-[#485323] transition-colors font-bold text-xs cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
