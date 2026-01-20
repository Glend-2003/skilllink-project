const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

// REST API: Crear nueva conversación
app.post('/api/conversations', async (req, res) => {
  try {
    console.log('POST /api/conversations from', req.ip);
    const { participant1_user_id, participant2_user_id } = req.body;

    if (!participant1_user_id || !participant2_user_id) {
      return res.status(400).json({ error: 'Ambos IDs de participantes son requeridos' });
    }

    // Verificar si ya existe una conversación entre estos usuarios
    const [existing] = await db.execute(
      'SELECT conversation_id FROM conversations WHERE (participant1_user_id = ? AND participant2_user_id = ?) OR (participant1_user_id = ? AND participant2_user_id = ?)',
      [participant1_user_id, participant2_user_id, participant2_user_id, participant1_user_id]
    );

    if (existing.length > 0) {
      // La conversación ya existe, devolverla
      return res.json(existing[0]);
    }

    // Crear nueva conversación
    const [result] = await db.execute(
      'INSERT INTO conversations (participant1_user_id, participant2_user_id) VALUES (?, ?)',
      [participant1_user_id, participant2_user_id]
    );

    res.json({
      conversation_id: result.insertId,
      participant1_user_id,
      participant2_user_id
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Error al crear conversación' });
  }
});

// REST API: Obtener conversaciones de un usuario
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('GET /api/conversations/', userId, 'from', req.ip);

    const [conversations] = await db.execute(
      `SELECT 
        c.conversation_id,
        c.participant1_user_id,
        c.participant2_user_id,
        CASE 
          WHEN c.participant1_user_id = ? THEN c.participant2_user_id
          ELSE c.participant1_user_id
        END as other_user_id,
        COALESCE(u.email, '') as other_user_email,
        COALESCE(pp.business_name, 'Usuario') as other_user_name,
        CASE WHEN pp.provider_id IS NULL THEN 0 ELSE 1 END as is_provider,
        (SELECT m.message_text FROM messages m WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1) as last_message_text,
        COALESCE(c.last_message_at, c.created_at) as last_activity_at,
        c.last_message_at,
        c.created_at
      FROM conversations c
      LEFT JOIN users u ON (c.participant1_user_id = ? AND u.user_id = c.participant2_user_id) OR (c.participant2_user_id = ? AND u.user_id = c.participant1_user_id)
      LEFT JOIN provider_profiles pp ON u.user_id = pp.user_id
      WHERE c.participant1_user_id = ? OR c.participant2_user_id = ?
      ORDER BY last_activity_at DESC`,
      [userId, userId, userId, userId, userId]
    );

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Error al obtener conversaciones' });
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`💬 Chat Service corriendo en puerto ${PORT} en 0.0.0.0`);
});

