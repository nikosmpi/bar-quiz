import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, config, question } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();
	const activeQuizId = activeQuizConfig?.value || null;

	let questions = [];
	if (activeQuizId) {
		questions = await db.select().from(question)
			.where(eq(question.quizId, activeQuizId))
			.orderBy(asc(question.order));
	}

	return {
		user: session.user,
		activeQuizId,
		questions
	};
};
