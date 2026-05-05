import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import path from 'path';
import { auth } from '$lib/server/auth';

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || (session.user.role !== 'admin' && session.user.role !== 'quizmaster')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
		const uploadPath = path.join(process.cwd(), 'static', 'uploads', filename);

		await sharp(buffer)
			.webp({ quality: 80 })
			.toFile(uploadPath);

		return json({ 
			success: true, 
			url: `/uploads/${filename}` 
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Αποτυχία ανεβάσματος και επεξεργασίας εικόνας.' }, { status: 500 });
	}
};
