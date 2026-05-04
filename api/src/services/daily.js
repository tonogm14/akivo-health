const DAILY_BASE = 'https://api.daily.co/v1';

function apiKey() {
  const k = process.env.DAILY_API_KEY;
  if (!k) throw new Error('DAILY_API_KEY not set in environment');
  return k;
}

async function createRoom(visitId) {
  // Room name: dh- + first 20 hex chars of UUID (no dashes, URL-safe)
  const name = `dh-${visitId.replace(/-/g, '').slice(0, 20)}`;

  const res = await fetch(`${DAILY_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      name,
      privacy: 'private',
      properties: {
        exp: Math.floor(Date.now() / 1000) + 7200, // 2 h from now
        max_participants: 3,
        enable_chat: false,
        enable_screenshare: false,
        enable_knocking: false,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daily.co createRoom failed (${res.status}): ${body}`);
  }

  return res.json(); // { id, name, url, privacy, config, created_at }
}

async function createMeetingToken(roomName, isOwner = false) {
  const res = await fetch(`${DAILY_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        exp: Math.floor(Date.now() / 1000) + 7200,
        enable_screenshare: false,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daily.co createMeetingToken failed (${res.status}): ${body}`);
  }

  const { token } = await res.json();
  return token;
}

async function deleteRoom(roomName) {
  const res = await fetch(`${DAILY_BASE}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  return res.ok;
}

module.exports = { createRoom, createMeetingToken, deleteRoom };
