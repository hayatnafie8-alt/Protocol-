import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  PieChart as PieIcon,
  FileText,
} from 'lucide-react';
import { ClinicalReportGeneratorModal } from './ClinicalReportGeneratorModal';

interface MonthlyDataPoint {
  monthKey: string; // e.g. "2026-05"
  monthName: string; // e.g. "مايو"
  cases: number;
  completed: number;
  scheduled: number;
}

interface ClinicalCasesDashboardProps {
  className?: string;
  isAuthorAdmin?: boolean;
}

const MONTH_NAMES_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const ClinicalCasesDashboard: React.FC<ClinicalCasesDashboardProps> = ({
  className = '',
  isAuthorAdmin = false,
}) => {
  const isAuthorAdminResolved =
    isAuthorAdmin ||
    (typeof window !== 'undefined' && localStorage.getItem('dental_author_admin') === 'true');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for storage changes from AppointmentsSection or other parts of the app
  useEffect(() => {
    const handleStorageUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('protocol-appointments-updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('protocol-appointments-updated', handleStorageUpdate);
    };
  }, []);

  // Compute monthly case statistics from localStorage and baseline cases
  const { monthlyData, totalCases, currentMonthCount, completedCount, completionRate } =
    useMemo(() => {
      // 1. Gather all recorded appointments and archived cases
      let appointmentsList: Array<{ date: string; isArchived?: boolean }> = [];

      try {
        const stored = localStorage.getItem('protocol_appointments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            appointmentsList = parsed;
          }
        }
      } catch (e) {
        console.error('Error reading protocol_appointments', e);
      }

      try {
        const storedArchive = localStorage.getItem('proto_archive');
        if (storedArchive) {
          const parsedArchive = JSON.parse(storedArchive);
          if (Array.isArray(parsedArchive)) {
            parsedArchive.forEach((item) => {
              if (
                !appointmentsList.some(
                  (a: any) => a.name === item.name && a.date === item.date
                )
              ) {
                appointmentsList.push({
                  date: item.date,
                  isArchived: true,
                });
              }
            });
          }
        }
      } catch (e) {
        console.error('Error reading proto_archive', e);
      }

      // Check legacy single appointment date
      const legacyDate =
        localStorage.getItem('protocol_patient_date') ||
        localStorage.getItem('proto_date');
      if (legacyDate && appointmentsList.length === 0) {
        appointmentsList.push({ date: legacyDate, isArchived: false });
      }

      // 2. Prepare past 6 months timeline (or up to current month)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();

      // We'll prepare 6 consecutive months leading up to current month (starts zeroed out: 0 cases, real data only)
      const monthsArray: MonthlyDataPoint[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIndex - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
        const monthName = MONTH_NAMES_AR[m];

        monthsArray.push({
          monthKey,
          monthName,
          cases: 0,
          completed: 0,
          scheduled: 0,
        });
      }

      // 3. Count dynamic appointments into the months from real user entries
      appointmentsList.forEach((appt) => {
        if (!appt.date) return;
        const apptDate = new Date(appt.date);
        if (isNaN(apptDate.getTime())) return;

        const apptMonthKey = `${apptDate.getFullYear()}-${String(
          apptDate.getMonth() + 1
        ).padStart(2, '0')}`;

        const found = monthsArray.find((m) => m.monthKey === apptMonthKey);
        if (found) {
          found.cases += 1;
          if (appt.isArchived) {
            found.completed += 1;
          } else {
            found.scheduled += 1;
          }
        } else {
          // If in another month within reasonable range, add or append
          const mIndex = apptDate.getMonth();
          monthsArray.push({
            monthKey: apptMonthKey,
            monthName: MONTH_NAMES_AR[mIndex] || apptMonthKey,
            cases: 1,
            completed: appt.isArchived ? 1 : 0,
            scheduled: appt.isArchived ? 0 : 1,
          });
        }
      });

      // Sort chronological
      monthsArray.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      // Keep recent 6 months
      const displayMonths = monthsArray.slice(-6);

      const total = displayMonths.reduce((acc, curr) => acc + curr.cases, 0);
      const totalCompleted = displayMonths.reduce((acc, curr) => acc + curr.completed, 0);
      const thisMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
      const thisMonthObj = displayMonths.find((m) => m.monthKey === thisMonthKey);
      const curCount = thisMonthObj ? thisMonthObj.cases : 0;
      const rate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

      return {
        monthlyData: displayMonths,
        totalCases: total,
        currentMonthCount: curCount,
        completedCount: totalCompleted,
        completionRate: rate,
      };
    }, [refreshTrigger]);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #182218 0%, #0f1712 100%)',
        borderColor: '#c5a059',
      }}
    >
      {/* Header with toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none border-b"
        style={{
          background: 'rgba(59, 74, 46, 0.45)',
          borderColor: 'rgba(197, 160, 89, 0.3)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #3b4a2e 0%, #2a3621 100%)',
              border: '1px solid #c5a059',
            }}
          >
            <BarChart3 className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>لوحة متابعة الحالات السريرية</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
                  شهرياً
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-emerald-200/70">
              إحصائيات الإنجاز السريري وتوزيع الحالات شهرياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsReportModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg text-[11px] font-black text-[#151b12] bg-gradient-to-r from-[#c5a059] to-[#8b6e2f] hover:from-[#d4af37] hover:to-[#a7833e] flex items-center gap-1.5 shadow-sm transition-all"
            title="توليد تقرير الإنجاز السريري السنوي وتصديره كـ PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>تصدير التقرير (PDF) 📄</span>
          </button>
          <span className="text-xs font-mono font-bold text-[#c5a059]">
            {totalCases} حالة
          </span>
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#c5a059]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#c5a059]" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              className="p-2.5 rounded-xl border flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(197, 160, 89, 0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>إجمالي الحالات</span>
                <Users className="w-3.5 h-3.5 text-[#c5a059]" />
              </div>
              <div className="text-lg font-bold font-mono text-white flex items-baseline gap-1">
                <span>{totalCases}</span>
                <span className="text-[10px] text-slate-400 font-sans">حالة</span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(197, 160, 89, 0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>حالات هذا الشهر</span>
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 flex items-baseline gap-1">
                <span>{currentMonthCount}</span>
                <span className="text-[10px] text-slate-400 font-sans">مسجلة</span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(197, 160, 89, 0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>حالات مكتملة</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-lg font-bold font-mono text-teal-300 flex items-baseline gap-1">
                <span>{completedCount}</span>
                <span className="text-[10px] text-slate-400 font-sans">أرشيف</span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border flex flex-col justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(197, 160, 89, 0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>معدل الإنجاز</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 flex items-baseline gap-1">
                <span>{completionRate}%</span>
                <span className="text-[10px] text-slate-400 font-sans">نجاح</span>
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              الرسم البياني لتوزيع الحالات شهرياً
            </span>
            <div
              className="inline-flex rounded-lg p-0.5 border"
              style={{
                background: 'rgba(0,0,0,0.4)',
                borderColor: 'rgba(197, 160, 89, 0.2)',
              }}
            >
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  chartType === 'bar'
                    ? 'bg-[#c5a059] text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                أعمدة بيانية
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  chartType === 'area'
                    ? 'bg-[#c5a059] text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                منحنى بياني
              </button>
            </div>
          </div>

          {/* Recharts Chart Container */}
          <div
            className="w-full h-56 pt-2 rounded-xl p-2 border"
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.07)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="monthName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(197, 160, 89, 0.08)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlyDataPoint;
                        return (
                          <div
                            className="p-2.5 rounded-xl border text-xs shadow-xl"
                            style={{
                              background: '#182218',
                              borderColor: '#c5a059',
                              direction: 'rtl',
                              textAlign: 'right',
                            }}
                          >
                            <p className="font-bold text-white mb-1.5 flex items-center gap-1">
                              <span>📅 شهر {data.monthName}</span>
                            </p>
                            <div className="space-y-1 text-[11px]">
                              <p className="text-[#c5a059] flex items-center justify-between gap-3">
                                <span>إجمالي الحالات:</span>
                                <span className="font-bold font-mono">{data.cases}</span>
                              </p>
                              <p className="text-teal-400 flex items-center justify-between gap-3">
                                <span>منجزة / مؤرشفة:</span>
                                <span className="font-bold font-mono">{data.completed}</span>
                              </p>
                              <p className="text-emerald-300 flex items-center justify-between gap-3">
                                <span>مجدولة / قيد المتابعة:</span>
                                <span className="font-bold font-mono">{data.scheduled}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="cases"
                    name="إجمالي الحالات"
                    fill="#c5a059"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="completed"
                    name="مكتملة ومؤرشفة"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c5a059" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#c5a059" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.07)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="monthName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlyDataPoint;
                        return (
                          <div
                            className="p-2.5 rounded-xl border text-xs shadow-xl"
                            style={{
                              background: '#182218',
                              borderColor: '#c5a059',
                              direction: 'rtl',
                              textAlign: 'right',
                            }}
                          >
                            <p className="font-bold text-white mb-1.5">
                              📅 شهر {data.monthName}
                            </p>
                            <div className="space-y-1 text-[11px]">
                              <p className="text-[#c5a059]">
                                إجمالي الحالات: <span className="font-bold">{data.cases}</span>
                              </p>
                              <p className="text-teal-400">
                                الحالات المنجزة: <span className="font-bold">{data.completed}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke="#c5a059"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#casesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend and Note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] inline-block" />
                <span>إجمالي الحالات</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
                <span>مكتملة ومؤرشفة</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-300/80">
              ⚡ تحديث حي مع كل موعد أو حالة
            </span>
          </div>
        </div>
      )}

      {/* مودال توليد تقرير الإنجاز السريري وتصدير PDF */}
      <ClinicalReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        isAuthorAdmin={isAuthorAdminResolved}
      />
    </div>
  );
};
