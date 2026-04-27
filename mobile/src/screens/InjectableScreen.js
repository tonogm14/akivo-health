import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

export default function InjectableScreen({ navigation }) {
  const { state, setState } = useApp();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(state.selectedInjectable || null);

  useEffect(() => {
    fetch(`${API_BASE}/demo/injectables`)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => { setError('No se pudo cargar la lista.'); setLoading(false); });
  }, []);

  const handleContinue = () => {
    setState({ ...state, serviceType: 'injectable', selectedInjectable: selected, symptoms: [] });
    navigation.navigate('Location');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Inyectables" step={1} total={4} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Text style={s.title}>¿Qué inyectable necesitas?</Text>
          <Text style={s.sub}>
            Un enfermero o técnico certificado llega a tu casa a aplicarlo.
          </Text>

          {loading && (
            <View style={s.center}>
              <ActivityIndicator size="large" color={C.blue} />
              <Text style={s.loadingText}>Cargando productos…</Text>
            </View>
          )}

          {error && (
            <View style={s.center}>
              <Feather name="wifi-off" size={32} color={C.inkMuted} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && items.map(item => {
            const sel = selected?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.card, sel && s.cardSel]}
                onPress={() => setSelected(item)}
                activeOpacity={0.75}
              >
                <View style={s.cardLeft}>
                  <View style={[s.iconBox, sel && s.iconBoxSel]}>
                    <Feather name="droplet" size={18} color={sel ? '#fff' : C.blue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[s.itemName, sel && { color: C.blue }]}>{item.name}</Text>
                      {item.requires_prescription && (
                        <View style={s.rxBadge}>
                          <Text style={s.rxText}>Rx</Text>
                        </View>
                      )}
                    </View>
                    {item.description ? (
                      <Text style={s.itemDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={s.cardRight}>
                  <Text style={[s.price, sel && { color: C.blue }]}>
                    S/ {parseFloat(item.price).toFixed(2)}
                  </Text>
                  {sel && <Feather name="check-circle" size={18} color={C.blue} style={{ marginTop: 4 }} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {!loading && !error && (
            <View style={s.infoBox}>
              <Feather name="info" size={14} color={C.inkSoft} />
              <Text style={s.infoText}>
                Los productos marcados con <Text style={{ fontWeight: '700' }}>Rx</Text> requieren
                presentar receta médica al momento de la visita.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomBar>
        <PrimaryButton disabled={!selected} onPress={handleContinue}>
          {selected
            ? `Continuar con ${selected.name} — S/ ${parseFloat(selected.price).toFixed(2)}`
            : 'Selecciona un producto'}
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 8 },
  title:   { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },
  sub:     { fontSize: 14, color: C.inkSoft, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  center:  { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: C.inkSoft },
  errorText:   { fontSize: 14, color: C.inkSoft, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: R.md,
    borderWidth: 1.5, borderColor: C.line,
    backgroundColor: '#fff', marginBottom: 10,
  },
  cardSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  cardLeft:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  cardRight: { alignItems: 'flex-end', marginLeft: 8 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxSel: { backgroundColor: C.blue },
  itemName:  { fontSize: 15, fontWeight: '600', color: C.ink },
  itemDesc:  { fontSize: 12, color: C.inkSoft, marginTop: 3, lineHeight: 17 },
  price:     { fontSize: 15, fontWeight: '700', color: C.ink },
  rxBadge: {
    backgroundColor: C.amberSoft, paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 4,
  },
  rxText: { fontSize: 10, fontWeight: '700', color: C.amber },
  infoBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginTop: 8, marginBottom: 20,
    padding: 12, borderRadius: 10,
    backgroundColor: '#F4F6F8',
  },
  infoText: { fontSize: 12, color: C.inkSoft, flex: 1, lineHeight: 18 },
});
