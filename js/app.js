// رينج لايت - وظائف التطبيق الإضافية
// Additional Application Functions

/**
 * مدير النوافذ المنبثقة
 */
class ModalManager {
    static show(title, content, options = {}) {
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');
        
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        
        // إعداد الأزرار
        let footerContent = '';
        if (options.buttons) {
            footerContent = options.buttons.map(btn => 
                `<button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick || ''}">${btn.text}</button>`
            ).join('');
        }
        document.getElementById('modalFooter').innerHTML = footerContent;
        
        overlay.classList.remove('hidden');
        
        // تركيز على أول عنصر
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea, button');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    static close() {
        document.getElementById('modalOverlay').classList.add('hidden');
    }
    
    static confirm(title, message, onConfirm, onCancel = null) {
        this.show(title, `<p>${message}</p>`, {
            buttons: [
                {
                    text: 'تأكيد',
                    class: 'btn-primary',
                    onclick: `ModalManager.close(); (${onConfirm.toString()})()`
                },
                {
                    text: 'إلغاء',
                    class: 'btn-secondary',
                    onclick: `ModalManager.close(); ${onCancel ? `(${onCancel.toString()})()` : ''}`
                }
            ]
        });
    }
}

/**
 * مدير الجداول
 */
class TableManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 10,
            ...options
        };
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }
    
    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        let html = '';
        
        // شريط البحث
        if (this.options.searchable) {
            html += `
                <div class="table-controls">
                    <div class="search-box">
                        <input type="text" placeholder="البحث..." onkeyup="this.tableManager.search(this.value)">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
            `;
        }
        
        // الجدول
        html += '<div class="table-responsive"><table class="data-table">';
        
        // رأس الجدول
        if (this.options.columns) {
            html += '<thead><tr>';
            this.options.columns.forEach(col => {
                const sortIcon = this.getSortIcon(col.key);
                html += `
                    <th ${this.options.sortable ? `onclick="this.tableManager.sort('${col.key}')"` : ''}>
                        ${col.title}
                        ${sortIcon}
                    </th>
                `;
            });
            if (this.options.actions) {
                html += '<th>الإجراءات</th>';
            }
            html += '</tr></thead>';
        }
        
        // محتوى الجدول
        html += '<tbody>';
        const pageData = this.getPageData();
        pageData.forEach(row => {
            html += '<tr>';
            this.options.columns.forEach(col => {
                let value = row[col.key];
                if (col.render) {
                    value = col.render(value, row);
                }
                html += `<td>${value || ''}</td>`;
            });
            
            if (this.options.actions) {
                html += `<td class="actions-cell">${this.renderActions(row)}</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        // التنقل بين الصفحات
        if (this.options.paginated) {
            html += this.renderPagination();
        }
        
        this.container.innerHTML = html;
        
        // ربط مرجع الجدول
        this.container.querySelector('.search-box input').tableManager = this;
        this.container.querySelectorAll('th[onclick]').forEach(th => {
            th.tableManager = this;
        });
    }
    
    search(term) {
        if (!term) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(row => {
                return this.options.columns.some(col => {
                    const value = row[col.key];
                    return value && value.toString().toLowerCase().includes(term.toLowerCase());
                });
            });
        }
        this.currentPage = 1;
        this.render();
    }
    
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];
            
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            if (this.sortDirection === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
        
        this.render();
    }
    
    getSortIcon(column) {
        if (!this.options.sortable) return '';
        if (this.sortColumn !== column) return '<i class="fas fa-sort"></i>';
        return this.sortDirection === 'asc' ? 
            '<i class="fas fa-sort-up"></i>' : 
            '<i class="fas fa-sort-down"></i>';
    }
    
    getPageData() {
        if (!this.options.paginated) return this.filteredData;
        
        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        return this.filteredData.slice(start, end);
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        if (totalPages <= 1) return '';
        
        let html = '<div class="pagination">';
        
        // الصفحة السابقة
        if (this.currentPage > 1) {
            html += `<button onclick="this.tableManager.goToPage(${this.currentPage - 1})">السابق</button>`;
        }
        
        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            const active = i === this.currentPage ? 'active' : '';
            html += `<button class="${active}" onclick="this.tableManager.goToPage(${i})">${Utils.toArabicNumbers(i)}</button>`;
        }
        
        // الصفحة التالية
        if (this.currentPage < totalPages) {
            html += `<button onclick="this.tableManager.goToPage(${this.currentPage + 1})">التالي</button>`;
        }
        
        html += '</div>';
        return html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.render();
    }
    
    renderActions(row) {
        if (!this.options.actions) return '';
        
        return this.options.actions.map(action => {
            return `<button class="btn btn-sm ${action.class || 'btn-secondary'}" 
                           onclick="${action.onclick.replace('{id}', row.id)}"
                           title="${action.title || ''}">
                        <i class="${action.icon}"></i>
                        ${action.text || ''}
                    </button>`;
        }).join(' ');
    }
}

/**
 * مدير النماذج
 */
class FormManager {
    static validate(formElement) {
        const errors = [];
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            
            // التحقق من الحقول المطلوبة
            if (input.hasAttribute('required') && !value) {
                errors.push(`${this.getFieldLabel(input)} مطلوب`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
            
            // التحقق من البريد الإلكتروني
            if (input.type === 'email' && value && !Utils.validateEmail(value)) {
                errors.push('البريد الإلكتروني غير صالح');
                input.classList.add('error');
            }
            
            // التحقق من رقم الهاتف
            if (input.type === 'tel' && value && !Utils.validateSaudiPhone(value)) {
                errors.push('رقم الهاتف غير صالح');
                input.classList.add('error');
            }
            
            // التحقق من الأرقام
            if (input.type === 'number' && value) {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors.push(`${this.getFieldLabel(input)} يجب أن يكون رقماً`);
                    input.classList.add('error');
                }
                
                if (input.hasAttribute('min') && num < parseFloat(input.getAttribute('min'))) {
                    errors.push(`${this.getFieldLabel(input)} يجب أن يكون أكبر من ${input.getAttribute('min')}`);
                    input.classList.add('error');
                }
                
                if (input.hasAttribute('max') && num > parseFloat(input.getAttribute('max'))) {
                    errors.push(`${this.getFieldLabel(input)} يجب أن يكون أصغر من ${input.getAttribute('max')}`);
                    input.classList.add('error');
                }
            }
        });
        
        return errors;
    }
    
    static getFieldLabel(input) {
        const label = input.closest('.form-group')?.querySelector('label');
        return label ? label.textContent : input.name || input.id || 'الحقل';
    }
    
    static getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // تحويل الأرقام العربية إلى إنجليزية
            if (typeof value === 'string' && /[٠-٩]/.test(value)) {
                value = Utils.toEnglishNumbers(value);
            }
            
            data[key] = value;
        }
        
        return data;
    }
    
    static fillForm(formElement, data) {
        Object.keys(data).forEach(key => {
            const input = formElement.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else {
                    input.value = data[key] || '';
                }
            }
        });
    }
    
    static clearForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.classList.remove('error');
        });
    }
}

/**
 * مدير الطباعة
 */
class PrintManager {
    static print(content, options = {}) {
        const printWindow = window.open('', '_blank');
        const settings = DB.getTable('settings');
        
        const html = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${options.title || 'طباعة'}</title>
                <link rel="stylesheet" href="css/style.css">
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: 'Cairo', Arial, sans-serif; }
                    .no-print { display: none !important; }
                </style>
            </head>
            <body class="print-mode">
                ${content}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }
    
    static generateInvoice(sale) {
        const settings = DB.getTable('settings');
        const customer = DB.findById('customers', sale.customerId);
        
        return `
            <div class="invoice-container">
                <div class="invoice-header">
                    <div class="company-info">
                        ${settings.companyLogo ? `<img src="${settings.companyLogo}" class="company-logo" alt="شعار الشركة">` : ''}
                        <div class="company-name">${settings.companyName}</div>
                        <div class="company-details">
                            ${settings.companyAddress ? `<div>${settings.companyAddress}</div>` : ''}
                            ${settings.companyPhone ? `<div>هاتف: ${Utils.toArabicNumbers(settings.companyPhone)}</div>` : ''}
                            ${settings.companyEmail ? `<div>بريد: ${settings.companyEmail}</div>` : ''}
                        </div>
                    </div>
                    <div class="invoice-info">
                        <div class="invoice-title">فاتورة بيع</div>
                        <div class="invoice-number">رقم الفاتورة: ${Utils.toArabicNumbers(sale.invoiceNumber)}</div>
                        <div class="invoice-date">التاريخ: ${Utils.formatDate(sale.date)}</div>
                    </div>
                </div>
                
                <div class="invoice-details">
                    <div class="customer-info">
                        <div class="section-title">بيانات العميل</div>
                        <div class="info-item">الاسم: ${customer?.name || 'ضيف'}</div>
                        ${customer?.phone ? `<div class="info-item">الهاتف: ${Utils.toArabicNumbers(customer.phone)}</div>` : ''}
                        ${customer?.address ? `<div class="info-item">العنوان: ${customer.address}</div>` : ''}
                    </div>
                    <div class="payment-info">
                        <div class="section-title">بيانات الدفع</div>
                        <div class="info-item">طريقة الدفع: ${sale.paymentMethod === 'cash' ? 'نقداً' : 'آجل'}</div>
                        <div class="info-item">حالة الدفع: ${sale.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}</div>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>م</th>
                            <th>اسم المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map((item, index) => `
                            <tr>
                                <td>${Utils.toArabicNumbers(index + 1)}</td>
                                <td class="text-right">${item.name}</td>
                                <td>${Utils.toArabicNumbers(item.quantity)}</td>
                                <td>${Utils.formatCurrency(item.price)}</td>
                                <td>${Utils.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <table class="totals-table">
                        <tr>
                            <td class="total-label">المجموع الفرعي:</td>
                            <td class="total-amount">${Utils.formatCurrency(sale.subtotal)}</td>
                        </tr>
                        ${sale.discount > 0 ? `
                            <tr>
                                <td class="total-label">الخصم:</td>
                                <td class="total-amount">${Utils.formatCurrency(sale.discount)}</td>
                            </tr>
                        ` : ''}
                        <tr>
                            <td class="total-label">الضريبة (${Utils.toArabicNumbers(settings.taxRate)}%):</td>
                            <td class="total-amount">${Utils.formatCurrency(sale.tax)}</td>
                        </tr>
                        <tr class="grand-total">
                            <td class="total-label">الإجمالي النهائي:</td>
                            <td class="total-amount">${Utils.formatCurrency(sale.total)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="invoice-footer">
                    <div class="terms-conditions">
                        <p>شكراً لتعاملكم معنا</p>
                        <p>جميع المبيعات نهائية ولا يمكن إرجاعها إلا بموافقة الإدارة</p>
                    </div>
                    
                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line">توقيع العميل</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line">توقيع البائع</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// تصدير الفئات للاستخدام العام
window.ModalManager = ModalManager;
window.TableManager = TableManager;
window.FormManager = FormManager;
window.PrintManager = PrintManager;

// إغلاق النافذة المنبثقة عند النقر على الخلفية
document.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
        ModalManager.close();
    }
});

// إغلاق النافذة المنبثقة بمفتاح Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ModalManager.close();
    }
});

// وظائف عامة للاستخدام في HTML
function closeModal() {
    ModalManager.close();
}
