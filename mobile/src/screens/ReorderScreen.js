import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton, Avatar, Label, Toggle } from '../components';
import { useApp } from '../AppContext';

const PREV = {
  doctor: { name: 'Luis Vargas', specialty: 'Medicina general', rating: 4.9 },
  date: '12 de abril',
  address: 'Av. Pardo 432, Miraflores',
  patient: 'Carla Rojas · 34 años',
  reason: 'Fiebre y dolor de cabeza',
  payment: 'Yape · S/ 120',
  price: 120,
};

export default function ReorderScreen({ navigation }) {
  const { state, setState } = useApp();
  const sameDoctor = state.sameDoctor ?? true;
  const when = state.reorderWhen ?? 'now';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Pedir otra vez" />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Doctor card */}
        <View style={s.docCard}>
          <Avatar name={PREV.doctor.name} size={56} ring={sameDoctor ? C.blue : undefined} />
          <View style={{ flex: 1 }}>
            <Text style={s.docName}>Dr. {PREV.doctor.name}</Text>
            <Text style={s.docSpec}>{PREV.doctor.specialty} · {PREV.date}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <Feather name="star" size={13} color="#F5A623" />
              <Text style={s.rating}>{PREV.doctor.rating}</Text>
              <Text style={s.visitLabel}>Te atendió antes</Text>
            </View>
          </View>
        </View>

        {/* Same doctor toggle */}
        <View style={[s.toggleCard, sameDoctor && { backgroundColor: C.blueSoft, borderColor: C.blueSoft }]}>
          <Feather name="heart" size={18} color={sameDoctor ? C.blue : C.inkSoft} />
          <View style={{ flex: 1 }}>
            <Text style={s.toggleTitle}>
              {sameDoctor ? 'Pedir al mismo doctor' : 'Cualquier doctor disponible'}
            </Text>
            <Text style={s.toggleSub}>
              {sameDoctor ? 'Si no está disponible, te asignamos otro' : 'Match más rápido'}
            </Text>
          </View>
          <Toggle value={sameDoctor} onChange={v => setState({ ...state, sameDoctor: v })} />
        </View>

        {/* When */}
        <Label style={{ marginTop: 14 }}>¿Cuándo?</Label>
        <View style={s.whenRow}>
          <TouchableOpacity
            style={[s.whenBtn, when === 'now' && s.whenBtnSel]}
            onPress={() => setState({ ...state, reorderWhen: 'now' })}
          >
            <Text style={s.whenTitle}>Ahora</Text>
            <Text style={s.whenSub}>Llega en ~45 minutos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.whenBtn, when === 'schedule' && s.whenBtnSel]}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={s.whenTitle}>Programar visita</Text>
            <Text style={s.whenSub}>Escoge día y hora</Text>
          </TouchableOpacity>
        </View>

        {/* Editable summary */}
        <Label style={{ marginTop: 14 }}>Usar los mismos datos</Label>
        <View style={s.summaryCard}>
          <DataRow icon="map-pin" label="Ubicación" value={PREV.address} onEdit={() => navigation.navigate('Location')} />
          <DataRow icon="user" label="Paciente" value={PREV.patient} onEdit={() => navigation.navigate('Patient')} />
          <DataRow icon="thermometer" label="Motivo" value={PREV.reason} onEdit={() => navigation.navigate('Symptoms')} />
          <DataRow icon="dollar-sign" label="Pago" value={PREV.payment} />
        </View>

        <View style={s.privacyNote}>
          <Feather name="shield" size={13} color={C.inkMuted} />
          <Text style={s.privacyText}>Confirmamos con un código por WhatsApp al tocar "Confirmar".</Text>
        </View>
      </ScrollView>

      <BottomBar>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Total estimado</Text>
          <Text style={s.priceValue}>S/ {PREV.price}</Text>
        </View>
        <PrimaryButton onPress={() => navigation.navigate('Payment')}>
          Confirmar y pedir
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

function DataRow({ icon, label, value, onEdit }) {
  return (
    <View style={dr.row}>
      <View style={dr.icon}>
        <Feather name={icon} size={18} color={C.blue} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={dr.label}>{label}</Text>
        <Text style={dr.value} numberOfLines={1}>{value}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={dr.editBtn}>
          <Text style={dr.editText}>Cambiar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const dr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  icon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 11, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' },
  value: { fontSize: 14, fontWeight: '600', color: C.ink, marginTop: 2 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: C.line },
  editText: { fontSize: 12, fontWeight: '600', color: C.blueDark },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  docCard: {
    padding: 16, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  docName: { fontSize: 17, fontWeight: '800', color: C.ink, letterSpacing: -0.2 },
  docSpec: { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  rating: { fontSize: 12, fontWeight: '700', color: C.ink },
  visitLabel: { fontSize: 11, color: C.inkMuted, marginLeft: 6 },
  toggleCard: {
    marginTop: 10, padding: 12, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  toggleTitle: { fontSize: 13, fontWeight: '700', color: C.ink },
  toggleSub: { fontSize: 11, color: C.inkSoft, marginTop: 2 },
  whenRow: { flexDirection: 'row', gap: 10 },
  whenBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  whenBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  whenTitle: { fontSize: 13, fontWeight: '700', color: C.ink },
  whenSub: { fontSize: 11, color: C.inkSoft, marginTop: 2 },
  summaryCard: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.line,
  },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  privacyText: { fontSize: 11, color: C.inkMuted, lineHeight: 16 },
  priceRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: 10, paddingHorizontal: 4,
  },
  priceLabel: { fontSize: 12, color: C.inkSoft },
  priceValue: { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
});
