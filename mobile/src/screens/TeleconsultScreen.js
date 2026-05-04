import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { useApp } from '../AppContext';
import { API_BASE } from '../config';

export default function TeleconsultScreen({ navigation, route }) {
  const { state } = useApp();
  const visitId = route.params?.visitId || state.visitId;

  const [joinUrl, setJoinUrl]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const headers = {};
        if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

        const res = await fetch(`${API_BASE}/visits/${visitId}/room`, { headers });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'No se pudo obtener la sala');
        }
        const data = await res.json();
        setJoinUrl(data.join_url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [visitId]);

  const handleEnd = () => {
    Alert.alert(
      'Finalizar consulta',
      '¿Seguro que quieres salir de la videollamada?',
      [
        { text: 'Continuar en llamada', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Daily Prebuilt posts window messages when the user leaves
  const injectedJs = `
    window.addEventListener('message', function(e) {
      try {
        var d = JSON.parse(e.data);
        if (d && d.action === 'left-meeting') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'left-meeting' }));
        }
      } catch(_) {}
    });
    true;
  `;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={s.loadingTitle}>Conectando con el médico…</Text>
        <Text style={s.loadingSub}>Preparando la sala de videollamada</Text>
      </View>
    );
  }

  if (error || !joinUrl) {
    return (
      <View style={s.center}>
        <View style={s.errorIcon}>
          <Feather name="video-off" size={30} color={C.red} />
        </View>
        <Text style={s.errorTitle}>No se pudo conectar</Text>
        <Text style={s.errorSub}>{error || 'Intenta nuevamente en un momento'}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={s.retryBtnTxt}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        source={{ uri: joinUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        // iOS: grant camera/mic permission for the daily.co domain automatically
        mediaCapturePermissionGrantType="grantIfSameHostElseDeny"
        // Android: needed for camera in WebView
        androidLayerType="hardware"
        injectedJavaScript={injectedJs}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.action === 'left-meeting') navigation.goBack();
          } catch (_) {}
        }}
        onError={() => setError('Error al cargar la videollamada')}
        renderLoading={() => (
          <View style={[s.center, StyleSheet.absoluteFill]}>
            <ActivityIndicator size="large" color={C.blue} />
          </View>
        )}
        startInLoadingState
      />

      {/* Floating top bar */}
      <SafeAreaView style={[s.overlay, { pointerEvents: 'box-none' }]} edges={['top']}>
        <View style={[s.topRow, { pointerEvents: 'box-none' }]}>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>EN CONSULTA</Text>
          </View>
          <TouchableOpacity style={s.endBtn} onPress={handleEnd} activeOpacity={0.85}>
            <Feather name="phone-off" size={14} color="#fff" />
            <Text style={s.endBtnTxt}>Finalizar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: C.bg, padding: 28 },
  loadingTitle: { marginTop: 16, fontSize: 17, fontWeight: '700', color: C.ink },
  loadingSub:   { marginTop: 6, fontSize: 13, color: C.inkSoft },
  errorIcon:    { width: 68, height: 68, borderRadius: 34, backgroundColor: C.redSoft,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  errorTitle:   { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 8 },
  errorSub:     { fontSize: 14, color: C.inkSoft, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  retryBtn:     { backgroundColor: C.blue, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
                  shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  retryBtnTxt:  { fontSize: 15, fontWeight: '700', color: '#fff' },

  overlay:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 10,
                  backgroundColor: 'rgba(0,0,0,0.55)' },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80',
                  shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4 },
  liveTxt:      { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  endBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: C.red, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  endBtnTxt:    { fontSize: 13, fontWeight: '700', color: '#fff' },
});
