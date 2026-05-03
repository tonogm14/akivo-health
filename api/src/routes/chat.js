const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');
const { sendPushNotification } = require('../services/notifications');

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
}

// GET /visits/:visitId/messages — Get chat history
router.get('/:visitId/messages',
    auth,
    param('visitId').isUUID(),
    validate,
    async (req, res, next) => {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM chat_messages 
                 WHERE visit_id = $1 
                 ORDER BY created_at ASC`,
                [req.params.visitId]
            );
            res.json(rows);
        } catch (err) { next(err); }
    }
);

// POST /visits/:visitId/messages — Send a message
router.post('/:visitId/messages',
    auth,
    param('visitId').isUUID(),
    body('text').notEmpty().trim(),
    validate,
    async (req, res, next) => {
        try {
            const { visitId } = req.params;
            const { text } = req.body;
            const userId = req.user.sub;

            // 1. Check if visit is active and get tokens
            const { rows: visits } = await pool.query(
                `SELECT v.id, v.status, v.user_id, v.doctor_id, v.push_token AS patient_token, d.push_token AS doctor_token, d.name AS doctor_name, u.name AS patient_name
                 FROM visits v 
                 LEFT JOIN doctors d ON d.id = v.doctor_id
                 LEFT JOIN users u ON u.id = v.user_id
                 WHERE v.id = $1`,
                [visitId]
            );

            if (!visits.length) return res.status(404).json({ error: 'Visita no encontrada' });
            const visit = visits[0];

            // 2. Validate status
            if (['completed', 'cancelled'].includes(visit.status)) {
                return res.status(403).json({ error: 'El chat está cerrado para esta visita' });
            }

            // 3. Determine sender/recipient
            let senderType = 'patient';
            let senderId = userId;
            let recipientToken = visit.doctor_token;
            let senderName = visit.patient_name || 'Paciente';

            if (visit.doctor_id === userId) {
                senderType = 'doctor';
                senderId = visit.doctor_id;
                recipientToken = visit.patient_token;
                senderName = `Dr. ${visit.doctor_name}`;
            } else if (visit.user_id !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para chatear en esta visita' });
            }

            // 4. Insert message
            const { rows: [msg] } = await pool.query(
                `INSERT INTO chat_messages (visit_id, sender_type, sender_id, text)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [visitId, senderType, senderId, text]
            );

            // 5. Send push notification to recipient
            if (recipientToken) {
                sendPushNotification(recipientToken, {
                    title: senderName,
                    body: text.length > 100 ? text.substring(0, 97) + '...' : text,
                    data: {
                        type: 'chat_message',
                        visit_id: visitId,
                        sender_type: senderType
                    }
                }).catch(err => console.error('Push error', err));
            }

            res.status(201).json(msg);
        } catch (err) { next(err); }
    }
);

module.exports = router;
