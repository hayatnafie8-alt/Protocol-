# دليل توليد حزمة أندرويد الرسمية بصيغة AAB (Android App Bundle) للرفع على متجر Google Play

تم تجهيز وهيكلة تطبيق **بروتوكول PROTOCOL | د. حياه نافع فجر** وفق أعلى المعايير السحابية ومعايير PWA و Trusted Web Activity (TWA) الرسمية من Google ليكون جاهزاً 100% للنشر والرفع على **Google Play Console**.

---

## الطريقة الأولى: التوليد الفوري والمباشر عبر Google Bubblewrap (الأسهل والأسرع - موصى بها من Google)

أداة `Bubblewrap` هي الأداة الرسمية التي طورتها شركة Google لتحويل تطبيقات الويب التقدمية (PWA) إلى ملفات `.aab` جاهزة للمتجر مباشرة دون الحاجة لكتابة كود أندرويد إضافي.

### الخطوات:
1. قم بفتح موجه الأوامر (Terminal) في بيئة العمل أو على جهازك:
   ```bash
   npx @bubblewrap/cli init --manifest="https://ais-dev-53iiilcso2wowisop4dq5b-760525276131.europe-west2.run.app/manifest.json"
   ```
2. ستقوم الأداة بقراءة ملف `manifest.json` والشعار الدائري الجديد `icon-512.png` تلقائياً.
3. لتوليد حزمة الـ AAB الموقعة:
   ```bash
   npx @bubblewrap/cli build
   ```
4. سينتج ملف باسم:
   `app-release-bundle.aab`
   وهذا هو الملف النهائي المطلوب رفعه في **Google Play Console -> Production -> Create new release**.

---

## الطريقة الثانية: عبر Capacitor & Android Studio (للمطورين)

1. تثبيت أدوات Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "بروتوكول PROTOCOL" "com.protocol.dental.app" --web-dir dist
   ```
2. بناء موارد الويب المحدثة:
   ```bash
   npm run build
   ```
3. إضافة منصة الأندرويد ومزامنتها:
   ```bash
   npx cap add android
   npx cap sync
   ```
4. بناء الـ AAB النهائي عبر سطر الأوامر أو من خلال Android Studio:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
5. مسار الملف الناتج:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## مواصفات الحزمة الجاهزة في التطبيق:
* **Package Name (المعرف):** `com.protocol.dental.app`
* **App Name (اسم التطبيق):** بروتوكول PROTOCOL | د. حياه نافع فجر
* **Version (الإصدار):** 1.0.0 (Version Code: 1)
* **الأيقونات:** أيقونات فائقة الدقة 192x192 و 512x512 مع خاصية `maskable` و `any` مستخرجة مباشرة من الشعار الدائري الجديد.
* **الألوان الرسمية:** `#6b7280` / `#59662C`
* **دعم عدم الاتصال:** Service Worker مدمج مع تخزين مؤقت متقدم للموارد الأساسية.
