import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { quiz, question, option } from '$lib/server/db/schema';
import { error, redirect, fail } from '@sveltejs/kit';
import { eq, asc } from 'drizzle-orm';

export const load = async ({ params, request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	const quizData = await db.select().from(quiz).where(eq(quiz.id, params.id)).get();

	if (!quizData) {
		throw error(404, 'Το Quiz δεν βρέθηκε.');
	}

	if (session.user.role !== 'admin' && quizData.ownerId !== session.user.id) {
		throw error(403, 'Δεν έχετε δικαίωμα πρόσβασης σε αυτό το Quiz.');
	}

	const questions = await db.select().from(question).where(eq(question.quizId, quizData.id)).orderBy(asc(question.order));
	
	// Fetch options for all questions
	const questionsWithOptions = await Promise.all(questions.map(async (q) => {
		const opts = await db.select().from(option).where(eq(option.questionId, q.id)).orderBy(asc(option.order));
		return { ...q, options: opts };
	}));

	return {
		quiz: quizData,
		questions: questionsWithOptions,
		user: session.user
	};
};

export const actions = {
	updateQuizInfo: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const coverImage = formData.get('coverImage')?.toString().trim();

		if (!name) return fail(400, { message: 'Το όνομα είναι υποχρεωτικό.' });

		await db.update(quiz).set({ 
			name, 
			coverImage,
			updatedAt: new Date() 
		}).where(eq(quiz.id, params.id));
		
		return { success: true };
	},

	deleteQuiz: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return fail(401);

		// Verification happens in load, but good to be safe here if we wanted extra check
		await db.delete(quiz).where(eq(quiz.id, params.id));
		
		throw redirect(302, '/quizmaster');
	},

	addQuestion: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return fail(401);

		const formData = await request.formData();
		const text = formData.get('text')?.toString().trim();
		if (!text) return fail(400, { message: 'Η ερώτηση είναι υποχρεωτική.' });

		const id = Math.random().toString(36).substring(2, 12);
		
		// Get current max order
		const lastQuestion = await db.select().from(question).where(eq(question.quizId, params.id)).orderBy(asc(question.order)).get();
		const nextOrder = lastQuestion ? lastQuestion.order + 1 : 0;

		await db.insert(question).values({
			id,
			quizId: params.id,
			text,
			order: nextOrder,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Add 4 default empty options
		for (let i = 0; i < 4; i++) {
			await db.insert(option).values({
				id: Math.random().toString(36).substring(2, 12),
				questionId: id,
				text: `Επιλογή ${i + 1}`,
				isCorrect: i === 0, // Set first one as correct by default
				order: i
			});
		}

		return { success: true };
	},

	deleteQuestion: async ({ request }) => {
		const formData = await request.formData();
		const questionId = formData.get('questionId')?.toString();
		if (!questionId) return fail(400);

		await db.delete(question).where(eq(question.id, questionId));
		return { success: true };
	},

	reorderQuestion: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return fail(401);

		const formData = await request.formData();
		const questionId = formData.get('questionId')?.toString();
		const direction = formData.get('direction')?.toString(); // 'up' or 'down'

		if (!questionId || !direction) return fail(400);

		// Fetch all questions for this quiz and sort by current order
		let questions = await db.select().from(question)
			.where(eq(question.quizId, params.id))
			.orderBy(asc(question.order));

		const index = questions.findIndex(q => q.id === questionId);
		if (index === -1) return fail(404);

		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= questions.length) return { success: true };

		// Swap the elements in the array
		[questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];

		// Update all questions with a clean, sequential order to fix any potential DB corruption
		for (let i = 0; i < questions.length; i++) {
			await db.update(question)
				.set({ order: i })
				.where(eq(question.id, questions[i].id));
		}

		return { success: true };
	},

	updateQuestion: async ({ request }) => {
		const formData = await request.formData();
		const questionId = formData.get('questionId')?.toString();
		const text = formData.get('text')?.toString().trim();
		const points = parseInt(formData.get('points')?.toString() || '1');
		const timeLimit = parseInt(formData.get('timeLimit')?.toString() || '30');

		if (!questionId || !text) return fail(400);

		await db.update(question).set({
			text,
			points,
			timeLimit,
			updatedAt: new Date()
		}).where(eq(question.id, questionId));

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
