const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { Database } = require('sqlite3');
const { open } = require('sqlite');
const TABLES = require('./tables.dev');

const dbPath = path.resolve(__dirname, 'dev.db');

// We'll store our connection here
let db;

/** 
 * 🔹 Connect or create DB 
 * @returns {Promise<import('sqlite').Database>}
 * */
async function connect() {
    if (db) return db; // reuse existing connection

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    // Enable foreign keys globally
    await db.exec('PRAGMA foreign_keys = ON;');

    console.log('✅ Connected to SQLite (async) database.');
    return db;
}

/** 🔹 Initialize schema */
async function init() {
    const db = await connect();

    await db.exec(TABLES.GAMES);
    console.log('Created table [games].');

    await db.exec(TABLES.TEAMS);
    console.log('Created table [teams].');

    await db.exec(TABLES.QUESTIONS);
    console.log('Created table [questions].');

    await db.exec(TABLES.QUESTION_ATTEMPTS);
    console.log('Created table [question_attempts].');

    await db.exec(TABLES.MULTIPLE_CHOICE_ATTEMPTS);
    console.log('Created table [multiple_choice_attempts].');

    await db.exec(TABLES.CODING_ATTEMPTS);
    console.log('Created table [coding_attempts].');

    await db.exec(TABLES.LEADERBOARD);
    console.log('Created table [leaderboard].');


    console.log('✅ Tables initialized successfully.');
}

/** 🔹 Reset database */
async function clear() {
    console.log('🧹 Resetting database...');
    if (db) await db.close();

    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️ Deleted existing database file.');
    }

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON;');
    console.log('✅ Created new database.');
}

async function reset() {
    await clear()
    await init()
    await seed()
    console.log('✅ Database reset successfully.');

}

/** 🔹 Seed initial data */
async function seed() {
    const db = await connect();
    const stmt = await db.prepare(
        `INSERT INTO questions (code, answer, editable_ranges, explanation)
     VALUES (?, ?, ?, ?)`
    );

    for (const q of TABLES.QUESTION_ROWS) {
        await stmt.run(q.code, q.answer, JSON.stringify(q.editable_ranges), q.explanation);
    }

    await stmt.finalize();
    console.log(`✅ Seeded questions table with ${TABLES.QUESTION_ROWS.length} entries`);

    await db.run('INSERT INTO teams (team_name, access_code) VALUES ("Admin", "D3V")')
    console.log(`✅ Seeded teams table with admin entry`);

    await db.run(`
        INSERT INTO teams (team_name, member_1, member_2, member_3, member_4, access_code) 
        VALUES ("Team", "John Doe", "Marvin Beak", "Philip Numbers", "El Patas", "123456")
    `)
    console.log(`✅ Seeded teams table with mock team entry`);


    await db.run(`
        INSERT INTO games (max_teams, time_limit, is_current, started_at, ended_at) 
        VALUES (15, 36000, 0, 1760405854, 1760405893)
    `)

    await db.run(`
        INSERT INTO games (max_teams, time_limit, is_current, started_at, ended_at) 
        VALUES (15, 36000, 0, 1760405963, 1760405999)
    `)
    console.log(`✅ Seeded games table with mock game entry`);
}

/** 🔹 Graceful shutdown */
process.on('SIGINT', async () => {
    if (db) await db.close();
    console.log('🧹 Closed SQLite database.');
    process.exit(0);
});

async function all(sql, params = []) {
    const db = await connect();
    return db.all(sql, params);
}

async function get(sql, params = []) {
    const db = await connect();
    return db.get(sql, params);
}

async function run(sql, params = []) {
    const db = await connect();
    return db.run(sql, params);
}

module.exports = { connect, init, reset, seed, all, get, run };
