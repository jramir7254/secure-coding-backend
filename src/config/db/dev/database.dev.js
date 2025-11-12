const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { Database } = require('sqlite3');
const { open } = require('sqlite');
const TABLES = require('./tables.dev');
const logger = require('@shared/logger');
const tables = require('./tables.json');
const codeFiles = require('./code-files.json');
const questions = require('./questions.json');

const dbPath = path.resolve(__dirname, 'dev.db');



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


    for (const { name, query } of tables) {
        await db.exec(query);
        logger.info('table.created', { tableName: name });
    }

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
    // logger.warn('skipping questions seed');

    await seed()
    logger.success('database.reset');

}





function strip(code) {
    // Split into lines and remove leading/trailing blank lines
    const lines = code.replace(/^\n+|\n+$/g, '').split('\n');

    // Find the minimum indentation (ignore empty lines)
    const indents = lines
        .filter(line => line.trim())
        .map(line => line.match(/^[ \t]*/)[0].length);

    const minIndent = Math.min(...indents);

    // Remove the minimum indentation from each line
    return lines.map(line => line.slice(minIndent)).join('\n');
}

/** 🔹 Seed initial data */
async function seed() {
    const db = await connect();


    const stmt = await db.prepare(
        `INSERT INTO questions (title, type, difficulty, tags, description)
     VALUES (?, ?, ?, ?, ?)`
    );

    for (const q of questions) {
        await stmt.run(q.title, q.type, q.difficulty, JSON.stringify(q.tags), q.description);
    }

    await stmt.finalize();
    logger.info('table.seeded', { table: 'questions', entries: TABLES.QUESTION_ROWS.length });

    //===============================================================================

    const stmt2 = await db.prepare(
        `INSERT INTO code_files (question_id, name, editable_ranges, language, value, display_order)
     VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const q of codeFiles) {
        await stmt2.run(q.question_id, q.name, JSON.stringify(q.editable_ranges), q.language, (q.value), q.display_order);
    }

    await stmt2.finalize();
    logger.info('table.seeded', { table: 'code_files', entries: TABLES.CODE_FILES_ROWS.length });



    //===============================================================================

    const stmt3 = await db.prepare(
        `INSERT INTO mcq_answers (question_id, answers)
     VALUES (?, ?)`
    );

    for (const q of TABLES.CEQ_ANSWERS_ROWS) {
        await stmt3.run(q.question_id, JSON.stringify(q.answers));
    }

    await stmt3.finalize();
    logger.info('table.seeded', { table: 'mcq_answers', entries: TABLES.CEQ_ANSWERS_ROWS.length });



    const stmt4 = await db.prepare(
        `INSERT INTO coding_answers (question_id, input, expected_output)
     VALUES (?, ?, ?)`
    );

    for (const q of TABLES.OEQ_ANSWERS_ROWS) {
        await stmt4.run(q.question_id, JSON.stringify(q.input), q.expected_output);
    }

    await stmt4.finalize();
    logger.info('table.seeded', { table: 'coding_answers', entries: TABLES.OEQ_ANSWERS_ROWS.length });



    // await db.run('INSERT INTO teams (team_name, join_code, game_id) VALUES ("Admin", "D3V", 0)')
    // logger.info('table.seeded', { table: 'admin', entries: 1 });



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
