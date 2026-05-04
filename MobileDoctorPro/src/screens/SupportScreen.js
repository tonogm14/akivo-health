import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';

const WHATSAPP_NUMBER = '51999000000'; // TODO: replace with real support number
const SUPPORT_EMAIL   = 'soporte@doctorhouse.pe';

function TopBar({ onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[tb.wrap, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={tb.back} onPress={onBack} activeOpacity={0.7}>
        <Icons.ChevL size={22} color={C.ink} />
      </TouchableOpacity>
      <Text style={tb.title}>Soporte</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

export default function SupportScreen({ navigation }) {
  const { state } = useApp();
  const doctor = state.doctor || {};

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Hola, soy el Dr. ${doctor.firstName || ''} ${doctor.lastName || ''} (CMP ${doctor.cmp || '—'}). Necesito ayuda con la app Doctor House Pro.`);
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Soporte Doctor House Pro&body=Hola, soy el Dr. ${doctor.name || ''} (CMP ${doctor.cmp || '—'}).`);
  };

  const openCall = () => {
    Linking.openURL(`tel:+${WHATSAPP_NUMBER}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Icons.Chat size={28} color={C.blue} />
          </View>
          <Text style={s.heroTitle}>¿En qué podemos ayudarte?</Text>
          <Text style={s.heroSub}>
            Nuestro equipo está disponible de lunes a sábado, 7 am – 10 pm.
          </Text>
        </View>

        {/* Contact buttons */}
        <Text style={s.sectionLabel}>CONTACTAR SOPORTE</Text>
        <View style={s.card}>
          <TouchableOpacity style={[s.contactRow, s.borderBottom]} onPress={openWhatsApp} activeOpacity={0.7}>
            <View style={[s.contactIcon, { backgroundColor: '#25D36620' }]}>
              <Icons.Chat size={18} color="#25D366" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactTitle}>WhatsApp</Text>
              <Text style={s.contactSub}>Respuesta en menos de 15 min</Text>
            </View>
            <Icons.ChevR size={16} color={C.inkMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.contactRow, s.borderBottom]} onPress={openEmail} activeOpacity={0.7}>
            <View style={[s.contactIcon, { backgroundColor: C.blueSoft }]}>
              <Icons.Doc size={18} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactTitle}>Email</Text>
              <Text style={s.contactSub}>{SUPPORT_EMAIL}</Text>
            </View>
            <Icons.ChevR size={16} color={C.inkMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.contactRow} onPress={openCall} activeOpacity={0.7}>
            <View style={[s.contactIcon, { backgroundColor: C.greenSoft }]}>
              <Icons.Phone size={18} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactTitle}>Llamar</Text>
              <Text style={s.contactSub}>Lun–Vie 9 am – 6 pm</Text>
            </View>
            <Icons.ChevR size={16} color={C.inkMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={s.sectionLabel}>PREGUNTAS FRECUENTES</Text>
        <View style={s.card}>
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} last={i === FAQ.length - 1} />
          ))}
        </View>

        {/* App info */}
        <View style={s.infoBox}>
          <Text style={s.infoText}>Doctor House Pro · v 1.0.0</Text>
          <Text style={s.infoText}>ID médico: {state.doctor?.id?.slice(0, 8) || '—'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FaqItem({ q, a, last }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TouchableOpacity
      style={[s.faqRow, !last && s.borderBottom]}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.7}
    >
      <View style={s.faqHeader}>
        <Text style={s.faqQ}>{q}</Text>
        <Icons.ChevD size={16} color={C.inkMuted}
          style={open ? { transform: [{ rotate: '180deg' }] } : {}} />
      </View>
      {open && <Text style={s.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

const FAQ = [
  {
    q: '¿Cómo actualizo mi disponibilidad?',
    a: 'Desde la pantalla de inicio, usa el interruptor "Recibiendo pedidos" para activar o pausar tu disponibilidad. Los cambios se aplican de inmediato.',
  },
  {
    q: '¿Cómo recibo mis pagos?',
    a: 'Los pagos se acumulan en tu wallet de Doctor House Pro y se transfieren quincenalmente al método de pago registrado en tu perfil.',
  },
  {
    q: '¿Qué hago si un paciente no contesta?',
    a: 'Intenta llamarle desde la pantalla de paciente. Si no hay respuesta en 10 minutos, puedes cancelar la visita desde el botón de opciones y se registrará como "paciente incontactable".',
  },
  {
    q: '¿Cómo actualizo mis datos o documentos?',
    a: 'Contacta a soporte por WhatsApp o email con los documentos actualizados. Los cambios en datos certificados requieren verificación manual.',
  },
  {
    q: '¿Qué pasa si tengo un problema técnico durante una visita?',
    a: 'Contacta inmediatamente a soporte por WhatsApp. Si la consulta es por video, puedes finalizar desde el botón "Finalizar" y continuar por teléfono con el paciente.',
  },
];

const tb = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 10,
           backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  back:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },
});

const s = StyleSheet.create({
  hero:       { alignItems: 'center', paddingVertical: 28, marginBottom: 10 },
  heroIcon:   { width: 68, height: 68, borderRadius: 34, backgroundColor: C.blueSoft,
                alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle:  { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.4, textAlign: 'center' },
  heroSub:    { fontSize: 13, color: C.inkSoft, marginTop: 6, textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1,
                  textTransform: 'uppercase', marginBottom: 8, marginTop: 6 },

  card:       { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line,
                overflow: 'hidden', marginBottom: 20 },
  borderBottom:{ borderBottomWidth: 1, borderBottomColor: C.line },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  contactIcon:{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactTitle:{ fontSize: 14, fontWeight: '700', color: C.ink },
  contactSub: { fontSize: 12, color: C.inkSoft, marginTop: 1 },

  faqRow:     { padding: 14 },
  faqHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQ:       { flex: 1, fontSize: 13.5, fontWeight: '600', color: C.ink, lineHeight: 20 },
  faqA:       { marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 20 },

  infoBox:    { alignItems: 'center', gap: 4 },
  infoText:   { fontSize: 11, color: C.inkMuted },
});
