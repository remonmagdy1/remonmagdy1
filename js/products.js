// رينج لايت - إدارة المنتجات
// Products Management Module

class Products {
    constructor() {
        this.currentProduct = null;
        this.tableManager = null;
        this.categories = [];
    }

    /**
     * تهيئة صفحة المنتجات
     */
    init() {
        this.render();
        this.loadCategories();
        this.setupTable();
        this.bindEvents();
    }

    /**
     * عرض صفحة المنتجات
     */
    render() {
        const content = `
            <div class="products-container">
                <div class="page-header">
                    <h1>إدارة المنتجات</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="products.showAddProductModal()">
                            <i class="fas fa-plus"></i>
                            إضافة منتج جديد
                        </button>
                        <button class="btn btn-secondary" onclick="products.showImportModal()">
                            <i class="fas fa-upload"></i>
                            استيراد منتجات
                        </button>
                        <button class="btn btn-secondary" onclick="products.exportProducts()">
                            <i class="fas fa-download"></i>
                            تصدير المنتجات
                        </button>
                    </div>
                </div>

                <!-- إحصائيات سريعة -->
                <div class="stats-row">
                    <div class="stat-item">
                        <div class="stat-value" id="totalProductsCount">٠</div>
                        <div class="stat-label">إجمالي المنتجات</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="lowStockCount">٠</div>
                        <div class="stat-label">منتجات ناقصة</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="outOfStockCount">٠</div>
                        <div class="stat-label">منتجات منتهية</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="totalInventoryValue">٠ ريال</div>
                        <div class="stat-label">قيمة المخزون</div>
                    </div>
                </div>

                <!-- فلاتر البحث -->
                <div class="filters-section">
                    <div class="filters-row">
                        <div class="filter-group">
                            <label>البحث:</label>
                            <input type="text" id="productSearch" placeholder="البحث في المنتجات...">
                        </div>
                        <div class="filter-group">
                            <label>الفئة:</label>
                            <select id="categoryFilter">
                                <option value="">جميع الفئات</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>حالة المخزون:</label>
                            <select id="stockFilter">
                                <option value="">جميع المنتجات</option>
                                <option value="in_stock">متوفر</option>
                                <option value="low_stock">ناقص</option>
                                <option value="out_of_stock">منتهي</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <button class="btn btn-secondary" onclick="products.clearFilters()">
                                <i class="fas fa-times"></i>
                                مسح الفلاتر
                            </button>
                        </div>
                    </div>
                </div>

                <!-- جدول المنتجات -->
                <div class="table-section">
                    <div id="productsTable"></div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = content;
    }

    /**
     * تحميل الفئات
     */
    loadCategories() {
        this.categories = DB.getTable('categories');
        
        // تحديث قائمة الفئات في الفلتر
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
            this.categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    }

    /**
     * إعداد الجدول
     */
    setupTable() {
        this.tableManager = new TableManager('productsTable', {
            searchable: false, // سنستخدم البحث المخصص
            sortable: true,
            paginated: true,
            pageSize: 20,
            columns: [
                {
                    key: 'image',
                    title: 'الصورة',
                    render: (value, row) => {
                        return value ? 
                            `<img src="${value}" alt="${row.name}" class="product-image">` : 
                            '<div class="no-image"><i class="fas fa-image"></i></div>';
                    }
                },
                { key: 'name', title: 'اسم المنتج' },
                { key: 'barcode', title: 'الباركود' },
                { 
                    key: 'category', 
                    title: 'الفئة',
                    render: (value) => {
                        const category = this.categories.find(c => c.id === value);
                        return category ? category.name : 'غير محدد';
                    }
                },
                { 
                    key: 'price', 
                    title: 'السعر',
                    render: (value) => Utils.formatCurrency(value)
                },
                { 
                    key: 'quantity', 
                    title: 'الكمية',
                    render: (value, row) => {
                        const stockStatus = this.getStockStatus(row);
                        return `<span class="stock-badge stock-${stockStatus.class}">${Utils.toArabicNumbers(value)}</span>`;
                    }
                },
                { 
                    key: 'total_value', 
                    title: 'القيمة الإجمالية',
                    render: (value, row) => Utils.formatCurrency(row.price * row.quantity)
                },
                {
                    key: 'status',
                    title: 'الحالة',
                    render: (value, row) => {
                        const stockStatus = this.getStockStatus(row);
                        return `<span class="status-badge status-${stockStatus.class}">${stockStatus.text}</span>`;
                    }
                }
            ],
            actions: [
                {
                    icon: 'fas fa-eye',
                    class: 'btn-info',
                    title: 'عرض',
                    onclick: 'products.viewProduct("{id}")'
                },
                {
                    icon: 'fas fa-edit',
                    class: 'btn-warning',
                    title: 'تعديل',
                    onclick: 'products.editProduct("{id}")'
                },
                {
                    icon: 'fas fa-trash',
                    class: 'btn-danger',
                    title: 'حذف',
                    onclick: 'products.deleteProduct("{id}")'
                }
            ]
        });

        this.loadProducts();
    }

    /**
     * تحميل المنتجات
     */
    loadProducts() {
        let products = DB.getTable('products');
        
        // تطبيق الفلاتر
        products = this.applyFilters(products);
        
        // تحديث الإحصائيات
        this.updateStatistics(products);
        
        // تحديث الجدول
        this.tableManager.setData(products);
    }

    /**
     * تطبيق الفلاتر
     */
    applyFilters(products) {
        let filteredProducts = [...products];

        // فلتر البحث
        const searchTerm = document.getElementById('productSearch')?.value.trim();
        if (searchTerm) {
            filteredProducts = Utils.searchArray(filteredProducts, searchTerm, ['name', 'description', 'barcode']);
        }

        // فلتر الفئة
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
        }

        // فلتر حالة المخزون
        const stockFilter = document.getElementById('stockFilter')?.value;
        if (stockFilter) {
            filteredProducts = filteredProducts.filter(p => {
                const status = this.getStockStatus(p);
                return status.class === stockFilter;
            });
        }

        return filteredProducts;
    }

    /**
     * تحديث الإحصائيات
     */
    updateStatistics(products = null) {
        if (!products) {
            products = DB.getTable('products');
        }

        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => this.getStockStatus(p).class === 'low_stock');
        const outOfStockProducts = products.filter(p => this.getStockStatus(p).class === 'out_of_stock');
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        document.getElementById('totalProductsCount').textContent = Utils.toArabicNumbers(totalProducts);
        document.getElementById('lowStockCount').textContent = Utils.toArabicNumbers(lowStockProducts.length);
        document.getElementById('outOfStockCount').textContent = Utils.toArabicNumbers(outOfStockProducts.length);
        document.getElementById('totalInventoryValue').textContent = Utils.formatCurrency(totalValue);
    }

    /**
     * الحصول على حالة المخزون
     */
    getStockStatus(product) {
        const quantity = product.quantity || 0;
        const minQuantity = product.minQuantity || 5;

        if (quantity === 0) {
            return { class: 'out_of_stock', text: 'منتهي' };
        } else if (quantity <= minQuantity) {
            return { class: 'low_stock', text: 'ناقص' };
        } else {
            return { class: 'in_stock', text: 'متوفر' };
        }
    }

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // البحث
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.loadProducts();
            });
        }

        // فلاتر
        const categoryFilter = document.getElementById('categoryFilter');
        const stockFilter = document.getElementById('stockFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.loadProducts();
            });
        }
        
        if (stockFilter) {
            stockFilter.addEventListener('change', () => {
                this.loadProducts();
            });
        }
    }

    /**
     * مسح الفلاتر
     */
    clearFilters() {
        document.getElementById('productSearch').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('stockFilter').value = '';
        this.loadProducts();
    }

    /**
     * إظهار نافذة إضافة منتج
     */
    showAddProductModal() {
        this.currentProduct = null;
        this.showProductModal('إضافة منتج جديد');
    }

    /**
     * عرض منتج
     */
    viewProduct(productId) {
        const product = DB.findById('products', productId);
        if (!product) {
            app.showNotification('المنتج غير موجود', 'error');
            return;
        }

        const content = `
            <div class="product-details">
                <div class="product-image-section">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="product-detail-image">` :
                        '<div class="no-image-large"><i class="fas fa-image"></i><p>لا توجد صورة</p></div>'
                    }
                </div>
                <div class="product-info-section">
                    <h3>${product.name}</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>الباركود:</label>
                            <span>${product.barcode || 'غير محدد'}</span>
                        </div>
                        <div class="info-item">
                            <label>الفئة:</label>
                            <span>${this.getCategoryName(product.category)}</span>
                        </div>
                        <div class="info-item">
                            <label>السعر:</label>
                            <span>${Utils.formatCurrency(product.price)}</span>
                        </div>
                        <div class="info-item">
                            <label>الكمية المتاحة:</label>
                            <span>${Utils.toArabicNumbers(product.quantity)}</span>
                        </div>
                        <div class="info-item">
                            <label>الحد الأدنى:</label>
                            <span>${Utils.toArabicNumbers(product.minQuantity || 5)}</span>
                        </div>
                        <div class="info-item">
                            <label>القيمة الإجمالية:</label>
                            <span>${Utils.formatCurrency(product.price * product.quantity)}</span>
                        </div>
                    </div>
                    ${product.description ? `
                        <div class="product-description">
                            <label>الوصف:</label>
                            <p>${product.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        ModalManager.show('تفاصيل المنتج', content, {
            buttons: [
                {
                    text: 'تعديل',
                    class: 'btn-primary',
                    onclick: `ModalManager.close(); products.editProduct('${productId}')`
                },
                {
                    text: 'إغلاق',
                    class: 'btn-secondary',
                    onclick: 'ModalManager.close()'
                }
            ]
        });
    }

    /**
     * تعديل منتج
     */
    editProduct(productId) {
        const product = DB.findById('products', productId);
        if (!product) {
            app.showNotification('المنتج غير موجود', 'error');
            return;
        }

        this.currentProduct = product;
        this.showProductModal('تعديل المنتج');
    }

    /**
     * حذف منتج
     */
    deleteProduct(productId) {
        const product = DB.findById('products', productId);
        if (!product) {
            app.showNotification('المنتج غير موجود', 'error');
            return;
        }

        ModalManager.confirm(
            'تأكيد الحذف',
            `هل أنت متأكد من حذف المنتج "${product.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            () => {
                if (DB.delete('products', productId)) {
                    app.showNotification('تم حذف المنتج بنجاح', 'success');
                    this.loadProducts();
                } else {
                    app.showNotification('فشل في حذف المنتج', 'error');
                }
            }
        );
    }

    /**
     * إظهار نافذة المنتج (إضافة/تعديل)
     */
    showProductModal(title) {
        const isEdit = this.currentProduct !== null;

        const content = `
            <form id="productForm" class="product-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="productName">اسم المنتج *</label>
                        <input type="text" id="productName" name="name" required
                               value="${isEdit ? this.currentProduct.name : ''}"
                               placeholder="أدخل اسم المنتج">
                    </div>

                    <div class="form-group">
                        <label for="productBarcode">الباركود</label>
                        <input type="text" id="productBarcode" name="barcode"
                               value="${isEdit ? this.currentProduct.barcode || '' : ''}"
                               placeholder="أدخل الباركود">
                    </div>

                    <div class="form-group">
                        <label for="productCategory">الفئة</label>
                        <select id="productCategory" name="category">
                            <option value="">اختر الفئة</option>
                            ${this.categories.map(cat =>
                                `<option value="${cat.id}" ${isEdit && this.currentProduct.category === cat.id ? 'selected' : ''}>${cat.name}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="productPrice">السعر *</label>
                        <input type="number" id="productPrice" name="price" required min="0" step="0.01"
                               value="${isEdit ? this.currentProduct.price : ''}"
                               placeholder="٠.٠٠">
                    </div>

                    <div class="form-group">
                        <label for="productQuantity">الكمية *</label>
                        <input type="number" id="productQuantity" name="quantity" required min="0"
                               value="${isEdit ? this.currentProduct.quantity : ''}"
                               placeholder="٠">
                    </div>

                    <div class="form-group">
                        <label for="productMinQuantity">الحد الأدنى</label>
                        <input type="number" id="productMinQuantity" name="minQuantity" min="0"
                               value="${isEdit ? this.currentProduct.minQuantity || 5 : 5}"
                               placeholder="٥">
                    </div>
                </div>

                <div class="form-group">
                    <label for="productDescription">الوصف</label>
                    <textarea id="productDescription" name="description" rows="3"
                              placeholder="وصف المنتج (اختياري)">${isEdit ? this.currentProduct.description || '' : ''}</textarea>
                </div>

                <div class="form-group">
                    <label for="productImage">صورة المنتج</label>
                    <input type="file" id="productImage" name="image" accept="image/*">
                    ${isEdit && this.currentProduct.image ?
                        `<div class="current-image">
                            <img src="${this.currentProduct.image}" alt="الصورة الحالية">
                            <button type="button" onclick="products.removeProductImage()" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i> حذف الصورة
                            </button>
                        </div>` : ''
                    }
                </div>
            </form>
        `;

        ModalManager.show(title, content, {
            buttons: [
                {
                    text: isEdit ? 'تحديث' : 'إضافة',
                    class: 'btn-primary',
                    onclick: 'products.saveProduct()'
                },
                {
                    text: 'إلغاء',
                    class: 'btn-secondary',
                    onclick: 'ModalManager.close()'
                }
            ]
        });

        // ربط حدث تغيير الصورة
        document.getElementById('productImage').addEventListener('change', this.handleImageUpload);
    }

    /**
     * حفظ المنتج
     */
    saveProduct() {
        const form = document.getElementById('productForm');
        const errors = FormManager.validate(form);

        if (errors.length > 0) {
            app.showNotification(errors[0], 'error');
            return;
        }

        const formData = FormManager.getFormData(form);

        // التحقق من عدم تكرار الباركود
        if (formData.barcode) {
            const existingProduct = DB.getTable('products').find(p =>
                p.barcode === formData.barcode &&
                (!this.currentProduct || p.id !== this.currentProduct.id)
            );

            if (existingProduct) {
                app.showNotification('الباركود موجود مسبقاً', 'error');
                return;
            }
        }

        // إعداد بيانات المنتج
        const productData = {
            name: formData.name.trim(),
            barcode: formData.barcode?.trim() || null,
            category: formData.category || null,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            minQuantity: parseInt(formData.minQuantity) || 5,
            description: formData.description?.trim() || null,
            image: this.currentProduct?.image || null // سيتم تحديثها في handleImageUpload
        };

        let success = false;

        if (this.currentProduct) {
            // تحديث منتج موجود
            success = DB.update('products', this.currentProduct.id, productData);
        } else {
            // إضافة منتج جديد
            success = DB.insert('products', productData);
        }

        if (success) {
            app.showNotification(
                this.currentProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح',
                'success'
            );
            ModalManager.close();
            this.loadProducts();
        } else {
            app.showNotification('فشل في حفظ المنتج', 'error');
        }
    }

    /**
     * معالجة رفع الصورة
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            app.showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }

        // التحقق من حجم الملف (أقل من 2MB)
        if (file.size > 2 * 1024 * 1024) {
            app.showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (products.currentProduct) {
                products.currentProduct.image = e.target.result;
            }

            // إظهار معاينة الصورة
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="معاينة الصورة">
                <button type="button" onclick="this.parentElement.remove()" class="btn btn-sm btn-danger">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const imageGroup = event.target.closest('.form-group');
            const existingPreview = imageGroup.querySelector('.image-preview');
            if (existingPreview) {
                existingPreview.remove();
            }

            imageGroup.appendChild(preview);
        };

        reader.readAsDataURL(file);
    }

    /**
     * حذف صورة المنتج
     */
    removeProductImage() {
        if (this.currentProduct) {
            this.currentProduct.image = null;
        }

        const currentImageDiv = document.querySelector('.current-image');
        if (currentImageDiv) {
            currentImageDiv.remove();
        }
    }

    /**
     * الحصول على اسم الفئة
     */
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'غير محدد';
    }

    /**
     * إظهار نافذة الاستيراد
     */
    showImportModal() {
        const content = `
            <div class="import-section">
                <div class="import-instructions">
                    <h4>تعليمات الاستيراد:</h4>
                    <ul>
                        <li>يجب أن يكون الملف بصيغة CSV أو Excel</li>
                        <li>الأعمدة المطلوبة: الاسم، السعر، الكمية</li>
                        <li>الأعمدة الاختيارية: الباركود، الفئة، الوصف، الحد الأدنى</li>
                    </ul>
                </div>

                <div class="form-group">
                    <label for="importFile">اختر الملف:</label>
                    <input type="file" id="importFile" accept=".csv,.xlsx,.xls">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="updateExisting" checked>
                        تحديث المنتجات الموجودة (بناءً على الباركود)
                    </label>
                </div>
            </div>
        `;

        ModalManager.show('استيراد المنتجات', content, {
            buttons: [
                {
                    text: 'استيراد',
                    class: 'btn-primary',
                    onclick: 'products.importProducts()'
                },
                {
                    text: 'إلغاء',
                    class: 'btn-secondary',
                    onclick: 'ModalManager.close()'
                }
            ]
        });
    }

    /**
     * استيراد المنتجات
     */
    async importProducts() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];

        if (!file) {
            app.showNotification('يرجى اختيار ملف للاستيراد', 'error');
            return;
        }

        try {
            const content = await Utils.readFile(file);
            const products = this.parseImportFile(content, file.type);

            if (products.length === 0) {
                app.showNotification('لم يتم العثور على منتجات صالحة في الملف', 'error');
                return;
            }

            const updateExisting = document.getElementById('updateExisting').checked;
            let addedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;

            products.forEach(productData => {
                try {
                    if (updateExisting && productData.barcode) {
                        const existingProduct = DB.getTable('products').find(p => p.barcode === productData.barcode);
                        if (existingProduct) {
                            DB.update('products', existingProduct.id, productData);
                            updatedCount++;
                            return;
                        }
                    }

                    DB.insert('products', productData);
                    addedCount++;
                } catch (error) {
                    errorCount++;
                    console.error('خطأ في استيراد المنتج:', productData, error);
                }
            });

            ModalManager.close();
            this.loadProducts();

            app.showNotification(
                `تم الاستيراد بنجاح: ${Utils.toArabicNumbers(addedCount)} منتج جديد، ${Utils.toArabicNumbers(updatedCount)} منتج محدث${errorCount > 0 ? `، ${Utils.toArabicNumbers(errorCount)} خطأ` : ''}`,
                'success'
            );
        } catch (error) {
            console.error('خطأ في استيراد الملف:', error);
            app.showNotification('فشل في قراءة الملف', 'error');
        }
    }

    /**
     * تحليل ملف الاستيراد
     */
    parseImportFile(content, fileType) {
        // تنفيذ بسيط لتحليل CSV
        // يمكن تحسينه لدعم Excel لاحقاً
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue;

            const product = {};
            headers.forEach((header, index) => {
                const value = values[index];

                switch (header.toLowerCase()) {
                    case 'name':
                    case 'اسم':
                    case 'الاسم':
                        product.name = value;
                        break;
                    case 'price':
                    case 'سعر':
                    case 'السعر':
                        product.price = parseFloat(value) || 0;
                        break;
                    case 'quantity':
                    case 'كمية':
                    case 'الكمية':
                        product.quantity = parseInt(value) || 0;
                        break;
                    case 'barcode':
                    case 'باركود':
                    case 'الباركود':
                        product.barcode = value;
                        break;
                    case 'category':
                    case 'فئة':
                    case 'الفئة':
                        product.category = value;
                        break;
                    case 'description':
                    case 'وصف':
                    case 'الوصف':
                        product.description = value;
                        break;
                    case 'minquantity':
                    case 'حد_أدنى':
                    case 'الحد_الأدنى':
                        product.minQuantity = parseInt(value) || 5;
                        break;
                }
            });

            if (product.name && product.price >= 0 && product.quantity >= 0) {
                products.push(product);
            }
        }

        return products;
    }

    /**
     * تصدير المنتجات
     */
    exportProducts() {
        const products = DB.getTable('products');

        if (products.length === 0) {
            app.showNotification('لا توجد منتجات للتصدير', 'warning');
            return;
        }

        // إنشاء محتوى CSV
        const headers = ['الاسم', 'الباركود', 'الفئة', 'السعر', 'الكمية', 'الحد الأدنى', 'الوصف'];
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                product.name,
                product.barcode || '',
                this.getCategoryName(product.category),
                product.price,
                product.quantity,
                product.minQuantity || 5,
                product.description || ''
            ].join(','))
        ].join('\n');

        const filename = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
        Utils.downloadFile(csvContent, filename, 'text/csv');

        app.showNotification('تم تصدير المنتجات بنجاح', 'success');
    }
}

// إنشاء مثيل إدارة المنتجات
const products = new Products();
window.Products = products;
