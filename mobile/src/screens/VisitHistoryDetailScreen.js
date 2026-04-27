import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton, SecondaryButton, Avatar } from '../components';
import { API_BASE } from '../config';

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

export default function VisitHistoryDetailScreen({ navigation, route }) {
  const visit = route.params?.visit ?? {};
  const [cancelling, setCancelling] = useState(false);
  const [showRx, setShowRx] = useState(false);

  const statusInfo = STATUS_LABELS[visit.status] ?? { label: visit.status, color: C.inkSoft };
  const canCancel = !['completed', 'cancelled'].includes(visit.status);

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
              const res = await fetch(`${API_BASE}/visits/${visit.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cancel_reason: 'Cancelado por el usuario' }),
              });
              if (!res.ok) throw new Error('No se pudo cancelar');

              // Update AsyncStorage with cancelled status
              const updated = { ...visit, status: 'cancelled' };
              await AsyncStorage.setItem('dh_last_visit', JSON.stringify(updated));
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
      <TopBar onBack={() => navigation.goBack()} title="Detalle de la visita" />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* Doctor */}
        <View style={s.doctorCard}>
          <Avatar name={visit.doctorName || 'D'} size={52} ring={C.blue} />
          <View style={{ flex: 1 }}>
            <Text style={s.doctorName}>Dr. {visit.doctorName || '—'}</Text>
            <Text style={s.doctorSpec}>{visit.doctorSpec || 'Medicina General'}</Text>
            {visit.doctorRating != null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Feather name="star" size={12} color="#F5A623" />
                <Text style={s.doctorRating}>{visit.doctorRating}</Text>
              </View>
            )}
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={s.detailBox}>
          <DetailRow icon="calendar"    label="Fecha"       value={formatDate(visit.visitDate)} />
          <DetailRow icon="map-pin"     label="Dirección"   value={visit.address || '—'} />
          {!!visit.ref && <DetailRow icon="info" label="Referencia" value={visit.ref} />}
          <DetailRow icon="activity"    label="Síntomas"    value={(visit.symptoms || []).join(', ') || '—'} />
          <DetailRow icon="user"        label="Paciente"    value={visit.patient?.name || '—'} />
          <DetailRow icon="users"       label="Edad"        value={AGE_LABELS[visit.patient?.ageGroup] || visit.patient?.ageGroup || '—'} />
          {visit.patient?.age ? <DetailRow icon="hash" label="Edad exacta" value={`${visit.patient.age} años`} /> : null}
          {(visit.patient?.flags || []).filter(f => f !== 'Ninguna').length > 0 && (
            <DetailRow icon="alert-circle" label="Antecedentes" value={(visit.patient.flags || []).join(', ')} />
          )}
          {!!visit.patient?.notes && <DetailRow icon="file-text" label="Notas" value={visit.patient.notes} />}
          <DetailRow icon="clock"       label="Urgencia"    value={URGENCY_LABELS[visit.urgency] || visit.urgency || '—'} />
          <DetailRow icon="credit-card" label="Método pago" value={PAYMENT_LABELS[visit.payment] || visit.payment || '—'} />
          <DetailRow icon="dollar-sign" label="Total"       value="S/ 120.00" />
          {!!visit.doctorCmp && <DetailRow icon="shield" label="Colegiatura" value={visit.doctorCmp} />}
          {visit.doctorExp != null && <DetailRow icon="award" label="Experiencia" value={`${visit.doctorExp} años`} />}
        </View>

        {/* Prescription button */}
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
              <Text style={s.rxVal}>Dr. {visit.doctorName || '—'}</Text>
            </View>
            <View style={s.rxRow}>
              <Text style={s.rxLabel}>Fecha</Text>
              <Text style={s.rxVal}>{formatDate(visit.visitDate)}</Text>
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
              <Text style={s.rxSigName}>Dr. {visit.doctorName || 'Médico Tratante'}</Text>
              <Text style={s.rxSigSpec}>{visit.doctorSpec || 'Medicina General'}</Text>
              {!!visit.doctorCmp && <Text style={s.rxSigCmp}>{visit.doctorCmp}</Text>}
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
          <SecondaryButton style={{ marginTop: 10 }} onPress={() => navigation.navigate('Reorder')}>
            Pedir otra vez
          </SecondaryButton>
        </BottomBar>
      )}
      {!canCancel && (
        <BottomBar>
          <PrimaryButton onPress={() => navigation.navigate('Reorder')}>
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
});
