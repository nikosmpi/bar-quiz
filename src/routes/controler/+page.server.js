import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, config, question } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || session.user.role !== 'player') {
		throw redirect(302, '/');
	}

	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();
	const activeQuizId = activeQuizConfig?.value || null;

	let questions = [];
	let activeQuiz = null;
	if (activeQuizId) {
		activeQuiz = await db.select().from(quiz).where(eq(quiz.id, activeQuizId)).get();
		questions = await db.select().from(question)
			.where(eq(question.quizId, activeQuizId))
			.orderBy(asc(question.order));
	}

	return {
		user: session.user,
		activeQuizId,
		activeQuiz,
		questions
	};
};
