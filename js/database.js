// رينج لايت - إدارة قاعدة البيانات المحلية
// Local Database Management using localStorage

class Database {
    constructor() {
        this.prefix = 'ringlight_';
        this.version = '1.0.0';
        this.initializeDatabase();
    }

    /**
     * تهيئة قاعدة البيانات
     */
    initializeDatabase() {
        // إنشاء الجداول الأساسية إذا لم تكن موجودة
        this.createTable('settings', {
            companyName: 'رينج لايت',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            companyLogo: '',
            taxRate: 15,
            currency: 'ريال',
            theme: 'theme-blue',
            language: 'ar',
            password: this.hashPassword('123'),
            lastLogin: null,
            autoSave: true,
            printSettings: {
                paperSize: 'A4',
                orientation: 'portrait',
                margins: '15mm'
            }
        });

        this.createTable('products', []);
        this.createTable('customers', [
            {
                id: 'customer_default',
                name: 'ضيف',
                phone: '',
                email: '',
                address: '',
                balance: 0,
                type: 'cash',
                createdAt: new Date().toISOString(),
                isDefault: true
            }
        ]);
        this.createTable('suppliers', []);
        this.createTable('sales', []);
        this.createTable('purchases', []);
        this.createTable('payments', []);
        this.createTable('categories', [
            { id: 'cat_general', name: 'عام', description: 'فئة عامة للمنتجات' }
        ]);
        this.createTable('users', []);
        this.createTable('logs', []);
    }

    /**
     * إنشاء جدول جديد
     * @param {string} tableName - اسم الجدول
     * @param {any} defaultData - البيانات الافتراضية
     */
    createTable(tableName, defaultData = []) {
        const key = this.prefix + tableName;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(defaultData));
        }
    }

    /**
     * الحصول على جميع البيانات من جدول
     * @param {string} tableName - اسم الجدول
     * @returns {any} البيانات
     */
    getTable(tableName) {
        try {
            const key = this.prefix + tableName;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`خطأ في قراءة الجدول ${tableName}:`, error);
            return [];
        }
    }

    /**
     * حفظ البيانات في جدول
     * @param {string} tableName - اسم الجدول
     * @param {any} data - البيانات
     * @returns {boolean} نجح الحفظ أم لا
     */
    setTable(tableName, data) {
        try {
            const key = this.prefix + tableName;
            localStorage.setItem(key, JSON.stringify(data));
            this.logAction('update', tableName, { recordsCount: Array.isArray(data) ? data.length : 1 });
            return true;
        } catch (error) {
            console.error(`خطأ في حفظ الجدول ${tableName}:`, error);
            return false;
        }
    }

    /**
     * إضافة سجل جديد
     * @param {string} tableName - اسم الجدول
     * @param {object} record - السجل الجديد
     * @returns {string|null} معرف السجل الجديد
     */
    insert(tableName, record) {
        try {
            const data = this.getTable(tableName);
            
            // إضافة معرف فريد إذا لم يكن موجوداً
            if (!record.id) {
                record.id = Utils.generateId(tableName.substr(0, 3) + '_');
            }
            
            // إضافة تاريخ الإنشاء
            if (!record.createdAt) {
                record.createdAt = new Date().toISOString();
            }
            
            // إضافة تاريخ التحديث
            record.updatedAt = new Date().toISOString();
            
            data.push(record);
            
            if (this.setTable(tableName, data)) {
                this.logAction('insert', tableName, { id: record.id });
                return record.id;
            }
            
            return null;
        } catch (error) {
            console.error(`خطأ في إضافة سجل إلى ${tableName}:`, error);
            return null;
        }
    }

    /**
     * تحديث سجل موجود
     * @param {string} tableName - اسم الجدول
     * @param {string} id - معرف السجل
     * @param {object} updates - التحديثات
     * @returns {boolean} نجح التحديث أم لا
     */
    update(tableName, id, updates) {
        try {
            const data = this.getTable(tableName);
            const index = data.findIndex(item => item.id === id);
            
            if (index === -1) {
                console.warn(`السجل ${id} غير موجود في ${tableName}`);
                return false;
            }
            
            // دمج التحديثات مع البيانات الموجودة
            data[index] = {
                ...data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            if (this.setTable(tableName, data)) {
                this.logAction('update', tableName, { id, updates: Object.keys(updates) });
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`خطأ في تحديث السجل ${id} في ${tableName}:`, error);
            return false;
        }
    }

    /**
     * حذف سجل
     * @param {string} tableName - اسم الجدول
     * @param {string} id - معرف السجل
     * @returns {boolean} نجح الحذف أم لا
     */
    delete(tableName, id) {
        try {
            const data = this.getTable(tableName);
            const index = data.findIndex(item => item.id === id);
            
            if (index === -1) {
                console.warn(`السجل ${id} غير موجود في ${tableName}`);
                return false;
            }
            
            // التحقق من عدم حذف السجلات المحمية
            if (data[index].isDefault || data[index].protected) {
                console.warn(`لا يمكن حذف السجل المحمي ${id}`);
                return false;
            }
            
            data.splice(index, 1);
            
            if (this.setTable(tableName, data)) {
                this.logAction('delete', tableName, { id });
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`خطأ في حذف السجل ${id} من ${tableName}:`, error);
            return false;
        }
    }

    /**
     * البحث عن سجل بالمعرف
     * @param {string} tableName - اسم الجدول
     * @param {string} id - معرف السجل
     * @returns {object|null} السجل أو null
     */
    findById(tableName, id) {
        try {
            const data = this.getTable(tableName);
            return data.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`خطأ في البحث عن السجل ${id} في ${tableName}:`, error);
            return null;
        }
    }

    /**
     * البحث عن سجلات بشرط
     * @param {string} tableName - اسم الجدول
     * @param {function} condition - شرط البحث
     * @returns {array} السجلات المطابقة
     */
    findWhere(tableName, condition) {
        try {
            const data = this.getTable(tableName);
            return data.filter(condition);
        } catch (error) {
            console.error(`خطأ في البحث في ${tableName}:`, error);
            return [];
        }
    }

    /**
     * عد السجلات
     * @param {string} tableName - اسم الجدول
     * @param {function} condition - شرط العد (اختياري)
     * @returns {number} عدد السجلات
     */
    count(tableName, condition = null) {
        try {
            const data = this.getTable(tableName);
            return condition ? data.filter(condition).length : data.length;
        } catch (error) {
            console.error(`خطأ في عد السجلات في ${tableName}:`, error);
            return 0;
        }
    }

    /**
     * تشفير كلمة المرور
     * @param {string} password - كلمة المرور
     * @returns {string} كلمة المرور المشفرة
     */
    hashPassword(password) {
        // تشفير بسيط - يمكن تحسينه لاحقاً
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32bit integer
        }
        return hash.toString();
    }

    /**
     * التحقق من كلمة المرور
     * @param {string} password - كلمة المرور
     * @param {string} hash - كلمة المرور المشفرة
     * @returns {boolean} صحيحة أم لا
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    /**
     * تسجيل العمليات
     * @param {string} action - نوع العملية
     * @param {string} table - اسم الجدول
     * @param {object} details - تفاصيل العملية
     */
    logAction(action, table, details = {}) {
        try {
            const logs = this.getTable('logs');
            const logEntry = {
                id: Utils.generateId('log_'),
                action,
                table,
                details,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            logs.push(logEntry);
            
            // الاحتفاظ بآخر 1000 سجل فقط
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            
            localStorage.setItem(this.prefix + 'logs', JSON.stringify(logs));
        } catch (error) {
            console.error('خطأ في تسجيل العملية:', error);
        }
    }

    /**
     * تصدير البيانات
     * @returns {object} جميع البيانات
     */
    exportData() {
        try {
            const exportData = {
                version: this.version,
                exportDate: new Date().toISOString(),
                data: {}
            };
            
            // تصدير جميع الجداول
            const tables = ['settings', 'products', 'customers', 'suppliers', 'sales', 'purchases', 'payments', 'categories'];
            
            tables.forEach(table => {
                exportData.data[table] = this.getTable(table);
            });
            
            this.logAction('export', 'all', { tablesCount: tables.length });
            return exportData;
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            return null;
        }
    }

    /**
     * استيراد البيانات
     * @param {object} importData - البيانات المستوردة
     * @returns {boolean} نجح الاستيراد أم لا
     */
    importData(importData) {
        try {
            if (!importData || !importData.data) {
                throw new Error('بيانات الاستيراد غير صالحة');
            }
            
            // التحقق من إصدار البيانات
            if (importData.version && importData.version !== this.version) {
                console.warn('إصدار البيانات مختلف، قد تحدث مشاكل في التوافق');
            }
            
            // استيراد البيانات
            Object.keys(importData.data).forEach(table => {
                if (importData.data[table]) {
                    this.setTable(table, importData.data[table]);
                }
            });
            
            this.logAction('import', 'all', { 
                tablesCount: Object.keys(importData.data).length,
                importDate: importData.exportDate 
            });
            
            return true;
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return false;
        }
    }

    /**
     * مسح جميع البيانات
     * @returns {boolean} نجح المسح أم لا
     */
    clearAllData() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            keys.forEach(key => localStorage.removeItem(key));
            
            // إعادة تهيئة قاعدة البيانات
            this.initializeDatabase();
            
            this.logAction('clear', 'all', { clearedKeys: keys.length });
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }

    /**
     * الحصول على حجم البيانات المخزنة
     * @returns {object} معلومات حجم البيانات
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            const tablesSizes = {};
            
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            
            keys.forEach(key => {
                const size = localStorage.getItem(key).length;
                totalSize += size;
                const tableName = key.replace(this.prefix, '');
                tablesSizes[tableName] = size;
            });
            
            return {
                totalSize,
                totalSizeKB: Math.round(totalSize / 1024),
                tablesSizes,
                tablesCount: keys.length,
                availableSpace: this.getAvailableStorage()
            };
        } catch (error) {
            console.error('خطأ في حساب حجم البيانات:', error);
            return null;
        }
    }

    /**
     * الحصول على المساحة المتاحة في localStorage
     * @returns {number} المساحة المتاحة بالبايت
     */
    getAvailableStorage() {
        try {
            const testKey = 'test_storage_size';
            let size = 0;
            
            // اختبار المساحة المتاحة
            try {
                for (let i = 0; i < 10000; i++) {
                    localStorage.setItem(testKey, 'a'.repeat(1024 * i));
                    size = 1024 * i;
                }
            } catch (e) {
                // وصلنا للحد الأقصى
            } finally {
                localStorage.removeItem(testKey);
            }
            
            return size;
        } catch (error) {
            console.error('خطأ في حساب المساحة المتاحة:', error);
            return 0;
        }
    }

    /**
     * إنشاء نسخة احتياطية تلقائية
     */
    createAutoBackup() {
        try {
            const backupData = this.exportData();
            const backupKey = this.prefix + 'auto_backup_' + new Date().toISOString().split('T')[0];
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // الاحتفاظ بآخر 7 نسخ احتياطية فقط
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix + 'auto_backup_'))
                .sort()
                .reverse();
            
            if (backupKeys.length > 7) {
                backupKeys.slice(7).forEach(key => localStorage.removeItem(key));
            }
            
            this.logAction('auto_backup', 'all', { backupKey });
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية التلقائية:', error);
        }
    }
}

// إنشاء مثيل واحد من قاعدة البيانات
const db = new Database();

// تصدير قاعدة البيانات للاستخدام العام
window.DB = db;
