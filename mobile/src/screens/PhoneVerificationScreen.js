import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

export default function PhoneVerificationScreen({ navigation }) {
  const { state, setState } = useApp();

  const [step, setStep] = useState('phone');   // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(null);      // solo dev
  const otpRef = useRef(null);

  const fullPhone = `+51${phone.replace(/\D/g, '').slice(0, 9)}`;
  const phoneReady = phone.replace(/\D/g, '').length === 9;
  const otpReady = otp.length === 6;

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.error || 'Error al enviar código');

      setDevCode(data.dev_code || null);
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 200);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');

      // Guardar token permanentemente
      await AsyncStorage.multiSet([
        ['dh_auth_token', data.token],
        ['dh_user_phone', fullPhone],
      ]);
      setState({ ...state, authToken: data.token, userPhone: fullPhone });

      navigation.replace('Payment');
    } catch (err) {
      Alert.alert('Código inválido', err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => step === 'otp' ? setStep('phone') : navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.content}>

          {step === 'phone' ? (
            <>
              <View style={s.iconWrap}>
                <Feather name="smartphone" size={30} color={C.blue} />
              </View>
              <Text style={s.title}>Verifica tu número</Text>
              <Text style={s.sub}>
                Tu número se compartirá con el doctor para coordinar la visita y confirmar la cita.
              </Text>

              <View style={s.phoneRow}>
                <View style={s.prefix}>
                  <Text style={s.prefixText}>🇵🇪 +51</Text>
                </View>
                <TextInput
                  style={s.phoneInput}
                  value={phone}
                  onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 9))}
                  placeholder="999 999 999"
                  placeholderTextColor={C.inkMuted}
                  keyboardType="phone-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={phoneReady ? sendOtp : undefined}
                />
              </View>

              <View style={s.infoBox}>
                <Feather name="lock" size={14} color={C.inkMuted} />
                <Text style={s.infoText}>Solo se usa para verificar tu identidad y para que el doctor pueda contactarte en su llegada.</Text>
              </View>
            </>
          ) : (
            <>
              <View style={s.iconWrap}>
                <Feather name="message-square" size={30} color={C.blue} />
              </View>
              <Text style={s.title}>Código de verificación</Text>
              <Text style={s.sub}>
                Ingresa el código de 6 dígitos enviado a{' '}
                <Text style={{ fontWeight: '700' }}>{fullPhone}</Text>
              </Text>

              <TextInput
                ref={otpRef}
                style={s.otpInput}
                value={otp}
                onChangeText={v => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={C.inkMuted}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                returnKeyType="done"
                onSubmitEditing={otpReady ? verifyOtp : undefined}
              />

              {/* En demo, el código aparece aquí y en la consola del API */}
              {devCode && (
                <View style={s.devBox}>
                  <Feather name="terminal" size={14} color={C.amber} />
                  <Text style={s.devText}>
                    Modo demo — código:{' '}
                    <Text style={{ fontWeight: '800', letterSpacing: 2 }}>{devCode}</Text>
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={() => { setOtp(''); setStep('phone'); }} style={s.changePhone}>
                <Text style={s.changePhoneText}>Cambiar número</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <BottomBar>
          <PrimaryButton
            disabled={loading || (step === 'phone' ? !phoneReady : !otpReady)}
            onPress={step === 'phone' ? sendOtp : verifyOtp}
          >
            {loading
              ? 'Procesando...'
              : step === 'phone'
                ? 'Enviar código'
                : 'Verificar'}
          </PrimaryButton>
        </BottomBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '700', color: C.ink, letterSpacing: -0.5, marginBottom: 10 },
  sub: { fontSize: 15, color: C.inkSoft, lineHeight: 22, marginBottom: 28 },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  prefix: {
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: '#fff',
  },
  prefixText: { fontSize: 15, fontWeight: '600', color: C.ink },
  phoneInput: {
    flex: 1, height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    paddingHorizontal: 16, fontSize: 18, fontWeight: '600',
    color: C.ink, letterSpacing: 1,
  },
  infoBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: C.line,
  },
  infoText: { fontSize: 13, color: C.inkMuted, flex: 1, lineHeight: 18 },
  otpInput: {
    height: 72, borderRadius: 16,
    borderWidth: 2, borderColor: C.blue,
    backgroundColor: '#fff',
    fontSize: 34, fontWeight: '800',
    color: C.ink, textAlign: 'center',
    letterSpacing: 10, marginBottom: 16,
  },
  devBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: C.amberSoft, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: C.amber + '40',
    marginBottom: 16,
  },
  devText: { fontSize: 13, color: C.ink, flex: 1 },
  changePhone: { alignSelf: 'center', paddingVertical: 8 },
  changePhoneText: { fontSize: 14, color: C.blue, fontWeight: '600' },
});
