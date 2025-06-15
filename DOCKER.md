# رينج لايت - دليل Docker

دليل شامل لتشغيل رينج لايت باستخدام Docker و Docker Compose.

## 🐳 متطلبات Docker

### التثبيت
- **Docker** 20.10+ 
- **Docker Compose** 2.0+

### التحقق من التثبيت
```bash
docker --version
docker-compose --version
```

## 🚀 التشغيل السريع

### 1. تشغيل التطبيق الأساسي
```bash
# بناء وتشغيل التطبيق
docker-compose up -d

# عرض السجلات
docker-compose logs -f ringlight-app
```

### 2. الوصول للتطبيق
- **التطبيق الرئيسي**: http://localhost:8080
- **خادم الويب**: http://localhost:80

### 3. إيقاف التطبيق
```bash
docker-compose down
```

## 🔧 خيارات التشغيل

### التشغيل الأساسي
```bash
# تشغيل التطبيق فقط
docker-compose up ringlight-app

# تشغيل في الخلفية
docker-compose up -d ringlight-app
```

### التشغيل مع قاعدة البيانات
```bash
# تشغيل مع PostgreSQL
docker-compose --profile database up -d

# تشغيل مع Redis للتخزين المؤقت
docker-compose --profile cache up -d
```

### التشغيل مع المراقبة
```bash
# تشغيل مع Prometheus و Grafana
docker-compose --profile monitoring up -d
```

### التشغيل الكامل
```bash
# تشغيل جميع الخدمات
docker-compose --profile database --profile cache --profile monitoring up -d
```

## 🛠️ البناء المخصص

### بناء الصورة محلياً
```bash
# بناء صورة الإنتاج
docker build -t ringlight-pos:latest .

# بناء صورة التطوير
docker build --target development -t ringlight-pos:dev .

# بناء صورة النشر
docker build --target deploy -t ringlight-pos:deploy .
```

### تشغيل الصورة المبنية
```bash
# تشغيل الإنتاج
docker run -d -p 8080:8080 --name ringlight ringlight-pos:latest

# تشغيل التطوير
docker run -d -p 8080:8080 -p 9229:9229 --name ringlight-dev ringlight-pos:dev
```

## 📁 إدارة البيانات

### النسخ الاحتياطي
```bash
# نسخ احتياطي للبيانات
docker run --rm -v ringlight-data:/data -v $(pwd):/backup alpine tar czf /backup/ringlight-backup-$(date +%Y%m%d).tar.gz -C /data .

# نسخ احتياطي لقاعدة البيانات
docker-compose exec ringlight-db pg_dump -U ringlight ringlight_pos > backup-$(date +%Y%m%d).sql
```

### الاستعادة
```bash
# استعادة البيانات
docker run --rm -v ringlight-data:/data -v $(pwd):/backup alpine tar xzf /backup/ringlight-backup-YYYYMMDD.tar.gz -C /data

# استعادة قاعدة البيانات
docker-compose exec -T ringlight-db psql -U ringlight ringlight_pos < backup-YYYYMMDD.sql
```

### عرض البيانات
```bash
# عرض وحدات التخزين
docker volume ls | grep ringlight

# فحص محتويات البيانات
docker run --rm -v ringlight-data:/data alpine ls -la /data
```

## 🔍 المراقبة والتشخيص

### عرض السجلات
```bash
# سجلات التطبيق الرئيسي
docker-compose logs -f ringlight-app

# سجلات جميع الخدمات
docker-compose logs -f

# سجلات خدمة محددة
docker-compose logs -f ringlight-db
```

### فحص الحالة
```bash
# حالة الحاويات
docker-compose ps

# استخدام الموارد
docker stats

# فحص صحة التطبيق
docker-compose exec ringlight-app curl -f http://localhost:8080/
```

### الدخول للحاوية
```bash
# الدخول للتطبيق الرئيسي
docker-compose exec ringlight-app sh

# الدخول لقاعدة البيانات
docker-compose exec ringlight-db psql -U ringlight ringlight_pos
```

## ⚙️ التكوين المتقدم

### متغيرات البيئة
إنشاء ملف `.env`:
```env
# إعدادات التطبيق
NODE_ENV=production
PORT=8080
APP_NAME=ringlight-pos

# إعدادات قاعدة البيانات
DB_PASSWORD=your_secure_password
POSTGRES_DB=ringlight_pos
POSTGRES_USER=ringlight

# إعدادات Redis
REDIS_PASSWORD=your_redis_password

# إعدادات المراقبة
GRAFANA_PASSWORD=your_grafana_password

# إعدادات الأمان
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### تخصيص docker-compose
```yaml
# docker-compose.override.yml
version: '3.8'

services:
  ringlight-app:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - ./logs:/app/logs
    ports:
      - "9229:9229"  # منفذ التشخيص
```

### شبكة مخصصة
```yaml
networks:
  ringlight-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 🔒 الأمان

### أفضل الممارسات
```bash
# تشغيل بمستخدم غير جذر
USER 1001:1001

# فحص الثغرات الأمنية
docker scan ringlight-pos:latest

# تحديث الصور الأساسية
docker-compose pull
docker-compose up -d
```

### إعدادات الأمان
```yaml
services:
  ringlight-app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

## 🌐 النشر في الإنتاج

### Docker Swarm
```bash
# تهيئة Swarm
docker swarm init

# نشر التطبيق
docker stack deploy -c docker-compose.yml ringlight

# عرض الخدمات
docker service ls
```

### Kubernetes
```bash
# تحويل إلى Kubernetes
kompose convert

# نشر في Kubernetes
kubectl apply -f .
```

### خدمات السحابة
```bash
# AWS ECS
# Azure Container Instances
# Google Cloud Run
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة

#### التطبيق لا يبدأ
```bash
# فحص السجلات
docker-compose logs ringlight-app

# فحص الحالة
docker-compose ps

# إعادة البناء
docker-compose build --no-cache ringlight-app
```

#### مشاكل الشبكة
```bash
# فحص الشبكة
docker network ls
docker network inspect ringlight-network

# إعادة إنشاء الشبكة
docker-compose down
docker network prune
docker-compose up -d
```

#### مشاكل البيانات
```bash
# فحص وحدات التخزين
docker volume ls
docker volume inspect ringlight-data

# إعادة تعيين البيانات
docker-compose down -v
docker-compose up -d
```

### أوامر التشخيص
```bash
# معلومات النظام
docker system info
docker system df

# تنظيف النظام
docker system prune -a

# فحص استخدام الموارد
docker stats --no-stream
```

## 📊 الأداء والتحسين

### تحسين الصورة
```dockerfile
# استخدام multi-stage builds
FROM node:18-alpine AS builder
# ... خطوات البناء

FROM node:18-alpine AS runner
# ... نسخ الملفات المطلوبة فقط
```

### تحسين الذاكرة
```yaml
services:
  ringlight-app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### تحسين الشبكة
```yaml
services:
  ringlight-app:
    networks:
      ringlight-network:
        aliases:
          - app
```

## 📋 قائمة مراجعة النشر

- [ ] تحديث متغيرات البيئة
- [ ] تعيين كلمات مرور قوية
- [ ] تفعيل HTTPS
- [ ] إعداد النسخ الاحتياطي التلقائي
- [ ] تكوين المراقبة
- [ ] اختبار الاستعادة من الكوارث
- [ ] فحص الأمان
- [ ] تحسين الأداء
- [ ] إعداد التحديث التلقائي
- [ ] توثيق الإعدادات

## 🆘 الحصول على المساعدة

### الموارد
- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/

### الدعم
- **GitHub Issues**: للمشاكل المحددة
- **Docker Community**: للمساعدة العامة
- **Stack Overflow**: للأسئلة التقنية

---

**نصيحة**: ابدأ بالتشغيل الأساسي أولاً، ثم أضف الخدمات الإضافية حسب الحاجة.
