import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

const LINES = [
  { num: '106', label: 'SAMU — Emergencias médicas' },
  { num: '116', label: 'Bomberos' },
  { num: '105', label: 'Policía' },
];

export default function EmergencyScreen({ navigation }) {
  return (
    <View style={s.container}>
      <SafeAreaView style={s.inner} edges={['top', 'bottom']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={s.content}>
          <View style={s.alertCircle}>
            <Feather name="alert-triangle" size={44} color="#fff" />
          </View>
          <Text style={s.title}>Esto puede ser una emergencia</Text>
          <Text style={s.sub}>
            Por tu seguridad, no esperes. Llama ahora a emergencias. La visita a domicilio no es suficiente en casos graves.
          </Text>

          <View style={s.numbersBox}>
            <Text style={s.numbersTitle}>LLAMA YA</Text>
            {LINES.map((line, i) => (
              <TouchableOpacity
                key={line.num}
                onPress={() => Linking.openURL(`tel:${line.num}`)}
                style={[s.numberRow, i < LINES.length - 1 && s.numberRowBorder]}
              >
                <Text style={s.lineNum}>{line.num}</Text>
                <Text style={s.lineLabel}>{line.label}</Text>
                <Feather name="phone" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL('tel:106')}
          >
            <Feather name="phone" size={22} color={C.red} />
            <Text style={s.callBtnText}>Llamar al 106 ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.notEmergencyBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.notEmergencyText}>No es emergencia, seguir con la visita</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.red },
  inner: { flex: 1 },
  backBtn: {
    marginHorizontal: 20, marginTop: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, padding: 24, paddingBottom: 16 },
  alertCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5, lineHeight: 34 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.95)', marginTop: 12, lineHeight: 24 },
  numbersBox: {
    marginTop: 28, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 16,
  },
  numbersTitle: {
    fontSize: 12.5, fontWeight: '700', color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8,
  },
  numberRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
  },
  numberRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)' },
  lineNum: { fontSize: 22, fontWeight: '800', color: '#fff', width: 56 },
  lineLabel: { flex: 1, fontSize: 14, color: '#fff' },
  callBtn: {
    height: 64, borderRadius: 16, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 16,
  },
  callBtnText: { fontSize: 18, fontWeight: '700', color: C.red },
  notEmergencyBtn: {
    marginTop: 10, padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  notEmergencyText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
