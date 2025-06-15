// رينج لايت - لوحة المعلومات
// Dashboard Module

class Dashboard {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
    }

    /**
     * تهيئة لوحة المعلومات
     */
    init() {
        this.render();
        this.loadStatistics();
        this.loadCharts();
        this.loadRecentActivities();
        this.loadAlerts();
        
        // تحديث البيانات كل 5 دقائق
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5 * 60 * 1000);
    }

    /**
     * عرض لوحة المعلومات
     */
    render() {
        const content = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>لوحة المعلومات</h1>
                    <div class="dashboard-actions">
                        <button class="btn btn-primary" onclick="dashboard.refresh()">
                            <i class="fas fa-sync-alt"></i>
                            تحديث
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.exportReport()">
                            <i class="fas fa-download"></i>
                            تصدير التقرير
                        </button>
                    </div>
                </div>

                <!-- الإحصائيات السريعة -->
                <div class="stats-grid">
                    <div class="stat-card" id="totalSalesCard">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalSalesValue">٠</div>
                            <div class="stat-label">إجمالي المبيعات اليوم</div>
                            <div class="stat-change" id="totalSalesChange">+٠%</div>
                        </div>
                    </div>

                    <div class="stat-card" id="totalOrdersCard">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalOrdersValue">٠</div>
                            <div class="stat-label">عدد الطلبات اليوم</div>
                            <div class="stat-change" id="totalOrdersChange">+٠%</div>
                        </div>
                    </div>

                    <div class="stat-card" id="totalProductsCard">
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalProductsValue">٠</div>
                            <div class="stat-label">إجمالي المنتجات</div>
                            <div class="stat-change" id="lowStockCount">٠ منتج ناقص</div>
                        </div>
                    </div>

                    <div class="stat-card" id="totalCustomersCard">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="totalCustomersValue">٠</div>
                            <div class="stat-label">إجمالي العملاء</div>
                            <div class="stat-change" id="newCustomersCount">+٠ جديد</div>
                        </div>
                    </div>
                </div>

                <!-- الرسوم البيانية -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>مبيعات آخر ٧ أيام</h3>
                            <div class="chart-controls">
                                <select id="salesPeriod" onchange="dashboard.updateSalesChart(this.value)">
                                    <option value="7">آخر ٧ أيام</option>
                                    <option value="30">آخر ٣٠ يوم</option>
                                    <option value="90">آخر ٩٠ يوم</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>أفضل المنتجات مبيعاً</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="productsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- الأنشطة الحديثة والتنبيهات -->
                <div class="activities-grid">
                    <div class="activity-card">
                        <div class="activity-header">
                            <h3>الأنشطة الحديثة</h3>
                            <a href="#" onclick="app.showPage('reports')">عرض الكل</a>
                        </div>
                        <div class="activity-list" id="recentActivities">
                            <!-- سيتم تحميل الأنشطة هنا -->
                        </div>
                    </div>

                    <div class="alerts-card">
                        <div class="alerts-header">
                            <h3>التنبيهات</h3>
                            <span class="alerts-count" id="alertsCount">٠</span>
                        </div>
                        <div class="alerts-list" id="alertsList">
                            <!-- سيتم تحميل التنبيهات هنا -->
                        </div>
                    </div>
                </div>

                <!-- ملخص سريع -->
                <div class="summary-grid">
                    <div class="summary-card">
                        <h4>المبيعات الشهرية</h4>
                        <div class="summary-value" id="monthlySales">٠ ريال</div>
                        <div class="summary-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="monthlyProgress" style="width: 0%"></div>
                            </div>
                            <span id="monthlyTarget">الهدف: ٠ ريال</span>
                        </div>
                    </div>

                    <div class="summary-card">
                        <h4>الديون المستحقة</h4>
                        <div class="summary-value" id="totalDebts">٠ ريال</div>
                        <div class="summary-details">
                            <span id="overdueDebts">٠ متأخر</span>
                            <span id="upcomingDebts">٠ مستحق قريباً</span>
                        </div>
                    </div>

                    <div class="summary-card">
                        <h4>المخزون</h4>
                        <div class="summary-value" id="inventoryValue">٠ ريال</div>
                        <div class="summary-details">
                            <span id="lowStockItems">٠ منتج ناقص</span>
                            <span id="outOfStockItems">٠ منتج منتهي</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = content;
    }

    /**
     * تحميل الإحصائيات
     */
    loadStatistics() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

        // مبيعات اليوم
        const todaySales = this.getSalesForPeriod(startOfDay, today);
        const yesterdaySales = this.getSalesForPeriod(yesterday, startOfDay);
        
        const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSalesYesterday = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
        const salesChange = this.calculatePercentageChange(totalSalesToday, totalSalesYesterday);

        document.getElementById('totalSalesValue').textContent = Utils.formatCurrency(totalSalesToday);
        document.getElementById('totalSalesChange').textContent = `${salesChange >= 0 ? '+' : ''}${Utils.toArabicNumbers(salesChange.toFixed(1))}%`;
        document.getElementById('totalSalesChange').className = `stat-change ${salesChange >= 0 ? 'positive' : 'negative'}`;

        // عدد الطلبات
        const ordersChange = this.calculatePercentageChange(todaySales.length, yesterdaySales.length);
        document.getElementById('totalOrdersValue').textContent = Utils.toArabicNumbers(todaySales.length);
        document.getElementById('totalOrdersChange').textContent = `${ordersChange >= 0 ? '+' : ''}${Utils.toArabicNumbers(ordersChange.toFixed(1))}%`;
        document.getElementById('totalOrdersChange').className = `stat-change ${ordersChange >= 0 ? 'positive' : 'negative'}`;

        // المنتجات
        const products = DB.getTable('products');
        const lowStockProducts = products.filter(p => p.quantity <= (p.minQuantity || 5));
        
        document.getElementById('totalProductsValue').textContent = Utils.toArabicNumbers(products.length);
        document.getElementById('lowStockCount').textContent = `${Utils.toArabicNumbers(lowStockProducts.length)} منتج ناقص`;

        // العملاء
        const customers = DB.getTable('customers');
        const newCustomersToday = customers.filter(c => {
            const createdDate = new Date(c.createdAt);
            return createdDate >= startOfDay;
        });

        document.getElementById('totalCustomersValue').textContent = Utils.toArabicNumbers(customers.length);
        document.getElementById('newCustomersCount').textContent = `+${Utils.toArabicNumbers(newCustomersToday.length)} جديد`;

        // الملخص الشهري
        this.loadMonthlySummary();
        this.loadDebtsSummary();
        this.loadInventorySummary();
    }

    /**
     * تحميل الملخص الشهري
     */
    loadMonthlySummary() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlySales = this.getSalesForPeriod(startOfMonth, now);
        const totalMonthlySales = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
        
        // هدف شهري افتراضي (يمكن تخصيصه من الإعدادات)
        const monthlyTarget = 100000;
        const progress = (totalMonthlySales / monthlyTarget) * 100;

        document.getElementById('monthlySales').textContent = Utils.formatCurrency(totalMonthlySales);
        document.getElementById('monthlyProgress').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('monthlyTarget').textContent = `الهدف: ${Utils.formatCurrency(monthlyTarget)}`;
    }

    /**
     * تحميل ملخص الديون
     */
    loadDebtsSummary() {
        const customers = DB.getTable('customers');
        const debtors = customers.filter(c => c.balance < 0);
        
        const totalDebts = debtors.reduce((sum, customer) => sum + Math.abs(customer.balance), 0);
        const overdueDebts = debtors.filter(c => {
            // منطق تحديد الديون المتأخرة
            return c.lastPaymentDate && new Date() - new Date(c.lastPaymentDate) > 30 * 24 * 60 * 60 * 1000;
        });

        document.getElementById('totalDebts').textContent = Utils.formatCurrency(totalDebts);
        document.getElementById('overdueDebts').textContent = `${Utils.toArabicNumbers(overdueDebts.length)} متأخر`;
        document.getElementById('upcomingDebts').textContent = `${Utils.toArabicNumbers(debtors.length - overdueDebts.length)} مستحق قريباً`;
    }

    /**
     * تحميل ملخص المخزون
     */
    loadInventorySummary() {
        const products = DB.getTable('products');
        const inventoryValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        const lowStockItems = products.filter(p => p.quantity <= (p.minQuantity || 5) && p.quantity > 0);
        const outOfStockItems = products.filter(p => p.quantity === 0);

        document.getElementById('inventoryValue').textContent = Utils.formatCurrency(inventoryValue);
        document.getElementById('lowStockItems').textContent = `${Utils.toArabicNumbers(lowStockItems.length)} منتج ناقص`;
        document.getElementById('outOfStockItems').textContent = `${Utils.toArabicNumbers(outOfStockItems.length)} منتج منتهي`;
    }

    /**
     * تحميل الرسوم البيانية
     */
    loadCharts() {
        this.loadSalesChart();
        this.loadProductsChart();
    }

    /**
     * تحميل رسم المبيعات
     */
    loadSalesChart(days = 7) {
        const salesData = this.getSalesChartData(days);
        const ctx = document.getElementById('salesChart').getContext('2d');

        if (this.charts.sales) {
            this.charts.sales.destroy();
        }

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'المبيعات',
                    data: salesData.values,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * تحميل رسم المنتجات
     */
    loadProductsChart() {
        const productsData = this.getTopProductsData();
        const ctx = document.getElementById('productsChart').getContext('2d');

        if (this.charts.products) {
            this.charts.products.destroy();
        }

        this.charts.products = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: productsData.labels,
                datasets: [{
                    data: productsData.values,
                    backgroundColor: [
                        'var(--primary-color)',
                        'var(--secondary-color)',
                        'var(--accent-color)',
                        'var(--success-color)',
                        'var(--warning-color)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * تحميل الأنشطة الحديثة
     */
    loadRecentActivities() {
        const logs = DB.getTable('logs').slice(-10).reverse();
        const activitiesHtml = logs.map(log => {
            const timeAgo = this.getTimeAgo(new Date(log.timestamp));
            const actionText = this.getActionText(log.action, log.table);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${this.getActionIcon(log.action)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${actionText}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('recentActivities').innerHTML = activitiesHtml || '<p class="no-data">لا توجد أنشطة حديثة</p>';
    }

    /**
     * تحميل التنبيهات
     */
    loadAlerts() {
        const alerts = [];
        
        // تنبيهات المخزون
        const products = DB.getTable('products');
        const lowStockProducts = products.filter(p => p.quantity <= (p.minQuantity || 5));
        
        lowStockProducts.forEach(product => {
            alerts.push({
                type: 'warning',
                message: `المنتج "${product.name}" على وشك النفاد (${Utils.toArabicNumbers(product.quantity)} متبقي)`,
                action: () => app.showPage('products')
            });
        });

        // تنبيهات الديون
        const customers = DB.getTable('customers');
        const overdueCustomers = customers.filter(c => 
            c.balance < 0 && c.lastPaymentDate && 
            new Date() - new Date(c.lastPaymentDate) > 30 * 24 * 60 * 60 * 1000
        );

        overdueCustomers.forEach(customer => {
            alerts.push({
                type: 'danger',
                message: `العميل "${customer.name}" لديه دين متأخر ${Utils.formatCurrency(Math.abs(customer.balance))}`,
                action: () => app.showPage('debts')
            });
        });

        // عرض التنبيهات
        const alertsHtml = alerts.slice(0, 5).map(alert => `
            <div class="alert-item alert-${alert.type}" onclick="(${alert.action.toString()})()">
                <div class="alert-icon">
                    <i class="fas ${alert.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
                </div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');

        document.getElementById('alertsList').innerHTML = alertsHtml || '<p class="no-data">لا توجد تنبيهات</p>';
        document.getElementById('alertsCount').textContent = Utils.toArabicNumbers(alerts.length);
    }

    /**
     * الحصول على المبيعات لفترة معينة
     */
    getSalesForPeriod(startDate, endDate) {
        const sales = DB.getTable('sales');
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
    }

    /**
     * حساب نسبة التغيير
     */
    calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * الحصول على بيانات رسم المبيعات
     */
    getSalesChartData(days) {
        const labels = [];
        const values = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

            const daySales = this.getSalesForPeriod(startOfDay, endOfDay);
            const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);

            labels.push(Utils.formatDate(date, false, true).split(' ')[0]);
            values.push(dayTotal);
        }

        return { labels, values };
    }

    /**
     * الحصول على بيانات أفضل المنتجات
     */
    getTopProductsData() {
        const sales = DB.getTable('sales');
        const productSales = {};

        // حساب مبيعات كل منتج
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (productSales[item.productId]) {
                    productSales[item.productId].quantity += item.quantity;
                    productSales[item.productId].total += item.total;
                } else {
                    productSales[item.productId] = {
                        name: item.name,
                        quantity: item.quantity,
                        total: item.total
                    };
                }
            });
        });

        // ترتيب المنتجات حسب الكمية المباعة
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            labels: sortedProducts.map(p => p.name),
            values: sortedProducts.map(p => p.quantity)
        };
    }

    /**
     * الحصول على وقت مضى منذ
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${Utils.toArabicNumbers(diffMins)} دقيقة`;
        if (diffHours < 24) return `منذ ${Utils.toArabicNumbers(diffHours)} ساعة`;
        return `منذ ${Utils.toArabicNumbers(diffDays)} يوم`;
    }

    /**
     * الحصول على نص العملية
     */
    getActionText(action, table) {
        const actions = {
            insert: 'إضافة',
            update: 'تحديث',
            delete: 'حذف',
            export: 'تصدير',
            import: 'استيراد'
        };

        const tables = {
            products: 'منتج',
            customers: 'عميل',
            suppliers: 'مورد',
            sales: 'عملية بيع',
            purchases: 'عملية شراء'
        };

        return `${actions[action] || action} ${tables[table] || table}`;
    }

    /**
     * الحصول على أيقونة العملية
     */
    getActionIcon(action) {
        const icons = {
            insert: 'fas fa-plus',
            update: 'fas fa-edit',
            delete: 'fas fa-trash',
            export: 'fas fa-download',
            import: 'fas fa-upload'
        };
        return icons[action] || 'fas fa-info';
    }

    /**
     * تحديث رسم المبيعات
     */
    updateSalesChart(days) {
        this.loadSalesChart(parseInt(days));
    }

    /**
     * تحديث البيانات
     */
    refresh() {
        this.loadStatistics();
        this.loadCharts();
        this.loadRecentActivities();
        this.loadAlerts();

        app.showNotification('تم تحديث البيانات', 'success');
    }

    /**
     * تصدير التقرير
     */
    exportReport() {
        const reportData = {
            date: new Date().toISOString(),
            statistics: {
                totalSales: document.getElementById('totalSalesValue').textContent,
                totalOrders: document.getElementById('totalOrdersValue').textContent,
                totalProducts: document.getElementById('totalProductsValue').textContent,
                totalCustomers: document.getElementById('totalCustomersValue').textContent
            },
            monthlySales: document.getElementById('monthlySales').textContent,
            totalDebts: document.getElementById('totalDebts').textContent,
            inventoryValue: document.getElementById('inventoryValue').textContent
        };

        const reportContent = `
تقرير لوحة المعلومات - ${Utils.formatDate(new Date(), true)}

الإحصائيات اليومية:
- إجمالي المبيعات: ${reportData.statistics.totalSales}
- عدد الطلبات: ${reportData.statistics.totalOrders}
- إجمالي المنتجات: ${reportData.statistics.totalProducts}
- إجمالي العملاء: ${reportData.statistics.totalCustomers}

الملخص الشهري:
- المبيعات الشهرية: ${reportData.monthlySales}
- الديون المستحقة: ${reportData.totalDebts}
- قيمة المخزون: ${reportData.inventoryValue}

تم إنشاء التقرير بواسطة رينج لايت
        `;

        Utils.downloadFile(reportContent, `dashboard-report-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    }

    /**
     * تنظيف الموارد
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// إنشاء مثيل لوحة المعلومات
const dashboard = new Dashboard();
window.Dashboard = dashboard;
