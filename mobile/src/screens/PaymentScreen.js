import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';
import { registerForPushNotificationsAsync } from '../notifications';

const SYMPTOM_LABELS = {
  fever: 'Fiebre',
  flu: 'Gripe / resfrío',
  head: 'Dolor de cabeza',
  stomach: 'Estómago',
  throat: 'Dolor de garganta',
  body: 'Dolor muscular',
  cough: 'Tos',
  malaise: 'Malestar general',
  fatigue: 'Fatiga / cansancio',
  nausea: 'Náuseas o vómitos',
  diarrhea: 'Diarrea',
  constipation: 'Estreñimiento',
};

const WALLET_PHONE  = process.env.EXPO_PUBLIC_YAPE_PHONE  || '999999999';
const WALLET_NAME   = process.env.EXPO_PUBLIC_YAPE_NAME   || '';
const WALLET_QR_URL = process.env.EXPO_PUBLIC_YAPE_QR_URL || '';

const enabled = {
  yape_plin:    process.env.EXPO_PUBLIC_PAYMENT_YAPE_PLIN    !== 'false',
  culqi:        process.env.EXPO_PUBLIC_PAYMENT_CULQI        !== 'false',
  niubiz:       process.env.EXPO_PUBLIC_PAYMENT_NIUBIZ       !== 'false',
  pagoefectivo: process.env.EXPO_PUBLIC_PAYMENT_PAGOEFECTIVO !== 'false',
};

const ALL_METHODS = [
  {
    id: 'yape_plin', title: 'Yape / Plin', sub: 'Transfiere desde tu app Yape o Plin · Más usado',
    featured: true,
  },
  {
    id: 'culqi', title: 'Culqi', sub: 'Visa, Mastercard, Amex',
    iconBg: '#FFF0E6', iconColor: '#FF6B00', iconName: 'credit-card',
  },
  {
    id: 'niubiz', title: 'Niubiz / VisaNet', sub: 'Visa y Mastercard',
    iconBg: '#E6F0FF', iconColor: '#1A1F71', iconName: 'credit-card',
  },
  {
    id: 'pagoefectivo', title: 'PagoEfectivo', sub: 'Desde tu banco o billetera digital',
    iconBg: C.greenSoft, iconColor: C.green, iconName: 'smartphone',
  },
];

export default function PaymentScreen({ navigation }) {
  const { state, setState } = useApp();
  const methods = ALL_METHODS.filter(m => enabled[m.id]);
  const defaultMethod = methods[0]?.id ?? 'yape';

  const [step, setStep]       = useState('method');
  const [method, setMethod]   = useState(state.payment || defaultMethod);
  const [opCode, setOpCode]   = useState('');
  const [loading, setLoading] = useState(false);

  const isWalletMethod = method === 'yape_plin';
  const isCardMethod   = method === 'culqi' || method === 'niubiz';

  const onContinue = async () => {
    if (step === 'method') {
      if (isWalletMethod) setStep('wallet_qr');
      else if (isCardMethod) setStep('card_confirm');
      else setStep('confirm');
      return;
    }

    setLoading(true);
    try {
      const mappedSymptoms = (state.symptoms || []).map(s =>
        s.startsWith('other:') ? s.slice(6) : (SYMPTOM_LABELS[s] || s)
      );

      // Register push token — non-blocking, null if simulator/denied
      const pushToken = await registerForPushNotificationsAsync();

      const body = {
        urgency:             state.when === 'schedule' ? 'schedule' : 'now',
        address:             state.address,
        address_ref:         state.ref || null,
        latitude:            state.lat  || null,
        longitude:           state.lng  || null,
        symptoms:            mappedSymptoms.length ? mappedSymptoms : ['Consulta general'],
        patient: {
          name:      state.patient?.name,
          age_group: state.patient?.ageGroup || 'adult',
          age:       state.patient?.age ? parseInt(state.patient.age, 10) : null,
          flags:     state.patient?.flags || [],
          notes:     state.patient?.notes || null,
        },
        doctor_type:          state.doctorType || 'general',
        specialty_requested:  state.specialtyRequested || null,
        push_token:           pushToken || null,
      };

      const headers = { 'Content-Type': 'application/json' };
      if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

      const res = await fetch(`${API_BASE}/visits`, {
        method:  'POST',
        headers,
        body:    JSON.stringify(body),
      });

      const visit = await res.json();
      if (!res.ok) throw new Error(visit.errors?.[0]?.msg || visit.error || 'Error al crear visita');

      const doc = visit.doctor || {};
      const visitData = {
        id:           visit.id,
        status:       visit.status,
        doctorName:   doc.name            || 'Doctor asignado',
        doctorSpec:   doc.specialty       || 'Medicina General',
        doctorRating: doc.rating          ?? null,
        doctorCmp:    doc.cmp_license     || null,
        doctorExp:    doc.experience_years || null,
        visitDate:    new Date().toISOString(),
        address:      state.address,
        ref:          state.ref || null,
        symptoms:     mappedSymptoms,
        patient:      state.patient,
        urgency:      state.when === 'schedule' ? 'schedule' : 'now',
        payment:      method,
        eta:          visit.eta_minutes   || null,
      };

      const existingRaw = await AsyncStorage.getItem('dh_visits');
      const allVisits = existingRaw ? JSON.parse(existingRaw) : [];
      allVisits.unshift(visitData);
      if (allVisits.length > 50) allVisits.splice(50);
      await AsyncStorage.multiSet([
        ['dh_visits',    JSON.stringify(allVisits)],
        ['dh_last_visit', JSON.stringify(visitData)],
      ]);

      setState({ ...state, payment: method, visitId: visit.id });
      navigation.replace('Matching', { visitId: visit.id });
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo confirmar la visita. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === 'method') navigation.goBack();
    else setStep('method');
  };

  const btnLabel =
    loading                 ? 'Procesando...' :
    step === 'method'       ? 'Continuar' :
    step === 'wallet_qr'    ? 'Confirmar pago · S/ 120' :
    step === 'card_confirm' ? 'Pagar con tarjeta · S/ 120' :
                              'Confirmar visita · S/ 120';

  const disabled = loading || (step === 'wallet_qr' && opCode.trim().length < 3);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={onBack} step={3} total={4} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {step === 'method' && (
            <MethodPicker method={method} setMethod={setMethod} methods={methods} />
          )}

          {step === 'wallet_qr' && (
            <WalletQR phone={WALLET_PHONE} name={WALLET_NAME} qrUrl={WALLET_QR_URL} opCode={opCode} setOpCode={setOpCode} />
          )}

          {step === 'card_confirm' && <CardConfirmStep method={method} />}
          {step === 'confirm'      && <ConfirmStep method={method} />}

        </ScrollView>
        <BottomBar>
          <PrimaryButton onPress={onContinue} disabled={disabled}>
            {btnLabel}
          </PrimaryButton>
          {step === 'method' && (
            <View style={s.secureRow}>
              <Feather name="lock" size={12} color={C.inkMuted} />
              <Text style={s.secureText}>El pago confirma la visita. El doctor parte una vez verificado.</Text>
            </View>
          )}
        </BottomBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MethodPicker({ method, setMethod, methods }) {
  const [coupon, setCoupon] = useState('');
  return (
    <View>
      <Text style={s.title}>¿Cómo pagas?</Text>
      <Text style={s.sub}>El pago debe completarse para confirmar la visita y que el doctor pueda ir a tu casa.</Text>
      <View style={{ gap: 10 }}>
        {methods.map(m => (
          <PayOption key={m.id} {...m} selected={method === m.id} onSelect={() => setMethod(m.id)} />
        ))}
      </View>
      <View style={s.couponRow}>
        <Text style={s.couponLabel}>¿Tienes cupón?</Text>
        <TextInput
          value={coupon} onChangeText={setCoupon}
          placeholder="Código" placeholderTextColor={C.inkMuted}
          style={s.couponInput}
        />
        <TouchableOpacity style={s.couponApply}>
          <Text style={s.couponApplyText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function YapePlinLogos() {
  return (
    <View style={s.dualLogo}>
      <View style={[s.logoBadge, { backgroundColor: '#6C1FD1' }]}>
        <Text style={s.logoText}>Y</Text>
      </View>
      <View style={[s.logoBadge, { backgroundColor: '#0072CE', marginLeft: -6 }]}>
        <Text style={s.logoText}>P</Text>
      </View>
    </View>
  );
}

function PayOption({ id, title, sub, iconBg, iconColor, iconName, featured, selected, onSelect }) {
  return (
    <TouchableOpacity
      onPress={onSelect} activeOpacity={0.8}
      style={[s.payOption, selected && { borderColor: C.blue, backgroundColor: C.blueSoft }]}
    >
      {id === 'yape_plin' ? (
        <YapePlinLogos />
      ) : (
        <View style={[s.payIcon, { backgroundColor: iconBg }]}>
          <Feather name={iconName} size={22} color={iconColor} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Text style={s.payTitle}>{title}</Text>
          {featured && (
            <View style={s.featuredBadge}>
              <Text style={s.featuredText}>MÁS USADO</Text>
            </View>
          )}
        </View>
        <Text style={s.paySub}>{sub}</Text>
      </View>
      <View style={[s.radio, selected && { backgroundColor: C.blue, borderColor: C.blue }]}>
        {selected && <Feather name="check" size={13} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

function WalletQR({ phone, name, qrUrl, opCode, setOpCode }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <YapePlinLogos />
        <Text style={s.title}>Yape / Plin</Text>
      </View>
      <Text style={[s.sub, { textAlign: 'center' }]}>
        Escanea el QR o transfiere al número desde tu app Yape o Plin.
        Luego ingresa el código de operación.
      </Text>

      <View style={s.qrCard}>
        {qrUrl ? (
          <Image source={{ uri: qrUrl }} style={s.qrImage} resizeMode="contain" />
        ) : (
          <View style={s.qrPlaceholder}>
            <Feather name="image" size={40} color={C.inkMuted} />
            <Text style={{ fontSize: 12, color: C.inkMuted, marginTop: 8 }}>Sin imagen configurada</Text>
          </View>
        )}
        <Text style={s.qrPhone}>{phone}</Text>
        {!!name && <Text style={s.qrName}>{name}</Text>}
      </View>

      <View style={s.opCodeWrap}>
        <Text style={s.opCodeLabel}>Código de operación</Text>
        <TextInput
          value={opCode}
          onChangeText={v => setOpCode(v.replace(/\D/g, '').slice(0, 12))}
          placeholder="Ej: 123456789"
          placeholderTextColor={C.inkMuted}
          keyboardType="numeric"
          style={s.opCodeInput}
        />
        <Text style={s.opCodeHint}>Lo encuentras en el detalle de la transferencia en tu app Yape o Plin.</Text>
      </View>
    </View>
  );
}

function CardConfirmStep({ method }) {
  const isCulqi  = method === 'culqi';
  const title    = isCulqi ? 'Culqi' : 'Niubiz / VisaNet';
  const iconColor = isCulqi ? '#FF6B00' : '#1A1F71';
  const iconBg    = isCulqi ? '#FFF0E6' : '#E6F0FF';
  return (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <View style={[s.confirmIcon, { backgroundColor: iconBg }]}>
        <Feather name="credit-card" size={32} color={iconColor} />
      </View>
      <Text style={[s.title, { textAlign: 'center', marginTop: 16 }]}>Pago con {title}</Text>
      <Text style={[s.sub, { textAlign: 'center' }]}>
        Al confirmar se procesará el cobro de <Text style={{ fontWeight: '700' }}>S/ 120.00</Text> a tu tarjeta de forma segura.
        El doctor es despachado una vez confirmado el pago.
      </Text>
      <View style={s.cardInfoBox}>
        <Feather name="shield" size={15} color={C.green} />
        <Text style={s.cardInfoText}>Transacción cifrada. No almacenamos datos de tu tarjeta.</Text>
      </View>
    </View>
  );
}

function ConfirmStep({ method }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <View style={[s.confirmIcon, { backgroundColor: C.greenSoft }]}>
        <Feather name="smartphone" size={32} color={C.green} />
      </View>
      <Text style={[s.title, { textAlign: 'center', marginTop: 16 }]}>Pago con PagoEfectivo</Text>
      <Text style={[s.sub, { textAlign: 'center' }]}>
        Al confirmar recibirás las instrucciones para completar el pago desde tu banco o billetera digital.
        El doctor es despachado una vez confirmado el pago.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  title:   { fontSize: 24, fontWeight: '700', color: C.ink, letterSpacing: -0.4, marginBottom: 6 },
  sub:     { fontSize: 14, color: C.inkSoft, marginBottom: 18, lineHeight: 20 },
  payOption: {
    padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  payIcon:       { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dualLogo:      { flexDirection: 'row', alignItems: 'center', width: 44, height: 44 },
  logoBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  logoText:      { fontSize: 13, fontWeight: '900', color: '#fff' },
  payTitle:      { fontSize: 15, fontWeight: '700', color: C.ink },
  paySub:        { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  featuredBadge: { backgroundColor: C.yapeSoft, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 },
  featuredText:  { fontSize: 10, fontWeight: '700', color: C.yape, letterSpacing: 0.3 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: C.lineStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  couponRow: {
    marginTop: 20, padding: 14, borderRadius: 12,
    borderWidth: 1, borderStyle: 'dashed', borderColor: C.lineStrong,
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  couponLabel:      { fontSize: 13, fontWeight: '700', color: C.blue },
  couponInput:      { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: C.line, fontSize: 14, color: C.ink },
  couponApply:      { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: C.blue, borderRadius: 10 },
  couponApplyText:  { color: '#fff', fontWeight: '600' },
  secureRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 10 },
  secureText:       { fontSize: 12, color: C.inkMuted, flex: 1, textAlign: 'center' },
  qrCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: C.line,
    padding: 24, alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 3, marginBottom: 24,
  },
  qrImage:        { width: 220, height: 220, borderRadius: 8 },
  qrPlaceholder:  { width: 220, height: 220, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  qrPhone:        { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: 2 },
  qrName:         { fontSize: 14, color: C.inkSoft, fontWeight: '600' },
  opCodeWrap:     { width: '100%', gap: 8 },
  opCodeLabel:    { fontSize: 15, fontWeight: '700', color: C.ink },
  opCodeInput: {
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line,
    fontSize: 20, fontWeight: '700', color: C.ink, letterSpacing: 2, textAlign: 'center',
  },
  opCodeHint:     { fontSize: 12, color: C.inkMuted, textAlign: 'center' },
  confirmIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center',
  },
  cardInfoBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: C.greenSoft, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14, marginTop: 8, width: '100%',
  },
  cardInfoText: { fontSize: 13, color: C.ink, flex: 1, lineHeight: 18 },
});
