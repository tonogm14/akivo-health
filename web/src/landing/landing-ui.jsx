// ═══════════════════════════════════════════════════════════
// Landing UI primitives — Doctor House para médicos
// ═══════════════════════════════════════════════════════════
const L = {
  c: {
    ink: '#0B1F33',
    inkSoft: '#4A5B6E',
    inkMuted: '#8A9AAB',
    line: '#E4E9EE',
    lineStrong: '#D3DCE4',
    bg: '#FBFCFD',
    bgWarm: '#F4F6F8',
    bgCool: '#EEF3FA',
    blue: '#1863E0',
    blueSoft: '#E8F0FD',
    blueDark: '#0F4AB5',
    blueInk: '#0A2E73',
    green: '#13A579',
    greenSoft: '#E2F6EF',
    amber: '#F0A020',
    amberSoft: '#FDF2DF',
    white: '#FFFFFF',
  },
  f: {
    sans: '"Manrope", -apple-system, system-ui, sans-serif',
  },
};

// ─── Logo ──────────────────────────────────────────────────
function DHLogo({ size = 32, color = L.c.blueInk }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House with integrated cross */}
      <path d="M24 5L5 20v22a2 2 0 0 0 2 2h34a2 2 0 0 0 2-2V20L24 5z"
        stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M20 26h8v6h-3v3h-2v-3h-3v-6z M20 26v-4h3v4 M28 26v-4h-3"
        fill={color} stroke={color} strokeWidth="0.5"/>
      <rect x="20" y="22" width="8" height="4" fill={color}/>
      <rect x="22" y="22" width="4" height="13" fill={color}/>
      <rect x="20" y="28" width="8" height="3" fill={color}/>
    </svg>
  );
}

function LogoLockup({ size = 28, color, sub = 'Para médicos' }) {
  const c = color || L.c.blueInk;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <DHLogo size={size * 1.4} color={c}/>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{ fontFamily: L.f.sans, fontSize: size * 0.9, fontWeight: 800, color: c, letterSpacing: -0.5 }}>
          Doctor House
        </span>
        {sub && (
          <span style={{
            fontFamily: L.f.sans, fontSize: size * 0.38, fontWeight: 700,
            color: c, opacity: 0.55, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
          }}>{sub}</span>
        )}
      </div>
    </div>
  );
}

// ─── Buttons ───────────────────────────────────────────────
function PrimaryCta({ children, onClick, size = 'md', fullWidth, glow }) {
  const sizes = {
    sm: { pad: '12px 20px', fs: 14 },
    md: { pad: '16px 28px', fs: 15 },
    lg: { pad: '20px 36px', fs: 17 },
    xl: { pad: '24px 44px', fs: 19 },
  }[size];
  return (
    <button onClick={onClick} style={{
      padding: sizes.pad,
      borderRadius: 14,
      border: 'none',
      background: glow
        ? 'linear-gradient(135deg, #1863E0 0%, #3F82FF 100%)'
        : L.c.blue,
      color: '#fff',
      fontFamily: L.f.sans,
      fontSize: sizes.fs,
      fontWeight: 700,
      letterSpacing: -0.2,
      width: fullWidth ? '100%' : 'auto',
      boxShadow: glow
        ? '0 10px 32px rgba(24,99,224,0.35), 0 2px 6px rgba(24,99,224,0.2)'
        : '0 6px 20px rgba(24,99,224,0.22)',
      transition: 'transform 0.12s, box-shadow 0.12s',
      display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {children}
    </button>
  );
}

function GhostCta({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px 28px', borderRadius: 14,
      border: `1.5px solid ${L.c.lineStrong}`,
      background: '#fff',
      color: L.c.ink,
      fontFamily: L.f.sans, fontSize: 15, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>{children}</button>
  );
}

// ─── Layout ────────────────────────────────────────────────
function Container({ children, max = 1200, style }) {
  return (
    <div style={{
      maxWidth: max, margin: '0 auto',
      padding: '0 32px',
      ...style,
    }}>{children}</div>
  );
}

function Section({ children, bg, padY = 100 }) {
  return (
    <section style={{
      background: bg || 'transparent',
      padding: `${padY}px 0`,
      position: 'relative',
    }}>{children}</section>
  );
}

function SectionEyebrow({ children, color }) {
  return (
    <div style={{
      fontFamily: L.f.sans, fontSize: 12, fontWeight: 700,
      letterSpacing: 3, textTransform: 'uppercase',
      color: color || L.c.blue, marginBottom: 14,
    }}>{children}</div>
  );
}

function SectionTitle({ children, color, size = 44, align = 'left' }) {
  return (
    <h2 style={{
      fontFamily: L.f.sans, fontSize: size, fontWeight: 800,
      color: color || L.c.ink, letterSpacing: -1.2,
      lineHeight: 1.1, margin: 0, textAlign: align,
      textWrap: 'balance',
    }}>{children}</h2>
  );
}

function SectionLede({ children, color }) {
  return (
    <p style={{
      fontFamily: L.f.sans, fontSize: 18, fontWeight: 500,
      color: color || L.c.inkSoft, lineHeight: 1.55,
      maxWidth: 620, marginTop: 18, marginBottom: 0,
      textWrap: 'pretty',
    }}>{children}</p>
  );
}

// ─── Iconography (simple, line-style) ──────────────────────
const LI = {
  Check: ({ size = 20, color = L.c.green }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill={color} opacity="0.15"/>
      <path d="M7 12.5l3.5 3.5L17 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Arrow: ({ size = 18, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-5-5l5 5-5 5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
      <path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Wallet: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke={color} strokeWidth="2"/>
      <path d="M3 7l12-4v4" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="16" cy="13" r="1.5" fill={color}/>
    </svg>
  ),
  Shield: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Phone: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="7" y="3" width="10" height="18" rx="2" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="18" r="0.5" fill={color}/>
    </svg>
  ),
  Calendar: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Users: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="2"/>
      <path d="M2 20a7 7 0 0 1 14 0" stroke={color} strokeWidth="2"/>
      <circle cx="17" cy="9" r="3" stroke={color} strokeWidth="2"/>
      <path d="M15 20a5 5 0 0 1 7-4" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  Doc: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M14 3v4h4" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M8 12h8M8 16h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  MapPin: ({ size = 22, color = L.c.blue }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  Star: ({ size = 18, color = L.c.amber, filled = true }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"
        fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronDown: ({ size = 18, color = L.c.ink }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Whatsapp: ({ size = 20, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 8.5c0 2.5 2 5 4.5 6.5l2-1.5 1.5 1.5a1 1 0 0 1-.5 1.5c-2.5.5-6-1.5-8-4.5S7 5.5 7.5 5c.3-.2 1 0 1.3.5L10 7l-1 1.5z"
        fill={color}/>
    </svg>
  ),
  Mail: ({ size = 20, color = L.c.ink }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M3 7l9 6 9-6" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Sparkle: ({ size = 18, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"
        fill={color}/>
    </svg>
  ),
};

// ─── Badge ─────────────────────────────────────────────────
function Badge({ children, color = L.c.blue, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: bg || L.c.blueSoft,
      color,
      fontFamily: L.f.sans, fontSize: 12, fontWeight: 700,
      letterSpacing: 0.3, textTransform: 'uppercase',
    }}>{children}</span>
  );
}

// ─── Expose ────────────────────────────────────────────────
Object.assign(window, {
  L, DHLogo, LogoLockup,
  PrimaryCta, GhostCta,
  Container, Section, SectionEyebrow, SectionTitle, SectionLede,
  LI, Badge,
});
