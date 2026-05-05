import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: schema
	}),
	emailAndPassword: {
		enabled: true
	},
	baseURL: env.BETTER_AUTH_URL || 'http://localhost:9106'
});
