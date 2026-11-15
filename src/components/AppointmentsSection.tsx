import React, { useState, useEffect, useMemo } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Bell,
  Clock,
  Sparkles,
  Camera,
  Plus,
  X,
  Download,
  Search,
  FileText,
  Printer,
  GraduationCap,
  Building,
  Check,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Edit2,
  Edit3,
  Save,
  RefreshCw,
  Share2,
  Cloud,
  Star,
  ClipboardList,
} from 'lucide-react';
import { ClinicalReportGeneratorModal } from './ClinicalReportGeneratorModal';
import { ShareAppModal } from './ShareAppModal';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getCollegeClinicSchedule,
  saveCollegeClinicSchedule,
  addClinicScheduleSlot,
  updateClinicScheduleSlot,
  deleteClinicScheduleSlot,
  subscribeToCollegeClinicScheduleCloud,
  forceSyncCollegeClinicScheduleFromCloud,
  resetCollegeClinicScheduleToDefaultCloud,
  assignPatientToClinicSlot,
  clearPatientFromClinicSlot,
  ClinicScheduleSlot,
  CLINIC_SCHEDULE_EVENT,
  DAYS_OF_WEEK,
  DENTAL_DEPARTMENTS,
  DEFAULT_SCHEDULE_SLOTS,
} from '../data/collegeClinicScheduleManager';
import {
  runSmartAppointmentAlertScan,
  sendInstantLiveLockScreenTest,
  detectWeeklyEmptySlots,
  runWeeklyEmptySlotsAlertScan,
  sendInstantWeeklyEmptySlotTest,
} from '../services/smartAppointmentAlertService';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../services/pushNotificationManager';
import {
  getCompanionPermissions,
  saveCompanionPermissions,
  updateCompanionCardPermission,
  CompanionPermissionsMap,
  DEFAULT_COMPANION_PERMISSIONS,
  PROTOCOL_CARD_PERMISSIONS_EVENT,
} from '../data/companionPermissionsManager';
import {
  getClinicalCases,
  addOrUpdateClinicalCase,
  deleteClinicalCase,
  compressClinicalImage,
  exportClinicalCasesBackup,
  subscribeToClinicalCasesCloud,
  forceSyncClinicalCasesFromCloud,
  CLINICAL_CATEGORIES,
  ClinicalCategory,
  CasePhoto,
  TrueCaseItem,
  CLINICAL_CASES_EVENT,
  normalizePatientName,
  isReturningPatient,
  getPatientProfilesMap,
  PatientProfileSummary,
} from '../utils/clinicalCasesStorage';
import { PatientCaseTimelineModal } from './PatientCaseTimelineModal';
import { ClinicalCaseLoggerForm } from './ClinicalCaseLoggerForm';
import { FeaturedPatientsHub } from './FeaturedPatientsHub';

interface Appointment {
  id: string;
  name: string;
  date: string;
  isArchived: boolean;
  category?: ClinicalCategory;
  photos?: CasePhoto[];
  procedure?: string;
  toothNumber?: string;
}

interface AppointmentsSectionProps {
  isAuthorAdmin: boolean;
  className?: string;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  isAuthorAdmin,
  className = '',
}) => {
  const { language, t, isRTL } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newName, setNewName] = useState(() => {
    return (
      localStorage.getItem('proto_draft_name') ||
      localStorage.getItem('protocol_patient_name') ||
      localStorage.getItem('proto_name') ||
      ''
    );
  });
  const [newDate, setNewDate] = useState(() => {
    return (
      localStorage.getItem('proto_draft_date') ||
      localStorage.getItem('protocol_patient_date') ||
      localStorage.getItem('proto_date') ||
      ''
    );
  });
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [alertText, setAlertText] = useState('⏳ جاري فحص جدول العيادات...');
  const [alertColor, setAlertColor] = useState('#c5a059');

  // Categorized Clinical Cases & Photo Archive State
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory>('fillings');
  const [caseProcedure, setCaseProcedure] = useState('');
  const [caseToothNumber, setCaseToothNumber] = useState('');
  const [newCasePhotos, setNewCasePhotos] = useState<CasePhoto[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<'all' | ClinicalCategory>('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<{
    url: string;
    caption?: string;
    patientName?: string;
    caseDate?: string;
    categoryName?: string;
  } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('متصل بالسحابة');
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Sub-tabs: Appointments | Clinical Case Logger | Featured Patients Hub | College Schedule
  const [activeSubTab, setActiveSubTab] = useState<
    'appointments' | 'case_logger' | 'featured_patients' | 'college_schedule'
  >('appointments');

  // Loaded Clinical Cases for timeline & profiling
  const [clinicalCases, setClinicalCases] = useState<TrueCaseItem[]>([]);
  const [timelinePatientName, setTimelinePatientName] = useState<string | null>(null);
  const [loggerPreFill, setLoggerPreFill] = useState<{
    patientName?: string;
    date?: string;
    toothNumber?: string;
    procedure?: string;
    category?: ClinicalCategory;
    slotId?: string;
    appointmentId?: string;
  } | null>(null);

  const [scheduleSlots, setScheduleSlots] = useState<ClinicScheduleSlot[]>(() => getCollegeClinicSchedule());
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState<'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Sunday');
  const [newSlotDept, setNewSlotDept] = useState('مداواة وترميم الأسنان (Operative)');
  const [newSlotRoom, setNewSlotRoom] = useState('');
  const [newSlotChair, setNewSlotChair] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('08:30');
  const [newSlotEnd, setNewSlotEnd] = useState('12:30');
  const [newSlotSupervisor, setNewSlotSupervisor] = useState('د. حياة نافع');
  const [newSlotRequirement, setNewSlotRequirement] = useState('');
  const [newSlotNotes, setNewSlotNotes] = useState('');

  // Lock-Screen Notifications State & Permission
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(() => getNotificationPermission());
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Active Appointment In-Place Editing State
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [editApptName, setEditApptName] = useState('');
  const [editApptDate, setEditApptDate] = useState('');
  const [editApptTooth, setEditApptTooth] = useState('');
  const [editApptProcedure, setEditApptProcedure] = useState('');
  const [editApptCategory, setEditApptCategory] = useState<ClinicalCategory>('fillings');

  // College Clinic Schedule Slot In-Place Editing State
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSlotDay, setEditSlotDay] = useState<'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Sunday');
  const [editSlotDept, setEditSlotDept] = useState('مداواة وترميم الأسنان (Operative)');
  const [editSlotRoom, setEditSlotRoom] = useState('');
  const [editSlotChair, setEditSlotChair] = useState('');
  const [editSlotStart, setEditSlotStart] = useState('08:30');
  const [editSlotEnd, setEditSlotEnd] = useState('12:30');
  const [editSlotSupervisor, setEditSlotSupervisor] = useState('د. حياة نافع');
  const [editSlotRequirement, setEditSlotRequirement] = useState('');
  const [editSlotNotes, setEditSlotNotes] = useState('');

  // Manual Patient Assignment on Clinic Slot (Strictly manual by student - never auto-filled)
  const [patientEditingSlotId, setPatientEditingSlotId] = useState<string | null>(null);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientProcedure, setManualPatientProcedure] = useState('');
  const [manualPatientContact, setManualPatientContact] = useState('');
  const [isTestingEmptySlotAlert, setIsTestingEmptySlotAlert] = useState(false);

  // Companion Permissions & Visibility State (Supervisor control)
  const [companionPermissions, setCompanionPermissions] = useState<CompanionPermissionsMap>(() =>
    getCompanionPermissions()
  );

  // Detect empty slots in the weekly college clinic schedule
  const emptyWeeklySlots = useMemo(() => {
    return detectWeeklyEmptySlots(
      scheduleSlots,
      appointments.map((a) => ({
        id: a.id,
        patientName: a.name,
        dateStr: a.date,
        procedure: a.procedure,
      }))
    );
  }, [scheduleSlots, appointments]);

  // Automatic empty slots detection and local notification dispatch
  useEffect(() => {
    const runScan = async () => {
      try {
        const candidates = appointments.map((a) => ({
          id: a.id,
          patientName: a.name,
          dateStr: a.date,
          procedure: a.procedure,
        }));
        await runWeeklyEmptySlotsAlertScan(scheduleSlots, candidates);
      } catch {}
    };
    runScan();
  }, [scheduleSlots, appointments]);

  // Handle external navigation event to schedule tab
  useEffect(() => {
    const handleOpenScheduleTab = () => {
      setActiveSubTab('college_schedule');
    };
    window.addEventListener('app-open-appointments-schedule', handleOpenScheduleTab);
    return () => {
      window.removeEventListener('app-open-appointments-schedule', handleOpenScheduleTab);
    };
  }, []);

  useEffect(() => {
    const handlePermUpdate = () => {
      setCompanionPermissions(getCompanionPermissions());
    };
    const handleSchedUpdate = () => {
      setScheduleSlots(getCollegeClinicSchedule());
    };
    window.addEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
    window.addEventListener(CLINIC_SCHEDULE_EVENT, handleSchedUpdate);
    window.addEventListener('storage', handlePermUpdate);
    return () => {
      window.removeEventListener(PROTOCOL_CARD_PERMISSIONS_EVENT, handlePermUpdate);
      window.removeEventListener(CLINIC_SCHEDULE_EVENT, handleSchedUpdate);
      window.removeEventListener('storage', handlePermUpdate);
    };
  }, []);

  // Update notification permission state on mount
  useEffect(() => {
    setNotificationPerm(getNotificationPermission());
  }, []);

  // Sync with IndexedDB clinical cases archive & Cloud Firestore
  useEffect(() => {
    getClinicalCases().then((loaded) => {
      if (loaded) {
        setClinicalCases(loaded);
      }
      if (loaded && loaded.length > 0) {
        setAppointments((prev) => {
          const merged = [...prev];
          loaded.forEach((item) => {
            const idx = merged.findIndex((a) => a.id === item.id.toString());
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                category: item.category || merged[idx].category,
                photos: item.photos && item.photos.length > 0 ? item.photos : merged[idx].photos,
                procedure: item.procedure || merged[idx].procedure,
                toothNumber: item.toothNumber || merged[idx].toothNumber,
              };
            } else {
              merged.push({
                id: item.id.toString(),
                name: item.name,
                date: item.date,
                isArchived: item.isArchived ?? true,
                category: item.category,
                photos: item.photos,
                procedure: item.procedure,
                toothNumber: item.toothNumber,
              });
            }
          });
          return merged;
        });
      }
    });

    const handleCasesSync = () => {
      getClinicalCases().then((loaded) => {
        if (loaded) {
          setClinicalCases(loaded);
        }
        if (loaded && loaded.length > 0) {
          setAppointments((prev) => {
            const merged = [...prev];
            loaded.forEach((item) => {
              const idx = merged.findIndex((a) => a.id === item.id.toString());
              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  category: item.category || merged[idx].category,
                  photos: item.photos && item.photos.length > 0 ? item.photos : merged[idx].photos,
                  procedure: item.procedure || merged[idx].procedure,
                  toothNumber: item.toothNumber || merged[idx].toothNumber,
                };
              }
            });
            return merged;
          });
        }
      });
    };

    const unsubCloud = subscribeToClinicalCasesCloud((cloudCases) => {
      if (cloudCases && cloudCases.length > 0) {
        setClinicalCases(cloudCases);
      }
    });

    window.addEventListener(CLINICAL_CASES_EVENT, handleCasesSync);
    return () => {
      unsubCloud();
      window.removeEventListener(CLINICAL_CASES_EVENT, handleCasesSync);
    };
  }, []);

  // Compute Patient Profiles Map across all logged cases and appointments
  const patientProfilesMap = useMemo(() => {
    return getPatientProfilesMap(clinicalCases, appointments);
  }, [clinicalCases, appointments]);

  const activeTimelineProfile = useMemo(() => {
    if (!timelinePatientName) return null;
    const norm = normalizePatientName(timelinePatientName);
    return patientProfilesMap.get(norm) || null;
  }, [timelinePatientName, patientProfilesMap]);

  const featuredPatientsCount = useMemo(() => {
    return Array.from(patientProfilesMap.values()).filter((p) => p.isFeatured).length;
  }, [patientProfilesMap]);

  // Real-time Cloud Firestore synchronization & subscriptions
  useEffect(() => {
    // 1. Subscribe to College Clinic Schedule from Cloud Firestore
    const unsubSchedule = subscribeToCollegeClinicScheduleCloud((cloudSlots) => {
      if (cloudSlots && cloudSlots.length > 0) {
        setScheduleSlots(cloudSlots);
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      }
    });

    // 2. Subscribe to Clinical Cases from Cloud Firestore
    const unsubCases = subscribeToClinicalCasesCloud((cloudCases) => {
      if (cloudCases && cloudCases.length > 0) {
        setAppointments((prev) => {
          const merged = [...prev];
          cloudCases.forEach((item) => {
            const idx = merged.findIndex((a) => a.id === item.id.toString());
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                category: item.category || merged[idx].category,
                photos: item.photos && item.photos.length > 0 ? item.photos : merged[idx].photos,
                procedure: item.procedure || merged[idx].procedure,
                toothNumber: item.toothNumber || merged[idx].toothNumber,
              };
            } else {
              merged.push({
                id: item.id.toString(),
                name: item.name,
                date: item.date,
                isArchived: item.isArchived ?? true,
                category: item.category,
                photos: item.photos,
                procedure: item.procedure,
                toothNumber: item.toothNumber,
              });
            }
          });
          return merged;
        });
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      }
    });

    return () => {
      unsubSchedule();
      unsubCases();
    };
  }, []);

  // Load and migrate appointments and proto_archive
  useEffect(() => {
    const stored = localStorage.getItem('protocol_appointments');
    const storedArchive = localStorage.getItem('proto_archive');

    let loadedAppointments: Appointment[] = [];
    if (stored) {
      try {
        loadedAppointments = JSON.parse(stored);
      } catch {}
    }

    if (storedArchive) {
      try {
        const archivedParsed = JSON.parse(storedArchive);
        archivedParsed.forEach((item: any) => {
          if (!loadedAppointments.some((a) => a.name === item.name && a.date === item.date)) {
            loadedAppointments.push({
              id: item.id || Date.now().toString() + Math.random(),
              name: item.name,
              date: item.date,
              isArchived: true,
            });
          }
        });
      } catch {}
    }

    if (loadedAppointments.length === 0) {
      // Migrate legacy data
      const legacyName =
        localStorage.getItem('protocol_patient_name') || localStorage.getItem('proto_name');
      const legacyDate =
        localStorage.getItem('protocol_patient_date') || localStorage.getItem('proto_date');
      if (legacyName && legacyDate) {
        loadedAppointments = [
          { id: Date.now().toString(), name: legacyName, date: legacyDate, isArchived: false },
        ];
      }
    }

    setAppointments(loadedAppointments);
  }, []);

  // Save appointments and proto_archive
  useEffect(() => {
    localStorage.setItem('protocol_appointments', JSON.stringify(appointments));
    const archivedOnly = appointments.filter((a) => a.isArchived);
    localStorage.setItem('proto_archive', JSON.stringify(archivedOnly));
    localStorage.setItem('protocol_archived_appointments', JSON.stringify(archivedOnly));

    checkAppointmentsStatus();
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  }, [appointments]);

  const checkAppointmentsStatus = () => {
    const active = appointments.filter((a) => !a.isArchived);
    if (active.length === 0) {
      setAlertText(
        '🔔 <strong style="color: #c5a059;">تنبيه الخانة الفارغة:</strong> <span style="font-weight: bold; color: #e6a73c;">Empty slot?</span> خانة المواعيد فارغة حالياً. أدخل موعد مراجع أو احجز وقتاً شاغراً في العيادة.'
      );
      setAlertColor('#e6a73c');
      return;
    }

    // Sort by date
    const sorted = [...active].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const next = sorted[0];

    const nextName = next.name || '';
    const isSlotEmpty =
      nextName.toLowerCase().includes('empty') ||
      nextName.toLowerCase().includes('فارغ') ||
      nextName.toLowerCase().includes('شاغر') ||
      nextName.trim() === '';

    if (isSlotEmpty) {
      setAlertText(
        '🔔 <strong style="color: #c5a059;">تنبيه الخانة الفارغة:</strong> <span style="font-weight: bold; color: #e6a73c;">Empty slot?</span> الخانة فارغة أو محجوزة كشاغر في العيادة.'
      );
      setAlertColor('#e6a73c');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(next.date);
    targetDate.setHours(0, 0, 0, 0);

    const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 2) {
      setAlertText(
        `🔔 <strong style="color: #c5a059;">تنبيه ذكي مسبق (قبل الموعد بيومين):</strong> <span style="font-weight: bold; color: #f59e0b;">"🔔 ذكر مراجعيك بمواعيدهم"</span> - متبقي يومان على موعد المراجع (<strong style="color:#fcfbfa;">${next.name}</strong>) بتاريخ ${next.date}! تأكد من التواصل معه لتأكيد الحضور.`
      );
      setAlertColor('#f59e0b');
    } else if (diff === 1) {
      setAlertText(
        `⏰ <strong style="color: #c5a059;">تنبيه ذكي مسبق (قبل الموعد بيوم):</strong> <span style="font-weight: bold; color: #f59e0b;">"🔔 ذكر مراجعيك بمواعيدهم"</span> - غداً موعد المراجع (<strong style="color:#fcfbfa;">${next.name}</strong>)! تأكد من التواصل معه وتجهيز أدوات العيادة.`
      );
      setAlertColor('#f59e0b');
    } else if (diff === 0) {
      setAlertText(
        `⭐ <strong style="color: #5cb85c;">موعد اليوم:</strong> لديك حالة علاجية مجدولة للمراجع (<strong style="color:#fcfbfa;">${next.name}</strong>) اليوم في العيادة!`
      );
      setAlertColor('#5cb85c');
    } else if (diff < 0) {
      setAlertText(
        `⚠️ <strong style="color: #f87171;">انتهى الموعد السابق:</strong> <span style="font-weight: bold; color: #f87171;">⚠️ لديك موعد فارغ - Empty slot</span> - انتهت حالة (${next.name}) بتاريخ ${next.date}. يمكنك أرشفة أو حذف الخانة لاستقبال مراجع جديد.`
      );
      setAlertColor('#f87171');
    } else {
      setAlertText(
        `📅 <strong style="color: #38bdf8;">الموعد القادم:</strong> متبقي <strong style="color:#fcfbfa;">${diff}</strong> يوم لموعد (<strong style="color:#fcfbfa;">${next.name}</strong>) بتاريخ ${next.date}.`
      );
      setAlertColor('#38bdf8');
    }

    // Trigger background native push & lock-screen alert scan if supported
    try {
      const candidates = active.map((a) => ({
        id: a.id,
        patientName: a.name,
        dateStr: a.date,
        procedure: a.procedure,
        toothNumber: a.toothNumber,
        department: a.category,
      }));
      runSmartAppointmentAlertScan(candidates).catch(() => {});
    } catch {}
  };

  const handleNameChange = (val: string) => {
    setNewName(val);
    try {
      if (val.trim()) {
        localStorage.setItem('proto_draft_name', val);
      } else {
        localStorage.removeItem('proto_draft_name');
      }
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch {}
  };

  const handleDateChange = (val: string) => {
    setNewDate(val);
    try {
      if (val) {
        localStorage.setItem('proto_draft_date', val);
      } else {
        localStorage.removeItem('proto_draft_date');
      }
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch {}
  };

  // Photo upload handler with compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, caption = 'صورة سريرية') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingPhoto(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressClinicalImage(file);
        const photo: CasePhoto = {
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          url: compressed,
          caption,
          timestamp: new Date().toISOString(),
        };
        setNewCasePhotos((prev) => [...prev, photo]);
      }
    } catch (err) {
      console.error('Error compressing image', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddPhotoToExistingAppointment = async (
    appt: Appointment,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingPhoto(true);

    try {
      const addedPhotos: CasePhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressClinicalImage(file);
        addedPhotos.push({
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          url: compressed,
          caption: 'صورة متابعة سريرية',
          timestamp: new Date().toISOString(),
        });
      }

      const updatedPhotos = [...(appt.photos || []), ...addedPhotos];
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, photos: updatedPhotos } : a))
      );

      await addOrUpdateClinicalCase({
        id: appt.id,
        name: appt.name,
        date: appt.date,
        category: appt.category || 'other',
        photos: updatedPhotos,
        procedure: appt.procedure,
        toothNumber: appt.toothNumber,
        isArchived: appt.isArchived,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error adding photo to case', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const addAppointment = async () => {
    if (!newName || !newDate) {
      setNotificationToast('⚠️ يرجى إدخال اسم المراجع وتاريخ الموعد!');
      setTimeout(() => setNotificationToast(null), 3000);
      return;
    }
    const newAppt: Appointment = {
      id: Date.now().toString(),
      name: newName,
      date: newDate,
      isArchived: false,
      category: selectedCategory,
      photos: newCasePhotos,
      procedure: caseProcedure.trim() || undefined,
      toothNumber: caseToothNumber.trim() || undefined,
    };
    setAppointments((prev) => [newAppt, ...prev]);

    // Save to permanent IndexedDB storage
    await addOrUpdateClinicalCase({
      id: newAppt.id,
      name: newAppt.name,
      date: newAppt.date,
      category: selectedCategory,
      photos: newCasePhotos,
      procedure: caseProcedure.trim() || undefined,
      toothNumber: caseToothNumber.trim() || undefined,
      isArchived: false,
      timestamp: new Date().toISOString(),
    });

    setNewName('');
    setNewDate('');
    setCaseProcedure('');
    setCaseToothNumber('');
    setNewCasePhotos([]);
    localStorage.removeItem('proto_draft_name');
    localStorage.removeItem('proto_draft_date');

    // Also update legacy single keys for compatibility
    localStorage.setItem('protocol_patient_name', newName);
    localStorage.setItem('protocol_patient_date', newDate);
    localStorage.setItem('proto_name', newName);
    localStorage.setItem('proto_date', newDate);

    setNotificationToast('✅ تمت إضافة الموعد وتفعيله بنجاح');
    setTimeout(() => setNotificationToast(null), 3000);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  };

  const setEmptySlot = () => {
    handleNameChange('Empty Slot (شاغر عيادة)');
    const today = new Date().toISOString().split('T')[0];
    if (!newDate) handleDateChange(today);
  };

  const clearDraftInputs = () => {
    handleNameChange('');
    handleDateChange('');
    setCaseProcedure('');
    setCaseToothNumber('');
    setNewCasePhotos([]);
    localStorage.removeItem('proto_draft_name');
    localStorage.removeItem('proto_draft_date');
  };

  const toggleArchive = async (id: string) => {
    let targetAppt: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          targetAppt = { ...a, isArchived: !a.isArchived };
          return targetAppt;
        }
        return a;
      })
    );

    if (targetAppt) {
      const isArch = (targetAppt as Appointment).isArchived;
      await addOrUpdateClinicalCase({
        id: (targetAppt as Appointment).id,
        name: (targetAppt as Appointment).name,
        date: (targetAppt as Appointment).date,
        category: (targetAppt as Appointment).category || 'other',
        photos: (targetAppt as Appointment).photos || [],
        procedure: (targetAppt as Appointment).procedure,
        toothNumber: (targetAppt as Appointment).toothNumber,
        isArchived: isArch,
        timestamp: new Date().toISOString(),
      });
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('protocol-appointments-updated'));
    }
  };

  // Direct active delete handler (Never blocked by window.confirm)
  const deleteAppointment = async (id: string, reason = 'حذف الحالة') => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    await deleteClinicalCase(id);
    setNotificationToast(`🗑️ تم ${reason} بنجاح`);
    setTimeout(() => setNotificationToast(null), 3000);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  };

  /**
   * Manual Cloud Sync Trigger (تثبيت ومزامنة جميع الأكواد والجداول سحابياً)
   */
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setCloudSyncStatus('syncing');
    try {
      await Promise.all([
        forceSyncCollegeClinicScheduleFromCloud(),
        forceSyncClinicalCasesFromCloud(),
      ]);
      setScheduleSlots(getCollegeClinicSchedule());
      const loadedCases = await getClinicalCases();
      if (loadedCases && loadedCases.length > 0) {
        setAppointments((prev) => {
          const merged = [...prev];
          loadedCases.forEach((item) => {
            const idx = merged.findIndex((a) => a.id === item.id.toString());
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                category: item.category || merged[idx].category,
                photos: item.photos && item.photos.length > 0 ? item.photos : merged[idx].photos,
                procedure: item.procedure || merged[idx].procedure,
                toothNumber: item.toothNumber || merged[idx].toothNumber,
              };
            } else {
              merged.push({
                id: item.id.toString(),
                name: item.name,
                date: item.date,
                isArchived: item.isArchived ?? true,
                category: item.category,
                photos: item.photos,
                procedure: item.procedure,
                toothNumber: item.toothNumber,
              });
            }
          });
          return merged;
        });
      }
      setCloudSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      setNotificationToast('⚡ تمت مزامنة جميع الأكواد والجداول والحالات السريرية سحابياً بنجاح');
      setTimeout(() => setNotificationToast(null), 3000);
    } catch {
      setCloudSyncStatus('error');
      setNotificationToast('⚠️ تعذرت المزامنة السحابية المؤقتة، البيانات محفوظة محلياً');
      setTimeout(() => setNotificationToast(null), 3000);
    } finally {
      setIsManualSyncing(false);
    }
  };

  /**
   * Delete or clear patient slot when no work was done (حذف خانة المراجع في حال ما تم الشغل)
   */
  const handleDeleteDraftPatientSlot = async (id?: string) => {
    if (id) {
      await deleteAppointment(id, 'حذف خانة هذا المراجع (لم يتم إنجاز الشغل)');
    } else {
      clearDraftInputs();
      localStorage.removeItem('proto_draft_name');
      localStorage.removeItem('proto_draft_date');
      localStorage.removeItem('protocol_patient_name');
      localStorage.removeItem('protocol_patient_date');
      localStorage.removeItem('proto_name');
      localStorage.removeItem('proto_date');
      setNotificationToast('🗑️ تم تفريغ وحذف خانة المراجع بنجاح (لم يتم الشغل).');
      setTimeout(() => setNotificationToast(null), 3000);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('protocol-appointments-updated'));
    }
  };

  // In-place patient appointment editing handlers
  const handleStartEditAppt = (appt: Appointment) => {
    setEditingApptId(appt.id);
    setEditApptName(appt.name);
    setEditApptDate(appt.date);
    setEditApptTooth(appt.toothNumber || '');
    setEditApptProcedure(appt.procedure || '');
    setEditApptCategory(appt.category || 'fillings');
  };

  const handleCancelEditAppt = () => {
    setEditingApptId(null);
  };

  const handleSaveEditAppt = async () => {
    if (!editingApptId) return;
    if (!editApptName.trim() || !editApptDate) {
      setNotificationToast('⚠️ يرجى إدخال اسم المراجع وتاريخ الموعد!');
      setTimeout(() => setNotificationToast(null), 3000);
      return;
    }

    const updatedList = appointments.map((a) => {
      if (a.id === editingApptId) {
        return {
          ...a,
          name: editApptName.trim(),
          date: editApptDate,
          toothNumber: editApptTooth.trim() || undefined,
          procedure: editApptProcedure.trim() || undefined,
          category: editApptCategory,
        };
      }
      return a;
    });

    setAppointments(updatedList);

    const target = updatedList.find((a) => a.id === editingApptId);
    if (target) {
      await addOrUpdateClinicalCase({
        id: target.id,
        name: target.name,
        date: target.date,
        category: target.category || 'other',
        photos: target.photos || [],
        procedure: target.procedure,
        toothNumber: target.toothNumber,
        isArchived: target.isArchived,
        timestamp: new Date().toISOString(),
      });
    }

    localStorage.setItem('protocol_patient_name', editApptName.trim());
    localStorage.setItem('protocol_patient_date', editApptDate);
    localStorage.setItem('proto_name', editApptName.trim());
    localStorage.setItem('proto_date', editApptDate);

    setEditingApptId(null);
    setNotificationToast('✅ تم تعديل بيانات المراجع وتحديث الموعد بنجاح');
    setTimeout(() => setNotificationToast(null), 3000);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  };

  const clearArchivedAppointments = async () => {
    const archivedIds = appointments.filter((a) => a.isArchived).map((a) => a.id);
    setAppointments((prev) => prev.filter((a) => !a.isArchived));
    for (const id of archivedIds) {
      await deleteClinicalCase(id);
    }
    setNotificationToast('🗑️ تم تفريغ الأرشيف السريري بالكامل');
    setTimeout(() => setNotificationToast(null), 3000);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('protocol-appointments-updated'));
  };

  // Clinic schedule slots handlers
  const handleAddNewScheduleSlot = () => {
    if (!newSlotRoom && !newSlotChair && !newSlotRequirement && !newSlotDept) {
      setNotificationToast('⚠️ يرجى إدخال بيانات عيادة الكلية (القسم أو القاعة أو الريكوايرمنت)');
      setTimeout(() => setNotificationToast(null), 3000);
      return;
    }
    const dayMeta = DAYS_OF_WEEK.find((d) => d.key === newSlotDay);
    addClinicScheduleSlot({
      dayOfWeek: newSlotDay,
      dayNameAr: dayMeta ? dayMeta.nameAr : 'الأحد',
      department: newSlotDept,
      clinicRoom: newSlotRoom.trim() || undefined,
      chairNumber: newSlotChair.trim() || undefined,
      timeStart: newSlotStart,
      timeEnd: newSlotEnd,
      supervisorName: newSlotSupervisor.trim() || undefined,
      targetRequirement: newSlotRequirement.trim() || undefined,
      notes: newSlotNotes.trim() || undefined,
      isActive: true,
    });
    setScheduleSlots(getCollegeClinicSchedule());
    setShowAddSlotForm(false);
    setNewSlotRoom('');
    setNewSlotChair('');
    setNewSlotRequirement('');
    setNewSlotNotes('');
    setNotificationToast('✅ تمت إضافة عيادة الكلية لجدولك بنجاح');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // In-place schedule slot editing handlers
  const handleStartEditScheduleSlot = (slot: ClinicScheduleSlot) => {
    setEditingSlotId(slot.id);
    setEditSlotDay(slot.dayOfWeek);
    setEditSlotDept(slot.department);
    setEditSlotRoom(slot.clinicRoom || '');
    setEditSlotChair(slot.chairNumber || '');
    setEditSlotStart(slot.timeStart);
    setEditSlotEnd(slot.timeEnd);
    setEditSlotSupervisor(slot.supervisorName || '');
    setEditSlotRequirement(slot.targetRequirement || '');
    setEditSlotNotes(slot.notes || '');
  };

  const handleCancelEditScheduleSlot = () => {
    setEditingSlotId(null);
  };

  const handleSaveEditScheduleSlot = () => {
    if (!editingSlotId) return;
    const dayMeta = DAYS_OF_WEEK.find((d) => d.key === editSlotDay);
    updateClinicScheduleSlot(editingSlotId, {
      dayOfWeek: editSlotDay,
      dayNameAr: dayMeta ? dayMeta.nameAr : 'الأحد',
      department: editSlotDept,
      clinicRoom: editSlotRoom.trim() || undefined,
      chairNumber: editSlotChair.trim() || undefined,
      timeStart: editSlotStart,
      timeEnd: editSlotEnd,
      supervisorName: editSlotSupervisor.trim() || undefined,
      targetRequirement: editSlotRequirement.trim() || undefined,
      notes: editSlotNotes.trim() || undefined,
    });
    setScheduleSlots(getCollegeClinicSchedule());
    setEditingSlotId(null);
    setNotificationToast('✅ تم تعديل عيادة الكلية وحفظ التغييرات في الجدول الأسبوعي');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleDeleteScheduleSlot = (slotId: string) => {
    deleteClinicScheduleSlot(slotId);
    setScheduleSlots(getCollegeClinicSchedule());
    setNotificationToast('🗑️ تم حذف العيادة من جدول الكلية بنجاح');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleResetDefaultSchedule = () => {
    saveCollegeClinicSchedule(DEFAULT_SCHEDULE_SLOTS);
    setScheduleSlots(DEFAULT_SCHEDULE_SLOTS);
    setNotificationToast('🔄 تمت استعادة الجدول الجامعي النموذجي بنجاح');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Manual Patient Assignment Handlers (Strictly manual - never auto-filled)
  const handleStartEditSlotPatient = (slot: ClinicScheduleSlot) => {
    setPatientEditingSlotId(slot.id);
    setManualPatientName(slot.assignedPatientName || '');
    setManualPatientProcedure(slot.patientProcedure || '');
    setManualPatientContact(slot.patientContact || '');
  };

  const handleCancelEditSlotPatient = () => {
    setPatientEditingSlotId(null);
    setManualPatientName('');
    setManualPatientProcedure('');
    setManualPatientContact('');
  };

  const handleSaveSlotPatient = (slotId: string) => {
    if (!manualPatientName.trim()) {
      alert('يرجى كتابة اسم المراجع يدوياً لتأكيد حجز الخانة.');
      return;
    }
    assignPatientToClinicSlot(slotId, {
      assignedPatientName: manualPatientName.trim(),
      patientProcedure: manualPatientProcedure.trim() || undefined,
      patientContact: manualPatientContact.trim() || undefined,
    });
    setScheduleSlots(getCollegeClinicSchedule());
    setPatientEditingSlotId(null);
    setManualPatientName('');
    setManualPatientProcedure('');
    setManualPatientContact('');
    setNotificationToast(`✅ تم تسجيل المراجع (${manualPatientName.trim()}) يدوياً في خانة العيادة بنجاح`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const handleClearSlotPatient = (slotId: string) => {
    if (window.confirm('هل أنت متأكد من تفريغ هذه الخانة وحذف اسم المراجع؟ ستصبح الخانة شاغرة وسينبهك النظام إليها.')) {
      clearPatientFromClinicSlot(slotId);
      setScheduleSlots(getCollegeClinicSchedule());
      setNotificationToast('🗑️ تم تفريغ خانة العيادة، أصبحت شاغرة بانتظار إدخال مراجع جديد.');
      setTimeout(() => setNotificationToast(null), 3500);
    }
  };

  const handleTriggerEmptySlotsAlert = async () => {
    setIsTestingEmptySlotAlert(true);
    try {
      const candidates = appointments.map((a) => ({
        id: a.id,
        patientName: a.name,
        dateStr: a.date,
        procedure: a.procedure,
      }));
      const res = await sendInstantWeeklyEmptySlotTest(scheduleSlots, candidates);
      setNotificationToast(res.message);
    } catch {
      setNotificationToast('حدث خطأ أثناء فحص الخانات الفارغة');
    } finally {
      setIsTestingEmptySlotAlert(false);
      setTimeout(() => setNotificationToast(null), 4000);
    }
  };

  // Lock-screen test notification handler
  const handleTestLockScreenAlert = async () => {
    setIsTestingNotification(true);
    try {
      const ok = await sendInstantLiveLockScreenTest();
      if (ok) {
        setNotificationToast('🔔 تم إرسال تنبيه حقيقي لشاشة القفل بنجاح! تحقق من شاشة هاتفك.');
      } else {
        const perm = await requestNotificationPermission();
        setNotificationPerm(perm);
        if (perm === 'granted') {
          await sendInstantLiveLockScreenTest();
          setNotificationToast('🔔 تم تفعيل إشعارات شاشة القفل وإرسال التنبيه التجريبي.');
        } else {
          setNotificationToast('⚠️ يرجى السماح بالإشعارات من إعدادات المتصفح لتفعيل تنبيهات شاشة القفل.');
        }
      }
    } catch (err) {
      setNotificationToast('⚠️ حدث خطأ أثناء تشغيل الإشعار التجريبي.');
    } finally {
      setIsTestingNotification(false);
      setTimeout(() => setNotificationToast(null), 4000);
    }
  };

  // Supervisor toggle handlers for appointments section
  const handleToggleSupervisorAccess = (newAccess: 'free' | 'subscription') => {
    updateCompanionCardPermission('appointments', { access: newAccess });
    setCompanionPermissions(getCompanionPermissions());
    setNotificationToast(
      newAccess === 'free'
        ? '🔓 تم ضبط خانة مواعيدي: مجانية للعامة بدون اشتراك'
        : '🔒 تم ضبط خانة مواعيدي: تتطلب اشتراكاً نشطاً'
    );
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleToggleSupervisorVisibility = (newVis: 'visible' | 'hidden') => {
    updateCompanionCardPermission('appointments', { visibility: newVis });
    setCompanionPermissions(getCompanionPermissions());
    setNotificationToast(
      newVis === 'visible'
        ? '👁️ تم إظهار خانة مواعيدي لجميع المشتركين'
        : '🚫 تم إخفاء خانة مواعيدي تماماً عن الطلاب'
    );
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Expose checkAppt and saveAppt window methods
  useEffect(() => {
    (window as any).checkAppt = () => {
      checkAppointmentsStatus();
    };
    (window as any).saveAppt = () => {
      if (newName && newDate) {
        addAppointment();
      } else {
        const inputName = (document.getElementById('patientName') as HTMLInputElement)?.value;
        const inputDate = (document.getElementById('patientDate') as HTMLInputElement)?.value;
        if (inputName && inputDate) {
          setAppointments((prev) => [
            { id: Date.now().toString(), name: inputName, date: inputDate, isArchived: false },
            ...prev,
          ]);
          setNotificationToast('✅ تم حفظ الموعد بنجاح!');
          setTimeout(() => setNotificationToast(null), 3000);
        } else {
          setNotificationToast('⚠️ يرجى إدخال اسم المراجع والتاريخ');
          setTimeout(() => setNotificationToast(null), 3000);
        }
      }
    };
    (window as any).archiveApptById = (id: string) => {
      toggleArchive(id);
    };

    return () => {
      delete (window as any).checkAppt;
      delete (window as any).saveAppt;
      delete (window as any).archiveApptById;
    };
  }, [appointments, newName, newDate]);

  const activeAppointments = appointments.filter((a) => !a.isArchived);
  const archivedAppointments = useMemo(
    () => appointments.filter((a) => a.isArchived),
    [appointments]
  );
  const totalRealCases = appointments.length;

  const archiveCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: archivedAppointments.length };
    CLINICAL_CATEGORIES.forEach((cat) => {
      counts[cat.id] = archivedAppointments.filter(
        (a) => (a.category || 'other') === cat.id
      ).length;
    });
    return counts;
  }, [archivedAppointments]);

  const filteredArchivedAppointments = useMemo(() => {
    return archivedAppointments.filter((a) => {
      const matchCat =
        archiveCategoryFilter === 'all' || (a.category || 'other') === archiveCategoryFilter;
      const q = archiveSearchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.procedure && a.procedure.toLowerCase().includes(q)) ||
        (a.toothNumber && a.toothNumber.includes(q)) ||
        (a.date && a.date.includes(q));
      return matchCat && matchQuery;
    });
  }, [archivedAppointments, archiveCategoryFilter, archiveSearchQuery]);

  return (
    <div
      id="appointments-section"
      className={`card card-item ${className}`}
      data-section-id="appointments-section"
      style={{
        background: '#151b12',
        border: '2px solid #c5a059',
        borderRadius: '16px',
        padding: '20px',
        margin: '16px auto',
        maxWidth: '600px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        color: '#fcfbfa',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* رأس القسم بتنسيق فاخر متناسق مع التطبيق */}
      <div
        style={{
          borderBottom: '2px solid #c5a059',
          paddingBottom: '12px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: '#c5a059',
              color: '#151b12',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            📅
          </span>
          <h3 style={{ color: '#c5a059', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            {t('appts.title', 'مواعيدي وجدول العيادات السريرية')}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* زر وحالة المزامنة السحابية اللحظية */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isManualSyncing}
            style={{
              background: cloudSyncStatus === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
              color: cloudSyncStatus === 'error' ? '#fca5a5' : '#86efac',
              border: `1px solid ${cloudSyncStatus === 'error' ? '#ef4444' : 'rgba(16,185,129,0.4)'}`,
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: isManualSyncing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            title={isRTL ? "مزامنة فورية مع السحابة لجميع الجداول والمواعيد (اضغط للتحديث)" : "Instant cloud sync for all appointments (click to sync)"}
          >
            {isManualSyncing ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Cloud size={11} />
            )}
            <span>{isManualSyncing ? t('appts.syncing', 'جاري المزامنة...') : t('appts.cloudSynced', 'سحابي متزامن ⚡')}</span>
          </button>

          {/* زر مشاركة التطبيق ورابط التثبيت PWA */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.3))',
              color: '#38bdf8',
              border: '1px solid rgba(56,189,248,0.4)',
              borderRadius: '6px',
              padding: '4px 9px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            title={isRTL ? "مشاركة رابط التطبيق وتثبيته على الهواتف مع ضمان المزامنة" : "Share app link & install PWA"}
          >
            <Share2 size={12} />
            <span>{t('appts.shareLink', 'مشاركة الرابط 🔗')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
              color: '#151b12',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(197,160,89,0.3)',
              transition: 'all 0.15s ease',
            }}
            title={isRTL ? "توليد تقرير الإنجاز السريري السنوي وتصديره كـ PDF" : "Generate annual clinical achievement report (PDF)"}
          >
            <FileText size={12} />
            <span>{t('appts.pdfReport', 'تصدير التقرير (PDF) 📄')}</span>
          </button>
          <span
            id="realTotalBadge"
            style={{
              background: 'rgba(197,160,89,0.15)',
              color: '#c5a059',
              border: '1px solid #c5a059',
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
            }}
          >
            {t('appts.totalCases', 'الحالات:')} {totalRealCases}
          </span>
        </div>
      </div>

      {/* إشعار عائم للعمليات (تنبيهات وتعديلات المشرف) */}
      {notificationToast && (
        <div
          style={{
            background: 'rgba(21, 27, 18, 0.95)',
            border: '1.5px solid #c5a059',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
            color: '#fcfbfa',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          <Sparkles size={16} color="#c5a059" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* لوحة تحكم المشرف المباشرة لخانة مواعيدي (إخفاء/إظهار، مجاني/اشتراك، حذف) */}
      {isAuthorAdmin && (() => {
        const apptPerm = companionPermissions['appointments'] || DEFAULT_COMPANION_PERMISSIONS['appointments'] || {
          access: 'subscription',
          visibility: 'visible',
        };
        const isFree = apptPerm.access === 'free';
        const isVis = apptPerm.visibility === 'visible';

        return (
          <div
            style={{
              marginBottom: '14px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(21, 27, 18, 0.95) 100%)',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px solid rgba(197, 160, 89, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🛡️</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#c5a059' }}>
                  تحكم المشرف الحصري في خانة مواعيدي:
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span
                  style={{
                    background: isVis ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isVis ? '#4ade80' : '#f87171',
                    border: `1px solid ${isVis ? '#10b981' : '#ef4444'}`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                  }}
                >
                  {isVis ? '👁️ ظاهرة' : '🚫 مخفية'}
                </span>
                <span
                  style={{
                    background: isFree ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: isFree ? '#38bdf8' : '#f59e0b',
                    border: `1px solid ${isFree ? '#38bdf8' : '#f59e0b'}`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                  }}
                >
                  {isFree ? '🔓 مجاني بدون اشتراك' : '🔒 يتطلب اشتراك'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {/* زر التبديل بين إظهار وإخفاء */}
              <button
                type="button"
                onClick={() => handleToggleSupervisorVisibility(isVis ? 'hidden' : 'visible')}
                style={{
                  flex: 1,
                  background: isVis ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isVis ? '#fca5a5' : '#86efac',
                  border: `1px solid ${isVis ? '#ef4444' : '#10b981'}`,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {isVis ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{isVis ? 'إخفاء الخانة عن الطلاب' : 'إظهار الخانة للطلاب'}</span>
              </button>

              {/* زر التبديل بين مجاني واشتراك */}
              <button
                type="button"
                onClick={() => handleToggleSupervisorAccess(isFree ? 'subscription' : 'free')}
                style={{
                  flex: 1,
                  background: isFree ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: isFree ? '#fcd34d' : '#7dd3fc',
                  border: `1px solid ${isFree ? '#f59e0b' : '#38bdf8'}`,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {isFree ? <Lock size={13} /> : <Unlock size={13} />}
                <span>{isFree ? 'جعلها تتطلب اشتراك 🔒' : 'إتاحتها مجاناً بدون اشتراك 🔓'}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* لوحة إحصائيات حقيقية مبنية على مدخلات الطالب الفعلية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div
          style={{
            background: '#1e251a',
            border: '1px solid rgba(197,160,89,0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '4px' }}>
            {t('appts.statPending', 'المواعيد القادمة النشطة')}
          </span>
          <span id="realActiveCount" style={{ fontSize: '20px', fontWeight: 'bold', color: '#c5a059' }}>
            {activeAppointments.length}
          </span>
        </div>
        <div
          style={{
            background: '#1e251a',
            border: '1px solid rgba(197,160,89,0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '4px' }}>
            {t('appts.statArchived', 'الحالات المكتملة والأرشيف')}
          </span>
          <span id="realArchivedCount" style={{ fontSize: '20px', fontWeight: 'bold', color: '#5cb85c' }}>
            {archivedAppointments.length}
          </span>
        </div>
      </div>

      {/* شريط التنبيهات الذكية لشاشة القفل والتنقل بين مواعيدي وجدول عيادات الكلية */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(21, 27, 18, 0.9) 100%)',
          border: '1px solid rgba(197, 160, 89, 0.35)',
          borderRadius: '12px',
          padding: '10px 12px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={15} color="#c5a059" />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#c5a059' }}>
              {t('appts.lockScreenAlerts', 'التنبيهات الذكية لشاشة القفل (Lock Screen)')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTriggerEmptySlotsAlert}
              disabled={isTestingEmptySlotAlert}
              style={{
                background: emptyWeeklySlots.length > 0 ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'rgba(255,255,255,0.08)',
                color: emptyWeeklySlots.length > 0 ? '#151b12' : '#fed7aa',
                border: emptyWeeklySlots.length > 0 ? 'none' : '1px solid #f97316',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: isTestingEmptySlotAlert ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: emptyWeeklySlots.length > 0 ? '0 2px 6px rgba(249,115,22,0.35)' : 'none',
              }}
              title="فحص وإرسال إشعار محلي للخانات الفارغة في جدول الكلية"
            >
              <AlertTriangle size={11} />
              <span>
                {isTestingEmptySlotAlert
                  ? 'جاري الفحص...'
                  : `فحص الخانات الفارغة (${emptyWeeklySlots.length}) 🔔`}
              </span>
            </button>
            <button
              type="button"
              onClick={handleTestLockScreenAlert}
              disabled={isTestingNotification}
              style={{
                background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
                color: '#151b12',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: isTestingNotification ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(197,160,89,0.3)',
              }}
            >
              <Send size={11} />
              <span>{isTestingNotification ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : t('appts.testAlert', 'تجربة إشعار حقيقي للشاشة 🔔')}</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#a0a59a', lineHeight: '1.5' }}>
          {isRTL ? (
            <>
              📱 ترسل المنظومة إشعارات حقيقية لشاشة القفل:
              <span style={{ color: '#f59e0b', fontWeight: 'bold', margin: '0 4px' }}>
                (🔔 ذكر مراجعيك بمواعيدهم)
              </span>{' '}
              قبل يوم أو يومين، و
              <span style={{ color: '#f97316', fontWeight: 'bold', margin: '0 4px' }}>
                (⚠️ تنبيه الخانات الفارغة في جدول العيادات الأسبوعي)
              </span>{' '}
              تلقائياً عند اكتشاف خانة عيادة شاغرة. لن يضيف النظام مراجعين من تلقاء نفسه، بل يلزم إدخال أسمائهم يدوياً.
            </>
          ) : (
            <>
              📱 Real lock-screen notifications sent:
              <span style={{ color: '#f59e0b', fontWeight: 'bold', margin: '0 4px' }}>
                (🔔 Remind patients of their appointments)
              </span>{' '}
              and{' '}
              <span style={{ color: '#f97316', fontWeight: 'bold', margin: '0 4px' }}>
                (⚠️ Empty weekly clinic slot alerts)
              </span>{' '}
              when unassigned slots are detected. Patient names must be entered manually by student.
            </>
          )}
        </div>
      </div>

      {/* شريط التبويبات الفرعية: مواعيدي | توثيق الحالات | المراجعون المميزون | جدول الكلية */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '6px',
          marginBottom: '16px',
          background: '#12160f',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(197,160,89,0.3)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('appointments')}
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'appointments' ? '#c5a059' : 'transparent',
            color: activeSubTab === 'appointments' ? '#151b12' : '#a0a59a',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <Calendar size={13} />
          <span>{t('appts.tabAppointments', 'مواعيدي والجدول')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('case_logger')}
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'case_logger' ? '#c5a059' : 'transparent',
            color: activeSubTab === 'case_logger' ? '#151b12' : '#a0a59a',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <ClipboardList size={13} />
          <span>{isRTL ? 'تسجيل حالة وملاحظات' : 'Log Case'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('featured_patients')}
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'featured_patients' ? '#c5a059' : 'transparent',
            color: activeSubTab === 'featured_patients' ? '#151b12' : '#a0a59a',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <Star size={13} />
          <span>{isRTL ? 'المراجعون المميزون' : 'Featured'}</span>
          {featuredPatientsCount > 0 && (
            <span
              style={{
                background: activeSubTab === 'featured_patients' ? '#151b12' : '#f59e0b',
                color: activeSubTab === 'featured_patients' ? '#c5a059' : '#151b12',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              {featuredPatientsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('college_schedule')}
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'college_schedule' ? '#c5a059' : 'transparent',
            color: activeSubTab === 'college_schedule' ? '#151b12' : '#a0a59a',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <GraduationCap size={13} />
          <span>{t('appts.tabCollegeSchedule', 'جدول الكلية')}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* القسم الفرعي الثالث: تسجيل الحالات السريرية والملاحظات وإرفاق الصور يدويًا */}
      {/* ============================================================== */}
      {activeSubTab === 'case_logger' && (
        <ClinicalCaseLoggerForm
          initialPatientName={loggerPreFill?.patientName || ''}
          initialDate={loggerPreFill?.date || ''}
          initialToothNumber={loggerPreFill?.toothNumber || ''}
          initialProcedure={loggerPreFill?.procedure || ''}
          initialCategory={loggerPreFill?.category || 'fillings'}
          initialSlotId={loggerPreFill?.slotId}
          initialAppointmentId={loggerPreFill?.appointmentId}
          existingProfilesMap={patientProfilesMap}
          onCaseSaved={() => {
            setLoggerPreFill(null);
            setActiveSubTab('appointments');
          }}
          onOpenPatientTimeline={(name) => setTimelinePatientName(name)}
          onCancel={() => {
            setLoggerPreFill(null);
            setActiveSubTab('appointments');
          }}
        />
      )}

      {/* ============================================================== */}
      {/* القسم الفرعي الرابع: مركز المراجعين المميزين وسجل الزيارات السابقة */}
      {/* ============================================================== */}
      {activeSubTab === 'featured_patients' && (
        <FeaturedPatientsHub
          profilesMap={patientProfilesMap}
          onOpenTimeline={(name) => setTimelinePatientName(name)}
          onAddNewSession={(name) => {
            setLoggerPreFill({ patientName: name });
            setActiveSubTab('case_logger');
          }}
          onScheduleAppointment={(name) => {
            setNewName(name);
            setActiveSubTab('appointments');
          }}
        />
      )}

      {/* ============================================================== */}
      {/* القسم الفرعي الثاني: إدخال وإدارة جدول عيادات الكلية يدوياً */}
      {/* ============================================================== */}
      {activeSubTab === 'college_schedule' && (
        <div
          id="college-schedule-container"
          className="animate-fadeIn"
          style={{
            background: '#1a2016',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          {/* تنبيه تلقائي للخانات الفارغة في الجدول الأسبوعي */}
          {emptyWeeklySlots.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(180, 83, 9, 0.25) 100%)',
                border: '1.5px solid #f97316',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f97316', color: '#151b12', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#fed7aa', display: 'block' }}>
                    ⚠️ تنبيه تلقائي: لديك ({emptyWeeklySlots.length}) خانات عيادة فارغة بدون مراجع مسجل!
                  </strong>
                  <span style={{ fontSize: '11px', color: '#fdba74' }}>
                    النظام لا يضيف مراجعين من تلقاء نفسه لضمان دقة عملك. يرجى إدخال أسماء مراجعيك يدوياً بالضغط على زر (+ تسجيل مراجع) في الخانات أدناه.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerEmptySlotsAlert}
                disabled={isTestingEmptySlotAlert}
                style={{
                  background: '#f97316',
                  color: '#151b12',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: isTestingEmptySlotAlert ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Bell size={12} />
                <span>إرسال إشعار محلي الآن 🔔</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#c5a059', fontWeight: 'bold' }}>
                🏛️ جدول عيادات الكلية الأسبوعي (نظامك الجامعي)
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#a0a59a' }}>
                أدخل جدول عياداتك اليدوي بالكلية حسب أيام الأسبوع، التوقيت، القاعات، ورقم اليونت
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSlotForm(!showAddSlotForm)}
              style={{
                background: showAddSlotForm ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                color: showAddSlotForm ? '#f87171' : '#151b12',
                border: showAddSlotForm ? '1px solid #ef4444' : 'none',
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
              {showAddSlotForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showAddSlotForm ? 'إلغاء' : '+ إضافة عيادة'}</span>
            </button>
          </div>

          {/* نموذج إضافة عيادة جامعية يدوياً */}
          {showAddSlotForm && (
            <div
              style={{
                background: '#12160f',
                border: '1.5px solid #c5a059',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                    📅 يوم العيادة:
                  </label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                    }}
                  >
                    {DAYS_OF_WEEK.map((d, dIdx) => (
                      <option key={`${d.key}_${dIdx}`} value={d.key}>
                        {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                    🏥 القسم السريري:
                  </label>
                  <select
                    value={newSlotDept}
                    onChange={(e) => setNewSlotDept(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                    }}
                  >
                    {DENTAL_DEPARTMENTS.map((dept, deptIdx) => (
                      <option key={`${dept.id}_${deptIdx}`} value={dept.nameAr}>
                        {dept.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                    🏢 القاعة / العيادة:
                  </label>
                  <input
                    type="text"
                    value={newSlotRoom}
                    onChange={(e) => setNewSlotRoom(e.target.value)}
                    placeholder="مثال: عيادة الترميم 3 - الطابق 2"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                    💺 رقم اليونت / الكرسي:
                  </label>
                  <input
                    type="text"
                    value={newSlotChair}
                    onChange={(e) => setNewSlotChair(e.target.value)}
                    placeholder="مثال: Unit #12 أو كرسي 4"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                    ⏰ وقت البدء:
                  </label>
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                    ⏰ وقت الانتهاء:
                  </label>
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                    👨‍⚕️ المشرف:
                  </label>
                  <input
                    type="text"
                    value={newSlotSupervisor}
                    onChange={(e) => setNewSlotSupervisor(e.target.value)}
                    placeholder="اسم المشرف"
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      background: '#1e251a',
                      border: '1px solid #3b4a2e',
                      borderRadius: '6px',
                      color: '#fcfbfa',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                  🎯 الريكوايرمنت والمطلوب إنجازه:
                </label>
                <input
                  type="text"
                  value={newSlotRequirement}
                  onChange={(e) => setNewSlotRequirement(e.target.value)}
                  placeholder="مثال: حشو كلاس II + أخذ طبعة أطقم جزئية"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#1e251a',
                    border: '1px solid #3b4a2e',
                    borderRadius: '6px',
                    color: '#fcfbfa',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddNewScheduleSlot}
                style={{
                  background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
                  color: '#151b12',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '4px',
                }}
              >
                <Check size={14} />
                <span>حفظ العيادة في الجدول الأسبوعي 📌</span>
              </button>
            </div>
          )}

          {/* قائمة عيادات الكلية المجدولة يدوياً */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scheduleSlots.length === 0 ? (
              <div
                style={{
                  background: '#12160f',
                  border: '1px dashed rgba(197,160,89,0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#a0a59a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>لم تقم بإضافة أي عيادات لجدول الكلية بعد. يمكنك إدخال جدولك يدوياً أو استعادة الجدول النموذجي.</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddSlotForm(true)}
                    style={{
                      background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                      color: '#151b12',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    + إضافة عيادة يدوياً
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaultSchedule}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#c5a059',
                      border: '1px solid #c5a059',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    🔄 استعادة الجدول النموذجي
                  </button>
                </div>
              </div>
            ) : (
              scheduleSlots.map((slot, slotIdx) => {
                const isEditingThisSlot = editingSlotId === slot.id;

                if (isEditingThisSlot) {
                  return (
                    <div
                      key={`${slot.id}_${slotIdx}`}
                      style={{
                        background: '#161c12',
                        border: '1.5px solid #c5a059',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#c5a059', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Edit3 size={14} />
                          <span>تعديل عيادة: {slot.dayNameAr} - {slot.department}</span>
                        </strong>
                        <button
                          type="button"
                          onClick={handleCancelEditScheduleSlot}
                          style={{ background: 'none', border: 'none', color: '#a0a59a', cursor: 'pointer', fontSize: '11px' }}
                          title="إلغاء التعديل"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            📅 اليوم:
                          </label>
                          <select
                            value={editSlotDay}
                            onChange={(e) => setEditSlotDay(e.target.value as any)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                            }}
                          >
                            {DAYS_OF_WEEK.map((d, dIdx) => (
                              <option key={`${d.key}_${dIdx}`} value={d.key}>
                                {d.nameAr}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            🦷 القسم / التخصص:
                          </label>
                          <select
                            value={editSlotDept}
                            onChange={(e) => setEditSlotDept(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                            }}
                          >
                            {DENTAL_DEPARTMENTS.map((dept, deptIdx) => (
                              <option key={`${dept.id}_${deptIdx}`} value={dept.nameAr}>
                                {dept.nameAr}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            🏢 القاعة / العيادة:
                          </label>
                          <input
                            type="text"
                            value={editSlotRoom}
                            onChange={(e) => setEditSlotRoom(e.target.value)}
                            placeholder="مثال: عيادة المحافظة 2"
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            💺 رقم اليونت / الكرسي:
                          </label>
                          <input
                            type="text"
                            value={editSlotChair}
                            onChange={(e) => setEditSlotChair(e.target.value)}
                            placeholder="مثال: Unit #14"
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            ⏰ وقت البدء:
                          </label>
                          <input
                            type="time"
                            value={editSlotStart}
                            onChange={(e) => setEditSlotStart(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            ⏰ وقت الانتهاء:
                          </label>
                          <input
                            type="time"
                            value={editSlotEnd}
                            onChange={(e) => setEditSlotEnd(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                            👨‍⚕️ المشرف:
                          </label>
                          <input
                            type="text"
                            value={editSlotSupervisor}
                            onChange={(e) => setEditSlotSupervisor(e.target.value)}
                            placeholder="اسم المشرف"
                            style={{
                              width: '100%',
                              padding: '6px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                          🎯 الريكوايرمنت والمطلوب إنجازه:
                        </label>
                        <input
                          type="text"
                          value={editSlotRequirement}
                          onChange={(e) => setEditSlotRequirement(e.target.value)}
                          placeholder="المطلوب إنجازه..."
                          style={{
                            width: '100%',
                            padding: '6px',
                            background: '#12160f',
                            border: '1px solid #3b4a2e',
                            borderRadius: '6px',
                            color: '#fcfbfa',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={handleSaveEditScheduleSlot}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
                            color: '#151b12',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={14} />
                          <span>حفظ التعديل في الجدول ✅</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditScheduleSlot}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#a0a59a',
                            border: '1px solid #3b4a2e',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          إلغاء ✖️
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${slot.id}_${slotIdx}`}
                    style={{
                      background: '#12160f',
                      border: '1px solid rgba(197, 160, 89, 0.25)',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              background: '#c5a059',
                              color: '#151b12',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >
                            {slot.dayNameAr}
                          </span>
                          <strong style={{ fontSize: '13px', color: '#fcfbfa' }}>
                            {slot.department}
                          </strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span>⏰ {slot.timeStart} - {slot.timeEnd}</span>
                          {slot.clinicRoom && <span>| 🏢 {slot.clinicRoom}</span>}
                          {slot.chairNumber && <span>| 💺 {slot.chairNumber}</span>}
                        </div>
                      </div>

                      {/* أزرار التعديل والحذف المفعلة في جدول الكلية */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEditScheduleSlot(slot)}
                          style={{
                            background: 'rgba(197, 160, 89, 0.2)',
                            color: '#c5a059',
                            border: '1px solid rgba(197, 160, 89, 0.4)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                          title="تعديل بيانات هذه العيادة في الجدول يدوياً"
                        >
                          <Edit3 size={12} />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScheduleSlot(slot.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                          title="حذف هذه العيادة من جدول الكلية"
                        >
                          <Trash2 size={12} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>

                    {slot.targetRequirement && (
                      <div style={{ fontSize: '11px', color: '#86efac', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        🎯 <strong>المطلوب إنجازه:</strong> {slot.targetRequirement}
                      </div>
                    )}

                    {slot.supervisorName && (
                      <div style={{ fontSize: '10px', color: '#a0a59a' }}>
                        👨‍⚕️ المشرف السريري: <span style={{ color: '#c5a059' }}>{slot.supervisorName}</span>
                      </div>
                    )}

                    {/* حالة المراجع في الخانة (فارغة / مسجل يدوياً / نموذج الإدخال اليدوي) */}
                    {patientEditingSlotId === slot.id ? (
                      <div
                        style={{
                          background: '#161d12',
                          border: '1.5px solid #f97316',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          marginTop: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '12px', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={13} color="#f97316" />
                            <span>تسجيل مراجع يدوياً لعيادة {slot.dayNameAr} ({slot.department})</span>
                          </strong>
                          <span style={{ fontSize: '10px', color: '#f97316', background: 'rgba(249,115,22,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            إدخال يدوي حصراً
                          </span>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                            اسم المراجع (يدوياً)*:
                          </label>
                          <input
                            type="text"
                            value={manualPatientName}
                            onChange={(e) => setManualPatientName(e.target.value)}
                            placeholder="أدخل اسم المراجع الفعلي يدويًا..."
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              background: '#12160f',
                              border: '1px solid #3b4a2e',
                              borderRadius: '6px',
                              color: '#fcfbfa',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                            autoFocus
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                              الإجراء السريري المخطط:
                            </label>
                            <input
                              type="text"
                              value={manualPatientProcedure}
                              onChange={(e) => setManualPatientProcedure(e.target.value)}
                              placeholder="مثال: حشوة كلاس II كومبوزيت"
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: '#12160f',
                                border: '1px solid #3b4a2e',
                                borderRadius: '6px',
                                color: '#fcfbfa',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
                              رقم الهاتف / الملف:
                            </label>
                            <input
                              type="text"
                              value={manualPatientContact}
                              onChange={(e) => setManualPatientContact(e.target.value)}
                              placeholder="مثال: 0780xxxxxxx"
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: '#12160f',
                                border: '1px solid #3b4a2e',
                                borderRadius: '6px',
                                color: '#fcfbfa',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleSaveSlotPatient(slot.id)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#151b12',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Save size={12} />
                            <span>حفظ المراجع في الخانة ✅</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditSlotPatient}
                            style={{
                              background: 'transparent',
                              color: '#a0a59a',
                              border: '1px solid #3b4a2e',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            إلغاء ✖️
                          </button>
                        </div>
                      </div>
                    ) : slot.assignedPatientName && slot.assignedPatientName.trim() ? (
                      <div
                        style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginTop: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <CheckCircle2 size={13} color="#10b981" />
                            <span>مراجع مسجل يدوياً: {slot.assignedPatientName}</span>
                            {isReturningPatient(slot.assignedPatientName, patientProfilesMap) && (
                              <button
                                type="button"
                                onClick={() => setTimelinePatientName(slot.assignedPatientName || null)}
                                style={{
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.25))',
                                  color: '#fef08a',
                                  border: '1px solid #f59e0b',
                                  borderRadius: '9999px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                                title="المراجع المميز - استعراض الملف السريري والزيارات السابقة"
                              >
                                ⭐ {isRTL ? 'مراجع مميز' : 'Featured'}
                              </button>
                            )}
                          </div>
                          {slot.patientProcedure && (
                            <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>
                              🦷 الإجراء: {slot.patientProcedure}
                            </div>
                          )}
                          {slot.patientContact && (
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                              📞 هاتف/ملف: {slot.patientContact}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setLoggerPreFill({
                                patientName: slot.assignedPatientName,
                                date: new Date().toISOString().split('T')[0],
                                procedure: slot.patientProcedure || '',
                                slotId: slot.id,
                              });
                              setActiveSubTab('case_logger');
                            }}
                            style={{
                              background: 'rgba(77, 106, 52, 0.3)',
                              color: '#86efac',
                              border: '1px solid #4d6a34',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 'bold',
                            }}
                            title="توثيق الإجراء السريري وإرفاق الصور والملاحظات"
                          >
                            <FileText size={11} />
                            <span>{isRTL ? 'توثيق' : 'Log'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditSlotPatient(slot)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#c5a059',
                              border: '1px solid #c5a059',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title="تعديل بيانات المراجع يدوياً"
                          >
                            <Edit2 size={11} />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearSlotPatient(slot.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title="تفريغ الخانة وحذف اسم المراجع"
                          >
                            <Trash2 size={11} />
                            <span>تفريغ</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(234, 88, 12, 0.12)',
                          border: '1px dashed #f97316',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginTop: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#fdba74', fontWeight: 'bold' }}>
                            <AlertTriangle size={13} color="#f97316" />
                            <span>⚠️ خانة فارغة في الجدول الأسبوعي (لا يوجد مراجع مسجل)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditSlotPatient(slot)}
                            style={{
                              background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                              color: '#151b12',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Plus size={11} />
                            <span>+ تسجيل مراجع يدوياً ✍️</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* القسم الفرعي الأول: مواعيدي ومتابعة الحالات السريرية */}
      {/* ============================================================== */}
      {activeSubTab === 'appointments' && (
        <div className="animate-fadeIn">
          {/* التنبيه الذكي المسبق */}
          <div
            id="smartAlertBox"
            style={{
              background: '#1c2317',
              borderRight: `4px solid ${alertColor}`,
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              textAlign: 'center',
              color: '#e8e6e1',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            <span id="alertText" dangerouslySetInnerHTML={{ __html: alertText }} />
          </div>

          {/* إدخال موعد جديد مع حفظ تلقائي للمسودة */}
          <div
            style={{
              background: '#1e251a',
              border: '1px solid rgba(197,160,89,0.25)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
            }}
          >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            id="patientName"
            type="text"
            value={newName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t('appts.patientName', 'اسم المراجع (البيشنت)...')}
            style={{
              flex: 1,
              padding: '9px 12px',
              background: '#12160f',
              border: '1px solid #3b4a2e',
              borderRadius: '8px',
              color: '#fcfbfa',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={setEmptySlot}
            style={{
              background: 'rgba(197,160,89,0.2)',
              color: '#c5a059',
              border: '1px solid #c5a059',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title={isRTL ? "تسجيل خانة شاغرة بدون مراجع" : "Reserve empty slot without patient"}
          >
            + {isRTL ? 'خانة فارغة' : 'Empty Slot'}
          </button>
        </div>

        <input
          id="patientDate"
          type="date"
          value={newDate}
          onChange={(e) => handleDateChange(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            background: '#12160f',
            border: '1px solid #3b4a2e',
            borderRadius: '8px',
            color: '#fcfbfa',
            fontSize: '13px',
            marginBottom: '10px',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        {/* تصنيف الحالة السريرية */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#c5a059', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
            🏷️ {isRTL ? 'تصنيف الحالة (اختر القسم):' : 'Case Category (Select Department):'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {CLINICAL_CATEGORIES.map((cat, catIdx) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={`${cat.id}_${catIdx}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: isSelected ? cat.color : cat.bgColor,
                    color: isSelected ? '#151b12' : '#fcfbfa',
                    border: `1.5px solid ${isSelected ? cat.color : cat.borderColor}`,
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{isRTL ? cat.nameAr : cat.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* رقم السن والإجراء */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
              {isRTL ? '🦷 رقم السن (Tooth #):' : '🦷 Tooth #:'}
            </label>
            <input
              type="text"
              value={caseToothNumber}
              onChange={(e) => setCaseToothNumber(e.target.value)}
              placeholder={isRTL ? "مثال: #16, #21" : "e.g. #16, #21"}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: '#12160f',
                border: '1px solid #3b4a2e',
                borderRadius: '6px',
                color: '#fcfbfa',
                fontSize: '12px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#a0a59a', display: 'block', marginBottom: '3px' }}>
              {isRTL ? '📝 الإجراء السريري:' : '📝 Clinical Procedure:'}
            </label>
            <input
              type="text"
              value={caseProcedure}
              onChange={(e) => setCaseProcedure(e.target.value)}
              placeholder={isRTL ? "مثال: Class II Composite" : "e.g. Class II Composite"}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: '#12160f',
                border: '1px solid #3b4a2e',
                borderRadius: '6px',
                color: '#fcfbfa',
                fontSize: '12px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* إرفاق صور الحالة السريرية (حفظ دائم وأرشفة) */}
        <div
          style={{
            background: '#12160f',
            border: '1px dashed #c5a059',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#c5a059', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Camera size={14} />
              <span>{isRTL ? 'إرفاق صور الحالة (تتأرشف مع الحالة طوال العام):' : 'Attach Case Photos (Archived Year-Round):'}</span>
            </label>
            <span style={{ fontSize: '10px', color: '#4ade80' }}>
              {isRTL ? `${newCasePhotos.length} صورة مضافة` : `${newCasePhotos.length} photos added`}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            <label
              style={{
                background: 'rgba(197,160,89,0.15)',
                border: '1px solid #c5a059',
                color: '#c5a059',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
              }}
            >
              <Plus size={12} />
              <span>{isRTL ? '+ قبل الشغل (Pre-op)' : '+ Pre-op Photo'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload(e, 'قبل الشغل (Pre-op)')}
              />
            </label>

            <label
              style={{
                background: 'rgba(56,189,248,0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
              }}
            >
              <Plus size={12} />
              <span>{isRTL ? '+ أثناء العمل (Working)' : '+ Working Photo'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload(e, 'أثناء العمل (Working)')}
              />
            </label>

            <label
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
              }}
            >
              <Plus size={12} />
              <span>{isRTL ? '+ بعد الإنهاء (Post-op)' : '+ Post-op Photo'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload(e, 'بعد الإنهاء (Post-op)')}
              />
            </label>

            <label
              style={{
                background: 'rgba(168,85,247,0.15)',
                border: '1px solid #a855f7',
                color: '#a855f7',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
              }}
            >
              <Plus size={12} />
              <span>{isRTL ? '+ أشعة X-Ray' : '+ X-Ray Photo'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload(e, 'صورة أشعة (X-Ray)')}
              />
            </label>
          </div>

          {isProcessingPhoto && (
            <div style={{ fontSize: '11px', color: '#c5a059', textAlign: 'center', padding: '6px' }}>
              {isRTL ? '⏳ جاري ضغط ومعالجة الصور وتجهيزها للحفظ...' : '⏳ Compressing and processing photos for archive...'}
            </div>
          )}

          {newCasePhotos.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
                gap: '6px',
                marginTop: '8px',
              }}
            >
              {newCasePhotos.map((photo, idx) => (
                <div
                  key={`${photo.id || 'photo'}_${idx}`}
                  style={{
                    position: 'relative',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid #c5a059',
                    aspectRatio: '1',
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'صورة'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setNewCasePhotos((prev) => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(239,68,68,0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={11} />
                  </button>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      fontSize: '8px',
                      padding: '1px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {photo.caption || 'صورة'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مؤشر حفظ المسودة التلقائي مع زر حذف خانة المراجع إذا ما تم الشغل */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: isDraftSaved ? '#4ade80' : '#a0a59a',
            marginBottom: '10px',
            padding: '0 2px',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isDraftSaved ? '#4ade80' : newName || newDate ? '#c5a059' : '#666',
              }}
            />
            {isDraftSaved
              ? (isRTL ? '💾 تم حفظ المسودة تلقائياً' : '💾 Draft Auto-Saved')
              : newName || newDate
              ? (isRTL ? 'حفظ تلقائي للمسودة أثناء الكتابة مفعل' : 'Auto-saving draft while typing')
              : (isRTL ? 'الحفظ التلقائي للمسودة نشط أثناء الكتابة' : 'Draft auto-save active')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(newName || newDate || newCasePhotos.length > 0) && (
              <button
                type="button"
                onClick={() => handleDeleteDraftPatientSlot()}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                title={isRTL ? "حذف خانة هذا المراجع وتفريغ البيانات في حال لم يتم إنجاز الشغل في العيادة" : "Delete slot and clear fields if not done"}
              >
                <Trash2 size={12} />
                <span>{isRTL ? 'حذف خانة المراجع (ما تم الشغل) ❌' : 'Delete Slot (Not Done) ❌'}</span>
              </button>
            )}
            {(newName || newDate || newCasePhotos.length > 0) && (
              <button
                type="button"
                onClick={clearDraftInputs}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0a59a',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '0',
                  textDecoration: 'underline',
                }}
              >
                {isRTL ? 'مسح الحقول' : 'Clear Fields'}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={addAppointment}
          style={{
            background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
            color: '#151b12',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(197,160,89,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>{isRTL ? 'حفظ الموعد وتفعيل التنبيه الذكي 🚀' : 'Save Appointment & Enable Alert 🚀'}</span>
        </button>
      </div>

      {/* قائمة المواعيد المجدولة القادمة */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '14px', color: '#c5a059', fontWeight: 'bold' }}>
            {isRTL ? '📋 المواعيد القادمة في العيادة' : '📋 Upcoming Clinic Appointments'}
          </h4>
          <span style={{ fontSize: '11px', color: '#a0a59a' }}>
            {isRTL ? `${activeAppointments.length} موعد مجدول` : `${activeAppointments.length} scheduled`}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeAppointments.length === 0 ? (
            <div
              style={{
                background: '#1a2016',
                border: '1px dashed rgba(197,160,89,0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#a0a59a',
              }}
            >
              {isRTL ? 'لا توجد مواعيد نشطة حالياً.' : 'No active appointments currently.'}
            </div>
          ) : (
            activeAppointments.map((a, idx) => {
              const isEditingThisAppt = editingApptId === a.id;

              if (isEditingThisAppt) {
                return (
                  <div
                    key={`${a.id}_${idx}`}
                    style={{
                      background: '#161c12',
                      border: '1.5px solid #c5a059',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#c5a059', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit3 size={14} />
                        <span>تعديل بيانات المراجع / البيشنت</span>
                      </strong>
                      <button
                        type="button"
                        onClick={handleCancelEditAppt}
                        style={{ background: 'none', border: 'none', color: '#a0a59a', cursor: 'pointer', fontSize: '11px' }}
                        title="إلغاء التعديل"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                          👤 اسم المراجع (البيشنت):
                        </label>
                        <input
                          type="text"
                          value={editApptName}
                          onChange={(e) => setEditApptName(e.target.value)}
                          placeholder="اسم المراجع..."
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#12160f',
                            border: '1px solid #3b4a2e',
                            borderRadius: '6px',
                            color: '#fcfbfa',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                          📅 تاريخ الموعد:
                        </label>
                        <input
                          type="date"
                          value={editApptDate}
                          onChange={(e) => setEditApptDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#12160f',
                            border: '1px solid #3b4a2e',
                            borderRadius: '6px',
                            color: '#fcfbfa',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                          🦷 رقم السن (Tooth #):
                        </label>
                        <input
                          type="text"
                          value={editApptTooth}
                          onChange={(e) => setEditApptTooth(e.target.value)}
                          placeholder="مثال: #16 أو #36"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#12160f',
                            border: '1px solid #3b4a2e',
                            borderRadius: '6px',
                            color: '#fcfbfa',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                          🏷️ القسم السريري:
                        </label>
                        <select
                          value={editApptCategory}
                          onChange={(e) => setEditApptCategory(e.target.value as ClinicalCategory)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#12160f',
                            border: '1px solid #3b4a2e',
                            borderRadius: '6px',
                            color: '#fcfbfa',
                            fontSize: '12px',
                          }}
                        >
                          {CLINICAL_CATEGORIES.map((c, cIdx) => (
                            <option key={`${c.id}_${cIdx}`} value={c.id}>
                              {c.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#a0a59a', display: 'block', marginBottom: '2px' }}>
                        📋 الإجراء المطلوب (Procedure / Requirement):
                      </label>
                      <input
                        type="text"
                        value={editApptProcedure}
                        onChange={(e) => setEditApptProcedure(e.target.value)}
                        placeholder="مثال: Class II Composite حشوة تجميلية..."
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          background: '#12160f',
                          border: '1px solid #3b4a2e',
                          borderRadius: '6px',
                          color: '#fcfbfa',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleSaveEditAppt}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #c5a059, #9e7e38)',
                          color: '#151b12',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={14} />
                        <span>حفظ التعديل ✅</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditAppt}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#a0a59a',
                          border: '1px solid #3b4a2e',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        إلغاء ✖️
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${a.id}_${idx}`}
                  className="fluid-card transition-all duration-200"
                  style={{
                    background: '#1e251a',
                    border: '1px solid rgba(197,160,89,0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fcfbfa', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{a.name}</span>
                      {isReturningPatient(a.name, patientProfilesMap) && (
                        <button
                          type="button"
                          onClick={() => setTimelinePatientName(a.name)}
                          style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.25))',
                            color: '#fef08a',
                            border: '1px solid #f59e0b',
                            borderRadius: '9999px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                          }}
                          title="عرض السجل السريري الكامل وتاريخ الجلسات السابقة للمراجع"
                        >
                          ⭐ {isRTL ? 'المراجع المميز' : 'Featured'}
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#c5a059',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Calendar size={12} />
                      <span>{a.date}</span>
                      {a.toothNumber && <span style={{ color: '#38bdf8' }}>| {isRTL ? 'السن:' : 'Tooth:'} {a.toothNumber}</span>}
                      {a.procedure && <span style={{ color: '#86efac' }}>| {a.procedure}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setLoggerPreFill({
                          patientName: a.name,
                          date: a.date,
                          toothNumber: a.toothNumber,
                          procedure: a.procedure,
                          category: a.category || 'fillings',
                          appointmentId: a.id,
                        });
                        setActiveSubTab('case_logger');
                      }}
                      style={{
                        background: 'rgba(77, 106, 52, 0.3)',
                        color: '#86efac',
                        border: '1px solid #4d6a34',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="توثيق الإجراء السريري وملاحظات الجلسة وإرفاق الصور"
                    >
                      <FileText size={12} />
                      <span>{isRTL ? 'توثيق' : 'Log'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditAppt(a)}
                      style={{
                        background: 'rgba(197, 160, 89, 0.2)',
                        color: '#c5a059',
                        border: '1px solid rgba(197, 160, 89, 0.4)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title={isRTL ? "تعديل بيانات هذا الموعد يدوياً" : "Edit appointment"}
                    >
                      <Edit3 size={12} />
                      <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArchive(a.id)}
                      style={{
                        background: '#c5a059',
                        color: '#151b12',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {isRTL ? 'أرشفة 📁' : 'Archive 📁'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraftPatientSlot(a.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title={isRTL ? "حذف خانة هذا المراجع في حال ما تم الشغل بالعيادة" : "Delete slot if not done"}
                    >
                      <Trash2 size={12} />
                      <span>{isRTL ? 'حذف (ما تم الشغل)' : 'Delete (Not Done)'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* أرشيف المراجعين المقسم والمبوّب (قلع، حشوات، أطقم، تنظيف...) مع الصور */}
      <div
        style={{
          background: '#1a2016',
          border: '1px solid rgba(197,160,89,0.3)',
          borderRadius: '12px',
          padding: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Archive size={16} color="#c5a059" />
            <h4 style={{ margin: 0, fontSize: '13px', color: '#c5a059', fontWeight: 'bold' }}>
              {isRTL ? 'الأرشيف السريري للحالات والصور:' : 'Clinical Archive & Case Photos:'}
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#a0a59a' }}>
              {isRTL ? `${archivedAppointments.length} حالة مؤرشفة` : `${archivedAppointments.length} archived cases`}
            </span>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #c5a059, #8b6e2f)',
                border: 'none',
                color: '#151b12',
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 900,
                boxShadow: '0 2px 6px rgba(197,160,89,0.35)',
              }}
              title={isRTL ? "توليد تقرير الإنجاز السريري السنوي المعتمد وتصديره كـ PDF" : "Generate official clinical achievement report (PDF)"}
            >
              <Printer size={12} />
              <span>{t('appts.pdfReport', 'تقرير الإنجاز (PDF) 📄', 'Achievement Report (PDF) 📄')}</span>
            </button>
            <button
              type="button"
              onClick={() => exportClinicalCasesBackup()}
              style={{
                background: 'rgba(56,189,248,0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '3px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
              }}
              title={isRTL ? "تصدير كافة الحالات والصور كملف لحفظها طوال العام" : "Export backup copy of all cases and photos"}
            >
              <Download size={11} />
              <span>{isRTL ? 'تصدير نسخة 📥' : 'Export Backup 📥'}</span>
            </button>
            {archivedAppointments.length > 0 && (
              <button
                type="button"
                onClick={clearArchivedAppointments}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid #ef4444',
                  padding: '2px 8px',
                  fontSize: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {isRTL ? 'إفراغ الأرشيف' : 'Clear Archive'}
              </button>
            )}
          </div>
        </div>

        {/* أزرار تقسيم الحالات المؤرشفة (قلع، حشوات، أطقم، تنظيف، إلخ) */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '5px',
            paddingBottom: '8px',
            marginBottom: '10px',
            scrollbarWidth: 'thin',
          }}
        >
          <button
            type="button"
            onClick={() => setArchiveCategoryFilter('all')}
            style={{
              background: archiveCategoryFilter === 'all' ? '#c5a059' : '#1e251a',
              color: archiveCategoryFilter === 'all' ? '#151b12' : '#fcfbfa',
              border: `1px solid ${archiveCategoryFilter === 'all' ? '#c5a059' : 'rgba(197,160,89,0.3)'}`,
              borderRadius: '20px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            🌟 {isRTL ? 'الكل' : 'All'} ({archiveCategoryCounts.all || 0})
          </button>
          {CLINICAL_CATEGORIES.map((cat, catIdx) => {
            const count = archiveCategoryCounts[cat.id] || 0;
            const isActive = archiveCategoryFilter === cat.id;
            return (
              <button
                key={`${cat.id}_${catIdx}`}
                type="button"
                onClick={() => setArchiveCategoryFilter(cat.id)}
                style={{
                  background: isActive ? cat.color : cat.bgColor,
                  color: isActive ? '#151b12' : '#fcfbfa',
                  border: `1px solid ${isActive ? cat.color : cat.borderColor}`,
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{cat.icon}</span>
                <span>{isRTL ? cat.nameAr : cat.nameEn}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    fontSize: '9px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* شريط البحث في الأرشيف */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            type="text"
            value={archiveSearchQuery}
            onChange={(e) => setArchiveSearchQuery(e.target.value)}
            placeholder={isRTL ? "🔍 ابحث في الحالات المؤرشفة..." : "🔍 Search archived cases..."}
            style={{
              width: '100%',
              padding: '7px 28px 7px 10px',
              background: '#12160f',
              border: '1px solid rgba(197,160,89,0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'white',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          {archiveSearchQuery && (
            <button
              type="button"
              onClick={() => setArchiveSearchQuery('')}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#a0a59a',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* قائمة الحالات المؤرشفة مع الصور */}
        <div
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filteredArchivedAppointments.length === 0 ? (
            <p style={{ margin: 0, fontSize: '11px', color: '#a0a59a', textAlign: 'center', padding: '10px' }}>
              {isRTL ? 'لا توجد حالات مؤرشفة مطابقة لهذا التصنيف أو البحث.' : 'No archived cases match this category or search.'}
            </p>
          ) : (
            filteredArchivedAppointments.map((a, idx) => {
              const catMeta = CLINICAL_CATEGORIES.find((c) => c.id === a.category) || {
                id: 'other',
                nameAr: 'أخرى',
                nameEn: 'Other',
                icon: '📋',
                color: '#94a3b8',
                bgColor: 'rgba(148,163,184,0.15)',
                borderColor: 'rgba(148,163,184,0.3)',
              };

              const casePhotos = a.photos || [];

              return (
                <div
                  key={`${a.id}_${idx}`}
                  style={{
                    background: '#151b12',
                    border: `1px solid ${catMeta.borderColor}`,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span
                          style={{
                            background: catMeta.bgColor,
                            color: catMeta.color,
                            border: `1px solid ${catMeta.borderColor}`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>{catMeta.icon}</span>
                          <span>{isRTL ? catMeta.nameAr : catMeta.nameEn}</span>
                        </span>
                        <strong style={{ color: '#fcfbfa' }}>{a.name}</strong>
                        {isReturningPatient(a.name, patientProfilesMap) && (
                          <button
                            type="button"
                            onClick={() => setTimelinePatientName(a.name)}
                            style={{
                              background: 'rgba(245, 158, 11, 0.25)',
                              color: '#fef08a',
                              border: '1px solid #f59e0b',
                              borderRadius: '9999px',
                              padding: '1px 6px',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                            title="عرض السجل السريري الشامل"
                          >
                            ⭐ {isRTL ? 'مراجع مميز' : 'Featured'}
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#c5a059', display: 'flex', gap: '6px' }}>
                        <span>📅 {a.date}</span>
                        {a.toothNumber && <span style={{ color: '#38bdf8' }}>| {isRTL ? 'السن:' : 'Tooth:'} {a.toothNumber}</span>}
                        {a.procedure && <span style={{ color: '#86efac' }}>| {a.procedure}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setLoggerPreFill({
                            patientName: a.name,
                            date: a.date,
                            toothNumber: a.toothNumber,
                            procedure: a.procedure,
                            category: a.category || 'fillings',
                            appointmentId: a.id,
                          });
                          setActiveSubTab('case_logger');
                        }}
                        style={{
                          background: 'rgba(77, 106, 52, 0.3)',
                          color: '#86efac',
                          border: '1px solid #4d6a34',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title="توثيق جلسة جديدة أو ملاحظات للحالة"
                      >
                        <FileText size={11} />
                        <span>{isRTL ? 'توثيق' : 'Log'}</span>
                      </button>
                      <button
                        onClick={() => toggleArchive(a.id)}
                        style={{
                          background: '#2e7d32',
                          color: 'white',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                        title={isRTL ? "استعادة الموعد كنشط" : "Restore appointment as active"}
                      >
                        {isRTL ? 'استعادة' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDeleteDraftPatientSlot(a.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title={isRTL ? "حذف خانة هذا المراجع نهائياً" : "Delete slot permanently"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* صور الحالة المؤرشفة */}
                  {casePhotos.length > 0 && (
                    <div style={{ marginTop: '6px', borderTop: '1px dashed rgba(197,160,89,0.2)', paddingTop: '6px' }}>
                      <div style={{ fontSize: '10px', color: '#a0a59a', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🖼️ {isRTL ? 'صور الحالة السريرية' : 'Clinical Photos'} ({casePhotos.length}):</span>
                        <span style={{ color: '#c5a059' }}>{isRTL ? 'انقر للتكبير 🔍' : 'Click to zoom 🔍'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '3px' }}>
                        {casePhotos.map((photo, pIdx) => (
                          <div
                            key={`${photo.id || 'photo'}_${pIdx}`}
                            onClick={() =>
                              setActiveLightboxPhoto({
                                url: photo.url,
                                caption: photo.caption,
                                patientName: a.name,
                                caseDate: a.date,
                                categoryName: catMeta.nameAr,
                              })
                            }
                            style={{
                              position: 'relative',
                              width: '54px',
                              height: '54px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #c5a059',
                              flexShrink: 0,
                              cursor: 'pointer',
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || 'صورة'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {photo.caption && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#fff',
                                  fontSize: '7px',
                                  padding: '1px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {photo.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* زر إضافة صور للحالة */}
                  <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
                    <label
                      style={{
                        background: 'rgba(197,160,89,0.12)',
                        border: '1px solid rgba(197,160,89,0.4)',
                        color: '#c5a059',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 'bold',
                      }}
                    >
                      <Camera size={11} />
                      <span>+ إضافة صورة للحالة</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleAddPhotoToExistingAppointment(a, e)}
                      />
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>
      )}

      {/* عارض الصور عالي الدقة (Lightbox Modal) */}
      {activeLightboxPhoto && (
        <div
          onClick={() => setActiveLightboxPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '85vh',
              background: '#151b12',
              border: '2px solid #c5a059',
              borderRadius: '14px',
              padding: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                borderBottom: '1px solid rgba(197,160,89,0.3)',
                paddingBottom: '8px',
              }}
            >
              <div>
                <h5 style={{ margin: 0, color: '#c5a059', fontSize: '14px', fontWeight: 'bold' }}>
                  {activeLightboxPhoto.patientName} - {activeLightboxPhoto.categoryName}
                </h5>
                <span style={{ fontSize: '11px', color: '#a0a59a' }}>
                  {activeLightboxPhoto.caption} | {activeLightboxPhoto.caseDate}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={activeLightboxPhoto.url}
                  download={`Case_${activeLightboxPhoto.patientName}_${Date.now()}.jpg`}
                  style={{
                    background: '#c5a059',
                    color: '#151b12',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={12} />
                  <span>تحميل</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveLightboxPhoto(null)}
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    color: '#f87171',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  إغلاق ✕
                </button>
              </div>
            </div>

            <img
              src={activeLightboxPhoto.url}
              alt={activeLightboxPhoto.caption || 'صورة الحالة'}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}

      {/* مودال توليد تقرير الإنجاز السريري السنوي وتصدير PDF */}
      <ClinicalReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        isAuthorAdmin={isAuthorAdmin}
      />

      {/* مودال مشاركة التطبيق ورابط التثبيت PWA والمزامنة */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* مودال الخط الزمني الشامل للمراجع وتاريخ الجلسات السابقة (المراجع المميز) */}
      <PatientCaseTimelineModal
        isOpen={Boolean(timelinePatientName)}
        onClose={() => setTimelinePatientName(null)}
        profile={activeTimelineProfile}
        onAddNewSession={(name) => {
          setLoggerPreFill({ patientName: name });
          setActiveSubTab('case_logger');
        }}
        onScheduleAppointment={(name) => {
          setNewName(name);
          setActiveSubTab('appointments');
        }}
      />
    </div>
  );
};
