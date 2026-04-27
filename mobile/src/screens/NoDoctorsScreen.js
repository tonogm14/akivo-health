import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { TopBar, ChoiceTile } from '../components';

export default function NoDoctorsScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.navigate('Home')} title="Sin doctores" />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.iconWrap}>
          <Feather name="alert-circle" size={40} color={C.amber} />
        </View>
        <Text style={s.title}>No hay doctores disponibles ahora</Text>
        <Text style={s.sub}>
          La demanda está alta en Miraflores. Puedes esperar, programar tu visita o probar una teleconsulta.
        </Text>
        <View style={{ gap: 10, marginTop: 28 }}>
          <ChoiceTile
            icon={<Feather name="message-circle" size={22} color={C.ink} />}
            label="Avísame cuando haya doctor"
            sub="Te escribimos por WhatsApp"
            onPress={() => navigation.navigate('Home')}
          />
          <ChoiceTile
            icon={<Feather name="calendar" size={22} color={C.ink} />}
            label="Programar para más tarde"
            sub="Escoge hora de hoy o mañana"
            onPress={() => navigation.navigate('Schedule')}
          />
          <ChoiceTile
            icon={<Feather name="phone" size={22} color={C.ink} />}
            label="Teleconsulta ahora"
            sub="Doctor por videollamada · S/ 60"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 40 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.amberSoft,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18,
  },
  title: { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.4, textAlign: 'center' },
  sub: { fontSize: 14, color: C.inkSoft, marginTop: 8, lineHeight: 22, textAlign: 'center' },
});
