// _shared.jsx — theme, icons, utils, shared UI (loaded first)
const { useState, useEffect, useCallback, useContext, createContext, useRef } = React;

/* ── Theme ──────────────────────────────────────────────────── */
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

/* ── Navigation context ─────────────────────────────────────── */
const NavCtx = createContext({ path: '/admin/inicio', navigate: () => { } });
const useNav = () => useContext(NavCtx);

/* ── Icons ──────────────────────────────────────────────────── */
const Ic = {
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  Sun: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Moon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Logout: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  ChevronLeft: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ChevronRight: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>,
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Star: ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#E3B341' : 'none'} stroke="#E3B341" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  X: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  TrendingUp: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  Clock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  CreditCard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  AlertCircle: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  History: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" /><polyline points="12 7 12 12 15 15" /></svg>,
};

/* ── Shared UI ──────────────────────────────────────────────── */
function Card({ children, style }) {
  const T = useT();
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 24, boxShadow: T.shadowSm, ...style
    }}>
      {children}
    </div>
  );
}
function SectionLabel({ children, style }) {
  const T = useT();
  return <div style={{
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.9, color: T.inkMuted, marginBottom: 10, ...style
  }}>{children}</div>;
}
function Divider({ style }) {
  const T = useT();
  return <div style={{ height: 1, background: T.border, margin: '14px 0', ...style }} />;
}
function InfoRow({ label, value, valueColor }) {
  const T = useT();
  if (!value && value !== 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: T.inkMuted,
        textTransform: 'uppercase', marginBottom: 3
      }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: valueColor || T.ink, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}
function StatTile({ label, value, icon, color, soft }) {
  const T = useT();
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 14,
      alignItems: 'center', boxShadow: T.shadowSm
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: soft || `${color}1A`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.inkSoft, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{value}</div>
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
          <button key={tab.value} onClick={() => onChange(tab.value)} style={{
            padding: '7px 14px', borderRadius: 7, border: 'none',
            background: isActive ? T.bgCard : 'transparent',
            color: isActive ? T.ink : T.inkSoft,
            fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer',
            boxShadow: isActive ? T.shadowSm : 'none',
            transition: 'all 0.15s',
          }}>
            {tab.label}
            {tab.count != null && (
              <span style={{
                marginLeft: 5, fontSize: 11, fontWeight: 700,
                color: isActive ? T.accent : T.inkMuted
              }}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
function HoverRow({ children, onClick, style }) {
  const T = useT();
  const [hov, setHov] = useState(false);
  return (
    <tr style={{ ...style, background: hov ? T.bgHover : 'transparent', transition: 'background 0.1s' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      {children}
    </tr>
  );
}

/* ── Utils ──────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const h12 = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()} · ${h12}:${mm} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const h12 = d.getHours() % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
}

/* ── Domain constants ───────────────────────────────────────── */
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

/* ── Domain UI ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: (status || '').toUpperCase(), bg: 'rgba(128,128,128,0.1)', color: '#888' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6,
      background: cfg.bg, color: cfg.color, letterSpacing: 0.5, whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </span>
  );
}
function AppStatusBadge({ status }) {
  const cfg = APP_STATUS_CFG[status] || { label: (status || '').toUpperCase(), bg: 'rgba(128,128,128,0.1)', color: '#888' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6,
      background: cfg.bg, color: cfg.color, letterSpacing: 0.5, whiteSpace: 'nowrap'
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
          <div key={i} style={{ background: T.accentSoft, borderRadius: 8, padding: '8px 14px', minWidth: 80 }}>
            <div style={{ fontSize: 10, color: T.inkMuted, marginBottom: 3 }}>{it.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{it.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function buildEventCfg(event, doctorName) {
  const m = event.metadata || {};
  const dr = event.actor_name || doctorName || '';
  switch (event.event_type) {
    case 'visit_requested': return { color: '#1E6FFF', text: 'Paciente solicitó la visita', badge: URGENCY_LABELS[m.urgency] || m.urgency, sub: SERVICE_LABELS[m.service_type] || null };
    case 'doctor_assigned': return { color: '#BC8CFF', text: `Sistema asignó al Dr. ${dr}`, sub: m.eta_minutes ? `ETA: ${m.eta_minutes} min` : null };
    case 'doctor_accepted': return { color: '#1E6FFF', text: `Dr. ${dr} aceptó la visita`, badge: m.eta_minutes ? `ETA ${m.eta_minutes} min` : null };
    case 'doctor_arrived': return { color: '#BC8CFF', text: `Dr. ${dr} llegó al domicilio` };
    case 'consultation_started': return { color: '#1E6FFF', text: 'Consulta médica iniciada' };
    case 'vitals_recorded': return { color: '#60A5FA', text: 'Signos vitales registrados', sub: [m.temp && `Temp ${m.temp}°C`, m.bp && `PA ${m.bp}`, m.hr && `FC ${m.hr} lpm`].filter(Boolean).join(' · ') || null };
    case 'diagnosis_recorded': return { color: '#60A5FA', text: 'Diagnóstico registrado', sub: m.diagnosis ? m.diagnosis.substring(0, 80) : null, badge: m.diagnosis_code || null };
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
