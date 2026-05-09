import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, config } from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || session.user.role !== 'admin') {
		throw redirect(302, '/');
	}

	const quizzes = await db.select().from(quiz).orderBy(desc(quiz.createdAt));
	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();

	return {
		user: session.user,
		quizzes,
		activeQuizId: activeQuizConfig?.value || null
	};
};

export const actions = {
	setActiveQuiz: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session || session.user.role !== 'admin') {
			return fail(403);
		}

		const formData = await request.formData();
		const quizId = formData.get('quizId')?.toString() || "";

		// Use insert with onConflictUpdate (upsert) for the config table
		await db.insert(config)
			.values({ key: 'active_quiz_id', value: quizId })
			.onConflictDoUpdate({
				target: config.key,
				set: { value: quizId }
			});

		return { success: true };
	}
};
