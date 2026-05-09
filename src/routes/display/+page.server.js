import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { config } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();

	return {
		user: session.user,
		activeQuizId: activeQuizConfig?.value || null
	};
};
