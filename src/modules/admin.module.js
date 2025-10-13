const { reset } = require('@config/db/dev/database.dev')


const resetDb = async () => {
    await reset();
}

module.exports = { resetDb }