import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE } from '../config';

function TopBar({ onBack }) {
  return (
    <View style={tb.wrap}>
      <TouchableOpacity style={tb.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={tb.title}>Informe médico</Text>
        <Text style={tb.sub}>Revisar antes de enviar</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

function SectionTitle({ children }) {
  return (
    <Text style={rp.sectionTitle}>{children}</Text>
  );
}

function MedRow({ med, idx }) {
  return (
    <View style={rp.medCard}>
      <View style={rp.medHeader}>
        <View style={rp.medNum}>
          <Text style={rp.medNumTxt}>{idx}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <Text style={rp.medDrug}>{med.drug}</Text>
            <Text style={rp.medDose}>{med.dose}</Text>
          </View>
          <Text style={rp.medForm}>{med.form}</Text>
        </View>
      </View>
      <View style={rp.medMeta}>
        <View style={{ flex: 1 }}>
          <Text style={rp.metaKey}>FRECUENCIA</Text>
          <Text style={rp.metaVal}>{med.freq}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rp.metaKey}>DURACIÓN</Text>
          <Text style={rp.metaVal}>{med.duration}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rp.metaKey}>CANTIDAD</Text>
          <Text style={rp.metaVal}>{med.qty} ud</Text>
        </View>
      </View>
      {med.instructions && (
        <Text style={rp.medInstr}>↳ {med.instructions}</Text>
      )}
    </View>
  );
}

export default function MedicalReportScreen({ navigation }) {
  const { state } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const doctor = state.doctor       || {};
  const visit  = state.activeVisit  || {};
  const cons   = state.consultation || {};
  const rx     = state.consultation?.prescription || [];

  const handleSend = async () => {
    const visitId = visit.id;
    const token = state.authToken;

    if (visitId && rx.length > 0) {
      setSubmitting(true);
      try {
        await fetch(`${API_BASE}/visits/${visitId}/prescriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            prescriptions: rx.map(item => ({
              drug_name:     item.drug_name || item.drug || item.name || 'Medicamento',
              dose:          item.dose || item.dosage || null,
              frequency:     item.frequency || item.freq || null,
              duration_days: item.duration_days
                ? parseInt(item.duration_days)
                : item.duration
                  ? parseInt(item.duration)
                  : null,
              instructions:  item.instructions || item.notes || null,
            })),
          }),
        });
      } catch (err) {
        console.warn('[MedicalReportScreen] Error al enviar receta al API:', err);
      } finally {
        setSubmitting(false);
      }
    }

    navigation.navigate('UploadRx');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 14 }}>
        <View style={rp.docWrap}>
          {/* Header strip */}
          <View style={rp.docHeader}>
            <View>
              <Text style={rp.docBrand}>Doctor House</Text>
              <Text style={rp.docBrandSub}>INFORME MÉDICO</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={rp.folioLabel}>FOLIO</Text>
              <Text style={rp.folioVal}>DH-2604-8812</Text>
            </View>
          </View>

          <View style={rp.docBody}>
            {/* Patient + date */}
            <View style={[rp.grid2, rp.dashed]}>
              <View>
                <Text style={rp.fieldKey}>PACIENTE</Text>
                <Text style={rp.fieldMain}>{visit.patient}</Text>
                <Text style={rp.fieldSub}>{visit.gender} · {visit.age} años · DNI {visit.dni}</Text>
              </View>
              <View>
                <Text style={rp.fieldKey}>FECHA Y HORA</Text>
                <Text style={rp.fieldMain}>24 abril 2026</Text>
                <Text style={rp.fieldSub}>14:52 – 15:14 hrs</Text>
              </View>
            </View>

            {/* Doctor */}
            <View style={[rp.doctorRow, rp.dashed]}>
              <View style={rp.drAvatar}>
                <Text style={rp.drAvatarTxt}>{doctor.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={rp.drName}>{doctor.name}</Text>
                <Text style={rp.drSub}>{doctor.specialty} · CMP {doctor.cmp}</Text>
              </View>
              <View style={rp.firmadoBadge}>
                <Text style={rp.firmadoTxt}>Firmado digitalmente</Text>
              </View>
            </View>

            {/* Sections */}
            <View style={rp.dashed}>
              <SectionTitle>MOTIVO DE CONSULTA</SectionTitle>
              <Text style={rp.bodyTxt}>{cons.chiefComplaint}</Text>
            </View>

            <View style={rp.dashed}>
              <SectionTitle>SIGNOS VITALES</SectionTitle>
              <View style={rp.vitalsGrid}>
                {[
                  { l: 'T°',   v: cons.vitals.temp,  u: '°C',  alert: parseFloat(cons.vitals.temp) > 37.5 },
                  { l: 'PA',   v: cons.vitals.bp,    u: 'mmHg', alert: true },
                  { l: 'FC',   v: cons.vitals.hr,    u: 'lpm' },
                  { l: 'SpO₂', v: cons.vitals.spo2,  u: '%' },
                  { l: 'FR',   v: cons.vitals.rr,    u: 'rpm' },
                ].map(x => (
                  <View key={x.l} style={[rp.vitalCell, { backgroundColor: x.alert ? C.redSoft : C.bg }]}>
                    <Text style={rp.vitalKey}>{x.l}</Text>
                    <Text style={[rp.vitalVal, x.alert && { color: C.red }]}>{x.v}</Text>
                    <Text style={rp.vitalUnit}>{x.u}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={rp.dashed}>
              <SectionTitle>SÍNTOMAS</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {cons.symptoms.map(s => (
                  <View key={s} style={rp.symptomChip}>
                    <Text style={rp.symptomChipTxt}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={rp.dashed}>
              <SectionTitle>DIAGNÓSTICO</SectionTitle>
              <View style={rp.dxBox}>
                <Text style={rp.dxMain}>{cons.diagnosis}</Text>
                <View style={rp.dxCode}>
                  <Text style={rp.dxCodeTxt}>CIE-10 · {cons.diagnosisCode || 'J03.9'}</Text>
                </View>
              </View>
            </View>

            <View style={rp.dashed}>
              <SectionTitle>RECOMENDACIONES</SectionTitle>
              {cons.recommendations.map((r, i) => (
                <View key={i} style={rp.recRow}>
                  <View style={rp.recIcon}>
                    <Icons.Check size={11} color={C.green} sw={3} />
                  </View>
                  <Text style={rp.recTxt}>{r}</Text>
                </View>
              ))}
            </View>

            {/* Follow-up */}
            <View style={[rp.followUp, { marginTop: 8 }]}>
              <Icons.Calendar size={18} color={C.amber} />
              <View style={{ flex: 1 }}>
                <Text style={rp.followUpLabel}>SEGUIMIENTO</Text>
                <Text style={rp.followUpVal}>
                  Nueva consulta en {cons.followUp} o antes si empeora
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={rp.rxDivider} />

          {/* Prescription */}
          <View style={rp.docBody}>
            <View style={rp.rxHeaderRow}>
              <View style={rp.rxIcon}>
                <Icons.Pill size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={rp.rxLabel}>RECETA MÉDICA ELECTRÓNICA</Text>
                <Text style={rp.rxTitle}>Rx · {rx.length} medicamentos</Text>
              </View>
            </View>

            <View style={{ gap: 10 }}>
              {rx.map((m, i) => (
                <MedRow key={i} med={m} idx={i + 1} />
              ))}
            </View>

            {/* QR footer */}
            <View style={rp.qrRow}>
              <View style={rp.qrBox}>
                <Text style={{ fontSize: 9, color: C.inkMuted, fontWeight: '700' }}>QR</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={rp.qrLabel}>VALIDEZ DE LA RECETA</Text>
                <Text style={rp.qrTxt}>
                  Vigente hasta el <Text style={{ fontWeight: '700' }}>30 abril 2026</Text>. Presenta el QR en cualquier farmacia afiliada.
                </Text>
              </View>
            </View>

            {/* Signature */}
            <View style={rp.sigRow}>
              <View style={{ flex: 1 }}>
                <Text style={rp.sigName}>M. Quispe</Text>
                <View style={rp.sigLine} />
                <Text style={rp.sigDrName}>{doctor.name}</Text>
                <Text style={rp.sigDrSub}>CMP {doctor.cmp} · {doctor.specialty}</Text>
              </View>
              <View style={rp.verifyBadge}>
                <Icons.Shield size={11} color={C.green} />
                <Text style={rp.verifyTxt}>Verificado</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 14 }} />
        </View>

        {/* Delivery options */}
        <View style={{ padding: 14 }}>
          <Text style={rp.deliveryLabel}>CÓMO ENTREGAR AL PACIENTE</Text>
          <View style={rp.deliveryGrid}>
            {[
              { label: 'WhatsApp', sub: 'PDF + link',        color: '#25D366', Icon: Icons.Chat },
              { label: 'Email',    sub: 'A su correo',       color: C.blue,   Icon: Icons.Chat },
              { label: 'En la app',sub: 'Notificación push', color: C.blue,   Icon: Icons.Bell },
              { label: 'Imprimir', sub: 'Si tiene impresora',color: C.ink,    Icon: Icons.Doc  },
            ].map(o => (
              <TouchableOpacity key={o.label} style={rp.deliveryBtn} activeOpacity={0.8}>
                <View style={[rp.deliveryIcon, { backgroundColor: o.color }]}>
                  <o.Icon size={17} color="#fff" />
                </View>
                <Text style={rp.deliveryBtnLabel}>{o.label}</Text>
                <Text style={rp.deliveryBtnSub}>{o.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={rp.footer}>
        <TouchableOpacity style={rp.editBtn} activeOpacity={0.8}>
          <Text style={rp.editBtnTxt}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[rp.sendBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={rp.sendBtnTxt}>Enviar y finalizar</Text>
              <Icons.Check size={18} color="#fff" />
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
  title:   { fontSize: 15, fontWeight: '700', color: C.ink },
  sub:     { fontSize: 11, color: C.inkSoft, marginTop: 1 },
});

const rp = StyleSheet.create({
  docWrap:      { margin: 14, backgroundColor: '#fff', borderRadius: 20,
                  borderWidth: 1, borderColor: C.line, overflow: 'hidden',
                  shadowColor: C.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3 },
  docHeader:    { backgroundColor: C.ink, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  docBrand:     { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  docBrandSub:  { fontSize: 9.5, fontWeight: '800', color: C.blue, letterSpacing: 2, textTransform: 'uppercase' },
  folioLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },
  folioVal:     { fontSize: 11, color: '#fff', fontWeight: '700' },
  docBody:      { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
  grid2:        { flexDirection: 'row', gap: 14, paddingBottom: 14 },
  dashed:       { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.lineStrong },
  fieldKey:     { fontSize: 9.5, color: C.inkMuted, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  fieldMain:    { fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  fieldSub:     { fontSize: 11, color: C.inkSoft, marginTop: 2 },
  doctorRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14 },
  drAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blue,
                  alignItems: 'center', justifyContent: 'center' },
  drAvatarTxt:  { color: '#fff', fontSize: 13, fontWeight: '800' },
  drName:       { fontSize: 14, fontWeight: '800', color: C.ink },
  drSub:        { fontSize: 11, color: C.inkSoft },
  firmadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.blueSoft },
  firmadoTxt:   { fontSize: 9.5, fontWeight: '800', color: C.blueDark, letterSpacing: 1 },
  sectionTitle: { fontSize: 10, color: C.inkMuted, fontWeight: '800', letterSpacing: 1.2,
                  textTransform: 'uppercase', marginBottom: 8 },
  bodyTxt:      { fontSize: 13, color: C.ink, lineHeight: 20 },
  vitalsGrid:   { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  vitalCell:    { flex: 1, minWidth: 56, padding: 8, borderRadius: 8, alignItems: 'center' },
  vitalKey:     { fontSize: 9, color: C.inkMuted, fontWeight: '800', letterSpacing: 0.5 },
  vitalVal:     { fontSize: 15, fontWeight: '800', color: C.ink },
  vitalUnit:    { fontSize: 8.5, color: C.inkSoft },
  symptomChip:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.blueSoft },
  symptomChipTxt:{ fontSize: 11, fontWeight: '700', color: C.blue },
  dxBox:        { padding: 14, borderRadius: 12, backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.blue + '30' },
  dxMain:       { fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  dxCode:       { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#fff', alignSelf: 'flex-start' },
  dxCodeTxt:    { fontSize: 10, fontWeight: '700', color: C.blueDark, letterSpacing: 0.3 },
  recRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 },
  recIcon:      { width: 18, height: 18, borderRadius: 9, backgroundColor: C.greenSoft,
                  alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  recTxt:       { flex: 1, fontSize: 12.5, color: C.ink, lineHeight: 20 },
  followUp:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
                  borderRadius: 12, backgroundColor: C.amberSoft, borderWidth: 1, borderColor: C.amber + '40', marginBottom: 8 },
  followUpLabel:{ fontSize: 11, color: '#8A5A0D', fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  followUpVal:  { fontSize: 13, fontWeight: '700', color: '#6B4408' },

  rxDivider:    { height: 2, borderTopWidth: 2, borderTopColor: C.lineStrong, marginVertical: 4 },
  rxHeaderRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  rxIcon:       { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blue,
                  alignItems: 'center', justifyContent: 'center' },
  rxLabel:      { fontSize: 9.5, fontWeight: '800', color: C.inkMuted, letterSpacing: 2, textTransform: 'uppercase' },
  rxTitle:      { fontSize: 19, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },

  medCard:      { padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff' },
  medHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  medNum:       { width: 26, height: 26, borderRadius: 8, backgroundColor: C.blueSoft,
                  alignItems: 'center', justifyContent: 'center' },
  medNumTxt:    { fontSize: 12, fontWeight: '800', color: C.blue },
  medDrug:      { fontSize: 16, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  medDose:      { fontSize: 14, fontWeight: '700', color: C.blue },
  medForm:      { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  medMeta:      { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, backgroundColor: C.bg },
  metaKey:      { fontSize: 9, color: C.inkMuted, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  metaVal:      { fontSize: 12, fontWeight: '700', color: C.ink, marginTop: 2 },
  medInstr:     { marginTop: 8, fontSize: 11.5, color: C.inkSoft, fontStyle: 'italic', lineHeight: 16 },

  qrRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14,
                  padding: 14, backgroundColor: C.bg, borderRadius: 12 },
  qrBox:        { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff',
                  borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  qrLabel:      { fontSize: 11, fontWeight: '800', color: C.inkMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  qrTxt:        { fontSize: 12.5, color: C.ink, marginTop: 2, lineHeight: 18 },

  sigRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 14,
                  marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.lineStrong },
  sigName:      { fontSize: 26, color: C.ink, fontStyle: 'italic', paddingBottom: 6 },
  sigLine:      { height: 1.5, backgroundColor: C.ink, marginBottom: 6 },
  sigDrName:    { fontSize: 11, fontWeight: '800', color: C.ink },
  sigDrSub:     { fontSize: 10, color: C.inkSoft },
  verifyBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5,
                  borderRadius: 6, backgroundColor: C.greenSoft },
  verifyTxt:    { fontSize: 9.5, fontWeight: '800', color: C.green, letterSpacing: 0.5, textTransform: 'uppercase' },

  deliveryLabel:{ fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  deliveryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deliveryBtn:  { width: '47%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
                  backgroundColor: '#fff', gap: 6 },
  deliveryIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deliveryBtnLabel:{ fontSize: 13, fontWeight: '700', color: C.ink },
  deliveryBtnSub:  { fontSize: 11, color: C.inkSoft },

  footer:       { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 14,
                  backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  editBtn:      { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
                  backgroundColor: '#fff', alignItems: 'center' },
  editBtnTxt:   { fontSize: 14, fontWeight: '700', color: C.ink },
  sendBtn:      { flex: 2, padding: 14, borderRadius: 14, backgroundColor: C.blue,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 },
  sendBtnTxt:   { fontSize: 15, fontWeight: '800', color: '#fff' },
});
