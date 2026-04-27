// Main app: phone-flow prototype + canvas of all screens
const { color: CC, font: FF } = window.DH;

// Routes order for stepping through
const FLOW = [
  'splash', 'home', 'symptoms', 'location', 'schedule', 'patient', 'matching',
  'doctor', 'payment', 'tracking', 'feedback',
];
const EDGE = ['emergency', 'noDoctors', 'cancel'];
const ALT_FLOWS = ['reorder'];

const SCREENS = {
  splash: SplashScreen,
  home: HomeScreen,
  symptoms: SymptomsScreen,
  location: LocationScreen,
  schedule: ScheduleScreen,
  patient: PatientScreen,
  matching: MatchingScreen,
  doctor: DoctorAssignedScreen,
  payment: PaymentScreen,
  tracking: TrackingScreen,
  feedback: FeedbackScreen,
  emergency: EmergencyScreen,
  noDoctors: NoDoctorsScreen,
  cancel: CancelScreen,
  reorder: ReorderScreen,
};

const LABELS = {
  splash: '0 · Splash',
  home: '1 · Inicio',
  symptoms: '2 · Síntomas + urgencia',
  location: '3 · Ubicación + hora',
  schedule: '3b · Programar día y hora',
  patient: '4 · Paciente',
  matching: '5 · Buscando doctor',
  doctor: '6 · Doctor asignado',
  payment: '7 · Pago + OTP',
  tracking: '8 · Seguimiento',
  feedback: '9 · Feedback',
  emergency: '⚠ Emergencia detectada',
  noDoctors: '⚠ Sin doctores',
  cancel: '⚠ Cancelar visita',
  reorder: '↻ Pedir otra vez',
};

function Phone({ route, setRoute, state, setState, offline }) {
  const nav = (to) => {
    setRoute(to);
    localStorage.setItem('dh_route', to);
  };
  const Screen = SCREENS[route] || HomeScreen;
  return (
    <div style={{ position: 'relative' }}>
      <IOSDevice>
        <OfflineBanner show={offline} />
        <Screen state={state} setState={setState} nav={nav} />
      </IOSDevice>
      <div style={{
        marginTop: 10, fontFamily: FF.ui, fontSize: 12, fontWeight: 600,
        color: CC.inkSoft, textAlign: 'center', letterSpacing: 0.2,
      }}>
        {LABELS[route]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tweaks panel
// ═══════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#1863E0",
  "showAll": false,
  "simulateOffline": false,
  "language": "es"
}/*EDITMODE-END*/;

function TweaksPanel({ tweaks, setTweaks, onReset, onEdgeCase }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      width: 280, background: '#fff', borderRadius: 18,
      boxShadow: '0 14px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      fontFamily: FF.ui, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #eee',
        fontSize: 13, fontWeight: 700, color: CC.ink, letterSpacing: 0.2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>Tweaks</span>
        <button onClick={onReset} style={{
          background: 'none', border: 'none', fontSize: 11, color: CC.inkSoft, cursor: 'pointer', fontWeight: 600,
        }}>Reset</button>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TweakRow label="Color primario">
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['#1863E0', 'blue'],
              ['#13A579', 'green'],
              ['#6E2EC2', 'purple'],
              ['#0B1F33', 'ink'],
            ].map(([c, name]) => (
              <button key={c} onClick={() => setTweaks({ ...tweaks, primaryColor: c })} style={{
                width: 28, height: 28, borderRadius: 14, border: tweaks.primaryColor === c ? `2px solid ${CC.ink}` : '2px solid #fff',
                background: c, cursor: 'pointer', boxShadow: '0 0 0 1px #e5e5e5',
              }} />
            ))}
          </div>
        </TweakRow>

        <TweakRow label="Ver todas las pantallas">
          <Toggle value={tweaks.showAll} onChange={v => setTweaks({ ...tweaks, showAll: v })} />
        </TweakRow>

        <TweakRow label="Conexión lenta">
          <Toggle value={tweaks.simulateOffline} onChange={v => setTweaks({ ...tweaks, simulateOffline: v })} />
        </TweakRow>

        <div style={{ height: 1, background: '#eee' }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: CC.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Casos borde</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <EdgeBtn onClick={() => onEdgeCase('emergency')}>Emergencia detectada</EdgeBtn>
          <EdgeBtn onClick={() => onEdgeCase('noDoctors')}>Sin doctores</EdgeBtn>
          <EdgeBtn onClick={() => onEdgeCase('cancel')}>Cancelar visita</EdgeBtn>
        </div>
      </div>
    </div>
  );
}

function TweakRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 12.5, color: CC.ink, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 36, height: 22, borderRadius: 11, border: 'none',
      background: value ? CC.blue : '#D3DCE4', position: 'relative',
      cursor: 'pointer', transition: 'background 0.15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 16 : 2,
        width: 18, height: 18, borderRadius: 9, background: '#fff',
        transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}
function EdgeBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 10px', border: '1px solid #eee', borderRadius: 8,
      background: '#F7F8FA', color: CC.ink, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', textAlign: 'left',
    }}>{children}</button>
  );
}

// ═══════════════════════════════════════════════════════════
// Context sidebar — design decisions per screen
// ═══════════════════════════════════════════════════════════
const NOTES = {
  splash: { purpose: 'Pantalla de marca para construir confianza y mostrar identidad desde el primer segundo.', ux: ['Logo grande animado', 'Tagline corto', 'Duración 2.4s (no estorba)', 'Pasa sola a Inicio'], copy: '"Tu doctor en casa en ~45 minutos"', edge: 'Si hay error de red, pasa igual a Inicio offline.' },
  schedule: { purpose: 'Flujo dedicado para programar: día en chip, hora en grilla agrupada por franja.', ux: ['7 días en scroll horizontal', 'Slots por franja (Mañana/Tarde/Noche)', 'Slots ocupados tachados', 'CTA confirma con fecha y hora visible', 'Opción de visita recurrente'], copy: '"¿Qué día? / ¿A qué hora?"', edge: 'Si no hay cupos disponibles en el día elegido, se sugiere el siguiente día con disponibilidad.' },
  home: {
    purpose: 'Un solo CTA gigante elimina la parálisis de decisión.',
    ux: ['CTA de 76 px con subtexto', 'Chips de confianza (colegiados, ★, ETA)', 'Botón rojo de emergencia siempre visible', 'Historial para re-pedir en 1 tap'],
    copy: '"¿Te sientes mal? Un médico llega a tu casa."',
    edge: 'Si no hay GPS: dirección guardada como fallback.',
  },
  symptoms: {
    purpose: 'Combinar síntomas + urgencia en una sola pantalla para ahorrar un paso.',
    ux: ['Grilla de 8 síntomas (tap, no typing)', 'Detección auto de emergencia', 'Urgencia: 3 opciones claras', 'Progreso 1/4'],
    copy: '"¿Qué sientes?" en lenguaje simple',
    edge: 'Síntomas graves → banner rojo lleva a pantalla de emergencia.',
  },
  location: {
    purpose: 'Mostrar el mapa primero genera confianza; "Ahora" es el default.',
    ux: ['Mapa con pin detectado por GPS', 'Auto-completar dirección', 'Referencia opcional (clave en Perú)', 'Ahora vs. programar'],
    copy: '"¿Dónde atenderemos?"',
    edge: 'GPS inexacto: el usuario puede arrastrar el pin o escribir referencia.',
  },
  patient: {
    purpose: 'Reducir typing al mínimo — edad por tap, flags médicos por chip.',
    ux: ['Toggle "para mí" / "otra persona"', 'Edad en 6 botones (incluye bebé/mayor)', 'Chips: diabetes, hipertensión, embarazo', 'Notas opcionales'],
    copy: '"¿Para quién es la visita?"',
    edge: 'Si edad = bebé → después se sugiere pediatra.',
  },
  matching: {
    purpose: 'Pantalla llena de color primario transmite acción; el usuario espera tranquilo.',
    ux: ['Status list con pasos completados', 'Anillos animados y halo pulsante', 'Botón cancelar discreto abajo'],
    copy: '"Buscando un médico cerca de ti…"',
    edge: '30 s sin match → "No hay doctores"; ofrece programar o teleconsulta.',
  },
  doctor: {
    purpose: 'Foto, colegiatura y reviews — máxima confianza antes de pagar.',
    ux: ['Avatar + ring verde', 'Datos CMP (credibilidad)', 'Resumen de costos transparente', 'Opción de ver otro doctor'],
    copy: '"¡Doctor asignado! Llega en 28 min"',
    edge: 'Doctor cancela → vuelve a "Buscando doctor" automáticamente.',
  },
  payment: {
    purpose: 'Yape como default (es Perú). OTP solo al final — sin registro.',
    ux: ['Yape, efectivo, tarjeta (3 opciones)', 'Teclado numérico propio', 'OTP 4 dígitos por WhatsApp', 'Sin contraseña ni correo'],
    copy: '"Solo pedimos tu número al final."',
    edge: 'OTP no llega → reenviar o cambiar a SMS.',
  },
  tracking: {
    purpose: 'Mapa + ETA + dos botones de contacto. Como Uber pero para salud.',
    ux: ['Mapa full-bleed con ruta del doctor', 'Bottom sheet con 3 etapas', 'WhatsApp + llamar (1 tap)', 'Cancelar accesible pero no prominente'],
    copy: '"Doctor en camino · Llega en 18 min"',
    edge: 'Conexión lenta: banner "guardando…"; el pedido no se pierde.',
  },
  feedback: {
    purpose: '5 estrellas + tags pre-escritos para feedback rápido sin escribir.',
    ux: ['Rating grande con animación', 'Chips contextuales según rating', 'Propina opcional (default S/ 5)', 'Saltar sin culpa'],
    copy: '"¿Cómo fue la atención?"',
    edge: 'Usuario salta → el rating se guarda pendiente 24 h.',
  },
  emergency: { purpose: 'Rojo total = paramos todo. 106 visible; "no es emergencia" como escape.', ux: ['Pantalla bloqueante roja', 'Números de emergencia listados', 'CTA "Llamar 106" enorme'], copy: '"Esto puede ser una emergencia"', edge: 'Usuario confirma y llama directamente.' },
  noDoctors: { purpose: 'Nunca dejar al usuario sin opción. 3 caminos alternativos.', ux: ['Avisar por WhatsApp', 'Programar más tarde', 'Teleconsulta a S/ 60'], copy: '"No hay doctores disponibles ahora"', edge: 'Se puede reintentar cada 5 min.' },
  cancel: { purpose: 'Fricción justa: motivo opcional, política clara.', ux: ['Lista de motivos pre-escritos', 'Política de cargo visible', 'Botón secundario "esperar"'], copy: '"¿Seguro quieres cancelar?"', edge: 'Si el doctor ya llegó → se cobra completo.' },
  reorder: {
    purpose: 'Atajo para usuarios recurrentes: confirma visita en 1-2 taps usando datos anteriores.',
    ux: ['Doctor anterior como default (toggle)', 'Resumen editable: ubicación, paciente, motivo, pago', 'Ahora vs programar', 'Salta directo a OTP+pago'],
    copy: '"Pedir otra vez" → "Confirmar y pedir"',
    edge: 'Si el mismo doctor no está disponible → se asigna otro automáticamente (toggle avisa).',
  },
};

function DesignNotes({ route }) {
  const n = NOTES[route] || NOTES.home;
  return (
    <div style={{
      width: 300, padding: '20px 22px',
      background: '#fff', borderRadius: 20, border: '1px solid ' + CC.line,
      fontFamily: FF.ui, color: CC.ink,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: CC.blue, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
        {LABELS[route]}
      </div>
      <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.3, marginBottom: 12 }}>
        {n.purpose}
      </div>

      <NoteBlock title="Decisiones UX">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {n.ux.map(x => <li key={x} style={{ marginBottom: 4, fontSize: 13, color: CC.inkSoft, lineHeight: 1.4 }}>{x}</li>)}
        </ul>
      </NoteBlock>
      <NoteBlock title="Microcopy"><div style={{ fontSize: 13, color: CC.inkSoft, fontStyle: 'italic' }}>{n.copy}</div></NoteBlock>
      <NoteBlock title="Caso borde"><div style={{ fontSize: 13, color: CC.inkSoft }}>{n.edge}</div></NoteBlock>
    </div>
  );
}
function NoteBlock({ title, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: CC.inkMuted, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Root app
// ═══════════════════════════════════════════════════════════
function App() {
  const [route, setRoute] = React.useState(() => localStorage.getItem('dh_route') || 'splash');
  const [state, setState] = React.useState({
    urgency: 'now',
    symptoms: [],
    address: '',
    lat: null,
    lng: null,
    payment: 'yape',
  });
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = React.useState(true);

  // Bridge with host Tweaks toggle
  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Apply primaryColor to CSS var
  React.useEffect(() => {
    document.documentElement.style.setProperty('--dh-primary', tweaks.primaryColor);
  }, [tweaks.primaryColor]);

  const reset = () => {
    setTweaks(TWEAK_DEFAULTS);
    setRoute('home');
    setState({ urgency: 'now', symptoms: [], address: '', lat: null, lng: null, payment: 'yape' });
    localStorage.removeItem('dh_route');
  };

  // Override palette via tweaks
  const liveC = { ...window.DH.color, blue: tweaks.primaryColor, blueDark: tweaks.primaryColor };
  window.DH.color = liveC;

  return (
    <div style={{ minHeight: '100vh', background: CC.bg, fontFamily: FF.ui, paddingBottom: 80 }}>
      {/* HEADER */}
      <Header tweaks={tweaks} setRoute={setRoute} route={route} />

      {tweaks.showAll ? (
        <AllScreensCanvas state={state} setState={setState} offline={tweaks.simulateOffline} />
      ) : (
        <SingleScreenStage route={route} setRoute={setRoute} state={state} setState={setState} offline={tweaks.simulateOffline} />
      )}

      {/* BONUS: MVP + WhatsApp equivalent sections */}
      <BonusSection state={state} />

      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onReset={reset} onEdgeCase={setRoute} />}
    </div>
  );
}

function Header({ tweaks, setRoute, route }) {
  return (
    <div style={{
      padding: '28px 40px 20px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
      borderBottom: '1px solid ' + CC.line, background: '#fff',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: CC.blue, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Prototipo interactivo · iOS
        </div>
        <div style={{ fontFamily: FF.display, fontSize: 34, fontWeight: 700, color: CC.ink, letterSpacing: -0.8, marginTop: 4 }}>
          Doctor en Casa — flujo completo
        </div>
        <div style={{ fontSize: 14, color: CC.inkSoft, marginTop: 4, maxWidth: 620 }}>
          Médico a domicilio para Perú. 9 pantallas, 3 casos borde, sin login al inicio, Yape como pago default, WhatsApp para OTP.
        </div>
      </div>
      <FlowStepper route={route} setRoute={setRoute} />
    </div>
  );
}

function FlowStepper({ route, setRoute }) {
  const mainIdx = FLOW.indexOf(route);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => setRoute(FLOW[Math.max(0, mainIdx - 1)] || 'home')}
        disabled={mainIdx <= 0} style={stepNavBtn(mainIdx <= 0)}>
        <I.ChevronLeft size={18} />
      </button>
      <div style={{
        padding: '10px 16px', background: '#F4F6F8', borderRadius: 10,
        fontFamily: FF.ui, fontSize: 13, fontWeight: 600, color: CC.ink, minWidth: 140, textAlign: 'center',
      }}>
        {mainIdx >= 0 ? `Paso ${mainIdx + 1} / ${FLOW.length}` : 'Caso borde'}
      </div>
      <button onClick={() => setRoute(FLOW[Math.min(FLOW.length - 1, mainIdx + 1)])}
        disabled={mainIdx === FLOW.length - 1} style={stepNavBtn(mainIdx === FLOW.length - 1)}>
        <I.ChevronRight size={18} />
      </button>
    </div>
  );
}
const stepNavBtn = (disabled) => ({
  width: 40, height: 40, borderRadius: 10, border: '1px solid ' + CC.line,
  background: disabled ? '#F7F8FA' : '#fff', color: disabled ? CC.inkMuted : CC.ink,
  cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
});

function SingleScreenStage({ route, setRoute, state, setState, offline }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px 20px', gap: 30, flexWrap: 'wrap' }}>
      <Phone route={route} setRoute={setRoute} state={state} setState={setState} offline={offline} />
      <DesignNotes route={route} />
    </div>
  );
}

function AllScreensCanvas({ state, setState, offline }) {
  const [dummy, setDummy] = React.useState(0);
  return (
    <div style={{ padding: '40px 40px 20px' }}>
      <SectionHeader eyebrow="Flujo principal" title="9 pantallas del pedido" />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 40, marginTop: 20,
      }}>
        {FLOW.map(r => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Phone route={r} setRoute={() => { }} state={state} setState={setState} offline={offline} />
          </div>
        ))}
      </div>

      <div style={{ height: 60 }} />
      <SectionHeader eyebrow="Flujos alternativos" title="Atajos y re-pedidos" />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 40, marginTop: 20,
      }}>
        {ALT_FLOWS.map(r => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Phone route={r} setRoute={() => { }} state={state} setState={setState} offline={offline} />
          </div>
        ))}
      </div>

      <div style={{ height: 60 }} />
      <SectionHeader eyebrow="Casos borde" title="Qué pasa si algo falla" />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 40, marginTop: 20,
      }}>
        {EDGE.map(r => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Phone route={r} setRoute={() => { }} state={state} setState={setState} offline={offline} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: CC.blue, letterSpacing: 0.8, textTransform: 'uppercase' }}>{eyebrow}</div>
      <div style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, color: CC.ink, letterSpacing: -0.6, marginTop: 4 }}>{title}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Bonus: MVP (4 screens) + WhatsApp equivalent
// ═══════════════════════════════════════════════════════════
function BonusSection({ state }) {
  return (
    <div style={{ padding: '60px 40px 40px', borderTop: '1px solid ' + CC.line, marginTop: 40, background: '#fff' }}>
      <SectionHeader eyebrow="Bonus 1" title="MVP en 4 pantallas" />
      <p style={{ fontFamily: FF.ui, fontSize: 14, color: CC.inkSoft, maxWidth: 720, marginTop: 8 }}>
        Para lanzar rápido: fusionamos síntomas + ubicación + paciente en una sola pantalla scroll, y saltamos la pantalla de match. Tracking reducido a ETA textual.
      </p>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
        {[
          { title: '1 · Inicio', body: 'CTA "Pedir doctor" + tile emergencia' },
          { title: '2 · Pedido combinado', body: 'Scroll: síntomas (chips) → mapa auto → nombre + edad' },
          { title: '3 · OTP + pago', body: 'Número WhatsApp → Yape/efectivo (sin tarjeta)' },
          { title: '4 · Estado', body: 'Doctor + ETA en texto · WhatsApp directo' },
        ].map((s, i) => (
          <MvpCard key={i} index={i + 1} title={s.title} body={s.body} />
        ))}
      </div>

      <div style={{ height: 48 }} />
      <SectionHeader eyebrow="Bonus 2" title="Equivalente por WhatsApp" />
      <p style={{ fontFamily: FF.ui, fontSize: 14, color: CC.inkSoft, maxWidth: 720, marginTop: 8 }}>
        Para usuarios sin app o con poca data, el mismo flujo usando mensajes y botones de WhatsApp Business.
      </p>
      <WhatsappFlow />
    </div>
  );
}

function MvpCard({ index, title, body }) {
  return (
    <div style={{ flex: '1 1 220px', minWidth: 220, padding: 20, borderRadius: 16, border: '1px solid ' + CC.line, background: '#F7F9FB' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: CC.blue, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FF.display, fontWeight: 700, fontSize: 17
      }}>{index}</div>
      <div style={{ fontFamily: FF.display, fontSize: 17, fontWeight: 700, color: CC.ink, marginTop: 12, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontFamily: FF.ui, fontSize: 13.5, color: CC.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{body}</div>
    </div>
  );
}

function WhatsappFlow() {
  const msgs = [
    { from: 'bot', text: '👋 Hola, soy Doctor en Casa. ¿Necesitas un médico ahora?' },
    { from: 'bot', text: 'Responde con una opción:', btns: ['🩺 Sí, ahora', '📅 Programar', '❌ No'] },
    { from: 'user', text: 'Sí, ahora' },
    { from: 'bot', text: '¿Qué sientes? (escoge hasta 3)', btns: ['Fiebre', 'Gripe', 'Dolor de cabeza', 'Estómago'] },
    { from: 'user', text: 'Fiebre, gripe' },
    { from: 'bot', text: '📍 Comparte tu ubicación (botón adjuntar → ubicación)' },
    { from: 'user', text: '📍 Av. Pardo 432, Miraflores' },
    { from: 'bot', text: 'Dr. Ana Morales (4.9 ★) llega en 28 min. Total S/ 120.\n\n¿Cómo pagas?', btns: ['💜 Yape', '💵 Efectivo'] },
    { from: 'user', text: 'Yape' },
    { from: 'bot', text: '✅ ¡Listo! La doctora va en camino. Te enviamos su ubicación en vivo cada 2 min.' },
  ];
  return (
    <div style={{
      background: '#E5DDD5', borderRadius: 20, padding: '22px 18px', maxWidth: 420, marginTop: 20,
      border: '1px solid ' + CC.line, fontFamily: FF.ui
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: CC.blue, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <I.Stethoscope size={20} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: CC.ink }}>Doctor en Casa</div>
          <div style={{ fontSize: 11, color: CC.inkSoft }}>en línea · responde al instante</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 14 }}>
        {msgs.map((m, i) => <WaBubble key={i} {...m} />)}
      </div>
    </div>
  );
}

function WaBubble({ from, text, btns }) {
  const isUser = from === 'user';
  return (
    <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
      <div style={{
        background: isUser ? '#DCF8C6' : '#fff',
        padding: '8px 12px', borderRadius: 10,
        fontSize: 13.5, color: CC.ink, whiteSpace: 'pre-wrap',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.12)',
        marginLeft: isUser ? 'auto' : 0,
      }}>
        {text}
      </div>
      {btns && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {btns.map(b => (
            <div key={b} style={{
              padding: '7px 10px', background: '#fff', borderRadius: 8,
              fontSize: 12.5, fontWeight: 600, color: '#128C7E',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>{b}</div>
          ))}
        </div>
      )}
    </div>
  );
}

window.App = App;

// Mount
const mount = document.getElementById('root');
ReactDOM.createRoot(mount).render(<App />);
