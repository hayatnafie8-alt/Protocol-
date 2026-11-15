import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Send,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellOff,
  Save,
  Edit3,
  X,
  Volume2,
  Check,
} from 'lucide-react';
import {
  ClinicVivaQuestion,
  ClinicVivaSectionConfig,
  DEFAULT_CLINIC_VIVA_CONFIG,
  getLocalCachedClinicQuestions,
  getLocalCachedClinicConfig,
  saveLocalCachedClinicConfig,
} from '../data/clinicVivaQuestionsData';
import { useLanguage } from '../contexts/LanguageContext';
import {
  subscribeToClinicVivaQuestionsCloud,
  addClinicVivaQuestionInCloud,
  deleteClinicVivaQuestionInCloud,
  updateClinicVivaQuestionInCloud,
  updateClinicVivaSectionConfigInCloud,
  testClinicVivaNotification,
} from '../services/clinicVivaService';
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  playNotificationChime,
} from '../services/pushNotificationManager';

interface OperativeVivaSectionProps {
  isAuthorAdmin: boolean;
  isContentUnlocked?: boolean;
  onOpenSubscribeModal?: () => void;
  className?: string;
}

export const OperativeVivaSection: React.FC<OperativeVivaSectionProps> = ({
  isAuthorAdmin,
  isContentUnlocked = false,
  onOpenSubscribeModal,
  className = '',
}) => {
  const { language, t, isRTL } = useLanguage();
  const [questions, setQuestions] = useState<ClinicVivaQuestion[]>(() =>
    getLocalCachedClinicQuestions()
  );
  const [config, setConfig] = useState<ClinicVivaSectionConfig>(() =>
    getLocalCachedClinicConfig()
  );

  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [accessTypeInput, setAccessTypeInput] = useState<'free' | 'subscriber'>('free');
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [broadcastNotification, setBroadcastNotification] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Active notifications state for Clinic Viva Section
  const [notificationsActive, setNotificationsActive] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('clinic_viva_notifications_active');
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  // Inline Question Editing State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editAnsText, setEditAnsText] = useState('');
  const [editAccessType, setEditAccessType] = useState<'free' | 'subscriber'>('free');

  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to live updates from cloud
  useEffect(() => {
    const unsub = subscribeToClinicVivaQuestionsCloud(
      (items) => setQuestions(items),
      (cfg) => setConfig(cfg)
    );
    return () => unsub();
  }, []);

  // Show temporary notice
  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Toggle/Activate notifications for clinic questions box
  const handleToggleNotifications = async () => {
    const nextState = !notificationsActive;
    setNotificationsActive(nextState);
    try {
      localStorage.setItem('clinic_viva_notifications_active', String(nextState));
    } catch {}

    if (nextState) {
      try {
        if (isNotificationSupported() && getNotificationPermission() !== 'granted') {
          await requestNotificationPermission();
        }
        playNotificationChime();
        await testClinicVivaNotification();
        triggerNotice(
          isRTL
            ? 'تم تفعيل التنبيهات لخانة أسئلة العيادة بنجاح! 🔔✨ ستصلك نغمة الرنين والإشعارات الفورية للشاشة.'
            : 'Clinic viva notifications activated! 🔔✨'
        );
      } catch (err) {
        console.warn('Error activating notifications:', err);
      }
    } else {
      triggerNotice(
        isRTL
          ? 'تم كتم تنبيهات خانة أسئلة العيادة 🔕'
          : 'Clinic viva alerts muted 🔕'
      );
    }
  };

  // Test notification sound and lock-screen push
  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    try {
      if (isNotificationSupported() && getNotificationPermission() !== 'granted') {
        await requestNotificationPermission();
      }
      playNotificationChime();
      await testClinicVivaNotification();
      triggerNotice('تم إرسال إشعار تجريبي بنجاح وسماع نغمة التنبيه! 🔔✨');
    } catch (err) {
      console.warn('Failed to test clinic notification:', err);
    } finally {
      setIsTestingNotif(false);
    }
  };

  // Add new question handler
  const handleAddNewQuestion = async () => {
    const text = questionInput.trim();
    if (!text) {
      alert('الرجاء إدخال نص السؤال السريري أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      await addClinicVivaQuestionInCloud({
        question: text.startsWith('💡') || text.startsWith('🩺') ? text : `💡 ${text}`,
        answer: answerInput.trim() || undefined,
        accessType: accessTypeInput,
        authorName: 'د. حياة نافع فجر',
      });
      setQuestionInput('');
      setAnswerInput('');
      setShowAnswerField(false);
      triggerNotice(
        broadcastNotification
          ? 'تمت إضافة السؤال بنجاح وبث التنبيه الفوري الصوتي لجميع الطلاب! 🔔🚀'
          : 'تمت إضافة السؤال السريري بنجاح! 💾'
      );
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة السؤال');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save the entire section configuration to cloud & local storage (Save Button for the Card)
  const handleSaveSection = async () => {
    setIsSavingSection(true);
    try {
      await updateClinicVivaSectionConfigInCloud(config);
      saveLocalCachedClinicConfig(config);
      if (containerRef.current) {
        containerRef.current.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
        setTimeout(() => containerRef.current?.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
      }
      triggerNotice('تم حفظ خانة أسئلة العيادة وتأكيد المزامنة السحابية بنجاح! 💾✅');
      alert('تم حفظ خانة أسئلة العيادة وتأكيد المزامنة السحابية بنجاح! 💾✅');
    } catch (err) {
      console.warn('Failed to save viva section:', err);
      alert('حدث خطأ أثناء حفظ الخانة');
    } finally {
      setIsSavingSection(false);
    }
  };

  // Start editing a question
  const startEditQuestion = (q: ClinicVivaQuestion) => {
    setEditingQuestionId(q.id);
    setEditQText(q.question);
    setEditAnsText(q.answer || '');
    setEditAccessType(q.accessType);
  };

  // Save edited question
  const handleSaveQuestionEdit = async (qId: string) => {
    if (!editQText.trim()) {
      alert('نص السؤال مطلوب');
      return;
    }
    try {
      await updateClinicVivaQuestionInCloud(qId, {
        question: editQText.trim(),
        answer: editAnsText.trim() || undefined,
        accessType: editAccessType,
      });
      setEditingQuestionId(null);
      triggerNotice('تم حفظ السؤال وتحديث السحابة بنجاح! 💾✨');
      alert('تم حفظ السؤال السريري بنجاح! 💾✅');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ السؤال');
    }
  };

  // Confirm/Save individual question from its card
  const handleConfirmQuestionSave = (q: ClinicVivaQuestion) => {
    const cardEl = document.querySelector(`[data-item-id="${q.id}"]`);
    if (cardEl) {
      cardEl.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
      setTimeout(() => cardEl.classList.remove('ring-4', 'ring-[#59662C]'), 2000);
    }
    triggerNotice('تم حفظ خانة السؤال وتأكيد المزامنة السحابية بنجاح! 💾✅');
    alert(`تم حفظ خانة السؤال وتأكيد المزامنة السحابية بنجاح! 💾✅`);
  };

  // Toggle card visibility handler
  const handleToggleVisibility = async () => {
    const next = !config.isVisible;
    await updateClinicVivaSectionConfigInCloud({ isVisible: next });
    if (!next) {
      if (containerRef.current) {
        containerRef.current.classList.add('hidden-item');
        containerRef.current.style.opacity = '0.4';
      }
      alert('تم إخفاء القسم بنجاح');
    } else {
      if (containerRef.current) {
        containerRef.current.classList.remove('hidden-item');
        containerRef.current.style.opacity = '1';
      }
      alert('تم إظهار القسم بنجاح');
    }
  };

  // Toggle section access handler (Free vs Subscriber)
  const handleToggleAccess = async () => {
    const next = config.accessType === 'free' ? 'subscriber' : 'free';
    await updateClinicVivaSectionConfigInCloud({ accessType: next });
    if (next === 'free') {
      alert('تم تبديل إتاحة القسم: متاح للجميع مجاناً 🔓');
    } else {
      alert('تم تبديل إتاحة القسم: يتطلب اشتراك فعال للمشتركين 🔒');
    }
  };

  // Delete entire section handler
  const handleDeleteSection = async () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القسم نهائياً؟')) {
      await updateClinicVivaSectionConfigInCloud({ isDeleted: true });
      if (containerRef.current) {
        containerRef.current.remove();
      }
      alert('تم حذف العنصر بنجاح من التطبيق.');
    }
  };

  // Delete individual question handler
  const handleDeleteQuestion = async (qId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) {
      await deleteClinicVivaQuestionInCloud(qId);
      triggerNotice('تم حذف السؤال بنجاح.');
    }
  };

  // Register global window functions for direct script compatibility
  useEffect(() => {
    (window as any).addNewClinicQuestion = () => {
      const inputEl = document.getElementById('clinicQuestionInput') as HTMLInputElement | null;
      const selectEl = document.getElementById('questionAccessType') as HTMLSelectElement | null;
      if (inputEl) {
        setQuestionInput(inputEl.value);
        if (selectEl) {
          setAccessTypeInput((selectEl.value as any) || 'free');
        }
      }
      handleAddNewQuestion();
    };

    (window as any).toggleCardVisibility = (_btn?: HTMLElement) => {
      handleToggleVisibility();
    };

    (window as any).toggleCardAccess = (_btn?: HTMLElement) => {
      handleToggleAccess();
    };

    (window as any).deleteCardItem = (_btn?: HTMLElement) => {
      handleDeleteSection();
    };

    return () => {
      delete (window as any).addNewClinicQuestion;
      delete (window as any).toggleCardVisibility;
      delete (window as any).toggleCardAccess;
      delete (window as any).deleteCardItem;
    };
  });

  // If deleted and not admin, hide completely
  if (config.isDeleted && !isAuthorAdmin) {
    return null;
  }

  // If hidden and not admin, hide completely
  if (!config.isVisible && !isAuthorAdmin) {
    return null;
  }

  const isSectionFree = config.accessType === 'free';
  const isSectionUnlocked = isAuthorAdmin || isContentUnlocked || isSectionFree;

  return (
    <div
      ref={containerRef}
      id="operative-viva-section"
      data-item-id="operative-viva-section"
      data-action="card-item"
      className={`companion-section card-item ${!config.isVisible ? 'hidden-item' : ''} ${className}`}
      style={{
        background: '#ffffff',
        border: '2px solid #c5a059',
        borderRadius: '16px',
        padding: '16px',
        margin: '16px auto',
        maxWidth: '680px',
        opacity: config.isVisible ? 1 : 0.4,
        boxShadow: '0 4px 14px rgba(197, 160, 89, 0.12)',
        direction: isRTL ? 'rtl' : 'ltr',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Notice alert */}
      {notice && (
        <div
          style={{
            background: '#edf7ed',
            color: '#1e4620',
            border: '1px solid #c8e6c9',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#2e7d32', flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {/* Header with Title and Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #3b4a2e',
          paddingBottom: '10px',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ color: '#3b4a2e', margin: 0, fontSize: '16px', fontWeight: 900 }}>
            {isRTL ? '🩺 أسئلة العيادات (Operative Viva)' : '🩺 Operative Viva Examination Bank'}
          </h3>
          {!config.isVisible && isAuthorAdmin && (
            <span
              style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '2px 6px',
                fontSize: '10px',
                borderRadius: '4px',
                fontWeight: 'bold',
                border: '1px solid #ffeeba',
              }}
            >
              {isRTL ? '🔒 مخفي' : '🔒 Hidden'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span
            className="access-badge"
            style={{
              background: isSectionFree ? '#5cb85c' : '#c5a059',
              color: '#ffffff',
              padding: '3px 8px',
              fontSize: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            {isSectionFree
              ? (isRTL ? 'متاح للكل' : 'Open Access')
              : (isRTL ? 'للمشتركين فقط' : 'Candidates Only')}
          </span>
          <span
            style={{
              background: '#c5a059',
              color: '#ffffff',
              padding: '3px 8px',
              fontSize: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
            }}
          >
            {isRTL ? 'مشرف' : 'Faculty'}
          </span>
        </div>
      </div>

      {/* لوحة التحكم الإدارية الخاصة بكِ (Admin Panel for Dr. Hayat) */}
      {isAuthorAdmin && (
        <div
          style={{
            background: '#f9f6f0',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '14px',
            border: '1px solid #eadfcb',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5b5243', marginBottom: '6px' }}>
            ✨ لوحة الإشراف العيادي (إضافة أسئلة سينيور وبث تنبيهات حية):
          </div>
          <input
            type="text"
            id="clinicQuestionInput"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showAnswerField) handleAddNewQuestion();
            }}
            placeholder="أضيفي سؤال سينيور جديد..."
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #c5a059',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '8px',
              boxSizing: 'border-box',
              outline: 'none',
              background: '#ffffff',
              color: '#2c2c2c',
            }}
          />

          {showAnswerField && (
            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="إجابة وتوجيه السينيور السريري المعتمد (اختياري)..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #c5a059',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '8px',
                boxSizing: 'border-box',
                outline: 'none',
                background: '#ffffff',
                color: '#2c2c2c',
                resize: 'vertical',
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5b5243', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={broadcastNotification}
                onChange={(e) => setBroadcastNotification(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#3b4a2e' }}
              />
              <span>بث تنبيه صوتي فوري للشاشة وقفل الهاتف لجميع المشتركين 🔔</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAnswerField(!showAnswerField)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#59662C',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {showAnswerField ? 'إخفاء حقل الإجابة' : '+ إضافة إجابة وتوجيه السينيور'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <select
              id="questionAccessType"
              value={accessTypeInput}
              onChange={(e) => setAccessTypeInput(e.target.value as any)}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #c5a059',
                fontSize: '12px',
                background: '#ffffff',
                color: '#2c2c2c',
                cursor: 'pointer',
              }}
            >
              <option value="free">متاح للكل (مجاني)</option>
              <option value="subscriber">للمشتركين فقط (اشتراك)</option>
            </select>
            <button
              type="button"
              className="save-btn"
              data-action="save"
              onClick={handleAddNewQuestion}
              disabled={isSubmitting}
              style={{
                background: '#3b4a2e',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'background 0.2s',
              }}
              title="حفظ السؤال وبث التنبيه السريري"
            >
              <Save style={{ width: '13px', height: '13px' }} />
              <span>{isSubmitting ? 'جاري الحفظ والبث...' : 'حفظ ونشر السؤال 🚀'}</span>
            </button>
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isTestingNotif}
              style={{
                background: '#ffffff',
                color: '#59662C',
                border: '1px solid #c5a059',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="اختبار إرسال نغمة وإشعار تجريبي للشاشة للتأكد من التفعيل"
            >
              <Bell style={{ width: '13px', height: '13px', color: '#c5a059' }} />
              <span>{isTestingNotif ? 'جاري الرنين...' : 'تجربة التنبيه 🔔'}</span>
            </button>
          </div>
        </div>
      )}

      {/* أزرار تحكم القسم العام (حفظ الخانة، إخفاء، حذف، تبديل نوع الإتاحة) */}
      {isAuthorAdmin && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            background: '#fdfcfa',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px dashed #c5a059',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* زر حفظ الخانة المطلوب */}
          <button
            type="button"
            className="save-btn"
            data-action="save"
            onClick={handleSaveSection}
            disabled={isSavingSection}
            style={{
              background: '#59662C',
              color: 'white',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '5px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            title="حفظ إعدادات وتخصيصات خانة أسئلة العيادة سحابياً"
          >
            <Save style={{ width: '13px', height: '13px' }} />
            <span>{isSavingSection ? 'جاري الحفظ...' : 'حفظ الخانة 💾'}</span>
          </button>

          <button
            type="button"
            className="visibility-btn"
            data-action="toggle-visibility"
            onClick={handleToggleVisibility}
            style={{
              background: config.isVisible ? '#f0ad4e' : '#5cb85c',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {config.isVisible ? (
              <>
                <EyeOff style={{ width: '13px', height: '13px' }} />
                <span>إخفاء القسم</span>
              </>
            ) : (
              <>
                <Eye style={{ width: '13px', height: '13px' }} />
                <span>إظهار القسم</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="free-toggle-btn"
            data-action="toggle-free"
            onClick={handleToggleAccess}
            style={{
              background: isSectionFree ? '#5bc0de' : '#3b4a2e',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isSectionFree ? (
              <>
                <Lock style={{ width: '13px', height: '13px' }} />
                <span>تبديل الإتاحة (للمشتركين فقط)</span>
              </>
            ) : (
              <>
                <Unlock style={{ width: '13px', height: '13px' }} />
                <span>تبديل الإتاحة (متاح للكل مجاناً)</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="delete-btn"
            data-action="delete"
            onClick={handleDeleteSection}
            style={{
              background: '#ff4d4d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trash2 style={{ width: '13px', height: '13px' }} />
            <span>حذف القسم</span>
          </button>
        </div>
      )}

      {/* Clinic Questions Real-Time Notification Banner with Active Toggle Switch */}
      <div
        style={{
          background: notificationsActive
            ? 'linear-gradient(135deg, #fdfbf7 0%, #f7f3ea 100%)'
            : 'linear-gradient(135deg, #fbfbfb 0%, #f2f2f2 100%)',
          border: notificationsActive ? '1px solid #e2d7bf' : '1px solid #dcdcdc',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          direction: isRTL ? 'rtl' : 'ltr',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: notificationsActive ? 'rgba(197, 160, 89, 0.2)' : 'rgba(120, 120, 120, 0.15)',
              color: notificationsActive ? '#59662C' : '#666666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {notificationsActive ? (
              <Bell style={{ width: '16px', height: '16px' }} />
            ) : (
              <BellOff style={{ width: '16px', height: '16px' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: notificationsActive ? '#3b4a2e' : '#555555', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>
                {notificationsActive
                  ? (isRTL ? 'تنبيهات أسئلة العيادة (Operative Viva) مفعلة 🔔' : 'Clinical Viva Question Alerts Active 🔔')
                  : (isRTL ? 'تنبيهات أسئلة العيادة معطلة حالياً 🔕' : 'Clinical Viva Alerts Muted 🔕')}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: notificationsActive ? '#edf7ed' : '#f5f5f5',
                  color: notificationsActive ? '#2e7d32' : '#777777',
                  border: notificationsActive ? '1px solid #c8e6c9' : '1px solid #dddddd',
                  fontWeight: 'bold',
                }}
              >
                {notificationsActive ? (isRTL ? 'مفعلة ✅' : 'Active') : (isRTL ? 'معطلة' : 'Muted')}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#6d6553' }}>
              {notificationsActive
                ? (isRTL
                    ? 'ستصلك نغمة الرنين والإشعار الفوري للشاشة وقفل الهاتف فور إضافة الدكتورة لأي سؤال سينيور جديد.'
                    : 'Real-time chime, lock screen push & in-app alerts whenever faculty publishes viva questions.')
                : (isRTL
                    ? 'اضغط على زر التفعيل بالجانب لتشغيل نغمات الرنين والإشعارات الفورية عند إضافة أسئلة جديدة.'
                    : 'Click enable button to activate real-time chimes and push alerts.')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Main Activation / Toggle Button */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            style={{
              background: notificationsActive ? '#ffffff' : '#59662C',
              border: notificationsActive ? '1px solid #c5a059' : '1px solid #485323',
              color: notificationsActive ? '#59662C' : '#ffffff',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
            title={notificationsActive ? 'إيقاف تنبيهات أسئلة العيادة' : 'تفعيل تنبيهات أسئلة العيادة فوراً'}
          >
            {notificationsActive ? (
              <>
                <BellOff style={{ width: '13px', height: '13px', color: '#856404' }} />
                <span>{isRTL ? 'إيقاف التنبيه 🔕' : 'Mute'}</span>
              </>
            ) : (
              <>
                <Bell style={{ width: '13px', height: '13px', color: '#ffffff' }} />
                <span>{isRTL ? 'تفعيل التنبيهات الآن 🔔' : 'Enable Alerts 🔔'}</span>
              </>
            )}
          </button>

          {/* Test Chime Button */}
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={isTestingNotif}
            style={{
              background: '#ffffff',
              border: '1px solid #c5a059',
              color: '#59662C',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
            title={isRTL ? 'اختبار صوت النغمة وظهور الإشعار على الشاشة' : 'Test chime & push notification'}
          >
            <Sparkles style={{ width: '13px', height: '13px', color: '#c5a059' }} />
            <span>{isTestingNotif ? (isRTL ? 'جاري...' : '...') : (isRTL ? 'اختبار 🔔' : 'Test 🔔')}</span>
          </button>
        </div>
      </div>

      {/* قائمة أسئلة العيادات (#clinicQuestionsList) */}
      <div id="clinicQuestionsList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {questions.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              background: '#fdfcfa',
              borderRadius: '8px',
              border: '1px dashed #c5a059',
              color: '#8b8070',
              fontSize: '12px',
            }}
          >
            لا توجد أسئلة عيادية مضافة حالياً.
          </div>
        ) : (
          questions.map((q, qIdx) => {
            const isQuestionFree = isSectionFree || q.accessType === 'free';
            const isQuestionUnlocked = isAuthorAdmin || isContentUnlocked || isQuestionFree;
            const isExpanded = !!expandedAnswers[q.id];
            const isEditingThis = editingQuestionId === q.id;
            const currentQText = isRTL ? q.question : (q.questionEn || q.question);
            const currentAnsText = isRTL ? q.answer : (q.answerEn || q.answer);

            return (
              <div
                key={`${q.id || 'viva_q'}_${qIdx}`}
                className="clinic-q-card card-item"
                data-item-id={q.id}
                style={{
                  background: '#fdfcfa',
                  borderRight: isRTL ? '4px solid #3b4a2e' : '1px solid #ebd9b5',
                  borderLeft: !isRTL ? '4px solid #3b4a2e' : '1px solid #ebd9b5',
                  borderTop: '1px solid #ebd9b5',
                  borderBottom: '1px solid #ebd9b5',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {/* Edit Form Mode */}
                {isEditingThis ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#59662C' }}>
                      ✍️ تعديل السؤال السريري:
                    </div>
                    <input
                      type="text"
                      value={editQText}
                      onChange={(e) => setEditQText(e.target.value)}
                      placeholder="نص السؤال..."
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #c5a059',
                        borderRadius: '6px',
                        fontSize: '12px',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                    <textarea
                      value={editAnsText}
                      onChange={(e) => setEditAnsText(e.target.value)}
                      placeholder="إجابة وتوجيه السينيور..."
                      rows={3}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #c5a059',
                        borderRadius: '6px',
                        fontSize: '12px',
                        width: '100%',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={editAccessType}
                        onChange={(e) => setEditAccessType(e.target.value as any)}
                        style={{
                          padding: '5px 8px',
                          border: '1px solid #c5a059',
                          borderRadius: '6px',
                          fontSize: '11px',
                        }}
                      >
                        <option value="free">مجاني للجميع</option>
                        <option value="subscriber">للمشتركين فقط</option>
                      </select>

                      <button
                        type="button"
                        className="save-btn"
                        data-action="save"
                        onClick={() => handleSaveQuestionEdit(q.id)}
                        style={{
                          background: '#59662C',
                          color: 'white',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="حفظ تعديلات السؤال"
                      >
                        <Save style={{ width: '12px', height: '12px' }} />
                        <span>حفظ التعديل 💾</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(null)}
                        style={{
                          background: '#e0e0e0',
                          color: '#333333',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <X style={{ width: '12px', height: '12px' }} />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flex: 1,
                        cursor: q.answer ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (q.answer && isQuestionUnlocked) {
                          setExpandedAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
                        } else if (!isQuestionUnlocked && onOpenSubscribeModal) {
                          onOpenSubscribeModal();
                        }
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#2c2c2c', fontWeight: 'bold' }}>
                        {currentQText}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      {/* Badge */}
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          background: isQuestionFree ? '#edf7ed' : '#fff3cd',
                          color: isQuestionFree ? '#2e7d32' : '#856404',
                          border: isQuestionFree ? '1px solid #c8e6c9' : '1px solid #ffeeba',
                        }}
                      >
                        {isQuestionFree ? (isRTL ? 'مجاني' : 'Free') : (isRTL ? 'اشتراك' : 'Candidate')}
                      </span>

                      {/* Expand Answer Button if available */}
                      {q.answer && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isQuestionUnlocked) {
                              setExpandedAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
                            } else if (onOpenSubscribeModal) {
                              onOpenSubscribeModal();
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#3b4a2e',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={isExpanded ? (isRTL ? 'إخفاء الإجابة' : 'Hide Faculty Answer') : (isRTL ? 'عرض إجابة وتوجيه السينيور' : 'Show Senior Defense Guidance')}
                        >
                          {isExpanded ? (
                            <ChevronUp style={{ width: '16px', height: '16px' }} />
                          ) : (
                            <ChevronDown style={{ width: '16px', height: '16px' }} />
                          )}
                        </button>
                      )}

                      {/* Admin Save button for each question card */}
                      {isAuthorAdmin && (
                        <button
                          type="button"
                          className="save-btn"
                          data-action="save"
                          onClick={() => handleConfirmQuestionSave(q)}
                          style={{
                            background: '#59662C',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                          title="حفظ وتأكيد مزامنة هذه الخانة"
                        >
                          <Save style={{ width: '11px', height: '11px' }} />
                          <span>{isRTL ? 'حفظ 💾' : 'Save'}</span>
                        </button>
                      )}

                      {/* Admin Edit button for each question card */}
                      {isAuthorAdmin && (
                        <button
                          type="button"
                          className="edit-btn"
                          data-action="edit"
                          onClick={() => startEditQuestion(q)}
                          style={{
                            background: '#f0ad4e',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                          title="تعديل نص السؤال أو الإجابة"
                        >
                          <Edit3 style={{ width: '11px', height: '11px' }} />
                          <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                        </button>
                      )}

                      {/* Admin Delete button as in user snippet */}
                      {isAuthorAdmin && (
                        <button
                          type="button"
                          className="delete-btn"
                          data-action="delete"
                          onClick={() => handleDeleteQuestion(q.id)}
                          style={{
                            background: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                        >
                          {isRTL ? 'حذف' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Answer and Clinical Senior Pearls */}
                {isExpanded && q.answer && (
                  <div
                    style={{
                      background: '#f4ede1',
                      border: '1px solid #dfcfb2',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#3a3224',
                      lineHeight: '1.5',
                      marginTop: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#3b4a2e', marginBottom: '2px' }}>
                      {isRTL ? '📋 توجيه وإجابة السينيور المعتمدة:' : '📋 Faculty & Senior Defense Guidance:'}
                    </div>
                    {currentAnsText}
                  </div>
                )}

                {/* Locked indicator for non-subscribers */}
                {!isQuestionUnlocked && (
                  <div
                    onClick={() => {
                      if (onOpenSubscribeModal) onOpenSubscribeModal();
                    }}
                    style={{
                      background: '#fff9e6',
                      border: '1px dashed #f0ad4e',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#8a6d3b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock style={{ width: '12px', height: '12px', color: '#d9534f' }} />
                      <span>{isRTL ? 'إجابة وتفاصيل هذا السؤال متاحة للمشتركين فقط' : 'Detailed clinical rationale restricted to candidates'}</span>
                    </span>
                    <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{isRTL ? 'تفعيل الاشتراك' : 'Unlock'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
