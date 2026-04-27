// views/doctores.jsx
function DoctorsView({ token }) {
  const T = useT();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('all');
  const [selected, setSelected] = useState(null);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/admin/applications', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setApps(d.rows || d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const counts = apps.reduce((a, x) => ({ ...a, [x.status]:(a[x.status]||0)+1 }), {});

  const filtered = apps.filter(a => {
    if (tab !== 'all' && a.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (a.name||'').toLowerCase().includes(q)
          || (a.specialty||'').toLowerCase().includes(q)
          || (a.cmp_license||'').toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = [
    { value:'all',      label:'Todos',     count:apps.length },
    { value:'approved', label:'Aprobados', count:counts.approved||0 },
    { value:'pending',  label:'Pendientes', count:counts.pending||0 },
    { value:'rejected', label:'Rechazados', count:counts.rejected||0 },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:14 }}>
        <StatTile label="Total registrados" value={apps.length}
          color={T.accent} soft={T.accentSoft} icon={<Ic.Users />} />
        <StatTile label="Aprobados"  value={counts.approved||0}
          color={T.green}  soft={T.greenSoft}  icon={<Ic.Check />} />
        <StatTile label="Pendientes" value={counts.pending||0}
          color={T.amber}  soft={T.amberSoft}  icon={<Ic.AlertCircle />} />
        <StatTile label="Rechazados" value={counts.rejected||0}
          color={T.red}    soft={T.redSoft}    icon={<Ic.X />} />
      </div>

      {/* Filters row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:12 }}>
        <TabBar tabs={tabs} active={tab} onChange={t => { setTab(t); setSelected(null); }} />
        <input placeholder="Buscar por nombre, especialidad o CMP…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'9px 14px', borderRadius:9, border:`1px solid ${T.border}`,
            background:T.bgInput, color:T.ink, fontSize:13, outline:'none', width:280 }} />
      </div>

      {/* Table + detail panel */}
      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 360px':'1fr', gap:18 }}>
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                  {['MÉDICO','ESPECIALIDAD','CMP','UNIVERSIDAD','REGISTRO','ESTADO',''].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10,
                      fontWeight:700, letterSpacing:0.5, color:T.inkMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding:36, textAlign:'center', color:T.inkMuted }}>
                    Cargando...
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:36, textAlign:'center', color:T.inkMuted }}>
                    No hay registros.
                  </td></tr>
                )}
                {filtered.map(a => (
                  <HoverRow key={a.id}
                    style={{ borderBottom:`1px solid ${T.border}`, cursor:'pointer',
                      background:selected?.id===a.id ? T.bgActive : undefined }}
                    onClick={() => setSelected(selected?.id===a.id ? null : a)}>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%',
                          background:T.accentSoft, color:T.accent, flexShrink:0,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:800 }}>
                          {(a.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ fontWeight:700, color:T.ink }}>{a.name}</div>
                      </div>
                    </td>
                    <td style={{ padding:'13px 14px', color:T.inkSoft, fontSize:13 }}>{a.specialty||'—'}</td>
                    <td style={{ padding:'13px 14px', color:T.inkSoft, fontSize:12, fontFamily:'monospace' }}>{a.cmp_license||'—'}</td>
                    <td style={{ padding:'13px 14px', color:T.inkSoft, fontSize:13 }}>{a.university||'—'}</td>
                    <td style={{ padding:'13px 14px', fontSize:12, color:T.inkMuted, whiteSpace:'nowrap' }}>
                      {fmtDateShort(a.created_at)}
                    </td>
                    <td style={{ padding:'13px 14px' }}><AppStatusBadge status={a.status} /></td>
                    <td style={{ padding:'13px 14px', textAlign:'right' }}>
                      <button onClick={e => { e.stopPropagation(); setSelected(selected?.id===a.id?null:a); }}
                        style={{ background:T.accentSoft, border:`1px solid ${T.accent}33`,
                          color:T.accent, borderRadius:7, padding:'5px 10px',
                          fontSize:12, cursor:'pointer', fontWeight:700 }}>
                        {selected?.id===a.id ? 'Cerrar' : 'Ver perfil'}
                      </button>
                    </td>
                  </HoverRow>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Profile detail */}
        {selected && (
          <Card style={{ padding:22, position:'sticky', top:20, alignSelf:'start' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.ink }}>Perfil del médico</div>
              <button onClick={() => setSelected(null)}
                style={{ background:T.bgHover, border:`1px solid ${T.border}`,
                  borderRadius:7, padding:'5px 8px', color:T.inkSoft, cursor:'pointer' }}>
                <Ic.X />
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:'50%',
                background:`linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:800 }}>
                {(selected.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:T.ink }}>{selected.name}</div>
                <div style={{ fontSize:12, color:T.inkSoft, marginTop:2 }}>{selected.specialty}</div>
                <div style={{ marginTop:6 }}><AppStatusBadge status={selected.status} /></div>
              </div>
            </div>
            <Divider />
            <InfoRow label="CMP"                value={selected.cmp_license} />
            <InfoRow label="Universidad"        value={selected.university} />
            <InfoRow label="Fecha de registro"  value={fmtDate(selected.created_at)} />
            {selected.documents && Object.keys(selected.documents).length > 0 && (
              <div style={{ marginTop:12 }}>
                <SectionLabel>Documentación</SectionLabel>
                {Object.entries(selected.documents).map(([k,v]) => (
                  <a key={k} href={v} target="_blank" style={{ display:'flex', alignItems:'center',
                    gap:8, padding:'9px 12px', borderRadius:8, background:T.bgInput,
                    border:`1px solid ${T.border}`, textDecoration:'none',
                    color:T.inkSoft, fontSize:12, fontWeight:600, marginBottom:6 }}>
                    📂 {k.replace(/_/g,' ').toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
