import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useApp } from '../AppContext';
import TabBar from '../components/TabBar';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE, DEV_DOCTOR_ID } from '../config';

// ── Shared header ─────────────────────────────────────────────
function OnlineHeader({ online, onToggle, doctor }) {
  return (
    <View style={h.wrap}>
      <View style={h.row}>
        <View style={h.avatarWrap}>
          <View style={h.avatar}>
            <Text style={h.avatarText}>{doctor.initials}</Text>
          </View>
          <View style={[h.dot, { backgroundColor: online ? C.green : C.inkMuted }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={h.name}>Hola, Dra. {doctor.firstName}</Text>
          <Text style={h.sub}>{doctor.specialty} · CMP {doctor.cmp}</Text>
        </View>
        <View style={h.bellWrap}>
          <Icons.Bell size={20} color={C.ink} />
          <View style={h.bellDot} />
        </View>
      </View>

      <View style={[h.statusRow, online ? h.statusOnline : h.statusOff]}>
        <View style={[h.pulse, { backgroundColor: online ? C.green : C.inkMuted }]} />
        <View style={{ flex: 1 }}>
          <Text style={[h.statusTitle, { color: online ? C.green : C.ink }]}>
            {online ? 'Recibiendo pedidos' : 'Estás fuera de línea'}
          </Text>
          <Text style={h.statusSub}>
            {online
              ? 'Por ubicación GPS + zonas · Tardes'
              : 'Activa para empezar a recibir pacientes'}
          </Text>
        </View>
        <TouchableOpacity
          style={[h.toggle, { backgroundColor: online ? C.green : C.lineStrong, justifyContent: online ? 'flex-end' : 'flex-start' }]}
          onPress={onToggle}
          activeOpacity={0.85}
        >
          <View style={h.toggleThumb} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Stats row ─────────────────────────────────────────────────
function TodayStats({ today }) {
  const items = [
    { label: 'Visitas',    value: `${today.completed}/${today.visits}` },
    { label: 'Ganado hoy', value: `S/ ${today.earned}` },
    { label: 'Horas',      value: `${today.hours} h` },
  ];
  return (
    <View style={st.row}>
      {items.map((x, i) => (
        <View key={x.label} style={[st.card, i < 2 && st.cardBorder]}>
          <Text style={st.val}>{x.value}</Text>
          <Text style={st.lbl}>{x.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── VARIANT A: Waiting ────────────────────────────────────────
function HomeWaiting({ online, onToggle, doctor, today }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <OnlineHeader online={online} onToggle={onToggle} doctor={doctor} />

      <View style={w.statsWrap}>
        <TodayStats today={today} />
      </View>

      <View style={w.heroWrap}>
        <View style={[w.hero, { backgroundColor: online ? C.blueSoft : C.bg }]}>
          {online ? (
            <>
              <View style={w.rippleWrap}>
                <View style={[w.ripple1]} />
                <View style={[w.ripple2]} />
                <View style={w.rippleCenter}>
                  <Icons.Signal size={28} color="#fff" />
                </View>
              </View>
              <Text style={w.heroTitle}>Esperando paciente…</Text>
              <Text style={w.heroSub}>
                Tiempo promedio de espera en tu zona:{' '}
                <Text style={{ color: C.ink, fontWeight: '700' }}>12 min</Text>
              </Text>
            </>
          ) : (
            <>
              <View style={w.offIcon}>
                <Icons.Power size={30} color="#fff" />
              </View>
              <Text style={w.heroTitle}>Estás desconectada</Text>
              <Text style={w.heroSub}>
                Activa el interruptor para empezar a recibir pedidos en tu zona.
              </Text>
            </>
          )}
        </View>

        {online && (
          <View style={w.gpsRow}>
            <View style={w.gpsIcon}>
              <Icons.Nav size={15} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={w.gpsTitle}>Ubicación actual · GPS activo</Text>
              <Text style={w.gpsAddr}>Av. Arequipa 2145, Lince</Text>
              <Text style={w.gpsSub}>Precisión ±8m · Actualizado hace 4s</Text>
            </View>
          </View>
        )}
      </View>

      <View style={w.tipWrap}>
        <View style={[w.tip, { backgroundColor: C.amberSoft, borderColor: C.amber + '40' }]}>
          <View style={w.tipIcon}>
            <Icons.Sparkle size={18} color={C.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={w.tipTitle}>Consejo del día</Text>
            <Text style={w.tipText}>
              Las tardes de martes tienen <Text style={{ fontWeight: '700' }}>3× más pedidos</Text> en Lima Centro. Activa notificaciones push para no perdértelos.
            </Text>
          </View>
        </View>
      </View>

      <View style={w.schedWrap}>
        <Text style={w.schedTitle}>Agendadas hoy</Text>
        <View style={[w.schedCard, { padding: 16, alignItems: 'center' }]}>
          <Text style={{ fontSize: 12, color: C.inkMuted }}>Sin visitas agendadas por ahora</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ── VARIANT B: Incoming request ───────────────────────────────
function HomeIncoming({ req, onAccept, onDecline, doctor, today }) {
  const [secs, setSecs] = useState(20);

  useEffect(() => {
    if (secs <= 0) {
      onDecline();
      return;
    }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const pct = (secs / 20) * 100;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
      <OnlineHeader online doctor={doctor} onToggle={() => {}} />

      <View style={inc.mapWrap}>
        <View style={inc.mapBadge}>
          <Icons.Nav size={12} color={C.blue} />
          <Text style={inc.mapBadgeTxt}> {req.distance} · {req.eta}</Text>
        </View>
      </View>

      <View style={inc.cardWrap}>
        <View style={[inc.card, { borderColor: C.blue }]}>
          <View style={inc.timerBg}>
            <View style={[inc.timerFill, {
              width: pct + '%',
              backgroundColor: secs > 5 ? C.blue : C.red,
            }]} />
          </View>

          <View style={inc.inner}>
            <View style={inc.headerRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[inc.pulseDot, { backgroundColor: C.blue }]} />
                <Text style={[inc.headerLabel, { color: C.blueDark }]}>PEDIDO ENTRANTE</Text>
              </View>
              <Text style={[inc.secsText, { color: secs <= 5 ? C.red : C.inkSoft }]}>
                {secs}s
              </Text>
            </View>

            <Text style={inc.patientName}>{req.patient}, {req.age}</Text>
            <Text style={inc.symptom}>{req.symptom}</Text>

            <View style={inc.metaGrid}>
              <View style={{ flex: 1 }}>
                <Text style={inc.metaLabel}>DIRECCIÓN</Text>
                <Text style={inc.metaValue}>{req.district}</Text>
                <Text style={inc.metaSub}>{req.address}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={inc.metaLabel}>TU PAGO NETO</Text>
                <Text style={[inc.metaEarnings]}>S/ {req.net.toFixed(2)}</Text>
                <Text style={inc.metaSub}>Bruto S/ {req.fee}</Text>
              </View>
            </View>

            <View style={inc.actions}>
              <TouchableOpacity style={inc.declineBtn} onPress={onDecline} activeOpacity={0.8}>
                <Text style={inc.declineTxt}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={inc.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
                <Text style={inc.acceptTxt}>Aceptar visita </Text>
                <Icons.Check size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 14 }}>
        <TodayStats today={today} />
      </View>
    </ScrollView>
  );
}

// ── VARIANT C: Active visit (dark) ────────────────────────────
const STEPS = [
  { id: 'on_way',          label: 'En camino' },
  { id: 'arrived',         label: 'Llegó' },
  { id: 'in_consultation', label: 'Consultando' },
  { id: 'completed',       label: 'Finalizada' },
];

function HomeActive({ visit, doctor, today, onViewPatient, onContinue, onArrived }) {
  const currentIdx = Math.max(0, STEPS.findIndex(s => s.id === visit.status));
  const isOnWay    = visit.status === 'on_way';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.ink }} contentContainerStyle={{ paddingBottom: 20 }}>
      <OnlineHeaderDark doctor={doctor} />

      <View style={act.mapWrap}>
        <View style={act.mapBadge}>
          <View style={act.badgeDot} />
          <Text style={act.badgeTxt}>VISITA ACTIVA</Text>
        </View>
      </View>

      <View style={act.cardWrap}>
        <View style={act.card}>
          <View style={act.patientRow}>
            <View style={act.patientAvatar}>
              <Text style={act.patientInitials}>
                {(visit.patient || 'P').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={act.patientName}>{visit.patient}</Text>
              <Text style={act.patientMeta}>
                {visit.gender ? `${visit.gender} · ` : ''}{visit.age ? `${visit.age} años · ` : ''}{(visit.address || '').split(',')[0]}
              </Text>
            </View>
            <TouchableOpacity style={act.callBtn}>
              <Icons.Phone size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={act.stepper}>
            {STEPS.map((s, i) => {
              const done   = i < currentIdx;
              const active = i === currentIdx;
              return (
                <View key={s.id} style={[act.step, active && { backgroundColor: C.blue }]}>
                  <Text style={[act.stepTxt, {
                    color: active ? '#fff' : done ? C.green : C.inkMuted,
                  }]}>
                    {done ? '✓ ' : ''}{s.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={act.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={act.metaLabel}>INICIO</Text>
              <Text style={act.metaVal}>{visit.startedAt}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={act.metaLabel}>DIRECCIÓN</Text>
              <Text style={act.metaVal} numberOfLines={1}>{(visit.address || '').split(',')[0]}</Text>
            </View>
          </View>

          <View style={act.btnRow}>
            <TouchableOpacity style={act.ghostBtn} onPress={onViewPatient} activeOpacity={0.8}>
              <Icons.Doc size={15} color={C.ink} />
              <Text style={act.ghostBtnTxt}>Ver paciente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={act.ghostBtn} activeOpacity={0.8}>
              <Icons.Nav size={15} color={C.ink} />
              <Text style={act.ghostBtnTxt}>Navegar</Text>
            </TouchableOpacity>
          </View>

          {isOnWay ? (
            <TouchableOpacity style={[act.continueBtn, { backgroundColor: C.green }]} onPress={onArrived} activeOpacity={0.85}>
              <Text style={act.continueTxt}>Llegué al paciente ✓</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={act.continueBtn} onPress={onContinue} activeOpacity={0.85}>
              <Text style={act.continueTxt}>Continuar a consulta →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={act.statsWrap}>
        {[
          { label: 'Visitas hoy', value: `${today.completed}/${today.visits}` },
          { label: 'Ganado',      value: `S/ ${today.earned}` },
          { label: 'Horas',       value: `${today.hours} h` },
        ].map(x => (
          <View key={x.label} style={act.statCard}>
            <Text style={act.statVal}>{x.value}</Text>
            <Text style={act.statLbl}>{x.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function OnlineHeaderDark({ doctor }) {
  return (
    <View style={[h.wrap, { backgroundColor: C.ink, borderBottomColor: 'rgba(255,255,255,0.08)' }]}>
      <View style={h.row}>
        <View style={h.avatarWrap}>
          <View style={h.avatar}>
            <Text style={h.avatarText}>{doctor.initials}</Text>
          </View>
          <View style={[h.dot, { backgroundColor: C.green }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[h.name, { color: '#fff' }]}>Hola, Dra. {doctor.firstName}</Text>
          <Text style={[h.sub, { color: 'rgba(255,255,255,0.6)' }]}>{doctor.specialty} · CMP {doctor.cmp}</Text>
        </View>
        <View style={h.bellWrap}>
          <Icons.Bell size={20} color="#fff" />
          <View style={h.bellDot} />
        </View>
      </View>
    </View>
  );
}

// ── Main HomeScreen ───────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { state, setState } = useApp();
  const [online, setOnline]           = useState(false);
  const [variant, setVariant]         = useState('waiting');
  const [pendingVisit, setPendingVisit] = useState(null);
  const locationSubRef                = useRef(null);
  const doctor = state.doctor || {};
  const today  = state.today  || {};

  // Poll for incoming visit requests while online and waiting
  useEffect(() => {
    if (!online || variant === 'active') return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/visits/pending-for-doctor/${DEV_DOCTOR_ID}`);
        if (!res.ok) return;
        const visits = await res.json();
        if (visits.length > 0) {
          setPendingVisit(visits[0]);
          setVariant('incoming');
        }
      } catch (_) {}
    };

    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [online, variant]);

  const startGpsTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 50 },
        (loc) => {
          fetch(`${API_BASE}/doctors/${DEV_DOCTOR_ID}/location`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }),
          }).catch(() => {});
        }
      );
      locationSubRef.current = sub;
    } catch (_) {}
  };

  const stopGpsTracking = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  };

  const toggleOnline = () => {
    const next = !online;
    setOnline(next);
    if (!next && variant !== 'active') {
      setVariant('waiting');
      setPendingVisit(null);
    }
  };

  const handleAccept = async () => {
    if (!pendingVisit) return;
    try {
      const res = await fetch(`${API_BASE}/visits/${pendingVisit.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'on_way' }),
      });
      if (!res.ok) throw new Error('API error');

      const pt = pendingVisit.patient || {};
      setState(s => ({
        ...s,
        activeVisit: {
          id:         pendingVisit.id,
          patient:    pt.name || 'Paciente',
          patientData: pt,
          status:     'on_way',
          address:    pendingVisit.address || '—',
          age:        pt.age || '—',
          gender:     '',
          symptoms:   pendingVisit.symptoms || [],
          startedAt:  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        },
      }));
      setVariant('active');
      startGpsTracking();
    } catch (_) {
      Alert.alert('Error', 'No se pudo aceptar la visita. Intenta de nuevo.');
    }
  };

  const handleDecline = async () => {
    if (pendingVisit) {
      try {
        await fetch(`${API_BASE}/visits/${pendingVisit.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      } catch (_) {}
    }
    setPendingVisit(null);
    setVariant('waiting');
  };

  const handleArrived = async () => {
    const visitId = state.activeVisit?.id;
    if (!visitId) return;
    try {
      await fetch(`${API_BASE}/visits/${visitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'arrived' }),
      });
      setState(s => ({
        ...s,
        activeVisit: { ...s.activeVisit, status: 'arrived' },
      }));
      stopGpsTracking();
    } catch (_) {
      Alert.alert('Error', 'No se pudo actualizar el estado. Intenta de nuevo.');
    }
  };

  const handleViewPatient = () => {
    navigation.navigate('PatientDetail');
  };

  const handleContinueToConsult = async () => {
    const visitId = state.activeVisit?.id;
    if (visitId && state.activeVisit?.status === 'arrived') {
      try {
        await fetch(`${API_BASE}/visits/${visitId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_consultation' }),
        });
        setState(s => ({
          ...s,
          activeVisit: {
            ...s.activeVisit,
            status: 'in_consultation',
            consultation_started_at: new Date().toISOString(),
          },
        }));
      } catch (_) {}
    }
    navigation.navigate('PatientDetail');
  };

  return (
    <View style={{ flex: 1, backgroundColor: variant === 'active' ? C.ink : C.bg }}>
      {variant === 'waiting' && (
        <HomeWaiting
          online={online}
          onToggle={toggleOnline}
          doctor={doctor}
          today={today}
        />
      )}
      {variant === 'incoming' && (
        <HomeIncoming
          req={{
            patient:  pendingVisit?.patient?.name || 'Paciente',
            age:      pendingVisit?.patient?.age
                        ? `${pendingVisit.patient.age} años`
                        : (pendingVisit?.patient?.age_group || '—'),
            symptom:  (pendingVisit?.symptoms || []).filter(Boolean).join(', ') || 'Consulta general',
            district: (pendingVisit?.address || '—').split(',')[0],
            address:  pendingVisit?.address || '—',
            distance: '—',
            eta:      pendingVisit?.eta_minutes ? `~${pendingVisit.eta_minutes} min` : '—',
            net:      74.70,
            fee:      85,
          }}
          doctor={doctor}
          today={today}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
      {variant === 'active' && (
        <HomeActive
          visit={state.activeVisit || { patient: '—', status: 'on_way', address: '—', startedAt: '—' }}
          doctor={doctor}
          today={today}
          onViewPatient={handleViewPatient}
          onContinue={handleContinueToConsult}
          onArrived={handleArrived}
        />
      )}
      <TabBar current="Home" navigation={navigation} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const h = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 13, height: 13, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#fff',
  },
  name:    { fontSize: 16, fontWeight: '700', color: C.ink, letterSpacing: -0.3 },
  sub:     { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  bellWrap:{ position: 'relative', width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
             backgroundColor: C.bg, borderRadius: 12 },
  bellDot: {
    position: 'absolute', top: 7, right: 7,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.red, borderWidth: 2, borderColor: C.bg,
  },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12, borderWidth: 1 },
  statusOnline:{ backgroundColor: C.greenSoft, borderColor: C.green + '40' },
  statusOff:   { backgroundColor: C.bg, borderColor: C.line },
  pulse:       { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 13, fontWeight: '700' },
  statusSub:   { fontSize: 11, color: C.inkSoft, marginTop: 1 },
  toggle: {
    width: 52, height: 30, borderRadius: 15,
    padding: 3, flexDirection: 'row',
  },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
});

const st = StyleSheet.create({
  row:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
              borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  card:     { flex: 1, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  cardBorder:{ borderRightWidth: 1, borderRightColor: C.line },
  val:      { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  lbl:      { fontSize: 10.5, color: C.inkSoft, marginTop: 2, fontWeight: '600' },
});

const w = StyleSheet.create({
  statsWrap:   { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 14 },
  heroWrap:    { marginHorizontal: 18, marginBottom: 20, backgroundColor: '#fff',
                 borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  hero:        { padding: 28, alignItems: 'center' },
  rippleWrap:  { width: 108, height: 108, alignItems: 'center', justifyContent: 'center',
                 marginBottom: 20, position: 'relative' },
  ripple1:     { position: 'absolute', inset: 0, borderRadius: 54, backgroundColor: C.blue + '15' },
  ripple2:     { position: 'absolute', top: 14, left: 14, right: 14, bottom: 14,
                 borderRadius: 40, backgroundColor: C.blue + '25' },
  rippleCenter:{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue,
                 alignItems: 'center', justifyContent: 'center' },
  heroTitle:   { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 6 },
  heroSub:     { fontSize: 13, color: C.inkSoft, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
  offIcon:     { width: 72, height: 72, borderRadius: 36, backgroundColor: C.lineStrong,
                 alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  gpsRow:      { flexDirection: 'row', alignItems: 'center', gap: 12,
                 borderTopWidth: 1, borderTopColor: C.line,
                 paddingHorizontal: 16, paddingVertical: 12 },
  gpsIcon:     { width: 32, height: 32, borderRadius: 10, backgroundColor: C.greenSoft,
                 alignItems: 'center', justifyContent: 'center' },
  gpsTitle:    { fontSize: 10, fontWeight: '800', color: C.green, letterSpacing: 0.6, textTransform: 'uppercase' },
  gpsAddr:     { fontSize: 13, fontWeight: '700', color: C.ink, marginTop: 1 },
  gpsSub:      { fontSize: 11, color: C.inkSoft },
  tipWrap:     { paddingHorizontal: 18, marginBottom: 18 },
  tip:         { flexDirection: 'row', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  tipIcon:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff',
                 alignItems: 'center', justifyContent: 'center' },
  tipTitle:    { fontSize: 12, fontWeight: '700', color: '#8A5A0D', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  tipText:     { fontSize: 13, color: '#8A5A0D', lineHeight: 20 },
  schedWrap:   { paddingHorizontal: 18 },
  schedTitle:  { fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  schedCard:   { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  schedRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  schedRowBorder:{ borderBottomWidth: 1, borderBottomColor: C.line },
  schedTime:   { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: C.blueSoft, minWidth: 56, alignItems: 'center' },
  schedTimeText:{ fontSize: 15, fontWeight: '800', color: C.blue },
  schedPatient: { fontSize: 14, fontWeight: '700', color: C.ink },
  schedMeta:   { fontSize: 12, color: C.inkSoft, marginTop: 1 },
});

const inc = StyleSheet.create({
  mapWrap: { height: 160, backgroundColor: C.line, borderBottomWidth: 1,
             borderBottomColor: C.line, alignItems: 'flex-end',
             justifyContent: 'flex-start', padding: 12 },
  mapBadge:{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
             borderRadius: 999, flexDirection: 'row', alignItems: 'center',
             shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  mapBadgeTxt:{ fontSize: 11, fontWeight: '700', color: C.ink },
  cardWrap:{ paddingHorizontal: 14, paddingTop: 18, paddingBottom: 12 },
  card:    { borderWidth: 2, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff',
             shadowColor: C.blue, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 30, elevation: 8 },
  timerBg: { height: 4, backgroundColor: C.line },
  timerFill:{ height: '100%' },
  inner:   { padding: 18 },
  headerRow:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  headerLabel:{ fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  secsText: { fontSize: 12, fontWeight: '700' },
  patientName:{ fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  symptom: { fontSize: 13, color: C.inkSoft, marginTop: 2, fontWeight: '600' },
  metaGrid:{ flexDirection: 'row', gap: 16, paddingVertical: 12,
             borderTopWidth: 1, borderTopColor: C.line,
             borderBottomWidth: 1, borderBottomColor: C.line, marginVertical: 14 },
  metaLabel:{ fontSize: 10, color: C.inkMuted, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  metaValue:{ fontSize: 13, fontWeight: '700', color: C.ink, marginTop: 2 },
  metaSub: { fontSize: 11, color: C.inkSoft },
  metaEarnings:{ fontSize: 18, fontWeight: '800', color: C.green, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  declineBtn:{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
               backgroundColor: '#fff', alignItems: 'center' },
  declineTxt:{ fontSize: 14, fontWeight: '700', color: C.ink },
  acceptBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: C.blue,
               flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
               shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 },
  acceptTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

const act = StyleSheet.create({
  mapWrap:  { height: 200, backgroundColor: C.ink,
              alignItems: 'flex-start', justifyContent: 'flex-start', padding: 12 },
  mapBadge: { flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: C.blue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },
  cardWrap: { paddingHorizontal: 14, marginTop: -24 },
  card:     { backgroundColor: '#fff', borderRadius: 20, padding: 18,
               shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 12 },
  patientRow:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  patientAvatar:{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.blueSoft,
                  alignItems: 'center', justifyContent: 'center' },
  patientInitials:{ fontSize: 16, fontWeight: '800', color: C.blue },
  patientName:{ fontSize: 17, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  patientMeta:{ fontSize: 12, color: C.inkSoft, marginTop: 2 },
  callBtn:  { width: 40, height: 40, borderRadius: 12, backgroundColor: C.green,
              alignItems: 'center', justifyContent: 'center' },
  stepper:  { flexDirection: 'row', gap: 4, padding: 6, backgroundColor: C.bg, borderRadius: 12, marginBottom: 16 },
  step:     { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  stepTxt:  { fontSize: 10.5, fontWeight: '700' },
  metaRow:  { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: C.bg, borderRadius: 12, marginBottom: 14 },
  metaLabel:{ fontSize: 10, color: C.inkMuted, fontWeight: '700', letterSpacing: 0.5 },
  metaVal:  { fontSize: 13, fontWeight: '800', color: C.ink, marginTop: 2 },
  btnRow:   { flexDirection: 'row', gap: 10, marginBottom: 10 },
  ghostBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
              backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ghostBtnTxt:{ fontSize: 13, fontWeight: '700', color: C.ink },
  continueBtn:{ backgroundColor: C.blue, borderRadius: 14, padding: 14, alignItems: 'center',
                shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.38, shadowRadius: 14, elevation: 6 },
  continueTxt:{ fontSize: 15, fontWeight: '800', color: '#fff' },
  statsWrap:{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingTop: 8 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  statLbl:  { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600', letterSpacing: 0.3 },
});
