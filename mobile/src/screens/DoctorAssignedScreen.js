import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton, Card, SectionTitle, Avatar } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';


export default function DoctorAssignedScreen({ navigation }) {
  const { state } = useApp();
  const raw          = state.assignedDoctor;
  const isInjectable = state.serviceType === 'injectable';
  const [injectablePrice, setInjectablePrice] = useState('50.00');

  useEffect(() => {
    if (!isInjectable) return;
    fetch(`${API_BASE}/demo/services`)
      .then(r => r.json())
      .then(services => {
        const inj = services.find(s => s.slug === 'injectable');
        if (inj) setInjectablePrice(parseFloat(inj.base_price).toFixed(2));
      })
      .catch(() => {});
  }, [isInjectable]);

  const totalPrice = isInjectable ? injectablePrice : '120.00';

  const d = raw ? {
    name:    raw.name,
    spec:    raw.specialty,
    rating:  raw.rating,
    reviews: raw.total_reviews,
    eta:     raw.eta ?? 28,
    exp:     raw.experience_years ? `${raw.experience_years} años` : '—',
    cmp:     raw.cmp_license ?? '—',
    dist:    raw.distance_km ? `${raw.distance_km} km` : null,
  } : {
    name: 'Ana Morales', spec: 'Medicina General', rating: 4.9,
    reviews: 847, eta: 28, exp: '8 años', cmp: 'CMP 54821', dist: null,
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.navigate('Home')} title="Doctor encontrado" step={3} total={4} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Success banner */}
        <View style={s.successBanner}>
          <View style={s.checkCircle}>
            <Feather name="check" size={16} color="#fff" />
          </View>
          <Text style={s.successText}>
            ¡Doctor asignado! Llega en <Text style={{ fontWeight: '700' }}>{d.eta} min</Text>
          </Text>
        </View>

        {/* Doctor card */}
        <Card pad={18}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <Avatar name={d.name} size={72} ring={C.green} />
            <View style={{ flex: 1 }}>
              <Text style={s.doctorName}>Dr. {d.name}</Text>
              <Text style={s.doctorSpec}>{d.spec}</Text>
              <View style={s.ratingRow}>
                <Feather name="star" size={14} color="#F5A623" />
                <Text style={s.ratingVal}>{d.rating}</Text>
                <Text style={s.ratingCount}>({d.reviews} visitas)</Text>
              </View>
            </View>
          </View>

          <View style={s.statsRow}>
            <Stat label="Experiencia" value={d.exp} />
            <View style={s.divider} />
            <Stat label="Colegiatura" value={d.cmp} />
            <View style={s.divider} />
            <Stat label="Idiomas" value="Español" />
          </View>

          <View style={s.verifiedRow}>
            <Feather name="shield" size={16} color={C.green} />
            <Text style={s.verifiedText}>Verificado por el Colegio Médico del Perú</Text>
          </View>
        </Card>

        {/* Cost summary */}
        <Card pad={16} style={{ marginTop: 12 }}>
          <SectionTitle>Resumen</SectionTitle>
          {isInjectable ? (
            <CostRow label="Aplicación de inyectable" value={`S/ ${totalPrice}`} />
          ) : (
            <CostRow label="Visita a domicilio" value="S/ 120.00" />
          )}
          {d.dist && <CostRow label="Distancia" value={d.dist} />}
          <CostRow label="Tiempo estimado" value={`${d.eta} min`} />
          <View style={s.totalLine} />
          <CostRow label="Total pagado" value={`S/ ${totalPrice}`} bold green />
        </Card>

      </ScrollView>
      <BottomBar>
        <PrimaryButton onPress={() => navigation.replace('Tracking')}>
          Seguir visita en vivo
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 11.5, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.ink, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function CostRow({ label, value, bold, green }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, alignItems: 'center' }}>
      <Text style={{ fontSize: bold ? 16 : 14, color: C.inkSoft, fontWeight: bold ? '700' : '400' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {green && <Feather name="check-circle" size={14} color={C.green} />}
        <Text style={{ fontSize: bold ? 16 : 14, color: green ? C.green : C.ink, fontWeight: bold ? '700' : '400' }}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 20 },
  successBanner: {
    backgroundColor: C.greenSoft,
    borderWidth: 1, borderColor: C.green + '30',
    borderRadius: 14, padding: 12, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14,
  },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
  },
  successText: { fontSize: 14, fontWeight: '600', color: C.ink, flex: 1 },
  doctorName:  { fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -0.3 },
  doctorSpec:  { fontSize: 13.5, color: C.inkSoft, marginTop: 2 },
  ratingRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ratingVal:   { fontSize: 13, fontWeight: '700', color: C.ink },
  ratingCount: { fontSize: 12, color: C.inkMuted },
  statsRow: {
    marginTop: 16, padding: 12, borderRadius: 12,
    backgroundColor: C.bg, flexDirection: 'row', alignItems: 'center',
  },
  divider:     { width: 1, height: 32, backgroundColor: C.line },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  verifiedText: { fontSize: 13, color: C.inkSoft },
  totalLine:   { height: 1, backgroundColor: C.line, marginVertical: 10 },
});
