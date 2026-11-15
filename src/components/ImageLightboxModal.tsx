import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Camera,
  ExternalLink,
  Download,
} from 'lucide-react';

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  title?: string;
  isAdmin?: boolean;
  onTriggerReplace?: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = 'صورة سريرية عالية الدقة',
  title,
  isAdmin = false,
  onTriggerReplace,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  // Reset zoom & pan when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, imageUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (zoomLevel > 1) {
          setZoomLevel(1);
          setRotation(0);
          setPan({ x: 0, y: 0 });
        } else {
          onClose();
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomLevel, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.35, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Double click toggles between 100% and 200%
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    } else {
      setZoomLevel(2);
    }
  };

  // Dragging / panning when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for Pinch-to-Zoom, Panning & Double-Tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two finger pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1) {
      // Single finger tap or drag
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap toggle
        if (zoomLevel > 1) {
          handleResetZoom();
        } else {
          setZoomLevel(2.5);
        }
      }
      lastTapRef.current = now;
      touchStartYRef.current = e.touches[0].clientY;

      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Pinch to zoom
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleDelta = dist / touchStartDistRef.current;
      const nextZoom = Math.min(Math.max(touchStartZoomRef.current * scaleDelta, 1), 4.5);
      setZoomLevel(nextZoom);
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      // Pan image
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 1 && zoomLevel <= 1 && touchStartYRef.current !== null) {
      // Swipe down to dismiss check
      const deltaY = e.touches[0].clientY - touchStartYRef.current;
      if (deltaY > 140) {
        onClose();
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.2, 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto select-none animate-fadeIn"
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
          onClose();
        }
      }}
    >
      {/* Top Header Bar with Centered 4K Badge (Outside Image Boundary) */}
      <div
        className="w-full flex items-center justify-between gap-4 pb-3 mb-3 border-b border-gray-800 text-white z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
            معاينة كاملة الدقة
          </span>
        </div>

        {/* Top Header Badge ("فحص الصور السريرية 4K") at Top Center */}
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#596628] text-white shadow-md flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>فحص الصور السريرية 4K</span>
          </span>
        </div>

        {/* Close Button & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer hidden sm:flex items-center justify-center border border-gray-700 shadow-sm"
            title={isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-rose-600 text-white transition-colors cursor-pointer border border-gray-700 shadow-md"
            title="إغلاق المعاينة (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating Image Toolbar (Zoom, Rotate, Reset) positioned top-left */}
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
        </div>

        {/* Admin "📷 استبدال الصورة" Button positioned top-right as compact action pill */}
        {isAdmin && onTriggerReplace && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTriggerReplace();
            }}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 20,
              padding: '6px 12px',
              fontSize: '12px',
            }}
            title="استبدال هذه الصورة بصورة من جهازك أو الكاميرا"
          >
            <Camera className="w-3.5 h-3.5 text-amber-950" />
            <span>📷 استبدال الصورة</span>
          </button>
        )}

        {/* Dedicated High-Res Image with 100% full aspect ratio containment */}
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-75 select-none"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          draggable={false}
          onClick={(e) => {
            if (zoomLevel === 1) {
              e.stopPropagation();
              handleZoomIn(e);
            }
          }}
        />
      </div>

      {/* Un-compressed Title & Description Section (Below Image Container) */}
      <div
        className="w-full text-right space-y-2 shrink-0 pb-4"
        style={{
          textAlign: 'right',
          width: '100%',
          wordBreak: 'normal',
          whiteSpace: 'normal',
          color: '#f3f4f6',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
          {title || alt}
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed font-normal">
          جودة سريرية أصلية 100% بدون أي قص أو ضغط • دقة فائقة لفحص الحواف والميزاب اللثوي ومعالم السن.
        </p>

        <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400">
          <span>🔍 انقر نقراً مزدوجاً للتكبير السريع</span>
          <span>•</span>
          <span>🖱️ استخدم عجلة الماوس أو اللمس للتحريك</span>
          <span>•</span>
          <span>✕ اضغط Esc للإغلاق</span>
        </div>
      </div>
    </div>
  );
};
