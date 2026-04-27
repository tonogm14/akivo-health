// ═══════════════════════════════════════════════════════════
// Apply form — multistep doctor application
// ═══════════════════════════════════════════════════════════
const STEPS = [
  { id: 'personal', label: 'Datos personales' },
  { id: 'professional', label: 'Profesional' },
  { id: 'docs', label: 'Documentos' },
  { id: 'work', label: 'Preferencias' },
  { id: 'payment', label: 'Pagos' },
  { id: 'review', label: 'Revisión' },
];

// ─── TopBar ────────────────────────────────────────────────
function TopBar({ step, onExit }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div style={{
      background: '#fff', borderBottom: `1px solid ${L.c.line}`,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Container>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 72,
        }}>
          <LogoLockup size={22} />
          <button onClick={onExit} style={{
            background: 'transparent', border: 'none',
            fontSize: 13, fontWeight: 700, color: L.c.inkSoft, cursor: 'pointer',
          }}>Salir ✕</button>
        </div>
      </Container>
      <div style={{ height: 4, background: L.c.line }}>
        <div style={{
          height: '100%', width: pct + '%',
          background: L.c.blue,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}

// ─── StepHeader ────────────────────────────────────────────
function StepHeader({ step, title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: 2,
        textTransform: 'uppercase', color: L.c.blue, marginBottom: 10,
      }}>
        Paso {step + 1} de {STEPS.length} · {STEPS[step].label}
      </div>
      <h1 style={{
        fontFamily: L.f.sans, fontSize: 32, fontWeight: 800,
        color: L.c.ink, letterSpacing: -1, lineHeight: 1.15,
        margin: 0,
      }}>{title}</h1>
      {sub && (
        <p style={{
          fontSize: 16, color: L.c.inkSoft, lineHeight: 1.55,
          marginTop: 12, marginBottom: 0, maxWidth: 520,
        }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────
function Field({ label, hint, required, children, error }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block',
        fontSize: 13, fontWeight: 700, color: L.c.ink,
        marginBottom: 8,
      }}>
        {label} {required && <span style={{ color: L.c.blue }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <div style={{ fontSize: 12, color: L.c.inkMuted, marginTop: 6 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#E23B4D', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ─── TextInput ─────────────────────────────────────────────
function TextInput({ value, onChange, placeholder, type = 'text', prefix, hasError }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = hasError ? '#E23B4D' : focused ? L.c.blue : L.c.line;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      border: `1.5px solid ${borderColor}`, borderRadius: 12,
      background: '#fff', overflow: 'hidden',
      transition: 'border-color 0.15s',
      boxShadow: focused ? `0 0 0 3px ${hasError ? 'rgba(226,59,77,0.12)' : 'rgba(24,99,224,0.12)'}` : 'none',
    }}>
      {prefix && (
        <div style={{
          padding: '14px 14px', background: L.c.bgWarm,
          borderRight: `1px solid ${L.c.line}`,
          fontSize: 15, fontWeight: 600, color: L.c.inkSoft,
          display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
        }}>{prefix}</div>
      )}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: '14px 16px', border: 'none', outline: 'none',
          fontSize: 15, color: L.c.ink, background: 'transparent',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

// ─── TextArea ──────────────────────────────────────────────
function TextArea({ value, onChange, placeholder, hasError, rows = 4 }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = hasError ? '#E23B4D' : focused ? L.c.blue : L.c.line;
  return (
    <div style={{
      border: `1.5px solid ${borderColor}`, borderRadius: 12,
      background: '#fff', overflow: 'hidden', transition: 'border-color 0.15s',
      boxShadow: focused ? `0 0 0 3px ${hasError ? 'rgba(226,59,77,0.12)' : 'rgba(24,99,224,0.12)'}` : 'none',
    }}>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '14px 16px', border: 'none', outline: 'none',
          fontSize: 15, color: L.c.ink, background: 'transparent',
          fontFamily: 'inherit', resize: 'vertical',
        }}
      />
    </div>
  );
}

// ─── DocTypeSelect ──────────────────────────────────────────
function DocTypeSelect({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '14px 16px', paddingRight: 40,
        border: `1.5px solid ${L.c.line}`, borderRadius: 12,
        background: '#fff', fontSize: 15, color: L.c.ink,
        appearance: 'none', outline: 'none', fontFamily: 'inherit',
        cursor: 'pointer',
      }}>
        <option value="DNI">DNI — Documento Nacional de Identidad</option>
        <option value="CE">CE — Carnet de Extranjería</option>
      </select>
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <LI.ChevronDown size={18} color={L.c.inkSoft} />
      </div>
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────
function Select({ value, onChange, options, hasError }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = hasError ? '#E23B4D' : focused ? L.c.blue : L.c.line;
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '14px 16px', paddingRight: 40,
          border: `1.5px solid ${borderColor}`, borderRadius: 12,
          background: '#fff', fontSize: 15, color: value ? L.c.ink : L.c.inkMuted,
          appearance: 'none', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: focused ? `0 0 0 3px rgba(24,99,224,0.12)` : 'none',
          transition: 'border-color 0.15s',
        }}>
        <option value="">Selecciona...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <LI.ChevronDown size={18} color={L.c.inkSoft} />
      </div>
    </div>
  );
}

// ─── ChoiceGrid ────────────────────────────────────────────
function ChoiceGrid({ value, onChange, options, multi = false, cols = 2, hasError }) {
  const toggle = (id) => {
    if (multi) {
      const s = new Set(value || []);
      if (s.has(id)) s.delete(id); else s.add(id);
      onChange([...s]);
    } else {
      onChange(id);
    }
  };
  const isSel = (id) => multi ? (value || []).includes(id) : value === id;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10,
      borderRadius: 12,
      outline: hasError ? '1.5px solid #E23B4D' : 'none',
      padding: hasError ? 2 : 0,
    }}>
      {options.map(o => {
        const sel = isSel(o.id);
        return (
          <button key={o.id} onClick={() => toggle(o.id)} style={{
            padding: '14px 16px', borderRadius: 12,
            border: `1.5px solid ${sel ? L.c.blue : L.c.line}`,
            background: sel ? L.c.blueSoft : '#fff',
            textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', transition: 'all 0.12s',
          }}>
            {o.icon && (
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: sel ? '#fff' : L.c.bgWarm,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{o.icon}</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: L.c.ink }}>{o.label}</div>
              {o.sub && (
                <div style={{ fontSize: 12, color: L.c.inkSoft, marginTop: 2 }}>{o.sub}</div>
              )}
            </div>
            {sel && <LI.Check size={20} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── FileDrop ──────────────────────────────────────────────
function FileDrop({ label, hint, fileData, onFile, accept }) {
  const inputRef = React.useRef();
  const isImage = fileData && fileData.preview;

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => onFile({ name: file.name, preview: ev.target.result, file });
      reader.readAsDataURL(file);
    } else {
      onFile({ name: file.name, preview: null, file });
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: L.c.ink, marginBottom: 8 }}>
        {label} <span style={{ color: L.c.blue }}>*</span>
      </div>

      {/* Hidden real file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/jpeg,image/png,application/pdf'}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {fileData ? (
        /* ── File selected: show preview or filename ── */
        <div style={{
          border: `1.5px solid ${L.c.green}`,
          borderRadius: 12, background: L.c.greenSoft,
          overflow: 'hidden',
        }}>
          {isImage ? (
            <div style={{ position: 'relative' }}>
              <img
                src={fileData.preview}
                alt={fileData.name}
                style={{
                  width: '100%', maxHeight: 160, objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '8px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '75%',
                }}>{fileData.name}</span>
                <button onClick={handleRemove} style={{
                  background: 'rgba(255,255,255,0.25)', border: 'none',
                  borderRadius: 6, padding: '3px 8px',
                  fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}>Cambiar</button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 20,
              }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#0B6E4D',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{fileData.name}</div>
                <div style={{ fontSize: 11, color: L.c.inkSoft, marginTop: 2 }}>Archivo listo ✓</div>
              </div>
              <button onClick={handleRemove} style={{
                background: 'transparent', border: `1px solid ${L.c.green}`,
                borderRadius: 8, padding: '5px 10px',
                fontSize: 11, fontWeight: 700, color: '#0B6E4D', cursor: 'pointer',
                flexShrink: 0,
              }}>Cambiar</button>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty: show drop zone ── */
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          style={{
            width: '100%', padding: 20,
            border: `1.5px dashed ${L.c.lineStrong}`,
            borderRadius: 12, background: '#fff',
            display: 'flex', alignItems: 'center', gap: 14,
            textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: L.c.bgWarm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <LI.Doc size={22} color={L.c.inkSoft} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: L.c.ink }}>Seleccionar archivo</div>
            <div style={{ fontSize: 12, color: L.c.inkSoft, marginTop: 2 }}>{hint}</div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: L.c.blueSoft, color: L.c.blue,
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>Buscar</div>
        </button>
      )}
    </div>
  );
}

// ─── DateInput ──────────────────────────────────────────────
function DateInput({ value, onChange, hasError }) {
  const [showCal, setShowCal] = React.useState(false);
  const [calDate, setCalDate] = React.useState(() => {
    // Default calendar to 30 years ago — sensible for a DOB field
    const d = new Date();
    return { year: d.getFullYear() - 30, month: d.getMonth() };
  });

  // Sync calendar position when an external value arrives on first open
  const openCal = () => {
    const parts = (value || '').split('/');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (y >= 1900 && y <= new Date().getFullYear() && m >= 0 && m <= 11)
        setCalDate({ year: y, month: m });
    }
    setShowCal(true);
  };

  // Auto-format: strip non-digits, insert / after positions 2 and 4
  const handleType = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let fmt = digits;
    if (digits.length > 2) fmt = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length > 4) fmt = fmt.slice(0, 5) + '/' + digits.slice(4);
    onChange(fmt);
  };

  const parsedDate = React.useMemo(() => {
    const parts = (value || '').split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (y >= 1900 && m >= 0 && m <= 11 && d >= 1 && d <= 31)
        return { d, m, y };
    }
    return null;
  }, [value]);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCalDate(c => {
    let m = c.month - 1, y = c.year;
    if (m < 0) { m = 11; y--; }
    return { year: y, month: m };
  });
  const nextMonth = () => setCalDate(c => {
    let m = c.month + 1, y = c.year;
    if (m > 11) { m = 0; y++; }
    return { year: y, month: m };
  });

  const selectDay = (day) => {
    const d = String(day).padStart(2, '0');
    const m = String(calDate.month + 1).padStart(2, '0');
    onChange(`${d}/${m}/${calDate.year}`);
    setShowCal(false);
  };

  const today = new Date();
  const maxYear = today.getFullYear();
  const years = Array.from({ length: maxYear - 1939 }, (_, i) => maxYear - i);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  const borderColor = hasError ? '#E23B4D' : L.c.line;

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Input row ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        border: `1.5px solid ${borderColor}`, borderRadius: 12,
        background: '#fff', overflow: 'hidden', transition: 'border-color 0.15s',
      }}>
        <input
          type="text"
          value={value || ''}
          onChange={e => handleType(e.target.value)}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          style={{
            flex: 1, padding: '14px 16px', border: 'none', outline: 'none',
            fontSize: 15, color: L.c.ink, fontFamily: 'inherit',
            background: 'transparent', letterSpacing: 1,
          }}
        />
        <button
          type="button"
          onClick={() => showCal ? setShowCal(false) : openCal()}
          style={{
            padding: '0 14px', background: 'transparent', border: 'none',
            borderLeft: `1px solid ${L.c.line}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          <LI.Calendar size={20} color={showCal ? L.c.blue : L.c.inkSoft} />
        </button>
      </div>

      {/* ── Calendar popup ── */}
      {showCal && (
        <>
          {/* Invisible backdrop — closes calendar on outside click */}
          <div
            onClick={() => setShowCal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            zIndex: 100, background: '#fff',
            border: `1px solid ${L.c.line}`, borderRadius: 16,
            boxShadow: '0 12px 40px rgba(11,31,51,0.16)',
            padding: '16px', width: 280, minWidth: 0,
          }}>
            {/* Month / Year header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <button onClick={prevMonth} style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: L.c.bgWarm, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, color: L.c.ink, flexShrink: 0,
              }}>‹</button>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
                <select
                  value={calDate.month}
                  onChange={e => setCalDate(c => ({ ...c, month: parseInt(e.target.value) }))}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 13, fontWeight: 700, color: L.c.ink,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {monthNames.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
                </select>
                <select
                  value={calDate.year}
                  onChange={e => setCalDate(c => ({ ...c, year: parseInt(e.target.value) }))}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 13, fontWeight: 700, color: L.c.ink,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <button onClick={nextMonth} style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: L.c.bgWarm, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, color: L.c.ink, flexShrink: 0,
              }}>›</button>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
              {dayNames.map(dn => (
                <div key={dn} style={{
                  textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: L.c.inkMuted, paddingBottom: 4,
                }}>{dn}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: firstDay(calDate.year, calDate.month) }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth(calDate.year, calDate.month) }).map((_, i) => {
                const day = i + 1;
                const sel = parsedDate &&
                  parsedDate.d === day &&
                  parsedDate.m === calDate.month &&
                  parsedDate.y === calDate.year;
                const isFuture = new Date(calDate.year, calDate.month, day) > today;
                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && selectDay(day)}
                    style={{
                      padding: '6px 2px', borderRadius: 8, border: 'none',
                      background: sel ? L.c.blue : 'transparent',
                      color: sel ? '#fff' : isFuture ? L.c.inkMuted : L.c.ink,
                      fontSize: 13, fontWeight: sel ? 700 : 400,
                      cursor: isFuture ? 'default' : 'pointer',
                      textAlign: 'center', opacity: isFuture ? 0.3 : 1,
                    }}
                  >{day}</button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 0 — Datos personales ─────────────────────────────
function StepPersonal({ data, update, errors }) {
  const docLabel = data.docType === 'CE' ? 'CE' : 'DNI';
  const docHint = data.docType === 'CE'
    ? 'Número de Carnet de Extranjería (9–12 dígitos)'
    : '8 dígitos, sin espacios';
  const docPlaceholder = data.docType === 'CE' ? '000123456' : '45678901';

  return (
    <>
      <StepHeader step={0}
        title="Empecemos por lo básico."
        sub="Usaremos esta información para verificar tu identidad."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nombres" required error={errors.firstName}>
          <TextInput value={data.firstName || ''} onChange={v => update('firstName', v)}
            placeholder="María Alejandra" hasError={!!errors.firstName} />
        </Field>
        <Field label="Apellidos" required error={errors.lastName}>
          <TextInput value={data.lastName || ''} onChange={v => update('lastName', v)}
            placeholder="Quispe Huamán" hasError={!!errors.lastName} />
        </Field>
      </div>

      <Field label="Tipo de documento" required>
        <DocTypeSelect value={data.docType || 'DNI'} onChange={v => update('docType', v)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label={`Número de ${docLabel}`} required hint={docHint} error={errors.docNumber}>
          <TextInput value={data.docNumber || ''} onChange={v => update('docNumber', v)}
            placeholder={docPlaceholder} hasError={!!errors.docNumber} />
        </Field>
        <Field label="Fecha de nacimiento" required error={errors.birth}>
          <DateInput value={data.birth || ''} onChange={v => update('birth', v)}
            hasError={!!errors.birth} />
        </Field>
      </div>

      <Field label="Email" required hint="Te enviaremos actualizaciones de tu aplicación" error={errors.email}>
        <TextInput value={data.email || ''} onChange={v => update('email', v)}
          placeholder="dra.quispe@ejemplo.com" type="email" hasError={!!errors.email} />
      </Field>
      <Field label="Celular (WhatsApp)" required error={errors.phone}>
        <TextInput value={data.phone || ''} onChange={v => update('phone', v)}
          placeholder="999 123 456" prefix="+51" hasError={!!errors.phone} />
      </Field>
    </>
  );
}

// ─── Step 1 — Perfil profesional ───────────────────────────
function StepProfessional({ data, update, errors }) {
  const specialties = [
    'Medicina general', 'Pediatría', 'Medicina interna', 'Ginecología',
    'Geriatría', 'Traumatología', 'Dermatología', 'Cardiología',
    'Neumología', 'Endocrinología', 'Psiquiatría', 'Neurología', 'Otra',
  ];
  return (
    <>
      <StepHeader step={1}
        title="Cuéntanos de tu carrera."
        sub="Validaremos tu CMP directamente con el Colegio Médico del Perú."
      />
      <Field label="Número de CMP" required hint="5 o 6 dígitos" error={errors.cmp}>
        <TextInput value={data.cmp || ''} onChange={v => update('cmp', v)}
          placeholder="123456" prefix="CMP" hasError={!!errors.cmp} />
      </Field>
      <Field label="Especialidad principal" required error={errors.specialty}>
        <Select value={data.specialty || ''} onChange={v => { update('specialty', v); if (v !== 'Otra') update('specialtyOther', ''); }}
          options={specialties} hasError={!!errors.specialty} />
      </Field>
      {data.specialty === 'Otra' && (
        <Field label="Especifique especialidad" required error={errors.specialtyOther}>
          <TextInput value={data.specialtyOther || ''} onChange={v => update('specialtyOther', v)}
            placeholder="Ej. Medicina Deportiva" hasError={!!errors.specialtyOther} />
        </Field>
      )}
      <Field label="Sub-especialidad (opcional)">
        <TextInput value={data.subSpecialty || ''} onChange={v => update('subSpecialty', v)}
          placeholder="Ej. Pediatría neonatal" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Años de experiencia" required hint="Ingresa un número entre 0 y 60" error={errors.experience}>
          <TextInput
            value={data.experience || ''}
            onChange={v => {
              // Allow only digits
              const clean = v.replace(/[^0-9]/g, '');
              update('experience', clean);
            }}
            placeholder="Ej. 5"
            type="text"
            hasError={!!errors.experience}
          />
        </Field>
        <Field label="Universidad" required error={errors.university}>
          <TextInput value={data.university || ''} onChange={v => update('university', v)}
            placeholder="Ej. UNMSM" hasError={!!errors.university} />
        </Field>
      </div>

      <Field label="Resumen profesional / Biografía" hint="Cuéntanos un poco sobre tu trayectoria y por qué quieres unirte a Doctor House.">
        <TextArea
          value={data.bio || ''}
          onChange={v => update('bio', v)}
          placeholder="Ej: Soy médico con pasión por la atención domiciliaria y 10 años de experiencia en medicina interna..."
        />
      </Field>
    </>
  );
}

// ─── Step 2 — Documentos ───────────────────────────────────
function StepDocs({ data, update }) {
  return (
    <>
      <StepHeader step={2}
        title="Sube tus documentos."
        sub="Archivos claros y legibles. JPG, PNG o PDF hasta 10 MB."
      />
      <div style={{
        padding: 16, borderRadius: 12,
        background: L.c.amberSoft, border: `1px solid ${L.c.amber}`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        marginBottom: 24, fontSize: 13, color: '#8A5A0D', lineHeight: 1.5,
      }}>
        <LI.Shield size={20} color={L.c.amber} />
        <span><b>Tus documentos son privados</b> — solo los usa el equipo de verificación de Doctor House. Cumplimos con la Ley de Protección de Datos del Perú (Ley 29733).</span>
      </div>

      <FileDrop label={`${data.docType || 'DNI'} — frente`} hint="Asegúrate de que el número sea legible"
        fileData={data.docDniFront} onFile={v => update('docDniFront', v)} />
      <FileDrop label={`${data.docType || 'DNI'} — reverso`} hint="Incluye la dirección y fecha de emisión"
        fileData={data.docDniBack} onFile={v => update('docDniBack', v)} />
      <FileDrop label="Carné del CMP" hint="Vigente, con foto visible"
        fileData={data.docCmp} onFile={v => update('docCmp', v)} />
      <FileDrop label="Foto profesional" hint="JPG o PNG, con bata o vestimenta formal."
        fileData={data.docPhoto} onFile={v => update('docPhoto', v)} accept="image/jpeg,image/png" />
      <FileDrop label="Resumen de CV (PDF)" hint="Máximo 2 páginas"
        fileData={data.docCv} onFile={v => update('docCv', v)} accept="application/pdf" />
    </>
  );
}

// ─── Step 3 — Preferencias de trabajo ─────────────────────
function StepWork({ data, update, errors }) {
  const departments = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
    'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
    'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
    'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
    'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
  ];
  const slots = [
    { id: 'morning', label: 'Mañanas', sub: '6 am – 12 pm' },
    { id: 'afternoon', label: 'Tardes', sub: '12 pm – 6 pm' },
    { id: 'evening', label: 'Noches', sub: '6 pm – 11 pm' },
    { id: 'overnight', label: 'Madrugadas', sub: '11 pm – 6 am · tarifa +30%' },
  ];

  return (
    <>
      <StepHeader step={3}
        title="¿Cómo prefieres trabajar?"
        sub="Configura tu ciudad base y tus horarios. El radio de atención lo ajustas en la app."
      />

      {/* ── Info card GPS ── */}
      <div style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #1863E0 0%, #0F4AB5 100%)',
        padding: '20px 22px', marginBottom: 28, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>📍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              Atención por radio GPS — sin zonas fijas
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.65, opacity: 0.93 }}>
              Una vez activo en la app, configuras tu <b>radio de atención</b>
              (10 km, 20 km, etc.). Los pacientes dentro de ese radio desde tu
              ubicación GPS podrán solicitarte en tiempo real. Tú decides cuándo
              estás disponible con un simple botón <b>Activar / Desactivar</b>.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {['10 km', '15 km', '20 km', '30 km', 'Configurable en la app'].map(r => (
                <div key={r} style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.22)',
                  fontSize: 12, fontWeight: 700,
                }}>{r}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Departamento base ── */}
      <Field
        label="Departamento de operaciones"
        required
        hint="¿En qué departamento vas a atender principalmente? Puedes cambiarlo en la app cuando quieras."
        error={errors.city}
      >
        <Select
          value={data.city || ''}
          onChange={v => update('city', v)}
          options={departments}
          hasError={!!errors.city}
        />
      </Field>

      {/* ── Horarios ── */}
      <Field label="Horarios preferidos" required error={errors.slots}>
        <ChoiceGrid
          value={data.slots}
          onChange={v => update('slots', v)}
          options={slots} multi cols={2}
          hasError={!!errors.slots}
        />
      </Field>

      {/* ── Movilidad ── */}
      <Field label="¿Tienes movilidad propia?" required error={errors.mobility}>
        <ChoiceGrid
          value={data.mobility}
          onChange={v => update('mobility', v)}
          cols={3}
          hasError={!!errors.mobility}
          options={[
            { id: 'car', label: 'Auto propio' },
            { id: 'moto', label: 'Moto' },
            { id: 'none', label: 'Taxi / app' },
          ]}
        />
      </Field>
    </>
  );
}

// ─── Step 4 — Pagos ────────────────────────────────────────
function StepPayment({ data, update, errors }) {
  return (
    <>
      <StepHeader step={4}
        title="¿Cómo te pagamos?"
        sub="Los pagos se procesan todos los viernes. Puedes usar Yape o cuenta bancaria."
      />
      <Field label="Método preferido" required error={errors.payMethod}>
        <ChoiceGrid
          value={data.payMethod}
          onChange={v => update('payMethod', v)}
          cols={2}
          hasError={!!errors.payMethod}
          options={[
            { id: 'yape', label: 'Yape', sub: 'Pago inmediato al celular' },
            { id: 'cci', label: 'Cuenta bancaria (CCI)', sub: 'Transferencia interbancaria' },
          ]}
        />
      </Field>
      {data.payMethod === 'yape' && (
        <Field label="Celular Yape" required hint="Debe estar registrado con tu nombre en el BCP" error={errors.yapePhone}>
          <TextInput value={data.yapePhone || ''} onChange={v => update('yapePhone', v)}
            placeholder="999 123 456" prefix="+51" hasError={!!errors.yapePhone} />
        </Field>
      )}
      {data.payMethod === 'cci' && (
        <>
          <Field label="Banco" required error={errors.bank}>
            <Select value={data.bank || ''} onChange={v => { update('bank', v); if (v !== 'Otro') update('bankName', ''); }}
              options={['BCP', 'BBVA', 'Interbank', 'Scotiabank', 'BanBif', 'Pichincha', 'Otro']}
              hasError={!!errors.bank} />
          </Field>
          {data.bank === 'Otro' && (
            <Field label="Nombre del banco" required error={errors.bankName}>
              <TextInput value={data.bankName || ''} onChange={v => update('bankName', v)}
                placeholder="Ej. Banco de la Nación" hasError={!!errors.bankName} />
            </Field>
          )}
          <Field label="Número CCI" required hint="20 dígitos, lo encuentras en tu app del banco" error={errors.cci}>
            <TextInput value={data.cci || ''} onChange={v => update('cci', v.replace(/\D/g, ''))}
              placeholder="00212345678901234567" hasError={!!errors.cci} />
          </Field>
        </>
      )}
      <div style={{
        padding: 16, borderRadius: 12, background: L.c.blueSoft,
        display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 24,
      }}>
        <LI.Wallet size={20} color={L.c.blue} />
        <div style={{ fontSize: 13, color: L.c.blueDark, lineHeight: 1.5 }}>
          <b>Comisión: 18% por visita.</b> Cubre el seguro, soporte 24/7, procesamiento de pagos
          y marketing. Tu neto se calcula y se muestra claramente en cada visita.
        </div>
      </div>
    </>
  );
}

// ─── Step 5 — Revisión ─────────────────────────────────────
function StepReview({ data, update, onEdit, errors }) {
  const row = (label, value, step) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: `1px solid ${L.c.line}`, gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: L.c.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: L.c.ink, marginTop: 3, wordBreak: 'break-word' }}>{value || '—'}</div>
      </div>
      <button onClick={() => onEdit(step)} style={{
        padding: '6px 12px', borderRadius: 8,
        border: `1px solid ${L.c.line}`, background: '#fff',
        fontSize: 12, fontWeight: 700, color: L.c.blue, cursor: 'pointer',
      }}>Editar</button>
    </div>
  );

  const docsCount = ['docDniFront', 'docDniBack', 'docCmp', 'docPhoto', 'docCv'].filter(k => data[k] != null).length;
  const docLabel = data.docType === 'CE' ? 'CE' : 'DNI';

  return (
    <>
      <StepHeader step={5}
        title="Revisa y envía."
        sub="Revisaremos tu aplicación en 48 h hábiles. Te avisamos por WhatsApp y email."
      />

      <div style={{
        padding: 24, borderRadius: 20, background: '#fff',
        border: `1px solid ${L.c.line}`,
      }}>
        {row('Nombre', `${data.firstName || ''} ${data.lastName || ''}`.trim(), 0)}
        {row(`Tipo · Número de ${docLabel}`, `${data.docType || 'DNI'} · ${data.docNumber || '—'}`, 0)}
        {row('Email · Celular', `${data.email || ''} · +51 ${data.phone || ''}`, 0)}
        {row('CMP · Especialidad', `CMP ${data.cmp || '—'} · ${data.specialty === 'Otra' ? data.specialtyOther || 'Otra' : data.specialty || '—'}`, 1)}
        {row('Experiencia · Universidad', `${data.experience || '—'} años · ${data.university || '—'}`, 1)}
        {row('Biografía', data.bio ? (data.bio.length > 50 ? data.bio.slice(0, 50) + '...' : data.bio) : 'No proporcionada', 1)}
        {row('Documentos', `${docsCount} de 5 subidos`, 2)}
        {row('Departamento · Horarios', `${data.city || '—'} · ${(data.slots || []).length} horarios`, 3)}
        {row('Pagos',
          data.payMethod === 'yape'
            ? `Yape · +51 ${data.yapePhone || ''}`
            : data.payMethod === 'cci'
              ? `${data.bank === 'Otro' ? data.bankName || 'Otro' : data.bank || ''} · CCI ${data.cci ? '···· ' + data.cci.slice(-4) : '—'}`
              : '—',
          4
        )}
      </div>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        marginTop: 24, fontSize: 14, color: L.c.inkSoft, lineHeight: 1.55,
        cursor: 'pointer',
      }}>
        <input type="checkbox" checked={data.terms || false}
          onChange={e => update('terms', e.target.checked)}
          style={{ marginTop: 3, width: 18, height: 18, accentColor: L.c.blue, flexShrink: 0 }} />
        <span>
          Acepto los <a style={{ color: L.c.blue, fontWeight: 700 }}>Términos de uso</a>,
          la <a style={{ color: L.c.blue, fontWeight: 700 }}>Política de privacidad</a>,
          y autorizo la verificación de mi CMP y antecedentes.
        </span>
      </label>
      {errors.terms && (
        <div style={{ fontSize: 12, color: '#E23B4D', marginTop: 8, fontWeight: 600 }}>⚠ {errors.terms}</div>
      )}
    </>
  );
}

// ─── Success screen ─────────────────────────────────────────
function SubmittedScreen({ email }) {
  return (
    <div style={{
      padding: '60px 40px', textAlign: 'center',
      animation: 'dhFade 0.5s ease-out',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: L.c.greenSoft,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, animation: 'dhCheck 0.5s ease-out',
      }}>
        <LI.Check size={56} color={L.c.green} />
      </div>
      <h1 style={{
        fontFamily: L.f.sans, fontSize: 36, fontWeight: 800,
        color: L.c.ink, letterSpacing: -1, lineHeight: 1.15,
        margin: 0,
      }}>¡Aplicación enviada!</h1>
      <p style={{
        fontSize: 17, color: L.c.inkSoft, lineHeight: 1.55,
        marginTop: 16, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto',
      }}>
        Tu aplicación está siendo revisada. Te escribiremos a <b>{email}</b>{' '}
        en las próximas <b>48 horas hábiles</b>.
      </p>

      <div style={{
        marginTop: 40, padding: 28, borderRadius: 20,
        background: '#fff', border: `1px solid ${L.c.line}`,
        maxWidth: 460, margin: '40px auto 0',
        textAlign: 'left',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: L.c.inkMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Próximos pasos
        </div>
        {[
          { t: 'Verificación de CMP', s: '24 h · Consultamos con el Colegio Médico' },
          { t: 'Verificación de documento y antecedentes', s: '24–48 h · RENIEC y registro judicial' },
          { t: 'Decisión final', s: 'Te avisamos por WhatsApp y email' },
          { t: 'Descarga la app y activa tu cuenta', s: 'Recibirás un link personalizado' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '12px 0', borderBottom: i < 3 ? `1px solid ${L.c.line}` : 'none',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: L.c.blueSoft, color: L.c.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: L.c.ink }}>{s.t}</div>
              <div style={{ fontSize: 13, color: L.c.inkSoft, marginTop: 2 }}>{s.s}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => window.location.href = '/'} style={{
        marginTop: 32, padding: '14px 28px',
        background: 'transparent', border: 'none',
        fontSize: 14, fontWeight: 700, color: L.c.blue, cursor: 'pointer',
      }}>← Volver al inicio</button>
    </div>
  );
}

// ─── Validation ────────────────────────────────────────────
function validateStep(step, data) {
  const e = {};

  if (step === 0) {
    if (!data.firstName || !data.firstName.trim()) e.firstName = 'Ingresa tus nombres.';
    if (!data.lastName || !data.lastName.trim()) e.lastName = 'Ingresa tus apellidos.';
    if (data.docType === 'DNI') {
      if (!data.docNumber || !/^\d{8}$/.test(data.docNumber.trim()))
        e.docNumber = 'El DNI debe tener exactamente 8 dígitos.';
    } else {
      if (!data.docNumber || !/^\d{9,12}$/.test(data.docNumber.trim()))
        e.docNumber = 'El CE debe tener entre 9 y 12 dígitos.';
    }
    if (!data.birth || !data.birth.trim()) e.birth = 'Ingresa tu fecha de nacimiento.';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
      e.email = 'Ingresa un email válido.';
    const phone = (data.phone || '').replace(/\s/g, '');
    if (!phone || phone.length < 9) e.phone = 'El celular debe tener 9 dígitos.';
  }

  if (step === 1) {
    if (!data.cmp || !data.cmp.trim()) e.cmp = 'Ingresa tu número de CMP.';
    if (!data.specialty) e.specialty = 'Selecciona una especialidad.';
    if (data.specialty === 'Otra' && !(data.specialtyOther || '').trim())
      e.specialtyOther = 'Especifique su especialidad.';
    const exp = parseInt(data.experience, 10);
    if (data.experience === '' || data.experience == null || isNaN(exp) || exp < 0 || exp > 60)
      e.experience = 'Ingresa los años de experiencia (0 – 60).';
    if (!data.university || !data.university.trim()) e.university = 'Ingresa tu universidad.';
  }

  // Step 2 (docs) — optional, skip validation
  // Step 3
  if (step === 3) {
    if (!data.city) e.city = 'Selecciona tu ciudad principal.';
    if (!data.slots || data.slots.length === 0) e.slots = 'Selecciona al menos un horario.';
    if (!data.mobility) e.mobility = 'Indica cómo te desplazas.';
  }

  // Step 4
  if (step === 4) {
    if (!data.payMethod) e.payMethod = 'Selecciona un método de pago.';
    if (data.payMethod === 'yape') {
      const yp = (data.yapePhone || '').replace(/\s/g, '');
      if (!yp || yp.length < 9) e.yapePhone = 'Ingresa tu número Yape (9 dígitos).';
    }
    if (data.payMethod === 'cci') {
      if (!data.bank) e.bank = 'Selecciona tu banco.';
      if (data.bank === 'Otro' && !(data.bankName || '').trim())
        e.bankName = 'Ingresa el nombre del banco.';
      const cci = (data.cci || '').replace(/\D/g, '');
      if (cci.length !== 20) e.cci = 'El CCI debe tener exactamente 20 dígitos.';
    }
  }

  // Step 5
  if (step === 5) {
    if (!data.terms) e.terms = 'Debes aceptar los términos para continuar.';
  }

  return e; // empty object = valid
}

// ─── Main ──────────────────────────────────────────────────
function ApplyForm() {
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const [data, setData] = React.useState({
    // Step 0
    firstName: '', lastName: '',
    docType: 'DNI', docNumber: '',
    birth: '', email: '', phone: '',
    // Step 1
    cmp: '', specialty: '', specialtyOther: '', subSpecialty: '', experience: '', university: '', bio: '',
    // Step 2
    docDniFront: null, docDniBack: null, docCmp: null, docPhoto: null, docCv: null,
    // Step 3
    city: '', slots: [], mobility: '',
    // Step 4
    payMethod: '', yapePhone: '', bank: '', bankName: '', cci: '',
    // Step 5
    terms: false,
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/apply/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Error al subir archivo');
    return await res.json();
  };

  const uploadAllDocs = async () => {
    const keys = ['docDniFront', 'docDniBack', 'docCmp', 'docPhoto', 'docCv'];
    const toUpload = keys.filter(k => data[k] && data[k].file && !data[k].url);
    if (toUpload.length === 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const results = await Promise.all(toUpload.map(k => uploadFile(data[k].file)));
      setData(prev => {
        const next = { ...prev };
        toUpload.forEach((k, i) => {
          next[k] = { ...prev[k], url: results[i].url };
        });
        return next;
      });
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Hubo un problema subiendo tus documentos. Intenta nuevamente.');
      setSubmitting(false);
      throw err;
    }
  };

  const tryAdvance = async () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      if (step === 2) {
        try {
          await uploadAllDocs();
        } catch (err) {
          console.error(err);
          return;
        }
      }
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const e = validateStep(5, data);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email.trim(),
          phone: '+51' + data.phone.replace(/\s/g, ''),
          specialty: data.specialty === 'Otra' ? data.specialtyOther : data.specialty,
          cmp_license: data.cmp.trim(),
          experience_years: parseInt(data.experience, 10) || 0,
          university: data.university.trim() || null,
          districts: data.city ? [data.city] : [],
          bio: data.bio || null,
          dni_number: data.docNumber,
          birth_date: data.birth,
          sub_specialty: data.subSpecialty || null,
          work_slots: data.slots || [],
          mobility_type: data.mobility,
          payment_method: data.payMethod,
          payment_data: data.payMethod === 'yape' ? { yapePhone: data.yapePhone } : { bank: data.bank, bankName: data.bankName, cci: data.cci },
          documents: {
            dni_front: data.docDniFront?.url,
            dni_back: data.docDniBack?.url,
            cmp: data.docCmp?.url,
            photo: data.docPhoto?.url,
            cv: data.docCv?.url,
          }
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = res.status === 409
          ? 'Ya existe una solicitud con este email o número de CMP.'
          : json.error || json.errors?.[0]?.msg || 'Error al enviar. Intenta nuevamente.';
        setSubmitError(msg);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError('Sin conexión. Verifica tu internet e intenta nuevamente.');
      setSubmitting(false);
    }
  };

  const StepComp = [StepPersonal, StepProfessional, StepDocs, StepWork, StepPayment, StepReview][step];
  const exitUrl = '/';

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: L.c.bgWarm }}>
      <TopBar step={5} onExit={() => window.location.href = exitUrl} />
      <Container max={760}>
        <SubmittedScreen email={data.email} />
      </Container>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: L.c.bgWarm, paddingBottom: 40 }}>
      <TopBar step={step} onExit={() => {
        if (confirm('¿Salir del formulario? Perderás lo que no hayas enviado.')) {
          window.location.href = exitUrl;
        }
      }} />

      <Container max={680} style={{ paddingTop: 48, paddingBottom: 24 }}>
        <div style={{ animation: 'dhFade 0.3s ease-out' }} key={step}>
          <StepComp data={data} update={update} errors={errors} onEdit={s => { setErrors({}); setStep(s); }} />
        </div>

        {submitError && (
          <div style={{
            marginTop: 16, padding: '14px 18px', borderRadius: 12,
            background: '#FEE9EB', border: '1px solid #F5A0A8',
            fontSize: 14, color: '#C0243A', fontWeight: 600,
          }}>⚠ {submitError}</div>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 40, paddingTop: 24, borderTop: `1px solid ${L.c.line}`,
          gap: 16,
        }}>
          <button
            onClick={() => { setErrors({}); setStep(s => Math.max(0, s - 1)); }}
            disabled={step === 0}
            style={{
              padding: '14px 24px', borderRadius: 12,
              border: `1.5px solid ${L.c.line}`,
              background: '#fff', color: step === 0 ? L.c.inkMuted : L.c.ink,
              fontSize: 14, fontWeight: 700,
              opacity: step === 0 ? 0.5 : 1,
              cursor: step === 0 ? 'default' : 'pointer',
            }}
          >← Atrás</button>

          {step < STEPS.length - 1 ? (
            <PrimaryCta size="md" onClick={tryAdvance} disabled={submitting}>
              {submitting ? 'Cargando…' : <>Continuar <LI.Arrow /></>}
            </PrimaryCta>
          ) : (
            <PrimaryCta size="md" glow onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enviando…' : <><span>Enviar aplicación</span> <LI.Arrow /></>}
            </PrimaryCta>
          )}
        </div>
      </Container>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ApplyForm />);
