// React Native doesn't have Node's crypto module.
// expo-crypto provides SHA-256 and HMAC-SHA256 via native bridge.
import * as Crypto from 'expo-crypto';

/**
 * Returns hex-encoded HMAC-SHA256(message, key).
 * Falls back to a plain SHA-256 digest when key is empty (dev without secrets).
 */
export async function hmacSHA256(message, key) {
  if (!key) {
    // No secret configured — just hash the message (dev fallback only)
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return digest;
  }

  // expo-crypto ≥ 14 exposes subtle WebCrypto API under Crypto.subtle
  const enc      = new TextEncoder();
  const keyData  = enc.encode(key);
  const msgData  = enc.encode(message);

  const cryptoKey = await Crypto.subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const sig = await Crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
