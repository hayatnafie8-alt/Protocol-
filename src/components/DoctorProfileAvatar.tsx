import React, { useState, useEffect, useRef } from 'react';
import defaultAvatar from '../assets/images/doctor_profile_avatar_1790514553496.jpg';
import { Camera, Check, RotateCcw, ShieldCheck, Sparkles, User, RefreshCw } from 'lucide-react';
import { saveAppBrandingToCloud } from '../services/realTimeSyncService';
import {
  getCacheBustedImageUrl,
  clearAllImageCaches,
  getGlobalBrandingVersion,
  setGlobalBrandingVersion,
  PROTOCOL_BRANDING_EVENT,
  PROTOCOL_SUPERVISOR_AVATAR_EVENT,
  fetchCentralBrandingDirectly,
  applyCentralBrandingLocally,
  PROTOCOL_SUPERVISOR_AVATAR_KEY,
  PROTOCOL_USER_AVATAR_KEY,
} from '../utils/cacheBuster';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImageForCloud, compressAvatarForCloud } from '../utils/imageOptimizer';

export const DOCTOR_AVATAR_STORAGE_KEY = 'dental_doctor_avatar';
export const USER_AVATAR_STORAGE_KEY = 'protocol_user_avatar';
export const DOCTOR_AVATAR_EVENT = 'dental_doctor_avatar_updated';

export interface DoctorProfileAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textPosition?: 'right' | 'left' | 'bottom';
  subtitle?: string;
  isEditable?: boolean;
  className?: string;
  avatarClassName?: string;
  onClick?: () => void;
  showBadge?: boolean;
}

export const DoctorProfileAvatar: React.FC<DoctorProfileAvatarProps> = ({
  size = 'md',
  showText = false,
  textPosition = 'left',
  subtitle = 'جامعة المعارف • كلية طب الأسنان',
  isEditable = false,
  className = '',
  avatarClassName = '',
  onClick,
  showBadge = true,
}) => {
  const [avatarVersion, setAvatarVersion] = useState<number>(() => getGlobalBrandingVersion());
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(USER_AVATAR_STORAGE_KEY) ||
        localStorage.getItem(DOCTOR_AVATAR_STORAGE_KEY) ||
        defaultAvatar
      );
    } catch {
      return defaultAvatar;
    }
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with Cloud Firestore, localStorage updates across tabs/components, and custom branding events
  useEffect(() => {
    let isMounted = true;

    // 1. Proactive initial sync directly from Cloud Firestore
    fetchCentralBrandingDirectly()
      .then((central) => {
        if (!isMounted) return;
        if (central?.supervisorAvatar) {
          applyCentralBrandingLocally(central);
          setAvatarSrc(central.supervisorAvatar);
          setAvatarVersion(Date.now());
        }
      })
      .catch(() => {});

    // 2. Real-time Cloud Firestore snapshot listener on asset_supervisor_avatar
    const unsubAvatarDoc = onSnapshot(
      doc(db, 'app_config', 'asset_supervisor_avatar'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists() && snap.data()?.data !== undefined) {
          const cloudSrc = snap.data().data || defaultAvatar;
          setAvatarSrc(cloudSrc);
          setAvatarVersion(snap.data().version || Date.now());
          try {
            if (snap.data().data) {
              localStorage.setItem(USER_AVATAR_STORAGE_KEY, snap.data().data);
              localStorage.setItem(DOCTOR_AVATAR_STORAGE_KEY, snap.data().data);
            }
          } catch {}
        }
      },
      (err) => console.warn('Real-time listener on asset_supervisor_avatar notice:', err)
    );

    // 3. Real-time Cloud Firestore snapshot listener on branding_settings
    const unsubBrandingSettings = onSnapshot(
      doc(db, 'app_config', 'branding_settings'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const bData = snap.data();
          if (bData.supervisorAvatar && bData.supervisorAvatar !== '__stored_in_dedicated_asset__') {
            setAvatarSrc(bData.supervisorAvatar);
            setAvatarVersion(Date.now());
          }
        }
      },
      (err) => console.warn('Real-time listener on branding_settings avatar notice:', err)
    );

    // 4. In-App Reactive Custom Event Listeners
    const handleAvatarUpdate = (e?: any) => {
      if (!isMounted) return;
      try {
        const detail = e?.detail;
        let freshSrc: string | null = null;
        if (typeof detail === 'string' && detail) {
          freshSrc = detail;
        } else if (detail && typeof detail === 'object' && detail.supervisorAvatar !== undefined) {
          freshSrc = detail.supervisorAvatar || null;
        } else {
          freshSrc =
            localStorage.getItem(USER_AVATAR_STORAGE_KEY) ||
            localStorage.getItem(DOCTOR_AVATAR_STORAGE_KEY);
        }
        setAvatarSrc(freshSrc || defaultAvatar);
        setAvatarVersion(getGlobalBrandingVersion() || Date.now());
      } catch {}
    };

    window.addEventListener(DOCTOR_AVATAR_EVENT, handleAvatarUpdate);
    window.addEventListener(PROTOCOL_SUPERVISOR_AVATAR_EVENT, handleAvatarUpdate);
    window.addEventListener(PROTOCOL_BRANDING_EVENT, handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);

    return () => {
      isMounted = false;
      unsubAvatarDoc();
      unsubBrandingSettings();
      window.removeEventListener(DOCTOR_AVATAR_EVENT, handleAvatarUpdate);
      window.removeEventListener(PROTOCOL_SUPERVISOR_AVATAR_EVENT, handleAvatarUpdate);
      window.removeEventListener(PROTOCOL_BRANDING_EVENT, handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميغابايت.');
        return;
      }
      setIsForceSyncing(true);
      setSyncFeedback('جاري ضغط الصورة للمزامنة السحابية الفورية الآمنة...');
      try {
        const optimized = await compressAvatarForCloud(file);
        await saveNewAvatar(optimized);
        setSyncFeedback('تم الحفظ والمزامنة السحابية بنجاح لكافة المشتركين ✅');
      } catch (err: any) {
        console.error('Failed to compress avatar:', err);
        setSyncFeedback(err?.message || 'حدث خطأ أثناء معالجة الصورة.');
      } finally {
        setIsForceSyncing(false);
        setTimeout(() => setSyncFeedback(null), 3500);
      }
    }
  };

  const saveNewAvatar = async (newSrc: string) => {
    try {
      // Ensure image is cloud-safe even if provided from external source
      const finalSrc =
        newSrc.startsWith('data:image/') && newSrc.length > 50 * 1024
          ? await compressAvatarForCloud(newSrc)
          : newSrc;

      localStorage.setItem(USER_AVATAR_STORAGE_KEY, finalSrc);
      localStorage.setItem(DOCTOR_AVATAR_STORAGE_KEY, finalSrc);
      setAvatarSrc(finalSrc);
      const newVersion = Date.now();
      setAvatarVersion(newVersion);
      setGlobalBrandingVersion(newVersion);
      await clearAllImageCaches([finalSrc]);

      window.dispatchEvent(new Event(DOCTOR_AVATAR_EVENT));
      window.dispatchEvent(new Event('storage'));

      // Central Cloud Firestore Real-time Synchronization (Guaranteed tiny ~35KB payload)
      await saveAppBrandingToCloud({ supervisorAvatar: finalSrc });

      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to save avatar:', err);
      setSyncFeedback('تعذر الحفظ السحابي، تم الحفظ محلياً.');
    }
  };

  const handleResetToDefault = async () => {
    try {
      localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
      localStorage.removeItem(DOCTOR_AVATAR_STORAGE_KEY);
      setAvatarSrc(defaultAvatar);
      const newVersion = Date.now();
      setAvatarVersion(newVersion);
      setGlobalBrandingVersion(newVersion);
      await clearAllImageCaches([defaultAvatar]);

      window.dispatchEvent(new Event(DOCTOR_AVATAR_EVENT));
      window.dispatchEvent(new Event('storage'));

      // Central Cloud Reset
      saveAppBrandingToCloud({ supervisorAvatar: '' }).catch(() => {});

      setShowEditModal(false);
    } catch {}
  };

  // Dimensions
  const sizeStyles = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const badgeSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <>
      <div
        className={`inline-flex items-center gap-2.5 ${className} ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        {/* Avatar Ring Container with Olive Green / Beige Border Accent */}
        <div
          className={`relative shrink-0 group ${
            isEditable ? 'cursor-pointer' : ''
          }`}
          onClick={(e) => {
            if (isEditable) {
              e.stopPropagation();
              setShowEditModal(true);
            }
          }}
          title={isEditable ? 'انقر لتغيير الصورة الشخصية للدكتورة' : 'د. حياه نافع فجر'}
        >
          <div
            className={`${sizeStyles[size]} rounded-full p-[2px] bg-gradient-to-tr from-[#59662C] via-[#8E9F4B] to-[#D5CDBC] dark:from-[#7D9333] dark:via-[#A4BF46] dark:to-[#434F2C] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${avatarClassName}`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] dark:bg-[#1A2013] border border-white/60 dark:border-white/10 relative">
              <img
                src={getCacheBustedImageUrl(avatarSrc, avatarVersion)}
                alt="د. حياه نافع فجر"
                loading="eager"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = defaultAvatar;
                }}
              />
            </div>
          </div>

          {/* Verified Doctor Shield Badge / Online Dot */}
          {showBadge && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-[#59662C] text-white flex items-center justify-center p-0.5 shadow-sm border-2 border-white dark:border-[#181C14] ${badgeSizes[size]}`}
              title="موثق: د. حياه نافع فجر"
            >
              <ShieldCheck className="w-full h-full text-white" />
            </div>
          )}

          {/* Change Avatar Overlay on Hover when Editable */}
          {isEditable && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Text Container: "إعداد وتصميم: د. حياه نافع فجر" */}
        {showText && (
          <div className="flex flex-col text-right leading-tight select-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] sm:text-xs font-black text-[#2F2B24] dark:text-white tracking-tight">
                إعداد وتصميم: <span className="text-[#59662C] dark:text-[#A4BF46]">د. حياه نافع فجر</span>
              </span>
            </div>
            {subtitle && (
              <span className="text-[10px] sm:text-[11px] font-bold text-[#736C5F] dark:text-[#A7A08E] mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Avatar Modal (Customizable - "قابلة للتغير") */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1A2014] rounded-3xl p-6 sm:p-7 max-w-sm w-full border-2 border-[#59662C]/30 dark:border-[#384524] shadow-2xl space-y-5 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#343E26]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#59662C]/15 text-[#59662C] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2F2B24] dark:text-white">
                    تغيير الصورة الشخصية للدكتورة
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold block">
                    قابلة للتغيير وتجاوز الكاش الفوري
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Avatar Preview with Cache-Busted URL */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#59662C] to-[#A4BF46] shadow-md">
                <img
                  src={getCacheBustedImageUrl(avatarSrc, avatarVersion)}
                  alt="Doctor Avatar Preview"
                  className="w-full h-full rounded-full object-cover object-center bg-[#FAF7F2]"
                />
              </div>
              <span className="text-xs font-bold text-[#59662C] dark:text-[#A4BF46]">
                د. حياه نافع فجر
              </span>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#59662C] hover:bg-[#485324] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>رفع صورة جديدة من الجهاز</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] dark:bg-[#20271A] hover:bg-[#EFE8DC] text-[#554F42] dark:text-[#C5BFB0] border border-[#E5DEC9] dark:border-[#384524] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الصورة الأصلية (الافتراضية)</span>
              </button>

              <button
                type="button"
                disabled={isForceSyncing}
                onClick={async () => {
                  setIsForceSyncing(true);
                  try {
                    await clearAllImageCaches();
                    const central = await fetchCentralBrandingDirectly();
                    if (central?.supervisorAvatar) {
                      applyCentralBrandingLocally(central);
                      setAvatarSrc(central.supervisorAvatar);
                    }
                    const newV = Date.now();
                    setAvatarVersion(newV);
                    setGlobalBrandingVersion(newV);
                    setSyncFeedback('تم مسح الكاش وجلب أحدث صورة من قاعدة البيانات بنجاح ✅');
                    setTimeout(() => setSyncFeedback(null), 3000);
                  } catch {
                    setSyncFeedback('تم مسح الكاش وتحديث العرض.');
                    setTimeout(() => setSyncFeedback(null), 3000);
                  } finally {
                    setIsForceSyncing(false);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isForceSyncing ? 'animate-spin' : ''}`} />
                <span>{isForceSyncing ? 'جاري مسح الكاش...' : 'مسح الكاش والمزامنة الفورية من السحابة 🔄'}</span>
              </button>

              {syncFeedback && (
                <div className="text-[11px] font-bold text-center text-emerald-600 dark:text-emerald-400 p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                  {syncFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
