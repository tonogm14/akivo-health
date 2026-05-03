import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing, Modal } from 'react-native';
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

const TELE_STAGES = [
  { label: 'Médico asignado',  sub: 'El médico está revisando tu historial', icon: 'user-check' },
  { label: 'Sala de espera',   sub: 'El médico iniciará la llamada pronto', icon: 'clock'    },
  { label: 'En consulta',      sub: 'La videollamada ha comenzado',         icon: 'video' },
];

const PAYMENT_LABELS = {
  yape_plin:    'Yape / Plin',
  culqi:        'Culqi',
  niubiz:       'Niubiz / VisaNet',
  pagoefectivo: 'PagoEfectivo',
};

const AGE_LABELS = {
  baby:  'Bebé (<2 años)',
  child: 'Niño (2–12)',
  teen:  'Adolescente (13–17)',
  adult: 'Adulto (18–59)',
  elder: 'Mayor (60+)',
  other: 'Otro',
};

const URGENCY_LABELS = {
  now:      'Lo antes posible',
  today:    'Hoy',
  schedule: 'Programado',
};

const SYMPTOM_LABELS = {
  fever: 'Fiebre',
  flu: 'Gripe / resfrío',
  head: 'Dolor de cabeza',
  stomach: 'Estómago',
  throat: 'Dolor de Garganta',
  body: 'Dolor muscular',
  cough: 'Tos',
  malaise: 'Malestar general',
  fatigue: 'Fatiga / cansancio',
  nausea: 'Náuseas o vómitos',
  diarrhea: 'Diarrea',
  constipation: 'Estreñimiento',
  other: 'Otro',
};

export default function TrackingScreen({ navigation, route }) {
  const { state } = useApp();
  const visitId = route.params?.visitId || state.visitId;
  const [stage, setStage]         = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [liveEta, setLiveEta]     = useState(null);
  const [doctorCoords, setDoctorCoords] = useState({ lat: null, lng: null });
  const [fullVisit, setFullVisit] = useState(null);

  // Robust data accessors
  const drName = fullVisit?.doctor_name || fullVisit?.doctor?.name || state.assignedDoctor?.name || state.doctorName || '—';
  const drSpec = fullVisit?.doctor_specialty || fullVisit?.doctor?.specialty || state.assignedDoctor?.specialty || state.doctorSpec || 'Medicina General';
  const drRating = fullVisit?.doctor_rating || fullVisit?.doctor?.rating || state.assignedDoctor?.rating || '—';
  const notifiedRef               = useRef(false);
  const pulseAnim                 = useRef(new Animated.Value(0.4)).current;
  const isTele = fullVisit?.service_type === 'telemedicine' || state.serviceType === 'telemedicine';
  const currentStages = isTele ? TELE_STAGES : STAGES;
  const cur = currentStages[stage];

  const doc = state.assignedDoctor;
  const doctorName   = doc?.name      || 'Doctor asignado';
  const doctorSpec   = doc?.specialty || 'Medicina General';
  const doctorRating = doc?.rating    ?? '—';
  const baseEta      = doc?.eta       ?? 35;
  const currentEta   = liveEta !== null ? liveEta : baseEta;

  // Pulse animation for active progress line
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Schedule local "arriving" notification based on current ETA
  useEffect(() => {
    scheduleArrivingNotification(currentEta).catch(() => {});
    return () => {
      cancelScheduledNotifications().catch(() => {});
    };
  }, []);  // only on mount — push notification from backend handles live updates

  // Poll GET /visits/:id/eta every 30 seconds for GPS-based ETA
  useEffect(() => {
    if (!visitId) return;

    const poll = async () => {
      try {
        const headers = {};
        if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
        
        // Fetch ETA and status
        const res = await fetch(`${API_BASE}/visits/${visitId}/eta`, { headers });
        if (!res.ok) return;
        const data = await res.json();

        // Also fetch full visit details if not loaded or just to keep updated
        const vRes = await fetch(`${API_BASE}/visits/${visitId}`, { headers });
        if (vRes.ok) {
          const vData = await vRes.json();
          setFullVisit(vData);
        }

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
  }, [visitId]);

  const etaLabel = stage === 2 ? 'Ahora' : `${currentEta} min`;

  return (
    <View style={s.container}>
      {isTele ? (
        <View style={{ height: 260, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Feather name="video" size={32} color={C.blue} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.blue }}>Sala de espera virtual</Text>
          <Text style={{ fontSize: 14, color: C.inkSoft, marginTop: 4 }}>El médico se unirá en breve</Text>
        </View>
      ) : (
        <MapViewComponent
          height={450}
          patientLat={state.lat}
          patientLng={state.lng}
          doctorLat={doctorCoords.lat}
          doctorLng={doctorCoords.lng}
          pinLabel="Tu casa"
          eta={etaLabel}
          interactive
        />
      )}

      {/* Floating top buttons */}
      <SafeAreaView style={s.floatingTop} edges={['top']} pointerEvents="box-none">
        <View style={s.floatingTopRow}>
          <TouchableOpacity style={s.floatBtn} onPress={() => navigation.navigate('Home')}>
            <Feather name="chevron-left" size={22} color={C.ink} />
          </TouchableOpacity>
          {stage < 2 && (
            <TouchableOpacity style={s.cancelFloatBtn} onPress={() => navigation.navigate('Cancel')}>
              <Text style={s.cancelFloatText}>Cancelar</Text>
            </TouchableOpacity>
          )}
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
          {currentStages.map((st, i) => {
            const isPast = i < stage;
            const isCurrent = i === stage;
            const isLast = i === currentStages.length - 1;

            return (
              <View key={i} style={[s.progressStep, isLast && { flex: 0 }]}>
                <View style={[s.progressDot, i <= stage && { backgroundColor: C.blue }]}>
                  <Feather name={st.icon} size={18} color={i <= stage ? '#fff' : C.inkMuted} />
                </View>
                {!isLast && (
                  <View style={s.lineWrapper}>
                    <View style={s.progressLine} />
                    {(isPast || isCurrent) && (
                      <Animated.View 
                        style={[
                          s.progressLineActive, 
                          isCurrent && { opacity: pulseAnim },
                          { width: '100%' }
                        ]} 
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Doctor card */}
        <Card pad={14} style={s.doctorCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={drName} size={52} ring={C.blue} />
            <View style={{ flex: 1 }}>
              <Text style={s.drName}>Dr. {drName}</Text>
              <Text style={s.drSpec}>{drSpec}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Feather name="star" size={12} color="#F5A623" />
                <Text style={s.drRating}>{drRating}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[s.contactBtn, { backgroundColor: '#E8F8EA', width: 56, height: 56, borderRadius: 28 }]}
              onPress={() => navigation.navigate('Chat', { visitId: visitId, doctorName: drName })}
            >
              <Feather name="message-circle" size={24} color="#0F6B34" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Detail toggle */}
        <TouchableOpacity style={s.detailToggle} onPress={() => setShowDetail(v => !v)}>
          <Text style={s.detailToggleText}>Detalle de la cita</Text>
          <Feather name={showDetail ? 'chevron-up' : 'chevron-down'} size={18} color={C.blue} />
        </TouchableOpacity>


        {/* Action Button for Telemedicine */}
        {isTele && stage === 2 && (
          <PrimaryButton 
            style={{ marginTop: 20 }}
            onPress={() => Alert.alert("Iniciando videollamada", "Conectando con el médico...")}
          >
            Iniciar videollamada
          </PrimaryButton>
        )}

        {/* Demo advance */}
        <View style={{ marginTop: 12 }}>
          {stage < 2 && (
            <TouchableOpacity onPress={() => setStage(stage + 1)} style={s.demoBtn}>
              <Text style={s.demoBtnText}>▸ Avanzar etapa (demo)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal Detalle de la Cita */}
        <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowDetail(false)}>
            <TouchableOpacity style={s.modalSheet} activeOpacity={1}>
              <View style={s.modalHandle} />
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Detalle de la visita</Text>
                <TouchableOpacity onPress={() => setShowDetail(false)} style={s.modalClose}>
                  <Feather name="x" size={20} color={C.inkSoft} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={s.modalDetailBox}>
                  <DetailRow icon="map-pin"     label="Dirección"   value={fullVisit?.address || state.address || '—'} />
                  {(fullVisit?.address_ref || state.ref) ? <DetailRow icon="info" label="Referencia" value={fullVisit?.address_ref || state.ref} /> : null}
                  <DetailRow 
                    icon="activity"    
                    label="Síntomas"    
                    value={(() => {
                      const syms = fullVisit?.symptoms || state.symptoms || [];
                      if (!Array.isArray(syms) || syms.length === 0) return '—';
                      return syms.map(s => {
                        if (typeof s !== 'string') return '';
                        if (s.startsWith('other:')) return s.replace('other:', '');
                        return SYMPTOM_LABELS[s] || s;
                      }).filter(Boolean).join(', ');
                    })()} 
                  />
                  <DetailRow icon="user"        label="Paciente"    value={fullVisit?.patient?.name || state.patient?.name || '—'} />
                  <DetailRow 
                    icon="credit-card" 
                    label="DNI/CE" 
                    value={fullVisit?.patient?.document || state.patient?.document || fullVisit?.patient?.document_id || 'No registrado'} 
                  />
                  <DetailRow 
                    icon="users"       
                    label="Edad"        
                    value={(() => {
                      const p = fullVisit?.patient || state.patient || {};
                      const slug = p.age_group || p.ageGroup;
                      const label = AGE_LABELS[slug] || slug || '—';
                      const ageText = p.age ? ` (${p.age} años)` : '';
                      return label + ageText;
                    })()} 
                  />
                  {(fullVisit?.patient?.has_meds !== undefined || state.patient?.hasMeds !== undefined) && (
                    <DetailRow 
                      icon="shopping-bag" 
                      label="Inyectables" 
                      value={(fullVisit?.patient?.has_meds ?? state.patient?.hasMeds) ? 'Paciente ya los tiene' : `Médico trae: ${fullVisit?.patient?.med_name || state.patient?.medName || 'Inyectable'}`} 
                    />
                  )}
                  {!!(fullVisit?.patient?.notes || state.patient?.notes) && (
                    <DetailRow icon="file-text" label="Notas" value={fullVisit?.patient?.notes || state.patient?.notes} />
                  )}
                  <DetailRow icon="star"        label="Tipo Médico" value={(fullVisit?.doctor_type || state.doctorType) === 'specialist' ? 'Especialista' : 'Médico General'} />
                  {!!(fullVisit?.specialty_requested || state.specialtyRequested) && (
                    <DetailRow icon="award" label="Especialidad" value={fullVisit?.specialty_requested || state.specialtyRequested} />
                  )}
                  <DetailRow icon="clock"       label="Urgencia"    value={URGENCY_LABELS[fullVisit?.urgency || state.urgency] || '—'} />
                  <DetailRow icon="credit-card" label="Pago"        value={PAYMENT_LABELS[fullVisit?.payment?.method || state.payment] || '—'} />
                  <DetailRow icon="dollar-sign" label="Total"       value={`S/ ${fullVisit?.price || '120.00'}`} />
                  <DetailRow icon="shield"      label="Colegiatura" value={fullVisit?.doctor?.cmp_license || doc?.cmp_license || '—'} />
                  <DetailRow icon="award"       label="Experiencia" value={fullVisit?.doctor?.experience_years ? `${fullVisit.doctor.experience_years} años` : (doc?.experience_years ? `${doc.experience_years} años` : '—')} />
                </View>
                <View style={{ height: 30 }} />
              </ScrollView>

              <PrimaryButton onPress={() => setShowDetail(false)}>
                Entendido
              </PrimaryButton>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.line, alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  lineWrapper: { flex: 1, height: 4, marginHorizontal: -2, justifyContent: 'center' },
  progressLine: { width: '100%', height: 4, backgroundColor: C.line, borderRadius: 2 },
  progressLineActive: { position: 'absolute', height: 4, backgroundColor: C.blue, borderRadius: 2 },
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.ink },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  modalDetailBox: { backgroundColor: C.bg, borderRadius: 14, padding: 14, gap: 10 },
});
