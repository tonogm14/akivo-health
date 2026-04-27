/**
 * Niubiz (VisaNet Peru) payment gateway integration.
 * Docs: https://developer.niubiz.com.pe
 *
 * Flow:
 *  1. API obtains OAuth access token (valid ~15 min)
 *  2. API creates a session token → sends to mobile
 *  3. Mobile embeds Niubiz.js/SDK with session token to collect card
 *  4. Mobile sends transaction token to API
 *  5. API calls POST /transactions/authorization to capture
 */

const BASE_URL    = process.env.NIUBIZ_BASE_URL    || 'https://apistg.niubiz.com.pe';
const MERCHANT_ID = process.env.NIUBIZ_MERCHANT_ID || '';
const USERNAME    = process.env.NIUBIZ_USERNAME    || '';
const PASSWORD    = process.env.NIUBIZ_PASSWORD    || '';

let _accessToken    = null;
let _tokenExpiresAt = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiresAt - 30_000) return _accessToken;

  const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const res = await fetch(`${BASE_URL}/api.security/v1/security`, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) throw new Error(`Niubiz auth failed: ${res.status}`);
  const token = await res.text();   // returns plain text token
  _accessToken    = token.trim();
  _tokenExpiresAt = Date.now() + 15 * 60_000;
  return _accessToken;
}

/**
 * Create a payment session.
 * The session token is sent to the mobile client to render the Niubiz checkout widget.
 *
 * @param {object} opts
 * @param {number} opts.amount   - Decimal amount (e.g. 100.00)
 * @param {string} opts.orderId  - Unique transaction reference
 * @param {string} opts.email    - Customer email
 * @param {string} opts.currency - Default 'PEN'
 * @returns {string} sessionToken to pass to mobile SDK
 */
async function createSession({ amount, orderId, email, currency = 'PEN' }) {
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE_URL}/api.ecommerce/v2/ecommerce/token/session/${MERCHANT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization:  token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'web',
        amount,
        currency,
        antifraud: {
          clientIp:        '0.0.0.0',   // set to real IP in production
          merchantDefineData: { field3: email, field21: orderId },
        },
        recurrenceMaxAmount: amount,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err?.errorMessage || 'Niubiz session error'), { status: res.status });
  }

  const data = await res.json();
  return data.sessionKey;
}

/**
 * Authorize (capture) a transaction after mobile completes the payment form.
 *
 * @param {object} opts
 * @param {string} opts.transactionToken - Token returned by Niubiz mobile SDK after card entry
 * @param {number} opts.amount
 * @param {string} opts.orderId
 * @param {string} opts.currency
 */
async function authorizeTransaction({ transactionToken, amount, orderId, currency = 'PEN' }) {
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE_URL}/api.authorization/v3/authorization/ecommerce/${MERCHANT_ID}`,
    {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel:          'web',
        captureType:      'manual',
        countable:        true,
        order: {
          tokenId:    transactionToken,
          purchaseNumber: orderId,
          amount,
          currency,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err?.errorMessage || 'Niubiz authorization error'), { status: res.status });
  }

  return res.json();
}

module.exports = { createSession, authorizeTransaction };
