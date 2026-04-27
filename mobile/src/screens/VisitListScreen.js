import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../theme';
import { TopBar, Avatar } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_META = {
  pending:   { label: 'Pendiente',       color: C.amber,    bg: C.amberSoft },
  matched:   { label: 'Asignado',        color: C.blue,     bg: C.blueSoft  },
  on_way:    { label: 'En camino',       color: C.blue,     bg: C.blueSoft  },
  arrived:   { label: 'Llegó',          color: C.green,    bg: C.greenSoft },
  completed: { label: 'Completada',      color: C.green,    bg: C.greenSoft },
  cancelled: { label: 'Cancelada',       color: C.red,      bg: C.redSoft   },
};

const SERVICE_LABELS = {
  doctor_visit:  'Visita médica',
  injectable:    'Inyectable',
  telemedicine:  'Telemedicina',
};

const EVENT_META = {
  visit_requested:     { label: 'Solicitud enviada',      icon: 'send',          color: C.inkMuted },
  doctor_assigned:     { label: 'Doctor asignado',        icon: 'user-check',    color: C.blue     },
  doctor_accepted:     { label: 'Doctor en camino',       icon: 'navigation',    color: C.blue     },
  doctor_arrived:      { label: 'Doctor llegó',           icon: 'map-pin',       color: C.blue     },
  consultation_started:{ label: 'Consulta iniciada',      icon: 'activity',      color: C.blue     },
  visit_completed:     { label: 'Visita completada',      icon: 'check-circle',  color: C.green    },
  visit_cancelled:     { label: 'Visita cancelada',       icon: 'x-circle',      color: C.red      },
  doctor_rejected:     { label: 'Sin doctor disponible',  icon: 'user-x',        color: C.red      },
  payment_confirmed:   { label: 'Pago confirmado',        icon: 'credit-card',   color: C.green    },
  tip_added:           { label: 'Propina enviada',        icon: 'gift',          color: C.green    },
  review_submitted:    { label: 'Reseña enviada',         icon: 'star',          color: C.green    },
};

function formatDatetime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() < 12 ? 'am' : 'pm';
  const hour12 = d.getHours() % 12 || 12;
  return `${d.getDate()} ${months[d.getMonth()]} · ${hour12}:${mm} ${ampm}`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const hh = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() < 12 ? 'am' : 'pm';
  return `${hh}:${mm} ${ampm}`;
}

function EventTimeline({ events }) {
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
          icon: 'circle',
          color: C.inkMuted,
        };
        const isLast = idx === events.length - 1;
        let extraLabel = '';
        if (ev.event_type === 'doctor_accepted' && ev.metadata?.eta_minutes) {
          extraLabel = ` · ${ev.metadata.eta_minutes} min`;
        }

        return (
          <View key={idx} style={tl.row}>
            {/* Left column: dot + line */}
            <View style={tl.lineCol}>
              <View style={[tl.dot, { backgroundColor: meta.color }]} />
              {!isLast && <View style={tl.line} />}
            </View>
            {/* Content */}
            <View style={[tl.content, isLast && { paddingBottom: 2 }]}>
              <View style={tl.iconWrap}>
                <Feather name={meta.icon} size={13} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[tl.label, { color: meta.color }]}>
                  {meta.label}{extraLabel}
                </Text>
                <Text style={tl.time}>{formatTime(ev.created_at)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function VisitCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const si = STATUS_META[item.status] ?? { label: item.status, color: C.inkMuted, bg: C.bg };
  const doctorLabel = item.doctor_name || 'Sin asignar';
  const specialty   = item.specialty   || 'Medicina General';
  const hasEvents   = Array.isArray(item.events) && item.events.length > 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  return (
    <View style={vs.card}>
      <TouchableOpacity
        style={vs.cardHeader}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Avatar name={doctorLabel} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={vs.drName} numberOfLines={1}>{doctorLabel}</Text>
          <Text style={vs.drSpec}>{specialty}</Text>
          <Text style={vs.dateText}>{formatDatetime(item.created_at)}</Text>
        </View>
        <View style={vs.rightCol}>
          <View style={[vs.badge, { backgroundColor: si.bg }]}>
            <Text style={[vs.badgeText, { color: si.color }]}>{si.label}</Text>
          </View>
          {item.amount != null && (
            <Text style={vs.amount}>S/ {parseFloat(item.amount).toFixed(0)}</Text>
          )}
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={C.inkMuted}
            style={{ marginTop: 4 }}
          />
        </View>
      </TouchableOpacity>

      {/* Service type pill */}
      <View style={vs.metaRow}>
        <View style={vs.serviceTag}>
          <Feather name="briefcase" size={11} color={C.inkSoft} />
          <Text style={vs.serviceText}>
            {SERVICE_LABELS[item.service_type] || item.service_type || 'Visita médica'}
          </Text>
        </View>
        {item.payment_status === 'paid' && (
          <View style={vs.paidTag}>
            <Feather name="check-circle" size={11} color={C.green} />
            <Text style={[vs.serviceText, { color: C.green }]}>Pagado</Text>
          </View>
        )}
        {item.cancel_reason ? (
          <Text style={vs.cancelReason} numberOfLines={1}>
            Motivo: {item.cancel_reason}
          </Text>
        ) : null}
      </View>

      {/* Expandable timeline */}
      {expanded && (
        <View style={vs.timeline}>
          <View style={vs.timelineDivider} />
          {hasEvents
            ? <EventTimeline events={item.events} />
            : <View style={tl.empty}><Text style={tl.emptyText}>Sin eventos registrados</Text></View>
          }
        </View>
      )}
    </View>
  );
}

export default function VisitListScreen({ navigation }) {
  const { state } = useApp();
  const [visits, setVisits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = state.authToken;
      // Derive userId: try state.userId, or decode from token
      let userId = state.userId;
      if (!userId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.id || payload.userId || payload.sub;
        } catch (_) {}
      }

      if (!userId) {
        // Fallback to cached local visits from AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const raw = await AsyncStorage.getItem('dh_visits');
        if (raw) setVisits(JSON.parse(raw));
        return;
      }

      const res = await fetch(`${API_BASE}/users/${userId}/history`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.visits || data.history || []);
      // Most recent first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setVisits(list);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [state.authToken, state.userId]);

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, [fetchHistory]));

  return (
    <SafeAreaView style={vs.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Mis visitas" />

      {loading ? (
        <View style={vs.centered}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={vs.loadingText}>Cargando historial...</Text>
        </View>
      ) : error ? (
        <View style={vs.centered}>
          <View style={vs.errorIcon}>
            <Feather name="wifi-off" size={28} color={C.inkMuted} />
          </View>
          <Text style={vs.emptyTitle}>No se pudo cargar</Text>
          <Text style={vs.emptySub}>{error}</Text>
          <TouchableOpacity style={vs.retryBtn} onPress={fetchHistory} activeOpacity={0.8}>
            <Text style={vs.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : visits.length === 0 ? (
        <View style={vs.centered}>
          <View style={vs.emptyIcon}>
            <Feather name="calendar" size={28} color={C.inkMuted} />
          </View>
          <Text style={vs.emptyTitle}>Sin visitas aún</Text>
          <Text style={vs.emptySub}>
            Tus visitas médicas aparecerán aquí una vez que las solicites.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item, i) => item.id ? String(item.id) : String(i)}
          contentContainerStyle={vs.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <VisitCard item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

// ── Timeline styles
const tl = StyleSheet.create({
  container: { paddingTop: 4, paddingBottom: 4, paddingHorizontal: 2 },
  row:       { flexDirection: 'row', minHeight: 36 },
  lineCol:   { width: 24, alignItems: 'center' },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    marginTop: 4, zIndex: 1,
  },
  line: {
    flex: 1, width: 2, backgroundColor: C.line,
    marginTop: 2, marginBottom: 0,
  },
  content: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-start',
    gap: 8, paddingBottom: 14, paddingLeft: 8,
  },
  iconWrap: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 0,
  },
  label:    { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  time:     { fontSize: 11, color: C.inkMuted, marginTop: 1 },
  empty:    { paddingVertical: 8, paddingHorizontal: 4 },
  emptyText:{ fontSize: 12, color: C.inkMuted, fontStyle: 'italic' },
});

// ── Visit card + screen styles
const vs = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  list:    { padding: 16, paddingBottom: 40 },
  centered:{
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 12,
  },
  loadingText: { fontSize: 14, color: C.inkSoft, marginTop: 8 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.line,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, padding: 14,
  },
  drName:   { fontSize: 14, fontWeight: '700', color: C.ink },
  drSpec:   { fontSize: 12, color: C.inkSoft,  marginTop: 1 },
  dateText: { fontSize: 11, color: C.inkMuted, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 2 },
  badge:    { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  badgeText:{ fontSize: 11, fontWeight: '700' },
  amount:   { fontSize: 12, fontWeight: '700', color: C.ink },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    gap: 6, paddingHorizontal: 14, paddingBottom: 12,
  },
  serviceTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.bg, borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 7,
  },
  paidTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.greenSoft, borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 7,
  },
  serviceText: { fontSize: 11, fontWeight: '600', color: C.inkSoft },
  cancelReason:{ fontSize: 11, color: C.red, flex: 1 },

  timelineDivider: { height: 1, backgroundColor: C.line, marginHorizontal: 14 },
  timeline:        { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },

  emptyIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  errorIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.red + '40',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  emptySub:   { fontSize: 14, color: C.inkSoft, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 8, paddingVertical: 10, paddingHorizontal: 24,
    backgroundColor: C.blue, borderRadius: 10,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
