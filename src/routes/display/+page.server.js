import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		throw redirect(302, '/login');
	}

	return {
		user: session.user
	};
};
