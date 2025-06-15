# رينج لايت - Makefile
# Ring Light POS - Build Automation

.PHONY: help install clean build build-all run dev test lint

# متغيرات
APP_NAME = ringlight-pos
VERSION = 1.0.0
NODE_VERSION = 16
DIST_DIR = dist
BUILD_DIR = build

# ألوان للنص
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# الهدف الافتراضي
help: ## إظهار هذه المساعدة
	@echo "$(BLUE)رينج لايت - نظام إدارة نقاط البيع العربي$(NC)"
	@echo "$(BLUE)========================================$(NC)"
	@echo
	@echo "الأهداف المتاحة:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo
	@echo "أمثلة:"
	@echo "  make install     # تثبيت التبعيات"
	@echo "  make run         # تشغيل التطبيق"
	@echo "  make build       # بناء للمنصة الحالية"
	@echo "  make build-all   # بناء لجميع المنصات"

# فحص البيئة
check-env: ## فحص متطلبات البيئة
	@echo "$(YELLOW)فحص البيئة...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js غير مثبت$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm غير متاح$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Node.js: $$(node --version)$(NC)"
	@echo "$(GREEN)✅ npm: $$(npm --version)$(NC)"
	@echo "$(GREEN)✅ البيئة جاهزة$(NC)"

# تثبيت التبعيات
install: check-env ## تثبيت التبعيات
	@echo "$(YELLOW)تثبيت التبعيات...$(NC)"
	npm install
	@echo "$(GREEN)✅ تم تثبيت التبعيات بنجاح$(NC)"

# تنظيف الملفات المؤقتة
clean: ## تنظيف ملفات البناء والتخزين المؤقت
	@echo "$(YELLOW)تنظيف الملفات...$(NC)"
	rm -rf $(DIST_DIR)
	rm -rf $(BUILD_DIR)
	rm -rf node_modules/.cache
	@echo "$(GREEN)✅ تم تنظيف الملفات$(NC)"

# تنظيف شامل
clean-all: clean ## تنظيف شامل بما في ذلك node_modules
	@echo "$(YELLOW)تنظيف شامل...$(NC)"
	rm -rf node_modules
	@echo "$(GREEN)✅ تم التنظيف الشامل$(NC)"

# إعادة التثبيت
reinstall: clean-all install ## إعادة تثبيت التبعيات من الصفر

# تشغيل التطبيق
run: ## تشغيل تطبيق سطح المكتب
	@echo "$(YELLOW)تشغيل رينج لايت...$(NC)"
	npm start

# تشغيل في وضع التطوير
dev: ## تشغيل في وضع التطوير
	@echo "$(YELLOW)تشغيل وضع التطوير...$(NC)"
	npm run dev

# تشغيل الخادم المحلي
serve: ## تشغيل الخادم المحلي
	@echo "$(YELLOW)تشغيل الخادم المحلي...$(NC)"
	npm run serve

# تشغيل سريع
quick: ## تشغيل سريع باستخدام start.js
	@echo "$(YELLOW)تشغيل سريع...$(NC)"
	node start.js

# اختبار التطبيق
test: ## تشغيل الاختبارات
	@echo "$(YELLOW)تشغيل الاختبارات...$(NC)"
	npm test

# فحص الكود
lint: ## فحص جودة الكود
	@echo "$(YELLOW)فحص الكود...$(NC)"
	npm run lint

# بناء للمنصة الحالية
build: ## بناء التطبيق للمنصة الحالية
	@echo "$(YELLOW)بناء التطبيق...$(NC)"
	npm run build
	@echo "$(GREEN)✅ تم بناء التطبيق في مجلد $(DIST_DIR)$(NC)"

# بناء محمول للتطوير
pack: ## بناء محمول للتطوير
	@echo "$(YELLOW)بناء محمول...$(NC)"
	npm run pack
	@echo "$(GREEN)✅ تم البناء المحمول$(NC)"

# بناء Windows
build-win: ## بناء لنظام Windows
	@echo "$(YELLOW)بناء لنظام Windows...$(NC)"
	npm run build-win
	@echo "$(GREEN)✅ تم بناء نسخة Windows$(NC)"

# بناء macOS
build-mac: ## بناء لنظام macOS
	@echo "$(YELLOW)بناء لنظام macOS...$(NC)"
	npm run build-mac
	@echo "$(GREEN)✅ تم بناء نسخة macOS$(NC)"

# بناء Linux
build-linux: ## بناء لنظام Linux
	@echo "$(YELLOW)بناء لنظام Linux...$(NC)"
	npm run build-linux
	@echo "$(GREEN)✅ تم بناء نسخة Linux$(NC)"

# بناء جميع المنصات
build-all: ## بناء لجميع المنصات
	@echo "$(YELLOW)بناء لجميع المنصات...$(NC)"
	npm run build-all
	@echo "$(GREEN)✅ تم بناء جميع المنصات$(NC)"

# بناء نسخة محمولة
build-portable: ## بناء نسخة محمولة لـ Windows
	@echo "$(YELLOW)بناء نسخة محمولة...$(NC)"
	npm run build-portable
	@echo "$(GREEN)✅ تم بناء النسخة المحمولة$(NC)"

# نشر الإصدار
release: ## نشر إصدار جديد
	@echo "$(YELLOW)نشر الإصدار...$(NC)"
	npm run release
	@echo "$(GREEN)✅ تم نشر الإصدار$(NC)"

# إعداد بيئة التطوير
setup: check-env install ## إعداد بيئة التطوير الكاملة
	@echo "$(YELLOW)إعداد بيئة التطوير...$(NC)"
	@echo "$(GREEN)✅ تم إعداد بيئة التطوير بنجاح$(NC)"
	@echo
	@echo "$(BLUE)الخطوات التالية:$(NC)"
	@echo "  make run         # لتشغيل التطبيق"
	@echo "  make dev         # لوضع التطوير"
	@echo "  make build       # لبناء التطبيق"

# معلومات النظام
info: ## إظهار معلومات النظام والمشروع
	@echo "$(BLUE)معلومات المشروع:$(NC)"
	@echo "  الاسم: $(APP_NAME)"
	@echo "  الإصدار: $(VERSION)"
	@echo "  Node.js: $$(node --version 2>/dev/null || echo 'غير مثبت')"
	@echo "  npm: $$(npm --version 2>/dev/null || echo 'غير متاح')"
	@echo "  النظام: $$(uname -s 2>/dev/null || echo 'Windows')"
	@echo "  المعمارية: $$(uname -m 2>/dev/null || echo 'x64')"
	@echo "  المجلد: $$(pwd)"
	@echo "  حجم المشروع: $$(du -sh . 2>/dev/null | cut -f1 || echo 'غير معروف')"

# فحص الملفات المبنية
check-dist: ## فحص الملفات المبنية
	@echo "$(YELLOW)فحص الملفات المبنية...$(NC)"
	@if [ -d "$(DIST_DIR)" ]; then \
		echo "$(GREEN)✅ مجلد $(DIST_DIR) موجود$(NC)"; \
		ls -la $(DIST_DIR); \
	else \
		echo "$(RED)❌ مجلد $(DIST_DIR) غير موجود$(NC)"; \
		echo "$(YELLOW)💡 جرب: make build$(NC)"; \
	fi

# تشغيل الملف المبني
run-dist: check-dist ## تشغيل الملف المبني
	@echo "$(YELLOW)تشغيل الملف المبني...$(NC)"
	@if [ -f "$(DIST_DIR)/$(APP_NAME)" ]; then \
		$(DIST_DIR)/$(APP_NAME); \
	elif [ -f "$(DIST_DIR)/$(APP_NAME).exe" ]; then \
		$(DIST_DIR)/$(APP_NAME).exe; \
	else \
		echo "$(RED)❌ لم يتم العثور على ملف قابل للتشغيل$(NC)"; \
		echo "$(YELLOW)💡 جرب: make build$(NC)"; \
	fi

# إنشاء أرشيف للتوزيع
archive: build ## إنشاء أرشيف مضغوط للتوزيع
	@echo "$(YELLOW)إنشاء أرشيف التوزيع...$(NC)"
	@DATE=$$(date +%Y%m%d); \
	tar -czf $(APP_NAME)-$(VERSION)-$$DATE.tar.gz \
		--exclude=node_modules \
		--exclude=.git \
		--exclude=$(DIST_DIR) \
		--exclude=$(BUILD_DIR) \
		.
	@echo "$(GREEN)✅ تم إنشاء الأرشيف$(NC)"

# تحديث التبعيات
update: ## تحديث التبعيات
	@echo "$(YELLOW)تحديث التبعيات...$(NC)"
	npm update
	@echo "$(GREEN)✅ تم تحديث التبعيات$(NC)"

# فحص الأمان
security: ## فحص الثغرات الأمنية
	@echo "$(YELLOW)فحص الأمان...$(NC)"
	npm audit
	@echo "$(GREEN)✅ تم فحص الأمان$(NC)"

# إصلاح مشاكل الأمان
security-fix: ## إصلاح مشاكل الأمان
	@echo "$(YELLOW)إصلاح مشاكل الأمان...$(NC)"
	npm audit fix
	@echo "$(GREEN)✅ تم إصلاح مشاكل الأمان$(NC)"

# تشغيل جميع الفحوصات
check-all: check-env lint test security ## تشغيل جميع الفحوصات
	@echo "$(GREEN)✅ تم تشغيل جميع الفحوصات بنجاح$(NC)"

# سير عمل التطوير الكامل
workflow: clean install check-all build ## سير عمل التطوير الكامل
	@echo "$(GREEN)✅ تم إكمال سير العمل بنجاح$(NC)"
