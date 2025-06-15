# تشغيل رينج لايت - دليل سريع

دليل مختصر لتشغيل رينج لايت بجميع الطرق المتاحة.

## 🚀 التشغيل السريع (30 ثانية)

### Windows
```cmd
# تحميل وتشغيل
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos
start.bat
```

### macOS/Linux
```bash
# تحميل وتشغيل
git clone https://github.com/remonmagdy1/ringlight-pos.git
cd ringlight-pos
./start.sh
```

### Node.js
```bash
# تشغيل مباشر
node start.js
```

## 🖥️ تطبيق سطح المكتب

### تشغيل فوري
```bash
npm install
npm start
```

### بناء للتوزيع
```bash
# المنصة الحالية
npm run build

# جميع المنصات
npm run build-all

# Windows فقط
npm run build-win

# macOS فقط
npm run build-mac

# Linux فقط
npm run build-linux
```

## 🌐 تطبيق ويب

### تشغيل مباشر
```bash
# فتح الملف مباشرة
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

### خادم محلي
```bash
# Python
python -m http.server 8080

# Node.js
npx http-server . -p 8080 -o

# PHP
php -S localhost:8080
```

## 📱 تطبيق PWA

1. افتح التطبيق في متصفح الهاتف
2. اضغط قائمة المتصفح
3. اختر "إضافة إلى الشاشة الرئيسية"
4. سيظهر كتطبيق منفصل

## 🐳 Docker

### تشغيل أساسي
```bash
docker-compose up -d
```

### تشغيل مع قاعدة البيانات
```bash
docker-compose --profile database up -d
```

### تشغيل كامل مع المراقبة
```bash
docker-compose --profile database --profile cache --profile monitoring up -d
```

## 🔧 Makefile

### عرض جميع الأوامر
```bash
make help
```

### أوامر سريعة
```bash
make setup      # إعداد البيئة
make run        # تشغيل التطبيق
make build      # بناء التطبيق
make clean      # تنظيف الملفات
```

## 🔐 تسجيل الدخول

- **كلمة المرور الافتراضية**: `123`
- يمكن تغييرها من الإعدادات

## 🌐 الوصول للتطبيق

### تطبيق سطح المكتب
- يفتح تلقائياً بعد التشغيل

### تطبيق ويب
- **محلي**: http://localhost:8080
- **Python**: http://localhost:8000
- **PHP**: http://localhost:8080

### Docker
- **التطبيق**: http://localhost:8080
- **خادم الويب**: http://localhost:80
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090

## ⚡ نصائح سريعة

### اختصارات مفيدة
- **F2**: إتمام البيع
- **F3**: بيع جديد
- **F4**: فتح درج النقد
- **Esc**: إغلاق النوافذ
- **Ctrl+S**: حفظ

### تحسين الأداء
- استخدم تطبيق سطح المكتب للأداء الأفضل
- فعل الحفظ التلقائي
- أنشئ نسخ احتياطية دورية

### استكشاف الأخطاء
```bash
# مسح cache المتصفح
Ctrl+Shift+Delete

# إعادة تثبيت التبعيات
npm run clean
npm install

# فحص السجلات
npm start -- --enable-logging
```

## 📊 مراقبة الأداء

### تطبيق سطح المكتب
- مراقبة الذاكرة في Task Manager
- فحص سجلات التطبيق

### Docker
```bash
# حالة الحاويات
docker-compose ps

# استخدام الموارد
docker stats

# السجلات
docker-compose logs -f
```

## 🔄 التحديث

### تطبيق سطح المكتب
- تحديث تلقائي مدمج
- إشعارات عند توفر تحديثات

### تطبيق ويب
```bash
git pull origin main
```

### Docker
```bash
docker-compose pull
docker-compose up -d
```

## 🆘 المساعدة السريعة

### مشاكل شائعة
- **التطبيق لا يبدأ**: تحقق من Node.js
- **البيانات مفقودة**: استعد من النسخة الاحتياطية
- **الطباعة لا تعمل**: تحقق من إعدادات الطابعة

### الحصول على المساعدة
- **التوثيق**: [README.md](README.md)
- **البدء السريع**: [QUICKSTART.md](QUICKSTART.md)
- **المشاكل**: [GitHub Issues](https://github.com/remonmagdy1/ringlight-pos/issues)

---

**اختر الطريقة الأنسب لك وابدأ الاستخدام!** 🎉
