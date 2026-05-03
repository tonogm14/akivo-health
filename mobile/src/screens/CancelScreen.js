import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton, SecondaryButton, SectionTitle } from '../components';
import * as API from '../api';
import { useApp } from '../AppContext';

const REASONS = [
  'Me siento mejor',
  'Tardó mucho',
  'Me equivoqué de dirección',
  'Voy a una clínica',
  'Otro motivo',
];

export default function CancelScreen({ navigation }) {
  const { state } = useApp();
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleCancel = async () => {
    if (!state.visitId) return navigation.replace('Home');
    setLoading(true);
    try {
      await API.visits.cancel(state.visitId, selected);
      
      // Update local history status to cancelled
      const existingRaw = await AsyncStorage.getItem('dh_visits');
      if (existingRaw) {
        const allVisits = JSON.parse(existingRaw);
        const idx = allVisits.findIndex(v => v.id === state.visitId);
        if (idx >= 0) {
          allVisits[idx].status = 'cancelled';
          await AsyncStorage.setItem('dh_visits', JSON.stringify(allVisits));
        }
      }

      navigation.replace('Home');
    } catch (err) {
      console.log('Cancel error', err);
      // Even if API fails (e.g. 404 already cancelled), go Home to avoid stuck user
      navigation.replace('Home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Cancelar visita" />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>¿Seguro quieres cancelar?</Text>
        <Text style={s.sub}>
          El doctor ya está coordinando tu visita. Si cancelas, se podría cobrar{' '}
          <Text style={{ fontWeight: '700' }}>S/ 15</Text> por el traslado.
        </Text>

        <SectionTitle style={{ marginTop: 24 }}>Motivo (opcional)</SectionTitle>
        <View style={{ gap: 10 }}>
          {REASONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[s.reasonBtn, selected === r && s.selectedBtn]}
              onPress={() => setSelected(r)}
            >
              <Text style={[s.reasonText, selected === r && s.selectedText]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomBar>
        <PrimaryButton
          variant="red"
          disabled={loading}
          onPress={handleCancel}
        >
          {loading ? 'Cancelando...' : 'Sí, cancelar'}
        </PrimaryButton>
        <SecondaryButton style={{ marginTop: 10 }} disabled={loading} onPress={() => navigation.goBack()}>
          No, esperar doctor
        </SecondaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },
  sub: { fontSize: 14, color: C.inkSoft, marginTop: 8, lineHeight: 22 },
  reasonBtn: {
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
  },
  reasonText: { fontSize: 15, fontWeight: '500', color: C.ink },
  selectedBtn: { borderColor: C.blue, backgroundColor: C.blueSoft },
  selectedText: { color: C.blue, fontWeight: '700' },
});
