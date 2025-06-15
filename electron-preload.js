// رينج لايت - ملف Electron Preload
// Electron Preload Script

const { contextBridge, ipcRenderer } = require('electron');

// تعريض APIs آمنة للنافذة الرئيسية
contextBridge.exposeInMainWorld('electronAPI', {
    // معلومات النظام
    platform: process.platform,
    version: process.versions.electron,
    
    // النسخ الاحتياطي
    createBackup: () => ipcRenderer.invoke('create-backup'),
    restoreBackup: () => ipcRenderer.invoke('restore-backup'),
    
    // الطباعة
    printInvoice: (content) => ipcRenderer.invoke('print-invoice', content),
    
    // درج النقد
    openCashDrawer: () => ipcRenderer.invoke('open-cash-drawer'),
    
    // الأحداث
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },
    
    // إزالة المستمعين
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// تحسينات الأداء
window.addEventListener('DOMContentLoaded', () => {
    // تحسين الخطوط
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
    
    // تحسين الصور
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
});

// معالجة الأخطاء
window.addEventListener('error', (event) => {
    console.error('خطأ في التطبيق:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('وعد مرفوض:', event.reason);
});

// تحسينات الذاكرة
window.addEventListener('beforeunload', () => {
    // تنظيف الموارد
    if (window.charts) {
        Object.values(window.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    
    // إزالة المستمعين
    ipcRenderer.removeAllListeners('menu-action');
});

console.log('تم تحميل Electron Preload بنجاح');
