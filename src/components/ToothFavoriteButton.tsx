import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ToothFavoriteButtonProps {
  isBookmarked: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'full';
  className?: string;
  count?: number;
  label?: string;
  title?: string;
}

/**
 * Official Tooth Icon for Favorites & Bookmarking:
 * Matches the official app protocol logo (anatomical molar tooth contour).
 * Replaces generic hearts and stars with the official dental emblem.
 */
export const OfficialToothSvg: React.FC<{
  isBookmarked: boolean;
  className?: string;
}> = ({ isBookmarked, className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} transition-transform duration-300 ${
        isBookmarked ? 'scale-110 drop-shadow-[0_2px_8px_rgba(212,175,55,0.45)]' : ''
      }`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Luxury Gold/Olive Active Enamel Gradient */}
        <linearGradient id="toothGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#596628" />
        </linearGradient>

        <linearGradient id="toothStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9D18A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      {/* Anatomical Molar Crown with Roots */}
      <path
        d="M6.5 3.5C8 3.5 9.5 4.5 12 4.5C14.5 4.5 16 3.5 17.5 3.5C19.8 3.5 21 5.3 21 8.2C21 11.2 19.8 14.5 18.5 17.5C17.5 19.8 16.5 21 15 21C13.8 21 13.2 19.5 12.8 17.5C12.5 16.2 12.2 15 12 15C11.8 15 11.5 16.2 11.2 17.5C10.8 19.5 10.2 21 9 21C7.5 21 6.5 19.8 5.5 17.5C4.2 14.5 3 11.2 3 8.2C3 5.3 4.2 3.5 6.5 3.5Z"
        fill={isBookmarked ? 'url(#toothGoldGrad)' : 'none'}
        stroke={isBookmarked ? 'url(#toothStrokeGrad)' : 'currentColor'}
        strokeWidth={isBookmarked ? '1.8' : '1.7'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal Occlusal Fissures line detail */}
      <path
        d="M8.5 7.5C10 8.5 11 8.5 12 8.5C13 8.5 14 8.5 15.5 7.5"
        stroke={isBookmarked ? '#FFFFFF' : 'currentColor'}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={isBookmarked ? 0.9 : 0.6}
      />
      <path
        d="M12 8.5V11.5"
        stroke={isBookmarked ? '#FFFFFF' : 'currentColor'}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={isBookmarked ? 0.9 : 0.6}
      />
    </svg>
  );
};

export const ToothFavoriteButton: React.FC<ToothFavoriteButtonProps> = ({
  isBookmarked,
  onToggle,
  size = 'md',
  variant = 'icon',
  className = '',
  count,
  label,
  title,
}) => {
  const { isRTL } = useLanguage();
  const [justToggled, setJustToggled] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 500);
    onToggle(e);
  };

  const defaultTitle = isBookmarked
    ? (isRTL ? 'محفوظ في المفضلة الخاصة بك (اضغط للإزالة)' : 'Saved in your Favorites (Click to remove)')
    : (isRTL ? 'حفظ في المفضلة السريرية 🦷' : 'Save to Clinical Favorites 🦷');

  const sizeClasses = {
    xs: 'w-7 h-7 p-1 text-xs',
    sm: 'w-8 h-8 p-1.5 text-xs',
    md: 'w-10 h-10 p-2 text-sm',
    lg: 'w-12 h-12 p-2.5 text-base',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'badge' || variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer ${
          isBookmarked
            ? 'bg-gradient-to-r from-amber-500/15 via-[#596628]/20 to-amber-500/15 text-amber-900 dark:text-amber-200 border-2 border-amber-400 dark:border-amber-600 shadow-sm scale-102'
            : 'bg-white/80 dark:bg-[#1E2417]/80 hover:bg-amber-50 dark:hover:bg-[#252C1C] text-[#5A5344] dark:text-[#C5BEAF] border border-[#E5DEC9] dark:border-[#384524]'
        } ${justToggled ? 'animate-bounce' : ''} ${className}`}
        title={title || defaultTitle}
        aria-label={title || defaultTitle}
        aria-pressed={isBookmarked}
      >
        <OfficialToothSvg isBookmarked={isBookmarked} className={iconSizes[size]} />
        <span className="text-xs">
          {label ||
            (isBookmarked
              ? isRTL
                ? 'في المفضلة'
                : 'Bookmarked'
              : isRTL
              ? 'حفظ في المفضلة'
              : 'Save')}
        </span>
        {count !== undefined && count > 0 && (
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              isBookmarked
                ? 'bg-amber-500 text-white font-black'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
        sizeClasses[size]
      } ${
        isBookmarked
          ? 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-2 border-amber-400/80 dark:border-amber-500/80 shadow-xs'
          : 'bg-white/90 dark:bg-[#1E2417]/90 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 border border-[#E5DEC9] dark:border-[#343E26] hover:border-amber-400/60 shadow-2xs'
      } ${justToggled ? 'scale-125' : 'hover:scale-110 active:scale-95'} ${className}`}
      title={title || defaultTitle}
      aria-label={title || defaultTitle}
      aria-pressed={isBookmarked}
    >
      <OfficialToothSvg isBookmarked={isBookmarked} className={iconSizes[size]} />
    </button>
  );
};
