import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { DoctorProfileAvatar } from './DoctorProfileAvatar';
import { AppImage } from './AppImage';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { saveAppBrandingToCloud } from '../services/realTimeSyncService';
import {
  PROTOCOL_MIDDLE_CARD_LOGO_KEY,
  PROTOCOL_MIDDLE_CARD_LOGO_EVENT,
  PROTOCOL_BRANDING_EVENT,
  clearAllImageCaches,
  setGlobalBrandingVersion,
  getCacheBustedImageUrl,
} from '../utils/cacheBuster';
import { compressImageForCloud } from '../utils/imageOptimizer';

interface BrainToothBannerProps {
  className?: string;
  stealthMode?: boolean;
  isAdmin?: boolean;
}

export const BrainToothBanner: React.FC<BrainToothBannerProps> = ({
  className = '',
  stealthMode = false,
  isAdmin = false,
}) => {
  // Decoupled state management for the central card logo directly bound to the primary database
  const [middleLogoSrc, setMiddleLogoSrc] = useState<string>(() => {
    // Read from independent global key or fallback, avoiding local component cache
    try {
      const stored = localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
      if (!stored || stored === '/protocol_logo.png') {
        return '/protocol_circular_logo.png';
      }
      return stored;
    } catch {
      return '/protocol_circular_logo.png';
    }
  });

  const [logoVersion, setLogoVersion] = useState<number>(() => Date.now());

  // Connect directly to primary database (Firestore) and decouple from local cache
  useEffect(() => {
    // 1. Decouple from local component cache: proactively purge any legacy local cache key
    try {
      localStorage.removeItem('app_img_protocol_middle_card_logo');
    } catch {}

    let isMounted = true;

    // 2. Proactive initial fetch directly from the primary database (Firestore)
    getDoc(doc(db, 'app_config', 'asset_middle_card_logo'))
      .then((snap) => {
        if (!isMounted) return;
        if (snap.exists() && snap.data()?.data) {
          const freshData = snap.data().data;
          setMiddleLogoSrc(freshData);
          setLogoVersion(snap.data().version || Date.now());
        } else {
          // Fallback check on branding_settings manifest
          getDoc(doc(db, 'app_config', 'branding_settings')).then((bSnap) => {
            if (!isMounted) return;
            if (bSnap.exists()) {
              const bData = bSnap.data();
              if (bData.middleCardLogo && bData.middleCardLogo !== '__stored_in_dedicated_asset__') {
                setMiddleLogoSrc(bData.middleCardLogo);
                setLogoVersion(Date.now());
              }
            }
          });
        }
      })
      .catch((err) => console.warn('Error fetching primary middle card logo:', err));

    // 3. Real-time Cloud Firestore snapshot listener (Live subscription to primary base)
    const unsubMiddleDoc = onSnapshot(
      doc(db, 'app_config', 'asset_middle_card_logo'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists() && snap.data()?.data !== undefined) {
          const cloudSrc = snap.data().data;
          setMiddleLogoSrc(cloudSrc || '/protocol_circular_logo.png');
          setLogoVersion(snap.data().version || Date.now());
        }
      },
      (err) => console.warn('Real-time listener on asset_middle_card_logo error:', err)
    );

    const unsubBrandingSettings = onSnapshot(
      doc(db, 'app_config', 'branding_settings'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const bData = snap.data();
          if (bData.middleCardLogo && bData.middleCardLogo !== '__stored_in_dedicated_asset__') {
            setMiddleLogoSrc(bData.middleCardLogo);
            setLogoVersion(Date.now());
          }
        }
      },
      (err) => console.warn('Real-time listener on branding_settings error:', err)
    );

    // 4. Reactive custom event listeners within the app
    const handleReactiveLogoUpdate = (e: any) => {
      if (!isMounted) return;
      const detail = e?.detail;
      let freshSrc: string | null = null;
      if (typeof detail === 'string' && detail) {
        freshSrc = detail;
      } else if (detail && typeof detail === 'object' && detail.middleCardLogo !== undefined) {
        freshSrc = detail.middleCardLogo;
      } else {
        freshSrc =
          localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY) ||
          localStorage.getItem('app_img_protocol_middle_card_logo') ||
          '/protocol_logo.png';
      }
      setMiddleLogoSrc(freshSrc || '/protocol_logo.png');
      setLogoVersion(Date.now());
    };

    window.addEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleReactiveLogoUpdate);
    window.addEventListener(PROTOCOL_BRANDING_EVENT, handleReactiveLogoUpdate);
    window.addEventListener('storage', handleReactiveLogoUpdate);

    return () => {
      isMounted = false;
      unsubMiddleDoc();
      unsubBrandingSettings();
      window.removeEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleReactiveLogoUpdate);
      window.removeEventListener(PROTOCOL_BRANDING_EVENT, handleReactiveLogoUpdate);
      window.removeEventListener('storage', handleReactiveLogoUpdate);
    };
  }, []);

  // Cache-busting parameter directly injected into the logo request URL (e.g. ?v=[timestamp])
  const cacheBustedLogoUrl = useMemo(() => {
    const raw = (!middleLogoSrc || middleLogoSrc === '/protocol_logo.png')
      ? '/protocol_circular_logo.png'
      : middleLogoSrc;
    return getCacheBustedImageUrl(raw, logoVersion);
  }, [middleLogoSrc, logoVersion]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميجابايت.');
      return;
    }

    try {
      const optimized = await compressImageForCloud(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        maxSizeBytes: 80 * 1024,
      });
      await handleLogoChange(optimized);
    } catch {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          await handleLogoChange(base64);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleLogoChange = async (newUrl: string) => {
    setMiddleLogoSrc(newUrl);
    const newV = Date.now();
    setLogoVersion(newV);
    setGlobalBrandingVersion(newV);
    await clearAllImageCaches([newUrl]);
    await saveAppBrandingToCloud({ middleCardLogo: newUrl });
  };

  const handleDeleteLogo = async () => {
    setMiddleLogoSrc('/protocol_circular_logo.png');
    const newV = Date.now();
    setLogoVersion(newV);
    setGlobalBrandingVersion(newV);
    await clearAllImageCaches(['/protocol_circular_logo.png']);
    await saveAppBrandingToCloud({ middleCardLogo: '/protocol_circular_logo.png' });
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-[#E5DEC9] dark:border-[#3E4A2E] shadow-lg bg-[#EFECE4] dark:bg-[#1A1F15] transition-all duration-300 ${className}`}
      style={{ minHeight: '220px' }}
    >
      {/* Background Graphic - Image from user's upload / generated asset */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AppImage
          src="/app_banner.jpg"
          alt="Brain and Tooth Line Art - Dental & Neurology Guide"
          isAdmin={isAdmin}
          storageKey="banner_main_bg"
          badgePosition="top-left"
          enableLightbox={false}
          objectFit="cover"
          className="w-full h-full object-cover object-center opacity-90 dark:opacity-80"
          containerClassName="w-full h-full"
        />
        {/* Subtle Warm Gradient Overlay for contrast and elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#EFECE4]/90 via-[#EFECE4]/30 to-transparent dark:from-[#141712]/95 dark:via-[#141712]/40 dark:to-transparent pointer-events-none" />
      </div>

      {/* Vector Line Art Elements (Brain on Left, Central Logo, Tooth on Right) */}
      <div className="relative z-10 w-full h-full min-h-[220px] p-6 sm:p-8 flex flex-col justify-between">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#59662C]/15 dark:bg-[#A4BF46]/20 text-[#59662C] dark:text-[#CBE276] backdrop-blur-md border border-[#59662C]/30">
            {stealthMode ? 'وضع العرض الأكاديمي المحمي' : 'المرجع السريري لترميم الأسنان'}
          </span>

          <span className="text-[11px] font-bold text-[#6D675A] dark:text-[#A7A08E] bg-white/70 dark:bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs border border-[#E5DEC9] dark:border-white/10">
            جامعة المعارف - كلية طب الأسنان
          </span>
        </div>

        {/* Central Emblem Art & Brain-Tooth Hybrid - Crisp 1:1 High-Res Logo with Forced Cache-Busting */}
        <div className="my-auto py-2 text-center flex flex-col items-center justify-center">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 dark:bg-[#1E2417] backdrop-blur-md border-2 border-[#59662C]/30 dark:border-[#A4BF46]/40 shadow-md mb-2 p-1.5 flex items-center justify-center hover:scale-105 transition-all overflow-hidden relative group/midlogo"
            data-testid="middle-card-logo-container"
          >
            {/* Directly bound to primary database with forced cache-busting timestamp */}
            <img
              src={cacheBustedLogoUrl}
              alt="شعار الكارد الوسطي - بروتوكول"
              className="w-full h-full object-contain aspect-square select-none pointer-events-auto"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('/protocol_circular_logo.png')) {
                  target.src = `/protocol_circular_logo.png?v=${Date.now()}`;
                }
              }}
            />

            {/* Admin Controls Overlay for Middle Card Logo */}
            {isAdmin && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/midlogo:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 rounded-xl z-20">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-[#59662C] hover:bg-[#475223] text-white transition-colors cursor-pointer shadow-sm"
                  title="تغيير شعار الكارد"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                {middleLogoSrc && middleLogoSrc !== '/protocol_circular_logo.png' && middleLogoSrc !== '/brand_new_circular_logo.png' && middleLogoSrc !== '/protocol_logo.png' && (
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-sm"
                    title="استعادة الشعار الافتراضي"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-3xl sm:text-5xl font-black text-[#59662C] dark:text-[#A4BF46] font-['Cairo',sans-serif] tracking-tight drop-shadow-xs">
              بروتوكول
            </h1>
            <span className="text-xs sm:text-sm font-black tracking-[0.3em] text-[#59662C]/85 dark:text-[#A4BF46]/85 font-mono uppercase mt-1">
              PROTOCOL
            </span>
          </div>
        </div>

        {/* Bottom Prominent Name Banner: د. حياه نافع فجر with DoctorProfileAvatar */}
        <div className="pt-2 border-t border-[#59662C]/20 dark:border-white/10 text-center">
          <div className="inline-block bg-white/90 dark:bg-[#181C14]/90 backdrop-blur-md px-6 py-2 rounded-2xl border border-[#59662C]/30 dark:border-[#A4BF46]/40 shadow-sm">
            {stealthMode ? (
              <>
                <h2 className="text-lg sm:text-xl font-black text-[#2F2B24] dark:text-white tracking-tight">
                  المرجع السريري: <span className="text-[#59662C] dark:text-[#A4BF46]">بروتوكول طب الأسنان</span>
                </h2>
                <p className="text-[11px] text-[#6F695C] dark:text-[#A7A08E] font-bold mt-0.5">
                  عرض سريري تعليمي مجهل الهوية • وضع الشبح نشط
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <DoctorProfileAvatar size="sm" showBadge={true} />
                <div className="text-right">
                  <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white tracking-tight leading-snug">
                    إعداد وتصميم: <span className="text-[#59662C] dark:text-[#A4BF46]">د. حياه نافع فجر</span>
                  </h2>
                  <p className="text-[11px] text-[#6F695C] dark:text-[#A7A08E] font-bold mt-0.5">
                    مرحلة رابعة - كلية طب الأسنان - جامعة المعارف
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
