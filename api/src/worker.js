const pool = require('./db');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

function broadcast(event) {
  try {
    const adminRouter = require('./routes/admin');
    if (adminRouter.broadcastEvent) adminRouter.broadcastEvent(event);
  } catch {}
}

async function runMatchingWorker() {
  console.log('[Worker] Checking for unmatched visits...');
  try {
    // 1. Find unmatched visits (waiting for a doctor)
    // We only want 'now' visits OR 'scheduled' visits that are starting in the next 45 minutes
    const { rows: unmatchVisits } = await pool.query(
      `SELECT * FROM visits 
       WHERE status = 'unmatch' 
         AND (urgency != 'schedule' OR scheduled_at <= NOW() + INTERVAL '45 minutes')
       ORDER BY created_at ASC`
    );

    if (unmatchVisits.length === 0) {
      console.log('[Worker] No unmatched visits found.');
      return;
    }

    for (const visit of unmatchVisits) {
      console.log(`[Worker] Attempting auto-match for visit ${visit.id}...`);
      
      const { latitude, longitude, specialty_requested, push_token: patientPushToken } = visit;
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      if (isNaN(userLat) || isNaN(userLng)) {
        console.log(`[Worker] Skip visit ${visit.id} due to missing coordinates.`);
        continue;
      }

      // 2. Find the nearest available doctor
      // A doctor is available if is_available = true AND they have no active visits
      const { rows: docs } = await pool.query(
        `SELECT id, name, push_token,
           (6371 * acos(LEAST(GREATEST(
             cos(radians($1)) * cos(radians(latitude)) *
             cos(radians(longitude) - radians($2)) +
             sin(radians($1)) * sin(radians(latitude))
           , -1), 1))) AS dist_km
         FROM doctors
         WHERE is_available = TRUE 
           AND latitude IS NOT NULL
           AND specialty = COALESCE($3, specialty)
           AND id NOT IN (
             SELECT doctor_id FROM visits 
             WHERE doctor_id IS NOT NULL 
               AND status IN ('matched', 'on_way', 'arrived', 'in_consultation')
           )
         ORDER BY dist_km ASC
         LIMIT 1`,
        [userLat, userLng, specialty_requested]
      );

      if (docs.length > 0) {
        const doc = docs[0];
        console.log(`[Worker] MATCH FOUND! Doctor ${doc.name} (${doc.id}) for visit ${visit.id}.`);
        
        // 3. Assign doctor and update status
        await pool.query(
          "UPDATE visits SET doctor_id = $1, status = 'matched', matched_at = NOW() WHERE id = $2",
          [doc.id, visit.id]
        );
        broadcast({ type: 'visit_matched', visitId: visit.id, doctorId: doc.id, doctorName: doc.name, ts: Date.now(), message: `Visita ${visit.id} asignada al Dr. ${doc.name}` });

        // 4. Notify Patient
        if (patientPushToken && Expo.isExpoPushToken(patientPushToken)) {
          console.log(`[Worker] Sending push to patient for visit ${visit.id}...`);
          try {
            await expo.sendPushNotificationsAsync([{
              to: patientPushToken,
              sound: 'default',
              title: '¡Doctor encontrado!',
              body: `El Dr. ${doc.name} ha aceptado tu solicitud y va en camino.`,
              data: { visitId: visit.id, status: 'matched' },
            }]);
          } catch (e) { console.error('[Worker] Patient push error:', e); }
        }

        // 5. Notify Doctor
        if (doc.push_token && Expo.isExpoPushToken(doc.push_token)) {
          console.log(`[Worker] Sending push to doctor ${doc.name}...`);
          try {
            await expo.sendPushNotificationsAsync([{
              to: doc.push_token,
              sound: 'default',
              title: 'Nueva visita asignada',
              body: 'Se te ha asignado una nueva visita de urgencia.',
              data: { visitId: visit.id, type: 'new_assignment' },
            }]);
          } catch (e) { console.error('[Worker] Doctor push error:', e); }
        }
      } else {
        console.log(`[Worker] No available doctors within range for visit ${visit.id}. Still searching...`);
      }
    }
  } catch (err) {
    console.error('[Worker] Matching worker failed:', err);
  }
}

function startWorker() {
  console.log('[Worker] Auto-Matching Worker started (Interval: 60s)');
  // Check every minute
  setInterval(runMatchingWorker, 60000);
  // Also run once immediately on boot
  runMatchingWorker();
}

module.exports = { startWorker };
