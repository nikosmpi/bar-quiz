import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz } from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	let quizzes;
	if (session.user.role === 'admin') {
		quizzes = await db.select().from(quiz).orderBy(desc(quiz.createdAt));
	} else {
		quizzes = await db.select().from(quiz).where(eq(quiz.ownerId, session.user.id)).orderBy(desc(quiz.createdAt));
	}

	return {
		user: session.user,
		quizzes
	};
};

export const actions = {
	createQuiz: async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();

		if (!name) {
			return fail(400, { message: 'Το όνομα του quiz είναι υποχρεωτικό.' });
		}

		try {
			const id = Math.random().toString(36).substring(2, 12); // Simple ID generation
			await db.insert(quiz).values({
				id,
				name,
				ownerId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			return { success: true };
		} catch (error) {
			console.error('Failed to create quiz:', error);
			return fail(500, { message: 'Σφάλμα κατά τη δημιουργία του quiz.' });
		}
	}
};
