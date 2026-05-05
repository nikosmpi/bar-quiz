import { error, json } from '@sveltejs/kit';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { auth } from '$lib/server/auth';
import sharp from 'sharp';

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

	// Validate file size (e.g., 5MB limit now that we process it)
	const maxSize = 5 * 1024 * 1024;
	if (file.size > maxSize) {
		throw error(400, 'File too large. Maximum size is 5MB.');
	}

	const filename = `${session.user.id}-${Date.now()}.webp`;
	const filePath = join(process.cwd(), 'static', 'uploads', filename);

	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Process image with sharp: resize to 200x200, crop to square (cover), and convert to webp
		await sharp(buffer)
			.resize(200, 200, {
				fit: 'cover',
				position: 'center'
			})
			.webp()
			.toFile(filePath);

		return json({
			url: `/uploads/${filename}`
		});
	} catch (err) {
		console.error('Upload error:', err);
		throw error(500, 'Failed to process and save image');
	}
};

export const DELETE = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { url } = await request.json();

	if (!url || !url.startsWith('/uploads/')) {
		return json({ success: true }); // Ignore external URLs or missing URLs
	}

	const filename = url.replace('/uploads/', '');
	
	// Security check: Ensure the filename starts with the user's ID
	if (!filename.startsWith(`${session.user.id}-`)) {
		throw error(403, 'Forbidden: You can only delete your own images');
	}

	const filePath = join(process.cwd(), 'static', 'uploads', filename);

	try {
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
		return json({ success: true });
	} catch (err) {
		console.error('Delete error:', err);
		throw error(500, 'Failed to delete image file');
	}
};
