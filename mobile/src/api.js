import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { sha256, hmacSHA256 } from './crypto';

// Use the API base from environment variables (ngrok tunnel, local IP, or production)
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE || 'https://api.doctorhouse.pe';

// Loaded once at app start from AsyncStorage (set during build/config)
const API_KEY     = process.env.EXPO_PUBLIC_API_KEY     || '';
const SIGNING_SECRET = process.env.EXPO_PUBLIC_API_SIGNING_SECRET || '';

async function getToken() {
  return AsyncStorage.getItem('auth_token');
}

async function buildSignatureHeaders(method, path, body) {
  const timestamp = String(Date.now());
  const bodyStr   = body ? JSON.stringify(body) : '';
  const bodyHash  = await sha256(bodyStr);   // SHA-256 of body
  const payload   = `${timestamp}|${method}|${path}|${bodyHash}`;
  const signature = await hmacSHA256(payload, SIGNING_SECRET);
  return { 'X-API-Key': API_KEY, 'X-Timestamp': timestamp, 'X-Signature': signature };
}

async function request(method, path, body) {
  const token = await getToken();
  const sigHeaders = await buildSignatureHeaders(method, path, body);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...sigHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    // If not JSON, it might be an HTML error from the server (e.g. 500)
    if (!res.ok) throw new Error(`Server Error (${res.status})`);
    throw new Error('Invalid server response (not JSON)');
  }

  if (!res.ok) throw Object.assign(new Error(data.error || 'API error'), { status: res.status, data });
  return data;
}

// ── Auth
export const auth = {
  requestOtp: (phone) => request('POST', '/auth/otp', { phone }),
  verifyOtp:  async (phone, code) => {
    const data = await request('POST', '/auth/verify', { phone, code });
    await AsyncStorage.setItem('auth_token', data.token);
    return data;
  },
  logout: () => AsyncStorage.removeItem('auth_token'),
};

// ── Doctors
export const doctors = {
  nearby: (lat, lng, radius_km = 10) =>
    request('GET', `/doctors/nearby?lat=${lat}&lng=${lng}&radius_km=${radius_km}`),
  get: (id) => request('GET', `/doctors/${id}`),
};

// ── Visits
export const visits = {
  create: (payload)        => request('POST', '/visits', payload),
  checkout: (payload)      => request('POST', '/visits/checkout', payload),
  get:    (id)             => request('GET',  `/visits/${id}`),
  list:   ()               => request('GET',  '/visits'),
  cancel: (id, reason)     => request('DELETE', `/visits/${id}`, { cancel_reason: reason }),
  getMessages: (id)        => request('GET',  `/visits/${id}/messages`),
  sendMessage: (id, text)  => request('POST', `/visits/${id}/messages`, { text }),
  updateStatus: (id, status) => request('PATCH', `/visits/${id}/status`, { status }),
};

// ── Payments
export const payments = {
  register: (visitId, method, opCode) => request('POST',  `/payments/${visitId}`, { method, operation_code: opCode }),
  confirm:  (visitId)         => request('POST',  `/payments/${visitId}/confirm`),
  addTip:   (visitId, tip)    => request('PATCH', `/payments/${visitId}/tip`, { tip }),
};

// ── Coupons
export const coupons = {
  validate: (code) => request('GET', `/coupons/validate/${code}`),
};

// ── Reviews
export const reviews = {
  submit: (visitId, rating, tags, tip) =>
    request('POST', `/reviews/${visitId}`, { rating, tags, tip }),
};

// ── Users
export const users = {
  me:      ()       => request('GET',   '/users/me'),
  update:  (data)   => request('PATCH', '/users/me', data),
  visits:  ()       => request('GET',   '/users/me/visits'),
  history: (userId) => request('GET',   `/users/${userId}/history`),
};
