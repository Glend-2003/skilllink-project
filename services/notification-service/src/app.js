const express = require('express');
const mysql = require('mysql2/promise');
const { sendEmail } = require('./utils/mailer'); // Solo una vez
require('dotenv').config();

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'skilllink_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'skilllink_db'
};

app.post('/api/notifications/send', async (req, res) => {
    const { userId, userEmail, type, title, message, entityType, entityId } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            `INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, type, title, message, entityType || null, entityId || null]
        );

        console.log(`[Notification] Preparando correo para: ${userEmail}`);

        if (userEmail) {
            // Asegúrate de que el archivo src/templates/notification.hbs existe
            await sendEmail(userEmail, title, 'notification', { title, message });
        }

        await connection.end();
        res.status(201).json({ 
            success: true, 
            message: 'Notificación registrada y en proceso de envío',
            notificationId: result.insertId 
        });
     } catch (error) {
        console.error('Error en Notification Service:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Notification Service corriendo en el puerto ${PORT}`);
});