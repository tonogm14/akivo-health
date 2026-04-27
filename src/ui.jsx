// Shared UI building blocks
const { color: C, font: F, radius: R } = window.DH;

// ── Primary CTA button
function PrimaryButton({ children, onClick, disabled, variant = 'blue', size = 'lg', style }) {
  const bg = disabled ? '#C8D0D8' : (variant === 'red' ? C.red : variant === 'green' ? C.green : C.blue);
  const h = size === 'lg' ? 56 : size === 'xl' ? 64 : 48;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height: h, border: 'none', borderRadius: R.md,
      background: bg, color: '#fff',
      fontFamily: F.display, fontSize: 17, fontWeight: 600, letterSpacing: -0.2,
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: disabled ? 'none' : '0 6px 16px -8px rgba(24,99,224,0.4)',
      transition: 'transform 0.15s, background 0.15s',
      ...style,
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 52, border: `1.5px solid ${C.line}`, borderRadius: R.md,
      background: '#fff', color: C.ink,
      fontFamily: F.ui, fontSize: 16, fontWeight: 600,
      cursor: 'pointer', ...style,
    }}>{children}</button>
  );
}

// ── Stepper / progress dots
function StepDots({ step, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 2, transition: 'all 0.3s',
          width: i === step ? 24 : 8,
          background: i <= step ? C.blue : C.lineStrong,
        }}/>
      ))}
    </div>
  );
}

// ── Top bar with optional back and step indicator
function TopBar({ onBack, title, step, total, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px 14px', minHeight: 52,
      borderBottom: '1px solid ' + C.line,
      background: '#fff',
    }}>
      {onBack !== undefined && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none',
          background: '#F4F6F8', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: C.ink,
        }}>
          <I.ChevronLeft size={22}/>
        </button>
      )}
      {title && (
        <div style={{
          flex: 1, fontFamily: F.display, fontSize: 17, fontWeight: 600,
          color: C.ink, textAlign: onBack !== undefined ? 'center' : 'left',
          marginRight: onBack !== undefined ? 36 : 0,
        }}>{title}</div>
      )}
      {step !== undefined && (
        <div style={{ marginLeft: 'auto' }}>
          <StepDots step={step} total={total || 4}/>
        </div>
      )}
      {right}
    </div>
  );
}

// ── Choice tile / selectable card with icon
function ChoiceTile({ icon, label, sub, selected, onClick, accent, danger }) {
  const ac = danger ? C.red : (accent || C.blue);
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      padding: '16px 16px', borderRadius: R.md,
      border: `1.5px solid ${selected ? ac : C.line}`,
      background: selected ? (danger ? C.redSoft : C.blueSoft) : '#fff',
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', transition: 'all 0.15s',
      fontFamily: F.ui,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: selected ? ac : '#F4F6F8',
        color: selected ? '#fff' : (danger ? C.red : C.ink),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2, lineHeight: 1.3 }}>{sub}</div>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 11, flexShrink: 0,
        border: `2px solid ${selected ? ac : C.lineStrong}`,
        background: selected ? ac : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        {selected && <I.Check size={14} sw={3}/>}
      </div>
    </button>
  );
}

// ── Pill chip (for symptoms/tags)
function Chip({ icon, label, selected, onClick, color }) {
  const ac = color || C.blue;
  return (
    <button onClick={onClick} style={{
      padding: '12px 14px', borderRadius: 14,
      border: `1.5px solid ${selected ? ac : C.line}`,
      background: selected ? C.blueSoft : '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
      cursor: 'pointer', flexShrink: 0,
      fontFamily: F.ui, fontSize: 14, fontWeight: 600,
      color: selected ? C.blueDark : C.ink,
    }}>
      {icon}
      {label}
    </button>
  );
}

// ── Section title
function SectionTitle({ children, style }) {
  return (
    <div style={{
      fontFamily: F.display, fontSize: 13, fontWeight: 600,
      color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6,
      marginBottom: 10, ...style,
    }}>{children}</div>
  );
}

// ── Card
function Card({ children, style, pad = 16 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: R.lg, padding: pad,
      border: '1px solid ' + C.line,
      ...style,
    }}>{children}</div>
  );
}

// ── Avatar (portrait placeholder w/ initials)
function Avatar({ name, size = 56, bg, ring }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  const bgc = bg || `hsl(${name.charCodeAt(0) * 7 % 360} 35% 75%)`;
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `linear-gradient(135deg, ${bgc}, hsl(${(name.charCodeAt(0) * 7 + 40) % 360} 40% 65%))`,
      color: '#fff', fontFamily: F.display, fontWeight: 700, fontSize: size * 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: ring ? `0 0 0 3px #fff, 0 0 0 5px ${ring}` : 'none',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ── Bottom fixed action area
function BottomBar({ children }) {
  return (
    <div style={{
      padding: '12px 20px 34px', background: '#fff',
      borderTop: '1px solid ' + C.line,
    }}>{children}</div>
  );
}

Object.assign(window, {
  PrimaryButton, SecondaryButton, StepDots, TopBar, ChoiceTile, Chip,
  SectionTitle, Card, Avatar, BottomBar,
});
