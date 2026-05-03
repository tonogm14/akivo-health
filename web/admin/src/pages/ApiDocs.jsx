import { useState, useRef, useEffect } from 'react';
import { C, F, R, S } from '@/tokens';

// ─── Paleta de código ──────────────────────────────────────
const CODE = {
  bg:       '#0D1117',
  border:   '#21262D',
  comment:  '#8B949E',
  key:      '#79C0FF',
  string:   '#A5D6FF',
  number:   '#79C0FF',
  keyword:  '#FF7B72',
  method:   '#D2A8FF',
  url:      '#FFA657',
  text:     '#E6EDF3',
  label:    '#30363D',
  labelFg:  '#8B949E',
};

const METHOD_COLORS = {
  GET:    { bg: '#D1FAE5', fg: '#065F46' },
  POST:   { bg: '#DBEAFE', fg: '#1E40AF' },
  PUT:    { bg: '#FEF3C7', fg: '#92400E' },
  PATCH:  { bg: '#E0E7FF', fg: '#3730A3' },
  DELETE: { bg: '#FEE2E2', fg: '#991B1B' },
};

// ─── Componentes base ──────────────────────────────────────

function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || { bg: '#F3F4F6', fg: '#374151' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: c.bg, color: c.fg,
      fontFamily: F.mono, fontSize: 11, fontWeight: 700,
      borderRadius: 4, letterSpacing: 0.5,
    }}>{method}</span>
  );
}

function CodeBlock({ code, lang = 'json' }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: CODE.label, borderRadius: `${R.md}px ${R.md}px 0 0`,
        padding: '6px 12px',
        border: `1px solid ${CODE.border}`, borderBottom: 'none',
      }}>
        <span style={{ fontFamily: F.mono, fontSize: 10.5, color: CODE.labelFg, letterSpacing: 0.5 }}>{lang}</span>
        <button onClick={copy} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: F.mono, fontSize: 10.5, color: copied ? '#4ADE80' : CODE.labelFg,
          padding: '2px 6px', borderRadius: 4,
        }}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '16px 18px',
        background: CODE.bg, color: CODE.text,
        fontFamily: F.mono, fontSize: 12.5, lineHeight: 1.7,
        overflowX: 'auto', borderRadius: `0 0 ${R.md}px ${R.md}px`,
        border: `1px solid ${CODE.border}`,
        whiteSpace: 'pre',
      }}>{code}</pre>
    </div>
  );
}

function ParamTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.surfaceAlt }}>
            {['Parámetro', 'Tipo', 'Req.', 'Descripción'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.inkMuted, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
              <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 12, color: C.primary }}>{r[0]}</td>
              <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 11.5, color: C.inkMuted }}>{r[1]}</td>
              <td style={{ padding: '9px 12px' }}>
                {r[2] === 'sí'
                  ? <span style={{ color: C.red, fontWeight: 700, fontSize: 11 }}>✕ req.</span>
                  : <span style={{ color: C.inkSubtle, fontSize: 11 }}>opt.</span>}
              </td>
              <td style={{ padding: '9px 12px', color: C.inkSoft }}>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointCard({ method, path, description, params, body, response, queryParams }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: R.lg, marginBottom: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '12px 16px', background: open ? C.primarySoft : C.surface,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        borderBottom: open ? `1px solid ${C.line}` : 'none',
      }}>
        <MethodBadge method={method}/>
        <code style={{ fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, color: C.ink, flex: 1 }}>{path}</code>
        <span style={{ fontSize: 12, color: C.inkMuted, flex: 2, textAlign: 'left' }}>{description}</span>
        <span style={{ color: C.inkMuted, fontSize: 14, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </button>
      {open && (
        <div style={{ padding: 18, background: C.surface }}>
          {queryParams && (
            <>
              <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Query Params</h4>
              <ParamTable rows={queryParams}/>
            </>
          )}
          {params && (
            <>
              <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Parámetros URL</h4>
              <ParamTable rows={params}/>
            </>
          )}
          {body && (
            <>
              <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Request Body</h4>
              <CodeBlock code={body} lang="json — body"/>
            </>
          )}
          <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Respuesta</h4>
          <CodeBlock code={response} lang="json — 200 OK"/>
        </div>
      )}
    </div>
  );
}

function Section({ id, title, kicker, children }) {
  return (
    <section id={id} style={{ paddingBottom: 48, borderBottom: `1px solid ${C.lineSoft}`, marginBottom: 48 }}>
      {kicker && <div style={{ fontFamily: F.mono, fontSize: 10.5, color: C.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{kicker}</div>}
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>{title}</h2>
      {children}
    </section>
  );
}

function P({ children, style }) {
  return <p style={{ margin: '0 0 14px', fontSize: 14, color: C.inkSoft, lineHeight: 1.75, ...style }}>{children}</p>;
}

function H3({ children }) {
  return <h3 style={{ margin: '24px 0 10px', fontSize: 15, fontWeight: 700, color: C.ink }}>{children}</h3>;
}

function Note({ tone = 'info', children }) {
  const t = {
    info:  { bg: C.primarySoft, border: C.primary + '44', icon: 'ℹ', color: C.primary },
    warn:  { bg: C.amberSoft,   border: C.amber + '44',   icon: '⚠', color: C.amber },
    ok:    { bg: C.greenSoft,   border: C.green + '44',   icon: '✓', color: C.green },
  }[tone];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '12px 16px', marginBottom: 16,
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: R.md,
      fontSize: 13, color: C.inkSoft, lineHeight: 1.6,
    }}>
      <span style={{ color: t.color, fontWeight: 700, flexShrink: 0 }}>{t.icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Contenido de la documentación ────────────────────────

const NAV_ITEMS = [
  { id: 'intro',      label: 'Introducción' },
  { id: 'baseurl',    label: 'Base URL' },
  { id: 'auth',       label: 'Autenticación' },
  { id: 'endpoints',  label: 'Endpoints', children: [
    { id: 'ep-auth',   label: 'Auth' },
    { id: 'ep-juegos', label: 'Juegos' },
    { id: 'ep-admin',  label: 'Admin' },
  ]},
  { id: 'ejemplos',   label: 'Ejemplos de uso' },
  { id: 'websockets', label: 'WebSockets' },
  { id: 'errores',    label: 'Errores' },
  { id: 'practicas',  label: 'Buenas prácticas' },
];

// ─── Página principal ──────────────────────────────────────

export default function ApiDocs() {
  const [active, setActive] = useState('intro');
  const mainRef = useRef(null);

  function scrollTo(id) {
    const el = document.getElementById('doc-' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  }

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    function onScroll() {
      for (const item of NAV_ITEMS) {
        const ids = item.children ? [item.id, ...item.children.map(c => c.id)] : [item.id];
        for (const id of ids) {
          const el = document.getElementById('doc-' + id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120) setActive(id);
          }
        }
      }
    }
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* ── Doc nav ── */}
      <nav style={{
        width: 220, flexShrink: 0,
        background: C.surface, borderRight: `1px solid ${C.line}`,
        overflowY: 'auto', padding: '24px 0',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, background: '#6C47FF', borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>Q</span>
            </div>
            <div>
              <div style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 700, color: C.ink }}>QTriviaPeru</div>
              <div style={{ fontFamily: F.mono, fontSize: 9.5, color: C.inkSubtle, letterSpacing: 0.8 }}>API v1.0</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 8px' }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', border: 'none', cursor: 'pointer', borderRadius: 5,
                  background: active === item.id ? C.primarySoft : 'transparent',
                  color: active === item.id ? C.primary : C.inkSoft,
                  fontFamily: F.sans, fontSize: 13, fontWeight: active === item.id ? 600 : 400,
                }}
              >{item.label}</button>
              {item.children && item.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => scrollTo(child.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '5px 10px 5px 22px', border: 'none', cursor: 'pointer', borderRadius: 5,
                    background: active === child.id ? C.primarySoft : 'transparent',
                    color: active === child.id ? C.primary : C.inkMuted,
                    fontFamily: F.sans, fontSize: 12, fontWeight: active === child.id ? 600 : 400,
                  }}
                >↳ {child.label}</button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', borderTop: `1px solid ${C.lineSoft}`, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.inkSubtle, fontFamily: F.mono }}>Última actualización</div>
          <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>Enero 2025</div>
        </div>
      </nav>

      {/* ── Doc content ── */}
      <div ref={mainRef} style={{ flex: 1, overflowY: 'auto', padding: '40px 60px 80px', maxWidth: 860 }}>

        {/* ── INTRODUCCIÓN ── */}
        <div id="doc-intro">
          <Section id="doc-intro" title="Introducción" kicker="— QTriviaPeru API v1.0 —">
            <P>La <strong>QTriviaPeru API</strong> es una API RESTful que permite a desarrolladores integrar funciones de trivia multijugador en tiempo real dentro de sus aplicaciones. Gestiona usuarios, salas de juego, preguntas y tableros de puntuación.</P>
            <P>Está diseñada para ser simple de adoptar, segura y escalable. Soporta autenticación con JWT, actualizaciones en tiempo real vía WebSockets y está optimizada para baja latencia desde servidores en Lima, Perú.</P>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Protocolo',  value: 'HTTPS + WSS' },
                { label: 'Auth',       value: 'JWT Bearer' },
                { label: 'Formato',    value: 'JSON (UTF-8)' },
              ].map(kv => (
                <div key={kv.label} style={{ padding: '14px 16px', border: `1px solid ${C.line}`, borderRadius: R.md, background: C.surfaceAlt }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{kv.label}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>{kv.value}</div>
                </div>
              ))}
            </div>
            <Note tone="info">Esta documentación está en español (Perú). Todos los mensajes de error y respuestas del API también están en español.</Note>
          </Section>
        </div>

        {/* ── BASE URL ── */}
        <div id="doc-baseurl">
          <Section title="Base URL">
            <P>Todas las peticiones deben hacerse sobre HTTPS. Nunca uses HTTP en producción.</P>
            <CodeBlock lang="url — producción" code={`https://api.qtriviaperu.com/v1`}/>
            <CodeBlock lang="url — sandbox (pruebas)" code={`https://sandbox.qtriviaperu.com/v1`}/>
            <Note tone="warn">El entorno sandbox reinicia sus datos cada 24 horas. No guardes datos importantes allí.</Note>
          </Section>
        </div>

        {/* ── AUTENTICACIÓN ── */}
        <div id="doc-auth">
          <Section title="Autenticación">
            <P>QTriviaPeru usa <strong>JSON Web Tokens (JWT)</strong> para autenticar todas las peticiones a endpoints protegidos. El token se obtiene al registrarse o iniciar sesión y tiene una vigencia de <strong>24 horas</strong>.</P>

            <H3>1. Obtener un token</H3>
            <P>Llama a <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>POST /auth/login</code> con tus credenciales. La respuesta incluirá el campo <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>token</code>.</P>
            <CodeBlock lang="json — respuesta del login" code={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "usr_abc123",
    "nombre": "Carlos Quispe",
    "email": "carlos@ejemplo.com",
    "rol": "jugador"
  }
}`}/>

            <H3>2. Incluir el token en cada petición</H3>
            <P>Agrega el header <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>Authorization</code> con el prefijo <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>Bearer</code> en todas las peticiones protegidas.</P>
            <CodeBlock lang="http — header requerido" code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}/>

            <H3>3. Refresh del token</H3>
            <P>Antes de que expire, puedes renovarlo haciendo GET a <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>/auth/refresh</code> con el token actual. Si el token ya expiró, el usuario deberá volver a iniciar sesión.</P>
            <Note tone="warn">Nunca guardes el token en lugares inseguros como <code>localStorage</code> en apps de alta seguridad. Prefiere <code>httpOnly cookies</code> o almacenamiento seguro nativo.</Note>
          </Section>
        </div>

        {/* ── ENDPOINTS ── */}
        <div id="doc-endpoints">
          <Section title="Endpoints">
            <P>A continuación se documentan todos los endpoints disponibles. Haz clic en cada uno para expandir detalles, parámetros y ejemplos de respuesta.</P>

            {/* ── Auth endpoints ── */}
            <div id="doc-ep-auth">
              <H3>🔐 Autenticación</H3>

              <EndpointCard
                method="POST" path="/auth/register"
                description="Registra un nuevo usuario en la plataforma"
                body={`{
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "password": "MiPassword123!",
  "pais": "PE"
}`}
                response={`{
  "mensaje": "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
  "user_id": "usr_xyz789"
}`}
              />

              <EndpointCard
                method="POST" path="/auth/login"
                description="Inicia sesión y retorna un token JWT"
                body={`{
  "email": "ana@ejemplo.com",
  "password": "MiPassword123!"
}`}
                response={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "usr_xyz789",
    "nombre": "Ana García",
    "email": "ana@ejemplo.com",
    "rol": "jugador",
    "puntos_totales": 1250,
    "nivel": 4
  }
}`}
              />

              <EndpointCard
                method="GET" path="/auth/me"
                description="Retorna el perfil del usuario autenticado"
                response={`{
  "id": "usr_xyz789",
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "rol": "jugador",
  "puntos_totales": 1250,
  "nivel": 4,
  "insignias": ["primera_victoria", "racha_7_dias"],
  "creado_en": "2025-01-10T14:30:00Z"
}`}
              />
            </div>

            {/* ── Juegos endpoints ── */}
            <div id="doc-ep-juegos" style={{ marginTop: 32 }}>
              <H3>🎮 Juegos</H3>

              <EndpointCard
                method="GET" path="/juegos"
                description="Lista todos los juegos disponibles (público o privado según auth)"
                queryParams={[
                  ['categoria',  'string',  'opt.', 'Filtra por categoría: historia, ciencia, cultura, deporte'],
                  ['estado',     'string',  'opt.', 'Valores: esperando, en_curso, finalizado'],
                  ['pagina',     'integer', 'opt.', 'Número de página. Por defecto: 1'],
                  ['por_pagina', 'integer', 'opt.', 'Resultados por página. Máx: 50. Por defecto: 20'],
                ]}
                response={`{
  "datos": [
    {
      "id": "jgo_abc001",
      "titulo": "Trivia Perú: Historia",
      "categoria": "historia",
      "estado": "esperando",
      "jugadores_actuales": 3,
      "max_jugadores": 8,
      "puntos_entrada": 0,
      "dificultad": "intermedio",
      "inicia_en": "2025-01-15T20:00:00Z"
    }
  ],
  "total": 24,
  "pagina": 1,
  "por_pagina": 20
}`}
              />

              <EndpointCard
                method="GET" path="/juegos/:id"
                description="Retorna los detalles completos de un juego específico"
                params={[
                  ['id', 'string (UUID)', 'sí', 'ID único del juego'],
                ]}
                response={`{
  "id": "jgo_abc001",
  "titulo": "Trivia Perú: Historia",
  "descripcion": "Pon a prueba tus conocimientos sobre la historia del Perú.",
  "categoria": "historia",
  "estado": "esperando",
  "jugadores": [
    { "id": "usr_xyz789", "nombre": "Ana García", "listo": true },
    { "id": "usr_def456", "nombre": "Luis Mamani", "listo": false }
  ],
  "max_jugadores": 8,
  "total_preguntas": 10,
  "tiempo_por_pregunta": 30,
  "puntos_por_correcta": 100,
  "creado_en": "2025-01-10T10:00:00Z"
}`}
              />
            </div>

            {/* ── Admin endpoints ── */}
            <div id="doc-ep-admin" style={{ marginTop: 32 }}>
              <H3>🛡 Admin</H3>
              <Note tone="warn">Los endpoints bajo <code>/admin</code> requieren un token de usuario con rol <strong>admin</strong>. Las peticiones de usuarios con rol <code>jugador</code> recibirán un error <code>403 Forbidden</code>.</Note>

              <EndpointCard
                method="POST" path="/admin/juegos"
                description="Crea un nuevo juego de trivia"
                body={`{
  "titulo": "Trivia Lima: Arquitectura",
  "descripcion": "Conoce los monumentos y arquitectura de Lima.",
  "categoria": "cultura",
  "max_jugadores": 10,
  "total_preguntas": 15,
  "tiempo_por_pregunta": 20,
  "puntos_por_correcta": 150,
  "dificultad": "avanzado",
  "inicia_en": "2025-02-01T18:00:00Z",
  "es_publico": true
}`}
                response={`{
  "id": "jgo_new999",
  "mensaje": "Juego creado exitosamente.",
  "url_sala": "wss://rt.qtriviaperu.com/sala/jgo_new999"
}`}
              />

              <EndpointCard
                method="POST" path="/admin/preguntas"
                description="Agrega una o varias preguntas a un juego existente"
                body={`{
  "juego_id": "jgo_new999",
  "preguntas": [
    {
      "texto": "¿En qué año se fundó la ciudad de Lima?",
      "opciones": ["1535", "1521", "1492", "1600"],
      "respuesta_correcta": 0,
      "explicacion": "Lima fue fundada el 18 de enero de 1535 por Francisco Pizarro.",
      "puntos": 150,
      "tiempo_segundos": 20
    },
    {
      "texto": "¿Cuál es el nombre del palacio de gobierno del Perú?",
      "opciones": ["Palacio Pizarro", "Casa de Gobierno", "Palacio de la Unión", "Palacio de Lima"],
      "respuesta_correcta": 1,
      "puntos": 100,
      "tiempo_segundos": 15
    }
  ]
}`}
                response={`{
  "mensaje": "2 pregunta(s) agregadas correctamente.",
  "ids": ["prg_001", "prg_002"],
  "total_en_juego": 12
}`}
              />
            </div>
          </Section>
        </div>

        {/* ── EJEMPLOS ── */}
        <div id="doc-ejemplos">
          <Section title="Ejemplos de uso">

            <H3>JavaScript — fetch</H3>
            <CodeBlock lang="javascript — fetch nativo" code={`// Iniciar sesión y obtener token
const res = await fetch('https://api.qtriviaperu.com/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ana@ejemplo.com',
    password: 'MiPassword123!'
  })
});
const { token } = await res.json();

// Consultar juegos disponibles
const juegos = await fetch('https://api.qtriviaperu.com/v1/juegos?categoria=historia', {
  headers: { Authorization: \`Bearer \${token}\` }
}).then(r => r.json());

console.log(juegos.datos); // Array de juegos`}/>

            <H3>JavaScript — axios</H3>
            <CodeBlock lang="javascript — axios" code={`import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.qtriviaperu.com/v1',
  timeout: 8000,
});

// Interceptor: agrega token automáticamente
API.interceptors.request.use(config => {
  const token = localStorage.getItem('qtp_token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Iniciar sesión
const { data } = await API.post('/auth/login', {
  email: 'ana@ejemplo.com',
  password: 'MiPassword123!'
});
localStorage.setItem('qtp_token', data.token);

// Obtener detalle de juego
const juego = await API.get('/juegos/jgo_abc001');
console.log(juego.data);`}/>

            <H3>cURL</H3>
            <CodeBlock lang="bash — cURL" code={`# 1. Iniciar sesión
curl -X POST https://api.qtriviaperu.com/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"ana@ejemplo.com","password":"MiPassword123!"}'

# 2. Listar juegos (con token)
curl https://api.qtriviaperu.com/v1/juegos \\
  -H "Authorization: Bearer <tu_token_aquí>"

# 3. Crear juego (admin)
curl -X POST https://api.qtriviaperu.com/v1/admin/juegos \\
  -H "Authorization: Bearer <token_admin>" \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Trivia Lima","categoria":"cultura","max_jugadores":8,"total_preguntas":10}'`}/>
          </Section>
        </div>

        {/* ── WEBSOCKETS ── */}
        <div id="doc-websockets">
          <Section title="WebSockets">
            <P>Para las funciones en tiempo real (unirse a salas, recibir preguntas, enviar respuestas), QTriviaPeru usa <strong>Socket.IO v4</strong> sobre WSS.</P>

            <H3>Conexión</H3>
            <CodeBlock lang="javascript — socket.io-client" code={`import { io } from 'socket.io-client';

const socket = io('wss://rt.qtriviaperu.com', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIs...' },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Conectado al servidor en tiempo real:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Error de conexión:', err.message);
});`}/>

            <H3>Unirse a un juego</H3>
            <CodeBlock lang="javascript — emitir evento" code={`// Emitir: unirse a sala de juego
socket.emit('unirse_juego', {
  juego_id: 'jgo_abc001',
  apodo: 'AnaTriviaPro'
});

// Escuchar: confirmación de unión
socket.on('jugador_unido', ({ jugadores, tu_turno_es }) => {
  console.log('Jugadores en sala:', jugadores);
  console.log('Turno:', tu_turno_es);
});`}/>

            <H3>Recibir pregunta</H3>
            <CodeBlock lang="javascript — escuchar evento" code={`socket.on('nueva_pregunta', ({ pregunta, numero, total, tiempo }) => {
  console.log(\`Pregunta \${numero}/\${total}: \${pregunta.texto}\`);
  console.log('Opciones:', pregunta.opciones);
  console.log(\`Tienes \${tiempo} segundos para responder.\`);

  // Mostrar pregunta en la UI...
});`}/>

            <H3>Enviar respuesta</H3>
            <CodeBlock lang="javascript — emitir respuesta" code={`// Enviar respuesta (índice de la opción: 0, 1, 2 o 3)
socket.emit('enviar_respuesta', {
  juego_id: 'jgo_abc001',
  pregunta_id: 'prg_001',
  opcion: 2,
  tiempo_respondido_ms: 4250
});

// Escuchar resultado inmediato
socket.on('resultado_respuesta', ({ correcto, puntos_ganados, explicacion, ranking }) => {
  console.log(correcto ? '¡Correcto! +' + puntos_ganados : 'Incorrecto');
  console.log('Ranking actual:', ranking);
});`}/>

            <H3>Eventos disponibles</H3>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.surfaceAlt }}>
                    {['Evento', 'Dirección', 'Descripción'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.inkMuted, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['unirse_juego',        '↑ cliente → servidor', 'Solicitud para entrar a una sala'],
                    ['jugador_unido',       '↓ servidor → cliente', 'Confirmación de entrada + lista actual'],
                    ['juego_iniciando',     '↓ broadcast',          'Cuenta regresiva antes de la primera pregunta'],
                    ['nueva_pregunta',      '↓ broadcast',          'Datos de la pregunta activa + tiempo límite'],
                    ['enviar_respuesta',    '↑ cliente → servidor', 'Respuesta del jugador (opción elegida)'],
                    ['resultado_respuesta', '↓ solo al jugador',    'Si fue correcta, puntos y explicación'],
                    ['ranking_actualizado', '↓ broadcast',          'Tabla de posiciones actualizada'],
                    ['juego_finalizado',    '↓ broadcast',          'Resultados finales + ganador'],
                    ['jugador_salio',       '↓ broadcast',          'Notifica que un jugador abandonó'],
                    ['error',               '↓ solo al jugador',    'Errores de validación o de sala'],
                  ].map(([ev, dir, desc], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                      <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 12, color: C.primary }}>{ev}</td>
                      <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 11, color: dir.includes('↑') ? C.teal : C.amber }}>{dir}</td>
                      <td style={{ padding: '9px 12px', color: C.inkSoft }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* ── ERRORES ── */}
        <div id="doc-errores">
          <Section title="Manejo de errores">
            <P>Todos los errores retornan un objeto JSON consistente con los campos <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>error</code>, <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>codigo</code> y (cuando aplica) <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>detalles</code>.</P>
            <CodeBlock lang="json — formato de error" code={`{
  "error": "Token expirado o inválido.",
  "codigo": "TOKEN_INVALIDO",
  "detalles": null
}`}/>
            <CodeBlock lang="json — error de validación (422)" code={`{
  "error": "Los datos enviados contienen errores.",
  "codigo": "VALIDACION_FALLIDA",
  "detalles": [
    { "campo": "email", "mensaje": "El correo no tiene un formato válido." },
    { "campo": "password", "mensaje": "La contraseña debe tener al menos 8 caracteres." }
  ]
}`}/>

            <H3>Códigos HTTP utilizados</H3>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.surfaceAlt }}>
                    {['Código', 'Nombre', 'Cuándo ocurre'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: C.inkMuted, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['200', 'OK',                    'La petición fue exitosa.'],
                    ['201', 'Created',               'Recurso creado correctamente (POST).'],
                    ['400', 'Bad Request',           'La petición tiene parámetros incorrectos o incompletos.'],
                    ['401', 'Unauthorized',          'No se proporcionó token o es inválido.'],
                    ['403', 'Forbidden',             'El usuario no tiene permisos suficientes (ej. requiere admin).'],
                    ['404', 'Not Found',             'El recurso solicitado no existe.'],
                    ['409', 'Conflict',              'Conflicto: el recurso ya existe (ej. email duplicado).'],
                    ['422', 'Unprocessable Entity',  'Los datos enviados no pasan la validación.'],
                    ['429', 'Too Many Requests',     'Se superó el límite de peticiones (rate limit).'],
                    ['500', 'Internal Server Error', 'Error inesperado del servidor. Reportar al soporte.'],
                  ].map(([code, name, when], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                      <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: parseInt(code) < 300 ? C.green : parseInt(code) < 500 ? C.amber : C.red }}>{code}</td>
                      <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 12, color: C.inkSoft }}>{name}</td>
                      <td style={{ padding: '9px 12px', color: C.inkSoft }}>{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H3>Rate limiting</H3>
            <P>La API permite <strong>60 peticiones por minuto</strong> por IP/token en endpoints públicos y <strong>30 por minuto</strong> en endpoints de autenticación. Cuando se supera el límite se retorna <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>429 Too Many Requests</code> con el header <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>Retry-After</code>.</P>
          </Section>
        </div>

        {/* ── BUENAS PRÁCTICAS ── */}
        <div id="doc-practicas">
          <Section title="Buenas prácticas">
            <H3>Reintentos con backoff exponencial</H3>
            <P>Para errores <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>500</code> o <code style={{ fontFamily: F.mono, background: C.surfaceAlt, padding: '1px 5px', borderRadius: 3 }}>503</code>, implementa reintentos con espera creciente.</P>
            <CodeBlock lang="javascript — retry con backoff" code={`async function fetchConReintento(url, opciones, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, opciones);
      if (res.ok) return res.json();
      if (res.status < 500) throw new Error(await res.text()); // no reintentar 4xx
      // espera: 1s, 2s, 4s...
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    } catch (err) {
      if (i === intentos - 1) throw err;
    }
  }
}`}/>

            <H3>Manejo de tokens</H3>
            <CodeBlock lang="javascript — gestión de token" code={`// Guarda el tiempo de expiración junto con el token
function guardarToken(token, expiresIn) {
  const expiraEn = Date.now() + expiresIn * 1000;
  sessionStorage.setItem('qtp_token', token);
  sessionStorage.setItem('qtp_expira', expiraEn);
}

// Verifica si está próximo a expirar (5 min antes)
function tokenProximoAExpirar() {
  const expira = parseInt(sessionStorage.getItem('qtp_expira') || '0');
  return Date.now() > expira - 5 * 60 * 1000;
}

// En cada petición, verifica y renueva si es necesario
async function tokenActivo() {
  if (tokenProximoAExpirar()) {
    const res = await fetch('/auth/refresh', {
      headers: { Authorization: \`Bearer \${sessionStorage.getItem('qtp_token')}\` }
    });
    const { token, expires_in } = await res.json();
    guardarToken(token, expires_in);
  }
  return sessionStorage.getItem('qtp_token');
}`}/>

            <H3>Optimización de latencia</H3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Usa keep-alive',       'Las conexiones TCP persistentes reducen el tiempo de handshake en peticiones frecuentes.'],
                ['Paginación eficiente', 'No solicites más datos de los que necesitas. Usa los parámetros pagina y por_pagina.'],
                ['Caché de datos',       'Los endpoints GET /juegos son cacheables por 30s en clientes móviles y web.'],
                ['WebSocket vs polling', 'Para datos en tiempo real, siempre usa WebSockets en lugar de polling HTTP.'],
                ['Compresión gzip',      'El servidor envía gzip/brotli. Asegúrate de que tu cliente lo acepte con Accept-Encoding: gzip.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: R.md, background: C.surfaceAlt }}>
                  <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <div>
                    <strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{title}</strong>
                    <span style={{ fontSize: 12.5, color: C.inkMuted }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 24 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkSubtle }}>QTriviaPeru API v1.0 · Lima, Perú · 2025</div>
          <div style={{ fontSize: 12, color: C.inkSubtle, marginTop: 4 }}>
            Soporte: <span style={{ color: C.primary }}>developers@qtriviaperu.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
