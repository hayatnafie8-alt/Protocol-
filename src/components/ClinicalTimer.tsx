import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, AlertTriangle, Volume2, VolumeX, CheckCircle } from 'lucide-react';

interface TimerPreset {
  id: string;
  name: string;
  nameEn: string;
  duration: number; // in seconds
  category: 'etching' | 'bonding' | 'curing' | 'oxygen';
  warning?: string;
  tip?: string;
  color: string;
}

const PRESETS: TimerPreset[] = [
  {
    id: 'enamel-etch',
    name: 'تخريش الميناء (Enamel Etch)',
    nameEn: 'Enamel Etching',
    duration: 20,
    category: 'etching',
    tip: 'تطبيق حمض الفوسفوريك 37% أولاً على حواف الميناء والـ Bevel.',
    color: '#3B82F6',
  },
  {
    id: 'dentin-etch',
    name: 'تخريش العاج (Dentin Etch)',
    nameEn: 'Dentin Etching (Strict)',
    duration: 10,
    category: 'etching',
    warning: 'تنبيه سريري حرج: 10 ثوانٍ كحد أقصى للعاج لمنع انهيار شبكة الكولاجين والحساسية بعد العلاج!',
    color: '#EF4444',
  },
  {
    id: 'bond-rubbing',
    name: 'تدليك البوند (Bond Rubbing)',
    nameEn: 'Bond Active Rubbing',
    duration: 20,
    category: 'bonding',
    tip: 'تدليك نشط ومستمر برأس المايكرو لتغلغل الرابط في قنيات العاج.',
    color: '#10B981',
  },
  {
    id: 'solvent-evap',
    name: 'تبخير المذيب (Air Drying)',
    nameEn: 'Solvent Evaporation',
    duration: 5,
    category: 'bonding',
    tip: 'هواء لطيف غير زيتي حتى يتوقف لمعان السائل عن الحركة ويصبح ثابتاً.',
    color: '#F59E0B',
  },
  {
    id: 'light-cure',
    name: 'التصلب الضوئي (Light Cure)',
    nameEn: 'Photopolymerization',
    duration: 20,
    category: 'curing',
    tip: 'تثبيت رأس الضوء عمودياً وأقرب ما يمكن للسطح دون لمسه.',
    color: '#596628',
  },
  {
    id: 'proximal-wall-cure',
    name: 'بلمرة الجدار الملاصق (Proximal Wall)',
    nameEn: 'Proximal Wall Polymerization',
    duration: 20,
    category: 'curing',
    tip: 'بلمرة الجدار الملاصق المحول (Class II to Class I Conversion) من الجهة الإطباقية والجانبية.',
    color: '#0284C7',
  },
  {
    id: 'glycerin-cure',
    name: 'عزل الأكسجين والضربة الأخيرة',
    nameEn: 'Oxygen Barrier Cure (Glycerin)',
    duration: 20,
    category: 'oxygen',
    tip: 'بلمرة نهائية فوق طبقة الجلسرين لمنع طبقة التثبيط والتصبغات.',
    color: '#8B5CF6',
  },
];

export const ClinicalTimer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState<number>(PRESETS[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play synthesized web audio beep
  const playBeep = (freq: number = 880, duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(600, 0.1);
          } else if (prev === 1) {
            playBeep(950, 0.4);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Completion chime
      playBeep(1100, 0.5);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSelectPreset = (preset: TimerPreset) => {
    setIsRunning(false);
    setSelectedPreset(preset);
    setTimeLeft(preset.duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedPreset.duration);
  };

  const toggleRun = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedPreset.duration);
    }
    setIsRunning(!isRunning);
  };

  const progressPercent = ((selectedPreset.duration - timeLeft) / selectedPreset.duration) * 100;

  return (
    <div className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#596628] text-white flex items-center justify-center shadow-xs">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2F2B24]">مؤقت بروتوكول العيادة الكرونومتر (Clinical Step Timer)</h3>
            <p className="text-xs text-[#706B5D]">توقيتات سريرية دقيقة لضمان أعلى قوة التصاق وتفادي أخطاء التخريش والبلمرة</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg border border-[#E5DEC9] bg-white text-[#6B6557] hover:text-[#2F2B24] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
          title={soundEnabled ? 'كتم التنبيه الصوتي' : 'تفعيل التنبيه الصوتي'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#596628]" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          <span className="hidden sm:inline">{soundEnabled ? 'الصوت مفعل' : 'صامت'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Preset Selector */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold text-[#635D50] block mb-1">اختر الخطوة السريرية المطلوبة:</span>
          {PRESETS.map((preset, pIdx) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={`${preset.id}_${pIdx}`}
                onClick={() => handleSelectPreset(preset)}
                className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#596628] text-white border-[#596628] shadow-xs'
                    : 'bg-white hover:bg-[#F4EFE6] text-[#3A362C] border-[#E5DEC9]'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{preset.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#857F71]'}`}>{preset.nameEn}</div>
                </div>
                <div
                  className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#596628]'
                  }`}
                >
                  {preset.duration} ثا
                </div>
              </button>
            );
          })}
        </div>

        {/* Circular Display & Controls */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E5DEC9]">
          {/* Circular progress container */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="text-[#EFE9DC]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                stroke={selectedPreset.color}
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black tracking-tight text-[#2F2B24] font-mono">
                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
              <span className="text-xs font-semibold text-[#7D7769] mt-1">ثانية متبقية</span>
              {timeLeft === 0 && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  اكتملت الخطوة!
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={toggleRun}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#596628] hover:bg-[#485320] text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{timeLeft === 0 ? 'إعادة البدء' : 'بدء التوقيت السريري'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl font-bold text-sm border border-[#E5DEC9] bg-[#FAF7F2] text-[#5A5447] hover:bg-[#F2ECE0] transition-colors cursor-pointer flex items-center gap-1.5"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          {/* Warning or Tip Box */}
          <div className="mt-5 w-full">
            {selectedPreset.warning ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{selectedPreset.warning}</span>
              </div>
            ) : selectedPreset.tip ? (
              <div className="p-3 bg-[#F6F9EE] border border-[#DCE8BF] text-[#364214] rounded-xl text-xs flex items-start gap-2">
                <span className="font-bold shrink-0">نصيحة سريرية:</span>
                <span>{selectedPreset.tip}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
