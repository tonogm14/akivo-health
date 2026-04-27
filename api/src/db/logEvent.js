const pool = require('../db');

async function logEvent(visitId, eventType, actorType, actorId, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO visit_events (visit_id, event_type, actor_type, actor_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [visitId, eventType, actorType, actorId || null, metadata]
    );
  } catch (err) {
    // Never throw — logging must not break the main flow
    console.error('[logEvent] failed:', err.message);
  }
}

module.exports = logEvent;
