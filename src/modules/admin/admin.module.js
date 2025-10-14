const { reset, connect } = require('@config/db/dev/database.dev')


const resetDb = async () => {
    await reset();
}


/**
 * 
 * @typedef {Object} GameOptions
 * @property {number} maxTeams
 * @property {number} timeLimit
 * @property {boolean} isCurrent
 * @property {boolean} hasStarted
 * @property {boolean} hasEnded
 * 
 * @param {GameOptions} gameOptions 
 * 
 */
const createGame = async (gameOptions) => {

}


module.exports = { resetDb }