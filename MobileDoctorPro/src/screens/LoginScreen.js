import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';
import { C } from '../theme';

function DHPLogo({ size = 48, color = C.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M24 5L5 20v22a2 2 0 0 0 2 2h34a2 2 0 0 0 2-2V20L24 5z"
        stroke={color} strokeWidth={3} strokeLinejoin="round" fill="none"/>
      <Rect x={20} y={22} width={8} height={4} fill={color}/>
      <Rect x={22} y={22} width={4} height={13} fill={color}/>
      <Rect x={20} y={28} width={8} height={3} fill={color}/>
    </Svg>
  );
}

export default function LoginScreen({ navigation }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <DHPLogo size={56} />
          <Text style={s.title}>Bienvenida de vuelta</Text>
          <Text style={s.subtitle}>Ingresa a tu cuenta Doctor House Pro.</Text>
        </View>

        <View style={s.form}>
          <TouchableOpacity style={s.googleBtn} activeOpacity={0.8}>
            <Text style={s.googleText}>Continuar con Google</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine}/>
            <Text style={s.dividerLabel}>O CON TU EMAIL</Text>
            <View style={s.dividerLine}/>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput
              style={s.input}
              defaultValue="dra.quispe@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={C.inkMuted}
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Contraseña</Text>
            <TextInput
              style={s.input}
              defaultValue="••••••••"
              secureTextEntry
              placeholderTextColor={C.inkMuted}
            />
          </View>

          <TouchableOpacity style={s.forgotBtn}>
            <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.loginBtn}
            activeOpacity={0.85}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={s.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.apply}>
          ¿Aún no aplicaste?{' '}
          <Text style={{ color: C.blue, fontWeight: '700' }}>Aplica para ser doctor →</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1 },
  header:  { paddingTop: 48, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  title:   { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginTop: 14 },
  subtitle:{ fontSize: 14, color: C.inkSoft, marginTop: 6, textAlign: 'center' },

  form:    { paddingHorizontal: 20, flex: 1 },

  googleBtn: {
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    borderRadius: 14, padding: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  googleText: { fontSize: 14, fontWeight: '700', color: C.ink },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.line },
  dividerLabel:{ fontSize: 11, color: C.inkMuted, fontWeight: '700' },

  fieldGroup:  { marginBottom: 14 },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: C.ink, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: C.line, borderRadius: 12,
    padding: 14, fontSize: 15, color: C.ink, backgroundColor: '#fff',
  },

  forgotBtn:  { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 12, fontWeight: '700', color: C.blue },

  loginBtn: {
    backgroundColor: C.blue, borderRadius: 14, padding: 16,
    alignItems: 'center',
    shadowColor: C.blue, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38, shadowRadius: 12, elevation: 6,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  apply: { textAlign: 'center', fontSize: 12, color: C.inkSoft, padding: 20 },
});
