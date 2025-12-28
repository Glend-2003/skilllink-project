const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.use('/api/v1/chat', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    ws: true //  permite el paso de WebSockets
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Unirse a una "sala" basada en el ID de la solicitud de servicio
    socket.on('join_chat', (requestId) => {
        socket.join(requestId);
        console.log(`User joined room: ${requestId}`);
    });

    // Escuchar cuando alguien envía un mensaje
    socket.on('send_message', (data) => {
        // data contiene: requestId, senderId, content
        console.log('Message received:', data);
        
        // Emitir el mensaje a todos en la sala (incluyendo al receptor)
        io.to(data.requestId).emit('receive_message', data);
        
        // AQUÍ se agregara luego la lógica para guardar en la DB MySQL
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`💬 Chat Service corriendo en puerto ${PORT}`);
});

