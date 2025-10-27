const logger = require('@shared/logger');
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
        const socketId = socket?.id
        logger.info(`socket.connected`, { socketId });

        handleGameEvents(io, socket);

        socket.on('disconnect', () => {
            logger.info(`socket.disconnected`, { socketId });
        });
    });
}

module.exports = { registerSocketHandlers, getIO };