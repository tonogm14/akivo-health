// ═══════════════════════════════════════════════════════════
// Landing sections part 2 — benefits, reqs, testimonials, FAQ
// ═══════════════════════════════════════════════════════════

// ─── BENEFITS ──────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    { icon: <LI.Clock color={L.c.blue}/>, title: 'Horario 100% flexible',
      desc: 'Decides qué días y qué horas trabajas. Sin penalizaciones por rechazar pedidos.' },
    { icon: <LI.Wallet color={L.c.blue}/>, title: 'Pagos semanales',
      desc: 'Cada viernes depositamos tus ganancias a tu Yape o cuenta bancaria.' },
    { icon: <LI.Shield color={L.c.blue}/>, title: 'Seguro incluido',
      desc: 'Cubrimos responsabilidad civil profesional sin costo adicional para ti.' },
    { icon: <LI.MapPin color={L.c.blue}/>, title: 'Pedidos cerca de ti',
      desc: 'Solo recibes visitas en las zonas que elegiste — nunca te enviamos lejos.' },
    { icon: <LI.Users color={L.c.blue}/>, title: 'Pacientes verificados',
      desc: 'Todo paciente se identifica con DNI y teléfono antes de que aceptes la visita.' },
    { icon: <LI.Phone color={L.c.blue}/>, title: 'Soporte 24/7',
      desc: 'Chat directo con el equipo Doctor House ante cualquier duda o emergencia.' },
  ];

  return (
    <Section padY={110}>
      <div id="benefits" style={{ position: 'absolute', top: -80 }}/>
      <Container>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <SectionEyebrow>Beneficios</SectionEyebrow>
          <SectionTitle>Hecho para que te concentres en lo que importa: atender.</SectionTitle>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: 20,
              background: '#fff',
              border: `1px solid ${L.c.line}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(11,31,51,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: L.c.blueSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>{b.icon}</div>
              <h3 style={{
                fontFamily: L.f.sans, fontSize: 19, fontWeight: 800,
                color: L.c.ink, letterSpacing: -0.4,
                margin: 0, lineHeight: 1.25,
              }}>{b.title}</h3>
              <p style={{
                fontFamily: L.f.sans, fontSize: 15, fontWeight: 500,
                color: L.c.inkSoft, lineHeight: 1.55,
                marginTop: 10, marginBottom: 0,
                textWrap: 'pretty',
              }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── REQUIREMENTS ──────────────────────────────────────────
function RequirementsSection() {
  const reqs = [
    { t: 'Colegiado vigente en el CMP', s: 'Registrado en el Colegio Médico del Perú con habilitación al día' },
    { t: 'Título profesional', s: 'Título de médico cirujano emitido por una universidad peruana o revalidado' },
    { t: 'Documentos al día', s: 'DNI vigente, antecedentes penales y policiales limpios' },
    { t: 'Equipo básico', s: 'Maletín con lo esencial: tensiómetro, estetoscopio, termómetro, oxímetro' },
    { t: 'Smartphone', s: 'Android 9+ o iOS 14+ con datos móviles o WiFi estable' },
    { t: 'Movilidad propia', s: 'Vehículo propio o posibilidad de movilizarte rápido por tu zona' },
  ];

  return (
    <Section bg={L.c.bgCool} padY={110}>
      <div id="reqs" style={{ position: 'absolute', top: -80 }}/>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: '0.8fr 1.2fr',
          gap: 80, alignItems: 'start',
        }}>
          <div>
            <SectionEyebrow>Requisitos</SectionEyebrow>
            <SectionTitle>¿Cumples con esto?</SectionTitle>
            <SectionLede>
              Priorizamos la seguridad del paciente y la confianza
              en cada visita. Si cumples con estos requisitos, tu
              aplicación avanza rápido.
            </SectionLede>

            <div style={{
              marginTop: 36, padding: 20, borderRadius: 16,
              background: L.c.amberSoft,
              border: `1px solid ${L.c.amber}`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <LI.Shield size={22} color={L.c.amber}/>
              <div style={{ fontSize: 14, color: '#8A5A0D', lineHeight: 1.5 }}>
                <b>Verificación obligatoria.</b> Validamos tu CMP directamente con el
                Colegio Médico y tus documentos con RENIEC. Esto protege tanto
                a ti como a los pacientes.
              </div>
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 24,
            border: `1px solid ${L.c.line}`,
            overflow: 'hidden',
          }}>
            {reqs.map((r, i) => (
              <div key={i} style={{
                padding: '22px 28px',
                display: 'flex', alignItems: 'flex-start', gap: 16,
                borderBottom: i < reqs.length - 1 ? `1px solid ${L.c.line}` : 'none',
              }}>
                <LI.Check size={24} color={L.c.green}/>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: L.f.sans, fontSize: 16, fontWeight: 700,
                    color: L.c.ink,
                  }}>{r.t}</div>
                  <div style={{
                    fontSize: 14, color: L.c.inkSoft,
                    marginTop: 4, lineHeight: 1.5,
                  }}>{r.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── TESTIMONIALS ──────────────────────────────────────────
function TestimonialsSection() {
  const tms = [
    {
      name: 'Dra. Ana Morales',
      role: 'Medicina general · 6 años',
      city: 'Lima — San Isidro',
      img: 'AM',
      quote: 'Trabajaba solo en una clínica privada. Ahora, en mis horas libres hago 3–4 visitas semanales. Los pagos por Yape caen cada viernes como un reloj.',
      stats: '127 visitas · 4.9 ★',
    },
    {
      name: 'Dr. Luis Vargas',
      role: 'Medicina general · 11 años',
      city: 'Arequipa — Cayma',
      img: 'LV',
      quote: 'Lo mejor es que yo elijo mis zonas. Si no quiero cruzar la ciudad, no cruzo. El soporte de DH siempre responde, incluso los domingos.',
      stats: '218 visitas · 4.9 ★',
    },
    {
      name: 'Dra. Patricia Flores',
      role: 'Pediatría · 8 años',
      city: 'Trujillo',
      img: 'PF',
      quote: 'Para los papás que no quieren llevar a su bebé a una clínica con fiebre, la visita a domicilio es oro. Tengo muchas familias que me piden una y otra vez.',
      stats: '94 visitas · 5.0 ★',
    },
  ];

  return (
    <Section padY={110}>
      <Container>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
          <SectionEyebrow>Lo que dicen nuestros médicos</SectionEyebrow>
          <SectionTitle align="center">Historias reales, en todo el Perú.</SectionTitle>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}>
          {tms.map((t, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: 24,
              background: i === 1 ? L.c.ink : '#fff',
              color: i === 1 ? '#fff' : L.c.ink,
              border: i === 1 ? 'none' : `1px solid ${L.c.line}`,
              boxShadow: i === 1 ? '0 24px 60px rgba(11,31,51,0.25)' : 'none',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                {[1,2,3,4,5].map(n => <LI.Star key={n} size={16} color={L.c.amber}/>)}
              </div>

              {/* Quote */}
              <p style={{
                fontFamily: L.f.sans, fontSize: 16, fontWeight: 500,
                lineHeight: 1.55,
                margin: 0, flex: 1,
                color: i === 1 ? 'rgba(255,255,255,0.92)' : L.c.inkSoft,
                textWrap: 'pretty',
              }}>
                "{t.quote}"
              </p>

              {/* Person */}
              <div style={{
                marginTop: 28, paddingTop: 20,
                borderTop: `1px solid ${i === 1 ? 'rgba(255,255,255,0.14)' : L.c.line}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: i === 1 ? 'rgba(255,255,255,0.14)' : L.c.blueSoft,
                  color: i === 1 ? '#fff' : L.c.blueInk,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: L.f.sans, fontSize: 16, fontWeight: 800,
                }}>{t.img}</div>
                <div>
                  <div style={{ fontFamily: L.f.sans, fontSize: 15, fontWeight: 700 }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: 13, marginTop: 2,
                    color: i === 1 ? 'rgba(255,255,255,0.6)' : L.c.inkSoft,
                  }}>
                    {t.role} · {t.city}
                  </div>
                  <div style={{
                    fontSize: 12, marginTop: 6, fontWeight: 700,
                    color: i === 1 ? 'rgba(255,255,255,0.85)' : L.c.blue,
                  }}>
                    {t.stats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────
function FAQItem({ q, a, open, onToggle }) {
  return (
    <div style={{
      borderBottom: `1px solid ${L.c.line}`,
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '24px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent', border: 'none', textAlign: 'left',
        fontFamily: L.f.sans,
      }}>
        <span style={{
          fontSize: 18, fontWeight: 700, color: L.c.ink,
          letterSpacing: -0.3, paddingRight: 20,
        }}>{q}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: open ? L.c.blue : L.c.bgWarm,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s, background 0.2s',
        }}>
          <LI.ChevronDown size={18} color={open ? '#fff' : L.c.ink}/>
        </div>
      </button>
      {open && (
        <div style={{
          paddingBottom: 28, paddingRight: 60,
          fontSize: 15.5, lineHeight: 1.6, color: L.c.inkSoft,
          textWrap: 'pretty',
          animation: 'dhFloatUp 0.25s ease-out',
        }}>{a}</div>
      )}
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = React.useState(0);
  const faqs = [
    { q: '¿Cuánto cuesta registrarme?', a: 'Nada. La aplicación y uso de Doctor House Pro es gratuito. Solo descontamos una comisión del 18% sobre cada visita que atiendes.' },
    { q: '¿Cuándo me pagan?', a: 'Todos los viernes hacemos un depósito a tu Yape o cuenta bancaria con las ganancias de la semana anterior (lunes a domingo). Sin mínimos, sin demoras.' },
    { q: '¿Estoy obligado a aceptar todos los pedidos?', a: 'No. Puedes rechazar cualquier pedido sin penalización. Sin embargo, tu tasa de aceptación influye en qué tan rápido te llegan nuevos pedidos.' },
    { q: '¿Cómo protegen mi responsabilidad profesional?', a: 'Todos los médicos activos están cubiertos por una póliza de responsabilidad civil profesional sin costo adicional, contratada por Doctor House.' },
    { q: '¿Qué pasa si un paciente me agrede o es un caso de emergencia?', a: 'Tienes un botón de SOS que llama a nuestro soporte 24/7 y, si corresponde, a emergencias. Si detectas una emergencia, nuestro protocolo es derivar al 106 inmediatamente.' },
    { q: '¿Puedo trabajar fuera de Lima?', a: 'Sí. Operamos en Lima, Arequipa, Trujillo, Chiclayo y Piura. Estamos expandiendo a más ciudades — si no vemos tu zona aún, igual puedes aplicar.' },
    { q: '¿Cuánto tarda la aprobación?', a: 'En promedio 48 horas hábiles después de que subes todos los documentos. Si falta algo, te avisamos por WhatsApp y lo resolvemos rápido.' },
  ];

  return (
    <Section bg={L.c.bgWarm} padY={110}>
      <div id="faq" style={{ position: 'absolute', top: -80 }}/>
      <Container max={900}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
          <SectionTitle align="center">Todo lo que quieres saber.</SectionTitle>
        </div>

        <div style={{
          background: '#fff',
          padding: '0 40px',
          borderRadius: 24,
          border: `1px solid ${L.c.line}`,
        }}>
          {faqs.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q} a={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── FINAL CTA ─────────────────────────────────────────────
function FinalCtaSection({ onApply }) {
  return (
    <Section padY={100}>
      <Container>
        <div style={{
          padding: '72px 48px', borderRadius: 32,
          background: 'linear-gradient(135deg, #0A2E73 0%, #1863E0 60%, #3F82FF 100%)',
          color: '#fff',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative rings */}
          <div style={{
            position: 'absolute', top: -150, left: -100,
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}/>
          <div style={{
            position: 'absolute', bottom: -120, right: -80,
            width: 260, height: 260, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}/>

          <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
            <Badge bg="rgba(255,255,255,0.14)" color="#fff">
              <LI.Sparkle size={12}/> Aplicar toma 7 minutos
            </Badge>

            <h2 style={{
              fontFamily: L.f.sans, fontSize: 54, fontWeight: 800,
              letterSpacing: -1.6, lineHeight: 1.05,
              margin: '20px 0 18px',
              textWrap: 'balance',
            }}>
              Empieza a ver pacientes esta semana.
            </h2>

            <p style={{
              fontSize: 19, opacity: 0.85, lineHeight: 1.5,
              margin: '0 auto 40px', maxWidth: 520,
            }}>
              Miles de peruanos buscan atención médica a domicilio todos los días.
              Tu próximo paciente te está esperando.
            </p>

            <PrimaryCta size="xl" onClick={onApply}>
              Empezar mi aplicación <LI.Arrow size={22}/>
            </PrimaryCta>

            <div style={{ marginTop: 20, fontSize: 13, opacity: 0.7 }}>
              Sin costo · Respuesta en 48 h · +340 médicos ya trabajan con nosotros
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: L.c.ink,
      color: '#fff',
      padding: '64px 0 32px',
    }}>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 40, paddingBottom: 48,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div>
            <LogoLockup size={26} color="#fff"/>
            <p style={{
              fontSize: 14, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.65)',
              marginTop: 20, maxWidth: 320,
            }}>
              La plataforma peruana para médicos que quieren trabajar
              a domicilio con flexibilidad, transparencia y buenos pagos.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6, marginBottom: 18 }}>
              Para médicos
            </div>
            {['Aplicar', 'Preguntas frecuentes', 'Calculadora', 'Requisitos'].map(x => (
              <div key={x} style={{ fontSize: 14, marginBottom: 12, opacity: 0.85 }}>
                <a style={{ color: 'inherit', textDecoration: 'none' }}>{x}</a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6, marginBottom: 18 }}>
              Empresa
            </div>
            {['Sobre nosotros', 'Cobertura', 'Blog', 'Prensa'].map(x => (
              <div key={x} style={{ fontSize: 14, marginBottom: 12, opacity: 0.85 }}>
                <a style={{ color: 'inherit', textDecoration: 'none' }}>{x}</a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6, marginBottom: 18 }}>
              Contacto
            </div>
            <div style={{ fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.85 }}>
              <LI.Whatsapp size={18}/> +51 999 123 456
            </div>
            <div style={{ fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.85 }}>
              <LI.Mail size={18} color="#fff"/> medicos@doctorhouse.pe
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 16, lineHeight: 1.55 }}>
              Lun a Vie · 8 am – 8 pm<br/>
              Soporte 24/7 en la app
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 32, fontSize: 13, opacity: 0.5,
        }}>
          <div>© 2026 Doctor House SAC · RUC 20605123456 · Lima, Perú</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Política de cookies</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

Object.assign(window, {
  BenefitsSection, RequirementsSection, TestimonialsSection,
  FAQSection, FinalCtaSection, Footer,
});
