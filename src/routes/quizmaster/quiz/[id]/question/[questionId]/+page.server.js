import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, question, option } from '$lib/server/db/schema';
import { error, redirect, fail } from '@sveltejs/kit';
import { eq, asc, and } from 'drizzle-orm';

export const load = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	const quizData = await db.select().from(quiz).where(eq(quiz.id, params.id)).get();
	if (!quizData) throw error(404, 'Quiz not found');

	if (session.user.role !== 'admin' && quizData.ownerId !== session.user.id) {
		throw error(403, 'Forbidden');
	}

	const questionData = await db.select().from(question).where(
		and(eq(question.id, params.questionId), eq(question.quizId, params.id))
	).get();

	if (!questionData) throw error(404, 'Question not found');

	const options = await db.select().from(option).where(eq(option.questionId, questionData.id)).orderBy(asc(option.order));

	return {
		quiz: quizData,
		question: questionData,
		options
	};
};

export const actions = {
	updateQuestion: async ({ params, request }) => {
		const formData = await request.formData();
		const text = formData.get('text')?.toString().trim();
		const explanation = formData.get('explanation')?.toString().trim() || null;
		const points = parseInt(formData.get('points')?.toString() || '1');
		const timeLimit = parseInt(formData.get('timeLimit')?.toString() || '30');
		const mediaType = formData.get('mediaType')?.toString() || 'none';
		const mediaUrl = formData.get('mediaUrl')?.toString().trim() || null;

		if (!text) return fail(400, { message: 'Η ερώτηση είναι υποχρεωτική.' });

		await db.update(question).set({
			text,
			explanation,
			points,
			timeLimit,
			mediaType,
			mediaUrl,
			updatedAt: new Date()
		}).where(eq(question.id, params.questionId));

		// Update options
		const optionIds = formData.getAll('optionId');
		const optionTexts = formData.getAll('optionText');
		const correctOptionId = formData.get('correctOption');

		for (let i = 0; i < optionIds.length; i++) {
			await db.update(option).set({
				text: optionTexts[i].toString().trim(),
				isCorrect: optionIds[i] === correctOptionId
			}).where(eq(option.id, optionIds[i].toString()));
		}

		return { success: true };
	}
};
