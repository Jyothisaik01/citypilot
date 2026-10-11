import { Platform } from 'react-native';

// Production Render Unified Backend (Serves both Inventory & CityPilot)
export const PRODUCTION_API_URL = 'https://inventory-backend-api-jdfa.onrender.com';

// Local PC LAN IP detected on your network (for offline local development)
export const LOCAL_DEV_IP = '192.168.1.4';
export const LOCAL_DEV_PORT = '5050';

// Default to live production Render endpoint
const USE_PRODUCTION = true;

const getBaseUrl = () => {
  if (USE_PRODUCTION) {
    return PRODUCTION_API_URL;
  }
  if (Platform.OS === 'web') {
    return `http://localhost:${LOCAL_DEV_PORT}`;
  }
  return `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
};

export const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;

