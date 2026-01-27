require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skilllink_db"
};

let db;
let server;
let io;

(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("✅ Conectado a MySQL");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NULL,
        participant1_user_id INT NOT NULL,
        participant2_user_id INT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP NULL,
        FOREIGN KEY (participant1_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (participant2_user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

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

    console.log("✅ Tablas verificadas/creadas");
    
    // Crear servidor e inicializar socket.io después de que la DB esté lista
    server = http.createServer(app);
    io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    
    // Configurar Socket.IO
    io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      socket.on("join_chat", ({ conversationId }) => {
        socket.join(conversationId);
      });

      socket.on("send_message", async ({ conversationId, sender_user_id, message_text }) => {
        const [result] = await db.execute(
          "INSERT INTO messages (conversation_id, sender_user_id, message_text) VALUES (?, ?, ?)",
          [conversationId, sender_user_id, message_text]
        );

        await db.execute(
          "UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = ?",
          [conversationId]
        );

        const message = {
          message_id: result.insertId,
          conversation_id: conversationId,
          sender_user_id,
          message_text,
          created_at: new Date()
        };

        io.to(conversationId).emit("receive_message", message);
      });
    });
    
    // Iniciar servidor después de que la DB esté lista
    const PORT = process.env.PORT || 3003;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`💬 Chat Service corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error);
    process.exit(1);
  }
})();

// REST: Crear conversación
app.post("/api/conversations", async (req, res) => {
  try {
    const { participant1_user_id, participant2_user_id } = req.body;

    if (!participant1_user_id || !participant2_user_id) {
      return res.status(400).json({ error: "Ambos IDs de participantes son requeridos" });
    }

    const [existing] = await db.execute(
      `SELECT conversation_id FROM conversations 
       WHERE (participant1_user_id = ? AND participant2_user_id = ?) 
          OR (participant1_user_id = ? AND participant2_user_id = ?)`,
      [participant1_user_id, participant2_user_id, participant2_user_id, participant1_user_id]
    );

    if (existing.length > 0) return res.json(existing[0]);

    const [result] = await db.execute(
      "INSERT INTO conversations (participant1_user_id, participant2_user_id) VALUES (?, ?)",
      [participant1_user_id, participant2_user_id]
    );

    res.json({
      conversation_id: result.insertId,
      participant1_user_id,
      participant2_user_id
    });
  } catch (error) {
    console.error("❌ Error creating conversation:", error);
    res.status(500).json({ error: "Error al crear conversación" });
  }
});

// REST: Obtener conversaciones
app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [conversations] = await db.execute(
      `SELECT 
        c.conversation_id,
        c.participant1_user_id,
        c.participant2_user_id,
        CASE 
          WHEN c.participant1_user_id = ? THEN c.participant2_user_id
          ELSE c.participant1_user_id
        END AS other_user_id,
        u_other.email AS other_user_email,
        NULL AS other_user_name,
        1 AS is_provider,
        (SELECT m.message_text FROM messages m 
         WHERE m.conversation_id = c.conversation_id 
         ORDER BY m.created_at DESC LIMIT 1) AS last_message_text,
        COALESCE(c.last_message_at, c.created_at) AS last_activity_at,
        c.created_at
      FROM conversations c
      LEFT JOIN users u_other ON u_other.user_id = (
        CASE 
          WHEN c.participant1_user_id = ? THEN c.participant2_user_id
          ELSE c.participant1_user_id
        END
      )
      WHERE c.participant1_user_id = ? OR c.participant2_user_id = ?
      ORDER BY last_activity_at DESC`,
      [userId, userId, userId, userId]
    );

    res.json(conversations);
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
});

// REST: Obtener mensajes de una conversación
app.get("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const [messages] = await db.execute(
      `SELECT message_id, sender_user_id, message_text, is_read, created_at 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});