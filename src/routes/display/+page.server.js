import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, config, question, option } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';

export const load = async ({ request, url }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();
	const activeQuizId = activeQuizConfig?.value || null;

	// Fetch home page configs for the intro state
	const configs = await db.select().from(config).all();
	const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]));

	let questions = [];
	let activeQuiz = null;
	if (activeQuizId) {
		activeQuiz = await db.select().from(quiz).where(eq(quiz.id, activeQuizId)).get();
		
		const questionRecords = await db.select().from(question)
			.where(eq(question.quizId, activeQuizId))
			.orderBy(asc(question.order));

		// Fetch options for all questions
		questions = await Promise.all(questionRecords.map(async (q) => {
			const opts = await db.select().from(option).where(eq(option.questionId, q.id)).orderBy(asc(option.order));
			return { ...q, options: opts };
		}));
	}

	return {
		user: session?.user || null,
		activeQuizId,
		activeQuiz,
		questions,
		homeTitle: configMap['home_title'] || 'Καλώς ήρθατε στο Quiz App',
		homeSubtitle: configMap['home_subtitle'] || 'Ετοιμαστείτε για μια μοναδική εμπειρία γνώσεων!',
		baseUrl: `${url.protocol}//${url.host}`
	};
};
