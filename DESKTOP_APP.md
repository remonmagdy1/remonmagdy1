# رينج لايت - دليل تطبيق سطح المكتب

دليل شامل لتحويل وتشغيل رينج لايت كتطبيق سطح مكتب احترافي.

## 🖥️ نظرة عامة

تم تحويل رينج لايت إلى تطبيق سطح مكتب كامل باستخدام Electron، مما يوفر:

- **أداء أصلي** على Windows, macOS, Linux
- **تكامل مع نظام التشغيل** (قوائم، إشعارات، اختصارات)
- **عمل بدون إنترنت** كاملاً
- **أمان محسن** مع تشفير البيانات
- **طباعة محسنة** مع دعم الطابعات المحلية
- **تحديث تلقائي** للإصدارات الجديدة

## 🚀 التشغيل السريع

### الطريقة الأسرع
```bash
# تحميل المشروع
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos

# تشغيل مباشر
./start.sh        # Linux/macOS
start.bat         # Windows

# أو باستخدام Node.js
node start.js
```

### التشغيل المتقدم
```bash
# تثبيت التبعيات
npm install

# تشغيل تطبيق سطح المكتب
npm start

# تشغيل في وضع التطوير
npm run dev
```

## 🛠️ بناء التطبيق

### بناء للمنصة الحالية
```bash
# بناء سريع للاختبار
npm run pack

# بناء كامل للتوزيع
npm run build
```

### بناء لمنصات محددة
```bash
# Windows
npm run build-win

# macOS  
npm run build-mac

# Linux
npm run build-linux

# جميع المنصات
npm run build-all
```

### استخدام Makefile
```bash
# عرض جميع الأوامر المتاحة
make help

# إعداد بيئة التطوير
make setup

# تشغيل التطبيق
make run

# بناء التطبيق
make build

# بناء لجميع المنصات
make build-all
```

## 📦 ملفات التوزيع

### Windows
- **ملف التثبيت**: `رينج لايت-1.0.0-x64.exe`
- **نسخة محمولة**: `رينج لايت-1.0.0-x64-portable.exe`
- **أرشيف مضغوط**: `رينج لايت-1.0.0-x64.zip`

### macOS
- **ملف DMG**: `رينج لايت-1.0.0-x64.dmg`
- **أرشيف ZIP**: `رينج لايت-1.0.0-x64.zip`

### Linux
- **AppImage**: `رينج لايت-1.0.0-x64.AppImage`
- **حزمة DEB**: `رينج لايت-1.0.0-x64.deb`
- **حزمة RPM**: `رينج لايت-1.0.0-x64.rpm`

## 🎨 الميزات المحسنة

### واجهة سطح المكتب
- **شاشة بداية** جذابة مع شعار رينج لايت
- **قوائم أصلية** متكاملة مع نظام التشغيل
- **اختصارات لوحة مفاتيح** محسنة
- **إشعارات نظام** للتنبيهات المهمة
- **تكامل مع شريط المهام**

### الأمان والبيانات
- **تشفير البيانات** المحلية
- **نسخ احتياطية تلقائية** يومية
- **حماية بكلمة مرور** مشفرة
- **تسجيل العمليات** للمراجعة
- **استعادة البيانات** من النسخ الاحتياطية

### الطباعة المحسنة
- **طباعة مباشرة** بدون متصفح
- **دعم طابعات حرارية** للإيصالات
- **تخصيص تخطيط الفاتورة**
- **طباعة صامتة** للعمليات السريعة
- **معاينة قبل الطباعة**

### التحديث التلقائي
- **فحص تلقائي** للتحديثات
- **تحميل في الخلفية** بدون إزعاج
- **تثبيت آمن** مع التحقق من التوقيع
- **إشعارات التحديث** الذكية

## ⚙️ التخصيص والإعدادات

### إعدادات التطبيق
```javascript
// في electron-main.js
const appSettings = {
    // إعدادات النافذة
    window: {
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768
    },
    
    // إعدادات الأمان
    security: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
    },
    
    // إعدادات التحديث
    autoUpdater: {
        checkForUpdatesOnStart: true,
        downloadUpdatesAutomatically: true
    }
};
```

### تخصيص الأيقونات
```bash
# وضع أيقوناتك في assets/icons/
assets/icons/
├── icon.ico      # Windows (256x256)
├── icon.icns     # macOS (512x512)  
├── icon.png      # Linux (512x512)
├── icon-16.png   # أيقونة صغيرة
├── icon-32.png   # أيقونة متوسطة
└── icon-512.png  # أيقونة كبيرة
```

### تخصيص شاشة البداية
```javascript
// تعديل createSplashWindow في electron-main.js
const splashContent = `
    <div class="splash-screen">
        <img src="assets/icons/icon.png" alt="رينج لايت">
        <h1>اسم شركتك</h1>
        <p>نظام إدارة نقاط البيع</p>
    </div>
`;
```

## 🔧 التطوير والتخصيص

### إضافة ميزات جديدة
```javascript
// في electron-main.js
ipcMain.handle('custom-feature', async (event, data) => {
    // تنفيذ الميزة الجديدة
    return result;
});

// في electron-preload.js
contextBridge.exposeInMainWorld('customAPI', {
    customFeature: (data) => ipcRenderer.invoke('custom-feature', data)
});
```

### تكامل مع أجهزة خارجية
```javascript
// دعم قارئ الباركود
ipcMain.handle('scan-barcode', async () => {
    // تكامل مع قارئ الباركود
});

// دعم طابعة الإيصالات
ipcMain.handle('print-receipt', async (receiptData) => {
    // طباعة على طابعة حرارية
});

// دعم درج النقد
ipcMain.handle('open-cash-drawer', async () => {
    // فتح درج النقد
});
```

### إضافة قوائم مخصصة
```javascript
const customMenuTemplate = [
    {
        label: 'أدوات مخصصة',
        submenu: [
            {
                label: 'تصدير البيانات',
                accelerator: 'CmdOrCtrl+E',
                click: () => exportData()
            },
            {
                label: 'إعدادات متقدمة',
                click: () => showAdvancedSettings()
            }
        ]
    }
];
```

## 🔌 التكامل مع النظام

### Windows
```javascript
// تسجيل بروتوكول مخصص
app.setAsDefaultProtocolClient('ringlight');

// تكامل مع شريط المهام
app.setUserTasks([
    {
        program: process.execPath,
        arguments: '--new-sale',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'بيع جديد',
        description: 'بدء عملية بيع جديدة'
    }
]);
```

### macOS
```javascript
// تكامل مع Dock
app.dock.setMenu(Menu.buildFromTemplate([
    {
        label: 'بيع جديد',
        click: () => createNewSale()
    }
]));

// دعم Touch Bar
const { TouchBar } = require('electron');
const touchBar = new TouchBar({
    items: [
        new TouchBar.TouchBarButton({
            label: 'بيع جديد',
            click: () => createNewSale()
        })
    ]
});
```

### Linux
```javascript
// تكامل مع مدير النوافذ
app.setDesktopName('رينج لايت');

// دعم الإشعارات
const { Notification } = require('electron');
new Notification({
    title: 'رينج لايت',
    body: 'تم إتمام البيع بنجاح'
}).show();
```

## 📊 المراقبة والتشخيص

### سجلات التطبيق
```javascript
// في electron-main.js
const log = require('electron-log');

log.info('تم بدء التطبيق');
log.error('خطأ في العملية:', error);

// حفظ السجلات في ملف
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
```

### مراقبة الأداء
```javascript
// مراقبة استخدام الذاكرة
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:', memoryUsage);
}, 60000);

// مراقبة أداء العمليات
console.time('database-operation');
// ... عملية قاعدة البيانات
console.timeEnd('database-operation');
```

### تقارير الأخطاء
```javascript
// إرسال تقارير الأخطاء
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    // إرسال تقرير خطأ
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection:', reason);
    // إرسال تقرير خطأ
});
```

## 🚀 النشر والتوزيع

### إعداد التوقيع الرقمي

#### Windows
```bash
# الحصول على شهادة توقيع
# تعيين متغيرات البيئة
set CSC_LINK=path/to/certificate.p12
set CSC_KEY_PASSWORD=certificate_password

# البناء مع التوقيع
npm run build-win
```

#### macOS
```bash
# إعداد Apple Developer Account
export APPLE_ID=your@apple.id
export APPLE_ID_PASS=app-specific-password
export CSC_NAME="Developer ID Application: Your Name"

# البناء مع التوقيع والتصديق
npm run build-mac
```

### النشر التلقائي
```yaml
# .github/workflows/build.yml
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v3
```

## 🔒 الأمان والحماية

### أفضل الممارسات
```javascript
// تعطيل Node integration
webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    webSecurity: true
}

// تشفير البيانات الحساسة
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

function encrypt(text, password) {
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key, iv);
    // ... تشفير البيانات
}
```

### حماية من التلاعب
```javascript
// التحقق من سلامة الملفات
const fs = require('fs');
const crypto = require('crypto');

function verifyFileIntegrity(filePath, expectedHash) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return hash === expectedHash;
}
```

## 📋 قائمة مراجعة الإصدار

### قبل البناء
- [ ] تحديث رقم الإصدار في package.json
- [ ] اختبار جميع الميزات
- [ ] فحص الأمان والثغرات
- [ ] تحديث التوثيق
- [ ] إعداد شهادات التوقيع

### بعد البناء
- [ ] اختبار الملفات المبنية
- [ ] التحقق من التوقيع الرقمي
- [ ] اختبار التثبيت وإلغاء التثبيت
- [ ] اختبار التحديث التلقائي
- [ ] إنشاء ملاحظات الإصدار

### النشر
- [ ] رفع الملفات لـ GitHub Releases
- [ ] تحديث موقع التحميل
- [ ] إشعار المستخدمين
- [ ] مراقبة التحميلات والمشاكل

## 🆘 استكشاف الأخطاء

### مشاكل شائعة
```bash
# خطأ في بناء التبعيات الأصلية
npm run rebuild

# مشاكل في الأذونات
sudo chown -R $USER:$USER node_modules

# نقص الذاكرة أثناء البناء
export NODE_OPTIONS="--max-old-space-size=4096"

# مشاكل في التوقيع
# تحقق من صحة الشهادات والأذونات
```

### أدوات التشخيص
```bash
# فحص سجلات Electron
npm start -- --enable-logging

# فحص أداء التطبيق
npm start -- --inspect=9229

# تشغيل أدوات المطور
npm start -- --dev-tools
```

---

**تهانينا! أصبح لديك الآن تطبيق سطح مكتب احترافي لرينج لايت** 🎉

للمزيد من المساعدة، راجع [BUILD.md](BUILD.md) و [INSTALL.md](INSTALL.md).
