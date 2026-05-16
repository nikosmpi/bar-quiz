import { db } from '$lib/server/db';
import { answer, user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq, sql, asc } from 'drizzle-orm';

export const GET = async ({ url }) => {
	const quizId = url.searchParams.get('quizId');
	if (!quizId) {
		return json({ error: 'quizId is required' }, { status: 400 });
	}

	try {
		const totalPointsExpr = sql`sum(${answer.points})`.mapWith(Number);
		
		const results = await db.select({
			userId: answer.userId,
			username: user.username,
			name: user.name,
			image: user.image,
			totalPoints: totalPointsExpr
		})
		.from(answer)
		.leftJoin(user, eq(answer.userId, user.id))
		.where(eq(answer.quizId, quizId))
		.groupBy(answer.userId)
		.orderBy(asc(totalPointsExpr));

		return json(results);
	} catch (err) {
		console.error('Leaderboard calculation failed:', err);
		return json({ error: 'Failed to calculate leaderboard' }, { status: 500 });
	}
};
