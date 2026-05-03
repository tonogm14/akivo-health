import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { useApp } from '../AppContext';

function TopBar({ onBack, patientName }) {
  return (
    <View style={tb.wrap}>
      <TouchableOpacity style={tb.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={tb.title}>Entregar receta</Text>
        <Text style={tb.sub}>{patientName || 'Paciente'}</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

const METHODS = [
  { id: 'whatsapp', label: 'WhatsApp',  sub: 'PDF + QR',      color: '#25D366', Icon: Icons.Chat },
  { id: 'email',    label: 'Email',     sub: 'PDF adjunto',    color: C.blue,   Icon: Icons.Chat },
  { id: 'app',      label: 'En la app', sub: 'Notificación',  color: C.blue,   Icon: Icons.Bell },
  { id: 'print',    label: 'Imprimir',  sub: 'Si hay impres.',color: C.ink,    Icon: Icons.Doc  },
];

function SentSuccess({ method, onDone }) {
  const m = METHODS.find(x => x.id === method) || METHODS[0];
  return (
    <View style={ss.wrap}>
      <View style={ss.iconWrap}>
        <Icons.Check size={46} color={C.blue} sw={3} />
      </View>
      <Text style={ss.title}>Receta enviada</Text>
      <Text style={ss.sub}>
        El paciente recibió la receta por <Text style={{ fontWeight: '700' }}>{m.label}</Text>. Puede canjearla en cualquier farmacia afiliada.
      </Text>

      <View style={ss.confirmCard}>
        <View style={[ss.confirmIcon, { backgroundColor: m.color }]}>
          <m.Icon size={17} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.confirmTitle}>Entregado</Text>
          <Text style={ss.confirmSub}>+51 999 123 456 · hace 3s</Text>
        </View>
        <View style={ss.tick}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.green }}>✓✓</Text>
        </View>
      </View>

      <TouchableOpacity style={ss.doneBtn} onPress={onDone} activeOpacity={0.85}>
        <Text style={ss.doneBtnTxt}>Continuar al cobro →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function UploadRxScreen({ navigation }) {
  const { state } = useApp();
  const patientName     = state.activeVisit?.patient || 'Paciente';
  const patientInitials = patientName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P';
  const [method, setMethod]             = useState('whatsapp');
  const [includePhysical, setPhysical]  = useState(true);
  const [photoTaken, setPhotoTaken]     = useState(false);
  const [sent, setSent]                 = useState(false);
  const rx = state.consultation?.prescription || [];

  if (sent) return (
    <SentSuccess method={method} onDone={() => navigation.navigate('PaymentConfirm')} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar onBack={() => navigation.goBack()} patientName={state.activeVisit?.patient} />

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 14 }}>
        {/* Rx preview */}
        <View style={up.card}>
          <View style={up.rxHeader}>
            <View style={up.rxIcon}>
              <Icons.Pill size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={up.rxLabel}>RECETA ELECTRÓNICA</Text>
              <Text style={up.rxId}>DH-Rx-2604-8812</Text>
            </View>
            <View style={up.firmadaBadge}>
              <Icons.Shield size={11} color={C.green} />
              <Text style={up.firmadaTxt}>Firmada</Text>
            </View>
          </View>

          <View style={up.medList}>
            {rx.map((m, i) => (
              <View key={i} style={[up.medRow, i < rx.length - 1 && up.medBorder]}>
                <View style={up.medNum}>
                  <Text style={up.medNumTxt}>{i + 1}</Text>
                </View>
                <Text style={up.medName}>{m.drug} {m.dose}</Text>
                <Text style={up.medQty}>{m.qty} ud</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Method */}
        <Text style={up.sectionLabel}>MÉTODO DE ENTREGA</Text>
        <View style={up.methodGrid}>
          {METHODS.map(o => {
            const sel = method === o.id;
            return (
              <TouchableOpacity
                key={o.id}
                style={[up.methodBtn, sel && { borderColor: o.color, backgroundColor: o.color + '12' }]}
                onPress={() => setMethod(o.id)}
                activeOpacity={0.8}
              >
                <View style={[up.methodIcon, { backgroundColor: o.color }]}>
                  <o.Icon size={17} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={up.methodLabel}>{o.label}</Text>
                  <Text style={up.methodSub}>{o.sub}</Text>
                </View>
                {sel && (
                  <View style={[up.methodCheck, { backgroundColor: o.color }]}>
                    <Icons.Check size={11} color="#fff" sw={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recipient */}
        <Text style={up.sectionLabel}>DESTINATARIO</Text>
        <View style={up.card}>
          <View style={up.recipientRow}>
            <View style={up.recipientAvatar}>
              <Text style={up.recipientInitials}>{patientInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={up.recipientName}>{patientName}</Text>
              <Text style={up.recipientSub}>
                {method === 'email'    ? 'j.ramirez@gmail.com'
                 : method === 'whatsapp' ? '+51 999 123 456'
                 : method === 'app'    ? 'Usuaria activa · recibirá push'
                 : 'Impresora no detectada'}
              </Text>
            </View>
            {method !== 'print' && (
              <View style={up.verifiedBadge}>
                <Text style={up.verifiedTxt}>Verificado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Physical copy toggle */}
        <Text style={up.sectionLabel}>COPIA FÍSICA (OPCIONAL)</Text>
        <View style={up.card}>
          <View style={up.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={up.toggleTitle}>Incluir foto de receta física</Text>
              <Text style={up.toggleSub}>
                Para farmacias que aún piden receta escrita a mano junto con la electrónica.
              </Text>
            </View>
            <TouchableOpacity
              style={[up.toggle, { backgroundColor: includePhysical ? C.blue : C.lineStrong,
                                   justifyContent: includePhysical ? 'flex-end' : 'flex-start' }]}
              onPress={() => setPhysical(!includePhysical)}
              activeOpacity={0.85}
            >
              <View style={up.toggleThumb} />
            </TouchableOpacity>
          </View>

          {includePhysical && (
            <View style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line }}>
              {!photoTaken ? (
                <TouchableOpacity
                  style={up.photoUpload}
                  onPress={() => setPhotoTaken(true)}
                  activeOpacity={0.8}
                >
                  <View style={up.photoIcon}>
                    <Icons.Camera size={26} color={C.blue} />
                  </View>
                  <Text style={up.photoTitle}>Tomar foto de la receta física</Text>
                  <Text style={up.photoSub}>Asegúrate de que se vea firma y sello</Text>
                </TouchableOpacity>
              ) : (
                <View style={up.photoTaken}>
                  <View style={up.photoCheck}>
                    <Icons.Check size={18} color="#fff" sw={3} />
                  </View>
                  <View style={up.photoTakenFooter}>
                    <Text style={up.photoTakenTxt}>✓ Foto lista · 1.2 MB</Text>
                    <TouchableOpacity onPress={() => setPhotoTaken(false)}>
                      <Text style={up.retakeTxt}>Retomar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Legal note */}
        <View style={up.legalNote}>
          <Icons.Shield size={17} color={C.blue} />
          <Text style={up.legalTxt}>
            La receta electrónica tiene <Text style={{ fontWeight: '700' }}>la misma validez legal</Text> que una en papel en el Perú. El QR permite a cualquier farmacia verificarla al instante.
          </Text>
        </View>
      </ScrollView>

      <View style={up.footer}>
        <TouchableOpacity style={up.previewBtn} activeOpacity={0.8}>
          <Text style={up.previewBtnTxt}>Previsualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={up.sendBtn} onPress={() => setSent(true)} activeOpacity={0.85}>
          <Text style={up.sendBtnTxt}>
            {method === 'whatsapp' ? 'Enviar por WhatsApp'
             : method === 'email'  ? 'Enviar por email'
             : method === 'app'    ? 'Enviar en la app'
             : 'Imprimir'}
          </Text>
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

const up = StyleSheet.create({
  card:         { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                  padding: 16, marginBottom: 14 },
  rxHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  rxIcon:       { width: 44, height: 44, borderRadius: 12, backgroundColor: C.blue,
                  alignItems: 'center', justifyContent: 'center' },
  rxLabel:      { fontSize: 10, fontWeight: '800', color: C.inkMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
  rxId:         { fontSize: 17, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  firmadaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5,
                  borderRadius: 999, backgroundColor: C.greenSoft },
  firmadaTxt:   { fontSize: 10, fontWeight: '800', color: C.green },
  medList:      { backgroundColor: C.bg, borderRadius: 12, padding: 10 },
  medRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  medBorder:    { borderBottomWidth: 1, borderBottomColor: C.line },
  medNum:       { width: 20, height: 20, borderRadius: 6, backgroundColor: C.blueSoft,
                  alignItems: 'center', justifyContent: 'center' },
  medNumTxt:    { fontSize: 10, fontWeight: '800', color: C.blue },
  medName:      { flex: 1, fontSize: 12.5, fontWeight: '700', color: C.ink },
  medQty:       { fontSize: 11, color: C.inkSoft },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  methodGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  methodBtn:    { width: '47%', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
                  backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, position: 'relative' },
  methodIcon:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  methodLabel:  { fontSize: 13, fontWeight: '700', color: C.ink },
  methodSub:    { fontSize: 11, color: C.inkSoft, marginTop: 1 },
  methodCheck:  { position: 'absolute', top: 6, right: 6, width: 18, height: 18,
                  borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  recipientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipientAvatar:{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.blueSoft,
                    alignItems: 'center', justifyContent: 'center' },
  recipientInitials:{ fontSize: 13, fontWeight: '800', color: C.blue },
  recipientName:{ fontSize: 14, fontWeight: '700', color: C.ink },
  recipientSub: { fontSize: 11.5, color: C.inkSoft, marginTop: 1 },
  verifiedBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.greenSoft },
  verifiedTxt:  { fontSize: 10, fontWeight: '800', color: C.green },

  toggleRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle:  { fontSize: 13, fontWeight: '700', color: C.ink },
  toggleSub:    { fontSize: 11.5, color: C.inkSoft, marginTop: 2, lineHeight: 18 },
  toggle:       { width: 44, height: 26, borderRadius: 13, padding: 2, flexDirection: 'row' },
  toggleThumb:  { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },

  photoUpload:  { padding: 22, borderRadius: 14, borderWidth: 1.5, borderColor: C.blue,
                  backgroundColor: C.blueSoft, alignItems: 'center', gap: 10 },
  photoIcon:    { width: 50, height: 50, borderRadius: 14, backgroundColor: '#fff',
                  alignItems: 'center', justifyContent: 'center' },
  photoTitle:   { fontSize: 14, fontWeight: '700', color: C.blueDark },
  photoSub:     { fontSize: 11.5, color: C.blueDark, opacity: 0.8 },
  photoTaken:   { borderRadius: 14, borderWidth: 1.5, borderColor: C.green, overflow: 'hidden', position: 'relative' },
  photoCheck:   { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16,
                  backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  photoTakenFooter:{ padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.green + '30',
                     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoTakenTxt:{ fontSize: 12, fontWeight: '700', color: C.green },
  retakeTxt:    { fontSize: 11.5, fontWeight: '700', color: C.ink },

  legalNote:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12,
                  borderRadius: 12, backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.blue + '25' },
  legalTxt:     { flex: 1, fontSize: 11.5, color: C.ink, lineHeight: 20 },

  footer:       { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 14,
                  backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  previewBtn:   { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
                  backgroundColor: '#fff', alignItems: 'center' },
  previewBtnTxt:{ fontSize: 14, fontWeight: '700', color: C.ink },
  sendBtn:      { flex: 2, padding: 14, borderRadius: 14, backgroundColor: C.blue,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 },
  sendBtnTxt:   { fontSize: 15, fontWeight: '800', color: '#fff' },
});

const ss = StyleSheet.create({
  wrap:        { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap:    { width: 90, height: 90, borderRadius: 45, backgroundColor: C.blueSoft,
                 alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:       { fontSize: 24, fontWeight: '800', color: C.ink, letterSpacing: -0.5, textAlign: 'center' },
  sub:         { fontSize: 14, color: C.inkSoft, marginTop: 8, maxWidth: 280, lineHeight: 22, textAlign: 'center' },
  confirmCard: { marginTop: 24, padding: 14, borderRadius: 14, backgroundColor: '#fff',
                 borderWidth: 1, borderColor: C.line, flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', maxWidth: 320 },
  confirmIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  confirmTitle:{ fontSize: 12, fontWeight: '700', color: C.ink },
  confirmSub:  { fontSize: 11, color: C.inkSoft },
  tick:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.greenSoft },
  doneBtn:     { marginTop: 24, width: '100%', maxWidth: 320, padding: 16, borderRadius: 14,
                 backgroundColor: C.blue, alignItems: 'center',
                 shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 6 },
  doneBtnTxt:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
