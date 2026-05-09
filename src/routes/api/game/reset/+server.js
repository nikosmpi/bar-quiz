import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { question, answer } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { quizId } = await request.json();

	if (!quizId) {
		return json({ error: 'Missing quizId' }, { status: 400 });
	}

	// 1. Reset all question statuses to 'pending' for this quiz
	await db.update(question)
		.set({ status: 'pending' })
		.where(eq(question.quizId, quizId));

	// 2. Delete all answers for this quiz
	await db.delete(answer)
		.where(eq(answer.quizId, quizId));

	return json({ success: true });
};
