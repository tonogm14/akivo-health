// views/aplicaciones.jsx
function ApplicationsView({ token }) {
  const T = useT();
  const [apps, setApps]         = useState([]);
  const [daily, setDaily]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/admin/applications${filterDate ? `?dateFrom=${filterDate}` : ''}`;
      const res = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        const rows = d.rows || d;
        setApps(rows);
        if (d.daily) setDaily(d.daily);

        // Check for ?id= in URL to auto-select
        const qId = new URLSearchParams(window.location.search).get('id');
        if (qId) {
           const found = rows.find(a => String(a.id) === qId);
           if (found) setSelected(found);
        }
      }
    } catch {} finally { setLoading(false); }
  }, [token, filterDate]);

  useEffect(() => { load(); }, [filterDate, token]);

  const handleAction = async (id, action) => {
    if (!confirm(`¿Confirmar ${action === 'approve' ? 'APROBACIÓN' : 'RECHAZO'}?`)) return;
    const res = await fetch(`/admin/applications/${id}/${action}`,
      { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
    if (res.ok) { setSelected(null); load(); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Daily tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:12 }}>
        {[
          { label:'Nuevos hoy',     value:daily?.new_today||0,      color:T.accent, soft:T.accentSoft },
          { label:'Aprobados hoy',  value:daily?.approved_today||0, color:T.green,  soft:T.greenSoft },
          { label:'Rechazados hoy', value:daily?.rejected_today||0, color:T.red,    soft:T.redSoft },
        ].map((it,i) => (
          <div key={i} style={{ background:it.soft, borderRadius:11, padding:'14px 18px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.inkSoft, textTransform:'uppercase',
              letterSpacing:0.5, marginBottom:5 }}>{it.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:it.color }}>{it.value}</div>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
          <div style={{ width:'100%' }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.inkMuted, letterSpacing:0.5,
              textTransform:'uppercase', marginBottom:5 }}>Filtrar fecha</div>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', borderRadius:9,
                border:`1px solid ${T.border}`, background:T.bgInput,
                color:T.ink, fontSize:13, outline:'none' }} />
          </div>
        </div>
      </div>

      {/* Table + detail panel */}
      <div style={{ display:'grid', gridTemplateColumns:selected ? '1fr 380px' : '1fr', gap:18 }}>
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontSize:16, fontWeight:800, color:T.ink }}>Solicitudes de candidatos</div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['MÉDICO / ESPECIALIDAD','REGISTRO','ESTADO',''].map(h => (
                  <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10,
                    fontWeight:700, letterSpacing:0.5, color:T.inkMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ padding:36, textAlign:'center', color:T.inkMuted }}>
                  Cargando...
                </td></tr>
              )}
              {apps.map(a => (
                <HoverRow key={a.id}
                  style={{ borderBottom:`1px solid ${T.border}`, cursor:'pointer',
                    background:selected?.id===a.id ? T.bgActive : undefined }}
                  onClick={() => setSelected(selected?.id===a.id ? null : a)}>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ fontWeight:700, color:T.ink }}>{a.name}</div>
                    <div style={{ fontSize:12, color:T.inkSoft, marginTop:1 }}>{a.specialty}</div>
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:T.inkMuted }}>
                    {fmtDateShort(a.created_at)}
                  </td>
                  <td style={{ padding:'13px 16px' }}><AppStatusBadge status={a.status} /></td>
                  <td style={{ padding:'13px 16px', textAlign:'right' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(selected?.id===a.id?null:a); }}
                      style={{ background:T.accentSoft, border:`1px solid ${T.accent}33`,
                        color:T.accent, borderRadius:7, padding:'5px 11px',
                        fontSize:12, cursor:'pointer', fontWeight:700 }}>
                      {selected?.id===a.id ? 'Cerrar' : 'Detalle'}
                    </button>
                  </td>
                </HoverRow>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card style={{ padding:22, position:'sticky', top:20, alignSelf:'start' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
              <div>
                <SectionLabel>Revisión de perfil</SectionLabel>
                <div style={{ fontSize:17, fontWeight:800, color:T.ink }}>{selected.name}</div>
                <div style={{ marginTop:6 }}><AppStatusBadge status={selected.status} /></div>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background:T.bgHover, border:`1px solid ${T.border}`,
                  borderRadius:8, padding:'5px 8px', color:T.inkSoft, cursor:'pointer' }}>
                <Ic.X />
              </button>
            </div>
            <Divider />
            <InfoRow label="Especialidad" value={selected.specialty} />
            <InfoRow label="CMP" value={selected.cmp_license} />
            <InfoRow label="Universidad" value={selected.university} />
            <InfoRow label="Fecha de registro" value={fmtDate(selected.created_at)} />
            {selected.documents && Object.keys(selected.documents).length > 0 && (
              <div style={{ marginTop:14 }}>
                <SectionLabel>Documentación</SectionLabel>
                {Object.entries(selected.documents).map(([k,v]) => (
                  <a key={k} href={v} target="_blank" style={{ display:'block', padding:'9px 12px',
                    borderRadius:8, background:T.bgInput, border:`1px solid ${T.border}`,
                    textDecoration:'none', color:T.inkSoft, fontSize:12, fontWeight:600, marginBottom:6 }}>
                    📂 {k.replace(/_/g,' ').toUpperCase()}
                  </a>
                ))}
              </div>
            )}
            {selected.status === 'pending' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:18 }}>
                <button onClick={() => handleAction(selected.id, 'reject')}
                  style={{ padding:11, borderRadius:9, border:`1px solid ${T.red}`,
                    background:T.redSoft, color:T.red, fontWeight:700, cursor:'pointer', fontSize:13 }}>
                  Rechazar
                </button>
                <button onClick={() => handleAction(selected.id, 'approve')}
                  style={{ padding:11, borderRadius:9, border:'none',
                    background:T.green, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                  Aprobar
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
