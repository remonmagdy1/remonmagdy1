# دليل بناء رينج لايت - تطبيق سطح المكتب

دليل شامل لبناء وتوزيع تطبيق رينج لايت كبرنامج سطح مكتب.

## 🛠️ متطلبات البناء

### الأساسية
- **Node.js** 16.0.0 أو أحدث
- **npm** 8.0.0 أو أحدث
- **Git** لتحميل المشروع

### حسب المنصة

#### Windows
- **Windows 10/11** أو أحدث
- **Visual Studio Build Tools** أو **Visual Studio Community**
- **Python 3.x** (للتبعيات الأصلية)

#### macOS
- **macOS 10.15** أو أحدث
- **Xcode Command Line Tools**
- **Apple Developer Account** (للتوقيع والتوزيع)

#### Linux
- **Ubuntu 18.04+** أو توزيعة مماثلة
- **build-essential**
- **libnss3-dev libatk-bridge2.0-dev libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2**

## 🚀 التحضير للبناء

### 1. تحميل المشروع
```bash
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos
```

### 2. تثبيت التبعيات
```bash
# تثبيت التبعيات الأساسية
npm install

# إعادة بناء التبعيات الأصلية (إذا لزم الأمر)
npm run rebuild
```

### 3. التحقق من البيئة
```bash
# اختبار التطبيق
npm start

# اختبار الخادم المحلي
npm run serve
```

## 🏗️ بناء التطبيق

### بناء سريع للتطوير
```bash
# بناء للمنصة الحالية فقط
npm run pack
```

### بناء للتوزيع

#### Windows
```bash
# بناء ملف تثبيت Windows
npm run build-win

# بناء نسخة محمولة
npm run build-portable
```

الملفات المُنتجة:
- `dist/رينج لايت-1.0.0-x64.exe` - ملف التثبيت
- `dist/رينج لايت-1.0.0-x64-portable.exe` - النسخة المحمولة

#### macOS
```bash
# بناء تطبيق macOS
npm run build-mac
```

الملفات المُنتجة:
- `dist/رينج لايت-1.0.0-x64.dmg` - ملف التثبيت
- `dist/رينج لايت-1.0.0-x64.zip` - أرشيف مضغوط

#### Linux
```bash
# بناء حزم Linux
npm run build-linux
```

الملفات المُنتجة:
- `dist/رينج لايت-1.0.0-x64.AppImage` - تطبيق محمول
- `dist/رينج لايت-1.0.0-x64.deb` - حزمة Debian/Ubuntu
- `dist/رينج لايت-1.0.0-x64.rpm` - حزمة RedHat/CentOS

#### جميع المنصات
```bash
# بناء لجميع المنصات (يتطلب بيئة مناسبة)
npm run build-all
```

## 📦 التخصيص قبل البناء

### 1. تحديث معلومات التطبيق
عدّل `package.json`:
```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "وصف تطبيقك",
  "author": {
    "name": "اسمك",
    "email": "email@example.com"
  }
}
```

### 2. تخصيص الأيقونات
ضع أيقوناتك في `assets/icons/`:
- `icon.ico` - Windows (256x256)
- `icon.icns` - macOS (512x512)
- `icon.png` - Linux (512x512)

### 3. تخصيص شاشة البداية
عدّل `electron-main.js` في دالة `createSplashWindow()`.

### 4. إعدادات البناء المتقدمة
عدّل `electron-builder.json` لتخصيص:
- معلومات التطبيق
- إعدادات التثبيت
- التوقيع الرقمي
- التحديث التلقائي

## 🔐 التوقيع الرقمي

### Windows
```bash
# تعيين شهادة التوقيع
set CSC_LINK=path/to/certificate.p12
set CSC_KEY_PASSWORD=your_password

# البناء مع التوقيع
npm run build-win
```

### macOS
```bash
# تعيين معرف المطور
export APPLE_ID=your@apple.id
export APPLE_ID_PASS=app-specific-password
export CSC_NAME="Developer ID Application: Your Name"

# البناء مع التوقيع والتصديق
npm run build-mac
```

## 🚀 النشر والتوزيع

### GitHub Releases
```bash
# نشر تلقائي على GitHub
npm run release
```

### توزيع يدوي
1. ارفع الملفات من مجلد `dist/`
2. أنشئ release جديد على GitHub
3. أرفق الملفات المبنية

## 🧪 اختبار التطبيق المبني

### Windows
```bash
# تثبيت واختبار
./dist/رينج\ لايت-1.0.0-x64.exe

# أو تشغيل النسخة المحمولة
./dist/رينج\ لايت-1.0.0-x64-portable.exe
```

### macOS
```bash
# فتح ملف DMG واختبار التطبيق
open ./dist/رينج\ لايت-1.0.0-x64.dmg
```

### Linux
```bash
# تشغيل AppImage
chmod +x ./dist/رينج\ لايت-1.0.0-x64.AppImage
./dist/رينج\ لايت-1.0.0-x64.AppImage

# أو تثبيت حزمة DEB
sudo dpkg -i ./dist/رينج\ لايت-1.0.0-x64.deb
```

## 🔧 استكشاف أخطاء البناء

### مشاكل شائعة

#### خطأ في تثبيت التبعيات
```bash
# مسح cache وإعادة التثبيت
npm run clean
npm install
```

#### مشاكل في البناء الأصلي
```bash
# إعادة بناء التبعيات الأصلية
npm run rebuild
```

#### نقص الذاكرة أثناء البناء
```bash
# زيادة حد الذاكرة
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### مشاكل الأذونات (Linux/macOS)
```bash
# تعيين الأذونات الصحيحة
chmod +x build/*.sh
sudo chown -R $USER:$USER node_modules
```

### سجلات التشخيص
```bash
# تشغيل البناء مع سجلات مفصلة
DEBUG=electron-builder npm run build

# فحص سجلات Electron
npm start -- --enable-logging
```

## 📊 تحسين حجم التطبيق

### تقليل حجم الحزمة
1. **إزالة التبعيات غير المستخدمة**
```bash
npm prune --production
```

2. **ضغط الموارد**
```bash
# تحسين الصور
# ضغط ملفات CSS/JS
```

3. **استبعاد ملفات غير ضرورية**
عدّل `files` في `electron-builder.json`:
```json
{
  "files": [
    "**/*",
    "!node_modules",
    "!src",
    "!docs",
    "!*.md"
  ]
}
```

### تحسين الأداء
1. **تفعيل V8 code caching**
2. **استخدام asar packing**
3. **تحسين startup time**

## 🔄 التحديث التلقائي

### إعداد خادم التحديثات
1. **GitHub Releases** (مجاني)
2. **خادم مخصص**
3. **خدمات التحديث التجارية**

### تكوين التحديث
في `electron-main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

// إعداد خادم التحديثات
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo'
});

// فحص التحديثات
autoUpdater.checkForUpdatesAndNotify();
```

## 📋 قائمة مراجعة ما قبل الإصدار

- [ ] اختبار التطبيق على جميع المنصات المستهدفة
- [ ] التحقق من الأيقونات والموارد
- [ ] اختبار عملية التثبيت وإلغاء التثبيت
- [ ] التحقق من التوقيع الرقمي
- [ ] اختبار التحديث التلقائي
- [ ] مراجعة الأذونات والأمان
- [ ] اختبار الأداء والذاكرة
- [ ] التحقق من التوافق مع إصدارات النظام
- [ ] مراجعة التوثيق والمساعدة
- [ ] إعداد صفحة الإصدار والملاحظات

## 🆘 الحصول على المساعدة

### الموارد
- **Electron Builder Docs**: https://www.electron.build/
- **Electron Docs**: https://www.electronjs.org/docs
- **GitHub Issues**: للمشاكل المحددة بالمشروع

### الدعم
- **المناقشات**: GitHub Discussions
- **المشاكل**: GitHub Issues
- **التوثيق**: README.md و INSTALL.md

---

**نصيحة**: ابدأ ببناء تطبيق للمنصة الحالية أولاً، ثم انتقل لبناء المنصات الأخرى بعد التأكد من عمل كل شيء بشكل صحيح.
