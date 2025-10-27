const logger = require('@shared/logger');
const { startCurrentGame, endCurrentGame } = require('./games.module')


async function handleGameEvents(io, socket) {
    socket.on('start_game', async () => {
        logger.info('socket.on.start_game');
        await startCurrentGame()
        io.emit('game_started');
        logger.info('io.emit.game_started');
    });


    socket.on('start_timer', () => {
        logger.info('socket.on.start_timer');
        io.emit('started_timer');
        logger.info('io.emit.started_timer');
    });


    socket.on('end_game', async () => {
        logger.info('socket.on.end_game');
        await endCurrentGame()
        io.emit('game_ended');
        logger.info('io.emit.game_ended');
    });
}


module.exports = { handleGameEvents }