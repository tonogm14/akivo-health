import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton, SecondaryButton, SectionTitle } from '../components';

const REASONS = [
  'Me siento mejor',
  'Tardó mucho',
  'Me equivoqué de dirección',
  'Voy a una clínica',
  'Otro motivo',
];

export default function CancelScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Cancelar visita" />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>¿Seguro quieres cancelar?</Text>
        <Text style={s.sub}>
          La Dra. Ana ya viene en camino. Si cancelas, se cobra{' '}
          <Text style={{ fontWeight: '700' }}>S/ 15</Text> por el traslado.
        </Text>

        <SectionTitle style={{ marginTop: 24 }}>Motivo (opcional)</SectionTitle>
        <View style={{ gap: 10 }}>
          {REASONS.map(r => (
            <TouchableOpacity key={r} style={s.reasonBtn}>
              <Text style={s.reasonText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomBar>
        <PrimaryButton variant="red" onPress={() => navigation.navigate('Home')}>
          Sí, cancelar
        </PrimaryButton>
        <SecondaryButton style={{ marginTop: 10 }} onPress={() => navigation.goBack()}>
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
});
