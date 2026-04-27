import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { Icons } from './Icons';

const TABS = [
  { id: 'Home',     label: 'Inicio',    Icon: Icons.Home   },
  { id: 'Earnings', label: 'Ganancias', Icon: Icons.Wallet },
  { id: 'History',  label: 'Historial', Icon: Icons.Clock  },
  { id: 'Profile',  label: 'Perfil',    Icon: Icons.User   },
];

export default function TabBar({ current, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map(t => {
        const active = current === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={s.tab}
            onPress={() => navigation.navigate(t.id)}
            activeOpacity={0.7}
          >
            <t.Icon size={24} color={active ? C.blue : C.inkMuted} />
            <Text style={[s.label, active && s.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: C.inkMuted,
  },
  labelActive: {
    color: C.blue,
  },
});
