# Push Notification System Implementation Guide - SkillLink

## Summary

A complete push notification system has been implemented for the SkillLink application, enabling real-time notifications for various events including:

- New chat messages
- Provider application approval
- Provider application rejection  
- Service approval
- Bookings and other events

## Architecture

### Backend Components
- **notification-service** (Port 3006): Node.js/Express service managing push tokens and notification delivery using Expo Push Notifications
- **chat-service**: Integrated to send notifications for new messages
- **auth-service**: Integrated to notify provider approvals and rejections

### Frontend Components (Mobile App)
- **NotificationContext**: React Context for managing notification state
- **expo-notifications**: Device-level push notification handling
- **expo-device**: Physical device verification for push notification support

### Database Schema
Two tables:
- `push_tokens`: Stores device push tokens
- `notifications`: Notification history

## Installation and Configuration

### 1. Backend - Notification Service

```bash
cd services/notification-service
npm install
```

Configure `.env`:
```env
PORT=3006
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=skilllinkdb
```

Execute SQL to create tables:
```bash
mysql -u root -p skilllinkdb < database-setup.sql
```

Start the service:
```bash
npm start
```

### 2. Chat Service

Install axios:
```bash
cd services/chat-service
npm install axios
```

Add to `.env`:
```env
NOTIFICATION_SERVICE_URL=http://localhost:3006
```

### 3. Auth Service

Add to `appsettings.json`:
```json
{
  "NotificationService": {
    "Url": "http://localhost:3006"
  }
}
```

### 4. Mobile Application

Dependencies are already installed. Configure the `projectId` in `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

To obtain the `projectId`:
```bash
cd apps/mobile-app/skilllink
npx expo login
npx expo whoami
```

If you do not have an EAS project:
```bash
npx eas init
```

## Application Usage

### Notification Context

The `NotificationContext` initializes automatically when a user logs in and:
- Requests notification permissions
- Registers the push token with the backend
- Listens for incoming notifications
- Handles navigation when the user taps a notification

### Viewing Notifications

Navigate to `/profile/notifications` to view the notification history.

### Adding Notification Badge

You can add a badge anywhere in your UI:

```tsx
import { useNotification } from '../context/NotificationContext';

const MyComponent = () => {
  const { unreadCount } = useNotification();
  
  return (
    <View>
      <Text>Notifications</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
};
```

## Notification Types

### Chat Notification
```javascript
{
  type: 'chat',
  conversationId: 123,
  senderId: 456
}
```

### Provider Approval Notification
```javascript
{
  type: 'provider_approved',
  requestId: 789
}
```

### Provider Rejection Notification
```javascript
{
  type: 'provider_rejected',
  requestId: 789
}
```

### Service Approval Notification
```javascript
{
  type: 'service_approved',
  serviceId: 101
}
```

## Sending Notifications Manually

### From any service:

```javascript
const axios = require('axios');

async function sendNotification(userId, title, body, data) {
  try {
    await axios.post('http://localhost:3006/api/notifications/send', {
      userId: userId,
      title: title,
      body: body,
      data: data
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Usage example
sendNotification(
  123, 
  'New booking',
  'You have a new booking for tomorrow',
  { type: 'booking', bookingId: 456 }
);
```

### Batch notification:

```javascript
await axios.post('http://localhost:3006/api/notifications/send-batch', {
  userIds: [1, 2, 3],
  title: 'System update',
  body: 'New version available',
  data: { type: 'system' }
});
```

## API Endpoints

### Notification Service

- `POST /api/notifications/register-token` - Register push token
- `POST /api/notifications/remove-token` - Remove push token
- `POST /api/notifications/send` - Send notification to a user
- `POST /api/notifications/send-batch` - Send to multiple users
- `GET /api/notifications/user/:userId` - Get notification history
- `GET /api/notifications/user/:userId/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read

## Testing

### Manual notification testing:

```bash
# Register a token (first obtain your token from the app)
curl -X POST http://localhost:3006/api/notifications/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "pushToken": "ExponentPushToken[xxxxxxxxxxxxxx]"
  }'

# Send test notification
curl -X POST http://localhost:3006/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test",
    "body": "This is a test notification",
    "data": {"type": "test"}
  }'
```

## Security

- Push tokens are validated using `Expo.isExpoPushToken()`
- Notifications are only sent to authenticated users
- Old tokens can be cleaned with periodic maintenance

## Monitoring

The notification service logs:
- Database connections
- Registered/removed tokens
- Notification sending errors
- Expo notification tickets

## Troubleshooting

### Notifications are not arriving:

1. Verify the service is running on port 3006
2. Check device permissions
3. Ensure you are using a physical device (does not work on simulator/emulator)
4. Verify the token was registered correctly
5. Review notification-service logs

### Error "Invalid Expo push token":

Ensure the `projectId` in `app.json` is correct and you are using the correct Expo build.

### Token is not registering:

Verify that NotificationContext is properly wrapped in `_layout.tsx` and the user is authenticated.

## Future Enhancements

The system can be extended to:
- Add more notification types (payments, reviews, etc.)
- Implement scheduled notifications
- Add notification preference filters
- Implement rich notifications with images
- Add local notifications for reminders

## References

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)
