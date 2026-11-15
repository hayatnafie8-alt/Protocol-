import React, { useState, useEffect } from 'react';
import {
  Home,
  Users2,
  BookOpen,
  Menu,
} from 'lucide-react';
import { BrainToothLineArtIcon } from './BrainToothLineArtIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  getCacheBustedImageUrl,
  getGlobalBrandingVersion,
  PROTOCOL_BOTTOM_FAB_ICON_KEY,
  PROTOCOL_BOTTOM_FAB_ICON_EVENT,
  PROTOCOL_BRANDING_EVENT,
} from '../utils/cacheBuster';

interface ModernBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenPatientGuide: () => void;
  onOpenClinicalCompanion: () => void;
  onOpenMenuDrawer: () => void;
  isPatientGuideActive?: boolean;
  unreadCount?: number;
}

export const ModernBottomNav: React.FC<ModernBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenPatientGuide,
  onOpenClinicalCompanion,
  onOpenMenuDrawer,
  isPatientGuideActive = false,
  unreadCount = 0,
}) => {
  const { t, isRTL } = useLanguage();
  const isHomeActive = activeTab === 'home';
  const isSkillsOrSlidesActive = activeTab === 'clinical_skills' || activeTab === 'slides';

  const [fabVersion, setFabVersion] = useState<number>(() => getGlobalBrandingVersion());
  // Isolated Bottom FAB Icon State directly connected to Cloud Database
  const [customFabIcon, setCustomFabIcon] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) ||
        localStorage.getItem('protocol_fab_icon') ||
        null
      );
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Proactive direct fetch from Central Cloud Firestore
    getDoc(doc(db, 'app_config', 'asset_bottom_fab_icon'))
      .then((snap) => {
        if (!isMounted) return;
        if (snap.exists() && snap.data()?.data) {
          const fresh = snap.data().data;
          setCustomFabIcon(fresh);
          setFabVersion(snap.data().version || Date.now());
          try {
            localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, fresh);
          } catch {}
        } else {
          // Fallback check on branding_settings manifest
          getDoc(doc(db, 'app_config', 'branding_settings')).then((bSnap) => {
            if (!isMounted) return;
            if (bSnap.exists()) {
              const bData = bSnap.data();
              if (bData.bottomFabIcon && bData.bottomFabIcon !== '__stored_in_dedicated_asset__') {
                setCustomFabIcon(bData.bottomFabIcon);
                setFabVersion(Date.now());
              }
            }
          });
        }
      })
      .catch(() => {});

    // 2. Real-time snapshot listener on dedicated asset_bottom_fab_icon
    const unsubBottomDoc = onSnapshot(
      doc(db, 'app_config', 'asset_bottom_fab_icon'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists() && snap.data()?.data !== undefined) {
          const fresh = snap.data().data || null;
          setCustomFabIcon(fresh);
          setFabVersion(snap.data().version || Date.now());
          try {
            if (fresh) localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, fresh);
            else localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
          } catch {}
        }
      },
      (err) => console.warn('[ModernBottomNav] Snapshot notice:', err)
    );

    // 3. Real-time snapshot listener on branding_settings
    const unsubBrandingSettings = onSnapshot(
      doc(db, 'app_config', 'branding_settings'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const bData = snap.data();
          if (bData.bottomFabIcon && bData.bottomFabIcon !== '__stored_in_dedicated_asset__') {
            setCustomFabIcon(bData.bottomFabIcon);
            setFabVersion(Date.now());
          }
        }
      },
      (err) => console.warn('[ModernBottomNav] Manifest notice:', err)
    );

    // 4. In-App Reactive Custom Event Listeners
    const handleUpdate = (e?: any) => {
      if (!isMounted) return;
      try {
        const directDetail = e?.detail;
        if (typeof directDetail === 'string') {
          setCustomFabIcon(directDetail || null);
        } else if (directDetail && typeof directDetail === 'object' && directDetail.bottomFabIcon !== undefined) {
          setCustomFabIcon(directDetail.bottomFabIcon || null);
        } else {
          const saved =
            localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) ||
            localStorage.getItem('protocol_fab_icon') ||
            null;
          setCustomFabIcon(saved);
        }
        const newV = getGlobalBrandingVersion() || Date.now();
        setFabVersion(newV);
      } catch {
        setCustomFabIcon(null);
      }
    };

    window.addEventListener(PROTOCOL_BOTTOM_FAB_ICON_EVENT, handleUpdate);
    window.addEventListener('protocol_fab_icon_updated', handleUpdate);
    window.addEventListener(PROTOCOL_BRANDING_EVENT, handleUpdate);
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === PROTOCOL_BOTTOM_FAB_ICON_KEY || e.key === 'protocol_fab_icon') {
        handleUpdate();
      }
    });

    return () => {
      isMounted = false;
      unsubBottomDoc();
      unsubBrandingSettings();
      window.removeEventListener(PROTOCOL_BOTTOM_FAB_ICON_EVENT, handleUpdate);
      window.removeEventListener('protocol_fab_icon_updated', handleUpdate);
      window.removeEventListener(PROTOCOL_BRANDING_EVENT, handleUpdate);
    };
  }, []);

  return (
    <div
      className="no-print fixed bottom-3 sm:bottom-5 inset-x-0 mx-auto w-[94%] max-w-lg z-40 select-none pointer-events-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Floating Curved Bar Container (Curved Dock) */}
      <nav aria-label="شريط التنقل السفلي" className="relative flex items-center justify-between px-3 sm:px-4 py-2 bg-[#FAF7F2]/90 dark:bg-[#181D13]/90 backdrop-blur-2xl border border-[#E5DEC9]/90 dark:border-[#333E24]/90 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-[2rem] transition-all">
        
        {/* Tab 1 (Right in RTL, Left in LTR): 🏠 الرئيسية (Home - Core Protocols) */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            isHomeActive
              ? 'text-[#59662C] dark:text-[#A4BF46] font-black scale-105'
              : 'text-[#7D7667] dark:text-[#9A9383] hover:text-[#2F2B24] dark:hover:text-white font-bold'
          }`}
          title={t('nav.home', 'الرئيسية')}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isHomeActive
                ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/20 shadow-xs'
                : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">
            {t('nav.home', 'الرئيسية')}
          </span>
        </button>

        {/* Tab 2: 👥 المراجعين (Patient Management & Psychology Guide) */}
        <button
          type="button"
          onClick={onOpenPatientGuide}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            isPatientGuideActive
              ? 'text-amber-700 dark:text-amber-400 font-black scale-105'
              : 'text-[#7D7667] dark:text-[#9A9383] hover:text-[#2F2B24] dark:hover:text-white font-bold'
          }`}
          title={t('nav.patients', 'المراجعين')}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isPatientGuideActive
                ? 'bg-amber-500/15 dark:bg-amber-400/20 shadow-xs'
                : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'
            }`}
          >
            <Users2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">
            {t('nav.patients', 'المراجعين')}
          </span>
        </button>

        {/* Slot 3: Center Hero FAB (Luxury Floating Circular Action Button with 3D Depth & Apple-Level Finish) */}
        <div id="centerFabContainer" className="relative flex items-center justify-center -translate-y-5 sm:-translate-y-6 px-1 z-20">
          <button
            type="button"
            id="centerFabButton"
            onClick={onOpenClinicalCompanion}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[linear-gradient(135deg,#4D6A34_0%,#5B7B3B_32%,#96853C_70%,#D4AF37_100%)] dark:bg-[linear-gradient(135deg,#415C2B_0%,#527034_35%,#A8923F_75%,#D4AF37_100%)] text-white p-2.5 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.5),inset_0_-2.5px_4px_rgba(35,48,22,0.5),0_14px_28px_-4px_rgba(77,106,52,0.48),0_6px_14px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),inset_0_-3px_5px_rgba(15,22,9,0.7),0_16px_32px_-4px_rgba(0,0,0,0.65),0_6px_14px_rgba(77,106,52,0.3)] ring-[3.5px] ring-[#FAF7F2]/95 dark:ring-[#181D13]/95 hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer flex items-center justify-center group overflow-hidden"
            aria-label={t('nav.companion', 'الرفيق السريري')}
          >
            {/* Apple-Style Glassmorphism Specular Sheen (Curved Top-Left Light Highlight) */}
            <div
              className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_32%_22%,rgba(255,255,255,0.48)_0%,rgba(212,175,55,0.16)_45%,transparent_75%)] pointer-events-none"
              aria-hidden="true"
            />

            {/* Dynamic Center Icon: Custom Uploaded Icon OR Default Vector Line-Art (Asset ID: bottom_nav_fab_icon) */}
            <div
              id="centerFabIconContainer"
              data-asset-id="bottom_nav_fab_icon"
              className="relative z-10 w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 fab-icon-transparent"
              style={{
                background: 'transparent',
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              {customFabIcon ? (
                <img
                  id="centerFabIconImg"
                  data-asset-id="bottom_nav_fab_icon"
                  src={getCacheBustedImageUrl(customFabIcon, fabVersion)}
                  alt={t('nav.companion', 'شعار الزر العائم')}
                  className="w-full h-full object-contain select-none pointer-events-none fab-icon-transparent fab-icon-multiply"
                  style={{
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                  }}
                  onError={() => setCustomFabIcon(null)}
                />
              ) : (
                <BrainToothLineArtIcon
                  data-asset-id="bottom_nav_fab_icon"
                  className="w-full h-full fab-icon-transparent"
                  style={{
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                />
              )}
            </div>
          </button>
        </div>

        {/* Tab 4: 📘 المحاضرات / المهارات (Advanced Clinical Procedures) */}
        <button
          type="button"
          onClick={() => onTabChange('clinical_skills')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            isSkillsOrSlidesActive
              ? 'text-[#59662C] dark:text-[#A4BF46] font-black scale-105'
              : 'text-[#7D7667] dark:text-[#9A9383] hover:text-[#2F2B24] dark:hover:text-white font-bold'
          }`}
          title={t('nav.skills', 'المهارات')}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isSkillsOrSlidesActive
                ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/20 shadow-xs'
                : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">
            {t('nav.skills', 'المهارات')}
          </span>
        </button>

        {/* Tab 5 (Left in RTL, Right in LTR): ☰ المزيد / الإعدادات (Menu Drawer trigger) */}
        <button
          type="button"
          onClick={onOpenMenuDrawer}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group text-[#7D7667] dark:text-[#9A9383] hover:text-[#2F2B24] dark:hover:text-white font-bold relative"
          title={t('nav.more', 'المزيد')}
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all group-hover:bg-black/5 dark:group-hover:bg-white/5 relative">
            <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#181D13]" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">
            {t('nav.more', 'المزيد')}
          </span>
        </button>

      </nav>
    </div>
  );
};
