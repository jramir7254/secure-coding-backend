

const { connect, reset } = require('./database.dev')
const crypto = require('crypto')

function generateAccessCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    const randomValues = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        code += chars[randomValues[i] % chars.length];
    }
    return code;
}

console.log(generateAccessCode())
// (async () => {
//     const db = await connect()
//     await db.run('INSERT INTO teams (team_name, access_code) VALUES ("Admin", "D3V")')
//     // await reset()
// })()



