import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
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
  const [showProfile, setShowProfile] = useState(false);

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
      <TopBar title="Doctor encontrado" />
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

                <TouchableOpacity style={s.viewProfileBtn} onPress={() => setShowProfile(true)}>
                  <Text style={s.viewProfileText}>Ver perfil médico</Text>
                  <Feather name="chevron-right" size={14} color={C.blue} />
                </TouchableOpacity>
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
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          style={s.lobbyLink}
          activeOpacity={0.7}
        >
          <Text style={s.lobbyLinkText}>Volver al lobby</Text>
        </TouchableOpacity>
      </BottomBar>

      <Modal visible={showProfile} transparent animationType="slide" onRequestClose={() => setShowProfile(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Perfil Profesional</Text>
              <TouchableOpacity onPress={() => setShowProfile(false)} style={s.modalClose}>
                <Feather name="x" size={20} color={C.inkSoft} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.profileTop}>
                <Avatar name={d.name} size={80} ring={C.blue} />
                <Text style={s.profileName}>Dr. {d.name}</Text>
                <Text style={s.profileSpec}>{d.spec}</Text>
                <View style={s.profileRating}>
                  <Feather name="star" size={14} color={C.amber} fill={C.amber} />
                  <Text style={s.ratingValue}>{d.rating} ({d.reviews || '120+'} reseñas)</Text>
                </View>
              </View>

              <View style={s.profileSection}>
                <Text style={s.sectionTitle}>Sobre el doctor</Text>
                <Text style={s.sectionBody}>
                  Especialista con amplia experiencia en atención primaria y urgencias. 
                  Comprometido con brindar un diagnóstico preciso y un trato humano a cada paciente en la comodidad de su hogar.
                </Text>
              </View>

              <View style={s.profileSection}>
                <Text style={s.sectionTitle}>Formación Académica</Text>
                <View style={s.eduItem}>
                  <Feather name="book-open" size={16} color={C.blue} />
                  <Text style={s.eduText}>Graduado de la Universidad Nacional Mayor de San Marcos (UNMSM).</Text>
                </View>
                <View style={s.eduItem}>
                  <Feather name="award" size={16} color={C.blue} />
                  <Text style={s.eduText}>Colegiatura CMP: {d.cmp}</Text>
                </View>
              </View>

              <View style={s.profileSection}>
                <Text style={s.sectionTitle}>Experiencia</Text>
                <Text style={s.sectionBody}>
                  • {d.exp} de experiencia clínica.{"\n"}
                  • Especialista en medicina de urgencias.{"\n"}
                  • Amplia trayectoria en visitas domiciliarias.
                </Text>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>

            <PrimaryButton onPress={() => setShowProfile(false)}>
              Entendido
            </PrimaryButton>
          </View>
        </View>
      </Modal>
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
  
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  viewProfileText: { fontSize: 12.5, fontWeight: '700', color: C.blue },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.ink },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  
  profileTop: { alignItems: 'center', marginBottom: 24 },
  profileName: { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 12 },
  profileSpec: { fontSize: 16, fontWeight: '600', color: C.blue, marginTop: 4 },
  profileRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ratingValue: { fontSize: 14, color: C.inkSoft, fontWeight: '500' },
  
  profileSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 8 },
  sectionBody: { fontSize: 14, color: C.inkSoft, lineHeight: 22 },
  
  eduItem: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  eduText: { fontSize: 14, color: C.inkSoft, flex: 1 },
  
  lobbyLink: { alignItems: 'center', marginTop: 16, paddingVertical: 4 },
  lobbyLinkText: { fontSize: 15, fontWeight: '600', color: C.inkSoft, textDecorationLine: 'underline' },
});
