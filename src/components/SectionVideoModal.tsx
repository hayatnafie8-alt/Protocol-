import React from 'react';
import { X, Film, Sparkles } from 'lucide-react';
import { AppSection, getSectionVideos } from '../data/sectionsManager';
import { SectionVideoPlayer } from './SectionVideoPlayer';

interface SectionVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AppSection;
  isAdmin?: boolean;
  onVideoUpdated?: (updatedSection: AppSection) => void;
}

export const SectionVideoModal: React.FC<SectionVideoModalProps> = ({
  isOpen,
  onClose,
  section,
  isAdmin = false,
  onVideoUpdated,
}) => {
  if (!isOpen) return null;

  const videos = getSectionVideos(section);
  const videoCountText = videos.length > 1 ? `(${videos.length} فيديوهات متوفرة)` : videos.length === 1 ? '(فيديو متوفر)' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] dark:bg-[#181D13] rounded-3xl shadow-2xl border-2 border-[#59662C]/60 dark:border-[#3E4A2E] overflow-hidden my-auto animate-scaleUp text-[#2F2B24] dark:text-[#F3EFE6]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#20271A] border-b border-[#E5DEC9] dark:border-[#343E26] flex items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-2xl bg-[#59662C] text-white shrink-0 shadow-md">
              <Film className="w-5 h-5" />
            </span>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white truncate">
                  {section.videoTitle || `فيديوهات الشرح التوضيحي: ${section.title}`}
                </h3>
                {videoCountText && (
                  <span className="px-2 py-0.5 rounded-lg bg-[#59662C]/10 text-[#59662C] dark:text-[#A8C24E] text-xs font-bold shrink-0">
                    {videoCountText}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#7B7465] dark:text-[#A7A08E]">
                قسم «{section.title}» • منصة بروتوكول لطب الأسنان
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-500 hover:text-gray-800 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <SectionVideoPlayer
            section={section}
            isAdmin={isAdmin}
            onVideoUpdated={onVideoUpdated}
          />
        </div>
      </div>
    </div>
  );
};
