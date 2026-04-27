/**
 * Firebase Cloud Messaging — usando firebase-admin SDK (HTTP v1 API).
 * Credenciales desde variables de entorno (no archivo JSON en disco).
 *
 * Variables requeridas en .env:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (la clave con \n reales, copiar tal cual del JSON de la cuenta de servicio)
 */

const { getFirebase } = require('./firebase');

function getMessaging() {
  const admin = getFirebase();
  return admin ? admin.messaging() : null;
}

/**
 * Envía una push notification via FCM.
 * @param {string} fcmToken  Token FCM del dispositivo (Android o iOS)
 */
async function sendPushNotification(fcmToken, { title, body, data = {} }) {
  if (!fcmToken) return null;

  const messaging = getMessaging();
  if (!messaging) return null;

  // FCM data values must all be strings
  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  try {
    const messageId = await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data: stringData,
      android: {
        priority: 'high',
        notification: {
          channelId: 'doctor-updates',
          sound: 'default',
          priority: 'max',
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    });
    console.log('[FCM] Enviado →', messageId);
    return messageId;
  } catch (err) {
    console.error('[FCM] Error al enviar:', err.code, err.message);
    return null;
  }
}

module.exports = { sendPushNotification };
