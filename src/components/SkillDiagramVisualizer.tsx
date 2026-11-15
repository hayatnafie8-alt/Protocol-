import React, { useState, useRef } from 'react';
import {
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Eye,
  EyeOff,
  Compass,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  RotateCw,
  Upload,
} from 'lucide-react';
import {
  SkillItem,
  ClinicalPhotoAsset,
  getDefaultPhotosForSkill,
  getDefaultPrimaryPhotoForSkill,
} from '../data/clinicalSkillsData';
import { processAndOptimizeImage } from '../utils/imageUploadHelper';

interface SkillDiagramVisualizerProps {
  skill: SkillItem;
  className?: string;
  showGalleryControls?: boolean;
  isAdmin?: boolean;
  onReplacePhoto?: (photoIndex: number, newUrl: string) => void;
  onOpenPhotoLightbox?: (photo: ClinicalPhotoAsset) => void;
}

export const SkillDiagramVisualizer: React.FC<SkillDiagramVisualizerProps> = ({
  skill,
  className = '',
  showGalleryControls = true,
  isAdmin = false,
  onReplacePhoto,
  onOpenPhotoLightbox,
}) => {
  const photos =
    skill.clinicalPhotos && skill.clinicalPhotos.length > 0
      ? skill.clinicalPhotos
      : getDefaultPhotosForSkill(skill.diagramType, skill.id);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  // Dynamic Image Replacement File Input Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const optimizedUrl = await processAndOptimizeImage(file);
      if (onReplacePhoto) {
        onReplacePhoto(activePhotoIndex, optimizedUrl);
      }
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Lightbox & Zoom States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showLandmarkOverlay, setShowLandmarkOverlay] = useState(true);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  const handleOpenLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenPhotoLightbox) {
      onOpenPhotoLightbox(currentPhoto);
    } else {
      setIsLightboxOpen(true);
      setZoomLevel(1);
      setRotation(0);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 4.0));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Panning & Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Pinch-to-Zoom & Touch Panning Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchDistanceRef.current = dist;
      initialZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1) {
      // Single finger drag start (if zoomed in)
      if (zoomLevel > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - panOffset.x,
          y: e.touches[0].clientY - panOffset.y,
        };
      }
      // Check for double tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap toggle zoom
        if (zoomLevel > 1) {
          handleResetZoom();
        } else {
          setZoomLevel(2.2);
        }
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      // Pinching
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = currentDist / touchDistanceRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * ratio, 1), 4.0);
      setZoomLevel(newZoom);
      if (newZoom === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      // Panning with single finger
      setPanOffset({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4.0));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <div className={`space-y-3 select-none ${className}`}>
      {/* Hidden File Input for Admin Image Replacement */}
      {isAdmin && (
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Main Clinical Photo Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-700/80 bg-black/90 group shadow-md">
        {/* Top Badges: Real Intraoral Photography & Camera Angle (Clean Non-Obtrusive Overlays) */}
        <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-white flex items-center gap-1.5 shadow-md border border-white/15"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                color: 'white',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
              }}
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold leading-none">📷 صورة سريرية حقيقية 4K</span>
            </span>

            {currentPhoto.magnification && (
              <span
                className="text-white hidden sm:inline-block border border-white/15 font-bold"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                }}
              >
                {currentPhoto.magnification}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Admin-Only Dynamic Image Replacement Trigger */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploadingPhoto}
                className="text-white font-bold border border-white/15 flex items-center gap-1.5 shadow-md transition-all cursor-pointer pointer-events-auto hover:bg-black/85 hover:border-amber-400 active:scale-95"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                }}
                title="استبدال الصورة السريرية بصورة من جهازك أو الكاميرا"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span className="leading-none">{isUploadingPhoto ? 'معالجة...' : '📷 استبدال الصورة'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenLightbox}
              className="text-white border border-white/15 transition-all cursor-pointer shadow-md hover:bg-black/85"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
              }}
              title="تكبير ملء الشاشة (Pinch-to-zoom Lightbox 4K)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real Intraoral Photograph Container */}
        <div
          onClick={handleOpenLightbox}
          style={{ width: '100%', maxHeight: '70vh', borderRadius: '12px' }}
          className="relative w-full max-h-[70vh] bg-neutral-950 overflow-hidden cursor-zoom-in flex items-center justify-center rounded-[12px] p-1 sm:p-2"
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title || skill.title}
            referrerPolicy="no-referrer"
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' }}
            className="w-full max-h-[70vh] object-contain rounded-[12px] transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />

          {/* Interactive Landmark Pins / Callout Overlay */}
          {showLandmarkOverlay && currentPhoto.landmarksIdentified && currentPhoto.landmarksIdentified.length > 0 && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wide">
                    المعالم التشريحية المحددة بالصورة (Landmarks):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentPhoto.landmarksIdentified.map((lm, idx) => (
                    <span
                      key={`lm_top_${lm}_${idx}`}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-black/75 text-white backdrop-blur-md border border-amber-400/40"
                    >
                      {lm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hover instruction prompt */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-2xl bg-black/75 text-white backdrop-blur-md text-xs font-bold border border-white/20 flex items-center gap-2 shadow-xl">
              <ZoomIn className="w-4 h-4 text-amber-300" />
              <span>انقر لتكبير وفحص الصورة السريرية عالية الدقة</span>
            </span>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="p-3 bg-neutral-900/90 border-t border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
              {currentPhoto.cameraAngle || 'زاوية ماكرو عيادية'}
            </span>
            <span className="font-bold text-neutral-200 line-clamp-1">{currentPhoto.title}</span>
          </div>

          {currentPhoto.clinicalPhase && (
            <span className="text-[11px] text-neutral-400 font-medium line-clamp-1">
              المرحلة: <span className="text-white font-bold">{currentPhoto.clinicalPhase}</span>
            </span>
          )}
        </div>
      </div>

      {/* Gallery Thumbnails Strip (if multiple photos exist) */}
      {showGalleryControls && photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={`${p.id || 'photo'}_${idx}`}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 w-20 sm:w-24 aspect-video bg-neutral-800 ${
                activePhotoIndex === idx
                  ? 'border-[#596628] scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={p.url}
                alt={p.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-neutral-950"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5 truncate px-1">
                صورة {idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* HIGH-RESOLUTION INTRAORAL CLINICAL LIGHTBOX MODAL            */}
      {/* Clean Vertical Layout & Un-compressed Content Below Image    */}
      {/* ============================================================ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto select-none animate-in fade-in duration-200"
          style={{
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100vh',
            padding: '16px',
            background: '#111827',
          }}
          onClick={() => {
            if (zoomLevel > 1) {
              handleResetZoom();
            } else {
              setIsLightboxOpen(false);
            }
          }}
        >
          {/* Top Header Bar with Centered 4K Badge (Outside Image Boundary) */}
          <div
            className="w-full flex items-center justify-between gap-4 pb-3 mb-3 border-b border-gray-800 text-white z-10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gallery Indicator / Counter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">
                صورة {activePhotoIndex + 1} من {photos.length}
              </span>
            </div>

            {/* Top Header Badge ("فحص الصور السريرية 4K") at Top Center */}
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#596628] text-white shadow-md flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>فحص الصور السريرية 4K</span>
              </span>
            </div>

            {/* Close Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-gray-800 hover:bg-rose-600 text-white transition-colors cursor-pointer border border-gray-700 shadow-md"
              title="إغلاق المعاينة (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dedicated High-Res Image Viewport Container */}
          <div
            className="relative w-full max-h-[60vh] flex items-center justify-center mb-4 rounded-xl overflow-hidden shrink-0 bg-black/80"
            style={{
              width: '100%',
              maxHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (zoomLevel > 1) {
                handleResetZoom();
              } else {
                setZoomLevel(2.2);
              }
            }}
          >
            {/* Floating Image Toolbar (Zoom in/out, Rotate, Reset) positioned top-left */}
            <div
              className="flex items-center gap-1 p-1 shadow-lg border border-white/10"
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                borderRadius: '8px',
                zIndex: 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تكبير (Zoom in)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-white">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تصغير (Zoom out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="تدوير الصورة 90 درجة"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="إعادة التعيين 100%"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowLandmarkOverlay((prev) => !prev)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  showLandmarkOverlay ? 'bg-amber-400 text-amber-950' : 'hover:bg-white/20 text-white'
                }`}
                title="إظهار/إخفاء المعالم التشريحية"
              >
                {showLandmarkOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Admin "📷 استبدال الصورة" Button positioned top-right as compact action pill */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploadingPhoto}
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 20,
                  padding: '6px 12px',
                  fontSize: '12px',
                }}
                title="استبدال الصورة السريرية بصورة من جهازك أو الكاميرا"
              >
                <Camera className="w-3.5 h-3.5 text-amber-950" />
                <span>{isUploadingPhoto ? 'معالجة...' : '📷 استبدال الصورة'}</span>
              </button>
            )}

            {/* Dedicated High-Res Image with 100% full aspect ratio containment */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-100 select-none"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              draggable={false}
            />

            {/* Next / Previous Photos in Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                    handleResetZoom();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer shadow-lg z-20"
                  title="الصورة السابقة"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                    handleResetZoom();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer shadow-lg z-20"
                  title="الصورة التالية"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Un-compressed Title & Description Section (Below Image Container) */}
          <div
            className="w-full text-right space-y-3 shrink-0 pb-4"
            style={{
              textAlign: 'right',
              width: '100%',
              wordBreak: 'normal',
              whiteSpace: 'normal',
              color: '#f3f4f6',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                {currentPhoto.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                {currentPhoto.cameraAngle && (
                  <span className="px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                    {currentPhoto.cameraAngle}
                  </span>
                )}
                {currentPhoto.magnification && (
                  <span className="px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
                    {currentPhoto.magnification}
                  </span>
                )}
              </div>
            </div>

            {/* Clinical Description */}
            {currentPhoto.caption && (
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                {currentPhoto.caption}
              </p>
            )}

            {/* Anatomical Badges (المعالم الواضحة بالعدسة) */}
            {currentPhoto.landmarksIdentified && currentPhoto.landmarksIdentified.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-amber-400 block mb-2">
                  المعالم الواضحة بالعدسة:
                </span>
                <div
                  className="flex flex-wrap gap-2 justify-start"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    justifyContent: 'flex-start',
                    marginTop: '12px',
                  }}
                >
                  {currentPhoto.landmarksIdentified.map((lm, i) => (
                    <span
                      key={`lm_bottom_${lm}_${i}`}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-amber-300 text-xs font-mono font-bold shadow-xs hover:border-amber-400/50 transition-colors"
                    >
                      ✓ {lm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
