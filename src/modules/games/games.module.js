const { connect } = require('@config/db/dev/database.dev');
const logger = require('@shared/logger');
const { getIO } = require('../socket');




async function getCurrentGame() {
    const db = await connect();
    const row = await db.get('SELECT * FROM games WHERE is_current = 1');
    console.debug('has_current_game?', row ? row.id : null)
    console.debug('has_current_game?', row)
    return row ? row : null
}


async function endCurrentGame() {
    const db = await connect();

    await db.run("UPDATE games SET ended_at = datetime('now', 'localtime') WHERE is_current = 1");


}


async function createGame(gameOptions) {
    console.debug('game_options', gameOptions)
    const { maxTeams, timeLimit } = gameOptions

    const db = await connect();
    const { lastID } = await db.run(
        'INSERT INTO games (max_teams, time_limit, is_current) VALUES (?,?,1)',
        [maxTeams, timeLimit]
    );
    console.debug('game_inserted', { lastID })

    return { id: lastID }
}


async function getPastGames() {
    const db = await connect();
    const rows = await db.all('SELECT * FROM games WHERE ended_at IS NOT NULL AND is_current = 0');
    console.debug('num_past_games', rows ? rows.length : 0)
    return rows
}

async function hasCurrentGame() {
    return await getCurrentGame() !== null
}

async function isGameFull(params) {
    const db = await connect();
    const { id, max_teams } = await db.get('SELECT id, max_teams FROM games WHERE is_current = 1');
    const count = await db.get('SELECT COUNT (*) FROM teams WHERE game_id = ?', [id])
    logger.debug('Count', { count: count['COUNT (*)'] })

    return count['COUNT (*)'] === max_teams
}



async function startCurrentGame(params) {
    const db = await connect();
    await db.run("UPDATE games SET started_at = datetime('now', 'localtime') WHERE is_current = 1");
}

async function getLeaderboard(params) {
    logger.info('geting lead')
    const cg = await getCurrentGame()
    const db = await connect();
    const l = await db.all("SELECT t.team_name, team_id, SUM (points) as points FROM leaderboard LEFT JOIN teams t ON t.id = team_id WHERE t.game_id = ? GROUP BY team_id ORDER BY points DESC", [cg?.id]);
    logger.debug('lead', { count: l.length })

    return l
}






module.exports = { getPastGames, getCurrentGame, hasCurrentGame, createGame, startCurrentGame, isGameFull, getLeaderboard, endCurrentGame }