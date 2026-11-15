import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  RefreshCw,
  Download,
  Layers,
  Layout,
  Navigation,
  Check,
} from 'lucide-react';
import { BrainToothLineArtIcon } from './BrainToothLineArtIcon';
import { saveAppBrandingToCloud } from '../services/realTimeSyncService';
import {
  clearAllImageCaches,
  getCacheBustedImageUrl,
  getGlobalBrandingVersion,
  setGlobalBrandingVersion,
  fetchCentralBrandingDirectly,
  applyCentralBrandingLocally,
  PROTOCOL_HEADER_LOGO_KEY,
  PROTOCOL_HEADER_LOGO_EVENT,
  PROTOCOL_MIDDLE_CARD_LOGO_KEY,
  PROTOCOL_MIDDLE_CARD_LOGO_EVENT,
  PROTOCOL_BOTTOM_FAB_ICON_KEY,
  PROTOCOL_BOTTOM_FAB_ICON_EVENT,
  PROTOCOL_APP_LOGO_KEY,
  PROTOCOL_FAB_ICON_KEY,
  PROTOCOL_OFFICIAL_STAMP_KEY,
  PROTOCOL_OFFICIAL_STAMP_EVENT,
  DEFAULT_OFFICIAL_STAMP_PATH,
} from '../utils/cacheBuster';
import { compressImageForCloud } from '../utils/imageOptimizer';

// Re-export constants for backward compatibility
export const PROTOCOL_FAB_ICON_STORAGE_KEY = PROTOCOL_BOTTOM_FAB_ICON_KEY;
export const PROTOCOL_FAB_ICON_EVENT = PROTOCOL_BOTTOM_FAB_ICON_EVENT;

interface CenterFabLogoManagerProps {
  className?: string;
}

export type UIAssetTarget = 'header_logo' | 'middle_card_logo' | 'bottom_nav_fab_icon' | 'official_stamp';

export const CenterFabLogoManager: React.FC<CenterFabLogoManagerProps> = ({
  className = '',
}) => {
  const [selectedAsset, setSelectedAsset] = useState<UIAssetTarget>('bottom_nav_fab_icon');
  const [assetVersion, setAssetVersion] = useState<number>(() => getGlobalBrandingVersion());

  // Independent States for each UI component
  const [headerLogo, setHeaderLogo] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) ||
        localStorage.getItem(PROTOCOL_APP_LOGO_KEY) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [middleCardLogo, setMiddleCardLogo] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY) ||
        localStorage.getItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [bottomFabIcon, setBottomFabIcon] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) ||
        localStorage.getItem(PROTOCOL_FAB_ICON_KEY) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [officialStamp, setOfficialStamp] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const middleFileInputRef = useRef<HTMLInputElement>(null);
  const fabFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if changed from another tab, window, or cloud sync event
  useEffect(() => {
    const handleHeaderUpdate = (e?: any) => {
      const val = typeof e?.detail === 'string'
        ? e.detail
        : (localStorage.getItem(PROTOCOL_HEADER_LOGO_KEY) || localStorage.getItem(PROTOCOL_APP_LOGO_KEY) || null);
      setHeaderLogo(val || null);
      setAssetVersion(getGlobalBrandingVersion());
    };

    const handleMiddleUpdate = (e?: any) => {
      const val = typeof e?.detail === 'string'
        ? e.detail
        : (localStorage.getItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY) || null);
      setMiddleCardLogo(val || null);
      setAssetVersion(getGlobalBrandingVersion());
    };

    const handleBottomUpdate = (e?: any) => {
      const val = typeof e?.detail === 'string'
        ? e.detail
        : (localStorage.getItem(PROTOCOL_BOTTOM_FAB_ICON_KEY) || localStorage.getItem(PROTOCOL_FAB_ICON_KEY) || null);
      setBottomFabIcon(val || null);
      setAssetVersion(getGlobalBrandingVersion());
    };

    const handleStampUpdate = (e?: any) => {
      const val = typeof e?.detail === 'string'
        ? e.detail
        : (localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY) || null);
      setOfficialStamp(val || null);
      setAssetVersion(getGlobalBrandingVersion());
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === PROTOCOL_HEADER_LOGO_KEY) handleHeaderUpdate();
      if (!e.key || e.key === PROTOCOL_MIDDLE_CARD_LOGO_KEY) handleMiddleUpdate();
      if (!e.key || e.key === PROTOCOL_BOTTOM_FAB_ICON_KEY) handleBottomUpdate();
      if (!e.key || e.key === PROTOCOL_OFFICIAL_STAMP_KEY) handleStampUpdate();
    };

    window.addEventListener(PROTOCOL_HEADER_LOGO_EVENT, handleHeaderUpdate);
    window.addEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleMiddleUpdate);
    window.addEventListener(PROTOCOL_BOTTOM_FAB_ICON_EVENT, handleBottomUpdate);
    window.addEventListener(PROTOCOL_OFFICIAL_STAMP_EVENT, handleStampUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(PROTOCOL_HEADER_LOGO_EVENT, handleHeaderUpdate);
      window.removeEventListener(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, handleMiddleUpdate);
      window.removeEventListener(PROTOCOL_BOTTOM_FAB_ICON_EVENT, handleBottomUpdate);
      window.removeEventListener(PROTOCOL_OFFICIAL_STAMP_EVENT, handleStampUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Universal Isolated File Upload Handler with Auto-Compression
  const handleUploadForTarget = async (target: UIAssetTarget, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setFeedbackMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميجابايت.');
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg('جاري معالجة وضغط الصورة لضمان المزامنة السحابية الفورية...');

    try {
      const isAlphaTarget = target === 'bottom_nav_fab_icon' || target === 'middle_card_logo' || target === 'header_logo' || target === 'official_stamp';
      const base64DataUrl = await compressImageForCloud(file, {
        maxWidth: target === 'official_stamp' ? 600 : 500,
        maxHeight: target === 'official_stamp' ? 600 : 500,
        quality: 0.85,
        maxSizeBytes: 80 * 1024,
        preserveAlpha: isAlphaTarget || file.type === 'image/png' || file.type === 'image/webp',
        mimeType: (isAlphaTarget || file.type === 'image/png') ? 'image/png' : 'image/jpeg',
      });

      const newVersion = Date.now();
      await clearAllImageCaches([base64DataUrl]);
      setGlobalBrandingVersion(newVersion);
      setAssetVersion(newVersion);

      if (target === 'header_logo') {
        localStorage.setItem(PROTOCOL_HEADER_LOGO_KEY, base64DataUrl);
        setHeaderLogo(base64DataUrl);
        window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: base64DataUrl }));
        await saveAppBrandingToCloud({ headerLogo: base64DataUrl });
        setFeedbackMsg('تم تحديث ومزامنة شعار الترويسة الرئيسية سحابياً بنجاح! 🏛️✅');
      } else if (target === 'middle_card_logo') {
        localStorage.setItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY, base64DataUrl);
        localStorage.setItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`, base64DataUrl);
        setMiddleCardLogo(base64DataUrl);
        window.dispatchEvent(new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: base64DataUrl }));
        await saveAppBrandingToCloud({ middleCardLogo: base64DataUrl });
        setFeedbackMsg('تم تحديث ومزامنة شعار الكارد سحابياً بنجاح! 💳✅');
      } else if (target === 'bottom_nav_fab_icon') {
        localStorage.setItem(PROTOCOL_BOTTOM_FAB_ICON_KEY, base64DataUrl);
        setBottomFabIcon(base64DataUrl);
        window.dispatchEvent(new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: base64DataUrl }));
        await saveAppBrandingToCloud({ bottomFabIcon: base64DataUrl });
        setFeedbackMsg('تم تحديث ومزامنة أيقونة الختم سحابياً بنجاح! 🔘✅');
      } else if (target === 'official_stamp') {
        localStorage.setItem(PROTOCOL_OFFICIAL_STAMP_KEY, base64DataUrl);
        setOfficialStamp(base64DataUrl);
        window.dispatchEvent(new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: base64DataUrl }));
        await saveAppBrandingToCloud({ officialStamp: base64DataUrl });
        setFeedbackMsg('تم اعتماد وتحديث الختم الرسمي سحابياً بنجاح! 📜✅');
      }

      setTimeout(() => setFeedbackMsg(null), 4500);
    } catch (err) {
      console.error('Upload error:', err);
      setFeedbackMsg('حدث خطأ أثناء معالجة وحفظ الصورة سحابياً.');
    } finally {
      setIsProcessing(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Reset Individual Target to Default
  const handleResetTarget = async (target: UIAssetTarget) => {
    try {
      setIsProcessing(true);
      const newVersion = Date.now();
      setGlobalBrandingVersion(newVersion);
      setAssetVersion(newVersion);

      if (target === 'header_logo') {
        localStorage.removeItem(PROTOCOL_HEADER_LOGO_KEY);
        setHeaderLogo(null);
        window.dispatchEvent(new CustomEvent(PROTOCOL_HEADER_LOGO_EVENT, { detail: '' }));
        await saveAppBrandingToCloud({ headerLogo: '' });
        setFeedbackMsg('تمت استعادة شعار الترويسة الافتراضي.');
      } else if (target === 'middle_card_logo') {
        localStorage.removeItem(PROTOCOL_MIDDLE_CARD_LOGO_KEY);
        localStorage.removeItem(`app_img_${PROTOCOL_MIDDLE_CARD_LOGO_KEY}`);
        setMiddleCardLogo(null);
        window.dispatchEvent(new CustomEvent(PROTOCOL_MIDDLE_CARD_LOGO_EVENT, { detail: '' }));
        await saveAppBrandingToCloud({ middleCardLogo: '' });
        setFeedbackMsg('تمت استعادة شعار الكارد الافتراضي.');
      } else if (target === 'bottom_nav_fab_icon') {
        localStorage.removeItem(PROTOCOL_BOTTOM_FAB_ICON_KEY);
        setBottomFabIcon(null);
        window.dispatchEvent(new CustomEvent(PROTOCOL_BOTTOM_FAB_ICON_EVENT, { detail: '' }));
        await saveAppBrandingToCloud({ bottomFabIcon: '' });
        setFeedbackMsg('تمت استعادة شعار الختم المتجهي الافتراضي.');
      } else if (target === 'official_stamp') {
        localStorage.removeItem(PROTOCOL_OFFICIAL_STAMP_KEY);
        setOfficialStamp(null);
        window.dispatchEvent(new CustomEvent(PROTOCOL_OFFICIAL_STAMP_EVENT, { detail: '' }));
        await saveAppBrandingToCloud({ officialStamp: '' });
        setFeedbackMsg('تمت استعادة الختم الرسمي الافتراضي لبروتوكول.');
      }

      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch {
      setFeedbackMsg('تعذر إعادة ضبط الشعار.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download active target asset
  const handleDownloadTarget = (target: UIAssetTarget) => {
    try {
      let src = '/protocol_logo.png';
      let filename = 'PROTOCOL_Asset.png';

      if (target === 'header_logo') {
        src = headerLogo || '/protocol_logo.png';
        filename = 'PROTOCOL_Header_Logo.png';
      } else if (target === 'middle_card_logo') {
        src = middleCardLogo || '/protocol_circular_logo.png';
        filename = 'PROTOCOL_Middle_Card_Logo.png';
      } else if (target === 'bottom_nav_fab_icon') {
        src = bottomFabIcon || '/protocol_logo.png';
        filename = 'PROTOCOL_Bottom_FAB_Seal.png';
      } else if (target === 'official_stamp') {
        src = officialStamp || DEFAULT_OFFICIAL_STAMP_PATH;
        filename = 'PROTOCOL_Official_Report_Stamp.png';
      }

      const link = document.createElement('a');
      link.href = getCacheBustedImageUrl(src, assetVersion);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFeedbackMsg('تم تنزيل الأصل السريري بنجاح 📥');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg('حدث خطأ أثناء تنزيل الملف.');
    }
  };

  // Force sync all decoupled assets from Central Database
  const handleForceClearAndSyncAll = async () => {
    try {
      setIsSyncing(true);
      setFeedbackMsg('جاري جلب كافة الأصول المفصولة من قاعدة البيانات المركزية...');
      await clearAllImageCaches();
      const central = await fetchCentralBrandingDirectly();

      if (central) {
        applyCentralBrandingLocally(central);
        setHeaderLogo(central.headerLogo || central.appLogo || null);
        setMiddleCardLogo(central.middleCardLogo || null);
        setBottomFabIcon(central.bottomFabIcon || null);
        setAssetVersion(Date.now());
        setFeedbackMsg('تمت مزامنة جميع المسارات المستقلة بنجاح من الخادم المركزي ☁️✅');
      } else {
        setFeedbackMsg('تم فحص السحابة والاعتماد على الأصول المحلية المخزنة.');
      }
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.warn('Sync failed:', err);
      setFeedbackMsg('تعذر الاتصال بقاعدة البيانات المركزية.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#343E26] shadow-sm space-y-6 text-right ${className}`}
      dir="rtl"
    >
      {/* Hidden File Inputs for each isolated asset */}
      <input
        type="file"
        ref={headerFileInputRef}
        accept="image/*"
        onChange={(e) => handleUploadForTarget('header_logo', e)}
        className="hidden"
      />
      <input
        type="file"
        ref={middleFileInputRef}
        accept="image/*"
        onChange={(e) => handleUploadForTarget('middle_card_logo', e)}
        className="hidden"
      />
      <input
        type="file"
        ref={fabFileInputRef}
        accept="image/*"
        onChange={(e) => handleUploadForTarget('bottom_nav_fab_icon', e)}
        className="hidden"
      />
      <input
        type="file"
        ref={stampFileInputRef}
        accept="image/*"
        onChange={(e) => handleUploadForTarget('official_stamp', e)}
        className="hidden"
      />

      {/* Header Title & Decoupled Architecture Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4D6A34] to-[#D4AF37] text-white flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                🎨 إدارة صور وشعارات الواجهة المستقلة (Decoupled UI Assets)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                Unlinked State Engine ✓
              </span>
            </div>
            <p className="text-xs text-[#6D675A] dark:text-[#A7A08E] font-medium mt-0.5">
              كل عنصر واجهة يمتلك مسار تخزين ومتغير حالة مستقل بذاته، بحيث لا يؤثر تعديل أي عنصر على العناصر الأخرى.
            </p>
          </div>
        </div>

        {/* Global Sync Button */}
        <button
          type="button"
          onClick={handleForceClearAndSyncAll}
          disabled={isSyncing}
          className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          title="مزامنة وتحديث كافة المسارات من قاعدة البيانات المركزية"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السحابة 🔄'}</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-[#59662C]/15 border border-[#59662C]/40 text-[#59662C] dark:text-[#CBE276] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0 text-[#c5a059]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Target Asset Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tab 1: Header Logo */}
        <button
          type="button"
          onClick={() => setSelectedAsset('header_logo')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
            selectedAsset === 'header_logo'
              ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/15 border-[#59662C] dark:border-[#A4BF46] shadow-sm ring-1 ring-[#59662C]'
              : 'bg-[#FAF7F2] dark:bg-[#151910] border-[#E5DEC9] dark:border-[#2C3520] hover:border-[#59662C]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#1E2417] border border-[#59662C]/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
              <img
                src={getCacheBustedImageUrl(headerLogo || '/protocol_logo.png', assetVersion)}
                alt="شعار الترويسة"
                className="w-full h-full object-contain aspect-square"
              />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-[#2F2B24] dark:text-white truncate">
                1. شعار الترويسة العلوية
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                protocol_header_logo
              </div>
            </div>
          </div>
          {headerLogo ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              مخصص
            </span>
          ) : (
            <span className="text-[10px] bg-zinc-500/10 text-zinc-500 font-bold px-2 py-0.5 rounded-full shrink-0">
              افتراضي
            </span>
          )}
        </button>

        {/* Tab 2: Middle Card Emblem */}
        <button
          type="button"
          onClick={() => setSelectedAsset('middle_card_logo')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
            selectedAsset === 'middle_card_logo'
              ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/15 border-[#59662C] dark:border-[#A4BF46] shadow-sm ring-1 ring-[#59662C]'
              : 'bg-[#FAF7F2] dark:bg-[#151910] border-[#E5DEC9] dark:border-[#2C3520] hover:border-[#59662C]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#1E2417] border border-[#59662C]/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
              <img
                src={getCacheBustedImageUrl(middleCardLogo || '/protocol_circular_logo.png', assetVersion)}
                alt="شعار الكارد"
                className="w-full h-full object-contain aspect-square"
              />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-[#2F2B24] dark:text-white truncate">
                2. شعار الكارد الأوسط
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                protocol_middle_card_logo
              </div>
            </div>
          </div>
          {middleCardLogo ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              مخصص
            </span>
          ) : (
            <span className="text-[10px] bg-zinc-500/10 text-zinc-500 font-bold px-2 py-0.5 rounded-full shrink-0">
              افتراضي
            </span>
          )}
        </button>

        {/* Tab 3: Bottom Navbar FAB Icon */}
        <button
          type="button"
          onClick={() => setSelectedAsset('bottom_nav_fab_icon')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
            selectedAsset === 'bottom_nav_fab_icon'
              ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/15 border-[#59662C] dark:border-[#A4BF46] shadow-sm ring-1 ring-[#59662C]'
              : 'bg-[#FAF7F2] dark:bg-[#151910] border-[#E5DEC9] dark:border-[#2C3520] hover:border-[#59662C]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#4D6A34,#D4AF37)] flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs fab-icon-transparent"
              style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
            >
              {bottomFabIcon ? (
                <img
                  src={getCacheBustedImageUrl(bottomFabIcon, assetVersion)}
                  alt="ختم الزر العائم"
                  className="w-full h-full object-contain fab-icon-transparent fab-icon-multiply"
                  style={{
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                  }}
                />
              ) : (
                <BrainToothLineArtIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-[#2F2B24] dark:text-white truncate">
                3. أيقونة الزر العائم
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                protocol_bottom_nav_fab_icon
              </div>
            </div>
          </div>
          {bottomFabIcon ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              مخصص
            </span>
          ) : (
            <span className="text-[10px] bg-zinc-500/10 text-zinc-500 font-bold px-2 py-0.5 rounded-full shrink-0">
              Line-Art
            </span>
          )}
        </button>

        {/* Tab 4: Official Report Stamp */}
        <button
          type="button"
          onClick={() => setSelectedAsset('official_stamp')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
            selectedAsset === 'official_stamp'
              ? 'bg-[#59662C]/15 dark:bg-[#A4BF46]/15 border-[#59662C] dark:border-[#A4BF46] shadow-sm ring-1 ring-[#59662C]'
              : 'bg-[#FAF7F2] dark:bg-[#151910] border-[#E5DEC9] dark:border-[#2C3520] hover:border-[#59662C]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E2417] border border-[#334327]/30 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <img
                src={getCacheBustedImageUrl(officialStamp || DEFAULT_OFFICIAL_STAMP_PATH, assetVersion)}
                alt="الختم الرسمي"
                className="w-full h-full object-contain aspect-square"
              />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-[#2F2B24] dark:text-white truncate">
                4. الختم الرسمي (PDF)
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                protocol_official_stamp
              </div>
            </div>
          </div>
          {officialStamp ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              مخصص
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              معتمد
            </span>
          )}
        </button>
      </div>

      {/* Selected Asset Dedicated Management Panel */}
      <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#151910] border border-[#E5DEC9] dark:border-[#2C3520] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] dark:border-[#2C3520] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] inline-block" />
            <h3 className="text-sm font-black text-[#2F2B24] dark:text-white">
              {selectedAsset === 'header_logo' && 'إدارة شعار الترويسة الرئيسية في شريط التنقل العلوي'}
              {selectedAsset === 'middle_card_logo' && 'إدارة شعار الكارد في المنتصف (بانر بروتوكول)'}
              {selectedAsset === 'bottom_nav_fab_icon' && 'إدارة أيقونة الختم والزر العائم في النافبار السفلية'}
              {selectedAsset === 'official_stamp' && 'إدارة الختم الرسمي لتقرير الإنجاز السنوي (PDF Export)'}
            </h3>
          </div>
          <div className="text-[11px] font-mono text-[#59662C] dark:text-[#A4BF46] font-bold">
            Asset ID: {selectedAsset}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Live Component Simulation Box */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#1E2417] border border-[#E5DEC9] dark:border-[#343E26] shadow-inner text-center">
            <div className="text-xs font-black text-[#59662C] dark:text-[#A4BF46] mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة حية للعنصر في موقعه الحقيقي</span>
            </div>

            {/* Simulated Header View */}
            {selectedAsset === 'header_logo' && (
              <div className="w-full max-w-xs p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#181C14] border border-[#E5DEC9] dark:border-[#323A26] flex items-center justify-between shadow-xs my-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-[#1E2417] border border-[#59662C]/30 p-1 flex items-center justify-center">
                    <img
                      src={getCacheBustedImageUrl(headerLogo || '/protocol_logo.png', assetVersion)}
                      alt="معاينة الترويسة"
                      className="w-full h-full object-contain aspect-square"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#59662C] dark:text-[#A4BF46] leading-tight">بروتوكول</div>
                    <div className="text-[9px] font-mono font-bold text-zinc-500">PROTOCOL</div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">شريط الأعلى</span>
              </div>
            )}

            {/* Simulated Middle Card View */}
            {selectedAsset === 'middle_card_logo' && (
              <div className="w-full max-w-xs p-4 rounded-xl bg-[#EFECE4] dark:bg-[#1A1F15] border border-[#E5DEC9] dark:border-[#3E4A2E] flex flex-col items-center justify-center shadow-xs my-2">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/30 p-1.5 flex items-center justify-center mb-1">
                  <img
                    src={getCacheBustedImageUrl(middleCardLogo || '/protocol_circular_logo.png', assetVersion)}
                    alt="معاينة الكارد"
                    className="w-full h-full object-contain aspect-square"
                  />
                </div>
                <div className="text-xs font-black text-[#59662C] dark:text-[#A4BF46]">بروتوكول</div>
                <span className="text-[9px] text-zinc-500 font-bold">بانر المنتصف</span>
              </div>
            )}

            {/* Simulated Bottom Navbar FAB View */}
            {selectedAsset === 'bottom_nav_fab_icon' && (
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,#4D6A34,#D4AF37)] p-2.5 shadow-lg flex items-center justify-center ring-4 ring-white dark:ring-[#1E2417] overflow-hidden">
                  <div
                    className="w-9 h-9 flex items-center justify-center fab-icon-transparent"
                    style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                  >
                    {bottomFabIcon ? (
                      <img
                        src={getCacheBustedImageUrl(bottomFabIcon, assetVersion)}
                        alt="معاينة الزر العائم"
                        className="w-full h-full object-contain fab-icon-transparent fab-icon-multiply"
                        style={{
                          background: 'transparent',
                          backgroundColor: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          objectFit: 'contain',
                          mixBlendMode: 'multiply',
                        }}
                      />
                    ) : (
                      <BrainToothLineArtIcon className="w-full h-full text-white" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Official Report Stamp View */}
            {selectedAsset === 'official_stamp' && (
              <div className="w-full max-w-xs p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#181C14] border border-[#334327]/30 flex flex-col items-center justify-center shadow-xs my-2">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white border border-[#334327]/40 p-1 flex items-center justify-center shadow-sm">
                  <img
                    src={getCacheBustedImageUrl(officialStamp || DEFAULT_OFFICIAL_STAMP_PATH, assetVersion)}
                    alt="معاينة الختم الرسمي"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-[#334327] dark:text-[#A4BF46] font-black mt-2">
                  الختم المعتمد في منطقة التوقيع والمصادقة لتقرير PDF
                </span>
              </div>
            )}

            <p className="text-[11px] text-zinc-500 font-bold mt-2">
              تعديل هذا العنصر مستقل بنسبة 100% ومفصول تماماً عن باقي العناصر في النظام.
            </p>
          </div>

          {/* Upload & Action Controls */}
          <div className="lg:col-span-7 space-y-4">
            {/* Upload Click Card */}
            <div
              onClick={() => {
                if (selectedAsset === 'header_logo') headerFileInputRef.current?.click();
                if (selectedAsset === 'middle_card_logo') middleFileInputRef.current?.click();
                if (selectedAsset === 'bottom_nav_fab_icon') fabFileInputRef.current?.click();
                if (selectedAsset === 'official_stamp') stampFileInputRef.current?.click();
              }}
              className="p-6 rounded-2xl border-2 border-dashed border-[#59662C]/40 dark:border-[#384524] hover:border-[#59662C] dark:hover:border-[#A4BF46] bg-white/70 dark:bg-[#191E13]/70 hover:bg-[#59662C]/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#59662C]/10 dark:bg-[#A4BF46]/15 text-[#59662C] dark:text-[#A4BF46] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-[#2F2B24] dark:text-white">
                  اضغط لرفع صورة جديدة لهذا العنصر فقط
                </p>
                <p className="text-xs text-[#7A7466] dark:text-[#9A9383] mt-0.5">
                  يدعم صيغ PNG, JPG, SVG, WebP مع معالجة ومزامنة فورية بقاعدة البيانات
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                className="mt-2 px-5 py-2 rounded-xl bg-[#59662C] text-white hover:bg-[#485324] text-xs font-black shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isProcessing ? 'جاري الرفع والمعالجة...' : 'اختيار صورة من الجهاز'}</span>
              </button>
            </div>

            {/* Action Buttons: Reset & Download */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleResetTarget(selectedAsset)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الشعار الافتراضي لهذا العنصر</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTarget(selectedAsset)}
                className="px-4 py-2 rounded-xl bg-[#59662C]/15 hover:bg-[#59662C]/25 border border-[#59662C]/30 text-[#59662C] dark:text-[#A4BF46] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الأصل الحالي (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
