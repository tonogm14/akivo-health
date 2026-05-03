import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, R } from '../theme';

// ── Primary button
export function PrimaryButton({ children, onPress, disabled, variant = 'blue', size = 'lg', style }) {
  const bg = disabled ? '#C8D0D8' : variant === 'red' ? C.red : variant === 'green' ? C.green : C.blue;
  const h = size === 'xl' ? 64 : size === 'lg' ? 56 : 48;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[s.primaryBtn, { backgroundColor: bg, height: h }, style]}
    >
      {typeof children === 'string'
        ? <Text style={s.primaryBtnText}>{children}</Text>
        : children}
    </TouchableOpacity>
  );
}

// ── Secondary button
export function SecondaryButton({ children, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.secondaryBtn, style]}>
      <Text style={s.secondaryBtnText}>{children}</Text>
    </TouchableOpacity>
  );
}

// ── Top bar with back button and optional step dots
export function TopBar({ onBack, title, step, total, rightIcon, onRightPress }) {
  const hasBack = onBack !== undefined;
  const hasRight = !!rightIcon;

  return (
    <View style={s.topBar}>
      {hasBack ? (
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Feather name="chevron-left" size={22} color={C.ink} />
        </TouchableOpacity>
      ) : (
        hasRight && <View style={{ width: 36 }} />
      )}
      
      {title && (
        <Text 
          style={[
            s.topBarTitle, 
            hasBack && !hasRight && { marginRight: 36 },
            !hasBack && hasRight && { marginLeft: 36 }
          ]} 
          numberOfLines={1}
        >
          {title}
        </Text>
      )}

      {hasRight ? (
        <TouchableOpacity onPress={onRightPress} style={s.backBtn}>
          <Feather name={rightIcon} size={22} color={C.ink} />
        </TouchableOpacity>
      ) : (
        step !== undefined ? (
          <View style={s.stepDots}>
            {Array.from({ length: total || 4 }).map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  { width: i === step ? 24 : 8, backgroundColor: i <= step ? C.blue : C.lineStrong },
                ]}
              />
            ))}
          </View>
        ) : (
          hasBack && <View style={{ width: 36 }} />
        )
      )}
    </View>
  );
}

// ── Card
export function Card({ children, style, pad = 16 }) {
  return (
    <View style={[s.card, { padding: pad }, style]}>
      {children}
    </View>
  );
}

// ── Section title
export function SectionTitle({ children, style }) {
  return <Text style={[s.sectionTitle, style]}>{children}</Text>;
}

// ── Avatar with initials
export function Avatar({ name = '', size = 56, ring }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  const hue = (name.charCodeAt(0) * 7) % 360;
  const bg = `hsl(${hue}, 35%, 68%)`;
  return (
    <View style={[
      s.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ring && { borderWidth: 2.5, borderColor: ring },
    ]}>
      <Text style={[s.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

// ── Bottom action bar
export function BottomBar({ children }) {
  return <View style={s.bottomBar}>{children}</View>;
}

// ── Choice tile
export function ChoiceTile({ icon, label, sub, selected, onPress, danger }) {
  const ac = danger ? C.red : C.blue;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        s.choiceTile,
        selected && { borderColor: ac, backgroundColor: danger ? C.redSoft : C.blueSoft },
      ]}
    >
      <View style={[s.choiceIcon, selected && { backgroundColor: ac }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.choiceLabel}>{label}</Text>
        {sub ? <Text style={s.choiceSub}>{sub}</Text> : null}
      </View>
      <View style={[s.choiceRadio, selected && { backgroundColor: ac, borderColor: ac }]}>
        {selected && <Feather name="check" size={13} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

// ── Pill chip
export function Chip({ label, selected, onPress, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.chip, selected && { borderColor: C.blue, backgroundColor: C.blueSoft }]}
    >
      {icon}
      <Text style={[s.chipText, selected && { color: C.blueDark }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Label (form field label)
export function Label({ children, style }) {
  return <Text style={[s.label, style]}>{children}</Text>;
}

// ── Toggle pill
export function TogglePill({ children, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.togglePill, active && { borderColor: C.blue, backgroundColor: C.blueSoft }]}
    >
      <Text style={[s.togglePillText, active && { color: C.blueDark }]}>{children}</Text>
    </TouchableOpacity>
  );
}

// ── Input field
export function Input({ value, onChangeText, placeholder, multiline, rows, style, ...rest }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.inkMuted}
      multiline={multiline}
      numberOfLines={rows}
      style={[s.input, multiline && { height: rows ? rows * 24 + 16 : 80, textAlignVertical: 'top' }, style]}
      {...rest}
    />
  );
}

// ── Toggle switch
export function Toggle({ value, onChange }) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.9}
      style={[s.toggle, { backgroundColor: value ? C.blue : C.lineStrong }]}
    >
      <View style={[s.toggleKnob, value && { left: 20 }]} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  primaryBtn: {
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.ink,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    backgroundColor: '#fff',
    minHeight: 52,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: C.ink,
    textAlign: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  choiceTile: {
    width: '100%',
    padding: 16,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: C.ink,
    lineHeight: 20,
  },
  choiceSub: {
    fontSize: 13,
    color: C.inkSoft,
    marginTop: 2,
    lineHeight: 17,
  },
  choiceRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.lineStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkSoft,
    marginBottom: 8,
  },
  togglePill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.line,
    fontSize: 15,
    color: C.ink,
    backgroundColor: '#fff',
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    position: 'relative',
  },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
