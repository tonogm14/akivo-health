import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';

function TopBar({ title, subtitle, onBack }) {
  return (
    <View style={tb.wrap}>
      <TouchableOpacity style={tb.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={tb.title}>{title}</Text>
        {subtitle && <Text style={tb.sub}>{subtitle}</Text>}
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

export default function PatientDetailScreen({ navigation }) {
  const { state } = useApp();
  const visit = state.activeVisit || {};
  const pt    = visit.patientData || {};

  const initials = (visit.patient || 'P')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const phone    = visit.phone || pt.phone || null;
  const flags    = pt.medical_flags?.length ? pt.medical_flags : [];
  const symptoms = (visit.symptoms || []).filter(Boolean);
  const complaint = symptoms.length ? symptoms.join(', ') : '—';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Ficha de paciente"
        subtitle={visit.patient}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.patientName}>{visit.patient}</Text>
              <Text style={s.patientMeta}>
                {visit.gender ? `${visit.gender} · ` : ''}
                {visit.age ? `${visit.age} años` : pt.age_group || ''}
                {visit.dni ? ` · DNI ${visit.dni}` : ''}
              </Text>
              {flags.length > 0 && (
                <View style={s.chips}>
                  {flags.slice(0, 3).map((f, i) => (
                    <View key={i} style={[s.chip, { backgroundColor: i === 0 ? C.redSoft : C.amberSoft }]}>
                      <Text style={[s.chipTxt, { color: i === 0 ? C.red : '#8A5A0D' }]}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={s.ctaRow}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: C.green }]}
              onPress={() => phone && Linking.openURL(`tel:${phone}`)}
              activeOpacity={0.85}
            >
              <Icons.Phone size={16} color="#fff" />
              <Text style={s.ctaBtnTxt}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: '#25D366' }]}
              onPress={() => phone && Linking.openURL(`https://wa.me/${phone.replace(/\D/g,'')}`)}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnTxt}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DIRECCIÓN</Text>
          <View style={s.card}>
            <View style={s.addressRow}>
              <View style={s.iconBox}>
                <Icons.Map size={18} color={C.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.addressMain}>{visit.address || '—'}</Text>
                {pt.notes ? (
                  <Text style={s.addressNote}>{pt.notes}</Text>
                ) : (
                  <Text style={s.addressNote}>
                    Primer piso con reja. El intercomunicador no suena, llamar al celular.
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={s.mapBtn} activeOpacity={0.8}>
              <Icons.Nav size={14} color={C.blue} />
              <Text style={s.mapBtnTxt}>Abrir en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chief complaint */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>MOTIVO DE CONSULTA</Text>
          <View style={s.card}>
            <Text style={s.complaintTitle}>{complaint}</Text>
            {pt.notes && (
              <Text style={s.complaintBody}>{pt.notes}</Text>
            )}
          </View>
        </View>

        {/* Medical history */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ANTECEDENTES MÉDICOS</Text>
          <View style={s.listCard}>
            {[
              { label: 'Alergias',          value: flags[0] || 'Sin alergias conocidas', color: C.red },
              { label: 'Condiciones crónicas', value: flags[1] || 'Ninguna referida',    color: null },
              { label: 'Medicación actual', value: 'Ver notas del paciente',             color: null },
              { label: 'Última visita',     value: 'Primera consulta',                   soft: true },
            ].map((r, i, arr) => (
              <View key={i} style={[s.listRow, i < arr.length - 1 && s.listBorder]}>
                <Text style={s.listLabel}>{r.label.toUpperCase()}</Text>
                <Text style={[s.listValue, r.color && { color: r.color }, r.soft && { fontWeight: '500', color: C.inkSoft }]}>
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.startBtn}
            onPress={() => navigation.navigate('Consultation')}
            activeOpacity={0.85}
          >
            <Text style={s.startBtnTxt}>Iniciar consulta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const tb = StyleSheet.create({
  wrap:    { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6,
             backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title:   { fontSize: 15, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },
  sub:     { fontSize: 11, color: C.inkSoft, marginTop: 1 },
});

const s = StyleSheet.create({
  hero:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line,
                paddingHorizontal: 18, paddingTop: 22, paddingBottom: 18 },
  heroRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18 },
  avatar:     { width: 68, height: 68, borderRadius: 34, backgroundColor: C.blueSoft,
                alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: C.blue },
  patientName:{ fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  patientMeta:{ fontSize: 13, color: C.inkSoft, marginTop: 3 },
  chips:      { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  chip:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipTxt:    { fontSize: 11, fontWeight: '700' },
  ctaRow:     { flexDirection: 'row', gap: 10 },
  ctaBtn:     { flex: 1, padding: 12, borderRadius: 12, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', gap: 6 },
  ctaBtnTxt:  { fontSize: 14, fontWeight: '700', color: '#fff' },

  section:    { paddingHorizontal: 18, paddingTop: 14 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },

  card:       { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconBox:    { width: 36, height: 36, borderRadius: 10, backgroundColor: C.blueSoft,
                alignItems: 'center', justifyContent: 'center' },
  addressMain:{ fontSize: 14, fontWeight: '700', color: C.ink },
  addressNote:{ fontSize: 12, color: C.inkSoft, marginTop: 4, lineHeight: 18 },
  mapBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.blue, backgroundColor: C.blueSoft },
  mapBtnTxt:  { fontSize: 13, fontWeight: '700', color: C.blue },

  complaintTitle:{ fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 6 },
  complaintBody: { fontSize: 13, color: C.inkSoft, lineHeight: 20 },

  listCard:   { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  listRow:    { paddingHorizontal: 16, paddingVertical: 12 },
  listBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  listLabel:  { fontSize: 11, color: C.inkMuted, fontWeight: '700', letterSpacing: 0.5 },
  listValue:  { fontSize: 13.5, fontWeight: '700', color: C.ink, marginTop: 2 },

  startBtn:   { backgroundColor: C.blue, borderRadius: 14, padding: 16, alignItems: 'center',
                shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 6 },
  startBtnTxt:{ fontSize: 16, fontWeight: '700', color: '#fff' },
});
