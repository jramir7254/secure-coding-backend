const { connect } = require('@config/db/dev/database.dev')



async function getQuestion() {
    const db = await connect();

    const row = await db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');
    if (!row) { throw new Error('Question not found') }

    // console.debug('row', row)
    return row
}

async function handleAttempt() {

}





module.exports = { handleAttempt, getQuestion }