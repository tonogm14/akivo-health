/**
 * Culqi payment gateway integration.
 * Docs: https://docs.culqi.com
 *
 * Flow: mobile tokenizes card via Culqi.js / Culqi iOS/Android SDK → sends token_id to API
 *       API calls POST /charges with that token_id (server-side, using secret key)
 */

const BASE_URL = process.env.CULQI_BASE_URL || 'https://api-sandbox.culqi.com/v2';
const SECRET_KEY = process.env.CULQI_SECRET_KEY || '';

async function culqiRequest(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${SECRET_KEY}`,
      'Content-Type':  'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.user_message || data?.merchant_message || 'Culqi error';
    const err = new Error(msg);
    err.culqiCode = data?.code;
    err.status    = res.status;
    throw err;
  }
  return data;
}

/**
 * Create a charge using a Culqi token (generated client-side by Culqi SDK).
 *
 * @param {object} opts
 * @param {string} opts.tokenId   - Culqi token from client SDK (tkn_*)
 * @param {number} opts.amount    - Amount in centavos (e.g. 10000 = S/ 100.00)
 * @param {string} opts.email     - Customer email
 * @param {string} opts.orderId   - Internal visit/order ID (stored as metadata)
 * @param {string} opts.currency  - Default 'PEN'
 * @returns {object} Culqi charge object
 */
async function createCharge({ tokenId, amount, email, orderId, currency = 'PEN' }) {
  return culqiRequest('POST', '/charges', {
    amount,
    currency_code: currency,
    email,
    source_id: tokenId,
    metadata: { order_id: orderId },
  });
}

/**
 * Retrieve a charge by its Culqi charge ID.
 */
async function getCharge(chargeId) {
  return culqiRequest('GET', `/charges/${chargeId}`);
}

/**
 * Refund a charge (e.g. cancelled visit before doctor departs).
 */
async function refundCharge(chargeId, reason = 'visit_cancelled') {
  return culqiRequest('POST', '/refunds', {
    amount: null,   // null = full refund
    reason,
    charge_id: chargeId,
  });
}

/**
 * Verify a Culqi webhook signature.
 * Culqi signs POST body with HMAC-SHA256 using the merchant's code3 secret.
 * Header: X-Culqi-Hmac
 */
function verifyWebhook(rawBody, signature, webhookSecret) {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
}

module.exports = { createCharge, getCharge, refundCharge, verifyWebhook };
