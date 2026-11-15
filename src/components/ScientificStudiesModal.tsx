import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  BookOpen,
  ExternalLink,
  Search,
  Sparkles,
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Calendar,
  User,
  Filter,
  Layers,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  ScientificStudy,
  getScientificStudies,
  saveScientificStudy,
  deleteScientificStudy
} from '../data/studiesData';
import { AppImage } from './AppImage';
import { useLanguage } from '../contexts/LanguageContext';

interface ScientificStudiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthorAdmin: boolean;
  initialAddMode?: boolean;
}

export const ScientificStudiesModal: React.FC<ScientificStudiesModalProps> = ({
  isOpen,
  onClose,
  isAuthorAdmin,
  initialAddMode = false,
}) => {
  const { language, isRTL } = useLanguage();
  const [studies, setStudies] = useState<ScientificStudy[]>(() => getScientificStudies());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync add form state when opened with initialAddMode
  useEffect(() => {
    if (isOpen) {
      setStudies(getScientificStudies());
      if (initialAddMode && isAuthorAdmin) {
        setShowAddForm(true);
      } else {
        setShowAddForm(false);
      }
    }
  }, [isOpen, initialAddMode, isAuthorAdmin]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen]);

  // Form states for adding study manually (strictly supervisor only)
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState<'psychology' | 'communication' | 'anesthesia' | 'restorative' | 'pediatric'>('communication');
  const [contentType, setContentType] = useState<'text' | 'image' | 'both'>('text');
  const [keyFinding, setKeyFinding] = useState('');
  const [summary, setSummary] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('يرجى إدخال عنوان الدراسة.');
      return;
    }
    if (!verificationUrl.trim()) {
      setFormError('يرجى إدخال خانة رابط الدراسة للتأكد (PubMed / DOI / الرابط الرسمي).');
      return;
    }
    if (contentType === 'image' && !imageUrl && !imagePreview) {
      setFormError('يرجى رفع صورة الدراسة أو إدخال رابطها.');
      return;
    }

    const categoryLabels: Record<string, string> = {
      psychology: 'سيكولوجية وإدارة التوتر',
      communication: 'سيكولوجية التواصل والشكاوى',
      anesthesia: 'تريكات التخدير الموضعي',
      restorative: 'الترميم وفحص الفك المقابل',
      pediatric: 'طب أسنان الأطفال السلوكي',
    };

    const newStudy: ScientificStudy = {
      id: 'custom-study-' + Date.now(),
      title: title.trim(),
      authors: authors.trim() || 'فريق بحثي موثق',
      journal: journal.trim() || 'مجلة علمية محكمة',
      year: year.trim() || new Date().getFullYear().toString(),
      category,
      categoryLabel: categoryLabels[category] || 'دراسة سريرية',
      contentType,
      keyFinding: keyFinding.trim() || 'نتيجة سريرية مبنية على الدليل الطبي.',
      summary: summary.trim() || title.trim(),
      verificationUrl: verificationUrl.trim(),
      imageUrl: imagePreview || imageUrl.trim() || undefined,
      isCustom: true,
      dateAdded: new Date().toLocaleDateString('ar-EG'),
    };

    const updated = saveScientificStudy(newStudy);
    setStudies(updated);

    // Reset Form
    setTitle('');
    setAuthors('');
    setJournal('');
    setKeyFinding('');
    setSummary('');
    setVerificationUrl('');
    setImageUrl('');
    setImagePreview('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteScientificStudy(id);
    setStudies(updated);
  };

  const filteredStudies = studies.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.authors.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.keyFinding.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`bg-[#FAF7F2] dark:bg-[#181C14] border-2 border-[#E5DEC9] dark:border-[#343E26] shadow-2xl flex flex-col overflow-hidden text-[#2F2B24] dark:text-[#F3EFE6] transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-[10000] w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-5xl max-h-[92vh] rounded-3xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#20261A] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                  {isRTL ? 'طب الأسنان القائم على الدليل' : 'Evidence-Based Dentistry'}
                </span>
                <span className="text-xs text-[#807A6D] dark:text-[#A7A08E] font-medium">
                  {studies.length} {isRTL ? 'أبحاث ودراسات موثقة' : 'Peer-Reviewed Studies'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
                {isRTL ? 'نافذة الدراسات والأبحاث السريرية المعتمدة' : 'Evidence-Based Clinical Research & Studies'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#1E2519] border border-[#E5DEC9] dark:border-[#323D24] text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-neutral-50 dark:hover:bg-[#252E1F] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isFullscreen ? (isRTL ? 'تصغير الشاشة' : 'Exit Fullscreen') : (isRTL ? 'تكبير الشاشة ملء الشاشة' : 'Fullscreen')}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{isRTL ? 'تصغير' : 'Exit'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{isRTL ? 'ملء الشاشة' : 'Expand'}</span>
                </>
              )}
            </button>

            {/* Add Study Button (Supervisor Strictly Only) */}
            {isAuthorAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                  showAddForm
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white'
                }`}
                title={isRTL ? 'إضافة دراسة جديدة يدوياً (متاح للمشرفة فقط)' : 'Add Study Manually (Supervisor Only)'}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{isRTL ? 'إضافة دراسة يدوياً' : 'Add Study'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#2A3322] hover:bg-[#EFE8DC] dark:hover:bg-[#343E2B] text-[#4A4436] dark:text-[#D9D3C7] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Supervisor-Only Add Study Form Drawer */}
        {showAddForm && isAuthorAdmin && (
          <form
            onSubmit={handleSaveStudy}
            className="p-6 bg-sky-50/70 dark:bg-sky-950/30 border-b-2 border-sky-200 dark:border-sky-800/60 space-y-4 shrink-0 transition-all overflow-y-auto max-h-[50vh]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-sky-200 dark:border-sky-800/60">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>إضافة دراسة بحثية جديدة يدوياً (لوحة المشرفة - د. حياة نافع)</span>
              </div>
              <span className="text-xs text-sky-800 dark:text-sky-300 bg-sky-200/60 dark:bg-sky-900/50 px-2.5 py-0.5 rounded-full font-semibold">
                صلاحيات المشرف
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  عنوان الدراسة / البحث:*
                </label>
                <input
                  type="text"
                  placeholder="مثال: أثر التجهيز النفسي وشارة التوقف في تخفيف الألم..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628] font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  الباحثون والجامعة:
                </label>
                <input
                  type="text"
                  placeholder="مثال: Dr. Leonard, Graham, et al."
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] focus:outline-none focus:border-[#596628]"
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  المجلة العلمية وسنة النشر:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم المجلة..."
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E]"
                  />
                  <input
                    type="text"
                    placeholder="2023"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-16 px-2 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] text-center"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  التصنيف والمحور:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] font-bold"
                >
                  <option value="communication">سيكولوجية التواصل والشكاوى</option>
                  <option value="psychology">سيكولوجية وإدارة التوتر</option>
                  <option value="anesthesia">تريكات التخدير الموضعي</option>
                  <option value="restorative">الترميم وفحص الفك المقابل</option>
                  <option value="pediatric">طب أسنان الأطفال السلوكي</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  نوع المحتوى (كتابة أو شكل صور):
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] font-bold"
                >
                  <option value="text">كتابة نصية وملخص سريري</option>
                  <option value="image">صورة / مخطط بحثي أو إنفوجرافيك</option>
                  <option value="both">كلاهما (نص تفصيلي + صورة بحثية)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-sky-900 dark:text-sky-300 block mb-1">
                  خانة رابط الدراسة للتأكد (مطلوب):*
                </label>
                <input
                  type="url"
                  placeholder="https://pubmed.ncbi.nlm.nih.gov/... أو رابط المجلة"
                  value={verificationUrl}
                  onChange={(e) => setVerificationUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border-2 border-sky-400 dark:border-sky-600 focus:outline-none font-mono text-xs"
                  required
                />
              </div>
            </div>

            {/* Optional Image Upload if content is image or both */}
            {(contentType === 'image' || contentType === 'both') && (
              <div className="p-3 rounded-xl bg-white dark:bg-[#161A12] border border-[#D5CDBC] dark:border-[#3E4A2E] space-y-2 text-xs">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block">
                  رفع صورة أو إنفوجرافيك للدراسة:
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-sky-50 dark:bg-sky-950/60 rounded-xl border border-dashed border-sky-500 font-bold text-sky-700 dark:text-sky-300 cursor-pointer hover:bg-sky-100 transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختيار ملف صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم تحميل الصورة بنجاح</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  النتيجة السريرية الأبرز (Takeaway):
                </label>
                <input
                  type="text"
                  placeholder="مثال: 96% من الشكاوى تعود للتواصل وليس المهارة اليدوية..."
                  value={keyFinding}
                  onChange={(e) => setKeyFinding(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] block mb-1">
                  ملخص الدراسة والمنهجية:
                </label>
                <textarea
                  rows={2}
                  placeholder="شرح موجز لأهم ما توصلت إليه الدراسة وتوصياتها للعيادة..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#161A12] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#161A12] border text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#596628] dark:bg-[#7D9333] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer"
              >
                حفظ ونشر الدراسة في الأرشيف
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 bg-[#FAF7F2] dark:bg-[#1C2216] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={isRTL ? 'ابحث بالعنوان، الكلمات المفتاحية، أو الباحث...' : 'Search by title, keywords, authors, or journal...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-white dark:bg-[#20261A] rounded-xl border border-[#D5CDBC] dark:border-[#3E4A2E] text-xs font-semibold focus:outline-none`}
            />
            <Search className={`w-4 h-4 text-gray-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#706A5B] dark:text-[#A7A08E] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E]" />
              <span>{isRTL ? 'التصنيف:' : 'Category:'}</span>
            </span>
            {[
              { id: 'all', label: isRTL ? 'الكل' : 'All' },
              { id: 'communication', label: isRTL ? 'سيكولوجية التواصل' : 'Communication' },
              { id: 'psychology', label: isRTL ? 'إدارة التوتر' : 'Anxiety Mitigation' },
              { id: 'anesthesia', label: isRTL ? 'التخدير' : 'Anesthesia' },
              { id: 'restorative', label: isRTL ? 'الترميم الإطباقي' : 'Occlusion' },
            ].map((f, fIdx) => (
              <button
                key={`${f.id}_${fIdx}`}
                onClick={() => setSelectedCategory(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === f.id
                    ? 'bg-[#596628] dark:bg-[#7D9333] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#20261A] border border-[#E5DEC9] dark:border-[#343E26] text-[#554F42] dark:text-[#D5CDBC] hover:bg-[#F3EFE7]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Studies Grid / List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredStudies.length === 0 ? (
            <div className="p-12 text-center text-[#888173] dark:text-[#A7A08E] space-y-2">
              <BookOpen className="w-12 h-12 mx-auto stroke-[1.5] opacity-40" />
              <p className="font-bold text-sm">
                {isRTL ? 'لا توجد دراسات تطابق معايير البحث الحالية' : 'No research studies match the current search criteria'}
              </p>
              <p className="text-xs">
                {isRTL ? 'جرّب اختيار تصنيف آخر أو مسح حقل البحث.' : 'Try selecting another category or clearing the search query.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudies.map((study, sIdx) => (
                <div
                  key={`${study.id || 'study'}_${sIdx}`}
                  className="p-5 rounded-2xl bg-white dark:bg-[#20261A] border-2 border-[#E5DEC9] dark:border-[#343E26] hover:border-[#596628] dark:hover:border-[#A8C24E] transition-all flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2.5">
                    {/* Category & Year */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                        {!isRTL && study.categoryLabelEn ? study.categoryLabelEn : study.categoryLabel}
                      </span>
                      <span className="text-[11px] font-mono text-[#807A6D] dark:text-[#A7A08E] font-bold">
                        {study.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{ width: '100%', display: 'block', textAlign: isRTL ? 'right' : 'left', wordBreak: 'keep-all', whiteSpace: 'normal' }}
                      className="text-sm sm:text-base font-black text-[#2F2B24] dark:text-white leading-snug"
                    >
                      {!isRTL && study.titleEn ? study.titleEn : study.title}
                    </h3>

                    {/* Authors & Journal */}
                    <div className="text-[11px] text-[#706A5B] dark:text-[#A7A08E] font-medium flex items-center gap-1.5 flex-wrap">
                      <User className="w-3.5 h-3.5 text-[#596628] dark:text-[#A8C24E] shrink-0" />
                      <span>{study.authors}</span>
                      <span>•</span>
                      <span className="italic">{study.journal}</span>
                    </div>

                    {/* Image / Figure if available */}
                    {study.imageUrl && (
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-950 border border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-center">
                        <AppImage
                          src={study.imageUrl}
                          alt={study.title}
                          isAdmin={isAuthorAdmin}
                          storageKey={`study_img_${study.id}`}
                          className="w-full h-full max-h-[450px] object-contain"
                          containerClassName="w-full h-full bg-neutral-950"
                          show4KBadge={true}
                        />
                      </div>
                    )}

                    {/* Key Finding Box */}
                    {study.keyFinding && (
                      <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-[#3E382C] dark:text-[#E2DDD2] font-semibold space-y-1">
                        <div className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isRTL ? 'النتيجة السريرية الأبرز:' : 'Key Clinical Takeaway:'}</span>
                        </div>
                        <p className="leading-relaxed">
                          {!isRTL && study.keyFindingEn ? study.keyFindingEn : study.keyFinding}
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    <p className="text-xs text-[#524B3E] dark:text-[#D5CDBC] leading-relaxed line-clamp-3">
                      {!isRTL && study.summaryEn ? study.summaryEn : study.summary}
                    </p>
                  </div>

                  {/* Actions & Verification Link (Requested: خانة لرابط الدراسة للتأكد) */}
                  <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-2">
                    <a
                      href={study.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title={isRTL ? 'فحص والتحقق من مصدر الدراسة الأصلي' : 'Verify source on PubMed / Publisher'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'رابط فحص وتأكيد الدراسة' : 'Access PubMed / DOI Verification'}</span>
                    </a>

                    {/* Delete button (Author only for custom added studies) */}
                    {study.isCustom && isAuthorAdmin && (
                      <button
                        onClick={() => handleDelete(study.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-bold transition-all cursor-pointer"
                        title={isRTL ? 'حذف هذه الدراسة' : 'Delete this study'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-[#20261A] border-t border-[#E5DEC9] dark:border-[#343E26] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7B7567] dark:text-[#A7A08E] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#596628] dark:text-[#A8C24E]" />
            <span>
              {isRTL
                ? 'جميع الدراسات موثقة بروابط فحص أكاديمية معتمدة من PubMed والمجلات المحكمة'
                : 'All studies are verified with peer-reviewed academic citations via PubMed and indexed journals'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#596628] dark:text-[#A8C24E]">
              {isRTL ? 'د. حياة نافع فجر' : 'Dr. Hayat Nafea Fajer'}
            </span>
            <span>|</span>
            <span>{isRTL ? 'جامعة المعارف' : 'Al-Maarif University'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
