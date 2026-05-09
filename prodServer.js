import http from 'http';
import { handler } from './build/handler.js';
import { injectWebSockets } from './src/lib/server/socket-handler.js';

const server = http.createServer((req, res) => {
	// Bypass SvelteKit handler for Socket.io requests
	if (req.url.startsWith('/socket.io')) {
		return;
	}
	
	// SvelteKit handler handles all other standard requests
	handler(req, res);
});

// Initialize WebSockets on the same HTTP server
await injectWebSockets(server);

const port = process.env.PORT || 9106;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
	console.log(`Production server running at http://${host}:${port}`);
});
