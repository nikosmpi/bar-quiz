import Database from 'better-sqlite3';
const db = new Database('local.db');
const rows = db.prepare('SELECT * FROM verification ORDER BY created_at DESC LIMIT 5').all();
console.log(JSON.stringify(rows, null, 2));
