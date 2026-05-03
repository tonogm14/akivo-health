import * as Crypto from 'expo-crypto';

// Get subtle crypto from wherever it's hiding (Expo or Global)
const subtle = Crypto.subtle || (typeof crypto !== 'undefined' && crypto.subtle);

/**
 * Returns plain hex-encoded SHA-256(message).
 */
export async function sha256(message) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message || '',
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

/**
 * Returns hex-encoded HMAC-SHA256(message, key).
 */
export async function hmacSHA256(message, key) {
  if (!key || !subtle) {
    // If no key or no subtle support, fallback to plain SHA-256 (dev/unsupported env)
    return await sha256(message);
  }

  const enc      = new TextEncoder();
  const keyData  = enc.encode(key);
  const msgData  = enc.encode(message);

  const cryptoKey = await subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const sig = await subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
