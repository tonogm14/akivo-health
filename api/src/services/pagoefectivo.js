/**
 * PagoEfectivo integration — generates a CIP (Código de Pago PagoEfectivo)
 * that customers pay at authorized locations: pharmacies, banks, agents.
 * Docs: https://developer.pagoefectivo.pe
 *
 * Flow:
 *  1. API requests a CIP with amount + expiry
 *  2. PagoEfectivo returns a numeric code + payment URL
 *  3. Customer pays using the code at any authorized point of sale
 *  4. PagoEfectivo posts a webhook to /payments/webhook/pagoefectivo on confirmation
 */

const BASE_URL      = process.env.PAGOEFECTIVO_BASE_URL      || 'https://api-stg.pagoefectivo.pe';
const CLIENT_ID     = process.env.PAGOEFECTIVO_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.PAGOEFECTIVO_CLIENT_SECRET || '';
const SERVICE_ID    = process.env.PAGOEFECTIVO_SERVICE_ID    || '';

let _accessToken    = null;
let _tokenExpiresAt = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiresAt - 30_000) return _accessToken;

  const res = await fetch(`${BASE_URL}/v1/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });

  if (!res.ok) throw new Error(`PagoEfectivo auth failed: ${res.status}`);
  const data = await res.json();
  _accessToken    = data.token;
  _tokenExpiresAt = Date.now() + (data.expiresIn || 3600) * 1000;
  return _accessToken;
}

/**
 * Create a CIP (payment code) for cash payment.
 *
 * @param {object} opts
 * @param {number}  opts.amount          - Decimal amount (e.g. 100.00)
 * @param {string}  opts.currency        - 'PEN' or 'USD'
 * @param {string}  opts.orderId         - Your internal order reference
 * @param {string}  opts.email           - Customer email (receives payment instructions)
 * @param {string}  opts.phone           - Customer phone (optional)
 * @param {string}  opts.description     - Payment description shown to customer
 * @param {number}  opts.expiryHours     - Hours until CIP expires (default 72)
 * @returns {{ cipCode, cipUrl, transactionCode, expirationDate }}
 */
async function createCIP({
  amount, currency = 'PEN', orderId, email, phone = '', description, expiryHours = 72,
}) {
  const token = await getAccessToken();

  const expirationDate = new Date(Date.now() + expiryHours * 3_600_000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);   // format: "YYYY-MM-DD HH:mm:ss"

  const res = await fetch(`${BASE_URL}/v1/cips`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      serviceId:      Number(SERVICE_ID),
      amount,
      currency,
      transactionCode: orderId,
      expirationDate,
      concept:        description,
      additionalData: description,
      idPayment:      orderId,
      userEmail:      email,
      userName:       email.split('@')[0],
      userPhone:      phone,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err?.message || 'PagoEfectivo CIP error'), { status: res.status });
  }

  const data = await res.json();
  return {
    cipCode:         data.cip,
    cipUrl:          data.cipUrl,
    transactionCode: data.transactionCode,
    expirationDate:  data.expirationDate,
  };
}

/**
 * Verify a PagoEfectivo webhook notification.
 * PagoEfectivo signs the payload with HMAC-SHA256 using CLIENT_SECRET.
 * Header: Authorization
 */
function verifyWebhook(rawBody, authHeader) {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(rawBody)
    .digest('base64');
  // Use timing-safe comparison
  try {
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && require('crypto').timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

module.exports = { createCIP, verifyWebhook };
