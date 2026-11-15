import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film,
  X,
  Sparkles,
  Link as LinkIcon,
  Plus,
  ChevronRight,
  ChevronLeft,
  ListVideo,
} from 'lucide-react';
import {
  AppSection,
  SectionVideoItem,
  getSectionVideos,
  addVideoToSection,
  updateVideoInSection,
  deleteVideoFromSection,
  updateSectionVideo,
} from '../data/sectionsManager';

interface SectionVideoPlayerProps {
  section: AppSection;
  isAdmin?: boolean;
  onVideoUpdated?: (updatedSection: AppSection) => void;
  className?: string;
  autoPlay?: boolean;
}

/**
 * Extracts YouTube video embed URL
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Match standard, youtu.be, shorts, and embed formats
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
  return null;
}

/**
 * Extracts Vimeo embed URL
 */
function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/;
  const match = url.match(regExp);
  if (match && match[2]) {
    return `https://player.vimeo.com/video/${match[2]}`;
  }
  return null;
}

export const SectionVideoPlayer: React.FC<SectionVideoPlayerProps> = ({
  section,
  isAdmin = false,
  onVideoUpdated,
  className = '',
}) => {
  // Normalize all videos for this section (supports multiple videos)
  const videos = getSectionVideos(section);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Form inputs
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoDescInput, setVideoDescInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editError, setEditError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Delete confirmation
  const [videoToDelete, setVideoToDelete] = useState<SectionVideoItem | null>(null);

  // Clamp active index whenever videos array changes
  const safeIndex = Math.min(Math.max(0, activeVideoIndex), Math.max(0, videos.length - 1));
  const currentVideo = videos[safeIndex] || null;

  // Open Add Video Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingVideoId(null);
    setVideoUrlInput('');
    setVideoTitleInput(`فيديو رقم ${videos.length + 1}`);
    setVideoDescInput('');
    setEditError('');
    setShowModal(true);
  };

  // Open Edit Video Modal for a specific video
  const handleOpenEdit = (videoItem: SectionVideoItem) => {
    setModalMode('edit');
    setEditingVideoId(videoItem.id);
    setVideoUrlInput(videoItem.url || '');
    setVideoTitleInput(videoItem.title || '');
    setVideoDescInput(videoItem.description || '');
    setEditError('');
    setShowModal(true);
  };

  // Execute Video Removal (Admin only)
  const executeDeleteVideo = () => {
    if (!videoToDelete) return;

    const updatedSections = deleteVideoFromSection(section.id, videoToDelete.id);
    const updated = updatedSections.find((s) => s.id === section.id || s.key === section.key) || {
      ...section,
      videos: videos.filter((v) => v.id !== videoToDelete.id),
    };

    if (onVideoUpdated) onVideoUpdated(updated);

    // Adjust active index
    const remainingCount = videos.length - 1;
    if (safeIndex >= remainingCount) {
      setActiveVideoIndex(Math.max(0, remainingCount - 1));
    }

    setVideoToDelete(null);
    setActionSuccess(`تم حذف الفيديو بنجاح («${videoToDelete.title || 'فيديو'}») 🗑️`);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Save Video (Add or Edit)
  const handleSaveVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditError('');

    const cleanUrl = videoUrlInput.trim();
    if (!cleanUrl) {
      setEditError('يرجى إدخال رابط الفيديو (YouTube أو Vimeo أو MP4) أو رفع ملف من جهازك.');
      return;
    }

    if (modalMode === 'add') {
      const updatedSections = addVideoToSection(section.id, {
        url: cleanUrl,
        title: videoTitleInput.trim() || undefined,
        description: videoDescInput.trim() || undefined,
      });

      const updated = updatedSections.find((s) => s.id === section.id || s.key === section.key) || section;
      if (onVideoUpdated) onVideoUpdated(updated);

      // Select the newly added video
      const newVideos = getSectionVideos(updated);
      setActiveVideoIndex(Math.max(0, newVideos.length - 1));

      setShowModal(false);
      setActionSuccess('تمت إضافة الفيديو الجديد للقسم بنجاح! 🎥');
      setTimeout(() => setActionSuccess(''), 3500);
    } else if (modalMode === 'edit' && editingVideoId) {
      const updatedSections = updateVideoInSection(section.id, editingVideoId, {
        url: cleanUrl,
        title: videoTitleInput.trim() || undefined,
        description: videoDescInput.trim() || undefined,
      });

      const updated = updatedSections.find((s) => s.id === section.id || s.key === section.key) || section;
      if (onVideoUpdated) onVideoUpdated(updated);

      setShowModal(false);
      setActionSuccess('تم تحديث وحفظ بيانات الفيديو بنجاح! 🎥');
      setTimeout(() => setActionSuccess(''), 3500);
    }
  };

  // Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 25MB for local storage
    if (file.size > 25 * 1024 * 1024) {
      setEditError('حجم الفيديو كبير جداً للتخزين المحلي (الحد الأقصى 25 ميجابايت). يُفضل استخدام رابط YouTube أو Vimeo.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setVideoUrlInput(result);
      if (!videoTitleInput || videoTitleInput.startsWith('فيديو رقم')) {
        setVideoTitleInput(file.name.replace(/\.[^/.]+$/, ''));
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setEditError('حدث خطأ أثناء قراءة ملف الفيديو.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Embed helpers for active video
  const activeUrl = currentVideo?.url?.trim();
  const ytEmbed = activeUrl ? getYouTubeEmbedUrl(activeUrl) : null;
  const vimeoEmbed = activeUrl ? getVimeoEmbedUrl(activeUrl) : null;
  const isDirectVideo = activeUrl && (
    activeUrl.endsWith('.mp4') ||
    activeUrl.endsWith('.webm') ||
    activeUrl.endsWith('.ogg') ||
    activeUrl.startsWith('data:video/') ||
    activeUrl.startsWith('blob:')
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toast feedback */}
      {actionSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* When Videos Exist */}
      {videos.length > 0 && currentVideo ? (
        <div className="space-y-3">
          {/* Multi-Video Playlist Selector / Tabs Bar */}
          <div className="p-3 bg-white dark:bg-[#1C2216] rounded-2xl border border-[#E5DEC9] dark:border-[#384524] shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#59662C]/10 text-[#59662C] dark:text-[#A8C24E]">
                  <ListVideo className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-[#2F2B24] dark:text-white">
                  فيديوهات القسم ({videos.length})
                </span>
                <span className="text-[11px] text-[#766F60] dark:text-[#A7A08E]">
                  • يمكنك التبديل بين الفيديوهات أو إضافة المزيد
                </span>
              </div>

              {/* Admin "+ إضافة فيديو آخر" Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
                  title="إضافة فيديو آخر لهذا القسم"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فيديو آخر ➕</span>
                </button>
              )}
            </div>

            {/* Video Selector Badges/Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
              {videos.map((vid, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <div
                    key={`${vid.id}_${idx}`}
                    className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      isActive
                        ? 'bg-[#59662C] text-white border-[#59662C] shadow-md ring-2 ring-[#59662C]/30'
                        : 'bg-[#FAF7F2] dark:bg-[#151910] text-[#554F42] dark:text-[#C5BEAF] border-[#D5CDBC] dark:border-[#384524] hover:bg-neutral-100 dark:hover:bg-[#20271A]'
                    }`}
                    onClick={() => setActiveVideoIndex(idx)}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive
                          ? 'bg-white text-[#59662C]'
                          : 'bg-[#59662C]/10 text-[#59662C] dark:text-[#A8C24E]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[140px] sm:max-w-[180px]">
                      {vid.title || `فيديو ${idx + 1}`}
                    </span>

                    {/* Small admin actions per item */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 mr-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(vid);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isActive
                              ? 'hover:bg-white/20 text-white'
                              : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#716A5B]'
                          }`}
                          title="تعديل هذا الفيديو"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoToDelete(vid);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isActive
                              ? 'hover:bg-rose-500/80 text-white'
                              : 'hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600'
                          }`}
                          title="حذف هذا الفيديو"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Video Player Box */}
          <div className="rounded-3xl overflow-hidden bg-black border-2 border-[#59662C]/40 dark:border-[#3E4A2E] shadow-xl relative group">
            {/* Top Bar of Active Video */}
            <div className="p-3.5 bg-gradient-to-r from-black/90 via-black/75 to-black/90 text-white flex items-center justify-between gap-3 text-xs border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-[#59662C] text-white shrink-0 shadow-xs">
                  <Film className="w-4 h-4" />
                </span>
                <div className="truncate text-right">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-black">
                      فيديو {safeIndex + 1} من {videos.length}
                    </span>
                    <span className="font-black truncate text-sm">
                      {currentVideo.title || `فيديو ${safeIndex + 1}`}
                    </span>
                  </div>
                  {currentVideo.description && (
                    <span className="text-[11px] text-white/70 block truncate mt-0.5">
                      {currentVideo.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Prev / Next + Admin Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Navigation Between Videos */}
                {videos.length > 1 && (
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={safeIndex === 0}
                      onClick={() => setActiveVideoIndex((prev) => Math.max(0, prev - 1))}
                      className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer transition-colors"
                      title="الفيديو السابق"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-black px-1.5">
                      {safeIndex + 1}/{videos.length}
                    </span>
                    <button
                      type="button"
                      disabled={safeIndex === videos.length - 1}
                      onClick={() => setActiveVideoIndex((prev) => Math.min(videos.length - 1, prev + 1))}
                      className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer transition-colors"
                      title="الفيديو التالي"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Admin Actions for Active Video */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(currentVideo)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                      title="تعديل هذا الفيديو"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoToDelete(currentVideo)}
                      className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-all active:scale-95"
                      title="حذف هذا الفيديو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Player Display (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={currentVideo.title || section.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : vimeoEmbed ? (
                <iframe
                  src={vimeoEmbed}
                  title={currentVideo.title || section.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : isDirectVideo ? (
                <video
                  key={`${currentVideo.id || 'vid'}_${currentVideo.url || 'url'}`}
                  src={currentVideo.url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
                </video>
              ) : (
                <iframe
                  src={currentVideo.url}
                  title={currentVideo.title || section.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* When No Videos Exist */
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-dashed border-[#59662C]/40 dark:border-[#3E4A2E] flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59662C]/10 text-[#59662C] dark:text-[#A8C24E] flex items-center justify-center shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#2F2B24] dark:text-white">
                {isAdmin
                  ? `إضافة فيديوهات توضيحية لقسم «${section.title}» 🎥`
                  : `فيديوهات قسم «${section.title}»`}
              </h4>
              <p className="text-xs text-[#70695B] dark:text-[#A7A08E]">
                {isAdmin
                  ? 'يمكنك كمسؤول إضافة فيديو واحد أو أكثر عبر YouTube أو Vimeo أو ملف فيديو مباشر ليظهر للمشتركين داخل هذا القسم.'
                  : 'لا توجد فيديوهات مضافة لهذا القسم حالياً.'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فيديو جديد ➕</span>
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#181D13] rounded-3xl shadow-2xl border-2 border-[#59662C] overflow-hidden my-auto animate-scaleUp text-[#2F2B24] dark:text-[#F3EFE6]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-br from-[#59662C]/20 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between text-right">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#59662C] text-white shadow-xs">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                    {modalMode === 'add' ? 'إضافة فيديو جديد للقسم ➕' : 'تعديل الفيديو المحدد ✏️'}
                  </h3>
                  <span className="text-xs text-[#716A5B] dark:text-[#A7A08E] font-medium">
                    قسم «{section.title}»
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-500 hover:text-gray-800 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveVideo} className="p-5 sm:p-6 space-y-4 text-xs text-right">
              {editError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="font-bold leading-relaxed">{editError}</span>
                </div>
              )}

              {/* Video URL Input */}
              <div className="space-y-1.5">
                <label className="font-black text-[#2F2B24] dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-[#59662C] dark:text-[#A8C24E]" />
                    <span>رابط الفيديو (YouTube / Vimeo / MP4 URL):*</span>
                  </span>
                  <span className="text-[10px] text-[#7E7768] dark:text-[#A7A08E]">
                    يدعم YouTube Shorts و Watch و Embed
                  </span>
                </label>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=... أو https://youtu.be/..."
                  value={videoUrlInput}
                  onChange={(e) => {
                    setVideoUrlInput(e.target.value);
                    if (editError) setEditError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-mono text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C]"
                  required
                />
              </div>

              {/* Or Upload Video File */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151910] border border-[#D5CDBC] dark:border-[#384524] space-y-2">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>أو رفع ملف فيديو من جهازك (MP4 / WebM):</span>
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="w-full text-xs text-[#524B3E] dark:text-[#D5CDBC] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#59662C] file:text-white file:cursor-pointer cursor-pointer"
                />
                {isProcessing && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                    جارٍ معالجة وتحميل ملف الفيديو...
                  </p>
                )}
              </div>

              {/* Video Title */}
              <div className="space-y-1">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC]">
                  عنوان الفيديو (مثال: فيديو 2 - تفاصيل تحضير الحافة):
                </label>
                <input
                  type="text"
                  placeholder="مثال: الشرح السريري العملي - الجزء الأول"
                  value={videoTitleInput}
                  onChange={(e) => setVideoTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Video Description */}
              <div className="space-y-1">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC]">
                  وصف موجز أو توجيه سريري للفيديو:
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: يوضح هذا الفيديو التكنيك المعتمد في دمج الطبقات وتطبيق Bevel بنجاح..."
                  value={videoDescInput}
                  onChange={(e) => setVideoDescInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs text-[#2F2B24] dark:text-white"
                />
              </div>

              {/* Live Preview if URL is valid */}
              {videoUrlInput && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#59662C] dark:text-[#A8C24E] block">
                    معاينة الفيديو:
                  </span>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/20">
                    {getYouTubeEmbedUrl(videoUrlInput) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrlInput)!}
                        title="معاينة"
                        className="w-full h-full border-0"
                      />
                    ) : getVimeoEmbedUrl(videoUrlInput) ? (
                      <iframe
                        src={getVimeoEmbedUrl(videoUrlInput)!}
                        title="معاينة"
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <video
                        src={videoUrlInput}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E5DEC9] dark:border-[#343E26]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#20271A] border border-[#D5CDBC] dark:border-[#343E26] text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#59662C] hover:bg-[#485320] text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {modalMode === 'add' ? 'إضافة الفيديو لقائمة القسم ➕' : 'حفظ تعديلات الفيديو 💾'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Deletion Confirmation Dialog (Admin Only) */}
      {videoToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#1A2014] rounded-3xl p-6 border-2 border-rose-400 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2F2B24] dark:text-white">
                  تأكيد حذف الفيديو
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  هل أنتِ متأكدة من حذف وإزالة الفيديو «{videoToDelete.title || 'هذا الفيديو'}» من قسم «{section.title}»؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={executeDeleteVideo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                نعم، احذف الفيديو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
