import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

// Default centre: Huancayo, Peru (used when no GPS yet)
const DEFAULT_LAT = -12.0648;
const DEFAULT_LNG = -75.2111;

export default function MapViewComponent({
  height = 260,
  patientLat,
  patientLng,
  doctorLat,
  doctorLng,
  eta,
  pinLabel,
  pulse,
  interactive = false,
  onPointChange,
  onRegionChange,
  onRegionChangeComplete,
}) {
  const mapRef   = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the patient pin (location-pick screen)
  useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  // Center map on patient whenever patient coords change (if no doctor is active yet)
  useEffect(() => {
    if (!mapRef.current || !patientLat || !patientLng || hasDoctor) return;
    const t = setTimeout(() => {
      mapRef.current?.animateCamera({
        center: {
          latitude: Number(patientLat),
          longitude: Number(patientLng)
        }
      }, { duration: 1000 });
    }, 100);
    return () => clearTimeout(t);
  }, [patientLat, patientLng]);

  // Fit map to show both patient and doctor whenever doctor coords change
  useEffect(() => {
    if (!mapRef.current || !doctorLat || !doctorLng || !patientLat || !patientLng) return;
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: Number(patientLat), longitude: Number(patientLng) },
          { latitude: Number(doctorLat), longitude: Number(doctorLng) },
        ],
        { edgePadding: { top: 100, right: 80, bottom: 120, left: 80 }, animated: true }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [doctorLat, doctorLng]);

  const hasPatient = patientLat != null && patientLng != null;
  const hasDoctor  = doctorLat  != null && doctorLng  != null;

  const initialRegion = {
    latitude:       hasPatient ? Number(patientLat) : DEFAULT_LAT,
    longitude:      hasPatient ? Number(patientLng) : DEFAULT_LNG,
    latitudeDelta:  0.018,
    longitudeDelta: 0.018,
  };

  const pulseScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.4] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 0.15, 0] });

  return (
    <View style={[st.wrap, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={(e) => interactive && onPointChange && onPointChange(e.nativeEvent.coordinate)}
      >
        {/* ── Patient pin (Draggable if interactive) ── */}
        {hasPatient && (
          <Marker
            coordinate={{ latitude: Number(patientLat), longitude: Number(patientLng) }}
            anchor={{ x: 0.5, y: 1 }}
            draggable={interactive}
            onDragEnd={(e) => onPointChange && onPointChange(e.nativeEvent.coordinate)}
            tracksViewChanges={false}
          >
            <View style={st.patientWrap}>
              {pinLabel && (
                <View style={st.label}>
                  <Text style={st.labelText}>{pinLabel}</Text>
                </View>
              )}
              <View style={st.patientPin}>
                <Feather name="home" size={13} color="#fff" />
              </View>
              <View style={st.pinTail} />
            </View>
          </Marker>
        )}

        {/* ── Doctor pin (moving) ── */}
        {hasDoctor && (
          <Marker
            coordinate={{ latitude: Number(doctorLat), longitude: Number(doctorLng) }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={st.doctorPin}>
              <Feather name="navigation" size={15} color="#fff" />
            </View>
          </Marker>
        )}

        {/* ── Dashed route line ── */}
        {hasPatient && hasDoctor && (
          <Polyline
            coordinates={[
              { latitude: Number(doctorLat),  longitude: Number(doctorLng)  },
              { latitude: Number(patientLat), longitude: Number(patientLng) },
            ]}
            strokeColor={C.blue}
            strokeWidth={3}
            lineDashPattern={[10, 7]}
          />
        )}
      </MapView>

      {/* Pulse overlay */}
      {pulse && !hasDoctor && (
        <View style={[st.pulseWrap, { pointerEvents: 'none' }]}>
          <Animated.View style={[st.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
        </View>
      )}

      {/* ETA badge */}
      {eta && (
        <View style={st.etaBadge}>
          <Feather name="clock" size={13} color={C.ink} />
          <Text style={st.etaText}>{eta}</Text>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: '#E4EAF1' },

  // Patient pin
  patientWrap:  { alignItems: 'center' },
  label: {
    backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 20, marginBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  labelText:    { fontSize: 12, fontWeight: '600', color: C.ink },
  patientPin: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.blue,
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.blue, shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.blue,
    marginTop: -1,
  },

  // Doctor pin
  doctorPin: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.green,
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // Pulse overlay (centred on screen for location-pick)
  pulseWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  },
  pulseRing: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: C.blue, opacity: 0.25,
  },
  fixedPinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -20, // Tip of the pin (41px total height) at center
  },

  // ETA badge
  etaBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#fff',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  etaText: { fontSize: 13, fontWeight: '600', color: C.ink },
});
