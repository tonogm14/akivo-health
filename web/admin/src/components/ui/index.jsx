import { C, F, R, S } from '@/tokens';

// ─── Pill ──────────────────────────────────────────────────
const TONES = {
  neutral: { bg: '#F1F3F6', fg: C.inkSoft,  dot: C.inkSubtle },
  info:    { bg: C.primarySoft, fg: C.primary, dot: C.primary },
  ok:      { bg: C.greenSoft,   fg: C.green,   dot: C.green },
  warn:    { bg: C.amberSoft,   fg: '#7E5305', dot: C.amber },
  danger:  { bg: C.redSoft,     fg: C.red,     dot: C.red },
  violet:  { bg: C.violetSoft,  fg: C.violet,  dot: C.violet },
  teal:    { bg: C.tealSoft,    fg: C.teal,    dot: C.teal },
  ink:     { bg: C.ink,         fg: '#fff',    dot: '#fff' },
};

export function Pill({ children, tone = 'neutral', dot, size = 'md', style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      background: t.bg, color: t.fg,
      fontFamily: F.sans, fontSize: size === 'sm' ? 10.5 : 11.5, fontWeight: 600,
      borderRadius: 999, lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
}

// ─── Button ────────────────────────────────────────────────
const BTN = {
  primary: { bg: C.primary,    fg: '#fff',      border: C.primary,    hover: C.primaryHover },
  paper:   { bg: '#fff',       fg: C.inkSoft,   border: C.line,       hover: C.surfaceAlt },
  ghost:   { bg: 'transparent',fg: C.inkSoft,   border: 'transparent',hover: C.lineSoft },
  danger:  { bg: C.redSoft,    fg: C.red,       border: C.red+'44',   hover: C.redSoft },
  ok:      { bg: C.greenSoft,  fg: C.green,     border: C.green+'44', hover: C.greenSoft },
};
const BSIZES = {
  sm: { h: 28, px: 10, fs: 12 },
  md: { h: 34, px: 14, fs: 12.5 },
  lg: { h: 42, px: 20, fs: 13.5 },
};

export function Btn({ children, variant = 'paper', size = 'md', icon, iconRight, full, onClick, style, disabled }) {
  const v = BTN[variant] || BTN.paper;
  const sz = BSIZES[size] || BSIZES.md;
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        height: sz.h, padding: `0 ${sz.px}px`,
        background: hov && !disabled ? v.hover : v.bg,
        color: v.fg, border: `1px solid ${v.border}`,
        borderRadius: R.md, fontFamily: F.sans, fontSize: sz.fs, fontWeight: 600,
        width: full ? '100%' : undefined,
        transition: 'background .12s', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {icon}{children}{iconRight}
    </button>
  );
}

export function IconBtn({ icon, onClick, style }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, display: 'grid', placeItems: 'center',
        background: hov ? C.lineSoft : 'transparent',
        border: `1px solid ${hov ? C.line : 'transparent'}`,
        borderRadius: R.md, color: C.inkMuted, transition: 'all .1s', ...style,
      }}>{icon}</button>
  );
}

// ─── Input ────────────────────────────────────────────────
export function Input({ value, onChange, defaultValue, placeholder, icon, mono, type = 'text', style }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 9, color: C.inkMuted, pointerEvents: 'none', display: 'flex' }}>{icon}</span>}
      <input
        type={type} value={value} onChange={onChange} defaultValue={defaultValue}
        placeholder={placeholder}
        style={{
          width: '100%', height: 34, padding: `0 10px 0 ${icon ? 30 : 10}px`,
          border: `1px solid ${C.line}`, background: '#fff',
          borderRadius: R.md, fontFamily: mono ? F.mono : F.sans, fontSize: 13,
          color: C.ink, outline: 'none', transition: 'border .1s',
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.line}
      />
    </div>
  );
}

export function Field({ label, children, required, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && (
        <label style={{ display: 'block', fontFamily: F.sans, fontSize: 11.5, fontWeight: 600, color: C.inkMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}{required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, bare, pad = 16, style }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`,
      borderRadius: R.lg, boxShadow: S.sm,
      padding: bare ? 0 : pad, overflow: bare ? 'hidden' : undefined,
      ...style,
    }}>{children}</div>
  );
}

export function CardHead({ title, subtitle, right, style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, ...style }}>
      <div>
        <div style={{ fontFamily: F.sans, fontSize: 13.5, fontWeight: 700, color: C.ink }}>{title}</div>
        {subtitle && <div style={{ fontFamily: F.sans, fontSize: 11.5, color: C.inkMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────
export function Table({ columns, rows, onRowClick, dense }) {
  const pad = dense ? '7px 12px' : '11px 14px';
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F.sans, fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: C.surfaceAlt }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: dense ? '6px 12px' : '9px 14px',
                textAlign: col.align || 'left', fontWeight: 600,
                fontSize: 10.5, color: C.inkMuted, textTransform: 'uppercase',
                letterSpacing: 0.5, borderBottom: `1px solid ${C.line}`,
                whiteSpace: 'nowrap', width: col.w,
              }}>{col.h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                borderBottom: `1px solid ${C.lineSoft}`,
                cursor: onRowClick ? 'pointer' : 'default',
                background: 'transparent',
                transition: 'background .08s',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = C.surfaceAlt; }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col, ci) => (
                <td key={ci} style={{
                  padding: pad, textAlign: col.align || 'left',
                  fontFamily: col.mono ? F.mono : F.sans,
                  whiteSpace: col.wrap ? 'normal' : 'nowrap',
                  color: C.inkSoft, verticalAlign: 'middle',
                }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>Sin resultados</div>
      )}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────
export function Kpi({ label, value, delta, hint, accent, big, mono }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.lg, padding: 14, boxShadow: S.sm }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{
        fontFamily: mono ? F.mono : F.sans,
        fontSize: big ? 26 : 20, fontWeight: 700, color: accent || C.ink, letterSpacing: -0.5,
      }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {delta !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? C.green : C.red }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
        {hint && <span style={{ fontSize: 11, color: C.inkSubtle }}>{hint}</span>}
      </div>
    </div>
  );
}

// ─── Page layout helpers ──────────────────────────────────
export function Page({ children, style }) {
  return <div style={{ padding: '18px 22px', animation: 'fadeIn .18s ease-out', ...style }}>{children}</div>;
}

export function PageHeader({ kicker, title, description, actions, tabs, currentTab, onTab }) {
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}`, padding: '14px 22px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          {kicker && <div style={{ fontFamily: F.mono, fontSize: 10, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>{kicker}</div>}
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: -0.4, marginBottom: description ? 4 : 0 }}>{title}</h1>
          {description && <div style={{ fontSize: 12.5, color: C.inkMuted }}>{description}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 16 }}>{actions}</div>}
      </div>
      {tabs && (
        <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${C.lineSoft}`, marginTop: 6 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onTab(t.id)} style={{
              padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: F.sans, fontSize: 12.5, fontWeight: currentTab === t.id ? 700 : 500,
              color: currentTab === t.id ? C.primary : C.inkMuted,
              borderBottom: `2px solid ${currentTab === t.id ? C.primary : 'transparent'}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{ padding: '1px 6px', background: currentTab === t.id ? C.primary : C.lineSoft, color: currentTab === t.id ? '#fff' : C.inkMuted, borderRadius: 9, fontSize: 10, fontFamily: F.mono }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────
export function Sparkline({ data = [], w = 600, h = 120, color = C.primary }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 5;
    return `${x},${y}`;
  });
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M${pts.join('L')}L${w},${h}L0,${h}Z`} fill="url(#sg)"/>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Bars chart ───────────────────────────────────────────
export function Bars({ data = [], accent = C.primary, h = 120 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.v || d));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: h }}>
      {data.map((d, i) => {
        const v = d.v !== undefined ? d.v : d;
        const label = d.label || '';
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: ((v / max) * (h - 20)), background: accent, borderRadius: '2px 2px 0 0', minHeight: 2 }}/>
            <div style={{ fontFamily: F.mono, fontSize: 8.5, color: C.inkMuted }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }}/>
  );
}

// ─── Select ───────────────────────────────────────────────
export function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      height: 34, padding: '0 10px', border: `1px solid ${C.line}`,
      background: '#fff', borderRadius: R.md, fontFamily: F.sans, fontSize: 13,
      color: C.ink, outline: 'none', cursor: 'pointer', ...style,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// expose React to the module scope for event handlers in JSX above
import React from 'react';
