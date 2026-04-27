import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton, TogglePill, Label, Input } from '../components';
import { useApp } from '../AppContext';

const AGE_GROUPS = [
  { id: 'baby', label: 'Bebé', sub: '<2 años', icon: 'user' },
  { id: 'child', label: 'Niño', sub: '2–12', icon: 'user' },
  { id: 'teen', label: 'Adolescente', sub: '13–17', icon: 'user' },
  { id: 'adult', label: 'Adulto', sub: '18–59', icon: 'user' },
  { id: 'elder', label: 'Mayor', sub: '60+', icon: 'user' },
  { id: 'other', label: 'Escribir', sub: '', icon: 'plus' },
];
const FLAGS = ['Diabetes', 'Hipertensión', 'Embarazo', 'Alergias', 'Ninguna'];

export default function PatientScreen({ navigation }) {
  const { state, setState } = useApp();
  const p = state.patient || {};
  const upd = (k, v) => setState({ ...state, patient: { ...p, [k]: v } });
  const ageInputRef = useRef(null);
  const scrollRef   = useRef(null);
  const showAgeInput = p.ageGroup === 'other';
  const isInjectable = state.serviceType === 'injectable';
  const injectableReady = !isInjectable || (
    p.hasMeds !== undefined &&
    (p.hasMeds === true || (p.hasMeds === false && p.medName?.trim()))
  );
  const ready = p.name && p.ageGroup && (p.ageGroup !== 'other' || (p.age && parseInt(p.age, 10) >= 0)) && injectableReady;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} step={2} total={4} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{state.serviceType === 'injectable' ? '¿Para quién es el inyectable?' : '¿Para quién es la visita?'}</Text>

        <View style={s.toggleRow}>
          <TogglePill active={p.forWho !== 'other'} onPress={() => upd('forWho', 'me')}>Para mí</TogglePill>
          <TogglePill active={p.forWho === 'other'} onPress={() => upd('forWho', 'other')}>Otra persona</TogglePill>
        </View>

        <Label>Nombre del paciente</Label>
        <Input
          value={p.name || ''}
          onChangeText={v => upd('name', v)}
          placeholder="Ej. María Quispe"
          style={{ marginBottom: 16 }}
        />

        <Label style={{ marginTop: 0 }}>Edad</Label>
        <View style={s.ageGrid}>
          {AGE_GROUPS.map(a => {
            const sel = p.ageGroup === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => {
                  upd('ageGroup', a.id);
                  if (a.id === 'other') setTimeout(() => {
                    ageInputRef.current?.focus();
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                activeOpacity={0.8}
                style={[s.ageBtn, sel && s.ageBtnSel]}
              >
                <Feather name={a.icon} size={18} color={sel ? C.blue : C.inkSoft} />
                <Text style={s.ageName}>{a.label}</Text>
                {a.sub ? <Text style={s.ageSub}>{a.sub}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {showAgeInput && (
          <View style={{ marginTop: 12 }}>
            <Label>Edad exacta (años)</Label>
            <TextInput
              ref={ageInputRef}
              value={p.age || ''}
              onChangeText={v => upd('age', v.replace(/[^0-9]/g, ''))}
              placeholder="Ej. 45"
              keyboardType="number-pad"
              maxLength={3}
              style={s.ageInput}
              placeholderTextColor={C.inkMuted}
            />
          </View>
        )}

        <Label style={{ marginTop: 18 }}>Notas para el doctor (opcional)</Label>
        <Input
          value={p.notes || ''}
          onChangeText={v => upd('notes', v)}
          placeholder="Ej. Es alérgico a la penicilina"
          multiline
          rows={3}
          style={{ marginBottom: 18 }}
        />

        <Label>¿Algo importante?</Label>
        <View style={s.flagsRow}>
          {FLAGS.map(f => {
            const flags = p.flags || [];
            const sel = flags.includes(f);
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  const next = sel ? flags.filter(x => x !== f) : [...flags, f];
                  upd('flags', next);
                }}
                activeOpacity={0.8}
                style={[s.flagBtn, sel && s.flagBtnSel]}
              >
                <Text style={[s.flagText, sel && { color: C.blueDark }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isInjectable && (
          <View style={s.medsSection}>
            <Label style={{ marginTop: 0 }}>¿Tienes los inyectables a colocar?</Label>
            <View style={s.medsRow}>
              <TouchableOpacity
                style={[s.medsBtn, p.hasMeds === true && s.medsBtnSel]}
                onPress={() => upd('hasMeds', true)}
                activeOpacity={0.8}
              >
                <Feather name="check-circle" size={18} color={p.hasMeds === true ? C.blue : C.inkSoft} />
                <Text style={[s.medsBtnText, p.hasMeds === true && { color: C.blue }]}>Sí, los tengo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.medsBtn, p.hasMeds === false && s.medsBtnNo]}
                onPress={() => upd('hasMeds', false)}
                activeOpacity={0.8}
              >
                <Feather name="shopping-cart" size={18} color={p.hasMeds === false ? C.amber : C.inkSoft} />
                <Text style={[s.medsBtnText, p.hasMeds === false && { color: C.amber }]}>No, el doctor los comprará</Text>
              </TouchableOpacity>
            </View>
            {p.hasMeds === false && (
              <View style={s.medNameWrap}>
                <View style={s.medNameInfo}>
                  <Feather name="info" size={14} color={C.amber} />
                  <Text style={s.medNameInfoText}>El doctor comprará el medicamento. Se aplicará un costo adicional que deberá pagar al Profesional al momento de la visita.</Text>
                </View>
                <Label style={{ marginTop: 12 }}>Nombre del medicamento a inyectar</Label>
                <Input
                  value={p.medName || ''}
                  onChangeText={v => upd('medName', v)}
                  placeholder="Ej. Diclofenaco 75mg, Vitamina B12"
                  style={{ marginBottom: 0 }}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar>
        <PrimaryButton disabled={!ready} onPress={() => navigation.navigate('Payment')}>
          Continuar al pago
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: C.ink, letterSpacing: -0.5, marginBottom: 14 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  ageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ageBtn: {
    width: '30%', paddingVertical: 12, paddingHorizontal: 6, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', gap: 4,
  },
  ageBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  ageName: { fontSize: 13, fontWeight: '600', color: C.ink },
  ageSub: { fontSize: 11, color: C.inkMuted },
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flagBtn: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  flagBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  flagText: { fontSize: 13, fontWeight: '600', color: C.ink },
  ageInput: {
    height: 48, borderWidth: 1.5, borderColor: C.line, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 15, color: C.ink,
    backgroundColor: '#fff', marginBottom: 0,
  },
  medsSection: { marginTop: 22 },
  medsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  medsBtn: {
    flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', gap: 8,
  },
  medsBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  medsBtnNo: { borderColor: C.amber, backgroundColor: C.amberSoft },
  medsBtnText: { fontSize: 13, fontWeight: '600', color: C.ink, textAlign: 'center' },
  medNameWrap: { marginTop: 10 },
  medNameInfo: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: C.amberSoft, borderRadius: 12, padding: 12,
  },
  medNameInfoText: { fontSize: 13, color: C.ink, flex: 1, lineHeight: 18 },
});
