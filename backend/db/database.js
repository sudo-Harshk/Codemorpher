const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'codemorpher.db');

// Ensure directory exists (important when using a volume like /data/db/codemorpher.db)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    javaCode TEXT,
    targetLanguage TEXT,
    translatedCode TEXT,
    debuggingSteps TEXT,
    algorithm TEXT,
    engineUsed TEXT,
    status TEXT DEFAULT 'success',
    error TEXT,
    timestamp TEXT NOT NULL
  );
`);

module.exports = db;
