// views/inicio.jsx
function OverviewView({ token }) {
  const T = useT();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/stats', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ padding:60, textAlign:'center', color:useT().inkMuted }}>Cargando...</div>
  );

  const maxVisits = Math.max(...(stats?.growth||[]).map(g => parseInt(g.visits)||0), 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Finance tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:14 }}>
        <StatTile label="Cobro total"   value={`S/ ${(stats?.finance?.total_billed||0).toFixed(2)}`}  color={T.green}  soft={T.greenSoft}  icon={<Ic.TrendingUp />} />
        <StatTile label="Comisiones"    value={`S/ ${(stats?.finance?.commissions||0).toFixed(2)}`}   color={T.accent} soft={T.accentSoft} icon={<Ic.CreditCard />} />
        <StatTile label="Ganancia neta" value={`S/ ${(stats?.finance?.profit||0).toFixed(2)}`}        color={T.purple} soft={T.purpleSoft} icon={<Ic.TrendingUp />} />
        <StatTile label="Visitas 7 días" value={stats?.growth?.reduce((a,b)=>a+parseInt(b.visits||0),0)||0}
          color={T.amber} soft={T.amberSoft} icon={<Ic.Activity />} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* Bar chart */}
        <Card>
          <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:20 }}>
            Actividad — últimos 7 días
          </div>
          <div style={{ height:160, display:'flex', alignItems:'flex-end', gap:10 }}>
            {(stats?.growth||[]).map((g,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.accent }}>
                  {parseInt(g.visits||0)||''}
                </div>
                <div style={{ width:'100%', borderRadius:'5px 5px 0 0',
                  background:`linear-gradient(to top, ${T.accent}, ${T.accent}88)`,
                  height:`${(parseInt(g.visits)||0)/maxVisits*100}%`, minHeight:3 }} />
                <div style={{ fontSize:10, color:T.inkMuted }}>{g.date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Today candidates */}
        <Card>
          <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:16 }}>
            Candidatos hoy
          </div>
          {[
            { label:'Nuevos',     value:stats?.daily?.new_today||0,      color:T.accent, soft:T.accentSoft },
            { label:'Aprobados',  value:stats?.daily?.approved_today||0, color:T.green,  soft:T.greenSoft },
            { label:'Rechazados', value:stats?.daily?.rejected_today||0, color:T.red,    soft:T.redSoft },
          ].map((it,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 14px', borderRadius:10, background:it.soft, marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:T.ink }}>{it.label}</span>
              <span style={{ fontSize:22, fontWeight:800, color:it.color }}>{it.value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Applications summary */}
      <Card>
        <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:16 }}>
          Estado de solicitudes
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { label:'Pendientes', value:stats?.applications?.pending||0,  color:T.amber, soft:T.amberSoft },
            { label:'Aprobadas',  value:stats?.applications?.approved||0, color:T.green, soft:T.greenSoft },
            { label:'Rechazadas', value:stats?.applications?.rejected||0, color:T.red,   soft:T.redSoft },
          ].map((it,i) => (
            <div key={i} style={{ textAlign:'center', padding:'18px 12px',
              borderRadius:10, background:it.soft }}>
              <div style={{ fontSize:34, fontWeight:800, color:it.color }}>{it.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:T.inkSoft, marginTop:4 }}>{it.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
