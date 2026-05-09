import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { answer, question, option } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || session.user.role !== 'player') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { quizId, questionId, optionId } = await request.json();

	if (!quizId || !questionId || !optionId) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	// Check if user already answered this question for this quiz
	const existingAnswer = await db.select().from(answer).where(
		and(
			eq(answer.quizId, quizId),
			eq(answer.questionId, questionId),
			eq(answer.userId, session.user.id)
		)
	).get();

	if (existingAnswer) {
		return json({ error: 'Already answered' }, { status: 409 });
	}

	// Fetch question and option to verify and calculate points
	const qData = await db.select().from(question).where(eq(question.id, questionId)).get();
	const oData = await db.select().from(option).where(eq(option.id, optionId)).get();

	if (!qData || !oData || oData.questionId !== questionId) {
		return json({ error: 'Invalid question or option' }, { status: 400 });
	}

	// Points calculation
	let awardedPoints = 0;
	if (oData.isCorrect) {
		awardedPoints = qData.points || 1;
	}

	const id = Math.random().toString(36).substring(2, 12);
	
	await db.insert(answer).values({
		id,
		quizId,
		questionId,
		userId: session.user.id,
		optionId,
		points: awardedPoints,
		createdAt: new Date()
	});

	return json({ success: true, points: awardedPoints });
};
