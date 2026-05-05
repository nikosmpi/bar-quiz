import { error, json } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { auth } from '$lib/server/auth';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('image');

	if (!file || !(file instanceof File)) {
		throw error(400, 'No file uploaded');
	}

	// Validate file type
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	if (!allowedTypes.includes(file.type)) {
		throw error(400, 'Invalid file type. Only images are allowed.');
	}

	// Validate file size (e.g., 2MB limit)
	const maxSize = 2 * 1024 * 1024;
	if (file.size > maxSize) {
		throw error(400, 'File too large. Maximum size is 2MB.');
	}

	const ext = file.name.split('.').pop();
	const filename = `${session.user.id}-${Date.now()}.${ext}`;
	const filePath = join(process.cwd(), 'static', 'uploads', filename);

	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		writeFileSync(filePath, buffer);

		return json({
			url: `/uploads/${filename}`
		});
	} catch (err) {
		console.error('Upload error:', err);
		throw error(500, 'Failed to save file');
	}
};
