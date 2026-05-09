import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Use process.env directly to avoid SvelteKit's $env resolution issues in vite.config
const databaseUrl = process.env.DATABASE_URL || 'local.db';

const sqlite = new Database(databaseUrl);
export const db = drizzle(sqlite, { schema });
