// Splash screen with Doctor House logo + Scheduling screens
const { color: CS, font: FS, radius: RS } = window.DH;

// ═══════════════════════════════════════════════════════════
// LOGO COMPONENT — "Doctor House"
// A house silhouette with a medical cross integrated
// ═══════════════════════════════════════════════════════════
function DoctorHouseLogo({ size = 56, color = '#fff', mono = false }) {
  const stroke = color;
  const accent = mono ? color : '#13A579';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* House outline */}
      <path d="M10 30 L32 10 L54 30 L54 54 C54 55.1 53.1 56 52 56 L12 56 C10.9 56 10 55.1 10 54 Z"
        stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      {/* Roof accent line */}
      <path d="M6 32 L32 9 L58 32" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Medical cross inside */}
      <rect x="28" y="28" width="8" height="20" rx="1.5" fill={accent} />
      <rect x="22" y="34" width="20" height="8" rx="1.5" fill={accent} />
    </svg>
  );
}

function LogoLockup({ size = 1, inverted = false }) {
  const textColor = inverted ? '#fff' : CS.ink;
  const subColor = inverted ? 'rgba(255,255,255,0.75)' : CS.inkSoft;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 * size }}>
      <div style={{
        width: 52 * size, height: 52 * size, borderRadius: 14 * size,
        background: inverted ? 'rgba(255,255,255,0.15)' : CS.blue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: inverted ? '1px solid rgba(255,255,255,0.3)' : 'none',
      }}>
        <DoctorHouseLogo size={34 * size} color="#fff" />
      </div>
      <div>
        <div style={{
          fontFamily: FS.display, fontSize: 22 * size, fontWeight: 800,
          color: textColor, letterSpacing: -0.6, lineHeight: 1,
        }}>Doctor House</div>
        <div style={{
          fontFamily: FS.ui, fontSize: 11 * size, fontWeight: 600,
          color: subColor, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
        }}>Médico a domicilio</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 0. SPLASH
// ═══════════════════════════════════════════════════════════
function SplashScreen({ nav }) {
  React.useEffect(() => {
    const t = setTimeout(() => nav('home'), 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'relative', height: '100%',
      background: `linear-gradient(165deg, ${CS.blue} 0%, #0F4AB5 60%, #0B3A94 100%)`,
      color: '#fff', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Decorative rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '42%',
          width: 220 + i * 140, height: 220 + i * 140, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.14)',
          transform: 'translate(-50%, -50%)',
          animation: `dhRing 3.2s ease-out ${i * 0.7}s infinite`,
        }} />
      ))}

      {/* Logo */}
      <div style={{
        width: 128, height: 128, borderRadius: 32,
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32, position: 'relative', zIndex: 1,
        backdropFilter: 'blur(8px)',
        animation: 'dhPulseSolid 2.4s ease-in-out infinite',
      }}>
        <DoctorHouseLogo size={78} />
      </div>

      <div style={{
        fontFamily: FS.display, fontSize: 36, fontWeight: 800,
        letterSpacing: -0.8, position: 'relative', zIndex: 1,
      }}>Doctor House</div>
      <div style={{
        fontFamily: FS.ui, fontSize: 13, fontWeight: 600,
        color: 'rgba(255,255,255,0.85)', letterSpacing: 3,
        textTransform: 'uppercase', marginTop: 8, position: 'relative', zIndex: 1,
      }}>Médico a domicilio</div>

      {/* Bottom tagline + loader */}
      <div style={{
        position: 'absolute', bottom: 68, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          border: '2.5px solid rgba(255,255,255,0.2)',
          borderTopColor: '#fff',
          animation: 'dhSpin 0.9s linear infinite',
        }} />
        <div style={{ fontSize: 13, opacity: 0.8, fontFamily: FS.ui }}>
          Tu doctor en casa en ~45 minutos
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3b. SCHEDULE — date + time picker (shown when user picks "Programar")
// ═══════════════════════════════════════════════════════════
function ScheduleScreen({ state, setState, nav }) {
  const today = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    return d;
  });
  const [selDate, setSelDate] = React.useState(state.schedDate || 1); // idx
  const [selTime, setSelTime] = React.useState(state.schedTime || null);
  const [recurringOpen, setRecurringOpen] = React.useState(false);
  const recurring = state.recurring;

  const dayLabel = (d, i) => {
    if (i === 0) return 'Hoy';
    if (i === 1) return 'Mañana';
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
  };

  const slots = [
    { t: '08:00', tag: 'Mañana' },
    { t: '09:00', tag: 'Mañana' },
    { t: '10:00', tag: 'Mañana' },
    { t: '11:00', tag: 'Mañana' },
    { t: '12:00', tag: 'Mediodía' },
    { t: '13:00', tag: 'Mediodía' },
    { t: '14:00', tag: 'Tarde' },
    { t: '15:00', tag: 'Tarde' },
    { t: '16:00', tag: 'Tarde' },
    { t: '17:00', tag: 'Tarde' },
    { t: '18:00', tag: 'Tarde' },
    { t: '19:00', tag: 'Noche' },
    { t: '20:00', tag: 'Noche' },
    { t: '21:00', tag: 'Noche' },
  ];
  // fake availability
  const unavailable = new Set(['10:00', '14:00', '19:00']);

  const groups = ['Mañana', 'Mediodía', 'Tarde', 'Noche'];

  const save = () => {
    if (state.returnTo === 'reorder') {
      setState({ ...state, schedDate: selDate, schedTime: selTime, when: 'schedule', urgency: 'schedule', returnTo: null });
      nav('reorder');
    } else {
      setState({ ...state, schedDate: selDate, schedTime: selTime, when: 'schedule', urgency: 'schedule' });
      nav('patient');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: CS.bgElev }}>
      <div style={{ height: 54 }} />
      <TopBar onBack={() => nav('location')} title="Programar visita" step={1} total={4} />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 0 20px' }}>
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontFamily: FS.display, fontSize: 22, fontWeight: 700, color: CS.ink, letterSpacing: -0.4 }}>
            ¿Qué día?
          </div>
        </div>

        {/* Day strip */}
        <div
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          style={{
            display: 'flex', gap: 10, padding: '14px 20px 4px',
            overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {days.map((d, i) => {
            const sel = selDate === i;
            return (
              <button key={i} onClick={() => setSelDate(i)} style={{
                minWidth: 66, padding: '10px 8px', borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${sel ? CS.blue : CS.line}`,
                background: sel ? CS.blue : '#fff',
                color: sel ? '#fff' : CS.ink,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                fontFamily: FS.ui, flexShrink: 0,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: sel ? 0.85 : 0.6, letterSpacing: 0.3 }}>
                  {dayLabel(d, i).toUpperCase()}
                </div>
                <div style={{ fontFamily: FS.display, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                  {d.getDate()}
                </div>
                <div style={{ fontSize: 10, opacity: sel ? 0.8 : 0.55, marginTop: 2 }}>
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ fontFamily: FS.display, fontSize: 22, fontWeight: 700, color: CS.ink, letterSpacing: -0.4, marginBottom: 4 }}>
            ¿A qué hora?
          </div>
          <div style={{ fontSize: 13, color: CS.inkSoft, marginBottom: 14 }}>
            El doctor llega dentro de los siguientes <b>60 min</b> a la hora escogida.
          </div>
        </div>

        {groups.map(g => (
          <div key={g} style={{ padding: '4px 20px 14px' }}>
            <div style={{
              fontFamily: FS.ui, fontSize: 12, fontWeight: 700, color: CS.inkMuted,
              textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
            }}>{g}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {slots.filter(s => s.tag === g).map(s => {
                const avail = !unavailable.has(s.t);
                const sel = selTime === s.t;
                return (
                  <button key={s.t} disabled={!avail} onClick={() => setSelTime(s.t)} style={{
                    padding: '12px 4px', borderRadius: 10, cursor: avail ? 'pointer' : 'not-allowed',
                    border: `1.5px solid ${sel ? CS.blue : CS.line}`,
                    background: !avail ? '#F4F6F8' : (sel ? CS.blue : '#fff'),
                    color: !avail ? CS.inkMuted : (sel ? '#fff' : CS.ink),
                    fontFamily: FS.display, fontSize: 14, fontWeight: 700,
                    textDecoration: !avail ? 'line-through' : 'none',
                    opacity: !avail ? 0.5 : 1,
                  }}>{s.t}</button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Recurring */}
        <div style={{ padding: '0 20px' }}>
          <button onClick={() => setRecurringOpen(true)} style={{
            width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
            padding: 0, background: 'transparent',
          }}>
            <Card pad={14} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: recurring ? CS.greenSoft : CS.blueSoft, border: 'none',
            }}>
              <I.Calendar size={20} stroke={recurring ? CS.green : CS.blue} />
              <div style={{ flex: 1, fontFamily: FS.ui, fontSize: 13, color: CS.ink }}>
                {recurring ? (
                  <><b>Plan recurrente activo</b> · {recurring.summary}</>
                ) : (
                  <><b>¿Tratamiento regular?</b> Programa visitas recurrentes con el mismo doctor.</>
                )}
              </div>
              <I.ChevronRight size={16} stroke={recurring ? CS.green : CS.blue} />
            </Card>
          </button>
        </div>
      </div>

      {recurringOpen && (
        <RecurringSheet
          initial={recurring}
          onClose={() => setRecurringOpen(false)}
          onSave={(r) => { setState({ ...state, recurring: r }); setRecurringOpen(false); }}
        />
      )}

      <BottomBar>
        <PrimaryButton
          disabled={!selTime}
          onClick={save}
        >
          {selTime ? `Confirmar ${dayLabel(days[selDate], selDate).toLowerCase()} a las ${selTime}` : 'Elige una hora'}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RECURRING VISITS — bottom sheet from ScheduleScreen
// ═══════════════════════════════════════════════════════════
function RecurringSheet({ initial, onClose, onSave }) {
  const [freq, setFreq] = React.useState(initial?.freq || 'weekly');
  const [count, setCount] = React.useState(initial?.count || 4);
  const [sameDoctor, setSameDoctor] = React.useState(initial?.sameDoctor ?? true);
  const [day, setDay] = React.useState(initial?.day || 'Mar');
  const [time, setTime] = React.useState(initial?.time || '10:00');

  const freqLabel = { weekly: 'semanal', biweekly: 'cada 2 semanas', monthly: 'mensual' }[freq];
  const pricePerVisit = 120 + (sameDoctor ? 10 : 0);
  const total = pricePerVisit * count;
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const times = ['08:00', '09:00', '10:00', '11:00', '15:00', '17:00', '19:00'];

  const summary = `${count} visitas ${freqLabel}, ${day} ${time}${sameDoctor ? ' · Dra. Ana' : ''}`;

  const save = () => onSave({ freq, count, sameDoctor, day, time, summary, total });

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.45)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 0 20px',
        maxHeight: '88%', display: 'flex', flexDirection: 'column',
        animation: 'dhSheet 0.25s ease-out',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: CS.line, margin: '6px auto 12px' }} />

        <div style={{ padding: '0 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FS.display, fontSize: 20, fontWeight: 800, color: CS.ink, letterSpacing: -0.4 }}>
            Visitas recurrentes
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 16, border: 'none',
            background: CS.bg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.X size={18} /></button>
        </div>
        <div style={{ padding: '4px 20px 14px', fontSize: 13, color: CS.inkSoft }}>
          Ideal para tratamientos, adultos mayores o controles regulares.
        </div>

        <div style={{ overflow: 'auto', padding: '0 20px 4px' }}>
          {/* Frequency */}
          <Label style={{ marginTop: 6 }}>Frecuencia</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['weekly', 'Semanal'], ['biweekly', 'Cada 2 semanas'], ['monthly', 'Mensual']].map(([id, lbl]) => (
              <button key={id} onClick={() => setFreq(id)} style={{
                flex: 1, padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${freq === id ? CS.blue : CS.line}`,
                background: freq === id ? CS.blueSoft : '#fff',
                fontFamily: FS.ui, fontSize: 13, fontWeight: 700,
                color: freq === id ? CS.blueDark : CS.ink,
              }}>{lbl}</button>
            ))}
          </div>

          {/* Count */}
          <Label style={{ marginTop: 18 }}>¿Cuántas visitas?</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[4, 8, 12, 0].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                flex: 1, padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${count === n ? CS.blue : CS.line}`,
                background: count === n ? CS.blueSoft : '#fff',
                fontFamily: FS.display, fontSize: 15, fontWeight: 700, color: CS.ink,
              }}>{n === 0 ? 'Hasta cancelar' : n}</button>
            ))}
          </div>

          {/* Preferred day */}
          <Label style={{ marginTop: 18 }}>Día preferido</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {days.map(d => (
              <button key={d} onClick={() => setDay(d)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${day === d ? CS.blue : CS.line}`,
                background: day === d ? CS.blue : '#fff',
                color: day === d ? '#fff' : CS.ink,
                fontFamily: FS.ui, fontSize: 12, fontWeight: 700,
              }}>{d}</button>
            ))}
          </div>

          {/* Preferred time */}
          <Label style={{ marginTop: 14 }}>Hora preferida</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {times.map(t => (
              <button key={t} onClick={() => setTime(t)} style={{
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${time === t ? CS.blue : CS.line}`,
                background: time === t ? CS.blue : '#fff',
                color: time === t ? '#fff' : CS.ink,
                fontFamily: FS.display, fontSize: 13, fontWeight: 700,
              }}>{t}</button>
            ))}
          </div>

          {/* Same doctor toggle */}
          <div style={{
            marginTop: 18, padding: 14, borderRadius: 14,
            border: `1.5px solid ${sameDoctor ? CS.blue : CS.line}`,
            background: sameDoctor ? CS.blueSoft : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name="Ana Morales" size={44} ring={sameDoctor ? CS.blue : undefined} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FS.ui, fontSize: 14, fontWeight: 700, color: CS.ink }}>
                  Solo con Dra. Ana Morales
                </div>
                <div style={{ fontSize: 12, color: CS.inkSoft, marginTop: 2 }}>
                  Continuidad de atención · +S/ 10 por visita
                </div>
              </div>
              <button onClick={() => setSameDoctor(!sameDoctor)} style={{
                width: 44, height: 26, borderRadius: 13, border: 'none', padding: 0,
                background: sameDoctor ? CS.blue : '#D3DCE4', position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: sameDoctor ? 20 : 2,
                  width: 22, height: 22, borderRadius: 11, background: '#fff',
                  transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 14,
            background: CS.ink, color: '#fff',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: 0.6, textTransform: 'uppercase' }}>Resumen</div>
            <div style={{ fontFamily: FS.display, fontSize: 17, fontWeight: 700, marginTop: 6, letterSpacing: -0.3 }}>
              {count === 0 ? 'Sin límite' : `${count} visitas`} · {freqLabel} · {day} {time}
            </div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
              {sameDoctor ? 'Dra. Ana Morales · ' : 'Cualquier doctor · '}
              S/ {pricePerVisit} × visita
            </div>
            {count > 0 && (
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span style={{ fontSize: 13, opacity: 0.7 }}>Total</span>
                <span style={{ fontFamily: FS.display, fontSize: 22, fontWeight: 800 }}>S/ {total}</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: CS.inkMuted, marginTop: 10, lineHeight: 1.4 }}>
            Pagas cada visita por separado. Puedes pausar o cancelar el plan cuando quieras.
          </div>
        </div>

        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid ' + CS.line, marginTop: 10 }}>
          <PrimaryButton onClick={save}>
            {initial ? 'Actualizar plan' : 'Activar plan recurrente'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REORDER — "Pedir otra vez" hybrid flow
// Shows summary of previous visit, each field editable.
// ═══════════════════════════════════════════════════════════
function ReorderScreen({ state, setState, nav }) {
  // Previous visit snapshot (would come from API)
  const prev = {
    doctor: { name: 'Luis Vargas', specialty: 'Medicina general', rating: 4.9, photo: 'LV' },
    date: '12 de abril',
    reason: 'Fiebre y dolor de cabeza',
    address: 'Av. Pardo 432, Miraflores',
    patient: 'Carla Rojas · 34 años',
    payment: 'Yape · S/ 120',
    price: 120,
  };

  // Pull latest values from state if user edited them; fall back to prev visit.
  // Reason: prefer fresh edit from SymptomsScreen
  const symLabels = {
    fever: 'Fiebre', head: 'Dolor de cabeza', stomach: 'Dolor de estómago',
    throat: 'Garganta', cough: 'Tos', body: 'Dolor de cuerpo', skin: 'Piel', breath: 'Respirar'
  };
  const reasonFromState = state.symptomsEdited && state.symptoms && state.symptoms.length
    ? state.symptoms.map(s => symLabels[s] || s).slice(0, 3).join(', ')
    : null;
  const reason = reasonFromState ?? state.reorderReason ?? prev.reason;
  const address = state.address ?? prev.address;
  // Patient: prefer fresh edit from PatientScreen if present
  const patientFromState = state.patient && state.patient.name
    ? `${state.patient.name}${state.patient.ageGroup ? ' · ' + ({
      baby: 'Bebé', child: 'Niño/a', teen: 'Joven', adult: 'Adulto', senior: 'Mayor', other: '—',
    }[state.patient.ageGroup] || '') : ''}`
    : null;
  const patient = patientFromState ?? state.reorderPatient ?? prev.patient;
  const payment = state.reorderPayment ?? prev.payment;
  const sameDoctor = state.sameDoctor ?? true;
  const when = state.reorderWhen ?? 'now';

  // Initialise once on mount so edited-flow pantallas see the "current" values
  React.useEffect(() => {
    const patch = {};
    if (state.address == null) patch.address = prev.address;
    if (state.reorderReason == null) patch.reorderReason = prev.reason;
    if (state.reorderPatient == null) patch.reorderPatient = prev.patient;
    if (state.reorderPayment == null) patch.reorderPayment = prev.payment;
    if (state.reorderWhen == null) patch.reorderWhen = 'now';
    if (state.sameDoctor == null) patch.sameDoctor = true;
    if (Object.keys(patch).length) setState({ ...state, ...patch });
    // eslint-disable-next-line
  }, []);

  // Scheduled day label (if present)
  const today = new Date();
  const schedDayIdx = state.schedDate ?? 1;
  const schedDay = new Date(today); schedDay.setDate(today.getDate() + schedDayIdx);
  const schedDayLabel = (() => {
    const dn = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    if (schedDayIdx === 0) return 'Hoy';
    if (schedDayIdx === 1) return 'Mañana';
    return `${dn[schedDay.getDay()]} ${schedDay.getDate()}`;
  })();
  const whenLabel = when === 'now'
    ? 'Ahora · llega en ~45 minutos'
    : (state.schedTime ? `${schedDayLabel} a las ${state.schedTime}` : `${schedDayLabel} · escoge hora`);

  const goEdit = (target, extra = {}) => {
    setState({ ...state, returnTo: 'reorder', ...extra });
    nav(target);
  };

  const toggleDoctor = () => setState({ ...state, sameDoctor: !sameDoctor });

  const confirm = () => {
    setState({
      ...state,
      reorder: true,
      sameDoctor,
      when,
      urgency: when === 'now' ? 'now' : 'schedule',
      returnTo: null,
    });
    // If scheduled → ya está agendado, pasa a matching (o feedback de agendamiento).
    // If ahora → va a pago + OTP.
    if (when === 'schedule') {
      nav('matching');
    } else {
      nav('payment');
    }
  };

  const Row = ({ icon, label, value, onEdit, muted }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', background: '#fff',
      borderBottom: `1px solid ${CS.line}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: CS.blueSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: CS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{label}</div>
        <div style={{
          fontFamily: FS.ui, fontSize: 14, fontWeight: 600,
          color: muted ? CS.inkSoft : CS.ink,
          marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{value}</div>
      </div>
      {onEdit && (
        <button onClick={onEdit} style={{
          padding: '6px 10px', borderRadius: 8, border: `1px solid ${CS.line}`,
          background: '#fff', fontSize: 12, fontWeight: 600, color: CS.blueDark, cursor: 'pointer',
          fontFamily: FS.ui,
        }}>Cambiar</button>
      )}
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: CS.bg }}>
      <TopBar onBack={() => nav('home')} title="Pedir otra vez" />

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 120 }}>

        {/* Hero — doctor card */}
        <div style={{ padding: '8px 20px 18px' }}>
          <div style={{
            padding: 16, borderRadius: 18, background: '#fff',
            border: '1.5px solid ' + CS.line,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <Avatar name={prev.doctor.name} size={56} ring={sameDoctor ? CS.blue : undefined} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FS.display, fontSize: 17, fontWeight: 800, color: CS.ink, letterSpacing: -0.2 }}>
                Dr. {prev.doctor.name}
              </div>
              <div style={{ fontSize: 12, color: CS.inkSoft, marginTop: 2 }}>
                {prev.doctor.specialty} · {prev.date}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <I.Star size={13} stroke={CS.amber || '#F5A623'} fill={CS.amber || '#F5A623'} />
                <span style={{ fontSize: 12, fontWeight: 700, color: CS.ink }}>{prev.doctor.rating}</span>
                <span style={{ fontSize: 11, color: CS.inkMuted, marginLeft: 6 }}>Te atendió antes</span>
              </div>
            </div>
          </div>

          {/* Same doctor toggle */}
          <div style={{
            marginTop: 10, padding: 12, borderRadius: 12,
            background: sameDoctor ? CS.blueSoft : '#fff',
            border: `1px solid ${sameDoctor ? CS.blueSoft : CS.line}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <I.Heart size={18} stroke={sameDoctor ? CS.blue : CS.inkSoft} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FS.ui, fontSize: 13, fontWeight: 700, color: CS.ink }}>
                {sameDoctor ? 'Pedir al mismo doctor' : 'Cualquier doctor disponible'}
              </div>
              <div style={{ fontSize: 11, color: CS.inkSoft, marginTop: 2 }}>
                {sameDoctor ? 'Si no está disponible, te asignamos otro' : 'Match más rápido'}
              </div>
            </div>
            <button onClick={toggleDoctor} style={{
              width: 42, height: 24, borderRadius: 12, border: 'none', padding: 0,
              background: sameDoctor ? CS.blue : '#D3DCE4', position: 'relative', cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2, left: sameDoctor ? 20 : 2,
                width: 20, height: 20, borderRadius: 10, background: '#fff',
                transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* When — now / schedule */}
        <div style={{ padding: '0 20px 14px' }}>
          <Label>¿Cuándo?</Label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setState({ ...state, reorderWhen: 'now' })} style={{
              flex: 1, padding: '14px 10px', borderRadius: 14, cursor: 'pointer',
              border: `1.5px solid ${when === 'now' ? CS.blue : CS.line}`,
              background: when === 'now' ? CS.blueSoft : '#fff',
              textAlign: 'left',
            }}>
              <div style={{ fontFamily: FS.ui, fontSize: 13, fontWeight: 700, color: CS.ink }}>Ahora</div>
              <div style={{ fontSize: 11, color: CS.inkSoft, marginTop: 2 }}>Llega en ~45 minutos</div>
            </button>
            <button onClick={() => goEdit('schedule', { reorderWhen: 'schedule' })} style={{
              flex: 1, padding: '14px 10px', borderRadius: 14, cursor: 'pointer',
              border: `1.5px solid ${when === 'schedule' ? CS.blue : CS.line}`,
              background: when === 'schedule' ? CS.blueSoft : '#fff',
              textAlign: 'left',
            }}>
              <div style={{ fontFamily: FS.ui, fontSize: 13, fontWeight: 700, color: CS.ink }}>
                {when === 'schedule' ? schedDayLabel : 'Programar'}
              </div>
              <div style={{ fontSize: 11, color: CS.inkSoft, marginTop: 2 }}>
                {when === 'schedule' && state.schedTime ? `a las ${state.schedTime}` : 'Escoge día y hora'}
              </div>
            </button>
          </div>
        </div>

        {/* Editable summary */}
        <div style={{ padding: '4px 20px 20px' }}>
          <Label>Usar los mismos datos</Label>
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: `1px solid ${CS.line}`,
          }}>
            <Row
              icon={<I.MapPin size={18} stroke={CS.blue} />}
              label="Ubicación"
              value={address}
              onEdit={() => goEdit('location')}
            />
            <Row
              icon={<I.User size={18} stroke={CS.blue} />}
              label="Paciente"
              value={patient}
              onEdit={() => goEdit('patient')}
            />
            <Row
              icon={<I.Thermometer size={18} stroke={CS.blue} />}
              label="Motivo"
              value={reason}
              onEdit={() => goEdit('symptoms')}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: '#fff',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: CS.blueSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}><I.Cash size={18} stroke={CS.blue} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: CS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Pago</div>
                <div style={{ fontFamily: FS.ui, fontSize: 14, fontWeight: 600, color: CS.ink, marginTop: 2 }}>{payment}</div>
              </div>
              <button style={{
                padding: '6px 10px', borderRadius: 8, border: `1px solid ${CS.line}`,
                background: '#fff', fontSize: 12, fontWeight: 600, color: CS.blueDark, cursor: 'pointer',
                fontFamily: FS.ui,
              }}>Cambiar</button>
            </div>
          </div>

          <div style={{
            marginTop: 10, fontSize: 11, color: CS.inkMuted, lineHeight: 1.4,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <I.Shield size={13} stroke={CS.inkMuted} />
            Confirmamos con un código por WhatsApp al tocar "Confirmar".
          </div>
        </div>

      </div>

      <BottomBar>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 10, padding: '0 4px',
        }}>
          <span style={{ fontSize: 12, color: CS.inkSoft }}>
            {when === 'schedule' ? (state.schedTime ? whenLabel : 'Programar · falta escoger hora') : 'Total estimado'}
          </span>
          <span style={{ fontFamily: FS.display, fontSize: 20, fontWeight: 800, color: CS.ink, letterSpacing: -0.3 }}>
            S/ {prev.price}
          </span>
        </div>
        <PrimaryButton
          disabled={when === 'schedule' && !state.schedTime}
          onClick={confirm}
        >
          {when === 'schedule' ? 'Agendar visita' : 'Confirmar y pedir'}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

Object.assign(window, {
  DoctorHouseLogo, LogoLockup, SplashScreen, ScheduleScreen, RecurringSheet,
  ReorderScreen,
});
