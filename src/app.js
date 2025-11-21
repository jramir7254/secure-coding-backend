const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./modules/socket')
const { requireAdmin, authMiddleware } = require('@shared/auth');


const authRoutes = require('./modules/auth/auth.routes')
const questionRoutes = require('./modules/questions/questions.routes')
const adminRoutes = require('./modules/admin/admin.routes')
const gameRoutes = require('./modules/games/games.routes');
const logger = require('@shared/logger');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server for socket.io
const server = http.createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
    cors: {
        origin: '*', // React client
        methods: ['GET', 'POST'],
    },
});

registerSocketHandlers(io);




// --- Express routes ---
app.get('/api', async (req, res) => {
    console.log('call made');
    return res.status(200).send('Server up')
});


app.use('/api/auth', authRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/admin', authMiddleware, requireAdmin, adminRoutes)
app.use('/api/games', gameRoutes)

app.use((err, req, res, next) => {
    logger.error('error', { err });
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
});



module.exports = { app, server, io };
