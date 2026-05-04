import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { API_BASE, DEV_DOCTOR_ID } from '../config';

export default function TeleconsultScreen({ navigation }) {
  const { state, setState } = useApp();
  const visitId = state.activeVisit?.id;

  const [joinUrl, setJoinUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!visitId) {
      setError('No hay visita activa');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/visits/${visitId}/room/doctor`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'No se pudo obtener la sala');
        }
        const data = await res.json();
        setJoinUrl(data.join_url);

        // Mark visit as in_consultation when doctor joins
        await fetch(`${API_BASE}/visits/${visitId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_consultation' }),
        }).catch(() => {});
        setState(s => ({
          ...s,
          activeVisit: {
            ...s.activeVisit,
            status: 'in_consultation',
            consultation_started_at: new Date().toISOString(),
          },
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [visitId]);

  const handleEnd = () => {
    Alert.alert(
      'Finalizar videollamada',
      '¿Deseas salir? Podrás completar los datos de la consulta a continuación.',
      [
        { text: 'Continuar en llamada', style: 'cancel' },
        { text: 'Salir y completar consulta', style: 'destructive', onPress: goToConsultation },
      ]
    );
  };

  const goToConsultation = () => {
    navigation.replace('Consultation');
  };

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
        <Text style={s.loadingTitle}>Iniciando consulta…</Text>
        <Text style={s.loadingSub}>Preparando la sala de videollamada</Text>
      </View>
    );
  }

  if (error || !joinUrl) {
    return (
      <View style={s.center}>
        <View style={s.errorIcon}>
          <Icons.Camera size={30} color={C.red} />
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
        mediaCapturePermissionGrantType="grantIfSameHostElseDeny"
        androidLayerType="hardware"
        injectedJavaScript={injectedJs}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.action === 'left-meeting') goToConsultation();
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

      <SafeAreaView style={[s.overlay, { pointerEvents: 'box-none' }]} edges={['top']}>
        <View style={[s.topRow, { pointerEvents: 'box-none' }]}>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>EN CONSULTA</Text>
          </View>
          <TouchableOpacity style={s.endBtn} onPress={handleEnd} activeOpacity={0.85}>
            <Icons.Phone size={14} color="#fff" />
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
