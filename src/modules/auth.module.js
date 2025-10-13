const { connect } = require('@config/db/dev/database.dev')
const { generateAccessCode } = require('@shared/utils')
const { signToken } = require('@shared/auth')
const { admin } = require('@config/env')
const { DuplicateResourceError, ResourceNotFoundError } = require('@shared/errors')


const register = async (teamData) => {
    const db = await connect()
    const {
        teamName,
        member1,
        member2,
        member3,
        member4
    } = teamData

    const row = await db.get('SELECT * FROM teams WHERE team_name=?', [teamName])

    if (row) {
        console.debug('auth.register.exists', row)
        throw new DuplicateResourceError('Resource already exists', 'teams', teamName)
    }

    const accessCode = generateAccessCode();
    console.info('auth.register.access_code', { accessCode })

    const { lastID } = await db.run(
        'INSERT INTO teams (team_name, member_1, member_2, member_3, member_4, access_code) VALUES(?,?,?,?,?,?)',
        [teamName, member1, member2, member3, member4, accessCode]
    )

    console.info('auth.register.insert', { lastID })

    const token = signToken({
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
        teamName: row.team_name,
        accessCode,
        isAdmin: accessCode === admin.code
    })

    return token
}





module.exports = { register, login }