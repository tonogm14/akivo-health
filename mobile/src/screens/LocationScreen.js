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

  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const lockAddrUpdate = useRef(false);

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
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
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

  // Autocomplete / Search logic
  useEffect(() => {
    if (!editMode || addr.length < 5) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const query = addr.toLowerCase().includes('huancayo') ? addr : `${addr}, Huancayo, Peru`;
        const results = await Location.geocodeAsync(query);
        if (results && results.length > 0) {
          const pretty = await Promise.all(results.slice(0, 3).map(async (r) => {
            const [p] = await Location.reverseGeocodeAsync(r);
            if (!p) return null;
            const road = [p.street, p.streetNumber].filter(Boolean).join(' ');
            const zone = p.district || p.subregion || p.city || '';
            return {
              display: [road, zone].filter(Boolean).join(', '),
              lat: r.latitude,
              lng: r.longitude
            };
          }));
          setSuggestions(pretty.filter(Boolean));
        }
      } catch (e) {
        console.log("Search error", e);
      } finally {
        setSearching(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [addr, editMode]);

  const selectSuggestion = (sug) => {
    lockAddrUpdate.current = true;
    setAddr(sug.display);
    setLat(sug.lat);
    setLng(sug.lng);
    setSuggestions([]);
    setEditMode(false);
  };

  const handleManualSearch = async () => {
    if (!addr.trim()) return;
    setSearching(true);
    try {
      const query = addr.toLowerCase().includes('huancayo') ? addr : `${addr}, Huancayo, Peru`;
      const results = await Location.geocodeAsync(query);
      if (results.length > 0) {
        lockAddrUpdate.current = true;
        setLat(results[0].latitude);
        setLng(results[0].longitude);
        setSuggestions([]);
        setEditMode(false);
      }
    } catch (e) {
      console.log("Manual search error", e);
    } finally {
      setSearching(false);
    }
  };

  const onManualPointMove = async (coords) => {
    setLat(coords.latitude);
    setLng(coords.longitude);
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      if (place) {
        const road = [place.street, place.streetNumber].filter(Boolean).join(' ');
        const zone = place.district || place.subregion || place.city || '';
        setAddr([road, zone].filter(Boolean).join(', ') || 'Ubicación seleccionada');
      }
    } catch (e) { }
  };

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
            pinLabel="Toca o arrastra el pin"
            pulse={!!lat}
            interactive={true}
            onPointChange={onManualPointMove}
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
                  <View>
                    <TextInput
                      autoFocus
                      value={addr}
                      onChangeText={setAddr}
                      onSubmitEditing={handleManualSearch}
                      placeholder="Ej. Av. Larco 345, Miraflores"
                      style={s.addrInput}
                      returnKeyType="search"
                    />
                    {searching && (
                      <ActivityIndicator size="small" color={C.blue} style={{ marginTop: 8 }} />
                    )}
                    {suggestions.length > 0 && (
                      <View style={s.suggestionsBox}>
                        {suggestions.map((sug, i) => (
                          <TouchableOpacity key={i} style={s.suggestionItem} onPress={() => selectSuggestion(sug)}>
                            <Feather name="map-pin" size={14} color={C.inkSoft} />
                            <Text style={s.suggestionText} numberOfLines={1}>{sug.display}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    <Text style={[s.addrText, !addr && { color: C.inkMuted }]}>
                      {addr || 'Ingresa tu dirección'}
                    </Text>
                    {!gpsError && lat ? (
                      <Text style={s.addrSub}>Ubicación establecida</Text>
                    ) : gpsError ? (
                      <Text style={[s.addrSub, { color: C.red }]}>{gpsError}</Text>
                    ) : null}
                  </>
                )}
                {!editMode && (
                  <TouchableOpacity style={s.changeBtn} onPress={() => {
                    setEditMode(true);
                    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 150);
                  }}>
                    <Text style={s.changeBtnText}>
                      {addr ? 'Cambiar dirección' : 'Escribir dirección'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* House Number & Reference */}
            <View style={{ marginTop: 20, gap: 15 }}>
              <View>
                <Text style={s.label}>Nº de casa / Depto / Oficina</Text>
                <View style={s.inputWrapper}>
                  <Feather name="hash" size={16} color={C.inkSoft} style={s.inputIcon} />
                  <TextInput
                    value={state.houseNumber || ''}
                    onChangeText={v => setState({ ...state, houseNumber: v })}
                    placeholder="Ej: 102, 4to piso, Mz A Lote 5"
                    placeholderTextColor={C.inkMuted}
                    style={s.input}
                  />
                </View>
              </View>

              <View>
                <Text style={s.label}>Referencia para el doctor</Text>
                <View style={s.inputWrapper}>
                  <Feather name="info" size={16} color={C.inkSoft} style={[s.inputIcon, { marginTop: 12 }]} />
                  <TextInput
                    value={addrRef}
                    onChangeText={setAddrRef}
                    placeholder="Ej: Fachada verde, frente al parque, timbre malogrado..."
                    placeholderTextColor={C.inkMuted}
                    multiline
                    numberOfLines={3}
                    style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                  />
                </View>
                <Text style={s.hint}>Ayuda al doctor a llegar más rápido a tu ubicación.</Text>
              </View>
            </View>

            {/* When */}
            <View style={{ marginTop: 22 }}>
              <Text style={s.label}>¿Cuándo?</Text>
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
    padding: 14, borderRadius: 16,
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
  label: { fontSize: 13, fontWeight: '600', color: C.inkSoft, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: C.line, borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputIcon: { padding: 12, paddingRight: 0 },
  input: {
    flex: 1, padding: 12,
    fontSize: 15, color: C.ink,
  },
  hint: { fontSize: 12, color: C.inkMuted, marginTop: 4 },
  whenRow: { flexDirection: 'row', gap: 10 },
  whenBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  whenBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  whenTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  whenSub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  suggestionsBox: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: C.ink,
    flex: 1,
  },
});
