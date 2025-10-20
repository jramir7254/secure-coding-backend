const { connect } = require('@config/db/dev/database.dev')
const { generateAccessCode } = require('@shared/utils')
const { signToken } = require('@shared/auth')
const { admin } = require('@config/env')
const { DuplicateResourceError, ResourceNotFoundError } = require('@shared/errors')
const { hasCurrentGame, getCurrentGame, isGameFull } = require('../games/games.module');
const { getIO } = require('@src/modules/socket')


const register = async (teamData) => {

    const currentGame = await getCurrentGame()

    if (!currentGame) {
        console.error('no active game')
        throw new ResourceNotFoundError("No Active Games Found", 'games')
    }
    console.info('has active game')


    const isFull = await isGameFull()

    if (isFull) {
        console.error('game full')
        throw new ResourceNotFoundError("Game full", 'games')
    }


    const db = await connect()
    const { teamName, } = teamData

    const row = await db.get('SELECT * FROM teams WHERE team_name=?', [teamName])

    if (row) {
        console.debug('auth.register.exists', row)
        throw new DuplicateResourceError('Resource already exists', 'teams', teamName)
    }

    const accessCode = generateAccessCode();
    console.info('auth.register.access_code', { accessCode })

    const { lastID } = await db.run(
        'INSERT INTO teams (team_name, game_id, access_code) VALUES(?,?,?)',
        [teamName, currentGame.id, accessCode]
    )

    const io = getIO();
    io.emit("team_joined", { id: lastID, teamName, accessCode });

    console.info('auth.register.insert', { lastID })

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