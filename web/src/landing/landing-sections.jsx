// ═══════════════════════════════════════════════════════════
// Landing sections — Doctor House para médicos
// ═══════════════════════════════════════════════════════════

// ─── NAV ───────────────────────────────────────────────────
function LandingNav({ onApply }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(251,252,253,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${L.c.line}`,
    }}>
      <Container>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 76,
        }}>
          <LogoLockup size={26}/>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[
              ['Cómo funciona', 'how'],
              ['Ganancias', 'calc'],
              ['Beneficios', 'benefits'],
              ['Requisitos', 'reqs'],
              ['Preguntas', 'faq'],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} style={{
                fontFamily: L.f.sans, fontSize: 14, fontWeight: 600,
                color: L.c.inkSoft, textDecoration: 'none',
              }}>{label}</a>
            ))}
            <PrimaryCta size="sm" onClick={onApply}>
              Aplicar ahora <LI.Arrow size={14}/>
            </PrimaryCta>
          </nav>
        </div>
      </Container>
    </div>
  );
}

// ─── HERO ──────────────────────────────────────────────────
function HeroSection({ onApply }) {
  return (
    <Section padY={80}>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
          gap: 60, alignItems: 'center',
        }}>
          {/* Left */}
          <div style={{ animation: 'dhFloatUp 0.6s ease-out' }}>
            <Badge>
              <LI.Sparkle size={12} color={L.c.blue}/> Ahora recibiendo aplicaciones
            </Badge>

            <h1 style={{
              fontFamily: L.f.sans, fontSize: 68, fontWeight: 800,
              color: L.c.ink, letterSpacing: -2.4,
              lineHeight: 1.02, margin: '22px 0 0',
              textWrap: 'balance',
            }}>
              Atiende pacientes <span style={{ color: L.c.blue }}>a domicilio</span> en tus horas libres.
            </h1>

            <p style={{
              fontFamily: L.f.sans, fontSize: 20, fontWeight: 500,
              color: L.c.inkSoft, lineHeight: 1.5,
              maxWidth: 540, marginTop: 24, marginBottom: 0,
              textWrap: 'pretty',
            }}>
              Recibe visitas cerca de ti, atiéndelas cuando puedas, cobra
              directo a tu Yape. Doctor House se encarga del resto.
            </p>

            {/* Big CTA */}
            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
              <PrimaryCta size="xl" onClick={onApply} glow>
                Empezar mi aplicación <LI.Arrow size={20}/>
              </PrimaryCta>
              <span style={{ fontSize: 13, color: L.c.inkMuted, maxWidth: 160, lineHeight: 1.4 }}>
                Toma 7 minutos · Sin costo · Respuesta en 48 h
              </span>
            </div>

            {/* Trust row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 28,
              marginTop: 48, paddingTop: 32, borderTop: `1px solid ${L.c.line}`,
            }}>
              <div>
                <div style={{ fontFamily: L.f.sans, fontSize: 32, fontWeight: 800, color: L.c.ink, letterSpacing: -0.8 }}>+340</div>
                <div style={{ fontSize: 13, color: L.c.inkSoft, marginTop: 2 }}>médicos activos</div>
              </div>
              <div style={{ width: 1, height: 40, background: L.c.line }}/>
              <div>
                <div style={{ fontFamily: L.f.sans, fontSize: 32, fontWeight: 800, color: L.c.ink, letterSpacing: -0.8 }}>S/ 2.8k</div>
                <div style={{ fontSize: 13, color: L.c.inkSoft, marginTop: 2 }}>promedio mensual</div>
              </div>
              <div style={{ width: 1, height: 40, background: L.c.line }}/>
              <div>
                <div style={{ fontFamily: L.f.sans, fontSize: 32, fontWeight: 800, color: L.c.ink, letterSpacing: -0.8 }}>4.9★</div>
                <div style={{ fontSize: 13, color: L.c.inkSoft, marginTop: 2 }}>calificación promedio</div>
              </div>
            </div>
          </div>

          {/* Right — Phone mockup showing doctor accepting a visit */}
          <HeroPhoneMockup/>
        </div>
      </Container>
    </Section>
  );
}

function HeroPhoneMockup() {
  return (
    <div style={{
      position: 'relative',
      display: 'flex', justifyContent: 'center',
      animation: 'dhFloatUp 0.8s ease-out 0.15s both',
    }}>
      {/* Decorative ring */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at center, rgba(24,99,224,0.08) 0%, transparent 60%)',
        borderRadius: '50%',
      }}/>

      {/* Phone */}
      <div style={{
        position: 'relative',
        width: 320, height: 640,
        borderRadius: 46,
        background: L.c.ink,
        padding: 10,
        boxShadow: '0 30px 80px rgba(11,31,51,0.28), 0 8px 24px rgba(11,31,51,0.12)',
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 38,
          background: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Status bar */}
          <div style={{
            height: 44, padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 13, fontWeight: 700, color: L.c.ink,
          }}>
            <span>9:41</span>
            <span>●●● ▲ 100%</span>
          </div>

          {/* Notch */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 110, height: 30, borderRadius: 20, background: L.c.ink, zIndex: 2,
          }}/>

          {/* Header */}
          <div style={{ padding: '12px 22px 0' }}>
            <div style={{ fontSize: 12, color: L.c.inkMuted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              Nuevo pedido
            </div>
            <div style={{ fontFamily: L.f.sans, fontSize: 22, fontWeight: 800, color: L.c.ink, letterSpacing: -0.5, marginTop: 4 }}>
              Visita disponible
            </div>
          </div>

          {/* Pulsing ring around icon */}
          <div style={{ position: 'relative', margin: '20px auto 0', width: 72, height: 72 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${L.c.blue}`,
              animation: 'dhPulseRing 1.8s ease-out infinite',
            }}/>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: L.c.blueSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LI.Users size={32} color={L.c.blue}/>
            </div>
          </div>

          {/* Patient card */}
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{
              padding: 16, borderRadius: 16, background: L.c.bgWarm,
              border: `1px solid ${L.c.line}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: L.f.sans, fontSize: 16, fontWeight: 700, color: L.c.ink }}>
                  Carla R., 34 años
                </div>
                <div style={{ fontFamily: L.f.sans, fontSize: 20, fontWeight: 800, color: L.c.green, letterSpacing: -0.4 }}>
                  S/ 120
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: L.c.inkSoft, marginTop: 8 }}>
                <LI.MapPin size={14} color={L.c.inkMuted}/>
                Miraflores · 2.1 km
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: L.c.inkSoft, marginTop: 6 }}>
                <LI.Clock size={14} color={L.c.inkMuted}/>
                Fiebre, dolor de cabeza
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{
            position: 'absolute', bottom: 28, left: 22, right: 22,
            display: 'flex', gap: 10,
          }}>
            <button style={{
              flex: 1, padding: '14px 0', borderRadius: 14,
              background: '#fff', border: `1.5px solid ${L.c.line}`,
              fontFamily: L.f.sans, fontSize: 14, fontWeight: 700, color: L.c.inkSoft,
            }}>Rechazar</button>
            <button style={{
              flex: 2, padding: '14px 0', borderRadius: 14,
              background: L.c.blue, border: 'none',
              fontFamily: L.f.sans, fontSize: 14, fontWeight: 700, color: '#fff',
              boxShadow: '0 6px 16px rgba(24,99,224,0.3)',
            }}>Aceptar visita</button>
          </div>
        </div>
      </div>

      {/* Floating notification chip */}
      <div style={{
        position: 'absolute', top: 60, left: -40,
        padding: '14px 18px', borderRadius: 14,
        background: '#fff',
        boxShadow: '0 14px 32px rgba(11,31,51,0.12)',
        border: `1px solid ${L.c.line}`,
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'dhFloatUp 0.8s ease-out 0.5s both',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: L.c.greenSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LI.Wallet size={20} color={L.c.green}/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: L.c.inkMuted, fontWeight: 600 }}>Ganancia hoy</div>
          <div style={{ fontFamily: L.f.sans, fontSize: 18, fontWeight: 800, color: L.c.ink, letterSpacing: -0.4 }}>
            S/ 480
          </div>
        </div>
      </div>

      {/* Floating rating chip */}
      <div style={{
        position: 'absolute', bottom: 100, right: -40,
        padding: '12px 16px', borderRadius: 14,
        background: '#fff',
        boxShadow: '0 14px 32px rgba(11,31,51,0.12)',
        border: `1px solid ${L.c.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'dhFloatUp 0.8s ease-out 0.7s both',
      }}>
        <div style={{ display: 'flex', gap: 1 }}>
          {[1,2,3,4,5].map(i => <LI.Star key={i} size={14}/>)}
        </div>
        <div>
          <div style={{ fontFamily: L.f.sans, fontSize: 14, fontWeight: 700, color: L.c.ink }}>
            4.9 · 127 visitas
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────
function HowSection() {
  const steps = [
    {
      n: '01',
      title: 'Aplica en 7 minutos',
      desc: 'Llena el formulario con tu CMP, sube tu DNI y foto. Validamos en 48 horas hábiles.',
      icon: <LI.Doc size={24} color={L.c.blue}/>,
    },
    {
      n: '02',
      title: 'Configura tu disponibilidad',
      desc: 'Escoge tus zonas y horarios. Activas y desactivas el modo "Disponible" cuando quieras.',
      icon: <LI.Calendar size={24} color={L.c.blue}/>,
    },
    {
      n: '03',
      title: 'Recibe pedidos cercanos',
      desc: 'Te llega una notificación con síntomas, dirección y tarifa. Aceptas o rechazas en 60 s.',
      icon: <LI.Phone size={24} color={L.c.blue}/>,
    },
    {
      n: '04',
      title: 'Atiende y cobra',
      desc: 'Llegas, consultas, registras la visita y receta. Te pagamos semanalmente por Yape o CCI.',
      icon: <LI.Wallet size={24} color={L.c.blue}/>,
    },
  ];

  return (
    <Section bg={L.c.bgWarm} padY={110}>
      <div id="how" style={{ position: 'absolute', top: -80 }}/>
      <Container>
        <div style={{ maxWidth: 700, marginBottom: 56 }}>
          <SectionEyebrow>Cómo funciona</SectionEyebrow>
          <SectionTitle>Cuatro pasos para empezar.</SectionTitle>
          <SectionLede>
            Sin entrevistas, sin burocracia. Si eres médico colegiado en Perú,
            puedes estar recibiendo pedidos esta misma semana.
          </SectionLede>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{
              padding: 28,
              borderRadius: 20,
              background: '#fff',
              border: `1px solid ${L.c.line}`,
              position: 'relative',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: L.c.blueSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{s.icon}</div>
                <div style={{
                  fontFamily: L.f.sans, fontSize: 14, fontWeight: 800,
                  color: L.c.inkMuted, letterSpacing: 1,
                }}>{s.n}</div>
              </div>
              <h3 style={{
                fontFamily: L.f.sans, fontSize: 18, fontWeight: 800,
                color: L.c.ink, letterSpacing: -0.4,
                margin: 0, lineHeight: 1.25,
              }}>{s.title}</h3>
              <p style={{
                fontFamily: L.f.sans, fontSize: 14, fontWeight: 500,
                color: L.c.inkSoft, lineHeight: 1.55,
                marginTop: 10, marginBottom: 0,
                textWrap: 'pretty',
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── EARNINGS CALCULATOR ───────────────────────────────────
function EarningsCalcSection({ onApply }) {
  const [visits, setVisits] = React.useState(4);
  const [days, setDays] = React.useState(5);
  const [fee, setFee] = React.useState(100);

  const weekly = visits * days * fee;
  const monthly = weekly * 4;

  return (
    <Section padY={110}>
      <div id="calc" style={{ position: 'absolute', top: -80 }}/>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr',
          gap: 80, alignItems: 'center',
        }}>
          {/* Left: title */}
          <div>
            <SectionEyebrow>Calculadora de ingresos</SectionEyebrow>
            <SectionTitle>
              Tú decides cuánto trabajas <span style={{ color: L.c.blue }}>y cuánto ganas.</span>
            </SectionTitle>
            <SectionLede>
              Mueve los controles y mira tu ingreso mensual estimado.
              Cobras el 82% de cada visita — la comisión de Doctor House
              cubre el seguro, soporte y pagos.
            </SectionLede>

            <div style={{ marginTop: 36 }}>
              <PrimaryCta size="lg" onClick={onApply} glow>
                Quiero empezar <LI.Arrow/>
              </PrimaryCta>
            </div>
          </div>

          {/* Right: calculator card */}
          <div style={{
            padding: 40, borderRadius: 28,
            background: 'linear-gradient(160deg, #0A2E73 0%, #1863E0 100%)',
            color: '#fff',
            boxShadow: '0 30px 80px rgba(24,99,224,0.28)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative */}
            <div style={{
              position: 'absolute', top: -80, right: -80,
              width: 220, height: 220, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}/>

            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>
                Ganancia estimada mensual
              </div>
              <div style={{
                fontFamily: L.f.sans, fontSize: 72, fontWeight: 800,
                letterSpacing: -3, lineHeight: 1, marginTop: 10,
              }}>
                S/ {Math.round(monthly * 0.82).toLocaleString('es-PE')}
              </div>
              <div style={{ fontSize: 14, opacity: 0.75, marginTop: 8 }}>
                = S/ {Math.round(weekly * 0.82).toLocaleString('es-PE')} por semana, después de comisión
              </div>

              <div style={{
                height: 1, background: 'rgba(255,255,255,0.14)',
                margin: '32px 0',
              }}/>

              {/* Sliders */}
              <CalcSlider
                label="Visitas por día"
                value={visits}
                min={1} max={12} step={1}
                display={visits}
                onChange={setVisits}
              />
              <CalcSlider
                label="Días por semana"
                value={days}
                min={1} max={7} step={1}
                display={days}
                onChange={setDays}
              />
              <CalcSlider
                label="Tarifa por visita"
                value={fee}
                min={60} max={250} step={10}
                display={`S/ ${fee}`}
                onChange={setFee}
              />

              <div style={{
                marginTop: 28, padding: 16, borderRadius: 14,
                background: 'rgba(255,255,255,0.1)',
                fontSize: 13, lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  Desglose por visita · S/ {fee}
                </div>
                <div style={{ opacity: 0.85 }}>
                  Tarifa al paciente: S/ {fee} · Comisión DH (18%): S/ {Math.round(fee * 0.18)} ·
                  <b style={{ color: '#B4F0D8', marginLeft: 4 }}>Tu neto: S/ {Math.round(fee * 0.82)}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function CalcSlider({ label, value, min, max, step, display, onChange }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{label}</span>
        <span style={{ fontFamily: L.f.sans, fontSize: 18, fontWeight: 800 }}>{display}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        style={{ background: 'rgba(255,255,255,0.18)' }}
      />
    </div>
  );
}

Object.assign(window, {
  LandingNav, HeroSection, HowSection, EarningsCalcSection,
});
