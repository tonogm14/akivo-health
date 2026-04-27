import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { Card, Avatar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

export default function FeedbackScreen({ navigation }) {
  const { state } = useApp();
  const [rating, setRating]       = useState(0);
  const [tags, setTags]           = useState([]);
  const [tip, setTip]             = useState('S/ 5');
  const [submitting, setSubmitting] = useState(false);

  const doctorName = state.assignedDoctor?.name || 'Tu doctor';

  const toggle = (t) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  const positiveTags = ['Puntual', 'Amable', 'Explicó bien', 'Profesional', 'Limpio', 'Rápido'];
  const negativeTags = ['Tardó mucho', 'Poco claro', 'Trato distante', 'Precio alto'];

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!state.visitId) {
      navigation.replace('Home');
      return;
    }

    setSubmitting(true);
    try {
      const tipAmount = parseFloat(tip.replace('S/ ', '')) || 0;
      const headers = { 'Content-Type': 'application/json' };
      if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

      const res = await fetch(`${API_BASE}/reviews/${state.visitId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, tags, tip: tipAmount }),
      });

      if (!res.ok && res.status !== 409) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al enviar reseña');
      }

      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo enviar la reseña. Inténtalo más tarde.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topRow}>
        <TouchableOpacity onPress={() => navigation.replace('Home')}>
          <Text style={s.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={s.checkCircle}>
            <Feather name="check" size={36} color={C.green} />
          </View>
          <Text style={s.title}>¡Visita terminada!</Text>
          <Text style={s.sub}>Esperamos que te sientas mejor.</Text>
        </View>

        <Card pad={18}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar name={doctorName} size={52} />
            <View>
              <Text style={s.drName}>{doctorName}</Text>
              <Text style={s.question}>¿Cómo fue la atención?</Text>
            </View>
          </View>

          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => { setRating(n); setTags([]); }}
                activeOpacity={0.8}
                style={[s.starBtn, rating === n && s.starBtnSel]}
              >
                <Feather
                  name="star"
                  size={38}
                  color={n <= rating ? '#F5A623' : C.lineStrong}
                  fill={n <= rating ? '#F5A623' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <View>
              <Text style={s.tagQuestion}>
                {rating >= 4 ? '¿Qué estuvo bien?' : '¿Qué podemos mejorar?'}
              </Text>
              <View style={s.tagsRow}>
                {(rating >= 4 ? positiveTags : negativeTags).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggle(t)}
                    activeOpacity={0.8}
                    style={[s.tagBtn, tags.includes(t) && s.tagBtnSel]}
                  >
                    <Text style={[s.tagText, tags.includes(t) && { color: C.blueDark }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card pad={16} style={{ marginTop: 12 }}>
          <Text style={s.tipTitle}>¿Quieres dejar propina?</Text>
          <View style={s.tipsRow}>
            {['S/ 0', 'S/ 5', 'S/ 10', 'S/ 20'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTip(t)}
                activeOpacity={0.8}
                style={[s.tipBtn, tip === t && s.tipBtnSel]}
              >
                <Text style={[s.tipText, tip === t && { color: C.blueDark }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      <BottomBar>
        <PrimaryButton
          variant="green"
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : 'Enviar y terminar'}
        </PrimaryButton>
      </BottomBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topRow: { paddingHorizontal: 20, paddingVertical: 14, alignItems: 'flex-end' },
  skipText: { fontSize: 14, fontWeight: '600', color: C.inkSoft },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 10, paddingBottom: 20 },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.greenSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },
  sub: { fontSize: 14, color: C.inkSoft, marginTop: 6 },
  drName: { fontSize: 15, fontWeight: '700', color: C.ink },
  question: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  starBtn: { padding: 4 },
  starBtnSel: { transform: [{ scale: 1.12 }] },
  tagQuestion: { fontSize: 13, fontWeight: '600', color: C.inkSoft, marginBottom: 10, marginTop: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  tagBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  tagText: { fontSize: 13, fontWeight: '600', color: C.ink },
  tipTitle: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 10 },
  tipsRow: { flexDirection: 'row', gap: 8 },
  tipBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center',
  },
  tipBtnSel: { borderColor: C.blue, backgroundColor: C.blueSoft },
  tipText: { fontSize: 14, fontWeight: '700', color: C.ink },
});
