import { Platform } from 'react-native';

const DEV_HOST = '192.168.18.21';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (__DEV__
    ? Platform.OS === 'android'
      ? `http://10.0.2.2:3000`
      : `http://${DEV_HOST}:3000`
    : 'https://api.doctorhouse.pe');

// Dev doctor UUID — matches seeded "Sofía Quispe" in DB
export const DEV_DOCTOR_ID = '608ba0ed-10f6-4370-ab78-104b0bce02bb';
