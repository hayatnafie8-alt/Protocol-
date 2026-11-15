import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  Sparkles,
  Heart,
  ArrowLeft,
  BookOpen,
  Stethoscope,
  Scissors,
  Wrench,
  Layers,
  ChevronRight,
  Zap,
  Tag,
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

interface ClinicalFastSearchProps {
  onNavigateItem: (tab: string, param?: string) => void;
  onOpenFavoritesTab?: () => void;
  isContentUnlocked: boolean;
  onRequireUnlock?: (title?: string) => void;
}

export const ClinicalFastSearch: React.FC<ClinicalFastSearchProps> = ({
  onNavigateItem,
  onOpenFavoritesTab,
  isContentUnlocked,
  onRequireUnlock,
}) => {
  const [queryText, setQueryText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => getStoredBookmarks());

  const catalog = useMemo(() => buildSearchCatalog(), []);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync bookmark states
  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<BookmarkItem[]>;
      if (custom.detail) {
        setBookmarks(custom.detail);
      } else {
        setBookmarks(getStoredBookmarks());
      }
    };
    window.addEventListener('app-bookmarks-updated', handleUpdated);
    return () => window.removeEventListener('app-bookmarks-updated', handleUpdated);
  }, []);

  // Filter options list
  const specialties = [
    { id: 'all', label: 'كافة التخصصات' },
    { id: 'Operative', label: 'حشوات وترميم (Operative)' },
    { id: 'Surgery', label: 'جراحة الفم (Oral Surgery)' },
    { id: 'Pharmacology', label: 'تخدير وأدوية (Pharmacology)' },
    { id: 'Diagnosis', label: 'إدارة المراجعين والتشخيص' },
  ];

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'protocol', label: 'بروتوكولات الكومبوزيت' },
    { id: 'skill', label: 'المهارات السريرية 4K' },
    { id: 'surgical', label: 'الحالات الجراحية' },
    { id: 'calc_or_formula', label: 'محاكيات وأدوات' },
  ];

  // Real-time dynamic search and filter
  const filteredResults = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    return catalog.filter((item) => {
      // Specialty filter
      if (selectedSpecialty !== 'all' && item.specialty !== selectedSpecialty) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // If no search query, return match based on category/specialty filters only
      if (!q) {
        return true;
      }

      // Deep text match across title, subtitle, tags, and key clinical takeaway
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchKeyPoint = item.clinicalKeyPoint.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchSubtitle || matchKeyPoint || matchTags;
    });
  }, [catalog, queryText, selectedSpecialty, selectedCategory]);

  const handleSelectResult = (item: CatalogSearchItem) => {
    if (item.isUnlockedOnly && !isContentUnlocked) {
      if (onRequireUnlock) {
        onRequireUnlock(item.title);
      }
      return;
    }
    onNavigateItem(item.targetTab, item.targetParam);
  };

  const handleToggleFavorite = (e: React.MouseEvent, item: CatalogSearchItem) => {
    e.stopPropagation();
    const payload = toBookmarkPayload(item);
    toggleBookmarkItem(payload);
    setBookmarks(getStoredBookmarks());
  };

  const activeFiltersCount =
    (selectedSpecialty !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);

  return (
    <div className="w-full space-y-3 relative z-20">
      {/* Search Header Container */}
      <div className="bg-white/95 dark:bg-[#1E2417]/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 border-2 border-[#59662C]/30 dark:border-[#384524] shadow-md transition-all focus-within:border-[#59662C] dark:focus-within:border-[#A4BF46] focus-within:shadow-lg">
        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#59662C] dark:text-[#A4BF46] pointer-events-none">
            <Search className="w-5 h-5 animate-pulse" />
          </div>

          <input
            ref={inputRef}
            type="text"
            dir="rtl"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="بحث فوري في العيادة (مثال: Class IV, IANB, تخدير, خياطة, بيفل, خلع جراحي)..."
            className="w-full pr-11 pl-24 py-2.5 bg-[#FAF7F2] dark:bg-[#151910] rounded-2xl border border-[#D5CDBC] dark:border-[#323E22] text-xs sm:text-sm font-bold text-[#2F2B24] dark:text-white placeholder-[#8A8374] dark:placeholder-[#768266] focus:outline-none focus:bg-white dark:focus:bg-[#1E2417]"
          />

          {/* Quick Clear or Keyboard Shortcut */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {queryText && (
              <button
                type="button"
                onClick={() => {
                  setQueryText('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {onOpenFavoritesTab && (
              <button
                type="button"
                onClick={onOpenFavoritesTab}
                className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-black flex items-center gap-1 cursor-pointer hover:bg-amber-100 transition-all active:scale-95 shadow-2xs"
                title="فتح المفضلة ومركزي السريري"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline">مفضلتي</span>
                <span className="font-mono text-[10px]">({bookmarks.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category & Specialty Filter Pills */}
        <div className="mt-3 pt-2.5 border-t border-[#E5DEC9]/80 dark:border-[#2C361D] space-y-2">
          {/* Specialties Filter Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] font-bold text-[#7A7364] dark:text-[#A7A08E] shrink-0 flex items-center gap-1 ml-1">
              <Filter className="w-3 h-3 text-[#59662C] dark:text-[#A4BF46]" />
              <span>التخصص:</span>
            </span>

            {specialties.map((sp, spIdx) => (
              <button
                key={`${sp.id}_${spIdx}`}
                type="button"
                onClick={() => setSelectedSpecialty(sp.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedSpecialty === sp.id
                    ? 'bg-[#59662C] dark:bg-[#7D9333] text-white shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#161B11] text-[#554E41] dark:text-[#C5BFB0] border border-[#E5DEC9] dark:border-[#343E26] hover:bg-[#F2ECE0]'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Categories Secondary Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] font-bold text-[#7A7364] dark:text-[#A7A08E] shrink-0 ml-1">
              النوع:
            </span>
            {categories.map((cat, catIdx) => (
              <button
                key={`${cat.id}_${catIdx}`}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-2xs font-black'
                    : 'bg-black/5 dark:bg-white/5 text-[#5F5747] dark:text-[#B5AF9F] hover:bg-black/10'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {(queryText || activeFiltersCount > 0) && (
              <button
                type="button"
                onClick={() => {
                  setQueryText('');
                  setSelectedSpecialty('all');
                  setSelectedCategory('all');
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 cursor-pointer mr-auto"
              >
                إلغاء التصفية ↺
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instant Search Results Dropdown / Quick Access Panel */}
      {(queryText || isFocused || activeFiltersCount > 0) && (
        <div className="bg-white dark:bg-[#1E2417] rounded-3xl p-4 sm:p-5 border-2 border-[#59662C]/30 dark:border-[#384524] shadow-xl space-y-3 animate-fadeIn">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9] dark:border-[#323E22] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>نتائج البحث الفوري للعيادة:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#59662C]/10 text-[#59662C] dark:bg-[#A4BF46]/20 dark:text-[#CBE276] font-mono">
                {filteredResults.length} نتيجة مطابقة
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFocused(false)}
              className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
            >
              إغلاق النافذة ✕
            </button>
          </div>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A7364] dark:text-[#A7A08E] space-y-1.5">
              <Search className="w-8 h-8 mx-auto text-gray-400 stroke-[1.5]" />
              <p className="font-bold text-sm text-[#2F2B24] dark:text-white">لا توجد نتائج مطابقة لبحثك</p>
              <p>جرب البحث بكلمات أخرى مثل «تخدير»، «Class IV»، «سنة»، أو أزل الفلاتر المحددة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pl-1">
              {filteredResults.map((item, idx) => {
                const bookmarked = isItemBookmarked(item.id, bookmarks);

                return (
                  <div
                    key={`${item.id}_${item.category || ''}_${idx}`}
                    onClick={() => handleSelectResult(item)}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#161B11] border border-[#E5DEC9] dark:border-[#323E22] hover:border-[#59662C] dark:hover:border-[#A4BF46] transition-all cursor-pointer group shadow-2xs hover:shadow-sm flex flex-col justify-between gap-2.5 text-right"
                  >
                    <div>
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2 pb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#59662C]/15 dark:bg-[#7D9333]/25 text-[#59662C] dark:text-[#CBE276]">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {item.specialtyArabic}
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, item)}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                            bookmarked
                              ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40'
                              : 'text-gray-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                          title={bookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة السريرية'}
                        >
                          <Heart className={`w-4 h-4 ${bookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] dark:text-white group-hover:text-[#59662C] dark:group-hover:text-[#A4BF46] transition-colors leading-snug">
                        {item.title}
                      </h4>

                      {/* Subtitle */}
                      <p className="text-[11px] text-[#6E6759] dark:text-[#B5AF9F] leading-relaxed line-clamp-2 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Clinical Key Takeaway Pill */}
                    <div className="pt-2 border-t border-[#E5DEC9]/60 dark:border-[#2C361D] flex items-center justify-between text-[11px] gap-2">
                      <div className="flex items-center gap-1 min-w-0 text-amber-800 dark:text-amber-300 font-semibold truncate">
                        <span className="text-amber-600 shrink-0">💡</span>
                        <span className="truncate">{item.clinicalKeyPoint}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-[#59662C] dark:text-[#A4BF46] font-bold group-hover:translate-x-[-2px] transition-transform">
                        <span>فتح</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
