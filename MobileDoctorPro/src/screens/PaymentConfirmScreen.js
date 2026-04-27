import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

export default function PaymentConfirmScreen({ navigation }) {
  const { state, setState } = useApp();

  const handleDone = async () => {
    const visitId = state.activeVisit?.id;
    if (visitId) {
      try {
        await fetch(`${API_BASE}/visits/${visitId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });
      } catch (_) {}
      setState(s => ({ ...s, activeVisit: null }));
    }
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={pc.topBar}>
        <View style={{ width: 40 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={pc.topTitle}>Cobro</Text>
          <Text style={pc.topSub}>Paso final</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 14 }}>
        {/* Success card */}
        <View style={pc.successCard}>
          <View style={pc.successTop}>
            <View style={pc.checkCircle}>
              <Icons.Check size={34} color="#fff" sw={3} />
            </View>
            <Text style={pc.successTitle}>Visita completada</Text>
            <Text style={pc.successSub}>El paciente recibió su informe y receta</Text>
          </View>

          <View style={pc.breakdown}>
            <Text style={pc.breakdownTitle}>TU COBRO</Text>
            {[
              { l: 'Tarifa base de consulta',   v: 'S/ 85.00',   red: false, green: false },
              { l: 'Comisión Doctor House (18%)',v: '– S/ 15.30', red: true,  green: false },
              { l: 'Propina del paciente',       v: '+ S/ 5.00',  red: false, green: true  },
            ].map((r, i) => (
              <View key={i} style={pc.breakRow}>
                <Text style={pc.breakLabel}>{r.l}</Text>
                <Text style={[pc.breakVal, r.red && { color: C.red }, r.green && { color: C.green }]}>
                  {r.v}
                </Text>
              </View>
            ))}
            <View style={pc.totalRow}>
              <Text style={pc.totalLabel}>Tu neto</Text>
              <Text style={pc.totalVal}>S/ 74.70</Text>
            </View>
          </View>
        </View>

        {/* Payment method */}
        <View style={{ marginBottom: 14 }}>
          <Text style={pc.sectionLabel}>PAGADO POR EL PACIENTE CON</Text>
          <View style={pc.payCard}>
            <View style={pc.yapeIcon}>
              <Text style={pc.yapeY}>Y</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={pc.yapeTitle}>Yape</Text>
              <Text style={pc.yapeSub}>Pagado al momento · ID YP-3471</Text>
            </View>
            <View style={pc.recibidoBadge}>
              <Text style={pc.recibidoTxt}>Recibido</Text>
            </View>
          </View>
        </View>

        {/* Feedback */}
        <View style={{ marginBottom: 14 }}>
          <Text style={pc.sectionLabel}>¿CÓMO FUE LA VISITA?</Text>
          <View style={pc.emojiCard}>
            <View style={pc.emojiRow}>
              {['😔', '😐', '🙂', '😀', '🤩'].map((e, i) => (
                <TouchableOpacity
                  key={i}
                  style={[pc.emojiBtn, i === 4 && pc.emojiBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={pc.emojiHint}>Tu feedback nos ayuda a mejorar</Text>
          </View>
        </View>
      </ScrollView>

      <View style={pc.footer}>
        <TouchableOpacity style={pc.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <Text style={pc.doneBtnTxt}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  topBar:       { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6,
                  backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  topTitle:     { fontSize: 15, fontWeight: '700', color: C.ink },
  topSub:       { fontSize: 11, color: C.inkSoft, marginTop: 1 },

  successCard:  { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: C.line,
                  overflow: 'hidden', marginBottom: 14 },
  successTop:   { backgroundColor: C.greenSoft, padding: 26, alignItems: 'center' },
  checkCircle:  { width: 64, height: 64, borderRadius: 32, backgroundColor: C.green,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  successTitle: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  successSub:   { fontSize: 13, color: C.inkSoft, marginTop: 4 },

  breakdown:    { padding: 18, borderTopWidth: 1, borderTopColor: C.line },
  breakdownTitle:{ fontSize: 11, fontWeight: '800', color: C.inkMuted, letterSpacing: 0.5,
                   textTransform: 'uppercase', marginBottom: 10 },
  breakRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  breakLabel:   { fontSize: 13, color: C.inkSoft },
  breakVal:     { fontSize: 14, fontWeight: '700', color: C.ink },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: C.lineStrong },
  totalLabel:   { fontSize: 14, fontWeight: '800', color: C.ink },
  totalVal:     { fontSize: 22, fontWeight: '800', color: C.green, letterSpacing: -0.5 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  payCard:      { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                  padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  yapeIcon:     { width: 42, height: 42, borderRadius: 12, backgroundColor: C.yape,
                  alignItems: 'center', justifyContent: 'center' },
  yapeY:        { fontSize: 15, fontWeight: '800', color: '#fff' },
  yapeTitle:    { fontSize: 13, fontWeight: '700', color: C.ink },
  yapeSub:      { fontSize: 11, color: C.inkSoft },
  recibidoBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.greenSoft },
  recibidoTxt:  { fontSize: 10, fontWeight: '800', color: C.green, textTransform: 'uppercase', letterSpacing: 0.5 },

  emojiCard:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16 },
  emojiRow:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  emojiBtn:     { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: C.line,
                  backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive:{ borderWidth: 2.5, borderColor: C.blue, backgroundColor: C.blueSoft, transform: [{ scale: 1.1 }] },
  emojiHint:    { fontSize: 12, color: C.inkSoft, textAlign: 'center', marginTop: 6 },

  footer:       { padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  doneBtn:      { backgroundColor: C.blue, borderRadius: 14, padding: 16, alignItems: 'center',
                  shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 6 },
  doneBtnTxt:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});
