const { reset, connect } = require('@config/db/dev/database.dev')
const { getCurrentGame } = require('@src/modules/games/games.module')
const logger = require('@shared/logger')

const resetDb = async () => {
    await reset();
}



const getTeamsInCurrentGame = async () => {
    const db = await connect()
    const game = await getCurrentGame()
    if (!game?.id) return
    const allTeams = await db.all('SELECT * FROM teams WHERE game_id = ?', [game?.id])
    logger.debug('all teams', allTeams)
    return allTeams
}


const deleteTeam = async (teamId) => {
    const db = await connect()
    logger.info("deleting team", { teamId })
    await db.run('DELETE FROM teams WHERE id = ?', [teamId])
    logger.info("deleted team", { teamId })
}


module.exports = { resetDb, getTeamsInCurrentGame, deleteTeam }