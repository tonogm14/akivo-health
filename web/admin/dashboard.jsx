// dashboard.jsx — Doctor House Admin Portal v2
const { useState, useEffect, useCallback, useContext, createContext, useRef } = React;

// Inject Animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
  `;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const DARK = {
  bg: '#0D1117', bgCard: '#161B22', bgSide: '#0D1117',
  bgHover: 'rgba(177,186,196,0.08)', bgActive: 'rgba(24,99,224,0.14)',
  bgInput: 'rgba(177,186,196,0.06)', bgOverlay: 'rgba(0,0,0,0.6)',
  ink: '#E6EDF3', inkSoft: '#8B949E', inkMuted: '#484F58',
  border: '#21262D', borderMd: '#30363D',
  accent: '#1E6FFF', accentSoft: 'rgba(30,111,255,0.12)',
  green: '#3FB950', greenSoft: 'rgba(63,185,80,0.12)',
  red: '#F85149', redSoft: 'rgba(248,81,73,0.12)',
  amber: '#E3B341', amberSoft: 'rgba(227,179,65,0.12)',
  purple: '#BC8CFF', purpleSoft: 'rgba(188,140,255,0.12)',
  shadow: '0 8px 32px rgba(0,0,0,0.45)', shadowSm: '0 2px 8px rgba(0,0,0,0.3)',
};
const LIGHT = {
  bg: '#F6F8FA', bgCard: '#FFFFFF', bgSide: '#FFFFFF',
  bgHover: '#F3F4F6', bgActive: '#EEF2FF',
  bgInput: '#F6F8FA', bgOverlay: 'rgba(0,0,0,0.4)',
  ink: '#1F2328', inkSoft: '#636C76', inkMuted: '#9198A1',
  border: '#E8ECF0', borderMd: '#D0D7DE',
  accent: '#1863E0', accentSoft: '#EEF2FF',
  green: '#1A7F37', greenSoft: '#DAFBE1',
  red: '#CF222E', redSoft: '#FFEBE9',
  amber: '#9A6700', amberSoft: '#FFF8C5',
  purple: '#8250DF', purpleSoft: '#F6F0FF',
  shadow: '0 8px 32px rgba(0,0,0,0.08)', shadowSm: '0 2px 8px rgba(0,0,0,0.06)',
};
const ThemeCtx = createContext(DARK);
const useT = () => useContext(ThemeCtx);

/* ═══════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════ */
const Ic = {
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Filter: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Star: ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#E3B341' : 'none'} stroke="#E3B341" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  TrendingUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  CreditCard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  Stethoscope: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  Key: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 15.8V18m0-2.2l4.6-4.6M14.5 9l2.5 2.5"></path></svg>,
  History: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline></svg>,
  ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   CORE UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Card({ children, style }) {
  const T = useT();
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 24, boxShadow: T.shadowSm,
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, style }) {
  const T = useT();
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 0.9, color: T.inkMuted, marginBottom: 12, ...style
    }}>
      {children}
    </div>
  );
}

function Divider({ style }) {
  const T = useT();
  return <div style={{ height: 1, background: T.border, margin: '16px 0', ...style }} />;
}

function InfoRow({ label, value, valueColor }) {
  const T = useT();
  if (!value && value !== 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        color: T.inkMuted, textTransform: 'uppercase', marginBottom: 3
      }}>{label}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: valueColor || T.ink,
        lineHeight: 1.4
      }}>{value}</div>
    </div>
  );
}

function StatTile({ label, value, icon, color, soft }) {
  const T = useT();
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 16,
      alignItems: 'center', boxShadow: T.shadowSm
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: soft || `${color}1A`, color, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: T.inkSoft,
          marginBottom: 4
        }}>{label}</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: T.ink,
          lineHeight: 1
        }}>{value}</div>
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  const T = useT();
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 4,
      background: T.bgInput, borderRadius: 10, width: 'fit-content'
    }}>
      {tabs.map(tab => {
        const isActive = tab.value === active;
        return (
          <button key={tab.value} onClick={() => onChange(tab.value)}
            style={{
              padding: '7px 16px', borderRadius: 7, border: 'none',
              background: isActive ? T.bgCard : 'transparent',
              color: isActive ? T.ink : T.inkSoft,
              fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer',
              boxShadow: isActive ? T.shadowSm : 'none',
              transition: 'all 0.15s'
            }}>
            {tab.label}
            {tab.count != null && (
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                color: isActive ? T.accent : T.inkMuted
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const h12 = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'pm' : 'am';
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${h12}:${mm} ${ampm}`;
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const h12 = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${String(h12).padStart(2, '0')}:${mm} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
}

/* ═══════════════════════════════════════════════════════════════
   DOMAIN CONSTANTS
═══════════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  pending: { label: 'PENDIENTE', bg: 'rgba(227,179,65,0.12)', color: '#E3B341' },
  matched: { label: 'ASIGNADO', bg: 'rgba(30,111,255,0.12)', color: '#1E6FFF' },
  on_way: { label: 'EN CAMINO', bg: 'rgba(30,111,255,0.12)', color: '#1E6FFF' },
  arrived: { label: 'LLEGÓ', bg: 'rgba(188,140,255,0.12)', color: '#BC8CFF' },
  in_consultation: { label: 'EN CONSULTA', bg: 'rgba(188,140,255,0.12)', color: '#BC8CFF' },
  completed: { label: 'COMPLETADO', bg: 'rgba(63,185,80,0.12)', color: '#3FB950' },
  cancelled: { label: 'CANCELADO', bg: 'rgba(248,81,73,0.12)', color: '#F85149' },
};
const APP_STATUS_CFG = {
  approved: { label: 'APROBADO', bg: 'rgba(63,185,80,0.12)', color: '#3FB950' },
  pending: { label: 'PENDIENTE', bg: 'rgba(227,179,65,0.12)', color: '#E3B341' },
  rejected: { label: 'RECHAZADO', bg: 'rgba(248,81,73,0.12)', color: '#F85149' },
  active: { label: 'ACTIVO', bg: 'rgba(63,185,80,0.12)', color: '#3FB950' },
  inactive: { label: 'INACTIVO', bg: 'rgba(248,81,73,0.12)', color: '#F85149' },
};
const SYMPTOM_LABELS = {
  fever: 'Fiebre', headache: 'Dolor de cabeza', cough: 'Tos',
  sore_throat: 'Dolor de garganta', shortness_of_breath: 'Dificultad para respirar',
  chest_pain: 'Dolor en el pecho', abdominal_pain: 'Dolor abdominal',
  nausea: 'Náuseas', vomiting: 'Vómitos', diarrhea: 'Diarrea',
  fatigue: 'Cansancio / Fatiga', body_aches: 'Dolores corporales',
  dizziness: 'Mareos', rash: 'Sarpullido / Rash', back_pain: 'Dolor de espalda',
  joint_pain: 'Dolor articular', runny_nose: 'Secreción nasal', ear_pain: 'Dolor de oído',
  eye_pain: 'Dolor ocular', toothache: 'Dolor dental', urinary_pain: 'Dolor urinario',
  swelling: 'Inflamación', wound: 'Herida / Lesión', anxiety: 'Ansiedad',
  insomnia: 'Insomnio', loss_of_appetite: 'Pérdida de apetito',
  numbness: 'Entumecimiento', palpitations: 'Palpitaciones',
};
const URGENCY_LABELS = { now: 'Inmediata (Ahora)', today: 'Hoy', schedule: 'Programada' };
const SERVICE_LABELS = { doctor_visit: 'Visita médica domiciliaria', injectable: 'Inyectable', telemedicine: 'Teleconsulta' };
const AGE_GROUP_LABELS = { baby: 'Bebé (<1 año)', toddler: 'Infante (1-3)', child: 'Niño (4-12)', teen: 'Adolescente (13-17)', adult: 'Adulto (18-64)', senior: 'Adulto mayor (65+)' };

/* ═══════════════════════════════════════════════════════════════
   DOMAIN COMPONENTS
═══════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: (status || '').toUpperCase(), bg: 'rgba(128,128,128,0.1)', color: '#888' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 9px',
      borderRadius: 6, background: cfg.bg, color: cfg.color,
      letterSpacing: 0.5, whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </span>
  );
}

function AppStatusBadge({ status }) {
  const cfg = APP_STATUS_CFG[status] || { label: (status || '').toUpperCase(), bg: 'rgba(128,128,128,0.1)', color: '#888' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 9px',
      borderRadius: 6, background: cfg.bg, color: cfg.color,
      letterSpacing: 0.5, whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </span>
  );
}

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => <Ic.Star key={n} filled={n <= rating} />)}
      <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 700, color: '#E3B341' }}>{rating}/5</span>
    </div>
  );
}

function VitalsStrip({ report }) {
  const T = useT();
  if (!report) return null;
  const items = [
    report.temp_c != null && { label: 'Temp', val: `${report.temp_c} °C` },
    report.bp_systolic != null && { label: 'Presión', val: `${report.bp_systolic}/${report.bp_diastolic} mmHg` },
    report.hr_bpm != null && { label: 'FC', val: `${report.hr_bpm} lpm` },
    report.spo2_pct != null && { label: 'SpO2', val: `${report.spo2_pct}%` },
    report.rr_rpm != null && { label: 'FR', val: `${report.rr_rpm} rpm` },
    report.weight_kg != null && { label: 'Peso', val: `${report.weight_kg} kg` },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div>
      <SectionLabel>Signos Vitales</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: T.accentSoft, borderRadius: 8,
            padding: '8px 14px', minWidth: 80
          }}>
            <div style={{ fontSize: 10, color: T.inkMuted, marginBottom: 3 }}>{it.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{it.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EVENT HELPERS
═══════════════════════════════════════════════════════════════ */
function buildEventCfg(event, doctorName) {
  const m = event.metadata || {};
  const dr = event.actor_name || doctorName || '';
  switch (event.event_type) {
    case 'visit_requested': return { color: '#1E6FFF', text: 'Paciente solicitó la visita', badge: URGENCY_LABELS[m.urgency] || m.urgency, sub: SERVICE_LABELS[m.service_type] || null };
    case 'doctor_assigned': return { color: '#BC8CFF', text: `Sistema asignó al Dr. ${dr}`, sub: m.eta_minutes ? `ETA: ${m.eta_minutes} min` : null };
    case 'doctor_accepted': return { color: '#1E6FFF', text: `Dr. ${dr} aceptó la visita`, badge: m.eta_minutes ? `ETA ${m.eta_minutes} min` : null };
    case 'doctor_arrived': return { color: '#BC8CFF', text: `Dr. ${dr} llegó al domicilio` };
    case 'consultation_started': return { color: '#1E6FFF', text: 'Consulta médica iniciada' };
    case 'vitals_recorded': return { color: '#64B5F6', text: 'Signos vitales registrados', sub: [m.temp && `Temp ${m.temp}°C`, m.bp && `PA ${m.bp}`, m.hr && `FC ${m.hr} lpm`].filter(Boolean).join(' · ') || null };
    case 'diagnosis_recorded': return { color: '#64B5F6', text: 'Diagnóstico registrado', sub: m.diagnosis ? m.diagnosis.substring(0, 80) : null, badge: m.diagnosis_code || null };
    case 'prescription_recorded': return { color: '#3FB950', text: 'Receta médica generada', badge: m.count ? `${m.count} medicamento${m.count > 1 ? 's' : ''}` : null, sub: m.drugs?.length ? m.drugs.join(', ') : null };
    case 'visit_completed': return { color: '#3FB950', text: 'Consulta finalizada', badge: m.fee ? `S/ ${m.fee}` : null };
    case 'visit_cancelled': return { color: '#F85149', text: 'Visita cancelada', sub: m.reason || null };
    case 'doctor_rejected': return { color: '#F85149', text: `Dr. ${dr} rechazó la solicitud`, sub: m.reason || null };
    case 'payment_confirmed': return { color: '#3FB950', text: 'Pago confirmado', badge: m.amount ? `S/ ${m.amount}` : null, sub: m.method ? `Método: ${m.method}` : null };
    case 'tip_added': return { color: '#E3B341', text: 'Propina enviada', badge: m.tip ? `S/ ${m.tip}` : null };
    case 'review_submitted': return { color: '#E3B341', text: 'Paciente envió calificación', badge: m.rating ? `${m.rating} ★` : null };
    default: return { color: '#888', text: event.event_type.replace(/_/g, ' ') };
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONSULTATION DETAIL
═══════════════════════════════════════════════════════════════ */
function ConsultationDetail({ token, visitId, onBack, onViewPatient }) {
  const T = useT();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visitId) return;
    setLoading(true); setError(null);
    fetch(`/admin/consultations/${visitId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el detalle.'); setLoading(false); });
  }, [visitId]);

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80,
      color: T.inkMuted, fontSize: 14
    }}>Cargando consulta...</div>
  );
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: T.red, fontSize: 14 }}>{error}</div>
  );
  if (!detail) return null;

  const c = detail;
  const events = detail.events || [];
  const report = detail.report || null;
  const prescriptions = detail.prescriptions || [];
  const review = detail.review || null;
  const symptoms = detail.symptoms || [];
  const dur = report?.duration_minutes;
  const timeRange = (report?.consultation_started_at && report?.consultation_finished_at)
    ? `${fmtTime(report.consultation_started_at)} – ${fmtTime(report.consultation_finished_at)}` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back */}
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: `1px solid ${T.border}`, color: T.inkSoft,
        borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600,
        fontSize: 13, width: 'fit-content'
      }}>
        <Ic.ChevronLeft /> Volver a lista
      </button>

      {/* Header */}
      <Card style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionLabel>Paciente</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onViewPatient && onViewPatient(c.user_id, c.patient_name)}
                style={{
                  background: 'none', border: 'none', color: T.ink, fontSize: 20,
                  fontWeight: 800, cursor: 'pointer', padding: 0,
                  textDecoration: 'underline dotted', textDecorationColor: T.borderMd,
                  textUnderlineOffset: 4
                }}>
                {c.patient_name || 'Sin nombre'}
              </button>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 5 }}>
              {[c.patient_age && `${c.patient_age} años`, c.patient_phone].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <SectionLabel>Doctor</SectionLabel>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{c.doctor_name || 'No asignado'}</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 3 }}>
              {[c.specialty, c.cmp_license && `CMP ${c.cmp_license}`].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: 'monospace' }}>{c.id?.slice(0, 8)}…</div>
            <div style={{ fontSize: 12, color: T.inkSoft }}>{fmtDate(c.created_at)}</div>
            {c.service_type && <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 5, background: T.purpleSoft, color: T.purple
            }}>
              {SERVICE_LABELS[c.service_type] || c.service_type}
            </span>}
            {c.urgency && <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 5, background: T.amberSoft, color: T.amber
            }}>
              {URGENCY_LABELS[c.urgency] || c.urgency}
            </span>}
          </div>
        </div>
        {c.address && (
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}`,
            fontSize: 13, color: T.inkSoft
          }}>
            📍 {c.address}
          </div>
        )}
      </Card>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Patient column */}
        <Card style={{ padding: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.accent, textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Lo que reportó el paciente
          </div>
          <InfoRow label="Urgencia" value={URGENCY_LABELS[c.urgency] || c.urgency} />
          <InfoRow label="Tipo de servicio" value={SERVICE_LABELS[c.service_type] || c.service_type} />
          {symptoms.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: T.inkMuted,
                textTransform: 'uppercase', marginBottom: 8
              }}>Síntomas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {symptoms.map((s, i) => (
                  <span key={i} style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 20, background: T.accentSoft, color: T.accent
                  }}>
                    {SYMPTOM_LABELS[s] || s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ) : <InfoRow label="Síntomas" value="No registrados" />}
          <Divider />
          <SectionLabel style={{ marginTop: 12 }}>Datos del paciente</SectionLabel>
          <InfoRow label="Nombre" value={c.patient_name} />
          <InfoRow label="Edad" value={c.patient_age ? `${c.patient_age} años` : null} />
          <InfoRow label="Grupo etario" value={c.age_group ? (AGE_GROUP_LABELS[c.age_group] || c.age_group) : null} />
          {c.cancel_reason && <InfoRow label="Motivo de cancelación" value={c.cancel_reason} valueColor={T.red} />}
        </Card>

        {/* Doctor column */}
        <Card style={{ padding: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.purple, textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>
            Lo que registró el doctor
          </div>
          {(dur != null || timeRange) && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 10,
              background: T.purpleSoft, border: `1px solid ${T.purple}33`
            }}>
              <SectionLabel style={{ marginBottom: 4 }}>Duración de la consulta</SectionLabel>
              {dur != null && <div style={{ fontSize: 22, fontWeight: 800, color: T.purple }}>{dur} min</div>}
              {timeRange && <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>{timeRange}</div>}
            </div>
          )}
          {report ? <div style={{ marginBottom: 16 }}><VitalsStrip report={report} /></div>
            : <InfoRow label="Signos vitales" value="No registrados" />}
          <Divider />
          {report?.diagnosis ? (
            <div style={{ marginTop: 12, marginBottom: 14 }}>
              <SectionLabel>Diagnóstico</SectionLabel>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                {report.diagnosis}
                {report.diagnosis_code && <span style={{
                  fontSize: 12, color: T.inkMuted,
                  fontWeight: 400, marginLeft: 8
                }}>({report.diagnosis_code})</span>}
              </div>
            </div>
          ) : <InfoRow label="Diagnóstico" value="No registrado" />}
          {report?.clinical_notes && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>Notas clínicas</SectionLabel>
              <div style={{
                fontSize: 13, lineHeight: 1.65, color: T.inkSoft,
                whiteSpace: 'pre-wrap'
              }}>{report.clinical_notes}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <Card style={{ padding: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.green, textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            Receta médica — {prescriptions.length} medicamento{prescriptions.length !== 1 ? 's' : ''}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${T.border}` }}>
                  {['MEDICAMENTO', 'DOSIS', 'FRECUENCIA', 'DURACIÓN', 'INSTRUCCIONES'].map(h => (
                    <th key={h} style={{
                      padding: '8px 14px', fontSize: 10, fontWeight: 700,
                      letterSpacing: 0.5, color: T.inkMuted
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: T.ink }}>{rx.drug_name || rx.medication || rx.name || '—'}</td>
                    <td style={{ padding: '12px 14px', color: T.inkSoft }}>{rx.dose || rx.dosage || '—'}</td>
                    <td style={{ padding: '12px 14px', color: T.inkSoft }}>{rx.frequency || '—'}</td>
                    <td style={{ padding: '12px 14px', color: T.inkSoft }}>{rx.duration_days ? `${rx.duration_days} días` : (rx.duration || '—')}</td>
                    <td style={{ padding: '12px 14px', color: T.inkMuted, fontSize: 12 }}>{rx.instructions || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment + Review */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.green, textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Ic.CreditCard /> Pago
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'MONTO', val: c.amount != null ? `S/ ${Number(c.amount).toFixed(2)}` : '—', color: T.green },
              { label: 'PROPINA', val: c.tip != null ? `S/ ${Number(c.tip).toFixed(2)}` : '—', color: T.amber },
              { label: 'MÉTODO', val: c.payment_method ? c.payment_method.toUpperCase() : '—' },
              {
                label: 'ESTADO', val: c.payment_status ? c.payment_status.toUpperCase() : '—',
                color: c.payment_status === 'confirmed' ? T.green : c.payment_status === 'failed' ? T.red : T.amber
              },
            ].map((it, i) => (
              <div key={i} style={{ background: T.bgInput, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{
                  fontSize: 10, color: T.inkMuted, letterSpacing: 0.5,
                  marginBottom: 4
                }}>{it.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: it.color || T.ink }}>{it.val}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.amber, textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Ic.Star filled /> Calificación
          </div>
          {(review || c.rating) ? (
            <>
              <div style={{ marginBottom: 10 }}><StarRating rating={review?.rating || c.rating} /></div>
              {(review?.comment || c.review_comment) && (
                <div style={{
                  fontSize: 13, color: T.inkSoft, fontStyle: 'italic', lineHeight: 1.6,
                  borderLeft: `3px solid ${T.amberSoft}`, paddingLeft: 12
                }}>
                  "{review?.comment || c.review_comment}"
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: T.inkMuted, fontStyle: 'italic' }}>
              El paciente aún no ha calificado esta consulta.
            </div>
          )}
        </Card>
      </div>

      {/* Full timeline */}
      <Card style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Ic.Clock />
          <span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Historial completo</span>
          <span style={{ fontSize: 11, color: T.inkMuted }}>{events.length} eventos</span>
        </div>
        {events.length === 0 ? (
          <div style={{ fontSize: 13, color: T.inkMuted, fontStyle: 'italic' }}>
            No hay eventos registrados.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
              background: T.border, borderRadius: 2
            }} />
            {events.map((ev, i) => {
              const cfg = buildEventCfg(ev, c.doctor_name);
              const isLast = i === events.length - 1;
              return (
                <div key={i} style={{
                  display: 'flex', gap: 20,
                  paddingBottom: isLast ? 0 : 20, position: 'relative'
                }}>
                  <div style={{
                    flexShrink: 0, zIndex: 1, width: 40, height: 40, borderRadius: '50%',
                    background: `${cfg.color}18`, border: `2px solid ${cfg.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: cfg.color
                    }} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{cfg.text}</span>
                      {cfg.badge && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px',
                          borderRadius: 4, background: `${cfg.color}18`, color: cfg.color
                        }}>
                          {cfg.badge}
                        </span>
                      )}
                    </div>
                    {cfg.sub && <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{cfg.sub}</div>}
                    <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 4 }}>
                      {fmtDate(ev.created_at)}
                      {ev.actor_name && <span style={{ marginLeft: 6 }}>
                        · {ev.actor_type === 'system' ? 'Sistema' : ev.actor_name}
                      </span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSULTATION STATS BAR
═══════════════════════════════════════════════════════════════ */
function ConsultationStatsBar({ token, dateFrom, dateTo, userId }) {
  const T = useT();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let url = '/admin/consultations/stats';
    const p = [];
    if (dateFrom) p.push(`date_from=${dateFrom}`);
    if (dateTo) p.push(`date_to=${dateTo}`);
    if (userId) p.push(`user_id=${userId}`);
    if (p.length) url += '?' + p.join('&');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); }).catch(() => { });
  }, [token, dateFrom, dateTo, userId]);

  const tiles = stats ? [
    { label: 'Total', value: stats.total, color: '#8B949E', soft: T.bgInput },
    { label: 'Activas', value: stats.active, color: T.accent, soft: T.accentSoft },
    { label: 'Completadas', value: stats.completed, color: T.green, soft: T.greenSoft },
    { label: 'Canceladas', value: stats.cancelled, color: T.red, soft: T.redSoft },
    { label: 'Ingresos', value: `S/ ${Number(stats.revenue || 0).toFixed(2)}`, color: T.amber, soft: T.amberSoft },
  ] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.inkSoft }}>
          Resumen · <span style={{ color: T.accent, fontWeight: 700 }}>{stats?.period || 'Hoy'}</span>
        </div>
        {!stats && <div style={{ fontSize: 11, color: T.inkMuted }}>Cargando estadísticas…</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {(tiles || [0, 1, 2, 3, 4]).map((t, i) => (
          <div key={i} style={{
            background: t.soft || T.bgInput,
            border: `1px solid ${t.color || T.border}22`, borderRadius: 12,
            padding: '16px 20px'
          }}>
            {t.label ? (
              <>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
                  textTransform: 'uppercase', color: T.inkMuted, marginBottom: 6
                }}>{t.label}</div>
                <div style={{
                  fontSize: t.label === 'Ingresos' ? 18 : 28, fontWeight: 800,
                  color: t.color, lineHeight: 1
                }}>{t.value}</div>
              </>
            ) : (
              <div style={{
                height: 60, borderRadius: 6,
                background: T.bgInput, opacity: 0.5
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSULTATIONS VIEW
═══════════════════════════════════════════════════════════════ */
function ConsultationsView({ token, initialPatient, initialId }) {
  const T = useT();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [patientFilter, setPatientFilter] = useState(initialPatient || null);
  const LIMIT = 50;

  const load = useCallback(async (reset = false) => {
    setLoading(true); setError(null);
    const cur = reset ? 0 : offset;
    try {
      let url = `/admin/consultations?limit=${LIMIT}&offset=${cur}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterDateFrom) url += `&date_from=${filterDateFrom}`;
      if (filterDateTo) url += `&date_to=${filterDateTo}`;
      if (patientFilter?.userId) url += `&user_id=${patientFilter.userId}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.rows || []);
      if (reset) { setRows(list); setOffset(list.length); }
      else { setRows(prev => [...prev, ...list]); setOffset(cur + list.length); }
      setHasMore(list.length === LIMIT);
    } catch { setError('No se pudo cargar el historial.'); }
    finally { setLoading(false); }
  }, [filterStatus, filterDateFrom, filterDateTo, patientFilter, token, offset]);

  useEffect(() => { setOffset(0); setRows([]); load(true); },
    [filterStatus, filterDateFrom, filterDateTo, patientFilter, token]);

  useEffect(() => {
    if (initialId) setSelectedId(initialId);
  }, [initialId]);

  if (selectedId) return (
    <ConsultationDetail token={token} visitId={selectedId}
      onBack={() => setSelectedId(null)}
      onViewPatient={(uid, name) => { setSelectedId(null); setPatientFilter({ userId: uid, name }); }} />
  );

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;
  const inputStyle = {
    background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: '10px 14px', color: T.ink, fontSize: 13, outline: 'none', width: '100%'
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: T.inkMuted, letterSpacing: 0.5,
    textTransform: 'uppercase', marginBottom: 5, display: 'block'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ConsultationStatsBar token={token} dateFrom={filterDateFrom}
        dateTo={filterDateTo} userId={patientFilter?.userId} />

      {patientFilter && (
        <div style={{
          background: T.accentSoft, border: `1px solid ${T.accent}33`,
          borderRadius: 10, padding: '10px 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
            Historial de: <strong>{patientFilter.name}</strong>
          </div>
          <button onClick={() => setPatientFilter(null)} style={{
            background: 'none',
            border: `1px solid ${T.border}`, color: T.inkSoft, borderRadius: 7,
            padding: '4px 10px', cursor: 'pointer', fontSize: 12, display: 'flex',
            alignItems: 'center', gap: 5
          }}>
            <Ic.X /> Limpiar
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
        <div>
          <span style={labelStyle}>Estado</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="matched">Asignado</option>
            <option value="on_way">En camino</option>
            <option value="arrived">Llegó</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div>
          <span style={labelStyle}>Desde</span>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <span style={labelStyle}>Hasta</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={inputStyle} />
        </div>
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }}
              style={{
                ...inputStyle, width: 'auto', background: T.redSoft, border: `1px solid ${T.red}33`,
                color: T.red, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
            {patientFilter ? `Historial · ${patientFilter.name}` : 'Historial de Consultas'}
          </div>
        </div>
        {error && <div style={{ padding: 20, color: T.red, fontSize: 13 }}>{error}</div>}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['FECHA', 'PACIENTE', 'DOCTOR', 'ESTADO', 'DURACIÓN', 'MONTO', 'RATING', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 10,
                    fontWeight: 700, letterSpacing: 0.5, color: T.inkMuted
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr><td colSpan={8} style={{
                  padding: 40, textAlign: 'center',
                  color: T.inkMuted, fontSize: 13
                }}>
                  No hay consultas con los filtros seleccionados.
                </td></tr>
              )}
              {rows.map(c => (
                <HoverRow key={c.id} onClick={() => setSelectedId(c.id)}
                  style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
                  <td style={{
                    padding: '14px 16px', fontSize: 12, color: T.inkSoft,
                    whiteSpace: 'nowrap'
                  }}>{fmtDateShort(c.created_at)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      fontWeight: 700, color: T.ink,
                      cursor: 'pointer', textDecoration: 'underline dotted',
                      textDecorationColor: T.borderMd
                    }}
                      onClick={e => { e.stopPropagation(); setPatientFilter({ userId: c.user_id, name: c.patient_name }); }}>
                      {c.patient_name || '—'}
                    </div>
                    {c.patient_age && <div style={{ fontSize: 11, color: T.inkMuted }}>{c.patient_age} años</div>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: T.ink }}>{c.doctor_name || 'Sin asignar'}</div>
                    {c.specialty && <div style={{ fontSize: 11, color: T.inkMuted }}>{c.specialty}</div>}
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.inkSoft }}>
                    {c.duration_minutes ? `${c.duration_minutes} min` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: T.green }}>
                    {c.amount != null ? `S/ ${Number(c.amount).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.rating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Ic.Star filled />
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>{c.rating}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: T.inkMuted }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={e => { e.stopPropagation(); setSelectedId(c.id); }}
                      style={{
                        background: T.accentSoft, border: `1px solid ${T.accent}33`,
                        color: T.accent, borderRadius: 7, padding: '5px 12px',
                        fontSize: 12, cursor: 'pointer', fontWeight: 700
                      }}>
                      Detalle
                    </button>
                  </td>
                </HoverRow>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div style={{
          textAlign: 'center', padding: 28, color: T.inkMuted,
          fontSize: 13
        }}>Cargando...</div>}
        {!loading && hasMore && (
          <div style={{ textAlign: 'center', padding: 16, borderTop: `1px solid ${T.border}` }}>
            <button onClick={() => load(false)} style={{
              background: T.accentSoft,
              border: `1px solid ${T.accent}33`, color: T.accent, borderRadius: 8,
              padding: '9px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 13
            }}>
              Cargar más
            </button>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div style={{
            padding: '8px 24px', textAlign: 'right', fontSize: 11,
            color: T.inkMuted, borderTop: `1px solid ${T.border}`
          }}>
            {rows.length} consulta(s)
          </div>
        )}
      </Card>
    </div>
  );
}

/* row with hover background */
function HoverRow({ children, onClick, style }) {
  const T = useT();
  const [hov, setHov] = useState(false);
  return (
    <tr style={{ ...style, background: hov ? T.bgHover : 'transparent', transition: 'background 0.12s' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}>
      {children}
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCTORS VIEW
═══════════════════════════════════════════════════════════════ */
function DoctorsView({ token, setView }) {
  const T = useT();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin/doctors', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDocs(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const counts = docs.reduce((a, x) => ({ ...a, [x.is_active ? 'active' : 'inactive']: (a[x.is_active ? 'active' : 'inactive'] || 0) + 1 }), {});

  const filtered = docs.filter(d => {
    if (tab === 'active' && !d.is_active) return false;
    if (tab === 'inactive' && d.is_active) return false;
    if (search) {
      const q = search.toLowerCase();
      return (d.name || '').toLowerCase().includes(q) || (d.cmp_license || '').toLowerCase().includes(q) || (d.specialty || '').toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = [
    { value: 'all', label: 'Todos', count: docs.length },
    { value: 'active', label: 'Activos', count: counts.active || 0 },
    { value: 'inactive', label: 'Desactivados', count: counts.inactive || 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
        <StatTile label="Médicos en Red" value={docs.length} color={T.accent} soft={T.accentSoft} icon={<Ic.Users />} />
        <StatTile label="Cuentas Activas" value={counts.active || 0} color={T.green} soft={T.greenSoft} icon={<Ic.Check />} />
        <StatTile label="Suspendidos" value={counts.inactive || 0} color={T.red} soft={T.redSoft} icon={<Ic.AlertCircle />} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
        <input placeholder="Buscar por nombre, especialidad o CMP…" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgInput, color: T.ink, fontSize: 13, outline: 'none', width: 300 }} />
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bgInput + '22' }}>
              {['MÉDICO / STAFF', 'ESPECIALIDAD', 'DNI / CMP', 'REGISTRO', 'ESTADO', ''].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando staff médico...</td></tr> : null}
            {!loading && filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>No se encontraron médicos registrados.</td></tr> : null}
            {filtered.map(d => (
              <HoverRow key={d.id} onClick={() => setView('doctors', d.id)} style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{d.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: T.ink }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: T.inkSoft }}>{d.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: T.inkSoft }}>{d.specialty}</td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{d.cmp_license}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>DNI: {d.dni_number || '—'}</div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 12, color: T.inkMuted }}>{fmtDateShort(d.created_at)}</td>
                <td style={{ padding: '16px 20px' }}><AppStatusBadge status={d.is_active ? 'active' : 'inactive'} /></td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button style={{ background: T.accentSoft, border: 'none', color: T.accent, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Ver Perfil 360</button>
                </td>
              </HoverRow>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function DoctorDetailView({ doctorId, token, admin, setView }) {
  const T = useT();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deactReason, setDeactReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/doctors/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDoc(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [doctorId]);

  const handleDeactivate = async () => {
    if (!deactReason.trim()) return alert('Escribe el motivo de la desactivación.');
    setConfirming(false);
    setLoading(true);
    const res = await fetch(`/admin/doctors/${doctorId}/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: deactReason })
    });
    if (res.ok) load();
    else setLoading(false);
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: T.inkSoft }}>Cargando perfil del médico...</div>;
  if (!doc) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <h2 style={{ color: T.red }}>Médico no encontrado</h2>
      <button onClick={() => setView('doctors')} style={{ background: T.accent, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Volver al listado</button>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 24, background: `linear-gradient(to right, ${T.bgCard}, ${T.bgInput}77)` }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
          {doc.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.ink }}>{doc.name}</h2>
            <AppStatusBadge status={doc.is_active ? 'active' : 'inactive'} />
          </div>
          <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 6 }}>{doc.specialty} • CMP {doc.cmp_license} • Miembro desde {fmtDateShort(doc.created_at)}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setView('doctors')} style={{ background: T.bgCard, border: `1px solid ${T.border}`, padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: T.ink }}>Volver al listado</button>
          {doc.is_active && (
            <button onClick={() => setConfirming(true)} style={{ background: T.redSoft, color: T.red, border: `1px solid ${T.red}33`, padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Desactivar Cuenta</button>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Step 1: Personal */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>1. DATOS PERSONALES</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
              <div>
                <InfoRow label="Email de contacto" value={doc.email} />
                <InfoRow label="Teléfono (WhatsApp)" value={doc.phone} />
              </div>
              <div>
                <InfoRow label="DNI / Identificación" value={doc.dni_number || '—'} />
                <InfoRow label="Fecha de Nacimiento" value={doc.birth_date || '—'} />
              </div>
            </div>
          </Card>

          {/* Step 2: Professional */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>2. INFORMACIÓN PROFESIONAL</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
              <div>
                <InfoRow label="Número de CMP" value={doc.cmp_license} />
                <InfoRow label="Especialidad Principal" value={doc.specialty} />
                <InfoRow label="Sub-especialidad" value={doc.sub_specialty || 'Ninguna'} />
              </div>
              <div>
                <InfoRow label="Años de Experiencia" value={`${doc.experience_years} años`} />
                <InfoRow label="Universidad" value={doc.university || 'No especificada'} />
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>Biografía y Perfil</SectionLabel>
            <div style={{ marginTop: 16, fontSize: 14, color: T.ink, lineHeight: 1.6, background: T.bgInput, padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
              {doc.bio || 'Sin biografía registrada.'}
            </div>
          </Card>

          {/* Documents */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>Expediente Digital Permanente</SectionLabel>
            <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 16 }}>Estos archivos están protegidos en la bóveda de médicos acreditados.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {doc.documents && Object.entries(doc.documents).map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" style={{
                  textDecoration: 'none', background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.FileText /></div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 10, color: T.inkSoft }}>Ver archivo ↗</div>
                </a>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sidebar Info */}
          <Card style={{ padding: 24 }}>
            <SectionLabel>Preferencias de Trabajo</SectionLabel>
            <div style={{ marginTop: 12 }}>
              <SectionLabel style={{ fontSize: 10, color: T.inkSoft, marginBottom: 8 }}>Zonas de Cobertura</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {(doc.districts || []).map(d => (
                  <span key={d} style={{ background: T.accentSoft, color: T.accent, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{d}</span>
                ))}
                {(!doc.districts || doc.districts.length === 0) && <span style={{ color: T.inkMuted, fontSize: 12 }}>Sin zonas asignadas</span>}
              </div>
              <InfoRow label="Movilidad Propia" value={doc.mobility_type === 'car' ? 'Auto propio' : doc.mobility_type === 'moto' ? 'Moto' : doc.mobility_type === 'none' ? 'Taxi / App' : 'No especificada'} />

              <SectionLabel style={{ fontSize: 10, color: T.inkSoft, marginTop: 20, marginBottom: 8 }}>Horarios Activos</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(doc.work_slots || []).map(s => (
                  <span key={s} style={{ background: T.greenSoft, color: T.green, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s === 'morning' ? 'Mañanas' : s === 'afternoon' ? 'Tardes' : s === 'evening' ? 'Noches' : 'Madrugadas'}</span>
                ))}
              </div>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <SectionLabel>Método de Pago</SectionLabel>
            <div style={{ background: T.bgInput, padding: 20, borderRadius: 12, border: `1px solid ${T.border}`, marginTop: 12 }}>
              {doc.payment_method === 'yape' ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#742284' }}>Yape (BCP)</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>+51 {doc.payment_data?.yapePhone || '—'}</div>
                </div>
              ) : doc.payment_method === 'cci' ? (
                <div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>{doc.payment_data?.bank}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{doc.payment_data?.cci}</div>
                </div>
              ) : <div style={{ fontSize: 12, color: T.inkMuted }}>No cargado</div>}
            </div>
          </Card>
        </div>
      </div>

      {/* Deactivation Modal */}
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 450, padding: 32, boxShadow: T.shadow }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.redSoft, color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>
              <Ic.AlertCircle />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 20, textAlign: 'center' }}>¿Desactivar a Dr. {doc.name}?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: T.inkSoft, lineHeight: 1.5, textAlign: 'center' }}>
              El médico dejará de tener acceso a Doctor House Pro y no recibirá solicitudes. <b>Es obligatorio indicar el motivo para notificarle vía email.</b>
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Motivo de Desactivación</label>
              <textarea
                autoFocus
                placeholder="Ej: Incumplimiento recurrente de horarios, quejas graves de pacientes, etc..."
                style={{
                  width: '100%', padding: 14, borderRadius: 12, background: T.bgInput,
                  border: `1px solid ${T.red}33`, color: T.ink, outline: 'none',
                  minHeight: 120, fontSize: 13, fontFamily: 'inherit', resize: 'none'
                }}
                value={deactReason}
                onChange={e => setDeactReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setConfirming(false)} style={{ padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgInput, fontWeight: 700, cursor: 'pointer', color: T.inkSoft }}>Cancelar</button>
              <button onClick={handleDeactivate} style={{ padding: 14, borderRadius: 12, border: 'none', background: T.red, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Sí, Desactivar Médico</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW VIEW
═══════════════════════════════════════════════════════════════ */
function OverviewView({ token }) {
  const T = useT();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando...</div>;

  const maxVisits = Math.max(...(stats?.growth || []).map(g => parseInt(g.visits) || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
        <StatTile label="Cobro total" value={`S/ ${(stats?.finance?.total_billed || 0).toFixed(2)}`}
          color={T.green} soft={T.greenSoft} icon={<Ic.TrendingUp />} />
        <StatTile label="Comisiones" value={`S/ ${(stats?.finance?.commissions || 0).toFixed(2)}`}
          color={T.accent} soft={T.accentSoft} icon={<Ic.CreditCard />} />
        <StatTile label="Ganancia neta" value={`S/ ${(stats?.finance?.profit || 0).toFixed(2)}`}
          color={T.purple} soft={T.purpleSoft} icon={<Ic.TrendingUp />} />
        <StatTile label="Visitas (7 días)" value={stats?.growth?.reduce((a, b) => a + parseInt(b.visits || 0), 0) || 0}
          color={T.amber} soft={T.amberSoft} icon={<Ic.Activity />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 20 }}>Actividad (últimos 7 días)</div>
          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            {(stats?.growth || []).map((g, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end'
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 2 }}>
                  {parseInt(g.visits || 0) || ''}
                </div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: `linear-gradient(to top, ${T.accent}, ${T.accent}88)`,
                  height: `${(parseInt(g.visits) || 0) / maxVisits * 100}%`,
                  minHeight: 4, transition: 'height 0.3s'
                }} />
                <div style={{ fontSize: 10, color: T.inkMuted }}>{g.date}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 20 }}>Candidatos hoy</div>
          {[
            { label: 'Nuevos', value: stats?.daily?.new_today || 0, color: T.accent, soft: T.accentSoft },
            { label: 'Aprobados', value: stats?.daily?.approved_today || 0, color: T.green, soft: T.greenSoft },
            { label: 'Rechazados', value: stats?.daily?.rejected_today || 0, color: T.red, soft: T.redSoft },
          ].map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 10, background: it.soft, marginBottom: 10
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{it.label}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: it.color }}>{it.value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Applications summary */}
      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 16 }}>Solicitudes</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Pendientes', value: stats?.applications?.pending || 0, color: T.amber, soft: T.amberSoft },
            { label: 'Aprobadas', value: stats?.applications?.approved || 0, color: T.green, soft: T.greenSoft },
            { label: 'Rechazadas', value: stats?.applications?.rejected || 0, color: T.red, soft: T.redSoft },
          ].map((it, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '20px 16px',
              borderRadius: 10, background: it.soft
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: it.color }}>{it.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, marginTop: 4 }}>{it.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APPLICATIONS VIEW
═══════════════════════════════════════════════════════════════ */
function ApplicationsView({ token, admin, setView }) {
  const T = useT();
  const [apps, setApps] = useState([]);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const url = `/admin/applications${filterDate ? `?dateFrom=${filterDate}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setApps(d.rows || d);
        if (d.daily) setDaily(d.daily);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterDate, token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Daily metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Nuevos hoy', value: daily?.new_today || 0, color: T.accent, soft: T.accentSoft },
          { label: 'Aprobados hoy', value: daily?.approved_today || 0, color: T.green, soft: T.greenSoft },
          { label: 'Rechazados hoy', value: daily?.rejected_today || 0, color: T.red, soft: T.redSoft },
        ].map((it, i) => (
          <div key={i} style={{ background: it.soft, borderRadius: 12, padding: '16px 20px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: T.inkSoft,
              textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6
            }}>{it.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: it.color }}>{it.value}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
          <div style={{ width: '100%' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: T.inkMuted,
              letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5,
              display: 'block'
            }}>Filtrar por fecha</span>
            <input type="date" value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{
                width: '100%', padding: '9px 14px', borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.bgInput,
                color: T.ink, fontSize: 13, outline: 'none'
              }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>Solicitudes de candidatos</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['MÉDICO / ESPECIALIDAD', 'REGISTRO', 'ESTADO', ''].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 10,
                      fontWeight: 700, letterSpacing: 0.5, color: T.inkMuted
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} style={{
                  padding: 40, textAlign: 'center',
                  color: T.inkMuted
                }}>Cargando...</td></tr>}
                {apps.map(a => (
                  <HoverRow key={a.id}
                    style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                    onClick={() => setView('apps/' + a.id)}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: T.ink }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{a.specialty}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: T.inkMuted }}>
                      {fmtDateShort(a.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}><AppStatusBadge status={a.status} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={e => { e.stopPropagation(); setView('apps/' + a.id); }}
                        style={{
                          background: T.accentSoft, border: `1px solid ${T.accent}33`,
                          color: T.accent, borderRadius: 7, padding: '5px 12px',
                          fontSize: 12, cursor: 'pointer', fontWeight: 700
                        }}>
                        Revisar
                      </button>
                    </td>
                  </HoverRow>
                ))}
                {!loading && apps.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>No hay solicitudes para mostrar.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE VIEW
═══════════════════════════════════════════════════════════════ */
function ProfileView({ token, admin, onRefresh }) {
  const T = useT();
  const [name, setName] = useState(admin.name || '');
  const [pass, setPass] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (pass && pass !== passConfirm) return alert('Las contraseñas no coinciden');
    setLoading(true);
    try {
      const res = await fetch('/admin/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, password: pass || undefined })
      });
      if (res.ok) {
        alert('Perfil actualizado correctamente. Los cambios se aplicarán al recargar.');
        onRefresh();
      } else alert('Error al actualizar');
    } catch (e) { alert('Error de red'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, animation: 'fadeIn 0.3s ease' }}>
      <Card style={{ padding: 40 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, marginBottom: 8 }}>Configuración de Perfil</div>
        <div style={{ color: T.inkSoft, marginBottom: 32, fontSize: 14 }}>Personaliza tu información de acceso.</div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: T.inkMuted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nombre Completo</label>
              <input required style={{ width: '100%', padding: 14, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: T.inkMuted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Usuario (Login)</label>
              <input style={{ width: '100%', padding: 14, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, opacity: 0.5, cursor: 'not-allowed' }} value={admin.username} disabled />
            </div>
          </div>

          <Divider />

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: T.inkMuted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nueva Contraseña</label>
            <input type="password" placeholder="Solo si deseas cambiarla" style={{ width: '100%', padding: 14, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={pass} onChange={e => setPass(e.target.value)} />
          </div>

          {pass && (
            <div style={{ animation: 'slideDown 0.2s ease' }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: T.inkMuted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Confirmar Contraseña</label>
              <input type="password" required style={{ width: '100%', padding: 14, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={passConfirm} onChange={e => setPassConfirm(e.target.value)} />
            </div>
          )}

          <button disabled={loading} style={{
            background: T.accent, color: '#fff', border: 'none', padding: 18,
            borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: 10,
            transition: 'opacity 0.2s', boxShadow: `0 4px 12px ${T.accent}44`
          }}>
            {loading ? 'Actualizando...' : 'Guardar Cambios del Perfil'}
          </button>
        </form>
      </Card>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   USER DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function UserDetailView({ userId, token, setView }) {
  const T = useT();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetForm, setResetForm] = useState({ newPassword: '', adminPassword: '' });

  const load = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`/admin/users/${userId}`, { headers }).then(r => r.json()),
      fetch(`/admin/users/${userId}/logs`, { headers }).then(r => r.json())
    ]).then(([u, l]) => {
      setUser(u);
      setLogs(l);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [userId, token]);

  const toggleStatus = async () => {
    if (!confirm(`¿Deseas ${user.is_active ? 'DESHABILITAR' : 'HABILITAR'} este acceso?`)) return;
    const res = await fetch(`/admin/users/${userId}/toggle`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setUser({ ...user, is_active: data.is_active });
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const res = await fetch(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(resetForm)
    });
    if (res.ok) {
      alert('Contraseña actualizada correctamente.');
      setResetting(false);
      setResetForm({ newPassword: '', adminPassword: '' });
    } else {
      const err = await res.json();
      alert(err.error || 'Error al resetear');
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: T.inkSoft }}>Cargando ficha de usuario...</div>;
  if (!user || user.error) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 24, color: T.red, marginBottom: 16 }}>Usuario no encontrado</div>
      <button onClick={() => setView('management')} style={{ background: T.accent, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Volver a Usuarios</button>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <Card style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 24, background: `linear-gradient(to right, ${T.bgCard}, ${T.bgInput}77)` }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0, boxShadow: `0 8px 16px ${T.accent}33` }}>
          {user.name?.[0] || user.username?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.ink }}>{user.name || user.username}</h2>
            <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 6, background: user.is_root ? T.purpleSoft : T.bgActive, color: user.is_root ? T.purple : T.accent, letterSpacing: 0.5 }}>
              {user.is_root ? 'PROPIETARIO' : user.role.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>@{user.username}</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>Miembro desde {fmtDateShort(user.created_at)}</span>
          </div>
        </div>
        <button onClick={() => setView('management')} style={{ background: T.bgCard, border: `1px solid ${T.border}`, padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: T.ink, boxShadow: T.shadowSm }}>Volver</button>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card style={{ padding: 24 }}>
            <SectionLabel>Estado del Acceso</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, background: user.is_active ? T.greenSoft : T.redSoft, padding: '10px 14px', borderRadius: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: user.is_active ? T.green : T.red }} />
              <span style={{ fontWeight: 800, fontSize: 13, color: user.is_active ? T.green : T.red }}>{user.is_active ? 'CUENTA ACTIVA' : 'CUENTA BLOQUEADA'}</span>
            </div>
            <Divider />
            <InfoRow label="Último Login" value={user.last_login ? fmtDate(user.last_login) : 'Nunca ha ingresado'} />
            <InfoRow label="ID Interno" value={user.id} />
          </Card>

          <Card style={{ padding: 24 }}>
            <SectionLabel>Acciones de Cuenta</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!user.is_root && (
                <button onClick={toggleStatus} style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: user.is_active ? T.redSoft : T.greenSoft,
                  color: user.is_active ? T.red : T.green,
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  {user.is_active ? <Ic.EyeOff /> : <Ic.Eye />}
                  {user.is_active ? 'Quitar Acceso' : 'Activar Acceso'}
                </button>
              )}
              {!user.is_root && (
                <button onClick={() => setResetting(true)} style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: T.amberSoft, color: T.amber,
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  <Ic.Key /> Resetear Contraseña
                </button>
              )}
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <SectionLabel>Permisos y Módulos</SectionLabel>
            {user.role === 'admin' ? (
              <div style={{ background: T.accentSoft, color: T.accent, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                Privilegios de Administrador Maestro
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(user.permissions || []).map(p => (
                  <span key={p} style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', background: T.bgInput, borderRadius: 8, color: T.inkSoft }}>
                    {p.toUpperCase()}
                  </span>
                ))}
                {(!user.permissions || user.permissions.length === 0) && <div style={{ color: T.red, fontWeight: 700 }}>Sin permisos asignados</div>}
              </div>
            )}
          </Card>
        </div>

        {/* Right: History */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, background: T.bgInput + '22' }}>
            <SectionLabel style={{ marginBottom: 0 }}>Historial de Actividad (Últimas 100)</SectionLabel>
          </div>
          <div style={{ maxHeight: 700, overflowY: 'auto' }}>
            {logs.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Este usuario aún no ha realizado acciones en el sistema.</div>}
            {logs.map(l => {
              const targetMap = {
                'doctor_application': 'apps',
                'consultation': 'consultations',
                'doctor': 'doctors',
                'admin': 'management'
              };
              const targetView = targetMap[l.target_type];

              return (
                <div key={l.id} style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: T.inkMuted, fontWeight: 600 }}>{fmtDate(l.created_at)}</div>
                    <span style={{ fontSize: 9, fontWeight: 900, background: T.bgInput, padding: '3px 8px', borderRadius: 4, color: T.inkSoft, letterSpacing: 0.5 }}>{l.action.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {l.target_type}: <span style={{ opacity: 0.6, fontWeight: 400 }}>{l.target_id.slice(0, 12)}</span>
                    </div>
                    {targetView && (
                      <button
                        onClick={() => setView(targetView)}
                        style={{ background: 'none', border: 'none', color: T.accent, fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        VER <Ic.ExternalLink />
                      </button>
                    )}
                  </div>
                  {l.details && (
                    <div style={{ fontSize: 11, background: T.bgInput + '44', padding: '10px 14px', borderRadius: 8, color: T.inkSoft, fontFamily: 'monospace', overflowX: 'auto' }}>
                      {typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Reset Password Modal */}
      {resetting && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 400, padding: 32, boxShadow: T.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Seguridad: Resetclave</h3>
              <button onClick={() => setResetting(false)} style={{ background: 'none', border: 'none', color: T.inkMuted, cursor: 'pointer' }}><Ic.X /></button>
            </div>
            <p style={{ fontSize: 13, color: T.inkSoft, marginBottom: 20 }}>
              Estás a punto de cambiar la clave de <b>{user.name}</b>.
            </p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Nueva clave del usuario</label>
                <input required type="password" style={{ width: '100%', padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} />
              </div>
              <div style={{ background: T.amberSoft, padding: 16, borderRadius: 10, border: `1px solid ${T.amber}33` }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>TU clave (Para autorizar)</label>
                <input required type="password" style={{ width: '100%', padding: 10, borderRadius: 8, background: T.bgCard, border: `1px solid ${T.amber}33`, color: T.ink, outline: 'none' }} value={resetForm.adminPassword} onChange={e => setResetForm({ ...resetForm, adminPassword: e.target.value })} />
              </div>
              <button type="submit" style={{ background: T.accent, color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>Firmar y Resetear</button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APPLICATION DETAIL VIEW
═══════════════════════════════════════════════════════════════ */
function ApplicationDetailView({ appId, token, admin, setView }) {
  const T = useT();
  const [app, setApp] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState({});
  const [confirming, setConfirming] = useState(null); // 'approve' | 'reject' | null
  const [rejectReason, setRejectReason] = useState('');

  const requiredSteps = [
    { id: '1_personal', label: '1. Datos Personales' },
    { id: '2_profesional', label: '2. Info Profesional' },
    { id: '3_docs', label: '3. Documentos Digitales' },
    { id: '4_work', label: '4. Preferencias de Trabajo' },
    { id: '5_payment', label: '5. Método de Pago' },
    { id: '6_review', label: '6. Revisión Final' }
  ];
  const allChecked = requiredSteps.every(s => history.some(h => h.action === 'step_' + s.id));

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [a, h] = await Promise.all([
        fetch(`/admin/applications/${appId}`, { headers }).then(r => r.json()),
        fetch(`/admin/applications/${appId}/history`, { headers }).then(r => r.json())
      ]);
      setApp(a);
      setHistory(h);
    } catch { } finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const ping = () => fetch(`/admin/applications/${appId}/ping`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const loadViewers = () => fetch(`/admin/applications/${appId}/viewers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setViewers);

    ping(); loadViewers();
    const i1 = setInterval(ping, 10000);
    const i2 = setInterval(loadViewers, 10000);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, [appId]);

  const logStep = async (step) => {
    setLogging(v => ({ ...v, [step]: true }));
    try {
      await fetch(`/admin/applications/${appId}/log-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ step })
      });
      loadData(true);
    } catch { }
    setLogging(v => ({ ...v, [step]: false }));
  };

  const executeAction = async () => {
    const action = confirming;
    if (!action) return;
    if (action === 'reject' && !rejectReason.trim()) return alert('Escribe el motivo del rechazo.');

    setConfirming(null);
    setLoading(true);
    const res = await fetch(`/admin/applications/${appId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: rejectReason })
    });
    if (res.ok) setView('apps');
    else setLoading(false);
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: T.inkSoft }}>Cargando expediente del candidato...</div>;
  if (!app || app.error) return <div style={{ padding: 60, textAlign: 'center' }}><h2 style={{ color: T.red }}>Error 404</h2><button onClick={() => setView('apps')}>Volver</button></div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Real-time Viewers Bar */}
      {viewers.length > 0 && (
        <div style={{ background: T.amberSoft, padding: '10px 20px', borderRadius: 12, border: `1px solid ${T.amber}33`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.amber, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.amber }}>
            EN VIVO: {viewers.map(v => v.name === admin.name ? 'Tú' : v.name).join(', ')} está{viewers.length > 1 ? 'n' : ''} revisando esta solicitud.
          </span>
        </div>
      )}

      {/* Header */}
      <Card style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 24, background: `linear-gradient(to right, ${T.bgCard}, ${T.bgInput}77)` }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
          {app.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.ink }}>{app.name}</h2>
            <AppStatusBadge status={app.status} />
          </div>
          <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 6 }}>{app.specialty} • Solicitado el {fmtDate(app.created_at)}</div>
        </div>
        <button onClick={() => setView('apps')} style={{ background: T.bgCard, border: `1px solid ${T.border}`, padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: T.ink }}>Volver</button>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Step 1: Personal */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>1. DATOS PERSONALES</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
              <div>
                <InfoRow label="Nombres y Apellidos" value={app.name} />
                <InfoRow label="DNI / Identificación" value={app.dni_number || 'No especificado'} />
                <InfoRow label="Fecha de Nacimiento" value={app.birth_date || 'No especificada'} />
              </div>
              <div>
                <InfoRow label="Email de contacto" value={app.email} />
                <InfoRow label="Teléfono (WhatsApp)" value={app.phone} />
              </div>
            </div>
          </Card>

          {/* Step 2: Professional */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>2. INFORMACIÓN PROFESIONAL</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
              <div>
                <InfoRow label="Número de CMP" value={app.cmp_license} />
                <InfoRow label="Especialidad Principal" value={app.specialty} />
                <InfoRow label="Sub-especialidad" value={app.sub_specialty || 'Ninguna'} />
              </div>
              <div>
                <InfoRow label="Años de Experiencia" value={`${app.experience_years} años`} />
                <InfoRow label="Universidad" value={app.university || 'No especificada'} />
              </div>
            </div>
          </Card>

          {/* Step 3: Documents */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>3. EXPEDIENTE DIGITAL (DOCUMENTOS)</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 20 }}>
              {Object.entries(app.documents || {}).map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" style={{
                  textDecoration: 'none', background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.FileText /></div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 10, color: T.inkSoft }}>Ver archivo ↗</div>
                </a>
              ))}
              {(!app.documents || Object.keys(app.documents).length === 0) && <div style={{ color: T.inkMuted, fontSize: 13 }}>No hay documentos cargados.</div>}
            </div>
          </Card>

          {/* Step 4: Work Preferences */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>4. PREFERENCIAS DE TRABAJO</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
              <div>
                <SectionLabel style={{ fontSize: 10, color: T.inkSoft }}>Zonas de Cobertura</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {app.districts && app.districts.length > 0 ? app.districts.map(d => (
                    <span key={d} style={{ background: T.accentSoft, color: T.accent, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{d}</span>
                  )) : <span style={{ color: T.inkMuted, fontSize: 12 }}>Sin zonas asignadas</span>}
                </div>
                <InfoRow label="Movilidad Propia" value={app.mobility_type === 'car' ? 'Auto propio' : app.mobility_type === 'moto' ? 'Moto' : app.mobility_type === 'none' ? 'Taxi / App' : 'No especificada'} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, marginBottom: 8, textTransform: 'uppercase' }}>Horarios Preferidos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(app.work_slots || []).map(s => (
                    <span key={s} style={{ background: T.greenSoft, color: T.green, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s === 'morning' ? 'Mañanas' : s === 'afternoon' ? 'Tardes' : s === 'evening' ? 'Noches' : 'Madrugadas'}</span>
                  ))}
                  {(!app.work_slots || app.work_slots.length === 0) && <span style={{ color: T.inkMuted, fontSize: 12 }}>No especificados</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Step 5: Payment */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>5. MÉTODO DE PAGO</SectionLabel>
            <div style={{ background: T.bgInput, padding: 24, borderRadius: 16, border: `1px solid ${T.border}`, marginTop: 16 }}>
              {app.payment_method === 'yape' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#742284', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>Y</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>Yape (BCP)</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#742284' }}>+51 {app.payment_data?.yapePhone || '—'}</div>
                  </div>
                </div>
              ) : app.payment_method === 'cci' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <InfoRow label="Banco" value={app.payment_data?.bank === 'Otro' ? app.payment_data?.bankName : app.payment_data?.bank || '—'} />
                  <InfoRow label="Número CCI" value={app.payment_data?.cci || '—'} />
                </div>
              ) : <div style={{ color: T.inkMuted }}>No configurado</div>}
            </div>
          </Card>

          {/* Step 6: Review */}
          <Card style={{ padding: 32 }}>
            <SectionLabel>6. REVISIÓN Y BIOGRAFÍA</SectionLabel>
            <div style={{ marginTop: 16, fontSize: 14, color: T.ink, lineHeight: 1.6, background: T.bgInput, padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
              {app.bio || 'El doctor no proporcionó una biografía adicional.'}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: T.green, fontWeight: 700 }}>✓ El postulante ha aceptado los Términos y Condiciones.</div>
          </Card>
        </div>

        {/* Sidebar: Checklist + Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card style={{ padding: 24 }}>
            <SectionLabel>Validaciones Internas</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {requiredSteps.map(step => {
                const isDone = history.some(h => h.action === 'step_' + step.id);
                return (
                  <button key={step.id} disabled={logging[step.id] || loading} onClick={() => logStep(step.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: (logging[step.id] || loading) ? 'default' : 'pointer', border: `1px solid ${isDone ? T.green : T.border}`, background: isDone ? T.greenSoft : T.bgInput, color: isDone ? T.green : T.inkSoft, fontSize: 13, fontWeight: 700
                  }}>
                    {isDone ? <Ic.Check /> : (logging[step.id] ? '...' : <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${T.inkMuted}` }} />)}
                    {step.label}
                  </button>
                );
              })}
            </div>

            {app.status === 'pending' && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  disabled={!allChecked}
                  onClick={() => setConfirming('approve')}
                  style={{
                    background: allChecked ? T.green : T.inkMuted,
                    color: '#fff', border: 'none', padding: 16, borderRadius: 12,
                    fontWeight: 800, fontSize: 15, cursor: allChecked ? 'pointer' : 'not-allowed',
                    boxShadow: allChecked ? `0 4px 12px ${T.green}44` : 'none',
                    opacity: allChecked ? 1 : 0.5
                  }}>
                  {allChecked ? 'SÍ, APROBAR PERFIL' : 'VALIDACIÓN INCOMPLETA'}
                </button>
                <button onClick={() => setConfirming('reject')} style={{ background: 'transparent', color: T.red, border: `1px solid ${T.red}`, padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>RECHAZAR SOLICITUD</button>
              </div>
            )}
          </Card>

          <Card style={{ padding: 24 }}>
            <SectionLabel>Log de Validación</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${T.accent}33`, paddingLeft: 12, paddingBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: h.action.includes('observing') ? T.amber : T.accent, textTransform: 'uppercase' }}>
                    {h.action === 'observing_application' ? '👁️ OBSERVANDO EXPEDIENTE' : h.action.replace('step_', 'VALIDACIÓN: ').replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 12, color: T.ink, fontWeight: 600 }}>{h.admin_name}</div>
                  <div style={{ fontSize: 10, color: T.inkMuted }}>{fmtDate(h.created_at)}</div>
                </div>
              ))}
              {history.length === 0 && <div style={{ fontSize: 12, color: T.inkMuted, textAlign: 'center' }}>Sin registros aún.</div>}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 400, padding: 32, textAlign: 'center', boxShadow: T.shadow }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: confirming === 'approve' ? T.greenSoft : T.redSoft, color: confirming === 'approve' ? T.green : T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>
              {confirming === 'approve' ? <Ic.Check /> : <Ic.X />}
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 20, color: T.ink }}>¿Confirmar {confirming === 'approve' ? 'Aprobación' : 'Rechazo'}?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>
              Estás a punto de marcar la solicitud de <b>{app.name}</b> como <b>{confirming === 'approve' ? 'APROBADA' : 'RECHAZADA'}</b>.
            </p>

            {confirming === 'reject' && (
              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Motivo del Rechazo (Se enviará al doctor)</label>
                <textarea
                  autoFocus
                  required
                  placeholder="Ej: El CMP no coincide con los registros oficiales..."
                  style={{
                    width: '100%', padding: 12, borderRadius: 10, background: T.bgInput,
                    border: `1px solid ${T.red}33`, color: T.ink, outline: 'none',
                    minHeight: 100, fontSize: 13, fontFamily: 'inherit', resize: 'none'
                  }}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setConfirming(null)} style={{ padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgInput, fontWeight: 700, cursor: 'pointer', color: T.inkSoft }}>Cancelar</button>
              <button onClick={executeAction} style={{ padding: 14, borderRadius: 12, border: 'none', background: confirming === 'approve' ? T.green : T.red, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Confirmar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGS VIEW
═══════════════════════════════════════════════════════════════ */

function LogsView({ token, setView }) {
  const T = useT();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ dateFrom: '', dateTo: '', search: '' });
  const limit = 50;

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit, ...filter }).toString();
    try {
      const res = await fetch(`/admin/logs?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.rows);
        setTotal(data.total);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token, page]);

  const handleFilter = (e) => {
    e.preventDefault();
    if (page === 1) load();
    else setPage(1);
  };

  const getActionColor = (a) => {
    if (a.includes('login')) return T.accent;
    if (a.includes('reject') || a.includes('disabled')) return T.red;
    if (a.includes('approve') || a.includes('enabled')) return T.green;
    if (a.includes('reset')) return T.amber;
    return T.inkSoft;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters */}
      <Card style={{ padding: 24 }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: T.inkMuted, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>BUSCAR ACTIVIDAD</label>
            <input placeholder="Ej: login, reset, nombre..." style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: T.inkMuted, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>DESDE</label>
            <input type="date" style={{ padding: '11px 12px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: T.inkMuted, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>HASTA</label>
            <input type="date" style={{ padding: '11px 12px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })} />
          </div>
          <button type="submit" style={{ background: T.accent, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s' }}>Filtrar Historial</button>
        </form>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.bgInput + '22', textAlign: 'left', borderBottom: `1px solid ${T.border}` }}>
                {['TIEMPO', 'USUARIO', 'ACCIÓN', 'OBJETO / DETALLES'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: 10, fontWeight: 700, color: T.inkMuted, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando registros de auditoría...</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>No se encontraron registros para los filtros seleccionados.</td></tr>}
              {logs.map(l => {
                const targetMap = {
                  'doctor_application': 'apps',
                  'consultation': 'consultations',
                  'doctor': 'doctors',
                  'admin': 'management'
                };
                const targetView = targetMap[l.target_type];

                return (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                    <td style={{ padding: '14px 20px', color: T.inkSoft, whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: T.ink }}>{l.admin_name}</div>
                      <div style={{ fontSize: 11, color: T.inkMuted }}>@{l.admin_username}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6,
                        background: getActionColor(l.action) + '15', color: getActionColor(l.action)
                      }}>{l.action.toUpperCase().replace(/_/g, ' ')}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: T.inkSoft }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.8 }}>
                          {l.target_type}: {l.target_id.slice(0, 8)}...
                        </div>
                        {targetView && (
                          <button
                            onClick={() => setView(targetView, l.target_id)}
                            style={{ background: T.accentSoft, border: 'none', color: T.accent, borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Ver <Ic.ExternalLink />
                          </button>
                        )}
                      </div>
                      {l.details && (
                        <div style={{ fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>
                          {typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bgInput + '11' }}>
          <div style={{ fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>
            Mostrando {logs.length} de {total} registros (Pág. {page}/{totalPages || 1})
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgCard, color: T.ink, cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: page <= 1 ? 0.5 : 1 }}>Anterior</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgCard, color: T.ink, cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: page >= totalPages ? 0.5 : 1 }}>Siguiente</button>
          </div>
        </div>
      </Card>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
function Sidebar({ view, setView, admin, dark, toggleDark, onLogout, collapsed, onToggleCollapse, isMobile, onClose }) {
  const T = useT();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Finanzas', icon: <Ic.Home />, perm: 'overview' },
    { id: 'apps', label: 'Candidatos', icon: <Ic.FileText />, perm: 'apps' },
    { id: 'consultations', label: 'Consultas', icon: <Ic.Activity />, perm: 'consultations' },
    { id: 'doctors', label: 'Médicos Activos', icon: <Ic.Users />, perm: 'doctors' },
    { id: 'management', label: 'Usuarios', icon: <Ic.Settings />, perm: 'management' },
    { id: 'logs', label: 'Auditoría', icon: <Ic.History />, perm: 'management' },
  ].filter(i => {
    if (!admin || !admin.role) return true; // Mostramos todo si no hay rol definido (sesión vieja)
    if (admin.is_root || admin.role === 'admin') return true;
    return (admin.permissions || []).includes(i.perm);
  });

  const initials = (admin.name || admin.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const width = isMobile ? 280 : (collapsed ? 72 : 260);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: T.bgOverlay,
          zIndex: 49, transition: 'opacity 0.2s'
        }} />
      )}

      <div style={{
        width, flexShrink: 0,
        background: T.bgSide,
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 1,
        transition: 'width 0.2s ease',
        overflowX: 'hidden', overflowY: 'auto',
      }}>
        {/* Logo area */}
        <div style={{
          padding: collapsed && !isMobile ? '20px 16px' : '20px 20px',
          borderBottom: `1px solid ${T.border}`, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          {(!collapsed || isMobile) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, background: T.accent, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>
                Doctor House <span style={{ fontWeight: 400, color: T.inkMuted, fontSize: 13 }}>Admin</span>
              </div>
            </div>
          )}
          {collapsed && !isMobile && (
            <div style={{
              width: 32, height: 32, background: T.accent, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          {isMobile && (
            <button onClick={onClose} style={{
              background: T.bgHover, border: `1px solid ${T.border}`,
              borderRadius: 7, padding: 6, color: T.inkSoft, cursor: 'pointer'
            }}>
              <Ic.X />
            </button>
          )}
        </div>

        {/* Profile */}
        {(!collapsed || isMobile) && (
          <div style={{ padding: '16px 12px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, position: 'relative' }}>
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                borderRadius: 12, cursor: 'pointer', background: profileMenuOpen ? T.bgActive : 'transparent',
                transition: 'background 0.2s'
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: T.ink,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{admin.name || admin.username}</div>
                <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1, color: T.inkSoft }}>
                  {admin.is_root ? 'PROPIETARIO' : admin.role.toUpperCase()}
                </div>
              </div>
              <div style={{ color: T.inkMuted, transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <Ic.ChevronDown />
              </div>
            </div>

            {profileMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 12, right: 12, zIndex: 100,
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
                marginTop: 4, boxShadow: T.shadow, overflow: 'hidden', animation: 'slideDown 0.2s ease'
              }}>
                <button
                  onClick={() => { setView('profile'); setProfileMenuOpen(false); if (isMobile) onClose(); }}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', borderBottom: `1px solid ${T.border}`, color: T.ink, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>
                  <Ic.User /> Mi Perfil
                </button>
                <button
                  onClick={onLogout}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>
                  <Ic.Logout /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
        {collapsed && !isMobile && (
          <div style={{
            padding: '16px 0', borderBottom: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'center', flexShrink: 0
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 800
            }}>
              {initials}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const isActive = view === item.id;
            const isHov = hoveredItem === item.id;
            return (
              <button key={item.id}
                onClick={() => { setView(item.id); if (isMobile) onClose(); }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={collapsed && !isMobile ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed && !isMobile ? 0 : 10,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  padding: collapsed && !isMobile ? '10px 0' : '10px 12px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: isActive ? T.bgActive : isHov ? T.bgHover : 'transparent',
                  color: isActive ? T.accent : isHov ? T.ink : T.inkSoft,
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  transition: 'background 0.12s, color 0.12s',
                  textAlign: 'left', width: '100%',
                }}>
                <span style={{ color: isActive ? T.accent : 'inherit', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {(!collapsed || isMobile) && (
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                )}
                {isActive && (!collapsed || isMobile) && (
                  <div style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: T.accent
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '10px 10px 20px', borderTop: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0
        }}>
          {/* Dark mode toggle */}
          <button onClick={toggleDark}
            onMouseEnter={() => setHoveredItem('__dark')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed && !isMobile ? 0 : 10,
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              padding: collapsed && !isMobile ? '10px 0' : '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: hoveredItem === '__dark' ? T.bgHover : 'transparent',
              color: T.inkSoft, fontWeight: 500, fontSize: 14, width: '100%',
              transition: 'background 0.12s'
            }}>
            {dark ? <Ic.Sun /> : <Ic.Moon />}
            {(!collapsed || isMobile) && (
              <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>
            )}
          </button>

          {/* Collapse button (desktop only) */}
          {!isMobile && (
            <button onClick={onToggleCollapse}
              onMouseEnter={() => setHoveredItem('__collapse')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                background: hoveredItem === '__collapse' ? T.bgHover : 'transparent',
                color: T.inkSoft, fontWeight: 500, fontSize: 14, width: '100%',
                transition: 'background 0.12s'
              }}>
              {collapsed ? <Ic.ChevronRight /> : <Ic.ChevronLeft />}
              {!collapsed && <span style={{ fontSize: 14 }}>Contraer menú</span>}
            </button>
          )}

          {/* Logout */}
          <button onClick={onLogout}
            onMouseEnter={() => setHoveredItem('__logout')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed && !isMobile ? 0 : 10,
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              padding: collapsed && !isMobile ? '10px 0' : '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: hoveredItem === '__logout' ? T.redSoft : 'transparent',
              color: hoveredItem === '__logout' ? T.red : T.inkSoft,
              fontWeight: 500, fontSize: 14, width: '100%',
              transition: 'background 0.12s, color 0.12s'
            }}>
            <Ic.Logout />
            {(!collapsed || isMobile) && <span style={{ fontSize: 14 }}>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MANAGEMENT VIEW
   Solo para el administrador raíz para gestionar otros accesos.
═══════════════════════════════════════════════════════════════ */
function ManagementView({ token, admin, setView }) {
  const T = useT();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [logsTarget, setLogsTarget] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'user', permissions: ['apps'] });
  const [resetForm, setResetForm] = useState({ newPassword: '', adminPassword: '' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (logsTarget) {
      setLogsLoading(true);
      fetch(`/admin/users/${logsTarget.id}/logs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { setUserLogs(data); setLogsLoading(false); });
    }
  }, [logsTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ username: '', password: '', name: '', role: 'user', permissions: ['apps'] });
      load();
    } else {
      const err = await res.json();
      alert(err.error || 'Error al crear usuario');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const res = await fetch(`/admin/users/${resetTarget.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(resetForm)
    });
    if (res.ok) {
      alert('Contraseña actualizada correctamente.');
      setResetTarget(null);
      setResetForm({ newPassword: '', adminPassword: '' });
    } else {
      const err = await res.json();
      alert(err.error || 'Error al resetear contraseña');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!confirm(`¿Deseas ${currentStatus ? 'DESHABILITAR' : 'HABILITAR'} este acceso?`)) return;
    try {
      const res = await fetch(`/admin/users/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        load();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'No se pudo actualizar el estado'}`);
      }
    } catch (e) {
      alert('Error de conexión con el servidor');
    }
  };

  const togglePerm = (p) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p]
    }));
  };

  const modules = [
    { id: 'overview', label: 'Finanzas' },
    { id: 'apps', label: 'Candidatos' },
    { id: 'consultations', label: 'Consultas' },
    { id: 'doctors', label: 'Médicos Activos' },
    { id: 'management', label: 'Usuarios/Config' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <SectionLabel>Control de Accesos Administrativos</SectionLabel>
          <div style={{ fontSize: 13, color: T.inkSoft }}>Gestiona quién puede entrar a cada módulo del sistema.</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: T.accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 24px', fontWeight: 800, cursor: 'pointer', boxShadow: T.shadowSm
        }}>+ Crear Nuevo Usuario</button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, background: T.bgInput + '44' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Usuarios con acceso al panel</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: 'left', background: T.bgInput + '22' }}>
              {['NOMBRE / USUARIO', 'ROL', 'ESTADO', 'MÓDULOS PERMITIDOS', 'ÚLTIMO ACCESO', ''].map(h => (
                <th key={h} style={{ padding: '14px 20px', fontSize: 10, fontWeight: 700, color: T.inkMuted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando usuarios...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: T.ink }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: T.inkSoft }}>@{u.username}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6,
                    background: u.is_root ? T.purpleSoft : (u.role === 'admin' ? T.accentSoft : T.bgInput),
                    color: u.is_root ? T.purple : (u.role === 'admin' ? T.accent : T.inkSoft)
                  }}>{u.is_root ? 'PROPIETARIO' : u.role.toUpperCase()}</span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.is_active ? T.green : T.red }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: u.is_active ? T.green : T.red }}>
                      {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {u.role === 'admin' ? (
                    <span style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>Acceso Total</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(u.permissions || []).map(p => (
                        <span key={p} style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 8px',
                          background: T.bgInput, borderRadius: 5, color: T.ink
                        }}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                      ))}
                      {(!u.permissions || u.permissions.length === 0) && <span style={{ fontSize: 11, color: T.red }}>Sin permisos</span>}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 20px', fontSize: 12, color: T.inkSoft }}>
                  {u.last_login ? fmtDateShort(u.last_login) : <span style={{ opacity: 0.5 }}>Nunca</span>}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setView('users/' + u.id)} style={{
                      background: T.bgInput, border: 'none', color: T.inkSoft,
                      padding: 8, borderRadius: 8, cursor: 'pointer', display: 'inline-flex'
                    }} title="Ver Expediente de Usuario"><Ic.History /></button>
                    {!u.is_root && (
                      <button onClick={() => setResetTarget(u)} style={{
                        background: T.amberSoft, border: 'none', color: T.amber,
                        padding: 8, borderRadius: 8, cursor: 'pointer', display: 'inline-flex'
                      }} title="Resetear Contraseña"><Ic.Key /></button>
                    )}
                    {!u.is_root && (
                      <button onClick={() => toggleStatus(u.id, u.is_active)} style={{
                        background: u.is_active ? T.redSoft : T.greenSoft, border: 'none',
                        color: u.is_active ? T.red : T.green,
                        padding: 8, borderRadius: 8, cursor: 'pointer', display: 'inline-flex'
                      }} title={u.is_active ? "Deshabilitar Acceso" : "Habilitar Acceso"}>
                        {u.is_active ? <Ic.EyeOff /> : <Ic.Eye />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 500, padding: 32, boxShadow: T.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Nuevo Usuario Administrativo</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: T.inkSoft }}>Define las credenciales y nivel de acceso.</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: T.inkMuted, cursor: 'pointer' }}><Ic.X /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, display: 'block', marginBottom: 6 }}>Nombre Completo</label>
                  <input required placeholder="Ej: Juan Pérez" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, display: 'block', marginBottom: 6 }}>Usuario / Login</label>
                  <input required placeholder="juanp" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, display: 'block', marginBottom: 6 }}>Contraseña</label>
                <input required type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, display: 'block', marginBottom: 6 }}>Rol Principal</label>
                <select style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Operador (Permisos restringidos)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              {form.role === 'user' && (
                <div style={{ background: T.bgInput, padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: T.ink, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Módulos Habilitados</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {modules.filter(m => m.id !== 'management').map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: form.permissions.includes(m.id) ? T.accent : T.inkSoft }}>
                        <input type="checkbox" style={{ width: 16, height: 16, accentColor: T.accent }} checked={form.permissions.includes(m.id)} onChange={() => togglePerm(m.id)} /> {m.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" style={{
                background: T.accent, color: '#fff', border: 'none', padding: 16,
                borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                marginTop: 8, boxShadow: `0 4px 12px ${T.accent}33`
              }}>Guardar y Crear Acceso</button>
            </form>
          </Card>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 400, padding: 32, boxShadow: T.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Seguridad: Resetclave</h3>
              <button onClick={() => setResetTarget(null)} style={{ background: 'none', border: 'none', color: T.inkMuted, cursor: 'pointer' }}><Ic.X /></button>
            </div>
            <p style={{ fontSize: 13, color: T.inkSoft, marginBottom: 20 }}>
              Estás a punto de cambiar la clave de <b>{resetTarget.name}</b>.
            </p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.inkSoft, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Nueva clave del usuario</label>
                <input required type="password" style={{ width: '100%', padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} />
              </div>
              <div style={{ background: T.amberSoft, padding: 16, borderRadius: 10, border: `1px solid ${T.amber}33` }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>TU clave (Para autorizar)</label>
                <input required type="password" style={{ width: '100%', padding: 10, borderRadius: 8, background: T.bgCard, border: `1px solid ${T.amber}33`, color: T.ink, outline: 'none' }} value={resetForm.adminPassword} onChange={e => setResetForm({ ...resetForm, adminPassword: e.target.value })} />
              </div>
              <button type="submit" style={{ background: T.accent, color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>Firmar y Resetear</button>
            </form>
          </Card>
        </div>
      )}

      {/* User Activity Modal */}
      {logsTarget && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: T.shadow }}>
            <div style={{ padding: 24, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Historial: {logsTarget.name}</h3>
                <div style={{ fontSize: 12, color: T.inkSoft }}>Últimos 100 movimientos de este usuario</div>
              </div>
              <button onClick={() => setLogsTarget(null)} style={{ background: 'none', border: 'none', color: T.inkMuted, cursor: 'pointer' }}><Ic.X /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
              {logsLoading && <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>Cargando actividad...</div>}
              {!logsLoading && userLogs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>No hay actividad registrada para este usuario.</div>}
              {userLogs.map(l => {
                const targetMap = {
                  'doctor_application': 'apps',
                  'consultation': 'consultations',
                  'doctor': 'doctors',
                  'admin': 'management'
                };
                const targetView = targetMap[l.target_type];

                return (
                  <div key={l.id} style={{ padding: '12px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 16 }}>
                    <div style={{ fontSize: 11, color: T.inkMuted, width: 100, flexShrink: 0 }}>
                      {fmtDate(l.created_at)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: T.ink, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {l.action.replace(/_/g, ' ')}
                        {targetView && (
                          <button
                            onClick={() => { setLogsTarget(null); setView(targetView); }}
                            style={{ background: 'none', border: 'none', color: T.accent, fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            IR <Ic.ExternalLink />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>
                        {l.target_type} ({l.target_id.slice(0, 8)})
                      </div>
                      {l.details && (
                        <div style={{ fontSize: 10, background: T.bgInput, padding: '4px 8px', borderRadius: 4, marginTop: 6, color: T.inkMuted, fontFamily: 'monospace' }}>
                          {typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 20, borderTop: `1px solid ${T.border}`, background: T.bgInput + '22', textAlign: 'right' }}>
              <button onClick={() => setLogsTarget(null)} style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.ink, padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cerrar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   DASHBOARD APP
═══════════════════════════════════════════════════════════════ */
function DashboardApp({ admin, token, onLogout, dark, toggleDark }) {
  const T = useT();
  const PAGE_TITLES = {
    overview: 'Finanzas',
    apps: 'Candidatos',
    consultations: 'Consultas',
    doctors: 'Médicos Activos',
    management: 'Gestión de Usuarios',
    profile: 'Mi Perfil',
    logs: 'Auditoría',
    'user-detail': 'Expediente de Usuario',
    'app-detail': 'Validación de Candidato',
    'doctor-detail': 'Perfil de Médico Activo',
  };

  const perms = admin.permissions || [];

  // Helper to get view from URL hash
  const getViewFromHash = () => {
    const h = window.location.hash.replace('#/', '');
    if (h.startsWith('users/')) return { type: 'user-detail', id: h.split('/')[1] };
    if (h.startsWith('apps/')) return { type: 'app-detail', id: h.split('/')[1] };
    if (h.startsWith('doctors/')) return { type: 'doctor-detail', id: h.split('/')[1] };
    return { type: PAGE_TITLES[h] ? h : perms[0] || 'overview' };
  };

  const [viewState, setViewState] = useState(() => {
    const fromUrl = getViewFromHash();
    if (fromUrl.type) return fromUrl;
    if (admin.role === 'admin') return { type: 'overview' };
    return { type: perms[0] || 'overview' };
  });

  const view = viewState.type;
  const setView = (v, id = null) => {
    if (typeof v === 'string' && v.startsWith('users/')) {
      setViewState({ type: 'user-detail', id: v.split('/')[1] });
    } else if (typeof v === 'string' && v.startsWith('apps/')) {
      setViewState({ type: 'app-detail', id: v.split('/')[1] });
    } else if (typeof v === 'string' && v.startsWith('doctors/')) {
      setViewState({ type: 'doctor-detail', id: v.split('/')[1] });
    } else if (id) {
      const mapped = { 'apps': 'app-detail', 'management': 'user-detail', 'doctors': 'doctor-detail' };
      setViewState({ type: mapped[v] || v, id });
    } else {
      setViewState({ type: v });
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state with URL hash
  useEffect(() => {
    let suffix = view;
    if (view === 'user-detail') suffix = `users/${viewState.id}`;
    if (view === 'app-detail') suffix = `apps/${viewState.id}`;
    if (view === 'doctor-detail') suffix = `doctors/${viewState.id}`;
    window.location.hash = `#/${suffix}`;
  }, [view, viewState.id]);

  // Listen for browser back/forward or manual URL change
  useEffect(() => {
    const handleHash = () => {
      const v = getViewFromHash();
      if (v.type && (v.type !== viewState.type || v.id !== viewState.id)) setViewState(v);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [viewState]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Redirection guard for unauthorized views
  useEffect(() => {
    if (admin.role === 'admin') return;
    const perms = admin.permissions || [];
    if (view === 'management' || (!perms.includes(view) && view !== 'overview')) {
      setView(perms[0] || 'overview');
    }
  }, [view, admin]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <Sidebar
          view={view} setView={v => { setView(v); setSidebarOpen(false); }}
          admin={admin} dark={dark} toggleDark={toggleDark}
          onLogout={onLogout}
          collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)}
          isMobile={isMobile} onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflowX: 'hidden'
      }}>
        {/* Top bar */}
        <div style={{
          height: 60, borderBottom: `1px solid ${T.border}`,
          background: T.bgCard, display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 10,
          boxShadow: T.shadowSm, flexShrink: 0
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{
                background: 'none', border: 'none', color: T.inkSoft,
                cursor: 'pointer', padding: 4, display: 'flex'
              }}>
              <Ic.Menu />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: T.inkMuted,
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1
            }}>
              Doctor House · {admin.role === 'admin' ? 'Administrador' : 'Operador'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
              {PAGE_TITLES[view] || view}
            </div>
          </div>
          <button onClick={toggleDark} style={{
            background: T.bgInput, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '7px 9px', color: T.inkSoft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600
          }}>
            {dark ? <Ic.Sun /> : <Ic.Moon />}
            {!isMobile && <span>{dark ? 'Claro' : 'Oscuro'}</span>}
          </button>
        </div>

        {/* Content */}
        <main style={{
          flex: 1, padding: isMobile ? 16 : 32, maxWidth: 1400, width: '100%',
          margin: '0 auto', boxSizing: 'border-box'
        }}>
          {view === 'overview' && <OverviewView token={token} />}
          {view === 'apps' && <ApplicationsView token={token} admin={admin} setView={setView} />}
          {view === 'consultations' && <ConsultationsView token={token} initialId={viewState.id} />}
          {view === 'doctors' && <DoctorsView token={token} setView={setView} />}
          {view === 'management' && <ManagementView token={token} admin={admin} setView={setView} />}
          {view === 'logs' && <LogsView token={token} setView={setView} />}
          {view === 'user-detail' && <UserDetailView userId={viewState.id} token={token} setView={setView} />}
          {view === 'app-detail' && <ApplicationDetailView appId={viewState.id} token={token} admin={admin} setView={setView} />}
          {view === 'doctor-detail' && <DoctorDetailView doctorId={viewState.id} token={token} admin={admin} setView={setView} />}
          {view === 'profile' && <ProfileView token={token} admin={admin} onRefresh={() => window.location.reload()} />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════ */
function Login({ onLogin, dark, toggleDark }) {
  const T = useT();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (res.ok) onLogin(data);
      else setError(data.error || 'Credenciales incorrectas.');
    } catch { setError('Error de red. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${T.border}`, background: T.bgInput,
    color: T.ink, fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: T.bg, padding: 16
    }}>

      {/* Theme toggle top-right */}
      <button onClick={toggleDark} style={{
        position: 'fixed', top: 16, right: 16,
        background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8,
        padding: '7px 9px', color: T.inkSoft, cursor: 'pointer', display: 'flex',
        alignItems: 'center', gap: 6, fontSize: 12
      }}>
        {dark ? <Ic.Sun /> : <Ic.Moon />}
      </button>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: T.accent, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>Doctor House</div>
          <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4 }}>Panel de administración</div>
        </div>

        {/* Card */}
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 32, boxShadow: T.shadow
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 24 }}>
            Iniciar sesión
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: T.inkSoft,
                display: 'block', marginBottom: 6
              }}>Usuario</label>
              <input type="text" placeholder="nombre de usuario" value={user}
                onChange={e => setUser(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: T.inkSoft,
                display: 'block', marginBottom: 6
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={pass} onChange={e => setPass(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: T.inkMuted, cursor: 'pointer',
                    fontSize: 12
                  }}>{showPass ? 'Ocultar' : 'Ver'}</button>
              </div>
            </div>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                borderRadius: 8, background: T.redSoft, border: `1px solid ${T.red}33`
              }}>
                <Ic.AlertCircle />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.red }}>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{
                padding: '13px 24px', borderRadius: 10, border: 'none',
                background: loading ? T.bgInput : T.accent,
                color: loading ? T.inkMuted : '#fff',
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s', marginTop: 4
              }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: T.inkMuted }}>
          Doctor House © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
function Main() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dh_admin_auth')) || null; } catch { return null; }
  });
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('dh_dark');
    return s !== null ? s === 'true' : true;
  });

  useEffect(() => {
    // Inject base CSS once
    if (!document.getElementById('dh-css')) {
      const s = document.createElement('style');
      s.id = 'dh-css';
      s.textContent = `
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Manrope', -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.45); }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const t = dark ? DARK : LIGHT;
    document.body.style.background = t.bg;
    document.body.style.color = t.ink;
    localStorage.setItem('dh_dark', String(dark));
    // Update select option colors dynamically
    let optStyle = document.getElementById('dh-option-css');
    if (!optStyle) { optStyle = document.createElement('style'); optStyle.id = 'dh-option-css'; document.head.appendChild(optStyle); }
    optStyle.textContent = `select option { background: ${t.bgCard}; color: ${t.ink}; }`;
  }, [dark]);

  const handleLogin = (data) => {
    localStorage.setItem('dh_admin_auth', JSON.stringify(data));
    setAuth(data);
  };
  const handleLogout = () => {
    localStorage.removeItem('dh_admin_auth');
    setAuth(null);
  };
  const toggleDark = () => setDark(d => !d);
  const theme = dark ? DARK : LIGHT;

  return (
    <ThemeCtx.Provider value={theme}>
      {auth
        ? <DashboardApp admin={auth.admin} token={auth.token}
          onLogout={handleLogout} dark={dark} toggleDark={toggleDark} />
        : <Login onLogin={handleLogin} dark={dark} toggleDark={toggleDark} />
      }
    </ThemeCtx.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
