import React, { useState, useEffect } from 'react';
import {
  Syringe,
  ClipboardCheck,
  Pill,
  HelpCircle,
  Stethoscope,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Check,
  X,
  Layers,
  Copy,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  getCompanionPermissions,
  saveCompanionPermissions,
  updateCompanionCardPermission,
  getCompanionCardsList,
  reorderCompanionCard,
  updateCompanionCardMetadata,
  deleteCompanionCard,
  duplicateCompanionCard,
  resetCompanionCardsList,
  CompanionCardMetadata,
  CompanionPermissionsMap,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
  PROTOCOL_COMPANION_CARDS_EVENT,
  DEFAULT_COMPANION_PERMISSIONS,
} from '../data/companionPermissionsManager';

interface CompanionPermissionsAdminManagerProps {
  className?: string;
}

export const CompanionPermissionsAdminManager: React.FC<CompanionPermissionsAdminManagerProps> = ({
  className = '',
}) => {
  const [permissions, setPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );
  const [cardsList, setCardsList] = useState<CompanionCardMetadata[]>(() =>
    getCompanionCardsList()
  );
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setPermissions(getCompanionPermissions());
    };
    const handleCardsUpdate = () => {
      setCardsList(getCompanionCardsList());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
    window.addEventListener(PROTOCOL_COMPANION_CARDS_EVENT, handleCardsUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('storage', handleCardsUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handleUpdate);
      window.removeEventListener(PROTOCOL_COMPANION_CARDS_EVENT, handleCardsUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('storage', handleCardsUpdate);
    };
  }, []);

  const handleAccessChange = (cardId: string, title: string, newAccess: 'free' | 'subscription' | 'under_review') => {
    const updated = updateCompanionCardPermission(cardId, { access: newAccess });
    setPermissions(updated);
    setNoticeMsg(
      newAccess === 'under_review'
        ? `تم تعيين بطاقة "${title}" كـ: [⏳ قيد التدقيق الطبي والأكاديمي (د. حياة) / Under Review] 🩺`
        : newAccess === 'free'
        ? `تم تعيين بطاقة "${title}" كـ: [🔓 متاح للعامة مجاناً / Free for Public] 🌐`
        : `تم تعيين بطاقة "${title}" كـ: [🔒 متاح للمشتركين فقط / Subscribers Only] 💎`
    );
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const handleVisibilityChange = (cardId: string, title: string, newVisibility: 'visible' | 'hidden') => {
    const updated = updateCompanionCardPermission(cardId, { visibility: newVisibility });
    setPermissions(updated);
    setNoticeMsg(
      newVisibility === 'visible'
        ? `تم إظهار بطاقة "${title}" بنجاح في نافذة الرفيق السريري 👁️`
        : `تم إخفاء بطاقة "${title}" تماماً عن نافذة الرفيق السريري 🚫`
    );
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = reorderCompanionCard(index, index - 1);
      setCardsList(updated);
      setNoticeMsg('تم تغيير ترتيب البطاقة بنجاح ⬆️');
      setTimeout(() => setNoticeMsg(null), 2500);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < cardsList.length - 1) {
      const updated = reorderCompanionCard(index, index + 1);
      setCardsList(updated);
      setNoticeMsg('تم تغيير ترتيب البطاقة بنجاح ⬇️');
      setTimeout(() => setNoticeMsg(null), 2500);
    }
  };

  const handleDeleteCard = (cardId: string, title: string) => {
    if (window.confirm(`هل أنتِ متأكدة من رغبتك في حذف بطاقة "${title}" من قائمة الرفيق السريري؟`)) {
      const updated = deleteCompanionCard(cardId);
      setCardsList(updated);
      setNoticeMsg(`تم حذف بطاقة "${title}" من قائمة الرفيق السريري بنجاح 🗑️`);
      setTimeout(() => setNoticeMsg(null), 3500);
    }
  };

  const handleDuplicateCard = (cardId: string, title: string) => {
    const result = duplicateCompanionCard(cardId);
    if (result.newCard) {
      setCardsList(result.cards);
      setPermissions(getCompanionPermissions());
      setNoticeMsg(`تم تكرار ونسخ بطاقة "${title}" بنجاح! 📋`);
      setTimeout(() => setNoticeMsg(null), 3500);
    }
  };

  const startEditCard = (card: CompanionCardMetadata) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditTitleEn(card.titleEn);
    setEditDesc(card.desc);
  };

  const saveEditCard = () => {
    if (!editingCardId) return;
    const updated = updateCompanionCardMetadata(editingCardId, {
      title: editTitle.trim(),
      titleEn: editTitleEn.trim(),
      desc: editDesc.trim(),
    });
    setCardsList(updated);
    setEditingCardId(null);
    setNoticeMsg('تم حفظ وتعديل بيانات البطاقة بنجاح 💾');
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const handleResetDefaults = () => {
    saveCompanionPermissions(DEFAULT_COMPANION_PERMISSIONS);
    setPermissions(DEFAULT_COMPANION_PERMISSIONS);
    const defCards = resetCompanionCardsList();
    setCardsList(defCards);
    setNoticeMsg('تمت استعادة الإعدادات والترتيب الافتراضي لبطاقات الرفيق السريري بنجاح 🔄');
    setTimeout(() => setNoticeMsg(null), 3500);
  };

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Syringe':
        return <Syringe className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Pill':
        return <Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'HelpCircle':
      default:
        return <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E2417] border-2 border-[#59662C]/40 dark:border-[#384524] shadow-sm space-y-6 text-right ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DEC9] dark:border-[#384524] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#59662C] to-[#8FA839] text-white flex items-center justify-center shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#2F2B24] dark:text-white">
                إدارة صلاحيات وعرض أقسام الرفيق السريري (Clinical Companion Visibility & Access Manager)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#59662C]/15 text-[#59662C] dark:bg-[#A4BF46]/20 dark:text-[#CBE276] border border-[#59662C]/30">
                FAB Suite Control
              </span>
            </div>
            <p className="text-xs text-[#6D675A] dark:text-[#A7A08E] font-medium mt-0.5">
              تحكم كامل ومزدوج بنوع الوصول (مجاني / اشتراك)، وحالة الظهور (إظهار / إخفاء)، وإعادة الترتيب أو التعديل والحذف لكل بطاقة.
            </p>
          </div>
        </div>

        {/* Global Reset */}
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-[#4D4537] dark:text-[#D5CDBC] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الافتراضي والترتيب الأصلي</span>
        </button>
      </div>

      {/* Notice Message */}
      {noticeMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* Cards Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardsList.map((card, idx) => {
          const perm = permissions[card.id] || DEFAULT_COMPANION_PERMISSIONS[card.id] || {
            access: 'subscription',
            visibility: 'visible',
          };
          const isFree = perm.access === 'free';
          const isUnderReview = perm.access === 'under_review';
          const isSubscription = perm.access === 'subscription' || !perm.access;
          const isVisible = perm.visibility === 'visible';
          const isEditing = editingCardId === card.id;

          return (
            <div
              key={`${card.id}_${idx}`}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                !isVisible
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 opacity-80 border-dashed'
                  : isUnderReview
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700/70 shadow-xs'
                  : isFree
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-400/50 dark:border-emerald-800/40 shadow-xs'
                  : 'bg-white dark:bg-[#1A2015] border-[#E5DEC9] dark:border-[#343E26] shadow-xs'
              }`}
            >
              {/* Card Meta & Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#202718] border border-black/5 dark:border-white/10 flex items-center justify-center shadow-xs shrink-0">
                      {getCardIcon(card.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#2F2B24] dark:text-white leading-tight truncate">
                          {card.title}
                        </h4>
                        {/* Status Badges */}
                        {isUnderReview ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400 flex items-center gap-1 shadow-2xs">
                            <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                            <span>⏳ قيد التدقيق</span>
                          </span>
                        ) : isFree ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-400 flex items-center gap-1 shadow-2xs">
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>🔓 متاح للعامة</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/15 text-teal-900 dark:text-teal-300 border border-teal-400/50 flex items-center gap-1 shadow-2xs">
                            <Lock className="w-2.5 h-2.5 text-teal-600" />
                            <span>🔒 للمشتركين فقط</span>
                          </span>
                        )}
                        {!isVisible && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-400 flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5 text-rose-600" />
                            <span>🚫 مخفي</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7A7467] dark:text-[#A7A08E] font-mono truncate block mt-0.5">
                        {card.titleEn}
                      </span>
                    </div>
                  </div>

                  {/* Status Pills & Reorder / Edit Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="تحريك لأعلى"
                        className={`p-1 rounded transition-colors ${
                          idx === 0
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer'
                        }`}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === cardsList.length - 1}
                        title="تحريك لأسفل"
                        className={`p-1 rounded transition-colors ${
                          idx === cardsList.length - 1
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer'
                        }`}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Edit Metadata Toggle */}
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingCardId(null) : startEditCard(card))}
                      title="تعديل نصوص البطاقة"
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    {/* Duplicate Card Button */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateCard(card.id, card.title)}
                      title="نسخ وتكرار البطاقة (Duplicate Card)"
                      className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {/* Delete Card Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id, card.title)}
                      title="حذف البطاقة تماماً"
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing Form if active */}
                {isEditing ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 block mb-0.5">
                        العنوان بالعربي:
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 block mb-0.5">
                        العنوان بالإنجليزي:
                      </label>
                      <input
                        type="text"
                        value={editTitleEn}
                        onChange={(e) => setEditTitleEn(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 block mb-0.5">
                        الوصف المختصر:
                      </label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingCardId(null)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={saveEditCard}
                        className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>حفظ التعديل</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#635D50] dark:text-[#A7A08E] leading-relaxed">
                    {card.desc}
                  </p>
                )}
              </div>

              {/* Dual Control Buttons Panel */}
              <div className="pt-3 border-t border-[#E5DEC9] dark:border-[#2F3922] space-y-2.5">
                {/* Control A: Content Status ([⏳ قيد التدقيق] vs [🔓 متاح للعامة] vs [🔒 للمشتركين فقط]) */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#554D3F] dark:text-[#C5BFB0] flex items-center gap-1">
                      <span>حالة المحتوى وصلاحية الوصول (Content Status):</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#8C741E] dark:text-[#E2C767]">
                      {isUnderReview ? 'قيد التدقيق الأكاديمي' : isFree ? 'مجاني للعامة' : 'حصري للمشتركين'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    {/* 1. قيد التدقيق (Under Review) */}
                    <button
                      type="button"
                      onClick={() => handleAccessChange(card.id, card.title, 'under_review')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isUnderReview
                          ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                          : 'text-[#685F4E] dark:text-[#C5BEAF] hover:text-black dark:hover:text-white hover:bg-white/50'
                      }`}
                      title="المحتوى قيد المراجعة والتدقيق الطبي من قبل د. حياة"
                    >
                      <Clock className="w-3 h-3" />
                      <span>قيد التدقيق ⏳</span>
                    </button>

                    {/* 2. متاح للعامة / مجاني (Free) */}
                    <button
                      type="button"
                      onClick={() => handleAccessChange(card.id, card.title, 'free')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isFree
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                          : 'text-[#685F4E] dark:text-[#C5BEAF] hover:text-black dark:hover:text-white hover:bg-white/50'
                      }`}
                      title="متاح مجاناً للجميع بدون كود أو اشتراك"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>مجاني 🔓</span>
                    </button>

                    {/* 3. متاح للمشتركين فقط (Subscribers Only) */}
                    <button
                      type="button"
                      onClick={() => handleAccessChange(card.id, card.title, 'subscription')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSubscription
                          ? 'bg-[#59662C] text-white shadow-xs ring-2 ring-[#7D9333]'
                          : 'text-[#685F4E] dark:text-[#C5BEAF] hover:text-black dark:hover:text-white hover:bg-white/50'
                      }`}
                      title="يتطلب كود اشتراك ساري المفعول للوصول إليه"
                    >
                      <Lock className="w-3 h-3" />
                      <span>للمشتركين 🔒</span>
                    </button>
                  </div>
                </div>

                {/* Control B: Visibility ([👁️ إظهار] vs [🚫 إخفاء تماماً]) */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
                  <span className="font-bold text-[#554D3F] dark:text-[#C5BFB0] flex items-center gap-1">
                    <span>حالة الظهور (Visibility):</span>
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange(card.id, card.title, 'visible')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                        isVisible
                          ? 'bg-[#59662C] text-white shadow-xs'
                          : 'text-[#685F4E] dark:text-[#C5BEAF] hover:text-black dark:hover:text-white'
                      }`}
                      title="إظهار القسم في جميع الواجهات"
                    >
                      <Eye className="w-3 h-3" />
                      <span>👁️ إظهار للجميع</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVisibilityChange(card.id, card.title, 'hidden')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                        !isVisible
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-[#685F4E] dark:text-[#C5BEAF] hover:text-black dark:hover:text-white'
                      }`}
                      title="إخفاء القسم تماماً عن المشتركين حتى اعتماده"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>🚫 إخفاء تماماً</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

