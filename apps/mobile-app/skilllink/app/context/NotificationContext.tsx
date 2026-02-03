import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { Config } from '@/constants/Config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  type?: string;
  conversationId?: number;
  senderId?: number;
  providerId?: number;
  serviceId?: number;
  bookingId?: number;
  [key: string]: any;
}

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  unreadCount: number;
  registerForPushNotificationsAsync: () => Promise<string | undefined>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { user } = useAuth();

  // Register for push notifications
  const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitas habilitar las notificaciones para recibir mensajes importantes.'
        );
        return;
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with your actual project ID from app.json
        });
        token = tokenData.data;
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  // Register token with backend
  const registerTokenWithBackend = async (token: string, userId: number) => {
    try {
      const response = await fetch(`${Config.NOTIFICATION_SERVICE_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          pushToken: token,
        }),
      });

      if (response.ok) {
        console.log('Push token registered with backend');
      } else {
        console.error('Failed to register push token with backend');
      }
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  };

  // Refresh unread notification count
  const refreshUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${Config.NOTIFICATION_SERVICE_URL}/api/notifications/user/${user.userId}/unread-count`
      );
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
        
        // Update app badge
        await Notifications.setBadgeCountAsync(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initialize notifications when user logs in
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          registerTokenWithBackend(token, user.userId);
        }
      });

      // Fetch initial unread count
      refreshUnreadCount();
    }
  }, [user]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      setNotification(notification);
      refreshUnreadCount();
    });

    // Listener for when a user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(' Notification tapped:', response);
      
      const data = response.notification.request.content.data as NotificationData;
      
      // Handle navigation based on notification type
      if (data?.type === 'chat' && data?.conversationId) {
        // Navigate to chat conversation
        // This will be implemented in the app using the router
        console.log('Navigate to chat:', data.conversationId);
      } else if (data?.type === 'provider_approved') {
        // Navigate to provider dashboard
        console.log('Navigate to provider dashboard');
      } else if (data?.type === 'service_approved' && data?.serviceId) {
        // Navigate to service details
        console.log('Navigate to service:', data.serviceId);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const value = {
    expoPushToken,
    notification,
    unreadCount,
    registerForPushNotificationsAsync,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
