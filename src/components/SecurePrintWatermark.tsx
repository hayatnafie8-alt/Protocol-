import React from 'react';
import { getWatermarkData, WatermarkData } from '../data/printSecurity';
import { ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

interface SecurePrintWatermarkProps {
  watermarkData?: WatermarkData;
  documentTitle?: string;
}

export const SecurePrintWatermark: React.FC<SecurePrintWatermarkProps> = ({
  watermarkData,
  documentTitle = 'البروتوكول السريري لترميم الأسنان',
}) => {
  const data = watermarkData || getWatermarkData();

  // Create an array of repeating diagonal watermark lines
  const watermarkLines = Array.from({ length: 16 });

  return (
    <>
      {/* 1. Full-Page Fixed Diagonal Watermark Overlay for Print (Repeats on every printed page) */}
      <div
        className="print-security-watermark-overlay print:block hidden fixed inset-0 pointer-events-none select-none z-[999999] overflow-hidden"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        aria-hidden="true"
      >
        <div className="w-[150vw] h-[150vh] -ml-[25vw] -mt-[25vh] flex flex-col justify-around rotate-[-30deg] opacity-[0.16] select-none pointer-events-none">
          {watermarkLines.map((_, idx) => (
            <div
              key={`watermark_line_${idx}`}
              className="flex justify-around items-center whitespace-nowrap text-[15px] font-black tracking-widest text-[#2c341e] font-mono select-none"
            >
              <span>
                نسخة خاصة بـ: {data.subscriberName} ({data.subscriberCode}) • {data.timestamp}
              </span>
              <span className="mx-6">★</span>
              <span>
                محتوى خاص ومعتمد - بروتوكول طب الأسنان • د. حياه نافع فجر
              </span>
              <span className="mx-6">★</span>
              <span>
                رقم التوثيق الأمني: {data.verificationId} • يحظر النشر أو التداول
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Official Security Stamp Header on Print */}
      <div className="print:block hidden border-b-2 border-[#59662C] pb-3 mb-6">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#59662C] text-sm">
              بروتوكول | PROTOCOL
            </span>
            <span className="text-gray-400">|</span>
            <span className="font-bold text-gray-700">
              المرجع السريري لطب الأسنان - إعداد: د. حياه نافع فجر (جامعة المعارف)
            </span>
          </div>
          <div className="font-mono text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-300 font-bold">
            وثيقة معتمدة: {data.verificationId}
          </div>
        </div>

        <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-bold flex items-center justify-between">
          <span>
            🔒 <strong>نسخة خاصة وموثقة لـ:</strong> {data.subscriberName} (كود: {data.subscriberCode})
          </span>
          <span className="font-mono text-[10px] text-gray-600">
            تاريخ الطباعة: {data.timestamp}
          </span>
        </div>
      </div>

      {/* 3. Official Security Footer on Print */}
      <div className="print:block hidden border-t border-gray-300 pt-3 mt-8 text-center text-[10px] text-gray-500 font-medium">
        <p>
          هذه الوثيقة السريرية مرخصة حصرياً للاستخدام الأكاديمي والسريري الشخصي من قبل ({data.subscriberName}).
          كافة الحقوق الفكرية والتصميم محفوظة للدكتورة حياة نافع فجر. أي تصوير، تسريب، أو إعادة نشر خارج المنصة يُعرض صاحب الكود للمساءلة وإلغاء الاشتراك الفوري.
        </p>
        <p className="font-mono mt-0.5 text-gray-400">
          Security Hash: {data.verificationId} • Timestamp: {data.timestamp} • All Rights Reserved © PROTOCOL
        </p>
      </div>

      {/* 4. Unauthorized Print Blocker Screen (Shows ONLY if printed outside the app button) */}
      <div
        id="unauthorized-print-notice"
        className="hidden p-12 text-center space-y-6 max-w-lg mx-auto border-4 border-rose-600 rounded-3xl"
      >
        <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-black text-rose-900">
          الطباعة المباشرة من المتصفح محظورة!
        </h2>
        <p className="text-sm font-bold text-gray-700 leading-relaxed">
          لحماية الحقوق والمحتوى السريري، لا يُسمح بالطباعة العشوائية عبر المتصفح (Ctrl+P).
          يرجى فتح التطبيق والضغط على زر <strong>«طباعة المحتوى المعتمد»</strong> داخل صفحة البروتوكول لتوثيق النسخة باسمك وتاريخك الرسمي.
        </p>
        <div className="p-3 bg-gray-100 rounded-xl text-xs font-mono font-bold text-gray-600">
          Protocol Security Engine • د. حياه نافع فجر
        </div>
      </div>
    </>
  );
};
