import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE } from '../config';

function TopBar({ title, subtitle, onBack }) {
  return (
    <View style={tb.wrap}>
      <TouchableOpacity style={tb.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={tb.title}>{title}</Text>
        {!!subtitle && <Text style={tb.sub}>{subtitle}</Text>}
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

const STEPS = [
  { id: 'vitals',    label: 'Signos vitales' },
  { id: 'symptoms',  label: 'Síntomas' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'notes',     label: 'Notas y plan' },
];

function StepIndicator({ step }) {
  return (
    <View style={si.wrap}>
      <View style={si.headerRow}>
        <Text style={si.kicker}>PASO {step + 1} DE {STEPS.length}</Text>
        <Text style={si.stepName}>{STEPS[step].label}</Text>
      </View>
      <View style={si.bar}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              si.segment,
              i < step  && si.segDone,
              i === step && si.segActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function VitalsPanel({ vitals, setVitals }) {
  const ROWS = [
    { k: 'temp',   label: 'Temperatura',       unit: '°C',   alertWhen: v => parseFloat(v) > 37.5 },
    { k: 'bp',     label: 'Presión arterial',   unit: 'mmHg' },
    { k: 'hr',     label: 'Frec. cardiaca',     unit: 'lpm'  },
    { k: 'spo2',   label: 'SpO₂',               unit: '%'    },
    { k: 'rr',     label: 'Frec. respiratoria', unit: 'rpm'  },
    { k: 'weight', label: 'Peso',               unit: 'kg'   },
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

const SYMPTOM_SUGGESTIONS = [
  'Tos', 'Dolor abdominal', 'Náuseas', 'Vómitos',
  'Diarrea', 'Disnea', 'Odinofagia', 'Rinorrea',
  'Cefalea', 'Fiebre', 'Malestar general', 'Dolor de garganta',
];

function SymptomsPanel({ symptoms, setSymptoms }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={sy.card}>
        <Text style={sy.label}>SÍNTOMAS SELECCIONADOS</Text>
        <View style={sy.chips}>
          {symptoms.length === 0 && (
            <Text style={{ fontSize: 12, color: C.inkMuted }}>Ninguno seleccionado</Text>
          )}
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
          placeholder="Buscar CIE-10 o escribir diagnóstico"
          placeholderTextColor={C.inkMuted}
          style={dx.input}
        />
        <View style={dx.badge}>
          <Icons.Doc size={12} color={C.blue} />
          <Text style={dx.badgeTxt}>CIE-10: J03.9</Text>
        </View>
      </View>

      <View style={{ padding: 14, borderRadius: 12, backgroundColor: C.blueSoft,
                     borderWidth: 1, borderColor: C.blue + '30', flexDirection: 'row', gap: 12 }}>
        <Icons.Sparkle size={18} color={C.blue} />
        <Text style={{ flex: 1, fontSize: 12, color: C.ink, lineHeight: 18 }}>
          <Text style={{ fontWeight: '700' }}>Sugerencia clínica: </Text>
          con fiebre + cefalea + odinofagia, considera también amigdalitis viral (J03.8) y descarta mononucleosis si síntomas persisten &gt;7 días.
        </Text>
      </View>
    </View>
  );
}

const QUICK_RECS = [
  'Reposo relativo 48 horas',
  'Hidratación abundante',
  'Evitar esfuerzos físicos',
  'Control de temperatura cada 6 h',
  'Dieta blanda',
  'Evitar automedicación',
];

const FOLLOW_OPTIONS = ['3 días', '5 días', '7 días', '10 días', '15 días', '1 mes'];

function NotesAndPlanPanel({ notes, setNotes, recommendations, setRecommendations, followUp, setFollowUp }) {
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
          numberOfLines={6}
          style={[dx.notesInput, { textAlignVertical: 'top' }]}
        />
        <Text style={[sy.label, { marginTop: 10 }]}>PLANTILLAS RÁPIDAS</Text>
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

      <View style={[vs.card, { padding: 16 }]}>
        <Text style={sy.label}>RECOMENDACIONES AL PACIENTE</Text>
        <View style={sy.chips}>
          {recommendations.length === 0 && (
            <Text style={{ fontSize: 12, color: C.inkMuted }}>Ninguna añadida</Text>
          )}
          {recommendations.map(r => (
            <View key={r} style={sy.chip}>
              <Text style={sy.chipTxt}>{r}</Text>
              <TouchableOpacity
                style={sy.chipX}
                onPress={() => setRecommendations(recommendations.filter(x => x !== r))}
              >
                <Icons.X size={10} color="#fff" sw={2.5} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {QUICK_RECS.filter(r => !recommendations.includes(r)).map(r => (
            <TouchableOpacity
              key={r}
              style={sy.suggBtn}
              onPress={() => setRecommendations([...recommendations, r])}
              activeOpacity={0.7}
            >
              <Text style={sy.suggTxt}>+ {r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[vs.card, { padding: 16 }]}>
        <Text style={sy.label}>SEGUIMIENTO</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FOLLOW_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[dx.followBtn, followUp === opt && dx.followBtnActive]}
              onPress={() => setFollowUp(opt)}
              activeOpacity={0.8}
            >
              <Text style={[dx.followBtnTxt, followUp === opt && { color: '#fff' }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!followUp && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
            padding: 10, borderRadius: 10, backgroundColor: C.amberSoft }}>
            <Icons.Calendar size={16} color={C.amber} />
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#8A5A0D' }}>
              Seguimiento en {followUp} o antes si empeora
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ConsultationScreen({ navigation }) {
  const { state, setState } = useApp();
  const [step, setStep]                   = useState(0);
  const [vitals, setVitals]               = useState({ temp: '', bp: '', hr: '', spo2: '', rr: '', weight: '' });
  const [symptoms, setSymptoms]           = useState([]);
  const [diagnosis, setDiagnosis]         = useState('');
  const [notes, setNotes]                 = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [followUp, setFollowUp]           = useState('7 días');
  const [submitting, setSubmitting]       = useState(false);
  const scrollRef                         = useRef(null);

  const consultationStartedAtRef = useRef(
    state.activeVisit?.consultation_started_at || new Date().toISOString()
  );

  const handleFinish = async () => {
    const consultation_started_at  = consultationStartedAtRef.current;
    const consultation_finished_at = new Date().toISOString();

    setState(s => ({
      ...s,
      consultation: { vitals, symptoms, diagnosis, notes, recommendations, followUp },
      activeVisit:  { ...s.activeVisit, consultation_finished_at },
    }));

    const visitId = state.activeVisit?.id;
    const token   = state.authToken;
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
            temp: vitals.temp, bp: vitals.bp, hr: vitals.hr,
            spo2: vitals.spo2, rr: vitals.rr, weight: vitals.weight,
            diagnosis,
            clinical_notes: notes,
            consultation_started_at,
            consultation_finished_at,
          }),
        });
      } catch (err) {
        console.warn('[ConsultationScreen] Error al enviar reporte:', err);
      } finally {
        setSubmitting(false);
      }
    }

    navigation.navigate('MedicalReport');
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      navigation.goBack();
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Consulta"
        subtitle={`${state.activeVisit?.patient || 'Paciente'}${state.activeVisit?.age ? ` · ${state.activeVisit.age} años` : ''}`}
        onBack={handleBack}
      />

      <StepIndicator step={step} />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
      >
        {step === 0 && <VitalsPanel vitals={vitals} setVitals={setVitals} />}
        {step === 1 && <SymptomsPanel symptoms={symptoms} setSymptoms={setSymptoms} />}
        {step === 2 && <DiagnosisPanel diagnosis={diagnosis} setDiagnosis={setDiagnosis} />}
        {step === 3 && (
          <NotesAndPlanPanel
            notes={notes}               setNotes={setNotes}
            recommendations={recommendations} setRecommendations={setRecommendations}
            followUp={followUp}         setFollowUp={setFollowUp}
          />
        )}
      </ScrollView>

      <View style={cs.footer}>
        {step > 0 && (
          <TouchableOpacity style={cs.backBtn} onPress={handleBack} activeOpacity={0.8}>
            <Icons.ChevL size={18} color={C.ink} />
            <Text style={cs.backBtnTxt}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[cs.nextBtn, submitting && { opacity: 0.7 }]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={cs.nextBtnTxt}>
                {isLast ? 'Emitir informe' : 'Continuar'}
              </Text>
              <Icons.ChevR size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const tb = StyleSheet.create({
  wrap:    { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6,
             backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title:   { fontSize: 15, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },
  sub:     { fontSize: 11, color: C.inkSoft, marginTop: 1 },
});

const si = StyleSheet.create({
  wrap:      { backgroundColor: '#fff', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12,
               borderBottomWidth: 1, borderBottomColor: C.line },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 10 },
  kicker:    { fontSize: 10, fontWeight: '800', color: C.inkMuted, letterSpacing: 1.5 },
  stepName:  { fontSize: 16, fontWeight: '800', color: C.ink, letterSpacing: -0.3, flex: 1 },
  bar:       { flexDirection: 'row', gap: 4 },
  segment:   { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.lineStrong },
  segDone:   { backgroundColor: C.blue + '55' },
  segActive: { backgroundColor: C.blue },
});

const cs = StyleSheet.create({
  footer:    { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 14,
               backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  backBtn:   { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
               borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row',
               alignItems: 'center', justifyContent: 'center', gap: 6 },
  backBtnTxt:{ fontSize: 14, fontWeight: '700', color: C.ink },
  nextBtn:   { flex: 1, padding: 14, borderRadius: 14, backgroundColor: C.blue,
               flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
               shadowColor: C.blue, shadowOffset: { width: 0, height: 6 },
               shadowOpacity: 0.5, shadowRadius: 16, elevation: 6 },
  nextBtnTxt:{ fontSize: 15, fontWeight: '800', color: '#fff' },
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
  label:       { fontSize: 11, color: C.inkMuted, fontWeight: '700', letterSpacing: 1,
                 textTransform: 'uppercase', marginBottom: 8 },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 40 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12,
                 paddingVertical: 7, borderRadius: 999, backgroundColor: C.blueSoft },
  chipTxt:     { fontSize: 12, fontWeight: '700', color: C.blueDark },
  chipX:       { width: 16, height: 16, borderRadius: 8, backgroundColor: C.blue,
                 alignItems: 'center', justifyContent: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggBtn:     { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                 borderWidth: 1.5, borderColor: C.lineStrong, backgroundColor: '#fff' },
  suggTxt:     { fontSize: 12, fontWeight: '600', color: C.inkSoft },
});

const dx = StyleSheet.create({
  input:          { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12,
                    fontSize: 15, fontWeight: '600', color: C.ink, marginBottom: 10 },
  badge:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6,
                    borderRadius: 8, backgroundColor: C.blueSoft, alignSelf: 'flex-start' },
  badgeTxt:       { fontSize: 11, fontWeight: '700', color: C.blue },
  notesInput:     { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12,
                    fontSize: 14, color: C.ink, minHeight: 140, lineHeight: 22, marginBottom: 12 },
  templateBtn:    { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: C.line,
                    backgroundColor: '#fff', marginBottom: 6 },
  templateTxt:    { fontSize: 12, color: C.ink },
  followBtn:      { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
                    borderWidth: 1.5, borderColor: C.lineStrong, backgroundColor: '#fff' },
  followBtnActive:{ borderColor: C.blue, backgroundColor: C.blue },
  followBtnTxt:   { fontSize: 12.5, fontWeight: '700', color: C.inkSoft },
});
