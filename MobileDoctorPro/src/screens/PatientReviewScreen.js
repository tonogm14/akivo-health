import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE } from '../config';

const CRITERIA = [
  { id: 'punctuality',   label: 'Puntualidad',   sub: '¿El paciente estaba disponible a tiempo?' },
  { id: 'communication', label: 'Comunicación',  sub: '¿Describió bien sus síntomas y antecedentes?' },
  { id: 'cooperation',   label: 'Cooperación',   sub: '¿Siguió las instrucciones durante la consulta?' },
];

function StarRating({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.65} hitSlop={6}>
          <Text style={{ fontSize: 28, color: n <= value ? C.amber : C.lineStrong }}>
            {n <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PatientReviewScreen({ navigation }) {
  const { state, setState } = useApp();
  const [ratings, setRatings]   = useState({ punctuality: 0, communication: 0, cooperation: 0 });
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const visit   = state.activeVisit || {};
  const patient = visit.patient || 'Paciente';
  const initials = patient.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P';

  const allRated = CRITERIA.every(c => ratings[c.id] > 0);
  const overall  = allRated
    ? Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / CRITERIA.length) * 10) / 10
    : 0;

  const finishAndGoHome = () => {
    setState(s => ({ ...s, activeVisit: null }));
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleSubmit = async () => {
    const visitId = visit.id;
    const token   = state.authToken;

    setSubmitting(true);
    if (visitId) {
      try {
        await fetch(`${API_BASE}/visits/${visitId}/doctor-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ratings, comment, overall }),
        });
      } catch (err) {
        console.warn('[PatientReviewScreen] Error al enviar reseña:', err);
      }
    }
    setSubmitting(false);
    finishAndGoHome();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={pr.topBar}>
        <View style={{ width: 44 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={pr.topTitle}>Reseña del paciente</Text>
          <Text style={pr.topSub}>Último paso</Text>
        </View>
        <TouchableOpacity style={pr.skipBtn} onPress={finishAndGoHome} activeOpacity={0.7}>
          <Text style={pr.skipTxt}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 14 }}>
        {/* Patient card */}
        <View style={pr.patientCard}>
          <View style={pr.patientAvatar}>
            <Text style={pr.patientInitials}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pr.patientName}>{patient}</Text>
            <Text style={pr.patientSub}>Visita completada · califica tu experiencia</Text>
          </View>
          {overall > 0 && (
            <View style={pr.overallBadge}>
              <Text style={{ fontSize: 12 }}>★</Text>
              <Text style={pr.overallVal}>{overall.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Criteria ratings */}
        <View style={pr.criteriaCard}>
          <Text style={pr.sectionLabel}>CALIFÍCALO EN</Text>
          {CRITERIA.map((c, i) => (
            <View key={c.id} style={[pr.criterionRow, i < CRITERIA.length - 1 && pr.criterionBorder]}>
              <View style={{ marginBottom: 10 }}>
                <Text style={pr.criterionLabel}>{c.label}</Text>
                <Text style={pr.criterionSub}>{c.sub}</Text>
              </View>
              <StarRating value={ratings[c.id]} onChange={v => setRatings(r => ({ ...r, [c.id]: v }))} />
            </View>
          ))}
        </View>

        {/* Optional comment */}
        <View style={pr.commentCard}>
          <Text style={pr.sectionLabel}>COMENTARIO (OPCIONAL)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Algún detalle sobre la visita que quieras registrar…"
            placeholderTextColor={C.inkMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={pr.commentInput}
          />
        </View>

        {!allRated && (
          <View style={pr.hint}>
            <Icons.Sparkle size={14} color={C.inkMuted} />
            <Text style={pr.hintTxt}>Califica todos los criterios para enviar tu reseña</Text>
          </View>
        )}
      </ScrollView>

      <View style={pr.footer}>
        <TouchableOpacity style={pr.skipFooterBtn} onPress={finishAndGoHome} activeOpacity={0.8}>
          <Text style={pr.skipFooterTxt}>Omitir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[pr.submitBtn, (!allRated || submitting) && { opacity: 0.45 }]}
          onPress={handleSubmit}
          disabled={!allRated || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={pr.submitBtnTxt}>Enviar reseña</Text>
              <Icons.Check size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pr = StyleSheet.create({
  topBar:         { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6,
                    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  topTitle:       { fontSize: 15, fontWeight: '700', color: C.ink },
  topSub:         { fontSize: 11, color: C.inkSoft, marginTop: 1 },
  skipBtn:        { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  skipTxt:        { fontSize: 12.5, fontWeight: '600', color: C.inkMuted },

  patientCard:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  patientAvatar:  { width: 54, height: 54, borderRadius: 27, backgroundColor: C.blueSoft,
                    alignItems: 'center', justifyContent: 'center' },
  patientInitials:{ fontSize: 18, fontWeight: '800', color: C.blue },
  patientName:    { fontSize: 16, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  patientSub:     { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
  overallBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4,
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: C.amberSoft },
  overallVal:     { fontSize: 16, fontWeight: '800', color: C.amber },

  sectionLabel:   { fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1,
                    textTransform: 'uppercase', marginBottom: 12 },
  criteriaCard:   { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                    padding: 16, marginBottom: 12 },
  criterionRow:   { paddingVertical: 14 },
  criterionBorder:{ borderBottomWidth: 1, borderBottomColor: C.line },
  criterionLabel: { fontSize: 14, fontWeight: '700', color: C.ink },
  criterionSub:   { fontSize: 12, color: C.inkSoft, marginTop: 2 },

  commentCard:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                    padding: 16, marginBottom: 12 },
  commentInput:   { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12,
                    fontSize: 14, color: C.ink, minHeight: 90, lineHeight: 22 },

  hint:           { flexDirection: 'row', alignItems: 'center', gap: 8,
                    padding: 12, borderRadius: 10, backgroundColor: C.bg },
  hintTxt:        { fontSize: 12, color: C.inkMuted },

  footer:         { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 14,
                    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  skipFooterBtn:  { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5,
                    borderColor: C.line, backgroundColor: '#fff', alignItems: 'center' },
  skipFooterTxt:  { fontSize: 14, fontWeight: '700', color: C.ink },
  submitBtn:      { flex: 2, padding: 14, borderRadius: 14, backgroundColor: C.blue,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    shadowColor: C.blue, shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 },
  submitBtnTxt:   { fontSize: 15, fontWeight: '800', color: '#fff' },
});
