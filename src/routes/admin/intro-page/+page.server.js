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
	
	// Fetch all relevant configs
	const configs = await db.select().from(config).all();
	const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]));

	const activeQuizId = configMap['active_quiz_id'] || null;

	let activeQuiz = null;
	if (activeQuizId) {
		activeQuiz = await db.select().from(quiz).where(eq(quiz.id, activeQuizId)).get();
	}

	return {
		user: session.user,
		quizzes,
		activeQuizId,
		activeQuiz,
		homeTitle: configMap['home_title'] || 'Καλώς ήρθατε στο Quiz App',
		homeSubtitle: configMap['home_subtitle'] || 'Ετοιμαστείτε για μια μοναδική εμπειρία γνώσεων!'
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
		const coverImage = formData.get('coverImage')?.toString().trim();

		// Update active quiz ID in config
		await db.insert(config)
			.values({ key: 'active_quiz_id', value: quizId })
			.onConflictDoUpdate({
				target: config.key,
				set: { value: quizId }
			});

		// If a quiz is selected and a cover image is provided (or changed), update the quiz
		if (quizId && coverImage !== undefined) {
			await db.update(quiz)
				.set({ coverImage, updatedAt: new Date() })
				.where(eq(quiz.id, quizId));
		}

		return { success: true };
	},

	updateHomeContent: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session || session.user.role !== 'admin') {
			return fail(403);
		}

		const formData = await request.formData();
		const homeTitle = formData.get('homeTitle')?.toString().trim();
		const homeSubtitle = formData.get('homeSubtitle')?.toString().trim();

		if (homeTitle !== undefined) {
			await db.insert(config)
				.values({ key: 'home_title', value: homeTitle })
				.onConflictDoUpdate({
					target: config.key,
					set: { value: homeTitle }
				});
		}

		if (homeSubtitle !== undefined) {
			await db.insert(config)
				.values({ key: 'home_subtitle', value: homeSubtitle })
				.onConflictDoUpdate({
					target: config.key,
					set: { value: homeSubtitle }
				});
		}

		return { success: true };
	}
};
