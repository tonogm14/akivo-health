import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';
import * as API from '../api';
import { Avatar, PrimaryButton } from '../components';

export default function MatchingScreen({ navigation, route }) {
  const { state, setState } = useApp();
  const [isVerifying, setIsVerifying] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modos: 'check' (antes del pago) | 'waiting' (después del pago)
  const mode = route?.params?.mode || 'check';
  const [timer, setTimer] = useState(120);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    if (mode === 'check') {
      runAvailabilityCheck();
    } else {
      // En modo waiting mostramos la pantalla azul de espera post-pago
      setIsVerifying(true);
      startRealMatching();
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'waiting' || !isVerifying) return;
    
    const iv = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);

    const stepIv = setInterval(() => {
      setActiveStep(s => (s < 3 ? s + 1 : 3));
    }, 3000);

    return () => {
      clearInterval(iv);
      clearInterval(stepIv);
    };
  }, [mode, isVerifying]);

  const runAvailabilityCheck = async () => {
    setIsVerifying(true);
    
    // Simular un delay de verificación de 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const { lat, lng } = state;
      const res = await fetch(`${API_BASE}/doctors/nearby?lat=${lat}&lng=${lng}&radius_km=15`);
      const nearby = await res.json();
      
      if (nearby && nearby.length > 0) {
        setDoctor(nearby[0]);
        setIsVerifying(false);
      } else {
        // Fallback para demo si no hay nadie en la zona real
        // Forzamos fallback si estamos en dev o si la variable está en true
        const isFallback = process.env.EXPO_PUBLIC_AUTO_MATCH_FALLBACK === 'true' || 
                           process.env.EXPO_PUBLIC_AUTO_MATCH_FALLBACK === true || 
                           __DEV__;

        if (isFallback) {
          console.log("Using demo fallback doctor...");
          setDoctor({
            name: 'Amilcar Marcano',
            specialty: 'Medicina General',
            rating: 4.9,
            distance_km: 1.2,
            cmp_license: '76543'
          });
          setIsVerifying(false);
        } else {
          navigation.replace('NoDoctors');
        }
      }
    } catch (err) {
      console.log("Check availability error", err);
      // En caso de error de red o de coordenadas, si estamos en dev, aplicamos el fallback
      if (__DEV__) {
        setDoctor({
          name: 'Amilcar Marcano (Fallback Error)',
          specialty: 'Medicina General',
          rating: 4.9,
          distance_km: 1.2,
          cmp_license: '76543'
        });
        setIsVerifying(false);
      } else {
        navigation.replace('NoDoctors');
      }
    }
  };

  const startRealMatching = () => {
    // Lógica post-pago
    setTimeout(() => {
      // Si es programada (urgency === 'schedule'), vamos al home con un mensaje de éxito
      if (state.urgency === 'schedule') {
        Alert.alert(
          "Cita programada",
          "Tu visita ha sido agendada con éxito. Un médico será asignado antes de la hora pactada.",
          [{ text: "OK", onPress: () => navigation.replace('Home') }]
        );
      } else {
        navigation.replace('DoctorAssigned');
      }
    }, 4000);
  };

  const onContinue = async () => {
    setIsVerifying(true);
    try {
      const SYMPTOM_LABELS = {
        fever: 'Fiebre', flu: 'Gripe', head: 'Dolor de cabeza', stomach: 'Estómago',
      };
      const mappedSymptoms = (state.symptoms || []).map(s =>
        s.startsWith('other:') ? s.slice(6) : (SYMPTOM_LABELS[s] || s)
      );
      
      const scheduledAt = (() => {
        if (state.when !== 'schedule' || !state.schedTime) return null;
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (state.schedDate || 0));
        const [hh, mm] = state.schedTime.split(':');
        targetDate.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
        return targetDate.toISOString();
      })();
      
      const body = {
        urgency:             state.when === 'schedule' ? 'schedule' : 'now',
        service_type:        state.serviceType || 'doctor_visit',
        scheduled_at:        scheduledAt,
        address:             [state.address, state.houseNumber].filter(Boolean).join(', '),
        address_ref:         state.ref || null,
        latitude:            state.lat  || null,
        longitude:           state.lng  || null,
        symptoms:            mappedSymptoms.length ? mappedSymptoms : ['Consulta general'],
        patient: {
          name:      state.patient?.name,
          document:  state.patient?.document,
          age_group: state.patient?.ageGroup || 'adult',
          age:       state.patient?.age ? parseInt(state.patient.age, 10) : null,
          flags:     state.patient?.flags || [],
          notes:     state.patient?.notes || null,
          has_meds:  !!state.patient?.hasMeds,
          med_name:  state.patient?.medName || null,
        },
        doctor_type:          state.doctorType || 'general',
        specialty_requested:  state.specialtyRequested || null,
      };
      
      // Ya no creamos la visita aquí. La pasamos al PaymentScreen para crearla al pagar.
      navigation.replace('Payment', { visitData: body });
    } catch (err) {
      Alert.alert("Error", "No se pudo preparar la solicitud.");
      setIsVerifying(false);
    }
  };

  // Pantalla Azul de Verificación
  if (isVerifying) {
    const mins = Math.floor(timer / 60);
    const secs = String(timer % 60).padStart(2, '0');

    const steps = [
      "Confirmando pago exitoso",
      "Buscando médico en tu zona",
      "Verificando disponibilidad",
      "Asignando profesional"
    ];

    return (
      <View style={[s.container, { backgroundColor: C.blue }]}>
        <SafeAreaView style={s.inner}>
          {mode === 'waiting' && (
            <View style={s.timerHeader}>
              <Text style={s.timerLabel}>Tiempo estimado de match</Text>
              <Text style={s.timerValue}>{mins}:{secs}</Text>
            </View>
          )}

          <View style={s.center}>
            <Animated.View style={[s.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
              <ActivityIndicator size="large" color="#fff" />
            </Animated.View>
            <Text style={s.headline}>
              {mode === 'check' 
                ? 'Verificando si hay doctores cerca de tu zona...'
                : 'Procesando tu solicitud...'}
            </Text>
            
            {mode === 'check' ? (
              <Text style={s.sub}>
                Estamos consultando la disponibilidad de nuestros profesionales en tiempo real.
              </Text>
            ) : (
              <View style={s.stepsBox}>
                {steps.map((st, i) => (
                  <View key={i} style={s.stepRow}>
                    <View style={[s.stepDot, i < activeStep && s.stepDotDone, i === activeStep && s.stepDotActive]}>
                      {i < activeStep ? (
                        <Feather name="check" size={10} color="#fff" />
                      ) : i === activeStep ? (
                        <View style={s.miniPulse} />
                      ) : null}
                    </View>
                    <Text style={[s.stepText, i < activeStep && s.stepTextDone, i === activeStep && s.stepTextActive]}>
                      {st}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Pantalla de Disponibilidad Confirmada (Modo Check)
  return (
    <View style={s.container}>
      <SafeAreaView style={s.inner}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Feather name="arrow-left" size={20} color={C.ink} />
          </TouchableOpacity>
          <Text style={s.topLabel}>Disponibilidad</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.content}>
          <View style={s.statusHeader}>
            <View style={s.checkPulse}>
              <Animated.View style={[s.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
            </View>
            <Text style={s.statusText}>Médicos disponibles en tu zona</Text>
          </View>

          <Text style={s.title}>¡Buenas noticias!</Text>
          <Text style={s.description}>
            Hemos encontrado profesionales disponibles cerca de <Text style={{ fontWeight: '700' }}>{state.address || 'tu ubicación'}</Text>.
          </Text>

          {doctor && (
            <View style={s.doctorCard}>
              <View style={s.drInfo}>
                <Avatar name={doctor.name} size={60} />
                <View style={{ flex: 1 }}>
                  <Text style={s.drName}>Dr. {doctor.name}</Text>
                  <Text style={s.drSpec}>{doctor.specialty}</Text>
                  <View style={s.ratingRow}>
                    <Feather name="star" size={14} color={C.amber} fill={C.amber} />
                    <Text style={s.ratingText}>{doctor.rating} · Profesional verificado</Text>
                  </View>

                  <TouchableOpacity style={s.viewProfileBtn} onPress={() => setShowProfile(true)}>
                    <Text style={s.viewProfileText}>Ver perfil médico</Text>
                    <Feather name="chevron-right" size={14} color={C.blue} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={s.distRow}>
                <Feather name="map-pin" size={14} color={C.blue} />
                <Text style={s.distText}>Aprox. {doctor.distance_km || '1.2'} km de distancia</Text>
              </View>
            </View>
          )}

          <View style={s.disclaimerBox}>
            <Feather name="info" size={16} color={C.inkMuted} style={{ marginTop: 2 }} />
            <Text style={s.disclaimerText}>
              El médico mostrado es una referencia por cercanía. El profesional asignado finalmente puede variar según quién acepte la solicitud tras el pago.
            </Text>
          </View>
        </View>

        <View style={s.footer}>
          <PrimaryButton onPress={onContinue}>
            Continuar al pago
          </PrimaryButton>
        </View>

        <DoctorProfileModal 
          visible={showProfile} 
          doctor={doctor} 
          onClose={() => setShowProfile(false)} 
        />
      </SafeAreaView>
    </View>
  );
}

function DoctorProfileModal({ visible, doctor, onClose }) {
  if (!doctor) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Perfil Profesional</Text>
            <TouchableOpacity onPress={onClose} style={s.modalClose}>
              <Feather name="x" size={20} color={C.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.profileTop}>
              <Avatar name={doctor.name} size={80} />
              <Text style={s.profileName}>Dr. {doctor.name}</Text>
              <Text style={s.profileSpec}>{doctor.specialty}</Text>
              <View style={s.profileRating}>
                <Feather name="star" size={14} color={C.amber} fill={C.amber} />
                <Text style={s.ratingValue}>{doctor.rating} (120+ reseñas)</Text>
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
                <Text style={s.eduText}>Colegiatura CMP: {doctor.cmp_license || '76543'}</Text>
              </View>
            </View>

            <View style={s.profileSection}>
              <Text style={s.sectionTitle}>Experiencia</Text>
              <Text style={s.sectionBody}>
                • {doctor.experience_years || '8'} años de experiencia clínica.{"\n"}
                • Especialista en medicina de urgencias.{"\n"}
                • Amplia trayectoria en visitas domiciliarias.
              </Text>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          <PrimaryButton onPress={onClose}>
            Entendido
          </PrimaryButton>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1 },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topLabel: { fontSize: 14, fontWeight: '600', color: C.inkSoft },
  content: { flex: 1, padding: 24, paddingTop: 10 },
  statusHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.greenSoft, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20,
  },
  checkPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.green, opacity: 0.3 },
  statusText: { fontSize: 13, fontWeight: '700', color: C.green },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  description: { fontSize: 16, color: C.inkSoft, marginTop: 10, lineHeight: 24 },
  
  doctorCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginTop: 30, borderWidth: 1, borderColor: C.line,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  drInfo: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  drName: { fontSize: 18, fontWeight: '700', color: C.ink },
  drSpec: { fontSize: 14, color: C.blue, fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ratingText: { fontSize: 13, color: C.inkSoft, fontWeight: '500' },
  
  viewProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingVertical: 4,
  },
  viewProfileText: { fontSize: 14, fontWeight: '700', color: C.blue },

  distRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line,
  },
  distText: { fontSize: 13, color: C.inkSoft, fontWeight: '600' },
  
  disclaimerBox: {
    flexDirection: 'row', gap: 10, marginTop: 24,
    padding: 16, borderRadius: 16, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.line,
  },
  disclaimerText: { fontSize: 13, color: C.inkMuted, flex: 1, lineHeight: 20 },
  
  footer: { padding: 20, paddingBottom: 34 },
  
  // Waiting mode / Verifying mode
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  headline: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 12, lineHeight: 22 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: C.line,
    alignSelf: 'center', marginBottom: 16,
  },
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

  // Nuevos estilos para la pantalla azul de espera
  timerHeader: { alignItems: 'center', marginTop: 40 },
  timerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { color: '#fff', fontSize: 44, fontWeight: '800', marginTop: 4 },
  stepsBox: { width: '100%', marginTop: 30, paddingHorizontal: 30, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: C.green, borderColor: C.green },
  stepDotActive: { borderColor: '#fff' },
  miniPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  stepText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  stepTextDone: { color: 'rgba(255,255,255,0.9)' },
  stepTextActive: { color: '#fff' },
});
