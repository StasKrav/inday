// server.js - простой сервер для разработки
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Убираем query параметры
    const filePath = req.url.split('?')[0];
    
    // Определяем полный путь
    let fullPath = path.join(__dirname, filePath);
    
    // Если путь заканчивается на / - добавляем index.html
    if (fullPath.endsWith(path.sep)) {
        fullPath = path.join(fullPath, 'index.html');
    }
    
    // Если нет расширения - пробуем .html
    if (!path.extname(fullPath)) {
        const htmlPath = fullPath + '.html';
        if (fs.existsSync(htmlPath)) {
            fullPath = htmlPath;
        }
    }
    
    // Проверяем существование файла
    if (!fs.existsSync(fullPath)) {
        res.writeHead(404);
        res.end('404 Not Found');
        return;
    }
    
    // Определяем MIME тип
    const ext = path.extname(fullPath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Читаем и отправляем файл
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('500 Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`📁 Откройте в браузере: http://localhost:${PORT}`);
});
