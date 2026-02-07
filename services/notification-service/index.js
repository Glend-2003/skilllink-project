const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3006;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    res.json({ 
      success: true, 
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
