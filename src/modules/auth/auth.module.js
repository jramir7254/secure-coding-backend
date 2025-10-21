const { connect } = require('@config/db/dev/database.dev')
const { generateAccessCode } = require('@shared/utils')
const { signToken } = require('@shared/auth')
const { admin } = require('@config/env')
const { DuplicateResourceError, ResourceNotFoundError } = require('@shared/errors')
const { getCurrentGame, isCurrentGameFull } = require('../games/games.module');
const { getIO } = require('@src/modules/socket')
const logger = require('@shared/logger')





const register = async (teamData) => {

    const currentGame = await getCurrentGame()

    if (!currentGame) {
        logger.warn('no active games found')
        throw new ResourceNotFoundError("No Active Games Found", 'games')
    }

    const isFull = await isCurrentGameFull()

    if (isFull) {
        logger.warn('game is full')
        throw new ResourceNotFoundError("Game full", 'games')
    }


    const db = await connect()
    const { teamName } = teamData

    const row = await db.get('SELECT * FROM teams WHERE team_name=?', [teamName])

    if (row) {
        logger.warn('team already exists')
        throw new DuplicateResourceError('Team already registered', 'teams', teamName)
    }

    const accessCode = generateAccessCode();
    logger.info('generated access code', { accessCode })

    const { lastID } = await db.run(
        'INSERT INTO teams (team_name, game_id, access_code) VALUES(?,?,?)',
        [teamName, currentGame.id, accessCode]
    )

    logger.info('inserted team with id', { lastID })

    const io = getIO();
    io.emit("team_joined", { id: lastID, teamName, accessCode });


    const token = signToken({
        id: lastID,
        teamName,
        accessCode,
        isAdmin: false,
    })

    return token
}



const login = async ({ accessCode }) => {
    const db = await connect()
    const row = await db.get('SELECT * FROM teams WHERE access_code = ?', [accessCode])

    if (!row) throw new ResourceNotFoundError('Team not found', 'users', accessCode)

    console.debug('auth.login.found', row)
    console.debug('auth.login.is_admin', accessCode === admin.code)

    const token = signToken({
        id: row.id,
        teamName: row.team_name,
        accessCode,
        isAdmin: accessCode === admin.code
    })

    return token
}


const getTeam = async ({ accessCode }) => {
    const db = await connect()
    const row = await db.get('SELECT * FROM teams WHERE access_code = ?', [accessCode])

    if (!row) throw new ResourceNotFoundError('Not found', 'users', accessCode)

    console.debug('auth.login.found', row)
    console.debug('auth.login.is_admin', accessCode === admin.code)

    const token = signToken({
        id: row.id,
        teamName: row.team_name,
        accessCode,
        isAdmin: accessCode === admin.code
    })

    return token
}





module.exports = { register, login }