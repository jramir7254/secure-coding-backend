const { startCurrentGame, endCurrentGame } = require('./games.module')


async function handleGameEvents(io, socket) {
    socket.on('start_game', async (data) => {
        console.log('Message received game:', data);
        await startCurrentGame()
        io.emit('game_started', data); // broadcast to all clients
    });


    socket.on('start_timer', () => {
        console.log('Message received timer:');
        io.emit('started_timer'); // broadcast to all clients
    });


    socket.on('end_game', async (data) => {
        console.log('Message received timer:', data);
        await endCurrentGame()
        io.emit('game_ended', data); // broadcast to all clients
    });
}


module.exports = { handleGameEvents }