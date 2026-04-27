/**
 * Notificaciones — Firebase FCM directo, sin cuenta Expo.
 *
 * getDevicePushTokenAsync() devuelve el token FCM nativo del dispositivo.
 * El backend usa firebase-admin para enviar directamente a FCM sin intermediarios.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Mostrar notificaciones aunque la app esté en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

/**
 * Solicita permisos y devuelve el token FCM nativo del dispositivo.
 * Devuelve null en simulador o si el usuario deniega el permiso.
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('[FCM] Simulador — push tokens solo en dispositivo físico');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[FCM] Permiso de notificaciones denegado');
    return null;
  }

  // Canal de notificaciones para Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('doctor-updates', {
      name:             'Actualizaciones del doctor',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#2563EB',
      sound:            'default',
    });
  }

  try {
    // Token FCM nativo — no requiere cuenta Expo ni EAS
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('[FCM] Token registrado (tipo:', tokenData.type, '):', tokenData.data?.slice(0, 30), '...');
    return tokenData.data;  // string FCM token
  } catch (err) {
    console.log('[FCM] No se pudo obtener token:', err.message);
    return null;
  }
}

/**
 * Programa una notificación LOCAL para cuando el doctor esté a ~5 minutos.
 * Funciona sin Firebase — es una notificación del sistema operativo.
 * @param {number} etaMinutes  ETA actual en minutos
 */
export async function scheduleArrivingNotification(etaMinutes) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!etaMinutes || etaMinutes <= 5) return;

  const seconds = (etaMinutes - 5) * 60;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏠 Tu doctor está llegando',
      body:  'El médico llegará en aproximadamente 5 minutos. ¡Prepárate!',
      data:  { type: 'doctor_arriving' },
      sound: true,
    },
    trigger: {
      seconds,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
  console.log(`[FCM] Notificación local programada en ${Math.round(seconds / 60)} min`);
}

export async function cancelScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
