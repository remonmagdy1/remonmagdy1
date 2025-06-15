# رينج لايت - Dockerfile
# Ring Light POS - Docker Container

# استخدام Node.js الرسمي كصورة أساسية
FROM node:18-alpine AS base

# تعيين متغيرات البيئة
ENV NODE_ENV=production
ENV PORT=8080
ENV APP_NAME="ringlight-pos"

# تعيين مجلد العمل
WORKDIR /app

# إنشاء مستخدم غير جذر للأمان
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ringlight -u 1001

# نسخ ملفات package
COPY package*.json ./

# مرحلة التبعيات
FROM base AS deps

# تثبيت التبعيات
RUN npm ci --only=production && npm cache clean --force

# مرحلة البناء
FROM base AS builder

# نسخ التبعيات
COPY --from=deps /app/node_modules ./node_modules

# نسخ ملفات المصدر
COPY . .

# بناء التطبيق (إذا كان هناك خطوة بناء)
# RUN npm run build

# مرحلة الإنتاج
FROM base AS runner

# تثبيت الحزم المطلوبة للتشغيل
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates

# نسخ التبعيات المطلوبة فقط
COPY --from=deps --chown=ringlight:nodejs /app/node_modules ./node_modules

# نسخ ملفات التطبيق
COPY --chown=ringlight:nodejs . .

# إنشاء مجلدات البيانات
RUN mkdir -p /app/data /app/backups /app/logs && \
    chown -R ringlight:nodejs /app/data /app/backups /app/logs

# تعيين الأذونات
RUN chmod +x start.js start.sh

# التبديل للمستخدم غير الجذر
USER ringlight

# كشف المنفذ
EXPOSE 8080

# فحص صحة التطبيق
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# نقطة الدخول
ENTRYPOINT ["dumb-init", "--"]

# الأمر الافتراضي
CMD ["node", "start.js", "--server"]

# ===================================
# مرحلة التطوير (اختيارية)
# ===================================
FROM base AS development

# تثبيت جميع التبعيات (بما في ذلك dev dependencies)
RUN npm ci && npm cache clean --force

# نسخ ملفات المصدر
COPY . .

# تعيين متغير البيئة للتطوير
ENV NODE_ENV=development

# كشف منفذ إضافي للتطوير
EXPOSE 8080 9229

# المستخدم الجذر للتطوير (لسهولة التطوير)
USER root

# أمر التطوير
CMD ["npm", "run", "dev"]

# ===================================
# مرحلة البناء للإنتاج
# ===================================
FROM node:18-alpine AS build-production

# تثبيت الأدوات المطلوبة للبناء
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت جميع التبعيات
RUN npm ci

# نسخ ملفات المصدر
COPY . .

# بناء التطبيق لجميع المنصات
RUN npm run build-all

# إنشاء أرشيف للتوزيع
RUN tar -czf ringlight-pos-dist.tar.gz dist/

# ===================================
# مرحلة النشر
# ===================================
FROM nginx:alpine AS deploy

# نسخ الملفات المبنية
COPY --from=runner /app /usr/share/nginx/html

# تكوين nginx للتطبيقات أحادية الصفحة
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # دعم التطبيقات أحادية الصفحة
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # تحسين الملفات الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ضغط الملفات
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# كشف المنفذ
EXPOSE 80

# أمر التشغيل
CMD ["nginx", "-g", "daemon off;"]
