// رينج لايت - ملف Electron الرئيسي
// Electron Main Process

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeTheme, powerMonitor, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');

// تفعيل إعادة التحميل التلقائي في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

class RingLightApp {
    constructor() {
        this.mainWindow = null;
        this.splashWindow = null;
        this.isQuitting = false;
        this.isFirstRun = false;

        this.init();
    }

    init() {
        // إعداد التطبيق
        this.setupApp();
        
        // إعداد الأحداث
        this.setupEvents();
        
        // إعداد القائمة
        this.setupMenu();
        
        // إعداد IPC
        this.setupIPC();
    }

    setupApp() {
        // تعيين اسم التطبيق
        app.setName('رينج لايت');
        
        // تعيين معرف التطبيق
        if (process.platform === 'win32') {
            app.setAppUserModelId('com.ringlight.pos');
        }
        
        // تفعيل الأمان
        app.commandLine.appendSwitch('--disable-web-security');
        app.commandLine.appendSwitch('--allow-running-insecure-content');
    }

    setupEvents() {
        // عند جاهزية التطبيق
        app.whenReady().then(() => {
            this.createSplashWindow();
            this.setupAutoUpdater();

            // على macOS، إعادة إنشاء النافذة عند النقر على الأيقونة
            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createMainWindow();
                }
            });
        });

        // عند إغلاق جميع النوافذ
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // قبل الإغلاق
        app.on('before-quit', () => {
            this.isQuitting = true;
        });

        // عند الإغلاق
        app.on('will-quit', (event) => {
            // يمكن إضافة منطق حفظ البيانات هنا
        });
    }

    createSplashWindow() {
        // إنشاء نافذة البداية
        this.splashWindow = new BrowserWindow({
            width: 400,
            height: 300,
            frame: false,
            alwaysOnTop: true,
            transparent: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // تحميل صفحة البداية
        this.splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #4f46e5, #7c3aed);
                        color: white;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px;
                        margin-bottom: 20px;
                        animation: pulse 2s infinite;
                    }
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        font-size: 14px;
                        opacity: 0.8;
                        margin-bottom: 30px;
                    }
                    .loading {
                        width: 200px;
                        height: 4px;
                        background: rgba(255,255,255,0.3);
                        border-radius: 2px;
                        overflow: hidden;
                    }
                    .loading-bar {
                        width: 0%;
                        height: 100%;
                        background: white;
                        border-radius: 2px;
                        animation: loading 3s ease-in-out;
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes loading {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="logo">💡</div>
                <div class="title">رينج لايت</div>
                <div class="subtitle">نظام إدارة نقاط البيع العربي</div>
                <div class="loading">
                    <div class="loading-bar"></div>
                </div>
            </body>
            </html>
        `)}`);

        // إغلاق splash window بعد 3 ثواني وإنشاء النافذة الرئيسية
        setTimeout(() => {
            this.createMainWindow();
            if (this.splashWindow) {
                this.splashWindow.close();
                this.splashWindow = null;
            }
        }, 3000);
    }

    createMainWindow() {
        // إنشاء النافذة الرئيسية
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1024,
            minHeight: 768,
            title: 'رينج لايت - نظام إدارة نقاط البيع',
            icon: this.getIconPath(),
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'electron-preload.js'),
                webSecurity: false
            },
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
        });

        // تحميل الصفحة الرئيسية
        this.mainWindow.loadFile('index.html');

        // إظهار النافذة عند الجاهزية
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            
            // تركيز النافذة
            this.mainWindow.focus();
            
            // فتح أدوات المطور في بيئة التطوير
            if (process.env.NODE_ENV === 'development') {
                this.mainWindow.webContents.openDevTools();
            }
        });

        // عند إغلاق النافذة
        this.mainWindow.on('close', (event) => {
            if (!this.isQuitting && process.platform === 'darwin') {
                event.preventDefault();
                this.mainWindow.hide();
            }
        });

        // عند إغلاق النافذة نهائياً
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // معالجة الروابط الخارجية
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    getIconPath() {
        const iconName = process.platform === 'win32' ? 'icon.ico' : 
                        process.platform === 'darwin' ? 'icon.icns' : 'icon.png';
        return path.join(__dirname, 'assets', 'icons', iconName);
    }

    setupAutoUpdater() {
        // إعداد التحديث التلقائي
        autoUpdater.checkForUpdatesAndNotify();

        autoUpdater.on('checking-for-update', () => {
            console.log('البحث عن تحديثات...');
        });

        autoUpdater.on('update-available', (info) => {
            console.log('تحديث متاح:', info.version);
            dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'تحديث متاح',
                message: `يتوفر تحديث جديد (${info.version}). سيتم تحميله في الخلفية.`,
                buttons: ['موافق']
            });
        });

        autoUpdater.on('update-not-available', (info) => {
            console.log('لا توجد تحديثات متاحة');
        });

        autoUpdater.on('error', (err) => {
            console.error('خطأ في التحديث:', err);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = `سرعة التحميل: ${progressObj.bytesPerSecond}`;
            log_message = log_message + ` - تم تحميل ${progressObj.percent}%`;
            log_message = log_message + ` (${progressObj.transferred}/${progressObj.total})`;
            console.log(log_message);
        });

        autoUpdater.on('update-downloaded', (info) => {
            console.log('تم تحميل التحديث');
            dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'تحديث جاهز',
                message: 'تم تحميل التحديث. سيتم تطبيقه عند إعادة تشغيل التطبيق.',
                buttons: ['إعادة التشغيل الآن', 'لاحقاً']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }

    setupMenu() {
        const template = [
            {
                label: 'ملف',
                submenu: [
                    {
                        label: 'بيع جديد',
                        accelerator: 'F3',
                        click: () => {
                            this.mainWindow.webContents.send('menu-action', 'new-sale');
                        }
                    },
                    {
                        label: 'إتمام البيع',
                        accelerator: 'F2',
                        click: () => {
                            this.mainWindow.webContents.send('menu-action', 'complete-sale');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'نسخة احتياطية',
                        accelerator: 'CmdOrCtrl+B',
                        click: () => {
                            this.createBackup();
                        }
                    },
                    {
                        label: 'استعادة البيانات',
                        click: () => {
                            this.restoreBackup();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'إغلاق',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'تحرير',
                submenu: [
                    { label: 'تراجع', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                    { label: 'إعادة', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                    { type: 'separator' },
                    { label: 'قص', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                    { label: 'نسخ', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                    { label: 'لصق', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                    { label: 'تحديد الكل', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
                ]
            },
            {
                label: 'عرض',
                submenu: [
                    { label: 'إعادة تحميل', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                    { label: 'إعادة تحميل قسري', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                    { label: 'أدوات المطور', accelerator: 'F12', role: 'toggleDevTools' },
                    { type: 'separator' },
                    { label: 'تكبير', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
                    { label: 'تصغير', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
                    { label: 'حجم طبيعي', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
                    { type: 'separator' },
                    { label: 'ملء الشاشة', accelerator: 'F11', role: 'togglefullscreen' }
                ]
            },
            {
                label: 'نافذة',
                submenu: [
                    { label: 'تصغير', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                    { label: 'إغلاق', accelerator: 'CmdOrCtrl+W', role: 'close' }
                ]
            },
            {
                label: 'مساعدة',
                submenu: [
                    {
                        label: 'حول رينج لايت',
                        click: () => {
                            this.showAbout();
                        }
                    },
                    {
                        label: 'دليل المستخدم',
                        click: () => {
                            shell.openExternal('https://github.com/remonmagdy1/ringlight-pos/wiki');
                        }
                    },
                    {
                        label: 'الدعم الفني',
                        click: () => {
                            shell.openExternal('https://github.com/remonmagdy1/ringlight-pos/issues');
                        }
                    }
                ]
            }
        ];

        // تعديل القائمة لـ macOS
        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    { label: 'حول ' + app.getName(), role: 'about' },
                    { type: 'separator' },
                    { label: 'الخدمات', role: 'services', submenu: [] },
                    { type: 'separator' },
                    { label: 'إخفاء ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
                    { label: 'إخفاء الآخرين', accelerator: 'Command+Shift+H', role: 'hideothers' },
                    { label: 'إظهار الكل', role: 'unhide' },
                    { type: 'separator' },
                    { label: 'إنهاء', accelerator: 'Command+Q', click: () => app.quit() }
                ]
            });
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    setupIPC() {
        // معالجة طلبات النسخ الاحتياطي
        ipcMain.handle('create-backup', async () => {
            return await this.createBackup();
        });

        // معالجة طلبات الاستعادة
        ipcMain.handle('restore-backup', async () => {
            return await this.restoreBackup();
        });

        // معالجة طلبات الطباعة
        ipcMain.handle('print-invoice', async (event, content) => {
            return await this.printInvoice(content);
        });

        // معالجة طلبات فتح درج النقد
        ipcMain.handle('open-cash-drawer', async () => {
            return await this.openCashDrawer();
        });
    }

    async createBackup() {
        try {
            const result = await dialog.showSaveDialog(this.mainWindow, {
                title: 'حفظ النسخة الاحتياطية',
                defaultPath: `ringlight-backup-${new Date().toISOString().split('T')[0]}.json`,
                filters: [
                    { name: 'ملفات JSON', extensions: ['json'] },
                    { name: 'جميع الملفات', extensions: ['*'] }
                ]
            });

            if (!result.canceled) {
                // طلب البيانات من النافذة الرئيسية
                const data = await this.mainWindow.webContents.executeJavaScript('DB.exportData()');
                
                fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
                
                return { success: true, path: result.filePath };
            }
            
            return { success: false, canceled: true };
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return { success: false, error: error.message };
        }
    }

    async restoreBackup() {
        try {
            const result = await dialog.showOpenDialog(this.mainWindow, {
                title: 'اختيار ملف النسخة الاحتياطية',
                filters: [
                    { name: 'ملفات JSON', extensions: ['json'] },
                    { name: 'جميع الملفات', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
                
                // إرسال البيانات للنافذة الرئيسية
                const success = await this.mainWindow.webContents.executeJavaScript(
                    `DB.importData(${JSON.stringify(data)})`
                );
                
                return { success, path: result.filePaths[0] };
            }
            
            return { success: false, canceled: true };
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return { success: false, error: error.message };
        }
    }

    async printInvoice(content) {
        try {
            // إنشاء نافذة طباعة مخفية
            const printWindow = new BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);
            
            // طباعة صامتة
            await printWindow.webContents.print({ silent: false });
            
            printWindow.close();
            
            return { success: true };
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            return { success: false, error: error.message };
        }
    }

    async openCashDrawer() {
        // محاكاة فتح درج النقد
        // يمكن إضافة تكامل مع أجهزة نقاط البيع الفعلية هنا
        console.log('فتح درج النقد...');
        return { success: true };
    }

    showAbout() {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'حول رينج لايت',
            message: 'رينج لايت - نظام إدارة نقاط البيع العربي',
            detail: `الإصدار: ${app.getVersion()}\n\nنظام إدارة نقاط بيع شامل ومجاني باللغة العربية\nمصمم خصيصاً للشركات الصغيرة والمتوسطة\n\n© 2024 رينج لايت. جميع الحقوق محفوظة.`,
            buttons: ['موافق']
        });
    }
}

// إنشاء مثيل التطبيق
new RingLightApp();
