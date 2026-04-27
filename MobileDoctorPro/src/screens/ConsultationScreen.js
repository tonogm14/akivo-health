import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE } from '../config';

function TopBar({ title, subtitle, onBack, onSave }) {
  return (
    <View style={tb.wrap}>
      <TouchableOpacity style={tb.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={tb.title}>{title}</Text>
        {subtitle && <Text style={tb.sub}>{subtitle}</Text>}
      </View>
      <TouchableOpacity style={tb.saveBtn} onPress={onSave} activeOpacity={0.8}>
        <Text style={tb.saveTxt}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

function VitalsPanel({ vitals, setVitals }) {
  const ROWS = [
    { k: 'temp',   label: 'Temperatura',      unit: '°C',   alertWhen: v => parseFloat(v) > 37.5 },
    { k: 'bp',     label: 'Presión arterial',  unit: 'mmHg' },
    { k: 'hr',     label: 'Frec. cardiaca',    unit: 'lpm' },
    { k: 'spo2',   label: 'SpO₂',              unit: '%' },
    { k: 'rr',     label: 'Frec. respiratoria',unit: 'rpm' },
    { k: 'weight', label: 'Peso',              unit: 'kg' },
  ];
  return (
    <View style={vs.card}>
      {ROWS.map((r, i) => {
        const alert = r.alertWhen?.(vitals[r.k]);
        return (
          <View key={r.k} style={[vs.row, i < ROWS.length - 1 && vs.border,
                                   alert && { backgroundColor: C.redSoft }]}>
            <View style={[vs.iconBox, { backgroundColor: alert ? '#fff' : C.bg }]}>
              <Icons.Thermometer size={18} color={alert ? C.red : C.inkSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={vs.label}>{r.label}</Text>
              {alert && <Text style={vs.alertTxt}>Fuera de rango normal</Text>}
            </View>
            <View style={vs.inputRow}>
              <TextInput
                value={vitals[r.k]}
                onChangeText={v => setVitals({ ...vitals, [r.k]: v })}
                placeholder="—"
                placeholderTextColor={C.inkMuted}
                keyboardType="decimal-pad"
                style={[vs.input, alert && { color: C.red }]}
              />
              <Text style={vs.unit}>{r.unit}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const SYMPTOM_SUGGESTIONS = ['Tos', 'Dolor abdominal', 'Náuseas', 'Vómitos', 'Diarrea', 'Disnea', 'Odinofagia', 'Rinorrea'];

function SymptomsPanel({ symptoms, setSymptoms }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={sy.card}>
        <Text style={sy.label}>SÍNTOMAS SELECCIONADOS</Text>
        <View style={sy.chips}>
          {symptoms.length === 0 && <Text style={{ fontSize: 12, color: C.inkMuted }}>Ninguno seleccionado</Text>}
          {symptoms.map(s => (
            <View key={s} style={sy.chip}>
              <Text style={sy.chipTxt}>{s}</Text>
              <TouchableOpacity
                style={sy.chipX}
                onPress={() => setSymptoms(symptoms.filter(x => x !== s))}
              >
                <Icons.X size={10} color="#fff" sw={2.5} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <View>
        <Text style={sy.label}>SUGERENCIAS FRECUENTES</Text>
        <View style={sy.suggestions}>
          {SYMPTOM_SUGGESTIONS.filter(s => !symptoms.includes(s)).map(s => (
            <TouchableOpacity
              key={s}
              style={sy.suggBtn}
              onPress={() => setSymptoms([...symptoms, s])}
              activeOpacity={0.7}
            >
              <Text style={sy.suggTxt}>+ {s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function DiagnosisPanel({ diagnosis, setDiagnosis }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={[vs.card, { padding: 16 }]}>
        <Text style={sy.label}>DIAGNÓSTICO PRINCIPAL</Text>
        <TextInput
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Buscar CIE-10 o escribir"
          placeholderTextColor={C.inkMuted}
          style={dx.input}
        />
        <View style={dx.badge}>
          <Icons.Doc size={12} color={C.blue} />
          <Text style={dx.badgeTxt}>CIE-10: J03.9</Text>
        </View>
      </View>

      <View style={{ padding: 14, borderRadius: 12, backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.blue + '30', flexDirection: 'row', gap: 12 }}>
        <Icons.Sparkle size={18} color={C.blue} />
        <Text style={{ flex: 1, fontSize: 12, color: C.ink, lineHeight: 18 }}>
          <Text style={{ fontWeight: '700' }}>Sugerencia clínica: </Text>
          con fiebre + cefalea + odinofagia, considera también amigdalitis viral (J03.8) y descarta mononucleosis si síntomas persisten &gt;7 días.
        </Text>
      </View>
    </View>
  );
}

function NotesPanel({ notes, setNotes }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={[vs.card, { padding: 16 }]}>
        <Text style={sy.label}>NOTAS CLÍNICAS</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Exploración física, hallazgos, evolución…"
          placeholderTextColor={C.inkMuted}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          style={dx.notesInput}
        />
      </View>
      <View>
        <Text style={sy.label}>PLANTILLAS RÁPIDAS</Text>
        {[
          'Abdomen blando, depresible, no doloroso a la palpación',
          'Pulmones claros a la auscultación, sin ruidos añadidos',
          'Neurológicamente intacto, consciente, orientado',
        ].map((t, i) => (
          <TouchableOpacity
            key={i}
            style={dx.templateBtn}
            onPress={() => setNotes(notes ? notes + '\n' + t : t)}
            activeOpacity={0.8}
          >
            <Text style={dx.templateTxt}>+ {t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const TABS = [
  { id: 'vitals',    label: 'Signos' },
  { id: 'symptoms',  label: 'Síntomas' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'notes',     label: 'Notas' },
];

export default function ConsultationScreen({ navigation }) {
  const { state, setState } = useApp();
  const [activeTab, setActiveTab] = useState('vitals');
  const [vitals, setVitals] = useState({ temp: '', bp: '', hr: '', spo2: '', rr: '', weight: '' });
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Record consultation start time when screen mounts (fallback if HomeScreen didn't stamp it)
  const consultationStartedAtRef = useRef(
    state.activeVisit?.consultation_started_at || new Date().toISOString()
  );

  const handleFinish = async () => {
    const consultation_started_at = consultationStartedAtRef.current;
    const consultation_finished_at = new Date().toISOString();

    // Save to context first — MedicalReportScreen depends on this
    setState(s => ({
      ...s,
      consultation: { vitals, symptoms, diagnosis, notes },
      activeVisit: {
        ...s.activeVisit,
        consultation_finished_at,
      },
    }));

    // POST report to API (non-blocking on failure)
    const visitId = state.activeVisit?.id;
    const token = state.authToken;
    if (visitId) {
      setSubmitting(true);
      try {
        await fetch(`${API_BASE}/visits/${visitId}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            temp: vitals.temp,
            bp: vitals.bp,
            hr: vitals.hr,
            spo2: vitals.spo2,
            rr: vitals.rr,
            weight: vitals.weight,
            diagnosis,
            clinical_notes: notes,
            consultation_started_at,
            consultation_finished_at,
          }),
        });
      } catch (err) {
        console.warn('[ConsultationScreen] Error al enviar reporte al API:', err);
      } finally {
        setSubmitting(false);
      }
    }

    navigation.navigate('MedicalReport');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Consulta"
        subtitle={`${state.activeVisit?.patient || 'Paciente'}${state.activeVisit?.age ? ` · ${state.activeVisit.age} años` : ''}`}
        onBack={() => navigation.goBack()}
        onSave={() => {}}
      />

      {/* Tab switcher */}
      <View style={cs.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[cs.tab, activeTab === t.id && cs.tabActive]}
            onPress={() => setActiveTab(t.id)}
            activeOpacity={0.8}
          >
            <Text style={[cs.tabTxt, activeTab === t.id && cs.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 24 }}>
        {activeTab === 'vitals'    && <VitalsPanel vitals={vitals} setVitals={setVitals} />}
        {activeTab === 'symptoms'  && <SymptomsPanel symptoms={symptoms} setSymptoms={setSymptoms} />}
        {activeTab === 'diagnosis' && <DiagnosisPanel diagnosis={diagnosis} setDiagnosis={setDiagnosis} />}
        {activeTab === 'notes'     && <NotesPanel notes={notes} setNotes={setNotes} />}
      </ScrollView>

      <View style={cs.footer}>
        <TouchableOpacity style={cs.saveBtn} activeOpacity={0.8}>
          <Text style={cs.saveBtnTxt}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cs.finishBtn, submitting && { opacity: 0.7 }]}
          onPress={handleFinish}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={cs.finishTxt}>Emitir informe</Text>
              <Icons.ChevR size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrap:    { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6,
             backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title:   { fontSize: 15, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },
  sub:     { fontSize: 11, color: C.inkSoft, marginTop: 1 },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
             backgroundColor: C.blueSoft },
  saveTxt: { fontSize: 11, fontWeight: '700', color: C.blueDark },
});

const cs = StyleSheet.create({
  tabBar:    { flexDirection: 'row', gap: 4, padding: 6, margin: 12,
               backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line },
  tab:       { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: C.blue },
  tabTxt:    { fontSize: 12, fontWeight: '700', color: C.inkSoft },
  tabTxtActive:{ color: '#fff' },
  footer:    { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 14,
               backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  saveBtn:   { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
               backgroundColor: '#fff', alignItems: 'center' },
  saveBtnTxt:{ fontSize: 14, fontWeight: '700', color: C.ink },
  finishBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: C.blue,
               flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
               shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 6 },
  finishTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

const vs = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  row:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: '#fff' },
  border:  { borderBottomWidth: 1, borderBottomColor: C.line },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label:   { fontSize: 13, fontWeight: '700', color: C.ink },
  alertTxt:{ fontSize: 11, fontWeight: '700', color: C.red, marginTop: 1 },
  inputRow:{ flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  input:   { width: 64, textAlign: 'right', fontSize: 18, fontWeight: '800', color: C.ink },
  unit:    { fontSize: 12, color: C.inkSoft, fontWeight: '600' },
});

const sy = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16 },
  label:       { fontSize: 11, color: C.inkMuted, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 40 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7,
                 borderRadius: 999, backgroundColor: C.blueSoft },
  chipTxt:     { fontSize: 12, fontWeight: '700', color: C.blueDark },
  chipX:       { width: 16, height: 16, borderRadius: 8, backgroundColor: C.blue,
                 alignItems: 'center', justifyContent: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggBtn:     { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                 borderWidth: 1.5, borderColor: C.lineStrong, backgroundColor: '#fff' },
  suggTxt:     { fontSize: 12, fontWeight: '600', color: C.inkSoft },
});

const dx = StyleSheet.create({
  input:       { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12,
                 fontSize: 15, fontWeight: '600', color: C.ink, marginBottom: 10 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6,
                 borderRadius: 8, backgroundColor: C.blueSoft, alignSelf: 'flex-start' },
  badgeTxt:    { fontSize: 11, fontWeight: '700', color: C.blue },
  notesInput:  { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12,
                 fontSize: 14, color: C.ink, minHeight: 160, lineHeight: 22 },
  templateBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: C.line,
                 backgroundColor: '#fff', marginBottom: 6 },
  templateTxt: { fontSize: 12, color: C.ink },
});
