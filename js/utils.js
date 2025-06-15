// رينج لايت - الوظائف المساعدة
// Utilities and Helper Functions

/**
 * تحويل الأرقام الإنجليزية إلى عربية هندية
 * @param {string|number} input - النص أو الرقم المراد تحويله
 * @returns {string} النص بالأرقام العربية الهندية
 */
function toArabicNumbers(input) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return input.toString().replace(/[0-9]/g, (match) => arabicNumbers[parseInt(match)]);
}

/**
 * تحويل الأرقام العربية الهندية إلى إنجليزية
 * @param {string} input - النص المراد تحويله
 * @returns {string} النص بالأرقام الإنجليزية
 */
function toEnglishNumbers(input) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let result = input.toString();
    arabicNumbers.forEach((arabic, index) => {
        result = result.replace(new RegExp(arabic, 'g'), index.toString());
    });
    return result;
}

/**
 * تنسيق الأرقام مع فواصل الآلاف
 * @param {number} number - الرقم المراد تنسيقه
 * @param {boolean} useArabicNumbers - استخدام الأرقام العربية الهندية
 * @returns {string} الرقم المنسق
 */
function formatNumber(number, useArabicNumbers = true) {
    if (isNaN(number)) return '٠';
    
    const formatted = parseFloat(number).toLocaleString('ar-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    return useArabicNumbers ? toArabicNumbers(formatted) : formatted;
}

/**
 * تنسيق العملة
 * @param {number} amount - المبلغ
 * @param {string} currency - رمز العملة
 * @param {boolean} useArabicNumbers - استخدام الأرقام العربية الهندية
 * @returns {string} المبلغ المنسق
 */
function formatCurrency(amount, currency = 'ريال', useArabicNumbers = true) {
    const formattedAmount = formatNumber(amount, useArabicNumbers);
    return `${formattedAmount} ${currency}`;
}

/**
 * تنسيق التاريخ
 * @param {Date|string} date - التاريخ
 * @param {boolean} includeTime - تضمين الوقت
 * @param {boolean} useArabicNumbers - استخدام الأرقام العربية الهندية
 * @returns {string} التاريخ المنسق
 */
function formatDate(date, includeTime = false, useArabicNumbers = true) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        calendar: 'gregory'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
    }
    
    const formatted = dateObj.toLocaleDateString('ar-SA', options);
    return useArabicNumbers ? toArabicNumbers(formatted) : formatted;
}

/**
 * تنسيق التاريخ الهجري
 * @param {Date|string} date - التاريخ
 * @returns {string} التاريخ الهجري المنسق
 */
function formatHijriDate(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    try {
        const formatted = dateObj.toLocaleDateString('ar-SA-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return toArabicNumbers(formatted);
    } catch (error) {
        return formatDate(date);
    }
}

/**
 * إنشاء معرف فريد
 * @param {string} prefix - البادئة
 * @returns {string} المعرف الفريد
 */
function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}_${random}`;
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} صحة البريد الإلكتروني
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف السعودي
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} صحة رقم الهاتف
 */
function validateSaudiPhone(phone) {
    const phoneRegex = /^((\+966)|0)?[5][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * تنظيف النص من المسافات الزائدة
 * @param {string} text - النص
 * @returns {string} النص المنظف
 */
function cleanText(text) {
    if (!text) return '';
    return text.toString().trim().replace(/\s+/g, ' ');
}

/**
 * تحويل النص إلى عنوان URL صالح
 * @param {string} text - النص
 * @returns {string} عنوان URL
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * حساب النسبة المئوية
 * @param {number} value - القيمة
 * @param {number} total - المجموع الكلي
 * @returns {number} النسبة المئوية
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * حساب الضريبة
 * @param {number} amount - المبلغ
 * @param {number} taxRate - نسبة الضريبة
 * @returns {object} تفاصيل الضريبة
 */
function calculateTax(amount, taxRate = 15) {
    const taxAmount = (amount * taxRate) / 100;
    const totalAmount = amount + taxAmount;
    
    return {
        baseAmount: amount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        totalAmount: totalAmount
    };
}

/**
 * حساب الخصم
 * @param {number} amount - المبلغ الأصلي
 * @param {number} discount - قيمة الخصم أو النسبة
 * @param {boolean} isPercentage - هل الخصم نسبة مئوية
 * @returns {object} تفاصيل الخصم
 */
function calculateDiscount(amount, discount, isPercentage = false) {
    let discountAmount;
    
    if (isPercentage) {
        discountAmount = (amount * discount) / 100;
    } else {
        discountAmount = discount;
    }
    
    const finalAmount = amount - discountAmount;
    
    return {
        originalAmount: amount,
        discountAmount: discountAmount,
        finalAmount: Math.max(0, finalAmount),
        discountPercentage: isPercentage ? discount : (discountAmount / amount) * 100
    };
}

/**
 * تأخير التنفيذ
 * @param {number} ms - المدة بالميلي ثانية
 * @returns {Promise} وعد التأخير
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * إزالة التكرارات من المصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} key - المفتاح للمقارنة (للكائنات)
 * @returns {Array} المصفوفة بدون تكرارات
 */
function removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    
    return [...new Set(array)];
}

/**
 * ترتيب المصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} key - المفتاح للترتيب
 * @param {string} order - اتجاه الترتيب (asc/desc)
 * @returns {Array} المصفوفة مرتبة
 */
function sortArray(array, key, order = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return array.sort((a, b) => {
        let valueA = key ? a[key] : a;
        let valueB = key ? b[key] : b;
        
        // تحويل النصوص للمقارنة
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        if (order === 'desc') {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        } else {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
    });
}

/**
 * البحث في المصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} searchTerm - مصطلح البحث
 * @param {Array} searchKeys - المفاتيح للبحث فيها
 * @returns {Array} نتائج البحث
 */
function searchArray(array, searchTerm, searchKeys = []) {
    if (!Array.isArray(array) || !searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
        if (searchKeys.length === 0) {
            // البحث في جميع خصائص الكائن
            return Object.values(item).some(value => 
                value && value.toString().toLowerCase().includes(term)
            );
        } else {
            // البحث في المفاتيح المحددة
            return searchKeys.some(key => {
                const value = item[key];
                return value && value.toString().toLowerCase().includes(term);
            });
        }
    });
}

/**
 * تحويل الكائن إلى مصفوفة من المفاتيح والقيم
 * @param {Object} obj - الكائن
 * @returns {Array} مصفوفة من المفاتيح والقيم
 */
function objectToArray(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @returns {Promise<boolean>} نجح النسخ أم لا
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // طريقة بديلة للمتصفحات القديمة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error('فشل في نسخ النص:', error);
        return false;
    }
}

/**
 * تحميل ملف
 * @param {string} content - محتوى الملف
 * @param {string} filename - اسم الملف
 * @param {string} contentType - نوع المحتوى
 */
function downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * قراءة ملف
 * @param {File} file - الملف
 * @returns {Promise<string>} محتوى الملف
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * التحقق من دعم المتصفح لميزة معينة
 * @param {string} feature - اسم الميزة
 * @returns {boolean} مدعومة أم لا
 */
function isFeatureSupported(feature) {
    const features = {
        localStorage: typeof Storage !== 'undefined',
        clipboard: navigator.clipboard && window.isSecureContext,
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webShare: navigator.share,
        fullscreen: document.fullscreenEnabled,
        geolocation: 'geolocation' in navigator
    };
    
    return features[feature] || false;
}

/**
 * الحصول على معلومات الجهاز
 * @returns {object} معلومات الجهاز
 */
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    return {
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    };
}

// تصدير الوظائف للاستخدام العام
window.Utils = {
    toArabicNumbers,
    toEnglishNumbers,
    formatNumber,
    formatCurrency,
    formatDate,
    formatHijriDate,
    generateId,
    validateEmail,
    validateSaudiPhone,
    cleanText,
    slugify,
    calculatePercentage,
    calculateTax,
    calculateDiscount,
    delay,
    removeDuplicates,
    sortArray,
    searchArray,
    objectToArray,
    copyToClipboard,
    downloadFile,
    readFile,
    isFeatureSupported,
    getDeviceInfo
};
