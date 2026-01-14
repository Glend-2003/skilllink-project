const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  database: 'skilllink_db'
};

let db;
(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Conectado a MySQL');
    
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

    socket.on('join_chat', async (data) => {
        console.log('Join chat data:', data);
        const { requestId, userId } = data;
        
        if (!requestId || !userId) {
            socket.emit('error', { message: 'requestId y userId son requeridos' });
            return;
        }
        
        let conversationId;
        if (!isNaN(requestId)) {
            conversationId = parseInt(requestId);
        } else {
            const [rows] = await db.execute(
                'SELECT conversation_id FROM conversations WHERE request_id = ?',
                [requestId]
            );
            if (rows.length === 0) {
                console.log(`No conversation found for request ${requestId}`);
                socket.emit('error', { message: 'Conversación no encontrada' });
                return;
            }
            conversationId = rows[0].conversation_id;
        }

        const [participants] = await db.execute(
            'SELECT * FROM conversations WHERE conversation_id = ? AND (participant1_user_id = ? OR participant2_user_id = ?)',
            [conversationId, userId, userId]
        );

        if (participants.length === 0) {
            console.log(`User ${userId} not authorized for conversation ${conversationId}`);
            socket.emit('error', { message: 'No tienes acceso a esta conversación' });
            return;
        }
        
        socket.join(conversationId.toString());
        console.log(`User ${userId} joined room: ${conversationId}`);

        const [messages] = await db.execute(
            'SELECT sender_user_id, message_text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [conversationId]
        );
        socket.emit('previous_messages', messages);
    });

    socket.on('send_message', async (data) => {
        console.log('Message received:', data);
        
        if (!data.requestId || !data.senderId || !data.content) {
            socket.emit('error', { message: 'requestId, senderId y content son requeridos' });
            return;
        }
        
        let conversationId;
        if (!isNaN(data.requestId)) {
            conversationId = parseInt(data.requestId);
        } else {
            const [rows] = await db.execute(
                'SELECT conversation_id FROM conversations WHERE request_id = ?',
                [data.requestId]
            );
            if (rows.length === 0) {
                console.log(`No conversation found for request ${data.requestId}`);
                socket.emit('error', { message: 'Conversación no encontrada' });
                return;
            }
            conversationId = rows[0].conversation_id;
        }

        const [participants] = await db.execute(
            'SELECT * FROM conversations WHERE conversation_id = ? AND (participant1_user_id = ? OR participant2_user_id = ?)',
            [conversationId, data.senderId, data.senderId]
        );

        if (participants.length === 0) {
            console.log(`User ${data.senderId} not authorized to send messages in conversation ${conversationId}`);
            socket.emit('error', { message: 'No tienes permiso para enviar mensajes en esta conversación' });
            return;
        }

        console.log('Conversation ID:', conversationId);

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

        await db.execute(
            'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = ?',
            [conversationId]
        );
        
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

