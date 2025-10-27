

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

(async () => {
    const db = await connect()
    const s = await db.all(`
        SELECT * FROM question_attempts qa
        JOIN multiple_choice_attempts mca ON qa.id = mca.attempt_id
        JOIN coding_attempts ca ON qa.id = ca.attempt_id
        WHERE qa.team_id = ?
    `, [3]);
    console.log(s)
})()



