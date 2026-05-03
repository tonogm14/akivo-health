import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { TopBar, BottomBar, PrimaryButton } from '../components';
import { useApp } from '../AppContext';

const SLOTS = [
  { t: '08:00', tag: 'Mañana' }, { t: '09:00', tag: 'Mañana' },
  { t: '10:00', tag: 'Mañana' }, { t: '11:00', tag: 'Mañana' },
  { t: '12:00', tag: 'Mediodía' }, { t: '13:00', tag: 'Mediodía' },
  { t: '14:00', tag: 'Tarde' }, { t: '15:00', tag: 'Tarde' },
  { t: '16:00', tag: 'Tarde' }, { t: '17:00', tag: 'Tarde' },
  { t: '18:00', tag: 'Tarde' },
  { t: '19:00', tag: 'Noche' }, { t: '20:00', tag: 'Noche' }, { t: '21:00', tag: 'Noche' },
];
const GROUPS     = ['Mañana', 'Mediodía', 'Tarde', 'Noche'];
const DAY_NAMES  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTH_NAMES= ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const TIME_OPTS  = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00',
];
const COUNT_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

function dayLabel(d, i) {
  if (i === 0) return 'Hoy';
  if (i === 1) return 'Mañana';
  return DAY_NAMES[d.getDay()];
}
function formatDate(d) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}

// ─── Simple modal: count + doctor preference only ────────────────────────────

function RecurringSheet({ visible, initial, onClose, onConfirm }) {
  const [count, setCount]           = useState(initial?.count || 3);
  const [sameDoctor, setSameDoctor] = useState(initial?.sameDoctor ?? true);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={rs.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={rs.sheet} activeOpacity={1}>
          <View style={rs.handle} />
          <View style={rs.header}>
            <Text style={rs.title}>Visitas recurrentes</Text>
            <TouchableOpacity style={rs.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color={C.ink} />
            </TouchableOpacity>
          </View>
          <Text style={rs.subtitle}>
            Selecciona cuántas visitas y con quién. Luego podrás editar el día y hora de cada una.
          </Text>

          <View style={rs.section}>
            {/* Count */}
            <Text style={rs.label}>¿Cuántas visitas?</Text>
            <View style={rs.countRow}>
              {COUNT_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  style={[rs.countChip, count === n && rs.countChipSel]}
                  onPress={() => setCount(n)}
                >
                  <Text style={[rs.countChipText, count === n && rs.countChipTextSel]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Doctor preference */}
            <Text style={[rs.label, { marginTop: 24 }]}>Doctor</Text>
            <View style={rs.doctorRow}>
              <TouchableOpacity
                style={[rs.doctorBtn, sameDoctor && rs.doctorBtnSel]}
                onPress={() => setSameDoctor(true)}
                activeOpacity={0.8}
              >
                <Feather name="user" size={18} color={sameDoctor ? C.blue : C.inkSoft} />
                <View style={{ flex: 1 }}>
                  <Text style={[rs.doctorBtnTitle, sameDoctor && { color: C.blue }]}>Mismo doctor</Text>
                  <Text style={rs.doctorBtnSub}>Continuidad de atención</Text>
                </View>
                {sameDoctor && <Feather name="check" size={16} color={C.blue} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[rs.doctorBtn, !sameDoctor && rs.doctorBtnSel]}
                onPress={() => setSameDoctor(false)}
                activeOpacity={0.8}
              >
                <Feather name="users" size={18} color={!sameDoctor ? C.blue : C.inkSoft} />
                <View style={{ flex: 1 }}>
                  <Text style={[rs.doctorBtnTitle, !sameDoctor && { color: C.blue }]}>Cualquier doctor</Text>
                  <Text style={rs.doctorBtnSub}>Disponible en ese momento</Text>
                </View>
                {!sameDoctor && <Feather name="check" size={16} color={C.blue} />}
              </TouchableOpacity>
            </View>

            <PrimaryButton
              style={{ marginTop: 28 }}
              onPress={() => onConfirm({ count, sameDoctor })}
            >
              Confirmar
            </PrimaryButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Inline visit card editor ─────────────────────────────────────────────────

function VisitEditModal({ visit, idx, visible, pickDays, onClose, onSave }) {
  const [date, setDate] = useState(visit ? new Date(visit.date) : new Date());
  const [time, setTime] = useState(visit?.time || '10:00');

  if (!visit) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={rs.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={rs.sheet} activeOpacity={1}>
          <View style={rs.handle} />
          <View style={rs.header}>
            <Text style={rs.title}>Visita {idx + 1}</Text>
            <TouchableOpacity style={rs.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color={C.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={rs.section}>
              <Text style={rs.label}>Día</Text>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
              >
                {pickDays.map((d, di) => {
                  const sel = date.toDateString() === d.toDateString();
                  return (
                    <TouchableOpacity
                      key={di} onPress={() => setDate(d)}
                      style={[rs.dayChip, sel && rs.dayChipSel]}
                    >
                      <Text style={[rs.dayChipName, sel && { color: 'rgba(255,255,255,0.85)' }]}>
                        {DAY_NAMES[d.getDay()].toUpperCase()}
                      </Text>
                      <Text style={[rs.dayChipNum, sel && { color: '#fff' }]}>{d.getDate()}</Text>
                      <Text style={[rs.dayChipMonth, sel && { color: 'rgba(255,255,255,0.8)' }]}>
                        {MONTH_NAMES[d.getMonth()]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[rs.label, { marginTop: 20 }]}>Hora</Text>
              <View style={rs.timeGrid}>
                {TIME_OPTS.map(t => {
                  const sel = time === t;
                  return (
                    <TouchableOpacity
                      key={t} onPress={() => setTime(t)}
                      style={[rs.timeOpt, sel && rs.timeOptSel]}
                    >
                      <Text style={[rs.timeOptText, sel && { color: '#fff' }]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <PrimaryButton style={{ marginTop: 24 }} onPress={() => onSave(date, time)}>
                Guardar
              </PrimaryButton>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── ScheduleScreen ───────────────────────────────────────────────────────────

export default function ScheduleScreen({ navigation }) {
  const { state, setState }           = useApp();
  const [selDate, setSelDate]         = useState(() => {
    if (state.schedDate !== undefined) return state.schedDate;
    const now = new Date();
    // Si ya pasaron las 7pm (19:00), el primer slot de hoy (9pm) está a menos de 2h, mejor sugerir mañana.
    return now.getHours() >= 19 ? 1 : 0;
  });
  const [selTime, setSelTime]         = useState(state.schedTime ?? null);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editIdx, setEditIdx]         = useState(null);
  const recurring = state.recurring;
  
  // Reset time if it becomes disabled (e.g. switching to 'Today' late in the day)
  React.useEffect(() => {
    if (selDate === 0 && selTime) {
      const currentHour = new Date().getHours();
      const slotHour = parseInt(selTime.split(':')[0], 10);
      if (slotHour < currentHour + 2) {
        setSelTime(null);
      }
    }
  }, [selDate]);

  const today = new Date();
  const days  = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });
  const pickDays = Array.from({ length: 30 }, (_, i) => addDays(today, i + 1));

  const handleRecurringConfirm = ({ count, sameDoctor }) => {
    const base = days[selDate];
    const time = selTime || '10:00';
    const visits = Array.from({ length: count }, (_, i) => ({
      date: addDays(base, i + 1),
      time,
    }));
    const preview = visits.slice(0, 3).map(v => formatDate(v.date)).join(', ');
    const summary = `${count} visitas · ${preview}${count > 3 ? '…' : ''}`;
    setState({ ...state, recurring: { count, sameDoctor, visits, summary } });
    setRecurringOpen(false);
  };

  const handleVisitSave = (date, time) => {
    const visits = recurring.visits.map((v, i) =>
      i === editIdx ? { ...v, date, time } : v
    );
    const preview = visits.slice(0, 3).map(v => formatDate(v.date)).join(', ');
    const summary = `${recurring.count} visitas · ${preview}${recurring.count > 3 ? '…' : ''}`;
    setState({ ...state, recurring: { ...recurring, visits, summary } });
    setEditIdx(null);
  };

  const save = () => {
    setState({ ...state, schedDate: selDate, schedTime: selTime, when: 'schedule', urgency: 'schedule' });
    navigation.navigate('Patient');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onBack={() => navigation.goBack()} title="Programar visita" step={1} total={4} />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Text style={s.title}>¿Qué día?</Text>
        </View>

        {/* Day strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayStrip}>
          {days.map((d, i) => {
            const sel = selDate === i;
            return (
              <TouchableOpacity
                key={i} onPress={() => setSelDate(i)} activeOpacity={0.8}
                style={[s.dayBtn, sel && s.dayBtnSel]}
              >
                <Text style={[s.dayName, sel && { color: '#fff', opacity: 0.85 }]}>
                  {dayLabel(d, i).toUpperCase()}
                </Text>
                <Text style={[s.dayNum, sel && { color: '#fff' }]}>{d.getDate()}</Text>
                <Text style={[s.dayMonth, sel && { color: '#fff', opacity: 0.8 }]}>
                  {MONTH_NAMES[d.getMonth()]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.content}>
          <Text style={[s.title, { marginTop: 20 }]}>¿A qué hora?</Text>
          <Text style={s.sub}>
            El doctor llega dentro de los siguientes <Text style={{ fontWeight: '700' }}>60 min</Text> a la hora escogida.
          </Text>

          {(() => {
            const isToday = selDate === 0;
            const now = new Date();
            const currentHour = now.getHours();
            const minHour = currentHour + 2;

            return GROUPS.map(g => (
              <View key={g} style={{ marginBottom: 14 }}>
                <Text style={s.groupLabel}>{g}</Text>
                <View style={s.slotGrid}>
                  {SLOTS.filter(sl => sl.tag === g).map(sl => {
                    const slotHour = parseInt(sl.t.split(':')[0], 10);
                    const isDisabled = isToday && slotHour < minHour;
                    const sel = selTime === sl.t;

                    return (
                      <TouchableOpacity
                        key={sl.t} 
                        onPress={() => {
                          if (isDisabled) return;
                          setSelTime(sl.t);
                        }} 
                        activeOpacity={isDisabled ? 1 : 0.8}
                        style={[
                          s.slot, 
                          sel && s.slotSel,
                          isDisabled && { 
                            opacity: 0.5, 
                            backgroundColor: '#F2F2F2', 
                            borderColor: '#E0E0E0',
                            elevation: 0,
                            shadowOpacity: 0
                          }
                        ]}
                      >
                        <Text style={[
                          s.slotText, 
                          sel && { color: '#fff' }, 
                          isDisabled && { color: '#BDBDBD' }
                        ]}>
                          {sl.t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ));
          })()}

          {/* Recurring card - HIDDEN FOR NOW
          <TouchableOpacity
            style={[s.recurCard, recurring && s.recurCardActive]}
            onPress={() => setRecurringOpen(true)}
            activeOpacity={0.8}
          >
            <Feather name="repeat" size={20} color={recurring ? C.green : C.blue} />
            <View style={{ flex: 1 }}>
              {recurring ? (
                <>
                  <Text style={[s.recurTitle, { color: C.green }]}>Plan recurrente activo</Text>
                  <Text style={s.recurSub}>{recurring.summary}</Text>
                </>
              ) : (
                <>
                  <Text style={s.recurTitle}>¿Tratamiento regular?</Text>
                  <Text style={s.recurSub}>Programa visitas recurrentes con el mismo doctor.</Text>
                </>
              )}
            </View>
            {recurring ? (
              <TouchableOpacity
                onPress={() => setState({ ...state, recurring: null })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.recurClearBtn}
              >
                <Feather name="x" size={14} color={C.green} />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-right" size={16} color={C.blue} />
            )}
          </TouchableOpacity>
          */}

          {/* Visit cards — shown on screen once recurring is set */}
          {recurring?.visits?.length > 0 && (
            <View style={{ marginTop: 16, gap: 8 }}>
              <Text style={s.visitListTitle}>
                {recurring.count} visitas programadas ·{' '}
                <Text style={{ color: recurring.sameDoctor ? C.blue : C.inkSoft }}>
                  {recurring.sameDoctor ? 'Mismo doctor' : 'Cualquier doctor'}
                </Text>
              </Text>
              {recurring.visits.map((v, idx) => (
                <View key={idx} style={s.visitCard}>
                  <View style={s.visitBadge}>
                    <Text style={s.visitBadgeText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.visitDate}>{formatDate(new Date(v.date))}</Text>
                    <Text style={s.visitTime}>{v.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.editBtn}
                    onPress={() => setEditIdx(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="edit-2" size={15} color={C.blue} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <BottomBar>
        <PrimaryButton disabled={!selTime} onPress={save}>
          {selTime
            ? `Confirmar ${dayLabel(days[selDate], selDate).toLowerCase()} a las ${selTime}`
            : 'Elige una hora'}
        </PrimaryButton>
      </BottomBar>

      <RecurringSheet
        visible={recurringOpen}
        initial={recurring}
        onClose={() => setRecurringOpen(false)}
        onConfirm={handleRecurringConfirm}
      />

      <VisitEditModal
        visible={editIdx !== null}
        idx={editIdx ?? 0}
        visit={editIdx !== null ? recurring?.visits?.[editIdx] : null}
        pickDays={pickDays}
        onClose={() => setEditIdx(null)}
        onSave={handleVisitSave}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 4 },
  title:   { fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },
  sub:     { fontSize: 13, color: C.inkSoft, marginBottom: 14, lineHeight: 18 },
  dayStrip: { paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  dayBtn: {
    minWidth: 66, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', gap: 2,
  },
  dayBtnSel: { backgroundColor: C.blue, borderColor: C.blue },
  dayName:   { fontSize: 11, fontWeight: '600', color: C.inkMuted, letterSpacing: 0.3 },
  dayNum:    { fontSize: 22, fontWeight: '800', color: C.ink, lineHeight: 26 },
  dayMonth:  { fontSize: 10, color: C.inkMuted, marginTop: 2 },
  groupLabel: {
    fontSize: 12, fontWeight: '700', color: C.inkMuted,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
  },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    paddingVertical: 12, paddingHorizontal: 4, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    width: '22%', alignItems: 'center',
  },
  slotSel:  { backgroundColor: C.blue, borderColor: C.blue },
  slotText: { fontSize: 14, fontWeight: '700', color: C.ink },
  recurCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14, marginTop: 8,
    backgroundColor: C.blueSoft,
  },
  recurCardActive: { backgroundColor: C.greenSoft },
  recurTitle: { fontSize: 13.5, fontWeight: '700', color: C.ink },
  recurSub:   { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  recurClearBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.greenSoft, borderWidth: 1, borderColor: C.green + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  visitListTitle: { fontSize: 12, fontWeight: '700', color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  visitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  visitBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center',
  },
  visitBadgeText: { fontSize: 14, fontWeight: '800', color: C.blue },
  visitDate: { fontSize: 14, fontWeight: '700', color: C.ink },
  visitTime: { fontSize: 12, color: C.inkSoft, marginTop: 1 },
  editBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.blue + '30',
    alignItems: 'center', justifyContent: 'center',
  },
});

const rs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10, maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.line, alignSelf: 'center', marginBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 4,
  },
  title:    { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: C.inkSoft, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4, lineHeight: 19 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  label: {
    fontSize: 12, fontWeight: '700', color: C.inkMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
  },
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countChip: {
    width: 52, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center',
  },
  countChipSel:     { borderColor: C.blue, backgroundColor: C.blueSoft },
  countChipText:    { fontSize: 16, fontWeight: '800', color: C.ink },
  countChipTextSel: { color: C.blue },
  doctorRow: { gap: 8 },
  doctorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  doctorBtnSel:   { borderColor: C.blue, backgroundColor: C.blueSoft },
  doctorBtnTitle: { fontSize: 14, fontWeight: '700', color: C.ink },
  doctorBtnSub:   { fontSize: 12, color: C.inkSoft, marginTop: 1 },
  // Visit edit modal
  dayChip: {
    minWidth: 54, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
    alignItems: 'center', gap: 1,
  },
  dayChipSel:   { backgroundColor: C.blue, borderColor: C.blue },
  dayChipName:  { fontSize: 10, fontWeight: '600', color: C.inkMuted, letterSpacing: 0.3 },
  dayChipNum:   { fontSize: 18, fontWeight: '800', color: C.ink, lineHeight: 22 },
  dayChipMonth: { fontSize: 9, color: C.inkMuted },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timeOpt: {
    paddingVertical: 9, paddingHorizontal: 11, borderRadius: 8,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff',
  },
  timeOptSel:  { borderColor: C.blue, backgroundColor: C.blue },
  timeOptText: { fontSize: 13, fontWeight: '700', color: C.ink },
});
