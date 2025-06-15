@echo off
chcp 65001 >nul
title رينج لايت - نظام إدارة نقاط البيع العربي

echo.
echo ========================================
echo    رينج لايت - نظام إدارة نقاط البيع
echo ========================================
echo.

REM التحقق من وجود Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js غير مثبت على النظام
    echo 💡 يرجى تحميل وتثبيت Node.js من: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM التحقق من وجود npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm غير متاح
    echo 💡 يرجى إعادة تثبيت Node.js
    echo.
    pause
    exit /b 1
)

REM التحقق من وجود package.json
if not exist "package.json" (
    echo ❌ ملف package.json غير موجود
    echo 💡 تأكد من أنك في المجلد الصحيح
    echo.
    pause
    exit /b 1
)

REM التحقق من وجود node_modules
if not exist "node_modules" (
    echo 📦 تثبيت التبعيات...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل في تثبيت التبعيات
        echo.
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت التبعيات بنجاح
    echo.
)

REM تشغيل التطبيق
echo 🚀 تشغيل رينج لايت...
echo.

REM محاولة تشغيل Electron أولاً
if exist "node_modules\electron" (
    echo 🖥️  تشغيل تطبيق سطح المكتب...
    call npm start
) else (
    echo 🌐 تشغيل الخادم المحلي...
    node start.js --server
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ فشل في تشغيل التطبيق
    echo 💡 جرب الأوامر التالية:
    echo    npm install
    echo    npm start
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ تم إغلاق التطبيق
pause
