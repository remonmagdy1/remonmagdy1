// رينج لايت - Service Worker
// PWA Service Worker for offline functionality

const CACHE_NAME = 'ringlight-pos-v1.0.0';
const STATIC_CACHE = 'ringlight-static-v1.0.0';
const DYNAMIC_CACHE = 'ringlight-dynamic-v1.0.0';

// الملفات الأساسية للتخزين المؤقت
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // CSS Files
    '/css/style.css',
    '/css/themes.css',
    '/css/print.css',
    
    // JavaScript Files
    '/js/main.js',
    '/js/app.js',
    '/js/database.js',
    '/js/utils.js',
    '/js/dashboard.js',
    '/js/products.js',
    '/js/sales.js',
    
    // External Libraries
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    
    // Icons
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

// الملفات التي لا يجب تخزينها مؤقتاً
const EXCLUDE_URLS = [
    '/sw.js',
    '/electron-main.js',
    '/electron-preload.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // تجاهل الطلبات المستثناة
    if (EXCLUDE_URLS.some(url => requestUrl.pathname.includes(url))) {
        return;
    }
    
    // تجاهل طلبات غير GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // إرجاع النسخة المخزنة مؤقتاً إذا وجدت
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // محاولة جلب من الشبكة
                return fetch(event.request)
                    .then((networkResponse) => {
                        // تخزين الاستجابة في التخزين المؤقت الديناميكي
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // إرجاع صفحة offline إذا فشل الطلب
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // إرجاع أيقونة افتراضية للصور
                        if (event.request.destination === 'image') {
                            return caches.match('/assets/icons/icon-192.png');
                        }
                    });
            })
    );
});

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                type: 'VERSION',
                payload: CACHE_NAME
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches()
                .then(() => {
                    event.ports[0].postMessage({
                        type: 'CACHE_CLEARED',
                        payload: true
                    });
                })
                .catch((error) => {
                    event.ports[0].postMessage({
                        type: 'CACHE_CLEARED',
                        payload: false,
                        error: error.message
                    });
                });
            break;
            
        case 'CACHE_URLS':
            cacheUrls(payload.urls)
                .then(() => {
                    event.ports[0].postMessage({
                        type: 'URLS_CACHED',
                        payload: true
                    });
                })
                .catch((error) => {
                    event.ports[0].postMessage({
                        type: 'URLS_CACHED',
                        payload: false,
                        error: error.message
                    });
                });
            break;
    }
});

// معالجة إشعارات Push
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'إشعار جديد من رينج لايت',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'فتح التطبيق',
                icon: '/assets/icons/action-explore.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/assets/icons/action-close.png'
            }
        ],
        requireInteraction: true,
        silent: false,
        tag: 'ringlight-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification('رينج لايت', options)
    );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // لا حاجة لفعل شيء، الإشعار مغلق بالفعل
    } else {
        // النقر على الإشعار نفسه
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    for (let client of clientList) {
                        if (client.url === '/' && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// معالجة مزامنة الخلفية
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            doBackgroundSync()
        );
    }
});

// وظائف مساعدة
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

async function cacheUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.addAll(urls);
}

async function doBackgroundSync() {
    try {
        // مزامنة البيانات المحلية مع الخادم
        console.log('Service Worker: Performing background sync');
        
        // يمكن إضافة منطق المزامنة هنا
        // مثل رفع البيانات المحفوظة محلياً
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
        throw error;
    }
}

// معالجة أخطاء غير متوقعة
self.addEventListener('error', (event) => {
    console.error('Service Worker: Unhandled error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Script loaded successfully');
