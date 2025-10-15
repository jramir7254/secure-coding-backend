const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


const authRoutes = require('./modules/auth/auth.routes')
const questionRoutes = require('./modules/questions/questions.routes')
const adminRoutes = require('./modules/admin/admin.routes')
const gameRoutes = require('./modules/games/games.routes')

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server for socket.io
const server = http.createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // React client
        methods: ['GET', 'POST'],
    },
});

// Listen for client connections
io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // Listen for events from the client
    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        io.emit('receive_message', data); // broadcast to all clients
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});


// --- Express routes ---
app.get('/', async (req, res) => {
    console.log('call made');
    return res.status(200).json({});
});


app.use('/auth', authRoutes)
app.use('/questions', questionRoutes)
app.use('/admin', adminRoutes)
app.use('/games', gameRoutes)

app.use((err, req, res, next) => {
    console.error('🔥 Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
});



module.exports = { app, server, io };
