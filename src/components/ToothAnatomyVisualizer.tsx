import React, { useState, useEffect } from 'react';
import { Layers, Eye, ShieldCheck, Sparkles, CheckCircle2, Info, ArrowLeftRight, HeartPulse, Hammer, Activity } from 'lucide-react';

interface ToothAnatomyVisualizerProps {
  activeClassId?: string;
}

export const ToothAnatomyVisualizer: React.FC<ToothAnatomyVisualizerProps> = ({ activeClassId = 'class-1' }) => {
  // Allow toggling between Class I, Class II, Class III, Class IV and Class V visualization
  const [selectedClass, setSelectedClass] = useState<'class-1' | 'class-2' | 'class-3' | 'class-4' | 'class-5'>(() => {
    if (activeClassId === 'class-1') return 'class-1';
    if (activeClassId === 'class-2') return 'class-2';
    if (activeClassId === 'class-5') return 'class-5';
    if (activeClassId === 'class-4') return 'class-4';
    return 'class-3';
  });

  useEffect(() => {
    if (
      activeClassId === 'class-1' ||
      activeClassId === 'class-2' ||
      activeClassId === 'class-3' ||
      activeClassId === 'class-4' ||
      activeClassId === 'class-5'
    ) {
      setSelectedClass(activeClassId);
    }
  }, [activeClassId]);

  const [activeStage, setActiveStage] = useState<string>('finished');

  const stagesClass1 = [
    { id: 'defect', label: '1. حفرة Class I', desc: 'تسوس الشقوق والميازيب الإطباقية مع تحضير محافظ يعتمد كلياً على امتداد التسوس وحظر البيفل الإطباقي' },
    { id: 'etch', label: '2. تخريش انتقائي وبوند نشط', desc: 'Selective Enamel Etch 15 ثانية، وتخريش العاج 10 ثوانٍ كحد أقصى، وتدليك البوند النشط 20 ثانية' },
    { id: 'liner', label: '3. بطانة Flowable في قاع الحفرة', desc: 'طبقة Flowable رقيقة جداً (0.5 مم) على أرضية الحفرة كـ Stress Absorber لامتصاص الإجهاد وتجنب الفجوات' },
    { id: 'layering', label: '4. تكديس مائل Cusp by Cusp', desc: 'بناء الكومبوزيت بطبقات مائلة (Oblique Layering) بحد أقصى 2 مم لمنع الانكماش وتخفيف أعلى C-Factor (=5)' },
    { id: 'carving', label: '5. نحت الميازيب وتلوين الشقوق', desc: 'تشكيل الحدبات والمشاحن وتحديد الميازيب بـ Explorer/Carver مع إمكانية إضافة Tints/Stains بنية' },
    { id: 'finished', label: '6. عزل الأكسجين وفحص العضة', desc: 'عزل الأكسجين بـ Glycerin Gel، فحص العضة بـ Articulating Paper، والتلميع الماسي الإطباقي' },
  ];

  const stagesClass2 = [
    { id: 'defect', label: '1. حفرة Class II', desc: 'تسوس ملاصق وإطباقي (Proximal Box & Occlusal Step) مع حماية السن المجاور وحظر البيفل الإطباقي' },
    { id: 'matrix', label: '2. مصفوفة + إسفين + حلقة فصل', desc: 'تثبيت Sectional Matrix Band وإسفين وحلقة الفصل (Separator Ring) لإنشاء مسافة تضمن نقطة تماس مشدودة Tight Contact' },
    { id: 'wall', label: '3. تحويل Class II إلى Class I', desc: 'بناء الجدار الملاصق (Proximal Wall) بطبقة رقيقة (1 ملم) لتحويل التجويف المعقد إلى كلاس 1 بسيط' },
    { id: 'liner', label: '4. بطانة Flowable في قاع الصندوق', desc: 'وضع Flowable Liner رقيق على أرضية الصندوق اللثوي (Gingival Floor) لمنع الفجوات والتسرب الحفافي' },
    { id: 'cusps', label: '5. تكديس مائل ونحت الحدبات', desc: 'بناء الحدبات واحدة تلو الأخرى بطبقات مائلة (Oblique Layering - Cusp by Cusp) لخفض معامل الانكماش C-Factor' },
    { id: 'finished', label: '6. عزل الأكسجين وفحص العضة', desc: 'تطبيق Glycerin Gel، فحص العضة بـ Articulating Paper، والتلميع الماسي الإطباقي مع فحص الخيط Floss Snap' },
  ];

  const stagesClass3 = [
    { id: 'defect', label: '1. تسوس Class III', desc: 'نخر في السطح الملاصق (Interproximal) مع بقاء الزاوية القاطعة سليمة تماماً' },
    { id: 'bevel', label: '2. مدخل حنكي وشطف 45°', desc: 'الدخول من الخلف (Palatal Access) وشطف حافة الميناء الأمامية 45° ببير أصفر' },
    { id: 'wall', label: '3. شريط المايلار والجدار الملاصق', desc: 'تثبيت Mylar Strip وإسفين خشبي لمنع الـ Overhang وبناء الـ Proximal Wall لضمان Tight Contact' },
    { id: 'dentin', label: '4. طبقة العاج (Dentin Layering)', desc: 'وضع كومبوزيت العاج لسد عمق الحفرة واستعادة اللون الداخلي مع ترك مساحة للميناء' },
    { id: 'enamel', label: '5. طبقة الميناء الشفافة', desc: 'تغطية السطح الخارجي والـ Bevel بكومبوزيت الميناء الشفاف لدمج غير مرئي مع السن الطبيعي' },
    { id: 'finished', label: '6. عزل الأكسجين والتلميع', desc: 'عزل الأكسجين بـ Glycerin Gel والتنعيم ببيرات الفنشنغ والأشرطة والتلميع بمعجون الألماس' },
  ];

  const stagesClass4 = [
    { id: 'defect', label: '1. كسر Class IV', desc: 'السن المتضرر مع فقدان الزاوية الإنسالية والميناء والعاج' },
    { id: 'bevel', label: '2. الـ Bevel بزاوية 45°', desc: 'شطف حواف الميناء 45 درجة لتشتيت الضوء وتوسيع مساحة الالتصاق' },
    { id: 'wall', label: '3. الجدار الحنكي (Palatal Shell)', desc: 'بناء الجدار الخلفي باستخدام شريط السيلولويد وFlowable Composite' },
    { id: 'dentin', label: '4. طبقة العاج والماميلونات', desc: 'بناء الـ Mamelons بعاج عاتم A2 مع ترك 0.5 ملم للميناء' },
    { id: 'enamel', label: '5. طبقة الميناء الشفافة', desc: 'تغطية السطح بالكامل وتجاوز خط الـ Bevel بانسيابية' },
    { id: 'finished', label: '6. عزل الأكسجين والتلميع', desc: 'تلميع زجاجي عالي اللمعان بعد عزل الأكسجين بالـ Glycerin Gel' },
  ];

  const stagesClass5 = [
    { id: 'defect', label: '1. آفة عنقية Class V', desc: 'آفة في الثلث اللثوي (نخر Carious أو تآكل انثنائي NCCL / Abfraction) قرب اللثة' },
    { id: 'wall', label: '2. إبعاد اللثة وعزل #212', desc: 'تطبيق خيط إبعاد اللثة (Retraction Cord) وكلامب 212 لكشف الحواف وإيقاف السائل اللثوي GCF' },
    { id: 'bevel', label: '3. شطف الميناء 45° وحظر بيبل الجذر', desc: 'Beveling 45° على ميناء التاج فقط، مع ترك حافة الجذر بزاوية 90° Butt Joint لمنع التسرب' },
    { id: 'dentin', label: '4. بطانة Flowable مرنة', desc: 'طبقة Flowable Composite رقيقة لامتصاص إجهادات الانثناء (Flexural Stress) ومنع تفكك الحشوة' },
    { id: 'enamel', label: '5. عاج عالي التشبع وطبقات مائلة', desc: 'عاج High Chroma (A3/A3.5) لتعويض العمق وتغطية بمصفوفة عنقية أو طبقات Oblique' },
    { id: 'finished', label: '6. عزل الأكسجين والتلميع', desc: 'Glycerin Gel قبل البلمرة النهائية، فنشنغ بالبيرات اللهبية فائقة النعومة، وتلميع بمعجون الألماس لحماية اللثة' },
  ];

  const getStages = () => {
    switch (selectedClass) {
      case 'class-1':
        return stagesClass1;
      case 'class-2':
        return stagesClass2;
      case 'class-5':
        return stagesClass5;
      case 'class-4':
        return stagesClass4;
      default:
        return stagesClass3;
    }
  };

  const stages = getStages();

  return (
    <div className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Banner & Class Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5DEC9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#59662C] text-[#F5F2EB] mb-2 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>نظام الطبقات والألوان السريري (Clinical Layering & Shade Architecture)</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-[#2F2B24]">
            {selectedClass === 'class-1'
              ? 'نظام طبقات الصنف الأول (Class I Occlusal Protocol)'
              : selectedClass === 'class-2'
              ? 'نظام طبقات الصنف الثاني (Class II Posterior Protocol)'
              : selectedClass === 'class-3'
              ? 'نظام طبقات الصنف الثالث (Class III Layering Protocol)'
              : selectedClass === 'class-5'
              ? 'نظام طبقات الصنف الخامس (Class V Cervical Layering Protocol)'
              : 'نظام طبقات الصنف الرابع (Class IV Layering Protocol)'}
          </h3>
          <p className="text-xs sm:text-sm text-[#666053] mt-0.5">
            {selectedClass === 'class-1'
              ? 'البروتوكول الشامل لترميم الشقوق الإطباقية: إدارة معامل الانكماش C-Factor=5، وبطانة امتصاص الإجهاد، والتكديس المائل للحدبات.'
              : selectedClass === 'class-2'
              ? 'البروتوكول الشامل لترميم الأسنان الخلفية المجاورة: من المصفوفة الجزئية وحلقة الفصل إلى تحويل الكلاس 2 والتكديس المائل للحدبات.'
              : selectedClass === 'class-3'
              ? 'البروتوكول الشامل لترميم التسوسات الأمامية الملاصقة: من المدخل الحنكي إلى شريط المايلار وعزل الأكسجين والتلميع.'
              : selectedClass === 'class-5'
              ? 'البروتوكول الشامل لترميم الآفات العنقودية: إبعاد اللثة، حظر بيبل الجذر، بطانة Flowable المرنة، وتشكيل التحدب اللثوي الطبيعي.'
              : 'البروتوكول الشامل لترميم الزوايا الإنسالية: من شطف الـ Bevel وبناء الجدار الحنكي إلى الماميلونات والتلميع.'}
          </p>
        </div>

        {/* Toggle between Class I, Class II, Class III, Class IV and Class V */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E5DEC9] shrink-0 flex-wrap">
          <button
            onClick={() => setSelectedClass('class-1')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedClass === 'class-1'
                ? 'bg-[#59662C] text-[#F5F2EB] shadow-xs'
                : 'text-[#585244] hover:bg-[#FAF7F2]'
            }`}
          >
            <span>طبقات Class I</span>
          </button>

          <button
            onClick={() => setSelectedClass('class-2')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedClass === 'class-2'
                ? 'bg-[#59662C] text-[#F5F2EB] shadow-xs'
                : 'text-[#585244] hover:bg-[#FAF7F2]'
            }`}
          >
            <span>طبقات Class II</span>
          </button>

          <button
            onClick={() => setSelectedClass('class-4')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedClass === 'class-4'
                ? 'bg-[#596628] text-white shadow-xs'
                : 'text-[#585244] hover:bg-[#FAF7F2]'
            }`}
          >
            <span>طبقات Class IV</span>
          </button>

          <button
            onClick={() => setSelectedClass('class-3')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedClass === 'class-3'
                ? 'bg-[#59662C] text-[#F5F2EB] shadow-xs'
                : 'text-[#585244] hover:bg-[#FAF7F2]'
            }`}
          >
            <span>طبقات Class III</span>
          </button>

          <button
            onClick={() => setSelectedClass('class-5')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedClass === 'class-5'
                ? 'bg-[#59662C] text-[#F5F2EB] shadow-xs'
                : 'text-[#585244] hover:bg-[#FAF7F2]'
            }`}
          >
            <span>طبقات Class V</span>
          </button>
        </div>
      </div>

      {/* Steps Selector Timeline Buttons */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-[#6D6758] shrink-0 ml-2">مراحل البناء السريري:</span>
        <div className="flex items-center gap-1.5 w-full">
          {stages.map((st, idx) => (
            <button
              key={`stage_${st.id}_${idx}`}
              onClick={() => setActiveStage(st.id)}
              className={`flex-1 min-w-[110px] p-2.5 rounded-xl text-right transition-all cursor-pointer border ${
                activeStage === st.id
                  ? 'bg-[#59662C] text-[#F5F2EB] border-[#475222] shadow-xs ring-2 ring-[#59662C]/20'
                  : 'bg-white hover:bg-[#F4EFE6] text-[#423C30] border-[#E5DEC9]'
              }`}
            >
              <div className="text-[10px] opacity-80 font-bold">مرحلة {idx + 1}</div>
              <div className="text-xs font-black truncate">{st.label.split('.')[1] || st.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* SVG Graphic Representation Canvas */}
        <div
          className={`lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-3xl border relative overflow-hidden min-h-[410px] shadow-xs ${
            selectedClass !== 'class-4' ? 'bg-[#59662C] border-[#475222]' : 'bg-white border-[#E5DEC9]'
          }`}
        >
          {/* Subtle Ambient Light */}
          <div
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              selectedClass !== 'class-4' ? 'bg-black/25' : 'bg-[#596628]/5'
            }`}
          />

          <div
            className={`absolute top-3 right-3 flex items-center gap-2 text-xs font-semibold ${
              selectedClass !== 'class-4' ? 'text-[#F5F2EB]' : 'text-[#7A7465]'
            }`}
          >
            <Eye className={`w-4 h-4 ${selectedClass !== 'class-4' ? 'text-[#F5F2EB]' : 'text-[#596628]'}`} />
            <span>
              {selectedClass === 'class-1'
                ? 'Class I Occlusal Cavity (المقطع الإطباقي للأضراس)'
                : selectedClass === 'class-2'
                ? 'Class II Posterior Proximal Box (المقطع الملاصق والإطباقي)'
                : selectedClass === 'class-3'
                ? 'Class III Proximal View (السطح الملاصق)'
                : selectedClass === 'class-5'
                ? 'Class V Cervical Profile (الثلث اللثوي والعنقي)'
                : 'Class IV Incisal View (الزاوية القاطعة)'}
            </span>
          </div>

          <svg viewBox="0 0 320 400" className="w-64 h-80 drop-shadow-md select-none transition-all duration-500">
            <defs>
              {/* Enamel gradient */}
              <linearGradient id="cEnamelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#F2ECE1" stopOpacity="0.9" />
              </linearGradient>

              {/* Natural Dentin gradient */}
              <linearGradient id="cDentinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F7DF9B" />
                <stop offset="100%" stopColor="#E9C978" />
              </linearGradient>

              {/* High Chroma Cervical Dentin */}
              <linearGradient id="cHighChromaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8BE65" />
                <stop offset="100%" stopColor="#CA9F3E" />
              </linearGradient>

              {/* Flowable Liner Gradient */}
              <linearGradient id="cFlowableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.85" />
              </linearGradient>

              {/* Posterior Body / Enamel Composite */}
              <linearGradient id="cPostCompGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="60%" stopColor="#EFE5D2" />
                <stop offset="100%" stopColor="#E0D1B5" />
              </linearGradient>

              {/* Acid Etch gel gradient */}
              <linearGradient id="cEtchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.95" />
              </linearGradient>

              {/* Matrix metal band gradient */}
              <linearGradient id="cMatrixGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Separator Ring Metal Gradient */}
              <linearGradient id="cRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Composite Dentin Layer A2 */}
              <linearGradient id="cCompDentinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5DC9C" />
                <stop offset="100%" stopColor="#DEBC69" />
              </linearGradient>

              {/* Composite Translucent Enamel Layer */}
              <linearGradient id="cCompEnamelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#E8F1F2" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#D5E6E8" stopOpacity="0.85" />
              </linearGradient>

              {/* Pulp */}
              <linearGradient id="cPulpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E06B6B" />
                <stop offset="100%" stopColor="#C94747" />
              </linearGradient>

              {/* Gloss shine */}
              <linearGradient id="cShineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* ============================================================== */}
            {/* VIEW 0: CLASS I (OCCLUSAL CROWN CROSS-SECTION) */}
            {/* ============================================================== */}
            {selectedClass === 'class-1' ? (
              <g>
                {/* Gum tissue at bottom */}
                <path d="M 30,290 Q 160,270 290,290 L 290,380 L 30,380 Z" fill="#E89696" stroke="#D47777" strokeWidth="2" />
                <text x="160" y="340" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                  Gingival Margin & Bone (اللثة)
                </text>

                {/* Symmetrical Posterior Molar Crown Body with Cusps on both sides */}
                <path
                  d="M 50,290 C 45,230 45,190 50,160 Q 80,120 120,135 Q 160,115 200,135 Q 240,120 270,160 C 275,190 275,230 270,290 Z"
                  fill="url(#cEnamelGrad)"
                  stroke="#D3C7B5"
                  strokeWidth="2.5"
                />

                {/* Dentin Core */}
                <path
                  d="M 68,280 C 65,230 65,190 70,170 Q 95,145 120,150 Q 160,135 200,150 Q 225,145 250,170 C 255,190 255,230 252,280 Z"
                  fill="url(#cDentinGrad)"
                  stroke="#D8BE76"
                  strokeWidth="1.5"
                />

                {/* Pulp Chamber in center */}
                <path
                  d="M 145,230 C 145,200 150,190 160,190 C 170,190 175,200 175,230 L 175,280 L 145,280 Z"
                  fill="url(#cPulpGrad)"
                  opacity="0.85"
                />

                {/* STAGE 1: OCCLUSAL CAVITY PREP (Strictly limited to caries) */}
                {activeStage === 'defect' && (
                  <g>
                    {/* Occlusal pit cavity centered at x=125-195, y=135-215 */}
                    <path
                      d="M 125,135 L 125,210 Q 160,215 195,210 L 195,135 Z"
                      fill="#FFF7ED"
                      stroke="#C2410C"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                    />
                    <text x="160" y="175" textAnchor="middle" fill="#C2410C" fontSize="10" fontWeight="bold">
                      حفرة Class I
                    </text>
                    <text x="160" y="190" textAnchor="middle" fill="#EA580C" fontSize="8">
                      امتداد الحفرة يتبع التسوس فقط
                    </text>
                    {/* No Occlusal Bevel warning */}
                    <line x1="120" y1="135" x2="130" y2="135" stroke="#EF4444" strokeWidth="3" />
                    <line x1="190" y1="135" x2="200" y2="135" stroke="#EF4444" strokeWidth="3" />
                    <text x="160" y="120" textAnchor="middle" fill="#FDE68A" fontSize="9" fontWeight="bold">
                      حظر البيفل الإطباقي (No Bevel)
                    </text>
                  </g>
                )}

                {/* STAGE 2: ETCHING & BONDING */}
                {activeStage === 'etch' && (
                  <g>
                    {/* Phosphoric Acid Gel in cavity */}
                    <path d="M 125,135 L 125,210 Q 160,215 195,210 L 195,135 Z" fill="url(#cEtchGrad)" stroke="#0284C7" strokeWidth="1.5" />
                    <text x="160" y="175" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                      Selective Etch 37%
                    </text>
                    <text x="160" y="190" textAnchor="middle" fill="#E0F2FE" fontSize="8">
                      15s Enamel | 10s Dentin + Bond
                    </text>
                  </g>
                )}

                {/* STAGE 3: FLOWABLE LINER ON PULPAL FLOOR */}
                {activeStage === 'liner' && (
                  <g>
                    {/* Cavity outline */}
                    <path d="M 125,135 L 125,210 Q 160,215 195,210 L 195,135 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
                    {/* Flowable layer at the bottom 0.5 mm */}
                    <path d="M 125,195 L 125,210 Q 160,215 195,210 L 195,195 Z" fill="url(#cFlowableGrad)" stroke="#1D4ED8" strokeWidth="1" />
                    <text x="160" y="165" textAnchor="middle" fill="#93C5FD" fontSize="9" fontWeight="bold">
                      Flowable Liner (0.5 mm)
                    </text>
                    <text x="160" y="180" textAnchor="middle" fill="#FDE68A" fontSize="8">
                      وسادة امتصاص الإجهاد (Stress Absorber)
                    </text>
                  </g>
                )}

                {/* STAGE 4: OBLIQUE INCREMENTAL LAYERING */}
                {activeStage === 'layering' && (
                  <g>
                    {/* Flowable cushion */}
                    <path d="M 125,195 L 125,210 Q 160,215 195,210 L 195,195 Z" fill="url(#cFlowableGrad)" />
                    {/* Oblique Increment 1 (Buccal slope) */}
                    <polygon points="125,195 125,150 160,195" fill="url(#cCompDentinGrad)" stroke="#B45309" strokeWidth="1" />
                    {/* Oblique Increment 2 (Lingual slope) */}
                    <polygon points="195,195 195,150 160,195" fill="url(#cPostCompGrad)" stroke="#B45309" strokeWidth="1" />
                    <text x="160" y="175" textAnchor="middle" fill="#FDE68A" fontSize="9" fontWeight="bold">
                      طبقات مائلة (Oblique)
                    </text>
                    <text x="160" y="188" textAnchor="middle" fill="#FFFFFF" fontSize="8">
                      C-Factor=5 Management
                    </text>
                  </g>
                )}

                {/* STAGE 5: OCCLUSAL ANATOMY & CARVING */}
                {activeStage === 'carving' && (
                  <g>
                    {/* Fully filled cavity */}
                    <path d="M 125,135 L 125,210 Q 160,215 195,210 L 195,135 Z" fill="url(#cPostCompGrad)" />
                    {/* Fissure and groove characterization */}
                    <path d="M 125,135 Q 145,150 160,155 Q 175,150 195,135" stroke="#78350F" strokeWidth="2.5" fill="none" />
                    <line x1="160" y1="155" x2="160" y2="175" stroke="#78350F" strokeWidth="2" />
                    <circle cx="160" cy="155" r="3" fill="#92400E" />
                    <text x="160" y="195" textAnchor="middle" fill="#FDE68A" fontSize="9" fontWeight="bold">
                      نحت الحدبات والميازيب
                    </text>
                    <text x="160" y="208" textAnchor="middle" fill="#F5F2EB" fontSize="8">
                      + صبغات Tints الجمالية
                    </text>
                  </g>
                )}

                {/* STAGE 6: FINISHED & POLISHED */}
                {activeStage === 'finished' && (
                  <g>
                    {/* Perfectly integrated occlusal composite */}
                    <path d="M 125,135 L 125,210 Q 160,215 195,210 L 195,135 Z" fill="url(#cPostCompGrad)" stroke="#59662C" strokeWidth="1.5" />
                    {/* Anatomical groove */}
                    <path d="M 125,135 Q 145,148 160,152 Q 175,148 195,135" stroke="#78350F" strokeWidth="2" fill="none" />
                    {/* Occlusal articulating paper contact dots outside margin */}
                    <circle cx="100" cy="125" r="3" fill="#2563EB" />
                    <circle cx="220" cy="125" r="3" fill="#2563EB" />
                    <path d="M 140,140 Q 160,135 180,140" stroke="url(#cShineGrad)" strokeWidth="3" fill="none" />
                    <text x="160" y="185" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontWeight="bold">
                      تشريح إطباقي متقن وملمع
                    </text>
                    <text x="160" y="198" textAnchor="middle" fill="#F5F2EB" fontSize="8">
                      معزول بالجلسرين وفحص عضة سليم ✅
                    </text>
                  </g>
                )}
              </g>
            ) : selectedClass === 'class-2' ? (
              // ==============================================================
              // VIEW 1: CLASS II (POSTERIOR MOLAR / PREMOLAR PROXIMAL BOX)
              // ==============================================================
              <g>
                <path d="M 20,290 Q 160,270 300,290 L 300,380 L 20,380 Z" fill="#E89696" stroke="#D47777" strokeWidth="2" />
                <text x="160" y="340" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                  Gingival Margin & Papilla (اللثة)
                </text>
                <g opacity="0.45">
                  <path
                    d="M 10,130 C 30,130 55,145 65,190 C 75,230 65,270 50,300 L 10,300 Z"
                    fill="#D8D0C3"
                    stroke="#BAAF9E"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <text x="35" y="210" textAnchor="middle" fill="#F5F2EB" fontSize="9" fontWeight="bold">
                    السن المجاور
                  </text>
                </g>
                <path
                  d="M 70,290 C 75,230 75,190 70,160 Q 95,120 130,140 Q 170,115 210,140 Q 245,120 270,160 C 265,210 265,260 260,290 Z"
                  fill="url(#cEnamelGrad)"
                  stroke="#D3C7B5"
                  strokeWidth="2.5"
                />
                <path
                  d="M 85,280 C 90,230 90,190 85,170 Q 110,145 130,155 Q 170,140 210,155 Q 230,145 245,170 C 245,210 245,250 245,280 Z"
                  fill="url(#cDentinGrad)"
                  stroke="#D8BE76"
                  strokeWidth="1.5"
                />
                <path
                  d="M 145,220 C 145,195 150,185 160,185 C 170,185 175,195 175,220 L 175,280 L 145,280 Z"
                  fill="url(#cPulpGrad)"
                  opacity="0.8"
                />
                {activeStage === 'defect' && (
                  <g>
                    <path
                      d="M 70,160 L 115,160 L 115,265 L 70,265 Z"
                      fill="#FFF7ED"
                      stroke="#C2410C"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                    />
                    <text x="95" y="205" textAnchor="middle" fill="#C2410C" fontSize="9" fontWeight="bold">
                      Proximal Box
                    </text>
                    <text x="95" y="220" textAnchor="middle" fill="#EA580C" fontSize="8">
                      (الصندوق الملاصق)
                    </text>
                    <line x1="115" y1="160" x2="160" y2="160" stroke="#EA580C" strokeWidth="2" strokeDasharray="2,2" />
                    <text x="145" y="150" fill="#EA580C" fontSize="8" fontWeight="bold">حظر البيفل الإطباقي</text>
                  </g>
                )}
                {activeStage === 'matrix' && (
                  <g>
                    <path
                      d="M 68,145 Q 60,205 68,275"
                      stroke="url(#cMatrixGrad)"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <polygon points="56,280 78,268 78,285" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
                    <circle cx="68" cy="185" r="9" fill="url(#cRingGrad)" stroke="#78350F" strokeWidth="2" />
                    <text x="110" y="190" fill="#FDE68A" fontSize="9" fontWeight="bold">
                      حلقة الفصل (Separator Ring)
                    </text>
                    <text x="110" y="205" fill="#F5F2EB" fontSize="8">
                      + مصفوفة محدبة وإسفين
                    </text>
                  </g>
                )}
                {activeStage === 'wall' && (
                  <g>
                    <path d="M 68,145 Q 60,205 68,275" stroke="#94A3B8" strokeWidth="3" fill="none" opacity="0.6" />
                    <path
                      d="M 68,160 Q 64,205 68,265 L 78,265 Q 74,205 78,160 Z"
                      fill="url(#cPostCompGrad)"
                      stroke="#59662C"
                      strokeWidth="1.5"
                    />
                    <text x="125" y="210" fill="#A7F3D0" fontSize="9" fontWeight="bold">
                      الجدار الملاصق (Proximal Wall)
                    </text>
                    <text x="125" y="225" fill="#F5F2EB" fontSize="8">
                      تحويل Class II إلى Class I ✅
                    </text>
                  </g>
                )}
                {activeStage === 'liner' && (
                  <g>
                    <path d="M 68,160 Q 64,205 68,265 L 78,265 Q 74,205 78,160 Z" fill="url(#cPostCompGrad)" />
                    <rect x="78" y="250" width="37" height="15" rx="3" fill="url(#cFlowableGrad)" stroke="#1D4ED8" strokeWidth="1" />
                    <text x="125" y="255" fill="#93C5FD" fontSize="9" fontWeight="bold">
                      Flowable Liner (0.5 - 1 mm)
                    </text>
                    <text x="125" y="270" fill="#BFDBFE" fontSize="8">
                      ختم الحافة ومنع الفجوات والـ Microleakage
                    </text>
                  </g>
                )}
                {activeStage === 'cusps' && (
                  <g>
                    <rect x="78" y="252" width="37" height="13" rx="2" fill="url(#cFlowableGrad)" />
                    <polygon points="78,252 115,225 115,252" fill="url(#cCompDentinGrad)" stroke="#B45309" strokeWidth="1" />
                    <polygon points="78,252 78,200 115,225" fill="url(#cPostCompGrad)" stroke="#B45309" strokeWidth="1" />
                    <path d="M 68,160 Q 95,130 130,145 Q 170,120 210,145" stroke="#854D0E" strokeWidth="2.5" fill="none" />
                    <text x="125" y="195" fill="#FDE68A" fontSize="9" fontWeight="bold">
                      بناء الحدبات (Cusp by Cusp)
                    </text>
                    <text x="125" y="210" fill="#F5F2EB" fontSize="8">
                      طبقات مائلة Oblique لتقليل C-Factor
                    </text>
                  </g>
                )}
                {activeStage === 'finished' && (
                  <g>
                    <path
                      d="M 68,160 Q 64,205 68,265 L 115,265 L 115,160 Z"
                      fill="url(#cPostCompGrad)"
                      stroke="#59662C"
                      strokeWidth="1.5"
                    />
                    <path d="M 68,160 Q 95,140 120,150 Q 145,135 170,145" stroke="#78350F" strokeWidth="2" fill="none" />
                    <circle cx="64" cy="195" r="5" fill="#10B981" />
                    <text x="25" y="180" fill="#34D399" fontSize="9" fontWeight="bold">Tight Contact 🎯</text>
                    <text x="125" y="195" fill="#A7F3D0" fontSize="10" fontWeight="bold">
                      تشريح إطباقي متقن وملمع
                    </text>
                    <text x="125" y="210" fill="#F5F2EB" fontSize="8">
                      معزول بالجلسرين وبلمرة كاملة 100%
                    </text>
                  </g>
                )}
              </g>
            ) : selectedClass === 'class-5' ? (
              // ==============================================================
              // VIEW 2: CLASS V (CERVICAL CROSS SECTION / PROFILE)
              // ==============================================================
              <g>
                <path
                  d="M 100,20 L 100,120 Q 95,150 100,220 L 100,360 L 220,360 L 220,120 L 220,20 Z"
                  fill="url(#cDentinGrad)"
                  stroke="#CDB16A"
                  strokeWidth="2"
                />
                <path d="M 80,160 C 80,160 70,260 85,360 L 100,360 L 100,160 Z" fill="url(#cEnamelGrad)" stroke="#D3C7B5" strokeWidth="2" />
                <path d="M 220,160 L 220,360 L 235,360 C 250,260 240,160 240,160 Z" fill="url(#cEnamelGrad)" stroke="#D3C7B5" strokeWidth="2" />
                <path d="M 150,20 L 150,330 C 155,335 165,335 170,330 L 170,20 Z" fill="url(#cPulpGrad)" opacity="0.8" />
                <path
                  d={
                    activeStage === 'wall' || activeStage === 'bevel' || activeStage === 'dentin' || activeStage === 'enamel' || activeStage === 'finished'
                      ? 'M 20,90 Q 70,95 82,125 Q 75,145 20,145 Z'
                      : 'M 20,110 Q 70,120 85,155 Q 70,165 20,165 Z'
                  }
                  fill="#E89696"
                  stroke="#D47777"
                  strokeWidth="2"
                />
                <text x="45" y={activeStage === 'defect' ? '140' : '115'} fill="#FFFFFF" fontSize="9" fontWeight="bold">
                  اللثة {activeStage !== 'defect' && '(مُبعدة)'}
                </text>
                {(activeStage === 'wall' || activeStage === 'bevel' || activeStage === 'dentin' || activeStage === 'enamel') && (
                  <g>
                    <circle cx="88" cy="132" r="5" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.5" />
                    <text x="50" y="175" fill="#DDD6FE" fontSize="8" fontWeight="bold">خيط الإبعاد (#000)</text>
                    <line x1="83" y1="135" x2="65" y2="165" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2,2" />
                  </g>
                )}
                {activeStage === 'defect' && (
                  <g>
                    <path d="M 80,140 L 125,168 L 80,195 Z" fill="#FFF7ED" stroke="#C2410C" strokeWidth="2.5" strokeDasharray="3,3" />
                    <text x="135" y="165" fill="#EA580C" fontSize="10" fontWeight="bold">آفة عنقية Class V</text>
                  </g>
                )}
                {activeStage === 'bevel' && (
                  <g>
                    <path d="M 80,140 L 125,168 L 80,195 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
                    <line x1="80" y1="195" x2="68" y2="215" stroke="#EAB308" strokeWidth="3" />
                    <text x="135" y="215" fill="#FEF08A" fontSize="9" fontWeight="bold">شطف الميناء 45°</text>
                    <line x1="80" y1="140" x2="100" y2="140" stroke="#EF4444" strokeWidth="2.5" />
                    <text x="135" y="145" fill="#FCA5A5" fontSize="8" fontWeight="bold">حظر البيفل: 90° Butt</text>
                  </g>
                )}
                {activeStage === 'dentin' && (
                  <g>
                    <path d="M 80,140 L 125,168 L 80,195 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
                    <path d="M 110,158 L 125,168 L 110,178 Z" fill="url(#cFlowableGrad)" stroke="#1D4ED8" strokeWidth="1" />
                    <text x="135" y="170" fill="#93C5FD" fontSize="9" fontWeight="bold">Flowable Liner (امتصاص الانثناء)</text>
                  </g>
                )}
                {activeStage === 'enamel' && (
                  <g>
                    <path d="M 110,158 L 125,168 L 110,178 Z" fill="url(#cFlowableGrad)" />
                    <path d="M 95,148 L 110,158 L 110,178 L 95,188 Z" fill="url(#cHighChromaGrad)" stroke="#B45309" strokeWidth="1" />
                    <path d="M 75,140 Q 65,168 75,200 L 95,188 L 95,148 Z" fill="url(#cCompEnamelGrad)" stroke="#93C5FD" strokeWidth="1.5" />
                    <text x="135" y="160" fill="#FDE68A" fontSize="9" fontWeight="bold">عاج A3.5 عالي التشبع</text>
                  </g>
                )}
                {activeStage === 'finished' && (
                  <g>
                    <path d="M 80,140 Q 66,168 80,200 L 125,168 Z" fill="url(#cCompEnamelGrad)" stroke="#59662C" strokeWidth="2" />
                    <path d="M 72,150 Q 64,168 72,190" stroke="url(#cShineGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="80" cy="140" r="3" fill="#10B981" />
                    <circle cx="80" cy="200" r="3" fill="#10B981" />
                    <text x="135" y="160" fill="#A7F3D0" fontSize="10" fontWeight="bold">تحدب لثوي طبيعي (Emergence)</text>
                  </g>
                )}
              </g>
            ) : selectedClass === 'class-3' ? (
              // ==============================================================
              // VIEW 3: CLASS III TOOTH
              // ==============================================================
              <g>
                <path d="M 70,50 C 65,120 60,220 70,330 C 90,345 230,345 250,330 C 255,220 250,120 250,50 Z" fill="url(#cEnamelGrad)" stroke="#D3C7B5" strokeWidth="2.5" />
                <path d="M 95,70 C 90,130 90,210 95,300 C 110,310 210,310 225,300 C 225,210 225,130 225,70 Z" fill="url(#cDentinGrad)" stroke="#D8BE76" strokeWidth="1.5" />
                <path d="M 145,70 C 145,110 145,150 145,180 C 155,185 165,185 170,180 C 170,150 170,110 170,70 Z" fill="url(#cPulpGrad)" opacity="0.85" />
                <g opacity="0.45">
                  <path d="M 255,80 C 265,130 268,230 260,330 C 280,345 300,345 310,345 L 310,80 Z" fill="#D8D0C3" stroke="#BAAF9E" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="285" y="210" textAnchor="middle" fill="#F5F2EB" fontSize="9" fontWeight="bold">السن المجاور</text>
                </g>
                {activeStage === 'defect' && (
                  <g>
                    <path d="M 252,170 C 215,180 205,240 252,260 Z" fill="#FFF7ED" stroke="#C2410C" strokeWidth="2.5" strokeDasharray="3,3" />
                    <text x="215" y="215" textAnchor="middle" fill="#C2410C" fontSize="10" fontWeight="bold">تسوس ملاصق</text>
                  </g>
                )}
                {activeStage === 'bevel' && (
                  <g>
                    <path d="M 252,170 C 215,180 205,240 252,260 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
                    <path d="M 252,170 C 248,190 248,240 252,260" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                    <text x="180" y="215" textAnchor="middle" fill="#F5F2EB" fontSize="9" fontWeight="bold">مدخل حنكي + شطف 45°</text>
                  </g>
                )}
                {activeStage === 'wall' && (
                  <g>
                    <path d="M 256,150 C 258,200 258,230 256,280" stroke="#0284C7" strokeWidth="3" strokeDasharray="4,2" />
                    <polygon points="252,255 264,250 264,265" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                    <path d="M 250,170 C 245,190 245,240 250,260" stroke="#38BDF8" strokeWidth="3.5" fill="none" />
                    <text x="180" y="215" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="bold">شريط مايلار + إسفين</text>
                  </g>
                )}
                {activeStage === 'dentin' && (
                  <g>
                    <path d="M 250,175 C 225,185 220,235 250,255 Z" fill="url(#cCompDentinGrad)" stroke="#B45309" strokeWidth="1.5" />
                    <text x="180" y="215" textAnchor="middle" fill="#F5F2EB" fontSize="9" fontWeight="bold">طبقة العاج الداخلي</text>
                  </g>
                )}
                {activeStage === 'enamel' && (
                  <g>
                    <path d="M 250,175 C 225,185 220,235 250,255 Z" fill="url(#cCompDentinGrad)" />
                    <path d="M 252,170 C 235,180 235,240 252,260 Z" fill="url(#cCompEnamelGrad)" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="180" y="215" textAnchor="middle" fill="#F5F2EB" fontSize="9" fontWeight="bold">طبقة الميناء الشفافة</text>
                  </g>
                )}
                {activeStage === 'finished' && (
                  <g>
                    <path d="M 252,170 C 235,180 235,240 252,260 Z" fill="url(#cCompEnamelGrad)" stroke="#59662C" strokeWidth="1.5" />
                    <circle cx="253" cy="215" r="4" fill="#10B981" />
                    <text x="180" y="215" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontWeight="bold">تلميع زجاجي + Tight Contact</text>
                  </g>
                )}
              </g>
            ) : (
              // ==============================================================
              // VIEW 4: CLASS IV TOOTH
              // ==============================================================
              <g>
                <path
                  d="M 70,50 C 65,120 60,220 70,330 C 90,345 150,345 160,345 L 160,240 C 200,240 240,230 250,200 C 255,160 250,120 250,50 Z"
                  fill="url(#cEnamelGrad)"
                  stroke="#D3C7B5"
                  strokeWidth="2.5"
                />
                <path
                  d="M 95,70 C 90,130 90,210 95,300 C 110,310 145,310 150,310 L 150,220 C 180,220 210,210 225,190 C 225,160 225,130 225,70 Z"
                  fill="url(#cDentinGrad)"
                  stroke="#D8BE76"
                  strokeWidth="1.5"
                />
                {activeStage === 'defect' && (
                  <g>
                    <path d="M 160,345 L 250,330 L 250,200 C 240,230 200,240 160,240 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" strokeDasharray="4,4" />
                    <text x="205" y="280" textAnchor="middle" fill="#EA580C" fontSize="11" fontWeight="bold">كسر Class IV</text>
                  </g>
                )}
                {activeStage === 'bevel' && (
                  <g>
                    <path d="M 160,240 C 200,240 240,230 250,200" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                    <text x="205" y="270" textAnchor="middle" fill="#596628" fontSize="10" fontWeight="bold">Beveling 45°</text>
                  </g>
                )}
                {activeStage === 'wall' && (
                  <g>
                    <path d="M 160,345 L 250,330 L 250,200" stroke="#0284C7" strokeWidth="3" fill="none" />
                    <text x="205" y="275" textAnchor="middle" fill="#0284C7" fontSize="10" fontWeight="bold">Palatal Shell</text>
                  </g>
                )}
                {activeStage === 'dentin' && (
                  <g>
                    <path d="M 160,240 L 160,320 L 245,310 L 250,200 Z" fill="url(#cCompDentinGrad)" />
                    <text x="205" y="270" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">عاج + Mamelons</text>
                  </g>
                )}
                {(activeStage === 'enamel' || activeStage === 'finished') && (
                  <g>
                    <path d="M 160,240 L 160,345 L 250,330 L 250,200 Z" fill="url(#cCompEnamelGrad)" stroke="#596628" strokeWidth="1.5" />
                    <path d="M 230,220 C 240,250 240,290 235,320" stroke="url(#cShineGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <text x="205" y="275" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="bold">
                      {activeStage === 'finished' ? 'تلميع زجاجي 100%' : 'ميناء شفاف'}
                    </text>
                  </g>
                )}
              </g>
            )}
          </svg>

          {/* Current Stage Indicator Banner */}
          <div className="mt-4 px-4 py-2 rounded-2xl bg-black/30 backdrop-blur-md text-[#F5F2EB] flex items-center gap-2 border border-white/10">
            <span className="text-xs font-bold opacity-80">
              الطبقة المعروضة حالياً:
            </span>
            <span className="text-sm font-black">
              {stages.find((s) => s.id === activeStage)?.label || stages[stages.length - 1].label}
            </span>
          </div>
        </div>

        {/* Detailed Explanation Panel for Active Stage */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E5DEC9] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#59662C] text-[#F5F2EB]">
                مرحلة {Math.max(1, stages.findIndex((s) => s.id === activeStage) + 1)} من 6
              </span>
              <span className="text-xs font-bold text-[#8A8474]">
                {selectedClass === 'class-1'
                  ? 'بروتوكول الصنف الأول'
                  : selectedClass === 'class-2'
                  ? 'بروتوكول الصنف الثاني'
                  : selectedClass === 'class-3'
                  ? 'بروتوكول الصنف الثالث'
                  : selectedClass === 'class-5'
                  ? 'بروتوكول الصنف الخامس'
                  : 'بروتوكول الصنف الرابع'}
              </span>
            </div>

            <h4 className="text-lg md:text-xl font-black text-[#2F2B24] mb-2">
              {stages.find((s) => s.id === activeStage)?.label || stages[stages.length - 1].label}
            </h4>

            <p className="text-sm text-[#555043] leading-relaxed mb-4">
              {stages.find((s) => s.id === activeStage)?.desc || stages[stages.length - 1].desc}
            </p>

            {/* Stage-Specific Clinical Pearls */}
            {selectedClass === 'class-1' ? (
              // Class I Specific Pearls
              <>
                {activeStage === 'defect' && (
                  <div className="p-3.5 bg-[#FFF8F0] border-r-4 border-[#F97316] rounded-xl text-xs space-y-1.5 text-[#7C2D12]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#F97316]" />
                      امتداد الكافتي وحظر البيفل الإطباقي:
                    </p>
                    <p>
                      قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط للحفاظ على بنية السن السليمة. حظر تام لعمل Bevel على الحواف الإطباقية لمنع تكسر وترقق الكومبوزيت تحت قوى المضغ.
                    </p>
                  </div>
                )}

                {activeStage === 'etch' && (
                  <div className="p-3.5 bg-[#F0F7F9] border-r-4 border-[#0284C7] rounded-xl text-xs space-y-1.5 text-[#075985]">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                      التخريش الانتقائي والتدليك النشط:
                    </p>
                    <p>
                      تخريش الميناء 15 ثانية والعاج 10 ثوانٍ كحد أقصى لمنع انهيار الكولاجين والحساسية بعد العلاج، مع تدليك البوند لمدة 20 ثانية وتبخير المذيب بلطف بالهواء.
                    </p>
                  </div>
                )}

                {activeStage === 'liner' && (
                  <div className="p-3.5 bg-[#EFF6FF] border-r-4 border-[#2563EB] rounded-xl text-xs space-y-1.5 text-[#1E40AF]">
                    <p className="font-bold flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#2563EB]" />
                      بطانة Flowable Liner كوسادة ماصة للإجهاد:
                    </p>
                    <p>
                      وضع 0.5 مم من الكومبوزيت الانسيابي في قاع الحفرة يمتص إجهادات الانكماش الناتجة عن الـ C-Factor العالي جداً في كلاس 1 ويضمن سد كافة الزوايا المجهرية.
                    </p>
                  </div>
                )}

                {activeStage === 'layering' && (
                  <div className="p-3.5 bg-[#FEFBF2] border-r-4 border-[#D97706] rounded-xl text-xs space-y-1.5 text-[#92400E]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#D97706]" />
                      إدارة معامل الانكماش الأعلى (C-Factor = 5):
                    </p>
                    <p>
                      في Class I، يوجد 5 جدران مرتبطة مقابل جدار حر واحد فقط! لذلك فإن وضع الكومبوزيت بطبقات مائلة (Oblique Layering) بحد أقصى 2 ملم وعدم ربط جدارين متقابلين معاً هو الضمان لمنع تشقق الحواف وحساسية العض.
                    </p>
                  </div>
                )}

                {activeStage === 'carving' && (
                  <div className="p-3.5 bg-[#F6F9EF] border-r-4 border-[#59662C] rounded-xl text-xs space-y-1.5 text-[#354013]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#59662C]" />
                      نحت الحدبات والميازيب وتلوين الشقوق:
                    </p>
                    <p>
                      تشكيل كل حدبة بانحدارها الطبيعي نحو الشق المركزي، واستخدام Explorer أو Carver لرسم الميازيب، مع إمكانية إضافة لمسة خفيفة من صبغة Tints البنية لإعطاء حيوية ثلاثية الأبعاد.
                    </p>
                  </div>
                )}

                {activeStage === 'finished' && (
                  <div className="p-3.5 bg-[#F4F9F6] border-r-4 border-[#10B981] rounded-xl text-xs space-y-1.5 text-[#065F46]">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      عزل الأكسجين وفحص نقاط العضة:
                    </p>
                    <p>
                      تطبيق Glycerin Gel قبل البلمرة النهائية لمنع تآكل وتصبغ السطح الإطباقي، وفحص نقاط العضة بالـ Articulating Paper والتأكد من عدم وجود ارتفاعات غير طبيعية.
                    </p>
                  </div>
                )}
              </>
            ) : selectedClass === 'class-2' ? (
              // Class II Specific Pearls
              <>
                {activeStage === 'defect' && (
                  <div className="p-3.5 bg-[#FFF8F0] border-r-4 border-[#F97316] rounded-xl text-xs space-y-1.5 text-[#7C2D12]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#F97316]" />
                      امتداد الكافتي وحظر البيفل الإطباقي:
                    </p>
                    <p>
                      قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط (Cavity extension strictly follows caries). تجنب عمل Bevel على السطح الإطباقي لمنع تشقق الكومبوزيت، وحماية السن المجاور بـ FenderWedge قبل التحضير.
                    </p>
                  </div>
                )}

                {activeStage === 'matrix' && (
                  <div className="p-3.5 bg-[#F0F7F9] border-r-4 border-[#0284C7] rounded-xl text-xs space-y-1.5 text-[#075985]">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                      سر نقطة التماس المحكمة (Separator Ring):
                    </p>
                    <p>
                      حلقة الفصل تُحدث تباعداً مجهرياً بين الأسنان يعوض سماكة شريط الماتريكس بدقة، بينما الإسفين يختم الحافة اللثوية لمنع الـ Overhang.
                    </p>
                  </div>
                )}

                {activeStage === 'wall' && (
                  <div className="p-3.5 bg-[#FEFBF2] border-r-4 border-[#D97706] rounded-xl text-xs space-y-1.5 text-[#92400E]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#D97706]" />
                      تحويل Class II إلى Class I (Conversion Technique):
                    </p>
                    <p>
                      بناء الجدار الملاصق بسماكة 1 ملم أولاً يحول الصندوق المعقد إلى حفرة محاطة بأربعة جدران؛ مما يتيح التكديس الحر بدون عوائق.
                    </p>
                  </div>
                )}

                {activeStage === 'liner' && (
                  <div className="p-3.5 bg-[#EFF6FF] border-r-4 border-[#2563EB] rounded-xl text-xs space-y-1.5 text-[#1E40AF]">
                    <p className="font-bold flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#2563EB]" />
                      بطانة Flowable على أرضية الصندوق:
                    </p>
                    <p>
                      وضع 0.5 - 1 ملم كومبوزيت انسيابي يختم الحافة اللثوية العميقة ويسد الزوايا الدقيقة مانعاً تكوّن الفجوات الهوائية والـ Microleakage.
                    </p>
                  </div>
                )}

                {activeStage === 'cusps' && (
                  <div className="p-3.5 bg-[#F6F9EF] border-r-4 border-[#59662C] rounded-xl text-xs space-y-1.5 text-[#354013]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#59662C]" />
                      التكديس المائل حدبة تلو الأخرى (Cusp by Cusp):
                    </p>
                    <p>
                      عدم ربط الجدران المتقابلة بطبقة واحدة، وبناء كل حدبة بشكل مائل يقلل معامل الانكماش C-Factor ويمنع ألم العض وحساسية ما بعد العلاج.
                    </p>
                  </div>
                )}

                {activeStage === 'finished' && (
                  <div className="p-3.5 bg-[#F4F9F6] border-r-4 border-[#10B981] rounded-xl text-xs space-y-1.5 text-[#065F46]">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      عزل الأكسجين واختبار Floss Snap:
                    </p>
                    <p>
                      عزل الأكسجين بـ Glycerin Gel يمنع تآكل الحشوة، وفحص مرور خيط الأسنان مع سماع الـ Snap يؤكد نجاح نقطة التماس وسلاسة الحواف.
                    </p>
                  </div>
                )}
              </>
            ) : selectedClass === 'class-5' ? (
              // Class V Specific Pearls
              <>
                {activeStage === 'defect' && (
                  <div className="p-3.5 bg-[#FFF8F0] border-r-4 border-[#F97316] rounded-xl text-xs space-y-1.5 text-[#7C2D12]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#F97316]" />
                      امتداد الكافتي وتصنيف الآفة:
                    </p>
                    <p>
                      قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس أو الآفة العنقودية فقط دون إزالة عاج سليم. التمييز الدقيق بين التسوس العادي وآفات التآكل الميكانيكي والانثناء (Abfraction / NCCL) يحدد الحاجة لوضع بطانة مرنة لامتصاص إجهادات الإطباق.
                    </p>
                  </div>
                )}

                {activeStage === 'wall' && (
                  <div className="p-3.5 bg-[#F0F7F9] border-r-4 border-[#0284C7] rounded-xl text-xs space-y-1.5 text-[#075985]">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                      خيط إبعاد اللثة (Retraction Cord) وClamp #212:
                    </p>
                    <p>
                      وضع خيط إبعاد اللثة (#000 أو #00) مع كلوريد الألمنيوم يوقف نزف اللثة وسائل الميزاب (GCF) تماماً، وكلامب #212 أو B4 يكشف الحافة التحت لثوية برؤية مثالية.
                    </p>
                  </div>
                )}

                {activeStage === 'bevel' && (
                  <div className="p-3.5 bg-[#FEFBF2] border-r-4 border-[#D97706] rounded-xl text-xs space-y-1.5 text-[#92400E]">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                      قاعدة ذهبية: بيبل الميناء فقط وحظر بيبل الجذر:
                    </p>
                    <p>
                      عمل Beveling بزاوية 45° على حافة الميناء التاجية فقط لتوزيع الضوء، وحظر أي بيبل على حافة الجذر (Gingival Dentin Margin) حيث يجب أن تبقى 90° Butt Joint حادة لمنع التسرب الحفافي.
                    </p>
                  </div>
                )}

                {activeStage === 'dentin' && (
                  <div className="p-3.5 bg-[#EFF6FF] border-r-4 border-[#2563EB] rounded-xl text-xs space-y-1.5 text-[#1E40AF]">
                    <p className="font-bold flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#2563EB]" />
                      بطانة Flowable المرنة (Shock Absorber):
                    </p>
                    <p>
                      وضع طبقة رقيقة 0.5 ملم من Flowable Composite في قاع الحفرة كبطانة منخفضة المعامل المرن (Low Modulus) تمتص إجهاد الانثناء أثناء المضغ وتمنع سقوط الحشوة مستقبلاً.
                    </p>
                  </div>
                )}

                {activeStage === 'enamel' && (
                  <div className="p-3.5 bg-[#F6F9EF] border-r-4 border-[#59662C] rounded-xl text-xs space-y-1.5 text-[#354013]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#59662C]" />
                      عاج عالي التشبع (High Chroma) ومصفوفة العنق:
                    </p>
                    <p>
                      المنطقة العنقودية أغمق طبيعياً؛ لذا نستخدم عاج A3 أو A3.5، مع ضغط الكومبوزيت بمصفوفة العنق الشفافة (Cervical Matrix) لتشكيل التحدب اللثوي الطبيعي (Emergence Profile) بدون فقاعات.
                    </p>
                  </div>
                )}

                {activeStage === 'finished' && (
                  <div className="p-3.5 bg-[#F4F9F6] border-r-4 border-[#10B981] rounded-xl text-xs space-y-1.5 text-[#065F46]">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      جل الجلسرين والبيرات اللهبية لمنع التهاب اللثة:
                    </p>
                    <p>
                      عزل الأكسجين بالـ Glycerin Gel قبل آخر بلمرة لمنع التصبغ اللثوي، وإزالة الزوائد بدقة ببيرات الفنشنغ اللهبية فائقة النعومة دون خدش الجذر، والتلميع الماسي الفائق لمنع تجمع اللويحة.
                    </p>
                  </div>
                )}
              </>
            ) : selectedClass === 'class-3' ? (
              // Class III specific tips
              <>
                {activeStage === 'defect' && (
                  <div className="p-3.5 bg-[#FFF8F0] border-r-4 border-[#F97316] rounded-xl text-xs space-y-1.5 text-[#7C2D12]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#F97316]" />
                      امتداد الكافتي وحماية السن المجاور:
                    </p>
                    <p>
                      قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس فقط للحفاظ الأقصى على ميناء الوجه الأمامي. وضع إسفين خشبي (Wooden Wedge) قبل البدء بالحفر لحماية ميناء السن المجاور من أي خدش عرضي للبير.
                    </p>
                  </div>
                )}

                {activeStage === 'bevel' && (
                  <div className="p-3.5 bg-[#F6F9EF] border-r-4 border-[#59662C] rounded-xl text-xs space-y-1.5 text-[#354013]">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#59662C]" />
                      المدخل الحنكي (Palatal Access) والـ Bevel 45°:
                    </p>
                    <p>
                      الدخول من الجهة الخلفية يحافظ على الميناء الأمامي للابتسامة. عمل Beveling بزاوية 45° على حافة الـ Facial Margin بالبير الأصفر (Yellow Coded Bur) يخفي خط التقاء الحشوة بالسن تماماً (Blend the Margin).
                    </p>
                  </div>
                )}

                {activeStage === 'wall' && (
                  <div className="p-3.5 bg-[#F0F7F9] border-r-4 border-[#0284C7] rounded-xl text-xs space-y-1.5 text-[#075985]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0284C7]" />
                      شريط المايلار والإسفين الخشبي (Tight Contact):
                    </p>
                    <p>
                      تثبيت شريط Mylar Strip مع Wooden Wedge عند المنطقة اللثوية (Gingival Margin) يمنع الـ Overhang ويضمن نقطة تماس مشدودة. بناء الجدار الملاصق بالكومبوزيت يضبط الـ Contour قبل الـ Light Cure.
                    </p>
                  </div>
                )}

                {activeStage === 'dentin' && (
                  <div className="p-3.5 bg-[#FEFBF2] border-r-4 border-[#D97706] rounded-xl text-xs space-y-1.5 text-[#92400E]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      طبقة العاج واستعادة اللون الداخلي (Dentin Layering):
                    </p>
                    <p>
                      وضع كومبوزيت العاج الخاص بالـ Dentin (A2/A3) لسد عمق الحفرة واستعادة التشبع اللوني الداخلي، مع ترك مسافة 0.5 ملم لطبقة الميناء الشفافة.
                    </p>
                  </div>
                )}

                {activeStage === 'enamel' && (
                  <div className="p-3.5 bg-[#F4F9F6] border-r-4 border-[#10B981] rounded-xl text-xs space-y-1.5 text-[#065F46]">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      الميناء الشفاف والاندماج السلس (Enamel Layering):
                    </p>
                    <p>
                      تغطية السطح الخارجي والـ Bevel بطبقة الميناء الشفافة لتندمج بسلاسة مع السن الطبيعي مع التأكد من إزالة أي زوائد قبل التصلب النهائي.
                    </p>
                  </div>
                )}

                {activeStage === 'finished' && (
                  <div className="p-3.5 bg-[#F8F6F0] border-r-4 border-[#59662C] rounded-xl text-xs space-y-1.5 text-[#3E491B]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#59662C]" />
                      عزل الأكسجين بالـ Glycerin Gel والفنشنغ والتلميع:
                    </p>
                    <p>
                      وضع طبقة Glycerin Gel قبل آخر بلمرة لعزل الأكسجين وتأمين بلمرة كاملة 100% لمنع التصبغات (Stain Resistance). الفنشنغ ببيرات صفراء وحمراء وأشرطة Finishing Strips، والتلميع بأقراص Discs ومعجون الألماس.
                    </p>
                  </div>
                )}
              </>
            ) : (
              // Class IV specific tips
              <>
                {activeStage === 'defect' && (
                  <div className="p-3.5 bg-[#FFF8F0] border-r-4 border-[#F97316] rounded-xl text-xs space-y-1.5 text-[#7C2D12]">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#F97316]" />
                      امتداد الكافتي وفحص الإطباق:
                    </p>
                    <p>
                      قاعدة سريرية أساسية: امتداد الكافتي يعتمد كلياً على امتداد التسوس والكسر فقط دون هدر للنسج السليمة، مع فحص الإطباق المسبق لتجنب وضع حواف الترميم مباشرة تحت نقاط الضغط الشديد.
                    </p>
                  </div>
                )}
                {activeStage === 'bevel' && (
                  <div className="p-3.5 bg-[#F6F9EF] border-r-4 border-[#596628] rounded-xl text-xs text-[#354013]">
                    عمل Beveling بزاوية 45° ببير أزرق وتنعيمه ببير أصفر لمضاعفة مساحة الالتصاق وكسر ارتداد الضوء.
                  </div>
                )}
                {activeStage === 'wall' && (
                  <div className="p-3.5 bg-[#F0F7F9] border-r-4 border-[#0284C7] rounded-xl text-xs text-[#075985]">
                    بناء الجدار الحنكي (Palatal Shell) بواسطة شريط السيلولويد وFlowable Composite.
                  </div>
                )}
                {activeStage === 'dentin' && (
                  <div className="p-3.5 bg-[#FEFBF2] border-r-4 border-[#D97706] rounded-xl text-xs text-[#92400E]">
                    نحت الماميلونات الثلاثية (Mamelons) بكومبوزيت عاج A2 لإعطاء حيوية ثلاثية الأبعاد.
                  </div>
                )}
                {activeStage === 'enamel' && (
                  <div className="p-3.5 bg-[#F4F9F6] border-r-4 border-[#10B981] rounded-xl text-xs text-[#065F46]">
                    تغطية السطح الخارجي والـ Bevel بميناء شفاف يبرز الشفافية الإنسالية (Incisal Translucency).
                  </div>
                )}
                {activeStage === 'finished' && (
                  <div className="p-3.5 bg-[#F8F6F0] border-r-4 border-[#596628] rounded-xl text-xs text-[#3E491B]">
                    عزل الأكسجين بالـ Glycerin Gel والتلميع بأقراص Sof-Lex ومعجون الألماس للمعان زجاجي دائم.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Direct Step Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#6D6758] block">انتقل مباشرة لأي مرحلة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stages.map((st, sIdx) => (
                <button
                  key={`stage_btn_${st.id}_${sIdx}`}
                  onClick={() => setActiveStage(st.id)}
                  className={`p-2.5 rounded-xl text-right text-xs font-bold transition-all cursor-pointer border ${
                    activeStage === st.id
                      ? 'bg-[#59662C] text-[#F5F2EB] border-[#475222] shadow-xs'
                      : 'bg-white text-[#4A4539] border-[#E5DEC9] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
