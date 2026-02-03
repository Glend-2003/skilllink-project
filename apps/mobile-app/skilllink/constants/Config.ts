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


  return '192.168.100.177'; 
};

const SERVER_IP = getServerIP();

export const Config = {
  SERVER_IP,
  AUTH_SERVICE_URL: `http://${SERVER_IP}:5293/api/auth`,
  CHAT_SERVICE_URL: `http://${SERVER_IP}:3003`,
  API_GATEWAY_URL: `http://${SERVER_IP}:3000`,
  PROVIDER_SERVICE_URL: `http://${SERVER_IP}:3004`,
  SERVICE_MANAGER_URL: `http://${SERVER_IP}:3005`,
  NOTIFICATION_SERVICE_URL: `http://${SERVER_IP}:3006`,
};

export const API_URL = Config.API_GATEWAY_URL;