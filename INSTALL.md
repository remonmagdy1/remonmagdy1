# دليل التثبيت - رينج لايت

دليل شامل لتثبيت وتشغيل نظام إدارة نقاط البيع "رينج لايت"

## طرق التشغيل

### 1. التشغيل المباشر في المتصفح (الأسهل)

هذه الطريقة لا تحتاج تثبيت أي برامج إضافية:

```bash
# تحميل المشروع
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos

# فتح الملف مباشرة في المتصفح
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### 2. استخدام خادم محلي (موصى به)

#### باستخدام Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# ثم افتح المتصفح على
http://localhost:8000
```

#### باستخدام Node.js:
```bash
# تثبيت http-server عالمياً
npm install -g http-server

# تشغيل الخادم
http-server . -p 8000 -o

# أو استخدام npx بدون تثبيت
npx http-server . -p 8000 -o
```

#### باستخدام PHP:
```bash
php -S localhost:8000
```

### 3. تطبيق سطح المكتب (Electron)

#### متطلبات النظام:
- Node.js 16.0.0 أو أحدث
- npm 8.0.0 أو أحدث

#### خطوات التثبيت:

```bash
# تحميل المشروع
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos

# تثبيت التبعيات
npm install

# تشغيل التطبيق
npm start
```

#### بناء التطبيق للتوزيع:

```bash
# بناء لجميع المنصات
npm run build

# بناء لـ Windows فقط
npm run build-win

# بناء لـ macOS فقط
npm run build-mac

# بناء لـ Linux فقط
npm run build-linux
```

## التحويل لتطبيق الهاتف المحمول

### Android (باستخدام Cordova)

#### التثبيت:
```bash
# تثبيت Cordova
npm install -g cordova

# إنشاء مشروع Cordova
cordova create ringlight-mobile com.ringlight.pos "رينج لايت"
cd ringlight-mobile

# إضافة منصة Android
cordova platform add android

# نسخ ملفات التطبيق
cp -r ../ringlight-pos/css www/
cp -r ../ringlight-pos/js www/
cp -r ../ringlight-pos/assets www/
cp ../ringlight-pos/index.html www/

# بناء التطبيق
cordova build android

# تشغيل على الجهاز
cordova run android
```

#### متطلبات Android:
- Android Studio
- Android SDK
- Java Development Kit (JDK)

### iOS (باستخدام Cordova)

#### التثبيت:
```bash
# إضافة منصة iOS (macOS فقط)
cordova platform add ios

# بناء التطبيق
cordova build ios

# فتح في Xcode
open platforms/ios/رينج\ لايت.xcworkspace
```

#### متطلبات iOS:
- macOS
- Xcode
- iOS SDK

### تطبيق ويب تقدمي (PWA)

التطبيق يدعم PWA بشكل افتراضي:

1. افتح التطبيق في المتصفح
2. اضغط على "إضافة إلى الشاشة الرئيسية"
3. سيتم إنشاء أيقونة التطبيق على الشاشة الرئيسية

## إعداد قاعدة البيانات

التطبيق يستخدم localStorage بشكل افتراضي، لكن يمكن تكوينه لاستخدام قواعد بيانات أخرى:

### IndexedDB (للبيانات الكبيرة)
```javascript
// في ملف database.js
const useIndexedDB = true;
```

### قاعدة بيانات خارجية (MySQL/PostgreSQL)
```javascript
// إعداد اتصال قاعدة البيانات
const dbConfig = {
    host: 'localhost',
    database: 'ringlight_pos',
    username: 'your_username',
    password: 'your_password'
};
```

## إعداد الطباعة

### طابعات الإيصالات الحرارية

#### تكوين الطابعة:
```javascript
// في ملف settings
const printerConfig = {
    type: 'thermal',
    width: '80mm',
    interface: 'USB', // أو 'Bluetooth' أو 'Network'
    encoding: 'UTF-8'
};
```

#### طابعات مدعومة:
- Epson TM-T20
- Star TSP143
- Citizen CT-S310
- Bixolon SRP-350

### طابعات الليزر/النافثة للحبر

```javascript
const printerConfig = {
    type: 'standard',
    paperSize: 'A4',
    orientation: 'portrait',
    margins: '15mm'
};
```

## إعداد الباركود

### قارئات الباركود المدعومة:
- Honeywell Voyager 1200g
- Zebra DS2208
- Datalogic QuickScan QD2430
- Symbol LS2208

### تكوين قارئ الباركود:
```javascript
const barcodeConfig = {
    enabled: true,
    interface: 'USB', // أو 'Bluetooth'
    autoSubmit: true,
    prefix: '',
    suffix: '\n'
};
```

## إعداد درج النقد

### أدراج النقد المدعومة:
- APG Vasario Series
- Star Micronics CD3-1616
- Epson DM-D30

### تكوين درج النقد:
```javascript
const cashDrawerConfig = {
    enabled: true,
    interface: 'Serial', // أو 'USB'
    openCommand: '\x1B\x70\x00\x19\xFA'
};
```

## استكشاف الأخطاء

### مشاكل شائعة:

#### 1. التطبيق لا يعمل في المتصفح
```bash
# تأكد من تفعيل JavaScript
# تأكد من دعم localStorage
# جرب متصفح آخر
```

#### 2. خطأ في تثبيت Node.js
```bash
# تحديث Node.js
nvm install node
nvm use node

# أو تحميل من الموقع الرسمي
# https://nodejs.org
```

#### 3. مشاكل في بناء Electron
```bash
# مسح cache
npm cache clean --force

# إعادة تثبيت التبعيات
rm -rf node_modules
npm install

# تحديث electron-builder
npm update electron-builder
```

#### 4. مشاكل الطباعة
- تأكد من تثبيت تعريفات الطابعة
- تحقق من إعدادات الطباعة في المتصفح
- جرب طباعة صفحة اختبار

#### 5. مشاكل قارئ الباركود
- تأكد من تكوين قارئ الباركود كـ HID
- تحقق من إعدادات لوحة المفاتيح
- جرب في تطبيق نصي أولاً

## الأمان والنسخ الاحتياطي

### إعداد النسخ الاحتياطي التلقائي:
```javascript
// في ملف settings
const backupConfig = {
    enabled: true,
    interval: 'daily', // أو 'weekly'
    location: './backups/',
    retention: 30 // عدد الأيام
};
```

### تشفير البيانات:
```javascript
const securityConfig = {
    encryption: true,
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2'
};
```

## التحديثات

### تحديث التطبيق:
```bash
# تحديث من Git
git pull origin main

# تحديث التبعيات
npm update

# إعادة بناء التطبيق
npm run build
```

### تحديث قاعدة البيانات:
```javascript
// سيتم التحديث تلقائياً عند تشغيل التطبيق
// أو يمكن التحديث يدوياً من الإعدادات
```

## الدعم الفني

### الحصول على المساعدة:
- **التوثيق**: [docs/](docs/)
- **الأسئلة الشائعة**: [FAQ.md](FAQ.md)
- **المشاكل**: [GitHub Issues](https://github.com/remonmagdy1/ringlight-pos/issues)
- **المناقشات**: [GitHub Discussions](https://github.com/remonmagdy1/ringlight-pos/discussions)

### تقديم تقرير خطأ:
1. تأكد من أن المشكلة لم يتم الإبلاغ عنها مسبقاً
2. قدم وصفاً مفصلاً للمشكلة
3. أرفق لقطات شاشة إن أمكن
4. اذكر نظام التشغيل ونسخة المتصفح

### طلب ميزة جديدة:
1. ابحث في الطلبات الموجودة
2. اشرح الميزة المطلوبة بالتفصيل
3. اذكر سبب أهمية هذه الميزة
4. قدم أمثلة على الاستخدام

---

© 2024 رينج لايت. جميع الحقوق محفوظة.
