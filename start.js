#!/usr/bin/env node

// رينج لايت - ملف التشغيل السريع
// Ring Light POS - Quick Start Script

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class RingLightStarter {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.isElectronAvailable = false;
        this.isServerMode = process.argv.includes('--server');
        this.port = this.getPort();
        
        this.checkEnvironment();
    }

    checkEnvironment() {
        // التحقق من وجود Electron
        try {
            require.resolve('electron');
            this.isElectronAvailable = true;
        } catch (e) {
            this.isElectronAvailable = false;
        }

        // التحقق من وجود package.json
        const packagePath = path.join(__dirname, 'package.json');
        if (!fs.existsSync(packagePath)) {
            console.error('❌ ملف package.json غير موجود');
            process.exit(1);
        }
    }

    getPort() {
        const portArg = process.argv.find(arg => arg.startsWith('--port='));
        return portArg ? parseInt(portArg.split('=')[1]) : 8080;
    }

    async start() {
        console.log('🚀 بدء تشغيل رينج لايت...');
        console.log(`📱 المنصة: ${this.platform} (${this.arch})`);

        if (this.isServerMode) {
            await this.startServer();
        } else if (this.isElectronAvailable) {
            await this.startElectron();
        } else {
            console.log('⚠️  Electron غير متاح، سيتم تشغيل الخادم المحلي');
            await this.startServer();
        }
    }

    async startElectron() {
        console.log('🖥️  تشغيل تطبيق سطح المكتب...');
        
        try {
            const electronPath = require('electron');
            const child = spawn(electronPath, ['.'], {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    NODE_ENV: process.env.NODE_ENV || 'production'
                }
            });

            child.on('close', (code) => {
                console.log(`✅ تم إغلاق التطبيق بالكود: ${code}`);
                process.exit(code);
            });

            child.on('error', (error) => {
                console.error('❌ خطأ في تشغيل Electron:', error);
                console.log('🔄 محاولة تشغيل الخادم المحلي...');
                this.startServer();
            });

        } catch (error) {
            console.error('❌ خطأ في تشغيل Electron:', error);
            console.log('🔄 محاولة تشغيل الخادم المحلي...');
            await this.startServer();
        }
    }

    async startServer() {
        console.log(`🌐 تشغيل الخادم المحلي على المنفذ ${this.port}...`);

        try {
            // محاولة استخدام http-server إذا كان متاحاً
            if (this.isPackageAvailable('http-server')) {
                await this.startHttpServer();
            } else if (this.isPackageAvailable('express')) {
                await this.startExpressServer();
            } else {
                await this.startSimpleServer();
            }
        } catch (error) {
            console.error('❌ خطأ في تشغيل الخادم:', error);
            console.log('💡 جرب تثبيت التبعيات: npm install');
            process.exit(1);
        }
    }

    isPackageAvailable(packageName) {
        try {
            require.resolve(packageName);
            return true;
        } catch (e) {
            return false;
        }
    }

    async startHttpServer() {
        const httpServer = require('http-server');
        
        const server = httpServer.createServer({
            root: __dirname,
            cache: 3600,
            showDir: false,
            autoIndex: false,
            gzip: true,
            ext: 'html',
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

        server.listen(this.port, '127.0.0.1', () => {
            console.log(`✅ الخادم يعمل على: http://localhost:${this.port}`);
            console.log('🌐 افتح الرابط في المتصفح لبدء الاستخدام');
            this.openBrowser(`http://localhost:${this.port}`);
        });
    }

    async startExpressServer() {
        const express = require('express');
        const path = require('path');
        
        const app = express();
        
        // إعداد الملفات الثابتة
        app.use(express.static(__dirname));
        
        // إعداد CORS
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        // توجيه جميع الطلبات إلى index.html
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        app.listen(this.port, '127.0.0.1', () => {
            console.log(`✅ الخادم يعمل على: http://localhost:${this.port}`);
            console.log('🌐 افتح الرابط في المتصفح لبدء الاستخدام');
            this.openBrowser(`http://localhost:${this.port}`);
        });
    }

    async startSimpleServer() {
        const http = require('http');
        const fs = require('fs');
        const path = require('path');
        const url = require('url');

        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url);
            let pathname = `.${parsedUrl.pathname}`;
            
            // توجيه الطلبات إلى index.html
            if (pathname === './') {
                pathname = './index.html';
            }

            const ext = path.parse(pathname).ext;
            const map = mimeTypes[ext] || 'text/plain';

            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found!');
                    return;
                }
                
                res.writeHead(200, {
                    'Content-Type': map,
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        });

        server.listen(this.port, '127.0.0.1', () => {
            console.log(`✅ الخادم يعمل على: http://localhost:${this.port}`);
            console.log('🌐 افتح الرابط في المتصفح لبدء الاستخدام');
            this.openBrowser(`http://localhost:${this.port}`);
        });
    }

    openBrowser(url) {
        const start = (process.platform === 'darwin' ? 'open' : 
                      process.platform === 'win32' ? 'start' : 'xdg-open');
        
        setTimeout(() => {
            require('child_process').exec(`${start} ${url}`, (error) => {
                if (error) {
                    console.log(`💡 افتح المتصفح يدوياً على: ${url}`);
                }
            });
        }, 1000);
    }

    showHelp() {
        console.log(`
🏪 رينج لايت - نظام إدارة نقاط البيع العربي

الاستخدام:
  node start.js [خيارات]

الخيارات:
  --server          تشغيل الخادم المحلي فقط
  --port=8080       تحديد منفذ الخادم (افتراضي: 8080)
  --help           إظهار هذه المساعدة

أمثلة:
  node start.js                    # تشغيل تطبيق سطح المكتب
  node start.js --server           # تشغيل الخادم المحلي
  node start.js --server --port=3000  # تشغيل على منفذ 3000

للمزيد من المعلومات، راجع README.md
        `);
    }
}

// تشغيل التطبيق
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        new RingLightStarter().showHelp();
        process.exit(0);
    }

    const starter = new RingLightStarter();
    starter.start().catch(error => {
        console.error('❌ خطأ في تشغيل التطبيق:', error);
        process.exit(1);
    });
}

module.exports = RingLightStarter;
