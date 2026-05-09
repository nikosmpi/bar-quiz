import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { question } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { questionId, status } = await request.json();

	if (!questionId || !status) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	// Validate status values
	const validStatuses = ['pending', 'preparing', 'active', 'completed'];
	if (!validStatuses.includes(status)) {
		return json({ error: 'Invalid status' }, { status: 400 });
	}

	await db.update(question)
		.set({ status })
		.where(eq(question.id, questionId));

	return json({ success: true });
};
