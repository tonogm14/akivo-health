import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { C } from '../theme';

function DoctorHouseLogo({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M10 30 L32 10 L54 30 L54 54 C54 55.1 53.1 56 52 56 L12 56 C10.9 56 10 55.1 10 54 Z"
        stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
      <Path d="M6 32 L32 9 L58 32" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="28" y="28" width="8" height="20" rx="1.5" fill="#13A579" />
      <Rect x="22" y="34" width="20" height="8" rx="1.5" fill="#13A579" />
    </Svg>
  );
}

export default function SplashScreen({ navigation }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.linear })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => navigation.replace('Home'), 2400);
    return () => clearTimeout(t);
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={s.container}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[s.ring, {
          width: 220 + i * 140,
          height: 220 + i * 140,
          borderRadius: (220 + i * 140) / 2,
          opacity: 0.14 - i * 0.03,
        }]} />
      ))}

      <Animated.View style={[s.logoBox, { transform: [{ scale: pulseAnim }] }]}>
        <DoctorHouseLogo size={78} />
      </Animated.View>

      <Text style={s.title}>Doctor House</Text>
      <Text style={s.sub}>MÉDICO A DOMICILIO</Text>

      <View style={s.bottom}>
        <Animated.View style={[s.spinner, { transform: [{ rotate: spin }] }]} />
        <Text style={s.tagline}>Tu doctor en casa en ~45 minutos</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  logoBox: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.8,
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 3,
    marginTop: 8,
  },
  bottom: {
    position: 'absolute',
    bottom: 68,
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
});
