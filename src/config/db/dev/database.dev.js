const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { Database } = require('sqlite3');
const { open } = require('sqlite');
const TABLES = require('./tables.dev');
const logger = require('@shared/logger');

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

    logger.info('database.connected');
    return db;
}

/** 🔹 Initialize schema */
async function init() {
    const db = await connect();

    await db.exec(TABLES.GAMES);
    logger.info('table.created', { tableName: 'games' });

    await db.exec(TABLES.TEAMS);
    logger.info('table.created', { tableName: 'teams' });


    await db.exec(TABLES.QUESTIONS);
    logger.info('table.created', { tableName: 'questions' });


    await db.exec(TABLES.QUESTION_ATTEMPTS);
    logger.info('table.created', { tableName: 'question_attempts' });


    await db.exec(TABLES.MULTIPLE_CHOICE_ATTEMPTS);
    logger.info('table.created', { tableName: 'multiple_choice_attempts' });


    await db.exec(TABLES.CODING_ATTEMPTS);
    logger.info('table.created', { tableName: 'coding_attempts' });


    await db.exec(TABLES.LEADERBOARD);
    logger.info('table.created', { tableName: 'leaderboard' });



    logger.success('tables.created');
}

/** 🔹 Reset database */
async function clear() {
    logger.warn('database.reseting');
    if (db) await db.close();

    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        logger.warn('database.deleted');

    }

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON;');
    logger.info('database.created');

}

async function reset() {
    await clear()
    await init()
    await seed()
    logger.success('database.reset');

}

/** 🔹 Seed initial data */
async function seed() {
    const db = await connect();
    const stmt = await db.prepare(
        `INSERT INTO questions (code, answer, editable_ranges, explanation, expected_output)
     VALUES (?, ?, ?, ?, ?)`
    );

    for (const q of TABLES.QUESTION_ROWS) {
        await stmt.run(q.code, q.answer, JSON.stringify(q.editable_ranges), q.explanation, q.expected_output);
    }

    await stmt.finalize();
    logger.info('table.seeded', { table: 'questions', entries: TABLES.QUESTION_ROWS.length });

    await db.run('INSERT INTO teams (team_name, access_code) VALUES ("Admin", "D3V")')
    logger.info('table.seeded', { table: 'admin', entries: 1 });



}

/** 🔹 Graceful shutdown */
process.on('SIGINT', async () => {
    if (db) await db.close();
    logger.info('database.closed');
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
