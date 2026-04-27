const DEV_HOST = '192.168.18.21';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (__DEV__ ? `http://${DEV_HOST}:3000` : 'https://api.doctorhouse.pe');
