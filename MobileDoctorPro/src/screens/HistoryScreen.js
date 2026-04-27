import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import TabBar from '../components/TabBar';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { useApp } from '../AppContext';
import { API_BASE, DEV_DOCTOR_ID } from '../config';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FILTERS = [
  { id: 'all',   label: 'Todas' },
  { id: 'week',  label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
];

// event_type → { label, color }
const EVENT_META = {
  visit_requested:      { label: 'Solicitud enviada',     color: C.inkMuted },
  doctor_assigned:      { label: 'Doctor asignado',       color: C.blue     },
  doctor_accepted:      { label: 'Doctor en camino',      color: C.blue     },
  doctor_arrived:       { label: 'Doctor llegó',          color: C.blue     },
  consultation_started: { label: 'Consulta iniciada',     color: C.blue     },
  visit_completed:      { label: 'Visita completada',     color: C.green    },
  visit_cancelled:      { label: 'Visita cancelada',      color: C.red      },
  doctor_rejected:      { label: 'Sin doctor disponible', color: C.red      },
  payment_confirmed:    { label: 'Pago confirmado',       color: C.green    },
  tip_added:            { label: 'Propina enviada',       color: C.green    },
  review_submitted:     { label: 'Reseña enviada',        color: C.green    },
};

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Icons.Star key={i} size={13} fill={i <= rating ? C.amber : 'transparent'} color={C.amber} />
      ))}
    </View>
  );
}

function formatVisitDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  const time = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Hoy · ${time}`;
  if (diffDays === 1) return `Ayer · ${time}`;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) + ` · ${time}`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const hh = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() < 12 ? 'am' : 'pm';
  return `${hh}:${mm} ${ampm}`;
}

function filterVisits(visits, filter) {
  if (filter === 'all') return visits;
  const now = new Date();
  if (filter === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return visits.filter(v => new Date(v.created_at) >= weekStart);
  }
  if (filter === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return visits.filter(v => new Date(v.created_at) >= monthStart);
  }
  return visits;
}

// ── Timeline component for doctor history
function VisitTimeline({ events, loading }) {
  if (loading) {
    return (
      <View style={tl.loadRow}>
        <ActivityIndicator size="small" color={C.blue} />
        <Text style={tl.loadText}>Cargando eventos...</Text>
      </View>
    );
  }
  if (!events || events.length === 0) {
    return (
      <View style={tl.empty}>
        <Text style={tl.emptyText}>Sin eventos registrados</Text>
      </View>
    );
  }

  return (
    <View style={tl.container}>
      {events.map((ev, idx) => {
        const meta = EVENT_META[ev.event_type] ?? {
          label: ev.event_type,
          color: C.inkMuted,
        };
        const isLast = idx === events.length - 1;
        let extraLabel = '';
        if (ev.event_type === 'doctor_accepted' && ev.metadata?.eta_minutes) {
          extraLabel = ` · ${ev.metadata.eta_minutes} min`;
        }

        return (
          <View key={idx} style={tl.row}>
            {/* Dot + vertical line */}
            <View style={tl.lineCol}>
              <View style={[tl.dot, { backgroundColor: meta.color }]} />
              {!isLast && <View style={tl.line} />}
            </View>
            {/* Text content */}
            <View style={[tl.content, isLast && { paddingBottom: 2 }]}>
              <Text style={[tl.label, { color: meta.color }]}>
                {meta.label}{extraLabel}
              </Text>
              <Text style={tl.time}>{formatTime(ev.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Single visit card with accordion timeline
function VisitCard({ v, token, timelineCache, onCacheUpdate }) {
  const [expanded, setExpanded]   = useState(false);
  const [fetching, setFetching]   = useState(false);

  const cachedEvents = timelineCache[v.id];

  const toggle = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (!expanded && cachedEvents === undefined) {
      // First expand: fetch timeline lazily
      setExpanded(true);
      setFetching(true);
      try {
        const res = await fetch(`${API_BASE}/visits/${v.id}/timeline`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const events = Array.isArray(data)
          ? data
          : (data.events || data.timeline || []);
        onCacheUpdate(v.id, events);
      } catch (_) {
        onCacheUpdate(v.id, []);
      } finally {
        setFetching(false);
      }
    } else {
      setExpanded(prev => !prev);
    }
  };

  return (
    <View style={hs.card}>
      {/* Original card content — preserved */}
      <TouchableOpacity
        style={hs.cardTouchable}
        onPress={toggle}
        activeOpacity={0.85}
      >
        <View style={hs.cardTop}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={hs.dateText}>{formatVisitDate(v.created_at).toUpperCase()}</Text>
            <Text style={hs.patientName}>
              {v.patient_name || 'Paciente'}{v.patient_age ? ` · ${v.patient_age}` : ''}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {v.rating ? <StarRow rating={v.rating} /> : null}
            <Icons.ChevD
              size={16}
              color={C.inkMuted}
              style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </View>
        </View>
        <Text style={hs.diagnosis}>{v.address || '—'}</Text>
        <View style={hs.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icons.Map size={12} color={C.inkSoft} />
            <Text style={hs.district}>
              {v.address ? v.address.split(',').pop().trim() : '—'}
            </Text>
          </View>
          <Text style={hs.net}>+ S/ {parseFloat(v.net || 0).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      {/* Expandable timeline */}
      {expanded && (
        <View style={hs.timelineWrap}>
          <View style={hs.timelineDivider} />
          <VisitTimeline
            events={cachedEvents}
            loading={fetching}
          />
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const { state } = useApp();
  const [filter, setFilter]         = useState('all');
  const [visits, setVisits]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [timelineCache, setTimeline] = useState({});   // { [visitId]: events[] }

  useEffect(() => {
    const id = state.doctor?.id || DEV_DOCTOR_ID;
    fetch(`${API_BASE}/doctors/${id}/visits`, {
      headers: {
        'Content-Type': 'application/json',
        ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
      },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setVisits(Array.isArray(data) ? data : []))
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCacheUpdate = (visitId, events) => {
    setTimeline(prev => ({ ...prev, [visitId]: events }));
  };

  const filtered    = filterVisits(visits, filter);
  const totalVisits = visits.length;
  const avgRating   = visits.length
    ? (visits.filter(v => v.rating).reduce((s, v) => s + v.rating, 0) /
       Math.max(1, visits.filter(v => v.rating).length)).toFixed(1)
    : '—';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header — unchanged */}
      <View style={hs.topSection}>
        <Text style={hs.title}>Historial</Text>
        <Text style={hs.sub}>{totalVisits} visitas totales · {avgRating} ★</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
          contentContainerStyle={{ gap: 6 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[hs.filterBtn, filter === f.id && hs.filterActive]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[hs.filterTxt, filter === f.id && hs.filterTxtActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.blue} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Icons.Doc size={40} color={C.inkMuted} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.inkSoft, marginTop: 14 }}>
            Sin visitas aún
          </Text>
          <Text style={{ fontSize: 13, color: C.inkMuted, marginTop: 4, textAlign: 'center' }}>
            Tus visitas completadas aparecerán aquí.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
          {filtered.map(v => (
            <VisitCard
              key={v.id}
              v={v}
              token={state.authToken}
              timelineCache={timelineCache}
              onCacheUpdate={handleCacheUpdate}
            />
          ))}
        </ScrollView>
      )}

      <TabBar current="History" navigation={navigation} />
    </View>
  );
}

// ── Timeline styles
const tl = StyleSheet.create({
  container: { paddingTop: 4, paddingBottom: 4 },
  row:       { flexDirection: 'row', minHeight: 32 },
  lineCol:   { width: 20, alignItems: 'center' },
  dot: {
    width: 9, height: 9, borderRadius: 5,
    marginTop: 4, zIndex: 1,
  },
  line: {
    flex: 1, width: 2,
    backgroundColor: C.line,
    marginTop: 2,
  },
  content: {
    flex: 1, paddingBottom: 12, paddingLeft: 8,
  },
  label:     { fontSize: 12.5, fontWeight: '600', lineHeight: 17 },
  time:      { fontSize: 11, color: C.inkMuted, marginTop: 1 },
  loadRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadText:  { fontSize: 12, color: C.inkSoft },
  empty:     { paddingVertical: 6 },
  emptyText: { fontSize: 12, color: C.inkMuted, fontStyle: 'italic' },
});

// ── History screen styles (extended from original)
const hs = StyleSheet.create({
  topSection: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line,
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14,
  },
  title:          { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  sub:            { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  filterBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff' },
  filterActive:   { backgroundColor: C.blue, borderColor: C.blue },
  filterTxt:      { fontSize: 12, fontWeight: '700', color: C.ink },
  filterTxtActive:{ color: '#fff' },

  card:           { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, marginBottom: 10, overflow: 'hidden' },
  cardTouchable:  { padding: 14 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  dateText:       { fontSize: 10.5, color: C.inkMuted, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  patientName:    { fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: -0.3, marginTop: 2 },
  diagnosis:      { fontSize: 12.5, color: C.inkSoft, marginBottom: 10 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  district:       { fontSize: 11, color: C.inkSoft },
  net:            { fontSize: 13, fontWeight: '800', color: C.green },

  timelineWrap:    { paddingHorizontal: 14, paddingBottom: 10 },
  timelineDivider: { height: 1, backgroundColor: C.line, marginBottom: 12 },
});
