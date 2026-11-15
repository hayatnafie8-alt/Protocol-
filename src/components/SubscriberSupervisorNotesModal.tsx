import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mail,
  Sparkles,
  BookOpen,
  Tag,
  History,
  ShieldCheck,
  Stethoscope,
  Presentation,
  Bell,
} from 'lucide-react';
import {
  SupervisorNote,
  NOTE_CATEGORIES,
} from '../data/supervisorNotes';
import {
  subscribeToSupervisorNotesCloud,
  saveSupervisorNoteToCloud,
  markNoteReplyReadInCloud,
} from '../services/realTimeSyncService';

interface SubscriberSupervisorNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  sectionContextTitle?: string;
  slideContextTitle?: string;
  highlightedNoteId?: string;
}

export const SubscriberSupervisorNotesModal: React.FC<SubscriberSupervisorNotesModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  sectionContextTitle,
  slideContextTitle,
  highlightedNoteId,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [email, setEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState<SupervisorNote['category']>('clinical_question');
  const [noteContent, setNoteContent] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [allNotes, setAllNotes] = useState<SupervisorNote[]>([]);
  const [myNotes, setMyNotes] = useState<SupervisorNote[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubscribe = subscribeToSupervisorNotesCloud((notes) => {
      setAllNotes(notes);
    });
    return () => unsubscribe();
  }, []);

  // Filter notes for current subscriber
  useEffect(() => {
    const targetEmail = (email || defaultEmail || localStorage.getItem('dental_subscriber_email') || '').trim().toLowerCase();
    if (targetEmail) {
      const filtered = allNotes.filter(
        (n) => n.studentEmail.toLowerCase() === targetEmail
      );
      setMyNotes(filtered);
    } else {
      setMyNotes(allNotes.slice(0, 15));
    }
  }, [allNotes, email, defaultEmail]);

  // Initialize email & context
  useEffect(() => {
    if (isOpen) {
      const storedEmail =
        defaultEmail ||
        localStorage.getItem('dental_subscriber_email') ||
        localStorage.getItem('dental_student_email') ||
        '';
      if (storedEmail) setEmail(storedEmail);
      if (sectionContextTitle) setSectionTitle(sectionContextTitle);
      if (slideContextTitle) setSlideTitle(slideContextTitle);
      if (highlightedNoteId) {
        setActiveTab('history');
      }
      setSubmitSuccess(false);
      setFormError('');
    }
  }, [isOpen, defaultEmail, sectionContextTitle, slideContextTitle, highlightedNoteId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim();
    const cleanContent = noteContent.trim();

    if (!cleanEmail) {
      setFormError('يرجى إدخال بريدك الإلكتروني ليتمكن المشرف من متابعة استفسارك والرد عليك.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('يرجى إدخال بريد إلكتروني بصيغة صحيحة (مثال: student@gmail.com).');
      return;
    }

    if (!cleanContent) {
      setFormError('يرجى كتابة نص الملاحظة أو الاستفسار السريري.');
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem('dental_subscriber_email', cleanEmail);
      if (studentName.trim()) {
        localStorage.setItem('dental_subscriber_name', studentName.trim());
      }

      await saveSupervisorNoteToCloud({
        studentEmail: cleanEmail,
        studentName: studentName.trim() || undefined,
        category,
        sectionTitle: sectionTitle.trim() || undefined,
        slideTitle: slideTitle.trim() || undefined,
        content: cleanContent,
      });

      setSubmitSuccess(true);
      setNoteContent('');
      setTimeout(() => {
        setActiveTab('history');
        setSubmitSuccess(false);
      }, 1400);
    } catch (err) {
      console.error(err);
      setFormError('تعذر إرسال الملاحظة، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendViaTelegram = () => {
    const cleanEmail = email.trim();
    const cleanContent = noteContent.trim();
    if (!cleanEmail || !cleanContent) {
      setFormError('يرجى كتابة الإيميل والملاحظة أولاً لإرسالها عبر تليجرام.');
      return;
    }
    const msg = `ملاحظة واستفسار من المشترك عبر تطبيق بروتوكول:
📧 بريد المشترك: ${cleanEmail}
👤 الاسم: ${studentName.trim() || 'طالب طب أسنان'}
📑 القسم/السلايد: ${sectionTitle || 'عام'} ${slideTitle ? `(${slideTitle})` : ''}
🏷️ التصنيف: ${NOTE_CATEGORIES[category]?.label || 'سؤال سريري'}

📝 نص الملاحظة للمشرف:
${cleanContent}`;

    window.open(`https://t.me/hay_a_2?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] dark:bg-[#181D13] rounded-3xl shadow-2xl border-2 border-[#59662C]/60 dark:border-[#3E4A2E] overflow-hidden my-auto animate-scaleUp text-[#2F2B24] dark:text-[#F3EFE6]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#59662C]/20 via-white to-amber-500/10 dark:from-[#20271A] dark:via-[#192115] dark:to-[#171A12] border-b border-[#E5DEC9] dark:border-[#343E26] text-right space-y-2 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white dark:bg-[#20271A] text-gray-500 hover:text-gray-800 dark:text-gray-300 flex items-center justify-center border border-[#E5DEC9] dark:border-[#343E26] cursor-pointer shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#59662C] text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#59662C]/15 dark:bg-[#A8C24E]/20 text-[#59662C] dark:text-[#CBE276] border border-[#59662C]/30">
              صندوق ملاحظات واستفسارات المشتركين
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#2F2B24] dark:text-white">
            كتابة ملاحظات واستفسارات للمشرف ✍️
          </h3>

          <p className="text-xs text-[#6B6354] dark:text-[#C5BEAF] leading-relaxed">
            مساحة مخصصة للمشتركين لتدوين أسئلتهم السريرية، ملاحظاتهم حول خطوات الترميم أو الحالات، وإرسالها مباشرة إلى المشرفة{' '}
            <strong className="text-[#59662C] dark:text-[#A8C24E]">د. حياة نافع فجر</strong>.
          </p>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-white dark:bg-[#20261A] text-[#554E41] dark:text-[#C5BEAF] border border-[#E5DEC9] dark:border-[#343E26]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>كتابة ملاحظة جديدة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('history');
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#59662C] text-white shadow-xs'
                  : 'bg-white dark:bg-[#20261A] text-[#554E41] dark:text-[#C5BEAF] border border-[#E5DEC9] dark:border-[#343E26]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل ملاحظاتي المرسلة ({myNotes.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Write New Note Form */}
        {activeTab === 'write' && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs text-right">
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-bold leading-relaxed">{formError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-900 dark:text-emerald-200 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-2 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم إرسال ملاحظتك للمشرفة د. حياة نافع بنجاح! 🚀</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 pr-7 font-medium">
                  تم تسجيل ملاحظتك في لوحة التحكم الخاصة بالمشرف وستتم مراجعتها والرد عليها.
                </p>
              </div>
            )}

            {/* Email and Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A8C24E]" />
                  <span>البريد الإلكتروني للمشترك:*</span>
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs font-mono font-bold text-[#2F2B24] dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A8C24E]" />
                  <span>اسم المشترك / الطالب:</span>
                </label>
                <input
                  type="text"
                  placeholder="د. أحمد / طالب..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#384524] text-xs text-[#2F2B24] dark:text-white"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#59662C] dark:text-[#A8C24E]" />
                <span>تصنيف ونوع الملاحظة:*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(NOTE_CATEGORIES).map(([catKey, catVal], cIdx) => (
                  <button
                    key={`${catKey}_${cIdx}`}
                    type="button"
                    onClick={() => setCategory(catKey as SupervisorNote['category'])}
                    className={`p-2 rounded-xl text-right border text-[11px] font-bold transition-all cursor-pointer ${
                      category === catKey
                        ? 'bg-[#59662C] text-white border-[#59662C] shadow-xs'
                        : 'bg-white dark:bg-[#151910] text-[#4F493D] dark:text-[#D5CDBC] border-[#D5CDBC] dark:border-[#343E26] hover:bg-[#F0ECE1]'
                    }`}
                  >
                    <span>{catVal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section & Slide context if present */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC]">
                  القسم ذو الصلة:
                </label>
                <input
                  type="text"
                  placeholder="مثال: بروتوكول Class IV أو حالات الخلع الجراحي"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#343E26] text-xs text-[#2F2B24] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#443E33] dark:text-[#D5CDBC]">
                  رقم أو عنوان الشريحة (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: شريحة Bevel أو شريحة التخدير"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#151910] rounded-xl border border-[#D5CDBC] dark:border-[#343E26] text-xs text-[#2F2B24] dark:text-white"
                />
              </div>
            </div>

            {/* The Main Notes Textarea: (Requested explicitly: امكانية للمشتركين كتابة الملاحظات في خانة الملاحظات للمشرف) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-black text-sm text-[#2F2B24] dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#59662C] dark:text-[#A8C24E]" />
                  <span>خانة كتابة الملاحظات للمشرف:*</span>
                </label>
                <span className="text-[10px] text-[#7C7566] dark:text-[#A7A08E] font-mono">
                  {noteContent.length} حرف
                </span>
              </div>

              <textarea
                rows={4}
                placeholder="اكتب ملاحظتك، استفسارك السريري، تعليقك على خطوات الترميم، أو أي صعوبة واجهتها في العيادة لمناقشتها مع المشرفة د. حياة نافع فجر..."
                value={noteContent}
                onChange={(e) => {
                  setNoteContent(e.target.value);
                  if (formError) setFormError('');
                }}
                className="w-full p-3.5 bg-white dark:bg-[#151910] rounded-2xl border-2 border-[#59662C]/40 dark:border-[#3E4A2E] text-xs leading-relaxed text-[#2F2B24] dark:text-white focus:outline-none focus:border-[#59662C] shadow-2xs transition-all"
                required
              />
              <p className="text-[11px] text-[#787163] dark:text-[#A7A08E]">
                💡 سيتم إرسال هذه الملاحظة مباشرة إلى لوحة المشرفة لتزويدك بالتوجيه السريري المعتمد.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-[#E5DEC9] dark:border-[#343E26]">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-[#59662C] hover:bg-[#485320] text-white font-black text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الملاحظة في صندوق المشرف 🚀</span>
              </button>

              <button
                type="button"
                onClick={handleSendViaTelegram}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#20271A] hover:bg-gray-100 dark:hover:bg-gray-800 text-[#0088cc] border border-[#0088cc]/30 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                <span>إرسال نسخة مباشرة للمشرفة عبر تليجرام أيضاً ✈️</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Sent Notes History */}
        {activeTab === 'history' && (
          <div className="p-5 sm:p-6 space-y-3 text-xs max-h-[60vh] overflow-y-auto">
            {myNotes.length === 0 ? (
              <div className="p-8 text-center text-[#7E7768] dark:text-[#A7A08E] space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                <p className="font-bold">لم تقم بإرسال أي ملاحظات بعد</p>
                <p className="text-[11px]">
                  يمكنك كتابة ملاحظة أو استفسار للمشرفة وسيظهر في هذا السجل مع رد المشرفة.
                </p>
              </div>
            ) : (
              myNotes.map((note, nIdx) => {
                const isNewReply = note.reply && (!(note as any).replyReadByStudent || highlightedNoteId === note.id);

                return (
                  <div
                    key={`${note.id}_${nIdx}`}
                    onClick={() => {
                      if (note.reply && !(note as any).replyReadByStudent) {
                        markNoteReplyReadInCloud(note.id);
                      }
                    }}
                    className={`p-4 rounded-2xl bg-white dark:bg-[#20261A] transition-all space-y-2 text-right shadow-2xs ${
                      isNewReply
                        ? 'border-2 border-amber-500 ring-2 ring-amber-400/25 shadow-md'
                        : 'border border-[#E5DEC9] dark:border-[#343E26]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#7E7768] dark:text-[#A7A08E] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{note.createdAt}</span>
                        {isNewReply && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white animate-pulse flex items-center gap-1 shadow-xs">
                            <Bell className="w-3 h-3" />
                            <span>إشعار جديد</span>
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-[#59662C]/15 text-[#59662C] dark:text-[#CBE276]">
                        {NOTE_CATEGORIES[note.category]?.label || 'ملاحظة'}
                      </span>
                    </div>

                    {(note.sectionTitle || note.slideTitle) && (
                      <div className="text-[11px] text-[#59662C] dark:text-[#A8C24E] font-bold">
                        {note.sectionTitle} {note.slideTitle ? `— ${note.slideTitle}` : ''}
                      </div>
                    )}

                    <p className="text-xs text-[#2F2B24] dark:text-white leading-relaxed whitespace-pre-line bg-[#FAF7F2] dark:bg-[#161A11] p-3 rounded-xl border border-[#E5DEC9] dark:border-[#343E26]">
                      {note.content}
                    </p>

                    {/* Supervisor Reply if available */}
                    {note.reply ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-right space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-900 dark:text-amber-200">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>رد المشرفة (د. حياة نافع فجر):</span>
                          </span>
                          {note.repliedAt && <span className="font-mono text-[10px]">{note.repliedAt}</span>}
                        </div>
                        <p className="text-xs text-[#2F2B24] dark:text-[#F3EFE6] leading-relaxed font-semibold">
                          {note.reply}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>قيد المراجعة من قِبل المشرفة د. حياة نافع...</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
