import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, R } from '../theme';
import { TopBar, BottomBar, PrimaryButton, Avatar } from '../components';
import { useApp } from '../AppContext';
import * as API from '../api';
import { registerForPushNotificationsAsync } from '../notifications';

const WALLET_PHONE = process.env.EXPO_PUBLIC_YAPE_PHONE || '999999999';
const WALLET_NAME = process.env.EXPO_PUBLIC_YAPE_NAME || '';
const WALLET_QR_URL = process.env.EXPO_PUBLIC_YAPE_QR_URL || '';

const enabled = {
  yape_plin: process.env.EXPO_PUBLIC_PAYMENT_YAPE_PLIN !== 'false',
  culqi: process.env.EXPO_PUBLIC_PAYMENT_CULQI !== 'false',
  niubiz: process.env.EXPO_PUBLIC_PAYMENT_NIUBIZ !== 'false',
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

export default function PaymentScreen({ navigation, route }) {
  const { visitData } = route.params ?? {};
  const { state, setState } = useApp();
  const [visit, setVisit] = useState(null);
  const [loadingVisit, setLoadingVisit] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const methods = ALL_METHODS.filter(m => enabled[m.id]);
  const defaultMethod = methods[0]?.id ?? 'yape_plin';

  const [step, setStep] = useState('method');
  const [method, setMethod] = useState(state.payment || defaultMethod);
  const [opCode, setOpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    // Si ya tenemos visitData de la pantalla anterior, no necesitamos cargar nada
    if (visitData) {
      setVisit({ ...visitData, price: 120 });
      setLoadingVisit(false);
      return;
    }

    // Fallback por si volvemos a una visita existente (aunque el flujo ahora es atómico)
    const visitId = route.params?.visitId;
    if (!visitId) {
      // Si no hay nada, volvemos
      navigation.goBack();
      return;
    }

    const loadVisit = async () => {
      try {
        setLoadingVisit(true);
        const data = await API.visits.get(visitId);
        setVisit(data);
      } catch (err) {
        console.log("Load visit error", err);
      } finally {
        setLoadingVisit(false);
      }
    };
    loadVisit();
  }, [visitData, route.params?.visitId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timeLeft > 0]);

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(null);
  const [checking, setChecking] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });

  const BASE_PRICE = visitData?.service_type === 'telemedicine' ? 60 : (visitData?.service_type === 'injectable' ? 60 : 120);
  const dVal = discount ? parseFloat(discount.discount_value) : 0;
  const finalPrice = discount
    ? discount.discount_type === 'percentage'
      ? BASE_PRICE * (1 - dVal / 100)
      : Math.max(0, BASE_PRICE - dVal)
    : BASE_PRICE;

  console.log('Price Check:', { base: BASE_PRICE, discount: dVal, type: discount?.discount_type, final: finalPrice });

  const isWalletMethod = method === 'yape_plin';
  const isCardMethod = method === 'culqi' || method === 'niubiz';

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setChecking(true);
    setCouponMsg({ text: '', isError: false });
    try {
      const data = await API.coupons.validate(coupon);
      setDiscount(data);
      setCouponMsg({
        text: `¡Éxito! Descuento de ${data.discount_type === 'percentage' ? data.discount_value + '%' : 'S/ ' + data.discount_value} aplicado.`,
        isError: false
      });
    } catch (err) {
      setDiscount(null);
      setCouponMsg({ text: err.message || 'Cupón inválido o expirado.', isError: true });
    } finally {
      setChecking(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(null);
    setCoupon('');
    setCouponMsg({ text: '', isError: false });
  };

  const onContinue = async () => {
    if (step === 'method') {
      if (isWalletMethod) setStep('wallet_qr');
      else if (isCardMethod) setStep('card_confirm');
      else setStep('confirm');
      return;
    }

    setLoading(true);
    try {
      // Combinamos la data de la visita y el pago en una sola llamada
      const checkoutPayload = {
        visit: {
          ...visitData,
          price: finalPrice,
          // Podríamos aplicar el cupón aquí si el backend lo soporta en checkout
        },
        payment: {
          method,
          operation_code: isWalletMethod ? opCode : null
        }
      };

      const newVisit = await API.visits.checkout(checkoutPayload);
      const visitId = newVisit.id;

      // 2. Confirm payment
      // Para fines de demo/desarrollo, auto-confirmamos incluso Yape/Plin para que la visita pase a 'matched'
      await API.payments.confirm(visitId);

      // 3. Update local history
      const existingRaw = await AsyncStorage.getItem('dh_visits');
      const allVisits = existingRaw ? JSON.parse(existingRaw) : [];

      const doc = newVisit.doctor || {};
      const visitDataForHistory = {
        id: visitId,
        status: newVisit.status || 'matched',
        doctorName: doc.name || 'Doctor asignado',
        doctorSpec: doc.specialty || 'Medicina General',
        doctorRating: doc.rating ?? null,
        doctorCmp: doc.cmp_license || null,
        doctorExp: doc.experience_years || null,
        visitDate: new Date().toISOString(),
        address: visitData.address,
        ref: visitData.address_ref || null,
        patient: visitData.patient,
        urgency: visitData.urgency,
        payment: method,
        eta: newVisit.eta_minutes || null,
      };

      const idx = allVisits.findIndex(v => v.id === visitId);
      if (idx >= 0) allVisits[idx] = { ...allVisits[idx], ...visitDataForHistory };
      else allVisits.unshift(visitDataForHistory);

      await AsyncStorage.multiSet([
        ['dh_visits', JSON.stringify(allVisits)],
        ['dh_last_visit', JSON.stringify(visitDataForHistory)],
      ]);

      setState({ ...state, payment: method, visitId: visitId, assignedDoctor: doc });
      navigation.replace('Matching', { mode: 'waiting', visitId: visitId });
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === 'method') navigation.navigate('Home');
    else setStep('method');
  };

  if (loadingVisit) {
    return (
      <View style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const priceStr = `S/ ${finalPrice.toFixed(2)}`;
  const btnLabel =
    loading ? 'Procesando...' :
      step === 'method' ? 'Continuar' :
        step === 'wallet_qr' ? `Confirmar pago · ${priceStr}` :
          step === 'card_confirm' ? `Pagar con tarjeta · ${priceStr}` :
            `Confirmar visita · ${priceStr}`;

  const disabled = loading || (step === 'wallet_qr' && opCode.trim().length < 3) || timeLeft <= 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={onBack} title="Pago de visita" />

      <View style={s.timerBanner}>
        <Feather name="check-circle" size={14} color={C.green} />
        <Text style={[s.timerBannerText, { color: C.green, fontWeight: '700' }]}>
          Disponibilidad confirmada en tu zona
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {step === 'method' && (
            <MethodPicker
              method={method} setMethod={setMethod} methods={methods}
              coupon={coupon} setCoupon={setCoupon} onApply={handleApplyCoupon}
              discount={discount} checking={checking}
              finalPrice={finalPrice} basePrice={BASE_PRICE}
              couponMsg={couponMsg}
              onRemoveCoupon={handleRemoveCoupon}
            />
          )}

          {step === 'wallet_qr' && (
            <WalletQR phone={WALLET_PHONE} name={WALLET_NAME} qrUrl={WALLET_QR_URL} opCode={opCode} setOpCode={setOpCode} priceStr={priceStr} />
          )}

          {step === 'card_confirm' && <CardConfirmStep method={method} priceStr={priceStr} />}
          {step === 'confirm' && <ConfirmStep method={method} priceStr={priceStr} />}

        </ScrollView>
        <BottomBar>
          <PrimaryButton onPress={onContinue} disabled={disabled}>
            {btnLabel}
          </PrimaryButton>
          {step === 'method' && (
            <View style={s.secureRow}>
              <Feather name="lock" size={12} color={C.inkMuted} />
              <Text style={s.secureText}>El pago confirma la visita.</Text>
            </View>
          )}
        </BottomBar>
      </KeyboardAvoidingView>

      <Modal visible={showDoctorModal} transparent animationType="slide" onRequestClose={() => setShowDoctorModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowDoctorModal(false)}>
          <TouchableOpacity style={s.modalSheet} activeOpacity={1}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Información del Médico</Text>

            <View style={vs.doctorProfile}>
              <Avatar name={visit?.doctor?.name || 'D'} size={72} />
              <View style={{ flex: 1 }}>
                <Text style={vs.doctorName}>Dr. {visit?.doctor?.name}</Text>
                <Text style={vs.doctorSpec}>{visit?.doctor?.specialty || 'Medicina General'}</Text>
                <View style={vs.ratingRow}>
                  <StarRating rating={visit?.doctor?.rating || 5} />
                  <Text style={vs.ratingText}>{visit?.doctor?.rating || '5.0'} · {visit?.doctor?.experience_years || 5}+ años exp.</Text>
                </View>
              </View>
            </View>

            <View style={vs.infoGrid}>
              <InfoItem icon="award" label="CMP" value={visit?.doctor?.cmp_license || '—'} />
              <InfoItem icon="map-pin" label="Distancia" value="Cerca de ti" />
              <InfoItem icon="clock" label="Llega en" value={`${visit?.eta_minutes || 45} min`} />
            </View>

            <PrimaryButton onPress={() => setShowDoctorModal(false)} style={{ marginTop: 20 }}>
              Entendido
            </PrimaryButton>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function MethodPicker({ method, setMethod, methods, coupon, setCoupon, onApply, discount, checking, finalPrice, basePrice, couponMsg, onRemoveCoupon }) {
  return (
    <View>
      <Text style={s.title}>¿Cómo pagas?</Text>
      <Text style={s.sub}>El pago debe completarse para confirmar la visita y que el doctor pueda ir a tu casa.</Text>

      <View style={s.priceSummary}>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Precio base</Text>
          <Text style={s.priceValue}>S/ {basePrice.toFixed(2)}</Text>
        </View>
        {discount && (
          <View style={s.priceRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[s.priceLabel, { color: C.green }]}>Descuento ({discount.code})</Text>
              <TouchableOpacity onPress={onRemoveCoupon} style={s.smallRemoveBtn}>
                <Feather name="x-circle" size={14} color={C.green} />
              </TouchableOpacity>
            </View>
            <Text style={[s.priceValue, { color: C.green }]}>
              - S/ {(basePrice - finalPrice).toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[s.priceRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line }]}>
          <Text style={[s.priceLabel, { fontWeight: '700', fontSize: 16 }]}>Total a pagar</Text>
          <Text style={[s.priceValue, { fontWeight: '700', fontSize: 20, color: C.blue }]}>S/ {finalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 20 }}>
        {methods.map(m => (
          <PayOption key={m.id} {...m} selected={method === m.id} onSelect={() => setMethod(m.id)} />
        ))}
      </View>

      <View style={s.couponRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.couponLabel}>¿Tienes un código de descuento?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              value={coupon}
              onChangeText={v => setCoupon(v.replace(/\s/g, '').toUpperCase())}
              placeholder="Ej: WELCOME" placeholderTextColor={C.inkMuted}
              autoCapitalize="characters"
              style={s.couponInput}
              editable={!discount && !checking}
            />
            <TouchableOpacity
              style={[s.couponApply, (discount || checking || !coupon) && { backgroundColor: C.lineStrong }]}
              onPress={onApply}
              disabled={!!discount || checking || !coupon}
            >
              {checking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.couponApplyText}>{discount ? 'Aplicado' : 'Aplicar'}</Text>
              )}
            </TouchableOpacity>
          </View>
          {!!couponMsg?.text && (
            <View style={[s.couponStatus, couponMsg.isError ? s.couponError : s.couponSuccess]}>
              <Feather name={couponMsg.isError ? 'alert-circle' : 'check-circle'} size={14} color={couponMsg.isError ? C.red : C.green} />
              <Text style={[s.couponStatusText, { color: couponMsg.isError ? C.red : C.green, flex: 1 }]}>{couponMsg.text}</Text>
            </View>
          )}
        </View>
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

function WalletQR({ phone, name, qrUrl, opCode, setOpCode, priceStr }) {
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

function CardConfirmStep({ method, priceStr }) {
  const isCulqi = method === 'culqi';
  const title = isCulqi ? 'Culqi' : 'Niubiz / VisaNet';
  const iconColor = isCulqi ? '#FF6B00' : '#1A1F71';
  const iconBg = isCulqi ? '#FFF0E6' : '#E6F0FF';
  return (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <View style={[s.confirmIcon, { backgroundColor: iconBg }]}>
        <Feather name="credit-card" size={32} color={iconColor} />
      </View>
      <Text style={[s.title, { textAlign: 'center', marginTop: 16 }]}>Pago con {title}</Text>
      <Text style={[s.sub, { textAlign: 'center' }]}>
        Al confirmar se procesará el cobro de <Text style={{ fontWeight: '700' }}>{priceStr}</Text> a tu tarjeta de forma segura.
        El doctor es despachado una vez confirmado el pago.
      </Text>
      <View style={s.cardInfoBox}>
        <Feather name="shield" size={15} color={C.green} />
        <Text style={s.cardInfoText}>Transacción cifrada. No almacenamos datos de tu tarjeta.</Text>
      </View>
    </View>
  );
}

function ConfirmStep({ method, priceStr }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <View style={[s.confirmIcon, { backgroundColor: C.greenSoft }]}>
        <Feather name="smartphone" size={32} color={C.green} />
      </View>
      <Text style={[s.title, { textAlign: 'center', marginTop: 16 }]}>Pago con PagoEfectivo</Text>
      <Text style={[s.sub, { textAlign: 'center' }]}>
        Al confirmar recibirás las instrucciones para completar el pago desde tu banco o billetera digital por un total de <Text style={{ fontWeight: '700' }}>{priceStr}</Text>.
        El doctor es despachado una vez confirmado el pago.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: C.ink, letterSpacing: -0.4, marginBottom: 6 },
  sub: { fontSize: 14, color: C.inkSoft, marginBottom: 18, lineHeight: 20 },
  timerBanner: {
    backgroundColor: '#FFF0F0', paddingVertical: 8, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFDEDE',
  },
  timerBannerText: { fontSize: 13, color: C.ink, flex: 1 },
  priceSummary: {
    backgroundColor: C.bg, padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: C.blue,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  priceLabel: { fontSize: 14, color: C.inkSoft },
  priceValue: { fontSize: 15, fontWeight: '600', color: C.ink },
  payOption: {
    padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  payIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dualLogo: { flexDirection: 'row', alignItems: 'center', width: 44, height: 44 },
  logoBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  logoText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  payTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  paySub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  featuredBadge: { backgroundColor: C.yapeSoft, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 },
  featuredText: { fontSize: 10, fontWeight: '700', color: C.yape, letterSpacing: 0.3 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: C.lineStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  couponRow: {
    marginTop: 20, padding: 16, borderRadius: 16,
    backgroundColor: C.blueSoft + '33', borderWidth: 1, borderColor: C.blueSoft,
  },
  couponLabel: { fontSize: 13, fontWeight: '700', color: C.blue },
  couponInput: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, fontSize: 16, color: C.ink, fontWeight: '700' },
  couponApply: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: C.blue, borderRadius: 10, justifyContent: 'center' },
  couponApplyText: { color: '#fff', fontWeight: '600' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 10 },
  secureText: { fontSize: 12, color: C.inkMuted, flex: 1, textAlign: 'center' },
  qrCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: C.line,
    padding: 24, alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 3, marginBottom: 24,
  },
  qrImage: { width: 220, height: 220, borderRadius: 8 },
  qrPlaceholder: { width: 220, height: 220, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  qrPhone: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: 2 },
  qrName: { fontSize: 14, color: C.inkSoft, fontWeight: '600' },
  opCodeInput: {
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line,
    fontSize: 20, fontWeight: '700', color: C.ink, letterSpacing: 2, textAlign: 'center',
  },
  opCodeLabel: { fontSize: 15, fontWeight: '700', color: C.ink },
  opCodeHint: { fontSize: 12, color: C.inkMuted, textAlign: 'center' },
  opCodeWrap: { width: '100%', gap: 8 },
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
  couponStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
  },
  couponSuccess: { backgroundColor: C.greenSoft },
  couponError: { backgroundColor: C.redSoft },
  couponStatusText: { fontSize: 13, fontWeight: '600' },
  smallRemoveBtn: {
    padding: 2,
  },
  removeCouponBtn: {
    padding: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: 10,
  },
  detailLink: {
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  detailLinkText: { fontSize: 12, fontWeight: '700', color: C.blue },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.line, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 16 },
});

const vs = StyleSheet.create({
  doctorProfile: {
    flexDirection: 'row', gap: 16, alignItems: 'center',
    padding: 16, borderRadius: 16, backgroundColor: C.bg,
    marginBottom: 20,
  },
  doctorName: { fontSize: 18, fontWeight: '700', color: C.ink },
  doctorSpec: { fontSize: 14, color: C.blue, fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ratingText: { fontSize: 12.5, color: C.inkSoft, fontWeight: '500' },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  infoItem: {
    flex: 1, padding: 12, borderRadius: 14,
    borderWidth: 1, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', gap: 4,
  },
  infoIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  infoLabel: { fontSize: 11, color: C.inkMuted, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '700', color: C.ink, textAlign: 'center' },
});

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Feather
          key={i}
          name="star"
          size={12}
          color={i <= Math.floor(rating) ? C.amber : C.lineStrong}
          fill={i <= Math.floor(rating) ? C.amber : 'none'}
        />
      ))}
    </View>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={vs.infoItem}>
      <View style={vs.infoIcon}>
        <Feather name={icon} size={16} color={C.blue} />
      </View>
      <View>
        <Text style={vs.infoLabel}>{label}</Text>
        <Text style={vs.infoValue}>{value}</Text>
      </View>
    </View>
  );
}
