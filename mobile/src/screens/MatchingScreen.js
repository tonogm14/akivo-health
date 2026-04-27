import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

const STEPS = [
  { icon: 'check',  label: 'Solicitud recibida' },
  { icon: 'lock',   label: 'Verificando pago' },
  { icon: 'search', label: 'Buscando doctor disponible' },
  { icon: 'user',   label: '¡Doctor encontrado!' },
];

function StatusRow({ icon, label, done, active }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.linear })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [active]);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[sr.row, { opacity: done || active ? 1 : 0.4 }]}>
      <Animated.View style={[sr.iconBox, done && sr.iconDone, active && { transform: [{ rotate: spin }] }]}>
        <Feather name={active ? 'loader' : icon} size={13} color={done ? C.blue : '#fff'} />
      </Animated.View>
      <Text style={[sr.text, (done || active) && { fontWeight: '600' }]}>{label}</Text>
      {done && <Feather name="check" size={14} color="rgba(255,255,255,0.7)" />}
    </View>
  );
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export default function MatchingScreen({ navigation, route }) {
  const { state, setState } = useApp();
  const visitId = route?.params?.visitId ?? state.visitId;

  const [dots, setDots] = useState(0);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cancelledRef = useRef(false);

  const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    const dotsIv = setInterval(() => setDots(d => (d + 1) % 4), 400);
    const elapsedIv = setInterval(() => setElapsed(e => e + 1), 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const run = async () => {
      await delay(800);
      if (cancelledRef.current) return;
      setStep(1); // Verificando pago

      await delay(800);
      if (cancelledRef.current) return;
      setStep(2); // Buscando doctor

      if (!visitId) {
        clearInterval(dotsIv);
        clearInterval(elapsedIv);
        navigation.replace('NoDoctors');
        return;
      }

      const startTime = Date.now();

      const poll = async () => {
        if (cancelledRef.current) return;

        if (Date.now() - startTime >= TIMEOUT_MS) {
          clearInterval(dotsIv);
          clearInterval(elapsedIv);
          navigation.replace('NoDoctors');
          return;
        }

        try {
          const headers = {};
          if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
          const res = await fetch(`${API_BASE}/visits/${visitId}`, { headers });
          if (!res.ok) throw new Error('fetch error');
          const visit = await res.json();

          if (visit.doctor_id && (visit.status === 'matched' || visit.status === 'on_way')) {
            if (cancelledRef.current) return;
            setStep(3);
            await delay(1200);
            if (cancelledRef.current) return;

            clearInterval(dotsIv);
            clearInterval(elapsedIv);

            const doc = visit.doctor || {};
            setState(st => ({
              ...st,
              assignedDoctor: {
                ...doc,
                eta: visit.eta_minutes ?? 35,
              },
            }));
            navigation.replace('DoctorAssigned');
          } else {
            setTimeout(poll, 3000);
          }
        } catch (_) {
          setTimeout(poll, 4000);
        }
      };

      poll();
    };

    run();

    const hardTimeout = setTimeout(() => {
      if (cancelledRef.current) return;
      cancelledRef.current = true;
      clearInterval(dotsIv);
      clearInterval(elapsedIv);
      navigation.replace('NoDoctors');
    }, TIMEOUT_MS + 2000);

    return () => {
      cancelledRef.current = true;
      clearInterval(dotsIv);
      clearInterval(elapsedIv);
      clearTimeout(hardTimeout);
    };
  }, []);

  const secondsLeft = Math.max(0, Math.floor((TIMEOUT_MS - elapsed * 1000) / 1000));
  const minsLeft = Math.floor(secondsLeft / 60);
  const secsLeft = secondsLeft % 60;
  const timerLabel = step >= 2
    ? `${minsLeft}:${String(secsLeft).padStart(2, '0')}`
    : null;

  const handleCancel = () => {
    Alert.alert(
      'Cancelar búsqueda',
      '¿Deseas cancelar la búsqueda de doctor?',
      [
        { text: 'Continuar buscando', style: 'cancel' },
        {
          text: 'Cancelar', style: 'destructive',
          onPress: () => {
            cancelledRef.current = true;
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[s.ring, {
          width: 240 + i * 120, height: 240 + i * 120,
          borderRadius: (240 + i * 120) / 2,
          opacity: 0.18 - i * 0.04,
        }]} />
      ))}

      <SafeAreaView style={s.inner} edges={['top', 'bottom']}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={handleCancel} style={s.closeBtn}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.topLabel}>Buscando doctor</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.center}>
          <Animated.View style={[s.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Feather name="activity" size={46} color="#fff" />
          </Animated.View>

          <Text style={s.headline}>
            {step < 3
              ? `Buscando un médico cerca de ti${'.'.repeat(dots)}`
              : '¡Doctor encontrado!'}
          </Text>
          <Text style={s.sub}>
            {step < 3
              ? <>Contactando doctores disponibles en{' '}
                  <Text style={{ fontWeight: '700' }}>{state.address || 'tu dirección'}</Text></>
              : 'Un doctor aceptó tu solicitud y está en camino'}
          </Text>

          {timerLabel && step < 3 && (
            <View style={s.timerBadge}>
              <Feather name="clock" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={s.timerText}>Tiempo restante: {timerLabel}</Text>
            </View>
          )}

          <View style={s.statusBox}>
            {STEPS.map((st, i) => (
              <StatusRow
                key={i}
                icon={st.icon}
                label={st.label}
                done={step > i}
                active={step === i}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleCancel} style={s.cancelWrap}>
          <Text style={s.cancelText}>Cancelar búsqueda</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  inner:    { flex: 1, width: '100%' },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  topLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  iconCircle: {
    width: 108, height: 108, borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headline: {
    fontSize: 24, fontWeight: '700', color: '#fff',
    textAlign: 'center', letterSpacing: -0.4, lineHeight: 30,
  },
  sub: {
    fontSize: 14, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginTop: 10, maxWidth: 280, lineHeight: 21,
  },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    marginTop: 14,
  },
  timerText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  statusBox: {
    marginTop: 24, padding: 14, paddingHorizontal: 18, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)', width: '100%',
  },
  cancelWrap: { alignItems: 'center', paddingBottom: 34, paddingTop: 12 },
  cancelText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});

const sr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  iconBox: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconDone: { backgroundColor: '#fff' },
  text:     { fontSize: 14, color: '#fff', fontWeight: '400', flex: 1 },
});
