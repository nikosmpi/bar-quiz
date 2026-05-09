import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	username: text('username'),
	role: text('role').notNull().default('player'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const config = sqliteTable('config', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export const quiz = sqliteTable('quiz', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	coverImage: text('cover_image'),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const question = sqliteTable('question', {
	id: text('id').primaryKey(),
	quizId: text('quiz_id')
		.notNull()
		.references(() => quiz.id, { onDelete: 'cascade' }),
	type: text('type').notNull().default('question'), // 'question', 'card'
	template: text('template').notNull().default('standard'), // Layout template
	text: text('text').notNull(),
	explanation: text('explanation'),
	mediaType: text('media_type').notNull().default('none'), // 'none', 'image', 'video'
	mediaUrl: text('media_url'),
	points: integer('points').notNull().default(1),
	timeLimit: integer('time_limit').notNull().default(30), // in seconds
	status: text('status').notNull().default('pending'), // 'pending', 'preparing', 'active', 'completed'
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const option = sqliteTable('option', {
	id: text('id').primaryKey(),
	questionId: text('question_id')
		.notNull()
		.references(() => question.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
	order: integer('order').notNull().default(0)
});

export const media = sqliteTable('media', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	url: text('url').notNull(),
	type: text('type').notNull(), // 'image', 'video'
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const answer = sqliteTable('answer', {
	id: text('id').primaryKey(),
	quizId: text('quiz_id')
		.notNull()
		.references(() => quiz.id, { onDelete: 'cascade' }),
	questionId: text('question_id')
		.notNull()
		.references(() => question.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	optionId: text('option_id')
		.notNull()
		.references(() => option.id, { onDelete: 'cascade' }),
	points: integer('points').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
