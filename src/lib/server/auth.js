import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { env } from '$env/dynamic/private';
import { emailOTP } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: schema
	}),
	hooks: {
		before: async (ctx) => {
			if (ctx.path.includes('sign-in')) {
				// We don't have the user yet in 'before' sign-in usually without more logic, 
				// but Better-Auth allows session hooks.
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const regSetting = await db
						.select()
						.from(schema.config)
						.where(eq(schema.config.key, 'registration_enabled'))
						.get();

					if (regSetting?.value !== 'true') {
						throw new Error('Η εγγραφή νέων χρηστών είναι προσωρινά απενεργοποιημένη.');
					}
					return user;
				}
			}
		},
		session: {
			create: {
				before: async (session) => {
					const targetUser = await db
						.select()
						.from(schema.user)
						.where(eq(schema.user.id, session.userId))
						.get();

					if (targetUser?.role === 'ban') {
						throw new Error('Ο λογαριασμός σας έχει απενεργοποιηθεί (Ban).');
					}
					return session;
				}
			}
		}
	},
	emailAndPassword: {
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'player'
			},
			username: {
				type: 'string',
				required: false
			}
		}
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				console.log('Using Brevo API Key:', env.BREVO_API_KEY ? 'Present' : 'Missing');
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
	baseURL: env.BETTER_AUTH_URL || 'http://localhost:9106',
	trustedOrigins: env.TRUSTED_ORIGINS ? env.TRUSTED_ORIGINS.split(',') : []
});
