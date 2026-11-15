import React, { useState } from 'react';
import { Smartphone, Copy, CheckCircle2, Shield, X, Code2, AlertCircle, FileCode2, ExternalLink } from 'lucide-react';

interface AndroidSecurityGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSecurityGuidanceModal: React.FC<AndroidSecurityGuidanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<'java' | 'kotlin' | 'manifest' | null>(null);

  if (!isOpen) return null;

  const javaCode = `// In MainActivity.java
package com.protocol.dental;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 🛡️ CRITICAL ANTI-SCREENSHOT & ANTI-RECORDING PROTECTION:
        // Instructs Android SurfaceFlinger to completely blank out screenshots & screen recordings
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );

        setContentView(R.layout.activity_main);
        // ... WebView initialization continues
    }
}`;

  const kotlinCode = `// In MainActivity.kt
package com.protocol.dental

import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 🛡️ CRITICAL ANTI-SCREENSHOT & ANTI-RECORDING PROTECTION:
        // Instructs Android SurfaceFlinger to completely blank out screenshots & screen recordings
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        setContentView(R.layout.activity_main)
    }
}`;

  const handleCopy = (text: string, type: 'java' | 'kotlin' | 'manifest') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn text-right">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A1F14] rounded-3xl shadow-2xl border-2 border-[#596628] dark:border-[#7D9333] overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#596628] via-[#485320] to-[#2F3714] text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
              <Smartphone className="w-7 h-7 text-[#E4EDBF]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/25 text-[#E4EDBF] border border-[#E4EDBF]/30 mb-1">
                <Shield className="w-3 h-3" />
                <span>دليل الحماية على نظام أندرويد | Android FLAG_SECURE</span>
              </div>
              <h3 className="text-lg font-black text-white">
                حظر تصوير الشاشة نهائياً في تطبيق أندرويد (Black Screen)
              </h3>
              <p className="text-xs text-white/80">
                كيفية تفعيل الحماية على مستوى المعالج الرسومي (Hardware-Level) في Webintoapp و Android Studio
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#3E382C] dark:text-[#D5CDBC] leading-relaxed">
          {/* Explanation Alert */}
          <div className="p-4 rounded-2xl bg-[#F2F5E8] dark:bg-[#202717] border border-[#C5D496] dark:border-[#3E4E25] space-y-2">
            <div className="flex items-center gap-2 text-[#46541D] dark:text-[#B3CD5A] font-black text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>كيف تعمل حماية FLAG_SECURE في نظام أندرويد؟</span>
            </div>
            <p className="text-xs text-[#384318] dark:text-[#C5D496]">
              عند إضافة هذا الكود إلى تطبيق الأندرويد، يتعامل نظام التشغيل مع نافذة التطبيق كمحتوى عالي السرية (مشابه لتطبيقات البنوك ونتفلكس).
              أي محاولة لأخذ لقطة شاشة (Screenshot)، أو تسجيل فيديو للشاشة (Screen Recording)، أو عرض الشاشة عبر HDMI/Miracast،
              ستنتج <strong>شاشة سوداء بالكامل (Blank Black Screen)</strong> مع رسالة «لا يمكن التقاط الشاشة بسبب سياسة الحماية».
            </p>
          </div>

          {/* Webintoapp Setup Instructions */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141810] border border-[#E5DEC9] dark:border-[#323E24] space-y-3">
            <h4 className="font-black text-[#2F2B24] dark:text-white flex items-center gap-2 text-xs">
              <ExternalLink className="w-4 h-4 text-[#596628] dark:text-[#8FA738]" />
              خطوات التطبيق في منصة Webintoapp (أثناء تحويل الرابط إلى APK):
            </h4>
            <ol className="space-y-2 pr-4 list-decimal text-[11px] font-medium leading-relaxed">
              <li>
                عند إنشاء أو تعديل التطبيق في لوحة تحكم <strong>Webintoapp</strong>، توجه إلى تبويب <strong>App Settings</strong> ثم <strong>Features & Security</strong>.
              </li>
              <li>
                فعّل خيار <strong>«Disable Screenshots & Screen Capture»</strong> (أو FLAG_SECURE).
              </li>
              <li>
                إذا كنت تستخدم حزمة الكود المصدري المتقدم (Dedicated Source Code): افتح ملف <code>MainActivity.java</code> أو <code>MainActivity.kt</code> وضع الكود الموضح أدناه مباشرة بعد سطر <code>super.onCreate(savedInstanceState);</code>.
              </li>
              <li>
                احفظ الإعدادات وأعد بناء ملف الـ <strong>APK / AAB</strong> وتثبيته على الهاتف.
              </li>
            </ol>
          </div>

          {/* Java Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5 text-xs">
                <Code2 className="w-4 h-4 text-amber-600" />
                كود لغة جافا (Android Java Snippet):
              </span>
              <button
                type="button"
                onClick={() => handleCopy(javaCode, 'java')}
                className="px-3 py-1.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedType === 'java' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ كود Java</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-[#181C13] text-[#A8C24E] font-mono text-[11px] overflow-x-auto border border-[#303822] text-left dir-ltr">
              <code>{javaCode}</code>
            </pre>
          </div>

          {/* Kotlin Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#2F2B24] dark:text-white flex items-center gap-1.5 text-xs">
                <FileCode2 className="w-4 h-4 text-sky-500" />
                كود لغة كوتلن (Android Kotlin Snippet):
              </span>
              <button
                type="button"
                onClick={() => handleCopy(kotlinCode, 'kotlin')}
                className="px-3 py-1.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedType === 'kotlin' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ كود Kotlin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-[#181C13] text-[#7DD3FC] font-mono text-[11px] overflow-x-auto border border-[#303822] text-left dir-ltr">
              <code>{kotlinCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] dark:bg-[#141810] border-t border-[#E5DEC9] dark:border-[#323E24] flex items-center justify-between shrink-0">
          <p className="text-[11px] text-[#706A5B] dark:text-[#A7A08E] font-medium">
            تطبيق هذا الكود يحمي سلايداتك وحالاتك السريرية بنسبة 100% على مستوى نظام أندرويد.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#596628] hover:bg-[#485320] text-white text-xs font-black shadow-xs cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
