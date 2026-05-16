import http from 'http';
import fs from 'fs';
import path from 'path';
import { handler } from './build/handler.js';
import { injectWebSockets } from './src/lib/server/socket-handler.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('*** PROD SERVER STARTING ***');
console.log('Environment:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    BODY_SIZE_LIMIT: process.env.BODY_SIZE_LIMIT,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
    BREVO_API_KEY: process.env.BREVO_API_KEY ? 'Present' : 'Missing',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
});

const server = http.createServer(async (req, res) => {
    // 1. Έλεγχος για Socket.io αιτήματα
    if (req.url && req.url.includes('socket.io')) {
        return;
    }

    // 2. Σερβίρισμα των δυναμικών uploads
    if (req.url && req.url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'static', req.url);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.webp': 'image/webp',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.mp4': 'video/mp4'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    // 3. Όλα τα υπόλοιπα στο SvelteKit
    try {
        await handler(req, res);
    } catch (err) {
        console.error('[SvelteKit Error]', err);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }
});

// Αρχικοποίηση WebSockets
console.log('Initializing WebSockets...');
await injectWebSockets(server);

const port = process.env.PORT || 9106;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
	console.log(`*** SERVER LISTENING ON http://${host}:${port} ***`);
});
