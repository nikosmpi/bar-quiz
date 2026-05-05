import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import path from 'path';
import { auth } from '$lib/server/auth';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		console.log('Upload request received. FormData keys:', [...formData.keys()]);
		
		const file = formData.get('file') || formData.get('image');

		if (!file) {
			console.error('No file or image field found in FormData');
			return json({ error: 'No file uploaded' }, { status: 400 });
		}
		
		if (!(file instanceof File)) {
			console.error('Field found but it is not a File instance');
			return json({ error: 'Invalid file format' }, { status: 400 });
		}

		console.log('Processing file:', file.name, 'size:', file.size, 'type:', file.type);

		const buffer = Buffer.from(await file.arrayBuffer());
		const isVideo = file.type.startsWith('video/');
		const ext = isVideo ? path.extname(file.name) || '.mp4' : '.webp';
		const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
		const uploadPath = path.join(process.cwd(), 'static', 'uploads', filename);

		console.log('Saving to:', uploadPath);

		if (isVideo) {
			// Save video directly without sharp
			const { writeFile } = await import('fs/promises');
			await writeFile(uploadPath, buffer);
		} else {
			// Process image with sharp
			await sharp(buffer)
				.webp({ quality: 80 })
				.toFile(uploadPath);
		}

		console.log('Upload successful:', filename);
		return json({ 
			success: true, 
			url: `/uploads/${filename}` 
		});
	} catch (error) {
		console.error('CRITICAL Upload error:', error);
		return json({ error: `Σφάλμα: ${error.message}` }, { status: 500 });
	}
};

export const DELETE = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { url } = await request.json();
		if (!url || !url.startsWith('/uploads/')) {
			return json({ error: 'Invalid URL' }, { status: 400 });
		}

		const filename = path.basename(url);
		const filePath = path.join(process.cwd(), 'static', 'uploads', filename);

		// Using fs/promises which is imported as { writeFile } - wait, I need unlink
		const { unlink } = await import('fs/promises');
		await unlink(filePath).catch(err => console.error('Delete file error (ignored):', err));

		return json({ success: true });
	} catch (error) {
		console.error('Delete error:', error);
		return json({ error: 'Failed to delete file' }, { status: 500 });
	}
};
