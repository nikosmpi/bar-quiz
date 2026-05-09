import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { config } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ request, url }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	const isPreview = url.searchParams.has('preview');

	// Redirect management roles only if not in preview mode
	if (!isPreview && (session?.user?.role === 'admin' || session?.user?.role === 'quizmaster')) {
		throw redirect(302, '/quizmaster');
	}

	// Fetch home page configs
	const configs = await db.select().from(config).all();
	const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]));

	const activeQuizId = configMap['active_quiz_id'];

	// If there is an active quiz and the user is a player, redirect to controller
	if (activeQuizId && session?.user?.role === 'player') {
		throw redirect(302, '/controler');
	}

	return {
		user: session?.user || null,
		activeQuizId: activeQuizId || null,
		homeTitle: configMap['home_title'] || 'Καλώς ήρθατε στο Quiz App',
		homeSubtitle: configMap['home_subtitle'] || 'Ετοιμαστείτε για μια μοναδική εμπειρία γνώσεων!'
	};
};
