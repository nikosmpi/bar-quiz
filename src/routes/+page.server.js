import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { config } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	// Fetch home page configs
	const configs = await db.select().from(config).all();
	const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]));

	return {
		user: session?.user || null,
		homeTitle: configMap['home_title'] || 'Καλώς ήρθατε στο Quiz App',
		homeSubtitle: configMap['home_subtitle'] || 'Ετοιμαστείτε για μια μοναδική εμπειρία γνώσεων!'
	};
};
