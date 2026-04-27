import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';
import { C } from '../theme';

function DHPLogo({ size = 48, color = '#fff' }) {
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

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar style="light" />
      <DHPLogo size={96} color="#fff" />
      <Text style={s.title}>Doctor House</Text>
      <Text style={s.pro}>PRO · DOCTORES</Text>
      <Text style={s.version}>v 1.0.0 · Perú</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    letterSpacing: -0.5,
  },
  pro: {
    fontSize: 12,
    fontWeight: '800',
    color: C.blue,
    letterSpacing: 3.5,
    marginTop: 4,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
});
