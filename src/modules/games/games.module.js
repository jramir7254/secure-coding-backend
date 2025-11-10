const { connect } = require('@config/db/dev/database.dev');
const logger = require('@shared/logger');
const { getIO } = require('../socket');




async function getCurrentGame() {
    const db = await connect();
    const row = await db.get('SELECT * FROM games WHERE is_active = 1');
    logger.info('games.get.current', { game: row ? row?.id : null })

    return row ? row : null
}


async function endCurrentGame() {
    const db = await connect();
    await db.run("UPDATE games SET ended_at = datetime('now', 'localtime') WHERE is_active = 1");
}


async function getTeamResults(teamId) {
    const db = await connect();
    const s = await db.all(`
 SELECT 
  qa.id AS attempt_id,
  qa.question_id,
  qa.team_id,
  qa.type,
  qa.started_at,
  qa.ended_at,
  mca.selected_answer,
  ca.submitted_code
FROM question_attempts qa
LEFT JOIN multiple_choice_attempts mca 
  ON qa.id = mca.attempt_id 
  AND qa.type = 'multiple'
LEFT JOIN coding_attempts ca 
  ON qa.id = ca.attempt_id 
  AND qa.type = 'coding'
WHERE qa.team_id = ?;

    `, [teamId]);
    logger.debug('stat', s)
    return s

}


async function closeCurrentGame() {
    const db = await connect();
    await db.run("UPDATE games SET is_active = 0 WHERE is_active = 1");

    const cg = await getCurrentGame()

    logger.debug('Is game closed?', { isClosed: cg === null })

    return
}


async function createGame(gameOptions) {
    console.debug('game_options', gameOptions)
    const { maxTeams, timeLimit } = gameOptions

    const db = await connect();
    const { lastID } = await db.run(
        'INSERT INTO games (max_teams, time_limit, is_active) VALUES (?,?,1)',
        [maxTeams, timeLimit]
    );
    console.debug('game_inserted', { lastID })

    return { id: lastID }
}


async function getPastGames() {
    const db = await connect();
    const rows = await db.all('SELECT g.*, (SELECT COUNT(*) FROM teams WHERE game_id = g.id) AS teamsPlayed FROM games g WHERE g.ended_at IS NOT NULL AND g.is_active = 0');
    logger.debug('num_past_games', rows ? rows.length : 0)
    return rows
}

async function hasCurrentGame() {
    return await getCurrentGame() !== null
}


const getTopTeamsFromAllGames = async () => {
    const db = await connect()
    const l = await db.all(
        "SELECT t.team_name, team_id, total_points FROM leaderboard LEFT JOIN teams t ON t.id = team_id GROUP BY team_id ORDER BY total_points DESC LIMIT 3"
    );
    logger.debug('all teams', l)
    return l
}




const getTeamsInCurrentGame = async () => {
    const db = await connect()
    const game = await getCurrentGame()
    if (!game?.id) return
    const allTeams = await db.all('SELECT * FROM teams WHERE game_id = ?', [game?.id])
    logger.debug('all teams', allTeams)
    return allTeams
}

async function isCurrentGameFull() {
    const db = await connect();
    const { id, max_teams } = await db.get('SELECT id, max_teams FROM games WHERE is_active = 1');
    const count = await db.get('SELECT COUNT (*) FROM teams WHERE game_id = ?', [id])
    logger.debug('Count', { count: count['COUNT (*)'] })

    return count['COUNT (*)'] === max_teams
}



async function startCurrentGame() {
    const db = await connect();
    await db.run("UPDATE games SET started_at = datetime('now', 'localtime') WHERE is_active = 1");
}

async function getLeaderboard() {
    logger.info('leaderboard.get')
    const cg = await getCurrentGame()
    const db = await connect();
    const l = await db.all("SELECT t.team_name, team_id, total_points FROM leaderboard LEFT JOIN teams t ON t.id = team_id WHERE t.game_id = ?", [cg?.id]);
    logger.info('leaderboard.get.count', { count: l.length })

    return l
}






module.exports = {
    getPastGames,
    getCurrentGame,
    hasCurrentGame,
    createGame,
    startCurrentGame,
    isCurrentGameFull,
    getLeaderboard,
    endCurrentGame,
    closeCurrentGame,
    getTeamsInCurrentGame,
    getTopTeamsFromAllGames,
    getTeamResults
}