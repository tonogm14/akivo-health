import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';

const SYMPTOMS = [
  { id: 'fever', label: 'Fiebre', icon: 'thermometer' },
  { id: 'flu', label: 'Gripe / resfrío', icon: 'wind' },
  { id: 'head', label: 'Dolor de cabeza', icon: 'alert-circle' },
  { id: 'stomach', label: 'Estómago', icon: 'activity' },
  { id: 'throat', label: 'Dolor de Garganta', icon: 'mic' },
  { id: 'body', label: 'Dolor muscular', icon: 'zap' },
  { id: 'cough', label: 'Tos', icon: 'cloud' },
  { id: 'malaise', label: 'Malestar general', icon: 'frown' },
  { id: 'fatigue', label: 'Fatiga / cansancio', icon: 'battery' },
  { id: 'nausea', label: 'Náuseas o vómitos', icon: 'alert-circle' },
  { id: 'diarrhea', label: 'Diarrea', icon: 'activity' },
  { id: 'constipation', label: 'Estreñimiento', icon: 'slash' },
  { id: 'other', label: 'Otro', icon: 'plus' },
];

export default function SymptomsScreen({ navigation }) {
  const { state, setState } = useApp();
  const [otherText, setOtherText] = useState('');
  const [otherOpen, setOtherOpen] = useState(false);
  const scrollRef = useRef(null);

  const toggle = (id) => {
    if (id === 'other') {
      const nextOpen = !otherOpen;
      setOtherOpen(nextOpen);
      if (nextOpen) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
      if (!nextOpen) {
        // closing: remove any custom symptom
        const filtered = (state.symptoms || []).filter(s => !s.startsWith('other:'));
        setState({ ...state, symptoms: filtered });
        setOtherText('');
      }
      return;
    }
    const s = new Set(state.symptoms || []);
    if (s.has(id)) s.delete(id); else s.add(id);
    setState({ ...state, symptoms: [...s] });
  };

  const onOtherTextChange = (text) => {
    setOtherText(text);
    const filtered = (state.symptoms || []).filter(s => !s.startsWith('other:'));
    if (text.trim()) {
      setState({ ...state, symptoms: [...filtered, `other:${text.trim()}`] });
    } else {
      setState({ ...state, symptoms: filtered });
    }
  };

  const otherSelected = otherOpen;
  const hasSymptoms = (state.symptoms || []).filter(s => s !== 'other').length > 0 ||
    (otherOpen && otherText.trim().length > 0);
  const canContinue = hasSymptoms;

  const onContinue = () => {
    if (state.authToken) {
      navigation.navigate('Matching');
    } else {
      navigation.navigate('PhoneVerification', { redirectTo: 'Matching' });
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} step={0} total={4} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>¿Qué sientes?</Text>
        <Text style={s.sub}>Escoge todo lo que sientes. No necesitas escribir.</Text>

        {/* Symptom grid */}
        <View style={s.grid}>
          {SYMPTOMS.map(sym => {
            const sel = sym.id === 'other'
              ? otherSelected
              : (state.symptoms || []).includes(sym.id);
            return (
              <TouchableOpacity
                key={sym.id}
                onPress={() => toggle(sym.id)}
                activeOpacity={0.8}
                style={[s.symBtn, sel && s.symBtnSel]}
              >
                <View style={[s.symIcon, sel && { backgroundColor: C.blue }]}>
                  <Feather name={sym.icon} size={18} color={sel ? '#fff' : C.blue} />
                </View>
                <Text style={[s.symLabel, sel && { color: C.blueDark }]}>{sym.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom symptom input */}
        {otherOpen && (
          <TextInput
            style={s.otherInput}
            placeholder="Describe tu síntoma..."
            placeholderTextColor={C.inkSoft}
            value={otherText}
            onChangeText={onOtherTextChange}
            autoFocus
            returnKeyType="done"
            maxLength={120}
          />
        )}

        {/* Emergency banner */}
        <TouchableOpacity style={s.emergencyBanner} onPress={() => navigation.navigate('Emergency')}>
          <View style={s.emergencyIcon}>
            <Feather name="alert-triangle" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.emergencyTitle}>¿Es una emergencia?</Text>
            <Text style={s.emergencySub}>Dolor de pecho, dificultad para respirar, desmayo.</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.red} />
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar>
        <PrimaryButton disabled={!canContinue} onPress={onContinue}>
          Continuar
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: C.ink, letterSpacing: -0.5, lineHeight: 32 },
  sub: { fontSize: 15, color: C.inkSoft, marginTop: 6, marginBottom: 18, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  otherInput: {
    borderWidth: 1.5,
    borderColor: C.blue,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: C.ink,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  symBtn: {
    width: '47.5%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  symIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  symLabel: { fontSize: 14, fontWeight: '600', color: C.ink, flex: 1 },
  emergencyBanner: {
    width: '100%',
    marginBottom: 20,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: C.redSoft,
    borderWidth: 1,
    borderColor: C.red + '30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.red,
    alignItems: 'center', justifyContent: 'center',
  },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: C.red },
  emergencySub: { fontSize: 12.5, color: C.ink, marginTop: 2, lineHeight: 17 },
});
