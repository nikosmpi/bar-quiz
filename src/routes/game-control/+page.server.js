import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, config, question, option } from '$lib/server/db/schema';
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
	let activeQuiz = null;
	if (activeQuizId) {
		activeQuiz = await db.select().from(quiz).where(eq(quiz.id, activeQuizId)).get();
		const rawQuestions = await db.select().from(question)
			.where(eq(question.quizId, activeQuizId))
			.orderBy(asc(question.order));

		// Map questions with their options for full production control
		questions = await Promise.all(rawQuestions.map(async (q) => {
			const opts = await db.select().from(option)
				.where(eq(option.questionId, q.id))
				.orderBy(asc(option.order));
			return { ...q, options: opts };
		}));
	}

	return {
		user: session.user,
		activeQuizId,
		activeQuiz,
		questions
	};
};
