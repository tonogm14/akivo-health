import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Platform, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { C, R } from '../theme';
import { Card, SectionTitle, Avatar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';


function DoctorHouseLogo({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M10 30 L32 10 L54 30 L54 54 C54 55.1 53.1 56 52 56 L12 56 C10.9 56 10 55.1 10 54 Z"
        stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
      <Path d="M6 32 L32 9 L58 32" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="28" y="28" width="8" height="20" rx="1.5" fill="#13A579" />
      <Rect x="22" y="34" width="20" height="8" rx="1.5" fill="#13A579" />
    </Svg>
  );
}

function formatVisitDate(iso) {
  const d = new Date(iso);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]}`;
}

const SPECIALTIES = [
  'Medicina Interna', 'Pediatría', 'Ginecología', 'Cardiología',
  'Dermatología', 'Traumatología', 'Neurología', 'Psiquiatría',
  'Oftalmología', 'Otorrinolaringología', 'Urología', 'Otra',
];

export default function HomeScreen({ navigation }) {
  const { state, setState } = useApp();
  const [visits, setVisits] = useState([]);
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorTypeStep, setDoctorTypeStep] = useState('type'); // 'type' | 'specialty'
  const [injectablePrice, setInjectablePrice] = useState('50.00');
  const [showNotifModal, setShowNotifModal] = useState(false);
  const notifChecked = useRef(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('dh_visits').then(raw => {
      if (raw) setVisits(JSON.parse(raw));
      else {
        // backward compat: migrate single dh_last_visit into list
        AsyncStorage.getItem('dh_last_visit').then(lv => {
          if (lv) setVisits([JSON.parse(lv)]);
        }).catch(() => {});
      }
    }).catch(() => { });

    if (!notifChecked.current && Device.isDevice) {
      notifChecked.current = true;
      setTimeout(async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') setShowNotifModal(true);
      }, 800);
    }
  }, []));

  useEffect(() => {
    fetch(`${API_BASE}/demo/services`)
      .then(r => r.json())
      .then(services => {
        const inj = services.find(s => s.slug === 'injectable');
        if (inj) setInjectablePrice(parseFloat(inj.base_price).toFixed(2));
      })
      .catch(() => { });
  }, []);

  const handleEnableNotifs = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setShowNotifModal(false);
    } else {
      // Already denied — send user to system settings
      setShowNotifModal(false);
      await Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.logoBox}>
              <DoctorHouseLogo size={22} />
            </View>
            <Text style={s.brandName}>Doctor House</Text>
          </View>
          <TouchableOpacity style={s.emergencyBtn} onPress={() => navigation.navigate('Emergency')}>
            <Feather name="alert-triangle" size={20} color={C.red} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroText}>
            ¿Te sientes mal?{'\n'}
            <Text style={{ color: C.blue }}>Un médico llega a tu casa.</Text>
          </Text>
          <Text style={s.heroSub}>
            Atención médica a domicilio en aproximadamente 45 minutos, 24/7 en todo el Perú.
          </Text>
        </View>

        {/* Big CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.cta} onPress={() => {
            setState({ ...state, serviceType: 'doctor_visit', selectedInjectable: null, symptoms: [], patient: {}, doctorType: null, specialtyRequested: null });
            navigation.navigate('Symptoms');
          }} activeOpacity={0.9}>
            <View>
              <Text style={s.ctaTitle}>Pedir un doctor</Text>
              <Text style={s.ctaSub}>Ahora o programado</Text>
            </View>
            <View style={s.ctaArrow}>
              <Feather name="arrow-right" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Trust chips */}
        <View style={s.trustRow}>
          <TrustChip icon="shield" label="Médicos colegiados" />
          <TrustChip icon="clock" label="~45 minutos" />
          <TrustChip icon="star" label="4.9 ★" />
        </View>

        {/* Other services */}
        <View style={s.section}>
          <SectionTitle>Otros servicios</SectionTitle>
          <View style={s.serviceGrid}>
            <ServiceCard
              icon="droplet"
              title="Inyectables"
              sub="A tu casa"
              onPress={() => setShowInjectModal(true)}
            />
            <ServiceCard
              icon="monitor"
              title="Telemedicina"
              sub="Videollamada"
              soon
            />
          </View>
        </View>

        {/* Recent visits */}
        <View style={[s.section, { marginBottom: 40 }]}>
          <View style={s.sectionHeaderRow}>
            <SectionTitle style={{ marginBottom: 0 }}>Últimas visitas</SectionTitle>
            {visits.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('VisitList')}>
                <Text style={s.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          {visits.length === 0 ? (
            <Card pad={16} style={s.emptyVisit}>
              <Feather name="calendar" size={22} color={C.inkMuted} />
              <Text style={s.emptyVisitText}>Aún no has solicitado una cita</Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {visits.slice(0, 5).map((v, i) => (
                <VisitCard
                  key={i}
                  visit={v}
                  onPress={() => navigation.navigate('VisitDetail', { visit: v })}
                />
              ))}
              {visits.length > 5 && (
                <TouchableOpacity style={s.seeAllBtn} onPress={() => navigation.navigate('VisitList')}>
                  <Text style={s.seeAllBtnText}>Ver todas las visitas ({visits.length})</Text>
                  <Feather name="chevron-right" size={15} color={C.blue} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal selección tipo de médico */}
      <Modal visible={showDoctorModal} transparent animationType="slide" onRequestClose={() => setShowDoctorModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowDoctorModal(false)}>
          <TouchableOpacity style={s.modalSheet} activeOpacity={1}>
            <View style={s.modalHandle} />

            {doctorTypeStep === 'type' ? (
              <>
                <Text style={s.modalTitle}>¿Qué tipo de médico necesitas?</Text>
                <TouchableOpacity style={s.doctorTypeCard} activeOpacity={0.8} onPress={() => {
                  setState(st => ({ ...st, doctorType: 'general', specialtyRequested: null }));
                  setShowDoctorModal(false);
                  navigation.navigate('Symptoms');
                }}>
                  <View style={[s.doctorTypeIcon, { backgroundColor: C.blueSoft }]}>
                    <Feather name="user" size={26} color={C.blue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.doctorTypeTitle}>Médico General</Text>
                    <Text style={s.doctorTypeSub}>Consulta general, síntomas comunes, recetas</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={C.inkMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={s.doctorTypeCard} activeOpacity={0.8} onPress={() => setDoctorTypeStep('specialty')}>
                  <View style={[s.doctorTypeIcon, { backgroundColor: '#F0E6FF' }]}>
                    <Feather name="award" size={26} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.doctorTypeTitle}>Especialista</Text>
                    <Text style={s.doctorTypeSub}>Pediatra, cardiólogo, dermatólogo y más</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={C.inkMuted} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setDoctorTypeStep('type')} style={s.backRow}>
                  <Feather name="chevron-left" size={18} color={C.blue} />
                  <Text style={s.backRowText}>Atrás</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>¿Qué especialidad?</Text>
                <View style={s.specialtyGrid}>
                  {SPECIALTIES.map(sp => (
                    <TouchableOpacity key={sp} style={s.specialtyChip} activeOpacity={0.8} onPress={() => {
                      setState(st => ({ ...st, doctorType: 'specialist', specialtyRequested: sp }));
                      setShowDoctorModal(false);
                      navigation.navigate('Symptoms');
                    }}>
                      <Text style={s.specialtyChipText}>{sp}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Notification permission modal */}
      <Modal visible={showNotifModal} transparent animationType="slide" onRequestClose={() => setShowNotifModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowNotifModal(false)}>
          <TouchableOpacity style={s.modalSheet} activeOpacity={1}>
            <View style={s.modalHandle} />

            <View style={s.notifIconWrap}>
              <Feather name="bell" size={28} color={C.blue} />
            </View>

            <Text style={s.modalTitle}>Activa las notificaciones</Text>
            <Text style={s.notifBody}>
              Recibe alertas en tiempo real cuando tu doctor esté llegando a tu domicilio y recordatorios de citas programadas.
            </Text>

            <View style={s.notifBenefits}>
              <NotifBenefit icon="map-pin" text="Aviso cuando el doctor esté a 5 minutos de tu casa" />
              <NotifBenefit icon="calendar" text="Recordatorio de citas programadas" />
              <NotifBenefit icon="check-circle" text="Confirmación de pago y asignación de médico" />
            </View>

            <View style={s.modalActions}>
              <PrimaryButton onPress={handleEnableNotifs}>
                Activar notificaciones
              </PrimaryButton>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowNotifModal(false)}>
                <Text style={s.cancelText}>Ahora no</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Inyectables info modal */}
      <Modal visible={showInjectModal} transparent animationType="slide" onRequestClose={() => setShowInjectModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowInjectModal(false)}>
          <TouchableOpacity style={s.modalSheet} activeOpacity={1}>
            <View style={s.modalHandle} />

            <View style={s.modalIconWrap}>
              <Feather name="droplet" size={28} color={C.blue} />
            </View>

            <Text style={s.modalTitle}>Servicio de Inyectables</Text>

            <View style={s.infoBox}>
              <Feather name="alert-circle" size={16} color={C.amber} style={{ marginTop: 1 }} />
              <Text style={s.infoText}>
                Este servicio <Text style={{ fontWeight: '700' }}>no incluye los medicamentos inyectables.</Text>
                {' '}El paciente debe contar con sus propias medicinas listas para que el profesional las aplique.
              </Text>
            </View>

            <View style={s.priceBadge}>
              <Text style={s.priceLabel}>Costo del servicio</Text>
              <Text style={s.priceValue}>S/ {injectablePrice}</Text>
              <Text style={s.priceSub}>Visita para aplicación de inyectable</Text>
            </View>

            <View style={s.modalActions}>
              <PrimaryButton onPress={() => {
                setShowInjectModal(false);
                setState({ ...state, serviceType: 'injectable', selectedInjectable: null, symptoms: [] });
                navigation.navigate('Location');
              }}>
                Entendido, continuar
              </PrimaryButton>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowInjectModal(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: C.amber },
  matched:   { label: 'Asignado',   color: C.blue  },
  on_way:    { label: 'En camino',  color: C.blue  },
  arrived:   { label: 'Llegó',      color: C.green },
  completed: { label: 'Completada', color: C.green },
  cancelled: { label: 'Cancelada',  color: C.red   },
};

function VisitCard({ visit, onPress }) {
  const si = STATUS_LABELS[visit.status] ?? { label: 'Pendiente', color: C.amber };
  return (
    <TouchableOpacity style={s.visitCard} onPress={onPress} activeOpacity={0.8}>
      <Avatar name={visit.doctorName || 'D'} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={s.visitDrName}>Dr. {visit.doctorName || '—'}</Text>
        <Text style={s.visitMeta}>{formatVisitDate(visit.visitDate)} · {visit.doctorSpec || 'Medicina General'}</Text>
      </View>
      <View style={[s.visitBadge, { backgroundColor: si.color + '20' }]}>
        <Text style={[s.visitBadgeText, { color: si.color }]}>{si.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function NotifBenefit({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={16} color={C.blue} />
      </View>
      <Text style={{ flex: 1, fontSize: 13.5, color: C.inkSoft, lineHeight: 19 }}>{text}</Text>
    </View>
  );
}

function TrustChip({ icon, label }) {
  return (
    <View style={s.trustChip}>
      <Feather name={icon} size={16} color={C.blue} />
      <Text style={s.trustLabel}>{label}</Text>
    </View>
  );
}

function ServiceCard({ icon, title, sub, onPress, soon }) {
  return (
    <TouchableOpacity
      style={s.serviceCard}
      onPress={onPress}
      disabled={soon}
      activeOpacity={0.75}
    >
      <Feather name={icon} size={22} color={soon ? C.inkMuted : C.blue} />
      <Text style={[s.serviceTitle, soon && { color: C.inkMuted }]}>{title}</Text>
      <Text style={s.serviceSub}>{sub}</Text>
      {soon && (
        <View style={s.soonBadge}>
          <Text style={s.soonText}>PRONTO</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: C.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: '800', color: C.ink, letterSpacing: -0.4 },
  emergencyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.redSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 14 },
  heroText: { fontSize: 32, fontWeight: '700', color: C.ink, letterSpacing: -0.8, lineHeight: 38 },
  heroSub: { fontSize: 15, color: C.inkSoft, marginTop: 10, lineHeight: 22 },
  ctaWrap: { paddingHorizontal: 20, paddingVertical: 8 },
  cta: {
    backgroundColor: C.blue, borderRadius: 20, height: 76,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 22,
    shadowColor: C.blue, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaTitle: { fontSize: 19, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  ctaSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  ctaArrow: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  trustRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  trustChip: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', gap: 4,
  },
  trustLabel: { fontSize: 11.5, fontWeight: '600', color: C.inkSoft, textAlign: 'center' },
  section: { paddingHorizontal: 20, paddingVertical: 12 },
  serviceGrid: { flexDirection: 'row', gap: 10 },
  serviceCard: {
    flex: 1, padding: 14, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    position: 'relative',
  },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginTop: 8 },
  serviceSub: { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  soonBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: C.amberSoft, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6,
  },
  soonText: { fontSize: 10, fontWeight: '700', color: C.amber, letterSpacing: 0.4 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: C.blue },
  visitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: C.line,
  },
  visitDrName:    { fontSize: 14, fontWeight: '700', color: C.ink },
  visitMeta:      { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  visitBadge:     { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  visitBadgeText: { fontSize: 11, fontWeight: '700' },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
  },
  seeAllBtnText: { fontSize: 13, fontWeight: '600', color: C.blue },
  emptyVisit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyVisitText: { fontSize: 14, color: C.inkMuted, flex: 1 },

  // Doctor type modal
  doctorTypeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    marginBottom: 10,
  },
  doctorTypeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  doctorTypeTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  doctorTypeSub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backRowText: { fontSize: 14, fontWeight: '600', color: C.blue },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specialtyChip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  specialtyChipText: { fontSize: 13, fontWeight: '600', color: C.ink },

  // Injectable modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.line, alignSelf: 'center', marginBottom: 20,
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 16 },
  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: C.amberSoft, borderRadius: 12,
    padding: 14, marginBottom: 18,
  },
  infoText: { fontSize: 13.5, color: C.ink, flex: 1, lineHeight: 20 },
  priceBadge: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.line,
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 22,
  },
  priceLabel: { fontSize: 12, color: C.inkMuted, fontWeight: '500', marginBottom: 4 },
  priceValue: { fontSize: 34, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  priceSub: { fontSize: 12, color: C.inkSoft, marginTop: 4 },
  modalActions: { gap: 10 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15, color: C.inkSoft, fontWeight: '500' },

  // Notification modal
  notifIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  notifBody: {
    fontSize: 14.5, color: C.inkSoft, lineHeight: 22, marginBottom: 20,
  },
  notifBenefits: { marginBottom: 22 },
});
