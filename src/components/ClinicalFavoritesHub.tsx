import React, { useState, useEffect } from 'react';
import {
  Trash2,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  Scissors,
  Wrench,
  Layers,
  Edit3,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import {
  BookmarkItem,
  getStoredBookmarks,
  saveStoredBookmarks,
  updateBookmarkNote,
} from '../data/bookmarksManager';
import { OfficialToothSvg } from './ToothFavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';

interface ClinicalFavoritesHubProps {
  onNavigateItem: (tab: string, param?: string) => void;
  onBackToHome: () => void;
  isContentUnlocked: boolean;
  onRequireUnlock?: (title?: string) => void;
}

export const ClinicalFavoritesHub: React.FC<ClinicalFavoritesHubProps> = ({
  onNavigateItem,
  onBackToHome,
  isContentUnlocked,
  onRequireUnlock,
}) => {
  const { isRTL } = useLanguage();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => getStoredBookmarks());
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

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

  const handleRemove = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveStoredBookmarks(updated);
  };

  const handleClearAll = () => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من تفريغ كافة العناصر المحفوظة في المفضلة؟' : 'Are you sure you want to clear all favorites?')) {
      setBookmarks([]);
      saveStoredBookmarks([]);
    }
  };

  const handleStartEditNote = (item: BookmarkItem) => {
    setEditingNoteId(item.id);
    setNoteText(item.notes || '');
  };

  const handleSaveNote = (id: string) => {
    updateBookmarkNote(id, noteText);
    setBookmarks(getStoredBookmarks());
    setEditingNoteId(null);
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filterSpecialty !== 'all' && b.specialty !== filterSpecialty) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
      (b.clinicalKeyPoint && b.clinicalKeyPoint.toLowerCase().includes(q)) ||
      (b.notes && b.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Banner with Official Tooth Emblem */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-white to-[#596628]/15 dark:from-[#252216] dark:via-[#1E2417] dark:to-[#171A12] border-2 border-amber-300 dark:border-amber-700/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#596628] via-[#85983C] to-[#D4AF37] text-white flex items-center justify-center shadow-lg shrink-0 p-2.5">
            <OfficialToothSvg isBookmarked={true} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white flex items-center gap-2">
                <span>{isRTL ? 'قائمة المفضلة والمحتوى المحفوظ' : 'Clinical Favorites & Saved Archive'}</span>
                <span className="text-amber-500">🦷</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {bookmarks.length} {isRTL ? 'عنصر محفوظ' : 'items'}
              </span>
            </div>
            <p className="text-xs text-[#716A5B] dark:text-[#A7A08E] mt-1 max-w-xl">
              {isRTL
                ? 'مرجعك السريري الشخصي السريع بنقرة سنّ واحدة: احفظ المنشورات، السلايدات، وتقنيات الخياطة والتخدير لتجدها فوراً في العيادة.'
                : 'Your 1-tap personal clinical reference: Save posts, slides, suturing techniques, and anesthesia protocols directly for rapid chairside access.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {bookmarks.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
            >
              {isRTL ? 'تفريغ الكل' : 'Clear All'}
            </button>
          )}

          <button
            type="button"
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E2417] text-[#2F2B24] dark:text-white border border-[#E5DEC9] dark:border-[#384524] text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-gray-50 transition"
          >
            <span>{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
            <ArrowLeft className={`w-4 h-4 ${!isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controls & Search in Favorites */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1E2417] p-3 sm:p-4 rounded-2xl border border-[#E5DEC9] dark:border-[#384524]">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث في مفضلتك السريرية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 bg-[#FAF7F2] dark:bg-[#151910] rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'Operative', label: 'حشوات' },
            { id: 'Surgery', label: 'جراحة' },
            { id: 'Pharmacology', label: 'تخدير' },
            { id: 'Diagnosis', label: 'إرشادات' },
          ].map((tab, tabIdx) => (
            <button
              key={`${tab.id}_${tabIdx}`}
              type="button"
              onClick={() => setFilterSpecialty(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                filterSpecialty === tab.id
                  ? 'bg-rose-600 text-white shadow-2xs font-black'
                  : 'bg-black/5 dark:bg-white/5 text-[#5F5747] dark:text-[#B5AF9F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#7A7364] dark:text-[#A7A08E] space-y-3 bg-white dark:bg-[#1E2417] rounded-3xl border-2 border-dashed border-[#E5DEC9] dark:border-[#343E26]">
          <OfficialToothSvg className="w-14 h-14 mx-auto text-[#596628] dark:text-[#A8C24E] opacity-70" isBookmarked={false} />
          <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
            {bookmarks.length === 0 ? 'لم تحفظ أي محتوى في المفضلة بعد' : 'لا توجد نتائج مطابقة لبحثك في المفضلة'}
          </h3>
          <p className="max-w-md mx-auto leading-relaxed">
            يمكنك حفظ أي بروتوكول، منشور، شريحة، أو مهارة سريرية بسهولة بالنقر على أيقونة السنّ 🦷 في أي بطاقة لتظهر هنا جاهزة للاستخدام في العيادة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((item, idx) => (
            <div
              key={`${item.id}_${idx}`}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E2417] border-2 border-[#E5DEC9] dark:border-[#384524] hover:border-rose-400 dark:hover:border-rose-600 transition-all shadow-xs flex flex-col justify-between gap-3 text-right group"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                    {item.categoryLabel}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-gray-300 hover:text-rose-600 transition cursor-pointer"
                    title="إزالة من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-[#2F2B24] dark:text-white group-hover:text-rose-600 transition-colors leading-snug">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <p className="text-xs text-[#6F6759] dark:text-[#C5BFB0] leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>
                )}

                {/* Key Takeaway */}
                {item.clinicalKeyPoint && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                    💡 <strong>تنبيه سريري:</strong> {item.clinicalKeyPoint}
                  </div>
                )}

                {/* Personal Clinical Note for this item */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  {editingNoteId === item.id ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="أضف ملاحظتك السريرية الخاصة هنا (مثال: استخدام بير أصفر، رقم كليبس #W8A)..."
                        className="w-full p-2 text-xs rounded-xl bg-[#FAF7F2] dark:bg-[#151910] border border-gray-300 dark:border-gray-700 font-semibold focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-[11px] font-bold text-gray-500"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-black flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>حفظ الملاحظة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="italic truncate max-w-[200px]">
                        {item.notes ? `📝 ${item.notes}` : 'لا توجد ملاحظة سريرية مخصصة'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(item)}
                        className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{item.notes ? 'تعديل' : '+ ملاحظة'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isContentUnlocked) {
                    if (onRequireUnlock) onRequireUnlock(item.title);
                    return;
                  }
                  onNavigateItem(item.targetTab, item.targetParam);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#59662C] to-[#738439] hover:from-[#495424] hover:to-[#59662C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              >
                <span>فتح البرتوكول في العيادة ⚡</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
