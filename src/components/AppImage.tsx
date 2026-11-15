import React, { useRef, useState, useEffect } from 'react';
import { Camera, Loader2, Check, Trash2, ImageOff, Maximize2 } from 'lucide-react';
import { processAndOptimizeImage } from '../utils/imageUploadHelper';
import { ImageLightboxModal } from './ImageLightboxModal';

import {
  getCacheBustedImageUrl,
  clearAllImageCaches,
  setGlobalBrandingVersion,
  PROTOCOL_MIDDLE_CARD_LOGO_EVENT,
  PROTOCOL_BRANDING_EVENT,
} from '../utils/cacheBuster';
import { saveAppBrandingToCloud } from '../services/realTimeSyncService';

export interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  isAdmin?: boolean;
  onImageChange?: (newUrl: string) => void;
  onDeleteImage?: () => void;
  storageKey?: string;
  containerClassName?: string;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'center';
  showLabel?: boolean;
  show4KBadge?: boolean;
  enableLightbox?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Universal AppImage Component:
 * - High-performance, full-aspect-ratio clinical image renderer with `object-fit: contain`.
 * - Never crops, cuts off, or stretches anatomical figures or dental labels.
 * - Opens High-Resolution 4K Lightbox on tap/click with zoom-in capability and ✕ close button.
 * - Clean subtle overlay controls for Admin (Replace 📷 & Delete 🗑️) positioned at top corners
 *   with translucent blur so they never obscure the clinical center of the image.
 * - Optimized file processing ensuring pristine 4K quality.
 */
export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  isAdmin = false,
  onImageChange,
  onDeleteImage,
  storageKey,
  containerClassName = '',
  badgePosition,
  showLabel = true,
  show4KBadge = false,
  enableLightbox = true,
  objectFit = 'contain',
  className = '',
  style,
  onClick,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    // Decouple middle card logo from local cache to prevent stale image freezing
    if (storageKey === 'protocol_middle_card_logo' || storageKey === 'protocol_central_logo') {
      return src;
    }
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`app_img_${storageKey}`);
        if (saved !== null) return saved;
      } catch {}
    }
    return src;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [justDeleted, setJustDeleted] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop src if not overridden locally (always direct for decoupled middle card logo)
  useEffect(() => {
    if (storageKey === 'protocol_middle_card_logo' || storageKey === 'protocol_central_logo') {
      setCurrentSrc(src);
      return;
    }
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`app_img_${storageKey}`);
        if (saved !== null) {
          setCurrentSrc(saved);
          return;
        }
      } catch {}
    }
    setCurrentSrc(src);
  }, [src, storageKey]);

  // Reactive listener for middle card logo updates across the system
  useEffect(() => {
    if (storageKey === 'protocol_middle_card_logo' || storageKey === 'protocol_central_logo') {
      const handleDirectMiddleLogoUpdate = (e: any) => {
        const direct = e?.detail;
        if (typeof direct === 'string') {
          setCurrentSrc(direct || src);
        } else if (direct && typeof direct === 'object' && direct.middleCardLogo !== undefined) {
          setCurrentSrc(direct.middleCardLogo || src);
        }
      };
      window.addEventListener('protocol_middle_card_logo_updated', handleDirectMiddleLogoUpdate);
      window.addEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleDirectMiddleLogoUpdate);
      window.addEventListener(PROTOCOL_BRANDING_EVENT, handleDirectMiddleLogoUpdate);
      return () => {
        window.removeEventListener('protocol_middle_card_logo_updated', handleDirectMiddleLogoUpdate);
        window.removeEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleDirectMiddleLogoUpdate);
        window.removeEventListener(PROTOCOL_BRANDING_EVENT, handleDirectMiddleLogoUpdate);
      };
    }
  }, [storageKey, src]);

  const handleTriggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (storageKey) {
      try {
        localStorage.removeItem(`app_img_${storageKey}`);
        if (storageKey === 'protocol_header_logo') {
          localStorage.removeItem('protocol_header_logo');
          window.dispatchEvent(new CustomEvent('protocol_header_logo_updated', { detail: '' }));
          saveAppBrandingToCloud({ headerLogo: '' }).catch(() => {});
        } else if (storageKey === 'protocol_middle_card_logo' || storageKey === 'protocol_central_logo') {
          localStorage.removeItem('protocol_middle_card_logo');
          window.dispatchEvent(new CustomEvent('protocol_middle_card_logo_updated', { detail: '' }));
          saveAppBrandingToCloud({ middleCardLogo: '' }).catch(() => {});
        } else if (storageKey === 'protocol_bottom_nav_fab_icon' || storageKey === 'protocol_fab_icon') {
          localStorage.removeItem('protocol_bottom_nav_fab_icon');
          window.dispatchEvent(new CustomEvent('protocol_bottom_nav_fab_icon_updated', { detail: '' }));
          saveAppBrandingToCloud({ bottomFabIcon: '' }).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to remove app_img:', err);
      }
    }
    setCurrentSrc('');
    if (onImageChange) {
      onImageChange('');
    }
    if (onDeleteImage) {
      onDeleteImage();
    }
    setShowConfirmDelete(false);
    setJustDeleted(true);
    setTimeout(() => setJustDeleted(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const optimized = await processAndOptimizeImage(file);
      setCurrentSrc(optimized);

      const newVersion = Date.now();
      setGlobalBrandingVersion(newVersion);
      await clearAllImageCaches([optimized]);

      if (storageKey) {
        try {
          localStorage.setItem(`app_img_${storageKey}`, optimized);
        } catch (storageErr) {
          console.warn('Failed to save to localStorage:', storageErr);
        }

        // Handle Independent UI Asset Keys without cross-contamination:
        if (storageKey === 'protocol_header_logo') {
          try {
            localStorage.setItem('protocol_header_logo', optimized);
            window.dispatchEvent(
              new CustomEvent('protocol_header_logo_updated', { detail: optimized })
            );
          } catch {}
          saveAppBrandingToCloud({ headerLogo: optimized }).catch((err) =>
            console.warn('Failed to sync header logo to cloud:', err)
          );
        } else if (storageKey === 'protocol_middle_card_logo' || storageKey === 'protocol_central_logo') {
          try {
            localStorage.setItem('protocol_middle_card_logo', optimized);
            localStorage.setItem('app_img_protocol_middle_card_logo', optimized);
            window.dispatchEvent(
              new CustomEvent('protocol_middle_card_logo_updated', { detail: optimized })
            );
          } catch {}
          saveAppBrandingToCloud({ middleCardLogo: optimized }).catch((err) =>
            console.warn('Failed to sync middle card logo to cloud:', err)
          );
        } else if (storageKey === 'protocol_bottom_nav_fab_icon' || storageKey === 'protocol_fab_icon') {
          try {
            localStorage.setItem('protocol_bottom_nav_fab_icon', optimized);
            window.dispatchEvent(
              new CustomEvent('protocol_bottom_nav_fab_icon_updated', { detail: optimized })
            );
          } catch {}
          saveAppBrandingToCloud({ bottomFabIcon: optimized }).catch((err) =>
            console.warn('Failed to sync bottom FAB icon to cloud:', err)
          );
        }
      }

      if (onImageChange) {
        onImageChange(optimized);
      }

      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء تحميل الصورة.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (enableLightbox && currentSrc) {
      e.stopPropagation();
      setIsLightboxOpen(true);
    }
  };

  // Convert any legacy object-cover into object-contain so anatomical figures are never cut off
  const sanitizedClassName = className
    .replace(/\bobject-cover\b/g, 'object-contain')
    .concat(objectFit === 'contain' && !className.includes('object-') ? ' object-contain' : '');

  return (
    <div
      className={`relative group/appimg bg-neutral-950/85 dark:bg-black/90 flex items-center justify-center overflow-hidden ${containerClassName}`}
    >
      {/* Hidden File Input for Camera / Library Upload */}
      {isAdmin && (
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Main Image or Deleted Fallback */}
      {currentSrc ? (
        <>
          <img
            src={getCacheBustedImageUrl(currentSrc)}
            alt={alt}
            referrerPolicy="no-referrer"
            className={`max-h-[450px] w-full h-full object-contain mx-auto block transition-all duration-300 ${
              enableLightbox ? 'cursor-zoom-in hover:brightness-105' : ''
            } ${sanitizedClassName}`}
            style={{
              maxHeight: '450px',
              objectFit: objectFit,
              ...style,
            }}
            onClick={handleImageClick}
            title={enableLightbox ? 'انقر لتكبير ومعاينة الصورة بدقة 4K كاملة' : alt}
            {...props}
          />

          {/* Quick Zoom Indicator Hint on Hover */}
          {enableLightbox && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-2 left-2 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white/90 border border-white/15 opacity-0 group-hover/appimg:opacity-100 transition-opacity cursor-pointer shadow-md"
              title="معاينة بالحجم الكامل 4K"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      ) : (
        <div
          className={`flex flex-col items-center justify-center p-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl min-h-[140px] text-center w-full ${className}`}
          style={style}
        >
          <ImageOff className="w-8 h-8 mb-1.5 opacity-50" />
          <span className="text-xs font-bold">تم حذف الصورة</span>
          {isAdmin && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              (انقر على "استبدال" لإضافة صورة جديدة)
            </span>
          )}
        </div>
      )}

      {/* 4K Real Clinical Photo Badge (Subtle, Non-Obtrusive Overlay) */}
      {show4KBadge && currentSrc && (
        <div
          className="absolute top-2 right-2 z-10 pointer-events-none flex items-center gap-1.5 shadow-md border border-white/15 text-white"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '11px',
          }}
        >
          <Camera className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="font-bold leading-none">صورة سريرية حقيقية 4K</span>
        </div>
      )}

      {/* Admin-Only Universal Upload & Delete Controls (Subtle Overlay positioned cleanly at Top-Left) */}
      {isAdmin && (
        <div
          className={`absolute ${
            badgePosition === 'top-right' && !show4KBadge ? 'top-2 right-2' : 'top-2 left-2'
          } z-20 pointer-events-auto flex items-center gap-1.5`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Replace Button with Exact Requested Overlay Styling */}
          <button
            type="button"
            onClick={handleTriggerUpload}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-white/15 active:scale-95 ${
              justUpdated
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'text-white hover:bg-black/85 hover:border-amber-400 hover:scale-105'
            }`}
            style={{
              background: justUpdated ? undefined : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
            }}
            title="استبدال هذه الصورة بصورة جديدة من الكاميرا أو الألبوم"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                <span className="font-bold">معالجة...</span>
              </>
            ) : justUpdated ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span className="font-bold">تم الحفظ!</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-amber-300" />
                {showLabel && <span className="font-bold leading-none">استبدال الصورة 📷</span>}
              </>
            )}
          </button>

          {/* Delete Image Button (Admin Only) */}
          {currentSrc && (
            showConfirmDelete ? (
              <div
                className="flex items-center gap-1 border border-rose-500 shadow-xl animate-in fade-in"
                style={{
                  background: 'rgba(0, 0, 0, 0.85)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '8px',
                  padding: '4px 6px',
                  fontSize: '11px',
                }}
              >
                <span className="text-[10px] text-white font-bold">تأكيد الحذف؟</span>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black cursor-pointer"
                  title="تأكيد حذف الصورة"
                >
                  نعم
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(false);
                  }}
                  className="px-1.5 py-0.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(true);
                }}
                className="text-white border border-white/15 shadow-md transition-all cursor-pointer hover:bg-rose-600 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: '8px',
                  padding: '5px',
                  fontSize: '11px',
                }}
                title="حذف هذه الصورة (للمشرف فقط)"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )
          )}

          {justDeleted && (
            <span
              className="text-white font-black animate-in fade-in shadow-md"
              style={{
                background: 'rgba(225, 29, 72, 0.9)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '10px',
              }}
            >
              تم الحذف! 🗑️
            </span>
          )}
        </div>
      )}

      {/* 4K High-Res Fullscreen Lightbox Modal */}
      {enableLightbox && currentSrc && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={currentSrc}
          alt={alt}
          title={alt}
          isAdmin={isAdmin}
          onTriggerReplace={isAdmin ? () => fileInputRef.current?.click() : undefined}
        />
      )}
    </div>
  );
};
