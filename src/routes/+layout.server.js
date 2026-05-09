import { db } from '$lib/server/db';
import { config } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;
export const ssr = true;

export const load = async () => {
	const activeQuizConfig = await db.select().from(config).where(eq(config.key, 'active_quiz_id')).get();
	
	return {
		activeQuizId: activeQuizConfig?.value || null
	};
};
