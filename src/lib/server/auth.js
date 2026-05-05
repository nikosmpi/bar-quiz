import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { env } from '$env/dynamic/private';
import { emailOTP } from 'better-auth/plugins';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: schema
	}),
	emailAndPassword: {
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user'
			}
		}
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const response = await fetch('https://api.brevo.com/v3/smtp/email', {
					method: 'POST',
					headers: {
						accept: 'application/json',
						'api-key': env.BREVO_API_KEY,
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						sender: {
							email: env.BREVO_SENDER_EMAIL,
							name: env.BREVO_SENDER_NAME
						},
						to: [{ email }],
						subject: type === 'email-verification' ? 'Επαλήθευση Email' : 'Ο κωδικός OTP σας',
						htmlContent: `<html><body><h1>Ο κωδικός σας είναι: ${otp}</h1></body></html>`
					})
				});

				if (!response.ok) {
					const error = await response.json();
					console.error('Brevo error:', error);
					throw new Error('Αποτυχία αποστολής OTP μέσω Brevo');
				}
			}
		})
	],
	baseURL: env.BETTER_AUTH_URL || 'http://localhost:9106'
});
