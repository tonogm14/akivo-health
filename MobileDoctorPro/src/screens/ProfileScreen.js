import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TabBar from '../components/TabBar';
import { Icons } from '../components/Icons';
import { C } from '../theme';
import { useApp } from '../AppContext';

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Icons.Star key={i} size={11} fill={i <= rating ? C.amber : 'transparent'} color={C.amber} />
      ))}
    </View>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days  = Math.floor(hours / 24);
  return days === 1 ? 'ayer' : `hace ${days} días`;
}

function reviewName(fullName) {
  if (!fullName) return 'Paciente';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const MENU_ITEMS = [
  { Icon: Icons.User,     label: 'Datos personales' },
  { Icon: Icons.Doc,      label: 'Documentos y certificaciones' },
  { Icon: Icons.Map,      label: 'Zonas y horarios' },
  { Icon: Icons.Wallet,   label: 'Métodos de pago' },
  { Icon: Icons.Shield,   label: 'Privacidad y seguridad' },
  { Icon: Icons.Settings, label: 'Configuración' },
  { Icon: Icons.Chat,     label: 'Soporte Doctor House', screen: 'Support' },
];

export default function ProfileScreen({ navigation, route }) {
  const { state } = useApp();
  const d = state.doctor;
  const reviews = (d.recentReviews || []).slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Hero header */}
      <View style={pf.header}>
        <View style={pf.heroRow}>
          <View style={pf.avatar}>
            <Text style={pf.avatarTxt}>{d.initials || 'DR'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pf.drName}>{d.name || 'Cargando…'}</Text>
            <Text style={pf.drSub}>
              {d.specialty ? `${d.specialty} · CMP ${d.cmp}` : 'Cargando perfil…'}
            </Text>
            <View style={pf.levelBadge}>
              <Icons.Sparkle size={10} color="#fff" />
              <Text style={pf.levelTxt}>{d.level}</Text>
            </View>
          </View>
        </View>

        <View style={pf.statsRow}>
          {[
            { l: 'Rating',  v: d.rating ? `${d.rating}★` : '—' },
            { l: 'Reseñas', v: d.reviews },
            { l: 'Visitas', v: d.visits },
          ].map(x => (
            <View key={x.l} style={pf.statCell}>
              <Text style={pf.statVal}>{x.v}</Text>
              <Text style={pf.statLabel}>{x.l.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {/* Reviews */}
        <Text style={pf.sectionLabel}>RESEÑAS RECIENTES</Text>
        {reviews.length === 0 ? (
          <View style={[pf.reviewsCard, { padding: 20, alignItems: 'center' }]}>
            <Text style={{ fontSize: 13, color: C.inkMuted }}>
              Aún no tienes reseñas. ¡Completa tu primera visita!
            </Text>
          </View>
        ) : (
          <View style={pf.reviewsCard}>
            {reviews.map((rev, i) => (
              <View key={rev.id || i} style={[pf.reviewRow, i < reviews.length - 1 && pf.reviewBorder]}>
                <View style={pf.reviewTop}>
                  <Text style={pf.reviewName}>{reviewName(rev.patient_name)}</Text>
                  <StarRow rating={rev.rating} />
                </View>
                {rev.tags?.length > 0 && (
                  <Text style={pf.reviewText}>"{rev.tags.join(' · ')}"</Text>
                )}
                <Text style={pf.reviewAgo}>{timeAgo(rev.created_at)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu */}
        <Text style={pf.sectionLabel}>CUENTA</Text>
        <View style={pf.menuCard}>
          {MENU_ITEMS.map((r, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[pf.menuRow, i < arr.length - 1 && pf.menuBorder]}
              activeOpacity={0.7}
              onPress={r.screen ? () => navigation.navigate(r.screen) : undefined}
            >
              <View style={pf.menuIcon}>
                <r.Icon size={17} color={C.inkSoft} />
              </View>
              <Text style={pf.menuLabel}>{r.label}</Text>
              <Icons.ChevR size={16} color={C.inkMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={pf.logoutBtn}
          onPress={() => Alert.alert('Cerrar sesión', '¿Estás segura?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sí, salir', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Splash' }] }) },
          ])}
          activeOpacity={0.8}
        >
          <Text style={pf.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={pf.version}>Doctor House Pro · v 1.0.0</Text>
      </ScrollView>

      <TabBar current="Profile" navigation={navigation} />
    </View>
  );
}

const pf = StyleSheet.create({
  header:    { backgroundColor: C.ink, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 18 },
  heroRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar:    { width: 64, height: 64, borderRadius: 32, backgroundColor: C.blue,
               alignItems: 'center', justifyContent: 'center',
               borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { fontSize: 20, fontWeight: '800', color: '#fff' },
  drName:    { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  drSub:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  levelBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
               paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
               backgroundColor: C.blue, alignSelf: 'flex-start' },
  levelTxt:  { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },
  statsRow:  { flexDirection: 'row', padding: 12, backgroundColor: 'rgba(255,255,255,0.1)',
               borderRadius: 14 },
  statCell:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },

  sectionLabel:{ fontSize: 11, fontWeight: '700', color: C.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  reviewsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, marginBottom: 14, overflow: 'hidden' },
  reviewRow:   { padding: 14 },
  reviewBorder:{ borderBottomWidth: 1, borderBottomColor: C.line },
  reviewTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewName:  { fontSize: 13, fontWeight: '700', color: C.ink },
  reviewText:  { fontSize: 12, color: C.inkSoft, lineHeight: 18 },
  reviewAgo:   { fontSize: 10, color: C.inkMuted, marginTop: 4 },

  menuCard:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 16 },
  menuRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuBorder:  { borderBottomWidth: 1, borderBottomColor: C.line },
  menuIcon:    { width: 34, height: 34, borderRadius: 10, backgroundColor: C.bg,
                 alignItems: 'center', justifyContent: 'center' },
  menuLabel:   { flex: 1, fontSize: 13.5, fontWeight: '600', color: C.ink },

  logoutBtn:   { borderRadius: 12, borderWidth: 1.5, borderColor: C.red, padding: 14, alignItems: 'center' },
  logoutTxt:   { fontSize: 13, fontWeight: '700', color: C.red },
  version:     { textAlign: 'center', fontSize: 10, color: C.inkMuted, marginTop: 14 },
});
