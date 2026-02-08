// Get server IP from environment or use localhost
const getServerIP = () => {
  if (import.meta.env.VITE_SERVER_IP) {
    return import.meta.env.VITE_SERVER_IP;
  }
  return 'localhost'; // Default to localhost for development
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

// Legacy export for backwards compatibility
export const API_BASE_URL = Config.API_GATEWAY_URL; 
