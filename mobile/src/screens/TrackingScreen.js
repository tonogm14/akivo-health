import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { Card, Avatar, PrimaryButton } from '../components';
import MapViewComponent from '../components/MapView';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';
import { scheduleArrivingNotification, cancelScheduledNotifications } from '../notifications';

const STAGES = [
  { label: 'Doctor en camino',  sub: 'El doctor ya salió hacia tu dirección', icon: 'navigation' },
  { label: 'Llegando',          sub: 'El doctor está muy cerca',               icon: 'map-pin'    },
  { label: 'Doctor llegó',      sub: 'Te está esperando en la puerta',         icon: 'check-circle' },
];

const PAYMENT_LABELS = {
  yape_plin:    'Yape / Plin',
  culqi:        'Culqi',
  niubiz:       'Niubiz / VisaNet',
  pagoefectivo: 'PagoEfectivo',
};

export default function TrackingScreen({ navigation }) {
  const { state } = useApp();
  const [stage, setStage]         = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [liveEta, setLiveEta]     = useState(null);
  const [doctorCoords, setDoctorCoords] = useState({ lat: null, lng: null });
  const notifiedRef               = useRef(false);
  const cur = STAGES[stage];

  const doc = state.assignedDoctor;
  const doctorName   = doc?.name      || 'Doctor asignado';
  const doctorSpec   = doc?.specialty || 'Medicina General';
  const doctorRating = doc?.rating    ?? '—';
  const baseEta      = doc?.eta       ?? 35;
  const currentEta   = liveEta !== null ? liveEta : baseEta;

  // Schedule local "arriving" notification based on current ETA
  useEffect(() => {
    scheduleArrivingNotification(currentEta).catch(() => {});
    return () => {
      cancelScheduledNotifications().catch(() => {});
    };
  }, []);  // only on mount — push notification from backend handles live updates

  // Poll GET /visits/:id/eta every 30 seconds for GPS-based ETA
  useEffect(() => {
    if (!state.visitId) return;

    const poll = async () => {
      try {
        const headers = {};
        if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
        const res = await fetch(`${API_BASE}/visits/${state.visitId}/eta`, { headers });
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'completed') {
          navigation.replace('Feedback');
          return;
        }
        if (data.status === 'arrived' && stage < 2) setStage(2);
        if (data.eta_minutes != null) {
          setLiveEta(data.eta_minutes);
          if (data.eta_minutes <= 2 && stage < 2) setStage(2);
          else if (data.eta_minutes <= 5 && stage < 1) setStage(1);
        }
        if (data.doctor_lat != null && data.doctor_lng != null) {
          setDoctorCoords({ lat: data.doctor_lat, lng: data.doctor_lng });
        }
      } catch (_) {}
    };

    poll();
    const iv = setInterval(poll, 30_000);
    return () => clearInterval(iv);
  }, [state.visitId]);

  const etaLabel = stage === 2 ? 'Ahora' : `${currentEta} min`;

  return (
    <View style={s.container}>
      <MapViewComponent
        height={300}
        patientLat={state.lat}
        patientLng={state.lng}
        doctorLat={doctorCoords.lat}
        doctorLng={doctorCoords.lng}
        pinLabel="Tu casa"
        eta={etaLabel}
        interactive
      />

      {/* Floating top buttons */}
      <SafeAreaView style={s.floatingTop} edges={['top']} pointerEvents="box-none">
        <View style={s.floatingTopRow}>
          <TouchableOpacity style={s.floatBtn} onPress={() => navigation.navigate('Home')}>
            <Feather name="chevron-left" size={22} color={C.ink} />
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelFloatBtn} onPress={() => navigation.navigate('Cancel')}>
            <Text style={s.cancelFloatText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <ScrollView style={s.sheet} contentContainerStyle={s.sheetContent}>
        <View style={s.sheetHandle} />

        {/* Stage + ETA */}
        <View style={s.etaRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.stageLabel}>{cur.label}</Text>
            <Text style={s.stageSub}>{cur.sub}</Text>
          </View>
          <View style={s.etaBadgeLarge}>
            <Text style={s.etaText}>{etaLabel}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={s.progressRow}>
          {STAGES.map((st, i) => (
            <View key={i} style={s.progressStep}>
              <View style={[s.progressDot, i <= stage && { backgroundColor: C.blue }]}>
                <Feather name={st.icon} size={10} color={i <= stage ? '#fff' : C.inkMuted} />
              </View>
              {i < STAGES.length - 1 && (
                <View style={[s.progressLine, i < stage && { backgroundColor: C.blue }]} />
              )}
            </View>
          ))}
        </View>

        {/* Doctor card */}
        <Card pad={14} style={s.doctorCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={doctorName} size={52} ring={C.blue} />
            <View style={{ flex: 1 }}>
              <Text style={s.drName}>{doctorName}</Text>
              <Text style={s.drSpec}>{doctorSpec}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Feather name="star" size={12} color="#F5A623" />
                <Text style={s.drRating}>{doctorRating}</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.contactBtn, { backgroundColor: '#E8F8EA' }]}>
              <Feather name="message-circle" size={20} color="#0F6B34" />
            </TouchableOpacity>
            <TouchableOpacity style={[s.contactBtn, { backgroundColor: C.blueSoft }]}>
              <Feather name="phone" size={18} color={C.blue} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Detail toggle */}
        <TouchableOpacity style={s.detailToggle} onPress={() => setShowDetail(v => !v)}>
          <Text style={s.detailToggleText}>Detalle de la cita</Text>
          <Feather name={showDetail ? 'chevron-up' : 'chevron-down'} size={18} color={C.blue} />
        </TouchableOpacity>

        {showDetail && (
          <View style={s.detailBox}>
            <DetailRow icon="map-pin"     label="Dirección"   value={state.address || '—'} />
            {state.ref ? <DetailRow icon="info" label="Referencia" value={state.ref} /> : null}
            <DetailRow icon="activity"    label="Síntomas"    value={state.symptoms?.join(', ') || '—'} />
            <DetailRow icon="user"        label="Paciente"    value={state.patient?.name || '—'} />
            <DetailRow icon="users"       label="Edad"        value={state.patient?.age_group || '—'} />
            <DetailRow icon="clock"       label="Urgencia"    value={state.urgency === 'now' ? 'Ahora' : state.urgency === 'today' ? 'Hoy' : 'Programado'} />
            <DetailRow icon="credit-card" label="Pago"        value={PAYMENT_LABELS[state.payment] || state.payment || '—'} />
            <DetailRow icon="dollar-sign" label="Total"       value="S/ 120.00" />
            <DetailRow icon="shield"      label="Colegiatura" value={doc?.cmp_license || '—'} />
            <DetailRow icon="award"       label="Experiencia" value={doc?.experience_years ? `${doc.experience_years} años` : '—'} />
          </View>
        )}

        {/* Demo advance */}
        <View style={{ marginTop: 12 }}>
          {stage < 2 ? (
            <TouchableOpacity onPress={() => setStage(stage + 1)} style={s.demoBtn}>
              <Text style={s.demoBtnText}>▸ Avanzar etapa (demo)</Text>
            </TouchableOpacity>
          ) : (
            <PrimaryButton onPress={() => navigation.navigate('Feedback')}>
              Terminar visita
            </PrimaryButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={s.detailRow}>
      <Feather name={icon} size={14} color={C.inkSoft} style={{ marginTop: 1 }} />
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  floatingTop:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 },
  floatingTopRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  floatBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  cancelFloatBtn: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  cancelFloatText: { fontSize: 13, fontWeight: '700', color: C.red },
  sheet:        { flex: 1, backgroundColor: '#fff', marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { padding: 20, paddingBottom: 40 },
  sheetHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 16 },
  etaRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stageLabel:   { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.3 },
  stageSub:     { fontSize: 13, color: C.inkSoft, marginTop: 3 },
  etaBadgeLarge: {
    backgroundColor: C.blueSoft, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 14, alignItems: 'center',
  },
  etaText:      { fontSize: 22, fontWeight: '800', color: C.blue },
  progressRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.line, alignItems: 'center', justifyContent: 'center',
  },
  progressLine: { flex: 1, height: 3, backgroundColor: C.line, marginHorizontal: 2 },
  doctorCard:   { marginBottom: 10 },
  drName:       { fontSize: 15, fontWeight: '700', color: C.ink },
  drSpec:       { fontSize: 12.5, color: C.inkSoft, marginTop: 1 },
  drRating:     { fontSize: 12, fontWeight: '600', color: C.ink },
  contactBtn:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line, marginTop: 4,
  },
  detailToggleText: { fontSize: 14, fontWeight: '700', color: C.blue },
  detailBox:    { backgroundColor: C.bg, borderRadius: 14, padding: 14, gap: 10, marginBottom: 4 },
  detailRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailLabel:  { fontSize: 12.5, color: C.inkSoft, width: 90, marginTop: 1 },
  detailValue:  { fontSize: 13, fontWeight: '600', color: C.ink, flex: 1 },
  demoBtn: {
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center',
  },
  demoBtnText: { fontSize: 13, fontWeight: '600', color: C.inkSoft },
});
