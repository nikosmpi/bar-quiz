import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { webSocketServer } from './src/lib/server/socket-handler.js';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit(), webSocketServer],
		server: {
			allowedHosts: [
				env.PUBLIC_SITE_DOMAIN
			].filter(Boolean)
		}
	};
});