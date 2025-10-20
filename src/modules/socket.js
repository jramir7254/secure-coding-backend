const { handleGameEvents } = require('./games/games.socket')

let ioInstance = null;

function initSocket(io) {
    ioInstance = io;
}

function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized yet");
    }
    return ioInstance;
}

function registerSocketHandlers(io) {
    initSocket(io);

    io.on('connection', (socket) => {
        console.log(`⚡ User connected: ${socket.id}`);

        handleGameEvents(io, socket);


        socket.on('disconnect', () => {
            console.log(`❌ Disconnected: ${socket.id}`);
        });
    });
}

module.exports = { registerSocketHandlers, getIO };