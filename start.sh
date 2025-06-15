#!/bin/bash

# رينج لايت - سكريبت تشغيل Linux/macOS
# Ring Light POS - Linux/macOS Start Script

set -e

# ألوان للنص
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# رموز
CHECKMARK="✅"
CROSS="❌"
ROCKET="🚀"
COMPUTER="🖥️"
GLOBE="🌐"
PACKAGE="📦"
LIGHTBULB="💡"

echo
echo "========================================"
echo "   رينج لايت - نظام إدارة نقاط البيع"
echo "========================================"
echo

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo -e "${CROSS} Node.js غير مثبت على النظام"
    echo -e "${LIGHTBULB} يرجى تحميل وتثبيت Node.js من: https://nodejs.org"
    echo
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo -e "${CROSS} npm غير متاح"
    echo -e "${LIGHTBULB} يرجى إعادة تثبيت Node.js"
    echo
    exit 1
fi

# التحقق من وجود package.json
if [ ! -f "package.json" ]; then
    echo -e "${CROSS} ملف package.json غير موجود"
    echo -e "${LIGHTBULB} تأكد من أنك في المجلد الصحيح"
    echo
    exit 1
fi

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${PACKAGE} تثبيت التبعيات..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${CROSS} فشل في تثبيت التبعيات"
        echo
        exit 1
    fi
    echo -e "${CHECKMARK} تم تثبيت التبعيات بنجاح"
    echo
fi

# تشغيل التطبيق
echo -e "${ROCKET} تشغيل رينج لايت..."
echo

# التحقق من المعاملات
if [ "$1" = "--server" ] || [ "$1" = "-s" ]; then
    echo -e "${GLOBE} تشغيل الخادم المحلي..."
    node start.js --server
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "الاستخدام: $0 [خيارات]"
    echo
    echo "الخيارات:"
    echo "  --server, -s    تشغيل الخادم المحلي فقط"
    echo "  --help, -h      إظهار هذه المساعدة"
    echo
    echo "أمثلة:"
    echo "  $0              # تشغيل تطبيق سطح المكتب"
    echo "  $0 --server     # تشغيل الخادم المحلي"
    echo
    exit 0
else
    # محاولة تشغيل Electron أولاً
    if [ -d "node_modules/electron" ]; then
        echo -e "${COMPUTER} تشغيل تطبيق سطح المكتب..."
        npm start
    else
        echo -e "${GLOBE} Electron غير متاح، تشغيل الخادم المحلي..."
        node start.js --server
    fi
fi

if [ $? -ne 0 ]; then
    echo
    echo -e "${CROSS} فشل في تشغيل التطبيق"
    echo -e "${LIGHTBULB} جرب الأوامر التالية:"
    echo "   npm install"
    echo "   npm start"
    echo
    exit 1
fi

echo
echo -e "${CHECKMARK} تم إغلاق التطبيق"
