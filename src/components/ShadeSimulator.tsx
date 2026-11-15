import React, { useState, useEffect } from 'react';
import { Palette, Zap, Droplets, Sun, AlertCircle, Check, Sparkles } from 'lucide-react';

interface ShadeOption {
  code: string;
  name: string;
  type: 'dentin' | 'enamel' | 'effect';
  rawHex: string;
  curedHex: string;
  description: string;
  recommendedFor: string;
}

const SHADES: ShadeOption[] = [
  {
    code: 'A3.5 Dentin',
    name: 'A3.5 عاج عميق (High Chroma)',
    type: 'dentin',
    rawHex: '#E5B760',
    curedHex: '#D69E45',
    description: 'موصى به للثلث اللثوي (Class V) لتعويض رقة الميناء وزيادة التشبع اللوني',
    recommendedFor: 'عنق السن والآفات العنقودية Class V',
  },
  {
    code: 'A3 Dentin',
    name: 'A3 عاج دافئ (Warm Dentin)',
    type: 'dentin',
    rawHex: '#EFC77D',
    curedHex: '#E5B760',
    description: 'للحفر العميقة أو الثلث العنقي ومطابقة عاج الأسنان الطبيعي',
    recommendedFor: 'قاع الحفرة والثلث العنقي (Class III & V)',
  },
  {
    code: 'A2 Dentin',
    name: 'A2 عاج (Standard Dentin)',
    type: 'dentin',
    rawHex: '#F5DE9B',
    curedHex: '#EBCE7E',
    description: 'لسد عمق الحفرة واستعادة اللون الداخلي والماميلونات',
    recommendedFor: 'عمق الحفرة والـ Mamelons (Class IV & III)',
  },
  {
    code: 'A2 Enamel',
    name: 'A2 ميناء طبيعي (Enamel Layer)',
    type: 'enamel',
    rawHex: '#FBF4E4',
    curedHex: '#F5ECDA',
    description: 'لتغطية السطح الخارجي والـ Bevel باندماج غير مرئي مع السن الطبيعي',
    recommendedFor: 'تغطية الـ Bevel والسطح الخارجي',
  },
  {
    code: 'A1 Enamel',
    name: 'A1 ميناء ناصع (Bright Enamel)',
    type: 'enamel',
    rawHex: '#FFFBF2',
    curedHex: '#FAF4E4',
    description: 'للأسنان الفاتحة أو اليافعة ذات البياض الطبيعي',
    recommendedFor: 'السطح الخارجي للأسنان الفاتحة',
  },
  {
    code: 'Translucent Enamel',
    name: 'ميناء شفاف (Translucent Halo)',
    type: 'effect',
    rawHex: '#EAF1F3',
    curedHex: '#D2E3E8',
    description: 'طبقة نهائية شفافة تعبر الضوء وتخفي خط التقاء الحشوة (Blend the Margin)',
    recommendedFor: 'حافة الـ Bevel وشفافية الميناء',
  },
];

interface ShadeSimulatorProps {
  activeClassId?: string;
}

export const ShadeSimulator: React.FC<ShadeSimulatorProps> = ({ activeClassId = 'class-1' }) => {
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

  const [selectedShade, setSelectedShade] = useState<ShadeOption>(
    selectedClass === 'class-5' ? SHADES[0] : SHADES[3]
  );
  const [isLightCured, setIsLightCured] = useState<boolean>(false);
  const [isDehydrated, setIsDehydrated] = useState<boolean>(false);
  const [curingAnimation, setCuringAnimation] = useState<boolean>(false);

  const handleLightCureTrigger = () => {
    setCuringAnimation(true);
    setTimeout(() => {
      setIsLightCured(true);
      setCuringAnimation(false);
    }, 1200);
  };

  const handleReset = () => {
    setIsLightCured(false);
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#59662C] text-[#F5F2EB] mb-1.5 shadow-2xs">
            <Palette className="w-3.5 h-3.5" />
            <span>نظام الألوان واختبار Button Try-in وتفادي الجفاف (Dehydration)</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-[#2F2B24]">
            {selectedClass === 'class-1'
              ? 'نظام ألوان الصنف الأول والسطوح الإطباقية (Class I Shade System)'
              : selectedClass === 'class-2'
              ? 'نظام ألوان الصنف الثاني والأسنان الخلفية (Class II Shade System)'
              : selectedClass === 'class-3'
              ? 'نظام ألوان الصنف الثالث (Class III Shade System)'
              : selectedClass === 'class-5'
              ? 'نظام ألوان الصنف الخامس والثلث العنقي (Class V Shade System)'
              : 'نظام ألوان الصنف الرابع (Class IV Shade System)'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6E6859]">
            {selectedClass === 'class-1'
              ? 'في ترميم الشقوق الإطباقية نركز على مطابقة لون Body/Enamel والـ Dentin لإعطاء عمق وتناغم طبيعي مع حدبات السن والشقوق قبل العزل.'
              : selectedClass === 'class-2'
              ? 'في الأسنان الخلفية نركز على مطابقة لون الـ Occlusal Enamel والـ Dentin بدقة مع الـ Occlusal Anatomy والحدبات وهو رطب قبل العزل.'
              : selectedClass === 'class-5'
              ? 'ملاحظة سريرية: المنطقة العنقودية ذات إشباع لوني أعلى (Higher Chroma)، ويُفضل اختيار لون Dentin أغمق درجة من باقي السن قبل العزل.'
              : 'اختيار الـ Shade المطابق وهو رطب قبل العزل (لتفادي الـ Dehydration) باستخدام طريقة الـ Button Try-in مع عمل Light Cure سريع.'}
          </p>
        </div>

        {/* Controls: Dehydration & Class mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5DEC9] flex-wrap">
            <button
              onClick={() => setSelectedClass('class-1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === 'class-1' ? 'bg-[#59662C] text-[#F5F2EB]' : 'text-[#585244]'
              }`}
            >
              Class I
            </button>
            <button
              onClick={() => setSelectedClass('class-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === 'class-2' ? 'bg-[#59662C] text-[#F5F2EB]' : 'text-[#585244]'
              }`}
            >
              Class II
            </button>
            <button
              onClick={() => setSelectedClass('class-4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === 'class-4' ? 'bg-[#596628] text-white' : 'text-[#585244]'
              }`}
            >
              Class IV
            </button>
            <button
              onClick={() => setSelectedClass('class-3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === 'class-3' ? 'bg-[#59662C] text-[#F5F2EB]' : 'text-[#585244]'
              }`}
            >
              Class III
            </button>
            <button
              onClick={() => setSelectedClass('class-5')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === 'class-5' ? 'bg-[#59662C] text-[#F5F2EB]' : 'text-[#585244]'
              }`}
            >
              Class V
            </button>
          </div>

          {/* Dehydration Switch */}
          <button
            onClick={() => setIsDehydrated(!isDehydrated)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isDehydrated
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-[#423C30] border-[#E5DEC9] hover:bg-[#F4EFE6]'
            }`}
          >
            {isDehydrated ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Droplets className="w-3.5 h-3.5 text-[#59662C]" />}
            <span>{isDehydrated ? '⚠️ السن جاف (Dehydrated)' : '💧 السن رطب طبيعي (قبل العزل)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Tooth Model with Button Try-in Spot */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-[#E5DEC9] relative overflow-hidden shadow-xs min-h-[360px]">
          {/* Curing Light Flash Overlay */}
          {curingAnimation && (
            <div className="absolute inset-0 bg-blue-500/40 z-20 flex flex-col items-center justify-center backdrop-blur-xs transition-opacity duration-300">
              <Zap className="w-12 h-12 text-white animate-pulse" />
              <span className="text-white font-black text-sm mt-2 drop-shadow-md">
                جاري التصلب الضوئي السريع (Quick Light Cure...)...
              </span>
            </div>
          )}

          <div className="relative w-64 h-72 flex items-center justify-center">
            {/* Tooth SVG */}
            <svg viewBox="0 0 200 240" className="w-56 h-64 drop-shadow-md select-none">
              {/* Natural tooth body */}
              <path
                d="M 40,20 C 35,70 30,150 40,210 C 60,225 140,225 160,210 C 170,150 165,70 160,20 Z"
                fill={isDehydrated ? '#FFFFFF' : '#FAF6ED'}
                stroke={isDehydrated ? '#E0D8CB' : '#D1C4B2'}
                strokeWidth="2"
                className="transition-colors duration-500"
              />

              {/* Cervical shadow */}
              <path
                d="M 45,25 C 40,55 160,55 155,25 Z"
                fill={isDehydrated ? '#F8F4EC' : selectedClass === 'class-5' ? '#ECCB8A' : '#F1E6D0'}
                opacity={selectedClass === 'class-5' ? 0.95 : 0.8}
                className="transition-colors duration-500"
              />

              {/* Incisal Translucent Edge */}
              <path
                d="M 45,200 C 65,215 135,215 155,200 L 157,208 C 137,222 63,222 43,208 Z"
                fill={isDehydrated ? '#F0ECE4' : '#D7E5E8'}
                opacity={isDehydrated ? 0.35 : 0.75}
                className="transition-opacity duration-500"
              />

              {/* Button Try-In Composite Dot */}
              <circle
                cx={selectedClass === 'class-3' ? '135' : selectedClass === 'class-5' ? '100' : '100'}
                cy={selectedClass === 'class-3' ? '135' : selectedClass === 'class-5' ? '45' : '125'}
                r="18"
                fill={isLightCured ? selectedShade.curedHex : selectedShade.rawHex}
                stroke="#A89D8B"
                strokeWidth="1.5"
                className="transition-colors duration-700 shadow-inner"
              />

              {/* Gloss highlight on composite button */}
              <circle
                cx={selectedClass === 'class-3' ? '130' : selectedClass === 'class-5' ? '95' : '94'}
                cy={selectedClass === 'class-3' ? '130' : selectedClass === 'class-5' ? '40' : '119'}
                r="4"
                fill="#FFFFFF"
                opacity={isLightCured ? 0.7 : 0.3}
              />
            </svg>

            {/* Indicator label pointing to the button try-in */}
            <div className={`absolute ${selectedClass === 'class-5' ? 'top-4 right-1' : 'top-20 left-1'} bg-[#FAF7F2] border border-[#E5DEC9] px-3 py-1.5 rounded-xl shadow-xs text-xs`}>
              <span className="font-extrabold text-[#59662C] block">قطرة Button Try-in</span>
              <span className="text-[11px] text-[#554E41] font-semibold">
                {selectedShade.code}
              </span>
              <span className="text-[10px] text-[#7D7667] block">
                {isLightCured ? '✅ بعد التصلب (Cured)' : '⏳ قبل التصلب (Uncured)'}
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-3 mt-4 w-full justify-center">
            {!isLightCured ? (
              <button
                onClick={handleLightCureTrigger}
                disabled={curingAnimation}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>إجراء Light Cure سريع للقطرة</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-[#4F493D] font-black text-xs flex items-center gap-2 hover:bg-[#F2EDE1] cursor-pointer transition-all"
              >
                <span>إعادة وضع قطرة جديدة (Uncured)</span>
              </button>
            )}
          </div>
        </div>

        {/* Shade Options Palette & Clinical Explanation */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <span className="text-xs font-bold text-[#6B6557] block mb-2">
              اختر لون الكومبوزيت لتجربته:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHADES.map((s, sIdx) => {
                const isSelected = selectedShade.code === s.code;
                return (
                  <button
                    key={`${s.code}_${sIdx}`}
                    onClick={() => {
                      setSelectedShade(s);
                      setIsLightCured(false);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#59662C] bg-[#59662C]/10 ring-2 ring-[#59662C]/30'
                        : 'border-[#E5DEC9] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl border border-black/10 shadow-2xs shrink-0 flex items-center justify-center text-[10px]"
                        style={{ backgroundColor: isLightCured && isSelected ? s.curedHex : s.rawHex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-stone-700" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2A261F]">{s.code}</div>
                        <div className="text-[10px] text-[#716A5A]">{s.recommendedFor}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Advice Box */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] text-xs space-y-2 text-[#4C4537] shadow-2xs">
            <div className="font-bold flex items-center gap-1.5 text-[#59662C]">
              <Sparkles className="w-4 h-4" />
              <span>القاعدة السريرية لمطابقة اللون:</span>
            </div>
            <p className="leading-relaxed">
              {selectedClass === 'class-5'
                ? 'في Class V، الثلث العنقي يتميز بأن الميناء رقيق جداً وعاج الجذر مشبع باللون، لذا يجب اختيار درجة Dentin بـ Chroma أعلى (مثل A3 أو A3.5)، وتطبيق اختبار Button Try-in على الثلث اللثوي مباشرة وهو رطب.'
                : selectedClass === 'class-3'
                ? 'في Class III، اختر لون العاج لسد عمق الحفرة واستعادة اللون، ولون الميناء الشفاف لتغطية الـ Bevel بزاوية 45°، واحرص على عمل التصلب الضوئي السريع لملاحظة قتامة اللون بعد البلمرة.'
                : 'في Class IV، لون الكومبوزيت يغمق بنسبة 10-15% بعد التصلب الضوئي. تركيب الربر دام يُسبب جفاف السن (Dehydration) ويجعله يبدو أكثر بياضاً وعاتماً، لذلك فإن تحديد اللون وهو رطب هو الشرط الأساسي لنجاح الاندماج.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
