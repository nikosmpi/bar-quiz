import { createAuthClient } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:9106', // Should match BETTER_AUTH_URL
	plugins: [emailOTPClient()]
});
