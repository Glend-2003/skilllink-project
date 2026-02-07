import Constants from 'expo-constants';

const getServerIP = () => {
  if (process.env.EXPO_PUBLIC_SERVER_IP) {
    return process.env.EXPO_PUBLIC_SERVER_IP;
  }
  
  try {
    const hostUri = (Constants.expoConfig as any)?.hostUri || (Constants as any)?.debuggerHost;
    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost') {
        return host;
      }
    }
  } catch {}

  return '10.147.20.114'; 
};

const SERVER_IP = getServerIP();

export const Config = {
  SERVER_IP,
  AUTH_SERVICE_URL: `http://${SERVER_IP}:3000/api/v1/auth`,
  CHAT_SERVICE_URL: `http://${SERVER_IP}:3004`,
  API_GATEWAY_URL: `http://${SERVER_IP}:3000`,
  PROVIDER_SERVICE_URL: `http://${SERVER_IP}:3003`,
  SERVICE_MANAGER_URL: `http://${SERVER_IP}:3002`,
  NOTIFICATION_SERVICE_URL: `http://${SERVER_IP}:3006`,
  USER_SERVICE_URL: `http://${SERVER_IP}:3001`,
};

export const API_URL = Config.API_GATEWAY_URL;