// Screens 6–9: Doctor assigned, Payment+OTP, Tracking, Feedback + edge cases
const { color: C2, font: F2, radius: R2 } = window.DH;

// ═══════════════════════════════════════════════════════════
// 6. DOCTOR ASSIGNED
// ═══════════════════════════════════════════════════════════
const DOCTORS = [
  { name: 'Ana Morales', spec: 'Medicina General', rating: 4.9, reviews: 847, eta: 28, exp: '8 años', cmp: 'CMP 54821' },
  { name: 'Carlos Huamán', spec: 'Medicina Familiar', rating: 4.8, reviews: 512, eta: 35, exp: '12 años', cmp: 'CMP 41093' },
];

function DoctorAssignedScreen({ state, nav }) {
  const d = DOCTORS[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F4F6F8' }}>
      <div style={{ height: 54 }}/>
      <TopBar onBack={() => nav('home')} title="Doctor encontrado" step={3} total={4}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px' }}>
        {/* Success banner */}
        <div style={{
          background: C2.greenSoft, border: `1px solid ${C2.green}30`,
          borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 14,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: C2.green, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.Check size={16} sw={3}/>
          </div>
          <div style={{ fontFamily: F2.ui, fontSize: 14, fontWeight: 600, color: C2.ink }}>
            ¡Doctor asignado! Llega en <b>{d.eta} min</b>
          </div>
        </div>

        {/* Doctor card */}
        <Card pad={18}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar name={d.name} size={72} ring={C2.green}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F2.display, fontSize: 19, fontWeight: 700, color: C2.ink, letterSpacing: -0.3 }}>Dr. {d.name}</div>
              <div style={{ fontFamily: F2.ui, fontSize: 13.5, color: C2.inkSoft, marginTop: 2 }}>{d.spec}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <I.Star size={14} stroke="#F5A623" fill="#F5A623"/>
                <span style={{ fontFamily: F2.ui, fontSize: 13, fontWeight: 700, color: C2.ink }}>{d.rating}</span>
                <span style={{ fontSize: 12, color: C2.inkMuted }}>({d.reviews} visitas)</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: '#F4F6F8', display: 'flex', justifyContent: 'space-between' }}>
            <Stat label="Experiencia" value={d.exp}/>
            <Divider/>
            <Stat label="Colegiatura" value={d.cmp}/>
            <Divider/>
            <Stat label="Idiomas" value="Español"/>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F2.ui, fontSize: 13, color: C2.inkSoft }}>
            <I.Shield size={16} stroke={C2.green}/>
            Verificado por el Colegio Médico del Perú
          </div>
        </Card>

        {/* Cost summary */}
        <Card pad={16} style={{ marginTop: 12 }}>
          <SectionTitle>Resumen</SectionTitle>
          <Row label="Visita a domicilio" value="S/ 120.00"/>
          <Row label="Zona Miraflores" value="Incluido"/>
          <Row label={<><I.Clock size={13} style={{verticalAlign:-2}}/> Tiempo estimado</>} value={`${d.eta} min`}/>
          <div style={{ height: 1, background: C2.line, margin: '10px 0' }}/>
          <Row label={<b>Total a pagar</b>} value={<b>S/ 120.00</b>} big/>
        </Card>

        {/* Swap doctor */}
        <button style={{
          width: '100%', marginTop: 12, padding: '12px', borderRadius: 12,
          border: `1px solid ${C2.line}`, background: '#fff', cursor: 'pointer',
          fontFamily: F2.ui, fontSize: 13.5, fontWeight: 600, color: C2.blue,
        }}>Ver otro doctor disponible</button>
      </div>

      <BottomBar>
        <PrimaryButton onClick={() => nav('payment')}>Continuar al pago</PrimaryButton>
      </BottomBar>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontFamily: F2.ui, fontSize: 11.5, color: C2.inkMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontFamily: F2.ui, fontSize: 13, fontWeight: 700, color: C2.ink, marginTop: 4 }}>{value}</div>
    </div>
  );
}
function Divider() { return <div style={{ width: 1, background: C2.line }}/>; }
function Row({ label, value, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0',
      fontFamily: F2.ui, fontSize: big ? 16 : 14, color: C2.ink }}>
      <span style={{ color: C2.inkSoft }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 7. PAYMENT + OTP CONFIRMATION
// ═══════════════════════════════════════════════════════════
function PaymentScreen({ state, setState, nav }) {
  const [step, setStep] = React.useState('method'); // method → phone → otp
  const [method, setMethod] = React.useState(state.payment || 'yape');
  const [phone, setPhone] = React.useState(state.phone || '');
  const [otp, setOtp] = React.useState('');

  const onConfirm = () => {
    if (step === 'method') setStep('phone');
    else if (step === 'phone' && phone.length >= 9) setStep('otp');
    else if (step === 'otp' && otp.length === 4) {
      setState({ ...state, payment: method, phone });
      nav('tracking');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ height: 54 }}/>
      <TopBar onBack={() => step === 'method' ? nav('doctor') : setStep(step === 'otp' ? 'phone' : 'method')} step={3} total={4}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
        {step === 'method' && <MethodPicker method={method} setMethod={setMethod}/>}
        {step === 'phone' && <PhoneStep phone={phone} setPhone={setPhone}/>}
        {step === 'otp' && <OtpStep otp={otp} setOtp={setOtp} phone={phone}/>}
      </div>

      <BottomBar>
        <PrimaryButton
          onClick={onConfirm}
          disabled={(step === 'phone' && phone.length < 9) || (step === 'otp' && otp.length !== 4)}
        >
          {step === 'method' ? 'Continuar' : step === 'phone' ? 'Enviar código' : 'Confirmar visita · S/ 120'}
        </PrimaryButton>
        {step === 'method' && (
          <div style={{ textAlign: 'center', marginTop: 10, fontFamily: F2.ui, fontSize: 12, color: C2.inkMuted }}>
            <I.Shield size={12} style={{ verticalAlign: -2, marginRight: 4 }}/>
            Solo pedimos tu número al final. Sin registro largo.
          </div>
        )}
      </BottomBar>
    </div>
  );
}

function MethodPicker({ method, setMethod }) {
  return (
    <div>
      <div style={{ fontFamily: F2.display, fontSize: 24, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
        ¿Cómo pagas?
      </div>
      <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 6, marginBottom: 18 }}>
        Pagas cuando llegue el doctor. Sin cargos adelantados.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PayOption id="yape" method={method} setMethod={setMethod}
          title="Yape" sub="Escanea el QR al llegar · Más usado"
          icon={<YapeLogo/>} bg="#F1EAFB" featured/>
        <PayOption id="cash" method={method} setMethod={setMethod}
          title="Efectivo" sub="Paga en soles al doctor"
          icon={<I.Cash size={22}/>} bg="#E2F6EF"/>
        <PayOption id="card" method={method} setMethod={setMethod}
          title="Tarjeta" sub="POS al momento de la atención"
          icon={<I.Card size={22}/>} bg="#E8F0FD"/>
      </div>

      {/* Coupon */}
      <div style={{ marginTop: 20, padding: 14, border: `1px dashed ${C2.lineStrong}`, borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ color: C2.blue, fontFamily: F2.ui, fontWeight: 700, fontSize: 13 }}>¿Tienes cupón?</div>
        <input placeholder="Código" style={{
          flex: 1, padding: '10px', border: `1px solid ${C2.line}`, borderRadius: 10,
          fontFamily: F2.ui, fontSize: 14, outline: 'none',
        }}/>
        <button style={{ padding: '10px 14px', background: C2.blue, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
      </div>
    </div>
  );
}

function YapeLogo() {
  return (
    <div style={{ width: 26, height: 26, borderRadius: 7, background: C2.yape, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: F2.display, fontWeight: 800, fontSize: 13, letterSpacing: -0.5 }}>
      Y
    </div>
  );
}

function PayOption({ id, method, setMethod, title, sub, icon, bg, featured }) {
  const sel = method === id;
  return (
    <button onClick={() => setMethod(id)} style={{
      width: '100%', textAlign: 'left',
      padding: '14px 14px', borderRadius: 16, cursor: 'pointer',
      border: `1.5px solid ${sel ? C2.blue : C2.line}`,
      background: sel ? C2.blueSoft : '#fff',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'relative',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C2.ink }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: F2.ui, fontSize: 15, fontWeight: 700, color: C2.ink, display: 'flex', gap: 6, alignItems: 'center' }}>
          {title}
          {featured && <span style={{ fontSize: 10, fontWeight: 700, color: C2.yape, background: C2.yapeSoft, padding: '2px 6px', borderRadius: 5, letterSpacing: 0.3 }}>MÁS USADO</span>}
        </div>
        <div style={{ fontSize: 12.5, color: C2.inkSoft, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 11,
        border: `2px solid ${sel ? C2.blue : C2.lineStrong}`,
        background: sel ? C2.blue : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        {sel && <I.Check size={14} sw={3}/>}
      </div>
    </button>
  );
}

function PhoneStep({ phone, setPhone }) {
  return (
    <div>
      <div style={{ fontFamily: F2.display, fontSize: 24, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
        Confirma tu número
      </div>
      <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 6, marginBottom: 20 }}>
        Te enviaremos un código por WhatsApp o SMS para confirmar la visita.
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '14px 14px',
        border: `1.5px solid ${C2.line}`, borderRadius: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: `1px solid ${C2.line}` }}>
          <div style={{ width: 22, height: 16, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: '#D91023' }}/>
            <div style={{ flex: 1, background: '#fff' }}/>
            <div style={{ flex: 1, background: '#D91023' }}/>
          </div>
          <span style={{ fontFamily: F2.ui, fontSize: 15, fontWeight: 600, color: C2.ink }}>+51</span>
        </div>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
          placeholder="999 999 999"
          inputMode="numeric"
          style={{ flex: 1, border: 'none', outline: 'none',
            fontFamily: F2.ui, fontSize: 17, color: C2.ink,
            letterSpacing: 1, background: 'transparent' }}
        />
      </div>

      <div style={{ marginTop: 14, padding: 12, background: '#F4F6F8', borderRadius: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
        fontFamily: F2.ui, fontSize: 12.5, color: C2.inkSoft }}>
        <I.Info size={16} stroke={C2.inkSoft}/>
        <span>Tu número solo se comparte con el doctor asignado. Nunca lo vendemos ni compartimos con terceros.</span>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', background: '#E8F8EA', borderRadius: 10,
        fontFamily: F2.ui, fontSize: 12.5, color: '#0F6B34' }}>
        <I.Whatsapp size={16} stroke="#0F6B34"/>
        Código vía WhatsApp (recomendado)
      </div>
    </div>
  );
}

function OtpStep({ otp, setOtp, phone }) {
  return (
    <div>
      <div style={{ fontFamily: F2.display, fontSize: 24, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
        Ingresa el código
      </div>
      <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 6, marginBottom: 24 }}>
        Te enviamos un código de 4 dígitos al <b>+51 {phone}</b>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 56, height: 64, borderRadius: 14,
            border: `1.5px solid ${otp[i] ? C2.blue : C2.line}`,
            background: otp[i] ? C2.blueSoft : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F2.display, fontSize: 28, fontWeight: 700, color: C2.ink,
          }}>{otp[i] || ''}</div>
        ))}
      </div>

      {/* Mini numeric keypad (simulated) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 260, margin: '0 auto' }}>
        {[1,2,3,4,5,6,7,8,9,'',0,'←'].map((k, i) => (
          <button key={i} onClick={() => {
            if (k === '←') setOtp(otp.slice(0, -1));
            else if (k !== '' && otp.length < 4) setOtp(otp + k);
          }} style={{
            height: 52, borderRadius: 12, border: 'none',
            background: k === '' ? 'transparent' : '#F4F6F8',
            fontFamily: F2.display, fontSize: 20, fontWeight: 600, color: C2.ink,
            cursor: k === '' ? 'default' : 'pointer',
          }}>{k}</button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontFamily: F2.ui, fontSize: 13, color: C2.inkSoft }}>
        ¿No llegó? <span style={{ color: C2.blue, fontWeight: 600, cursor: 'pointer' }}>Reenviar código</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 8. TRACKING
// ═══════════════════════════════════════════════════════════
function TrackingScreen({ state, nav }) {
  const [stage, setStage] = React.useState(0);
  // 0 = on way, 1 = arriving, 2 = arrived
  const stages = [
    { label: 'Doctor en camino', sub: 'Llega en 18 min', eta: '18 min' },
    { label: 'Llegando', sub: 'El doctor está a 5 min', eta: '5 min' },
    { label: 'Doctor llegó', sub: 'Te está esperando en la puerta', eta: 'Ahora' },
  ];
  const cur = stages[stage];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <MapView height={340} pinLabel="Tu casa" doctorMoving eta={cur.eta}/>

      {/* Floating status bar chips at top */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '8px 16px', zIndex: 5 }}>
        <button onClick={() => nav('home')} style={{
          width: 40, height: 40, borderRadius: 20, border: 'none',
          background: '#fff', color: C2.ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}><I.ChevronLeft size={22}/></button>
        <button onClick={() => nav('cancel')} style={{
          padding: '10px 14px', borderRadius: 20, border: 'none',
          background: '#fff', color: C2.red, cursor: 'pointer',
          fontFamily: F2.ui, fontSize: 13, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>Cancelar</button>
      </div>

      {/* Bottom sheet */}
      <div style={{
        marginTop: -28, borderRadius: '28px 28px 0 0', background: '#fff',
        padding: '20px 20px 20px', flex: 1,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)', position: 'relative', zIndex: 2,
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C2.line, margin: '0 auto 14px' }}/>

        {/* ETA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: F2.display, fontSize: 24, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
            {cur.label}
          </div>
          <div style={{ fontFamily: F2.display, fontSize: 22, fontWeight: 700, color: C2.blue }}>
            {cur.eta}
          </div>
        </div>
        <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 4 }}>{cur.sub}</div>

        {/* Progress stepper */}
        <div style={{ display: 'flex', marginTop: 18, marginBottom: 18, gap: 4 }}>
          {stages.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3,
              background: i <= stage ? C2.blue : C2.line }}/>
          ))}
        </div>

        {/* Doctor row */}
        <Card pad={12} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name="Ana Morales" size={48} ring={C2.blue}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F2.ui, fontSize: 15, fontWeight: 700, color: C2.ink }}>Dra. Ana Morales</div>
              <div style={{ fontSize: 12.5, color: C2.inkSoft, marginTop: 1 }}>Medicina General · 4.9 ★</div>
            </div>
            <button style={{
              width: 44, height: 44, borderRadius: 22, border: 'none',
              background: '#E8F8EA', color: '#0F6B34', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Whatsapp size={20}/></button>
            <button style={{
              width: 44, height: 44, borderRadius: 22, border: 'none',
              background: C2.blueSoft, color: C2.blue, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Phone size={18}/></button>
          </div>
        </Card>

        {/* Stage advance buttons (prototype only) */}
        <div style={{ display: 'flex', gap: 8 }}>
          {stage < 2 && (
            <button onClick={() => setStage(stage + 1)} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${C2.line}`,
              background: '#fff', fontFamily: F2.ui, fontSize: 13, fontWeight: 600, color: C2.inkSoft, cursor: 'pointer',
            }}>▸ Avanzar etapa (demo)</button>
          )}
          {stage === 2 && (
            <PrimaryButton onClick={() => nav('feedback')}>Terminar visita</PrimaryButton>
          )}
        </div>

        {/* Summary */}
        {stage < 2 && (
          <div style={{ marginTop: 14, padding: 12, background: '#F4F6F8', borderRadius: 12, fontFamily: F2.ui, fontSize: 12.5, color: C2.inkSoft }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <I.MapPin size={14}/> {state.address || 'Av. Pardo 432, Miraflores'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <I.Cash size={14}/> S/ 120 · {state.payment === 'yape' ? 'Yape' : state.payment === 'cash' ? 'Efectivo' : 'Tarjeta'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 9. FEEDBACK
// ═══════════════════════════════════════════════════════════
function FeedbackScreen({ state, nav }) {
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState([]);
  const toggle = (t) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px', textAlign: 'right' }}>
        <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', color: C2.inkSoft, fontFamily: F2.ui, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Saltar</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '10px 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, margin: '0 auto', borderRadius: 36, background: C2.greenSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C2.green }}>
            <I.Check size={36} sw={2.5}/>
          </div>
          <div style={{ fontFamily: F2.display, fontSize: 24, fontWeight: 700, color: C2.ink, marginTop: 16, letterSpacing: -0.4 }}>
            ¡Visita terminada!
          </div>
          <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 6 }}>
            Esperamos que te sientas mejor.
          </div>
        </div>

        <Card pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar name="Ana Morales" size={52}/>
            <div>
              <div style={{ fontFamily: F2.ui, fontSize: 15, fontWeight: 700, color: C2.ink }}>Dra. Ana Morales</div>
              <div style={{ fontSize: 12.5, color: C2.inkSoft, marginTop: 2 }}>¿Cómo fue la atención?</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 0 18px' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                width: 48, height: 48, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                transform: rating === n ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s',
              }}>
                <I.Star size={40}
                  stroke={n <= rating ? '#F5A623' : C2.lineStrong}
                  fill={n <= rating ? '#F5A623' : 'none'}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div>
              <div style={{ fontFamily: F2.ui, fontSize: 13, fontWeight: 600, color: C2.inkSoft, marginBottom: 10 }}>
                {rating >= 4 ? '¿Qué estuvo bien?' : '¿Qué podemos mejorar?'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(rating >= 4
                  ? ['Puntual', 'Amable', 'Explicó bien', 'Profesional', 'Limpio', 'Rápido']
                  : ['Tardó mucho', 'Poco claro', 'Trato distante', 'Precio alto']
                ).map(t => (
                  <button key={t} onClick={() => toggle(t)} style={{
                    padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
                    border: `1.5px solid ${tags.includes(t) ? C2.blue : C2.line}`,
                    background: tags.includes(t) ? C2.blueSoft : '#fff',
                    fontFamily: F2.ui, fontSize: 13, fontWeight: 600,
                    color: tags.includes(t) ? C2.blueDark : C2.ink,
                  }}>{t}</button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Tip */}
        <Card pad={16} style={{ marginTop: 12 }}>
          <div style={{ fontFamily: F2.ui, fontSize: 14, fontWeight: 700, color: C2.ink, marginBottom: 10 }}>¿Quieres dejar propina?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['S/ 0', 'S/ 5', 'S/ 10', 'S/ 20'].map((t,i) => (
              <button key={t} style={{
                flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${i === 1 ? C2.blue : C2.line}`,
                background: i === 1 ? C2.blueSoft : '#fff',
                fontFamily: F2.ui, fontSize: 14, fontWeight: 700, color: C2.ink,
              }}>{t}</button>
            ))}
          </div>
        </Card>
      </div>

      <BottomBar>
        <PrimaryButton variant="green" onClick={() => nav('home')} disabled={rating === 0}>
          Enviar y terminar
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════

// No doctors available
function NoDoctorsScreen({ nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ height: 54 }}/>
      <TopBar onBack={() => nav('home')} title="Sin doctores"/>
      <div style={{ flex: 1, padding: '40px 24px 20px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: C2.amberSoft, color: C2.amber,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <I.Warn size={40}/>
        </div>
        <div style={{ fontFamily: F2.display, fontSize: 22, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
          No hay doctores disponibles ahora
        </div>
        <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          La demanda está alta en Miraflores. Puedes esperar, programar tu visita o probar una teleconsulta.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChoiceTile icon={<I.Whatsapp size={22}/>} label="Avísame cuando haya doctor" sub="Te escribimos por WhatsApp" onClick={() => nav('home')}/>
          <ChoiceTile icon={<I.Calendar size={22}/>} label="Programar para más tarde" sub="Escoge hora de hoy o mañana" onClick={() => nav('home')}/>
          <ChoiceTile icon={<I.Phone size={22}/>} label="Teleconsulta ahora" sub="Doctor por videollamada · S/ 60" onClick={() => nav('home')}/>
        </div>
      </div>
    </div>
  );
}

// Emergency detected
function EmergencyScreen({ nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C2.red, color: '#fff' }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px' }}>
        <button onClick={() => nav('symptoms')} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.X size={20}/></button>
      </div>

      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <I.Alert size={44} stroke="#fff"/>
        </div>
        <div style={{ fontFamily: F2.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15 }}>
          Esto puede ser una emergencia
        </div>
        <div style={{ fontSize: 16, marginTop: 12, opacity: 0.95, lineHeight: 1.5 }}>
          Por tu seguridad, no esperes. Llama ahora a emergencias. La visita a domicilio no es suficiente en casos graves.
        </div>

        <div style={{ marginTop: 28, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, fontFamily: F2.ui }}>
          <div style={{ fontSize: 12.5, opacity: 0.85, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Llama ya</div>
          <EmergencyLine num="106" label="SAMU — Emergencias médicas"/>
          <EmergencyLine num="116" label="Bomberos"/>
          <EmergencyLine num="105" label="Policía"/>
        </div>

        <div style={{ flex: 1 }}/>

        <button style={{
          width: '100%', height: 64, borderRadius: 16, border: 'none',
          background: '#fff', color: C2.red, cursor: 'pointer',
          fontFamily: F2.display, fontSize: 18, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <I.Phone size={22}/> Llamar al 106 ahora
        </button>
        <button onClick={() => nav('symptoms')} style={{
          width: '100%', marginTop: 10, padding: '14px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)',
          borderRadius: 16, color: '#fff', fontFamily: F2.ui, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>No es emergencia, seguir con la visita</button>
      </div>
    </div>
  );
}

function EmergencyLine({ num, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
      <div style={{ fontFamily: F2.display, fontSize: 22, fontWeight: 800, width: 56 }}>{num}</div>
      <div style={{ flex: 1, fontSize: 14 }}>{label}</div>
      <I.Phone size={18}/>
    </div>
  );
}

// Cancel confirmation
function CancelScreen({ nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C2.bg }}>
      <div style={{ height: 54 }}/>
      <TopBar onBack={() => nav('tracking')} title="Cancelar visita"/>
      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div style={{ fontFamily: F2.display, fontSize: 22, fontWeight: 700, color: C2.ink, letterSpacing: -0.4 }}>
          ¿Seguro quieres cancelar?
        </div>
        <div style={{ fontSize: 14, color: C2.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          La Dra. Ana ya viene en camino. Si cancelas, se cobra <b>S/ 15</b> por el traslado.
        </div>

        <SectionTitle style={{ marginTop: 24 }}>Motivo (opcional)</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Me siento mejor', 'Tardó mucho', 'Me equivoqué de dirección', 'Voy a una clínica', 'Otro motivo'].map(r => (
            <button key={r} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${C2.line}`, background: '#fff', textAlign: 'left',
              fontFamily: F2.ui, fontSize: 15, fontWeight: 500, color: C2.ink,
            }}>{r}</button>
          ))}
        </div>
      </div>
      <BottomBar>
        <PrimaryButton variant="red" onClick={() => nav('home')}>Sí, cancelar</PrimaryButton>
        <SecondaryButton style={{ marginTop: 10 }} onClick={() => nav('tracking')}>No, esperar doctor</SecondaryButton>
      </BottomBar>
    </div>
  );
}

// Poor connection toast (overlay)
function OfflineBanner({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', top: 58, left: 16, right: 16, zIndex: 100,
      background: '#2A2F36', color: '#fff', padding: '10px 14px',
      borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      fontFamily: F2.ui, fontSize: 13,
    }}>
      <I.Wifi size={18} stroke="#FFB74D"/>
      <span style={{ flex: 1 }}>Conexión lenta. Guardando tu pedido…</span>
    </div>
  );
}

Object.assign(window, {
  DoctorAssignedScreen, PaymentScreen, TrackingScreen, FeedbackScreen,
  NoDoctorsScreen, EmergencyScreen, CancelScreen, OfflineBanner,
});
