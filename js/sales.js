// رينج لايت - نظام المبيعات
// Sales Management Module

class Sales {
    constructor() {
        this.currentSale = {
            items: [],
            customer: null,
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentStatus: 'pending'
        };
        this.products = [];
        this.customers = [];
        this.settings = {};
    }

    /**
     * تهيئة صفحة المبيعات
     */
    init() {
        this.loadData();
        this.render();
        this.bindEvents();
        this.resetSale();
    }

    /**
     * تحميل البيانات
     */
    loadData() {
        this.products = DB.getTable('products');
        this.customers = DB.getTable('customers');
        this.settings = DB.getTable('settings');
    }

    /**
     * عرض صفحة المبيعات
     */
    render() {
        const content = `
            <div class="sales-container">
                <!-- شريط الأدوات العلوي -->
                <div class="sales-toolbar">
                    <div class="toolbar-left">
                        <h1>نقطة البيع</h1>
                        <div class="sale-info">
                            <span>فاتورة رقم: <strong id="invoiceNumber">---</strong></span>
                            <span>التاريخ: <strong>${Utils.formatDate(new Date(), true)}</strong></span>
                        </div>
                    </div>
                    <div class="toolbar-right">
                        <button class="btn btn-secondary" onclick="sales.showSalesHistory()">
                            <i class="fas fa-history"></i>
                            سجل المبيعات
                        </button>
                        <button class="btn btn-warning" onclick="sales.showReturns()">
                            <i class="fas fa-undo"></i>
                            المرتجعات
                        </button>
                        <button class="btn btn-info" onclick="sales.openCashDrawer()">
                            <i class="fas fa-cash-register"></i>
                            فتح الدرج
                        </button>
                    </div>
                </div>

                <div class="sales-layout">
                    <!-- قسم المنتجات -->
                    <div class="products-section">
                        <div class="products-header">
                            <h3>المنتجات</h3>
                            <div class="products-search">
                                <input type="text" id="productSearch" placeholder="البحث عن منتج أو باركود...">
                                <button class="btn btn-primary" onclick="sales.scanBarcode()">
                                    <i class="fas fa-barcode"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="products-grid" id="productsGrid">
                            <!-- سيتم تحميل المنتجات هنا -->
                        </div>
                        
                        <div class="products-pagination">
                            <button id="prevPage" onclick="sales.changePage(-1)">السابق</button>
                            <span id="pageInfo">صفحة ١ من ١</span>
                            <button id="nextPage" onclick="sales.changePage(1)">التالي</button>
                        </div>
                    </div>

                    <!-- قسم سلة المشتريات -->
                    <div class="cart-section">
                        <div class="cart-header">
                            <h3>سلة المشتريات</h3>
                            <button class="btn btn-danger btn-sm" onclick="sales.clearCart()">
                                <i class="fas fa-trash"></i>
                                مسح الكل
                            </button>
                        </div>
                        
                        <div class="cart-items" id="cartItems">
                            <div class="empty-cart">
                                <i class="fas fa-shopping-cart"></i>
                                <p>السلة فارغة</p>
                                <p>أضف منتجات لبدء البيع</p>
                            </div>
                        </div>
                        
                        <!-- معلومات العميل -->
                        <div class="customer-section">
                            <div class="customer-header">
                                <label>العميل:</label>
                                <button class="btn btn-sm btn-primary" onclick="sales.showCustomerModal()">
                                    <i class="fas fa-plus"></i>
                                    إضافة عميل
                                </button>
                            </div>
                            <select id="customerSelect" onchange="sales.selectCustomer(this.value)">
                                <option value="">اختر العميل</option>
                            </select>
                        </div>
                        
                        <!-- ملخص الفاتورة -->
                        <div class="invoice-summary">
                            <div class="summary-row">
                                <span>المجموع الفرعي:</span>
                                <span id="subtotalAmount">٠.٠٠ ريال</span>
                            </div>
                            <div class="summary-row">
                                <span>الخصم:</span>
                                <div class="discount-input">
                                    <input type="number" id="discountAmount" value="0" min="0" 
                                           onchange="sales.updateDiscount(this.value)">
                                    <select id="discountType" onchange="sales.updateDiscount()">
                                        <option value="amount">ريال</option>
                                        <option value="percentage">%</option>
                                    </select>
                                </div>
                            </div>
                            <div class="summary-row">
                                <span>الضريبة (${Utils.toArabicNumbers(this.settings.taxRate || 15)}%):</span>
                                <span id="taxAmount">٠.٠٠ ريال</span>
                            </div>
                            <div class="summary-row total-row">
                                <span>الإجمالي:</span>
                                <span id="totalAmount">٠.٠٠ ريال</span>
                            </div>
                        </div>
                        
                        <!-- طرق الدفع -->
                        <div class="payment-section">
                            <div class="payment-methods">
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="cash" checked 
                                           onchange="sales.updatePaymentMethod(this.value)">
                                    <span>نقداً</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="credit" 
                                           onchange="sales.updatePaymentMethod(this.value)">
                                    <span>آجل</span>
                                </label>
                            </div>
                            
                            <div class="cash-payment" id="cashPayment">
                                <div class="form-group">
                                    <label>المبلغ المدفوع:</label>
                                    <input type="number" id="paidAmount" min="0" step="0.01" 
                                           onchange="sales.calculateChange()" placeholder="٠.٠٠">
                                </div>
                                <div class="change-amount">
                                    <span>الباقي: <strong id="changeAmount">٠.٠٠ ريال</strong></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- أزرار العمليات -->
                        <div class="action-buttons">
                            <button class="btn btn-success btn-large" onclick="sales.completeSale()" id="completeSaleBtn">
                                <i class="fas fa-check"></i>
                                إتمام البيع
                            </button>
                            <button class="btn btn-info btn-large" onclick="sales.holdSale()">
                                <i class="fas fa-pause"></i>
                                تعليق البيع
                            </button>
                            <button class="btn btn-secondary btn-large" onclick="sales.resetSale()">
                                <i class="fas fa-refresh"></i>
                                بيع جديد
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = content;
    }

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // البحث في المنتجات
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
            
            // البحث بالباركود عند الضغط على Enter
            productSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchByBarcode(e.target.value);
                }
            });
        }

        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // F2 لإتمام البيع
            if (e.key === 'F2') {
                e.preventDefault();
                this.completeSale();
            }
            
            // F3 لبيع جديد
            if (e.key === 'F3') {
                e.preventDefault();
                this.resetSale();
            }
            
            // F4 لفتح الدرج
            if (e.key === 'F4') {
                e.preventDefault();
                this.openCashDrawer();
            }
        });
    }

    /**
     * إعادة تعيين البيع
     */
    resetSale() {
        this.currentSale = {
            items: [],
            customer: null,
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentStatus: 'pending'
        };
        
        this.generateInvoiceNumber();
        this.loadProducts();
        this.loadCustomers();
        this.updateCartDisplay();
        this.updateSummary();
        
        // إعادة تعيين النموذج
        document.getElementById('customerSelect').value = '';
        document.getElementById('discountAmount').value = '0';
        document.getElementById('discountType').value = 'amount';
        document.getElementById('paidAmount').value = '';
        document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
        
        this.updatePaymentMethod('cash');
    }

    /**
     * إنشاء رقم فاتورة
     */
    generateInvoiceNumber() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const sales = DB.getTable('sales');
        const todaySales = sales.filter(sale => 
            sale.date && sale.date.startsWith(today.toISOString().split('T')[0])
        );
        
        const invoiceNumber = `${dateStr}${String(todaySales.length + 1).padStart(3, '0')}`;
        document.getElementById('invoiceNumber').textContent = Utils.toArabicNumbers(invoiceNumber);
        this.currentSale.invoiceNumber = invoiceNumber;
    }

    /**
     * تحميل المنتجات
     */
    loadProducts(searchTerm = '') {
        let products = this.products.filter(p => p.quantity > 0); // المنتجات المتوفرة فقط
        
        if (searchTerm) {
            products = Utils.searchArray(products, searchTerm, ['name', 'barcode', 'description']);
        }
        
        this.displayProducts(products);
    }

    /**
     * عرض المنتجات
     */
    displayProducts(products, page = 1, pageSize = 12) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageProducts = products.slice(startIndex, endIndex);
        
        const productsGrid = document.getElementById('productsGrid');
        
        if (pageProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد منتجات متاحة</p>
                </div>
            `;
            return;
        }
        
        const productsHtml = pageProducts.map(product => `
            <div class="product-card" onclick="sales.addToCart('${product.id}')">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}">` :
                        '<i class="fas fa-box"></i>'
                    }
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-price">${Utils.formatCurrency(product.price)}</p>
                    <p class="product-stock">متوفر: ${Utils.toArabicNumbers(product.quantity)}</p>
                </div>
            </div>
        `).join('');
        
        productsGrid.innerHTML = productsHtml;
        
        // تحديث معلومات الصفحة
        const totalPages = Math.ceil(products.length / pageSize);
        document.getElementById('pageInfo').textContent = 
            `صفحة ${Utils.toArabicNumbers(page)} من ${Utils.toArabicNumbers(totalPages)}`;
        
        document.getElementById('prevPage').disabled = page <= 1;
        document.getElementById('nextPage').disabled = page >= totalPages;
    }

    /**
     * تحميل العملاء
     */
    loadCustomers() {
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = '<option value="">اختر العميل</option>';
        
        this.customers.forEach(customer => {
            customerSelect.innerHTML += `
                <option value="${customer.id}">${customer.name}</option>
            `;
        });
    }

    /**
     * البحث في المنتجات
     */
    searchProducts(searchTerm) {
        this.loadProducts(searchTerm);
    }

    /**
     * البحث بالباركود
     */
    searchByBarcode(barcode) {
        const product = this.products.find(p => p.barcode === barcode);
        if (product) {
            this.addToCart(product.id);
            document.getElementById('productSearch').value = '';
        } else {
            app.showNotification('لم يتم العثور على منتج بهذا الباركود', 'warning');
        }
    }

    /**
     * إضافة منتج للسلة
     */
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            app.showNotification('المنتج غير موجود', 'error');
            return;
        }
        
        if (product.quantity < quantity) {
            app.showNotification('الكمية المطلوبة غير متوفرة', 'warning');
            return;
        }
        
        // البحث عن المنتج في السلة
        const existingItem = this.currentSale.items.find(item => item.productId === productId);
        
        if (existingItem) {
            // زيادة الكمية
            if (existingItem.quantity + quantity <= product.quantity) {
                existingItem.quantity += quantity;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                app.showNotification('الكمية المطلوبة تتجاوز المتوفر', 'warning');
                return;
            }
        } else {
            // إضافة منتج جديد
            this.currentSale.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                total: product.price * quantity
            });
        }
        
        this.updateCartDisplay();
        this.updateSummary();
        
        app.showNotification(`تم إضافة ${product.name} للسلة`, 'success', 2000);
    }

    /**
     * تحديث عرض السلة
     */
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');

        if (this.currentSale.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>السلة فارغة</p>
                    <p>أضف منتجات لبدء البيع</p>
                </div>
            `;
            return;
        }

        const itemsHtml = this.currentSale.items.map((item, index) => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-price">${Utils.formatCurrency(item.price)}</p>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button onclick="sales.updateItemQuantity(${index}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span>${Utils.toArabicNumbers(item.quantity)}</span>
                        <button onclick="sales.updateItemQuantity(${index}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-total">${Utils.formatCurrency(item.total)}</div>
                    <button class="remove-item" onclick="sales.removeFromCart(${index})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartItems.innerHTML = itemsHtml;
    }

    /**
     * تحديث كمية منتج في السلة
     */
    updateItemQuantity(itemIndex, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(itemIndex);
            return;
        }

        const item = this.currentSale.items[itemIndex];
        const product = this.products.find(p => p.id === item.productId);

        if (newQuantity > product.quantity) {
            app.showNotification('الكمية المطلوبة تتجاوز المتوفر', 'warning');
            return;
        }

        item.quantity = newQuantity;
        item.total = item.quantity * item.price;

        this.updateCartDisplay();
        this.updateSummary();
    }

    /**
     * حذف منتج من السلة
     */
    removeFromCart(itemIndex) {
        this.currentSale.items.splice(itemIndex, 1);
        this.updateCartDisplay();
        this.updateSummary();
    }

    /**
     * مسح السلة
     */
    clearCart() {
        if (this.currentSale.items.length === 0) return;

        ModalManager.confirm(
            'تأكيد المسح',
            'هل أنت متأكد من مسح جميع المنتجات من السلة؟',
            () => {
                this.currentSale.items = [];
                this.updateCartDisplay();
                this.updateSummary();
                app.showNotification('تم مسح السلة', 'info');
            }
        );
    }

    /**
     * تحديث ملخص الفاتورة
     */
    updateSummary() {
        // حساب المجموع الفرعي
        this.currentSale.subtotal = this.currentSale.items.reduce((sum, item) => sum + item.total, 0);

        // حساب الخصم
        const discountAmount = parseFloat(document.getElementById('discountAmount')?.value || 0);
        const discountType = document.getElementById('discountType')?.value || 'amount';

        if (discountType === 'percentage') {
            this.currentSale.discount = (this.currentSale.subtotal * discountAmount) / 100;
        } else {
            this.currentSale.discount = discountAmount;
        }

        // حساب الضريبة
        const taxableAmount = this.currentSale.subtotal - this.currentSale.discount;
        this.currentSale.tax = (taxableAmount * (this.settings.taxRate || 15)) / 100;

        // حساب الإجمالي
        this.currentSale.total = taxableAmount + this.currentSale.tax;

        // تحديث العرض
        document.getElementById('subtotalAmount').textContent = Utils.formatCurrency(this.currentSale.subtotal);
        document.getElementById('taxAmount').textContent = Utils.formatCurrency(this.currentSale.tax);
        document.getElementById('totalAmount').textContent = Utils.formatCurrency(this.currentSale.total);

        // تحديث الباقي إذا كان الدفع نقداً
        if (this.currentSale.paymentMethod === 'cash') {
            this.calculateChange();
        }

        // تفعيل/تعطيل زر إتمام البيع
        const completeSaleBtn = document.getElementById('completeSaleBtn');
        completeSaleBtn.disabled = this.currentSale.items.length === 0;
    }

    /**
     * تحديث الخصم
     */
    updateDiscount(value) {
        this.updateSummary();
    }

    /**
     * اختيار العميل
     */
    selectCustomer(customerId) {
        if (customerId) {
            this.currentSale.customer = this.customers.find(c => c.id === customerId);
        } else {
            this.currentSale.customer = null;
        }
    }

    /**
     * تحديث طريقة الدفع
     */
    updatePaymentMethod(method) {
        this.currentSale.paymentMethod = method;

        const cashPayment = document.getElementById('cashPayment');
        if (method === 'cash') {
            cashPayment.style.display = 'block';
            this.calculateChange();
        } else {
            cashPayment.style.display = 'none';
        }
    }

    /**
     * حساب الباقي
     */
    calculateChange() {
        const paidAmount = parseFloat(document.getElementById('paidAmount')?.value || 0);
        const change = paidAmount - this.currentSale.total;

        const changeElement = document.getElementById('changeAmount');
        if (change >= 0) {
            changeElement.textContent = Utils.formatCurrency(change);
            changeElement.className = 'change-positive';
        } else {
            changeElement.textContent = Utils.formatCurrency(Math.abs(change)) + ' (ناقص)';
            changeElement.className = 'change-negative';
        }
    }

    /**
     * إتمام البيع
     */
    completeSale() {
        // التحقق من وجود منتجات
        if (this.currentSale.items.length === 0) {
            app.showNotification('لا توجد منتجات في السلة', 'warning');
            return;
        }

        // التحقق من الدفع النقدي
        if (this.currentSale.paymentMethod === 'cash') {
            const paidAmount = parseFloat(document.getElementById('paidAmount')?.value || 0);
            if (paidAmount < this.currentSale.total) {
                app.showNotification('المبلغ المدفوع أقل من الإجمالي', 'error');
                return;
            }
        }

        // التحقق من العميل للبيع الآجل
        if (this.currentSale.paymentMethod === 'credit' && !this.currentSale.customer) {
            app.showNotification('يجب اختيار عميل للبيع الآجل', 'error');
            return;
        }

        // إعداد بيانات البيع
        const saleData = {
            invoiceNumber: this.currentSale.invoiceNumber,
            date: new Date().toISOString(),
            customerId: this.currentSale.customer?.id || 'customer_default',
            items: [...this.currentSale.items],
            subtotal: this.currentSale.subtotal,
            discount: this.currentSale.discount,
            tax: this.currentSale.tax,
            total: this.currentSale.total,
            paymentMethod: this.currentSale.paymentMethod,
            paymentStatus: this.currentSale.paymentMethod === 'cash' ? 'paid' : 'pending',
            paidAmount: this.currentSale.paymentMethod === 'cash' ?
                parseFloat(document.getElementById('paidAmount').value) : 0,
            change: this.currentSale.paymentMethod === 'cash' ?
                parseFloat(document.getElementById('paidAmount').value) - this.currentSale.total : 0
        };

        // حفظ البيع
        const saleId = DB.insert('sales', saleData);
        if (!saleId) {
            app.showNotification('فشل في حفظ البيع', 'error');
            return;
        }

        // تحديث المخزون
        this.updateInventory();

        // تحديث رصيد العميل للبيع الآجل
        if (this.currentSale.paymentMethod === 'credit' && this.currentSale.customer) {
            this.updateCustomerBalance();
        }

        // طباعة الفاتورة
        this.printInvoice(saleData);

        app.showNotification('تم إتمام البيع بنجاح', 'success');

        // إعادة تعيين البيع
        this.resetSale();
    }

    /**
     * تحديث المخزون
     */
    updateInventory() {
        this.currentSale.items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                const newQuantity = product.quantity - item.quantity;
                DB.update('products', product.id, { quantity: newQuantity });

                // تحديث المنتج في المصفوفة المحلية
                product.quantity = newQuantity;
            }
        });
    }

    /**
     * تحديث رصيد العميل
     */
    updateCustomerBalance() {
        if (!this.currentSale.customer) return;

        const newBalance = (this.currentSale.customer.balance || 0) - this.currentSale.total;
        DB.update('customers', this.currentSale.customer.id, {
            balance: newBalance,
            lastPurchaseDate: new Date().toISOString()
        });

        // تحديث العميل في المصفوفة المحلية
        this.currentSale.customer.balance = newBalance;
    }

    /**
     * طباعة الفاتورة
     */
    printInvoice(saleData) {
        const invoiceHtml = PrintManager.generateInvoice(saleData);
        PrintManager.print(invoiceHtml, { title: `فاتورة رقم ${saleData.invoiceNumber}` });
    }

    /**
     * تعليق البيع
     */
    holdSale() {
        if (this.currentSale.items.length === 0) {
            app.showNotification('لا توجد منتجات لتعليقها', 'warning');
            return;
        }

        // حفظ البيع المعلق في localStorage
        const heldSales = JSON.parse(localStorage.getItem('ringlight_held_sales') || '[]');
        const heldSale = {
            id: Utils.generateId('held_'),
            timestamp: new Date().toISOString(),
            sale: { ...this.currentSale }
        };

        heldSales.push(heldSale);
        localStorage.setItem('ringlight_held_sales', JSON.stringify(heldSales));

        app.showNotification('تم تعليق البيع', 'info');
        this.resetSale();
    }

    /**
     * إظهار المبيعات المعلقة
     */
    showHeldSales() {
        const heldSales = JSON.parse(localStorage.getItem('ringlight_held_sales') || '[]');

        if (heldSales.length === 0) {
            app.showNotification('لا توجد مبيعات معلقة', 'info');
            return;
        }

        const content = `
            <div class="held-sales-list">
                ${heldSales.map(held => `
                    <div class="held-sale-item">
                        <div class="held-sale-info">
                            <strong>معلق في: ${Utils.formatDate(held.timestamp, true)}</strong>
                            <p>${held.sale.items.length} منتج - ${Utils.formatCurrency(held.sale.total)}</p>
                        </div>
                        <div class="held-sale-actions">
                            <button class="btn btn-primary btn-sm" onclick="sales.resumeHeldSale('${held.id}')">
                                استكمال
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="sales.deleteHeldSale('${held.id}')">
                                حذف
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        ModalManager.show('المبيعات المعلقة', content);
    }

    /**
     * استكمال بيع معلق
     */
    resumeHeldSale(heldId) {
        const heldSales = JSON.parse(localStorage.getItem('ringlight_held_sales') || '[]');
        const heldSale = heldSales.find(h => h.id === heldId);

        if (!heldSale) {
            app.showNotification('البيع المعلق غير موجود', 'error');
            return;
        }

        // استعادة البيع
        this.currentSale = { ...heldSale.sale };

        // حذف البيع المعلق
        this.deleteHeldSale(heldId);

        // تحديث العرض
        this.updateCartDisplay();
        this.updateSummary();

        // تحديث النموذج
        if (this.currentSale.customer) {
            document.getElementById('customerSelect').value = this.currentSale.customer.id;
        }

        ModalManager.close();
        app.showNotification('تم استكمال البيع المعلق', 'success');
    }

    /**
     * حذف بيع معلق
     */
    deleteHeldSale(heldId) {
        let heldSales = JSON.parse(localStorage.getItem('ringlight_held_sales') || '[]');
        heldSales = heldSales.filter(h => h.id !== heldId);
        localStorage.setItem('ringlight_held_sales', JSON.stringify(heldSales));

        // تحديث القائمة إذا كانت مفتوحة
        const modal = document.getElementById('modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.showHeldSales();
        }
    }

    /**
     * فتح درج النقد
     */
    openCashDrawer() {
        // محاكاة فتح درج النقد
        app.showNotification('تم فتح درج النقد', 'info');

        // يمكن إضافة تكامل مع أجهزة نقاط البيع الفعلية هنا
        console.log('Opening cash drawer...');
    }

    /**
     * إظهار سجل المبيعات
     */
    showSalesHistory() {
        app.showPage('reports');
    }

    /**
     * إظهار المرتجعات
     */
    showReturns() {
        // سيتم تنفيذها لاحقاً
        app.showNotification('ميزة المرتجعات قيد التطوير', 'info');
    }

    /**
     * مسح الباركود
     */
    scanBarcode() {
        // محاكاة مسح الباركود
        app.showNotification('ميزة مسح الباركود قيد التطوير', 'info');
    }

    /**
     * إظهار نافذة إضافة عميل
     */
    showCustomerModal() {
        // سيتم تنفيذها في ملف العملاء
        app.showNotification('سيتم فتح نافذة إضافة عميل', 'info');
    }

    /**
     * تغيير الصفحة
     */
    changePage(direction) {
        // سيتم تنفيذها لاحقاً
        console.log('Changing page:', direction);
    }
}

// إنشاء مثيل نظام المبيعات
const sales = new Sales();
window.Sales = sales;
