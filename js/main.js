// رينج لايت - الملف الرئيسي للتطبيق
// Main Application File

class RingLightApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isLoggedIn = false;
        this.settings = {};
        this.notifications = [];
        
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    init() {
        // تحميل الإعدادات
        this.loadSettings();
        
        // تطبيق الثيم المحفوظ
        this.applyTheme();
        
        // التحقق من حالة تسجيل الدخول
        this.checkLoginStatus();
        
        // ربط الأحداث
        this.bindEvents();
        
        // تهيئة الإشعارات
        this.initNotifications();
        
        // إنشاء نسخة احتياطية تلقائية يومياً
        this.scheduleAutoBackup();

        // تسجيل Service Worker للـ PWA
        this.registerServiceWorker();

        console.log('تم تهيئة تطبيق رينج لايت بنجاح');
    }

    /**
     * تحميل الإعدادات
     */
    loadSettings() {
        this.settings = DB.getTable('settings');
        
        // تطبيق الإعدادات على الواجهة
        if (this.settings.companyName) {
            document.title = `${this.settings.companyName} - رينج لايت`;
        }
    }

    /**
     * تطبيق الثيم
     */
    applyTheme() {
        const theme = this.settings.theme || 'theme-blue';
        document.body.className = theme;
        
        // حفظ الثيم في localStorage منفصل للوصول السريع
        localStorage.setItem('ringlight_current_theme', theme);
    }

    /**
     * التحقق من حالة تسجيل الدخول
     */
    checkLoginStatus() {
        const lastLogin = localStorage.getItem('ringlight_last_login');
        const rememberLogin = localStorage.getItem('ringlight_remember_login');
        
        if (rememberLogin === 'true' && lastLogin) {
            const loginTime = new Date(lastLogin);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // تسجيل الدخول صالح لمدة 24 ساعة
            if (hoursDiff < 24) {
                this.isLoggedIn = true;
                this.showMainApp();
                return;
            }
        }
        
        // إظهار شاشة تسجيل الدخول
        this.showLoginScreen();
    }

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // إظهار/إخفاء كلمة المرور
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', this.togglePasswordVisibility);
        }

        // البحث العام
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
        }

        // تغيير الثيم
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.showThemeSelector());
        }

        // الإشعارات
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        // قائمة المستخدم
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }

        // إغلاق القوائم المنسدلة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.closeUserMenu();
            }
        });

        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // حفظ تلقائي كل 5 دقائق
        if (this.settings.autoSave) {
            setInterval(() => this.autoSave(), 5 * 60 * 1000);
        }

        // التحقق من الاتصال بالإنترنت
        window.addEventListener('online', () => this.showNotification('تم استعادة الاتصال بالإنترنت', 'success'));
        window.addEventListener('offline', () => this.showNotification('تم فقدان الاتصال بالإنترنت', 'warning'));
    }

    /**
     * معالجة تسجيل الدخول
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const passwordInput = document.getElementById('password');
        const password = Utils.toEnglishNumbers(passwordInput.value.trim());
        
        if (!password) {
            this.showNotification('يرجى إدخال كلمة المرور', 'error');
            return;
        }

        // التحقق من كلمة المرور
        if (DB.verifyPassword(password, this.settings.password)) {
            this.isLoggedIn = true;
            
            // حفظ وقت تسجيل الدخول
            const now = new Date().toISOString();
            localStorage.setItem('ringlight_last_login', now);
            localStorage.setItem('ringlight_remember_login', 'true');
            
            // تحديث آخر تسجيل دخول في الإعدادات
            DB.update('settings', 'settings', { lastLogin: now });
            
            // إظهار التطبيق الرئيسي
            this.showMainApp();
            
            this.showNotification('مرحباً بك في رينج لايت', 'success');
        } else {
            this.showNotification('كلمة المرور غير صحيحة', 'error');
            passwordInput.focus();
        }
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // مسح بيانات تسجيل الدخول
        localStorage.removeItem('ringlight_last_login');
        localStorage.removeItem('ringlight_remember_login');
        
        // إظهار شاشة تسجيل الدخول
        this.showLoginScreen();
        
        this.showNotification('تم تسجيل الخروج بنجاح', 'info');
    }

    /**
     * إظهار شاشة تسجيل الدخول
     */
    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        
        // تركيز على حقل كلمة المرور
        setTimeout(() => {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 100);
    }

    /**
     * إظهار التطبيق الرئيسي
     */
    showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // تحميل لوحة المعلومات
        this.showPage('dashboard');
    }

    /**
     * إظهار/إخفاء كلمة المرور
     */
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.toggle-password i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    /**
     * عرض صفحة معينة
     */
    showPage(pageName) {
        this.currentPage = pageName;
        
        // تحديث الشريط الجانبي
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[onclick="showPage('${pageName}')"]`)?.parentElement;
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // تحميل محتوى الصفحة
        this.loadPageContent(pageName);
    }

    /**
     * تحميل محتوى الصفحة
     */
    async loadPageContent(pageName) {
        const pageContent = document.getElementById('pageContent');
        
        try {
            // إظهار مؤشر التحميل
            pageContent.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>جاري التحميل...</p>
                </div>
            `;
            
            // تحميل محتوى الصفحة حسب النوع
            let content = '';
            
            switch (pageName) {
                case 'dashboard':
                    content = await this.loadDashboard();
                    break;
                case 'sales':
                    content = await this.loadSales();
                    break;
                case 'products':
                    content = await this.loadProducts();
                    break;
                case 'customers':
                    content = await this.loadCustomers();
                    break;
                case 'suppliers':
                    content = await this.loadSuppliers();
                    break;
                case 'purchases':
                    content = await this.loadPurchases();
                    break;
                case 'debts':
                    content = await this.loadDebts();
                    break;
                case 'reports':
                    content = await this.loadReports();
                    break;
                case 'settings':
                    content = await this.loadSettings();
                    break;
                default:
                    content = '<div class="error-message">الصفحة غير موجودة</div>';
            }
            
            pageContent.innerHTML = content;
            
            // تهيئة الصفحة المحملة
            this.initializePage(pageName);
            
        } catch (error) {
            console.error(`خطأ في تحميل صفحة ${pageName}:`, error);
            pageContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>خطأ في التحميل</h3>
                    <p>حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
                    <button class="btn btn-primary" onclick="app.showPage('${pageName}')">
                        إعادة المحاولة
                    </button>
                </div>
            `;
        }
    }

    /**
     * تهيئة الصفحة المحملة
     */
    initializePage(pageName) {
        // تهيئة الأحداث الخاصة بكل صفحة
        switch (pageName) {
            case 'dashboard':
                if (window.Dashboard) {
                    window.Dashboard.init();
                }
                break;
            case 'products':
                if (window.Products) {
                    window.Products.init();
                }
                break;
            case 'sales':
                if (window.Sales) {
                    window.Sales.init();
                }
                break;
            // إضافة المزيد من الصفحات حسب الحاجة
        }
    }

    /**
     * البحث العام
     */
    handleGlobalSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return;
        
        // البحث في المنتجات والعملاء والموردين
        const products = Utils.searchArray(DB.getTable('products'), searchTerm, ['name', 'description', 'barcode']);
        const customers = Utils.searchArray(DB.getTable('customers'), searchTerm, ['name', 'phone', 'email']);
        const suppliers = Utils.searchArray(DB.getTable('suppliers'), searchTerm, ['name', 'phone', 'email']);
        
        // إظهار نتائج البحث
        this.showSearchResults({ products, customers, suppliers });
    }

    /**
     * إظهار نتائج البحث
     */
    showSearchResults(results) {
        // تنفيذ عرض نتائج البحث
        console.log('نتائج البحث:', results);
    }

    /**
     * إظهار منتقي الثيمات
     */
    showThemeSelector() {
        const themes = [
            { name: 'الأزرق', value: 'theme-blue' },
            { name: 'الأخضر', value: 'theme-green' },
            { name: 'البنفسجي', value: 'theme-purple' },
            { name: 'الوردي', value: 'theme-pink' },
            { name: 'البرتقالي', value: 'theme-orange' },
            { name: 'الأحمر', value: 'theme-red' },
            { name: 'الرمادي', value: 'theme-gray' },
            { name: 'الداكن', value: 'theme-dark' },
            { name: 'الذهبي', value: 'theme-gold' },
            { name: 'الفيروزي', value: 'theme-teal' },
            { name: 'الأزرق الفاتح', value: 'theme-sky' }
        ];
        
        let themeOptions = '';
        themes.forEach(theme => {
            const isActive = this.settings.theme === theme.value ? 'active' : '';
            themeOptions += `
                <div class="theme-option ${isActive}" onclick="app.changeTheme('${theme.value}')">
                    <div class="theme-preview">
                        <div class="theme-preview-color color-1"></div>
                        <div class="theme-preview-color color-2"></div>
                        <div class="theme-preview-color color-3"></div>
                    </div>
                    <span class="theme-option-name">${theme.name}</span>
                </div>
            `;
        });
        
        this.showModal('اختيار الثيم', `
            <div class="theme-selector">
                ${themeOptions}
            </div>
        `);
    }

    /**
     * تغيير الثيم
     */
    changeTheme(themeName) {
        this.settings.theme = themeName;
        DB.update('settings', 'settings', { theme: themeName });
        
        this.applyTheme();
        this.closeModal();
        
        this.showNotification('تم تغيير الثيم بنجاح', 'success');
    }

    /**
     * إظهار/إخفاء قائمة المستخدم
     */
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    /**
     * إغلاق قائمة المستخدم
     */
    closeUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.remove('show');
    }

    /**
     * معالجة اختصارات لوحة المفاتيح
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S للحفظ
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.autoSave();
            this.showNotification('تم الحفظ', 'success');
        }
        
        // Escape لإغلاق النوافذ المنبثقة
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeUserMenu();
        }
        
        // F1 للمساعدة
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    }

    /**
     * الحفظ التلقائي
     */
    autoSave() {
        try {
            DB.createAutoBackup();
            console.log('تم إنشاء نسخة احتياطية تلقائية');
        } catch (error) {
            console.error('خطأ في الحفظ التلقائي:', error);
        }
    }

    /**
     * جدولة النسخ الاحتياطي التلقائي
     */
    scheduleAutoBackup() {
        // إنشاء نسخة احتياطية كل 24 ساعة
        setInterval(() => {
            this.autoSave();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * تسجيل Service Worker للـ PWA
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);

                // التحقق من التحديثات
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // معالجة رسائل من Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * إظهار إشعار التحديث
     */
    showUpdateNotification() {
        this.showNotification(
            'يتوفر تحديث جديد للتطبيق. أعد تحميل الصفحة للحصول على أحدث إصدار.',
            'info',
            10000
        );
    }

    /**
     * معالجة رسائل Service Worker
     */
    handleServiceWorkerMessage(data) {
        const { type, payload } = data;

        switch (type) {
            case 'VERSION':
                console.log('Service Worker version:', payload);
                break;
            case 'CACHE_CLEARED':
                if (payload) {
                    this.showNotification('تم مسح التخزين المؤقت بنجاح', 'success');
                } else {
                    this.showNotification('فشل في مسح التخزين المؤقت', 'error');
                }
                break;
        }
    }

    /**
     * تهيئة الإشعارات
     */
    initNotifications() {
        // طلب إذن الإشعارات
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // التحقق من التنبيهات المهمة
        this.checkImportantAlerts();
    }

    /**
     * التحقق من التنبيهات المهمة
     */
    checkImportantAlerts() {
        // تنبيهات نفاد المخزون
        const products = DB.getTable('products');
        const lowStockProducts = products.filter(product => 
            product.quantity <= (product.minQuantity || 5)
        );
        
        if (lowStockProducts.length > 0) {
            this.showNotification(
                `تحذير: ${Utils.toArabicNumbers(lowStockProducts.length)} منتج على وشك النفاد`,
                'warning'
            );
        }
        
        // تنبيهات الديون المتأخرة
        const customers = DB.getTable('customers');
        const overdueCustomers = customers.filter(customer => 
            customer.balance < 0 && customer.lastPaymentDate
        );
        
        if (overdueCustomers.length > 0) {
            this.showNotification(
                `تنبيه: ${Utils.toArabicNumbers(overdueCustomers.length)} عميل لديه ديون متأخرة`,
                'info'
            );
        }
    }

    /**
     * إظهار إشعار
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notifications');
        container.appendChild(notification);

        // إزالة الإشعار تلقائياً
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);

        // إشعار المتصفح إذا كان مسموحاً
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('رينج لايت', {
                body: message,
                icon: '/assets/icons/icon-192.png'
            });
        }
    }

    /**
     * الحصول على أيقونة الإشعار
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * إظهار نافذة منبثقة
     */
    showModal(title, content, footer = '') {
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalFooter').innerHTML = footer;

        overlay.classList.remove('hidden');

        // تركيز على أول عنصر قابل للتفاعل
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea, button');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    /**
     * إغلاق النافذة المنبثقة
     */
    closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    }

    /**
     * إظهار المساعدة
     */
    showHelp() {
        this.showModal('المساعدة', `
            <div class="help-content">
                <h4>اختصارات لوحة المفاتيح:</h4>
                <ul>
                    <li><kbd>Ctrl + S</kbd> - حفظ</li>
                    <li><kbd>Esc</kbd> - إغلاق النوافذ</li>
                    <li><kbd>F1</kbd> - المساعدة</li>
                </ul>

                <h4>نصائح الاستخدام:</h4>
                <ul>
                    <li>استخدم البحث السريع للعثور على المنتجات والعملاء</li>
                    <li>يتم حفظ البيانات تلقائياً كل 5 دقائق</li>
                    <li>يمكنك تغيير الثيم من الإعدادات</li>
                </ul>
            </div>
        `);
    }

    // وظائف تحميل الصفحات
    async loadDashboard() {
        // سيتم تحميل المحتوى بواسطة dashboard.js
        return '<div id="dashboardContent"></div>';
    }

    async loadSales() {
        // سيتم تحميل المحتوى بواسطة sales.js
        return '<div id="salesContent"></div>';
    }

    async loadProducts() {
        // سيتم تحميل المحتوى بواسطة products.js
        return '<div id="productsContent"></div>';
    }

    async loadCustomers() {
        return `
            <div class="customers-container">
                <div class="page-header">
                    <h1>إدارة العملاء</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="showAddCustomerModal()">
                            <i class="fas fa-plus"></i>
                            إضافة عميل جديد
                        </button>
                    </div>
                </div>
                <div id="customersTable"></div>
            </div>
        `;
    }

    async loadSuppliers() {
        return `
            <div class="suppliers-container">
                <div class="page-header">
                    <h1>إدارة الموردين</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="showAddSupplierModal()">
                            <i class="fas fa-plus"></i>
                            إضافة مورد جديد
                        </button>
                    </div>
                </div>
                <div id="suppliersTable"></div>
            </div>
        `;
    }

    async loadPurchases() {
        return `
            <div class="purchases-container">
                <div class="page-header">
                    <h1>إدارة المشتريات</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="showAddPurchaseModal()">
                            <i class="fas fa-plus"></i>
                            إضافة مشترى جديد
                        </button>
                    </div>
                </div>
                <div id="purchasesTable"></div>
            </div>
        `;
    }

    async loadDebts() {
        return `
            <div class="debts-container">
                <div class="page-header">
                    <h1>إدارة الديون والمدفوعات</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="showPaymentModal()">
                            <i class="fas fa-money-bill-wave"></i>
                            تسجيل دفعة
                        </button>
                    </div>
                </div>

                <div class="debts-summary">
                    <div class="summary-card">
                        <h3>إجمالي الديون</h3>
                        <div class="summary-value" id="totalDebtsAmount">٠ ريال</div>
                    </div>
                    <div class="summary-card">
                        <h3>الديون المتأخرة</h3>
                        <div class="summary-value" id="overdueDebtsAmount">٠ ريال</div>
                    </div>
                    <div class="summary-card">
                        <h3>المدفوعات اليوم</h3>
                        <div class="summary-value" id="todayPaymentsAmount">٠ ريال</div>
                    </div>
                </div>

                <div id="debtsTable"></div>
            </div>
        `;
    }

    async loadReports() {
        return `
            <div class="reports-container">
                <div class="page-header">
                    <h1>التقارير والإحصائيات</h1>
                </div>

                <div class="reports-grid">
                    <div class="report-card" onclick="generateSalesReport()">
                        <div class="report-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="report-info">
                            <h3>تقرير المبيعات</h3>
                            <p>تقرير شامل عن المبيعات والأرباح</p>
                        </div>
                    </div>

                    <div class="report-card" onclick="generateInventoryReport()">
                        <div class="report-icon">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="report-info">
                            <h3>تقرير المخزون</h3>
                            <p>حالة المخزون والمنتجات</p>
                        </div>
                    </div>

                    <div class="report-card" onclick="generateCustomersReport()">
                        <div class="report-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="report-info">
                            <h3>تقرير العملاء</h3>
                            <p>إحصائيات العملاء والديون</p>
                        </div>
                    </div>

                    <div class="report-card" onclick="generateFinancialReport()">
                        <div class="report-icon">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="report-info">
                            <h3>التقرير المالي</h3>
                            <p>الأرباح والخسائر والتدفق النقدي</p>
                        </div>
                    </div>
                </div>

                <div id="reportContent"></div>
            </div>
        `;
    }

    async loadSettings() {
        const settings = DB.getTable('settings');

        return `
            <div class="settings-container">
                <div class="page-header">
                    <h1>الإعدادات</h1>
                </div>

                <div class="settings-tabs">
                    <button class="tab-button active" onclick="showSettingsTab('company')">بيانات الشركة</button>
                    <button class="tab-button" onclick="showSettingsTab('system')">إعدادات النظام</button>
                    <button class="tab-button" onclick="showSettingsTab('security')">الأمان</button>
                    <button class="tab-button" onclick="showSettingsTab('backup')">النسخ الاحتياطي</button>
                </div>

                <div class="settings-content">
                    <div id="companySettings" class="settings-tab active">
                        <form id="companyForm" class="settings-form">
                            <div class="form-group">
                                <label for="companyName">اسم الشركة</label>
                                <input type="text" id="companyName" name="companyName" value="${settings.companyName || ''}" required>
                            </div>

                            <div class="form-group">
                                <label for="companyAddress">عنوان الشركة</label>
                                <textarea id="companyAddress" name="companyAddress" rows="3">${settings.companyAddress || ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label for="companyPhone">هاتف الشركة</label>
                                <input type="tel" id="companyPhone" name="companyPhone" value="${settings.companyPhone || ''}">
                            </div>

                            <div class="form-group">
                                <label for="companyEmail">بريد الشركة الإلكتروني</label>
                                <input type="email" id="companyEmail" name="companyEmail" value="${settings.companyEmail || ''}">
                            </div>

                            <div class="form-group">
                                <label for="taxRate">نسبة الضريبة (%)</label>
                                <input type="number" id="taxRate" name="taxRate" min="0" max="100" step="0.01" value="${settings.taxRate || 15}">
                            </div>

                            <div class="form-group">
                                <label for="currency">العملة</label>
                                <input type="text" id="currency" name="currency" value="${settings.currency || 'ريال'}">
                            </div>

                            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                        </form>
                    </div>

                    <div id="systemSettings" class="settings-tab">
                        <form id="systemForm" class="settings-form">
                            <div class="form-group">
                                <label for="theme">الثيم</label>
                                <select id="theme" name="theme">
                                    <option value="theme-blue" ${settings.theme === 'theme-blue' ? 'selected' : ''}>الأزرق</option>
                                    <option value="theme-green" ${settings.theme === 'theme-green' ? 'selected' : ''}>الأخضر</option>
                                    <option value="theme-purple" ${settings.theme === 'theme-purple' ? 'selected' : ''}>البنفسجي</option>
                                    <option value="theme-dark" ${settings.theme === 'theme-dark' ? 'selected' : ''}>الداكن</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="autoSave" name="autoSave" ${settings.autoSave ? 'checked' : ''}>
                                    الحفظ التلقائي
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                        </form>
                    </div>

                    <div id="securitySettings" class="settings-tab">
                        <form id="securityForm" class="settings-form">
                            <div class="form-group">
                                <label for="currentPassword">كلمة المرور الحالية</label>
                                <input type="password" id="currentPassword" name="currentPassword" required>
                            </div>

                            <div class="form-group">
                                <label for="newPassword">كلمة المرور الجديدة</label>
                                <input type="password" id="newPassword" name="newPassword" required>
                            </div>

                            <div class="form-group">
                                <label for="confirmPassword">تأكيد كلمة المرور</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>

                            <button type="submit" class="btn btn-primary">تغيير كلمة المرور</button>
                        </form>
                    </div>

                    <div id="backupSettings" class="settings-tab">
                        <div class="backup-section">
                            <h3>النسخ الاحتياطي</h3>
                            <p>قم بإنشاء نسخة احتياطية من بياناتك بانتظام لضمان عدم فقدانها.</p>

                            <div class="backup-actions">
                                <button class="btn btn-primary" onclick="createBackup()">
                                    <i class="fas fa-download"></i>
                                    إنشاء نسخة احتياطية
                                </button>

                                <button class="btn btn-secondary" onclick="showRestoreModal()">
                                    <i class="fas fa-upload"></i>
                                    استعادة من نسخة احتياطية
                                </button>

                                <button class="btn btn-danger" onclick="clearAllData()">
                                    <i class="fas fa-trash"></i>
                                    مسح جميع البيانات
                                </button>
                            </div>

                            <div class="storage-info" id="storageInfo">
                                <!-- سيتم تحميل معلومات التخزين هنا -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// إنشاء مثيل التطبيق
const app = new RingLightApp();

// تصدير التطبيق للاستخدام العام
window.app = app;

// وظائف عامة للاستخدام في HTML
function showPage(pageName) {
    app.showPage(pageName);
}

function logout() {
    app.logout();
}

function showSettings() {
    app.showPage('settings');
}
