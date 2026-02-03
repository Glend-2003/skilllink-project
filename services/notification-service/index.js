const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Expo } = require('expo-server-sdk');
require('dotenv').config();

const app = express();
const expo = new Expo();

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skilllinkdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to database');
    connection.release();
  })
  .catch(err => {
    console.error(' Database connection error:', err.message);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Register or update push token for a user
app.post('/api/notifications/register-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;

    if (!userId || !pushToken) {
      return res.status(400).json({ 
        message: 'userId and pushToken are required' 
      });
    }

    // Validate that the token is a valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      return res.status(400).json({ 
        message: 'Invalid Expo push token' 
      });
    }

    // Check if token already exists
    const [existingTokens] = await pool.query(
      'SELECT * FROM push_tokens WHERE user_id = ? AND push_token = ?',
      [userId, pushToken]
    );

    if (existingTokens.length === 0) {
      // Insert new token
      await pool.query(
        'INSERT INTO push_tokens (user_id, push_token, created_at) VALUES (?, ?, NOW())',
        [userId, pushToken]
      );
    } else {
      // Update last_used timestamp
      await pool.query(
        'UPDATE push_tokens SET last_used = NOW() WHERE user_id = ? AND push_token = ?',
        [userId, pushToken]
      );
    }

    res.json({ 
      message: 'Push token registered successfully',
      success: true 
    });

  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ 
      message: 'Error registering push token',
      error: error.message 
    });
  }
});

// Remove push token (when user logs out or disables notifications)
app.post('/api/notifications/remove-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;

    if (!userId || !pushToken) {
      return res.status(400).json({ 
        message: 'userId and pushToken are required' 
      });
    }

    await pool.query(
      'DELETE FROM push_tokens WHERE user_id = ? AND push_token = ?',
      [userId, pushToken]
    );

    res.json({ 
      message: 'Push token removed successfully',
      success: true 
    });

  } catch (error) {
    console.error('Error removing push token:', error);
    res.status(500).json({ 
      message: 'Error removing push token',
      error: error.message 
    });
  }
});

// Send notification to specific user
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ 
        message: 'userId, title, and body are required' 
      });
    }

    // Get user's push tokens
    const [tokens] = await pool.query(
      'SELECT push_token FROM push_tokens WHERE user_id = ?',
      [userId]
    );

    if (tokens.length === 0) {
      return res.status(404).json({ 
        message: 'No push tokens found for user' 
      });
    }

    // Create messages
    const messages = [];
    for (const tokenRow of tokens) {
      const pushToken = tokenRow.push_token;

      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid push token: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
        priority: 'high',
      });
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // Store notification in database
    await pool.query(
      `INSERT INTO notifications 
       (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        userId, 
        data?.type || 'push', 
        title, 
        body,
        data?.type || null,
        data?.conversationId || data?.serviceId || data?.requestId || data?.bookingId || null
      ]
    );

    res.json({ 
      message: 'Notifications sent successfully',
      success: true,
      tickets: tickets 
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      message: 'Error sending notification',
      error: error.message 
    });
  }
});

// Send notification to multiple users
app.post('/api/notifications/send-batch', async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return res.status(400).json({ 
        message: 'userIds (array), title, and body are required' 
      });
    }

    // Get push tokens for all users
    const [tokens] = await pool.query(
      'SELECT user_id, push_token FROM push_tokens WHERE user_id IN (?)',
      [userIds]
    );

    if (tokens.length === 0) {
      return res.status(404).json({ 
        message: 'No push tokens found for users' 
      });
    }

    // Create messages
    const messages = [];
    for (const tokenRow of tokens) {
      const pushToken = tokenRow.push_token;

      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid push token: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
        priority: 'high',
      });
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // Store notifications in database for each user
    const notificationPromises = userIds.map(userId => 
      pool.query(
        `INSERT INTO notifications 
         (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
        [
          userId, 
          data?.type || 'push', 
          title, 
          body,
          data?.type || null,
          data?.conversationId || data?.serviceId || data?.requestId || data?.bookingId || null
        ]
      )
    );

    await Promise.all(notificationPromises);

    res.json({ 
      message: 'Batch notifications sent successfully',
      success: true,
      sentCount: messages.length,
      tickets: tickets 
    });

  } catch (error) {
    console.error('Error sending batch notifications:', error);
    res.status(500).json({ 
      message: 'Error sending batch notifications',
      error: error.message 
    });
  }
});

// Get user's notifications history
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const [notifications] = await pool.query(
      `SELECT 
         notification_id as id,
         title, 
         message as body, 
         notification_type as type,
         related_entity_type,
         related_entity_id,
         is_read, 
         read_at,
         created_at
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Reconstruct data object from related fields
    const parsedNotifications = notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      body: notif.body,
      type: notif.type,
      data: {
        type: notif.type,
        ...(notif.related_entity_type === 'conversation' && { conversationId: notif.related_entity_id }),
        ...(notif.related_entity_type === 'service' && { serviceId: notif.related_entity_id }),
        ...(notif.related_entity_type === 'provider_request' && { requestId: notif.related_entity_id }),
        ...(notif.related_entity_type === 'booking' && { bookingId: notif.related_entity_id }),
      },
      is_read: notif.is_read === 1,
      read_at: notif.read_at,
      created_at: notif.created_at
    }));
notification_
    res.json({ 
      notifications: parsedNotifications,
      count: parsedNotifications.length 
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?',
      [notificationId]
    );

    res.json({ 
      message: 'Notification marked as read',
      success: true 
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Error marking notification as read',
      error: error.message 
    });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ 
      message: 'All notifications marked as read',
      success: true 
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      message: 'Error marking all notifications as read',
      error: error.message 
    });
  }
});

// Get unread notification count
app.get('/api/notifications/user/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;

    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ 
      count: result[0].count 
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      message: 'Error fetching unread count',
      error: error.message 
    });
  }
});

// Delete old notifications (cleanup)
app.delete('/api/notifications/cleanup', async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 30;

    const [result] = await pool.query(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysToKeep]
    );

    res.json({ 
      message: 'Old notifications cleaned up',
      deletedCount: result.affectedRows 
    });

  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ 
      message: 'Error cleaning up notifications',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(` Notification service running on port ${PORT}`);
});

module.exports = app;
