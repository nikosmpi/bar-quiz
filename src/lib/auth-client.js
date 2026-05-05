import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:9106' // Should match BETTER_AUTH_URL
});
