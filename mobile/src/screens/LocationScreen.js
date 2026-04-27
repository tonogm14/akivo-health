import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton, SectionTitle } from '../components';
import MapViewComponent from '../components/MapView';
import { useApp } from '../AppContext';

export default function LocationScreen({ navigation }) {
  const { state, setState } = useApp();
  const [gpsLoading, setGpsLoading] = useState(!state.lat);
  const [gpsError, setGpsError] = useState(null);
  const [lat, setLat] = useState(state.lat || null);
  const [lng, setLng] = useState(state.lng || null);
  const [addr, setAddr] = useState(state.address || '');
  const [addrRef, setAddrRef] = useState(state.ref || '');
  const [editMode, setEditMode] = useState(false);
  const scrollRef = useRef(null);
  const [when, setWhen] = useState(state.when || 'asap');

  useEffect(() => {
    if (state.lat && state.lng) { setGpsLoading(false); return; }
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Permiso de ubicación denegado. Escribe tu dirección.');
        setGpsLoading(false);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);

        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          const road = [place.street, place.streetNumber].filter(Boolean).join(' ');
          const zone = place.district || place.subregion || place.city || '';
          setAddr([road, zone].filter(Boolean).join(', ') || 'Ubicación actual');
        } else {
          setAddr(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      } catch {
        setGpsError('No se pudo detectar tu ubicación. Escribe tu dirección.');
      }
      setGpsLoading(false);
    })();
  }, []);

  const saveAndNavigate = () => {
    setState({ ...state, address: addr, lat, lng, ref: addrRef, when });
    navigation.navigate(when === 'schedule' ? 'Schedule' : 'Patient');
  };

  const canContinue = addr.trim().length > 0 && !gpsLoading;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} step={1} total={4} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <MapViewComponent
            height={240}
            patientLat={lat}
            patientLng={lng}
            pinLabel="Tu ubicación"
            pulse={!!lat}
          />

          <View style={s.content}>
            <Text style={s.title}>¿Dónde atenderemos?</Text>

            {/* Address card */}
            <View style={[s.addrCard, gpsError && !addr && { borderColor: C.red + '66' }]}>
              <View style={[s.addrIcon, gpsError && !addr && { backgroundColor: C.redSoft }]}>
                <Feather name="map-pin" size={20} color={gpsError && !addr ? C.red : C.blue} />
              </View>
              <View style={{ flex: 1 }}>
                {gpsLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={C.blue} />
                    <Text style={s.addrSub}>Detectando ubicación GPS…</Text>
                  </View>
                ) : editMode ? (
                  <TextInput
                    autoFocus
                    value={addr}
                    onChangeText={setAddr}
                    onBlur={() => addr.trim() && setEditMode(false)}
                    onSubmitEditing={() => addr.trim() && setEditMode(false)}
                    placeholder="Ej. Av. Larco 345, Miraflores"
                    style={s.addrInput}
                    returnKeyType="done"
                  />
                ) : (
                  <>
                    <Text style={[s.addrText, !addr && { color: C.inkMuted }]}>
                      {addr || 'Ingresa tu dirección'}
                    </Text>
                    {!gpsError && lat ? (
                      <Text style={s.addrSub}>Detectado por GPS · ±10 m</Text>
                    ) : gpsError ? (
                      <Text style={[s.addrSub, { color: C.red }]}>{gpsError}</Text>
                    ) : null}
                  </>
                )}
                <TouchableOpacity style={s.changeBtn} onPress={() => {
                  setEditMode(true);
                  setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 150);
                }}>
                  <Text style={s.changeBtnText}>
                    {addr ? 'Cambiar dirección' : 'Escribir dirección'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reference */}
            <View style={{ marginTop: 14 }}>
              <Text style={s.refLabel}>Referencia (ayuda al doctor a llegar)</Text>
              <TextInput
                value={addrRef}
                onChangeText={setAddrRef}
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)}
                placeholder="Ej. Edificio azul, dpto 302, portero"
                style={s.refInput}
              />
            </View>

            {/* When */}
            <View style={{ marginTop: 22 }}>
              <SectionTitle>¿Cuándo?</SectionTitle>
              <View style={s.whenRow}>
                <TouchableOpacity
                  style={[s.whenBtn, when === 'asap' && s.whenBtnSel]}
                  onPress={() => setWhen('asap')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="zap" size={16} color={C.blue} />
                    <Text style={s.whenTitle}>Ahora</Text>
                  </View>
                  <Text style={s.whenSub}>Llega en ~45 minutos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.whenBtn, when === 'schedule' && s.whenBtnSel]}
                  onPress={() => setWhen('schedule')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="calendar" size={16} color={C.blue} />
                    <Text style={s.whenTitle}>Programar visita</Text>
                  </View>
                  <Text style={s.whenSub}>Escoge día/hora</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar>
        <PrimaryButton disabled={!canContinue} onPress={saveAndNavigate}>
          Continuar
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.4, marginBottom: 14 },
  addrCard: {
    padding: 14, borderRadius: R.md,
    borderWidth: 1.5, borderColor: C.line,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  addrIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  addrText: { fontSize: 15, fontWeight: '600', color: C.ink },
  addrSub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  addrInput: {
    fontSize: 14, color: C.ink,
    borderWidth: 1.5, borderColor: C.blue, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  changeBtn: {
    marginTop: 8, paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 8, borderWidth: 1, borderColor: C.line,
    backgroundColor: '#fff', alignSelf: 'flex-start',
  },
  changeBtnText: { fontSize: 12.5, fontWeight: '600', color: C.blue },
  refLabel: { fontSize: 13, fontWeight: '600', color: C.inkSoft, marginBottom: 6 },
  refInput: {
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line,
    fontSize: 15, color: C.ink, backgroundColor: '#fff',
  },
  whenRow: { flexDirection: 'row', gap: 10 },
  whenBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  whenBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  whenTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  whenSub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
});
