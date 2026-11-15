import React, { useState } from 'react';
import { SLIDES_DATA, SlideData } from '../data/slidesData';
import { RestorationClass, PRESET_CLASSES } from '../data/classesData';
import { PATIENT_COMMUNICATION_GUIDE } from '../data/patientCommunicationGuideData';
import {
  SMART_CLINIC_TRAY_STEPS,
  SMART_CLINIC_TRAY_PROTOCOL_INFO,
  TrayProtocolStep,
} from '../data/smartClinicTrayProtocolData';
import {
  DIRECT_PULP_CAPPING_SLIDES,
  DIRECT_PULP_CAPPING_INFO,
  PulpCappingSlide,
} from '../data/directPulpCappingProtocolData';
import { triggerControlledPrint, getWatermarkData } from '../data/printSecurity';
import { SecurePrintWatermark } from './SecurePrintWatermark';
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Send,
  BookOpen,
  Wrench,
  ShieldCheck,
  FileText,
  Layers,
  GraduationCap,
  HeartHandshake,
  Brain,
  Award,
  Stethoscope
} from 'lucide-react';

interface CheatSheetViewProps {
  activeClass?: RestorationClass;
  slides?: SlideData[];
  allClasses?: RestorationClass[];
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({
  activeClass,
  slides = SLIDES_DATA,
  allClasses = PRESET_CLASSES,
}) => {
  // 'single': print just this class; 'all': print combined atlas of all classes; 'patient_guide': print patient communication guide; 'tray_protocol': print smart clinic tray protocol; 'pulp_capping': print direct pulp capping protocol
  const [printMode, setPrintMode] = useState<'single' | 'all' | 'patient_guide' | 'tray_protocol' | 'pulp_capping'>('single');
  const [trayStepPrintOption, setTrayStepPrintOption] = useState<'all' | number>('all');
  const [pulpCappingSlideOption, setPulpCappingSlideOption] = useState<'all' | number>('all');

  const handlePrint = () => {
    triggerControlledPrint();
  };

  const activeSlides = slides && slides.length > 0 ? slides : SLIDES_DATA;
  const currentClassObj = activeClass || allClasses[0];

  const renderSingleClassContent = (classItem: RestorationClass, isPartOfAtlas: boolean = false, itemIdx: number = 0) => {
    const classSlides = classItem.slides || [];
    const coverSlide = classSlides.find((s) => s.type === 'cover') || classSlides[0];
    const stepSlides = classSlides.filter((s) => s.type === 'steps' || s.type === 'detail');
    const outroSlide = classSlides.find((s) => s.type === 'outro') || classSlides[classSlides.length - 1];

    if (!coverSlide) return null;

    return (
      <div
        key={`cheat_class_${classItem.id}_${itemIdx}`}
        className={`bg-white p-6 sm:p-10 rounded-2xl border border-[#E5DEC9] shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none ${
          isPartOfAtlas ? 'print:break-after-page mb-12' : ''
        }`}
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#596628] pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-white bg-[#596628] px-3 py-1 rounded-full uppercase tracking-wider">
                {classItem.code} Clinical Protocol
              </span>
              <span className="text-xs font-bold text-[#596628]">
                {classItem.badge}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2F2B24]">
              {coverSlide.title}
            </h1>
            <p className="text-sm text-[#666052] mt-1 font-medium">
              {coverSlide.subtitle || coverSlide.clinicalFocus}
            </p>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E5DEC9] px-4 py-3 rounded-xl text-left rtl:text-right shrink-0">
            <span className="text-xs font-bold text-[#596628] block">إعداد وتقديم:</span>
            <span className="text-sm font-black text-[#2F2B24] block">
              {coverSlide.author?.name || 'حياه نافع فجر'}
            </span>
            <span className="text-xs text-[#6B6557]">
              {coverSlide.author?.role || 'مرحلة رابعة'} — {coverSlide.author?.university || 'جامعة المعارف'}
            </span>
          </div>
        </div>

        {/* Dynamic Steps Section */}
        <div className="space-y-6">
          {stepSlides.map((slide, sIdx) => (
            <div
              key={slide.id || sIdx}
              className={`p-5 rounded-2xl border ${
                sIdx % 2 === 0 ? 'bg-[#FAF7F2] border-[#E5DEC9]' : 'bg-white border-[#E5DEC9]'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl bg-[#596628] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {slide.slideNumber}
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#2F2B24]">{slide.title}</h3>
                  {slide.subtitle && (
                    <span className="text-xs text-[#706A5B] block">{slide.subtitle}</span>
                  )}
                </div>
              </div>

              {slide.steps && slide.steps.length > 0 && (
                <div
                  className={`grid gap-4 pt-1 ${
                    slide.steps.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {slide.steps.map((st, stepIdx) => (
                    <div key={`cs_step_${slide.slideNumber || 0}_${st.stepNumber || stepIdx}_${stepIdx}`} className="space-y-2 text-xs bg-white/80 p-4 rounded-xl border border-[#EAE3D2]">
                      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-1.5">
                        <span className="font-extrabold text-[#596628]">{st.stepNumber}</span>
                        <span className="font-bold text-[#2F2B24]">{st.title}</span>
                      </div>

                      <p className="text-[#554F42] leading-relaxed">{st.description}</p>

                      <ul className="space-y-1.5 pt-1">
                        {st.points.map((p, pIdx) => (
                          <li key={`cs_pt_${stepIdx}_${pIdx}`} className="flex items-start gap-1.5 text-[#3D372C]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#596628] shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>

                      {st.warning && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-[11px] flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{st.warning}</span>
                        </div>
                      )}

                      {st.tips && (
                        <div className="mt-2 p-2 bg-[#F6F9EE] border border-[#DCE8BF] text-[#364214] rounded-lg text-[11px] flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#596628] shrink-0 mt-0.5" />
                          <span><strong>توجيه سريري: </strong>{st.tips}</span>
                        </div>
                      )}

                      {st.instruments && st.instruments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#EAE3D2] flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-bold text-[#756E61] ml-1 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-[#596628]" /> الأدوات:
                          </span>
                          {st.instruments.map((ins, iIdx) => (
                            <span
                              key={`cs_ins_${ins}_${iIdx}`}
                              className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DEC9] text-[10px] font-medium text-[#464034]"
                            >
                              {ins}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer & Telegram Box - Clean, NO paid course marketing */}
        <div className="pt-6 border-t-2 border-[#596628] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#596628]" />
            <span className="font-bold text-sm text-[#2F2B24]">
              {outroSlide?.title || `${classItem.code} Restorations`} — دقة وجمالية وديمومة سريرية
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#FAF7F2] px-4 py-2.5 rounded-xl border border-[#E5DEC9]">
            <Send className="w-4 h-4 text-[#596628]" />
            <span className="font-semibold text-[#544E41]">للتواصل الأكاديمي والاستفسارات السريرية:</span>
            <span className="text-[#596628] font-black">t.me/hay_a_2</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPatientGuideContent = () => {
    return (
      <div className="space-y-8">
        {/* Cover Page */}
        <div className="bg-[#FAF7F2] border-2 border-[#596628] p-8 sm:p-12 rounded-3xl text-center space-y-4 print:break-after-page">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#596628] text-white text-xs font-black">
            <GraduationCap className="w-4 h-4" />
            <span>جامعة المعارف — كلية طب الأسنان</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2F2B24]">
            دليل التعامل الصحيح مع المراجعين وبناء الثقة
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#596628]">
            من أول سؤال بـ الـ History إلى تسليم الحالة بتميز بدون توتر (18 شريحة سريرية)
          </p>
          <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-[#E5DEC9] text-xs space-y-1">
            <span className="text-[#807A6D] block">إعداد وتنسيق:</span>
            <span className="text-base font-black text-[#2F2B24] block">د. حياه نافع فجر</span>
            <span className="text-[#596628] font-bold block">مرحلة رابعة — جامعة المعارف (سيكولوجية طب الأسنان)</span>
            <span className="text-[#807A6D] block mt-1">معرف التليجرام: t.me/hay_a_2 | إنستغرام: @hay_a_2</span>
          </div>
        </div>

        {/* 18 Slides Rendered Sequentially for Print */}
        {PATIENT_COMMUNICATION_GUIDE.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DEC9] shadow-xs space-y-6 print:p-0 print:border-none print:shadow-none print:break-inside-avoid print:break-after-page"
          >
            {/* Slide Header */}
            <div className="border-b-2 border-[#596628] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white bg-[#596628] px-3 py-0.5 rounded-full">
                    شريحة {slide.slideNumber} من 18
                  </span>
                  <span className="text-xs font-bold text-[#596628]">{slide.badge}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24]">{slide.title}</h2>
                <p className="text-xs sm:text-sm text-[#666052] font-semibold mt-0.5">{slide.subtitle}</p>
              </div>

              <span className="text-xs font-black text-[#807A6D] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#E5DEC9] shrink-0">
                {slide.axisTitle}
              </span>
            </div>

            {/* Lead Paragraph */}
            {slide.leadParagraph && (
              <div className="p-4 rounded-xl bg-[#FAF7F2] border-r-4 border-r-[#596628] border border-[#E5DEC9] text-xs sm:text-sm text-[#443E33] leading-relaxed font-medium">
                {slide.leadParagraph}
              </div>
            )}

            {/* Content Blocks */}
            <div className="space-y-4">
              {slide.contentBlocks.map((block, bIdx) => {
                if (block.type === 'quote') {
                  return (
                    <div
                      key={`cs_quote_${slide.slideNumber || 'sl'}_${bIdx}`}
                      className="p-4 rounded-xl bg-amber-50/70 border-r-4 border-amber-500 border border-amber-200 space-y-1.5"
                    >
                      {block.title && (
                        <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{block.title}</span>
                        </div>
                      )}
                      <p className="text-sm sm:text-base font-black text-[#2F2B24] leading-snug">
                        {block.text}
                      </p>
                      {block.highlight && (
                        <p className="text-xs text-[#615A4C] font-medium pt-1">
                          {block.highlight}
                        </p>
                      )}
                    </div>
                  );
                }

                if (block.type === 'study') {
                  return (
                    <div
                      key={`cs_study_${slide.slideNumber || 'sl'}_${bIdx}`}
                      className="p-4 rounded-xl bg-blue-50/70 border-2 border-blue-200 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>{block.title || 'دراسة سريرية موثقة'}</span>
                      </div>
                      <p className="text-xs text-[#303848] font-semibold leading-relaxed">
                        {block.text}
                      </p>
                    </div>
                  );
                }

                if (block.type === 'steps' && block.items) {
                  return (
                    <div key={`cs_steps_${slide.slideNumber || 'sl'}_${bIdx}`} className="space-y-2.5">
                      {block.title && (
                        <h3 className="text-xs sm:text-sm font-black text-[#2F2B24] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#596628]" />
                          <span>{block.title}</span>
                        </h3>
                      )}
                      <div className="grid grid-cols-1 gap-2.5">
                        {block.items.map((item, itemIdx) => (
                          <div
                            key={`cs_item_${bIdx}_${itemIdx}`}
                            className="p-3.5 rounded-xl bg-white border border-[#E5DEC9] space-y-1.5"
                          >
                            {item.title && (
                              <h4 className="text-xs sm:text-sm font-black text-[#2F2B24] flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-[#596628]/15 text-[#596628] text-xs font-black flex items-center justify-center shrink-0">
                                  {itemIdx + 1}
                                </span>
                                <span>{item.title}</span>
                              </h4>
                            )}
                            {item.quote && (
                              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                                {item.quote}
                              </div>
                            )}
                            {item.desc && (
                              <p className="text-xs text-[#4E483B] leading-relaxed font-medium">
                                {item.desc}
                              </p>
                            )}
                            {item.behavioralAnalysis && (
                              <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E5DEC9] text-[11px] text-[#596628] font-bold">
                                {item.behavioralAnalysis}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'case_story') {
                  return (
                    <div
                      key={`cs_case_${slide.slideNumber || 'sl'}_${bIdx}`}
                      className="p-4 rounded-xl bg-amber-50/50 border-2 border-amber-300 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                        <Stethoscope className="w-4 h-4 text-amber-600" />
                        <span>{block.title || 'تحري الحالة السريرية'}</span>
                      </div>
                      <p className="text-xs text-[#3E382C] leading-relaxed whitespace-pre-line font-medium">
                        {block.text}
                      </p>
                    </div>
                  );
                }

                if (block.type === 'card_grid' && block.items) {
                  return (
                    <div key={`cs_grid_${slide.slideNumber || 'sl'}_${bIdx}`} className="space-y-2">
                      {block.title && (
                        <h3 className="text-xs font-black text-[#2F2B24]">{block.title}</h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {block.items.map((item, cIdx) => (
                          <div
                            key={`cs_grid_item_${bIdx}_${cIdx}`}
                            className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] space-y-1"
                          >
                            <h4 className="text-xs font-black text-[#2F2B24]">{item.title}</h4>
                            <p className="text-[11px] text-[#5D574A] leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'tips' || block.type === 'protocol') {
                  return (
                    <div
                      key={`cs_tips_${slide.slideNumber || 'sl'}_${bIdx}`}
                      className="p-3.5 rounded-xl bg-[#596628]/10 border border-[#596628]/30 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-[#596628] font-black text-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span>{block.title || 'إرشاد سريري ذهبي'}</span>
                      </div>
                      <p className="text-xs text-[#373329] leading-relaxed whitespace-pre-line font-medium">
                        {block.text}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Author note */}
            {slide.authorNote && (
              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-xs text-[#7B7567]">
                <span className="font-bold">{slide.authorNote}</span>
                <span className="text-[11px]">سيكولوجية طب الأسنان | جامعة المعارف</span>
              </div>
            )}
          </div>
        ))}

        {/* Footer info for print */}
        <div className="pt-6 border-t-2 border-[#596628] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#596628]" />
            <span className="font-bold text-sm text-[#2F2B24]">
              دليل التعامل الصحيح مع المراجعين — د. حياه نافع فجر
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#FAF7F2] px-4 py-2 rounded-xl border border-[#E5DEC9]">
            <Send className="w-4 h-4 text-[#596628]" />
            <span>للتواصل الأكاديمي: t.me/hay_a_2 | @hay_a_2</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrayProtocolContent = (stepOption: 'all' | number) => {
    const stepsToRender =
      stepOption === 'all'
        ? SMART_CLINIC_TRAY_STEPS
        : SMART_CLINIC_TRAY_STEPS.filter((s) => s.stepNumber === stepOption);

    return (
      <div className="space-y-8">
        {/* Document Top Header for Print */}
        <div className="bg-[#FAF7F2] border-2 border-[#596628] p-6 sm:p-10 rounded-3xl space-y-4 print:break-after-page">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#D8CEBA]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#596628] text-white">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <span className="text-xs font-black text-[#596628] block">
                  جامعة المعارف — كلية طب الأسنان | العيادات التعليمية السريرية
                </span>
                <span className="text-[11px] text-[#736C5F] font-mono">
                  Smart Dental Clinic Trainee Protocols & Clinical Tray Architecture
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-[#596628] font-black">
              <span>إشراف وتدقيق: د. حياة نافع فجر</span>
            </div>
          </div>

          <div className="text-center space-y-2 py-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24]">
              {SMART_CLINIC_TRAY_PROTOCOL_INFO.title}
            </h1>
            <p className="text-sm font-bold text-[#596628] font-mono">
              {SMART_CLINIC_TRAY_PROTOCOL_INFO.titleEn}
            </p>
            <p className="text-xs text-[#706A5C] max-w-2xl mx-auto leading-relaxed">
              {SMART_CLINIC_TRAY_PROTOCOL_INFO.objective}
            </p>
          </div>

          {/* The Golden Note Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#D4AF37]/20 to-amber-500/15 border-2 border-[#D4AF37] text-neutral-900 text-xs sm:text-sm font-bold space-y-1">
            <div className="flex items-center gap-2 text-[#596628] font-black">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.title}:</span>
            </div>
            <p className="text-neutral-800 leading-relaxed font-semibold">
              {SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.text}
            </p>
            <p className="text-[11px] font-mono text-neutral-600 mt-1">
              {SMART_CLINIC_TRAY_PROTOCOL_INFO.goldenNote.textEn}
            </p>
          </div>
        </div>

        {/* Step Cards */}
        {stepsToRender.map((step, stIdx) => (
          <div
            key={`step_${step.stepNumber}_${stIdx}`}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DEC9] shadow-xs space-y-6 print:p-0 print:border-none print:shadow-none print:break-inside-avoid print:break-after-page"
          >
            {/* Step Header */}
            <div className="border-b-2 border-[#596628] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white bg-[#596628] px-3 py-1 rounded-full uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-500">
                    {step.titleEn}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2F2B24]">
                  {step.title}
                </h2>
                <p className="text-xs text-[#706A5C] font-semibold mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs font-mono font-bold text-[#596628] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DEC9]">
                الخطوة {step.stepNumber} من 7
              </div>
            </div>

            {/* Key Tools Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#596628] flex items-center gap-2 uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>أدوات ومواد الصينية لهذه المرحلة (Tray Instruments & Materials):</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse border border-[#E5DEC9]">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#2F2B24] font-black border-b border-[#E5DEC9]">
                      <th className="p-2.5 border-r border-[#E5DEC9]">الأداة / المادة</th>
                      <th className="p-2.5 border-r border-[#E5DEC9]">الاسم بالإنجليزية</th>
                      <th className="p-2.5 border-r border-[#E5DEC9]">الوظيفة والهدف السريري</th>
                      <th className="p-2.5 text-center">النوع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {step.keyTools.map((t, idx) => (
                      <tr key={`tool_${step.stepNumber}_${t.name}_${idx}`} className="border-b border-[#E5DEC9] hover:bg-neutral-50">
                        <td className="p-2.5 font-bold border-r border-[#E5DEC9]">{t.name}</td>
                        <td className="p-2.5 font-mono text-neutral-600 border-r border-[#E5DEC9]">{t.nameEn}</td>
                        <td className="p-2.5 text-neutral-700 border-r border-[#E5DEC9]">{t.purpose}</td>
                        <td className="p-2.5 text-center">
                          {t.isSharp ? (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                              حادة ⚠️
                            </span>
                          ) : t.isDisposable ? (
                            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                              استخدام واحد
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              معقمة
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Workflow Actions */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#596628] flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>خطوات التنفيذ السريري الدقيقة (Clinical Workflow Actions):</span>
              </h3>

              <div className="space-y-2">
                {step.clinicalActions.map((act, actIdx) => (
                  <div
                    key={`act_${step.stepNumber}_${actIdx}`}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#2F2B24] leading-relaxed flex items-start gap-2.5 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#596628] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {actIdx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pearls & Warnings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                <span className="font-black text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>اللمسات السريرية المتقدمة (Clinical Pearls):</span>
                </span>
                <ul className="space-y-1 text-amber-800 leading-relaxed pr-2">
                  {step.clinicalPearls.map((p, pIdx) => (
                    <li key={`pearl_${step.stepNumber}_${pIdx}`}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                <span className="font-black text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>محاذير سريرية لتجنب الفشل والمخاطر:</span>
                </span>
                <ul className="space-y-1 text-rose-800 leading-relaxed pr-2">
                  {step.hazardWarnings.map((w, wIdx) => (
                    <li key={`hazard_${step.stepNumber}_${wIdx}`}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disposable items for this step */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs flex items-center justify-between gap-3">
              <span className="font-bold text-neutral-700">
                المستهلكات الواجب استبدالها/فرزها في هذه الخطوة:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {step.disposableItems.map((disp, dIdx) => (
                  <span
                    key={`disp_${step.stepNumber}_${disp}_${dIdx}`}
                    className="px-2 py-0.5 rounded-full bg-white border border-neutral-300 text-[10px] font-semibold text-neutral-800"
                  >
                    {disp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Verification Sign-Off Footer for Print */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#596628] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-[#2F2B24] print:break-inside-avoid">
          <div className="space-y-1">
            <span className="text-[#736C5F] block">اسم الطالب المتدرب:</span>
            <div className="border-b border-dashed border-[#596628] pt-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[#736C5F] block">توقيع وملاحظة المشرف السريري:</span>
            <div className="border-b border-dashed border-[#596628] pt-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[#736C5F] block">ختم العيادة السريرية المعتمد:</span>
            <div className="border-b border-dashed border-[#596628] pt-4" />
          </div>
        </div>
      </div>
    );
  };

  const renderPulpCappingContent = (slideOption: 'all' | number = 'all') => {
    const displayedSlides =
      slideOption === 'all'
        ? DIRECT_PULP_CAPPING_SLIDES
        : DIRECT_PULP_CAPPING_SLIDES.filter((s) => s.slideNumber === slideOption);

    return (
      <div className="space-y-8" dir="rtl">
        {/* Document Top Header for Print */}
        <div className="bg-[#FAF7F2] border-2 border-[#0D9488] p-6 sm:p-10 rounded-3xl space-y-4 print:break-after-page">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#D8CEBA]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#0D9488] text-white">
                <ShieldCheck className="w-5 h-5 text-teal-200" />
              </span>
              <div>
                <span className="text-xs font-black text-[#0D9488] block">
                  جامعة المعارف — كلية طب الأسنان | العيادات التعليمية السريرية
                </span>
                <span className="text-[11px] text-[#736C5F] font-mono">
                  Vital Pulp Therapy Protocols • Direct Pulp Capping (MTA & GIC)
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-[#0D9488] font-black">
              <span>إشراف وتدقيق: د. حياة نافع فجر</span>
            </div>
          </div>

          <div className="text-center space-y-2 py-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2F2B24]">
              {DIRECT_PULP_CAPPING_INFO.title}
            </h1>
            <p className="text-sm font-bold text-[#0D9488] font-mono">
              {DIRECT_PULP_CAPPING_INFO.titleEn}
            </p>
            <p className="text-xs text-[#706A5C] max-w-2xl mx-auto leading-relaxed">
              {DIRECT_PULP_CAPPING_INFO.objective}
            </p>
          </div>

          {/* Golden Rule Banner */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border-2 border-[#0D9488] text-neutral-900 text-xs sm:text-sm font-bold space-y-1">
            <div className="flex items-center gap-2 text-[#0D9488] font-black">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>القاعدة السريرية الذهبية (The Golden Rule):</span>
            </div>
            <p className="text-neutral-800 leading-relaxed font-semibold">
              {DIRECT_PULP_CAPPING_INFO.goldenRule}
            </p>
          </div>
        </div>

        {/* Slides rendering */}
        {displayedSlides.map((slide, sIdx) => (
          <div
            key={`slide_${slide.slideNumber}_${sIdx}`}
            className="bg-white border-2 border-[#E5DEC9] p-6 sm:p-8 rounded-3xl space-y-6 print:break-after-page shadow-sm"
          >
            {/* Slide Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0D9488] text-white text-xs font-black">
                    المرحلة {slide.slideNumber}
                  </span>
                  <span className="text-xs font-mono text-[#736C5F]">
                    {slide.phaseTitleEn}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#2F2B24] mt-1.5">
                  {slide.phaseTitle}
                </h2>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
                {slide.badge}
              </span>
            </div>

            {/* Clinical Execution Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#0D9488] flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{slide.clinicalStep.title}</span>
              </h3>

              <div className="space-y-2">
                {slide.clinicalStep.points.map((pt, ptIdx) => (
                  <div
                    key={`pulp_pt_${slide.slideNumber}_${ptIdx}`}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#2F2B24] leading-relaxed flex items-start gap-2.5 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {ptIdx + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Rationale */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#0D9488] flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{slide.scientificRationale.title}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slide.scientificRationale.points.map((rat, rIdx) => (
                  <div
                    key={`pulp_rat_${slide.slideNumber}_${rIdx}`}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                      rat.isWarning
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-neutral-800'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1.5 text-xs">
                      {rat.isWarning ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{rat.heading}</span>
                    </div>
                    <p className="text-[11px] text-neutral-700 font-normal leading-relaxed">
                      {rat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Box (if any) */}
            {slide.warningBox && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                  slide.warningBox.severity === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block">{slide.warningBox.title}</span>
                  <p className="text-[11px] mt-0.5">{slide.warningBox.text}</p>
                </div>
              </div>
            )}

            {/* Key Instruments Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#0D9488] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0D9488]" />
                <span>الأدوات والمواد السريرية لهذه المرحلة:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {slide.keyInstruments.map((inst, iIdx) => (
                  <div
                    key={`pulp_inst_${slide.slideNumber}_${inst.name}_${iIdx}`}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs space-y-1"
                  >
                    <div className="font-bold text-[#2F2B24] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                      <span>{inst.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#736C5F] block">
                      {inst.nameEn}
                    </span>
                    <p className="text-[11px] text-[#595244]">{inst.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Verification Sign-Off Footer for Print */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#0D9488] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-[#2F2B24] print:break-inside-avoid">
          <div className="space-y-1">
            <span className="text-[#736C5F] block">اسم الطالب المتدرب:</span>
            <div className="border-b border-dashed border-[#0D9488] pt-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[#736C5F] block">توقيع وملاحظة المشرف السريري:</span>
            <div className="border-b border-dashed border-[#0D9488] pt-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[#736C5F] block">ختم العيادة السريرية المعتمد:</span>
            <div className="border-b border-dashed border-[#0D9488] pt-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Print Bar (Hidden on print) */}
      <div className="no-print bg-[#FAF7F2] p-5 rounded-3xl border border-[#E5DEC9] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-[#596628] text-white">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#2F2B24]">
              الدليل السريري المرجعي الجاهز للطباعة (PDF / Print Manual)
            </h2>
          </div>
          <p className="text-xs text-[#706A5C]">
            يمكنك طباعة كراس هذا الصنف منفصلاً، أو طباعة الأطلس الشامل (Class I - V)، أو طباعة بروتوكول هندسة الطاولة السريرية
          </p>
        </div>

        {/* Toggle Mode & Print Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#E5DEC9] text-xs font-bold flex-wrap">
            <button
              onClick={() => setPrintMode('single')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                printMode === 'single'
                  ? 'bg-[#596628] text-white shadow-xs'
                  : 'text-[#595244] hover:bg-[#F5F0E6]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كراس {currentClassObj.code}</span>
            </button>
            <button
              onClick={() => setPrintMode('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                printMode === 'all'
                  ? 'bg-[#596628] text-white shadow-xs'
                  : 'text-[#595244] hover:bg-[#F5F0E6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الأطلس الشامل</span>
            </button>
            <button
              onClick={() => setPrintMode('pulp_capping')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                printMode === 'pulp_capping'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#595244] hover:bg-[#F5F0E6]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>بروتوكول التغطية المباشرة DPC (7 مراحل)</span>
            </button>
            <button
              onClick={() => setPrintMode('tray_protocol')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                printMode === 'tray_protocol'
                  ? 'bg-[#596628] text-white shadow-xs'
                  : 'text-[#595244] hover:bg-[#F5F0E6]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>بروتوكول الطاولة السريرية (7 خطوات)</span>
            </button>
            <button
              onClick={() => setPrintMode('patient_guide')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                printMode === 'patient_guide'
                  ? 'bg-[#596628] text-white shadow-xs'
                  : 'text-[#595244] hover:bg-[#F5F0E6]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>دليل المراجعين</span>
            </button>
          </div>

          {/* Action Print Button */}
          <button
            onClick={handlePrint}
            className={`px-5 py-2.5 rounded-2xl text-white text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
              printMode === 'pulp_capping'
                ? 'bg-[#0D9488] hover:bg-[#0F766E]'
                : 'bg-[#596628] hover:bg-[#485320]'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {printMode === 'single'
                ? `طباعة كراس ${currentClassObj.code} (PDF)`
                : printMode === 'all'
                ? 'طباعة الأطلس الشامل (PDF)'
                : printMode === 'pulp_capping'
                ? pulpCappingSlideOption === 'all'
                  ? 'طباعة الدليل الكامل للتغطية اللبية المباشرة DPC (PDF)'
                  : `طباعة المرحلة ${pulpCappingSlideOption} من بروتوكول التغطية المباشرة (PDF)`
                : printMode === 'tray_protocol'
                ? trayStepPrintOption === 'all'
                  ? 'طباعة الدليل الكامل للطاولة السريرية (PDF)'
                  : `طباعة الخطوة ${trayStepPrintOption} من بروتوكول الطاولة (PDF)`
                : 'طباعة دليل التعامل الصحيح مع المراجعين (PDF)'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-selector when in pulp_capping print mode (Allow printing individual phases or full guide) */}
      {printMode === 'pulp_capping' && (
        <div className="no-print p-4 rounded-2xl bg-white border border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#0D9488]">نطاق الطباعة:</span>
            <span className="text-xs text-[#706A5C]">
              اختر طباعة الدليل الشامل أو مرحلة سريرية محددة:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPulpCappingSlideOption('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                pulpCappingSlideOption === 'all'
                  ? 'bg-[#0D9488] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#595244] hover:bg-[#EFE8DC]'
              }`}
            >
              الدليل الشامل الكامل (7 مراحل)
            </button>

            {DIRECT_PULP_CAPPING_SLIDES.map((s, idx) => (
              <button
                key={`pulp_opt_${s.slideNumber}_${idx}`}
                type="button"
                onClick={() => setPulpCappingSlideOption(s.slideNumber)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pulpCappingSlideOption === s.slideNumber
                    ? 'bg-[#0D9488] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#595244] hover:bg-[#EFE8DC]'
                }`}
              >
                المرحلة {s.slideNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-selector when in tray_protocol print mode (Allow printing individual steps or full guide) */}
      {printMode === 'tray_protocol' && (
        <div className="no-print p-4 rounded-2xl bg-white border border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#596628]">نطاق الطباعة:</span>
            <span className="text-xs text-[#706A5C]">
              اختر طباعة الدليل الشامل أو خطوة سريرية محددة:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTrayStepPrintOption('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                trayStepPrintOption === 'all'
                  ? 'bg-[#596628] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#595244] hover:bg-[#EFE8DC]'
              }`}
            >
              الدليل الشامل الكامل (7 خطوات)
            </button>

            {SMART_CLINIC_TRAY_STEPS.map((s, idx) => (
              <button
                key={`tray_opt_${s.stepNumber}_${idx}`}
                type="button"
                onClick={() => setTrayStepPrintOption(s.stepNumber)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  trayStepPrintOption === s.stepNumber
                    ? 'bg-[#596628] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#595244] hover:bg-[#EFE8DC]'
                }`}
              >
                الخطوة {s.stepNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Printable Area with Dynamic Diagonal Security Watermark */}
      <SecurePrintWatermark
        watermarkData={getWatermarkData()}
        documentTitle={
          printMode === 'patient_guide'
            ? 'دليل التعامل الصحيح مع المراجعين'
            : printMode === 'single'
            ? `كراس ${currentClassObj.arabicName || currentClassObj.name}`
            : printMode === 'pulp_capping'
            ? pulpCappingSlideOption === 'all'
              ? 'بروتوكول التغطية اللبية المباشرة DPC في 7 مراحل'
              : `المرحلة ${pulpCappingSlideOption} - بروتوكول التغطية اللبية المباشرة DPC`
            : printMode === 'tray_protocol'
            ? trayStepPrintOption === 'all'
              ? 'بروتوكول هندسة الطاولة السريرية في 7 خطوات'
              : `الخطوة ${trayStepPrintOption} - بروتوكول هندسة الطاولة السريرية`
            : 'الأطلس السريري الشامل لترميمات الأسنان'
        }
      />

      {printMode === 'patient_guide' ? (
        renderPatientGuideContent()
      ) : printMode === 'single' ? (
        renderSingleClassContent(currentClassObj, false)
      ) : printMode === 'pulp_capping' ? (
        renderPulpCappingContent(pulpCappingSlideOption)
      ) : printMode === 'tray_protocol' ? (
        renderTrayProtocolContent(trayStepPrintOption)
      ) : (
        <div className="space-y-8">
          {/* Atlas Cover for Comprehensive Print */}
          <div className="bg-[#FAF7F2] border-2 border-[#596628] p-8 sm:p-12 rounded-3xl text-center space-y-4 print:break-after-page">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#596628] text-white text-xs font-black">
              <GraduationCap className="w-4 h-4" />
              <span>جامعة المعارف — كلية طب الأسنان</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#2F2B24]">
              الأطلس السريري الشامل لترميمات الأسنان المركبة
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#596628]">
              Comprehensive Dental Composite Restoration Protocols: Class I, II, III, IV & V (From A to Z)
            </p>
            <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-[#E5DEC9] text-xs space-y-1">
              <span className="text-[#807A6D] block">إعداد وتنسيق:</span>
              <span className="text-base font-black text-[#2F2B24] block">حياه نافع فجر</span>
              <span className="text-[#596628] font-bold block">مرحلة رابعة — جامعة المعارف</span>
              <span className="text-[#807A6D] block mt-1">معرف التليجرام للتواصل الأكاديمي: t.me/hay_a_2</span>
            </div>
          </div>

          {/* Render All Classes Sequentially */}
          {allClasses.map((item, itemIdx) => renderSingleClassContent(item, true, itemIdx))}
        </div>
      )}
    </div>
  );
};
