import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import TabBar from '../components/TabBar';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { useApp } from '../AppContext';

const COMMISSION_RATE = 0.18;
const TAX_RATE        = 0.08;
const BASE_FEE        = 85;

function SummaryCard({ label, value, color }) {
  return (
    <View style={ec.sumCard}>
      <View style={[ec.sumIconWrap, { backgroundColor: color + '20' }]}>
        <Icons.Stats size={17} color={color} />
      </View>
      <Text style={ec.sumLabel}>{label.toUpperCase()}</Text>
      <Text style={ec.sumVal}>{value}</Text>
    </View>
  );
}

function fmt(n) {
  return Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function EarningsScreen({ navigation }) {
  const { state } = useApp();
  const today = state.today;

  const weekGross     = parseFloat(today.weekEarned  || 0);
  const monthGross    = parseFloat(today.monthEarned || 0);
  const todayGross    = parseFloat(today.earned      || 0);
  const weekVisits    = parseInt(today.weekVisits    || 0);

  const commission    = weekGross * COMMISSION_RATE;
  const taxes         = weekGross * TAX_RATE;
  const weekNet       = weekGross - commission - taxes;

  const currentMonth  = new Date().toLocaleString('es-PE', { month: 'long', year: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={ec.header}>
        <View style={ec.headerTop}>
          <Text style={ec.headerTitle}>Ganancias</Text>
          <View style={ec.monthBtn}>
            <Text style={ec.monthTxt}>{currentMonth}</Text>
          </View>
        </View>
        <Text style={ec.weekLabel}>ESTA SEMANA</Text>
        <View style={ec.weekRow}>
          <Text style={ec.weekVal}>S/ {fmt(weekGross)}</Text>
        </View>

        {/* Bar chart placeholder — replaced with stat pill when no history */}
        <View style={ec.chart}>
          {weekVisits === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', flex: 1 }}>
              Sin visitas esta semana
            </Text>
          ) : (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 28, fontWeight: '800' }}>
                {weekVisits}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>visitas completadas</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {/* Summary cards */}
        <View style={ec.sumGrid}>
          <SummaryCard label="Hoy"          value={`S/ ${fmt(todayGross)}`}   color={C.blue}  />
          <SummaryCard label="Este mes"     value={`S/ ${fmt(monthGross)}`}   color={C.blue}  />
          <SummaryCard label="Visitas sem." value={weekVisits}                 color={C.green} />
          <SummaryCard label="Neto sem."    value={`S/ ${fmt(weekNet)}`}      color={C.amber} />
        </View>

        {/* Breakdown */}
        <Text style={ec.sectionLabel}>DESGLOSE SEMANAL</Text>
        <View style={ec.breakCard}>
          {[
            { label: 'Visitas completadas',  value: `${weekVisits} × S/ ${BASE_FEE}`,    tot: `S/ ${fmt(weekGross)}` },
            { label: 'Comisión plataforma',  value: `${Math.round(COMMISSION_RATE*100)}% de S/ ${fmt(weekGross)}`, tot: `– S/ ${fmt(commission)}` },
            { label: 'Retención impuestos',  value: `${Math.round(TAX_RATE*100)}% IR 4ta categoría`, tot: `– S/ ${fmt(taxes)}` },
          ].map((r, i, arr) => (
            <View key={i} style={[ec.breakRow, i < arr.length - 1 && ec.breakBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={ec.breakLabel}>{r.label}</Text>
                <Text style={ec.breakSub}>{r.value}</Text>
              </View>
              <Text style={[ec.breakTot, r.tot.startsWith('–') && { color: C.red }]}>{r.tot}</Text>
            </View>
          ))}
          <View style={ec.netRow}>
            <Text style={ec.netLabel}>Neto a pagar</Text>
            <Text style={ec.netVal}>S/ {fmt(weekNet)}</Text>
          </View>
        </View>
      </ScrollView>

      <TabBar current="Earnings" navigation={navigation} />
    </View>
  );
}

const ec = StyleSheet.create({
  header:      { backgroundColor: C.ink, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 24 },
  headerTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  monthBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)' },
  monthTxt:    { fontSize: 12, fontWeight: '700', color: '#fff' },
  weekLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  weekRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  weekVal:     { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  chart:       { flexDirection: 'row', alignItems: 'center', height: 70, marginTop: 18, paddingHorizontal: 4 },

  sumGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  sumCard:     { width: '47%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
                 borderColor: C.line, padding: 14 },
  sumIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  sumLabel:    { fontSize: 11, color: C.inkMuted, fontWeight: '700', letterSpacing: 0.5 },
  sumVal:      { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.3, marginTop: 2 },

  sectionLabel:{ fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  breakCard:   { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  breakRow:    { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  breakBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  breakLabel:  { fontSize: 13, fontWeight: '700', color: C.ink },
  breakSub:    { fontSize: 11, color: C.inkSoft, marginTop: 1 },
  breakTot:    { fontSize: 14, fontWeight: '800', color: C.ink },
  netRow:      { padding: 14, backgroundColor: C.blueSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel:    { fontSize: 13, fontWeight: '800', color: C.blueDark },
  netVal:      { fontSize: 18, fontWeight: '800', color: C.blueDark },
});
