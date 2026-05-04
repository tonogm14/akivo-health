const BASE = (import.meta.env.VITE_API_URL || '') + '/admin';

function token() {
  return localStorage.getItem('dh_admin_token');
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Error'), { status: res.status, data });
  return data;
}

export const api = {
  // Auth
  login: (username, password) => req('POST', '/login', { username, password }),
  me: () => req('GET', '/me'),

  // Stats
  stats: () => req('GET', '/stats'),

  // Applications
  applications: (params = {}) => req('GET', '/applications?' + new URLSearchParams(params)),
  application: (id) => req('GET', `/applications/${id}`),
  approveApp: (id) => req('POST', `/applications/${id}/approve`),
  rejectApp: (id, reason) => req('POST', `/applications/${id}/reject`, { reason }),
  pingApp: (id) => req('POST', `/applications/${id}/ping`),
  viewersApp: (id) => req('GET', `/applications/${id}/viewers`),

  // Doctors
  doctors: () => req('GET', '/doctors'),
  doctor: (id) => req('GET', `/doctors/${id}`),
  doctorStats: (id) => req('GET', `/doctors/${id}/stats`),
  createDoctor: (data) => req('POST', '/doctors', data),
  deactivateDoctor: (id, reason) => req('POST', `/doctors/${id}/deactivate`, { reason }),

  // Consultations
  consultStats: (params = {}) => req('GET', '/consultations/stats?' + new URLSearchParams(params)),
  consults: (params = {}) => req('GET', '/consultations?' + new URLSearchParams(params)),
  consult: (id) => req('GET', `/consultations/${id}`),
  consultChat: (id) => req('GET', `/consultations/${id}/chat`),

  // Reports / Exports (triggers browser download)
  exportCsv: async (params = {}) => {
    const res = await fetch(`${BASE}/reports/export?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition') || '';
    const fnMatch = disposition.match(/filename="([^"]+)"/);
    const filename = fnMatch ? fnMatch[1] : `export_${Date.now()}.csv`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  // Patients
  patients: (params = {}) => req('GET', '/patients?' + new URLSearchParams(params)),
  patient: (id) => req('GET', `/patients/${id}`),
  patientDetail: (id) => req('GET', `/patients/${id}`),

  // Payouts
  payouts: (params = {}) => req('GET', '/payouts?' + new URLSearchParams(params)),

  // Reviews
  reviews: (params = {}) => req('GET', '/reviews?' + new URLSearchParams(params)),
  reviewAction: (id, action) => req('POST', `/reviews/${id}/${action}`),
  hideReview: (id) => req('POST', `/reviews/${id}/hide`),
  restoreReview: (id) => req('POST', `/reviews/${id}/restore`),

  // Coupons
  coupons: () => req('GET', '/coupons'),
  createCoupon: (data) => req('POST', '/coupons', data),

  // Logs
  logs: (params = {}) => req('GET', '/logs?' + new URLSearchParams(params)),

  // Team (admin users)
  team: () => req('GET', '/users'),
  createTeamMember: (data) => req('POST', '/users', data),
  toggleTeamMember: (id) => req('POST', `/users/${id}/toggle`),
  resetTeamPassword: (id, newPassword, adminPassword) => req('POST', `/users/${id}/reset-password`, { newPassword, adminPassword }),
  teamMemberLogs: (id, params = {}) => req('GET', `/users/${id}/logs?${new URLSearchParams(params)}`),

  // Live control (bidirectional mobile)
  liveStats: () => req('GET', '/live/stats'),
  activeDoctors: () => req('GET', '/live/doctors'),
  activeVisits: () => req('GET', '/live/visits'),
  pushToUser: (userId, { title, body }) => req('POST', `/live/push/user/${userId}`, { title, body }),
  pushToDoctor: (doctorId, { title, body }) => req('POST', `/live/push/doctor/${doctorId}`, { title, body }),
  pushBroadcast: ({ target, title, body }) => req('POST', '/live/push/broadcast', { target, title, body }),
  cancelVisit: (visitId, reason) => req('POST', `/live/visits/${visitId}/cancel`, { reason }),
  reassignVisit: (visitId, doctorId) => req('POST', `/live/visits/${visitId}/reassign`, { doctorId }),
  toggleDoctorAvailability: (doctorId) => req('POST', `/live/doctors/${doctorId}/toggle`),
};

// SSE stream for live updates
export function createLiveStream(onEvent) {
  const t = token();
  if (!t) return () => { };
  const url = `${BASE}/live/stream?token=${encodeURIComponent(t)}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)); } catch { }
  };
  es.onerror = () => { };
  return () => es.close();
}
