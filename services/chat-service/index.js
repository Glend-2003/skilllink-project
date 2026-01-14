const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());

// Conexión a MySQL
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  // password: '', // Sin password
  database: 'skilllink_db'
};

let db;
(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Conectado a MySQL');
    
    // Crear tabla si no existe (usando el esquema correcto)
    // Nota: Asumimos que conversations ya existe, solo verificamos messages
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_user_id INT NOT NULL,
        message_text TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('Tabla messages verificada/creada');
  } catch (error) {
    console.error('Error conectando a MySQL:', error);
  }
})();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Unirse a una "sala" basada en el ID de la solicitud de servicio o conversation_id
    socket.on('join_chat', async (requestId) => {
        // Si requestId es numérico, tratar como conversation_id
        let conversationId;
        if (!isNaN(requestId)) {
            conversationId = parseInt(requestId);
        } else {
            // Buscar conversation_id por request_id
            const [rows] = await db.execute(
                'SELECT conversation_id FROM conversations WHERE request_id = ?',
                [requestId]
            );
            if (rows.length === 0) {
                console.log(`No conversation found for request ${requestId}`);
                return;
            }
            conversationId = rows[0].conversation_id;
        }
        
        socket.join(conversationId.toString());
        console.log(`User joined room: ${conversationId}`);

        // Cargar mensajes previos
        const [messages] = await db.execute(
            'SELECT sender_user_id, message_text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [conversationId]
        );
        socket.emit('previous_messages', messages);
    });

    // Escuchar cuando alguien envía un mensaje
    socket.on('send_message', async (data) => {
        // data contiene: requestId, senderId, content
        console.log('Message received:', data);
        
        let conversationId;
        if (!isNaN(data.requestId)) {
            conversationId = parseInt(data.requestId);
        } else {
            // Buscar conversation_id por request_id
            const [rows] = await db.execute(
                'SELECT conversation_id FROM conversations WHERE request_id = ?',
                [data.requestId]
            );
            if (rows.length === 0) {
                console.log(`No conversation found for request ${data.requestId}`);
                return;
            }
            conversationId = rows[0].conversation_id;
        }

        console.log('Conversation ID:', conversationId);

        // Guardar en DB
        try {
            console.log('Inserting message:', conversationId, data.senderId, data.content);
            const result = await db.execute(
                'INSERT INTO messages (conversation_id, sender_user_id, message_text) VALUES (?, ?, ?)',
                [conversationId, data.senderId, data.content]
            );
            console.log('Mensaje guardado en DB, result:', result);
        } catch (error) {
            console.error('Error guardando mensaje:', error);
        }

        // Actualizar last_message_at en conversations
        await db.execute(
            'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = ?',
            [conversationId]
        );
        
        // Emitir el mensaje a todos en la sala
        io.to(conversationId.toString()).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`💬 Chat Service corriendo en puerto ${PORT}`);
});

