// Screens 1–5: Home, Symptoms+Urgency, Location+Time, Patient, Matching
const { color: C, font: F, radius: R } = window.DH;

// ═══════════════════════════════════════════════════════════
// 1. HOME
// ═══════════════════════════════════════════════════════════
function HomeScreen({ state, setState, nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
      {/* Status-bar offset */}
      <div style={{ height: 54 }} />

      {/* Top: brand + phone */}
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: C.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <DoctorHouseLogo size={24} />
          </div>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: -0.4 }}>
            Doctor House
          </div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, border: 'none',
          background: C.redSoft, color: C.red, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="Emergencia">
          <I.Alert size={20} />
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: '24px 20px 14px' }}>
        <div style={{
          fontFamily: F.display, fontSize: 32, fontWeight: 700,
          color: C.ink, letterSpacing: -0.8, lineHeight: 1.1,
        }}>
          ¿Te sientes mal?<br />
          <span style={{ color: C.blue }}>Un médico llega a tu casa.</span>
        </div>
        <div style={{
          fontFamily: F.ui, fontSize: 15, color: C.inkSoft,
          marginTop: 10, lineHeight: 1.4,
        }}>
          Atención médica a domicilio en aproximadamente 45 minutos, 24/7 en todo el Perú.
        </div>
      </div>

      {/* Big CTA */}
      <div style={{ padding: '8px 20px 16px' }}>
        <button onClick={() => nav('symptoms')} style={{
          width: '100%', height: 76, border: 'none', borderRadius: 20,
          background: C.blue, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', position: 'relative',
          boxShadow: '0 12px 28px -12px rgba(24,99,224,0.55)',
          fontFamily: F.display, overflow: 'hidden',
        }}>
          {/* Flowing outline animation */}
          <svg style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', borderRadius: 20,
          }} preserveAspectRatio="none">
            <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="18.5" ry="18.5"
              fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2"
              strokeDasharray="60 420" strokeLinecap="round"
              style={{ animation: 'dhFlow 2.4s linear infinite' }} />
            <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="18.5" ry="18.5"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          </svg>

          <div style={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>Pedir un doctor</div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>Ahora o programado</div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 22, position: 'relative', zIndex: 1,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.ArrowRight size={22} />
          </div>
        </button>
      </div>

      {/* Trust signals */}
      <div style={{ padding: '4px 20px 12px', display: 'flex', gap: 10 }}>
        <TrustChip icon={<I.Shield size={16} />} label="Médicos colegiados" />
        <TrustChip icon={<I.Clock size={16} />} label="~45 minutos" />
        <TrustChip icon={<I.Star size={16} />} label="4.9 ★" />
      </div>

      {/* Secondary services */}
      <div style={{ padding: '16px 20px 12px' }}>
        <SectionTitle>Otros servicios</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ServiceCard icon={<I.Phone size={22} />} title="Teleconsulta" sub="Videollamada" soon />
          <ServiceCard icon={<I.Pill size={22} />} title="Medicinas" sub="A tu casa" soon />
        </div>
      </div>

      {/* Last visit / recent */}
      <div style={{ padding: '12px 20px 20px' }}>
        <SectionTitle>Tu última visita</SectionTitle>
        <Card pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
          <Avatar name="Luis Vargas" size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: C.ink }}>Dr. Luis Vargas</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>12 de abril · Medicina general</div>
          </div>
          <button
            onClick={() => {
              // Reset to "previous visit" snapshot so reorder shows the right defaults
              setState({
                ...state,
                reorderReason: 'Fiebre y dolor de cabeza',
                reorderPatient: 'Carla Rojas · 34 años',
                reorderPayment: 'Yape · S/ 120',
                reorderWhen: 'now',
                sameDoctor: true,
                address: 'Av. Pardo 432, Miraflores',
                schedDate: null,
                schedTime: null,
                returnTo: null,
                symptomsEdited: false,
                patient: null,
                symptoms: ['fever', 'head'],
              });
              nav('reorder');
            }}
            style={{
              padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.line}`,
              background: '#fff', fontSize: 13, fontWeight: 600, color: C.ink, cursor: 'pointer',
            }}>Pedir otra vez</button>
        </Card>
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

function TrustChip({ icon, label }) {
  return (
    <div style={{
      flex: 1, padding: '10px 8px', borderRadius: 12, background: '#fff',
      border: '1px solid ' + C.line,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      color: C.inkSoft, fontFamily: F.ui, fontSize: 11.5, fontWeight: 600, textAlign: 'center',
    }}>
      <div style={{ color: C.blue }}>{icon}</div>
      {label}
    </div>
  );
}

function ServiceCard({ icon, title, sub, soon }) {
  return (
    <div style={{
      padding: 14, borderRadius: 16, background: '#fff',
      border: '1px solid ' + C.line,
      position: 'relative',
    }}>
      <div style={{ color: C.blue, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{sub}</div>
      {soon && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 10, fontWeight: 700, color: C.amber,
          background: C.amberSoft, padding: '2px 6px', borderRadius: 6,
          letterSpacing: 0.4,
        }}>PRONTO</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. SYMPTOMS + URGENCY (combined)
// ═══════════════════════════════════════════════════════════
const SYMPTOMS = [
  { id: 'fever', label: 'Fiebre', icon: <I.Thermometer size={18} /> },
  { id: 'flu', label: 'Gripe / resfrío', icon: <I.Lungs size={18} /> },
  { id: 'head', label: 'Dolor de cabeza', icon: <I.Warn size={18} /> },
  { id: 'stomach', label: 'Estómago', icon: <I.Stomach size={18} /> },
  { id: 'throat', label: 'Garganta', icon: <I.Pill size={18} /> },
  { id: 'body', label: 'Dolor muscular', icon: <I.Heart size={18} /> },
  { id: 'cough', label: 'Tos', icon: <I.Lungs size={18} /> },
  { id: 'other', label: 'Otro', icon: <I.Plus size={18} /> },
];

function SymptomsScreen({ state, setState, nav }) {
  const toggle = (id) => {
    const s = new Set(state.symptoms || []);
    if (s.has(id)) s.delete(id); else s.add(id);
    setState({ ...state, symptoms: [...s], symptomsEdited: true });
  };
  const emergency = ['chest', 'breath', 'uncon'].some(id => (state.symptoms || []).includes(id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
      <div style={{ height: 54 }} />
      <TopBar onBack={() => nav('home')} step={0} total={4} />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 20px' }}>
        <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: -0.5, lineHeight: 1.15 }}>
          ¿Qué sientes?
        </div>
        <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 6, marginBottom: 18 }}>
          Escoge todo lo que sientes. No necesitas escribir.
        </div>

        {/* Symptom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {SYMPTOMS.map(s => {
            const sel = (state.symptoms || []).includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)} style={{
                padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${sel ? C.blue : C.line}`,
                background: sel ? C.blueSoft : '#fff',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: F.ui, fontSize: 14, fontWeight: 600,
                color: sel ? C.blueDark : C.ink, textAlign: 'left',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: sel ? C.blue : '#F4F6F8',
                  color: sel ? '#fff' : C.blue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{s.icon}</div>
                <span style={{ flex: 1 }}>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Emergency banner */}
        <button onClick={() => nav('emergency')} style={{
          width: '100%', marginBottom: 20, cursor: 'pointer',
          padding: '12px 14px', borderRadius: 14,
          background: C.redSoft, border: `1px solid ${C.red}30`,
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: C.red, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><I.Alert size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: C.red }}>¿Es una emergencia?</div>
            <div style={{ fontSize: 12.5, color: C.ink, marginTop: 2, lineHeight: 1.3 }}>
              Dolor de pecho, dificultad para respirar, desmayo.
            </div>
          </div>
          <I.ChevronRight size={18} stroke={C.red} />
        </button>

        {/* Urgency */}
        <SectionTitle>¿Qué tan urgente es?</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChoiceTile
            icon={<I.Bolt size={22} />} label="Lo antes posible"
            sub="~45 minutos · tarifa normal"
            selected={state.urgency === 'now'}
            onClick={() => setState({ ...state, urgency: 'now' })}
          />
          <ChoiceTile
            icon={<I.Clock size={22} />} label="En las próximas horas"
            sub="Hoy · tarifa normal"
            selected={state.urgency === 'today'}
            onClick={() => setState({ ...state, urgency: 'today' })}
          />
          <ChoiceTile
            icon={<I.Calendar size={22} />} label="Programar visita"
            sub="Escoge día y hora"
            selected={state.urgency === 'schedule'}
            onClick={() => { setState({ ...state, urgency: 'schedule' }); }}
          />
        </div>
      </div>

      <BottomBar>
        <PrimaryButton
          disabled={!(state.symptoms || []).length || !state.urgency}
          onClick={() => {
            if (state.returnTo === 'reorder') {
              setState({ ...state, returnTo: null });
              nav('reorder');
            } else {
              nav(state.urgency === 'schedule' ? 'schedule' : 'location');
            }
          }}
        >
          {state.returnTo === 'reorder' ? 'Guardar y volver' : 'Continuar'}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. LOCATION + TIME
// ═══════════════════════════════════════════════════════════
const DH_API = 'http://localhost:3000';

function LocationScreen({ state, setState, nav }) {
  const [gpsLoading, setGpsLoading] = React.useState(!state.lat);
  const [gpsError, setGpsError] = React.useState(null);
  const [lat, setLat] = React.useState(state.lat || null);
  const [lng, setLng] = React.useState(state.lng || null);
  const [addr, setAddr] = React.useState(state.address || '');
  const [addrRef, setAddrRef] = React.useState(state.ref || '');
  const [editMode, setEditMode] = React.useState(false);
  const [when, setWhen] = React.useState(state.when || 'asap');

  React.useEffect(() => {
    if (state.lat && state.lng) { setGpsLoading(false); return; }
    if (!navigator.geolocation) {
      setGpsError('GPS no disponible en este dispositivo.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLat(coords.latitude);
        setLng(coords.longitude);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'es', 'User-Agent': 'DoctorHousePrototype/1.0' } }
          );
          const data = await r.json();
          const a = data.address || {};
          const road = [a.road, a.house_number].filter(Boolean).join(' ');
          const zone = a.suburb || a.city_district || a.town || a.city || '';
          const formatted = [road, zone].filter(Boolean).join(', ');
          setAddr(formatted || data.display_name?.split(',').slice(0, 2).join(',').trim() || 'Ubicación actual');
        } catch {
          setAddr(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        }
        setGpsLoading(false);
      },
      () => {
        setGpsError('No se pudo detectar tu ubicación. Escribe tu dirección.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const saveAndGo = (destination) => {
    setState({ ...state, address: addr, lat, lng, ref: addrRef, when });
    if (destination === 'reorder') { nav('reorder'); return; }
    nav(destination);
  };

  const canContinue = addr.trim().length > 0 && !gpsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
      <div style={{ height: 54 }} />
      <TopBar onBack={() => nav('symptoms')} step={1} total={4} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <MapView height={240} pinLabel="Tu ubicación" pulse />

        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.4 }}>
            ¿Dónde atenderemos?
          </div>

          {/* Address card */}
          <div style={{
            marginTop: 14, padding: '14px', borderRadius: R.md,
            border: `1.5px solid ${gpsError && !addr ? C.red + '66' : C.line}`,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: gpsError && !addr ? C.redSoft : C.blueSoft,
              color: gpsError && !addr ? C.red : C.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><I.MapPin size={20} /></div>
            <div style={{ flex: 1 }}>
              {gpsLoading ? (
                <div style={{ fontFamily: F.ui, fontSize: 14, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 7,
                    border: `2px solid ${C.blue}`, borderTopColor: 'transparent',
                    animation: 'dhSpin 0.8s linear infinite', flexShrink: 0,
                  }} />
                  Detectando ubicación GPS…
                </div>
              ) : editMode ? (
                <input
                  autoFocus
                  value={addr}
                  onChange={e => setAddr(e.target.value)}
                  onBlur={() => addr.trim() && setEditMode(false)}
                  onKeyDown={e => e.key === 'Enter' && addr.trim() && setEditMode(false)}
                  placeholder="Ej. Av. Larco 345, Miraflores"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    border: `1.5px solid ${C.blue}`, outline: 'none',
                    fontFamily: F.ui, fontSize: 14, color: C.ink, boxSizing: 'border-box',
                  }}
                />
              ) : (
                <>
                  <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: addr ? C.ink : C.inkMuted }}>
                    {addr || 'Ingresa tu dirección'}
                  </div>
                  <div style={{ fontSize: 12.5, marginTop: 2 }}>
                    {gpsError
                      ? <span style={{ color: C.red }}>{gpsError}</span>
                      : lat
                        ? <span style={{ color: C.inkSoft }}>Detectado por GPS · ±10 m</span>
                        : null}
                  </div>
                </>
              )}
              <button onClick={() => setEditMode(true)} style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 8,
                border: `1px solid ${C.line}`, background: '#fff',
                fontSize: 12.5, fontWeight: 600, color: C.blue, cursor: 'pointer',
              }}>{addr ? 'Cambiar dirección' : 'Escribir dirección'}</button>
            </div>
          </div>

          {/* Reference */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>
              Referencia (ayuda al doctor a llegar)
            </div>
            <input
              value={addrRef}
              onChange={e => setAddrRef(e.target.value)}
              placeholder="Ej. Edificio azul, dpto 302, portero"
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                border: `1.5px solid ${C.line}`, outline: 'none',
                fontFamily: F.ui, fontSize: 15, color: C.ink, boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Time */}
          <div style={{ marginTop: 22 }}>
            <SectionTitle>¿Cuándo?</SectionTitle>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setWhen('asap')} style={{
                flex: 1, padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${when === 'asap' ? C.blue : C.line}`,
                background: when === 'asap' ? C.blueSoft : '#fff',
                textAlign: 'left', fontFamily: F.ui,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <I.Bolt size={16} stroke={C.blue} /> Ahora
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>Llega en ~45 minutos</div>
              </button>
              <button onClick={() => {
                setWhen('schedule');
                saveAndGo('schedule');
              }} style={{
                flex: 1, padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${when === 'schedule' ? C.blue : C.line}`,
                background: when === 'schedule' ? C.blueSoft : '#fff',
                textAlign: 'left', fontFamily: F.ui,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <I.Calendar size={16} stroke={C.blue} /> Programar
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>Escoge día/hora</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <PrimaryButton disabled={!canContinue} onClick={() => {
          if (state.returnTo === 'reorder') {
            saveAndGo('reorder');
          } else {
            saveAndGo('patient');
          }
        }}>Continuar</PrimaryButton>
      </BottomBar>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. PATIENT DETAILS
// ═══════════════════════════════════════════════════════════
function PatientScreen({ state, setState, nav }) {
  const p = state.patient || {};
  const upd = (k, v) => setState({ ...state, patient: { ...p, [k]: v } });
  const ready = p.name && p.ageGroup;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
      <div style={{ height: 54 }} />
      <TopBar onBack={() => nav('location')} step={2} total={4} />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 20px' }}>
        <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: -0.5 }}>
          ¿Para quién es la visita?
        </div>

        {/* For me / someone else */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 18 }}>
          <TogglePill active={p.forWho !== 'other'} onClick={() => upd('forWho', 'me')}>Para mí</TogglePill>
          <TogglePill active={p.forWho === 'other'} onClick={() => upd('forWho', 'other')}>Otra persona</TogglePill>
        </div>

        {/* Name */}
        <Label>Nombre del paciente</Label>
        <input
          value={p.name || ''}
          onChange={e => upd('name', e.target.value)}
          placeholder="Ej. María Quispe"
          style={inputStyle}
        />

        {/* Age group — tap not type */}
        <Label style={{ marginTop: 16 }}>Edad</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { id: 'baby', label: 'Bebé', sub: '<2 años', icon: <I.Baby size={18} /> },
            { id: 'child', label: 'Niño', sub: '2–12', icon: <I.Baby size={18} /> },
            { id: 'teen', label: 'Adolescente', sub: '13–17', icon: <I.User size={18} /> },
            { id: 'adult', label: 'Adulto', sub: '18–59', icon: <I.Adult size={18} /> },
            { id: 'elder', label: 'Mayor', sub: '60+', icon: <I.Elder size={18} /> },
            { id: 'other', label: 'Prefiero escribir', sub: '', icon: <I.Plus size={18} /> },
          ].map(a => {
            const sel = p.ageGroup === a.id;
            return (
              <button key={a.id} onClick={() => upd('ageGroup', a.id)} style={{
                padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${sel ? C.blue : C.line}`,
                background: sel ? C.blueSoft : '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: F.ui,
              }}>
                <div style={{ color: sel ? C.blue : C.inkSoft }}>{a.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{a.label}</div>
                {a.sub && <div style={{ fontSize: 11, color: C.inkMuted }}>{a.sub}</div>}
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <Label style={{ marginTop: 18 }}>Notas para el doctor (opcional)</Label>
        <textarea
          value={p.notes || ''}
          onChange={e => upd('notes', e.target.value)}
          placeholder="Ej. Es alérgico a la penicilina"
          rows={3}
          style={{ ...inputStyle, resize: 'none', fontFamily: F.ui }}
        />

        {/* Quick medical flags */}
        <Label style={{ marginTop: 18 }}>¿Algo importante?</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Diabetes', 'Hipertensión', 'Embarazo', 'Alergias', 'Ninguna'].map(f => {
            const flags = p.flags || [];
            const sel = flags.includes(f);
            return (
              <button key={f} onClick={() => {
                const next = sel ? flags.filter(x => x !== f) : [...flags, f];
                upd('flags', next);
              }} style={{
                padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
                border: `1.5px solid ${sel ? C.blue : C.line}`,
                background: sel ? C.blueSoft : '#fff',
                fontFamily: F.ui, fontSize: 13, fontWeight: 600,
                color: sel ? C.blueDark : C.ink,
              }}>{f}</button>
            );
          })}
        </div>
      </div>

      <BottomBar>
        <PrimaryButton disabled={!ready} onClick={() => {
          if (state.returnTo === 'reorder') {
            setState({ ...state, returnTo: null });
            nav('reorder');
          } else nav('matching');
        }}>
          {state.returnTo === 'reorder' ? 'Guardar y volver' : 'Buscar doctor'}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

function TogglePill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
      border: `1.5px solid ${active ? C.blue : C.line}`,
      background: active ? C.blueSoft : '#fff',
      fontFamily: F.ui, fontSize: 14, fontWeight: 700,
      color: active ? C.blueDark : C.ink,
    }}>{children}</button>
  );
}
function Label({ children, style }) {
  return <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8, ...style }}>{children}</div>;
}
const inputStyle = {
  width: '100%', padding: '14px', borderRadius: 12,
  border: `1.5px solid ${C.line}`, outline: 'none',
  fontFamily: F.ui, fontSize: 15, color: C.ink, boxSizing: 'border-box',
};

// ═══════════════════════════════════════════════════════════
// 5. MATCHING
// ═══════════════════════════════════════════════════════════
function MatchingScreen({ state, nav }) {
  const [dots, setDots] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setDots(d => (d + 1) % 4), 400);
    const t = setTimeout(() => nav('doctor'), 3500);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.blue, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '42%',
          width: 240 + i * 120, height: 240 + i * 120, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.18)',
          transform: 'translate(-50%, -50%)',
          animation: `dhRing 3s ease-out ${i * 0.8}s infinite`,
        }} />
      ))}

      <div style={{ height: 54 }} />
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => nav('patient')} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.X size={20} /></button>
        <div style={{ fontFamily: F.ui, fontSize: 13, opacity: 0.85 }}>Buscando doctor</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 108, height: 108, borderRadius: 54,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, border: '1px solid rgba(255,255,255,0.25)',
          animation: 'dhPulseSolid 2s ease-in-out infinite',
        }}>
          <I.Stethoscope size={46} stroke="#fff" />
        </div>

        <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, textAlign: 'center', letterSpacing: -0.4, lineHeight: 1.2 }}>
          Buscando un médico cerca de ti{'.'.repeat(dots)}
        </div>
        <div style={{ fontSize: 15, opacity: 0.85, textAlign: 'center', marginTop: 10, maxWidth: 280 }}>
          Contactando a los doctores más cercanos a <b>{state.address || 'tu dirección'}</b>
        </div>

        {/* Live status rows */}
        <div style={{
          marginTop: 28, padding: '14px 18px', borderRadius: 16,
          background: 'rgba(255,255,255,0.12)', width: '100%', maxWidth: 340,
          fontFamily: F.ui,
        }}>
          <StatusRow icon={<I.Check size={16} />} done>Pedido enviado</StatusRow>
          <StatusRow icon={<I.Check size={16} />} done>Revisando síntomas</StatusRow>
          <StatusRow icon={<I.Search size={16} />} loading>Buscando doctor cercano</StatusRow>
          <StatusRow icon={<I.User size={16} />}>Confirmando visita</StatusRow>
        </div>
      </div>

      <div style={{ padding: '12px 20px 34px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <button onClick={() => nav('patient')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
          fontFamily: F.ui, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Cancelar pedido</button>
      </div>
    </div>
  );
}

function StatusRow({ icon, children, done, loading }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
      opacity: done ? 1 : (loading ? 1 : 0.55),
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11,
        background: done ? '#fff' : 'rgba(255,255,255,0.15)',
        color: done ? C.blue : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: loading ? 'dhSpin 1.2s linear infinite' : 'none',
      }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: done ? 600 : 500 }}>{children}</div>
    </div>
  );
}

Object.assign(window, {
  HomeScreen, SymptomsScreen, LocationScreen, PatientScreen, MatchingScreen,
});
