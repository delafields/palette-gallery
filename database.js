const sqlite3 = require('better-sqlite3');
const db = new sqlite3('mydatabase.db', { verbose: console.log });

const createTable = `
CREATE TABLE IF NOT EXISTS palette_data (
    hex_codes TEXT PRIMARY KEY,
    data JSONB NOT NULL
)`;

const createFavoriteTable = `
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL
)`;


db.exec(createTable);
db.exec(createFavoriteTable);

// Export the database connection
module.exports = db;