const { connect } = require('@config/db/dev/database.dev')



async function getCurrentGame() {
    const db = await connect();
    const row = await db.get('SELECT * FROM games WHERE is_current = 1');
    console.debug('has_current_game?', row ? row.id : null)
    console.debug('has_current_game?', row)
    return row ? row : null
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
}


async function getPastGames() {
    const db = await connect();
    const rows = await db.all('SELECT * FROM games WHERE ended_at IS NOT NULL');
    console.debug('num_past_games', rows ? rows.length : 0)
    return rows
}

async function hasCurrentGame() {
    return await getCurrentGame() !== null
}






module.exports = { getPastGames, getCurrentGame, hasCurrentGame, createGame }