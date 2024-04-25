const sqlite3 = require('better-sqlite3');
const db = new sqlite3('mydatabase.db', { verbose: console.log });

const createTable = `
CREATE TABLE IF NOT EXISTS palette_data (
    hex_codes TEXT PRIMARY KEY,
    data JSONB NOT NULL
)`;

db.exec(createTable);

// Export the database connection
module.exports = db;