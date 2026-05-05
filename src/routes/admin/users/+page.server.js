import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user, config } from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || session.user.role !== 'admin') {
		throw redirect(302, '/');
	}

	const allUsers = await db.select().from(user);
	const regSetting = await db.select().from(config).where(eq(config.key, 'registration_enabled')).get();

	return {
		users: allUsers,
		registrationEnabled: regSetting?.value === 'true'
	};
};

export const actions = {
	updateRole: async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || session.user.role !== 'admin') {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId');
		const newRole = formData.get('role');

		const validRoles = ['admin', 'gamemaster', 'player', 'ban'];
		if (!validRoles.includes(newRole)) {
			return fail(400, { message: 'Invalid role' });
		}

		try {
			await db.update(user)
				.set({ role: newRole })
				.where(eq(user.id, userId));
			
			return { success: true };
		} catch (error) {
			console.error('Failed to update role:', error);
			return fail(500, { message: 'Database error' });
		}
	},

	toggleRegistration: async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || session.user.role !== 'admin') {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const enabled = formData.get('enabled') === 'true';

		try {
			await db.update(config)
				.set({ value: enabled ? 'true' : 'false' })
				.where(eq(config.key, 'registration_enabled'));
			
			return { success: true };
		} catch (error) {
			console.error('Failed to toggle registration:', error);
			return fail(500, { message: 'Database error' });
		}
	},

	deleteUser: async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || session.user.role !== 'admin') {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId');

		// Double check on server: don't allow deleting admins
		const targetUser = await db.select().from(user).where(eq(user.id, userId)).get();
		if (targetUser?.role === 'admin') {
			return fail(400, { message: 'Δεν επιτρέπεται η διαγραφή διαχειριστών.' });
		}

		try {
			// Delete user - Drizzle with better-sqlite3 will handle cascaded deletes if configured, 
			// but Better-Auth tables have some FKs.
			await db.delete(user).where(eq(user.id, userId));
			return { success: true };
		} catch (error) {
			console.error('Failed to delete user:', error);
			return fail(500, { message: 'Database error' });
		}
	}
};
