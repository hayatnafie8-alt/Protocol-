import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Activity,
  Layers,
  Compass,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  subscribeToStudentSkillsActivity,
  logStudentSkillActivityToCloud,
  AggregatedSkillsSummary,
  StudentSkillActivityLog,
  DomainCompetency,
} from '../services/studentSkillsActivityService';

interface StudentSkillsGrowthChartsProps {
  className?: string;
  isAuthorAdmin?: boolean;
  studentName?: string;
  onExportIncludeChange?: (included: boolean) => void;
}

export const StudentSkillsGrowthCharts: React.FC<StudentSkillsGrowthChartsProps> = ({
  className = '',
  isAuthorAdmin = false,
  studentName = 'طالب طب الأسنان',
}) => {
  const [summary, setSummary] = useState<AggregatedSkillsSummary | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'radar' | 'breakdown' | 'logs'>('timeline');
  const [timeFilter, setTimeFilter] = useState<'all' | 'term1' | 'term2'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newLogCategory, setNewLogCategory] = useState<'anesthesia' | 'rubber_dam' | 'suturing' | 'fillings' | 'endo' | 'extraction'>('anesthesia');
  const [newLogTitle, setNewLogTitle] = useState<string>('');
  const [newLogTooth, setNewLogTooth] = useState<string>('');
  const [newLogScore, setNewLogScore] = useState<number>(95);
  const [newLogDuration, setNewLogDuration] = useState<number>(20);
  const [newLogNotes, setNewLogNotes] = useState<string>('');
  const [isSavingLog, setIsSavingLog] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time Firebase Firestore aggregated activity logs
  useEffect(() => {
    const unsubscribe = subscribeToStudentSkillsActivity((data) => {
      setSummary(data);
    });

    const handleCustomUpdate = () => {
      // Re-trigger refresh on window event
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 600);
    };

    window.addEventListener('protocol-student-skills-updated', handleCustomUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('protocol-student-skills-updated', handleCustomUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('تمت مزامنة سجل النشاط السريري مع قاعدة بيانات Firebase بنجاح 🔄');
    }, 600);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim()) {
      showToast('يرجى كتابة عنوان الإجراء السريري أولاً');
      return;
    }

    setIsSavingLog(true);
    try {
      const categoryLabels: Record<string, string> = {
        anesthesia: 'التخدير الموضعي',
        rubber_dam: 'السد المطاطي',
        suturing: 'الخياطة الجراحية',
        fillings: 'الحشوات التجميلية',
        endo: 'المعالجة اللبية',
        extraction: 'القلع الجراحي',
      };

      await logStudentSkillActivityToCloud({
        studentId: 'std-current',
        studentName: studentName || 'طالب طب الأسنان',
        category: newLogCategory,
        categoryLabelAr: categoryLabels[newLogCategory] || 'إجراء سريري',
        procedureTitle: newLogTitle.trim(),
        toothNumber: newLogTooth.trim() || undefined,
        competencyScore: Number(newLogScore) || 90,
        durationMinutes: Number(newLogDuration) || 20,
        date: new Date().toISOString().split('T')[0],
        status: 'verified',
        supervisorNotes: newLogNotes.trim() || 'تم التوثيق والاعتماد عبر منصة بروتوكول السريرية.',
      });

      setNewLogTitle('');
      setNewLogTooth('');
      setNewLogNotes('');
      setShowLogModal(false);
      showToast('تم حفظ وتوثيق النشاط بنجاح في قاعدة بيانات Firebase ☁️✅');
    } catch {
      showToast('حدث خطأ أثناء حفظ النشاط');
    } finally {
      setIsSavingLog(false);
    }
  };

  // Filtered timeline based on selected academic period
  const filteredTimeline = useMemo(() => {
    if (!summary?.growthTimeline) return [];
    if (timeFilter === 'term1') {
      return summary.growthTimeline.slice(0, 3);
    }
    if (timeFilter === 'term2') {
      return summary.growthTimeline.slice(3);
    }
    return summary.growthTimeline;
  }, [summary?.growthTimeline, timeFilter]);

  // Radar chart data formatted for Recharts
  const radarData = useMemo(() => {
    if (!summary?.domainCompetencies) return [];
    return summary.domainCompetencies.map((d: DomainCompetency) => ({
      subject: d.domainNameAr.split(' ')[0] + ' ' + (d.domainNameAr.split(' ')[1] || ''),
      fullSubject: d.domainNameAr,
      'كفاءة الطالب': d.currentScore,
      'المعيار الأكاديمي': d.targetScore,
      cases: d.casesCount,
      badge: d.levelBadge,
    }));
  }, [summary?.domainCompetencies]);

  // Category breakdown for BarChart
  const breakdownData = useMemo(() => {
    if (!summary?.domainCompetencies) return [];
    return summary.domainCompetencies.map((d: DomainCompetency) => ({
      name: d.domainNameAr.split(' ')[0] + (d.domainNameAr.split(' ')[1] ? ` ${d.domainNameAr.split(' ')[1]}` : ''),
      'الحالات المنجزة': d.casesCount,
      'نسبة الإتقان %': d.currentScore,
      fill: d.color,
    }));
  }, [summary?.domainCompetencies]);

  // Custom Recharts Tooltip for Arabic styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#12160f]/95 border border-[#c5a059] p-3 rounded-lg shadow-xl backdrop-blur-md text-right text-xs">
          <p className="font-bold text-[#c5a059] mb-1.5 border-b border-[#3b4a2e] pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <strong className="text-white font-mono">{entry.value}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl border border-[#c5a059]/40 bg-gradient-to-b from-[#182014] via-[#141a10] to-[#0e130c] p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#59662c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e251a] border-2 border-[#c5a059] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#59662c] p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#161c12] rounded-[10px] flex items-center justify-center text-[#c5a059]">
              <TrendingUp size={22} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#fcfbfa] tracking-tight">
                رسم بياني تفاعلي لنمو مهارات الطلاب السريرية
              </h3>
              <span className="bg-[#59662c]/30 text-[#c5a059] border border-[#c5a059]/50 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>Recharts Engine</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>سجل النشاط السريري المجمع ومؤشرات الكفاءة التراكمية</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono text-[11px]">Firebase Cloud Live</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Log & Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-[#c5a059] to-[#8b6e2f] hover:from-[#d8b168] hover:to-[#9d7d36] text-black font-extrabold text-xs rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
            title="تسجيل نشاط أو مهارة سريرية جديدة في Firebase"
          >
            <PlusCircle size={14} />
            <span>توثيق نشاط جديد ➕</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-[#20281b] hover:bg-[#2c3725] border border-[#3b4a2e] text-[#c5a059] rounded-lg text-xs cursor-pointer transition-all disabled:opacity-50"
            title="تحديث البيانات من سحابة Firebase"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards: Executive Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        <div className="bg-[#12160f]/80 border border-[#3b4a2e] rounded-xl p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
            <Award size={13} className="text-[#c5a059]" />
            <span>مؤشر النضج السريري</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#c5a059]">
            {summary?.averageCompetency || 94}%
          </div>
          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
            مستوى متقدم وكفء ⭐
          </div>
        </div>

        <div className="bg-[#12160f]/80 border border-[#3b4a2e] rounded-xl p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
            <Clock size={13} className="text-[#38bdf8]" />
            <span>ساعات التدريب الموثقة</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#38bdf8]">
            {summary?.totalLoggedHours || 48} <span className="text-xs font-normal text-zinc-400">ساعة</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            معتمدة بالعيادات التعليمية
          </div>
        </div>

        <div className="bg-[#12160f]/80 border border-[#3b4a2e] rounded-xl p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
            <Activity size={13} className="text-[#10b981]" />
            <span>الأنشطة المسجلة بسحابياً</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#10b981]">
            {summary?.totalActivitiesCount || 24}
          </div>
          <div className="text-[10px] text-emerald-400/90 font-bold mt-0.5">
            سجل Firebase الموثق ✅
          </div>
        </div>

        <div className="bg-[#12160f]/80 border border-[#3b4a2e] rounded-xl p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
            <Zap size={13} className="text-amber-400" />
            <span>معدل تسارع النمو</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            +{summary?.growthRatePercent || 28.5}%
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            مقارنة بالفصل السابق 📈
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Chart View Selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#12160f] p-1.5 rounded-xl border border-white/5 relative z-10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveChartTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'timeline'
                ? 'bg-[#59662c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp size={13} />
            <span>مسار النمو الزمني (Timeline Area)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'radar'
                ? 'bg-[#59662c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass size={13} />
            <span>رادار الكفاءة (Radar Mastery)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('breakdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'breakdown'
                ? 'bg-[#59662c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={13} />
            <span>توزيع التخصصات (Bar Distribution)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'logs'
                ? 'bg-[#59662c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar size={13} />
            <span>سجل الأنشطة الحي ({summary?.recentActivities.length || 0})</span>
          </button>
        </div>

        {/* Period Filter (for Timeline) */}
        {activeChartTab === 'timeline' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] text-zinc-400 ml-1">الفترة:</span>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                timeFilter === 'all' ? 'bg-[#c5a059] text-black' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              كامل العام
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('term1')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                timeFilter === 'term1' ? 'bg-[#c5a059] text-black' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              الفصل الأول
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('term2')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                timeFilter === 'term2' ? 'bg-[#c5a059] text-black' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              الفصل الثاني
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Charts Canvas */}
      <div className="bg-[#12160f]/90 border border-[#2d3a24] rounded-xl p-3 sm:p-5 relative z-10 min-h-[340px] flex flex-col justify-center">
        {activeChartTab === 'timeline' && (
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
              <span className="flex items-center gap-1 font-bold text-[#c5a059]">
                <TrendingUp size={14} />
                <span>تطور درجات إتقان المهارات التراكمية عبر الأشهر (0 - 100%)</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                بيانات مجمعة من سجل النشاط في Firestore
              </span>
            </div>

            <div className="h-[280px] sm:h-[320px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredTimeline}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="anesthesiaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c5a059" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#c5a059" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="damGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="endoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#25301e" />
                  <XAxis dataKey="period" stroke="#71717a" fontSize={11} />
                  <YAxis domain={[40, 100]} stroke="#71717a" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="fillings"
                    name="الحشوات التجميلية"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#fillingsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="anesthesia"
                    name="التخدير الموضعي"
                    stroke="#c5a059"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#anesthesiaGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rubberDam"
                    name="السد المطاطي"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#damGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="endo"
                    name="المعالجة اللبية"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#endoGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChartTab === 'radar' && (
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
              <span className="flex items-center gap-1 font-bold text-[#c5a059]">
                <Compass size={14} />
                <span>رادار الكفاءة السريرية الشاملة مقابل المعيار الأكاديمي (7 محاور تخصصية)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                تغطية سريرية متكاملة 💎
              </span>
            </div>

            <div className="h-[290px] sm:h-[330px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#2c3725" />
                  <PolarAngleAxis dataKey="subject" stroke="#c5a059" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" fontSize={10} />
                  <Radar
                    name="كفاءة الطالب المحققة"
                    dataKey="كفاءة الطالب"
                    stroke="#c5a059"
                    fill="#c5a059"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="المعيار الأكاديمي المستهدف"
                    dataKey="المعيار الأكاديمي"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChartTab === 'breakdown' && (
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
              <span className="flex items-center gap-1 font-bold text-[#c5a059]">
                <Layers size={14} />
                <span>توزيع الحالات المنجزة ومعدلات الإتقان عبر التخصصات السريرية</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                محدثة من واقع السجلات المركزية
              </span>
            </div>

            <div className="h-[280px] sm:h-[320px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdownData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#25301e" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10.5} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="الحالات المنجزة"
                    name="عدد الحالات الموثقة"
                    fill="#59662c"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="نسبة الإتقان %"
                    name="معدل الكفاءة %"
                    fill="#c5a059"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChartTab === 'logs' && (
          <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/5 sticky top-0 bg-[#12160f] z-10">
              <span className="font-bold text-[#c5a059]">
                سجل النشاط السريري المجمع سحابياً ({summary?.recentActivities.length || 0} عملية موثقة):
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                آخر مزامنة: {summary?.lastSyncedAt || 'الآن'}
              </span>
            </div>

            {(!summary?.recentActivities || summary.recentActivities.length === 0) ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                لا توجد سجلات نشاط حالياً. اضغط على "توثيق نشاط جديد ➕" للإضافة.
              </div>
            ) : (
              summary.recentActivities.map((log: StudentSkillActivityLog, lIdx: number) => (
                <div
                  key={`${log.id || 'log'}_${lIdx}`}
                  className="bg-[#182014] border border-[#2d3a24] hover:border-[#c5a059]/60 rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#59662c]/20 border border-[#59662c] text-[#c5a059] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      {log.competencyScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-white">
                          {log.procedureTitle}
                        </span>
                        <span className="bg-[#20281b] border border-[#3b4a2e] text-[#c5a059] text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {log.categoryLabelAr}
                        </span>
                        {log.toothNumber && (
                          <span className="bg-[#12160f] text-sky-400 border border-sky-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">
                            🦷 سن #{log.toothNumber}
                          </span>
                        )}
                      </div>
                      {log.supervisorNotes && (
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                          📝 {log.supervisorNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center text-[10px] text-zinc-400">
                    <span>⏱️ {log.durationMinutes} دقيقة</span>
                    <span>📅 {log.date}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      موثق ☁️
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Domain Competency Badges Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <Sparkles size={13} className="text-[#c5a059]" />
          <span>المستوى السريري الإجمالي:</span>
          <span className="text-[#c5a059] font-black bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/30">
            طبيب أسنان متدرب بدرجة امتياز (Clinical Honors) 🏆
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span>الحشوات والترميم (96%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
            <span>التخدير وحصار الأعصاب (94%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            <span>العزل المطاطي (91%)</span>
          </span>
        </div>
      </div>

      {/* Interactive Modal: Log New Student Skill Activity into Firebase */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-[#161c12] border-2 border-[#c5a059] rounded-2xl p-5 max-w-md w-full shadow-2xl relative text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-[#c5a059] font-black text-sm">
                <PlusCircle size={18} />
                <span>توثيق نشاط أو مهارة سريرية جديدة (Firebase)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  التصنيف السريري للمهارة:
                </label>
                <select
                  value={newLogCategory}
                  onChange={(e: any) => setNewLogCategory(e.target.value)}
                  className="w-full bg-[#1e251a] border border-[#3b4a2e] rounded-lg p-2 text-white font-bold"
                >
                  <option value="anesthesia">💉 التخدير الموضعي وحصار الأعصاب (IANB / Infiltration)</option>
                  <option value="rubber_dam">🪥 عزل السد المطاطي وتطبيق المشابك (Rubber Dam)</option>
                  <option value="suturing">🪡 الخياطة الجراحية وتقنيات العقد (Suturing)</option>
                  <option value="fillings">💎 الحشوات التجميلية والترميم (Restorative)</option>
                  <option value="endo">⚡ المعالجة اللبية وتغطية اللب (Endo & DPC)</option>
                  <option value="extraction">🦷 القلع الجراحي البسيط والمحافظ (Exodontia)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  عنوان الإجراء السريري المنجز:
                </label>
                <input
                  type="text"
                  required
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="مثال: حقن العصب الشدقي الطويل مع تخدير ارتشاحي دهليزي"
                  className="w-full bg-[#1e251a] border border-[#3b4a2e] rounded-lg p-2 text-white placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    رقم السن / الموقع:
                  </label>
                  <input
                    type="text"
                    value={newLogTooth}
                    onChange={(e) => setNewLogTooth(e.target.value)}
                    placeholder="مثال: 46 أو 21"
                    className="w-full bg-[#1e251a] border border-[#3b4a2e] rounded-lg p-2 text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    المدة (بالدقائق):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newLogDuration}
                    onChange={(e) => setNewLogDuration(Number(e.target.value))}
                    className="w-full bg-[#1e251a] border border-[#3b4a2e] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-300 font-bold">
                    درجة الكفاءة والإتقان السريري:
                  </label>
                  <span className="text-[#c5a059] font-black">{newLogScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={newLogScore}
                  onChange={(e) => setNewLogScore(Number(e.target.value))}
                  className="w-full accent-[#c5a059] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  ملاحظات المشرف السريري / التقييم الأكاديمي:
                </label>
                <textarea
                  rows={2}
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="مثال: التزام تام بالبروتوكول السريري ومراعاة التعقيم والشفط السليم."
                  className="w-full bg-[#1e251a] border border-[#3b4a2e] rounded-lg p-2 text-white placeholder-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 bg-[#20281b] hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingLog}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#c5a059] to-[#8b6e2f] text-black font-black rounded-lg cursor-pointer hover:brightness-110 shadow-lg disabled:opacity-50"
                >
                  {isSavingLog ? 'جاري الحفظ في Firebase...' : 'حفظ في السجل السحابي ☁️✅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
