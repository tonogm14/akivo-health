import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton, SecondaryButton, Avatar } from '../components';
import { API_BASE } from '../config';
import * as API from '../api';
import { useApp } from '../AppContext';

const AGE_LABELS = {
  baby: 'Bebé (<2 años)',
  child: 'Niño (2–12)',
  teen: 'Adolescente (13–17)',
  adult: 'Adulto (18–59)',
  elder: 'Mayor (60+)',
  other: 'Otro',
};

const URGENCY_LABELS = {
  now: 'Lo antes posible',
  schedule: 'Programado',
  today: 'Hoy',
};

const PAYMENT_LABELS = {
  yape_plin: 'Yape / Plin',
  culqi: 'Culqi',
  niubiz: 'Niubiz / VisaNet',
  pagoefectivo: 'PagoEfectivo',
};

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',   color: C.amber },
  matched:   { label: 'Doctor asignado', color: C.blue },
  on_way:    { label: 'En camino',   color: C.blue },
  arrived:   { label: 'Llegó',       color: C.green },
  completed: { label: 'Completada',  color: C.green },
  cancelled: { label: 'Cancelada',   color: C.red },
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

export default function VisitHistoryDetailScreen({ navigation, route }) {
  const { state } = useApp();
  const [visit, setVisit] = useState(route.params?.visit ?? {});
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRx, setShowRx] = useState(false);

  const statusInfo = STATUS_LABELS[visit.status] ?? { label: visit.status, color: C.inkSoft };
  const canCancel = !['completed', 'cancelled'].includes(visit.status);
  const isLive = ['matched', 'on_way', 'arrived', 'in_consultation'].includes(visit.status);
  const isCompleted = visit.status === 'completed';
  const hasRx = !!visit.has_prescription;

  // Robust data accessors
  const doctorName = visit.doctor_name || visit.doctor?.name || visit.doctorName || '—';
  const doctorSpec = visit.doctor_specialty || visit.doctor?.specialty || visit.specialty || visit.doctorSpec || 'Medicina General';
  const doctorCmp  = visit.doctor_cmp || visit.doctor?.cmp_license || visit.doctorCmp;
  const doctorExp  = visit.doctor_exp || visit.doctor?.experience_years || visit.doctorExp;

  useEffect(() => {
    // Fetch fresh data for this visit to ensure symptoms/patient are loaded
    const fetchFresh = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/visits/${visit.id}`, {
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setVisit(data);
        }
      } catch (err) {
        console.log('[Detail] Fetch fresh error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (visit.id) fetchFresh();
  }, [visit.id]);

  const onCancel = () => {
    Alert.alert(
      'Cancelar visita',
      'Se cobrará S/ 15 por el traslado. ¿Deseas cancelar?',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar', style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const updatedVisit = await API.visits.cancel(visit.id, 'Cancelado por el usuario');
              setVisit(updatedVisit);

              // Update local history status
              const existingRaw = await AsyncStorage.getItem('dh_visits');
              if (existingRaw) {
                const allVisits = JSON.parse(existingRaw);
                const idx = allVisits.findIndex(v => v.id === visit.id);
                if (idx >= 0) {
                  allVisits[idx] = updatedVisit;
                  await AsyncStorage.setItem('dh_visits', JSON.stringify(allVisits));
                }
              }

              // Update local state if needed (or just go back and refresh)
              Alert.alert('Visita cancelada', 'Tu visita fue cancelada correctamente.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert('Error', err.message || 'No se pudo cancelar la visita.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar 
        onBack={() => navigation.goBack()} 
        title="Detalle de la visita" 
        rightIcon={isLive ? 'message-circle' : null}
        onRightPress={isLive ? () => navigation.navigate('Chat', { visitId: visit.id, doctorName: visit.doctorName }) : null}
      />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* Refund Notice for cancelled visits */}
        {visit.status === 'cancelled' && (
          <View style={s.refundBanner}>
            <View style={s.refundIcon}>
              <Feather name="refresh-cw" size={20} color={C.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.refundTitle}>Proceso de reembolso</Text>
              <Text style={s.refundText}>
                Se ha aplicado un cargo de S/ 15 por el traslado del doctor. El saldo restante será devuelto a tu cuenta en un lapso de 4 días hábiles.
              </Text>
              {visit.payment?.refund_status === 'completed' ? (
                <View style={s.refundStatusBox}>
                  <Text style={s.refundStatusTitle}>✅ Dinero devuelto</Text>
                  <Text style={s.refundStatusText}>
                    El reembolso ha sido procesado con éxito.
                  </Text>
                  {!!visit.payment?.refund_transaction_id && (
                    <Text style={s.refundOp}>ID Operación: {visit.payment.refund_transaction_id}</Text>
                  )}
                </View>
              ) : (
                <View style={s.refundStatusBox}>
                  <Text style={[s.refundStatusTitle, { color: C.amber }]}>⏳ Reembolso en proceso</Text>
                  <Text style={s.refundStatusText}>
                    Estamos procesando la devolución del saldo.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Doctor */}
        <View style={s.doctorCard}>
          <Avatar name={doctorName} size={60} ring={C.blue} />
          <View style={{ flex: 1 }}>
            <Text style={s.doctorName}>Dr. {doctorName}</Text>
            <Text style={s.doctorSpec}>{doctorSpec}</Text>
            
            <View style={[s.statusBadge, { backgroundColor: statusInfo.color + '20', alignSelf: 'flex-start', marginTop: 8 }]}>
              <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>
          {isLive && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Chat', { visitId: visit.id, doctorName: doctorName })}
              style={s.contactBtn}
            >
              <Feather name="message-circle" size={24} color="#0F6B34" />
            </TouchableOpacity>
          )}
        </View>

        {/* Details */}
        <View style={s.detailBox}>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color={C.blue} />
              <Text style={{ fontSize: 12, color: C.inkSoft, marginTop: 8 }}>Actualizando información...</Text>
            </View>
          ) : (
            <>
              <DetailRow icon="calendar"    label="Fecha"       value={formatDate(visit.created_at || visit.visitDate)} />
              <DetailRow icon="map-pin"     label="Dirección"   value={visit.address || '—'} />
              {!!(visit.address_ref || visit.ref) && <DetailRow icon="info" label="Referencia" value={visit.address_ref || visit.ref} />}
              <DetailRow 
                icon="activity"    
                label="Síntomas"    
                value={(() => {
                  const syms = visit.symptoms || [];
                  if (!Array.isArray(syms) || syms.length === 0) return '—';
                  return syms.map(s => {
                    if (typeof s !== 'string') return '';
                    if (s.startsWith('other:')) return s.replace('other:', '');
                    return SYMPTOM_LABELS[s] || s;
                  }).filter(Boolean).join(', ');
                })()} 
              />
              <DetailRow icon="user"        label="Paciente"    value={visit.patient?.name || state.patient?.name || '—'} />
              <DetailRow 
                icon="credit-card" 
                label="DNI/CE" 
                value={visit.patient?.document || state.patient?.document || visit.patient?.document_id || 'No registrado'} 
              />
              <DetailRow icon="users"       label="Edad"        value={AGE_LABELS[visit.patient?.age_group || visit.patient?.ageGroup || state.patient?.ageGroup] || visit.patient?.age_group || visit.patient?.ageGroup || state.patient?.ageGroup || '—'} />
              {(visit.patient?.age || state.patient?.age) ? <DetailRow icon="hash" label="Edad exacta" value={`${visit.patient.age || state.patient.age} años`} /> : null}
              {(visit.patient?.has_meds !== undefined || state.patient?.hasMeds !== undefined) && (
                <DetailRow 
                  icon="shopping-bag" 
                  label="Inyectables" 
                  value={(visit.patient?.has_meds ?? state.patient?.hasMeds) ? 'Paciente ya los tiene' : `Médico trae: ${visit.patient?.med_name || state.patient?.medName || 'Inyectable'}`} 
                />
              )}
              {((visit.patient?.medical_flags || visit.patient?.flags || state.patient?.flags || []).filter(f => f !== 'Ninguna').length > 0) && (
                <DetailRow icon="alert-circle" label="Antecedentes" value={(visit.patient?.medical_flags || visit.patient?.flags || state.patient?.flags || []).join(', ')} />
              )}
              {(visit.patient?.notes || state.patient?.notes) ? <DetailRow icon="file-text" label="Notas" value={visit.patient?.notes || state.patient?.notes} /> : null}
              <DetailRow icon="star"        label="Tipo Médico" value={visit.doctor_type === 'specialist' ? 'Especialista' : 'Médico General'} />
              {!!visit.specialty_requested && <DetailRow icon="award" label="Especialidad" value={visit.specialty_requested} />}
              <DetailRow icon="clock"       label="Urgencia"    value={URGENCY_LABELS[visit.urgency] || visit.urgency || '—'} />
              <DetailRow 
                icon="credit-card" 
                label="Método pago" 
                value={PAYMENT_LABELS[visit.payment?.method || visit.payment_method || visit.payment] || visit.payment?.method || visit.payment_method || '—'} 
              />
              <DetailRow icon="dollar-sign" label="Total"       value={`S/ ${visit.price || visit.amount || '120.00'}`} />
              {!!(visit.doctor_cmp || visit.doctorCmp) && <DetailRow icon="shield" label="Colegiatura" value={visit.doctor_cmp || visit.doctorCmp} />}
              {(visit.doctor_exp != null || visit.doctorExp != null) && <DetailRow icon="award" label="Experiencia" value={`${visit.doctor_exp || visit.doctorExp} años`} />}
            </>
          )}
        </View>

        {/* Live Tracking Button */}
        {isLive && (
          <PrimaryButton 
            onPress={() => navigation.navigate('Tracking', { visitId: visit.id })}
            style={{ marginTop: 10 }}
          >
            Seguir al doctor en vivo
          </PrimaryButton>
        )}

        {/* Prescription button - only if has prescription */}
        {hasRx && (
          <TouchableOpacity style={s.rxBtn} onPress={() => setShowRx(true)}>
            <View style={s.rxBtnIcon}>
              <Feather name="file-text" size={18} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rxBtnTitle}>Ver receta médica</Text>
              <Text style={s.rxBtnSub}>Receta emitida por el doctor al finalizar la visita</Text>
            </View>
            <Feather name="chevron-right" size={18} color={C.inkMuted} />
          </TouchableOpacity>
        )}


      </ScrollView>

      {/* Prescription modal */}
      <Modal visible={showRx} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRx(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
          <View style={s.rxHeader}>
            <Text style={s.rxHeaderTitle}>Receta Médica</Text>
            <TouchableOpacity onPress={() => setShowRx(false)} style={s.rxClose}>
              <Feather name="x" size={22} color={C.ink} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.rxContent}>
            <View style={s.rxTopRow}>
              <View style={s.rxLogo}>
                <Feather name="activity" size={20} color={C.blue} />
              </View>
              <View>
                <Text style={s.rxClinic}>DoctorHouse</Text>
                <Text style={s.rxClinicSub}>Atención médica a domicilio · Lima, Perú</Text>
              </View>
            </View>

            <View style={s.rxDivider} />

            <View style={s.rxRow}>
              <Text style={s.rxLabel}>Paciente</Text>
              <Text style={s.rxVal}>{visit.patient?.name || 'Paciente'}</Text>
            </View>
            <View style={s.rxRow}>
              <Text style={s.rxLabel}>Doctor</Text>
              <Text style={s.rxVal}>Dr. {doctorName}</Text>
            </View>
            <View style={s.rxRow}>
              <Text style={s.rxLabel}>Fecha</Text>
              <Text style={s.rxVal}>{formatDate(visit.created_at || visit.visitDate)}</Text>
            </View>

            <View style={s.rxDivider} />

            <Text style={s.rxSectionTitle}>Diagnóstico</Text>
            <Text style={s.rxDiagnosis}>Infección respiratoria aguda leve · CIE-10: J06.9</Text>

            <Text style={[s.rxSectionTitle, { marginTop: 20 }]}>Medicamentos</Text>

            {[
              { name: 'Paracetamol 500 mg', dose: '1 tableta cada 8 horas por 5 días' },
              { name: 'Ibuprofeno 400 mg', dose: '1 tableta cada 12 horas con alimentos por 3 días' },
              { name: 'Loratadina 10 mg', dose: '1 tableta cada 24 horas por 5 días' },
            ].map((med, i) => (
              <View key={i} style={s.rxMed}>
                <Text style={s.rxMedName}>{i + 1}. {med.name}</Text>
                <Text style={s.rxMedDose}>{med.dose}</Text>
              </View>
            ))}

            <Text style={[s.rxSectionTitle, { marginTop: 20 }]}>Indicaciones</Text>
            <Text style={s.rxIndications}>
              Reposo relativo. Hidratación oral abundante. Evitar exposición al frío. Regresar a consulta si los síntomas empeoran o persisten más de 7 días.
            </Text>

            <View style={s.rxDivider} />
            <View style={s.rxSigRow}>
              <View style={s.rxSigLine} />
              <Text style={s.rxSigName}>Dr. {doctorName}</Text>
              <Text style={s.rxSigSpec}>{doctorSpec}</Text>
              {!!doctorCmp && <Text style={s.rxSigCmp}>{doctorCmp}</Text>}
            </View>

            <View style={s.rxDemoNotice}>
              <Feather name="info" size={12} color={C.inkMuted} />
              <Text style={s.rxDemoText}>Esta es una receta de demostración. La integración con el app del doctor estará disponible próximamente.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {canCancel && (
        <BottomBar>
          <PrimaryButton
            variant="red"
            disabled={cancelling}
            onPress={onCancel}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar visita · cargo S/ 15'}
          </PrimaryButton>
        </BottomBar>
      )}
      {isCompleted && (
        <BottomBar>
          <PrimaryButton onPress={() => navigation.navigate('Reorder', { visitId: visit.id })}>
            Pedir otra vez
          </PrimaryButton>
        </BottomBar>
      )}
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={s.detailRow}>
      <Feather name={icon} size={14} color={C.inkSoft} style={{ marginTop: 1 }} />
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]}`;
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: C.line, marginBottom: 16,
  },
  doctorName:   { fontSize: 16, fontWeight: '700', color: C.ink },
  doctorSpec:   { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  doctorRating: { fontSize: 12, fontWeight: '600', color: C.ink },
  statusBadge:  { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  detailBox:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 13, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  detailLabel: { fontSize: 12.5, color: C.inkSoft, width: 96, marginTop: 1 },
  detailValue: { fontSize: 13.5, fontWeight: '600', color: C.ink, flex: 1 },
  rxBtn: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: C.blue + '40',
  },
  rxBtnIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rxBtnTitle: { fontSize: 14, fontWeight: '700', color: C.ink },
  rxBtnSub:   { fontSize: 12, color: C.inkSoft, marginTop: 1 },
  rxHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  rxHeaderTitle: { fontSize: 18, fontWeight: '700', color: C.ink },
  rxClose: { padding: 4 },
  rxContent: { padding: 20, paddingBottom: 40 },
  rxTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  rxLogo: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rxClinic:    { fontSize: 16, fontWeight: '700', color: C.ink },
  rxClinicSub: { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  rxDivider:   { height: 1, backgroundColor: C.line, marginVertical: 16 },
  rxRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rxLabel: { fontSize: 13, color: C.inkSoft },
  rxVal:   { fontSize: 13, fontWeight: '600', color: C.ink },
  rxSectionTitle: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 8 },
  rxDiagnosis:    { fontSize: 14, color: C.ink, lineHeight: 20 },
  rxMed: {
    padding: 12, borderRadius: 10,
    backgroundColor: C.bg, marginBottom: 8,
  },
  rxMedName: { fontSize: 14, fontWeight: '700', color: C.ink },
  rxMedDose: { fontSize: 13, color: C.inkSoft, marginTop: 3 },
  rxIndications: { fontSize: 13, color: C.ink, lineHeight: 20 },
  rxSigRow: { alignItems: 'center', paddingVertical: 8 },
  rxSigLine: { width: 160, height: 1, backgroundColor: C.ink, marginBottom: 8 },
  rxSigName: { fontSize: 14, fontWeight: '700', color: C.ink },
  rxSigSpec: { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  rxSigCmp:  { fontSize: 12, color: C.inkSoft, marginTop: 1 },
  rxDemoNotice: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: C.bg, borderRadius: 10, padding: 12, marginTop: 16,
  },
  rxDemoText: { fontSize: 11.5, color: C.inkMuted, flex: 1, lineHeight: 16 },
  refundBanner: {
    flexDirection: 'row', gap: 14, padding: 18,
    backgroundColor: C.amber + '15',
    borderRadius: 20, borderWidth: 1, borderColor: C.amber + '30',
    marginBottom: 20,
  },
  refundIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.amber, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  refundTitle: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 4 },
  refundText:  { fontSize: 13, color: C.inkSoft, lineHeight: 18 },
  refundStatusBox: {
    marginTop: 12, padding: 12, borderRadius: 12,
    backgroundColor: '#fff',
  },
  refundStatusTitle: { fontSize: 14, fontWeight: '700', color: C.green },
  refundStatusText:  { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  refundOp: { fontSize: 11, fontWeight: '600', color: C.inkSoft, marginTop: 6, fontStyle: 'italic' },
  patientMain: { marginBottom: 12 },
  patientDoc: { fontSize: 13, color: C.inkSoft, marginTop: 2 },
  medsBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: C.blueSoft + '55', padding: 10, borderRadius: 10,
    marginTop: 12,
  },
  medsText: { fontSize: 13, color: C.blueDark, fontWeight: '600', flex: 1 },
  notesBox: {
    marginTop: 12, padding: 12, borderRadius: 12,
    backgroundColor: C.bg, borderLeftWidth: 3, borderLeftColor: C.lineStrong,
  },
  notesLabel: { fontSize: 12, fontWeight: '700', color: C.inkMuted, marginBottom: 4 },
  notesText:  { fontSize: 13, color: C.inkSoft, fontStyle: 'italic' },
  contactBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#E8F8EA',
    alignItems: 'center', justifyContent: 'center',
  },
});
