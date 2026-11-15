import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  Camera,
  Archive,
  Award,
  ShieldCheck,
  Building2,
  Filter,
  Check,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  Send,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  TrueCaseItem,
  getClinicalCases,
  CLINICAL_CATEGORIES,
  ClinicalCategory,
  CasePhoto,
} from '../utils/clinicalCasesStorage';
import {
  ClinicalReportExportRequest,
  getOrCreateStudentProfileId,
  submitReportExportRequest,
  subscribeToStudentReportRequest,
  approveReportExportRequest,
  cancelStudentReportRequest,
} from '../services/clinicalReportApprovalService';
import {
  getCacheBustedImageUrl,
  getGlobalBrandingVersion,
  PROTOCOL_OFFICIAL_STAMP_KEY,
  PROTOCOL_OFFICIAL_STAMP_EVENT,
  DEFAULT_OFFICIAL_STAMP_PATH,
} from '../utils/cacheBuster';
import { StudentSkillsGrowthCharts } from './StudentSkillsGrowthCharts';

interface ClinicalReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCases?: TrueCaseItem[];
  isAuthorAdmin?: boolean;
}

// Official Circular Protocol Stamp HTML for printable PDF / HTML documents
export const getProtocolStampSvgString = (_isApproved?: boolean, _code?: string) => {
  const stampPath =
    (typeof window !== 'undefined' ? localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY) : null) ||
    DEFAULT_OFFICIAL_STAMP_PATH;
  const cacheBustedStamp = getCacheBustedImageUrl(stampPath, Date.now());

  return `
    <div class="protocol-stamp-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-2deg); margin: 0 auto;">
      <img
        src="${cacheBustedStamp}"
        alt="الختم الرسمي لبروتوكول"
        class="protocol-official-stamp"
        style="width: 130px; height: 130px; object-fit: contain; filter: drop-shadow(0 3px 6px rgba(51,67,39,0.3)); display: block;"
        onerror="this.src='/protocol_official_stamp.svg'"
      />
      <div style="font-size: 8.5px; font-weight: 900; color: #334327; margin-top: 4px; letter-spacing: 0.5px; text-align: center;">
        الختم الرسمي لبروتوكول
      </div>
    </div>
  `;
};

// Protocol Official Stamp JSX Component for Live In-App Preview
export const ProtocolOfficialStamp: React.FC<{ size?: number; customUrl?: string }> = ({
  size = 125,
  customUrl,
}) => {
  const [stampSrc, setStampSrc] = useState<string>(() => {
    try {
      return (
        customUrl ||
        localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY) ||
        DEFAULT_OFFICIAL_STAMP_PATH
      );
    } catch {
      return DEFAULT_OFFICIAL_STAMP_PATH;
    }
  });
  const [stampVersion, setStampVersion] = useState<number>(() => getGlobalBrandingVersion());

  useEffect(() => {
    const handleStampUpdate = (e?: any) => {
      try {
        const val =
          typeof e?.detail === 'string'
            ? e.detail
            : localStorage.getItem(PROTOCOL_OFFICIAL_STAMP_KEY);
        setStampSrc(val || DEFAULT_OFFICIAL_STAMP_PATH);
        setStampVersion(Date.now());
      } catch {}
    };

    window.addEventListener(PROTOCOL_OFFICIAL_STAMP_EVENT, handleStampUpdate);
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === PROTOCOL_OFFICIAL_STAMP_KEY) {
        handleStampUpdate();
      }
    });

    return () => {
      window.removeEventListener(PROTOCOL_OFFICIAL_STAMP_EVENT, handleStampUpdate);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-2deg)',
        userSelect: 'none',
      }}
    >
      <img
        src={getCacheBustedImageUrl(stampSrc, stampVersion)}
        alt="الختم الرسمي لبروتوكول"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          filter: 'drop-shadow(0 3px 6px rgba(51, 67, 39, 0.3))',
          display: 'block',
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/protocol_official_stamp.svg';
        }}
      />
      <div style={{ fontSize: '8.5px', fontWeight: 900, color: '#334327', marginTop: '4px', letterSpacing: '0.5px', textAlign: 'center' }}>
        الختم الرسمي لبروتوكول
      </div>
    </div>
  );
};

const ClinicalReportGeneratorModalContent: React.FC<ClinicalReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialCases,
  isAuthorAdmin = false,
}) => {
  const [cases, setCases] = useState<TrueCaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Student & Academic Metadata (editable with persistent local storage)
  const [studentName, setStudentName] = useState(() => {
    return (
      localStorage.getItem('protocol_student_name') ||
      localStorage.getItem('dental_user_name') ||
      'طالب طب أسنان متدرب'
    );
  });
  const [university, setUniversity] = useState(() => {
    return (
      localStorage.getItem('protocol_student_university') ||
      'كلية طب الأسنان - العيادات التعليمية'
    );
  });
  const [academicStage, setAcademicStage] = useState(() => {
    return (
      localStorage.getItem('protocol_student_stage') ||
      'المرحلة الخامسة (سنة التخرج)'
    );
  });
  const [academicYear, setAcademicYear] = useState(() => {
    return (
      localStorage.getItem('protocol_academic_year') ||
      '2025 - 2026'
    );
  });
  const [supervisorName, setSupervisorName] = useState(() => {
    return (
      localStorage.getItem('protocol_report_supervisor') ||
      'د. حياة نافع فجر (أخصائية طب الأسنان الترميمي والتجميلي)'
    );
  });

  // Interactive Student Input Modal State & Dynamic Layout
  const [activeReportTab, setActiveReportTab] = useState<'preview' | 'charts'>('preview');
  const [showStudentInputModal, setShowStudentInputModal] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'auto' | 'single' | 'multi'>('auto');
  const [tempStudentName, setTempStudentName] = useState(studentName);
  const [tempUniversity, setTempUniversity] = useState(university);
  const [tempAcademicStage, setTempAcademicStage] = useState(academicStage);
  const [tempAcademicYear, setTempAcademicYear] = useState(academicYear);

  // Sync temp values whenever opening the input modal
  const handleOpenStudentInputModal = () => {
    setTempStudentName(studentName);
    setTempUniversity(university);
    setTempAcademicStage(academicStage);
    setTempAcademicYear(academicYear);
    setShowStudentInputModal(true);
  };

  const handleApplyStudentData = (triggerPrintAfter = false) => {
    const finalName = tempStudentName.trim() || 'طالب طب أسنان متدرب';
    const finalUni = tempUniversity.trim() || 'كلية طب الأسنان - العيادات التعليمية';
    const finalStage = tempAcademicStage.trim() || 'المرحلة الخامسة (سنة التخرج)';
    const finalYear = tempAcademicYear.trim() || '2025 - 2026';

    setStudentName(finalName);
    setUniversity(finalUni);
    setAcademicStage(finalStage);
    setAcademicYear(finalYear);

    try {
      localStorage.setItem('protocol_student_name', finalName);
      localStorage.setItem('protocol_student_university', finalUni);
      localStorage.setItem('protocol_student_stage', finalStage);
      localStorage.setItem('protocol_academic_year', finalYear);
    } catch {}

    setShowStudentInputModal(false);
    showNotice('تم تحديث بيانات الطالب وحفظها في ترويسة التقرير الرسمية بنجاح ✅');

    if (triggerPrintAfter) {
      setTimeout(() => {
        executePrint(finalName, finalUni, finalStage, finalYear);
      }, 300);
    }
  };

  // Report customization options
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ClinicalCategory>('all');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includePatientNames, setIncludePatientNames] = useState(true);
  const [customReportNotes, setCustomReportNotes] = useState('');

  // UI state
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);

  // Load cases from IndexedDB / Storage
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    if (initialCases && initialCases.length > 0) {
      setCases(initialCases);
      setLoading(false);
    } else {
      getClinicalCases()
        .then((loaded) => {
          if (isMounted) {
            setCases(loaded);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialCases]);

  // Persist student profile changes to localStorage
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('protocol_student_name', studentName);
      localStorage.setItem('protocol_student_university', university);
      localStorage.setItem('protocol_student_stage', academicStage);
      localStorage.setItem('protocol_academic_year', academicYear);
      localStorage.setItem('protocol_report_supervisor', supervisorName);
    } catch {}
  };

  // Filter cases based on selected category
  const filteredCases = useMemo(() => {
    if (selectedCategoryFilter === 'all') return cases;
    return cases.filter((c) => c.category === selectedCategoryFilter);
  }, [cases, selectedCategoryFilter]);

  // Comprehensive analytics & real success rate
  const statistics = useMemo(() => {
    const total = cases.length;
    const archived = cases.filter((c) => c.isArchived).length;
    const withPhotos = cases.filter((c) => c.photos && c.photos.length > 0).length;
    const totalPhotos = cases.reduce((sum, c) => sum + (c.photos ? c.photos.length : 0), 0);

    // Category breakdown
    const byCategory: Record<ClinicalCategory, number> = {
      extraction: 0,
      fillings: 0,
      dentures: 0,
      cleaning: 0,
      endo: 0,
      other: 0,
    };

    cases.forEach((c) => {
      const cat = c.category || 'other';
      if (byCategory[cat] !== undefined) {
        byCategory[cat]++;
      } else {
        byCategory.other++;
      }
    });

    // Real completion & clinical success rate
    // If student has archived cases, completion rate is based on archived / total.
    // If total is 0, defaults to 100%.
    const successRate = total > 0 ? Math.round(((archived || total) / total) * 100) : 100;

    return {
      total,
      archived,
      withPhotos,
      totalPhotos,
      successRate,
      byCategory,
    };
  }, [cases]);

  // Serial Report ID for authenticity
  const reportSerialId = useMemo(() => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PROTOCOL-CLINICAL-${dateStr}-${rand}`;
  }, []);

  const reportDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const showNotice = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3500);
  };

  // Supervisor Approval Request State & Real-Time Sync
  const [approvalRequest, setApprovalRequest] = useState<ClinicalReportExportRequest | null>(null);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [showApprovalRequestModal, setShowApprovalRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [studentDeviceId] = useState(() => getOrCreateStudentProfileId());

  // Listen to supervisor approval updates in real-time
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToStudentReportRequest(
      studentDeviceId,
      (req) => {
        setApprovalRequest(req);
      },
      reportSerialId
    );
    return () => unsub();
  }, [isOpen, studentDeviceId, reportSerialId]);

  const isExportAllowed = isAuthorAdmin || approvalRequest?.status === 'approved';
  const isApprovedOrAdmin = isAuthorAdmin || approvalRequest?.status === 'approved';
  const finalApprovalCode = approvalRequest?.approvalCode || '';

  // Submit approval request to supervisor
  const handleRequestApproval = async () => {
    if (isSubmittingApproval) return;
    handleSaveProfile();
    setIsSubmittingApproval(true);

    try {
      const categoryCounts: Record<string, number> = {
        extraction: statistics.byCategory.extraction || 0,
        fillings: statistics.byCategory.fillings || 0,
        dentures: statistics.byCategory.dentures || 0,
        cleaning: statistics.byCategory.cleaning || 0,
        endo: statistics.byCategory.endo || 0,
        other: statistics.byCategory.other || 0,
      };

      const newReq = await submitReportExportRequest({
        studentId: studentDeviceId,
        studentName,
        university,
        academicStage,
        academicYear,
        supervisorName,
        reportSerialId,
        totalCases: statistics.total,
        successRate: statistics.successRate,
        totalPhotos: statistics.totalPhotos,
        archivedCasesCount: statistics.archived,
        categoryBreakdown: categoryCounts,
        notes: requestNotes || customReportNotes || undefined,
      });

      setApprovalRequest(newReq);
      setShowApprovalRequestModal(false);
      showNotice('تم إرسال طلب تصدير التقرير السريري إلى المشرف بنجاح! ستصلك إشارة فور الاعتماد 🔔');
    } catch (e) {
      console.error(e);
      showNotice('حدث خطأ أثناء إرسال طلب الاعتماد.');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Direct approval by supervisor when in Admin/Supervisor mode
  const handleDirectSupervisorApproval = async () => {
    if (!isAuthorAdmin) return;
    handleSaveProfile();

    try {
      const categoryCounts: Record<string, number> = {
        extraction: statistics.byCategory.extraction || 0,
        fillings: statistics.byCategory.fillings || 0,
        dentures: statistics.byCategory.dentures || 0,
        cleaning: statistics.byCategory.cleaning || 0,
        endo: statistics.byCategory.endo || 0,
        other: statistics.byCategory.other || 0,
      };

      const req = await submitReportExportRequest({
        studentId: studentDeviceId,
        studentName,
        university,
        academicStage,
        academicYear,
        supervisorName,
        reportSerialId,
        totalCases: statistics.total,
        successRate: statistics.successRate,
        totalPhotos: statistics.totalPhotos,
        archivedCasesCount: statistics.archived,
        categoryBreakdown: categoryCounts,
        notes: 'تم الاعتماد المباشر بواسطة المشرفة.',
      });

      const approved = await approveReportExportRequest(req.id, supervisorName, 'تم الاعتماد المباشر بصفة المشرفة.');
      if (approved) {
        setApprovalRequest(approved);
      }
      showNotice('تمت المصادقة والاعتماد المباشر للتقرير بنجاح! أصبح جاهزاً للتصدير والطباعة ✅');
    } catch {
      showNotice('حدث خطأ أثناء المصادقة المباشرة.');
    }
  };

  // Cancel pending request
  const handleCancelApprovalRequest = async () => {
    if (!approvalRequest) return;
    try {
      await cancelStudentReportRequest(approvalRequest.id);
      setApprovalRequest(null);
      showNotice('تم إلغاء طلب الاعتماد.');
    } catch {}
  };

  // Build the complete standalone printable HTML document with Dynamic Layout Engine
  const generateFullReportHTML = (
    activeName = studentName,
    activeUni = university,
    activeStage = academicStage,
    activeYear = academicYear
  ) => {
    const categoryLabels: Record<string, { name: string; color: string; icon: string }> = {
      extraction: { name: 'قلع الأسنان وجراحة الفم', color: '#ef4444', icon: '🦷' },
      fillings: { name: 'حشوات وترميم الأسنان', color: '#c5a059', icon: '💎' },
      dentures: { name: 'صناعة وتعويض الأسنان', color: '#38bdf8', icon: '🪥' },
      cleaning: { name: 'تنظيف وتجريف اللثة', color: '#10b981', icon: '✨' },
      endo: { name: 'معالجة الجذور واللب', color: '#a855f7', icon: '⚡' },
      other: { name: 'حالات واستشارات عامة', color: '#94a3b8', icon: '📋' },
    };

    const isApprovedOrAdmin = isAuthorAdmin || approvalRequest?.status === 'approved';
    const finalApprovalCode = approvalRequest?.approvalCode || '';
    const activeAppLogo = localStorage.getItem('protocol_header_logo') || localStorage.getItem('protocol_app_logo') || '';

    // Dynamic layout calculation:
    // If cases count is small and few photos attached, compress everything into a pristine Single A4 page.
    // If cases count is large or many photos attached with dates, flow cleanly into Page 2.
    const totalPhotosInFiltered = filteredCases.reduce(
      (sum, c) => sum + (includePhotos && c.photos ? c.photos.length : 0),
      0
    );

    const isSinglePage =
      layoutMode === 'single' ||
      (layoutMode === 'auto' &&
        ((filteredCases.length <= 4 && totalPhotosInFiltered <= 2) ||
         (filteredCases.length <= 6 && totalPhotosInFiltered === 0) ||
         filteredCases.length <= 2));

    const renderCaseCard = (item: TrueCaseItem, idx: number, isCompact: boolean) => {
      const catInfo = categoryLabels[item.category] || categoryLabels.other;
      const photosHTML =
        includePhotos && item.photos && item.photos.length > 0
          ? `
        <div class="photos-grid ${isCompact ? 'compact-photos' : ''}">
          ${item.photos
            .slice(0, isCompact ? 2 : 6)
            .map(
              (p, pIdx) => `
            <div class="photo-card ${isCompact ? 'compact' : ''}">
              <img src="${p.url}" alt="صورة سريرية ${pIdx + 1}" />
              <div class="photo-meta-bar">
                <span class="photo-caption">${p.caption || `صورة سريرية #${pIdx + 1}`}</span>
                ${item.date ? `<span class="photo-date">📅 ${item.date}</span>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : '';

      return `
      <div class="case-card ${idx % 2 === 0 ? 'even' : 'odd'} ${isCompact ? 'compact' : ''}">
        <div class="case-header">
          <div class="case-title-group">
            <span class="case-number">#${idx + 1}</span>
            <span class="patient-name">${includePatientNames ? item.name : `مراجع سريري #${idx + 1}`}</span>
            ${item.toothNumber ? `<span class="tooth-badge">🦷 سن: ${item.toothNumber}</span>` : ''}
          </div>
          <div class="case-meta">
            <span class="category-badge" style="background-color: ${catInfo.color}15; color: ${catInfo.color}; border: 1px solid ${catInfo.color}60;">
              ${catInfo.icon} ${catInfo.name}
            </span>
            <span class="date-badge">📅 ${item.date || 'غير محدد'}</span>
            <span class="status-badge">✅ موثقة</span>
          </div>
        </div>
        ${item.procedure ? `<div class="case-procedure"><strong>الإجراء:</strong> ${item.procedure}</div>` : ''}
        ${item.notes && (!isCompact || filteredCases.length <= 2) ? `<div class="case-notes"><strong>ملاحظات:</strong> ${item.notes}</div>` : ''}
        ${photosHTML}
      </div>
    `;
    };

    // If multi-page, partition cases across pages
    let page1CasesHTML = '';
    let page2CasesHTML = '';

    if (isSinglePage) {
      page1CasesHTML = filteredCases.map((c, i) => renderCaseCard(c, i, true)).join('');
    } else {
      // In multi-page mode: Page 1 holds stats and first 2-3 cases; Page 2 holds the rest + full photo gallery + signatures
      const p1Cutoff = includeStats ? 2 : 4;
      const page1List = filteredCases.slice(0, p1Cutoff);
      const page2List = filteredCases.slice(p1Cutoff);

      page1CasesHTML = page1List.map((c, i) => renderCaseCard(c, i, false)).join('');
      page2CasesHTML = page2List.map((c, i) => renderCaseCard(c, i + p1Cutoff, false)).join('');
    }

    const statsHTML = includeStats
      ? `
      <div class="stats-section ${isSinglePage ? 'compact' : ''}">
        <h3 class="section-title">📊 مؤشرات الإنجاز ونسب النجاح السريري طوال العام</h3>
        <div class="stats-grid ${isSinglePage ? 'compact' : ''}">
          <div class="stat-card">
            <div class="stat-value">${statistics.total}</div>
            <div class="stat-label">إجمالي الحالات</div>
          </div>
          <div class="stat-card gold">
            <div class="stat-value">${statistics.successRate}%</div>
            <div class="stat-label">معدل النجاح السريري</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics.totalPhotos}</div>
            <div class="stat-label">الصور المؤرشفة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics.archived}</div>
            <div class="stat-label">الحالات المكتملة</div>
          </div>
        </div>

        ${
          !isSinglePage
            ? `
        <div class="categories-breakdown">
          <table class="category-table">
            <thead>
              <tr>
                <th>القسم السريري</th>
                <th>عدد الحالات</th>
                <th>النسبة من المجموع</th>
                <th>مستوى الإنجاز</th>
              </tr>
            </thead>
            <tbody>
              ${CLINICAL_CATEGORIES.map((cat) => {
                const count = statistics.byCategory[cat.id] || 0;
                const pct = statistics.total > 0 ? Math.round((count / statistics.total) * 100) : 0;
                return `
                  <tr>
                    <td><strong>${cat.icon} ${cat.nameAr}</strong></td>
                    <td class="bold-text">${count} حالة</td>
                    <td>${pct}%</td>
                    <td>
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        `
            : ''
        }
      </div>
    `
      : '';

    // Official circular stamp generated centrally
    const circularOfficialStampHTML = getProtocolStampSvgString();

    const signaturesHTML = includeSignatures
      ? `
      <div class="signatures-section ${isSinglePage ? 'compact' : ''}">
        <!-- Student Signature Box -->
        <div class="signature-box student">
          <div class="sig-title">توقيع وإقرار الطالب المتدرب:</div>
          <div class="sig-name">${activeName}</div>
          <div class="sig-meta">${activeStage} • ${activeUni}</div>
          <div class="sig-date">تاريخ التوثيق: ${reportDateFormatted}</div>
          <div class="sig-line">التوقيع: [تم الاعتماد والإقرار السريري ✓]</div>
        </div>

        <!-- Official Circular Protocol Stamp in Center -->
        <div class="stamp-emblem-center">
          ${circularOfficialStampHTML}
        </div>

        <!-- Protocol Accreditation Box -->
        <div class="signature-box platform ${isApprovedOrAdmin ? 'approved' : ''}">
          <div class="sig-title">جهة الاعتماد والمصادقة السريرية:</div>
          <div class="sig-name">بروتوكول (PROTOCOL)</div>
          <div class="sig-status">الحالة: منجز ومصادق سريرياً عبر بروتوكول ✅</div>
          <div class="sig-line">الختم والمصادقة: [معتمد وموثق رقمياً بالنظام ✓]</div>
        </div>
      </div>
    `
      : '';

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير الإنجاز السريري السنوي المعتمد - ${activeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: ${isSinglePage ? '8mm 10mm' : '10mm 12mm'};
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fbfaf7;
      color: #1a2016;
      line-height: ${isSinglePage ? '1.35' : '1.5'};
      font-size: ${isSinglePage ? '11px' : '12.5px'};
    }

    .report-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: ${isSinglePage ? '14px 18px' : '22px'};
      background: #ffffff;
      border: 3px double #c5a059;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      ${
        isSinglePage
          ? `
        height: 100vh;
        max-height: 282mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        page-break-inside: avoid;
        page-break-after: avoid;
      `
          : ''
      }
    }

    /* Header styling with brand identity */
    .report-header {
      border-bottom: 2px solid #59662c;
      padding-bottom: ${isSinglePage ? '8px' : '14px'};
      margin-bottom: ${isSinglePage ? '8px' : '14px'};
      position: relative;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${isSinglePage ? '6px' : '10px'};
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: ${isSinglePage ? '42px' : '48px'};
      height: ${isSinglePage ? '42px' : '48px'};
      background: linear-gradient(135deg, #1e251a, #59662c);
      color: #c5a059;
      border: 2px solid #c5a059;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSinglePage ? '22px' : '24px'};
      font-weight: 900;
    }

    .brand-names h1 {
      margin: 0;
      font-size: ${isSinglePage ? '16px' : '18px'};
      font-weight: 900;
      color: #1e251a;
      letter-spacing: -0.5px;
    }

    .brand-names p {
      margin: 2px 0 0 0;
      font-size: ${isSinglePage ? '10px' : '11px'};
      color: #59662c;
      font-weight: 800;
    }

    .serial-box {
      text-align: left;
      font-size: ${isSinglePage ? '9px' : '10px'};
      color: #71717a;
      line-height: 1.3;
    }

    .serial-number {
      font-family: monospace;
      font-weight: bold;
      color: #c5a059;
      background: #1e251a;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 2px;
      font-size: ${isSinglePage ? '9px' : '10.5px'};
    }

    /* Prominent Accreditation Banner Required by User */
    .accreditation-banner {
      text-align: center;
      margin: ${isSinglePage ? '6px 0 8px 0' : '10px 0 14px 0'};
      padding: ${isSinglePage ? '6px 10px' : '8px 14px'};
      background: linear-gradient(90deg, rgba(89,102,44,0.12), rgba(197,160,89,0.22), rgba(89,102,44,0.12));
      border: 1.5px solid #c5a059;
      border-radius: 8px;
    }

    .accreditation-badge {
      display: inline-block;
      background: #1e251a;
      color: #c5a059;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: ${isSinglePage ? '9px' : '10px'};
      font-weight: 900;
      margin-bottom: 2px;
    }

    .accreditation-text {
      margin: 0;
      font-size: ${isSinglePage ? '14px' : '16px'};
      color: #1e251a;
      font-weight: 900;
      letter-spacing: -0.3px;
    }

    .accreditation-sub {
      margin: 2px 0 0 0;
      font-size: ${isSinglePage ? '9.5px' : '11px'};
      color: #59662c;
      font-weight: 700;
    }

    /* Student & Academic Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${isSinglePage ? '6px 12px' : '8px 14px'};
      background: #f7f5f0;
      border: 1px solid #e2ddd2;
      border-radius: 8px;
      padding: ${isSinglePage ? '8px 12px' : '10px 14px'};
      margin-bottom: ${isSinglePage ? '8px' : '14px'};
      font-size: ${isSinglePage ? '10.5px' : '11.5px'};
    }

    .info-item {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .info-label {
      color: #71717a;
      font-weight: 700;
      white-space: nowrap;
    }

    .info-value {
      color: #1e251a;
      font-weight: 900;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: ${isSinglePage ? '8px' : '16px'};
      page-break-inside: avoid;
    }

    .section-title {
      font-size: ${isSinglePage ? '12px' : '13.5px'};
      color: #59662c;
      border-bottom: 1.5px solid #c5a059;
      padding-bottom: 3px;
      margin: 0 0 ${isSinglePage ? '6px' : '10px'} 0;
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: ${isSinglePage ? '6px' : '8px'};
      margin-bottom: ${isSinglePage ? '6px' : '10px'};
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #d4cebe;
      border-radius: 6px;
      padding: ${isSinglePage ? '6px 4px' : '8px 6px'};
      text-align: center;
    }

    .stat-card.gold {
      background: #1e251a;
      border: 1px solid #c5a059;
      color: #ffffff;
    }

    .stat-card.gold .stat-value {
      color: #c5a059;
    }

    .stat-card.gold .stat-label {
      color: #e2ddd2;
    }

    .stat-value {
      font-size: ${isSinglePage ? '17px' : '20px'};
      font-weight: 900;
      color: #59662c;
      line-height: 1.1;
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: ${isSinglePage ? '9px' : '10px'};
      color: #52525b;
      font-weight: 700;
    }

    .category-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      background: #ffffff;
      border: 1px solid #e2ddd2;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 6px;
    }

    .category-table th {
      background: #1e251a;
      color: #c5a059;
      padding: 5px 8px;
      text-align: right;
      font-weight: 700;
    }

    .category-table td {
      padding: 4px 8px;
      border-bottom: 1px solid #f0ece3;
    }

    .progress-bar-bg {
      background: #ece7db;
      border-radius: 3px;
      height: 5px;
      width: 100%;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    /* Cases Log Section */
    .cases-section {
      margin-bottom: ${isSinglePage ? '6px' : '16px'};
      ${isSinglePage ? 'flex: 1 1 auto; overflow: hidden;' : ''}
    }

    .case-card {
      background: #ffffff;
      border: 1px solid #dcd7c9;
      border-right: 3.5px solid #59662c;
      border-radius: 6px;
      padding: ${isSinglePage ? '6px 10px' : '10px 12px'};
      margin-bottom: ${isSinglePage ? '6px' : '10px'};
      page-break-inside: avoid;
    }

    .case-card.even {
      background: #faf9f5;
    }

    .case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${isSinglePage ? '3px' : '6px'};
      flex-wrap: wrap;
      gap: 4px;
    }

    .case-title-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .case-number {
      background: #59662c;
      color: #ffffff;
      font-size: ${isSinglePage ? '9.5px' : '10.5px'};
      font-weight: bold;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .patient-name {
      font-size: ${isSinglePage ? '12px' : '13px'};
      font-weight: 900;
      color: #1e251a;
    }

    .tooth-badge {
      background: rgba(197,160,89,0.15);
      color: #8b6e2f;
      border: 1px solid #c5a059;
      font-size: 9.5px;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: bold;
    }

    .case-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .category-badge {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: bold;
    }

    .date-badge {
      font-size: 9.5px;
      color: #71717a;
      font-weight: 600;
    }

    .status-badge {
      font-size: 8.5px;
      color: #15803d;
      background: #dcfce7;
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: bold;
    }

    .case-procedure, .case-notes {
      font-size: ${isSinglePage ? '10px' : '11px'};
      margin-bottom: 3px;
      color: #27272a;
      line-height: 1.35;
    }

    /* Photos Grid */
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px dashed #dcd7c9;
    }

    .photos-grid.compact-photos {
      grid-template-columns: repeat(2, 1fr);
      gap: 4px;
      margin-top: 4px;
      padding-top: 4px;
    }

    .photo-card {
      border: 1px solid #c5a059;
      border-radius: 5px;
      overflow: hidden;
      background: #1e251a;
      text-align: center;
    }

    .photo-card img {
      width: 100%;
      height: ${isSinglePage ? '55px' : '75px'};
      object-fit: cover;
      display: block;
    }

    .photo-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 4px;
      background: #12160f;
      font-size: 8px;
    }

    .photo-caption {
      color: #c5a059;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .photo-date {
      color: #a0a59a;
      font-size: 7.5px;
    }

    /* Page Break Utility for Multi-Page */
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 12mm;
    }

    .page-continuation-header {
      border-bottom: 1.5px solid #59662c;
      padding-bottom: 6px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #59662c;
      font-weight: 800;
    }

    /* Signatures & Seal Section */
    .signatures-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: ${isSinglePage ? '8px' : '22px'};
      padding-top: ${isSinglePage ? '8px' : '14px'};
      border-top: 2px solid #59662c;
      page-break-inside: avoid;
      gap: 12px;
    }

    .signature-box {
      flex: 1;
      background: #faf8f5;
      border: 1px solid #d4cebe;
      border-radius: 6px;
      padding: ${isSinglePage ? '6px 10px' : '8px 12px'};
      font-size: ${isSinglePage ? '9.5px' : '11px'};
    }

    .signature-box.platform {
      border-color: #c5a059;
      background: #faf7ee;
    }

    .sig-title {
      font-weight: 900;
      color: #59662c;
      margin-bottom: 2px;
    }

    .sig-name {
      font-size: ${isSinglePage ? '11px' : '12.5px'};
      font-weight: 900;
      color: #1e251a;
      margin-bottom: 2px;
    }

    .sig-meta {
      font-size: ${isSinglePage ? '8.5px' : '10px'};
      color: #71717a;
    }

    .sig-status {
      color: #15803d;
      font-weight: 800;
      font-size: ${isSinglePage ? '9px' : '10px'};
      margin-bottom: 2px;
    }

    .sig-code {
      font-size: ${isSinglePage ? '8px' : '9.5px'};
      color: #8b6e2f;
      font-family: monospace;
      font-weight: bold;
    }

    .sig-line {
      margin-top: ${isSinglePage ? '4px' : '6px'};
      color: #71717a;
      font-size: ${isSinglePage ? '9px' : '10px'};
    }

    .stamp-emblem-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Prominent Designer & Platform Footer */
    .report-footer {
      text-align: center;
      font-size: ${isSinglePage ? '9px' : '10px'};
      color: #59662c;
      margin-top: ${isSinglePage ? '6px' : '18px'};
      padding-top: ${isSinglePage ? '6px' : '10px'};
      border-top: 1px solid #e2ddd2;
      font-weight: 800;
    }

    .designer-credit {
      font-size: ${isSinglePage ? '10.5px' : '12px'};
      font-weight: 900;
      color: #1e251a;
      margin-bottom: 2px;
    }

    .rights-credit {
      font-size: ${isSinglePage ? '8.5px' : '9.5px'};
      color: #71717a;
    }

    @media print {
      body {
        background: #ffffff;
      }
      .report-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
        ${
          isSinglePage
            ? `
          height: 100vh !important;
          max-height: 280mm !important;
          overflow: hidden !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        `
            : ''
        }
      }
    }
  </style>
</head>
<body class="${isSinglePage ? 'single-page-body' : 'multi-page-body'}">
  <div class="report-wrapper ${isSinglePage ? 'single-page' : ''}">
    <!-- PAGE 1 CONTENT -->
    <header class="report-header">
      <div class="header-top">
        <div class="brand-title">
          <div class="brand-logo" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${activeAppLogo ? `<img src="${getCacheBustedImageUrl(activeAppLogo)}" alt="شعار بروتوكول" style="width: 100%; height: 100%; object-fit: contain;" />` : '🦷'}
          </div>
          <div class="brand-names">
            <h1>بروتوكول • التعليم والتوثيق السريري</h1>
            <p>PROTOCOL CLINICAL ACADEMY • OFFICIAL ANNUAL PORTFOLIO</p>
          </div>
        </div>
        <div class="serial-box">
          <div>الرقم التسلسلي المعتمد:</div>
          <div class="serial-number">${reportSerialId}</div>
          <div style="margin-top: 2px;">تاريخ التصدير: ${reportDateFormatted}</div>
        </div>
      </div>

      <!-- Formal Accreditation Statement (Requirement 2) -->
      <div class="accreditation-banner">
        <div class="accreditation-badge">اعتماد رسمي موثق</div>
        <h2 class="accreditation-text">هذا التقرير السنوي منجز ومصادق رسمياً عبر بروتوكول (PROTOCOL)</h2>
        <p class="accreditation-sub">Official Clinical Portfolio • Accredited Exclusively via PROTOCOL</p>
      </div>

      <!-- Student & University Official Metadata Grid (Requirement 1) -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">👤 اسم الطالب المتدرب:</span>
          <span class="info-value">${activeName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🏛️ الجامعة / الكلية:</span>
          <span class="info-value">${activeUni}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🎓 المرحلة الدراسية:</span>
          <span class="info-value">${activeStage}</span>
        </div>
        <div class="info-item">
          <span class="info-label">📅 العام الدراسي:</span>
          <span class="info-value">${activeYear}</span>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <span class="info-label">🩺 جهة الاعتماد والتوثيق السريري:</span>
          <span class="info-value" style="color: #59662c;">بروتوكول لطب الأسنان السريري (PROTOCOL CLINICAL ACADEMY)</span>
        </div>
      </div>
    </header>

    ${
      customReportNotes
        ? `
      <div style="background: rgba(197,160,89,0.08); border: 1px solid #c5a059; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 10px; color: #1e251a;">
        <strong>📌 إيضاحات سريرية من الطالب:</strong> ${customReportNotes}
      </div>
    `
        : ''
    }

    ${statsHTML}

    <!-- Cases Log -->
    <main class="cases-section">
      <h3 class="section-title">
        <span>📋 سجل الحالات السريرية المعالجة (${filteredCases.length} حالة مسجلة وموثقة)</span>
      </h3>
      ${
        filteredCases.length > 0
          ? page1CasesHTML
          : '<div style="text-align: center; padding: 20px; color: #71717a;">لا توجد حالات سريرية مطابقة للتصنيف المختار.</div>'
      }
    </main>

    ${
      isSinglePage
        ? `
      <!-- Single Page layout: Signatures and Footer fit compactly on Page 1 -->
      ${signaturesHTML}
      <footer class="report-footer">
        <div class="designer-credit">إعداد وتصميم: د. حياة نافع فجر</div>
        <div class="rights-credit">بروتوكول لطب الأسنان السريري • PROTOCOL Clinical Academy • جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
      </footer>
    `
        : `
      <!-- Multi-Page layout: Clean Page Break to Page 2 for Additional Cases, Photos & Signatures -->
      ${
        page2CasesHTML
          ? `
        <div class="page-break"></div>
        <div class="page-continuation-header">
          <span>📋 تابع سجل الحالات السريرية المعالجة والصور المرفقة • بروتوكول</span>
          <span>الطالب: ${activeName} (${activeStage})</span>
        </div>
        <div class="cases-section">
          ${page2CasesHTML}
        </div>
        `
          : ''
      }
      ${signaturesHTML}
      <footer class="report-footer">
        <div class="designer-credit">إعداد وتصميم: د. حياة نافع فجر</div>
        <div class="rights-credit">بروتوكول لطب الأسنان السريري • PROTOCOL Clinical Academy • جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
      </footer>
    `
    }
  </div>
</body>
</html>`;
  };

  // Execute Native Browser Print with active metadata
  const executePrint = (
    activeName = studentName,
    activeUni = university,
    activeStage = academicStage,
    activeYear = academicYear
  ) => {
    setIsPrinting(true);

    try {
      const html = generateFullReportHTML(activeName, activeUni, activeStage, activeYear);
      const printWindow = window.open('', '_blank', 'width=950,height=900');

      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setIsPrinting(false);
        }, 600);
      } else {
        // Fallback using invisible iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setIsPrinting(false);
            setTimeout(() => iframe.remove(), 2000);
          }, 800);
        }
      }
    } catch (err) {
      console.error('Print generation error', err);
      setIsPrinting(false);
      showNotice('تعذر فتح نافذة الطباعة تلقائياً، يمكنك تنزيل ملف التقرير الكامل بصيغة HTML.');
    }
  };

  // Trigger Export Flow: Opens Interactive Student Data Input Modal (Requirement 1)
  const handlePrint = () => {
    handleOpenStudentInputModal();
  };

  // Download complete standalone self-contained HTML report with embedded Base64 photos
  const handleDownloadStandaloneHTML = () => {
    handleSaveProfile();

    try {
      const html = generateFullReportHTML();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PROTOCOL_Clinical_Report_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showNotice('تم تنزيل التقرير السنوي الكامل بنجاح! جاهز للفتح أو الطباعة PDF في أي متصفح 📥');
    } catch {
      showNotice('حدث خطأ أثناء تنزيل التقرير.');
    }
  };

  // Copy structured summary for supervisor on Telegram / WhatsApp
  const handleCopySummaryText = () => {
    const summary = `🦷 *تقرير الإنجاز السريري السنوي المعتمد (بروتوكول)*
━━━━━━━━━━━━━━━━━━━━
👤 *اسم الطالب:* ${studentName}
🏛️ *الكلية والجامعة:* ${university}
🎓 *المرحلة:* ${academicStage} | ${academicYear}
🩺 *المشرف:* ${supervisorName}
━━━━━━━━━━━━━━━━━━━━
📊 *ملخص الإنجاز ونسب النجاح السريري:*
• إجمالي الحالات السريرية: ${statistics.total} حالة
• نسبة النجاح والإنجاز السريري: ${statistics.successRate}%
• إجمالي الصور السريرية الموثقة: ${statistics.totalPhotos} صورة
• الحالات المؤرشفة والمكتملة: ${statistics.archived} حالة

🏷️ *توزيع الحالات حسب التخصص:*
- قلع الأسنان: ${statistics.byCategory.extraction} حالة
- الحشوات والترميم: ${statistics.byCategory.fillings} حالة
- الأطقم والتعويضات: ${statistics.byCategory.dentures} حالة
- تنظيف وتجريف اللثة: ${statistics.byCategory.cleaning} حالة
- علاج الجذور واللب: ${statistics.byCategory.endo} حالة
- استشارات وحالات أخرى: ${statistics.byCategory.other} حالة

🔢 *الرقم التسلسلي المعتمد:* ${reportSerialId}
📅 *تاريخ التصدير:* ${reportDateFormatted}
━━━━━━━━━━━━━━━━━━━━
✅ تم توثيق وتصدير التقرير عبر نظام الأرشفة السريرية لبروتوكول.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        showNotice('تم نسخ ملخص التقرير بنجاح! يمكنك لصقه للمشرف في تليغرام أو واتساب 📋');
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      dir="rtl"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          backgroundColor: '#151b12',
          border: '2px solid #c5a059',
          borderRadius: '16px',
          color: '#fcfbfa',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(197,160,89,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #1e251a, #2a3424, #1e251a)',
            borderBottom: '2px solid #c5a059',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#151b12',
                boxShadow: '0 4px 12px rgba(197,160,89,0.3)',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#fcfbfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>توليد تقرير الإنجاز السريري السنوي</span>
                <span style={{ fontSize: '11px', background: 'rgba(197,160,89,0.2)', color: '#c5a059', padding: '2px 8px', borderRadius: '4px', border: '1px solid #c5a059' }}>
                  PDF Generator
                </span>
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#c5a059' }}>
                تجميع وتصدير كافة الحالات المنجزة، التواريخ، الصور المرفقة، ونسب النجاح المسجلة في جدول العيادات طوال السنة
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Approval Action for Student */}
            {!isAuthorAdmin && approvalRequest?.status !== 'approved' && (
              <button
                type="button"
                onClick={() => {
                  if (approvalRequest?.status === 'pending') {
                    showNotice('⏳ طلبك قيد مراجعة المشرف السريري، سيتاح التصدير فور موافقته.');
                  } else {
                    setShowApprovalRequestModal(true);
                  }
                }}
                style={{
                  background:
                    approvalRequest?.status === 'pending'
                      ? 'rgba(245,158,11,0.2)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                  border:
                    approvalRequest?.status === 'pending'
                      ? '1px solid #f59e0b'
                      : '1px solid #10b981',
                  color: approvalRequest?.status === 'pending' ? '#fbbf24' : '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                }}
              >
                {approvalRequest?.status === 'pending' ? (
                  <>
                    <Clock size={15} />
                    <span>بانتظار موافقة المشرف ⏳</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>طلب موافقة المشرف 📩</span>
                  </>
                )}
              </button>
            )}

            {/* Direct Approval Action for Supervisor */}
            {isAuthorAdmin && (
              <button
                type="button"
                onClick={handleDirectSupervisorApproval}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: '1px solid #10b981',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                }}
                title="مصادقة فورية بصفة المشرفة"
              >
                <CheckCircle2 size={15} />
                <span>مصادقة فورية وتصدير ✅</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              style={{
                background: isExportAllowed
                  ? 'linear-gradient(135deg, #c5a059, #a7833e)'
                  : 'rgba(255,255,255,0.08)',
                color: isExportAllowed ? '#151b12' : '#a0a59a',
                border: isExportAllowed ? 'none' : '1px solid rgba(255,255,255,0.15)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: isExportAllowed ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isExportAllowed ? '0 2px 8px rgba(197,160,89,0.4)' : 'none',
                transition: 'all 0.15s ease',
                opacity: isExportAllowed ? 1 : 0.7,
              }}
              title={
                isExportAllowed
                  ? 'طباعة التقرير أو حفظه كملف PDF رسمي مصدق'
                  : 'مغلق حتى موافقة المشرف السريري'
              }
            >
              {isExportAllowed ? <Printer size={16} /> : <Lock size={15} color="#c5a059" />}
              <span>
                {isPrinting
                  ? 'جاري التجهيز...'
                  : isExportAllowed
                  ? 'طباعة / حفظ كـ PDF'
                  : 'طباعة PDF (يتطلب موافقة 🔒)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadStandaloneHTML}
              style={{
                background: isExportAllowed ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                border: isExportAllowed ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                color: isExportAllowed ? '#38bdf8' : '#71717a',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isExportAllowed ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isExportAllowed ? 1 : 0.6,
              }}
              title={
                isExportAllowed
                  ? 'تنزيل نسخة مستقلة بصيغة HTML يمكن فتحها على أي جهاز'
                  : 'مغلق حتى موافقة المشرف السريري'
              }
            >
              <Download size={14} />
              <span className="hidden sm:inline">تنزيل ملف HTML</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummaryText}
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="نسخ ملخص نصي للإرسال للمشرف"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">نسخ للمشرف</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="إغلاق النافذة"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Notice Toast */}
        {copyToast && (
          <div
            style={{
              background: '#22543d',
              borderBottom: '1px solid #38a169',
              color: '#f0fff4',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Body Container (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Tab Bar: Report Preview vs Recharts Interactive Skills Growth */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#12160f',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid rgba(197,160,89,0.3)',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveReportTab('preview')}
              style={{
                flex: '1 1 200px',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeReportTab === 'preview' ? 'linear-gradient(135deg, #c5a059, #8b6e2f)' : 'transparent',
                color: activeReportTab === 'preview' ? '#151b12' : '#a0a59a',
                border: activeReportTab === 'preview' ? 'none' : '1px solid transparent',
                boxShadow: activeReportTab === 'preview' ? '0 2px 8px rgba(197,160,89,0.3)' : 'none',
              }}
            >
              <FileText size={16} />
              <span>معاينة واعتماد التقرير السريري (PDF Preview)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('charts')}
              style={{
                flex: '1 1 200px',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                background: activeReportTab === 'charts' ? 'linear-gradient(135deg, #59662c, #3b4a2e)' : 'transparent',
                color: activeReportTab === 'charts' ? '#fcfbfa' : '#a0a59a',
                border: activeReportTab === 'charts' ? '1px solid #c5a059' : '1px solid transparent',
                boxShadow: activeReportTab === 'charts' ? '0 2px 8px rgba(89,102,44,0.4)' : 'none',
              }}
            >
              <TrendingUp size={16} color={activeReportTab === 'charts' ? '#c5a059' : '#a0a59a'} />
              <span>رسم بياني تفاعلي لنمو مهارات الطلاب (Recharts)</span>
              <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                Firebase Cloud 🟢
              </span>
            </button>
          </div>

          {activeReportTab === 'charts' ? (
            <StudentSkillsGrowthCharts
              studentName={studentName}
              isAuthorAdmin={isAuthorAdmin}
            />
          ) : (
            <>
              {/* SUPERVISOR APPROVAL & EXPORT STATUS BANNER */}
              <div
            style={{
              borderRadius: '14px',
              padding: '16px',
              border: isExportAllowed
                ? '1.5px solid #10b981'
                : approvalRequest?.status === 'pending'
                ? '1.5px solid #f59e0b'
                : approvalRequest?.status === 'rejected'
                ? '1.5px solid #ef4444'
                : '1.5px solid #c5a059',
              background: isExportAllowed
                ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,78,59,0.25))'
                : approvalRequest?.status === 'pending'
                ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(120,53,15,0.25))'
                : approvalRequest?.status === 'rejected'
                ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(127,29,29,0.25))'
                : 'linear-gradient(135deg, rgba(197,160,89,0.12), rgba(89,102,44,0.25))',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header row with status badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isExportAllowed
                      ? 'rgba(16,185,129,0.2)'
                      : approvalRequest?.status === 'pending'
                      ? 'rgba(245,158,11,0.2)'
                      : approvalRequest?.status === 'rejected'
                      ? 'rgba(239,68,68,0.2)'
                      : 'rgba(197,160,89,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isExportAllowed
                      ? '#10b981'
                      : approvalRequest?.status === 'pending'
                      ? '#f59e0b'
                      : approvalRequest?.status === 'rejected'
                      ? '#ef4444'
                      : '#c5a059',
                    flexShrink: 0,
                  }}
                >
                  {isAuthorAdmin ? (
                    <Award size={22} />
                  ) : isExportAllowed ? (
                    <CheckCircle2 size={22} />
                  ) : approvalRequest?.status === 'pending' ? (
                    <Clock size={22} />
                  ) : approvalRequest?.status === 'rejected' ? (
                    <AlertTriangle size={22} />
                  ) : (
                    <Lock size={22} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#fcfbfa' }}>
                    {isAuthorAdmin
                      ? 'وضع المشرفة السريرية (Supervisory Authority)'
                      : isExportAllowed
                      ? 'تمت المصادقة والاعتماد الرسمي من قِبل المشرف السريري ✅'
                      : approvalRequest?.status === 'pending'
                      ? 'طلب التصدير قيد المراجعة والمصادقة لدى المشرف ⏳'
                      : approvalRequest?.status === 'rejected'
                      ? 'قام المشرف بإرجاع التقرير مع ملاحظات وتعديلات ⚠️'
                      : 'تصدير التقرير السريري مقيد بموافقة المشرف السريري 🔒'}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#d4cebe', marginTop: '2px', lineHeight: '1.5' }}>
                    {isAuthorAdmin
                      ? 'لديكِ الصلاحية الكاملة للاعتماد المباشر وتصدير ملف التقرير السريري في أي وقت.'
                      : isExportAllowed
                      ? `صادق المشرف (${approvalRequest?.reviewedBy || supervisorName}) على التقرير واعتمد التصدير السريري رسمياً.`
                      : approvalRequest?.status === 'pending'
                      ? `تم إرسال الطلب في ${approvalRequest.requestedAt}، سيتم تحديث شاشتك تلقائياً لحظة موافقة المشرف دون الحاجة لتحديث الصفحة.`
                      : approvalRequest?.status === 'rejected'
                      ? `ملاحظات المشرف: ${approvalRequest.rejectionReason}`
                      : 'وفقاً لتعليمات العيادات التعليمية، يجب إرسال إشعار للمشرف لمراجعة الحالات واعتماد التصدير قبل استخراج التقرير الرسمي.'}
                  </div>
                </div>
              </div>

              {/* Action buttons on the banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {isAuthorAdmin ? (
                  <button
                    type="button"
                    onClick={handleDirectSupervisorApproval}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>مصادقة مباشرة وتصدير ✅</span>
                  </button>
                ) : isExportAllowed ? (
                  <span
                    style={{
                      background: 'rgba(16,185,129,0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Check size={14} />
                    <span>معتمد ومتاح للتصدير الآن</span>
                  </span>
                ) : approvalRequest?.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => showNotice('جاري المزامنة اللحظية... طلبك قيد مراجعة المشرف.')}
                      style={{
                        background: 'rgba(245,158,11,0.2)',
                        border: '1px solid #f59e0b',
                        color: '#fbbf24',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>فحص الحالة</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelApprovalRequest}
                      style={{
                        background: 'rgba(239,68,68,0.2)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      إلغاء الطلب
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApprovalRequestModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                      border: 'none',
                      color: '#151b12',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(197,160,89,0.3)',
                    }}
                  >
                    <Send size={14} />
                    <span>إرسال طلب موافقة للمشرف لتصدير التقرير 📩</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top Options & Filters Strip */}
          <div
            style={{
              background: '#1e251a',
              border: '1px solid rgba(197,160,89,0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} color="#c5a059" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#c5a059' }}>
                  تصفية أقسام التقرير:
                </span>
              </div>

              {/* Student Metadata Accordion Trigger */}
              <button
                type="button"
                onClick={() => setShowMetadataEditor(!showMetadataEditor)}
                style={{
                  background: 'rgba(197,160,89,0.15)',
                  border: '1px solid #c5a059',
                  color: '#c5a059',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={13} />
                <span>بيانات الطالب والجامعة ({studentName})</span>
                {showMetadataEditor ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Collapsible Student Info Editor */}
            {showMetadataEditor && (
              <div
                style={{
                  background: '#12160f',
                  border: '1px solid #3b4a2e',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                    👤 اسم الطالب الكامل:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      padding: '7px 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                    🏛️ الجامعة / الكلية:
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      padding: '7px 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                    🎓 المرحلة الأكاديمية:
                  </label>
                  <input
                    type="text"
                    value={academicStage}
                    onChange={(e) => setAcademicStage(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      padding: '7px 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                    📅 العام الأكاديمي:
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      padding: '7px 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '4px' }}>
                    🩺 المشرف السريري المعتمد:
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      padding: '7px 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                style={{
                  background: selectedCategoryFilter === 'all' ? '#c5a059' : '#12160f',
                  color: selectedCategoryFilter === 'all' ? '#151b12' : '#fcfbfa',
                  border: '1px solid #c5a059',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                جميع الحالات ({cases.length})
              </button>

              {CLINICAL_CATEGORIES.map((cat, catIdx) => {
                const count = cases.filter((c) => c.category === cat.id).length;
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={`${cat.id}_${catIdx}`}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    style={{
                      background: isSelected ? cat.color : '#12160f',
                      color: isSelected ? '#151b12' : '#fcfbfa',
                      border: `1px solid ${cat.color}`,
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.nameAr}</span>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Checkbox Switches for Inclusions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', paddingTop: '8px', borderTop: '1px solid #3b4a2e' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2ddd2', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                />
                <span>تضمين الصور السريرية المرفقة عالية الدقة 📸</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2ddd2', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                />
                <span>تضمين مؤشرات الإنجاز ونسب النجاح 📊</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2ddd2', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                />
                <span>تضمين ختم وتوقيع المشرف السريري ✍️</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#e2ddd2', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePatientNames}
                  onChange={(e) => setIncludePatientNames(e.target.checked)}
                />
                <span>إظهار أسماء المراجعين (إلغاء التحديد للترميز السري) 🔒</span>
              </label>
            </div>
          </div>

          {/* Executive Analytics Dashboard Preview */}
          <div
            style={{
              background: '#1a2016',
              border: '1px solid rgba(197,160,89,0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#c5a059" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#c5a059' }}>
                  ملخص الإنجاز السريري السنوي المعتمد:
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReportTab('charts')}
                style={{
                  background: 'rgba(197,160,89,0.18)',
                  border: '1px solid #c5a059',
                  color: '#c5a059',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <TrendingUp size={13} />
                <span>الرسوم البيانية لنمو المهارات (Recharts) 📈</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#12160f', border: '1px solid #3b4a2e', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fcfbfa' }}>{statistics.total}</div>
                <div style={{ fontSize: '11px', color: '#a0a59a' }}>إجمالي الحالات المعالجة</div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(197,160,89,0.2), #1e251a)', border: '1.5px solid #c5a059', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#c5a059' }}>{statistics.successRate}%</div>
                <div style={{ fontSize: '11px', color: '#fcfbfa', fontWeight: 'bold' }}>نسبة النجاح والإنجاز السريري ⭐</div>
              </div>

              <div style={{ background: '#12160f', border: '1px solid #3b4a2e', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>{statistics.totalPhotos}</div>
                <div style={{ fontSize: '11px', color: '#a0a59a' }}>الصور السريرية المؤرشفة 📸</div>
              </div>

              <div style={{ background: '#12160f', border: '1px solid #3b4a2e', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>{statistics.archived}</div>
                <div style={{ fontSize: '11px', color: '#a0a59a' }}>الحالات المكتملة بالأرشيف ✅</div>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Component Embedded in Clinical Reports View */}
          <div style={{ marginTop: '2px', marginBottom: '2px' }}>
            <StudentSkillsGrowthCharts
              studentName={studentName}
              isAuthorAdmin={isAuthorAdmin}
            />
          </div>

          {/* Live Document Preview Container (Paper Styled) */}
          <div
            style={{
              background: '#fbfaf7',
              color: '#1a2016',
              borderRadius: '12px',
              padding: '24px',
              border: '2px solid #c5a059',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Document Header in Preview */}
            <div style={{ borderBottom: '2px solid #59662c', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      background: 'linear-gradient(135deg, #1e251a, #59662c)',
                      color: '#c5a059',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      overflow: 'hidden',
                      padding: '2px',
                    }}
                  >
                    {(localStorage.getItem('protocol_header_logo') || localStorage.getItem('protocol_app_logo')) ? (
                      <img
                        src={getCacheBustedImageUrl(localStorage.getItem('protocol_header_logo') || localStorage.getItem('protocol_app_logo') || '')}
                        alt="شعار بروتوكول"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      '🦷'
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1e251a' }}>
                      بروتوكول • الأكاديمية السريرية لطب الأسنان
                    </h3>
                    <span style={{ fontSize: '11px', color: '#59662c', fontWeight: 'bold' }}>
                      PROTOCOL CLINICAL PORTFOLIO & AUDIT SYSTEM
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'left', fontSize: '10px', color: '#71717a' }}>
                  <div>الرقم التسلسلي:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#c5a059', background: '#1e251a', padding: '2px 6px', borderRadius: '4px' }}>
                    {reportSerialId}
                  </div>
                </div>
              </div>

              {/* Official Accreditation Banner (Requirement 2) */}
              <div
                style={{
                  textAlign: 'center',
                  background: 'linear-gradient(90deg, rgba(89,102,44,0.12), rgba(197,160,89,0.22), rgba(89,102,44,0.12))',
                  border: '1.5px solid #c5a059',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginTop: '12px',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e251a', color: '#c5a059', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, marginBottom: '4px' }}>
                  <ShieldCheck size={12} />
                  <span>اعتماد بروتوكول الرسمي (PROTOCOL)</span>
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e251a', fontWeight: 900 }}>
                  هذا التقرير السنوي منجز ومصادق رسمياً عبر بروتوكول (PROTOCOL)
                </h4>
                <div style={{ fontSize: '11px', color: '#59662c', marginTop: '2px', fontWeight: 600 }}>
                  سجل تفصيلي موثق بكافة الحالات السريرية المعالجة والصور المرفقة ونسب النجاح المسجلة
                </div>
              </div>

              {/* Student Academic Info Grid with Interactive Edit Button (Requirement 1) */}
              <div
                style={{
                  background: '#f7f5f0',
                  border: '1px solid #e2ddd2',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginTop: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed #dcd7c9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#59662c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <GraduationCap size={14} />
                    <span>البيانات الأكاديمية المعتمدة للطالب:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenStudentInputModal}
                    style={{
                      background: 'rgba(197,160,89,0.2)',
                      border: '1px solid #c5a059',
                      color: '#8b6e2f',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="فتح نافذة إدخال وتعديل بيانات الطالب لتثبيتها في الترويسة"
                  >
                    <span>تعديل بيانات الطالب بالترويسة ✏️</span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: '#71717a' }}>👤 اسم الطالب الكامل: </span>
                    <strong style={{ color: '#1e251a' }}>{studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a' }}>🏛️ الجامعة / الكلية: </span>
                    <strong style={{ color: '#1e251a' }}>{university}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a' }}>🎓 المرحلة الدراسية: </span>
                    <strong style={{ color: '#1e251a' }}>{academicStage} ({academicYear})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#71717a' }}>🩺 جهة الاعتماد السريري: </span>
                    <strong style={{ color: '#59662c' }}>بروتوكول (PROTOCOL)</strong>
                  </div>
                </div>
              </div>

              {/* Dynamic Layout Indicator & Switcher Strip (Requirement 3) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(89,102,44,0.08)',
                  border: '1px solid rgba(197,160,89,0.3)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  marginTop: '10px',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#59662c', fontWeight: 800 }}>
                  <Sparkles size={13} className="text-[#c5a059]" />
                  <span>
                    {filteredCases.length <= 4 && (!includePhotos || statistics.totalPhotos <= 2)
                      ? '📄 نظام الصفحات الذكي: مؤهل تلقائياً للعرض بصفحة واحدة (A4 Single Page) نظيفة'
                      : '📑 نظام الصفحات الذكي: مؤهل للعرض الموزع متعدد الصفحات (Multi-page) مع ملحق الصور'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('auto')}
                    style={{
                      background: layoutMode === 'auto' ? '#59662c' : '#ffffff',
                      color: layoutMode === 'auto' ? '#ffffff' : '#59662c',
                      border: '1px solid #59662c',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    تلقائي ذكي ⚡
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('single')}
                    style={{
                      background: layoutMode === 'single' ? '#59662c' : '#ffffff',
                      color: layoutMode === 'single' ? '#ffffff' : '#59662c',
                      border: '1px solid #59662c',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    صفحة واحدة 📄
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('multi')}
                    style={{
                      background: layoutMode === 'multi' ? '#59662c' : '#ffffff',
                      color: layoutMode === 'multi' ? '#ffffff' : '#59662c',
                      border: '1px solid #59662c',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    صفحات متعددة 📑
                  </button>
                </div>
              </div>
            </div>

            {/* Cases List in Paper Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #c5a059', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#59662c' }}>
                  📋 الحالات السريرية المتضمنة في التقرير ({filteredCases.length}):
                </span>
                <span style={{ fontSize: '11px', color: '#71717a' }}>
                  تاريخ التصدير: {reportDateFormatted}
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#71717a' }}>جاري تحميل الحالات...</div>
              ) : filteredCases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#71717a' }}>
                  لا توجد حالات مسجلة حالياً. قم بإضافة حالاتك في قسم مواعيدي لتوليد التقرير.
                </div>
              ) : (
                filteredCases.map((item, idx) => {
                  const cat = CLINICAL_CATEGORIES.find((c) => c.id === item.category) || CLINICAL_CATEGORIES[5];
                  return (
                    <div
                      key={`${item.id}_${idx}`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dcd7c9',
                        borderRight: '4px solid #59662c',
                        borderRadius: '6px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#59662c', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                            #{idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e251a' }}>
                            {includePatientNames ? item.name : `مراجع #${idx + 1}`}
                          </span>
                          {item.toothNumber && (
                            <span style={{ background: 'rgba(197,160,89,0.15)', color: '#8b6e2f', border: '1px solid #c5a059', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              🦷 {item.toothNumber}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: cat.bgColor,
                              color: cat.color,
                              border: `1px solid ${cat.borderColor}`,
                              fontWeight: 'bold',
                            }}
                          >
                            {cat.icon} {cat.nameAr}
                          </span>
                          <span style={{ fontSize: '10px', color: '#71717a' }}>
                            📅 {item.date}
                          </span>
                          <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                            ✅ موثقة
                          </span>
                        </div>
                      </div>

                      {item.procedure && (
                        <div style={{ fontSize: '11px', color: '#27272a', marginTop: '4px' }}>
                          <strong>الإجراء:</strong> {item.procedure}
                        </div>
                      )}

                      {item.notes && (
                        <div style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
                          <strong>ملاحظات:</strong> {item.notes}
                        </div>
                      )}

                      {/* Photo Thumbnails in Preview with Capture Date */}
                      {includePhotos && item.photos && item.photos.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #e2ddd2' }}>
                          {item.photos.map((p, pIdx) => (
                            <div
                              key={`${p.id || 'photo'}_${pIdx}`}
                              style={{
                                width: '75px',
                                border: '1px solid #c5a059',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                background: '#1e251a',
                                textAlign: 'center',
                              }}
                            >
                              <img
                                src={p.url}
                                alt={p.caption || 'صورة سريرية'}
                                style={{ width: '100%', height: '52px', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{ background: '#12160f', padding: '1px 3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5px' }}>
                                <span style={{ color: '#c5a059', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '42px' }}>
                                  {p.caption || `#${pIdx + 1}`}
                                </span>
                                {item.date && (
                                  <span style={{ color: '#888' }}>{item.date.slice(5)}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Signatures in Paper Preview with Protocol Official Circular Stamp in Center (Requirement 2) */}
            {includeSignatures && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '2px solid #59662c',
                  fontSize: '11px',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, background: '#faf8f5', border: '1px solid #d4cebe', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#59662c' }}>إقرار وتوقيع الطالب المتدرب:</div>
                  <div style={{ fontWeight: 'bold', color: '#1e251a', marginTop: '2px' }}>{studentName}</div>
                  <div style={{ color: '#71717a', fontSize: '10px', marginTop: '2px' }}>{academicStage} • {university}</div>
                  <div style={{ color: '#71717a', fontSize: '10px', marginTop: '4px' }}>التاريخ: {reportDateFormatted}</div>
                  <div style={{ color: '#15803d', fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>التوقيع: [تم الإقرار والاعتماد السريري ✓]</div>
                </div>

                {/* Protocol Official Circular Stamp in Center */}
                <ProtocolOfficialStamp size={125} />

                <div style={{ flex: 1, background: '#faf7ee', border: '1px solid #c5a059', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#59662c' }}>جهة الاعتماد والمصادقة الرسمية:</div>
                  <div style={{ fontWeight: 'bold', color: '#1e251a', marginTop: '2px' }}>بروتوكول (PROTOCOL)</div>
                  <div style={{ color: '#15803d', fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>
                    الحالة: منجز ومصادق سريرياً عبر بروتوكول ✅
                  </div>
                  <div style={{ color: '#71717a', fontSize: '10px', marginTop: '4px' }}>الختم: [معتمد وموثق رقمياً بالنظام ✓]</div>
                </div>
              </div>
            )}

            {/* Clear Designer & Platform Footer (Requirement 2) */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#59662c',
                marginTop: '18px',
                paddingTop: '10px',
                borderTop: '1px solid #e2ddd2',
                fontWeight: 800,
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#1e251a', marginBottom: '2px' }}>
                إعداد وتصميم: د. حياة نافع فجر
              </div>
              <div style={{ fontSize: '10px', color: '#71717a' }}>
                بروتوكول لطب الأسنان السريري • PROTOCOL Dental Academy • جميع الحقوق محفوظة © {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            background: '#12160f',
            borderTop: '1px solid #3b4a2e',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#c5a059', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>
              جاهز للطباعة المباشرة على ورق A4 أو الحفظ كملف PDF رسمي مصدق بضغطة زر.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Primary Action: Export Report via Interactive Modal (Requirement 1) */}
            <button
              type="button"
              onClick={handleOpenStudentInputModal}
              disabled={isPrinting}
              style={{
                background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                color: '#151b12',
                border: 'none',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 3px 12px rgba(197,160,89,0.4)',
                transition: 'all 0.15s ease',
              }}
              title="استكمال بيانات الطالب وتصدير التقرير السنوي المعتمد كـ PDF"
            >
              <FileText size={17} />
              <span>{isPrinting ? 'جاري تجهيز PDF...' : 'تصدير التقرير (PDF) 📄'}</span>
            </button>

            {/* Supervisor Approval Request Button */}
            {!isAuthorAdmin && approvalRequest?.status !== 'approved' && (
              <button
                type="button"
                onClick={() => {
                  if (approvalRequest?.status === 'pending') {
                    showNotice('⏳ التقرير قيد مراجعة المشرف، سيتاح التصدير فور اعتماده.');
                  } else {
                    setShowApprovalRequestModal(true);
                  }
                }}
                style={{
                  background:
                    approvalRequest?.status === 'pending'
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(16,185,129,0.15)',
                  border:
                    approvalRequest?.status === 'pending'
                      ? '1px solid #f59e0b'
                      : '1px solid #10b981',
                  color: approvalRequest?.status === 'pending' ? '#fbbf24' : '#10b981',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {approvalRequest?.status === 'pending' ? (
                  <>
                    <Clock size={15} />
                    <span>طلب قيد المراجعة ⏳</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>طلب مصادقة المشرف 📩</span>
                  </>
                )}
              </button>
            )}

            {/* Direct Admin Supervisor Approval Button */}
            {isAuthorAdmin && (
              <button
                type="button"
                onClick={handleDirectSupervisorApproval}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                }}
              >
                <CheckCircle2 size={15} />
                <span>مصادقة مباشرة ✅</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1e251a',
                color: '#fcfbfa',
                border: '1px solid #3b4a2e',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* APPROVAL REQUEST CONFIRMATION MODAL */}
      {showApprovalRequestModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1a2016',
              border: '2px solid #c5a059',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              color: '#fcfbfa',
              direction: 'rtl',
              textAlign: 'right',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(197,160,89,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c5a059',
                  }}
                >
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fcfbfa' }}>
                    إرسال طلب موافقة للمشرف على تصدير التقرير
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#c5a059' }}>
                    المشرف المعتمد: {supervisorName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalRequestModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0a59a',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: '#12160f',
                border: '1px solid #3b4a2e',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12px',
                lineHeight: '1.6',
              }}
            >
              <div style={{ fontWeight: 800, color: '#c5a059', marginBottom: '8px' }}>
                📋 ملخص البيانات المرفوعة للمشرف للمصادقة:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', color: '#d4cebe' }}>
                <div>• اسم الطالب: <strong style={{ color: '#fff' }}>{studentName}</strong></div>
                <div>• الجامعة: <strong style={{ color: '#fff' }}>{university}</strong></div>
                <div>• المرحلة: <strong style={{ color: '#fff' }}>{academicStage}</strong></div>
                <div>• العام الدراسي: <strong style={{ color: '#fff' }}>{academicYear}</strong></div>
                <div>• عدد الحالات: <strong style={{ color: '#10b981' }}>{statistics.total} حالة</strong></div>
                <div>• نسبة النجاح: <strong style={{ color: '#c5a059' }}>{statistics.successRate}%</strong></div>
                <div>• الصور السريرية: <strong style={{ color: '#38bdf8' }}>{statistics.totalPhotos} صورة</strong></div>
                <div>• الحالات المؤرشفة: <strong style={{ color: '#a855f7' }}>{statistics.archived} حالة</strong></div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#c5a059', marginBottom: '6px' }}>
                رسالة أو ملاحظة إضافية للمشرف (اختياري):
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="مثال: دكتورة حياة، يرجى مصادقة التقرير السريري لمادة التدريب الصيفي / طب الأسنان الترميمي..."
                rows={3}
                style={{
                  width: '100%',
                  background: '#12160f',
                  border: '1px solid #3b4a2e',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fcfbfa',
                  fontSize: '12px',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={16} className="shrink-0" />
              <span>
                سيصل إشعار لحظي للمشرف مع تنبيه صوتي فوري. بمجرد موافقته، سيتاح لك تصدير وطباعة التقرير فوراً بدون الحاجة لتحديث الصفحة.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowApprovalRequestModal(false)}
                style={{
                  background: '#2a3324',
                  border: '1px solid #3b4a2e',
                  color: '#d4cebe',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleRequestApproval}
                disabled={isSubmittingApproval}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                }}
              >
                <Send size={15} />
                <span>{isSubmittingApproval ? 'جاري الإرسال للمشرف...' : 'إرسال الطلب للمشرف الآن 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE STUDENT DATA INPUT MODAL (نافذة الإدخال التفاعلية لبيانات الطالب - Requirement 1) */}
      {showStudentInputModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              background: '#1a2016',
              border: '2px solid #c5a059',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '22px',
              color: '#fcfbfa',
              textAlign: 'right',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(197,160,89,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #3b4a2e', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#151b12',
                    boxShadow: '0 4px 10px rgba(197,160,89,0.3)',
                  }}
                >
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fcfbfa' }}>
                    استكمال بيانات الطالب لاعتماد التقرير الرسمي (PDF)
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#c5a059' }}>
                    يتم سحب هذه البيانات تلقائياً وتثبيتها بدقة في ترويسة التقرير السنوي المعتمد
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentInputModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#a0a59a',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Field 1: Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#c5a059', marginBottom: '5px' }}>
                  👤 اسم الطالب الكامل (الرباعي أو الرسمي):
                </label>
                <input
                  type="text"
                  value={tempStudentName}
                  onChange={(e) => setTempStudentName(e.target.value)}
                  placeholder="مثال: د. أحمد محمد علي الكرخي"
                  style={{
                    width: '100%',
                    background: '#12160f',
                    border: '1.5px solid #3b4a2e',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fcfbfa',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Field 2: Academic Stage */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#c5a059', marginBottom: '5px' }}>
                  🎓 المرحلة الدراسية:
                </label>
                {/* Quick Stage Selection Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                  {[
                    'المرحلة الخامسة (سنة التخرج)',
                    'المرحلة الرابعة',
                    'المرحلة الثالثة',
                    'طبيب مقيم متدرب / امتياز',
                  ].map((stageOpt, sIdx) => (
                    <button
                      key={`${stageOpt}_${sIdx}`}
                      type="button"
                      onClick={() => setTempAcademicStage(stageOpt)}
                      style={{
                        background: tempAcademicStage === stageOpt ? '#c5a059' : '#12160f',
                        color: tempAcademicStage === stageOpt ? '#151b12' : '#d4cebe',
                        border: tempAcademicStage === stageOpt ? '1px solid #c5a059' : '1px solid #3b4a2e',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      {stageOpt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tempAcademicStage}
                  onChange={(e) => setTempAcademicStage(e.target.value)}
                  placeholder="أو اكتب مرحلتك المخصصة هنا..."
                  style={{
                    width: '100%',
                    background: '#12160f',
                    border: '1.5px solid #3b4a2e',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fcfbfa',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Field 3: University / College */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#c5a059', marginBottom: '5px' }}>
                  🏛️ الجامعة / الكلية (العيادات التعليمية):
                </label>
                <input
                  type="text"
                  value={tempUniversity}
                  onChange={(e) => setTempUniversity(e.target.value)}
                  placeholder="مثال: كلية طب الأسنان - جامعة المعارف / جامعة بغداد"
                  style={{
                    width: '100%',
                    background: '#12160f',
                    border: '1.5px solid #3b4a2e',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fcfbfa',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Field 4 & Layout Option Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#c5a059', marginBottom: '4px' }}>
                    📅 العام الأكاديمي:
                  </label>
                  <input
                    type="text"
                    value={tempAcademicYear}
                    onChange={(e) => setTempAcademicYear(e.target.value)}
                    placeholder="2025 - 2026"
                    style={{
                      width: '100%',
                      background: '#12160f',
                      border: '1.5px solid #3b4a2e',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#c5a059', marginBottom: '4px' }}>
                    📑 نظام الصفحات (Dynamic Layout):
                  </label>
                  <select
                    value={layoutMode}
                    onChange={(e) => setLayoutMode(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: '#12160f',
                      border: '1.5px solid #3b4a2e',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#c5a059',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="auto">⚡ تلقائي ذكي (A4 Dynamic)</option>
                    <option value="single">📄 صفحة واحدة A4 (Single Page)</option>
                    <option value="multi">📑 متعدد الصفحات (Multi-page)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informational Guidance Box */}
            <div
              style={{
                background: 'rgba(89,102,44,0.15)',
                border: '1px solid rgba(197,160,89,0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#e2ddd2',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} className="shrink-0 text-[#c5a059]" />
              <span>
                هذا التقرير السنوي منجز ومصادق رسمياً عبر بروتوكول (PROTOCOL)، مع الختم الرسمي الدائري وإشراف وتصميم د. حياة نافع فجر.
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowStudentInputModal(false)}
                style={{
                  background: '#2a3324',
                  border: '1px solid #3b4a2e',
                  color: '#d4cebe',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => handleApplyStudentData(false)}
                style={{
                  background: 'rgba(197,160,89,0.15)',
                  border: '1px solid #c5a059',
                  color: '#c5a059',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="تحديث البيانات في الترويسة ومعاينتها دون فتح نافذة الطباعة"
              >
                <Eye size={15} />
                <span>حفظ وتحديث الترويسة والمعاينة 👁️</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyStudentData(true)}
                style={{
                  background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                  border: 'none',
                  color: '#151b12',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(197,160,89,0.4)',
                }}
              >
                <Printer size={16} />
                <span>تأكيد واستخراج التقرير الرسمي (PDF) 🖨️</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClinicalReportGeneratorModal: React.FC<ClinicalReportGeneratorModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <ClinicalReportGeneratorModalContent {...props} />;
};

