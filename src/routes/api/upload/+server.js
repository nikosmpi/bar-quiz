import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import path from 'path';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const GET = async ({ request, url }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const type = url.searchParams.get('type'); // 'image' or 'video'
	
	let query = db.select().from(media);
	
	// If not admin, only show own media
	if (session.user.role !== 'admin') {
		if (type) {
			query = query.where(eq(media.ownerId, session.user.id), eq(media.type, type));
		} else {
			query = query.where(eq(media.ownerId, session.user.id));
		}
	} else if (type) {
		query = query.where(eq(media.type, type));
	}

	const results = await query.orderBy(desc(media.createdAt)).all();
	return json(results);
};

export const POST = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') || formData.get('image');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No valid file uploaded' }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const isVideo = file.type.startsWith('video/');
		const mediaType = isVideo ? 'video' : 'image';
		const ext = isVideo ? path.extname(file.name) || '.mp4' : '.webp';
		const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
		const uploadPath = path.join(process.cwd(), 'static', 'uploads', filename);
		const publicUrl = `/uploads/${filename}`;

		if (isVideo) {
			const { writeFile } = await import('fs/promises');
			await writeFile(uploadPath, buffer);
		} else {
			await sharp(buffer)
				.webp({ quality: 80 })
				.toFile(uploadPath);
		}

		// Save to media library
		const mediaId = Math.random().toString(36).substring(2, 12);
		await db.insert(media).values({
			id: mediaId,
			name: file.name,
			url: publicUrl,
			type: mediaType,
			ownerId: session.user.id,
			createdAt: new Date()
		});

		return json({ 
			success: true, 
			url: publicUrl,
			id: mediaId
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: `Σφάλμα: ${error.message}` }, { status: 500 });
	}
};

export const DELETE = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { url, id } = await request.json();
		
		// If ID is provided, verify ownership and delete from DB
		if (id) {
			const record = await db.select().from(media).where(eq(media.id, id)).get();
			if (!record) return json({ error: 'Not found' }, { status: 404 });
			if (session.user.role !== 'admin' && record.ownerId !== session.user.id) {
				return json({ error: 'Forbidden' }, { status: 403 });
			}
			await db.delete(media).where(eq(media.id, id));
		}

		if (url && url.startsWith('/uploads/')) {
			const filename = path.basename(url);
			const filePath = path.join(process.cwd(), 'static', 'uploads', filename);
			const { unlink } = await import('fs/promises');
			await unlink(filePath).catch(err => console.error('File delete error:', err));
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: 'Failed to delete' }, { status: 500 });
	}
};
